-- V4.2: diagnosis_results에 bc_code_key 컬럼 추가
-- bc_primary는 한글 닉네임('스트레스성 야식부엉이형') 저장
-- bc_code_key는 'BC-6' 형태 코드 저장 → 관리자 필터 및 처방 JOIN에 사용

ALTER TABLE diagnosis_results ADD COLUMN bc_code_key TEXT;
CREATE INDEX IF NOT EXISTS idx_diagnosis_bc_code_key ON diagnosis_results(bc_code_key);
