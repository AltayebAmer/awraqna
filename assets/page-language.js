/* أوراقنا — ربط صفحة الحروف بالنواة. */
(function () {
  "use strict";
  Core.mount({
    key: "language",
    answers: false,
    state: { script: "ar", mode: "trace", per: 2, fontAr: "naskh", fontEn: "modern" },
    controls: [
      { k: "script", label: { ar: "الأبجدية", en: "Alphabet" }, opts: [
        { v: "ar",     ar: "حروف عربية",    en: "Arabic letters" },
        { v: "en",     ar: "حروف إنجليزية", en: "English letters" },
        /* ٠١٢٣ = «هندية» بالعربية و Arabic بالإنجليزية، و 0123 عكسها. */
        { v: "ar-num", ar: "أرقام هندية ٠-٩", en: "Arabic numerals ٠-٩" },
        { v: "en-num", ar: "أرقام عربية 0-9", en: "Western numerals 0-9" }
      ] },
      { k: "mode", label: { ar: "النشاط", en: "Activity" }, opts: [
        { v: "trace", ar: "تتبّع", en: "Trace" },
        { v: "color", ar: "تلوين", en: "Colour" }
      ] },
      /* الزرّان يظهران دائماً في النسختين — المفعَّل منهما تختاره الأبجدية. */
      { k: "fontAr", label: { ar: "أنواع الخطوط العربية", en: "Arabic script style" }, opts: [
        { v: "naskh",   ar: "نسخ",     en: "Naskh" },
        { v: "ruqaa",   ar: "رقعة",    en: "Ruqʿah" },
        { v: "kufi",    ar: "كوفي",    en: "Kufi" },
        { v: "thuluth", ar: "ثلث",     en: "Thuluth" },
        { v: "auto",    ar: "افتراضي", en: "Default" }
      ] },
      { k: "fontEn", label: { ar: "أنواع الخطوط الإنجليزية", en: "English script style" }, opts: [
        { v: "modern",      ar: "حديث",    en: "Modern" },
        { v: "handwriting", ar: "يدوي",    en: "Handwriting" },
        { v: "calligraphy", ar: "خطّي",     en: "Calligraphy" },
        { v: "auto",        ar: "افتراضي", en: "Default" }
      ] },
      { k: "per", label: { ar: "لكل ورقة", en: "Per page" }, opts: [
        { v: 1, ar: "حرف واحد", en: "One" },
        { v: 2, ar: "حرفان",    en: "Two" },
        { v: 4, ar: "أربعة",    en: "Four" }
      ] }
    ],
    render: function (state) { return LangGen.render(state); }
  });
})();
