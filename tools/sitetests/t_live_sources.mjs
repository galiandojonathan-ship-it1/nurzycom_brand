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
console.log("PASS: authorization, join, synchronized deadlines, single submissions, live scores, and answer-key visibility");
