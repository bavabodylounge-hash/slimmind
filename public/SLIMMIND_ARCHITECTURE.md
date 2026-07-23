# SlimMind 전체 아키텍처 맵핑 지시서 v1.0
> 작성일: 2026-07-23 | 목적: B2B 결과지 재생성 / 신규 설문-결과지 파이프라인 구축용 완전 레퍼런스

---

## 0. 시스템 전체 흐름도

```
[사용자 접속]
    │
    ├─ /h/:code  → 컨설턴트 QR코드로 설문 진입
    ├─ /survey-hospital.html  → 설문지 (16개 스테이지, BC 채점)
    │       │
    │       ▼
    │  POST /api/h/diagnosis  (백엔드 저장)
    │       │
    │       ▼
    ├─ /result-hospital/:id  → 결과지 (SSR HTML + JS 렌더링)
    │       │
    │       ├─ bc-engine.js  (BC 코드 재계산 fallback)
    │       ├─ survey-data.js (질문 데이터 + 축 채점 테이블)
    │       └─ slimmind-today.html  (?id=SID 로 오늘탭 이동)
    │
    └─ /api/places  → GPS 기반 협진 센터 조회 (카카오 REST API)
```

---

## 1. 설문 파싱 구조 (survey-hospital.html)

### 1-1. 질문 데이터 파일
- **파일**: `public/survey-data.js`
- **핵심 객체**: `QUESTIONS[]` — 전체 질문 배열

```javascript
// 질문 구조 (각 항목)
{
  id: 'Q01',           // 고유 ID
  type: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'SLIDER' | 'TEXT',
  weight: 1.0,         // 채점 가중치
  options: [
    {
      value: 'opt_a',
      axisEffect: {    // 10축 점수에 가산
        A01: 3, A05: 2
      },
      ohaengEffect: {  // 오행 점수에 가산
        '목': 2
      },
      bcScore: {       // BC 코드 직접 가산 (외형카드 전용)
        'BC-1': 5
      }
    }
  ]
}
```

### 1-2. 10축 채점 함수
- **파일**: `public/survey-hospital.html` line ~16859
- **함수**: `scoreAxes()`

```javascript
// 10축 정의
A01: 인슐린저항/지방저장
A02: 순환/부종
A03: 호르몬/대사
A04: 근육/활동량
A05: 소화/염증
A06: 체형정렬/자세
A07: 스트레스/회복
A08: 심리/식이행동
A09: 성인병리스크
A10: 기질성향(MBTI계열)
```

### 1-3. BC 코드 결정 함수
- **파일**: `public/survey-hospital.html` line ~17024
- **함수**: `determineOutlineBC()` — 외형카드 기반 BC 1차 결정
- **파일**: `public/bc-engine.js` line ~639
- **함수**: `computeBCCode(axisScores, answers)` — 10축 기반 BC 정밀 결정
- **함수**: `computeBCCodeSafe(axisScores, answers)` — 경계형(Top1-Top2 diff<10) 처리

```javascript
// BC 코드 16종
BC-1:  하지 림프·정맥 울혈 (코끼리다리형)
BC-2:  셀룰라이트 하체 (귤껍질 하체형)
BC-3:  내장지방 복부 (단단내장형)
BC-4:  피하지방 복부 (물렁피하형)
BC-5:  가스팽만 복부 (가스팽만형)
BC-6:  복부돌출 올챙이형
BC-7:  대퇴사두 하체 (말벅지형)
BC-8:  외측대퇴 하체 (승마살형)
BC-9:  경추/승모근 상체 (거북이형)
BC-10: 상지 부종 상체 (팔뚝부종형)
BC-11: 상체 근육형
BC-12: 부유방형
BC-13: 갱년기 전환형
BC-14: 번아웃·무기력형
BC-15: 대사증후군형
BC-16: 다중악순환형
```

### 1-4. 오행(五行) 채점
- **파일**: `public/survey-hospital.html` line ~10701
- **함수**: `pfCalcOhaeng()`
- **5종**: 목(木)/화(火)/토(土)/금(金)/수(水)
- 가장 높은 오행 점수 → `ohaeng_type` 필드로 저장

