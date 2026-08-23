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
    state: { type: "units", level: "med" },
    controls: [
      { k: "type", label: { ar: "الموضوع", en: "Topic" }, opts: [
        { v: "units", ar: "تحويل وحدات", en: "Unit conversion" },
        { v: "laws",  ar: "قوانين فيزيائية", en: "Physics formulas" },
        { v: "coord", ar: "شبكة إحداثيات", en: "Coordinate grid" }
      ] },
      { k: "level", label: { ar: "المستوى", en: "Level" }, opts: [
        { v: "easy", ar: "سهل", en: "Easy" }, { v: "med", ar: "متوسط", en: "Medium" }, { v: "hard", ar: "صعب", en: "Hard" }
      ] }
    ],
    render: function (state) { return ScienceGen.render(state); }
  });
})();
