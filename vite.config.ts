import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

// ★ BUG-D3 수정: _routes.json 에 survey-salon.html exclude 추가 플러그인
// 빌드 후 dist/_routes.json 을 패치하여 /survey-salon.html 정적 직접 접근 허용
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

      const toAdd = [
        '/survey-salon.html',
        '/result-v4.html',
        '/result-aesthetic.html',
      ]
      let patched = false
      for (const entry of toAdd) {
        if (!routes.exclude.includes(entry)) {
          routes.exclude.push(entry)
          patched = true
          console.log(`[patch-routes-json] ✅ exclude 추가: ${entry}`)
        }
      }

      if (patched) {
        fs.writeFileSync(routesPath, JSON.stringify(routes))
        console.log('[patch-routes-json] _routes.json 패치 완료')
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
