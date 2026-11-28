// Offline: what a student sees when the connection drops. Also checks the lessons.bin double download is gone.
const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 } }); await ctx.route(/docs\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); });
  const pg = await ctx.newPage(); pg.on("dialog", (d) => d.dismiss()); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  const hits = []; pg.on("request", (r) => /data\/lessons\.bin/.test(r.url()) && hits.push(1));
  await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "networkidle" }); await pg.waitForSelector(".tile"); await pg.waitForTimeout(500);
  console.log("lessons.bin downloads on the homework page:", hits.length);
  // 1. offline, then start a part on screen
  await pg.click('.tile[data-l="V03"]'); await pg.click('.pick[data-p="p1"]'); await ctx.setOffline(true);
  await pg.click("#go"); await pg.waitForTimeout(1200);
  console.log("start a part offline →", JSON.stringify((await pg.textContent("#start-msg")).trim()), "| solve shown:", await pg.isVisible("#s-solve"));
  // 2. back online: does the same button work without a reload?
  await ctx.setOffline(false); await pg.click("#go"); await pg.waitForTimeout(1500);
  console.log("back online, same button →", "solve shown:", await pg.isVisible("#s-solve"), "| msg:", JSON.stringify((await pg.textContent("#start-msg")).trim()));
  // 3. offline, open another page
  await ctx.setOffline(true); const r = await pg.goto("http://127.0.0.1:8767/vocab.html").catch((e) => e.message.slice(0, 60)); console.log("navigate offline →", typeof r === "string" ? r : r.status());
  await ctx.setOffline(false);
  // 4. offline before the page loads its data (slow start, then drop)
  const p2 = await ctx.newPage(); await p2.route(/data\/vocab\.bin/, (rt) => rt.abort("internetdisconnected"));
  await p2.goto("http://127.0.0.1:8767/vocab.html", { waitUntil: "networkidle" }); await p2.waitForTimeout(600);
  console.log("vocab data fails →", JSON.stringify(await p2.evaluate(() => (document.querySelector("#v-start .hint, #sum, #start-msg, .err") || {}).textContent || document.body.innerText.slice(0, 140))));
  const p3 = await ctx.newPage(); await p3.route(/data\/mocks\.bin/, (rt) => rt.abort("internetdisconnected"));
  await p3.goto("http://127.0.0.1:8767/mock.html", { waitUntil: "networkidle" }); await p3.waitForTimeout(600);
  console.log("mocks data fails →", JSON.stringify((await p3.textContent("#start-msg").catch(() => "")).trim()), "| cards:", await p3.$$eval(".mcard", (a) => a.length));
  const p4 = await ctx.newPage(); await p4.route(/data\/reading\.bin/, (rt) => rt.abort("internetdisconnected"));
  await p4.goto("http://127.0.0.1:8767/reading.html", { waitUntil: "networkidle" }); await p4.waitForTimeout(600);
  console.log("reading data fails →", JSON.stringify(await p4.evaluate(() => document.querySelector("main").innerText.replace(/\s+/g, " ").slice(0, 160))));
  console.log("page errors:", errs.length ? errs : "none"); await br.close(); })();
