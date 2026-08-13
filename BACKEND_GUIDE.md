# BACKEND_GUIDE.md — 백엔드 API & DB 가이드

> 최종 업데이트: 2026-08-13  
> 엔드포인트 총 194개 | DB 테이블 34개 | 마이그레이션 0001~0059

---

## 1. 기술 스택

```
Runtime:    Cloudflare Workers for Platform
Framework:  Hono v4 (TypeScript)
DB:         Cloudflare D1 (SQLite)
Auth:       JWT HS256 (jose 라이브러리)
Build:      Vite 6 + @hono/vite-cloudflare-pages
Entry:      src/index.tsx (10,147줄)
```

---

## 2. Cloudflare 설정 (`wrangler.jsonc`)

```jsonc
{
  "name": "slimmind",
  "compatibility_date": "2026-05-03",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [{
    "binding": "DB",
    "database_name": "7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db",
    "database_id": "6edfb42e-bd6b-4e66-a0f4-8d560c9be418"
  }],
  "vars": {
    "JWT_SECRET": "slimmind-jwt-secret-change-in-production"
  },
  "triggers": {
    "crons": ["30 23 * * *", "30 3 * * *", "30 10 * * *"]  // 웹푸시 KST 08:30/12:30/19:30
  }
}
```

---

## 3. 인증 시스템

### JWT 구조
```typescript
// 토큰 발급: /api/auth/login
// Header: Authorization: Bearer <token>
// Payload: { id, code, name, role, b2b_code }

// role 종류
'MASTER'     // 슬림마인드 관리자
'ANY'        // 컨설턴트 (로그인된 모든 역할)
b2b_code     // B2B 파트너 (requireB2B() 미들웨어)
```

### 미들웨어
```typescript
requireRole('MASTER')  // 관리자 전용
requireRole('ANY')     // 컨설턴트 전용
requireB2B()           // B2B 파트너 전용
```

---

## 4. API 엔드포인트 전체 목록

### 4-1. 인증 (`/api/auth/`)
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/auth/login` | 컨설턴트/관리자 로그인 | - |
| GET | `/api/auth/me` | 내 정보 조회 | JWT |
| POST | `/api/auth/register` | 랜딩 회원가입 (이름·이메일·전화) | - |

### 4-2. 설문 (`/api/survey/`)
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/survey/draft` | 설문 임시저장 | - |
| GET | `/api/survey/draft` | 임시저장 불러오기 | - |
| DELETE | `/api/survey/draft` | 임시저장 삭제 | - |
| POST | `/api/survey/submit` | 설문 최종 제출 → BC 진단 | - |
| GET | `/api/survey/result/public/:id` | 공개 결과지 조회 | - |

### 4-3. 결과지 (`/api/results/`)
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/results/:id` | 결과지 상세 조회 | - |
| PUT | `/api/results/:id/memo` | 관리자 메모 저장 | - |
| PUT | `/api/results/:id/b2b` | B2B 파트너 연결 | - |

### 4-4. 컨설턴트 (`/api/consultant/`)
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/consultant/me` | 내 정보 | ANY |
| GET | `/api/consultant/results` | 담당 고객 결과지 목록 | ANY |
| GET | `/api/consultant/stats` | 통계 | ANY |
| PUT | `/api/consultant/change-password` | 비밀번호 변경 | ANY |
| GET | `/api/consultant/my-qr` | QR 코드 생성 | ANY |
| GET | `/api/consultant/my-qr/stats` | QR 통계 | ANY |
| POST | `/api/consultant/ai-message` | AI 고객 메시지 생성 | ANY |
| GET | `/api/consultant/rediagnosis` | 재진단 알림 목록 | ANY |
| POST | `/api/consultant/rediagnosis/:id/dismiss` | 알림 무시 | ANY |
| POST | `/api/consultant/rediagnosis/:id/sent` | 알림 발송 완료 | ANY |
| GET | `/api/consultant/lectures` | 강의 목록 | ANY |
| POST | `/api/consultant/lectures/:no/complete` | 강의 수강 완료 | ANY |
| GET | `/api/consultant/certificate` | 수료증 조회 | ANY |

