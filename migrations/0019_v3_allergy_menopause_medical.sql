-- ══════════════════════════════════════════════════
--  SlimMind DB 마이그레이션 v3.0
--  섹션 L (알레르기/피부반응/갱년기/병적요소) 컬럼 추가
-- ══════════════════════════════════════════════════

-- results 테이블에 섹션 L 관련 컬럼 추가
ALTER TABLE results ADD COLUMN food_allergy_json    TEXT;   -- 알레르기 식품 배열 JSON (예: ["chicken","egg"])
ALTER TABLE results ADD COLUMN allergy_exclude_json TEXT;   -- 제외 식품 배열 JSON (none 제외 처리된 값)
ALTER TABLE results ADD COLUMN skin_reaction        TEXT;   -- 피부 반응 (no_reaction/acne/puffiness/rash/dry)
ALTER TABLE results ADD COLUMN menopause_status     TEXT;   -- 갱년기 상태 (not_applicable/peri/meno/post/hrt)
ALTER TABLE results ADD COLUMN is_menopause         INTEGER DEFAULT 0;  -- 갱년기 플래그 (0/1)
ALTER TABLE results ADD COLUMN medical_conditions_json TEXT; -- 병적요소 배열 JSON (예: ["diabetes","hypertension"])
ALTER TABLE results ADD COLUMN has_medical_conditions  INTEGER DEFAULT 0; -- 병적요소 존재 여부 (0/1)
ALTER TABLE results ADD COLUMN prescription_version_v3 TEXT; -- v3.0 마킹용

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_results_menopause ON results(menopause_status);
CREATE INDEX IF NOT EXISTS idx_results_skin ON results(skin_reaction);
CREATE INDEX IF NOT EXISTS idx_results_has_medical ON results(has_medical_conditions);
