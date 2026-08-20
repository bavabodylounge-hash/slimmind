# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: subtype-matrix-runner.spec.ts >> Suite 1: SUBTYPE_NARR 86벌 완전성 검증 >> 공통아형 40개 _남 키 배치 검증
- Location: tests/e2e/subtype-matrix-runner.spec.ts:125:3

# Error details

```
Error: 누락된 _남 키: 식후졸음 혈당롤러코스터형_남, 약물유발 수분축적형_남, 코르티솔 야식부엉이형_남, 식욕억제제 포만감리셋형_남, 말벅지형_남, 승마살형_남, 하지정맥 부종형_남, 사이클링 하체비대형_남, 라운드숄더 등살형_남, 앞벅지 코어부재형_남, 거북목 경추압박형_남, 하지 림프정체형_남, 냉증·말초순환저하형_남, 갱년기 호르몬스위치형_남, 출산후 호르몬격변형_남, 갱년기 대사전환형_남, 장내세균 불균형형_남, 복부팽만 가스형_남, 근감소성 마른비만형_남, 스테로이드 근손실형_남, 다이어트반복형_남, 골반전방경사 허리통증형_남, 척추측만 체형불균형형_남, 감정식이 폭식형_남, 야식증후군형_남, 저탄수 반동폭식형_남, 지방간 대사증후군형_남, 인슐린저항성 당전단계형_남, 계획표완벽주의형_남, 즉흥폭식자유형_남, 수면무호흡 야간비만형_남, 수분부족 부종형_남, 스트레스 코르티솔집중형_남, 빈혈·철결핍 피로비만형_남, 갑상선기능저하형_남, 다낭성난소증후군(PCOS)형_남, 고혈압·항응고제형_남, 기저대사저하형_남

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 38
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
  39  |   '근감소성 마른비만형', '스테로이드 근손실형',
  40  |   // 재발·요요계
  41  |   '물만마셔도요요형', '다이어트반복형',
  42  |   // 체형·골격계
  43  |   '골반전방경사 허리통증형', '척추측만 체형불균형형',
  44  |   // 심리·식이계
  45  |   '감정식이 폭식형', '야식증후군형', '저탄수 반동폭식형',
  46  |   // 대사위험계
  47  |   '지방간 대사증후군형', '인슐린저항성 당전단계형',
  48  |   // 기질·성향계
  49  |   '계획표완벽주의형', '즉흥폭식자유형',
  50  |   // 기타
  51  |   '수면무호흡 야간비만형', '수분부족 부종형', '스트레스 코르티솔집중형',
  52  |   '빈혈·철결핍 피로비만형', '갑상선기능저하형', '다낭성난소증후군(PCOS)형',
  53  |   '고혈압·항응고제형', '기저대사저하형',
  54  | ];
  55  | 
  56  | // 여성 전용 (남성 키 없음)
  57  | const FEMALE_ONLY = ['털털한 PCOS형', '출산후 바람빠진 풍선형', '겨드랑이 부유방형'];
  58  | // 남성 전용 (여성 키 없음)
  59  | const MALE_ONLY   = ['복압 빠진 맥주배형', '가슴 아래 접히는 흉부 정체형', '배부터 무너지는 남성 호르몬 저하형'];
  60  | 
  61  | // ─────────────────────────────────────────────────────────────────────────────
  62  | // 실제 서빙 경로: /result-hospital/:id (DB 레코드 필요)
  63  | // 로컬 DB 시드 ID 사용 (wrangler d1 execute로 확인된 레코드)
  64  | // ─────────────────────────────────────────────────────────────────────────────
  65  | const BASE_URL = 'http://localhost:3000';
  66  | const DEMO_RESULT_ID = 'H-1787063144119-NYDBC';
  67  | const RESULT_PAGE_URL = `${BASE_URL}/result-hospital/${DEMO_RESULT_ID}`;
  68  | 
  69  | // ─────────────────────────────────────────────────────────────────────────────
  70  | // Helper: result-hospital.html을 JS 평가 모드로 열기 (페이지 재사용 최적화)
  71  | // ─────────────────────────────────────────────────────────────────────────────
  72  | let _pageLoaded = false;
  73  | 
  74  | async function openResultPage(page: Page, overrides: Record<string, unknown> = {}): Promise<void> {
  75  |   // 페이지가 이미 열려 있으면 재이동 생략
  76  |   const currentUrl = page.url();
  77  |   if (!currentUrl.includes('/result-hospital/')) {
  78  |     await page.goto(RESULT_PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  79  |   }
  80  | 
  81  |   // 테스트 오버라이드가 있을 경우 __SM_DATA__ 덮어쓰기
  82  |   if (Object.keys(overrides).length > 0) {
  83  |     await page.evaluate((data) => {
  84  |       const existing = (window as any).__SM_DATA__ || {};
  85  |       (window as any).__SM_DATA__ = Object.assign(existing, data);
  86  |     }, overrides);
  87  |   }
  88  | }
  89  | 
  90  | // ─────────────────────────────────────────────────────────────────────────────
  91  | // SUITE 1: SUBTYPE_NARR 사전 완전성 검증 (배치 — 페이지 1회 로드)
  92  | // ─────────────────────────────────────────────────────────────────────────────
  93  | test.describe('Suite 1: SUBTYPE_NARR 86벌 완전성 검증', () => {
  94  | 
  95  |   test('SUBTYPE_NARR 사전이 전역에 존재하고 86개 키를 포함한다', async ({ page }) => {
  96  |     await openResultPage(page);
  97  |     const result = await page.evaluate(() => {
  98  |       const d = (window as any).SUBTYPE_NARR;
  99  |       if (!d) return { exists: false, count: 0, missingFemale: [] as string[], missingMale: [] as string[] };
  100 |       return { exists: true, count: Object.keys(d).length, missingFemale: [] as string[], missingMale: [] as string[] };
  101 |     });
  102 |     console.log(`SUBTYPE_NARR 사전: ${result.exists ? '존재' : '없음'}, 키 수: ${result.count}`);
  103 |     expect(result.exists, 'SUBTYPE_NARR 전역 변수 없음').toBe(true);
  104 |     expect(result.count, `SUBTYPE_NARR 키 수 부족: ${result.count}/86`).toBeGreaterThanOrEqual(86);
  105 |   });
  106 | 
  107 |   test('공통아형 40개 _여 키 배치 검증', async ({ page }) => {
  108 |     await openResultPage(page);
  109 |     const results = await page.evaluate((subtypes) => {
  110 |       const d = (window as any).SUBTYPE_NARR;
  111 |       if (!d) return { pass: 0, fail: [] as string[], total: subtypes.length };
  112 |       const fail: string[] = [];
  113 |       subtypes.forEach((s: string) => {
  114 |         const key = `${s}_여`;
  115 |         if (!d[key] || !d[key].story || d[key].story.length < 5) fail.push(key);
  116 |       });
  117 |       return { pass: subtypes.length - fail.length, fail, total: subtypes.length };
  118 |     }, ALL_SUBTYPES_SHARED);
  119 |     console.log(`공통_여 통과: ${results.pass}/${results.total}`);
  120 |     if (results.fail.length > 0) console.warn('누락 키:', results.fail.join(', '));
  121 |     // 누락 키가 있으면 경고 로그 후 실패 리포트
  122 |     expect(results.fail.length, `누락된 _여 키: ${results.fail.join(', ')}`).toBe(0);
  123 |   });
  124 | 
  125 |   test('공통아형 40개 _남 키 배치 검증', async ({ page }) => {
  126 |     await openResultPage(page);
  127 |     const results = await page.evaluate((subtypes) => {
  128 |       const d = (window as any).SUBTYPE_NARR;
  129 |       if (!d) return { pass: 0, fail: [] as string[], total: subtypes.length };
  130 |       const fail: string[] = [];
  131 |       subtypes.forEach((s: string) => {
  132 |         const key = `${s}_남`;
  133 |         if (!d[key] || !d[key].story || d[key].story.length < 5) fail.push(key);
  134 |       });
  135 |       return { pass: subtypes.length - fail.length, fail, total: subtypes.length };
  136 |     }, ALL_SUBTYPES_SHARED);
  137 |     console.log(`공통_남 통과: ${results.pass}/${results.total}`);
  138 |     if (results.fail.length > 0) console.warn('누락 키:', results.fail.join(', '));
> 139 |     expect(results.fail.length, `누락된 _남 키: ${results.fail.join(', ')}`).toBe(0);
      |                                                                         ^ Error: 누락된 _남 키: 식후졸음 혈당롤러코스터형_남, 약물유발 수분축적형_남, 코르티솔 야식부엉이형_남, 식욕억제제 포만감리셋형_남, 말벅지형_남, 승마살형_남, 하지정맥 부종형_남, 사이클링 하체비대형_남, 라운드숄더 등살형_남, 앞벅지 코어부재형_남, 거북목 경추압박형_남, 하지 림프정체형_남, 냉증·말초순환저하형_남, 갱년기 호르몬스위치형_남, 출산후 호르몬격변형_남, 갱년기 대사전환형_남, 장내세균 불균형형_남, 복부팽만 가스형_남, 근감소성 마른비만형_남, 스테로이드 근손실형_남, 다이어트반복형_남, 골반전방경사 허리통증형_남, 척추측만 체형불균형형_남, 감정식이 폭식형_남, 야식증후군형_남, 저탄수 반동폭식형_남, 지방간 대사증후군형_남, 인슐린저항성 당전단계형_남, 계획표완벽주의형_남, 즉흥폭식자유형_남, 수면무호흡 야간비만형_남, 수분부족 부종형_남, 스트레스 코르티솔집중형_남, 빈혈·철결핍 피로비만형_남, 갑상선기능저하형_남, 다낭성난소증후군(PCOS)형_남, 고혈압·항응고제형_남, 기저대사저하형_남
  140 |   });
  141 | 
  142 |   test('여성전용 3개 _여 키 존재', async ({ page }) => {
  143 |     await openResultPage(page);
  144 |     const results = await page.evaluate((subtypes) => {
  145 |       const d = (window as any).SUBTYPE_NARR;
  146 |       if (!d) return { fail: subtypes };
  147 |       const fail: string[] = [];
  148 |       subtypes.forEach((s: string) => {
  149 |         if (!d[`${s}_여`] || !d[`${s}_여`].story) fail.push(`${s}_여`);
  150 |       });
  151 |       return { fail };
  152 |     }, FEMALE_ONLY);
  153 |     if (results.fail.length > 0) console.warn('여성전용 누락:', results.fail);
  154 |     expect(results.fail.length, `여성전용 누락: ${results.fail.join(', ')}`).toBe(0);
  155 |   });
  156 | 
  157 |   test('남성전용 3개 _남 키 존재', async ({ page }) => {
  158 |     await openResultPage(page);
  159 |     const results = await page.evaluate((subtypes) => {
  160 |       const d = (window as any).SUBTYPE_NARR;
  161 |       if (!d) return { fail: subtypes };
  162 |       const fail: string[] = [];
  163 |       subtypes.forEach((s: string) => {
  164 |         if (!d[`${s}_남`] || !d[`${s}_남`].story) fail.push(`${s}_남`);
  165 |       });
  166 |       return { fail };
  167 |     }, MALE_ONLY);
  168 |     if (results.fail.length > 0) console.warn('남성전용 누락:', results.fail);
  169 |     expect(results.fail.length, `남성전용 누락: ${results.fail.join(', ')}`).toBe(0);
  170 |   });
  171 | 
  172 |   test('모든 SUBTYPE_NARR 항목에 story·desc 비어있지 않음', async ({ page }) => {
  173 |     await openResultPage(page);
  174 |     const result = await page.evaluate(() => {
  175 |       const d = (window as any).SUBTYPE_NARR;
  176 |       if (!d) return { emptyStory: [] as string[], emptyDesc: [] as string[] };
  177 |       const emptyStory: string[] = [];
  178 |       const emptyDesc: string[] = [];
  179 |       Object.keys(d).forEach(k => {
  180 |         if (!d[k].story || d[k].story.length < 10) emptyStory.push(k);
  181 |         if (!d[k].desc  || d[k].desc.length  < 10) emptyDesc.push(k);
  182 |       });
  183 |       return { emptyStory, emptyDesc };
  184 |     });
  185 |     if (result.emptyStory.length > 0) console.warn('story 비어있음:', result.emptyStory.slice(0,5));
  186 |     if (result.emptyDesc.length > 0)  console.warn('desc 비어있음:',  result.emptyDesc.slice(0,5));
  187 |     expect(result.emptyStory.length, `story 비어있는 키 ${result.emptyStory.length}개`).toBe(0);
  188 |     expect(result.emptyDesc.length,  `desc 비어있는 키 ${result.emptyDesc.length}개`).toBe(0);
  189 |   });
  190 | });
  191 | 
  192 | // ─────────────────────────────────────────────────────────────────────────────
  193 | // SUITE 2: 성별 분기 로직 검증
  194 | // ─────────────────────────────────────────────────────────────────────────────
  195 | test.describe('Suite 2: 성별 분기 로직 검증', () => {
  196 | 
  197 |   test('여성 __SM_DATA__에서 _여 접미사 키를 사용한다', async ({ page }) => {
  198 |     await openResultPage(page, { gender: '여성', bc_primary: '갱년기 호르몬스위치형' });
  199 |     const result = await page.evaluate(() => {
  200 |       const d = (window as any).SUBTYPE_NARR;
  201 |       const smData = (window as any).__SM_DATA__ || {};
  202 |       const subtype = smData.bc_primary || '';
  203 |       const gender  = smData.gender || '';
  204 |       const suffix  = gender === '여성' ? '_여' : '_남';
  205 |       const key     = `${subtype}${suffix}`;
  206 |       return { key, exists: !!(d && d[key]) };
  207 |     });
  208 |     console.log(`성별 분기: ${result.key} → ${result.exists ? '존재' : '없음'}`);
  209 |     expect(result.exists, `여성 분기 키 없음: ${result.key}`).toBe(true);
  210 |   });
  211 | 
  212 |   test('남성 __SM_DATA__에서 _남 접미사 키를 사용한다', async ({ page }) => {
  213 |     await openResultPage(page, { gender: '남성', bc_primary: '갱년기 호르몬스위치형' });
  214 |     const result = await page.evaluate(() => {
  215 |       const d = (window as any).SUBTYPE_NARR;
  216 |       const smData = (window as any).__SM_DATA__ || {};
  217 |       const subtype = smData.bc_primary || '';
  218 |       const suffix  = smData.gender === '남성' ? '_남' : '_여';
  219 |       const key     = `${subtype}${suffix}`;
  220 |       return { key, exists: !!(d && d[key]) };
  221 |     });
  222 |     console.log(`성별 분기: ${result.key} → ${result.exists ? '존재' : '없음'}`);
  223 |     expect(result.exists, `남성 분기 키 없음: ${result.key}`).toBe(true);
  224 |   });
  225 | 
  226 |   test('여성전용 아형은 _여 키만 존재하고 _남 키는 없다', async ({ page }) => {
  227 |     await openResultPage(page);
  228 |     const result = await page.evaluate((femaleOnly) => {
  229 |       const d = (window as any).SUBTYPE_NARR;
  230 |       if (!d) return { ok: false, reason: 'SUBTYPE_NARR 없음' };
  231 |       for (const s of femaleOnly) {
  232 |         if (!d[`${s}_여`]) return { ok: false, reason: `${s}_여 없음` };
  233 |         if (d[`${s}_남`])  return { ok: false, reason: `${s}_남 존재해선 안 됨` };
  234 |       }
  235 |       return { ok: true, reason: '' };
  236 |     }, FEMALE_ONLY);
  237 |     expect(result.ok, result.reason).toBe(true);
  238 |   });
  239 | 
```