# 슬림마인드 시스템 통합 설계 명세서 (v4.3)

> Claude Code에서 동일한 시스템을 신규 구축하기 위한 pure 개발 사양 문서.  
> 실수/버그 이력 없음. 현재 확정된 아키텍처·스키마·API 명세만 기술.

---

## 목차

1. [사업 및 서비스 개요](#1-사업-및-서비스-개요)
2. [B2B 관리자 대시보드 구조](#2-b2b-관리자-대시보드-구조-b2bhtml)
3. [진단 데이터 및 DB 구조](#3-진단-데이터-및-db-구조)
4. [결과지 화면 구성 및 데이터 매핑](#4-결과지-화면-구성-및-데이터-매핑-p1--p9)
5. [API 엔드포인트 명세](#5-api-엔드포인트-명세)

---

## 1. 사업 및 서비스 개요

### 1.1 플랫폼 개념

SlimMind는 **체형 원인 분석 → BC(Body Code) 산출 → 업종별 맞춤 처방 결과지** 를 제공하는 B2B SaaS 플랫폼이다.  
고객은 설문(Stage 1~4)을 완료하고, 서버가 10축 점수를 계산해 BC코드(BC-1~BC-16)와 닉네임(30종)을 확정한 뒤, 업종 특화 결과지 HTML을 생성·반환한다.

### 1.2 4대 B2B 업종

| 업종 | 코드 접두사 | 진단 링크 | 결과지 라우트 | 결과 API |
|------|------------|-----------|--------------|---------|
| 병원 | `B2B-HOS-*` | `/h/:code` | `/result-hospital/:id` | `GET /api/h/result/:id` |
| 에스테틱 | `B2B-AES-*` | `/a/:code` | `/result-aesthetic/:id` | `GET /api/a/result/:id` |
| 피트니스 | `B2B-FIT-*` | `/f/:code` | `/result-fitness/:id` | `GET /api/f/result/:id` |
| 미용실(살롱) | `B2B-SAL-*` | `/salon/:code` | `/result-salon/:id` | `GET /api/s/result/:id` |

- 업종 구분은 `b2b_partners.survey_category` 컬럼으로 결정 (`hospital` / `aesthetic` / `fitness` / `salon` / `integrated`).
- 각 업종별로 독립된 HTML 결과지 파일(`public/result-{업종}.html`)과 독립된 응답 저장 테이블(`{업종}_responses`)을 갖는다.

### 1.3 기술 스택

| 레이어 | 기술 |
|--------|------|
| 런타임 | Cloudflare Workers (edge) |
| 프레임워크 | Hono 4 |
| 빌드 | Vite 6 + `@hono/vite-cloudflare-pages` |
| DB | Cloudflare D1 (SQLite) |
| 정적 파일 | `hono/cloudflare-workers` `serveStatic` |
| 배포 | Cloudflare Pages (`wrangler pages deploy`) |
| 인증 | JWT (HS256) — `JWT_SECRET` Worker Secret |

### 1.4 진단 플로우 개요

```
고객 진입 (/h/:code, /a/:code, /f/:code, /salon/:code)
   ↓
survey HTML (survey-hospital.html 등) 로딩
   ↓
Stage 1~4 설문 완료
   ↓
POST /api/h/diagnosis (또는 /a, /f, /s)
   ↓
서버: 10축 점수 계산 → BC코드 결정 → DB 저장
   - 저장 대상: {업종}_responses 테이블 (1순위)
   - 저장 대상: diagnosis_results 테이블 (병행/신파이프라인)
   ↓
응답: { result_id, redirect: '/result-hospital/{id}' }
   ↓
Worker: result-hospital.html 로딩 + window.__HOSPITAL_RESULT_ID__ 주입
   ↓
클라이언트: loadHospitalResult() → GET /api/h/result/:id
   ↓
renderAll(data) → P1~P9 렌더
```

---

## 2. B2B 관리자 대시보드 구조 (b2b.html)

### 2.1 라우트

```
GET  /b2b         → b2b.html
GET  /b2b.html    → b2b.html
GET  /b2b/*       → b2b.html  (SPA catch-all)
```

### 2.2 인증 흐름

1. 클라이언트가 `POST /api/auth/login` 호출 (`code`, `password`)
2. 서버는 `b2b_partners` 테이블에서 코드 조회 → 비밀번호 검증
3. 성공 시 JWT(7일 유효) 반환 → `localStorage.setItem('sm_token', token)` 저장
4. 이후 모든 B2B API 요청: `Authorization: Bearer <token>` 헤더 전송
5. 서버 미들웨어 `requireB2B()` 가 JWT 검증 + 파트너 status 확인

**비밀번호 기본값**: 코드 마지막 숫자부분으로 자동 생성 → `b2b{마지막숫자}` (예: `B2B-AES-001` → `b2b001`)

### 2.3 대시보드 주요 기능

#### 2.3.1 파트너 정보 조회 (`GET /api/b2b/me`)

```json
{
  "code": "B2B-AES-001",
  "name": "예시 에스테틱",
  "brand_name": "예시 에스테틱",
  "brand_color": "#6366f1",
  "brand_logo_url": "https://...",
  "survey_category": "aesthetic",
  "homepage_url": "https://...",
  "aesthetic_intro": "업체 한 줄 소개",
  "status": "active"
}
```

#### 2.3.2 고객 진단 링크 생성

- 파트너 코드(`B2B-AES-001`)가 설문 URL에 포함됨: `/a/B2B-AES-001`
- 링크 진입 시 `ref_code = 'B2B-AES-001'` 로 설문 시작
- QR코드로 생성하여 현장 배포

#### 2.3.3 고객 결과 목록 (`GET /api/b2b/results`)

- 쿼리 파라미터: `search`, `from_date`, `to_date`, `page`, `limit`
- 데이터 소스 우선순위:
  1. `diagnosis_results` (신파이프라인, 중복 제거 기준)
  2. `{업종}_responses` (구파이프라인, ID 중복 제외)
  3. `results` (레거시 통합 테이블)
- 병원 파트너는 `hospital_responses`, `results`, `diagnosis_results` 3개 소스 UNION

#### 2.3.4 고객 상세 조회 (`GET /api/b2b/partner-view/:bc_code`)

- `bc_prescriptions` 테이블에서 해당 BC코드의 처방 데이터 반환
- 반환 필드: `brand_name`, `tagline`, `bc_primary_oneline_reason`, `bc_cause_story`, 처방 상세

#### 2.3.5 BC코드별 추천 서비스 (`GET /api/b2b/my-programs/:bc_code`)

- `aesthetic_programs` 테이블에서 파트너가 등록한 시술 프로그램 조회
- `bc_codes` JSON 배열에 해당 BC코드 포함 여부로 필터

#### 2.3.6 그룹 분석 (`GET /api/b2b/group-analysis`)

- 파트너 소속 전체 고객의 BC코드 분포, 축 점수 평균 반환

#### 2.3.7 서브계정 관리

```
GET    /api/b2b/subaccounts    - 서브계정 목록
POST   /api/b2b/subaccounts    - 서브계정 생성
DELETE /api/b2b/subaccounts/:code - 서브계정 삭제
```

#### 2.3.8 데이터 내보내기 (`GET /api/b2b/export-csv`)

- UTF-8 BOM 포함 CSV 반환 (엑셀 한글 호환)
- 컬럼: `결과ID`, `고객이름`, `BC코드`, `축코드`, `진단일시`, `유형`

### 2.4 화이트라벨 브랜딩

`b2b_partners` 테이블의 `brand_color`, `brand_logo_url`, `brand_name` 컬럼으로 결과지 테마 제어.  
결과지(`/result-hospital/:id` 등) 진입 시 서버사이드에서 `<style>` 태그로 CSS 변수 주입:

```html
<style>:root{--brand-color:#FF6B6B;...}
  .result-header{background:var(--brand-color)!important;}
  ...
</style>
```

---

## 3. 진단 데이터 및 DB 구조

### 3.1 핵심 테이블 목록

| 테이블 | 역할 | 마이그레이션 |
|--------|------|------------|
| `b2b_partners` | B2B 파트너 정보 + 브랜딩 + 인증 | 0025, 0048 |
| `diagnosis_results` | 신파이프라인 결과 저장 (UUID PK) | 0027, 0042, 0048 |
| `hospital_responses` | 병원 설문 응답 저장 | 0047 |
| `aesthetic_responses` | 에스테틱 설문 응답 저장 | 0062 |
| `fitness_responses` | 피트니스 설문 응답 저장 (전용 컬럼 포함) | 0063 |
| `salon_responses` | 미용실 설문 응답 저장 | 0062 |
| `bc_prescriptions` | BC코드별 처방 데이터 (관리자 편집) | 0061 |
| `bc_interpretation` | BC닉네임별 컨설턴트 해석 자료 | 0025 |
| `bc_partner_view` | BC닉네임별 파트너용 추천 3줄 뷰 | 0025 |
| `aesthetic_programs` | 에스테틱 파트너 시술 프로그램 | 0048 |
| `results` | 레거시 통합 결과 테이블 | 0001, 0021 |
| `consultants` | 컨설턴트/마스터 계정 | 0001 |

### 3.2 `b2b_partners` 테이블

```sql
CREATE TABLE IF NOT EXISTS b2b_partners (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code              TEXT UNIQUE NOT NULL,       -- 'B2B-AES-001'
  name              TEXT NOT NULL,              -- 영업장명
  type              TEXT,                       -- '에스테틱'/'필라테스'/'한의원'/'헬스장'
  owner_name        TEXT,
  phone             TEXT,
  email             TEXT UNIQUE,
  address           TEXT,
  password_hash     TEXT,                       -- 평문 저장 (현재 버전)
  commission_rate   REAL DEFAULT 15.0,
  status            TEXT DEFAULT 'pending',     -- pending/active/suspended
  brand_logo_url    TEXT,
  brand_color       TEXT DEFAULT '#6366f1',
  brand_name        TEXT,
  qr_scan_count     INTEGER DEFAULT 0,
  staff_count       INTEGER DEFAULT 0,
  memo              TEXT,
  first_login_at    TEXT,
  -- 추가 컬럼 (0048)
  homepage_url      TEXT,
  aesthetic_intro   TEXT,
  -- 추가 컬럼 (업종 구분)
  survey_category   TEXT,                       -- 'hospital'/'aesthetic'/'fitness'/'salon'/'integrated'
  created_at        TEXT DEFAULT (datetime('now')),
  updated_at        TEXT DEFAULT (datetime('now'))
);
```

### 3.3 `diagnosis_results` 테이블 (신파이프라인 핵심)

```sql
CREATE TABLE IF NOT EXISTS diagnosis_results (
  id               TEXT PRIMARY KEY,            -- UUID (result_id)
  user_name        TEXT NOT NULL,
  bc_nickname      TEXT,                        -- 확정 닉네임 (30종 중 하나)
  bc_primary       TEXT,                        -- BC코드 1순위 (BC-N 닉네임 또는 코드)
  bc_secondary     TEXT,                        -- BC코드 2순위
  bc_code_key      TEXT,                        -- 'BC-3' 형식 코드 (GLOB 'BC-[0-9]*' 필터)
  top3_axes        TEXT,                        -- JSON: ["A07","A08","A01"]
  axis_scores      TEXT,                        -- JSON: {"A01":8.2,"A02":3.1,...}
  region           TEXT,                        -- 'ABD'/'LEG'/'ARM'/'WHOLE'
  texture          TEXT,                        -- 'firm'/'soft'/'cellulite'/'edema'
  bg_filter        TEXT DEFAULT '',             -- 'birth'/'갱년기'/'약물'/'PCOS'/''
  ohaeng_type      TEXT,                        -- '목'/'화'/'토'/'금'/'수'
  mbti_full        TEXT,                        -- 'INFP' 등 4축 조합
  disp_answers     TEXT,                        -- JSON: 기질 설문 원본 답변
  raw_answers      TEXT,                        -- JSON: 전체 설문 원본
  ref_code         TEXT,                        -- B2B 파트너 코드
  survey_category  TEXT DEFAULT 'integrated',   -- 'hospital'/'aesthetic'/'fitness'/'salon'
  gender           TEXT,                        -- 추가 컬럼 (0042)
  height           REAL,
  age              INTEGER,
  phone            TEXT,
  blood_type       TEXT,
  face_shape       TEXT,
  weight           REAL,
  goal_weight      REAL,
  weight_loss_pct  REAL,
  completed_at     TEXT,
  created_at       TEXT DEFAULT (datetime('now'))
);
```

### 3.4 `hospital_responses` 테이블

```sql
CREATE TABLE IF NOT EXISTS hospital_responses (
  id                TEXT PRIMARY KEY,           -- 'H-XXXX-XXXXX' 형식
  b2b_code          TEXT NOT NULL,
  ref_code          TEXT,
  user_name         TEXT NOT NULL,
  gender            TEXT,
  age               TEXT,
  height            TEXT,
  weight            TEXT,
  phone             TEXT,
  stage1_json       TEXT,                       -- 외형 촉진 설문 JSON
  stage2_json       TEXT,                       -- 생활 설문 JSON
  stage3_json       TEXT,                       -- 원인축 설문 JSON
  stage4_json       TEXT,                       -- 통증/운동 설문 JSON
  ohaeng_type       TEXT,
  disp_type         TEXT,
  mbti_full         TEXT,
  bc_code           TEXT,                       -- 'BC-3' 등
  bc_nickname       TEXT,                       -- 30종 닉네임
  axis_scores       TEXT,                       -- JSON {"A01":72,...}
  raw_answers       TEXT,                       -- JSON 전체 응답
  goal_weight       REAL,
  weight_loss_pct   REAL,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.5 `aesthetic_responses` / `salon_responses` 테이블

`hospital_responses`와 동일한 컬럼 구조. PK 접두사만 다름:
- `aesthetic_responses`: `A-XXXX-XXXXX`
- `salon_responses`: `S-XXXX-XXXXX`

### 3.6 `fitness_responses` 테이블

`aesthetic_responses` 기본 구조 + 피트니스 전용 컬럼:

```sql
-- 피트니스 전용 추가 컬럼
exercise_response TEXT,   -- 운동반응형: '일시반응형'/'반응지속형'/'구성미변형'/'역반응형'/'회복부족형'/'저반응형'/'이력없음'
pain_gate         TEXT,   -- JSON 배열: ["목·어깨","등·허리","무릎·발목","없었어요"]
bmr               REAL,   -- Mifflin-St Jeor 공식 기초대사량
tdee              REAL,   -- BMR × 활동계수
calorie_target    REAL,   -- 섭취목표 = TDEE - 500(칼로리 적자)
activity_level    TEXT,   -- '주1~2회'/'주3~4회'/'주5+회'
bfr_current       REAL,   -- 현재 체지방률 (%)
bfr_target        REAL    -- 목표 체지방률 (%)
```

### 3.7 `bc_interpretation` / `bc_partner_view` 테이블

```sql
-- bc_interpretation: 컨설턴트 해석 자료 (마스터 편집)
CREATE TABLE IF NOT EXISTS bc_interpretation (
  bc_nickname       TEXT UNIQUE NOT NULL,   -- 30종 닉네임 키
  core_summary      TEXT,
  opening_line      TEXT,
  consult_questions TEXT,                   -- JSON 배열 (3개 질문)
  recommend_program TEXT,
  caution_note      TEXT,
  homework          TEXT
);

-- bc_partner_view: 파트너 대시보드 추천 뷰
CREATE TABLE IF NOT EXISTS bc_partner_view (
  bc_nickname    TEXT UNIQUE NOT NULL,
  recommend_1st  TEXT,                      -- 1순위 추천 서비스 + 이유
  recommend_2nd  TEXT,                      -- 2순위 추천 서비스 + 이유
  forbidden      TEXT,                      -- 금기 서비스 + 이유
  expected_price INTEGER DEFAULT 0          -- 예상 객단가 (원)
);
```

---

## 4. BC코드 산출 알고리즘

### 4.1 10축 원인 정의 (A01~A10)

| 축 | 라벨 | 주요 항목 |
|----|------|---------|
| A01 | 인슐린·내장 | 식후 혈당 반응 + 복부 내장지방 |
| A02 | 림프순환 | 하체·상체 림프·정맥 순환 |
| A03 | 호르몬 | 에스트로겐·갑상선·성호르몬 균형 |
| A04 | 근감소 | 근육량·기초대사량·이화작용 |
| A05 | 소화·장 | 장내 환경·소화 기능·가스 팽만 |
| A06 | 골격·복압 | 골반 정렬·복압·코어 안정성 |
| A07 | 코르티솔 | 부신·스트레스 호르몬·자율신경 |
| A08 | 심리·식이 | 감정적 섭식·식욕 조절·행동 패턴 |
| A09 | 대사위험 | 대사증후군·혈압·혈당 복합 위험도 |
| A10 | 기질·성향 | 오행 기질 + MBTI 행동 패턴 |

### 4.2 BC코드 결정 (`decideSubtype`)

**입력**: `axisScores` (A01~A10, 0~10 스케일), `bodyRegions` (부위 배열), `textures` (질감 배열), `flags` ({menopause: bool, …})

**알고리즘**:

```
1. menopause 플래그가 true → 즉시 BC-13 반환

2. SUBTYPE_RULES 배열에서 후보 필터링:
   - rule.regions ∩ bodyRegions ≠ ∅  AND
   - rule.textures ∩ textures ≠ ∅

3. 후보 0 → BC-3 폴백 반환

4. 각 후보에 대해 서명축 가중 점수 계산:
   score = axisScores[axes[0]] × 3
         + axisScores[axes[1]] × 2
         + axisScores[axes[2]] × 1

5. 최고 score 후보 선택 → { bc, name, signatureAxes } 반환
```

**SUBTYPE_RULES 주요 규칙 (총 25개)**:

| 부위 | 질감 | 서명축 | BC코드 | 닉네임 |
|------|------|--------|--------|--------|
| LEG | edema, soft | A02, A03, A04 | BC-1 | 오후만되면 코끼리다리형 |
| LEG, HIP | cellulite, dense | A02, A10, A03 | BC-1 | 엄마체형 하지정체형 |
| LEG, HIP | cellulite, firm | A06, A02, A04 | BC-2 | 지방흡입후 재발형 |
| ABD | firm, visceral | A01, A09, A05 | BC-3 | 아빠체형 내장비대형 |
| ABD | firm, hard | A01, A09, A07 | BC-3 | 식후기절 혈당롤러형 |
| ABD | soft, flabby | A09, A03, A01 | BC-4 | 약물부작용 강제축적형 |
| LEG, WHOLE | cold, cellulite | A03, A02, A10 | BC-5 | 여름에도 시린 얼음장형 |
| ABD, WAIST | bloat, gas | A05, A06, A02 | BC-5 | 식후임산부 가스풍선형 |
| ABD | soft, stress | A07, A08, A01 | BC-6 | 스트레스성 야식부엉이형 |
| ABD, WHOLE | soft, flabby | A04, A03, A01 | BC-6 | 팔다리거미 올챙이배형 |
| ABD | soft, loose | A06, A04, A03 | BC-7 | 출산후 바람빠진 풍선형 |
| LEG, GLUTE | firm, muscle | A04, A06, A02 | BC-7 | 운동할수록 말벅지형 |
| HIP, LEG | cellulite, posture | A06, A04, A02 | BC-8 | 골반틀어짐 승마살형 |
| NECK, BACK, SHOULDER | firm, posture | A06, A04, A02 | BC-9 | 목짧아지는 거북이형 |
| ARM, SHOULDER | soft, edema | A02, A06, A01 | BC-10 | 안 쓰는 팔뚝 부종형 |
| SHOULDER, ARM | firm, bulk | A04, A06, A08 | BC-11 | 상체근육형 |
| CHEST, BACK | soft, loose | A06, A02, A03 | BC-12 | 겨드랑이 부유방형 |
| ABD, HIP, WHOLE | soft, meno, hormone | A03, A07, A06 | BC-13 | 호르몬스위치 갱년기형 |
| WHOLE | binge, emotional | A08, A07, A03 | BC-14 | 스트레스기절 번아웃형 |
| ABD, WHOLE | visceral, multi | A09, A01, A07 | BC-15 | 대사증후군 종합형 |
| WHOLE | multi, complex | A09, A01, A08 | BC-16 | 동시다발 다중악순환형 |

### 4.3 4대 파생 지표 (`computeIndicators`)

```javascript
// 복부위험도% = (A01×0.45 + A09×0.25 + A07×0.15 + A05×0.15) × 75 + 8  [범위: 8~99]
// 호르몬부하% = (A03×0.45 + A07×0.30 + A02×0.25) × 75 + 8              [범위: 8~99]
// 체형불균형% = (A06×0.50 + A02×0.30 + A04×0.20) × 75 + 8              [범위: 8~99]
// 대사효율나이 = 실나이 + (10축평균 - 0.5) × 20                          [±4~+12세]
```

### 4.4 11영역 처방 점수 (`computeDomainScores`)

각 도메인 점수 = 해당 축점수 × 가중치 합산 / 가중치 합:

| 도메인 | 축 × 가중치 |
|--------|------------|
| recovery (회복) | A07×1.5 + A08×1.0 + A02×0.5 |
| hormone (호르몬) | A03×1.8 + A07×0.8 + A01×0.5 |
| posture (체형) | A06×1.8 + A04×1.2 + A02×0.8 |
| diet (식단) | A01×1.5 + A05×1.3 + A08×0.8 |
| exercise (운동) | A04×1.5 + A06×0.8 + A02×0.5 |
| psychology (심리) | A08×1.8 + A07×1.2 |
| oriental (한방) | A02×1.2 + A03×0.8 + A05×0.8 |
| drug (약물) | A09×1.5 + A01×0.8 + A03×0.5 |
| aesthetic (시술) | A02×1.3 + A06×1.0 + A04×0.8 + A03×0.6 |
| care (관리) | A09×1.8 + A01×1.0 + A03×0.8 |
| philosophy (철학) | A10×1.5 + A07×0.5 |

### 4.5 닉네임 결정 (`computeNickname`) — 30종 확정

**5단계 퍼널**:

```
1. 10개 축 점수 정렬 → Top1, Top2, Top3 추출
2. Top1 = A10(기질) 이면 → Top2를 실질 Top1로 사용
3. 배경 필터 감지 (detectBackground):
   우선순위: 갱년기 > PCOS > 시술 > 약물 > 출산 > 유전 > 대사증후군 > 번아웃
4. NICKNAME_TABLE[Top1][Top2][배경필터] 조회
5. 없으면 [Top1][Top2]['default'] → 없으면 [Top1]['default']['default']
```

**배경 필터 감지 소스 (멀티 소스 통합)**:

| 필터 | 에스테틱/통합 키 | 병원 키 |
|------|----------------|---------|
| 갱년기 | `Q_MENOPAUSE`, `menopause_status` | `q12_menopause` (0,1,2) |
| PCOS | `medical_conditions`에 'pcos' 포함 | `disease[0]` |
| 시술 | `procedure` (≠'none') | `past_procedures` (5=없음 제외) |
| 약물 | `meds` (≠'none') | `long_term_drugs` (6=없음 제외) |
| 출산 | `birth_history` (≠'none') | `q11_event=0` (여성만) |
| 유전 | - | `q1_family`, `q2_parent` |
| 대사증후군 | `medical_conditions`에 당뇨/고혈압/지방간 | `disease[1]`,`disease[2]` |
| 번아웃 | `stress_level >= 4` | `q8_trigger[1]` |

### 4.6 오행 체질 (A10 보조 축)

- 오행: 목형 / 화형 / 토형 / 금형 / 수형
- 설문 또는 사주 일간(日干)으로 결정
- `ohaeng_type` 컬럼에 한 글자('목'/'화'/'토'/'금'/'수') 저장
- 결과지 P3~P4 섹션의 체질별 맞춤 설명 렌더에 사용

---

## 5. 결과지 화면 구성 및 데이터 매핑 (P1 ~ P9)

### 5.1 결과지 파일 구조

| 파일 | 설명 |
|------|------|
| `public/result-hospital.html` | 병원 결과지 (단일 HTML, ~26,000줄) |
| `public/result-aesthetic.html` | 에스테틱 결과지 |
| `public/result-fitness.html` | 피트니스 결과지 |
| `public/result-salon.html` | 미용실 결과지 |

모두 동일한 JS 아키텍처를 공유한다: `loadXXXResult()` → `renderAll(data)` → `renderP1~renderP9`.

### 5.2 서버사이드 ID 주입 패턴

Worker(`/result-hospital/:id` 핸들러)가 HTML을 로딩한 뒤 `<!-- ══ 병원 전용: API 연동 + __RESULT__ 주입 ══ -->` 마커 위치에 스크립트를 삽입:

```html
<script>
window.__HOSPITAL_RESULT_ID__ = "H-abc123-xxxxx";
window.__DEPLOY_TS__          = 1724000000000;       // 캐시 버스팅용
window.__REF_CODE__           = "B2B-AES-001";       // 파트너 코드
window.__BRAND__              = {                     // B2B 화이트라벨
  code: "B2B-AES-001",
  brand_name: "예시 에스테틱",
  brand_color: "#FF6B6B",
  brand_logo_url: "https://..."
};
try {
  localStorage.setItem('sm_last_result_id', "H-abc123-xxxxx");
  localStorage.setItem('sm_survey_category', 'hospital');
} catch(e) {}
</script>
```

업종별 전역 변수:
- 병원: `window.__HOSPITAL_RESULT_ID__`
- 에스테틱: `window.__AESTHETIC_RESULT_ID__`
- 피트니스: `window.__FITNESS_RESULT_ID__`
- 살롱: `window.__SALON_RESULT_ID__`

### 5.3 데이터 로딩 흐름

```javascript
// 초기화
async function loadHospitalResult() {
  const id = window.__HOSPITAL_RESULT_ID__;
  const res = await fetch(`/api/h/result/${id}`);
  const data = await res.json();
  // data 구조 정규화 후 반환
  return {
    userName:      data.user_name,
    bc_code:       data.bc_code,       // 'BC-3'
    bc_nickname:   data.bc_nickname,   // '식후기절 혈당롤러코스터형'
    ohaengType:    data.ohaeng_type,   // '목'
    mbtiType:      data.mbti_full,     // 'INFP'
    axisScores:    data.axis_scores,   // {A01:8.2, A02:3.1,...}
    metrics: { weight, height, age, goalWeight, weightLossPct, ... },
    answers: { ...stage1, ...stage2, ...stage3, ...stage4 },
    consultant_name, created_at, ...
  }
}

// 메인 진입
window.addEventListener('DOMContentLoaded', async () => {
  const resultData = await loadHospitalResult();
  renderAll(resultData);
});
```

### 5.4 `renderAll(data)` 호출 순서

```javascript
function renderAll(data) {
  injectCoverInfo(userName, data.consultant_name, data.created_at);
  renderP1(userName, bcCode, bcMaster, fullCode, metrics, axisScores, nicknameDisplay, background, ...);
  renderP2(userName, bcCode, firstDomino, axisScores, sorted);
  renderP3(userName, bcCode, bcMaster, ohaengKey, ohaeng, mbtiType, mbti, fullCode, prescription, answers, bloodType, faceShape, axisScores, redFlags);
  renderP4(userName, ohaengKey, mbtiType, gender, menopause, axisScores, bcCode, redFlags, answers);
  renderP5(metrics, bcCode, axisScores, userName);
  renderP8(metrics, bcCode, axisScores, userName);
  renderP9(metrics, bcCode, axisScores, data);
  renderP6(userName, fullCode, ohaengType, data, bcCode, redFlags);
  renderP7(userName, bcCode, bcMaster, metrics, ohaengType, mbtiType, fullCode, nicknameDisplay, prescription, data);
  // 마지막: page10 TODAY 위젯 재렌더
  if (typeof render === 'function') { try { render(); } catch(_e){} }
}
```

### 5.5 `injectCoverInfo()` — 표지 동적 주입

```javascript
function injectCoverInfo(userName, consultantName, createdAt) {
  // 고객 이름
  document.getElementById('cover-username').textContent = userName;
  document.getElementById('p1-story-name').textContent  = userName;
  document.getElementById('story-bang').textContent     = userName + '님';
  document.getElementById('p1-leadin-nick').textContent = userName + '님';
  document.getElementById('p7-opening-name').textContent = userName + '님';
  // 컨설턴트명, 날짜
  // ...
}
```

**초기 HTML 값**: 모든 동적 주입 대상 DOM은 빈 문자열(`""`) 또는 빈 span으로 초기화.

### 5.6 섹션별 구성 및 DB 데이터 매핑

#### P1 — 바디코드 결과 카드 (표지)

| UI 요소 | DB 필드 / 계산값 |
|---------|----------------|
| `#cover-username` | `user_name` |
| `#p1-story-name` | `user_name` |
| BC코드 뱃지 | `bc_code` ('BC-3') |
| 닉네임 표시 | `bc_nickname` ('식후기절 혈당롤러코스터형') |
| 체형 카드 색상/아이콘 | `BC_MASTER[bc_code].color`, `.icon` |
| 10축 레이더 차트 | `axis_scores` (A01~A10) |
| 배경 필터 배지 | `bg_filter` (없음/출산/갱년기 등) |
| 오행 뱃지 | `ohaeng_type` |
| 실패 처방 경고 | `BC_MASTER[bc_code].failed_type_desc` |

#### P2 — 첫 번째 도미노 (원인 연쇄 분석)

| UI 요소 | DB 필드 / 계산값 |
|---------|----------------|
| Top1 축 명 | `top3_axes[0]` |
| Top2/Top3 축 명 | `top3_axes[1]`, `[2]` |
| 원인 연쇄 스토리 | BC코드 + 상위 축 조합으로 생성 |
| 축별 점수 바 | `axis_scores[A01]` ~ `axis_scores[A10]` |

#### P3 — 처방 카드 (BC코드 × 기질 융합)

| UI 요소 | DB 필드 / 계산값 |
|---------|----------------|
| 11영역 처방 점수 칩 | `computeDomainScores()` 결과 (상위 2~5개 영역) |
| 혈액형 해석 카드 | `blood_type` (A/B/AB/O형) |
| 체형/얼굴형 카드 | `face_shape` |
| 오행 체질 카드 | `ohaeng_type` |
| MBTI 처방 톤 | `mbti_full` |
| 레드플래그 경고 | `raw_answers`에서 산출된 위험 지표 |

#### P4 — 체질 × 성향 맞춤 전략

| UI 요소 | DB 필드 |
|---------|--------|
| 오행 맞춤 식단 전략 | `ohaeng_type` |
| MBTI 행동 전략 | `mbti_full` |
| 성별 분기 | `gender` ('남'/'여') |
| 갱년기 분기 | `Q_MENOPAUSE` (raw_answers 내부) |
| 레드플래그 | axis_scores 임계값 초과 항목 |

#### P5 — 12주 로드맵 & 영양 계획

| UI 요소 | DB 필드 / 계산값 |
|---------|----------------|
| 목표 체중 | `goal_weight` |
| 감량률 | `weight_loss_pct` |
| BMR | Mifflin-St Jeor: `10×weight + 6.25×height - 5×age ± 5` |
| TDEE | `BMR × 활동계수` |
| 섭취 목표 | `TDEE - 500` |
| 주차별 미션 | BC코드 + 로드맵 규칙 계산 |

#### P6 — 운동 처방 로드맵

| UI 요소 | DB 필드 / 계산값 |
|---------|----------------|
| 운동 타입 | `axisScores` 상위 축으로 분기 |
| 통증 게이트 | `pain_gate` (fitness 전용) 또는 stage4 답변 |
| 운동 단계별 계획 | BC코드별 전용 운동 처방 |
| 오행 운동 톤 | `ohaeng_type` |

#### P7 — 종합 요약 (STEP1/STEP2/STEP3)

모든 업종에서 동일한 동적 변수 사용:

```javascript
// STEP1: 현재 체성분
var bfCur   = metrics.bfr_current;           // 현재 체지방률 (%)
var fatMassCur = (weight * bfCur / 100).toFixed(1); // 체지방 질량 (kg)
var bmrCur  = Math.round(computeBMR(weight, height, age, gender));
var tdeeCur = Math.round(bmrCur * activityFactor);

setT('p7v4-bf',    bfCur);
setT('p7v4-bfmass', fatMassCur + 'kg');
setT('p7v4-bmr',   bmrCur.toLocaleString() + 'kcal');
setT('p7v4-tdee',  tdeeCur.toLocaleString() + 'kcal');

// STEP2: 영양 목표
var deficit = 500;
setT('p7v4-tdee2',  tdeeCur.toLocaleString());
setT('p7v4-deficit', deficit.toLocaleString());

// STEP3: 12주 예측
setT('p7v4-r-curbf',  bfCur);
setT('p7v4-r-curbmr', bmrCur.toLocaleString());
```

#### P8 — BC코드 처방 상세 (전문 의학 해석)

| UI 요소 | DB 필드 |
|---------|--------|
| BC 명칭 | `BC_MASTER[bc_code].medical_title` |
| 처방 상세 내용 | `bc_prescriptions` 테이블 (BC코드로 조회) |
| 도메인별 처방 | `computeDomainScores()` 상위 도메인 |

#### P9 — 체성분 예측 그래프

| UI 요소 | DB 필드 / 계산값 |
|---------|----------------|
| 현재 체지방률 | `bfr_current` 또는 자체 계산 |
| 목표 체지방률 | `bfr_target` |
| 12주 감량 예측 | `weight_loss_pct`로 주차별 감량량 계산 |
| 대사효율나이 | `computeIndicators().metaAge` |
| 복부위험도% | `computeIndicators().abdominalRisk` |
| 호르몬부하% | `computeIndicators().hormoneLoad` |

---

## 6. API 엔드포인트 명세

### 6.1 인증 API

#### `POST /api/auth/login`

**Request**:
```json
{
  "code": "B2B-AES-001",
  "password": "b2b001"
}
```

**Response (B2B_PARTNER)**:
```json
{
  "token": "eyJhbGci...",
  "role": "B2B_PARTNER",
  "name": "예시 에스테틱",
  "code": "B2B-AES-001",
  "brand_color": "#6366f1",
  "brand_logo_url": "https://...",
  "brand_name": "예시 에스테틱",
  "survey_category": "aesthetic"
}
```

**JWT Payload**:
```json
{
  "sub": "partner-uuid",
  "code": "B2B-AES-001",
  "role": "B2B_PARTNER",
  "name": "예시 에스테틱",
  "exp": 1724000000
}
```

JWT 유효기간: B2B_PARTNER 7일 / CONSULTANT 24시간 / MASTER 24시간

---

### 6.2 B2B 대시보드 API

모든 B2B API는 `Authorization: Bearer <token>` 헤더 필수 (`requireB2B()` 미들웨어).

#### `GET /api/b2b/me`

**Response**:
```json
{
  "code": "B2B-AES-001",
  "name": "예시 에스테틱",
  "brand_name": "예시 에스테틱",
  "brand_color": "#6366f1",
  "brand_logo_url": "https://...",
  "survey_category": "aesthetic",
  "homepage_url": "https://...",
  "aesthetic_intro": "업체 한 줄 소개",
  "status": "active"
}
```

---

#### `GET /api/b2b/results`

**Query Parameters**:
| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `search` | string | '' | 고객 이름 검색 (LIKE) |
| `from_date` | string | '' | 시작일 YYYY-MM-DD |
| `to_date` | string | '' | 종료일 YYYY-MM-DD |
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 50 | 페이지 크기 (최대 200) |

**Response**:
```json
{
  "results": [
    {
      "id": "H-abc123-xxxxx",
      "user_name": "홍길동",
      "bc_primary": "식후기절 혈당롤러코스터형",
      "axis_primary": "BC-3",
      "created_at": "2024-08-01T10:00:00",
      "ref_code": "B2B-AES-001",
      "result_type": "hospital"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 50,
  "total_pages": 1
}
```

---

#### `GET /api/b2b/stats`

**Response**:
```json
{
  "total": 120,
  "month": 25,
  "today": 3,
  "week": 12,
  "bc_distribution": {
    "BC-3": 18,
    "BC-6": 15,
    "BC-1": 12
  }
}
```

---

#### `GET /api/b2b/partner-view/:bc_code`

**Path**: `bc_code` = `BC-3`

**Response**:
```json
{
  "bc_code": "BC-3",
  "brand_name": "단단내장형",
  "tagline": "인슐린 저항성·내장 비대형 체형",
  "bc_primary_oneline_reason": "식후 혈당 스파이크가 내장지방을 키웁니다",
  "bc_cause_story": "혈당 조절 시스템이 불균형한 상태입니다...",
  "recommend_1st": "인바디 정밀 체성분 분석 — ...",
  "recommend_2nd": "저주파 EMS 복부 자극 — ...",
  "forbidden": "고강도 유산소 단독 — ...",
  "expected_price": 130000
}
```

---

#### `GET /api/b2b/recommend/:resultId`

**Response**:
```json
{
  "bc_code": "BC-3",
  "bc_nickname": "식후기절 혈당롤러코스터형",
  "programs": [
    {
      "program_name": "혈당 안정 집중 관리",
      "program_desc": "인슐린 감수성 회복 프로토콜",
      "target_area": "복부",
      "price_display": "1회 80,000원",
      "is_signature": 1,
      "homepage_url": "https://..."
    }
  ]
}
```

---

### 6.3 결과지 데이터 API

#### `GET /api/h/result/:id` — 병원용

**Path**: `id` = 결과 ID (H- 접두사 또는 UUID)

**Response**:
```json
{
  "ok": true,
  "id": "H-abc123-xxxxx",
  "b2b_code": "B2B-HOS-001",
  "ref_code": "B2B-HOS-001",
  "user_name": "홍길동",
  "gender": "여",
  "age": 42,
  "height": 163,
  "weight": 58.5,
  "phone": "010-****-5678",
  "ohaeng_type": "목",
  "disp_type": "목형",
  "mbti_full": "INFP",
  "blood_type": "A",
  "face_shape": "계란형",
  "bc_code": "BC-3",
  "bc_nickname": "식후기절 혈당롤러코스터형",
  "bc_primary": "식후기절 혈당롤러코스터형",
  "axis_scores": {
    "A01": 8.2, "A02": 3.1, "A03": 5.0,
    "A04": 4.2, "A05": 6.8, "A06": 2.1,
    "A07": 7.5, "A08": 6.0, "A09": 7.1, "A10": 3.5
  },
  "stage1_answers": { "q1": 2, "q2": [1, 3], "..." : "..." },
  "stage2_answers": { "..." : "..." },
  "stage3_answers": { "..." : "..." },
  "stage4_answers": { "..." : "..." },
  "raw_answers": { "..." : "..." },
  "goal_weight": 53.0,
  "weight_loss_pct": 0.086,
  "created_at": "2024-08-01T10:00:00",
  "consultant_name": "예시 병원",
  "schema_version": "v1.1",
  "survey_type": "hospital",
  "axis_history": {
    "prev_result_id": "H-prev-xxxxx",
    "prev_created_at": "2024-06-01T10:00:00",
    "axis_deltas": { "A01": 1.2, "A02": -0.5, "..." : 0 }
  }
}
```

> `axis_history`: 동일 전화번호의 직전 1회차 축 점수 변화량. 없으면 `null`.

---

#### `GET /api/a/result/:id` — 에스테틱용

**Response** (diagnosis_results 소스):
```json
{
  "ok": true,
  "id": "uuid-xxxx",
  "b2b_code": "B2B-AES-001",
  "ref_code": "B2B-AES-001",
  "user_name": "홍길동",
  "gender": "여",
  "age": 35,
  "height": 165,
  "phone": "010-****-1234",
  "ohaeng_type": "화",
  "mbti_full": "ENFP",
  "bc_code": "BC-1",
  "bc_nickname": "오후만되면 코끼리다리형",
  "axis_scores": { "A01": 3.1, "A02": 8.8, "..." : "..." },
  "top3_axes": ["A02", "A03", "A07"],
  "region": "LEG",
  "texture": "edema",
  "survey_category": "aesthetic",
  "stage1_answers": { "..." : "..." },
  "stage2_answers": { "..." : "..." },
  "stage3_answers": { "..." : "..." },
  "raw_answers": { "..." : "..." },
  "disp_answers": { "..." : "..." },
  "goal_weight": 55.0,
  "weight_loss_pct": 0.06,
  "created_at": "2024-08-01T10:00:00",
  "schema_version": "v1.1",
  "survey_type": "aesthetic",
  "_source": "diagnosis_results"
}
```

---

#### `GET /api/f/result/:id` — 피트니스용

**Response**: 에스테틱 응답 구조와 동일 + 피트니스 전용 필드:
```json
{
  "ok": true,
  "id": "F-abc123-xxxxx",
  "...",
  "exercise_response": "반응지속형",
  "pain_gate": ["목·어깨", "없었어요"],
  "bmr": 1352.0,
  "tdee": 1892.8,
  "calorie_target": 1392.8,
  "activity_level": "주3~4회",
  "bfr_current": 28.5,
  "bfr_target": 22.0,
  "survey_type": "fitness"
}
```

---

#### `GET /api/s/result/:id` — 살롱용

**Response**: hospital 응답 구조와 동일 (weight, phone 포함). `survey_type: "salon"`.

---

### 6.4 진단 저장 API

#### `POST /api/h/diagnosis` — 병원 설문 저장

**Request**:
```json
{
  "b2b_code": "B2B-HOS-001",
  "ref_code": "B2B-HOS-001",
  "user_name": "홍길동",
  "gender": "여",
  "age": 42,
  "height": 163,
  "weight": 58.5,
  "phone": "01012345678",
  "stage1_answers": { "..." : "..." },
  "stage2_answers": { "..." : "..." },
  "stage3_answers": { "..." : "..." },
  "stage4_answers": { "..." : "..." },
  "ohaeng_type": "목",
  "disp_type": "목형",
  "mbti_full": "INFP",
  "bc_code": "BC-3",
  "bc_nickname": "식후기절 혈당롤러코스터형",
  "axis_scores": { "A01": 8.2, "A02": 3.1, "..." : "..." },
  "raw_answers": { "..." : "..." },
  "goal_weight": 53.0,
  "weight_loss_pct": 0.086
}
```

**Response**:
```json
{
  "ok": true,
  "result_id": "H-abc123-xxxxx",
  "redirect": "/result-hospital/H-abc123-xxxxx"
}
```

동일 패턴으로:
- `POST /api/a/diagnosis` → `redirect: /result-aesthetic/:id`
- `POST /api/f/diagnosis` → `redirect: /result-fitness/:id`
- `POST /api/s/diagnosis` → `redirect: /result-salon/:id`

---

### 6.5 결과지 HTML 라우트

```
GET /result-hospital/:id
GET /result-aesthetic/:id
GET /result-fitness/:id
GET /result-salon/:id
```

각 라우트:
1. `public/result-{업종}.html` 로딩 (정적 asset)
2. DB에서 결과 존재 여부 확인 (`{업종}_responses` + `diagnosis_results` 양쪽)
3. 없으면 404 페이지 반환
4. 있으면 `window.__XXX_RESULT_ID__` + `window.__BRAND__` 스크립트 주입
5. B2B 파트너면 브랜드 CSS 변수 주입
6. OG 메타태그 삽입 후 HTML 반환

---

### 6.6 진단 링크 진입 라우트

```
GET /h/:code     → survey-hospital.html 로딩 + window.__B2B_CODE__ 주입
GET /a/:code     → survey-aesthetic.html 로딩 + window.__B2B_CODE__ 주입
GET /f/:code     → survey-fitness.html 로딩 + window.__B2B_CODE__ 주입
GET /salon/:code → survey-salon.html 로딩 + window.__B2B_CODE__ 주입
```

`:code` = `B2B-AES-001` 형식의 파트너 코드. 설문 완료 후 `ref_code`로 저장.

---

### 6.7 기타 주요 API

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/b2b/export-csv` | 고객 데이터 CSV 내보내기 | B2B |
| GET | `/api/b2b/customer-lookup` | 전화번호로 고객 조회 | B2B |
| GET | `/api/b2b/result-link/:id` | 결과지 공유 링크 생성 | B2B |
| GET | `/api/b2b/bc-list` | BC코드 전체 목록 | B2B |
| GET | `/api/b2b/my-programs/:bc_code` | 파트너 시술 프로그램 조회 | B2B |
| GET | `/api/b2b/group-analysis` | 전체 고객 BC분포 분석 | B2B |
| GET | `/api/b2b/subaccounts` | 서브계정 목록 | B2B |
| POST | `/api/b2b/subaccounts` | 서브계정 생성 | B2B |
| DELETE | `/api/b2b/subaccounts/:code` | 서브계정 삭제 | B2B |
| DELETE | `/api/b2b/customer/:id` | 고객 진단 데이터 삭제 | B2B |
| GET | `/api/a/programs` | 에스테틱 파트너 프로그램 조회 | 공개 |
| GET | `/api/auth/me` | 현재 로그인 계정 정보 | JWT |

---

## 7. 환경 변수 및 Cloudflare 설정

### 7.1 `wrangler.jsonc`

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": "./dist",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "<실제-D1-ID>"
    }
  ],
  "vars": {
    "JWT_SECRET": ""  // 실제 값은 wrangler secret put 으로 설정
  }
}
```

### 7.2 Worker Secrets

```bash
npx wrangler secret put JWT_SECRET   # JWT 서명 키
```

### 7.3 `ecosystem.config.cjs` (샌드박스 개발용)

```javascript
module.exports = {
  apps: [{
    name: 'webapp',
    script: 'npx',
    args: 'wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000',
    watch: false,
    instances: 1,
    exec_mode: 'fork'
  }]
}
```

---

## 8. 프로젝트 파일 구조

```
webapp/
├── src/
│   └── index.tsx          # Hono 앱 전체 (12,000+ 줄)
│                          #   - SUBTYPE_RULES, BC_DOMAIN_RULES
│                          #   - decideSubtype(), computeIndicators()
│                          #   - computeDomainScores(), computePrediction()
│                          #   - 전체 API 라우트
├── public/
│   ├── bc-engine.js       # BC_MASTER(16종), AXIS_10_META, NICKNAME_TABLE(30종)
│   │                      # computeNickname(), detectBackground()
│   ├── bc-definitions.js  # BC 상세 정의
│   ├── result-hospital.html    # 병원 결과지 (~26,000줄)
│   ├── result-aesthetic.html   # 에스테틱 결과지
│   ├── result-fitness.html     # 피트니스 결과지
│   ├── result-salon.html       # 살롱 결과지
│   ├── b2b.html                # B2B 대시보드 SPA
│   ├── survey-hospital.html    # 병원 설문
│   ├── survey-*.html           # 기타 업종 설문
│   └── static/                 # 정적 리소스 (이미지, CSS, JS)
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0025_admin_v2_b2b_partners.sql
│   ├── 0027_diagnosis_results.sql
│   ├── 0042_diagnosis_gender_height_age.sql
│   ├── 0047_hospital_mbti_full.sql
│   ├── 0048_aesthetic_programs.sql
│   ├── 0062_aesthetic_salon_responses.sql
│   ├── 0063_fitness_responses.sql
│   └── meta/
├── wrangler.jsonc
├── vite.config.ts
├── tsconfig.json
├── package.json
└── ecosystem.config.cjs
```

---

## 9. 신규 구축 체크리스트 (Claude Code용)

```
□ 1. npm create hono@latest webapp -- --template cloudflare-pages
□ 2. D1 데이터베이스 생성: npx wrangler d1 create webapp-production
□ 3. wrangler.jsonc에 database_id 입력
□ 4. 마이그레이션 파일 적용 (0001 → 0063 순서대로)
□ 5. JWT_SECRET wrangler secret 설정
□ 6. src/index.tsx에 SUBTYPE_RULES + BC_DOMAIN_RULES 정의
□ 7. decideSubtype / computeIndicators / computeDomainScores / computePrediction 구현
□ 8. requireB2B() 미들웨어 구현 (JWT 검증 + b2b_partners 조회)
□ 9. 4대 업종 API 라우트 구현:
     - POST /api/{h,a,f,s}/diagnosis
     - GET  /api/{h,a,f,s}/result/:id
     - GET  /result-{hospital,aesthetic,fitness,salon}/:id (HTML 주입)
□ 10. GET /api/b2b/* 대시보드 API 구현
□ 11. public/bc-engine.js 배치 (NICKNAME_TABLE, computeNickname, detectBackground)
□ 12. public/result-{업종}.html 배치 (renderAll → renderP1~P9)
□ 13. public/b2b.html 배치 (대시보드 SPA)
□ 14. npm run build && pm2 start ecosystem.config.cjs
□ 15. 마이그레이션 로컬 적용: npx wrangler d1 migrations apply webapp-production --local
```

---

*문서 생성일: 2026-08-23 | 기준 버전: SlimMind B2B Platform v4.3*
