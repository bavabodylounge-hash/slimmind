# SlimMind 전체 URL 맵
> 도메인: **https://slimmind.kr**  
> 최종 업데이트: 2026-07-10  
> Worker Version ID: `72c9617d-4429-41af-bf8c-9cf5bb6b640e`

---

## 🌐 페이지 (브라우저 접속 URL)

### 일반 사용자
| URL | 설명 |
|-----|------|
| `https://slimmind.kr/` | 홈페이지 (질문지 랜딩) |
| `https://slimmind.kr/slimmind` | 질문지 메인 (= slimmind_live) |
| `https://slimmind.kr/slimmind_live` | 질문지 메인 |
| `https://slimmind.kr/slimmind_live.html` | 질문지 메인 (html 확장자) |
| `https://slimmind.kr/result/:id` | 개인 결과지 (고객 공유 링크) |
| `https://slimmind.kr/result` | 결과지 뷰어 (구버전) |
| `https://slimmind.kr/result.html` | 결과지 (html 확장자) |
| `https://slimmind.kr/result-v3` | 결과지 v3 |
| `https://slimmind.kr/result-v3.html` | 결과지 v3 (html 확장자) |
| `https://slimmind.kr/result-v4` | 결과지 v4 (최신) |
| `https://slimmind.kr/result-v4.html` | 결과지 v4 (html 확장자) |
| `https://slimmind.kr/s/:code` | 숏링크 결과지 공유 |
| `https://slimmind.kr/bodymap-preview` | 바디맵 미리보기 |

### 관리자 (MASTER 권한)
| URL | 설명 |
|-----|------|
| `https://slimmind.kr/admin` | 관리자 대시보드 |
| `https://slimmind.kr/admin.html` | 관리자 (html 확장자) |
| `https://slimmind.kr/admin/*` | 관리자 하위 경로 전체 |

### 컨설턴트
| URL | 설명 |
|-----|------|
| `https://slimmind.kr/consultant` | 컨설턴트 포털 |
| `https://slimmind.kr/consultant.html` | 컨설턴트 (html 확장자) |
| `https://slimmind.kr/consultant/*` | 컨설턴트 하위 경로 전체 |

### B2B 파트너
| URL | 설명 |
|-----|------|
| `https://slimmind.kr/b2b` | B2B 파트너 포털 |
| `https://slimmind.kr/b2b.html` | B2B (html 확장자) |
| `https://slimmind.kr/b2b/*` | B2B 하위 경로 전체 |

### 정적 파일 / 기타
| URL | 설명 |
|-----|------|
| `https://slimmind.kr/static/og-slimmind.png` | OG 대표 이미지 |
| `https://slimmind.kr/static/` | 정적 파일 디렉터리 |
| `https://slimmind.kr/survey-data.js` | 질문지 데이터 JS |
| `https://slimmind.kr/bc-engine.js` | BC 엔진 JS |
| `https://slimmind.kr/bc-definitions.js` | BC 정의 JS |
| `https://slimmind.kr/favicon.ico` | 파비콘 |
| `https://slimmind.kr/og/survey` | 질문지 OG 이미지 (SVG) |
| `https://slimmind.kr/og/survey-svg` | 질문지 OG SVG 직접 |
| `https://slimmind.kr/og/result` | 결과지 OG 이미지 (SVG) |

---

## 🔌 API 엔드포인트

### 인증 (Auth)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| POST | `/api/auth/login` | 없음 | 로그인 (컨설턴트/관리자/B2B) |
| GET | `/api/auth/me` | JWT | 내 계정 정보 |
| GET | `/api/admin/impersonate/:code` | MASTER | 컨설턴트 계정 대리 접속 |

### 질문지 / 설문 (Survey)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| POST | `/api/survey/draft` | 없음 | 임시저장 |
| GET | `/api/survey/draft` | 없음 | 임시저장 불러오기 |
| DELETE | `/api/survey/draft` | 없음 | 임시저장 삭제 |
| POST | `/api/survey/submit` | 없음 | 설문 최종 제출 → 결과 생성 |
| GET | `/api/survey/result/public/:id` | 없음 | 결과지 공개 조회 |
| POST | `/api/survey/notify` | 없음 | 결과 알림 발송 |

### 결과지 (Results)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/results/:id` | 없음 | 결과 상세 조회 |
| PUT | `/api/results/:id/memo` | 없음 | 메모 저장 |
| PUT | `/api/results/:id/b2b` | 없음 | B2B 연결 |

