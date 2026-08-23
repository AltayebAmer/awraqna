/* أوراقنا — ربط صفحة الزخرفة والتكرار بالنواة. */
(function () {
  "use strict";
  var isR = function (s) { return s.mode === "radial"; };
  var isG = function (s) { return s.mode === "grid"; };
  var isM = function (s) { return s.mode === "mirror"; };

  Core.mount({
    key: "repeat",
    answers: false,
    state: { shape: "petal", mode: "radial", count: 16, radius: 0,
             spin: 0, cols: 5, rows: 6, axes: 2, size: 140, weight: 16, per: 1, fade: 0 },
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
        type: "range", min: 20, max: 180, unit: "%" },
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
