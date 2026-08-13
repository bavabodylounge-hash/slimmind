# CURRENT_SPEC.md — 프론트엔드 UI/UX 현행 사양

> 최종 업데이트: 2026-08-13  
> 기준 커밋: a1467c8 (feat: 업그레이드 - Step3 유형별 CTA 분기, ref=b2b 자동 모달, B2B 소셜프루프 통계 바)

---

## 1. 랜딩 페이지 구조 (`/landing/`)

### 1-1. 메인 랜딩 (`index.html`)

#### 섹션 구성
| 순서 | 섹션 | 설명 |
|------|------|------|
| 1 | Hero | 메인 카피 + CTA 2개 (진단 시작 / 회원가입) |
| 2 | 대상 (Audience) | 3카드 — 일반/B2B/컨설턴트 |
| 3 | 16 바디코드 소개 | 2열 그리드 카드 |
| 4 | 결과지 미리보기 | 리포트 스크린샷 |
| 5 | 컨설턴트 수익 | 수익 구조 설명 |
| 6 | FAQ | 아코디언 |
| 7 | Final CTA | 회원가입 유도 |
| Footer | | |

#### 회원가입 모달 (3-Step)
```
Step 1: 소셜 로그인 선택 (카카오 / 네이버 / 이메일)
Step 2: 회원 유형 선택 + 이름·이메일·전화번호 입력
  └── 유형: 병원원장 / 에스테틱대표 / PT·필라테스 / 한의원 / B2B컨설턴트 / 일반고객
Step 3: 완료 — 회원 유형별 맞춤 CTA (3종 분기)
  ├── B2B (hospital/esthetic/fitness/oriental)
  │     → 파트너 샘플 리포트 + 카카오 파일럿 상담 + B2B 페이지 이동
  ├── consultant
  │     → 컨설턴트 샘플 리포트 + 수익 계산기 + 카카오 교육 문의
  └── general
        → 진단 바로 시작 (메인 CTA) + 샘플 결과지 미리보기
```

#### URL 파라미터 자동 처리
- `?ref=b2b` → 페이지 로드 시 모달 자동 오픈 + 병원 유형 미리 선택
- `?ref=consultant` → 모달 오픈 + 컨설턴트 유형 미리 선택

#### 연결된 CTA 버튼 위치
| 위치 | 코드 |
|------|------|
| 헤더 로그인 버튼 (line 566) | `onclick="openLoginModal()"` |
| Hero CTA (line 1262) | `onclick="openLoginModal()"` |
| FAQ 하단 CTA (line 1345) | `onclick="openLoginModal()"` |
| 모바일 네비 (line 1433) | `onclick="closeMobileNav();openLoginModal();"` |

#### 캐시 설정
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

---

### 1-2. B2B 파트너 랜딩 (`b2b.html`)

#### 섹션 구성
| 순서 | 섹션 | 특이사항 |
|------|------|---------|
| Hero | 메인 카피 + hero-stats 4개 | 그라디언트 배경 |
| **소셜 프루프 통계 배너** | 42개 파트너·91% 재계약·8400건·4.9점 | IntersectionObserver 카운트업 |
| Problem | 4카드 문제 제시 | |
| AI Compare | AI vs 슬림마인드 비교 | |
| 업종별 탭 | 5개 탭 (hospital/beauty/fitness/supplement/korean) | |
| ROI 계산기 | 슬라이더 기반 실시간 계산 | |
| 가격 & 데모 | 요금제 카드 + 데모 카드 | `?ref=b2b` 가입 버튼 포함 |
| 도입 프로세스 | 단계별 설명 | |
| Final CTA | 카카오 상담 | |

#### 업종별 탭 구조 (5개)
```javascript
// switchIndustry(id, btn) — 활성 탭 ID
'hospital'    // 병원·의원
'beauty'      // 뷰티·에스테틱
'fitness'     // 피트니스·PT
'supplement'  // 건기식·영양제 (addToCart() 토스트)
'korean'      // 한의원
```

각 탭 내부 구성:
- 레이더 바 차트 (IntersectionObserver + RAF 애니메이션)
- 업종별 ROI 수치
- 결과지 슬라이더 (hospital 탭만)
- "자세히 보기" → Lightbox 모달

#### Lightbox 모달 (`lbData`)
```javascript
const lbData = {
  supplement: { title, features[], roi, cta },
  hospital:   { title, features[], roi, cta },
  beauty:     { title, features[], roi, cta },
  fitness:    { title, features[], roi, cta },
  korean:     { title, features[], roi, cta }
}
// openIndLightbox(type) / closeIndLightbox()
// CSS 제어: .show 클래스
```

#### 병원 결과지 슬라이더
```javascript
// rsState = { hosp: 0 }
// rsPrev(id) / rsNext(id) / goSlide(id, idx)
// initSliderDots(id) — dots 동적 생성
```

