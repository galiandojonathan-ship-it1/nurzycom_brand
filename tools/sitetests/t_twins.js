// «Похожие вопросы · Gemini» (twins.js + lib/mistake-twins.js): from one student's mistakes to an assigned «Мой тест».
// Local stand-in with a fake Gemini: node pages_dev_gemini.mjs <fixture copy from mkfx.mjs> 8768. Only synthetic data.
// usage: node t_twins.js [desktop|phone]
const { chromium, devices } = require("playwright"); const fs = require("fs"); const { seed, ADMIN } = require("./cbseed");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop", LOG = __dirname + "/gemini.log";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const CSV = "Timestamp,Student,Lesson,Part,Answers,Score,Wrong,Seconds,Attempt\n" +
  "20/11/2026 10:00:00,Ayana Seitkali,V01,p1 · Практика · экран · 2-я: 4/4,1:A>C 2:A 3:B>A 4:A,2/4,\"1,3\",300,1\n" +
  "21/11/2026 11:00:00,Dias Omarov,V01,p1 · Практика · экран · 2-я: 4/4,1:C 2:A 3:A 4:A,4/4,,200,1\n";
(async () => {
  try { fs.unlinkSync(LOG); } catch (e) { /* first run */ }
  const br = await chromium.launch(); const opt = dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1280, height: 900 } };
  const ctx = await br.newContext(opt);
  await ctx.addInitScript((A) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("admin_key", A); }, ADMIN);
  const pg = await ctx.newPage(); const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("dialog", (d) => d.accept());
  console.log(await seed(pg));
  await pg.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await pg.waitForTimeout(2500);
  await pg.evaluate((csv) => window.TeacherWorkspace.useFile(csv, "twins test"), CSV); await pg.waitForTimeout(800);
  await pg.click('#tabs [data-v="students"]'); await pg.waitForTimeout(400);
  await pg.click('#v-students tr.click:has-text("Ayana")'); await pg.waitForSelector("#st-tw .tw", { timeout: 15000 });
  ok(/Похожие вопросы · Gemini/.test(await pg.textContent("#st-tw")), "student card shows «Похожие вопросы · Gemini»");
  // picker: every first-attempt mistake is listed, nothing is sent until the teacher ticks
  await pg.waitForSelector("#st-tw .tw-list [data-twsel]", { timeout: 15000 });
  ok((await pg.$$eval("#st-tw [data-twsel]", (a) => a.length)) === 2, "the picker lists Ayana's 2 first-attempt mistakes");
  ok(await pg.$eval("#st-tw #tw-go", (b) => b.disabled), "«Сгенерировать» waits until a mistake is ticked");
  const works = await pg.$$eval('#st-tw [data-twf="work"] option', (a) => a.map((o) => o.textContent));
  ok(works.length === 2 && /· 2$/.test(works[1]), "filter «Работа» lists the work with its count: " + works.join(" | "));
  await pg.selectOption('#st-tw [data-twf="days"]', "7"); await pg.waitForTimeout(150);
  const after7 = await pg.$$eval("#st-tw [data-twsel]", (a) => a.length);
  await pg.selectOption('#st-tw [data-twf="days"]', "0"); await pg.waitForTimeout(150);
  console.log("mistakes in the last 7 days:", after7);
  await pg.click("#st-tw [data-twsel]"); await pg.waitForTimeout(100);
  ok(/выбрано 1 из 12/.test((await pg.textContent("#st-tw .tw-selctl")).replace(/\s+/g, " ")), "ticking one mistake counts it");
  await pg.click("#st-tw #tw-all"); await pg.waitForTimeout(100);
  ok((await pg.$$eval("#st-tw [data-twsel]:checked", (a) => a.length)) === 2, "«Отметить показанные» ticks both");
  await pg.fill("#st-tw #tw-note", "тексты про океан");
  await pg.click("#st-tw #tw-go"); await pg.waitForSelector("#st-tw .tw-q", { timeout: 20000 });
  const st = await pg.textContent("#st-tw #tw-st"); console.log("status:", st);
  const sent = fs.readFileSync(LOG, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const gen = sent.find((d) => d.mistakes), audit = sent.find((d) => d.questions);
  ok(gen && gen.mistakes.length === 2 && gen.mistakes.map((m) => m.chosen).join("") === "AB", "Gemini gets Ayana's two mistakes with her first choices A and B");
  ok(gen && gen.mistakes.every((m) => m.skill && m.level && m.key && m.text && m.text.passage), "each mistake carries skill, level, key and the text of the own question");
  ok(gen && gen.teacherNote === "тексты про океан", "the teacher's note reaches Gemini");
  ok(!JSON.stringify(sent).includes("Ayana") && !JSON.stringify(sent).includes("Seitkali"), "the student's name never reaches Gemini");
  ok(audit && !JSON.stringify(audit).includes('"answer"'), "the blind check gets no keys");
  const cards = await pg.$$eval("#st-tw .tw-q", (a) => a.length);
  ok(cards === 3 && /Готово: 3 из 4 · 1 не прошли проверку ключа/.test(st), "4 drafts, the one whose key the blind solver did not reproduce is dropped → 3 cards");
  const keys = await pg.$$eval("#st-tw .tw-opts li.ok", (a) => a.map((li) => li.textContent.trim()));
  ok(keys.length === 3 && keys.every((k) => /Even so,/.test(k)), "the key is marked on every card (the right option)");
  ok(new Set(keys.map((k) => k[0])).size === 3, "the 3 keys sit on different letters: " + keys.map((k) => k[0]).join(""));
  ok(/Отрабатывает:/.test(await pg.textContent("#st-tw .tw-q")), "each card says which mistake it trains");
  await pg.screenshot({ path: `${__dirname}/twins_${dev}.png`, fullPage: true });
  if (dev === "phone") ok((await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone 390px: no sideways scroll");
  // drop one, then «Задать ученику»
  await pg.uncheck("#st-tw [data-twpick='2']");
  await pg.click("#st-tw #tw-give"); await pg.waitForTimeout(1500);
  const bank = await pg.evaluate(async () => { const r = await CTL.loadBank(); return r && r.tests.map((t) => ({ ...t, bad: t.q.filter((q) => CTL.problems(q).length).length })); });
  const t = (bank || []).find((x) => /^Работа над ошибками · Ayana Seitkali/.test(x.title));
  ok(t && t.q.length === 2 && t.bad === 0 && t.q.every((q) => q.o["ABCD".indexOf(q.a)] === "Even so,"), "a «Мой тест» with the 2 ticked questions is saved on the server (sealed bank)");
  ok(t && t.q.every((q) => /Ловушка [A-D]:/.test(q.x)), "the explanation keeps the trap note");
  await pg.waitForSelector(".cb-assign", { timeout: 8000 }).catch(() => {});
  const form = (await pg.textContent("main").catch(() => "")).replace(/\s+/g, " ");
  const chosen = await pg.$$eval(".cb-assign input[type=checkbox]:checked", (a) => a.map((c) => (c.closest("label") || c.parentElement).textContent.replace(/\s+/g, " ").trim()));
  console.log("assign form picks:", chosen.join(" | ").slice(0, 200));
  ok(/Работа над ошибками · Ayana Seitkali/.test(form) && chosen.some((c) => /Ayana/.test(c)) && !chosen.some((c) => /Dias/.test(c)), "the assign form opens with this test and only Ayana ticked");
  // hwReview button on the part
  await pg.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await pg.waitForTimeout(2500);
  await pg.evaluate((csv) => window.TeacherWorkspace.useFile(csv, "twins test"), CSV); await pg.waitForTimeout(800);
  await pg.click('#tabs [data-v="students"]'); await pg.waitForTimeout(300);
  await pg.click('#v-students tr.click:has-text("Ayana")'); await pg.waitForSelector(".to-hw", { timeout: 8000 });
  await pg.click(".to-hw"); await pg.waitForSelector("#hw-tw", { timeout: 8000 });
  fs.unlinkSync(LOG); await pg.click("#hw-tw"); await pg.waitForSelector("#hw-twbox .tw-q", { timeout: 20000 });
  const g2 = fs.readFileSync(LOG, "utf8").trim().split("\n").map((l) => JSON.parse(l)).find((d) => d.mistakes);
  ok(g2 && g2.mistakes.length === 2, "«Похожие вопросы на эти ошибки» in the part review generates at once for that part's 2 mistakes");
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
