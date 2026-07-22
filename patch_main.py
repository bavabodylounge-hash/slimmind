#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_main.py — 슬림마인드 12주 로드맵 완전 개인화 패치
  1. computeNutrition() weekVariants 12주 확장
  2. getRoadmapWeeks() 5~12주 프로그래매틱 생성 로직 삽입
  3. FREE_UNTIL = 4 → 12 변경 (hospital + v4 동시)
  4. localStorage 저장 블록 전체 필드 확장 (hospital + v4 동시)
hospital / v4 백엔드 공통 원칙 유지
"""
import re, sys, shutil
from pathlib import Path

HOSPITAL = Path('public/result-hospital.html')
V4       = Path('public/result-v4.html')

# ──────────────────────────────────────────────────────────────────────────
# 헬퍼
# ──────────────────────────────────────────────────────────────────────────
def read(p):
    return p.read_text(encoding='utf-8')

def write(p, txt):
    p.write_text(txt, encoding='utf-8')

def replace_once(src, old, new, label):
    if old not in src:
        print(f'  ✗ [{label}] 패턴 미발견 — 건너뜀')
        return src
    cnt = src.count(old)
    if cnt > 1:
        print(f'  ⚠ [{label}] 패턴 {cnt}회 발견 — replace_all 적용')
        return src.replace(old, new)
    print(f'  ✓ [{label}] 패치 완료')
    return src.replace(old, new, 1)

def replace_all(src, old, new, label):
    cnt = src.count(old)
    if cnt == 0:
        print(f'  ✗ [{label}] 패턴 미발견 — 건너뜀')
        return src
    print(f'  ✓ [{label}] {cnt}곳 패치 완료')
    return src.replace(old, new)

# ──────────────────────────────────────────────────────────────────────────
# PATCH 1: computeNutrition() weekVariants 4주 → 12주 확장
# ──────────────────────────────────────────────────────────────────────────
NUTRITION_OLD = """    weekVariants: [
      _week(1, w1mul,  w1cPct, w1pPct, '1주: 저탄 진입 — 탄수화물 비율 낮추고 단백질 보충'),
      _week(2, 1.0,    carbPct, proteinPct, '2주: BC 기준 칼로리 유지, 균형 식단 안정화'),
      _week(3, 1.0,    w3cPct, w3pPct, '3주: 항염 식단 강화 — 단백질 소폭 상향'),
      _week(4, 1.0,    w4cPct, w4pPct, '4주: 탄수화물 사이클링 OFF일 — 탄 -10%p, 단·지 보충'),
    ],"""

NUTRITION_NEW = """    weekVariants: (function(){
      // ── 회복기(1~2w) / 전환기(3~4w) ──
      var wv = [
        _week(1, w1mul,  w1cPct, w1pPct, '1주: 저탄 진입 — 탄수화물 비율 낮추고 단백질 보충'),
        _week(2, 1.0,    carbPct, proteinPct, '2주: BC 기준 칼로리 유지, 균형 식단 안정화'),
        _week(3, 1.0,    w3cPct, w3pPct, '3주: 항염 식단 강화 — 단백질 소폭 상향'),
        _week(4, 1.0,    w4cPct, w4pPct, '4주: 탄수화물 사이클링 — 탄 -10%p, 단·지 보충'),
      ];
      // ── 가속기(5~9w): 주차별 결손 점진 증가, 탄수 추가 감소 ──
      // 주차 5: kcal×0.95, 탄-5%p 추가  주차 9: kcal×0.88, 탄 최소치
      var accelSteps = [
        { wk:5, mul:0.95, cOff:-5,  pOff:+2, note:'5주(가속기 시작): 결손 확대 — 탄 -5%p, 단백질 +2%p' },
        { wk:6, mul:0.93, cOff:-6,  pOff:+3, note:'6주: 지방 연소 본격화 — 탄수 추가 제한' },
        { wk:7, mul:0.91, cOff:-7,  pOff:+3, note:'7주: 고원기 돌파 — 단백질 최고조, 탄수 최저' },
        { wk:8, mul:0.90, cOff:-7,  pOff:+3, note:'8주: 고원기 지속 — 주 1회 리피드 도입 (탄+30%)' },
        { wk:9, mul:0.89, cOff:-8,  pOff:+3, note:'9주: 가속기 마무리 — 결손 최대, 안정기 준비' },
      ];
      accelSteps.forEach(function(s){
        var cP = Math.max(23, w4cPct + s.cOff);
        var pP = Math.min(45, proteinPct + s.pOff);
        // YOYO: 가속기 결손 축소 (대사 적응 방지)
        var mul = rfl.indexOf('YOYO') >= 0 ? Math.min(1.0, s.mul + 0.04) : s.mul;
        wv.push(_week(s.wk, mul, cP, pP, s.note));
      });
      // ── 안정기(10~12w): 목표체중 TDEE 수렴, 탄수 점진 회복 ──
      // targetKcal → tdee로 점진 수렴 (유지 칼로리 적응)
      var maintainKcal = Math.round(10*gw + 6.25*h - 5*ag - 161) * 1.44; // 목표체중 기준 TDEE
      var stableSteps = [
        { wk:10, mul:null, kcalFixed:Math.round(targetKcal*0.93 + maintainKcal*0.07), cOff:-4, pOff:+2, note:'10주(안정기): 유지 칼로리 접근 — 탄수 소폭 회복' },
        { wk:11, mul:null, kcalFixed:Math.round(targetKcal*0.7  + maintainKcal*0.3),  cOff:-2, pOff:+1, note:'11주: 유지 식단 전환 — 리피드 주 2회' },
        { wk:12, mul:null, kcalFixed:Math.round(maintainKcal),                         cOff:0,  pOff:0,  note:'12주(안정기 완료): 목표체중 유지 칼로리 달성' },
      ];
      stableSteps.forEach(function(s){
        var fPct = 100 - Math.max(28, carbPct+s.cOff) - Math.min(42, proteinPct+s.pOff);
        var cP = Math.max(28, carbPct + s.cOff);
        var pP = Math.min(42, proteinPct + s.pOff);
        var wKcal = Math.max(MIN_KCAL, s.kcalFixed);
        wv.push({
          week:     s.wk,
          kcal:     wKcal,
          carbG:    Math.round(wKcal * (cP/100) / 4),
          proteinG: Math.round(wKcal * (pP/100) / 4),
          fatG:     Math.round(wKcal * ((100-cP-pP)/100) / 9),
          note:     s.note,
        });
      });
      return wv;
    })(),"""

# ──────────────────────────────────────────────────────────────────────────
# PATCH 2: getRoadmapWeeks() 5~12주 프로그래매틱 생성 로직
# result 반환 전에 삽입
# ──────────────────────────────────────────────────────────────────────────
ROADMAP_OLD = """  return result;
}

