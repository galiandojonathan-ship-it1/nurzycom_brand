// «Мои тесты»: the teacher builds a test in the cabinet, assigns it, a student takes it on mytest.html, the result comes back.
// Local stand-in on 8768 (node pages_dev.mjs real 8768).
const { chromium } = require("playwright"); const fs = require("fs"); const { seed, page, ADMIN } = require("./cbseed");
const AXE = fs.readFileSync(__dirname + "/node_modules/axe-core/axe.min.js", "utf8");
const B = "http://127.0.0.1:8768/";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const axe = async (pg, label) => { await pg.addScriptTag({ content: AXE }); const v = await pg.evaluate(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((x) => `${x.id}×${x.nodes.length} ${x.nodes[0].target.join(" ")}`));
  ok(!v.length, `axe ${label}: ${v.length ? v.join(" | ") : "clean"}`); };
(async () => {
  const br = await chromium.launch(); const pg = await page(br); const errs = []; pg.on("pageerror", (e) => errs.push("teacher: " + e.message)); pg.on("dialog", (d) => d.accept());
  console.log(await seed(pg));
  await pg.goto(B + "cabinet.html", { waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
  await pg.click("[data-ct]"); await pg.waitForSelector(".ct h2");
  ok(/Тестов пока нет/.test(await pg.textContent(".ct")), "empty list at first");
  await axe(pg, "tests list");
  await pg.click("[data-ctnew]"); await pg.waitForSelector("#ct-form");
  // saving an empty test is refused with a message
  await pg.click('#ct-form button[type=submit]'); ok(/название/.test(await pg.textContent(".ct .cb-sum")), "no title → asks for a title");
  await pg.fill("#ct-title", "Transitions · проверка"); await pg.fill("#ct-min", "15"); await pg.check("#ct-open");
  await pg.fill("#ct-note", "4 вопроса. Решайте без словаря.");
  // question 1: multiple choice, typed in the form
  await pg.click('[data-qadd="mc"]'); await pg.waitForSelector("details.ct-q[open]");
  const q1 = "details.ct-q:nth-of-type(1)";
  await pg.fill(`${q1} textarea[data-qf=passage]`, "The museum's collection grew quickly. ______ the curators admitted that storage space was running out.\n\n**Note:** a *test* passage.");
  await pg.fill(`${q1} textarea[data-qf=stem]`, "Which choice completes the text with the most logical transition?");
  for (const [k, v] of [["0", "Similarly,"], ["1", "Still,"], ["2", "For example,"], ["3", "In other words,"]]) await pg.fill(`${q1} input[data-qo="${k}"]`, v);
  ok(/не отмечен верный ответ/.test(await pg.textContent(`${q1} summary`)), "missing key is flagged in the question header");
  await pg.check(`${q1} input[data-qa=B]`); await pg.selectOption(`${q1} select[data-qf=skill]`, "Transitions"); await pg.selectOption(`${q1} select[data-qf=level]`, "H");
  await pg.fill(`${q1} textarea[data-qf=x]`, "Still = despite growth, storage ran out.");
  const pv = await pg.innerHTML(`${q1} .ct-pbox`); ok(/<b>Note:<\/b>/.test(pv) && /class="blank"/.test(pv) && /<li class="on"><b>B<\/b>/.test(pv), "live preview renders markup, the blank and the key");
  ok(!(await pg.$(`${q1} summary .bad`)), "header warning clears once the question is complete");
  // question 2: typed answer
  await pg.click('[data-qadd="spr"]'); const q2 = "details.ct-q:nth-of-type(2)"; await pg.waitForSelector(`${q2} input[data-qf=a]`);
  await pg.fill(`${q2} textarea[data-qf=stem]`, "If 4x = 2, what is the value of x?"); await pg.fill(`${q2} input[data-qf=a]`, "1/2; 0.5");
  // questions 3–4 from text
  await pg.click("[data-qimp]"); await pg.fill("#ct-imp", "P: Rivers carry sediment.\nQ: What does the text mainly do?\nA) Describes rivers\nB) Argues about rivers\nC) Compares two rivers\nD) Rejects a theory\nAnswer: A\nExplanation: plain descriptive option.\nSkill: Central Ideas and Details\nLevel: E\n---\nQ: What is 3 + 4?\nAnswer: 7");
  await pg.click("#ct-impgo"); await pg.waitForTimeout(200);
  ok(/Добавлено: 2 вопроса/.test(await pg.textContent(".ct")) && (await pg.$$eval("details.ct-q", (a) => a.length)) === 4, "import from text adds 2 questions");
  await axe(pg, "test editor");
  // move question 4 up, then back down
  await pg.click("details.ct-q:nth-of-type(4) summary"); await pg.click("details.ct-q:nth-of-type(4) [data-qup]"); await pg.waitForTimeout(100);
  ok(/What is 3 \+ 4/.test(await pg.textContent("details.ct-q:nth-of-type(3) summary")), "↑ moves a question up");
  await pg.click("details.ct-q:nth-of-type(3) [data-qdown]"); await pg.waitForTimeout(100);
  await pg.click('#ct-form button[type=submit]'); await pg.waitForTimeout(1200);
  const toast = (await pg.textContent("#cb-toast")).trim(); ok(/сохранён/.test(toast) && !/только в этом браузере/.test(toast), "saved on the server: " + toast);
  // the server copy is sealed: no question text in clear
  const raw = await pg.evaluate(async () => (await fetch("api/custom")).text()); ok(raw.length > 200 && !/curators/.test(raw), "the bank on the server is encrypted");
  // assign to Ayana through «Задать»
  await pg.click("[data-ctlist]"); await pg.waitForSelector(".ct-list");
  ok(/4 вопроса · 15 мин · открыт для всех/.test(await pg.textContent(".ct-list")), "list row: count, time, open");
  await pg.click("[data-ctgive]"); await pg.waitForSelector("#cb-assign");
  ok((await pg.getAttribute('[data-kind="ct"]', "aria-checked")) === "true" && /Transitions · проверка/.test(await pg.$eval("#cb-item", (s) => s.options[s.selectedIndex].text)), "«Задать» opens the assign form with this test chosen");
  await pg.check('#cb-assign .cb-tick:has-text("Ayana Seitkali") input'); await pg.click("#cb-ago"); await pg.waitForTimeout(1500);
  ok(/задано ученику Ayana Seitkali/.test((await pg.textContent("#cb-toast")).trim()), "assigned to Ayana: " + (await pg.textContent("#cb-toast")).trim());

  // ---- the student
  const ctx = await br.newContext({ viewport: { width: 1280, height: 860 } });
  await ctx.addInitScript(() => { if (!sessionStorage.getItem("x")) { sessionStorage.setItem("x", 1); } });
  const st = await ctx.newPage(); st.on("pageerror", (e) => errs.push("student: " + e.message)); st.on("dialog", (d) => d.accept());
  await st.goto(B + "mytest.html", { waitUntil: "load" });
  // log in with the student's own login through the form
  await st.waitForSelector("#auth-pw", { timeout: 15000 });
  await st.fill("#auth-login", "ayana"); await st.fill("#auth-pw", "pass-ayana-1234"); await st.press("#auth-pw", "Enter");
  await st.waitForSelector("#sets .set", { timeout: 20000 });
  ok(/Задано вам/.test(await st.textContent("#sets")), "the student sees the test under «Задано вам»");
  await axe(st, "student list");
  await st.click("#sets .set"); await st.waitForSelector("#s-title");
  ok(/Transitions · проверка/.test(await st.textContent("#s-title")) && /15 мин/.test(await st.textContent("#s-meta")), "start screen: title and time");
  await st.click("#go"); await st.waitForSelector("#opts .ch");
  ok(/<span class="blank"/.test(await st.innerHTML("#passage")), "question 1 shows the passage with the blank");
  await st.keyboard.press("B"); ok(await st.$eval('.opt[data-c=B]', (e) => e.classList.contains("on")), "keyboard B chooses an option");
  await st.click("#next"); await st.fill("#spr", ".5"); await st.click("#next");
  await st.click(".opt[data-c=C] .ch");   // wrong
  // reload mid-test: the run continues
  await st.reload({ waitUntil: "load" }); await st.waitForSelector("#go"); ok(/Продолжить/.test(await st.textContent("#go")), "after a reload the test can be continued");
  await st.click("#go"); await st.waitForSelector("#opts"); ok(/Вопрос 3 из 4/.test(await st.textContent("#qn")) && await st.$eval('.opt[data-c=C]', (e) => e.classList.contains("on")), "answers and position survive the reload");
  await axe(st, "student question");
  await st.click("#next"); await st.click("#next");   // q4 blank → finish (confirm accepted)
  await st.waitForSelector("#p-result:not(.hidden)");
  ok((await st.textContent("#res-score")).trim() === "2/4", "score 2/4 (B right, .5 = 1/2 right, C wrong, blank)");
  ok((await st.$$eval("#rev details", (a) => a.length)) === 4 && /верный: 1\/2 или 0.5/.test(await st.textContent("#rev")), "full review with the accepted answers");
  ok(/сохранён в вашем аккаунте/.test(await st.textContent("#send-status")), "says the result is in the account");
  await st.waitForTimeout(2500);
  const ls = await st.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("ct_")).map((k) => k + "=" + localStorage.getItem(k)));
  console.log("student keys:", ls.join(" | "));
  ok(ls.some((k) => /^ct_last_Ayana Seitkali_C[a-z0-9]{8}=2\/4$/.test(k)), "result stored under the student's name");
  await st.evaluate(() => SITE.sync && SITE.sync()); await st.waitForTimeout(1500);
  const ph = await br.newContext({ viewport: { width: 390, height: 844 } }); const sp = await ph.newPage();
  await ctx.storageState({ path: __dirname + "/st.json" });

  // ---- back in the cabinet
  await pg.click("#cb-reload"); await pg.waitForSelector(".scard", { timeout: 20000 });
  await pg.click("[data-ct]"); await pg.waitForSelector(".ct-list"); await pg.click("[data-ctres]"); await pg.waitForSelector(".ct h2");
  const res = await pg.textContent(".ct"); ok(/Ayana Seitkali/.test(res) && /2\/4/.test(res), "the result table shows Ayana 2/4");
  const cells = await pg.$$eval(".ct-res tbody tr:first-child td", (a) => a.map((x) => x.className + ":" + x.textContent));
  console.log("cells:", cells.join(" "));
  ok(cells.filter((c) => /^ok:/.test(c)).length === 2 && cells.some((c) => /^no:—/.test(c)), "per-question cells: 2 right, a blank");
  await axe(pg, "results");
  await pg.click("[data-ctclose]"); await pg.click('.scard:has(.sc-nm:text-is("Ayana Seitkali")) .sc-open'); await pg.click('[data-tab="res"]');
  ok(/Тест · Transitions · проверка/.test(await pg.textContent(".cb-body")), "the student's «Результаты» tab names the test");
  await pg.click('[data-tab="tasks"]'); const tk = await pg.textContent(".cb-body"); ok(/Мой тест · Transitions · проверка/.test(tk), "the task is listed (and ticks itself): " + tk.replace(/\s+/g, " ").slice(0, 160));
  // unsaved edits: leaving asks first (dialog accepted), Escape returns to the list
  await pg.click("[data-ct]"); await pg.click("[data-ctedit]"); await pg.fill("#ct-title", "Transitions · v2"); await pg.keyboard.press("Escape"); await pg.waitForTimeout(200);
  ok(!!(await pg.$(".ct-list")), "Escape from the editor goes back to the list");
  // phone widths
  const tp = await page(br, { width: 390, height: 844 }); await tp.goto(B + "cabinet.html", { waitUntil: "load" }); await tp.waitForSelector(".scard", { timeout: 20000 });
  await tp.click("[data-ct]"); await tp.click("[data-ctedit]"); await tp.waitForSelector("#ct-form"); await tp.click("details.ct-q:nth-of-type(1) summary");
  ok((await tp.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone 390px: the editor has no sideways scroll");
  await tp.screenshot({ path: __dirname + "/../ct-editor-phone.png", fullPage: true });
  await pg.click("[data-ctedit]"); await pg.click("details.ct-q:nth-of-type(1) summary"); await pg.screenshot({ path: __dirname + "/../ct-editor.png", fullPage: true });
  await pg.click("[data-ctlist]"); await pg.click("[data-ctres]"); await pg.screenshot({ path: __dirname + "/../ct-results.png", fullPage: true });
  await st.goto(B + "mytest.html?t=" + (await pg.evaluate(() => JSON.parse(localStorage.getItem("cb_ct")).tests[0].id)), { waitUntil: "load" }); await st.waitForSelector("#go");
  await st.click("#go"); await st.waitForSelector("#opts .ch"); await st.screenshot({ path: __dirname + "/../ct-student.png", fullPage: false });
  ok(!errs.length, "no page errors " + JSON.stringify(errs)); await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
