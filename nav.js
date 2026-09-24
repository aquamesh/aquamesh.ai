/* Mobile navigation + cookie notice. Loaded on every page. */
(function () {
  'use strict';

  /* ── Mobile menu ─────────────────────────────────────────── */
  var nav = document.querySelector('.nav-inner');
  if (nav) {
    var links = nav.querySelector('.nav-links');
    var cta = nav.querySelector('.btn-sm');
    if (links) {
      var btn = document.createElement('button');
      btn.className = 'nav-toggle';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Open menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span></span><span></span><span></span>';

      var panel = document.createElement('div');
      panel.className = 'nav-panel';
      panel.hidden = true;
      panel.appendChild(links.cloneNode(true));
      if (cta) {
        var c = cta.cloneNode(true);
        c.classList.remove('btn-sm');
        panel.appendChild(c);
      }

      nav.appendChild(btn);
      nav.parentNode.appendChild(panel);

      var open = function (state) {
        btn.setAttribute('aria-expanded', String(state));
        btn.setAttribute('aria-label', state ? 'Close menu' : 'Open menu');
        btn.classList.toggle('is-open', state);
        panel.hidden = !state;
        document.documentElement.classList.toggle('nav-open', state);
      };
      btn.addEventListener('click', function () {
        open(btn.getAttribute('aria-expanded') !== 'true');
      });
      panel.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') open(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') open(false);
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 820) open(false);
      });
    }
  }

  /* ── Cookie notice ───────────────────────────────────────── */
  var KEY = 'am-cookie-choice';
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) { stored = 'skip'; }
  if (stored) return;

  var prefix = /\/(case-studies|industries)\//.test(location.pathname) ? '../' : '';
  var bar = document.createElement('div');
  bar.className = 'cookie-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Cookie notice');
  bar.innerHTML =
    '<p>This site sets no tracking or advertising cookies. It stores one small item in your browser only to remember this choice, ' +
    'and loads fonts from Google, which receives your IP address. <a href="' + prefix + 'privacy.html">Privacy</a> · ' +
    '<a href="' + prefix + 'cookies.html">Cookies</a></p>' +
    '<div class="cookie-actions">' +
    '<button type="button" class="btn btn-sm" data-choice="accepted">Got it</button>' +
    '<button type="button" class="cookie-decline" data-choice="declined">Decline non-essential</button>' +
    '</div>';
  document.body.appendChild(bar);
  requestAnimationFrame(function () { bar.classList.add('is-in'); });

  bar.addEventListener('click', function (e) {
    var choice = e.target.getAttribute && e.target.getAttribute('data-choice');
    if (!choice) return;
    try { localStorage.setItem(KEY, choice); } catch (err) {}
    /* Nothing non-essential runs today. When analytics is added, gate it on
       localStorage.getItem('am-cookie-choice') === 'accepted'. */
    bar.classList.remove('is-in');
    setTimeout(function () { bar.remove(); }, 250);
  });
})();
