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

/* ── Push: 알림 표시 ── */
self.addEventListener('push', function (e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch (_) {}

  var title   = data.title  || 'SlimMind';
  var options = {
    body:    data.body  || '오늘 미션을 확인해보세요 💪',
    icon:    data.icon  || '/static/baba_logo.png',
    badge:   data.badge || '/static/baba_logo.png',
    tag:     data.tag   || 'slimmind',
    data:    { url: data.url || '/slimmind-today.html' },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open',    title: '미션 확인' },
      { action: 'dismiss', title: '닫기' }
    ]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

/* ── NotificationClick: 알림 클릭 시 페이지 열기 ── */
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  if (e.action === 'dismiss') return;

  var targetUrl = (e.notification.data && e.notification.data.url)
    ? e.notification.data.url
    : '/slimmind-today.html';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes(targetUrl) && 'focus' in list[i]) {
          return list[i].focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
