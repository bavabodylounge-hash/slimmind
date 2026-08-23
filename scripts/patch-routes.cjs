// scripts/patch-routes.cjs
// 빌드 후 _routes.json에 정적 파일 exclude 항목 추가
// ※ 실제 존재하는 파일만 등록 — 삭제된 구버전 파일 절대 포함 금지

const fs = require('fs')
const path = require('path')
const routesPath = path.join(__dirname, '../dist/_routes.json')

const r = JSON.parse(fs.readFileSync(routesPath, 'utf8'))

// index.html은 Worker가 처리하므로 exclude에서 제거
r.exclude = r.exclude.filter(e => e !== '/index.html')

// ── 현재 실제 존재하는 정적 파일만 등록 ──────────────────────────
const staticFiles = [
  // JS 엔진
  '/bc-engine.js',
  '/mapping-engine.js',
  '/survey-data.js',
  '/bc-definitions.js',
  // 설문지 (4개 업종 최신본)
  '/survey-hospital.html',
  '/survey-hospital-3lang.html',
  '/survey-aesthetic.html',
  '/survey-fitness.html',
  '/survey-salon.html',
  // 결과지 (4개 업종 최신본 + v4 공용)
  '/result-hospital.html',
  '/result-aesthetic.html',
  '/result-fitness.html',
  '/result-salon.html',
  '/result-v4.html',
  // 기타 서비스 페이지
  '/admin.html',
  '/b2b.html',
  '/consultant.html',
  '/slimmind-today.html',
  '/hospital_survey_mapping_spec_v2.html',
  '/favicon.svg',
  '/manifest.json',
  '/sw.js',
  // 디렉토리
  '/static/*',
  '/landing/*',
]

for (const entry of staticFiles) {
  if (!r.exclude.includes(entry)) r.exclude.push(entry)
}

// 삭제된 구버전 항목 제거
const removed = [
  '/result.html',
  '/result-v3.html',
  '/bodymap_preview.html',
  '/slimmind_live.html',
  '/slimmind_backend_mapping_v1.html',
]
r.exclude = r.exclude.filter(e => !removed.includes(e))

fs.writeFileSync(routesPath, JSON.stringify(r))
console.log('[patch-routes] _routes.json 최신화 완료:', r.exclude)
