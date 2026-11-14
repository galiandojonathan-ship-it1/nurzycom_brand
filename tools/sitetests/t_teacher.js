// Teacher page with Прогноз and PT13 rows: names, tests tab, lessons tab, no page errors
const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1280, height: 900 } }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); });
  await pg.route(/docs\.google\.com/, (r) => r.abort());
  await pg.goto("http://127.0.0.1:8767/teacher.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(500);
  await pg.setInputFiles("#file", __dirname + "/run11.csv"); await pg.waitForTimeout(1200);
  const body = await pg.evaluate(() => document.querySelector("#dash").innerText);
  ok(/Прогноз 1/.test(body), "dashboard names PR1 «Прогноз 1»"); ok(!/Пробный тест 1 · RW · M1 20/.test(body), "PR1 not called «Пробный тест»");
  const tabs = await pg.$$eval("#dash [role=tab], #dash nav button, #dash .tabs button", (a) => a.map((b) => b.textContent.trim())); console.log("tabs:", tabs.join(" | "));
  const tt = await pg.$("text=Пробные тесты"); if (tt) { await tt.click(); await pg.waitForTimeout(1500); }
  const chips = await pg.$$eval("#t-mock .chip", (a) => a.map((b) => b.textContent.trim())); console.log("test chips:", chips.join(" "));
  ok(chips.some((c) => /^PR1 · 2$/.test(c)), "tests tab: PR1 chip shows 2 students"); ok(chips.some((c) => /^PT13 · 1$/.test(c)), "tests tab: PT13 chip shows 1 student");
  const h = await pg.evaluate(() => document.querySelector("#v-tests h2 + p + div") && document.querySelector("#v-tests").innerText.slice(0, 400)); console.log("tests view:", (h || "").replace(/\s+/g, " ").slice(0, 300));
  await pg.click('#t-mock .chip[data-m="PR1"]'); await pg.waitForTimeout(1500);
  const runs = await pg.$$eval("#v-tests .tw", (t) => t.length ? [...t[0].querySelectorAll("tbody tr")].map((r) => r.innerText.replace(/\s+/g, " ")) : []); console.log("PR1 runs:", runs);
  ok(runs.length === 2, "PR1: two runs listed"); const nq = await pg.$$eval("#t-list details", (a) => a.length); ok(nq === 27, "PR1 module 1: 27 questions (" + nq + ")");
  const lt = await pg.$("text=Уроки"); if (lt) { await lt.click(); await pg.waitForTimeout(800); const lh = await pg.evaluate(() => document.querySelector("#dash").innerText); const m = lh.match(/(Прогноз 1|Пробный тест 13)[^\n]*/g); console.log("lessons view titles:", m && m.slice(0, 4)); }
  ok(!errs.length, "no page errors " + JSON.stringify(errs)); await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); })();