### 4-5. B2B (`/api/b2b/`)
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/b2b/brand/:code` | 브랜드 정보 조회 | - |
| GET | `/api/b2b/me` | 내 파트너 정보 | B2B |
| GET | `/api/b2b/results` | 고객 결과지 목록 | B2B |
| GET | `/api/b2b/export-csv` | CSV 내보내기 | B2B |
| GET | `/api/b2b/stats` | 파트너 통계 | B2B |
| GET | `/api/b2b/partner-view/:bc_code` | BC코드별 뷰 | B2B |
| GET | `/api/b2b/customer-lookup` | 고객 검색 | B2B |
| GET | `/api/b2b/customer-summary` | 고객 요약 | B2B |
| GET | `/api/b2b/group-analysis` | 그룹 분석 | B2B |

### 4-6. 관리자 (`/api/admin/`) — MASTER 전용
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/dashboard` | 대시보드 통계 |
| GET | `/api/admin/results` | 전체 결과지 목록 |
| GET/POST/PUT/DELETE | `/api/admin/consultants/:code` | 컨설턴트 CRUD |
| GET/POST/PUT/DELETE | `/api/admin/b2b-partners/:code` | B2B 파트너 CRUD |
| GET/PUT | `/api/admin/bc-codes/:code` | BC코드 관리 |
| GET/POST/DELETE | `/api/admin/aesthetic-programs` | 에스테틱 프로그램 |
| GET | `/api/admin/settlement` | 정산 현황 |
| GET | `/api/admin/migrate` | DB 마이그레이션 실행 |
| GET | `/api/admin/impersonate/:code` | 계정 대행 |
| POST/GET | `/api/admin/rediagnosis/scan` | 재진단 스캔 |
| GET | `/api/admin/certificates` | 수료증 전체 |
| GET | `/api/admin/group-analysis/:code` | 파트너 그룹 분석 |
| GET/POST/PUT/DELETE | `/api/admin/affiliate-places` | 제휴 장소 CRUD |
| PUT/GET | `/api/settings/kakao-map` | 카카오맵 설정 |
| GET | `/api/admin/users` | 랜딩 가입 회원 목록 |
| GET | `/api/admin/pilot-requests` | 파일럿 신청 목록 |
| GET | `/api/admin/consultant-applies` | 컨설턴트 신청 목록 |
| GET | `/api/admin/stats` | 통합 통계 |

### 4-7. 채팅 (`/api/chat/`)
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/chat/send` | 메시지 전송 | - |
| GET | `/api/chat/messages` | 메시지 목록 | - |
| POST | `/api/chat/read` | 읽음 처리 | - |
| GET | `/api/chat/unread` | 안읽은 수 | ANY |
| GET | `/api/chat/clients` | 클라이언트 목록 | ANY |

### 4-8. 웹푸시 (`/api/push/`)
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/push/subscribe` | 푸시 구독 등록 |
| DELETE | `/api/push/subscribe` | 구독 해제 |
| GET | `/api/push/vapid-public` | VAPID 공개키 |

