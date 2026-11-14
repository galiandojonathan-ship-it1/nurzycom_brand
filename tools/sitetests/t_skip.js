// Skip link on every course page + offline messages
const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 1280, height: 900 } }); await ctx.route(/docs\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); });
  const pg = await ctx.newPage(); pg.on("dialog", (d) => d.dismiss());
  for (const p of ["index.html", "plan.html", "vocab.html", "reading.html", "practice.html", "mock.html", "useful.html", "archaic.html", "desmos.html", "circle.html"]) {
    await pg.goto("http://127.0.0.1:8767/" + p, { waitUntil: "networkidle" }); await pg.waitForTimeout(300);
    await pg.keyboard.press("Tab");
    const first = await pg.evaluate(() => { const a = document.activeElement; const b = a.getBoundingClientRect(); return { cls: a.className, text: a.textContent.trim(), visible: b.top >= 0 && b.height > 0 }; });
    await pg.keyboard.press("Enter"); await pg.waitForTimeout(100);
    const after = await pg.evaluate(() => document.activeElement && document.activeElement.id);
    await pg.keyboard.press("Tab"); const next = await pg.evaluate(() => !!(document.activeElement && document.activeElement.closest("main")));
    ok(first.cls === "skip" && first.visible && after === "main" && next, `${p}: first Tab = visible skip link, Enter → content, next Tab lands inside the page content`);
  }
  // offline messages
  await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "networkidle" }); await pg.waitForSelector(".tile");
  await pg.click('.tile[data-l="V03"]'); await pg.click('.pick[data-p="p1"]'); await ctx.setOffline(true); await pg.click("#go"); await pg.waitForTimeout(1000);
  const m1 = (await pg.textContent("#start-msg")).trim(); ok(/Нет подключения/.test(m1) && /Решать на экране/.test(m1), "start a part offline: «" + m1 + "»"); await ctx.setOffline(false);
  for (const [page, file, sel] of [["vocab.html", "vocab", "#sum"], ["reading.html", "reading", "#texts"]]) {
    const p2 = await ctx.newPage(); await p2.route(new RegExp(`data/${file}\\.bin`), (rt) => rt.abort("internetdisconnected"));
    await p2.goto("http://127.0.0.1:8767/" + page, { waitUntil: "networkidle" }); await p2.waitForTimeout(500);
    const t = (await p2.textContent(sel)).trim(); ok(/Не удалось загрузить|Нет подключения/.test(t), `${page}: data failure shows «${t.slice(0, 70)}»`); await p2.close(); }
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
