-- ★ v72 FIX: survey_category='integrated'로 잘못 저장된 병원용(ref_code가 hospital 파트너) 데이터 일괄 수정
-- diagnosis_results에서 ref_code가 hospital 파트너인데 survey_category가 hospital이 아닌 것을 수정
UPDATE diagnosis_results
SET survey_category = 'hospital'
WHERE ref_code IN (
  SELECT code FROM b2b_partners WHERE survey_category = 'hospital'
)
AND (survey_category IS NULL OR survey_category != 'hospital');
