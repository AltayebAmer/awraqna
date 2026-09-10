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
      <a href="/worksheets/"><span data-ar>أوراق جاهزة</span><span data-en>Worksheets</span></a>
      <a href="/articles/"><span data-ar>مقالات</span><span data-en>Articles</span></a>
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
        if not seg:                          prio = "1.0"   # الرئيسية
        elif seg.strip("/") in slugs:        prio = "0.4"   # صفحات الثقة
        elif seg in ("worksheets/", "articles/"): prio = "0.9"  # الفهارس
        elif seg.startswith("worksheets/"):  prio = "0.8"   # صفحة ورقة بعينها
        elif seg.startswith("articles/"):    prio = "0.7"   # مقال
        else:                                prio = "0.9"   # مولّدات الأوراق
        urls.append((SITE + "/" + seg, prio))
    urls.sort(key=lambda u: (-float(u[1]), u[0]))
    body = "\n".join(
        "  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n"
        "    <changefreq>monthly</changefreq>\n    <priority>%s</priority>\n  </url>"
        % (u, today, p) for u, p in urls)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + body + "\n</urlset>\n")


def ws_html(w, cats):
    cat = cats[w["cat"]]
    url = SITE + "/worksheets/" + w["cat"] + "/" + w["slug"] + "/"
    tool = cat["tool"] + "?" + w["params"]
    img = "/assets/previews/" + w["slug"] + ".png"
    schema = {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        "name": w["h1"],
        "description": w["desc"],
        "url": url,
        "learningResourceType": "worksheet",
        "educationalLevel": w["level"],
        "educationalUse": ["assignment", "practice"],
        "inLanguage": "ar",
        "isAccessibleForFree": True,
        "typicalAgeRange": w.get("age", "5-14"),
        "image": SITE + img,
        "license": SITE + "/terms/",
        "author": {"@type": "Person", "name": "Artist Altayeb Amer",
                   "alternateName": "الفنان الطيب عامر"},
        "publisher": {"@type": "Organization", "name": "أوراقنا", "url": SITE + "/"},
        "isPartOf": {"@type": "WebSite", "name": "أوراقنا", "url": SITE + "/"},
    }
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "أوراقنا", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "أوراق العمل",
             "item": SITE + "/worksheets/"},
            {"@type": "ListItem", "position": 3, "name": cat["ar"],
             "item": SITE + "/worksheets/" + w["cat"] + "/"},
            {"@type": "ListItem", "position": 4, "name": w["h1"], "item": url},
        ],
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
<meta property="og:image" content="{site}{img}">
<meta property="og:locale" content="ar_AR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{site}{img}">
<script type="application/ld+json">{schema}</script>
<script type="application/ld+json">{crumbs}</script>
<link rel="stylesheet" href="/assets/brand.css">
<link rel="stylesheet" href="/assets/page.css">
</head>
<body>

{header}

<main class="wrap">
  <nav class="crumbs" aria-label="مسار التصفّح">
    <a href="/">أوراقنا</a><span>›</span><a href="/worksheets/">أوراق العمل</a><span>›</span><span>{cat_ar}</span>
  </nav>

  <div class="ws-top">
    <div class="ws-intro">
      <h1>{h1}</h1>
      <p class="ws-lead">{desc}</p>
      <p class="ws-meta"><span class="ws-tag">{level}</span><span class="ws-tag">A4 · صفحة واحدة</span><span class="ws-tag">مجاناً بلا تسجيل</span></p>
      <a class="btn btn-primary ws-cta" href="{tool}">ولّد ورقة جديدة واطبعها</a>
      <p class="ws-hint">تفتح الأداة على هذا الإعداد مباشرةً — عدّله كما تشاء.</p>
    </div>
    <figure class="ws-figure">
      <a href="{tool}"><img src="{img}" width="620" alt="معاينة: {alt}" loading="lazy" decoding="async"></a>
      <figcaption>معاينة الورقة كما تُطبع — الأسئلة تختلف في كل توليد.</figcaption>
    </figure>
  </div>

  <article class="prose">
{body}
  </article>

  <div data-ad-slot="rectangle"></div>
