-- ════════════════════════════════════════════════════════════════
--  0039_coaching_comments.sql
--  컨설턴트 → 고객 코칭 코멘트
--  · 컨설턴트가 데일리 체크 화면에서 코멘트 입력
--  · 고객 결과지 "오늘" 탭에 최신 코멘트 노출
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coaching_comments (
  id               INTEGER   PRIMARY KEY AUTOINCREMENT,
  session_id       TEXT      NOT NULL,          -- 대상 고객
  consultant_code  TEXT      NOT NULL,          -- 작성 컨설턴트
  comment          TEXT      NOT NULL,          -- 코멘트 본문 (최대 500자)
  is_visible       INTEGER   NOT NULL DEFAULT 1 CHECK (is_visible IN (0,1)),  -- 고객 노출 여부
  check_date       TEXT,                        -- 연결된 날짜 (YYYY-MM-DD, nullable)
  created_at       DATETIME  NOT NULL DEFAULT (datetime('now')),
  updated_at       DATETIME  NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coaching_session    ON coaching_comments(session_id);
CREATE INDEX IF NOT EXISTS idx_coaching_consultant ON coaching_comments(consultant_code);
CREATE INDEX IF NOT EXISTS idx_coaching_date       ON coaching_comments(check_date);
CREATE INDEX IF NOT EXISTS idx_coaching_created    ON coaching_comments(created_at);
