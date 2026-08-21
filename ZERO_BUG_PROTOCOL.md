# SlimMind Zero-Bug 전수 검증 프로토콜 v1.0

> **제정일**: 2026-08-21  
> **적용 범위**: 모든 코드 수정, 신규 모듈 추가, 유지보수 작업  
> **원칙**: 단 한 줄의 코드를 수정하더라도 아래 4단계를 **스스로** 전수 수행한 뒤 결과 리포트를 첨부해야만 완료로 선언한다.

---

## 📋 의무 수행 조건

다음 중 **하나라도 해당**되면 4단계 전수 검증 의무 실행:

- 신규 API 엔드포인트 추가
- 기존 라우트 핸들러 수정
- DB 스키마 변경 (테이블/컬럼 추가·수정·삭제)
- 설문 트랙 신규 추가 (병원/에스테틱/미용/피트니스 외 확장)
- 파라미터 파싱 로직 수정
- HTML 결과지 렌더링 로직 수정
- BC 코드·축코드·닉네임 매핑 로직 수정

---

## 🔬 4단계 전수 검증 프로토콜

### STEP 1: 파라미터 폴백 및 데이터 키 교차 검증

**목적**: 클라이언트-서버 간 키 네이밍 불일치, 폴백 누락 버그 탐지

검증 항목:
- `bc_code` / `bc_code_key` / `bc_primary` 3종 키 교차 수신 및 DB 저장 확인
- `survey_category` 명시/누락 양방향 테스트 (기본값 `integrated` 자동 적용 확인)
- 닉네임 → BC 코드 역매핑 정상 동작 확인
- 4트랙 전체 (병원/에스테틱/미용/피트니스) 각 POST API 실행

```bash
# 검증 스크립트 위치
/tmp/zero_bug_v2.sh
```

**합격 기준**: 4트랙 × 전 항목 DB 저장값 직접 조회 확인

---

### STEP 2: DB Insert → API Read → DOM Render E2E 완결성

**목적**: 데이터 저장부터 결과지 렌더링까지 전체 파이프라인 완결 확인

검증 항목 (4트랙 각각):

| 트랙 | POST 엔드포인트 | DB 테이블 | ID 형식 | API Read | HTML 렌더 경로 |
|------|----------------|-----------|---------|----------|----------------|
| 병원 | `POST /api/h/diagnosis` | `hospital_responses` | `H-{ts}-{rnd}` | `GET /api/h/result/:id` | `GET /result-hospital/:id` |
| 에스테틱 | `POST /api/v1/diagnosis` (category=aesthetic) | `diagnosis_results` | UUID | `GET /api/a/result/:id` | `GET /result/:id` → 200 |
| 미용/살롱 | `POST /api/v1/diagnosis` (category=salon) | `diagnosis_results` | UUID | — | `GET /result/:id` → 200 |
| 피트니스 | `POST /api/f/diagnosis` | `fitness_responses` | `F-{ts}-{rnd}` | `GET /api/f/result/:id` | `GET /result-fitness/:id` |

**합격 기준**: POST → DB 저장 확인 → API JSON 응답 → HTML HTTP 200 (DOCTYPE 확인)

---

### STEP 3: 라우트 302/301/404 Fallback 전수 테스트

**목적**: 라우터 테이블 조회 우선순위 및 오류 경로 완전성 확인

필수 검증 경로:

| 경로 | 기대값 | 비고 |
|------|--------|------|
| `GET /result/{H-ID}` | HTTP 302 → `/result-hospital/:id` | 병원 ID 302 리다이렉트 |
| `GET /result/{aesthetic-UUID}` | HTTP 200 | result-aesthetic.html 직접 서빙 |
| `GET /result/{salon-UUID}` | HTTP 200 | result-v4.html 직접 서빙 |
| `GET /result-fitness/{F-ID}` | HTTP 200 | result-fitness.html |
| `GET /result-hospital/{H-ID}` | HTTP 200 | result-hospital.html |
| `GET /result/FAKE-ID` | HTTP 404 | 전 테이블 미존재 확인 |
| `GET /result-hospital/FAKE` | HTTP 404 | **DB 유효성 검사 필수** |
| `GET /result-fitness/FAKE` | HTTP 404 | **DB 유효성 검사 필수** |
| `GET /result/{구버전-RES-ID}` | HTTP 200 | results 테이블 1순위 조회 |

**합격 기준**: 전 경로 기대 HTTP 코드 일치

---

### STEP 4: 네거티브 테스트

**목적**: 누락 필드, 잘못된 ID, 구버전 데이터에 대한 에러 핸들링 완전성 확인

필수 검증 항목:

