# SlimMind 백엔드 작업 가이드

> 마지막 업데이트: 2026-07-19  
> 목적: 향후 수정 시 참고할 수 있도록 시스템 전체 구조와 핵심 로직을 기록

---

## 1. 시스템 아키텍처

```
사용자 브라우저
    │
    ▼
Cloudflare Pages (정적 파일)  ←──  public/*.html, public/static/*
    │
    ▼
Cloudflare Workers (Hono)  ←──  src/index.tsx → dist/_worker.js
    │
    ├── API 라우트 (/api/*)
    │
    └── HTML 서빙 라우트 (/result/:id, /s/:code, /h/:code 등)
            │
            ├── ASSETS.fetch() → HTML 파일 텍스트
            └── DB (D1 SQLite)
```

**기술 스택**: Hono v4 + Cloudflare Pages + D1 SQLite  
**배포 URL**: `https://slimmind.kr`  
**자동 배포**: git commit → `gsk hosted deploy` 자동 실행

---

## 2. 파일별 역할

### 핵심 파일

| 파일 | 역할 | 비고 |
|------|------|------|
| `src/index.tsx` | 전체 백엔드 로직 (117개 API + HTML 서빙) | 빌드 → `dist/_worker.js` |
| `public/bc-engine.js` | BC코드 계산 엔진 (외부 로드용) | NICKNAME_TABLE + NICKNAME_TO_BC 포함 |
| `public/survey-data.js` | 설문 문항 데이터 + BC코드 테이블 | NICKNAME_TO_BC_CODE 변수명 주의 |

### HTML 파일 — **인라인 엔진 vs 외부 로드**

> ⚠️ **중요**: 아래 3개 결과지는 bc-engine.js를 외부 로드하지 않고  
> 엔진 전체를 HTML 내부에 복사·내장(inline)합니다.  
> bc-engine.js 수정 시 **반드시 3개 파일도 동일하게 수정**해야 합니다.

| 파일 | 엔진 방식 | BC테이블 변수명 | 수정 시 체크포인트 |
|------|-----------|----------------|-------------------|
| `public/result-hospital.html` | **인라인** | `NICKNAME_TO_BC` | NICKNAME_TABLE + NICKNAME_TO_BC 동기화 |
| `public/result-v4.html` | **인라인** | `NICKNAME_TO_BC` | NICKNAME_TABLE + NICKNAME_TO_BC 동기화 |
| `public/result-aesthetic.html` | **인라인** | `NICKNAME_TO_BC` | NICKNAME_TABLE + NICKNAME_TO_BC 동기화 |
| `public/bc-engine.js` | 외부 로드 원본 | `NICKNAME_TO_BC` | 이 파일이 정답 기준 |
| `public/survey-data.js` | 외부 로드 | `NICKNAME_TO_BC_CODE` | `_CODE` 접미사 주의 |
| `public/index.html` | Fallback 변수 | `_NICKNAME_TO_BC_LOCAL` | bc-engine.js 로드 실패 시 대비 |
| `public/survey-hospital.html` | Fallback 변수 | `_NICKNAME_TO_BC_LOCAL` | bc-engine.js 로드 실패 시 대비 |
| `public/survey-aesthetic.html` | Fallback 변수 | `_NICKNAME_TO_BC_LOCAL` | bc-engine.js 로드 실패 시 대비 |

### ⚠️ BC코드 테이블 수정 시 반드시 8개 파일 모두 동기화

```
bc-engine.js (정답 기준)
    │
    ├── NICKNAME_TO_BC → 동일하게: result-hospital.html, result-v4.html, result-aesthetic.html
    ├── NICKNAME_TO_BC_CODE → survey-data.js (변수명 다름!)
    └── _NICKNAME_TO_BC_LOCAL → index.html, survey-hospital.html, survey-aesthetic.html
```

---

## 3. BC코드 계산 6단계 흐름

```
1차 외형분류 (A01~A09 점수 중 top1 결정)
    │
2차 배경뼈대 detectBackground(scores) → background 값
    │
3차 원인축10개 (A01~A10 각 점수 0~100)
    │
4차 결정질문 → NICKNAME_TABLE[top1][top2][background] → nickname
    │
5차 충돌쐐기 (고득점 축이 2개인 경우 처리)
    │
6차 최종코드 NICKNAME_TO_BC[nickname] → 'BC-1' ~ 'BC-9'
```

### NICKNAME_TABLE 구조

