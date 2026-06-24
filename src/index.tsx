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
app.get('/api/admin/results', requireRole('MASTER'), async (c) => {
  const db = c.env.DB
  const bc = c.req.query('bc') || ''
  const cons = c.req.query('consultant') || ''
  const search = c.req.query('search') || ''
  let query = 'SELECT r.*, c.name as consultant_name FROM results r LEFT JOIN consultants c ON r.consultant_code = c.code WHERE 1=1'
  const params: any[] = []
  if (bc) { query += ' AND r.bc_primary = ?'; params.push(bc) }
  if (cons) { query += ' AND r.consultant_code = ?'; params.push(cons) }
  if (search) { query += ' AND (r.user_name LIKE ? OR r.id LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
  query += ' ORDER BY r.created_at DESC LIMIT 100'
  const stmt = db.prepare(query)
  const result = params.length ? await stmt.bind(...params).all<any>() : await stmt.all<any>()
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

// ═══════════════════════════════════════════════════════════════
//  결과지 페이지 라우트 — window.__RESULT__ 서버사이드 주입
// ═══════════════════════════════════════════════════════════════
app.get('/result/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')

  // 결과 조회 (공개 접근 가능 — URL 알면 볼 수 있음)
  const result = await db.prepare('SELECT * FROM results WHERE id=?').bind(id).first<any>()
  if (!result) {
    return c.html(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>결과 없음</title></head>
<body style="font-family:sans-serif;text-align:center;padding:60px">
<h2>결과지를 찾을 수 없습니다</h2>
<p style="color:#666">링크가 만료되었거나 잘못된 주소입니다.</p>
<a href="/" style="color:#1A5276">홈으로 돌아가기</a>
</body></html>`, 404)
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
  const injectedHtml = resultHtml.replace(
    '</head>',
    `${brandInjectResult}\n<script>window.__RESULT__ = ${JSON.stringify(resultData)};</script>\n</head>`
  )

  return c.html(injectedHtml)
})

// ═══════════════════════════════════════════════════════════════
//  페이지 라우트
// ═══════════════════════════════════════════════════════════════

// ─── 대표 주소(루트) — 항상 최신 설문지(slimmind_live)로 리다이렉트 ──
// ?ref= 등 쿼리파라미터를 그대로 전달해 컨설턴트 코드가 유실되지 않도록 함
app.get('/', (c) => {
  const qs = c.req.raw.url.split('?')[1]
  const target = qs ? `/slimmind_live?${qs}` : '/slimmind_live'
  return c.redirect(target, 301)
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
// 대표 URL: /slimmind_live  (루트 / 도 여기로 리다이렉트됨)
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
   POST /api/checkin — 주차별 체크인 저장 + 컨설턴트 자동전송
═══════════════════════════════════════════════════════ */
app.post('/api/checkin', async (c) => {
  const db = c.env.DB as D1Database | undefined;
  try {
    const body = await c.req.json() as {
      result_id?: string;
      consultant_code?: string;
      bc_code?: string;
      week_range?: string;
      axis_name?: string;
      checked_at?: string;
    };

    if(!body.result_id){
      return c.json({ ok: false, error: 'result_id required' }, 400);
    }

    if(db){
      // checkin_log 테이블에 저장 (없으면 graceful 처리)
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
        // 테이블 미존재 등 DB 오류 — 로그만 남기고 성공 응답
        console.warn('[checkin] DB insert skipped:', dbErr);
      }
    }

    return c.json({ ok: true, message: '체크인 완료' });
  } catch(e) {
    console.error('[/api/checkin]', e);
    return c.json({ ok: false, error: String(e) }, 500);
  }
})

export default app