---

## 2. 백엔드 저장 구조 (src/index.tsx)

### 2-1. 설문 제출 → DB 저장
- **라우트**: `POST /api/h/diagnosis` (line ~4970)
- **저장 DB**: Cloudflare D1 (`hospital_diagnoses` 테이블)

```typescript
// 저장 필드 (주요)
session_id:       uuid (결과지 URL에 쓰이는 ID)
bc_primary:       'BC-6'
bc_secondary:     'BC-3'  (경계형일 때)
axis_scores:      JSON { A01:7, A02:3, ... }
ohaeng_type:      '목'
red_flags:        JSON ['DIABETES','HTN', ...]  // 특이 건강이력
answers:          JSON (전체 답변 원본)
user_name, age, height, weight, goal_weight
consultant_code:  컨설턴트 코드 (QR 추적용)
```

### 2-2. 결과지 SSR 렌더링
- **라우트**: `GET /result-hospital/:id` (line ~5307)
- **처리**: D1에서 데이터 조회 → `result-hospital.html`에 `__HOSPITAL_DATA__` 인라인 삽입

```javascript
// 인라인 삽입 패턴 (result-hospital.html 상단 script)
window.__HOSPITAL_DATA__ = { ...DB 조회 결과 };
```

### 2-3. 주요 API 전체 목록

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/h/diagnosis` | POST | 설문 결과 저장 |
| `/api/h/result/:id` | GET | 결과 데이터 JSON 조회 |
| `/api/h/programs` | GET | 병원 프로그램 목록 |
| `/result-hospital/:id` | GET | 결과지 HTML SSR |
| `/result-hospital/:id/download` | GET | PDF 다운로드 |
| `/api/survey/submit` | POST | 일반 설문 저장 |
| `/api/results/:id` | GET | 결과 조회 |
| `/api/places` | GET | GPS 협진 센터 (카카오+제휴) |
| `/api/auth/login` | POST | 컨설턴트 로그인 |
| `/api/consultant/results` | GET | 컨설턴트 담당 결과 목록 |
| `/api/admin/dashboard` | GET | 어드민 대시보드 |
| `/h/:code` | GET | 컨설턴트 QR → 설문 진입 |
| `/api/daily-check` | POST | 오늘탭 체크인 저장 |
| `/api/coaching-comment/:id` | GET | 컨설턴트 코칭 코멘트 |

---

## 3. 결과지 렌더링 구조 (result-hospital.html)

### 3-1. 데이터 로드 흐름
```javascript
// 1. SSR 인라인 데이터 (서버가 주입)
window.__HOSPITAL_DATA__ = { bc_primary, axis_scores, ... }

// 2. 없으면 URL 파라미터
GET /result-hospital/H-XXXX → SSR로 주입

