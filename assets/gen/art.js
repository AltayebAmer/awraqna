/* GUARDIAN:BEGIN
   🛡️ أوراقنا | Awraqna — © 2026 Artist Altayeb Amer
   الفنان الطيب عامر  ·  https://awraqna.com
   Protected by ALTAYEB GUARDIAN v4.0
   GUARDIAN:END */
/* ════════════════════════════════════════════════════════════
   أوراقنا — مولّد الفنون.
   كل شكل يُحسَب من معادلة بارامترية: صفر صورة، صفر مسار مرسوم يدوياً.
   هذا ليس اختصاراً بل شرط المشروع (انظر CLAUDE.md).
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ArtGen = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function rng(seed) {
    var t = (seed >>> 0) || 1;
    return function () {
      t = (t + 0x6d2b79f5) >>> 0;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  var pick = function (r, a) { return a[Math.floor(r() * a.length)]; };
  var PI2 = Math.PI * 2;

  /* ══════ المنحنيات البارامترية ══════
     كل دالة تعيد نصف قطر r بدلالة الزاوية θ ⇒ الشكل يُرسم بالتحويل القطبي. */
  var CURVES = {
    /* المعادلة الفائقة (Gielis) — تولّد زهوراً وأصدافاً ونجوماً من أربعة أرقام. */
    superformula: function (p) {
      return function (th) {
        var t1 = Math.pow(Math.abs(Math.cos(p.m * th / 4) / p.a), p.n2);
        var t2 = Math.pow(Math.abs(Math.sin(p.m * th / 4) / p.b), p.n3);
        return Math.pow(t1 + t2, -1 / p.n1);
      };
    },
    /* منحنى الوردة r = cos(kθ) — بتلات عددها k أو 2k. */
    rose: function (p) {
      return function (th) { return Math.abs(Math.cos(p.k * th)) * 0.9 + 0.12; };
    },
    /* نجمة منتظمة: نصف قطر يتناوب بين خارجي وداخلي. */
    star: function (p) {
      return function (th) {
        var s = Math.cos(p.k * th);
        return 0.55 + 0.42 * (s > 0 ? Math.pow(s, 0.35) : -Math.pow(-s, 0.35));
      };
    },
    /* حلزون متذبذب — شكل صدفي. */
    shell: function (p) {
      return function (th) { return (0.30 + 0.62 * (th / PI2)) * (1 + 0.16 * Math.cos(p.k * th)); };
    }
  };

  function params(r) {
    var kind = pick(r, ["superformula", "rose", "star", "shell"]);
    if (kind === "superformula") {
      return { kind: kind, turns: 1, p: { m: 3 + Math.floor(r() * 9), a: 1, b: 1,
        n1: 0.3 + r() * 1.4, n2: 0.4 + r() * 1.6, n3: 0.4 + r() * 1.6 } };
    }
    if (kind === "rose")  return { kind: kind, turns: 1, p: { k: 2 + Math.floor(r() * 6) } };
    if (kind === "star")  return { kind: kind, turns: 1, p: { k: 5 + Math.floor(r() * 7) } };
    return { kind: kind, turns: 2.6 + r() * 1.6, p: { k: 5 + Math.floor(r() * 8) } };
  }

  /* عيّنات كثيفة أولاً، ثم تطبيع لملء الإطار مهما اختلفت المعادلة. */
  function dense(cfg, n) {
    var f = CURVES[cfg.kind](cfg.p), raw = [], i, th, rr, max = 0;
    for (i = 0; i < n; i++) {
      th = (i / n) * PI2 * cfg.turns;
      rr = f(th);
      if (!isFinite(rr) || rr <= 0) rr = 0.05;
      raw.push([th, rr]);
      if (rr > max) max = rr;
    }
    return raw.map(function (q) {
      var rad = (q[1] / max) * 44;
      return [50 + rad * Math.cos(q[0]), 50 + rad * Math.sin(q[0])];
    });
  }

  function samples(cfg, n) { return dense(cfg, n); }

  /* إعادة التوزيع بطول القوس لا بالزاوية.
     التوزيع بالزاوية يكدّس النقاط حيث يصغر نصف القطر فتتلاصق نقطتان
     ولا يعرف الطفل أيّهما التالية — جُرّب وشوهد في أول نسخة. */
  function evenly(cfg, n) {
    var d = dense(cfg, 1600), i, cum = [0], total = 0;
    for (i = 1; i < d.length; i++) {
      var dx = d[i][0] - d[i - 1][0], dy = d[i][1] - d[i - 1][1];
      total += Math.sqrt(dx * dx + dy * dy);
      cum.push(total);
    }
    var out = [], j = 0;
    for (i = 0; i < n; i++) {
      var target = (i / n) * total;
      while (j < cum.length - 1 && cum[j + 1] < target) j++;
      out.push(d[j]);
    }
    return out;
  }

  function svg(inner, box) {
    return '<svg class="art-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (box || 100) +
           " " + (box || 100) + '" preserveAspectRatio="xMidYMid meet">' +
           '<rect width="' + (box || 100) + '" height="' + (box || 100) + '" fill="#fff"/>' + inner + "</svg>";
  }
  var poly = function (pts, w, close) {
    return "<" + (close ? "polygon" : "polyline") + ' points="' +
      pts.map(function (p) { return p[0].toFixed(2) + "," + p[1].toFixed(2); }).join(" ") +
      '" fill="none" stroke="#111" stroke-width="' + w + '" stroke-linejoin="round"/>';
  };

  /* ══════ ١. توصيل النقاط ══════ */
  /* معيار القبول ليس «هل الشكل جميل» بل «هل يستطيع طفل اتّباع الترقيم».
     يُقاس على النقاط النهائية نفسها لا على المعادلة:
     أي نقطتين أقرب من 1.8 وحدة تلتبسان على الطفل مهما بدت المعادلة سليمة. */
  function minPairGap(pts) {
    var mn = Infinity, i, j, d;
    for (i = 0; i < pts.length; i++) for (j = i + 1; j < pts.length; j++) {
      d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d < mn) mn = d;
    }
    return mn;
  }
  function stepStats(pts) {
    var mn = Infinity, mx = 0, i, d;
    for (i = 1; i < pts.length; i++) {
      d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (d < mn) mn = d;
      if (d > mx) mx = d;
    }
    return mx / (mn || 0.0001);
  }
  /* شرط الوضوح وحده يفضّل الدوائر: أوضح شكل هو أقلّه إثارة.
     لذلك نطلب أيضاً تبايناً في نصف القطر ⇒ فصوص وبتلات لا دائرة. */
  function interesting(pts) {
    var mn = Infinity, mx = 0, i, d;
    for (i = 0; i < pts.length; i++) {
      d = Math.hypot(pts[i][0] - 50, pts[i][1] - 50);
      if (d < mn) mn = d;
      if (d > mx) mx = d;
    }
    return mx > 0 && (mx - mn) / mx >= 0.30;
  }
  function acceptable(pts) {
    return minPairGap(pts) >= 1.8 && stepStats(pts) <= 6 && interesting(pts);
  }

  function goodShape(r, n) {
    var cfg, pts;
    for (var i = 0; i < 40; i++) {
      cfg = params(r);
      pts = evenly(cfg, n);
      if (acceptable(pts)) return { cfg: cfg, pts: pts };
    }
    cfg = { kind: "rose", turns: 1, p: { k: 5 } };     /* وردة خماسية: واضحة ومثيرة معاً */
    return { cfg: cfg, pts: evenly(cfg, n) };
  }

  function dots(seed, n) {
    var r = rng(seed), sh = goodShape(r, n), cfg = sh.cfg, pts = sh.pts, g = [];
    pts.forEach(function (p, i) {
      g.push('<circle cx="' + p[0].toFixed(2) + '" cy="' + p[1].toFixed(2) + '" r="0.75" fill="#111"/>');
      /* الرقم يُزاح للخارج بعيداً عن مركز الشكل فلا يتداخل مع النقاط. */
      var dx = p[0] - 50, dy = p[1] - 50, L = Math.sqrt(dx * dx + dy * dy) || 1;
      g.push('<text x="' + (p[0] + (dx / L) * 3.4).toFixed(2) + '" y="' + (p[1] + (dy / L) * 3.4 + 0.9).toFixed(2) +
             '" font-size="2.7" text-anchor="middle" font-family="Menlo,monospace" fill="#333">' + (i + 1) + "</text>");
    });
    return { puzzle: svg(g.join("")), solution: svg(poly(pts, 0.6, cfg.kind !== "shell")), kind: cfg.kind };
  }

  /* ══════ ٢. شمسة — زخرفة إسلامية شعاعية ══════
     البناء تقليدي لا اعتباطي: دائرة مقسومة على n، ونجمة {n/k} تُرسم
     بوصل كل رأس بالرأس الذي يبعد k خطوات، ثم كؤوس (بتلات) بين الأذرع.
     هذا هو التوليد الهندسي للشمسة كما تُرسم بالفرجار والمسطرة. */
  function ring(R, w) {
    return '<circle cx="50" cy="50" r="' + R.toFixed(2) + '" fill="none" stroke="#111" stroke-width="' + w + '"/>';
  }

  /* الشمسة تُبنى **خلايا مغلقة** لا خطوطاً متقاطعة.
     تراكب نجوم {n/k} يعطي شبكة مزدحمة بخلايا مجهرية لا تُلوَّن —
     جُرّب أولاً وشوهد. لذلك كل حلقة هنا مقسومة إلى معيّنات وأقواس
     رؤوسها على الدائرتين الحاصرتين، فتُغلق المساحات من تلقائها. */
  function P(R, i, n, off) {
    var th = ((i + (off || 0)) / n) * PI2 - Math.PI / 2;
    return [50 + R * Math.cos(th), 50 + R * Math.sin(th)];
  }

  function shamsa(seed, level) {
    var r = rng(seed), g = [];
    var n = [8, 10, 12][Math.floor(r() * 3)];
    var layers = level === "easy" ? 2 : (level === "med" ? 3 : 4);
    var i, L;

    g.push(ring(47, 0.9));

    /* الطوق: كؤوس متتالية بين الدائرتين — يُغلق الشكل من الخارج. */
    var B1 = 47, B0 = 41;
    g.push(ring(B0, 0.55));
    for (i = 0; i < n * 2; i++) {
      var q0 = P(B0, i, n * 2, 0), q1 = P(B0, i + 1, n * 2, 0), qm = P(B1, i + 0.5, n * 2, 0);
      g.push('<path d="M' + q0[0].toFixed(2) + " " + q0[1].toFixed(2) +
             " Q" + qm[0].toFixed(2) + " " + qm[1].toFixed(2) +
             " " + q1[0].toFixed(2) + " " + q1[1].toFixed(2) +
             '" fill="none" stroke="#111" stroke-width="0.5"/>');
    }

    var R1 = B0 - 1.5, step = (R1 - 9) / layers;
    for (L = 0; L < layers; L++) {
      var r1 = R1 - L * step, r0 = r1 - step, off = L % 2 ? 0.5 : 0;
      g.push(ring(r0, 0.45));
      var mode = Math.floor(r() * 3);
      for (i = 0; i < n; i++) {
        var a = P(r0, i, n, off), b = P((r0 + r1) / 2, i + 0.5, n, off),
            c = P(r1, i, n, off), d = P((r0 + r1) / 2, i - 0.5, n, off);
        if (mode === 0) {
          g.push(poly([a, b, c, d], 0.5, true));                 /* معيّن */
        } else if (mode === 1) {
          /* بتلة: قوسان من الداخل إلى الخارج ⇒ مساحة مغلقة قابلة للتلوين. */
          g.push('<path d="M' + a[0].toFixed(2) + " " + a[1].toFixed(2) +
                 " Q" + b[0].toFixed(2) + " " + b[1].toFixed(2) + " " + c[0].toFixed(2) + " " + c[1].toFixed(2) +
                 " Q" + d[0].toFixed(2) + " " + d[1].toFixed(2) + " " + a[0].toFixed(2) + " " + a[1].toFixed(2) +
                 'Z" fill="none" stroke="#111" stroke-width="0.5"/>');
        } else {
          var e = P(r1, i + 1, n, off);
          g.push(poly([a, c, e], 0.5, true));                    /* مثلّث شعاعي */
        }
      }
    }

    /* القلب: وردة من n بتلات حول المركز. */
    var Rc = R1 - layers * step;
    g.push(ring(Rc, 0.5));
    for (i = 0; i < n; i++) {
      var s0 = P(Rc, i, n, 0), s1 = P(Rc, i + 1, n, 0), sm = P(Rc * 0.28, i + 0.5, n, 0);
      g.push('<path d="M' + s0[0].toFixed(2) + " " + s0[1].toFixed(2) +
             " Q" + sm[0].toFixed(2) + " " + sm[1].toFixed(2) + " " +
             s1[0].toFixed(2) + " " + s1[1].toFixed(2) + '" fill="none" stroke="#111" stroke-width="0.45"/>');
    }
    g.push(ring(Rc * 0.22, 0.5));
    return svg(g.join(""));
  }

  /* ══════ ٣. زخرفة متشابكة ══════
     التشابك الحقيقي: كل شريط يمرّ فوق وتحت جاره بالتناوب.
     يُنفَّذ بحيلة الرسم المزدوج — يُرسم الشريط أولاً بخط أبيض عريض
     (فيمحو ما تحته) ثم بحافتين سوداوين. ترتيب الرسم هو ما يقرّر
     مَن فوق مَن، فلا حاجة لحساب التقاطعات. */
  function bandPath(pts, closed) {
    return "M" + pts.map(function (p) { return p[0].toFixed(2) + " " + p[1].toFixed(2); }).join(" L") +
           (closed ? " Z" : "");
  }
  /* شريط واحد = ثلاث طبقات: أبيض عريض (المحو) + أسود أعرض قليلاً تحته (الحافة). */
  function band(pts, w, closed) {
    var d = bandPath(pts, closed);
    return '<path d="' + d + '" fill="none" stroke="#111" stroke-width="' + (w + 0.9).toFixed(2) +
             '" stroke-linejoin="round" stroke-linecap="round"/>' +
           '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="' + w.toFixed(2) +
             '" stroke-linejoin="round" stroke-linecap="round"/>';
  }

  function girih(seed, cells) {
    var r = rng(seed), u = 100 / cells, gx, gy, i;
    var n = [8, 12][Math.floor(r() * 2)];
    var inner = n === 8 ? 0.40 : 0.55;
    var W = u * 0.16;                       /* عرض الشريط تبعاً لحجم الخلية */
    var stars = [], links = [];

    for (gy = 0; gy < cells; gy++) for (gx = 0; gx < cells; gx++) {
      var cx = (gx + 0.5) * u, cy = (gy + 0.5) * u, Ppts = [];
      for (i = 0; i < n * 2; i++) {
        var th = (i / (n * 2)) * PI2 - Math.PI / 2;
        var rad = (i % 2 ? inner * 0.47 * u * 2 : 0.46 * u);
        Ppts.push([cx + rad * Math.cos(th), cy + rad * Math.sin(th)]);
      }
      stars.push(Ppts);
      /* المعيّن الرابط عند كل تقاطع داخلي. */
      /* الرابط يمتدّ حتى مراكز النجوم المجاورة ⇒ يتقاطع مع أشرطتها فعلاً.
         بلا هذا التداخل يتلامس الشريطان ولا يظهر «فوق/تحت» إطلاقاً. */
      if (gx < cells - 1 && gy < cells - 1) {
        var jx = (gx + 1) * u, jy = (gy + 1) * u, h = u * 0.40;
        links.push([[jx, jy - h], [jx + h, jy], [jx, jy + h], [jx - h, jy]]);
      }
    }

    /* الترتيب هو التشابك: يُرسم كل شريط بطبقة محو بيضاء تحت حافتيه،
       فمن يُرسم لاحقاً يمرّ **فوق** من سبقه. إعادة رسم النجوم الزوجية
       بعد الروابط تعطي التناوب: نجمة فوق رابط، ورابط فوق نجمة. */
    var g = ['<rect width="100" height="100" fill="#fff"/>'];
    stars.forEach(function (P, k) { if (k % 2) g.push(band(P, W, true)); });
    links.forEach(function (P) { g.push(band(P, W, true)); });
    stars.forEach(function (P, k) { if (k % 2 === 0) g.push(band(P, W, true)); });
    g.push('<rect x="0.5" y="0.5" width="99" height="99" fill="none" stroke="#111" stroke-width="1"/>');
    return svg(g.join(""));
  }

  /* ══════ ٤. أكمل النصف الآخر ══════ */
  function symmetry(seed) {
    var r = rng(seed), cfg = goodShape(r, 44).cfg, pts = dense(cfg, 320), g = [];
    var half = pts.filter(function (p) { return p[0] <= 50.001; });
    g.push('<line x1="50" y1="3" x2="50" y2="97" stroke="#888" stroke-width="0.5" stroke-dasharray="2 2"/>');
    /* النصف الأيسر مرسوم بقطع منفصلة — المنحنى قد يعبر المحور أكثر من مرة. */
    var run = [];
    pts.concat([pts[0]]).forEach(function (p) {
      if (p[0] <= 50.001) run.push(p);
      else { if (run.length > 1) g.push(poly(run, 0.6, false)); run = []; }
    });
    if (run.length > 1) g.push(poly(run, 0.6, false));
    var mirror = function (list) { return list.map(function (p) { return [100 - p[0], p[1]]; }); };
    var sol = g.slice();
    run = [];
    pts.concat([pts[0]]).forEach(function (p) {
      if (p[0] <= 50.001) run.push(p);
      else { if (run.length > 1) sol.push(poly(mirror(run), 0.6, false)); run = []; }
    });
    if (run.length > 1) sol.push(poly(mirror(run), 0.6, false));
    return { puzzle: svg(g.join("")), solution: svg(sol.join("")), n: half.length };
  }

  /* ══════ الواجهة ══════ */
  var TITLES = {
    dots:     { ar: "وصّل النقاط", en: "Connect the dots" },
    shamsa:   { ar: "شمسة — زخرفة إسلامية", en: "Shamsa — Islamic rosette" },
    girih:    { ar: "زخرفة متكرِّرة", en: "Repeating ornament" },
    symmetry: { ar: "أكمل النصف الآخر", en: "Complete the symmetry" }
  };
  var LV = { easy: { ar: "سهل", en: "Easy" }, med: { ar: "متوسط", en: "Medium" }, hard: { ar: "صعب", en: "Hard" } };
  var DOTS_N = { easy: 20, med: 38, hard: 60 };
  var CELLS  = { easy: 2, med: 3, hard: 4 };

  function render(state) {
    var t = state.type, lv = state.level || "med", seed = state.seed;
    var puzzle, solution = "";
    if (t === "dots") { var d = dots(seed, DOTS_N[lv]); puzzle = d.puzzle; solution = d.solution; }
    else if (t === "shamsa") puzzle = shamsa(seed, lv);
    else if (t === "girih") puzzle = girih(seed, CELLS[lv]);
    else { var s = symmetry(seed); puzzle = s.puzzle; solution = s.solution; }

    var wrap = function (x) { return '<div class="art-wrap">' + x + "</div>"; };
    return {
      title: TITLES[t] || TITLES.dots,
      sub: { ar: LV[lv].ar, en: LV[lv].en },
      sheet: wrap(puzzle),
      answers: solution ? wrap(solution) : ""
    };
  }

  return { render: render, dots: dots, shamsa: shamsa, girih: girih, symmetry: symmetry, CURVES: CURVES };
});
