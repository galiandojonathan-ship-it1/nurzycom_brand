#!/usr/bin/env python3
"""Measure an IELTS-style reading passage against experimental/IELTS_SPEC.md.

Usage:
  python3 ielts_measure.py passage.txt [--awl awl.txt]
  python3 ielts_measure.py --lesson C01 [--awl awl.txt]   # reads the "ielts" part of experimental/assets/data.js

The AWL file (optional) is one headword or family member per line; without it the AWL share is not reported.
Syllables are counted with a simple vowel-group rule, so Flesch figures are approximate (good enough to compare texts
measured the same way, which is how calibration against official samples should be done).
"""
import json, re, subprocess, sys, pathlib

def syllables(w):
    w = w.lower().strip("'")
    if len(w) <= 3: return 1
    w = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", w)
    w = re.sub(r"^y", "", w)
    return max(1, len(re.findall(r"[aeiouy]{1,2}", w)))

def measure(text, awl=None):
    paras = [p for p in re.split(r"\n\s*\n", text.strip()) if p.strip()]
    sents = [s for s in re.split(r"(?<=[.!?])[\"”’)]?\s+(?=[A-Z“\"(])", " ".join(p.strip() for p in paras)) if s.strip()]
    words = re.findall(r"[A-Za-z][A-Za-z'’-]*", text)
    n, ns = len(words), max(1, len(sents))
    syl = sum(syllables(w) for w in words)
    long = sum(1 for w in words if syllables(w) >= 3)
    out = {
        "words": n, "paragraphs": len(paras), "sentences": ns,
        "words_per_sentence": round(n / ns, 1),
        "chars_per_word": round(sum(len(w) for w in words) / max(1, n), 2),
        "flesch_reading_ease": round(206.835 - 1.015 * n / ns - 84.6 * syl / max(1, n), 1),
        "flesch_kincaid_grade": round(0.39 * n / ns + 11.8 * syl / max(1, n) - 15.59, 1),
        "long_words_pct": round(100 * long / max(1, n), 1),
    }
    if awl:
        hits = sum(1 for w in words if w.lower().strip("'’") in awl)
        out["awl_pct"] = round(100 * hits / max(1, n), 1)
    checks = {
        "length 600–1060": 600 <= n <= 1060,
        "grade 11–14": 11 <= out["flesch_kincaid_grade"] <= 14,
        "sentence 18–26 words": 18 <= out["words_per_sentence"] <= 26,
    }
    if awl: checks["AWL 6–10%"] = 6 <= out["awl_pct"] <= 10
    return out, checks

def lesson_passage(lid):
    root = pathlib.Path(__file__).resolve().parents[1]
    js = "global.window={};" + (root / "assets/data.js").read_text(encoding="utf-8") + \
         ";const L=window.LESSONS[%s];const p=L.parts.find(x=>x.id==='ielts');" \
         "console.log(JSON.stringify({title:p.passageTitle,paras:p.passage}));" % json.dumps(lid)
    import tempfile
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(js)
    data = json.loads(subprocess.run(["node", f.name], capture_output=True, text=True, check=True).stdout)
    return data["title"], "\n\n".join(re.sub(r"^[A-H]\s+", "", t) for t in data["paras"])

def main(a):
    awl = None
    if "--awl" in a:
        i = a.index("--awl"); awl = {l.strip().lower() for l in open(a[i + 1], encoding="utf-8") if l.strip()}; del a[i:i + 2]
    if a and a[0] == "--lesson":
        title, text = lesson_passage(a[1]); label = a[1] + " · " + title
    else:
        text = open(a[0], encoding="utf-8").read(); label = a[0]
    out, checks = measure(text, awl)
    print(label)
    for k, v in out.items(): print("  %-22s %s" % (k, v))
    if not awl: print("  %-22s %s" % ("awl_pct", "not measured (no --awl file)"))
    for k, ok in checks.items(): print("  %s %s" % ("PASS" if ok else "FAIL", k))
    return 0 if all(checks.values()) else 1

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