// ──────────────────────────────────────────────
// 10-D. ROADMAP_WEEKS — 하위호환 기본값 (BC-6 제네릭)"""

ROADMAP_NEW = """  // ══════════════════════════════════════════════════════════════════
  // ★ 5~12주 프로그래매틱 처방 생성
  // baseWeeks(1~4주)를 기반으로 가속기(5~9w)/안정기(10~12w) 공식 확장
  // ══════════════════════════════════════════════════════════════════
  var _bc = bcKey || 'BC-6';
  // BC 계열 분류 (운동/처방 공식 분기용)
  var _bcIsCirc  = /^BC-(1|2|10)$/.test(_bc);   // 순환·림프계
  var _bcIsMus   = /^BC-(4|7|8|11)$/.test(_bc);  // 근육·체형계
  var _bcIsHorm  = /^BC-(3|5|6|9|12|13|14|15|16)$/.test(_bc); // 호르몬·대사계
  // 오행 → 운동 스타일 & 식이 키워드
  var _ohaengKey = ohaeng || '';
  var _ohExMap = {
    '목': '필라테스·스트레칭 60분 (간기 이완)', '화': '유산소 심박 강화 50분 (심화)',
    '토': '코어·밸런스 운동 50분 (비위 강화)', '금': '호흡 + 저항밴드 45분 (폐기 순환)',
    '수': '수영·아쿠아 50분 (신기 보강)'
  };
  var _ohDietMap = {
    '목': '새콤한 발효식품·사과식초 (간기 소통)',
    '화': '쓴맛 녹황색채소·셀러리 (심화 냉각)',
    '토': '단맛 고구마·단호박 (비위 보충)',
    '금': '매운맛 생강·고추 소량 (폐기 순환)',
    '수': '짠맛 해조류·검은콩 (신기 보강)'
  };
  var _ohEx   = _ohExMap[_ohaengKey] || '유산소+저항 복합 50분';
  var _ohDiet = _ohDietMap[_ohaengKey] || '균형 영양 식단';
  // 목표감량 주차별 배분
  var _totalLossKg = Math.max(0, (effectiveCurWeight || 65) - effectiveGoalWeight);
  var _wkLoss = (_totalLossKg / 12).toFixed(2); // 주차당 평균 감량(kg)
  // axisScores 활용 — 가속기/안정기 처방 강화
  var _highStress   = _a05 >= 7;
  var _poorSleep    = _a06 >= 7;
  var _highInsulin  = _a01 >= 7;
  var _highHormone  = _a10 >= 7;
  var _lowMuscle    = _a04 >= 7;

  // ── 가속기 단계 처방 공식 (5~9주) ──
  var _accelPhases = [
    { w:5,  phase:'가속기 진입',   icon:'🚀',
      wtgt:'주간 목표: 체지방 ' + _wkLoss + 'kg × 가속 — 총 ' + ((_wkLoss*4).toFixed(1)) + 'kg 달성 시점',
      exOk: (_bcIsCirc  ? '수영 50분+드라이 브러싱 5분 (림프 가속)' :
             _bcIsMus   ? '하체 분할 저항운동 50분 + 식후 15분 워킹' :
                          '복합 유산소 40분 + 코어 10분'),
      exBan: _rfl.indexOf('STEROID')>=0 ? '고강도 바벨 운동 금지 (스테로이드 복용 중)' :
             _highStress ? 'HIIT·고강도 인터벌 금지 (코르티솔↑)' : '공복 고강도 운동 금지',
      exDet: ('월·수·금 — ' + (_bcIsCirc ? '수영 50분' : _bcIsMus ? '하체 분할 50분' : '복합 유산소 40분+코어 10분') +
              ' / 화·목·토 — ' + _ohEx + ' / 매일 — 식후 워킹 15분' +
              (_highStress ? ' / 취침 전 4·7·8 호흡 10분' : '') +
              (_poorSleep  ? ' / 22시 이전 취침 고정' : '')),
      dietOk: '탄수화물 사이클링 본격 적용 — 저탄 4일 + 탄수 보충 3일 / ' + _ohDiet +
              (_highInsulin ? ' / 저GI 식품 우선 + 식후 15분 워킹 의무' : '') +
              (_rfl.indexOf('YOYO')>=0 ? ' / 주 1회 리피드(탄+30%) — 렙틴 유지' : ''),
      dietBan: _rfl.indexOf('FATTY_LIVER')>=0 ? '액상과당·가공 주스 완전 차단' :
               _highInsulin ? '정제당·흰밀가루 완전 차단' : '극단 단식·원푸드 다이어트',
      recOk: '근막 이완 폼롤러 15분 + 수면 7시간 고정' +
             (_highStress ? ' · 마그네슘(글리시네이트) 취침 전 검토' : '') +
             (_poorSleep  ? ' · 스마트폰 취침 90분 전 차단' : ''),
      center: (_bcIsCirc ? '순환 센터 + 운동 센터' : _bcIsMus ? '체형 센터 + 운동 센터' : '식단 센터 + 운동 센터'),
      kFocus: [(_bcIsCirc?'심부 순환 강화':_bcIsMus?'근비대 점진 과부하':'지방 연소 가속'),
               (_highInsulin?'인슐린 저항 관리':'탄수화물 사이클링'),
               (_highStress?'코르티솔 억제':_poorSleep?'수면 최적화':'회복 프로토콜')],
      sci: '가속기 진입 5주차: 기초대사 적응을 막기 위해 탄수화물 사이클링을 시작합니다. 저탄 4일+고탄 3일 패턴은 렙틴 분비를 유지하면서 지방산화를 극대화합니다.',
    },
    { w:6,  phase:'가속기 심화',   icon:'⚡',
      wtgt:'주간 목표: 누적 ' + ((_wkLoss*5).toFixed(1)) + 'kg 돌파 — 고원기 방지',
      exOk: (_bcIsCirc  ? '수영 60분+림프 드레나쥐 마사지 15분' :
             _bcIsMus   ? '전신 복합 저항운동 55분 + 인터벌 10분' :
                          '중강도 인터벌 30분 + 전신 저항 20분'),
      exBan: _rfl.indexOf('HTN')>=0 ? '최대심박 75% 초과 운동 금지 (고혈압)' :
             '단기 극단 다이어트 + 고강도 운동 조합 금지',
      exDet: ('월·수·금 — ' + (_bcIsCirc ? '수영 60분+마사지 15분' : _bcIsMus ? '전신 복합 55분+인터벌 10분' : '인터벌 30분+저항 20분') +
              ' / 화·목·토 — ' + _ohEx + ' / 일 — 전신 가벼운 스트레칭 30분'),
      dietOk: 'IIFYM(목표 탄단지 맞추기) 도입 — 영양소 타이밍 최적화 / ' + _ohDiet +
              (_rfl.indexOf('PCOS')>=0 ? ' / 이노시톨 함유 식품(감귤·현미) 강화' : '') +
              (_highHormone ? ' / 식물성 에스트로겐(두부·아마씨) 유지' : ''),
      dietBan: '간헐적 단식 중 공복 운동 금지 (코르티솔 충돌)',
      recOk: '냉온 교차 샤워 5분 (혈관 탄력) + 수면 일정 유지' +
             (_bcIsHorm ? ' · 호르몬 균형: 취침 전 이완 루틴 10분' : ''),
      center: (_bcIsCirc ? '순환 센터 + 한방 센터' : _bcIsMus ? '운동 센터 + 체형 센터' : '호르몬 센터 + 식단 센터'),
      kFocus: ['고원기 돌파 전략', 'IIFYM 탄단지 타이밍',
               (_bcIsCirc?'림프 가속':_bcIsMus?'근육 초과 회복':_highHormone?'호르몬 균형':'NEAT 증가')],
      sci: '6주차는 체중 감량의 고원기(Plateau)가 자주 발생하는 시점입니다. IIFYM 방식으로 영양소 타이밍을 정밀 제어하면 대사 적응을 최소화할 수 있습니다.',
    },
    { w:7,  phase:'가속기 절정',   icon:'💪',
      wtgt:'주간 목표: 누적 ' + ((_wkLoss*6).toFixed(1)) + 'kg — 체지방률 최저점 도전',
      exOk: (_bcIsCirc  ? '아쿠아 에어로빅 50분+골반 드레나쥐 10분' :
             _bcIsMus   ? 'BIG 3(스쿼트·데드리프트·벤치) 각 4세트 + 유산소 20분' :
                          '서킷 트레이닝 45분 (전신 6동작 × 3라운드)'),
      exBan: _lowMuscle ? '고강도 편측 운동 — 근손실 주의' : '하루 2번 운동 (회복 부족)',
      exDet: ('월·목 — ' + (_bcIsMus ? 'BIG 3 복합 운동 60분' : '고강도 유산소 50분') +
              ' / 화·금 — ' + _ohEx + ' / 수·토 — 회복 스트레칭 + 폼롤러 20분 / 일 — 완전 휴식'),
      dietOk: '단백질 스파이크(운동 직후 30g) 도입 + 복합탄수화물 타이밍 / ' + _ohDiet +
              (_rfl.indexOf('STEROID')>=0 ? ' / 단백질 2.0g/kg — 근육 보호 최우선' : ''),
      dietBan: '운동 전 고지방 식사 (소화 지연) + 탄수 완전 제거(근분해 촉진)',
      recOk: '근막 이완 + 얼음팩 20분(고강도 부위) + 수면 8시간 목표',
      center: (_bcIsCirc ? '순환 센터 + 회복 센터' : _bcIsMus ? '운동 센터 + 관리 센터' : '운동 센터 + 호르몬 센터'),
      kFocus: ['체지방률 최저점 도달', '운동 직후 단백질 타이밍',
               (_lowMuscle?'근감소 방지 저항운동':'초과 회복 수면 8h')],
      sci: '7주차는 체지방률이 가장 낮아지는 시점입니다. 복합 운동 + 단백질 타이밍 조합으로 무지방 체중 손실을 최소화하면서 지방만 제거합니다.',
    },
    { w:8,  phase:'가속기 유지',   icon:'🎯',
      wtgt:'주간 목표: 체중 감량 속도 조절 — 주 1회 리피드로 렙틴 유지',
      exOk: (_bcIsCirc  ? '수영+드레나쥐 조합 60분 (순환 극대화)' :
             _bcIsMus   ? '근지구력 회로 운동 50분 (15~20rep 고반복)' :
                          '유산소 45분 + 코어 강화 15분'),
      exBan: '주 6일 이상 고강도 — 부신 피로 유발',
      exDet: ('월·수·금 — 주 운동 60분 / 화·목 — ' + _ohEx + ' / 토 — 리피드 + 중강도 운동 45분 / 일 — 완전 휴식'),
      dietOk: '리피드(Refeed)일 도입 — 토요일 탄수+30%, 칼로리 정상화 / ' + _ohDiet,
      dietBan: '리피드일 액상 과당·정제당 대신 통곡물·고구마 이용',
      recOk: '리피드 직후 수면 의무화 (GH 분비 극대화) + 온욕 15분',
      center: (_bcIsCirc ? '한방 센터 + 순환 센터' : _bcIsMus ? '운동 센터 + 식단 센터' : '식단 센터 + 관리 센터'),
      kFocus: ['리피드 주 1회 (렙틴 회복)', '근지구력 고반복 전환', '부신 피로 방지'],
      sci: '8주차 리피드(탄수화물 재부하)는 렙틴 수치를 일시적으로 올려 대사율 저하를 방지합니다. 통곡물로 인슐린 반응을 완만하게 유지하는 것이 핵심입니다.',
    },
    { w:9,  phase:'가속기 완성',   icon:'🏁',
      wtgt:'주간 목표: 가속기 총 감량 ' + ((_wkLoss*5).toFixed(1)) + 'kg 확인 — 안정기 전환 준비',
      exOk: (_bcIsCirc  ? '전신 림프 순환 운동 50분 + 냉온 교차 샤워' :
             _bcIsMus   ? 'BIG 3 강도 소폭 하강(70% 1RM) + 유산소 20분' :
                          '중강도 유산소 40분 + 이완 요가 20분'),
      exBan: '가속기 종료 전 갑작스러운 운동량 급감 (요요 트리거)',
      exDet: ('월·수·금 — 주 운동 50분 (강도 10% 감소) / 화·목 — ' + _ohEx + ' + 스트레칭 / 토 — 리피드 + 가벼운 운동 30분 / 일 — 완전 휴식'),
      dietOk: '안정기 전환 식단 준비 — 탄수화물 점진 정상화(+5%p) / ' + _ohDiet +
              ' / 프리바이오틱스(양파·마늘·바나나) 강화',
      dietBan: '가속기 종료 후 폭식 (반동 요요)',
      recOk: '9주차 결산 스트레칭 세션 30분 + 수분 2.5L 마무리',
      center: (_bcIsCirc ? '순환 센터 + 회복 센터' : _bcIsMus ? '체형 센터 + 관리 센터' : '식단 센터 + 심리 센터'),
      kFocus: ['가속기 결산 체성분 측정', '탄수화물 점진 정상화', '안정기 전환 준비'],
      sci: '9주차는 가속기-안정기 전환의 핵심입니다. 식이섬유(프리바이오틱스)를 강화해 장내 미생물 환경을 정비하면 안정기 유지가 훨씬 용이합니다.',
    },
  ];

  // ── 안정기 단계 처방 공식 (10~12주) ──
  var _stablePhases = [
    { w:10, phase:'안정기 진입', icon:'🌿',
      wtgt:'주간 목표: 목표체중 ±0.5kg 이내 유지 — 유지 칼로리 적응',
      exOk: (_bcIsCirc  ? '수영·아쿠아 유산소 50분 + 유지 스트레칭' :
             _bcIsMus   ? '근지구력 유지 운동 50분 (주 3회)' :
                          '유산소 + 코어 유지 루틴 45분'),
      exBan: '극단 유산소 재개 금지 (유지기 근손실 주의)',
      exDet: ('월·수·금 — 유지 운동 50분 / 화·목 — ' + _ohEx + ' / 토·일 — 가벼운 산책 + 스트레칭'),
      dietOk: '유지 식단 전환 — 목표체중 TDEE 칼로리 + 직관적 식사 도입 / ' + _ohDiet,
      dietBan: '리바운드 심리적 폭식 경계 — 1끼 과식 후 다음 끼니 보상 절식 금지',
      recOk: '수면 7~8시간 유지 + 스트레스 관리 루틴 강화' +
             (_highStress ? ' · 마음챙김 명상 10분/일 의무화' : ''),
      center: (_bcIsCirc ? '순환 센터 + 회복 센터' : _bcIsMus ? '체형 센터 + 운동 센터' : '관리 센터 + 심리 센터'),
      kFocus: ['유지 칼로리 적응 (체중 안정)', '직관적 식사 도입', '수면·스트레스 루틴 완성'],
      sci: '10주차부터는 목표체중 유지가 목표입니다. 유지 TDEE를 기준으로 ±200kcal 이내에서 자유롭게 먹는 직관적 식사를 도입해 장기 유지율을 높입니다.',
    },
    { w:11, phase:'안정기 강화', icon:'🌸',
      wtgt:'주간 목표: 체중 완전 유지 + 체성분 최적화 (근육 비율 ↑)',
      exOk: (_bcIsCirc  ? '필라테스 + 수영 주 3회 — 체형 유지 집중' :
             _bcIsMus   ? '점진적 저항 유지 운동 — 1RM 80% 이상 유지' :
                          '기능성 운동(TRX·밸런스) + 유산소 40분'),
      exBan: '급격한 운동량 증가 금지 (부상 위험 상승)',
      exDet: ('월·수·금 — 주 운동 50분 / 화·목 — ' + _ohEx + ' (오행 기질 강화) / 토·일 — 야외 활동 + 스트레칭'),
      dietOk: '유지 식단 고도화 — 주 2회 리피드 + 식이섬유 30g/일 목표 / ' + _ohDiet +
              ' / 프로바이오틱스(발효식품) 매일',
      dietBan: '야식·알코올·가공식품 재도입 금지 (유지 교란)',
      recOk: '목욕 + 온열 요법 + 전신 스트레칭 세션 30분 (주 2회)',
      center: (_bcIsCirc ? '회복 센터 + 한방 센터' : _bcIsMus ? '운동 센터 + 관리 센터' : '관리 센터 + 한방 센터'),
      kFocus: ['체성분 최적화 (근육↑)', '주 2회 리피드 유지', '오행 기질 생활화'],
      sci: '11주차는 근육 비율을 높여 기초대사율을 올리는 단계입니다. 저항운동 유지 + 단백질 1.4g/kg으로 무지방체중을 최대화합니다.',
    },
    { w:12, phase:'안정기 완성', icon:'🎉',
      wtgt:'12주 최종 목표: ' + (effectiveGoalWeight||'목표체중') + 'kg 달성·유지 확인 + 다음 시즌 설계',
      exOk: '12주 완주 기념 전신 측정 + 유지 루틴 확정 (자신에게 맞는 주 3~4회 운동)',
      exBan: '극단적 변화 없이 — 지금까지의 루틴을 유지',
      exDet: '월·수·금 — 12주 완성 기념 메인 운동 / 화·목·토 — ' + _ohEx + ' + 가벼운 산책 / 일 — 완전 휴식·명상 / 전문 센터 6개월 체크인 예약',
      dietOk: '12주 식단 결산 — 본인만의 유지 식단 패턴 확정 / ' + _ohDiet +
              ' / 다음 12주 목표 설정 (체중 유지 또는 체형 개선)',
      dietBan: '완주 기념 폭식 1주일 금지 (대사 교란)',
      recOk: '12주 완주 리추얼 — 충분한 수면·스트레칭 + 컨설턴트 결산 미팅 신청',
      center: '관리 센터 + ' + (_bcIsCirc?'순환 센터':_bcIsMus?'체형 센터':'식단 센터') + ' (6개월 유지 관리)',
      kFocus: ['12주 완주 체성분 결산', '유지 루틴 생활화', '다음 시즌 목표 설계'],
      sci: '12주 완성. 기초대사율이 정착되고 몸이 새 체중을 "정상"으로 인식하는 데 평균 21일이 필요합니다. 유지 루틴을 최소 3주 지속하면 요요 없는 장기 유지가 가능합니다.',
    },
  ];

  // ── 5~12주 처방 result 배열에 추가 ──
  _accelPhases.concat(_stablePhases).forEach(function(s){
    var phaseObj = ROADMAP_PHASES.filter(function(p){ return p.weeks.indexOf(s.w) !== -1; })[0] || {};
    var wItem = {
      week:        s.w,
      weekLabel:   s.w + '주차',
      phase:       s.phase,
      phaseColor:  phaseObj.sc || 'var(--vis)',
      icon:        s.icon,
      title:       s.phase + ' — ' + (s.wtgt.split('—')[1] || '').trim(),
      center:      s.center,
      centerIcons: ['📍','📍'],
      weekly_target: s.wtgt,
      failure_expose: s.w <= 9
        ? (name + '님, ' + s.w + '주차입니다. ' + (s.sci || ''))
        : (name + '님, ' + s.w + '주차 — 거의 다 왔습니다. ' + (s.sci || '')),
      axis_logic:   '이번 주 우선 센터: [' + s.center + ']',
      keyFocus:    s.kFocus || [],
      exercise_ban: s.exBan,
      exercise_ok:  s.exOk + (_rfExerciseMod ? '\n' + _rfExerciseMod : ''),
      exercise_detail: s.exDet,
      diet_ban:     s.dietBan,
      diet_ok:      s.dietOk + (_rfDietMod ? '\n' + _rfDietMod : ''),
      meal_plan:    s.dietOk,
      recovery_ban: '',
      recovery_ok:  s.recOk + (_rfRecoveryMod ? '\n' + _rfRecoveryMod : ''),
      science_note: s.sci,
      // 오행 오버레이 적용
      ohaeng_caution: ohaengOv ? (ohaengOv.tone_caution || '') : '',
      diet_macro_note: ohaengOv ? (ohaengOv.diet_macro_note || '') : '',
    };
    // redFlag 주차별 메모 (5주차 이후는 개별 주차 없이 전체 메모 적용)
    var _wkNote = Object.values(_rfWeekNotes).join(' ').trim();
    if (_wkNote) {
      wItem.redFlag_note = _wkNote;
    }
    // nutritionData weekVariants에서 해당 주차 찾기
    if (nutritionData) {
      var v = nutritionData.weekVariants.filter(function(x){ return x.week === s.w; })[0]
           || nutritionData.weekVariants[nutritionData.weekVariants.length - 1];
      wItem.nutrition = {
        kcal:      v.kcal,
        carbG:     v.carbG,
        proteinG:  v.proteinG,
        fatG:      v.fatG,
        note:      v.note,
        macro_note: ohaengOv ? ohaengOv.diet_macro_note : null,
        redFlag_macro: _rfl.length > 0 ? nutritionData._usedSpec : null,
        isDefaultGoal: nutritionData._isDefaultGoal || false,
        defaultGoalWeight: effectiveGoalWeight,
      };
    }
    result.push(wItem);
  });

  return result;
}

// ──────────────────────────────────────────────
// 10-D. ROADMAP_WEEKS — 하위호환 기본값 (BC-6 제네릭)"""

