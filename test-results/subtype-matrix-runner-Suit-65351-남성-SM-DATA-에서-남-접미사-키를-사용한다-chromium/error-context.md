# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: subtype-matrix-runner.spec.ts >> Suite 2: 성별 분기 로직 검증 >> 남성 __SM_DATA__에서 _남 접미사 키를 사용한다
- Location: tests/e2e/subtype-matrix-runner.spec.ts:212:3

# Error details

```
Error: 남성 분기 키 없음: 갱년기 호르몬스위치형_남

expect(received).toBe(expected) // Object.is equality

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
  139 |     expect(results.fail.length, `누락된 _남 키: ${results.fail.join(', ')}`).toBe(0);
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
> 223 |     expect(result.exists, `남성 분기 키 없음: ${result.key}`).toBe(true);
      |                                                        ^ Error: 남성 분기 키 없음: 갱년기 호르몬스위치형_남
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
  240 |   test('남성전용 아형은 _남 키만 존재하고 _여 키는 없다', async ({ page }) => {
  241 |     await openResultPage(page);
  242 |     const result = await page.evaluate((maleOnly) => {
  243 |       const d = (window as any).SUBTYPE_NARR;
  244 |       if (!d) return { ok: false, reason: 'SUBTYPE_NARR 없음' };
  245 |       for (const s of maleOnly) {
  246 |         if (!d[`${s}_남`]) return { ok: false, reason: `${s}_남 없음` };
  247 |         if (d[`${s}_여`])  return { ok: false, reason: `${s}_여 존재해선 안 됨` };
  248 |       }
  249 |       return { ok: true, reason: '' };
  250 |     }, MALE_ONLY);
  251 |     expect(result.ok, result.reason).toBe(true);
  252 |   });
  253 | });
  254 | 
  255 | // ─────────────────────────────────────────────────────────────────────────────
  256 | // SUITE 3: exercise_response 오늘탭 분기 검증
  257 | // ─────────────────────────────────────────────────────────────────────────────
  258 | test.describe('Suite 3: exercise_response 오늘탭 분기 검증', () => {
  259 | 
  260 |   test('EXERCISE_RESPONSE_OPTIONS 사전이 전역에 존재하고 7개 키를 포함한다', async ({ page }) => {
  261 |     await openResultPage(page);
  262 |     const result = await page.evaluate(() => {
  263 |       const d = (window as any).EXERCISE_RESPONSE_OPTIONS;
  264 |       if (!d) return { exists: false, count: 0, keys: [] as string[] };
  265 |       return { exists: true, count: Object.keys(d).length, keys: Object.keys(d) };
  266 |     });
  267 |     console.log(`EXERCISE_RESPONSE_OPTIONS: ${result.count}개 키 — ${result.keys.join(', ')}`);
  268 |     expect(result.exists, 'EXERCISE_RESPONSE_OPTIONS 전역 변수 없음').toBe(true);
  269 |     expect(result.count, `7개 키 필요, 현재 ${result.count}개`).toBe(7);
  270 |   });
  271 | 
  272 |   const EXERCISE_LABELS = ['일시반응형', '반응지속형', '구성미변형', '역반응형', '회복부족형', '저반응형', '이력없음'];
  273 | 
  274 |   test('7개 운동반응 레이블 모두 exOptions 배열 보유', async ({ page }) => {
  275 |     await openResultPage(page);
  276 |     const result = await page.evaluate((labels) => {
  277 |       const d = (window as any).EXERCISE_RESPONSE_OPTIONS;
  278 |       if (!d) return { fail: labels };
  279 |       const fail: string[] = [];
  280 |       labels.forEach(lbl => {
  281 |         if (!d[lbl] || !Array.isArray(d[lbl].exOptions) || d[lbl].exOptions.length < 1) {
  282 |           fail.push(lbl);
  283 |         }
  284 |       });
  285 |       return { fail };
  286 |     }, EXERCISE_LABELS);
  287 |     if (result.fail.length > 0) console.warn('exOptions 없는 레이블:', result.fail);
  288 |     expect(result.fail.length, `exOptions 없는 레이블: ${result.fail.join(', ')}`).toBe(0);
  289 |   });
  290 | 
  291 |   test('bcAnswers.exercise_response 필드가 존재한다', async ({ page }) => {
  292 |     await openResultPage(page);
  293 |     const result = await page.evaluate(() => {
  294 |       // bcAnswers 전역 또는 window.__LAST_ANSWERS__ 내 exercise_response 필드 확인
  295 |       const answers = (window as any).window?.__LAST_ANSWERS__ || (window as any).__LAST_ANSWERS__ || {};
  296 |       return {
  297 |         hasField: 'exercise_response' in answers,
  298 |         value: answers['exercise_response'],
  299 |         label: answers['_exercise_resp_label'],
  300 |       };
  301 |     });
  302 |     console.log(`exercise_response: value=${result.value}, label=${result.label}`);
  303 |     // 필드가 있거나 null(미응답)인 경우 모두 정상
  304 |     expect(typeof result.hasField).toBe('boolean');
  305 |   });
  306 | });
  307 | 
  308 | // ─────────────────────────────────────────────────────────────────────────────
  309 | // SUITE 4: pain_areas 안전 게이트 검증
  310 | // ─────────────────────────────────────────────────────────────────────────────
  311 | test.describe('Suite 4: pain_areas 안전 게이트 검증', () => {
  312 | 
  313 |   test('PAIN_GATE 사전이 전역에 존재하고 6개 항목을 포함한다', async ({ page }) => {
  314 |     await openResultPage(page);
  315 |     const result = await page.evaluate(() => {
  316 |       const d = (window as any).PAIN_GATE;
  317 |       if (!d) return { exists: false, count: 0, keys: [] as string[] };
  318 |       return { exists: true, count: Object.keys(d).length, keys: Object.keys(d) };
  319 |     });
  320 |     console.log(`PAIN_GATE: ${result.count}개 항목 — ${result.keys.join(', ')}`);
  321 |     expect(result.exists, 'PAIN_GATE 전역 변수 없음').toBe(true);
  322 |     expect(result.count, `6개 항목 필요, 현재 ${result.count}개`).toBe(6);
  323 |   });
```