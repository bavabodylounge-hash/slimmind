# SlimMind B2B Platform — 개발자 인수인계 명세서

> **버전**: v4.3  
> **최종 수정**: 2026-08-23  
> **배포 URL**: https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com  
> **GitHub**: https://github.com/bavabodylounge-hash/slimmind  
> **최신 커밋**: `7cc6efd` — fix: [v4.3] 선제 버그 5종 수정  
> **작성 대상**: 본 플랫폼을 이어받아 개발할 신규 개발자

---

## 목차

1. [시스템 개요 및 비즈니스 구조](#1-시스템-개요-및-비즈니스-구조)
2. [기술 스택 및 인프라](#2-기술-스택-및-인프라)
3. [프로젝트 디렉토리 구조](#3-프로젝트-디렉토리-구조)
4. [DB 스키마 전체](#4-db-스키마-전체)
5. [인증 시스템 (JWT)](#5-인증-시스템-jwt)
6. [역할(Role) 체계 및 미들웨어](#6-역할role-체계-및-미들웨어)
7. [4업종 설문 파이프라인](#7-4업종-설문-파이프라인)
8. [채점 엔진 (BC 도출)](#8-채점-엔진-bc-도출)
9. [API 엔드포인트 전체 목록](#9-api-엔드포인트-전체-목록)
10. [B2B 대시보드 연동 흐름](#10-b2b-대시보드-연동-흐름)
11. [마스터 관리자 기능 상세](#11-마스터-관리자-기능-상세)
12. [결과지 라우팅 및 서버사이드 렌더링](#12-결과지-라우팅-및-서버사이드-렌더링)
13. [데이터 격리 메커니즘](#13-데이터-격리-메커니즘)
14. [프론트엔드 파일 목록](#14-프론트엔드-파일-목록)
15. [버그 수정 이력 및 기술 부채](#15-버그-수정-이력-및-기술-부채)
16. [개발 환경 세팅](#16-개발-환경-세팅)
17. [배포 절차](#17-배포-절차)
18. [Appendix A: 테스트 계정](#appendix-a-테스트-계정)
19. [Appendix B: 핵심 검증 커맨드](#appendix-b-핵심-검증-커맨드)

---

## 1. 시스템 개요 및 비즈니스 구조

### 서비스 설명

**SlimMind**는 체형 분석 기반 B2B SaaS 플랫폼입니다.  
병원·에스테틱·피트니스·미용실 등 업종 파트너(B2B)가 자체 고객에게 설문을 제공하고,  
결과를 대시보드에서 확인하는 B2B2C 구조입니다.

### 전체 비즈니스 구조 다이어그램

```
MASTER (관리자)
  │
  ├─── 컨설턴트 (Consultant)
  │     코드: SC-XXXX
  │     역할: 개인 고객 상담, 재진단 관리
  │     접근: /consultant
  │
  └─── B2B 파트너
        코드: B2B-XXX-000
        업종: hospital / aesthetic / fitness / salon
        접근: /b2b
        │
        ├── 병원 B2B-HOS-000   → 설문 URL: /h/B2B-HOS-000
        ├── 에스테틱 B2B-AES-000 → 설문 URL: /a/B2B-AES-000
        ├── 피트니스 B2B-GYM-000 → 설문 URL: /f/B2B-GYM-000
        └── 미용실 B2B-SAL-000  → 설문 URL: /salon/B2B-SAL-000
              │
              └── 자사 고객 결과만 대시보드에 표시 (ref_code 격리)
```

### 핵심 데이터 흐름

```
[1] 고객 설문 URL 접속
      /h/B2B-HOS-001  →  survey-hospital.html 서빙
                          (ref_code = 'B2B-HOS-001' 자동 주입)

[2] 설문 완료 → POST /api/v1/diagnosis
      body: { answers, ref_code: 'B2B-HOS-001', survey_category: 'hospital', ... }

[3] 채점 엔진 실행
      Q_AXIS_MAP → 10축 점수 계산 → decideSubtype() → bc_code_key 도출

[4] DB 저장 (이중 저장)
      diagnosis_results (신파이프라인 핵심 테이블)
      + hospital_responses / aesthetic_responses / fitness_responses / salon_responses

[5] 결과지 리다이렉트
      /result-hospital/{result_id}
      (HTML에 __RESULT_ID__, __BRAND__ 서버사이드 주입)

[6] B2B 파트너 대시보드
      GET /api/b2b/results  →  WHERE ref_code = ? .bind(user.code)
      → 자기 고객만 표시
```

---

## 2. 기술 스택 및 인프라

| 구분 | 내용 |
|------|------|
| **런타임** | Cloudflare Workers (Edge Runtime, V8 기반) |
| **프레임워크** | Hono v4 (TypeScript) |
| **빌드 도구** | Vite v6 + `@hono/vite-cloudflare-pages` |
| **데이터베이스** | Cloudflare D1 (SQLite 기반, 글로벌 분산) |
| **인증** | 자체 JWT HS256 (Web Crypto API — Node.js crypto 아님) |
| **정적 파일 서빙** | Cloudflare Workers Assets (ASSETS binding) |
| **유효성 검사** | Zod v3 |
| **배포** | Genspark Hosted Deploy (Workers for Platform) |
| **패키지 관리** | npm |

### Cloudflare 바인딩 (wrangler.jsonc)

```jsonc
{
  "name": "slimmind",
  "compatibility_date": "2026-05-03",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db",
      "database_id": "6edfb42e-bd6b-4e66-a0f4-8d560c9be418"
    }
  ],
  "vars": {
    "JWT_SECRET": "slimmind-jwt-secret-change-in-production"  // ⚠️ 교체 필요
  }
}
```

### Cloudflare Workers 환경 제약

> **중요**: Cloudflare Workers는 Node.js 표준 API를 사용할 수 없습니다.

- ❌ `fs`, `path`, `crypto` (Node.js) — 대신 Web Crypto API 사용
- ❌ 파일시스템 런타임 접근 불가
- ❌ 장기 실행 프로세스, WebSocket 서버
- ✅ Fetch API, Web Crypto API, D1 DB, ASSETS 바인딩

---

## 3. 프로젝트 디렉토리 구조

```
/home/user/webapp/
├── src/
│   ├── index.tsx              ← ⭐ 전체 백엔드 (12,156줄, 단일 파일)
│   └── schemas/
│       └── api.schema.ts      ← Zod 스키마 (응답 구조 검증)
│
├── public/                    ← 정적 파일 (ASSETS 바인딩으로 서빙)
│   ├── index.html             ← 설문 공통 SPA 진입점 (896KB)
│   ├── admin.html             ← 마스터 관리자 UI (351KB)
│   ├── b2b.html               ← B2B 파트너 대시보드 (184KB)
│   ├── consultant.html        ← 컨설턴트 페이지 (244KB)
│   ├── survey-hospital.html   ← 병원 설문지 (4.0MB)
│   ├── survey-aesthetic.html  ← 에스테틱 설문지 (14.5MB)
│   ├── survey-fitness.html    ← 피트니스 설문지 (4.1MB)
│   ├── survey-salon.html      ← 미용실 설문지 (14.7MB)
│   ├── survey-hospital-3lang.html ← 병원 설문지 3개국어 버전
│   ├── result-hospital.html   ← 병원 결과지 (4.1MB)
│   ├── result-aesthetic.html  ← 에스테틱 결과지 (4.1MB)
│   ├── result-fitness.html    ← 피트니스 결과지 (4.1MB)
│   ├── result-salon.html      ← 미용실 결과지 (4.1MB)
│   ├── result-v4.html         ← 통합 결과지 구버전 (1.7MB, 하위호환)
│   ├── result.html            ← 최구버전 결과지 (302KB)
│   ├── slimmind-today.html    ← 데일리 체크인 UI (174KB)
│   ├── bc-definitions.js      ← BC 코드 정의 데이터 (60KB)
│   ├── bc-engine.js           ← BC 채점 엔진 클라이언트 버전 (552KB)
│   ├── survey-data.js         ← 설문 문항 데이터 (233KB)
│   ├── mapping-engine.js      ← 설문-축 매핑 엔진 (37KB)
│   ├── manifest.json          ← PWA 매니페스트
│   ├── favicon.svg
│   ├── _headers               ← Cloudflare 커스텀 HTTP 헤더
│   ├── static/                ← 추가 정적 파일
│   └── landing/               ← 랜딩 페이지 파일들
│
├── migrations/                ← D1 스키마 마이그레이션 (0001~0063)
│   ├── 0001_initial_schema.sql
│   ├── 0025_admin_v2_b2b_partners.sql
│   ├── 0027_diagnosis_results.sql
│   ├── 0047_hospital_mbti_full.sql
│   ├── 0062_aesthetic_salon_responses.sql
│   └── 0063_fitness_responses.sql  (외 58개)
│
├── ecosystem.config.cjs       ← PM2 설정 (로컬 개발용)
├── wrangler.jsonc             ← Cloudflare 배포 설정
├── vite.config.ts             ← 빌드 설정
├── tsconfig.json
├── package.json
├── DEVELOPER_SPEC.md          ← 이 파일
└── SLIMMIND_ARCHITECTURE.md   ← 아키텍처 요약 (public/)
```

---

## 4. DB 스키마 전체

### 4-1. 테이블 목록

| 테이블명 | 용도 | 신/구 |
|---------|------|-------|
| `consultants` | 컨설턴트 계정 + MASTER 계정 | 구 |
| `b2b_partners` | B2B 파트너 계정 (병원/에스테틱/피트니스/미용실) | 신 |
| `results` | 구버전 설문 결과 (하위호환) | 구 |
| `diagnosis_results` | **신파이프라인 핵심 — 전 업종 결과 통합** | 신 |
| `hospital_responses` | 병원 설문 전용 응답 테이블 | 신(업종별) |
| `aesthetic_responses` | 에스테틱 설문 전용 응답 | 신(업종별) |
| `salon_responses` | 미용실 설문 전용 응답 | 신(업종별) |
| `fitness_responses` | 피트니스 설문 전용 응답 | 신(업종별) |
| `bc_prescriptions` | BC 처방 컨텐츠 (BC-1~BC-16) | 신 |
| `daily_checks` | 데일리 체크인 기록 | 신 |
| `coaching_comments` | 컨설턴트 코칭 코멘트 | 신 |
| `affiliate_places` | 제휴 병원/센터 목록 | 신 |
| `payments` | 결제 내역 | 신 |
| `coupons` | 쿠폰 관리 | 신 |
| `chat_messages` | 고객-컨설턴트 1:1 채팅 | 신 |
| `push_subscriptions` | PWA 푸시 구독 정보 | 신 |
| `survey_notifications` | 설문 완료 알림 | 신 |
| `check_alerts` | 체크 알림 | 신 |
| `rediagnosis_alerts` | 재진단 알림 | 신 |
| `settings_kv` | 시스템 설정 KV 저장소 | 신 |
| `pilot_requests` | 파일럿 요청 | 신 |
| `consultant_applies` | 컨설턴트 지원 | 신 |

---

### 4-2. `diagnosis_results` — 신파이프라인 핵심 테이블

> **모든 업종의 설문 결과가 이 테이블에 집중됩니다.**  
> B2B 대시보드 `/api/b2b/results`의 1순위 조회 테이블.

```sql
CREATE TABLE IF NOT EXISTS diagnosis_results (
  id              TEXT PRIMARY KEY,         -- UUID (result_id), 설문 URL에 사용
  user_name       TEXT NOT NULL,
  phone           TEXT,                     -- 공개 API에서 마스킹: 010-****-5678
  bc_nickname     TEXT,                     -- 한글 아형명 (예: '스트레스성 야식부엉이형')
  bc_primary      TEXT,                     -- 1순위 BC코드 (BC-1~BC-16)
  bc_code_key     TEXT,                     -- 정규화 BC코드 ← B2B 대시보드 axis_primary
                                            -- NULL이면 미완성 레코드 → 대시보드 미표시
  bc_secondary    TEXT,                     -- 2순위 BC코드
  top3_axes       TEXT,                     -- JSON: ["A07","A08","A01"]
  axis_scores     TEXT,                     -- JSON: {"A01":72,"A02":30,...,"A10":50}
  region          TEXT,                     -- 부위: 복부/하체/상체/전신
  texture         TEXT,                     -- 지방질: 단단/물렁/셀룰/부종
  bg_filter       TEXT DEFAULT '',          -- 배경 필터: birth/meno/drug/PCOS/""
  ohaeng_type     TEXT,                     -- 오행: 목/화/토/금/수
  ohaeng_source   TEXT,
  ohaeng_confidence REAL,
  ohaeng_lacking  TEXT,
  ohaeng_score    TEXT,
  mbti_full       TEXT,                     -- MBTI: INFP/ISTJ 등
  disp_answers    TEXT,                     -- JSON 표시용 답변
  raw_answers     TEXT,                     -- JSON 전체 원본 답변
  goal_weight     REAL,
  weight_loss_pct REAL,
  gender          TEXT,                     -- male/female
  height          REAL,
  age             REAL,
  ref_code        TEXT,                     -- ⭐ B2B 격리 핵심 컬럼 (파트너 코드)
  session_id      TEXT,                     -- 컨설턴트 세션 연결
  survey_category TEXT DEFAULT 'integrated', -- hospital|aesthetic|fitness|salon|integrated
  completed_at    TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_dr_ref_code ON diagnosis_results(ref_code);
CREATE INDEX IF NOT EXISTS idx_dr_bc_code_key ON diagnosis_results(bc_code_key);
CREATE INDEX IF NOT EXISTS idx_dr_created ON diagnosis_results(created_at);
```

**주요 컬럼 설명:**

| 컬럼 | 설명 |
|------|------|
| `ref_code` | B2B 파트너 코드 (`B2B-HOS-001`). 설문 URL의 `:code`가 그대로 저장됨 |
| `bc_code_key` | `BC-1`~`BC-16` 정규화 코드. NULL = 미완성 레코드 (대시보드 제외) |
| `survey_category` | 업종 구분. B2B 대시보드에서 업종 라우팅 기준 |
| `axis_scores` | 10축 점수 JSON. 채점 엔진 출력 |

---

### 4-3. `b2b_partners` 테이블

```sql
CREATE TABLE IF NOT EXISTS b2b_partners (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code            TEXT UNIQUE NOT NULL,   -- B2B-AES-001 형식
  name            TEXT NOT NULL,          -- 업체명 (예: '강남 슬리마인드 클리닉')
  type            TEXT,                   -- 업종 한글명 (에스테틱/필라테스/한의원/헬스장)
  owner_name      TEXT,
  phone           TEXT,
  email           TEXT UNIQUE,
  address         TEXT,
  password_hash   TEXT,                   -- ⚠️ 평문 저장 중 (bcrypt 전환 필요)
  commission_rate REAL DEFAULT 15.0,
  status          TEXT DEFAULT 'pending', -- pending/active/suspended
  brand_logo_url  TEXT,
  brand_color     TEXT DEFAULT '#6366f1',
  brand_name      TEXT,                   -- 브랜드명 (결과지에 표시)
  survey_category TEXT,                   -- hospital|aesthetic|fitness|salon|integrated
  qr_scan_count   INTEGER DEFAULT 0,
  staff_count     INTEGER DEFAULT 0,
  memo            TEXT,
  first_login_at  TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);
```

---

### 4-4. `consultants` 테이블

```sql
CREATE TABLE IF NOT EXISTS consultants (
  id                   TEXT PRIMARY KEY,
  code                 TEXT UNIQUE NOT NULL,   -- SC-0001 또는 'MASTER'
  name                 TEXT,
  email                TEXT UNIQUE,
  password_hash        TEXT,                   -- MASTER: 'MASTER_ACCOUNT' 특수값
  grade                TEXT DEFAULT '일반',    -- 일반/시니어/마스터
  subscription_status  TEXT DEFAULT 'pending', -- pending/active/expired/suspended
  subscription_end     TEXT,
  lecture_progress     INTEGER DEFAULT 0,
  is_certified         INTEGER DEFAULT 0,
  kakao_channel        TEXT,
  phone                TEXT,
  memo                 TEXT,
  commission_rate      REAL DEFAULT 15.0,
  created_at           TEXT,
  updated_at           TEXT
);
```

> **MASTER 계정**: DB에 `code='MASTER', password_hash='MASTER_ACCOUNT'` 레코드로 존재.  
> 실제 인증은 코드에 하드코딩된 `admin1234` 비교로 처리 (보안 이슈)

---

### 4-5. 업종별 응답 테이블 (hospital_responses 예시)

```sql
-- 병원 설문 전용 응답 테이블
CREATE TABLE IF NOT EXISTS hospital_responses (
  id              TEXT PRIMARY KEY,          -- UUID
  ref_code        TEXT,                      -- B2B 파트너 코드
  user_name       TEXT,
  phone           TEXT,                      -- ⚠️ 공개 API에서 마스킹 필요
  gender          TEXT,
  age             INTEGER,
  height          REAL,
  weight          REAL,
  bmi             REAL,
  chief_complaint TEXT,
  answers         TEXT,                      -- JSON 원본 답변
  bc_code         TEXT,                      -- BC 코드 (BC-1~BC-16)
  bc_score        INTEGER,
  axis_scores     TEXT,
  mbti_full       TEXT,
  ohaeng_type     TEXT,
  diagnosis_result_id TEXT,                  -- diagnosis_results.id 참조
  survey_category TEXT DEFAULT 'hospital',
  created_at      TEXT DEFAULT (datetime('now'))
);
```

> 기타: `aesthetic_responses`, `salon_responses`, `fitness_responses` 동일 패턴  
> `fitness_responses`는 운동 관련 추가 컬럼 포함 (weekly_exercise, current_sport 등)

---

## 5. 인증 시스템 (JWT)

### JWT Payload 타입 정의

```typescript
type JwtPayload = {
  sub: string   // consultants.id 또는 b2b_partners.id (UUID)
  code: string  // 'MASTER' | 'SC-XXXX' | 'B2B-XXX-000'
  role: 'MASTER' | 'CONSULTANT' | 'B2B_PARTNER'
  name: string  // 표시 이름
  exp: number   // Unix timestamp, 24시간 유효
}
```

### 로그인 플로우

```
POST /api/auth/login
Content-Type: application/json

Body: { "code": "B2B-HOS-001", "password": "b2b001" }

→ DB 조회: b2b_partners WHERE code = 'B2B-HOS-001' AND password_hash = 'b2b001'
→ JWT 발급 (HS256, 24시간)
→ Response: { "token": "eyJ...", "role": "B2B_PARTNER", "name": "...", "code": "B2B-HOS-001" }
```

### MASTER 로그인 특수 처리

```typescript
// src/index.tsx ~574번째 줄
if (code === 'MASTER') {
  if (password !== 'admin1234') return 401  // ← 하드코딩 비교
  // DB: code='MASTER', password_hash='MASTER_ACCOUNT' 레코드 조회
  // 조회 성공 시 role='MASTER' JWT 발급
}
```

> ⚠️ **보안 이슈**: MASTER 비밀번호 `admin1234`가 소스코드에 하드코딩됨

### 토큰 사용 방법

```http
# 방법 1: Authorization 헤더
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

# 방법 2: 쿼리 파라미터 (일부 B2B API 지원)
GET /api/b2b/results?token=eyJhbGciOiJIUzI1NiJ9...
```

### JWT 서명 방식

```typescript
// Web Crypto API 사용 (Node.js crypto 아님 — Cloudflare Workers 환경)
const key = await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(JWT_SECRET),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify']
)
```

---

## 6. 역할(Role) 체계 및 미들웨어

### 역할 정의

| Role | 코드 패턴 | 주요 접근 경로 |
|------|-----------|--------------|
| `MASTER` | `MASTER` | `/admin`, `/api/admin/*`, 전체 |
| `CONSULTANT` | `SC-XXXX` | `/consultant`, `/api/consultant/*` |
| `B2B_PARTNER` | `B2B-XXX-000` | `/b2b`, `/api/b2b/*` |

### 미들웨어 함수 정의

```typescript
// ─ 컨설턴트 또는 마스터 필요
function requireRole(role: 'MASTER' | 'ANY') {
  return async (c: Context, next: Next) => {
    const user = await verifyJwt(c)
    if (!user) return c.json({ error: 'Unauthorized' }, 401)
    if (role === 'MASTER' && user.role !== 'MASTER') return c.json({ error: 'Forbidden' }, 403)
    if (role === 'ANY' && !['MASTER', 'CONSULTANT'].includes(user.role))
      return c.json({ error: 'Forbidden' }, 403)
    c.set('user', user)
    await next()
  }
}

// ─ B2B 파트너 또는 마스터 허용
function requireB2B() {
  return async (c: Context, next: Next) => {
    const user = await verifyJwt(c)
    if (!user) return c.json({ error: 'Unauthorized' }, 401)
    if (!['MASTER', 'B2B_PARTNER'].includes(user.role))
      return c.json({ error: 'Forbidden' }, 403)
    c.set('user', user)
    await next()
  }
}
```

### 미들웨어 적용 패턴

```typescript
// 마스터 전용
app.get('/api/admin/b2b-partners', requireRole('MASTER'), async (c) => { ... })

// 컨설턴트 + 마스터
app.get('/api/consultant/me', requireRole('ANY'), async (c) => { ... })

// B2B 파트너 + 마스터
app.get('/api/b2b/results', requireB2B(), async (c) => { ... })

// 공개 (인증 불필요)
app.post('/api/v1/diagnosis', async (c) => { ... })
```

---

## 7. 4업종 설문 파이프라인

### 7-1. 설문 URL → HTML 서빙

| 업종 | 설문 진입 URL | 서빙 파일 | 별칭 |
|------|-------------|-----------|------|
| 병원 | `/h/:code` | `survey-hospital.html` | — |
| 병원 3개국어 | `/h3/:code` | `survey-hospital-3lang.html` | — |
| 에스테틱 | `/a/:code` | `survey-aesthetic.html` | — |
| 피트니스 | `/f/:code` | `survey-fitness.html` | — |
| 미용실 | `/salon/:code` | `survey-salon.html` | `/s/:code` alias |

#### ref_code 주입 방식

```typescript
// src/index.tsx ~3672번째 줄
app.get('/h/:code', async (c) => {
  const code = c.req.param('code')
  // B2B 파트너 브랜드 정보 조회
  const partner = await db.prepare(
    'SELECT brand_name, brand_color, brand_logo_url FROM b2b_partners WHERE code=?'
  ).bind(code).first()
  
  // HTML에 ref_code, 브랜드 정보 주입
  let html = await fetchAsset(c.env.ASSETS, '/survey-hospital.html')
  html = html.replace(/__REF_CODE__/g, code)
  html = html.replace(/__BRAND_NAME__/g, partner?.brand_name || 'SlimMind')
  html = html.replace(/__BRAND_COLOR__/g, partner?.brand_color || '#6366f1')
  return c.html(html)
})
```

### 7-2. 설문 제출 엔드포인트 매핑

| 업종 | POST 엔드포인트 | 저장 테이블 (이중) |
|------|----------------|------------------|
| **공통 신파이프라인** | `POST /api/v1/diagnosis` | `diagnosis_results` |
| 병원 | `POST /api/h/diagnosis` | `hospital_responses` + `diagnosis_results` |
| 에스테틱 | `POST /api/a/diagnosis` | `aesthetic_responses` + `diagnosis_results` |
| 피트니스 | `POST /api/f/diagnosis` | `fitness_responses` + `diagnosis_results` |
| 미용실 | `POST /api/s/diagnosis` | `salon_responses` + `diagnosis_results` |

> **이중 저장 원칙**: 업종별 테이블에 저장 시 반드시 `diagnosis_results`에도 동시 저장  
> B2B 대시보드는 `diagnosis_results`를 1순위 조회 (업종별 테이블은 레거시 호환용)

### 7-3. `POST /api/v1/diagnosis` 요청/응답

#### 요청 바디

```json
{
  "user_name": "홍길동",              // ✅ 필수
  "phone": "010-1234-5678",           // 선택
  "gender": "female",                 // male|female
  "height": 165,
  "age": 38,
  "goal_weight": 52,

  // ── 채점 데이터 (셋 중 하나 이상 필수) ─────────────────────────
  "answers": {                        // q1~q30 원본 답변 → 서버 채점
    "q1": 3, "q2": 2, "q4": 1, "q16": 4, "q18": 3
  },
  "axis_scores": {                    // 프론트 채점 결과 (answers 있으면 무시)
    "A01": 72, "A02": 30, "A07": 85
  },
  "bc_code_key": "BC-6",             // 직접 지정 시 채점 엔진 생략

  // ── 결과 메타데이터 ────────────────────────────────────────────
  "bc_nickname": "스트레스성 야식부엉이형",
  "bc_primary": "BC-6",
  "region": "복부",                   // 복부|하체|상체|전신
  "texture": "물렁",                  // 단단|물렁|셀룰|부종
  "ohaeng_type": "화",               // 목|화|토|금|수
  "mbti_full": "INFP",
  "top3_axes": ["A07", "A08", "A01"],
  "bg_filter": "meno",               // birth|meno|drug|PCOS|""

  // ── B2B 귀속 ─────────────────────────────────────────────────
  "ref_code": "B2B-HOS-001",         // ⭐ B2B 파트너 코드 (대시보드 귀속 핵심)
  "survey_category": "hospital",     // hospital|aesthetic|fitness|salon|integrated

  "session_id": "SC-0001-uuid",      // 컨설턴트 연결 시
  "completed_at": "2026-08-23T05:00:00Z"
}
```

#### 유효성 검사 규칙 (v4.3 추가)

```typescript
// answers, axis_scores, bc_code_key 중 하나 이상 필수
if (!hasAnswers && !hasAxisScores && !hasBcCodeKey) {
  return 400 { code: 'MISSING_DIAGNOSIS_DATA' }
}

// answers만 있을 경우 최소 5개 이상 유효 숫자 답변 필요
if (hasAnswers && validAnswerCount < 5) {
  return 400 { code: 'INSUFFICIENT_ANSWERS' }
}
```

#### 응답

```json
{
  "result_id": "96d3d7f7-98db-4962-bfc3-11c69104a9b5",
  "bc_code_key": "BC-6",
  "bc_nickname": "스트레스성 야식부엉이형",
  "redirect_url": "/result-hospital/96d3d7f7-98db-4962-bfc3-11c69104a9b5"
}
```

---

## 8. 채점 엔진 (BC 도출)

### 8-1. Q → Axis 매핑 (Q_AXIS_MAP)

설문 문항(q1~q30)은 10개 축(A01~A10)으로 매핑됩니다.

```
A01 (인슐린·내장지방):  q1, q2, q3, q28
A02 (림프·순환):        q4, q5, q6
A03 (호르몬·대사):      q7, q8, q9, q29
A04 (근감소·근력):      q10, q11
A05 (소화·장):          q12, q13
A06 (골격·자세):        q14, q15
A07 (스트레스·코르티솔): q16, q17, q18, q26
A08 (심리·식이):        q19, q20, q27
A09 (대사위험):         q21, q22, q23, q30
A10 (기질·성향):        q24, q25
```

**축 점수 계산:**
```
축점수 = (문항응답합계 / 문항최대합계) × 10 → 0~100 스케일 정규화
```

### 8-2. decideSubtype() 함수 흐름

```typescript
function decideSubtype(axis_scores, bg_filter, region, texture): string {
  // 1. 배경 필터 우선 체크
  if (bg_filter === 'meno' || bg_filter === 'PCOS') return 'BC-13'  // 갱년기형 고정
  if (bg_filter === 'drug') return 'BC-4'                            // 약물부작용형

  // 2. SUBTYPE_RULES 순서대로 매칭 (25개 규칙)
  //    각 규칙: { top_axes, region, texture, result_bc }
  for (const rule of SUBTYPE_RULES) {
    const topAxes = getTopAxes(axis_scores, 3)  // 상위 3축
    if (matches(topAxes, rule.top_axes, region, rule.region, texture, rule.texture)) {
      return rule.result_bc
    }
  }

  // 3. 매칭 없으면 기본 폴백
  return 'BC-3'  // 단단내장형 / 혈당롤러코스터형
}
```

### 8-3. BC 코드 체계 (BC-1 ~ BC-16)

| BC 코드 | 아형명 | 주요 축 |
|---------|--------|---------|
| BC-1 | 오후만되면 코끼리다리형 | A02, A03, A04 |
| BC-2 | 지방흡입후 재발형 | A06, A02, A04 |
| BC-3 | 단단내장형 / 혈당롤러코스터형 | A01, A09, A05 |
| BC-4 | 약물부작용 강제축적형 | A08, A05, A01 |
| BC-5 | 여름에도 시린 얼음장형 | A03, A02, A10 |
| BC-6 | 스트레스성 야식부엉이형 | A07, A08, A01 |
| BC-7 | 출산후 바람빠진 풍선형 | A06, A04, A03 |
| BC-8 | 골반틀어짐 승마살형 | A06, A04, A02 |
| BC-9 | 목짧아지는 거북이형 | A06, A04, A02 |
| BC-10 | 안 쓰는 팔뚝 부종형 | A02, A06, A01 |
| BC-11 | 상체근육형 | A04, A06, A08 |
| BC-12 | 겨드랑이 부유방형 | A06, A02, A03 |
| BC-13 | 호르몬스위치 갱년기형 | A03, A07, A06 |
| BC-14 | 스트레스기절 번아웃형 | A08, A07, A03 |
| BC-15 | 대사증후군 종합형 | A09, A01, A07 |
| BC-16 | 동시다발 다중악순환형 | A09, A01, A08 |

### 8-4. bc_code_key 정규화

```sql
-- 정상: BC-1 ~ BC-16
-- 이상: MO_YANG, WW-01, WF-01 등 레거시 코드 → NULL로 정규화
CASE
  WHEN bc_code_key GLOB 'BC-[0-9]*' THEN bc_code_key
  ELSE NULL
END AS axis_primary
```

---

## 9. API 엔드포인트 전체 목록

> 총 약 130개 엔드포인트. 역할별로 분류.

---

### 9-1. 인증 (공개)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 (MASTER / 컨설턴트 / B2B 모두 사용) |
| GET | `/api/auth/me` | 현재 로그인 유저 정보 |
| POST | `/api/auth/register` | 신규 계정 등록 |
| GET | `/api/admin/impersonate/:code` | **[MASTER]** 계정 대리 로그인 (해당 계정 JWT 발급) |

---

### 9-2. 마스터 관리자 (`requireRole('MASTER')`)

#### 대시보드 / 통계

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/dashboard` | 전체 현황 (가입수, 결과수, 월매출) |
| GET | `/api/admin/stats` | 통합 통계 |
| GET | `/api/admin/ranking` | 컨설턴트 랭킹 |
| GET | `/api/admin/revenue-forecast` | 매출 예측 |
| GET | `/api/admin/monthly-report` | 월간 리포트 |
| GET | `/api/admin/growth-dashboard` | 성장 대시보드 |
| GET | `/api/admin/settlement` | 컨설턴트별 정산 현황 |

#### 컨설턴트 관리

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/consultants` | 컨설턴트 목록 |
| POST | `/api/admin/consultants` | 컨설턴트 생성 |
| PUT | `/api/admin/consultants/:code` | 컨설턴트 수정 (구독 상태, 등급 등) |
| DELETE | `/api/admin/consultants/:code` | 컨설턴트 소프트 삭제 |
| DELETE | `/api/admin/consultants/:code/hard` | 컨설턴트 하드 삭제 |

#### B2B 파트너 관리

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/b2b-partners` | B2B 파트너 전체 목록 (비밀번호 포함) |
| POST | `/api/admin/b2b-partners` | **B2B 파트너 생성** |
| PUT | `/api/admin/b2b-partners/:code` | B2B 파트너 수정 |
| DELETE | `/api/admin/b2b-partners/:code` | B2B 파트너 삭제 |

#### B2B 파트너 생성 요청 바디

```json
{
  "name": "강남 슬리마인드 클리닉",
  "email": "clinic@example.com",
  "custom_code": "B2B-HOS-001",       // ⚠️ 'code' 아닌 'custom_code' 사용
  "custom_password": "b2b001",         // 평문 저장
  "survey_category": "hospital",       // hospital|aesthetic|fitness|salon|integrated
  "type": "병원",
  "owner_name": "김원장",
  "phone": "02-1234-5678",
  "brand_name": "슬리마인드 강남점",
  "brand_color": "#4F46E5",
  "brand_logo_url": "https://...",
  "commission_rate": 15.0
}
```

#### 설문 결과 / BC 관리

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/results` | 전체 구버전 설문 결과 |
| GET | `/api/admin/diagnosis-results` | 전체 신파이프라인 결과 |
| GET | `/api/admin/bc-codes` | BC 코드 목록 (bc_prescriptions 테이블) |
| PUT | `/api/admin/bc-codes/:code` | BC 코드 처방 내용 수정 |

#### 분석 / 알림

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/analytics/bc-trend` | BC 분포 트렌드 분석 |
| GET | `/api/admin/churn/risk-list` | 이탈 위험 고객 목록 |
| GET | `/api/admin/analytics/customer-segments` | 고객 세그먼트 분석 |
| GET | `/api/admin/group-analysis/:code` | B2B 파트너별 그룹 분석 |
| POST | `/api/admin/rediagnosis/scan` | 재진단 알림 스캔 실행 |
| GET | `/api/admin/rediagnosis` | 재진단 알림 전체 조회 |

#### 에스테틱 프로그램

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/aesthetic-programs` | 에스테틱 프로그램 목록 |
| POST | `/api/admin/aesthetic-programs` | 에스테틱 프로그램 등록 |
| DELETE | `/api/admin/aesthetic-programs/:id` | 에스테틱 프로그램 삭제 |

#### 제휴처 관리

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/affiliate-places` | 제휴처 목록 |
| POST | `/api/admin/affiliate-places` | 제휴처 등록 |
| PUT | `/api/admin/affiliate-places/:id` | 제휴처 수정 |
| DELETE | `/api/admin/affiliate-places/:id` | 제휴처 삭제 |

#### 결제 / 쿠폰

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/payments` | 결제 내역 전체 |
| GET | `/api/admin/coupons` | 쿠폰 목록 |
| POST | `/api/admin/coupons/use` | 쿠폰 사용 처리 |

#### 기타 관리

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/migrate` | DB 마이그레이션 실행 (긴급용) |
| GET | `/api/admin/users` | 전체 사용자 목록 |
| GET | `/api/admin/pilot-requests` | 파일럿 요청 목록 |
| PATCH | `/api/admin/pilot-requests/:id` | 파일럿 요청 처리 |
| GET | `/api/admin/consultant-applies` | 컨설턴트 지원 목록 |
| PATCH | `/api/admin/consultant-applies/:id` | 컨설턴트 지원 처리 |
| GET | `/api/admin/daily-checks` | 데일리 체크 전체 조회 |
| GET | `/api/admin/daily-checks/:session_id` | 데일리 체크 상세 |
| GET | `/api/admin/check-alerts` | 체크 알림 전체 |
| POST | `/api/admin/daily-check/remind` | 데일리 체크 리마인드 전송 |
| GET | `/api/admin/notifications` | 관리자 알림 목록 |
| POST | `/api/admin/notifications/read-all` | 관리자 알림 전체 읽음 |
| GET | `/api/admin/certificates` | 수료증 전체 목록 |
| PUT | `/api/settings/kakao` | 카카오 설정 변경 |
| PUT | `/api/settings/kakao-map` | 카카오맵 API 키 설정 |
| GET | `/api/settings/kakao-map` | 카카오맵 설정 조회 |

---

### 9-3. B2B 파트너 (`requireB2B()`)

> `requireB2B()` = B2B_PARTNER 또는 MASTER 허용

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/b2b/me` | 내 파트너 계정 정보 |
| GET | `/api/b2b/results` | **핵심 — 내 고객 결과 목록 (ref_code 격리)** |
| GET | `/api/b2b/export-csv` | 결과 CSV 내보내기 |
| GET | `/api/b2b/stats` | 통계 (총건수/월/일/주간) |
| GET | `/api/b2b/bc-list` | 내 고객 BC 분포 목록 |
| GET | `/api/b2b/partner-view/:bc_code` | BC별 파트너 뷰 |
| GET | `/api/b2b/customer-lookup` | 고객 이름/전화번호 검색 |
| GET | `/api/b2b/customer-summary` | 고객 요약 통계 |
| GET | `/api/b2b/result-link/:id` | 결과지 URL 조회 |
| GET | `/api/b2b/my-programs/:bc_code` | 내 BC별 추천 프로그램 |
| GET | `/api/b2b/group-analysis` | 내 고객 그룹 분석 |
| GET | `/api/b2b/daily-checks` | 데일리 체크 목록 |
| GET | `/api/b2b/daily-check/detail` | 데일리 체크 상세 |
| POST | `/api/b2b/feedback` | 피드백 전송 |
| GET | `/api/b2b/subaccounts` | 서브계정 목록 |
| POST | `/api/b2b/subaccounts` | 서브계정 생성 |
| DELETE | `/api/b2b/subaccounts/:code` | 서브계정 삭제 |
| DELETE | `/api/b2b/customer/:id` | 고객 결과 삭제 |
| GET | `/api/b2b/recommend/:resultId` | 고객별 추천 프로그램 |

#### `/api/b2b/results` 쿼리 파라미터

```
GET /api/b2b/results
  ?page=1              페이지 번호 (default: 1)
  &limit=20            페이지당 건수 (default: 20)
  &search=홍길동       이름/전화 검색
  &from_date=2026-01-01 날짜 범위 시작
  &to_date=2026-08-23  날짜 범위 종료
  &bc_code=BC-6        BC 코드 필터
```

---

### 9-4. 설문 제출 (공개 — 인증 불필요)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/diagnosis` | **신파이프라인 공통 진단 저장** |
| GET | `/api/v1/diagnosis/:id` | 결과 조회 (by UUID) |
| POST | `/api/h/diagnosis` | 병원 전용 설문 저장 (구버전) |
| POST | `/api/a/diagnosis` | 에스테틱 전용 설문 저장 |
| POST | `/api/f/diagnosis` | 피트니스 전용 설문 저장 |
| POST | `/api/s/diagnosis` | 미용실 전용 설문 저장 |
| GET | `/api/h/result/:id` | 병원 결과 JSON (phone 마스킹) |
| GET | `/api/a/result/:id` | 에스테틱 결과 JSON (phone 마스킹) |
| GET | `/api/f/result/:id` | 피트니스 결과 JSON (phone 마스킹) |
| GET | `/api/s/result/:id` | 미용실 결과 JSON |

---

### 9-5. 컨설턴트 (`requireRole('ANY')`)

> `ANY` = CONSULTANT 또는 MASTER

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/consultant/me` | 내 컨설턴트 정보 |
| GET | `/api/consultant/results` | 내 고객 결과 목록 |
| GET | `/api/consultant/stats` | 통계 |
| GET | `/api/consultant/my-qr` | QR 코드 정보 |
| GET | `/api/consultant/my-qr/stats` | QR 스캔 통계 |
| GET | `/api/consultant/clients` | 고객 목록 |
| GET | `/api/consultant/my-customers` | 내 고객 상세 |
| POST | `/api/consultant/weight-checkin` | 체중 체크인 기록 |
| GET | `/api/consultant/analytics/conversion` | 전환율 분석 |
| GET | `/api/consultant/analytics/axis-benchmark` | 축 벤치마크 비교 |
| GET | `/api/consultant/daily-checks` | 데일리 체크 목록 |
| GET | `/api/consultant/lectures` | 강의 목록 |
| POST | `/api/consultant/lectures/:no/complete` | 강의 완료 처리 |
| GET | `/api/consultant/certificate` | 수료증 |
| GET | `/api/consultant/rediagnosis` | 재진단 알림 조회 |
| POST | `/api/consultant/rediagnosis/:id/dismiss` | 재진단 알림 무시 |
| POST | `/api/consultant/rediagnosis/:id/sent` | 재진단 발송 처리 |
| PUT | `/api/consultant/change-password` | 비밀번호 변경 |
| POST | `/api/consultant/ai-message` | AI 메시지 생성 |
| GET | `/api/consultant/checkin-history/:result_id` | 체크인 이력 조회 |

---

### 9-6. 공개 API (인증 불필요)

#### 설문 관련

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/survey/draft` | 설문 임시저장 |
| GET | `/api/survey/draft` | 임시저장 조회 |
| DELETE | `/api/survey/draft` | 임시저장 삭제 |
| POST | `/api/survey/submit` | 설문 제출 (레거시) |
| POST | `/api/survey/notify` | 설문 완료 알림 발송 |
| GET | `/api/survey/result/public/:id` | 공개 결과 조회 |

#### 결과 조회

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/results/:id` | 결과 조회 (구버전) |
| PUT | `/api/results/:id/memo` | 결과 메모 수정 |
| PUT | `/api/results/:id/b2b` | 결과 B2B 귀속 변경 |
| GET | `/api/b2b/programs/:code` | B2B 프로그램 조회 (공개) |
| GET | `/api/b2b/brand/:code` | 브랜드 정보 조회 (설문지용, 공개) |

#### 통계 / BC

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/bc/list` | BC 코드 전체 목록 |
| GET | `/api/v1/stats/axis-rank` | 10축 랭킹 통계 |
| GET | `/api/v1/stats/body-type` | 체형 분포 통계 |

#### 데일리 체크

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/daily-check` | 데일리 체크 저장 |
| GET | `/api/daily-check/:session_id` | 데일리 체크 조회 |
| POST | `/api/checkin` | 체크인 |

#### 소셜 / 가족

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/family-code/join` | 가족 그룹 참여 |
| GET | `/api/v1/family-code/:code` | 가족 그룹 조회 |

#### 결제 / 쿠폰

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/coupon/issue` | 쿠폰 발급 |
| POST | `/api/payment/prepare` | 결제 준비 |
| POST | `/api/payment/confirm` | 결제 확인 |
| GET | `/api/payment/history` | 결제 이력 |
| GET | `/payment/success` | 결제 완료 콜백 |
| GET | `/payment/fail` | 결제 실패 콜백 |

#### 알림 / 채팅 / 기타

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/notifications` | 알림 목록 |
| POST | `/api/notifications/read` | 알림 읽음 처리 |
| POST | `/api/notifications/read-all` | 알림 전체 읽음 |
| GET | `/api/feedback` | 피드백 목록 |
| POST | `/api/feedback/read` | 피드백 읽음 처리 |
| POST | `/api/coaching-comment` | 코칭 코멘트 저장 |
| GET | `/api/coaching-comment/:session_id` | 코칭 코멘트 조회 |
| DELETE | `/api/coaching-comment/:id` | 코칭 코멘트 삭제 |
| GET | `/api/check-alerts` | 체크 알림 |
| POST | `/api/check-alerts/read` | 체크 알림 읽음 |
| POST | `/api/push/subscribe` | PWA 푸시 구독 |
| DELETE | `/api/push/subscribe` | 푸시 구독 해제 |
| GET | `/api/push/vapid-public` | VAPID 공개키 |
| POST | `/api/chat/send` | 채팅 메시지 전송 |
| GET | `/api/chat/messages` | 채팅 메시지 조회 |
| POST | `/api/chat/read` | 채팅 읽음 처리 |
| GET | `/api/chat/unread` | 미읽음 채팅 수 |
| GET | `/api/chat/clients` | 채팅 고객 목록 |
| GET | `/api/places` | 제휴 장소 검색 |
| GET | `/api/settings/kakao` | 카카오 설정 조회 |
| POST | `/api/kakao/send` | 카카오 메시지 발송 |
| POST | `/api/pilot-request` | 파일럿 요청 |
| POST | `/api/consultant-apply` | 컨설턴트 지원 |
| GET | `/api/manifest.json` | PWA 매니페스트 |

---

### 9-7. 페이지 라우트 (HTML 서빙)

| Path | 서빙 파일 | 설명 |
|------|----------|------|
| `/` | `index.html` | 메인/설문 SPA |
| `/admin`, `/admin/*` | `admin.html` | 마스터 관리자 페이지 |
| `/b2b`, `/b2b/*` | `b2b.html` | B2B 대시보드 |
| `/consultant`, `/consultant/*` | `consultant.html` | 컨설턴트 페이지 |
| `/h/:code` | `survey-hospital.html` | 병원 설문 (ref_code 주입) |
| `/h3/:code` | `survey-hospital-3lang.html` | 병원 설문 3개국어 |
| `/a/:code` | `survey-aesthetic.html` | 에스테틱 설문 |
| `/f/:code` | `survey-fitness.html` | 피트니스 설문 |
| `/salon/:code` | `survey-salon.html` | 미용실 설문 |
| `/s/:code` | 미용실 설문 리다이렉트 | `/salon/:code` alias |
| `/result-hospital/:id` | `result-hospital.html` | 병원 결과지 |
| `/result-aesthetic/:id` | `result-aesthetic.html` | 에스테틱 결과지 |
| `/result-fitness/:id` | `result-fitness.html` | 피트니스 결과지 |
| `/result-salon/:id` | `result-salon.html` | 미용실 결과지 |
| `/result-hospital/:id/download` | PDF | 결과지 PDF 다운로드 |
| `/result-hospital/:id/analysis` | HTML | 상세 분석 |
| `/result`, `/result.html` | `result.html` | 구버전 결과지 |
| `/result-v4`, `/result-v4.html` | `result-v4.html` | v4 통합 결과지 |
| `/my/:session_id` | `slimmind-today.html` | 데일리 체크인 |
| `/result/:id` | 리다이렉트 | survey_category 기준 결과지로 자동 라우팅 |
| `/slimmind` | `index.html` | SPA alias |
| `/landing/admin` | 랜딩 HTML | 관리자 랜딩 |

---

## 10. B2B 대시보드 연동 흐름

### 10-1. 전체 파이프라인

```
Step 1: B2B 파트너 생성 (마스터 관리자)
  POST /api/admin/b2b-partners
  { custom_code: 'B2B-HOS-001', survey_category: 'hospital', ... }
  → DB: b2b_partners 레코드 생성
  → 설문 URL 자동 활성화: /h/B2B-HOS-001

Step 2: 고객 설문 URL 접속
  고객이 /h/B2B-HOS-001 접속
  → 서버: b2b_partners WHERE code='B2B-HOS-001' 조회
  → survey-hospital.html 서빙 + ref_code = 'B2B-HOS-001' 주입

Step 3: 설문 완료 → 저장
  POST /api/v1/diagnosis
  { answers: {...}, ref_code: 'B2B-HOS-001', survey_category: 'hospital', ... }
  → 채점: Q_AXIS_MAP → axis_scores → decideSubtype() → bc_code_key = 'BC-6'
  → DB 저장:
    diagnosis_results: { id: 'UUID', ref_code: 'B2B-HOS-001', bc_code_key: 'BC-6', ... }
    hospital_responses: { id: 'UUID', ref_code: 'B2B-HOS-001', ... }
  → 응답: { result_id: 'UUID', redirect_url: '/result-hospital/UUID' }

Step 4: 결과지 표시
  고객 브라우저: /result-hospital/UUID
  → 서버: result-hospital.html 서빙
  → HTML에 주입:
    window.__RESULT_ID__ = 'UUID'
    window.__BRAND__ = { name: '슬리마인드 강남점', color: '#4F46E5', ... }
  → 결과지 JS: GET /api/h/result/UUID → 데이터 로드 → 렌더링

Step 5: B2B 파트너 대시보드 확인
  POST /api/auth/login { code: 'B2B-HOS-001', password: 'b2b001' }
  → JWT 발급 { code: 'B2B-HOS-001', role: 'B2B_PARTNER' }

  GET /api/b2b/results (Authorization: Bearer ...)
  → JWT 파싱 → user.code = 'B2B-HOS-001'
  → SQL: WHERE ref_code = ? .bind('B2B-HOS-001')
  → 해당 파트너의 고객만 반환 ✅
```

### 10-2. `/api/b2b/results` 내부 SQL 로직

```typescript
// 1. JWT에서 파트너 코드 동적 추출
const user = c.get('user') as JwtPayload  // { code: 'B2B-HOS-001' }

// 2. 파트너 업종 확인
const partner = await db.prepare(
  'SELECT survey_category FROM b2b_partners WHERE code=?'
).bind(user.code).first()
const isHospital = partner?.survey_category === 'hospital'

// 3-A. Hospital: 3테이블 UNION + 중복 제거
if (isHospital) {
  // [BUG-FIX v4.3] bc_code_key IS NOT NULL + GLOB 정규화
  const drQuery = `
    SELECT id, user_name, bc_primary,
           CASE WHEN bc_code_key GLOB 'BC-[0-9]*' THEN bc_code_key ELSE NULL END AS axis_primary,
           completed_at AS created_at, ref_code, survey_category AS result_type
    FROM diagnosis_results
    WHERE ref_code=? AND bc_code_key IS NOT NULL
  `

  const hospQuery = `
    SELECT id, user_name, bc_code AS bc_primary,
           CASE WHEN bc_code GLOB 'BC-[0-9]*' THEN bc_code ELSE NULL END AS axis_primary,
           created_at, ref_code, 'hospital' AS result_type
    FROM hospital_responses WHERE ref_code=?
  `

  const regQuery = `
    SELECT id, user_name, bc_primary,
           CASE WHEN bc_primary GLOB 'BC-[0-9]*' THEN bc_primary ELSE NULL END AS axis_primary,
           created_at, ref_code, 'hospital' AS result_type
    FROM results WHERE ref_code=?
  `

  // [BUG-FIX v4.3] seenIds Set으로 중복 제거 (diagnosis_results 우선)
  const seenIds = new Set<string>()
  const combined: any[] = []
  for (const row of drRes.results) {
    if (!seenIds.has(row.id)) { seenIds.add(row.id); combined.push(row) }
  }
  for (const row of hospRes.results) {
    if (!seenIds.has(row.id)) { seenIds.add(row.id); combined.push(row) }
  }
  for (const row of regRes.results) {
    if (!seenIds.has(row.id)) { seenIds.add(row.id); combined.push(row) }
  }
  combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// 3-B. 비병원: diagnosis_results 1순위 + 레거시 보완
else {
  // fitness: fitness_responses + diagnosis_results
  // salon: salon_responses + diagnosis_results
  // aesthetic: aesthetic_responses + diagnosis_results
  // 이미 drIds에 있으면 레거시에서 제외
}
```

### 10-3. 결과지 URL → 대시보드 연결

```
B2B 대시보드 (b2b.html)
  → 결과 목록에서 ID 클릭
  → GET /api/b2b/result-link/{id}
  → 응답: { url: '/result-hospital/UUID', result_type: 'hospital' }
  → 해당 URL로 이동 → 결과지 렌더링
```

---

## 11. 마스터 관리자 기능 상세

### 11-1. 접근 방법

```
URL: /admin  (또는 /admin.html)
로그인: code='MASTER', password='admin1234'
페이지: admin.html (351KB, 단일 SPA)
```

### 11-2. admin.html 주요 탭 구성

```
마스터 관리자 (admin.html)
  │
  ├── 🏠 대시보드          → GET /api/admin/dashboard
  │     총 고객수, 월 신규, BC 분포 차트
  │
  ├── 👥 컨설턴트 관리     → GET/POST/PUT/DELETE /api/admin/consultants
  │     - 신규 등록, 구독 상태 관리, 등급 변경
  │     - 강의 진행도, 수료 인증
  │
  ├── 🏢 B2B 파트너 관리  → GET/POST/PUT/DELETE /api/admin/b2b-partners
  │     - 신규 파트너 생성 (업종 선택 → 설문 URL 자동 활성화)
  │     - 상태 관리 (pending/active/suspended)
  │     - 브랜드 정보 (로고, 색상, 브랜드명)
  │     - 대리 로그인 → GET /api/admin/impersonate/:code
  │
  ├── 📊 전체 결과 조회    → GET /api/admin/results, /api/admin/diagnosis-results
  │     - 전 고객 진단 결과 검색/필터
  │     - BC 분포, 이탈 위험 분석
  │
  ├── 💊 BC 코드 관리     → GET/PUT /api/admin/bc-codes
  │     - BC-1~BC-16 처방 컨텐츠 수정
  │
  ├── 💰 정산             → GET /api/admin/settlement
  │     - 컨설턴트별 수수료 계산
  │
  ├── 🏥 제휴처 관리      → /api/admin/affiliate-places
  │     - 병원/센터 등록, 지역별 검색
  │
  └── ⚙️ 시스템 설정      → /api/settings/kakao, /api/admin/migrate
        - 카카오 채널 설정, DB 마이그레이션 실행
```

### 11-3. 계정 대리 로그인 (Impersonate)

```typescript
// 관리자가 B2B 또는 컨설턴트 계정으로 전환
GET /api/admin/impersonate/B2B-HOS-001

// → 해당 계정의 JWT 발급 (admin 권한으로)
// → 응답: { token: 'eyJ...', role: 'B2B_PARTNER' }
// → 이 토큰으로 B2B 대시보드 접근 가능
```

---

## 12. 결과지 라우팅 및 서버사이드 렌더링

### 12-1. 결과지 URL 패턴

| 업종 | 결과지 URL | 서빙 HTML | 데이터 API |
|------|-----------|----------|-----------|
| 병원 | `/result-hospital/:id` | `result-hospital.html` | `GET /api/h/result/:id` |
| 에스테틱 | `/result-aesthetic/:id` | `result-aesthetic.html` | `GET /api/a/result/:id` |
| 피트니스 | `/result-fitness/:id` | `result-fitness.html` | `GET /api/f/result/:id` |
| 미용실 | `/result-salon/:id` | `result-salon.html` | `GET /api/s/result/:id` |

### 12-2. 서버사이드 변수 주입

결과지 HTML 서빙 시 서버가 직접 JS 변수를 주입합니다:

```typescript
// src/index.tsx ~7087번째 줄
app.get('/result-hospital/:id', async (c) => {
  const id = c.req.param('id')

  // 브랜드 정보 조회 (ref_code → b2b_partners)
  const result = await db.prepare(
    'SELECT ref_code FROM diagnosis_results WHERE id=?'
  ).bind(id).first()

  const brand = result?.ref_code
    ? await db.prepare(
        'SELECT brand_name, brand_color, brand_logo_url FROM b2b_partners WHERE code=?'
      ).bind(result.ref_code).first()
    : null

  // HTML에 주입
  let html = await fetchAsset(c.env.ASSETS, '/result-hospital.html')
  html = html.replace(
    '__RESULT_ID__',
    `window.__RESULT_ID__ = "${id}"`
  )
  html = html.replace(
    '__BRAND__',
    `window.__BRAND__ = ${JSON.stringify({
      name: brand?.brand_name || 'SlimMind',
      color: brand?.brand_color || '#6366f1',
      logo_url: brand?.brand_logo_url || null
    })}`
  )
  return c.html(html)
})
```

### 12-3. 결과지 폴백 로직

```
/result-hospital/:id 접근 시:
  1. hospital_responses WHERE id=?              → 있으면 반환
  2. diagnosis_results WHERE id=? (survey_category='hospital') → 있으면 반환
  3. 없으면 404

/result-fitness/:id 접근 시:
  1. fitness_responses WHERE id=?               → 있으면 반환
  2. diagnosis_results WHERE id=? (폴백)        → 있으면 반환 ← v4.2 추가
  3. 없으면 404

/result-aesthetic/:id 접근 시:
  1. aesthetic_responses WHERE id=?             → 있으면 반환
  2. diagnosis_results WHERE id=?              → 있으면 반환
  3. 없으면 404
```

### 12-4. 범용 리다이렉트 `/result/:id`

```typescript
// src/index.tsx ~2616번째 줄
app.get('/result/:id', async (c) => {
  const id = c.req.param('id')
  // diagnosis_results에서 survey_category 확인
  const result = await db.prepare(
    'SELECT survey_category FROM diagnosis_results WHERE id=?'
  ).bind(id).first()

  // survey_category → 업종별 결과지로 리다이렉트
  const redirectMap = {
    hospital: `/result-hospital/${id}`,
    aesthetic: `/result-aesthetic/${id}`,
    fitness: `/result-fitness/${id}`,
    salon: `/result-salon/${id}`,
    integrated: `/result-v4/${id}`
  }
  return c.redirect(redirectMap[result?.survey_category || 'integrated'])
})
```

### 12-5. phone PII 마스킹 (v4.3 추가)

```typescript
// 공개 결과 API에서 phone 마스킹 처리
function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = String(phone).trim().replace(/\D/g, '')
  if (digits.length < 7) return '***'
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`
}
// 예: '010-1234-5678' → '010-****-5678'

// 적용 경로 (5개):
// - GET /api/h/result/:id (hospital_responses 경로)
// - GET /api/a/result/:id (diagnosis_results + aesthetic_responses)
// - GET /api/f/result/:id (diagnosis_results + fitness_responses)
```

---

## 13. 데이터 격리 메커니즘

### 핵심 원칙

> **하드코딩된 B2B 코드 비교 패턴 (`if code === 'B2B-HOS-001'`) 완전 배제**  
> 모든 격리는 `WHERE ref_code = ? .bind(user.code)` 동적 바인딩으로만 동작

### 격리 코드 패턴

```typescript
// requireB2B() 미들웨어가 JWT 검증 후 user 객체를 컨텍스트에 설정
app.get('/api/b2b/results', requireB2B(), async (c) => {
  const user = c.get('user') as JwtPayload  // JWT에서 동적 추출
  const db = c.env.DB

  // ⭐ 하드코딩 없음 — user.code는 항상 JWT 검증된 값
  await db.prepare(
    'SELECT * FROM diagnosis_results WHERE ref_code = ?'
  ).bind(user.code)  // B2B-HOS-001 또는 B2B-GYM-001 등 동적
  .all()
})
```

### 격리 검증 결과

| 테스트 | 결과 |
|--------|------|
| B2B-HOS-001이 B2B-GYM-001 데이터 요청 | 0건 반환 ✅ |
| B2B-ETC-003이 B2B-ETC-004 데이터 요청 | 0건 반환 ✅ |
| 신규 B2B 계정이 기존 계정 데이터 요청 | 0건 반환 ✅ |
| 소스코드 하드코딩 패턴 감사 | 0건 ✅ |

### SQL 파라미터 바인딩 원칙

```typescript
// ✅ 올바른 방법 (파라미터 바인딩)
db.prepare('SELECT * FROM diagnosis_results WHERE ref_code = ?').bind(userCode).all()

// ❌ 절대 금지 (SQL 인젝션 위험)
db.prepare(`SELECT * FROM diagnosis_results WHERE ref_code = '${userCode}'`).all()
```

---

## 14. 프론트엔드 파일 목록

| 파일 | 크기 | 역할 |
|------|------|------|
| `admin.html` | 351KB | 마스터 관리자 전체 SPA |
| `b2b.html` | 184KB | B2B 파트너 대시보드 |
| `consultant.html` | 244KB | 컨설턴트 페이지 |
| `index.html` | 896KB | 설문 공통 진입점 (메인 SPA) |
| `survey-hospital.html` | 4.0MB | 병원 설문지 (MBTI+오행 포함) |
| `survey-aesthetic.html` | 14.5MB | 에스테틱 설문지 |
| `survey-fitness.html` | 4.1MB | 피트니스 설문지 |
| `survey-salon.html` | 14.7MB | 미용실 설문지 |
| `survey-hospital-3lang.html` | 2.9MB | 병원 설문지 3개국어 |
| `result-hospital.html` | 4.1MB | 병원 결과지 |
| `result-aesthetic.html` | 4.1MB | 에스테틱 결과지 |
| `result-fitness.html` | 4.1MB | 피트니스 결과지 |
| `result-salon.html` | 4.1MB | 미용실 결과지 |
| `result-v4.html` | 1.7MB | 통합 결과지 (구버전) |
| `result.html` | 302KB | 최구버전 결과지 |
| `slimmind-today.html` | 174KB | 데일리 체크인 |
| `bc-definitions.js` | 60KB | BC 코드 정의 데이터 |
| `bc-engine.js` | 552KB | BC 채점 엔진 (클라이언트) |
| `survey-data.js` | 233KB | 설문 문항 데이터 |
| `mapping-engine.js` | 37KB | 설문-축 매핑 엔진 |
| `manifest.json` | — | PWA 매니페스트 |

---

## 15. 버그 수정 이력 및 기술 부채

### v4.3 수정 완료 (2026-08-23, 커밋 `7cc6efd`)

| # | 버그 | 원인 | 수정 |
|---|------|------|------|
| BUG-1 | answers 없이 진단 제출 시 bc_code_key=NULL 레코드 생성 | 입력 유효성 검사 없음 | 3중 검사 추가 (MISSING_DIAGNOSIS_DATA / INSUFFICIENT_ANSWERS) |
| BUG-2 | 대시보드에 NULL bc_code_key 레코드 504건 노출 | drQuery에 IS NOT NULL 조건 없음 | `AND bc_code_key IS NOT NULL` 추가 |
| BUG-3 | Hospital UNION total 불일치 (6 vs 5) | 3테이블 UNION 중복 ID 미제거 | seenIds Set 기반 중복 제거 |
| BUG-4 | 이상 bc_code_key (MO_YANG, WW-01, WF-01) 대시보드 표시 | 레거시 코드에서 비표준 코드 저장 | `CASE WHEN GLOB 'BC-[0-9]*'` 정규화 |
| BUG-5 | 공개 결과 API에서 phone 번호 평문 노출 | maskPhone() 함수 없음 | maskPhone() 추가 + 5개 경로 적용 |

### 이전 버전 수정 이력

| 버전 | 버그 | 수정 |
|------|------|------|
| v4.2 | Fitness 결과지 404 (fitness_responses 없으면 바로 404) | diagnosis_results 폴백 추가 |
| v4.1 | 에스테틱 결과지 오배송 | survey_category 판단 로직 수정 |
| v4.0 | 살롱 B2B 500 에러 | diagnosis_results 이중 저장 + UNION 추가 |

### 현재 미해결 기술 부채

| 우선순위 | 이슈 | 위치 | 설명 |
|---------|------|------|------|
| 🔴 HIGH | `password_hash`에 평문 저장 | `b2b_partners`, `consultants` | bcrypt 전환 필요 |
| 🔴 HIGH | MASTER 비밀번호 하드코딩 | `src/index.tsx ~574` | 환경변수로 이동 필요 |
| 🔴 HIGH | JWT_SECRET 기본값 노출 | `wrangler.jsonc` | Cloudflare Secret 분리 필요 |
| 🟠 MED | `src/index.tsx` 12,000줄 단일 파일 | 전체 | 라우트 모듈 분리 필요 |
| 🟠 MED | 이상 bc_code_key 원본 데이터 잔존 | DB | `MO_YANG`(8건), `WW-01`(3건) |
| 🟡 LOW | B2B 대시보드 페이지네이션 클라이언트 사이드 | `b2b.html` | 대용량 시 성능 저하 가능 |
| 🟡 LOW | 설문 HTML 파일들이 매우 큰 사이즈 | `public/*.html` | 4~15MB 파일들 |

---

## 16. 개발 환경 세팅

### 요구사항

- Node.js 18+
- npm
- Wrangler CLI (글로벌 설치 권장)
- PM2 (로컬 개발용 데몬)

### 초기 세팅

```bash
# 1. 저장소 클론
git clone https://github.com/bavabodylounge-hash/slimmind.git
cd slimmind

# 2. 의존성 설치
npm install

# 3. 로컬 D1 마이그레이션
npx wrangler d1 migrations apply 7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db --local

# 4. 환경 변수 설정
cat > .dev.vars << 'EOF'
JWT_SECRET=local-dev-secret-change-this
EOF

# 5. 빌드
npm run build

# 6. 서버 시작 (PM2)
pm2 start ecosystem.config.cjs

# 7. 동작 확인
curl http://localhost:3000/api/auth/me
```

### 로컬 개발 서버 (ecosystem.config.cjs)

```javascript
module.exports = {
  apps: [{
    name: 'slimmind',
    script: 'npx',
    args: 'wrangler pages dev dist --d1=7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db --local --ip 0.0.0.0 --port 3000',
    env: { NODE_ENV: 'development', PORT: 3000 },
    watch: false,
    instances: 1,
    exec_mode: 'fork'
  }]
}
```

### 유용한 개발 명령

```bash
# 빌드 + 서버 재시작
npm run build && pm2 restart slimmind

# 로컬 DB 쿼리
npx wrangler d1 execute 7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db \
  --local --command "SELECT COUNT(*) FROM diagnosis_results"

# 프로덕션 DB 쿼리 (주의: 실제 운영 데이터)
npx wrangler d1 execute 7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db \
  --remote --command "SELECT COUNT(*) FROM b2b_partners"

# 로그 확인
pm2 logs slimmind --nostream

# 포트 정리
fuser -k 3000/tcp 2>/dev/null || true
```

---

## 17. 배포 절차

### 빌드

```bash
npm run build
# 출력: dist/_worker.js (~433KB gzip)
# 소요 시간: ~2초
```

### 현재 배포 방식: Genspark Hosted Deploy

```bash
# 1. 변경사항 커밋
git add -A
git commit -m "fix: 수정 내용 설명"

# 2. gsk hosted deploy 실행
gsk hosted_deploy

# 또는 자동화된 방식:
# git commit → auto-deploy 훅 → pending_approval → 관리자 승인 → 완료

# 3. 배포 확인
curl https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/api/auth/me
```

### GitHub 동기화

```bash
# GitHub 인증 설정 후
GH_TOKEN=$(gh auth token)
git -c credential.helper="" push \
  "https://x-access-token:${GH_TOKEN}@github.com/bavabodylounge-hash/slimmind.git" main
```

### 프로덕션 확인 체크리스트

```bash
BASE="https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"

# ✅ API 헬스체크
curl $BASE/api/auth/me

# ✅ MASTER 로그인
curl -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"MASTER","password":"admin1234"}'

# ✅ B2B 결과 조회
TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"B2B-HOS-001","password":"b2b001"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
curl $BASE/api/b2b/results -H "Authorization: Bearer $TOKEN"

# ✅ 설문 URL 동작
curl -I $BASE/h/B2B-HOS-001
```

---

## Appendix A: 테스트 계정

| 역할 | 코드 | 비밀번호 | 업종 / 메모 |
|------|------|----------|-----------|
| MASTER | `MASTER` | `admin1234` | 관리자, 모든 권한 |
| B2B 병원 | `B2B-HOS-001` | `b2b001` | hospital, 병원 설문 |
| B2B 에스테틱 | `B2B-ETC-003` | `b2b003` | aesthetic |
| B2B 피트니스 | `B2B-GYM-001` | `b2b001` | fitness, 헬스장 |
| B2B 미용실 | `B2B-ETC-004` | `b2b004` | salon |
| B2B 신규병원 | `B2B-NEW-HOSP-999` | `newhosp999` | hospital, 테스트용 |
| B2B 신규에스테틱 | `B2B-NEW-AEST-999` | `newaest999` | aesthetic, 테스트용 |
| B2B 신규피트니스 | `B2B-NEW-GYM-999` | `newgym999` | fitness, 테스트용 |
| B2B 신규미용실 | `B2B-NEW-SALON-999` | `newsalon999` | salon, 테스트용 |

---

## Appendix B: 핵심 검증 커맨드

```bash
BASE="https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. MASTER 로그인 + 토큰 추출
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MASTER_TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"MASTER","password":"admin1234"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('token','FAIL'))")
echo "MASTER_TOKEN: ${MASTER_TOKEN:0:30}..."

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. B2B 파트너 로그인
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B2B_TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"B2B-HOS-001","password":"b2b001"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('token','FAIL'))")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. B2B 대시보드 결과 조회
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
curl -s "$BASE/api/b2b/results" -H "Authorization: Bearer $B2B_TOKEN" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
null_bc = sum(1 for r in d.get('results',[]) if r.get('axis_primary') is None)
print(f'total={d[\"total\"]}, null_bc={null_bc}')
# 기대: null_bc=0
"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. answers 없이 제출 → 400 검증
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
curl -s -w "\nHTTP:%{http_code}" -X POST $BASE/api/v1/diagnosis \
  -H "Content-Type: application/json" \
  -d '{"user_name":"테스트"}' | tail -2
# 기대: HTTP:400

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. 데이터 격리 검증
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GYM_TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"B2B-GYM-001","password":"b2b001"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")

curl -s "$BASE/api/b2b/results" -H "Authorization: Bearer $GYM_TOKEN" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
hosp = [r for r in d.get('results',[]) if r.get('result_type') == 'hospital']
print(f'GYM에서 병원데이터: {len(hosp)}건 (기대: 0건)')
"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. B2B 파트너 전체 목록 (마스터 권한)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
curl -s "$BASE/api/admin/b2b-partners" -H "Authorization: Bearer $MASTER_TOKEN" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
partners = d.get('partners', d) if isinstance(d, dict) else d
for p in (partners if isinstance(partners, list) else []):
  print(f\"{p.get('code')} | {p.get('survey_category')} | {p.get('status')}\")
"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7. 설문 URL 접속 확인
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
for CODE in B2B-HOS-001 B2B-ETC-003 B2B-GYM-001 B2B-ETC-004; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/h/$CODE)
  echo "GET /h/$CODE → HTTP:$STATUS"
done
```

---

*본 명세서는 SlimMind B2B Platform v4.3 기준으로 작성되었습니다.*  
*문의 및 히스토리: GitHub 커밋 로그 참조 → https://github.com/bavabodylounge-hash/slimmind*  
*배포 URL: https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com*
