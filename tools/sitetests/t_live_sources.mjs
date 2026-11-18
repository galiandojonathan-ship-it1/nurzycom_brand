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
console.log("PASS original and configured rounds, strict deadlines, flexible overtime, host advancement, counts above ten and retry safety");
