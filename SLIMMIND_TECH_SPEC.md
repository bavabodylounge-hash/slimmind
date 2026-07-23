# SlimMind 기술 명세서 (작업지시서)
> 작성일: 2026-07-23 | 버전: v4.8 | 작성자: AI Agent (자동생성)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | SlimMind (슬림마인드) |
| 배포 URL | https://slimmind.kr |
| 플랫폼 | Cloudflare Pages + D1 (Workers for Platform / gsk hosted) |
| 프레임워크 | Hono + TypeScript + Vite |
| DB | Cloudflare D1 (SQLite) — `7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db` |
| 주요 고객 | B2B 파트너 (병원·에스테틱·헬스케어) |

---

## 2. 전체 데이터 흐름

### 2-A. 병원용 질문지 파이프라인

```
survey-hospital.html
  → buildRawAnswers()
    → raw_answers = {
        userInfo: {name, gender},
        pfProfile: {saju, mbti, blood, birthY},
        stage1: {1:val, 2:val, 10:val(몸변화), 11:val(목표부위)},
        stage2: {5:val(냉증), 10:{pat,amp,cyc}(체중궤적), 12:val(갱년기),
                 13:val(흡연), 14:val(음주), 16:{sz,tg,fit}(사이즈)},
        stage3: {0~34:원인분석, 35:운동스타일, 36:계획스타일},
        desire: {moodIdx, moodLabel, who, partIdx, partLabels, track, zone},
        redFlags: [...],
        confidence: {unknownCount, total3}
      }
  → POST /api/h/diagnosis
    → DB: hospital_responses 테이블 INSERT
    → ID 형식: H-{timestamp}-{랜덤5자}
  → GET /result-hospital/:id
    → result-hospital.html 서빙
    → 클라이언트: GET /api/h/diagnosis/:id → answers=raw_answers
    → bcAnswers 매핑엔진 (line 16220~16517) → Q_* 키 생성
    → 개인화 블록 렌더링
```

### 2-B. 통합 질문지 파이프라인

```
survey.html (또는 survey-integrated.html)
  → POST /api/v1/diagnosis
    → DB: diagnosis_results 테이블 INSERT
    → ID 형식: UUID v4
  → GET /result/:id
    → result-v4.html 서빙
    → 클라이언트: GET /api/v1/diagnosis/:id
      → answers = parseJsonSafe(diagRow.raw_answers)
      → window.__LAST_ANSWERS__ = answers  ← [CRITICAL-FIX-1]
      → buildV4AnswerKeys() IIFE           ← [CRITICAL-FIX-2]
        → stage1/2/3 → Q_* 키 변환
        → Object.assign(answers, bc2)
      → syncMappingToS2() IIFE
        → 매핑 결과 → _s2 객체 동기화
    → 개인화 블록 렌더링
```

---

## 3. 핵심 파일 목록

| 파일 | 라인 수 | 역할 |
|---|---|---|
| `src/index.tsx` | ~8,052 | Hono 백엔드 전체 — API 라우팅, DB 쿼리, 인증 |
| `public/result-v4.html` | ~26,100 | 통합 결과지 (v4) |
| `public/result-hospital.html` | ~22,316 | 병원용 결과지 |
| `public/survey-hospital.html` | ~24,829 | 병원용 질문지 |
| `public/admin.html` | - | 마스터/컨설턴트 대시보드 |

---

## 4. DB 테이블 구조

### 4-A. hospital_responses (병원용)
```sql
id TEXT PRIMARY KEY,           -- H-{timestamp}-{RAND5}
user_name TEXT,
ref_code TEXT,                 -- B2B 파트너 코드 (B2B-XXXX0000)
bc_code_key TEXT,              -- BC-1 ~ BC-9
ohaeng_type TEXT,              -- 목/화/토/금/수
mbti_full TEXT,                -- INFP 등
raw_answers TEXT,              -- JSON: stage1/2/3/desire/pfProfile 전체
goal_weight INTEGER,
axis_scores TEXT,              -- JSON: {A01:85, ...}
created_at TEXT
```

