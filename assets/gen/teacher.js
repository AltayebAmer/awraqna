/* ════════════════════════════════════════════════════════════
   أوراقنا — مولّد أوراق المعلّم (مسطر · شبكي · نقطي · رسم بياني)
   الورقة SVG بوحدات مليمترية ⇒ المسافة على الورق تساوي المطلوب
   بالضبط، لا تقريباً بالبكسل.
   ════════════════════════════════════════════════════════════ */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.TeacherGen = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* مساحة الطباعة داخل A4 بهوامش 12mm (انظر @page في sheet.css). */
  var W = 186, H = 273;

  var TITLES = {
    lined: { ar: "ورق مسطّر", en: "Lined paper" },
    grid:  { ar: "ورق شبكي",  en: "Grid paper" },
    dot:   { ar: "ورق نقطي",  en: "Dot paper" },
    graph: { ar: "ورق رسم بياني", en: "Graph paper" }
  };

  function line(x1, y1, x2, y2, w, c) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
           '" stroke="' + c + '" stroke-width="' + w + '"/>';
  }

  /* head: ترويسة الاسم والتاريخ تُرسم بـ HTML لا داخل SVG.
     السبب: نص عربي داخل <text> في SVG لا يُطبع بشكل موثوق (جُرّب وفشل).
     وجودها يقلّص ارتفاع الورقة بمقدار الترويسة فلا تفيض إلى صفحة ثانية. */
  function draw(type, mm, head, rtl) {
    var H = head ? 249 : 273;
    var top = 0;
    var g = [], x, y;
    var thin = "#c8c8c8", bold = "#9a9a9a", accent = "#8fb8d8";

    if (type === "lined") {
      /* خط الهامش يمين الورقة في العربية ويسارها في الإنجليزية —
         الهامش يقع حيث يبدأ السطر، لا حيث ينتهي. */
      var mx = rtl ? W - 18 : 18;
      g.push(line(mx, top, mx, H, 0.28, accent));
      for (y = top + mm; y <= H - 1; y += mm) g.push(line(0, y, W, y, 0.22, thin));
    } else if (type === "grid" || type === "graph") {
      var major = type === "graph" ? 5 : 0;   /* الرسم البياني: خط غامق كل ٥ خانات */
      var i = 0;
      for (x = 0; x <= W + 0.001; x += mm, i++)
        g.push(line(x, top, x, H, major && i % major === 0 ? 0.34 : 0.16, major && i % major === 0 ? bold : thin));
      i = 0;
      for (y = top; y <= H + 0.001; y += mm, i++)
        g.push(line(0, y, W, y, major && i % major === 0 ? 0.34 : 0.16, major && i % major === 0 ? bold : thin));
    } else { /* dot */
      for (x = 0; x <= W + 0.001; x += mm)
        for (y = top; y <= H + 0.001; y += mm)
          g.push('<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="0.32" fill="#a8a8a8"/>');
    }

    return '<svg class="paper" xmlns="http://www.w3.org/2000/svg" width="' + W + 'mm" height="' + H + 'mm" ' +
           'viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">' +
           '<rect width="' + W + '" height="' + H + '" fill="#fff"/>' + g.join("") + "</svg>";
  }

  function render(state) {
    var mm = Number(state.mm) || 7;
    var head = state.head !== false && state.head !== "off";
    var t = TITLES[state.type] || TITLES.lined;
    /* في node (الاختبارات) لا يوجد Core ⇒ العربية هي الافتراض. */
    var rtl = (typeof Core === "undefined") ? true : !Core.EN();
    return {
      head: head,                      /* الترويسة اختيارية — الورقة نفسها هي المنتج */
      title: t,
      sub: { ar: mm + " مم", en: mm + " mm" },
      sheet: draw(state.type, mm, head, rtl),
      answers: ""
    };
  }

  return { render: render, draw: draw, TITLES: TITLES, AREA: { W: W, H: H } };
});
