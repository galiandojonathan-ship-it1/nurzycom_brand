"""Bluebook practice-test catalog for the Score Details import (docs/bluebook-import.js).

Input: the open indexes of Bluebook practice tests (pdftotext -layout of the RW and/or Math PDFs; lines like
  "244 5fe53347  Reading & Writing ... Words in Context  1  SAT7 RW 1.1  D").
Each position (test, section, module 1/2/3, question) gives a College Board question ID. Module 2 is the easier
second module, 3 the harder one. Every ID is checked against the public SAT Suite Question Bank: the key must
match the index and the skill and difficulty come from the bank. Only metadata is kept: no question text.
A position whose index key is not among the bank's keys keeps both keys for routing and shows no skill (u: 1, x: 1).
Positions whose question is not in the public bank (the index writes «xyz000…») keep the index key for route detection,
with the index's own skill name in si (s: null, u: 1 = not verified by the bank); the import labels it «по открытому индексу».

Output JSON (seal it with tools/private/datafile.mjs into docs/data/bluebook.bin):
  { v: 2, built, items: { id: { k: [keys], s: skill, d: E|M|H } },
    tests: { "SAT7": { label, rw: { m1: [ids], m2e: [ids], m2h: [ids] }, math: {...} } } }

usage: python3 build_catalog.py out.json --rw rw.txt [--math math.txt] [--tests SAT4,SAT7]
"""
import argparse, json, re, sys, time
from concurrent.futures import ThreadPoolExecutor
from fractions import Fraction
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE = "https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/"
SKILL_OF = {}   # skill column of the index, used only for questions the bank does not have
SIZES = {"RW": 27, "M": 22}
LINE = re.compile(r"^\s*\d+\s+(?:([0-9a-z]{8})\s+)?((?:Reading & Writing|Math)\s.+?)\s+(?:([123])\s+)?(SAT\d+) (RW|M) ([123])\.(\d+)\s+(.+?)\s*$", re.M)


def request(path, body):
    req = Request(BASE + path, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    for attempt in range(4):
        try:
            with urlopen(req, timeout=20) as r:
                return json.load(r)
        except (URLError, TimeoutError) as e:
            if attempt == 3 or (isinstance(e, HTTPError) and e.code < 500 and e.code != 429):
                raise
            time.sleep(1 + attempt * 2)


def read_index(path, section, only):
    rows = {}
    for item_id, desc, _, test, sec, module, q, keys in LINE.findall(Path(path).read_text()):
        if sec != section or (only and test not in only):
            continue
        pos = (test, int(module), int(q))
        if pos in rows:
            raise SystemExit(f"duplicate position {pos}")
        item_id = item_id or f"{test}.{sec}.{module}.{q}"   # no ID in the index (newest tests): a position key
        rows[pos] = (item_id, [k.strip() for k in keys.split(",")])
        SKILL_OF[item_id] = re.split(r"\s{2,}", desc.strip())[-1]
    tests = sorted({t for t, _, _ in rows}, key=lambda t: int(t[3:]))
    for t in tests:
        want = {(t, m, q) for m in (1, 2, 3) for q in range(1, SIZES[section] + 1)}
        missing = want - set(rows)
        if missing:
            raise SystemExit(f"{t} {section}: {len(missing)} positions missing, e.g. {sorted(missing)[:3]}")
    return rows, tests


def norm(key):
    t = key.strip().replace("−", "-")
    if t in ("A", "B", "C", "D"):
        return t
    try:
        return Fraction(t)
    except (ValueError, ZeroDivisionError):
        return t


def check(record):
    item_id, bank = record
    if not bank:
        return item_id, None, "not in the public bank"
    try:
        item = request("get-question", {"external_id": bank["external_id"]})
    except Exception as e:  # network trouble: report, never guess
        return item_id, None, type(e).__name__
    keys = item.get("correct_answer")
    if item.get("externalid") != bank["external_id"] or not isinstance(keys, list) or not keys:
        return item_id, None, "no key in the bank"
    # metadata only: the question text and explanation are never kept
    return item_id, {"k": keys, "s": bank["skill_desc"], "d": bank.get("difficulty") or "M"}, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out", type=Path)
    ap.add_argument("--rw")
    ap.add_argument("--math")
    ap.add_argument("--tests", default="")
    a = ap.parse_args()
    only = set(filter(None, a.tests.split(",")))
    out = {"v": 2, "built": time.strftime("%Y-%m-%d"), "items": {}, "tests": {}}
    ok = True
    for section, test_code, domain, src in [("RW", 1, "INI,CAS,EOI,SEC", a.rw), ("M", 2, "H,P,Q,S", a.math)]:
        if not src:
            continue
        rows, tests = read_index(src, section, only)
        bank = {x["questionId"]: x for x in request("get-questions", {"asmtEventId": 99, "test": test_code, "domain": domain})}
        ids = list(dict.fromkeys(i for i, _ in rows.values()))
        with ThreadPoolExecutor(max_workers=6) as pool:
            checks = list(pool.map(check, ((i, bank.get(i)) for i in ids)))
        good = {i: v for i, v, err in checks if not err}
        listed = {i: k for i, k in rows.values()}
        absent = [i for i, _, err in checks if err == "not in the public bank"]
        for i in absent:   # placeholder IDs of the index: key from the index, no skill
            good[i] = {"k": listed[i], "s": None, "si": SKILL_OF.get(i), "d": None, "u": 1}
        for i, _, err in checks:
            if err and i not in good:
                print(f"FAIL {section} {i}: {err}")
        if absent:
            print(f"  {len(absent)} positions not in the public bank: index key kept for routing, no skill")
        # the index key must be one of the bank's accepted answers (the bank also lists decimal forms of a fraction: 59/9, 6.555, 6.556)
        diff, kept = [], 0
        for p, (i, listed) in rows.items():
            g = good.get(i)
            if not g or g.get("u"):
                continue
            if {norm(k) for k in listed} <= {norm(k) for k in g["k"]}:
                continue
            # a real disagreement (option order or a wrong index line): keep the test, accept both keys for routing, show no skill
            print(f"KEY MISMATCH {p} {i}: index {listed} vs bank {g['k']} → both kept for routing, skill hidden")
            good[i] = {"k": list(dict.fromkeys(listed + g["k"])), "s": None, "si": None, "d": g["d"], "u": 1, "x": 1}
            kept += 1
        diff = []
        print(f"{section}: tests {', '.join(tests)} · {len(rows)} positions · {len(good)}/{len(ids)} IDs verified · {len(diff)} key mismatches")
        bad_tests = {p[0] for p, _ in diff} | {t for (t, _, _), (i, _) in rows.items() if i not in good}
        if bad_tests:
            ok = False
            print(f"  left out (not verified): {', '.join(sorted(bad_tests))}")
        sec = "rw" if section == "RW" else "math"
        for t in tests:
            if t in bad_tests:
                continue
            entry = out["tests"].setdefault(t, {"label": f"SAT Practice Test {t[3:]}"})
            entry[sec] = {name: [rows[(t, m, q)][0] for q in range(1, SIZES[section] + 1)] for name, m in (("m1", 1), ("m2e", 2), ("m2h", 3))}
            for ids_ in entry[sec].values():
                for i in ids_:
                    out["items"][i] = good[i]
    a.out.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print(f"wrote {a.out}: {len(out['tests'])} tests, {len(out['items'])} items" + ("" if ok else " (some tests left out, see above)"))


if __name__ == "__main__":
    main()
