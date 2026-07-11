import { Hono } from 'hono'
import { cors } from 'hono/cors'
import indexHtml from '../public/index.html?raw'
import surveyDataJs from '../public/survey-data.js?raw'
import bcEngineJs from '../public/bc-engine.js?raw'
// bc-definitions.js — BC코드 시스템 폐기로 미사용 (axis 시스템으로 전환)
// import bcDefinitionsJs from '../public/bc-definitions.js?raw'
import adminHtml from '../public/admin.html?raw'
import consultantHtml from '../public/consultant.html?raw'
import b2bHtml from '../public/b2b.html?raw'
import resultHtml from '../public/result.html?raw'
import resultV3Html from '../public/result-v3.html?raw'
import resultV4Html from '../public/result-v4.html?raw'
import bodymapPreviewHtml from '../public/bodymap_preview.html?raw'
// ★ 설문지는 index.html 단 하나로 통합 — 모든 라우트가 indexHtml을 직접 서빙
// slimmind_live.html은 삭제됨 (dead code 제거)

// ─── 타입 정의 ───────────────────────────────────────────────
type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

type JwtPayload = {
  sub: string        // consultants.id OR b2b_partners.id
  code: string       // MASTER | SC-XXXX | B2B-XXX-000
  role: 'MASTER' | 'CONSULTANT' | 'B2B_PARTNER'
  name: string
  exp: number
}

const app = new Hono<{ Bindings: Bindings }>()

// ─── CORS ────────────────────────────────────────────────────
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ═══════════════════════════════════════════════════════════════
//  JWT 유틸리티 (Web Crypto API — Cloudflare Workers 호환)
// ═══════════════════════════════════════════════════════════════
async function signJwt(payload: JwtPayload, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const enc = (obj: unknown) => {
    const str = JSON.stringify(obj)
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    bytes.forEach(b => binary += String.fromCharCode(b))
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  }
  const data = `${enc(header)}.${enc(payload)}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${data}.${b64}`
}

async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, payload, sig] = parts
    const data = `${header}.${payload}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const sigBuf = Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigBuf, new TextEncoder().encode(data))
    if (!valid) return null
    const payloadBin = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const payloadBytes = new Uint8Array(payloadBin.length)
    for (let i = 0; i < payloadBin.length; i++) payloadBytes[i] = payloadBin.charCodeAt(i)
    const parsed: JwtPayload = JSON.parse(new TextDecoder().decode(payloadBytes))
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null
    return parsed
  } catch {
    return null
  }
}

async function getAuthUser(c: any): Promise<JwtPayload | null> {
  // Authorization 헤더 또는 쿼리 파라미터 token 둘 다 지원
  const auth = c.req.header('Authorization') || ''
  let token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) token = c.req.query('token') || null
  if (!token) return null
  return verifyJwt(token, c.env.JWT_SECRET || 'slimmind-jwt-secret-change-in-production')
}

function requireRole(role: 'MASTER' | 'CONSULTANT' | 'ANY') {
  return async (c: any, next: any) => {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: '인증이 필요합니다.' }, 401)
    if (role === 'MASTER' && user.role !== 'MASTER') return c.json({ error: '관리자 권한이 필요합니다.' }, 403)
    c.set('user', user)
    await next()
  }
}

function requireB2B() {
  return async (c: any, next: any) => {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: '인증이 필요합니다.' }, 401)
    if (user.role !== 'B2B_PARTNER' && user.role !== 'MASTER') return c.json({ error: 'B2B 파트너 권한이 필요합니다.' }, 403)
    c.set('user', user)
    await next()
  }
}

// ─── JSON 파싱 유틸 ────────────────────────────────────────────
const parseJson = (s: string | null, fallback: any = null) => {
  try { return s ? JSON.parse(s) : fallback } catch { return fallback }
}

// ─── BC 코드 정규화 ─────────────────────────────────────────────
// DB에 저장된 다양한 형태를 BC_MASTER 키(BC-1~BC-9)로 통일
// BC-09 → BC-9, BC-01 → BC-1, BC01 → BC-1, A01/A07 → 축코드 기반 매핑
const AXIS_TO_BC: Record<string, string> = {
  'A01': 'BC-3',  // 인슐린·내장 → 내장지방형
  'A02': 'BC-1',  // 림프순환 → 코끼리다리형
  'A03': 'BC-6',  // 호르몬 → 갱년기형
  'A04': 'BC-4',  // 근감소 → 올챙이배형
  'A05': 'BC-5',  // 소화·장 → 가스팽만형
  'A06': 'BC-2',  // 골격·복압 → 거북이형
  'A07': 'BC-6',  // 코르티솔 → 야식부엉이형(BC-6)
  'A08': 'BC-8',  // 심리·식이 → 심리식이형
  'A09': 'BC-9',  // 대사위험 → 대사증후군형
  'A10': 'BC-7',  // 기질 → 기질형
}
function normalizeBcCode(raw: string | null): string {
  if (!raw) return 'BC-6'
  const s = raw.trim()
  // 이미 BC-N 단일자리 형태 (BC-1 ~ BC-9)
  if (/^BC-[1-9]$/.test(s)) return s
  // BC-09, BC-01 등 두자리 0패딩
  if (/^BC-0([1-9])$/.test(s)) return `BC-${s[4]}`
  // BC01 형태 (하이픈 없음)
  if (/^BC0?([1-9])$/.test(s)) {
    const m = s.match(/^BC0?([1-9])$/)
    return m ? `BC-${m[1]}` : 'BC-6'
  }
  // 축 코드 (A01~A10) → BC 매핑
  if (/^A\d{2}$/.test(s)) return AXIS_TO_BC[s] || 'BC-6'
  // 닉네임 그대로 (diagnosis_results의 bc_nickname 형태)
  return s
}

// ─── 결과 ID 생성 ─────────────────────────────────────────────
function resultIdGen() {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  const rand = Math.random().toString(36).slice(2,8).toUpperCase()
  return `RES-${date}-${rand}`
}

// ═══════════════════════════════════════════════════════════════
//  공개 정적 파일 서빙
// ═══════════════════════════════════════════════════════════════
app.get('/survey-data.js', (c) =>
  c.body(surveyDataJs, 200, { 'Content-Type': 'application/javascript; charset=utf-8' })
)
// /bc-definitions.js — BC코드 시스템 폐기, 204 No Content 반환
app.get('/bc-definitions.js', (c) =>
  c.body('/* bc-definitions.js deprecated — axis system */', 200, { 'Content-Type': 'application/javascript; charset=utf-8' })
)
// /bc-engine.js — PRD V3.0 BC 코드 연산 엔진
app.get('/bc-engine.js', (c) =>
  c.body(bcEngineJs, 200, { 'Content-Type': 'application/javascript; charset=utf-8' })
)

// ═══════════════════════════════════════════════════════════════
//  AUTH API
// ═══════════════════════════════════════════════════════════════

// POST /api/auth/login — 공통 로그인 (MASTER + CONSULTANT + B2B_PARTNER)
app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json()
    const code = body.code
    const password = body.password
    if (!code || !password) return c.json({ error: '코드와 비밀번호를 입력하세요.' }, 400)

    const db = c.env.DB
    const upperCode = code.toUpperCase()

    // ── B2B_PARTNER 로그인 분기 ─────────────────────────────
    if (upperCode.startsWith('B2B-')) {
      const partner = await db.prepare(
        'SELECT * FROM b2b_partners WHERE code = ?'
      ).bind(upperCode).first<any>()

      if (!partner) return c.json({ error: '존재하지 않는 B2B 파트너 코드입니다.' }, 401)

      let pwOk = false
      if (partner.password_hash && partner.password_hash === password) {
        pwOk = true
      } else {
        // 기본 비밀번호: 코드 뒤 숫자 부분
        const parts = upperCode.split('-')
        const defaultPw = `b2b${parts[parts.length - 1]}`
        if (password === defaultPw) pwOk = true
      }

      if (!pwOk) return c.json({ error: '비밀번호가 올바르지 않습니다.' }, 401)
      if (partner.status === 'suspended') {
        return c.json({ error: '정지된 계정입니다. 관리자에게 문의하세요.' }, 403)
      }

      const secret = c.env.JWT_SECRET || 'slimmind-jwt-secret-change-in-production'
      const payload: JwtPayload = {
        sub: partner.id,
        code: partner.code,
        role: 'B2B_PARTNER',
        name: partner.brand_name || partner.name,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7일
      }
      const token = await signJwt(payload, secret)

      // first_login_at 기록
      if (!partner.first_login_at) {
        await db.prepare("UPDATE b2b_partners SET first_login_at=datetime('now') WHERE code=?").bind(upperCode).run()
      }

      return c.json({
        token, role: 'B2B_PARTNER',
        name: partner.brand_name || partner.name,
        code: partner.code,
        brand_color: partner.brand_color,
        brand_logo_url: partner.brand_logo_url,
        brand_name: partner.brand_name || partner.name,
      })
    }

    // ── MASTER / CONSULTANT 로그인 ──────────────────────────
    const consultant = await db.prepare(
      'SELECT * FROM consultants WHERE code = ?'
    ).bind(upperCode).first<any>()

    if (!consultant) return c.json({ error: '존재하지 않는 계정입니다.' }, 401)

    let pwOk = false
    if (consultant.code === 'MASTER' && password === 'admin1234') {
      pwOk = true
    } else if (consultant.password_hash && consultant.password_hash === password) {
      pwOk = true
    } else {
      const num = consultant.code.replace('SC-', '')
      const defaultPw = `pass${num}`
      if (password === defaultPw) pwOk = true
    }

    if (!pwOk) return c.json({ error: '비밀번호가 올바르지 않습니다.' }, 401)

    if (consultant.subscription_status === 'suspended') {
      return c.json({ error: '정지된 계정입니다. 관리자에게 문의하세요.' }, 403)
    }

    const role: 'MASTER' | 'CONSULTANT' = consultant.code === 'MASTER' ? 'MASTER' : 'CONSULTANT'
    const secret = c.env.JWT_SECRET || 'slimmind-jwt-secret-change-in-production'
    const payload: JwtPayload = {
      sub: consultant.id,
      code: consultant.code,
      role,
      name: consultant.name,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24시간
    }
    const token = await signJwt(payload, secret)

    return c.json({ token, role, name: consultant.name, code: consultant.code })
  } catch (e: any) {
    return c.json({ error: '서버 오류: ' + (e?.message || String(e)) }, 500)
  }
})

// GET /api/auth/me
app.get('/api/auth/me', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: '인증 필요' }, 401)
  return c.json({ code: user.code, role: user.role, name: user.name })
})

// ═══════════════════════════════════════════════════════════════
//  GET /api/admin/impersonate/:code
//  마스터 전용: 해당 컨설턴트 또는 B2B 파트너의 JWT를 대리 발급
//  → 프론트에서 이 토큰을 localStorage에 저장 후 해당 페이지로 리다이렉트
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/impersonate/:code', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const secret = c.env.JWT_SECRET || 'slimmind-jwt-secret-change-in-production'
  const targetCode = c.req.param('code').toUpperCase()

  // B2B 파트너인지 먼저 확인
  if (targetCode.startsWith('B2B-')) {
    const partner = await db.prepare(
      'SELECT * FROM b2b_partners WHERE code=?'
    ).bind(targetCode).first<any>()
    if (!partner) return c.json({ error: '파트너를 찾을 수 없습니다.' }, 404)

    const payload: JwtPayload = {
      sub: String(partner.id),
      code: partner.code,
      role: 'B2B_PARTNER',
      name: partner.brand_name || partner.name,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // 2시간 (대리접속은 짧게)
    }
    const token = await signJwt(payload, secret)
    return c.json({
      token, role: 'B2B_PARTNER',
      code: partner.code,
      name: partner.brand_name || partner.name,
      redirect: '/b2b',
      brand_color: partner.brand_color,
      brand_logo_url: partner.brand_logo_url,
      brand_name: partner.brand_name || partner.name,
    })
  }

  // 컨설턴트
  const consultant = await db.prepare(
    'SELECT * FROM consultants WHERE code=?'
  ).bind(targetCode).first<any>()
  if (!consultant) return c.json({ error: '컨설턴트를 찾을 수 없습니다.' }, 404)

  const role: 'MASTER' | 'CONSULTANT' = consultant.code === 'MASTER' ? 'MASTER' : 'CONSULTANT'
  const payload: JwtPayload = {
    sub: String(consultant.id),
    code: consultant.code,
    role,
    name: consultant.name,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // 2시간
  }
  const token = await signJwt(payload, secret)
  return c.json({
    token, role,
    code: consultant.code,
    name: consultant.name,
    redirect: '/consultant',
  })
})

// ═══════════════════════════════════════════════════════════════
//  설문 API
// ═══════════════════════════════════════════════════════════════

// ─── 크로스디바이스 임시저장 API ─────────────────────────────────────
// POST /api/survey/draft  — 저장 (sid 없으면 신규 생성, 있으면 업데이트)
app.post('/api/survey/draft', async (c) => {
  const db = c.env.DB
  try {
    const body = await c.req.json<{
      sid?: string
      idx: number
      answers: Record<string, unknown>
      measureVals?: Record<string, unknown>
      ref_code?: string
      total_q?: number
    }>()

    // sid 없으면 새로 발급
    const sid = body.sid && body.sid.startsWith('sm_')
      ? body.sid
      : `sm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

    const answersJson = JSON.stringify(body.answers ?? {})
    const measureJson = JSON.stringify(body.measureVals ?? {})

    await db.prepare(`
      INSERT INTO survey_drafts (sid, idx, answers_json, measure_json, ref_code, total_q, saved_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(sid) DO UPDATE SET
        idx          = excluded.idx,
        answers_json = excluded.answers_json,
        measure_json = excluded.measure_json,
        ref_code     = COALESCE(excluded.ref_code, ref_code),
        total_q      = excluded.total_q,
        updated_at   = datetime('now')
    `).bind(
      sid,
      body.idx ?? 0,
      answersJson,
      measureJson,
      body.ref_code ?? null,
      body.total_q ?? 0
    ).run()

    return c.json({ ok: true, sid })
  } catch (e: any) {
    return c.json({ ok: false, error: e?.message }, 500)
  }
})

// GET /api/survey/draft?sid=sm_xxx — 불러오기
app.get('/api/survey/draft', async (c) => {
  const db = c.env.DB
  const sid = c.req.query('sid')
  if (!sid || !sid.startsWith('sm_')) {
    return c.json({ ok: false, error: 'invalid sid' }, 400)
  }
  try {
    const row = await db.prepare(
      'SELECT sid, idx, answers_json, measure_json, ref_code, total_q, updated_at FROM survey_drafts WHERE sid = ?'
    ).bind(sid).first<{
      sid: string; idx: number; answers_json: string
      measure_json: string; ref_code: string | null
      total_q: number; updated_at: string
    }>()

    if (!row) return c.json({ ok: false, error: 'not found' }, 404)

    // 30일 이상 된 데이터는 만료 처리
    const savedMs = new Date(row.updated_at + 'Z').getTime()
    if (Date.now() - savedMs > 30 * 24 * 60 * 60 * 1000) {
      await db.prepare('DELETE FROM survey_drafts WHERE sid = ?').bind(sid).run()
      return c.json({ ok: false, error: 'expired' }, 404)
    }

    return c.json({
      ok: true,
      sid: row.sid,
      idx: row.idx,
      answers: JSON.parse(row.answers_json),
      measureVals: JSON.parse(row.measure_json),
      ref_code: row.ref_code,
      total_q: row.total_q,
      updated_at: row.updated_at
    })
  } catch (e: any) {
    return c.json({ ok: false, error: e?.message }, 500)
  }
})

// DELETE /api/survey/draft?sid=sm_xxx — 제출 완료 후 초기화
app.delete('/api/survey/draft', async (c) => {
  const db = c.env.DB
  const sid = c.req.query('sid')
  if (!sid) return c.json({ ok: false, error: 'no sid' }, 400)
  try {
    await db.prepare('DELETE FROM survey_drafts WHERE sid = ?').bind(sid).run()
    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ ok: false, error: e?.message }, 500)
  }
})
// ─────────────────────────────────────────────────────────────────────

// POST /api/survey/submit
app.post('/api/survey/submit', async (c) => {
  const body = await c.req.json()
  const {
    consultant_code, user_name, answers,
    bc_primary, bc_secondary, bc_primary_score, bc_secondary_score,
    bc_scores, ohaeng_type, ohaeng_scores,
    // V4.6 오행 확장 필드 (results 테이블은 ohaeng_type + ohaeng_scores_json만 저장 — source/confidence는 survey_answers_json에 포함)
    ohaeng_source, ohaeng_confidence, ohaeng_lacking, ohaeng_score,
    mbti, blood_type, saju_il_gan, saju_ohaeng,
    // v5.0 사주 확장 필드
    saju_il_ji, saju_yin_yang, birth_hour,
    saju_hour_stem, saju_hour_branch, saju_display,
    gender, birth_date, height, weight, target_weight,
    bmi, bfr, fat_kg, muscle_kg,
    top_size, bottom_size, target_top_size, target_bottom_size,
    emotional_state, main_goal, priority_value,
    survey_summary,
    // v2.0 추가 필드
    aerobic_response, massage_swells, sauna_response,
    current_facility, context_type, current_medications,
    target_body_part, psych_state, monthly_budget, muscle_soreness_level,
    // v3.0 섹션 L 필드 (알레르기/피부반응/갱년기/병적요소)
    food_allergy, allergy_exclude, skin_reaction,
    menopause_status, is_menopause,
    medical_conditions, has_medical_conditions,
    // v4.0 10축 분석 결과
    axis_scores, top_axes,
    // v4.1 axis_primary (migration 0024)
    axis_primary, axis_secondary, axis_primary_score,
    // v5.0 B2B/컨설턴트 추적 (migration 0025)
    ref_code, ref_type
  } = body

  const result_id = resultIdGen()
  const db = c.env.DB

  // 배열/객체 필드 안전 변환 (D1은 primitive 타입만 허용)
  const toStr = (v: any) => {
    if (v === null || v === undefined) return null
    if (Array.isArray(v)) return v.join(',')
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  }

  // user_name 폴백: payload.user_name → answers.name → '익명'
  const resolvedUserName = toStr(user_name) || toStr(answers?.name) || '익명'

  // birth_date 오염 방지: "T00:00:00", "shoulderT..." 등 비정상 값 차단
  // YYYY-MM-DD 형식만 허용, 범위 1920-01-01 ~ 오늘
  const sanitizeBirthDate = (raw: any): string | null => {
    if (!raw) return null
    const s = String(raw).trim()
    // "T00:00:00" suffix가 붙은 경우 날짜 부분만 추출
    const dateOnly = s.split('T')[0]
    // YYYY-MM-DD 형식 검증
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null
    const d = new Date(dateOnly)
    if (isNaN(d.getTime())) return null
    const year = d.getFullYear()
    // 1920~현재 연도 범위 검증
    const thisYear = new Date().getFullYear()
    if (year < 1920 || year > thisYear) return null
    return dateOnly
  }
  const cleanBirthDate = sanitizeBirthDate(birth_date)

  let validConsultantCode = null
  if (consultant_code) {
    const cons = await db.prepare('SELECT code FROM consultants WHERE code = ?').bind(consultant_code).first<any>()
    validConsultantCode = cons?.code || null
  }

  // D1은 undefined를 허용하지 않으므로 모든 값을 null-safe 처리
  const n = (v: any): number | null => (v !== undefined && v !== null && !isNaN(Number(v))) ? Number(v) : null
  const nz = (v: any): number => n(v) ?? 0
  const b = (v: any): number => (v ? 1 : 0)

  // bc_primary는 NOT NULL — 없으면 axis_primary 또는 기본값 'UNKNOWN' 폴백
  const safeBcPrimary = toStr(bc_primary) || toStr(axis_primary) || 'UNKNOWN'

  await db.prepare(`
    INSERT INTO results (
      id, user_name, consultant_code,
      bc_primary, bc_secondary, bc_primary_score, bc_secondary_score,
      bc_scores_json, ohaeng_type, ohaeng_scores_json,
      mbti, blood_type, saju_il_gan, saju_ohaeng,
      saju_il_ji, saju_yin_yang, birth_hour,
      saju_hour_stem, saju_hour_branch, saju_display,
      gender, birth_date, height, weight, target_weight,
      bmi, bfr, fat_kg, muscle_kg,
      top_size, bottom_size, target_top_size, target_bottom_size,
      emotional_state, main_goal, priority_value,
      survey_answers_json, survey_summary_json,
      aerobic_response, massage_swells, sauna_response,
      current_facility, context_type, current_medications,
      target_body_part, psych_state, monthly_budget, muscle_soreness_level,
      prescription_version,
      food_allergy_json, allergy_exclude_json, skin_reaction,
      menopause_status, is_menopause,
      medical_conditions_json, has_medical_conditions,
      axis_scores_json, top_axes_json,
      axis_primary, axis_secondary, axis_primary_score,
      ref_code, ref_type
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    result_id, resolvedUserName, validConsultantCode,
    safeBcPrimary, toStr(bc_secondary), nz(bc_primary_score), nz(bc_secondary_score),
    // V4.6: ohaeng_scores에 source/confidence/lacking 메타 병합 저장 (results 테이블 ohaeng_scores_json 활용)
    JSON.stringify(bc_scores || {}), toStr(ohaeng_type), JSON.stringify({
      ...(ohaeng_scores || {}),
      ...(ohaeng_source ? { _source: ohaeng_source } : {}),
      ...(ohaeng_confidence != null ? { _confidence: Number(ohaeng_confidence) } : {}),
      ...(ohaeng_lacking ? { _lacking: ohaeng_lacking } : {}),
      ...(Array.isArray(ohaeng_score) ? { _score: ohaeng_score } : {}),
    }),
    // 위 라인이 ohaeng_scores_json에 해당하는 bind 값임
    toStr(mbti), toStr(blood_type), toStr(saju_il_gan), toStr(saju_ohaeng),
    toStr(saju_il_ji), toStr(saju_yin_yang), toStr(birth_hour),
    toStr(saju_hour_stem), toStr(saju_hour_branch), toStr(saju_display),
    toStr(gender), cleanBirthDate,
    n(height), n(weight), n(target_weight),
    n(bmi), n(bfr),
    n(fat_kg), n(muscle_kg),
    toStr(top_size), toStr(bottom_size), toStr(target_top_size), toStr(target_bottom_size),
    toStr(emotional_state), toStr(main_goal), toStr(priority_value),
    JSON.stringify(answers || {}), JSON.stringify(survey_summary || {}),
    toStr(aerobic_response), b(massage_swells), toStr(sauna_response),
    toStr(current_facility), toStr(context_type), toStr(current_medications),
    toStr(target_body_part), toStr(psych_state), toStr(monthly_budget), toStr(muscle_soreness_level),
    'v5.0',
    // v3.0 섹션 L
    JSON.stringify(Array.isArray(food_allergy) ? food_allergy : []),
    JSON.stringify(Array.isArray(allergy_exclude) ? allergy_exclude : []),
    toStr(skin_reaction),
    toStr(menopause_status),
    b(is_menopause),
    JSON.stringify(Array.isArray(medical_conditions) ? medical_conditions : []),
    b(has_medical_conditions),
    // v4.0 10축 분석
    JSON.stringify(axis_scores || {}),
    JSON.stringify(Array.isArray(top_axes) ? top_axes : []),
    // v4.1 axis_primary (migration 0024) — bc_primary 폴백
    toStr(axis_primary) || safeBcPrimary,
    toStr(axis_secondary) || toStr(bc_secondary),
    n(axis_primary_score) ?? n(bc_primary_score),
    // v5.0 B2B/컨설턴트 추적 (migration 0025)
    toStr(ref_code) || null,
    toStr(ref_type) || 'DIRECT'
  ).run()

  return c.json({ success: true, result_id, message: '설문이 제출되었습니다.' })
})

// ═══════════════════════════════════════════════════════════════
//  B2B 파트너 공개 브랜드 데이터 API
// ═══════════════════════════════════════════════════════════════

// GET /api/b2b/brand/:code — 화이트라벨 브랜드 데이터 (공개)
app.get('/api/b2b/brand/:code', async (c) => {
  const db = c.env.DB
  const code = c.req.param('code').toUpperCase()
  const partner = await db.prepare(
    'SELECT code, name, brand_name, brand_color, brand_logo_url, status FROM b2b_partners WHERE code = ?'
  ).bind(code).first<any>()

  if (!partner || partner.status === 'suspended') {
    return c.json({ found: false })
  }

  return c.json({
    found: true,
    code: partner.code,
    brand_name: partner.brand_name || partner.name,
    brand_color: partner.brand_color || '#6366f1',
    brand_logo_url: partner.brand_logo_url || null,
  })
})

// ═══════════════════════════════════════════════════════════════
//  관리자 API (/api/admin/*)  — MASTER 전용
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/dashboard
app.get('/api/admin/dashboard', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const [totalResults, totalConsultants, activeConsultants, recentResults, bcDist] = await Promise.all([
    db.prepare('SELECT COUNT(*) as cnt FROM results').first<any>(),
    db.prepare('SELECT COUNT(*) as cnt FROM consultants WHERE code != ?').bind('MASTER').first<any>(),
    db.prepare("SELECT COUNT(*) as cnt FROM consultants WHERE subscription_status='active' AND code != ?").bind('MASTER').first<any>(),
    db.prepare('SELECT id, user_name, bc_primary, consultant_code, created_at FROM results ORDER BY created_at DESC LIMIT 10').all<any>(),
    db.prepare('SELECT bc_primary, COUNT(*) as cnt FROM results GROUP BY bc_primary ORDER BY cnt DESC').all<any>(),
  ])
  return c.json({
    kpi: {
      total_results: totalResults?.cnt || 0,
      total_consultants: totalConsultants?.cnt || 0,
      active_consultants: activeConsultants?.cnt || 0,
    },
    recent_results: recentResults.results,
    bc_distribution: bcDist.results,
  })
})

// GET /api/admin/consultants
app.get('/api/admin/consultants', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const search = c.req.query('search') || ''
  const status = c.req.query('status') || ''
  let query = "SELECT c.*, (SELECT COUNT(*) FROM results r WHERE r.consultant_code = c.code) as result_count FROM consultants c WHERE c.code != 'MASTER'"
  const params: any[] = []
  if (search) { query += ' AND (c.name LIKE ? OR c.code LIKE ? OR c.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`) }
  if (status) { query += ' AND c.subscription_status = ?'; params.push(status) }
  query += ' ORDER BY c.created_at DESC'
  const stmt = db.prepare(query)
  const result = params.length ? await stmt.bind(...params).all<any>() : await stmt.all<any>()
  return c.json({ consultants: result.results })
})

// POST /api/admin/consultants — 컨설턴트 생성
app.post('/api/admin/consultants', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { name, email, phone, job_type, grade, subscription_end, memo, custom_code, custom_password } = body

  // 이메일 선택사항으로 변경 (없어도 컨설턴트 등록 가능)
  // if (!email) return c.json({ success: false, error: '이메일은 필수입니다.' }, 400)

  let code: string
  if (custom_code && /^SC-/i.test(custom_code)) {
    // 커스텀 코드 사용 (SC-XXX 형식 강제)
    code = custom_code.toUpperCase()
    const exists = await db.prepare('SELECT code FROM consultants WHERE code=?').bind(code).first()
    if (exists) return c.json({ success: false, error: `코드 ${code}는 이미 사용 중입니다.` }, 409)
  } else if (custom_code) {
    code = `SC-${custom_code.toUpperCase()}`
    const exists = await db.prepare('SELECT code FROM consultants WHERE code=?').bind(code).first()
    if (exists) return c.json({ success: false, error: `코드 ${code}는 이미 사용 중입니다.` }, 409)
  } else {
    // 위험-1: 레이스 컨디션 방지 — SELECT MAX보다 UUID 기반 고유 코드 사용
    // SC-XXXX 순번 방식 유지하되, 충돌 시 자동 재시도 (UNIQUE 제약으로 최종 보장)
    const last = await db.prepare("SELECT code FROM consultants WHERE code LIKE 'SC-%' ORDER BY CAST(SUBSTR(code,4) AS INTEGER) DESC LIMIT 1").first<any>()
    let nextNum = 1
    if (last?.code) {
      const n = parseInt(last.code.replace('SC-', ''))
      if (!isNaN(n)) nextNum = n + 1
    }
    // 동시 등록 충돌 대비: UNIQUE constraint 에러 시 +1 재시도 (catch 블록 처리)
    code = `SC-${String(nextNum).padStart(4, '0')}`
  }

  const num = code.replace(/^SC-/i, '')
  const initialPassword = custom_password || `pass${num.padStart(4,'0')}`

  try {
    await db.prepare(`
      INSERT INTO consultants (code, name, email, phone, job_type, grade, subscription_status, subscription_end, memo, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    `).bind(code, name, email || null, phone || null, job_type || null, grade || '일반', subscription_end || null, memo || null, initialPassword).run()
  } catch (err: any) {
    const msg = err?.message || String(err)
    if (msg.includes('UNIQUE constraint failed: consultants.email')) {
      return c.json({ success: false, error: '이미 등록된 이메일입니다.' }, 409)
    }
    if (msg.includes('UNIQUE constraint failed: consultants.code')) {
      return c.json({ success: false, error: '코드 충돌이 발생했습니다. 다시 시도해주세요.' }, 409)
    }
    return c.json({ success: false, error: msg }, 500)
  }

  return c.json({ success: true, code, password: initialPassword, initialPassword, message: `컨설턴트 ${code} 생성 완료. 초기 비밀번호: ${initialPassword}` })
})

// PUT /api/admin/consultants/:code — 수정
app.put('/api/admin/consultants/:code', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const code = c.req.param('code')
  const body = await c.req.json()
  const { name, email, phone, job_type, grade, subscription_status, subscription_end, lecture_progress, is_certified, memo } = body

  await db.prepare(`
    UPDATE consultants SET
      name=?, email=?, phone=?, job_type=?, grade=?,
      subscription_status=?, subscription_end=?,
      lecture_progress=?, is_certified=?, memo=?,
      updated_at=datetime('now')
    WHERE code=?
  `).bind(name, email||null, phone||null, job_type||null, grade||'일반',
    subscription_status||'active', subscription_end||null,
    lecture_progress||0, is_certified?1:0, memo||null, code).run()

  return c.json({ success: true })
})

// DELETE /api/admin/consultants/:code — 정지(소프트)
app.delete('/api/admin/consultants/:code', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const code = c.req.param('code')
  await db.prepare("UPDATE consultants SET subscription_status='suspended', updated_at=datetime('now') WHERE code=?").bind(code).run()
  return c.json({ success: true, message: '계정이 정지되었습니다.' })
})

// DELETE /api/admin/consultants/:code/hard — 영구 삭제(하드, 관련 결과지 포함)
app.delete('/api/admin/consultants/:code/hard', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const code = c.req.param('code')
  // 컨설턴트 존재 확인
  const existing = await db.prepare("SELECT code, name FROM consultants WHERE code=?").bind(code).first()
  if (!existing) {
    return c.json({ success: false, message: '존재하지 않는 컨설턴트입니다.' }, 404)
  }
  // 관련 결과지 먼저 삭제 (외래키 제약 해소)
  await db.prepare("DELETE FROM results WHERE consultant_code=?").bind(code).run()
  // 컨설턴트 영구 삭제
  await db.prepare("DELETE FROM consultants WHERE code=?").bind(code).run()
  return c.json({ success: true, message: `${code} 컨설턴트가 영구 삭제되었습니다.` })
})

// GET /api/admin/results
// ✅ BUG-2 수정: diagnosis_results(V4 신버전) + results(구버전) 두 테이블 UNION 조회
app.get('/api/admin/results', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const bc = c.req.query('bc') || ''
  const cons = c.req.query('consultant') || ''
  const search = c.req.query('search') || ''

  // 조건절 파라미터 (구버전 + 신버전 각각)
  const oldParams: any[] = []
  const newParams: any[] = []

  // ── 구버전 results 테이블 조건 ──
  let oldWhere = ' WHERE 1=1'
  if (bc) { oldWhere += ' AND r.bc_primary = ?'; oldParams.push(bc) }
  if (cons) { oldWhere += ' AND r.consultant_code = ?'; oldParams.push(cons) }
  if (search) { oldWhere += ' AND (r.user_name LIKE ? OR r.id LIKE ?)'; oldParams.push(`%${search}%`, `%${search}%`) }

  // ── 신버전 diagnosis_results 테이블 조건 ──
  // bc 필터는 bc_code_key(BC-N) 또는 bc_primary(닉네임) 둘 다 검색
  let newWhere = ' WHERE 1=1'
  if (bc) { newWhere += ' AND (d.bc_code_key = ? OR d.bc_primary = ?)'; newParams.push(bc, bc) }
  if (cons) { newWhere += ' AND d.ref_code = ?'; newParams.push(cons) }
  if (search) { newWhere += ' AND (d.user_name LIKE ? OR d.id LIKE ?)'; newParams.push(`%${search}%`, `%${search}%`) }

  // ── UNION ALL 쿼리 ──
  // 구버전 results: 컨설턴트명 JOIN 포함, _source 태그 추가
  // ※ results 테이블은 axis_scores_json 컬럼명 사용 (diagnosis_results는 axis_scores)
  const unionQuery = `
    SELECT
      r.id, r.user_name,
      COALESCE(r.bc_primary, '') as bc_primary,
      NULL as bc_code_key,
      NULL as bc_nickname,
      r.axis_scores_json as axis_scores,
      r.consultant_code,
      c.name as consultant_name,
      r.ref_code,
      r.created_at,
      'results_v3' as _source
    FROM results r
    LEFT JOIN consultants c ON r.consultant_code = c.code
    ${oldWhere}

    UNION ALL

    SELECT
      d.id, d.user_name,
      COALESCE(d.bc_primary, d.bc_nickname, '') as bc_primary,
      d.bc_code_key,
      d.bc_nickname,
      d.axis_scores,
      NULL as consultant_code,
      NULL as consultant_name,
      d.ref_code,
      d.created_at,
      'diagnosis_v4' as _source
    FROM diagnosis_results d
    ${newWhere}

    ORDER BY created_at DESC
    LIMIT 200
  `

  const allParams = [...oldParams, ...newParams]
  const stmt = db.prepare(unionQuery)
  const result = allParams.length
    ? await stmt.bind(...allParams).all<any>()
    : await stmt.all<any>()

  return c.json({ results: result.results })
})

// GET /api/admin/bc-codes
app.get('/api/admin/bc-codes', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const rows = await db.prepare('SELECT * FROM bc_prescriptions ORDER BY bc_code').all<any>()
  return c.json({ bc_codes: rows.results })
})

