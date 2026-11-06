"""Finds words in every mock question that a Russian-speaking B2 student would likely not know.
Reads ./private/{mocks,bundles,vocab}.json (decrypted by extract.js). Writes:
  private/cands.tsv   one line per candidate lemma: score, zipf, uses, flags, two contexts  (for the human pass)
  private/qcands.json per question: candidates in reading order with location (passage / question / option)
Run: python3 -I hardwords.py <dir with private/>"""
import json, re, sys, html
from collections import defaultdict
from wordfreq import zipf_frequency
from lemminflect import getAllLemmas
from cefrpy import CEFRAnalyzer
CEFR = CEFRAnalyzer()
def level(w):   # 1 = A1 … 6 = C2, None when the word is not in the list
    try: return CEFR.get_average_word_level_float(w)
    except Exception: return None

import os
D = (os.environ.get("PRIV") or sys.argv[1] + "/private").rstrip("/") + "/"
mocks = json.load(open(D + "mocks.json")); bundles = json.load(open(D + "bundles.json")); vocab = json.load(open(D + "vocab.json"))

KNOWN = 4.0        # Zipf ≥ 4.0 (more than about 10 per million words): a B2 learner has very likely met it
SKIP_GROUPS = {"Местоимения", "Формы глаголов", "Короткие слова", "Старые значения"}
course = set()
for l in vocab["lessons"]:
    if l["tag"][0] != "V": continue
    for g in l["groups"]:
        if g["name"] in SKIP_GROUPS: continue
        for it in g["items"]:
            for v in re.split(r"\s*[/;,]\s*", re.sub(r"\([^)]*\)", " ", it["en"].lower())):
                v = re.sub(r"^to\s+", "", v).strip()
                if v: course.add(v); course.add(v.split(" ")[0])   # a phrase such as «devoid of» covers «devoid» too
mathterms = set()
for l in vocab["lessons"]:
    if l["tag"][0] == "M":
        for g in l["groups"]:
            for it in g["items"]: mathterms.update(w for w in re.findall(r"[a-z]+", it["en"].lower()) if len(w) > 3)

# shared Latin/Greek words a Russian speaker recognises (гипотеза, демократия): a hint for the human pass, not a filter
INTL = re.compile(r"(olog(y|ical|ist)|graph(y|ic|er)|metr(y|ic)|ism$|ist$|ization$|iz(e|ation)$|^(bio|geo|hydro|thermo|electro|micro|macro|photo|tele|psycho|socio|neuro|eco|astro|chrono|anti|auto|proto)|(ic|ical)$|tion$|ura$|ium$|um$|us$)")
# common words whose SAT sense a B2 learner usually does not know: flagged with context for the human pass
RARE_SENSE = {"novel", "check", "table", "qualify", "qualified", "appreciate", "sanction", "champion", "plastic", "arrest", "temper",
  "tempered", "conceit", "address", "betray", "wanting", "pedestrian", "discriminating", "realize", "compromise", "concede", "grave",
  "sound", "fast", "bear", "hold", "court", "harbor", "exact", "flag", "flagging", "mean", "measured", "occasion", "project", "reflect",
  "relative", "spare", "static", "stem", "strike", "subject", "temperate", "uniform", "yield", "assume", "discount", "cultivate",
  "entertain", "foster", "chart", "pore", "rank", "sanguine", "submit", "account", "afford", "bolster", "capital", "constitution",
  "content", "credit", "deliberate", "economy", "engaging", "fine", "grant", "intimate", "issue", "lean", "means", "objective",
  "patent", "peer", "quarter", "raise", "reservation", "retiring", "school", "settle", "sport", "suit", "tender", "trying", "want"}
# phrases and phrasal verbs that B2 learners often misread (matched as written, any form of the first word)
PHRASES = ["give rise to", "account for", "at odds with", "in lieu of", "bring about", "by and large", "hinge on", "hinges on",
  "contingent on", "contingent upon", "stem from", "rule out", "fall short", "set forth", "on the grounds that", "in the wake of",
  "come to terms with", "draw on", "draw upon", "shed light on", "take for granted", "to the extent that", "lay out", "bear on",
  "bear out", "call into question", "carry over", "cast doubt on", "come about", "do away with", "fend off", "give way to",
  "in light of", "in turn", "lend itself to", "lend credence to", "make do", "of necessity", "on the whole", "owing to",
  "play down", "point to", "pore over", "prior to", "rather than", "run counter to", "set off", "set out", "stand to", "stave off",
  "take hold", "take issue with", "turn out", "ward off", "weigh in", "with regard to", "at the expense of", "in the face of",
  "by virtue of", "for the sake of", "in keeping with", "on behalf of", "be wary of", "to no avail", "at the outset", "in vain"]
PH = [(p, p.split(" ")) for p in PHRASES]

def lemmas(w):
    return {w} | {l for ls in getAllLemmas(w).values() for l in ls}
# a derived word a B2 learner can build from a known base: invent → inventor, kind → kindness, usual → unusual
SUF = ["ers", "er", "ors", "or", "ness", "ment", "ments", "ity", "ities", "able", "ible", "ful", "less", "ly", "ally", "ion", "ions",
       "ation", "ations", "ive", "ively", "ist", "ists", "ize", "ized", "ing", "ings", "ed", "al", "ally", "ance", "ence", "ant", "ent"]
