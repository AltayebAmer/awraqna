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
    answersShowIf: function (s) { return s.type === "dots" || s.type === "symmetry"; },
    state: { type: "draw", level: "med", animal: "cat", fade: 0 },
    controls: [
      { k: "type", label: { ar: "النشاط", en: "Activity" }, opts: [
        { v: "draw",     ar: "ارسم خطوة بخطوة", en: "Draw step by step" },
        { v: "outline",  ar: "لوّن الرسم",      en: "Colour it" },
        { v: "dots",     ar: "وصّل النقاط",     en: "Connect dots" },
        { v: "symmetry", ar: "تناظر",          en: "Symmetry" }
      ] },
      { k: "animal", label: { ar: "الحيوان", en: "Animal" },
        showIf: function (s) { return s.type === "draw" || s.type === "outline"; },
        opts: DrawGen.ORDER.map(function (a) {
          return { v: a, ar: DrawGen.ANIMALS[a].ar, en: DrawGen.ANIMALS[a].en };
        }) },
      { k: "fade", label: { ar: "الشفافية", en: "Fade" },
        type: "range", min: 0, max: 85, step: 5, unit: "%" },
      { k: "level", label: { ar: "المستوى", en: "Level" },
        showIf: function (s) { return s.type === "dots" || s.type === "symmetry"; }, opts: [
        { v: "easy", ar: "سهل", en: "Easy" },
        { v: "med",  ar: "متوسط", en: "Medium" },
        { v: "hard", ar: "صعب", en: "Hard" }
      ] }
    ],
    render: function (state) {
      /* الرسم خطوة بخطوة مولّده منفصل — الفنون بوّابة لا مالك. */
      if (state.type === "draw" || state.type === "outline")
        return DrawGen.render({ animal: state.animal, seed: state.seed,
                                mode: state.type === "outline" ? "outline" : "steps" });
      return ArtGen.render(state);
    }
  });
})();
