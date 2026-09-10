#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
صور معاينة الأوراق — تُبنى من المولّدات نفسها لا تُرسم يدوياً.

المسار: خادم محلي ← Chrome بلا واجهة يطبع PDF من الرابط العميق ←
sips يحوّل الصفحة الأولى إلى PNG ← تصغير إلى عرض ثابت.
الصورة ناتج المولّد الحقيقي، فإن تغيّر المولّد وتغيّرت الورقة، تتغيّر
الصورة بإعادة التشغيل — لا تكذب المعاينة على الزائر.

    python3 tools/make-previews.py            # الناقص فقط
    python3 tools/make-previews.py --all      # الكل من جديد
"""
import json, os, subprocess, sys, http.server, socketserver, threading, functools

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "assets/previews")
TMP  = os.path.join(ROOT, ".preview-tmp")
PORT = 8901
WIDTH = 620                       # عرض الصورة النهائي بالبكسل
CHROME = ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium")

def chrome():
    for c in CHROME:
        if os.path.exists(c): return c
    sys.exit("لم يُعثر على Chrome — صور المعاينة تحتاجه.")

def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(("127.0.0.1", PORT), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

def main():
    force = "--all" in sys.argv
    data = json.load(open(os.path.join(ROOT, "content/worksheets.json"), encoding="utf-8"))
    cats = data["categories"]
    os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
    srv = serve()
    ch = chrome()
    made = skipped = 0
    try:
        for w in data["worksheets"]:
            png = os.path.join(OUT, w["slug"] + ".png")
            if os.path.exists(png) and not force:
                skipped += 1; continue
            url = "http://127.0.0.1:%d%s?%s" % (PORT, cats[w["cat"]]["tool"], w["params"])
            pdf = os.path.join(TMP, w["slug"] + ".pdf")
            subprocess.run([ch, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                            "--virtual-time-budget=5000", "--print-to-pdf=" + pdf, url],
                           capture_output=True)
            if not os.path.exists(pdf):
                print("  ✗ فشل التوليد:", w["slug"]); continue
            subprocess.run(["sips", "-s", "format", "png", pdf, "--out", png],
                           capture_output=True)
            subprocess.run(["sips", "-Z", str(WIDTH), png], capture_output=True)
            kb = os.path.getsize(png) // 1024
            print("  ✓ %-28s %4d KB" % (w["slug"], kb))
            made += 1
    finally:
        srv.shutdown()
        for f in os.listdir(TMP): os.remove(os.path.join(TMP, f))
        os.rmdir(TMP)
    print("\nجديدة: %d · موجودة: %d" % (made, skipped))

if __name__ == "__main__":
    main()
