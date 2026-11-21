// Regression checks for original and sealed live rounds. Run with Node 22+ from any directory.
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const sql = new DatabaseSync(":memory:");
sql.exec(readFileSync(new URL("../../deploy/live-lesson-d1.sql", import.meta.url), "utf8"));
const db = {
  prepare(query) {
    return { bind(...args) {
      assert(args.length <= 100, "D1 parameter limit");
      return {
        run: () => ({ meta: sql.prepare(query).run(...args) }),
        first: () => sql.prepare(query).get(...args),
        all: () => ({ results: sql.prepare(query).all(...args) }),
        execute: () => /^SELECT/.test(query) ? { results: sql.prepare(query).all(...args) } : sql.prepare(query).run(...args)
      };
    } };
  },
  batch: entries => entries.map(entry => entry.execute())
};
const { onRequest } = await import(new URL("../../functions/api/live.js", import.meta.url));
const env = { LIVE_LESSONS: db, USERS: { get: () => createHash("sha256").update("bynurzy-admin:teacher").digest("hex") } };
let round, host, student, participant;
let now = 1000000;
Date.now = () => now;
async function call(action, body, auth, expected) {
  const url = new URL("https://test.invalid/api/live");
  url.searchParams.set("action", action);
  if (round) url.searchParams.set("round", round);
  if (participant) url.searchParams.set("student", participant);
  const headers = action === "create" && auth ? { "x-admin-key": auth } : auth ? { "x-live-token": auth } : {};
  const r = await onRequest({ env, request: new Request(url, { method: body ? "POST" : "GET", headers, body: body ? JSON.stringify(body) : undefined }) });
  assert.equal(r.status, expected, await r.clone().text());
  return r.json();
}
const setup = { title: "Fixture", set: "X01", keys: Array(10).fill("A") };
await call("create", setup, null, 403);
({ round, host } = await call("create", setup, "teacher", 201));
await call("state", null, null, 403);
({ participant, student } = await call("join", { name: "Test student" }, null, 201));
await call("start", {}, student, 403);
await call("start", {}, host, 200);
await call("answer", { number: 1, answer: "A" }, student, 409);
now += 3000;
await call("answer", { number: 2, answer: "A" }, student, 409);
await call("answer", { number: 1, answer: "A" }, student, 200);
await call("answer", { number: 1, answer: "B" }, student, 409);
let state = await call("state", null, host, 200);
assert.equal(state.answers[0].correct, 1);
assert.equal(state.keys, undefined);
state = await call("state", null, student, 200);
assert.equal(state.answers[0].correct, undefined);
assert.equal(state.students, undefined);
now += 45000;
await call("answer", { number: 2, answer: "B" }, student, 200);
await call("close", {}, host, 200);
await call("answer", { number: 2, answer: "A" }, student, 409);
state = await call("state", null, host, 200);
assert.equal(state.finished, true);
assert.equal(state.keys.length, 10);
participant = null;
({ round, host } = await call("create", { title: "Typed answers", set: "sealed:YWJj", keys: [
  {type:"spr",accepted:["0.5000"]}, {type:"custom",accepted:["Blue sky","2/3"]}
]}, "teacher", 201));
({ participant, student } = await call("join", {name:"Numeric student"}, null, 201));
await call("start", {}, host, 200);
now += 3000;
await call("answer", {number:1,answer:"1/2"}, student, 200);
now += 45000;
await call("answer", {number:2,answer:" BLUE SKY "}, student, 200);
state = await call("state", null, host, 200);
assert.equal(state.total, 2);
assert.equal(state.answers.filter(a=>a.correct).length,2);
assert.equal(state.finished,false);
now += 45000;
state = await call("state", null, host, 200);
assert.equal(state.finished,true);
assert.equal(state.keys.length,2);

