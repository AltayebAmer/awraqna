# نشر أوراقنا — awraqna.com

موقع ثابت بالكامل: لا خادم، لا قاعدة بيانات، لا `npm`، لا build step عند
الاستضافة. الطريقة المعتمدة: **GitHub → Cloudflare Pages**، فكل `git push`
ينشر تلقائياً.

> **مهم:** `build.py` يعمل **عندك قبل الرفع**، لا على Cloudflare. لذلك
> يجب أن تكون الصفحات المولَّدة **مُثبّتة في المستودع** (committed).
> فحص ما قبل النشر يمنعك من نسيان ذلك.

---

## قبل أي رفع — أمر واحد

```bash
cd "/Users/altamer/Claude Workspace/awraqna" && python3 tools/preflight.py
```

يفحص عشرة أشياء ويعطي رمز خروج: **0 = ارفع · 1 = لا ترفع**.

| # | الفحص | يمنع |
|---|---|---|
| ١ | البناء محدَّث | نشر صفحات أقدم من `content/*.json` |
| ٢ | الروابط الداخلية | رابط مكسور بعد إعادة تسمية |
| ٣ | canonical · description · og:image · title · lang | صفحة تفقد وسماً بعد إضافة قالب |
| ٤ | canonical يطابق مساره | نسختان من الصفحة في الفهرس |
| ٥ | sitemap مطابق للصفحات | خريطة تشير إلى صفحة محذوفة |
| ٦ | الحنة معزولة | تسرّب عمل غير مكتمل إلى جوجل |
| ٧ | `X-Robots-Tag` على المصدر | فهرسة `.md` و`.py` ومنافستها للصفحات |
| ٨ | الأصول وصور المعاينة | صفحة ورقة بصورة مكسورة |
| ٩ | لا أسرار ولا `TODO` | تسريب مفتاح · placeholder منشور |
| ١٠ | git نظيف ومرفوع | نشر لا يطابق ما تراه محلياً |

إن رجع **1**، أصلح ما يشير إليه ثم أعد التشغيل. لا تتجاوزه.

---

## الرفع (كل مرة بعد الأولى)

```bash
cd "/Users/altamer/Claude Workspace/awraqna" && python3 tools/preflight.py && git push
```

Cloudflare يلتقط الدفعة ويبني خلال دقيقة تقريباً. لا خطوة أخرى.

**حالياً هناك ٦ commits غير مرفوعة** — شغّل الأمر أعلاه.

### إن فشل الدفع بـ `HTTP 400`

```
error: RPC failed; HTTP 400 curl 22 The requested URL returned error: 400
send-pack: unexpected disconnect while reading sideband packet
```

ليس عطل شبكة ولا مشكلة صلاحيات. السبب أن `http.postBuffer` الافتراضي
**١ ميجابايت**، والمستودع يحوي ~١ ميجا من صور المعاينة، فتُقطع الحزمة
في منتصفها. أُصلح مرة واحدة على هذا الجهاز:

```bash
cd "/Users/altamer/Claude Workspace/awraqna"
git config http.postBuffer 524288000
git config http.version HTTP/1.1
```

الإعداد محليّ في `.git/config` ⇒ **يلزم تكراره إن استُنسخ المستودع على
جهاز آخر**. رسالة `Everything up-to-date` التي تلي الخطأ مضلّلة — لا شيء
رُفع فعلاً؛ تحقّق دائماً بـ:

```bash
git fetch origin && git log --oneline origin/main..HEAD | wc -l    # يجب أن يكون 0
```

---

## الإعداد لأول مرة (مرة واحدة فقط)

المستودع موجود: <https://github.com/AltayebAmer/awraqna>

### ١) أنشئ مشروع Cloudflare Pages

Cloudflare Dashboard ← **Workers & Pages** ← **Create** ← **Pages** ←
**Connect to Git** ← اختر مستودع `awraqna`.