// 3. 클라이언트 재계산 (fallback)
computeBCCodeSafe(axisScores, answers)
```

### 3-2. BC 로드맵 DB
- **위치**: `result-hospital.html` line ~9780
- **객체**: `BC_ROADMAP_DB`
- **구조**:
```javascript
BC_ROADMAP_DB = {
  'BC-1': [
    // week 1~4 (4개 객체)
    {
      week: 1,
      phase: '회복기',
      target: '...',
      exercise_ok: '...',
      exercise_ban: '...',
      diet_ok: '...',
      diet_ban: '...',
      recovery_ok: '...',
      keyFocus: ['키워드1','키워드2','키워드3'],
      axis_logic: '...',
      nutrition: { kcal:1350, proteinG:90, carbG:135, fatG:45 }
    },
    // week 2, 3, 4 ...
  ],
  'BC-2': [...],
  // BC-3 ~ BC-16
}
```

### 3-3. 12주 확장 로직 (v2.5)
- **위치**: `result-hospital.html` line ~11258
- **객체**: `BC_CYCLE` — 5~12주 사이클 오버레이 (c2: 5~8주, c3: 9~12주)
- **객체**: `WEEK_CYCLE_META` — 주차별 phase/cue/target 메타
- **루프**: `expandedWeeks` — baseWeeks(4개)를 12주로 동적 확장

```javascript
// 확장 공식
week 5 → baseWeeks[0] 복제 + BC_CYCLE.c2 오버레이
week 6 → baseWeeks[1] 복제 + BC_CYCLE.c2 오버레이
...
week 9 → baseWeeks[0] 복제 + BC_CYCLE.c3 오버레이
...
week 12 → baseWeeks[3] 복제 + BC_CYCLE.c3 오버레이
```

### 3-4. getRoadmapWeeks() — 처방 생성기
- **위치**: `result-hospital.html` line ~11190
- **입력**: `(bc_primary, goal_weight, weight_loss_pct, user_name, ohaeng_type)`
- **처리 순서**:
  1. BC_ROADMAP_DB에서 baseWeeks 4개 로드
  2. 12주 동적 확장 (expandedWeeks)
  3. OHAENG_OVERLAY 오행 오버레이 적용
  4. NICKNAME_OVERLAY 닉네임 삽입
  5. 영양(nutrition) 계산
  6. redFlags 보정
  7. localStorage 저장: `slimmind_weeks_[SID]`, `slimmind_meta_[SID]`

### 3-5. 오행 오버레이
- **위치**: `result-hospital.html` (OHAENG_OVERLAY 객체)
- **5종**: 목/화/토/금/수
- **필드**: `exercise_add`, `diet_add`, `recovery_add`
- **⚠️ 버그이력**: `recovery_add`가 week===1에만 적용되던 버그 → v2.6에서 OHAENG_RECOVERY_DB로 전주차 적용으로 수정

---

## 4. 오늘탭 구조 (slimmind-today.html)

### 4-1. localStorage 키 구조
```javascript
slimmind_meta_[SID]    // 개인화 메타 (BC코드, 오행, 체중 등)
slimmind_weeks_[SID]   // 12주 처방 배열
slimmind_checks_[SID]  // 오늘탭 체크 상태 (했어요/못했어요)
slimmind_start_[SID]   // 시작일 timestamp (주차 계산용)
```

### 4-2. SID 추출 규칙
```javascript
function sid() {
  // URL 파라미터 순서: ?id= > ?diagnosis_id= > ?did= > 'local'
  return q.get('id') || q.get('diagnosis_id') || q.get('did') || 'local';
}
```
- **⚠️ 주의**: result-hospital.html → slimmind-today.html 이동 시 반드시 `?id=SID` 포함해야 함

### 4-3. 오늘탭 개인화 DB (v3.0, v2.6)
```javascript
EX_DAY_DB        // BC×요일(0~6) × {nm, detail, sets, tip}
DIET_DAY_DB      // BC × {meal, snap, supp}
OHAENG_RECOVERY_DB  // 오행 × {daily, caution} — 전주차 적용
SUPP_BUY_LINKS   // BC × {name, url(쿠팡 파트너스)}
```

### 4-4. renderItems() 카드 구조 (v2.6)
```html
<div class="item ex|di|re [done|missed]">
  <div class="item-hd">  <!-- 헤더: 아이콘 + 카테고리 + 완료뱃지 -->
  <div class="item-main"> <!-- 메인 제목 -->
  <button class="det-toggle"> <!-- ▼ 상세 처방 보기 토글 -->
  <div class="item-detail"> <!-- 세트×횟수×시간 상세 (기본 닫힘) -->
  <div class="item-sub">  <!-- 간식+영양제 (식단 카드) -->
  <div class="item-nutr"> <!-- 영양 배지 -->
  [suppBuyHtml]           <!-- 쿠팡 링크 (식단 카드) -->
  <div class="item-tags"> <!-- keyFocus 태그 -->
  <div class="item-warn/alert"> <!-- 경고 -->
  <div class="item-acts"> <!-- 했어요/못했어요 버튼 -->
  <div class="why">       <!-- 못한 이유 선택 -->
  <div class="item-note"> <!-- 완료 노트 -->
</div>
```

---

## 5. GPS 협진 센터 (api/places)

### 5-1. 처리 흐름
```
프론트 → GET /api/places?lat=37.5&lng=127.0&type=diet_clinic&radius=3000
          │
          ├─ 1. affiliate_places DB 조회 (priority ASC + 거리순)
          ├─ 2. 카카오 REST API (keyword × 2개 병렬, size=15)
          │       └─ sort=accuracy (카카오는 리뷰순 미지원)
          │       └─ 결과 병합·중복제거·200m 버킷 정렬
          └─ 3. [제휴업체 먼저] + [카카오 보조] 통합 반환
