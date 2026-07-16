-- 0047: hospital_responses 테이블에 mbti_full 컬럼 추가
CREATE TABLE IF NOT EXISTS hospital_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  result_id TEXT,
  response_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE hospital_responses ADD COLUMN mbti_full TEXT;