</main>

{footer}

<script src="/assets/lang.js"></script>
<script src="/assets/ads.js" defer></script>
</body>
</html>
""".format(
        guardian=GUARDIAN, title=esc(w["title"]), desc=esc(w["desc"]), url=url,
        site=SITE, img=img, h1=esc(w["h1"]), header=HEADER, footer=FOOTER,
        tool=tool, cat_ar=esc(cat["ar"]), level=esc(w["level"]),
        alt=esc(w["h1"]),
        schema=json.dumps(schema, ensure_ascii=False, separators=(",", ":")),
        crumbs=json.dumps(crumbs, ensure_ascii=False, separators=(",", ":")),
        body="\n".join("    " + line for line in w["body"]))


def index_html(data):
    """فهرس /worksheets/ — مدخل التصفّح ونقطة الزحف لكل الصفحات."""
    cats, ws = data["categories"], data["worksheets"]
    url = SITE + "/worksheets/"
    blocks = []
    for ck, c in cats.items():
        items = [w for w in ws if w["cat"] == ck]
        if not items:
            continue
        cards = "\n".join(
            '      <a class="ws-card" href="/worksheets/%s/%s/">'
            '<img src="/assets/previews/%s.png" width="620" alt="%s" loading="lazy" decoding="async">'
            '<span class="ws-card-t">%s</span><span class="ws-card-s">%s</span></a>'
            % (w["cat"], w["slug"], w["slug"], esc(w["h1"]), esc(w["h1"]), esc(w["level"]))
            for w in items)
        blocks.append(
            '    <section class="ws-sec" id="%s">\n'
            '      <h2><span class="ws-ico">%s</span>%s</h2>\n'
            '      <div class="ws-grid">\n%s\n      </div>\n    </section>'
            % (ck, c["icon"], esc(c["ar"]), cards))

    schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "أوراق عمل جاهزة للطباعة",
        "description": "فهرس أوراق العمل التعليمية المجانية في أوراقنا — رياضيات وحروف وألغاز ورسم وعلوم.",
        "url": url,
        "inLanguage": "ar",
        "hasPart": [{"@type": "LearningResource", "name": w["h1"],
                     "url": SITE + "/worksheets/" + w["cat"] + "/" + w["slug"] + "/"} for w in ws],
    }
    desc = ("فهرس أوراق العمل المجانية في أوراقنا: %d ورقة جاهزة للطباعة في الرياضيات "
            "والحروف العربية والإنجليزية والألغاز والرسم والعلوم — بأسئلة تتجدّد في كل توليد." % len(ws))
    return """<!DOCTYPE html>
<html lang="ar" dir="rtl" data-creator="Artist Altayeb Amer" data-creator-ar="الفنان الطيب عامر" data-source="https://awraqna.com">
<head>
<meta charset="utf-8">
{guardian}

<meta name="viewport" content="width=device-width,initial-scale=1">
<title>أوراق عمل جاهزة للطباعة مجاناً — {n} ورقة | أوراقنا</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:title" content="أوراق عمل جاهزة للطباعة مجاناً — {n} ورقة | أوراقنا">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
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
    <h1>أوراق عمل جاهزة للطباعة</h1>
    <p>{n} ورقة مجانية — اضغط أيّها شئت لتفتح على إعدادها، ثم ولّد واطبع. الأسئلة تتجدّد في كل مرة.</p>
  </div>

{blocks}

  <div data-ad-slot="rectangle"></div>
</main>

{footer}

