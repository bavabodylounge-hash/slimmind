-- ══════════════════════════════════════════════════════════════
--  0067: bc_prescriptions_b2b — B2B 업종별 전용 처방 설계도 테이블
--  복합키: bc_code + survey_category
--  survey_category: 'hospital' | 'fitness' | 'aesthetic' | 'salon'
--
--  설계 원칙:
--    1. 공통 처방(bc_prescriptions)을 상속하되 업종별 필드를 오버라이드
--    2. 업종별 전용 처방 필드 추가 (hospital_tests, fitness_program 등)
--    3. 결과지 API: bc_prescriptions_b2b 우선 조회 → 없으면 bc_prescriptions 폴백
--    4. 재검수: survey_category 기반으로 이 테이블과 1:1 대조
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS bc_prescriptions_b2b (
  -- ── 복합 기본키 ──────────────────────────────────────────────
  bc_code          TEXT NOT NULL,          -- 'BC-1' ~ 'BC-16'
  survey_category  TEXT NOT NULL,          -- 'hospital' | 'fitness' | 'aesthetic' | 'salon'

  -- ── 공통 오버라이드 필드 (bc_prescriptions 상속) ─────────────
  brand_name                TEXT,          -- 업종별 커스텀 브랜드명 (없으면 공통 사용)
  bc_primary_oneline_reason TEXT,          -- 업종별 1줄 원인 (없으면 공통 사용)
  bc_cause_story            TEXT,          -- 업종별 원인 스토리
  closing_copy              TEXT,          -- 업종별 클로징 카피

  -- ── p3 해석 스토리 업종 맞춤 ──────────────────────────────────
  story_lead_b2b   TEXT,                   -- 업종별 story_lead 오버라이드
  clinical_ctx_b2b TEXT,                   -- 업종별 임상 맥락

  -- ── p5 처방 계획 업종 맞춤 ────────────────────────────────────
  recommended_exercises_json TEXT,         -- 업종별 추천 운동 (없으면 공통)
  forbidden_exercises_json   TEXT,         -- 업종별 금지 운동
  recommended_foods_json     TEXT,         -- 업종별 추천 식품
  forbidden_foods_json       TEXT,         -- 업종별 금지 식품
  supplement_list_json       TEXT,         -- 업종별 보충제
  lifestyle_rules_json       TEXT,         -- 업종별 생활수칙

  -- ── [병원 전용] hospital 섹션 ─────────────────────────────────
  -- p5 병원 처방: 비급여 시술 1~3순위
  hospital_treatments_json  TEXT,          -- [{"rank":1,"name":"카복시테라피","reason":"...","sessions":"..."}]
  -- p5 병원: 권장 검사
  hospital_tests_json        TEXT,          -- [{"name":"체성분검사","reason":"...","timing":"..."}]
  -- p5 병원: 재검진 스케줄
  hospital_reassessment_json TEXT,          -- {"week4":"...", "week8":"...", "week12":"..."}
  -- p5 병원: 원내 주의사항
  hospital_caution_json      TEXT,          -- [{"item":"...","reason":"..."}]

  -- ── [피트니스 전용] fitness 섹션 ──────────────────────────────
  -- p5 피트니스: 주간 운동 플랜
  fitness_weekly_plan_json   TEXT,          -- [{"day":"월","type":"...","duration":"...","intensity":"..."}]
  -- p5 피트니스: HIIT 프로토콜
  fitness_hiit_protocol_json TEXT,          -- {"available_from_week":"6","intervals":"...","rest":"..."}
  -- p5 피트니스: Zone2 심박수
  fitness_zone2_bpm          INTEGER,       -- 목표 심박수 (예: 130)
  -- p5 피트니스: 센터 추천 프로그램
  fitness_center_program_json TEXT,         -- [{"name":"PT 12회","description":"...","target":"..."}]
  -- p5 피트니스: 측정 지표
  fitness_metrics_json       TEXT,          -- [{"metric":"체지방률","target":"...","period":"..."}]

  -- ── [에스테틱 전용] aesthetic 섹션 ───────────────────────────
  -- p5 에스테틱: 1차 추천 시술
  aesthetic_primary_json     TEXT,          -- [{"name":"카복시테라피","reason":"...","sessions":"...","interval":"..."}]
  -- p5 에스테틱: 2차 보조 시술
  aesthetic_secondary_json   TEXT,          -- [{"name":"메조테라피","reason":"...","sessions":"..."}]
  -- p5 에스테틱: 시술 금기사항
  aesthetic_contraindication TEXT,          -- [{"item":"...","reason":"..."}]
  -- p5 에스테틱: 홈케어 루틴
  aesthetic_homecare_json    TEXT,          -- [{"step":"...","product_type":"...","timing":"..."}]
  -- p5 에스테틱: 다음 방문 권고 일정
  aesthetic_visit_schedule_json TEXT,       -- {"week2":"...","week4":"...","week8":"..."}

  -- ── [미용실/살롱 전용] salon 섹션 ─────────────────────────────
  -- p5 살롱: 두피/모발 상태 진단
  salon_scalp_diagnosis_json TEXT,          -- [{"symptom":"...","cause":"...","bc_link":"..."}]
  -- p5 살롱: 추천 트리트먼트
  salon_treatment_json       TEXT,          -- [{"name":"두피 스케일링","reason":"...","frequency":"..."}]
  -- p5 살롱: 홈케어 샴푸/오일 성분
  salon_homecare_ingredients_json TEXT,     -- {"shampoo":["..."],"conditioner":["..."],"avoid":["..."]}
  -- p5 살롱: 헤어스타일 추천
  salon_hairstyle_json       TEXT,          -- [{"style":"...","reason":"...","avoid":"..."}]
  -- p5 살롱: 두피 식단 연계
  salon_scalp_diet_json      TEXT,          -- [{"food":"...","benefit":"..."}]

  -- ── 메타 ────────────────────────────────────────────────────
  is_active   INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now')),
  updated_by  TEXT DEFAULT 'system',
  version     TEXT DEFAULT 'v1.0',
  notes       TEXT,                          -- 편집 메모

  PRIMARY KEY (bc_code, survey_category)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_bc_presc_b2b_category ON bc_prescriptions_b2b (survey_category);
CREATE INDEX IF NOT EXISTS idx_bc_presc_b2b_bc_code  ON bc_prescriptions_b2b (bc_code);