| الحقل | القيمة |
|---|---|
| Project name | `awraqna-site` |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | **اتركه فارغاً** |
| Build output directory | `/` |

> اسم `awraqna` محجوز بمشروع الرفع اليدوي القديم، لذلك `awraqna-site`.
> لا تحاول إعادة استعماله قبل حذف القديم.

اضغط **Save and Deploy** وانتظر أول بناء.

### ٢) اختبر على رابط Pages المؤقّت

سيعطيك رابطاً مثل `awraqna-site.pages.dev`. افتحه وتحقّق:

- الرئيسية تفتح، وشريطا «٢٠ ورقة جاهزة» و«مقالات» يعملان.
- `/worksheets/` تعرض ٢٠ بطاقة **بصورها** (لا مربّعات فارغة).
- افتح ورقة واضغط «ولّد ورقة جديدة واطبعها» → تفتح الأداة على الإعداد الصحيح.
- `Ctrl/Cmd + P` على أي مولّد → **صفحة أو صفحتان**، بلا أزرار ولا إعلانات.
- `/about/` و`/privacy/` و`/terms/` و`/contact/` تفتح من التذييل.
- زر `EN` يقلب اللغة، ولا تظهر اللغتان معاً.

### ٣) انقل النطاق

في مشروع `awraqna-site` ← **Custom domains** ← **Set up a domain** ←
أضف `awraqna.com` ثم `www.awraqna.com`.

> إن رفض النطاق لأنه مربوط بالمشروع القديم: احذفه من **المشروع القديم**
> أولاً (Custom domains ← Remove)، ثم أضفه هنا. سجلّات DNS يديرها
> Cloudflare تلقائياً لأن النطاق مسجَّل عنده.

### ٤) احذف المشروع القديم

بعد أن يعمل `awraqna.com` من المشروع الجديد **وتتأكّد بنفسك**:
المشروع القديم ← Settings ← **Delete project**.

لا تحذفه قبل التأكّد — الحذف لا رجعة فيه.

---

## بعد النشر مباشرةً

### Search Console
1. <https://search.google.com/search-console> ← Add property ← Domain ← `awraqna.com`.
   التحقّق يتم بسجلّ TXT — Cloudflare يضيفه بضغطة إن كان النطاق عنده.
2. Sitemaps ← أضف `sitemap.xml`.
3. URL Inspection ← اطلب فهرسة يدوية لأهمّ عشرة روابط:
   `/` · `/worksheets/` · `/articles/` · وأهمّ سبع صفحات أوراق ومقالات.

### Bing Webmaster Tools
<https://www.bing.com/webmasters> — يستورد من Search Console بضغطة.

### Cloudflare Web Analytics

**١)** Cloudflare ← Analytics & Logs ← Web Analytics ← `Add a site` ←
`awraqna.com`. اختر **Manual Setup** لا Automatic (التلقائي لا يعمل مع
نطاق DNS-only). ستحصل على `token` بصيغة hex.

**٢)** أنشئ الملف — هذا كل المطلوب:

```bash
cd "/Users/altamer/Claude Workspace/awraqna"
cat > content/site.json <<'EOF'
{ "cfAnalyticsToken": "الصق_التوكن_هنا" }
EOF
python3 build.py && python3 tools/preflight.py && git add -A && git commit -m "تفعيل قياس الزيارات" && git push
```

`build.py` يحقن البيكون في **الصفحات الثلاث والأربعين** دفعةً واحدة.
حذف `content/site.json` ثم إعادة البناء يزيله من الجميع نظيفاً.

> **لماذا لا يوجد ملف `site.json` جاهز بـ placeholder؟** سطر بـ
> `PUT_YOUR_TOKEN_HERE` منشور على الإنتاج هو عطل صامت لا إعداد: يبدو
> مفعّلاً ولا يقيس شيئاً. غياب الملف يعني غياب البيكون — حالة صريحة.

