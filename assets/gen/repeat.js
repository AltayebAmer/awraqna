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

  /* عدّاد يضمن تفرّد معرّف <defs> في كل استدعاء مهما تطابقت المعاملات.
     الاعتماد على الـseed وحده يجعل رسمين بنفس الإعدادات على صفحة واحدة
     يتشاركان المعرّف، فيلتقط `<use>` أوّلهما ويظهر الرسمان متطابقين. */
  var uid = 0;

  /* ══════ العناصر السبعة ══════
     كل عنصر مرسوم داخل مربّع 100×100 مركزه (50,50)، ويقبل معاملات
     من العشوائية فيختلف شكله بين توليد وآخر دون أن يتغيّر نوعه. */
  function pathOf(kind, r, st) {
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

    /* ══ الدوّامة — شفرات حلزونية متناقصة العرض ══
       كل شفرة محصورة بين قوسين حلزونيين تفصلهما زاوية تضيق نحو الطرف،
       فتنشأ الشفرة المدبَّبة. هذا هو أثر Swirl في المراجع البصرية. */
    if (kind === "swirl") {
      var sw2 = st || {};
      var N = sw2.swBlades === undefined ? 16 : sw2.swBlades;
      var twist = (sw2.swTwist === undefined ? 150 : sw2.swTwist) * Math.PI / 180;
      var ri = (sw2.swInner === undefined ? 8 : sw2.swInner);
      var ro = 46 * jitter;
      var gap = (PI2 / N) * 0.92;
      var o7 = [], b, u2, S = 30;
      for (b = 0; b < N; b++) {
        var a0 = (b / N) * PI2 - Math.PI / 2, pts7 = [];
        /* الحافة الأمامية: من الداخل إلى الطرف. */
        for (u2 = 0; u2 <= S; u2++) {
          var t7 = u2 / S;
          var rd = ri + (ro - ri) * t7, an = a0 + twist * t7;
          pts7.push(f2(50 + rd * Math.cos(an)) + " " + f2(50 + rd * Math.sin(an)));
        }
        /* الحافة الخلفية: من الطرف إلى الداخل، والانفراج يتّسع كلما اقتربنا
           من المركز ⇒ شفرة عريضة عند القلب مدبَّبة عند الحافة. */
        for (u2 = 0; u2 <= S; u2++) {
          var t8 = u2 / S;
          var rd2 = ri + (ro - ri) * (1 - t8);
          var an2 = a0 + twist * (1 - t8) + gap * t8;
          pts7.push(f2(50 + rd2 * Math.cos(an2)) + " " + f2(50 + rd2 * Math.sin(an2)));
        }
        o7.push("M" + pts7.join(" L") + " Z");
      }
      return o7.join(" ");
    }

    /* ══ النقاط الحلزونية — توزيع فيلوتاكسي ══
       زاوية ذهبية 137.5° ونصف قطر √i: هو ترتيب بذور دوّار الشمس نفسه،
       وحجم النقطة يتبع بُعدها فينشأ تدرّج بصري. */
    if (kind === "phyllo") {
      var ph = st || {};
      var NP = ph.phCount === undefined ? 260 : ph.phCount;
      var GA = 137.507764 * Math.PI / 180;
      var Rm = 46 * jitter, o8 = [], i8;
      for (i8 = 1; i8 <= NP; i8++) {
        var f8 = Math.sqrt(i8 / NP);
        var rr8 = Rm * f8, an8 = i8 * GA;
        /* حجم النقطة يتناسب عكسياً مع جذر عددها، وإلا التحمت
           النقاط عند الكثافة العالية فصارت قرصاً أسود. */
        var dr8 = (0.5 + 2.4 * f8) * Math.sqrt(260 / NP);
        var x8 = 50 + rr8 * Math.cos(an8), y8 = 50 + rr8 * Math.sin(an8);
        o8.push("M" + f2(x8 - dr8) + " " + f2(y8) + " a" + f2(dr8) + " " + f2(dr8) + " 0 1 0 " +
                f2(dr8 * 2) + " 0 a" + f2(dr8) + " " + f2(dr8) + " 0 1 0 " + f2(-dr8 * 2) + " 0 Z");
      }
      return o8.join(" ");
    }

    /* ══ الحلزون — على نهج Spiral Tool في Illustrator ══
       حلزون لوغاريتمي: نصف القطر يُضرب في معامل الاضمحلال عند كل ربع دورة.
       المعاملات الأربعة هي نفسها: نصف القطر · الاضمحلال · عدد القطاعات · الاتجاه.
       ويُضاف خيار الأوراق ليصبح غصناً متسلّقاً — وهو غرض الزخرفة النباتية. */
    if (kind === "spiral") {
      var sp = st || {};
      var R = (sp.spR === undefined ? 44 : sp.spR) * jitter;
      /* الاضمحلال في Illustrator يُقاس **لكل لفّة كاملة** لا لكل قطاع،
         واللفّة = ٤ قطاعات. تطبيقه لكل قطاع جعل 80% تساوي 0.8⁴ ≈ 41%
         للفّة الواحدة فخرج الحلزون أضيق بكثير من أداة Adobe. */
      var decay = (sp.spDecay === undefined ? 80 : sp.spDecay) / 100;
      var perSeg = Math.pow(decay, 1 / 4);
      var segs = sp.spSegs === undefined ? 14 : sp.spSegs;
      var dir = sp.spDir === "ccw" ? -1 : 1;
      var out = [], t, pts = [], step = 0.06;
      for (t = 0; t <= segs; t += step) {
        var ang = t * (Math.PI / 2) * dir - Math.PI / 2;
        var rr = R * Math.pow(perSeg, t);
        pts.push(f2(50 + rr * Math.cos(ang)) + " " + f2(50 + rr * Math.sin(ang)));
      }
      out.push("M" + pts.join(" L"));

      if (sp.spLeaves) {
        /* الورقة تنبت **شعاعياً إلى الخارج** لا مماسّاً: التوجيه المماسّي
           يجعلها تعبر الحلزون نفسه فينشأ تشابك لا غصن — جُرّب وشوهد.
           وتُحذف أوراق القلب لأن نصف القطر هناك أصغر من الورقة. */
        var k;
        for (k = 1; k <= segs; k++) {
          var a2 = k * (Math.PI / 2) * dir - Math.PI / 2;
          var r2 = R * Math.pow(perSeg, k);
          if (r2 < R * 0.22) break;
          var ux = Math.cos(a2), uy = Math.sin(a2);
          var bx = 50 + r2 * ux, by = 50 + r2 * uy;
          var lv = r2 * 0.5;
          var tipx = bx + lv * 1.5 * ux, tipy = by + lv * 1.5 * uy;
          var px = -uy * lv * 0.5, py = ux * lv * 0.5;
          out.push("M" + f2(bx) + " " + f2(by) +
                   " Q" + f2((bx + tipx) / 2 + px) + " " + f2((by + tipy) / 2 + py) + " " + f2(tipx) + " " + f2(tipy) +
                   " Q" + f2((bx + tipx) / 2 - px) + " " + f2((by + tipy) / 2 - py) + " " + f2(bx) + " " + f2(by) + " Z");
        }
      }
      return out.join(" ");
    }

    if (kind === "leaf") {
      /* ورقة: شكل لوزي + عِرق أوسط + عروق جانبية متناظرة. */
      var lw = (16 + r() * 8) * jitter, lh = 44 * jitter, out = [], i, k;
      out.push("M50 " + f2(50 + lh) + " C" + f2(50 - lw) + " " + f2(50 + lh * .35) +
               " " + f2(50 - lw * .9) + " " + f2(50 - lh * .45) + " 50 " + f2(50 - lh) +
               " C" + f2(50 + lw * .9) + " " + f2(50 - lh * .45) +
               " " + f2(50 + lw) + " " + f2(50 + lh * .35) + " 50 " + f2(50 + lh) + " Z");
      out.push("M50 " + f2(50 + lh) + " L50 " + f2(50 - lh));
      for (i = 1; i <= 4; i++) {
        k = -lh * .55 + (i / 5) * lh * 1.25;
        var sp = lw * (1 - Math.abs(k) / lh) * .8;
        out.push("M50 " + f2(50 + k) + " L" + f2(50 - sp) + " " + f2(50 + k + lh * .16));
        out.push("M50 " + f2(50 + k) + " L" + f2(50 + sp) + " " + f2(50 + k + lh * .16));
      }
      return out.join(" ");
    }

    if (kind === "flower") {
      /* البتلة منحنيان تربيعيان حول محورها: نقطتا التحكّم على عمودي المحور
         عند منتصفه. البناء بمنحنيات مكعّبة أعطى أشواكاً لا بتلات — جُرّب. */
      var np = 5 + Math.floor(r() * 3), pl = 36 * jitter, pw = 11 + r() * 7, o2 = [], j;
      for (j = 0; j < np; j++) {
        var th = (j / np) * PI2 - Math.PI / 2;
        var cs = Math.cos(th), sn = Math.sin(th);
        var tx = 50 + pl * cs, ty = 50 + pl * sn;
        var mx = 50 + pl * .55 * cs, my = 50 + pl * .55 * sn;
        var px = -sn * pw, py = cs * pw;
        o2.push("M50 50 Q" + f2(mx + px) + " " + f2(my + py) + " " + f2(tx) + " " + f2(ty) +
                " Q" + f2(mx - px) + " " + f2(my - py) + " 50 50 Z");
      }
      var cr = 6 + r() * 4;
      o2.push("M" + f2(50 - cr) + " 50 a" + f2(cr) + " " + f2(cr) + " 0 1 0 " + f2(cr * 2) +
              " 0 a" + f2(cr) + " " + f2(cr) + " 0 1 0 " + f2(-cr * 2) + " 0 Z");
      return o2.join(" ");
    }

    /* أُعيدت الوردة إلى بنائها السابق (حلزون ناعم + بتلات محيطية).
       بناء «Spiral Rose» بالبتلات المنتفخة على طول الحلزون جُرّب ثلاث
       مرات بمعاملات مختلفة وبقيت البتلات ملتصقة بالحلزون لا تُقرأ
       كوردة — الأقل ادّعاءً أصدق من الأكثر تعقيداً. */
    if (kind === "rose") {
      /* وردة من أعلى: حلزون ناعم في القلب وبتلات مستديرة حوله.
         الأقواس المتغيّرة نصف القطر (A) أعطت شكلاً مشوّهاً — استُبدلت بخطّ حلزوني. */
      var R0 = 40 * jitter, o3 = [], i2, a3, rr3, pts3 = [];
      for (i2 = 0; i2 <= 90; i2++) {
        a3 = (i2 / 90) * PI2 * 2.7 - Math.PI / 2;
        rr3 = 3 + (R0 * .58 - 3) * (i2 / 90);
        pts3.push(f2(50 + rr3 * Math.cos(a3)) + " " + f2(50 + rr3 * Math.sin(a3)));
      }
      o3.push("M" + pts3.join(" L"));
      var npp = 6 + Math.floor(r() * 3), k3;
      for (k3 = 0; k3 < npp; k3++) {
        var b1 = (k3 / npp) * PI2 - Math.PI / 2, b2 = ((k3 + 1) / npp) * PI2 - Math.PI / 2;
        var bm = (b1 + b2) / 2;
        var x1 = 50 + R0 * .62 * Math.cos(b1), y1 = 50 + R0 * .62 * Math.sin(b1);
        var x2 = 50 + R0 * .62 * Math.cos(b2), y2 = 50 + R0 * .62 * Math.sin(b2);
        var xm = 50 + R0 * 1.05 * Math.cos(bm), ym = 50 + R0 * 1.05 * Math.sin(bm);
        o3.push("M" + f2(x1) + " " + f2(y1) + " Q" + f2(xm) + " " + f2(ym) + " " + f2(x2) + " " + f2(y2));
      }
      return o3.join(" ");
    }

    if (kind === "branch") {
      /* غصن: ساق منحنٍ وأوراق متناوبة تصغر نحو القمة. */
      var bl = 46 * jitter, o4 = [], m, N = 5 + Math.floor(r() * 3);
      o4.push("M50 " + f2(50 + bl) + " C" + f2(50 - 10) + " " + f2(50 + bl * .3) +
              " " + f2(50 + 10) + " " + f2(50 - bl * .3) + " 50 " + f2(50 - bl));
      for (m = 0; m < N; m++) {
        var u = m / (N - 1), y = 50 + bl - u * bl * 1.85;
        var side = m % 2 ? 1 : -1, ls = (16 - u * 9) * jitter;
        o4.push("M50 " + f2(y) + " C" + f2(50 + side * ls * .6) + " " + f2(y - ls * .55) +
                " " + f2(50 + side * ls) + " " + f2(y - ls * .5) + " " + f2(50 + side * ls * 1.15) + " " + f2(y - ls * .95) +
                " C" + f2(50 + side * ls * .7) + " " + f2(y - ls * .55) +
                " " + f2(50 + side * ls * .35) + " " + f2(y - ls * .2) + " 50 " + f2(y));
      }
      return o4.join(" ");
    }

    if (kind === "tulip") {
      /* خزامى: كأس بثلاث فصوص وساق وورقتان. */
      var tw = 20 * jitter, th2 = 26 * jitter, o5 = [];
      o5.push("M" + f2(50 - tw) + " " + f2(50 - th2 * .2) +
              " C" + f2(50 - tw) + " " + f2(50 + th2 * .9) + " " + f2(50 + tw) + " " + f2(50 + th2 * .9) +
              " " + f2(50 + tw) + " " + f2(50 - th2 * .2) +
              " L" + f2(50 + tw * .55) + " " + f2(50 - th2) +
              " L" + f2(50 + tw * .18) + " " + f2(50 - th2 * .45) +
              " L50 " + f2(50 - th2 * 1.1) +
              " L" + f2(50 - tw * .18) + " " + f2(50 - th2 * .45) +
              " L" + f2(50 - tw * .55) + " " + f2(50 - th2) + " Z");
      o5.push("M50 " + f2(50 + th2 * .85) + " L50 " + f2(50 + th2 * 1.9));
      o5.push("M50 " + f2(50 + th2 * 1.25) + " C" + f2(50 - tw * 1.3) + " " + f2(50 + th2 * 1.0) +
              " " + f2(50 - tw * 1.2) + " " + f2(50 + th2 * 1.75) + " 50 " + f2(50 + th2 * 1.62));
      o5.push("M50 " + f2(50 + th2 * 1.45) + " C" + f2(50 + tw * 1.3) + " " + f2(50 + th2 * 1.2) +
              " " + f2(50 + tw * 1.2) + " " + f2(50 + th2 * 1.95) + " 50 " + f2(50 + th2 * 1.82));
      return o5.join(" ");
    }

    if (kind === "fern") {
      /* سعفة: ساق وأوراق مزدوجة متقابلة تصغر تدريجياً. */
      var fl = 44 * jitter, o6 = [], q, M = 8 + Math.floor(r() * 4);
      o6.push("M50 " + f2(50 + fl) + " L50 " + f2(50 - fl));
      for (q = 0; q < M; q++) {
        var v = q / (M - 1), yy = 50 + fl - v * fl * 1.92;
        var len = (18 - v * 14) * jitter, drop = len * .55;
        o6.push("M50 " + f2(yy) + " C" + f2(50 - len * .5) + " " + f2(yy - drop * .2) +
                " " + f2(50 - len * .9) + " " + f2(yy - drop * .7) + " " + f2(50 - len) + " " + f2(yy - drop));
        o6.push("M50 " + f2(yy) + " C" + f2(50 + len * .5) + " " + f2(yy - drop * .2) +
                " " + f2(50 + len * .9) + " " + f2(yy - drop * .7) + " " + f2(50 + len) + " " + f2(yy - drop));
      }
      return o6.join(" ");
    }

    /* drop — دمعة */
    var dh = 46 * jitter, dw = (20 + r() * 12) * jitter;
    return "M50 " + f2(50 - dh) + " C" + f2(50 + dw) + " " + f2(50 - dh * 0.1) +
           " " + f2(50 + dw * 0.9) + " " + f2(50 + dh) + " 50 " + f2(50 + dh) +
           " C" + f2(50 - dw * 0.9) + " " + f2(50 + dh) +
           " " + f2(50 - dw) + " " + f2(50 - dh * 0.1) + " 50 " + f2(50 - dh) + " Z";
  }

  var SHAPES = ["star", "petal", "rhombus", "arc", "triangle", "rings", "drop",
              "leaf", "flower", "rose", "tulip", "branch", "fern",
              "spiral", "swirl", "phyllo"];
  var SHAPE_NAMES = {
    star:     { ar: "نجمة",  en: "Star" },
    petal:    { ar: "بتلة",  en: "Petal" },
    rhombus:  { ar: "معيّن",  en: "Rhombus" },
    arc:      { ar: "قوس",   en: "Arc" },
    triangle: { ar: "مثلّث",  en: "Triangle" },
    rings:    { ar: "حلقات", en: "Rings" },
    drop:     { ar: "دمعة",  en: "Drop" },
    leaf:     { ar: "ورقة",  en: "Leaf" },
    flower:   { ar: "زهرة",  en: "Flower" },
    rose:     { ar: "وردة",  en: "Rose" },
    tulip:    { ar: "خزامى", en: "Tulip" },
    branch:   { ar: "غصن",   en: "Branch" },
    fern:     { ar: "سعفة",  en: "Fern" },
    spiral:   { ar: "حلزون",  en: "Spiral" },
    swirl:    { ar: "دوّامة",  en: "Swirl" },
    phyllo:   { ar: "نقاط حلزونية", en: "Spiral dots" }
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

  /* الدوّامة والنقاط تُملأ افتراضاً — بلا تعبئة تفقد أثرها البصري.
     ويبقى الخيار مفتوحاً لورقة تلوين مفرّغة. */
  function fillOf(kind, state) {
    if (kind !== "swirl" && kind !== "phyllo") return "none";
    return state.solid === false ? "none" : "#111";
  }

  function build(state) {
    var r = rng(state.seed);
    var kind = SHAPES.indexOf(state.shape) === -1 ? "star" : state.shape;
    var d = pathOf(kind, r, state);
    /* معرّف فريد لكل رسم: `<use href="#id">` يلتقط **أول** عنصر بهذا المعرّف
       في المستند كلّه. معرّف ثابت يجعل كل الأشكال على صفحة واحدة نسخةً من
       أوّلها — حدث فعلاً وشوهد في شبكة المعاينة. */
    var id = "m" + (++uid).toString(36) + (state.seed >>> 0).toString(36) + kind;
    /* السماكة تُقسَم على النسبة حين تصغر الزخرفة على الورقة، وإلا بدت
       ثمانيةُ زخارف أثخنَ من واحدة رغم أن القيمة نفسها. */
    var sw = (state.weight === undefined ? 1.6 : state.weight / 10);
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
           '<defs><path id="' + id + '" d="' + d + '" fill="' + fillOf(kind, state) +
           '" stroke="#111" stroke-width="' + sw + '" stroke-linejoin="round"/></defs>' + guides + body + "</svg>";
  }

  var MODES = {
    radial: { ar: "شعاعي", en: "Radial" },
    grid:   { ar: "شبكي",  en: "Grid" },
    mirror: { ar: "مرآوي", en: "Mirror" }
  };

  var PER = { 1: [1, 1], 4: [2, 2], 8: [2, 4] };

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
      sheet: (function () {
        var per = PER[state.per] ? Number(state.per) : 1;
        if (per === 1) return '<div class="rp-wrap">' + build(state) + "</div>";
        /* نسخ متطابقة عمداً: الورقة تُقصّ إلى بطاقات أو تُوزَّع على المجموعة. */
        var cells = [], i, st;
        for (i = 0; i < per; i++) {
          /* معرّف فريد لكل نسخة: نسخ متطابقة بمعرّف واحد تعمل بالمصادفة،
             لأن `<use>` يلتقط أول تعريف — وهي مصادفة لا يُبنى عليها. */
          st = {}; for (var k in state) st[k] = state[k];
          st.idx = "x" + i;
          cells.push('<div class="rp-cell">' + build(st) + "</div>");
        }
        return '<div class="rp-grid" data-per="' + per + '">' + cells.join("") + "</div>";
      })(),
      answers: ""
    };
  }

  return { render: render, build: build, pathOf: pathOf,
           SHAPES: SHAPES, SHAPE_NAMES: SHAPE_NAMES, MODES: MODES };
});
