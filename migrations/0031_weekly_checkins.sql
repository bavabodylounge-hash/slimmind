-- 0031_weekly_checkins.sql
-- SlimMind V4.1 — 결과 추적 피드백 루프 테이블
-- 목적: 1~12주차 실측값 수집 → 처방 검증 루프 완성
--       evidence_level 산출 근거 데이터 축적
--       BC 코드별 실제 효과 통계 기반 구축

CREATE TABLE IF NOT EXISTS weekly_checkins (
  id                INTEGER  PRIMARY KEY AUTOINCREMENT,

  -- 어느 진단 세션과 연결?
  session_id        TEXT     NOT NULL,          -- diagnosis_results.session_id FK
  bc_code           TEXT     NOT NULL,          -- 처방 BC 코드 (BC-1~BC-9, nickname 포함)
  week_number       INTEGER  NOT NULL           -- 1~12
    CHECK (week_number BETWEEN 1 AND 12),

  -- ── 실측 신체 지표 ─────────────────────────────────────────────
  weight_kg         REAL,                       -- 실측 체중 (kg)
  body_fat_pct      REAL,                       -- 체지방률 (%)  — 옵션
  waist_cm          REAL,                       -- 허리둘레 (cm) — 옵션

  -- ── 자가 보고 증상 ─────────────────────────────────────────────
  energy_score      INTEGER                     -- 활력 1-10점
    CHECK (energy_score BETWEEN 1 AND 10),
  hunger_score      INTEGER                     -- 공복감 1-10점
    CHECK (hunger_score BETWEEN 1 AND 10),
  sleep_score       INTEGER                     -- 수면질 1-10점
    CHECK (sleep_score BETWEEN 1 AND 10),
  mood_score        INTEGER                     -- 기분 1-10점
    CHECK (mood_score BETWEEN 1 AND 10),

  -- ── 순응도 (adherence) ────────────────────────────────────────
  diet_adherence    INTEGER                     -- 식단 지킴 (0-100%)
    CHECK (diet_adherence BETWEEN 0 AND 100),
  exercise_adherence INTEGER                    -- 운동 지킴 (0-100%)
    CHECK (exercise_adherence BETWEEN 0 AND 100),

  -- ── 처방 대비 결과 ────────────────────────────────────────────
  weight_delta_actual  REAL,                    -- 실제 체중 변화 (kg, 음수=감소)
  weight_delta_target  REAL,                    -- 처방 목표 체중 변화 (kg)
  on_track          INTEGER DEFAULT 1           -- 0=이탈, 1=정상
    CHECK (on_track IN (0, 1)),

  -- ── 자유 텍스트 ──────────────────────────────────────────────
  notes             TEXT,                       -- 부작용, 특이사항 (자유 입력)

  -- ── 메타 ─────────────────────────────────────────────────────
  checkin_at        DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- 동일 세션·주차 중복 방지
  UNIQUE (session_id, week_number)
);

-- 인덱스: session_id 기준 주차 조회 (프로필 페이지용)
CREATE INDEX IF NOT EXISTS idx_checkins_session
  ON weekly_checkins (session_id, week_number);

-- 인덱스: BC 코드별 집계 (evidence_level 통계 산출용)
CREATE INDEX IF NOT EXISTS idx_checkins_bc_week
  ON weekly_checkins (bc_code, week_number);

-- ── BC 코드별 주차 효과 집계 뷰 (통계 기반 evidence 산출) ────────────
-- 사용법: SELECT * FROM bc_weekly_stats WHERE bc_code = 'BC-3' AND week_number = 4;
CREATE VIEW IF NOT EXISTS bc_weekly_stats AS
SELECT
  bc_code,
  week_number,
  COUNT(*)                          AS sample_n,
  ROUND(AVG(weight_delta_actual), 2) AS avg_weight_delta,
  ROUND(AVG(diet_adherence),  1)    AS avg_diet_adherence,
  ROUND(AVG(exercise_adherence), 1) AS avg_exercise_adherence,
  ROUND(AVG(energy_score), 2)       AS avg_energy,
  ROUND(AVG(hunger_score), 2)       AS avg_hunger,
  ROUND(AVG(sleep_score), 2)        AS avg_sleep,
  ROUND(AVG(mood_score), 2)         AS avg_mood,
  ROUND(
    100.0 * SUM(CASE WHEN on_track = 1 THEN 1 ELSE 0 END) / COUNT(*),
    1
  )                                 AS on_track_rate_pct
FROM weekly_checkins
GROUP BY bc_code, week_number;
