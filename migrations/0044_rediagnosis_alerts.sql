-- ══════════════════════════════════════════════════════════════════
--  0044_rediagnosis_alerts.sql
--  고객 재진단 알림 테이블
--  · 진단 후 30/60/90일 경과 시 재진단 권유 알림
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rediagnosis_alerts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id      TEXT NOT NULL,         -- 원본 진단 세션 ID
  consultant_code TEXT,                  -- 담당 컨설턴트 코드
  customer_name   TEXT,                  -- 고객 이름
  bc_code         TEXT,                  -- BC 코드
  diagnosed_at    TEXT,                  -- 원본 진단 일시
  alert_day       INTEGER NOT NULL,      -- 30 | 60 | 90 (진단 후 며칠)
  status          TEXT DEFAULT 'pending',-- pending / sent / dismissed
  sent_at         TEXT,
  dismissed_at    TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rediag_session    ON rediagnosis_alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_rediag_consultant ON rediagnosis_alerts(consultant_code);
CREATE INDEX IF NOT EXISTS idx_rediag_status     ON rediagnosis_alerts(status);
CREATE INDEX IF NOT EXISTS idx_rediag_day        ON rediagnosis_alerts(alert_day);

-- 중복 방지 (동일 session + day 조합 1건)
CREATE UNIQUE INDEX IF NOT EXISTS idx_rediag_uniq ON rediagnosis_alerts(session_id, alert_day);
