// Teacher page, one student: homework «разбор» and practice tests show only that student; nobody else's name or answers on screen
const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch();
  for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  const pg = await br.newPage({ viewport: vp }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.removeItem("name_alias"); });
  await pg.route(/docs\.google\.com/, (r) => r.abort());
  await pg.goto("http://127.0.0.1:8767/teacher.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(400);
  await pg.setInputFiles("#file", __dirname + "/solo.csv"); await pg.waitForTimeout(1000);
  await pg.click('#tabs .chip[data-v="students"]'); await pg.waitForTimeout(400);
  await pg.click('#v-students tr.click:has-text("Ayana")'); await pg.waitForTimeout(500);
  const hw = await pg.$$eval("#v-students .to-hw", (a) => a.length); ok(hw === 1, `${vp.width}: one «разбор →» link in Ayana's history (${hw})`);
  await pg.click("#v-students .to-hw"); await pg.waitForSelector("#hw-list details", { timeout: 15000 });
  const rv = await pg.evaluate(() => { const b = document.querySelector("#st-hw"); return { txt: b.innerText, n: b.querySelectorAll("#hw-list details").length, open: b.querySelectorAll("#hw-list details[open]").length,
    mine: [...b.querySelectorAll(".ropt.mine")].map((o) => o.querySelector(".lt").textContent + ":" + o.querySelector(".tg").textContent), right: [...b.querySelectorAll(".ropt.right .tg")].map((t) => t.textContent) }; });
  ok(rv.n === 2 && rv.open === 2, `${vp.width}: only Ayana's 2 mistakes listed and open (${rv.n}/${rv.open})`);
  ok(!/Bek/.test(rv.txt), `${vp.width}: no other student's name in the review`);
  ok(JSON.stringify(rv.mine) === JSON.stringify(["A:1-я попытка", "C:1-я попытка"]), `${vp.width}: her wrong first choices marked ${JSON.stringify(rv.mine)}`);
  ok(rv.right.some((t) => /верный · 2-я попытка/.test(t)), `${vp.width}: correct option shows «верный · 2-я попытка» ${JSON.stringify(rv.right)}`);
  ok(/ошибок: 2/.test(rv.txt) && /✗ с первой, ✓ со второй/.test(rv.txt), `${vp.width}: summary and per-question status`);
  await pg.check("#hw-all"); await pg.waitForTimeout(300); ok((await pg.$$eval("#hw-list details", (a) => a.length)) === 10, `${vp.width}: «Показать все вопросы» lists all 10`);
  // practice test in one-student mode
  await pg.click('#v-students .to-test'); await pg.waitForSelector("#t-list details", { timeout: 15000 }); await pg.waitForTimeout(300);
  const t = await pg.evaluate(() => { const b = document.querySelector("#v-tests"); const clone = b.cloneNode(true); clone.querySelectorAll("select").forEach((s) => s.remove()); return { txt: clone.innerText, rows: b.querySelectorAll(".tw tbody tr").length, n: b.querySelectorAll("#t-list details").length, chips: [...b.querySelectorAll("#t-mock .chip")].map((c) => c.textContent).join(" ") }; });
  ok(!/Bek/.test(t.txt), `${vp.width}: tests tab shows no other student's name`);
  ok(t.rows === 1 && /Результат ученика/.test(t.txt) && /Ayana/.test(t.txt), `${vp.width}: only Ayana's run in the table`);
  ok(t.n === 1, `${vp.width}: «только ошибки» on: Ayana's 1 mistake in module 1 (${t.n})`);
  ok(!/· \d/.test(t.chips), `${vp.width}: test buttons hide how many students took them`);
  await pg.check("#t-oth"); await pg.waitForTimeout(800); const t2 = await pg.evaluate(() => document.querySelector("#v-tests").innerText);
  ok(/Bek/.test(t2), `${vp.width}: «Показать других учеников» brings the others back`);
  await pg.uncheck("#t-oth"); await pg.waitForTimeout(500); await pg.click("#t-back"); await pg.waitForTimeout(400);
  ok(/Ayana/.test(await pg.textContent("#v-students h2")), `${vp.width}: «← Карточка ученика» returns to Ayana`);
  ok(!errs.length, `${vp.width}: no page errors ${JSON.stringify(errs)}`); await pg.close(); }
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); })();
