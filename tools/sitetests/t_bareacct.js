// An account named with a first name only («Erlan») and form answers under «Erlan T»: the student's shared Bluebook tests must
// show in his results card (2026-11-23: Sher's account «Sher» vs his form name «Sher Zh», 20 tests not shown).
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev.mjs <fx> 8768.   usage: node t_bareacct.js [desktop|phone]
const { chromium, devices } = require("playwright"); const { seed, ADMIN } = require("./cbseed"); const { synthetic, tableOf } = require("./bbsynth.cjs");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const CSV = "Timestamp,Student,Lesson,Part,Answers,Score,Wrong,Seconds,Attempt\n20/11/2026 10:00:00,Erlan T,V01,p1 · Практика · экран · 2-я: 4/4,1:A>C 2:A 3:B>A 4:A,2/4,\"1,3\",300,1\n";
(async () => {
  const br = await chromium.launch(), opt = dev === "phone" ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } };
  const tctx = await br.newContext(opt);
  await tctx.addInitScript((A) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("admin_key", A); }, ADMIN);
  const teacher = await tctx.newPage(); const errs = []; teacher.on("pageerror", (e) => errs.push(e.message));
  console.log(await seed(teacher));
  await teacher.evaluate(async () => { const id = await SITE.lid("erl"), entry = await SITE.account("erl", "Erlan", "pass-erl-1234");
    await SITE.api("admin/user?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ entry }) }); });
  const sctx = await br.newContext(opt); await sctx.addInitScript(() => { localStorage.setItem("site_pw", "pass-erl-1234"); localStorage.setItem("site_login", "erl"); localStorage.setItem("hw_student", "Erlan"); });
  const a = await sctx.newPage(); await a.goto(B + "mock.html", { waitUntil: "load" }); await a.waitForSelector("#bb-import:not([hidden])", { timeout: 15000 });
  await a.click("#bb-import summary"); await a.fill("#bb-text", tableOf(synthetic(), "SAT2", { rw: "m2h", math: "m2e" }, "mp", ["rw.1.9"])); await a.click("#bb-go");
  await a.waitForFunction(() => /Отправлено/.test(document.getElementById("bb-status").textContent), null, { timeout: 15000 });
  await teacher.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await teacher.waitForTimeout(2500);
  await teacher.evaluate((csv) => window.TeacherWorkspace.useFile(csv, "bare test"), CSV); await teacher.waitForTimeout(600);
  await teacher.click('#tabs [data-v="students"]'); await teacher.waitForTimeout(300);
  await teacher.click('#v-students tr.click:has-text("Erlan")'); await teacher.click('[data-st="subs"]');
  await teacher.waitForSelector("#st-bb .bbs", { timeout: 20000 }).catch(() => {});
  const t = (await teacher.textContent("#st-bb").catch(() => "")).replace(/\s+/g, " ");
  ok(/SAT Practice Test 2/.test(t), "the account «Erlan» is matched to the form student «Erlan T»: his Bluebook test is in the card");
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
