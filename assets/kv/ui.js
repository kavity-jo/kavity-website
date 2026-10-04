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

  /* ── mega-menu pictures load only when the menu is first wanted ─────── */
  (function () {
    var done = false;
    function hydrate () {
      if (done) return; done = true;
      [].forEach.call(d.querySelectorAll('.mm-tile[data-bg]'), function (el) {
        el.style.backgroundImage = el.getAttribute('data-bg'); el.removeAttribute('data-bg');
      });
      [].forEach.call(d.querySelectorAll('.mm img[data-src]'), function (img) {
        img.src = img.getAttribute('data-src'); img.removeAttribute('data-src');
      });
    }
    var mm = d.getElementById('navMM'), bg = d.getElementById('burger');
    if (mm) ['pointerenter', 'focusin', 'touchstart'].forEach(function (ev) { mm.addEventListener(ev, hydrate, { once: true, passive: true }); });
    if (bg) bg.addEventListener('click', hydrate, { once: true });
  })();

  /* ── technical proposal form: composes an email or a WhatsApp message ── */
  [].forEach.call(d.querySelectorAll('form.kv-form'), function (f) {
    function val (n) { var el = f.elements[n]; return el ? (el.value || '').trim() : ''; }
    function stage () { var c = f.querySelector('input[name="stage"]:checked'); return c ? c.value : ''; }
    function lines () {
      return [
        ['Name', val('name')], ['Company', val('company')], ['Email', val('email')], ['Phone', val('phone')],
        ['Project', val('project')], ['System', val('system')], ['Stage', stage()]
      ].filter(function (r) { return r[1]; }).map(function (r) { return r[0] + ': ' + r[1]; })
        .concat(['', val('message')]).join('\n');
    }
    function check (req) {
      var first = null;
      req.forEach(function (n) {
        var el = f.elements[n]; if (!el) return;
        if (!el.checkValidity() || !el.value.trim()) { first = first || el; el.setAttribute('aria-invalid', 'true'); }
        else el.removeAttribute('aria-invalid');
      });
      if (first) { first.focus(); if (first.reportValidity) first.reportValidity(); }
      return !first;
    }
    var ok = f.querySelector('.kv-form-ok');
    if (ok && navigator.clipboard) {                         /* no mail app opened? copy the composed message instead */
      var cp = d.createElement('button'); cp.type = 'button'; cp.className = 'kv-copy'; cp.textContent = 'Copy the message';
      cp.addEventListener('click', function () {
        navigator.clipboard.writeText('To: info.jordan@kabrillc.com\n' + lines()).then(function () { cp.textContent = 'Copied ✓'; setTimeout(function () { cp.textContent = 'Copy the message'; }, 2200); });
      });
      ok.appendChild(d.createTextNode(' ')); ok.appendChild(cp);
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check(['name', 'email', 'message'])) return;
      var subj = 'Technical proposal request' + (val('project') ? ' — ' + val('project') : '');
      location.href = 'mailto:info.jordan@kabrillc.com?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines());
      f.classList.add('sent');
    });
    var wa = f.querySelector('[data-wa]');
    if (wa) wa.addEventListener('click', function () {
      if (!check(['name', 'message'])) return;            /* the reply comes on WhatsApp: no e-mail needed */
      window.open('https://wa.me/' + wa.getAttribute('data-wa') + '?text=' + encodeURIComponent('Technical proposal request\n' + lines()), '_blank', 'noopener');
    });
  });

  /* ── project lightbox ──────────────────────────────────────────────── */
  (function () {
    var cards = [].slice.call(d.querySelectorAll('.proj')).filter(function (c) { return !c.closest('.proj-rail'); });
    if (!cards.length) return;
    var lb = d.createElement('div'); lb.className = 'kv-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Project gallery');
    lb.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="x" type="button" aria-label="Close">✕</button><button class="pv" type="button" aria-label="Previous">‹</button><button class="nx" type="button" aria-label="Next">›</button>';
    d.body.appendChild(lb);
    var img = lb.querySelector('img'), cap = lb.querySelector('figcaption'), cur = 0, last = null;
    function vis () { return cards.filter(function (c) { return c.offsetParent !== null; }); }
    function show (i) {
      var list = vis(); if (!list.length) return;
      cur = (i + list.length) % list.length;
      var c = list[cur], im = c.querySelector('img'), b = c.querySelector('.proj-cap b'), s = c.querySelector('.proj-cap span');
      img.src = im.currentSrc || im.src; img.alt = im.alt;
      cap.innerHTML = (b ? b.innerHTML : '') + (s ? '<span>' + s.innerHTML + '</span>' : '');
    }
    function open (c) { last = d.activeElement; show(vis().indexOf(c)); lb.classList.add('on'); d.documentElement.style.overflow = 'hidden'; lb.querySelector('.x').focus(); }
    function close () { lb.classList.remove('on'); d.documentElement.style.overflow = ''; if (last) last.focus(); }
    cards.forEach(function (c) {
      c.classList.add('kv-zoomable'); c.tabIndex = 0; c.setAttribute('role', 'button');
      c.addEventListener('click', function () { open(c); });
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(c); } });
    });
    lb.querySelector('.x').addEventListener('click', close);
    lb.querySelector('.pv').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
    lb.querySelector('.nx').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') show(cur + 1); else if (e.key === 'ArrowLeft') show(cur - 1);
    });
  })();
})();