sql.exec("DROP TABLE live_round_responses; DROP TABLE live_round_items;");
// Configured rounds create their tables on an existing four-table database.
participant = null;
({round,host} = await call("create", {title:"Strict custom timer",set:"sealed:YWJj",keys:Array(12).fill("A"),settings:{seconds:5,strict:true}}, "teacher",201));
({participant,student} = await call("join",{name:"Strict student"},null,201));
await call("start",{},host,200);
now += 3000;
await call("answer",{number:1,answer:"A"},student,200);
now += 5000;
await call("answer",{number:1,answer:"A"},student,409);
await call("answer",{number:2,answer:"A"},student,200);
state = await call("state",null,host,200);
assert.equal(state.total,12);
assert.equal(state.seconds,5);
assert.equal(state.strict,true);
await call("next",{number:1},host,409);
now += 55000;
state = await call("state",null,host,200);
assert.equal(state.finished,true);
assert.equal(state.keys.length,12);

participant = null;
({round,host} = await call("create",{title:"Flexible timer",set:"sealed:YWJj",keys:["A","B"],settings:{seconds:5,strict:false}},"teacher",201));
({participant,student} = await call("join",{name:"Flexible student"},null,201));
await call("start",{},host,200);
await call("next",{number:1},host,409); // Three-second countdown has not finished.
now += 3000 + 20000;
state = await call("state",null,student,200);
assert.equal(state.finished,false);
assert.equal(state.current,1);
await call("answer",{number:1,answer:"A"},student,200); // Overtime remains valid.
await call("answer",{number:2,answer:"B"},student,409);
await call("next",{number:1},student,403);
await call("next",{number:1},host,200);
await call("next",{number:1},host,409); // A retry cannot skip question two.
await call("answer",{number:1,answer:"B"},student,409);
state = await call("state",null,host,200);
assert.equal(state.current,2);
assert.equal(state.questionStartedAt,now);
await call("answer",{number:2,answer:"B"},student,200);
await call("next",{number:2},host,200);
state = await call("state",null,host,200);
assert.equal(state.finished,true);
await call("create",{...setup,settings:{seconds:0,strict:true}},"teacher",400);
participant = null;
({round,host} = await call("create",{title:"Full capacity",set:"sealed:YWJj",keys:Array(100).fill("A"),settings:{seconds:45,strict:true}},"teacher",201));
state = await call("state",null,host,200);
assert.equal(state.total,100);

// Joining never restarts the shared timer, and missed strict questions stay closed.
participant = null;
({round,host} = await call("create",{title:"Late strict join",set:"sealed:YWJj",keys:["A","B","C"],settings:{seconds:5,strict:true}},"teacher",201));
await call("start",{},host,200);
const strictStart = (await call("state",null,host,200)).started;
now += 3000 + 6000;
({participant,student} = await call("join",{name:"Late strict student"},null,201));
state = await call("state",null,student,200);
assert.equal(state.started,strictStart);
assert.equal(state.answers.length,0);
await call("answer",{number:1,answer:"A"},student,409);
await call("answer",{number:2,answer:"B"},student,200);
state = await call("state",null,host,200);
assert.equal(state.students.length,1);
assert.equal(state.answers[0].question_number,2);
now += 10000;
await call("join",{name:"After automatic finish"},null,409);
assert.equal((await call("state",null,host,200)).students.length,1);

// Flexible rounds remain joinable in overtime and after the host advances.
participant = null;
({round,host} = await call("create",{title:"Late flexible join",set:"sealed:YWJj",keys:["A","B"],settings:{seconds:5,strict:false}},"teacher",201));
await call("start",{},host,200);
now += 3000 + 20000;
({participant,student} = await call("join",{name:"Late flexible student"},null,201));
await call("answer",{number:1,answer:"A"},student,200);
await call("next",{number:1},host,200);
({participant,student} = await call("join",{name:"Joined at question two"},null,201));
state = await call("state",null,student,200);
assert.equal(state.current,2);
await call("answer",{number:1,answer:"A"},student,409);
await call("answer",{number:2,answer:"B"},student,200);
await call("close",{},host,200);
await call("join",{name:"After manual close"},null,409);

