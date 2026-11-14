// Removing a task in the cabinet (2026-11-12): no confirm dialog; the task goes at once; «Вернуть» in the message puts it back,
// and both changes survive a reload (saved to the stand-in). Local stand-in 8768 seeded by cbseed.js (Ayana has 1 overdue task).
const { chromium } = require("playwright"); const { seed, page } = require("./cbseed");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const pg = await page(br); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  let dialogs = 0; pg.on("dialog", (d) => { dialogs++; d.dismiss(); });
  console.log(await seed(pg));
  const open = async () => { await pg.goto("http://127.0.0.1:8768/cabinet.html", { waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
    await pg.click(`.scard:has(.sc-nm:text-is("Ayana Seitkali")) .sc-open`); await pg.waitForSelector(".cb-head"); await pg.click('[data-tab="tasks"]'); await pg.waitForTimeout(300); };
  const count = () => pg.$$eval(".cb-tasks li", (a) => a.length).catch(() => 0);
  await open(); const n0 = await count(); ok(n0 >= 1, "Ayana has tasks: " + n0);
  await pg.click(".cb-tasks li >> nth=0 >> [data-deltask]"); await pg.waitForTimeout(800);
  ok(dialogs === 0, "no confirm dialog");
  ok((await count()) === n0 - 1, "the task is gone at once");
  const t = (await pg.textContent("#cb-toast")).replace(/\s+/g, " "); ok(/убрано/.test(t) && /Вернуть/.test(t), "message with «Вернуть»: " + t);
  await pg.click("#cb-toast .cb-undo"); await pg.waitForTimeout(900);
  ok((await count()) === n0, "«Вернуть» puts it back");
  await open(); ok((await count()) === n0, "after reload the task is still there (undo saved)");
  await pg.click(".cb-tasks li >> nth=0 >> [data-deltask]"); await pg.waitForTimeout(800);
  await open(); ok((await count()) === n0 - 1, "a removal without undo is saved");
  await pg.keyboard.press("Tab"); ok(dialogs === 0 && errs.length === 0, "no dialogs, no page errors " + errs.join("|"));
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
