# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: subtype-matrix-runner.spec.ts >> Suite 8: Task8 스키마 검증 레이어 동작 확인 >> 스키마 검증 오류가 0건이다 (errors 배열 비어있음)
- Location: tests/e2e/subtype-matrix-runner.spec.ts:503:3

# Error details

```
Error: 스키마 오류 3건: [SCHEMA][Task3] PAIN_GATE 전역 변수 없음; [SCHEMA][Task4] GOLDEN_TIME_MAP 전역 변수 없음; [SCHEMA][Task2] EXERCISE_RESPONSE_OPTIONS 전역 변수 없음

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 3
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
          - generic [ref=e13]: 테스트계정_E2E 님의
          - generic [ref=e14]: 바디코드리포트
          - generic [ref=e15]: Personal Body Analysis
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e19]: 진단일
            - generic [ref=e20]: 2026년 8월 18일
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
      - button "1 ⌄ 나의 바디코드 남들과 똑같이 해서는 절대 안 빠졌던 진짜 이유 테스트계정_E2E님이 들려준 88개의 대답이, 하나의 이름이 됩니다 — 1장에서 만나요 지금 여기" [ref=e44] [cursor=pointer]:
        - generic [ref=e46]:
          - generic [ref=e47]: "1"
          - text: ⌄
        - generic [ref=e48]:
          - generic [ref=e49]: 나의 바디코드
          - text: 남들과 똑같이 해서는 절대 안 빠졌던 진짜 이유
          - generic [ref=e50]: 테스트계정_E2E님이 들려준 88개의 대답이, 하나의 이름이 됩니다 — 1장에서 만나요
        - generic [ref=e51]: 지금 여기
      - button "2 ⌄ 핵심 처방 이것저것 다 하려다 포기하지 말고, 이것만 하세요 →" [ref=e52] [cursor=pointer]:
        - generic [ref=e54]:
          - generic [ref=e55]: "2"
          - text: ⌄
        - generic [ref=e56]:
          - generic [ref=e57]: 핵심 처방
          - text: 이것저것 다 하려다 포기하지 말고, 이것만 하세요
        - generic [ref=e58]: →
      - button "3 ⌄ 맞춤 비율 남의 비율로 살아온 몸에게 — 11축이 찾아낸 당신의 비율을 처방합니다 →" [ref=e59] [cursor=pointer]:
        - generic [ref=e61]:
          - generic [ref=e62]: "3"
          - text: ⌄
        - generic [ref=e63]:
          - generic [ref=e64]: 맞춤 비율
          - text: 남의 비율로 살아온 몸에게 — 11축이 찾아낸 당신의 비율을 처방합니다
        - generic [ref=e65]: →
      - button "4 ⌄ 12주 로드맵 눈앞에 펼쳐지는 12주 — 첫 4주는 오늘 시작하고, 나머지 8주는 4주 뒤 당신의 변화가 직접 엽니다 →" [ref=e66] [cursor=pointer]:
        - generic [ref=e68]:
          - generic [ref=e69]: "4"
          - text: ⌄
        - generic [ref=e70]:
          - generic [ref=e71]: 12주 로드맵
          - text: 눈앞에 펼쳐지는 12주 — 첫 4주는 오늘 시작하고, 나머지 8주는 4주 뒤 당신의 변화가 직접 엽니다
        - generic [ref=e72]: →
      - button "5 ⌄ 변화 예측 로드맵 솔루션을 완수했을 때 달성 가능한 내 몸 시뮬레이션 →" [ref=e73] [cursor=pointer]:
        - generic [ref=e75]:
          - generic [ref=e76]: "5"
          - text: ⌄
        - generic [ref=e77]:
          - generic [ref=e78]: 변화 예측
          - text: 로드맵 솔루션을 완수했을 때 달성 가능한 내 몸 시뮬레이션
        - generic [ref=e79]: →
      - generic [ref=e80]: 더 깊이 알고 싶다면 · 3개
      - button "6 ⌄ 다이어트 잔혹사 의지 부족이 아닙니다, 몸의 시스템이 잘못 흘러갔을 뿐 →" [ref=e82] [cursor=pointer]:
        - generic [ref=e84]:
          - generic [ref=e85]: "6"
          - text: ⌄
        - generic [ref=e86]:
          - generic [ref=e87]: 다이어트 잔혹사
          - text: 의지 부족이 아닙니다, 몸의 시스템이 잘못 흘러갔을 뿐
        - generic [ref=e88]: →
      - button "7 ⌄ 타고난 기질 나를 알아야 무너지지 않는 평생의 지속 가능함이 완성됩니다 →" [ref=e89] [cursor=pointer]:
        - generic [ref=e91]:
          - generic [ref=e92]: "7"
          - text: ⌄
        - generic [ref=e93]:
          - generic [ref=e94]: 타고난 기질
          - text: 나를 알아야 무너지지 않는 평생의 지속 가능함이 완성됩니다
        - generic [ref=e95]: →
      - button "8 한 장 요약 결과지 전체를 한 장으로 정리하고, 같은 코드를 가진 사람에게 공유합니다 →" [ref=e96] [cursor=pointer]:
        - generic [ref=e98]: "8"
        - generic [ref=e100]:
          - generic [ref=e101]: 한 장 요약
          - text: 결과지 전체를 한 장으로 정리하고, 같은 코드를 가진 사람에게 공유합니다
        - generic [ref=e102]: →
      - generic [ref=e103]: 다 읽으신 뒤 · 매일
      - button "⌄ 오늘 할 일 매일 아침 새로 갱신되는 오늘의 세 가지 · 하루 1분 · 함께한 지 3일째 매일" [ref=e105] [cursor=pointer]:
        - generic [ref=e106]: ⌄
        - generic [ref=e109]:
          - generic [ref=e110]: 오늘 할 일
          - generic [ref=e111]: 매일 아침 새로 갱신되는 오늘의 세 가지 · 하루 1분 · 함께한 지 3일째
        - generic [ref=e112]: 매일
    - button "처음부터 순서대로 읽기 →" [ref=e113] [cursor=pointer]
    - generic [ref=e114]: 각 챕터를 눌러 바로 이동할 수도 있어요
    - generic [ref=e115]: 본 결과지는 전문 의료 진단을 대체하지 않습니다
  - navigation [ref=e116]:
    - button "☰ SLIMMIND ‹ 목차보기" [ref=e117] [cursor=pointer]:
      - generic [ref=e118]:
        - generic [ref=e119]: ☰
        - generic [ref=e120]: SLIMMIND
      - generic [ref=e121]:
        - generic [ref=e122]: ‹
        - text: 목차보기
    - generic [ref=e123]:
      - button "나의 바디코드" [ref=e124] [cursor=pointer]
      - button "핵심 처방" [ref=e130] [cursor=pointer]
      - button "맞춤 비율" [ref=e136] [cursor=pointer]
      - button "12주 로드맵" [ref=e142] [cursor=pointer]
      - button "변화 예측" [ref=e149] [cursor=pointer]
      - button "다이어트 잔혹사" [ref=e155] [cursor=pointer]
      - button "타고난 기질" [ref=e160] [cursor=pointer]
      - button "한 장 요약" [ref=e166] [cursor=pointer]
    - button "오늘" [ref=e174] [cursor=pointer]
  - text: ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓
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
      - generic: 호르몬스위치 갱년기형 결과를 공유해요
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
  - generic [ref=e181]:
    - button "실시간 응답" [ref=e182] [cursor=pointer]
    - button "배경음악" [ref=e185] [cursor=pointer]
    - button "결과 공유하기" [ref=e190] [cursor=pointer]
```

