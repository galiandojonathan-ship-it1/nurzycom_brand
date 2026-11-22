"""Gives every script and stylesheet of the course site a new version tag (?v=...), so browsers load the new files.
Cloudflare's zone setting «Browser Cache TTL» keeps scripts for 4 hours; without a new tag a student can get a new page
with an old script. Run after every change to docs/*.js or docs/site.css:  python3 deploy/bump_version.py

The tag is the time in Almaty (YYYYMMDDHHMM), whatever the machine's clock zone, and always greater than every tag already
in the pages: a cloud container runs on UTC, five hours behind, and a tag that went back could repeat an older one, so a
browser would keep an old cached script next to a new page (2026-11-22)."""
import glob, re, os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")
FMT = "%Y%m%d%H%M"
pages = {f: open(f, encoding="utf-8").read() for f in glob.glob(f"{D}/*.html")}
seen = [v for t in pages.values() for v in re.findall(r'\?v=(\d{12})"', t)]
now = datetime.now(ZoneInfo("Asia/Almaty")).replace(tzinfo=None, second=0, microsecond=0)
if seen:
    after = datetime.strptime(max(seen), FMT) + timedelta(minutes=1)
    now = max(now, after)
V = now.strftime(FMT)
n = 0
for f, t in pages.items():
    u = re.sub(r'(<script src="[a-z0-9_-]+\.js)(?:\?v=[^"]*)?(")', rf'\g<1>?v={V}\2', t)
    u = re.sub(r'(<link rel="stylesheet" href="(?:site|teacher)\.css)(?:\?v=[^"]*)?(")', rf'\g<1>?v={V}\2', u)
    if u != t:
        open(f, "w", encoding="utf-8").write(u); n += 1
print(f"version {V} in {n} pages")
