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
function student(pRight, ctx = () => "hw", per = 12) {
  const obs = []; let part = 0;
  for (let w = 0; w < 8; w++) for (let s = 0; s < 3; s++) {
    part++; const t = T0 + (w * 7 + s * 2) * DAY;
    for (let j = 0; j < per; j++) { const b0 = bank[Math.floor(rnd() * bank.length)], q = { ...mkQ(b0.k, b0.level), k: b0.k }, x = rnd() < pRight(q.k, w, q.level) ? 1 : 0;
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
const learner = student((k, w, lv) => model(k === "b_splice" ? -2 + 4 * w / 7 : -0.3, lv), () => "hw", 24);   // 72 answers a week, like an active student
const d = P.drivers(learner, 0, learner.snaps.length - 1);
const up = d.filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
ok(up[0] && up[0].k === "b_splice", `learner: the biggest positive driver is comma splice (+${up[0] && up[0].v.toFixed(2)} points)`);
ok(d.filter((x) => x.k !== "b_splice").length <= 1, "flat subtopics stay out of the drivers (noise is filtered): " + d.map((x) => x.k).join(", "));
const bs = learner.subs.find((s) => s.k === "b_splice");
ok(bs.series[bs.series.length - 1] > bs.series[0] + 0.15, `comma splice mastery rises ${bs.series[0].toFixed(2)} → ${bs.series[bs.series.length - 1].toFixed(2)}`);
ok(learner.snaps.length >= 8, `weekly snapshots: ${learner.snaps.length}`);
// repeats of the same question count 0.3: answering a memorised question again must not look like growth
const filler = () => Array.from({ length: 25 }, (_, i) => ({ id: mkQ("wic_precise", "M").id, t: T0 - DAY + i * 60e3, x: i % 2, sec: "rw", level: "M", type: "mc", ctx: "hw", part: "fill", attempt: 1, chosen: "", second: null, secs: 70 }));   // makes the section live (20+ answers)
const rep = (() => { const q = mkQ("b_splice", "M"); const obs = filler(); for (let i = 0; i < 40; i++) obs.push({ id: q.id, t: T0 + i * DAY, x: i < 5 ? 0 : 1, sec: "rw", level: "M", type: "mc", ctx: "hw", part: "r" + i, attempt: i ? 2 : 1, chosen: "", second: null, secs: 70 }); return P.compute(obs, tags, { now: T0 + 41 * DAY }); })();
const fresh = (() => { const obs = filler(); for (let i = 0; i < 40; i++) { const q = mkQ("b_splice", "M"); obs.push({ id: q.id, t: T0 + i * DAY, x: i < 5 ? 0 : 1, sec: "rw", level: "M", type: "mc", ctx: "hw", part: "f" + i, attempt: 1, chosen: "", second: null, secs: 70 }); } return P.compute(obs, tags, { now: T0 + 41 * DAY }); })();
const fin = (r) => r.subs.find((x) => x.k === "b_splice").series.slice(-1)[0];
ok(fin(rep) < fin(fresh), `the same question answered 40 times (${fin(rep).toFixed(2)}) counts less than 40 different questions (${fin(fresh).toFixed(2)})`);
const thin = learner.subs.find((s) => s.k === "f_pronoun");
ok(thin && thin.n === 0 && thin.series.every((v) => v < 0.6), "a subtopic never seen stays at a modest prior (no free mastery)");
// transfer: worse on mocks than predicted → X below 100
const choker = student((k, w, lv) => model(0.8, lv), (w, s) => (s === 2 ? "mock" : "hw"));
ok(last(choker).parts.X != null, `transfer part available with mocks (${last(choker).parts.X && last(choker).parts.X.toFixed(0)})`);
ok(last(guess).parts.C != null && last(guess).parts.C < 40, `correction near random for a guesser (${last(guess).parts.C.toFixed(0)})`);
ok(guess.traps.length > 0 && guess.traps.every((x) => x.now >= 0 && x.now <= 1), "trap rates computed");
// a first day of 16 medium answers (9 right), then a week of strong work: the first week must not draw curves from the prior
const early = (() => { const obs = []; for (let i = 0; i < 16; i++) { const q = mkQ("b_splice", "M"); obs.push({ id: q.id, t: T0 + 3600e3 * i / 16, x: i < 9 ? 1 : 0, sec: "rw", level: "M", type: "mc", ctx: "learn", part: "d1", attempt: 1, chosen: "", second: null, secs: 70 }); }
  for (let i = 0; i < 60; i++) { const lv = ["E", "M", "H"][i % 3], q = mkQ("b_splice", lv); obs.push({ id: q.id, t: T0 + 8 * DAY + i * 3600e3, x: rnd() < model(2, lv) ? 1 : 0, sec: "rw", level: lv, type: "mc", ctx: "hw", part: "w2_" + (i >> 3), attempt: 1, chosen: "", second: null, secs: 70 }); }
  return P.compute(obs, tags, { now: T0 + 10 * DAY }); })();
const s0 = early.snaps[0];
ok(s0.nAns === 16 && Object.keys(s0.diff.rw).length === 0, "first week with 16 answers: no difficulty curve (the prior alone would draw one)");
ok(s0.nAns < P.MIN_IX && last(early).nAns >= P.MIN_IX, `index hidden for weeks under ${P.MIN_IX} answers, shown later (${last(early).nAns})`);
ok(s0.cnt.rw.M[0] === 9 && s0.cnt.rw.M[1] === 16, "the snapshot keeps the raw count 9/16 for the tooltip");
const ld = last(early).diff.rw; ok(ld.E && ld.M && ld.H && ld.E > ld.M && ld.M > ld.H, "with enough answers per level all three curves appear, easy > medium > hard");
// a steady student: RW from week 1, Math only from week 5 at the same level → no fake growth or fake drop from Math's prior
const late = (() => { const obs = []; let j = 0;
  for (let w = 0; w < 8; w++) for (let i = 0; i < 24; i++) { const lv = ["E", "M", "H"][i % 3], isM = w >= 4 && i % 2, k = isM ? "alg_lin1" : RW[i % RW.length], id = "L" + (++j);
    tags[id] = { p: k, s: [], t: {} }; obs.push({ id, t: T0 + w * 7 * DAY + i * 3600e3, x: rnd() < model(1, lv) ? 1 : 0, sec: isM ? "math" : "rw", level: lv, type: "mc", ctx: "hw", part: "p" + w + (isM ? "m" : "r"), attempt: 1, chosen: "", second: null, secs: 70 }); }
  return P.compute(obs, tags, { now: T0 + 57 * DAY }); })();
const ld2 = P.drivers(late, 0, late.snaps.length - 1, 3, 0),   // zmin 0: the raw size of every change
      mathD = ld2.filter((x) => P.SEC_OF[x.k] === "math");
ok(mathD.length > 0 && mathD.every((x) => Math.abs(x.v) < 3), "a section that starts late brings no fake growth from its prior: " + JSON.stringify(mathD.map((x) => x.v.toFixed(1))));
ok(late.snaps[2].live.length === 1 && late.snaps.at(-1).live.length === 2, "the index counts Math only once it has 20 answers");
// the core bias: a student whose level never changes must not show growth just because answers pile up (old engine: +23 on average)
const steadyD = []; for (let r = 0; r < 10; r++) { const st = student((k, w, lv) => model(1, lv)), S2 = st.snaps.filter((x) => x.index != null); steadyD.push(S2.at(-1).index - S2[0].index); }
const mD = steadyD.reduce((a, b) => a + b, 0) / steadyD.length;
ok(Math.abs(mD) < 6, `a steady student shows no growth from piling up answers: mean index change ${mD.toFixed(1)} over 10 students (${steadyD.join(", ")})`);
// A prediction is fitted to early answers and ends when the existing index has enough evidence.
const firstAnswers = (n, x, sec = "rw", level = "M") => Array.from({ length: n }, () => {
  const q = mkQ(sec === "rw" ? "b_splice" : "alg_lin1", level);
  return { id: q.id, t: T0, x, sec, level, type: "mc", ctx: "hw", part: "early", attempt: 1 };
});
const earlyFit = (obs) => P.compute(obs, tags, { now: T0 + DAY, freq: {} });
const low = firstAnswers(P.MIN_EARLY, 0), high = firstAnswers(P.MIN_EARLY, 1);
ok(last(earlyFit([])).prediction == null && last(earlyFit(high.slice(1))).prediction == null, "prediction needs five answered questions in a section");
ok(last(earlyFit(high)).prediction.value > last(earlyFit(low)).prediction.value, "early performance drives the predicted index");
ok(last(earlyFit(firstAnswers(5, 1, "rw", "H"))).prediction.value > last(earlyFit(firstAnswers(5, 1, "rw", "E"))).prediction.value, "early prediction accounts for difficulty");
ok(last(earlyFit(high.map((q) => ({ ...q, blank: true, x: 0 })))).prediction == null && last(earlyFit(high.map((q) => ({ ...q, id: high[0].id })))).prediction == null, "blanks and repeats cannot unlock an early prediction");
const almost = firstAnswers(P.MIN_IX - 1, 1), finalAnswer = firstAnswers(1, 1), before = last(earlyFit(almost)), after = last(earlyFit([...almost, ...finalAnswer]));
ok(before.prediction != null && after.prediction == null && after.index != null, "prediction clears at 30 answers when the section is established");
ok(last(earlyFit([...firstAnswers(15, 1), ...firstAnswers(15, 1, "math")])).prediction != null, "30 split answers still need 20 in one section");
const later = firstAnswers(30, 0).map((q) => ({ ...q, t: T0 + 8 * DAY }));
const both = P.compute([...high, ...later], tags, { now: T0 + 9 * DAY });
const firstWeek = both.snaps[0], beforeLater = P.compute(high, tags, { now: firstWeek.t });
ok(firstWeek.prediction.value === last(beforeLater).prediction.value, "later answers do not change the stored early-week prediction");
const evidence = firstAnswers(30, 1);
const baseline = earlyFit(evidence), improve = evidence.slice(0, 10).map((q) => ({ ...q, t: T0 + 16, x: 0, attempt: 2 }));
const unscored = earlyFit([...evidence, ...improve, { sec: "rw", t: T0 + 17, skipped: 27 }, ...firstAnswers(8, 0).map((q) => ({ ...q, blank: true }))]);
ok(last(unscored).parts.M === last(baseline).parts.M && last(unscored).nAns === 30 &&
  unscored.habits.repeats === 10 && unscored.habits.skipped === 27 && unscored.habits.omitted === 8,
  "retakes, ordinary blanks, and deliberate skips leave mastery and readiness unchanged");
const mistakes = firstAnswers(30, 0);
const retries = mistakes.slice(0, 10).map((q) => ({ ...q, t: T0 + 16, x: 1, attempt: 2 }));
const corrected = earlyFit([...mistakes, ...retries]);
ok(last(corrected).parts.C > 70 && last(corrected).parts.M === last(earlyFit(mistakes)).parts.M, "successful retries improve correction without changing mastery");
const covered = earlyFit([...evidence, ...firstAnswers(4, 0).map((q) => ({ ...q, blank: true, scoreBlank: true }))]);
ok(last(covered).nAns === 34 && last(covered).parts.M < last(baseline).parts.M, "an explicit full-module simulation scores unanswered positions");
const lateProbes = (fresh) => Array.from({ length: 12 }, (_, week) => ({
  ...(fresh ? firstAnswers(1, 1)[0] : evidence[0]), t: T0 + (week + 1) * 8 * DAY, x: 1, attempt: fresh ? 1 : 2
}));
const retention = (extra) => last(P.compute([...evidence, ...extra], tags, { now: T0 + 100 * DAY })).parts.R;
ok(retention(lateProbes(true)) != null && retention(lateProbes(false)) == null, "only fresh questions after the delay provide retention evidence");
const linkedBluebook = { ...evidence[0], id: "BB.abcd1234", src: "bb", t: T0 + 60, original: { cid: "abcd1234", refs: [evidence[0].id] }, x: 0 };
const aliases = earlyFit([...evidence, linkedBluebook]);
ok(last(aliases).nAns === evidence.length && aliases.habits.repeats === 1, "a known Bluebook match and its course copy count as one question");
console.log(`ALL PASS (${n})`);
