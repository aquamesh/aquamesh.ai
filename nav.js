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

})();
