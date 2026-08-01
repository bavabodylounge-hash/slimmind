# CURRENT_SPEC.md — SlimMind 시스템 현행 명세서

> **이 파일은 단일 진실 소스(Single Source of Truth)입니다.**  
> 향후 모든 수정·배포 작업은 과거 대화 히스토리가 아닌 이 파일을 기준으로 합니다.  
> 수정 후 반드시 이 파일을 갱신하고 커밋해 주세요.  
> **최종 갱신**: 2026-08-01 | **Stable Tag**: `v1.0-STABLE` (commit `0de04a8`)

---

## 1. 라우트 → HTML 파일 매핑 (현행 완전판)

### 1-1. 질문지(Survey) 진입 라우트

| URL 패턴 | 서빙 HTML | 비고 |
|---|---|---|
| `/h/:code` | `public/survey-hospital.html` | 병원 전용. `survey_category='hospital'` 주입 |
| `/a/:code` | `public/survey-aesthetic.html` | 에스테틱 전용. `survey_category='aesthetic'` 주입 |
| `/f/:code` | `public/survey-aesthetic.html` (fallback) | 피트니스용 (별도 파일 미존재 시 index.html) |
| `/s/:code` | 통합질문지 (`/index.html` 계열) | 통합형 |
| `/my/:session_id` | 복약/체크인 세션 | diagnosis_results 조회 기반 |

> **주의**: `/survey-hospital-3lang.html` 직접 접근은 403 차단 처리됨 (`_block3lang`).  
> `/h/:code`에서 `partner.survey_category !== 'hospital'`이면 해당 카테고리 경로로 302 리다이렉트.

---

### 1-2. 결과지(Result) 라우트

| URL 패턴 | 서빙 HTML | 트리거 조건 |
|---|---|---|
| `/result/:id` | **라우팅 허브** — 아래 분기 결정 | diagnosis_results 조회 후 category 판별 |
| ↳ `survey_category='hospital'` | **302 리다이렉트** → `/result-hospital/:id` | 또는 ref_code 파트너가 hospital인 경우 강제 |
| ↳ `survey_category='aesthetic'` | `public/result-aesthetic.html` 서빙 (인라인) | |
| ↳ 그 외 (integrated 등) | `public/result-v4.html` 서빙 | |
| `/result-hospital/:id` | `public/result-hospital.html` | 병원 전용 결과지 (최신 버전) |
| `/result-aesthetic/:id` | `public/result-aesthetic.html` | 에스테틱 전용 결과지 |
| `/result-v3` / `/result-v3.html` | `public/result-v3.html` | 구버전 (직접 접근용, 신규 유입 없음) |
| `/result-v4` / `/result-v4.html` | `public/result-v4.html` | 통합형 결과지 |
| `/result.html` / `/result` | `public/result.html` | 구버전 레거시 |

---

### 1-3. 관리 페이지 라우트

| URL 패턴 | 서빙 HTML | 접근 권한 |
|---|---|---|
| `/admin` / `/admin/*` | `public/admin.html` | MASTER 토큰 필요 (프론트 로그인) |
| `/consultant` / `/consultant/*` | `public/consultant.html` | 컨설턴트 토큰 |
| `/b2b` / `/b2b/*` | `public/b2b.html` | B2B 파트너 토큰 |

---

### 1-4. 주요 API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|---|---|---|
| `/api/survey/submit` | POST | 설문 완료 저장 → `diagnosis_results` 기록 |
| `/api/v1/diagnosis` | POST | 진단 결과 저장 (신버전 파이프라인) |
| `/api/v1/diagnosis/:id` | GET | 진단 결과 단건 조회 |
| `/api/h/result/:id` | GET | 병원 결과지용 데이터 조회 (hospital 전용) |
| `/api/a/result/:id` | GET | 에스테틱 결과지용 데이터 조회 |
| `/api/admin/results` | GET | MASTER: 통합 결과 목록 (results + diagnosis_results UNION) |
| `/api/admin/dashboard` | GET | MASTER: 대시보드 통계 |
| `/api/admin/consultants` | GET/POST | MASTER: 컨설턴트 관리 |
| `/api/admin/b2b-partners` | GET/POST | MASTER: B2B 파트너 관리 |
| `/api/b2b/results` | GET | B2B: 내 파트너 결과 목록 |
| `/api/auth/login` | POST | 로그인 (컨설턴트/관리자) |