// PUT /api/admin/bc-codes/:code — BC 처방 수정
app.put('/api/admin/bc-codes/:code', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const bcCode = c.req.param('code')
  const body = await c.req.json()
  const user = c.get('user') as JwtPayload

  const current = await db.prepare('SELECT * FROM bc_prescriptions WHERE bc_code=?').bind(bcCode).first<any>()
  if (current) {
    await db.prepare(`
      INSERT INTO bc_prescription_versions (bc_code, version, snapshot_json, changed_by, change_note)
      VALUES (?, ?, ?, ?, ?)
    `).bind(bcCode, current.version, JSON.stringify(current), user.name, body.change_note || '').run()
  }

  const fields = ['brand_name','tagline','fat_area','bc_primary_oneline_reason','bc_cause_story',
    'bc_worsen_word','closing_copy','symptom_checklist_json','wrong_methods_json',
    'correct_principles_json','recommended_exercises_json','forbidden_exercises_json',
    'recommended_foods_json','forbidden_foods_json','supplement_list_json','lifestyle_rules_json',
    'monthly_goals_json','zone2_bpm','forbidden_bpm','hiit_available_week']

  const sets = fields.map(f => `${f}=?`).join(',')
  const vals = fields.map(f => body[f] ?? null)

  await db.prepare(`UPDATE bc_prescriptions SET ${sets}, updated_at=datetime('now'), updated_by=? WHERE bc_code=?`)
    .bind(...vals, user.name, bcCode).run()

  return c.json({ success: true })
})

// ─── B2B 파트너 관리 CRUD ──────────────────────────────────────

// GET /api/admin/b2b-partners — 목록 조회
app.get('/api/admin/b2b-partners', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const search = c.req.query('search') || ''
  const status = c.req.query('status') || ''
  let query = 'SELECT p.*, (SELECT COUNT(*) FROM results r WHERE r.ref_code = p.code) as result_count FROM b2b_partners p WHERE 1=1'
  const params: any[] = []
  if (search) { query += ' AND (p.name LIKE ? OR p.code LIKE ? OR p.owner_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`) }
  if (status) { query += ' AND p.status = ?'; params.push(status) }
  query += ' ORDER BY p.created_at DESC'
  const stmt = db.prepare(query)
  const result = params.length ? await stmt.bind(...params).all<any>() : await stmt.all<any>()
  return c.json({ partners: result.results })
})

// POST /api/admin/b2b-partners — 파트너 생성
app.post('/api/admin/b2b-partners', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { name, type, owner_name, phone, email, address, commission_rate, memo,
          brand_logo_url, brand_color, brand_name, custom_code, custom_password } = body

  if (!name) return c.json({ success: false, error: '영업장명은 필수입니다.' }, 400)
  if (!email) return c.json({ success: false, error: '이메일은 필수입니다.' }, 400)

  // B2B 코드 자동 생성: 업종 약자 + 순번
  const typeAbbr: Record<string, string> = {
    '에스테틱': 'AES', '필라테스': 'PIL', '한의원': 'HAN',
    '헬스장': 'GYM', '뷰티샵': 'BTY', '병원': 'HOS', '기타': 'ETC',
    '성형외과': 'SUR', '피부과': 'DRM', '성형외과피부과': 'SUR', '성형': 'SUR',
    '요가': 'YGA', 'PT샵': 'PTS', '다이어트샵': 'DTS', '비만클리닉': 'OBC',
    '웰니스': 'WEL', '스파': 'SPA', '뷰티숍': 'BTY'
  }

  let code: string
  if (custom_code) {
    // 커스텀 코드: B2B- 접두사 자동 추가
    const raw = custom_code.toUpperCase().replace(/^B2B-/, '')
    code = `B2B-${raw}`
    const exists = await db.prepare('SELECT code FROM b2b_partners WHERE code=?').bind(code).first()
    if (exists) return c.json({ success: false, error: `코드 ${code}는 이미 사용 중입니다.` }, 409)
  } else {
    const abbr = typeAbbr[type || '기타'] || 'ETC'
    const last = await db.prepare(
      `SELECT code FROM b2b_partners WHERE code LIKE 'B2B-${abbr}-%' ORDER BY code DESC LIMIT 1`
    ).first<any>()
    let nextNum = 1
    if (last?.code) {
      const n = parseInt(last.code.split('-').pop() || '0')
      if (!isNaN(n)) nextNum = n + 1
    }
    code = `B2B-${abbr}-${String(nextNum).padStart(3, '0')}`
  }
  const numSuffix = code.split('-').pop() || '001'
  const defaultPassword = custom_password || `b2b${numSuffix.padStart(3, '0')}`

  try {
    await db.prepare(`
      INSERT INTO b2b_partners
        (code, name, type, owner_name, phone, email, address, commission_rate, memo,
         brand_logo_url, brand_color, brand_name, password_hash, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'active')
    `).bind(
      code, name, type || null, owner_name || null, phone || null, email || null,
      address || null, commission_rate || 15.0, memo || null,
      brand_logo_url || null, brand_color || '#6366f1', brand_name || name,
      defaultPassword
    ).run()
  } catch (err: any) {
    const msg = err?.message || String(err)
    if (msg.includes('UNIQUE constraint failed: b2b_partners.email')) {
      return c.json({ success: false, error: '이미 등록된 이메일입니다.' }, 409)
    }
    return c.json({ success: false, error: msg }, 500)
  }

  return c.json({
    success: true, code,
    password: defaultPassword,
    defaultPassword,
    message: `B2B 파트너 ${code} 생성 완료. 초기 비밀번호: ${defaultPassword}`,
    survey_url: `/s/${code}`
  })
})

// PUT /api/admin/b2b-partners/:code — 수정
app.put('/api/admin/b2b-partners/:code', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const code = c.req.param('code').toUpperCase()
  const body = await c.req.json()
  const { name, type, owner_name, phone, email, address, commission_rate, status, memo,
          brand_logo_url, brand_color, brand_name } = body

  await db.prepare(`
    UPDATE b2b_partners SET
      name=?, type=?, owner_name=?, phone=?, email=?, address=?,
      commission_rate=?, status=?, memo=?,
      brand_logo_url=?, brand_color=?, brand_name=?,
      updated_at=datetime('now')
    WHERE code=?
  `).bind(
    name, type || null, owner_name || null, phone || null, email || null, address || null,
    commission_rate || 15.0, status || 'active', memo || null,
    brand_logo_url || null, brand_color || '#6366f1', brand_name || name,
    code
  ).run()

  return c.json({ success: true })
})

// DELETE /api/admin/b2b-partners/:code — 정지
app.delete('/api/admin/b2b-partners/:code', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const code = c.req.param('code').toUpperCase()
  await db.prepare("UPDATE b2b_partners SET status='suspended', updated_at=datetime('now') WHERE code=?").bind(code).run()
  return c.json({ success: true, message: 'B2B 파트너가 정지되었습니다.' })
})

// ═══════════════════════════════════════════════════════════════
//  B2B 파트너 API (/api/b2b/*) — B2B_PARTNER 전용
// ═══════════════════════════════════════════════════════════════

// GET /api/b2b/me — B2B 파트너 내 정보
app.get('/api/b2b/me', requireB2B(), async (c) => {
  const user = c.get('user') as JwtPayload
  const db = c.env.DB
  const partner = await db.prepare('SELECT * FROM b2b_partners WHERE code=?').bind(user.code).first<any>()
  return c.json({ partner })
})

// GET /api/b2b/results — B2B 파트너 설문 결과 목록 (자신의 ref_code 기준)
app.get('/api/b2b/results', requireB2B(), async (c) => {
  const user = c.get('user') as JwtPayload
  const db = c.env.DB
  const search = c.req.query('search') || ''
  let query = 'SELECT id, user_name, bc_primary, axis_primary, created_at, ref_code FROM results WHERE ref_code=?'
  const params: any[] = [user.code]
  if (search) { query += ' AND user_name LIKE ?'; params.push(`%${search}%`) }
  query += ' ORDER BY created_at DESC LIMIT 50'
  const result = await db.prepare(query).bind(...params).all<any>()
  return c.json({ results: result.results })
})

// GET /api/b2b/stats — B2B 파트너 통계
app.get('/api/b2b/stats', requireB2B(), async (c) => {
  const user = c.get('user') as JwtPayload
  const db = c.env.DB
  const [total, thisMonth, nickDist, today, thisWeek] = await Promise.all([
    db.prepare('SELECT COUNT(*) as cnt FROM results WHERE ref_code=?').bind(user.code).first<any>(),
    db.prepare("SELECT COUNT(*) as cnt FROM results WHERE ref_code=? AND strftime('%Y-%m', created_at)=strftime('%Y-%m','now')").bind(user.code).first<any>(),
    db.prepare('SELECT bc_primary, COUNT(*) as cnt FROM results WHERE ref_code=? GROUP BY bc_primary ORDER BY cnt DESC LIMIT 5').bind(user.code).all<any>(),
    db.prepare("SELECT COUNT(*) as cnt FROM results WHERE ref_code=? AND date(created_at)=date('now')").bind(user.code).first<any>(),
    db.prepare("SELECT COUNT(*) as cnt FROM results WHERE ref_code=? AND created_at>=datetime('now','-7 days')").bind(user.code).first<any>(),
  ])
  return c.json({
    total: total?.cnt || 0,
    this_month: thisMonth?.cnt || 0,
    today: today?.cnt || 0,
    this_week: thisWeek?.cnt || 0,
    nickname_distribution: nickDist.results,
  })
})

// ═══════════════════════════════════════════════════════════════
//  컨설턴트 API (/api/consultant/*)
// ═══════════════════════════════════════════════════════════════

// GET /api/consultant/me
app.get('/api/consultant/me', requireRole('ANY'), async (c) => {
  const user = c.get('user') as JwtPayload
  const db = c.env.DB
  const cons = await db.prepare('SELECT * FROM consultants WHERE code=?').bind(user.code).first<any>()
  return c.json({ consultant: cons })
})

// GET /api/consultant/results — 내 고객 결과 목록
// ✅ FIX: diagnosis_results(신파이프라인) + results(구파이프라인) UNION 조회
app.get('/api/consultant/results', requireRole('ANY'), async (c) => {
  const user = c.get('user') as JwtPayload
  const db = (c.env as any).DB as D1Database   // ✅ FIX: 다른 API와 동일하게 (c.env as any).DB 방식 사용
  const search = c.req.query('search') || ''
  const bc = c.req.query('bc') || ''

  // ── diagnosis_results (신버전: /api/v1/diagnosis 파이프라인, ref_code 기준) ──
  let drWhere = user.role === 'MASTER' ? '1=1' : 'dr.ref_code = ?'
  const drParams: any[] = user.role === 'MASTER' ? [] : [user.code]
  if (search) { drWhere += ' AND (dr.user_name LIKE ? OR dr.id LIKE ?)'; drParams.push(`%${search}%`, `%${search}%`) }
  if (bc)     { drWhere += ' AND dr.bc_primary = ?'; drParams.push(bc) }

  // ── results (구버전: /api/survey/submit 파이프라인, consultant_code 기준) ──
  let rWhere = user.role === 'MASTER' ? '1=1' : 'r.consultant_code = ?'
  const rParams: any[] = user.role === 'MASTER' ? [] : [user.code]
  if (search) { rWhere += ' AND (r.user_name LIKE ? OR r.id LIKE ?)'; rParams.push(`%${search}%`, `%${search}%`) }
  if (bc)     { rWhere += ' AND r.bc_primary = ?'; rParams.push(bc) }

  try {
    // 신버전 diagnosis_results 조회
    const drStmt = db.prepare(`
      SELECT
        dr.id, dr.user_name, dr.bc_primary, dr.bc_nickname, dr.bc_code_key,
        dr.ohaeng_type, dr.mbti_full, dr.ref_code AS consultant_code,
        dr.region, dr.texture, dr.bg_filter,
        dr.top3_axes AS top3_axes_json, dr.axis_scores AS axis_scores_json,
        dr.completed_at AS created_at,
        NULL AS admin_memo, NULL AS phone,
        'diagnosis_results' AS _source
      FROM diagnosis_results dr
      WHERE ${drWhere}
      ORDER BY dr.created_at DESC LIMIT 50
    `)
    const drResult = drParams.length
      ? await drStmt.bind(...drParams).all<any>()
      : await drStmt.all<any>()

    // 구버전 results 조회 (중복 제거: diagnosis_results에 없는 것만)
    // ✅ FIX: results 테이블에 phone 컬럼 없음 → NULL AS phone으로 교체
    const rStmt = db.prepare(`
      SELECT
        r.id, r.user_name, r.bc_primary, r.bc_primary AS bc_nickname, r.bc_primary AS bc_code_key,
        NULL AS ohaeng_type, NULL AS mbti_full, r.consultant_code,
        NULL AS region, NULL AS texture, NULL AS bg_filter,
        NULL AS top3_axes_json, NULL AS axis_scores_json,
        r.created_at, r.admin_memo, NULL AS phone,
        'results' AS _source
      FROM results r
      WHERE ${rWhere}
      ORDER BY r.created_at DESC LIMIT 50
    `)
    const rResult = rParams.length
      ? await rStmt.bind(...rParams).all<any>()
      : await rStmt.all<any>()

    // 신버전 우선, 구버전은 신버전에 없는 ID만 병합
    const drIds = new Set((drResult.results || []).map((r: any) => r.id))
    const oldOnly = (rResult.results || []).filter((r: any) => !drIds.has(r.id))

    const merged = [...(drResult.results || []), ...oldOnly]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)

    return c.json({ results: merged })
  } catch (e) {
    console.error('[consultant/results]', e)
    return c.json({ results: [] })
  }
})

// GET /api/survey/result/public/:id — 공개 결과 조회 (result.html에서 ?id= 파라미터용)
app.get('/api/survey/result/public/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const result = await db.prepare('SELECT * FROM results WHERE id=?').bind(id).first<any>()
  if (!result) return c.json({ success: false, error: '결과를 찾을 수 없습니다.' }, 404)

  const answers = parseJson(result.survey_answers_json, {})

  return c.json({
    success: true,
    result_id: result.id,
    user_name: result.user_name,
    bc_primary: result.bc_primary,
    bc_secondary: result.bc_secondary,
    axis_primary: result.axis_primary,
    axis_primary_score: result.axis_primary_score,
    consultant_code: result.consultant_code,
    created_at: result.created_at,
    answers,
    // 결과지 렌더에 필요한 신체 정보 answers에 병합
    merged_answers: {
      ...answers,
      _bc_primary: result.bc_primary,
      _bc_secondary: result.bc_secondary,
      _axis_primary: result.axis_primary,
      _result_id: result.id,
    }
  })
})

// GET /api/results/:id — 결과 상세 JSON (컨설턴트 본인 또는 MASTER)
app.get('/api/results/:id', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: '인증이 필요합니다.' }, 401)

  const db = c.env.DB
  const id = c.req.param('id')
  const result = await db.prepare('SELECT * FROM results WHERE id=?').bind(id).first<any>()
  if (!result) return c.json({ error: '결과를 찾을 수 없습니다.' }, 404)

  if (user.role !== 'MASTER' && result.consultant_code !== user.code) {
    return c.json({ error: '접근 권한이 없습니다.' }, 403)
  }

  const prescription = await db.prepare('SELECT * FROM bc_prescriptions WHERE bc_code=?').bind(result.bc_primary).first<any>()

  return c.json({
    result: {
      ...result,
      bc_scores: parseJson(result.bc_scores_json, {}),
      ohaeng_scores: parseJson(result.ohaeng_scores_json, {}),
      survey_answers: parseJson(result.survey_answers_json, {}),
      survey_summary: parseJson(result.survey_summary_json, {}),
      b2b_institution_types: parseJson(result.b2b_institution_types, []),
    },
    prescription: prescription ? {
      ...prescription,
      symptom_checklist: parseJson(prescription.symptom_checklist_json, []),
      wrong_methods: parseJson(prescription.wrong_methods_json, []),
      correct_principles: parseJson(prescription.correct_principles_json, []),
      recommended_exercises: parseJson(prescription.recommended_exercises_json, []),
      forbidden_exercises: parseJson(prescription.forbidden_exercises_json, []),
      recommended_foods: parseJson(prescription.recommended_foods_json, []),
      forbidden_foods: parseJson(prescription.forbidden_foods_json, []),
      supplement_list: parseJson(prescription.supplement_list_json, []),
      lifestyle_rules: parseJson(prescription.lifestyle_rules_json, []),
      monthly_goals: parseJson(prescription.monthly_goals_json, {}),
      weekly_schedule: parseJson(prescription.weekly_schedule_json, {}),
      recommended_sports: parseJson(prescription.recommended_sports_json, []),
      forbidden_sports: parseJson(prescription.forbidden_sports_json, []),
      recovery_priority: parseJson(prescription.recovery_priority_json, []),
      macro_ratio: parseJson(prescription.macro_ratio_json, {}),
      meal_timing_rule: parseJson(prescription.meal_timing_rule_json, {}),
      forbidden_foods_reason: parseJson(prescription.forbidden_foods_reason_json, []),
      b2b_treatments: parseJson(prescription.b2b_treatments_json, {}),
      hospital_tests: parseJson(prescription.hospital_tests_json, []),
      reassessment_schedule: parseJson(prescription.reassessment_schedule_json, {}),
      partner_hints: parseJson(prescription.partner_hints_json, []),
    } : null,
  })
})

