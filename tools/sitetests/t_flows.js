// Interaction flows on the REAL data copy (8767). Google Forms traffic is blocked: nothing reaches Nurassyl's form.
const { chromium } = require("playwright");
const B = "http://127.0.0.1:8767/";
let fails = 0; const notes = []; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch(); const vp = process.argv[2] === "phone" ? { width: 390, height: 844 } : { width: 1280, height: 900 };
  const ctx = await br.newContext({ viewport: vp });
  let blocked = 0; await ctx.route(/docs\.google\.com|forms\.gle|googleapis/, (r) => { blocked++; r.abort(); });
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); });
  const pg = await ctx.newPage(); const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && !/Failed to load resource|ERR_FAILED|net::/.test(m.text()) && errs.push(m.text().slice(0, 140)));
  pg.on("dialog", (d) => d.accept());
  const ov = async (where) => { const sx = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (sx > 0) notes.push(`${where}: content ${sx}px wider than screen`); };

  // 1. homework: a learning part start → finish → result → review
  await pg.goto(B + "index.html?l=V02&p=p2", { waitUntil: "networkidle" }); await pg.waitForSelector(".tile");
  if (!(await pg.inputValue("#student"))) await pg.fill("#student", "Loop Test");
  await pg.click('.pick[data-p="p2"]'); await pg.click("#go"); await pg.waitForSelector("#s-solve:not(.hidden)");
  const n = Number((await pg.textContent("#sv-qn")).match(/из (\d+)/)[1]);
  for (let i = 0; i < n; i++) {
    const mc = await pg.$("#sv-opts .ch:not([disabled])");
    const exam = !(await pg.isVisible("#sv-check"));
    if (exam) { if (mc) await mc.click(); else if (await pg.$("#sv-in")) await pg.fill("#sv-in", "1"); }
    else if (mc) { await mc.click(); await pg.click("#sv-check"); await pg.waitForTimeout(120); const again = await pg.$("#sv-opts .ch:not([disabled])"); if (again && await pg.isVisible("#sv-check")) { await again.click(); await pg.click("#sv-check"); await pg.waitForTimeout(120); } }
    else if (await pg.$("#sv-in")) { await pg.fill("#sv-in", "1"); await pg.click("#sv-check"); await pg.waitForTimeout(120); if (await pg.isVisible("#sv-check")) { await pg.fill("#sv-in", "2"); await pg.click("#sv-check"); await pg.waitForTimeout(120); } }
    if (i === 0) { notes.push("homework part mode: " + (exam ? "exam" : "learn")); if (!exam) ok(await pg.isVisible("#sv-expl"), "homework: explanation shown after the question is closed"); await ov("homework question"); }
    await pg.click("#sv-next"); await pg.waitForTimeout(100);
  }
  await pg.waitForSelector("#s-result:not(.hidden)", { timeout: 8000 }).catch(() => {});
  ok(await pg.isVisible("#s-result"), "homework: result screen after the last question");
  ok(/\d+\/\d+/.test(await pg.textContent("#res-score")), "homework: score shown " + (await pg.textContent("#res-score")));
  ok(blocked >= 1, `homework: the form submission was attempted and blocked (${blocked})`);
  const status = await pg.textContent("#send-status"); notes.push("send status when the form is unreachable: «" + status.trim() + "»");
  await pg.click("#review"); await pg.waitForSelector("#s-solve:not(.hidden)");
  ok((await pg.textContent("#sv-title")).includes("разбор"), "homework: review opens");
  ok(await pg.isVisible("#sv-expl"), "homework review: explanation visible");
  ok(await pg.isVisible("#sv-exit"), "homework review: visible exit button on question 1"); await pg.click("#sv-exit"); await pg.waitForTimeout(200); ok(await pg.isVisible("#s-result"), "homework review: exit returns to the result");
  await pg.click("#again"); await pg.waitForSelector("#s-solve:not(.hidden)"); ok(!(await pg.isVisible("#sv-exit")), "new attempt: exit button hidden outside review"); await pg.click("#navbtn"); await pg.click("#sv-finish");

  // 2. plan: tick a manual step, reload, still ticked
  await pg.goto(B + "plan.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(500);
  const box = await pg.$('#plan input[type=checkbox]:not([data-auto]):not(:checked)');
  if (box) { const id = await box.getAttribute("data-id"); await box.focus(); await pg.keyboard.press("Space"); await pg.waitForTimeout(200);
    ok(await pg.evaluate((id) => document.activeElement && document.activeElement.dataset && document.activeElement.dataset.id === id, id), "plan: keyboard focus stays on the ticked step");
    await pg.reload({ waitUntil: "networkidle" }); await pg.waitForTimeout(500);
    ok(await pg.isChecked(`#plan input[data-id="${id}"]`), "plan: a ticked step stays ticked after reload");
    await pg.click(`#plan input[data-id="${id}"]`); await pg.waitForTimeout(200); }
  else ok(false, "plan: no manual step to tick");
  await ov("plan");

  // 3. vocab: flashcards and typed test
  await pg.goto(B + "vocab.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(400);
  await pg.click("#all-v").catch(() => {}); await pg.waitForTimeout(200);
  await pg.click('#start-modes .pick[data-m="cards"]'); await pg.waitForSelector("#v-run:not(.hidden)");
  const front = (await pg.textContent("#flash")).trim().slice(0, 40);
  await pg.click("#f-show"); await pg.waitForTimeout(250);
  ok(await pg.isVisible("#f-grade"), "vocab cards: «show» reveals the grade buttons (" + front + ")");
  await pg.click("#f-yes"); await pg.waitForTimeout(200);
  ok((await pg.textContent("#f-count")).length > 0, "vocab cards: counter updates: " + (await pg.textContent("#f-count")));
  await ov("vocab cards");
  await pg.click("#modes [data-m=test], #modes button:nth-child(2)").catch(() => {}); await pg.waitForTimeout(300);
  if (await pg.isVisible("#t-in")) { await pg.fill("#t-in", "zzz"); await pg.click("#t-check"); await pg.waitForTimeout(200);
    ok((await pg.textContent("#t-fb")).trim().length > 0, "vocab test: feedback after a wrong word: «" + (await pg.textContent("#t-fb")).trim().slice(0, 60) + "»"); }
  else ok(false, "vocab test: typed test did not open");

  // 4. reading: open a text, tap a word, quiz, check
  await pg.goto(B + "reading.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(300);
  await pg.click(".tcard"); await pg.waitForSelector("#r-read:not(.hidden)");
  const w = await pg.$("#story [data-k]"); if (w) { await w.click(); await pg.waitForTimeout(200); ok(await pg.isVisible("#pop"), "reading: tap on a course word shows its card"); }
  await pg.click("#to-quiz"); await pg.waitForTimeout(300);
  const qs = await pg.$$eval("#q-list [data-q]", (a) => [...new Set(a.map((x) => x.dataset.q))]);
  for (const q of qs) await pg.click(`#q-list [data-q="${q}"][data-c="A"]`);
  if (await pg.isVisible("#student")) await pg.fill("#student", "Loop Test");
  await pg.click("#check"); await pg.waitForTimeout(500);
  ok(await pg.isVisible("#q-res"), "reading: result after «check» " + ((await pg.textContent("#res-score").catch(() => "")) || ""));
  ok(await pg.isVisible("#resend"), "reading: «Отправить ещё раз» when the form is unreachable");
  await ov("reading");

  // 5. 404
  const r404 = await pg.goto(B + "no-such-page.html"); notes.push("local server 404 (Cloudflare serves 404.html live): " + r404.status());
  await pg.goto(B + "404.html", { waitUntil: "networkidle" });
  ok((await pg.$$eval("a[href]", (a) => a.length)) > 0, "404 page: has a way back");

  ok(errs.length === 0, "no console errors " + errs.join(" | "));
  console.log("NOTES:\n  " + notes.join("\n  "));
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0);
})();
