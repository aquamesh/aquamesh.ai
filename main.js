/* AquaMesh — aquamesh.ai
   The hero figure is the deck's See → Predict → Act motif: scattered readings on
   the left, streamlines that dip, gather and converge, one line into a target.
   It draws a complete still frame first, animates only while on screen, and
   stays still for anyone who prefers reduced motion. */

(function () {
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var canvas = document.getElementById('flow');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var BLUE = '36,73,232';
  var W = 0, H = 0, lines = [], dots = [], target = null, conv = null, lens = null;
  var visible = true, raf = 0;

  function rng(seed) {
    var s = seed;
    return function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
  }
  function cubic(a, b, c, d, t) {
    var u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  }

  function build() {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Align the figure to the page's content column so it reads with the text.
    var wrap = Math.min(1160, W - 48);
    var L = Math.max(16, (W - wrap) / 2), span = W - 2 * L;
    function X(f) { return L + f * span; }
    var rand = rng(11);

    dots = [];
    var cols = Math.max(7, Math.round((span * 0.3) / 20)), rows = 7;
    for (var c = 0; c < cols; c++) {
      for (var k = 0; k < rows; k++) {
        if (rand() < 0.3) continue;
        var fx = c / (cols - 1);
        dots.push({
          x: X(fx * 0.3) + (rand() - 0.5) * 10,
          y: H * (0.26 + (k / (rows - 1)) * 0.4) + (rand() - 0.5) * 12,
          a: (0.25 + rand() * 0.6) * (0.3 + fx * 0.7),
          r: 1.1 + rand() * 1.3,
          ph: rand() * Math.PI * 2
        });
      }
    }

    var n = W < 640 ? 10 : 15;
    var cy = H * 0.38;
    conv = { x: X(0.76), y: cy };
    target = { x: X(0.94), y: cy };
    lens = { x: X(0.53), y: H * 0.8, rx: span * 0.12, ry: H * 0.1 };
    lines = [];
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1);
      var sx = X(0.2 + rand() * 0.11), sy = H * (0.28 + t * 0.36);
      var trough = H * (0.8 + (t - 0.5) * 0.1);
      var mx = X(0.53 + (rand() - 0.5) * 0.03);
      lines.push({
        a: [[sx, sy], [X(0.37), sy + (trough - sy) * 0.05], [X(0.44), trough], [mx, trough]],
        b: [[mx, trough], [X(0.63), trough], [X(0.66), cy], [conv.x, cy]],
        w: 0.9 + rand() * 0.8,
        alpha: 0.2 + rand() * 0.3,
        speed: 0.04 + rand() * 0.03,
        off: rand()
      });
    }
  }

  function at(line, u) {
    var s = u < 0.55 ? line.a : line.b;
    var t = u < 0.55 ? u / 0.55 : (u - 0.55) / 0.45;
    return [cubic(s[0][0], s[1][0], s[2][0], s[3][0], t), cubic(s[0][1], s[1][1], s[2][1], s[3][1], t)];
  }

  function draw(ms) {
    var t = ms / 1000, still = reduce.matches;
    ctx.clearRect(0, 0, W, H);

    // Where the readings gather: a faint lens under the trough.
    var g = ctx.createRadialGradient(lens.x, lens.y, 0, lens.x, lens.y, lens.rx);
    g.addColorStop(0, 'rgba(' + BLUE + ',0.13)');
    g.addColorStop(1, 'rgba(' + BLUE + ',0)');
    ctx.save();
    ctx.translate(lens.x, lens.y);
    ctx.scale(1, lens.ry / lens.rx);
    ctx.translate(-lens.x, -lens.y);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(lens.x, lens.y, lens.rx, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var tw = still ? 1 : 0.65 + 0.35 * Math.sin(t * 0.9 + d.ph);
      ctx.fillStyle = 'rgba(' + BLUE + ',' + (d.a * tw).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
    }

    for (var j = 0; j < lines.length; j++) {
      var ln = lines[j];
      ctx.strokeStyle = 'rgba(' + BLUE + ',' + ln.alpha + ')';
      ctx.lineWidth = ln.w;
      ctx.beginPath();
      ctx.moveTo(ln.a[0][0], ln.a[0][1]);
      ctx.bezierCurveTo(ln.a[1][0], ln.a[1][1], ln.a[2][0], ln.a[2][1], ln.a[3][0], ln.a[3][1]);
      ctx.bezierCurveTo(ln.b[1][0], ln.b[1][1], ln.b[2][0], ln.b[2][1], ln.b[3][0], ln.b[3][1]);
      ctx.stroke();
    }

    // One decision out of many readings: the shared line and its arrow.
    var tip = target.x - 30;
    ctx.strokeStyle = 'rgba(' + BLUE + ',0.9)';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(conv.x, conv.y); ctx.lineTo(tip, conv.y);
    ctx.moveTo(tip, conv.y); ctx.lineTo(tip - 8, conv.y - 5);
    ctx.moveTo(tip, conv.y); ctx.lineTo(tip - 8, conv.y + 5);
    ctx.stroke();

    if (!still) {
      for (var p = 0; p < lines.length; p++) {
        var l2 = lines[p];
        for (var q = 0; q < 2; q++) {
          var u = (t * l2.speed + l2.off + q * 0.5) % 1;
          var pt = at(l2, u);
          ctx.fillStyle = 'rgba(' + BLUE + ',' + (0.3 + 0.55 * Math.sin(Math.PI * u)).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(pt[0], pt[1], 1.9, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    // The target: halo rings and a slow pulse.
    ctx.fillStyle = 'rgba(' + BLUE + ',0.06)';
    ctx.beginPath(); ctx.arc(target.x, target.y, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(' + BLUE + ',0.14)';
    ctx.beginPath(); ctx.arc(target.x, target.y, 18, 0, Math.PI * 2); ctx.fill();
    if (!still) {
      var ph = (t % 2.6) / 2.6;
      ctx.strokeStyle = 'rgba(' + BLUE + ',' + (0.35 * (1 - ph)).toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(target.x, target.y, 10 + ph * 32, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = '#2449e8';
    ctx.beginPath(); ctx.arc(target.x, target.y, 8, 0, Math.PI * 2); ctx.fill();
  }

  function loop(ms) {
    draw(ms);
    raf = visible && !reduce.matches ? requestAnimationFrame(loop) : 0;
  }
  function restart() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    build();
    draw(performance.now());
    if (visible && !reduce.matches) raf = requestAnimationFrame(loop);
  }

  restart();
  if ('ResizeObserver' in window) new ResizeObserver(restart).observe(canvas);
  else window.addEventListener('resize', restart);
  if (reduce.addEventListener) reduce.addEventListener('change', restart);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !raf && !reduce.matches) raf = requestAnimationFrame(loop);
    }).observe(canvas);
  }
})();
