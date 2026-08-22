/* أوراقنا — ربط صفحة الحروف بالنواة. */
(function () {
  "use strict";
  Core.mount({
    key: "language",
    answers: false,
    state: { script: "ar", mode: "trace", per: 2, font: "naskh" },
    controls: [
      { k: "script", label: { ar: "الأبجدية", en: "Alphabet" }, opts: [
        { v: "ar",     ar: "حروف عربية",   en: "Arabic letters" },
        { v: "en",     ar: "حروف إنجليزية", en: "English letters" },
        { v: "ar-num", ar: "أرقام عربية",   en: "Arabic-Indic ٠-٩" },
        { v: "en-num", ar: "أرقام 0-9",     en: "Numerals 0-9" }
      ] },
      { k: "mode", label: { ar: "النشاط", en: "Activity" }, opts: [
        { v: "trace", ar: "تتبّع", en: "Trace" },
        { v: "color", ar: "تلوين", en: "Colour" }
      ] },
      { k: "font", label: { ar: "الخط", en: "Script style" }, opts: [
        { v: "naskh",   ar: "نسخ",     en: "Naskh" },
        { v: "ruqaa",   ar: "رقعة",    en: "Ruq\u02bfah" },
        { v: "kufi",    ar: "كوفي",    en: "Kufi" },
        { v: "thuluth", ar: "ثلث",     en: "Thuluth" },
        { v: "auto",    ar: "افتراضي", en: "Default" }
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
