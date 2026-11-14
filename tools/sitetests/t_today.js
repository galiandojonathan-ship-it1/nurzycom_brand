// «Сегодня» after real progress, the question screens at 320px, and forced colours. REAL data copy (8767), Google Forms blocked.
const { chromium } = require("playwright");
const B = "http://127.0.0.1:8767/";
let fails = 0; const notes = []; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/docs\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); });
  const pg = await ctx.newPage(); pg.on("dialog", (d) => d.accept()); const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && !/Failed to load resource|net::|desmos/i.test(m.text()) && errs.push(m.text().slice(0, 120)));
  const sx = async (w) => { await pg.mouse.wheel(400, 0); await pg.waitForTimeout(80); const x = await pg.evaluate(() => scrollX); if (x) notes.push(`${w}: scrolls sideways ${x}px`); await pg.evaluate(() => scrollTo(0, scrollY)); return x; };

  // empty state first
  await pg.goto(B + "index.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(500);
  const empty = await pg.evaluate(() => { const b = document.querySelector(".td-stats") ; return b ? b.innerText.replace(/\s+/g, " ").slice(0, 160) : null; });
  notes.push("Сегодня, no results yet: " + empty);

  // 1. homework from the paper workbook (paper answers)
  await pg.goto(B + "index.html?l=V01&p=p1", { waitUntil: "networkidle" }); await pg.waitForSelector(".tile");
  await pg.click('.pick[data-p="p1"]'); await pg.click("#go-paper"); await pg.waitForSelector("#s-answers:not(.hidden)");
  const rows = await pg.$$("#qs .q"); for (const [k, r] of rows.entries()) { const b = await r.$$(".opts button"); if (b.length) await b[k % 4].click(); else { const i = await r.$("input"); if (i) await i.fill("3"); } }
  ok((await pg.textContent("#count")).startsWith(String(rows.length)), "paper answers: counter " + (await pg.textContent("#count")));
  await sx("paper answers 390px");
  await pg.click("#submit"); await pg.waitForSelector("#s-result:not(.hidden)");
  ok(/из тетради/.test(await pg.textContent("#res-mode")), "paper answers: result says «ответы из тетради»");

  // 2. a homework question on screen at 320px (long passage)
  await pg.setViewportSize({ width: 320, height: 640 });
  await pg.goto(B + "index.html?l=V06&p=p2", { waitUntil: "networkidle" }); await pg.waitForSelector(".tile");
  await pg.click('.pick[data-p="p2"]'); await pg.click("#go"); await pg.waitForSelector("#s-solve:not(.hidden)"); await pg.waitForTimeout(400);
  ok(!(await sx("homework question 320px")), "homework question reflows at 320px");
  await pg.screenshot({ path: __dirname + "/hw320.png", fullPage: false });
  // forced colours (Windows high contrast): selected and crossed-out options must stay distinguishable
  await pg.emulateMedia({ forcedColors: "active" });
  if (!(await pg.isVisible('#sv-opts .x[data-c="B"]'))) await pg.click('#sv-elim');   // × buttons show after «Вычеркнуть» (2026-11-14)
  await pg.click('#sv-opts .x[data-c="B"]'); await pg.click('#sv-opts .ch[data-c="A"]'); await pg.waitForTimeout(150);
  const fc = await pg.evaluate(() => { const st = (e) => { const s = getComputedStyle(e), t = getComputedStyle(e.querySelector(".tx") || e); return [s.borderTopStyle + " " + s.borderTopWidth, s.outlineStyle + " " + s.outlineWidth, t.textDecorationLine].join(" | "); };
    const on = document.querySelector("#sv-opts .opt.on .ch"), plain = document.querySelector('#sv-opts .opt:not(.on):not(.out) .ch'), out = document.querySelector("#sv-opts .opt.out .ch");
    return { on: on && st(on), plain: plain && st(plain), out: out && st(out) }; });
  notes.push("forced colours — chosen: " + fc.on); notes.push("forced colours — plain: " + fc.plain); notes.push("forced colours — crossed out: " + fc.out);
  ok(fc.on !== fc.plain, "forced colours: the chosen option looks different from a plain one");
  ok(fc.out !== fc.plain, "forced colours: a crossed-out option looks different from a plain one");
  await pg.screenshot({ path: __dirname + "/hw320_forced.png" });
  await pg.emulateMedia({ forcedColors: "none" }); await pg.setViewportSize({ width: 390, height: 844 });

  // 3. a reading text check
  await pg.goto(B + "reading.html", { waitUntil: "networkidle" }); await pg.click(".tcard"); await pg.waitForSelector("#r-read:not(.hidden)"); await pg.click("#to-quiz");
  for (const q of await pg.$$eval("#q-list [data-q]", (a) => [...new Set(a.map((x) => x.dataset.q))])) await pg.click(`#q-list [data-q="${q}"][data-c="B"]`);
  await pg.click("#check"); await pg.waitForTimeout(300);

  // 4. Сегодня with progress
  await pg.goto(B + "index.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(700);
  ok(await pg.evaluate(() => document.body.classList.contains("has-today")), "Сегодня panel shown after login");
  const t = await pg.evaluate(() => ({ stats: (document.querySelector(".td-stats") || {}).innerText, week: (document.querySelector(".td-week") || {}).innerText, recent: (document.querySelector(".td-recent") || {}).innerText, next: (document.querySelector(".td-next") || {}).innerText }));
  notes.push("stats: " + (t.stats || "").replace(/\s+/g, " ").slice(0, 160)); notes.push("week: " + (t.week || "").replace(/\s+/g, " ").slice(0, 120)); notes.push("recent: " + (t.recent || "").replace(/\s+/g, " ").slice(0, 160)); notes.push("next: " + (t.next || "").replace(/\s+/g, " ").slice(0, 160));
  ok(/урок 1/i.test(t.recent || ""), "Сегодня: the homework just submitted is in the latest submissions");
  await sx("Сегодня 390px");
  await pg.screenshot({ path: __dirname + "/today390.png", fullPage: true });
  await pg.setViewportSize({ width: 320, height: 640 }); await pg.reload({ waitUntil: "networkidle" }); await pg.waitForTimeout(500);
  ok(!(await sx("Сегодня 320px")), "Сегодня reflows at 320px");
  ok(!/\b[234] шагов|\b[234] вопросов/.test(await pg.evaluate(() => document.body.innerText)), "Сегодня: Russian plurals (no «2 шагов»)");
  ok(errs.length === 0, "no console errors " + errs.join(" | "));
  console.log("NOTES:\n  " + notes.join("\n  ")); await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0);
})();
