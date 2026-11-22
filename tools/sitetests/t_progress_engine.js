// «Прогресс ученика»: the index engine (docs/progress.js) on synthetic students. usage: node tools/sitetests/t_progress_engine.js
const P = require("../../docs/progress.js"), assert = require("assert");
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log("PASS " + m); };
const sigm = (z) => 1 / (1 + Math.exp(-z)), Bd = { E: -1.2, M: 0, H: 1.2 }, model = (th, lv) => 0.25 + 0.75 * sigm(th - Bd[lv]);
const DAY = 864e5, T0 = Date.UTC(2026, 9, 1), NOW = T0 + 56 * DAY;
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const RW = ["b_splice", "f_sv_agree", "t_contrast", "wic_precise", "ci_main", "inf_complete", "coe_quant", "ts_function"];
const tags = {}; let qid = 0;
const mkQ = (k, level) => { const id = "Q" + (++qid); tags[id] = { p: k, s: [], t: { A: "too_strong", B: "off_topic", C: "reversed" } }; return { id, level }; };
const bank = []; for (const k of RW) for (const lv of ["E", "M", "H"]) for (let i = 0; i < 6; i++) bank.push({ ...mkQ(k, lv), k });
// a student who answers with probability pRight(k, t) in weekly homework parts of 12 questions
function student(pRight, ctx = () => "hw") {
  const obs = []; let part = 0;
  for (let w = 0; w < 8; w++) for (let s = 0; s < 3; s++) {
    part++; const t = T0 + (w * 7 + s * 2) * DAY;
    for (let j = 0; j < 12; j++) { const b0 = bank[Math.floor(rnd() * bank.length)], q = { ...mkQ(b0.k, b0.level), k: b0.k }, x = rnd() < pRight(q.k, w, q.level) ? 1 : 0;
      obs.push({ id: q.id, t, x, sec: "rw", level: q.level, type: "mc", ctx: ctx(w, s), part: "p" + part, attempt: 1, chosen: x ? "D" : "ABC"[Math.floor(rnd() * 3)], second: x ? null : (rnd() < 0.5 ? 1 : 0), secs: 70 }); }
  }
  return P.compute(obs, tags, { now: NOW });
}
const guess = student(() => 0.25, () => "learn");
const last = (r) => r.snaps[r.snaps.length - 1];
ok(last(guess).parts.M < 25, `guesser: mastery near zero (${last(guess).parts.M.toFixed(1)})`);
ok(last(guess).index < 40, `guesser: index low (${last(guess).index})`);
const strong = student((k, w, lv) => model(2.5, lv));
ok(last(strong).parts.M > 70, `strong student: mastery high (${last(strong).parts.M.toFixed(1)})`);
ok(last(strong).index > last(guess).index + 30, `strong ${last(strong).index} ≫ guesser ${last(guess).index}`);
const learner = student((k, w, lv) => model(k === "b_splice" ? -2 + 4 * w / 7 : -0.3, lv));
const d = P.drivers(learner, 0, learner.snaps.length - 1);
const up = d.filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
ok(up[0] && up[0].k === "b_splice", `learner: the biggest positive driver is comma splice (+${up[0] && up[0].v.toFixed(2)} points)`);
ok(d.filter((x) => x.k !== "b_splice").every((x) => Math.abs(x.v) < up[0].v), "subtopics at a flat 55% move less than the one the student learned");
const bs = learner.subs.find((s) => s.k === "b_splice");
ok(bs.series[bs.series.length - 1] > bs.series[0] + 0.15, `comma splice mastery rises ${bs.series[0].toFixed(2)} → ${bs.series[bs.series.length - 1].toFixed(2)}`);
ok(learner.snaps.length >= 8, `weekly snapshots: ${learner.snaps.length}`);
// repeats of the same question count 0.3: answering a memorised question again must not look like growth
const rep = (() => { const q = mkQ("b_splice", "M"); const obs = []; for (let i = 0; i < 40; i++) obs.push({ id: q.id, t: T0 + i * DAY, x: i < 5 ? 0 : 1, sec: "rw", level: "M", type: "mc", ctx: "hw", part: "r" + i, attempt: i ? 2 : 1, chosen: "", second: null, secs: 70 }); return P.compute(obs, tags, { now: T0 + 41 * DAY }); })();
const fresh = (() => { const obs = []; for (let i = 0; i < 40; i++) { const q = mkQ("b_splice", "M"); obs.push({ id: q.id, t: T0 + i * DAY, x: i < 5 ? 0 : 1, sec: "rw", level: "M", type: "mc", ctx: "hw", part: "f" + i, attempt: 1, chosen: "", second: null, secs: 70 }); } return P.compute(obs, tags, { now: T0 + 41 * DAY }); })();
const fin = (r) => r.subs.find((x) => x.k === "b_splice").series.slice(-1)[0];
ok(fin(rep) < fin(fresh), `the same question answered 40 times (${fin(rep).toFixed(2)}) counts less than 40 different questions (${fin(fresh).toFixed(2)})`);
const thin = learner.subs.find((s) => s.k === "f_pronoun");
ok(thin && thin.n === 0 && thin.series.every((v) => v < 0.6), "a subtopic never seen stays at a modest prior (no free mastery)");
// transfer: worse on mocks than predicted → X below 100
const choker = student((k, w, lv) => model(0.8, lv), (w, s) => (s === 2 ? "mock" : "hw"));
ok(last(choker).parts.X != null, `transfer part available with mocks (${last(choker).parts.X && last(choker).parts.X.toFixed(0)})`);
ok(last(guess).parts.C != null && last(guess).parts.C < 40, `correction near random for a guesser (${last(guess).parts.C.toFixed(0)})`);
ok(guess.traps.length > 0 && guess.traps.every((x) => x.now >= 0 && x.now <= 1), "trap rates computed");
console.log(`ALL PASS (${n})`);
