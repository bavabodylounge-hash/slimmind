# SYSTEM_MAPPING.md — 진단-처방 매핑 알고리즘 & 데이터 흐름

> 최종 업데이트: 2026-08-13

---

## 1. 16가지 바디코드 (BC) 정의

### 1-1. BC 코드 목록

| 코드 | 별칭 | 핵심 원인 | 주요 처방 방향 |
|------|------|---------|--------------|
| BC-01 | 내장지방형 | 복부 심층 지방 과잉 | 카복시·GPL주사·슬림주사 |
| BC-02 | 피하지방형 | 복부 표층 피하지방 | 메조테라피·카복시 |
| BC-03 | 허리라인형 | 옆구리·허리 지방 | 윤곽주사·카복시 |
| BC-04 | 상체비만형 | 상반신 전체 지방 | 슬림주사·메조테라피 |
| BC-05 | 하체비만형 | 허벅지·종아리 | 카복시·바디보톡스 |
| BC-06 | 팔뚝형 | 팔뚝·어깨 라인 | 승모근 보톡스·카복시 |
| BC-07 | 전신형 | 전신 복합 지방 | 메조+슬림 병행 |
| BC-08 | 스트레스형 | 코르티솔 과잉 | 마녀주사·GPL주사 |
| BC-09 | 호르몬형 | 호르몬 불균형·탄력저하 | 실리프팅·스킨부스터 |
| BC-10 | 탄력저하형 | 콜라겐 감소 | 스킨부스터·실리프팅 |
| BC-11 | 피부결형 | 모공·피부결 불균일 | 실펌X·보톡스 |
| BC-12 | 색소형 | 색소침착·톤 불균일 | 토닝·GV레이저 |
| BC-13 | 자세불균형형 (P-POSTURE) | 골반·척추 틀어짐 | 도수치료·체형교정 |
| BC-14 | 만성피로형 (F-FATIGUE) | 부신기능 저하 | 마녀주사·신데렐라주사 |
| BC-15 | 면역순환형 (I-IMMUNE) | 림프 정체·만성염증 | 림프순환·항염주사 |
| BC-16 | 수면교란형 (SL-SLEEP) | 멜라토닌 교란 | 수면질 개선 프로그램 |

---

## 2. 진단 알고리즘 흐름

### 2-1. 전체 파이프라인

```
사용자 설문 응답 (survey_answers_json)
         ↓
[프론트엔드 bc-engine.js]
  → 10개 원인축 점수 계산 (axis_scores)
  → BC 점수 배열 산출 (bc_scores: {BC-01~16})
  → 주코드(bc_primary) / 부코드(bc_secondary) 결정
         ↓
POST /api/survey/submit
  → DB 저장 (results 테이블)
  → 처방 쿼리 (bc_prescriptions)
  → 결과지 HTML 생성
         ↓
GET /result/:id
  → 결과지 렌더링
```

### 2-2. 10개 원인축 (Axis)

```
A01: 내장지방 축
A02: 피하지방 축
A03: 호르몬 축
A04: 스트레스·코르티솔 축
A05: 근육·탄력 축
A06: 피부·탄력 축
A07: 체형·자세 축
A08: 수면·야간대사 축
A09: 면역·순환 축
A10: 에너지·피로 축
```

### 2-3. BC 코드 정규화 로직

```typescript
// src/index.tsx line 179~
const AXIS_TO_BC: Record<string, string> = {
  'A01': 'BC-1',  'A02': 'BC-2',  'A03': 'BC-9',
  'A04': 'BC-8',  'A05': 'BC-7',  'A06': 'BC-10',
  'A07': 'BC-13', 'A08': 'BC-16', 'A09': 'BC-15',
  'A10': 'BC-14'
}

// 코드 정규화 함수
// BC-09 → BC-9, BC-01 → BC-1
// A01 → AXIS_TO_BC 매핑 → BC-1
// 폴백: 'BC-6'
```

### 2-4. 오행(五行) 타입 연동

```
오행 타입: 목(木) / 화(火) / 토(土) / 금(金) / 수(水)

→ ohaeng_db 테이블에서 타입별 처방 조회
→ BC 처방과 레이어링 (BC 처방 + 오행 보조 처방)

V4.6 확장 필드:
- ohaeng_source: 진단 근거 (설문답변/사주/혈액형)
- ohaeng_confidence: 신뢰도 (high/medium/low)
- ohaeng_lacking: 부족한 오행 요소
```

### 2-5. MBTI·혈액형·사주 연동

```
mbti_blood_db: MBTI × 혈액형 조합 → 보조 처방
saju_db: 사주 일간(갑/을/병/정...) → 체질 성향 처방
```

---

## 3. BC 처방 DB 구조 (`bc_prescriptions`)

### 3-1. 주요 처방 필드