# ──────────────────────────────────────────────────────────────────────────
# PATCH 3: FREE_UNTIL = 4 → FREE_UNTIL = 12 (모든 위치)
# ──────────────────────────────────────────────────────────────────────────
FREE_OLD = "var FREE_UNTIL = 4; // 1차 플랜 = 4주까지 공개, 5주부터 잠김"
FREE_NEW = "var FREE_UNTIL = 12; // 12주 전체 공개 (2025 업데이트)"

FREE_OLD2 = "var FREE_UNTIL = 4;"  # 두 번째 위치 (line 17700 근처)

# ──────────────────────────────────────────────────────────────────────────
# PATCH 4: localStorage 저장 블록 전체 필드 확장
# ──────────────────────────────────────────────────────────────────────────
LOCALSTORAGE_OLD = """    var _slim = ACTIVE_WEEKS.map(function(w){
      return { week:w.week, phase:w.phase,
               exercise_ok:w.exercise_ok, exercise_detail:w.exercise_detail,
               diet_ok:w.diet_ok, recovery_ok:w.recovery_ok };
    });
    localStorage.setItem('slimmind_weeks_' + _sid, JSON.stringify(_slim));"""

LOCALSTORAGE_NEW = """    // ★ 전체 필드 + 개인화 메타 저장 (slimmind-today.html이 읽는 데이터)
    var _slim = ACTIVE_WEEKS.map(function(w){
      return {
        week:           w.week,
        phase:          w.phase,
        icon:           w.icon || '',
        title:          w.title || '',
        weekly_target:  w.weekly_target || '',
        center:         w.center || '',
        keyFocus:       w.keyFocus || [],
        exercise_ok:    w.exercise_ok    || '',
        exercise_ban:   w.exercise_ban   || '',
        exercise_detail:w.exercise_detail|| '',
        diet_ok:        w.diet_ok        || '',
        diet_ban:       w.diet_ban       || '',
        meal_plan:      w.meal_plan      || '',
        recovery_ok:    w.recovery_ok    || '',
        recovery_ban:   w.recovery_ban   || '',
        ohaeng_caution: w.ohaeng_caution || '',
        diet_macro_note:w.diet_macro_note|| '',
        redFlag_note:   w.redFlag_note   || '',
        science_note:   w.science_note   || '',
        nutrition:      w.nutrition      || null,
      };
    });
    // 개인화 메타 별도 저장 (slimmind-today.html에서 직접 읽음)
    try {
      var _meta = {
        bcCode:    bcCode_p6 || inputData.bc_code || '',
        ohaengKey: ohaengType|| inputData.ohaeng_type || '',
        redFlags:  Array.isArray(redFlags_p6) ? redFlags_p6 : [],
        userName:  userName  || '',
        goalWeight: inputData.goal_weight || null,
        axisScores: inputData.axisScores  || inputData.axis_scores || {},
        savedAt:   Date.now(),
      };
      localStorage.setItem('slimmind_meta_' + _sid, JSON.stringify(_meta));
    } catch(e2){}
    localStorage.setItem('slimmind_weeks_' + _sid, JSON.stringify(_slim));"""

