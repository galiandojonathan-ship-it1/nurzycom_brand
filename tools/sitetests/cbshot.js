const { chromium } = require("playwright"); const { seed, page } = require("./cbseed");
(async () => { const br = await chromium.launch(); const pg = await page(br); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  console.log(await seed(pg)); await pg.reload({ waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 }); await pg.waitForTimeout(800);
  await pg.screenshot({ path: __dirname + "/../" + (process.argv[2] || "cab-before") + ".png", fullPage: true }); console.log("errors:", errs); await br.close(); })();