### 4-B. diagnosis_results (통합용)
```sql
id TEXT PRIMARY KEY,           -- UUID v4
user_name TEXT,
ref_code TEXT,                 -- B2B 파트너 코드
bc_code_key TEXT,              -- BC-1 ~ BC-9
bc_primary TEXT,               -- 닉네임 (식후기절 혈당롤러코스터형 등)
bc_nickname TEXT,
ohaeng_type TEXT,
mbti_full TEXT,
raw_answers TEXT,              -- JSON: stage1/2/3/desire/pfProfile 전체
axis_scores TEXT,
goal_weight INTEGER,
weight_loss_pct INTEGER,
gender TEXT,
height REAL,
age INTEGER,
survey_category TEXT,         -- 'integrated' | 'hospital' | 'aesthetic'
created_at TEXT
```

### 4-C. b2b_partners
```sql
code TEXT UNIQUE,              -- B2B-XXXX0000 (예: B2B-BAVA1234)
name TEXT,
brand_name TEXT,
brand_color TEXT,
status TEXT,                   -- active | suspended | pending
survey_category TEXT           -- 'integrated' | 'hospital'
```

---

## 5. raw_answers 구조 상세 (stage1/2/3 숫자키)

### stage1 (1차 외형 관찰)
| 키 | 값 | 설명 |
|---|---|---|
| `1` | 0~4 | 거울 존 (0=복부, 1=하체, 2=상체, 3=팔, 4=전체) |
| `2` | 0~4 | 체형 유형 |
| `10` | 0~2 | 몸 변화 (0=그대로, 1=늘었음, 2=줄었음) |
| `11` | 0~4 | 목표 부위 (0=복부, 1=하체, 2=상체, 3=팔, 4=전체) |

### stage2 (2차 배경분석)
| 키 | 값 | 설명 |
|---|---|---|
| `5` | 0~2 | 냉증 (0=없음, 1=경미, 2=심함) |
| `10` | `{pattern, amp, cyc, net}` | 체중궤적 — pattern: yoyo/creep/jump/stable |
| `12` | 0~4 | 갱년기 (4=없음, 0=있음) |
| `13` | 0~2 | 흡연 (0=흡연, 2=비흡연) |
| `14` | 0~2 | 음주 (0=자주, 1=가끔, 2=안함) |
| `16` | `{sz, tg, fit}` | 사이즈 — sz=현재사이즈, tg=목표사이즈 |

### stage3 (3차 원인분석, 0~37)
| 키 | 설명 |
|---|---|
| `35` | 운동 스타일 (0=고강도, 1=차분) |
| `36` | 계획 스타일 (0=계획형, 1=즉흥형) |
| `0~34` | 원인 분석 (0=매우그렇다, 1=그렇다, 2=아니다) |

### desire 객체
```json
{
  "moodIdx": 0,           // 0=건강활기, 1=자신당당, 2=날씬예쁘
  "moodLabel": "건강하고 활기차게",
  "who": "이효리",          // 닮고 싶은 인물
  "partIdx": [0],          // 0=뱃살, 1=하체, 2=허리, ...
  "partLabels": ["뱃살"],
  "track": "obesity",
  "zone": "belly"
}
```

---

## 6. 결과지 개인화 블록 (result-v4.html)

### 6-A. window 전역 변수
| 변수 | 설정 위치 | 내용 |
|---|---|---|
| `window.__LAST_ANSWERS__` | renderAll() line 13590 | answers(raw_answers) 전체 |
| `window.__DESIRE__` | buildV4AnswerKeys() | {moodIdx, moodLabel, who, ...} |
| `window._p5_q10pat` | buildP5DynamicEvidence() | stage2[10].pattern |
| `window._p5_q5cold` | buildP5DynamicEvidence() | stage2[5] 냉증 값 |
| `window._spec_weight` | buildP5DynamicEvidence() | 현재 체중 |
| `window._spec_goalwt` | buildP5DynamicEvidence() | 목표 체중 |
| `window._spec_losskg` | buildP5DynamicEvidence() | 감량 목표 kg |