# ──────────────────────────────────────────────────────────────────────────
# 패치 실행
# ──────────────────────────────────────────────────────────────────────────
def patch_file(p):
    name = p.name
    print(f'\n{"="*60}')
    print(f'  패치 대상: {name}')
    print(f'{"="*60}')

    # 백업
    bak = p.with_suffix('.html.bak_12w')
    if not bak.exists():
        shutil.copy2(p, bak)
        print(f'  ✓ 백업: {bak.name}')

    src = read(p)

    # 1. computeNutrition weekVariants 확장
    src = replace_once(src, NUTRITION_OLD, NUTRITION_NEW, 'computeNutrition 12주 weekVariants 확장')

    # 2. getRoadmapWeeks 5~12주 삽입
    src = replace_once(src, ROADMAP_OLD, ROADMAP_NEW, 'getRoadmapWeeks 5~12주 프로그래매틱 생성')

    # 3. FREE_UNTIL 4 → 12
    src = replace_all(src, FREE_OLD, FREE_NEW, 'FREE_UNTIL=4 → 12')
    # 두 번째 패턴 (값만 있는 줄)
    src = replace_all(src, "  var FREE_UNTIL = 4;\n",
                           "  var FREE_UNTIL = 12;\n", 'FREE_UNTIL=4 (단독) → 12')

    # 4. localStorage 전체 필드 확장
    src = replace_once(src, LOCALSTORAGE_OLD, LOCALSTORAGE_NEW, 'localStorage 전체 필드 확장')

    write(p, src)
    print(f'  ✓ {name} 저장 완료')

patch_file(HOSPITAL)
patch_file(V4)

print('\n' + '='*60)
print('  ✅ 전체 패치 완료')
print('='*60)
