const { chromium } = require("playwright");
(async () => { const br = await chromium.launch();
  for (const u of ["teacher.html", "index.html"]) { const pg = await br.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.addInitScript(() => localStorage.setItem("site_pw", "fixture-pw"));
  await pg.goto("http://127.0.0.1:8765/" + u, { waitUntil: "networkidle" }); await pg.waitForTimeout(800);
  await pg.mouse.wheel(400, 0); await pg.waitForTimeout(200);
  console.log(u, await pg.evaluate(() => ({ scrollX, ox: getComputedStyle(document.documentElement).overflowX }))); await pg.close(); }
  await br.close(); })();
