-- ══════════════════════════════════════════════════
--  SlimMind DB v2.0 bc_prescriptions + results 컬럼 추가
--  0005: 기존 테이블에 v2.0 신규 컬럼만 추가
-- ══════════════════════════════════════════════════

-- ─── bc_prescriptions: PART A (운동 처방 고도화) ────
ALTER TABLE bc_prescriptions ADD COLUMN recommended_sports_json    TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN forbidden_sports_json      TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN aerobic_restriction        TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN rest_prescription_json     TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN hiit_available_week_v2     TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN zone2_bpm_v2               INTEGER;
ALTER TABLE bc_prescriptions ADD COLUMN muscle_soreness_protocol_json TEXT;

-- ─── bc_prescriptions: PART B (회복 처방) ──────────
ALTER TABLE bc_prescriptions ADD COLUMN recovery_priority_json     TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN sauna_ok                   TEXT DEFAULT 'true';
ALTER TABLE bc_prescriptions ADD COLUMN cryo_ok                    TEXT DEFAULT 'true';
ALTER TABLE bc_prescriptions ADD COLUMN lymph_massage_protocol_json TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN sleep_protocol_json        TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN aromatherapy_json          TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN psych_referral_recommended INTEGER DEFAULT 0;

-- ─── bc_prescriptions: PART C (식단 영양소) ────────
ALTER TABLE bc_prescriptions ADD COLUMN macro_ratio_json           TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN macro_story                TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN meal_timing_rule_json      TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN forbidden_foods_reason_json TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN timing_story               TEXT;

-- ─── bc_prescriptions: PART D (B2B 파트너) ─────────
ALTER TABLE bc_prescriptions ADD COLUMN b2b_treatments_json        TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN hospital_tests_json        TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN reassessment_schedule_json TEXT;
ALTER TABLE bc_prescriptions ADD COLUMN partner_hints_json         TEXT;

-- ─── results: v2.0 신규 설문 응답 컬럼 ─────────────
ALTER TABLE results ADD COLUMN survey_v2_answers_json TEXT;
ALTER TABLE results ADD COLUMN aerobic_response       TEXT;
ALTER TABLE results ADD COLUMN massage_swells         INTEGER DEFAULT 0;
ALTER TABLE results ADD COLUMN sauna_response         TEXT;
ALTER TABLE results ADD COLUMN current_facility       TEXT;
ALTER TABLE results ADD COLUMN context_type           TEXT;
ALTER TABLE results ADD COLUMN current_medications    TEXT;
ALTER TABLE results ADD COLUMN target_body_part       TEXT;
ALTER TABLE results ADD COLUMN psych_state            TEXT;
ALTER TABLE results ADD COLUMN monthly_budget         TEXT;
ALTER TABLE results ADD COLUMN muscle_soreness_level  TEXT;
ALTER TABLE results ADD COLUMN b2b_institution_types  TEXT;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_results_b2b ON results(b2b_institution_types);
CREATE INDEX IF NOT EXISTS idx_results_aerobic ON results(aerobic_response);
