// Live check of «Прогноз 1» with the claude login: the card is listed and a question opens with underlined words. Nothing is submitted.
const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.route(/docs\.google\.com/, (r) => r.abort()); pg.on("dialog", (d) => d.dismiss());
  await pg.goto("https://study.bynurzy.com/mock.html", { waitUntil: "networkidle" });
  await pg.fill("#auth-login", process.env.L); await pg.fill("#auth-pw", process.env.P); await pg.press("#auth-pw", "Enter");
  await pg.waitForSelector('.mcard[data-m="PR1"]', { timeout: 30000 });
  await pg.click('.mcard[data-m="PR1"]'); await pg.click("#go"); await pg.waitForSelector("#m-dir:not(.hidden)"); await pg.click("#dir-go"); await pg.waitForSelector("#m-test:not(.hidden)"); await pg.waitForTimeout(800);
  console.log("LIVE Прогноз 1:", (await pg.textContent("#navbtn")).trim(), "| underlined:", await pg.$$eval("#passage .gw", (a) => a.map((x) => x.textContent)), "| errors:", errs.length ? errs : "none");
  // leave the run unfinished; reset the local state so the account does not keep a half-done test
  await pg.evaluate(() => Object.keys(localStorage).filter((k) => /^mk_state_.*PR1/.test(k)).forEach((k) => localStorage.removeItem(k)));
  await br.close(); })();
