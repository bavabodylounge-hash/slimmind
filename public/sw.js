/* =========================================================
   SlimMind Service Worker  v2.3  (2026-08-18)
   ─────────────────────────────────────────────────────────
   v2.3 변경:
   - [FIX] CACHE_NAME slimmind-v3 → slimmind-v4
     타로/구버전 앱 캐시 완전 파기 (activate에서 ALL 삭제)
   - [FIX] activate 단계에서 caches.keys() 전체 삭제
     CACHE_NAME 불일치 여부 무관하게 모든 캐시 제거
   v2.2 변경:
   - [FIX] CACHE_NAME slimmind-v2 → slimmind-v3
   - [FIX] 파일 최상단 self.skipWaiting() 즉시 실행
   v2.1 변경:
   - [FIX] Vary:* 헤더 포함 응답 cache.put() 차단
   - [FIX] networkFirst / cacheFirst null 반환 방지
   - [FIX] FetchEvent promise rejection 완전 억제
   ─────────────────────────────────────────────────────────
   - 캐시명 slimmind-v4 (v1·v2·v3 자동 삭제)
   - HTML/API → Network First (캐시 무효화 강화)
   - Static   → Cache First  (오프라인 지원)
   - Push     → 알림 표시
   - NotificationClick → 오늘탭 이동
   ========================================================= */

/* ── 즉시 skipWaiting: 새 SW 설치 즉시 대기 없이 활성화 ── */
self.skipWaiting();

const CACHE_NAME = 'slimmind-v4';

/* 앱 설치 시 프리캐시 목록 */
const PRE_CACHE = [
  '/static/baba_logo.png',
  '/static/pwa-common.js'
];

/* ── 캐시 저장 가능 여부 판단 ──────────────────────────────
   Vary: * 헤더가 있으면 cache.put()이 TypeError를 던진다.
   또한 opaque(cross-origin), error 응답도 저장 불가.
   ──────────────────────────────────────────────────────── */
function isCacheable(res) {
  if (!res || !res.ok) return false;
  // cross-origin opaque 응답 차단
  if (res.type !== 'basic' && res.type !== 'cors') return false;
  // Vary: * 헤더 차단 — 이 헤더가 있으면 cache.put()이 TypeError
  var vary = res.headers ? res.headers.get('Vary') : null;
  if (vary && vary.indexOf('*') !== -1) return false;
  return true;
}

/* ── 안전한 캐시 저장 ── */
function safeCachePut(cache, req, res) {
  try {
    if (isCacheable(res)) {
      cache.put(req, res.clone()).catch(function() {/* ignore */});
    }
  } catch (_) { /* ignore */ }
}

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
  /* install 이벤트에서도 skipWaiting 재호출 (호환성) */
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

/* ── Message: skipWaiting 지원 (레거시 호환) ── */
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ── Fetch ── */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url;
  try {
    url = new URL(req.url);
  } catch (_) { return; }

  if (url.origin !== location.origin) return;
  if (req.method !== 'GET') return;

  /* cdn-cgi/* 는 완전히 패스스루 (캐시 없음) */
  if (url.pathname.startsWith('/cdn-cgi/')) return;

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

/* ── Network First ──────────────────────────────────────────
   [FIX v2.1]
   1. cache.put()을 safeCachePut()으로 교체 → Vary:* 차단
   2. fetch 실패 시 caches.match() null일 수 있음 → 404 Response 반환
   3. 전체를 try-catch로 감싸 promise rejection 완전 억제
   ──────────────────────────────────────────────────────────── */
function networkFirst(req) {
  return fetch(req.clone()).then(function (res) {
    if (res) {
      caches.open(CACHE_NAME).then(function (c) {
        safeCachePut(c, req, res);
      }).catch(function() {/* ignore */});
    }
    return res;
  }).catch(function () {
    return caches.match(req).then(function(cached) {
      /* 캐시도 없으면 오프라인 응답 — null 반환 방지 */
      return cached || new Response('Network error — offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }).catch(function() {
      return new Response('Network error — offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    });
  });
}

/* ── Cache First ──────────────────────────────────────────
   [FIX v2.1]
   1. safeCachePut() 사용
   2. fetch 실패 / null 반환 방지
   ────────────────────────────────────────────────────────── */
function cacheFirst(req) {
  return caches.match(req).then(function (cached) {
    if (cached) return cached;
    return fetch(req).then(function (res) {
      if (res) {
        caches.open(CACHE_NAME).then(function (c) {
          safeCachePut(c, req, res);
        }).catch(function() {/* ignore */});
      }
      return res || new Response('Not found', { status: 404 });
    }).catch(function() {
      return new Response('Network error — offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    });
  }).catch(function() {
    return fetch(req).catch(function() {
      return new Response('Network error — offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
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
