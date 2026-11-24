#!/usr/bin/env python3
"""nurzycom bank checker (Codex copy of Claude's tools.py; keep the two in step). Codex needs only: python3 tools/bank/check.py check <set.json>
usage:
  python3 tools.py check  sets/<sub>-<n>.json        → prints problems, writes sets/<sub>-<n>.blind.json
  python3 tools.py merge  sets/<sub>-<n>.json        → reads sets/<sub>-<n>.verdict.json, appends accepted to bank/<sub>.json
  python3 tools.py stats                              → counts per subtopic
"""
import json, re, sys, os, glob, collections, subprocess
ROOT = os.path.dirname(os.path.abspath(__file__))
SKILL = json.load(open(os.path.join(ROOT, "skill_of.json")))
RW = {k for k, v in SKILL.items() if not k.startswith(("alg", "adv", "psda", "geo"))}
BAN = re.compile(r"kazakh|qazaq|kyrgyz|kirghiz|almaty|astana|bishkek|nur-?sultan|central asia|uzbek|tajik|turkmen|russia|moscow|soviet|"
                 r"казах|кыргыз|киргиз|алматы|астана|бишкек|росси|советск", re.I)
TRAPS = {"too_strong", "off_topic", "reversed", "half_right", "scope", "unsupported", "wrong_relation", "wrong_sense", "goal_miss",
         "sounds_right", "wordy", "sign_error", "step_short", "wrong_quantity", "operation", "misread", "other"}
words = lambda s: len(re.findall(r"[A-Za-z0-9'’-]+", s or ""))
norm = lambda s: re.sub(r"[^a-z0-9 ]+", " ", (s or "").lower()).split()

STD = re.compile(r"while researching a topic, a student has taken the following notes:|text 1|text 2", re.I)   # standard SAT wording
def shingles(t, n=8):
    w = norm(STD.sub(" ", t or "")); return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}

def bank_shingles(exclude_sub=None):
    out = set()
    for f in glob.glob(os.path.join(ROOT, "bank/*.json")):
        for q in json.load(open(f)):
            out |= shingles(q.get("passage", "") if q.get("sec") == "rw" else q.get("passage", "") + " " + q.get("stem", ""))
    return out

RUNNER = """
import ast, sys
src = sys.stdin.read(); tree = ast.parse(src); g = {}
last = tree.body.pop() if tree.body and isinstance(tree.body[-1], ast.Expr) else None
exec(compile(tree, "<check>", "exec"), g)
print(eval(compile(ast.Expression(last.value), "<check>", "eval"), g) if last else g.get("ans", g.get("result", "ERR no value")))
"""
def run_check(code):
    try:
        r = subprocess.run([sys.executable, "-c", RUNNER], input=code, capture_output=True, text=True, timeout=60)
        return r.stdout.strip().splitlines()[-1] if r.stdout.strip() else "ERR " + r.stderr.strip()[-200:]
    except Exception as e:
        return "ERR " + str(e)

def num(s):
    s = str(s).replace("−", "-").replace(",", "").replace("$", "").replace("%", "").strip()
    try:
        from sympy import sympify, N
        return float(N(sympify(s.replace("^", "**").replace("√", "sqrt").replace("π", "pi"))))
    except Exception:
        return None

def check(path):
    d = json.load(open(path)); P = []; sub = d.get("sub"); qs = d.get("questions", [])
    if sub not in SKILL: P.append(f"unknown sub {sub}")
    if len(qs) != 10: P.append(f"{len(qs)} questions, need 10")
    if sum(1 for q in qs if q.get("kind") == "control") < 3: P.append("fewer than 3 control")
    if not any(q.get("hard") for q in qs): P.append("no hard:true question")
    keys = collections.Counter(q.get("key") for q in qs if q.get("type", "mc") == "mc")
    if keys and max(keys.values()) > 4: P.append(f"key letters unbalanced {dict(keys)}")
    seen = bank_shingles(); mine = set()
    for q in qs:
        n = q.get("n"); t = f"q{n}"; body = (q.get("passage", "") + " " + q.get("stem", "") + " " + " ".join(q.get("options", [])))
        if BAN.search(body + " " + q.get("explanation_ru", "")): P.append(f"{t}: banned region/theme")
        if q.get("level") not in ("E", "M", "H"): P.append(f"{t}: level")
        if q.get("kind") not in ("target", "control"): P.append(f"{t}: kind")
        if q.get("kind") == "control" and not q.get("ctrl_note"): P.append(f"{t}: control without ctrl_note")
        if not q.get("stem"): P.append(f"{t}: no stem")
        if len(q.get("explanation_ru", "")) < 80: P.append(f"{t}: explanation too short")
        if not q.get("trap_ru"): P.append(f"{t}: no trap_ru")
        typ = q.get("type", "mc")
        if typ == "mc":
            o = q.get("options", [])
            if len(o) != 4 or len({re.sub(r"\s+", " ", x.strip().lower()) for x in o}) != 4: P.append(f"{t}: options not 4 distinct")
            if q.get("key") not in ("A", "B", "C", "D"): P.append(f"{t}: key")
            tr = q.get("traps", {})
            if set(tr) != {"ABCD"[i] for i in range(4)} - {q.get("key")} or not set(tr.values()) <= TRAPS: P.append(f"{t}: traps {tr}")
        elif typ == "spr":
            if not q.get("accept"): P.append(f"{t}: spr without accept")
        else: P.append(f"{t}: type")
        if sub in RW:
            wc = words(q.get("passage", "")); lv = q.get("level")
            lo = ({"E": 30, "M": 45, "H": 60} if sub[:2] in ("b_", "f_", "t_") else {"E": 35, "M": 60, "H": 90}).get(lv, 35)   # grammar/transition passages are short on the real SAT
            if wc < lo and "•" not in q.get("passage", ""): P.append(f"{t}: passage {wc} words, short for {lv}")
            if wc > 260: P.append(f"{t}: passage {wc} words, too long")
            if not q.get("words"): P.append(f"{t}: no vocabulary")
            for w in q.get("words", []):
                if w.get("w") and w["w"].lower() not in (q.get("passage", "") + " " + q.get("stem", "")).lower(): P.append(f"{t}: word «{w['w']}» not in passage/stem")
                if not (w.get("def") and w.get("ru")): P.append(f"{t}: word card incomplete {w.get('w')}")
        else:
            c = q.get("check")
            if not c: P.append(f"{t}: math without check")
            else:
                v = run_check(c); q["_check"] = v
                if v.startswith("ERR"): P.append(f"{t}: check error {v}")
                else:
                    want = q.get("key") if typ == "spr" else (q.get("options", ["", "", "", ""])["ABCD".index(q["key"])] if q.get("key") in "ABCD" else None)
                    if v.strip() in ("A", "B", "C", "D"):
                        if typ == "mc" and v.strip() != q.get("key"): P.append(f"{t}: check gives {v}, key {q.get('key')}")
                    else:
                        a, b = num(v), num(want)
                        acc = [num(x) for x in q.get("accept", [])] if typ == "spr" else []
                        if a is None or (b is None and not acc) or (abs(a - (b if b is not None else acc[0] or 0)) > 1e-6 * max(1, abs(a)) and not any(x is not None and abs(a - x) < 1e-6 * max(1, abs(a)) for x in acc)):
                            P.append(f"{t}: check {v} ≠ key {want}")
        sh = shingles(q.get("passage", "") if sub in RW else q.get("passage", "") + " " + q.get("stem", ""))   # RW stems are standard SAT wording
        if len(sh & seen) > 3: P.append(f"{t}: near-duplicate of a bank question")
        if len(sh & mine) > (3 if sub in RW else 12): P.append(f"{t}: near-duplicate inside the set")
        mine |= sh
    blind = {"sub": sub, "questions": [{k: q.get(k) for k in ("n", "skill", "passage", "stem", "type", "options")} for q in qs]}
    json.dump(blind, open(path.replace(".json", ".blind.json"), "w"), ensure_ascii=False, indent=1)
    json.dump(d, open(path, "w"), ensure_ascii=False, indent=1)
    return P

