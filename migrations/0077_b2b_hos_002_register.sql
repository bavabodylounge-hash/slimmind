-- [BUG-FIX 20260909] BUG-F: B2B-HOS-002 파트너 테이블 미등록 수정
-- 재검수 Center에서 "B2B 파트너 테이블에 없음" 경고 표시 방지
-- INSERT OR IGNORE → 이미 존재하면 무시

INSERT OR IGNORE INTO b2b_partners
  (id, code, name, brand_name, survey_category, status, type, created_at, updated_at)
VALUES
  (lower(hex(randomblob(16))), 'B2B-HOS-002', '슬림마인드 병원파트너 002', '슬림마인드 병원', 'hospital', 'active', '병원', datetime('now'), datetime('now'));
