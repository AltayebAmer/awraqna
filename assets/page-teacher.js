/* أوراقنا — ربط صفحة أوراق المعلّم بالنواة. */
(function () {
  "use strict";
  Core.mount({
    key: "teacher",
    answers: false,
    state: { type: "lined", mm: 7, head: true },
    controls: [
      { k: "type", label: { ar: "نوع الورق", en: "Paper" }, opts: [
        { v: "lined", ar: "مسطّر", en: "Lined" },
        { v: "grid",  ar: "شبكي",  en: "Grid" },
        { v: "dot",   ar: "نقطي",  en: "Dotted" },
        { v: "graph", ar: "رسم بياني", en: "Graph" }
      ] },
      { k: "mm", label: { ar: "المسافة", en: "Spacing" },
        opts: [4, 5, 7, 8, 10].map(function (n) { return { v: n, ar: n + " مم", en: n + " mm" }; }) },
      { k: "head", label: { ar: "الترويسة", en: "Header" }, opts: [
        { v: true,  ar: "بالاسم والتاريخ", en: "Name & date" },
        { v: false, ar: "بلا ترويسة",      en: "None" }
      ] }
    ],
    render: function (state) { return TeacherGen.render(state); }
  });
})();
