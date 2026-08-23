/* GUARDIAN:BEGIN
   🛡️ أوراقنا | Awraqna — © 2026 Artist Altayeb Amer
   الفنان الطيب عامر  ·  https://awraqna.com
   Protected by ALTAYEB GUARDIAN v4.0
   GUARDIAN:END */
/* ════════════════════════════════════════════════════════════
   أوراقنا — مولّد الألغاز: سودوكو ومتاهات.
   كلاهما خوارزمي بحت: لا بنك ألغاز، ولا ملف بيانات.
   السودوكو مضمون **الحل الوحيد** (يُتحقَّق بالعدّ لا بالافتراض).
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PuzzleGen = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function rng(seed) {
    var t = (seed >>> 0) || 1;
    return function () {
      t = (t + 0x6d2b79f5) >>> 0;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(r, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ══════════════ سودوكو ══════════════ */
  var BOX = { 4: [2, 2], 6: [3, 2], 9: [3, 3] };   /* [عرض الصندوق, ارتفاعه] */

  function ok(g, n, i, v) {
    var bw = BOX[n][0], bh = BOX[n][1];
    var r = (i / n) | 0, c = i % n, k;
    for (k = 0; k < n; k++) {
      if (g[r * n + k] === v || g[k * n + c] === v) return false;
    }
    var r0 = r - (r % bh), c0 = c - (c % bw);
    for (var y = 0; y < bh; y++) for (var x = 0; x < bw; x++)
      if (g[(r0 + y) * n + (c0 + x)] === v) return false;
    return true;
  }

  function fill(g, n, i, rand) {
    if (i === n * n) return true;
    if (g[i]) return fill(g, n, i + 1, rand);
    var vals = shuffle(rand, Array.from({ length: n }, function (_, k) { return k + 1; }));
    for (var j = 0; j < n; j++) {
      if (ok(g, n, i, vals[j])) {
        g[i] = vals[j];
        if (fill(g, n, i + 1, rand)) return true;
        g[i] = 0;
      }
    }
    return false;
  }

  /* يتوقف عند حلّين — لا نحتاج العدد الكامل، نحتاج «هل هو وحيد؟» */
  function count(g, n, i, limit) {
    while (i < n * n && g[i]) i++;
    if (i === n * n) return 1;
    var total = 0;
    for (var v = 1; v <= n; v++) {
      if (ok(g, n, i, v)) {
        g[i] = v;
        total += count(g, n, i + 1, limit);
        g[i] = 0;
        if (total >= limit) return total;
      }
    }
    return total;
  }

  var CLUES = { 4: { easy: 9, med: 7, hard: 5 }, 6: { easy: 22, med: 18, hard: 14 },
                9: { easy: 42, med: 34, hard: 27 } };

  function sudoku(n, diff, seed) {
    var rand = rng(seed);
    var sol = new Array(n * n).fill(0);
    fill(sol, n, 0, rand);
    var puz = sol.slice();
    var target = (CLUES[n] || CLUES[9])[diff] || CLUES[n].med;
    var order = shuffle(rand, Array.from({ length: n * n }, function (_, k) { return k; }));
    var left = n * n;
    for (var k = 0; k < order.length && left > target; k++) {
      var i = order[k];
      if (!puz[i]) continue;
      var keep = puz[i];
      puz[i] = 0;
      if (count(puz.slice(), n, 0, 2) !== 1) { puz[i] = keep; }
      else { left--; }
    }
    return { n: n, puzzle: puz, solution: sol, clues: left };
  }

  function sudokuSVG(s, showAll) {
    var n = s.n, bw = BOX[n][0], bh = BOX[n][1], cell = 10, S = n * cell;
    var g = ['<rect width="' + S + '" height="' + S + '" fill="#fff"/>'];
    for (var i = 0; i <= n; i++) {
      var big = i % bw === 0, bigY = i % bh === 0;
      g.push('<line x1="' + i * cell + '" y1="0" x2="' + i * cell + '" y2="' + S +
             '" stroke="#111" stroke-width="' + (big ? 0.7 : 0.22) + '"/>');
      g.push('<line x1="0" y1="' + i * cell + '" x2="' + S + '" y2="' + i * cell +
             '" stroke="#111" stroke-width="' + (bigY ? 0.7 : 0.22) + '"/>');
    }
    var src = showAll ? s.solution : s.puzzle;
    for (var k = 0; k < n * n; k++) {
      if (!src[k]) continue;
      var r = (k / n) | 0, c = k % n;
      var given = s.puzzle[k] !== 0;
      g.push('<text x="' + (c * cell + cell / 2) + '" y="' + (r * cell + cell * 0.72) +
             '" font-size="' + cell * 0.58 + '" text-anchor="middle" font-family="Menlo,monospace" ' +
             'font-weight="' + (given ? 700 : 400) + '" fill="' + (given ? "#111" : "#777") + '">' + src[k] + "</text>");
    }
    return '<svg class="puz-svg" xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ' + (S + 2) + " " + (S + 2) +
           '" preserveAspectRatio="xMidYMid meet">' + g.join("") + "</svg>";
  }

  /* ══════════════ متاهة ══════════════ */
  function maze(cols, rows, seed, braid) {
    var rand = rng(seed);
    var N = cols * rows;
    /* جدران كل خلية: [أعلى, يمين, أسفل, يسار] */
    var w = [], vis = new Array(N).fill(false), i;
    for (i = 0; i < N; i++) w.push([1, 1, 1, 1]);
    var stack = [0]; vis[0] = true;
    var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
    while (stack.length) {
      var cur = stack[stack.length - 1];
      var cx = cur % cols, cy = (cur / cols) | 0;
      var dirs = shuffle(rand, [0, 1, 2, 3]), moved = false;
      for (var d = 0; d < 4; d++) {
        var dir = dirs[d], nx = cx + DX[dir], ny = cy + DY[dir];
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        var nb = ny * cols + nx;
        if (vis[nb]) continue;
        w[cur][dir] = 0; w[nb][(dir + 2) % 4] = 0;
        vis[nb] = true; stack.push(nb); moved = true; break;
      }
      if (!moved) stack.pop();
    }
    /* الصعوبة العالية تفتح حلقات (braiding) ⇒ طرق مسدودة أقل ومسارات خادعة أكثر. */
    for (i = 0; i < Math.floor(N * braid); i++) {
      var c = Math.floor(rand() * N), cx2 = c % cols, cy2 = (c / cols) | 0;
      var dd = Math.floor(rand() * 4), nx2 = cx2 + DX[dd], ny2 = cy2 + DY[dd];
      if (nx2 < 0 || ny2 < 0 || nx2 >= cols || ny2 >= rows) continue;
      w[c][dd] = 0; w[ny2 * cols + nx2][(dd + 2) % 4] = 0;
    }
    return { cols: cols, rows: rows, w: w };
  }

  function solve(m) {
    var N = m.cols * m.rows, prev = new Array(N).fill(-1), q = [0], seen = new Array(N).fill(false);
    seen[0] = true;
    var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], end = N - 1;
    while (q.length) {
      var c = q.shift();
      if (c === end) break;
      var cx = c % m.cols, cy = (c / m.cols) | 0;
      for (var d = 0; d < 4; d++) {
        if (m.w[c][d]) continue;
        var nx = cx + DX[d], ny = cy + DY[d];
        if (nx < 0 || ny < 0 || nx >= m.cols || ny >= m.rows) continue;
        var nb = ny * m.cols + nx;
        if (seen[nb]) continue;
        seen[nb] = true; prev[nb] = c; q.push(nb);
      }
    }
    var path = [], cur = end;
    while (cur !== -1) { path.push(cur); cur = prev[cur]; }
    return path.reverse();
  }

  function mazeSVG(m, path) {
    var cell = 10, W = m.cols * cell, H = m.rows * cell, g = [];
    g.push('<rect width="' + W + '" height="' + H + '" fill="#fff"/>');
    if (path) {
      var pts = path.map(function (c) {
        return ((c % m.cols) * cell + cell / 2) + "," + (((c / m.cols) | 0) * cell + cell / 2);
      }).join(" ");
      g.push('<polyline points="' + pts + '" fill="none" stroke="#c94f4f" stroke-width="' +
             cell * 0.28 + '" stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>');
    }
    for (var c = 0; c < m.cols * m.rows; c++) {
      var x = (c % m.cols) * cell, y = ((c / m.cols) | 0) * cell, wl = m.w[c];
      if (wl[0]) g.push('<line x1="' + x + '" y1="' + y + '" x2="' + (x + cell) + '" y2="' + y + '" stroke="#111" stroke-width="1"/>');
      if (wl[3]) g.push('<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + cell) + '" stroke="#111" stroke-width="1"/>');
      if (c % m.cols === m.cols - 1 && wl[1]) g.push('<line x1="' + (x + cell) + '" y1="' + y + '" x2="' + (x + cell) + '" y2="' + (y + cell) + '" stroke="#111" stroke-width="1"/>');
      if (((c / m.cols) | 0) === m.rows - 1 && wl[2]) g.push('<line x1="' + x + '" y1="' + (y + cell) + '" x2="' + (x + cell) + '" y2="' + (y + cell) + '" stroke="#111" stroke-width="1"/>');
    }
    /* المدخل أعلى اليسار والمخرج أسفل اليمين — مفتوحان بصرياً. */
    g.push('<rect x="1.5" y="-1" width="' + (cell - 3) + '" height="2.4" fill="#fff"/>');
    g.push('<rect x="' + (W - cell + 1.5) + '" y="' + (H - 1.4) + '" width="' + (cell - 3) + '" height="2.4" fill="#fff"/>');
    return '<svg class="puz-svg" xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1.5 ' + (W + 2) + " " + (H + 3) +
           '" preserveAspectRatio="xMidYMid meet">' + g.join("") + "</svg>";
  }

  /* ══════════════ الواجهة ══════════════ */
  var SIZES = {
    sudoku: { small: 4, med: 6, large: 9 },
    maze:   { small: 11, med: 16, large: 22 }        /* عدد الأعمدة */
  };
  var BRAID = { easy: 0, med: 0.04, hard: 0.10 };
  var TITLES = {
    sudoku: { ar: "سودوكو", en: "Sudoku" },
    maze:   { ar: "متاهات", en: "Mazes" }
  };
  var SZ = { small: { ar: "صغير", en: "Small" }, med: { ar: "متوسط", en: "Medium" }, large: { ar: "كبير", en: "Large" } };
  var DF = { easy: { ar: "سهل", en: "Easy" }, med: { ar: "متوسط", en: "Medium" }, hard: { ar: "صعب", en: "Hard" } };

  function render(state) {
    var count = Number(state.count) || 1;
    /* لغزان في عمود واحد أكبر من لغزين متجاورين: عرض الصفحة كاملاً
       بدل نصفه. عمودان لا يُستعملان إلا مع أربعة ألغاز. */
    var cols = count === 4 ? 2 : 1;
    var puzzles = [], solutions = [], i;

    if (state.type === "sudoku") {
      var n = SIZES.sudoku[state.size] || 9;
      for (i = 0; i < count; i++) {
        var s = sudoku(n, state.difficulty, state.seed + i * 7919);
        puzzles.push(sudokuSVG(s, false));
        solutions.push(sudokuSVG(s, true));
      }
    } else {
      var base = SIZES.maze[state.size] || 16;
      /* نسبة الأبعاد تتبع مساحة كل لغز على الورقة، فلا يُشوَّه الشكل. */
      var ratio = count === 1 ? 1.45 : (count === 2 ? 0.62 : 1.25);
      var c = count === 4 ? Math.round(base * 0.72) : Math.round(base * (count === 2 ? 1.5 : 1));
      var r = Math.max(6, Math.round(c * ratio));
      for (i = 0; i < count; i++) {
        var m = maze(c, r, state.seed + i * 7919, BRAID[state.difficulty] || 0);
        puzzles.push(mazeSVG(m, null));
        solutions.push(mazeSVG(m, solve(m)));
      }
    }

    var wrap = function (list) {
      return '<div class="puz-grid" data-per="' + count + '" style="grid-template-columns:repeat(' + cols + ',1fr)">' +
        list.map(function (svg, k) {
          return '<div class="puz"><span class="puz-n">' + (k + 1) + "</span>" + svg + "</div>";
        }).join("") + "</div>";
    };

    return {
      title: TITLES[state.type] || TITLES.sudoku,
      sub: {
        ar: SZ[state.size].ar + " · " + DF[state.difficulty].ar + " · " + count + (count === 1 ? " لغز" : " ألغاز"),
        en: SZ[state.size].en + " · " + DF[state.difficulty].en + " · " + count + (count === 1 ? " puzzle" : " puzzles")
      },
      sheet: wrap(puzzles),
      answers: wrap(solutions)
    };
  }

  return { render: render, sudoku: sudoku, maze: maze, solve: solve, count: count, SIZES: SIZES };
});
