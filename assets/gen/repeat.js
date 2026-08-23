/* ════════════════════════════════════════════════════════════
   أوراقنا — أداة التكرار (Repeat).
   عنصر واحد يُكرَّر شعاعياً أو شبكياً أو بالمرايا، على نمط
   Object > Repeat في Illustrator. كل شيء محسوب: لا صورة، لا أصل مرسوم.
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.RepeatGen = api;
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
  var f2 = function (n) { return (Math.round(n * 100) / 100).toString(); };

  /* ══════ العناصر السبعة ══════
     كل عنصر مرسوم داخل مربّع 100×100 مركزه (50,50)، ويقبل معاملات
     من العشوائية فيختلف شكله بين توليد وآخر دون أن يتغيّر نوعه. */
  function pathOf(kind, r) {
    var i, th, pts = [], d;
    var jitter = 0.85 + r() * 0.3;

    if (kind === "star") {
      var n = 5 + Math.floor(r() * 4), inner = (0.34 + r() * 0.16);
      for (i = 0; i < n * 2; i++) {
        th = (i / (n * 2)) * PI2 - Math.PI / 2;
        var rad = (i % 2 ? inner : 0.46) * 100 * jitter;
        pts.push([50 + rad * Math.cos(th), 50 + rad * Math.sin(th)]);
      }
      return "M" + pts.map(function (p) { return f2(p[0]) + " " + f2(p[1]); }).join(" L") + " Z";
    }

    if (kind === "petal") {
      var w = (14 + r() * 12) * jitter, h = 44 * jitter;
      return "M50 " + f2(50 + h) + " C" + f2(50 - w) + " " + f2(50 + h * 0.35) +
             " " + f2(50 - w) + " " + f2(50 - h * 0.35) + " 50 " + f2(50 - h) +
             " C" + f2(50 + w) + " " + f2(50 - h * 0.35) +
             " " + f2(50 + w) + " " + f2(50 + h * 0.35) + " 50 " + f2(50 + h) + " Z";
    }

    if (kind === "rhombus") {
      var a = 44 * jitter, b = (18 + r() * 18) * jitter;
      return "M50 " + f2(50 - a) + " L" + f2(50 + b) + " 50 L50 " + f2(50 + a) +
             " L" + f2(50 - b) + " 50 Z";
    }

    if (kind === "arc") {
      var R1 = 42 * jitter, R2 = R1 - (8 + r() * 10);
      return "M" + f2(50 - R1) + " 50 A" + f2(R1) + " " + f2(R1) + " 0 0 1 " + f2(50 + R1) + " 50" +
             " L" + f2(50 + R2) + " 50 A" + f2(R2) + " " + f2(R2) + " 0 0 0 " + f2(50 - R2) + " 50 Z";
    }

    if (kind === "triangle") {
      var t = 44 * jitter, sk = (r() - 0.5) * 22;
      return "M" + f2(50 + sk) + " " + f2(50 - t) + " L" + f2(50 + t) + " " + f2(50 + t * 0.7) +
             " L" + f2(50 - t) + " " + f2(50 + t * 0.7) + " Z";
    }

    if (kind === "rings") {
      var k = 2 + Math.floor(r() * 3), out = [];
      for (i = 0; i < k; i++) {
        var rr = (44 - i * (44 / (k + 0.6))) * jitter;
        out.push("M" + f2(50 - rr) + " 50 a" + f2(rr) + " " + f2(rr) + " 0 1 0 " + f2(rr * 2) +
                 " 0 a" + f2(rr) + " " + f2(rr) + " 0 1 0 " + f2(-rr * 2) + " 0 Z");
      }
      return out.join(" ");
    }

    /* drop — دمعة */
    var dh = 46 * jitter, dw = (20 + r() * 12) * jitter;
    return "M50 " + f2(50 - dh) + " C" + f2(50 + dw) + " " + f2(50 - dh * 0.1) +
           " " + f2(50 + dw * 0.9) + " " + f2(50 + dh) + " 50 " + f2(50 + dh) +
           " C" + f2(50 - dw * 0.9) + " " + f2(50 + dh) +
           " " + f2(50 - dw) + " " + f2(50 - dh * 0.1) + " 50 " + f2(50 - dh) + " Z";
  }

  var SHAPES = ["star", "petal", "rhombus", "arc", "triangle", "rings", "drop"];
  var SHAPE_NAMES = {
    star:     { ar: "نجمة",  en: "Star" },
    petal:    { ar: "بتلة",  en: "Petal" },
    rhombus:  { ar: "معيّن",  en: "Rhombus" },
    arc:      { ar: "قوس",   en: "Arc" },
    triangle: { ar: "مثلّث",  en: "Triangle" },
    rings:    { ar: "حلقات", en: "Rings" },
    drop:     { ar: "دمعة",  en: "Drop" }
  };

  /* ══════ أوضاع التكرار الثلاثة ══════
     كلها تُنفَّذ بـ <use> على تعريف واحد في <defs>: تعديل العنصر يسري
     على كل النسخ — وهو جوهر أداة Repeat، لا مجرّد نسخ ولصق. */
  /* «القطر» = بُعد **مركز** الشكل عن محور الدوران.
     عند صفر تتقاطع الأشكال عبر المركز فتنشأ الوردة الكثيفة (كما في
     مرجع Illustrator)، وكلما زاد انفتحت حلقة. جُرّب قياسه إلى حافة
     الشكل فبقي ثقب في المنتصف دائماً ولم تُنتَج الوردة أبداً. */
  function radial(id, count, radius, spin, scale) {
    var out = [], i, off = radius;
    for (i = 0; i < count; i++) {
      var a = (i / count) * 360 + spin;
      out.push('<use href="#' + id + '" transform="rotate(' + f2(a) + ' 200 200) ' +
               'translate(0 ' + f2(-off) + ') translate(200 200) scale(' + f2(scale) + ') translate(-50 -50)"/>');
    }
    return out.join("");
  }

  function grid(id, cols, rows, gapX, gapY, scale) {
    var out = [], x, y;
    var w = (cols - 1) * gapX, h = (rows - 1) * gapY;
    for (y = 0; y < rows; y++) for (x = 0; x < cols; x++) {
      var cx = 200 - w / 2 + x * gapX, cy = 200 - h / 2 + y * gapY;
      out.push('<use href="#' + id + '" transform="translate(' + f2(cx) + ' ' + f2(cy) +
               ') scale(' + f2(scale) + ') translate(-50 -50)"/>');
    }
    return out.join("");
  }

  /* المرآة تعكس أفقياً حول محور رأسي: نسخة يمين وأخرى مقلوبة يسار
     ⇒ شكل الفراشة. الإزاحة رأسية كانت تعطي نسختين فوق/تحت لا جناحين. */
  function mirror(id, axes, offset, scale) {
    var out = [], i;
    for (i = 0; i < axes; i++) {
      var a = (i / axes) * 180;
      out.push('<use href="#' + id + '" transform="rotate(' + f2(a) + ' 200 200) ' +
               'translate(200 200) translate(' + f2(offset) + ' 0) scale(' + f2(scale) +
               ') translate(-50 -50)"/>');
      out.push('<use href="#' + id + '" transform="rotate(' + f2(a) + ' 200 200) ' +
               'translate(200 200) translate(' + f2(-offset) + ' 0) scale(' + f2(-scale) + ' ' + f2(scale) +
               ') translate(-50 -50)"/>');
    }
    return out.join("");
  }

  function build(state) {
    var r = rng(state.seed);
    var kind = SHAPES.indexOf(state.shape) === -1 ? "star" : state.shape;
    var d = pathOf(kind, r);
    /* معرّف فريد لكل رسم: `<use href="#id">` يلتقط **أول** عنصر بهذا المعرّف
       في المستند كلّه. معرّف ثابت يجعل كل الأشكال على صفحة واحدة نسخةً من
       أوّلها — حدث فعلاً وشوهد في شبكة المعاينة. */
    var id = "m" + (state.seed >>> 0).toString(36) + kind + (state.mode || "r");
    var sw = 1.6;
    var body, guides = "";

    if (state.mode === "grid") {
      var cols = state.cols || 5, rowsN = state.rows || 6;
      var gap = 340 / Math.max(cols, rowsN);
      var scale = (gap * (state.size || 100) / 100) / 100;
      body = grid(id, cols, rowsN, gap, gap, scale);
    } else if (state.mode === "mirror") {
      var axes = state.axes || 4;
      var sc = (state.size || 100) / 100 * 0.95;
      body = mirror(id, axes, state.radius || 90, sc);
      /* خطوط التناظر تُرسم منقّطة لتُظهر بنية التصميم للمصمّم. */
      for (var i = 0; i < axes; i++) {
        var a = (i / axes) * 180;
        guides += '<line x1="200" y1="10" x2="200" y2="390" stroke="#c9c9c9" stroke-width="0.6" ' +
                  'stroke-dasharray="4 4" transform="rotate(' + f2(a) + ' 200 200)"/>';
      }
    } else {
      var cnt = state.count || 12;
      body = radial(id, cnt, state.radius || 110, state.spin || 0, (state.size || 100) / 100 * 0.95);
    }

    return '<svg class="rp-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" ' +
           'preserveAspectRatio="xMidYMid meet">' +
           '<rect width="400" height="400" fill="#fff"/>' +
           '<defs><path id="' + id + '" d="' + d + '" fill="none" stroke="#111" stroke-width="' + sw +
           '" stroke-linejoin="round"/></defs>' + guides + body + "</svg>";
  }

  var MODES = {
    radial: { ar: "شعاعي", en: "Radial" },
    grid:   { ar: "شبكي",  en: "Grid" },
    mirror: { ar: "مرآوي", en: "Mirror" }
  };

  function render(state) {
    var m = MODES[state.mode] || MODES.radial;
    var sn = SHAPE_NAMES[state.shape] || SHAPE_NAMES.star;
    var detail = state.mode === "grid"
        ? (state.cols + "×" + state.rows)
        : state.mode === "mirror"
          ? (state.axes + (typeof Core !== "undefined" && Core.EN && Core.EN() ? " axes" : " محاور"))
          : (state.count + (typeof Core !== "undefined" && Core.EN && Core.EN() ? " copies" : " نسخة"));
    return {
      title: { ar: "زخرفة بالتكرار", en: "Repeat pattern" },
      sub: {
        ar: sn.ar + " · " + m.ar + " · " + detail,
        en: sn.en + " · " + m.en + " · " + detail
      },
      sheet: '<div class="rp-wrap">' + build(state) + "</div>",
      answers: ""
    };
  }

  return { render: render, build: build, pathOf: pathOf,
           SHAPES: SHAPES, SHAPE_NAMES: SHAPE_NAMES, MODES: MODES };
});
