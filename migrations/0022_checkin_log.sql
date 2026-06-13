-- ═══════════════════════════════════════════════════════
-- Migration 0022: checkin_log 테이블 생성
-- 주차별 11축 클릭트리 체크인 기록 + 컨설턴트 자동전송
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS checkin_log (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  result_id        TEXT    NOT NULL,             -- results 테이블의 ID
  consultant_code  TEXT    DEFAULT '',           -- 담당 컨설턴트 코드
  bc_code          TEXT    DEFAULT '',           -- BC-01 ~ BC-10
  week_range       TEXT    DEFAULT '',           -- "1~3주차" 등
  axis_name        TEXT    DEFAULT '',           -- 축 이름 (예: "인슐린·혈당축")
  checked_at       TEXT    DEFAULT (datetime('now')),
  created_at       TEXT    DEFAULT (datetime('now'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_checkin_result_id       ON checkin_log(result_id);
CREATE INDEX IF NOT EXISTS idx_checkin_consultant_code ON checkin_log(consultant_code);
CREATE INDEX IF NOT EXISTS idx_checkin_checked_at      ON checkin_log(checked_at);