```javascript
// NICKNAME_TABLE[top1축][top2축]['default' | background값] → 닉네임
NICKNAME_TABLE['A01']['A07']['default'] = '동시다발 다중악순환형'  // → BC-6
NICKNAME_TABLE['A03']['A07']['default'] = '호르몬스위치 갱년기형'  // → BC-6
NICKNAME_TABLE['A04']['A09']['default'] = '상체근육형'             // → BC-8
```

### 현재 정답 NICKNAME_TO_BC 테이블 (bc-engine.js 기준)

```javascript
'오후만되면 코끼리다리형':   'BC-1'
'엄마체형 하지정체형':       'BC-1'
'안 쓰는 팔뚝 부종형':       'BC-2'
'아빠체형 내장비대형':        'BC-4'  // ★ BC-3 아님
'식후기절 혈당롤러코스터형': 'BC-3'
'식후임산부 가스풍선형':      'BC-3'
'스트레스성 야식부엉이형':   'BC-3'  // ★ BC-6 아님
'억제제부작용 배부름마비형': 'BC-3'  // ★ BC-6 아님
'여름에도 시린 얼음장형':    'BC-6'  // ★ BC-4 아님
'약물부작용 강제축적형':      'BC-4'
'대사증후군 종합형':          'BC-4'  // ★ BC-9 아님
'지방흡입후 재발형':          'BC-2'  // ★ BC-5 아님
'스트레스기절 번아웃형':     'BC-6'
'호르몬스위치 갱년기형':     'BC-6'
'털털한 PCOS형':             'BC-6'
'동시다발 다중악순환형':     'BC-6'
'출산후 바람빠진 풍선형':    'BC-7'
'골반틀어짐 승마살형':       'BC-7'
'목짧아지는 거북이형':       'BC-7'  // ★ BC-2 아님
'겨드랑이 부유방형':         'BC-7'  // ★ BC-2 아님
'운동할수록 말벅지형':       'BC-8'
'상체근육형':                'BC-8'
'팔다리거미 올챙이배형':     'BC-9'
```

---

## 4. 4대 바디 지표 계산식

> 위치: `result-hospital.html` line ~7734, `result-v4.html` line ~7734, `result-aesthetic.html` 동일

```javascript
// axis_scores에서 A01~A10 점수(0~100) 추출 후:
const metaAge     = Math.round(40 + A03 * 0.15 + A07 * 0.1)   // 대사효율나이 (세)
const metaBelly   = Math.min(99, Math.round(A01 * 0.8 + A05 * 0.2))  // 복부위험도 (%)
const metaHormone = Math.min(99, Math.round(A03 * 0.6 + A07 * 0.4))  // 호르몬부하 (%)
const metaBody    = Math.min(99, Math.round(A06 * 0.7 + A02 * 0.3))  // 체형불균형 (%)
```

**검증 예시** (스크린샷 역산):
- A03(호르몬)=100, A07(코르티솔)=65 → metaAge=62세, metaHormone=86% ✓
- top1=A03, top2=A07 → '호르몬스위치 갱년기형' → BC-6 ✓

---

## 5. 데이터 흐름 (3개 파이프라인)

### 파이프라인 A: 일반 설문 (SlimMind)

```
index.html (설문)
    │ POST /api/survey/submit
    ▼
diagnosis_results 테이블
    │ GET /result/:id
    ▼
result-v4.html (window.__RESULT__ 주입)
```

### 파이프라인 B: 병원 전용

```
survey-hospital.html (설문)
    │ POST /api/h/diagnosis
    ▼
hospital_responses 테이블 (axis_scores JSON 컬럼)
    │ GET /result-hospital/:id
    ▼
result-hospital.html (__HOSPITAL_RESULT_ID__ 마커 → JS가 /api/h/result/:id 호출)
```

### 파이프라인 C: 에스테틱 전용

```
survey-aesthetic.html (설문)
    │ POST /api/a/diagnosis
    ▼
diagnosis_results 테이블 (survey_category='aesthetic')
    │ GET /result-aesthetic/:id
    ▼
result-aesthetic.html (__AESTHETIC_RESULT_ID__ 마커 → JS가 /api/a/result/:id 호출)
```

---

## 6. 주요 API 엔드포인트

### 인증
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| GET  | `/api/auth/me` | 현재 사용자 확인 |
| GET  | `/api/admin/impersonate/:code` | MASTER 전용 대리접속 |

