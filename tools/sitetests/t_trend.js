// «Сегодня» trend: one scale per course; Прогноз included for Verbal; RW-only runs left out for the full course
const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const LAST = { PT1: "RW 30/54 ≈ 560 · Math 25/44 ≈ 580", PT5: "RW 40/54 ≈ 650", PR1: "RW 38/54 ≈ 620", PT2: "RW 35/54 ≈ 600 · Math 30/44 ≈ 640" };
(async () => { const br = await chromium.launch();
  for (const [crs, want] of [["V", "PT1 560, PT2 600, PT5 650, PR1 620"], ["VM", "PT1 1140, PT2 1240"], ["M", "PT1 580, PT2 640"]]) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 } }); await ctx.route(/docs\.google\.com/, (r) => r.abort());
    await ctx.addInitScript(([c, last]) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("plan_course", c);
      Object.entries(last).forEach(([k, v]) => localStorage.setItem(`mk_last_Loop Test_${k}`, v)); }, [crs, LAST]);
    const pg = await ctx.newPage(); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
    await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(700);
    const lab = await pg.getAttribute(".td-trend", "aria-label").catch(() => null);
    ok(lab && lab.endsWith(want), `course ${crs}: trend «${lab}»`);
    if (crs === "V") { const a = await pg.getAttribute('.td-trend a[href="mock.html?t=PR1&r=1"]', "aria-label").catch(() => null); ok(a === "Прогноз 1: результат и разбор", "PR1 point label: " + a); }
    ok(!errs.length, "no page errors " + JSON.stringify(errs)); await ctx.close(); }
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); })();
