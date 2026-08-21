-- ── 0063: fitness_responses 테이블 신설 ──────────────────────────────────
-- aesthetic_responses 스키마 기반 + 피트니스 전용 컬럼 추가
-- 피트니스 전용: exercise_response, pain_gate, bmr, tdee, calorie_target

CREATE TABLE IF NOT EXISTS fitness_responses (
  id                TEXT PRIMARY KEY,          -- F-XXXXXXXXXXXXXXX-XXXXX
  b2b_code          TEXT NOT NULL,
  ref_code          TEXT,
  user_name         TEXT NOT NULL,
  gender            TEXT,
  age               TEXT,
  height            TEXT,
  weight            TEXT,
  phone             TEXT,
  stage1_json       TEXT,                      -- 외형 촉진 설문 (q1~q14)
  stage2_json       TEXT,                      -- 생활 설문 (q1~q18 + specState)
  stage3_json       TEXT,                      -- 원인축 설문 (gi[0..9])
  stage4_json       TEXT,                      -- 경합 설문 (4차 46쌍)
  ohaeng_type       TEXT,
  disp_type         TEXT,
  mbti_full         TEXT,
  bc_code           TEXT,
  bc_nickname       TEXT,
  axis_scores       TEXT,                      -- JSON {"A01":7.2,...,"A10":0.0}
  raw_answers       TEXT,                      -- JSON {exercise_response, pain_areas, ...}
  goal_weight       REAL,
  weight_loss_pct   REAL,
  -- ── 피트니스 전용 컬럼 ────────────────────────────────────────────────
  exercise_response TEXT,                      -- Q10: 운동반응형 (7가지 중 선택)
                                               -- 일시반응형/반응지속형/구성미변형/역반응형
                                               -- 회복부족형/저반응형/이력없음
  pain_gate         TEXT,                      -- Q11: 통증게이트 (복수 max3, JSON 배열)
                                               -- ["목·어깨","등·허리","무릎·발목","없었어요"]
  bmr               REAL,                      -- BMR (Mifflin-St Jeor)
  tdee              REAL,                      -- TDEE = BMR × 활동계수
  calorie_target    REAL,                      -- 섭취목표 = TDEE - 적자(보통 500)
  activity_level    TEXT,                      -- 활동계수 라벨 (주1~2회 / 주3~4회 / 주5+ 등)
  bfr_current       REAL,                      -- 현재 체지방률 (%)
  bfr_target        REAL,                      -- 목표 체지방률 (%)
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fitness_b2b    ON fitness_responses(b2b_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fitness_ref    ON fitness_responses(ref_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fitness_bc     ON fitness_responses(bc_code);
CREATE INDEX IF NOT EXISTS idx_fitness_ex     ON fitness_responses(exercise_response);
