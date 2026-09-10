#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
أوراقنا — مولّد الصفحات الثابتة.
يقرأ content/*.json ويكتب صفحات HTML، ثم يوحّد التذييل في كل صفحات الموقع.
لا اعتماديات: مكتبة بايثون القياسية فقط.

    python3 build.py
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://awraqna.com"

def rd(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()

def wr(p, s):
    full = os.path.join(ROOT, p)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    old = rd(p) if os.path.exists(full) else None
    if old == s:
        return False
    with open(full, "w", encoding="utf-8") as f:
        f.write(s)
    return True

# ── كتلة الملكية: تُقتطع من صفحة قائمة بدل تكرارها هنا ──────────────
_src = rd("math/index.html")
GUARDIAN = re.search(r"<!-- GUARDIAN:BEGIN -->.*?<!-- GUARDIAN:END -->", _src, re.S).group(0)

# ── التذييل الموحّد ─────────────────────────────────────────────────
FOOTER = """<footer class="site-footer">
  <div class="wrap">
    <nav class="foot-nav">
      <a href="/"><span data-ar>الرئيسية</span><span data-en>Home</span></a>
      <a href="/about/"><span data-ar>من نحن</span><span data-en>About</span></a>
      <a href="/privacy/"><span data-ar>الخصوصية</span><span data-en>Privacy</span></a>
      <a href="/terms/"><span data-ar>شروط الاستخدام</span><span data-en>Terms</span></a>
      <a href="/contact/"><span data-ar>تواصل معنا</span><span data-en>Contact</span></a>
    </nav>
    <p class="foot-note">
      <span data-ar>أوراقنا · يعمل كلياً في متصفحك — لا يُرفع شيء إلى أي خادم.</span>
      <span data-en>Awraqna · Runs entirely in your browser — nothing is uploaded.</span>
    </p>
    <p class="foot-copy">
      <span data-ar>© ٢٠٢٦ الفنان الطيب عامر</span>
      <span data-en>© 2026 Artist Altayeb Amer</span>
    </p>
  </div>
</footer>"""

HEADER = """<header class="site-header">
  <div class="wrap nav">
    <a class="brand" href="/"><span class="logo">أ</span>
      <span data-ar>أوراق<b>نا</b></span><span data-en>Awraq<b>na</b></span></a>
    <div class="nav-actions">
      <a class="btn" href="/"><span data-ar>كل المجالات</span><span data-en>All areas</span></a>
      <button class="btn btn-lang" id="langBtn" type="button">EN</button>
    </div>
  </div>
</header>"""

def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")

def page_html(p):
    url = SITE + "/" + p["slug"] + "/"
    schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": p["h1"],
        "description": p["desc"],
        "url": url,
        "inLanguage": "ar",
        "isPartOf": {"@type": "WebSite", "name": "أوراقنا", "url": SITE + "/"},
        "publisher": {"@type": "Person", "name": "Artist Altayeb Amer",
                      "alternateName": "الفنان الطيب عامر"},
    }
    return """<!DOCTYPE html>
<html lang="ar" dir="rtl" data-creator="Artist Altayeb Amer" data-creator-ar="الفنان الطيب عامر" data-source="https://awraqna.com">
<head>
<meta charset="utf-8">
{guardian}

<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="article">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}/og.png">
<meta property="og:locale" content="ar_AR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{site}/og.png">
<script type="application/ld+json">{schema}</script>
<link rel="stylesheet" href="/assets/brand.css">
<link rel="stylesheet" href="/assets/page.css">
</head>
<body>

{header}

<main class="wrap">
  <div class="hero">
    <h1>{h1}</h1>
  </div>
  <article class="prose">
{body}
  </article>
</main>

{footer}

<script src="/assets/lang.js"></script>
</body>
</html>
""".format(
        guardian=GUARDIAN, title=esc(p["title"]), desc=esc(p["desc"]), url=url,
        site=SITE, h1=esc(p["h1"]), header=HEADER, footer=FOOTER,
        schema=json.dumps(schema, ensure_ascii=False, separators=(",", ":")),
        body="\n".join("    " + line for line in p["body"]))

# صفحات مستبعدة من الفهرسة: مؤجّلة (noindex) أو ليست وجهة بحث
NOINDEX = {"henna", "404.html"}

def sitemap(slugs):
    today = __import__("datetime").date.today().isoformat()
    urls = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in (".git", "content", "assets", ".well-known")]
        if "index.html" not in filenames:
            continue
        rel = os.path.relpath(dirpath, ROOT)
        seg = "" if rel == "." else rel.replace(os.sep, "/") + "/"
        if seg.strip("/") in NOINDEX:
            continue
        if not seg:            prio = "1.0"   # الرئيسية
        elif seg.strip("/") in slugs: prio = "0.4"   # صفحات الثقة
        else:                  prio = "0.9"   # مولّدات الأوراق
        urls.append((SITE + "/" + seg, prio))
    urls.sort(key=lambda u: (-float(u[1]), u[0]))
    body = "\n".join(
        "  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n"
        "    <changefreq>monthly</changefreq>\n    <priority>%s</priority>\n  </url>"
        % (u, today, p) for u, p in urls)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + body + "\n</urlset>\n")

FOOT_RE = re.compile(r'<footer class="site-footer">.*?</footer>', re.S)

def main():
    written = []

    # ١) صفحات المحتوى
    data = json.load(open(os.path.join(ROOT, "content/pages.json"), encoding="utf-8"))
    slugs = []
    for p in data["pages"]:
        slugs.append(p["slug"])
        path = p["slug"] + "/index.html"
        if wr(path, page_html(p)):
            written.append(path)

    # ٢) توحيد التذييل في كل صفحات الموقع
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in (".git", "content")]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(dirpath, fn), ROOT)
            if rel.split(os.sep)[0] in slugs:
                continue                      # مولَّدة أصلاً بالتذييل الصحيح
            html = rd(rel)
            if not FOOT_RE.search(html):
                print("  ! لا تذييل في " + rel, file=sys.stderr)
                continue
            new = FOOT_RE.sub(lambda m: FOOTER, html, count=1)
            if wr(rel, new):
                written.append(rel)

    # ٣) خريطة الموقع — تُبنى من الصفحات الموجودة فعلاً، لا من قائمة يدوية
    if wr("sitemap.xml", sitemap(slugs)):
        written.append("sitemap.xml")

    for w in sorted(written):
        print("كُتب: " + w)
    print("\nالمجموع: %d ملف" % len(written))

if __name__ == "__main__":
    main()
