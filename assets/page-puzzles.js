/* GUARDIAN:BEGIN
   🛡️ أوراقنا | Awraqna — © 2026 Artist Altayeb Amer
   الفنان الطيب عامر  ·  https://awraqna.com
   Protected by ALTAYEB GUARDIAN v4.0
   GUARDIAN:END */
/* أوراقنا — ربط صفحة الألغاز بالنواة. */
(function () {
  "use strict";
  Core.mount({
    key: "puzzles",
    state: { type: "sudoku", size: "large", difficulty: "med", count: 2 },
    controls: [
      { k: "type", label: { ar: "اللغز", en: "Puzzle" }, opts: [
        { v: "sudoku", ar: "سودوكو", en: "Sudoku" },
        { v: "maze",   ar: "متاهة",  en: "Maze" }
      ] },
      { k: "size", label: { ar: "الحجم", en: "Size" }, opts: [
        { v: "small", ar: "صغير", en: "Small" },
        { v: "med",   ar: "متوسط", en: "Medium" },
        { v: "large", ar: "كبير",  en: "Large" }
      ] },
      { k: "difficulty", label: { ar: "الصعوبة", en: "Difficulty" }, opts: [
        { v: "easy", ar: "سهل", en: "Easy" },
        { v: "med",  ar: "متوسط", en: "Medium" },
        { v: "hard", ar: "صعب", en: "Hard" }
      ] },
      { k: "count", label: { ar: "عدد الألغاز", en: "Per page" }, opts: [
        { v: 1, ar: "لغز واحد", en: "One" },
        { v: 2, ar: "لغزان", en: "Two" },
        { v: 4, ar: "أربعة", en: "Four" }
      ] }
    ],
    render: function (state) { return PuzzleGen.render(state); }
  });
})();
