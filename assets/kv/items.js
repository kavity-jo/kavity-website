/* KAVITY · range & accessories panel for sub-product pages.
   Data: window.KV_ITEMS (items-data.js, generated from the Zoho Books item master). */
(function () {
  'use strict';
  var D = window.KV_ITEMS;
  var host = document.querySelector('[data-kv-fam]');
  if (!D || !host) return;
  var fam = D.fam[host.getAttribute('data-kv-fam')];
  if (!fam) return;
  var html = document.documentElement;
  var ar = function () { return html.lang === 'ar'; };
  var T = function (en, a) { return ar() ? a : en; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  /* keep dimension runs (150 × 60 × 280, M10 × 80) left-to-right inside Arabic */
  var bidi = function (s) {
    return esc(s).replace(/([A-Z]?\d[\d.]*(?:\s*(?:×|x|·)\s*[A-Z]?\d[\d.]*)+(?:\s*(?:mm|m|مم))?)/g, '<span class="kvr-ltr" dir="ltr">$1</span>');
  };
  var mm = function () { return T(' mm', ' مم'); };
  var kg = function () { return T(' kg', ' كغ'); };

  var ICON = {
    bolt: '<path d="M6 7h12v3H6z"/><path d="M10 10v10h4V10"/><path d="M10 13h4M10 16h4M10 19h4"/>',
    anchor: '<path d="M10 3h4v4h-4z"/><path d="M11 7h2v8h-2z"/><path d="M9 15h6l-1 6h-4z"/><path d="M9.5 17.5h5M9.8 19.5h4.4"/>',
    pin: '<circle cx="12" cy="9" r="3.2"/><path d="M12 3v18"/>',
    washer: '<rect x="5" y="5" width="14" height="14" rx="1.5"/><circle cx="12" cy="12" r="2.6"/><path d="M5 8.5h1.5M5 12h1.5M5 15.5h1.5M17.5 8.5H19M17.5 12H19M17.5 15.5H19"/>',
    rwasher: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.8"/>',
    nut: '<path d="M12 4l7 4v8l-7 4-7-4V8z"/><circle cx="12" cy="12" r="3"/>',
    rod: '<path d="M4 12h16"/><path d="M6 9l2 6M9 9l2 6M12 9l2 6M15 9l2 6"/>',
    channel: '<path d="M6 5h12v4h-3V8H9v8h6v-1h3v4H6z"/>',
    bracket: '<path d="M6 4v7h8v9"/><path d="M14 20h4"/>'
  };
  var icon = function (k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[k] || ICON.bolt) + '</svg>';
  };

  var COLS = {
    code: ['Item', 'الصنف'], size: ['Size', 'المقاس'], t: ['Thickness', 'السماكة'],
    prof: ['Section (mm)', 'المقطع (مم)'], w: ['Weight / pc', 'الوزن / قطعة'],
    bolt: ['Flat head bolt', 'البرغي المسطح'], stf: ['Stiffeners', 'التقويات'], feat: ['Type', 'النوع']
  };
  var gradeCls = function (g) {
    return /316/.test(g) ? 'g316' : /304/.test(g) ? 'g304' : /HDG|G90|alv/.test(g) ? 'ggal' : 'gother';
  };
  var gradeLabel = function (g) {
    if (/Galv/.test(g)) return T(g, 'مجلفن');
    if (/Pre-galv/.test(g)) return T(g, 'مجلفن مسبقًا');
    return g;
  };

  var state = { g: 0, grade: 'all', t: 'all', q: '', all: false, open: {} };
  var LIMIT = 12;

  function kitList (k, compact) {
    return k.map(function (x) {
      var a = D.acc[x.c];
      return '<li class="kvr-kit-i' + (compact ? ' sm' : '') + '">' +
        '<span class="kvr-ic">' + icon(a.ic) + '</span>' +
        (fam.kitQty === false ? '' : '<b class="kvr-q" dir="ltr">×' + x.q + '</b>') +
        '<span class="kvr-kt"><span class="kvr-kn">' + bidi(T(a.en, a.ar)) + '</span>' +
        '<span class="kvr-km"><i class="kvr-g ' + gradeCls(a.g) + '">' + esc(gradeLabel(a.g)) + '</i>' +
        (a.z ? '<i class="kvr-z">' + esc(a.z) + '</i>' : '') + '</span></span></li>';
    }).join('');
  }

  function cell (r, c, group) {
    if (c === 'code') {
      var label = r.feat ? T(r.feat.en, r.feat.ar) : group.one ? T(group.one.en, group.one.ar) : T(group.en, group.ar);
      return '<span class="kvr-code">' + (r.code ? '<b>' + esc(r.code) + '</b>' : '') +
        '<span>' + esc(r.code ? gradeLabel(r.g) : label) + '</span>' +
        (r.code ? '' : '<i class="kvr-g ' + gradeCls(r.g) + '">' + esc(gradeLabel(r.g)) + '</i>') + '</span>';
    }
    if (c === 'size') return '<span class="kvr-num" dir="ltr">' + esc(T(r.size, r.size.replace(/ cm$/, ' سم').replace(/ mm$/, ' مم').replace(/ m$/, ' م'))) + '</span>';
    if (c === 't') return r.t ? '<span class="kvr-num">' + r.t + mm() + '</span>' : '<span class="kvr-na">—</span>';
    if (c === 'prof') return r.prof ? '<span class="kvr-num kvr-prof" dir="ltr">' + esc(r.prof) + '</span>' : '<span class="kvr-na">—</span>';
    if (c === 'w') return r.w ? '<span class="kvr-num">' + esc(r.w) + kg() + '</span>' : '<span class="kvr-na">—</span>';
    if (c === 'bolt') {
      if (!r.bolt) return '<span class="kvr-na">' + esc(T('Per project', 'حسب المشروع')) + '</span>';
      var a = D.acc[r.bolt];
      return '<span class="kvr-num" dir="ltr">' + esc(a.en.replace(/^Flat head bolt /, '')) + '</span>';
    }
    if (c === 'stf') return r.stf ? '<span class="kvr-num">' + bidi(T(r.stf.en, r.stf.ar)) + '</span>' : '<span class="kvr-na">—</span>';
    if (c === 'feat') return r.feat ? bidi(T(r.feat.en, r.feat.ar)) : '<span class="kvr-na">—</span>';
    return '';
  }

  function colsFor (rows) {
    /* drop columns that are empty for the whole group */
    return fam.cols.filter(function (c) {
      if (c === 'code') return true;
      if (c === 'bolt') return rows.some(function (r) { return r.kit; });
      return rows.some(function (r) { return r[c] != null && r[c] !== ''; });
    });
  }

  function render () {
    var groups = fam.groups;
    var group = groups[Math.min(state.g, groups.length - 1)];
    var grades = [], thick = [];
    group.rows.forEach(function (r) {
      if (grades.indexOf(r.g) < 0) grades.push(r.g);
      if (r.t && thick.indexOf(r.t) < 0) thick.push(r.t);
    });
    thick.sort(function (a, b) { return a - b; });
    var q = state.q.trim().toLowerCase();
    var rows = group.rows.filter(function (r) {
      if (state.grade !== 'all' && r.g !== state.grade) return false;
      if (state.t !== 'all' && r.t !== state.t) return false;
      if (q && (r.code + ' ' + r.size + ' ' + (r.prof || '') + ' ' + (r.feat ? r.feat.en + ' ' + r.feat.ar : '')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var cols = colsFor(group.rows);
    var shown = state.all ? rows : rows.slice(0, LIMIT);
    var anyKit = group.rows.some(function (r) { return r.kit; });

    var h = '';
    h += '<div class="kvr-head"><div>' +
      '<span class="eyebrow">' + esc(T('Range & accessories', 'المقاسات والإكسسوارات')) + '</span>' +
      '<h2 class="display">' + esc(fam.kit ? T('Every size, and the kit that fixes it', 'كل مقاس، والطقم الذي يثبّته') : T('Stock range and sizes', 'المقاسات المتوفرة')) + '</h2></div>' +
      '<p class="lead">' + esc(T('Standard sizes from the KAVITY item master, with the section, thickness and weight of each piece. Final size, grade and fixing are confirmed by the structural calculation for each project.',
        'المقاسات القياسية من سجل أصناف كافيتي، مع مقطع كل قطعة وسماكتها ووزنها. يُعتمد المقاس والدرجة وطريقة التثبيت النهائية وفق الحساب الإنشائي لكل مشروع.')) + '</p></div>';

    if (fam.kit) {
      h += '<div class="kvr-kit"><div class="kvr-kit-h"><span class="kvr-kit-t">' + icon('bracket') +
        esc(fam.kitQty === false ? T('Fixings supplied with this system', 'المثبتات الموردة مع هذا النظام') : T('Supplied with each bracket', 'يُورَّد مع كل كابولة')) + '</span>' +
        (fam.kitNote ? '<p>' + bidi(T(fam.kitNote.en, fam.kitNote.ar)) + '</p>' : '') + '</div>' +
        '<ul class="kvr-kit-l">' + kitList(fam.kit) + '</ul></div>';
    }

    h += '<div class="kvr-tools">';
    if (groups.length > 1) {
      h += '<div class="kvr-tabs" role="tablist">' + groups.map(function (g, i) {
        return '<button type="button" role="tab" aria-selected="' + (i === state.g) + '" data-g="' + i + '" class="' + (i === state.g ? 'on' : '') + '">' +
          esc(T(g.en, g.ar)) + ' <i>' + g.rows.length + '</i></button>';
      }).join('') + '</div>';
    }
    h += '<div class="kvr-filters">';
    if (grades.length > 1) {
      h += '<div class="kvr-chips" aria-label="' + esc(T('Grade', 'الدرجة')) + '">' +
        ['all'].concat(grades).map(function (g) {
          return '<button type="button" data-grade="' + esc(g) + '" class="' + (state.grade === g ? 'on' : '') + '">' + esc(g === 'all' ? T('All grades', 'كل الدرجات') : gradeLabel(g)) + '</button>';
        }).join('') + '</div>';
    }
    if (thick.length > 1) {
      h += '<div class="kvr-chips" aria-label="' + esc(T('Thickness', 'السماكة')) + '">' +
        ['all'].concat(thick).map(function (t) {
          return '<button type="button" data-t="' + t + '" class="' + (String(state.t) === String(t) ? 'on' : '') + '">' + (t === 'all' ? esc(T('All thicknesses', 'كل السماكات')) : t + mm()) + '</button>';
        }).join('') + '</div>';
    }
    if (group.rows.length > 14) {
      h += '<label class="kvr-search"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
        '<input type="search" value="' + esc(state.q) + '" placeholder="' + esc(T('Search size, e.g. 280', 'ابحث عن مقاس، مثل 280')) + '" aria-label="' + esc(T('Search sizes', 'ابحث في المقاسات')) + '"></label>';
    }
    h += '<span class="kvr-count">' + rows.length + ' ' + esc(T(rows.length === 1 ? 'item' : 'items', 'صنف')) + '</span></div></div>';

    var CW = { code: 'minmax(120px,1.05fr)', size: 'minmax(90px,.9fr)', t: 'minmax(70px,.7fr)', prof: 'minmax(190px,1.6fr)', w: 'minmax(80px,.8fr)', bolt: 'minmax(90px,.85fr)', stf: 'minmax(80px,.8fr)', feat: 'minmax(140px,1.5fr)' };
    var gt = cols.map(function (c) { return CW[c]; }).join(' ') + (anyKit ? ' 84px' : '');
    h += '<div class="kvr-table" role="table" style="--gt:' + gt + '">';
    h += '<div class="kvr-tr kvr-th" role="row">' + cols.map(function (c) {
      return '<span role="columnheader">' + esc(T(COLS[c][0], COLS[c][1])) + '</span>';
    }).join('') + (anyKit ? '<span class="kvr-x" role="columnheader"><span class="sr">' + esc(T('Kit', 'الطقم')) + '</span></span>' : '') + '</div>';
    if (!shown.length) h += '<div class="kvr-empty">' + esc(T('No sizes match these filters.', 'لا توجد مقاسات تطابق هذه الفلاتر.')) + '</div>';
    shown.forEach(function (r, i) {
      var id = state.g + ':' + group.rows.indexOf(r);
      var open = !!state.open[id];
      h += '<div class="kvr-row' + (open ? ' open' : '') + '" role="rowgroup">';
      h += '<div class="kvr-tr" role="row"' + (r.kit ? ' tabindex="0" aria-expanded="' + open + '" data-row="' + id + '"' : '') + ' style="--i:' + i + '">' +
        cols.map(function (c) { return '<span role="cell" data-l="' + esc(T(COLS[c][0], COLS[c][1])) + '">' + cell(r, c, group) + '</span>'; }).join('') +
        (anyKit ? '<span class="kvr-x" role="cell">' + (r.kit ? '<span class="kvr-kitbtn">' + esc(T('Kit', 'الطقم')) +
          '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg></span>' : '') + '</span>' : '') +
        '</div>';
      if (r.kit) {
        h += '<div class="kvr-detail"><div class="kvr-detail-in"><div class="kvr-detail-p">' +
          '<span class="kvr-dt">' + esc(T('Kit for ', 'طقم ')) + '<b>' + esc(r.code || r.size) + '</b>' + esc(T(' · per bracket', ' · لكل كابولة')) + '</span>' +
          '<ul class="kvr-kit-l sm">' + kitList(r.kit, true) + '</ul>' +
          (r.kitAlt ? '<span class="kvr-dt">' + esc(T('Alternative kit', 'طقم بديل')) + '</span><ul class="kvr-kit-l sm">' + kitList(r.kitAlt, true) + '</ul>' : '') +
          '</div></div></div>';
      }
      h += '</div>';
    });
    h += '</div>';
    if (rows.length > LIMIT) {
      h += '<button type="button" class="kvr-more">' + esc(state.all ? T('Show fewer', 'عرض أقل') : T('Show all ' + rows.length + ' sizes', 'عرض كل المقاسات (' + rows.length + ')')) + '</button>';
    }
    h += '<p class="kvr-foot">' + esc(T('Weights are nominal per piece. Sizes not listed can be supplied to order.', 'الأوزان اسمية لكل قطعة. يمكن توريد المقاسات غير المدرجة حسب الطلب.')) + '</p>';

    var focusSearch = document.activeElement && document.activeElement.matches && document.activeElement.matches('.kvr-search input');
    var caret = focusSearch ? document.activeElement.selectionStart : 0;
    host.querySelector('.wrap').innerHTML = h;
    if (focusSearch) {
      var inp = host.querySelector('.kvr-search input');
      if (inp) { inp.focus(); inp.setSelectionRange(caret, caret); }
    }
  }

  host.addEventListener('click', function (e) {
    var b = e.target.closest('button, [data-row]');
    if (!b || !host.contains(b)) return;
    if (b.dataset.g != null) { state.g = +b.dataset.g; state.grade = 'all'; state.t = 'all'; state.q = ''; state.all = false; }
    else if (b.dataset.grade != null) state.grade = b.dataset.grade;
    else if (b.dataset.t != null) state.t = b.dataset.t === 'all' ? 'all' : +b.dataset.t;
    else if (b.classList.contains('kvr-more')) state.all = !state.all;
    else if (b.dataset.row != null) { state.open[b.dataset.row] = !state.open[b.dataset.row]; }
    else return;
    render();
  });
  host.addEventListener('keydown', function (e) {
    var r = e.target.closest('[data-row]');
    if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); r.click(); }
  });
  host.addEventListener('input', function (e) {
    if (e.target.matches('.kvr-search input')) { state.q = e.target.value; render(); }
  });
  new MutationObserver(render).observe(html, { attributes: true, attributeFilter: ['lang'] });
  render();
})();
