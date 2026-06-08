-- ══════════════════════════════════════════════════
--  SlimMind DB 스키마 v2.0 업그레이드 (재작성)
--  0003: 보조 테이블 3종만 생성 (컬럼 추가는 0005에서)
-- ══════════════════════════════════════════════════

-- ══════════════════════════════════════════════════
--  보조 테이블 1: 오행 스토리 레이어
-- ══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ohaeng_db (
  ohaeng_type        TEXT PRIMARY KEY,  -- 목|화|토|금|수
  organ_primary      TEXT,
  organ_secondary    TEXT,
  weak_season        TEXT,
  strong_season      TEXT,
  good_foods_json    TEXT,
  bad_foods_json     TEXT,
  good_taste         TEXT,
  supplement_addon_json TEXT,
  story_layer        TEXT,
  personality_trait  TEXT,
  exercise_affinity  TEXT,
  created_at         TEXT DEFAULT (datetime('now'))
);

-- ══════════════════════════════════════════════════
--  보조 테이블 2: 사주 일간 계절 주의사항
-- ══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS saju_db (
  il_gan             TEXT PRIMARY KEY,  -- 甲|乙|丙|丁|戊|己|庚|辛|壬|癸
  il_gan_ko          TEXT,
  ohaeng             TEXT,
  yin_yang           TEXT,
  organ              TEXT,
  weak_season        TEXT,
  weak_months        TEXT,
  warning_foods_json TEXT,
  boost_foods_json   TEXT,
  season_warning     TEXT,
  personality_hint   TEXT,
  created_at         TEXT DEFAULT (datetime('now'))
);

-- ══════════════════════════════════════════════════
--  보조 테이블 3: MBTI × 혈액형 조합 레이어
-- ══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mbti_blood_db (
  id                 TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  mbti               TEXT NOT NULL,
  blood_type         TEXT NOT NULL,
  motivation_lang    TEXT,
  diet_pattern       TEXT,
  exercise_pattern   TEXT,
  fail_pattern       TEXT,
  story_insert       TEXT,
  UNIQUE(mbti, blood_type)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_mbti_blood ON mbti_blood_db(mbti, blood_type);
CREATE INDEX IF NOT EXISTS idx_saju_ohaeng ON saju_db(ohaeng);
