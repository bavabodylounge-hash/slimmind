-- 0042: diagnosis_results에 gender · height · age 컬럼 추가
-- computeNutrition(Mifflin-St Jeor) 및 Deurenberg 체지방률 공식에 성별·나이·키 필요
-- goal_weight/weight_loss_pct는 0030_goal_weight.sql에서 이미 추가됨

ALTER TABLE diagnosis_results ADD COLUMN gender  TEXT    DEFAULT NULL; -- 'male'|'female'|'other'
ALTER TABLE diagnosis_results ADD COLUMN height  REAL    DEFAULT NULL; -- cm
ALTER TABLE diagnosis_results ADD COLUMN age     INTEGER DEFAULT NULL; -- 만 나이
