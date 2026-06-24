-- V4.1: diagnosis_results 테이블 — 설문 완료 후 기질+닉네임 데이터 저장
-- 기존 results 테이블과 별도로 새 파이프라인 결과 저장

CREATE TABLE IF NOT EXISTS diagnosis_results (
  id TEXT PRIMARY KEY,                  -- UUID — result_id로 사용
  user_name TEXT NOT NULL,              -- 고객 이름
  bc_nickname TEXT,                     -- 확정 바디코드 닉네임 (getNickname 결과)
  bc_primary TEXT,                      -- BC코드 1순위 (BC1~BC17)
  bc_secondary TEXT,                    -- BC코드 2순위
  top3_axes TEXT,                       -- JSON: ["A07","A08","A01"]
  axis_scores TEXT,                     -- JSON: {"A01":8,"A02":3,...}
  region TEXT,                          -- 복부/하체/상체/전신
  texture TEXT,                         -- 단단/물렁/셀룰/부종
  bg_filter TEXT DEFAULT '',            -- birth/meno/drug/PCOS/""
  ohaeng_type TEXT,                     -- 목형/화형/토형/금형/수형
  mbti_full TEXT,                       -- INFP/ISTJ 등 4축 조합
  disp_answers TEXT,                    -- JSON: 기질 설문 원본 답변
  ref_code TEXT,                        -- 유입 컨설턴트/B2B 코드 (없으면 NULL)
  completed_at TEXT,                    -- 설문 완료 시각 (ISO 8601)
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_ref_code ON diagnosis_results(ref_code);
CREATE INDEX IF NOT EXISTS idx_diagnosis_bc_nickname ON diagnosis_results(bc_nickname);
CREATE INDEX IF NOT EXISTS idx_diagnosis_created_at ON diagnosis_results(created_at);
