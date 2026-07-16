# SlimMind 병원용 결과지 기술 명세서
## `result-hospital.html` — B2B 바바성형외과 버전 (김예슬 고객 기준)

> **작성일**: 2026-07-16  
> **파일 위치**: `/public/result-hospital.html`  
> **총 라인**: 26,743 lines  
> **배포 URL**: `https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com`  
> **용도**: AI 개발자가 이 문서만 보고 다른 결과지 버전과 비교·업데이트할 수 있도록 전체 구조·함수·매핑 흐름을 기술한 완전 기술 명세서

---

## 목차

1. [전체 아키텍처](#1-전체-아키텍처)
2. [데이터 흐름 — 입력 → 계산 → 렌더](#2-데이터-흐름)
3. [질문지 구조 (Stage 1~4)](#3-질문지-구조)
4. [BC 엔진 — 11축 계산 & BC코드 결정](#4-bc-엔진)
5. [페이지별 렌더 함수 상세](#5-페이지별-렌더-함수)
   - [Page 1 — 나의 바디코드 (renderP1)](#page-1--나의-바디코드)
   - [Page 3 — 타고난 기질 (renderP3)](#page-3--타고난-기질)
   - [Page 4 — 다이어트 잔혹사 (renderP4)](#page-4--다이어트-잔혹사)
   - [Page 5 — 핵심 처방 (renderP5)](#page-5--핵심-처방)
   - [Page 8 — 맞춤 비율 (renderP8)](#page-8--맞춤-비율)
   - [Page 6 — 12주 로드맵 (renderP6)](#page-6--12주-로드맵)
   - [Page 9 — 변화 예측 (renderP9)](#page-9--변화-예측)
   - [Page 7 — 한 장 요약 (renderP7)](#page-7--한-장-요약)
   - [Page 10 — 오늘 탭 (renderDailyPage)](#page-10--오늘-탭)
6. [핵심 데이터 테이블](#6-핵심-데이터-테이블)
7. [영양제 시스템 (WOW6)](#7-영양제-시스템)
8. [B2B 성형외과 전용 기능](#8-b2b-성형외과-전용-기능)
9. [목차 커버 오버레이](#9-목차-커버-오버레이)
10. [모바일 반응형 규칙](#10-모바일-반응형-규칙)
11. [쿠팡 링크 매핑 테이블](#11-쿠팡-링크-매핑-테이블)
12. [업데이트 가이드](#12-업데이트-가이드)

---

## 1. 전체 아키텍처

```
result-hospital.html (단일 파일 SPA)
│
├── <style>          CSS 전체 (line ~1 ~ ~6000)
├── HTML 섹션        커버 오버레이 + nav + page1~11 (line ~6000 ~ ~7200)
│
└── <script>         JS 전체 (line ~7200 ~ ~26743)
    │
    ├── [인라인 DB] bc-definitions.js (line ~7193)
    │   ├── BC_DEFINITIONS          — 30개 BC코드 전체 정의
    │   ├── EDEMA_PROTOCOL          — 부종 프로토콜
    │   ├── MENOPAUSE_PROTOCOL      — 갱년기 프로토콜
    │   ├── MEDICAL_CONDITIONS      — 질환별 주의사항
    │   └── PRIVACY_POLICY          — 면책 고지
    │
    ├── [인라인 엔진] bc-engine.js (line ~8458)
    │   ├── BC_MASTER               — BC 1~9 메타 (닉네임·색상·의학명)
    │   ├── AXIS_10_META            — 10대 원인축 정의 (A01~A10)
    │   ├── NICKNAME_TABLE          — [Top1][Top2][배경] → 닉네임 매핑
    │   ├── NICKNAME_TO_BC          — 닉네임 → BC코드 역매핑
    │   ├── CAUSAL_AXIS_META        — 레거시 8축 메타
    │   ├── computeNickname()       — 닉네임 결정 함수
    │   ├── computeBCCode()         — BC코드 결정 메인 함수
    │   └── BC_PRESCRIPTION_DB      — BC별 처방 DB
    │
    └── [결과지 렌더] result-hospital.js (line ~12075 ~)
        ├── loadData()              — 데이터 로딩 (3순위 폴백)
        ├── renderAll()             — 전체 렌더 진입점
        ├── renderP1~P9, P11        — 탭별 렌더 함수
        ├── renderDailyPage()       — 오늘 탭 렌더
        ├── getRoadmapWeeks()       — 12주 처방 생성
        ├── computeNutrition()      — 칼로리/영양소 계산
        └── WOW1~6 초기화 함수     — 부가 기능 모듈
```

---

## 2. 데이터 흐름

### 전체 데이터 파이프라인

```
[설문 서버 DB]
    │
    │  window.__RESULT__ (서버사이드 주입)
    ▼
loadData()                          ← line 12404
    │
    │  data = {
    │    userName, axisScores{A01~A10},
    │    ohaengType, mbtiType, bloodType,
    │    _stage2(설문답변), _stage3(수면히트맵),
    │    _stage4(체성분), goal_weight, weight_loss_pct
    │  }
    ▼
renderAll(data)                     ← line 13122
    │
    ├─ computeBCCodeSafe()           ← BC코드 결정
    │   └─ computeNickname()         ← 닉네임 결정
    │
    ├─ generatePrescription()        ← BC×오행×MBTI 처방 생성
    │
    ├─ getToneStyle()                ← MBTI T/F 말투 분기
    │
    ├─ renderP1~P9, P11              ← 각 탭 렌더
    │
    ├─ renderP6() → getRoadmapWeeks() → computeNutrition()
    │   └─ window.__ACTIVE_WEEKS__   ← P10에서 사용
    │
    └─ renderDailyPage()             ← 오늘 탭 (P10)
```

### 데이터 소스 우선순위 (loadData)

| 순위 | 소스 | 조건 |
|------|------|------|
| 0 | `window.__RESULT__` | 서버사이드 주입 (공유링크 접근 시) |
| 1 | URL `?data=` 쿼리파라미터 | JSON 인코딩된 데이터 |
| 2 | `localStorage['slimmind_result']` | 설문 완료 후 저장 |
| 3 | `localStorage['slimmind_answers']` | raw 답변 폴백 |

---

## 3. 질문지 구조

### Stage 구분

| Stage | 설명 | 코드 키 | 주요 항목 |
|-------|------|---------|---------|
| **_stage2** | 증상 설문 (메인) | `s2['q1']` ~ `s2['q14']` | 가족력·질환·약물·트리거·갱년기 |
| **_stage3** | 수면 히트맵 | `s3['sleep']` | 수면 패턴 배열 (0~6: 월~일) |
| **_stage4** | 체성분 | `s4['bfr']`, `s4['muscle']` | 체지방률, 근육량 |
| **axisScores** | 11축 점수 | `A01`~`A10` | BC 엔진 입력값 (0~100) |

### _stage2 질문 키 매핑

| 키 | 설문 내용 | 사용 페이지 |
|----|---------|-----------|
| `q1` / `q1_family` | 가족력 (부모 비만·당뇨 등) | P3, P5 |
| `q2` / `q2_parent` | 부모 체형 | P1 |
| `q3` / `q3_disease` | 기저질환 (갑상선·당뇨 등) | P1, P5 |
| `q4` / `q4_checkup` | 최근 건강검진 이상 | P5 |
| `q5` / `q5_cold` | 손발 냉증 | P1, P5 |
| `q5_elasticity` | 피부 탄력 | P1 |
| `q6` / `q6_drugs` | 장기 복용 약물 | P5, P11 |
| `q7` / `q7_appetite` | 식욕억제제 복용 이력 | P5 |
| `q8` / `q8_trigger` | 다이어트 실패 트리거 | P3, P4, P5 |
| `q9` / `q9_procedures` | 과거 시술 이력 | P5, P11 |
| `q10` / `q10_history` | 과거 다이어트 이력 | P4, P5 |
| `q11` / `q11_birth` | 출산 이력 | P3 |
| `q12` / `q12_menopause` | 갱년기 여부 | P4, P5, P11 |
| `q13` / `q13_smoke` | 흡연 (0=비흡연, 1=흡연) | P4 |
| `q14` / `q14_alcohol` | 음주 (0=없음, 1=주1~2, 2=주3+) | P4, P10 |
| `q01` / `gender` | 성별 | P4, renderAll |

---

## 4. BC 엔진

### 10대 원인축 (A01~A10)

| 축 | 레이블 | 의미 | BC 연관 |
|----|--------|------|---------|
| A01 | 인슐린·내장 | 식후 혈당 반응 + 복부 내장지방 | BC-3 |
| A02 | 림프순환 | 하체·상체 림프/정맥 순환 | BC-1 |
| A03 | 호르몬 | 에스트로겐·갑상선·성호르몬 | BC-4, BC-5 |
| A04 | 근감소 | 근육량·기초대사량·이화작용 | BC-9 |
| A05 | 소화·장 | 장내 환경·소화·가스 팽만 | BC-6 |
| A06 | 골격·복압 | 골반 정렬·복압·코어 | BC-2 |
| A07 | 코르티솔 | 부신·스트레스 호르몬 | BC-6, BC-7 |
| A08 | 심리·식이 | 감정적 섭식·식욕 조절 | BC-8 |
| A09 | 대사위험 | 대사증후군·혈압·혈당 | BC-3 |
| A10 | 기질·성향 | 오행+MBTI 행동 패턴 (톤 필터) | 전체 |

### BC코드 결정 로직 (computeBCCode)

```javascript
// 1단계: axisScores 정렬 → Top1/Top2 축 결정
const sorted = Object.entries(axisScores).sort((a,b) => b[1]-a[1]);

// 2단계: computeNickname() → NICKNAME_TABLE[Top1][Top2][배경필터] → 닉네임
// 배경필터: '유전'|'모계유전'|'출산'|'갱년기'|'시술'|'약물'|'PCOS'|'번아웃'|'대사증후군'|'default'

// 3단계: NICKNAME_TO_BC[닉네임] → BC코드
// 폴백: _TOP1_TO_BC_DEFAULT[Top1축] → BC코드

// 4단계: 4대 지표 계산
metaAge    = 40 + A03*0.15 + A07*0.10    // 대사 나이
metaBelly  = A01*0.8 + A05*0.2           // 내장지방 위험도
metaHormone= A03*0.6 + A07*0.4           // 호르몬 불균형도
metaBody   = A06*0.7 + A02*0.3           // 체형 왜곡도
```

### BC 9가지 코드

| BC코드 | 닉네임 | 의학명 | Top축 | 핵심 처방 방향 |
|--------|--------|--------|-------|--------------|
| BC-1 | 오후만되면 코끼리다리형 | 하지 림프·정맥 울혈성 | 관 | 림프 펌프 활성화 |
| BC-2 | 목짧아지는 거북이형 | 경추·흉추 보상성 림프 차단 | 형 | 척추 정렬·림프절 개방 |
| BC-3 | 남산 수박배형 | 인슐린 저항성·내장 비대 | 식 | 혈당 안정화·저탄 식이 |
| BC-4 | 물만마셔도 요요형 | 갑상선 셧다운·초절전 | 확 | 갑상선 재활성화 |
| BC-5 | 셀룰라이트 귤껍질형 | 바탕질 변성·지방 섬유화 | 한 | 항염·섬유화 분해 |
| BC-6 | 스트레스성 야식부엉이형 | 부신 피로·자율신경 교란 | 심 | 코르티솔 차단·장 복구 |
| BC-7 | 출산후 바람빠진풍선형 | 릴랙신 이완·산후 구조 정체 | 복 | 코어 복압 재건 |
| BC-8 | 운동할수록 말벅지형 | 알파 수용체 우세·하체 과발달 | 관 | 저강도 유산소 위주 |
| BC-9 | 팔다리거미 올챙이배형 | 근감소성 이화작용·마른 비만 | 약 | 근합성·단백질 우선 |

### 칼로리 계산 (computeNutrition)

```javascript
// Mifflin-St Jeor 공식 (여성 기준, 연령 35세 fallback)
BMR = 10 × goalWeight + 6.25 × height - 5 × 35 - 161

// 활동계수
감량률 ≤10% → 1.375 (보통 활동)
감량률 >10% → 1.200 (가벼운 활동)

TDEE = BMR × 활동계수

// 결핍 칼로리
감량률 ≤5%  → -200 kcal
감량률 ≤10% → -300 kcal
감량률 ≤20% → -400 kcal
감량률 >20% → -500 kcal

targetKcal = max(1200, TDEE - deficit)

// 기본 탄단지 비율
감량률 <20% → 탄:단:지 = 40:30:30
감량률 ≥20% → 탄:단:지 = 35:30:35  (저탄 강화)
```

---

## 5. 페이지별 렌더 함수

### Page 1 — 나의 바디코드

**함수**: `renderP1(userName, bcCode, bcMaster, fullCode, metrics, axisScores, nicknameDisplay, background, isBorderline, borderlineDiff, secondaryBcCode, secondaryNickname, evidenceBadge, _s2)`

**line**: ~13278

**주요 렌더 내용**:

| 섹션 | 데이터 소스 | 내용 |
|------|-----------|------|
| 헤더 닉네임 | `nicknameDisplay` | BC 닉네임 (ex: 스트레스성 야식부엉이형) |
| fullCode 배지 | `fullCode` | 닉네임 · 오행 · MBTI 3중 코드 |
| 4대 지표 게이지 | `metrics.metaAge/Belly/Hormone/Body` | 대사나이·내장지방·호르몬·체형 |
| 축 레이더 차트 | `axisScores` | A01~A10 방사형 차트 |
| 경계형 배지 | `isBorderline, borderlineDiff` | 두 BC 점수 차 ≤5점 시 표시 |
| 증거 등급 배지 | `evidenceBadge` | Tier1/2/3 |
| 배경 필터 설명 | `background` | '갱년기'·'출산'·'약물' 등 맞춤 설명 |
| 피부탄력 (_s2.q5_elasticity) | `_s2['q5_elasticity']` | 피부 상태 인사이트 카드 |
| 냉증 카드 | `_s2['q5']` | 손발 냉증 → 혈액순환 처방 |
| 가족력 카드 | `_s2['q2']` | 부모 체형 → 유전 패턴 설명 |

**말투 분기**: `__TONE__ = getToneStyle(mbtiType, bloodType)`
- MBTI 3번째 자리 F → 감성형 (공감 중심)
- MBTI 3번째 자리 T → 논리형 (수치·근거 중심)

---

### Page 3 — 타고난 기질

**함수**: `renderP3(userName, bcCode, bcMaster, ohaengKey, ohaeng, mbtiType, mbti, fullCode, prescription, answers, bloodType, _s2)`

**line**: ~14196

**주요 렌더 내용**:

| 섹션 | 데이터 소스 | 내용 |
|------|-----------|------|
| 오행 기질 카드 | `SAJU_ELEMENT_DESC[ohaengType]` | 목·화·토·금·수 기질 특성 |
| MBTI 분석 | `MBTI_DESC[mbtiType]` | 16 MBTI 유형별 다이어트 패턴 |
| BC×기질 처방 톤 | `prescription.prescriptionTone` | 기질별 맞춤 언어 처방 |
| 오행 핵심 식품 | `prescription.ohaengKeyFoods` | BC 영양 우선순위×오행 식품 교차 3종 |
| 오행 식단 추가 | `prescription.ohaengDietAdd` | 오행별 추가 식이 지침 |
| 오행 운동 추가 | `prescription.ohaengExerciseAdd` | 오행별 추가 운동 처방 |
| 오행 회복 추가 | `prescription.ohaengRecoveryAdd` | 오행별 회복 루틴 |
| 가족력 인사이트 | `_s2['q1']` | 가족력→유전 패턴 연결 |
| 출산 이력 | `_s2['q11']` | 출산력→릴랙신 영향 설명 |
| 자가 보충제 체커 | `WOW6_CHECKER_MAP` | 현재 복용 중인 영양제 궁합 분석 |

**오행 5가지 처방 방향**:

| 오행 | 핵심 장기 | 다이어트 취약점 | 식단 방향 |
|------|---------|--------------|---------|
| 목(木) | 간·담 | 독소 축적, 지방간 | 해독 채소·씀바귀류 |
| 화(火) | 심장·소장 | 야식·열성 스트레스 | 쓴맛·심장 보호 식품 |
| 토(土) | 비·위 | 소화 불량·단맛 의존 | 소화 효소·단맛 대체 |
| 금(金) | 폐·대장 | 장 독소·완벽주의 | 식이섬유·발효식품 |
| 수(水) | 신장·방광 | 부종·냉성 체질 | 이뇨 식품·온열 치료 |

---

### Page 4 — 다이어트 잔혹사

**함수**: `renderP4(userName, ohaengKey, mbtiType, gender, menopause, _s2, _s3)`

**line**: ~14499 (실제 렌더 content는 `getCruelHistoryTriggers()` 로 생성)

**`getCruelHistoryTriggers()` 함수** (line ~9947):

| 트리거 소스 | 데이터 키 | 내용 |
|-----------|---------|------|
| q8 다이어트 실패 원인 | `_s2['q8']` | 선택지 배열 → 개인화 트리거 카드 |
| q14 음주 | `_s2['q14']` | 음주 패턴 → 도파민 교란 설명 |
| q13 흡연 | `_s2['q13']` | 흡연 → 코르티솔 영향 |
| q10 다이어트 이력 | `_s2['q10']` | 과거 실패 패턴 분석 |
| s3 수면 히트맵 | `_s3['sleep']` | 야간 수면 교란 → 코르티솔 설명 |
| 갱년기 | `menopause` | 호르몬 변화 → 실패 원인 연결 |
| MBTI | `mbtiType` | 퍼스낼리티 기반 실패 패턴 |
| 오행 | `ohaengKey` | 기질별 취약 트리거 |

**긴급도 계산** (`_computeTriggerUrgency`, line ~10189):
- `elapsed` = 마지막 다이어트 실패 후 경과일
- 점수 높을수록 우선 표시

---

### Page 5 — 핵심 처방

**함수**: `renderP5(metrics, bcCode, axisScores, userName, _s2, _s3)`

**line**: ~14623

**`window._top3` 설정** (P5에서 전역 세팅, P10 미반영 상태):

```javascript
// P5 상단에서 11축 우선순위 top3 세팅
window._top3 = sorted.slice(0,3).map(([k]) => k);
// ex: ['A07','A05','A08'] → 코르티솔·장·심리 순
```

**주요 렌더 섹션**:

| 섹션 | 데이터 소스 | 내용 |
|------|-----------|------|
| 11축 우선순위 바 | `axisScores` | A01~A10 상위 3축 강조 |
| BC 처방 핵심 메시지 | `BC_PRESCRIPTION_DB[bcCode].coreMessage` | BC별 핵심 처방 1문장 |
| 금지 운동 | `prescription.exerciseBan` | BC별 하면 안되는 운동 |
| 권장 운동 | `prescription.exerciseOk` | BC별 최적 운동 |
| 식이 방향 | `prescription.dietDirection` | BC별 식단 방향 |
| 기저질환 주의 | `_s2['q3']` | 갑상선·당뇨 등 질환별 처방 주의사항 |
| 약물 주의 | `_s2['q6']` | 장기 복용 약물별 영양소 상호작용 |
| 시술 이력 | `_s2['q9']` | 과거 시술 → 재시술 고려사항 |
| 갱년기 처방 | `_s2['q12']` | MENOPAUSE_PROTOCOL 연결 |
| 수면 처방 | `_s3['sleep']` | 수면 패턴 → 회복 처방 |
| 크로노 영양 | `renderChrono(bcCode)` | BC별 시간대별 영양 타이밍 |
| 식욕억제제 | `_s2['q7']` | 복용 이력 → 도파민 교란 설명 |

---

### Page 8 — 맞춤 비율

**함수**: `renderP8(metrics, bcCode, axisScores, userName, _s2, data)`

**line**: ~15978

**주요 렌더 내용**:

| 섹션 | 데이터 소스 | 내용 |
|------|-----------|------|
| 탄단지 파이 차트 | `computeNutrition()` | 목표체중 기준 탄:단:지 비율 |
| 주차별 비율 변화 | `__ACTIVE_WEEKS__[i].carbG/proteinG/fatG` | 1~12주차 영양 변화 |
| BC별 비율 강조 | `BC_PRESCRIPTION_DB[bcCode]` | BC별 특화 비율 강조 |
| 오행 매크로 노트 | `ohaengOverlay.diet_macro_note` | 오행별 탄단지 보정 메모 |
| 목표 BMI | `data.goal_weight, data.bmi` | 현재 vs 목표 체성분 비교 |
| 11축 레이더 | `axisScores` | ax11Replay() 애니메이션 |

---

### Page 6 — 12주 로드맵

**함수**: `renderP6(userName, fullCode, ohaengType, inputData)`

**line**: ~16907

**12주 처방 생성 파이프라인** (`getRoadmapWeeks`, line ~11631):

```
① bcKey 결정
   bc_primary 닉네임 or 코드 → NICKNAME_TO_BC → 'BC-6' 등

② BC_ROADMAP_DB[bcKey] 로드
   → 12주차 기본 처방 배열

③ NICKNAME_OVERLAY 로드 (닉네임별 추가 레이어)
   → exercise_add, diet_add, recovery_add override

④ OHAENG_OVERLAY[ohaengType] 로드 (오행 추가 레이어)
   → 금기질: "올-오-낫씽 식단 금지", diet_macro_note 등

⑤ computeNutrition() 호출
   → 목표체중 기반 kcal/탄/단/지 주차별 계산

⑥ 12주차 합성 처방 생성
   → window.__ACTIVE_WEEKS__ 저장 (P10 오늘탭에서 사용)
```

**각 주차 데이터 구조**:

```javascript
{
  week: 1,                    // 주차 번호
  exercise_ok: '저강도 유산소',   // 이번 주 권장 운동
  exercise_ban: '고강도 인터벌',  // 이번 주 금지 운동
  exercise_detail: '월·수·금 — 30분 걷기 / 화·목 — 스트레칭',
  diet_ok: '발효식품 우선',       // 식단 방향
  diet_note: '야식 금지',         // 식단 주의사항
  meal_plan: '아침: 계란·김치찌개 / 점심: 현미밥·된장국 / 저녁: 두부·채소볶음',
  recovery_ok: '마그네슘 + 4·7·8 호흡', // 회복 루틴
  ohaeng_caution: '올-오-낫씽 식단 금지',  // 오행 주의사항
  failure_expose: '{USER_NAME}님의 가장 큰 실패 패턴은…',
  kcal: 1200,                  // 목표 칼로리
  carbG: 105, proteinG: 99, fatG: 43   // 탄단지 그램
}
```

**ROADMAP_PHASES** (4단계):

| Phase | 주차 | 이름 | 목표 |
|-------|------|------|------|
| 1 | 1~3주 | 독소 배출기 | 장 환경 복구·코르티솔 차단 |
| 2 | 4~6주 | 대사 회복기 | 호르몬 안정·기초대사 회복 |
| 3 | 7~9주 | 체형 재구성기 | 체지방 분해·근육 보존 |
| 4 | 10~12주 | 유지 정착기 | 새 습관 고착·재발 방지 |

---

### Page 9 — 변화 예측

**함수**: `renderP9(metrics, bcCode, axisScores, data, _s2)`

**line**: ~16531

**주요 렌더 내용**:

| 섹션 | 데이터 소스 | 내용 |
|------|-----------|------|
| 변화 시뮬레이션 그래프 | `wow2Render()` | 12주 체중 변화 예측선 |
| BC 예상 결과 | `BC_PRESCRIPTION_DB[bcCode]` | BC별 12주 후 기대 변화 |
| 대사나이 변화 | `metrics.metaAge` | 현재 대사나이 → 12주 후 예측 |
| 체성분 변화 | `data.bfr, data.muscle_kg` | 체지방률·근육량 변화 예측 |
| 컨설턴트 연결 CTA | `p9GoConsult()` | 상담 예약 버튼 |

---

### Page 7 — 한 장 요약

**함수**: `renderP7(userName, bcCode, bcMaster, metrics, ohaengType, mbtiType, fullCode, nicknameDisplay, prescription, data)`

**line**: ~18172

**주요 렌더 내용**:

| 섹션 | 데이터 소스 | 내용 |
|------|-----------|------|
| 핵심 요약 카드 | BC + 오행 + MBTI | 3중 코드 1장 요약 |
| desire 목표 카드 | `data._desire, _who, _partLabels` | "누구를 위해·어느 부위" 개인 목표 |
| 타임라인 | `p7AnimTimeline()` | 12주 변화 애니메이션 |
| 공유 버튼 | `p7ShareInsta()`, `p7CopyLink()` | SNS 공유·링크 복사 |
| 상담 예약 CTA | `p7BookConsult()` | 컨설턴트 연결 |

---

### Page 10 — 오늘 탭

**함수**: `renderDailyPage()`

**line**: ~19577

**서브탭 3개 구조**:

```
Page 10
├── [오늘 할 일]    p10-pane-today    → renderDailyPage()
├── [주간 로드맵]   p10-pane-roadmap  → renderRoadmapAccordion()
└── [나의 기록]     p10-pane-record   → renderLiveRecord()
```

**오늘 할 일 카드 개인화 매핑**:

| 섹션 | 데이터 소스 | 개인화 방식 |
|------|-----------|-----------|
| **운동** | `__ACTIVE_WEEKS__[currentWeek].exercise_ok` | 현재 주차 처방 |
| 요일별 분기 | `parseExerciseSplit()` | 월수금/화목/토/일 분리 |
| MBTI 힌트 | `MBTI_EXERCISE_HINT[mbtiType]` | 16 유형별 운동 성향 힌트 |
| **식단** | `getOhaengDietShort(ohaengType, bcCode)` | 오행×BC 교차 핵심 식품 |
| **회복** | `__ACTIVE_WEEKS__[currentWeek].recovery_ok` | 현재 주차 회복 루틴 |
| MBTI 회복 힌트 | `MBTI_RECOVERY_HINT[mbtiType]` | 16 유형별 회복 성향 힌트 |
| 오행 주의 배지 | `w.ohaeng_caution` | 오행별 이번 주 주의사항 |
| 수면×음주 인사이트 | `_s3.sleep` + `_s2.q14` | 수면 불량·음주 교차 처방 |

**주차 자동 계산**:

```javascript
// localStorage 최초 진입일 기준
var startKey = 'slimmind_start_' + sid;
var startDate = localStorage.getItem(startKey) || todayKey;
localStorage.setItem(startKey, startDate);  // 최초 1회만 저장

var elapsed = floor((today - startDate) / 86400000);  // 경과일
var currentWeekIdx = min(floor(elapsed / 7), 11);     // 최대 12주차(idx 11)
var w = __ACTIVE_WEEKS__[currentWeekIdx];
```

**수면×음주 교차 인사이트 카드** (3분기):

| 조건 | 카드 제목 | 처방 방향 |
|------|---------|---------|
| 수면불량 + 음주 | 수면 불량 × 음주 — 복합 코르티솔 차단 처방 | 저강도 유산소 + 마그네슘 |
| 수면불량 단독 | 수면 불량 감지 — 오늘 회복이 가장 중요한 운동 | 스트레칭 15분 + 테아닌 |
| 음주 단독 | 음주 패턴 — 오늘 간 회복 처방 | 밀크시슬 + 물 2L |

**주간 로드맵 탭** (`renderRoadmapAccordion`, line ~20193):
- `__ACTIVE_WEEKS__` 12주차 아코디언 렌더
- 오행 타입·컨설턴트명 헤더 표시
- 주차별 운동/식단/회복 상세 + 체크 그리드

**나의 기록 탭** (`renderLiveRecord`, line ~20784):
- localStorage 기반 운동/식단/회복 체크 기록
- 주간 달성률 그래프
- 음식 칼로리 로그 (`renderFoodLog`)
- 운동 칼로리 로그 (`renderExcalLog`)

---

## 6. 핵심 데이터 테이블

### SAJU_ELEMENT_DESC (오행 정의)

```javascript
// 목·화·토·금·수 각각:
{
  label: '금기질',
  icon: '🪙',
  color: '#B8860B',
  nutriTip: '폐·대장 건강 식품 우선',
  nutriFoods: {
    '단백질': ['흰 살 생선', '두부', '닭가슴살'],
    '식이섬유': ['무', '배추', '연근'],
    '수분': ['배', '수박', '오이']
  }
}
```

### OHAENG_OVERLAY (오행별 로드맵 오버레이)

```javascript
// 금(金) 오행 예시:
{
  diet_add: '폐·대장 독소 배출을 위해 무·연근·배추김치 우선',
  diet_macro_note: '탄수화물:단백질:지방 = 38:30:32 (오메가3 우선)',
  exercise_add: '호흡 운동 필수 — 복식 호흡·수영 권장',
  recovery_add: '폐 보호 — 찬바람 차단, 숙면 중시',
  tone_caution: '올-오-낫씽 식단 금지 — 한 번 어기면 전부 포기하는 패턴이 금 기질의 최대 함정입니다.',
  ohaeng_caution: '하루 한 번 어겼다고 전부 포기하지 마세요'
}
```

### BC_PRESCRIPTION_DB (BC별 처방)

```javascript
// BC-6 예시:
{
  label: '스트레스성 야식부엉이형',
  icon: '🦉',
  coreMessage: '밤 9시 이후 가짜 허기를 코르티솔 역류로 인식하면 의지력 없이도 멈출 수 있습니다.',
  exerciseBan: '고강도 HIIT (코르티솔 추가 자극)',
  exerciseOk: '가벼운 유산소 + 요가·필라테스',
  dietDirection: '저당·고섬유 식이 + 발효식품 위주',
  b2b: '장내 환경 복구 프로그램 연계 권장',
  care: '프로바이오틱스·마그네슘 우선 처방'
}
```

### BC_ROADMAP_DB (BC별 12주 기본 처방)

각 BC코드마다 4주차 처방 배열 보유 (1~4주 반복하여 12주 구성):

```javascript
// BC-6, 1주차 예시:
{
  week: 1,
  phase: '독소 배출기',
  theme: '밤 9시 가짜 허기 — 코르티솔 소방',
  exercise_ok: '저강도 유산소 30분 (걷기·자전거)',
  exercise_ban: '고강도 HIIT·저녁 근력 운동',
  exercise_detail: '월·수·금 — 30분 걷기 / 화·목 — 20분 요가',
  diet_ok: '발효식품 (김치·된장·청국장) 매끼 포함',
  meal_plan: '아침: 계란·김치 / 점심: 현미밥·된장국·나물 / 저녁: 두부·채소볶음',
  recovery_ok: '취침 전 마그네슘 400mg + 4·7·8 호흡 5분',
  failure_expose: '{USER_NAME}님의 밤 야식 충동은 의지력 부족이 아닙니다...'
}
```

---

## 7. 영양제 시스템

### WOW6 영양제 모듈

**초기화**: `wow6Init(bcCode, ohaengType, menopause)` (line ~24026)

**WOW6_SUPP_DB** — BC코드별 영양제 처방:

| BC코드 | 권장 영양제 (good) | 주의 영양제 (caution) | 위험 (danger) |
|--------|-----------------|---------------------|--------------|
| BC-1 | 비타민C 고용량, 쿼세틴, 수분 2L+ | 고나트륨 식품 | 장시간 좌식 |
| BC-2 | 콜라겐, CoQ10, 마그네슘 | — | 과도한 상체 펌핑 |
| BC-3 | 베르베린, 크롬, 식이섬유(이눌린) | 과일 비타민C 고용량 | 고당분 보충제 |
| BC-4 | 셀레늄, 요오드, 비타민D | 대두 이소플라본 고용량 | 생 십자화채소 다량 |
| BC-5 | 석류 추출물, 오메가3, DIM | 미레나/피임약 복용자 | 고용량 이소플라본 |
| **BC-6** | **프로바이오틱스, 프리바이오틱스, L-글루타민** | 알코올 | 장기 항생제 |
| BC-7 | 마그네슘글리시네이트, 몬트모렌시 체리, 발레리안루트 | 오후 카페인 | 취침 전 블루라이트 |
| BC-8 | 타이로신, 5-HTP, 오메가3(DHA) | 다크초콜릿 과다 | 음주 |
| BC-9 | 단백질(WPC/WPI), 크레아틴, ZMA | 소이 프로틴 | 과도한 유산소만 |

### 구매 모달 시스템 (openSuppBuy)

**함수**: `openSuppBuy(targetName)` (line ~23944)

**SUPBUY_LINKS 쿠팡 링크 매핑** (현재 등록된 링크):

| 영양제명 | 쿠팡 상품 | 등록 여부 |
|---------|---------|---------|
| 프로바이오틱스 | product/2638550 | ✅ |
| 프리바이오틱스 | product/9643470977 | ✅ |
| L-글루타민 | product/28261156 | ✅ |
| 마그네슘 | — | ❌ 미등록 → 기본(프로바이오틱스) 링크 |
| 아시와간다 | — | ❌ 미등록 |
| 오메가3 | — | ❌ 미등록 |
| (기타 전체) | — | ❌ 미등록 → 기본 링크 |

**모달 플로우**:
```
구매 → 버튼 클릭
    → openSuppBuy('프리바이오틱스')
    → 현재 복용 중인 영양제 멀티 선택 (P3_SELF_SUPPS 28종 칩)
    → supbuyAnalyze() → WOW6_CHECKER_MAP으로 궁합 분석
    → 결과 표시 (ok/warn/neu)
    → SUPBUY_LINKS['프리바이오틱스'] → 쿠팡 링크 오픈
```

**새 링크 추가 방법** (line ~23937):
```javascript
var SUPBUY_LINKS = {
  '프로바이오틱스': 'https://coupang.com/...',
  '프리바이오틱스': 'https://coupang.com/...',
  'L-글루타민':     'https://coupang.com/...',
  // 여기에 추가:
  '마그네슘':       'https://coupang.com/...',
  '오메가3':        'https://coupang.com/...',
};
```

---

## 8. B2B 성형외과 전용 기능

### 식별 플래그

```javascript
window.__SUR_MODE__ = true;   // 성형외과 전용 모드
window.__BRAND__ = { ... };   // 브랜드 커스터마이징
```

### renderSurFace (얼굴 분석 섹션)

**함수**: `renderSurFace(data, nicknameDisplay, bcCode)` (line ~24499)

- 성형외과 전용 얼굴·부위별 분석 섹션
- `renderSurBodyContext()` — 부위별 상세 분석

### renderP11 (병원 처방 탭)

**함수**: `renderP11(data)` (line ~25565)

| 조건 | 렌더 내용 |
|------|---------|
| BMI ≥ 27 | GLP-1 (삭센다·위고비) 처방 설명 |
| 갱년기 = true | 호르몬 대체 요법 안내 |
| 과거 시술 이력 | 재시술 적합성 평가 |
| 장기 약물 복용 | 약물 상호작용 주의사항 |

### applyB2BBrand (화이트라벨)

**함수**: `applyB2BBrand()` (line ~24436)

```javascript
// window.__BRAND__ 구조
{
  name: '바바성형외과',
  logo: 'https://...',
  color: '#PRIMARY_COLOR',
  consultant_name: '담당 컨설턴트',
  phone: '02-xxx-xxxx'
}
```

---

## 9. 목차 커버 오버레이

**HTML 위치**: line ~6017~6077

**버튼 순서 (현재 최신)**:

| 순서 | 버튼 텍스트 | enterReport 인자 | 실제 page번호 |
|------|-----------|-----------------|------------|
| 1 | 나의 바디코드 | `enterReport(1)` | page1 |
| 2 | 타고난 기질 | `enterReport(3)` | page3 |
| 3 | 다이어트 잔혹사 | `enterReport(4)` | page4 |
| 4 | 핵심 처방 | `enterReport(5)` | page5 |
| 5 | 맞춤 비율 | `enterReport(8)` | page8 |
| 6 | 12주 로드맵 | `enterReport(6)` | page6 |
| 7 | 변화 예측 | `enterReport(9)` | page9 |
| 8 | 한 장 요약 | `enterReport(7)` | page7 |

**내비게이션 탭 순서** (line ~6100~6108):
page1 → page3 → page4 → page5 → page8 → page6 → page9 → page11(병원처방) → page7

---

## 10. 모바일 반응형 규칙

### 뷰포트 기준

```css
@media (min-width: 820px) { /* 데스크탑: max-width:720px 컨테이너 */ }
@media (max-width: 819px) { /* 모바일: full width */ }
@media (max-width: 480px) { /* 소형 폰 */ }
@media (max-width: 380px) { /* 초소형 폰 */ }
```

### 핵심 레이아웃 규칙

| 요소 | 적용 규칙 | 이유 |
|------|---------|------|
| `.section-wrap` | `max-width:720px; padding:0 16px` | 양쪽 16px 마진 |
| `.tdy-week` | `white-space:nowrap; flex-shrink:0` | 주차 배지 줄바꿈 방지 |
| `.tdy-done-badge` | `white-space:nowrap` | 완료 배지 줄바꿈 방지 |
| `.tdy-ohaeng-badge` | `margin-left 제거` (gap으로 통일) | 이중 마진 제거 |
| `.wgu-pop` | `max-width:min(260px,90vw)` | 팝업 화면 이탈 방지 |
| `.p10-stab` | `flex:1; white-space:nowrap` | 서브탭 균등 분할 |
| `.mealmx-scroll` | `overflow-x:auto` | 식단 매트릭스 가로 스크롤 |
| `word-break:keep-all` | 모든 설명 텍스트 | 한글 단어 분리 방지 |

---

## 11. 쿠팡 링크 매핑 테이블

> `SUPBUY_LINKS` 객체 (line ~23937) 에 영양제명 키로 추가

```javascript
var SUPBUY_LINKS = {
  // ✅ 등록 완료
  '프로바이오틱스': 'https://www.coupang.com/vp/products/2638550?itemId=12788104766...',
  '프리바이오틱스': 'https://www.coupang.com/vp/products/9643470977?itemId=23419713272...',
  'L-글루타민':     'https://www.coupang.com/vp/products/28261156?itemId=19443149698...',

  // ❌ 미등록 (링크 받으면 추가 예정)
  // BC-1: 비타민C 고용량, 쿼세틴
  // BC-2: 콜라겐, CoQ10
  // BC-3: 베르베린, 크롬
  // BC-4: 셀레늄, 요오드, 비타민D
  // BC-5: 석류 추출물, DIM
  // BC-6: (완료)
  // BC-7: 마그네슘글리시네이트, 발레리안루트
  // BC-8: 타이로신, 5-HTP
  // BC-9: 단백질(WPC/WPI), 크레아틴, ZMA
};
var SUPBUY_DEFAULT = SUPBUY_LINKS['프로바이오틱스']; // 미등록 링크 기본값
```

---

## 12. 업데이트 가이드

### 새 BC코드 추가 시

1. `BC_MASTER` — 새 BC코드 메타 추가 (line ~8469)
2. `AXIS_10_META` — 관련 축 설명 업데이트 (line ~8547)
3. `NICKNAME_TABLE` — 새 닉네임 매핑 추가 (line ~8565)
4. `NICKNAME_TO_BC` — 역매핑 추가 (line ~8833)
5. `BC_PRESCRIPTION_DB` — 처방 DB 추가 (line ~8973)
6. `BC_ROADMAP_DB` — 12주 로드맵 추가
7. `WOW6_SUPP_DB` — 영양제 DB 추가 (line ~23780)
8. `SUPBUY_LINKS` — 쿠팡 링크 추가 (line ~23937)

### 새 오행 타입 추가 시

1. `SAJU_ELEMENT_DESC` — 오행 메타 추가
2. `OHAENG_OVERLAY` — 로드맵 오버레이 추가
3. `TONE_DB` — 처방 톤 DB 추가

### 새 질문 (Stage2) 추가 시

1. `renderP5()` 내 `getVal()`로 새 키 읽기 추가
2. 해당 페이지 렌더 함수에 렌더 로직 추가
3. `loadData()` — 서버 데이터 매핑 확인

### 쿠팡 링크 추가 시

```javascript
// line 23937 SUPBUY_LINKS 객체에 추가
'영양제명': 'https://www.coupang.com/vp/products/...',
```

### 배포 플로우

```bash
# 1. 코드 수정
# 2. 빌드
npm run build
# 3. 커밋
git add -A && git commit -m "feat: 설명"
# 4. 배포 (자동 승인 요청)
gsk hosted deploy
# 5. 사용자 승인 후 완료
```

---

## 현재 고객 예시 (김예슬 — H-1784118546030-QIWSY)

| 항목 | 값 |
|------|---|
| BC코드 | BC-6 (스트레스성 야식부엉이형) |
| 오행 | 金 (금기질) |
| MBTI | ENTP |
| 진단 요약 | 부신 피로 × 자율신경 교란 × 장내환경 불균형 |
| 핵심 영양제 | 프로바이오틱스, 프리바이오틱스, L-글루타민 |
| 금지 운동 | 고강도 HIIT, 저녁 근력 운동 |
| 권장 운동 | 저강도 유산소, 요가·필라테스 |
| 오행 주의 | 올-오-낫씽 식단 금지 (금기질 완벽주의 패턴) |
| 탄단지 비율 | 38:30:32 (오메가3 우선, 폐·대장 독소 배출) |
| 1주차 주제 | 밤 9시 가짜 허기 — 코르티솔 소방 |

---

*이 문서는 result-hospital.html v4.7 기준 (2026-07-16) 작성됨*
*다음 버전 업데이트 시 이 문서도 함께 갱신 필요*
