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
    var bw = 24 + r() * 3, bh = 19 + r() * 2, bx = 60, by = 50;
    var hr = 14 + r() * 1.5, hx = bx - bw * 1.05, hy = by - bh * .18;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    return [
      [E(bx, by, bw, bh)],                                                /* الجسم */
      [C(hx, hy, hr)],                                                    /* الرأس ملامس للجسم */
      /* الخرطوم يخرج من أسفل الرأس وينحدر ثم يلتفّ — لا من منتصفه. */
      [P("M" + e(hx - hr * .55, hy + hr * .78) + " C" + e(hx - hr * 1.35, hy + hr * 1.85) +
          " " + e(hx - hr * .35, hy + hr * 2.65) + " " + e(hx - hr * 1.05, hy + hr * 3.0))],
      [E(hx + hr * .42, hy - hr * .30, hr * .55, hr * .70, -14),          /* الأذن أعلى الرأس */
       C(hx - hr * .38, hy - hr * .25, 1.5)],                             /* العين */
      [L([[hx - hr * .82, hy + hr * 1.05], [hx - hr * 1.3, hy + hr * 1.55]]),
       L([[hx - hr * .28, hy + hr * 1.15], [hx - hr * .05, hy + hr * 1.75]])], /* النابان */
      [L([[bx - bw * .58, by + bh * .88], [bx - bw * .6, by + bh * 1.78]]),
       L([[bx - bw * .16, by + bh * .97], [bx - bw * .18, by + bh * 1.78]]),
       L([[bx + bw * .36, by + bh * .94], [bx + bw * .38, by + bh * 1.78]]),
       L([[bx + bw * .74, by + bh * .76], [bx + bw * .76, by + bh * 1.78]]),
       P("M" + e(bx + bw * .96, by - bh * .32) + " C" + e(bx + bw * 1.32, by - bh * .05) +
          " " + e(bx + bw * 1.28, by + bh * .55) + " " + e(bx + bw * 1.08, by + bh * .62))]
    ];
  } };

  ANIMALS.rabbit = { ar: "أرنب", en: "Rabbit", build: function (r) {
    var bw = 19 + r() * 3, bh = 17 + r() * 2, bx = 56, by = 70;
    var hr = 13 + r() * 1.5, hx = 45, hy = 43;
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


  ANIMALS.butterfly = { ar: "فراشة", en: "Butterfly", build: function (r) {
    var cx = 50, cy = 52, w = 20 + r() * 4, h = 22 + r() * 4;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    return [
      [E(cx, cy, 3.2, h * .82)],                                          /* الجسم */
      [C(cx, cy - h * .95, 4.2),
       P("M" + e(cx - 1.5, cy - h * 1.28) + " C" + e(cx - 8, cy - h * 1.85) + " " + e(cx - 11, cy - h * 1.5) + " " + e(cx - 12, cy - h * 1.72)),
       P("M" + e(cx + 1.5, cy - h * 1.28) + " C" + e(cx + 8, cy - h * 1.85) + " " + e(cx + 11, cy - h * 1.5) + " " + e(cx + 12, cy - h * 1.72))],
      [P("M" + e(cx - 3, cy - h * .55) + " C" + e(cx - w * 1.75, cy - h * 1.35) + " " + e(cx - w * 1.85, cy - h * .1) + " " + e(cx - 3, cy - h * .05) + " Z"),
       P("M" + e(cx + 3, cy - h * .55) + " C" + e(cx + w * 1.75, cy - h * 1.35) + " " + e(cx + w * 1.85, cy - h * .1) + " " + e(cx + 3, cy - h * .05) + " Z")],
      [P("M" + e(cx - 3, cy + h * .1) + " C" + e(cx - w * 1.4, cy + h * .35) + " " + e(cx - w * 1.15, cy + h * 1.15) + " " + e(cx - 3, cy + h * .72) + " Z"),
       P("M" + e(cx + 3, cy + h * .1) + " C" + e(cx + w * 1.4, cy + h * .35) + " " + e(cx + w * 1.15, cy + h * 1.15) + " " + e(cx + 3, cy + h * .72) + " Z")],
      [C(cx - w * .95, cy - h * .5, 3.4), C(cx + w * .95, cy - h * .5, 3.4),
       C(cx - w * .72, cy + h * .55, 2.2), C(cx + w * .72, cy + h * .55, 2.2)]
    ];
  } };

  ANIMALS.owl = { ar: "بومة", en: "Owl", build: function (r) {
    var bw = 22 + r() * 3, bh = 27 + r() * 3, cx = 50, cy = 55;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    return [
      [P("M" + e(cx - bw, cy + bh * .35) + " C" + e(cx - bw * 1.15, cy - bh * .95) + " " + e(cx + bw * 1.15, cy - bh * .95) + " " + e(cx + bw, cy + bh * .35) +
          " C" + e(cx + bw * .85, cy + bh * 1.05) + " " + e(cx - bw * .85, cy + bh * 1.05) + " " + e(cx - bw, cy + bh * .35) + " Z")],
      [P("M" + e(cx - bw * .82, cy - bh * .52) + " L" + e(cx - bw * .95, cy - bh * 1.02) + " L" + e(cx - bw * .38, cy - bh * .72)),
       P("M" + e(cx + bw * .82, cy - bh * .52) + " L" + e(cx + bw * .95, cy - bh * 1.02) + " L" + e(cx + bw * .38, cy - bh * .72))],
      [C(cx - bw * .42, cy - bh * .38, bw * .34), C(cx + bw * .42, cy - bh * .38, bw * .34),
       C(cx - bw * .42, cy - bh * .38, bw * .13), C(cx + bw * .42, cy - bh * .38, bw * .13)],
      [P("M" + e(cx, cy - bh * .28) + " L" + e(cx - bw * .13, cy - bh * .02) + " L" + e(cx + bw * .13, cy - bh * .02) + " Z"),
       P("M" + e(cx - bw * .88, cy - bh * .1) + " C" + e(cx - bw * .7, cy + bh * .55) + " " + e(cx - bw * .55, cy + bh * .8) + " " + e(cx - bw * .42, cy + bh * .88)),
       P("M" + e(cx + bw * .88, cy - bh * .1) + " C" + e(cx + bw * .7, cy + bh * .55) + " " + e(cx + bw * .55, cy + bh * .8) + " " + e(cx + bw * .42, cy + bh * .88))],
      [L([[cx - bw * .38, cy + bh * 1.0], [cx - bw * .38, cy + bh * 1.22]]),
       L([[cx + bw * .38, cy + bh * 1.0], [cx + bw * .38, cy + bh * 1.22]]),
       L([[cx - bw * .62, cy + bh * 1.22], [cx - bw * .14, cy + bh * 1.22]]),
       L([[cx + bw * .14, cy + bh * 1.22], [cx + bw * .62, cy + bh * 1.22]])]
    ];
  } };

  ANIMALS.snail = { ar: "حلزون", en: "Snail", build: function (r) {
    var sr = 19 + r() * 3, sx = 58, sy = 46;
    var bx = 30, by = 70;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    var spiral = "M" + e(sx, sy);
    var i, a, rr;
    for (i = 0; i <= 46; i++) { a = i / 46 * Math.PI * 5.2; rr = sr * (i / 46); spiral += " L" + e(sx + rr * Math.cos(a), sy + rr * Math.sin(a)); }
    return [
      [C(sx, sy, sr)],                                                    /* الصدفة */
      [P("M" + e(sx - sr, sy + sr * .55) + " C" + e(bx - 18, by - 2) + " " + e(bx - 20, by + 8) + " " + e(bx - 4, by + 8) +
          " L" + e(sx + sr * .55, by + 8) + " C" + e(sx + sr * .95, by + 4) + " " + e(sx + sr, sy + sr * .95) + " " + e(sx + sr * .72, sy + sr * .72))], /* الجسم */
      [P(spiral)],                                                        /* دوّامة الصدفة */
      [L([[bx - 15, by - 1], [bx - 20, by - 14]]), L([[bx - 8, by - 3], [bx - 8, by - 16]]),
       C(bx - 20.5, by - 16, 2.1), C(bx - 8, by - 18, 2.1)],              /* قرنا الاستشعار */
      [C(bx - 14, by + 1, 1.4),
       L([[bx - 2, by + 8], [sx + sr * .5, by + 8]])]                     /* العين وخط القاعدة */
    ];
  } };

  ANIMALS.frog = { ar: "ضفدع", en: "Frog", build: function (r) {
    var bw = 22 + r() * 3, bh = 17 + r() * 3, cx = 50, cy = 62;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    return [
      [E(cx, cy, bw, bh)],                                                /* الجسم */
      [C(cx - bw * .46, cy - bh * .92, bw * .3), C(cx + bw * .46, cy - bh * .92, bw * .3)], /* العينان */
      [C(cx - bw * .46, cy - bh * .92, bw * .12), C(cx + bw * .46, cy - bh * .92, bw * .12),
       P("M" + e(cx - bw * .5, cy + bh * .28) + " C" + e(cx - bw * .2, cy + bh * .62) + " " + e(cx + bw * .2, cy + bh * .62) + " " + e(cx + bw * .5, cy + bh * .28))], /* البؤبؤ والفم */
      [P("M" + e(cx - bw * .82, cy + bh * .35) + " C" + e(cx - bw * 1.5, cy + bh * .5) + " " + e(cx - bw * 1.45, cy + bh * 1.15) + " " + e(cx - bw * .78, cy + bh * 1.0)),
       P("M" + e(cx + bw * .82, cy + bh * .35) + " C" + e(cx + bw * 1.5, cy + bh * .5) + " " + e(cx + bw * 1.45, cy + bh * 1.15) + " " + e(cx + bw * .78, cy + bh * 1.0))], /* الساقان */
      [L([[cx - bw * 1.42, cy + bh * 1.05], [cx - bw * 1.62, cy + bh * 1.05]]),
       L([[cx - bw * 1.42, cy + bh * 1.05], [cx - bw * 1.58, cy + bh * .88]]),
       L([[cx + bw * 1.42, cy + bh * 1.05], [cx + bw * 1.62, cy + bh * 1.05]]),
       L([[cx + bw * 1.42, cy + bh * 1.05], [cx + bw * 1.58, cy + bh * .88]])] /* الأصابع */
    ];
  } };

  ANIMALS.bee = { ar: "نحلة", en: "Bee", build: function (r) {
    var bw = 21 + r() * 3, bh = 15 + r() * 2, cx = 52, cy = 56;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    return [
      [E(cx, cy, bw, bh)],                                                /* الجسم */
      [C(cx - bw * .98, cy - bh * .18, bh * .68)],                        /* الرأس */
      [P("M" + e(cx - bw * .2, cy - bh) + " C" + e(cx - bw * .15, cy - bh * 2.4) + " " + e(cx + bw * .75, cy - bh * 2.3) + " " + e(cx + bw * .5, cy - bh * .82) + " Z"),
       P("M" + e(cx - bw * .05, cy - bh * .95) + " C" + e(cx + bw * .3, cy - bh * 2.1) + " " + e(cx + bw * 1.05, cy - bh * 1.7) + " " + e(cx + bw * .68, cy - bh * .7) + " Z")], /* الجناحان */
      [P("M" + e(cx - bw * .28, cy - bh * .96) + " C" + e(cx - bw * .38, cy) + " " + e(cx - bw * .38, cy) + " " + e(cx - bw * .28, cy + bh * .96)),
       P("M" + e(cx + bw * .18, cy - bh * .97) + " C" + e(cx + bw * .08, cy) + " " + e(cx + bw * .08, cy) + " " + e(cx + bw * .18, cy + bh * .97)),
       P("M" + e(cx + bw * .62, cy - bh * .82) + " C" + e(cx + bw * .52, cy) + " " + e(cx + bw * .52, cy) + " " + e(cx + bw * .62, cy + bh * .82))], /* الخطوط */
      [C(cx - bw * 1.18, cy - bh * .38, 1.5),
       L([[cx - bw * 1.1, cy - bh * .82], [cx - bw * 1.35, cy - bh * 1.6]]),
       L([[cx - bw * .82, cy - bh * .95], [cx - bw * .88, cy - bh * 1.75]]),
       C(cx - bw * 1.37, cy - bh * 1.72, 1.6), C(cx - bw * .89, cy - bh * 1.88, 1.6),
       P("M" + e(cx + bw * .98, cy + bh * .12) + " L" + e(cx + bw * 1.35, cy + bh * .35))] /* اللوامس والإبرة */
    ];
  } };

  ANIMALS.penguin = { ar: "بطريق", en: "Penguin", build: function (r) {
    var bw = 19 + r() * 3, bh = 27 + r() * 3, cx = 50, cy = 58;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    return [
      [P("M" + e(cx - bw, cy + bh * .5) + " C" + e(cx - bw * 1.05, cy - bh * .85) + " " + e(cx + bw * 1.05, cy - bh * .85) + " " + e(cx + bw, cy + bh * .5) +
          " C" + e(cx + bw * .9, cy + bh * 1.05) + " " + e(cx - bw * .9, cy + bh * 1.05) + " " + e(cx - bw, cy + bh * .5) + " Z")],
      [P("M" + e(cx - bw * .6, cy - bh * .32) + " C" + e(cx - bw * .72, cy + bh * .6) + " " + e(cx + bw * .72, cy + bh * .6) + " " + e(cx + bw * .6, cy - bh * .32) +
          " C" + e(cx + bw * .35, cy - bh * .72) + " " + e(cx - bw * .35, cy - bh * .72) + " " + e(cx - bw * .6, cy - bh * .32) + " Z")], /* البطن */
      [C(cx - bw * .3, cy - bh * .62, 2), C(cx + bw * .3, cy - bh * .62, 2),
       P("M" + e(cx, cy - bh * .45) + " L" + e(cx - bw * .22, cy - bh * .28) + " L" + e(cx + bw * .22, cy - bh * .28) + " Z")], /* الوجه */
      [P("M" + e(cx - bw * .98, cy - bh * .18) + " C" + e(cx - bw * 1.5, cy + bh * .25) + " " + e(cx - bw * 1.35, cy + bh * .7) + " " + e(cx - bw * .92, cy + bh * .6)),
       P("M" + e(cx + bw * .98, cy - bh * .18) + " C" + e(cx + bw * 1.5, cy + bh * .25) + " " + e(cx + bw * 1.35, cy + bh * .7) + " " + e(cx + bw * .92, cy + bh * .6))], /* الجناحان */
      [P("M" + e(cx - bw * .55, cy + bh * 1.02) + " L" + e(cx - bw * .95, cy + bh * 1.2) + " L" + e(cx - bw * .2, cy + bh * 1.2) + " Z"),
       P("M" + e(cx + bw * .55, cy + bh * 1.02) + " L" + e(cx + bw * .95, cy + bh * 1.2) + " L" + e(cx + bw * .2, cy + bh * 1.2) + " Z")] /* القدمان */
    ];
  } };

  ANIMALS.sheep = { ar: "خروف", en: "Sheep", build: function (r) {
    var bw = 23 + r() * 3, bh = 16 + r() * 2, cx = 54, cy = 58;
    var e = function (a, b) { return n2(a) + " " + n2(b); };
    /* كرات الصوف تُركَّز **على محيط الجسم العلوي** فتصنع حافة غيمية متصلة.
       نثرها اعتباطاً حول الجسم يعطي فوضى لا صوفاً — جُرّب وشوهد. */
    var puffs = [], i, a, n = 7, pr = bh * .46;
    for (i = 0; i < n; i++) {
      a = Math.PI + (i / (n - 1)) * Math.PI;
      puffs.push(C(cx + bw * .94 * Math.cos(a), cy + bh * .92 * Math.sin(a), pr));
    }
    return [
      [E(cx, cy, bw, bh)],
      puffs,
      [E(cx - bw * 1.02, cy + bh * .1, bh * .48, bh * .60, -14)],
      [C(cx - bw * 1.14, cy - bh * .02, 1.4), C(cx - bw * .9, cy - bh * .06, 1.4),
       E(cx - bw * 1.32, cy - bh * .22, bh * .17, bh * .30, -42),
       E(cx - bw * .74, cy - bh * .26, bh * .17, bh * .30, 34),
       P("M" + e(cx - bw * 1.06, cy + bh * .48) + " L" + e(cx - bw * .98, cy + bh * .48))],
      [L([[cx - bw * .48, cy + bh * .95], [cx - bw * .5, cy + bh * 1.62]]),
       L([[cx - bw * .12, cy + bh * 1.0], [cx - bw * .14, cy + bh * 1.62]]),
       L([[cx + bw * .38, cy + bh * .97], [cx + bw * .4, cy + bh * 1.62]]),
       L([[cx + bw * .72, cy + bh * .78], [cx + bw * .74, cy + bh * 1.62]])]
    ];
  } };

  var ORDER = ["cat", "rabbit", "chick", "duck", "owl", "penguin", "sheep",
               "elephant", "fish", "turtle", "frog", "butterfly", "bee", "snail"];

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