| 케이스 | 입력 | 기대 응답 |
|--------|------|-----------|
| `user_name` 누락 (`/api/v1/diagnosis`) | `{}` | HTTP 400 |
| `user_name` 누락 (`/api/h/diagnosis`) | `{}` | HTTP 400 |
| 빈 body | `{}` | HTTP 400/500 |
| 존재하지 않는 엔드포인트 | `GET /api/nonexistent` | HTTP 404/405 |
| 없는 H-ID | `GET /api/h/result/H-INVALID` | HTTP 404/에러 JSON |
| 없는 F-ID | `GET /api/f/result/F-INVALID` | HTTP 404/에러 JSON |
| 없는 UUID | `GET /api/a/result/00000000-...` | HTTP 404/에러 JSON |
| 없는 H-ID (HTML) | `GET /result-hospital/H-FAKE` | HTTP 404 |
| 없는 F-ID (HTML) | `GET /result-fitness/F-FAKE` | HTTP 404 |

**합격 기준**: 모든 케이스 에러 핸들링 정상 (서버 무응답/500 Crash 금지)

---

## 📊 결과 리포트 형식 (제출 필수)

```
## Zero-Bug 전수 검증 결과 리포트

### 수정 내용
- [변경된 파일/기능 설명]

### 신규 발견 버그
| # | 버그 | 원인 | 수정 |
|---|------|------|------|
| 1 | ... | ... | ... |

### 검증 결과표
| 단계 | 항목 수 | 통과 | 실패 |
|------|---------|------|------|
| Step 1 파라미터 폴백 | N | N | 0 |
| Step 2 E2E | N | N | 0 |
| Step 3 라우트 404/302 | N | N | 0 |
| Step 4 네거티브 | N | N | 0 |
| **합계** | **N** | **N** | **0** |

### 프로덕션 검증
- [ ] gsk hosted deploy 완료
- [ ] 프로덕션 URL 핵심 경로 확인

### 판정
✅ Zero-Bug 달성 / ❌ 미달성 (실패 항목: ...)
```

---

## ⚡ 4트랙 아키텍처 레퍼런스 (수정 시 필수 참조)

```
병원(hospital)
  POST /api/h/diagnosis → hospital_responses (H-{ts} ID) → /result/:id → 302 /result-hospital/:id

에스테틱(aesthetic)
  POST /api/v1/diagnosis (survey_category=aesthetic) → diagnosis_results (UUID) → /result/:id → 200

미용(salon)
  POST /api/v1/diagnosis (survey_category=salon) → diagnosis_results (UUID) → /result/:id → 200

피트니스(fitness)
  POST /api/f/diagnosis → fitness_responses (F-{ts} ID) → /result-fitness/:id → 200
```

### BC 코드 키 네이밍 규칙

| 레이어 | 키 이름 | 비고 |
|--------|---------|------|
| 클라이언트 송신 | `bc_code_key` | survey-*.html 공통 |
| 서버 수신 (`/api/h/`) | `bc_code \|\| bc_code_key` | 이중 폴백 필수 |
| 서버 수신 (`/api/f/`) | `bc_code \|\| bc_code_key` | 이중 폴백 필수 |
| 서버 수신 (`/api/v1/`) | `bc_code_key \|\| NICKNAME_TO_BC[bc_primary]` | 역매핑 포함 |
| DB 저장 컬럼 | `bc_code` (hospital/fitness), `bc_code_key` (diagnosis_results) | 테이블별 상이 |

### `/result/:id` 라우터 조회 우선순위

```
1순위: results 테이블 (구버전 RES-* ID)
2순위: diagnosis_results 테이블 (UUID → aesthetic/salon/integrated)
  ├─ survey_category=aesthetic → result-aesthetic.html
  ├─ survey_category=salon → result-v4.html
  └─ 기타 → result-v4.html
3순위: hospital_responses 테이블 (H-* ID) → 302 /result-hospital/:id
4순위: fitness_responses 테이블 (F-* ID) → 302 /result-fitness/:id
없음 → 404
```

---

## 🔒 신규 HTML 결과지 라우트 추가 시 체크리스트

새 결과지 라우트(`/result-xxx/:id`)를 추가할 때 반드시 적용:

- [ ] **DB 유효성 검사** 추가 — 없는 ID → `c.html(..., 404)` 반환 (200 금지)
- [ ] `/result/:id` 라우터에 신규 테이블 fallback 추가
- [ ] Step 3 검증에 `GET /result-xxx/FAKE → 404` 항목 추가
- [ ] Step 4 검증에 없는 ID → 404 케이스 추가

---

*이 프로토콜은 2026-08-21 Zero-Bug 전수 검증 세션에서 확립되었습니다.*  
*commit: `0bb9634` — SlimMind B2B v4.2*