### 6-B. buildV4AnswerKeys() IIFE (line 13592~13759)
stage1/2/3 중첩 구조 → Q_* 플랫 키로 변환
```
stage1[1]  → Q_MIRROR_ZONE
stage1[10] → Q_BODY_CHANGE
stage1[11] → Q_TARGET_ZONE
stage2[5]  → q5_cold
stage2[10].pattern → Q_WT_PATTERN
stage2[12] → Q_MENOPAUSE
stage2[13] → q13_smoke
stage2[14] → q14_alcohol
stage2[16] → Q_SIZE_CURRENT, Q_SIZE_GOAL
stage3[35] → Q_EX_STYLE (0→'intense', 1→'calm')
stage3[36] → Q_PLAN_STYLE (0→'plan', 1→'spontaneous')
desire.*   → window.__DESIRE__ 강화
```

### 6-C. 개인화 블록 목록 (H/M/L 시리즈)
| 블록 ID | DOM 요소 | 데이터 소스 | 설명 |
|---|---|---|---|
| v4-H1 | `p1-story story-lead` | Q_BODY_CHANGE | 1페이지 도입 문장 |
| v4-H2 | `p3-rx-lead` | Q_MIRROR_ZONE | 처방 리드 |
| v4-H3a | `p3-rx-headline` | desire.who | 닮고 싶은 인물 헤드라인 |
| v4-H3b | `p4-ending-quote` | desire.who | 마무리 인용구 |
| v4-H4 | `p7v4-next-why` | _spec_weight/goalwt/losskg | 4주후 재설계 why |
| v4-H5 | exercise_ok | Q_EX_STYLE/Q_PLAN_STYLE/Q_TARGET_ZONE | 운동 처방 |
| v4-M1 | - | Q_MIRROR_ZONE | 관찰 미러존 |
| v4-M2 | - | desire.moodLabel | 기분 레이블 |
| v4-M3 | - | Q_WT_PATTERN | 체중 궤적 패턴 |
| v4-M4 | - | desire.who + Q_TARGET_ZONE | 목표 인물+부위 |
| v4-M5 | - | Q_MENOPAUSE + q5_cold | 갱년기/냉증 |
| v4-L2 | - | q13_smoke + q14_alcohol | 흡연/음주 라이프스타일 |
| v4-L3 | - | Q_EX_STYLE + Q_PLAN_STYLE | 운동/계획 스타일 |

---

## 7. B2B 파트너 구조

```
B2B 코드 형식: B2B-{영문4자}{숫자4자}
예: B2B-BAVA1234 (바바성형외과)

질문지 분기:
  survey_category = 'hospital'    → survey-hospital.html → /result-hospital/:id
  survey_category = 'integrated'  → survey.html          → /result/:id
  survey_category = 'aesthetic'   → 에스테틱 전용 (미구현)
```

### 현재 active B2B 파트너 목록
| 코드 | 이름 | 질문지 유형 |
|---|---|---|
| B2B-BAVA1234 | 바바성형외과 | integrated |
| B2B-SUR-001 | 바바성형외과피부과 | integrated |

---

## 8. API 엔드포인트 요약

| 메서드 | 경로 | 역할 | 인증 |
|---|---|---|---|
| POST | `/api/auth/login` | B2B/컨설턴트/MASTER 로그인 | 없음 |
| POST | `/api/v1/diagnosis` | 통합 질문지 결과 저장 | 없음 |
| GET | `/api/v1/diagnosis/:id` | 통합 결과 데이터 조회 | 없음 |
| POST | `/api/h/diagnosis` | 병원용 질문지 결과 저장 | B2B 토큰 |
| GET | `/api/h/diagnosis/:id` | 병원용 결과 데이터 조회 | 없음 |
| GET | `/api/admin/results` | 전체 결과 목록 (MASTER) | MASTER |
| GET | `/api/admin/b2b-partners` | B2B 파트너 목록 | MASTER |
| POST | `/api/admin/b2b-partners` | B2B 파트너 생성 | MASTER |
| GET | `/api/b2b/results` | B2B 파트너 결과 목록 | B2B 토큰 |
| GET | `/api/admin/dashboard` | 통계 대시보드 | MASTER |

---

## 9. 알려진 버그 및 수정 이력

### 이번 세션 수정 (2026-07-22)

#### [CRITICAL-FIX-1] window.__LAST_ANSWERS__ 전역 할당 누락
- **파일**: `result-v4.html` line 13590
- **증상**: v4 결과지 모든 Q_* 기반 개인화 블록이 빈 값 반환
- **원인**: `answers`가 `renderAll()` 스코프 내 로컬 변수로만 존재
- **수정**: `const answers = data.answers || {}; window.__LAST_ANSWERS__ = answers;`
- **커밋**: `5b69f75`

