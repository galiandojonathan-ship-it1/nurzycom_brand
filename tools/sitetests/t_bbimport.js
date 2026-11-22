// Bluebook Score Details import: parser formats and test/route detection (docs/bluebook-import.js), no browser.
// usage: node t_bbimport.js [catalog.json]   (default: a synthetic catalog; pass the real opened data/bluebook.bin locally)
const BB = require("../../docs/bluebook-import.js"), fs = require("fs");
let n = 0, fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); c ? n++ : fails++; };
const { synthetic, tableOf } = require("./bbsynth.cjs");
const cat = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], "utf8")) : synthetic();
const table = (test, routes, fmt, miss) => tableOf(cat, test, routes, fmt, miss);
const tests = Object.keys(cat.tests), t0 = tests[0], hasM = !!cat.tests[t0].math, N = hasM ? 98 : 54;
const misses = ["rw.1.9", "math.2.8", "math.2.22o"], wantMiss = misses.filter((m) => hasM || m.startsWith("rw")).join();
for (const fmt of ["tab", "lines", "md", "nbsp"]) {
  const rows = BB.parse(table(t0, { rw: "m2h", math: "m2h" }, fmt, misses));
  const bad = rows.filter((r) => r.status !== "correct").map((r) => `${r.section}.${r.module}.${r.question}${r.status === "omitted" ? "o" : ""}`);
  ok(rows.length === N && bad.join() === wantMiss, `format «${fmt}»: ${N} rows, exact misses ${bad.join(" ")}`);
}
const page = "College Board · My Practice\nScore Details\nTotal Score 1340\nQuestion\tSection\tCorrect Answer\tYour Answer\tActions\n" + table(t0, { rw: "m2e", math: "m2h" }, "tab", misses) + "\n\nNeed help? Contact us\n© 2026 College Board\nPrivacy Policy";
ok(BB.parse(page).length === N, `a whole-page copy (Ctrl+A) with header and footer text still gives ${N} rows`);
let allUnique = true, det = 0;
for (const t of tests) for (const rr of ["m2e", "m2h"]) for (const rm of ["m2e", "m2h"]) {
  const rows = BB.parse(table(t, { rw: rr, math: rm }, "tab", misses));
  for (const [sec, want] of [["rw", rr], ["math", rm]]) { if (!cat.tests[t][sec]) continue; const d = BB.detect(rows, cat, sec); det++;
    if (!d.match || d.match.test !== t || d.match.route !== want) { allUnique = false; console.log("  no unique match", t, sec, want, d.matches.map((x) => x.test + x.route)); } }
}
ok(allUnique, `every test and route is recognised uniquely from the keys alone (${det} section checks over ${tests.length} tests)`);
{ const rows = BB.parse(table(t0, { rw: "m2h", math: "m2h" })); rows.find((r) => r.section === "rw" && r.module === 2 && r.question === 5).answers = ["Z"];
  ok(BB.detect(rows, cat, "rw").match === null, "one changed key → the section is not matched, skills stay hidden"); }
ok(BB.canon("441/100") === BB.canon("4.410") && BB.canon("4.4101") !== BB.canon("4.41") && BB.canon("-3/2") === BB.canon("−1.5") && BB.canon(".5") === BB.canon("1/2"), "exact numbers: 441/100 = 4.410 ≠ 4.4101, −3/2 = −1.5, .5 = 1/2");
const err = (txt) => { try { BB.parse(txt); return ""; } catch (e) { return e.message; } };
const full = table(t0, { rw: "m2h", math: "m2h" }).split("\r\n");
ok(/из 27 \+ 27/.test(err(full.filter((_, i) => i !== 40).join("\n"))) || /Порядок/.test(err(full.filter((_, i) => i !== 40).join("\n"))), "a lost row asks to copy again: " + err(full.filter((_, i) => i !== 40).join("\n")).slice(0, 70));
ok(/Порядок/.test(err([full[1], full[0], ...full.slice(2)].join("\n"))), "a swapped order asks to copy again");
ok(/не найдены/.test(err("hello\nworld")), "random text: «Строки таблицы не найдены»");
{ const rw = table(t0, { rw: "m2h", math: "m2h" }).split("\r\n").slice(0, 54).join("\n"); const rows = BB.parse(rw);
  ok(rows.length === 54 && BB.detect(rows, cat, "rw").match, "a Reading and Writing-only test (54 rows) is read and recognised"); }
console.log(fails ? `${fails} FAILED` : `ALL PASS (${n})`); process.exit(fails ? 1 : 0);
