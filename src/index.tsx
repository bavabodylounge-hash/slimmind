import { Hono } from 'hono'
import { cors } from 'hono/cors'
import indexHtml from '../public/index.html?raw'
import surveyDataJs from '../public/survey-data.js?raw'
import bcDefinitionsJs from '../public/bc-definitions.js?raw'
import adminHtml from '../public/admin.html?raw'
import consultantHtml from '../public/consultant.html?raw'
import resultHtml from '../public/result.html?raw'
import bodymapPreviewHtml from '../public/bodymap_preview.html?raw'
import slimmindLiveHtml from '../public/slimmind_live.html?raw'

// ─── 타입 정의 ───────────────────────────────────────────────
type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

type JwtPayload = {
  sub: string        // consultants.id
  code: string       // MASTER | SC-XXXX
  role: 'MASTER' | 'CONSULTANT'
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
app.get('/bc-definitions.js', (c) =>
  c.body(bcDefinitionsJs, 200, { 'Content-Type': 'application/javascript; charset=utf-8' })
)

// ═══════════════════════════════════════════════════════════════
//  AUTH API
// ═══════════════════════════════════════════════════════════════

// POST /api/auth/login — 공통 로그인 (MASTER + CONSULTANT)
app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json()
    const code = body.code
    const password = body.password
    if (!code || !password) return c.json({ error: '코드와 비밀번호를 입력하세요.' }, 400)

    const db = c.env.DB
    const consultant = await db.prepare(
      'SELECT * FROM consultants WHERE code = ?'
    ).bind(code.toUpperCase()).first<any>()

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
    axis_scores, top_axes
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

  let validConsultantCode = null
  if (consultant_code) {
    const cons = await db.prepare('SELECT code FROM consultants WHERE code = ?').bind(consultant_code).first<any>()
    validConsultantCode = cons?.code || null
  }

  await db.prepare(`
    INSERT INTO results (
      id, user_name, consultant_code,
      bc_primary, bc_secondary, bc_primary_score, bc_secondary_score,
      bc_scores_json, ohaeng_type, ohaeng_scores_json,
      mbti, blood_type, saju_il_gan, saju_ohaeng,
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
      axis_scores_json, top_axes_json
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    result_id, user_name || '익명', validConsultantCode,
    bc_primary, bc_secondary || null, bc_primary_score || 0, bc_secondary_score || 0,
    JSON.stringify(bc_scores || {}), ohaeng_type || null, JSON.stringify(ohaeng_scores || {}),
    toStr(mbti), toStr(blood_type), toStr(saju_il_gan), toStr(saju_ohaeng),
    toStr(gender), toStr(birth_date),
    height ? Number(height) : null, weight ? Number(weight) : null, target_weight ? Number(target_weight) : null,
    bmi ? Number(bmi) : null, bfr ? Number(bfr) : null,
    fat_kg ? Number(fat_kg) : null, muscle_kg ? Number(muscle_kg) : null,
    toStr(top_size), toStr(bottom_size), toStr(target_top_size), toStr(target_bottom_size),
    toStr(emotional_state), toStr(main_goal), toStr(priority_value),
    JSON.stringify(answers || {}), JSON.stringify(survey_summary || {}),
    toStr(aerobic_response), massage_swells ? 1 : 0, toStr(sauna_response),
    toStr(current_facility), toStr(context_type), toStr(current_medications),
    toStr(target_body_part), toStr(psych_state), toStr(monthly_budget), toStr(muscle_soreness_level),
    'v4.0',
    // v3.0 섹션 L
    JSON.stringify(Array.isArray(food_allergy) ? food_allergy : []),
    JSON.stringify(Array.isArray(allergy_exclude) ? allergy_exclude : []),
    toStr(skin_reaction),
    toStr(menopause_status),
    is_menopause ? 1 : 0,
    JSON.stringify(Array.isArray(medical_conditions) ? medical_conditions : []),
    has_medical_conditions ? 1 : 0,
    // v4.0 10축 분석
    JSON.stringify(axis_scores || {}),
    JSON.stringify(Array.isArray(top_axes) ? top_axes : [])
  ).run()

  return c.json({ success: true, result_id, message: '설문이 제출되었습니다.' })
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
  const { name, email, phone, job_type, grade, subscription_end, memo } = body

  const last = await db.prepare("SELECT code FROM consultants WHERE code LIKE 'SC-%' ORDER BY code DESC LIMIT 1").first<any>()
  let nextNum = 1
  if (last?.code) {
    const n = parseInt(last.code.replace('SC-', ''))
    if (!isNaN(n)) nextNum = n + 1
  }
  const code = `SC-${String(nextNum).padStart(4, '0')}`

  await db.prepare(`
    INSERT INTO consultants (code, name, email, phone, job_type, grade, subscription_status, subscription_end, memo, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `).bind(code, name, email || null, phone || null, job_type || null, grade || '일반', subscription_end || null, memo || null, `pass${String(nextNum).padStart(4,'0')}`).run()

  const initialPassword = `pass${String(nextNum).padStart(4,'0')}`
  return c.json({ success: true, code, initialPassword, message: `컨설턴트 ${code} 생성 완료. 초기 비밀번호: ${initialPassword}` })
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
      saju_il_gan: result.saju_il_gan,
      saju_ohaeng: result.saju_ohaeng,
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

  // result.html에 window.__RESULT__ 주입
  const injectedHtml = resultHtml.replace(
    '</head>',
    `<script>window.__RESULT__ = ${JSON.stringify(resultData)};</script>\n</head>`
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

// ─── 임시: 바디맵 미리보기 (개발용) ────────────────────────────
app.get('/bodymap-preview', (c) => c.html(bodymapPreviewHtml))

// ─── 슬림마인드 라이브 설문지 — 유일한 최신 설문지 ────────────
// 대표 URL: /slimmind_live  (루트 / 도 여기로 리다이렉트됨)
app.get('/slimmind_live', (c) => c.html(slimmindLiveHtml))
app.get('/slimmind_live.html', (c) => c.html(slimmindLiveHtml))
app.get('/slimmind', (c) => c.html(slimmindLiveHtml))

// ─── result.html 직접 접근 (bc=BC-01&name=... 파라미터 방식) ──────────────
app.get('/result.html', (c) => c.html(resultHtml))
app.get('/result', (c) => c.html(resultHtml))

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