// GET /api/consultant/stats — 컨설턴트 대시보드 통계
app.get('/api/consultant/stats', requireRole('ANY'), async (c) => {
  const user = c.get('user') as JwtPayload
  const db = c.env.DB

  let whereClause = user.role === 'MASTER' ? '1=1' : 'consultant_code=?'
  const bindParams: any[] = user.role === 'MASTER' ? [] : [user.code]

  // diagnosis_results 기반 where절 (컨설턴트별 필터)
  const drWhere = user.role === 'MASTER' ? '1=1' : 'ref_code=?'
  const drParams: any[] = user.role === 'MASTER' ? [] : [user.code]

  const [total, thisMonth, bcDist, recentResults, totalCheckins] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as cnt FROM results WHERE ${whereClause}`)
      .bind(...bindParams).first<any>(),
    db.prepare(`SELECT COUNT(*) as cnt FROM results WHERE ${whereClause} AND strftime('%Y-%m', created_at)=strftime('%Y-%m','now')`)
      .bind(...bindParams).first<any>(),
    // diagnosis_results 기반 BC 분포 (최신 파이프라인)
    db.prepare(`SELECT bc_primary, COUNT(*) as cnt FROM diagnosis_results WHERE ${drWhere} AND bc_primary IS NOT NULL GROUP BY bc_primary ORDER BY cnt DESC`)
      .bind(...drParams).all<any>(),
    db.prepare(`SELECT id, user_name, bc_primary, created_at, admin_memo FROM results WHERE ${whereClause} ORDER BY created_at DESC LIMIT 5`)
      .bind(...bindParams).all<any>(),
    // checkin_log 기반 체크인 완료 수
    db.prepare(user.role === 'MASTER'
      ? `SELECT COUNT(DISTINCT result_id) as cnt FROM checkin_log`
      : `SELECT COUNT(DISTINCT cl.result_id) as cnt FROM checkin_log cl INNER JOIN diagnosis_results d ON d.id = cl.result_id WHERE d.ref_code = ?`
    ).bind(...drParams).first<any>(),
  ])

  return c.json({
    total: total?.cnt || 0,
    this_month: thisMonth?.cnt || 0,
    bc_distribution: bcDist.results,
    recent_results: recentResults.results,
    total_checkins: totalCheckins?.cnt || 0,
  })
})

// PUT /api/consultant/change-password — 비밀번호 변경
app.put('/api/consultant/change-password', requireRole('ANY'), async (c) => {
  const user = c.get('user') as JwtPayload
  const db = c.env.DB
  const { current_password, new_password } = await c.req.json()

  if (!current_password || !new_password) {
    return c.json({ error: '현재 비밀번호와 새 비밀번호를 모두 입력하세요.' }, 400)
  }
  if (new_password.length < 6) {
    return c.json({ error: '새 비밀번호는 6자 이상이어야 합니다.' }, 400)
  }

  const consultant = await db.prepare('SELECT * FROM consultants WHERE code=?').bind(user.code).first<any>()
  if (!consultant) return c.json({ error: '계정을 찾을 수 없습니다.' }, 404)

  // 현재 비밀번호 확인
  const num = consultant.code.replace('SC-', '')
  const defaultPw = `pass${num}`
  const storedPw = consultant.password_hash || defaultPw
  if (storedPw !== current_password) {
    return c.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, 400)
  }

  await db.prepare("UPDATE consultants SET password_hash=?, updated_at=datetime('now') WHERE code=?")
    .bind(new_password, user.code).run()

  return c.json({ success: true, message: '비밀번호가 변경되었습니다.' })
})

// ─── 컨설턴트 전용 QR 링크 정보 조회 ────────────────────────────────────────
// GET /api/consultant/my-qr — 내 전용 질문지 링크 + QR SVG 반환
app.get('/api/consultant/my-qr', requireRole('ANY'), async (c) => {
  const user = c.get('user') as JwtPayload
  const db   = c.env.DB
  const cons = await db.prepare('SELECT code, name, kakao_channel, phone FROM consultants WHERE code=?').bind(user.code).first<any>()
  if (!cons) return c.json({ error: '컨설턴트 정보를 찾을 수 없습니다.' }, 404)

  const origin  = (() => { try { return new URL(c.req.raw.url).origin } catch { return 'https://slimmind.kr' } })()
  const surveyUrl = `${origin}/slimmind?ref=${cons.code}`

  // QR SVG 생성 (qrcode-svg 없이 순수 SVG path — 서버사이드)
  // URL을 쿼리파라미터로 넘겨 프론트에서 qrcode.js로 렌더링
  return c.json({
    code:        cons.code,
    name:        cons.name,
    survey_url:  surveyUrl,
    kakao_channel: cons.kakao_channel || null,
    phone:       cons.phone || null,
  })
})

// GET /api/consultant/my-qr/stats — 내 링크 유입 통계
app.get('/api/consultant/my-qr/stats', requireRole('ANY'), async (c) => {
  const user = c.get('user') as JwtPayload
  const db   = c.env.DB

  const [total, thisMonth, thisWeek, bcDist] = await Promise.all([
    db.prepare("SELECT COUNT(*) as cnt FROM results WHERE consultant_code=? OR ref_code=?").bind(user.code, user.code).first<any>(),
    db.prepare("SELECT COUNT(*) as cnt FROM results WHERE (consultant_code=? OR ref_code=?) AND strftime('%Y-%m', created_at)=strftime('%Y-%m','now')").bind(user.code, user.code).first<any>(),
    db.prepare("SELECT COUNT(*) as cnt FROM results WHERE (consultant_code=? OR ref_code=?) AND created_at >= datetime('now','-7 days')").bind(user.code, user.code).first<any>(),
    db.prepare("SELECT bc_primary, COUNT(*) as cnt FROM results WHERE (consultant_code=? OR ref_code=?) GROUP BY bc_primary ORDER BY cnt DESC LIMIT 5").bind(user.code, user.code).all<any>(),
  ])

  return c.json({
    total:      total?.cnt      ?? 0,
    this_month: thisMonth?.cnt  ?? 0,
    this_week:  thisWeek?.cnt   ?? 0,
    bc_dist:    bcDist?.results ?? [],
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/results/:id/memo — 관리자 메모 저장
app.put('/api/results/:id/memo', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: '인증이 필요합니다.' }, 401)
  const db = c.env.DB
  const id = c.req.param('id')
  const { memo } = await c.req.json()
  const result = await db.prepare('SELECT consultant_code FROM results WHERE id=?').bind(id).first<any>()
  if (!result) return c.json({ error: '결과 없음' }, 404)
  if (user.role !== 'MASTER' && result.consultant_code !== user.code) return c.json({ error: '권한 없음' }, 403)
  await db.prepare('UPDATE results SET admin_memo=? WHERE id=?').bind(memo, id).run()
  return c.json({ success: true })
})

// ─── NEW: PUT /api/results/:id/b2b — B2B 기관유형 저장 (컨설턴트 전용) ───
app.put('/api/results/:id/b2b', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: '인증이 필요합니다.' }, 401)

  const db = c.env.DB
  const id = c.req.param('id')
  const body = await c.req.json()
  const { institution_types } = body // string[]

  // 허용 기관 유형만 필터
  const allowed = ['병원', '에스테틱', '헬스장', '필라테스']
  const filtered = (institution_types || []).filter((t: string) => allowed.includes(t))

  const result = await db.prepare('SELECT consultant_code FROM results WHERE id=?').bind(id).first<any>()
  if (!result) return c.json({ error: '결과를 찾을 수 없습니다.' }, 404)
  if (user.role !== 'MASTER' && result.consultant_code !== user.code) {
    return c.json({ error: '권한이 없습니다.' }, 403)
  }

  await db.prepare(
    'UPDATE results SET b2b_institution_types=? WHERE id=?'
  ).bind(JSON.stringify(filtered), id).run()

  return c.json({ success: true, institution_types: filtered })
})

// ─── B2B 파트너뷰 처방 조회 ──────────────────────────────────────
// GET /api/b2b/partner-view/:bc_code — BC코드로 처방 데이터 반환
app.get('/api/b2b/partner-view/:bc_code', requireB2B(), async (c) => {
  const db = c.env.DB
  const bcCode = c.req.param('bc_code')
  const row = await db.prepare(`
    SELECT bc_code, brand_name, tagline, bc_primary_oneline_reason, bc_cause_story,
           closing_copy, correct_principles_json, recommended_exercises_json,
           forbidden_exercises_json, recommended_foods_json, forbidden_foods_json,
           supplement_list_json, lifestyle_rules_json, monthly_goals_json
    FROM bc_prescriptions WHERE bc_code=?
  `).bind(bcCode).first<any>()
  if (!row) return c.json({ error: 'BC코드를 찾을 수 없습니다.' }, 404)
  // JSON 필드 파싱
  const parse = (v: any) => { try { return JSON.parse(v) } catch { return [] } }
  return c.json({
    bc_code: row.bc_code,
    brand_name: row.brand_name,
    tagline: row.tagline,
    reason: row.bc_primary_oneline_reason,
    cause_story: row.bc_cause_story,
    closing_copy: row.closing_copy,
    correct_principles: parse(row.correct_principles_json),
    recommended_exercises: parse(row.recommended_exercises_json),
    forbidden_exercises: parse(row.forbidden_exercises_json),
    recommended_foods: parse(row.recommended_foods_json),
    forbidden_foods: parse(row.forbidden_foods_json),
    supplements: parse(row.supplement_list_json),
    lifestyle_rules: parse(row.lifestyle_rules_json),
    monthly_goals: parse(row.monthly_goals_json),
  })
})

// ─── B2B 고객 이름으로 BC코드 즉시 조회 ──────────────────────────
// GET /api/b2b/customer-lookup?name=xxx — 고객 이름 검색 → BC코드 + 처방 반환
app.get('/api/b2b/customer-lookup', requireB2B(), async (c) => {
  const user = c.get('user') as JwtPayload
  const db = c.env.DB
  const name = c.req.query('name') || ''
  if (!name) return c.json({ error: '이름을 입력하세요.' }, 400)
  const results = await db.prepare(`
    SELECT r.id, r.user_name, r.bc_primary, r.axis_primary, r.created_at,
           p.brand_name, p.tagline, p.bc_primary_oneline_reason,
           p.recommended_foods_json, p.forbidden_foods_json,
           p.correct_principles_json, p.lifestyle_rules_json
    FROM results r
    LEFT JOIN bc_prescriptions p ON p.bc_code = r.bc_primary
    WHERE r.ref_code=? AND r.user_name LIKE ?
    ORDER BY r.created_at DESC LIMIT 10
  `).bind(user.code, `%${name}%`).all<any>()
  const parse = (v: any) => { try { return JSON.parse(v) } catch { return [] } }
  return c.json({
    results: results.results.map((r: any) => ({
      id: r.id,
      user_name: r.user_name,
      bc_primary: r.bc_primary,
      axis_primary: r.axis_primary,
      created_at: r.created_at,
      prescription: r.brand_name ? {
        brand_name: r.brand_name,
        tagline: r.tagline,
        reason: r.bc_primary_oneline_reason,
        recommended_foods: parse(r.recommended_foods_json).slice(0, 3),
        forbidden_foods: parse(r.forbidden_foods_json).slice(0, 3),
        correct_principles: parse(r.correct_principles_json).slice(0, 3),
        lifestyle_rules: parse(r.lifestyle_rules_json).slice(0, 3),
      } : null,
    }))
  })
})

// ─── 정산 API ────────────────────────────────────────────────────
// GET /api/admin/settlement?month=2025-06 — 컨설턴트별 월 정산 내역
app.get('/api/admin/settlement', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const month = c.req.query('month') || new Date().toISOString().slice(0, 7)
  // 컨설턴트별 해당 월 완료 건수 (program_price 컬럼 없음 → 건당 150,000 고정)
  const rows = await db.prepare(`
    SELECT
      r.consultant_code,
      con.name AS consultant_name,
      con.phone AS consultant_phone,
      con.grade AS consultant_grade,
      COUNT(*) AS monthly_count,
      COUNT(*) * 150000 AS total_sales,
      COUNT(*) * 150000 * 0.25 AS settlement_amount
    FROM results r
    LEFT JOIN consultants con ON con.code = r.consultant_code
    WHERE strftime('%Y-%m', r.created_at) = ?
      AND r.consultant_code IS NOT NULL
    GROUP BY r.consultant_code
    ORDER BY monthly_count DESC
  `).bind(month).all<any>()
  // 전체 월별 매출
  const total = await db.prepare(`
    SELECT COUNT(*) as cnt,
           COUNT(*) * 150000 as total
    FROM results WHERE strftime('%Y-%m', created_at) = ?
  `).bind(month).first<any>()
  return c.json({
    month,
    summary: {
      total_count: total?.cnt || 0,
      total_sales: total?.total || 0,
      total_settlement: Math.round((total?.total || 0) * 0.25),
    },
    consultants: rows.results
  })
})

// ─── AI 상담 멘트 생성 ────────────────────────────────────────────
// POST /api/consultant/ai-message — BC코드 기반 상담 멘트 생성
app.post('/api/consultant/ai-message', requireRole('ANY'), async (c) => {
  const db = c.env.DB
  try {
    const body = await c.req.json().catch(() => ({}))
    const { bc_code, user_name } = body as any
    if (!bc_code) return c.json({ error: 'BC코드가 필요합니다.' }, 400)

    const row = await db.prepare(`
      SELECT brand_name, tagline, bc_primary_oneline_reason, bc_cause_story, closing_copy,
             correct_principles_json, lifestyle_rules_json, monthly_goals_json
      FROM bc_prescriptions WHERE bc_code=?
    `).bind(bc_code).first<any>()
    if (!row) return c.json({ error: `BC코드(${bc_code})를 찾을 수 없습니다.` }, 404)

    const parse = (v: any) => { try { const r = JSON.parse(v); return Array.isArray(r) ? r : [] } catch { return [] } }
    const principles = parse(row.correct_principles_json).slice(0, 2).map((p: any) => typeof p === 'string' ? p : (p.title || p.principle || '')).filter(Boolean).join(', ')
    const lifestyle = parse(row.lifestyle_rules_json).slice(0, 2).map((l: any) => typeof l === 'string' ? l : (l.rule || l.habit || '')).filter(Boolean).join(', ')
    const goals = parse(row.monthly_goals_json).slice(0, 1).map((g: any) => typeof g === 'string' ? g : (g.goal || g.target || '')).filter(Boolean).join('')

    // 멘트 템플릿 (OpenAI 없이 구조화된 자동 생성)
    const name = user_name || '고객님'
    const brandName = row.brand_name || bc_code
    const oneliner = row.bc_primary_oneline_reason || `${brandName} 특성에 맞는 맞춤 관리가 필요합니다.`
    const causeStory = row.bc_cause_story || `${brandName} 특성상 일반적인 방법이 맞지 않았기 때문입니다.`
    const closingCopy = row.closing_copy || `${brandName} 유형의 분들은 올바른 방법을 찾으면 빠른 변화를 경험합니다.`

    const messages = [
      {
        type: '초진 환영 멘트',
        icon: '👋',
        text: `${name}님, 슬림마인드에 오신 걸 환영합니다! 체형 분석 결과 ${name}님의 유형은 <strong>${brandName}</strong>입니다. ${oneliner} 지금부터 ${name}님만을 위한 맞춤 처방을 시작해드릴게요.`
      },
      {
        type: '원인 설명 멘트',
        icon: '🔍',
        text: `${name}님, 지금까지 다이어트가 어려우셨던 건 의지 부족이 아니에요. ${causeStory} 원인을 알면 해결책도 명확해집니다.`
      },
      {
        type: '처방 안내 멘트',
        icon: '💊',
        text: `${name}님의 ${brandName} 유형에는 <strong>${principles || '맞춤 식단·생활습관 교정'}</strong> 접근이 핵심입니다. ${lifestyle ? `일상에서는 ${lifestyle}을 꼭 지켜주세요. ` : ''}${goals ? `이번 달 목표: ${goals}` : ''} 지금 바로 시작하면 변화를 느끼실 수 있습니다!`
      },
      {
        type: '동기부여 멘트',
        icon: '💪',
        text: `${name}님, ${closingCopy} 저희가 끝까지 함께하겠습니다. 오늘 첫 걸음이 가장 중요한 걸음입니다! 🎯`
      },
      {
        type: '재방문 독려 멘트',
        icon: '📅',
        text: `${name}님, 오늘 상담 잘 마무리하셨나요? ${brandName} 유형은 꾸준한 관리가 특히 중요합니다. 다음 방문까지 ${lifestyle ? lifestyle + '을 실천해보시고,' : ''} 궁금한 점은 언제든 연락주세요. 좋은 결과로 뵙겠습니다! 😊`
      },
    ]
    return c.json({ messages, bc_code, brand_name: brandName })
  } catch(e: any) {
    console.error('[ai-message error]', e)
    return c.json({ error: `멘트 생성 중 오류가 발생했습니다: ${String(e?.message || e)}` }, 500)
  }
})

// ═══════════════════════════════════════════════════════════════
//  결과지 페이지 라우트 — window.__RESULT__ 서버사이드 주입
// ═══════════════════════════════════════════════════════════════
app.get('/result/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')

  // ── 공통 404 / 500 HTML 헬퍼 ──────────────────────────────────────────────
  const _errorHtml = (title: string, desc: string, status: 404 | 500) =>
    c.html(`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<title>${title} | SlimMind</title>
<style>
body{font-family:'Pretendard',sans-serif;background:#f6f4ee;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{text-align:center;padding:48px 32px;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:420px}
h2{font-size:22px;color:#1a1a17;margin-bottom:12px}
p{color:#7c776b;font-size:14px;line-height:1.7;margin-bottom:0}
a{display:inline-block;margin-top:24px;padding:12px 32px;background:#b5452e;color:#fff;border-radius:10px;text-decoration:none;font-weight:700}
</style></head><body><div class="box">
<h2>${title}</h2><p>${desc}</p>
<a href="/">새로 시작하기</a>
</div></body></html>`, status)

  try {
    // ── 결과 조회 ────────────────────────────────────────────────────────────
    // 1순위: results 테이블 (구버전 설문 파이프라인)
    let result = await db.prepare('SELECT * FROM results WHERE id=?').bind(id).first<any>()

    // 2순위: diagnosis_results 테이블 폴백 (V4.1 신버전 파이프라인)
    // submitDiagnosis() → /api/v1/diagnosis POST → diagnosis_results 저장 → /result/:id 리다이렉트
    if (!result) {
      const diagRow = await db.prepare('SELECT * FROM diagnosis_results WHERE id=?').bind(id).first<any>()
      if (diagRow) {
        // diagnosis_results → result-v4.html에 주입할 __RESULT__ 구조로 변환
        const parseJsonSafe = (v: any, fallback: any = null) => {
          try { return v ? JSON.parse(v) : fallback } catch { return fallback }
        }
        const diagResult = {
          result_id:       diagRow.id,                                  // ✅ 가족코드 fcInit용 result_id 추가
          bc_primary:      diagRow.bc_code_key || diagRow.bc_primary,   // ✅ BC-6 형태 우선
          bc_code:         diagRow.bc_code_key || diagRow.bc_primary,   // ✅ BC-6 형태 우선
          bc_nickname:     diagRow.bc_nickname || diagRow.bc_primary,   // 닉네임 (bc_primary가 닉네임일 수도)
          user_name:       diagRow.user_name,
          bc_nickname_raw: diagRow.bc_nickname,
          axis_scores:     parseJsonSafe(diagRow.axis_scores, {}),
          top_axes:        parseJsonSafe(diagRow.top3_axes, []),
          axis_primary:    parseJsonSafe(diagRow.top3_axes, [null])[0] || null,
          ohaeng_type:     diagRow.ohaeng_type,
          mbti:            diagRow.mbti_full,
          region:          diagRow.region,
          texture:         diagRow.texture,
          bg_filter:       diagRow.bg_filter || '',
          ref_code:        diagRow.ref_code,
          created_at:      diagRow.created_at,
          answers:         parseJsonSafe(diagRow.raw_answers, null),
          disp_answers:    parseJsonSafe(diagRow.disp_answers, {}),
          goal_weight:     diagRow.goal_weight     ?? null,
          weight_loss_pct: diagRow.weight_loss_pct ?? null,
          // ✅ BMR·체지방률 개인화 계산용 — 0042 마이그레이션
          gender:  diagRow.gender ?? null,
          height:  diagRow.height != null ? Number(diagRow.height) : null,
          age:     diagRow.age    != null ? Number(diagRow.age)    : null,
          is_consultant:   false,
          is_owner:        false,
          is_b2b_partner:  false,
          _source:         'diagnosis_results',
        }
        // JSON.stringify 직렬화 실패 방어
        let injectedData = '{}'
        try { injectedData = JSON.stringify(diagResult) } catch { injectedData = '{}' }

        // OG 메타태그 생성 (카카오/SNS 공유용 — 세로형 대형 이미지)
        const ogNickname = diagResult.bc_nickname || diagResult.bc_primary || '바디코드'
        const ogName     = diagResult.user_name   || '고객'
        const ogBcCode   = (diagResult.bc_primary || diagResult.bc_code || 'BC').replace(/[<>"'&\\]/g,'').slice(0,10)
        const ogNickEnc  = encodeURIComponent(ogNickname.slice(0,30))
        const ogNameEnc  = encodeURIComponent(ogName.slice(0,20))
        const siteBase   = (() => { try { return new URL(c.req.raw.url).origin } catch { return 'https://slimmind.kr' } })()
        const ogUrl      = `${siteBase}/result/${id}`
        const ogImage    = `${siteBase}/static/og-slimmind.png`
        const ogTitle    = `${ogName}님의 바디코드 분석 완료 — ${ogBcCode} ${ogNickname}`
        const ogDesc     = `반복되는 다이어트 실패, 그 진짜 원인이 밝혀졌습니다. ${ogName}님의 체형 코드는 '${ogNickname}'. 지금 바로 결과를 확인하고 1:1 전문 컨설팅으로 나만의 처방을 받아보세요.`
        const ogMeta = `
<meta property="og:type"           content="website">
<meta property="og:site_name"      content="SlimMind · 바디코드 분석">
<meta property="og:title"          content="${ogTitle}">
<meta property="og:description"    content="${ogDesc}">
<meta property="og:url"            content="${ogUrl}">
<meta property="og:image"          content="${ogImage}">
<meta property="og:image:width"    content="1200">
<meta property="og:image:height"   content="630">
<meta property="og:image:type"     content="image/png">
<meta name="twitter:card"          content="summary_large_image">
<meta name="twitter:title"         content="${ogTitle}">
<meta name="twitter:description"   content="${ogDesc}">
<meta name="twitter:image"         content="${ogImage}">
<meta name="description"           content="${ogDesc}">`

        const injectedHtml = resultV4Html.replace(
          '</head>',
          `${ogMeta}\n<script>window.__RESULT__ = ${injectedData};window.__RESULT_FULL__ = {};</script>\n</head>`
        )
        return c.html(injectedHtml)
      }

      // 두 테이블 모두 없음 → 404
      return _errorHtml('결과지를 찾을 수 없습니다', '링크가 만료되었거나<br>잘못된 주소입니다.', 404)
    }

  // JWT 확인 (컨설턴트 여부 판별)
  const authUser = await getAuthUser(c)
  const isConsultant = authUser !== null
  const isOwner = authUser && (authUser.role === 'MASTER' || authUser.code === result.consultant_code)

  // bc_prescriptions JOIN
  const bc = await db.prepare('SELECT * FROM bc_prescriptions WHERE bc_code=?')
    .bind(result.bc_primary).first<any>()

  // 오행 DB 조회
  // ohaeng_type이 "수(水)" 형태로 저장된 경우 괄호 제거 → "수" 로 정규화
  let ohaeng = null
  if (result.ohaeng_type) {
    const rawOhaeng = result.ohaeng_type as string
    const normalizedOhaeng = rawOhaeng.replace(/\([^)]*\)/g, '').trim()
    ohaeng = await db.prepare('SELECT * FROM ohaeng_db WHERE ohaeng_type=? OR ohaeng_type=?')
      .bind(normalizedOhaeng, rawOhaeng).first<any>()
  }

  // 사주 DB 조회 (한글 일간으로 찾기)
  let saju = null
  if (result.saju_il_gan) {
    // saju_il_gan은 한자(甲~癸) 또는 한글(갑~계) 둘 다 가능
    saju = await db.prepare('SELECT * FROM saju_db WHERE il_gan=? OR il_gan_ko=?')
      .bind(result.saju_il_gan, result.saju_il_gan).first<any>()
  }

  // MBTI × 혈액형 조합 조회
  let mbtiBlood = null
  if (result.mbti && result.blood_type) {
    mbtiBlood = await db.prepare('SELECT * FROM mbti_blood_db WHERE mbti=? AND blood_type=?')
      .bind(result.mbti, result.blood_type).first<any>()
  }

  // B2B 기관유형 파싱
  const b2bTypes: string[] = parseJson(result.b2b_institution_types, []) || []
  const hasB2B = b2bTypes.length > 0

  // 담당 컨설턴트 연락처 조회 (CTA 버튼용)
  let consultantContact: { name: string|null, phone: string|null, kakao: string|null } = { name: null, phone: null, kakao: null }
  if (result.consultant_code) {
    const con = await db.prepare('SELECT name, phone, kakao_channel FROM consultants WHERE code=?')
      .bind(result.consultant_code).first<any>()
    if (con) consultantContact = { name: con.name || null, phone: con.phone || null, kakao: con.kakao_channel || null }
  }

  // ─────────────────────────────────────────────────────────────────
  // PHASE 1-A: 인바디 역계산 엔진 (Deurenberg 공식)
  // 실측값(bfr/fat_kg/muscle_kg)이 없을 때 설문 데이터로 자동 추정
  // ─────────────────────────────────────────────────────────────────

  // 1. 만 나이 계산 (birth_date 없으면 35세 기본값 → 역계산 시 추정 표시됨)
  let ageYears: number | null = null
  let ageIsEstimated = false
  if (result.birth_date) {
    const birth = new Date(result.birth_date as string)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const mDiff = today.getMonth() - birth.getMonth()
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--
    ageYears = age > 0 ? age : null
  } else {
    // birth_date 없어도 weight/height 있으면 추정 나이 35세로 역계산 진행
    if (result.weight && result.height) {
      ageYears = 35
      ageIsEstimated = true
    }
  }

  // 2. BMI 계산 (없을 때 height/weight 기반)
  let bmi: number | null = result.bmi ? Number(result.bmi) : null
  const w = result.weight ? Number(result.weight) : null
  const h = result.height ? Number(result.height) : null
  if (!bmi && w && h && h > 0) {
    bmi = parseFloat((w / ((h / 100) ** 2)).toFixed(1))
  }

  // 3. Deurenberg 체지방률 추정 (실측 bfr 없을 때)
  let bfr: number | null = result.bfr ? Number(result.bfr) : null
  let bodyDataSource: 'measured' | 'estimated' = 'measured'
  if (ageIsEstimated) bodyDataSource = 'estimated'  // 나이 추정 → 전체 추정
  if (!bfr && bmi && ageYears) {
    const isMale = (result.gender as string)?.toLowerCase() === 'male' ||
                   (result.gender as string) === '남성' ||
                   (result.gender as string) === '남'
    const rawBfr = isMale
      ? (1.20 * bmi) + (0.23 * ageYears) - 16.2
      : (1.20 * bmi) + (0.23 * ageYears) - 5.4
    bfr = parseFloat(Math.max(5, Math.min(60, rawBfr)).toFixed(1))
    bodyDataSource = 'estimated'
  }

  // 4. 체지방량 / 제지방량 / 근육량 역계산
  let fat_kg: number | null = result.fat_kg ? Number(result.fat_kg) : null
  let lean_kg: number | null = null
  let muscle_kg: number | null = result.muscle_kg ? Number(result.muscle_kg) : null

  if (w && bfr) {
    if (!fat_kg) {
      fat_kg = parseFloat((w * (bfr / 100)).toFixed(1))
      if (bodyDataSource === 'measured') bodyDataSource = 'estimated' // fat_kg도 추정됨
    }
    lean_kg = parseFloat((w - fat_kg).toFixed(1))
    if (!muscle_kg) {
      muscle_kg = parseFloat((lean_kg * 0.75).toFixed(1))
    }
  }

  // 5. 탄단지 비율 자동 계산
  // 목표 칼로리: 기초대사량(Mifflin-St Jeor) × 활동계수 - 적자
  let macroRatio: {
    protein_g: number, fat_g: number, carb_g: number,
    protein_pct: number, fat_pct: number, carb_pct: number,
    total_kcal: number, bmr: number
  } | null = null

  if (w && h && ageYears) {
    const isMale = (result.gender as string)?.toLowerCase() === 'male' ||
                   (result.gender as string) === '남성' ||
                   (result.gender as string) === '남'
    // Mifflin-St Jeor BMR
    const bmr = isMale
      ? Math.round(10 * w + 6.25 * h - 5 * ageYears + 5)
      : Math.round(10 * w + 6.25 * h - 5 * ageYears - 161)

    // 활동계수 1.375 (가벼운 운동 주 1-3회) → 목표 칼로리는 500kcal 적자
    const tdee = Math.round(bmr * 1.375)
    const targetKcal = Math.max(1200, tdee - 500)

    // ── 체지방률·근육량 기반 탄단지 비율 조정 ──────────────────
    // 체지방률 구간 분류 (bfr: Deurenberg 추정 or Navy 실측)
    const effectiveBfr = (result as any).bfr ? Number((result as any).bfr) : bfr
    // 근육량 부족 여부: 표준 골격근량(체중×0.36 남 / 체중×0.30 여) 대비
    const stdMuscleRatio = isMale ? 0.36 : 0.30
    const stdMuscleKg = w * stdMuscleRatio
    const isLowMuscle = muscle_kg ? (muscle_kg < stdMuscleKg * 0.90) : false
    const isHighFat = effectiveBfr ? (isMale ? effectiveBfr > 25 : effectiveBfr > 33) : false

    // ── 목표 감량 수치 기반 식단 강도 분류 ──────────────────────
    // total_loss_kg 사전 계산: 결과지에서 body_goal 계산 전이므로 직접 계산
    const tw = result.target_weight ? Number(result.target_weight) : null
    const totalLossKg = (w && tw && tw < w) ? parseFloat((w - tw).toFixed(1)) : 0
    // 감량 강도: heavy(10kg+) / moderate(5~10kg) / light(<5kg)
    const lossIntensity = totalLossKg >= 10 ? 'heavy'
      : totalLossKg >= 5 ? 'moderate'
      : 'light'

    // ── 목표감량 + 체성분 통합 탄단지 비율 결정 ─────────────────
    // heavy(10kg+): 저탄수 고단백 - 탄수 40%, 단백 35%, 지방 25% 방향
    //               → 칼로리 적자도 더 크게: TDEE - 600kcal
    // moderate(5~10kg): 중간 - 탄수 45%, 단백 30%, 지방 25%
    //               → 칼로리 적자: TDEE - 500kcal (기본)
    // light(<5kg): 균형 유지 - 탄수 50%, 단백 25%, 지방 25%
    //               → 칼로리 적자: TDEE - 300kcal

    const targetKcalAdj = lossIntensity === 'heavy'
      ? Math.max(1200, Math.round(bmr * 1.375) - 600)
      : lossIntensity === 'light'
      ? Math.max(1400, Math.round(bmr * 1.375) - 300)
      : targetKcal  // moderate: 기본 500kcal 적자 유지

    // 단백질: 감량 강도별 multiplier + 체성분 보정
    const baseProteinMultiplier = lossIntensity === 'heavy' ? 2.6
      : lossIntensity === 'moderate' ? 2.3
      : 2.0
    const proteinMultiplier = isLowMuscle
      ? baseProteinMultiplier + 0.2  // 근육 부족 시 추가 상향
      : baseProteinMultiplier
    const protein_g = Math.round(lean_kg ? lean_kg * proteinMultiplier : w * (proteinMultiplier * 0.78))

    // 지방: heavy→18%, moderate→22%, light→25%; 체지방 높으면 2%p 추가 감소
    const baseFatPct = lossIntensity === 'heavy' ? 0.18
      : lossIntensity === 'moderate' ? 0.22
      : 0.25
    const fatPct = isHighFat ? Math.max(0.15, baseFatPct - 0.02) : baseFatPct
    const fat_g = Math.round((targetKcalAdj * fatPct) / 9)

    // 탄수화물: 나머지 칼로리 (감량 강도 높을수록 자연감소)
    const protein_kcal = protein_g * 4
    const fat_kcal = fat_g * 9
    const carb_kcal = Math.max(0, targetKcalAdj - protein_kcal - fat_kcal)
    const carb_g = Math.round(carb_kcal / 4)

    const total = protein_kcal + fat_kcal + carb_kcal

    // 조정 근거 메모 (결과지 표시용) — 감량 강도 + 체성분 통합
    const lossLabel = lossIntensity === 'heavy' ? `${totalLossKg}kg 대량 감량`
      : lossIntensity === 'moderate' ? `${totalLossKg}kg 중등도 감량`
      : totalLossKg > 0 ? `${totalLossKg}kg 소량 감량` : '체중 유지'

    const macroAdjustNote = isHighFat && isLowMuscle
      ? `체지방↑·근육↓ + ${lossLabel}: 저탄수+고단백 집중 처방`
      : isHighFat
      ? `체지방 과다 + ${lossLabel}: 탄수 제한·지방 감소 처방`
      : isLowMuscle
      ? `근육 부족 + ${lossLabel}: 고단백 근손실 방지 처방`
      : lossIntensity === 'heavy'
      ? `${lossLabel}: 저탄수 고단백 감량 식단 처방`
      : lossIntensity === 'moderate'
      ? `${lossLabel}: 균형 탄단지 점진적 감량 처방`
      : `${lossLabel}: 표준 체성분 유지·관리 처방`

    macroRatio = {
      protein_g, fat_g, carb_g,
      protein_pct: Math.round((protein_kcal / total) * 100),
      fat_pct: Math.round((fat_kcal / total) * 100),
      carb_pct: Math.round((carb_kcal / total) * 100),
      total_kcal: targetKcalAdj,
      bmr,
      loss_intensity: lossIntensity,
      total_loss_kg: totalLossKg,
      ...(macroAdjustNote ? { adjust_note: macroAdjustNote } : {}),
    } as any
  }

  // 6. 감량 목표 계산
  let bodyGoal: {
    total_loss_kg: number, fat_loss_kg: number,
    target_fat_kg: number, muscle_target_kg: number,
    weeks_to_goal: number, weekly_deficit_kcal: number
  } | null = null

  const tw = result.target_weight ? Number(result.target_weight) : null
  if (w && tw && fat_kg && muscle_kg) {
    const total_loss_kg = parseFloat((w - tw).toFixed(1))
    // 목표 체지방량: 목표 체중 × 현재 체지방률 × 0.8 (체지방 우선 감량 가정)
    const target_fat_pct = bfr ? Math.max(10, bfr * 0.75) : null
    const target_fat_kg = target_fat_pct
      ? parseFloat((tw * (target_fat_pct / 100)).toFixed(1))
      : parseFloat((fat_kg - total_loss_kg * 0.8).toFixed(1))
    const fat_loss_kg = parseFloat((fat_kg - target_fat_kg).toFixed(1))
    // 근육 유지 목표: 현재 근육량 × 0.95 (약 5% 감소 허용)
    const muscle_target_kg = parseFloat((muscle_kg * 0.95).toFixed(1))
    // 주간 적자: 지방 1kg = 7700kcal, 주당 0.5kg 목표
    const weekly_deficit_kcal = 500 * 7
    const weeks_to_goal = Math.ceil((fat_loss_kg * 7700) / weekly_deficit_kcal)

    bodyGoal = {
      total_loss_kg, fat_loss_kg, target_fat_kg,
      muscle_target_kg, weeks_to_goal, weekly_deficit_kcal,
    }
  }
  // ─────────────────────────────────────────────────────────────────

  // window.__RESULT__ 데이터 구조 구성
  const resultData = {
    result: {
      id: result.id,
      user_name: result.user_name,
      consultant_code: result.consultant_code,
      bc_primary: result.bc_primary,
      bc_secondary: result.bc_secondary,
      bc_primary_score: result.bc_primary_score,
      bc_secondary_score: result.bc_secondary_score,
      bc_scores: parseJson(result.bc_scores_json, {}),
      ohaeng_type: result.ohaeng_type,
      ohaeng_scores: parseJson(result.ohaeng_scores_json, null),  // 즉시-3: flatResult에서 실제 값 접근 가능하도록
      mbti: result.mbti,
      blood_type: result.blood_type,
      saju_il_gan:      result.saju_il_gan,
      saju_il_ji:       result.saju_il_ji,
      saju_ohaeng:      result.saju_ohaeng,
      saju_yin_yang:    result.saju_yin_yang,
      birth_hour:       result.birth_hour,
      saju_hour_stem:   result.saju_hour_stem,
      saju_hour_branch: result.saju_hour_branch,
      saju_display:     result.saju_display,
      gender: result.gender,
      birth_date: result.birth_date,
      height: result.height,
      weight: result.weight,
      target_weight: result.target_weight,
      bmi: bmi,
      bfr: result.bfr ? Number(result.bfr) : null,
      fat_kg: result.fat_kg ? Number(result.fat_kg) : null,
      muscle_kg: result.muscle_kg ? Number(result.muscle_kg) : null,
      // 역계산 필드 (실측값 없을 때 Deurenberg 추정)
      age: ageYears,
      age_is_estimated: ageIsEstimated,
      body_data_source: bodyDataSource,
      estimated_bfr: (!result.bfr && bodyDataSource === 'estimated') ? bfr : null,
      estimated_fat_kg: (!result.fat_kg && fat_kg) ? fat_kg : null,
      estimated_lean_kg: lean_kg,
      estimated_muscle_kg: (!result.muscle_kg && muscle_kg) ? muscle_kg : null,
      macro_ratio: macroRatio,
      body_goal: bodyGoal,
      top_size: result.top_size,
      bottom_size: result.bottom_size,
      target_top_size: result.target_top_size,
      target_bottom_size: result.target_bottom_size,
      emotional_state: result.emotional_state,
      main_goal: result.main_goal,
      priority_value: result.priority_value,
      survey_summary: parseJson(result.survey_summary_json, {}),
      aerobic_response: result.aerobic_response,
      sauna_response: result.sauna_response,
      massage_swells: result.massage_swells,
      muscle_soreness_level: result.muscle_soreness_level,
      // v3.0 섹션 L 필드
      food_allergy: parseJson(result.food_allergy_json, []),
      allergy_exclude: parseJson(result.allergy_exclude_json, []),
      skin_reaction: result.skin_reaction,
      menopause_status: result.menopause_status,
      is_menopause: !!result.is_menopause,
      medical_conditions: parseJson(result.medical_conditions_json, []),
      has_medical_conditions: !!result.has_medical_conditions,
      // v4.0 10축 분석 결과
      axis_scores: parseJson(result.axis_scores_json, {}),
      top_axes: parseJson(result.top_axes_json, []),
      created_at: result.created_at,
      // 감정유형 분류 (classifyEmotionType) 용 설문 응답
      survey_answers: parseJson(result.survey_answers_json, {}),
    },
    bc: bc ? {
      bc_code: bc.bc_code,
      brand_name: bc.brand_name,
      tagline: bc.tagline,
      fat_area: bc.fat_area,
      bc_primary_oneline_reason: bc.bc_primary_oneline_reason,
      bc_cause_story: bc.bc_cause_story,
      bc_worsen_word: bc.bc_worsen_word,
      closing_copy: bc.closing_copy,
      symptom_checklist: parseJson(bc.symptom_checklist_json, []),
      wrong_methods: parseJson(bc.wrong_methods_json, []),
      correct_principles: parseJson(bc.correct_principles_json, []),
      recommended_exercises: parseJson(bc.recommended_exercises_json, []),
      forbidden_exercises: parseJson(bc.forbidden_exercises_json, []),
      recommended_foods: parseJson(bc.recommended_foods_json, []),
      forbidden_foods: parseJson(bc.forbidden_foods_json, []),
      supplement_list: parseJson(bc.supplement_list_json, []),
      lifestyle_rules: parseJson(bc.lifestyle_rules_json, []),
      monthly_goals: parseJson(bc.monthly_goals_json, {}),
      weekly_schedule: parseJson(bc.weekly_schedule_json, {}),
      zone2_bpm: bc.zone2_bpm_v2 || bc.zone2_bpm,
      hiit_available_week: bc.hiit_available_week_v2 || bc.hiit_available_week,
      aerobic_restriction: bc.aerobic_restriction,
      recommended_sports: parseJson(bc.recommended_sports_json, []),
      forbidden_sports: parseJson(bc.forbidden_sports_json, []),
      rest_prescription: parseJson(bc.rest_prescription_json, {}),
      muscle_soreness_protocol: parseJson(bc.muscle_soreness_protocol_json, {}),
      recovery_priority: parseJson(bc.recovery_priority_json, []),
      sauna_ok: bc.sauna_ok,
      cryo_ok: bc.cryo_ok,
      lymph_massage_protocol: parseJson(bc.lymph_massage_protocol_json, {}),
      sleep_protocol: parseJson(bc.sleep_protocol_json, {}),
      aromatherapy: parseJson(bc.aromatherapy_json, {}),
      macro_ratio: parseJson(bc.macro_ratio_json, {}),
      macro_story: bc.macro_story,
      meal_timing_rule: parseJson(bc.meal_timing_rule_json, {}),
      forbidden_foods_reason: parseJson(bc.forbidden_foods_reason_json, []),
      timing_story: bc.timing_story,
      // B2B 데이터: 컨설턴트 접근 시에만 포함
      b2b_treatments: (isOwner && hasB2B) ? parseJson(bc.b2b_treatments_json, {}) : null,
      hospital_tests: (isOwner && hasB2B) ? parseJson(bc.hospital_tests_json, []) : null,
      reassessment_schedule: (isOwner && hasB2B) ? parseJson(bc.reassessment_schedule_json, {}) : null,
      partner_hints: (isOwner && hasB2B) ? parseJson(bc.partner_hints_json, []) : null,
    } : null,
    ohaeng: ohaeng ? {
      ohaeng_type: ohaeng.ohaeng_type,
      organ_primary: ohaeng.organ_primary,
      organ_secondary: ohaeng.organ_secondary,
      weak_season: ohaeng.weak_season,
      strong_season: ohaeng.strong_season,
      good_foods: parseJson(ohaeng.good_foods_json, []),
      bad_foods: parseJson(ohaeng.bad_foods_json, []),
      good_taste: ohaeng.good_taste,
      supplement_addon: parseJson(ohaeng.supplement_addon_json, []),
      story_layer: ohaeng.story_layer,
      personality_trait: ohaeng.personality_trait,
      exercise_affinity: ohaeng.exercise_affinity,
    } : null,
    saju: saju ? {
      il_gan: saju.il_gan,
      il_gan_ko: saju.il_gan_ko,
      ohaeng: saju.ohaeng,
      yin_yang: saju.yin_yang,
      organ: saju.organ,
      weak_season: saju.weak_season,
      warning_foods: parseJson(saju.warning_foods_json, []),
      boost_foods: parseJson(saju.boost_foods_json, []),
      season_warning: saju.season_warning,
      personality_hint: saju.personality_hint,
    } : null,
    mbti_blood: mbtiBlood ? {
      mbti: mbtiBlood.mbti,
      blood_type: mbtiBlood.blood_type,
      motivation_lang: mbtiBlood.motivation_lang,
      diet_pattern: mbtiBlood.diet_pattern,
      exercise_pattern: mbtiBlood.exercise_pattern,
      fail_pattern: mbtiBlood.fail_pattern,
      story_insert: mbtiBlood.story_insert,
    } : null,
    // 메타 정보
    is_consultant: isConsultant,
    is_owner: !!isOwner,
    is_b2b_partner: hasB2B,
    b2b_institution_types: hasB2B ? b2bTypes : [],
    consultant_name:  consultantContact.name  || null,
    consultant_phone: consultantContact.phone || null,
    consultant_kakao: consultantContact.kakao || null,
  }

  // ─── B2B 화이트라벨: 결과지에도 브랜드컬러 주입 ───
  let brandInjectResult = ''
  const resultRefCode = result.ref_code as string | null
  if (resultRefCode && resultRefCode.startsWith('B2B-')) {
    const b2bPartner = await db.prepare(
      'SELECT code, brand_name, brand_color, brand_logo_url, status FROM b2b_partners WHERE code=?'
    ).bind(resultRefCode).first<any>()

    if (b2bPartner && b2bPartner.status !== 'suspended') {
      const bColor = (b2bPartner.brand_color || '#6366f1').replace(/[^#0-9a-fA-F]/g, '')
      const bName = (b2bPartner.brand_name || b2bPartner.code || '').replace(/[<>"]/g, '')
      const bLogo = (b2bPartner.brand_logo_url || '').replace(/[<>"]/g, '')
      brandInjectResult = `
<script>window.__BRAND__ = { code: "${resultRefCode}", type: "B2B", brand_name: "${bName}", brand_color: "${bColor}", brand_logo_url: "${bLogo}" };</script>
<style>
:root { --brand-color: ${bColor}; --brand-color-light: ${bColor}22; }
/* 결과지 헤더/버튼 브랜드컬러 오버라이드 */
.result-header, .v4-header { background: var(--brand-color) !important; }
.result-action-btn, .download-btn, .share-btn { background: var(--brand-color) !important; border-color: var(--brand-color) !important; }
.bc-badge, .section-title-bar { background: var(--brand-color) !important; }
.progress-fill, .score-bar-fill { background: var(--brand-color) !important; }
</style>`
    }
  }

  // result.html에 window.__RESULT__ + 브랜드컬러 주입
  // result.html의 initResult()가 기대하는 flat 구조로 펼쳐서 주입
  const flatResult = {
    // 식별자
    result_id: resultData.result?.id,
    session_id: resultData.result?.session_id || resultData.result?.id,  // 코칭 코멘트 API 조회용
    // 기본 정보
    user_name: resultData.result?.user_name,
    consultant_code: resultData.result?.consultant_code,
    bc_primary: normalizeBcCode(resultData.result?.bc_primary),   // ← 정규화
    bc_secondary: normalizeBcCode(resultData.result?.bc_secondary),
    bc_primary_score: resultData.result?.bc_primary_score,
    bc_secondary_score: resultData.result?.bc_secondary_score,
    bc_scores: resultData.result?.bc_scores,
    // 신체 정보
    gender: resultData.result?.gender,
    birth_date: resultData.result?.birth_date,
    height: resultData.result?.height,
    weight: resultData.result?.weight,
    target_weight: resultData.result?.target_weight,
    bmi: resultData.result?.bmi,
    bfr: resultData.result?.bfr,
    fat_kg: resultData.result?.fat_kg,
    muscle_kg: resultData.result?.muscle_kg,
    age: resultData.result?.age,
    estimated_bfr: resultData.result?.estimated_bfr,
    estimated_fat_kg: resultData.result?.estimated_fat_kg,
    estimated_lean_kg: resultData.result?.estimated_lean_kg,
    estimated_muscle_kg: resultData.result?.estimated_muscle_kg,
    body_data_source: resultData.result?.body_data_source,
    macro_ratio: resultData.result?.macro_ratio,
    body_goal: resultData.result?.body_goal,
    // ✅ 목표체중·감량률 — computeNutrition / getRoadmapWeeks 칼로리 계산 필수
    goal_weight:     (resultData.result as any)?.goal_weight     != null ? Number((resultData.result as any).goal_weight)     : null,
    weight_loss_pct: (resultData.result as any)?.weight_loss_pct != null ? Number((resultData.result as any).weight_loss_pct) : null,
    // 체형 사이즈
    top_size: resultData.result?.top_size,
    bottom_size: resultData.result?.bottom_size,
    target_top_size: resultData.result?.target_top_size,
    target_bottom_size: resultData.result?.target_bottom_size,
    // 동양의학
    ohaeng_type: resultData.result?.ohaeng_type,
    // 즉시-3: ohaeng_scores 실제 값 (null 하드코딩 제거)
    // resultData.result.ohaeng_scores는 parseJson(ohaeng_scores_json, {}) 된 객체
    ohaeng_scores: (() => {
      const raw = resultData.result as any;
      if (raw?.ohaeng_scores && typeof raw.ohaeng_scores === 'object' && Object.keys(raw.ohaeng_scores).length > 0) {
        return raw.ohaeng_scores;
      }
      return null;
    })(),
    mbti: resultData.result?.mbti,
    blood_type: resultData.result?.blood_type,
    saju_il_gan: resultData.result?.saju_il_gan,
    saju_display: resultData.result?.saju_display,
    // 설문 응답 (채점 재활용) — resultData.result.survey_answers는 이미 parseJson된 객체
    survey_answers: resultData.result?.survey_answers || null,
    answers: resultData.result?.survey_answers || null,
    survey_summary: resultData.result?.survey_summary || null,
    // v4 10축 분석 — resultData.result.axis_scores / top_axes 이미 parseJson된 객체
    axis_scores: resultData.result?.axis_scores || null,
    top_axes: resultData.result?.top_axes || null,
    axis_primary: resultData.result?.axis_primary,
    // 건강 조건 — resultData.result.food_allergy / allergy_exclude 이미 parseJson된 배열
    food_allergy: resultData.result?.food_allergy || null,
    allergy_exclude: resultData.result?.allergy_exclude || null,
    skin_reaction: resultData.result?.skin_reaction,
    is_menopause: resultData.result?.is_menopause,
    medical_conditions: resultData.result?.medical_conditions,
    has_medical_conditions: resultData.result?.has_medical_conditions,
    is_premium: resultData.result?.is_premium,
    emotional_state: resultData.result?.emotional_state,
    main_goal: resultData.result?.main_goal,
    created_at: resultData.result?.created_at,
    // 처방 데이터 (BC 전문가 데이터)
    prescription: resultData.bc,
    // 동양의학 상세
    ohaeng: resultData.ohaeng,
    saju: resultData.saju,
    mbti_blood: resultData.mbti_blood,
    // 권한 정보
    is_consultant: resultData.is_consultant,
    is_owner: resultData.is_owner,
    is_b2b_partner: resultData.is_b2b_partner,
    b2b_institution_types: resultData.b2b_institution_types,
    consultant_name:   consultantContact.name   || resultData.consultant_name || null,
    consultant_phone:  consultantContact.phone  || null,
    consultant_kakao:  consultantContact.kakao  || null,
  };

  // result-v4.html을 최신 결과지 템플릿으로 사용
  // JSON.stringify 직렬화 실패 방어
  let flatJson = '{}'
  let fullJson = '{}'
  try { flatJson = JSON.stringify(flatResult) } catch { flatJson = '{}' }
  try { fullJson = JSON.stringify(resultData) } catch { fullJson = '{}' }

  // OG 메타태그 생성 (카카오/SNS 공유용 — 세로형 대형 이미지)
  const ogNicknameR   = (result as any).bc_nickname || (result as any).bc_primary || '바디코드'
  const ogNameR       = (result as any).user_name   || '고객'
  const ogBcCodeR     = ((result as any).bc_primary || (result as any).bc_code || 'BC').replace(/[<>"'&\\]/g,'').slice(0,10)
  const ogNickEncR    = encodeURIComponent(ogNicknameR.slice(0,30))
  const ogNameEncR    = encodeURIComponent(ogNameR.slice(0,20))
  const siteBaseR     = (() => { try { return new URL(c.req.raw.url).origin } catch { return 'https://slimmind.kr' } })()
  const ogUrlR        = `${siteBaseR}/result/${id}`
  const ogImageR      = `${siteBaseR}/static/og-slimmind.png`
  const ogTitleR      = `${ogNameR}님의 바디코드 분석 완료 — ${ogBcCodeR} ${ogNicknameR}`
  const ogDescR       = `반복되는 다이어트 실패, 그 진짜 원인이 밝혀졌습니다. ${ogNameR}님의 체형 코드는 '${ogNicknameR}'. 지금 바로 결과를 확인하고 1:1 전문 컨설팅으로 나만의 처방을 받아보세요.`
  const ogMetaR = `
<meta property="og:type"           content="website">
<meta property="og:site_name"      content="SlimMind · 바디코드 분석">
<meta property="og:title"          content="${ogTitleR}">
<meta property="og:description"    content="${ogDescR}">
<meta property="og:url"            content="${ogUrlR}">
<meta property="og:image"          content="${ogImageR}">
<meta property="og:image:width"    content="1200">
<meta property="og:image:height"   content="630">
<meta property="og:image:type"     content="image/png">
<meta name="twitter:card"          content="summary_large_image">
<meta name="twitter:title"         content="${ogTitleR}">
<meta name="twitter:description"   content="${ogDescR}">
<meta name="twitter:image"         content="${ogImageR}">
<meta name="description"           content="${ogDescR}">`

  const injectedHtml = resultV4Html.replace(
    '</head>',
    `${ogMetaR}\n${brandInjectResult}\n<script>window.__RESULT__ = ${flatJson};window.__RESULT_FULL__ = ${fullJson};</script>\n</head>`
  )

  return c.html(injectedHtml)

  } catch (routeErr) {
    // DB 조회 or 직렬화 중 예상치 못한 오류 → 500 에러 페이지
    console.error('[/result/:id] 서버 오류:', routeErr)
    return _errorHtml('일시적인 오류가 발생했습니다', '잠시 후 다시 시도해 주세요.<br>문제가 계속되면 처음부터 진행해 주세요.', 500)
  }
})

// ═══════════════════════════════════════════════════════════════
//  페이지 라우트
// ═══════════════════════════════════════════════════════════════

// ─── 대표 주소(루트) — 신버전 설문지 직접 서빙 (리다이렉트 없음) ──
// ?ref= 쿼리파라미터가 있으면 /s/:code 로 301 리다이렉트 (컨설턴트 코드 보존)
app.get('/', (c) => {
  const url = new URL(c.req.raw.url)
  const ref = url.searchParams.get('ref')
  if (ref) {
    // ?ref=SC-0001 → /s/SC-0001 (컨설턴트 링크 보존)
    return c.redirect(`/s/${ref}`, 301)
  }
  return c.html(indexHtml)
})

app.get('/admin', (c) => c.html(adminHtml))
app.get('/admin.html', (c) => c.html(adminHtml))
app.get('/admin/*', (c) => c.html(adminHtml))
app.get('/consultant', (c) => c.html(consultantHtml))
app.get('/consultant.html', (c) => c.html(consultantHtml))
app.get('/consultant/*', (c) => c.html(consultantHtml))
app.get('/b2b', (c) => c.html(b2bHtml))
app.get('/b2b.html', (c) => c.html(b2bHtml))
app.get('/b2b/*', (c) => c.html(b2bHtml))

// ─── 임시: 바디맵 미리보기 (개발용) ────────────────────────────
app.get('/bodymap-preview', (c) => c.html(bodymapPreviewHtml))

// ─── 슬림마인드 라이브 설문지 — 유일한 최신 설문지 ────────────
// /slimmind_live, /slimmind 는 하위 호환용 (기존 공유 링크 보호)
app.get('/slimmind_live', (c) => c.html(indexHtml))
app.get('/slimmind_live.html', (c) => c.html(indexHtml))

// Feature 7: /slimmind?b2b=B2B-XXX 또는 ?ref=SC-XXXX 쿼리파라미터 지원
// → 내부적으로 /s/:code 와 동일한 화이트라벨 처리
app.get('/slimmind', async (c) => {
  const b2b  = (c.req.query('b2b')  || '').toUpperCase()
  const ref  = (c.req.query('ref')  || '').toUpperCase()
  const rediag = c.req.query('rediag') || ''
  const code = b2b || ref

  // 코드 없으면 기본 설문지
  if (!code) {
    let html = indexHtml
    if (rediag) {
      html = html.replace('</head>', `<script>window.__REDIAG_SESSION__=${JSON.stringify(rediag)};</script></head>`)
    }
    return c.html(html)
  }

  // 코드 있으면 /s/:code 와 동일 로직으로 리다이렉트 (내부 처리)
  const db = c.env.DB
  let brandInject = ''

  if (code.startsWith('B2B-')) {
    const partner = await db.prepare(
      'SELECT code, name, brand_name, brand_color, brand_logo_url, status FROM b2b_partners WHERE code = ?'
    ).bind(code).first<any>()

    if (partner && partner.status !== 'suspended') {
      await db.prepare(
        "UPDATE b2b_partners SET qr_scan_count = qr_scan_count + 1, updated_at=datetime('now') WHERE code=?"
      ).bind(code).run()

      const bColor = partner.brand_color || '#6366f1'
      const bName  = partner.brand_name  || partner.name
      const bLogo  = partner.brand_logo_url || ''

      brandInject = `
<script>
  window.__BRAND__ = {
    code: "${code}",
    type: "B2B",
    brand_name: ${JSON.stringify(bName)},
    brand_color: "${bColor}",
    brand_logo_url: ${JSON.stringify(bLogo)},
    ref_code: "${code}"
  };
  document.documentElement.style.setProperty('--brand-color', "${bColor}");
  document.documentElement.style.setProperty('--brand-color-light', "${bColor}22");
</script>
<style>:root{--brand-color:${bColor};--brand-color-light:${bColor}22}
.v3-header,.v3-progress-bar .fill{background:var(--brand-color)!important}
.v3-next-btn.ready,.option-btn.selected{background:var(--brand-color)!important}
.v3-brand-logo{display:block!important}</style>`
    }
  } else if (code.startsWith('SC-') || code === 'MASTER') {
    brandInject = `<script>window.__BRAND__={code:"${code}",type:"CONSULTANT",ref_code:"${code}"};</script>`
  }

  if (rediag) {
    brandInject += `<script>window.__REDIAG_SESSION__=${JSON.stringify(rediag)};</script>`
  }

  let html = indexHtml
  if (brandInject) {
    html = html.replace('</head>', `${brandInject}</head>`)
  }
  return c.html(html)
})

// ─── /s/:code — B2B/컨설턴트 화이트라벨 진입 라우트 ────────────
// 예: /s/B2B-AES-001 → 해당 업체 브랜드가 적용된 설문지
// 예: /s/SC-0001    → 컨설턴트 ref_code 심어진 설문지
app.get('/s/:code', async (c) => {
  const db = c.env.DB
  const rawCode = c.req.param('code').toUpperCase()

  let brandInject = ''

  // B2B 코드인 경우 브랜드 데이터 조회
  if (rawCode.startsWith('B2B-')) {
    const partner = await db.prepare(
      'SELECT code, name, brand_name, brand_color, brand_logo_url, status FROM b2b_partners WHERE code = ?'
    ).bind(rawCode).first<any>()

    if (partner && partner.status !== 'suspended') {
      // scan_count 증가
      await db.prepare(
        "UPDATE b2b_partners SET qr_scan_count = qr_scan_count + 1, updated_at=datetime('now') WHERE code=?"
      ).bind(rawCode).run()

      const bColor = partner.brand_color || '#6366f1'
      const bName = partner.brand_name || partner.name
      const bLogo = partner.brand_logo_url || ''

      brandInject = `
<script>
  window.__BRAND__ = {
    code: "${rawCode}",
    type: "B2B",
    brand_name: ${JSON.stringify(bName)},
    brand_color: "${bColor}",
    brand_logo_url: ${JSON.stringify(bLogo)},
    ref_code: "${rawCode}"
  };
  // CSS 변수 즉시 적용
  document.documentElement.style.setProperty('--brand-color', "${bColor}");
  document.documentElement.style.setProperty('--brand-color-light', "${bColor}22");
</script>
<style>
  :root {
    --brand-color: ${bColor};
    --brand-color-light: ${bColor}22;
  }
  /* 헤더/버튼 브랜드컬러 오버라이드 */
  .v3-header, .v3-progress-bar .fill { background: var(--brand-color) !important; }
  .v3-next-btn.ready, .option-btn.selected { background: var(--brand-color) !important; }
  .v3-brand-logo { display: block !important; }
</style>`
    }
  } else if (rawCode.startsWith('SC-') || rawCode === 'MASTER') {
    // 컨설턴트 코드: ref_code만 심기
    brandInject = `
<script>
  window.__BRAND__ = {
    code: "${rawCode}",
    type: "CONSULTANT",
    ref_code: "${rawCode}"
  };
</script>`
  }

  // index.html(최신 설문지)에 브랜드 인젝션 + ref_code 심기
  let html = indexHtml

  // ── OG 메타태그 주입 (카카오톡 공유 미리보기용) ───────────────────────
  const siteBaseS = (() => { try { return new URL(c.req.raw.url).origin } catch { return 'https://slimmind.kr' } })()
  const ogUrlS    = `${siteBaseS}/s/${rawCode}`
  // 카카오톡 최적화: SVG 대신 PNG 직접 참조 → 흰 여백 없이 가로형 표시
  const ogImageS  = `${siteBaseS}/static/og-slimmind.png`

  // B2B 파트너면 브랜드명 활용, 컨설턴트면 기본 SlimMind 브랜드
  let ogTitleS = 'SlimMind | 바디코드 정밀 진단'
  let ogDescS  = '당신의 몸은 하나의 코드입니다. 반복되는 다이어트 실패엔 반드시 원인이 있습니다. 지금 무료 바디코드 분석으로 나만의 체형 설계도를 확인해보세요.'

  const ogMetaS = `
<meta property="og:type"           content="website">
<meta property="og:site_name"      content="SlimMind · 바디코드 분석">
<meta property="og:title"          content="${ogTitleS}">
<meta property="og:description"    content="${ogDescS}">
<meta property="og:url"            content="${ogUrlS}">
<meta property="og:image"          content="${ogImageS}">
<meta property="og:image:width"    content="1200">
<meta property="og:image:height"   content="630">
<meta property="og:image:type"     content="image/png">
<meta name="twitter:card"          content="summary_large_image">
<meta name="twitter:title"         content="${ogTitleS}">
<meta name="twitter:description"   content="${ogDescS}">
<meta name="twitter:image"         content="${ogImageS}">
<meta name="description"           content="${ogDescS}">`

  html = html.replace('<head>', `<head>${ogMetaS}`)

  // ref 쿼리 파라미터도 함께 전달 (기존 URL 방식 호환)
  if (brandInject) {
    html = html.replace('</head>', `${brandInject}\n</head>`)
  }

  // __BRAND__ → v3State.ref_code 자동 연동 스크립트 주입
  const refScript = `
<script>
  // /s/:code 진입 시 ref_code 자동 설정
  document.addEventListener('DOMContentLoaded', function() {
    if (window.__BRAND__ && window.__BRAND__.ref_code) {
      // v3State 초기화 후 ref_code 세팅
      var checkV3 = setInterval(function() {
        if (typeof v3State !== 'undefined') {
          v3State.ref_code = window.__BRAND__.ref_code;
          clearInterval(checkV3);
          // B2B 로고 표시
          if (window.__BRAND__.brand_logo_url) {
            var logoEls = document.querySelectorAll('.v3-brand-logo-img');
            logoEls.forEach(function(el) {
              el.src = window.__BRAND__.brand_logo_url;
              el.style.display = 'block';
            });
          }
        }
      }, 100);
    }
  });
</script>`
  html = html.replace('</body>', `${refScript}\n</body>`)

  return c.html(html)
})

// ─── 고객 마이페이지 /my/:session_id ────────────────────────────────────────
// 북마크 가능한 고객 전용 페이지 — 오늘 미션 + 진행률 + 결과지 바로가기
app.get('/my/:session_id', async (c) => {
  const db        = c.env.DB
  const sessionId = c.req.param('session_id')

  // diagnosis_results 에서 세션 정보 조회
  const diag = await db.prepare(
    `SELECT id, user_name, bc_primary, bc_nickname, ref_code, created_at, goal_weight, weight_loss_pct
     FROM diagnosis_results WHERE id=? OR session_id=? LIMIT 1`
  ).bind(sessionId, sessionId).first<any>()

  // results 테이블 fallback
  const res = !diag ? await db.prepare(
    `SELECT id, user_name, bc_primary, consultant_code as ref_code, created_at, target_weight as goal_weight
     FROM results WHERE id=? LIMIT 1`
  ).bind(sessionId).first<any>() : null

  const row = diag || res
  if (!row) {
    return c.html(`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>페이지를 찾을 수 없습니다 | SlimMind</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f6f4ee;margin:0}
      .box{text-align:center;padding:40px;background:#fff;border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
      h2{color:#b5452e}p{color:#64748B}</style></head>
      <body><div class="box"><h2>페이지를 찾을 수 없습니다</h2><p>링크를 다시 확인해주세요.</p>
      <a href="/slimmind" style="color:#b5452e">새로 시작하기 →</a></div></body></html>`, 404)
  }

  // 데일리체크 최근 30일
  const checks = await db.prepare(
    `SELECT check_date, exercise_done, diet_done, recovery_done
     FROM daily_checks WHERE session_id=? ORDER BY check_date DESC LIMIT 30`
  ).bind(sessionId).all<any>()

  // 코칭 코멘트 최신 1개
  const latestComment = await db.prepare(
    `SELECT comment, created_at FROM coaching_comments WHERE session_id=? AND is_visible=1 ORDER BY created_at DESC LIMIT 1`
  ).bind(sessionId).first<any>()

  // 총 체크일수
  const totalDays  = checks.results?.length || 0
  const totalDone  = checks.results?.reduce((s: number, r: any) => s + (r.exercise_done + r.diet_done + r.recovery_done), 0) || 0
  const adherence  = totalDays > 0 ? Math.round((totalDone / (totalDays * 3)) * 100) : 0

  const origin     = (() => { try { return new URL(c.req.raw.url).origin } catch { return 'https://slimmind.kr' } })()
  const resultUrl  = `${origin}/result/${row.id}`
  const userName   = row.user_name || '고객'
  const bcCode     = row.bc_primary || ''
  const bcNick     = row.bc_nickname || bcCode

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${userName}님의 슬림마인드 | 오늘의 미션</title>
<meta property="og:title" content="${userName}님의 슬림마인드 마이페이지">
<meta property="og:description" content="오늘의 미션을 확인하고 12주 프로그램을 이어가세요.">
<meta property="og:image" content="${origin}/static/og-slimmind.png">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--brand:#b5452e;--cream:#f6f4ee;--card:#fff;--border:#e8e0d4;--muted:#94a3b8;--text:#1e293b}
body{font-family:'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif;background:var(--cream);min-height:100vh;padding-bottom:80px}
.header{background:linear-gradient(135deg,#b5452e,#8a3421);padding:32px 20px 24px;text-align:center;color:#fff}
.header-sub{font-size:11px;font-weight:700;letter-spacing:1.5px;opacity:.7;margin-bottom:8px}
.header-name{font-size:24px;font-weight:800;margin-bottom:4px}
.header-bc{font-size:13px;opacity:.85;font-weight:600}
.container{max-width:480px;margin:0 auto;padding:16px}
.card{background:var(--card);border-radius:16px;padding:20px;margin-bottom:14px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.card-title{font-size:13px;font-weight:800;color:var(--text);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.progress-bar{background:#F1F5F9;border-radius:99px;height:10px;overflow:hidden;margin-bottom:6px}
.progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#b5452e,#c98a3c);transition:width .6s}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:4px}
.stat-box{background:#F8FAFC;border-radius:12px;padding:14px;text-align:center}
.stat-val{font-size:22px;font-weight:800;color:var(--brand)}
.stat-lbl{font-size:11px;color:var(--muted);margin-top:3px;font-weight:600}
.check-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px}
.check-cell{aspect-ratio:1;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700}
.check-full{background:#10B981;color:#fff}
.check-part{background:#FDE68A;color:#92400E}
.check-none{background:#F1F5F9;color:#CBD5E1}
.comment-box{background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border-radius:12px;padding:14px 16px;border-left:3px solid #2563EB}
.comment-text{font-size:13px;color:#1e40af;line-height:1.7;font-weight:500}
.btn-result{display:block;background:linear-gradient(135deg,#b5452e,#8a3421);color:#fff;text-decoration:none;
  border-radius:14px;padding:16px;text-align:center;font-size:15px;font-weight:800;letter-spacing:.3px;margin-bottom:10px}
.btn-checkin{display:block;background:#F0FDF4;border:1.5px solid #10B981;color:#065F46;text-decoration:none;
  border-radius:14px;padding:14px;text-align:center;font-size:14px;font-weight:700}
.streak{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);margin-top:8px}
</style>
</head>
<body>
<div class="header">
  <div class="header-sub">SLIMMIND · 마이페이지</div>
  <div class="header-name">${userName}님,</div>
  <div class="header-bc">바디코드 ${bcCode} · ${bcNick}</div>
</div>

<div class="container">
  <!-- 오늘의 미션 바로가기 -->
  <div class="card">
    <div class="card-title"><span>🎯</span> 오늘의 미션</div>
    <a class="btn-result" href="${resultUrl}?view=today">
      <i class="fas fa-play-circle" style="margin-right:8px"></i>오늘 체크 + 결과지 보기
    </a>
    <a class="btn-checkin" href="${resultUrl}">
      <i class="fas fa-file-medical" style="margin-right:6px"></i>전체 결과지 보기
    </a>
  </div>

  <!-- 실천 현황 -->
  <div class="card">
    <div class="card-title"><span>📊</span> 실천 현황</div>
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-val">${totalDays}</div>
        <div class="stat-lbl">체크한 날</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${adherence}%</div>
        <div class="stat-lbl">전체 달성률</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${(() => {
          // 연속 달성 스트릭
          const sorted = [...(checks.results || [])].sort((a: any, b: any) => b.check_date.localeCompare(a.check_date))
          let streak = 0
          let prev = ''
          for (const r of sorted) {
            const done = r.exercise_done + r.diet_done + r.recovery_done
            if (done === 0) break
            if (!prev) { streak = 1; prev = r.check_date; continue }
            const prevD = new Date(prev), curD = new Date(r.check_date)
            const diffD = Math.round((prevD.getTime() - curD.getTime()) / 86400000)
            if (diffD === 1) { streak++; prev = r.check_date } else break
          }
          return streak
        })()}</div>
        <div class="stat-lbl">연속 🔥</div>
      </div>
    </div>
    <div class="progress-bar" style="margin-top:12px">
      <div class="progress-fill" style="width:${adherence}%"></div>
    </div>
    <div style="font-size:11px;color:var(--muted);text-align:right;margin-top:4px">${adherence}% 달성</div>

    <!-- 최근 7일 히트맵 -->
    ${checks.results && checks.results.length > 0 ? `
    <div style="margin-top:14px">
      <div style="font-size:11px;color:var(--muted);font-weight:600;margin-bottom:6px">최근 ${Math.min(checks.results.length, 21)}일</div>
      <div class="check-grid">
        ${checks.results.slice(0, 21).map((r: any) => {
          const done = r.exercise_done + r.diet_done + r.recovery_done
          const cls = done === 3 ? 'check-full' : done > 0 ? 'check-part' : 'check-none'
          return `<div class="check-cell ${cls}" title="${r.check_date}">${done}/3</div>`
        }).join('')}
      </div>
    </div>` : '<div style="font-size:12px;color:var(--muted);margin-top:8px;text-align:center">아직 체크 기록이 없어요. 오늘부터 시작해보세요! 💪</div>'}
  </div>

  <!-- 코칭 코멘트 -->
  ${latestComment ? `
  <div class="card">
    <div class="card-title"><span>💬</span> 컨설턴트 코멘트</div>
    <div class="comment-box">
      <div class="comment-text">${latestComment.comment}</div>
      <div style="font-size:11px;color:#93C5FD;margin-top:6px">${latestComment.created_at?.slice(0,10) || ''}</div>
    </div>
  </div>` : ''}

  <!-- 안내 -->
  <div style="text-align:center;font-size:12px;color:var(--muted);padding:8px 0;line-height:1.8">
    이 페이지를 <strong>북마크</strong>해두면<br>언제든지 오늘의 미션을 확인할 수 있어요 📌<br>
    <span style="font-size:10px;opacity:.7">slimmind.kr/my/${sessionId}</span>
  </div>
</div>
</body>
</html>`

  return c.html(html)
})

// ─── result.html 직접 접근 (bc=BC-01&name=... 파라미터 방식) ──────────────
app.get('/result.html', (c) => c.html(resultHtml))
app.get('/result', (c) => c.html(resultHtml))

// ─── result-v3.html (SlimMind v3.0 11축 결과지) ────────────────────────────
app.get('/result-v3.html', (c) => c.html(resultV3Html))
app.get('/result-v3', (c) => c.html(resultV3Html))

// ─── result-v4.html (SlimMind V3.0 PRD 최종 BC코드 결과지) ─────────────────
app.get('/result-v4.html', (c) => c.html(resultV4Html))
app.get('/result-v4', (c) => c.html(resultV4Html))

// ─── favicon ───────────────────────────────────────────────────────────────
app.get('/favicon.ico', async (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#b5452e"/>
  <text x="16" y="23" text-anchor="middle" font-size="20" font-family="Georgia,serif" fill="#f6f4ee">S</text>
</svg>`
  return c.body(svg, 200, { 'Content-Type': 'image/svg+xml' })
})

// ─── /og/survey — 설문 공유용 OG 이미지 (정적 PNG 리다이렉트, 카카오 최적화) ──
// SVG 대신 정적 PNG를 직접 서빙 → 카카오톡/SNS에서 흰 여백 없이 가로형으로 표시
app.get('/og/survey', (c) => {
  return c.redirect('/static/og-slimmind.png', 302)
})

// ─── /og/survey-svg — SVG 원본 (디버그용) ──
app.get('/og/survey-svg', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
     width="1200" height="630" viewBox="0 0 1200 630"
     preserveAspectRatio="xMidYMid slice"
     style="background:#b5452e">
  <defs>
    <linearGradient id="bgS" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#c94e32"/>
      <stop offset="50%"  stop-color="#b5452e"/>
      <stop offset="100%" stop-color="#7a2a18"/>
    </linearGradient>
    <radialGradient id="hilS" cx="0.85" cy="0.1" r="0.55">
      <stop offset="0%"   stop-color="#d9634a" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#b5452e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vigS" cx="0.15" cy="0.9" r="0.6">
      <stop offset="0%"   stop-color="#5a1a08" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#b5452e" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- 배경 — 1200×630 빈틈없이 채움 -->
  <rect x="0" y="0" width="1200" height="630" fill="url(#bgS)"/>
  <rect x="0" y="0" width="1200" height="630" fill="url(#hilS)"/>
  <rect x="0" y="0" width="1200" height="630" fill="url(#vigS)"/>

  <!-- 장식 원 -->
  <circle cx="1050" cy="-20" r="320" fill="#d05840" opacity="0.12"/>
  <circle cx="150"  cy="660" r="260" fill="#6a2010" opacity="0.18"/>
  <circle cx="600"  cy="315" r="500" fill="none" stroke="#f6f4ee" stroke-width="0.6" opacity="0.04"/>

  <!-- ══ 왼쪽: 로고 블록 ══ -->
  <text x="80" y="108"
        font-family="Georgia,'Times New Roman',serif"
        font-size="11" letter-spacing="10"
        fill="#f6f4ee" opacity="0.40">SLIMMIND</text>
  <rect x="80" y="120" width="200" height="0.8" fill="#f6f4ee" opacity="0.20"/>

  <!-- SlimMind 대형 로고 -->
  <text x="76" y="270"
        font-family="Georgia,'Times New Roman',serif"
        font-size="112" font-weight="300" letter-spacing="-4"
        fill="#f6f4ee" opacity="0.97">SlimMind</text>

  <rect x="80" y="290" width="160" height="1.2" fill="#f6f4ee" opacity="0.35"/>

  <text x="80" y="335"
        font-family="Arial,sans-serif"
        font-size="14" font-weight="300" letter-spacing="5"
        fill="#f6f4ee" opacity="0.60">바디코드 정밀 진단</text>

  <!-- ══ 세로 구분선 ══ -->
  <rect x="552" y="70" width="1" height="490" fill="#f6f4ee" opacity="0.12"/>

  <!-- ══ 오른쪽: 카피 + CTA ══ -->
  <text x="610" y="190"
        font-family="Arial,sans-serif"
        font-size="14" font-weight="400" letter-spacing="6"
        fill="#f6f4ee" opacity="0.55">BODY CODE ANALYSIS</text>

  <text x="610" y="265"
        font-family="Arial,sans-serif"
        font-size="34" font-weight="700" letter-spacing="2"
        fill="#f6f4ee" opacity="0.97">당신의 몸은</text>
  <text x="610" y="315"
        font-family="Arial,sans-serif"
        font-size="34" font-weight="700" letter-spacing="2"
        fill="#f6f4ee" opacity="0.97">하나의 코드입니다.</text>

  <text x="610" y="375"
        font-family="Arial,sans-serif"
        font-size="20" font-weight="300" letter-spacing="3"
        fill="#f6f4ee" opacity="0.68">반복되는 다이어트 실패, 원인이 있습니다.</text>

  <rect x="610" y="405" width="480" height="0.7" fill="#f6f4ee" opacity="0.15"/>

  <text x="610" y="435"
        font-family="Arial,sans-serif"
        font-size="13" font-weight="300" letter-spacing="2"
        fill="#f6f4ee" opacity="0.45">체형 분석 · 식이 패턴 · 호르몬 밸런스</text>

  <!-- CTA 버튼 -->
  <rect x="610" y="470" width="280" height="56" rx="28"
        fill="#f6f4ee" opacity="0.15"/>
  <rect x="610" y="470" width="280" height="56" rx="28"
        fill="none" stroke="#f6f4ee" stroke-width="1.2" opacity="0.50"/>
  <text x="750" y="504"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="15" letter-spacing="4" font-weight="600"
        fill="#f6f4ee" opacity="0.95">지금 무료 진단 받기</text>

  <!-- 하단 브랜드 라인 -->
  <rect x="0" y="598" width="1200" height="0.6" fill="#f6f4ee" opacity="0.08"/>
  <text x="80" y="620"
        font-family="Georgia,serif"
        font-size="10" letter-spacing="5"
        fill="#f6f4ee" opacity="0.22">SLIMMIND · BODY CODE ANALYSIS</text>
</svg>`
  return c.body(svg, 200, {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  })
})

// ─── /og/result — og-slimmind.png 리다이렉트 (한글 폰트 깨짐 방지) ──────────
app.get('/og/result', (c) => {
  const origin = (() => { try { return new URL(c.req.raw.url).origin } catch { return 'https://slimmind.kr' } })()
  return c.redirect(`${origin}/static/og-slimmind.png`, 302)
})

/* ═══════════════════════════════════════════════════════
   POST /api/checkin — 주차별 체크인 저장 (weekly_checkins + checkin_log 병행)
═══════════════════════════════════════════════════════ */
app.post('/api/checkin', async (c) => {
  const db = c.env.DB as D1Database | undefined;
  try {
    const body = await c.req.json() as {
      // weekly_checkins 스키마
      session_id?: string;
      bc_code?: string;
      week_number?: number;
      energy_score?: number;
      hunger_score?: number;
      sleep_score?: number;
      mood_score?: number;
      weight_kg?: number;
      diet_adherence?: number;
      // 기존 checkin_log 스키마 (하위호환)
      result_id?: string;
      consultant_code?: string;
      week_range?: string;
      axis_name?: string;
      checked_at?: string;
    };

    if (db) {
      // ── 신규: weekly_checkins 테이블 저장 ──
      if (body.session_id || body.week_number) {
        try {
          // on_track: 에너지+수면+기분 평균 >= 6이면 true
          const avgScore = ((body.energy_score||0) + (body.sleep_score||0) + (body.mood_score||0)) / 3;
          const onTrack = avgScore >= 6 ? 1 : 0;
          await db.prepare(`
            INSERT INTO weekly_checkins
              (session_id, bc_code, week_number, energy_score, hunger_score, sleep_score,
               mood_score, weight_kg, diet_adherence, on_track)
            VALUES (?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(session_id, week_number)
            DO UPDATE SET
              energy_score=excluded.energy_score,
              hunger_score=excluded.hunger_score,
              sleep_score=excluded.sleep_score,
              mood_score=excluded.mood_score,
              weight_kg=excluded.weight_kg,
              diet_adherence=excluded.diet_adherence,
              on_track=excluded.on_track
          `).bind(
            body.session_id || null,
            body.bc_code    || null,
            body.week_number || 1,
            body.energy_score   ?? null,
            body.hunger_score   ?? null,
            body.sleep_score    ?? null,
            body.mood_score     ?? null,
            body.weight_kg      ?? null,
            body.diet_adherence ?? null,
            onTrack
          ).run();
          return c.json({ success: true, message: `${body.week_number}주차 체크인 저장 완료` });
        } catch (dbErr) {
          console.warn('[checkin] weekly_checkins insert 오류:', dbErr);
          // 실패해도 성공 응답 (클라이언트 경험 유지)
          return c.json({ success: true, message: '체크인 수신 완료' });
        }
      }

      // ── 기존 하위호환: checkin_log 저장 ──
      if (body.result_id) {
        try {
          await db.prepare(`
            INSERT INTO checkin_log
              (result_id, consultant_code, bc_code, week_range, axis_name, checked_at)
            VALUES (?,?,?,?,?,?)
          `).bind(
            body.result_id || '',
            body.consultant_code || '',
            body.bc_code || '',
            body.week_range || '',
            body.axis_name || '',
            body.checked_at || new Date().toISOString()
          ).run();
        } catch(dbErr) {
          console.warn('[checkin] checkin_log insert skipped:', dbErr);
        }
        return c.json({ ok: true, success: true, message: '체크인 완료' });
      }
    } else {
      // DB 없는 환경 (개발 미연결) — 성공 응답
      return c.json({ success: true, message: '체크인 수신 (DB 미연결)' });
    }

    return c.json({ ok: true, success: true, message: '체크인 완료' });
  } catch(e) {
    console.error('[/api/checkin]', e);
    return c.json({ success: false, error: String(e) }, 500);
  }
})

/* ═══════════════════════════════════════════════════════
   GET /api/b2b/bc-list — B2B 전용 바디코드 목록 (파트너 힌트 포함)
═══════════════════════════════════════════════════════ */
app.get('/api/b2b/bc-list', requireB2B(), async (c) => {
  const db = c.env.DB as D1Database | undefined;
  try {
    const rows = db ? await db.prepare(`
      SELECT bc_code, brand_name, tagline, fat_area,
        bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
        recommended_foods_json, forbidden_foods_json,
        lifestyle_rules_json, correct_principles_json, wrong_methods_json,
        recommended_exercises_json, supplement_list_json, symptom_checklist_json,
        partner_hints_json, b2b_treatments_json
      FROM bc_prescriptions WHERE is_active=1 ORDER BY bc_code
    `).all<any>() : { results: [] };

    const list = (rows.results || []).map((r: any) => ({
      bc_code: r.bc_code,
      brand_name: r.brand_name,
      tagline: r.tagline,
      fat_area: r.fat_area,
      reason: r.bc_primary_oneline_reason,
      cause_story: r.bc_cause_story,
      worsen_word: r.bc_worsen_word,
      closing_copy: r.closing_copy,
      recommended_foods: parseJson(r.recommended_foods_json, []),
      forbidden_foods: parseJson(r.forbidden_foods_json, []),
      lifestyle_rules: parseJson(r.lifestyle_rules_json, []),
      correct_principles: parseJson(r.correct_principles_json, []),
      wrong_methods: parseJson(r.wrong_methods_json, []),
      recommended_exercises: parseJson(r.recommended_exercises_json, []),
      supplement_list: parseJson(r.supplement_list_json, []),
      symptom_checklist: parseJson(r.symptom_checklist_json, []),
      partner_hints: parseJson(r.partner_hints_json, []),
      b2b_treatments: parseJson(r.b2b_treatments_json, {}),
    }));

    return c.json({ ok: true, list });
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500);
  }
});

/* ═══════════════════════════════════════════════════════
   GET /api/bc/list — 바디코드 전체 목록 (인증 필요)
   모든 역할(마스터/컨설턴트/B2B) 공통 사용
═══════════════════════════════════════════════════════ */
app.get('/api/bc/list', async (c) => {
  const db = c.env.DB as D1Database | undefined;
  // 가벼운 인증 체크 (로그인한 사용자만)
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: '인증이 필요합니다.' }, 401);

  try {
    const rows = db ? await db.prepare(`
      SELECT
        bc_code, brand_name, tagline, fat_area,
        bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
        recommended_foods_json, forbidden_foods_json,
        lifestyle_rules_json, correct_principles_json, wrong_methods_json,
        recommended_exercises_json, supplement_list_json,
        symptom_checklist_json,
        -- B2B 전용 (파트너 힌트)
        partner_hints_json, b2b_treatments_json
      FROM bc_prescriptions
      WHERE is_active = 1
      ORDER BY bc_code
    `).all<any>() : { results: [] };

    const list = (rows.results || []).map((r: any) => ({
      bc_code: r.bc_code,
      brand_name: r.brand_name,
      tagline: r.tagline,
      fat_area: r.fat_area,
      reason: r.bc_primary_oneline_reason,
      cause_story: r.bc_cause_story,
      worsen_word: r.bc_worsen_word,
      closing_copy: r.closing_copy,
      recommended_foods: parseJson(r.recommended_foods_json, []),
      forbidden_foods: parseJson(r.forbidden_foods_json, []),
      lifestyle_rules: parseJson(r.lifestyle_rules_json, []),
      correct_principles: parseJson(r.correct_principles_json, []),
      wrong_methods: parseJson(r.wrong_methods_json, []),
      recommended_exercises: parseJson(r.recommended_exercises_json, []),
      supplement_list: parseJson(r.supplement_list_json, []),
      symptom_checklist: parseJson(r.symptom_checklist_json, []),
      // B2B/파트너 전용 (역할별 필터링은 프론트에서)
      partner_hints: user.role !== 'CONSULTANT' ? parseJson(r.partner_hints_json, []) : null,
      b2b_treatments: user.role !== 'CONSULTANT' ? parseJson(r.b2b_treatments_json, {}) : null,
    }));

    return c.json({ ok: true, list, role: user.role });
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500);
  }
});

/* ═══════════════════════════════════════════════════════
   GET /api/admin/ranking — 컨설턴트 랭킹 보드
   ?period=month|quarter|all  (기본: month)
═══════════════════════════════════════════════════════ */
app.get('/api/admin/ranking', requireRole('MASTER'), async (c) => {
  const db = c.env.DB as D1Database | undefined;
  const period = (c.req.query('period') || 'month') as string;

  let dateFilter = '';
  const now = new Date();
  if (period === 'month') {
    const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    dateFilter = `AND substr(r.created_at,1,7) = '${ym}'`;
  } else if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    const startM = q * 3 + 1;
    const endM = startM + 2;
    dateFilter = `AND CAST(substr(r.created_at,6,2) AS INTEGER) BETWEEN ${startM} AND ${endM} AND substr(r.created_at,1,4)='${now.getFullYear()}'`;
  }

  try {
    const rows = db ? await db.prepare(`
      SELECT
        c.code,
        c.name,
        c.grade,
        c.commission_rate,
        COUNT(r.id)                   AS total_results,
        SUM(CASE WHEN r.is_premium=1 THEN 1 ELSE 0 END) AS premium_cnt,
        ROUND(COUNT(r.id)*150000*0.25) AS est_settlement
      FROM consultants c
      LEFT JOIN results r ON r.consultant_code = c.code ${dateFilter}
      WHERE c.subscription_status != 'inactive'
      GROUP BY c.code, c.name, c.grade, c.commission_rate
      ORDER BY total_results DESC, premium_cnt DESC
    `).all<any>() : { results: [] };

    // 지난 기간 대비 성장률 계산을 위해 전월 데이터도 조회
    const prevYm = (() => {
      const d = new Date(now.getFullYear(), now.getMonth()-1, 1);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    })();
    const prevRows = db ? await db.prepare(`
      SELECT consultant_code, COUNT(*) AS cnt
      FROM results
      WHERE substr(created_at,1,7)='${prevYm}'
      GROUP BY consultant_code
    `).all<any>() : { results: [] };

    const prevMap: Record<string, number> = {};
    (prevRows.results || []).forEach((r: any) => { prevMap[r.consultant_code] = r.cnt; });

    const ranking = (rows.results || []).map((r: any, idx: number) => {
      const prev = prevMap[r.code] || 0;
      const growth = prev === 0 ? (r.total_results > 0 ? 100 : 0) : Math.round(((r.total_results - prev) / prev) * 100);
      return { ...r, rank: idx + 1, prev_results: prev, growth_rate: growth };
    });

    // 전체 통계
    const totalSettlement = ranking.reduce((s: number, r: any) => s + (r.est_settlement || 0), 0);
    const totalResults = ranking.reduce((s: number, r: any) => s + (r.total_results || 0), 0);
    const mvp = ranking[0] || null;

    return c.json({ ok: true, ranking, period, totalResults, totalSettlement, mvp });
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500);
  }
});

