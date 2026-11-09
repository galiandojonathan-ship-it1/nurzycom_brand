const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.addInitScript(() => localStorage.setItem("site_pw", "fixture-pw"));
  await pg.goto("http://127.0.0.1:8765/teacher.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(500);
  console.log(await pg.evaluate(() => [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > innerWidth + 0.5).slice(0, 8).map((e) => e.tagName + "#" + e.id + "." + e.className + " r=" + Math.round(e.getBoundingClientRect().right) + " w=" + Math.round(e.getBoundingClientRect().width))));
  await br.close(); })();
