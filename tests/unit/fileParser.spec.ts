/**
 * fileParser.spec.ts
 *
 * SlimMind 플랫폼 — fileParser.service.ts 유닛 테스트
 *
 * 테스트 범위:
 *  1. parseHtmlMetadata — HTML 메타데이터 파싱
 *  2. analyzeZipEntries — ZIP 항목 분석
 *  3. parseDiagnosisPayloadSafe — 진단 페이로드 파싱 + 엣지 케이스
 *  4. validateUploadMetadata — 업로드 메타데이터 검증
 *  5. detectFileType — 파일명 유형 감지
 *  6. validateFileSize — 파일 크기 검증
 *  7. auditLogger — 감사 로거 동작 확인
 *
 * 엣지 케이스 목록:
 *  - null / undefined 페이로드
 *  - 빈 문자열 user_name → '익명' 자동 대체
 *  - top3_axes 누락 → axis_scores에서 자동 산출
 *  - axis_scores 부분 누락 (A01~A11 중 일부만)
 *  - bc_code_key null (경고만)
 *  - completed_at 누락 → 자동 삽입
 *  - 빈 ZIP 항목 목록
 *  - 잘못된 MIME 유형
 *  - 파일 크기 초과
 *  - 경로 포함된 파일명 → basename 추출
 */

// Jest 설정 (CommonJS ESM 혼용 환경)
import {
  parseHtmlMetadata,
  analyzeZipEntries,
  parseDiagnosisPayloadSafe,
  validateUploadMetadata,
} from '../../src/services/fileParser.service.js';

import {
  detectFileType,
  validateFileSize,
  parseDiagnosisPayload,
  FILE_SIZE_LIMITS,
  AXIS_KEYS,
  type ZipEntry,
} from '../../src/schemas/fileValidation.schema.js';

import {
  createAuditLogger,
  summarizeAuditLogs,
  resetGlobalAuditLogger,
} from '../../src/utils/auditLogger.js';

// ─────────────────────────────────────────────────────────────────────────────
// 테스트 헬퍼
// ─────────────────────────────────────────────────────────────────────────────

/** 유효한 진단 페이로드 팩토리 */
function makeDiagnosisPayload(overrides: Record<string, unknown> = {}) {
  const axisScores: Record<string, number> = {};
  for (const k of AXIS_KEYS) axisScores[k] = 5.0;

  return {
    user_name:       '김지현',
    phone:           '010-1234-5678',
    bc_nickname:     '호르몬스위치 갱년기형',
    bc_primary:      '호르몬스위치 갱년기형',
    bc_code_key:     'BC-13',
    bc_secondary:    null,
    top3_axes:       ['A03', 'A07', 'A01'],
    axis_scores:     axisScores,
    region:          '복부',
    texture:         '물렁',
    bg_filter:       '',
    ohaeng_type:     '수',
    mbti_full:       'INFJ',
    goal_weight:     55,
    weight_loss_pct: 8,
    disp_answers:    null,
    raw_answers:     null,
    ref_code:        null,
    survey_category: 'hospital',
    completed_at:    new Date().toISOString(),
    ...overrides,
  };
}

