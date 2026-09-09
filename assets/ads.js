/* GUARDIAN:BEGIN
   🛡️ أوراقنا | Awraqna — © 2026 Artist Altayeb Amer
   الفنان الطيب عامر  ·  https://awraqna.com
   Protected by ALTAYEB GUARDIAN v4.0
   GUARDIAN:END */
/* ════════════════════════════════════════════════════════════
   007.gallery — نظام «رد المعروف» الإعلاني  v1.0
   © 2026 Artist Altayeb Amer / الفنان الطيب عامر
   Source: https://007.gallery — ALTAYEB GUARDIAN v4.0
   ────────────────────────────────────────────────────────────
   • إعلانات بيتية لمشاريع المالك تعمل من اليوم (بلا انتظار موافقات)
   • مساحات كبيرة: billboard 970×250 · rectangle 336×280 · leaderboard
   • إعلان «وقت الانتظار» يظهر أثناء المعالجة الفعلية فقط
   • جاهز لاستبدال أي مساحة بكود AdSense لاحقاً (data-adsense)
   ════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  /* ── إعلاناتك البيتية — عدّل هنا فقط ─────────────────────── */
  const HOUSE = [
    { id:"gallery", url:"https://007.gallery", badge:"٠٠٧ جاليري",
      title_ar:"٠٠٧ جاليري — أدوات صور مجانية", title_en:"007.gallery — Free Image Tools",
      body_ar:"إزالة خلفية، تكبير، ضغط، QR — كلها داخل متصفحك.",
      body_en:"Background removal, upscaling, compression, QR — all in your browser.",
      cta_ar:"جرّب الأدوات", cta_en:"Try the tools",
      c1:"#14101f", c2:"#2e2350", accent:"#d4af37" },
    { id:"art", url:"https://altayebamer.com", badge:"الطيب عامر",
      title_ar:"معرض الفنان الطيب عامر", title_en:"Altayeb Amer — Art Gallery",
      body_ar:"سبعة تخصصات فنية: الخط، البورتريه، الخيول، التصميم والمزيد.",
      body_en:"Seven artistic disciplines: calligraphy, portrait, horses, design and more.",
      cta_ar:"زُر المعرض", cta_en:"Visit the gallery",
      c1:"#2a1a10", c2:"#7a4620", accent:"#ffb27a" },
    { id:"mawlidi", url:"https://mawlidi.com/arb/", badge:"مَوْلِدي",
      title_ar:"مَوْلِدي — ميلادك في التقويم الهجري", title_en:"Mawlidi — Your Birthday in the Hijri Calendar",
      body_ar:"احسب عمرك القمري، وحوّل التواريخ، وشاهد قمر ليلة ميلادك.",
      body_en:"Your lunar age, date conversion, and the Moon of the night you were born.",
      cta_ar:"احسب الآن", cta_en:"Calculate now",
      c1:"#07071A", c2:"#2b2352", accent:"#e8c97a" },
    { id:"kashf", url:"#", badge:"كشف",
      title_ar:"كشف — تحليل ذكي للبيانات", title_en:"Kashf — Smart Data Insight",
      body_ar:"حوّل بياناتك إلى قرارات واضحة بالذكاء الاصطناعي.",
      body_en:"Turn your data into clear decisions with AI.",
      cta_ar:"جرّب مجاناً", cta_en:"Try free",
      c1:"#0d2a24", c2:"#12503f", accent:"#4fe0b0" },
    { id:"quran", url:"https://qurankarem.org", badge:"القرآن الكريم",
      title_ar:"مصحف رقمي بتجربة صافية", title_en:"A Clean Digital Quran",
      body_ar:"قراءة مريحة بلا إعلانات ولا تشتيت.",
      body_en:"Comfortable reading — no ads, no distractions.",
      cta_ar:"افتح المصحف", cta_en:"Open now",
      c1:"#2a2410", c2:"#5c4a15", accent:"#f0d264" },
    { id:"seven", url:"#", badge:"The Seven Council",
      title_ar:"منصّة ذكاء المشاريع", title_en:"Project Intelligence Platform",
      body_ar:"سبعة عقول تحلّل مشروعك من كل زاوية.",
      body_en:"Seven minds analyzing your project from every angle.",
      cta_ar:"تعرّف أكثر", cta_en:"Learn more",
      c1:"#101a2e", c2:"#1e3a63", accent:"#79b8ff" },
  ];

  const T = () => document.documentElement.getAttribute("lang") === "en";

  /* لا تعرض إعلاناً رابطه "#": ثلاثة من مشاريع المالك لم تُطلق بعد،
     وعرضها يفتح تبويباً فارغاً — إعلان معطوب أسوأ من مساحة أقل.
     حين يُطلق أيٌّ منها يكفي وضع رابطه أعلاه فيعود تلقائياً. */
  const LIVE = HOUSE.filter(a => a.url && a.url !== "#");
  const POOL = LIVE.length ? LIVE : HOUSE;
  let seed = Math.floor(Math.random() * POOL.length);
  function pick() { const a = POOL[seed % POOL.length]; seed++; return a; }

  /* ── الأنماط ─────────────────────────────────────────────── */
  const CSS = `
  .ad-slot{position:relative;border-radius:16px;overflow:hidden;margin:26px auto;
    border:1px solid var(--line,#232a3a);background:var(--bg-2,#12141c)}
  .ad-slot .ad-tag{position:absolute;top:8px;inset-inline-start:10px;z-index:3;
    font-size:10px;font-weight:700;letter-spacing:.4px;color:#ffffff9c;
    background:#00000059;padding:3px 8px;border-radius:999px;backdrop-filter:blur(4px)}
  .ad-card{display:flex;align-items:center;gap:20px;padding:22px 24px;height:100%;
    text-decoration:none;transition:.22s;position:relative}
  .ad-card:hover{filter:brightness(1.09)}
  .ad-card .ad-mark{flex:none;width:56px;height:56px;border-radius:14px;display:grid;place-items:center;
    font-weight:900;font-size:14px;background:currentColor;box-shadow:0 6px 20px #0006}
  /* الحرف في عنصر مستقل: ضبط color على المربّع نفسه يجعل currentColor
     مساوياً للحرف فيصير الشعار خلفيةً بلا حرف مرئي. */
  .ad-card .ad-mark i{color:#0a0b0f;font-style:normal}
  .ad-card .ad-body{min-width:0;flex:1}
  .ad-card .ad-badge{font-size:11px;font-weight:800;opacity:.9;letter-spacing:.3px}
  .ad-card h4{font-size:19px;font-weight:900;color:#fff;margin:3px 0 5px;line-height:1.3}
  .ad-card p{font-size:13.5px;color:#ffffffc4;margin:0;line-height:1.6}
  .ad-card .ad-cta{flex:none;font-size:13.5px;font-weight:800;color:#0a0b0f;
    background:currentColor;padding:10px 18px;border-radius:11px;white-space:nowrap}
  .ad-card .ad-cta span{color:#0a0b0f}

  /* المقاسات */
  .ad-billboard{min-height:250px}
  .ad-billboard .ad-card{flex-direction:column;text-align:center;justify-content:center;gap:14px}
  .ad-billboard h4{font-size:26px}
  .ad-billboard p{font-size:15px;max-width:560px}
  .ad-rectangle{min-height:280px;max-width:360px}
  .ad-rectangle .ad-card{flex-direction:column;text-align:center;justify-content:center;gap:12px}
  .ad-rectangle h4{font-size:20px}
  .ad-leaderboard{min-height:110px}
  @media(max-width:700px){
    .ad-card{flex-direction:column;text-align:center;gap:13px;padding:22px 18px}
    .ad-billboard h4{font-size:21px}
    .ad-leaderboard{min-height:auto}
  }
  /* إعلان وقت الانتظار */
  .ad-wait{display:none;margin:18px auto 0}
  .ad-wait.show{display:block;animation:adIn .35s ease}
  @keyframes adIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .ad-wait-note{text-align:center;font-size:12px;color:var(--txt-mute,#6b7488);margin-top:8px}
  `;

  function injectCss() {
    if (document.getElementById("ads-css")) return;
    const st = document.createElement("style");
    st.id = "ads-css"; st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ── بناء إعلان ──────────────────────────────────────────── */
  function render(slot, size) {
    const a = pick();
    const en = T();
    slot.className = "ad-slot ad-" + size;
    slot.style.background = `linear-gradient(135deg, ${a.c1}, ${a.c2})`;
    slot.innerHTML =
      `<span class="ad-tag">${en ? "Sponsored" : "إعلان"}</span>` +
      `<a class="ad-card" href="${a.url}" target="_blank" rel="noopener sponsored"
          data-ad="${a.id}" style="color:${a.accent}">
         <span class="ad-mark"><i>${a.badge.slice(0, 2)}</i></span>
         <span class="ad-body">
           <span class="ad-badge">${a.badge}</span>
           <h4>${en ? a.title_en : a.title_ar}</h4>
           <p>${en ? a.body_en : a.body_ar}</p>
         </span>
         <span class="ad-cta"><span>${en ? a.cta_en : a.cta_ar} ←</span></span>
       </a>`;
  }

  /* ── تهيئة كل المساحات في الصفحة ─────────────────────────── */
  function mountAll() {
    injectCss();
    // حوّل المساحات النائبة القديمة (.ad) إلى بانر عريض
    document.querySelectorAll(".ad").forEach(el => {
      if (el.dataset.adReady) return;
      el.dataset.adReady = "1";
      el.removeAttribute("style");
      render(el, "leaderboard");
    });
    // المساحات الجديدة المعلَّمة
    document.querySelectorAll("[data-ad-slot]").forEach(el => {
      if (el.dataset.adReady) return;
      el.dataset.adReady = "1";
      render(el, el.getAttribute("data-ad-slot") || "leaderboard");
    });
  }

  /* ── إعلان وقت الانتظار ──────────────────────────────────── */
  // يُستدعى عند بدء معالجة فعلية طويلة، ويُخفى عند انتهائها.
  let waitEl = null;
  function showWaiting(anchorSelector) {
    injectCss();
    if (!waitEl) {
      const host = document.querySelector(anchorSelector || ".bar") || document.querySelector("main");
      if (!host) return;
      waitEl = document.createElement("div");
      waitEl.className = "ad-wait";
      const slot = document.createElement("div");
      slot.setAttribute("data-ad-slot", "billboard");
      waitEl.appendChild(slot);
      const note = document.createElement("p");
      note.className = "ad-wait-note";
      note.innerHTML = T()
        ? "Your file is being processed on your device. Meanwhile — a look at our projects."
        : "يُعالَج ملفك على جهازك الآن. وبينما تنتظر — نظرة على مشاريعنا.";
      waitEl.appendChild(note);
      host.parentNode.insertBefore(waitEl, host.nextSibling);
      render(slot, "billboard");
    }
    waitEl.classList.add("show");
  }
  function hideWaiting() { if (waitEl) waitEl.classList.remove("show"); }

  const ADS = { HOUSE, LIVE, mountAll, render, showWaiting, hideWaiting, version: "1.1" };
  global.ADS = ADS;

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mountAll);
  else mountAll();
})(typeof window !== "undefined" ? window : globalThis);
