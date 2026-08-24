# SlimMind — AI 바디코드 진단 플랫폼

> 체형·체질 기반 16가지 바디코드 진단 → 맞춤 처방 리포트 → B2B 화이트라벨 솔루션

---

## 🌐 라이브 URL

| 페이지 | URL |
|--------|-----|
| **메인 랜딩** | https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/landing/ |
| **B2B 파트너** | https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/landing/b2b.html |
| **컨설턴트** | https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/landing/consultant.html |
| **진단 시작** | https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/ |
| **관리자** | https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/admin |
| **GitHub** | https://github.com/bavabodylounge-hash/slimmind |

---

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| **프레임워크** | Hono v4 (TypeScript) |
| **런타임** | Cloudflare Workers for Platform |
| **빌드** | Vite 6 + @hono/vite-cloudflare-pages |
| **DB** | Cloudflare D1 (SQLite) |
| **인증** | JWT (HS256) — requireRole('MASTER'/'CONSULTANT'/'ANY'/'B2B_PARTNER') |
| **프론트엔드** | Vanilla JS + Tailwind CDN + AOS + CountUp.js |
| **배포** | Genspark Hosted Deploy → Cloudflare |
| **버전관리** | GitHub (bavabodylounge-hash/slimmind) |

---

## 🔒 보안 아키텍처 (2026-08-24 기준)

### 역할별 접근 권한
| 역할 | 코드 | 열람 가능 |
|------|------|-----------|
| `MASTER` | 관리자 | 모든 데이터 + 해석본 |
| `CONSULTANT` | 컨설턴트 | 자신 담당 고객 + 해석본 |
| `B2B_PARTNER` | B2B 파트너 | 자신 파트너 고객 + 해석본 |
| 비인증(고객) | — | 결과지 기본 정보만 (story/소견 차단) |

### 해석본(story_lead) 차단 레이어
1. **서버사이드 (1차)**: 모든 result 라우트 (`/result-fitness/:id`, `/result-hospital/:id`, `/result-aesthetic/:id`, `/result-salon/:id`, `/result/:id`) — `getAuthUser()` 확인 후 인증자에게만 `story_lead`, `clinical_ctx` 주입
2. **클라이언트 (2차)**: `window.__IS_AUTHORIZED__ !== true` 시 모든 result HTML 파일의 `p1-story`, `p1-fail-desc` 요소를 강제 비움
3. **API 레이어 (3차)**: `/api/ai/story/:result_id`, `/api/ai/generate-story` → `requireRole('ANY')` 인증 필수

### 보안 헤더 (전역 미들웨어)
```
X-Frame-Options: SAMEORIGIN           (Clickjacking 방지)
X-Content-Type-Options: nosniff       (MIME sniffing 방지)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: no-store               (API 응답 캐시 금지)
```

---

## 🎯 핵심 기능

### 설문 플로우 (완료 후 결과지 자동이동 없음)
1. **설문 완료** → `waitScreen("담당 컨설턴트가 연락드립니다")` 표시 후 100% 종결
2. survey-fitness.html, survey-hospital.html, survey-hospital-3lang.html 모두 `window.location.replace('/result/'+resultId)` 제거 완료

### 4개 업종 진단 파이프라인
| 업종 | 설문 파일 | API | 저장 테이블 | diagnosis_results 동기화 |
|------|-----------|-----|------------|--------------------------|
| 피트니스 | survey-fitness.html | POST /api/f/diagnosis | fitness_responses | ✅ |
| 병원 | survey-hospital.html | POST /api/h/diagnosis | hospital_responses | ✅ (2026-08-24 추가) |
| 에스테틱 | survey-aesthetic.html | POST /api/a/diagnosis | aesthetic_responses | ✅ |
| 살롱 | survey-salon.html | POST /api/s/diagnosis | salon_responses | ✅ |

### B2B 대시보드 (`/api/b2b/results`)
- `requireB2B()` 인증 필수
- `survey_category='hospital'` 파트너 → `hospital_responses` + `diagnosis_results` + `results` UNION
- 비병원 파트너 → `diagnosis_results`(1순위) + `fitness/salon/aesthetic_responses`(중복 제거) UNION
- 날짜 필터, 검색, 페이지네이션 지원

---

## 📁 핵심 파일

```
src/index.tsx                    # 메인 백엔드 (~13,200줄, API ~200개)
public/
  result-fitness.html            # 피트니스 결과지 (__IS_AUTHORIZED__ 보안 패치)
  result-hospital.html           # 병원 결과지 (__IS_AUTHORIZED__ 보안 패치)
  result-aesthetic.html          # 에스테틱 결과지 (__IS_AUTHORIZED__ 보안 패치)
  result-salon.html              # 살롱 결과지 (__IS_AUTHORIZED__ 보안 패치)
  result-v4.html                 # v4 결과지 (__IS_AUTHORIZED__ 보안 패치)
  survey-fitness.html            # 피트니스 설문 (자동이동 제거)
  survey-hospital.html           # 병원 설문 (자동이동 제거)
  survey-hospital-3lang.html     # 다국어 병원 설문 (자동이동 제거)
  bc-engine.js                   # BC 코드 엔진 (NICKNAME_TO_BC 51개)
  admin.html                     # 관리자 대시보드 (매핑 검증 탭 포함)
migrations/
  0001~0065_*.sql                # DB 스키마 마이그레이션
```

---

## 🚀 개발 & 배포

### 로컬 개발 (샌드박스)
```bash
npm run build                     # Vite 빌드
pm2 start ecosystem.config.cjs   # PM2로 서버 시작
# → http://localhost:3000
```

### 배포 (Cloudflare) — 사용자 승인 필요
```bash
git add . && git commit -m "메시지"
npm run build
gsk hosted deploy                 # → Genspark 화면에서 승인 버튼 클릭 필요
```

### DB 마이그레이션
```bash
npx wrangler d1 migrations apply 7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db --local  # 로컬
npx wrangler d1 migrations apply 7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db          # 프로덕션
```

---

## 📋 세션별 변경 이력

### 2026-08-24 (Part 2 — 보안 완전 강화)
- ✅ survey-fitness/hospital/hospital-3lang.html 결과지 자동이동 3곳 완전 제거
- ✅ POST /api/ai/generate-story, GET /api/ai/story/:id → `requireRole('ANY')` 인증 추가
- ✅ 5개 result 라우트 서버사이드 story 주입 보안 패치 + `window.__IS_AUTHORIZED__` 플래그
- ✅ result-fitness/hospital/aesthetic/salon/v4.html 클라이언트 story 차단 패치
- ✅ [능동] `/api/consultant/clients` → `requireRole('ANY')` + 권한 범위 제한 (자신 고객만)
- ✅ [능동] hospital `/api/h/diagnosis` → `diagnosis_results` 동기화 코드 추가
- ✅ [능동] 전역 보안 헤더 미들웨어 추가 (X-Frame-Options, X-Content-Type-Options 등)
- ✅ GitHub push + gsk hosted deploy

### 2026-08-13 (Part 1 — 매핑 정비)
- result-fitness.html 하드코딩 20개 제거
- migration 0065 override 컬럼 생성
- GET /api/admin/mapping-verify, POST /api/admin/mapping-override 구현
- bc-engine.js NICKNAME_TO_BC 51개 정본 교체

---

## 📊 현재 운영 현황 (2026.08 기준)

- 파트너 센터: **42개** 운영 중
- 재계약률: **91%**
- 누적 진단: **8,400건**
- 파트너 만족도: **4.9/5.0점**

---

*Last updated: 2026-08-24*
