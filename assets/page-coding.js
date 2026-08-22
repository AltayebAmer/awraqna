/* أوراقنا — ربط صفحة البرمجة بالنواة. */
(function () {
  "use strict";
  Core.mount({
    key: "coding",
    state: { type: "base", level: "med" },
    controls: [
      { k: "type", label: { ar: "التمرين", en: "Exercise" }, opts: [
        { v: "base",  ar: "أنظمة العد", en: "Number bases" },
        { v: "trace", ar: "جدول تتبّع", en: "Trace table" },
        { v: "logic", ar: "جدول حقيقة", en: "Truth table" },
        { v: "robot", ar: "روبوت الشبكة", en: "Grid robot" }
      ] },
      { k: "level", label: { ar: "المستوى", en: "Level" }, opts: [
        { v: "easy", ar: "سهل", en: "Easy" }, { v: "med", ar: "متوسط", en: "Medium" }, { v: "hard", ar: "صعب", en: "Hard" }
      ] }
    ],
    render: function (state) { return CodingGen.render(state); }
  });
})();
