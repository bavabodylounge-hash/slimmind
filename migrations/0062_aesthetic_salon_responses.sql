-- ── 0062: aesthetic_responses + salon_responses 테이블 신설 ──────────────
-- hospital_responses 스키마 1:1 동일 구조로 생성

-- ── aesthetic_responses ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aesthetic_responses (
  id              TEXT PRIMARY KEY,          -- A-XXXXXXXXXXXXXXX-XXXXX
  b2b_code        TEXT NOT NULL,
  ref_code        TEXT,
  user_name       TEXT NOT NULL,
  gender          TEXT,
  age             TEXT,
  height          TEXT,
  weight          TEXT,
  phone           TEXT,
  stage1_json     TEXT,                      -- 외형 촉진 설문 (q1~q14)
  stage2_json     TEXT,                      -- 생활 설문 (q1~q16 + specState)
  stage3_json     TEXT,                      -- 원인축 설문 (gi[0..9])
  stage4_json     TEXT,                      -- 통증/운동 설문
  ohaeng_type     TEXT,
  disp_type       TEXT,
  mbti_full       TEXT,
  bc_code         TEXT,
  bc_nickname     TEXT,
  axis_scores     TEXT,                      -- JSON {"A01":72,...,"A10":84}
  raw_answers     TEXT,                      -- JSON {exercise_response, pain_areas, ...}
  goal_weight     REAL,
  weight_loss_pct REAL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_aesthetic_b2b    ON aesthetic_responses(b2b_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aesthetic_ref    ON aesthetic_responses(ref_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aesthetic_bc     ON aesthetic_responses(bc_code);

-- ── salon_responses ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salon_responses (
  id              TEXT PRIMARY KEY,          -- S-XXXXXXXXXXXXXXX-XXXXX
  b2b_code        TEXT NOT NULL,
  ref_code        TEXT,
  user_name       TEXT NOT NULL,
  gender          TEXT,
  age             TEXT,
  height          TEXT,
  weight          TEXT,
  phone           TEXT,
  stage1_json     TEXT,
  stage2_json     TEXT,
  stage3_json     TEXT,
  stage4_json     TEXT,
  ohaeng_type     TEXT,
  disp_type       TEXT,
  mbti_full       TEXT,
  bc_code         TEXT,
  bc_nickname     TEXT,
  axis_scores     TEXT,
  raw_answers     TEXT,
  goal_weight     REAL,
  weight_loss_pct REAL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_salon_b2b    ON salon_responses(b2b_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_salon_ref    ON salon_responses(ref_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_salon_bc     ON salon_responses(bc_code);