#### [CRITICAL-FIX-2] v4에 stage1/2/3 → Q_* 매핑 엔진 부재
- **파일**: `result-v4.html` line 13592~13759
- **증상**: v4의 모든 H1~H5, M1~M5, L2~L3 개인화 블록 미동작
- **원인**: `answers = raw_answers` 구조 (stage1:{1:0,...})에서 `answers['Q_BODY_CHANGE']` = undefined
  - hospital 결과지(line 16220~16517)에는 완전한 변환 엔진이 있었지만 v4에는 없었음
- **수정**: `buildV4AnswerKeys()` IIFE + `syncMappingToS2()` IIFE 추가
- **커밋**: `71d7beb`

---

## 10. 빌드 & 배포 절차

### 개발
```bash
cd /home/user/webapp
npm run build           # Vite 빌드 → dist/
pm2 start ecosystem.config.cjs  # 로컬 테스트
```

### 운영 배포
```bash
cd /home/user/webapp
npm run build           # 빌드 먼저
git add -A && git commit -m "feat: ..."
gsk hosted deploy       # Cloudflare Workers for Platform 배포
```

### DB 마이그레이션 (신규 컬럼 추가 시)
```bash
# migrations/XXXX_new_column.sql 작성 후:
gsk hosted d1_execute --sql "ALTER TABLE xxx ADD COLUMN yyy TEXT"
# 또는 새 마이그레이션 파일로 npm run db:migrate:prod
```

---

## 11. 테스트 시뮬레이션 데이터 (B2B-BAVA1234)

### 병원용 결과지 3명 (result-hospital)
| 이름 | BC | 기질/MBTI | 특성 | 결과 ID |
|---|---|---|---|---|
| 김지현 | BC-3 복부인슐린형 | 토/ISFJ | 요요, 갱년기, 냉증심함 | H-1784739247465-9Q50I |
| 이수진 | BC-7 코르티솔형 | 화/ENFP | 번아웃, 냉증없음 | H-1784739248243-ZGMVS |
| 박민서 | BC-1 코끼리다리형 | 수/INFP | 출산후, 냉증경미 | H-1784739248996-ZI9UC |

### 통합 결과지 3명 (result-v4)
| 이름 | BC | 기질/MBTI | 특성 | 결과 ID |
|---|---|---|---|---|
| 최서연 | BC-3 혈당롤러코스터형 | 목/INTJ | 복부인슐린, 경계소견 | 92458197-c3b1-4bb5-8b21-7adccbfd7445 |
| 윤하은 | BC-1 코끼리다리형 | 금/ESFP | 림프부종, 차분+즉흥 | ec80ce17-b554-489a-93f6-6200b2ddf924 |
| 정다연 | BC-6 갱년기형 | 수/ISTJ | 갱년기, 요요 | 074859dc-34d3-42f2-987e-5b328ec86ff0 |

---

## 12. 내일 해야 할 작업 (배포 승인 후)

1. **`/api/v1/diagnosis` ref_code INSERT 버그 수정** (CRITICAL)
   - 현재: 운영 D1에 직접 INSERT로 우회 완료
   - 근본 원인: `survey_category` 컬럼이 없는 구버전 폴백 INSERT가 `ref_code`를 인식 못함
   - 수정 방법: `index.tsx` line 4283 메인 INSERT에서 폴백 분기 조건 재검토
   - 임시 해결책: gsk hosted d1_execute로 직접 주입 ✅

2. **마스터페이지 테스트 결과 정리** (선택)
   - 구버전 RES-TEST-* 행들 정리 가능 (현재 B2B-BAVA1234에 30개 결과 중 일부 구버전)

3. **gsk hosted deploy** (배포 승인 후)
   - 현재 빌드: Jul 22 16:45 (`71d7beb`)
   - 배포 대기 상태 ✅

---
*이 파일은 AI Agent가 자동 생성한 작업지시서입니다.*
*프로젝트 코드베이스 기반으로 실제 코드를 분석하여 작성되었습니다.*
