// Practice-test timer: shorten the saved deadline (local copy only), check auto-submit while open and after reopening a closed tab.
const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 1280, height: 900 } }); await ctx.route(/docs\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); });
  const pg = await ctx.newPage(); const dlg = []; pg.on("dialog", (d) => { dlg.push(d.message()); d.accept(); }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  const short = async (sec) => pg.evaluate((sec) => { const k = Object.keys(localStorage).find((x) => x.startsWith("mk_state_")); const st = JSON.parse(localStorage.getItem(k)); st.deadline = Date.now() + sec * 1000; localStorage.setItem(k, JSON.stringify(st)); return st.phase + " " + st.mod; }, sec);
  await pg.goto("http://127.0.0.1:8767/mock.html", { waitUntil: "networkidle" }); await pg.click('.mcard[data-m="PT5"]'); await pg.click("#go");
  await pg.waitForSelector("#m-dir:not(.hidden)"); await pg.click("#dir-go"); await pg.waitForSelector("#m-test:not(.hidden)");
  await pg.click("#opts .ch"); // one answer
  // 1) open tab: the deadline passes while the student is on a question
  console.log("state:", await short(4)); await pg.reload({ waitUntil: "networkidle" }); await pg.waitForTimeout(300);
  await pg.click('.mcard[data-m="PT5"]'); await pg.click("#go"); await pg.waitForTimeout(400);
  const shown = await pg.textContent("#clock"); ok(/^00:0[0-4]$/.test(shown.trim()), "clock shows the short deadline: " + shown.trim());
  await pg.waitForTimeout(5500);
  const after = await pg.evaluate(() => ["m-start", "m-dir", "m-test", "m-check", "m-break", "m-result"].find((id) => !document.getElementById(id).classList.contains("hidden")));
  ok(after === "m-dir", "time up while open: module 1 is submitted, module 2 directions show (" + after + ")");
  ok(!dlg.some((m) => /закончилось/.test(m)), "no blocking alert on time up " + dlg.join("|"));
  ok(/модуля 1 закончилось/.test(await pg.textContent("#timeup").catch(() => "")) && await pg.isVisible("#timeup"), "time-up notice shown on the next screen");
  // 2) closed tab: the deadline passes while the page is closed
  await pg.click("#dir-go"); await pg.waitForSelector("#m-test:not(.hidden)"); ok(!(await pg.isVisible("#timeup")), "notice hides when module 2 starts"); console.log("state:", await short(-5));
  await pg.reload({ waitUntil: "networkidle" }); await pg.waitForTimeout(300);
  await pg.click('.mcard[data-m="PT5"]'); await pg.click("#go"); await pg.waitForTimeout(800);
  const after2 = await pg.evaluate(() => ["m-start", "m-dir", "m-test", "m-check", "m-break", "m-result"].find((id) => !document.getElementById(id).classList.contains("hidden")));
  ok(after2 === "m-result", "deadline passed while closed: module 2 submitted on reopening, results shown (" + after2 + ")");
  ok(/модуля 2 закончилось/.test(await pg.textContent("#timeup").catch(() => "")), "results page: module-2 time-up notice");
  ok(errs.length === 0, "no page errors " + errs.join("|"));
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
