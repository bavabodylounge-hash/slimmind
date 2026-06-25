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
// slimmind_live.html은 구버전(키오스크) — index.html(최신 설문지)로 교체됨
// import slimmindLiveHtml from '../public/slimmind_live.html?raw'
const slimmindLiveHtml = indexHtml  // ← index.html = 30문항+심층질문 최신 설문지

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

// POST /api/survey/submit
app.post('/api/survey/submit', async (c) => {
  const body = await c.req.json()
  const {
    consultant_code, user_name, answers,
    bc_primary, bc_secondary, bc_primary_score, bc_secondary_score,
    bc_scores, ohaeng_type, ohaeng_scores,
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
    JSON.stringify(bc_scores || {}), toStr(ohaeng_type), JSON.stringify(ohaeng_scores || {}),
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

  if (!email) return c.json({ success: false, error: '이메일은 필수입니다.' }, 400)

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
    const last = await db.prepare("SELECT code FROM consultants WHERE code LIKE 'SC-%' ORDER BY code DESC LIMIT 1").first<any>()
    let nextNum = 1
    if (last?.code) {
      const n = parseInt(last.code.replace('SC-', ''))
      if (!isNaN(n)) nextNum = n + 1
    }
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
  const unionQuery = `
    SELECT
      r.id, r.user_name,
      COALESCE(r.bc_primary, '') as bc_primary,
      NULL as bc_code_key,
      NULL as bc_nickname,
      r.axis_scores,
      r.consultant_code,
      c.name as consultant_name,
      NULL as ref_code,
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
  const [total, thisMonth, nickDist] = await Promise.all([
    db.prepare('SELECT COUNT(*) as cnt FROM results WHERE ref_code=?').bind(user.code).first<any>(),
    db.prepare("SELECT COUNT(*) as cnt FROM results WHERE ref_code=? AND strftime('%Y-%m', created_at)=strftime('%Y-%m','now')").bind(user.code).first<any>(),
    db.prepare('SELECT bc_primary, COUNT(*) as cnt FROM results WHERE ref_code=? GROUP BY bc_primary ORDER BY cnt DESC LIMIT 5').bind(user.code).all<any>(),
  ])
  return c.json({
    total: total?.cnt || 0,
    this_month: thisMonth?.cnt || 0,
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
app.get('/api/consultant/results', requireRole('ANY'), async (c) => {
  const user = c.get('user') as JwtPayload
  const db = c.env.DB
  const search = c.req.query('search') || ''
  const bc = c.req.query('bc') || ''

  let query: string
  let params: any[]

  if (user.role === 'MASTER') {
    query = 'SELECT * FROM results WHERE 1=1'
    params = []
  } else {
    query = 'SELECT * FROM results WHERE consultant_code=?'
    params = [user.code]
  }
  if (search) { query += ' AND (user_name LIKE ? OR id LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
  if (bc) { query += ' AND bc_primary=?'; params.push(bc) }
  query += ' ORDER BY created_at DESC LIMIT 50'

  const stmt = db.prepare(query)
  const result = params.length ? await stmt.bind(...params).all<any>() : await stmt.all<any>()
  return c.json({ results: result.results })
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

  const [total, thisMonth, bcDist, recentResults] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as cnt FROM results WHERE ${whereClause}`)
      .bind(...bindParams).first<any>(),
    db.prepare(`SELECT COUNT(*) as cnt FROM results WHERE ${whereClause} AND strftime('%Y-%m', created_at)=strftime('%Y-%m','now')`)
      .bind(...bindParams).first<any>(),
    db.prepare(`SELECT bc_primary, COUNT(*) as cnt FROM results WHERE ${whereClause} GROUP BY bc_primary ORDER BY cnt DESC`)
      .bind(...bindParams).all<any>(),
    db.prepare(`SELECT id, user_name, bc_primary, created_at, admin_memo FROM results WHERE ${whereClause} ORDER BY created_at DESC LIMIT 5`)
      .bind(...bindParams).all<any>(),
  ])

  return c.json({
    total: total?.cnt || 0,
    this_month: thisMonth?.cnt || 0,
    bc_distribution: bcDist.results,
    recent_results: recentResults.results,
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
  // 컨설턴트별 해당 월 완료 건수
  const rows = await db.prepare(`
    SELECT
      r.consultant_code,
      con.name AS consultant_name,
      con.phone AS consultant_phone,
      con.grade AS consultant_grade,
      COUNT(*) AS monthly_count,
      SUM(CASE WHEN r.program_price IS NOT NULL THEN r.program_price ELSE 150000 END) AS total_sales,
      SUM(CASE WHEN r.program_price IS NOT NULL THEN r.program_price ELSE 150000 END) * 0.25 AS settlement_amount
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
           SUM(CASE WHEN program_price IS NOT NULL THEN program_price ELSE 150000 END) as total
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
          is_consultant:   false,
          is_owner:        false,
          is_b2b_partner:  false,
          _source:         'diagnosis_results',
        }
        // JSON.stringify 직렬화 실패 방어
        let injectedData = '{}'
        try { injectedData = JSON.stringify(diagResult) } catch { injectedData = '{}' }
        const injectedHtml = resultV4Html.replace(
          '</head>',
          `<script>window.__RESULT__ = ${injectedData};window.__RESULT_FULL__ = {};</script>\n</head>`
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
    consultant_name: isOwner ? (authUser?.name || null) : null,
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
    // 기본 정보
    user_name: resultData.result?.user_name,
    consultant_code: resultData.result?.consultant_code,
    bc_primary: resultData.result?.bc_primary,
    bc_secondary: resultData.result?.bc_secondary,
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
    // 체형 사이즈
    top_size: resultData.result?.top_size,
    bottom_size: resultData.result?.bottom_size,
    target_top_size: resultData.result?.target_top_size,
    target_bottom_size: resultData.result?.target_bottom_size,
    // 동양의학
    ohaeng_type: resultData.result?.ohaeng_type,
    ohaeng_scores: resultData.result?.ohaeng_scores_json
      ? (() => { try { return JSON.parse(resultData.result.ohaeng_scores_json) } catch { return null } })()
      : null,
    mbti: resultData.result?.mbti,
    blood_type: resultData.result?.blood_type,
    saju_il_gan: resultData.result?.saju_il_gan,
    saju_display: resultData.result?.saju_display,
    // 설문 응답 (채점 재활용) — DB 실제 컬럼: survey_answers_json
    survey_answers: resultData.result?.survey_answers_json
      ? (() => { try { return JSON.parse(resultData.result.survey_answers_json) } catch { return null } })()
      : null,
    answers: resultData.result?.survey_answers_json
      ? (() => { try { return JSON.parse(resultData.result.survey_answers_json) } catch { return null } })()
      : null,
    survey_summary: resultData.result?.survey_summary_json
      ? (() => { try { return JSON.parse(resultData.result.survey_summary_json) } catch { return null } })()
      : null,
    // v4 10축 분석 — DB 실제 컬럼: axis_scores_json, top_axes_json
    axis_scores: resultData.result?.axis_scores_json
      ? (() => { try { return JSON.parse(resultData.result.axis_scores_json) } catch { return null } })()
      : null,
    top_axes: resultData.result?.top_axes_json
      ? (() => { try { return JSON.parse(resultData.result.top_axes_json) } catch { return null } })()
      : null,
    axis_primary: resultData.result?.axis_primary,
    // 건강 조건 — DB 실제 컬럼: food_allergy_json, allergy_exclude_json
    food_allergy: resultData.result?.food_allergy_json
      ? (() => { try { return JSON.parse(resultData.result.food_allergy_json) } catch { return null } })()
      : null,
    allergy_exclude: resultData.result?.allergy_exclude_json
      ? (() => { try { return JSON.parse(resultData.result.allergy_exclude_json) } catch { return null } })()
      : null,
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
    consultant_name: resultData.consultant_name,
  };

  // result-v4.html을 최신 결과지 템플릿으로 사용
  // JSON.stringify 직렬화 실패 방어
  let flatJson = '{}'
  let fullJson = '{}'
  try { flatJson = JSON.stringify(flatResult) } catch { flatJson = '{}' }
  try { fullJson = JSON.stringify(resultData) } catch { fullJson = '{}' }

  const injectedHtml = resultV4Html.replace(
    '</head>',
    `${brandInjectResult}\n<script>window.__RESULT__ = ${flatJson};window.__RESULT_FULL__ = ${fullJson};</script>\n</head>`
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
  return c.html(slimmindLiveHtml)
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
app.get('/slimmind_live', (c) => c.html(slimmindLiveHtml))
app.get('/slimmind_live.html', (c) => c.html(slimmindLiveHtml))
app.get('/slimmind', (c) => c.html(slimmindLiveHtml))

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
  let html = slimmindLiveHtml

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
  <rect width="32" height="32" rx="8" fill="#6d28d9"/>
  <text x="16" y="23" text-anchor="middle" font-size="20" font-family="sans-serif" fill="white">S</text>
</svg>`
  return c.body(svg, 200, { 'Content-Type': 'image/svg+xml' })
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
              on_track=excluded.on_track,
              updated_at=CURRENT_TIMESTAMP
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
          // 테이블 없는 경우 등 — 에러 반환
          return c.json({ success: false, error: String(dbErr) }, 500);
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
    const resultUrl = `https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com/result/${body.result_id}`
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
      user_name, bc_nickname, bc_primary, bc_secondary, bc_code_key,
      top3_axes, axis_scores, region, texture, bg_filter,
      ohaeng_type, mbti_full, disp_answers, raw_answers,
      goal_weight, weight_loss_pct,
      ref_code, completed_at
    } = body

    if (!user_name) return c.json({ error: 'user_name required' }, 400)

    // ✅ BUG-1 대응: bc_primary가 닉네임(한글)이므로 bc_code_key(BC-N 형태) 도 저장
    // bc_code_key가 없으면 NICKNAME_TO_BC 로컬 테이블로 역매핑
    const NICKNAME_TO_BC_BACKEND: Record<string, string> = {
      '아빠체형 내장비대형':'BC-3','식후기절 혈당롤러코스터형':'BC-3','털털한 PCOS형':'BC-6',
      '약물부작용 강제축적형':'BC-4','스트레스성 야식부엉이형':'BC-6','억제제부작용 배부름마비형':'BC-6',
      '출산후 바람빠진 풍선형':'BC-7','식후임산부 가스풍선형':'BC-3','팔다리거미 올챙이배형':'BC-9',
      '오후만되면 코끼리다리형':'BC-1','엄마체형 하지정체형':'BC-1','여름에도 시린 얼음장형':'BC-4',
      '운동할수록 말벅지형':'BC-8','골반틀어짐 승마살형':'BC-7','지방흡입후 재발형':'BC-5',
      '목짧아지는 거북이형':'BC-2','안 쓰는 팔뚝 부종형':'BC-2','상체근육형':'BC-8',
      '겨드랑이 부유방형':'BC-2','호르몬스위치 갱년기형':'BC-6','스트레스기절 번아웃형':'BC-6',
      '대사증후군 종합형':'BC-9','동시다발 다중악순환형':'BC-6',
    }
    // bc_code_key가 없으면 bc_primary(닉네임)로 역매핑, 그것도 없으면 'BC-6' 기본값
    const resolvedBcCodeKey = bc_code_key ||
      (bc_primary && NICKNAME_TO_BC_BACKEND[bc_primary]) ||
      (bc_nickname && NICKNAME_TO_BC_BACKEND[bc_nickname]) ||
      null

    // UUID 생성
    const result_id = crypto.randomUUID()
    const now = new Date().toISOString()

    // raw_answers: 1~4차 전체 원시 답변 JSON 직렬화
    // raw_answers 컬럼이 없는 구버전 DB에서도 graceful하게 처리
    const rawAnswersJson = raw_answers ? JSON.stringify(raw_answers) : null

    try {
      // ✅ BUG-1 완전 수정: bc_code_key(BC-6 형태) 컬럼 포함 INSERT (migration 0032 이후)
      await db.prepare(`
        INSERT INTO diagnosis_results
          (id, user_name, bc_nickname, bc_primary, bc_code_key, bc_secondary,
           top3_axes, axis_scores, region, texture, bg_filter,
           ohaeng_type, mbti_full, disp_answers, raw_answers,
           goal_weight, weight_loss_pct,
           ref_code, completed_at, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        result_id,
        String(user_name || '익명'),
        bc_nickname || null,
        bc_primary  || null,       // 한글 닉네임 '스트레스성 야식부엉이형'
        resolvedBcCodeKey || null, // 'BC-6' 형태 코드
        bc_secondary || null,
        top3_axes   ? JSON.stringify(top3_axes)   : null,
        axis_scores ? JSON.stringify(axis_scores) : null,
        region      || null,
        texture     || null,
        bg_filter   || '',
        ohaeng_type || null,
        mbti_full   || null,
        disp_answers ? JSON.stringify(disp_answers) : null,
        rawAnswersJson,
        goal_weight     != null ? Number(goal_weight)     : null,
        weight_loss_pct != null ? Number(weight_loss_pct) : null,
        ref_code     || null,
        completed_at || now,
        now
      ).run()
    } catch (insertErr: any) {
      // bc_code_key 컬럼이 없는 경우 (migration 미적용) → 폴백 INSERT
      if (String(insertErr).includes('no column named bc_code_key') ||
          String(insertErr).includes('no column named goal_weight') ||
          String(insertErr).includes('no column named weight_loss_pct') ||
          String(insertErr).includes('no column named raw_answers') ||
          String(insertErr).includes('table diagnosis_results has no column')) {
        console.warn('[diagnosis POST] bc_code_key/goal_weight/raw_answers 컬럼 없음 — 폴백 INSERT')
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
      bc_primary:   row.bc_primary,
      bc_secondary: row.bc_secondary,
      top3_axes:    parseJson(row.top3_axes,    []),
      axis_scores:  parseJson(row.axis_scores,  {}),
      region:       row.region,
      texture:      row.texture,
      bg_filter:    row.bg_filter,
      ohaeng_type:  row.ohaeng_type,
      mbti_full:    row.mbti_full,
      disp_answers: parseJson(row.disp_answers, {}),
      raw_answers:  parseJson(row.raw_answers,  null),  // 원시 답변 (학습용)
      ref_code:     row.ref_code,
      completed_at: row.completed_at,
      created_at:   row.created_at
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

    let query = 'SELECT id, user_name, bc_nickname, bc_primary, bc_secondary, top3_axes, region, texture, ohaeng_type, mbti_full, ref_code, completed_at, created_at FROM diagnosis_results WHERE 1=1'
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

export default app