/** 기본 ZipEntry 팩토리 */
function makeZipEntry(name: string, sizeBytes: number = 4_000_000): ZipEntry {
  return { name, isDirectory: false, sizeBytes };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. detectFileType
// ─────────────────────────────────────────────────────────────────────────────

describe('detectFileType', () => {
  test('병원 질문지 파일명 감지', () => {
    const r = detectFileType('슬림마인드 병원 3개국어.html');
    expect(r.channel).toBe('hospital');
    expect(r.isSurvey).toBe(true);
    expect(r.isResult).toBe(false);
  });

  test('에스테틱 질문지 파일명 감지', () => {
    const r = detectFileType('슬림마인드 에스테틱 3개국어.html');
    expect(r.channel).toBe('aesthetic');
  });

  test('결과지 시연본 파일명 감지', () => {
    const r = detectFileType('슬림마인드_김지현_시연본.html');
    expect(r.isResult).toBe(true);
    expect(r.isSurvey).toBe(false);
  });

  test('설계도 파일명 감지', () => {
    const r = detectFileType('슬림마인드_결과지_설계도.html');
    expect(r.isDesignDoc).toBe(true);
  });

  test('알 수 없는 파일명 → channel null', () => {
    const r = detectFileType('unknown_file.html');
    expect(r.channel).toBeNull();
    expect(r.isResult).toBe(false);
    expect(r.isSurvey).toBe(false);
  });

  test('미용실 파일명 → aesthetic 채널', () => {
    const r = detectFileType('슬림마인드 미용실 3개국어.html');
    expect(r.channel).toBe('aesthetic');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. validateFileSize
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFileSize', () => {
  test('HTML 파일 정상 크기 (10MB)', () => {
    const r = validateFileSize(10 * 1024 * 1024, 'text/html');
    expect(r.valid).toBe(true);
  });

  test('HTML 파일 크기 초과 (31MB > 30MB 제한)', () => {
    const r = validateFileSize(31 * 1024 * 1024, 'text/html');
    expect(r.valid).toBe(false);
    expect(r.message).toContain('초과');
  });

  test('ZIP 파일 정상 크기 (22MB)', () => {
    const r = validateFileSize(22 * 1024 * 1024, 'application/zip');
    expect(r.valid).toBe(true);
  });

  test('ZIP 파일 크기 초과 (51MB > 50MB 제한)', () => {
    const r = validateFileSize(51 * 1024 * 1024, 'application/zip');
    expect(r.valid).toBe(false);
  });

  test('0바이트 파일 → 정상 (min: 1 체크는 FileUploadSchema에서)', () => {
    const r = validateFileSize(0, 'text/html');
    expect(r.valid).toBe(true);
  });

  test('기본 MIME → default 제한(10MB) 적용', () => {
    const r = validateFileSize(FILE_SIZE_LIMITS.default + 1, 'application/pdf');
    expect(r.valid).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. parseHtmlMetadata
// ─────────────────────────────────────────────────────────────────────────────

describe('parseHtmlMetadata', () => {
  const SAMPLE_SURVEY_HTML = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>슬림마인드 — 바디코드 진단</title></head>
<body>
<script>
async function submitDiagnosis() {
  await fetch('/api/v1/diagnosis', { method: 'POST' });
}
window.__SM_EN = {};
window.__SM_TH = {};
</script>
</body></html>`;

  const SAMPLE_RESULT_HTML = `<!DOCTYPE html>
<html lang="ko">
<head><title>바디코드 결과지</title></head>
<body>
<script src="/bc-engine.js"></script>
<script>
var bc_code_key = 'BC-13';
computeTop3Prescriptions(axisScores, answers, 'hospital');
</script>
</body></html>`;

  test('[정상] 질문지 HTML — API 호출 / 3개국어 감지', () => {
    const r = parseHtmlMetadata(SAMPLE_SURVEY_HTML, '슬림마인드 병원 3개국어.html');
    expect(r.success).toBe(true);
    expect(r.data?.title).toBe('슬림마인드 — 바디코드 진단');
    expect(r.data?.hasApiCall).toBe(true);
    expect(r.data?.channel).toBe('hospital');
    expect(r.data?.detectedLanguages).toContain('en');
    expect(r.data?.detectedLanguages).toContain('th');
  });

  test('[정상] 결과지 HTML — bc-engine.js + BC 코드 감지', () => {
    const r = parseHtmlMetadata(SAMPLE_RESULT_HTML, '슬림마인드_김지현_시연본.html');
    expect(r.success).toBe(true);
    expect(r.data?.hasBcEngine).toBe(true);
    expect(r.data?.isResultPage).toBe(true);
    expect(r.data?.submittedBcCode).toBe('BC-13');
  });

  test('[엣지] 빈 HTML 문자열 → 실패 반환', () => {
    const r = parseHtmlMetadata('', 'empty.html');
    expect(r.success).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
    expect(r.errors[0]).toContain('비어있습니다');
  });

  test('[엣지] <title> 없는 HTML → title이 빈 문자열', () => {
    const r = parseHtmlMetadata('<html><body><p>내용</p></body></html>', 'notitle.html');
    expect(r.success).toBe(true);
    expect(r.data?.title).toBe('');
  });

  test('[엣지] 공백만 있는 HTML → 실패 반환', () => {
    const r = parseHtmlMetadata('   \n\t  ', 'whitespace.html');
    expect(r.success).toBe(false);
  });

  test('[감사] parseHtmlMetadata → auditLogs 1건 생성', () => {
    const r = parseHtmlMetadata(SAMPLE_SURVEY_HTML, 'test.html');
    expect(r.auditLogs.length).toBe(1);
    expect(r.auditLogs[0].action).toBe('PARSE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. analyzeZipEntries
// ─────────────────────────────────────────────────────────────────────────────

describe('analyzeZipEntries', () => {
  const RESULT_ZIP_ENTRIES: ZipEntry[] = [
    makeZipEntry('슬림마인드_자산모음/슬림마인드 병원 3개국어.html', 4_100_000),
    makeZipEntry('슬림마인드_자산모음/슬림마인드_결과지_설계도.html', 791_000),
    makeZipEntry('슬림마인드_자산모음/슬림마인드_김지현_수리시연본.html', 4_200_000),
    makeZipEntry('슬림마인드_자산모음/슬림마인드_임민서_시연본.html', 4_100_000),
    { name: '슬림마인드_자산모음/', isDirectory: true, sizeBytes: 0 },
  ];

  const SURVEY_ZIP_ENTRIES: ZipEntry[] = [
    makeZipEntry('슬림마인드 병원 3개국어.html',     4_100_000),
    makeZipEntry('슬림마인드 에스테틱 3개국어.html', 15_000_000),
    makeZipEntry('슬림마인드 미용실 3개국어.html',   15_200_000),
  ];

  test('[정상] 결과지 ZIP — htmlFiles 감지 및 hasResultFiles=true', () => {
    const r = analyzeZipEntries(RESULT_ZIP_ENTRIES, '슬림마인드 결과지.zip');
    expect(r.success).toBe(true);
    expect(r.data?.htmlFiles.length).toBe(4);  // 디렉토리 항목 제외
    expect(r.data?.hasResultFiles).toBe(true);
    expect(r.data?.hasSurveyFiles).toBe(true); // 병원 3개국어 포함
  });

  test('[정상] 질문지 ZIP — 3채널 감지', () => {
    const r = analyzeZipEntries(SURVEY_ZIP_ENTRIES, '슬림마인드질문지.zip');
    expect(r.success).toBe(true);
    expect(r.data?.hasSurveyFiles).toBe(true);
    expect(r.data?.channels).toContain('hospital');
    expect(r.data?.channels).toContain('aesthetic');
  });

  test('[엣지] 빈 항목 배열 → warnings 추가, success=true', () => {
    const r = analyzeZipEntries([], 'empty.zip');
    expect(r.success).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.data?.totalEntries).toBe(0);
  });

  test('[엣지] 디렉토리 항목만 있는 경우 → htmlFiles = []', () => {
    const dirOnly: ZipEntry[] = [
      { name: 'folder/', isDirectory: true, sizeBytes: 0 },
    ];
    const r = analyzeZipEntries(dirOnly, 'dirs.zip');
    expect(r.data?.htmlFiles.length).toBe(0);
  });

  test('[엣지] HTML이 아닌 파일 → otherFiles에 분류', () => {
    const entries: ZipEntry[] = [
      makeZipEntry('image.png', 500_000),
      makeZipEntry('document.pdf', 1_000_000),
    ];
    const r = analyzeZipEntries(entries, 'mixed.zip');
    expect(r.data?.htmlFiles.length).toBe(0);
    expect(r.data?.otherFiles.length).toBe(2);
  });

  test('[감사] analyzeZipEntries → auditLogs 1건 생성', () => {
    const r = analyzeZipEntries(SURVEY_ZIP_ENTRIES, 'test.zip');
    expect(r.auditLogs.length).toBe(1);
    expect(r.auditLogs[0].action).toBe('PARSE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. parseDiagnosisPayloadSafe — 핵심 엣지 케이스
// ─────────────────────────────────────────────────────────────────────────────

describe('parseDiagnosisPayloadSafe', () => {
  test('[정상] 완전한 유효 페이로드 → success=true', () => {
    const r = parseDiagnosisPayloadSafe(makeDiagnosisPayload());
    expect(r.success).toBe(true);
    expect(r.errors.length).toBe(0);
    expect(r.data?.user_name).toBe('김지현');
    expect(r.data?.bc_code_key).toBe('BC-13');
  });

  test('[엣지-EC-1] user_name 빈 문자열 → "익명" 대체 + 경고', () => {
    const r = parseDiagnosisPayloadSafe(makeDiagnosisPayload({ user_name: '' }));
    expect(r.success).toBe(true);
    expect(r.data?.user_name).toBe('익명');
    expect(r.warnings.some((w) => w.includes('익명'))).toBe(true);
  });

  test('[엣지-EC-2] completed_at 누락 → 자동 삽입 + 경고', () => {
    const payload = makeDiagnosisPayload();
    delete (payload as Record<string, unknown>)['completed_at'];
    const r = parseDiagnosisPayloadSafe(payload);
    expect(r.success).toBe(true);
    expect(r.data?.completed_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(r.warnings.some((w) => w.includes('completed_at'))).toBe(true);
  });

  test('[엣지-EC-3] axis_scores 부분 누락 (일부 키만) → 0.0으로 보완', () => {
    const partial: Record<string, number> = { A01: 8.0, A03: 7.5 };
    const r = parseDiagnosisPayloadSafe(makeDiagnosisPayload({ axis_scores: partial }));
    expect(r.success).toBe(true);
    // 누락 키들이 0.0으로 채워졌어야 함
    expect(r.warnings.some((w) => w.includes('axis_scores'))).toBe(true);
  });

  test('[엣지-EC-4] top3_axes 빈 배열 → axis_scores에서 자동 산출', () => {
    const scores: Record<string, number> = {};
    for (const k of AXIS_KEYS) scores[k] = 0.0;
    scores['A03'] = 9.0; scores['A07'] = 8.0; scores['A01'] = 7.0;
    const r = parseDiagnosisPayloadSafe(
      makeDiagnosisPayload({ top3_axes: [], axis_scores: scores })
    );
    expect(r.success).toBe(true);
    expect(r.data?.top3_axes).toContain('A03');
    expect(r.warnings.some((w) => w.includes('top3_axes'))).toBe(true);
  });

  test('[엣지-EC-4b] top3_axes 누락 + axis_scores도 없음 → 오류', () => {
    const payload = makeDiagnosisPayload({ top3_axes: undefined, axis_scores: undefined });
    const r = parseDiagnosisPayloadSafe(payload);
    expect(r.success).toBe(false);
    expect(r.errors.some((e) => e.includes('top3_axes'))).toBe(true);
  });

  test('[엣지-EC-5] bc_code_key null → 경고만 (성공)', () => {
    const r = parseDiagnosisPayloadSafe(makeDiagnosisPayload({ bc_code_key: null }));
    expect(r.success).toBe(true);
    expect(r.warnings.some((w) => w.includes('bc_code_key'))).toBe(true);
  });

  test('[엣지-EC-6] survey_category 누락 → 기본값 "hospital"', () => {
    const payload = makeDiagnosisPayload();
    delete (payload as Record<string, unknown>)['survey_category'];
    const r = parseDiagnosisPayloadSafe(payload);
    expect(r.success).toBe(true);
    expect(r.data?.survey_category).toBe('hospital');
  });

  test('[엣지-EC-7] ohaeng_type null → 경고만', () => {
    const r = parseDiagnosisPayloadSafe(makeDiagnosisPayload({ ohaeng_type: null }));
    expect(r.success).toBe(true);
    expect(r.warnings.some((w) => w.includes('ohaeng_type'))).toBe(true);
  });

  test('[엣지] null 페이로드 → 실패 반환', () => {
    const r = parseDiagnosisPayloadSafe(null);
    expect(r.success).toBe(false);
    expect(r.errors[0]).toContain('null');
  });

  test('[엣지] undefined 페이로드 → 실패 반환', () => {
    const r = parseDiagnosisPayloadSafe(undefined);
    expect(r.success).toBe(false);
  });

  test('[엣지] 배열 페이로드 → 실패 반환', () => {
    const r = parseDiagnosisPayloadSafe([1, 2, 3]);
    expect(r.success).toBe(false);
    expect(r.errors.some((e) => e.includes('타입'))).toBe(true);
  });

  test('[엣지] 문자열 페이로드 → 실패 반환', () => {
    const r = parseDiagnosisPayloadSafe('{"user_name":"test"}');
    expect(r.success).toBe(false);
  });

  test('[엣지] bc_code_key 허용되지 않는 값 → 정규화 후 경고', () => {
    const r = parseDiagnosisPayloadSafe(makeDiagnosisPayload({ bc_code_key: 'BC-99' }));
    // bc_code_key가 null로 처리되거나 경고가 발생해야 함
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  test('[엣지] axis_scores 0~10 범위 초과 → Zod 오류', () => {
    const scores: Record<string, number> = {};
    for (const k of AXIS_KEYS) scores[k] = 5.0;
    scores['A01'] = 15.0; // 범위 초과
    const r = parseDiagnosisPayloadSafe(makeDiagnosisPayload({ axis_scores: scores }));
    expect(r.success).toBe(false);
    expect(r.errors.some((e) => e.includes('A01'))).toBe(true);
  });

  test('[정상] context.channel로 survey_category 기본값 결정', () => {
    const payload = makeDiagnosisPayload();
    delete (payload as Record<string, unknown>)['survey_category'];
    const r = parseDiagnosisPayloadSafe(payload, { channel: 'aesthetic' });
    expect(r.data?.survey_category).toBe('aesthetic');
  });

  test('[감사] parseDiagnosisPayloadSafe → auditLogs 1건 생성', () => {
    const r = parseDiagnosisPayloadSafe(makeDiagnosisPayload());
    expect(r.auditLogs.length).toBe(1);
    expect(['VALIDATE', 'VALIDATE_FAIL']).toContain(r.auditLogs[0].action);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. validateUploadMetadata
// ─────────────────────────────────────────────────────────────────────────────

describe('validateUploadMetadata', () => {
  const VALID_META = {
    filename:   '슬림마인드질문지.zip',
    mimeType:   'application/zip',
    sizeBytes:  22_045_008,
    category:   'hospital',
  };

  test('[정상] 유효한 ZIP 메타데이터', () => {
    const r = validateUploadMetadata(VALID_META);
    expect(r.success).toBe(true);
    expect(r.data?.filename).toBe('슬림마인드질문지.zip');
  });

  test('[엣지] 경로 포함된 파일명 → basename 추출 + 경고', () => {
    const r = validateUploadMetadata({
      ...VALID_META,
      filename: '/uploads/2026/슬림마인드질문지.zip',
    });
    expect(r.success).toBe(true);
    expect(r.data?.filename).toBe('슬림마인드질문지.zip');
    expect(r.warnings.some((w) => w.includes('경로'))).toBe(true);
  });

  test('[엣지] octet-stream + .html → text/html 재추론 + 경고', () => {
    const r = validateUploadMetadata({
      ...VALID_META,
      filename:  '슬림마인드 병원 3개국어.html',
      mimeType:  'application/octet-stream',
      sizeBytes: 4_100_000,
    });
    expect(r.success).toBe(true);
    expect(r.data?.mimeType).toBe('text/html');
    expect(r.warnings.some((w) => w.includes('text/html'))).toBe(true);
  });

  test('[엣지] octet-stream + .zip → application/zip 재추론', () => {
    const r = validateUploadMetadata({
      ...VALID_META,
      mimeType: 'application/octet-stream',
    });
    expect(r.success).toBe(true);
    expect(r.data?.mimeType).toBe('application/zip');
  });

  test('[엣지] 허용되지 않는 MIME 유형 → 실패', () => {
    const r = validateUploadMetadata({
      ...VALID_META,
      mimeType: 'video/mp4',
    });
    expect(r.success).toBe(false);
    expect(r.errors.some((e) => e.includes('MIME') || e.includes('mimeType'))).toBe(true);
  });

  test('[엣지] 파일명 빈 문자열 → 실패', () => {
    const r = validateUploadMetadata({ ...VALID_META, filename: '' });
    expect(r.success).toBe(false);
  });

  test('[엣지] 파일 크기 0 → 실패 (positive 조건)', () => {
    const r = validateUploadMetadata({ ...VALID_META, sizeBytes: 0 });
    expect(r.success).toBe(false);
  });

  test('[엣지] null 입력 → 실패', () => {
    const r = validateUploadMetadata(null);
    expect(r.success).toBe(false);
  });

  test('[엣지] 잘못된 category → 실패', () => {
    const r = validateUploadMetadata({ ...VALID_META, category: 'invalid_channel' });
    expect(r.success).toBe(false);
    expect(r.errors.some((e) => e.includes('category'))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. createAuditLogger
// ─────────────────────────────────────────────────────────────────────────────

describe('createAuditLogger', () => {
  beforeEach(() => {
    resetGlobalAuditLogger();
  });

  test('log() → AuditLog 반환 및 버퍼에 추가', () => {
    const logger = createAuditLogger({ silent: true });
    const record = logger.log('UPLOAD', 'test.zip', { sizeBytes: 1024, actor: 'MASTER' });
    expect(record.action).toBe('UPLOAD');
    expect(record.filename).toBe('test.zip');
    expect(record.sizeBytes).toBe(1024);
    expect(logger.count()).toBe(1);
  });

  test('flush() → 버퍼 반환 후 비우기', () => {
    const logger = createAuditLogger({ silent: true });
    logger.log('PARSE', 'file1.html');
    logger.log('VALIDATE', 'file2.html');
    const logs = logger.flush();
    expect(logs.length).toBe(2);
    expect(logger.count()).toBe(0); // 버퍼 비워짐
  });

  test('VALIDATE_FAIL 액션 → resultCode=ERROR 자동 설정', () => {
    const logger = createAuditLogger({ silent: true });
    const record = logger.log('VALIDATE_FAIL', 'bad.zip');
    expect(record.resultCode).toBe('ERROR');
  });

  test('PARSE_ERROR 액션 → resultCode=ERROR 자동 설정', () => {
    const logger = createAuditLogger({ silent: true });
    const record = logger.log('PARSE_ERROR', 'corrupt.zip');
    expect(record.resultCode).toBe('ERROR');
  });

  test('정상 액션 → resultCode=OK 기본값', () => {
    const logger = createAuditLogger({ silent: true });
    const record = logger.log('UPLOAD', 'ok.zip');
    expect(record.resultCode).toBe('OK');
  });

  test('summarizeAuditLogs — 통계 정확성', () => {
    const logger = createAuditLogger({ silent: true });
    logger.log('UPLOAD', 'f1.zip');
    logger.log('VALIDATE_FAIL', 'f2.zip');
    logger.log('PARSE_ERROR', 'f3.zip');
    logger.log('VALIDATE', 'f4.zip');

    const logs = logger.flush();
    const summary = summarizeAuditLogs(logs);

    expect(summary.total).toBe(4);
    expect(summary.ok).toBe(2);    // UPLOAD + VALIDATE
    expect(summary.error).toBe(2); // VALIDATE_FAIL + PARSE_ERROR
    expect(summary.byAction['UPLOAD']).toBe(1);
    expect(summary.byAction['VALIDATE_FAIL']).toBe(1);
  });

  test('timestamp는 ISO 8601 형식', () => {
    const logger = createAuditLogger({ silent: true });
    const record = logger.log('ACCESS', 'result.html');
    expect(record.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. parseDiagnosisPayload (스키마 직접 함수)
// ─────────────────────────────────────────────────────────────────────────────

describe('parseDiagnosisPayload (schema helper)', () => {
  test('[정상] 유효한 페이로드 파싱 성공', () => {
    const r = parseDiagnosisPayload(makeDiagnosisPayload());
    expect(r.success).toBe(true);
    expect(r.errors).toBeUndefined();
  });

  test('[오류] axis_scores 누락 → 에러 배열 반환', () => {
    const payload = makeDiagnosisPayload({ axis_scores: undefined });
    const r = parseDiagnosisPayload(payload);
    expect(r.success).toBe(false);
    expect(Array.isArray(r.errors)).toBe(true);
    expect(r.errors!.length).toBeGreaterThan(0);
  });

  test('[오류] completed_at 잘못된 형식 → 에러 반환', () => {
    const r = parseDiagnosisPayload(makeDiagnosisPayload({ completed_at: 'not-a-date' }));
    expect(r.success).toBe(false);
    expect(r.errors!.some((e) => e.includes('completed_at'))).toBe(true);
  });

  test('[오류] mbti_full 잘못된 형식 → 에러 반환', () => {
    const r = parseDiagnosisPayload(makeDiagnosisPayload({ mbti_full: 'XXXX' }));
    expect(r.success).toBe(false);
  });

  test('[정상] mbti_full null → 허용', () => {
    const r = parseDiagnosisPayload(makeDiagnosisPayload({ mbti_full: null }));
    expect(r.success).toBe(true);
  });
});
