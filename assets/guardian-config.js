/* GUARDIAN:BEGIN
   أوراقنا | Awraqna — © 2026 Artist Altayeb Amer / الفنان الطيب عامر
   Source: https://awraqna.com — All rights reserved
   Protected by ALTAYEB GUARDIAN v4.0
GUARDIAN:END */
/* ════════════════════════════════════════════════════════════
   أوراقنا — إعدادات الحارس **وقت التشغيل**.
   ملف `guardian.config.json` يقرأه الحاقن وحده ولا يصل إلى المتصفح،
   فبدونه يسقط الحارس إلى الافتراضيات (اسم المشروع = اسم المضيف،
   وطبقة بصمة المخرجات تبقى مفعّلة رغم إطفائها في JSON).
   يُحمَّل قبل guardian.js — كلاهما defer فيبقى الترتيب.
   ════════════════════════════════════════════════════════════ */
window.GUARDIAN_CONFIG = {
  creator: {
    name_en: "Artist Altayeb Amer",
    name_ar: "الفنان الطيب عامر",
    url: "https://007.gallery",
    contact: "artist.and.love@gmail.com"
  },
  project: {
    name: "أوراقنا | Awraqna",
    name_ar: "أوراقنا",
    site: "https://awraqna.com",
    version: "5.0.0",
    year: 2026
  },
  domains: ["awraqna.com", "www.awraqna.com"],
  /* المشروع لا يُنزّل ملفاً واحداً — مخرَجه ورق مطبوع ⇒ الطبقة الخامسة بلا معنى. */
  layers: { outputProvenance: false },
  structuredData: {
    type: "WebApplication",
    category: "EducationalApplication",
    price: "0",
    currency: "USD",
    languages: ["ar", "en"]
  },
  provenance: {
    claimUserContent: false,
    comment: "Worksheets are generated in the browser — no upload, no server."
  }
};
