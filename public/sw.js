/* =========================================================
   SlimMind Service Worker  v2.0  (2026-08-01)
   ─────────────────────────────────────────────────────────
   - 캐시명 slimmind-v2 (v1 자동 삭제)
   - HTML/API → Network First (캐시 무효화 강화)
   - Static   → Cache First  (오프라인 지원)
   - Push     → 알림 표시 (D+28 체크)
   - NotificationClick → 오늘탭 이동
   - skipWaiting 메시지 수신 지원
   ========================================================= */

const CACHE_NAME = 'slimmind-v2';

/* 앱 설치 시 프리캐시 목록 */
const PRE_CACHE = [
  '/static/baba_logo.png',
  '/static/pwa-common.js'
];

/* ── Install ── */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRE_CACHE.map(function (url) {
        return new Request(url, { cache: 'reload' });
      })).catch(function (err) {
        /* 일부 파일 미존재 시 무시 */
        void err;
      });
    })
  );
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

/* ── Message: skipWaiting 지원 ── */
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ── Fetch ── */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);

  if (url.origin !== location.origin) return;
  if (req.method !== 'GET') return;

  /* API + HTML 동적 라우트 → Network First (항상 최신 데이터) */
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/result-hospital/') ||
    url.pathname.startsWith('/result-aesthetic/') ||
    url.pathname.startsWith('/result/') ||
    url.pathname.startsWith('/h/') ||
    url.pathname.startsWith('/a/') ||
    url.pathname === '/'
  ) {
    e.respondWith(networkFirst(req));
    return;
  }

  /* Static 파일 → Cache First */
  e.respondWith(cacheFirst(req));
});

/* ── Network First ── */
function networkFirst(req) {
  return fetch(req.clone()).then(function (res) {
    if (res && res.ok && res.type === 'basic') {
      var clone = res.clone();
      caches.open(CACHE_NAME).then(function (c) { c.put(req, clone); });
    }
    return res;
  }).catch(function () {
    return caches.match(req);
  });
}

/* ── Cache First ── */
function cacheFirst(req) {
  return caches.match(req).then(function (cached) {
    if (cached) return cached;
    return fetch(req).then(function (res) {
      if (res && res.ok && res.type === 'basic') {
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(req, clone); });
      }
      return res;
    });
  });
}

/* ── Push: 알림 수신 ── */
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

/* ── NotificationClick: 오늘탭 이동 ── */
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  if (e.action === 'dismiss') return;

  var targetUrl = (e.notification.data && e.notification.data.url)
    ? e.notification.data.url
    : '/slimmind-today.html';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      /* 이미 열린 탭 포커스 */
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(targetUrl) !== -1 && 'focus' in list[i]) {
          return list[i].focus();
        }
      }
      /* 새 탭 열기 */
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
