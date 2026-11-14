const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 390, height: 844 } }); await pg.route(/docs\.google\.com/, (r) => r.abort());
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); }); pg.on("dialog", (d) => d.dismiss()); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto("http://127.0.0.1:8767/index.html?l=V04&p=p1", { waitUntil: "networkidle" }); await pg.waitForSelector(".tile"); await pg.click('.pick[data-p="p1"]'); await pg.click("#go"); await pg.waitForSelector("#s-solve:not(.hidden)");
  ok(await pg.isVisible("#sv-check"), "V04 part 1 is a learning part (two attempts)");
  const n = Number((await pg.textContent("#sv-qn")).match(/из (\d+)/)[1]); let seen = 0, wic = 0, before = 0;
  for (let i = 0; i < n; i++) { await pg.waitForTimeout(250);
    const isWic = /most logical and precise word|most nearly mean/i.test(await pg.textContent("#sv-stem"));
    const under = await pg.$$eval("#sv-passage .gw", (a) => a.length);
    if (await pg.$(".sv-words")) before++;
    for (let t = 0; t < 2 && (await pg.isVisible("#sv-check")); t++) { const c = await pg.$("#sv-opts .ch:not([disabled])"); if (c) await c.click(); else await pg.fill("#sv-in", "1"); await pg.click("#sv-check"); await pg.waitForTimeout(250); }
    await pg.waitForTimeout(300);
    const list = await pg.$$eval(".sv-words li", (a) => a.map((x) => x.querySelector("b").textContent));
    if (isWic) { wic++; ok(list.length === 0, `Q${i + 1} Words in Context: no word list`); }
    else if (under) { seen++; ok(list.length >= under, `Q${i + 1}: list after the answer has ${list.length} words (${list.slice(0, 4).join(", ")})`); }
    await pg.click("#sv-next"); }
  ok(before === 0, "no list shown before a question is answered");
  ok(seen > 0, `questions with words checked: ${seen}, WIC: ${wic}`);
  ok(errs.length === 0, "no page errors " + errs.join("|"));
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
