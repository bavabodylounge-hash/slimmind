-- ══════════════════════════════════════════════════
--  SlimMind DB 스키마 v1.0
--  테이블: consultants, results, bc_prescriptions,
--          bc_prescription_versions, b2b_institutions
-- ══════════════════════════════════════════════════

-- ① 컨설턴트 테이블
CREATE TABLE IF NOT EXISTS consultants (
  id                   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code                 TEXT UNIQUE NOT NULL,        -- SC-0001
  name                 TEXT,
  email                TEXT UNIQUE,
  password_hash        TEXT,                        -- bcrypt 해시 (추후 구현)
  job_type             TEXT,                        -- 트레이너/필라테스강사/뷰티/병원직원
  grade                TEXT DEFAULT '일반',          -- 일반/시니어/마스터
  subscription_status  TEXT DEFAULT 'pending',      -- pending/active/expired/suspended
  subscription_end     TEXT,                        -- YYYY-MM-DD
  lecture_progress     INTEGER DEFAULT 0,           -- 0~12강
  is_certified         INTEGER DEFAULT 0,           -- 0/1
  certified_at         TEXT,
  kakao_channel        TEXT,
  phone                TEXT,
  memo                 TEXT,
  created_at           TEXT DEFAULT (datetime('now')),
  updated_at           TEXT DEFAULT (datetime('now'))
);

-- ② 결과지 테이블
CREATE TABLE IF NOT EXISTS results (
  id                   TEXT PRIMARY KEY,            -- RES-YYYYMMDD-XXXXXX
  user_name            TEXT,
  consultant_code      TEXT REFERENCES consultants(code),
  bc_primary           TEXT NOT NULL,               -- BC-01~10
  bc_secondary         TEXT,
  bc_primary_score     INTEGER,
  bc_secondary_score   INTEGER,
  bc_scores_json       TEXT,                        -- JSON: {BC-01:72, ...}
  ohaeng_type          TEXT,                        -- 목/화/토/금/수
  ohaeng_scores_json   TEXT,                        -- JSON: {목:72, ...}
  mbti                 TEXT,
  blood_type           TEXT,
  saju_il_gan          TEXT,
  saju_ohaeng          TEXT,
  birth_date           TEXT,
  gender               TEXT,
  height               REAL,
  weight               REAL,
  target_weight        REAL,
  bmi                  REAL,
  bfr                  REAL,
  fat_kg               REAL,
  muscle_kg            REAL,
  top_size             TEXT,
  bottom_size          TEXT,
  target_top_size      TEXT,
  target_bottom_size   TEXT,
  survey_answers_json  TEXT,                        -- 전체 설문 응답 JSON
  survey_summary_json  TEXT,                        -- 요약 JSON (result_payload용)
  prescription_version TEXT DEFAULT 'v1.0',
  is_premium           INTEGER DEFAULT 0,
  emotional_state      TEXT,
  main_goal            TEXT,
  priority_value       TEXT,
  pdf_url              TEXT,
  share_image_url      TEXT,
  admin_memo           TEXT,
  created_at           TEXT DEFAULT (datetime('now')),
  expires_at           TEXT
);

-- ③ BC 처방 DB 테이블
CREATE TABLE IF NOT EXISTS bc_prescriptions (
  bc_code                      TEXT PRIMARY KEY,    -- BC-01~10
  version                      TEXT NOT NULL DEFAULT 'v1.0',
  brand_name                   TEXT,
  tagline                      TEXT,
  fat_area                     TEXT,
  bc_primary_oneline_reason    TEXT,
  bc_cause_story               TEXT,
  bc_worsen_word               TEXT,
  closing_copy                 TEXT,
  symptom_checklist_json       TEXT,                -- JSON array
  wrong_methods_json           TEXT,                -- JSON array
  correct_principles_json      TEXT,                -- JSON array
  recommended_exercises_json   TEXT,                -- JSON array
  forbidden_exercises_json     TEXT,                -- JSON array
  weekly_schedule_json         TEXT,
  zone2_bpm                    INTEGER,
  forbidden_bpm                INTEGER,
  hiit_available_week          TEXT,
  recommended_foods_json       TEXT,                -- JSON array
  forbidden_foods_json         TEXT,                -- JSON array
  supplement_list_json         TEXT,                -- JSON array
  lifestyle_rules_json         TEXT,                -- JSON array
  hospital_treatments_json     TEXT,                -- JSON array
  recommended_iv_json          TEXT,                -- JSON array
  monthly_goals_json           TEXT,
  sample_meal_week1_json       TEXT,
  sample_meal_14days_json      TEXT,
  convenience_store_guide_json TEXT,
  workout_4week_progression_json TEXT,
  recommended_tests_json       TEXT,
  is_active                    INTEGER DEFAULT 1,
  updated_at                   TEXT DEFAULT (datetime('now')),
  updated_by                   TEXT
);

-- ④ BC 처방 버전 히스토리
CREATE TABLE IF NOT EXISTS bc_prescription_versions (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  bc_code      TEXT NOT NULL,
  version      TEXT NOT NULL,
  snapshot_json TEXT,                               -- 전체 스냅샷
  changed_by   TEXT,
  change_note  TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

-- ⑤ B2B 납품 기관
CREATE TABLE IF NOT EXISTS b2b_institutions (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT NOT NULL,
  type            TEXT,                             -- 병원/헬스장/에스테틱/필라테스
  contact_name    TEXT,
  contact_phone   TEXT,
  contract_date   TEXT,
  contract_amount INTEGER DEFAULT 0,
  staff_count     INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'negotiating',       -- negotiating/active/expired
  region          TEXT,
  memo            TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- ⑥ 관리자 활동 로그
CREATE TABLE IF NOT EXISTS admin_logs (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  admin_id     TEXT,
  action       TEXT NOT NULL,
  target_type  TEXT,                                -- consultant/result/bc_code
  target_id    TEXT,
  detail_json  TEXT,
  ip_address   TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_results_consultant ON results(consultant_code);
CREATE INDEX IF NOT EXISTS idx_results_bc ON results(bc_primary);
CREATE INDEX IF NOT EXISTS idx_results_created ON results(created_at);
CREATE INDEX IF NOT EXISTS idx_consultants_status ON consultants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_bc_versions_code ON bc_prescription_versions(bc_code);
