-- 1:1 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id      TEXT    NOT NULL,          -- 고객 session_id
  b2b_code        TEXT,                      -- 파트너 코드
  consultant_code TEXT,                      -- 담당 컨설턴트 코드
  sender          TEXT    NOT NULL CHECK(sender IN ('client','consultant')),
  message         TEXT    NOT NULL,
  is_read         INTEGER NOT NULL DEFAULT 0, -- 0=미읽음, 1=읽음
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_session   ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_b2b       ON chat_messages(b2b_code);
CREATE INDEX IF NOT EXISTS idx_chat_consultant ON chat_messages(consultant_code);
CREATE INDEX IF NOT EXISTS idx_chat_created   ON chat_messages(created_at DESC);
