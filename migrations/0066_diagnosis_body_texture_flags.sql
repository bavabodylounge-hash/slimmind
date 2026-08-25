-- migration 0066: diagnosis_results 에 body_regions / textures / flags 컬럼 추가
-- verify-detail API가 이 컬럼들을 SELECT하므로 없으면 SQL 에러 → 5개 테이블 모두 찾기 실패 버그 발생
-- 추가 후 decideSubtype() 재연산에 부위/질감/플래그 데이터 활용 가능

-- diagnosis_results (신파이프라인 V4)
ALTER TABLE diagnosis_results ADD COLUMN body_regions TEXT DEFAULT NULL;
ALTER TABLE diagnosis_results ADD COLUMN textures      TEXT DEFAULT NULL;
ALTER TABLE diagnosis_results ADD COLUMN flags         TEXT DEFAULT NULL;

-- 인덱스 (검색 성능)
CREATE INDEX IF NOT EXISTS idx_diagnosis_ref_code    ON diagnosis_results(ref_code);
CREATE INDEX IF NOT EXISTS idx_diagnosis_bc_code_key ON diagnosis_results(bc_code_key);
CREATE INDEX IF NOT EXISTS idx_diagnosis_category    ON diagnosis_results(survey_category);
