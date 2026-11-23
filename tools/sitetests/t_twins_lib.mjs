// «Похожие вопросы»: server logic of lib/mistake-twins.js with a fake Gemini (no network, no key).
// usage: node tools/sitetests/t_twins_lib.mjs
import assert from "node:assert/strict";
import { twinsInput, checkedTwins, buildTwins } from "../../lib/mistake-twins.js";
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log("PASS " + m); };
const own = { sec: "rw", skill: "Transitions", level: "H", chosen: "A", key: "B", own: true,
  text: { passage: "The museum's collection grew quickly over the decade. ______ the curators admitted that storage space was running out.", prompt: "Which choice completes the text with the most logical transition?", options: ["Similarly,", "Still,", "For example,", "In other words,"] } };
const cb = { sec: "rw", skill: "Boundaries", level: "M", chosen: "C", key: "D", text: { passage: "secret CB text", prompt: "x" } };
const inp = twinsInput({ perMistake: 2, mistakes: [own, cb] });
ok(inp && inp.mistakes.length === 2 && inp.mistakes[0].text && !inp.mistakes[1].text, "text kept only for a question marked own");
ok(!JSON.stringify(inp).includes("name") && !JSON.stringify(inp).includes("secret"), "no name and no College Board text in the Gemini input");
ok(twinsInput({ mistakes: [] }) === null && twinsInput({ perMistake: 5, mistakes: [own] }) === null && twinsInput({ mistakes: Array(7).fill(own) }) === null, "rejects empty, too many per mistake, more than 6 mistakes");
ok(twinsInput({ mistakes: [{ ...own, skill: "Algebra" }] }) === null, "rejects an unknown RW skill");
{ const f = twinsInput({ perMistake: 1, note: "  упор на запятую перед which  ", mistakes: [{ ...cb, focus: "Comma splice и слитные предложения", trapKind: "Перевёрнутая связь" }, { ...cb, focus: "x".repeat(81), trapKind: 5 }] });
  ok(f && f.mistakes[0].focus === "Comma splice и слитные предложения" && f.mistakes[0].trapKind === "Перевёрнутая связь" && f.teacherNote === "упор на запятую перед which", "keeps the subtopic, the trap kind and the teacher note");
  ok(f && !("focus" in f.mistakes[1]) && !("trapKind" in f.mistakes[1]), "drops a subtopic longer than 80 characters and a trap that is not text");
  ok(twinsInput({ perMistake: 1, note: "z".repeat(900), mistakes: [cb] }).teacherNote.length === 300, "cuts the teacher note to 300 characters"); }
const good = (source, extra = {}) => ({ source, mechanism: "Путает уступку с продолжением мысли.", passage: `A small orchard in the valley produced a record harvest of apples this autumn after years of drought and careful irrigation work by farmers number ${source}${extra.tag || ""}.`, prompt: "Which choice completes the text with the most logical transition?",
  options: ["Likewise,", "Nevertheless,", "For instance,", "Thus,"], answer: "B", trap: "A", rationale: "Контраст между засухой и урожаем.", trapWhy: "Likewise вводит сходство.", ...extra });
const copied = good(1, { passage: "The museum's collection grew quickly over the decade. ______ the curators admitted that storage space was running out today." });
const out = checkedTwins({ questions: [good(1), good(1, { tag: "b" }), good(1, { tag: "c" }), copied, good(2), good(2, { answer: "A" }), good(9), good(2, { options: ["a", "a", "b", "c"] })] }, inp);
ok(out.filter((q) => q.source === 1).length === 2, "at most perMistake drafts per mistake");
ok(!out.some((q) => q.passage.startsWith("The museum")), "a draft copying 8 words from the source is dropped");
ok(!out.some((q) => q.answer === q.trap) && !out.some((q) => q.source === 9), "answer = trap and unknown source dropped");
ok(out.every((q) => new Set(q.options).size === 4), "duplicate options dropped");
// buildTwins with a fake model: the blind solver disagrees on one question and calls another ambiguous
const calls = [];
const gen = async (key, instruction, data) => { calls.push(data);
  if (data.mistakes) return { questions: [good(1), good(1, { tag: "b" }), good(2), good(2, { tag: "d" })] };
  return { items: data.questions.map((q, i) => { const k = q.options.indexOf("Nevertheless,"); return { answer: i === 1 ? "ABCD"[(k + 1) % 4] : "ABCD"[k], sound: i !== 2 }; }) }; };
