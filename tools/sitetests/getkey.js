const { chromium } = require("playwright"); const fs = require("fs");
(async () => { const br = await chromium.launch(); const pg = await br.newPage();
  await pg.goto("https://study.bynurzy.com/index.html", { waitUntil: "networkidle", timeout: 30000 });
  await pg.fill("#auth-login", process.env.L); await pg.fill("#auth-pw", process.env.P);
  await pg.press("#auth-pw", "Enter");
  await pg.waitForFunction(() => sessionStorage.getItem("site_key") || localStorage.getItem("site_key"), null, { timeout: 30000 });
  const k = await pg.evaluate(() => sessionStorage.getItem("site_key") || localStorage.getItem("site_key"));
  fs.writeFileSync(process.env.OUT, k, { mode: 0o600 }); console.log("key saved, length", k.length);
  await br.close(); })();
