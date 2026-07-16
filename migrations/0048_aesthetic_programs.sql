-- ══════════════════════════════════════════════════════════════
--  0048_aesthetic_programs.sql
--  에스테틱 B2B 파트너 전용 시술 프로그램 DB
--  + diagnosis_results에 survey_category 컬럼 추가
-- ══════════════════════════════════════════════════════════════

-- 1. diagnosis_results에 survey_category 컬럼 추가
--    (기존 데이터는 'integrated' 기본값으로 처리)
ALTER TABLE diagnosis_results ADD COLUMN survey_category TEXT DEFAULT 'integrated';

-- 2. 에스테틱 파트너 시술 프로그램 테이블
--    입점 업체가 자신의 프로그램을 등록 → BC코드별 매핑으로 결과지에 추천
CREATE TABLE IF NOT EXISTS aesthetic_programs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_code TEXT NOT NULL,                    -- b2b_partners.code (예: B2B-AES-001)
  program_name TEXT NOT NULL,                    -- 시술/관리 프로그램명 (예: "LPG 셀룰라이트 케어")
  program_desc TEXT,                             -- 프로그램 설명 (1~2줄)
  program_tag  TEXT,                             -- 태그 (예: "주 2회 × 8주")
  program_icon TEXT DEFAULT '💆',               -- 이모지 아이콘
  target_area  TEXT,                             -- 관리 부위 (예: "복부·허벅지")
  bc_codes     TEXT NOT NULL DEFAULT '[]',       -- JSON 배열: ["BC-1","BC-2"] — 추천 BC코드
  priority     INTEGER DEFAULT 5,               -- 낮을수록 우선 노출 (1=최우선)
  is_signature INTEGER DEFAULT 0,               -- 1=대표 시그니처 프로그램
  price_display TEXT,                           -- 가격 표시 (예: "1회 80,000원", NULL=미표시)
  duration_min  INTEGER,                        -- 시술 소요 시간(분)
  homepage_url  TEXT,                           -- 해당 프로그램 상세 페이지 URL
  status        TEXT DEFAULT 'active',          -- active | inactive
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_aesthetic_programs_partner ON aesthetic_programs(partner_code);
CREATE INDEX IF NOT EXISTS idx_aesthetic_programs_bc ON aesthetic_programs(bc_codes);
CREATE INDEX IF NOT EXISTS idx_aesthetic_programs_status ON aesthetic_programs(status);

-- 4. 에스테틱 파트너 홈페이지 URL 컬럼 추가 (b2b_partners 테이블)
ALTER TABLE b2b_partners ADD COLUMN homepage_url TEXT;
ALTER TABLE b2b_partners ADD COLUMN aesthetic_intro TEXT;  -- 업체 한 줄 소개