### 4-9. 기타
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/places` | 제휴 장소 목록 |
| GET | `/api/manifest.json` | PWA 매니페스트 |
| GET | `/api/download-sample-pdf` | PDF → 302 redirect |
| POST | `/api/pilot-request` | 파일럿 상담 신청 |
| POST | `/api/consultant-apply` | 컨설턴트 교육 신청 |

### 4-10. 페이지 라우트
| Path | 페이지 |
|------|--------|
| `/` | 진단 메인 (설문) |
| `/result/:id` | 결과지 |
| `/h/:code` | 병원 전용 설문 |
| `/a/:code` | 에스테틱 전용 설문 |
| `/f/:code` | 피트니스 전용 설문 |
| `/s/:code` | 건기식 전용 설문 |
| `/my/:session_id` | 내 결과지 조회 |
| `/payment/success` | 결제 성공 |
| `/payment/fail` | 결제 실패 |
| `/admin` | 관리자 대시보드 |
| `/consultant` | 컨설턴트 대시보드 |
| `/b2b` | B2B 관리자 |
| `/landing/*` | 랜딩 페이지 (Cloudflare Pages 직서빙) |
| `/landing/sample-report` | 16BC 샘플 리포트 |

---

## 5. DB 스키마 (Cloudflare D1 / SQLite)

### 5-1. 핵심 테이블

#### `consultants` — 컨설턴트
```sql
id                   TEXT PRIMARY KEY  -- UUID
code                 TEXT UNIQUE       -- SC-0001 형식
name                 TEXT
email                TEXT UNIQUE
password_hash        TEXT
job_type             TEXT              -- 트레이너/필라테스강사/뷰티/병원직원
grade                TEXT DEFAULT '일반' -- 일반/시니어/마스터
subscription_status  TEXT DEFAULT 'pending' -- pending/active/expired/suspended
subscription_end     TEXT              -- YYYY-MM-DD
lecture_progress     INTEGER DEFAULT 0 -- 0~12강
is_certified         INTEGER DEFAULT 0
phone                TEXT
created_at           TEXT DEFAULT (datetime('now'))
```

#### `results` — 진단 결과지
```sql
id                   TEXT PRIMARY KEY  -- RES-YYYYMMDD-XXXXXX
user_name            TEXT
consultant_code      TEXT REFERENCES consultants(code)
bc_primary           TEXT NOT NULL     -- BC-01~16
bc_secondary         TEXT
bc_primary_score     INTEGER
bc_secondary_score   INTEGER
bc_scores_json       TEXT              -- {"BC-01":72, ...}
ohaeng_type          TEXT              -- 목/화/토/금/수
mbti                 TEXT
blood_type           TEXT
birth_date           TEXT
gender               TEXT
height               REAL
weight               REAL
target_weight        REAL
bmi                  REAL
survey_answers_json  TEXT              -- 전체 설문 응답
is_premium           INTEGER DEFAULT 0
admin_memo           TEXT
created_at           TEXT DEFAULT (datetime('now'))
```

#### `bc_prescriptions` — 바디코드 처방 DB
```sql
bc_code              TEXT PRIMARY KEY  -- BC-01~16
version              TEXT DEFAULT 'v1.0'
brand_name           TEXT
tagline              TEXT
fat_area             TEXT
bc_primary_oneline_reason TEXT
bc_cause_story       TEXT
-- 식단, 운동, 제품, 비급여 처방 등 50+ 컬럼
```

#### `b2b_partners` — B2B 파트너
```sql
id                   TEXT PRIMARY KEY
code                 TEXT UNIQUE       -- BP-0001 형식
name                 TEXT
industry_type        TEXT              -- hospital/beauty/fitness/korean/supplement
brand_name           TEXT
logo_url             TEXT
primary_color        TEXT
subscription_status  TEXT DEFAULT 'active'
subscription_end     TEXT
admin_email          TEXT
admin_password_hash  TEXT
created_at           TEXT
```

#### `payments` — 결제
```sql
id                   TEXT PRIMARY KEY
result_id            TEXT
amount               INTEGER
status               TEXT              -- pending/completed/failed/refunded
payment_method       TEXT
pg_transaction_id    TEXT
created_at           TEXT
```

#### `chat_messages` — 채팅
```sql
id                   INTEGER PRIMARY KEY AUTOINCREMENT
session_id           TEXT              -- 결과지 ID
consultant_code      TEXT
message              TEXT
sender               TEXT              -- 'user' | 'consultant'
is_read              INTEGER DEFAULT 0
client_name          TEXT
created_at           TEXT
```

### 5-2. 보조 테이블 전체 목록
| 테이블 | 용도 |
|--------|------|
| `mbti_blood_db` | MBTI·혈액형 조합 처방 |
| `ohaeng_db` | 오행 타입 처방 |
| `saju_db` | 사주 일간 처방 |
| `bc_interpretation` | BC 해석 텍스트 |
| `bc_partner_view` | 파트너별 BC 뷰 설정 |
| `bc_prescription_versions` | 처방 버전 이력 |
| `b2b_institutions` | 구버전 B2B (레거시) |
| `b2b_custom_programs` | B2B 커스텀 프로그램 |
| `aesthetic_programs` | 에스테틱 프로그램 DB |
| `affiliate_places` | 제휴 장소 |
| `diagnosis_results` | 진단 결과 메타 |
| `hospital_responses` | 병원 설문 응답 |
| `checkin_log` | 체크인 기록 |
| `weekly_checkins` | 주간 체크인 |
| `daily_checks` | 일일 체크 |
| `check_alerts` | 체크 알림 |
| `rediagnosis_alerts` | 재진단 알림 |
| `coaching_comments` | 코칭 코멘트 |
| `survey_drafts` | 설문 임시저장 |
| `survey_notifications` | 설문 알림 |
| `coupons` | 쿠폰 |
| `push_subscriptions` | 웹푸시 구독 |
| `lecture_completions` | 강의 수강 완료 |
| `certificates` | 수료증 |
| `payments` | 결제 |
| `admin_logs` | 관리자 로그 |
| `settings_kv` | 키-값 설정 |
| `mapping_schema_versions` | 매핑 스키마 버전 |
| `churn_alerts` | 이탈 알림 |

---

## 6. 마이그레이션

### 실행 방법
```bash
# 로컬 (개발)
npx wrangler d1 migrations apply slimmind --local

# 프로덕션
npx wrangler d1 migrations apply slimmind

# 특정 마이그레이션 확인
npx wrangler d1 execute slimmind --local --command="SELECT * FROM d1_migrations"
```

### 마이그레이션 이력
| 번호 | 파일 | 내용 |
|------|------|------|
| 0001 | initial_schema | 기본 테이블 (consultants/results/bc_prescriptions) |
| 0002 | seed_data | 초기 BC 처방 데이터 |
| 0003~0005 | v2_upgrade | v2 업그레이드 |
| 0006~0017 | seed_bc01~10 | BC코드 처방 데이터 |
| 0018 | seed_meal_week1 | 1주차 식단 데이터 |
| 0019 | allergy_menopause | 알러지·폐경 필드 |
| 0021 | axis_scores | 10대 원인축 점수 |
| 0022 | checkin_log | 체크인 로그 |
| 0025 | b2b_partners | B2B 파트너 테이블 |
| 0026 | seed_bc11~22 | BC-11~16 처방 데이터 |
| 0027~0028 | diagnosis | 진단 결과 테이블 |
| 0034 | coupons | 쿠폰 시스템 |
| 0043 | payments | 결제 테이블 |
| 0045 | lecture_quiz | 강의·퀴즈 |
| 0053~0054 | chat_messages | 채팅 시스템 |
| 0055 | performance_indexes | 성능 인덱스 |
| 0058 | perf_security | 보안·성능 개선 |
| 0059 | mapping_schema_versions | 매핑 버전 관리 |

---

## 7. 환경변수

| 변수 | 값 | 설명 |
|------|-----|------|
| `JWT_SECRET` | `slimmind-jwt-secret-*` | JWT 서명 키 (프로덕션에서 변경 필수) |
| `DB` | D1 binding | Cloudflare D1 데이터베이스 |
| `ASSETS` | Assets binding | 정적 파일 서빙 |

---

## 8. Cron Jobs (웹푸시)

```
30 23 * * *  → KST 08:30 — 아침 알림
30 3  * * *  → KST 12:30 — 점심 알림
30 10 * * *  → KST 19:30 — 저녁 알림
```
