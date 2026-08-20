/**
 * Task 8: 데이터 바인딩 스키마 검증 레이어 (콘솔 경고)
 * 
 * result-hospital.html 로드 후 브라우저 콘솔에서 실행 가능한 검증기
 * 또는 Node.js 환경에서 직접 실행 가능
 * 
 * 실행: node tests/data-binding-schema-validator.js
 */

'use strict';

// ── 스키마 정의 ──────────────────────────────────────────────────────────────
const BINDING_SCHEMA = {
  // bcAnswers 필수 필드
  bcAnswers: {
    required: ['Q01', 'Q02', 'name', 'Q_SAJU', 'Q_MBTI', 'Q_BLOOD', 'Q_FACE'],
    optional: [
      'q1_family', 'q2_parent', 'disease', 'q5_cold',
      'long_term_drugs', 'appetite_suppressant', 'q8_trigger',
      'past_procedures', 'q11_event', 'q12_menopause',
      'q13_smoke', 'q14_alcohol',
      // [Task2+3] 신설
      'exercise_response', 'pain_areas',
      '_exercise_resp_label', '_pain_areas_parsed', '_pain_active_warns'
    ],
    types: {
      Q01: 'string', Q02: 'string', name: 'string',
      exercise_response: ['string', 'null'],
      pain_areas: 'array',
    }
  },

  // SUBTYPE_NARR 스키마
  SUBTYPE_NARR_entry: {
    required: ['story', 'desc'],
    minLength: { story: 10, desc: 10 }
  },

  // TODAY.move 스키마
  TODAY_move: {
    required: ['key', 'nm', 'exOptions'],
    exOptions_min: 1,
    exOptions_max: 5,
    exOption_fields: ['label', 'k', 'detail']
  },

  // S2_TEXT_MAP 스키마 (no:17, no:18 포함)
  S2_TEXT_MAP_required_keys: [1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 17, 18],

  // A08 골든타임 스키마
  GOLDEN_TIME_MAP_required_indices: [0, 1, 2, 3, 4, 5],
};

// ── 검증 함수들 ──────────────────────────────────────────────────────────────

function validateBcAnswers(bcAnswers) {
  const errors = [];
  const warnings = [];

  if (!bcAnswers || typeof bcAnswers !== 'object') {
    errors.push('[SCHEMA] bcAnswers가 객체가 아닙니다');
    return { errors, warnings };
  }

  // 필수 필드 체크
  for (const field of BINDING_SCHEMA.bcAnswers.required) {
    if (!(field in bcAnswers)) {
      warnings.push(`[SCHEMA] bcAnswers 필수 필드 누락: ${field}`);
    }
  }

  // 타입 체크
  for (const [field, expectedType] of Object.entries(BINDING_SCHEMA.bcAnswers.types)) {
    if (!(field in bcAnswers)) continue;
    const val = bcAnswers[field];
    const types = Array.isArray(expectedType) ? expectedType : [expectedType];
    const actualType = val === null ? 'null' : Array.isArray(val) ? 'array' : typeof val;
    if (!types.includes(actualType)) {
      warnings.push(`[SCHEMA] bcAnswers.${field} 타입 불일치: 기대=${types.join('|')}, 실제=${actualType}`);
    }
  }

  // [Task2] exercise_response 값 검증
  if ('exercise_response' in bcAnswers && bcAnswers.exercise_response !== null) {
    const validValues = [
      '하는 동안은 빠졌는데, 그만두니 금방 돌아왔어요',
      '한 번 좋아진 뒤 유지되는 편이었어요',
      '체중은 줄었는데 라인은 그대로였어요',
      '오히려 그 부위가 더 굵어지거나 단단해졌어요',
      '다음 날 너무 힘들어서 며칠 쉬게 됐어요',
      '별 변화가 없었어요',
      '아직 해본 적 없어요',
    ];
    const validLabels = ['일시반응형','반응지속형','구성미변형','역반응형','회복부족형','저반응형','이력없음'];
    const v = bcAnswers.exercise_response;
    if (v && !validValues.includes(v) && !validLabels.includes(v)) {
      warnings.push(`[SCHEMA][Task2] exercise_response 알 수 없는 값: "${v}"`);
    }
  }

  // [Task3] pain_areas 검증
  if ('pain_areas' in bcAnswers) {
    const pa = bcAnswers.pain_areas;
    if (!Array.isArray(pa)) {
      errors.push('[SCHEMA][Task3] pain_areas는 배열이어야 합니다');
    } else {
      if (pa.length > 3) {
        warnings.push(`[SCHEMA][Task3] pain_areas 최대 3개 초과: ${pa.length}개`);
      }
      const validPainAreas = ['목·어깨','팔꿈치·손목','등·허리','골반·꼬리뼈','무릎·발목','통증은 없었어요'];
      pa.forEach(area => {
        if (!validPainAreas.includes(area)) {
          warnings.push(`[SCHEMA][Task3] pain_areas 알 수 없는 값: "${area}"`);
        }
      });
    }
  }

  return { errors, warnings };
}

