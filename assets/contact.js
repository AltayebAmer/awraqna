/*
  ════════════════════════════════════════════════════════════
   أوراقنا — نموذج التواصل (نفس محرّك 007.gallery)
   Creator : Artist Altayeb Amer
   المبتكر  : الفنان الطيب عامر
   © 2026 Artist Altayeb Amer — All rights reserved.
  ════════════════════════════════════════════════════════════

  البطاقة تنسدل فتكشف النموذج في نفس الصفحة — لا يُفتح تطبيق بريد
  ولا يُغادر الزائر الموقع. العنوان المعروض hello@007.gallery فقط؛
  عنوان الاستلام الحقيقي لا يوجد في أي ملف يُنزّله المتصفح.
*/
(function (global) {
  "use strict";

  var ENDPOINT = "https://contact.007.gallery/send";
  var doc = global.document;
  var loadedAt = Date.now();

  var T = {
    sending:   ["جارٍ الإرسال…", "Sending…"],
    ok:        ["✓ وصلت رسالتك. نقرأ كل رسالة ونردّ على بريدك.",
                "✓ Your message arrived. We read every one and reply to your email."],
    email:     ["تحقّق من بريدك الإلكتروني — يبدو غير صحيح.",
                "Please check your email address — it looks invalid."],
    subject:   ["اكتب موضوعاً قصيراً.", "Please add a short subject."],
    message_short: ["الرسالة قصيرة جداً — اكتب عشرة أحرف على الأقل.",
                    "That message is too short — please write at least ten characters."],
    message_long:  ["الرسالة طويلة جداً. اختصرها قليلاً.",
                    "That message is too long. Please shorten it a little."],
    offline:   ["تعذّر الاتصال. تحقّق من الإنترنت وأعد المحاولة.",
                "Could not connect. Check your connection and try again."],
    failed:    ["تعذّر الإرسال الآن. راسلنا على hello@007.gallery مباشرةً.",
                "Sending failed right now. Please email hello@007.gallery directly."]
  };

  /* تُطابق قواعد الـWorker. الخادم يبقى الحكم، وهذا يوفّر على الزائر
     رحلة شبكة كاملة ليعرف أن بريده فيه خطأ مطبعي. */
  var EMAIL_RE = /^[^\s@,;:<>()[\]\\]+@[^\s@.,;:<>()[\]\\]+\.[A-Za-z]{2,}$/;
  var LIMITS = { email: 254, subject: 200, message: 5000, min_message: 10 };

  function localError(d) {
    if (!EMAIL_RE.test(d.email) || d.email.length > LIMITS.email) return "email";
    if (!d.subject || d.subject.length > LIMITS.subject) return "subject";
    if (d.message.length < LIMITS.min_message) return "message_short";
    if (d.message.length > LIMITS.message) return "message_long";
    return null;
  }

  function say(key) {
    var en = doc.documentElement.getAttribute("lang") === "en";
    return (T[key] || T.failed)[en ? 1 : 0];
  }

  function ready() {
    var card  = doc.getElementById("mailCard");
    var panel = doc.getElementById("mailPanel");
    var form  = doc.getElementById("mailForm");
    if (!card || !panel || !form) return;

    var note = doc.getElementById("mailNote");
    var btn  = doc.getElementById("mailSend");

    /* انسدال البطاقة */
    card.addEventListener("click", function () {
      var open = panel.hidden;
      panel.hidden = !open;
      card.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        var f = doc.getElementById("mailEmail");
        if (f) setTimeout(function () { f.focus(); }, 260);
      }
    });

    function show(msg, kind) {
      note.textContent = msg;
      note.dataset.kind = kind;
      note.hidden = false;
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();

      var payload = {
        email:   doc.getElementById("mailEmail").value.trim(),
        subject: doc.getElementById("mailSubject").value.trim(),
        message: doc.getElementById("mailMessage").value.trim(),
        _trap:   doc.getElementById("mailTrap").value,
        elapsed: Date.now() - loadedAt
      };

      var bad = localError(payload);
      if (bad) {
        show(say(bad), "err");
        var focusMap = { email: "mailEmail", subject: "mailSubject",
                         message_short: "mailMessage", message_long: "mailMessage" };
        var el = doc.getElementById(focusMap[bad]);
        if (el) el.focus();
        return;
      }

      btn.disabled = true;
      show(say("sending"), "wait");

      global.fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json().catch(function () { return { ok: false, error: "failed" }; });
        })
        .then(function (d) {
          if (d && d.ok) {
            form.reset();
            show(say("ok"), "ok");
            btn.disabled = true;          /* لا إرسال مكرر بنقرة عابرة */
            setTimeout(function () { btn.disabled = false; }, 4000);
            return;
          }
          show(say(d && d.error ? d.error : "failed"), "err");
          btn.disabled = false;
        })
        .catch(function () {
          show(say("offline"), "err");
          btn.disabled = false;
        });
    });
  }

  if (doc.readyState === "loading")
    doc.addEventListener("DOMContentLoaded", ready);
  else ready();
})(typeof window !== "undefined" ? window : globalThis);