---

## 2. DB 테이블 현황 및 컬럼 매핑

### 2-1. 핵심 테이블 구조

#### `diagnosis_results` (신버전 파이프라인 — V4.1+)
현재 운영 중인 주요 테이블. 마이그레이션 0027번 이후 컬럼 추가 이력:

| 컬럼명 | 타입 | 설명 | 추가 마이그레이션 |
|---|---|---|---|
| `id` | TEXT PK | UUID (result_id) | 0027 |
| `user_name` | TEXT | 고객 이름 | 0027 |
| `bc_nickname` | TEXT | BC 닉네임 (한글) | 0027 |
| `bc_primary` | TEXT | BC코드 1순위 (저장 당시 닉네임 또는 BC-N) | 0027 |
| `bc_secondary` | TEXT | BC코드 2순위 | 0027 |
| `bc_code_key` | TEXT | **BC-N 형식 코드** (BC-1~BC-16) | 0032 |
| `top3_axes` | TEXT | JSON: ["A07","A08","A01"] | 0027 |
| `axis_scores` | TEXT | JSON: {"A01":8,...} | 0027 |
| `region` | TEXT | 복부/하체/상체/전신 | 0027 |
| `texture` | TEXT | 단단/물렁/셀룰/부종 | 0027 |
| `bg_filter` | TEXT | birth/meno/drug/PCOS/"" | 0027 |
| `ohaeng_type` | TEXT | 목/화/토/금/수 | 0027 |
| `mbti_full` | TEXT | INFP/ISTJ 등 | 0027 |
| `raw_answers` | TEXT | JSON: 설문 원본 답변 | 0028 |
| `disp_answers` | TEXT | JSON: 표시용 답변 요약 | 0027 |
| `family_group_code` | TEXT | 가족 코드 | 0029 |
| `goal_weight` | INTEGER | 목표 체중 | 0030 |
| `weight_loss_pct` | INTEGER | 감량률 % | 0030 |
| `phone` | TEXT | 전화번호 | 0033 |
| `gender` | TEXT | male/female/other | 0042 |
| `height` | REAL | 키 (cm) | 0042 |
| `age` | INTEGER | 만 나이 | 0042 |
| `survey_category` | TEXT | **hospital / aesthetic / integrated** | 0048 |
| `ref_code` | TEXT | 유입 파트너/컨설턴트 코드 | 0027 |
| `completed_at` | TEXT | 설문 완료 시각 | 0027 |
| `created_at` | TEXT | 행 생성 시각 | 0027 |

> **BC 코드 표출 기준 (V4.9 고정)**:  
> - 결과지는 `bc_code_key` → `bc_primary` 순으로 DB 저장값을 신뢰  
> - `computeBCCode()`는 axis_scores 기반 재계산 → `metrics/causalScores` 계산 전용  
> - DB `bc_code_key`가 `BC-N` 형식이면 재계산 결과를 덮어씌워 화면에 표시

#### `results` (구버전 — V3 이하, 신규 유입 없음)
컬럼: `id`, `user_name`, `bc_primary`(닉네임), `axis_scores_json`, `consultant_code`, `ref_code`, `created_at`

#### `b2b_partners` (파트너 관리)
| 컬럼 | 설명 |
|---|---|
| `code` | 파트너 코드 (예: B2B-BAVA1234, B2B-AES-001) |
| `survey_category` | **hospital / aesthetic / fitness / integrated** — 진입 라우트 결정 |
| `status` | active / suspended |
| `brand_color`, `brand_name`, `brand_logo_url` | 브랜드 커스터마이징 |

