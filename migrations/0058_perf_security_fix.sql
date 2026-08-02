-- =====================================================================
-- Migration 0058: 성능·보안 선제 점검 수정
-- 2026-08-02
-- =====================================================================

-- [결함②] consultant_feedbacks 인덱스 추가
-- B2B 파트너 피드백 조회 시 session_id, b2b_code 풀스캔 방지
CREATE INDEX IF NOT EXISTS idx_cf_session_id
  ON consultant_feedbacks (session_id);

CREATE INDEX IF NOT EXISTS idx_cf_b2b_code
  ON consultant_feedbacks (b2b_code);

CREATE INDEX IF NOT EXISTS idx_cf_b2b_session
  ON consultant_feedbacks (b2b_code, session_id, is_read);

-- [추가] diagnosis_results ref_code + created_at 복합 인덱스
-- B2B 통계 쿼리: WHERE ref_code=? AND created_at >= ... 에 최적화
CREATE INDEX IF NOT EXISTS idx_diagnosis_ref_created
  ON diagnosis_results (ref_code, created_at DESC);

-- [추가] hospital_responses ref_code + created_at 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_hospital_ref_created
  ON hospital_responses (ref_code, created_at DESC);
