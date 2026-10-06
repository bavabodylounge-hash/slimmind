import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

// ★ _routes.json 패치 플러그인
// 빌드 후 dist/_routes.json 을 정리하여 올바른 라우팅 보장
// 핵심 원칙:
//   - result-*.html → Worker가 /:id 패턴으로 처리 → exclude에서 반드시 제거
//   - survey-*.html, slimmind-today.html 등 → 정적 서빙 → exclude 유지
//   - result-*.html이 exclude에 있으면 Cloudflare가 308로 리다이렉트 →
//     Worker에 .html 라우트 없음 → 404 발생
function patchRoutesJson() {
  return {
    name: 'patch-routes-json',
    closeBundle() {
      const routesPath = path.resolve(__dirname, 'dist/_routes.json')
      if (!fs.existsSync(routesPath)) return

      const raw = fs.readFileSync(routesPath, 'utf-8')
      let routes: { version: number; include: string[]; exclude: string[] }
      try {
        routes = JSON.parse(raw)
      } catch {
        console.warn('[patch-routes-json] _routes.json 파싱 실패, 패치 건너뜀')
        return
      }

      // ─── Worker가 처리해야 하는 파일: exclude에서 반드시 제거 ───
      // result-*.html은 Worker가 /result-hospital/:id 등으로 서빙
      // exclude에 있으면 정적 서빙 → 308 redirect → 404 발생!
      // survey-*.html: Worker가 직접 차단(403) → clean URL도 Worker가 처리
      // exclude에 있으면 Cloudflare가 .html에 307 redirect → clean URL → 404
      const toRemove = [
        '/result-hospital.html',
        '/result-fitness.html',
        '/result-aesthetic.html',
        '/result-salon.html',
        '/result-v4.html',
        '/result.html',
        // survey HTML: Worker가 직접 처리(차단/라우팅) → exclude 제거
        '/survey-hospital.html',
        '/survey-hospital-3lang.html',
        '/survey-aesthetic.html',
        '/survey-fitness.html',
        '/survey-salon.html',
      ]

      // ─── 정적 서빙이 필요한 파일: exclude에 추가 ───
      const toAdd = [
        '/slimmind-today.html',
        '/admin.html',
        '/consultant.html',
        '/b2b.html',
      ]

      let patched = false

      // exclude에서 result-*.html 제거
      const before = routes.exclude.length
      routes.exclude = routes.exclude.filter(e => !toRemove.includes(e))
      if (routes.exclude.length < before) {
        patched = true
        const removed = before - routes.exclude.length
        console.log(`[patch-routes-json] ✅ result-*.html ${removed}개 exclude에서 제거 (Worker가 처리)`)
      }

      // 정적 서빙 파일 추가
      for (const entry of toAdd) {
        if (!routes.exclude.includes(entry)) {
          routes.exclude.push(entry)
          patched = true
          console.log(`[patch-routes-json] ✅ exclude 추가: ${entry}`)
        }
      }

      if (patched) {
        fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2))
        console.log('[patch-routes-json] _routes.json 패치 완료')
        console.log('[patch-routes-json] 최종 exclude:', routes.exclude)
      } else {
        console.log('[patch-routes-json] _routes.json 이미 최신 상태')
      }
    }
  }
}

export default defineConfig({
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    }),
    patchRoutesJson()
  ]
})
