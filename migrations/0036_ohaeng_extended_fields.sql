-- V4.6: diagnosis_results에 오행 확장 필드 추가
-- ohaeng_type 단독 저장에서 4개 필드로 확장
-- → 결과지 재조회 시 오행 산출 근거·신뢰도·점수 복원 가능

ALTER TABLE diagnosis_results ADD COLUMN ohaeng_source     TEXT DEFAULT NULL;
-- 오행 판정 근거: 'saju' | 'survey' | 'gq08'

ALTER TABLE diagnosis_results ADD COLUMN ohaeng_confidence INTEGER DEFAULT NULL;
-- 오행 신뢰도 점수: 0~100

ALTER TABLE diagnosis_results ADD COLUMN ohaeng_lacking    TEXT DEFAULT NULL;
-- 부족 오행: '목'|'화'|'토'|'금'|'수'

ALTER TABLE diagnosis_results ADD COLUMN ohaeng_score      TEXT DEFAULT NULL;
-- 오행 점수 JSON: [목,화,토,금,수] 배열 문자열
-- 예: '[12,8,40,5,20]'

CREATE INDEX IF NOT EXISTS idx_diagnosis_ohaeng_source ON diagnosis_results(ohaeng_source);
