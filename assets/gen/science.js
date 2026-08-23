/* GUARDIAN:BEGIN
   🛡️ أوراقنا | Awraqna — © 2026 Artist Altayeb Amer
   الفنان الطيب عامر  ·  https://awraqna.com
   Protected by ALTAYEB GUARDIAN v4.0
   GUARDIAN:END */
/* ════════════════════════════════════════════════════════════
   أوراقنا — مولّد العلوم والقياس.
   الإجابات تُحسب من نفس المعاملات التي وُلِّد بها السؤال.
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ScienceGen = api;
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
  var round = function (v, d) { var m = Math.pow(10, d); return Math.round(v * m) / m; };
  var f2 = function (v) { return (Math.round(v * 100) / 100).toString(); };
  /* الرقم السالب داخل <text> في صفحة RTL يُعرض «6−» بدل «−6».
     علامة LRM (U+200E) تثبّت اتجاهه — جُرّب وشوهد على الورق. */
  var num = function (v) { return "\u200e" + v; };

  /* ── ١. تحويل الوحدات ── */
  var UNITS = [
    { g: "الطول", en: "Length", u: [["مم", "mm", 1], ["سم", "cm", 10], ["م", "m", 1000], ["كم", "km", 1e6]] },
    { g: "الكتلة", en: "Mass", u: [["مغ", "mg", 1], ["غ", "g", 1000], ["كغ", "kg", 1e6], ["طن", "t", 1e9]] },
    { g: "السعة", en: "Volume", u: [["مل", "ml", 1], ["ل", "L", 1000], ["م³", "m³", 1e6]] },
    { g: "الزمن", en: "Time", u: [["ث", "s", 1], ["د", "min", 60], ["سا", "h", 3600], ["يوم", "day", 86400]] }
  ];
  function unitQ(r, lv) {
    var grp = UNITS[Math.floor(r() * UNITS.length)];
    var i = Math.floor(r() * grp.u.length), j;
    do { j = Math.floor(r() * grp.u.length); } while (j === i);
    /* السهل يحوّل من الأصغر إلى الأكبر بأعداد صحيحة فقط. */
    if (lv === "easy" && grp.u[i][2] > grp.u[j][2]) { var t = i; i = j; j = t; }
    var v = lv === "easy" ? ri(r, 1, 9) * (grp.u[j][2] / grp.u[i][2]) : ri(r, 2, lv === "med" ? 500 : 9999);
    var res = v * grp.u[i][2] / grp.u[j][2];
    return { grp: grp, from: grp.u[i], to: grp.u[j], v: v, answer: round(res, 4) };
  }

  /* ── ٢. مسائل فيزيائية بقوالب (سرعة · كثافة · قوة) ── */
  var LAWS = [
    { id: "speed",   ar: "السرعة", en: "Speed",
      f: function (a, b) { return a / b; }, fmt: ["مسافة (م)", "زمن (ث)", "م/ث"], efmt: ["distance (m)", "time (s)", "m/s"] },
    { id: "density", ar: "الكثافة", en: "Density",
      f: function (a, b) { return a / b; }, fmt: ["كتلة (غ)", "حجم (سم³)", "غ/سم³"], efmt: ["mass (g)", "volume (cm³)", "g/cm³"] },
    { id: "force",   ar: "القوة", en: "Force",
      f: function (a, b) { return a * b; }, fmt: ["كتلة (كغ)", "تسارع (م/ث²)", "نيوتن"], efmt: ["mass (kg)", "accel (m/s²)", "N"] },
    { id: "work",    ar: "الشغل", en: "Work",
      f: function (a, b) { return a * b; }, fmt: ["قوة (ن)", "إزاحة (م)", "جول"], efmt: ["force (N)", "distance (m)", "J"] }
  ];
  function lawQ(r, lv) {
    var L = LAWS[Math.floor(r() * LAWS.length)];
    var b = ri(r, 2, lv === "easy" ? 9 : 20);
    var a = L.id === "speed" || L.id === "density" ? b * ri(r, 2, lv === "easy" ? 9 : 30) : ri(r, 2, lv === "easy" ? 9 : 40);
    return { law: L, a: a, b: b, answer: round(L.f(a, b), 3) };
  }

  /* ── ٣. شبكة إحداثيات: ارسم النقاط ── */
  function coordQ(r, lv) {
    var n = lv === "easy" ? 5 : (lv === "med" ? 8 : 12);
    var R = lv === "easy" ? 5 : 8, pts = [], seen = {}, i, k;
    for (i = 0; i < n * 3 && pts.length < n; i++) {
      var x = ri(r, -R, R), y = ri(r, -R, R);
      k = x + "," + y;
      if (seen[k]) continue;
      seen[k] = 1; pts.push([x, y]);
    }
    return { R: R, pts: pts };
  }
  function axesSVG(R, pts, show) {
    var S = R * 2, c = 10, W = S * c, g = [], i;
    g.push('<rect width="' + W + '" height="' + W + '" fill="#fff"/>');
    for (i = 0; i <= S; i++) {
      var major = i === R;
      g.push('<line x1="' + i * c + '" y1="0" x2="' + i * c + '" y2="' + W +
             '" stroke="' + (major ? "#111" : "#c8c8c8") + '" stroke-width="' + (major ? 0.6 : 0.2) + '"/>');
      g.push('<line x1="0" y1="' + i * c + '" x2="' + W + '" y2="' + i * c +
             '" stroke="' + (major ? "#111" : "#c8c8c8") + '" stroke-width="' + (major ? 0.6 : 0.2) + '"/>');
    }
    if (show) pts.forEach(function (p, k) {
      var X = (p[0] + R) * c, Y = (R - p[1]) * c;
      g.push('<circle cx="' + X + '" cy="' + Y + '" r="1.7" fill="#c94f4f"/>');
      g.push('<text x="' + (X + 2.4) + '" y="' + (Y - 2) + '" font-size="3" fill="#c94f4f" font-family="Menlo,monospace">' + (k + 1) + "</text>");
    });
    return '<svg class="sc-axes" xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ' + (W + 2) + " " + (W + 2) +
           '" preserveAspectRatio="xMidYMid meet">' + g.join("") + "</svg>";
  }

  /* ══════ ٤. مسطرة ومنقلة للطباعة ══════
     تُطبع بمقاسها الحقيقي: الوحدات مليمترية في SVG فما يخرج من الطابعة
     مسطرةٌ يُقاس بها فعلاً، لا رسمٌ يشبه المسطرة. */
  function rulerSVG(len, dual) {
    var W = 186, g = [], i, x;
    var y0 = 6, h = 26;
    g.push('<rect x="0" y="' + y0 + '" width="' + len + '" height="' + h + '" fill="#fff" stroke="#111" stroke-width="0.4"/>');
    g.push('<text x="2" y="' + (y0 + h * .62) + '" font-size="3" font-family="Menlo,monospace" fill="#999">cm</text>');
    for (i = 0; i <= len; i++) {
      var big = i % 10 === 0, mid = i % 5 === 0;
      var t = big ? 9 : (mid ? 6 : 3.5);
      g.push('<line x1="' + i + '" y1="' + y0 + '" x2="' + i + '" y2="' + (y0 + t) + '" stroke="#111" stroke-width="' + (big ? .45 : .25) + '"/>');
      /* أرقام السنتيمتر تحت تدريجها مباشرة، وأرقام البوصة عند الحافة
         المقابلة: وضعهما على الارتفاع نفسه جعل الرقمين يتراكبان. */
      if (big) g.push('<text x="' + i + '" y="' + (y0 + 13) + '" font-size="3.2" text-anchor="middle" font-family="Menlo,monospace" fill="#111">' + (i / 10) + "</text>");
    }
    /* الحافة السفلى بالبوصة حين تُطلب — نصف بوصة = 12.7mm بالضبط. */
    if (dual) {
      var inch = 25.4, n = Math.floor(len / inch * 8);
      for (i = 0; i <= n; i++) {
        x = i * inch / 8;
        var b8 = i % 8 === 0, b4 = i % 4 === 0, b2 = i % 2 === 0;
        var t2 = b8 ? 9 : (b4 ? 6.5 : (b2 ? 4.5 : 3));
        g.push('<line x1="' + f2(x) + '" y1="' + (y0 + h) + '" x2="' + f2(x) + '" y2="' + (y0 + h - t2) + '" stroke="#111" stroke-width="' + (b8 ? .45 : .25) + '"/>');
        if (b8) g.push('<text x="' + f2(x) + '" y="' + (y0 + h - 2.5) + '" font-size="3.2" text-anchor="middle" font-family="Menlo,monospace" fill="#666">' + (i / 8) + "</text>");
      }
    }
    return { w: W, h: y0 + h + 4, body: g.join("") };
  }

  function protractorSVG(R) {
    var g = [], i, cx = 93, cy = 96;
    g.push('<path d="M' + f2(cx - R) + " " + cy + " A" + R + " " + R + " 0 0 1 " + f2(cx + R) + " " + cy +
           ' Z" fill="#fff" stroke="#111" stroke-width="0.5"/>');
    g.push('<line x1="' + f2(cx - R) + '" y1="' + cy + '" x2="' + f2(cx + R) + '" y2="' + cy + '" stroke="#111" stroke-width="0.4"/>');
    for (i = 0; i <= 180; i++) {
      var a = Math.PI - (i / 180) * Math.PI;
      var big = i % 10 === 0, mid = i % 5 === 0;
      var t = big ? 8 : (mid ? 5 : 2.6);
      g.push('<line x1="' + f2(cx + R * Math.cos(a)) + '" y1="' + f2(cy + R * Math.sin(a) * -1 + (R * Math.sin(a) * 2)) +
             '" x2="0" y2="0" stroke="none"/>');
    }
    /* الرسم الفعلي للتدريج: من المحيط إلى الداخل. */
    g = [g[0], g[1]];
    for (i = 0; i <= 180; i++) {
      var th = Math.PI * (1 - i / 180);
      var big2 = i % 10 === 0, mid2 = i % 5 === 0;
      var tl = big2 ? 8 : (mid2 ? 5 : 2.6);
      var x1 = cx + R * Math.cos(th), y1 = cy - R * Math.sin(th);
      var x2 = cx + (R - tl) * Math.cos(th), y2 = cy - (R - tl) * Math.sin(th);
      g.push('<line x1="' + f2(x1) + '" y1="' + f2(y1) + '" x2="' + f2(x2) + '" y2="' + f2(y2) +
             '" stroke="#111" stroke-width="' + (big2 ? .45 : .22) + '"/>');
      if (big2 && i % 10 === 0) {
        var xr = cx + (R - 13) * Math.cos(th), yr = cy - (R - 13) * Math.sin(th);
        g.push('<text x="' + f2(xr) + '" y="' + f2(yr + 1.6) + '" font-size="3.6" text-anchor="middle" font-family="Menlo,monospace" fill="#111">' + i + "</text>");
      }
    }
    g.push('<circle cx="' + cx + '" cy="' + cy + '" r="1.1" fill="#111"/>');
    return g.join("");
  }

  /* ══════ ٥. راسم الدوال ══════
     الرسم يُحسب من الدالة نفسها نقطةً نقطة ⇒ المنحنى صحيح بالبناء،
     ولا يمكن أن يخالف المعادلة المطبوعة أعلاه. */
  var FUNCS = {
    linear: { ar: "خطية  y = ax + b", en: "Linear  y = ax + b",
      make: function (r) { var a = (ri(r, -6, 6) || 2) / 2, b = ri(r, -6, 6);
        return { f: function (x) { return a * x + b; }, label: "y = " + a + "x " + (b < 0 ? "− " + (-b) : "+ " + b) }; } },
    quad:   { ar: "تربيعية  y = ax² + c", en: "Quadratic  y = ax² + c",
      make: function (r) { var a = (ri(r, -4, 4) || 1) / 2, c = ri(r, -5, 5);
        return { f: function (x) { return a * x * x + c; }, label: "y = " + a + "x² " + (c < 0 ? "− " + (-c) : "+ " + c) }; } },
    cubic:  { ar: "تكعيبية  y = ax³ + bx", en: "Cubic  y = ax³ + bx",
      make: function (r) { var a = (ri(r, 1, 3)) / 4, b = ri(r, -4, 4);
        return { f: function (x) { return a * x * x * x + b * x; }, label: "y = " + a + "x³ " + (b < 0 ? "− " + (-b) : "+ " + b) + "x" }; } },
    sine:   { ar: "جيبية  y = a·sin(bx)", en: "Sine  y = a·sin(bx)",
      make: function (r) { var a = ri(r, 2, 6), b = ri(r, 1, 3);
        return { f: function (x) { return a * Math.sin(b * x); },
                 label: "y = " + a + "·sin(" + (b === 1 ? "x" : b + "x") + ")" }; } },
    recip:  { ar: "عكسية  y = a / x", en: "Reciprocal  y = a / x",
      make: function (r) { var a = ri(r, 2, 9);
        return { f: function (x) { return x === 0 ? NaN : a / x; }, label: "y = " + a + " / x" }; } }
  };

  function plotSVG(fn, R) {
    var c = 10, W = R * 2 * c, g = [], i;
    g.push('<rect width="' + W + '" height="' + W + '" fill="#fff"/>');
    for (i = 0; i <= R * 2; i++) {
      var major = i === R;
      g.push('<line x1="' + i * c + '" y1="0" x2="' + i * c + '" y2="' + W +
             '" stroke="' + (major ? "#111" : "#d0d0d0") + '" stroke-width="' + (major ? .7 : .22) + '"/>');
      g.push('<line x1="0" y1="' + i * c + '" x2="' + W + '" y2="' + i * c +
             '" stroke="' + (major ? "#111" : "#d0d0d0") + '" stroke-width="' + (major ? .7 : .22) + '"/>');
      if (i !== R && i % 2 === 0) {
        g.push('<text x="' + (i * c) + '" y="' + (R * c + 4.2) + '" font-size="3" text-anchor="middle" font-family="Menlo,monospace" fill="#666">' + num(i - R) + "</text>");
        g.push('<text x="' + (R * c - 1.5) + '" y="' + (i * c + 1.2) + '" font-size="3" text-anchor="end" font-family="Menlo,monospace" fill="#666">' + num(R - i) + "</text>");
      }
    }
    /* المنحنى يُقطَع عند القفزات (مثل 1/x عند الصفر) فلا يُرسم خطٌّ وهمي. */
    var runs = [], cur = [];
    for (i = 0; i <= R * 2 * 12; i++) {
      var x = -R + i / 12, y = fn(x);
      if (!isFinite(y) || Math.abs(y) > R + 2) { if (cur.length > 1) runs.push(cur); cur = []; continue; }
      cur.push(f2((x + R) * c) + "," + f2((R - y) * c));
    }
    if (cur.length > 1) runs.push(cur);
    runs.forEach(function (rn) {
      g.push('<polyline points="' + rn.join(" ") + '" fill="none" stroke="#111" stroke-width="1.1" stroke-linejoin="round"/>');
    });
    return '<svg class="sc-axes" xmlns="http://www.w3.org/2000/svg" viewBox="-6 -3 ' + (W + 9) + " " + (W + 8) +
           '" preserveAspectRatio="xMidYMid meet">' + g.join("") + "</svg>";
  }

  var TITLES = {
    units: { ar: "تحويل الوحدات", en: "Unit conversion" },
    laws:  { ar: "قوانين فيزيائية", en: "Physics formulas" },
    coord: { ar: "شبكة الإحداثيات", en: "Coordinate grid" },
    tools: { ar: "مسطرة ومنقلة للطباعة", en: "Printable ruler & protractor" },
    plot:  { ar: "راسم الدوال", en: "Function plotter" }
  };
  var LV = { easy: { ar: "سهل", en: "Easy" }, med: { ar: "متوسط", en: "Medium" }, hard: { ar: "صعب", en: "Hard" } };
  var EN = function () { return typeof Core !== "undefined" && Core.EN && Core.EN(); };

  function render(state) {
    var r = rng(state.seed), t = state.type, lv = state.level || "med";
    var items = [], answers = [], i, en = EN();

    if (t === "tools") {
      var rl = rulerSVG(180, true);
      return {
        title: TITLES.tools,
        sub: { ar: "تُطبع بمقاسها الحقيقي — تحقّق قبل الاستعمال", en: "Prints at true size — verify before use" },
        sheet: '<div class="sc-tools">' +
               '<svg class="sc-ruler" xmlns="http://www.w3.org/2000/svg" width="186mm" height="' + rl.h +
               'mm" viewBox="0 0 186 ' + rl.h + '">' + rl.body + "</svg>" +
               '<svg class="sc-prot" xmlns="http://www.w3.org/2000/svg" width="186mm" height="102mm" viewBox="0 0 186 102">' +
               protractorSVG(84) + "</svg></div>",
        answers: ""
      };
    }

    if (t === "plot") {
      var F = FUNCS[state.fn] ? FUNCS[state.fn] : FUNCS.quad;
      var made = F.make(r), Rp = lv === "easy" ? 6 : (lv === "med" ? 8 : 10);
      return {
        title: TITLES.plot,
        sub: { ar: made.label, en: made.label },
        sheet: '<div class="sc-coord">' + plotSVG(made.f, Rp) + "</div>",
        answers: ""
      };
    }

    if (t === "coord") {
      var q = coordQ(r, lv);
      var list = q.pts.map(function (p, k) {
        return "<div><u>" + (k + 1) + ".</u>( " + p[0] + " ، " + p[1] + " )</div>";
      }).join("");
      return {
        title: TITLES.coord, sub: { ar: LV[lv].ar + " · " + q.pts.length + " نقطة", en: LV[lv].en + " · " + q.pts.length + " points" },
        sheet: '<div class="sc-coord">' + axesSVG(q.R, q.pts, false) + '<div class="a-grid sc-pts">' + list + "</div></div>",
        answers: '<div class="sc-coord">' + axesSVG(q.R, q.pts, true) + "</div>"
      };
    }

    var n = t === "units" ? 28 : 16;
    for (i = 0; i < n; i++) {
      if (t === "units") {
        var u = unitQ(r, lv);
        items.push('<div class="q-item"><span class="q-num">' + (i + 1) + '</span><span class="cd-line">' +
          u.v + " " + (en ? u.from[1] : u.from[0]) + ' = <span class="ansbox inline"></span> ' +
          (en ? u.to[1] : u.to[0]) + "</span></div>");
        answers.push(u.answer + " " + (en ? u.to[1] : u.to[0]));
      } else {
        var L = lawQ(r, lv), fmt = en ? L.law.efmt : L.law.fmt;
        items.push('<div class="q-item"><span class="q-num">' + (i + 1) + '</span><span class="cd-line">' +
          (en ? L.law.en : L.law.ar) + ": " + fmt[0] + " = " + L.a + " ، " + fmt[1] + " = " + L.b +
          ' → <span class="ansbox inline"></span> ' + fmt[2] + "</span></div>");
        answers.push(L.answer + " " + fmt[2]);
      }
    }
    return {
      title: TITLES[t] || TITLES.units,
      sub: { ar: LV[lv].ar + " · " + n + " سؤالاً", en: LV[lv].en + " · " + n + " questions" },
      sheet: '<div class="q-grid wide">' + items.join("") + "</div>",
      answers: '<div class="a-grid">' + answers.map(function (a, k) {
        return "<div><u>" + (k + 1) + ".</u>" + a + "</div>"; }).join("") + "</div>"
    };
  }

  return { render: render, unitQ: unitQ, lawQ: lawQ, coordQ: coordQ,
           rulerSVG: rulerSVG, protractorSVG: protractorSVG, plotSVG: plotSVG,
           UNITS: UNITS, LAWS: LAWS, FUNCS: FUNCS };
});
