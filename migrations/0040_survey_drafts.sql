-- ══════════════════════════════════════════════════
--  survey_drafts: 크로스디바이스 설문 임시저장
--  sid: 고유 세션ID (sm_타임스탬프_랜덤6자)
--  고객이 링크(URL ?resume=sid)를 저장하면
--  어떤 기기/브라우저에서도 이어할 수 있음
-- ══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS survey_drafts (
  sid          TEXT PRIMARY KEY,          -- sm_1720000000000_abc123
  idx          INTEGER NOT NULL DEFAULT 0, -- 현재 진행 스텝
  answers_json TEXT NOT NULL DEFAULT '{}', -- 전체 answers 객체 JSON
  measure_json TEXT NOT NULL DEFAULT '{}', -- measureVals JSON
  ref_code     TEXT,                       -- 컨설턴트/B2B 코드
  total_q      INTEGER DEFAULT 0,
  saved_at     TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

-- 오래된 임시저장 자동 정리용 인덱스 (30일 이상 경과 시 주기적 삭제 가능)
CREATE INDEX IF NOT EXISTS idx_survey_drafts_updated ON survey_drafts(updated_at);
