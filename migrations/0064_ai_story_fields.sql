-- migration 0064: AI 서사 생성 필드 추가 (story_lead, clinical_ctx)
-- 설계도 §5 OUTPUT 스펙:
--   story_lead  = Claude가 생성한 서사문 (250~350자) 또는 옷장v4 폴백
--   clinical_ctx = Claude가 생성한 소견 개인 맥락 (80~140자) 또는 옷장v4 폴백
--   ai_story_src = 소스 구분: 'claude' | 'wardrobe_v4' (폴백)
--   ai_story_at  = 굽기 완료 시각 (재발급=저장본 원칙)

ALTER TABLE diagnosis_results ADD COLUMN story_lead TEXT;
ALTER TABLE diagnosis_results ADD COLUMN clinical_ctx TEXT;
ALTER TABLE diagnosis_results ADD COLUMN ai_story_src TEXT DEFAULT 'wardrobe_v4';
ALTER TABLE diagnosis_results ADD COLUMN ai_story_at DATETIME;
