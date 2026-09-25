/* KAVITY · UI layer (all pages) — theme toggle, spotlight cards,
   magnetic CTAs, image settle-in. Progressive: every feature is optional. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var KEY = 'kavity-theme';

  /* ── theme ─────────────────────────────────────────────────────────── */
  function store (v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function meta (dark) {
    var m = d.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', dark ? '#0B0C0E' : '#C8102E');
  }
  function apply (theme, animate) {
    var dark = theme === 'dark';
    if (animate && !reduce) {
      html.classList.add('kv-theming');
      clearTimeout(apply.t);
      apply.t = setTimeout(function () { html.classList.remove('kv-theming'); }, 520);
    }
    if (dark) html.setAttribute('data-theme', 'dark'); else html.removeAttribute('data-theme');
    meta(dark);
    var b = d.getElementById('kvTheme');
    if (b) {
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      label(b);
    }
  }
  function label (b) {
    var ar = html.lang === 'ar', dark = html.getAttribute('data-theme') === 'dark';
    var t = dark ? (ar ? 'الوضع الفاتح' : 'Light mode') : (ar ? 'الوضع الداكن' : 'Dark mode');
    b.setAttribute('aria-label', t); b.title = t;
  }

  var tools = d.querySelector('header .tools');
  if (tools) {
    var b = d.createElement('button');
    b.type = 'button'; b.id = 'kvTheme'; b.className = 'kv-theme';
    b.innerHTML =
      '<svg class="kv-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/></svg>' +
      '<svg class="kv-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>';
    var s = d.getElementById('sbtn');
    if (s && s.parentNode === tools) s.insertAdjacentElement('afterend', b);
    else tools.insertBefore(b, tools.firstChild);
    b.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      store(next);
      if (d.startViewTransition && !reduce) {
        var r = b.getBoundingClientRect();
        html.style.setProperty('--kv-ox', (r.left + r.width / 2) + 'px');
        html.style.setProperty('--kv-oy', (r.top + r.height / 2) + 'px');
        html.classList.add('kv-vt-theme');
        var vt = d.startViewTransition(function () { apply(next, false); });
        vt.finished.then(function () { html.classList.remove('kv-vt-theme'); }, function () { html.classList.remove('kv-vt-theme'); });
      } else apply(next, true);
    });
    new MutationObserver(function () { label(b); })
      .observe(html, { attributes: true, attributeFilter: ['lang'] });
  }
  apply(html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);

  /* ── spotlight on cards ────────────────────────────────────────────── */
  if (fine && !reduce) {
    var SPOT = '.sub-card,.prod,.rel,.cat,.card,.svc,.cc,.why-item,.svc-item,.feat';
    var SPOT_IMG = '.proj,.use';
    [].forEach.call(d.querySelectorAll(SPOT), function (el) { el.classList.add('kv-spot'); });
    [].forEach.call(d.querySelectorAll(SPOT_IMG), function (el) { el.classList.add('kv-spot', 'kv-spot--img'); });
    d.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.kv-spot');
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ── magnetic primary buttons ──────────────────────────────────────── */
  if (fine && !reduce) {
    var MAG = '.hero-actions .btn,.phero-cta .btn,.cta .btn,header .phone';
    [].forEach.call(d.querySelectorAll(MAG), function (el) {
      el.classList.add('kv-mag');
      var raf = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.classList.add('kv-mag--live');
          el.style.setProperty('--tx', (x * 6).toFixed(2) + 'px');
          el.style.setProperty('--ty', (y * 4).toFixed(2) + 'px');
        });
      });
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf);
        el.classList.remove('kv-mag--live');
        el.style.setProperty('--tx', '0px');
        el.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ── content images settle in as they decode (below the fold only) ─── */
  if (!reduce && 'IntersectionObserver' in window) {
    var vh = innerHeight;
    [].forEach.call(d.querySelectorAll('main img, section img, .sub-thumb img, .prod-img img, .rel-img img'), function (img) {
      if (img.complete && img.naturalWidth) return;
      if (img.getBoundingClientRect().top < vh) return;
      img.classList.add('kv-fade');
      var done = function () { img.classList.add('kv-in'); };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }
})();
