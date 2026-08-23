/* ============================================================
   🛡️  ALTAYEB GUARDIAN — PORTABLE EDITION v4.0
   © Artist Altayeb Amer / الفنان الطيب عامر
   Ownership · Integrity · Provenance — drop-in for any web project

   نسخة محمولة: لا تعتمد على مشروع بعينه. كل شيء يأتي من الإعدادات.
   ─────────────────────────────────────────────────────────────
   LAYER 1 : Identity Anchor        — مرساة الهوية (مجمّدة)
   LAYER 2 : Integrity Verification — تحقّق من عدم العبث
   LAYER 3 : Domain Guard           — حارس النطاق
   LAYER 4 : Visible Signature      — توقيع مرئي في كل صفحة
   LAYER 5 : Output Provenance      — بصمة داخل الملفات المُصدَّرة ★
   LAYER 6 : Structured Authorship  — بيانات مؤلِّف تقرأها محرّكات البحث
   ─────────────────────────────────────────────────────────────
   الاستخدام الأدنى (سطر واحد):
     <script src="guardian.js" data-project="My App" data-site="https://x.com"></script>
   أو:
     <script>window.GUARDIAN_CONFIG = { project:{name:"My App"} };</script>
     <script src="guardian.js"></script>
   ============================================================ */
(function (global, factory) {
  "use strict";
  const G = factory(global);
  global.GUARDIAN = G;
  if (typeof module !== "undefined" && module.exports) module.exports = G;
  if (G.config.autoInit !== false) G.init();
})(typeof window !== "undefined" ? window : globalThis, function (global) {
  "use strict";

  const doc = global.document || null;
  const VERSION = "4.0";

  /* ── إعدادات افتراضية — تُدهس بالكامل من GUARDIAN_CONFIG ── */
  const DEFAULTS = {
    creator: {
      name_en   : "Artist Altayeb Amer",
      name_ar   : "الفنان الطيب عامر",
      signature : "© Artist Altayeb Amer",
      url       : "",
      contact   : ""
    },
    project: {
      name    : "",
      name_ar : "",
      site    : "",
      version : "1.0.0",
      year    : new Date().getFullYear(),
      license : "All rights reserved"
    },
    domains: [],
    layers: {
      identity: true, integrity: true, domainGuard: true,
      visibleSignature: true, outputProvenance: true, structuredData: true
    },
    signatureUI: {
      selectors : ["[data-guardian-signature]", ".site-footer .foot p", "footer .foot p", "footer"],
      mode      : "append",
      color     : "#6b7488",
      text_ar   : "صُنع بعناية — {name_ar}",
      text_en   : "Crafted by {name_en}"
    },
    structuredData: {
      type: "WebApplication", category: "", price: "0",
      currency: "USD", languages: ["ar", "en"]
    },
    provenance: {
      claimUserContent: false,
      comment: "Image rights remain with the image owner."
    },
    silent   : false,
    autoInit : true
  };

  /* ── دمج عميق للإعدادات ─────────────────────────────────── */
  function merge(base, over) {
    if (!over || typeof over !== "object") return base;
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    for (const k of Object.keys(over)) {
      const v = over[k];
      if (v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object")
        out[k] = merge(base[k], v);
      else if (v !== undefined && v !== null) out[k] = v;
    }
    return out;
  }

  /* ── التقاط الإعدادات من وسم <script data-*> ────────────── */
  function fromScriptTag() {
    if (!doc || !doc.currentScript) return {};
    const d = doc.currentScript.dataset, cfg = {};
    const set = (path, val) => {
      if (val === undefined) return;
      const keys = path.split("."); let o = cfg;
      for (let i = 0; i < keys.length - 1; i++) o = (o[keys[i]] = o[keys[i]] || {});
      o[keys[keys.length - 1]] = val;
    };
    set("project.name",     d.project);
    set("project.name_ar",  d.projectAr);
    set("project.site",     d.site);
    set("project.version",  d.version);
    set("creator.name_en",  d.creator);
    set("creator.name_ar",  d.creatorAr);
    set("creator.url",      d.creatorUrl);
    set("provenance.comment", d.comment);
    if (d.domains) cfg.domains = d.domains.split(",").map(s => s.trim()).filter(Boolean);
    if (d.silent === "true") cfg.silent = true;
    if (d.autoInit === "false") cfg.autoInit = false;
    // إيقاف طبقات محدّدة: data-layers-off="domainGuard,visibleSignature"
    if (d.layersOff) {
      cfg.layers = {};
      d.layersOff.split(",").map(s => s.trim()).forEach(k => { if (k) cfg.layers[k] = false; });
    }
    return cfg;
  }

  /* ── يقبل snake_case (من guardian.config.json) و camelCase معاً ── */
  const ALIASES = {
    signature_ui: "signatureUI", structured_data: "structuredData",
    domain_guard: "domainGuard", visible_signature: "visibleSignature",
    output_provenance: "outputProvenance", claim_user_content: "claimUserContent",
    auto_init: "autoInit"
  };
  function normalize(o) {
    if (!o || typeof o !== "object" || Array.isArray(o)) return o;
    const out = {};
    for (const k of Object.keys(o)) {
      if (k.charAt(0) === "_") continue;                    // مفاتيح التعليق
      out[ALIASES[k] || k] = normalize(o[k]);
    }
    return out;
  }

  let config = merge(merge(DEFAULTS, normalize(global.GUARDIAN_CONFIG || {})), fromScriptTag());

  /* ── اشتقاق ذكي للقيم الناقصة ───────────────────────────── */
  function derive(c) {
    const loc = global.location || {};
    if (!c.project.site && loc.origin && !/^file:/.test(loc.origin)) c.project.site = loc.origin;
    if (!c.project.name) c.project.name = (loc.hostname || "this project");
    if (!c.creator.url) c.creator.url = c.project.site;
    if (!c.domains.length) {
      c.domains = ["localhost", "127.0.0.1"];
      try { if (c.project.site) c.domains.push(new URL(c.project.site).hostname); } catch (e) {}
    }
    return c;
  }
  config = derive(config);

  /* ══ LAYER 1: Identity Anchor — مجمّدة، لا تُعدَّل وقت التشغيل ══ */
  const IDENTITY = Object.freeze({
    founder_ar   : config.creator.name_ar,
    founder_en   : config.creator.name_en,
    signature    : config.creator.signature,
    project      : config.project.name,
    project_ar   : config.project.name_ar,
    site         : config.project.site,
    version      : config.project.version,
    year         : config.project.year,
    protected    : true,
    guardian_ver : VERSION
  });

  const S1 = "color:#d4af37;font-weight:bold;font-size:13px";
  const S2 = "color:#9aa4b8;font-size:11px";
  const log  = (...a) => { if (!config.silent) console.log(...a); };
  const warn = (...a) => { if (!config.silent) console.warn(...a); };

  /* ══ LAYER 2: Integrity Verification ═════════════════════ */
  function verify() {
    const i = IDENTITY, problems = [];
    if (!i.protected)                   problems.push("Identity tampered");
    if (!i.founder_en && !i.founder_ar) problems.push("Creator name removed");
    if (i.guardian_ver !== VERSION)     problems.push("Version mismatch");
    if (!i.site)                        problems.push("Source anchor removed");
    if (Object.isFrozen(IDENTITY) !== true) problems.push("Identity unfrozen");
    if (problems.length) {
      console.error("🛡️ ALTAYEB GUARDIAN — " + problems.join(" · ") +
                    " — " + (i.founder_en || "Artist Altayeb Amer"));
      return false;
    }
    return true;
  }

  function banner() {
    log("%c🛡️ ALTAYEB GUARDIAN v" + VERSION + " — ACTIVE\n" +
        "%cCreator : " + IDENTITY.founder_en + "\n" +
        (IDENTITY.founder_ar ? "المبتكر  : " + IDENTITY.founder_ar + "\n" : "") +
        "Project : " + IDENTITY.project + "\n" +
        (IDENTITY.site ? "Source  : " + IDENTITY.site : ""),
        S1, S2);
  }

  /* ══ LAYER 3: Domain Guard — تنبيه فقط، لا يُعطّل شيئاً ═══ */
  function domainGuard() {
    if (!global.location) return true;
    const h = global.location.hostname;
    if (!h) return true;                                   // file://
    const ok = h === "localhost" || h === "127.0.0.1" ||          // التطوير المحلي دائماً مسموح
               config.domains.some(d => h === d || h.endsWith("." + d)) ||
               /\.pages\.dev$|\.netlify\.app$|\.vercel\.app$|\.github\.io$|^192\.168\./.test(h);
    if (!ok) {
      warn("🛡️ ALTAYEB GUARDIAN: هذه نسخة من " + IDENTITY.project +
           (IDENTITY.site ? " — المصدر الأصلي " + IDENTITY.site : "") +
           " — " + IDENTITY.signature);
    }
    return ok;
  }

  /* ══ LAYER 4: Visible Signature ══════════════════════════ */
  function fill(tpl) {
    return String(tpl)
      .replace(/\{name_ar\}/g, IDENTITY.founder_ar)
      .replace(/\{name_en\}/g, IDENTITY.founder_en)
      .replace(/\{project\}/g, IDENTITY.project)
      .replace(/\{year\}/g,    IDENTITY.year)
      .replace(/\{site\}/g,    IDENTITY.site);
  }

  function signFooters() {
    if (!doc) return 0;
    let target = null;
    for (const sel of config.signatureUI.selectors) {
      const found = doc.querySelectorAll(sel);
      if (found.length) { target = found; break; }         // أول مُحدِّد يطابق يفوز
    }
    if (!target || !target.length) return 0;
    let n = 0;
    target.forEach(el => {
      if (el.dataset.guardian) return;
      el.dataset.guardian = "1";
      const s = doc.createElement("span");
      s.className = "guardian-sig";
      s.style.cssText = "display:block;margin-top:6px;font-size:12px;color:" +
                        config.signatureUI.color;
      const parts = [];
      if (config.signatureUI.text_ar) parts.push('<span data-ar>' + fill(config.signatureUI.text_ar) + '</span>');
      if (config.signatureUI.text_en) parts.push('<span data-en>' + fill(config.signatureUI.text_en) + '</span>');
      s.innerHTML = parts.join("");
      config.signatureUI.mode === "prepend" ? el.insertBefore(s, el.firstChild) : el.appendChild(s);
      n++;
    });
    return n;
  }

  /* ══ LAYER 6: Structured Authorship (JSON-LD) ════════════ */
  function structuredData() {
    if (!doc || doc.getElementById("guardian-jsonld")) return;
    const sd = config.structuredData;
    const person = { "@type": "Person", "name": IDENTITY.founder_en };
    if (IDENTITY.founder_ar) person.alternateName = IDENTITY.founder_ar;
    if (config.creator.url)  person.url = config.creator.url;

    const ld = {
      "@context": "https://schema.org",
      "@type": sd.type,
      "name": IDENTITY.project,
      "url": IDENTITY.site,
      "author": person,
      "creator": person,
      "copyrightHolder": person,
      "copyrightYear": IDENTITY.year,
      "inLanguage": sd.languages
    };
    if (sd.category) ld.applicationCategory = sd.category;
    if (sd.type === "WebApplication") {
      ld.operatingSystem = "Any (web browser)";
      if (sd.price !== undefined && sd.price !== null)
        ld.offers = { "@type": "Offer", "price": String(sd.price), "priceCurrency": sd.currency };
    }
    const el = doc.createElement("script");
    el.type = "application/ld+json";
    el.id = "guardian-jsonld";
    el.textContent = JSON.stringify(ld);
    doc.head.appendChild(el);
  }

  /* ══ LAYER 5: Output Provenance ═══════════════════════════
     يدفن بيانات المُنشئ والمصدر داخل الملف نفسه.
     PNG  → قطع tEXt / iTXt   |   JPEG → مقطع COM
     تبقى البصمة مع الملف أينما ذهب، ويقرأها Photoshop / exiftool.
     ⚠️ لا ننسب محتوى المستخدم لأحد — ننسب الأداة فقط.
     ════════════════════════════════════════════════════════ */
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  const u32 = v => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];

  function textChunk(keyword, text) {
    const enc = new TextEncoder();
    const isLatin1 = /^[\x20-\x7E]*$/.test(text);           // tEXt يقبل Latin-1 فقط
    let typeStr, data;
    if (isLatin1) {
      typeStr = "tEXt";
      const k = enc.encode(keyword), t = enc.encode(text);
      data = new Uint8Array(k.length + 1 + t.length);
      data.set(k, 0); data[k.length] = 0; data.set(t, k.length + 1);
    } else {
      typeStr = "iTXt";                                     // UTF-8 للنص الدولي
      const k = enc.encode(keyword), t = enc.encode(text);
      data = new Uint8Array(k.length + 5 + t.length);
      let o = 0;
      data.set(k, o); o += k.length;
      data[o++] = 0;   // نهاية الكلمة المفتاحية
      data[o++] = 0;   // علم الضغط
      data[o++] = 0;   // طريقة الضغط
      data[o++] = 0;   // وسم لغة فارغ
      data[o++] = 0;   // كلمة مفتاحية مترجمة فارغة
      data.set(t, o);
    }
    const type = enc.encode(typeStr);
    const body = new Uint8Array(type.length + data.length);
    body.set(type, 0); body.set(data, type.length);
    const out = new Uint8Array(4 + body.length + 4);
    out.set(u32(data.length), 0);
    out.set(body, 4);
    out.set(u32(crc32(body)), 4 + body.length);
    return out;
  }

  /** الحقول المدفونة — نسبة الأداة، لا نسبة محتوى المستخدم */
  function provenanceFields(meta) {
    const now = new Date().toISOString().slice(0, 10);
    const author = [IDENTITY.founder_en, IDENTITY.founder_ar].filter(Boolean).join(" / ");
    const f = [
      ["Software",      IDENTITY.project + (meta.tool ? " — " + meta.tool : "") +
                        " (ALTAYEB GUARDIAN v" + VERSION + ")"],
      ["Source",        IDENTITY.site],
      ["Tool Author",   author],
      ["Creation Time", now]
    ];
    const c = meta.comment || config.provenance.comment;
    if (c) f.push(["Comment", c]);
    // Copyright يُضاف فقط لما ينشئه المشروع نفسه — لا لملفات المستخدم
    if (meta.generated || config.provenance.claimUserContent)
      f.push(["Copyright", "Generated with " + IDENTITY.project +
                           (IDENTITY.site ? " · " + IDENTITY.site : "")]);
    return f.filter(([, v]) => v);
  }

  /** يضيف بيانات الملكية إلى بايتات PNG ويعيد Uint8Array جديدة */
  function stampPngBytes(buf, meta) {
    const png = new Uint8Array(buf);
    const SIG = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < 8; i++) if (png[i] !== SIG[i]) return png;   // ليست PNG
    const insertAt = 33;   // 8 توقيع + قطعة IHDR كاملة (4+4+13+4)
    const chunks = provenanceFields(meta || {}).map(([k, v]) => textChunk(k, v));
    const total = chunks.reduce((s, c) => s + c.length, 0);
    const out = new Uint8Array(png.length + total);
    out.set(png.subarray(0, insertAt), 0);
    let o = insertAt;
    for (const c of chunks) { out.set(c, o); o += c.length; }
    out.set(png.subarray(insertAt), o);
    return out;
  }

  /** يضيف مقطع تعليق COM إلى JPEG بعد SOI مباشرة */
  function stampJpegBytes(buf, meta) {
    const jpg = new Uint8Array(buf);
    if (jpg[0] !== 0xFF || jpg[1] !== 0xD8) return jpg;              // ليست JPEG
    const text = provenanceFields(meta || {}).map(([k, v]) => k + ": " + v).join("\n");
    const body = new TextEncoder().encode(text);
    if (body.length + 2 > 0xFFFF) return jpg;                        // أطول من حدّ المقطع
    const seg = new Uint8Array(4 + body.length);
    seg[0] = 0xFF; seg[1] = 0xFE;                                    // علامة COM
    seg[2] = ((body.length + 2) >> 8) & 255; seg[3] = (body.length + 2) & 255;
    seg.set(body, 4);
    const out = new Uint8Array(jpg.length + seg.length);
    out.set(jpg.subarray(0, 2), 0);
    out.set(seg, 2);
    out.set(jpg.subarray(2), 2 + seg.length);
    return out;
  }

  /** يوجّه حسب النوع — أي نوع آخر يمرّ كما هو دون مساس */
  function stampBytes(buf, type, meta) {
    if (type === "image/png")  return stampPngBytes(buf, meta);
    if (type === "image/jpeg" || type === "image/jpg") return stampJpegBytes(buf, meta);
    return new Uint8Array(buf);
  }

  /** يضيف البصمة إلى Blob جاهز — عند أي خطأ يُعيد الأصل سليماً */
  async function stampBlob(blob, toolName, generated) {
    try {
      if (!blob) return blob;
      const t = blob.type;
      if (t !== "image/png" && t !== "image/jpeg" && t !== "image/jpg") return blob;
      const buf = await blob.arrayBuffer();
      const meta = typeof toolName === "object" && toolName !== null
        ? toolName : { tool: toolName, generated: !!generated };
      return new Blob([stampBytes(buf, t, meta)], { type: t });
    } catch (e) { return blob; }
  }

  /** يحوّل canvas إلى Blob موقّع ببصمة المصدر */
  async function stampedBlob(canvas, toolName, generated, mime, quality) {
    const type = mime || "image/png";
    const blob = await new Promise(r => canvas.toBlob(r, type, quality));
    if (!blob) return null;
    return stampBlob(blob, toolName, generated);
  }
  const stampedPngBlob = (canvas, tool, gen) => stampedBlob(canvas, tool, gen, "image/png");

  /** تنزيل canvas موقّعاً — يستبدل toDataURL المباشر */
  async function downloadCanvas(canvas, filename, toolName, generated, mime, quality) {
    const blob = await stampedBlob(canvas, toolName, generated, mime, quality);
    if (!blob) return false;
    return downloadBlob(blob, filename);
  }

  /** تنزيل Blob بعد ختمه */
  async function downloadBlob(blob, filename, toolName, generated) {
    const stamped = await stampBlob(blob, toolName, generated);
    const url = URL.createObjectURL(stamped);
    const a = doc.createElement("a");
    a.href = url; a.download = filename;
    doc.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return true;
  }

  /** يقرأ البصمة من PNG أو JPEG (للتحقق) */
  async function readProvenance(blobOrBuffer) {
    const buf = blobOrBuffer instanceof Blob ? await blobOrBuffer.arrayBuffer() : blobOrBuffer;
    const b = new Uint8Array(buf), dec = new TextDecoder();
    const found = {};
    if (b[0] === 0x89 && b[1] === 0x50) {                    // PNG
      let o = 8;
      while (o + 8 <= b.length) {
        const len = (b[o] << 24 | b[o + 1] << 16 | b[o + 2] << 8 | b[o + 3]) >>> 0;
        const type = dec.decode(b.subarray(o + 4, o + 8));
        if (type === "IEND") break;
        if (type === "tEXt" || type === "iTXt") {
          const data = b.subarray(o + 8, o + 8 + len);
          const nul = data.indexOf(0);
          if (nul > -1) {
            const key = dec.decode(data.subarray(0, nul));
            const vStart = type === "iTXt" ? nul + 5 : nul + 1;   // تخطّي أعلام iTXt
            found[key] = dec.decode(data.subarray(vStart));
          }
        }
        o += 12 + len;
      }
    } else if (b[0] === 0xFF && b[1] === 0xD8) {             // JPEG
      let o = 2;
      while (o + 4 <= b.length && b[o] === 0xFF) {
        const marker = b[o + 1];
        if (marker === 0xD8 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) { o += 2; continue; }
        if (marker === 0xDA) break;                          // بداية المسح
        const len = (b[o + 2] << 8) | b[o + 3];
        if (marker === 0xFE) {
          dec.decode(b.subarray(o + 4, o + 2 + len)).split("\n").forEach(line => {
            const i = line.indexOf(": ");
            if (i > 0) found[line.slice(0, i)] = line.slice(i + 2);
          });
        }
        o += 2 + len;
      }
    }
    return found;
  }

  /* ── Bootstrap ──────────────────────────────────────────── */
  let initialized = false;
  function init() {
    if (initialized) return true;
    initialized = true;
    const L = config.layers;
    const ok = L.integrity !== false ? verify() : true;
    if (ok) banner();
    if (L.domainGuard !== false)     domainGuard();
    if (L.structuredData !== false)  structuredData();
    if (L.visibleSignature !== false && doc) {
      if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", signFooters);
      else signFooters();
    }
    return ok;
  }

  /** لإعادة الضبط قبل init (وحدات ES / SSR) */
  function configure(cfg) {
    if (initialized) { warn("🛡️ GUARDIAN: configure() بعد init — تجاهُل"); return GUARDIAN; }
    config = derive(merge(config, normalize(cfg)));
    return GUARDIAN;
  }

  /** فحص ذاتي سريع — يعيد حالة كل طبقة */
  function selfTest() {
    const r = {
      version: VERSION,
      identityFrozen: Object.isFrozen(IDENTITY),
      integrity: verify(),
      domainOk: config.layers.domainGuard === false ? null : domainGuard(),
      signaturesInjected: doc ? doc.querySelectorAll(".guardian-sig").length : 0,
      jsonLd: !!(doc && doc.getElementById("guardian-jsonld")),
      provenanceReady: typeof TextEncoder !== "undefined",
      claimsUserContent: !!config.provenance.claimUserContent
    };
    log("🛡️ GUARDIAN self-test", r);
    return r;
  }

  const GUARDIAN = {
    IDENTITY, version: VERSION,
    verify, banner, domainGuard, signFooters, structuredData,
    stampPngBytes, stampJpegBytes, stampBytes,
    stampBlob, stampedBlob, stampedPngBlob,
    downloadCanvas, downloadBlob, readProvenance,
    init, configure, selfTest
  };
  Object.defineProperty(GUARDIAN, "config", { get: () => config, enumerable: true });
  return GUARDIAN;
});
