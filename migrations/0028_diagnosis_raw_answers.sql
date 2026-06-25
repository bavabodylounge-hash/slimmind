-- V4.1 patch: diagnosis_results에 원시 설문 답변 컬럼 추가
-- 1~4차 전체 답변 + userInfo를 저장해 서버 학습 및 재분석에 활용

ALTER TABLE diagnosis_results ADD COLUMN raw_answers TEXT DEFAULT NULL;
-- raw_answers JSON 구조:
-- {
--   "userInfo": { "name": "홍길동", "gender": "여성" },
--   "stage1":   { "1": 0, "2": 1, ... },   -- 1차 외형 14문항 답변 (qno → oi)
--   "stage2":   { "1": 0, "9": [0,2], ... }, -- 2차 배경 14문항 (다중선택 포함)
--   "stage3":   { "0": 2, "1": 1, ... },   -- 3차 원인축 32문항 (gi → score)
--   "stage4":   { "0": {"oi":0,"key":"A01_A09"}, ... }, -- 4차 동적 갈림질문
--   "waist":    { "10": {"sz":32,"tg":28} }, -- 허리 슬라이더 값
--   "meta":     { "completed_at": "...", "ua": "...", "ref_code": "..." }
-- }

CREATE INDEX IF NOT EXISTS idx_diagnosis_bc_primary ON diagnosis_results(bc_primary);
CREATE INDEX IF NOT EXISTS idx_diagnosis_ohaeng ON diagnosis_results(ohaeng_type);
CREATE INDEX IF NOT EXISTS idx_diagnosis_region ON diagnosis_results(region);
