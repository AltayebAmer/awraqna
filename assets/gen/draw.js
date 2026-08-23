/* ════════════════════════════════════════════════════════════
   أوراقنا — تعلّم الرسم خطوة بخطوة.
   كل حيوان **وصفة هندسية** لا صورة: قائمة مرتّبة من دوائر وأقواس
   ومسارات بإحداثيات نسبية، تُبنى بدالة تأخذ عشوائية فتتغيّر النِّسَب
   بين ورقة وأخرى. الخطوات هي عناصر الوصفة مكشوفةً واحدة تلو الأخرى.
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.DrawGen = api;
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
  var n2 = function (v) { return (Math.round(v * 10) / 10).toString(); };

  /* ── عناصر أوّلية ── */
  var C = function (x, y, r) { return { t: "c", x: x, y: y, r: r }; };
  var E = function (x, y, rx, ry, rot) { return { t: "e", x: x, y: y, rx: rx, ry: ry, rot: rot || 0 }; };
  var P = function (d) { return { t: "p", d: d }; };
  var L = function (pts) { return { t: "l", pts: pts }; };

  function svgOf(prim, cls) {
    if (prim.t === "c")
      return '<circle class="' + cls + '" cx="' + n2(prim.x) + '" cy="' + n2(prim.y) + '" r="' + n2(prim.r) + '"/>';
    if (prim.t === "e")
      return '<ellipse class="' + cls + '" cx="' + n2(prim.x) + '" cy="' + n2(prim.y) + '" rx="' + n2(prim.rx) +
             '" ry="' + n2(prim.ry) + '"' + (prim.rot ? ' transform="rotate(' + n2(prim.rot) + ' ' + n2(prim.x) + ' ' + n2(prim.y) + ')"' : "") + "/>";
    if (prim.t === "l")
      return '<polyline class="' + cls + '" points="' + prim.pts.map(function (p) { return n2(p[0]) + "," + n2(p[1]); }).join(" ") + '"/>';
    return '<path class="' + cls + '" d="' + prim.d + '"/>';
  }

  /* جسم منحنٍ مغلق يمرّ بنقاط — يُستعمل لأجساد الحيوانات. */
  function blob(pts, tension) {
    var t = tension === undefined ? 0.5 : tension, d = "", i, n = pts.length;
    for (i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      if (i === 0) d += "M" + n2(p1[0]) + " " + n2(p1[1]);
      d += " C" + n2(p1[0] + (p2[0] - p0[0]) / 6 * t * 2) + " " + n2(p1[1] + (p2[1] - p0[1]) / 6 * t * 2) +
           " " + n2(p2[0] - (p3[0] - p1[0]) / 6 * t * 2) + " " + n2(p2[1] - (p3[1] - p1[1]) / 6 * t * 2) +
           " " + n2(p2[0]) + " " + n2(p2[1]);
    }
    return d + " Z";
  }

  /* ══════ الحيوانات: كل دالة تعيد [step, step, ...] ══════ */
  var ANIMALS = {};

  ANIMALS.cat = { ar: "قطة", en: "Cat", build: function (r) {
    var hr = 14 + r() * 2, hx = 30, hy = 34;
    var bx = 62, by = 62, bw = 26 + r() * 3, bh = 17 + r() * 2;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    return [
      [C(hx, hy, hr)],
      [P("M" + e(hx - hr * .70, hy - hr * .70) + " L" + e(hx - hr * .98, hy - hr * 1.80) +
          " L" + e(hx - hr * .28, hy - hr * .98) + " Z"),
       P("M" + e(hx + hr * .70, hy - hr * .70) + " L" + e(hx + hr * .98, hy - hr * 1.80) +
          " L" + e(hx + hr * .28, hy - hr * .98) + " Z")],
      [C(hx - hr * .38, hy - hr * .10, 1.4), C(hx + hr * .38, hy - hr * .10, 1.4),
       P("M" + e(hx, hy + hr * .20) + " L" + e(hx - 2.0, hy + hr * .52) + " L" + e(hx + 2.0, hy + hr * .52) + " Z")],
      [L([[hx - hr * .35, hy + hr * .48], [hx - hr * 1.55, hy + hr * .26]]),
       L([[hx - hr * .35, hy + hr * .62], [hx - hr * 1.60, hy + hr * .70]]),
       L([[hx + hr * .35, hy + hr * .48], [hx + hr * 1.55, hy + hr * .26]]),
       L([[hx + hr * .35, hy + hr * .62], [hx + hr * 1.60, hy + hr * .70]])],
      /* الجسم يبدأ من حافة الرأس اليمنى ويهبط ⇒ يبدو متصلاً لا ملتصقاً. */
      [P("M" + e(hx + hr * .92, hy + hr * .30) +
          " C" + e(bx - bw * .35, by - bh * 1.30) + " " + e(bx + bw * .75, by - bh * 1.25) + " " + e(bx + bw, by - bh * .10) +
          " C" + e(bx + bw * 1.05, by + bh * .85) + " " + e(bx + bw * .45, by + bh * 1.05) + " " + e(bx - bw * .55, by + bh) +
          " C" + e(hx + hr * .55, by + bh * .95) + " " + e(hx + hr * .35, hy + hr * 1.45) + " " + e(hx + hr * .92, hy + hr * .30))],
      /* الذيل يخرج من الحافة السفلى اليمنى وينحني للخارج ثم لأعلى. */
      [P("M" + e(bx + bw * .92, by + bh * .55) +
          " C" + e(bx + bw * 1.55, by + bh * 1.05) + " " + e(bx + bw * 1.60, by - bh * .35) + " " + e(bx + bw * .92, by - bh * .55))],
      [P("M" + e(bx - bw * .58, by + bh * .98) + " C" + e(bx - bw * .95, by + bh * 1.02) +
          " " + e(bx - bw * .95, by + bh * .55) + " " + e(bx - bw * .62, by + bh * .58)),
       P("M" + e(bx - bw * .18, by + bh * 1.02) + " C" + e(bx - bw * .55, by + bh * 1.05) +
          " " + e(bx - bw * .55, by + bh * .60) + " " + e(bx - bw * .22, by + bh * .62))]
    ];
  } };

  ANIMALS.chick = { ar: "كتكوت", en: "Chick", build: function (r) {
    var br = 20 + r() * 4, bx = 50, by = 58;
    var hr = br * (.55 + r() * .08), hx = 50, hy = by - br * .95;
    return [
      [C(bx, by, br)],                                                    /* الجسم */
      [C(hx, hy, hr)],                                                    /* الرأس */
      [P("M" + n2(hx + hr * .85) + " " + n2(hy) + " L" + n2(hx + hr * 1.7) + " " + n2(hy + hr * .22) +
          " L" + n2(hx + hr * .85) + " " + n2(hy + hr * .42) + " Z"),
       C(hx + hr * .3, hy - hr * .2, 1.6)],                               /* المنقار والعين */
      [P("M" + n2(bx - br * .1) + " " + n2(by - br * .3) + " C" + n2(bx - br * .95) + " " + n2(by - br * .1) +
          " " + n2(bx - br * .9) + " " + n2(by + br * .6) + " " + n2(bx - br * .05) + " " + n2(by + br * .45))], /* الجناح */
      [L([[bx - br * .35, by + br * .92], [bx - br * .42, by + br * 1.45]]),
       L([[bx + br * .35, by + br * .92], [bx + br * .42, by + br * 1.45]]),
       L([[bx - br * .68, by + br * 1.45], [bx - br * .42, by + br * 1.45], [bx - br * .16, by + br * 1.45]]),
       L([[bx + br * .16, by + br * 1.45], [bx + br * .42, by + br * 1.45], [bx + br * .68, by + br * 1.45]])] /* القائمتان */
    ];
  } };

  ANIMALS.fish = { ar: "سمكة", en: "Fish", build: function (r) {
    var bw = 30 + r() * 5, bh = 17 + r() * 4, cx = 44, cy = 50;
    return [
      [E(cx, cy, bw, bh)],                                                /* الجسم */
      [P("M" + n2(cx + bw * .92) + " " + n2(cy) + " L" + n2(cx + bw * 1.6) + " " + n2(cy - bh * .95) +
          " L" + n2(cx + bw * 1.6) + " " + n2(cy + bh * .95) + " Z")],     /* الذيل */
      [C(cx - bw * .55, cy - bh * .22, 2.2),
       P("M" + n2(cx - bw * .1) + " " + n2(cy - bh) + " C" + n2(cx) + " " + n2(cy - bh * 1.9) +
          " " + n2(cx + bw * .5) + " " + n2(cy - bh * 1.6) + " " + n2(cx + bw * .45) + " " + n2(cy - bh * .72))], /* العين والزعنفة */
      [P("M" + n2(cx - bw * .1) + " " + n2(cy + bh * .95) + " C" + n2(cx) + " " + n2(cy + bh * 1.7) +
          " " + n2(cx + bw * .45) + " " + n2(cy + bh * 1.5) + " " + n2(cx + bw * .4) + " " + n2(cy + bh * .75)),
       P("M" + n2(cx - bw * .28) + " " + n2(cy - bh * .8) + " C" + n2(cx - bw * .5) + " " + n2(cy) +
          " " + n2(cx - bw * .5) + " " + n2(cy) + " " + n2(cx - bw * .28) + " " + n2(cy + bh * .8))],  /* زعنفة سفلية وخيشوم */
      [P("M" + n2(cx + bw * .15) + " " + n2(cy - bh * .55) + " C" + n2(cx + bw * .45) + " " + n2(cy - bh * .2) +
          " " + n2(cx + bw * .45) + " " + n2(cy + bh * .2) + " " + n2(cx + bw * .15) + " " + n2(cy + bh * .55)),
       P("M" + n2(cx + bw * .38) + " " + n2(cy - bh * .5) + " C" + n2(cx + bw * .66) + " " + n2(cy - bh * .18) +
          " " + n2(cx + bw * .66) + " " + n2(cy + bh * .18) + " " + n2(cx + bw * .38) + " " + n2(cy + bh * .5))] /* الحراشف */
    ];
  } };

  ANIMALS.elephant = { ar: "فيل", en: "Elephant", build: function (r) {
    var bw = 26 + r() * 4, bh = 20 + r() * 3, bx = 56, by = 48;
    var hr = 15 + r() * 2, hx = bx - bw * .95, hy = by - bh * .2;
    return [
      [E(bx, by, bw, bh)],                                                /* الجسم */
      [C(hx, hy, hr)],                                                    /* الرأس */
      [P("M" + n2(hx - hr * .75) + " " + n2(hy + hr * .35) + " C" + n2(hx - hr * 1.7) + " " + n2(hy + hr * 1.3) +
          " " + n2(hx - hr * 1.2) + " " + n2(hy + hr * 2.4) + " " + n2(hx - hr * 1.85) + " " + n2(hy + hr * 2.6))], /* الخرطوم */
      [P("M" + n2(hx + hr * .25) + " " + n2(hy - hr * .85) + " C" + n2(hx + hr * 1.5) + " " + n2(hy - hr * 1.2) +
          " " + n2(hx + hr * 1.6) + " " + n2(hy + hr * .8) + " " + n2(hx + hr * .35) + " " + n2(hy + hr * .75) + " Z"),
       C(hx - hr * .3, hy - hr * .12, 1.6)],                              /* الأذن والعين */
      [L([[bx - bw * .6, by + bh * .85], [bx - bw * .62, by + bh * 1.75]]),
       L([[bx - bw * .18, by + bh * .95], [bx - bw * .2, by + bh * 1.75]]),
       L([[bx + bw * .35, by + bh * .92], [bx + bw * .38, by + bh * 1.75]]),
       L([[bx + bw * .72, by + bh * .78], [bx + bw * .75, by + bh * 1.75]])], /* القوائم */
      [P("M" + n2(bx + bw * .95) + " " + n2(by - bh * .35) + " C" + n2(bx + bw * 1.35) + " " + n2(by - bh * .1) +
          " " + n2(bx + bw * 1.3) + " " + n2(by + bh * .5) + " " + n2(bx + bw * 1.1) + " " + n2(by + bh * .6))] /* الذيل */
    ];
  } };

  ANIMALS.rabbit = { ar: "أرنب", en: "Rabbit", build: function (r) {
    var bw = 19 + r() * 3, bh = 18 + r() * 2, bx = 56, by = 68;
    var hr = 12 + r() * 1.5, hx = 40, hy = 38;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    return [
      [E(bx, by, bw, bh)],
      [C(hx, hy, hr)],
      [E(hx - hr * .42, hy - hr * 1.55, hr * .27, hr * .92, -14),
       E(hx + hr * .34, hy - hr * 1.60, hr * .26, hr * .92, 9)],
      [C(hx - hr * .34, hy - hr * .08, 1.3), C(hx + hr * .34, hy - hr * .08, 1.3),
       P("M" + e(hx, hy + hr * .28) + " L" + e(hx - 1.8, hy + hr * .54) + " L" + e(hx + 1.8, hy + hr * .54) + " Z"),
       L([[hx - hr * .30, hy + hr * .58], [hx - hr * 1.25, hy + hr * .42]]),
       L([[hx + hr * .30, hy + hr * .58], [hx + hr * 1.25, hy + hr * .42]])],
      /* العنق يصل الرأس بالجسم، والذيل كرة على الحافة اليمنى. */
      [P("M" + e(hx + hr * .62, hy + hr * .80) + " C" + e(hx + hr * 1.30, hy + hr * 1.55) +
          " " + e(bx - bw * .95, by - bh * 1.05) + " " + e(bx - bw * .55, by - bh * .82)),
       C(bx + bw * 1.02, by - bh * .12, hr * .40),
       E(bx - bw * .30, by + bh * .96, bw * .42, bh * .20)]
    ];
  } };

  ANIMALS.turtle = { ar: "سلحفاة", en: "Turtle", build: function (r) {
    var sw = 28 + r() * 5, sh = 18 + r() * 3, cx = 50, cy = 52;
    return [
      [P("M" + n2(cx - sw) + " " + n2(cy + sh * .35) + " A" + n2(sw) + " " + n2(sh * 1.5) + " 0 0 1 " +
          n2(cx + sw) + " " + n2(cy + sh * .35) + " Z")],                 /* الصدفة */
      [C(cx + sw * 1.02, cy + sh * .1, sh * .55)],                        /* الرأس */
      [C(cx + sw * 1.2, cy - sh * .05, 1.5),
       P("M" + n2(cx + sw * 1.15) + " " + n2(cy + sh * .38) + " L" + n2(cx + sw * 1.4) + " " + n2(cy + sh * .38))], /* العين والفم */
      [L([[cx - sw * .55, cy + sh * .35], [cx - sw * .68, cy + sh * .95]]),
       L([[cx + sw * .55, cy + sh * .35], [cx + sw * .68, cy + sh * .95]]),
       P("M" + n2(cx - sw * .9) + " " + n2(cy + sh * .3) + " C" + n2(cx - sw * 1.25) + " " + n2(cy + sh * .2) +
          " " + n2(cx - sw * 1.25) + " " + n2(cy - sh * .2) + " " + n2(cx - sw * .95) + " " + n2(cy - sh * .15))], /* القوائم والذيل */
      [P("M" + n2(cx - sw * .5) + " " + n2(cy + sh * .3) + " C" + n2(cx - sw * .45) + " " + n2(cy - sh * .7) +
          " " + n2(cx + sw * .45) + " " + n2(cy - sh * .7) + " " + n2(cx + sw * .5) + " " + n2(cy + sh * .3)),
       L([[cx, cy - sh * 1.05], [cx, cy + sh * .35]]),
       L([[cx - sw * .5, cy - sh * .18], [cx + sw * .5, cy - sh * .18]])] /* نقش الصدفة */
    ];
  } };

  ANIMALS.duck = { ar: "بطة", en: "Duck", build: function (r) {
    var bw = 23 + r() * 3, bh = 16 + r() * 2, bx = 46, by = 64;
    var hr = 10 + r() * 1.5, hx = 72, hy = 34;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    return [
      [E(bx, by, bw, bh)],
      [C(hx, hy, hr)],
      /* خطّا العنق يصلان حافة الرأس بحافة الجسم من الخارج — لا يعبران داخله. */
      [P("M" + e(hx - hr * .92, hy + hr * .40) + " C" + e(hx - hr * 1.5, hy + hr * 2.0) +
          " " + e(bx + bw * .35, by - bh * 1.55) + " " + e(bx + bw * .30, by - bh * .95)),
       P("M" + e(hx + hr * .55, hy + hr * .82) + " C" + e(hx + hr * .45, hy + hr * 2.3) +
          " " + e(bx + bw * .92, by - bh * 1.05) + " " + e(bx + bw * .90, by - bh * .35))],
      [P("M" + e(hx + hr * .75, hy + hr * .05) + " C" + e(hx + hr * 2.15, hy - hr * .10) +
          " " + e(hx + hr * 2.15, hy + hr * .72) + " " + e(hx + hr * .70, hy + hr * .62) + " Z"),
       C(hx + hr * .10, hy - hr * .28, 1.4)],
      [P("M" + e(bx - bw * .40, by - bh * .30) + " C" + e(bx - bw * .05, by + bh * .05) +
          " " + e(bx + bw * .32, by + bh * .40) + " " + e(bx - bw * .45, by + bh * .52)),
       P("M" + e(bx - bw * .96, by - bh * .18) + " L" + e(bx - bw * 1.55, by - bh * .62) +
          " L" + e(bx - bw * 1.42, by + bh * .30) + " Z")]
    ];
  } };

  var ORDER = ["cat", "chick", "duck", "fish", "rabbit", "turtle", "elephant"];

  /* ══════ العرض ══════ */
  function panel(steps, upTo, box) {
    var g = [], i, j;
    for (i = 0; i <= upTo; i++)
      for (j = 0; j < steps[i].length; j++)
        g.push(svgOf(steps[i][j], i === upTo ? "dw-new" : "dw-old"));
    return '<svg class="dw-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + box + " " + box +
           '" preserveAspectRatio="xMidYMid meet">' + g.join("") + "</svg>";
  }

  function render(state) {
    var key = ANIMALS[state.animal] ? state.animal : "cat";
    var A = ANIMALS[key];
    var steps = A.build(rng(state.seed));
    var box = 100;

    if (state.mode === "outline") {
      var all = [], i, j;
      for (i = 0; i < steps.length; i++) for (j = 0; j < steps[i].length; j++)
        all.push(svgOf(steps[i][j], "dw-new"));
      return {
        title: { ar: "لوّن " + A.ar, en: "Colour the " + A.en },
        sub: { ar: "الرسم كاملاً — لوّنه", en: "The finished drawing — colour it" },
        sheet: '<div class="dw-solo"><svg class="dw-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
               box + " " + box + '" preserveAspectRatio="xMidYMid meet">' + all.join("") + "</svg></div>",
        answers: ""
      };
    }

    var cells = steps.map(function (_, i) {
      return '<div class="dw-cell"><span class="dw-n">' + (i + 1) + "</span>" + panel(steps, i, box) + "</div>";
    });
    /* لوحة أخيرة فارغة: يعيد الطفل الرسم بنفسه بعد أن رأى الخطوات. */
    cells.push('<div class="dw-cell dw-try"><span class="dw-n">✎</span>' +
               '<svg class="dw-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + box + " " + box + '"></svg></div>');

    return {
      title: { ar: "ارسم " + A.ar + " خطوة بخطوة", en: "Draw a " + A.en + " step by step" },
      sub: { ar: steps.length + " خطوات ثم ارسمها بنفسك", en: steps.length + " steps, then draw it yourself" },
      sheet: '<div class="dw-grid">' + cells.join("") + "</div>",
      answers: ""
    };
  }

  return { render: render, ANIMALS: ANIMALS, ORDER: ORDER, blob: blob };
});
