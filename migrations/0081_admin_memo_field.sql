-- 0081_admin_memo_field.sql
-- diagnosis_results에 admin_memo 컬럼 추가 (컨설턴트 메모)
-- consultant_code 컬럼도 추가 (ref_code 대신 사용 가능)

ALTER TABLE diagnosis_results ADD COLUMN admin_memo TEXT DEFAULT NULL;
ALTER TABLE diagnosis_results ADD COLUMN consultant_code TEXT DEFAULT NULL;

-- consultant_code를 ref_code 값으로 채우기 (기존 데이터 마이그레이션)
UPDATE diagnosis_results 
SET consultant_code = ref_code 
WHERE ref_code IS NOT NULL AND ref_code != '';
