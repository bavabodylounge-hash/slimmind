# SlimMind 병원용 시스템 전체 매핑 문서
> 이 문서는 다른 AI(GPT, Claude 등)가 바로 읽고 전체 시스템을 이해할 수 있도록 작성됨  
> 최종 업데이트: 2026-07-15  
> 파일 기준: `src/index.tsx` (백엔드) + `public/survey-hospital.html` (질문지) + `public/result-hospital.html` (결과지)

---

## 1. 시스템 아키텍처 전체 흐름

```
[사용자 QR 스캔]
      ↓
GET /h/:b2b_code
  → DB에서 b2b_partners 조회 (survey_category='hospital' 확인)
  → window.__BRAND__ 주입 후 survey-hospital.html 서빙
      ↓
[병원용 질문지 — survey-hospital.html]
  Stage 1: 기본 신체정보 (이름/나이/키/몸무게/목표체중/의류사이즈)
  Stage 2: 병원 전용 2차 설문 (16문항, 키: q1~q16)
  Stage 3: 히트맵 증상 설문 (6증상 × 6시간대 = 36개 체크)
  Stage 4: 갈림길 선택 (10축 중 경합축 이분 선택)
  → bc-engine.js에서 BC코드 + 오행 산출
  → POST /api/survey/submit (또는 /api/h/submit)
      ↓
[DB 저장 — D1 SQLite]
  테이블: hospital_responses
  저장 필드:
    - bc_code: "BC-1" ~ "BC-10" (오행 기반 바디코드)
    - ohaeng_type: "목"|"화"|"토"|"금"|"수"
    - axis_scores_json: {A01:75, A02:42, ...} (10축 0~100)
    - stage2_json: {q1:0, q2:1, q3:[0,2], ...} (2차 설문 원시 응답)
    - stage3_json: {bloat:[0,1,2,0,1,3], tired:[...], ...} (히트맵)
    - stage4_json: {A01_A09:0, A01_A07:1, ...} (갈림길)
    - user_name, gender, age, height, weight, mbti_full, blood_type
      ↓
[결과지 — result-hospital.html]
  GET /result-hospital/:id
    → index.tsx가 window.__HOSPITAL_RESULT_ID__ 주입
    → hospitalInit() 비동기 실행
    → GET /api/h/result/:id 호출 → JSON 응답
    → window.__RESULT__ 구성 (loadData()가 읽는 구조로 변환)
    → renderAll(data) 호출
    → renderP1 ~ renderP11 순차 실행
```

---

## 2. 병원용 2차 설문 16문항 전체 매핑

| 키 | 질문 내용 | 선택지 | 사용 위치 |
|----|-----------|--------|-----------|
| `q1` | 직계가족 비만/당뇨/고혈압 가족력 | 0=있음, 1=없음 | P3(유전경향), P5(위험배너), P11(주의사항) |
| `q2` | 부모님 체형 | 0=상체비만, 1=하체비만, 2=복부비만, 3=균형, 4=모름 | P1(BC근거서술), P11(처방배경) |
| `q3` | 배꼽 아래 촉진 결과 | 0=물렁물렁부종, 1=딱딱지방, 2=탄탄근육, 3=울퉁불퉁셀룰라이트 | P1(BC근거서술) |
| `q4` | 최근 건강검진 이상 소견 | 배열: 0=혈당/인슐린, 1=고지혈, 2=지방간, 3=고혈압, 4=신장, 5=이상없음 | P5(위험배너), P11(주의사항) |
| `q5` | 손발 냉증 | 0=심하다, 1=조금, 2=없음 | P2(A02/A03판별), P5(위험배너) |
| `q6` | 장기복용약 | 배열: 0=스테로이드, 1=항우울제, 2=피임약, 3=혈압약, 4=당뇨약, 5=없음 | P5(위험배너), P11(주의사항) |
| `q7` | 식욕억제제/GLP-1 복용 이력 | 0=있음, 1=없음 | P11(처방배경), hospitalInit(_hadGLP1) |
| `q8` | 체중 증가 계기 | 배열: 0=이직/과로, 1=이별/충격, 2=수술/약물, 3=회식/음주, 4=금연, 5=서서히 | P3(계기×오행), P4(실패트리거), P7(계기요약), P11 |
| `q9` | 과거 시술 이력 | 배열: liposuction/fat_dissolve/lifting/실리프팅/없음 | hospitalInit(_pastProcedures), P11 |
| `q10` | 체중 궤적 패턴 | 0=계속증가, 1=요요반복, 2=정체기, 3=감소중 | P11(처방배경) |
| `q11` | 출산/군복무 경험 | 0=출산경험, 1=군복무경험, 2=해당없음 | P3(출산×오행특이사항), P11 |
| `q12` | 갱년기/완경 여부 | yes/no/peri | hospitalInit(_isMenopause), P4, P5 |
| `q13` | 흡연 여부 | 0=현재흡연, 1=과거흡연, 2=비흡연 | P4(실패트리거), P5(위험배너), P11(주의사항) |
| `q14` | 음주 빈도 | 0=주4회이상, 1=주2~3회, 2=주1회이하, 3=거의안함 | P4(실패트리거), P5(위험배너), P11(주의사항) |
| `q15` | 수면 시간 | 0=5시간미만, 1=5~6시간, 2=7~8시간, 3=9시간이상 | P5(위험배너) |
| `q16` | 현재 의류 사이즈 | 0=S, 1=M, 2=L, 3=XL이상 | P11(처방배경) |

