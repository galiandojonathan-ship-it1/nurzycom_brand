const { chromium } = require("playwright");
(async () => { const br = await chromium.launch();
  for (const [w, dpr] of [[390, 2], [390, 3], [1280, 1], [1440, 2]]) { const pg = await br.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: dpr });
    await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "load" }); await pg.waitForTimeout(300);
    console.log(w, "dpr", dpr, await pg.$eval(".auth-art img", (e) => `${e.currentSrc.split("/").pop()} shown ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`)); await pg.close(); }
  await br.close(); })();
