// Task done rule (2026-11-12): work submitted BEFORE the task was given counts as done («сделано раньше»); no result = not done;
// a result after the task = done (not early); a ticked custom task = done. Checks PLAN.taskState on the cabinet page. Stand-in 8768.
const { chromium } = require("playwright"); const { seed, page } = require("./cbseed");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const pg = await page(br); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  console.log(await seed(pg)); await pg.goto("http://127.0.0.1:8768/cabinet.html", { waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
  const r = await pg.evaluate(() => { const now = Date.now(), D = 864e5, N = "Ann";
    const tasks = [{ id: "a", t: "early", at: now - D, rk: ["hw_last_", "V01_p3"] }, { id: "b", t: "after", at: now - 3 * D, rk: ["hw_last_", "V02_p3"] },
      { id: "c", t: "none", at: now - D, rk: ["hw_last_", "V03_p3"], due: new Date(now - 2 * D).toISOString().slice(0, 10) }, { id: "d", t: "custom", at: now - D }];
    const vals = { tasks: JSON.stringify(tasks), tasks_done: JSON.stringify(["d"]), [`hw_last_${N}_V01_p3`]: "20/26", [`hw_last_${N}_V02_p3`]: "22/26" };
    const meta = { [`hw_last_${N}_V01_p3`]: now - 5 * D, [`hw_last_${N}_V02_p3`]: now - D };
    const o = {}; PLAN.taskState(N, (k) => vals[k], meta).forEach((x) => (o[x.t] = { done: x.done, early: x.early, late: x.late })); return o; });
  console.log(JSON.stringify(r));
  ok(r.early.done && r.early.early, "submitted before the task → done, marked «раньше»");
  ok(r.after.done && !r.after.early, "submitted after the task → done, not «раньше»");
  ok(!r.none.done && r.none.late, "no result → not done, overdue");
  ok(r.custom.done && !r.custom.early, "ticked custom task → done");
  ok(errs.length === 0, "no page errors " + errs.join("|"));
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
