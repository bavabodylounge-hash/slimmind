-- settings_kv: 서버사이드 키/값 저장소 (카카오 API 키 등 민감 설정)
-- _cf_ 접두사는 Cloudflare 예약어라 D1에서 쓰기 불가 → settings_kv로 대체
CREATE TABLE IF NOT EXISTS settings_kv (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
