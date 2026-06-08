import { Hono } from 'hono'
import indexHtml from '../public/index.html?raw'
import surveyDataJs from '../public/survey-data.js?raw'

const app = new Hono()

// 설문 결과 저장 API
app.post('/api/survey/submit', async (c) => {
  const body = await c.req.json()
  const result_id = `RES-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`
  return c.json({
    success: true,
    result_id,
    message: '설문이 제출되었습니다.',
    bc_primary: body.bc_primary || 'TBD',
    created_at: new Date().toISOString()
  })
})

// survey-data.js 서빙
app.get('/survey-data.js', (c) => {
  return c.body(surveyDataJs, 200, { 'Content-Type': 'application/javascript; charset=utf-8' })
})

// 메인 → index.html
app.get('/', (c) => {
  return c.html(indexHtml)
})

export default app
