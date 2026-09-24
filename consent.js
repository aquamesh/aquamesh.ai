/* AquaMesh — consent, Google Consent Mode v2, GPC, and GA4 loading.
   Loaded on every page, before analytics. One place to configure:      */
var AM_GA_ID = 'G-XXXXXXXXXX';   /* <-- paste your GA4 Measurement ID here */

(function () {
  'use strict';

  var KEY = 'am-consent';              /* 'granted' | 'denied' */
  var OPTOUT = 'am-optout-sale';       /* '1' when the CPRA opt-out is on */

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* Global Privacy Control. CPRA requires an opt-out preference signal to be
     treated as a valid request to opt out of sale/sharing, with no UI needed. */
  var gpc = navigator.globalPrivacyControl === true ||
            (navigator.doNotTrack === '1' && false); /* DNT is not a CPRA signal */
  if (gpc) set(OPTOUT, '1');

  var optedOut = get(OPTOUT) === '1';
  var choice = get(KEY);

  /* ── Consent Mode v2: everything denied until told otherwise ───────── */
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  window.amApplyConsent = function (state) {
    var analytics = (state === 'granted') ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: analytics,
      /* advertising stays denied on this site regardless, and is forced off
         by the CPRA opt-out as well */
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  };

  function loadGA() {
    if (AM_GA_ID.indexOf('XXXX') > -1) return;      /* not configured yet */
    if (document.getElementById('ga-src')) return;
    var s = document.createElement('script');
    s.id = 'ga-src';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + AM_GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', AM_GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false,          /* no cross-device / demographics */
      allow_ad_personalization_signals: false
    });
  }

  if (choice === 'granted' && !optedOut) {
    window.amApplyConsent('granted');
    loadGA();
  } else if (choice === 'denied' || optedOut) {
    window.amApplyConsent('denied');
    loadGA();   /* consent-mode pings only: no cookies, no identifiers */
  }

  /* ── Banner ────────────────────────────────────────────────────────── */
  if (choice || optedOut) return;

  var pre = /\/(case-studies|industries)\//.test(location.pathname) ? '../' : '';
  var bar = document.createElement('div');
  bar.className = 'cookie-bar';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-live', 'polite');
  bar.setAttribute('aria-label', 'Cookie consent');
  bar.innerHTML =
    '<p><b>We use analytics cookies.</b> They tell us which pages get read and where visitors arrive from. ' +
    'Nothing runs until you choose, and we do not use advertising cookies or sell your data. ' +
    '<a href="' + pre + 'cookies.html">Cookies</a> · <a href="' + pre + 'privacy.html">Privacy</a></p>' +
    '<div class="cookie-actions">' +
    '<button type="button" class="cookie-decline" data-consent="denied">Reject</button>' +
    '<button type="button" class="btn btn-sm" data-consent="granted">Accept</button>' +
    '</div>';
  document.body.appendChild(bar);
  requestAnimationFrame(function () { bar.classList.add('is-in'); });

  bar.addEventListener('click', function (e) {
    var v = e.target.getAttribute && e.target.getAttribute('data-consent');
    if (!v) return;
    set(KEY, v);
    window.amApplyConsent(v);
    loadGA();
    bar.classList.remove('is-in');
    setTimeout(function () { bar.remove(); }, 250);
  });
})();
