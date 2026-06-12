#!/usr/bin/env python3
"""
survey-data.js에 axis/weight/role 필드 추가 + AXIS_META 상수 + 18개 신규 문항 삽입
"""
import re

# ──────────────────────────────────────────────
# 1. 10축 매핑 (id → axis, weight, role)
# ──────────────────────────────────────────────
AXIS_MAP = {
    # A01 지방저장
    'Q03': ('A01', 2.5, 'wow'),
    'Q07': ('A01', 2.5, 'score'),
    'Q11': ('A01', 1.8, 'score'),
    'Q75': ('A01', 1.5, 'score'),
    'Q10': ('A01', 1.5, 'score'),
    'Q12': ('A01', 1.3, 'score'),
    'Q78': ('A01', 1.5, 'score'),
    'Q05': ('A01', 1.8, 'score'),

    # A02 순환붓기
    'Q08': ('A02', 1.8, 'score'),
    'Q09': ('A02', 1.8, 'score'),
    'Q62': ('A02', 1.5, 'score'),
    'Q60': ('A02', 1.3, 'score'),
    'Q33': ('A02', 1.3, 'score'),
    'Q31': ('A02', 1.5, 'score'),

    # A03 호르몬대사
    'Q45': ('A03', 1.8, 'score'),

    # A04 근육활동
    'Q23': ('A04', 1.8, 'score'),
    'Q35': ('A04', 1.5, 'score'),
    'Q69': ('A04', 1.3, 'score'),
    'Q73': ('A04', 1.3, 'score'),

    # A05 소화흡수염증
    'Q29': ('A05', 1.5, 'score'),
    'Q77': ('A05', 1.3, 'score'),
    'Q30': ('A05', 1.3, 'score'),

    # A06 체형정렬
    'Q34': ('A06', 2.0, 'wow'),
    'Q59': ('A06', 1.5, 'score'),
    'Q58': ('A06', 1.5, 'score'),
    'Q61': ('A06', 1.3, 'score'),
    'Q63': ('A06', 1.3, 'score'),
    'Q64': ('A06', 1.2, 'score'),
    'Q65': ('A06', 1.2, 'score'),
    'Q72': ('A06', 1.3, 'score'),

    # A07 스트레스회복
    'Q21': ('A07', 1.8, 'score'),
    'Q19': ('A07', 1.5, 'score'),
    'Q20': ('A07', 1.5, 'score'),
    'Q32': ('A07', 1.3, 'score'),
    'Q76': ('A07', 1.5, 'score'),

    # A08 심리식이행동
    'Q04': ('A08', 1.5, 'score'),
    'Q41': ('A08', 1.5, 'score'),
    'Q48': ('A08', 1.5, 'score'),
    'Q25': ('A08', 1.3, 'score'),
    'Q51': ('A08', 1.3, 'score'),
    'Q54': ('A08', 1.5, 'score'),
    'Q57': ('A08', 1.3, 'score'),
    'Q56': ('A08', 1.5, 'score'),
    'Q66': ('A08', 1.3, 'score'),
    'Q79': ('A08', 1.3, 'score'),
    'Q80': ('A08', 0.8, 'signal'),

    # A09 성인병리스크
    'Q49': ('A09', 1.5, 'score'),

    # A10 기질해석
    'Q26': ('A10', 1.3, 'score'),
    'Q06': ('A10', 1.3, 'score'),
    'Q28': ('A10', 1.3, 'score'),
    'Q38': ('A10', 1.3, 'score'),
    'Q39': ('A10', 1.3, 'score'),
    'Q37': ('A10', 1.3, 'score'),
    'Q53': ('A10', 1.0, 'score'),
    'Q52': ('A10', 1.0, 'score'),
    'Q50': ('A10', 1.0, 'score'),
    'Q42': ('A10', 1.0, 'score'),
    'Q43': ('A10', 1.0, 'score'),
    'Q44': ('A10', 1.0, 'score'),

    # 기존 Q_ 문항들 (이미 파일에 있음)
    'Q_ALLERGY': ('A05', 1.0, 'signal'),
    'Q_SKIN':    ('A03', 1.0, 'signal'),
    'Q_MENOPAUSE': ('A03', 1.5, 'gate'),
    'Q_MEDICAL': ('A09', 1.0, 'gate'),

    # 나머지 분류 안된 문항들 (기본값)
    'Q01': ('A10', 0, 'signal'),
    'Q02': ('A10', 2.0, 'gate'),
    'Q13': ('A01', 1.5, 'score'),
    'Q14': ('A01', 2.0, 'score'),
    'Q14b': ('A01', 1.5, 'score'),
    'Q15': ('A01', 1.5, 'score'),
    'Q16': ('A01', 1.5, 'score'),
    'Q17': ('A07', 1.3, 'score'),
    'Q18': ('A07', 1.3, 'score'),
    'Q24': ('A08', 1.3, 'score'),
    'Q27': ('A10', 1.3, 'score'),
    'Q36': ('A04', 1.3, 'score'),
    'Q40': ('A04', 1.3, 'score'),
    'Q46': ('A09', 1.0, 'score'),
    'Q47': ('A08', 1.3, 'score'),
    'Q55': ('A08', 1.3, 'score'),
    'Q67': ('A06', 1.2, 'score'),
    'Q68': ('A10', 1.0, 'score'),
    'Q70': ('A07', 1.3, 'score'),
    'Q71': ('A06', 1.2, 'score'),
    'Q74': ('A01', 1.3, 'score'),
}

