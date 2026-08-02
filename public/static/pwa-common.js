/* =========================================================
   SlimMind PWA Common v2.0  (2026-08-01)
   ─────────────────────────────────────────────────────────
   [A] PWA 세션 자동 복원  — localStorage 기반 즉시 리다이렉트
   [B] UA 감지 PWA 설치 안내 모달 — 5케이스 분기
       Case1: iOS 카카오톡 인앱
       Case2: iOS Safari
       Case3: Android 카카오톡 인앱
       Case4: Android Chrome (beforeinstallprompt)
       Case5: PC Chrome/Edge/Whale
   [C] Service Worker 등록 (v2.0)
   [D] 웹푸시 구독 — VAPID + 서버 저장 + D+28 start_date 기록
   ========================================================= */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────
     [A] PWA 세션 자동 복원
         PWA standalone 모드 진입 시 localStorage의
         sm_last_result_id + sm_survey_category를 읽어
         해당 결과지로 즉시 이동.
         ※ 이미 결과지 페이지에 있으면 동작 안 함.
  ───────────────────────────────────────────────────── */
  (function sessionRestore() {
    try {
      var isStandalone = (
        window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches
      );
      if (!isStandalone) return;

      var lastId   = localStorage.getItem('sm_last_result_id') || '';
      var category = localStorage.getItem('sm_survey_category') || 'hospital';

      if (!lastId) return;

      /* 이미 결과지에 있으면 리다이렉트 불필요 */
      var path = location.pathname;
      if (
        path.indexOf('/result-hospital/') === 0 ||
        path.indexOf('/result-aesthetic/') === 0 ||
        path.indexOf('/result/') === 0
      ) return;

      /* 카테고리에 따라 결과지 URL 결정 */
      var targetUrl = (category === 'aesthetic')
        ? '/result-aesthetic/' + lastId
        : '/result-hospital/' + lastId;

      location.replace(targetUrl);
    } catch (e) { /* 무시 */ }
  })();

  /* ─────────────────────────────────────────────────────
     환경 감지
     ※ iOS 카카오 인앱에서 safari- 스킴으로 Safari로 이동한 경우
        UA는 이미 Safari UA로 바뀌어 있으므로
        sessionStorage 플래그(sm_from_kakao)를 결과지 페이지에서
        주입해 두면 이 쪽에서 읽어 Case 1로 올바르게 분기한다.
  ───────────────────────────────────────────────────── */
  var ua          = navigator.userAgent || '';
  // ?_kref=1 파라미터: iOS 카카오 인앱에서 safari- 스킴으로 강제 오픈될 때 URL에 추가됨
  // sessionStorage와 달리 새로고침 후에도 URL에 남아있어 카카오 경유를 지속 인식 가능
  var isKakao     = /KAKAOTALK/i.test(ua) ||
                    (function() {
                      try {
                        return new URLSearchParams(location.search).get('_kref') === '1';
                      } catch(e) { return false; }
                    })();
  var isIOS       = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  var isAndroid   = /Android/.test(ua);
  var isSafari    = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
  var isChrome    = /Chrome/.test(ua) && !/Chromium/.test(ua);
  var isEdge      = /Edg\//.test(ua);
  var isWhale     = /Whale\//.test(ua);
  var isPC        = !isIOS && !isAndroid;
  var isStandalone = (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );

  /* 이미 설치된 상태면 설치 안내 불필요 */
  var _skipModal = isStandalone;

  /* ─────────────────────────────────────────────────────
     공통 스타일 인젝션
  ───────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('pwa-common-style')) return;
    var s = document.createElement('style');
    s.id  = 'pwa-common-style';
    s.textContent = [
      /* ── 상단 배너 (Android Chrome 원클릭) ── */
      '#pwa-banner{position:fixed;bottom:0;left:0;right:0;z-index:99999;',
      'background:#fff;box-shadow:0 -2px 16px rgba(0,0,0,.18);',
      'padding:14px 16px 20px;display:flex;align-items:center;gap:12px;',
      'font-family:"Noto Sans KR",sans-serif;animation:pwa-slide-up .35s ease;}',
      '#pwa-banner .pwa-icon{width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0;}',
      '#pwa-banner .pwa-text{flex:1;min-width:0;}',
      '#pwa-banner .pwa-text strong{display:block;font-size:14px;color:#1a1a17;margin-bottom:2px;}',
      '#pwa-banner .pwa-text span{font-size:12px;color:#7c776b;line-height:1.4;}',
      '#pwa-banner .pwa-btn{flex-shrink:0;background:#5a6e3a;color:#fff;',
      'border:none;border-radius:8px;padding:9px 16px;font-size:13px;',
      'font-weight:700;cursor:pointer;white-space:nowrap;}',
      '#pwa-banner .pwa-close{flex-shrink:0;background:none;border:none;',
      'color:#aaa;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;}',

      /* ── 바텀시트 모달 (iOS/Android 안내) ── */
      '#pwa-modal-overlay{position:fixed;inset:0;z-index:100000;',
      'background:rgba(0,0,0,.6);display:flex;align-items:flex-end;',
      'animation:pwa-fade-in .25s ease;}',
      '#pwa-modal{background:#fff;border-radius:22px 22px 0 0;',
      'padding:28px 20px 40px;width:100%;max-width:480px;margin:0 auto;',
      'font-family:"Noto Sans KR",sans-serif;animation:pwa-slide-up .3s ease;}',
      '#pwa-modal .pwa-modal-title{font-size:18px;font-weight:700;',
      'margin-bottom:6px;color:#1a1a17;}',
      '#pwa-modal .pwa-modal-desc{font-size:13px;color:#888;margin-bottom:18px;line-height:1.5;}',
      '#pwa-modal .pwa-step{display:flex;align-items:flex-start;gap:12px;',
      'margin-bottom:14px;font-size:14px;color:#333;line-height:1.5;}',
      '#pwa-modal .pwa-num{width:26px;height:26px;min-width:26px;background:#5a6e3a;',
      'color:#fff;border-radius:50%;display:flex;align-items:center;',
      'justify-content:center;font-size:12px;font-weight:700;}',
      '#pwa-modal .pwa-modal-close{width:100%;margin-top:14px;padding:14px;',
      'background:#f2f2f2;border:none;border-radius:12px;font-size:15px;',
      'font-weight:600;color:#666;cursor:pointer;}',

      /* ── 상단 노란 툴팁 (카카오톡 인앱) ── */
      '#pwa-kakao-tip{position:fixed;top:0;left:0;right:0;z-index:100001;',
      'background:#FEE500;padding:13px 16px;display:flex;align-items:center;',
      'gap:10px;font-family:"Noto Sans KR",sans-serif;',
      'box-shadow:0 2px 12px rgba(0,0,0,.15);}',
      '#pwa-kakao-tip span{flex:1;font-size:13px;color:#1a1a17;line-height:1.5;}',
      '#pwa-kakao-tip button{background:none;border:none;font-size:18px;',
      'cursor:pointer;color:#555;padding:0;}',

      /* ── PC 모달 ── */
      '#pwa-pc-overlay{position:fixed;inset:0;z-index:100000;',
      'background:rgba(0,0,0,.55);display:flex;align-items:center;',
      'justify-content:center;animation:pwa-fade-in .25s ease;}',
      '#pwa-pc-modal{background:#fff;border-radius:20px;',
      'padding:32px 28px 28px;max-width:400px;width:90%;',
      'font-family:"Noto Sans KR",sans-serif;box-shadow:0 8px 40px rgba(0,0,0,.2);}',
      '#pwa-pc-modal .pwa-modal-title{font-size:18px;font-weight:700;',
      'margin-bottom:6px;color:#1a1a17;}',
      '#pwa-pc-modal .pwa-modal-desc{font-size:13px;color:#888;margin-bottom:18px;line-height:1.5;}',
      '#pwa-pc-modal .pwa-step{display:flex;align-items:flex-start;gap:12px;',
      'margin-bottom:14px;font-size:14px;color:#333;line-height:1.5;}',
      '#pwa-pc-modal .pwa-num{width:26px;height:26px;min-width:26px;background:#5a6e3a;',
      'color:#fff;border-radius:50%;display:flex;align-items:center;',
      'justify-content:center;font-size:12px;font-weight:700;}',
      '#pwa-pc-modal .pwa-modal-close{width:100%;margin-top:14px;padding:13px;',
      'background:#f2f2f2;border:none;border-radius:12px;font-size:15px;',
      'font-weight:600;color:#666;cursor:pointer;}',

      /* ── 애니메이션 ── */
      '@keyframes pwa-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}',
      '@keyframes pwa-fade-in{from{opacity:0}to{opacity:1}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────
     [C] Service Worker 등록 (v2.0)
  ───────────────────────────────────────────────────── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          /* SW 업데이트 감지 시 자동 skipWaiting */
          reg.addEventListener('updatefound', function () {
            var newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', function () {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        })
        .catch(function (err) {
          /* SW 등록 실패는 조용히 무시 */
          void err;
        });
    });
  }

  /* ─────────────────────────────────────────────────────
     [D] 웹푸시 구독 + D+28 start_date 기록
  ───────────────────────────────────────────────────── */
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(function (reg) {
      reg.pushManager.getSubscription().then(function (existing) {
        if (existing) {
          sendSubToServer(existing);
          return;
        }
        Notification.requestPermission().then(function (perm) {
          if (perm !== 'granted') return;
          fetch('/api/push/vapid-public')
            .then(function (r) { return r.json(); })
            .then(function (data) {
              return reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(data.publicKey)
              });
            })
            .then(function (sub) {
              sendSubToServer(sub);
            })
            .catch(function () { /* 구독 실패 무시 */ });
        });
      });
    }).catch(function () { /* SW 미준비 무시 */ });
  }

  function sendSubToServer(sub) {
    try {
      var subJson = sub.toJSON();
      var keys    = subJson.keys || {};

      /* D+28 start_date — 최초 구독 시점만 저장 */
      var startDate = localStorage.getItem('sm_pwa_start_date');
      if (!startDate) {
        startDate = new Date().toISOString();
        try { localStorage.setItem('sm_pwa_start_date', startDate); } catch(e) {}
      }

      /* slimmind_meta_ 에서 최신 sid 탐색 */
      var _meta = {};
      var _sid  = '';
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.startsWith('slimmind_meta_')) {
            var v = JSON.parse(localStorage.getItem(k) || '{}');
            if (!_meta.savedAt || (v.savedAt && v.savedAt > _meta.savedAt)) {
              _meta = v;
              _sid  = k.replace('slimmind_meta_', '');
            }
          }
        }
        if (!_sid) _sid = localStorage.getItem('slimmind_sid') || 'anon';
      } catch(e) {}

      var resultId = localStorage.getItem('sm_last_result_id') || _sid || 'anon';

      fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id:       resultId,
          endpoint:         subJson.endpoint,
          p256dh:           keys.p256dh   || '',
          auth:             keys.auth     || '',
          bc_code:          _meta.bcCode  || _meta.bc_primary || null,
          consultant_code:  _meta.ref_code || null,
          b2b_code:         _meta.b2b_code || null,
          user_agent:       navigator.userAgent.slice(0, 200),
          pwa_start_date:   startDate
        })
      }).catch(function () { /* 전송 실패 무시 */ });
    } catch (e) { /* 무시 */ }
  }

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var raw     = window.atob(base64);
    var out     = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) { out[i] = raw.charCodeAt(i); }
    return out;
  }

  /* ─────────────────────────────────────────────────────
     [B] UA 감지 기반 PWA 설치 안내
         이미 standalone이면 표시 안 함
  ───────────────────────────────────────────────────── */
  if (_skipModal) return; /* 이미 설치된 상태 */

  /* ── 딜레이 후 케이스별 표시 ── */
  var SHOW_DELAY = 3000; /* 3초 후 */

  window.addEventListener('DOMContentLoaded', function () {
    injectStyles();

    /* ── Case 1: iOS 카카오톡 인앱 브라우저 ── */
    if (isIOS && isKakao) {
      setTimeout(showIOSKakaoTip, SHOW_DELAY);
      return;
    }

    /* ── Case 2: iOS 표준 Safari ── */
    if (isIOS && isSafari) {
      setTimeout(showIOSSafariModal, SHOW_DELAY);
      return;
    }

    /* ── Case 3: Android 카카오톡 인앱 브라우저 ── */
    if (isAndroid && isKakao) {
      setTimeout(showAndroidKakaoTip, SHOW_DELAY);
      return;
    }

    /* ── Case 4: Android Chrome — beforeinstallprompt 연동 ── */
    if (isAndroid && !isKakao) {
      window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        _deferredPrompt = e;
        setTimeout(showAndroidChromeBanner, 1500);
      });
      return;
    }

    /* ── Case 5: PC (Chrome / Edge / Whale) ── */
    if (isPC) {
      /* beforeinstallprompt 지원 시 버튼 제공, 미지원 시 수동 안내 */
      var _pcInstallShown = false;
      window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        _deferredPrompt = e;
        if (!_pcInstallShown) {
          _pcInstallShown = true;
          setTimeout(showPCModal, SHOW_DELAY);
        }
      });
      /* 지원 여부와 무관하게 수동 안내도 함께 표시 */
      setTimeout(function () {
        if (!_pcInstallShown) {
          _pcInstallShown = true;
          showPCModal();
        }
      }, SHOW_DELAY);
      return;
    }
  });

  var _deferredPrompt = null;

  /* ════════════════════════════════════════════════════
     모달/팁 렌더 함수
  ════════════════════════════════════════════════════ */

  /* Case 1: iOS 카카오톡 → Safari 경유 (5단계) */
  function showIOSKakaoTip() {
    if (document.getElementById('pwa-modal-overlay')) return;
    var overlay = document.createElement('div');
    overlay.id = 'pwa-modal-overlay';
    overlay.innerHTML =
      '<div id="pwa-modal">' +
        '<div class="pwa-modal-title">📲 홈 화면에 앱으로 저장</div>' +
        '<div class="pwa-modal-desc">나의 결과지를 언제든 바로 열 수 있어요.</div>' +

        '<div class="pwa-step">' +
          '<div class="pwa-num">1</div>' +
          '<div>화면 <b>오른쪽 하단 [···]</b> 버튼을 탭하세요</div>' +
        '</div>' +
        '<div class="pwa-step">' +
          '<div class="pwa-num">2</div>' +
          '<div><b>[공유]</b> 버튼을 탭하세요</div>' +
        '</div>' +
        '<div class="pwa-step">' +
          '<div class="pwa-num">3</div>' +
          '<div>우측 하단 <b>[더보기]</b>를 탭하세요</div>' +
        '</div>' +
        '<div class="pwa-step">' +
          '<div class="pwa-num">4</div>' +
          '<div><b>[홈 화면에 추가]</b>를 탭하세요</div>' +
        '</div>' +
        '<div class="pwa-step">' +
          '<div class="pwa-num">5</div>' +
          '<div>바탕화면에 생긴 <b>아이콘을 눌러</b> 앱을 실행합니다</div>' +
        '</div>' +

        '<button class="pwa-modal-close" id="pwa-modal-close-btn">닫기</button>' +
      '</div>';

    document.body.appendChild(overlay);
    document.getElementById('pwa-modal-close-btn').addEventListener('click', function () {
      overlay.remove();
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  /* Case 2: iOS Safari */
  function showIOSSafariModal() {
    if (document.getElementById('pwa-modal-overlay')) return;
    var overlay = document.createElement('div');
    overlay.id = 'pwa-modal-overlay';
    overlay.innerHTML =
      '<div id="pwa-modal">' +
        '<div class="pwa-modal-title">📲 홈 화면에 앱으로 저장</div>' +
        '<div class="pwa-modal-desc">나의 결과지를 언제든 바로 열 수 있어요.</div>' +

        '<div class="pwa-step">' +
          '<div class="pwa-num">1</div>' +
          '<div>Safari <b>하단 가운데 공유 아이콘</b> <span style="font-size:16px">⬆</span> 을 탭하세요</div>' +
        '</div>' +
        '<div class="pwa-step">' +
          '<div class="pwa-num">2</div>' +
          '<div>스크롤 후 <b>[홈 화면에 추가]</b>를 탭하세요</div>' +
        '</div>' +
        '<div class="pwa-step">' +
          '<div class="pwa-num">3</div>' +
          '<div>오른쪽 위 <b>[추가]</b> 버튼을 탭하면 완료!</div>' +
        '</div>' +

        '<button class="pwa-modal-close" id="pwa-modal-close-btn">닫기</button>' +
      '</div>';

    document.body.appendChild(overlay);
    document.getElementById('pwa-modal-close-btn').addEventListener('click', function () {
      overlay.remove();
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  /* Case 3: Android 카카오톡 인앱 */
  function showAndroidKakaoTip() {
    if (document.getElementById('pwa-kakao-tip')) return;
    var tip = document.createElement('div');
    tip.id  = 'pwa-kakao-tip';
    tip.innerHTML =
      '<span>' +
        '📲 <b>앱으로 저장하려면</b> 오른쪽 상단 <b>⋯</b> →' +
        ' <b>다른 브라우저(Chrome)로 열기</b> → 홈 화면 추가' +
      '</span>' +
      '<button id="pwa-kakao-close">✕</button>';
    document.body.insertBefore(tip, document.body.firstChild);
    document.getElementById('pwa-kakao-close').addEventListener('click', function () {
      tip.remove();
    });
  }

  /* Case 4: Android Chrome — beforeinstallprompt */
  function showAndroidChromeBanner() {
    if (!_deferredPrompt) return;
    if (document.getElementById('pwa-banner')) return;
    injectStyles();

    var banner = document.createElement('div');
    banner.id = 'pwa-banner';
    banner.innerHTML =
      '<img class="pwa-icon" src="/static/baba_logo.png" alt="SlimMind" ' +
      'onerror="this.style.display=\'none\'">' +
      '<div class="pwa-text">' +
        '<strong>슬림마인드 앱으로 저장</strong>' +
        '<span>결과지를 홈 화면에 저장해 언제든 바로 열기</span>' +
      '</div>' +
      '<button class="pwa-btn" id="pwa-install-btn">설치</button>' +
      '<button class="pwa-close" id="pwa-close-btn">✕</button>';
    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', function () {
      banner.remove();
      _deferredPrompt.prompt();
      _deferredPrompt.userChoice.then(function () {
        _deferredPrompt = null;
      });
    });
    document.getElementById('pwa-close-btn').addEventListener('click', function () {
      banner.remove();
    });
  }

  /* Case 5: PC Chrome/Edge/Whale */
  function showPCModal() {
    if (document.getElementById('pwa-pc-overlay')) return;
    injectStyles();

    /* 브라우저별 안내 문구 분기 */
    var browserName = isEdge ? 'Edge' : (isWhale ? 'Whale' : 'Chrome');
    var hasPrompt   = !!_deferredPrompt;

    var overlay = document.createElement('div');
    overlay.id = 'pwa-pc-overlay';

    var stepsHtml;
    if (hasPrompt) {
      /* beforeinstallprompt 지원 — 버튼 원클릭 */
      stepsHtml =
        '<div class="pwa-step">' +
          '<div class="pwa-num">1</div>' +
          '<div>아래 <b>[PC에 앱 설치]</b> 버튼을 클릭하세요</div>' +
        '</div>';
    } else {
      /* 수동 안내 */
      stepsHtml =
        '<div class="pwa-step">' +
          '<div class="pwa-num">1</div>' +
          '<div>' + browserName + ' 주소창 오른쪽 <b>앱 설치(⊕) 아이콘</b>을 클릭하세요</div>' +
        '</div>' +
        '<div class="pwa-step">' +
          '<div class="pwa-num">2</div>' +
          '<div>또는 오른쪽 상단 <b>⋮ 메뉴</b> → <b>[저장 및 공유]</b> → <b>[바로가기 만들기]</b></div>' +
        '</div>' +
        '<div class="pwa-step">' +
          '<div class="pwa-num">3</div>' +
          '<div><b>[설치]</b> 또는 <b>[추가]</b>를 클릭하면 바탕화면에 앱이 생성됩니다</div>' +
        '</div>';
    }

    var installBtn = hasPrompt
      ? '<button id="pwa-pc-install-btn" style="width:100%;margin-top:4px;padding:13px;' +
        'background:#5a6e3a;border:none;border-radius:12px;font-size:15px;' +
        'font-weight:700;color:#fff;cursor:pointer;">PC에 앱 설치</button>'
      : '';

    overlay.innerHTML =
      '<div id="pwa-pc-modal">' +
        '<div class="pwa-modal-title">🖥️ 바탕화면 앱으로 저장</div>' +
        '<div class="pwa-modal-desc">슬림마인드 결과지를 바탕화면에서 바로 열 수 있어요.</div>' +
        stepsHtml +
        installBtn +
        '<button class="pwa-modal-close" id="pwa-pc-close-btn">닫기</button>' +
      '</div>';

    document.body.appendChild(overlay);

    if (hasPrompt) {
      document.getElementById('pwa-pc-install-btn').addEventListener('click', function () {
        overlay.remove();
        _deferredPrompt.prompt();
        _deferredPrompt.userChoice.then(function () {
          _deferredPrompt = null;
        });
      });
    }

    document.getElementById('pwa-pc-close-btn').addEventListener('click', function () {
      overlay.remove();
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
  }

})();
