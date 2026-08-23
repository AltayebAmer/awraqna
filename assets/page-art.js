/* GUARDIAN:BEGIN
   🛡️ أوراقنا | Awraqna — © 2026 Artist Altayeb Amer
   الفنان الطيب عامر  ·  https://awraqna.com
   Protected by ALTAYEB GUARDIAN v4.0
   GUARDIAN:END */
/* أوراقنا — ربط صفحة الفنون بالنواة. */
(function () {
  "use strict";
  Core.mount({
    key: "art",
    state: { type: "dots", level: "med" },
    controls: [
      { k: "type", label: { ar: "النشاط", en: "Activity" }, opts: [
        { v: "dots",     ar: "وصّل النقاط", en: "Connect dots" },
        { v: "symmetry", ar: "تناظر",       en: "Symmetry" }
      ] },
      { k: "level", label: { ar: "المستوى", en: "Level" }, opts: [
        { v: "easy", ar: "سهل", en: "Easy" },
        { v: "med",  ar: "متوسط", en: "Medium" },
        { v: "hard", ar: "صعب", en: "Hard" }
      ] }
    ],
    render: function (state) { return ArtGen.render(state); }
  });
})();
