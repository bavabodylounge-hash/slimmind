module.exports = {
  apps: [
    // ── 1. 메인 서버 (wrangler pages dev) ──────────────────────
    {
      name: 'slimmind',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=7ed6c475-8afa-4ef8-9af8-8fab0cf8224b-db --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    },

    // ── 2. 자동 빌드 감시기 ────────────────────────────────────
    // public/*.html / src/index.tsx 변경 시 자동 빌드 → 서버 재시작
    // → result-v4.html, index.html, admin.html, consultant.html, b2b.html
    //    수정하면 빌드 없이 저장만 해도 서버에 즉시 반영됨
    {
      name: 'watch-build',
      script: 'scripts/watch-build.sh',
      interpreter: 'bash',
      watch: false,
      autorestart: true,
      instances: 1,
      exec_mode: 'fork',
      log_file: 'logs/watch-build.log',
      error_file: 'logs/watch-build-error.log'
    }
  ]
}