> **التوكن ليس سرّاً.** يظهر في مصدر كل صفحة بطبيعته، فلا مانع من وجوده
> في المستودع. لذلك `content/site.json` **يُرفع** ولا يدخل `.gitignore`.

**٣) تحقّق، لا تفترض:** افتح الموقع في نافذة خاصة ← DevTools ← Network ←
ابحث عن `beacon.min.js` بحالة 200. ثم ارجع إلى لوحة Web Analytics بعد
٥–١٠ دقائق؛ يجب أن ترى زيارة واحدة. إن لم تظهر: عطّل حاجب الإعلانات
أثناء الاختبار.

---

## ماذا يُنشر بالضبط

Cloudflare Pages ينشر **كل ما في المستودع** — لا يوجد ملف استثناء.
لذلك `build.py` و`content/*.json` و`tools/` و`*.md` تُخدَم فعلاً.

هذا مقبول (لا سرّ في المشروع)، والحماية من الفهرسة في `_headers`:

```
/*.md      X-Robots-Tag: noindex, nofollow
/*.py      X-Robots-Tag: noindex, nofollow
/tools/*   X-Robots-Tag: noindex, nofollow
/content/* X-Robots-Tag: noindex, nofollow
/henna/*   X-Robots-Tag: noindex, nofollow
```

`robots.txt` **يطلب** من الزاحف الامتناع، و`X-Robots-Tag` **تُلزمه**.
الاثنان معاً؛ لا تحذف أيّهما.

### تنبيهات لا تتجاوزها
- **`.well-known/` مجلد مخفي.** يصل عبر `git push` دائماً، لكنه يختفي في
  السحب اليدوي من Finder على macOS. لا ترفع يدوياً.
- **`assets/fonts/OFL.txt`** يجب أن يبقى مع الخطوط — شرط في رخصة SIL OFL.
- **`assets/guardian-config.js`** يُحمَّل قبل `guardian.js`؛ بدونه يسقط
  الحارس إلى الافتراضيات ويصير اسم المشروع هو اسم المضيف.

---

## بعد أي تعديل على المحتوى

```bash
cd "/Users/altamer/Claude Workspace/awraqna"
python3 build.py                    # يبني الصفحات + sitemap
python3 tools/preflight.py          # يجب أن يعطي: جاهز للنشر
git add -A && git commit -m "وصف التعديل"
git push
```

- **صفحة ورقة أو مقال جديد:** أضف عنصراً في `content/worksheets.json` أو
  `content/articles.json` ثم `build.py`.
- **صورة معاينة لورقة جديدة:** `python3 tools/make-previews.py` (يبني الناقص فقط).
- **تغيّر مولّد فتغيّرت أوراقه:** `python3 tools/make-previews.py --all`.
- **لا تحرّر التذييل أو صفحات `worksheets/` و`articles/` و`about/` في HTML
  مباشرةً** — `build.py` يدهسها. مكان التحرير `content/*.json` و`build.py`.

## فحص مبدّل اللغة

فاحص يعمل في المتصفح لا في الطرفية. شغّل خادماً محلياً:

```bash
cd "/Users/altamer/Claude Workspace/awraqna" && python3 -m http.server 8899
```

ثم افتح <http://localhost:8899/tools/i18n-harness.html> وانتظر السطر الأخير.
يفتح كل صفحة في `iframe`، يقلب اللغة، ويتأكّد أن العربية والإنجليزية لا
تظهران معاً. شغّله بعد أي تعديل على `page.css` أو `brand.css`.

> **القاعدة التي يحرسها:** لا تضع `display` في قاعدة CSS تطال عنصراً يحمل
> `data-ar` أو `data-en`. أعطِ العنصر `class="blk"` بدلاً من ذلك. قاعدة
> `.foo b{display:block}` تخصيصها أعلى من `[data-en]{display:none}`
> فتُظهر اللغتين معاً — وقع هذا مرتين.
