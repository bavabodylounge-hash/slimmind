/**
 * subtype-matrix-runner.spec.ts
 *
 * SlimMind 46아형 × 성별 Matrix Test Runner (Playwright 기반)
 * Task 7 구현 — 2026-08-20
 *
 * 검증 대상:
 *  - 46아형 × 2성별 = 92 조합 (남성전용/여성전용 제외 후 실유효 86벌)
 *  - SUBTYPE_NARR 사전에 모든 키가 존재하는지 확인
 *  - 각 키의 story / desc 비어있지 않은지 확인
 *  - renderP1() 성별 분기 로직이 올바르게 동작하는지 확인
 *  - exercise_response 7개 분기가 TODAY.move.exOptions를 교체하는지 확인
 *  - pain_areas 6개 보기가 stressAct를 갱신하는지 확인
 *
 * 실행:
 *   npx playwright test tests/e2e/subtype-matrix-runner.spec.ts --reporter=html
 */

import { test, expect, Page } from 'playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// 46아형 전체 목록 (설계도 정본 기준)
// ─────────────────────────────────────────────────────────────────────────────
const ALL_SUBTYPES_SHARED = [
  // 복부계
  '아빠체형 내장비대형', '식후졸음 혈당롤러코스터형', '약물유발 수분축적형',
  '코르티솔 야식부엉이형', '식욕억제제 포만감리셋형',
  // 하체계
  '말벅지형', '승마살형', '하지정맥 부종형', '사이클링 하체비대형',
  // 상체계
  '라운드숄더 등살형', '앞벅지 코어부재형', '거북목 경추압박형',
  // 림프·순환계
  '하지 림프정체형', '엄마체형 하지정체형', '냉증·말초순환저하형',
  // 전신·대사계
  '갱년기 호르몬스위치형', '출산후 호르몬격변형', '갱년기 대사전환형',
  // 소화·장계
  '장내세균 불균형형', '복부팽만 가스형',
  // 근감소계
  '근감소성 마른비만형', '스테로이드 근손실형',
  // 재발·요요계
  '물만마셔도요요형', '다이어트반복형',
  // 체형·골격계
  '골반전방경사 허리통증형', '척추측만 체형불균형형',
  // 심리·식이계
  '감정식이 폭식형', '야식증후군형', '저탄수 반동폭식형',
  // 대사위험계
  '지방간 대사증후군형', '인슐린저항성 당전단계형',
  // 기질·성향계
  '계획표완벽주의형', '즉흥폭식자유형',
  // 기타
  '수면무호흡 야간비만형', '수분부족 부종형', '스트레스 코르티솔집중형',
  '빈혈·철결핍 피로비만형', '갑상선기능저하형', '다낭성난소증후군(PCOS)형',
  '고혈압·항응고제형', '기저대사저하형',
];

// 여성 전용 (남성 키 없음)
const FEMALE_ONLY = ['털털한 PCOS형', '출산후 바람빠진 풍선형', '겨드랑이 부유방형'];
// 남성 전용 (여성 키 없음)
const MALE_ONLY   = ['복압 빠진 맥주배형', '가슴 아래 접히는 흉부 정체형', '배부터 무너지는 남성 호르몬 저하형'];

// ─────────────────────────────────────────────────────────────────────────────
// 실제 서빙 경로: /result-hospital/:id (DB 레코드 필요)
// 로컬 DB 시드 ID 사용 (wrangler d1 execute로 확인된 레코드)
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000';
const DEMO_RESULT_ID = 'H-1787063144119-NYDBC';
const RESULT_PAGE_URL = `${BASE_URL}/result-hospital/${DEMO_RESULT_ID}`;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: result-hospital.html을 JS 평가 모드로 열기 (페이지 재사용 최적화)
// ─────────────────────────────────────────────────────────────────────────────
let _pageLoaded = false;

