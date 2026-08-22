# نشر أوراقنا — awraqna.com

موقع ثابت بالكامل. لا خادم، لا قاعدة بيانات، لا build step، لا تبعيات.

## ما يُرفع

كل محتويات المجلد **ما عدا**:

| لا تُرفع | السبب |
|---|---|
| `DEPLOY.md` | تعليمات داخلية |
| `PROJECT_MAP.md` · `CLAUDE.md` · `ROADMAP.md` | ذاكرة تطوير |
| `.git/` · `.gitignore` | تُستبعد تلقائياً |
| `../.claude/launch.json` | خارج المجلد أصلاً |

الملفات المنشورة: `index.html` (الرئيسية) · `math/` · `puzzles/` · `teacher/`
· `art/` · `language/` · `coding/` · `science/` · `time-money/`
· `404.html` · `robots.txt` · `sitemap.xml` · `favicon.ico` · `favicon.svg`
· `apple-touch-icon.png` · `_headers` · `assets/` (بما فيه `assets/fonts/`)

> **الخطوط:** `assets/fonts/` يحوي ثلاثة خطوط بترخيص SIL OFL مجزّأة على
> المحارف العربية (146KB إجمالاً). **لا تحذف `assets/fonts/OFL.txt`** — بقاء
> نص الرخصة مع الملفات شرطٌ في الترخيص.

## Cloudflare Pages (النطاق مُدار عندهم أصلاً ⇒ الأبسط)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Upload assets**
2. اسحب **محتويات** مجلد `awraqna/` — لا المجلد نفسه.
3. اسم المشروع: `awraqna` → **Deploy**
4. **Custom domains** → أضف `awraqna.com` ثم `www.awraqna.com`
5. النطاق مُشترى من Cloudflare Registrar ⇒ سجلّات DNS تُضبط تلقائياً.

`_headers` مدعوم في Cloudflare Pages و Netlify. **GitHub Pages لا يدعمه** ⇒ ستفقد
ضبط التخزين المؤقت وترويسات الأمان.

## بعد النشر — تحقّق فعلياً لا افتراضاً

```bash
curl -sI https://awraqna.com | head -1
curl -s https://awraqna.com/robots.txt
curl -sI https://awraqna.com/assets/gen/math.js | grep -i cache-control
curl -sI https://awraqna.com/assets/fonts/amiri.woff2 | grep -iE "content-type|cache-control" 
curl -sI https://awraqna.com/nope | head -1
for p in "" math/ puzzles/ teacher/; do curl -s -o /dev/null -w "$p %{http_code}\n" https://awraqna.com/$p; done
```
المتوقع: `200` · محتوى robots · `max-age=86400, must-revalidate` · `404` · و`200` للمجالات الأربعة.

ثم افتح الموقع واطبع ورقة فعلياً (Ctrl/Cmd+P) وتأكد من **صفحتين لا ثلاث**.

## خطوتان بعد الإطلاق — ليستا من عمل النشر

1. **Google Search Console**: أضف `awraqna.com`، وأرسل `sitemap.xml`.
   بدون هذا قد تمرّ أسابيع قبل الفهرسة.
2. **AdSense**: حساب واحد يغطي `awraqna.com` و `007.gallery`.
   حتى الموافقة، `assets/ads.js` يعرض إعلانات بيتية متبادلة — لا فراغ.
