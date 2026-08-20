import { defineConfig, devices } from 'playwright/test';

/**
 * SlimMind B2B Fitness Platform v4.1
 * Playwright E2E Test Configuration
 *
 * Suite 1~8: 46아형 × 성별 Matrix 검증
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Suite 단위 병렬 실행 */
  fullyParallel: false,
  
  /* 재시도 없음 */
  retries: 0,
  
  /* 단일 워커 (로컠 서버 과부하 방지) */
  workers: 1,

  /* 타임아웃 설정 */
  timeout: 30_000,
  expect: { timeout: 12_000 },

  /* 리포터: HTML + 콘솔 라인 */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['line'],
  ],

  use: {
    /* 이미 실행 중인 서버 사용 */
    baseURL: 'http://localhost:3000',

    /* Chromium headless */
    headless: true,

    /* 스크린샷: 실패 시만 */
    screenshot: 'only-on-failure',

    /* 콘솔 메시지 캡처 */
    trace: 'retain-on-failure',

    /* 뷰포트 */
    viewport: { width: 1280, height: 800 },

    /* 로케일 */
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 서버가 이미 실행 중이므로 webServer 불필요 */
  // webServer: {
  //   command: 'pm2 restart slimmind',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: true,
  // },
});
