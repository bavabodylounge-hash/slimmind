/* =========================================================
   SlimMind PWA Install Helper  v1.1
   ─ 카카오 인앱브라우저 → "외부 브라우저로 열기" 툴팁
   ─ iOS Safari       → "홈 화면에 추가" 안내 모달
   ─ Android Chrome   → BeforeInstallPrompt 원클릭 배너
   ─ 웹푸시 구독      → SW 등록 후 알림 권한 요청 + 서버 저장
   ========================================================= */
(function () {
  'use strict';

  /* ── 환경 감지 ── */
  var ua         = navigator.userAgent || '';
  var isKakao    = /KAKAOTALK/i.test(ua);
  var isIOS      = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  var isAndroid  = /Android/.test(ua);
  var isSafari   = /Safari/.test(ua) && !/Chrome/.test(ua);
  var isStandalone = (window.navigator.standalone === true)
                  || window.matchMedia('(display-mode: standalone)').matches;

  /* 이미 설치된 상태면 아무것도 표시 안 함 */
  if (isStandalone) return;

  /* ── 공통 스타일 인젝션 ── */
  var style = document.createElement('style');
  style.textContent = [
    '#pwa-banner{position:fixed;bottom:0;left:0;right:0;z-index:99999;',
    'background:#fff;box-shadow:0 -2px 16px rgba(0,0,0,.18);',
    'padding:14px 16px 18px;display:flex;align-items:center;gap:12px;',
    'font-family:"Noto Sans KR",sans-serif;animation:slideUp .35s ease;}',

    '#pwa-banner .pwa-icon{width:48px;height:48px;border-radius:12px;',
    'object-fit:cover;flex-shrink:0;}',

    '#pwa-banner .pwa-text{flex:1;min-width:0;}',
    '#pwa-banner .pwa-text strong{display:block;font-size:14px;color:#1a1a17;margin-bottom:2px;}',
    '#pwa-banner .pwa-text span{font-size:12px;color:#7c776b;line-height:1.4;}',

    '#pwa-banner .pwa-btn{flex-shrink:0;background:#5a6e3a;color:#fff;',
    'border:none;border-radius:8px;padding:9px 16px;font-size:13px;',
    'font-weight:700;cursor:pointer;white-space:nowrap;}',

    '#pwa-banner .pwa-close{flex-shrink:0;background:none;border:none;',
    'color:#aaa;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;}',

    /* iOS 모달 */
    '#pwa-modal-overlay{position:fixed;inset:0;z-index:100000;',
    'background:rgba(0,0,0,.55);display:flex;align-items:flex-end;}',
    '#pwa-modal{background:#fff;border-radius:20px 20px 0 0;',
    'padding:24px 20px 36px;width:100%;font-family:"Noto Sans KR",sans-serif;',
    'animation:slideUp .3s ease;}',
    '#pwa-modal h3{font-size:17px;font-weight:700;margin-bottom:8px;color:#1a1a17;}',
    '#pwa-modal p{font-size:14px;color:#555;line-height:1.7;margin-bottom:16px;}',
    '#pwa-modal .pwa-step{display:flex;align-items:flex-start;gap:10px;',
    'margin-bottom:12px;font-size:14px;color:#333;}',
    '#pwa-modal .pwa-step .pwa-num{width:24px;height:24px;background:#5a6e3a;',
    'color:#fff;border-radius:50%;display:flex;align-items:center;',
    'justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}',
    '#pwa-modal .pwa-modal-close{width:100%;margin-top:8px;padding:13px;',
    'background:#f0f0f0;border:none;border-radius:12px;font-size:15px;',
    'font-weight:600;color:#555;cursor:pointer;}',

    /* 카카오 툴팁 */
    '#pwa-kakao-tip{position:fixed;top:0;left:0;right:0;z-index:100000;',
    'background:#FEE500;padding:14px 16px;display:flex;align-items:center;',
    'gap:10px;font-family:"Noto Sans KR",sans-serif;',
    'box-shadow:0 2px 12px rgba(0,0,0,.15);}',
    '#pwa-kakao-tip span{flex:1;font-size:13px;color:#1a1a17;line-height:1.5;}',
    '#pwa-kakao-tip button{background:none;border:none;font-size:20px;',
    'cursor:pointer;color:#555;padding:0;}',

    '@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}'
  ].join('');
  document.head.appendChild(style);

  /* ── Service Worker 등록 ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          console.log('[SW] 등록 성공:', reg.scope);
        })
        .catch(function (err) {
          console.warn('[SW] 등록 실패:', err);
        });
    });
  }

  /* ============================================================
     1. 카카오 인앱브라우저 감지 → 상단 노란 툴팁
  ============================================================ */
  if (isKakao) {
    window.addEventListener('DOMContentLoaded', function () {
      var tip = document.createElement('div');
      tip.id = 'pwa-kakao-tip';
      tip.innerHTML = [
        '<span>',
        '📲 <b>앱으로 저장하려면</b> 우측 상단 <b>⋯</b> 메뉴 →',
        ' <b>다른 브라우저로 열기</b>를 눌러주세요',
        '</span>',
        '<button onclick="document.getElementById(\'pwa-kakao-tip\').remove()">✕</button>'
      ].join('');
      document.body.insertBefore(tip, document.body.firstChild);
    });
    return; /* 카카오는 여기서 종료 */
  }

  /* ============================================================
     2. iOS Safari → 홈 화면 추가 안내 모달 (3초 딜레이)
  ============================================================ */
  if (isIOS && isSafari) {
    window.addEventListener('DOMContentLoaded', function () {
      setTimeout(showIOSModal, 3000);
    });
    return;
  }

  /* ============================================================
     3. Android Chrome → BeforeInstallPrompt 원클릭 배너
  ============================================================ */
  var deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    window.addEventListener('DOMContentLoaded', function () {
      setTimeout(showAndroidBanner, 1500);
    });
    /* DOMContentLoaded 이미 지난 경우 */
    if (document.readyState !== 'loading') {
      setTimeout(showAndroidBanner, 1500);
    }
  });

  /* ── iOS 모달 표시 ── */
  function showIOSModal() {
    var overlay = document.createElement('div');
    overlay.id = 'pwa-modal-overlay';
    overlay.innerHTML = [
      '<div id="pwa-modal">',
      '<h3>📲 홈 화면에 앱으로 저장하기</h3>',
      '<p>나의 바디코드 결과지를 언제든 바로 열 수 있어요.</p>',

      '<div class="pwa-step">',
      '<div class="pwa-num">1</div>',
      '<div>Safari 하단 가운데 <b>공유 버튼</b> <span style="font-size:18px">⬆️</span> 을 탭하세요</div>',
      '</div>',

      '<div class="pwa-step">',
      '<div class="pwa-num">2</div>',
      '<div>스크롤해서 <b>"홈 화면에 추가"</b> 를 탭하세요</div>',
      '</div>',

      '<div class="pwa-step">',
      '<div class="pwa-num">3</div>',
      '<div>오른쪽 위 <b>"추가"</b> 버튼을 탭하면 완료!</div>',
      '</div>',

      '<button class="pwa-modal-close" onclick="document.getElementById(\'pwa-modal-overlay\').remove()">',
      '닫기',
      '</button>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  /* ── Android 배너 표시 ── */
  function showAndroidBanner() {
    if (!deferredPrompt) return;
    if (document.getElementById('pwa-banner')) return;

    var banner = document.createElement('div');
    banner.id = 'pwa-banner';
    banner.innerHTML = [
      '<img class="pwa-icon" src="/static/baba_logo.png" alt="SlimMind" ',
      'onerror="this.style.display=\'none\'">',
      '<div class="pwa-text">',
      '<strong>슬림마인드 앱으로 저장</strong>',
      '<span>결과지를 홈 화면에 저장해 언제든 바로 열기</span>',
      '</div>',
      '<button class="pwa-btn" id="pwa-install-btn">설치</button>',
      '<button class="pwa-close" id="pwa-close-btn">✕</button>'
    ].join('');
    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', function () {
      banner.remove();
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (res) {
        console.log('[PWA] 설치 선택:', res.outcome);
        deferredPrompt = null;
      });
    });

    document.getElementById('pwa-close-btn').addEventListener('click', function () {
      banner.remove();
    });
  }

  /* ============================================================
     4. 웹푸시 구독 — SW 등록 완료 후 알림 권한 요청
  ============================================================ */
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    /* SW 등록이 완료된 시점에 구독 시도 */
    navigator.serviceWorker.ready.then(function (reg) {
      /* 이미 구독돼 있으면 서버에 재전송만 */
      reg.pushManager.getSubscription().then(function (existing) {
        if (existing) {
          sendSubToServer(existing);
          return;
        }
        /* 알림 권한이 없으면 사용자에게 묻기 */
        Notification.requestPermission().then(function (perm) {
          if (perm !== 'granted') return;
          fetch('/api/push/vapid-public')
            .then(function (r) { return r.json(); })
            .then(function (data) {
              var appServerKey = urlBase64ToUint8Array(data.publicKey);
              return reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: appServerKey
              });
            })
            .then(function (sub) {
              sendSubToServer(sub);
            })
            .catch(function (err) {
              console.warn('[push] 구독 실패:', err);
            });
        });
      });
    });
  }

  /* 구독 정보를 서버로 전송 */
  function sendSubToServer(sub) {
    try {
      var subJson  = sub.toJSON();
      var keys     = subJson.keys || {};
      var _meta    = {};
      try { _meta = JSON.parse(localStorage.getItem('slimmind_meta_') || '{}'); } catch(e){}
      var _sid     = _meta.session_id || localStorage.getItem('slimmind_sid') || 'anon';

      fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id:       _sid,
          endpoint:         subJson.endpoint,
          p256dh:           keys.p256dh   || '',
          auth:             keys.auth     || '',
          bc_code:          _meta.bcCode  || _meta.bc_primary || null,
          consultant_code:  _meta.ref_code || null,
          b2b_code:         _meta.b2b_code || null,
          user_agent:       navigator.userAgent.slice(0, 200)
        })
      }).catch(function (e) { console.warn('[push] 서버 전송 실패:', e); });
    } catch (e) {
      console.warn('[push] sendSubToServer 오류:', e);
    }
  }

  /* VAPID 공개키 변환 헬퍼 */
  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var raw     = window.atob(base64);
    var output  = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; ++i) { output[i] = raw.charCodeAt(i); }
    return output;
  }

})();
