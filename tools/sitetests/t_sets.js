// The practice sets on the «Полезное» pages end to end on the REAL data; Google Forms blocked.
const { chromium } = require("playwright");
let fails = 0; const notes = []; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const ctx = await br.newContext({ viewport: process.argv[2] === "phone" ? { width: 390, height: 844 } : { width: 1280, height: 900 } });
  await ctx.route(/docs\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); });
  const pg = await ctx.newPage(); pg.on("dialog", (d) => d.accept()); const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && !/Failed to load resource|net::|desmos/i.test(m.text()) && errs.push(m.text().slice(0, 120)));
  for (const [page, set] of [["archaic.html", "A01"], ["desmos.html", "D01"], ["circle.html", "U01"]]) {
    await pg.goto("http://127.0.0.1:8767/" + page, { waitUntil: "networkidle" }); await pg.waitForSelector(`.set[data-s="${set}"]`);
    if (!(await pg.inputValue("#student"))) await pg.fill("#student", "Loop Test");
    await pg.click(`.set[data-s="${set}"]`); await pg.click("#go"); await pg.waitForSelector("#s-solve:not(.hidden)");
    const n = Number((await pg.textContent("#sv-qn")).match(/из (\d+)/)[1]); let hintSeen = false;
    for (let i = 0; i < n; i++) {
      if (await pg.$("#sv-hint")) { await pg.click("#sv-hint"); await pg.waitForTimeout(150); hintSeen = hintSeen || (await pg.isVisible("#sv-hintbox .dz")); }
      for (let t = 0; t < 2 && (await pg.isVisible("#sv-check")); t++) {
        const ch = await pg.$("#sv-opts .ch:not([disabled])"); if (ch) await ch.click(); else if (await pg.$("#sv-in")) await pg.fill("#sv-in", String(t + 1));
        await pg.click("#sv-check"); await pg.waitForTimeout(120); }
      await pg.click("#sv-next"); await pg.waitForTimeout(80);
    }
    await pg.waitForSelector("#s-result:not(.hidden)", { timeout: 6000 }).catch(() => {});
    ok(await pg.isVisible("#s-result"), `${page} ${set}: result after ${n} questions (${(await pg.textContent("#res-score").catch(() => "?"))}), hint used: ${hintSeen}`);
    ok(await pg.isVisible("#resend"), `${page}: «Отправить ещё раз» shown when the form is unreachable`);
    const x = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (x > 0) notes.push(`${page} result: ${x}px wider`);
  }
  ok(errs.length === 0, "no console errors " + errs.join(" | ")); if (notes.length) console.log("NOTES: " + notes.join("; "));
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