---

### 2-2. survey_category 값 기준

| 값 | 질문지 | 결과지 | 진입 라우트 |
|---|---|---|---|
| `hospital` | `survey-hospital.html` | `result-hospital.html` | `/h/:code` |
| `aesthetic` | `survey-aesthetic.html` | `result-aesthetic.html` | `/a/:code` |
| `integrated` | `index.html` (통합) | `result-v4.html` | `/s/:code` |
| `fitness` | `survey-aesthetic.html` (임시) | `result-v4.html` | `/f/:code` |

---

## 3. 현행 라우팅 흐름 (전체)

```
사용자 진입
    │
    ├── /h/:code ──────────────────────────────────────────────────────────
    │   ├── b2b_partners.survey_category = 'hospital' → survey-hospital.html 서빙
    │   └── 그 외 category → 해당 카테고리 경로로 302 리다이렉트
    │
    ├── /a/:code ──────────────────────────────────────────────────────────
    │   └── survey-aesthetic.html 서빙 (category 무관, /a/ 자체가 aesthetic 전용)
    │
    │   [설문 완료 → POST /api/v1/diagnosis → diagnosis_results 저장]
    │   [survey_category, bc_code_key, bc_primary, axis_scores 저장]
    │
    └── /result/:id (결과지 허브) ─────────────────────────────────────────
        ├── diagnosis_results 조회
        │   ├── diagRow.survey_category = 'hospital'
        │   │   OR ref_code 파트너가 hospital → 302 /result-hospital/:id
        │   ├── diagRow.survey_category = 'aesthetic' → result-aesthetic.html 인라인 서빙
        │   └── 그 외 → result-v4.html 서빙
        └── results 구버전 테이블 → result-v4.html (레거시)
```

---

## 4. 관리자 대시보드(/admin) 데이터 연동 현황

### 4-1. 결과 목록 조회 (`/api/admin/results`)

```sql
-- results (구버전) + diagnosis_results (신버전) UNION ALL
SELECT r.id, r.user_name,
       COALESCE(r.bc_primary,'') as bc_primary,
       NULL as bc_code_key, NULL as bc_nickname,
       r.axis_scores_json as axis_scores,
       r.consultant_code, c.name as consultant_name,
       r.ref_code, r.created_at,
       'results_v3' as _source,
       NULL as survey_category
FROM results r LEFT JOIN consultants c ON r.consultant_code=c.code
UNION ALL
SELECT d.id, d.user_name,
       COALESCE(d.bc_primary, d.bc_nickname,'') as bc_primary,
       d.bc_code_key, d.bc_nickname,
       d.axis_scores,
       NULL as consultant_code, NULL as consultant_name,
       d.ref_code, d.created_at,
       'diagnosis_v4' as _source,
       d.survey_category
FROM diagnosis_results d
ORDER BY created_at DESC LIMIT 200
```

- `_source='results_v3'`: 구버전, `survey_category=NULL`
- `_source='diagnosis_v4'`: 신버전, `survey_category` 포함

### 4-2. 관리자 결과 클릭 → 결과지 연동

admin.html 내 결과 행 클릭 시:
- `_source='diagnosis_v4'` + `survey_category='hospital'` → `/result-hospital/:id` 오픈
- `_source='diagnosis_v4'` + `survey_category='aesthetic'` → `/result-aesthetic/:id` 오픈
- `_source='diagnosis_v4'` + 기타 → `/result/:id` 오픈 (허브가 재분기)
- `_source='results_v3'` → `/result/:id` 오픈 (구버전 결과지)

---

## 5. 현행 HTML 파일 역할 요약