---

## 3. Stage 3 히트맵 (증상 × 시간대) 매핑

```
키 이름 → 증상 → 사용 위치(P2)
────────────────────────────────
bloat  → 복부팽만  → buildHeatmapNarrative (P2)
tired  → 피로감    → buildHeatmapNarrative (P2)
hungry → 식욕급등  → buildHeatmapNarrative (P2)
pain   → 통증결림  → buildHeatmapNarrative (P2)
sleep  → 수면불량  → buildHeatmapNarrative (P2)
gut    → 소화장애  → buildHeatmapNarrative (P2)

시간대 배열 index:
  [0]=새벽(0~6시), [1]=오전(6~12시), [2]=낮(12~15시)
  [3]=오후(15~18시), [4]=저녁(18~22시), [5]=밤(22~24시)

피크 시간 → 원인축 판별:
  idx 4,5 → peak_night (코르티솔/렙틴)
  idx 0,1 → peak_dawn  (혈당급락/부신)
  idx 2,3 → peak_afternoon (인슐린스파이크)
```

---

## 4. 10원인축(A01~A10) 정의

| 코드 | 이름 | 아이콘 | 색상 |
|------|------|--------|------|
| A01 | 인슐린·내장지방 | 🍽️ | #E8631A |
| A02 | 림프·순환 | 💧 | #1A7FC1 |
| A03 | 호르몬·대사 | 🌸 | #C0397A |
| A04 | 근감소·골격 | 🏃 | #4A8C1C |
| A05 | 소화·장 | 🌿 | #1A8C5B |
| A06 | 골격·복압 | 🦴 | #6B4EAA |
| A07 | 코르티솔·스트레스 | 🌙 | #3F51B5 |
| A08 | 심리·식이행동 | 🧠 | #7B1FA2 |
| A09 | 대사위험 종합 | ⚠️ | #E67E22 |
| A10 | 기질·성향 | 🔮 | #607D8B |

**BC코드 ↔ 주요 원인축 매핑:**
```
BC-1 → A02(림프순환) 주도
BC-2 → A01(인슐린) 주도
BC-3 → A03(호르몬) 주도
BC-4 → A07(코르티솔) 주도
BC-5 → A04(근감소) 주도
BC-6 → A08(심리식이) 주도
BC-7 → A05(소화장) 주도
BC-8 → A06(골격복압) 주도
BC-9 → A09(대사위험) 주도
BC-10→ A01+A03 복합
```

---

## 5. 오행(5가지 기질) 정의

| 오행 | 장기 | 성향 | 특이 트리거 |
|------|------|------|------------|
| 목(木) | 간·담낭 | 경쟁·성취·논리 | 과로·이직 스트레스 |
| 화(火) | 심장·혈관 | 열정·사교·감성 | 번아웃·감정충격 |
| 토(土) | 비위·췌장 | 배려·공감·안정 | 관계갈등·위로식욕 |
| 금(金) | 폐·대장 | 완벽·원칙·절제 | 억눌린감정·변비 |
| 수(水) | 신장·부신 | 탐구·직관·내성 | 수면부족·호르몬 |

---

## 6. MBTI T/F 성향별 결과지 서술 분기

