// «Ориентир на SAT» (docs/predict.js): range from practice-test sections. usage: node t_predict.mjs
import { createRequire } from "node:module"; const require = createRequire(import.meta.url);
const P = require("../../docs/predict.js"); globalThis.window = globalThis; require("../../docs/scale.js"); const SC = globalThis.SATSCALE;
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const D = 864e5, now = Date.UTC(2026, 10, 23);
const one = P.estimate([{ t: now - 5 * D, sec: "rw", score: 650, src: "bb" }], now);
ok(one.sections.rw.lo === 590 && one.sections.rw.hi === 710 && !one.total, "one fresh test: ±60, no total without Math: " + JSON.stringify(one.sections.rw));
const T = [[200, "rw", 560, "mock"], [90, "rw", 620, "bb"], [10, "rw", 680, "bb"], [200, "math", 600, "mock"], [10, "math", 640, "bb"]].map(([d, sec, score, src]) => ({ t: now - d * D, sec, score, src }));
const e = P.estimate(T, now);
ok(e.sections.rw.mid > 640 && e.sections.rw.mid < 680, "newer tests weigh more: RW mid " + e.sections.rw.mid);
ok(e.total && e.total.lo < e.sections.rw.mid + e.sections.math.mid && e.total.hi > e.sections.rw.mid + e.sections.math.mid && e.total.lo % 10 === 0, "total is a range around the sum: " + JSON.stringify(e.total));
ok(e.sections.rw.trend === 120, "trend from the first to the last test: +120");
const old = P.estimate([{ t: now - 200 * D, sec: "math", score: 600, src: "mock" }], now);
ok(old.sections.math.hi - old.sections.math.lo >= 220 && old.sections.math.weak, "one old test: a wide range marked «мало свежих данных»");
// collect: site practice-test rows and Bluebook shares (a skipped section is left out; route read from the record)
const rows = [{ kind: "P", lesson: "PT2·RW", part: "RW · M1 20/27 · M2 сложный 22/27", a: 42, ts: now - D, answers: [] }, { kind: "V", lesson: "V01" }];
const shares = [{ taken: now - 3 * D, sections: { rw: { tot: [25, 24], route: "m2h", label: "SAT Practice Test 4", n: 54 }, math: { tot: [1, 0], skip: [1, 1], n: 44 } } }];
const c = P.collect(rows, shares, SC);
ok(c.length === 2 && c[0].score === SC.section("rw", true, 42) && c[1].src === "bb" && c[1].score === SC.section("rw", true, 49), "collect: one site section, one Bluebook section, the skipped Math is left out");
console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
