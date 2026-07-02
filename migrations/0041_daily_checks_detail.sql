-- 0041_daily_checks_detail.sql
-- daily_checks에 운동/식단 상세 JSON 컬럼 추가
-- exercise_detail: [{nm, min, kcal}]  JSON array
-- diet_detail:     [{meal, nm, kcal}] JSON array
-- total_kcal_out:  운동 총 소모 칼로리
-- total_kcal_in:   식단 총 섭취 칼로리

ALTER TABLE daily_checks ADD COLUMN exercise_detail TEXT DEFAULT NULL;  -- JSON: [{nm,min,kcal},...]
ALTER TABLE daily_checks ADD COLUMN diet_detail     TEXT DEFAULT NULL;  -- JSON: [{meal,nm,kcal},...]
ALTER TABLE daily_checks ADD COLUMN total_kcal_out  INTEGER DEFAULT NULL; -- 운동 소모 합계
ALTER TABLE daily_checks ADD COLUMN total_kcal_in   INTEGER DEFAULT NULL; -- 식단 섭취 합계
ALTER TABLE daily_checks ADD COLUMN memo_exercise   TEXT DEFAULT NULL;  -- 운동 자유 메모
ALTER TABLE daily_checks ADD COLUMN memo_diet       TEXT DEFAULT NULL;  -- 식단 자유 메모
