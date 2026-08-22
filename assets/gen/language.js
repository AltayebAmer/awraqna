/* ════════════════════════════════════════════════════════════
   أوراقنا — مولّد الحروف واللغات.
   الحروف المجوَّفة تُرسم بخط النظام + -webkit-text-stroke:
   صفر ملف خط، صفر صورة، وكل شكل حرف عربي يأتي من محرك
   التشكيل نفسه عبر ZWJ لا من جدول مكتوب يدوياً.
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LangGen = api;
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

  var ZWJ = "‍";
  var AR = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");
  /* حروف لا تتصل بما بعدها ⇒ لا شكل أوّلي ولا وسطي. هذه حقيقة لغوية
     لا استثناء برمجي: عرض أربعة أشكال لها يعلّم الطفل خطأً. */
  var NON_CONNECT = "ادذرزو".split("");
  var EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  var AR_NUM = "٠١٢٣٤٥٦٧٨٩".split("");
  var EN_NUM = "0123456789".split("");

  var NAMES = {
    "ا": "ألف", "ب": "باء", "ت": "تاء", "ث": "ثاء", "ج": "جيم", "ح": "حاء", "خ": "خاء",
    "د": "دال", "ذ": "ذال", "ر": "راء", "ز": "زاي", "س": "سين", "ش": "شين", "ص": "صاد",
    "ض": "ضاد", "ط": "طاء", "ظ": "ظاء", "ع": "عين", "غ": "غين", "ف": "فاء", "ق": "قاف",
    "ك": "كاف", "ل": "لام", "م": "ميم", "ن": "نون", "ه": "هاء", "و": "واو", "ي": "ياء"
  };

  function alphabet(script) {
    if (script === "en") return EN;
    if (script === "ar-num") return AR_NUM;
    if (script === "en-num") return EN_NUM;
    return AR;
  }

  function forms(ch) {
    if (NON_CONNECT.indexOf(ch) !== -1)
      return [{ t: ch, ar: "منفصل", en: "Isolated" }, { t: ZWJ + ch, ar: "آخر", en: "Final" }];
    return [
      { t: ch, ar: "منفصل", en: "Isolated" },
      { t: ch + ZWJ, ar: "أول", en: "Initial" },
      { t: ZWJ + ch + ZWJ, ar: "وسط", en: "Medial" },
      { t: ZWJ + ch, ar: "آخر", en: "Final" }
    ];
  }

  var esc = function (s) {
    return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
  };

  /* صف تتبّع: أول حرف غامق كنموذج، والبقية مجوَّفة. */
  function traceRow(ch, reps) {
    var out = ['<span class="tr-model">' + esc(ch) + "</span>"];
    for (var i = 1; i < reps; i++) out.push('<span class="tr-ghost">' + esc(ch) + "</span>");
    return '<div class="tr-row">' + out.join("") + "</div>";
  }

  function letterBlock(ch, script, reps, showForms, rows) {
    var head = '<div class="lt-head"><span class="lt-big">' + esc(ch) + "</span>";
    if (script === "ar" && NAMES[ch]) head += '<span class="lt-name">' + esc(NAMES[ch]) + "</span>";
    head += "</div>";

    var f = "";
    if (showForms && script === "ar") {
      f = '<div class="lt-forms">' + forms(ch).map(function (x) {
        return '<div class="lt-form"><span class="lt-fchar">' + esc(x.t) + "</span>" +
               '<span class="lt-flabel"><span data-ar>' + x.ar + '</span><span data-en>' + x.en + "</span></span></div>";
      }).join("") + "</div>";
    }
    var body = "";
    for (var i = 0; i < rows; i++) body += traceRow(ch, reps);
    return '<div class="lt-block">' + head + f + '<div class="tr-rows">' + body + "</div></div>";
  }

  var TITLES = {
    "ar":     { ar: "تتبّع الحروف العربية", en: "Arabic letter tracing" },
    "en":     { ar: "تتبّع الحروف الإنجليزية", en: "English letter tracing" },
    "ar-num": { ar: "تتبّع الأرقام العربية", en: "Arabic-Indic numeral tracing" },
    "en-num": { ar: "تتبّع الأرقام", en: "Numeral tracing" }
  };
  var COLOR_TITLES = {
    "ar":     { ar: "لوّن الحرف", en: "Colour the letter" },
    "en":     { ar: "لوّن الحرف", en: "Colour the letter" },
    "ar-num": { ar: "لوّن الرقم", en: "Colour the numeral" },
    "en-num": { ar: "لوّن الرقم", en: "Colour the numeral" }
  };
  var REPS = { ar: 6, en: 8, "ar-num": 8, "en-num": 8 };
  /* عدد صفوف التتبّع يملأ الورقة: كلما قلّ عدد الحروف زاد التمرين. */
  var ROWS = { 1: 8, 2: 5, 4: 3 };

  function render(state) {
    var script = state.script || "ar";
    var list = alphabet(script);
    var r = rng(state.seed);
    var start = Math.floor(r() * list.length);

    if (state.mode === "color") {
      var ch = list[start];
      var name = script === "ar" && NAMES[ch] ? '<div class="cl-name">' + esc(NAMES[ch]) + "</div>" : "";
      return {
        title: COLOR_TITLES[script],
        sub: { ar: "لوّن داخل الحرف", en: "Colour inside the outline" },
        sheet: '<div class="cl-wrap"><span class="cl-big">' + esc(ch) + "</span>" + name + "</div>",
        answers: ""
      };
    }

    var per = Number(state.per) || 2;
    var blocks = [], i;
    for (i = 0; i < per; i++)
      blocks.push(letterBlock(list[(start + i) % list.length], script, REPS[script], per <= 2, ROWS[per] || 4));
    return {
      title: TITLES[script],
      sub: {
        /* المثنّى في العربية ليس جمعاً: «حرفان» لا «2 حروف». */
        ar: (per === 1 ? "حرف واحد" : per === 2 ? "حرفان" : per + " حروف") +
            (per <= 2 && script === "ar" ? " · بأشكاله" : " · تتبّع"),
        en: (per === 1 ? "One letter" : per + " letters")
      },
      sheet: '<div class="lt-grid" data-per="' + per + '">' + blocks.join("") + "</div>",
      answers: ""
    };
  }

  return { render: render, forms: forms, alphabet: alphabet, NAMES: NAMES, NON_CONNECT: NON_CONNECT };
});
