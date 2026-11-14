// A whole practice test on the REAL data copy (8767), Google Forms blocked. usage: node t_mock.js <PT id> <phone|desktop>
const { chromium } = require("playwright");
const B = "http://127.0.0.1:8767/";
const [MID = "PT1", dev = "desktop"] = process.argv.slice(2);
let fails = 0; const notes = []; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch(); const ctx = await br.newContext({ viewport: dev === "phone" ? { width: 390, height: 844 } : { width: 1280, height: 900 } });
  let blocked = 0; await ctx.route(/docs\.google\.com|forms\.gle/, (r) => { blocked++; r.abort(); });
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); });
  const pg = await ctx.newPage(); const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && !/Failed to load resource|net::|desmos/i.test(m.text()) && errs.push(m.text().slice(0, 140)));
  pg.on("dialog", (d) => { notes.push("dialog: " + d.message().slice(0, 90)); d.accept(); });
  const vis = (s) => pg.isVisible(s);
  const ovf = async (w) => { const x = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (x > 0) notes.push(`${w}: ${x}px wider than the screen`); };
  await pg.goto(B + "mock.html", { waitUntil: "networkidle" }); await pg.waitForSelector(".mcard");
  if (!(await pg.inputValue("#student"))) await pg.fill("#student", "Loop Test");
  await pg.click(`.mcard[data-m="${MID}"]`); await pg.waitForTimeout(200);
  ok(await pg.getAttribute(`.mcard[data-m="${MID}"]`, "aria-pressed") === "true", "start: chosen test is pressed");
  await pg.click("#go"); let modules = 0, marked = false;
  for (let guard = 0; guard < 14; guard++) {
    await pg.waitForTimeout(300);
    if (await vis("#m-dir")) { if (modules === 0) await ovf("directions"); await pg.click("#dir-go"); continue; }
    if (await vis("#m-break")) { ok(true, "break screen between sections"); await ovf("break"); await pg.click("#brk-go"); continue; }
    if (await vis("#m-result")) break;
    if (await vis("#m-test")) {
      modules++; const total = Number((await pg.textContent("#navbtn")).match(/из (\d+)/)[1]);
      for (let i = 0; i < total; i++) {
        if (i === 0 && !marked) { await pg.click("#flag"); marked = true; ok((await pg.getAttribute("#flag", "aria-pressed")) === "true", "mark for review works"); await ovf("question"); }
        const ch = await pg.$("#opts .ch"); if (ch) await (await pg.$$("#opts .ch"))[(i * 7) % 4].click(); else if (await pg.$("#m-in")) await pg.fill("#m-in", String(i % 9));
        if (i < total - 1) await pg.click("#next");
      }
      await pg.click("#next"); await pg.waitForSelector("#m-check:not(.hidden)", { timeout: 5000 });
      if (modules === 1) { ok(await pg.$$eval("#chk-grid button", (a) => a.length) === total, "check screen lists every question"); ok((await pg.$$eval("#chk-grid .mk, #chk-grid button[class*=mk]", (a) => a.length)) >= 1, "check screen shows the marked question"); }
      await pg.click("#chk-submit"); continue;
    }
  }
  ok(await vis("#m-result"), `results page after ${modules} modules`);
  const secs = await pg.textContent("#res-secs"); ok(/примерн/i.test(secs), "results: score labelled «примерный»");
  ok(blocked >= 1, `results sent to the form were blocked (${blocked})`); notes.push("send status: «" + (await pg.textContent("#send-status")).trim().slice(0, 80) + "»");
  ok(await pg.isVisible("#resend"), "results: «Отправить ещё раз» when the form is unreachable");
  await ovf("results");
  await pg.click("#res-review"); await pg.waitForTimeout(500);
  const all = await pg.$$eval(".rv", (a) => a.filter((x) => x.offsetParent).length);
  await pg.check("#rv-bad"); await pg.waitForTimeout(300);
  const bad = await pg.$$eval(".rv", (a) => a.filter((x) => x.offsetParent).length);
  ok(all > 0 && bad > 0 && bad < all, `review: «только ошибки» filters ${all} → ${bad}`);
  await ovf("review");
  ok(errs.length === 0, "no console errors " + errs.join(" | "));
  console.log("NOTES:\n  " + notes.join("\n  ")); await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0);
})();