# ──────────────────────────────────────────────
# 2. AXIS_META 상수 블록
# ──────────────────────────────────────────────
AXIS_META_BLOCK = """
// ══════════════════════════════════════════════════════
//  10축 메타데이터 (Plan A 통합 — axis/weight/role 시스템)
// ══════════════════════════════════════════════════════
const AXIS_META = {
  A01: { name: '지방 저장',      icon: '🔥', bg: '#FFE3D3', color: '#E8631A',
         hook: '당신의 몸이 들려주는 이야기를 듣는 시간입니다.' },
  A02: { name: '순환·붓기',      icon: '💧', bg: '#E3F1FB', color: '#1A7FC1',
         hook: '붓기인지 살인지, 여기서 갈립니다.' },
  A03: { name: '호르몬·대사',    icon: '🌸', bg: '#FCE4EE', color: '#C0397A',
         hook: '당신이 진 게 아닙니다. 몸이 다른 명령을 받고 있었을 뿐입니다.' },
  A04: { name: '근육·활동',      icon: '💪', bg: '#E8F3DC', color: '#4A8C1C',
         hook: '같은 음식을 먹어도 결과가 다른 이유는 근육에 있습니다.' },
  A05: { name: '소화·흡수·염증', icon: '🌿', bg: '#DEF3EA', color: '#1A8C5B',
         hook: '당신의 몸은 영양을 흡수하고 있을까요, 버티고 있을까요?' },
  A06: { name: '체형 정렬',      icon: '🦴', bg: '#EEEAF7', color: '#6B4EAA',
         hook: '하루 1시간 운동보다 23시간의 자세가 몸을 만듭니다.' },
  A07: { name: '스트레스·회복',  icon: '🌙', bg: '#E8EAF6', color: '#3F51B5',
         hook: '몸은 스트레스를 기억하고, 식욕으로 반응합니다.' },
  A08: { name: '심리·식이 행동', icon: '🧠', bg: '#EDE7F6', color: '#7B1FA2',
         hook: '다이어트의 70%는 심리전입니다.' },
  A09: { name: '성인병 리스크',  icon: '🩺', bg: '#FCE4E0', color: '#C0392B',
         hook: '당신의 건강 위험도를 더 정확하게 읽기 위한 과정입니다.' },
  A10: { name: '기질·해석',      icon: '🔮', bg: '#FFF0DA', color: '#E67E22',
         hook: '의지가 아니라 성향의 문제일 수 있습니다.' }
};

"""

