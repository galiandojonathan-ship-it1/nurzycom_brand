// synthetic Bluebook catalog (3 tests, SAT2 and SAT3 share module 1) for t_bbimport.js and mkfx.mjs: no real keys
const L = ["A", "B", "C", "D"], SZ = { rw: 27, math: 22 };
function synthetic() {   // 3 tests; T2 and T3 share module 1 (as real tests never do, to prove module 2 decides)
  const items = {}, tests = {}; let id = 0;
  const mk = (k) => { const i = "x" + (++id).toString(16).padStart(7, "0"); items[i] = { k, s: "Skill " + (id % 5), d: "M" }; return i; };
  const mod = (sec, seed) => Array.from({ length: SZ[sec] }, (_, q) => mk(sec === "math" && q === 7 ? (seed % 2 ? ["-3/2", "-1.5"] : [String(seed + 3)]) : [L[(q * 7 + seed * 3 + q * q) % 4]]));
  for (const [t, seed] of [["SAT1", 1], ["SAT2", 2], ["SAT3", 3]]) {
    tests[t] = { label: "SAT Practice Test " + t.slice(3) };
    for (const sec of ["rw", "math"]) tests[t][sec] = { m1: t === "SAT3" ? tests.SAT2[sec].m1 : mod(sec, seed), m2e: mod(sec, seed + 10), m2h: mod(sec, seed + 20) };
  }
  return { items, tests };
}
// a Score Details text for one test and routes, with planted misses
function tableOf(cat, test, routes, fmt = "tab", miss = []) {
  const out = [];
  for (const sec of ["rw", "math"]) {
    const s = cat.tests[test][sec]; if (!s) continue;
    [s.m1, s[routes[sec]]].forEach((ids, m) => ids.forEach((id, q) => {
      const k = cat.items[id].k, key = `${sec}.${m + 1}.${q + 1}`, isMiss = miss.includes(key), omit = miss.includes(key + "o");
      const wrong = /^[A-D]$/.test(k[0]) ? L.find((x) => !k.includes(x)) : "999";
      const mine = omit ? "—; Omitted" : isMiss ? `${wrong}; Incorrect` : `${k[0]}; Correct`;
      const label = sec === "rw" ? "Reading and Writing" : "Math";
      out.push(fmt === "lines" ? `${q + 1}\n${label}\n${k.join(", ")}\n${mine}\nReview` : fmt === "md" ? `${q + 1}\t${label}\t\\\n${k.join(", ")}\\\n${mine}\\\n\\`
        : fmt === "nbsp" ? `${q + 1} \t${label}\t${k.join(", ")}\t${mine.replace(" ", " ")}\tReview` : `${q + 1}\t${label}\t${k.join(", ")}\t${mine}\tReview`);
    }));
  }
  return out.join(fmt === "lines" ? "\n" : "\r\n");
}
module.exports = { synthetic, tableOf, L, SZ };
