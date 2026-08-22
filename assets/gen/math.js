/* ════════════════════════════════════════════════════════════
   أوراقنا — awraqna.com  ·  مولّدات الرياضيات
   منطق نقي: ممنوع لمس DOM في هذا الملف (انظر CLAUDE.md).
   يعمل في المتصفح <script> وفي node عبر require.
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MathGen = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ── مولّد عشوائي بـ seed صريح ─────────────────────────────
     السبب: «إعادة توليد» = seed++ فقط، والـ seed يُعرض على الورقة
     فيصبح اختلاف ورقتين قابلاً للبرهنة لا للادّعاء. */
  function mulberry32(seed) {
    var t = (seed >>> 0) || 1;
    return function () {
      t = (t + 0x6d2b79f5) >>> 0;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  var randInt = function (rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); };

  /* ── مدى الأرقام حسب الصف ────────────────────────────────
     الصف يضبط المدى فقط ولا يقيّد المهارة (قرار (أ) في PROJECT_MAP). */
  var GRADE = {
    1: { addMax: 10,    mulA: [2, 9],     mulB: [2, 5]   },
    2: { addMax: 20,    mulA: [2, 12],    mulB: [2, 10]  },
    3: { addMax: 100,   mulA: [2, 12],    mulB: [2, 12]  },
    4: { addMax: 500,   mulA: [11, 99],   mulB: [2, 9]   },
    5: { addMax: 1000,  mulA: [11, 99],   mulB: [11, 99] },
    6: { addMax: 10000, mulA: [100, 999], mulB: [11, 99] }
  };
  var ADD_SCALE = { easy: 0.6, med: 1, hard: 1.6 };
  var DIFFS = { easy: 1, med: 1, hard: 1 };

  /* النصف الأدنى للسهل، الكامل للمتوسط، النصف الأعلى للصعب. */
  function slice(range, diff) {
    var lo = range[0], hi = range[1], mid = lo + Math.floor((hi - lo) / 2);
    if (diff === "easy") return [lo, Math.max(lo, mid)];
    if (diff === "hard") return [Math.min(hi, mid + 1), hi];
    return [lo, hi];
  }

  function digits(n) { return String(n).split("").map(Number).reverse(); }

  /* الصعب في الجمع = وجود حمل carry فعلي، لا مجرد أرقام أكبر. */
  function hasCarry(a, b) {
    var da = digits(a), db = digits(b), carry = 0;
    for (var i = 0; i < Math.max(da.length, db.length); i++) {
      var s = (da[i] || 0) + (db[i] || 0) + carry;
      if (s >= 10) return true;
      carry = 0;
    }
    return false;
  }
  /* الصعب في الطرح = استلاف borrow فعلي. */
  function needsBorrow(a, b) {
    var da = digits(a), db = digits(b);
    for (var i = 0; i < db.length; i++) if ((db[i] || 0) > (da[i] || 0)) return true;
    return false;
  }

  /* ── المهارات ─────────────────────────────────────────────
     كل مهارة: draw(rng, g, diff) → Question|null  (null = مرفوض، أعد المحاولة) */
  var SKILLS = {
    add: function (rng, g, diff) {
      var max = Math.max(2, Math.round(GRADE[g].addMax * ADD_SCALE[diff]));
      var a = randInt(rng, 1, max), b = randInt(rng, 1, max);
      if (diff === "hard" && !hasCarry(a, b)) return null;
      return { a: a, op: "+", b: b, answer: a + b };
    },
    sub: function (rng, g, diff) {
      var max = Math.max(2, Math.round(GRADE[g].addMax * ADD_SCALE[diff]));
      var a = randInt(rng, 1, max), b = randInt(rng, 1, max);
      /* لا ناتج سالب إلا في الصفوف ٥–٦ ومستوى صعب. */
      if (a < b && !(g >= 5 && diff === "hard")) { var t = a; a = b; b = t; }
      if (a === b) return null;
      if (diff === "hard" && a > b && !needsBorrow(a, b)) return null;
      return { a: a, op: "−", b: b, answer: a - b };
    },
    div: function (rng, g, diff) {
      /* نبني من الناتج للأسفل: b × q = a ⇒ القسمة صحيحة دائماً بلا كسور. */
      var rb = slice(GRADE[g].mulB, diff), rq = slice(GRADE[g].mulA, diff);
      var b = randInt(rng, Math.max(2, rb[0]), rb[1]);
      var q = randInt(rng, Math.max(2, rq[0]), rq[1]);
      if (diff === "hard" && q <= 1) return null;
      return { a: b * q, op: "\u00f7", b: b, answer: q };
    },
    cmp: function (rng, g, diff) {
      var max = Math.max(3, Math.round(GRADE[g].addMax * ADD_SCALE[diff]));
      var a = randInt(rng, 1, max), b = randInt(rng, 1, max);
      /* المتساويان مفيدان تربوياً لكن نادرَين طبيعياً — نفرضهما بنسبة السدس. */
      if (rng() < 0.16) b = a;
      return { a: a, op: "?", b: b, answer: a > b ? ">" : (a < b ? "<" : "=") };
    },
    pat: function (rng, g, diff) {
      var step = randInt(rng, 2, diff === "easy" ? 5 : (diff === "med" ? 10 : 25));
      if (diff !== "easy" && rng() < 0.3) step = -step;
      var start = randInt(rng, 1, Math.max(5, Math.round(GRADE[g].addMax * 0.4)));
      if (step < 0) start = Math.abs(step) * 4 + randInt(rng, 1, 20);
      var seq = [start, start + step, start + 2 * step, start + 3 * step];
      if (seq.some(function (n) { return n < 0; })) return null;
      return { seq: seq, op: "…", a: seq[0], b: step, answer: start + 4 * step };
    },
    mul: function (rng, g, diff) {
      var ra = slice(GRADE[g].mulA, diff), rb = slice(GRADE[g].mulB, diff);
      var a = randInt(rng, ra[0], ra[1]), b = randInt(rng, rb[0], rb[1]);
      if (diff === "hard" && (a <= 1 || b <= 1)) return null;
      return { a: a, op: "×", b: b, answer: a * b };
    }
  };

  function key(q) { return q.seq ? q.seq.join(",") : (q.a + q.op + q.b); }

  /* ── الواجهة العامة ───────────────────────────────────────
     generate(skill, {grade, difficulty, count, seed}) → Question[] */
  function generate(skill, opts) {
    opts = opts || {};
    var draw = SKILLS[skill];
    if (!draw) throw new Error("skill غير معروفة: " + skill);

    var grade = Math.min(6, Math.max(1, parseInt(opts.grade, 10) || 3));
    var diff  = DIFFS[opts.difficulty] ? opts.difficulty : "med";
    var count = Math.min(40, Math.max(1, parseInt(opts.count, 10) || 20));
    var rng   = mulberry32(parseInt(opts.seed, 10) || 1);

    var out = [], seen = Object.create(null);
    /* سقف المحاولات يمنع الحلقة اللانهائية حين يكون فضاء الأرقام أصغر
       من العدد المطلوب (مثال: صف ١ · ضرب · سهل = ٤ تباديل فقط). */
    var cap = count * 300, tries = 0, relaxed = false;
    while (out.length < count && tries < cap) {
      tries++;
      var q = draw(rng, grade, diff);
      if (!q) continue;
      var k = key(q);
      if (!relaxed && seen[k]) continue;
      seen[k] = 1;
      out.push(q);
      if (!relaxed && tries > cap * 0.6 && out.length < count) relaxed = true;
    }
    /* آخر ملاذ: املأ بأسئلة صالحة ولو مكرّرة — ورقة ناقصة أسوأ من ورقة بها تكرار. */
    if (out.length < count) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[awraqna] فضاء الأرقام ضيّق (" + skill + "/صف " + grade + "/" + diff +
                     ") — سُمح بالتكرار لإكمال " + count + " سؤالاً.");
      }
      var guard = 0;
      while (out.length < count && guard++ < count * 500) {
        var f = draw(rng, grade, "med");
        if (f) out.push(f);
      }
    }
    return out;
  }


  /* ── العرض ────────────────────────────────────────────────
     يعيد نصوصاً لا يلمس DOM ⇒ قابل للاختبار في node مثل المولّدات. */
  var TITLES = {
    add: { ar: "أوراق عمل — الجمع", en: "Worksheet — Addition" },
    sub: { ar: "أوراق عمل — الطرح", en: "Worksheet — Subtraction" },
    mul: { ar: "أوراق عمل — الضرب", en: "Worksheet — Multiplication" },
    div: { ar: "أوراق عمل — القسمة", en: "Worksheet — Division" },
    cmp: { ar: "أوراق عمل — المقارنة", en: "Worksheet — Comparing" },
    pat: { ar: "أوراق عمل — الأنماط", en: "Worksheet — Patterns" }
  };
  var DIFF = { easy: { ar: "سهل", en: "Easy" }, med: { ar: "متوسط", en: "Medium" }, hard: { ar: "صعب", en: "Hard" } };

  function item(q, i) {
    var body;
    if (q.seq) {
      body = '<span class="inline-q">' + q.seq.join(" ، ") +
             ' ، <span class="ansbox inline"></span></span>';
    } else if (q.op === "?") {
      body = '<span class="inline-q">' + q.a + ' <span class="ansbox inline sm"></span> ' + q.b + "</span>";
    } else {
      body = '<span class="vform"><b>' + q.a + "</b>" +
             '<span class="op-line"><i>' + q.op + "</i><b>" + q.b + "</b></span>" +
             '<span class="rule"></span><span class="ansbox"></span></span>';
    }
    return '<div class="q-item"><span class="q-num">' + (i + 1) + "</span>" + body + "</div>";
  }

  function render(state) {
    var qs = generate(state.skill, state);
    var wide = state.skill === "pat";
    return {
      title: TITLES[state.skill] || TITLES.add,
      sub: {
        ar: "الصف " + state.grade + " · " + DIFF[state.difficulty].ar + " · " + qs.length + " سؤالاً",
        en: "Grade " + state.grade + " \u00b7 " + DIFF[state.difficulty].en + " \u00b7 " + qs.length + " questions"
      },
      sheet: '<div class="q-grid' + (wide ? " wide" : "") + '">' + qs.map(item).join("") + "</div>",
      answers: '<div class="a-grid">' + qs.map(function (q, i) {
        return "<div><u>" + (i + 1) + ".</u>" + q.answer + "</div>";
      }).join("") + "</div>"
    };
  }

  return { generate: generate, render: render, mulberry32: mulberry32, SKILLS: Object.keys(SKILLS) };
});
