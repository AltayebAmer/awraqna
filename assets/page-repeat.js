/* أوراقنا — ربط صفحة الزخرفة والتكرار بالنواة. */
(function () {
  "use strict";
  var isR = function (s) { return s.mode === "radial"; };
  var isG = function (s) { return s.mode === "grid"; };
  var isM = function (s) { return s.mode === "mirror"; };
  var isSp = function (s) { return s.shape === "spiral"; };
  var hasSides = function (s) { return s.shape === "polygon" || s.shape === "star" || s.shape === "flare"; };
  var hasInner = function (s) { return s.shape === "star" || s.shape === "flare"; };
  var isRect   = function (s) { return s.shape === "rect"; };
  var hasRatio = function (s) { return s.shape === "rect" || s.shape === "ellipse"; };
  var isSw = function (s) { return s.shape === "swirl"; };
  var isPh = function (s) { return s.shape === "phyllo"; };
  var isFilled = function (s) { return s.shape === "swirl" || s.shape === "phyllo"; };

  Core.mount({
    key: "repeat",
    answers: false,
    state: { shape: "petal", mode: "radial", count: 16, radius: 0,
             spin: 0, cols: 5, rows: 6, axes: 2, size: 140, weight: 16, per: 1, fade: 0,
             spR: 44, spDecay: 80, spSegs: 14, spDir: "cw", spLeaves: false,
             swBlades: 16, swTwist: 150, swInner: 8, phCount: 260, solid: true },
    controls: [
      { k: "shape", label: { ar: "الشكل", en: "Shape" },
        opts: RepeatGen.SHAPES.map(function (s) {
          return { v: s, ar: RepeatGen.SHAPE_NAMES[s].ar, en: RepeatGen.SHAPE_NAMES[s].en };
        }) },
      /* تغيير الوضع لا يغيّر الـ seed: الشكل نفسه يجب أن يبقى
         ليرى المصمّم أثر الوضع وحده — كما في Illustrator. */
      { k: "mode", label: { ar: "نوع التكرار", en: "Repeat" }, keepSeed: true, opts: [
        { v: "radial", ar: "شعاعي", en: "Radial" },
        { v: "grid",   ar: "شبكي",  en: "Grid" },
        { v: "mirror", ar: "مرآوي", en: "Mirror" }
      ] },

      /* مساطر أدوات الأشكال — كلٌّ تظهر مع شكلها وحده.
         النسبة عند 100% تعطي مربّعاً ودائرة مثاليين. */
      { k: "shSides", label: { ar: "عدد الأضلاع/الرؤوس", en: "Sides / points" },
        type: "range", min: 3, max: 20, showIf: hasSides },
      { k: "shInner", label: { ar: "نصف القطر الداخلي", en: "Inner radius" },
        type: "range", min: 10, max: 90, unit: "%", showIf: hasInner },
      { k: "shRound", label: { ar: "استدارة الزوايا", en: "Corner radius" },
        type: "range", min: 0, max: 100, unit: "%", showIf: isRect },
      { k: "shRatio", label: { ar: "النسبة (عرض/ارتفاع)", en: "Ratio (W/H)" },
        type: "range", min: 30, max: 300, unit: "%", showIf: hasRatio },

      /* مساطر أداة الحلزون — تظهر مع الشكل الحلزوني وحده،
         تماماً كلوحة Spiral Tool في Illustrator. */
      { k: "spR",     label: { ar: "نصف قطر الحلزون", en: "Spiral radius" },
        type: "range", min: 12, max: 48, showIf: isSp },
      { k: "spDecay", label: { ar: "الاضمحلال (لكل لفّة)", en: "Decay (per wind)" },
        type: "range", min: 50, max: 95, unit: "%", showIf: isSp },
      { k: "spSegs",  label: { ar: "القطاعات (٤ = لفّة)", en: "Segments (4 = 1 wind)" },
        type: "range", min: 3, max: 40, showIf: isSp },
      { k: "spDir",   label: { ar: "اتجاه اللف", en: "Direction" }, keepSeed: true, showIf: isSp, opts: [
        { v: "cw",  ar: "مع العقارب", en: "Clockwise" },
        { v: "ccw", ar: "عكس العقارب", en: "Counter-CW" }
      ] },
      { k: "spLeaves", label: { ar: "أوراق على الحلزون", en: "Leaves" }, keepSeed: true, showIf: isSp, opts: [
        { v: false, ar: "بلا أوراق", en: "None" },
        { v: true,  ar: "بأوراق",   en: "With leaves" }
      ] },

      { k: "swBlades", label: { ar: "عدد الشفرات", en: "Blades" },
        type: "range", min: 3, max: 48, showIf: isSw },
      { k: "swTwist",  label: { ar: "زاوية اللف", en: "Twist" },
        type: "range", min: 20, max: 360, step: 5, unit: "°", showIf: isSw },
      { k: "swInner",  label: { ar: "الفراغ الداخلي", en: "Inner hole" },
        type: "range", min: 0, max: 34, showIf: isSw },
      { k: "phCount",  label: { ar: "عدد النقاط", en: "Dots" },
        type: "range", min: 40, max: 600, step: 10, showIf: isPh },
      { k: "solid",    label: { ar: "التعبئة", en: "Fill" }, keepSeed: true, showIf: isFilled, opts: [
        { v: true,  ar: "مصمت",  en: "Solid" },
        { v: false, ar: "مفرّغ", en: "Outline" }
      ] },

      { k: "count",  label: { ar: "عدد التكرار", en: "Copies" },
        type: "range", min: 3, max: 36, showIf: isR },
      { k: "radius", label: { ar: "القطر", en: "Radius" },
        type: "range", min: 0, max: 130, showIf: function (s) { return isR(s) || isM(s); } },
      { k: "spin",   label: { ar: "زاوية البدء", en: "Start angle" },
        type: "range", min: 0, max: 359, unit: "°", showIf: isR },

      { k: "cols",   label: { ar: "التكرار الأفقي", en: "Columns" },
        type: "range", min: 1, max: 14, showIf: isG },
      { k: "rows",   label: { ar: "التكرار العمودي", en: "Rows" },
        type: "range", min: 1, max: 18, showIf: isG },

      { k: "axes",   label: { ar: "خطوط التناظر", en: "Mirror axes" },
        type: "range", min: 2, max: 12, showIf: isM },

      { k: "size",   label: { ar: "حجم الشكل", en: "Shape size" },
        type: "range", min: 20, max: 320, unit: "%" },
      { k: "weight", label: { ar: "سماكة الخط", en: "Line weight" },
        type: "range", min: 4, max: 60, step: 2 },
      { k: "per",    label: { ar: "زخارف لكل ورقة", en: "Per page" }, keepSeed: true, opts: [
        { v: 1, ar: "واحدة", en: "One" },
        { v: 4, ar: "أربع",  en: "Four" },
        { v: 8, ar: "ثماني", en: "Eight" }
      ] },
      { k: "fade", label: { ar: "الشفافية", en: "Fade" },
        type: "range", min: 0, max: 85, step: 5, unit: "%" }
    ],
    render: function (state) { return RepeatGen.render(state); }
  });
})();