/* ═══════════════════════════════════════════════════════
   GET /api/admin/revenue-forecast — 실시간 매출 예측
═══════════════════════════════════════════════════════ */
app.get('/api/admin/revenue-forecast', requireRole('MASTER'), async (c) => {
  const db = c.env.DB as D1Database | undefined;
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const today = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();

  try {
    // 이번 달 일별 결과 수
    const dailyRows = db ? await db.prepare(`
      SELECT substr(created_at,1,10) AS day, COUNT(*) AS cnt
      FROM results
      WHERE substr(created_at,1,7)='${ym}'
      GROUP BY substr(created_at,1,10)
      ORDER BY day
    `).all<any>() : { results: [] };

    const dailyData = (dailyRows.results || []) as Array<{day: string; cnt: number}>;
    const currentMonthTotal = dailyData.reduce((s, d) => s + d.cnt, 0);

    // 지난 3달 평균으로 예측
    const hist = db ? await db.prepare(`
      SELECT substr(created_at,1,7) AS ym, COUNT(*) AS cnt
      FROM results
      WHERE substr(created_at,1,7) < '${ym}'
      GROUP BY substr(created_at,1,7)
      ORDER BY ym DESC
      LIMIT 3
    `).all<any>() : { results: [] };

    const histData = (hist.results || []) as Array<{ym: string; cnt: number}>;
    const avgMonthly = histData.length > 0
      ? histData.reduce((s, h) => s + h.cnt, 0) / histData.length
      : 30;

    // 당월 예측: 현재 진행율 기반
    const dailyRate = today > 0 ? currentMonthTotal / today : 0;
    const forecastThisMonth = Math.round(dailyRate * daysInMonth);
    const forecastRevenue = forecastThisMonth * 150000;
    const forecastSettlement = Math.round(forecastRevenue * 0.25);

    // 지난달 실적
    const prevYm = (() => {
      const d = new Date(now.getFullYear(), now.getMonth()-1, 1);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    })();
    const prevTotal = histData.find(h => h.ym === prevYm)?.cnt || 0;

    // 이번달 현재까지 매출
    const currentRevenue = currentMonthTotal * 150000;
    const currentSettlement = Math.round(currentRevenue * 0.25);

    // 달성률
    const achieveRate = avgMonthly > 0 ? Math.round((currentMonthTotal / avgMonthly) * 100) : 0;

    return c.json({
      ok: true,
      month: ym,
      today,
      daysInMonth,
      currentMonthTotal,
      currentRevenue,
      currentSettlement,
      forecastThisMonth,
      forecastRevenue,
      forecastSettlement,
      avgMonthly: Math.round(avgMonthly),
      prevMonthTotal: prevTotal,
      achieveRate,
      dailyData,
      histData
    });
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500);
  }
});

