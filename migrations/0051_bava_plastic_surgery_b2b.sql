-- Migration 0051: 바바성형외과 B2B 파트너 등록
-- code: B2B-BAVA1234 / 초기 비밀번호: bava1234

INSERT OR IGNORE INTO b2b_partners (
  id,
  code,
  name,
  type,
  brand_name,
  brand_color,
  password_hash,
  status,
  memo,
  created_at,
  updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'B2B-BAVA1234',
  '바바성형외과',
  '성형외과',
  '바바성형외과',
  '#C9A882',
  'bava1234',
  'active',
  '바바성형외과 슬림마인드 B2B 파트너 — 설문 URL: /h/B2B-BAVA1234',
  datetime('now'),
  datetime('now')
);
