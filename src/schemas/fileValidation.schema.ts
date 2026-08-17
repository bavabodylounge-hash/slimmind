/**
 * fileValidation.schema.ts
 *
 * SlimMind 플랫폼 — 업로드 파일 검증 스키마 (Zod 기반)
 *
 * ZIP 분석 결과 확인된 파일 유형:
 *  - 슬림마인드_결과지_설계도.html  (결과지 설계 명세)
 *  - 슬림마인드_[이름]_시연본.html  (개인 결과지 시연본)
 *  - 슬림마인드 병원 3개국어.html   (질문지 HTML)
 *  - 슬림마인드 에스테틱 3개국어.html
 *  - 슬림마인드 미용실 3개국어.html
 *
 * Payload 구조 (POST /api/v1/diagnosis):
 *  user_name, phone, bc_nickname, bc_code_key, top3_axes, axis_scores,
 *  region, texture, ohaeng_type, mbti_full, goal_weight, raw_answers, ...
 */

import { z, type ZodIssue } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// 공통 상수 — SlimMind 도메인 값 목록
// ─────────────────────────────────────────────────────────────────────────────

/** 바디코드 16종 */
export const BC_CODE_VALUES = [
  'BC-1', 'BC-2', 'BC-3', 'BC-4', 'BC-5', 'BC-6',
  'BC-7', 'BC-8', 'BC-9', 'BC-10', 'BC-11', 'BC-12',
  'BC-13', 'BC-14', 'BC-15', 'BC-16',
] as const;
export type BcCode = typeof BC_CODE_VALUES[number];

/** 원인 축 11종 (axis_scores 키) */
export const AXIS_KEYS = [
  'A01', 'A02', 'A03', 'A04', 'A05', 'A06',
  'A07', 'A08', 'A09', 'A10', 'A11',
] as const;
export type AxisKey = typeof AXIS_KEYS[number];

/** 채널(업종) 3종 */
export const SURVEY_CATEGORIES = ['hospital', 'aesthetic', 'fitness'] as const;
export type SurveyCategory = typeof SURVEY_CATEGORIES[number];

/** 부위(region) 선택지 */
export const REGION_VALUES = ['복부', '하체', '상체', '얼굴', '전신'] as const;

/** 질감(texture) 선택지 */
export const TEXTURE_VALUES = ['단단', '물렁', '셀룰', '부종'] as const;

/** 오행 유형 */
export const OHAENG_VALUES = ['목', '화', '토', '금', '수'] as const;

/** 허용 파일 MIME 유형 */
export const ALLOWED_MIME_TYPES = [
  'text/html',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
] as const;

