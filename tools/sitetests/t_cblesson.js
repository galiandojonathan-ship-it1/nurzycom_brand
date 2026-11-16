// Cabinet → «Уроки» (docs/cblesson.js): the lesson account is not listed as a student; its sessions show the parts
// opened with the class (recognised by themselves), hard questions with the question text, words, time per question;
// a review written by the skill (ls_r_) is shown; «Удалить урок». Stand-in on 8768 (REAL data copy).
// usage: node t_cblesson.js [desktop|phone]
const { chromium } = require("playwright"); const { seed, page } = require("./cbseed");
const dev = process.argv[2] || "desktop", B = "http://127.0.0.1:8768/";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const pg = await page(br, dev === "phone" ? { width: 390, height: 800 } : undefined); const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("dialog", (d) => d.accept());
  console.log(await seed(pg));
  // the lesson account in the accounts store (same local password as access.json's «lesson»), with no old sessions
  await pg.evaluate(async () => { const id = await SITE.lid("lesson"); await SITE.api("admin/user?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ entry: await SITE.account("lesson", "Урок", "fixture-pw") }) });
    await SITE.api("admin/progress?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({}) }) }); });
  // a lesson: a practice test question and a homework part
  const lc = await br.newContext({ viewport: { width: 1280, height: 860 } });
  await lc.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "lesson"); localStorage.setItem("hw_student", "Урок"); });
  const lp = await lc.newPage(); lp.on("dialog", (d) => d.accept()); lp.on("pageerror", (e) => errs.push("lesson: " + e.message));
  await lp.goto(B + "mock.html", { waitUntil: "load" }); await lp.waitForSelector(".ls-bar"); await lp.click('.ls-bar [data-a="start"]'); await lp.fill("#ls-g", "Группа А"); await lp.click(".ls-pop .ls-go");
  await lp.click('.mcard[data-m="PT5"]'); await lp.click("#go"); await lp.waitForSelector("#m-dir:not(.hidden)"); await lp.click("#m-dir .btn"); await lp.waitForSelector("#m-test:not(.hidden)"); await lp.waitForTimeout(2300);
  const sel = (box) => lp.evaluate((box) => { const w = document.createTreeWalker(document.querySelector(box), NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const m = /[A-Za-z]{6,}/.exec(n.data); if (m) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const s = getSelection(); s.removeAllRanges(); s.addRange(r); return m[0]; } } }, box);
  const word = await sel("#passage"); await lp.waitForSelector(".ls-word"); await lp.click(".ls-word");
  await lp.click('.ls-bar [data-a="flag"]'); await lp.click('.ls-pop [data-w="trap"]'); await lp.click('.ls-vote [data-c="B"]');
  await lp.click('.ls-bar [data-a="note"]'); await lp.fill("#ls-t", "Сначала своё слово, потом варианты"); await lp.keyboard.press("Enter");
  await lp.click("#next"); await lp.waitForTimeout(2300);
  await lp.goto(B + "index.html?l=V02&p=p2", { waitUntil: "load" }); await lp.waitForSelector(".tile"); await lp.click('.pick[data-p="p2"]'); await lp.click("#go"); await lp.waitForSelector("#s-solve:not(.hidden)"); await lp.waitForTimeout(2300);
  await lp.click('.ls-bar [data-a="flag"]'); await lp.click('.ls-pop [data-w="rule"]'); await lp.waitForTimeout(300);
  const sid = await lp.evaluate(() => window.LESSON.session().id);
  await lp.click('.ls-bar [data-a="end"]'); await lp.click(".ls-pop .ls-go"); await lp.waitForTimeout(2500);
  // the skill writes its review back to the account
  await lp.evaluate(async ([id, w]) => { localStorage.setItem("ls_r_" + id, JSON.stringify({ v: 1, summary: "Группа путает близкие по смыслу глаголы.", words: [{ w, en: "a test definition", ru: ["проверка", "тест"], verdict: "gloss" }], questions: { "PT5.rw.m1.1": { text: "Вариант B звучит знакомо, но не подходит по смыслу.", hint: "Сначала своё слово." } } })); await SITE.sync(); }, [sid, word]);
  // a lesson recorded before titles were saved with events (no «ti»): the cabinet rebuilds the part name
  await lp.evaluate(async () => { const t = Date.now() - 864e5; localStorage.setItem("ls_s_old1", JSON.stringify({ v: 1, id: "old1", group: "Старая группа", lesson: "", t0: t, t1: t + 600000, ev: [{ t, p: "index", q: "", k: "at" }, { t: t + 5000, p: "index", q: "V04.p4.19", k: "at" }, { t: t + 90000, p: "index", q: "V04.p4.19", k: "flag", why: "text" }] })); await SITE.sync(); });
  await lp.waitForTimeout(1500); await lc.close();

  // the cabinet
  await pg.goto(B + "cabinet.html", { waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
  ok(!(await pg.$$eval(".sc-nm", (a) => a.map((x) => x.textContent))).includes("Урок"), "the lesson account is not listed as a student");
  ok(/Уроки · 2/.test(await pg.textContent("[data-ls]")), "toolbar: «Уроки · 2»");
  await pg.click("[data-ls]"); await pg.waitForSelector(".lsn-card");
  const old = (await pg.textContent(".lsn-card:nth-child(2)")).replace(/\s+/g, " "); ok(/Старая группа/.test(old) && /SAT Verbal · Урок 4/.test(old) && !/V04\.p4/.test(old), "an old lesson without titles gets the part name: " + old.slice(0, 150));
  const card = (await pg.textContent(".lsn-card")).replace(/\s+/g, " "); ok(/Группа А/.test(card) && /Пробный тест 5 · Reading and Writing · Модуль 1 → SAT Verbal · Урок 2/.test(card) && /есть разбор/.test(card), "lesson card names the parts by itself: " + card.slice(0, 230));
  await pg.click(".lsn-card"); await pg.waitForSelector(".lsn-kpi");
  const txt = (await pg.textContent(".lsn")).replace(/\s+/g, " ");
  ok(/2\s*раздела с классом/.test(txt) && /1\s*слово/.test(txt) && /2\s*трудных вопросов/.test(txt), "numbers of the lesson");
  ok(/Группа путает/.test(txt), "review summary shown");
  ok((await pg.$$eval(".lsn-bars .lsn-bar", (a) => a.length)) >= 2, "parts with time");
  ok((await pg.$$(".lsn-q")).length === 2, "two marked questions");
  const q1 = pg.locator('.lsn-q[data-lsq="PT5.rw.m1.1"]'); await q1.locator("summary").click(); await pg.waitForSelector('.lsn-q[data-lsq="PT5.rw.m1.1"] .lsn-o');
  const q1t = (await q1.textContent()).replace(/\s+/g, " ");
  ok(/попались в ловушку/.test(q1t) && /класс выбрал B/.test(q1t) && /Сначала своё слово, потом варианты/.test(q1t) && /Вариант B звучит знакомо/.test(q1t), "question card: reason, vote, note, review");
  ok((await q1.locator(".lsn-o").count()) === 4 && (await q1.locator(".lsn-o.right").count()) === 1, "question text with four options and the key");
  ok(await q1.locator(".sv-expl").count(), "explanation shown");
  const q2 = pg.locator('.lsn-q[data-lsq^="V02.p2."]'); await q2.locator("summary").click(); await pg.waitForFunction(() => { const b = document.querySelector('.lsn-q[data-lsq^="V02.p2."] .lsn-qb'); return b && !/Загружаю/.test(b.textContent); });
  ok((await q2.locator(".lsn-qb .qhtml").count()) >= 1 && /не знали правило/.test(await q2.textContent()), "homework question opens too");
  const row = (await pg.textContent(".lsn-t")).replace(/\s+/g, " "); ok(row.includes(word) && /a test definition/.test(row) && /подчеркнуть на сайте/.test(row) && (await pg.$(".lsn-ctx mark")), "word row: sentence with the word marked, definition, verdict");
  const ov = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok(ov <= 0, "no sideways scroll: " + ov);
  const axp = __dirname + "/node_modules/axe-core/axe.min.js";   // optional: npm i axe-core next to the tests
  if (require("fs").existsSync(axp)) { await pg.addScriptTag({ content: require("fs").readFileSync(axp, "utf8") }); const v = await pg.evaluate(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((x) => `${x.id}×${x.nodes.length} ${x.nodes[0].target}`)); ok(!v.length, "axe lesson view: " + (v.join(" | ") || "clean")); }
  await pg.screenshot({ path: `cblesson_${dev}.png`, fullPage: true });
  await pg.keyboard.press("Escape"); await pg.waitForSelector(".lsn-card"); ok(true, "Escape goes back to the list");
  await pg.click(".lsn-card"); await pg.click("[data-lsdel]"); await pg.waitForTimeout(1200);
  ok((await pg.$$(".lsn-card")).length === 1, "lesson deleted, the other one stays");
  await pg.click("[data-lsclose]"); await pg.waitForSelector(".scard"); ok(!(await pg.$(".lsn")), "closed: back to students");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? `${fails} FAILED` : "ALL PASS"); await br.close(); process.exit(fails ? 1 : 0); })();
