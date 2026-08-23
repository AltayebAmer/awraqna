/* أوراقنا — ربط صفحة الحنّة بالنواة. */
(function () {
  "use strict";
  var notHand = function (s) { return s.type !== "hand"; };
  Core.mount({
    key: "henna",
    answers: false,
    state: { type: "boteh", level: "med", fill: "lines", zones: true, fade: 0 },
    controls: [
      { k: "type", label: { ar: "النمط", en: "Motif" }, opts: [
        { v: "boteh",   ar: "بوتيه",  en: "Paisley" },
        { v: "flower",  ar: "زهرة",   en: "Flower" },
        { v: "mandala", ar: "دائرة",  en: "Mandala" },
        { v: "vine",    ar: "تعريشة", en: "Vine" },
        { v: "band",    ar: "شريط",   en: "Band" },
        { v: "corner",  ar: "زاوية",  en: "Corner" },
        { v: "hand",    ar: "قالب الكفّ", en: "Hand" }
      ] },
      { k: "level", label: { ar: "التفصيل", en: "Detail" }, showIf: notHand, opts: [
        { v: "easy", ar: "بسيط", en: "Simple" },
        { v: "med",  ar: "متوسط", en: "Medium" },
        { v: "hard", ar: "مزخرف", en: "Ornate" }
      ] },
      { k: "fill", label: { ar: "الحشو الداخلي", en: "Inner fill" },
        showIf: function (s) { return s.type === "boteh" || s.type === "corner"; }, opts: [
        { v: "lines", ar: "خطوط", en: "Lines" },
        { v: "cross", ar: "شبك",  en: "Cross-hatch" },
        { v: "dots",  ar: "نقاط", en: "Dots" },
        { v: "none",  ar: "فارغ", en: "Empty" }
      ] },
      { k: "zones", label: { ar: "مناطق إرشادية", en: "Guides" }, keepSeed: true,
        showIf: function (s) { return s.type === "hand"; }, opts: [
        { v: true,  ar: "نعم", en: "Yes" },
        { v: false, ar: "لا",  en: "No" }
      ] },
      { k: "fade", label: { ar: "الشفافية", en: "Fade" },
        type: "range", min: 0, max: 85, step: 5, unit: "%" }
    ],
    render: function (state) { return HennaGen.render(state); }
  });
})();