```javascript
// getToneStyle(mbtiType, bloodType)
// MBTI 3번째 자리: F = 감성형(isFeeling=true), T = 논리형(isFeeling=false)

// 적용 위치:
P1: buildP1ToneSentence()
  - F형: "몸이 오래전부터 신호를 보내왔어요. 이제야 제대로 읽혔습니다."
  - T형: "데이터가 가리킨 결론: BC-N. 수치와 근거는 아래에서 확인."

P2: buildP2ToneOpening()
  - F형: "새벽에 이유없이 피곤하고... 그건 OOO님 잘못이 아니었어요."
  - T형: "A01·A02 축이 임계치를 넘었습니다. 인과 사슬이 형성된 상태."

P4: buildP4ToneOpening()
  - F형: "매번 다짐하고도 무너졌던 게 의지력이 아니었어요."
  - T형: "실패의 원인은 의지력이 아닙니다. 생리 메커니즘을 데이터로 확인."

혈액형 힌트 (F/T 각각 다른 서술):
  A형 F: "계획이 어긋날 때 자책하지 마세요." / T: "규칙 준수 성향을 루틴 자동화에 활용."
  B형 F: "흥미가 식어도 포기가 아닙니다." / T: "즉흥성을 다양성 옵션으로 활용."
  O형 F: "올인하다 번아웃이 온 건 의지가 강한 O형 구조." / T: "목표 집중력을 단기 마일스톤에 활용."
  AB형 F: "감정과 논리 사이에서 지쳤던 것." / T: "냉철함과 충동 양면성을 체계로 활용."
```

---

## 7. 결과지 P1~P11 각 페이지 기능 및 사용 데이터

### P1 — BC코드 판정 (바디코드 리포트)
```
사용 데이터: bcCode, bcMaster, fullCode, axisScores, s2
개인화 로직:
  - buildP1ToneSentence(F/T분기)
  - Q3(배꼽촉진) → evidenceLines에 BC근거 서술
  - Q5(탄력측정) → evidenceLines에 셀룰라이트/지방형 서술 ← [신규구현]
  - Q2(부모체형) → evidenceLines에 유전 경향 서술
  - 경계형(isBorderline) → 이중패턴 경고 배지
```

### P2 — 10원인축 히트맵 분석
```
사용 데이터: axisScores, sorted, s3(히트맵), s2(손발냉증)
개인화 로직:
  - buildHeatmapNarrative(): s3 히트맵 → 피크시간대 → 원인축 서술
  - buildColdLimbsInsight(): Q5손발냉증 → A02(림프) vs A03(호르몬) 판별 ← [신규구현]
  - buildP2ToneOpening(F/T분기)
  - 도미노 인과사슬 (상위3축 실제 점수 기반)
```

### P3 — 오행 기질 분석
```
사용 데이터: ohaengKey, ohaeng, mbtiType, s2
개인화 로직:
  - buildTriggerOhaengCard(): Q8계기 × 오행 연결 서술
  - buildBirthMilitaryOhaengCard(): Q11출산/군대 × 오행 특이사항 ← [신규구현]
  - Q1(가족력) × 오행 유전 경향 카드
  - 오행별 기질 서술 (목/화/토/금/수 각각 다른 텍스트)
```

### P4 — 실패 트리거 분석 (잔인한 역사)
```
사용 데이터: ohaengKey, mbtiType, gender, menopause, s2, s3
개인화 로직:
  - getCruelHistoryTriggers(): Q8/Q13(흡연)/Q14(음주)/Q12(갱년기) 동적 트리거 카드
  - buildP4ToneOpening(F/T분기)
  - mbti.behaviorTag 개인화 위로 문장
  - getMbtiOhaengInsights(): BC×오행×MBTI 교차 서술
```

### P5 — 건강 위험 배너
```
사용 데이터: metrics(BMI/체지방), bcCode, axisScores, s2
개인화 로직:
  - Q1(가족력) → 유전 위험 배너
  - Q3(진단질환) → 진단별 경고
  - Q4(건강검진) → 이상소견별 경고
  - Q5(손발냉증) → 순환/호르몬 경고
  - Q6(장기복용약) → 약물유발비만 경고
  - Q13(흡연)/Q14(음주) → 생활습관 위험 경고
  - BMI 구간별 GLP-1(위고비) 처방 적합성 표시
```

### P6 — 영양제/처방 로드맵
```
사용 데이터: bcCode, ohaengType, fullCode
개인화 로직:
  - generatePrescription(bc_code, ohaeng_type, mbti): BC×오행×MBTI 교차 처방
  - 주차별(1~8주) 영양제 루틴
  - 오행별 식이 처방 다름
```

