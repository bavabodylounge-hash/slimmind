-- 0060: ward_programs — 3,360벌 옷장 스키마
-- 설계도 기준: 아형25 × 기질2 × 배치2 × 오행5 × 목표3 × 플래그조합 = 3,360벌
-- 각 행은 1벌(week_slot=0이면 공통 헤더, 1~12이면 주차별 조각)

CREATE TABLE IF NOT EXISTS ward_programs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  bc_code         TEXT NOT NULL,          -- BC-1 ~ BC-16
  subtype_name    TEXT NOT NULL,          -- 25아형 명칭 (예: 갱년기변환형)
  temperament     TEXT NOT NULL,          -- 기질: J(완결형) | P(탐색형)
  layout          TEXT NOT NULL,          -- 배치: A(강도우선) | B(균형)
  ohaeng          TEXT NOT NULL,          -- 오행: 목|화|토|금|수
  goal            TEXT NOT NULL,          -- 목표: slim|health|energy
  flag_key        TEXT DEFAULT '',        -- 플래그 조합키 (예: MENOPAUSE_YOYO)
  week_slot       INTEGER NOT NULL DEFAULT 0, -- 0=헤더, 1~12=주차
  -- 헤더 필드 (week_slot=0)
  title           TEXT,                   -- 제목 (예: 호르몬 리셋 12주 프로그램)
  subtitle        TEXT,                   -- 부제
  forbidden1      TEXT,                   -- 금지①
  forbidden2      TEXT,                   -- 금지②
  forbidden3      TEXT,                   -- 금지③
  gate_story      TEXT,                   -- 관문 서사
  week_goal       TEXT,                   -- 이번 주 목표 (공통)
  exercise_format TEXT,                   -- 운동 형식 요약
  walk_line       TEXT,                   -- 걷기 줄
  flip_content    TEXT,                   -- 반전(flip) 메시지
  diet_summary    TEXT,                   -- 식단 요약
  recovery_schedule TEXT,                 -- 회복 시간표
  -- 주차별 필드 (week_slot=1~12)
  ex_pieces       TEXT,                   -- JSON: 운동 조각 ID 배열 (EX 코드)
  di_pieces       TEXT,                   -- JSON: 식단 조각 ID 배열 (DI 코드)
  re_pieces       TEXT,                   -- JSON: 회복 조각 ID 배열 (RE 코드)
  collab_pieces   TEXT,                   -- JSON: 협진 조각 ID 배열 (CL 코드)
  week_narrative  TEXT,                   -- 주차 내러티브 (AI 작가 ④)
  consultant_msg  TEXT,                   -- 컨설턴트 답장 (AI 작가 ⑤)
  lock_week       INTEGER DEFAULT 0,      -- 잠금 해제 주차 (0=항상 공개)
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ward_bc_code    ON ward_programs(bc_code);
CREATE INDEX IF NOT EXISTS idx_ward_subtype    ON ward_programs(subtype_name);
CREATE INDEX IF NOT EXISTS idx_ward_flag_key   ON ward_programs(flag_key);
CREATE INDEX IF NOT EXISTS idx_ward_week_slot  ON ward_programs(week_slot);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ward_unique
  ON ward_programs(bc_code, temperament, layout, ohaeng, goal, flag_key, week_slot);

-- roadmap_weeks: 12주 조립 확정표 (김지현 BC-13 기준 마스터 테이블)
-- 각 BC코드 × week 조합으로 EX/DI/RE 조각 ID 저장
CREATE TABLE IF NOT EXISTS roadmap_weeks (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  bc_code         TEXT NOT NULL,
  week_num        INTEGER NOT NULL,       -- 1~12
  ex_ids          TEXT NOT NULL DEFAULT '[]', -- JSON 배열
  di_ids          TEXT NOT NULL DEFAULT '[]',
  re_ids          TEXT NOT NULL DEFAULT '[]',
  collab_ids      TEXT NOT NULL DEFAULT '[]',
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_roadmap_bc_week ON roadmap_weeks(bc_code, week_num);

-- checkin_pieces: 데일리 체크인 조각 ID 추적
CREATE TABLE IF NOT EXISTS checkin_pieces (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id      TEXT NOT NULL,          -- diagnosis_results.id 연결
  user_name       TEXT,
  week_num        INTEGER NOT NULL,
  day_num         INTEGER NOT NULL,       -- 1~7
  piece_type      TEXT NOT NULL,          -- EX|DI|RE|CL
  piece_id        TEXT NOT NULL,
  checked         INTEGER DEFAULT 0,      -- 0|1
  checked_at      TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_checkin_session ON checkin_pieces(session_id);
CREATE INDEX IF NOT EXISTS idx_checkin_week    ON checkin_pieces(session_id, week_num);