# ──────────────────────────────────────────────
# 3. 18개 신규 Q_ 문항 정의
# ──────────────────────────────────────────────
NEW_QUESTIONS = """
  // ══════════════════════════════════════════════════════
  //  18개 신규 특수문항 (Plan A 통합 — 10축 근거 시스템)
  // ══════════════════════════════════════════════════════

  // ── A03 호르몬·대사 축 ──────────────────────────────
  {
    id: 'Q_THYROID', section: 'L', num: 85,
    axis: 'A03', weight: 1.5, role: 'score',
    question: '평소 추위를 잘 타거나 손발이 유독 차가운 편인가요?',
    hint: '갑상선 기능과 기초대사량의 직접적인 신호입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🧊', label: '항상 추워요·손발이 항상 차가워요', desc: '여름에도 긴팔 입어요',
        value: 'always_cold', bcEffect: { 'BC-08': 20, 'BC-06': 10 } },
      { emoji: '🌡️', label: '추운 편이에요', desc: '다른 사람보다 예민한 편',
        value: 'cold', bcEffect: { 'BC-08': 12, 'BC-06': 6 } },
      { emoji: '😊', label: '보통이에요', desc: '크게 신경 안 써요',
        value: 'normal', bcEffect: {} },
      { emoji: '🔥', label: '더위를 더 많이 타요', desc: '땀이 잘 나는 편',
        value: 'warm', bcEffect: { 'BC-01': 8 } }
    ],
    saveAs: 'thyroid_signal'
  },
  {
    id: 'Q_INSULIN', section: 'L', num: 86,
    axis: 'A03', weight: 1.5, role: 'signal',
    question: '밥을 먹고 나서 30분~1시간 사이에 갑자기 졸리거나 힘이 빠지는 경험이 있나요?',
    hint: '식후 혈당 급등락 — 인슐린 저항성의 대표 신호입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '😴', label: '거의 매일 있어요', desc: '밥 먹으면 졸음이 쏟아져요',
        value: 'always', bcEffect: { 'BC-02': 20, 'BC-01': 10 } },
      { emoji: '🥱', label: '종종 있어요', desc: '특히 탄수화물 많이 먹을 때',
        value: 'often', bcEffect: { 'BC-02': 12, 'BC-01': 6 } },
      { emoji: '🤔', label: '가끔 있어요', desc: '과식했을 때 정도',
        value: 'sometimes', bcEffect: { 'BC-02': 6 } },
      { emoji: '😊', label: '거의 없어요', desc: '식후에도 괜찮은 편',
        value: 'rarely', bcEffect: {} }
    ],
    saveAs: 'insulin_signal'
  },
  {
    id: 'Q_CYCLE', section: 'L', num: 87,
    axis: 'A03', weight: 1.3, role: 'gate',
    showIf: { field: 'gender', values: ['female', 'mtf', 'nonbinary'] },
    question: '생리주기가 규칙적인가요?',
    hint: '호르몬 균형과 다이어트 효율이 직접 연결됩니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '📅', label: '규칙적이에요 (28~35일)',    desc: '거의 날짜가 일정해요',
        value: 'regular', bcEffect: {} },
      { emoji: '〰️', label: '조금 불규칙해요 (±7일)',   desc: '가끔 앞당겨지거나 늦어져요',
        value: 'slightly_irregular', bcEffect: { 'BC-09': 8, 'BC-08': 5 } },
      { emoji: '⚡', label: '많이 불규칙해요 (±2주 이상)', desc: '주기를 예측하기 어려워요',
        value: 'irregular', bcEffect: { 'BC-09': 18, 'BC-08': 12, 'BC-05': 8 } },
      { emoji: '⏸️', label: '거의 없거나 없어요',       desc: '빈발·무월경 상태',
        value: 'absent', bcEffect: { 'BC-09': 25, 'BC-08': 18, 'BC-05': 12 } },
      { emoji: '🚫', label: '해당 없어요',               desc: '폐경 완료 또는 남성',
        value: 'not_applicable', bcEffect: {} }
    ],
    saveAs: 'cycle_status'
  },
  {
    id: 'Q_META', section: 'L', num: 88,
    axis: 'A03', weight: 1.3, role: 'score',
    question: '최근 6개월 내에 특별한 이유 없이 체중이 늘었나요?',
    hint: '먹은 것과 운동이 같은데 살이 찐다면 대사 문제의 신호입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '📈', label: '네, 3kg 이상 늘었어요',    desc: '아무것도 안 했는데',
        value: 'gained_3plus', bcEffect: { 'BC-08': 20, 'BC-09': 10 } },
      { emoji: '↗️', label: '1~3kg 정도 늘었어요',      desc: '살짝 불어난 느낌',
        value: 'gained_1to3', bcEffect: { 'BC-08': 10, 'BC-09': 5 } },
      { emoji: '➡️', label: '유지되고 있어요',           desc: '크게 변화 없어요',
        value: 'stable', bcEffect: {} },
      { emoji: '📉', label: '오히려 줄었어요',           desc: '자연스럽게 빠졌어요',
        value: 'decreased', bcEffect: {} }
    ],
    saveAs: 'recent_weight_change'
  },

  // ── A04 근육·활동 축 ──────────────────────────────
  {
    id: 'Q_SKINNYFAT', section: 'L', num: 89,
    axis: 'A04', weight: 1.5, role: 'score',
    question: '체중계 숫자는 정상인데 옷이 잘 안 맞거나 체형이 이상한 느낌이 드나요?',
    hint: '마른비만(근감소성 비만) — 체중보다 체성분이 중요한 케이스입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🫣', label: '네, 체중은 괜찮은데 체형이 맘에 안 들어요', desc: '숫자보다 거울이 더 신경 쓰여요',
        value: 'yes', bcEffect: { 'BC-07': 25, 'BC-08': 10 } },
      { emoji: '🤔', label: '조금 그런 편이에요',                        desc: '부분적으로 그런 것 같아요',
        value: 'somewhat', bcEffect: { 'BC-07': 12 } },
      { emoji: '😊', label: '아니요, 체형도 괜찮아요',                   desc: '체중이랑 체형이 비슷해요',
        value: 'no', bcEffect: {} }
    ],
    saveAs: 'skinnyfat_flag'
  },
  {
    id: 'Q_LEGPOWER', section: 'L', num: 90,
    axis: 'A04', weight: 1.3, role: 'score',
    question: '계단을 오르거나 언덕을 걸을 때 다리에 힘이 부족하다고 느끼나요?',
    hint: '하체 근력은 기초대사량과 직결됩니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '😮‍💨', label: '네, 금방 지치고 힘들어요',   desc: '계단 몇 개만 올라도 숨이 차요',
        value: 'weak', bcEffect: { 'BC-07': 15, 'BC-08': 10 } },
      { emoji: '😅', label: '조금 힘들긴 해요',              desc: '남들보다 더 힘든 것 같아요',
        value: 'somewhat_weak', bcEffect: { 'BC-07': 8, 'BC-08': 5 } },
      { emoji: '😊', label: '보통이에요',                    desc: '크게 문제 없어요',
        value: 'normal', bcEffect: {} },
      { emoji: '💪', label: '전혀 힘들지 않아요',            desc: '운동을 즐기는 편이에요',
        value: 'strong', bcEffect: {} }
    ],
    saveAs: 'leg_power'
  },
  {
    id: 'Q_MUSCLE', section: 'L', num: 91,
    axis: 'A04', weight: 1.2, role: 'score',
    question: '근력 운동을 하면 근육이 잘 붙는 편인가요?',
    hint: '근육 합성 반응성은 체형 교정 전략에 영향을 줍니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '⚡', label: '네, 운동하면 금방 몸이 바뀌어요',  desc: '근육이 잘 붙는 편',
        value: 'good', bcEffect: {} },
      { emoji: '🤔', label: '보통이에요',                        desc: '꾸준히 하면 조금씩 변해요',
        value: 'average', bcEffect: {} },
      { emoji: '😔', label: '아무리 해도 잘 안 붙어요',         desc: '운동해도 몸이 안 바뀌는 느낌',
        value: 'poor', bcEffect: { 'BC-08': 15, 'BC-07': 10 } },
      { emoji: '🚫', label: '운동을 거의 안 해서 모르겠어요',   desc: '운동 경험이 거의 없어요',
        value: 'unknown', bcEffect: { 'BC-07': 8 } }
    ],
    saveAs: 'muscle_response'
  },

  // ── A05 소화·흡수·염증 축 ────────────────────────
  {
    id: 'Q_GAS', section: 'L', num: 92,
    axis: 'A05', weight: 1.3, role: 'score',
    question: '식사 후 배에 가스가 많이 차거나 복부 팽만감이 있나요?',
    hint: '장내 환경이 영양 흡수와 체중 조절에 직접 영향을 줍니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🫧', label: '매일 있어요',     desc: '거의 항상 배가 빵빵해요',
        value: 'always', bcEffect: { 'BC-04': 15, 'BC-06': 8 } },
      { emoji: '😮‍💨', label: '자주 있어요',    desc: '식사 후에 특히 심해요',
        value: 'often', bcEffect: { 'BC-04': 10, 'BC-06': 5 } },
      { emoji: '🤔', label: '가끔 있어요',     desc: '특정 음식 먹을 때',
        value: 'sometimes', bcEffect: { 'BC-04': 5 } },
      { emoji: '😊', label: '거의 없어요',     desc: '소화는 잘 되는 편',
        value: 'rarely', bcEffect: {} }
    ],
    saveAs: 'bloating_level'
  },
  {
    id: 'Q_INTOL', section: 'L', num: 93,
    axis: 'A05', weight: 1.3, role: 'signal',
    question: '특정 음식을 먹은 후 복통·설사·가스가 심하게 생긴 적 있나요?',
    hint: '음식 불내증은 장 투과성 문제와 연결됩니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '⚠️', label: '네, 특정 음식이 확실히 있어요', desc: '먹으면 바로 반응이 와요',
        value: 'yes_clear', bcEffect: { 'BC-06': 12, 'BC-04': 10 } },
      { emoji: '🤔', label: '아마도 있는 것 같아요',         desc: '확신은 없지만 의심돼요',
        value: 'maybe', bcEffect: { 'BC-06': 6, 'BC-04': 5 } },
      { emoji: '😊', label: '아니요, 뭐든 잘 먹어요',       desc: '소화 트러블이 거의 없어요',
        value: 'no', bcEffect: {} }
    ],
    saveAs: 'food_intolerance'
  },

  // ── A07 스트레스·회복 축 ─────────────────────────
  {
    id: 'Q_WAKE', section: 'L', num: 94,
    axis: 'A07', weight: 1.3, role: 'score',
    question: '자다가 중간에 깨거나 새벽에 눈이 뜨이는 일이 잦나요?',
    hint: '수면 중 각성은 코르티솔 패턴 이상의 신호입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '😳', label: '거의 매일 깨요',    desc: '새벽 2~4시에 눈이 떠져요',
        value: 'always', bcEffect: { 'BC-09': 15, 'BC-08': 8 } },
      { emoji: '😴', label: '자주 깨요',         desc: '주 3~4회 이상',
        value: 'often', bcEffect: { 'BC-09': 10, 'BC-08': 5 } },
      { emoji: '😐', label: '가끔 깨요',         desc: '스트레스 심할 때',
        value: 'sometimes', bcEffect: { 'BC-09': 5 } },
      { emoji: '😊', label: '잘 안 깨요',        desc: '한번 자면 잘 자는 편',
        value: 'rarely', bcEffect: {} }
    ],
    saveAs: 'sleep_wake'
  },
  {
    id: 'Q_FATIGUE', section: 'L', num: 95,
    axis: 'A07', weight: 1.3, role: 'score',
    question: '충분히 잔 것 같은데도 피로가 만성적으로 남아있나요?',
    hint: '만성피로는 부신 피로와 대사 저하의 신호입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🪫', label: '항상 피곤해요',        desc: '자고 일어나도 개운하지 않아요',
        value: 'always', bcEffect: { 'BC-09': 20, 'BC-08': 10 } },
      { emoji: '😩', label: '자주 피곤해요',        desc: '오후만 되면 기운이 없어요',
        value: 'often', bcEffect: { 'BC-09': 12, 'BC-08': 6 } },
      { emoji: '😐', label: '가끔 피곤해요',        desc: '바쁠 때 특히 심해요',
        value: 'sometimes', bcEffect: { 'BC-09': 6 } },
      { emoji: '😊', label: '에너지가 충분해요',    desc: '피로감이 거의 없어요',
        value: 'energetic', bcEffect: {} }
    ],
    saveAs: 'fatigue_level'
  },

  // ── A09 성인병 리스크 축 ─────────────────────────
  {
    id: 'Q_GLUCOSE', section: 'L', num: 96,
    axis: 'A09', weight: 1.2, role: 'signal',
    question: '공복혈당 수치를 알고 계신가요? 또는 혈당 관련 증상이 있나요?',
    hint: '혈당 신호는 체지방 저장 패턴을 결정합니다.',
    type: 'MULTI_SELECT',
    maxSelect: 5,
    options: [
      { emoji: '🩸', label: '공복혈당 100~125mg (전당뇨)', desc: '관리가 필요한 구간',
        value: 'prediabetes', bcEffect: { 'BC-02': 20, 'BC-01': 12 } },
      { emoji: '🔴', label: '공복혈당 126 이상 (당뇨)',    desc: '진단받았거나 의심 중',
        value: 'diabetes', bcEffect: { 'BC-02': 30, 'BC-01': 20 } },
      { emoji: '🍭', label: '단것 먹으면 금방 배고파요',   desc: '혈당 급등락 패턴',
        value: 'sugar_craving', bcEffect: { 'BC-02': 15, 'BC-01': 8 } },
      { emoji: '💫', label: '식사 거르면 어지럼증·손떨림', desc: '저혈당 반응 의심',
        value: 'hypoglycemia', bcEffect: { 'BC-02': 12 } },
      { emoji: '✅', label: '해당 없어요',                  desc: '혈당은 정상이에요',
        value: 'none', exclusive: true, bcEffect: {} }
    ],
    saveAs: 'glucose_signals'
  },
  {
    id: 'Q_TOXIN', section: 'L', num: 97,
    axis: 'A09', weight: 1.0, role: 'signal',
    question: '다음 중 해당되는 것이 있나요?',
    hint: '독소·위험 습관은 간 해독 능력과 체지방 저장에 영향을 줍니다.',
    type: 'MULTI_SELECT',
    maxSelect: 6,
    options: [
      { emoji: '🍺', label: '음주 주 3회 이상',          desc: '한 번에 2잔 이상',
        value: 'alcohol', bcEffect: { 'BC-01': 15, 'BC-09': 10 } },
      { emoji: '🚬', label: '흡연 중',                   desc: '전자담배 포함',
        value: 'smoking', bcEffect: { 'BC-09': 10, 'BC-06': 8 } },
      { emoji: '😴', label: '수면 5시간 이하 지속',      desc: '만성 수면 부족',
        value: 'sleep_deprivation', bcEffect: { 'BC-09': 15, 'BC-08': 10 } },
      { emoji: '💊', label: '체중 증가 부작용 약물 복용', desc: '스테로이드·항우울제 등',
        value: 'medication', bcEffect: { 'BC-08': 12, 'BC-02': 8 } },
      { emoji: '🏭', label: '화학물질·환경독소 노출',    desc: '직업적 노출 포함',
        value: 'chemical_exposure', bcEffect: { 'BC-09': 10 } },
      { emoji: '✅', label: '해당 없어요',                desc: '',
        value: 'none', exclusive: true, bcEffect: {} }
    ],
    saveAs: 'toxin_factors'
  },
  {
    id: 'Q_SODA', section: 'L', num: 98,
    axis: 'A09', weight: 1.2, role: 'score',
    question: '하루에 가당음료(탄산음료·과일주스·믹스커피·에너지드링크)를 얼마나 마시나요?',
    hint: '가당음료는 액체 칼로리이자 혈당 스파이크의 주범입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🥤', label: '하루 2캔(500ml) 이상', desc: '거의 습관처럼 마셔요',
        value: 'heavy', bcEffect: { 'BC-02': 15, 'BC-09': 10 } },
      { emoji: '🧃', label: '하루 1캔 정도',        desc: '매일 한 번씩은 마셔요',
        value: 'moderate', bcEffect: { 'BC-02': 10, 'BC-09': 5 } },
      { emoji: '🍵', label: '가끔 (주 1~3회)',      desc: '자주는 아니에요',
        value: 'occasional', bcEffect: { 'BC-02': 5 } },
      { emoji: '💧', label: '거의 안 마셔요',       desc: '물이나 무가당 음료만',
        value: 'rarely', bcEffect: {} }
    ],
    saveAs: 'soda_intake'
  }
"""