### P7 — 디자이어 (살찌기 전 모습 / 원하는 모습)
```
사용 데이터: desire(raw_answers.desire), ohaengType, mbtiType
개인화 로직:
  - _moodLabel: 감정 상태 레이블
  - _who: 닮고 싶은 대상
  - Q8계기 요약 표시
  - CSS: .p7desire-* 클래스 (보라색 계열 — 라이트모드 대응 완료)
```

### P8 — 바디맵 (체형 시각화)
```
사용 데이터: metrics, bcCode, axisScores, s2, data
개인화 로직:
  - 키/몸무게/BMI/체지방률 실측값 표시
  - BC코드별 취약 부위 하이라이트
```

### P9 — 식이 분석 / 영양 패턴
```
사용 데이터: metrics, bcCode, axisScores, data, s2
개인화 로직:
  - BC코드별 영양소 결핍 패턴
  - 오행별 식이 권장
```

### P10 — 운동/라이프스타일 처방
```
사용 데이터: bcCode, ohaengType, mbtiType
개인화 로직:
  - MBTI 운동 성향 힌트 (mbtiExerciseHint)
  - MBTI 회복 성향 힌트 (mbtiRecoveryHint)
  - 오행별 추천 운동 유형
```

### P11 — 처방전 (종합 처방 카드)
```
사용 데이터: s2 전체(Q1~Q16), s3(히트맵)
개인화 로직:
  - Q1~Q16 전체 파싱 후 3개 신규 카드:
    ① 처방 배경 카드: Q2(부모체형) + Q10(요요패턴) + Q11(출산이력) + Q16(사이즈)
    ② 주의사항 카드: Q3/Q4(진단) + Q6(약) + Q1(가족력) + Q13(흡연) + Q14(음주) + 위험도 레벨
    ③ Stage3 증상 시간대 처방 포인트: 최고 야간증상 → 역방향 처방
  - CSS: .p11-* 인라인 스타일 (보라색 계열 — 라이트모드 대응 완료)
```

---

## 8. 백엔드 주요 함수/라우트

### API 라우트 (src/index.tsx)

| 라우트 | 메서드 | 기능 |
|--------|--------|------|
| `/h/:code` | GET | 병원 QR → survey-hospital.html 서빙 + 브랜드 주입 |
| `/api/survey/submit` | POST | 설문 결과 저장 → results 테이블 |
| `/api/h/result/:id` | GET | 병원 결과 JSON 반환 (hospitalInit이 호출) |
| `/api/survey/result/public/:id` | GET | 공개 결과 조회 |
| `/result/:id` | GET | 결과지 HTML (window.__RESULT__ 서버사이드 주입) |
| `/api/b2b/brand/:code` | GET | B2B 파트너 브랜드 데이터 |
| `/api/b2b/results` | GET | B2B 파트너 결과 목록 |

### 핵심 함수 (result-hospital.html)

| 함수명 | 역할 | 위치(라인) |
|--------|------|-----------|
| `hospitalInit()` | API 호출 → window.__RESULT__ 구성 | ~5682 |
| `loadData()` | window.__RESULT__ → renderAll용 data 변환 | ~12131 |
| `renderAll(data)` | P1~P11 순차 렌더링 마스터 함수 | ~12849 |
| `getToneStyle(mbti, blood)` | F/T 분기 스타일 결정 | ~12951 |
| `buildP1ToneSentence()` | P1 T/F 분기 서브 문장 | ~12968 |
| `buildP2ToneOpening()` | P2 T/F 분기 오프닝 | ~12977 |
| `buildP4ToneOpening()` | P4 T/F 분기 오프닝 | ~12986 |
| `renderP1(…, s2)` | P1 BC코드 판정 페이지 렌더 | ~12995 |
| `renderP2(…, s3, s2)` | P2 히트맵 분석 페이지 렌더 | ~13435 |
| `buildHeatmapNarrative()` | P2 증상×시간대 서술 IIFE | ~13530 |
| `buildColdLimbsInsight()` | P2 손발냉증→A02/A03 판별 IIFE | ~13607 |
| `renderP3(…, s2)` | P3 오행기질 페이지 렌더 | ~13805 |
| `buildTriggerOhaengCard()` | P3 계기×오행 연결 IIFE | ~13932 |
| `buildBirthMilitaryOhaengCard()` | P3 출산/군대×오행 특이사항 IIFE | ~14033 |
| `renderP4(…, s2, s3)` | P4 실패트리거 페이지 렌더 | ~14108 |
| `renderP5(…, s2)` | P5 건강위험 배너 렌더 | ~14183 |
| `renderP6(…)` | P6 영양제 로드맵 렌더 | ~15068 |
| `renderP7(…)` | P7 디자이어 페이지 렌더 | ~16336 |
| `renderP8(…, s2, data)` | P8 바디맵 렌더 | ~14580 |
| `renderP9(…, s2)` | P9 식이분석 렌더 | ~14898 |
| `renderP11(data)` | P11 처방전 종합 렌더 | ~23609 |
| `generatePrescription()` | BC×오행×MBTI 교차 처방 생성 | ~9486 |
| `getCruelHistoryTriggers()` | P4 실패트리거 카드 생성 | ~9781 |
| `getMbtiOhaengInsights()` | BC×오행×MBTI 교차 서술 | ~9739 |