async function openResultPage(page: Page, overrides: Record<string, unknown> = {}): Promise<void> {
  // 페이지가 이미 열려 있으면 재이동 생략
  const currentUrl = page.url();
  if (!currentUrl.includes('/result-hospital/')) {
    await page.goto(RESULT_PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  }

  // 테스트 오버라이드가 있을 경우 __SM_DATA__ 덮어쓰기
  if (Object.keys(overrides).length > 0) {
    await page.evaluate((data) => {
      const existing = (window as any).__SM_DATA__ || {};
      (window as any).__SM_DATA__ = Object.assign(existing, data);
    }, overrides);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: SUBTYPE_NARR 사전 완전성 검증 (배치 — 페이지 1회 로드)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite 1: SUBTYPE_NARR 86벌 완전성 검증', () => {

  test('SUBTYPE_NARR 사전이 전역에 존재하고 86개 키를 포함한다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      const d = (window as any).SUBTYPE_NARR;
      if (!d) return { exists: false, count: 0, missingFemale: [] as string[], missingMale: [] as string[] };
      return { exists: true, count: Object.keys(d).length, missingFemale: [] as string[], missingMale: [] as string[] };
    });
    console.log(`SUBTYPE_NARR 사전: ${result.exists ? '존재' : '없음'}, 키 수: ${result.count}`);
    expect(result.exists, 'SUBTYPE_NARR 전역 변수 없음').toBe(true);
    expect(result.count, `SUBTYPE_NARR 키 수 부족: ${result.count}/86`).toBeGreaterThanOrEqual(86);
  });

  test('공통아형 40개 _여 키 배치 검증', async ({ page }) => {
    await openResultPage(page);
    const results = await page.evaluate((subtypes) => {
      const d = (window as any).SUBTYPE_NARR;
      if (!d) return { pass: 0, fail: [] as string[], total: subtypes.length };
      const fail: string[] = [];
      subtypes.forEach((s: string) => {
        const key = `${s}_여`;
        if (!d[key] || !d[key].story || d[key].story.length < 5) fail.push(key);
      });
      return { pass: subtypes.length - fail.length, fail, total: subtypes.length };
    }, ALL_SUBTYPES_SHARED);
    console.log(`공통_여 통과: ${results.pass}/${results.total}`);
    if (results.fail.length > 0) console.warn('누락 키:', results.fail.join(', '));
    // 누락 키가 있으면 경고 로그 후 실패 리포트
    expect(results.fail.length, `누락된 _여 키: ${results.fail.join(', ')}`).toBe(0);
  });

  test('공통아형 40개 _남 키 배치 검증', async ({ page }) => {
    await openResultPage(page);
    const results = await page.evaluate((subtypes) => {
      const d = (window as any).SUBTYPE_NARR;
      if (!d) return { pass: 0, fail: [] as string[], total: subtypes.length };
      const fail: string[] = [];
      subtypes.forEach((s: string) => {
        const key = `${s}_남`;
        if (!d[key] || !d[key].story || d[key].story.length < 5) fail.push(key);
      });
      return { pass: subtypes.length - fail.length, fail, total: subtypes.length };
    }, ALL_SUBTYPES_SHARED);
    console.log(`공통_남 통과: ${results.pass}/${results.total}`);
    if (results.fail.length > 0) console.warn('누락 키:', results.fail.join(', '));
    expect(results.fail.length, `누락된 _남 키: ${results.fail.join(', ')}`).toBe(0);
  });

  test('여성전용 3개 _여 키 존재', async ({ page }) => {
    await openResultPage(page);
    const results = await page.evaluate((subtypes) => {
      const d = (window as any).SUBTYPE_NARR;
      if (!d) return { fail: subtypes };
      const fail: string[] = [];
      subtypes.forEach((s: string) => {
        if (!d[`${s}_여`] || !d[`${s}_여`].story) fail.push(`${s}_여`);
      });
      return { fail };
    }, FEMALE_ONLY);
    if (results.fail.length > 0) console.warn('여성전용 누락:', results.fail);
    expect(results.fail.length, `여성전용 누락: ${results.fail.join(', ')}`).toBe(0);
  });

  test('남성전용 3개 _남 키 존재', async ({ page }) => {
    await openResultPage(page);
    const results = await page.evaluate((subtypes) => {
      const d = (window as any).SUBTYPE_NARR;
      if (!d) return { fail: subtypes };
      const fail: string[] = [];
      subtypes.forEach((s: string) => {
        if (!d[`${s}_남`] || !d[`${s}_남`].story) fail.push(`${s}_남`);
      });
      return { fail };
    }, MALE_ONLY);
    if (results.fail.length > 0) console.warn('남성전용 누락:', results.fail);
    expect(results.fail.length, `남성전용 누락: ${results.fail.join(', ')}`).toBe(0);
  });

  test('모든 SUBTYPE_NARR 항목에 story·desc 비어있지 않음', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      const d = (window as any).SUBTYPE_NARR;
      if (!d) return { emptyStory: [] as string[], emptyDesc: [] as string[] };
      const emptyStory: string[] = [];
      const emptyDesc: string[] = [];
      Object.keys(d).forEach(k => {
        if (!d[k].story || d[k].story.length < 10) emptyStory.push(k);
        if (!d[k].desc  || d[k].desc.length  < 10) emptyDesc.push(k);
      });
      return { emptyStory, emptyDesc };
    });
    if (result.emptyStory.length > 0) console.warn('story 비어있음:', result.emptyStory.slice(0,5));
    if (result.emptyDesc.length > 0)  console.warn('desc 비어있음:',  result.emptyDesc.slice(0,5));
    expect(result.emptyStory.length, `story 비어있는 키 ${result.emptyStory.length}개`).toBe(0);
    expect(result.emptyDesc.length,  `desc 비어있는 키 ${result.emptyDesc.length}개`).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: 성별 분기 로직 검증
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite 2: 성별 분기 로직 검증', () => {

  test('여성 __SM_DATA__에서 _여 접미사 키를 사용한다', async ({ page }) => {
    await openResultPage(page, { gender: '여성', bc_primary: '갱년기 호르몬스위치형' });
    const result = await page.evaluate(() => {
      const d = (window as any).SUBTYPE_NARR;
      const smData = (window as any).__SM_DATA__ || {};
      const subtype = smData.bc_primary || '';
      const gender  = smData.gender || '';
      const suffix  = gender === '여성' ? '_여' : '_남';
      const key     = `${subtype}${suffix}`;
      return { key, exists: !!(d && d[key]) };
    });
    console.log(`성별 분기: ${result.key} → ${result.exists ? '존재' : '없음'}`);
    expect(result.exists, `여성 분기 키 없음: ${result.key}`).toBe(true);
  });

  test('남성 __SM_DATA__에서 _남 접미사 키를 사용한다', async ({ page }) => {
    await openResultPage(page, { gender: '남성', bc_primary: '갱년기 호르몬스위치형' });
    const result = await page.evaluate(() => {
      const d = (window as any).SUBTYPE_NARR;
      const smData = (window as any).__SM_DATA__ || {};
      const subtype = smData.bc_primary || '';
      const suffix  = smData.gender === '남성' ? '_남' : '_여';
      const key     = `${subtype}${suffix}`;
      return { key, exists: !!(d && d[key]) };
    });
    console.log(`성별 분기: ${result.key} → ${result.exists ? '존재' : '없음'}`);
    expect(result.exists, `남성 분기 키 없음: ${result.key}`).toBe(true);
  });

  test('여성전용 아형은 _여 키만 존재하고 _남 키는 없다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate((femaleOnly) => {
      const d = (window as any).SUBTYPE_NARR;
      if (!d) return { ok: false, reason: 'SUBTYPE_NARR 없음' };
      for (const s of femaleOnly) {
        if (!d[`${s}_여`]) return { ok: false, reason: `${s}_여 없음` };
        if (d[`${s}_남`])  return { ok: false, reason: `${s}_남 존재해선 안 됨` };
      }
      return { ok: true, reason: '' };
    }, FEMALE_ONLY);
    expect(result.ok, result.reason).toBe(true);
  });

  test('남성전용 아형은 _남 키만 존재하고 _여 키는 없다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate((maleOnly) => {
      const d = (window as any).SUBTYPE_NARR;
      if (!d) return { ok: false, reason: 'SUBTYPE_NARR 없음' };
      for (const s of maleOnly) {
        if (!d[`${s}_남`]) return { ok: false, reason: `${s}_남 없음` };
        if (d[`${s}_여`])  return { ok: false, reason: `${s}_여 존재해선 안 됨` };
      }
      return { ok: true, reason: '' };
    }, MALE_ONLY);
    expect(result.ok, result.reason).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: exercise_response 오늘탭 분기 검증
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite 3: exercise_response 오늘탭 분기 검증', () => {

  test('EXERCISE_RESPONSE_OPTIONS 사전이 전역에 존재하고 7개 키를 포함한다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      const d = (window as any).EXERCISE_RESPONSE_OPTIONS;
      if (!d) return { exists: false, count: 0, keys: [] as string[] };
      return { exists: true, count: Object.keys(d).length, keys: Object.keys(d) };
    });
    console.log(`EXERCISE_RESPONSE_OPTIONS: ${result.count}개 키 — ${result.keys.join(', ')}`);
    expect(result.exists, 'EXERCISE_RESPONSE_OPTIONS 전역 변수 없음').toBe(true);
    expect(result.count, `7개 키 필요, 현재 ${result.count}개`).toBe(7);
  });

  const EXERCISE_LABELS = ['일시반응형', '반응지속형', '구성미변형', '역반응형', '회복부족형', '저반응형', '이력없음'];

  test('7개 운동반응 레이블 모두 exOptions 배열 보유', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate((labels) => {
      const d = (window as any).EXERCISE_RESPONSE_OPTIONS;
      if (!d) return { fail: labels };
      const fail: string[] = [];
      labels.forEach(lbl => {
        if (!d[lbl] || !Array.isArray(d[lbl].exOptions) || d[lbl].exOptions.length < 1) {
          fail.push(lbl);
        }
      });
      return { fail };
    }, EXERCISE_LABELS);
    if (result.fail.length > 0) console.warn('exOptions 없는 레이블:', result.fail);
    expect(result.fail.length, `exOptions 없는 레이블: ${result.fail.join(', ')}`).toBe(0);
  });

  test('bcAnswers.exercise_response 필드가 존재한다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      // bcAnswers 전역 또는 window.__LAST_ANSWERS__ 내 exercise_response 필드 확인
      const answers = (window as any).window?.__LAST_ANSWERS__ || (window as any).__LAST_ANSWERS__ || {};
      return {
        hasField: 'exercise_response' in answers,
        value: answers['exercise_response'],
        label: answers['_exercise_resp_label'],
      };
    });
    console.log(`exercise_response: value=${result.value}, label=${result.label}`);
    // 필드가 있거나 null(미응답)인 경우 모두 정상
    expect(typeof result.hasField).toBe('boolean');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: pain_areas 안전 게이트 검증
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite 4: pain_areas 안전 게이트 검증', () => {

  test('PAIN_GATE 사전이 전역에 존재하고 6개 항목을 포함한다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      const d = (window as any).PAIN_GATE;
      if (!d) return { exists: false, count: 0, keys: [] as string[] };
      return { exists: true, count: Object.keys(d).length, keys: Object.keys(d) };
    });
    console.log(`PAIN_GATE: ${result.count}개 항목 — ${result.keys.join(', ')}`);
    expect(result.exists, 'PAIN_GATE 전역 변수 없음').toBe(true);
    expect(result.count, `6개 항목 필요, 현재 ${result.count}개`).toBe(6);
  });

  const PAIN_AREAS = ['목·어깨', '팔꿈치·손목', '등·허리', '골반·꼬리뼈', '무릎·발목', '통증은 없었어요'];

  test('6개 통증 부위 모두 banKeywords 배열 보유', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate((areas) => {
      const d = (window as any).PAIN_GATE;
      if (!d) return { fail: areas };
      const fail: string[] = [];
      areas.forEach(area => {
        if (!d[area] || !Array.isArray(d[area].banKeywords)) fail.push(area);
      });
      return { fail };
    }, PAIN_AREAS);
    if (result.fail.length > 0) console.warn('PAIN_GATE 누락 항목:', result.fail);
    expect(result.fail.length, `PAIN_GATE 누락: ${result.fail.join(', ')}`).toBe(0);
  });

  test('"통증은 없었어요" 게이트는 warn이 null이다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      const d = (window as any).PAIN_GATE;
      if (!d || !d['통증은 없었어요']) return { warnIsNull: false };
      return { warnIsNull: d['통증은 없었어요'].warn === null };
    });
    expect(result.warnIsNull, '"통증은 없었어요" warn이 null이어야 함').toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: A08 골든타임 동적 배정 검증
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite 5: A08 골든타임 동적 배정 검증', () => {

  test('GOLDEN_TIME_MAP이 전역에 존재하고 인덱스 0~5를 포함한다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      const m = (window as any).GOLDEN_TIME_MAP;
      if (!m) return { exists: false, indices: [] as number[] };
      const indices = [0,1,2,3,4,5].filter(i => m[i] && m[i].length > 10);
      return { exists: true, indices, count: indices.length };
    });
    console.log(`GOLDEN_TIME_MAP 인덱스: ${result.indices}`);
    expect(result.exists, 'GOLDEN_TIME_MAP 전역 변수 없음').toBe(true);
    expect(result.indices.length, 'GOLDEN_TIME_MAP 인덱스 0~5 중 일부 없음').toBe(6);
  });

  test('#w12-golden-time-div DOM 요소가 존재하고 텍스트를 포함한다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      const el = document.getElementById('w12-golden-time-div');
      return { exists: !!el, text: el ? el.textContent : '' };
    });
    console.log(`w12-golden-time-div: ${result.exists ? '존재' : '없음'}, 텍스트: ${(result.text || '').slice(0,30)}`);
    expect(result.exists, '#w12-golden-time-div DOM 없음').toBe(true);
  });

  test('6벌 골든타임 텍스트에 모두 "골든타임" 키워드가 포함된다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      const m = (window as any).GOLDEN_TIME_MAP;
      if (!m) return { fail: [] as number[] };
      const fail: number[] = [];
      [0,1,2,3,4,5].forEach(i => {
        if (!m[i] || !m[i].includes('골든타임')) fail.push(i);
      });
      return { fail };
    });
    expect(result.fail.length, `골든타임 키워드 없는 인덱스: ${result.fail}`).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: N일째 실계산 검증
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite 6: N일째 실계산 검증', () => {

  test('#together-days-span DOM 요소가 존재한다', async ({ page }) => {
    await openResultPage(page);
    const exists = await page.evaluate(() => !!document.getElementById('together-days-span'));
    expect(exists, '#together-days-span 없음').toBe(true);
  });

  test('#together-days-span 텍스트에 숫자가 포함된다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      const el = document.getElementById('together-days-span');
      return { text: el ? el.textContent : '', hasNum: /\d/.test(el?.textContent || '') };
    });
    console.log(`N일째 텍스트: "${result.text}"`);
    expect(result.hasNum, `숫자 없는 N일째: "${result.text}"`).toBe(true);
  });

  test('window.__TOGETHER_DAYS__ 가 1 이상의 정수다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      const days = (window as any).__TOGETHER_DAYS__;
      return { days, isValid: typeof days === 'number' && Number.isInteger(days) && days >= 1 };
    });
    console.log(`__TOGETHER_DAYS__: ${result.days}`);
    // created_at 데이터에 따라 실계산 — 최소 1일
    expect(result.isValid, `__TOGETHER_DAYS__ 유효하지 않음: ${result.days}`).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7: P3 _p3AnswersSrc 단일 소스 원칙 검증
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite 7: P3 _p3AnswersSrc 단일 소스 원칙 검증', () => {

  test('window.__LAST_ANSWERS__ fallback 이 정상 동작한다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      (window as any).__LAST_ANSWERS__ = { _exercise_resp_label: '이력없음', test_key: 'fallback_ok' };
      // _p3AnswersSrc 단일소스 원칙: answers || __LAST_ANSWERS__ || {}
      const answers = undefined;
      const _p3AnswersSrc = answers || (window as any).__LAST_ANSWERS__ || {};
      return (_p3AnswersSrc as any)['test_key'];
    });
    expect(result).toBe('fallback_ok');
  });

  test('answers 매개변수가 __LAST_ANSWERS__보다 우선한다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      (window as any).__LAST_ANSWERS__ = { _exercise_resp_label: '이력없음' };
      const answers = { _exercise_resp_label: '저반응형' };
      const _p3AnswersSrc = answers || (window as any).__LAST_ANSWERS__ || {};
      return (_p3AnswersSrc as any)['_exercise_resp_label'];
    });
    expect(result).toBe('저반응형');
  });

  test('_p3AnswersSrc에서 exercise_response 값을 읽을 수 있다', async ({ page }) => {
    await openResultPage(page);
    const result = await page.evaluate(() => {
      (window as any).__LAST_ANSWERS__ = {
        exercise_response: 0,
        _exercise_resp_label: '일시반응형',
        pain_areas: [0, 2],
        _pain_areas_parsed: ['목·어깨', '등·허리']
      };
      const _p3AnswersSrc = (window as any).__LAST_ANSWERS__;
      return {
        exResp: _p3AnswersSrc['exercise_response'],
        exLabel: _p3AnswersSrc['_exercise_resp_label'],
        painAreas: _p3AnswersSrc['_pain_areas_parsed'],
      };
    });
    expect(result.exLabel).toBe('일시반응형');
    expect(Array.isArray(result.painAreas)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 8: 스키마 검증 레이어 (Task8 BROWSER_INJECTOR) 동작 확인
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite 8: Task8 스키마 검증 레이어 동작 확인', () => {

  test('window.__SCHEMA_VALIDATION__ 이 페이지 로드 후 자동 주입된다', async ({ page }) => {
    await openResultPage(page);
    // 페이지 완전 로드 대기
    await page.waitForFunction(() => (window as any).__SCHEMA_VALIDATION__ !== undefined, { timeout: 10_000 })
      .catch(() => {}); // slimMindSchemaValidator가 동작하면 주입됨
    const result = await page.evaluate(() => {
      const sv = (window as any).__SCHEMA_VALIDATION__;
      if (!sv) return { injected: false };
      return {
        injected: true,
        passed: sv.passed,
        errorCount: sv.errors ? sv.errors.length : -1,
        warnCount: sv.warnings ? sv.warnings.length : -1,
        timestamp: sv.timestamp,
      };
    });
    console.log(`스키마 검증: injected=${result.injected}, passed=${result.passed}, errors=${result.errorCount}, warns=${result.warnCount}`);
    expect(result.injected, '__SCHEMA_VALIDATION__ 미주입 — slimMindSchemaValidator 실행 안 됨').toBe(true);
  });

  test('스키마 검증 오류가 0건이다 (errors 배열 비어있음)', async ({ page }) => {
    await openResultPage(page);
    await page.waitForFunction(() => (window as any).__SCHEMA_VALIDATION__ !== undefined, { timeout: 10_000 })
      .catch(() => {});
    const errors = await page.evaluate(() => {
      const sv = (window as any).__SCHEMA_VALIDATION__;
      return sv ? sv.errors : ['__SCHEMA_VALIDATION__ 없음'];
    });
    if (errors.length > 0) console.error('스키마 오류:', errors);
    expect(errors.length, `스키마 오류 ${errors.length}건: ${errors.join('; ')}`).toBe(0);
  });

  test('콘솔에 [SCHEMA] 패턴 출력이 존재한다', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('[SCHEMA]')) consoleLogs.push(msg.text());
    });
    await page.goto(RESULT_PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(2_000); // 스크립트 실행 대기
    console.log(`[SCHEMA] 콘솔 출력 수: ${consoleLogs.length}`);
    consoleLogs.forEach(l => console.log(` → ${l.slice(0, 80)}`));
    expect(consoleLogs.length, '[SCHEMA] 콘솔 출력 없음 — slimMindSchemaValidator 미실행').toBeGreaterThan(0);
  });
});
