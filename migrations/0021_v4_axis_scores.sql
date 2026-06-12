-- v4.0 Plan A 통합 — 10축 분석 결과 컬럼 추가
-- results 테이블에 axis_scores_json, top_axes_json 컬럼 추가

ALTER TABLE results ADD COLUMN axis_scores_json TEXT;
ALTER TABLE results ADD COLUMN top_axes_json TEXT;