| 파일 | 용도 | 현황 |
|---|---|---|
| `survey-hospital.html` | **병원 전용 질문지** | ✅ 운영 중 (최신) |
| `survey-aesthetic.html` | **에스테틱 전용 질문지** | ✅ 운영 중 (최신) |
| `result-hospital.html` | **병원 전용 결과지 V4.9** | ✅ 운영 중 (최신, v1.0-STABLE) |
| `result-aesthetic.html` | **에스테틱 전용 결과지** | ✅ 운영 중 |
| `result-v4.html` | 통합형 결과지 | ✅ 운영 중 |
| `result-v3.html` | 구버전 결과지 | ⚠️ 레거시, 신규 유입 없음 |
| `result.html` | 최구버전 결과지 | ⚠️ 레거시, 신규 유입 없음 |
| `admin.html` | MASTER 관리자 대시보드 | ✅ 운영 중 |
| `consultant.html` | 컨설턴트 대시보드 | ✅ 운영 중 |
| `b2b.html` | B2B 파트너 대시보드 | ✅ 운영 중 |
| `index.html` | 통합 질문지 / 랜딩 | ✅ 운영 중 |
| `slimmind-today.html` | 오늘 체크인 페이지 | ✅ 운영 중 |
| `slimmind_backend_mapping_v1.html` | 내부 문서 | 비공개 |

---

## 6. 핵심 수정 이력 (v1.0-STABLE 기준)

| 커밋 | 내용 |
|---|---|
| `0de04a8` | **V4.9**: BC 코드 DB 고정(bc_code_key/bc_primary 우선), 대사 효율 나이 0세 fallback 안전장치 |
| `322fdb1` | JS 파싱 오류 수정(`Unexpected token ':'`), admin UNION `survey_category` 추가 |
| `195685f` | 진단일 SQLite 공백포맷 NaN 버그 수정 |
| `742e16c` | 100% 무한 멈춤 차단, hospital 라우팅 강제, 자동 결과지 이동 |
| `0ab2c1b` | hospital 결과지 라우팅 완전 수정 (survey_category NULL 대응) |

---

## 7. 절대 변경 금지 사항

1. **BC 코드 표출 기준**: `result-hospital.html` `renderAll()` 내 DB 고정 로직(`_dbBcCode` 블록) 제거 금지
2. **질문지 라우팅 파일**: `/h/:code` → `survey-hospital.html`, `/a/:code` → `survey-aesthetic.html` 고정
3. **결과지 라우팅 분기**: `/result/:id`의 `effectiveCategory` 판별 로직 변경 시 반드시 양방향 테스트
4. **UNION 쿼리 컬럼 수**: `results_v3`와 `diagnosis_v4` SELECT 컬럼 수 항상 일치 유지
5. **마이그레이션 번호**: 0057번 이후부터 순번 부여 (현재 최신: `0057_push_pwa_start_date.sql`)

---

## 8. 배포 환경

| 항목 | 값 |
|---|---|
| 플랫폼 | Cloudflare Workers/Pages (Genspark Hosted) |
| 프레임워크 | Hono + Vite + TypeScript |
| DB | Cloudflare D1 (SQLite) — `webapp-production` |
| 도메인 | `https://slimmind.kr` |
| 빌드 | `npm run build` → `dist/_worker.js` (~280KB) |
| 배포 | `gsk hosted deploy` (승인 후 자동 적용) |
| Git 태그 | `v1.0-STABLE` = commit `0de04a8` (2026-08-01) |

---

## 9. 캐시 방지 정책 (Cache-Busting)

### 서버 응답 헤더
모든 HTML 서빙 라우트는 `htmlResponse()` 헬퍼를 통해 아래 헤더를 포함한다:
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

`fetchAsset()` 헬퍼도 내부적으로 동일 헤더를 Cloudflare ASSETS에 전달한다.

### 클라이언트 사이드 캐시 버스팅
- `/static/pwa-common.js?v=20260801` — HTML 4개(`survey-hospital`, `survey-aesthetic`, `result-hospital`, `result-aesthetic`) 전수 적용
- SW 캐시명을 `slimmind-v1` → `slimmind-v2`로 갱신하여 구버전 캐시 자동 삭제
- Activate 시 이전 캐시 키(`slimmind-v1`) 삭제

