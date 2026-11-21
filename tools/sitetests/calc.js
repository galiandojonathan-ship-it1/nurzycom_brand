const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); pg.on("dialog", (d) => d.accept());
  await pg.route(/docs\.google\.com/, (r) => r.abort());
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); });
  await pg.goto("http://127.0.0.1:8767/desmos.html", { waitUntil: "networkidle" }); await pg.click('.set[data-s="D01"]'); await pg.click("#go"); await pg.waitForSelector("#s-solve:not(.hidden)");
  await pg.click("#sv-hint"); await pg.waitForTimeout(800);
  const r = await pg.evaluate(() => { const c = document.querySelector(".bb-calc").getBoundingClientRect(), k = document.querySelector("#sv-check").getBoundingClientRect(), x = document.querySelector(".bb-calc [aria-label*='акры'], .bb-calc button");
    return { calc: [Math.round(c.left), Math.round(c.top), Math.round(c.width), Math.round(c.height)], check: [Math.round(k.left), Math.round(k.top)], vh: innerHeight, close: x ? x.getAttribute("aria-label") || x.textContent : null }; });
  console.log(JSON.stringify(r)); await pg.screenshot({ path: __dirname + "/calc_phone.png" }); await br.close(); })();
