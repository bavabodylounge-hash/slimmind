/* =========================================================
   SlimMind Service Worker  v1.0
   - Static / HTML  → Cache First  (오프라인 지원)
   - API (/api/*)   → Network First (최신 데이터 우선)
   ========================================================= */

const CACHE_NAME = 'slimmind-v1';

/* 앱 설치 시 반드시 캐시할 파일 목록 */
const PRE_CACHE = [
  '/',
  '/result-hospital.html',
  '/slimmind-today.html',
  '/manifest.json',
  '/static/baba_logo.png',
  '/static/style.css'
];

/* ── Install: 필수 파일 프리캐시 ── */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRE_CACHE.map(function (url) {
        return new Request(url, { cache: 'reload' });
      })).catch(function (err) {
        /* 일부 파일 미존재 시 조용히 무시하고 설치 계속 */
        console.warn('[SW] pre-cache 일부 실패 (무시됨):', err);
      });
    })
  );
  /* 구버전 SW 대기 없이 즉시 활성화 */
  self.skipWaiting();
});

/* ── Activate: 구버전 캐시 삭제 ── */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ── Fetch: 전략 분기 ── */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);

  /* 같은 오리진만 처리 (외부 CDN 등 제외) */
  if (url.origin !== location.origin) return;

  /* POST / PUT / DELETE → 캐시 없이 네트워크 그대로 */
  if (req.method !== 'GET') return;

  /* API 요청 → Network First */
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(req));
    return;
  }

  /* Static / HTML → Cache First */
  e.respondWith(cacheFirst(req));
});

/* ── Network First ── */
function networkFirst(req) {
  return fetch(req)
    .then(function (res) {
      if (res && res.ok) {
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(req, clone); });
      }
      return res;
    })
    .catch(function () {
      return caches.match(req);
    });
}

/* ── Cache First ── */
function cacheFirst(req) {
  return caches.match(req).then(function (cached) {
    if (cached) return cached;
    return fetch(req).then(function (res) {
      if (res && res.ok) {
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(req, clone); });
      }
      return res;
    });
  });
}