```

### 5-2. 카카오 API 키 저장
```sql
-- settings_kv 테이블
SELECT value FROM settings_kv WHERE key = 'kakao_rest_api_key'
-- 어드민 설정: PUT /api/settings/kakao-map
```

### 5-3. 카테고리 → 카카오 키워드 매핑 (KAKAO_KEYWORD_MAP)
```javascript
diet_clinic:    ['다이어트 한의원', '비만클리닉']
exercise:       ['PT샵', '필라테스']
mental:         ['심리상담센터']
// ... (src/index.tsx에서 확인)
```

---

## 6. 도메인 구조

### 6-1. 실 도메인 (슬리마인드)
```
https://slimmind.kr          → 메인/랜딩
https://slimmind.kr/survey-hospital.html → 설문지
https://slimmind.kr/result-hospital/H-XXXX → 결과지
https://slimmind.kr/slimmind-today.html?id=SID → 오늘탭
https://slimmind.kr/consultant → 컨설턴트 대시보드
https://slimmind.kr/admin      → 어드민
```

### 6-2. Cloudflare 배포 URL (내부용)
```
https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com
→ 실 도메인(slimmind.kr)으로 프록시됨 — 사용자에게 노출 금지
```

---

## 7. B2B 결과지 신규 생성 체크리스트

신규 B2B 파트너 결과지 생성 시 이 순서로 진행:

### Step 1: 설문 데이터 정의
- [ ] `QUESTIONS[]` 에 새 질문 추가 (survey-data.js)
- [ ] 각 옵션에 `axisEffect` / `bcScore` 매핑
- [ ] `scoreAxes()` 로직 검증

### Step 2: BC 매핑 테이블 확인
- [ ] `BC_ROADMAP_DB` — BC-1~16 × week1~4 처방 확인
- [ ] `BC_CYCLE` — 5~12주 사이클 오버레이 확인
- [ ] `OHAENG_OVERLAY` — 오행별 처방 추가 확인

### Step 3: 결과지 HTML 생성
- [ ] `window.__HOSPITAL_DATA__` 인라인 주입 구조 유지
- [ ] `computeBCCodeSafe()` fallback 유지
- [ ] `getRoadmapWeeks()` 호출 후 localStorage 저장
- [ ] SID는 항상 URL `?id=` 파라미터로 전달

### Step 4: 백엔드 라우트 추가
- [ ] `POST /api/[브랜드]/diagnosis` — 저장
- [ ] `GET /result-[브랜드]/:id` — SSR 렌더링
- [ ] D1 테이블: `[브랜드]_diagnoses`

### Step 5: 오늘탭 연동 (선택)
- [ ] EX_DAY_DB / DIET_DAY_DB BC별 처방 데이터 추가
- [ ] SUPP_BUY_LINKS — 쿠팡 파트너스 URL 등록
- [ ] `?id=SID` URL 파라미터 연결 확인

---

## 8. 주요 파일 역할 요약

| 파일 | 역할 | 크기 |
|------|------|------|
| `survey-hospital.html` | 설문지 UI + 채점 로직 | 2.5MB |
| `survey-data.js` | 질문 데이터 + 축 매핑 테이블 | 238KB |
| `bc-engine.js` | BC 코드 계산 엔진 | 465KB |
| `bc-definitions.js` | BC 마스터 정의 (16종) | 60KB |
| `result-hospital.html` | 결과지 전체 UI + 처방 생성 | 1.6MB |
| `slimmind-today.html` | 오늘탭 (체크인 + 처방 카드) | 109KB |
| `src/index.tsx` | Cloudflare Workers 백엔드 API | 385KB |
| `admin.html` | 어드민 대시보드 | 349KB |
| `consultant.html` | 컨설턴트 대시보드 | 243KB |
| `result-aesthetic.html` | 미용/에스테틱 결과지 | 1.8MB |