### 관리자 - 대시보드 (Admin)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/admin/dashboard` | MASTER | 대시보드 통계 |
| GET | `/api/admin/results` | MASTER | 전체 결과 목록 |
| GET | `/api/admin/bc-codes` | MASTER | BC 코드 목록 |
| PUT | `/api/admin/bc-codes/:code` | MASTER | BC 코드 수정 |
| GET | `/api/admin/settlement` | MASTER | 정산 현황 |
| GET | `/api/admin/monthly-report` | MASTER | 월간 리포트 |
| GET | `/api/admin/ranking` | MASTER | 랭킹 |
| GET | `/api/admin/revenue-forecast` | MASTER | 매출 예측 |
| GET | `/api/admin/diagnosis-results` | MASTER | 진단 결과 목록 |

### 관리자 - 컨설턴트 관리
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/admin/consultants` | MASTER | 컨설턴트 목록 |
| POST | `/api/admin/consultants` | MASTER | 컨설턴트 생성 |
| PUT | `/api/admin/consultants/:code` | MASTER | 컨설턴트 수정 |
| DELETE | `/api/admin/consultants/:code` | MASTER | 컨설턴트 비활성화 |
| DELETE | `/api/admin/consultants/:code/hard` | MASTER | 컨설턴트 완전 삭제 |

### 관리자 - B2B 파트너 관리
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/admin/b2b-partners` | MASTER | B2B 파트너 목록 |
| POST | `/api/admin/b2b-partners` | MASTER | B2B 파트너 생성 |
| PUT | `/api/admin/b2b-partners/:code` | MASTER | B2B 파트너 수정 |
| DELETE | `/api/admin/b2b-partners/:code` | MASTER | B2B 파트너 삭제 |

### 관리자 - 알림 / 쿠폰 / 데일리체크
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/admin/notifications` | MASTER | 알림 목록 |
| POST | `/api/admin/notifications/read-all` | MASTER | 알림 전체 읽음 |
| GET | `/api/admin/coupons` | MASTER | 쿠폰 목록 |
| POST | `/api/admin/coupons/use` | MASTER | 쿠폰 사용 처리 |
| GET | `/api/admin/daily-checks` | MASTER | 데일리체크 전체 목록 |
| GET | `/api/admin/daily-checks/:session_id` | MASTER | 데일리체크 상세 |
| POST | `/api/admin/daily-check/remind` | MASTER | 데일리체크 리마인드 발송 |
| GET | `/api/admin/check-alerts` | MASTER | 체크 알림 목록 |

### 관리자 - 분석 (Analytics)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/admin/analytics/bc-trend` | MASTER | BC 트렌드 분석 |
| GET | `/api/admin/analytics/customer-segments` | MASTER | 고객 세그먼트 분석 |
| GET | `/api/admin/churn/risk-list` | MASTER | 이탈 위험 고객 목록 |

### 컨설턴트 (Consultant)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/consultant/me` | ANY | 내 컨설턴트 정보 |
| GET | `/api/consultant/results` | ANY | 담당 고객 결과 목록 |
| GET | `/api/consultant/stats` | ANY | 담당 고객 통계 |
| PUT | `/api/consultant/change-password` | ANY | 비밀번호 변경 |
| POST | `/api/consultant/ai-message` | ANY | AI 메시지 생성 |
| GET | `/api/consultant/my-customers` | ANY | 내 고객 목록 |
| POST | `/api/consultant/weight-checkin` | ANY | 체중 체크인 등록 |
| GET | `/api/consultant/checkin-history/:result_id` | ANY | 체크인 이력 |
| GET | `/api/consultant/daily-checks` | ANY | 데일리체크 목록 |
| POST | `/api/coaching-comment` | ANY | 코칭 코멘트 등록 |
| DELETE | `/api/coaching-comment/:id` | ANY | 코칭 코멘트 삭제 |
| GET | `/api/check-alerts` | ANY | 내 체크 알림 |
| POST | `/api/check-alerts/read` | ANY | 체크 알림 읽음 |

