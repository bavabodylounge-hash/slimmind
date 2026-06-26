-- ══════════════════════════════════════════════════
--  SlimMind V4.2 — 돌발 퀴즈 쿠폰 자동 발급 테이블
--  0034: coupons 테이블 생성
--
--  흐름:
--    1. 사용자가 퀴즈 정답 → 전화번호 입력 → "쿠폰 받기" 클릭
--    2. POST /api/coupon/issue 호출
--    3. 동일 번호 중복 체크 → 재발급 방지 (기존 코드 반환)
--    4. 신규: SM-XXXX-XXXX 유니크 코드 생성 → D1 저장 → 코드 반환
--    5. 프론트에서 코드 화면 표시
-- ══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coupons (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  phone        TEXT NOT NULL,                           -- 수신 전화번호 (010-XXXX-XXXX)
  coupon_code  TEXT UNIQUE NOT NULL,                    -- 쿠폰 코드 (SM-XXXX-XXXX)
  quiz_type    TEXT DEFAULT 'arm_fat',                  -- 퀴즈 종류 (확장성 고려)
  is_duplicate INTEGER DEFAULT 0,                       -- 1: 동일 번호 재접속 (재발급 X)
  used         INTEGER DEFAULT 0,                       -- 0: 미사용, 1: 사용완료
  used_at      TEXT DEFAULT NULL,                       -- 사용 일시
  issued_at    TEXT DEFAULT (datetime('now'))           -- 발급 일시
);

-- 전화번호 인덱스 (중복 체크 빠르게)
CREATE INDEX IF NOT EXISTS idx_coupons_phone ON coupons(phone);

-- 쿠폰 코드 인덱스 (조회 빠르게)
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(coupon_code);

-- 발급일 인덱스 (관리자 목록 조회용)
CREATE INDEX IF NOT EXISTS idx_coupons_issued ON coupons(issued_at);
