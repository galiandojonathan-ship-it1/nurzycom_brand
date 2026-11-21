const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const pg = await br.newPage(); await pg.route(/docs\.google\.com/, (r) => r.abort());
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto("http://127.0.0.1:8767/reading.html", { waitUntil: "networkidle" }); await pg.click(".tcard"); await pg.waitForSelector("#r-read:not(.hidden)");
  const w = pg.locator("#story .vw").first();
  ok((await w.getAttribute("aria-expanded")) === "false" && (await w.getAttribute("tabindex")) === "0", "reading word: focusable button, collapsed");
  await w.focus(); await pg.keyboard.press("Space"); await pg.waitForTimeout(100);
  ok(await pg.isVisible("#pop") && (await w.getAttribute("aria-expanded")) === "true", "Space opens the card, aria-expanded=true");
  await pg.keyboard.press("Escape"); await pg.waitForTimeout(100);
  ok(!(await pg.isVisible("#pop")) && (await w.getAttribute("aria-expanded")) === "false", "Escape closes it");
  await w.focus(); await pg.keyboard.press("Enter"); ok(await pg.isVisible("#pop"), "Enter still opens it");
  await pg.click("#to-quiz"); await pg.waitForTimeout(200);
  const stops = await pg.$$eval("#story .vw[tabindex]", (a) => a.length);
  ok(stops === 0, `during the quiz the words are not keyboard stops (${stops})`);
  await pg.click("#hl").catch(() => {}); // disabled during quiz
  ok(errs.length === 0, "no page errors " + errs.join("|"));
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
