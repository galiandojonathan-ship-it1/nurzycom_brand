// «Начало работы» (2026-11-23): a student's own start date and a group's start date; the date is marked on the charts, the card
// has «С начала работы», the PDF says it, and «Анализ группы» counts results from the group's date.
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev.mjs <fx> 8768.   usage: node t_workstart.js [desktop|phone]
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
    const data = { groups: [{ id: "g1", name: "Группа А", kind: "group", color: "blue", members: ids }], archived: [], at: Date.now() };
    await SITE.api("admin/groups", { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob(data) }) }); localStorage.removeItem("cb_groups"); });
  const open = async () => { await teacher.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await teacher.waitForTimeout(2500);
    await teacher.evaluate((csv) => window.TeacherWorkspace.useFile(csv, "start test"), CSV); await teacher.waitForTimeout(600); };
  await open();
  // the group's start date: earlier results stop counting
  await teacher.click('#tabs [data-v="group"]'); await teacher.waitForSelector("#ga-start", { timeout: 30000 });
  const before = (await teacher.textContent("#v-group .kpis, #v-group")).match(/Ответов\s*(\d+)/);
  await teacher.fill("#ga-start", "2026-11-01"); await teacher.click("#ga-start-save");
  await teacher.waitForFunction(() => /до 1 нояб/.test((document.getElementById("ga-start-st") || {}).textContent || ""), null, { timeout: 20000 });
  const after = (await teacher.textContent("#v-group")).match(/Ответов\s*(\d+)/);
  ok(before && after && +after[1] < +before[1], `the group's date leaves out earlier results: answers ${before && before[1]} → ${after && after[1]}`);
  // a student card: the group's date is shown and marked on the charts
  await teacher.click('#tabs [data-v="students"]'); await teacher.waitForTimeout(300);
  await teacher.click('#v-students tr.click:has-text("Ayana")'); await teacher.waitForSelector("#st-goal .st-goal", { timeout: 20000 }); await teacher.waitForTimeout(1500);
  ok(/начало работы 1 нояб\. 2026 \(группа «Группа А»\)/.test((await teacher.textContent("#st-goal")).replace(/\s+/g, " ")), "the card shows the group's start date");
  // her own date wins over the group's
  await teacher.click("#goal-edit"); await teacher.fill("#goal-start", "2026-11-10"); await teacher.click("#goal-f button[type=submit]");
  await teacher.waitForFunction(() => /начало работы 10 нояб/.test(document.getElementById("st-goal").textContent), null, { timeout: 20000 });
  ok(!/группа «Группа А»/.test(await teacher.textContent("#st-goal")), "a student's own start date replaces the group's");
  await teacher.click('[data-st="charts"]'); await teacher.waitForSelector("#st-prog .pg-since", { timeout: 30000 });
  const since = (await teacher.textContent("#st-prog .pg-since")).replace(/\s+/g, " "); console.log("since:", since.slice(0, 200));
  ok(/С начала работы · 10 нояб\. 2026/.test(since) && /ответов с первой попытки/.test(since), "the progress block has «С начала работы»");
  ok((await teacher.$$eval("#st-prog line[stroke='#A63328']", (x) => x.length)) >= 1, "the start date is a red line on the charts");
  ok((await teacher.getAttribute("#st-prog [data-pw='-1']", "aria-pressed")) === "true", "the period «С начала работы» is chosen by default");
  // the PDF
  await teacher.click("#st-pdf"); await teacher.waitForSelector("#rp .rp-sheet", { timeout: 20000 });
  const pdf = (await teacher.textContent("#rp-sheet")).replace(/\s+/g, " ");
  ok(/С начала работы/.test(pdf), "the PDF report mentions the start date");
  if (dev === "phone") ok((await teacher.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
