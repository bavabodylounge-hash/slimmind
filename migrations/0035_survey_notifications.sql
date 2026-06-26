-- 설문 완료 알림 테이블
-- ref_code(담당 컨설턴트/B2B)에게 설문 완료를 알리는 알림 기록
CREATE TABLE IF NOT EXISTS survey_notifications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  result_id   TEXT NOT NULL,
  ref_code    TEXT NOT NULL,
  is_read     INTEGER DEFAULT 0,
  read_at     TEXT DEFAULT NULL,
  notified_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notif_ref_code  ON survey_notifications(ref_code);
CREATE INDEX IF NOT EXISTS idx_notif_result_id ON survey_notifications(result_id);
CREATE INDEX IF NOT EXISTS idx_notif_is_read   ON survey_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notif_notified  ON survey_notifications(notified_at);