<script src="/assets/lang.js"></script>
<script src="/assets/ads.js" defer></script>
</body>
</html>
""".format(guardian=GUARDIAN, desc=esc(desc), url=url, site=SITE, n=len(ws),
           header=HEADER, footer=FOOTER,
           schema=json.dumps(schema, ensure_ascii=False, separators=(",", ":")),
           blocks="\n\n".join(blocks))



# ── المقالات ───────────────────────────────────────────────────────
AR_DIGITS = "٠١٢٣٤٥٦٧٨٩"

def ar_num(n):
    return "".join(AR_DIGITS[int(c)] for c in str(n))

def ar_date(iso):
    y, m, d = iso.split("-")
    months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
              "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    return "%s %s %s" % (ar_num(int(d)), months[int(m) - 1], ar_num(y))

def words_of(body):
    return len(re.sub(r"<[^>]+>", " ", " ".join(body)).split())

def read_min(body):
    """دقائق القراءة — ١٨٠ كلمة عربية في الدقيقة، بحدّ أدنى دقيقة."""
    return max(1, round(words_of(body) / 180.0))

def read_ar(body):
    """صياغة عربية سليمة للمدة: المفرد والمثنى وجمع القلة والكثرة."""
    n = read_min(body)
    if n == 1: return "قراءة دقيقة"
    if n == 2: return "قراءة دقيقتين"
    if n <= 10: return "قراءة %s دقائق" % ar_num(n)
    return "قراءة %s دقيقة" % ar_num(n)


def article_html(a, all_articles):
    url = SITE + "/articles/" + a["slug"] + "/"
    words = words_of(a["body"])
    mins = read_min(a["body"])
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": a["h1"],
        "description": a["desc"],
        "url": url,
        "mainEntityOfPage": url,
        "datePublished": a["date"],
        "dateModified": a.get("updated", a["date"]),
        "inLanguage": "ar",
        "wordCount": words,
        "keywords": ", ".join(a["tags"]),
        "image": SITE + "/og.png",
        "isAccessibleForFree": True,
        "author": {"@type": "Person", "name": "Artist Altayeb Amer",
                   "alternateName": "الفنان الطيب عامر", "url": SITE + "/about/"},
        "publisher": {"@type": "Organization", "name": "أوراقنا", "url": SITE + "/",
                      "logo": {"@type": "ImageObject", "url": SITE + "/apple-touch-icon.png"}},
    }
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "أوراقنا", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "المقالات", "item": SITE + "/articles/"},
            {"@type": "ListItem", "position": 3, "name": a["h1"], "item": url},
        ],
    }
    others = [x for x in all_articles if x["slug"] != a["slug"]][:3]
    more = "\n".join(
        '      <a class="rel-card" href="/articles/%s/"><span class="rel-t">%s</span>'
        '<span class="rel-s">%s · %s</span></a>'
        % (o["slug"], esc(o["h1"]), esc(o["tags"][0]), read_ar(o["body"]))
        for o in others)
    tags = "".join('<span class="ws-tag">%s</span>' % esc(t) for t in a["tags"])

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
<meta property="article:published_time" content="{date}">
<meta property="article:author" content="الفنان الطيب عامر">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{site}/og.png">
<script type="application/ld+json">{schema}</script>
<script type="application/ld+json">{crumbs}</script>
<link rel="stylesheet" href="/assets/brand.css">
<link rel="stylesheet" href="/assets/page.css">
</head>
<body>

{header}

<main class="wrap">
  <nav class="crumbs" aria-label="مسار التصفّح">
    <a href="/">أوراقنا</a><span>›</span><a href="/articles/">المقالات</a>
  </nav>

  <article class="art">
    <header class="art-head">
      <h1>{h1}</h1>
      <p class="art-lead">{desc}</p>
      <p class="art-meta">
        <time datetime="{date}">{date_ar}</time><span class="sep">·</span>
        <span>{mins}</span><span class="sep">·</span>
        <span>الفنان الطيب عامر</span>
      </p>
      <p class="ws-meta">{tags}</p>
    </header>

    <div class="prose art-body">
{body}
    </div>
  </article>

  <div data-ad-slot="rectangle"></div>

  <section class="rel">
    <h2>اقرأ أيضاً</h2>
    <div class="rel-grid">
{more}
    </div>
  </section>
</main>

{footer}

<script src="/assets/lang.js"></script>
<script src="/assets/ads.js" defer></script>
</body>
</html>
""".format(
        guardian=GUARDIAN, title=esc(a["title"]), desc=esc(a["desc"]), url=url,
        site=SITE, h1=esc(a["h1"]), header=HEADER, footer=FOOTER,
        date=a["date"], date_ar=ar_date(a["date"]), mins=read_ar(a["body"]), tags=tags,
        schema=json.dumps(schema, ensure_ascii=False, separators=(",", ":")),
        crumbs=json.dumps(crumbs, ensure_ascii=False, separators=(",", ":")),
        more=more,
        body="\n".join("      " + line for line in a["body"]))