### HTML 동적 라우트 Network-First
서비스 워커 fetch 핸들러에서 아래 경로는 항상 **Network First** 전략:
`/api/*`, `/result-hospital/*`, `/result-aesthetic/*`, `/result/*`, `/h/*`, `/a/*`, `/`

---

## 10. PWA 세션 자동 복원 규칙

### 저장 규칙
| localStorage 키 | 저장 시점 | 값 |
|---|---|---|
| `sm_last_result_id` | 설문 완료(대기화면 진입) + 결과지 진입 | 결과 UUID |
| `sm_survey_category` | 설문 완료 + 결과지 진입 | `'hospital'` 또는 `'aesthetic'` |
| `sm_pwa_start_date` | 웹푸시 최초 구독 시 | ISO 8601 타임스탬프 |

### 복원 로직 (`pwa-common.js` [A] 블록)
1. `(display-mode: standalone)` 또는 `navigator.standalone === true` 감지
2. `sm_last_result_id` 없으면 종료
3. 현재 경로가 이미 `/result-hospital/`, `/result-aesthetic/`, `/result/`이면 종료
4. `sm_survey_category === 'aesthetic'` → `/result-aesthetic/:id`로 `location.replace()`
5. 그 외 → `/result-hospital/:id`로 `location.replace()`

---

## 11. UA/PC 분기 PWA 설치 안내 모달 구조

**파일**: `/public/static/pwa-common.js` ([B] 블록)  
**발동 조건**: `isStandalone === false` && DOMContentLoaded 후 3초

| Case | 감지 조건 | 모달 형태 | 안내 내용 |
|---|---|---|---|
| 1 | iOS + `KAKAOTALK` UA | 바텀시트 | ① ··· → ② 공유 → ③ 더 보기 → ④ 홈 화면에 추가 |
| 2 | iOS + Safari (비Chrome/CriOS) | 바텀시트 | ① 하단 공유 ⬆ → ② 홈 화면에 추가 → ③ 추가 |
| 3 | Android + `KAKAOTALK` UA | 상단 노란 툴팁 | ··· → 다른 브라우저(Chrome)로 열기 → 홈 화면 추가 |
| 4 | Android + `beforeinstallprompt` | 하단 배너 | 원클릭 [설치] 버튼 (`deferredPrompt.prompt()`) |
| 5 | PC (비iOS/Android) | 중앙 모달 | `beforeinstallprompt` 있으면 원클릭 / 없으면 ··· 수동 안내 |

---

## 12. KST D+28 푸시 스케줄러 명세

### 아키텍처
- **클라이언트**: `pwa-common.js` [D] 블록 — 웹푸시 구독 시 `sm_pwa_start_date`(ISO 8601) 저장 및 서버 전송
- **서버**: `push_subscriptions.pwa_start_date` 컬럼 저장 (마이그레이션 `0057`)
- **배치**: Cloudflare Cron Trigger (`handleCron`) — UTC 기준 3개 cron 등록

### Cron 스케줄 (KST 기준)
| 발송 시각 (KST) | UTC cron 표현식 | `msgKey` |
|---|---|---|
| 09:00 (아침) | `0 0 * * *` | `morning` |
| 12:00 (점심) | `0 3 * * *` | `lunch` |
| 18:00 (저녁) | `0 9 * * *` | `evening` |

### D+28 자동 종료 조건
```sql
WHERE pwa_start_date IS NULL                           -- 기존 구독 (발송 허용)
   OR (julianday('now') - julianday(pwa_start_date)) <= 28  -- 28일 이내
```
- `pwa_start_date`가 NULL인 구독(기존 데이터)은 발송 허용
- `pwa_start_date + 28일` 경과 구독은 자동 제외 (구독 삭제 아님)

### 알림 클릭 동작
서비스 워커 `notificationclick` 이벤트:
1. 이미 열린 `/slimmind-today.html` 탭 있으면 포커스
2. 없으면 `clients.openWindow('/slimmind-today.html')` 신규 탭 열기
