# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: aesthetic-salon-runner.spec.ts >> Suite S-1: result-salon.html 라우트 및 전역 변수 >> S-1-2: result-salon.html window.PAIN_GATE 노출
- Location: tests/e2e/aesthetic-salon-runner.spec.ts:69:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]: SLIMMIND
        - generic [ref=e8]: BODYCODE REPORT
      - generic [ref=e9]:
        - generic [ref=e10]: BODYCODE
        - generic [ref=e12]:
          - generic [ref=e13]: 님의
          - generic [ref=e14]: 바디코드리포트
          - generic [ref=e15]: Personal Body Analysis
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e19]: 진단일
            - generic [ref=e20]: 2026년 8월 2일
          - generic [ref=e21]:
            - generic [ref=e22]: 분석 근거
            - generic [ref=e23]: 4단계 정밀 문진 · 88개 응답 · 11축 교차 판정
        - button "목차로 이동" [ref=e24] [cursor=pointer]:
          - generic [ref=e25]: 아래로 넘겨주세요
          - generic [ref=e26]: ⌄
    - generic [ref=e27]:
      - generic [ref=e28]: CONTENTS
      - heading "이 리포트, 이렇게 읽으세요" [level=2] [ref=e29]
      - generic [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]: "1"
          - generic [ref=e33]: 번호 순서대로 읽으면 가장 잘 이해됩니다.
        - generic [ref=e34]:
          - generic [ref=e35]: "2"
          - generic [ref=e36]: 궁금한 챕터를 눌러 바로 이동할 수 있어요.
        - generic [ref=e37]:
          - generic [ref=e38]: "3"
          - generic [ref=e39]: 언제든 상단 ☰ 목차보기로 이 화면에 돌아옵니다.
    - generic [ref=e40]:
      - generic [ref=e41]:
        - generic [ref=e42]: 챕터
        - generic [ref=e43]: 전체 8개
      - button "1 ⌄ 나의 바디코드 남들과 똑같이 해서는 절대 안 빠졌던 진짜 이유 지금 여기" [ref=e44] [cursor=pointer]:
        - generic [ref=e46]:
          - generic [ref=e47]: "1"
          - text: ⌄
        - generic [ref=e48]:
          - generic [ref=e49]: 나의 바디코드
          - text: 남들과 똑같이 해서는 절대 안 빠졌던 진짜 이유
        - generic [ref=e50]: 지금 여기
      - button "2 ⌄ 핵심 처방 이것저것 다 하려다 포기하지 말고, 이것만 하세요 →" [ref=e51] [cursor=pointer]:
        - generic [ref=e53]:
          - generic [ref=e54]: "2"
          - text: ⌄
        - generic [ref=e55]:
          - generic [ref=e56]: 핵심 처방
          - text: 이것저것 다 하려다 포기하지 말고, 이것만 하세요
        - generic [ref=e57]: →
      - button "3 ⌄ 맞춤 비율 남의 비율로 살아온 몸에게 — 11축이 찾아낸 당신의 비율을 처방합니다 →" [ref=e58] [cursor=pointer]:
        - generic [ref=e60]:
          - generic [ref=e61]: "3"
          - text: ⌄
        - generic [ref=e62]:
          - generic [ref=e63]: 맞춤 비율
          - text: 남의 비율로 살아온 몸에게 — 11축이 찾아낸 당신의 비율을 처방합니다
        - generic [ref=e64]: →
      - button "4 ⌄ 12주 로드맵 눈앞에 펼쳐지는 12주 — 첫 4주는 오늘 시작하고, 나머지 8주는 4주 뒤 당신의 변화가 직접 엽니다 →" [ref=e65] [cursor=pointer]:
        - generic [ref=e67]:
          - generic [ref=e68]: "4"
          - text: ⌄
        - generic [ref=e69]:
          - generic [ref=e70]: 12주 로드맵
          - text: 눈앞에 펼쳐지는 12주 — 첫 4주는 오늘 시작하고, 나머지 8주는 4주 뒤 당신의 변화가 직접 엽니다
        - generic [ref=e71]: →
      - button "5 ⌄ 변화 예측 로드맵 솔루션을 완수했을 때 달성 가능한 내 몸 시뮬레이션 →" [ref=e72] [cursor=pointer]:
        - generic [ref=e74]:
          - generic [ref=e75]: "5"
          - text: ⌄
        - generic [ref=e76]:
          - generic [ref=e77]: 변화 예측
          - text: 로드맵 솔루션을 완수했을 때 달성 가능한 내 몸 시뮬레이션
        - generic [ref=e78]: →
      - generic [ref=e79]: 더 깊이 알고 싶다면 · 3개
      - button "6 ⌄ 다이어트 잔혹사 의지 부족이 아닙니다, 몸의 시스템이 잘못 흘러갔을 뿐 →" [ref=e81] [cursor=pointer]:
        - generic [ref=e83]:
          - generic [ref=e84]: "6"
          - text: ⌄
        - generic [ref=e85]:
          - generic [ref=e86]: 다이어트 잔혹사
          - text: 의지 부족이 아닙니다, 몸의 시스템이 잘못 흘러갔을 뿐
        - generic [ref=e87]: →
      - button "7 ⌄ 타고난 기질 나를 알아야 무너지지 않는 평생의 지속 가능함이 완성됩니다 →" [ref=e88] [cursor=pointer]:
        - generic [ref=e90]:
          - generic [ref=e91]: "7"
          - text: ⌄
        - generic [ref=e92]:
          - generic [ref=e93]: 타고난 기질
          - text: 나를 알아야 무너지지 않는 평생의 지속 가능함이 완성됩니다
        - generic [ref=e94]: →
      - button "8 한 장 요약 결과지 전체를 한 장으로 정리하고, 같은 코드를 가진 사람에게 공유합니다 →" [ref=e95] [cursor=pointer]:
        - generic [ref=e97]: "8"
        - generic [ref=e99]:
          - generic [ref=e100]: 한 장 요약
          - text: 결과지 전체를 한 장으로 정리하고, 같은 코드를 가진 사람에게 공유합니다
        - generic [ref=e101]: →
      - generic [ref=e102]: 다 읽으신 뒤 · 매일
      - button "⌄ 오늘 할 일 매일 아침 새로 갱신되는 오늘의 세 가지 · 하루 1분 · 함께한 지 3일째 매일" [ref=e104] [cursor=pointer]:
        - generic [ref=e105]: ⌄
        - generic [ref=e108]:
          - generic [ref=e109]: 오늘 할 일
          - generic [ref=e110]: 매일 아침 새로 갱신되는 오늘의 세 가지 · 하루 1분 · 함께한 지 3일째
        - generic [ref=e111]: 매일
    - button "처음부터 순서대로 읽기 →" [ref=e112] [cursor=pointer]
    - generic [ref=e113]: 각 챕터를 눌러 바로 이동할 수도 있어요
    - generic [ref=e114]: 본 결과지는 전문 의료 진단을 대체하지 않습니다
  - navigation [ref=e115]:
    - button "☰ SLIMMIND ‹ 목차보기" [ref=e116] [cursor=pointer]:
      - generic [ref=e117]:
        - generic [ref=e118]: ☰
        - generic [ref=e119]: SLIMMIND
      - generic [ref=e120]:
        - generic [ref=e121]: ‹
        - text: 목차보기
    - generic [ref=e122]:
      - button "나의 바디코드" [ref=e123] [cursor=pointer]
      - button "핵심 처방" [ref=e129] [cursor=pointer]
      - button "맞춤 비율" [ref=e135] [cursor=pointer]
      - button "12주 로드맵" [ref=e141] [cursor=pointer]
      - button "변화 예측" [ref=e148] [cursor=pointer]
      - button "다이어트 잔혹사" [ref=e154] [cursor=pointer]
      - button "타고난 기질" [ref=e159] [cursor=pointer]
      - button "한 장 요약" [ref=e165] [cursor=pointer]
    - button "오늘" [ref=e173] [cursor=pointer]
  - text: ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓
  - generic:
    - generic:
      - generic:
        - generic:
          - generic: 📝 주차 체크인
          - button "?"
        - button "✕"
      - generic:
        - generic:
          - generic: 💪 활력
          - slider: "5"
          - generic: "5"
        - generic:
          - generic: 공복감
          - slider: "5"
          - generic: "5"
        - generic:
          - generic: 😴 수면질
          - slider: "5"
          - generic: "5"
        - generic:
          - generic: 😊 기분
          - slider: "5"
          - generic: "5"
      - generic:
        - generic:
          - generic: ⚖️ 현재 체중 (kg)
          - 'spinbutton "예: 63.5"'
        - generic:
          - generic: 🥗 식단 지킴 (%)
          - 'spinbutton "예: 80"'
      - generic:
        - generic: 🎫
        - generic:
          - strong: "4주 완주 보상: 재검사 쿠폰 증정"
          - text: 4주 체크인 완료 +
          - strong: 200g 이상 감량
          - text: 달성 시 바디코드
          - strong: 재진단 쿠폰
          - text: 이 지급됩니다 🏆
      - button "✅ 이번 주 체크인 저장"
  - generic:
    - generic:
      - generic:
        - generic: 🧬 내 BC DNA 카드
        - button "✕"
      - generic:
        - button "🌌 오로라"
        - button "선셋"
        - button "🌊 민트"
      - generic:
        - button "📤 저장·공유하기"
        - button "💾 이미지 저장"
  - dialog "공유 방법 선택":
    - generic:
      - generic: 결과 공유하기
      - generic: 바디코드 결과를 공유해요
      - generic:
        - button "💬 카카오톡 공유":
          - generic: 💬
          - text: 카카오톡 공유
        - button "🖼 이미지 저장":
          - generic: 🖼
          - text: 이미지 저장
        - button "링크 복사"
        - button "📤 더 보내기":
          - generic: 📤
          - text: 더 보내기
      - button "닫기"
  - status: 링크가 복사되었어요!
  - generic [ref=e180]:
    - button "실시간 응답" [ref=e181] [cursor=pointer]
    - button "배경음악" [ref=e184] [cursor=pointer]
    - button "결과 공유하기" [ref=e189] [cursor=pointer]
  - generic [ref=e195]:
    - generic [ref=e196]: 📋
    - generic [ref=e197]: 결과지를 준비하고 있어요
    - generic [ref=e198]: 설문이 완료되면 담당 컨설턴트가 결과지를 발송합니다.링크가 있다면 다시 확인해 주세요.
    - button "이전으로 돌아가기" [ref=e199] [cursor=pointer]
  - generic [ref=e201]:
    - generic [ref=e202]: 🖥️ 바탕화면 앱으로 저장
    - generic [ref=e203]: 슬림마인드 결과지를 바탕화면에서 바로 열 수 있어요.
    - generic [ref=e204]:
      - generic [ref=e205]: "1"
      - generic [ref=e206]: Chrome 오른쪽 상단 ⋮ 메뉴를 클릭하세요
    - generic [ref=e207]:
      - generic [ref=e208]: "2"
      - generic [ref=e209]: "[저장 및 공유] → [바탕화면에 바로가기 만들기]를 클릭하세요"
    - generic [ref=e210]:
      - generic [ref=e211]: "3"
      - generic [ref=e212]: "[만들기]를 클릭하면 바탕화면에 아이콘이 생성됩니다"
    - button "닫기" [ref=e213] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from 'playwright/test';
  2   | 
  3   | const BASE_URL = 'http://localhost:3000';
  4   | 
  5   | // ── 에스테틱 전역 게이트 검증 (AE-Task2~5) ────────────────────────────────
  6   | test.describe('Suite AE-1: aesthetic.html 전역 변수 노출', () => {
  7   |   test('AE-1-1: window.PAIN_GATE 전역 노출 (에스테틱)', async ({ page }) => {
  8   |     await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
  9   |     await page.waitForTimeout(3000);
  10  |     const hasPainGate = await page.evaluate(() => typeof window.PAIN_GATE !== 'undefined');
  11  |     expect(hasPainGate).toBe(true);
  12  |   });
  13  | 
  14  |   test('AE-1-2: window.GOLDEN_TIME_MAP 전역 노출 (에스테틱)', async ({ page }) => {
  15  |     await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
  16  |     await page.waitForTimeout(3000);
  17  |     const hasGoldenMap = await page.evaluate(() => typeof window.GOLDEN_TIME_MAP !== 'undefined');
  18  |     expect(hasGoldenMap).toBe(true);
  19  |   });
  20  | 
  21  |   test('AE-1-3: window.EXERCISE_RESPONSE_OPTIONS 전역 노출 (에스테틱)', async ({ page }) => {
  22  |     await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
  23  |     await page.waitForTimeout(3000);
  24  |     const hasExOpts = await page.evaluate(() => typeof window.EXERCISE_RESPONSE_OPTIONS !== 'undefined');
  25  |     expect(hasExOpts).toBe(true);
  26  |   });
  27  | 
  28  |   test('AE-1-4: PAIN_GATE 키 구조 검증 (에스테틱)', async ({ page }) => {
  29  |     await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
  30  |     await page.waitForTimeout(3000);
  31  |     const pgKeys = await page.evaluate(() =>
  32  |       typeof window.PAIN_GATE !== 'undefined' ? Object.keys(window.PAIN_GATE) : []
  33  |     );
  34  |     expect(pgKeys.length).toBeGreaterThan(0);
  35  |   });
  36  | 
  37  |   test('AE-1-5: GOLDEN_TIME_MAP 인덱스 0~5 존재 (에스테틱)', async ({ page }) => {
  38  |     await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
  39  |     await page.waitForTimeout(3000);
  40  |     const gmValid = await page.evaluate(() => {
  41  |       if (typeof window.GOLDEN_TIME_MAP === 'undefined') return false;
  42  |       for (let i = 0; i <= 5; i++) {
  43  |         if (!window.GOLDEN_TIME_MAP[i] || window.GOLDEN_TIME_MAP[i].length < 10) return false;
  44  |       }
  45  |       return true;
  46  |     });
  47  |     expect(gmValid).toBe(true);
  48  |   });
  49  | 
  50  |   test('AE-1-6: EXERCISE_RESPONSE_OPTIONS 7가지 키 존재 (에스테틱)', async ({ page }) => {
  51  |     await page.goto(`${BASE_URL}/result-aesthetic/DEMO`, { waitUntil: 'domcontentloaded' });
  52  |     await page.waitForTimeout(3000);
  53  |     const erKeys = await page.evaluate(() =>
  54  |       typeof window.EXERCISE_RESPONSE_OPTIONS !== 'undefined'
  55  |         ? Object.keys(window.EXERCISE_RESPONSE_OPTIONS)
  56  |         : []
  57  |     );
  58  |     expect(erKeys.length).toBe(7);
  59  |   });
  60  | });
  61  | 
  62  | // ── 살롱 결과지 라우트 검증 ─────────────────────────────────────────────
  63  | test.describe('Suite S-1: result-salon.html 라우트 및 전역 변수', () => {
  64  |   test('S-1-1: /result-salon/DEMO 라우트 200 응답', async ({ page }) => {
  65  |     const response = await page.goto(`${BASE_URL}/result-salon/DEMO`);
  66  |     expect(response?.status()).toBeLessThan(500);
  67  |   });
  68  | 
  69  |   test('S-1-2: result-salon.html window.PAIN_GATE 노출', async ({ page }) => {
  70  |     await page.goto(`${BASE_URL}/result-salon/DEMO`, { waitUntil: 'domcontentloaded' });
  71  |     await page.waitForTimeout(3000);
  72  |     const hasPainGate = await page.evaluate(() => typeof window.PAIN_GATE !== 'undefined');
> 73  |     expect(hasPainGate).toBe(true);
      |                         ^ Error: expect(received).toBe(expected) // Object.is equality
  74  |   });
  75  | 
  76  |   test('S-1-3: result-salon.html window.GOLDEN_TIME_MAP 노출', async ({ page }) => {
  77  |     await page.goto(`${BASE_URL}/result-salon/DEMO`, { waitUntil: 'domcontentloaded' });
  78  |     await page.waitForTimeout(3000);
  79  |     const hasGTM = await page.evaluate(() => typeof window.GOLDEN_TIME_MAP !== 'undefined');
  80  |     expect(hasGTM).toBe(true);
  81  |   });
  82  | 
  83  |   test('S-1-4: result-salon.html window.EXERCISE_RESPONSE_OPTIONS 노출', async ({ page }) => {
  84  |     await page.goto(`${BASE_URL}/result-salon/DEMO`, { waitUntil: 'domcontentloaded' });
  85  |     await page.waitForTimeout(3000);
  86  |     const hasERO = await page.evaluate(() => typeof window.EXERCISE_RESPONSE_OPTIONS !== 'undefined');
  87  |     expect(hasERO).toBe(true);
  88  |   });
  89  | 
  90  |   test('S-1-5: /api/s/result/NONEXISTENT → 404 JSON', async ({ page }) => {
  91  |     const response = await page.goto(`${BASE_URL}/api/s/result/S-NONEXISTENT`);
  92  |     expect([404, 200]).toContain(response?.status());
  93  |   });
  94  | 
  95  |   test('S-1-6: /api/s/result API 헬스체크 (DB 연결 확인)', async ({ page }) => {
  96  |     const response = await page.goto(`${BASE_URL}/api/s/result/S-TEST`);
  97  |     const status = response?.status() ?? 500;
  98  |     // 404(미발견) or 500(DB 없음) 모두 허용 — 연결 자체가 성공이면 OK
  99  |     expect(status).not.toBe(0);
  100 |   });
  101 | });
  102 | 
  103 | // ── 살롱/에스테틱 API 엔드포인트 헬스체크 ────────────────────────────────
  104 | test.describe('Suite S-2: 살롱/에스테틱 API 엔드포인트 헬스체크', () => {
  105 |   test('S-2-1: GET /api/a/result/:id 엔드포인트 응답 확인', async ({ page }) => {
  106 |     const response = await page.goto(`${BASE_URL}/api/a/result/A-TEST`);
  107 |     const status = response?.status() ?? 500;
  108 |     expect([200, 404, 500]).toContain(status);
  109 |   });
  110 | 
  111 |   test('S-2-2: GET /api/s/result/:id 엔드포인트 응답 확인', async ({ page }) => {
  112 |     const response = await page.goto(`${BASE_URL}/api/s/result/S-TEST`);
  113 |     const status = response?.status() ?? 500;
  114 |     expect([200, 404, 500]).toContain(status);
  115 |   });
  116 | 
  117 |   test('S-2-3: GET /api/s/programs 엔드포인트 응답 확인', async ({ page }) => {
  118 |     const response = await page.goto(`${BASE_URL}/api/s/programs?b2b_code=TEST`);
  119 |     const status = response?.status() ?? 500;
  120 |     expect([200, 404, 500]).toContain(status);
  121 |   });
  122 | 
  123 |   test('S-2-4: result-salon.html __HOSPITAL_RESULT_ID__ 서버 주입 확인', async ({ page }) => {
  124 |     await page.goto(`${BASE_URL}/result-salon/S-TEST-001`, { waitUntil: 'domcontentloaded' });
  125 |     const hid = await page.evaluate(() => (window as any).__HOSPITAL_RESULT_ID__);
  126 |     expect(hid).toBe('S-TEST-001');
  127 |   });
  128 | 
  129 |   test('S-2-5: admin.html 피트니스 라디오버튼 존재 확인', async ({ page }) => {
  130 |     await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
  131 |     const fitnessRadio = await page.locator('input[name="b2b_survey_category"][value="fitness"]').count();
  132 |     expect(fitnessRadio).toBe(1);
  133 |   });
  134 | 
  135 |   test('S-2-6: admin.html 피트니스 라디오버튼 텍스트 확인', async ({ page }) => {
  136 |     await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
  137 |     const fitnessLabel = await page.locator('#cat-label-fitness').count();
  138 |     expect(fitnessLabel).toBe(1);
  139 |   });
  140 | });
  141 | 
```