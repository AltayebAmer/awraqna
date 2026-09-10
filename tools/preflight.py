#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
فحص ما قبل النشر — يُشغَّل قبل كل رفع.

كل فحص هنا وُلد من عطل وقع فعلاً: رابط مكسور بعد إعادة تسمية، صفحة بلا
canonical، خريطة موقع تشير إلى صفحة محذوفة، الحنة تسرّبت إلى الفهرس،
`build.py` لم يُشغَّل فالمنشور أقدم من المصدر.

    python3 tools/preflight.py      # 0 = جاهز للنشر · 1 = لا ترفع
"""
import glob, json, os, re, subprocess, sys, xml.dom.minidom

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://awraqna.com"
os.chdir(ROOT)

fails, warns = [], []
def bad(m):  fails.append(m); print("  ✗ " + m)
def warn(m): warns.append(m); print("  ⚠ " + m)
def ok(m):   print("  ✓ " + m)

def pages():
    return sorted(set(glob.glob("*.html") + glob.glob("*/index.html") +
                      glob.glob("*/*/index.html") + glob.glob("*/*/*/index.html")))

def indexable():
    """الصفحات المقصود فهرستها: كل صفحة عدا 404 والحنة وأدوات التطوير."""
    import re as _re
    return [p for p in pages()
            if p != "404.html" and not p.startswith(("henna/", "tools/"))
            and not _re.match(r"^google[0-9a-f]+\.html$", p)]


print("\n١) البناء محدَّث؟")
# ملاحظة مهمة: هذا الفحص **يكتب** — build.py يعيد بناء ما يملكه. لذلك أي
# عطل في صفحة مولَّدة يختفي هنا قبل أن تراه الفحوص ٢–٥، وهو سلوك صحيح
# عملياً (النشر يسبقه بناء دائماً) لكنه يعني أن الفحوص التالية تفحص
# **الشجرة بعد البناء**. الأعطال التي تصمد أمامها هي ما في الملفات
# المكتوبة يدوياً — وهي المقصودة بها أصلاً.
r = subprocess.run([sys.executable, "build.py"], capture_output=True, text=True)
if r.returncode != 0:
    bad("build.py فشل:\n" + r.stdout + r.stderr)
else:
    changed = [l.split("كُتب: ")[1] for l in r.stdout.splitlines() if l.startswith("كُتب: ")]
    if changed:
        bad("المنشور أقدم من المصدر — build.py أعاد بناء %d ملفاً. "
            "راجع `git diff` ثم اعمل commit، وأعد تشغيل الفحص." % len(changed))
        for c in changed[:6]: print("      · " + c)
        print("      (الفحوص التالية تفحص الشجرة **بعد** إعادة البناء)")
    else:
        ok("كل صفحة مبنية مطابقة لمصدرها")


print("\n٢) الروابط الداخلية")
broken = 0; checked = 0
for f in pages():
    html = open(f, encoding="utf-8").read()
    for href in re.findall(r'(?:href|src)="(/[^"#?]*)"', html):
        t = href.lstrip("/")
        target = t + "index.html" if href.endswith("/") or t == "" else t
        checked += 1
        if not os.path.exists(target):
            broken += 1
            if broken <= 5: print("      %s → %s" % (f, href))
if broken: bad("%d رابط مكسور من %d" % (broken, checked))
else: ok("%d رابطاً داخلياً · صفر مكسور" % checked)


print("\n٣) الوسوم الأساسية في كل صفحة مفهرسة")
missing = {"canonical": [], "description": [], "og:image": [], "title": [], "lang": []}
for f in indexable():
    h = open(f, encoding="utf-8").read()
    if 'rel="canonical"' not in h: missing["canonical"].append(f)
    if 'name="description"' not in h: missing["description"].append(f)
    if 'property="og:image"' not in h: missing["og:image"].append(f)
    if not re.search(r"<title>.+?</title>", h, re.S): missing["title"].append(f)
    if 'lang="ar"' not in h and 'lang="en"' not in h: missing["lang"].append(f)
for k, v in missing.items():
    if v: bad("%s مفقود في %d صفحة: %s" % (k, len(v), ", ".join(v[:3])))
if not any(missing.values()): ok("canonical · description · og:image · title · lang في %d صفحة" % len(indexable()))


print("\n٤) canonical يطابق مسار الملف")
mism = 0
for f in indexable():
    h = open(f, encoding="utf-8").read()
    m = re.search(r'<link rel="canonical" href="([^"]+)">', h)
    if not m: continue
    want = SITE + "/" + f.replace("index.html", "")
    if f == "index.html": want = SITE + "/"
    if m.group(1) != want:
        mism += 1
        if mism <= 5: print("      %s → %s (المتوقّع %s)" % (f, m.group(1), want))
if mism: bad("%d canonical لا يطابق مساره" % mism)
else: ok("كل canonical يطابق مسار ملفه")


print("\n٥) خريطة الموقع")
try:
    xml.dom.minidom.parse("sitemap.xml")
    locs = re.findall(r"<loc>([^<]+)</loc>", open("sitemap.xml", encoding="utf-8").read())
    dead = [u for u in locs
            if not os.path.exists((u.replace(SITE + "/", "") or "") + "index.html")]
    want = set(SITE + "/" + p.replace("index.html", "") for p in indexable())
    want = set(u if u != SITE + "/" else SITE + "/" for u in want)
    miss = want - set(locs)
    extra = set(locs) - want
    if dead:  bad("sitemap يشير إلى %d صفحة غير موجودة: %s" % (len(dead), dead[:3]))
    if miss:  bad("صفحات مفهرسة غائبة عن sitemap: %s" % sorted(miss)[:3])
    if extra: bad("sitemap فيه ما لا يُفهرَس: %s" % sorted(extra)[:3])
    if not (dead or miss or extra): ok("%d رابطاً · XML صالح · مطابق للصفحات تماماً" % len(locs))
except Exception as e:
    bad("sitemap.xml غير صالح: %s" % e)


print("\n٦) الحنة معزولة")
h = open("henna/index.html", encoding="utf-8").read()
issues = []
if "noindex" not in h: issues.append("لا meta noindex")
if "henna" in open("sitemap.xml", encoding="utf-8").read(): issues.append("موجودة في sitemap")
if "Disallow: /henna/" not in open("robots.txt", encoding="utf-8").read(): issues.append("لا Disallow")
linkers = [f for f in indexable() if "/henna/" in open(f, encoding="utf-8").read()]
if linkers: issues.append("مرتبطة من %s" % linkers[:2])
if issues: bad("الحنة: " + " · ".join(issues))
else: ok("noindex · خارج sitemap · Disallow · بلا روابط واردة")


print("\n٧) ملفات المصدر لا تُفهرَس")
hd = open("_headers", encoding="utf-8").read()
need = ["/*.md", "/*.py", "/tools/*", "/content/*"]
gone = [n for n in need if n not in hd]
if gone: bad("X-Robots-Tag ناقص لـ: %s" % gone)
else: ok("X-Robots-Tag: noindex على المصدر والأدوات")


print("\n٨) الأصول موجودة")
miss = []
for f in ["og.png", "favicon.ico", "favicon.svg", "apple-touch-icon.png",
          "robots.txt", "sitemap.xml", "404.html", "_headers", "humans.txt",
          ".well-known/guardian.json"]:
    if not os.path.exists(f): miss.append(f)
prev = json.load(open("content/worksheets.json", encoding="utf-8"))["worksheets"]
noprev = [w["slug"] for w in prev if not os.path.exists("assets/previews/%s.png" % w["slug"])]
if miss:   bad("ملفات ناقصة: %s" % miss)
if noprev: bad("صور معاينة ناقصة: %s" % noprev)
if not (miss or noprev): ok("الأصول العشرة + %d صورة معاينة" % len(prev))


print("\n٩) لا أسرار ولا بقايا")
leaks = []
for f in glob.glob("**/*.js", recursive=True) + glob.glob("**/*.html", recursive=True):
    if ".git/" in f: continue
    t = open(f, encoding="utf-8", errors="ignore").read()
    for pat, label in [(r"(?i)api[_-]?key\s*[:=]\s*['\"][^'\"]{12,}", "مفتاح API"),
                       (r"(?i)secret\s*[:=]\s*['\"][^'\"]{8,}", "secret"),
                       (r"ghp_[A-Za-z0-9]{20,}", "توكن GitHub")]:
        if re.search(pat, t): leaks.append("%s في %s" % (label, f))
todos = [f for f in glob.glob("assets/**/*.js", recursive=True) + ["build.py"]
         if re.search(r"//\s*TODO|FIXME|PUT_YOUR", open(f, encoding="utf-8", errors="ignore").read())]
if leaks: bad("تسريب محتمل: %s" % leaks[:3])
if todos: warn("TODO/FIXME في: %s" % todos[:3])
if not (leaks or todos): ok("صفر سر · صفر TODO · صفر placeholder")


print("\n١٠) حالة git")
st = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True).stdout.strip()
if st:
    warn("تعديلات غير مُثبّتة (%d ملف) — اعمل commit قبل الرفع" % len(st.splitlines()))
else:
    ok("المستودع نظيف")
ahead = subprocess.run(["git", "rev-list", "--count", "@{u}..HEAD"],
                       capture_output=True, text=True)
if ahead.returncode == 0 and ahead.stdout.strip() not in ("0", ""):
    warn("%s commit لم تُرفَع بعد إلى GitHub — شغّل: git push" % ahead.stdout.strip())


print("\n" + "─" * 58)
if fails:
    print("النتيجة: ✗ لا ترفع — %d عطل" % len(fails))
    sys.exit(1)
print("النتيجة: ✓ جاهز للنشر" + ("  (%d تنبيه)" % len(warns) if warns else ""))
sys.exit(0)
