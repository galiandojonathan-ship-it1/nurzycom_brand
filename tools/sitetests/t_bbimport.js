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
{ const rows = BB.parse(table(t0, { rw: "m2h", math: "m2h" })), typed = rows.filter((r) => r.section === "math" && !/^[A-D]$/.test(r.answers[0]));
  typed.forEach((r) => { r.answers = r.answers.slice(0, 1).concat(["9999.9"]); });   // Score Details may list a typed key with extra forms
  if (typed.length) ok(BB.detect(rows, cat, "math").match, `typed keys listed with extra or fewer forms still match (${typed.length} typed answers)`); }
ok(BB.canon("441/100") === BB.canon("4.410") && BB.canon("4.4101") !== BB.canon("4.41") && BB.canon("-3/2") === BB.canon("−1.5") && BB.canon(".5") === BB.canon("1/2"), "exact numbers: 441/100 = 4.410 ≠ 4.4101, −3/2 = −1.5, .5 = 1/2");
const err = (txt) => { try { BB.parse(txt); return ""; } catch (e) { return e.message; } };
const full = table(t0, { rw: "m2h", math: "m2h" }).split("\r\n");
ok(/из 27 \+ 27/.test(err(full.filter((_, i) => i !== 40).join("\n"))) || /Порядок/.test(err(full.filter((_, i) => i !== 40).join("\n"))), "a lost row asks to copy again: " + err(full.filter((_, i) => i !== 40).join("\n")).slice(0, 70));
ok(/Порядок/.test(err([full[1], full[0], ...full.slice(2)].join("\n"))), "a swapped order asks to copy again");
ok(/не найдены/.test(err("hello\nworld")), "random text: «Строки таблицы не найдены»");
{ const rw = table(t0, { rw: "m2h", math: "m2h" }).split("\r\n").slice(0, 54).join("\n"); const rows = BB.parse(rw);
  ok(rows.length === 54 && BB.detect(rows, cat, "rw").match, "a Reading and Writing-only test (54 rows) is read and recognised"); }
// the real My Practice page (header with test and date, totals, domains), and the same page with «Show Correct Answers» off
(async () => {
  const mpMiss = misses.filter((m) => !m.endsWith("o")), mp = table(t0, { rw: "m2h", math: "m2e" }, "mp", mpMiss), off = table(t0, { rw: "m2h", math: "m2e" }, "mp-off", mpMiss);
  const meta = BB.parseMeta(mp), rows = BB.parse(mp);
  ok(meta.num === +t0.slice(3) && new Date(meta.taken).getFullYear() === 2025 && meta.total === rows.length && meta.correct === rows.length - mpMiss.filter((m) => hasM || m.startsWith("rw")).length, `My Practice page: test ${meta.title}, date, totals ${meta.correct}/${meta.total} match the rows`);
  ok(meta.domains && meta.domains.rw["Expression of Ideas"].join("/") === "5/7" && meta.domains.math["Geometry and Trigonometry"].join("/") === "6/7", "official domain scores are read (Knowledge and Skills)");
  const r2 = BB.fillKeys(BB.parse(off), cat), m1 = rows.filter((r) => r.status !== "correct"), m2 = r2.filter((r) => r.status !== "correct");
  ok(BB.detect(r2, cat, "rw").match && m2.every((r, i) => r.answers.length && BB.canon(r.answers[0]) === BB.canon(m1[i].answers[0])), "«Show Correct Answers» off: the test is still recognised and the keys of the misses come from the catalog");
  const h1 = await BB.shareOf(rows, cat, meta), h2 = await BB.shareOf(r2, cat, BB.parseMeta(off));
  ok(h1.hash === h2.hash && h1.taken === meta.taken && h1.sections.rw.domains, "the same attempt copied with the switch on or off is one record, with the date and domains");
  // the page lets the student sort the table: «Question» once turns it over; sorted by number interleaves the modules
  const lines = table(t0, { rw: "m2h", math: "m2e" }, "tab", mpMiss).split("\r\n"), want = BB.parse(lines.join("\n")).map((r) => `${r.section}${r.module}.${r.question}:${r.status}`).join();
  const got = (l) => { try { return BB.parse(l.join("\n")).map((r) => `${r.section}${r.module}.${r.question}:${r.status}`).join(); } catch (e) { return e.message; } };
  ok(got(lines.slice().reverse()) === want, "a table turned over (last question first) reads the same rows and modules");
  const byNum = lines.map((l, i) => ({ l, i, q: +l.split("\t")[0] })).sort((x, y) => x.q - y.q || x.i - y.i).map((x) => x.l);
  ok(got(byNum) === want, "a table sorted by question number (modules interleaved) reads the same rows and modules");
  const mpRev = (() => { const head = mp.slice(0, mp.indexOf("\n1\t")), rowsTxt = mp.slice(mp.indexOf("\n1\t") + 1, mp.indexOf("\nTop")), tail = mp.slice(mp.indexOf("\nTop"));
    const blocks = rowsTxt.split(/\n(?=\d+\t(?:Reading|Math))/); return head + "\n" + blocks.reverse().join("\n") + tail; })();
  ok(got(mpRev.split("\n")) === want.replace(/./g, (c) => c) && BB.detect(BB.parse(mpRev), cat, "rw").match, "the real My Practice page turned over is read and recognised");
  // a student who solves only Math: every Reading and Writing answer omitted. Those blanks are not mistakes
  { const onlyMath = table(t0, { rw: "m2e", math: "m2h" }, "tab", [...Array.from({ length: 27 }, (_, i) => `rw.1.${i + 1}o`), ...Array.from({ length: 27 }, (_, i) => `rw.2.${i + 1}o`), "math.1.3"]);
    const rows = BB.parse(onlyMath), sk = BB.skipOf(rows.filter((r) => r.section === "rw"), "rw"), sh = await BB.shareOf(rows, cat, {});
    ok(sk.skip[0] && sk.skip[1] && sh.sections.rw.skip && sh.sections.rw.miss.length === 0 && (!hasM || sh.sections.math.miss.length === 1), "only Math solved: Reading and Writing is marked «не решался», its 54 blanks are not shared as misses; the Math miss stays");
    const half = table(t0, { rw: "m2h", math: "m2e" }, "tab", ["rw.1.5", ...Array.from({ length: 25 }, (_, i) => `rw.2.${i + 1}o`)]), sh2 = await BB.shareOf(BB.parse(half), cat, {});
    ok(sh2.sections.rw.skip && !sh2.sections.rw.skip[0] && sh2.sections.rw.skip[1] && sh2.sections.rw.miss.length === 1, "module 2 left blank (25 of 27): only that module is «не решался», the module 1 miss stays");
    const few = table(t0, { rw: "m2h", math: "m2e" }, "tab", ["rw.2.1o", "rw.2.2o", "rw.2.3o"]), sh3 = await BB.shareOf(BB.parse(few), cat, {});
    ok(!sh3.sections.rw.skip && sh3.sections.rw.miss.length === 3, "a few blanks in a module that was solved still count (3 omitted = 3 misses)"); }
  const v10 = mp.split("\n").slice(0, mp.split("\n").findIndex((l) => /^11\t/.test(l))).join("\n");
  ok(/View: All/.test((() => { try { BB.parse(v10); return ""; } catch (e) { return e.message; } })()), "«View: 10» copy: the message says to choose View: All");
  console.log(fails ? `${fails} FAILED` : `ALL PASS (${n})`); process.exit(fails ? 1 : 0);
})();
