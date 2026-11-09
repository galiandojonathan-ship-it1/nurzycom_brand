// Groups server down: saving says «only in this browser», the groups come back from this browser after reload, no page errors
const { chromium } = require("playwright"); const { seed, page } = require("./cbseed");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const pg = await page(br); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  console.log(await seed(pg)); await pg.route(/api\/admin\/groups/, (r) => r.fulfill({ status: 503, body: "{}" }));
  await pg.goto("http://127.0.0.1:8768/cabinet.html", { waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
  ok((await pg.$$eval(".gtab", (a) => a.length)) >= 3, "cabinet opens with the groups server down");
  const G = await pg.$eval('.gtab[data-g]:nth-child(2)', (b) => b.dataset.g);
  await pg.selectOption('.scard:has(.sc-nm:text-is("Ayana Seitkali")) select[data-place]', G); await pg.waitForTimeout(600);
  const t = (await pg.textContent("#cb-toast")).trim(); ok(/только в этом браузере/.test(t), "toast says where it was saved: " + t);
  await pg.reload({ waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
  ok((await pg.$$eval(`.gblock:has(h2:text-is("Группа")) .sc-nm`, (a) => a.map((x) => x.textContent))).includes("Ayana Seitkali"), "after reload the group comes back from this browser");
  // server back: the newer local copy goes up, and survives clearing this browser
  await pg.unroute(/api\/admin\/groups/); await pg.reload({ waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 }); await pg.waitForTimeout(800);
  ok(/сохранены на сервере/.test(await pg.textContent("#cb-toast")), "server back: the browser's newer groups are sent up");
  await pg.evaluate(() => localStorage.removeItem("cb_groups")); await pg.reload({ waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
  ok((await pg.$$eval(`.gblock:has(h2:text-is("Группа")) .sc-nm`, (a) => a.map((x) => x.textContent))).includes("Ayana Seitkali"), "with this browser cleared, the server has the change");
  ok(!errs.length, "no page errors " + JSON.stringify(errs)); await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); })();
