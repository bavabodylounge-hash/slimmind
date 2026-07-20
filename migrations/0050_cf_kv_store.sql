-- app_kv: 서버사이드 키/값 저장소 (카카오 API 키 등 민감 설정)
CREATE TABLE IF NOT EXISTS app_kv (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