def merge(path):
    d = json.load(open(path)); v = json.load(open(path.replace(".json", ".verdict.json")))
    V = {x["n"]: x for x in v.get("items", [])}; sub = d["sub"]; probs = check(path)
    bad_n = {int(m.group(1)) for p in probs for m in [re.match(r"q(\d+):", p)] if m}
    set_level = [p for p in probs if not p.startswith("q")]
    bf = os.path.join(ROOT, f"bank/{sub}.json"); bank = json.load(open(bf)) if os.path.exists(bf) else []
    acc, rej = [], []
    for q in d["questions"]:
        x = V.get(q["n"], {}); ans = str(x.get("answer", "")).strip()
        ok_key = ans == q["key"] if q.get("type", "mc") == "mc" else (num(ans) is not None and any(num(a) is not None and abs(num(a) - num(ans)) < 1e-6 for a in q.get("accept", [q["key"]])))
        why = []
        if q["n"] in bad_n: why.append("validator")
        if not ok_key: why.append(f"blind answer {ans or '—'} ≠ key {q['key']}")
        if x.get("sound") is not True: why.append("not sound: " + str(x.get("issue", ""))[:160])
        if x.get("fact_issue"): why.append("fact: " + str(x["fact_issue"])[:160])
        if why: rej.append((q["n"], "; ".join(why))); continue
        q = {k: v for k, v in q.items() if not k.startswith("_")}
        q["id"] = f"NB-{sub}-{len(bank) + len(acc) + 1:03d}"; q["sub"] = sub; q["sec"] = "rw" if sub in RW else "math"; q["set"] = d.get("set")
        q["verified"] = {"blind": ans, "level_seen": x.get("level"), "hard_seen": x.get("hard_ok"), "level_writer": q.get("level")}
        R = {"E": 0, "M": 1, "H": 2}
        if x.get("level") in R and R[x["level"]] < R.get(q.get("level"), 1): q["level"] = x["level"]   # the lower of the two ratings
        q["hard"] = x.get("hard_ok") is True   # «очень сложный» = the blind solver puts it among the hardest of a hard module 2
        acc.append(q)
    json.dump(bank + acc, open(bf, "w"), ensure_ascii=False, indent=1)
    log = {"set": os.path.basename(path), "accepted": len(acc), "rejected": rej, "set_problems": set_level}
    with open(os.path.join(ROOT, "log.jsonl"), "a") as f: f.write(json.dumps(log, ensure_ascii=False) + "\n")
    print(json.dumps(log, ensure_ascii=False))

def stats():
    c = {}
    for f in sorted(glob.glob(os.path.join(ROOT, "bank/*.json"))):
        b = json.load(open(f)); c[os.path.basename(f)[:-5]] = (len(b), sum(1 for q in b if q.get("hard")), sum(1 for q in b if q.get("kind") == "control"))
    tot = sum(x[0] for x in c.values()); print(f"total {tot} in {len(c)} subtopics"); [print(k, *v) for k, v in c.items()]

if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "bank"), exist_ok=True)
    cmd = sys.argv[1]
    if cmd == "check": p = check(sys.argv[2]); print("\n".join(p) if p else "OK")
    elif cmd == "merge": merge(sys.argv[2])
    elif cmd == "stats": stats()
