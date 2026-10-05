/* =========================================================
   SlimMind Service Worker  v3.1  (2026-10-05)
   ─────────────────────────────────────────────────────────
   v3.1 NUCLEAR: 모든 캐시 삭제 + 자기 자신 즉시 언레지스터
   v3.1 변경: 운동사진 1:1 정사각형·캐릭터 원형 cover·이름 개인화 수정 배포
   이 SW는 설치되자마자 모든 캐시를 삭제하고 스스로를 제거함.
   이후 새 페이지 로드는 항상 네트워크에서 직접 받음.
   ========================================================= */
const SW_VERSION = '3.1-20261005';

/* 즉시 활성화 */
self.skipWaiting();

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        return caches.delete(k);
      }));
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() {
      return self.clients.claim();
    }).then(function() {
      /* 모든 클라이언트에 캐시 삭제 완료 알림 */
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({ type: 'SW_CACHE_CLEARED' });
      });
      /* 자기 자신을 언레지스터 — 이후 SW 없이 동작 */
      return self.registration.unregister();
    })
  );
});

/* fetch: 캐시 없이 항상 네트워크 직접 접근 */
self.addEventListener('fetch', function(e) {
  /* 아무것도 하지 않음 — 브라우저 기본 네트워크 요청으로 fallthrough */
});
