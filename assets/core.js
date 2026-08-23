/* GUARDIAN:BEGIN
   🛡️ أوراقنا | Awraqna — © 2026 Artist Altayeb Amer
   الفنان الطيب عامر  ·  https://awraqna.com
   Protected by ALTAYEB GUARDIAN v4.0
   GUARDIAN:END */
/* ════════════════════════════════════════════════════════════
   أوراقنا — النواة المشتركة بين كل المجالات.
   كل ما يتكرر في أكثر من صفحتين يعيش هنا: العشوائية بـ seed،
   الأزرار، اللغة، التخزين، الطباعة، وترويسة الورقة.
   ممنوع وضع منطق مجال بعينه هنا — مكانه assets/gen/<domain>.js
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Core = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ── عشوائية بـ seed صريح ⇒ «إعادة توليد» = seed++ ──────── */
  function rng(seed) {
    var t = (seed >>> 0) || 1;
    return function () {
      t = (t + 0x6d2b79f5) >>> 0;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  function randInt(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function shuffle(r, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  var $ = function (id) { return document.getElementById(id); };
  var EN = function () { return document.documentElement.getAttribute("lang") === "en"; };
  var T = function (o) { return o == null ? "" : (typeof o === "string" ? o : (EN() ? o.en : o.ar)); };

  var LOG = { on: /[?&]debug/.test(location.search) };
  function log(level, msg, data) {
    if (level === "info" && !LOG.on) return;
    (console[level] || console.log).call(console, "[awraqna] " + msg, data !== undefined ? data : "");
  }

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
  }

  /* ── ترويسة الورقة: الاسم والتاريخ للطالب، والرقم المرجعي لصفحة الإجابات ── */
  function sheetHead(title, sub, isAnswers, seed) {
    var en = EN();
    var fields = isAnswers
      ? '<div class="sheet-fields"><span>' + (en ? "Seed: " : "الرقم المرجعي: ") + seed + "</span></div>"
      : '<div class="sheet-fields"><span>' + (en ? "Name" : "الاسم") + ": </span><span>" +
        (en ? "Date" : "التاريخ") + ": </span></div>";
    return '<div class="sheet-head"><div class="sheet-title">' + esc(title) +
           (sub ? '<small>' + esc(sub) + "</small>" : "") + "</div>" + fields + "</div>";
  }

  /* سطر النسبة على الورق: الورقة تنتقل من يد إلى يد مطبوعةً،
     فهو الوسيلة الوحيدة ليعرف من يمسكها من أين جاءت. صغير ولا يزاحم. */
  function credit() {
    return '<div class="sheet-credit"><span class="cr-site">awraqna.com</span>' +
           '<span class="cr-owner">' + (EN() ? "Artist Altayeb Amer" : "الفنان الطيب عامر") + "</span></div>";
  }

  /* `fade` = نسبة الشفافية المطلوبة (0 = صلب). القيمة المخزَّنة هي
     الشفافية نفسها لا معكوسها، حتى يطابق الرقمُ الظاهر اسمَ الزرّ.
     الحدّ الأدنى 0.08 يمنع ورقة لا تُرى على الطابعة إطلاقاً. */
  function ink(state, html) {
    var f = Number(state.fade);
    if (!f || f <= 0) return html;
    var op = Math.max(0.08, 1 - f / 100);
    return '<div class="sheet-body" style="opacity:' + (Math.round(op * 100) / 100) + '">' + html + "</div>";
  }

  /* ── التخزين المحلي: مفتاح مستقل لكل مجال ───────────────── */
  function load(key, state) {
    try {
      var s = JSON.parse(localStorage.getItem("awraqna_" + key) || "null");
      if (s && typeof s === "object") {
        Object.keys(state).forEach(function (k) { if (k !== "seed" && s[k] !== undefined) state[k] = s[k]; });
      }
    } catch (e) { log("warn", "حالة محفوظة تالفة — أُهملت", e.message); }
    return state;
  }
  function save(key, state) {
    try { localStorage.setItem("awraqna_" + key, JSON.stringify(state)); }
    catch (e) { log("warn", "تعذّر الحفظ محلياً", e.message); }
  }

  /* ══════════════════════════════════════════════════════════
     mount — كل صفحة مجال تستدعيه مرة واحدة.
     cfg = { key, state, controls[], answers:bool, render(state)->{title,sub,sheet,answers} }
     ══════════════════════════════════════════════════════════ */
  function mount(cfg) {
    var state = cfg.state;
    state.seed = Math.floor(Math.random() * 1e6) + 1;
    if (cfg.answers !== false && state.withAnswers === undefined) state.withAnswers = true;
    load(cfg.key, state);

    var host = $("controls");
    if (!host) { log("error", "لا يوجد #controls في الصفحة"); return; }

    /* الأزرار: نقرة واحدة لكل خيار — القوائم المنسدلة نقرتان وتكسر معيار ٣ النقرات.
       والمساطر الرقمية (range) لما هو كمّي بطبعه: عدد التكرار، القطر، الصفوف.
       زرّاً لكل قيمة من ٣ إلى ٣٦ عبث. */
    var rows = [];
    cfg.controls.forEach(function (c) {
      var row = document.createElement("div");
      row.className = "ctl-row";
      row.innerHTML = '<div class="ctl-label"><span data-ar>' + c.label.ar + '</span>' +
                      '<span data-en>' + c.label.en + "</span></div>";

      if (c.type === "range") {
        var wrap = document.createElement("div");
        wrap.className = "rangebox";
        var inp = document.createElement("input");
        inp.type = "range";
        inp.min = c.min; inp.max = c.max; inp.step = c.step || 1;
        inp.value = state[c.k];
        inp.className = "rng";
        inp.setAttribute("aria-label", c.label.ar);
        var out = document.createElement("output");
        out.className = "rngval";
        out.textContent = state[c.k] + (c.unit || "");
        /* التحديث فوري أثناء السحب — المعاينة الحيّة هي الفائدة كلها. */
        inp.addEventListener("input", function () {
          state[c.k] = Number(inp.value);
          out.textContent = inp.value + (c.unit || "");
          draw();
        });
        inp.addEventListener("change", function () { save(cfg.key, state); });
        wrap.appendChild(inp); wrap.appendChild(out);
        row.appendChild(wrap);
      } else {
        var chips = document.createElement("div");
        chips.className = "chips";
        chips.setAttribute("role", "group");
        c.opts.forEach(function (o) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "chip";
          b.setAttribute("aria-pressed", String(state[c.k] === o.v));
          b.innerHTML = '<span data-ar>' + o.ar + '</span><span data-en>' + o.en + "</span>";
          b.addEventListener("click", function () {
            if (state[c.k] === o.v) return;
            state[c.k] = o.v;
            if (c.keepSeed !== true) state.seed++;
            chips.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
            b.setAttribute("aria-pressed", "true");
            save(cfg.key, state); sync(); draw();
          });
          chips.appendChild(b);
        });
        row.appendChild(chips);
      }
      host.appendChild(row);
      rows.push({ row: row, cfg: c });
    });

    /* إظهار الصفوف المرتبطة بالوضع الحالي فقط: مساطر الشعاعي لا معنى لها
       في الشبكي، وعرضها معطّلةً يربك أكثر مما يوضّح. */
    function sync() {
      rows.forEach(function (r) {
        if (typeof r.cfg.showIf === "function") r.row.hidden = !r.cfg.showIf(state);
      });
    }
    sync();

    if (cfg.answers !== false) {
      var row = document.createElement("div");
      row.className = "ctl-row";
      /* بعض الأنشطة داخل المجال الواحد بلا صفحة إجابات — إخفاء الزرّ
         أصدق من عرضه معطّلاً أو فاعلاً بلا أثر. */
      row.innerHTML = '<div class="ctl-label"><span data-ar>الإجابات</span><span data-en>Answers</span></div>';
      var chips = document.createElement("div");
      chips.className = "chips";
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.id = "ansToggle";
      b.setAttribute("aria-pressed", String(state.withAnswers));
      b.innerHTML = '<span data-ar>اطبع صفحة الإجابات</span><span data-en>Print answer key</span>';
      b.addEventListener("click", function () {
        state.withAnswers = !state.withAnswers;
        b.setAttribute("aria-pressed", String(state.withAnswers));
        save(cfg.key, state); draw();
      });
      chips.appendChild(b); row.appendChild(chips); host.appendChild(row);
      rows.push({ row: row, cfg: { showIf: cfg.answersShowIf } });
    }

    function draw() {
      var out;
      try {
        out = cfg.render(state);
      } catch (e) {
        log("error", "فشل التوليد", e.message);
        $("sheet").innerHTML = '<div class="sheet-head"><div class="sheet-title">' +
          (EN() ? "Generation failed — please reload." : "تعذّر التوليد — أعد تحميل الصفحة.") + "</div></div>";
        return;
      }
      var title = T(out.title), sub = T(out.sub);
      /* الشفافية تُطبَّق على **محتوى الورقة وحده** لا على الترويسة وسطر
         النسبة: الغرض ورقة باهتة تُتبَّع بالقلم فوقها، لا صفحة كاملة باهتة
         يختفي منها اسم الطالب والتاريخ. */
      var body = ink(state, out.sheet);
      /* بعض المجالات (ورق المعلّم) ورقتها هي المنتج نفسه ⇒ لا ترويسة. */
      $("sheet").innerHTML = (out.head === false ? "" : sheetHead(title, sub, false, state.seed)) +
                             body + credit();

      var ael = $("answers");
      var showAns = cfg.answers !== false && state.withAnswers && out.answers;
      ael.hidden = !showAns;
      ael.innerHTML = showAns
        ? sheetHead(EN() ? "Answer Key" : "صفحة الإجابات", sub, true, state.seed) + ink(state, out.answers) + credit()
        : "";

      var note = $("seedNote");
      if (note) note.textContent = (EN() ? "Sheet ref: " : "الرقم المرجعي للورقة: ") + state.seed +
        (EN() ? " · every regenerate gives a new set" : " · كل إعادة توليد تعطي ورقة جديدة");
      log("info", "تم التوليد", { key: cfg.key, seed: state.seed });
    }

    function setLang(lang) {
      var h = document.documentElement;
      h.setAttribute("lang", lang);
      h.setAttribute("dir", lang === "en" ? "ltr" : "rtl");
      var lb = $("langBtn"); if (lb) lb.textContent = lang === "en" ? "ع" : "EN";
      try { localStorage.setItem("awraqna_lang", lang); } catch (e) {}
      draw();                       /* الورقة تحوي نصوصاً مولّدة ⇒ تُعاد رسمها */
    }

    var rb = $("regenBtn"); if (rb) rb.addEventListener("click", function () { state.seed++; draw(); });
    var pb = $("printBtn"); if (pb) pb.addEventListener("click", function () { window.print(); });
    var lb = $("langBtn"); if (lb) lb.addEventListener("click", function () { setLang(EN() ? "ar" : "en"); });

    var saved = null;
    try { saved = localStorage.getItem("awraqna_lang"); } catch (e) {}
    if (saved === "en") setLang("en"); else draw();

    window.AWRAQNA = { state: state, draw: draw, sync: sync, key: cfg.key };
  }

  return { rng: rng, randInt: randInt, shuffle: shuffle, mount: mount,
           esc: esc, T: T, EN: EN, log: log, sheetHead: sheetHead, credit: credit, ink: ink, version: "2.3" };
});