```
기본 정보:
  bc_code, version, brand_name, tagline, fat_area

진단 설명:
  bc_primary_oneline_reason   → 한 줄 원인 설명
  bc_cause_story              → 상세 원인 스토리
  bc_worsen_word              → 악화 요인

식단 처방:
  diet_principle              → 식단 원칙
  diet_avoid                  → 피해야 할 음식
  diet_recommend              → 추천 음식
  meal_plan_json              → 주간 식단 플랜

운동 처방:
  exercise_type               → 운동 종류
  exercise_frequency          → 빈도
  exercise_detail_json        → 상세 운동 프로그램

제품 처방:
  supplement_recommend_json   → 추천 영양제
  supplement_avoid_json       → 피해야 할 영양제

비급여 처방 (병원 전용):
  noinsurance_primary_json    → 1차 비급여 시술
  noinsurance_secondary_json  → 2차 비급여 시술
```

### 3-2. B2B 업종별 비급여 매핑

```typescript
// src/index.tsx line 4932~4947
const HOSPITAL_BC_TREATMENTS = {
  'BC-01': { title: '복부 내장지방 집중 관리', reason: '카복시테라피·GPL주사·슬림주사...' },
  'BC-02': { title: '복부 피하지방 집중 관리', reason: '메조테라피·카복시·슬림주사...' },
  // ... BC-03 ~ BC-16
}
```

---

## 4. B2B 파트너십 데이터 흐름

### 4-1. B2B 진입 경로

```
① 직접 URL: /h/:code (병원) / /a/:code (에스테틱) / /f/:code (피트니스)
   → code로 b2b_partners 조회 → 브랜드 정보 로드
   → 화이트라벨 UI 적용 (로고·색상)
   → 설문 완료 시 파트너 코드 자동 연결

② QR코드: 컨설턴트 QR → /s/:code (건기식) 등
   → consultant_code 자동 태깅

③ 직접 진단: /
   → consultant_code 없이 진행
   → 나중에 /api/results/:id/b2b 로 파트너 연결
```

### 4-2. 파트너 결과지 조회

```
GET /api/b2b/results
  → b2b_partners.code 기반 필터
  → results 테이블에서 해당 파트너 고객만 조회
  → 페이지네이션 (page, limit)
  → 검색 (name, bc_code, date_from, date_to)

GET /api/b2b/export-csv
  → 동일 필터 → CSV 포맷 반환
```

### 4-3. 파트너 통계

```
GET /api/b2b/stats
  → 총 고객 수
  → BC 분포 (pie chart 용)
  → 월별 진단 추이
  → 재방문율

GET /api/b2b/group-analysis
  → 파트너 전체 고객의 BC 분포 분석
  → 업종별 특화 인사이트
```

---

## 5. 결제 흐름

```
사용자 → POST /api/survey/submit (무료 진단)
       → 결과지 생성 (is_premium=0)

유료 업그레이드:
사용자 → PG사 결제 요청
       → GET /payment/success?imp_uid=...&merchant_uid=...
       → PG 검증 → payments 테이블 저장
       → results.is_premium = 1 업데이트
       → 프리미엄 결과지 접근 허용
```

---

## 6. 회원가입 → 퍼널 흐름

```
랜딩 페이지 (/landing/)
    ↓ 회원가입 모달 (Step1 → Step2 → Step3)
    
Step2: 회원유형 선택
  ├── B2B (hospital/esthetic/fitness/oriental)
  │     POST /api/auth/register { member_type: 'hospital', ... }
  │     → Step3: 파트너 샘플 리포트 + 카카오 파일럿 상담
  │     → 관리자 알림 (admin 대시보드 pilot-requests)
  │
  ├── consultant
  │     POST /api/auth/register { member_type: 'consultant', ... }
  │     → Step3: 컨설턴트 리포트 + 수익 계산기
  │     → 관리자 알림 (consultant-applies)
  │
  └── general
        POST /api/auth/register { member_type: 'general', ... }
        → Step3: 진단 시작 CTA
        → 메인 진단 플로우 진입

URL 파라미터 퍼널:
  /landing/?ref=b2b        → 모달 자동오픈 + 병원 유형 선택
  /landing/?ref=consultant → 모달 자동오픈 + 컨설턴트 유형 선택
```

---

## 7. 웹푸시 & 재진단 알림

```
Cron (KST 08:30/12:30/19:30)
    ↓
scheduled() 핸들러 실행
    ↓
push_subscriptions 테이블 조회
    ↓
VAPID 웹푸시 발송

재진단 알림:
GET /api/admin/rediagnosis/scan
  → results 테이블에서 진단 후 90일 경과 고객 탐색
  → rediagnosis_alerts 테이블에 기록
  → 컨설턴트 대시보드에서 확인·발송
```

---

## 8. 샘플 리포트 접근 경로

```
가입 완료 모달 Step3 → "샘플 리포트 보기" 클릭
    ↓
GET /api/download-sample-pdf
    ↓ 302 redirect
GET /landing/sample-report
    ↓
sample-report.html 서빙 (16BC 인쇄 전용 페이지)
    ↓
window.print() → 브라우저 인쇄 다이얼로그 → PDF 저장
```
