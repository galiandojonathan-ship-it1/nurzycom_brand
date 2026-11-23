// «Прогресс ученика» with all sources (2026-11-23): homework, site practice tests, shared Bluebook results and live-lesson rounds;
// source switches remembered per student, the domain chart (domain + its College Board skills), the «Уроки · живая практика» block.
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev.mjs <fx> 8768.   usage: node t_progsrc.js [desktop|phone]
const { chromium, devices } = require("playwright"); const { seed, ADMIN } = require("./cbseed"); const { synthetic, tableOf } = require("./bbsynth.cjs");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const CSV = "Timestamp,Student,Lesson,Part,Answers,Score,Wrong,Seconds,Attempt\n20/11/2026 10:00:00,Ayana Seitkali,V01,p1 · Практика · экран · 2-я: 4/4,1:A>C 2:A 3:B>A 4:A,2/4,\"1,3\",300,1\n";
(async () => {
  const br = await chromium.launch(), opt = dev === "phone" ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } };
  const tctx = await br.newContext(opt);
  await tctx.addInitScript((A) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("admin_key", A); }, ADMIN);
  const teacher = await tctx.newPage(); const errs = []; teacher.on("pageerror", (e) => errs.push(e.message));
  console.log(await seed(teacher));
  // a lesson account with one live round that Ayana answered (what livepractice.js saves when a round ends)
  await teacher.evaluate(async () => {
    const id = await SITE.lid("lesson"), entry = await SITE.account("lesson", "Урок", "pass-lesson-1234");
    await SITE.api("admin/user?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ entry }) });
    const rec = { v: 1, round: "r1", at: Date.UTC(2026, 10, 18, 10), title: "SAT Verbal · Урок 1 · Практика", items: [1, 2, 3, 4].map((n) => ({ ref: `V01.p1.${n}`, sk: "Words in Context", d: "M", type: "mc", sec: "rw" })),
      students: [{ name: "Ayana Seitkali", ans: { 1: ["A", 1], 2: ["B", 0], 3: ["C", 1], 4: ["D", 1] } }, { name: "Dias Omarov", ans: { 1: ["A", 1] } }] };
    await SITE.api("admin/progress?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({ lv_r_r1: { v: JSON.stringify(rec), t: Date.now() } }) }) });
  });
  // Ayana shares a Bluebook result (two misses), taken on 2 March 2025
  const sctx = await br.newContext(opt); await sctx.addInitScript(() => { localStorage.setItem("site_pw", "pass-ayana-1234"); localStorage.setItem("site_login", "ayana"); });
  const a = await sctx.newPage(); await a.goto(B + "mock.html", { waitUntil: "load" }); await a.waitForSelector("#bb-import:not([hidden])", { timeout: 15000 });
  await a.click("#bb-import summary"); await a.fill("#bb-text", tableOf(synthetic(), "SAT2", { rw: "m2h", math: "m2e" }, "mp", ["rw.1.9", "math.2.8"])); await a.click("#bb-go");
  await a.waitForFunction(() => /Отправлено/.test(document.getElementById("bb-status").textContent), null, { timeout: 15000 });
  // a second attempt where she solved only Math: its Reading and Writing blanks must not enter the analysis
  const om = [...Array.from({ length: 27 }, (_, i) => `rw.1.${i + 1}o`), ...Array.from({ length: 27 }, (_, i) => `rw.2.${i + 1}o`)];
  await a.fill("#bb-text", tableOf(synthetic(), "SAT3", { rw: "m2e", math: "m2h" }, "tab", om)); await a.click("#bb-go");
  await a.waitForFunction(() => /Отправлено/.test(document.getElementById("bb-status").textContent) && /SAT Practice Test 3/.test(document.getElementById("bb-sent").textContent), null, { timeout: 15000 });
  // the teacher's card
  const open = async () => { await teacher.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await teacher.waitForTimeout(2500);
    await teacher.evaluate((csv) => window.TeacherWorkspace.useFile(csv, "src test"), CSV); await teacher.waitForTimeout(600);
    await teacher.click('#tabs [data-v="students"]'); await teacher.waitForTimeout(300);
    await teacher.click('#v-students tr.click:has-text("Ayana")'); await teacher.waitForSelector("#st-prog .pg-src", { timeout: 20000 }); };
  await open();
  const chips = await teacher.$$eval("#st-prog .pg-src .chip", (x) => x.map((c) => c.textContent.replace(/\s+/g, " ").trim()));
  console.log("sources:", chips.join(" | "));
  ok(chips.some((c) => /^Домашние \d+$/.test(c)) && chips.some((c) => /^Bluebook 142$/.test(c)) && chips.some((c) => /^Уроки 4$/.test(c)), "source switches: homework, Bluebook (98 + 44: the Math-only attempt adds no Reading and Writing blanks), lessons (4 answers in the round)");
  const idx1 = (await teacher.textContent("#st-prog .pg-big")).trim();
  ok(/^\d+$/.test(idx1), "with Bluebook the index has enough answers to be drawn: " + idx1);
  ok(await teacher.$("#st-prog #pg-dom svg") && /в целом/.test(await teacher.textContent("#pg-domleg")), "the domain chart is drawn with the domain line in its legend");
  const doms = await teacher.$$eval("#st-prog [data-pd]", (x) => x.map((b) => b.textContent)); ok(doms.length === 8, "8 domains to choose (both sections): " + doms.join(", "));
  await teacher.click('#st-prog [data-pd="math:0"]'); await teacher.waitForTimeout(300);
  ok((await teacher.getAttribute('#st-prog [data-pd="math:0"]', "aria-pressed")) === "true", "a domain chip switches the chart");
  // switch Bluebook off: the counts stay, the switch is remembered after reopening the card
  await teacher.click('#st-prog [data-src="bb"]'); await teacher.waitForTimeout(500);
  ok((await teacher.getAttribute('#st-prog [data-src="bb"]', "aria-pressed")) === "false", "«Bluebook» can be switched off");
  await open();
  ok((await teacher.getAttribute('#st-prog [data-src="bb"]', "aria-pressed")) === "false", "the choice is remembered for this student");
  await teacher.click('#st-prog [data-src="bb"]'); await teacher.waitForTimeout(400);
  // the last source cannot be switched off
  await teacher.click('#st-prog [data-src="hw"]'); await teacher.waitForTimeout(300); await teacher.click('#st-prog [data-src="live"]'); await teacher.waitForTimeout(300); await teacher.click('#st-prog [data-src="bb"]'); await teacher.waitForTimeout(300);
  ok((await teacher.getAttribute('#st-prog [data-src="bb"]', "aria-pressed")) === "true", "at least one source always stays on");
  await teacher.click('#st-prog [data-src="hw"]'); await teacher.waitForTimeout(300); await teacher.click('#st-prog [data-src="live"]'); await teacher.waitForTimeout(300);
  await teacher.waitForSelector("#st-live table", { timeout: 15000 });
  const live = (await teacher.textContent("#st-live")).replace(/\s+/g, " ");
  ok(/Уроки · живая практика/.test(live) && /SAT Verbal · Урок 1 · Практика/.test(live) && /4\/4/.test(live), "«Уроки · живая практика» lists the round with her answers 4/4 and 3 right");
  if (dev === "phone") ok((await teacher.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  await (await teacher.$("#st-prog")).screenshot({ path: `${__dirname}/progsrc_${dev}.png` });
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
