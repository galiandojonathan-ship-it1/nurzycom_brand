// «Прогноз 1»: start-screen group, word cards (WIC options plain during the test), the «Частое на SAT» label. REAL data copy (8767).
const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await pg.route(/docs\.google\.com/, (r) => r.abort());
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); }); pg.on("dialog", (d) => d.accept()); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto("http://127.0.0.1:8767/mock.html", { waitUntil: "networkidle" }); await pg.waitForSelector(".mcard");
  const groups = await pg.$$eval("#mocks .course-h b", (a) => a.map((x) => x.textContent)); ok(groups.includes("Прогнозы"), "start screen: «Прогнозы» group: " + groups.join(" | "));
  ok(await pg.isVisible('.mcard[data-m="PR1"]'), "Прогноз 1 card: " + (await pg.textContent('.mcard[data-m="PR1"]')).replace(/\s+/g, " ").trim());
  const rwGroup = await pg.evaluate(() => { const h = [...document.querySelectorAll("#mocks .course-h")].find((x) => /Тесты Reading and Writing/.test(x.textContent)); let n = h.nextElementSibling, ids = []; while (n && n.classList.contains("mcard")) { ids.push(n.dataset.m); n = n.nextElementSibling; } return ids; });
  ok(!rwGroup.includes("PR1"), "PR1 not listed in the RW group: " + rwGroup.join(","));
  await pg.click('.mcard[data-m="PR1"]'); await pg.click("#go"); await pg.waitForSelector("#m-dir:not(.hidden)"); await pg.click("#dir-go"); await pg.waitForSelector("#m-test:not(.hidden)");
  await pg.waitForTimeout(500);
  ok((await pg.$$eval("#opts .gw", (a) => a.length)) === 0, "Q1 Words in Context: options not underlined during the test");
  const q1 = await pg.$$eval("#passage .gw, #stem .gw", (a) => a.map((x) => x.textContent)); ok(q1.length >= 1, "Q1 passage words underlined: " + q1.join(", "));
  for (let i = 0; i < 3; i++) await pg.click("#next"); await pg.waitForTimeout(400);
  const q4 = await pg.$$eval("#passage .gw", (a) => a.map((x) => x.textContent)); ok(q4.length >= 2, "Q4 underlined: " + q4.join(", "));
  await pg.click("#passage .gw"); await pg.waitForTimeout(200); ok(await pg.isVisible(".gpop"), "card opens: " + (await pg.textContent(".gpop")).replace(/\s+/g, " ").slice(0, 90));
  await pg.screenshot({ path: __dirname + "/../pred_card.png" }); await pg.keyboard.press("Escape");
  let tagged = null;
  for (let i = 0; i < 23 && !tagged; i++) { await pg.click("#next"); await pg.waitForTimeout(250);
    for (const g of await pg.$$("#passage .gw, #stem .gw, #opts .gw")) { await g.click(); await pg.waitForTimeout(80); const t = await pg.textContent(".gpop"); if (/Частое на SAT/.test(t)) { tagged = t.replace(/\s+/g, " ").slice(0, 90); break; } await pg.keyboard.press("Escape"); } }
  ok(!!tagged, "a recurring word shows «Частое на SAT»: " + tagged);
  ok(errs.length === 0, "no page errors " + errs.join("|"));
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
