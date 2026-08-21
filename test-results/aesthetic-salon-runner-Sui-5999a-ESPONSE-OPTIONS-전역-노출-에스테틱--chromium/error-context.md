# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: aesthetic-salon-runner.spec.ts >> Suite AE-1: aesthetic.html 전역 변수 노출 >> AE-1-3: window.EXERCISE_RESPONSE_OPTIONS 전역 노출 (에스테틱)
- Location: tests/e2e/aesthetic-salon-runner.spec.ts:21:3

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
      - generic [ref=e5]: 바디코드 분석 결과
      - generic [ref=e6]: SLIMMIND
      - generic [ref=e7]:
        - generic [ref=e8]: 슬이님,
        - generic [ref=e9]: 당신의 몸은거짓말을 하지 않았습니다
      - paragraph [ref=e10]: 먹는 걸 줄여도 안 빠졌다면, 이유는 따로 있습니다. 11개 진단 축이 찾아낸 슬이 님만의 진짜 바디코드를 공개합니다.
      - generic [ref=e12]:
        - generic [ref=e13]: 담당 컨설턴트
        - generic [ref=e15]: 바바성형외과 컨설턴트
      - generic [ref=e17]:
        - generic [ref=e18]: 진단일
        - generic [ref=e20]: 2026.08.21
    - button "📅 오늘 할 일 오늘 체크하기 운동·식단·회복 미션 · 코칭 메시지 · 스트릭 확인 ›" [ref=e21] [cursor=pointer]:
      - generic [ref=e22]: 📅
      - generic [ref=e23]:
        - generic [ref=e24]: 오늘 할 일
        - generic [ref=e25]: 오늘 체크하기 운동·식단·회복
        - generic [ref=e26]: 미션 · 코칭 메시지 · 스트릭 확인
      - generic [ref=e27]: ›
    - generic [ref=e29]:
      - generic [ref=e30]:
        - generic [ref=e31]:
          - text: 읽는 순서
          - generic [ref=e32]: ↓
        - generic [ref=e33]: 번호대로 읽어보세요
      - button "1 ⌄ 나의 바디코드 남들과 똑같이 해서는 절대 안 빠졌던 진짜 이유 지금 여기" [ref=e34] [cursor=pointer]:
        - generic [ref=e36]:
          - generic [ref=e37]: "1"
          - text: ⌄
        - generic [ref=e38]:
          - generic [ref=e39]: 나의 바디코드
          - text: 남들과 똑같이 해서는 절대 안 빠졌던 진짜 이유
        - generic [ref=e40]: 지금 여기
      - button "2 ⌄ 타고난 기질 나를 알아야 무너지지 않는 평생의 지속 가능함이 완성됩니다 →" [ref=e41] [cursor=pointer]:
        - generic [ref=e43]:
          - generic [ref=e44]: "2"
          - text: ⌄
        - generic [ref=e45]:
          - generic [ref=e46]: 타고난 기질
          - text: 나를 알아야 무너지지 않는 평생의 지속 가능함이 완성됩니다
        - generic [ref=e47]: →
      - button "3 ⌄ 다이어트 잔혹사 의지 부족이 아닙니다, 몸의 시스템이 잘못 흘러갔을 뿐 →" [ref=e48] [cursor=pointer]:
        - generic [ref=e50]:
          - generic [ref=e51]: "3"
          - text: ⌄
        - generic [ref=e52]:
          - generic [ref=e53]: 다이어트 잔혹사
          - text: 의지 부족이 아닙니다, 몸의 시스템이 잘못 흘러갔을 뿐
        - generic [ref=e54]: →
      - button "4 ⌄ 핵심 처방 이것저것 다 하려다 포기하지 말고, 이것만 하세요 →" [ref=e55] [cursor=pointer]:
        - generic [ref=e57]:
          - generic [ref=e58]: "4"
          - text: ⌄
        - generic [ref=e59]:
          - generic [ref=e60]: 핵심 처방
          - text: 이것저것 다 하려다 포기하지 말고, 이것만 하세요
        - generic [ref=e61]: →
      - button "5 ⌄ 맞춤 비율 살이 빠질 수밖에 없는 11축 전문 진단의 주차별 설계 비율 →" [ref=e62] [cursor=pointer]:
        - generic [ref=e64]:
          - generic [ref=e65]: "5"
          - text: ⌄
        - generic [ref=e66]:
          - generic [ref=e67]: 맞춤 비율
          - text: 살이 빠질 수밖에 없는 11축 전문 진단의 주차별 설계 비율
        - generic [ref=e68]: →
      - button "6 ⌄ 12주 로드맵 막연한 계획 대신 눈앞에 펼쳐지는 확실한 변화 스케줄 →" [ref=e69] [cursor=pointer]:
        - generic [ref=e71]:
          - generic [ref=e72]: "6"
          - text: ⌄
        - generic [ref=e73]:
          - generic [ref=e74]: 12주 로드맵
          - text: 막연한 계획 대신 눈앞에 펼쳐지는 확실한 변화 스케줄
        - generic [ref=e75]: →
      - button "7 ⌄ 변화 예측 로드맵 솔루션을 완수했을 때 달성 가능한 내 몸 시뮬레이션 →" [ref=e76] [cursor=pointer]:
        - generic [ref=e78]:
          - generic [ref=e79]: "7"
          - text: ⌄
        - generic [ref=e80]:
          - generic [ref=e81]: 변화 예측
          - text: 로드맵 솔루션을 완수했을 때 달성 가능한 내 몸 시뮬레이션
        - generic [ref=e82]: →
      - button "8 한 장 요약 결과지 PDF 저장 및 담당 컨설턴트가 전하는 마지막 메시지 →" [ref=e83] [cursor=pointer]:
        - generic [ref=e85]: "8"
        - generic [ref=e87]:
          - generic [ref=e88]: 한 장 요약
          - text: 결과지 PDF 저장 및 담당 컨설턴트가 전하는 마지막 메시지
        - generic [ref=e89]: →
    - button "처음부터 순서대로 읽기 →" [ref=e90] [cursor=pointer]
    - generic [ref=e91]: 각 챕터를 눌러 바로 이동할 수도 있어요
    - generic [ref=e92]: 본 결과지는 전문 의료 진단을 대체하지 않습니다
  - navigation [ref=e93]:
    - button "☰ SLIMMIND 💅 에스테틱 ‹ 목차보기" [ref=e94] [cursor=pointer]:
      - generic [ref=e95]:
        - generic [ref=e96]: ☰
        - generic [ref=e97]: SLIMMIND
        - generic [ref=e98]: 💅 에스테틱
      - generic [ref=e99]:
        - generic [ref=e100]: ‹
        - text: 목차보기
    - generic [ref=e101]:
      - button "나의 바디코드" [ref=e102] [cursor=pointer]
      - button "타고난 기질" [ref=e108] [cursor=pointer]
      - button "다이어트 잔혹사" [ref=e114] [cursor=pointer]
      - button "핵심 처방" [ref=e119] [cursor=pointer]
      - button "맞춤 비율" [ref=e125] [cursor=pointer]
      - button "12주 로드맵" [ref=e131] [cursor=pointer]
      - button "변화 예측" [ref=e138] [cursor=pointer]
      - button "💅 케어처방" [ref=e144] [cursor=pointer]:
        - generic [ref=e145]: 💅
        - generic [ref=e146]: 케어처방
      - button "한 장 요약" [ref=e147] [cursor=pointer]
    - button "오늘" [ref=e152] [cursor=pointer]
  - generic [ref=e160]:
    - generic [ref=e161]: 바디코드 분석 결과
    - heading "슬이님의 바디코드 리포트" [level=1] [ref=e162]
    - generic [ref=e163]:
      - generic [ref=e164]:
        - text: Q. 나의 바디코드는?
        - generic [ref=e165]:
          - generic [ref=e166]: .
          - generic [ref=e167]: .
          - generic [ref=e168]: .
      - generic [ref=e169]:
        - generic [ref=e170]: BC-?
        - heading [level=2] [ref=e171]
      - paragraph [ref=e172]
      - generic [ref=e173]:
        - generic [ref=e174]:
          - generic [ref=e175]: 분류
          - generic [ref=e176]: 약물
        - generic [ref=e177]:
          - generic [ref=e178]: 의학 분류
          - generic [ref=e179]: 인슐린 저항성·내장 비대형 체형
        - generic [ref=e180]:
          - generic [ref=e181]: 최종 고장 코드
          - generic [ref=e182]: 억제제부작용 배부름마비형 · 금 기질 · ENTP
          - generic [ref=e183]:
            - text: "데이터가 가리킨 결론:"
            - strong [ref=e184]: BC-3
            - text: . 수치와 근거는 아래에서 확인하세요.B형의 즉흥성을 처방 내 다양성 옵션으로 활용합니다.
      - text: 바디코드
    - generic [ref=e185]:
      - generic "저GI 식이 + 식후 유산소 운동의 혈당 변동성 감소 효과 (메타분석 5편)" [ref=e186]: 📚 근거 A등급 ★★★★★
      - generic [ref=e187]: 🎯 처방 신뢰도 78%
    - generic [ref=e188]: 📊 4대 바디 지표
    - generic [ref=e189]:
      - generic [ref=e190]:
        - generic [ref=e191]: 대사 효율 나이
        - generic [ref=e192]: 0 세
        - generic [ref=e193]: ⚠️ 지금 당신 몸이 인식하는 몸 나이
        - generic [ref=e194]: 이 수치가 지금 당신 신체의 진짜 상태입니다
      - generic [ref=e195]:
        - generic [ref=e196]:
          - generic [ref=e197]: 복부 위험도
          - generic [ref=e198]: 9%
          - generic [ref=e199]: 양호
        - generic [ref=e201]:
          - generic [ref=e202]: 호르몬 부하
          - generic [ref=e203]: 6%
          - generic [ref=e204]: 양호
        - generic [ref=e206]:
          - generic [ref=e207]: 체형 불균형
          - generic [ref=e208]: 5%
          - generic [ref=e209]: 양호
      - generic [ref=e211]: ※ 위 수치는 설문 응답 기반의 위험도 추정치입니다. 의료 검사 수치가 아니며, 개인 상담 시 정밀 분석이 제공됩니다.
    - paragraph [ref=e214]:
      - paragraph [ref=e215]: 밥 한 끼만 먹어도 배가 먼저 나오고, 식후엔 쏟아지게 졸렸습니다.
      - paragraph [ref=e216]:
        - strong [ref=e217]: 슬이
        - text: 님, 당신은 게을렀던 게 아닙니다.
      - paragraph [ref=e218]:
        - text: 당신의 몸이 당신의 혈당 시스템이
        - strong [ref=e219]: 롤러코스터 패턴
        - text: 으로 작동하고 있을 뿐입니다.
    - generic [ref=e220]: ⚠️ 그렇다면, 왜 이렇게 됐을까요?
    - paragraph [ref=e222]:
      - strong [ref=e223]: "분석 소견:"
      - text: 혈당 조절 시스템이 불균형한 상태입니다. 이 상태에서 극단적인 굶기나 1일 1식을 하면 인슐린 롤러코스터(스파이크)가 심해져 내장지방이 더 견고해지고 허리둘레가 늘어나는 경향이 있습니다.
    - generic [ref=e224]:
      - text: 수천 가지로 흩어지는 체형이 아닙니다.
      - strong [ref=e225]: 억제제부작용 배부름마비형
      - text: 의 몸은 특허출원 중인
      - strong [ref=e226]: 바디마스터 16종
      - text: 중 하나로 정확히 좁혀집니다.
      - generic [ref=e227]: 분류가 정확할수록, 처방도 정확해집니다.
    - generic [ref=e228]:
      - text: 🗂 바디마스터 16종
      - generic [ref=e229]: 특허출원중
    - generic [ref=e230]:
      - generic [ref=e231]:
        - generic [ref=e232]: 복부형
        - generic [ref=e233]:
          - generic [ref=e234]:
            - generic [ref=e235]:
              - generic [ref=e236]: 🔴
              - generic [ref=e237]: 내장단단
            - generic [ref=e238]: 단단 내장형
            - generic [ref=e239]: 배만 단단히 볼록
          - generic [ref=e240]:
            - generic [ref=e241]:
              - generic [ref=e242]: 🍮
              - generic [ref=e243]: 피하물렁
            - generic [ref=e244]: 물렁 피하형
            - generic [ref=e245]: 쑥 들어가는 뱃살
          - generic [ref=e246]:
            - generic [ref=e247]:
              - generic [ref=e248]: 🎈
              - generic [ref=e249]: 팽만가스
            - generic [ref=e250]: 가스 팽만형
            - generic [ref=e251]: 식후 부풀어
            - generic [ref=e252]: 나의 코드
          - generic [ref=e253]:
            - generic [ref=e254]:
              - generic [ref=e255]: 🥚
              - generic [ref=e256]: 마른비만
            - generic [ref=e257]: 올챙이배형
            - generic [ref=e258]: 팔다리 가늘고 배만
      - generic [ref=e259]:
        - generic [ref=e260]: 하체형
        - generic [ref=e261]:
          - generic [ref=e262]:
            - generic [ref=e263]:
              - generic [ref=e264]: 🐘
              - generic [ref=e265]: 순환부종
            - generic [ref=e266]: 코끼리다리형보강
            - generic [ref=e267]: 저녁이면 붓는
          - generic [ref=e268]:
            - generic [ref=e269]:
              - generic [ref=e270]: 🍊
              - generic [ref=e271]: 셀룰라이트
            - generic [ref=e272]: 귤껍질 하체형
            - generic [ref=e273]: 울퉁불퉁 굳은
          - generic [ref=e274]:
            - generic [ref=e275]:
              - generic [ref=e276]: 🍖
              - generic [ref=e277]: 근육
            - generic [ref=e278]: 말벅지형
            - generic [ref=e279]: 운동할수록 굵어
          - generic [ref=e280]:
            - generic [ref=e281]:
              - generic [ref=e282]: 🐎
              - generic [ref=e283]: 골반구조
            - generic [ref=e284]: 승마살형보강
            - generic [ref=e285]: 골반 틀어져 옆으로
      - generic [ref=e286]:
        - generic [ref=e287]: 상체형
        - generic [ref=e288]:
          - generic [ref=e289]:
            - generic [ref=e290]:
              - generic [ref=e291]: 🐢
              - generic [ref=e292]: 자세붕괴
            - generic [ref=e293]: 거북이형보강
            - generic [ref=e294]: 목·어깨 움츠림
          - generic [ref=e295]:
            - generic [ref=e296]:
              - generic [ref=e297]: 💧
              - generic [ref=e298]: 순환부종
            - generic [ref=e299]: 팔뚝부종형보강
            - generic [ref=e300]: 안 쓰는 팔 출렁
          - generic [ref=e301]:
            - generic [ref=e302]:
              - generic [ref=e303]: 💪
              - generic [ref=e304]: 근육
            - generic [ref=e305]: 상체근육형보강
            - generic [ref=e306]: 많이 들어 발달
          - generic [ref=e307]:
            - generic [ref=e308]:
              - generic [ref=e309]: 🎙
              - generic [ref=e310]: 피하흉추
            - generic [ref=e311]: 부유방형보강
            - generic [ref=e312]: 겨드랑이·브라라인
      - generic [ref=e313]:
        - generic [ref=e314]: 전신형
        - generic [ref=e315]:
          - generic [ref=e316]:
            - generic [ref=e317]:
              - generic [ref=e318]: 🦉
              - generic [ref=e319]: 변환
            - generic [ref=e320]: 갱년기 변환형
            - generic [ref=e321]: 지방이 이동
          - generic [ref=e322]:
            - generic [ref=e323]:
              - generic [ref=e324]: 🔋
              - generic [ref=e325]: 부종
            - generic [ref=e326]: 번아웃 무기력형
            - generic [ref=e327]: 방전되며 붓는
          - generic [ref=e328]:
            - generic [ref=e329]:
              - generic [ref=e330]: 🚨
              - generic [ref=e331]: 고위험
            - generic [ref=e332]: 대사증후군형
            - generic [ref=e333]: 혈관계 종합위험
          - generic [ref=e334]:
            - generic [ref=e335]:
              - generic [ref=e336]: 🌀
              - generic [ref=e337]: 복합
            - generic [ref=e338]: 다중악순환형
            - generic [ref=e339]: 경계없이 다 무너짐
    - button "다음 — 타고난 기질 이 코드가 만들어진 이유 — 내 몸의 설계도 →" [ref=e340] [cursor=pointer]:
      - generic [ref=e341]:
        - generic [ref=e342]: 다음 — 타고난 기질
        - generic [ref=e343]: 이 코드가 만들어진 이유 — 내 몸의 설계도
      - generic [ref=e344]: →
    - generic [ref=e345]: 본 결과지는 바디코드 정밀 진단을 기반으로 한 라이프스타일 가이드이며, 의료 진단·처방·치료를 대체하지 않습니다. 제시된 수치는 통계적 참고 지표이며 개인에 따라 차이가 있습니다. 건강 문제는 반드시 자격을 갖춘 의료 전문가와 상담하시기 바랍니다.
  - text: 바디코드 × ✓ ✓ ✓ ✓ 👆 탭! 🚫 👆 탭! 🚫 👆 탭! 👆 탭! 🚫 👆 탭! 🚫 👆 탭! 👆 탭! 🚫 👆 탭! 🚫 👆 탭! 👆 탭! 🚫 👆 탭! 🚫 👆 탭! 🌱
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
          - generic: 🍽 공복감
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
  - button "결과 공유하기" [ref=e346] [cursor=pointer]: 🔗
  - generic:
    - generic:
      - generic:
        - generic: 🧬 내 BC DNA 카드
        - button "✕"
      - generic:
        - button "🌌 오로라"
        - button "🌅 선셋"
        - button "🌊 민트"
      - generic:
        - button "📤 저장·공유하기"
        - button "💾 이미지 저장"
  - dialog "공유 방법 선택":
    - generic:
      - generic: 결과 공유하기
      - generic: 억제제부작용 배부름마비형 결과를 공유해요
      - generic:
        - button "💬 카카오톡 공유":
          - generic: 💬
          - text: 카카오톡 공유
        - button "🖼 이미지 저장":
          - generic: 🖼
          - text: 이미지 저장
        - button "🔗 링크 복사":
          - generic: 🔗
          - text: 링크 복사
        - button "📤 더 보내기":
          - generic: 📤
          - text: 더 보내기
      - button "닫기"
  - status: 🔗 링크가 복사되었어요!
  - generic [ref=e348]:
    - generic [ref=e349]: 🏃
    - generic [ref=e350]: 운동 체크란이에요
    - generic [ref=e351]: 오늘 계획된 운동을 했으면 해당 요일 칸을 탭하세요.체크하면 컨설턴트가 실시간으로 확인하고, 다음 피드백에 반영해드려요. 완료 못한 날은 솔직하게 놔두면 돼요.
    - generic [ref=e352]:
      - generic [ref=e353]: 1 / 3
      - generic [ref=e354]:
        - button "닫기" [ref=e355] [cursor=pointer]
        - button "다음 →" [ref=e356] [cursor=pointer]
  - generic [ref=e358]:
    - generic [ref=e359]: 🖥️ 바탕화면 앱으로 저장
    - generic [ref=e360]: 슬림마인드 결과지를 바탕화면에서 바로 열 수 있어요.
    - generic [ref=e361]:
      - generic [ref=e362]: "1"
      - generic [ref=e363]: Chrome 오른쪽 상단 ⋮ 메뉴를 클릭하세요
    - generic [ref=e364]:
      - generic [ref=e365]: "2"
      - generic [ref=e366]: "[저장 및 공유] → [바탕화면에 바로가기 만들기]를 클릭하세요"
    - generic [ref=e367]:
      - generic [ref=e368]: "3"
      - generic [ref=e369]: "[만들기]를 클릭하면 바탕화면에 아이콘이 생성됩니다"
    - button "닫기" [ref=e370] [cursor=pointer]
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
> 25  |     expect(hasExOpts).toBe(true);
      |                       ^ Error: expect(received).toBe(expected) // Object.is equality
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
  73  |     expect(hasPainGate).toBe(true);
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
```