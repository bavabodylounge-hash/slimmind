-- ══════════════════════════════════════════════════════════════
--  0049_affiliate_places.sql
--  제휴업체 테이블 — 11개 진단 축별 추천 장소 관리
--  카카오 로컬 API 결과 위에 우선 노출
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS affiliate_places (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,

  -- 기본 정보
  name         TEXT NOT NULL,            -- 업체명 (예: "강남 ○○한의원")
  category     TEXT NOT NULL,            -- 진단축 카테고리: 한방|시술|심리|호르몬|체형|운동|식단|관리|약물|철학|회복
  description  TEXT,                     -- 한 줄 소개 (예: "BC-3 내장지방 전문 침·한약")
  tag          TEXT,                     -- 강조 태그 (예: "슬리마인드 제휴", "첫방문 10% 할인")
  icon         TEXT DEFAULT '🏥',        -- 카드 이모지

  -- 위치 정보
  address      TEXT,                     -- 도로명 주소
  lat          REAL,                     -- 위도 (예: 37.4979)
  lng          REAL,                     -- 경도 (예: 127.0276)
  region_si    TEXT,                     -- 시/도 (예: "서울특별시")
  region_gu    TEXT,                     -- 구/군 (예: "강남구")

  -- 연락 / 링크
  phone        TEXT,                     -- 전화번호
  homepage_url TEXT,                     -- 홈페이지 또는 예약 URL
  kakao_place_id TEXT,                   -- 카카오맵 place_id (있으면 직접 링크)
  naver_place_id TEXT,                   -- 네이버맵 place_id (보조)

  -- BC 코드 매핑 (JSON 배열: ["BC-1","BC-3"])
  bc_codes     TEXT DEFAULT '[]',

  -- 노출 제어
  priority     INTEGER DEFAULT 5,        -- 낮을수록 우선 노출 (1=최우선)
  is_featured  INTEGER DEFAULT 0,        -- 1=슬리마인드 공식 파트너 배지
  partner_code TEXT,                     -- b2b_partners.code 연결 (있으면)
  status       TEXT DEFAULT 'active',    -- active | inactive | pending

  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_aff_category  ON affiliate_places(category);
CREATE INDEX IF NOT EXISTS idx_aff_region    ON affiliate_places(region_si, region_gu);
CREATE INDEX IF NOT EXISTS idx_aff_status    ON affiliate_places(status);
CREATE INDEX IF NOT EXISTS idx_aff_priority  ON affiliate_places(priority);
CREATE INDEX IF NOT EXISTS idx_aff_bc        ON affiliate_places(bc_codes);

-- 카카오 로컬 API 검색어 매핑 (카테고리 → 카카오 키워드)
-- (코드에서 참조용 — 실제 데이터 아님)
-- 한방    → "한의원"
-- 시술    → "피부과,미용클리닉"
-- 심리    → "심리상담센터,정신건강의학과"
-- 호르몬  → "내분비내과,산부인과"
-- 체형    → "도수치료,필라테스,교정치료"
-- 운동    → "헬스장,PT센터,스포츠센터"
-- 식단    → "영양상담,다이어트식단,도시락"
-- 관리    → "비만클리닉,체중관리센터"
-- 약물    → "약국,한약방"
-- 철학    → "코칭센터,멘탈코칭,라이프코칭"
-- 회복    → "마사지,스파,재활의학과"