/* product range: filter chips */
(function(){
  document.querySelectorAll('.kvp').forEach(function(sec){
    var chips=sec.querySelectorAll('.kvp-chips button'), cards=sec.querySelectorAll('.kvp-card');
    chips.forEach(function(b){ b.addEventListener('click',function(){
      var g=b.getAttribute('data-g');
      chips.forEach(function(x){ x.classList.toggle('on',x===b); x.setAttribute('aria-pressed',x===b); });
      cards.forEach(function(c){ c.hidden = !(g==='*' || c.getAttribute('data-g')===g); });
    }); });
  });
})();

/* 3D viewer on demand: the photo stays until the visitor asks for 3D (keeps pages light) */
(function(){
  var host=document.querySelector('[data-kv3d]'); if(!host) return;
  var me=document.getElementById('kv-ui-js'), base=me?new URL(me.getAttribute('src'),location.href).href.replace(/ui\.js.*$/,''):'';
  var url=base+'product3d.js?v=c08e805a';
  var b=document.createElement('button'); b.type='button'; b.className='kv3d-open';
  b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 2.8 20.5 7.5v9L12 21.2 3.5 16.5v-9z"/><path d="M3.5 7.5 12 12.2l8.5-4.7M12 12.2v9"/></svg><span><b>Explore in 3D</b><small>Rotate · exploded view · key data</small></span>';
  host.appendChild(b);
  var pre=false; function prefetch(){ if(pre) return; pre=true; var l=document.createElement('link'); l.rel='modulepreload'; l.href=url; document.head.appendChild(l); }
  b.addEventListener('pointerenter',prefetch); b.addEventListener('focus',prefetch);
  b.addEventListener('click',function(){ host.classList.add('kv3v-loading'); b.disabled=true;
    import(url).then(function(){ b.remove(); }).catch(function(){ host.classList.remove('kv3v-loading'); b.disabled=false; }); });
})();

/* Copies of the site on other domains get a notice pointing to the official site (a banner, never a redirect).
   If KAVITY moves to its own domain, add it to OFFICIAL. */
(function(){
  var OFFICIAL=['kavity-jo.github.io','localhost','127.0.0.1',''];
  var h=location.hostname;
  if(OFFICIAL.indexOf(h)>=0||/\.translate\.goog$/.test(h)||location.protocol==='file:') return;
  var b=document.createElement('div');
  b.className='kv-copy-note'; b.setAttribute('role','note');
  b.innerHTML='This is not the official KAVITY website. The official site is <a href="https://kavity-jo.github.io/kavity-website/">kavity-jo.github.io/kavity-website</a> · <a href="mailto:info.jordan@kabrillc.com">info.jordan@kabrillc.com</a>';
  document.body.insertBefore(b,document.body.firstChild);
})();