### 설문/결과
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/survey/submit` | 일반 설문 제출 → diagnosis_results |
| GET  | `/api/survey/result/public/:id` | 공개 결과 조회 |
| GET  | `/api/results/:id` | 결과 상세 |
| POST | `/api/survey/draft` | 임시저장 |
| GET  | `/api/survey/draft?sid=` | 임시저장 불러오기 |

### 병원 전용 (h-prefix)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/h/diagnosis` | 병원 설문 제출 → hospital_responses |
| GET  | `/api/h/result/:id` | 병원 결과 조회 (4대 지표 포함) |

### 에스테틱 전용 (a-prefix)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/a/diagnosis` | 에스테틱 설문 제출 |
| GET  | `/api/a/result/:id` | 에스테틱 결과 조회 |

### B2B 파트너
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET  | `/api/b2b/me` | 파트너 정보 |
| GET  | `/api/b2b/results` | 결과 목록 |
| GET  | `/api/b2b/brand/:code` | 브랜드 정보 |
| GET  | `/api/b2b/subaccounts` | 서브계정 목록 |
| POST | `/api/b2b/subaccounts` | 서브계정 생성 |

### 관리자 (MASTER 전용)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET  | `/api/admin/dashboard` | 대시보드 통계 |
| GET  | `/api/admin/consultants` | 컨설턴트 목록 |
| POST | `/api/admin/consultants` | 컨설턴트 생성 |
| GET  | `/api/admin/b2b-partners` | B2B 파트너 목록 |
| POST | `/api/admin/b2b-partners` | B2B 파트너 생성 |

---

## 7. DB 스키마 핵심 테이블

### `diagnosis_results` — 일반/에스테틱 설문 결과

```sql
id              TEXT PRIMARY KEY  -- UUID (일반) 또는 'A-...' (에스테틱)
session_id      TEXT              -- 사용자 세션
name            TEXT              -- 고객 이름
bc_primary      TEXT              -- BC-1 ~ BC-9
nickname        TEXT              -- 체형 닉네임
axis_scores     TEXT              -- JSON: {A01:85, A02:30, ...}
consultant_code TEXT              -- 담당 컨설턴트
survey_category TEXT              -- 'integrated' | 'aesthetic'
created_at      DATETIME
```

### `hospital_responses` — 병원 전용 설문 결과

```sql
id              TEXT PRIMARY KEY  -- 'H-' + UUID
session_id      TEXT
name            TEXT
bc_primary      TEXT
nickname        TEXT
axis_scores     TEXT              -- JSON: {A01:85, A02:30, ...}
b2b_partner_code TEXT
gender          TEXT
height          REAL
age             INTEGER
created_at      DATETIME
```

### `consultants` — 컨설턴트 계정

```sql
id              INTEGER PRIMARY KEY
code            TEXT UNIQUE       -- MASTER | SC-0001 | ...
name            TEXT
password_hash   TEXT
subscription_status TEXT          -- active | suspended
```

### `b2b_partners` — B2B 파트너

```sql
id              INTEGER PRIMARY KEY
code            TEXT UNIQUE       -- B2B-XXX-000
name            TEXT
brand_name      TEXT
brand_color     TEXT              -- #hex
brand_logo_url  TEXT
survey_category TEXT              -- 'hospital' | 'aesthetic' | 'integrated'
status          TEXT              -- active | suspended
```

### `survey_drafts` — 임시저장

```sql
sid             TEXT PRIMARY KEY  -- sm_timestamp_random
idx             INTEGER           -- 현재 진행 문항 번호
answers_json    TEXT              -- 응답 JSON
measure_json    TEXT              -- 측정값 JSON
ref_code        TEXT
total_q         INTEGER
```

---

## 8. HTML 서빙 구조 (캐시 우회)

### fetchAsset() — ASSETS 내부 fetch

