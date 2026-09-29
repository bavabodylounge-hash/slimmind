-- migration 0078: AI 7P 기질 맥락층 + 잔혹사 피날레 필드 추가
--
--  7P 슬롯:
--   mental_intro    = 도입 문단 (80~140자, 오행·MBTI·답 융합)
--   insight_ctx_0   = 인사이트1 (80~140자, 오행 각도)
--   insight_ctx_1   = 인사이트2 (80~140자, MBTI 각도)
--   insight_ctx_2   = 인사이트3 (80~140자, 그 사람 답 각도)
--   know_close      = 닫는 문단 (90~150자, "혼자 들고 있던 패턴을 12주가 같이")
--   ai_7p_src       = 소스: 'claude' | 'wardrobe_v4'
--   ai_7p_at        = 굽기 완료 시각
--
--  잔혹사 슬롯:
--   finale_body     = 피날레 문단 (100~180자)
--   ai_cruel_src    = 소스: 'claude' | 'wardrobe_v4'
--   ai_cruel_at     = 굽기 완료 시각

ALTER TABLE diagnosis_results ADD COLUMN mental_intro TEXT;
ALTER TABLE diagnosis_results ADD COLUMN insight_ctx_0 TEXT;
ALTER TABLE diagnosis_results ADD COLUMN insight_ctx_1 TEXT;
ALTER TABLE diagnosis_results ADD COLUMN insight_ctx_2 TEXT;
ALTER TABLE diagnosis_results ADD COLUMN know_close TEXT;
ALTER TABLE diagnosis_results ADD COLUMN ai_7p_src TEXT DEFAULT 'wardrobe_v4';
ALTER TABLE diagnosis_results ADD COLUMN ai_7p_at DATETIME;

ALTER TABLE diagnosis_results ADD COLUMN finale_body TEXT;
ALTER TABLE diagnosis_results ADD COLUMN ai_cruel_src TEXT DEFAULT 'wardrobe_v4';
ALTER TABLE diagnosis_results ADD COLUMN ai_cruel_at DATETIME;