def articles_index_html(arts):
    url = SITE + "/articles/"
    rows = "\n".join(
        '    <a class="art-card" href="/articles/%s/">\n'
        '      <span class="art-card-tags">%s</span>\n'
        '      <span class="art-card-t">%s</span>\n'
        '      <span class="art-card-d">%s</span>\n'
        '      <span class="art-card-m"><time datetime="%s">%s</time> · %s</span>\n'
        '    </a>'
        % (a["slug"], " · ".join(esc(t) for t in a["tags"]), esc(a["h1"]), esc(a["desc"]),
           a["date"], ar_date(a["date"]), read_ar(a["body"]))
        for a in arts)
    schema = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "مقالات أوراقنا",
        "description": "مقالات عملية للمعلّمين والأهل عن تعليم الحروف والحساب واختيار أوراق العمل.",
        "url": url,
        "inLanguage": "ar",
        "blogPost": [{"@type": "BlogPosting", "headline": a["h1"], "datePublished": a["date"],
                      "url": SITE + "/articles/" + a["slug"] + "/"} for a in arts],
    }
    desc = ("مقالات عملية للمعلّمين والأهل: ترتيب تعليم الحروف العربية، خطة جدول الضرب، "
            "اختيار الورقة المناسبة للعمر، والطباعة الصحيحة.")
    return """<!DOCTYPE html>
<html lang="ar" dir="rtl" data-creator="Artist Altayeb Amer" data-creator-ar="الفنان الطيب عامر" data-source="https://awraqna.com">
<head>
<meta charset="utf-8">
{guardian}

<meta name="viewport" content="width=device-width,initial-scale=1">
<title>مقالات تعليمية للمعلّمين والأهل | أوراقنا</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:title" content="مقالات تعليمية للمعلّمين والأهل | أوراقنا">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
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
    <h1>مقالات</h1>
    <p>ما تعلّمناه من بناء أدوات التعليم — مكتوب للمعلّم والأمّ، لا للمبرمج.</p>
  </div>

  <div class="art-list">
{rows}
  </div>

  <div data-ad-slot="rectangle"></div>
</main>

{footer}

<script src="/assets/lang.js"></script>
<script src="/assets/ads.js" defer></script>
</body>
</html>
""".format(guardian=GUARDIAN, desc=esc(desc), url=url, site=SITE,
           header=HEADER, footer=FOOTER, rows=rows,
           schema=json.dumps(schema, ensure_ascii=False, separators=(",", ":")))


# ── قياس الزيارات ──────────────────────────────────────────────────
# `content/site.json` اختياري: {"cfAnalyticsToken": "..."}
# غيابه ⇒ لا بيكون إطلاقاً ولا سطر معطّل. توكن البيكون **ليس سرّاً** —
# يظهر في مصدر كل صفحة بطبيعته، فلا مانع من وجوده في المستودع.
# Cloudflare Web Analytics بلا كوكيز ولا تعقّب عبر المواقع ⇒ لا يحتاج
# بانر موافقة، وهو ما تنصّ عليه صفحة الخصوصية.
BEACON_BEGIN = "<!-- ANALYTICS:BEGIN -->"
BEACON_END = "<!-- ANALYTICS:END -->"
BEACON_RE = re.compile(re.escape(BEACON_BEGIN) + r".*?" + re.escape(BEACON_END), re.S)