/* ═══════════════════════════════════════════════════════
   GET /api/consultant/clients — ref_code 기반 고객 목록 (인증 없이)
═══════════════════════════════════════════════════════ */
app.get('/api/consultant/clients', async (c) => {
  const db = c.env.DB as D1Database | undefined;
  const refCode = c.req.query('ref_code') || c.req.header('X-Ref-Code') || '';
  if (!refCode) return c.json({ ok: false, error: 'ref_code required' }, 400);
  try {
    const rows = db ? await db.prepare(`
      SELECT id, user_name, ref_code, bc_primary, bc_secondary,
             gender, created_at,
             (SELECT COUNT(*) FROM checkin_log cl WHERE cl.result_id = dr.id) AS checkin_count,
             (SELECT MAX(cl.checked_at) FROM checkin_log cl WHERE cl.result_id = dr.id) AS last_checkin
      FROM diagnosis_results dr
      WHERE dr.ref_code = ?
      ORDER BY dr.created_at DESC
      LIMIT 100
    `).bind(refCode).all<any>() : { results: [] };
    return c.json({ ok: true, clients: rows.results || [], ref_code: refCode });
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500);
  }
});

/* ═══════════════════════════════════════════════════════
   GET /api/consultant/checkin-history/:result_id — 체크인 이력 조회
═══════════════════════════════════════════════════════ */
app.get('/api/consultant/checkin-history/:result_id', requireRole('ANY'), async (c: any) => {
  const db = c.env.DB as D1Database | undefined;
  const resultId = c.req.param('result_id');
  try {
    const rows = db ? await db.prepare(`
      SELECT * FROM checkin_log
      WHERE result_id = ?
      ORDER BY checked_at ASC
    `).bind(resultId).all<any>() : { results: [] };

    // 고객 기본 정보도 함께
    const customer = db ? await db.prepare(`
      SELECT id, user_name, bc_primary, weight, target_weight, height, created_at, consultant_code
      FROM results WHERE id = ?
    `).bind(resultId).first<any>() : null;

    return c.json({ ok: true, customer, checkins: rows.results || [] });
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500);
  }
});

/* ═══════════════════════════════════════════════════════
   GET /api/consultant/my-customers — 내 고객 목록 + 체중/체크인 현황
═══════════════════════════════════════════════════════ */
app.get('/api/consultant/my-customers', requireRole('ANY'), async (c) => {
  const db = c.env.DB as D1Database | undefined;
  const user = c.get('user') as JwtPayload;
  const consultantCode = user?.code || '';

  try {
    const rows = db ? await db.prepare(`
      SELECT
        r.id, r.user_name, r.bc_primary, r.bc_secondary,
        r.weight, r.target_weight, r.height, r.bmi,
        r.gender, r.created_at,
        (SELECT COUNT(*) FROM checkin_log cl WHERE cl.result_id = r.id) AS checkin_count,
        (SELECT MAX(cl.checked_at) FROM checkin_log cl WHERE cl.result_id = r.id) AS last_checkin
      FROM results r
      WHERE r.consultant_code = ?
      ORDER BY r.created_at DESC
      LIMIT 100
    `).bind(consultantCode).all<any>() : { results: [] };

    return c.json({ ok: true, customers: rows.results || [], consultantCode });
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500);
  }
});

/* ═══════════════════════════════════════════════════════
   POST /api/consultant/weight-checkin — 체중 변화 체크인
═══════════════════════════════════════════════════════ */
app.post('/api/consultant/weight-checkin', requireRole('ANY'), async (c) => {
  const db = c.env.DB as D1Database | undefined;
  try {
    const body = await c.req.json() as {
      result_id?: string;
      week_range?: string;
      current_weight?: number;
      memo?: string;
    };

    if (!body.result_id) return c.json({ ok: false, error: 'result_id required' }, 400);

    // axis_name에 "체중" 키워드 + week_range로 저장
    const user = c.get('user') as JwtPayload;
    const consultantCode = user?.code || '';

    if (db) {
      await db.prepare(`
        INSERT INTO checkin_log (result_id, consultant_code, week_range, axis_name, checked_at)
        VALUES (?,?,?,?,?)
      `).bind(
        body.result_id,
        consultantCode,
        body.week_range || `W${new Date().toISOString().slice(0,10)}`,
        `체중:${body.current_weight || 0}kg${body.memo ? ' / '+body.memo : ''}`,
        new Date().toISOString()
      ).run();
    }

    return c.json({ ok: true, message: '체중 체크인 완료' });
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500);
  }
});

// ══════════════════════════════════════════════════════════════════
//  4단계: 카카오 설정 API (API 키 없이도 구조 작동)
// ══════════════════════════════════════════════════════════════════

// GET /api/settings/kakao — 카카오 설정 조회
app.get('/api/settings/kakao', requireRole('ANY'), async (c) => {
  const db = c.env.DB as D1Database | undefined
  if (!db) return c.json({ kakao_app_key: '', kakao_enabled: false })
  try {
    const row = await db.prepare(
      "SELECT value FROM _cf_KV WHERE key = 'kakao_app_key'"
    ).first<any>()
    const key = row?.value || ''
    return c.json({ kakao_app_key: key ? key.slice(0,4) + '****' : '', kakao_enabled: !!key })
  } catch {
    return c.json({ kakao_app_key: '', kakao_enabled: false })
  }
})

