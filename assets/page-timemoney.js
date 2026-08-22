/* أوراقنا — ربط صفحة الوقت والمال بالنواة. */
(function () {
  "use strict";
  Core.mount({
    key: "timemoney",
    state: { type: "clock", level: "med" },
    controls: [
      { k: "type", label: { ar: "التمرين", en: "Exercise" }, opts: [
        { v: "clock",    ar: "قراءة الساعة", en: "Read the clock" },
        { v: "elapsed",  ar: "المدة المنقضية", en: "Elapsed time" },
        { v: "money",    ar: "حساب المال", en: "Money maths" },
        { v: "calendar", ar: "تقويم شهري", en: "Calendar" }
      ] },
      { k: "level", label: { ar: "المستوى", en: "Level" }, opts: [
        { v: "easy", ar: "سهل", en: "Easy" }, { v: "med", ar: "متوسط", en: "Medium" }, { v: "hard", ar: "صعب", en: "Hard" }
      ] }
    ],
    render: function (state) { return TimeMoneyGen.render(state); }
  });
})();