def site_cfg():
    path = os.path.join(ROOT, "content/site.json")
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def beacon_html(cfg):
    tok = (cfg.get("cfAnalyticsToken") or "").strip()
    if not tok:
        return ""
    return (BEACON_BEGIN + '\n<script defer src="https://static.cloudflareinsights.com/beacon.min.js" '
            'data-cf-beacon=\'{"token": "%s"}\'></script>\n' % tok + BEACON_END)

def with_beacon(html, snippet):
    """يستبدل كتلة موجودة أو يحقن قبل </body>؛ والغياب يُزيلها نظيفاً."""
    if BEACON_RE.search(html):
        return BEACON_RE.sub(lambda m: snippet, html, count=1) if snippet \
               else BEACON_RE.sub("", html, count=1).replace("\n\n</body>", "\n</body>")
    if not snippet:
        return html
    return html.replace("</body>", snippet + "\n</body>", 1)

FOOT_RE = re.compile(r'<footer class="site-footer">.*?</footer>', re.S)

def main():
    written = []
    cfg = site_cfg()
    snip = beacon_html(cfg)
    print("قياس الزيارات: " + ("بيكون Cloudflare مُفعّل" if snip
          else "لا بيكون (أضف content/site.json ليُحقَن)") + "\n")

    global wr
    _wr = wr
    def wr(path, s):                      # كل صفحة تمرّ بالبيكون
        if path.endswith(".html"):
            s = with_beacon(s, snip)
        return _wr(path, s)

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
        dirnames[:] = [d for d in dirnames if d not in (".git", "content", "tools")]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(dirpath, fn), ROOT)
            if rel.split(os.sep)[0] in slugs or rel.split(os.sep)[0] in ("worksheets", "articles"):
                continue                      # مولَّدة أصلاً بالتذييل الصحيح
            html = rd(rel)
            # ملفات تحقّق محركات البحث ليست صفحات موقع: لا تذييل ولا وسوم.
            if re.match(r"^google[0-9a-f]+\.html$", fn) or fn.startswith("BingSiteAuth"):
                continue
            if not FOOT_RE.search(html):
                print("  ! لا تذييل في " + rel, file=sys.stderr)
                continue
            new = FOOT_RE.sub(lambda m: FOOTER, html, count=1)
            if wr(rel, new):
                written.append(rel)

    # ٢ب) صفحات الأوراق + فهرسها
    wdata = json.load(open(os.path.join(ROOT, "content/worksheets.json"), encoding="utf-8"))
    for w in wdata["worksheets"]:
        path = "worksheets/" + w["cat"] + "/" + w["slug"] + "/index.html"
        if wr(path, ws_html(w, wdata["categories"])):
            written.append(path)
    if wr("worksheets/index.html", index_html(wdata)):
        written.append("worksheets/index.html")

    # ٢ج) المقالات + فهرسها
    adata = json.load(open(os.path.join(ROOT, "content/articles.json"), encoding="utf-8"))
    arts = sorted(adata["articles"], key=lambda a: a["date"], reverse=True)
    for a in arts:
        path = "articles/" + a["slug"] + "/index.html"
        if wr(path, article_html(a, arts)):
            written.append(path)
    if wr("articles/index.html", articles_index_html(arts)):
        written.append("articles/index.html")

    # ٣) خريطة الموقع — تُبنى من الصفحات الموجودة فعلاً، لا من قائمة يدوية
    if wr("sitemap.xml", sitemap(slugs)):
        written.append("sitemap.xml")

    for w in sorted(written):
        print("كُتب: " + w)
    print("\nالمجموع: %d ملف" % len(written))

if __name__ == "__main__":
    main()