function validateSubtypeNarr(SUBTYPE_NARR) {
  const errors = [];
  const warnings = [];

  if (!SUBTYPE_NARR || typeof SUBTYPE_NARR !== 'object') {
    errors.push('[SCHEMA] SUBTYPE_NARR가 정의되지 않았습니다');
    return { errors, warnings };
  }

  const keys = Object.keys(SUBTYPE_NARR);
  if (keys.length < 86) {
    errors.push(`[SCHEMA] SUBTYPE_NARR 키 수 부족: ${keys.length}/86`);
  }

  // 접미사 키 형식 검증
  const invalidKeys = keys.filter(k => !k.endsWith('_여') && !k.endsWith('_남'));
  if (invalidKeys.length > 0) {
    warnings.push(`[SCHEMA] 접미사 없는 키 ${invalidKeys.length}개: ${invalidKeys.slice(0,3).join(', ')}...`);
  }

  // story/desc 길이 검증
  let emptyStory = 0, emptyDesc = 0;
  keys.forEach(key => {
    const v = SUBTYPE_NARR[key];
    if (!v || !v.story || v.story.length < BINDING_SCHEMA.SUBTYPE_NARR_entry.minLength.story) emptyStory++;
    if (!v || !v.desc  || v.desc.length  < BINDING_SCHEMA.SUBTYPE_NARR_entry.minLength.desc)  emptyDesc++;
  });
  if (emptyStory > 0) errors.push(`[SCHEMA] SUBTYPE_NARR story 비어있는 키: ${emptyStory}개`);
  if (emptyDesc  > 0) errors.push(`[SCHEMA] SUBTYPE_NARR desc 비어있는 키:  ${emptyDesc}개`);

  return { errors, warnings };
}

function validateTodayMove(todayMove) {
  const errors = [];
  const warnings = [];
  const schema = BINDING_SCHEMA.TODAY_move;

  if (!todayMove) {
    errors.push('[SCHEMA] TODAY.move가 정의되지 않았습니다');
    return { errors, warnings };
  }

  for (const field of schema.required) {
    if (!(field in todayMove)) {
      errors.push(`[SCHEMA] TODAY.move 필수 필드 누락: ${field}`);
    }
  }

  if (Array.isArray(todayMove.exOptions)) {
    const n = todayMove.exOptions.length;
    if (n < schema.exOptions_min) errors.push(`[SCHEMA][Task2] TODAY.move.exOptions 최소 ${schema.exOptions_min}개 필요, 현재 ${n}개`);
    if (n > schema.exOptions_max) warnings.push(`[SCHEMA][Task2] TODAY.move.exOptions ${n}개 (최대 ${schema.exOptions_max}개 권장)`);
    todayMove.exOptions.forEach((opt, i) => {
      for (const f of schema.exOption_fields) {
        if (!(f in opt)) {
          warnings.push(`[SCHEMA][Task2] TODAY.move.exOptions[${i}].${f} 누락`);
        }
      }
    });
  }

  return { errors, warnings };
}

function validateGoldenTime(goldenTimeText, a08Idx) {
  const errors = [];
  const warnings = [];

  if (typeof a08Idx === 'number' && !isNaN(a08Idx)) {
    if (!BINDING_SCHEMA.GOLDEN_TIME_MAP_required_indices.includes(a08Idx)) {
      warnings.push(`[SCHEMA][Task4] A08 인덱스 범위 초과: ${a08Idx} (유효: 0~5)`);
    }
  }

  if (goldenTimeText) {
    if (!goldenTimeText.startsWith('⏰ 골든타임')) {
      warnings.push(`[SCHEMA][Task4] 골든타임 문구 형식 불일치: "${goldenTimeText.slice(0,30)}..."`);
    }
  }

  return { errors, warnings };
}

function validateTogetherDays(nDays) {
  const errors = [];
  const warnings = [];

  if (typeof nDays !== 'number' || isNaN(nDays)) {
    errors.push('[SCHEMA][Task5] __TOGETHER_DAYS__ 숫자가 아닙니다');
  } else {
    if (nDays < 1) errors.push(`[SCHEMA][Task5] N일째 값이 1 미만: ${nDays}`);
    if (nDays > 365 * 3) warnings.push(`[SCHEMA][Task5] N일째 값이 3년 초과: ${nDays}일 — created_at 확인 필요`);
  }

  return { errors, warnings };
}

