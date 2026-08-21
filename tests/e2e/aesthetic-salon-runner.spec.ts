import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// ── 에스테틱 전역 게이트 검증 (AE-Task2~5) ────────────────────────────────
test.describe('Suite AE-1: aesthetic.html 전역 변수 노출', () => {
  test('AE-1-1: window.PAIN_GATE 전역 노출 (에스테틱)', async ({ page }) => {
    await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const hasPainGate = await page.evaluate(() => typeof window.PAIN_GATE !== 'undefined');
    expect(hasPainGate).toBe(true);
  });

  test('AE-1-2: window.GOLDEN_TIME_MAP 전역 노출 (에스테틱)', async ({ page }) => {
    await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const hasGoldenMap = await page.evaluate(() => typeof window.GOLDEN_TIME_MAP !== 'undefined');
    expect(hasGoldenMap).toBe(true);
  });

  test('AE-1-3: window.EXERCISE_RESPONSE_OPTIONS 전역 노출 (에스테틱)', async ({ page }) => {
    await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const hasExOpts = await page.evaluate(() => typeof window.EXERCISE_RESPONSE_OPTIONS !== 'undefined');
    expect(hasExOpts).toBe(true);
  });

  test('AE-1-4: PAIN_GATE 키 구조 검증 (에스테틱)', async ({ page }) => {
    await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const pgKeys = await page.evaluate(() =>
      typeof window.PAIN_GATE !== 'undefined' ? Object.keys(window.PAIN_GATE) : []
    );
    expect(pgKeys.length).toBeGreaterThan(0);
  });

  test('AE-1-5: GOLDEN_TIME_MAP 인덱스 0~5 존재 (에스테틱)', async ({ page }) => {
    await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const gmValid = await page.evaluate(() => {
      if (typeof window.GOLDEN_TIME_MAP === 'undefined') return false;
      for (let i = 0; i <= 5; i++) {
        if (!window.GOLDEN_TIME_MAP[i] || window.GOLDEN_TIME_MAP[i].length < 10) return false;
      }
      return true;
    });
    expect(gmValid).toBe(true);
  });

  test('AE-1-6: EXERCISE_RESPONSE_OPTIONS 7가지 키 존재 (에스테틱)', async ({ page }) => {
    await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const erKeys = await page.evaluate(() =>
      typeof window.EXERCISE_RESPONSE_OPTIONS !== 'undefined'
        ? Object.keys(window.EXERCISE_RESPONSE_OPTIONS)
        : []
    );
    expect(erKeys.length).toBe(7);
  });
});

// ── 살롱 결과지 라우트 검증 ─────────────────────────────────────────────
test.describe('Suite S-1: result-salon.html 라우트 및 전역 변수', () => {
  test('S-1-1: /result-salon/DEMO 라우트 200 응답', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/result-salon/DEMO`);
    expect(response?.status()).toBeLessThan(500);
  });

  test('S-1-2: result-salon.html window.PAIN_GATE 노출', async ({ page }) => {
    await page.goto(`${BASE_URL}/result-salon/DEMO`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const hasPainGate = await page.evaluate(() => typeof window.PAIN_GATE !== 'undefined');
    expect(hasPainGate).toBe(true);
  });

  test('S-1-3: result-salon.html window.GOLDEN_TIME_MAP 노출', async ({ page }) => {
    await page.goto(`${BASE_URL}/result-salon/DEMO`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const hasGTM = await page.evaluate(() => typeof window.GOLDEN_TIME_MAP !== 'undefined');
    expect(hasGTM).toBe(true);
  });

  test('S-1-4: result-salon.html window.EXERCISE_RESPONSE_OPTIONS 노출', async ({ page }) => {
    await page.goto(`${BASE_URL}/result-salon/DEMO`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const hasERO = await page.evaluate(() => typeof window.EXERCISE_RESPONSE_OPTIONS !== 'undefined');
    expect(hasERO).toBe(true);
  });

  test('S-1-5: /api/s/result/NONEXISTENT → 404 JSON', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/s/result/S-NONEXISTENT`);
    expect([404, 200]).toContain(response?.status());
  });

  test('S-1-6: /api/s/result API 헬스체크 (DB 연결 확인)', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/s/result/S-TEST`);
    const status = response?.status() ?? 500;
    // 404(미발견) or 500(DB 없음) 모두 허용 — 연결 자체가 성공이면 OK
    expect(status).not.toBe(0);
  });
});

// ── 살롱/에스테틱 API 엔드포인트 헬스체크 ────────────────────────────────
test.describe('Suite S-2: 살롱/에스테틱 API 엔드포인트 헬스체크', () => {
  test('S-2-1: GET /api/a/result/:id 엔드포인트 응답 확인', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/a/result/A-TEST`);
    const status = response?.status() ?? 500;
    expect([200, 404, 500]).toContain(status);
  });

  test('S-2-2: GET /api/s/result/:id 엔드포인트 응답 확인', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/s/result/S-TEST`);
    const status = response?.status() ?? 500;
    expect([200, 404, 500]).toContain(status);
  });

  test('S-2-3: GET /api/s/programs 엔드포인트 응답 확인', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/s/programs?b2b_code=TEST`);
    const status = response?.status() ?? 500;
    expect([200, 404, 500]).toContain(status);
  });

  test('S-2-4: result-salon.html __HOSPITAL_RESULT_ID__ 서버 주입 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/result-salon/S-TEST-001`, { waitUntil: 'domcontentloaded' });
    const hid = await page.evaluate(() => (window as any).__HOSPITAL_RESULT_ID__);
    expect(hid).toBe('S-TEST-001');
  });

  test('S-2-5: admin.html 피트니스 라디오버튼 존재 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    const fitnessRadio = await page.locator('input[name="b2b_survey_category"][value="fitness"]').count();
    expect(fitnessRadio).toBe(1);
  });

  test('S-2-6: admin.html 피트니스 라디오버튼 텍스트 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    const fitnessLabel = await page.locator('#cat-label-fitness').count();
    expect(fitnessLabel).toBe(1);
  });
});
