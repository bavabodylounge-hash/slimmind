/**
 * auditLogger.ts
 *
 * SlimMind 플랫폼 — 파일 작업 감사 로거
 *
 * 역할:
 *  - 파일 업로드 / 파싱 / 검증 결과를 구조화된 로그로 기록
 *  - 감사 레코드를 메모리 내 배열로 누적 (D1 저장은 별도 처리)
 *  - Cloudflare Workers 환경 (console.log 기반)
 *
 * 사용 예:
 *  const logger = createAuditLogger();
 *  const record = logger.log('UPLOAD', 'result.zip', { sizeBytes: 15728640, actor: 'MASTER' });
 *  const allLogs = logger.flush();
 */

import {
  AuditLogSchema,
  AuditActionValues,
  type AuditLog,
  type AuditAction,
  type SurveyCategory,
} from '../schemas/fileValidation.schema.js';

// ─────────────────────────────────────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditLogOptions {
  actor?:      string;
  category?:   SurveyCategory;
  sizeBytes?:  number;
  checksum?:   string;
  resultCode?: 'OK' | 'WARN' | 'ERROR';
  details?:    string;
}

export interface AuditLogger {
  /** 감사 레코드 생성 및 내부 버퍼에 추가 */
  log(action: AuditAction, filename: string, opts?: AuditLogOptions): AuditLog;
  /** 누적된 모든 레코드 반환 후 버퍼 비우기 */
  flush(): AuditLog[];
  /** 누적된 레코드 수 */
  count(): number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 팩토리 함수
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 감사 로거 인스턴스 생성
 *
 * @param options.silent  true이면 console.log 출력 억제 (테스트 환경용)
 * @param options.prefix  로그 접두어 (기본 '[SlimMind Audit]')
 */
export function createAuditLogger(
  options: { silent?: boolean; prefix?: string } = {}
): AuditLogger {
  const { silent = false, prefix = '[SlimMind Audit]' } = options;
  const buffer: AuditLog[] = [];

  function log(
    action: AuditAction,
    filename: string,
    opts: AuditLogOptions = {}
  ): AuditLog {
    // resultCode 자동 결정
    const autoResultCode =
      opts.resultCode ??
      (action === 'VALIDATE_FAIL' || action === 'PARSE_ERROR' ? 'ERROR'
       : opts.details?.toLowerCase().includes('warn') ? 'WARN'
       : 'OK');

    const raw = {
      action,
      filename,
      category:   opts.category,
      actor:      opts.actor,
      sizeBytes:  opts.sizeBytes,
      checksum:   opts.checksum,
      resultCode: autoResultCode,
      details:    opts.details,
      timestamp:  new Date().toISOString(),
    };

    const parsed = AuditLogSchema.safeParse(raw);

    // 파싱 실패 시 최소 레코드로 대체
    const record: AuditLog = parsed.success
      ? parsed.data
      : {
          action,
          filename:   filename.slice(0, 255),
          resultCode: 'ERROR',
          details:    `AuditLog schema error: ${parsed.success ? '' : parsed.error?.message ?? 'unknown'}`,
          timestamp:  new Date().toISOString(),
        };

    buffer.push(record);

    if (!silent) {
      const icon = record.resultCode === 'ERROR' ? '❌'
                 : record.resultCode === 'WARN'  ? '⚠️'
                 : '✅';
      console.log(
        `${prefix} ${icon} [${record.action}] ${record.filename}` +
        (record.sizeBytes ? ` (${(record.sizeBytes / 1024).toFixed(1)}KB)` : '') +
        (record.details ? ` — ${record.details}` : '')
      );
    }

    return record;
  }

  function flush(): AuditLog[] {
    const snapshot = [...buffer];
    buffer.length = 0;
    return snapshot;
  }

  function count(): number {
    return buffer.length;
  }

  return { log, flush, count };
}

// ─────────────────────────────────────────────────────────────────────────────
// 싱글톤 (요청 전역 — Workers의 경우 요청마다 초기화됨)
// ─────────────────────────────────────────────────────────────────────────────

let _globalLogger: AuditLogger | null = null;

export function getGlobalAuditLogger(): AuditLogger {
  if (!_globalLogger) {
    _globalLogger = createAuditLogger({ prefix: '[SlimMind Global Audit]' });
  }
  return _globalLogger;
}

export function resetGlobalAuditLogger(): void {
  _globalLogger = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 유틸리티
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AuditLog 배열을 D1 INSERT 구문용 파라미터 배열로 변환
 * (실제 D1 저장은 index.tsx에서 처리)
 */
export function auditLogsToD1Rows(
  logs: AuditLog[]
): Array<[string, string, string | null, string | null, number | null, string, string | null, string]> {
  return logs.map((log) => [
    log.action,
    log.filename,
    log.category  ?? null,
    log.actor     ?? null,
    log.sizeBytes ?? null,
    log.resultCode,
    log.details   ?? null,
    log.timestamp,
  ]);
}

/**
 * 감사 로그 요약 통계
 */
export function summarizeAuditLogs(logs: AuditLog[]): {
  total:   number;
  ok:      number;
  warn:    number;
  error:   number;
  byAction: Record<AuditAction, number>;
} {
  const byAction = {} as Record<AuditAction, number>;
  for (const a of AuditActionValues) byAction[a] = 0;

  let ok = 0, warn = 0, error = 0;
  for (const log of logs) {
    if (log.resultCode === 'OK')    ok++;
    else if (log.resultCode === 'WARN')  warn++;
    else if (log.resultCode === 'ERROR') error++;
    byAction[log.action] = (byAction[log.action] ?? 0) + 1;
  }

  return { total: logs.length, ok, warn, error, byAction };
}
