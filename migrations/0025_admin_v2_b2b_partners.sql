-- ══════════════════════════════════════════════════
--  SlimMind 관리자 V2 마이그레이션
--  b2b_partners, bc_interpretation, bc_partner_view
--  survey_sessions ref_code 추가
-- ══════════════════════════════════════════════════

-- ① B2B 파트너 테이블 (화이트라벨 포함)
CREATE TABLE IF NOT EXISTS b2b_partners (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code              TEXT UNIQUE NOT NULL,        -- B2B-AES-001
  name              TEXT NOT NULL,               -- 영업장명
  type              TEXT,                        -- 에스테틱/필라테스/한의원/헬스장
  owner_name        TEXT,                        -- 원장 이름
  phone             TEXT,
  email             TEXT UNIQUE,
  address           TEXT,
  password_hash     TEXT,
  commission_rate   REAL DEFAULT 15.0,
  status            TEXT DEFAULT 'pending',      -- pending/active/suspended
  -- 화이트라벨 브랜딩
  brand_logo_url    TEXT,                        -- 로고 이미지 URL
  brand_color       TEXT DEFAULT '#6366f1',      -- 브랜드 컬러 HEX
  brand_name        TEXT,                        -- 브랜드명 (없으면 name 사용)
  -- 통계
  qr_scan_count     INTEGER DEFAULT 0,
  staff_count       INTEGER DEFAULT 0,
  memo              TEXT,
  first_login_at    TEXT,
  created_at        TEXT DEFAULT (datetime('now')),
  updated_at        TEXT DEFAULT (datetime('now'))
);

-- ② 컨설턴트 해석 자료 테이블 (마스터만 수정)
CREATE TABLE IF NOT EXISTS bc_interpretation (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  bc_nickname       TEXT UNIQUE NOT NULL,        -- '호르몬스위치 갱년기형' 등 30개
  core_summary      TEXT,                        -- 핵심 요약 2~3줄
  opening_line      TEXT,                        -- 추천 오프닝 멘트
  consult_questions TEXT,                        -- 추가 질문 3가지 (JSON 배열)
  recommend_program TEXT,                        -- 추천 프로그램
  caution_note      TEXT,                        -- 주의사항
  homework          TEXT,                        -- 고객 숙제(행동 미션)
  updated_by        TEXT,
  updated_at        TEXT DEFAULT (datetime('now'))
);

-- ③ B2B 파트너 뷰 테이블 (고객 검색 결과 핵심 3줄)
CREATE TABLE IF NOT EXISTS bc_partner_view (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  bc_nickname       TEXT UNIQUE NOT NULL,
  recommend_1st     TEXT,                        -- 1순위 추천 서비스 + 이유
  recommend_2nd     TEXT,                        -- 2순위 추천 서비스 + 이유
  forbidden         TEXT,                        -- 금기 서비스 + 이유
  expected_price    INTEGER DEFAULT 0,           -- 예상 객단가 (원)
  updated_at        TEXT DEFAULT (datetime('now'))
);

-- ④ results 테이블에 ref 컬럼 추가
ALTER TABLE results ADD COLUMN ref_code TEXT;
ALTER TABLE results ADD COLUMN ref_type TEXT DEFAULT 'DIRECT'; -- DIRECT/CONSULTANT/B2B

-- ⑤ 컨설턴트 테이블에 commission_rate, grade 표준화
ALTER TABLE consultants ADD COLUMN commission_rate REAL DEFAULT 15.0;
ALTER TABLE consultants ADD COLUMN monthly_complete INTEGER DEFAULT 0;

-- ⑥ 이탈 알림 로그
CREATE TABLE IF NOT EXISTS churn_alerts (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  result_id     TEXT NOT NULL,
  alert_type    TEXT NOT NULL,     -- D3/D21/PERIOD/D30
  sent_at       TEXT DEFAULT (datetime('now')),
  consultant_code TEXT,
  is_actioned   INTEGER DEFAULT 0  -- 컨설턴트가 조치했는지
);

