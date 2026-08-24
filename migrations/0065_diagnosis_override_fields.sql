-- migration 0065: 진단 매핑 Override 필드 추가
-- admin 마스터 컨트롤 타워 — 즉시 수정(Override) 기능용
--   override_bc_code  = 마스터가 수동으로 덮어쓴 BC 코드 (예: BC-9)
--   override_story    = 마스터가 수동으로 입력한 결과지 해설본 문구
--   override_applied  = 1이면 Override 이력 있음 (결과지 렌더링 시 우선 적용)
--   override_at       = Override 저장 시각

-- diagnosis_results (신파이프라인)
ALTER TABLE diagnosis_results ADD COLUMN override_bc_code TEXT DEFAULT NULL;
ALTER TABLE diagnosis_results ADD COLUMN override_story TEXT DEFAULT NULL;
ALTER TABLE diagnosis_results ADD COLUMN override_applied INTEGER DEFAULT 0;
ALTER TABLE diagnosis_results ADD COLUMN override_at DATETIME DEFAULT NULL;

-- fitness_responses (피트니스 전용 테이블)
ALTER TABLE fitness_responses ADD COLUMN override_bc_code TEXT DEFAULT NULL;
ALTER TABLE fitness_responses ADD COLUMN override_story TEXT DEFAULT NULL;
ALTER TABLE fitness_responses ADD COLUMN override_applied INTEGER DEFAULT 0;
ALTER TABLE fitness_responses ADD COLUMN override_at DATETIME DEFAULT NULL;

-- diag_id 컬럼 추가 (fitness_responses의 primary key 'id'를 diag_id 별칭으로 조회 지원)
-- fitness_responses.id = diag_id 형식(F-XXXXXXXXXXXXXXX-XXXXX)이므로 별도 컬럼 불필요
-- 하지만 mapping-verify API가 diag_id로 조회할 수 있게 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_fitness_diag_id ON fitness_responses(id);
