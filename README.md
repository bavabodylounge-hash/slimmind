# SlimMind — AI 바디코드 진단 플랫폼

> 체형·체질 기반 16가지 바디코드 진단 → 맞춤 처방 리포트 → B2B 화이트라벨 솔루션

---

## 🌐 라이브 URL

| 페이지 | URL |
|--------|-----|
| **메인 랜딩** | https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/landing/ |
| **B2B 파트너** | https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/landing/b2b.html |
| **B2B 가입 퍼널** | https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/landing/?ref=b2b |
| **컨설턴트** | https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/landing/consultant.html |
| **샘플 리포트** | https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/landing/sample-report |
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
| **인증** | JWT (HS256) |
| **프론트엔드** | Vanilla JS + Tailwind CDN + AOS + CountUp.js |
| **배포** | Genspark Hosted Deploy → Cloudflare |
| **버전관리** | GitHub (bavabodylounge-hash/slimmind) |

---

## 📁 프로젝트 구조

```
slimmind/
├── src/
│   ├── index.tsx          # 메인 Hono 앱 (API 194개 엔드포인트, 10,147줄)
│   └── renderer.tsx       # JSX 렌더러
├── public/
│   ├── landing/           # 랜딩 페이지 (index/b2b/consultant/pricing 등)
│   │   ├── index.html     # 메인 랜딩 + 회원가입 모달
│   │   ├── b2b.html       # B2B 파트너 랜딩 (업종별 탭, ROI 계산기)
│   │   ├── consultant.html# 컨설턴트 랜딩 (수익 계산기)
│   │   ├── sample-report.html # 16BC 샘플 리포트 (인쇄→PDF)
│   │   ├── pricing.html   # 요금제 페이지
│   │   ├── service.html   # 서비스 소개
│   │   └── about.html     # 회사 소개
│   ├── index.html         # 진단 메인 (설문 플로우)
│   ├── result.html        # 결과지 (일반)
│   ├── result-v4.html     # 결과지 v4 (최신)
│   ├── result-hospital.html # 병원 전용 결과지
│   ├── result-aesthetic.html# 에스테틱 전용 결과지
│   ├── admin.html         # 관리자 대시보드
│   ├── consultant.html    # 컨설턴트 대시보드
│   ├── survey-aesthetic.html # 에스테틱 전용 설문
│   ├── survey-hospital.html  # 병원 전용 설문
│   └── slimmind-today.html   # 오늘의 체크인
├── migrations/            # DB 마이그레이션 (0001~0059)
├── docs/                  # 기술 명세서 HTML
├── README.md              # 이 파일
├── CURRENT_SPEC.md        # 프론트엔드 UI/UX 사양
├── BACKEND_GUIDE.md       # 백엔드 API & DB 가이드
├── SYSTEM_MAPPING.md      # 진단-처방 매핑 알고리즘
├── wrangler.jsonc         # Cloudflare 설정
├── vite.config.ts         # 빌드 설정
└── package.json
```

---

## 🎯 핵심 기능

### 진단 플로우
1. **설문** (7분, 약 40문항) → 체형·체질·생활습관 파악
2. **AI 분석** → 16개 바디코드 중 주코드·부코드 산출
3. **결과지 생성** → 처방·식단·운동·제품 추천 자동 매핑
4. **리포트 공유** → URL 공유 / 인쇄→PDF

### B2B 화이트라벨
- 병원·에스테틱·피트니스·한의원·건기식샵 5개 업종
- 파트너 전용 관리자페이지 (고객 데이터·매출·CSV 내보내기)
- 화이트라벨 브랜딩 (로고·색상 100% 커스텀)
- 1개월 무료 파일럿 → 초기비용 290만원 + 월 9,900원

### 컨설턴트 네트워크
- 12주 교육 → 공식 바디컨설턴트 자격
- 등급제 수익 (브론즈 15% ~ 마스터 30%)
- 월 수익 시뮬레이터

---

## 🚀 개발 & 배포

### 로컬 개발 (샌드박스)
```bash
npm run build          # Vite 빌드
pm2 start ecosystem.config.cjs  # PM2로 서버 시작
# → http://localhost:3000
```

### 배포 (Cloudflare)
```bash
git add . && git commit -m "메시지"
# → git commit 시 auto-deploy 훅이 Genspark에 배포 요청
# → Genspark 화면에서 승인 버튼 클릭
```

### DB 마이그레이션
```bash
# 로컬
npx wrangler d1 migrations apply slimmind --local
# 프로덕션
npx wrangler d1 migrations apply slimmind
```

---

## 📊 현재 운영 현황 (2026.08 기준)

- 파트너 센터: **42개** 운영 중
- 재계약률: **91%**
- 누적 진단: **8,400건**
- 파트너 만족도: **4.9/5.0점**

---

## 📝 문서

| 문서 | 내용 |
|------|------|
| [CURRENT_SPEC.md](./CURRENT_SPEC.md) | 프론트엔드 UI/UX 사양 |
| [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) | API 엔드포인트 & DB 스키마 |
| [SYSTEM_MAPPING.md](./SYSTEM_MAPPING.md) | 진단-처방 매핑 알고리즘 |

---

*Last updated: 2026-08-13*
