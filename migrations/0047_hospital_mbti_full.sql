-- 0047: hospital_responses 테이블에 mbti_full 컬럼 추가
-- 이미 컬럼이 있는 경우 자동으로 무시됨 (Worker 코드의 try/catch로 처리)
ALTER TABLE hospital_responses ADD COLUMN mbti_full TEXT;
