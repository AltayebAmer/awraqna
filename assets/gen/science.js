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

  var TITLES = {
    units: { ar: "تحويل الوحدات", en: "Unit conversion" },
    laws:  { ar: "قوانين فيزيائية", en: "Physics formulas" },
    coord: { ar: "شبكة الإحداثيات", en: "Coordinate grid" }
  };
  var LV = { easy: { ar: "سهل", en: "Easy" }, med: { ar: "متوسط", en: "Medium" }, hard: { ar: "صعب", en: "Hard" } };
  var EN = function () { return typeof Core !== "undefined" && Core.EN && Core.EN(); };

  function render(state) {
    var r = rng(state.seed), t = state.type, lv = state.level || "med";
    var items = [], answers = [], i, en = EN();

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

  return { render: render, unitQ: unitQ, lawQ: lawQ, coordQ: coordQ, UNITS: UNITS, LAWS: LAWS };
});
