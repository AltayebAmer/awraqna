/* أوراقنا — ربط صفحة الرياضيات بالنواة. لا منطق رياضي هنا. */
(function () {
  "use strict";
  Core.mount({
    key: "math",
    state: { grade: 3, skill: "add", difficulty: "med", count: 40 },
    controls: [
      { k: "grade", label: { ar: "الصف", en: "Grade" },
        opts: [1, 2, 3, 4, 5, 6].map(function (n) { return { v: n, ar: "الصف " + n, en: "Grade " + n }; }) },
      { k: "skill", label: { ar: "المهارة", en: "Skill" }, opts: [
        { v: "add", ar: "جمع",   en: "Addition" },
        { v: "sub", ar: "طرح",   en: "Subtraction" },
        { v: "mul", ar: "ضرب",   en: "Multiplication" },
        { v: "div", ar: "قسمة",  en: "Division" },
        { v: "cmp", ar: "مقارنة", en: "Comparing" },
        { v: "pat", ar: "أنماط",  en: "Patterns" }
      ] },
      { k: "difficulty", label: { ar: "الصعوبة", en: "Difficulty" }, opts: [
        { v: "easy", ar: "سهل", en: "Easy" }, { v: "med", ar: "متوسط", en: "Medium" }, { v: "hard", ar: "صعب", en: "Hard" }
      ] },
      { k: "count", label: { ar: "عدد الأسئلة", en: "Questions" },
        opts: [10, 20, 30, 40].map(function (n) { return { v: n, ar: n + " سؤال", en: n + " questions" }; }) }
    ],
    render: function (state) { return MathGen.render(state); }
  });
})();
