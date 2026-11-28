const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  pg.on("dialog", (d) => d.dismiss()); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Test S"); });
  const [l, p, n] = process.argv.slice(2);
  await pg.goto(`http://127.0.0.1:8767/index.html?l=${l}&p=${p}`, { waitUntil: "networkidle" });
  await pg.fill("#student", "Test S"); await pg.click(`.pick[data-p="${p}"]`); await pg.click("#go"); await pg.waitForSelector("#s-solve:not(.hidden)");
  for (let i = 0; i < 60 && !(await pg.textContent("#sv-qn")).startsWith(`Вопрос ${n} `); i++) await pg.click("#sv-next");
  await pg.waitForTimeout(600); const w = await pg.$("#sv-passage .gw"); if (w) { await w.scrollIntoViewIfNeeded(); await w.click(); await pg.waitForTimeout(300); }
  await pg.screenshot({ path: __dirname + "/../homework_words_phone.png" });
  console.log("underlined:", await pg.$$eval(".gw", (a) => a.map((x) => x.textContent)), "errors:", errs.length); await br.close(); })();