def add_axis_fields(content):
    """기존 문항에 axis/weight/role 필드 추가"""
    
    lines = content.split('\n')
    result = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        result.append(line)
        
        # id: 'Qxx', section: 패턴 찾기
        m = re.search(r"id: '(Q[^']+)',\s*section:", line)
        if m:
            qid = m.group(1)
            
            # 이미 axis: 필드가 있는지 확인 (다음 몇 줄)
            has_axis = False
            for j in range(i+1, min(i+5, len(lines))):
                if 'axis:' in lines[j]:
                    has_axis = True
                    break
                if lines[j].strip().startswith('id:') and j != i:
                    break
            
            if not has_axis and qid in AXIS_MAP:
                axis, weight, role = AXIS_MAP[qid]
                # 들여쓰기 맞추기
                indent = '    '
                result.append(f"{indent}axis: '{axis}', weight: {weight}, role: '{role}',")
        
        i += 1
    
    return '\n'.join(result)


def insert_axis_meta(content):
    """AXIS_META 상수를 SECTIONS 선언 전에 삽입"""
    # QUESTIONS 배열 선언 앞에 삽입
    marker = 'const QUESTIONS = ['
    if marker in content:
        content = content.replace(marker, AXIS_META_BLOCK + marker)
    return content


def insert_new_questions(content):
    """18개 신규 문항을 Q80 앞에 삽입 (섹션 L의 Q_ALLERGY 이후 Q80 이전)"""
    # Q80 섹션 주석 바로 앞에 삽입
    marker = "  // ══════════════════════════════════════════════════════\n  //  섹션 H · 마무리 드림 질문"
    
    insert_block = NEW_QUESTIONS + "\n"
    
    if marker in content:
        content = content.replace(marker, insert_block + "\n" + marker)
    else:
        # 대안: Q80 id 패턴 앞에 삽입
        marker2 = "    id: 'Q80', section: 'H'"
        if marker2 in content:
            content = content.replace(
                marker2,
                NEW_QUESTIONS + "\n  // ══════════════════════════════════════════════════════\n  //  섹션 H · 마무리 드림 질문\n  // ══════════════════════════════════════════════════════\n  {\n    " + "id: 'Q80', section: 'H'"
            )
    return content