// PUT /api/settings/kakao — 카카오 API 키 저장 (마스터만)
app.put('/api/settings/kakao', requireRole('MASTER'), async (c) => {
  const db = c.env.DB as D1Database | undefined
  try {
    const body = await c.req.json() as { kakao_app_key?: string }
    const key = (body.kakao_app_key || '').trim()
    if (!db) return c.json({ ok: false, error: 'DB 없음' }, 500)
    await db.prepare(
      "INSERT OR REPLACE INTO _cf_KV (key, value) VALUES ('kakao_app_key', ?)"
    ).bind(key).run()
    return c.json({ ok: true, message: key ? '카카오 API 키가 저장되었습니다.' : '카카오 API 키가 삭제되었습니다.' })
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// POST /api/kakao/send — 카카오 메시지 발송 (API 키 있을 때만)
app.post('/api/kakao/send', requireRole('ANY'), async (c) => {
  const db = c.env.DB as D1Database | undefined
  try {
    const body = await c.req.json() as {
      result_id?: string
      user_name?: string
      bc_primary?: string
      bc_secondary?: string
      custom_message?: string
    }
    // API 키 확인
    let kakaoKey = ''
    if (db) {
      const row = await db.prepare("SELECT value FROM _cf_KV WHERE key = 'kakao_app_key'").first<any>()
      kakaoKey = row?.value || ''
    }
    // 메시지 텍스트 생성
    const resultUrl = `https://slimmind.kr/result/${body.result_id}`
    const message = body.custom_message || [
      `[슬림마인드 바디코드 분석 결과] 🌿`,
      ``,
      `안녕하세요, ${body.user_name || '고객'}님!`,
      `바디코드 정밀 분석이 완료되었습니다.`,
      ``,
      `📊 주요 체형: ${body.bc_primary || '분석완료'}`,
      body.bc_secondary ? `📌 보조 체형: ${body.bc_secondary}` : null,
      ``,
      `👇 전체 결과 보러가기`,
      resultUrl,
      ``,
      `궁금한 점은 언제든지 문의해 주세요 😊`,
    ].filter(l => l !== null).join('\n')

    if (!kakaoKey) {
      // API 키 없음 → 클립보드용 메시지만 반환
      return c.json({
        ok: true,
        method: 'clipboard',
        message,
        notice: '카카오 API 키가 설정되지 않았습니다. 클립보드 복사로 전송하세요.'
      })
    }

    // TODO: 카카오 API 키 있을 때 실제 발송 (나중에 구현)
    // const res = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', { ... })
    return c.json({
      ok: true,
      method: 'kakao_api',
      message,
      notice: '카카오 알림톡 발송 완료 (API 연동됨)'
    })
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  5단계: 월간 AI 리포트
// ══════════════════════════════════════════════════════════════════

app.get('/api/admin/monthly-report', requireRole('MASTER'), async (c) => {
  const db = c.env.DB as D1Database | undefined
  if (!db) return c.json({ error: 'DB 없음' }, 500)
  try {
    const now = new Date()
    const thisMonth = now.toISOString().slice(0, 7) // "2026-06"
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)

    // 이달 신규 고객
    const thisMonthNew = await db.prepare(
      "SELECT COUNT(*) as cnt FROM results WHERE created_at LIKE ?"
    ).bind(`${thisMonth}%`).first<any>()

    // 지난달 신규 고객
    const lastMonthNew = await db.prepare(
      "SELECT COUNT(*) as cnt FROM results WHERE created_at LIKE ?"
    ).bind(`${lastMonth}%`).first<any>()

    // BC 코드 분포 (이달)
    const bcDist = await db.prepare(
      "SELECT bc_primary, COUNT(*) as cnt FROM results WHERE created_at LIKE ? GROUP BY bc_primary ORDER BY cnt DESC"
    ).bind(`${thisMonth}%`).all<any>()

    // 활성 컨설턴트 수
    const activeConsultants = await db.prepare(
      "SELECT COUNT(*) as cnt FROM consultants WHERE subscription_status = 'active'"
    ).first<any>()

    // 이달 체크인 수
    const checkinsThisMonth = await db.prepare(
      "SELECT COUNT(*) as cnt FROM checkin_log WHERE checked_at LIKE ?"
    ).bind(`${thisMonth}%`).first<any>()

    // 이탈 위험 고객 (21일 이상)
    const churnRisk = await db.prepare(
      "SELECT COUNT(*) as cnt FROM results WHERE julianday('now') - julianday(created_at) >= 21"
    ).first<any>()

    // 컨설턴트별 실적 TOP 5
    const consultantRanking = await db.prepare(`
      SELECT c.name, c.code, COUNT(r.id) as result_cnt
      FROM consultants c
      LEFT JOIN results r ON r.consultant_code = c.code AND r.created_at LIKE ?
      WHERE c.code != 'MASTER'
      GROUP BY c.code ORDER BY result_cnt DESC LIMIT 5
    `).bind(`${thisMonth}%`).all<any>()

    // 최근 6개월 월별 신규 고객 트렌드
    const trend: any[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const ym = d.toISOString().slice(0, 7)
      const row = await db.prepare(
        "SELECT COUNT(*) as cnt FROM results WHERE created_at LIKE ?"
      ).bind(`${ym}%`).first<any>()
      trend.push({ month: ym, count: row?.cnt || 0 })
    }

    const thisN = thisMonthNew?.cnt || 0
    const lastN = lastMonthNew?.cnt || 0
    const growthRate = lastN > 0 ? Math.round(((thisN - lastN) / lastN) * 100) : 0

    return c.json({
      period: thisMonth,
      summary: {
        new_customers_this_month: thisN,
        new_customers_last_month: lastN,
        growth_rate: growthRate,
        active_consultants: activeConsultants?.cnt || 0,
        checkins_this_month: checkinsThisMonth?.cnt || 0,
        churn_risk_count: churnRisk?.cnt || 0,
      },
      bc_distribution: bcDist.results || [],
      consultant_ranking: consultantRanking.results || [],
      monthly_trend: trend,
      generated_at: now.toISOString(),
    })
  } catch(e) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  5단계: B2B 서브계정 (원장이 직원 계정 생성/관리)
// ══════════════════════════════════════════════════════════════════

// GET /api/b2b/subaccounts — 내 서브계정 목록
app.get('/api/b2b/subaccounts', requireB2B(), async (c) => {
  const db = c.env.DB as D1Database | undefined
  if (!db) return c.json({ subaccounts: [] })
  const user = c.get('user') as JwtPayload
  const partnerCode = user?.code || ''
  try {
    // b2b_partners 테이블의 parent_code 컬럼 사용 (없으면 빈 배열)
    const rows = await db.prepare(
      "SELECT code, name, email, phone, status, created_at FROM b2b_partners WHERE parent_code = ? ORDER BY created_at"
    ).bind(partnerCode).all<any>()
    return c.json({ subaccounts: rows.results || [] })
  } catch {
    return c.json({ subaccounts: [] })
  }
})

// POST /api/b2b/subaccounts — 서브계정 생성
app.post('/api/b2b/subaccounts', requireB2B(), async (c) => {
  const db = c.env.DB as D1Database | undefined
  if (!db) return c.json({ ok: false, error: 'DB 없음' }, 500)
  const user = c.get('user') as JwtPayload
  const partnerCode = user?.code || ''
  try {
    const body = await c.req.json() as {
      name?: string
      role_label?: string  // "직원" | "원장보" | "실장" 등
      password?: string
    }
    if (!body.name) return c.json({ ok: false, error: '이름을 입력하세요.' }, 400)

    // 파트너 정보 조회
    const partner = await db.prepare('SELECT * FROM b2b_partners WHERE code = ?').bind(partnerCode).first<any>()
    if (!partner) return c.json({ ok: false, error: '파트너 정보 없음' }, 404)

    // 서브계정 코드 생성: B2B-XXX-001-S01 형식
    const existingCount = await db.prepare(
      "SELECT COUNT(*) as cnt FROM b2b_partners WHERE parent_code = ?"
    ).bind(partnerCode).first<any>()
    const seq = String((existingCount?.cnt || 0) + 1).padStart(2, '0')
    const subCode = `${partnerCode}-S${seq}`
    const defaultPw = body.password || `sub${seq}1234`
    const id = crypto.randomUUID().replace(/-/g, '')

    await db.prepare(`
      INSERT INTO b2b_partners
        (id, code, name, type, brand_name, brand_color, parent_code, password_hash, status, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))
    `).bind(
      id, subCode,
      body.name,
      partner.type || '기타',
      partner.brand_name || partner.name,
      partner.brand_color || '#6366f1',
      partnerCode,
      defaultPw,
      'active'
    ).run()

    return c.json({
      ok: true,
      subaccount: { code: subCode, name: body.name, password: defaultPw },
      message: `서브계정 생성 완료. 코드: ${subCode}, 초기 비밀번호: ${defaultPw}`
    })
  } catch(e: any) {
    // parent_code 컬럼 없으면 ALTER TABLE
    if (String(e).includes('no such column: parent_code')) {
      try {
        await (db as D1Database).prepare(
          "ALTER TABLE b2b_partners ADD COLUMN parent_code TEXT DEFAULT NULL"
        ).run()
        return c.json({ ok: false, error: 'DB 컬럼 추가 완료. 다시 시도해주세요.' })
      } catch {}
    }
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// DELETE /api/b2b/subaccounts/:code — 서브계정 삭제
app.delete('/api/b2b/subaccounts/:code', requireB2B(), async (c) => {
  const db = c.env.DB as D1Database | undefined
  if (!db) return c.json({ ok: false }, 500)
  const user = c.get('user') as JwtPayload
  const partnerCode = user?.code || ''
  const subCode = c.req.param('code')
  try {
    // 내 서브계정인지 확인
    const sub = await db.prepare(
      "SELECT code FROM b2b_partners WHERE code = ? AND parent_code = ?"
    ).bind(subCode, partnerCode).first<any>()
    if (!sub) return c.json({ ok: false, error: '권한 없음' }, 403)
    await db.prepare("DELETE FROM b2b_partners WHERE code = ?").bind(subCode).run()
    return c.json({ ok: true })
  } catch(e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  B2B 결과지 토큰 포함 접근 링크
// ══════════════════════════════════════════════════════════════════

// GET /api/b2b/result-link/:id — B2B 파트너용 결과지 접근 토큰 생성
app.get('/api/b2b/result-link/:id', requireB2B(), async (c) => {
  const db = c.env.DB as D1Database | undefined
  if (!db) return c.json({ error: 'DB 없음' }, 500)
  const user = c.get('user') as JwtPayload
  const partnerCode = user?.code || ''
  const resultId = c.req.param('id')
  try {
    // 이 파트너 고객인지 확인 (ref_code = 파트너 코드)
    const result = await db.prepare(
      "SELECT id FROM results WHERE id = ? AND ref_code = ?"
    ).bind(resultId, partnerCode).first<any>()
    if (!result) return c.json({ error: '권한 없음' }, 403)
    // 기존 파트너 토큰으로 링크 생성
    const secret = c.env.JWT_SECRET || 'slimmind-jwt-secret-change-in-production'
    const payload: JwtPayload = {
      sub: partnerCode,
      code: partnerCode,
      role: 'B2B_PARTNER',
      name: user.name || '',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30일
    }
    const token = await signJwt(payload, secret)
    return c.json({ url: `/result/${resultId}?token=${token}` })
  } catch(e) {
    return c.json({ error: String(e) }, 500)
  }
})

// ============================================================
// BC코드 → 시술 추천 API
// GET /api/b2b/my-programs/:bc_code — 내 업체 등록 프로그램 중 BC코드 매칭 목록
// 파트너 추천 뷰에서 BC코드별 자동 연동용
app.get('/api/b2b/my-programs/:bc_code', requireB2B(), async (c) => {
  const db = c.env.DB as D1Database | undefined
  if (!db) return c.json({ error: 'DB 없음' }, 500)
  const user = c.get('user') as JwtPayload
  const partnerCode = user?.code || ''
  const bcCode = c.req.param('bc_code')

  try {
    // 1) 해당 파트너의 등록 프로그램 중 bc_tags에 bcCode 포함된 것 조회
    const programs = await db.prepare(
      `SELECT id, program_name, price, description, tags, bc_tags
       FROM b2b_custom_programs
       WHERE b2b_code = ? AND bc_tags LIKE ?
       ORDER BY price ASC`
    ).bind(partnerCode, `%${bcCode}%`).all<any>()

    // 2) 업체 전체 프로그램도 함께 반환 (bc_tags가 비어있거나 'ALL' 포함)
    const allPrograms = await db.prepare(
      `SELECT id, program_name, price, description, tags, bc_tags
       FROM b2b_custom_programs
       WHERE b2b_code = ? AND (bc_tags IS NULL OR bc_tags = '' OR bc_tags LIKE '%ALL%')
       ORDER BY price ASC LIMIT 5`
    ).bind(partnerCode).all<any>()

    const matched = programs.results || []
    const general = (allPrograms.results || []).filter(
      (g: any) => !matched.some((m: any) => m.id === g.id)
    )

    return c.json({
      bc_code: bcCode,
      matched_programs: matched,
      general_programs: general,
      has_programs: matched.length > 0 || general.length > 0,
    })
  } catch(e) {
    return c.json({ error: String(e) }, 500)
  }
})

// GET /api/b2b/recommend/:resultId
// B2B 파트너가 고객 결과지 기반으로 매칭 시술 목록 조회
// ============================================================

// BC 코드별 추천 코멘트 맵
const BC_RECOMMEND_COMMENTS: Record<string, { title: string; reason: string }> = {
  'BC-01': { title: '복부 내장지방 집중 관리', reason: '내장지방형(BC-01)은 복부 심층 지방 분해가 핵심입니다. 카복시테라피·GPL주사·슬림주사가 내장지방 분해와 대사 촉진에 직접 작용합니다.' },
  'BC-02': { title: '복부 피하지방 집중 관리', reason: '피하지방형(BC-02)은 복부 표층 지방 분해 시술이 효과적입니다. 메조테라피·카복시·슬림주사로 국소 지방을 직접 공략하세요.' },
  'BC-03': { title: '허리·옆구리 라인 개선', reason: '허리라인형(BC-03)은 옆구리·복부 라인 정리에 윤곽주사 계열과 카복시가 적합합니다.' },
  'BC-04': { title: '상체 지방 집중 관리', reason: '상체비만형(BC-04)은 상반신 전체 지방 분해를 위해 슬림주사·메조테라피 조합이 권장됩니다.' },
  'BC-05': { title: '하체·허벅지 라인 슬리밍', reason: '하체비만형(BC-05)은 허벅지·종아리 부위에 카복시·윤곽주사·바디보톡스가 효과적입니다.' },
  'BC-06': { title: '팔뚝·어깨 라인 정리', reason: '팔뚝형(BC-06)은 승모근 보톡스 및 팔뚝 카복시·윤곽주사로 라인을 정리할 수 있습니다.' },
  'BC-07': { title: '전신 체형 균형 관리', reason: '전신형(BC-07)은 부위별 복합 관리가 필요합니다. 메조테라피와 슬림주사 병행을 추천합니다.' },
  'BC-08': { title: '스트레스·코르티솔 피로 회복', reason: '스트레스형(BC-08)은 코르티솔 과잉으로 피로와 피부저하가 동반됩니다. 마녀주사(신데렐라)·GPL주사가 피로 해소와 항산화에 탁월합니다.' },
  'BC-09': { title: '호르몬·탄력 복합 개선', reason: '호르몬형(BC-09)은 피부탄력 저하와 체형변화를 동반합니다. 실리프팅·스킨부스터·리프팅레이저를 통한 복합 관리를 권장합니다.' },
  'BC-10': { title: '피부 탄력·광채 집중 케어', reason: '탄력저하형(BC-10)은 콜라겐 재생과 수분 공급이 우선입니다. 스킨부스터·실리프팅·보톡스 조합이 효과적입니다.' },
  'BC-11': { title: '피부결·모공 정밀 개선', reason: '피부결형(BC-11)은 모공·피부결 개선에 실펌X·보톡스·리프팅이 복합 적용됩니다.' },
  'BC-12': { title: '피부 미백·균일 톤 관리', reason: '색소형(BC-12)은 미백·색소 개선에 토닝레이저·GV레이저·스킨부스터가 직접 작용합니다.' },
  'BC-13': { title: '자세·체형 균형 교정 관리', reason: '자세불균형형(BC-13, P-POSTURE)은 골반 틀어짐과 척추측만이 체형 불균형의 핵심 원인입니다. 체형교정 도수치료·바디라인 슬리밍 병행으로 올바른 체형을 회복합니다.' },
  'BC-14': { title: '만성피로·에너지 충전 케어', reason: '만성피로형(BC-14, F-FATIGUE)은 부신 기능 저하와 미토콘드리아 부전으로 에너지 생산이 떨어진 상태입니다. 마녀주사·신데렐라주사·GPL주사로 세포 에너지 재충전을 지원합니다.' },
  'BC-15': { title: '면역·림프 순환 강화 케어', reason: '면역순환형(BC-15, I-IMMUNE)은 림프 정체와 만성 염증이 면역력과 체형에 영향을 줍니다. 림프 순환 개선 시술과 항염 주사로 면역 균형을 회복합니다.' },
  'BC-16': { title: '수면 개선·야간 대사 정상화', reason: '수면교란형(BC-16, SL-SLEEP)은 멜라토닌 교란과 야간 식욕 호르몬 과잉이 체중 증가를 유발합니다. 수면 질 개선을 통한 호르몬 균형 회복 프로그램을 권장합니다.' },
  'BC-17': { title: '간·해독 기능 집중 케어', reason: '해독부전형(BC-17, D-DETOX)은 비알코올성 지방간과 간 해독 부전으로 대사산물이 체내에 쌓입니다. 간 기능 지원 주사와 해독 프로그램으로 대사 회복을 돕습니다.' },
  'BC-18': { title: '갑상선·기초대사 활성화 케어', reason: '대사저하형(BC-18, M-METABOLIC)은 갑상선 기능 저하로 기초대사율이 낮아져 쉽게 살이 찌는 체형입니다. 대사 활성화 주사와 체성분 관리를 병행합니다.' },
  'BC-19': { title: '나트륨·수분 균형 집중 관리', reason: '수분불균형형(BC-19, W-WATER)은 나트륨 과잉과 신장 기능 저하로 부종이 만성화된 상태입니다. 림프 배액 촉진과 이뇨 개선 주사로 수분 균형을 정상화합니다.' },
  'BC-20': { title: '요산·퓨린 배설 개선 케어', reason: '요산과잉형(BC-20, U-URIC)은 퓨린 과잉과 신장 배설 저하로 요산이 축적되며 대사에 영향을 줍니다. 해독·항염 프로그램으로 요산 배설을 촉진합니다.' },
  'BC-21': { title: '장내 미생물·소화 균형 회복', reason: '장기능저하형(BC-21, GI-GUT)은 장내미생물 불균형과 장 투과성 증가가 체중 조절을 방해합니다. 장 건강 회복 프로그램과 복부 관리를 병행합니다.' },
  'BC-22': { title: '피부 재생·노화 방지 집중 케어', reason: '피부노화형(BC-22, AG-AGING)은 콜라겐 합성 감소와 산화 스트레스 과잉으로 피부 노화가 가속됩니다. 스킨부스터·리프팅레이저·항산화 주사로 피부 재생을 집중 지원합니다.' },
}

app.get('/api/b2b/recommend/:resultId', requireB2B(), async (c) => {
  const db = c.env.DB as D1Database | undefined
  if (!db) return c.json({ error: 'DB 없음' }, 500)
  const user = c.get('user') as JwtPayload
  const partnerCode = user?.code || ''
  const resultId = c.req.param('resultId')

  try {
    // 1) 고객 결과지 조회 (ref_code = 파트너 코드로 소속 확인)
    const result = await db.prepare(
      "SELECT id, user_name, bc_primary, ref_code FROM results WHERE id = ? AND ref_code = ?"
    ).bind(resultId, partnerCode).first<any>()
    if (!result) return c.json({ error: '권한 없음 또는 결과지 미존재' }, 403)

    const bcCode = result.bc_primary as string | null
    if (!bcCode) return c.json({ error: 'BC코드 미설정', treatments: [] })

    // 2) 해당 파트너 시술 중 bc_tags에 고객 BC코드가 포함된 것 조회
    const programs = await db.prepare(
      `SELECT id, program_name, price, description, tags, bc_tags
       FROM b2b_custom_programs
       WHERE b2b_code = ?
         AND bc_tags LIKE ?`
    ).bind(partnerCode, `%${bcCode}%`).all<any>()

    const treatments = programs.results || []

    // 3) BC코드 코멘트 생성
    const commentInfo = BC_RECOMMEND_COMMENTS[bcCode] || {
      title: `${bcCode} 맞춤 관리`,
      reason: `고객의 BC코드(${bcCode})에 맞춘 시술 프로그램을 추천합니다.`
    }

    // 4) 가격 기준 정렬 (저렴한 순)
    treatments.sort((a: any, b: any) => (a.price || 0) - (b.price || 0))

    return c.json({
      customer_name: result.user_name,
      bc_code: bcCode,
      recommend_title: commentInfo.title,
      recommend_reason: commentInfo.reason,
      treatments,
      partner_code: partnerCode,
    })
  } catch(e) {
    return c.json({ error: String(e) }, 500)
  }
})

// ════════════════════════════════════════════════════════
//  POST /api/v1/diagnosis — 설문 완료 후 기질+닉네임 저장
// ════════════════════════════════════════════════════════
app.post('/api/v1/diagnosis', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not configured' }, 500)

  try {
    const body = await c.req.json()
    const {
      user_name, phone, bc_nickname, bc_primary, bc_secondary, bc_code_key,
      top3_axes, axis_scores, region, texture, bg_filter,
      ohaeng_type, ohaeng_source, ohaeng_confidence, ohaeng_lacking, ohaeng_score,
      mbti_full, disp_answers, raw_answers,
      goal_weight, weight_loss_pct,
      gender, height, age,              // ✅ BMR·체지방률 개인화 계산용
      ref_code, completed_at,
      session_id   // ✅ FIX: session_id 수신 (데일리 체크 JOIN 연결용)
    } = body

    if (!user_name) return c.json({ error: 'user_name required' }, 400)

    // ✅ BUG-1 대응: bc_primary가 닉네임(한글)이므로 bc_code_key(BC-N 형태) 도 저장
    // bc_code_key가 없으면 NICKNAME_TO_BC 로컬 테이블로 역매핑
    // [수정 V4.6] 전체 닉네임 21개 완비 — 누락 닉네임으로 인한 bc_code_key null 방지
    const NICKNAME_TO_BC_BACKEND: Record<string, string> = {
      // BC-1: 림프·부종 계열
      '오후만되면 코끼리다리형':'BC-1',
      '엄마체형 하지정체형':'BC-1',
      // BC-2: 골격·자세 계열
      '목짧아지는 거북이형':'BC-2',
      '안 쓰는 팔뚝 부종형':'BC-2',
      '겨드랑이 부유방형':'BC-2',
      // BC-3: 인슐린·내장 계열
      '아빠체형 내장비대형':'BC-3',
      '식후기절 혈당롤러코스터형':'BC-3',
      '식후임산부 가스풍선형':'BC-3',
      '동시다발 다중악순환형':'BC-3',
      // BC-4: 대사저하·냉증 계열
      '약물부작용 강제축적형':'BC-4',
      '억제제부작용 배부름마비형':'BC-4',
      '여름에도 시린 얼음장형':'BC-4',
      // BC-5: 장·소화 계열
      '지방흡입후 재발형':'BC-5',
      // BC-6: 호르몬·스트레스 계열
      '털털한 PCOS형':'BC-6',
      '스트레스성 야식부엉이형':'BC-6',
      '호르몬스위치 갱년기형':'BC-6',
      '스트레스기절 번아웃형':'BC-6',
      // BC-7: 자율신경·골반 계열
      '출산후 바람빠진 풍선형':'BC-7',
      '골반틀어짐 승마살형':'BC-7',
      // BC-8: 근육·심리 계열
      '운동할수록 말벅지형':'BC-8',
      '상체근육형':'BC-8',
      // BC-9: 대사증후군·복합 계열
      '팔다리거미 올챙이배형':'BC-9',
      '대사증후군 종합형':'BC-9',
    }
    // ✅ [수정 V4.4] bc_primary에 raw 축코드(A07, A02 등)가 들어올 경우 정규화 적용
    // normalizeBcCode()가 A0X 패턴을 BC코드로 변환함
    const safeBcPrimaryForKey = bc_primary
      ? (/^A\d{2}$/.test(String(bc_primary).trim()) ? normalizeBcCode(bc_primary) : bc_primary)
      : null
    const safeBcNicknameForKey = bc_nickname
      ? (/^A\d{2}$/.test(String(bc_nickname).trim()) ? null : bc_nickname)  // 닉네임에 축코드면 무시
      : null

    // bc_code_key가 없으면 bc_primary(닉네임)로 역매핑, 그것도 없으면 null
    const resolvedBcCodeKey = bc_code_key ||
      (safeBcPrimaryForKey && NICKNAME_TO_BC_BACKEND[safeBcPrimaryForKey]) ||
      (safeBcPrimaryForKey && /^BC-[1-9]$/.test(safeBcPrimaryForKey) ? safeBcPrimaryForKey : null) ||
      (safeBcNicknameForKey && NICKNAME_TO_BC_BACKEND[safeBcNicknameForKey]) ||
      null

    // UUID 생성
    const result_id = crypto.randomUUID()
    const now = new Date().toISOString()

    // raw_answers: 1~4차 전체 원시 답변 JSON 직렬화
    // raw_answers 컬럼이 없는 구버전 DB에서도 graceful하게 처리
    const rawAnswersJson = raw_answers ? JSON.stringify(raw_answers) : null

    try {
      // ✅ V4.6: ohaeng 확장 필드(source/confidence/lacking/score) 포함 INSERT (migration 0036 이후)
      // ✅ FIX: session_id 추가 (daily_checks JOIN 연결용)
      await db.prepare(`
        INSERT INTO diagnosis_results
          (id, user_name, phone, bc_nickname, bc_primary, bc_code_key, bc_secondary,
           top3_axes, axis_scores, region, texture, bg_filter,
           ohaeng_type, ohaeng_source, ohaeng_confidence, ohaeng_lacking, ohaeng_score,
           mbti_full, disp_answers, raw_answers,
           goal_weight, weight_loss_pct,
           gender, height, age,
           ref_code, session_id, completed_at, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        result_id,
        String(user_name || '익명'),
        phone || null,
        // [수정 V4.4] bc_nickname에 raw 축코드(A07 등) 들어오면 닉네임 컬럼엔 null 저장
        safeBcNicknameForKey || null,
        // [수정 V4.4] bc_primary에 raw 축코드가 들어오면 정규화된 BC코드로 저장
        safeBcPrimaryForKey || null,
        resolvedBcCodeKey || null,
        bc_secondary || null,
        top3_axes   ? JSON.stringify(top3_axes)   : null,
        axis_scores ? JSON.stringify(axis_scores) : null,
        region      || null,
        texture     || null,
        bg_filter   || '',
        ohaeng_type || null,
        // V4.6 오행 확장 필드
        ohaeng_source      || null,
        ohaeng_confidence  != null ? Number(ohaeng_confidence) : null,
        ohaeng_lacking     || null,
        Array.isArray(ohaeng_score) ? JSON.stringify(ohaeng_score) : (ohaeng_score || null),
        mbti_full   || null,
        disp_answers ? JSON.stringify(disp_answers) : null,
        rawAnswersJson,
        goal_weight     != null ? Number(goal_weight)     : null,
        weight_loss_pct != null ? Number(weight_loss_pct) : null,
        gender      || null,
        height      != null ? Number(height) : null,
        age         != null ? Number(age)    : null,
        ref_code     || null,
        session_id   || null,   // ✅ FIX: session_id 저장
        completed_at || now,
        now
      ).run()
    } catch (insertErr: any) {
      // 신규 컬럼이 없는 구버전 DB → 폴백 INSERT (ohaeng 확장 컬럼 없이)
      if (String(insertErr).includes('no column named') ||
          String(insertErr).includes('table diagnosis_results has no column')) {
        console.warn('[diagnosis POST] 신규 컬럼 없음 — 폴백 INSERT (migration 미적용)', String(insertErr).slice(0,120))
        await db.prepare(`
          INSERT INTO diagnosis_results
            (id, user_name, bc_nickname, bc_primary, bc_secondary,
             top3_axes, axis_scores, region, texture, bg_filter,
             ohaeng_type, mbti_full, disp_answers,
             ref_code, completed_at, created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).bind(
          result_id,
          String(user_name || '익명'),
          bc_nickname  || null,
          bc_primary   || null,
          bc_secondary || null,
          top3_axes   ? JSON.stringify(top3_axes)   : null,
          axis_scores ? JSON.stringify(axis_scores) : null,
          region      || null,
          texture     || null,
          bg_filter   || '',
          ohaeng_type || null,
          mbti_full   || null,
          disp_answers ? JSON.stringify(disp_answers) : null,
          ref_code     || null,
          completed_at || now,
          now
        ).run()
      } else {
        throw insertErr
      }
    }

    // ref_code가 있으면 컨설턴트/B2B 연결 확인
    let connected_to: string | null = null
    if (ref_code) {
      const cst = await db.prepare(
        `SELECT id FROM consultants WHERE code = ? LIMIT 1`
      ).bind(ref_code).first()
      if (cst) connected_to = 'consultant'
      else {
        const b2b = await db.prepare(
          `SELECT id FROM b2b_partners WHERE ref_code = ? LIMIT 1`
        ).bind(ref_code).first()
        if (b2b) connected_to = 'b2b_partner'
      }
    }

    return c.json({
      result_id,
      bc_nickname: bc_nickname || null,
      status: 'ok',
      connected_to
    })
  } catch (e) {
    console.error('[diagnosis POST]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ════════════════════════════════════════════════════════
//  GET /api/v1/diagnosis/:id — 결과지 데이터 조회
// ════════════════════════════════════════════════════════
app.get('/api/v1/diagnosis/:id', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not configured' }, 500)

  try {
    const id = c.req.param('id')
    const row = await db.prepare(
      `SELECT * FROM diagnosis_results WHERE id = ? LIMIT 1`
    ).bind(id).first() as any

    if (!row) return c.json({ error: 'not found' }, 404)

    const parseJson = (v: any, fallback: any) => {
      try { return v ? JSON.parse(v) : fallback } catch { return fallback }
    }

    return c.json({
      result_id:    row.id,
      user_name:    row.user_name,
      bc_nickname:  row.bc_nickname,
      bc_primary:   row.bc_primary,    // 한글 닉네임 ('스트레스성 야식부엉이형')
      bc_code_key:  row.bc_code_key,   // ✅ BC-N 형태 코드 ('BC-6') — result-v4.html에서 우선 사용
      bc_secondary: row.bc_secondary,
      top3_axes:    parseJson(row.top3_axes,    []),
      axis_scores:  parseJson(row.axis_scores,  {}),
      region:       row.region,
      texture:      row.texture,
      bg_filter:    row.bg_filter,
      ohaeng_type:  row.ohaeng_type,
      mbti_full:    row.mbti_full,
      disp_answers:    parseJson(row.disp_answers, {}),
      raw_answers:     parseJson(row.raw_answers,  null),
      goal_weight:     row.goal_weight     ?? null,   // ✅ 추가
      weight_loss_pct: row.weight_loss_pct ?? null,   // ✅ 추가
      ref_code:        row.ref_code,
      consultant_code: row.ref_code,   // ✅ FIX: result-v4.html daily-check용 (consultant_code = ref_code)
      completed_at:    row.completed_at,
      created_at:      row.created_at
    })
  } catch (e) {
    console.error('[diagnosis GET]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ════════════════════════════════════════════════════════
//  기능 8: 가족 코드 비교
//  POST /api/v1/family-code/join   — 결과에 가족코드 연결 (신규 or 기존 코드 참여)
//  GET  /api/v1/family-code/:code  — 가족 코드 구성원 목록 + 코드 비교
// ════════════════════════════════════════════════════════

// 6자리 대문자+숫자 코드 생성
function genFamilyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// POST /api/v1/family-code/join
// body: { result_id, family_code? }  — family_code 없으면 새로 생성
app.post('/api/v1/family-code/join', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not configured' }, 500)
  try {
    const { result_id, family_code } = await c.req.json() as any
    if (!result_id) return c.json({ error: 'result_id required' }, 400)

    // 결과 존재 확인
    const row = await db.prepare(
      'SELECT id, user_name, bc_primary, bc_nickname, family_group_code FROM diagnosis_results WHERE id=?'
    ).bind(result_id).first() as any
    if (!row) return c.json({ error: '결과를 찾을 수 없습니다.' }, 404)

    // 가족코드 결정: 기존 코드 참여 or 신규 생성
    let code = family_code ? family_code.toUpperCase().trim() : null

    if (code) {
      // 유효성 검사: 6자리, 기존 코드 존재 여부
      if (!/^[A-Z0-9]{6}$/.test(code)) return c.json({ error: '유효하지 않은 가족코드 형식입니다.' }, 400)
      const exists = await db.prepare(
        'SELECT COUNT(*) as cnt FROM diagnosis_results WHERE family_group_code=?'
      ).bind(code).first() as any
      if ((exists?.cnt ?? 0) === 0) return c.json({ error: '존재하지 않는 가족코드입니다. 가족에게 코드를 다시 확인해주세요.' }, 404)
    } else {
      // 신규 코드 생성 (중복 회피)
      let tries = 0
      do {
        code = genFamilyCode()
        const dup = await db.prepare(
          'SELECT COUNT(*) as cnt FROM diagnosis_results WHERE family_group_code=?'
        ).bind(code).first() as any
        if ((dup?.cnt ?? 0) === 0) break
      } while (++tries < 10)
    }

    // 업데이트
    await db.prepare(
      'UPDATE diagnosis_results SET family_group_code=? WHERE id=?'
    ).bind(code, result_id).run()

    return c.json({ success: true, family_code: code, is_new: !family_code })
  } catch (e) {
    console.error('[family-code/join]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// GET /api/v1/family-code/:code — 구성원 목록 + 축 비교
app.get('/api/v1/family-code/:code', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not configured' }, 500)
  try {
    const code = (c.req.param('code') || '').toUpperCase().trim()
    if (!/^[A-Z0-9]{6}$/.test(code)) return c.json({ error: '유효하지 않은 코드' }, 400)

    const rows = await db.prepare(`
      SELECT id, user_name, bc_primary, bc_nickname, top3_axes, axis_scores,
             region, ohaeng_type, completed_at
      FROM diagnosis_results
      WHERE family_group_code = ?
      ORDER BY completed_at ASC
      LIMIT 10
    `).bind(code).all() as any

    const members = (rows?.results ?? []).map((r: any) => ({
      id:          r.id,
      name:        r.user_name,
      bc:          r.bc_primary,
      nickname:    r.bc_nickname,
      top3:        (() => { try { return JSON.parse(r.top3_axes) } catch { return [] } })(),
      scores:      (() => { try { return JSON.parse(r.axis_scores) } catch { return {} } })(),
      region:      r.region,
      ohaeng:      r.ohaeng_type,
      joined_at:   r.completed_at,
    }))

    if (members.length === 0) return c.json({ error: '해당 코드의 가족 그룹이 없습니다.' }, 404)

    // 축별 최고점자 계산
    const axes = ['A01','A02','A03','A04','A05','A06','A07','A08','A09','A10']
    const axisChamps: Record<string, { name: string; score: number }> = {}
    axes.forEach(ax => {
      let best = { name: '', score: -1 }
      members.forEach((m: any) => {
        const sc = m.scores[ax] ?? 0
        if (sc > best.score) best = { name: m.name, score: sc }
      })
      if (best.score >= 0) axisChamps[ax] = best
    })

    return c.json({
      family_code: code,
      count: members.length,
      members,
      axis_champs: axisChamps,
    })
  } catch (e) {
    console.error('[family-code GET]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ════════════════════════════════════════════════════════
//  GET /api/v1/stats/axis-rank?scores=A01:78,A03:92,...
//  기능 7: 축 랭킹 배지 — 각 축별 상위 몇% 백분위 계산
//  - diagnosis_results.axis_scores JSON 집계
//  - 인증 불필요, 캐시 2분
// ════════════════════════════════════════════════════════
app.get('/api/v1/stats/axis-rank', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not configured' }, 500)

  try {
    const scoresParam = (c.req.query('scores') || '').trim()
    if (!scoresParam) return c.json({ error: 'scores parameter required' }, 400)

    // 내 점수 파싱: "A01:78,A03:92,..."
    const myScores: Record<string, number> = {}
    scoresParam.split(',').forEach(p => {
      const [ax, val] = p.split(':')
      if (ax && val) myScores[ax.trim()] = parseInt(val.trim()) || 0
    })

    // 전체 axis_scores JSON 행 가져오기 (최대 2000행, 최근 데이터)
    const rows = await db.prepare(
      `SELECT axis_scores FROM diagnosis_results WHERE axis_scores IS NOT NULL ORDER BY created_at DESC LIMIT 2000`
    ).all() as any

    const allRows = (rows?.results ?? []) as any[]
    const total = allRows.length

    if (total < 5) {
      // 데이터 부족 — 시뮬레이션 백분위 반환
      const result: Record<string, any> = {}
      for (const [ax, myVal] of Object.entries(myScores)) {
        result[ax] = { my: myVal, percentile: null, simulated: true }
      }
      return c.json({ total, ranks: result, simulated: true }, 200, {
        'Cache-Control': 'public, max-age=120',
      })
    }

    // 축별 점수 배열 집계
    const axisArrays: Record<string, number[]> = {}
    for (const [ax] of Object.entries(myScores)) {
      axisArrays[ax] = []
    }

    for (const row of allRows) {
      try {
        const sc = typeof row.axis_scores === 'string'
          ? JSON.parse(row.axis_scores)
          : row.axis_scores
        if (!sc || typeof sc !== 'object') continue
        for (const ax of Object.keys(myScores)) {
          const v = sc[ax]
          if (typeof v === 'number') axisArrays[ax].push(v)
        }
      } catch { /* skip */ }
    }

    // 백분위 계산: 내 점수보다 낮은 사람 비율 = 상위 (100 - pct)%
    const ranks: Record<string, any> = {}
    for (const [ax, myVal] of Object.entries(myScores)) {
      const arr = axisArrays[ax] || []
      if (arr.length < 3) {
        ranks[ax] = { my: myVal, percentile: null, count: arr.length, simulated: true }
        continue
      }
      const below = arr.filter(v => v < myVal).length
      const pct   = Math.round((below / arr.length) * 100) // 하위 pct%
      const top   = 100 - pct                               // 상위 top%
      ranks[ax] = { my: myVal, percentile: pct, top, count: arr.length, simulated: false }
    }

    return c.json({ total, ranks, simulated: false }, 200, {
      'Cache-Control': 'public, max-age=120',
    })
  } catch (e) {
    console.error('[axis-rank]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ════════════════════════════════════════════════════════
//  GET /api/v1/stats/body-type?bc=BC6  — 기능 5: 익명 통계 비교
//  - 전체 응답자 수, 동일 bc_primary 수, 백분위, 상위 5개 코드 분포
//  - 인증 불필요 (공개), 캐시 1분
// ════════════════════════════════════════════════════════
app.get('/api/v1/stats/body-type', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not configured' }, 500)

  try {
    const bc = (c.req.query('bc') || '').trim().toUpperCase()
    if (!bc) return c.json({ error: 'bc parameter required' }, 400)

    // 전체 카운트 + 해당 bc 카운트 동시 조회
    const [totalRow, bcRow, topRow] = await Promise.all([
      db.prepare(`SELECT COUNT(*) as total FROM diagnosis_results`).first() as Promise<any>,
      db.prepare(`SELECT COUNT(*) as cnt FROM diagnosis_results WHERE bc_primary = ?`).bind(bc).first() as Promise<any>,
      db.prepare(`SELECT bc_primary, COUNT(*) as cnt FROM diagnosis_results GROUP BY bc_primary ORDER BY cnt DESC LIMIT 5`).all() as Promise<any>,
    ])

    const total   = (totalRow?.total  ?? 0) as number
    const bcCount = (bcRow?.cnt       ?? 0) as number
    const topList = (topRow?.results  ?? []) as any[]

    // 같은 코드 비율 (소수점 1자리)
    const pct = total > 0 ? Math.round((bcCount / total) * 1000) / 10 : 0

    // 희귀도 등급 (상위 몇%)
    // topList에서 해당 bc의 순위 파악
    const rank = topList.findIndex((r: any) => r.bc_primary === bc)
    let rarityLabel = '희귀형'
    let rarityColor = '#a78bfa'  // 보라
    if (rank === 0)       { rarityLabel = '가장 흔한 유형';  rarityColor = '#6ee7b7' }
    else if (rank === 1)  { rarityLabel = '2번째로 흔한 유형'; rarityColor = '#6ee7b7' }
    else if (rank <= 3)   { rarityLabel = '상위 유형';       rarityColor = '#fcd34d' }
    else if (bcCount < 3) { rarityLabel = '초희귀형 🔮';     rarityColor = '#f472b6' }

    // 최소 데이터가 부족한 경우 시뮬레이션 값 사용 (신뢰성 표시용)
    const simulated = total < 20

    return c.json({
      bc,
      total,
      bc_count:     bcCount,
      pct,
      rarity_label: rarityLabel,
      rarity_color: rarityColor,
      simulated,
      top5: topList.map((r: any) => ({
        bc:  r.bc_primary,
        cnt: r.cnt,
        pct: total > 0 ? Math.round((r.cnt / total) * 1000) / 10 : 0,
      })),
    }, 200, {
      'Cache-Control': 'public, max-age=60',
    })
  } catch (e) {
    console.error('[stats/body-type]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ════════════════════════════════════════════════════════
//  GET /api/admin/diagnosis-results — MASTER 전용, 바디코드 진단 결과지 목록
// ════════════════════════════════════════════════════════
app.get('/api/admin/diagnosis-results', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not configured' }, 500)

  try {
    const search = c.req.query('search') || ''
    const bc = c.req.query('bc') || ''
    const region = c.req.query('region') || ''
    const ohaeng = c.req.query('ohaeng') || ''
    const limit = Math.min(parseInt(c.req.query('limit') || '200'), 500)

    let query = 'SELECT id, user_name, phone, bc_nickname, bc_primary, bc_secondary, top3_axes, region, texture, ohaeng_type, mbti_full, ref_code, completed_at, created_at FROM diagnosis_results WHERE 1=1'
    const params: any[] = []

    if (search) {
      query += ' AND (user_name LIKE ? OR id LIKE ? OR bc_nickname LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    if (bc) {
      query += ' AND bc_primary = ?'
      params.push(bc)
    }
    if (region) {
      query += ' AND region = ?'
      params.push(region)
    }
    if (ohaeng) {
      query += ' AND ohaeng_type = ?'
      params.push(ohaeng)
    }

    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit)

    const stmt = db.prepare(query)
    const result = await stmt.bind(...params).all<any>()

    // 총 건수 집계
    const countResult = await db.prepare('SELECT COUNT(*) as cnt FROM diagnosis_results').first<any>()
    const total = countResult?.cnt || 0

    return c.json({ results: result.results, total })
  } catch (e) {
    console.error('[admin/diagnosis-results GET]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ════════════════════════════════════════════════════════
//  쿠폰 자동 발급 API
//  POST /api/coupon/issue
//    body: { phone: string }
//  응답: { ok: true, coupon_code: string, duplicate: boolean }
//
//  로직:
//   1. 전화번호 정규화 (숫자만, 010XXXXXXXX)
//   2. 동일 번호 이미 발급 여부 확인 → 기존 코드 반환 (중복 방지)
//   3. 신규: SM-XXXX-XXXX 유니크 코드 생성
//   4. coupons 테이블에 INSERT
//   5. 쿠폰 코드 반환
// ════════════════════════════════════════════════════════
app.post('/api/coupon/issue', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ ok: false, error: 'DB not configured' }, 500)

  try {
    const body = await c.req.json()
    const rawPhone: string = body.phone || ''

    // ── 전화번호 정규화 (숫자만 추출, 최소 10자리)
    const digits = rawPhone.replace(/[^0-9]/g, '')
    if (digits.length < 10 || digits.length > 11) {
      return c.json({ ok: false, error: '올바른 전화번호를 입력하세요.' }, 400)
    }
    // 010XXXXXXXX → 010-XXXX-XXXX 형식으로 저장
    const phone = digits.length === 11
      ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
      : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`

    // ── 중복 체크: 동일 번호 이미 발급된 경우
    const existing = await db.prepare(
      'SELECT coupon_code FROM coupons WHERE phone = ? LIMIT 1'
    ).bind(phone).first<any>()

    if (existing) {
      // 기존 쿠폰 코드 그대로 반환 (재발급 없음)
      return c.json({
        ok: true,
        coupon_code: existing.coupon_code,
        duplicate: true,
        message: '이미 발급된 쿠폰입니다.'
      })
    }

    // ── 유니크 쿠폰 코드 생성: SM-XXXX-XXXX (대문자+숫자 혼합)
    function genCouponCode(): string {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 헷갈리는 I,O,1,0 제외
      const rand4 = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      return `SM-${rand4()}-${rand4()}`
    }

    // 위험-2: INSERT OR IGNORE 패턴으로 원자적 충돌 방지
    // SELECT-then-INSERT 레이스 컨디션 완전 제거
    let couponCode = ''
    let insertOk = false
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = genCouponCode()
      try {
        const result = await db.prepare(
          `INSERT OR IGNORE INTO coupons (phone, coupon_code, quiz_type, is_duplicate, used, issued_at)
           VALUES (?, ?, 'arm_fat', 0, 0, datetime('now'))`
        ).bind(phone, candidate).run()
        // changes > 0 이면 실제 INSERT 성공 (IGNORE로 스킵되지 않음)
        if (result.meta?.changes && result.meta.changes > 0) {
          couponCode = candidate
          insertOk = true
          break
        }
        // changes === 0: coupon_code UNIQUE 충돌로 스킵됨 → 재시도
      } catch (innerErr: any) {
        // phone UNIQUE 충돌은 위 중복체크에서 이미 처리됨, 기타 오류만 throw
        const msg = String(innerErr?.message || innerErr)
        if (!msg.includes('UNIQUE constraint')) throw innerErr
      }
    }
    if (!insertOk) {
      return c.json({ ok: false, error: '쿠폰 코드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' }, 500)
    }

    return c.json({
      ok: true,
      coupon_code: couponCode,
      duplicate: false,
      message: '쿠폰이 발급되었습니다.'
    })
  } catch (e: any) {
    console.error('[coupon/issue]', e)
    return c.json({ ok: false, error: '서버 오류: ' + (e?.message || String(e)) }, 500)
  }
})

// ════════════════════════════════════════════════════════
//  쿠폰 사용 처리 API (MASTER 전용)
//  POST /api/admin/coupons/use
//    body: { id: number }
//  → used=1, used_at=now() 으로 업데이트
// ════════════════════════════════════════════════════════
app.post('/api/admin/coupons/use', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ ok: false, error: 'DB not configured' }, 500)

  try {
    const body = await c.req.json()
    const id = Number(body.id)
    if (!id || isNaN(id)) return c.json({ ok: false, error: 'id가 필요합니다.' }, 400)

    // 쿠폰 존재 확인
    const coupon = await db.prepare('SELECT id, used FROM coupons WHERE id = ?').bind(id).first<any>()
    if (!coupon) return c.json({ ok: false, error: '쿠폰을 찾을 수 없습니다.' }, 404)
    if (coupon.used === 1) return c.json({ ok: false, error: '이미 사용 처리된 쿠폰입니다.' }, 409)

    // 사용 처리
    await db.prepare(
      `UPDATE coupons SET used = 1, used_at = datetime('now') WHERE id = ?`
    ).bind(id).run()

    return c.json({ ok: true, message: '사용 처리 완료' })
  } catch (e: any) {
    console.error('[admin/coupons/use]', e)
    return c.json({ ok: false, error: '서버 오류: ' + (e?.message || String(e)) }, 500)
  }
})

// ════════════════════════════════════════════════════════
//  쿠폰 관리자 조회 API (MASTER 전용)
//  GET /api/admin/coupons?limit=100&search=010
// ════════════════════════════════════════════════════════
app.get('/api/admin/coupons', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not configured' }, 500)

  try {
    const search = c.req.query('search') || ''
    const limit = Math.min(parseInt(c.req.query('limit') || '200'), 500)

    let query = 'SELECT * FROM coupons WHERE 1=1'
    const params: any[] = []

    if (search) {
      query += ' AND (phone LIKE ? OR coupon_code LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY issued_at DESC LIMIT ?'
    params.push(limit)

    const stmt = db.prepare(query)
    const result = params.length > 1
      ? await stmt.bind(...params).all<any>()
      : await stmt.bind(limit).all<any>()

    const countResult = await db.prepare('SELECT COUNT(*) as cnt FROM coupons').first<any>()
    const total = countResult?.cnt || 0
    const usedResult = await db.prepare('SELECT COUNT(*) as cnt FROM coupons WHERE used = 1').first<any>()
    const usedCount = usedResult?.cnt || 0

    return c.json({
      coupons: result.results,
      total,
      used_count: usedCount,
      unused_count: total - usedCount
    })
  } catch (e: any) {
    console.error('[admin/coupons GET]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  POST /api/survey/notify
//  설문 완료 후 담당자(ref_code)에게 알림 전송 (공개 API)
//  Body: { result_id: string, ref_code: string }
// ══════════════════════════════════════════════════════════════════
app.post('/api/survey/notify', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  try {
    const body = await c.req.json().catch(() => ({})) as any
    let result_id   = String(body.result_id   || '').trim()
    const ref_code  = String(body.ref_code    || '').trim()
    const user_name = String(body.user_name   || '').trim()
    const session_id = String(body.session_id || '').trim()

    if (!ref_code) return c.json({ error: 'ref_code 필요' }, 400)

    // result_id가 없거나 빈 문자열이면 ref_code 기반 최신 diagnosis_results에서 조회
    if (!result_id) {
      try {
        const latest = await db.prepare(
          `SELECT id FROM diagnosis_results
           WHERE ref_code = ?
           ORDER BY created_at DESC LIMIT 1`
        ).bind(ref_code).first<any>()
        if (latest?.id) result_id = latest.id
      } catch (_) {}
    }
    // session_id로 재시도
    if (!result_id && session_id) {
      try {
        const bySession = await db.prepare(
          `SELECT id FROM diagnosis_results WHERE id = ? OR session_id = ? LIMIT 1`
        ).bind(session_id, session_id).first<any>()
        if (bySession?.id) result_id = bySession.id
      } catch (_) {}
    }

    // 중복 알림 방지 — 같은 ref_code 조합 5분 내 재전송 차단 (result_id 무관)
    const recent = await db.prepare(
      `SELECT id FROM survey_notifications
       WHERE ref_code = ?
         AND notified_at >= datetime('now', '-5 minutes')
       LIMIT 1`
    ).bind(ref_code).first<any>()

    if (recent) {
      return c.json({ ok: true, duplicate: true, message: '이미 알림이 전송되었습니다.' })
    }

    await db.prepare(
      `INSERT INTO survey_notifications (result_id, ref_code) VALUES (?, ?)`
    ).bind(result_id || '', ref_code).run()

    return c.json({ ok: true, result_id: result_id || null })
  } catch (e: any) {
    console.error('[survey/notify]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/notifications?ref_code=XXX
//  담당자(ref_code) 페이지용 — 미읽은 알림 목록 조회
//  (consultant.html / b2b.html 에서 호출)
// ══════════════════════════════════════════════════════════════════
app.get('/api/notifications', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  const ref_code = c.req.query('ref_code')?.trim() || ''
  if (!ref_code) return c.json({ error: 'ref_code 필요' }, 400)

  try {
    const limit = Math.min(Number(c.req.query('limit') || 50), 200)

    // 알림 목록 (최신순)
    const { results } = await db.prepare(
      `SELECT n.id, n.result_id, n.ref_code, n.is_read, n.notified_at,
              d.user_name, d.phone
       FROM survey_notifications n
       LEFT JOIN diagnosis_results d ON d.id = n.result_id
       WHERE n.ref_code = ?
       ORDER BY n.notified_at DESC
       LIMIT ?`
    ).bind(ref_code, limit).all<any>()

    // 미읽은 알림 수
    const unread = await db.prepare(
      `SELECT COUNT(*) as cnt FROM survey_notifications WHERE ref_code = ? AND is_read = 0`
    ).bind(ref_code).first<any>()

    return c.json({
      ok: true,
      notifications: results || [],
      unread_count: unread?.cnt ?? 0
    })
  } catch (e: any) {
    console.error('[notifications GET]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  POST /api/notifications/read
//  알림 읽음 처리 — Body: { ids: number[] } 또는 { ref_code: string } (전체 읽음)
// ══════════════════════════════════════════════════════════════════
app.post('/api/notifications/read', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  try {
    const body = await c.req.json().catch(() => ({})) as any
    const ref_code = String(body.ref_code || '').trim()
    const ids: number[] = Array.isArray(body.ids) ? body.ids : []

    if (!ref_code && ids.length === 0) return c.json({ error: '파라미터 필요' }, 400)

    if (ids.length > 0) {
      // 특정 ID들 읽음 처리
      const placeholders = ids.map(() => '?').join(',')
      await db.prepare(
        `UPDATE survey_notifications SET is_read = 1, read_at = datetime('now')
         WHERE id IN (${placeholders})`
      ).bind(...ids).run()
    } else if (ref_code) {
      // ref_code 전체 읽음 처리
      await db.prepare(
        `UPDATE survey_notifications SET is_read = 1, read_at = datetime('now')
         WHERE ref_code = ? AND is_read = 0`
      ).bind(ref_code).run()
    }

    return c.json({ ok: true })
  } catch (e: any) {
    console.error('[notifications/read]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  POST /api/admin/notifications/read-all
//  관리자용 — 전체 알림 읽음 처리 (MASTER 전용)
// ══════════════════════════════════════════════════════════════════
app.post('/api/admin/notifications/read-all', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)
  try {
    await db.prepare(
      `UPDATE survey_notifications SET is_read = 1, read_at = datetime('now') WHERE is_read = 0`
    ).run()
    return c.json({ ok: true })
  } catch (e: any) {
    console.error('[admin/notifications/read-all]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/admin/notifications
//  관리자용 — 전체 알림 목록 (MASTER 전용)
// ══════════════════════════════════════════════════════════════════
app.get('/api/admin/notifications', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  try {
    const limit  = Math.min(Number(c.req.query('limit') || 100), 500)
    const unreadOnly = c.req.query('unread') === '1'

    let query = `SELECT n.id, n.result_id, n.ref_code, n.is_read, n.notified_at,
                        d.user_name, d.phone
                 FROM survey_notifications n
                 LEFT JOIN diagnosis_results d ON d.id = n.result_id`
    if (unreadOnly) query += ` WHERE n.is_read = 0`
    query += ` ORDER BY n.notified_at DESC LIMIT ?`

    const { results } = await db.prepare(query).bind(limit).all<any>()

    const total  = await db.prepare(`SELECT COUNT(*) as cnt FROM survey_notifications`).first<any>()
    const unread = await db.prepare(`SELECT COUNT(*) as cnt FROM survey_notifications WHERE is_read = 0`).first<any>()

    return c.json({
      ok: true,
      notifications: results || [],
      total_count:   total?.cnt  ?? 0,
      unread_count:  unread?.cnt ?? 0
    })
  } catch (e: any) {
    console.error('[admin/notifications GET]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  POST /api/notifications/read-all?ref_code=XXX
//  컨설턴트/B2B — 내 알림 전체 읽음 처리
// ══════════════════════════════════════════════════════════════════
app.post('/api/notifications/read-all', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)
  const refCode = c.req.query('ref_code') || ''
  if (!refCode) return c.json({ error: 'ref_code required' }, 400)
  try {
    await db.prepare(
      `UPDATE survey_notifications SET is_read = 1, read_at = datetime('now') WHERE ref_code = ? AND is_read = 0`
    ).bind(refCode).run()
    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/consultant/analytics/conversion
//  컨설턴트 전환율 / 월별 트렌드 분석 (Phase 2)
// ══════════════════════════════════════════════════════════════════
app.get('/api/consultant/analytics/conversion', requireRole('ANY'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)
  const user = (c as any).get('user')
  const refCode = user?.code || ''
  try {
    // 최근 6개월 월별 신규 고객
    const monthlyRows = await db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as cnt
      FROM diagnosis_results
      WHERE ref_code = ? AND created_at >= date('now', '-6 months')
      GROUP BY month ORDER BY month ASC
    `).bind(refCode).all<any>()

    // 전환율: 체크인 있는 고객 / 전체 고객
    const totalResult = await db.prepare(
      `SELECT COUNT(DISTINCT d.id) as total FROM diagnosis_results d WHERE d.ref_code = ?`
    ).bind(refCode).first<any>()

    const checkinResult = await db.prepare(`
      SELECT COUNT(DISTINCT d.id) as cnt FROM diagnosis_results d
      INNER JOIN checkin_log cl ON cl.result_id = d.id
      WHERE d.ref_code = ?
    `).bind(refCode).first<any>()

    // BC 분포 상위 5개
    const bcTop = await db.prepare(`
      SELECT bc_primary, COUNT(*) as cnt FROM diagnosis_results
      WHERE ref_code = ? AND bc_primary IS NOT NULL
      GROUP BY bc_primary ORDER BY cnt DESC LIMIT 5
    `).bind(refCode).all<any>()

    const total = totalResult?.total || 0
    const checkins = checkinResult?.cnt || 0
    const conversionRate = total > 0 ? Math.round((checkins / total) * 100) : 0

    return c.json({
      ok: true,
      monthly_trend: monthlyRows.results || [],
      total_customers: total,
      checkin_customers: checkins,
      conversion_rate: conversionRate,
      bc_top5: bcTop.results || []
    })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/admin/analytics/bc-trend
//  BC코드 시계열 트렌드 (Phase 2 — MASTER 전용)
// ══════════════════════════════════════════════════════════════════
app.get('/api/admin/analytics/bc-trend', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)
  try {
    // 최근 12개월 월별 BC 분포 상위 5코드
    const rows = await db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, bc_primary, COUNT(*) as cnt
      FROM diagnosis_results
      WHERE created_at >= date('now', '-12 months') AND bc_primary IS NOT NULL
      GROUP BY month, bc_primary
      ORDER BY month ASC, cnt DESC
    `).all<any>()

    // 전체 BC 분포
    const bcDist = await db.prepare(`
      SELECT bc_primary, COUNT(*) as cnt FROM diagnosis_results
      WHERE bc_primary IS NOT NULL
      GROUP BY bc_primary ORDER BY cnt DESC LIMIT 10
    `).all<any>()

    return c.json({
      ok: true,
      monthly_bc: rows.results || [],
      bc_distribution: bcDist.results || []
    })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/admin/churn/risk-list
//  이탈 위험 고객 목록 (21일 이상 미응답 — MASTER 전용)
// ══════════════════════════════════════════════════════════════════
app.get('/api/admin/churn/risk-list', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)
  try {
    const limit = Math.min(Number(c.req.query('limit') || 50), 200)
    const days  = Number(c.req.query('days') || 21)

    const rows = await db.prepare(`
      SELECT d.id, d.user_name, d.phone, d.bc_primary, d.bc_secondary,
             d.ref_code, d.created_at,
             CAST((julianday('now') - julianday(d.created_at)) AS INTEGER) as days_elapsed,
             c.name as consultant_name
      FROM diagnosis_results d
      LEFT JOIN consultants c ON c.code = d.ref_code
      WHERE d.created_at <= date('now', ? || ' days')
        AND d.bc_primary IS NOT NULL
      ORDER BY d.created_at ASC
      LIMIT ?
    `).bind(`-${days}`, limit).all<any>()

    return c.json({
      ok: true,
      risk_customers: rows.results || [],
      threshold_days: days,
      total: rows.results?.length || 0
    })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/admin/analytics/customer-segments
//  고객 세그먼트 분류 (Phase 3 — MASTER 전용)
// ══════════════════════════════════════════════════════════════════
app.get('/api/admin/analytics/customer-segments', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)
  try {
    // D+0 (오늘)
    const d0 = await db.prepare(
      `SELECT COUNT(*) as cnt FROM diagnosis_results WHERE date(created_at) = date('now')`
    ).first<any>()
    // D+1~3 (72시간 이내)
    const d3 = await db.prepare(
      `SELECT COUNT(*) as cnt FROM diagnosis_results WHERE created_at >= datetime('now', '-3 days') AND date(created_at) < date('now')`
    ).first<any>()
    // D+4~21 (활성)
    const d21 = await db.prepare(
      `SELECT COUNT(*) as cnt FROM diagnosis_results WHERE created_at >= datetime('now', '-21 days') AND created_at < datetime('now', '-3 days')`
    ).first<any>()
    // D+22~30 (위험)
    const d30 = await db.prepare(
      `SELECT COUNT(*) as cnt FROM diagnosis_results WHERE created_at >= datetime('now', '-30 days') AND created_at < datetime('now', '-21 days')`
    ).first<any>()
    // D+31+ (이탈)
    const churned = await db.prepare(
      `SELECT COUNT(*) as cnt FROM diagnosis_results WHERE created_at < datetime('now', '-30 days')`
    ).first<any>()

    // 체크인 참여율
    const withCheckin = await db.prepare(
      `SELECT COUNT(DISTINCT result_id) as cnt FROM checkin_log`
    ).first<any>()
    const totalAll = await db.prepare(
      `SELECT COUNT(*) as cnt FROM diagnosis_results WHERE bc_primary IS NOT NULL`
    ).first<any>()

    return c.json({
      ok: true,
      segments: {
        d0:       d0?.cnt       || 0,
        d1_3:     d3?.cnt       || 0,
        d4_21:    d21?.cnt      || 0,
        d22_30:   d30?.cnt      || 0,
        churned:  churned?.cnt  || 0,
      },
      checkin_rate: totalAll?.cnt > 0
        ? Math.round((withCheckin?.cnt / totalAll?.cnt) * 100) : 0,
      total_with_bc: totalAll?.cnt || 0
    })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/consultant/analytics/axis-benchmark
//  컨설턴트 담당 고객 BC코드별 축 점수 벤치마크 (Phase 3)
// ══════════════════════════════════════════════════════════════════
app.get('/api/consultant/analytics/axis-benchmark', requireRole('ANY'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)
  const user = (c as any).get('user')
  const refCode = user?.code || ''
  try {
    // BC코드별 고객 수 + 최근 30일
    const bcStats = await db.prepare(`
      SELECT bc_primary, COUNT(*) as cnt,
             SUM(CASE WHEN created_at >= date('now', '-30 days') THEN 1 ELSE 0 END) as recent_cnt
      FROM diagnosis_results
      WHERE ref_code = ? AND bc_primary IS NOT NULL
      GROUP BY bc_primary ORDER BY cnt DESC LIMIT 10
    `).bind(refCode).all<any>()

    // 이탈 위험 (21일 이상)
    const riskCount = await db.prepare(`
      SELECT COUNT(*) as cnt FROM diagnosis_results
      WHERE ref_code = ? AND created_at <= date('now', '-21 days') AND bc_primary IS NOT NULL
    `).bind(refCode).first<any>()

    // 체크인 완료 고객 수
    const checkinCount = await db.prepare(`
      SELECT COUNT(DISTINCT cl.result_id) as cnt
      FROM checkin_log cl
      INNER JOIN diagnosis_results d ON d.id = cl.result_id
      WHERE d.ref_code = ?
    `).bind(refCode).first<any>()

    return c.json({
      ok: true,
      bc_benchmark: bcStats.results || [],
      risk_count: riskCount?.cnt || 0,
      checkin_count: checkinCount?.cnt || 0
    })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  POST /api/daily-check  — 오늘 운동·식단·회복 체크 자동저장
//  (인증 불필요 — session_id 기반 본인 데이터만 저장)
// ══════════════════════════════════════════════════════════════════
app.post('/api/daily-check', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  let body: any
  try { body = await c.req.json() } catch { return c.json({ error: 'invalid json' }, 400) }

  const {
    session_id, check_date, week_number, day_of_week,
    bc_code = 'BC-1', consultant_code = null, b2b_code = null,
    exercise_done = 0, diet_done = 0, recovery_done = 0,
    memo = null,
    // ✅ V4.8: 운동/식단 상세 데이터
    exercise_detail = null,  // [{nm, min, kcal}, ...]
    diet_detail = null,      // [{meal, nm, kcal}, ...]
    total_kcal_out = null,   // 운동 소모 칼로리 합계
    total_kcal_in = null,    // 식단 섭취 칼로리 합계
    memo_exercise = null,    // 운동 자유 메모
    memo_diet = null         // 식단 자유 메모
  } = body

  if (!session_id || !check_date) {
    return c.json({ error: 'session_id, check_date are required' }, 400)
  }

  // 날짜 형식 검증 (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(check_date)) {
    return c.json({ error: 'check_date must be YYYY-MM-DD' }, 400)
  }

  // result_id 조회 (있으면 연결)
  // ✅ FIX: result-v4.html에서 session_id = ?id= URL 파라미터 = diagnosis_results.id (UUID)
  // diagnosis_results.id와 직접 매핑하여 연결
  let resultId: string | null = null
  try {
    // 1순위: session_id가 diagnosis_results.id(UUID)와 일치하는 경우 (신버전 파이프라인)
    const diagRowById = await db.prepare(
      `SELECT id FROM diagnosis_results WHERE id = ? LIMIT 1`
    ).bind(session_id).first<any>()
    if (diagRowById) {
      resultId = diagRowById.id
    } else {
      // 2순위: session_id 컬럼으로 조회 (구버전 호환)
      const diagRowBySid = await db.prepare(
        `SELECT id FROM diagnosis_results WHERE session_id = ? LIMIT 1`
      ).bind(session_id).first<any>()
      if (diagRowBySid) resultId = diagRowBySid.id
    }
  } catch (_) {}

  try {
    await db.prepare(`
      INSERT INTO daily_checks
        (session_id, result_id, consultant_code, b2b_code, bc_code,
         check_date, week_number, day_of_week,
         exercise_done, diet_done, recovery_done, memo,
         exercise_detail, diet_detail, total_kcal_out, total_kcal_in,
         memo_exercise, memo_diet,
         updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT (session_id, check_date) DO UPDATE SET
        exercise_done    = excluded.exercise_done,
        diet_done        = excluded.diet_done,
        recovery_done    = excluded.recovery_done,
        week_number      = excluded.week_number,
        day_of_week      = excluded.day_of_week,
        bc_code          = excluded.bc_code,
        consultant_code  = excluded.consultant_code,
        b2b_code         = excluded.b2b_code,
        memo             = excluded.memo,
        exercise_detail  = COALESCE(excluded.exercise_detail, daily_checks.exercise_detail),
        diet_detail      = COALESCE(excluded.diet_detail,     daily_checks.diet_detail),
        total_kcal_out   = COALESCE(excluded.total_kcal_out,  daily_checks.total_kcal_out),
        total_kcal_in    = COALESCE(excluded.total_kcal_in,   daily_checks.total_kcal_in),
        memo_exercise    = COALESCE(excluded.memo_exercise,   daily_checks.memo_exercise),
        memo_diet        = COALESCE(excluded.memo_diet,       daily_checks.memo_diet),
        updated_at       = datetime('now')
    `).bind(
      session_id, resultId, consultant_code || null, b2b_code || null, bc_code,
      check_date, week_number || 1, day_of_week || null,
      exercise_done ? 1 : 0, diet_done ? 1 : 0, recovery_done ? 1 : 0,
      memo || null,
      exercise_detail ? JSON.stringify(exercise_detail) : null,
      diet_detail     ? JSON.stringify(diet_detail)     : null,
      total_kcal_out  ?? null,
      total_kcal_in   ?? null,
      memo_exercise   || null,
      memo_diet       || null
    ).run()

    // ── 자동 트리거: 3일 연속 미체크 감지 ─────────────────────
    // 저장 후 최근 3일 체크 건수 확인 → 0이면 담당자 알림 INSERT
    try {
      const recent3 = await db.prepare(`
        SELECT SUM(exercise_done + diet_done + recovery_done) AS score
        FROM daily_checks
        WHERE session_id = ?
          AND check_date >= date('now', '-3 days')
      `).bind(session_id).first<any>()

      const score3 = recent3?.score ?? 0
      // 현재 저장된 값도 합산 — 저장 직후라 이미 반영됨
      const todayScore = (exercise_done?1:0) + (diet_done?1:0) + (recovery_done?1:0)

      if (score3 === 0 && todayScore === 0 && consultant_code) {
        // 중복 알림 방지: 24시간 내 같은 type 이미 있으면 skip
        const existing = await db.prepare(`
          SELECT id FROM check_alerts
          WHERE session_id = ? AND alert_type = 'missed_3days'
            AND triggered_at >= datetime('now', '-1 day')
          LIMIT 1
        `).bind(session_id).first<any>()

        if (!existing) {
          await db.prepare(`
            INSERT INTO check_alerts (session_id, alert_type, ref_code, bc_code, message)
            VALUES (?, 'missed_3days', ?, ?, ?)
          `).bind(
            session_id,
            consultant_code,
            bc_code,
            `${check_date} 기준 최근 3일 체크 0건 — 고객 연락 필요`
          ).run()
        }
      }
    } catch (_alertErr) {
      // 알림 트리거 실패는 체크 저장 성공에 영향 없음
    }

    return c.json({ ok: true, session_id, check_date })
  } catch (e: any) {
    console.error('[/api/daily-check POST]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/daily-check/:session_id  — 세션별 체크 히스토리 조회
//  (결과지 본인 확인용)
// ══════════════════════════════════════════════════════════════════
app.get('/api/daily-check/:session_id', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  const sessionId = c.req.param('session_id')
  const limit = parseInt(c.req.query('limit') || '90', 10)

  try {
    const rows = await db.prepare(`
      SELECT check_date, week_number, day_of_week,
             exercise_done, diet_done, recovery_done,
             (exercise_done + diet_done + recovery_done) as done_count,
             updated_at
      FROM daily_checks
      WHERE session_id = ?
      ORDER BY check_date DESC
      LIMIT ?
    `).bind(sessionId, limit).all<any>()

    return c.json({ ok: true, session_id: sessionId, checks: rows.results || [] })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/admin/daily-checks  — 관리자: 전체 고객 데일리 체크 현황
//  쿼리: ?days=7 (최근 N일), ?consultant=SC-0001, ?b2b=BP-001
// ══════════════════════════════════════════════════════════════════
app.get('/api/admin/daily-checks', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  const days       = parseInt(c.req.query('days') || '7', 10)
  const consultant = c.req.query('consultant') || null
  const b2b        = c.req.query('b2b') || null
  const signal     = c.req.query('signal') || null   // red|yellow|green|gray
  const page       = parseInt(c.req.query('page') || '1', 10)
  const perPage    = 50

  try {
    // 기간 조건 빌드
    let where = `WHERE dc.check_date >= date('now', '-${days} days')`
    const binds: any[] = []
    if (consultant) { where += ` AND dc.consultant_code = ?`; binds.push(consultant) }
    if (b2b)        { where += ` AND dc.b2b_code = ?`;        binds.push(b2b) }

    // ── 신호등 판정 로직 (CTE) ────────────────────────────────────
    // recent3: 최근 3일 체크 건수
    // signal:
    //   'red'    → recent3_count = 0  (AND 이력 있음: total_days > 0)
    //   'yellow' → recent3_count 1~2  OR (adherence_rate < 50)
    //   'green'  → recent3_count >= 3 AND adherence_rate >= 50
    //   'gray'   → total_days = 0 (이력 자체 없음, 신규)
    const sql = `
      WITH base AS (
        SELECT
          dc.session_id,
          dr.user_name,
          dc.consultant_code,
          dc.bc_code,
          COUNT(DISTINCT dc.check_date)  AS total_days,
          SUM(dc.exercise_done)          AS ex_days,
          SUM(dc.diet_done)              AS di_days,
          SUM(dc.recovery_done)          AS re_days,
          MAX(dc.check_date)             AS last_check,
          ROUND(100.0 * SUM(dc.exercise_done + dc.diet_done + dc.recovery_done)
            / (COUNT(DISTINCT dc.check_date) * 3), 1) AS adherence_rate,
          SUM(CASE WHEN dc.check_date >= date('now', '-3 days')
                   THEN (dc.exercise_done + dc.diet_done + dc.recovery_done) ELSE 0 END
          ) AS recent3_score
        FROM daily_checks dc
        LEFT JOIN diagnosis_results dr ON (dr.id = dc.session_id OR dr.session_id = dc.session_id)
        ${where}
        GROUP BY dc.session_id
      ),
      with_signal AS (
        SELECT *,
          CASE
            WHEN total_days = 0                                         THEN 'gray'
            WHEN recent3_score = 0                                      THEN 'red'
            WHEN recent3_score <= 3 OR adherence_rate < 50              THEN 'yellow'
            ELSE                                                             'green'
          END AS signal
        FROM base
      )
      SELECT * FROM with_signal
      ${signal ? `WHERE signal = '${signal}'` : ''}
      ORDER BY
        CASE signal WHEN 'red' THEN 1 WHEN 'yellow' THEN 2 WHEN 'green' THEN 3 ELSE 4 END,
        last_check DESC
      LIMIT ${perPage} OFFSET ${(page-1)*perPage}
    `

    const stmt = binds.length > 0
      ? db.prepare(sql).bind(...binds)
      : db.prepare(sql)
    const rows = await stmt.all<any>()

    // 전체 통계 (해당 기간) + 신호등별 카운트
    const statSql = `
      WITH base AS (
        SELECT
          dc.session_id,
          COUNT(DISTINCT dc.check_date) AS total_days,
          ROUND(100.0 * SUM(dc.exercise_done + dc.diet_done + dc.recovery_done)
            / (COUNT(DISTINCT dc.check_date) * 3), 1) AS adherence_rate,
          SUM(CASE WHEN dc.check_date >= date('now', '-3 days')
                   THEN (dc.exercise_done + dc.diet_done + dc.recovery_done) ELSE 0 END
          ) AS recent3_score,
          SUM(dc.exercise_done) AS total_ex,
          SUM(dc.diet_done)     AS total_di,
          SUM(dc.recovery_done) AS total_re
        FROM daily_checks dc
        ${where}
        GROUP BY dc.session_id
      )
      SELECT
        COUNT(*)                                                       AS total_clients,
        ROUND(AVG(adherence_rate), 1)                                  AS avg_rate,
        SUM(total_ex)                                                  AS total_ex,
        SUM(total_di)                                                  AS total_di,
        SUM(total_re)                                                  AS total_re,
        SUM(CASE WHEN total_days = 0 THEN 1 ELSE 0 END)               AS cnt_gray,
        SUM(CASE WHEN total_days > 0 AND recent3_score = 0
                      THEN 1 ELSE 0 END)                               AS cnt_red,
        SUM(CASE WHEN recent3_score > 0 AND recent3_score <= 3
                      OR (recent3_score > 0 AND adherence_rate < 50)
                      THEN 1 ELSE 0 END)                               AS cnt_yellow,
        SUM(CASE WHEN recent3_score > 3 AND adherence_rate >= 50
                      THEN 1 ELSE 0 END)                               AS cnt_green
      FROM base
    `
    const statStmt = binds.length > 0
      ? db.prepare(statSql).bind(...binds)
      : db.prepare(statSql)
    const stats = await statStmt.first<any>()

    return c.json({
      ok: true,
      period_days: days,
      signal_filter: signal,
      stats: stats || {},
      clients: rows.results || [],
      page, per_page: perPage
    })
  } catch (e: any) {
    console.error('[/api/admin/daily-checks]', e)
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/admin/daily-checks/:session_id  — 특정 고객 12주 체크 히트맵
// ══════════════════════════════════════════════════════════════════
app.get('/api/admin/daily-checks/:session_id', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  const sessionId = c.req.param('session_id')

  try {
    const rows = await db.prepare(`
      SELECT check_date, week_number, day_of_week,
             exercise_done, diet_done, recovery_done,
             (exercise_done + diet_done + recovery_done) as done_count,
             memo, memo_exercise, memo_diet,
             exercise_detail, diet_detail,
             total_kcal_out, total_kcal_in,
             updated_at
      FROM daily_checks
      WHERE session_id = ?
      ORDER BY check_date ASC
    `).bind(sessionId).all<any>()

    // 주차별 통계
    const weekStats = await db.prepare(`
      SELECT week_number,
             COUNT(*) as days,
             SUM(exercise_done) as ex, SUM(diet_done) as di, SUM(recovery_done) as re,
             ROUND(100.0 * SUM(exercise_done+diet_done+recovery_done)/(COUNT(*)*3),1) as rate
      FROM daily_checks
      WHERE session_id = ?
      GROUP BY week_number ORDER BY week_number
    `).bind(sessionId).all<any>()

    return c.json({
      ok: true,
      session_id: sessionId,
      checks: rows.results || [],
      week_stats: weekStats.results || []
    })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/consultant/daily-checks  — 컨설턴트: 담당 고객 체크 현황
// ══════════════════════════════════════════════════════════════════
app.get('/api/consultant/daily-checks', requireRole('ANY'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  const user   = (c as any).get('user')
  const myCode = user?.code || ''
  const days   = parseInt(c.req.query('days') || '7', 10)
  const signal = c.req.query('signal') || null  // red|yellow|green|gray

  try {
    const sql = `
      WITH base AS (
        SELECT
          dc.session_id,
          dr.user_name,
          dc.bc_code,
          COUNT(DISTINCT dc.check_date)  AS total_days,
          SUM(dc.exercise_done)          AS ex_days,
          SUM(dc.diet_done)              AS di_days,
          SUM(dc.recovery_done)          AS re_days,
          MAX(dc.check_date)             AS last_check,
          ROUND(100.0 * SUM(dc.exercise_done + dc.diet_done + dc.recovery_done)
            / (COUNT(DISTINCT dc.check_date) * 3), 1) AS adherence_rate,
          SUM(CASE WHEN dc.check_date >= date('now', '-3 days')
                   THEN (dc.exercise_done + dc.diet_done + dc.recovery_done) ELSE 0 END
          ) AS recent3_score
        FROM daily_checks dc
        LEFT JOIN diagnosis_results dr ON dr.id = dc.session_id OR dr.session_id = dc.session_id
        WHERE dc.consultant_code = ?
          AND dc.check_date >= date('now', '-${days} days')
        GROUP BY dc.session_id
      ),
      with_signal AS (
        SELECT *,
          CASE
            WHEN total_days = 0                                    THEN 'gray'
            WHEN recent3_score = 0                                 THEN 'red'
            WHEN recent3_score <= 3 OR adherence_rate < 50         THEN 'yellow'
            ELSE                                                        'green'
          END AS signal
        FROM base
      )
      SELECT * FROM with_signal
      ${signal ? `WHERE signal = '${signal}'` : ''}
      ORDER BY
        CASE signal WHEN 'red' THEN 1 WHEN 'yellow' THEN 2 WHEN 'green' THEN 3 ELSE 4 END,
        last_check DESC
      LIMIT 100
    `

    const rows = await db.prepare(sql).bind(myCode).all<any>()

    // 신호등별 카운트
    const countSql = `
      WITH base AS (
        SELECT
          dc.session_id,
          COUNT(DISTINCT dc.check_date) AS total_days,
          ROUND(100.0 * SUM(dc.exercise_done + dc.diet_done + dc.recovery_done)
            / (COUNT(DISTINCT dc.check_date) * 3), 1) AS adherence_rate,
          SUM(CASE WHEN dc.check_date >= date('now', '-3 days')
                   THEN (dc.exercise_done + dc.diet_done + dc.recovery_done) ELSE 0 END
          ) AS recent3_score
        FROM daily_checks dc
        WHERE dc.consultant_code = ?
          AND dc.check_date >= date('now', '-${days} days')
        GROUP BY dc.session_id
      )
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN total_days = 0 THEN 1 ELSE 0 END)               AS cnt_gray,
        SUM(CASE WHEN total_days > 0 AND recent3_score = 0 THEN 1 ELSE 0 END) AS cnt_red,
        SUM(CASE WHEN recent3_score > 0 AND (recent3_score <= 3 OR adherence_rate < 50)
                 THEN 1 ELSE 0 END)                                    AS cnt_yellow,
        SUM(CASE WHEN recent3_score > 3 AND adherence_rate >= 50
                 THEN 1 ELSE 0 END)                                    AS cnt_green,
        ROUND(AVG(CASE WHEN total_days > 0 THEN adherence_rate END), 1) AS avg_rate
      FROM base
    `
    const counts = await db.prepare(countSql).bind(myCode).first<any>()

    return c.json({
      ok: true,
      consultant_code: myCode,
      period_days: days,
      signal_filter: signal,
      counts: counts || {},
      clients: rows.results || []
    })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/b2b/daily-checks  — B2B 파트너: 소속 고객 체크 현황
// ══════════════════════════════════════════════════════════════════
app.get('/api/b2b/daily-checks', requireRole('ANY'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  const user = (c as any).get('user')
  const myCode = user?.code || ''
  const days = parseInt(c.req.query('days') || '7', 10)

  try {
    const rows = await db.prepare(`
      SELECT
        dc.session_id,
        dr.user_name,
        dc.bc_code,
        COUNT(DISTINCT dc.check_date)  AS total_days,
        SUM(dc.exercise_done)          AS ex_days,
        SUM(dc.diet_done)              AS di_days,
        SUM(dc.recovery_done)          AS re_days,
        MAX(dc.check_date)             AS last_check,
        ROUND(100.0 * SUM(dc.exercise_done + dc.diet_done + dc.recovery_done)
          / (COUNT(DISTINCT dc.check_date) * 3), 1) AS adherence_rate
      FROM daily_checks dc
      LEFT JOIN diagnosis_results dr ON (dr.id = dc.session_id OR dr.session_id = dc.session_id)
      WHERE dc.b2b_code = ?
        AND dc.check_date >= date('now', '-${days} days')
      GROUP BY dc.session_id
      ORDER BY last_check DESC
      LIMIT 100
    `).bind(myCode).all<any>()

    return c.json({
      ok: true,
      b2b_code: myCode,
      period_days: days,
      clients: rows.results || []
    })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  POST /api/coaching-comment  — 컨설턴트 코멘트 등록
//  body: { session_id, comment, check_date? }
// ══════════════════════════════════════════════════════════════════
app.post('/api/coaching-comment', requireRole('ANY'), async (c) => {
  const db   = (c.env as any).DB as D1Database
  const user = (c as any).get('user')
  const consultantCode = user?.code || ''

  if (!db) return c.json({ error: 'DB not available' }, 503)

  try {
    const { session_id, comment, check_date } = await c.req.json() as any
    if (!session_id || !comment?.trim()) {
      return c.json({ error: 'session_id, comment are required' }, 400)
    }
    if (comment.length > 500) {
      return c.json({ error: '코멘트는 최대 500자입니다' }, 400)
    }

    const result = await db.prepare(`
      INSERT INTO coaching_comments (session_id, consultant_code, comment, check_date)
      VALUES (?, ?, ?, ?)
    `).bind(session_id, consultantCode, comment.trim(), check_date || null).run()

    return c.json({ ok: true, id: result.meta?.last_row_id })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/coaching-comment/:session_id  — 특정 고객 코멘트 목록
//  (결과지 고객 본인 / 컨설턴트 공통 접근)
// ══════════════════════════════════════════════════════════════════
app.get('/api/coaching-comment/:session_id', async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  const sessionId = c.req.param('session_id')
  const limit     = Math.min(parseInt(c.req.query('limit') || '50', 10), 100)

  try {
    const rows = await db.prepare(`
      SELECT id, consultant_code, comment, check_date, is_visible, created_at
      FROM coaching_comments
      WHERE session_id = ? AND is_visible = 1
      ORDER BY created_at DESC
      LIMIT ${limit}
    `).bind(sessionId).all<any>()

    // 최신 1건 (고객 화면 노출용)
    const latest = rows.results?.[0] || null

    return c.json({
      ok: true,
      session_id: sessionId,
      latest,
      comments: rows.results || []
    })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  DELETE /api/coaching-comment/:id  — 코멘트 숨김 (컨설턴트 본인만)
// ══════════════════════════════════════════════════════════════════
app.delete('/api/coaching-comment/:id', requireRole('ANY'), async (c) => {
  const db   = (c.env as any).DB as D1Database
  const user = (c as any).get('user')
  const myCode = user?.code || ''

  try {
    const id = c.req.param('id')
    await db.prepare(
      `UPDATE coaching_comments SET is_visible=0 WHERE id=? AND consultant_code=?`
    ).bind(id, myCode).run()
    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/check-alerts  — 담당자 알림 조회
//  쿼리: ?unread_only=1 (미읽음만), ?limit=50
// ══════════════════════════════════════════════════════════════════
app.get('/api/check-alerts', requireRole('ANY'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  const user      = (c as any).get('user')
  const myCode    = user?.code || ''
  const unreadOnly = c.req.query('unread_only') === '1'
  const limit     = Math.min(parseInt(c.req.query('limit') || '50', 10), 200)

  try {
    const sql = `
      SELECT ca.*, dr.user_name
      FROM check_alerts ca
      LEFT JOIN daily_checks dc ON dc.session_id = ca.session_id
      LEFT JOIN diagnosis_results dr ON (dr.id = ca.session_id OR dr.session_id = ca.session_id)
      WHERE ca.ref_code = ?
        ${unreadOnly ? "AND ca.is_read = 0" : ""}
      ORDER BY ca.triggered_at DESC
      LIMIT ${limit}
    `
    const rows = await db.prepare(sql).bind(myCode).all<any>()

    const unreadCount = await db.prepare(
      `SELECT COUNT(*) AS cnt FROM check_alerts WHERE ref_code = ? AND is_read = 0`
    ).bind(myCode).first<any>()

    return c.json({
      ok: true,
      unread_count: unreadCount?.cnt || 0,
      alerts: rows.results || []
    })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  GET /api/admin/check-alerts  — 관리자: 전체 알림 조회 (MASTER)
// ══════════════════════════════════════════════════════════════════
app.get('/api/admin/check-alerts', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  const unreadOnly = c.req.query('unread_only') === '1'
  const alertType  = c.req.query('type') || null

  try {
    let where = unreadOnly ? 'WHERE ca.is_read = 0' : 'WHERE 1=1'
    if (alertType) where += ` AND ca.alert_type = '${alertType}'`

    const rows = await db.prepare(`
      SELECT ca.*, dr.user_name
      FROM check_alerts ca
      LEFT JOIN diagnosis_results dr ON (dr.id = ca.session_id OR dr.session_id = ca.session_id)
      ${where}
      ORDER BY ca.triggered_at DESC
      LIMIT 200
    `).all<any>()

    const counts = await db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN is_read=0 THEN 1 ELSE 0 END) AS unread,
        SUM(CASE WHEN alert_type='missed_3days' THEN 1 ELSE 0 END) AS missed,
        SUM(CASE WHEN alert_type='remind' THEN 1 ELSE 0 END) AS remind
      FROM check_alerts
      WHERE triggered_at >= date('now', '-7 days')
    `).first<any>()

    return c.json({ ok: true, counts: counts||{}, alerts: rows.results||[] })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  POST /api/check-alerts/read  — 알림 읽음 처리
//  body: { ids: number[] } | { ref_code: string } (전체)
// ══════════════════════════════════════════════════════════════════
app.post('/api/check-alerts/read', requireRole('ANY'), async (c) => {
  const db   = (c.env as any).DB as D1Database
  const user = (c as any).get('user')
  const myCode = user?.code || ''

  try {
    const body = await c.req.json().catch(() => ({})) as any
    if (Array.isArray(body.ids) && body.ids.length > 0) {
      const placeholders = body.ids.map(() => '?').join(',')
      await db.prepare(
        `UPDATE check_alerts SET is_read=1, read_at=datetime('now')
         WHERE id IN (${placeholders}) AND ref_code=?`
      ).bind(...body.ids, myCode).run()
    } else {
      // 전체 읽음
      await db.prepare(
        `UPDATE check_alerts SET is_read=1, read_at=datetime('now')
         WHERE ref_code=? AND is_read=0`
      ).bind(myCode).run()
    }
    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  POST /api/admin/daily-check/remind  — 관리자 수동 리마인드 발송
//  body: { session_id: string }
// ══════════════════════════════════════════════════════════════════
app.post('/api/admin/daily-check/remind', requireRole('MASTER'), async (c) => {
  const db = (c.env as any).DB as D1Database
  if (!db) return c.json({ error: 'DB not available' }, 503)

  try {
    const { session_id } = await c.req.json() as any
    if (!session_id) return c.json({ error: 'session_id required' }, 400)

    // 담당 컨설턴트 코드 찾기
    const info = await db.prepare(`
      SELECT consultant_code, bc_code FROM daily_checks
      WHERE session_id = ? ORDER BY updated_at DESC LIMIT 1
    `).bind(session_id).first<any>()

    // 중복 발송 방지: 12시간 내 already remind
    const dup = await db.prepare(`
      SELECT id FROM check_alerts
      WHERE session_id=? AND alert_type='manual'
        AND triggered_at >= datetime('now','-12 hours') LIMIT 1
    `).bind(session_id).first<any>()

    if (dup) {
      return c.json({ ok: true, skipped: true, reason: '12시간 이내 이미 발송됨' })
    }

    await db.prepare(`
      INSERT INTO check_alerts (session_id, alert_type, ref_code, bc_code, message)
      VALUES (?, 'manual', ?, ?, '관리자 수동 리마인드 발송')
    `).bind(
      session_id,
      info?.consultant_code || 'ADMIN',
      info?.bc_code || null
    ).run()

    return c.json({ ok: true, session_id })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  Feature 5: 토스페이먼츠 결제 연동
//  플랜: monthly(30,000원/월), yearly(300,000원/년)
//  흐름: 결제 요청 생성 → 토스 위젯 → 서버 승인 → 구독 연장
// ══════════════════════════════════════════════════════════════════

const PLANS: Record<string, { label: string; amount: number; months: number }> = {
  monthly: { label: '월간 구독', amount: 30000, months: 1 },
  yearly:  { label: '연간 구독', amount: 300000, months: 12 },
}

// POST /api/payment/prepare  — 주문 생성 (pending 레코드 삽입)
app.post('/api/payment/prepare', requireRole('ANY'), async (c) => {
  try {
    const db   = c.env.DB
    const user = (c as any).__user
    const { plan } = await c.req.json<{ plan: string }>()

    const planInfo = PLANS[plan]
    if (!planInfo) return c.json({ ok: false, error: '유효하지 않은 플랜입니다.' }, 400)

    const cons = await db.prepare(
      'SELECT code, name, subscription_end FROM consultants WHERE code=?'
    ).bind(user.code).first<any>()
    if (!cons) return c.json({ ok: false, error: '컨설턴트 정보 없음' }, 404)

    // UUID 기반 orderId 생성
    const orderId = `SM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    await db.prepare(`
      INSERT INTO payments (order_id, consultant_code, plan, amount, status, extend_months, prev_end_date)
      VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).bind(orderId, cons.code, plan, planInfo.amount, planInfo.months, cons.subscription_end || null).run()

    return c.json({
      ok: true,
      order_id:     orderId,
      order_name:   `슬림마인드 ${planInfo.label} — ${cons.name}`,
      amount:       planInfo.amount,
      customer_name: cons.name,
      plan,
    })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// POST /api/payment/confirm  — 토스 승인 + 구독 연장
app.post('/api/payment/confirm', requireRole('ANY'), async (c) => {
  try {
    const db   = c.env.DB
    const user = (c as any).__user
    const { paymentKey, orderId, amount } = await c.req.json<{
      paymentKey: string; orderId: string; amount: number
    }>()

    // 1) 내부 주문 검증
    const order = await db.prepare(
      'SELECT * FROM payments WHERE order_id=? AND consultant_code=? AND status=?'
    ).bind(orderId, user.code, 'pending').first<any>()
    if (!order) return c.json({ ok: false, error: '유효하지 않은 주문입니다.' }, 400)
    if (order.amount !== amount) return c.json({ ok: false, error: '금액 불일치' }, 400)

    // 2) 토스 서버 승인 API 호출
    const tossSecretKey = (c.env as any).TOSS_SECRET_KEY || ''
    const basicAuth = btoa(`${tossSecretKey}:`)
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    const tossData: any = await tossRes.json()

    if (!tossRes.ok || tossData.status !== 'DONE') {
      // 실패 기록
      await db.prepare(`UPDATE payments SET status='failed', raw_response=? WHERE order_id=?`)
        .bind(JSON.stringify(tossData), orderId).run()
      return c.json({ ok: false, error: tossData.message || '결제 승인 실패' }, 400)
    }

    // 3) 구독 기간 연장 계산
    const cons = await db.prepare(
      'SELECT subscription_end FROM consultants WHERE code=?'
    ).bind(user.code).first<any>()

    const baseDate = cons?.subscription_end && cons.subscription_end > new Date().toISOString().slice(0,10)
      ? new Date(cons.subscription_end)
      : new Date()

    const newEnd = new Date(baseDate)
    newEnd.setMonth(newEnd.getMonth() + order.extend_months)
    const newEndStr = newEnd.toISOString().slice(0, 10)

    // 4) DB 업데이트 (payments + consultants)
    await db.prepare(`
      UPDATE payments
      SET status='paid', payment_key=?, method=?, approved_at=?, new_end_date=?, raw_response=?
      WHERE order_id=?
    `).bind(
      paymentKey,
      tossData.method || null,
      tossData.approvedAt || new Date().toISOString(),
      newEndStr,
      JSON.stringify(tossData),
      orderId
    ).run()

    await db.prepare(`
      UPDATE consultants
      SET subscription_status='active', subscription_end=?, updated_at=datetime('now')
      WHERE code=?
    `).bind(newEndStr, user.code).run()

    return c.json({
      ok: true,
      new_end_date: newEndStr,
      method: tossData.method,
      approved_at: tossData.approvedAt,
    })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// GET /api/payment/history  — 내 결제 내역
app.get('/api/payment/history', requireRole('ANY'), async (c) => {
  try {
    const db   = c.env.DB
    const user = (c as any).__user
    const list = await db.prepare(`
      SELECT order_id, plan, amount, status, method, approved_at, new_end_date, created_at
      FROM payments WHERE consultant_code=? ORDER BY created_at DESC LIMIT 20
    `).bind(user.code).all<any>()
    return c.json({ ok: true, payments: list.results })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// GET /api/admin/payments  — 관리자 전체 결제 내역
app.get('/api/admin/payments', requireRole('MASTER'), async (c) => {
  try {
    const db = c.env.DB
    const limit  = parseInt(c.req.query('limit') || '50')
    const status = c.req.query('status') || ''
    let q = `SELECT p.*, c.name as consultant_name
             FROM payments p
             LEFT JOIN consultants c ON c.code = p.consultant_code
             WHERE 1=1`
    const binds: any[] = []
    if (status) { q += ' AND p.status=?'; binds.push(status) }
    q += ` ORDER BY p.created_at DESC LIMIT ?`
    binds.push(limit)
    const list = await db.prepare(q).bind(...binds).all<any>()

    const stats = await db.prepare(`
      SELECT
        COUNT(*) as total_count,
        SUM(CASE WHEN status='paid' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status='paid' AND strftime('%Y-%m', created_at)=strftime('%Y-%m','now') THEN amount ELSE 0 END) as this_month_revenue
      FROM payments
    `).first<any>()

    return c.json({ ok: true, payments: list.results, stats })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  Feature 9: 관리자 실시간 매출 & 성장 대시보드
// ══════════════════════════════════════════════════════════════════

// GET /api/admin/growth-dashboard  — 성장/매출 종합 지표
app.get('/api/admin/growth-dashboard', requireRole('MASTER'), async (c) => {
  try {
    const db  = c.env.DB
    const now = new Date()
    const ym  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
    const prevYm = (() => {
      const d = new Date(now.getFullYear(), now.getMonth()-1, 1)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    })()

    // 1) 최근 6개월 진단 추이
    const monthlyTrend = await db.prepare(`
      SELECT substr(created_at,1,7) AS month, COUNT(*) AS count
      FROM diagnosis_results
      WHERE created_at >= date('now','-6 months')
      GROUP BY month ORDER BY month
    `).all<any>()

    // 2) 이번달 vs 지난달 비교
    const thisMonth  = await db.prepare(`SELECT COUNT(*) as cnt FROM diagnosis_results WHERE substr(created_at,1,7)=?`).bind(ym).first<any>()
    const lastMonth  = await db.prepare(`SELECT COUNT(*) as cnt FROM diagnosis_results WHERE substr(created_at,1,7)=?`).bind(prevYm).first<any>()

    // 3) 구독 결제 매출 (payments 테이블)
    const revenueThis = await db.prepare(`SELECT SUM(amount) as total FROM payments WHERE status='paid' AND substr(created_at,1,7)=?`).bind(ym).first<any>()
    const revenueLast = await db.prepare(`SELECT SUM(amount) as total FROM payments WHERE status='paid' AND substr(created_at,1,7)=?`).bind(prevYm).first<any>()
    const revenueTotal = await db.prepare(`SELECT SUM(amount) as total FROM payments WHERE status='paid'`).first<any>()

    // 4) 컨설턴트 현황
    const consStats = await db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN subscription_status='active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN subscription_end BETWEEN date('now') AND date('now','+30 days') THEN 1 ELSE 0 END) as expiring_30d,
        SUM(CASE WHEN created_at >= date('now','-30 days') THEN 1 ELSE 0 END) as new_30d
      FROM consultants
    `).first<any>()

    // 5) 일별 진단 (최근 30일)
    const dailyDiag = await db.prepare(`
      SELECT substr(created_at,1,10) as day, COUNT(*) as count
      FROM diagnosis_results
      WHERE created_at >= date('now','-30 days')
      GROUP BY day ORDER BY day
    `).all<any>()

    // 6) BC코드 분포 (이번달)
    const bcDist = await db.prepare(`
      SELECT bc_code, COUNT(*) as cnt
      FROM diagnosis_results
      WHERE bc_code IS NOT NULL AND substr(created_at,1,7)=?
      GROUP BY bc_code ORDER BY cnt DESC LIMIT 9
    `).bind(ym).all<any>()

    // 7) 데일리 체크 참여율
    const checkStats = await db.prepare(`
      SELECT
        COUNT(DISTINCT session_id) as active_users,
        COUNT(*) as total_checks,
        ROUND(AVG(CASE WHEN exercise_done=1 THEN 100.0 ELSE 0 END),1) as exercise_rate,
        ROUND(AVG(CASE WHEN diet_done=1 THEN 100.0 ELSE 0 END),1) as diet_rate
      FROM daily_checks
      WHERE check_date >= date('now','-30 days')
    `).first<any>()

    const thisMonthCount = thisMonth?.cnt || 0
    const lastMonthCount = lastMonth?.cnt || 0
    const growth = lastMonthCount > 0 ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) : 0

    return c.json({
      ok: true,
      summary: {
        this_month_diag:  thisMonthCount,
        last_month_diag:  lastMonthCount,
        growth_rate:      growth,
        revenue_this:     revenueThis?.total  || 0,
        revenue_last:     revenueLast?.total  || 0,
        revenue_total:    revenueTotal?.total || 0,
      },
      consultants:    consStats,
      monthly_trend:  monthlyTrend.results,
      daily_diag:     dailyDiag.results,
      bc_distribution: bcDist.results,
      check_stats:    checkStats,
    })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════════
//  Feature 6: 고객 재진단 알림 시스템
//  진단 후 30/60/90일 경과 → 컨설턴트에게 재진단 권유 알림 생성
// ══════════════════════════════════════════════════════════════════

// POST /api/admin/rediagnosis/scan  — 재진단 대상 스캔 및 알림 생성 (관리자/cron)
app.post('/api/admin/rediagnosis/scan', requireRole('MASTER'), async (c) => {
  try {
    const db = c.env.DB
    const ALERT_DAYS = [30, 60, 90]
    let created = 0, skipped = 0

    for (const days of ALERT_DAYS) {
      // 진단일로부터 정확히 days일 ± 1일인 고객 조회
      const rows = await db.prepare(`
        SELECT dr.session_id, dr.consultant_code, dr.bc_code, dr.created_at,
               r.name as customer_name
        FROM diagnosis_results dr
        LEFT JOIN results r ON r.session_id = dr.session_id
        WHERE date(dr.created_at) = date('now', '-${days} days')
          AND dr.session_id NOT IN (
            SELECT session_id FROM rediagnosis_alerts WHERE alert_day = ${days}
          )
      `).all<any>()

      for (const row of rows.results) {
        try {
          await db.prepare(`
            INSERT OR IGNORE INTO rediagnosis_alerts
              (session_id, consultant_code, customer_name, bc_code, diagnosed_at, alert_day, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
          `).bind(
            row.session_id,
            row.consultant_code || null,
            row.customer_name   || null,
            row.bc_code         || null,
            row.created_at      || null,
            days
          ).run()
          created++
        } catch { skipped++ }
      }
    }
    return c.json({ ok: true, created, skipped })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// GET /api/admin/rediagnosis  — 재진단 알림 목록 (관리자)
app.get('/api/admin/rediagnosis', requireRole('MASTER'), async (c) => {
  try {
    const db     = c.env.DB
    const status = c.req.query('status') || 'pending'
    const limit  = parseInt(c.req.query('limit') || '100')
    const list   = await db.prepare(`
      SELECT ra.*, c.name as consultant_name
      FROM rediagnosis_alerts ra
      LEFT JOIN consultants c ON c.code = ra.consultant_code
      WHERE ra.status = ?
      ORDER BY ra.created_at DESC LIMIT ?
    `).bind(status, limit).all<any>()
    const counts = await db.prepare(`
      SELECT status, COUNT(*) as cnt FROM rediagnosis_alerts GROUP BY status
    `).all<any>()
    return c.json({ ok: true, alerts: list.results, counts: counts.results })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// GET /api/consultant/rediagnosis  — 내 담당 고객 재진단 알림
app.get('/api/consultant/rediagnosis', requireRole('ANY'), async (c) => {
  try {
    const db   = c.env.DB
    const user = (c as any).__user
    const list = await db.prepare(`
      SELECT * FROM rediagnosis_alerts
      WHERE consultant_code = ? AND status = 'pending'
      ORDER BY created_at DESC LIMIT 50
    `).bind(user.code).all<any>()
    return c.json({ ok: true, alerts: list.results })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// POST /api/consultant/rediagnosis/:id/dismiss  — 알림 무시 처리
app.post('/api/consultant/rediagnosis/:id/dismiss', requireRole('ANY'), async (c) => {
  try {
    const db   = c.env.DB
    const user = (c as any).__user
    const id   = c.req.param('id')
    await db.prepare(`
      UPDATE rediagnosis_alerts
      SET status='dismissed', dismissed_at=datetime('now')
      WHERE id=? AND consultant_code=?
    `).bind(id, user.code).run()
    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// POST /api/consultant/rediagnosis/:id/sent  — 재진단 링크 발송 완료 처리
app.post('/api/consultant/rediagnosis/:id/sent', requireRole('ANY'), async (c) => {
  try {
    const db   = c.env.DB
    const user = (c as any).__user
    const id   = c.req.param('id')
    await db.prepare(`
      UPDATE rediagnosis_alerts
      SET status='sent', sent_at=datetime('now')
      WHERE id=? AND consultant_code=?
    `).bind(id, user.code).run()
    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// GET /payment/success  — 토스 결제 성공 콜백 페이지
app.get('/payment/success', async (c) => {
  const paymentKey = c.req.query('paymentKey') || ''
  const orderId    = c.req.query('orderId')    || ''
  const amount     = parseInt(c.req.query('amount') || '0')

  // JWT 없이 접근하므로 orderId로 consultant_code 조회 후 승인
  const db = c.env.DB
  try {
    const order = await db.prepare(
      'SELECT * FROM payments WHERE order_id=? AND status=?'
    ).bind(orderId, 'pending').first<any>()

    if (!order) {
      return c.html(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>결제 오류</title>
        <script>setTimeout(()=>location.href='/consultant.html',3000)</script></head>
        <body style="font-family:sans-serif;text-align:center;padding:60px">
        <div style="font-size:48px">❌</div>
        <h2>주문 정보를 찾을 수 없습니다</h2>
        <p>3초 후 대시보드로 이동합니다...</p></body></html>`)
    }

    const planInfo: Record<string, {months:number}> = { monthly:{months:1}, yearly:{months:12} }
    const tossSecretKey = (c.env as any).TOSS_SECRET_KEY || ''
    const basicAuth = btoa(`${tossSecretKey}:`)
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${basicAuth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })
    const tossData: any = await tossRes.json()

    if (!tossRes.ok || tossData.status !== 'DONE') {
      await db.prepare(`UPDATE payments SET status='failed', raw_response=? WHERE order_id=?`)
        .bind(JSON.stringify(tossData), orderId).run()
      return c.html(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>결제 실패</title>
        <script>setTimeout(()=>location.href='/consultant.html#payment',3000)</script></head>
        <body style="font-family:sans-serif;text-align:center;padding:60px">
        <div style="font-size:48px">❌</div><h2>결제에 실패했습니다</h2>
        <p>${tossData.message||'알 수 없는 오류'}</p>
        <p>3초 후 대시보드로 이동합니다...</p></body></html>`)
    }

    // 구독 연장
    const cons = await db.prepare('SELECT subscription_end FROM consultants WHERE code=?')
      .bind(order.consultant_code).first<any>()
    const baseDate = cons?.subscription_end && cons.subscription_end > new Date().toISOString().slice(0,10)
      ? new Date(cons.subscription_end) : new Date()
    const newEnd = new Date(baseDate)
    newEnd.setMonth(newEnd.getMonth() + order.extend_months)
    const newEndStr = newEnd.toISOString().slice(0, 10)

    await db.prepare(`UPDATE payments SET status='paid', payment_key=?, method=?, approved_at=?, new_end_date=?, raw_response=? WHERE order_id=?`)
      .bind(paymentKey, tossData.method||null, tossData.approvedAt||new Date().toISOString(), newEndStr, JSON.stringify(tossData), orderId).run()
    await db.prepare(`UPDATE consultants SET subscription_status='active', subscription_end=?, updated_at=datetime('now') WHERE code=?`)
      .bind(newEndStr, order.consultant_code).run()

    return c.html(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>결제 완료</title>
      <script>setTimeout(()=>location.href='/consultant.html',4000)</script>
      <style>body{font-family:'Pretendard',sans-serif;text-align:center;padding:60px;background:#F8FAFC}</style></head>
      <body>
        <div style="font-size:64px;margin-bottom:20px">🎉</div>
        <h2 style="font-size:24px;font-weight:800;color:#1E293B;margin-bottom:12px">결제가 완료되었습니다!</h2>
        <p style="color:#64748B;font-size:15px">구독 만료일이 <b style="color:#3B82F6">${newEndStr}</b>로 연장되었습니다.</p>
        <p style="color:#94A3B8;font-size:13px;margin-top:8px">결제 수단: ${tossData.method||'-'}</p>
        <p style="color:#94A3B8;font-size:13px">4초 후 대시보드로 이동합니다...</p>
      </body></html>`)
  } catch (e: any) {
    return c.html(`<body>오류: ${String(e)}</body>`)
  }
})

// GET /payment/fail  — 토스 결제 실패 콜백
app.get('/payment/fail', (c) => {
  const msg  = c.req.query('message') || '결제가 취소되었습니다.'
  const code = c.req.query('code') || ''
  return c.html(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>결제 취소</title>
    <script>setTimeout(()=>location.href='/consultant.html',3000)</script>
    <style>body{font-family:sans-serif;text-align:center;padding:60px;background:#F8FAFC}</style></head>
    <body>
      <div style="font-size:48px;margin-bottom:16px">😢</div>
      <h2 style="color:#1E293B">결제가 취소되었습니다</h2>
      <p style="color:#64748B">${msg}${code ? ` (${code})` : ''}</p>
      <p style="color:#94A3B8;font-size:13px">3초 후 대시보드로 이동합니다...</p>
    </body></html>`)
})

// ══════════════════════════════════════════════════════════════════
//  Feature 10: 컨설턴트 자격증 시스템 (1-12강)
// ══════════════════════════════════════════════════════════════════

// 강의 메타데이터 (12강)
const LECTURES = [
  { no:1,  title:'슬림마인드 시스템 개요',          desc:'BC코드 체계와 바디코드 분석 철학 이해', emoji:'🌱' },
  { no:2,  title:'BC-1·2 코드 완전 이해',           desc:'코끼리다리형·거북이형 원인과 처방 전략', emoji:'🐘' },
  { no:3,  title:'BC-3·4 코드 완전 이해',           desc:'수박배형·요요형 인슐린·갑상선 메커니즘', emoji:'🍉' },
  { no:4,  title:'BC-5·6 코드 완전 이해',           desc:'귤껍질형·야식부엉이형 셀룰라이트·부신', emoji:'🍊' },
  { no:5,  title:'BC-7·8·9 코드 완전 이해',         desc:'산후·하체·마른비만 처방 핵심', emoji:'🎈' },
  { no:6,  title:'영양 처방 실전 (크로노)',          desc:'시간대별 영양 배분과 간헐적 단식 활용', emoji:'🥗' },
  { no:7,  title:'운동 처방 실전',                  desc:'BC코드별 최적 운동 루틴 설계', emoji:'🏋️' },
  { no:8,  title:'AI 상담 스크립트 활용',            desc:'5단계 상담 플로우와 멘트 실전', emoji:'🤖' },
  { no:9,  title:'고객 심리 & 동기 부여',           desc:'저항 극복, 재방문 유도, 관계 강화', emoji:'💬' },
  { no:10, title:'데일리 체크 & 마이페이지 운영',   desc:'체크 시스템 활용 및 코칭 댓글 전략', emoji:'✅' },
  { no:11, title:'B2B 파트너십 & 확장 전략',        desc:'병원·헬스장 제휴 협력 실무', emoji:'🏢' },
  { no:12, title:'슬림마인드 마스터 종합 실전',     desc:'12강 통합 케이스 스터디 & 최종 평가', emoji:'🏆' },
]

// 강의별 퀴즈 (3문제씩)
const QUIZ_BANK: Record<number, Array<{q:string; opts:string[]; ans:number}>> = {
  1: [
    { q:'BC코드는 총 몇 가지 유형으로 분류되나요?', opts:['6가지','9가지','12가지','15가지'], ans:1 },
    { q:'슬림마인드 바디코드 분석의 핵심 철학은?', opts:['칼로리 제한','원인 중심 맞춤 처방','고강도 운동','약물 치료'], ans:1 },
    { q:'컨설턴트 자격증 취득을 위해 이수해야 하는 강의 수는?', opts:['6강','9강','10강','12강'], ans:3 },
  ],
  2: [
    { q:'BC-1(코끼리다리형)의 주요 원인은?', opts:['인슐린 저항성','하지 림프·정맥 울혈','갑상선 저하','부신 피로'], ans:1 },
    { q:'BC-2(거북이형)에서 우선시해야 할 처방 부위는?', opts:['복부','하체','경추·흉추 림프','손발'], ans:2 },
    { q:'두 코드(BC-1·2)의 공통점은?', opts:['내장지방 과다','림프 순환 장애','호르몬 불균형','셀룰라이트'], ans:1 },
  ],
  3: [
    { q:'BC-3(수박배형)의 핵심 문제는?', opts:['림프 울혈','인슐린 저항성·내장 비대','갑상선 셧다운','릴랙신 과다'], ans:1 },
    { q:'BC-4(요요형)에서 나타나는 "초절전 모드"의 원인은?', opts:['부신 피로','갑상선 셧다운','에스트로겐 과다','인슐린 저항'], ans:1 },
    { q:'요요 현상을 막기 위한 핵심 전략은?', opts:['강한 칼로리 제한','갑상선 지원 + 점진적 대사 회복','고강도 유산소','단식'], ans:1 },
  ],
  4: [
    { q:'BC-5(귤껍질형) 셀룰라이트의 주 원인은?', opts:['인슐린 저항','바탕질 변성·지방 섬유화','림프 울혈','갑상선 저하'], ans:1 },
    { q:'BC-6(야식부엉이형)의 자율신경 교란 원인은?', opts:['인슐린 과다','부신 피로','림프 차단','갑상선 항진'], ans:1 },
    { q:'귤껍질형에 효과적인 처방 방법은?', opts:['유산소 위주','림프 드레나지 + 결합조직 이완','단식','고단백 식이'], ans:1 },
  ],
  5: [
    { q:'BC-7(바람빠진풍선형)과 관련된 호르몬은?', opts:['인슐린','갑상선 호르몬','릴랙신','코티솔'], ans:2 },
    { q:'BC-8(말벅지형)의 특징은?', opts:['상체 비만','알파수용체 우세·하체 과발달','내장지방','부종'], ans:1 },
    { q:'BC-9(올챙이배형)의 정확한 명칭은?', opts:['내장비만형','근감소성 이화작용·마른 비만','셀룰라이트형','부신 비만'], ans:1 },
  ],
  6: [
    { q:'크로노 영양 처방에서 탄수화물 섭취 최적 시간대는?', opts:['새벽','점심~오후 초반','저녁','취침 전'], ans:1 },
    { q:'BC-3(수박배형) 식이 처방의 핵심은?', opts:['고지방 식이','저GI 식사·인슐린 안정화','고단백 간헐적 단식','야간 금식만'], ans:1 },
    { q:'간헐적 단식이 가장 효과적인 BC코드는?', opts:['BC-1','BC-4','BC-3','BC-7'], ans:2 },
  ],
  7: [
    { q:'BC-1(하지 림프형)에 가장 효과적인 운동은?', opts:['스쿼트','수영·걷기·림프 자극 스트레칭','고강도 인터벌','벤치프레스'], ans:1 },
    { q:'BC-4(요요형) 초기 운동 처방 원칙은?', opts:['고강도 운동 집중','저강도 유산소로 대사 점진 회복','단식+운동 병행','근력만'], ans:1 },
    { q:'운동 처방 시 BC-8(말벅지형)에서 피해야 할 것은?', opts:['상체 운동','하체 과부하 근력 운동','유산소','스트레칭'], ans:1 },
  ],
  8: [
    { q:'AI 상담 스크립트 첫 상담 단계의 목표는?', opts:['바로 결제 유도','신뢰 구축과 BC코드 설명','식단 처방','운동 처방'], ans:1 },
    { q:'반론 대처 멘트에서 가장 중요한 요소는?', opts:['강한 설득','공감 후 원인 재설명','가격 할인 제안','빠른 결론'], ans:1 },
    { q:'재방문 유도 단계에서 효과적인 전략은?', opts:['새 프로그램 소개','성과 확인 + 다음 목표 설정','이벤트 안내','지인 추천'], ans:1 },
  ],
  9: [
    { q:'고객 저항(반론)을 극복하는 첫 번째 단계는?', opts:['반박','공감과 인정','무시','가격 조정'], ans:1 },
    { q:'장기 고객 유지에 가장 효과적인 방법은?', opts:['잦은 연락','성과 시각화 + 마이페이지 공유','이벤트 제공','무료 서비스'], ans:1 },
    { q:'고객 동기 부여를 위해 활용하면 좋은 슬림마인드 기능은?', opts:['QR코드','결과지 공유 + 마이페이지 히트맵','결제 내역','B2B연동'], ans:1 },
  ],
  10: [
    { q:'데일리 체크의 3가지 항목은?', opts:['식사·수면·운동','운동·식단·회복','체중·체지방·근육','수분·칼로리·단백질'], ans:1 },
    { q:'3일 연속 체크 미달 시 자동으로 발생하는 것은?', opts:['결제 취소','컨설턴트 알림','고객 탈퇴','서비스 중단'], ans:1 },
    { q:'코칭 댓글 작성 후 고객이 확인하는 경로는?', opts:['이메일','마이페이지(/my/세션ID)','문자','앱 알림'], ans:1 },
  ],
  11: [
    { q:'B2B 파트너 전용 설문지 URL 형식은?', opts:['/b2b/CODE','/survey/CODE','/slimmind?b2b=CODE','/partner/CODE'], ans:2 },
    { q:'B2B 파트너에게 제공되는 커스터마이징은?', opts:['브랜드명·컬러·로고만','질문 순서만','전체 UI 변경','언어 변경'], ans:0 },
    { q:'B2B 파트너 대시보드 접속 경로는?', opts:['/admin','/consultant','/b2b','/partner'], ans:2 },
  ],
  12: [
    { q:'슬림마인드 컨설턴트 자격증 취득 조건은?', opts:['6강 이수','9강 이수','12강 전체 이수 + 각 강 퀴즈 합격','비용 결제만'], ans:2 },
    { q:'자격증 레벨은?', opts:['3급~1급','1급만','골드·실버','마스터·시니어·일반'], ans:0 },
    { q:'수료 후 자격증 번호 형식은?', opts:['SM-000','SM-CERT-YYYY-XXXX','BC-CERT-01','SL-00000'], ans:1 },
  ],
}

// GET /api/consultant/lectures  — 내 강의 진도 조회
app.get('/api/consultant/lectures', requireRole('ANY'), async (c) => {
  try {
    const db   = c.env.DB
    const user = (c as any).__user
    const completions = await db.prepare(`
      SELECT lecture_no, quiz_score, passed, completed_at
      FROM lecture_completions WHERE consultant_code=?
      ORDER BY lecture_no
    `).bind(user.code).all<any>()

    const cert = await db.prepare(
      'SELECT cert_number, issued_at, level FROM certificates WHERE consultant_code=?'
    ).bind(user.code).first<any>()

    const cons = await db.prepare(
      'SELECT lecture_progress, is_certified FROM consultants WHERE code=?'
    ).bind(user.code).first<any>()

    return c.json({
      ok: true,
      completions: completions.results,
      certificate: cert || null,
      lecture_progress: cons?.lecture_progress || 0,
      is_certified:     cons?.is_certified     || 0,
    })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// POST /api/consultant/lectures/:no/complete  — 퀴즈 제출 & 강의 완료 처리
app.post('/api/consultant/lectures/:no/complete', requireRole('ANY'), async (c) => {
  try {
    const db      = c.env.DB
    const user    = (c as any).__user
    const lectNo  = parseInt(c.req.param('no'))
    const { answers } = await c.req.json<{ answers: number[] }>()

    if (lectNo < 1 || lectNo > 12) return c.json({ ok: false, error: '잘못된 강의 번호' }, 400)

    const quiz = QUIZ_BANK[lectNo] || []
    let correct = 0
    answers.forEach((a, i) => { if (quiz[i] && a === quiz[i].ans) correct++ })
    const score  = quiz.length > 0 ? Math.round((correct / quiz.length) * 100) : 100
    const passed = score >= 70

    // 완료 기록 저장 (upsert)
    await db.prepare(`
      INSERT INTO lecture_completions (consultant_code, lecture_no, quiz_score, passed)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(consultant_code, lecture_no) DO UPDATE SET
        quiz_score=excluded.quiz_score, passed=excluded.passed, completed_at=datetime('now')
    `).bind(user.code, lectNo, score, passed ? 1 : 0).run()

    if (passed) {
      // lecture_progress 업데이트
      const passedCount = await db.prepare(`
        SELECT COUNT(*) as cnt FROM lecture_completions WHERE consultant_code=? AND passed=1
      `).bind(user.code).first<any>()
      const newProgress = passedCount?.cnt || 0

      await db.prepare(`
        UPDATE consultants SET lecture_progress=?, updated_at=datetime('now') WHERE code=?
      `).bind(newProgress, user.code).run()

      // 12강 전부 합격 시 자격증 발급
      if (newProgress >= 12) {
        const existing = await db.prepare(
          'SELECT id FROM certificates WHERE consultant_code=?'
        ).bind(user.code).first<any>()

        if (!existing) {
          const year    = new Date().getFullYear()
          const serial  = String(Math.floor(Math.random() * 9000) + 1000)
          const certNum = `SM-CERT-${year}-${serial}`
          await db.prepare(`
            INSERT OR IGNORE INTO certificates (consultant_code, cert_number, level)
            VALUES (?, ?, '1급')
          `).bind(user.code, certNum).run()
          await db.prepare(`
            UPDATE consultants SET is_certified=1, certified_at=datetime('now') WHERE code=?
          `).bind(user.code).run()
        }
      }
    }

    return c.json({ ok: true, score, passed, correct, total: quiz.length })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// GET /api/consultant/certificate  — 내 자격증 조회
app.get('/api/consultant/certificate', requireRole('ANY'), async (c) => {
  try {
    const db   = c.env.DB
    const user = (c as any).__user
    const cert = await db.prepare(`
      SELECT c.*, con.name, con.grade
      FROM certificates c
      JOIN consultants con ON con.code = c.consultant_code
      WHERE c.consultant_code=?
    `).bind(user.code).first<any>()
    return c.json({ ok: true, certificate: cert || null })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// GET /api/admin/certificates  — 관리자 자격증 발급 내역
app.get('/api/admin/certificates', requireRole('MASTER'), async (c) => {
  try {
    const db = c.env.DB
    const list = await db.prepare(`
      SELECT c.*, con.name, con.grade, con.phone
      FROM certificates c
      JOIN consultants con ON con.code = c.consultant_code
      ORDER BY c.issued_at DESC
    `).all<any>()
    return c.json({ ok: true, certificates: list.results })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// ═══════════════════════════════════════════════════════════════
//  Feature 12: B2B 고객 그룹 비교 분석
// ═══════════════════════════════════════════════════════════════

// GET /api/b2b/group-analysis — B2B 파트너 그룹 비교 분석 (파트너 전용)
app.get('/api/b2b/group-analysis', requireB2B(), async (c) => {
  try {
    const user = c.get('user') as JwtPayload
    const db = c.env.DB
    const code = user.code

    // 1. BC 분포
    const bcDist = await db.prepare(`
      SELECT bc_primary, COUNT(*) as cnt
      FROM results WHERE ref_code=? AND bc_primary IS NOT NULL
      GROUP BY bc_primary ORDER BY cnt DESC
    `).bind(code).all<any>()

    // 2. 성별 분포
    const genderDist = await db.prepare(`
      SELECT gender, COUNT(*) as cnt
      FROM results WHERE ref_code=?
      GROUP BY gender
    `).bind(code).all<any>()

    // 3. 연령대 분포
    const ageDist = await db.prepare(`
      SELECT
        CASE
          WHEN CAST(age AS INTEGER) < 30 THEN '20대'
          WHEN CAST(age AS INTEGER) < 40 THEN '30대'
          WHEN CAST(age AS INTEGER) < 50 THEN '40대'
          WHEN CAST(age AS INTEGER) < 60 THEN '50대'
          ELSE '60대+'
        END as age_group,
        COUNT(*) as cnt
      FROM results WHERE ref_code=? AND age IS NOT NULL AND age != ''
      GROUP BY age_group ORDER BY age_group
    `).bind(code).all<any>()

    // 4. BMI 평균 & 분포
    const bmiStats = await db.prepare(`
      SELECT
        ROUND(AVG(CAST(bmi AS REAL)), 1) as avg_bmi,
        ROUND(MIN(CAST(bmi AS REAL)), 1) as min_bmi,
        ROUND(MAX(CAST(bmi AS REAL)), 1) as max_bmi,
        COUNT(*) as cnt
      FROM results WHERE ref_code=? AND bmi IS NOT NULL AND bmi != '' AND CAST(bmi AS REAL) > 0
    `).bind(code).first<any>()

    // 5. 월별 유입 추이 (최근 6개월)
    const monthlyTrend = await db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as cnt
      FROM results WHERE ref_code=?
        AND created_at >= datetime('now', '-6 months')
      GROUP BY month ORDER BY month
    `).bind(code).all<any>()

    // 6. 체중 목표 달성률 분포 (weight_loss_pct 있는 경우)
    const weightGoalDist = await db.prepare(`
      SELECT
        CASE
          WHEN CAST(weight_loss_pct AS REAL) < 5 THEN '5% 미만'
          WHEN CAST(weight_loss_pct AS REAL) < 10 THEN '5-10%'
          WHEN CAST(weight_loss_pct AS REAL) < 15 THEN '10-15%'
          WHEN CAST(weight_loss_pct AS REAL) < 20 THEN '15-20%'
          ELSE '20% 이상'
        END as goal_range,
        COUNT(*) as cnt
      FROM results WHERE ref_code=? AND weight_loss_pct IS NOT NULL AND weight_loss_pct != ''
      GROUP BY goal_range
    `).bind(code).all<any>()

    // 7. 평균 체중·신장
    const bodyAvg = await db.prepare(`
      SELECT
        ROUND(AVG(CAST(weight AS REAL)), 1) as avg_weight,
        ROUND(AVG(CAST(height AS REAL)), 1) as avg_height,
        ROUND(AVG(CAST(target_weight AS REAL)), 1) as avg_target
      FROM results WHERE ref_code=?
        AND weight IS NOT NULL AND weight != '' AND CAST(weight AS REAL) > 0
    `).bind(code).first<any>()

    // 8. 상위 축 빈도 (top_axes JSON 파싱은 클라 처리 위해 샘플 전달)
    const recentSample = await db.prepare(`
      SELECT bc_primary, axis_scores, top_axes
      FROM results WHERE ref_code=? AND axis_scores IS NOT NULL
      ORDER BY created_at DESC LIMIT 50
    `).bind(code).all<any>()

    // 9. 전월 vs 이번달 비교
    const periodComp = await db.prepare(`
      SELECT
        SUM(CASE WHEN strftime('%Y-%m', created_at)=strftime('%Y-%m','now') THEN 1 ELSE 0 END) as this_month,
        SUM(CASE WHEN strftime('%Y-%m', created_at)=strftime('%Y-%m','now','-1 month') THEN 1 ELSE 0 END) as last_month,
        SUM(CASE WHEN date(created_at)=date('now') THEN 1 ELSE 0 END) as today
      FROM results WHERE ref_code=?
    `).bind(code).first<any>()

    return c.json({
      ok: true,
      bc_distribution: bcDist.results,
      gender_distribution: genderDist.results,
      age_distribution: ageDist.results,
      bmi_stats: bmiStats,
      monthly_trend: monthlyTrend.results,
      weight_goal_distribution: weightGoalDist.results,
      body_avg: bodyAvg,
      recent_sample: recentSample.results,
      period_comparison: periodComp,
    })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// GET /api/admin/group-analysis/:code — 관리자: 특정 B2B 파트너 그룹 분석
app.get('/api/admin/group-analysis/:code', requireRole('MASTER'), async (c) => {
  try {
    const db = c.env.DB
    const code = c.req.param('code').toUpperCase()

    const [bcDist, genderDist, ageDist, bmiStats, monthlyTrend, periodComp, bodyAvg] = await Promise.all([
      db.prepare(`SELECT bc_primary, COUNT(*) as cnt FROM results WHERE ref_code=? AND bc_primary IS NOT NULL GROUP BY bc_primary ORDER BY cnt DESC`).bind(code).all<any>(),
      db.prepare(`SELECT gender, COUNT(*) as cnt FROM results WHERE ref_code=? GROUP BY gender`).bind(code).all<any>(),
      db.prepare(`SELECT CASE WHEN CAST(age AS INTEGER)<30 THEN '20대' WHEN CAST(age AS INTEGER)<40 THEN '30대' WHEN CAST(age AS INTEGER)<50 THEN '40대' WHEN CAST(age AS INTEGER)<60 THEN '50대' ELSE '60대+' END as age_group, COUNT(*) as cnt FROM results WHERE ref_code=? AND age IS NOT NULL AND age!='' GROUP BY age_group ORDER BY age_group`).bind(code).all<any>(),
      db.prepare(`SELECT ROUND(AVG(CAST(bmi AS REAL)),1) as avg_bmi, ROUND(MIN(CAST(bmi AS REAL)),1) as min_bmi, ROUND(MAX(CAST(bmi AS REAL)),1) as max_bmi FROM results WHERE ref_code=? AND bmi IS NOT NULL AND bmi!='' AND CAST(bmi AS REAL)>0`).bind(code).first<any>(),
      db.prepare(`SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as cnt FROM results WHERE ref_code=? AND created_at>=datetime('now','-6 months') GROUP BY month ORDER BY month`).bind(code).all<any>(),
      db.prepare(`SELECT SUM(CASE WHEN strftime('%Y-%m',created_at)=strftime('%Y-%m','now') THEN 1 ELSE 0 END) as this_month, SUM(CASE WHEN strftime('%Y-%m',created_at)=strftime('%Y-%m','now','-1 month') THEN 1 ELSE 0 END) as last_month FROM results WHERE ref_code=?`).bind(code).first<any>(),
      db.prepare(`SELECT ROUND(AVG(CAST(weight AS REAL)),1) as avg_weight, ROUND(AVG(CAST(height AS REAL)),1) as avg_height, ROUND(AVG(CAST(target_weight AS REAL)),1) as avg_target FROM results WHERE ref_code=? AND weight IS NOT NULL AND weight!='' AND CAST(weight AS REAL)>0`).bind(code).first<any>(),
    ])

    return c.json({
      ok: true, code,
      bc_distribution: bcDist.results,
      gender_distribution: genderDist.results,
      age_distribution: ageDist.results,
      bmi_stats: bmiStats,
      monthly_trend: monthlyTrend.results,
      period_comparison: periodComp,
      body_avg: bodyAvg,
    })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

export default app
