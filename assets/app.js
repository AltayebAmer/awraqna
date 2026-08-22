/* ════════════════════════════════════════════════════════════
   أوراقنا — الحالة والعرض والطباعة واللغة.
   المنطق الرياضي كله في generators.js — لا يُكرَّر هنا.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Logging بسيط غير حظري ──────────────────────────────── */
  var LOG = { on: /[?&]debug/.test(location.search) };
  function log(level, msg, data) {
    if (level === "info" && !LOG.on) return;
    var fn = console[level] || console.log;
    fn.call(console, "[awraqna] " + msg, data !== undefined ? data : "");
  }

  var $ = function (id) { return document.getElementById(id); };
  var EN = function () { return document.documentElement.getAttribute("lang") === "en"; };

  /* ── خيارات لوحة التحكم ─────────────────────────────────── */
  var OPTS = {
    grade: [1, 2, 3, 4, 5, 6].map(function (n) {
      return { v: n, ar: "الصف " + n, en: "Grade " + n };
    }),
    skill: [
      { v: "add", ar: "جمع",  en: "Addition" },
      { v: "sub", ar: "طرح",  en: "Subtraction" },
      { v: "mul", ar: "ضرب",  en: "Multiplication" }
    ],
    difficulty: [
      { v: "easy", ar: "سهل",   en: "Easy" },
      { v: "med",  ar: "متوسط", en: "Medium" },
      { v: "hard", ar: "صعب",   en: "Hard" }
    ],
    count: [10, 20, 30].map(function (n) { return { v: n, ar: n + " سؤال", en: n + " questions" }; })
  };
  var TITLES = {
    add: { ar: "أوراق عمل — الجمع", en: "Worksheet — Addition" },
    sub: { ar: "أوراق عمل — الطرح", en: "Worksheet — Subtraction" },
    mul: { ar: "أوراق عمل — الضرب", en: "Worksheet — Multiplication" }
  };
  var DIFF_LBL = { easy: { ar: "سهل", en: "Easy" }, med: { ar: "متوسط", en: "Medium" }, hard: { ar: "صعب", en: "Hard" } };

  /* ── الحالة: مصدر الحقيقة الوحيد ────────────────────────── */
  var state = { grade: 3, skill: "add", difficulty: "med", count: 20,
                seed: Math.floor(Math.random() * 1e6) + 1, withAnswers: true };
  var questions = [];

  /* ── بناء الأزرار ───────────────────────────────────────── */
  function buildChips(hostId, key) {
    var host = $(hostId);
    if (!host) { log("error", "عنصر مفقود: #" + hostId); return; }
    host.innerHTML = "";
    OPTS[key].forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.setAttribute("aria-pressed", String(state[key] === o.v));
      b.innerHTML = '<span data-ar>' + o.ar + '</span><span data-en>' + o.en + '</span>';
      b.addEventListener("click", function () {
        if (state[key] === o.v) return;
        state[key] = o.v;
        state.seed++;                       /* تغيير الإعدادات يعطي أسئلة جديدة أيضاً */
        host.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        save(); build();
      });
      host.appendChild(b);
    });
  }

  /* ── التخزين المحلي ─────────────────────────────────────── */
  function save() {
    try { localStorage.setItem("awraqna_state", JSON.stringify(state)); }
    catch (e) { log("warn", "تعذّر الحفظ محلياً", e.message); }
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem("awraqna_state") || "null");
      if (s && typeof s === "object") {
        ["grade", "skill", "difficulty", "count"].forEach(function (k) {
          if (s[k] !== undefined) state[k] = s[k];
        });
        if (typeof s.withAnswers === "boolean") state.withAnswers = s.withAnswers;
      }
    } catch (e) { log("warn", "حالة محفوظة تالفة — أُهملت", e.message); }
  }

  /* ── العرض ──────────────────────────────────────────────── */
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function sheetHead(isAnswers) {
    var en = EN(), t = TITLES[state.skill], d = DIFF_LBL[state.difficulty];
    var title = isAnswers ? (en ? "Answer Key" : "صفحة الإجابات") : (en ? t.en : t.ar);
    var sub = (en ? "Grade " + state.grade : "الصف " + state.grade) + " · " + (en ? d.en : d.ar) +
              " · " + state.count + (en ? " questions" : " سؤالاً");
    var fields = isAnswers
      ? '<div class="sheet-fields"><span>' + (en ? "Seed: " : "الرقم المرجعي: ") + state.seed + '</span></div>'
      : '<div class="sheet-fields"><span>' + (en ? "Name" : "الاسم") + ": </span><span>" +
        (en ? "Date" : "التاريخ") + ": </span></div>";
    return '<div class="sheet-head"><div class="sheet-title">' + esc(title) +
           '<small>' + esc(sub) + '</small></div>' + fields + '</div>';
  }

  function renderSheet() {
    var html = questions.map(function (q, i) {
      return '<div class="q-item"><span class="q-num">' + (i + 1) + '</span>' +
             '<span class="vform"><b>' + q.a + '</b>' +
             '<span class="op-line"><i>' + q.op + '</i><b>' + q.b + '</b></span>' +
             '<span class="rule"></span></span></div>';
    }).join("");
    $("sheet").innerHTML = sheetHead(false) + '<div class="q-grid">' + html + '</div>';
  }

  /* الإجابات مشتقّة من نفس المصفوفة ⇒ التطابق صحيح بالبناء لا بالاختبار. */
  function renderAnswers() {
    var el = $("answers");
    el.hidden = !state.withAnswers;
    if (!state.withAnswers) { el.innerHTML = ""; return; }
    var html = questions.map(function (q, i) {
      return '<div><u>' + (i + 1) + '.</u>' + q.answer + '</div>';
    }).join("");
    el.innerHTML = sheetHead(true) + '<div class="a-grid">' + html + '</div>';
  }

  function build() {
    try {
      questions = window.Generators.generate(state.skill, state);
    } catch (e) {
      log("error", "فشل التوليد", e.message);
      $("sheet").innerHTML = '<div class="sheet-head"><div class="sheet-title">' +
        (EN() ? "Generation failed — please reload." : "تعذّر التوليد — أعد تحميل الصفحة.") + "</div></div>";
      return;
    }
    renderSheet(); renderAnswers();
    $("seedNote").textContent = (EN() ? "Sheet ref: " : "الرقم المرجعي للورقة: ") + state.seed +
      (EN() ? " · every regenerate gives a new set" : " · كل إعادة توليد تعطي أسئلة جديدة");
    log("info", "تم التوليد", { skill: state.skill, n: questions.length, seed: state.seed });
  }

  /* ── اللغة ──────────────────────────────────────────────── */
  function setLang(lang) {
    var html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "en" ? "ltr" : "rtl");
    $("langBtn").textContent = lang === "en" ? "ع" : "EN";
    try { localStorage.setItem("awraqna_lang", lang); } catch (e) {}
    build();                                /* الورقة تحوي نصوصاً مولّدة ⇒ يجب إعادة رسمها */
  }

  /* ── الإقلاع ────────────────────────────────────────────── */
  function init() {
    load();
    buildChips("gradeChips", "grade");
    buildChips("skillChips", "skill");
    buildChips("diffChips", "difficulty");
    buildChips("countChips", "count");

    var ans = $("ansToggle");
    ans.setAttribute("aria-pressed", String(state.withAnswers));
    ans.addEventListener("click", function () {
      state.withAnswers = !state.withAnswers;
      ans.setAttribute("aria-pressed", String(state.withAnswers));
      save(); renderAnswers();
    });

    $("regenBtn").addEventListener("click", function () { state.seed++; build(); });
    $("printBtn").addEventListener("click", function () { window.print(); });
    $("langBtn").addEventListener("click", function () { setLang(EN() ? "ar" : "en"); });

    var saved = null;
    try { saved = localStorage.getItem("awraqna_lang"); } catch (e) {}
    if (saved === "en") setLang("en"); else build();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.AWRAQNA = { state: state, get questions() { return questions; }, build: build };
})();
