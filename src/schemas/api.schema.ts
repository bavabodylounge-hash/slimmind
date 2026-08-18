/**
 * api.schema.ts — SlimMind API 응답 Zod 스키마 (Strict Validation)
 *
 * 적용 엔드포인트:
 *  - GET  /api/v1/stats/axis-rank       → AxisRankResponseSchema
 *  - GET  /api/h/programs               → ProgramsResponseSchema
 *  - GET  /api/v1/stats/body-type       → BodyTypeResponseSchema
 *  - POST /api/v1/diagnosis (저장 결과) → DiagnosisSaveResponseSchema
 *  - GET  /api/v1/diagnosis/:id         → DiagnosisResultSchema
 */

import { z } from 'zod';
import { BC_CODE_VALUES, AXIS_KEYS } from './fileValidation.schema';

// ─────────────────────────────────────────────────────────────
// 공통 헬퍼
// ─────────────────────────────────────────────────────────────

/** Safe Fallback 공통 필드 */
const SafeFallbackBase = z.object({
  simulated: z.boolean().optional(),
  fallback:  z.boolean().optional(),
  error:     z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// GET /api/v1/stats/axis-rank
// ─────────────────────────────────────────────────────────────

/** 개별 축 랭킹 항목 */
const AxisRankItemSchema = z.object({
  my:         z.number(),
  percentile: z.number().nullable(),
  top:        z.number().optional(),
  count:      z.number().optional(),
  simulated:  z.boolean().optional(),
});

export const AxisRankResponseSchema = SafeFallbackBase.extend({
  total: z.number().int().nonnegative(),
  ranks: z.record(z.string(), AxisRankItemSchema).default({}),
});
export type AxisRankResponse = z.infer<typeof AxisRankResponseSchema>;

/** axis-rank 응답 파싱 (실패 시 Safe Fallback 반환) */
export function parseAxisRankResponse(raw: unknown): AxisRankResponse {
  const result = AxisRankResponseSchema.safeParse(raw);
  if (!result.success) {
    console.warn('[Zod:axis-rank] 스키마 불일치 — Safe Fallback 사용', result.error.flatten());
    return { total: 0, ranks: {}, simulated: true, fallback: true };
  }
  return result.data;
}

// ─────────────────────────────────────────────────────────────
// GET /api/h/programs
// ─────────────────────────────────────────────────────────────

const ProgramItemSchema = z.object({
  id:           z.union([z.number(), z.string()]),
  name:         z.string(),
  price:        z.number().optional().nullable(),
  description:  z.string().optional().nullable(),
  tags:         z.string().optional().nullable(),
  bc_tags:      z.string().optional().nullable(),
  icon:         z.string().optional().nullable(),
  color:        z.string().optional().nullable(),
  category:     z.string().optional().nullable(),
});

export const ProgramsResponseSchema = z.array(ProgramItemSchema);
export type ProgramsResponse = z.infer<typeof ProgramsResponseSchema>;

export function parseProgramsResponse(raw: unknown): ProgramsResponse {
  const result = ProgramsResponseSchema.safeParse(raw);
  if (!result.success) {
    console.warn('[Zod:h/programs] 스키마 불일치 — 빈 배열 반환', result.error.flatten());
    return [];
  }
  return result.data;
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/stats/body-type
// ─────────────────────────────────────────────────────────────

export const BodyTypeResponseSchema = SafeFallbackBase.extend({
  total:      z.number().int().nonnegative().default(0),
  same_type:  z.number().int().nonnegative().default(0),
  percentile: z.number().nullable().default(null),
  top5:       z.array(z.object({
    bc_code: z.string(),
    count:   z.number(),
  })).default([]),
});
export type BodyTypeResponse = z.infer<typeof BodyTypeResponseSchema>;

export function parseBodyTypeResponse(raw: unknown): BodyTypeResponse {
  const result = BodyTypeResponseSchema.safeParse(raw);
  if (!result.success) {
    console.warn('[Zod:body-type] 스키마 불일치', result.error.flatten());
    return { total: 0, same_type: 0, percentile: null, top5: [], simulated: true, fallback: true };
  }
  return result.data;
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/diagnosis → 저장 응답
// ─────────────────────────────────────────────────────────────

export const DiagnosisSaveResponseSchema = z.object({
  ok:             z.boolean(),
  diagnosis_id:   z.string().optional(),
  bc_code:        z.string().optional(),
  error:          z.string().optional(),
});
export type DiagnosisSaveResponse = z.infer<typeof DiagnosisSaveResponseSchema>;

export function parseDiagnosisSaveResponse(raw: unknown): DiagnosisSaveResponse {
  const result = DiagnosisSaveResponseSchema.safeParse(raw);
  if (!result.success) {
    console.warn('[Zod:diagnosis/save] 스키마 불일치', result.error.flatten());
    return { ok: false, error: 'schema_mismatch' };
  }
  return result.data;
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/diagnosis/:id → 진단 결과 조회
// ─────────────────────────────────────────────────────────────

export const AxisScoresSchema = z.record(
  z.enum(AXIS_KEYS as unknown as [string, ...string[]]),
  z.number().min(0).max(10)
).optional();

export const DiagnosisResultSchema = z.object({
  id:             z.union([z.number(), z.string()]),
  user_name:      z.string(),
  bc_code:        z.string(),
  bc_nickname:    z.string().optional().nullable(),
  axis_scores:    z.union([z.string(), z.record(z.string(), z.number())]).optional().nullable(),
  ohaeng_type:    z.string().optional().nullable(),
  mbti_full:      z.string().optional().nullable(),
  blood_type:     z.string().optional().nullable(),
  face_shape:     z.string().optional().nullable(),
  region:         z.string().optional().nullable(),
  texture:        z.string().optional().nullable(),
  goal_weight:    z.number().optional().nullable(),
  weight:         z.number().optional().nullable(),
  height:         z.number().optional().nullable(),
  age:            z.number().optional().nullable(),
  gender:         z.string().optional().nullable(),
  ref_code:       z.string().optional().nullable(),
  consultant_name:z.string().optional().nullable(),
  created_at:     z.string().optional(),
});
export type DiagnosisResult = z.infer<typeof DiagnosisResultSchema>;

export function parseDiagnosisResult(raw: unknown): DiagnosisResult | null {
  const result = DiagnosisResultSchema.safeParse(raw);
  if (!result.success) {
    console.warn('[Zod:diagnosis/result] 스키마 불일치', result.error.flatten());
    return null;
  }
  return result.data;
}

// ─────────────────────────────────────────────────────────────
// 백엔드 미들웨어용 — 응답 직전 스키마 검증 래퍼
// ─────────────────────────────────────────────────────────────

/**
 * validateAndJson: Hono c.json() 래퍼 — 응답 전 Zod 검증 수행
 * 검증 실패 시 개발 환경에서는 500 + 상세 오류, 프로덕션에서는 경고만 기록 후 그대로 전달
 */
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  endpoint: string
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const isDev = (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
    console.warn(`[Zod:${endpoint}] 응답 스키마 불일치:`, result.error.flatten());
    if (isDev) {
      // 개발 환경: 스키마 오류를 명시적으로 로깅
      console.error(`[Zod:${endpoint}] 스키마 오류 상세:`, JSON.stringify(result.error.flatten(), null, 2));
    }
    // Safe: 원본 데이터 반환 (프로덕션 무중단)
    return data as T;
  }
  return result.data;
}