-- ⑦ B2B 커스텀 프로그램
CREATE TABLE IF NOT EXISTS b2b_custom_programs (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  b2b_code      TEXT NOT NULL,
  program_name  TEXT NOT NULL,
  price         INTEGER DEFAULT 0,
  description   TEXT,
  tags          TEXT,              -- JSON: ["림프","고주파","필라테스"]
  created_at    TEXT DEFAULT (datetime('now'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_b2b_partners_code ON b2b_partners(code);
CREATE INDEX IF NOT EXISTS idx_b2b_partners_status ON b2b_partners(status);
CREATE INDEX IF NOT EXISTS idx_bc_interpretation_nickname ON bc_interpretation(bc_nickname);
CREATE INDEX IF NOT EXISTS idx_bc_partner_view_nickname ON bc_partner_view(bc_nickname);
CREATE INDEX IF NOT EXISTS idx_results_ref_code ON results(ref_code);
CREATE INDEX IF NOT EXISTS idx_churn_alerts_result ON churn_alerts(result_id);

-- ⑧ 기본 bc_partner_view 30개 닉네임 초기 데이터
INSERT OR IGNORE INTO bc_partner_view (bc_nickname, recommend_1st, recommend_2nd, forbidden, expected_price) VALUES
('호르몬스위치 갱년기형','고주파 심부열 테라피 — 갱년기 에스트로겐 저하로 굳은 지방층을 열로 풀어줍니다','림프 드레나쥐 — 호르몬 변화로 정체된 하체 림프를 순환시킵니다','고강도 근력 운동 — 코르티솔 추가 분비로 복부지방 악화',150000),
('스트레스성 야식부엉이형','두피·경추 이완 마사지 — 코르티솔 억제 효과가 즉각적입니다','아로마 림프 마사지 — 부교감 신경 활성화로 야식 충동 감소','야간 사우나 — 코르티솔 분비 리듬을 더 교란합니다',120000),
('식후기절 혈당롤러코스터형','인바디 정밀 체성분 분석 — 인슐린 저항성 패턴 파악 필수','저주파 EMS 복부 자극 — 인슐린 감수성 개선에 효과적','고강도 유산소 단독 — 혈당 급락으로 폭식 유발',130000),
('오후만되면 코끼리다리형','공기압 하체 순환 마사지 — 림프 정체 즉각 해소','냉온 교대 족욕 테라피 — 하지 정맥 순환 개선','열 치료 단독 — 부종 일시 악화 가능',100000),
('털털한 PCOS형','호르몬 균형 한방 테라피 — PCOS 개선에 임상 검증','저주파 난소 자극 프로그램 — 배란 유도 보조','고강도 HIIT — 안드로겐 추가 분비로 PCOS 악화',140000),
('여름에도 시린 얼음장형','온열 복부 집중 테라피 — 냉증 개선 핵심','경락 마사지 + 쑥뜸 — 기혈 순환 회복','냉각 지방분해 시술 — 체온 저하로 냉증 악화',110000),
('출산후 바람빠진 풍선형','복압 회복 코어 필라테스 — 출산 후 복압 재건 전문','산후 림프 드레나쥐 — 산후 부종 집중 관리','고강도 복근 운동 — 복압 손상 위험',160000),
('스트레스기절 번아웃형','부신 회복 아로마 테라피 — 번아웃 부신 피로 회복','명상 + 산소 테라피 — 자율신경 회복','고강도 운동 전체 — 부신 추가 소진',130000),
('동시다발 다중악순환형','정밀 인바디 + 호르몬 패널 검사 연계','복합 순환 테라피 (림프+온열+EMS 복합)','단일 집중 프로그램 — 복합 원인 해결 불가',180000);

-- ⑨ 기본 bc_interpretation 초기 데이터
INSERT OR IGNORE INTO bc_interpretation (bc_nickname, core_summary, opening_line, consult_questions, recommend_program, caution_note, homework) VALUES
('호르몬스위치 갱년기형',
 '갱년기 에스트로겐 감소로 지방 분포가 하체→복부로 이동한 케이스입니다. 의지 문제가 아닌 호르몬 전환기의 생리적 변화입니다.',
 '지현님, 열심히 하셨는데 살이 안 빠진 이유가 드디어 나왔어요. 의지가 부족하신 게 아니라 호르몬이 바뀌는 시기에 몸이 적응 중인 거예요.',
 '["최근 1~2년 사이 복부에 살이 갑자기 늘었나요?","열감이나 수면 변화가 있으셨나요?","이전에 효과 있던 다이어트가 갑자기 안 되기 시작한 시기가 언제였나요?"]',
 '호르몬 균형 식단 + 고주파 심부열 테라피 + 림프 드레나쥐 패키지',
 '고강도 운동 절대 금지. 코르티솔 자극 시 복부지방 악화. 칼로리 제한보다 호르몬 안정이 먼저.',
 '매일 아침 햇빛 10분 + 저녁 마그네슘 200mg 복용 + 취침 11시 이전 고정'),
('스트레스성 야식부엉이형',
 '만성 스트레스로 코르티솔이 저녁에 폭발하여 야식 충동을 만드는 케이스입니다. 배고픔이 아닌 뇌의 가짜 허기입니다.',
 '지현님이 밤에 드시는 건 의지력이 약해서가 아니에요. 코르티솔이 뇌에 가짜 허기 신호를 보내는 거라서, 이걸 먼저 잡아야 해요.',
 '["하루 중 가장 스트레스 받는 시간대가 언제예요?","밤에 먹고 나서 죄책감이 심한 편인가요?","수면이 5시간 이하인 날이 일주일에 며칠이나 되나요?"]',
 '코르티솔 억제 아로마 마사지 + 수면 개선 프로그램',
 '저녁 고강도 운동 금지. 오후 2시 이후 카페인 금지. 야식 대체 전략으로 접근.',
 '저녁 9시 알람 설정 → 스마트폰 끄기 + 트립토판 간식(바나나 1개) 준비');
