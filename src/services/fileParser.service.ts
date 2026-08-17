/**
 * fileParser.service.ts
 *
 * SlimMind 플랫폼 — 파일 파싱 서비스
 *
 * 주요 기능:
 *  1. ZIP 파일 구조 분석 (결과지 ZIP / 질문지 ZIP 구분)
 *  2. HTML 파일에서 SlimMind 메타데이터 추출
 *  3. 진단 페이로드(DiagnosisPayload) 파싱 및 검증
 *  4. 엣지 케이스 처리 (null 필드, 누락 필드, 잘못된 형식)
 *
 * Cloudflare Workers 환경 제약:
 *  - Node.js fs 모듈 사용 불가
 *  - ArrayBuffer / ReadableStream 기반 처리
 *  - 최대 CPU 시간 10ms (무료) / 30ms (유료) per request
 */

import { z, type ZodIssue } from 'zod';
import {
  DiagnosisPayloadSchema,
  FileUploadSchema,
  ZipParseResultSchema,
  AuditLogSchema,
  detectFileType,
  validateFileSize,
  parseDiagnosisPayload,
  type DiagnosisPayload,
  type ZipParseResult,
  type ZipEntry,
  type AuditLog,
  type SurveyCategory,
  AXIS_KEYS,
  BC_CODE_VALUES,
} from '../schemas/fileValidation.schema.js';

import { createAuditLogger } from '../utils/auditLogger.js';

// ─────────────────────────────────────────────────────────────────────────────
// 내부 타입
// ─────────────────────────────────────────────────────────────────────────────

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
  auditLogs: AuditLog[];
}

export interface HtmlMetadata {
  title: string;
  channel: SurveyCategory | null;
  isResultPage: boolean;
  isSurveyPage: boolean;
  hasApiCall: boolean;         // /api/ 호출 포함 여부
  hasBcEngine: boolean;        // bc-engine.js 참조 여부
  submittedBcCode: string | null;
  detectedLanguages: string[]; // ko / en / th
  sizeBytes: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HTML 파일 메타데이터 파싱
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HTML 텍스트에서 SlimMind 관련 메타데이터 추출
 *
 * 엣지 케이스:
 *  - 빈 문자열 → 기본값 반환
 *  - <title> 없음 → empty string
 *  - 3개국어 스크립트 없음 → detectedLanguages = ['ko']
 *  - bc-engine.js 없음 → hasBcEngine = false
 */
export function parseHtmlMetadata(
  htmlContent: string,
  filename: string
): ParseResult<HtmlMetadata> {
  const audit = createAuditLogger();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!htmlContent || htmlContent.trim().length === 0) {
    errors.push('HTML 내용이 비어있습니다');
    return {
      success: false,
      errors,
      warnings,
      auditLogs: [
        audit.log('VALIDATE_FAIL', filename, { details: 'Empty HTML content' }),
      ],
    };
  }

  const fileInfo = detectFileType(filename);
  const sizeBytes = new TextEncoder().encode(htmlContent).length;

