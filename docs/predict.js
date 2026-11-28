/* «Ориентир на SAT» (Nurassyl, 2026-11-23: «примерно predict the possible score based on the analysis»).
   A range, never a single number and never a promise (hard rules 2 and 6): it is read only from full practice-test sections
   (the site's practice tests and the student's shared Bluebook tests), converted with the nurzycom table (scale.js), newer
   tests weigh more (half-weight after 45 days), Bluebook a little more than the site's own tests. The half-width is the spread
   of those tests, at least ±40, wider with one test or with old tests. Pure function, also loaded by the tests in node. */
(function (root) {
  const DAY = 864e5, HALF = 45, R10 = (x) => Math.round(x / 10) * 10, clamp = (x) => Math.max(200, Math.min(800, x));
  // tests: [{ t, sec: "rw"|"math", score, src: "mock"|"bb", label }]
  function estimate(tests, now = Date.now()) {
    const out = { sections: {}, total: null, n: 0 };
    for (const sec of ["rw", "math"]) {
      const L = tests.filter((x) => x.sec === sec && x.score >= 200 && x.score <= 800 && x.t).sort((a, b) => a.t - b.t);
      if (!L.length) continue;
      const w = L.map((x) => Math.pow(0.5, Math.max(0, now - x.t) / DAY / HALF) * (x.src === "bb" ? 1.25 : 1));
      const W = w.reduce((a, b) => a + b, 0), mu = L.reduce((a, x, i) => a + w[i] * x.score, 0) / W;
      const sd = Math.sqrt(L.reduce((a, x, i) => a + w[i] * (x.score - mu) ** 2, 0) / W);
      const age = (now - L[L.length - 1].t) / DAY;
      let half = Math.max(40, sd);
      if (L.length === 1) half = Math.max(half, 60);
      if (age > 60) half += 20;
      if (age > 180) half += 30;
      half = R10(Math.min(half, 120));
      const mid = clamp(R10(mu)), lo = clamp(mid - half), hi = clamp(mid + half);
      const last = L[L.length - 1], first = L[0];
      out.sections[sec] = { mid, lo, hi, n: L.length, last: last.t, ageDays: Math.round(age), trend: L.length >= 2 ? last.score - first.score : null,
        bb: L.filter((x) => x.src === "bb").length, mock: L.filter((x) => x.src === "mock").length, weak: L.length === 1 || age > 60 };
      out.n += L.length;
    }
    const S = out.sections;
    if (S.rw && S.math) {
      const mid = S.rw.mid + S.math.mid, half = R10(Math.sqrt(((S.rw.hi - S.rw.lo) / 2) ** 2 + ((S.math.hi - S.math.lo) / 2) ** 2));
      out.total = { mid, lo: Math.max(400, mid - half), hi: Math.min(1600, mid + half) };
    }
    return out;
  }
  // the student's sections from the form rows (site practice tests) and shared Bluebook records
  function collect(rows, shares, scale) {
    const out = [];
    for (const r of rows || []) {
      if (r.kind !== "P" || !scale || /M2 фиксированный/.test(r.part)) continue;
      const sec = /Math/.test(r.lesson) ? "math" : "rw";
      if (r.mock?.skipped.size || r.answers?.length && r.answers.filter((a) => !a.tries.length).length > r.answers.length / 2) continue;   // abandoned
      out.push({ t: +r.ts, sec, score: scale.section(sec, /M2 сложный/.test(r.part), r.a), src: "mock", label: r.lesson.split("·")[0] });
    }
    for (const d of shares || []) {
      for (const [sec, x] of Object.entries(d.sections || {})) {
        if (!scale || !x.tot || (x.skip && (x.skip[0] || x.skip[1]))) continue;
        const raw = x.tot[0] + x.tot[1], hard = x.route ? x.route === "m2h" : x.tot[0] >= (sec === "rw" ? 15 : 13);
        out.push({ t: d.taken || d.at, sec, score: scale.section(sec, hard, raw), src: "bb", label: x.label || d.title || "Bluebook" });
      }
    }
    return out;
  }
  const api = { estimate, collect };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.PREDICT = api;
})(typeof window !== "undefined" ? window : globalThis);
