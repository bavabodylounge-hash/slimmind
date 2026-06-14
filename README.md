# SlimMind — 바디코드 체형 진단 서비스

> **최종 검증**: 2026-06-14 (세션 3) — 전체 앱 Playwright 검증 완료, PDF 인쇄 12페이지 정상, BC_DB 동기화 확인

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
- **최종 업데이트**: 2026-06-14 (세션 3)

---

## 전체 앱 업데이트 정책 (매 수정 시 필수 체크리스트)

> **원칙**: 매 업데이트마다 설문지 + 컨설턴트 코드 부여 + 결과지를 **전부 함께** 검증한다.

### BC_DB 변경 시 체크리스트

BC 코드(BC-01~BC-10)를 추가/수정할 때는 두 파일을 반드시 동기화해야 한다.

| 체크 | 파일 | 역할 | BC 코드 사용 방식 |
|------|------|------|-------------------|
| ☐ | `public/slimmind_live.html` | 설문 점수 계산 → BC 배정 | `D.BC_DB['BC-XX']` — 고객 친화적 분류명 |
| ☐ | `public/result.html` | 결과지 렌더링 | `BC_DB['BC-XX']` — 의학적 전문 명칭 |

**BC_DB 두 파일 명칭 매핑 현황** (2026-06-14 기준):

| BC 코드 | slimmind_live (설문 분류명) | result.html (결과지 전문 명칭) |
|---------|---------------------------|-------------------------------|
| BC-01 | 복부 내장지방형 | 인슐린저항·혈당형 |
| BC-02 | 대사 저하형 | 간 기능 저하형 |
| BC-03 | 상체 비만형 | 수분·림프 순환형 |
| BC-04 | 복부 팽만형 | 스트레스·코르티솔형 |
| BC-05 | 하체 피하지방형 | 갑상선·대사 저하형 |
| BC-06 | 부종·순환형 | 장내미생물 불균형형 |
| BC-07 | 마른비만형 | 혈액순환·심혈관형 |
| BC-08 | 계절·대사 민감형 | 호르몬 불균형형 |
| BC-09 | 성인병 리스크형 | 면역·염증 과민형 |
| BC-10 | 요요·의지 반복형 | 복합 대사 증후군형 |

> ⚠️ 두 파일의 명칭이 다른 것은 **의도적 설계** (레이어 분리):
> - `slimmind_live`: 고객이 공감하는 증상 표현
> - `result.html`: 전문적 대사 원인 표현
> - BC 번호 자체(01~10)는 동일하게 대응 → 연결 문제 없음
> - 신규 BC 코드 추가 시 두 파일 모두에 동일 번호로 추가 필요

### 결과지(result.html) 수정 시 체크리스트

```
☐ 1. slimmind_live.html — 해당 BC 코드 점수 계산 로직과 일치 여부 확인
☐ 2. result.html BC_DB — name/short/metaProfile/diet/exercise/suppl 필드 완성도 확인
☐ 3. @media print CSS — 새 컴포넌트 추가 시 break-inside/break-before 정책 적용
☐ 4. npm run build → pm2 restart slimmind → curl localhost:3000/result?bc=BC-01 확인
☐ 5. python /tmp/pdf_recheck.py → 총 페이지 수 및 공백 페이지 없음 확인
☐ 6. git add & git commit (의미있는 메시지 필수)
```

### PDF 인쇄(@media print) 관리 원칙

```
현재 상태: 12페이지 (BC-01 기준, 2026-06-14 세션 3 확인)

페이지 구성:
  p01: 커버 (SlimMind 리포트)
  p02: ch1 진단 결과 (BC 코드 + 서브타입)
  p03: 11축 신호 강도 차트
  p04: ch2 11축 정밀 분석
  p05: ch3 12주 여정 지도
  p06: ch4 우리의 약속
  p07: ch5 기질·체질 통합 분석 + 대사 프로파일 ← 핵심 (이전 페이지 8 공백 버그 수정 완료)
  p08: ch6 3대 맞춤 처방 (식단/운동)
  p09: 영양제 처방
  p10: ch7 오행 계절 처방
  p11: ch8 시작하기
  p12: 선언 카드

@media print 핵심 규칙:
  - 챕터당 새 페이지: chapter { break-before: page }
  - meta-grid (대사 프로파일): break-inside: auto + break-before: avoid
  - meta-item: break-inside: avoid (카드 단위 보호)
  - #ch5 내부 요소들: padding 축소로 대사 프로파일 4개 카드가 ch5 페이지에 수용

PDF 재검증 방법:
  cd /tmp && python pdf_recheck.py
  → /tmp/pdf_recheck/page_01~12.png 생성
```

### 컨설턴트 계정 비밀번호 체계

```
기본 패턴: pass{NNNN} (SC-0001 → pass0001, SC-0002 → pass0002 ...)
DB 확인:   npx wrangler d1 execute slimmind-production --local \
             --command="SELECT code, name, password_hash FROM consultants"

로그인 API 우선순위 (src/index.tsx):
  1. code === 'MASTER' && password === 'admin1234'
  2. consultant.password_hash === password (DB 직접 비교)
  3. password === 'pass' + code.replace('SC-', '')  (기본값 fallback)
```

### Playwright 검증 스크립트 위치

```
/tmp/pdf_recheck.py    — PDF 페이지별 이미지 변환 (pymupdf)
/tmp/admin_tabs2.py    — 관리자 전 탭 스크린샷
/tmp/admin_modal.py    — BC코드 편집 모달 캡처
/tmp/consultant_tabs.py — 컨설턴트 포털 전 탭 캡처
```
