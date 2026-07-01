-- 0037_daily_checks.sql
-- SlimMind V4.7 — 데일리 체크 자동저장 시스템
-- 목적: 고객의 오늘 탭(P10) 운동·식단·회복 체크를 DB에 영구 저장
--       관리자/컨설턴트/B2B에서 고객별 실천 현황 실시간 조회
--       12주 히트맵, 주간 완료율, 연속 달성 스트릭 산출

-- ── 데일리 체크 로그 테이블 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_checks (
  id              INTEGER   PRIMARY KEY AUTOINCREMENT,

  -- 어느 진단 세션/고객?
  session_id      TEXT      NOT NULL,  -- diagnosis_results.session_id (결과지 URL의 id/did 파라미터)
  result_id       TEXT,                -- diagnosis_results.id (RES-YYYYMMDD-XXXXXX)

  -- 담당자 정보 (조회 필터용)
  consultant_code TEXT,                -- 담당 컨설턴트 코드 (SC-0001 등)
  b2b_code        TEXT,                -- 담당 B2B 파트너 코드

  -- BC 정보
  bc_code         TEXT      NOT NULL DEFAULT 'BC-1',  -- BC-1~BC-9

  -- 날짜 정보
  check_date      TEXT      NOT NULL,  -- YYYY-MM-DD (체크한 날짜)
  week_number     INTEGER,             -- 1~12 (몇 주차?)
  day_of_week     TEXT,                -- 월/화/수/목/금/토/일

  -- 3대 체크 항목 (0=미체크, 1=완료)
  exercise_done   INTEGER   NOT NULL DEFAULT 0 CHECK (exercise_done IN (0, 1)),
  diet_done       INTEGER   NOT NULL DEFAULT 0 CHECK (diet_done IN (0, 1)),
  recovery_done   INTEGER   NOT NULL DEFAULT 0 CHECK (recovery_done IN (0, 1)),

  -- 완료율 (0~3 중 체크된 수)
  done_count      INTEGER   GENERATED ALWAYS AS (exercise_done + diet_done + recovery_done) VIRTUAL,

  -- 자유 메모
  memo            TEXT,

  -- 타임스탬프
  created_at      DATETIME  DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME  DEFAULT CURRENT_TIMESTAMP,

  -- 같은 세션·날짜 중복 방지 (UPSERT 가능)
  UNIQUE (session_id, check_date)
);

-- ── 인덱스 ────────────────────────────────────────────────────────────
-- 세션별 날짜 조회 (결과지 개인 히스토리)
CREATE INDEX IF NOT EXISTS idx_daily_session_date
  ON daily_checks (session_id, check_date DESC);

-- 컨설턴트별 조회 (담당 고객 전체 현황)
CREATE INDEX IF NOT EXISTS idx_daily_consultant
  ON daily_checks (consultant_code, check_date DESC);

-- B2B별 조회
CREATE INDEX IF NOT EXISTS idx_daily_b2b
  ON daily_checks (b2b_code, check_date DESC);

-- 날짜별 전체 집계
CREATE INDEX IF NOT EXISTS idx_daily_date
  ON daily_checks (check_date DESC);

-- ── 뷰: 세션별 주간 완료율 ─────────────────────────────────────────────
CREATE VIEW IF NOT EXISTS daily_check_weekly_stats AS
SELECT
  session_id,
  consultant_code,
  b2b_code,
  bc_code,
  week_number,
  COUNT(*)                                              AS total_days,
  SUM(exercise_done)                                    AS exercise_days,
  SUM(diet_done)                                        AS diet_days,
  SUM(recovery_done)                                    AS recovery_days,
  ROUND(100.0 * SUM(exercise_done) / COUNT(*), 1)       AS exercise_rate,
  ROUND(100.0 * SUM(diet_done)     / COUNT(*), 1)       AS diet_rate,
  ROUND(100.0 * SUM(recovery_done) / COUNT(*), 1)       AS recovery_rate,
  ROUND(100.0 * SUM(exercise_done + diet_done + recovery_done) / (COUNT(*) * 3), 1) AS overall_rate
FROM daily_checks
WHERE week_number IS NOT NULL
GROUP BY session_id, week_number;

-- ── 뷰: 컨설턴트별 고객 최근 7일 현황 ───────────────────────────────────
CREATE VIEW IF NOT EXISTS consultant_client_recent AS
SELECT
  dc.consultant_code,
  dc.session_id,
  dc.bc_code,
  MAX(dc.check_date)                                    AS last_check_date,
  COUNT(DISTINCT dc.check_date)                         AS total_check_days,
  SUM(dc.exercise_done)                                 AS total_exercise,
  SUM(dc.diet_done)                                     AS total_diet,
  SUM(dc.recovery_done)                                 AS total_recovery,
  ROUND(100.0 * SUM(dc.exercise_done + dc.diet_done + dc.recovery_done)
    / (COUNT(DISTINCT dc.check_date) * 3), 1)           AS overall_adherence_rate
FROM daily_checks dc
GROUP BY dc.consultant_code, dc.session_id;
