// Gets the course master key by logging in to the live site with a course login (e.g. Claude's own login «claude»).
// The key is written to OUT with mode 600; keep it in the session scratchpad, never in the repo.
// usage: L=<login> P=<password> OUT=<scratchpad>/master_key.b64 node tools/private/getkey.js   (needs Playwright)
const { chromium } = require("playwright"); const fs = require("fs");
(async () => { const br = await chromium.launch(); const pg = await br.newPage();
  await pg.goto("https://study.bynurzy.com/index.html", { waitUntil: "networkidle", timeout: 30000 });
  await pg.fill("#auth-login", process.env.L); await pg.fill("#auth-pw", process.env.P); await pg.press("#auth-pw", "Enter");
  await pg.waitForFunction(() => sessionStorage.getItem("site_key") || localStorage.getItem("site_key"), null, { timeout: 30000 });
  const k = await pg.evaluate(() => sessionStorage.getItem("site_key") || localStorage.getItem("site_key"));
  fs.writeFileSync(process.env.OUT, k, { mode: 0o600 }); console.log("key saved, length", k.length); await br.close(); })();
