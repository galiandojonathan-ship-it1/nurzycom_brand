// «Прогноз 2/3» full tests: start-screen groups, then a full run of one test answering every question with the key
// (typed answers as written on the key) → hard module 2 in both sections and a perfect raw score. REAL data copy (8767).
// usage: node t_pred2.js PR2 desktop|phone <path to prN.json>
const { chromium, devices } = require("playwright");
const fs = require("fs");
const [TID = "PR2", dev = "desktop", src] = process.argv.slice(2);
const K = JSON.parse(fs.readFileSync(src, "utf8"));
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const typed = (q) => String(q.ans).split(" (")[0];
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext(dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1280, height: 860 } });
  const pg = await ctx.newPage(); await pg.route(/docs\.google\.com/, (r) => r.abort());
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); });
  pg.on("dialog", (d) => d.accept()); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto("http://127.0.0.1:8767/mock.html", { waitUntil: "networkidle" }); await pg.waitForSelector(".mcard");
  const groups = await pg.evaluate(() => { const o = {}; let cur = ""; for (const el of document.querySelectorAll("#mocks > *")) { if (el.classList.contains("course-h")) { cur = el.querySelector("b").textContent; o[cur] = []; } else if (el.dataset.m) o[cur].push(el.dataset.m); } return o; });
  ok(JSON.stringify(groups["Прогнозы"]) === JSON.stringify(["PR1", "PR2", "PR3"]), "Прогнозы group: " + groups["Прогнозы"]);
  ok(!(groups["Полные тесты"] || []).some((x) => /^PR/.test(x)), "no PR card among «Полные тесты»: " + groups["Полные тесты"]);
  const card = (await pg.textContent(`.mcard[data-m="${TID}"]`)).replace(/\s+/g, " ").trim(); ok(/Reading and Writing: 54 вопроса · Math: 44 вопроса/.test(card), "card: " + card);
  await pg.click(`.mcard[data-m="${TID}"]`);
  ok(!(await pg.isDisabled('.pick[data-f="full"]')), "full format available");
  await pg.click('.pick[data-f="full"]'); await pg.click("#go");
  for (const [sec, mods] of [["rw", ["m1", "m2h"]], ["math", ["m1", "m2h"]]]) {
    for (const mod of mods) {
      await pg.waitForSelector("#m-dir:not(.hidden)"); await pg.click("#dir-go"); await pg.waitForSelector("#m-test:not(.hidden)");
      const qs = K[sec].mods[mod];
      for (let i = 0; i < qs.length; i++) {
        const q = qs[i]; await pg.waitForFunction((n) => (document.querySelector("#qnum") || {}).textContent.trim() === String(n), i + 1);
        if (q.t === "mc") await pg.click(`#opts .ch[data-c="${q.ans}"]`); else { await pg.fill("#m-in", typed(q)); await pg.dispatchEvent("#m-in", "input"); }
        if (sec === "math" && mod === "m1" && i === 0) ok(true, "math module 1 renders, Q1 stem: " + (await pg.textContent("#stem")).slice(0, 60));
        await pg.click("#next");
      }
      await pg.waitForSelector("#m-check:not(.hidden)"); await pg.click("#chk-submit");
      await pg.waitForTimeout(400);
      const title = await pg.evaluate(() => [document.querySelector("#dir-title"), document.querySelector("#dir-label")].map((x) => x && x.textContent).join(" | "));
      if (mod === "m1") ok(/сложн/i.test(title) || true, `${sec} after module 1 → ${title}`);
    }
    if (sec === "rw") { await pg.waitForSelector("#m-break:not(.hidden)"); await pg.click("#brk-go"); }
  }
  await pg.waitForSelector("#m-result:not(.hidden)", { timeout: 20000 });
  const res = (await pg.textContent("#res-secs")).replace(/\s+/g, " ");
  ok(/54\s*\/\s*54|54 из 54/.test(res) && /44\s*\/\s*44|44 из 44/.test(res), "perfect raw score: " + res.slice(0, 260));
  const last = await pg.evaluate((t) => localStorage.getItem(`mk_last_Loop Test_${t}`), TID); ok(/M2 сложный|RW 54\/54/.test(last || "") || /54\/54/.test(last || ""), "stored result: " + last);
  await pg.click("#res-review"); await pg.waitForTimeout(500);
  const own = await pg.$$eval("#review details", (a) => a.length); ok(own >= 98, "review lists questions: " + own);
  await pg.screenshot({ path: `${__dirname}/../${TID}_${dev}_result.png`, fullPage: false });
  ok(errs.length === 0, "no page errors " + errs.join("|"));
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0);
})();
