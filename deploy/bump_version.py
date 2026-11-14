"""Gives every script and stylesheet of the course site a new version tag (?v=...), so browsers load the new files.
Cloudflare's zone setting «Browser Cache TTL» keeps scripts for 4 hours; without a new tag a student can get a new page
with an old script. Run after every change to docs/*.js or docs/site.css:  python3 deploy/bump_version.py"""
import glob, re, time, os
D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")
V = time.strftime("%Y%m%d%H%M")
n = 0
for f in glob.glob(f"{D}/*.html"):
    t = open(f).read()
    u = re.sub(r'(<script src="[a-z0-9_]+\.js)(?:\?v=[^"]*)?(")', rf'\g<1>?v={V}\2', t)
    u = re.sub(r'(<link rel="stylesheet" href="site\.css)(?:\?v=[^"]*)?(")', rf'\g<1>?v={V}\2', u)
    if u != t: open(f, "w").write(u); n += 1
print(f"version {V} in {n} pages")
