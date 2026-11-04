"""Points the two websites at one domain. Run again with another name if the domain changes:

    python3 deploy/set_domain.py bynurzy.com

Main site (site/)      → https://<domain>/          (English) and https://<domain>/ru/ (Russian)
Student site (docs/)   → https://study.<domain>/    (password-protected course site)

Writes: canonical, og:url and absolute og:image / hreflang links in site/, a «Student login» footer link,
site/robots.txt and site/sitemap.xml, docs/robots.txt (the student site is never indexed) and the domain in
deploy/domain.txt. No CNAME file: it would send the current GitHub Pages address to a domain that is not live yet. Safe to run many times.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dom = (sys.argv[1] if len(sys.argv) > 1 else open(f"{ROOT}/deploy/domain.txt").read()).strip().lower()
dom = re.sub(r"^https?://", "", dom).strip("/")
assert re.fullmatch(r"[a-z0-9-]+(\.[a-z0-9-]+)+", dom), f"not a domain: {dom}"
MAIN, STUDY = f"https://{dom}", f"https://study.{dom}"

def head_block(lang):
    here = f"{MAIN}/" if lang == "en" else f"{MAIN}/ru/"
    return (f'  <!-- domain:start (deploy/set_domain.py) -->\n'
            f'  <link rel="canonical" href="{here}">\n'
            f'  <meta property="og:url" content="{here}">\n'
            f'  <meta property="og:image" content="{MAIN}/assets/og.jpg">\n'
            f'  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">\n'
            f'  <meta name="twitter:card" content="summary_large_image">\n'
            f'  <link rel="alternate" hreflang="en" href="{MAIN}/">\n'
            f'  <link rel="alternate" hreflang="ru" href="{MAIN}/ru/">\n'
            f'  <link rel="alternate" hreflang="x-default" href="{MAIN}/">\n'
            f'  <!-- domain:end -->\n')

for lang, path in (("en", "site/index.html"), ("ru", "site/ru/index.html")):
    f = f"{ROOT}/{path}"; t = open(f, encoding="utf-8").read()
    t = re.sub(r"  <!-- domain:start.*?<!-- domain:end -->\n", "", t, flags=re.S)
    t = re.sub(r'  <meta property="og:image" content="[^"]*">\n', "", t)            # relative og:image → absolute in the block
    t = re.sub(r'  <link rel="alternate" hreflang="(en|ru)" href="[^"]*">\n', "", t)  # relative hreflang → absolute in the block
    t = t.replace('  <meta name="theme-color"', head_block(lang) + '  <meta name="theme-color"', 1)
    label = "Student login" if lang == "en" else "Вход для учеников"
    t = re.sub(r'\s*<a href="[^"]*" class="study-link"[^>]*>[^<]*</a>', "", t)
    t = t.replace('      <a href="https://t.me/nurzycom">Telegram</a>\n',
                  f'      <a href="https://t.me/nurzycom">Telegram</a>\n      <a href="{STUDY}/" class="study-link" rel="nofollow">{label}</a>\n', 1)
    open(f, "w", encoding="utf-8").write(t)

open(f"{ROOT}/site/robots.txt", "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {MAIN}/sitemap.xml\n")
open(f"{ROOT}/site/sitemap.xml", "w").write(f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>{MAIN}/</loc><xhtml:link rel="alternate" hreflang="ru" href="{MAIN}/ru/"/><xhtml:link rel="alternate" hreflang="en" href="{MAIN}/"/></url>
  <url><loc>{MAIN}/ru/</loc><xhtml:link rel="alternate" hreflang="en" href="{MAIN}/"/><xhtml:link rel="alternate" hreflang="ru" href="{MAIN}/ru/"/></url>
</urlset>
''')
open(f"{ROOT}/docs/robots.txt", "w").write("# The course site is for enrolled students only.\nUser-agent: *\nDisallow: /\n")
open(f"{ROOT}/deploy/domain.txt", "w").write(dom + "\n")
print(f"main site {MAIN}/ · student site {STUDY}/")
