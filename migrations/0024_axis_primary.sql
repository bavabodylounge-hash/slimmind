-- v5.0 axis_primary 컬럼 추가
-- bc_primary는 NOT NULL 제약 때문에 SQLite에서 직접 변경 불가
-- → axis_primary / axis_secondary 컬럼을 신규 추가
-- → bc_primary는 기존 호환성 유지 (axis ID로 채움)

ALTER TABLE results ADD COLUMN axis_primary TEXT;
ALTER TABLE results ADD COLUMN axis_secondary TEXT;
ALTER TABLE results ADD COLUMN axis_primary_score INTEGER;

-- 기존 bc_primary 데이터를 axis_primary로 복사 (이미 axis ID가 있는 경우)
UPDATE results
  SET axis_primary = bc_primary
  WHERE bc_primary LIKE 'A%'
    AND axis_primary IS NULL;
