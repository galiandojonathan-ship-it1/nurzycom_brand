// Run 10: Прогноз 1 in the plan (Verbal only) and the mock page offline message
const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch();
  for (const [crs, want] of [["V", true], ["M", false]]) {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 900 } }); await ctx.route(/docs\.google\.com/, (r) => r.abort());
    await ctx.addInitScript((c) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("plan_course", c); }, crs);
    const pg = await ctx.newPage(); await pg.goto("http://127.0.0.1:8767/plan.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(600);
    const a = await pg.$('a[href="mock.html?t=PR1"]'); ok(!!a === want, `plan course ${crs}: Прогноз 1 step ${want ? "shown" : "absent"}`);
    if (a) { await a.click(); await pg.waitForURL(/mock\.html\?t=PR1/); ok(true, "plan link opens mock.html?t=PR1"); }
    await ctx.close(); }
  const ctx = await br.newContext(); await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); });
  const pg = await ctx.newPage(); await pg.route(/data\/mocks\.bin/, (r) => r.abort("internetdisconnected")); await ctx.setOffline(false);
  await pg.goto("http://127.0.0.1:8767/mock.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(500);
  const t = (await pg.textContent("#start-msg")).trim(), role = await pg.getAttribute("#start-msg", "role");
  ok(/Не удалось загрузить данные/.test(t) && role === "alert", `mock data failure: «${t.slice(0, 60)}» role=${role}`);
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