  // <title> 추출
  const titleMatch = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // API 호출 감지
  const hasApiCall = /fetch\s*\(\s*['"`]\/api\//.test(htmlContent) ||
                      /\/api\/v1\/diagnosis/.test(htmlContent);

  // bc-engine.js 참조 감지
  const hasBcEngine = /bc-engine\.js/.test(htmlContent) ||
                       /computeTop3Prescriptions/.test(htmlContent);

  // 3개국어 감지
  const detectedLanguages: string[] = ['ko'];
  if (/SM_I18N_EN|__SM_EN|window\.__SM_EN/.test(htmlContent)) detectedLanguages.push('en');
  if (/SM_I18N_TH|__SM_TH|window\.__SM_TH/.test(htmlContent))  detectedLanguages.push('th');

  // BC 코드 감지 (시연본인 경우)
  let submittedBcCode: string | null = null;
  const bcMatch = htmlContent.match(/bc_code[_\-]?key\s*[=:]+\s*['"]?\s*(BC-\d+)/i);
  if (bcMatch) submittedBcCode = bcMatch[1];

  // 파일 크기 경고
  const sizeCheck = validateFileSize(sizeBytes, 'text/html');
  if (!sizeCheck.valid) {
    warnings.push(sizeCheck.message!);
  }

  const metadata: HtmlMetadata = {
    title,
    channel: fileInfo.channel,
    isResultPage: fileInfo.isResult,
    isSurveyPage: fileInfo.isSurvey,
    hasApiCall,
    hasBcEngine,
    submittedBcCode,
    detectedLanguages,
    sizeBytes,
  };

  return {
    success: true,
    data: metadata,
    errors,
    warnings,
    auditLogs: [
      audit.log('PARSE', filename, {
        category: fileInfo.channel ?? undefined,
        sizeBytes,
        details: `languages=${detectedLanguages.join(',')} api=${hasApiCall} bc=${hasBcEngine}`,
      }),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ZIP 파일 파싱 (Workers 환경 — ArrayBuffer 기반)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ZIP 파일 항목 목록을 SlimMind 관점에서 분석
 *
 * 실제 ZIP 압축 해제는 Workers에서 불가하므로,
 * Central Directory 없이 파일 경로 목록만 받아 분석하는 경량 버전.
 *
 * 엣지 케이스:
 *  - 빈 배열 → warnings 추가, htmlFiles/otherFiles = []
 *  - 디렉토리 항목 포함 → isDirectory=true 항목 필터링
 *  - 알 수 없는 채널 → channel = null, warnings 추가
 */
export function analyzeZipEntries(
  entries: ZipEntry[],
  zipFilename: string
): ParseResult<ZipParseResult> {
  const audit = createAuditLogger();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!entries || entries.length === 0) {
    warnings.push('ZIP 파일에 항목이 없습니다');
  }

  const htmlFiles: ZipEntry[]  = [];
  const otherFiles: ZipEntry[] = [];
  let totalSizeBytes = 0;
  const channels = new Set<SurveyCategory>();
  const parseErrors: string[] = [];

  for (const entry of entries) {
    // 유효성 검사
    const parsed = z.object({
      name:        z.string().min(1),
      isDirectory: z.boolean(),
      sizeBytes:   z.number().int().min(0),
    }).safeParse(entry);

    if (!parsed.success) {
      parseErrors.push(`항목 파싱 실패: ${JSON.stringify(entry)}`);
      continue;
    }

    if (entry.isDirectory) continue;

    totalSizeBytes += entry.sizeBytes;
    const info = detectFileType(entry.name);

    if (entry.name.toLowerCase().endsWith('.html')) {
      htmlFiles.push(entry);
      if (info.channel) channels.add(info.channel);
    } else {
      otherFiles.push(entry);
    }
  }

  // 결과지 / 질문지 ZIP 구분
  const hasResultFiles = htmlFiles.some(
    (f) => f.name.includes('시연본') || f.name.includes('결과지') || f.name.includes('설계도')
  );
  const hasSurveyFiles = htmlFiles.some(
    (f) => f.name.includes('질문지') || f.name.includes('3개국어')
  );

  if (!hasResultFiles && !hasSurveyFiles) {
    warnings.push('결과지/질문지 HTML 파일이 감지되지 않았습니다');
  }
  if (parseErrors.length > 0) {
    warnings.push(...parseErrors);
  }

  const result: ZipParseResult = {
    totalEntries:   entries.length,
    totalSizeBytes,
    htmlFiles,
    otherFiles,
    hasResultFiles,
    hasSurveyFiles,
    channels:       Array.from(channels),
    parseErrors,
  };

  const validated = ZipParseResultSchema.safeParse(result);
  if (!validated.success) {
    errors.push(...validated.error.issues.map(
      (e: ZodIssue) => `[${e.path.map(String).join('.')}] ${e.message}`
    ));
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
    warnings,
    auditLogs: [
      audit.log('PARSE', zipFilename, {
        details: `entries=${entries.length} html=${htmlFiles.length} channels=[${Array.from(channels).join(',')}]`,
      }),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. 진단 페이로드 파싱 및 정규화
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/diagnosis 요청 본문 파싱 + 엣지 케이스 정규화
 *
 * 엣지 케이스 처리:
 *  1. axis_scores 누락 필드 → 0.0으로 보완
 *  2. top3_axes 빈 배열 → axis_scores에서 자동 산출
 *  3. bc_code_key null → bc_primary 닉네임으로 역추론
 *  4. completed_at 누락 → 현재 시각 자동 삽입
 *  5. user_name 공백 문자열 → '익명' 대체
 *  6. ohaeng_type null → 경고만 (오류 아님)
 */
export function parseDiagnosisPayloadSafe(
  raw: unknown,
  context: { channel?: SurveyCategory; actor?: string } = {}
): ParseResult<DiagnosisPayload> {
  const audit = createAuditLogger();
  const errors: string[] = [];
  const warnings: string[] = [];
  const actor = context.actor ?? 'system';

  // null / undefined 전체 처리
  if (raw === null || raw === undefined) {
    return {
      success: false,
      errors: ['페이로드가 null 또는 undefined입니다'],
      warnings,
      auditLogs: [audit.log('VALIDATE_FAIL', 'diagnosis_payload', { actor, details: 'null payload' })],
    };
  }

  // 객체가 아닌 경우
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      success: false,
      errors: [`페이로드 타입이 올바르지 않습니다: ${typeof raw}`],
      warnings,
      auditLogs: [audit.log('VALIDATE_FAIL', 'diagnosis_payload', { actor, details: `invalid type: ${typeof raw}` })],
    };
  }

  const obj = raw as Record<string, unknown>;

  // ── 엣지 케이스 정규화 ──────────────────────────────────────────────────

  // [EC-1] user_name 빈 문자열 → '익명'
  if (typeof obj['user_name'] === 'string' && obj['user_name'].trim() === '') {
    obj['user_name'] = '익명';
    warnings.push('user_name이 빈 문자열 → "익명"으로 대체되었습니다');
  }

  // [EC-2] completed_at 누락 → 현재 시각
  if (!obj['completed_at']) {
    obj['completed_at'] = new Date().toISOString();
    warnings.push('completed_at 누락 → 현재 시각으로 자동 삽입');
  }

  // [EC-3] axis_scores 존재하면 누락된 축 키를 0.0으로 보완
  if (obj['axis_scores'] && typeof obj['axis_scores'] === 'object') {
    const scores = obj['axis_scores'] as Record<string, unknown>;
    for (const key of AXIS_KEYS) {
      if (!(key in scores)) {
        scores[key] = 0.0;
        warnings.push(`axis_scores.${key} 누락 → 0.0으로 보완`);
      }
    }
  }

  // [EC-4] top3_axes 누락/빈 배열 → axis_scores에서 상위 3개 자동 산출
  const top3 = obj['top3_axes'];
  if (!top3 || (Array.isArray(top3) && top3.length === 0)) {
    if (obj['axis_scores'] && typeof obj['axis_scores'] === 'object') {
      const scores = obj['axis_scores'] as Record<string, number>;
      const derived = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k]) => k);
      obj['top3_axes'] = derived;
      warnings.push(`top3_axes 누락 → axis_scores 상위 3개(${derived.join(',')})로 자동 산출`);
    } else {
      errors.push('top3_axes 및 axis_scores 모두 누락 — 자동 산출 불가');
    }
  }

  // [EC-5] bc_code_key null/허용되지 않는 값이면 경고 (오류 아님 — 프론트에서 역추론 가능)
  if (!obj['bc_code_key']) {
    warnings.push('bc_code_key가 null — 결과지에서 bc_primary로 역매핑 필요');
  } else if (
    typeof obj['bc_code_key'] === 'string' &&
    !(BC_CODE_VALUES as readonly string[]).includes(obj['bc_code_key'])
  ) {
    warnings.push("bc_code_key '" + obj['bc_code_key'] + "'는 허용되지 않는 값 → null로 정규화");
    obj['bc_code_key'] = null;
  }

  // [EC-6] survey_category 누락 → channel 컨텍스트 또는 기본값
  if (!obj['survey_category']) {
    obj['survey_category'] = context.channel ?? 'hospital';
    warnings.push(`survey_category 누락 → '${obj['survey_category']}'으로 기본 설정`);
  }

  // [EC-7] ohaeng_type null → 경고만
  if (!obj['ohaeng_type']) {
    warnings.push('ohaeng_type null — 결과지 오행 패널이 비어보일 수 있음');
  }

  // ── Zod 검증 ────────────────────────────────────────────────────────────
  const result = parseDiagnosisPayload(obj);
  if (!result.success) {
    errors.push(...(result.errors ?? []));
  }

  const hasErrors = errors.length > 0;
  return {
    success: !hasErrors,
    data: result.data,
    errors,
    warnings,
    auditLogs: [
      audit.log(hasErrors ? 'VALIDATE_FAIL' : 'VALIDATE', 'diagnosis_payload', {
        actor,
        details: hasErrors
          ? `errors=${errors.join('; ')}`
          : `bc_code=${obj['bc_code_key']} warnings=${warnings.length}`,
      }),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. 파일 업로드 메타데이터 검증
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 파일 업로드 메타데이터 검증 (FormData 처리 전 사전 검증)
 *
 * 엣지 케이스:
 *  - filename에 경로 구분자 포함 → 파일명만 추출
 *  - mimeType 'application/octet-stream' → 확장자로 재추론
 */
export function validateUploadMetadata(
  input: unknown
): ParseResult<z.infer<typeof FileUploadSchema>> {
  const audit = createAuditLogger();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input || typeof input !== 'object') {
    return {
      success: false,
      errors: ['업로드 메타데이터가 올바르지 않습니다'],
      warnings,
      auditLogs: [audit.log('VALIDATE_FAIL', 'upload_metadata', { details: 'invalid input' })],
    };
  }

  const obj = { ...(input as Record<string, unknown>) };

  // [EC] 파일명에서 경로 제거
  if (typeof obj['filename'] === 'string') {
    const basename = obj['filename'].split(/[/\\]/).pop() ?? obj['filename'];
    if (basename !== obj['filename']) {
      warnings.push(`파일명에서 경로 구분자 제거: '${obj['filename']}' → '${basename}'`);
      obj['filename'] = basename;
    }
  }

  // [EC] octet-stream → 확장자 기반 재추론
  if (obj['mimeType'] === 'application/octet-stream' && typeof obj['filename'] === 'string') {
    const ext = (obj['filename'] as string).split('.').pop()?.toLowerCase();
    if (ext === 'html') {
      obj['mimeType'] = 'text/html';
      warnings.push('mimeType을 application/octet-stream → text/html로 재추론');
    } else if (ext === 'zip') {
      obj['mimeType'] = 'application/zip';
      warnings.push('mimeType을 application/octet-stream → application/zip으로 재추론');
    }
  }

  const result = FileUploadSchema.safeParse(obj);
  if (!result.success) {
    errors.push(...result.error.issues.map(
      (e: ZodIssue) => `[${e.path.map(String).join('.')}] ${e.message}`
    ));
  }

  const filename = (typeof obj['filename'] === 'string') ? obj['filename'] : 'unknown';
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    errors,
    warnings,
    auditLogs: [
      audit.log(result.success ? 'VALIDATE' : 'VALIDATE_FAIL', filename, {
        sizeBytes: typeof obj['sizeBytes'] === 'number' ? obj['sizeBytes'] : undefined,
        details:   errors.length ? errors.join('; ') : 'OK',
      }),
    ],
  };
}
