"""Text fingerprints of the Bluebook catalog questions, to find the same questions inside the course (link_course.mjs).
Reads the catalog JSON from build_catalog.py, fetches each verified item from the public SAT Suite Question Bank and keeps only
hashes: sha1 of the normalised stimulus+stem, and of stimulus+stem+options. No question text is written.
Normalisation (must match link_course.mjs): HTML tags → space, entities removed, lower case, only a–z and 0–9 kept.
usage: python3 fingerprints.py catalog.json bank_rw.json [bank_math.json] out_fp.json"""
import hashlib, json, re, sys, time
from concurrent.futures import ThreadPoolExecutor
from urllib.error import URLError
from urllib.request import Request, urlopen

BASE = "https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/"


def norm(html):
    t = re.sub(r"<[^>]+>", " ", html or "")
    t = re.sub(r"&[a-zA-Z0-9#]+;", "", t).lower()
    return re.sub(r"[^a-z0-9]+", "", t)


def fps(stim, stem, opts):
    a = norm(stim) + "|" + norm(stem)
    return [hashlib.sha1(a.encode()).hexdigest()[:16], hashlib.sha1((a + "|" + "|".join(norm(o) for o in opts)).encode()).hexdigest()[:16]]


def get(ext):
    req = Request(BASE + "get-question", data=json.dumps({"external_id": ext}).encode(), headers={"Content-Type": "application/json"})
    for i in range(4):
        try:
            with urlopen(req, timeout=20) as r:
                return json.load(r)
        except (URLError, TimeoutError):
            time.sleep(1 + 2 * i)
    return None


def main():
    cat = json.load(open(sys.argv[1]))
    bank = {}
    for p in sys.argv[2:-1]:
        bank.update({x["questionId"]: x for x in json.load(open(p))})
    ids = [i for i, it in cat["items"].items() if not it.get("u") and i in bank]

    def one(i):
        q = get(bank[i]["external_id"])
        if not q:
            return i, None
        return i, fps(q.get("stimulus"), q.get("stem"), [o.get("content", "") for o in (q.get("answerOptions") or [])])
    with ThreadPoolExecutor(max_workers=6) as pool:
        out = dict(r for r in pool.map(one, ids) if r[1])
    json.dump(out, open(sys.argv[-1], "w"))
    print(f"{len(out)}/{len(ids)} fingerprints → {sys.argv[-1]}")


if __name__ == "__main__":
    main()