```typescript
// src/index.tsx line 18
async function fetchAsset(assets: Fetcher, path: string): Promise<string> {
  const req = new Request(`http://assets${path}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    }
  })
  const res = await assets.fetch(req)
  return res.text()
}
```

### htmlResponse() — HTTP 응답 no-cache 헤더

```typescript
// src/index.tsx line 30
function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
```

**캐시 우회 3중 방어**:
1. `fetchAsset()` — ASSETS 내부 fetch no-cache
2. `htmlResponse()` — HTTP 응답 헤더 no-cache
3. HTML `<head>` meta 태그 — 브라우저 캐시 차단

---

## 9. HTML 주입 마커

결과지 HTML에 동적 데이터를 주입할 때 사용하는 마커:

| 파일 | 마커 | 주입 내용 |
|------|------|-----------|
| `result-hospital.html` | `<!-- ══ 병원 전용: API 연동 + ID 주입 ══ -->` | `window.__HOSPITAL_RESULT_ID__` |
| `result-aesthetic.html` | `<!-- ══ 에스테틱 전용: API 연동 + __RESULT__ 주입 ══ -->` | `window.__AESTHETIC_RESULT_ID__` |
| `result-v4.html` | `</head>` 직전 | `window.__RESULT__` JSON |

마커가 없을 경우 `</head>` 교체 폴백으로 동작함.

---

## 10. 화이트라벨 진입 라우트

```
/s/:code    → 일반 설문 (index.html) + 브랜드 주입
/h/:code    → 병원 설문 (survey-hospital.html) + 브랜드 주입
/a/:code    → 에스테틱 설문 (survey-aesthetic.html) + 브랜드 주입
/f/:code    → 피트니스 설문 (survey-fitness.html) + 브랜드 주입
```

브랜드 주입 내용: `brand_color`, `brand_logo_url`, `brand_name`, `ref_code`

---

## 11. JWT 인증 구조

- **알고리즘**: HMAC-SHA256 (Web Crypto API — Node.js crypto 사용 불가)
- **Payload**: `{ sub, code, role, name, exp }`
- **Role**: `MASTER` | `CONSULTANT` | `B2B_PARTNER`
- **유효기간**: MASTER/CONSULTANT 24시간, B2B 7일, 대리접속 2시간
- **Secret**: 환경변수 `JWT_SECRET` (미설정 시 기본값 사용 — 운영에서 반드시 설정)

---

## 12. 마이그레이션 파일 목록

```
migrations/
├── 0001 ~ 0038   기본 테이블 생성
├── 0039_coaching_comments.sql
├── 0040_survey_drafts.sql
├── 0041_daily_checks_detail.sql
├── 0042_diagnosis_gender_height_age.sql
├── 0043_payments.sql
├── 0044_rediagnosis_alerts.sql
├── 0045_lecture_quiz.sql
├── 0046_baba_clinic_seed.sql
├── 0047_hospital_mbti_full.sql    ← hospital_responses 풀스키마
└── 0048_aesthetic_programs.sql
```

새 마이그레이션 추가 시:
```bash
# 파일 생성: migrations/0049_새기능.sql
# 로컬 적용:
npx wrangler d1 migrations apply webapp-production --local
# 프로덕션 적용:
npx wrangler d1 migrations apply webapp-production
```

---

## 13. 수정 시 주의사항 체크리스트

### BC코드 테이블 수정
- [ ] `public/bc-engine.js` 수정 (정답 기준)
- [ ] `public/result-hospital.html` 인라인 엔진 동기화
- [ ] `public/result-v4.html` 인라인 엔진 동기화
- [ ] `public/result-aesthetic.html` 인라인 엔진 동기화
- [ ] `public/survey-data.js` (`NICKNAME_TO_BC_CODE` 변수명)
- [ ] `public/index.html` (`_NICKNAME_TO_BC_LOCAL`)
- [ ] `public/survey-hospital.html` (`_NICKNAME_TO_BC_LOCAL`)
- [ ] `public/survey-aesthetic.html` (`_NICKNAME_TO_BC_LOCAL`)

### 새 API 추가
- [ ] `src/index.tsx`에 라우트 추가
- [ ] DB 변경 필요 시 마이그레이션 파일 생성
- [ ] 로컬 마이그레이션 적용 후 테스트
- [ ] 프로덕션 마이그레이션 적용

### 배포
```bash
cd /home/user/webapp
git add .
git commit -m "fix: 설명"
# → auto-deploy 자동 실행
```

---

## 14. 커밋 히스토리 (주요 변경점)

| 커밋 | 내용 |
|------|------|
| `7b4acec` | bc-engine.js NICKNAME_TO_BC 8개 오류 수정 + A01[A07] 추가 |
| `46e497f` | result-hospital.html 인라인 엔진 동기화 (22/22 통과) |
| `f3d7fe4` | 6개 파일 BC엔진 전수조사 일괄 수정 |
| `894df62` | 전체 HTML 서빙 no-cache 적용 - 수정사항 새로고침 즉시 반영 |
