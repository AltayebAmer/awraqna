/* ════════════════════════════════════════════════════════════
   أوراقنا — تصاميم الحنّة (مِهندي).
   مفردات الحنّة خوارزمية بطبعها: البوتيه حلزون في ذيل دمعة،
   والزهرة حلقات بتلات، والتعريشة حلزون بأوراق، والحدود نقاط على مسار.
   كل شيء يُحسب — صفر صورة، صفر مسار منسوخ.
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.HennaGen = api;
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
  var PI2 = Math.PI * 2;
  var f = function (v) { return (Math.round(v * 100) / 100).toString(); };
  var uid = 0;

  /* ── لبنات مشتركة ─────────────────────────────────────── */
  function P(x, y) { return [x, y]; }
  var pol = function (cx, cy, r, a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };

  /* نقاط متساوية التباعد على قوس — الحدّ المنقّط أشهر عناصر المِهندي. */
  function dotArc(cx, cy, r, a0, a1, n, dr) {
    var out = [], i;
    for (i = 0; i < n; i++) {
      var a = a0 + (a1 - a0) * (n === 1 ? 0.5 : i / (n - 1));
      var p = pol(cx, cy, r, a);
      out.push('<circle class="hn-dot" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(dr) + '"/>');
    }
    return out.join("");
  }

  /* حلقة بتلات: الوحدة الأساسية للزهرة المِهندية. */
  function petalRing(cx, cy, r0, r1, n, off, style) {
    var out = [], i;
    for (i = 0; i < n; i++) {
      var a = (i / n) * PI2 + (off || 0);
      var aw = (PI2 / n) * 0.46;
      var base1 = pol(cx, cy, r0, a - aw), base2 = pol(cx, cy, r0, a + aw);
      var tip = pol(cx, cy, r1, a);
      var c1 = pol(cx, cy, (r0 + r1) * 0.62, a - aw * 0.85);
      var c2 = pol(cx, cy, (r0 + r1) * 0.62, a + aw * 0.85);
      if (style === "round")
        out.push('<path d="M' + f(base1[0]) + " " + f(base1[1]) +
                 " C" + f(c1[0]) + " " + f(c1[1]) + " " + f(c2[0]) + " " + f(c2[1]) +
                 " " + f(base2[0]) + " " + f(base2[1]) + '"/>');
      else
        out.push('<path d="M' + f(base1[0]) + " " + f(base1[1]) +
                 " Q" + f(c1[0]) + " " + f(c1[1]) + " " + f(tip[0]) + " " + f(tip[1]) +
                 " Q" + f(c2[0]) + " " + f(c2[1]) + " " + f(base2[0]) + " " + f(base2[1]) + '"/>');
    }
    return out.join("");
  }

  function spiralPath(cx, cy, r0, r1, turns, dir) {
    var pts = [], i, N = 90;
    for (i = 0; i <= N; i++) {
      var t = i / N;
      var a = t * PI2 * turns * (dir || 1) - Math.PI / 2;
      var r = r0 + (r1 - r0) * t;
      var p = pol(cx, cy, r, a);
      pts.push(f(p[0]) + " " + f(p[1]));
    }
    return '<path d="M' + pts.join(" L") + '"/>';
  }

  function leaf(x, y, len, ang, w) {
    var ux = Math.cos(ang), uy = Math.sin(ang);
    var tx = x + len * ux, ty = y + len * uy;
    var px = -uy * w, py = ux * w;
    return '<path d="M' + f(x) + " " + f(y) +
           " Q" + f((x + tx) / 2 + px) + " " + f((y + ty) / 2 + py) + " " + f(tx) + " " + f(ty) +
           " Q" + f((x + tx) / 2 - px) + " " + f((y + ty) / 2 - py) + " " + f(x) + " " + f(y) + 'Z"/>' +
           '<path d="M' + f(x) + " " + f(y) + " L" + f(tx) + " " + f(ty) + '"/>';
  }

  /* ── ١. بوتيه ── */
  function boteh(r, cx, cy, s, layers, fill) {
    var g = [], k;
    /* الشكل: دمعة ذيلها ملتفّ. النِّسَب ثابتة والحجم يأتي من s. */
    var d = "M0 46 C26 34 30 4 12 -14 C2 -24 -14 -20 -14 -6 C-14 4 -4 8 2 0" +
            " C-2 10 -12 12 -20 6 C-30 -2 -30 -22 -16 -34 C-2 -46 22 -36 26 -12" +
            " C30 12 16 36 0 46 Z";
    for (k = 0; k < layers; k++) {
      var sc = 1 - k * (0.19 / Math.max(1, layers - 1) * (layers - 1) / layers) - k * 0.13;
      g.push('<g transform="translate(' + f(cx) + " " + f(cy) + ") scale(" + f(s * sc) + ')"><path d="' + d + '"/></g>');
    }
    /* حدّ منقّط حول الشكل الخارجي. */
    g.push('<g transform="translate(' + f(cx) + " " + f(cy) + ") scale(" + f(s * 1.16) + ')">' +
           dotArc(0, 6, 40, -Math.PI * 0.75, Math.PI * 0.85, 16, 1.7) + "</g>");
    /* زهرة صغيرة في القلب. */
    g.push('<g transform="translate(' + f(cx) + " " + f(cy + s * 14) + ')">' +
           petalRing(0, 0, s * 3.2, s * 8.5, 6, 0, "pointed") +
           '<circle class="hn-dot" cx="0" cy="0" r="' + f(s * 2.6) + '"/></g>');
    if (fill !== "none") g.push(fillZone(cx, cy, s, fill, r));
    return g.join("");
  }

  /* حشوات داخلية: خطوط أو شبك أو نقاط. */
  function fillZone(cx, cy, s, kind, r) {
    var g = [], i;
    if (kind === "lines" || kind === "cross") {
      for (i = -8; i <= 8; i++)
        g.push('<line x1="' + f(cx - s * 34) + '" y1="' + f(cy + i * s * 4.5) +
               '" x2="' + f(cx + s * 20) + '" y2="' + f(cy + i * s * 4.5 - s * 12) + '"/>');
      if (kind === "cross")
        for (i = -8; i <= 8; i++)
          g.push('<line x1="' + f(cx - s * 30 + i * s * 5) + '" y1="' + f(cy - s * 40) +
                 '" x2="' + f(cx - s * 10 + i * s * 5) + '" y2="' + f(cy + s * 40) + '"/>');
    } else if (kind === "dots") {
      for (i = 0; i < 26; i++) {
        var a = r() * PI2, rr = Math.sqrt(r()) * s * 26;
        g.push('<circle class="hn-dot" cx="' + f(cx + rr * Math.cos(a)) + '" cy="' + f(cy + rr * Math.sin(a)) + '" r="1.3"/>');
      }
    }
    if (!g.length) return "";
    var id = "hc" + (++uid);
    return '<defs><clipPath id="' + id + '"><g transform="translate(' + f(cx) + " " + f(cy) +
           ") scale(" + f(s * 0.72) + ')"><path d="M0 46 C26 34 30 4 12 -14 C2 -24 -14 -20 -14 -6' +
           " C-14 4 -4 8 2 0 C-2 10 -12 12 -20 6 C-30 -2 -30 -22 -16 -34 C-2 -46 22 -36 26 -12" +
           ' C30 12 16 36 0 46 Z"/></g></clipPath></defs>' +
           '<g clip-path="url(#' + id + ')" class="hn-fill">' + g.join("") + "</g>";
  }

  /* ── ٢. زهرة مِهندية ── */
  function flower(r, cx, cy, R, layers) {
    var g = [], k, rr = R;
    g.push('<circle class="hn-dot" cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(R * 0.1) + '"/>');
    g.push(spiralPath(cx, cy, R * 0.02, R * 0.17, 2.4, 1));
    for (k = 0; k < layers; k++) {
      var r0 = R * (0.18 + k * (0.82 / layers));
      var r1 = R * (0.18 + (k + 1) * (0.82 / layers));
      var n = 8 + k * 4;
      g.push(petalRing(cx, cy, r0, r1 * 0.97, n, k % 2 ? Math.PI / n : 0, k % 2 ? "round" : "pointed"));
      g.push('<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r0) + '" class="hn-thin"/>');
    }
    g.push('<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(R) + '"/>');
    g.push(dotArc(cx, cy, R * 1.1, 0, PI2 * (1 - 1 / 28), 28, 1.6));
    return g.join("");
  }

  /* ── ٣. تعريشة ── */
  function vine(r, x0, y0, x1, y1, n, dir) {
    var g = [], i;
    var mx = (x0 + x1) / 2 + (y1 - y0) * 0.28 * dir;
    var my = (y0 + y1) / 2 - (x1 - x0) * 0.28 * dir;
    g.push('<path d="M' + f(x0) + " " + f(y0) + " Q" + f(mx) + " " + f(my) + " " + f(x1) + " " + f(y1) + '"/>');
    var at = function (t) {
      var u = 1 - t;
      return [u * u * x0 + 2 * u * t * mx + t * t * x1, u * u * y0 + 2 * u * t * my + t * t * y1];
    };
    for (i = 1; i <= n; i++) {
      var t = i / (n + 1), p = at(t), q = at(Math.min(1, t + 0.02));
      var ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
      var side = i % 2 ? 1 : -1;
      var L = 9 + r() * 6;
      g.push(leaf(p[0], p[1], L, ang + side * 1.1, L * 0.3));
      if (i % 3 === 0) g.push(dotArc(p[0], p[1], L * 0.75, ang - side * 0.9, ang - side * 1.9, 3, 1.3));
    }
    var e = at(1), e2 = at(0.96);
    var ea = Math.atan2(e[1] - e2[1], e[0] - e2[0]);
    g.push(spiralPath(e[0] + Math.cos(ea) * 6, e[1] + Math.sin(ea) * 6, 6.5, 0.6, 1.7, dir));
    return g.join("");
  }

  /* ── ٤. قالب الكفّ ── */
  function handPath() {
    /* كفّ يمنى مبسّطة: راحة + خمسة أصابع. النِّسَب من قياسات يد بالغة. */
    return "M50 96 C34 96 26 86 26 74 C26 66 27 60 28 54 C22 52 18 47 20 41" +
           " C22 35 28 34 32 38 L38 46 C38 40 37 26 37 18 C37 12 45 11 45.5 17" +
           " L47 44 L48 12 C48 5 56 5 56.5 12 L58 44 L60 15 C60.5 8 68 9 68 15" +
           " L68 46 L72 24 C73 18 80 19 79.5 25 L76 52 C75 62 74 70 72 76" +
           " C69 88 62 96 50 96 Z";
  }

  function hand(r, zones) {
    var g = ['<path d="' + handPath() + '" class="hn-outline"/>'];
    if (zones) {
      /* مناطق التخطيط: دوائر إرشادية خفيفة يبني عليها المتدرّب تصميمه. */
      g.push('<circle cx="49" cy="72" r="15" class="hn-guide"/>');
      g.push('<circle cx="49" cy="72" r="8" class="hn-guide"/>');
      g.push('<path d="M30 52 C40 46 60 46 70 52" class="hn-guide"/>');
      g.push('<path d="M32 62 C42 56 58 56 68 62" class="hn-guide"/>');
      [[45.5, 20], [52, 16], [64, 19], [76, 28]].forEach(function (p) {
        g.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.2" class="hn-guide"/>');
      });
    }
    return g.join("");
  }

  /* ── ٥. شريط ── */
  function band(r, y, w, n, style) {
    var g = [], i, step = w / n;
    g.push('<line x1="0" y1="' + f(y - 13) + '" x2="' + f(w) + '" y2="' + f(y - 13) + '"/>');
    g.push('<line x1="0" y1="' + f(y + 13) + '" x2="' + f(w) + '" y2="' + f(y + 13) + '"/>');
    for (i = 0; i < n; i++) {
      var cx = (i + 0.5) * step;
      if (style === "petal") g.push(petalRing(cx, y, 1.5, step * 0.42, 6, 0, "pointed"));
      else if (style === "spiral") g.push(spiralPath(cx, y, step * 0.36, 0.8, 1.6, i % 2 ? 1 : -1));
      else { g.push(leaf(cx - step * 0.3, y + 6, step * 0.6, -0.6, step * 0.17));
             g.push(leaf(cx + step * 0.3, y - 6, step * 0.6, Math.PI + 0.6, step * 0.17)); }
      g.push('<circle class="hn-dot" cx="' + f(cx) + '" cy="' + f(y - 17) + '" r="1.5"/>');
      g.push('<circle class="hn-dot" cx="' + f(cx) + '" cy="' + f(y + 17) + '" r="1.5"/>');
    }
    return g.join("");
  }

  /* ══════ التركيب ══════ */
  var TITLES = {
    boteh:  { ar: "بوتيه", en: "Paisley" },
    flower: { ar: "زهرة مِهندية", en: "Mehndi flower" },
    vine:   { ar: "تعريشة", en: "Vine" },
    band:   { ar: "شريط", en: "Band" },
    mandala:{ ar: "دائرة مِهندية", en: "Mehndi mandala" },
    hand:   { ar: "قالب الكفّ", en: "Hand template" },
    corner: { ar: "زاوية", en: "Corner motif" }
  };
  var LV = { easy: { ar: "بسيط", en: "Simple" }, med: { ar: "متوسط", en: "Medium" }, hard: { ar: "مزخرف", en: "Ornate" } };
  var LAYERS = { easy: 2, med: 3, hard: 4 };

  function svgWrap(inner, w, h, cls) {
    return '<svg class="hn-svg ' + (cls || "") + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + h +
           '" preserveAspectRatio="xMidYMid meet"><rect width="' + w + '" height="' + h + '" fill="#fff"/>' +
           '<g class="hn-ink">' + inner + "</g></svg>";
  }

  function render(state) {
    var r = rng(state.seed), t = state.type, lv = state.level || "med";
    var L = LAYERS[lv], fill = state.fill || "lines";
    var body, W = 200, H = 200;

    if (t === "boteh") {
      body = boteh(r, 100, 96, 1.75, L, fill);
    } else if (t === "flower") {
      body = flower(r, 100, 100, 84, L);
    } else if (t === "vine") {
      body = vine(r, 18, 178, 182, 26, 5 + L * 2, 1) +
             vine(r, 26, 186, 176, 44, 4 + L, -1);
    } else if (t === "band") {
      W = 200; H = 90;
      body = band(r, 45, 200, 3 + L, ["petal", "spiral", "leaf"][Math.floor(r() * 3)]);
    } else if (t === "mandala") {
      body = flower(r, 100, 100, 92, L + 2);
    } else if (t === "corner") {
      body = boteh(r, 74, 82, 1.15, L, fill) +
             vine(r, 20, 176, 150, 150, 4 + L, 1) +
             '<g transform="translate(150 44)">' + petalRing(0, 0, 5, 26, 8, 0, "pointed") +
             '<circle class="hn-dot" r="4"/></g>';
    } else {
      W = 100; H = 100;
      body = hand(r, state.zones !== false);
    }

    return {
      title: TITLES[t] || TITLES.boteh,
      sub: t === "hand"
        ? { ar: state.zones !== false ? "بمناطق إرشادية" : "بلا إرشاد", en: state.zones !== false ? "with guides" : "plain" }
        : { ar: LV[lv].ar, en: LV[lv].en },
      sheet: '<div class="hn-wrap">' + svgWrap(body, W, H, t === "hand" ? "hn-hand" : "") + "</div>",
      answers: ""
    };
  }

  return { render: render, TITLES: TITLES, boteh: boteh, flower: flower,
           vine: vine, band: band, hand: hand, petalRing: petalRing };
});
