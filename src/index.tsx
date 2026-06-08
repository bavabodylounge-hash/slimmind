import { Hono } from 'hono'
import { cors } from 'hono/cors'
import indexHtml from '../public/index.html?raw'
import surveyDataJs from '../public/survey-data.js?raw'
import adminHtml from '../public/admin.html?raw'
import consultantHtml from '../public/consultant.html?raw'
import resultHtml from '../public/result.html?raw'

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
  // 한글 포함 안전한 Base64URL 인코딩
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
  const auth = c.req.header('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
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

// ─── BC 점수 계산 로직 (서버 사이드) ──────────────────────────
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

    // 개발 단계 비밀번호 검증
    let pwOk = false
    if (consultant.code === 'MASTER' && password === 'admin1234') {
      pwOk = true
    } else if (consultant.password_hash && consultant.password_hash === password) {
      pwOk = true
    } else {
      // 초기 비밀번호 패턴: passNNNN
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
    survey_summary
  } = body

  const result_id = resultIdGen()
  const db = c.env.DB

  // 컨설턴트 코드 유효성 확인 (없으면 null 허용)
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
      survey_answers_json, survey_summary_json
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    result_id, user_name || '익명', validConsultantCode,
    bc_primary, bc_secondary || null, bc_primary_score || 0, bc_secondary_score || 0,
    JSON.stringify(bc_scores || {}), ohaeng_type || null, JSON.stringify(ohaeng_scores || {}),
    mbti || null, blood_type || null, saju_il_gan || null, saju_ohaeng || null,
    gender || null, birth_date || null,
    height ? Number(height) : null, weight ? Number(weight) : null, target_weight ? Number(target_weight) : null,
    bmi ? Number(bmi) : null, bfr ? Number(bfr) : null,
    fat_kg ? Number(fat_kg) : null, muscle_kg ? Number(muscle_kg) : null,
    top_size || null, bottom_size || null, target_top_size || null, target_bottom_size || null,
    emotional_state || null, main_goal || null, priority_value || null,
    JSON.stringify(answers || {}), JSON.stringify(survey_summary || {})
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

  // 다음 SC 코드 자동 생성
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

  return c.json({ success: true, code, message: `컨설턴트 ${code} 생성 완료. 초기 비밀번호: pass${String(nextNum).padStart(4,'0')}` })
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

  // 현재 버전 스냅샷 저장
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

// GET /api/results/:id — 결과 상세 (컨설턴트 본인 또는 MASTER)
app.get('/api/results/:id', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: '인증이 필요합니다.' }, 401)

  const db = c.env.DB
  const id = c.req.param('id')
  const result = await db.prepare('SELECT * FROM results WHERE id=?').bind(id).first<any>()
  if (!result) return c.json({ error: '결과를 찾을 수 없습니다.' }, 404)

  // 권한 확인: MASTER는 전체 조회, CONSULTANT는 본인 고객만
  if (user.role !== 'MASTER' && result.consultant_code !== user.code) {
    return c.json({ error: '접근 권한이 없습니다.' }, 403)
  }

  // BC 처방 데이터 포함
  const prescription = await db.prepare('SELECT * FROM bc_prescriptions WHERE bc_code=?').bind(result.bc_primary).first<any>()
  let secondaryPrescription = null
  if (result.bc_secondary) {
    secondaryPrescription = await db.prepare('SELECT * FROM bc_prescriptions WHERE bc_code=?').bind(result.bc_secondary).first<any>()
  }

  // JSON 파싱
  const parseJson = (s: string | null, fallback: any = {}) => {
    try { return s ? JSON.parse(s) : fallback } catch { return fallback }
  }

  return c.json({
    result: {
      ...result,
      bc_scores: parseJson(result.bc_scores_json, {}),
      ohaeng_scores: parseJson(result.ohaeng_scores_json, {}),
      survey_answers: parseJson(result.survey_answers_json, {}),
      survey_summary: parseJson(result.survey_summary_json, {}),
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
    } : null,
    secondary_prescription: secondaryPrescription,
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

// ═══════════════════════════════════════════════════════════════
//  페이지 라우트
// ═══════════════════════════════════════════════════════════════
app.get('/', (c) => c.html(indexHtml))
app.get('/admin', (c) => c.html(adminHtml))
app.get('/admin/*', (c) => c.html(adminHtml))
app.get('/consultant', (c) => c.html(consultantHtml))
app.get('/consultant/*', (c) => c.html(consultantHtml))
app.get('/result/:id', (c) => c.html(resultHtml))

export default app
