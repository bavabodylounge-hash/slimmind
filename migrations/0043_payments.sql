-- ══════════════════════════════════════════════════
--  SlimMind — 토스페이먼츠 결제 내역 테이블
--  0043: payments 테이블 생성
-- ══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS payments (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id        TEXT UNIQUE NOT NULL,         -- 주문 ID (toss 요청용, UUID)
  consultant_code TEXT NOT NULL,               -- 결제한 컨설턴트 코드
  plan            TEXT NOT NULL,               -- 'monthly' | 'yearly'
  amount          INTEGER NOT NULL,            -- 결제 금액 (원)
  status          TEXT DEFAULT 'pending',      -- pending / paid / failed / cancelled
  payment_key     TEXT,                        -- 토스 payment_key (승인 후 세팅)
  method          TEXT,                        -- 카드 / 가상계좌 / 간편결제 등
  approved_at     TEXT,                        -- 승인 일시
  extend_months   INTEGER NOT NULL DEFAULT 1,  -- 구독 연장 개월 수
  prev_end_date   TEXT,                        -- 결제 전 subscription_end
  new_end_date    TEXT,                        -- 결제 후 subscription_end
  raw_response    TEXT,                        -- 토스 응답 전체 JSON
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_consultant ON payments(consultant_code);
CREATE INDEX IF NOT EXISTS idx_payments_order_id   ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status     ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created    ON payments(created_at);