/* ── PROJECTS v2 · page — projects.html: filters with counts and FLIP
   transitions, accessible gallery (<dialog>, keyboard, swipe, thumbnails),
   deep links (#via-amman). Does nothing when .kvpj is absent. ── */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function isRtl (el) { return getComputedStyle(el).direction === 'rtl'; }
  function svg (p, w) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 2) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }
  var I = {
    prev: svg('<path d="M15 18l-6-6 6-6"/>', 2.2),
    next: svg('<path d="M9 18l6-6-6-6"/>', 2.2),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>', 2.2),
    stack: svg('<rect x="3" y="6" width="14" height="12" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v10"/>', 2),
    open: svg('<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>', 2)
  };
  function txt (root, sel) { var el = root.querySelector(sel); return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }

  /* ── gallery: native <dialog>, keyboard, swipe, thumbnails ────────── */
  var gallery = null;
  function Gallery () {
    var dlg = d.createElement('dialog');
    dlg.className = 'kvlb';
    dlg.setAttribute('aria-labelledby', 'kvlb-title');
    dlg.innerHTML =
      '<div class="kvlb-in">' +
        '<div class="kvlb-top"><span class="kvlb-idx" aria-hidden="true"></span>' +
          '<button type="button" class="kvlb-btn kvlb-x" aria-label="Close">' + I.close + '</button></div>' +
        '<div class="kvlb-stage"><img class="kvlb-img" alt="" draggable="false"></div>' +
        '<div class="kvlb-cap">' +
          '<button type="button" class="kvlb-btn kvlb-pv" aria-label="Previous photo">' + I.prev + '</button>' +
          '<div class="kvlb-txt" aria-live="polite"><h2 id="kvlb-title"></h2><p></p></div>' +
          '<button type="button" class="kvlb-btn kvlb-nx" aria-label="Next photo">' + I.next + '</button>' +
        '</div>' +
        '<div class="kvlb-thumbs" role="group" aria-label="All photos"></div>' +
      '</div>';
    d.body.appendChild(dlg);
    var img = dlg.querySelector('.kvlb-img'), stage = dlg.querySelector('.kvlb-stage'),
        idx = dlg.querySelector('.kvlb-idx'), ttl = dlg.querySelector('#kvlb-title'), sub = dlg.querySelector('.kvlb-txt p'),
        thumbs = dlg.querySelector('.kvlb-thumbs'), bx = dlg.querySelector('.kvlb-x'),
        pv = dlg.querySelector('.kvlb-pv'), nx = dlg.querySelector('.kvlb-nx');
    var items = [], cur = 0, token = 0, isOpen = false, opener = null, moved = false;

    function pad (n) { return (n < 10 ? '0' : '') + n; }
    function collect (cards) {
      items = [];
      cards.forEach(function (c) {
        c._kvlb = items.length;
        var title = c._kvTitle || txt(c, 'h3'), list = (c.getAttribute('data-photos') || '').split(';')
          .map(function (s) { return s.trim(); }).filter(Boolean);
        if (!list.length) { var im = c.querySelector('img'); list = [(im ? im.getAttribute('src') : '') + '|' + txt(c, '.kvpj-meta')]; }
        list.forEach(function (entry) {
          var k = entry.split('|'), cap = (k[1] || '').trim();
          items.push({ src: k[0].trim(), title: title, sub: cap, alt: title + (cap ? ' — ' + cap : '') });
        });
      });
    }
    function buildThumbs () {
      thumbs.textContent = '';
      items.forEach(function (it, i) {
        var b = d.createElement('button'), t = d.createElement('img');
        b.type = 'button'; b.className = 'kvlb-th';
        b.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + items.length + ': ' + it.alt);
        t.src = it.src; t.alt = ''; t.decoding = 'async'; t.draggable = false;
        b.appendChild(t);
        b.addEventListener('click', function () { if (i !== cur) show(i, i > cur ? 1 : -1); });
        thumbs.appendChild(b);
      });
      thumbs.hidden = items.length < 2;
      pv.hidden = nx.hidden = items.length < 2;
    }
    function meta () {
      var it = items[cur];
      idx.innerHTML = '<b>' + pad(cur + 1) + '</b> / ' + pad(items.length);
      ttl.textContent = it.title; sub.textContent = it.sub;
      [].forEach.call(thumbs.children, function (b, i) { b.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
      var a = thumbs.children[cur];
      if (a && thumbs.scrollWidth > thumbs.clientWidth) {
        thumbs.scrollTo({ left: a.offsetLeft - (thumbs.clientWidth - a.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      }
      [cur + 1, cur - 1].forEach(function (j) { var n = items[(j + items.length) % items.length]; if (n) { var p = new Image(); p.src = n.src; } });
    }
    function swap (it) { img.src = it.src; img.alt = it.alt; img.style.transform = ''; img.style.opacity = ''; }
    function show (i, dir, fromX) {
      var n = items.length; if (!n) return;
      cur = (i + n) % n;
      var it = items[cur], my = ++token;
      meta();
      var busy = img.getAnimations ? img.getAnimations().length : 0;
      if (img.getAnimations) img.getAnimations().forEach(function (a) { a.cancel(); });
      if (reduce || !img.animate) { swap(it); return; }
      var off = 64 * (dir || 1) * (isRtl(dlg) ? -1 : 1), x0 = fromX || 0,
          o0 = fromX ? Math.max(.35, 1 - Math.abs(fromX) / 700) : 1;
      var pre = new Image(); pre.src = it.src;
      var ready = pre.decode ? pre.decode().catch(function () {}) : Promise.resolve();
      var out = busy ? null : img.animate(
        [{ transform: 'translateX(' + x0 + 'px)', opacity: o0 }, { transform: 'translateX(' + (-off) + 'px)', opacity: 0 }],
        { duration: 170, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      Promise.all([out ? out.finished.catch(function () {}) : null, ready]).then(function () {
        if (my !== token) return;
        swap(it);
        if (out) out.cancel();
        img.animate([{ transform: 'translateX(' + off + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: 360, easing: 'cubic-bezier(.2,.7,.3,1)' });
      });
    }
    function open (cards, card, from) {
      collect(cards); buildThumbs();
      opener = from || d.activeElement;
      cur = card._kvlb || 0; token++;
      swap(items[cur]); meta();
      html.classList.add('kvlb-lock');
      if (typeof dlg.showModal === 'function') { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } }
      else dlg.setAttribute('open', '');
      isOpen = true;
      requestAnimationFrame(function () { requestAnimationFrame(function () { dlg.classList.add('is-on'); }); });
      bx.focus();
    }
    function cleanup () {
      html.classList.remove('kvlb-lock');
      if (opener && opener.focus) { try { opener.focus({ preventScroll: true }); } catch (e) { opener.focus(); } }
    }
    function close () {
      if (!isOpen) return; isOpen = false;
      dlg.classList.remove('is-on');
      setTimeout(function () {
        if (dlg.open) { if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open'); }
        cleanup();
      }, reduce ? 0 : 260);
    }
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('close', function () { if (isOpen) { isOpen = false; dlg.classList.remove('is-on'); cleanup(); } });
    bx.addEventListener('click', close);
    pv.addEventListener('click', function () { show(cur - 1, -1); });
    nx.addEventListener('click', function () { show(cur + 1, 1); });
    dlg.addEventListener('click', function (e) {
      if (moved) { moved = false; return; }
      var t = e.target;
      if (t === dlg || t === stage || (t.classList && (t.classList.contains('kvlb-in') || t.classList.contains('kvlb-top')))) close();
    });
    dlg.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape' && typeof dlg.showModal !== 'function') { close(); return; }
      var r = isRtl(dlg);
      if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + (r ? -1 : 1), r ? -1 : 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur + (r ? 1 : -1), r ? 1 : -1); }
      else if (e.key === 'Home') { e.preventDefault(); show(0, -1); }
      else if (e.key === 'End') { e.preventDefault(); show(items.length - 1, 1); }
    });
    /* swipe (touch, pen or mouse drag): the photo follows the finger */
    var p = null;
    stage.addEventListener('pointerdown', function (e) {
      if (items.length < 2 || (e.pointerType === 'mouse' && e.button !== 0)) return;
      p = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, on: false };
    });
    stage.addEventListener('pointermove', function (e) {
      if (!p || e.pointerId !== p.id) return;
      var mx = e.clientX - p.x, my = e.clientY - p.y;
      if (!p.on) {
        if (Math.abs(mx) < 8 || Math.abs(mx) < Math.abs(my)) return;
        p.on = true;
        try { stage.setPointerCapture(p.id); } catch (_) {}
        if (img.getAnimations) img.getAnimations().forEach(function (a) { a.cancel(); });
      }
      p.dx = mx;
      img.style.transform = 'translateX(' + mx + 'px)';
      img.style.opacity = String(Math.max(.35, 1 - Math.abs(mx) / 700));
    });
    function up (e) {
      if (!p || e.pointerId !== p.id) return;
      var q = p; p = null;
      if (!q.on) return;
      moved = true; setTimeout(function () { moved = false; }, 0);
      var v = Math.abs(q.dx) / Math.max(1, performance.now() - q.t), r = isRtl(dlg) ? -1 : 1;
      img.style.transform = ''; img.style.opacity = '';
      if (Math.abs(q.dx) > 60 || (v > .45 && Math.abs(q.dx) > 20)) {
        var fwd = (q.dx < 0 ? 1 : -1) * r;
        show(cur + fwd, fwd, q.dx);
      } else if (img.animate && !reduce) {
        img.animate([{ transform: 'translateX(' + q.dx + 'px)' }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.7,.3,1)' });
      }
    }
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    return { open: open };
  }

  /* ── projects page ─────────────────────────────────────────────────── */
  (function () {
    var root = d.querySelector('.kvpj'), grid = root && root.querySelector('.kvpj-grid');
    if (!grid) return;
    var cards = [].slice.call(grid.querySelectorAll('.kvpj-card'));
    var chips = [].slice.call(root.querySelectorAll('.kvpj-filters button[data-market]'));
    var count = root.querySelector('.kvpj-count');
    if (!cards.length) return;
    function matches (c, m) { return m === 'all' || c.getAttribute('data-market') === m; }
    function nPhotos (c) { return (c.getAttribute('data-photos') || '').split(';').filter(function (s) { return s.trim(); }).length || 1; }
    function label (n, m) { return m === 'all' ? n + (n === 1 ? ' project' : ' projects') : n + ' of ' + cards.length + ' projects'; }

    cards.forEach(function (c) {
      var n = nPhotos(c), media = c.querySelector('.kvpj-media'), btn = c.querySelector('.kvpj-open');
      c._kvTitle = txt(c, 'h3');
      if (media) {
        if (n > 1) {
          var b = d.createElement('span'); b.className = 'kvpj-badge'; b.setAttribute('aria-hidden', 'true');
          b.innerHTML = I.stack + '<span>' + n + '</span>'; media.appendChild(b);
        }
        var v = d.createElement('span'); v.className = 'kvpj-view'; v.setAttribute('aria-hidden', 'true');
        v.innerHTML = I.open + '<span>' + (n > 1 ? 'View ' + n + ' photos' : 'View photo') + '</span>'; media.appendChild(v);
      }
      if (btn) {
        btn.setAttribute('aria-haspopup', 'dialog');
        var vh = d.createElement('span'); vh.className = 'kvpj-vh';
        vh.textContent = n > 1 ? ', view ' + n + ' photos' : ', view photo';
        btn.appendChild(vh);
        btn.addEventListener('click', function () {
          gallery = gallery || Gallery();
          gallery.open(cards.filter(function (x) { return !x.hidden; }), c, btn);
        });
      }
    });

    /* filters: counts, then fade-out → re-flow (FLIP) → fade-in */
    var pending = null;
    chips.forEach(function (b) {
      var m = b.getAttribute('data-market'), n = cards.filter(function (c) { return matches(c, m); }).length;
      var s = d.createElement('span'); s.className = 'kvpj-n'; s.textContent = n; b.appendChild(s);
      if (!n) b.hidden = true;
      b.addEventListener('click', function () { setFilter(m, true); });
    });
    function setFilter (m, animate) {
      if (pending) pending();
      chips.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-market') === m ? 'true' : 'false'); });
      if (count) count.textContent = label(cards.filter(function (c) { return matches(c, m); }).length, m);
      var shown = [].slice.call(grid.children).filter(function (el) { return !el.hidden; });
      var leaving = cards.filter(function (c) { return !c.hidden && !matches(c, m); });
      var entering = cards.filter(function (c) { return c.hidden && matches(c, m); });
      function commit () {
        leaving.forEach(function (c) { c.hidden = true; });
        entering.forEach(function (c) { c.hidden = false; });
      }
      if (!leaving.length && !entering.length) return;
      if (!animate || reduce || !grid.animate) { commit(); return; }
      var first = shown.map(function (el) { return el.getBoundingClientRect(); });
      var outs = [], done = false;
      pending = function () { if (done) return; done = true; outs.forEach(function (a) { a.cancel(); }); commit(); pending = null; };
      leaving.forEach(function (el) {
        outs.push(el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }],
          { duration: 180, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }));
      });
      Promise.all(outs.map(function (a) { return a.finished.catch(function () {}); })).then(function () {
        if (done) return;
        done = true; pending = null;
        commit();
        outs.forEach(function (a) { a.cancel(); });
        shown.forEach(function (el, i) {
          if (el.hidden) return;
          var f = first[i], l = el.getBoundingClientRect(), dx = f.left - l.left, dy = f.top - l.top;
          if (Math.abs(dx) > .5 || Math.abs(dy) > .5) {
            el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }],
              { duration: 560, easing: 'cubic-bezier(.2,.7,.3,1)' });
          }
        });
        entering.forEach(function (el, i) {
          el.animate([{ opacity: 0, transform: 'translateY(22px) scale(.98)' }, { opacity: 1, transform: 'none' }],
            { duration: 560, delay: 80 + i * 70, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' });
        });
      });
    }
    if (count) count.textContent = label(cards.length, 'all');

    /* cards stagger in the first time the grid is seen */
    if ('IntersectionObserver' in window && !reduce) {
      [].forEach.call(grid.children, function (el, i) { el.style.setProperty('--kvpj-i', Math.min(i, 6)); });
      root.classList.add('is-armed');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { root.classList.add('is-in'); io.disconnect(); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      io.observe(grid);
    }

    /* deep links from the homepage rail: projects.html#via-amman */
    function fromHash () {
      var id = ''; try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
      var c = id && d.getElementById(id);
      if (!c || cards.indexOf(c) < 0) return;
      if (c.hidden) setFilter('all', false);
      root.classList.add('is-in');
      setTimeout(function () {
        c.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
        c.classList.remove('is-hit'); void c.offsetWidth; c.classList.add('is-hit');
        setTimeout(function () { c.classList.remove('is-hit'); }, 3800);
      }, 60);
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
  })();
})();