def update_calculate_bc_scores(content):
    """calculateBCScores 함수에 axis별 점수 계산 추가"""
    
    old_return = """  return {
    bcScores, ohaengScores, bcPrimary, bcSecondary, ohaengType,
    // 섹션 L 결과
    allergyExclude,
    skinReaction,
    menopauseStatus,
    isMenopause,
    medicalConditions: hasMedicalConditions ? medicalConditions.filter(v => v !== 'none') : [],
    hasMedicalConditions
  };"""
    
    new_axis_calc = """
  // ── 10축(axis) 점수 계산 ──────────────────────────────────
  const axisScores = {};
  if (typeof AXIS_META !== 'undefined') {
    Object.keys(AXIS_META).forEach(ax => { axisScores[ax] = 0; });
  } else {
    ['A01','A02','A03','A04','A05','A06','A07','A08','A09','A10'].forEach(ax => {
      axisScores[ax] = 0;
    });
  }

  QUESTIONS.forEach(q => {
    if (!q.axis) return;
    const answer = answers[q.id];
    if (!answer) return;
    const qWeight = q.weight || 1.0;

    let qTotal = 0;
    if (q.type === 'SINGLE_SELECT') {
      const opt = q.options?.find(o => o.value === answer);
      if (opt?.bcEffect) {
        qTotal = Object.values(opt.bcEffect).reduce((s, v) => s + v, 0);
      }
    } else if (q.type === 'MULTI_SELECT') {
      (answer || []).forEach(val => {
        const opt = q.options?.find(o => o.value === val);
        if (opt?.bcEffect) {
          qTotal += Object.values(opt.bcEffect).reduce((s, v) => s + v, 0);
        }
      });
    }
    axisScores[q.axis] = (axisScores[q.axis] || 0) + qTotal * qWeight;
  });

  // axis 점수 정규화 (0~100)
  const maxAxis = Math.max(...Object.values(axisScores), 1);
  const axisNorm = {};
  Object.entries(axisScores).forEach(([ax, val]) => {
    axisNorm[ax] = Math.min(100, Math.round((val / maxAxis) * 100));
  });

  // 상위 3개 축 추출
  const topAxes = Object.entries(axisNorm)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ax, score]) => ({ axis: ax, score }));

"""
    
    new_return = new_axis_calc + """  return {
    bcScores, ohaengScores, bcPrimary, bcSecondary, ohaengType,
    // 섹션 L 결과
    allergyExclude,
    skinReaction,
    menopauseStatus,
    isMenopause,
    medicalConditions: hasMedicalConditions ? medicalConditions.filter(v => v !== 'none') : [],
    hasMedicalConditions,
    // 10축 분석 결과
    axisScores: axisNorm,
    topAxes
  };"""
    
    if old_return in content:
        content = content.replace(old_return, new_return)
        print("✅ calculateBCScores 함수에 axis 점수 계산 추가 완료")
    else:
        print("⚠️  calculateBCScores return 패턴을 찾지 못함 — 수동 확인 필요")
    
    return content


def main():
    src = '/home/user/webapp/public/survey-data.js'
    dst = '/home/user/webapp/public/survey-data.js'
    
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"원본 파일 크기: {len(content)} 문자, {content.count(chr(10))+1} 줄")
    
    # 1. axis/weight/role 필드 추가
    content = add_axis_fields(content)
    print("✅ 기존 문항에 axis/weight/role 필드 추가 완료")
    
    # 2. AXIS_META 상수 삽입
    content = insert_axis_meta(content)
    print("✅ AXIS_META 상수 삽입 완료")
    
    # 3. 18개 신규 문항 삽입
    content = insert_new_questions(content)
    print("✅ 18개 신규 Q_ 문항 삽입 완료")
    
    # 4. calculateBCScores에 axis 점수 계산 추가
    content = update_calculate_bc_scores(content)
    
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n최종 파일 크기: {len(content)} 문자, {content.count(chr(10))+1} 줄")
    print("✅ survey-data.js 수정 완료!")


if __name__ == '__main__':
    main()
