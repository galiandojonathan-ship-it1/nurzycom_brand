const { chromium } = require("playwright");
(async () => { const br = await chromium.launch();
  for (const [u, sel] of [["https://study.bynurzy.com/index.html", ".auth-art img"], ["http://127.0.0.1:8766/ru/index.html", ".hero-photo"]]) for (const w of [390, 768, 1280, 1600]) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 } }); await pg.goto(u, { waitUntil: "load" }); await pg.waitForTimeout(300);
    const r = await pg.$eval(sel, (e) => { const b = e.getBoundingClientRect(); return `${Math.round(b.width)}x${Math.round(b.height)} fit=${getComputedStyle(e).objectFit} vis=${getComputedStyle(e.closest("div,section,header") || e).display}`; }).catch(() => "not shown");
    console.log(u.includes("study") ? "login" : "landing", w, r); await pg.close(); }
  await br.close(); })();
