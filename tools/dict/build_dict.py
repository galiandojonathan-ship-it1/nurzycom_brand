# Builds the site dictionary (docs/q/dict/<hash>/<prefix>.json.gz + docs/data/dict.json) from the English Wiktionary extract of
# kaikki.org. Split by the first two letters of each word, so a lookup downloads one small file (about 30 KB), never the whole.
# The source is streamed, never stored:
#   curl -s https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl.gz | gunzip | python3 -I tools/dict/build_dict.py <docs dir>
# Licence: Wiktionary text is CC BY-SA 4.0; the built file is a derived work under the same licence, credited in the card
# («Wiktionary, CC BY-SA 4.0») and in tools/dict/README.md.
# Kept: English words and short phrases (noun, verb, adjective, adverb, phrase) with a word frequency (wordfreq Zipf) from
# ZMIN to ZMAX: the very common words a B2 student knows are left out, and so are very rare ones. Per word: up to 2 senses
# per part of speech (4 in all), each gloss cut to 120 characters; up to 4 Russian equivalents, stress marks removed. Senses tagged obsolete,
# misspelling, vulgar or offensive are skipped; archaic ones stay (SAT literary passages use them).
# Irregular forms (went → go, mice → mouse) are kept as a small form → lemma map; regular endings are handled in dict.js.
import sys, json, gzip, re, os, hashlib, shutil
from wordfreq import zipf_frequency

ZMIN, ZMAX, ZPHRASE, ZFORM = 1.5, 5.3, 3.2, 2.0   # single words; phrases need ZPHRASE (wordfreq rates phrases loosely); stored irregular forms ZFORM
POS = {"noun": "n", "verb": "v", "adj": "adj", "adv": "adv", "phrase": "phr", "prep_phrase": "phr", "pron": "pron", "prep": "prep", "conj": "conj", "det": "det"}   # pronouns etc. for archaic thou, ere, whence
SKIP = {"obsolete", "misspelling", "vulgar", "offensive", "derogatory", "slur", "pejorative", "nonstandard", "Internet", "slang", "eye-dialect"}
OK_WORD = re.compile(r"[a-z][a-z'\- ]{0,38}[a-z]")
D, FORMS, ZC = {}, {}, {}


def z(w):
    if w not in ZC: ZC[w] = zipf_frequency(w, "en")
    return ZC[w]


def cut(s, n=120):
    s = re.sub(r"\s+", " ", s).strip()
    return s if len(s) <= n else s[: s.rfind(" ", 0, n - 1)].rstrip(",;:") + "…"


def regular(form, lemma):
    """True when dict.js finds the lemma by its own ending rules, so the pair need not be stored."""
    c = {form[:-1], form[:-2], form[:-3], form[:-3] + "y", form[:-3] + "e", form[:-2] + "e" if form.endswith("ed") else "", form[:-4] if len(form) > 5 and form[-4] == form[-5] else ""}
    return lemma in c


for line in sys.stdin:
    try: e = json.loads(line)
    except ValueError: continue
    w, pos = e.get("word", ""), POS.get(e.get("pos"))
    if e.get("lang_code") != "en" or not pos or not OK_WORD.fullmatch(w) or w.count(" ") > 3: continue
    glosses, ru = [], []
    trs = list(e.get("translations") or [])
    for s in e.get("senses") or []:
        fo = s.get("form_of") or s.get("alt_of")
        if fo:   # a form of another word: remembered for the lookup, and kept as a sense when it explains (thou: «Nominative singular of ye ("you")», mice: «plural of mouse»)
            lem = (fo[0] or {}).get("word", "")
            if lem and lem != w and OK_WORD.fullmatch(lem): FORMS.setdefault(w, lem)
            if s.get("alt_of") or "misspelling" in (s.get("tags") or []): continue
        trs += s.get("translations") or []
        if set(s.get("tags") or []) & SKIP: continue
        g = (s.get("glosses") or [""])[-1]
        if not g or re.match(r"(?i)(alternative|archaic|obsolete) (form|spelling) of|misspelling of", g): continue
        if len(glosses) < 2: glosses.append(cut(g))
    for t in trs:
        if t.get("code") == "ru" or t.get("lang") == "Russian":
            r = (t.get("word") or "").replace("\u0301", "").replace("\u0300", "").strip()   # stress marks: сме́шивать → смешивать
            if r and r not in ru and len(ru) < 4 and len(r) < 40: ru.append(r)
    if not glosses: continue
    d = D.setdefault(w, {"p": [], "r": []})
    if len(d["p"]) < 3 and sum(len(x[1]) for x in d["p"]) < 4: d["p"].append([pos, glosses])
    for r in ru:
        if r not in d["r"] and len(d["r"]) < 4: d["r"].append(r)

words = {w: d for w, d in D.items() if (ZPHRASE if " " in w else ZMIN) <= z(w) <= ZMAX and w.count(" ") <= 2}
forms = {f: l for f, l in FORMS.items() if l in words and f not in words and not regular(f, l) and z(f) >= ZFORM}
pre = lambda w: re.sub(r"[^a-z]", "_", (w + "__")[:2])
chunks = {}
for w, d in words.items(): chunks.setdefault(pre(w), {"w": {}, "f": {}})["w"][w] = d
for f, l in forms.items(): chunks.setdefault(pre(f), {"w": {}, "f": {}})["f"][f] = l
blobs = {k: gzip.compress(json.dumps(v, ensure_ascii=False, separators=(",", ":")).encode("utf-8"), 9, mtime=0) for k, v in chunks.items()}
tag = hashlib.sha256(b"".join(blobs[k] for k in sorted(blobs))).hexdigest()[:12]
docs = sys.argv[1]; base = os.path.join(docs, "q", "dict")
if os.path.isdir(base): shutil.rmtree(base)   # the previous build goes away; the new one has a new name, so caches never mix them
os.makedirs(os.path.join(base, tag))
for k, b in blobs.items():
    with open(os.path.join(base, tag, k + ".json.gz"), "wb") as fh: fh.write(b)
meta = {"v": 2, "dir": f"q/dict/{tag}", "n": len(words), "parts": sorted(blobs), "src": "Wiktionary (English), CC BY-SA 4.0, via kaikki.org"}
with open(os.path.join(docs, "data", "dict.json"), "w") as fh: json.dump(meta, fh, ensure_ascii=False)
withru = sum(1 for d in words.values() if d["r"]); sizes = sorted(len(b) for b in blobs.values())
print(f"{len(words)} words ({withru} with Russian), {len(forms)} irregular forms, {len(blobs)} files, total {sum(sizes) / 1e6:.1f} MB, largest {sizes[-1] / 1e3:.0f} KB, median {sizes[len(sizes) // 2] / 1e3:.0f} KB → {meta['dir']}", file=sys.stderr)
