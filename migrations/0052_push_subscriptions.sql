-- 웹푸시 구독 정보 테이블
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id      TEXT    NOT NULL,
  endpoint        TEXT    NOT NULL UNIQUE,
  p256dh          TEXT    NOT NULL,
  auth            TEXT    NOT NULL,
  bc_code         TEXT,
  consultant_code TEXT,
  b2b_code        TEXT,
  user_agent      TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_session ON push_subscriptions(session_id);
CREATE INDEX IF NOT EXISTS idx_push_b2b     ON push_subscriptions(b2b_code);
CREATE INDEX IF NOT EXISTS idx_push_cons    ON push_subscriptions(consultant_code);
