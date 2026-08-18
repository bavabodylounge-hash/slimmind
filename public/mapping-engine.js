/**
 * ═══════════════════════════════════════════════════════════════════════════
 * mapping-engine.js — SlimMind Core Mapping Engine v1.0
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * [역할]
 *   설문 원시 응답(raw_answers) → 결과지 입력 구조(P1~P10 파라미터)로 변환하는
 *   공통 파이프라인 모듈. hospital / aesthetic / fitness 모든 버전에서 동일하게
 *   사용되는 코어 연산 엔진.
 *
 * [파이프라인 구조]
 *   INPUT  : raw_answers { stage1, stage2, stage3, stage4, disp, pfProfile, desire, ... }
 *   PROCESS: 축 점수 연산(axisScores) → redFlags 감지 → bcCode 결정 → 개인화 메타 추출
 *   OUTPUT : MappingResult { axisScores, redFlags, bcAnswers, desire, mappingVersion }
 *
 * [버전 관리]
 *   window.__MAPPING_ENGINE_VERSION__ 에 현재 버전 태그를 세팅.
 *   서버 응답의 schema_version 과 비교하여 불일치 시 재연산(Live Refresh) 실행.
 *
 * [확장 규칙]
 *   - 新 survey_type 추가 시: getSurveyAdapter(type) 에 어댑터 등록
 *   - 매핑 로직 변경 시: MAPPING_ENGINE_VERSION 을 올리고 DB migration에 기록
 *   - 기존 파이프라인은 절대 삭제하지 않고 v_prev 로 보존
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function(root) {
  'use strict';

  // ─── 버전 상수 ───────────────────────────────────────────────────────────
  var MAPPING_ENGINE_VERSION = 'v1.1';
  var MAPPING_ENGINE_DATE    = '2026-08-18'; // GAP-11: 2차 배경 배점 applyStage2Bonus 추가

  // 전역 노출 (결과지에서 window.__MAPPING_ENGINE_VERSION__ 로 비교)
  root.__MAPPING_ENGINE_VERSION__ = MAPPING_ENGINE_VERSION;
  root.__MAPPING_ENGINE_DATE__    = MAPPING_ENGINE_DATE;

  // ─── 파이프라인 Input/Output 타입 정의 (주석) ────────────────────────────
  /**
   * @typedef {Object} RawAnswers
   * @property {Object} stage1    - {[rno]: optionIndex}  S1_BASE + HF 적응형
   * @property {Object} stage2    - {[no]: optionIndex|Array}  no:1~16 고정
   * @property {Object} stage3    - {[gi]: optionIndex}  gi:0~36 전역 인덱스
   * @property {Object} stage4    - {[i]: {qi,oi,key,ax}}  갈림문항 + DEFAULT
   * @property {Object} disp      - {[DISP_KEY]: optionIndex}  G01~G10 기질 (선택)
   * @property {Object} pfProfile - {saju,mbti,blood,face,birthY,...}
   * @property {Object} desire    - {moodIdx,moodLabel,who,partIdx,partLabels,...}
   * @property {Array}  redFlags  - 기 계산된 redFlags (없으면 재계산)
   */

  /**
   * @typedef {Object} MappingResult
   * @property {Object}  axisScores     - {A01~A10: number}  0~10 점수
   * @property {Array}   redFlags       - ['PCOS','DIABETES',...]
   * @property {Object}  bcAnswers      - bc-engine 호환 flat key 객체
   * @property {Object}  desire         - {who,moodLabel,partLabels,...}
   * @property {Object}  dispProxy      - DISP fallback 값 {ex,plan,fatigue,stress,caffeine}
   * @property {String}  mappingVersion - 'v1.0'
   * @property {Boolean} wasRecomputed  - true = Live Refresh로 재연산됨
   */

  // ═══════════════════════════════════════════════════════════════════════════
  // §1. Stage3 gi 인덱스 → 축(Axis) 매핑 테이블
  //     (survey-hospital.html STAGE3_QUESTIONS gi 순서와 완전 동일)
  // ═══════════════════════════════════════════════════════════════════════════
  var GI_AXIS_MAP = {
    // A01 인슐린·내장지방 (gi:0~3)
    0:'A01', 1:'A01', 2:'A01', 3:'A01',
    // A02 림프·순환·부종 (gi:4~6)
    4:'A02', 5:'A02', 6:'A02',
    // A03 호르몬·대사 (gi:7~11)
    7:'A03', 8:'A03', 9:'A03', 10:'A03', 11:'A03',
    // A04 근감소·근기능 (gi:12~15)
    12:'A04', 13:'A04', 14:'A04', 15:'A04',
    // A05 소화·장내세균 (gi:16~20)
    16:'A05', 17:'A05', 18:'A05', 19:'A05', 20:'A05',
    // A06 골격·체형 (gi:21~23)
    21:'A06', 22:'A06', 23:'A06',
    // A07 만성스트레스·코르티솔 (gi:24~27)
    24:'A07', 25:'A07', 26:'A07', 27:'A07',
    // A08 심리·식이행동 (gi:28~31)
    28:'A08', 29:'A08', 30:'A08', 31:'A08',
    // A09 대사위험 (gi:32~34)
    32:'A09', 33:'A09', 34:'A09',
    // A10 기질·성향 (gi:35~36) — 점수 계산에서 제외 (질적 데이터)
    35:'A10', 36:'A10'
  };

  // gi별 가중치 (역문항은 음수, 기본은 +1)
  // 역문항: gi:20(식후편안, 높을수록 건강), gi:27(아침개운, 높을수록 건강), gi:28(음식남기기, 높을수록 건강)
  var GI_WEIGHT = {
    20: -1,  // A05 역문항
    27: -1,  // A07 역문항
    28: -1   // A08 역문항
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // §2. Stage3 → axisScores 연산
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Stage3 응답(gi 인덱스 객체)으로 축 점수(A01~A10) 계산.
   * A10(기질)은 점수 합산에서 제외.
   * @param {Object} s3 - raw_answers.stage3 {gi: optIdx}
   * @returns {Object} {A01:n, A02:n, ..., A09:n}  (0~9 정규화)
   */
  function computeAxisScoresFromS3(s3) {
    s3 = s3 || {};
    var sums   = { A01:0, A02:0, A03:0, A04:0, A05:0, A06:0, A07:0, A08:0, A09:0 };
    var counts = { A01:0, A02:0, A03:0, A04:0, A05:0, A06:0, A07:0, A08:0, A09:0 };

    Object.keys(s3).forEach(function(gi) {
      var giNum = parseInt(gi, 10);
      var axis  = GI_AXIS_MAP[giNum];
      if (!axis || axis === 'A10') return;  // A10 제외
      var val = s3[gi];
      if (val === null || val === undefined || val === 'unknown') return;
      val = typeof val === 'number' ? val : Number(val);
      if (isNaN(val)) return;

      var w = GI_WEIGHT[giNum] || 1;
      // 역문항: val을 반전(최대 3 기준). 선택지 최대값을 3으로 가정
      var score = w < 0 ? (3 - val) : val;
      sums[axis]   += score;
      counts[axis] += 1;
    });

    var result = {};
    Object.keys(sums).forEach(function(ax) {
      if (counts[ax] === 0) { result[ax] = 0; return; }
      // 0~9 정규화: 각 gi의 최대 선택지 3 기준 → 축 최대 = counts[ax]*3
      var maxPossible = counts[ax] * 3;
      result[ax] = Math.round((sums[ax] / maxPossible) * 9 * 100) / 100;
    });
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // §3. Stage4 applyDecision — axis_scores에 +3 가산
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * stage4 답변 기반으로 선택 축에 +3 가산 (bc-engine applyDecision 클라이언트 미러).
   * @param {Object} scores  - 현재 axisScores (mutates in place)
   * @param {Object} stage4  - raw_answers.stage4 {i: {qi,oi,key,ax}}
   */
  function applyStage4Decision(scores, stage4) {
    if (!stage4) return;
    Object.values(stage4).forEach(function(ans) {
      if (!ans) return;
      var ax = ans.ax;  // 선택 축 (null = "잘 모르겠어요")
      if (!ax) return;
      scores[ax] = (scores[ax] || 0) + 3;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // §4. Stage2 → redFlags + bcAnswers 매핑
  //     (result-hospital.html loadHospitalResult() 매핑 로직의 공통 추출)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Stage2 응답에서 redFlags 배열 및 bc-engine 호환 bcAnswers 생성.
   * @param {Object} s2 - raw_answers.stage2 {no: val|Array}
   * @param {Object} existingRedFlags - 기존 redFlags (병합 대상)
   * @returns {{ redFlags: Array, bcAnswers: Object }}
   */
  function extractFromStage2(s2, existingRedFlags) {
    s2 = s2 || {};
    var redFlags = (existingRedFlags || []).slice();
    var bc = {};

    // ─ helper ─
    var single = function(no) {
      var v = s2[no];
      if (v === undefined || v === null) return null;
      return typeof v === 'number' ? v : parseInt(v, 10);
    };
    var multi = function(no) {
      var v = s2[no];
      if (!v) return null;
      if (Array.isArray(v)) return v.map(Number);
      if (typeof v === 'number') return [v];
      return null;
    };
    var addFlag = function(flag) {
      if (redFlags.indexOf(flag) < 0) redFlags.push(flag);
    };

    // no:1 유전 가계력
    bc.q1_family = multi(1);

    // no:2 부모 체형
    var p2 = single(2);
    if (p2 !== null) bc.q2_parent = p2;

    // no:3 진단 질환 → disease + redFlags
    var diseases = multi(3);
    if (diseases) {
      bc.disease = diseases;
      if (diseases.indexOf(0) > -1) { bc.Q_PCOS = 'yes'; addFlag('PCOS'); }
      if (diseases.indexOf(1) > -1 || diseases.indexOf(2) > -1) { bc.Q_metabolic = 'yes'; }
      if (diseases.indexOf(3) > -1) addFlag('THYROID');
      if (diseases.indexOf(4) > -1) addFlag('FATTY_LIVER');
    }

    // no:4 경계소견 → borderlineFlags + redFlags
    var s2_4 = multi(4);
    if (s2_4) {
      bc.q4_borderline = s2_4;
      if (s2_4.indexOf(0) > -1) { bc.Q_PRE_DIABETES = 'yes'; addFlag('PRE_DIABETES'); }
      if (s2_4.indexOf(1) > -1) bc.Q_BORDERLINE_LIVER = 'yes';
      if (s2_4.indexOf(2) > -1) bc.Q_BORDERLINE_CHOL  = 'yes';
      if (s2_4.indexOf(3) > -1) { bc.Q_BORDERLINE_HTN = 'yes'; addFlag('BORDERLINE_HTN'); }
    }

    // no:6 장기복용 약물 → redFlags
    var drugs = multi(6);
    if (drugs) {
      bc.long_term_drugs = drugs;
      if (drugs.indexOf(0) > -1) addFlag('STEROID');
    }

    // no:7 식욕억제제 → APPETITE_SUPP
    var app = single(7);
    if (app !== null) {
      bc.appetite_suppressant = app;
      if (app <= 1) addFlag('APPETITE_SUPP');
    }

    // no:8 살찐 계기
    bc.q8_trigger = multi(8);

    // no:9 시술이력 → LIPO_HX
    var procs = multi(9);
    if (procs) {
      bc.past_procedures = procs;
      if (procs.indexOf(0) > -1) addFlag('LIPO_HX');
    }

    // no:10 체중 변화 궤적 → YOYO
    var s2_10 = s2[10];
    if (s2_10 && typeof s2_10 === 'object') {
      bc.Q_WT_PATTERN = s2_10.pattern || null;
      bc.Q_WT_AMP     = s2_10.amp     || null;
      bc.Q_WT_CYC     = s2_10.cyc     || null;
      if (s2_10.pattern === 'yoyo') { bc.Q_YOYO = 'yes'; addFlag('YOYO'); }
    } else if (typeof s2_10 === 'string') {
      bc.Q_WT_PATTERN = s2_10;
      if (s2_10 === 'yoyo') { bc.Q_YOYO = 'yes'; addFlag('YOYO'); }
    }

    // no:11 출산
    var q11 = single(11);
    if (q11 !== null) {
      bc.q11_event = q11;
      if (q11 === 0 || q11 === 1) { bc.Q3 = 'yes'; bc.birth_history = 'yes'; }
    }

    // no:12 갱년기
    var MENO = { 0:'갱년기 변환형', 1:'호르몬 치료형', 2:'완경 후' };
    var menoIdx = single(12);
    if (menoIdx !== null) {
      bc.q12_menopause = menoIdx;
      if (MENO[menoIdx]) {
        bc.Q_MENOPAUSE = MENO[menoIdx];
        if (menoIdx === 1) bc.Q_HRT = 'hrt';
      }
    }

    // no:13 흡연
    var smoke = single(13);
    if (smoke !== null) bc.q13_smoke = smoke;

    // no:14 음주
    var alc = single(14);
    if (alc !== null) bc.q14_alcohol = alc;

    // no:16 옷 사이즈
    var s2_16 = s2[16];
    if (s2_16 && typeof s2_16 === 'object') {
      if (s2_16.sz != null) bc.Q_SIZE_CURRENT = s2_16.sz;
      if (s2_16.tg != null) bc.Q_SIZE_GOAL    = s2_16.tg;
      if (s2_16.fit != null) bc.Q_SIZE_FIT    = s2_16.fit;
    }

    return { redFlags: redFlags, bcAnswers: bc };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // §4-B. 2차 배경 배점 — applyStage2Bonus()
  //        설계도 표 C (2차 Q1~Q12) 기반 축 점수 직접 가산
  //        캡: 병력 합산 전체 +4.0 (설계도 확정값)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 2차 배경 응답(Stage2)에서 축 점수 보너스를 계산해 axisScores에 직접 가산.
   * 설계도 표 C Q1~Q12 전량 구현. 병력 캡 +4.0.
   *
   * @param {Object} axisScores - 현재 축 점수 (in-place 수정)
   * @param {Object} s2         - raw_answers.stage2 {no: val|Array}
   * @param {Object} bcAnswers  - extractFromStage2 결과 (disease, appetite_suppressant 등)
   */
  function applyStage2Bonus(axisScores, s2, bcAnswers) {
    s2        = s2        || {};
    bcAnswers = bcAnswers || {};

    // 보너스 누적용 (축 이름: 설계도 표기)
    // A01=인슐린, A02=림프, A03=호르몬, A04=근감소, A05=소화, A06=골격
    // A07=코르티솔, A08=심리·식이, A09=대사위험
    var bonus = { A01:0, A02:0, A03:0, A04:0, A05:0, A06:0, A07:0, A08:0, A09:0 };
    var CAP   = 4.0;

    // ─── helper ──────────────────────────────────────────────────────────────
    var single = function(no) {
      var v = s2[no];
      if (v === undefined || v === null) return null;
      return typeof v === 'number' ? v : parseInt(v, 10);
    };
    var multi = function(no) {
      var v = s2[no];
      if (!v) return [];
      if (Array.isArray(v)) return v.map(Number);
      if (typeof v === 'number') return [v];
      return [];
    };
    var add = function(ax, val) {
      if (bonus[ax] !== undefined) bonus[ax] += val;
    };

    // ─── Q1 유전 가계력(당뇨·고혈압) ─────────────────────────────────────────
    // 아버지/어머니/형제 중 하나라도 → 대사위험(A09) +1.0
    // s2[1]: Array, 각 항목 = 0(아버지) 1(어머니) 2(형제) 3(없음)
    var q1 = multi(1);
    var q1HasFamily = q1.length > 0 && q1.some(function(v) { return v !== 3; });
    if (q1HasFamily) { add('A09', 1.0); }

    // ─── Q2 부모 체형 ────────────────────────────────────────────────────────
    // 0=아빠(배) → 인슐린 +1.0 · 1=엄마(하체) → 림프 +1.0 · 2=둘다 → 각 +0.5
    var q2 = single(2);
    if (q2 === 0) { add('A01', 1.0); }
    else if (q2 === 1) { add('A02', 1.0); }
    else if (q2 === 2) { add('A01', 0.5); add('A02', 0.5); }

    // ─── Q3 진단 질환 ★최강 ─────────────────────────────────────────────────
    // PCOS(0) → 호르몬 +2.5
    // 당뇨(1) → 인슐린 +2.0·대사위험 +1.5
    // 고혈압(2) → 대사위험 +2.0
    // 갑상선(3) → 호르몬 +2.5
    // 지방간(4) → 인슐린 +2.0·대사위험 +1.0
    // 역류·위장(5) → 소화 +2.0
    // 우울·불안(6) → 심리 +2.0·코르티솔 +1.0
    var q3 = multi(3);
    if (q3.length === 0 && Array.isArray(bcAnswers.disease)) q3 = bcAnswers.disease;
    if (q3.indexOf(0) > -1) { add('A03', 2.5); }                       // PCOS
    if (q3.indexOf(1) > -1) { add('A01', 2.0); add('A09', 1.5); }      // 당뇨
    if (q3.indexOf(2) > -1) { add('A09', 2.0); }                       // 고혈압
    if (q3.indexOf(3) > -1) { add('A03', 2.5); }                       // 갑상선
    if (q3.indexOf(4) > -1) { add('A01', 2.0); add('A09', 1.0); }      // 지방간
    if (q3.indexOf(5) > -1) { add('A05', 2.0); }                       // 역류·위장
    if (q3.indexOf(6) > -1) { add('A08', 2.0); add('A07', 1.0); }      // 우울·불안

    // ─── Q4 경계 소견 ────────────────────────────────────────────────────────
    // 공복혈당(0) → 인슐린 +1.2 · 간수치(1) → 인슐린 +1.0
    // 콜레스테롤(2) → 대사위험 +1.2 · 혈압(3) → 대사위험 +1.2
    var q4 = multi(4);
    if (q4.indexOf(0) > -1) { add('A01', 1.2); }   // 공복혈당
    if (q4.indexOf(1) > -1) { add('A01', 1.0); }   // 간수치
    if (q4.indexOf(2) > -1) { add('A09', 1.2); }   // 콜레스테롤
    if (q4.indexOf(3) > -1) { add('A09', 1.2); }   // 혈압

    // ─── Q5 냉증 ─────────────────────────────────────────────────────────────
    // 여름에도 차가움(0) → 호르몬 +1.5 · 조금(1) → 호르몬 +0.7
    var q5 = single(5);
    if (q5 === 0) { add('A03', 1.5); }
    else if (q5 === 1) { add('A03', 0.7); }

    // ─── Q6 장기 복용약 ──────────────────────────────────────────────────────
    // 스테로이드(0) → 호르몬 +1.5·인슐린 +1.0
    // 항우울제(1) → 심리 +1.2·호르몬 +0.8
    // 피임·호르몬(2) → 호르몬 +1.5
    // 항응고·이소트레티노인·탈모약(3,4,5) → 축 0(시술 안전 플래그만)
    var q6 = multi(6);
    if (q6.indexOf(0) > -1) { add('A03', 1.5); add('A01', 1.0); }   // 스테로이드
    if (q6.indexOf(1) > -1) { add('A08', 1.2); add('A03', 0.8); }   // 항우울제
    if (q6.indexOf(2) > -1) { add('A03', 1.5); }                    // 피임·호르몬

    // ─── Q7 식욕억제제 ───────────────────────────────────────────────────────
    // 여러 번(0) → 심리 +2.0 · 한두 번(1) → 심리 +1.0
    var q7 = single(7);
    if (q7 === null && bcAnswers.appetite_suppressant !== undefined) {
      q7 = bcAnswers.appetite_suppressant;
    }
    if (q7 === 0) { add('A08', 2.0); }
    else if (q7 === 1) { add('A08', 1.0); }

    // ─── Q8 급증 계기 ────────────────────────────────────────────────────────
    // 이직·과로(0) → 코르티솔 +1.5
    // 이별·충격(1) → 심리 +1.5·코르티솔 +0.5
    // 수술·약물(2) → 호르몬 +1.2
    // 회식·음주(3) → 인슐린 +1.2
    // 금연(4) → 인슐린 +0.8
    // 서서히(5) → 근감소 +0.8
    var q8 = multi(8);
    if (q8.length === 0 && Array.isArray(bcAnswers.q8_trigger)) q8 = bcAnswers.q8_trigger;
    if (q8.indexOf(0) > -1) { add('A07', 1.5); }                    // 이직·과로
    if (q8.indexOf(1) > -1) { add('A08', 1.5); add('A07', 0.5); }   // 이별·충격
    if (q8.indexOf(2) > -1) { add('A03', 1.2); }                    // 수술·약물
    if (q8.indexOf(3) > -1) { add('A01', 1.2); }                    // 회식·음주
    if (q8.indexOf(4) > -1) { add('A01', 0.8); }                    // 금연
    if (q8.indexOf(5) > -1) { add('A04', 0.8); }                    // 서서히 → 근감소

    // ─── Q9 시술 이력 ────────────────────────────────────────────────────────
    // 지방흡입(0) → 근감소 +1.0(+플래그) · 지방분해(1) → 근감소 +0.5
    // 그 외 → 축 최소·플래그 위주
    var q9 = multi(9);
    if (q9.length === 0 && Array.isArray(bcAnswers.past_procedures)) q9 = bcAnswers.past_procedures;
    if (q9.indexOf(0) > -1) { add('A04', 1.0); }   // 지방흡입
    if (q9.indexOf(1) > -1) { add('A04', 0.5); }   // 지방분해

    // ─── Q10 체중 궤적 (요요 패턴) ──────────────────────────────────────────
    // 요요 패턴(정점 2회+) → 호르몬 +1.2~2.0 · 심리(A08) ×0.6 (설계도 §Q10)
    // 진폭 25kg+ → 호르몬 +1.0 / 15kg+ → 호르몬 +0.5
    var s2_10 = s2[10];
    var wtPattern = null, wtAmp = null;
    if (s2_10 && typeof s2_10 === 'object') {
      wtPattern = s2_10.pattern || null;
      wtAmp     = s2_10.amp     || null;
    } else if (typeof s2_10 === 'string') {
      wtPattern = s2_10;
    }
    // bcAnswers 폴백
    if (!wtPattern && bcAnswers.Q_WT_PATTERN) wtPattern = bcAnswers.Q_WT_PATTERN;
    if (wtAmp === null && bcAnswers.Q_WT_AMP !== undefined) wtAmp = bcAnswers.Q_WT_AMP;

    if (wtPattern === 'yoyo') {
      // 정점 2회+ 기본 가산: 호르몬 +1.2 (설계도: 1.2~2.0, 기본값 적용)
      add('A03', 1.2);
      // 설계도 §Q10: 요요 패턴 → 심리(A08) ×0.6 (억제 — bonus 아닌 axisScores 직접 곱산)
      axisScores['A08'] = Math.round(axisScores['A08'] * 0.6 * 100) / 100;
    }
    // 진폭 기반 추가 가산
    if (wtAmp !== null) {
      var ampNum = typeof wtAmp === 'number' ? wtAmp : Number(wtAmp);
      if (!isNaN(ampNum)) {
        if (ampNum >= 25) { add('A03', 1.0); }
        else if (ampNum >= 15) { add('A03', 0.5); }
      }
    }

    // ─── Q11 출산 (축 보너스 없음 — redFlags·bcAnswers만) ────────────────────
    // 설계도 표 C에 Q11 출산 배점 없음(골격·림프는 3차에서 담당)

    // ─── Q12 갱년기·완경 ─────────────────────────────────────────────────────
    // 복부 변환(0)·호르몬 치료(1)·완경(2) → 호르몬 +2.0
    // 신호 조금(3) → 호르몬 +0.5 (설계도: "배경 갱년기도 여기서")
    var q12 = single(12);
    if (q12 === null && bcAnswers.q12_menopause !== undefined) q12 = bcAnswers.q12_menopause;
    if (q12 === 0 || q12 === 1 || q12 === 2) { add('A03', 2.0); }
    else if (q12 === 3) { add('A03', 0.5); }

    // ─── 병력 캡 +4.0 적용 ──────────────────────────────────────────────────
    // 2차 전체 보너스 합계가 4.0 초과 시 비례 축소
    var totalBonus = Object.keys(bonus).reduce(function(sum, k) {
      return sum + (bonus[k] > 0 ? bonus[k] : 0);
    }, 0);

    if (totalBonus > CAP) {
      var ratio = CAP / totalBonus;
      Object.keys(bonus).forEach(function(k) {
        bonus[k] = Math.round(bonus[k] * ratio * 100) / 100;
      });
    }

    // ─── axisScores에 가산 (0~12 상한 유지) ─────────────────────────────────
    Object.keys(bonus).forEach(function(ax) {
      if (bonus[ax] > 0 && axisScores[ax] !== undefined) {
        axisScores[ax] = Math.min(12, Math.round((axisScores[ax] + bonus[ax]) * 100) / 100);
      }
    });

    // 디버그 로그 (콘솔에서 보너스 내역 확인 가능)
    console.log('[MappingEngine] applyStage2Bonus | totalBonus=' + totalBonus.toFixed(2)
      + (totalBonus > CAP ? ' → capped@' + CAP : '')
      + ' | bonus=' + JSON.stringify(bonus));

    return bonus; // 참조용 반환 (테스트 가능)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // §5. Stage1 → bcAnswers 보강
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Stage1 응답에서 Q_MIRROR_ZONE / Q_TARGET_ZONE / Q_BODY_CHANGE 추출.
   * @param {Object} s1 - raw_answers.stage1 {rno: optIdx}
   * @returns {Object} bcAnswers 보강 객체
   */
  function extractFromStage1(s1) {
    s1 = s1 || {};
    var bc = {};
    if (s1[1]  !== undefined && s1[1]  !== null) bc.Q_MIRROR_ZONE = s1[1];
    if (s1[10] !== undefined && s1[10] !== null) bc.Q_BODY_CHANGE = s1[10];
    if (s1[11] !== undefined && s1[11] !== null) bc.Q_TARGET_ZONE = s1[11];
    return bc;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // §6. Stage3 A10 → Q_EX_STYLE / Q_PLAN_STYLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Stage3 A10 기질 응답 → bc-engine 호환 Q_EX_STYLE / Q_PLAN_STYLE
   * @param {Object} s3
   * @returns {Object}
   */
  function extractA10FromS3(s3) {
    s3 = s3 || {};
    var bc = {};
    var exVal = s3[35];
    var planVal = s3[36];
    if (exVal !== undefined && exVal !== null && exVal !== 'unknown') {
      bc.Q_EX_STYLE   = (Number(exVal) === 0) ? 'intense' : 'calm';
    }
    if (planVal !== undefined && planVal !== null && planVal !== 'unknown') {
      bc.Q_PLAN_STYLE = (Number(planVal) === 0) ? 'plan' : 'spontaneous';
    }
    return bc;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // §7. DISP null fallback — gi proxy 추론값 추출
  //     (result-hospital.html [DISP-FB] 블록의 공통 버전)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * DISP 없는 병원용 설문에서 Stage3 gi proxy로 기질 추론.
   * @param {Object} s3  - raw_answers.stage3
   * @param {Object} disp - raw_answers.disp (빈 객체면 fallback 실행)
   * @returns {Object} dispProxy { ex, plan, fatigue, stress, caffeine, isProxy }
   */
  function extractDispProxy(s3, disp) {
    s3   = s3   || {};
    disp = disp || {};
    var isHospital = (Object.keys(disp).length === 0);
    if (!isHospital) return { isProxy: false };

    var gv = function(gi) {
      var v = s3[gi];
      if (v === undefined || v === null || v === 'unknown') return null;
      return typeof v === 'number' ? v : Number(v);
    };

    return {
      isProxy: true,
      ex      : gv(35),  // Q_EX_STYLE: 0=격렬, 1=차분
      plan    : gv(36),  // Q_PLAN_STYLE: 0=계획형, 1=즉흥형
      fatigue : gv(24),  // fatigue_after_sleep: 0~3
      stress  : gv(25),  // stress_late_eat: 0=없음, 1=가끔, 2=매번
      caffeine: gv(26),  // caffeine_cups: 0=1잔↓, 1=2~3잔, 2=4잔↑
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // §8. 메인 파이프라인: runMappingPipeline()
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 전체 매핑 파이프라인 실행.
   * INPUT  → raw_answers + 서버 제공 값(axisScores, redFlags, bcCode) + 옵션
   * OUTPUT → MappingResult
   *
   * @param {RawAnswers} rawAnswers
   * @param {Object}     serverValues - { axisScores, redFlags, bcCode, schema_version }
   * @param {Object}     opts         - { forceRecompute: bool, surveyType: string }
   * @returns {MappingResult}
   */
  function runMappingPipeline(rawAnswers, serverValues, opts) {
    rawAnswers   = rawAnswers   || {};
    serverValues = serverValues || {};
    opts         = opts         || {};

    var surveyType = opts.surveyType || 'hospital';

    // ─── Live Refresh 판단 ─────────────────────────────────────────────────
    // 서버의 schema_version과 클라이언트 엔진 버전 비교
    var serverSchemaVer = serverValues.schema_version || null;
    var forceRecompute  = opts.forceRecompute || false;
    var needRecompute   = forceRecompute
      || !serverSchemaVer
      || (serverSchemaVer !== MAPPING_ENGINE_VERSION);

    console.log('[MappingEngine v' + MAPPING_ENGINE_VERSION + '] surveyType=' + surveyType
      + ' | serverVer=' + (serverSchemaVer || 'none')
      + ' | needRecompute=' + needRecompute);

    var s1   = rawAnswers.stage1   || {};
    var s2   = rawAnswers.stage2   || {};
    var s3   = rawAnswers.stage3   || {};
    var s4   = rawAnswers.stage4   || {};
    var disp = rawAnswers.disp     || {};

    // ─── axisScores 결정 ───────────────────────────────────────────────────
    var axisScores;
    if (needRecompute || !serverValues.axisScores || Object.keys(serverValues.axisScores || {}).length === 0) {
      // 재연산: Stage3 gi → 축 점수 + Stage4 가산
      axisScores = computeAxisScoresFromS3(s3);
      applyStage4Decision(axisScores, s4);
    } else {
      // 서버 값 신뢰
      axisScores = serverValues.axisScores;
    }

    // ─── redFlags + bcAnswers 결정 ────────────────────────────────────────
    var s2Result = extractFromStage2(s2, serverValues.redFlags || rawAnswers.redFlags);
    var redFlags = s2Result.redFlags;

    // ─── 2차 배경 배점 가산 (설계도 표 C Q1~Q12, 병력 캡 +4.0) ─────────────
    // extractFromStage2 이후 호출해야 bcAnswers(disease 등)를 활용 가능
    applyStage2Bonus(axisScores, s2, s2Result.bcAnswers);

    // ─── bcAnswers 구성 (공통 flat key 매핑) ───────────────────────────────
    var bcAnswers = {};
    // Stage1
    Object.assign(bcAnswers, extractFromStage1(s1));
    // Stage2
    Object.assign(bcAnswers, s2Result.bcAnswers);
    // Stage3 A10 기질
    Object.assign(bcAnswers, extractA10FromS3(s3));
    // age (pfProfile.birthY 우선)
    var pfProfile = rawAnswers.pfProfile || {};
    var birthY = pfProfile.birthY ? Number(pfProfile.birthY) : null;
    var calcAge = birthY ? (new Date().getFullYear() - birthY) : (serverValues.age || null);
    if (calcAge) bcAnswers.age = calcAge;

    // ─── DISP fallback (병원용) ────────────────────────────────────────────
    var dispProxy = extractDispProxy(s3, disp);

    // ─── desire 추출 ──────────────────────────────────────────────────────
    var desire = rawAnswers.desire || serverValues.desire || null;

    // ─── 결과 반환 ─────────────────────────────────────────────────────────
    return {
      axisScores    : axisScores,
      redFlags      : redFlags,
      bcAnswers     : bcAnswers,
      desire        : desire,
      dispProxy     : dispProxy,
      mappingVersion: MAPPING_ENGINE_VERSION,
      wasRecomputed : needRecompute,
      surveyType    : surveyType,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // §9. Live Refresh 핸드셰이크 유틸
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 서버 응답의 schema_version과 현재 엔진 버전을 비교.
   * @param {string|null} serverVer - 서버가 반환한 schema_version
   * @returns {{ needsRefresh: bool, serverVer: string, clientVer: string, reason: string }}
   */
  function checkVersionHandshake(serverVer) {
    if (!serverVer) {
      return {
        needsRefresh: true,
        serverVer: 'unknown',
        clientVer: MAPPING_ENGINE_VERSION,
        reason: 'server_version_missing'
      };
    }
    if (serverVer !== MAPPING_ENGINE_VERSION) {
      return {
        needsRefresh: true,
        serverVer: serverVer,
        clientVer: MAPPING_ENGINE_VERSION,
        reason: 'version_mismatch'
      };
    }
    return {
      needsRefresh: false,
      serverVer: serverVer,
      clientVer: MAPPING_ENGINE_VERSION,
      reason: 'ok'
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // §10. Survey Type Adapter 인터페이스
  //      향후 aesthetic / fitness 버전에서 오버라이드 가능한 확장 포인트
  // ═══════════════════════════════════════════════════════════════════════════

  var _adapters = {};

  /**
   * 설문 타입별 어댑터 등록 (확장 진입점).
   * @param {string}   type    - 'hospital' | 'aesthetic' | 'fitness'
   * @param {Function} adapter - function(rawAnswers, serverValues, opts) → MappingResult
   */
  function registerAdapter(type, adapter) {
    _adapters[type] = adapter;
    console.log('[MappingEngine] adapter registered:', type);
  }

  /**
   * 등록된 어댑터 실행. 없으면 기본 hospital 파이프라인 사용.
   * @param {string}     type
   * @param {RawAnswers} rawAnswers
   * @param {Object}     serverValues
   * @param {Object}     opts
   * @returns {MappingResult}
   */
  function runAdapterPipeline(type, rawAnswers, serverValues, opts) {
    opts = Object.assign({ surveyType: type }, opts || {});
    if (_adapters[type]) {
      return _adapters[type](rawAnswers, serverValues, opts);
    }
    // 기본: hospital 파이프라인
    return runMappingPipeline(rawAnswers, serverValues, opts);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // §11. Public API 노출
  // ═══════════════════════════════════════════════════════════════════════════

  root.MappingEngine = {
    VERSION             : MAPPING_ENGINE_VERSION,
    DATE                : MAPPING_ENGINE_DATE,

    // 핵심 파이프라인
    run                 : runMappingPipeline,
    runAdapter          : runAdapterPipeline,
    registerAdapter     : registerAdapter,

    // 유틸
    checkVersionHandshake: checkVersionHandshake,

    // 개별 단계 (테스트 / 확장용)
    computeAxisScores   : computeAxisScoresFromS3,
    applyStage4Decision : applyStage4Decision,
    applyStage2Bonus    : applyStage2Bonus,       // GAP-11: 2차 배경 배점
    extractFromStage2   : extractFromStage2,
    extractFromStage1   : extractFromStage1,
    extractA10FromS3    : extractA10FromS3,
    extractDispProxy    : extractDispProxy,

    // 상수
    GI_AXIS_MAP         : GI_AXIS_MAP,
    GI_WEIGHT           : GI_WEIGHT,
  };

  console.log('[MappingEngine] loaded v' + MAPPING_ENGINE_VERSION + ' (' + MAPPING_ENGINE_DATE + ')');

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
