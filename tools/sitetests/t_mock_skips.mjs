import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
globalThis.window = {};
require("../../docs/formkit.js");
const PREDICT = require("../../docs/predict.js");
const { mockCoverage, parseAnswers, rows } = window.FORMKIT;

const answers = (module, size, get) => Array.from({ length: size }, (_, i) => `${module}.${i + 1}:${get(i + 1)}`).join(" ");
const score = (raw1, size, raw2 = 0) => `RW · M1 ${raw1}/${size} · M2 сложный ${raw2}/${size}`;
const coverage = (part, source) => mockCoverage(part, parseAnswers(source));

for (const [size, raw] of [[27, 25], [22, 19]]) {
  const part = score(raw, size), one = answers(1, size, (i) => i <= raw ? "B" : "C");
  const two = answers(2, size, () => "-");
  const result = coverage(part, one + " " + two);
  assert.deepEqual(result.modules, [2]);
  assert.equal(result.skipped.size, size);
  assert(!result.skipped.has("1.1"));
  assert.equal(result.skipped.has(`2.${size}`), true);
  assert.equal(coverage(part, one + " " + two.slice(0, -4)).skipped.size, 0);
  assert.equal(coverage(part, one + " " + two.replace("2.1:-", "2.1:B")).skipped.size, 0, "a wrong answer is still an attempt");
}
const mixed = coverage(score(2, 4, 1), "1.1:A 1.2:~ 1.3:- 1.4:B 2.1:C 2.2:- 2.3:D 2.4:-");
assert.deepEqual([...mixed.skipped], ["1.2"]);
assert.deepEqual(mixed.modules, []);
assert.equal(coverage(score(0, 2), "1.1:- 1.2:- 2.1:- 2.1:-").modules.includes(2), false);
assert.deepEqual(coverage(score(0, 2), "1.1:- 1.2:- 2.1:- 2.2:-").modules, [1, 2]);

const csv = "Timestamp,Student,Lesson,Part,Answers,Score,Wrong,Seconds,Attempt\n" +
  `2026-11-25 10:30,Fixture,PR3,${score(25,27)},${answers(1,27,()=>"A")} ${answers(2,27,()=>"-")},25/54,,1000,1`;
const saved = rows(csv)[0];
assert.equal(saved.b, 54, "CSV retains the original full-test denominator");
assert.equal(saved.mock.skipped.size, 27);
const scale = { section: () => 600 };
assert.deepEqual(PREDICT.collect([saved], [], scale), []);
const complete = { ...saved, mock: coverage(score(2, 2, 1), "1.1:A 1.2:A 2.1:A 2.2:B") };
assert.equal(PREDICT.collect([complete], [], scale).length, 1);
console.log("PASS module coverage, explicit skips, ordinary blanks and full-test forecast");
