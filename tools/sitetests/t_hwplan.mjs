// «Персональные ДЗ · Gemini»: the plan rules of docs/hwplan.js (pure, no browser).   usage: node t_hwplan.mjs
import { createRequire } from "node:module"; const require = createRequire(import.meta.url);
const H = require("../../docs/hwplan.js");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const it = (k, name, skill, now, st, extra = {}) => ({ k, name, skill, sec: "rw", now, st, n: 10, need: null, ...extra });
const mis = (id, sk, focus, ts) => ({ id, sec: "rw", sk, focus, ts, d: "M", chosen: "A" });

// weak almost everywhere → one big homework, one mistake per weak College Board skill, 3 questions each
const weakSm = { items: [it("a", "Переход-контраст", "Transitions", 11, "weak"), it("b", "Переход-уступка", "Transitions", 17, "weak"), it("c", "Точка с запятой", "Boundaries", 16, "weak"),
  it("d", "Точное слово", "Words in Context", 10, "weak"), it("e", "Синтез", "Rhetorical Synthesis", 18, "weak")], top: [] };
const weakPool = [mis("q1", "Transitions", "Переход-уступка", 5), mis("q2", "Transitions", "Переход-контраст", 3), mis("q3", "Boundaries", "", 4), mis("q4", "Words in Context", "Точное слово", 9)];
const w = H.plan(weakSm, weakPool, 3);
ok(w.mode === "broad" && w.hws.length === 1, "weak everywhere: exactly one homework");
ok(w.hws[0].mistakes.length === 3 && w.hws[0].size === 9, "one mistake per weak skill that has a mistake (Synthesis has none): 3 skills × 3 = 9");
ok(w.hws[0].mistakes[0].sk === "Words in Context" && w.hws[0].mistakes.find((m) => m.sk === "Transitions").id === "q2", "skills from the weakest; within a skill the mistake of its weakest subtopic");
ok(w.hws[0].mistakes.find((m) => m.sk === "Boundaries").focus === "Точка с запятой", "a mistake without a subtopic tag gets the skill's weakest subtopic as focus");

// a stronger student → up to N homeworks of 10 on the relatively weakest subtopics
const strongSm = { items: [it("a", "Переход-контраст", "Transitions", 57, "mid"), it("b", "Запятая", "Boundaries", 62, "mid"), it("c", "Точное слово", "Words in Context", 59, "mid"),
  it("d", "Вывод", "Inferences", 80, "ok"), it("e", "Синтез", "Rhetorical Synthesis", 85, "ok")] };
strongSm.top = [strongSm.items[2], strongSm.items[0]];
const strongPool = [mis("s1", "Words in Context", "Точное слово", 9), mis("s2", "Transitions", "", 8), mis("s3", "Boundaries", "Запятая", 7), mis("s4", "Inferences", "Вывод", 1)];
const s3 = H.plan(strongSm, strongPool, 3);
ok(s3.mode === "focus" && s3.hws.length === 3, "stronger student: 3 homeworks");
ok(s3.hws.map((h) => h.topic).join("|") === "Точное слово|Переход-контраст|Запятая", "order: «добить» first, then the lowest level: " + s3.hws.map((h) => h.topic).join("|"));
ok(s3.hws.every((h) => h.size === 10 && h.mistakes.length === 4 && h.mistakes.every((m) => m.focus === h.topic)), "each homework: 10 questions asked as 4 mistakes × 3, all focused on its subtopic");
ok(s3.hws[1].mistakes[0].id === "s2", "a subtopic without a tagged mistake uses a mistake of its skill");
ok(H.plan(strongSm, strongPool, 1).hws.length === 1, "the number of homeworks follows the setting");
ok(!H.plan(strongSm, strongPool, 3).hws.some((h) => h.topic === "Синтез"), "no homework where there is no mistake to build on");

// section filter: a Verbal group gets no Math homework
const mixSm = { items: [...strongSm.items, { ...it("m", "Линейная функция", "Linear functions", 20, "weak"), sec: "math" }], top: [] };
const mixPool = [...strongPool, { ...mis("m1", "Linear functions", "Линейная функция", 10), sec: "math" }];
ok(H.plan(mixSm, mixPool, 3).hws[0].topic === "Линейная функция", "both sections: the weakest is the Math subtopic");
ok(H.plan(mixSm, mixPool, 3, "rw").hws.every((h) => h.mistakes.every((m) => m.sec === "rw")), "section RW: no Math homework and no Math mistakes");

// skips
ok(/мало данных/.test(H.plan({ items: weakSm.items.slice(0, 2), top: [] }, weakPool).skip || ""), "fewer than 3 subtopics: skipped");
ok(/нет ошибок/.test(H.plan(strongSm, []).skip || ""), "no mistakes: skipped");
ok(H.plan(strongSm, [{ ...mis("x", "Made up skill", "", 1) }]).skip, "a mistake with a skill Gemini does not accept is not used");

// trim keeps about 30% decoys
const qs = [...Array(9).fill(0).map((_, i) => ({ id: "t" + i, kind: "target" })), ...Array(3).fill(0).map((_, i) => ({ id: "d" + i, kind: "decoy" }))];
const t = H.trim(qs, 10);
ok(t.length === 10 && t.filter((q) => q.kind === "decoy").length === 3, "trim: 10 questions, 3 of them decoys");
ok(H.trim(qs.slice(0, 5), 10).length === 5, "trim never adds");
console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