PRE = ["un", "re", "in", "im", "dis", "non", "over", "under", "pre", "mis", "co", "inter", "self-"]
def from_known(w):
    for s in SUF:
        if w.endswith(s) and len(w) - len(s) >= 4:
            b = w[: -len(s)]
            for c in (b, b + "e", b[:-1] if len(b) > 4 and b[-1] == b[-2] else b, b[:-1] + "y" if b.endswith("i") else b):
                if zipf_frequency(c, "en") >= KNOWN + 0.3: return c
    for p in PRE:
        if w.startswith(p) and len(w) - len(p) >= 4 and zipf_frequency(w[len(p):], "en") >= KNOWN + 0.3: return w[len(p):]
    return None
def lemma(w):
    best = w
    for pos, ls in getAllLemmas(w).items():
        for l in ls:
            if zipf_frequency(l, "en") > zipf_frequency(best, "en"): best = l
    return best

def text(h):
    h = re.sub(r"<(math|svg)[\s\S]*?</\1>", " ", h or "")
    return html.unescape(re.sub(r"<[^>]+>", " ", h))

WORD = re.compile(r"[A-Za-z][A-Za-z'’]*(?:-[A-Za-z]+)*")
lex = defaultdict(lambda: {"n": 0, "q": set(), "ctx": [], "flags": set(), "z": 0, "forms": set()})
qout = {}
for m in mocks["mocks"]:
    for s in m["sections"]:
        for mod, qs in bundles[s["b"]]["mods"].items():
            for q in qs:
                key = f'{m["id"]}.{s["k"]}.{mod}.{q["n"]}'
                parts = [("passage", q.get("stim") or "")] if s["k"] == "rw" else [("question", q.get("stim") or "")]
                parts += [("question", q.get("stem") or "")] + [("option", o) for o in (q.get("opts") or [])]
                found = []
                for loc, h in parts:
                    t = text(h); low = t.lower()
                    for p, toks in PH:
                        for mm in re.finditer(r"\b" + r"\w*\s+".join(map(re.escape, toks)) + r"\b", low):
                            found.append({"lemma": p, "surface": t[mm.start():mm.end()], "loc": loc, "z": 0, "flags": ["phrase"]})
                    for mm in WORD.finditer(t):
                        w = mm.group(0).replace("’", "'"); lw = re.sub(r"'s$", "", w.lower())
                        if len(lw) < 4 or "'" in lw: continue
                        before = t[:mm.start()].rstrip()
                        if w[0].isupper() and before and before[-1] not in ".!?:\"“(—" and not re.match(r"^[A-Z]+$", w): continue   # a name
                        lm = lemma(lw) if "-" not in lw else lw
                        z = max(zipf_frequency(lw, "en"), zipf_frequency(lm, "en"))
                        flags = []
                        lv = min([x for x in (level(lw), level(lm)) if x] or [None]) if (level(lw) or level(lm)) else None
                        if lm in RARE_SENSE or lw in RARE_SENSE: flags.append("sense")
                        elif lv is not None and lv < 4.5 and z >= 3.5: continue        # B2 or lower and not rare: a B2 learner knows it
                        elif lv is None and z >= KNOWN: continue
                        if lv: flags.append("C2" if lv >= 5.5 else "C1" if lv >= 4.5 else "B2-")
                        if z == 0: flags.append("unknown-to-wordfreq")
                        if lemmas(lw) & course: continue                    # the course vocabulary already underlines it
                        if s["k"] == "math" and (lemmas(lw) & mathterms): continue   # Math terms are taught in the Math course
                        if "sense" not in flags and from_known(lw): continue
                        if INTL.search(lm): flags.append("cognate?")
                        found.append({"lemma": lm, "surface": w, "loc": loc, "z": z, "flags": flags})
                seen, uniq = set(), []
                for f in found:
                    if f["lemma"] in seen: continue
                    seen.add(f["lemma"]); uniq.append(f)
                    e = lex[f["lemma"]]; e["n"] += 1; e["q"].add(key); e["z"] = f["z"]; e["flags"] |= set(f["flags"]); e["forms"].add(f["surface"].lower())
                    if len(e["ctx"]) < 2:
                        t = text(" ".join(h for _, h in parts)); i = t.lower().find(f["surface"].lower())
                        e["ctx"].append(re.sub(r"\s+", " ", t[max(0, i - 70): i + len(f["surface"]) + 70]).strip())
                qout[key] = {"own": bool(q.get("own")), "d": q.get("d"), "sk": q.get("sk"), "sec": s["k"], "cands": uniq}

json.dump(qout, open(D + "qcands.json", "w"), ensure_ascii=False, indent=0)
rows = sorted(lex.items(), key=lambda kv: (kv[1]["z"] if "phrase" not in kv[1]["flags"] else 3.5, kv[0]))
with open(D + "cands.tsv", "w") as f:
    f.write("lemma\tzipf\tuses\tflags\tforms\tcontext1\tcontext2\n")
    for k, e in rows:
        f.write("\t".join([k, f'{e["z"]:.2f}', str(len(e["q"])), ",".join(sorted(e["flags"])), ",".join(sorted(e["forms"]))] + (e["ctx"] + ["", ""])[:2]) + "\n")
nq = len(qout); withc = sum(1 for v in qout.values() if v["cands"])
print(f"questions {nq} · with at least one candidate {withc} · distinct candidates {len(lex)}"
      f" (sense {sum('sense' in e['flags'] for e in lex.values())}, phrase {sum('phrase' in e['flags'] for e in lex.values())},"
      f" cognate? {sum('cognate?' in e['flags'] for e in lex.values())})")
