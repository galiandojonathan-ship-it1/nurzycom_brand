const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.addInitScript(() => localStorage.setItem("site_pw", "fixture-pw"));
  await pg.goto("http://127.0.0.1:8765/teacher.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(1500);
  console.log(await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, cw: document.documentElement.clientWidth,
    wide: [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5).slice(0, 6).map((e) => e.tagName + "#" + e.id + "." + String(e.className).slice(0,30) + " r=" + Math.round(e.getBoundingClientRect().right)) })));
  await br.close(); })();