---

## 9. 개인화 검증: 10,000명이 전부 다른 결과지를 받는 이유

```
개인화 변수 조합 수:
  BC코드:    10가지
  오행:       5가지
  MBTI:      16가지 (F/T 분기 실제 적용)
  혈액형:     4가지
  Q1가족력:   2가지
  Q2부모체형: 5가지
  Q3촉진:    4가지
  Q4진단:    6가지 복수선택
  Q5냉증:    3가지
  Q6약물:    6가지 복수선택
  Q7GLP-1:  2가지
  Q8계기:    6가지 복수선택
  Q9시술:    5가지 복수선택
  Q10궤적:  4가지
  Q11출산:  3가지
  Q12갱년기: 3가지
  Q13흡연:  3가지
  Q14음주:  4가지
  Q15수면:  4가지
  히트맵:   6×6=36개 조합
  갈림길:   최대 45가지 조합

이론적 조합: 10 × 5 × 16 × 4 × ... = 수천만 가지

실제 적용되는 개인화 포인트:
  P1: BC근거서술 (Q3+Q5+Q2 조합) — 최대 80가지
  P2: 히트맵 피크시간 서술 + 손발냉증 판별 — 연속적 다양성
  P3: 오행×Q8계기(5×6=30) + 오행×Q11출산(5×2=10) + 오행×Q1가족력(5×2=10)
  P4: 오행×MBTI×Q8/Q13/Q14 조합 — 수백 가지
  P5: Q1~Q6/Q13~Q15 복수선택 조합 — 수천 가지
  P11: Q1~Q16 전체 조합 — 이론상 무한
```

---

## 10. 라이트모드 CSS 수정 내역 (글자 안 보임 버그 수정 완료)

```css
/* P7 desire 카드 — 흰색→보라색 계열로 교체 */
.p7desire-mood-key { color: #9b7fc8; }   /* 라이트모드 보임 */
.p7desire-mood-val { color: #4a2d80; }
.p7desire-who-tx   { color: #3d2060; }
.p7desire-who-tx b { color: #6b3fb0; }
.p7desire-part-tag { color: #6b3fb0; }

/* P11 처방전 인라인 스타일 — 흰색→보라색 계열로 교체 */
라벨:      color:#7c55b0
moodLabel: color:#5c35a0
partLabel: color:#6b3fb0
설명:      color:#7a6a90
레이블:    color:#9b7fc8
```

---

## 11. 현재 배포 상태

| 항목 | 내용 |
|------|------|
| 배포 URL | https://slimmind.kr |
| 플랫폼 | Cloudflare Workers (Genspark Hosted) |
| DB | Cloudflare D1 SQLite |
| 최종 커밋 | `2988bde` — fix: DESIGN_ROADMAP 미구현 3항목 완성 |
| Worker 번들 크기 | 214.99 kB |
| 빌드 상태 | ✅ SUCCESS |
| 배포 상태 | ✅ LIVE |

---

## 12. 남은 개선 가능 항목 (미구현)

| 항목 | 우선순위 | 비고 |
|------|---------|------|
| Q15 수면시간 → P4/P5 연계 심층 서술 | 중 | P5에 기본 경고만 있음 |
| Stage4 갈림길 응답 → P2 원인축 보정 서술 | 중 | s4 파싱은 되나 서술 없음 |
| 혈액형×오행 교차 처방 심화 | 낮 | 현재 P1 혈액형 힌트만 |
| MBTI 16가지 완전 분기 | 낮 | 현재 F/T 2가지만 분기 |
| P10 운동 처방 Q15(수면)×Q14(음주) 연계 | 낮 | 미구현 |