/** 최대 파일 크기 (바이트) */
export const FILE_SIZE_LIMITS = {
  html:        30 * 1024 * 1024,   // 30 MB (3개국어 질문지 최대 15MB × 여유)
  zip:         50 * 1024 * 1024,   // 50 MB
  default:     10 * 1024 * 1024,   // 10 MB
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 1. 업로드 파일 메타데이터 스키마
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 단일 파일 업로드 요청 스키마
 * - FormData / multipart 업로드 시 사용
 */
export const FileUploadSchema = z.object({
  filename:    z.string()
                .min(1, '파일명은 1자 이상이어야 합니다')
                .max(255, '파일명은 255자 이하이어야 합니다')
                .regex(
                  /^[가-힣a-zA-Z0-9_\-()[\] .]+$/,
                  '파일명에 허용되지 않는 문자가 포함되어 있습니다'
                ),
  mimeType:    z.string()
                .refine(
                  (v) => ALLOWED_MIME_TYPES.includes(v as typeof ALLOWED_MIME_TYPES[number]),
                  { message: `허용 MIME: ${ALLOWED_MIME_TYPES.join(', ')}` }
                ),
  sizeBytes:   z.number()
                .int('파일 크기는 정수여야 합니다')
                .positive('파일 크기는 0보다 커야 합니다')
                .max(FILE_SIZE_LIMITS.zip, `최대 ${FILE_SIZE_LIMITS.zip / 1024 / 1024}MB`),
  category:    z.enum(SURVEY_CATEGORIES, `채널은 ${SURVEY_CATEGORIES.join(' | ')} 중 하나여야 합니다`),
  uploadedBy:  z.string().min(1).max(64).optional(),
  checksum:    z.string().regex(/^[a-f0-9]{64}$/, 'SHA-256 hex 체크섬 64자').optional(),
});
export type FileUploadInput = z.infer<typeof FileUploadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 2. SlimMind 질문지 HTML 파일 파싱 결과 스키마
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 축 점수 맵 (A01~A11 → 0~10 실수)
 * ZIP 분석: submitDiagnosis() 페이로드의 axis_scores 구조
 */
export const AxisScoresSchema = z.record(
  z.enum(AXIS_KEYS),
  z.number().min(0).max(10)
).refine(
  (scores) => Object.keys(scores).length > 0,
  { message: 'axis_scores는 비어있을 수 없습니다' }
);
export type AxisScores = z.infer<typeof AxisScoresSchema>;

/**
 * TOP3 축 배열 (최소 1개, 최대 3개, AXIS_KEYS 내 값)
 */
export const Top3AxesSchema = z.array(z.enum(AXIS_KEYS))
  .min(1, 'top3_axes는 최소 1개')
  .max(3, 'top3_axes는 최대 3개');
export type Top3Axes = z.infer<typeof Top3AxesSchema>;

/**
 * 진단 제출 페이로드 스키마
 * POST /api/v1/diagnosis 요청 본문 검증
 * (ZIP 분석: submitDiagnosis payload 구조 기반)
 */
export const DiagnosisPayloadSchema = z.object({
  user_name:        z.string()
                     .min(1, '이름은 필수입니다')
                     .max(50, '이름은 50자 이하')
                     .default('익명'),
  phone:            z.string()
                     .regex(/^[0-9+\-\s]{7,20}$/, '전화번호 형식 불일치')
                     .nullable()
                     .optional(),
  bc_nickname:      z.string().max(50).nullable().optional(),
  bc_primary:       z.string().max(50).nullable().optional(),
  bc_code_key:      z.enum(BC_CODE_VALUES, `bc_code_key는 ${BC_CODE_VALUES.join(' | ')} 중 하나여야 합니다`).nullable().optional(),
  bc_secondary:     z.string().max(20).nullable().optional(),
  top3_axes:        Top3AxesSchema,
  axis_scores:      AxisScoresSchema,
  region:           z.enum(REGION_VALUES).nullable().optional(),
  texture:          z.enum(TEXTURE_VALUES).nullable().optional(),
  bg_filter:        z.string().max(100).default(''),
  ohaeng_type:      z.enum(OHAENG_VALUES).nullable().optional(),
  mbti_full:        z.string()
                     .regex(/^[EI][SN][TF][JP]$/, 'MBTI 형식: ENTJ 4자')
                     .nullable()
                     .optional(),
  goal_weight:      z.number().min(20).max(300).nullable().optional(),
  weight_loss_pct:  z.number().min(0).max(100).nullable().optional(),
  disp_answers:     z.record(z.string(), z.unknown()).nullable().optional(),
  raw_answers:      z.record(z.string(), z.unknown()).nullable().optional(),
  ref_code:         z.string().max(50).nullable().optional(),
  survey_category:  z.enum(SURVEY_CATEGORIES).default('hospital'),
  completed_at:     z.string().datetime({ message: 'ISO 8601 형식 필요' }),
});
export type DiagnosisPayload = z.infer<typeof DiagnosisPayloadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 3. ZIP 파일 내부 구조 검증 스키마
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ZIP 파일 내 항목(entry) 단위 스키마
 */
export const ZipEntrySchema = z.object({
  name:         z.string().min(1).max(512),
  isDirectory:  z.boolean(),
  sizeBytes:    z.number().int().min(0),
  mimeType:     z.string().optional(),
  lastModified: z.date().optional(),
});
export type ZipEntry = z.infer<typeof ZipEntrySchema>;

/**
 * ZIP 파일 파싱 결과 스키마
 * 결과지 ZIP: 슬림마인드_자산모음/ 하위 .html 파일들
 * 질문지 ZIP: 루트에 .html 파일 3개 (병원/에스테틱/미용실)
 */
export const ZipParseResultSchema = z.object({
  totalEntries:    z.number().int().min(0),
  totalSizeBytes:  z.number().int().min(0),
  htmlFiles:       z.array(ZipEntrySchema),
  otherFiles:      z.array(ZipEntrySchema),
  hasResultFiles:  z.boolean(),   // 결과지 ZIP 여부 (시연본 포함 여부)
  hasSurveyFiles:  z.boolean(),   // 질문지 ZIP 여부 (3개국어.html 포함 여부)
  channels:        z.array(z.enum(SURVEY_CATEGORIES)), // 감지된 채널 목록
  parseErrors:     z.array(z.string()),
});
export type ZipParseResult = z.infer<typeof ZipParseResultSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 4. 파일 감사(Audit) 레코드 스키마
// ─────────────────────────────────────────────────────────────────────────────

export const AuditActionValues = [
  'UPLOAD',
  'PARSE',
  'VALIDATE',
  'VALIDATE_FAIL',
  'PARSE_ERROR',
  'ACCESS',
  'DELETE',
] as const;
export type AuditAction = typeof AuditActionValues[number];

/**
 * 파일 감사 로그 레코드
 */
export const AuditLogSchema = z.object({
  id:          z.string().uuid().optional(),
  action:      z.enum(AuditActionValues),
  filename:    z.string().min(1).max(255),
  category:    z.enum(SURVEY_CATEGORIES).optional(),
  actor:       z.string().max(64).optional(),   // 수행자 (관리자 코드 or 시스템)
  sizeBytes:   z.number().int().min(0).optional(),
  checksum:    z.string().regex(/^[a-f0-9]{64}$/).optional(),
  resultCode:  z.enum(['OK', 'WARN', 'ERROR']).default('OK'),
  details:     z.string().max(1000).optional(),
  timestamp:   z.string().datetime().default(() => new Date().toISOString()),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 5. 복합 검증 — 파일 이름 패턴 기반 타입 추론
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 파일명에서 채널/타입을 자동 감지하는 헬퍼
 */
export function detectFileType(filename: string): {
  channel: SurveyCategory | null;
  isResult: boolean;
  isSurvey: boolean;
  isDesignDoc: boolean;
} {
  const n = filename.toLowerCase();
  const isResult = n.includes('시연본') || n.includes('결과지');
  const isSurvey = n.includes('질문지') || n.includes('3개국어');
  const isDesignDoc = n.includes('설계도') || n.includes('분석');

  let channel: SurveyCategory | null = null;
  if (n.includes('병원'))     channel = 'hospital';
  else if (n.includes('에스테틱') || n.includes('미용실')) channel = 'aesthetic';
  else if (n.includes('피트니스') || n.includes('fitness'))  channel = 'fitness';

  return { channel, isResult, isSurvey, isDesignDoc };
}

/**
 * 파일 크기 제한 검증 헬퍼
 */
export function validateFileSize(
  sizeBytes: number,
  mimeType: string
): { valid: boolean; limit: number; message?: string } {
  const limit = mimeType.includes('zip')
    ? FILE_SIZE_LIMITS.zip
    : mimeType.includes('html')
      ? FILE_SIZE_LIMITS.html
      : FILE_SIZE_LIMITS.default;

  if (sizeBytes > limit) {
    return {
      valid: false,
      limit,
      message: `파일 크기(${(sizeBytes / 1024 / 1024).toFixed(1)}MB)가 최대 허용 크기(${(limit / 1024 / 1024).toFixed(0)}MB)를 초과합니다`,
    };
  }
  return { valid: true, limit };
}

/**
 * DiagnosisPayload safe parse — Zod 에러 배열 반환
 */
export function parseDiagnosisPayload(raw: unknown): {
  success: boolean;
  data?: DiagnosisPayload;
  errors?: string[];
} {
  const result = DiagnosisPayloadSchema.safeParse(raw);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map(
    (e: ZodIssue) => `[${e.path.map(String).join('.')}] ${e.message}`
  );
  return { success: false, errors };
}
