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
  return { items: data.questions.map((q, i) => ({ answer: i === 1 ? "C" : "B", sound: i !== 2 })) }; };
const req = (b) => ({ json: async () => b });
const r = await buildTwins(req({ perMistake: 2, mistakes: [own, cb] }), { GEMINI_API_KEY: "x" }, gen);
ok(r.status === 200 && r.questions.length === 2 && r.dropped === 2 && r.asked === 4, "blind check drops the wrong key and the ambiguous one: " + JSON.stringify({ s: r.status, n: r.questions?.length, d: r.dropped }));
ok(!JSON.stringify(calls[1]).includes('"answer"') && !JSON.stringify(calls[1]).includes('"trap"'), "the blind solver never sees keys or traps");
ok((await buildTwins(req({ mistakes: [own] }), {}, gen)).status === 503, "no GEMINI_API_KEY → 503");
ok((await buildTwins(req({ mistakes: [own] }), { GEMINI_API_KEY: "x" }, async (k, i, d) => d.mistakes ? { questions: [good(1)] } : { items: [{ answer: "C", sound: true }] })).status === 422, "nothing passes → 422");
ok((await buildTwins(req({ mistakes: [own] }), { GEMINI_API_KEY: "x" }, async () => { throw Object.assign(new Error(), { status: 429 }); })).status === 429, "rate limit → 429");
console.log(`ALL PASS (${n})`);
