const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const ctx = await br.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test");
    const orig = Element.prototype.scrollIntoView; window.__sv = []; Element.prototype.scrollIntoView = function (o) { window.__sv.push(o && o.behavior); return orig.call(this, o); }; });
  await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "networkidle" }); await pg.waitForSelector(".tile"); await pg.click(".tile"); await pg.waitForTimeout(300);
  console.log("reduce-motion scrolls:", JSON.stringify(await pg.evaluate(() => window.__sv)));
  const anim = await pg.evaluate(() => [...document.querySelectorAll("*")].filter((e) => { const s = getComputedStyle(e); return s.animationName !== "none" && parseFloat(s.animationDuration) > 0.01; }).map((e) => e.className).slice(0, 5));
  console.log("running CSS animations with reduce:", JSON.stringify(anim)); await br.close(); })();