// Original fixed-timer rounds also allow late arrivals.
participant = null;
({round,host} = await call("create",setup,"teacher",201));
await call("start",{},host,200);
const legacyStart = (await call("state",null,host,200)).started;
now += 3000 + 46000;
({participant,student} = await call("join",{name:"Late legacy student"},null,201));
assert.equal((await call("state",null,student,200)).started,legacyStart);
await call("answer",{number:2,answer:"A"},student,200);
console.log("PASS late joins in legacy, strict and flexible rounds; shared deadlines, missed questions and closed-round rejection");

participant = null;
await call("create", { ...setup, keys: [{ type: "spr", accepted: ["missing"] }],
  settings: { seconds: 45, strict: false, selfPaced: true, calculator: true } }, "teacher", 400);
({ round, host } = await call("create", { title: "Independent Math", set: "sealed:YWJj",
  keys: ["A", { type: "spr", accepted: ["-6/5 (-1.2)"] }, "C"],
  settings: { seconds: 45, strict: false, selfPaced: true, calculator: true } }, "teacher", 201));
({ participant, student } = await call("join", { name: "Independent student" }, null, 201));
await call("start", {}, host, 200);
await call("answer", { number: 3, answer: "C" }, student, 409);
now += 3000;
await call("answer", { number: 3, answer: "C" }, student, 200);
await call("answer", { number: 1, answer: "B" }, student, 200);
now += 1;
await call("answer", { number: 1, answer: "A" }, student, 200);
now -= 1;
await call("answer", { number: 1, answer: "B" }, student, 409);
now += 1;
for (const answer of ["-6/5", "−6 ⁄ 5", "-1,2", "6/-5", "-12/10"]) {
  await call("answer", { number: 2, answer }, student, 200);
  state = await call("state", null, host, 200);
  assert.equal(state.answers.find((a) => a.question_number === 2).correct, 1, answer);
}
await call("answer", { number: 2, answer: "6/0" }, student, 400);
await call("answer", { number: 2, answer: "-5/6" }, student, 200);
state = await call("state", null, host, 200);
assert.equal(state.answers.find((a) => a.question_number === 2).correct, 0);
await call("answer", { number: 2, answer: "-6/5" }, student, 200);
await call("next", { number: 1 }, host, 200);
await call("previous", { number: 2 }, host, 200);
await call("previous", { number: 1 }, host, 409);
state = await call("state", null, student, 200);
assert.equal(state.current, 1);
assert.equal(state.editable, true);
assert.equal(state.selfPaced, true);
assert.equal(state.calculator, true);
assert.equal(state.keys, undefined);
assert.deepEqual(state.answers.map(({ question_number, answer, correct }) => [question_number, answer, correct]).sort((a,b) => a[0] - b[0]),
  [[1, "A", undefined], [2, "-6/5", undefined], [3, "C", undefined]]);
await call("close", {}, host, 200);
await call("answer", { number: 2, answer: "0" }, student, 409);

participant = null;
({ round, host } = await call("create", { ...setup, keys: ["A", "B"],
  settings: { seconds: 5, strict: true, selfPaced: false, calculator: false } }, "teacher", 201));
({ participant, student } = await call("join", { name: "Timed student" }, null, 201));
await call("start", {}, host, 200);
now += 3000;
await call("answer", { number: 1, answer: "B" }, student, 200);
await call("answer", { number: 1, answer: "A" }, student, 200);
await call("answer", { number: 2, answer: "B" }, student, 409);
now += 5000;
await call("answer", { number: 1, answer: "B" }, student, 409);
await call("answer", { number: 2, answer: "B" }, student, 200);
console.log("PASS independent navigation, latest-answer storage, Math fraction grading, editable strict round and preserved deadlines");