const req = (b) => ({ json: async () => b });
const r = await buildTwins(req({ perMistake: 2, mistakes: [own, cb] }), { GEMINI_API_KEY: "x" }, gen);
ok(r.status === 200 && r.questions.length === 2 && r.dropped === 2 && r.asked === 4, "blind check drops the wrong key and the ambiguous one: " + JSON.stringify({ s: r.status, n: r.questions?.length, d: r.dropped }));
ok(!JSON.stringify(calls[1]).includes('"answer"') && !JSON.stringify(calls[1]).includes('"trap"'), "the blind solver never sees keys or traps");
ok((await buildTwins(req({ mistakes: [own] }), {}, gen)).status === 503, "no GEMINI_API_KEY → 503");
ok((await buildTwins(req({ mistakes: [own] }), { GEMINI_API_KEY: "x" }, async (k, i, d) => d.mistakes ? { questions: [good(1)] } : { items: [{ answer: "ABCD"[(d.questions[0].options.indexOf("Nevertheless,") + 1) % 4], sound: true }] })).status === 422, "nothing passes → 422");
const r2 = await buildTwins(req({ perMistake: 2, mistakes: [own, cb] }), { GEMINI_API_KEY: "x" }, async (k, i, d) => d.mistakes ? { questions: [good(1), good(1, { tag: "b" }), good(2), good(2, { tag: "d" })] } : { items: d.questions.map((q) => ({ answer: "ABCD"[q.options.indexOf("Nevertheless,")], sound: true })) });
ok(r2.status === 200 && new Set(r2.questions.map((q) => q.answer)).size === 4 && r2.questions.every((q) => q.options["ABCD".indexOf(q.answer)] === "Nevertheless," && q.options["ABCD".indexOf(q.trap)] === "Likewise,"), "4 drafts all keyed B by the model come back keyed A, B, C and D, key and trap still right");
ok((await buildTwins(req({ mistakes: [own] }), { GEMINI_API_KEY: "x" }, async () => { throw Object.assign(new Error(), { status: 429 }); })).status === 429, "rate limit → 429");
// «Контрольные» ~30%: the server picks the slots at random; a decoy only where planned; off switch
{ const six = Array.from({ length: 6 }, () => ({ ...cb }));
  const plan = (inp) => inp.mistakes.reduce((a, m) => a + (m.decoys || 0), 0);
  const p1 = twinsInput({ perMistake: 2, mistakes: six }), p2 = twinsInput({ perMistake: 2, mistakes: six });
  ok(plan(p1) === 4 && plan(twinsInput({ perMistake: 1, mistakes: six })) === 2 && plan(twinsInput({ perMistake: 3, mistakes: six.slice(0, 1) })) === 1, "about 30%: 12 → 4, 6 → 2, 3 → 1 control questions");
  ok(plan(twinsInput({ perMistake: 2, mistakes: [cb] })) === 0 && plan(twinsInput({ perMistake: 1, mistakes: [cb] })) === 0, "a batch under 3 questions gets none");
  ok(plan(twinsInput({ perMistake: 2, decoys: false, mistakes: six })) === 0, "the teacher can switch them off");
  ok(p1.mistakes.every((m) => !m.decoys || m.decoys <= 2), "never more control questions than slots of a mistake");
  let seq = 0; const r1 = twinsInput({ perMistake: 2, mistakes: six }, () => 0.1), r2 = twinsInput({ perMistake: 2, mistakes: six }, () => ((seq = (seq * 9301 + 49297) % 233280) / 233280));
  ok(JSON.stringify(r1.mistakes.map((m) => m.decoys || 0)) !== JSON.stringify(r2.mistakes.map((m) => m.decoys || 0)) || plan(r1) === plan(r2), "the slots depend on the random draw");
  const one = twinsInput({ perMistake: 3, mistakes: [own] }, () => 0); const d = one.mistakes[0].decoys;
  const kept = checkedTwins({ questions: [good(1, { kind: "decoy" }), good(1, { kind: "target", tag: 2 }), good(1, { kind: "target", tag: 3 })] }, one);
  ok(d === 1 && kept.filter((q) => q.kind === "decoy").length === 1 && kept.filter((q) => q.kind === "target").length === 2, "the decoy draft is kept and marked where one was planned");
  const none = checkedTwins({ questions: [good(1, { kind: "decoy" }), good(2)] }, inp);
  ok(!none.some((q) => q.kind === "decoy") && none.every((q) => q.kind === "target"), "a decoy where none was planned is dropped; drafts without kind count as normal");
  let seen = null; const rr = await buildTwins(req({ perMistake: 3, mistakes: [own] }), { GEMINI_API_KEY: "x" }, async (k, instr, data, schema) => { if (data.mistakes) { seen = { instr, schema, data };
      return { questions: [good(1, { kind: "decoy" }), good(1, { kind: "target", tag: "b" }), good(1, { kind: "target", tag: "c" })] }; }
    return { items: data.questions.map((q) => ({ answer: "ABCD"[q.options.indexOf("Nevertheless,")], sound: true })) }; });
  ok(rr.status === 200 && rr.decoys === 1 && /kind="decoy"/.test(seen.instr) && seen.schema.properties.questions.items.properties.kind && seen.data.mistakes[0].decoys === 1, "the prompt and schema ask for kind; the response counts the control questions"); }
console.log(`ALL PASS (${n})`);
