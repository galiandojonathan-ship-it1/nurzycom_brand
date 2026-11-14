const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1100, height: 1000 }, deviceScaleFactor: 2 });
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); });
  await pg.route(/docs\.google\.com/, (r) => r.abort());
  await pg.goto("http://127.0.0.1:8767/teacher.html", { waitUntil: "networkidle" }); await pg.setInputFiles("#file", __dirname + "/solo.csv"); await pg.waitForTimeout(900);
  await pg.click('#tabs .chip[data-v="students"]'); await pg.click('#v-students tr.click:has-text("Ayana")'); await pg.waitForTimeout(400);
  await pg.click("#v-students .to-hw"); await pg.waitForSelector("#hw-list details"); await pg.waitForTimeout(500);
  const b = await pg.$("#st-hw .hwrev"); await b.screenshot({ path: __dirname + "/../teacher-solo-review.png" }); await br.close(); })();
