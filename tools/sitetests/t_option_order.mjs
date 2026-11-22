// Gemini drafts: after balanceKeys the keys of a batch are spread over A–D, every option survives, and letter mentions follow.
// usage: node tools/sitetests/t_option_order.mjs
import assert from "node:assert/strict";
import { balanceKeys, remapLetters } from "../../lib/option-order.js";
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log("PASS " + m); };
const q = (i) => ({ options: [`right ${i}`, `trap ${i}`, `other ${i}`, `last ${i}`], answer: "A", trap: "B",
  rationale: `Вариант A верен, а вариант B слишком широк; (C) не о том. Ответ A.`, trapWhy: "B) говорит о другом." });
for (const size of [4, 8, 12, 3]) {
  const out = balanceKeys(Array.from({ length: size }, (_, i) => q(i)));
  const count = { A: 0, B: 0, C: 0, D: 0 }; out.forEach((x) => count[x.answer]++);
  ok(Math.max(...Object.values(count)) - Math.min(...Object.values(count)) <= 1, `${size} questions: keys spread evenly ${JSON.stringify(count)}`);
  ok(out.every((x, i) => x.options[["A", "B", "C", "D"].indexOf(x.answer)] === `right ${i}`), "  the key still points to the right option");
  ok(out.every((x, i) => x.options[["A", "B", "C", "D"].indexOf(x.trap)] === `trap ${i}` && x.trap !== x.answer), "  the trap still points to the trap option");
  ok(out.every((x, i) => [...x.options].sort().join() === [...q(i).options].sort().join()), "  no option lost or duplicated");
  ok(out.every((x) => x.rationale.includes(`Вариант ${x.answer} верен`) && x.rationale.includes(`вариант ${x.trap} слишком`) && x.trapWhy.startsWith(`${x.trap})`)), "  letters in the explanations follow the new order");
}
const runs = new Set(Array.from({ length: 40 }, () => balanceKeys([q(0)])[0].answer));
ok(runs.size >= 3, "a single question lands on different letters across runs: " + [...runs].join(""));
ok(remapLetters("Вариант A верен; option B no; (C); D) yes; DNA and Ann", { A: "C", B: "D", C: "A", D: "B" }) === "Вариант C верен; option D no; (A); B) yes; DNA and Ann", "remapLetters touches only letter mentions, not words like DNA");
console.log(`ALL PASS (${n})`);
