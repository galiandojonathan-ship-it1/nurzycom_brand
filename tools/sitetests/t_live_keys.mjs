// Live rounds from workbook sets: typed-answer keys written as display text must not block the round («нет числового ключа»).
// Loads docs/liveround.js in a sandbox and sends its keys through the real functions/api/live.js grading.
// usage: node tools/sitetests/t_live_keys.mjs
import assert from "node:assert/strict"; import fs from "node:fs"; import vm from "node:vm";
import { isCorrect } from "../../functions/api/live.js";
const win = {}; vm.runInNewContext(fs.readFileSync(new URL("../../docs/liveround.js", import.meta.url), "utf8"), { window: win, SITE: {}, document: { addEventListener() {} } });
const keyOf = (q) => { const [w] = win.LiveRound.workbook([{ t: "spr", stem: "", ...q }]); return { type: w.keyType, accepted: w.accepted }; };
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log("PASS " + m); };
const cases = [
  [{ ans: "3/2" }, "1.5", true], [{ ans: "3/2 или 1.5" }, "3/2", true], [{ ans: "3/2; 1.5" }, "1.5", true],
  [{ ans: "x = 4" }, "4", true], [{ ans: "y=−7" }, "-7", true], [{ ans: ".75 (or 3/4)" }, "0.75", true],
  [{ acc: ["-6/5", "-1.2"], ans: "-6/5" }, "-1.2", true], [{ ans: "≈ 2.5" }, "5/2", true], [{ ans: "12" }, "13", false],
  [{ ans: "2√3" }, "2√3", true], [{ ans: "2√3" }, "3.4641", false], [{ ans: "1, 2" }, "2", true],
];
for (const [q, typed, expect] of cases) {
  const key = keyOf(q);
  ok(key.type === "custom" || key.accepted.length, `key «${q.acc || q.ans}» → ${key.type} ${JSON.stringify(key.accepted)}`);
  ok(isCorrect(key, typed) === expect, `  answer «${typed}» → ${expect ? "верно" : "неверно"}`);
}
// the server's create check: no key the round creator sends is rejected as «нет числового ключа»
const live = fs.readFileSync(new URL("../../functions/api/live.js", import.meta.url), "utf8");
ok(/key\.type === "spr" && !key\.accepted\.some/.test(live), "server still demands a number for spr keys; text keys travel as custom");
console.log(`ALL PASS (${n})`);
