// «Персональные ДЗ · Gemini» (hwplan.js) in «Анализ группы»: the block, the section from the group name, the plan per student, no errors.
// Plan rules: t_hwplan.mjs. A full run (Gemini, save, assign) was checked on a local copy of real data.
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev_gemini.mjs <fx> 8768.   usage: node t_hwplan_ui.js [desktop|phone]
const { chromium, devices } = require("playwright"); const { seed, ADMIN } = require("./cbseed"); const { synthetic, tableOf } = require("./bbsynth.cjs");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const CSV = "Timestamp,Student,Lesson,Part,Answers,Score,Wrong,Seconds,Attempt\n" +
  "10/10/2026 10:00:00,Ayana Seitkali,V01,p1 · Практика · экран · 2-я: 4/4,1:A>C 2:A 3:B>A 4:A,2/4,\"1,3\",300,1\n" +
  "20/11/2026 10:00:00,Ayana Seitkali,V01,p2 · Практика · экран,1:A 2:B 3:C 4:D,3/4,4,250,1\n" +
  "21/11/2026 10:00:00,Dias Omarov,V01,p2 · Практика · экран,1:A 2:B 3:C 4:D,2/4,\"3,4\",250,1\n";
(async () => {
  const br = await chromium.launch(), opt = dev === "phone" ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } };
  const tctx = await br.newContext(opt);
  await tctx.addInitScript((A) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("admin_key", A); }, ADMIN);
  const teacher = await tctx.newPage(); const errs = []; teacher.on("pageerror", (e) => errs.push(e.message));
  console.log(await seed(teacher));
  // Ayana shares a Bluebook test (taken 2 March 2025) so the index is drawn over a long period
  const sctx = await br.newContext(opt); await sctx.addInitScript(() => { localStorage.setItem("site_pw", "pass-ayana-1234"); localStorage.setItem("site_login", "ayana"); localStorage.setItem("hw_student", "Ayana Seitkali"); });
  const a = await sctx.newPage(); await a.goto(B + "mock.html", { waitUntil: "load" }); await a.waitForSelector("#bb-import:not([hidden])", { timeout: 15000 });
  await a.click("#bb-import summary"); await a.fill("#bb-text", tableOf(synthetic(), "SAT2", { rw: "m2h", math: "m2e" }, "mp", ["rw.1.9", "math.2.8"])); await a.click("#bb-go");
  await a.waitForFunction(() => /Отправлено/.test(document.getElementById("bb-status").textContent), null, { timeout: 15000 });
  // a cabinet group with Ayana and Dias
  await teacher.evaluate(async () => { const ids = [await SITE.lid("ayana"), await SITE.lid("dias")];
    const data = { groups: [{ id: "g1", name: "SAT Verbal А", kind: "group", color: "blue", members: ids }], archived: [], at: Date.now() };
    await SITE.api("admin/groups", { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob(data) }) }); localStorage.removeItem("cb_groups"); });
  const open = async () => { await teacher.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await teacher.waitForTimeout(2500);
    await teacher.evaluate((csv) => window.TeacherWorkspace.useFile(csv, "start test"), CSV); await teacher.waitForTimeout(600); };
  await open();
  await teacher.click('#tabs [data-v="group"]'); await teacher.waitForSelector("#ga-hw .hwp", { timeout: 30000 });
  ok(/Персональные ДЗ · Gemini/.test(await teacher.textContent("#ga-hw")), "the block is in «Анализ группы» for a cabinet group");
  ok((await teacher.$eval("#hwp-sec", (s) => s.value)) === "rw", "a Verbal group: section «Reading and Writing» by default");
  await teacher.click("#hwp-plan");
  await teacher.waitForFunction(() => /План:|Домашек по плану нет/.test((document.getElementById("hwp-msg") || {}).textContent || ""), null, { timeout: 60000 });
  const rows = await teacher.$$eval("#ga-hw tbody tr", (x) => x.map((r) => r.innerText.replace(/\s+/g, " "))); console.log(rows.join("\n"));
  ok(rows.length === 2 && rows.every((r) => /пропущен:|ДЗ/.test(r)), "a plan line for each of the 2 students");
  if (dev === "phone") ok((await teacher.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
