"""Builds private/mockgloss.json for the site from the human decisions.
  private/lex.json    { lemma: { keep: true/false, w, pos, en, ru: [..], sense: { qkey: "lemma#2" }, only: [qkey, ..] } }  (from the cands.tsv pass)
  private/senses.json { "lemma#2": { w, pos, en, ru } }  other senses of a word, used where lex says so
  private/course.json { course key: { en, ru: [..] } }       completions of course-vocabulary cards (weak.json from analyze.js)
Per question: at most MAX extra words, words in the question and options first, then the rarest.
Run: python3 -I build_gloss.py <dir>"""
import json, sys
import os
D = (os.environ.get("PRIV") or sys.argv[1] + "/private").rstrip("/") + "/"
q = json.load(open(D + "qcands.json")); lex = json.load(open(D + "lex.json"))
senses = json.load(open(D + "senses.json")) if __import__("os").path.exists(D + "senses.json") else {}
course = json.load(open(D + "course.json")) if __import__("os").path.exists(D + "course.json") else {}
MAX = 4
words, add, problems = {}, {}, []
for k, e in course.items():
    if not e.get("en") or len(e.get("ru", [])) < 2: problems.append(f"course card incomplete: {k}")
    words[k] = {"en": e["en"], "ru": e["ru"], **({"pos": e["pos"]} if e.get("pos") else {})}
for key, v in q.items():
    picks = []
    for c in v["cands"]:
        e = lex.get(c["lemma"])
        if not e or not e.get("keep"): continue
        if e.get("only") and key not in e["only"]: continue      # a rare sense: only in the questions where it is used that way
        wk = (e.get("sense") or {}).get(key, c["lemma"])
        src = senses[wk] if wk in senses else e
        if not src.get("en") or len(src.get("ru", [])) < 2: problems.append(f"card incomplete: {wk}"); continue
        ent = words.setdefault(wk, {"w": src.get("w") or c["lemma"], "pos": src.get("pos", ""), "en": src["en"], "ru": src["ru"], "forms": []})
        if c["surface"].lower() not in ent["forms"]: ent["forms"].append(c["surface"].lower())
        picks.append((0 if c["loc"] != "passage" else 1, c["z"] or 0, wk))
    picks.sort()
    if picks: add[key] = [p[2] for p in picks[:MAX]]
json.dump({"v": 1, "words": words, "add": add}, open(D + "mockgloss.json", "w"), ensure_ascii=False)
rw = [k for k, v in q.items() if v["sec"] == "rw"]
print(f"words {len(words)} · questions with extra words {len(add)} of {len(q)} (rw {sum(k in add for k in rw)} of {len(rw)})")
for p in sorted(set(problems))[:30]: print("  !", p)