// ── 브라우저 주입용 스니펫 ─────────────────────────────────────────────────
const BROWSER_INJECTOR = `
(function slimMindSchemaValidator() {
  'use strict';

  const errors   = [];
  const warnings = [];

  // 1. SUBTYPE_NARR 검증
  if (typeof SUBTYPE_NARR !== 'undefined') {
    const keys = Object.keys(SUBTYPE_NARR);
    if (keys.length < 86) errors.push('[SCHEMA] SUBTYPE_NARR 키 수 부족: ' + keys.length + '/86');
    keys.forEach(k => {
      if (!SUBTYPE_NARR[k].story || SUBTYPE_NARR[k].story.length < 10) {
        errors.push('[SCHEMA] SUBTYPE_NARR story 비어있음: ' + k);
      }
    });
    console.log('[SCHEMA] SUBTYPE_NARR 키 수:', keys.length);
  } else {
    errors.push('[SCHEMA] SUBTYPE_NARR 미정의');
  }

  // 2. TODAY.move.exOptions 검증
  if (typeof TODAY !== 'undefined' && TODAY.move) {
    if (!Array.isArray(TODAY.move.exOptions) || TODAY.move.exOptions.length < 1) {
      errors.push('[SCHEMA][Task2] TODAY.move.exOptions 비어있음');
    } else {
      console.log('[SCHEMA] TODAY.move.exOptions 수:', TODAY.move.exOptions.length);
    }
  }

  // 3. 골든타임 검증
  const _gtEl = document.getElementById('w12-golden-time-div');
  if (!_gtEl) {
    warnings.push('[SCHEMA][Task4] #w12-golden-time-div DOM 요소 없음');
  }

  // 4. N일째 검증
  const _daysEl = document.getElementById('together-days-span');
  if (!_daysEl) {
    warnings.push('[SCHEMA][Task5] #together-days-span DOM 요소 없음');
  } else if (!/\\d/.test(_daysEl.textContent || '')) {
    warnings.push('[SCHEMA][Task5] together-days-span에 숫자 없음: ' + _daysEl.textContent);
  }

  // 5. window.__TOGETHER_DAYS__ 검증
  if (typeof window.__TOGETHER_DAYS__ === 'number') {
    if (window.__TOGETHER_DAYS__ < 1) errors.push('[SCHEMA][Task5] __TOGETHER_DAYS__ < 1');
    console.log('[SCHEMA] __TOGETHER_DAYS__:', window.__TOGETHER_DAYS__);
  } else {
    warnings.push('[SCHEMA][Task5] __TOGETHER_DAYS__ 미설정 (결과 로드 전일 수 있음)');
  }

  // 출력
  if (errors.length === 0 && warnings.length === 0) {
    console.log('%c[SCHEMA] ✅ 모든 스키마 검증 통과', 'color:green;font-weight:bold');
  } else {
    errors.forEach(e => console.error(e));
    warnings.forEach(w => console.warn(w));
    console.log('[SCHEMA] 오류:', errors.length + '건 / 경고:', warnings.length + '건');
  }
  return { errors, warnings };
})();
`;

// ── Node.js 실행 시 단순 스모크 테스트 ──────────────────────────────────────
if (typeof module !== 'undefined' && require.main === module) {
  console.log('=== Task 8: 데이터 바인딩 스키마 검증 레이어 ===\n');

  // 정상 케이스 테스트
  const mockBcAnswers = {
    Q01: '김지현', Q02: '여성', name: '김지현',
    Q_SAJU: '수', Q_MBTI: 'INFJ', Q_BLOOD: 'A', Q_FACE: '둥근형',
    exercise_response: '별 변화가 없었어요',
    pain_areas: ['목·어깨', '등·허리'],
    _exercise_resp_label: '저반응형',
  };

  const r1 = validateBcAnswers(mockBcAnswers);
  console.log('[bcAnswers 검증] 오류:', r1.errors.length, '/ 경고:', r1.warnings.length);
  r1.errors.forEach(e => console.error(' ', e));
  r1.warnings.forEach(w => console.warn(' ', w));

  // 비정상 케이스 테스트
  const badBcAnswers = { Q01: '테스트', exercise_response: '이상한값', pain_areas: ['존재하지않는부위'] };
  const r2 = validateBcAnswers(badBcAnswers);
  console.log('\n[비정상 bcAnswers] 오류:', r2.errors.length, '/ 경고:', r2.warnings.length);
  r2.errors.forEach(e => console.error(' ', e));
  r2.warnings.forEach(w => console.warn(' ', w));

  // 골든타임 검증
  const r3 = validateGoldenTime('⏰ 골든타임 — 운동은 저녁 식후 90분이 최적.', 0);
  console.log('\n[A08 골든타임] 오류:', r3.errors.length, '/ 경고:', r3.warnings.length);

  // N일째 검증
  const r4 = validateTogetherDays(3);
  console.log('[N일째] 오류:', r4.errors.length, '/ 경고:', r4.warnings.length);

  console.log('\n=== 브라우저 주입 스니펫 (콘솔에 붙여넣기) ===');
  console.log(BROWSER_INJECTOR);
  console.log('\n✅ Task 8 스키마 검증 레이어 준비 완료');
}

module.exports = {
  validateBcAnswers,
  validateSubtypeNarr,
  validateTodayMove,
  validateGoldenTime,
  validateTogetherDays,
  BINDING_SCHEMA,
  BROWSER_INJECTOR,
};