### 컨설턴트 - 분석
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/consultant/analytics/conversion` | ANY | 전환율 분석 |
| GET | `/api/consultant/analytics/axis-benchmark` | ANY | 축 벤치마크 분석 |

### B2B 파트너
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/b2b/brand/:code` | 없음 | 브랜드 정보 공개 조회 |
| GET | `/api/b2b/me` | B2B | 내 B2B 정보 |
| GET | `/api/b2b/results` | B2B | 소속 고객 결과 목록 |
| GET | `/api/b2b/stats` | B2B | 소속 고객 통계 |
| GET | `/api/b2b/partner-view/:bc_code` | B2B | BC 코드별 파트너 뷰 |
| GET | `/api/b2b/customer-lookup` | B2B | 고객 조회 |
| GET | `/api/b2b/bc-list` | B2B | BC 목록 |
| GET | `/api/b2b/result-link/:id` | B2B | 결과 공유 링크 생성 |
| GET | `/api/b2b/my-programs/:bc_code` | B2B | 내 프로그램 조회 |
| GET | `/api/b2b/recommend/:resultId` | B2B | 추천 프로그램 |
| GET | `/api/b2b/subaccounts` | B2B | 서브 계정 목록 |
| POST | `/api/b2b/subaccounts` | B2B | 서브 계정 생성 |
| DELETE | `/api/b2b/subaccounts/:code` | B2B | 서브 계정 삭제 |
| GET | `/api/b2b/daily-checks` | ANY | B2B 데일리체크 목록 |

### 데일리체크 (Daily Check)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| POST | `/api/daily-check` | 없음 | 데일리체크 제출 |
| GET | `/api/daily-check/:session_id` | 없음 | 데일리체크 조회 |
| GET | `/api/coaching-comment/:session_id` | 없음 | 코칭 코멘트 조회 |

### 알림 (Notifications)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/notifications` | 없음 | 알림 목록 |
| POST | `/api/notifications/read` | 없음 | 알림 읽음 처리 |
| POST | `/api/notifications/read-all` | 없음 | 알림 전체 읽음 |

### 쿠폰 (Coupon)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| POST | `/api/coupon/issue` | 없음 | 쿠폰 발급 |

### 체크인 / 카카오 알림
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| POST | `/api/checkin` | 없음 | 체크인 등록 |
| GET | `/api/settings/kakao` | ANY | 카카오 설정 조회 |
| PUT | `/api/settings/kakao` | MASTER | 카카오 설정 변경 |
| POST | `/api/kakao/send` | ANY | 카카오 메시지 발송 |

### 공개 통계 / BC 데이터 (Public Stats)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| GET | `/api/bc/list` | 없음 | BC 코드 공개 목록 |
| GET | `/api/v1/stats/axis-rank` | 없음 | 축 랭킹 통계 |
| GET | `/api/v1/stats/body-type` | 없음 | 체형 유형 통계 |

### 진단 API v1 (외부 연동용)
| Method | URL | 권한 | 설명 |
|--------|-----|------|------|
| POST | `/api/v1/diagnosis` | 없음 | 진단 결과 생성 |
| GET | `/api/v1/diagnosis/:id` | 없음 | 진단 결과 조회 |
| POST | `/api/v1/family-code/join` | 없음 | 패밀리 코드 합류 |
| GET | `/api/v1/family-code/:code` | 없음 | 패밀리 코드 조회 |

---

## 🔑 권한 레벨

| 권한 | 설명 |
|------|------|
| `없음` | 누구나 접근 가능 (인증 불필요) |
| `JWT` | 로그인 토큰 필요 |
| `ANY` | 컨설턴트 또는 MASTER |
| `MASTER` | 최고 관리자만 |
| `B2B` | B2B 파트너 계정만 |

---

## 📊 주요 수치

- **총 라우트 수:** 117개
- **페이지 URL:** 27개
- **API 엔드포인트:** 90개
- **공개(인증 불필요) API:** 약 25개
- **MASTER 전용 API:** 약 35개
- **컨설턴트(ANY) API:** 약 20개
- **B2B 전용 API:** 약 15개

---

## 🗄️ 인프라

| 항목 | 값 |
|------|----|
| 플랫폼 | Cloudflare Workers for Platform |
| DB | Cloudflare D1 (`7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db`) |
| 커스텀 도메인 | `slimmind.kr` |
| Gensparksite URL | `https://slimmind.kr` (동일 Worker, 병행 접속 가능) |
| Worker 이름 | `7ed6c475-8afa-4ef8-9af8-8fab0cf8224b` |
| 빌드 파일 | `dist/_worker.js` (3,913 kB) |
