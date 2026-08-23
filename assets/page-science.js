/* GUARDIAN:BEGIN
   🛡️ أوراقنا | Awraqna — © 2026 Artist Altayeb Amer
   الفنان الطيب عامر  ·  https://awraqna.com
   Protected by ALTAYEB GUARDIAN v4.0
   GUARDIAN:END */
/* أوراقنا — ربط صفحة العلوم بالنواة. */
(function () {
  "use strict";
  Core.mount({
    key: "science",
    answersShowIf: function (s) { return s.type === "units" || s.type === "laws"; },
    state: { type: "units", level: "med", fn: "quad" },
    controls: [
      { k: "type", label: { ar: "الموضوع", en: "Topic" }, opts: [
        { v: "units", ar: "تحويل وحدات", en: "Unit conversion" },
        { v: "laws",  ar: "قوانين فيزيائية", en: "Physics formulas" },
        { v: "coord", ar: "شبكة إحداثيات", en: "Coordinate grid" },
        { v: "plot",  ar: "راسم الدوال", en: "Function plotter" },
        { v: "tools", ar: "مسطرة ومنقلة", en: "Ruler & protractor" }
      ] },
      { k: "fn", label: { ar: "الدالة", en: "Function" },
        showIf: function (s) { return s.type === "plot"; }, opts: [
        { v: "linear", ar: "خطية",   en: "Linear" },
        { v: "quad",   ar: "تربيعية", en: "Quadratic" },
        { v: "cubic",  ar: "تكعيبية", en: "Cubic" },
        { v: "sine",   ar: "جيبية",   en: "Sine" },
        { v: "recip",  ar: "عكسية",   en: "Reciprocal" }
      ] },
      { k: "level", label: { ar: "المستوى", en: "Level" },
        showIf: function (s) { return s.type !== "tools"; }, opts: [
        { v: "easy", ar: "سهل", en: "Easy" }, { v: "med", ar: "متوسط", en: "Medium" }, { v: "hard", ar: "صعب", en: "Hard" }
      ] }
    ],
    render: function (state) { return ScienceGen.render(state); }
  });
})();
