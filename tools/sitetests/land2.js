const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 390, height: 844 } });
  for (const [start, sec] of [["ru/index.html", "lessons"], ["index.html", "story"], ["ru/index.html", "top"]]) {
    await pg.goto("http://127.0.0.1:8766/" + start, { waitUntil: "networkidle" });
    if (sec !== "top") { await pg.evaluate((s) => { document.documentElement.style.scrollBehavior = "auto"; const e = document.getElementById(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY + 10, behavior: "instant" }); }, sec); await pg.waitForTimeout(300); }
    await pg.click(".lang a:not([aria-current])"); await pg.waitForLoadState("networkidle"); await pg.waitForTimeout(300);
    const inView = await pg.evaluate(() => { const s = [...document.querySelectorAll("section[id], [id]")].filter((e) => e.getBoundingClientRect().top <= innerHeight * 0.4).pop(); return s ? s.id : null; });
    console.log(`${start} at #${sec} → ${pg.url().replace("http://127.0.0.1:8766", "")} (in view: ${inView})`); }
  await br.close(); })();