/* ── PROJECTS v2 · rail — homepage "Completed projects": scroll-snap rail with
   mouse drag + thrown glide, gentle auto-advance (ring timer, pauses on hover,
   focus, off-screen, hidden tab; stops on any manual use), progress line,
   image parallax. Does nothing when .kvpr is absent. ── */
(function () {
  'use strict';
  var d = document;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function isRtl (el) { return getComputedStyle(el).direction === 'rtl'; }
  (function () {
    var sec = d.querySelector('.kvpr'), view = sec && sec.querySelector('.kvpr-view');
    if (!view) return;
    var track = sec.querySelector('.kvpr-track'),
        slides = [].slice.call(sec.querySelectorAll('.kvpr-slide')),
        prev = sec.querySelector('.kvpr-prev'), next = sec.querySelector('.kvpr-next'),
        play = sec.querySelector('.kvpr-play'), ring = sec.querySelector('.kvpr-ring-fg'),
        bar = sec.querySelector('.kvpr-bar'), thumb = sec.querySelector('.kvpr-thumb'),
        ctl = sec.querySelector('.kvpr-ctl');
    if (!slides.length) return;

    function max () { return Math.max(0, view.scrollWidth - view.clientWidth); }
    function now () { return Math.abs(view.scrollLeft); }
    function pos (i) {
      var a = slides[0], b = slides[i];
      return isRtl(view) ? (a.offsetLeft + a.offsetWidth) - (b.offsetLeft + b.offsetWidth) : b.offsetLeft - a.offsetLeft;
    }
    function to (x, smooth) {
      x = Math.max(0, Math.min(max(), x));
      view.scrollTo({ left: isRtl(view) ? -x : x, behavior: smooth && !reduce ? 'smooth' : 'auto' });
    }
    function nearest (x) {
      var best = 0, bd = Infinity;
      slides.forEach(function (s, i) { var dd = Math.abs(pos(i) - x); if (dd < bd) { bd = dd; best = i; } });
      return best;
    }
    function step (dir) {
      var x = now(), m = max(), i;
      if (dir > 0) { if (x >= m - 2) return false; for (i = 0; i < slides.length; i++) if (pos(i) > x + 4) { to(pos(i), true); return true; } }
      else { if (x <= 2) return false; for (i = slides.length - 1; i >= 0; i--) if (pos(i) < x - 4) { to(pos(i), true); return true; } to(0, true); return true; }
      return false;
    }

    /* paint: progress line, arrow states, image parallax */
    var raf = 0;
    function setDis (b, v) { if (b) b.setAttribute('aria-disabled', v ? 'true' : 'false'); }
    function paint () {
      raf = 0;
      var m = max(), x = now();
      if (bar && thumb) {
        var bw = bar.clientWidth, tw = Math.max(28, bw * view.clientWidth / Math.max(1, view.scrollWidth)),
            tx = m ? (bw - tw) * x / m : 0;
        thumb.style.width = tw + 'px';
        thumb.style.transform = 'translateX(' + (isRtl(view) ? -tx : tx).toFixed(1) + 'px)';
      }
      setDis(prev, x <= 2); setDis(next, x >= m - 2);
      sec.classList.toggle('is-static', m < 4);
      if (!reduce) {
        var vr = view.getBoundingClientRect(), c = vr.left + vr.width / 2;
        var rs = slides.map(function (s) { return s.getBoundingClientRect(); });
        slides.forEach(function (s, i) {
          var r = rs[i], k = Math.max(-1, Math.min(1, ((r.left + r.width / 2) - c) / vr.width));
          s.style.setProperty('--kvpr-px', (-k * r.width * .055).toFixed(1) + 'px');
        });
      }
    }
    function queue () { if (!raf) raf = requestAnimationFrame(paint); }
    view.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    if ('ResizeObserver' in window) new ResizeObserver(queue).observe(view);
    window.addEventListener('load', queue);

    /* auto-advance: the ring on the play button is the timer (CSS animation) */
    var auto = !reduce && slides.length > 1 && !!ring && !!play, user = false;
    var hold = { hover: false, focus: false, off: true, hidden: d.hidden, drag: false };
    function held () { for (var k in hold) if (hold[k]) return true; return false; }
    function sync () {
      sec.classList.toggle('is-auto', auto && !user);
      sec.classList.toggle('is-hold', held());
      if (play) {
        play.hidden = !auto;
        play.setAttribute('data-state', user ? 'paused' : 'playing');
        play.setAttribute('aria-label', user ? 'Play automatic scrolling' : 'Pause automatic scrolling');
      }
    }
    function restart () { sec.classList.remove('is-auto'); if (ring) void ring.getBoundingClientRect(); sync(); }
    function stopAuto () { if (auto && !user) { user = true; sync(); } }
    if (ring) ring.addEventListener('animationend', function (e) {
      if (e.animationName !== 'kvprTick' || !auto || user || held()) return;
      if (!step(1)) to(0, true);
      restart();
    });
    if (play) play.addEventListener('click', function () { user = !user; restart(); });
    [view, ctl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hold.hover = true; sync(); } });
      el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hold.hover = false; sync(); } });
    });
    view.addEventListener('focusin', function () { hold.focus = true; sync(); });
    view.addEventListener('focusout', function (e) { if (!view.contains(e.relatedTarget)) { hold.focus = false; sync(); } });
    d.addEventListener('visibilitychange', function () { hold.hidden = d.hidden; sync(); });
    view.addEventListener('touchstart', stopAuto, { passive: true });
    view.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) stopAuto(); }, { passive: true });

    /* arrows */
    if (prev) prev.addEventListener('click', function () { if (prev.getAttribute('aria-disabled') !== 'true') { stopAuto(); step(-1); } });
    if (next) next.addEventListener('click', function () { if (next.getAttribute('aria-disabled') !== 'true') { stopAuto(); step(1); } });

    /* keyboard: ←/→ move between cards when one has focus */
    view.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var s = d.activeElement && d.activeElement.closest ? d.activeElement.closest('.kvpr-slide') : null;
      if (!s) return;
      var j = slides.indexOf(s) + ((e.key === 'ArrowRight') !== isRtl(view) ? 1 : -1);
      if (j < 0 || j >= slides.length) return;
      e.preventDefault(); stopAuto();
      var a = slides[j].querySelector('a'); if (a) a.focus({ preventScroll: true });
      var r = slides[j].getBoundingClientRect(), vr = view.getBoundingClientRect(),
          edge = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      if (r.left < vr.left + edge - 1 || r.right > vr.right - 1) to(pos(j), true);
    });

    /* mouse drag with a thrown glide; touch keeps native momentum + snap */
    var g = null, moved = false;
    function settle (cb) {
      var t = 0, fin = false;
      function done () { if (fin) return; fin = true; clearTimeout(t); view.removeEventListener('scroll', on); cb(); }
      function on () { clearTimeout(t); t = setTimeout(done, 140); }
      view.addEventListener('scroll', on, { passive: true }); on();
      setTimeout(done, 1600);
    }
    view.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      g = { id: e.pointerId, x: e.clientX, s: now(), lx: e.clientX, lt: performance.now(), v: 0, on: false };
    });
    view.addEventListener('pointermove', function (e) {
      if (!g || e.pointerId !== g.id) return;
      var dx = e.clientX - g.x;
      if (!g.on) {
        if (Math.abs(dx) < 5) return;
        g.on = true; moved = true; stopAuto(); hold.drag = true; sync();
        view.classList.add('is-drag');
        try { view.setPointerCapture(g.id); } catch (_) {}
      }
      var x = g.s - dx * (isRtl(view) ? -1 : 1);
      view.scrollLeft = isRtl(view) ? -x : x;
      var t = performance.now(), dt = t - g.lt;
      if (dt > 0) { g.v = .75 * ((e.clientX - g.lx) / dt) + .25 * g.v; g.lx = e.clientX; g.lt = t; }
    });
    function endDrag (e) {
      if (!g || e.pointerId !== g.id) return;
      var q = g; g = null;
      if (!q.on) return;
      if (performance.now() - q.lt > 90) q.v = 0;          /* paused before letting go: no throw */
      view.classList.remove('is-drag'); view.classList.add('is-free');
      hold.drag = false;
      to(pos(nearest(now() - q.v * (isRtl(view) ? -1 : 1) * 260)), true);
      settle(function () { view.classList.remove('is-free'); sync(); });
      setTimeout(function () { moved = false; }, 0);
    }
    view.addEventListener('pointerup', endDrag);
    view.addEventListener('pointercancel', endDrag);
    view.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    view.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* entrance + pause while off-screen */
    if ('IntersectionObserver' in window) {
      if (!reduce) { slides.forEach(function (s, i) { s.style.setProperty('--kvpr-i', Math.min(i, 5)); }); sec.classList.add('is-armed'); }
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var on = e.isIntersecting && e.intersectionRatio >= .3;
          if (e.isIntersecting && !sec.classList.contains('is-in')) { sec.classList.add('is-in'); setTimeout(queue, 1700); }
          hold.off = !on; sync();
        });
      }, { threshold: [0, .3, .6] }).observe(view);
    } else hold.off = false;

    view.scrollLeft = 0;
    sync(); paint();
  })();
})();
/* PROJECTS v2 END */
