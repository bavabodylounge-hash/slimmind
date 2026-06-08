# SlimMind — 바디코드 체형 진단 서비스

## 프로젝트 개요
- **서비스명**: SlimMind (슬림마인드)
- **목적**: BC코드 기반 체형 진단 + 컨설턴트 관리 플랫폼
- **흐름**: 고객 → 컨설턴트 고유링크 설문 접속 → 제출 (결과 미표시) → 컨설턴트/관리자 페이지에서 결과 확인 + 카카오톡 공유 + 프린트

---

## 주요 URL

| 경로 | 설명 | 접근 권한 |
|------|------|-----------|
| `/?ref=SC-XXXX` | 고객용 50문항 설문 (결과 미표시) | 공개 |
| `/admin` | 총괄 관리자 페이지 | MASTER |
| `/consultant` | 컨설턴트 전용 포털 | CONSULTANT |
| `/result/:id` | 결과지 열람 | MASTER / 담당 CONSULTANT |

---

## 계정 정보 (개발/테스트)

| 코드 | 비밀번호 | 역할 | 이름 |
|------|----------|------|------|
| `MASTER` | `admin1234` | 총괄 관리자 | 최고마스터 |
| `SC-0001` | `pass0001` | 컨설턴트 | 김지수 |
| `SC-0002` | `pass0002` | 컨설턴트 | 박민준 |

---

## 샘플 데이터

| 결과 ID | 고객 | BC코드 | 컨설턴트 |
|---------|------|--------|----------|
| `RES-20260608-A1B2C3` | 김지연 | BC-05 하체지방형 | SC-0001 |
| `RES-20260605-X9Y8Z7` | 이하은 | BC-09 코르티솔형 | SC-0001 |

---

## API 엔드포인트

### 인증
- `POST /api/auth/login` — { code, password } → { token, role, name }
- `GET /api/auth/me` — 내 정보 확인

### 설문
- `POST /api/survey/submit` — 50문항 설문 제출 (D1 저장)

### 관리자 (MASTER 전용)
- `GET /api/admin/dashboard` — KPI + BC분포 + 최근결과
- `GET /api/admin/consultants` — 컨설턴트 목록 (search, status 필터)
- `POST /api/admin/consultants` — 컨설턴트 등록
- `PUT /api/admin/consultants/:code` — 컨설턴트 수정
- `DELETE /api/admin/consultants/:code` — 컨설턴트 정지
- `GET /api/admin/results` — 전체 결과 목록 (bc, consultant, search 필터)
- `GET /api/admin/bc-codes` — BC 처방 목록
- `PUT /api/admin/bc-codes/:code` — BC 처방 수정 + 버전 스냅샷

### 컨설턴트
- `GET /api/consultant/me` — 내 정보
- `GET /api/consultant/results` — 내 고객 결과 목록
- `GET /api/results/:id` — 결과지 상세 (BC 처방 포함)
- `PUT /api/results/:id/memo` — 컨설턴트 메모 저장

---

## 기능 구현 현황

### ✅ 완료
- [x] 50문항 설문 전체 UI (8섹션, 7가지 응답유형)
- [x] BC코드 점수 계산 알고리즘 (BC-01~10)
- [x] 설문 완료 → 결과 미표시 (안내 화면)
- [x] ?ref=SC-XXXX URL 파싱 → 컨설턴트 코드 연결
- [x] 설문 제출 API → D1 저장
- [x] JWT 인증 (MASTER/CONSULTANT, Web Crypto API, 한글 안전)
- [x] **관리자 페이지 /admin**
  - 로그인 (MASTER 전용)
  - 대시보드 (KPI 3종, BC분포 바차트, 최근결과)
  - 컨설턴트 관리 (목록/등록/수정/정지/활성화/초대링크복사)
  - 고객 결과 관리 (BC필터/검색/결과지링크)
  - BC코드 처방 편집 (10종, 탭형 에디터, 버전 히스토리)
  - 설정 (설문링크 생성)
- [x] **컨설턴트 페이지 /consultant**
  - 로그인 (CONSULTANT 전용)
  - 내 고객 목록 (BC필터/검색)
  - 카카오톡으로 결과지 공유
  - 초대 링크 생성/복사
  - 내 정보 조회
- [x] **결과지 페이지 /result/:id**
  - JWT 인증 게이트 (컨설턴트/관리자만 열람)
  - 7페이지 분량 결과 문서 렌더링
  - BC코드별 컬러 테마 자동 적용
  - 카카오톡 공유 기능
  - 프린트 전용 CSS (print media query)
  - 컨설턴트 메모 저장
- [x] D1 데이터베이스 연동 (로컬 개발)
- [x] 6개 테이블 스키마 + 시드 데이터

### ⏳ 다음 단계 (A안)
- [ ] 결과지 7페이지 전문 UI 디자인 (사용자 직접 진행 중)
- [ ] 카카오 SDK 실제 연동 (kakaoInit)
- [ ] BC-02~04, BC-07~08 처방 데이터 추가
- [ ] 프로덕션 Cloudflare Pages 배포
- [ ] 비밀번호 bcrypt 암호화

---

## 기술 스택
- **프레임워크**: Hono 4.12 (Cloudflare Pages)
- **빌드**: Vite 6.3 + @hono/vite-build
- **DB**: Cloudflare D1 (SQLite, 로컬 --local 모드)
- **인증**: JWT HS256 (Web Crypto API)
- **정적파일**: ?raw import 방식 (KV manifest 불필요)
- **PM2**: 로컬 개발 데몬

---

## 데이터 아키텍처

### 테이블 구조
- `consultants` — 컨설턴트 계정 (code, grade, subscription, lecture_progress)
- `results` — 결과지 (50문항 응답, BC점수, 5축 분석, 신체정보)
- `bc_prescriptions` — BC-01~10 처방 데이터 (운동/식단/보충제/생활규칙)
- `bc_prescription_versions` — 처방 수정 히스토리
- `b2b_institutions` — B2B 납품 기관
- `admin_logs` — 관리자 활동 로그

### 컨설턴트 코드 체계
- `MASTER` — 총괄 관리자
- `SC-NNNN` — 컨설턴트 (SC-0001, SC-0002...)
- 설문 진입: `/?ref=SC-XXXX`
- 결과지 ID: `RES-YYYYMMDD-XXXXXX`

---

## 로컬 개발

```bash
# 1. 빌드
npm run build

# 2. D1 마이그레이션 (최초 1회)
npx wrangler d1 migrations apply slimmind-production --local

# 3. 서버 시작
pm2 start ecosystem.config.cjs

# 4. 접속
# 설문: http://localhost:3000/?ref=SC-0001
# 관리자: http://localhost:3000/admin
# 컨설턴트: http://localhost:3000/consultant
# 결과지: http://localhost:3000/result/RES-20260608-A1B2C3
```

---

## 배포 상태
- **플랫폼**: Cloudflare Pages + D1
- **상태**: 🟡 로컬 개발 완료 (프로덕션 배포 미완)
- **최종 업데이트**: 2026-06-08
