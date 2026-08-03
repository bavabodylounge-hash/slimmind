-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 0059: mapping_schema_versions — 매핑 파이프라인 버전 관리 테이블
--
-- [목적]
--   S1→S4 응답 데이터를 P1~P10 결과지로 변환하는 매핑 엔진의 버전을 DB에 기록.
--   결과지 재조회 시 클라이언트가 자신이 렌더링한 엔진 버전과 DB의 현재 버전을
--   비교하여 불일치 시 최신 로직으로 재연산(Live Refresh)을 트리거한다.
--
-- [Live Refresh 흐름]
--   1. /api/h/result/:id → schema_version 필드 포함하여 응답
--   2. 클라이언트 loadHospitalResult() → window.__MAPPING_ENGINE_VERSION__ 비교
--   3. 불일치 → 강제 재연산 (raw_answers 기반으로 axis_scores/redFlags 재계산)
--   4. 일치 → 기존 연산값 신뢰 사용
--
-- [확장 규칙]
--   - survey_type: 'hospital' | 'aesthetic' | 'fitness' | 'common'
--   - version: 'v1.0' 형식 (major.minor)
--   - pipeline_hash: 파이프라인 변경 감지용 체크섬 (선택)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mapping_schema_versions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_type   TEXT    NOT NULL DEFAULT 'hospital',  -- 'hospital'|'aesthetic'|'fitness'|'common'
  version       TEXT    NOT NULL,                     -- 'v1.0', 'v1.1', ...
  label         TEXT    NOT NULL,                     -- 사람이 읽는 이름
  description   TEXT,                                 -- 변경 내역 요약
  pipeline_hash TEXT,                                 -- 파이프라인 체크섬 (선택)
  is_active     INTEGER NOT NULL DEFAULT 1,           -- 1=현행 버전, 0=구버전
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_msv_type_active
  ON mapping_schema_versions(survey_type, is_active);

-- ═══════════════════════════════════════════════════════════════════════════
-- v1.0 Standard 레코드 삽입
-- 이번 세션에서 확정된 S1~S4 ↔ P1~P10 전체 1:1 매핑 명세서 기준
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR IGNORE INTO mapping_schema_versions
  (survey_type, version, label, description, pipeline_hash, is_active)
VALUES
  (
    'hospital',
    'v1.0',
    'Hospital Survey Standard v1.0',
    'S1_BASE(Q01~Q11)+HF_S1_DEEP/BANK/ZONE+S2(Q01~Q16)+S3(gi:0~36)+S4(STAGE4_BANK+DEFAULT)+DISP-FB(gi:35~36 proxy) → P1~P10. redFlags(PCOS/DIABETES/THYROID/STEROID/FATTY_LIVER/YOYO/APPETITE_SUPP). axisScores A01~A10. bcCode BC-1~BC-16. desire(who/moodLabel/partLabels).',
    'a3f8c2d1',  -- 파이프라인 식별 해시 (매핑 명세서 2026-08-03 기준)
    1
  ),
  (
    'aesthetic',
    'v1.0',
    'Aesthetic Survey Standard v1.0',
    'result-aesthetic.html 기반 파이프라인. stage3 gi proxy 교체(2026-08). Hospital v1.0과 동일 엔진 프레임워크 사용.',
    'b7e4f9a2',
    1
  ),
  (
    'fitness',
    'v1.0',
    'Fitness Survey Standard v1.0',
    'result-fitness.html 기반 파이프라인. Hospital v1.0 프레임워크 계승 예정.',
    'c5d2e8b3',
    1
  ),
  (
    'common',
    'v1.0',
    'Common Mapping Engine v1.0',
    'bc-engine.js + mapping-engine.js 공통 모듈. 모든 survey_type에서 동일하게 사용되는 코어 연산 엔진.',
    'd9a1f4c6',
    1
  );