#### Sticky CTA (통합)
- **pilotSticky** (z-index: 95) — 스크롤 300px 이상 시 노출
- ~~stickyCta~~ — 제거됨 (pilotSticky로 통합)
- 스크롤 핸들러: `window.addEventListener('scroll', ...)`

#### 소셜 프루프 카운트업
```javascript
// IntersectionObserver — threshold: 0.3
// data-target, data-suffix, data-float, data-comma 속성
// easing: 1 - (1-t)^3 (cubic ease-out)
// duration: 1400ms
```

#### 반응형 브레이크포인트
```css
@media(max-width:1200px) { /* 노트북 */ }
@media(max-width:900px)  { /* 태블릿 */ }
@media(max-width:600px)  { /* 모바일 */ }
@media(max-width:380px)  { /* 초소형 */ }
```

#### 유틸 그리드 클래스
```css
.resp-grid-2 { display:grid; grid-template-columns:repeat(2,1fr) }
.resp-grid-3 { display:grid; grid-template-columns:repeat(3,1fr) }
.resp-grid-4 { display:grid; grid-template-columns:repeat(4,1fr) }
```

#### clamp() 유체 타이포그래피
```css
.hero h1        { font-size: clamp(22px, 5vw, 46px) }
.section-head h2{ font-size: clamp(19px, 3.5vw, 32px) }
.final-cta h2   { font-size: clamp(20px, 4vw, 36px) }
.wl-text h2     { font-size: clamp(20px, 3vw, 30px) }
```

---

### 1-3. 샘플 리포트 (`sample-report.html`)

#### 구성
- 상단 고정 print-bar: "PDF로 저장 (인쇄)" (`window.print()`) + 돌아가기
- 커버 페이지 (그라디언트 배경)
- ROI 배너 3열: +34% 전환율 / 7분 / 16종
- 10개 원인축 2열 그리드
- 16개 BC 카드 2열 그리드 (업종별 B2B 적용 포인트 포함)
- CTA 푸터 (카카오 + 파트너 페이지)

#### Print CSS
```css
@media print {
  .print-bar { display: none !important }
  @page { margin: 15mm 12mm; size: A4 }
  /* page-break 설정 */
}
```

---

### 1-4. 기타 랜딩 페이지

| 파일 | 내용 |
|------|------|
| `consultant.html` | 12주 교육 과정, 수익 계산기 (인터랙티브 슬라이더), 등급별 수익률 테이블 |
| `pricing.html` | 요금제 비교표 |
| `service.html` | 서비스 소개 |
| `about.html` | 회사 소개 |
| `ad-b2b.html` | B2B 광고 랜딩 |
| `ad-consultant.html` | 컨설턴트 광고 랜딩 |
| `ad-diet.html` | 다이어트 광고 랜딩 |

---

## 2. 진단 플로우 (`/`)

### 설문 단계
```
1. 기본 정보 (성별·나이·키·몸무게)
2. 체형 특성 (상체·하체 사이즈, 지방 분포)
3. 생활습관 (수면·스트레스·식습관)
4. 체질 (오행·MBTI·혈액형·사주)
5. 건강 이슈 (알러지·폐경·기저질환)
```

### 결과지 버전
| 버전 | 파일 | 대상 |
|------|------|------|
| v1 (기본) | result.html | 일반 |
| v4 (최신) | result-v4.html | 일반 최신 |
| hospital | result-hospital.html | 병원 파트너 |
| aesthetic | result-aesthetic.html | 에스테틱 파트너 |

---

## 3. 관리자 대시보드 (`/admin`)

### 주요 탭
- 전체 현황 (결과지 목록, 검색)
- 컨설턴트 관리 (CRUD)
- B2B 파트너 관리 (CRUD)
- BC코드 관리 (처방 DB 수정)
- 정산 현황
- 에스테틱 프로그램
- 제휴 장소 관리
- 재진단 알림
- 수료증 발급

---

## 4. 컨설턴트 대시보드 (`/consultant`)

### 주요 기능
- 내 고객 결과지 목록
- 고객 채팅 (실시간 메시지)
- 재진단 알림 관리
- 강의 수강 (12주 과정)
- QR코드 발급
- 수익 현황

---

## 5. 공통 UI 컴포넌트

### AOS (Animate On Scroll)
```javascript
AOS.init({ duration:700, once:true, offset:80 })
```

### CountUp.js
- 통계 숫자 카운트업
- CDN: `https://cdn.jsdelivr.net/npm/countup.js@2.8.0`

### 카카오 플로팅 버튼
- 모든 랜딩 페이지 고정
- `href="http://pf.kakao.com/_xgCgsX"`

### Exit Intent 팝업
- `mousemove` 이벤트로 상단 이탈 감지
- 30분 무료 데모 신청 유도

### 실시간 알림 팝업 (b2b)
- 10초 후 첫 노출, 18초 간격 반복
- 6개 더미 알림 메시지 순환
