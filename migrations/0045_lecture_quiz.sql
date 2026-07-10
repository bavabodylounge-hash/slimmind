-- ══════════════════════════════════════════════════════════════════
--  0045_lecture_quiz.sql — 컨설턴트 강의/퀴즈 이력
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS lecture_completions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  consultant_code TEXT NOT NULL,
  lecture_no      INTEGER NOT NULL,   -- 1~12
  quiz_score      INTEGER DEFAULT 0,  -- 0~100
  passed          INTEGER DEFAULT 0,  -- 1=합격(70점 이상)
  completed_at    TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lc_cons_no ON lecture_completions(consultant_code, lecture_no);
CREATE INDEX IF NOT EXISTS idx_lc_cons ON lecture_completions(consultant_code);

-- 자격증 발급 테이블
CREATE TABLE IF NOT EXISTS certificates (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  consultant_code TEXT UNIQUE NOT NULL,
  cert_number     TEXT UNIQUE NOT NULL,  -- SM-CERT-YYYY-XXXX
  issued_at       TEXT DEFAULT (datetime('now')),
  level           TEXT DEFAULT '1급'
);
CREATE INDEX IF NOT EXISTS idx_cert_code ON certificates(consultant_code);
