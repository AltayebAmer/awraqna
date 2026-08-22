/* ════════════════════════════════════════════════════════════
   أوراقنا — awraqna.com  ·  مولّدات الرياضيات
   منطق نقي: ممنوع لمس DOM في هذا الملف (انظر CLAUDE.md).
   يعمل في المتصفح <script> وفي node عبر require.
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Generators = api;
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
    mul: function (rng, g, diff) {
      var ra = slice(GRADE[g].mulA, diff), rb = slice(GRADE[g].mulB, diff);
      var a = randInt(rng, ra[0], ra[1]), b = randInt(rng, rb[0], rb[1]);
      if (diff === "hard" && (a <= 1 || b <= 1)) return null;
      return { a: a, op: "×", b: b, answer: a * b };
    }
  };

  function key(q) { return q.a + q.op + q.b; }

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

  return { generate: generate, mulberry32: mulberry32, SKILLS: Object.keys(SKILLS) };
});
