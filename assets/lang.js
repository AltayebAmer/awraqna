/* GUARDIAN:BEGIN
   🛡️ أوراقنا | Awraqna — © 2026 Artist Altayeb Amer
   الفنان الطيب عامر  ·  https://awraqna.com
   Protected by ALTAYEB GUARDIAN v4.0
   GUARDIAN:END */
/* مبدّل اللغة وحده — لصفحات المحتوى التي لا تحتاج النواة. */
(function () {
  var b = document.getElementById("langBtn");
  if (!b) return;
  function set(l) {
    var h = document.documentElement;
    h.setAttribute("lang", l);
    h.setAttribute("dir", l === "en" ? "ltr" : "rtl");
    b.textContent = l === "en" ? "ع" : "EN";
    try { localStorage.setItem("awraqna_lang", l); } catch (e) {}
  }
  b.addEventListener("click", function () { set(h() === "en" ? "ar" : "en"); });
  function h() { return document.documentElement.getAttribute("lang"); }
  var s = null; try { s = localStorage.getItem("awraqna_lang"); } catch (e) {}
  if (s === "en") set("en");
})();
