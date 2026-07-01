-- ════════════════════════════════════════════════════════════════
--  0038_check_alerts.sql
--  데일리 체크 자동 알림 테이블
--  · 3일 연속 미체크 → 컨설턴트 알림 (type = 'missed_3days')
--  · (확장예정) 4주 달성 → 쿠폰 자동발급 (type = 'achieve_4weeks')
--  · (확장예정) 이상치 플래그 (type = 'anomaly')
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS check_alerts (
  id              INTEGER   PRIMARY KEY AUTOINCREMENT,
  session_id      TEXT      NOT NULL,          -- 대상 고객
  alert_type      TEXT      NOT NULL           -- 'missed_3days' | 'achieve_4weeks' | 'anomaly' | 'remind'
    CHECK (alert_type IN ('missed_3days','achieve_4weeks','anomaly','remind','manual')),
  ref_code        TEXT,                        -- 담당 컨설턴트/B2B 코드 (알림 수신자)
  bc_code         TEXT,
  message         TEXT,                        -- 알림 메시지 본문
  is_read         INTEGER   NOT NULL DEFAULT 0 CHECK (is_read IN (0,1)),
  read_at         DATETIME,
  triggered_at    DATETIME  NOT NULL DEFAULT (datetime('now')),
  created_at      DATETIME  NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_alerts_session    ON check_alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_alerts_ref_code   ON check_alerts(ref_code);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read    ON check_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_type       ON check_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered  ON check_alerts(triggered_at);

-- ── 중복 알림 방지용 인덱스 ──────────────────────────────────
-- 같은 session + type 조합은 24시간 내 1건만 허용 (APP 레이어에서 체크)
CREATE INDEX IF NOT EXISTS idx_alerts_dedup
  ON check_alerts(session_id, alert_type, triggered_at);
