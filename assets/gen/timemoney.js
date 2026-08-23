/* GUARDIAN:BEGIN
   🛡️ أوراقنا | Awraqna — © 2026 Artist Altayeb Amer
   الفنان الطيب عامر  ·  https://awraqna.com
   Protected by ALTAYEB GUARDIAN v4.0
   GUARDIAN:END */
/* ════════════════════════════════════════════════════════════
   أوراقنا — مولّد الوقت والمال.
   الساعة تُرسم بحساب زوايا العقارب من الوقت نفسه، فلا يمكن أن
   تخالف الصورةُ الإجابة.
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.TimeMoneyGen = api;
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
  var p2 = function (n) { return (n < 10 ? "0" : "") + n; };

  /* دقّة الدقائق حسب المستوى: الساعة الكاملة ⇒ النصف ⇒ الربع ⇒ خمس دقائق ⇒ دقيقة. */
  var STEP = { easy: 30, med: 5, hard: 1 };

  function clockQ(r, lv) {
    var h = ri(r, 1, 12), step = STEP[lv], m = ri(r, 0, Math.floor(59 / step)) * step;
    return { h: h, m: m, answer: h + ":" + p2(m) };
  }

  function clockSVG(h, m, showTime) {
    var g = [], i;
    g.push('<circle cx="50" cy="50" r="46" fill="#fff" stroke="#111" stroke-width="1.6"/>');
    for (i = 0; i < 60; i++) {
      var th = (i / 60) * Math.PI * 2 - Math.PI / 2, big = i % 5 === 0;
      var r0 = big ? 38 : 41.5;
      g.push('<line x1="' + (50 + r0 * Math.cos(th)).toFixed(2) + '" y1="' + (50 + r0 * Math.sin(th)).toFixed(2) +
             '" x2="' + (50 + 44 * Math.cos(th)).toFixed(2) + '" y2="' + (50 + 44 * Math.sin(th)).toFixed(2) +
             '" stroke="#111" stroke-width="' + (big ? 1 : 0.4) + '"/>');
    }
    for (i = 1; i <= 12; i++) {
      var a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      g.push('<text x="' + (50 + 31 * Math.cos(a)).toFixed(2) + '" y="' + (50 + 31 * Math.sin(a) + 3).toFixed(2) +
             '" font-size="8.5" text-anchor="middle" font-family="Menlo,monospace" font-weight="700" fill="#111">' + i + "</text>");
    }
    /* عقرب الساعات يتقدّم بالدقائق أيضاً — إغفال ذلك يجعل الورقة تعلّم خطأً. */
    var ha = ((h % 12) + m / 60) / 12 * Math.PI * 2 - Math.PI / 2;
    var ma = (m / 60) * Math.PI * 2 - Math.PI / 2;
    g.push('<line x1="50" y1="50" x2="' + (50 + 21 * Math.cos(ha)).toFixed(2) + '" y2="' + (50 + 21 * Math.sin(ha)).toFixed(2) +
           '" stroke="#111" stroke-width="2.6" stroke-linecap="round"/>');
    g.push('<line x1="50" y1="50" x2="' + (50 + 32 * Math.cos(ma)).toFixed(2) + '" y2="' + (50 + 32 * Math.sin(ma)).toFixed(2) +
           '" stroke="#111" stroke-width="1.6" stroke-linecap="round"/>');
    g.push('<circle cx="50" cy="50" r="2" fill="#111"/>');
    if (showTime)
      g.push('<text x="50" y="72" font-size="9" text-anchor="middle" font-family="Menlo,monospace" fill="#c94f4f">' +
             h + ":" + p2(m) + "</text>");
    return '<svg class="tm-clock" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">' +
           g.join("") + "</svg>";
  }

  /* ── المدة المنقضية ── */
  function elapsedQ(r, lv) {
    var h1 = ri(r, 1, 11), m1 = ri(r, 0, 11) * 5;
    var add = lv === "easy" ? ri(r, 1, 6) * 15 : ri(r, 20, lv === "med" ? 200 : 400);
    var t1 = h1 * 60 + m1, t2 = t1 + add;
    var h2 = Math.floor(t2 / 60) % 12 || 12, m2 = t2 % 60;
    return { from: h1 + ":" + p2(m1), to: h2 + ":" + p2(m2), add: add,
             answer: Math.floor(add / 60) + " سا " + (add % 60) + " د" };
  }

  /* ── المال ── */
  var CUR = { ar: "ريال", en: "SAR" };
  function moneyQ(r, lv) {
    var kind = Math.floor(r() * 3);
    var a = ri(r, 5, lv === "easy" ? 50 : 500), b = ri(r, 2, lv === "easy" ? 20 : 200);
    if (kind === 0) return { txt: a + " + " + b, answer: a + b };
    if (kind === 1) { if (b > a) { var t = a; a = b; b = t; } return { txt: a + " − " + b, answer: a - b }; }
    var q = ri(r, 2, lv === "easy" ? 5 : 12);
    return { txt: a + " × " + q, answer: a * q };
  }

  /* ── تقويم شهري فارغ ── */
  var MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  var MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  var DAYS_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  function calendar(year, month, en) {
    var first = new Date(Date.UTC(year, month, 1)).getUTCDay();
    var days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    var head = (en ? DAYS_EN : DAYS).map(function (d) { return "<th>" + d + "</th>"; }).join("");
    var cells = "", i;
    for (i = 0; i < first; i++) cells += "<td></td>";
    for (i = 1; i <= days; i++) {
      cells += '<td><span class="cal-n">' + i + "</span></td>";
      if ((first + i) % 7 === 0) cells += "</tr><tr>";
    }
    return '<table class="cal"><caption>' + (en ? MONTHS_EN[month] : MONTHS[month]) + " " + year +
           "</caption><thead><tr>" + head + "</tr></thead><tbody><tr>" + cells + "</tr></tbody></table>";
  }

  var TITLES = {
    clock:    { ar: "قراءة الساعة", en: "Reading clocks" },
    elapsed:  { ar: "المدة المنقضية", en: "Elapsed time" },
    money:    { ar: "حساب المال", en: "Money maths" },
    calendar: { ar: "تقويم شهري", en: "Monthly calendar" }
  };
  var LV = { easy: { ar: "سهل", en: "Easy" }, med: { ar: "متوسط", en: "Medium" }, hard: { ar: "صعب", en: "Hard" } };
  var EN = function () { return typeof Core !== "undefined" && Core.EN && Core.EN(); };

  function render(state) {
    var r = rng(state.seed), t = state.type, lv = state.level || "med", en = EN();
    var items = [], answers = [], i;

    if (t === "calendar") {
      var y = 2026 + Math.floor(r() * 2), mth = Math.floor(r() * 12);
      return {
        title: TITLES.calendar,
        sub: { ar: "شهر فارغ للتخطيط", en: "Blank planning month" },
        sheet: '<div class="tm-cal">' + calendar(y, mth, en) + "</div>",
        answers: ""
      };
    }

    var n = t === "clock" ? 12 : (t === "elapsed" ? 20 : 28);
    for (i = 0; i < n; i++) {
      if (t === "clock") {
        var c = clockQ(r, lv);
        items.push('<div class="tm-item"><span class="q-num">' + (i + 1) + "</span>" +
          clockSVG(c.h, c.m, false) + '<div class="tm-ans"><span class="ansbox inline"></span></div></div>');
        answers.push(c.answer);
      } else if (t === "elapsed") {
        var e = elapsedQ(r, lv);
        items.push('<div class="q-item"><span class="q-num">' + (i + 1) + '</span><span class="cd-line">' +
          e.from + ' <span class="cd-arrow">→</span> ' + e.to + ' = <span class="ansbox inline"></span></span></div>');
        answers.push(e.answer);
      } else {
        var m = moneyQ(r, lv);
        items.push('<div class="q-item"><span class="q-num">' + (i + 1) + '</span><span class="cd-line">' +
          m.txt + ' = <span class="ansbox inline"></span> ' + (en ? CUR.en : CUR.ar) + "</span></div>");
        answers.push(m.answer + " " + (en ? CUR.en : CUR.ar));
      }
    }
    return {
      title: TITLES[t] || TITLES.clock,
      sub: { ar: LV[lv].ar + " · " + n + " سؤالاً", en: LV[lv].en + " · " + n + " questions" },
      sheet: '<div class="' + (t === "clock" ? "tm-grid" : "q-grid wide") + '">' + items.join("") + "</div>",
      answers: '<div class="a-grid">' + answers.map(function (a, k) {
        return "<div><u>" + (k + 1) + ".</u>" + a + "</div>"; }).join("") + "</div>"
    };
  }

  return { render: render, clockQ: clockQ, clockSVG: clockSVG, elapsedQ: elapsedQ, moneyQ: moneyQ, calendar: calendar };
});
