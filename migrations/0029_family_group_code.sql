-- 기능 8: 가족 코드 비교 — family_group_code 컬럼 추가
ALTER TABLE diagnosis_results ADD COLUMN family_group_code TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_diagnosis_family_group ON diagnosis_results(family_group_code);
