-- migration 0076: fitness_responses에 body_regions / textures 컬럼 추가
-- 문제: fitness_responses 테이블에 이 컬럼이 없어서 decideSubtype() 재계산 시
--       body_regions/textures를 raw_answers에서만 꺼내야 했고, raw_answers에도 없으면
--       항상 step8(전신 폴백) BC가 계산되는 구조적 버그(BUG-I) 발생.
-- 해결: body_regions(JSON 배열, 영어코드), textures(JSON 배열, 영어코드) 컬럼 추가
--       INSERT 시 prof.region/prof.texture(한글)를 영어코드로 변환하여 저장.
--       diagnosis_results에는 0066 마이그레이션으로 이미 존재함.

ALTER TABLE fitness_responses ADD COLUMN body_regions TEXT DEFAULT NULL;
ALTER TABLE fitness_responses ADD COLUMN textures      TEXT DEFAULT NULL;

-- 인덱스 (BC 재계산 및 검색 성능)
CREATE INDEX IF NOT EXISTS idx_fitness_body_regions ON fitness_responses(body_regions);
