/* ════════════════════════════════════════════════════════════
   أوراقنا — مولّد البرمجة (بلا حاسوب).
   كل تمرين يُولَّد ويُحَل خوارزمياً: الإجابة تُحسب بتنفيذ المنطق نفسه
   لا بكتابتها يدوياً ⇒ يستحيل أن تخالف الإجابةُ السؤال.
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CodingGen = api;
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
  var ri = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var esc = function (s) {
    return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
  };

  /* ── ١. تحويل أنظمة العد ── */
  var BASES = { 2: "ثنائي", 8: "ثماني", 10: "عشري", 16: "ست عشري" };
  var BASES_EN = { 2: "binary", 8: "octal", 10: "decimal", 16: "hex" };
  function baseQ(r, lv) {
    var from = [2, 10, 16, 8][Math.floor(r() * 4)];
    var to;
    do { to = [2, 10, 16, 8][Math.floor(r() * 4)]; } while (to === from);
    var max = lv === "easy" ? 31 : (lv === "med" ? 255 : 4095);
    var v = ri(r, lv === "easy" ? 2 : 16, max);
    return { from: from, to: to, v: v,
             q: v.toString(from).toUpperCase(), answer: v.toString(to).toUpperCase() };
  }

  /* ── ٢. جدول تتبّع لحلقة ── */
  function traceQ(r, lv) {
    var n = ri(r, lv === "easy" ? 3 : 4, lv === "easy" ? 4 : 6);
    var start = ri(r, 0, 5), step = ri(r, 2, lv === "hard" ? 9 : 5);
    var op = lv === "hard" && r() < 0.5 ? "*" : "+";
    var rows = [], acc = start, i;
    for (i = 1; i <= n; i++) {
      acc = op === "+" ? acc + step : acc * step;
      rows.push({ i: i, v: acc });
    }
    return { start: start, step: step, op: op, n: n, rows: rows, answer: acc };
  }

  /* ── ٣. جدول الحقيقة ── */
  var OPS = [
    { s: "AND", f: function (a, b) { return a && b; } },
    { s: "OR",  f: function (a, b) { return a || b; } },
    { s: "XOR", f: function (a, b) { return a !== b; } },
    { s: "NAND", f: function (a, b) { return !(a && b); } }
  ];
  function logicQ(r, lv) {
    var o = OPS[Math.floor(r() * (lv === "easy" ? 2 : OPS.length))];
    var a = r() < 0.5, b = r() < 0.5;
    var neg = lv === "hard" && r() < 0.5;
    var val = o.f(a, b); if (neg) val = !val;
    return { a: a, b: b, op: o.s, neg: neg, answer: val ? 1 : 0 };
  }

  /* ── ٤. الروبوت على الشبكة ── */
  var MOVES = { "↑": [0, -1], "→": [1, 0], "↓": [0, 1], "←": [-1, 0] };
  function robotQ(r, lv) {
    var n = lv === "easy" ? 4 : (lv === "med" ? 5 : 6);
    var steps = lv === "easy" ? 4 : (lv === "med" ? 6 : 8);
    var keys = Object.keys(MOVES);
    var x = ri(r, 0, n - 1), y = ri(r, 0, n - 1), sx = x, sy = y, seq = [], i, tries;
    for (i = 0; i < steps; i++) {
      for (tries = 0; tries < 12; tries++) {
        var k = keys[Math.floor(r() * 4)], d = MOVES[k];
        if (x + d[0] >= 0 && x + d[0] < n && y + d[1] >= 0 && y + d[1] < n) {
          x += d[0]; y += d[1]; seq.push(k); break;
        }
      }
    }
    return { n: n, sx: sx, sy: sy, seq: seq, ex: x, ey: y,
             answer: "(" + (x + 1) + "، " + (y + 1) + ")" };
  }

  /* ── العرض ── */
  function gridSVG(n, sx, sy, ex, ey, showEnd) {
    var c = 10, S = n * c, g = ['<rect width="' + S + '" height="' + S + '" fill="#fff"/>'], i;
    for (i = 0; i <= n; i++) {
      g.push('<line x1="' + i * c + '" y1="0" x2="' + i * c + '" y2="' + S + '" stroke="#111" stroke-width="0.3"/>');
      g.push('<line x1="0" y1="' + i * c + '" x2="' + S + '" y2="' + i * c + '" stroke="#111" stroke-width="0.3"/>');
    }
    g.push('<circle cx="' + (sx * c + c / 2) + '" cy="' + (sy * c + c / 2) + '" r="2.6" fill="#111"/>');
    if (showEnd)
      g.push('<rect x="' + (ex * c + 2) + '" y="' + (ey * c + 2) + '" width="' + (c - 4) + '" height="' + (c - 4) +
             '" fill="none" stroke="#c94f4f" stroke-width="1"/>');
    return '<svg class="cd-grid" xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ' + (S + 2) + " " + (S + 2) +
           '" preserveAspectRatio="xMidYMid meet">' + g.join("") + "</svg>";
  }

  var TITLES = {
    base:  { ar: "أنظمة العد", en: "Number bases" },
    trace: { ar: "جدول التتبّع", en: "Trace tables" },
    logic: { ar: "جداول الحقيقة", en: "Truth tables" },
    robot: { ar: "الروبوت على الشبكة", en: "Grid robot" }
  };
  var LV = { easy: { ar: "سهل", en: "Easy" }, med: { ar: "متوسط", en: "Medium" }, hard: { ar: "صعب", en: "Hard" } };
  var COUNT = { base: 24, trace: 6, logic: 20, robot: 6 };

  function render(state) {
    var r = rng(state.seed), t = state.type, lv = state.level || "med";
    var n = COUNT[t], items = [], answers = [], i;

    for (i = 0; i < n; i++) {
      if (t === "base") {
        var q = baseQ(r, lv);
        items.push('<div class="q-item"><span class="q-num">' + (i + 1) + '</span><span class="cd-line">' +
          "(" + q.from + ") " + esc(q.q) + ' <span class="cd-arrow">→</span> ( ' + q.to + " ) " +
          '<span class="ansbox inline"></span></span></div>');
        answers.push(q.answer + "<sub>" + q.to + "</sub>");
      } else if (t === "trace") {
        var w = traceQ(r, lv);
        var rows = w.rows.map(function (x) {
          return "<tr><td>" + x.i + '</td><td class="blank"></td></tr>';
        }).join("");
        items.push('<div class="cd-card"><span class="q-num">' + (i + 1) + "</span>" +
          '<pre class="cd-code">x = ' + w.start + "\nكرّر " + w.n + " مرات:\n    x = x " + w.op + " " + w.step +
          "\nاطبع x</pre>" +
          '<table class="cd-tbl"><thead><tr><th>الدورة</th><th>x</th></tr></thead><tbody>' + rows + "</tbody></table></div>");
        answers.push(w.rows.map(function (x) { return x.v; }).join(" → "));
      } else if (t === "logic") {
        var g2 = logicQ(r, lv);
        var expr = (g2.neg ? "NOT( " : "") + (g2.a ? 1 : 0) + " " + g2.op + " " + (g2.b ? 1 : 0) + (g2.neg ? " )" : "");
        items.push('<div class="q-item"><span class="q-num">' + (i + 1) + '</span><span class="cd-line">' +
          esc(expr) + ' = <span class="ansbox inline sm"></span></span></div>');
        answers.push(g2.answer);
      } else {
        var b = robotQ(r, lv);
        items.push('<div class="cd-card"><span class="q-num">' + (i + 1) + "</span>" +
          gridSVG(b.n, b.sx, b.sy, b.ex, b.ey, false) +
          '<div class="cd-seq">' + b.seq.join(" ") + "</div>" +
          '<div class="cd-ask">( __ ، __ )</div></div>');
        answers.push(b.answer);
      }
    }

    var wide = t === "trace" || t === "robot";
    return {
      title: TITLES[t] || TITLES.base,
      sub: { ar: LV[lv].ar + " · " + n + " تمريناً", en: LV[lv].en + " · " + n + " exercises" },
      sheet: '<div class="' + (wide ? "cd-grid-3" : "q-grid") + '">' + items.join("") + "</div>",
      answers: '<div class="a-grid">' + answers.map(function (a, k) {
        return "<div><u>" + (k + 1) + ".</u>" + a + "</div>";
      }).join("") + "</div>"
    };
  }

  return { render: render, baseQ: baseQ, traceQ: traceQ, logicQ: logicQ, robotQ: robotQ, OPS: OPS };
});