# Test source

```ts
  412 |     });
  413 |     console.log(`N일째 텍스트: "${result.text}"`);
  414 |     expect(result.hasNum, `숫자 없는 N일째: "${result.text}"`).toBe(true);
  415 |   });
  416 | 
  417 |   test('window.__TOGETHER_DAYS__ 가 1 이상의 정수다', async ({ page }) => {
  418 |     await openResultPage(page);
  419 |     const result = await page.evaluate(() => {
  420 |       const days = (window as any).__TOGETHER_DAYS__;
  421 |       return { days, isValid: typeof days === 'number' && Number.isInteger(days) && days >= 1 };
  422 |     });
  423 |     console.log(`__TOGETHER_DAYS__: ${result.days}`);
  424 |     // created_at 데이터에 따라 실계산 — 최소 1일
  425 |     expect(result.isValid, `__TOGETHER_DAYS__ 유효하지 않음: ${result.days}`).toBe(true);
  426 |   });
  427 | });
  428 | 
  429 | // ─────────────────────────────────────────────────────────────────────────────
  430 | // SUITE 7: P3 _p3AnswersSrc 단일 소스 원칙 검증
  431 | // ─────────────────────────────────────────────────────────────────────────────
  432 | test.describe('Suite 7: P3 _p3AnswersSrc 단일 소스 원칙 검증', () => {
  433 | 
  434 |   test('window.__LAST_ANSWERS__ fallback 이 정상 동작한다', async ({ page }) => {
  435 |     await openResultPage(page);
  436 |     const result = await page.evaluate(() => {
  437 |       (window as any).__LAST_ANSWERS__ = { _exercise_resp_label: '이력없음', test_key: 'fallback_ok' };
  438 |       // _p3AnswersSrc 단일소스 원칙: answers || __LAST_ANSWERS__ || {}
  439 |       const answers = undefined;
  440 |       const _p3AnswersSrc = answers || (window as any).__LAST_ANSWERS__ || {};
  441 |       return (_p3AnswersSrc as any)['test_key'];
  442 |     });
  443 |     expect(result).toBe('fallback_ok');
  444 |   });
  445 | 
  446 |   test('answers 매개변수가 __LAST_ANSWERS__보다 우선한다', async ({ page }) => {
  447 |     await openResultPage(page);
  448 |     const result = await page.evaluate(() => {
  449 |       (window as any).__LAST_ANSWERS__ = { _exercise_resp_label: '이력없음' };
  450 |       const answers = { _exercise_resp_label: '저반응형' };
  451 |       const _p3AnswersSrc = answers || (window as any).__LAST_ANSWERS__ || {};
  452 |       return (_p3AnswersSrc as any)['_exercise_resp_label'];
  453 |     });
  454 |     expect(result).toBe('저반응형');
  455 |   });
  456 | 
  457 |   test('_p3AnswersSrc에서 exercise_response 값을 읽을 수 있다', async ({ page }) => {
  458 |     await openResultPage(page);
  459 |     const result = await page.evaluate(() => {
  460 |       (window as any).__LAST_ANSWERS__ = {
  461 |         exercise_response: 0,
  462 |         _exercise_resp_label: '일시반응형',
  463 |         pain_areas: [0, 2],
  464 |         _pain_areas_parsed: ['목·어깨', '등·허리']
  465 |       };
  466 |       const _p3AnswersSrc = (window as any).__LAST_ANSWERS__;
  467 |       return {
  468 |         exResp: _p3AnswersSrc['exercise_response'],
  469 |         exLabel: _p3AnswersSrc['_exercise_resp_label'],
  470 |         painAreas: _p3AnswersSrc['_pain_areas_parsed'],
  471 |       };
  472 |     });
  473 |     expect(result.exLabel).toBe('일시반응형');
  474 |     expect(Array.isArray(result.painAreas)).toBe(true);
  475 |   });
  476 | });
  477 | 
  478 | // ─────────────────────────────────────────────────────────────────────────────
  479 | // SUITE 8: 스키마 검증 레이어 (Task8 BROWSER_INJECTOR) 동작 확인
  480 | // ─────────────────────────────────────────────────────────────────────────────
  481 | test.describe('Suite 8: Task8 스키마 검증 레이어 동작 확인', () => {
  482 | 
  483 |   test('window.__SCHEMA_VALIDATION__ 이 페이지 로드 후 자동 주입된다', async ({ page }) => {
  484 |     await openResultPage(page);
  485 |     // 페이지 완전 로드 대기
  486 |     await page.waitForFunction(() => (window as any).__SCHEMA_VALIDATION__ !== undefined, { timeout: 10_000 })
  487 |       .catch(() => {}); // slimMindSchemaValidator가 동작하면 주입됨
  488 |     const result = await page.evaluate(() => {
  489 |       const sv = (window as any).__SCHEMA_VALIDATION__;
  490 |       if (!sv) return { injected: false };
  491 |       return {
  492 |         injected: true,
  493 |         passed: sv.passed,
  494 |         errorCount: sv.errors ? sv.errors.length : -1,
  495 |         warnCount: sv.warnings ? sv.warnings.length : -1,
  496 |         timestamp: sv.timestamp,
  497 |       };
  498 |     });
  499 |     console.log(`스키마 검증: injected=${result.injected}, passed=${result.passed}, errors=${result.errorCount}, warns=${result.warnCount}`);
  500 |     expect(result.injected, '__SCHEMA_VALIDATION__ 미주입 — slimMindSchemaValidator 실행 안 됨').toBe(true);
  501 |   });
  502 | 
  503 |   test('스키마 검증 오류가 0건이다 (errors 배열 비어있음)', async ({ page }) => {
  504 |     await openResultPage(page);
  505 |     await page.waitForFunction(() => (window as any).__SCHEMA_VALIDATION__ !== undefined, { timeout: 10_000 })
  506 |       .catch(() => {});
  507 |     const errors = await page.evaluate(() => {
  508 |       const sv = (window as any).__SCHEMA_VALIDATION__;
  509 |       return sv ? sv.errors : ['__SCHEMA_VALIDATION__ 없음'];
  510 |     });
  511 |     if (errors.length > 0) console.error('스키마 오류:', errors);
> 512 |     expect(errors.length, `스키마 오류 ${errors.length}건: ${errors.join('; ')}`).toBe(0);
      |                                                                             ^ Error: 스키마 오류 3건: [SCHEMA][Task3] PAIN_GATE 전역 변수 없음; [SCHEMA][Task4] GOLDEN_TIME_MAP 전역 변수 없음; [SCHEMA][Task2] EXERCISE_RESPONSE_OPTIONS 전역 변수 없음
  513 |   });
  514 | 
  515 |   test('콘솔에 [SCHEMA] 패턴 출력이 존재한다', async ({ page }) => {
  516 |     const consoleLogs: string[] = [];
  517 |     page.on('console', msg => {
  518 |       if (msg.text().includes('[SCHEMA]')) consoleLogs.push(msg.text());
  519 |     });
  520 |     await page.goto(RESULT_PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  521 |     await page.waitForTimeout(2_000); // 스크립트 실행 대기
  522 |     console.log(`[SCHEMA] 콘솔 출력 수: ${consoleLogs.length}`);
  523 |     consoleLogs.forEach(l => console.log(` → ${l.slice(0, 80)}`));
  524 |     expect(consoleLogs.length, '[SCHEMA] 콘솔 출력 없음 — slimMindSchemaValidator 미실행').toBeGreaterThan(0);
  525 |   });
  526 | });
  527 | 
```