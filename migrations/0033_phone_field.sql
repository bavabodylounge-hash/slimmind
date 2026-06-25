-- V4.3: diagnosis_results에 고객 전화번호 컬럼 추가
-- 컨설턴트가 카카오톡 결과지 전달 시 사용

ALTER TABLE diagnosis_results ADD COLUMN phone TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_diagnosis_phone ON diagnosis_results(phone);
