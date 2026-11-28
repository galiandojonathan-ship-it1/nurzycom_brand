const { chromium } = require("playwright");
(async () => { const br = await chromium.launch();
  for (const w of [390, 1280]) { const pg = await br.newPage({ viewport: { width: w, height: 844 } }); pg.on("dialog", (d) => d.accept()); await pg.route(/docs\.google\.com/, (r) => r.abort());
    await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); });
    await pg.goto("http://127.0.0.1:8767/desmos.html", { waitUntil: "networkidle" }); await pg.click('.set[data-s="D01"]'); await pg.click("#go"); await pg.waitForSelector("#s-solve:not(.hidden)");
    await pg.click("#sv-hint"); await pg.waitForTimeout(500);
    console.log(w, "calculator open:", await pg.isVisible(".bb-calc"), "| hint visible:", await pg.isVisible("#sv-hintbox .dz"), "| check clickable:", await pg.locator("#sv-check").isEnabled() && !(await pg.evaluate(() => { const k = document.querySelector("#sv-check").getBoundingClientRect(), c = document.querySelector(".bb-calc"); if (!c || c.offsetParent === null) return false; const r = c.getBoundingClientRect(); return k.top > r.top && k.left < r.right; })));
    await pg.close(); }
  await br.close(); })();
