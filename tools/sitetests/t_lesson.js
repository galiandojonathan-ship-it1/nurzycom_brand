// «Режим урока» (docs/lesson.js): the capture bar shows only for the lesson account; a session records the timeline,
// a selected word with its sentence, a hard-question flag, a «Сработало» note and the class vote; the session key is
// one of the synced keys; a student login never loads lesson.js. REAL data copy with pages_dev (8768).
// usage: node t_lesson.js [desktop|phone]
const { chromium, devices } = require("playwright");
const dev = process.argv[2] || "desktop", B = "http://127.0.0.1:8768/";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch();
  const mk = async (login) => { const ctx = await br.newContext(dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1280, height: 860 } });
    await ctx.addInitScript((l) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", l); localStorage.setItem("hw_student", l === "lesson" ? "Урок" : "Loop Test"); }, login);
    const pg = await ctx.newPage(); const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); return { ctx, pg, errs }; };

  // 1. a student never gets the bar or the script
  const st = await mk("loop-test"); let asked = false; st.pg.on("request", (r) => { if (/lesson\.js/.test(r.url())) asked = true; });
  await st.pg.goto(B + "mock.html", { waitUntil: "load" }); await st.pg.waitForSelector(".mcard"); await st.pg.waitForTimeout(600);
  ok(!asked && !(await st.pg.$(".ls-bar")), "student login: lesson.js is not loaded, no bar"); await st.ctx.close();

  // 2. the lesson account
  const { ctx, pg, errs } = await mk("lesson"); const forms = []; let puts = 0;
  pg.on("request", (r) => { if (/docs\.google\.com/.test(r.url())) forms.push(r.url()); if (/api\/progress/.test(r.url()) && r.method() === "PUT") puts++; });
  await pg.goto(B + "mock.html", { waitUntil: "load" }); await pg.waitForSelector(".ls-bar");
  ok(await pg.$('.ls-bar [data-a="start"]'), "bar offers «Начать урок»");
  await pg.click('.ls-bar [data-a="start"]'); ok(!(await pg.$("#ls-l")), "start asks only for the group"); await pg.fill("#ls-g", "Группа А"); await pg.click(".ls-pop .ls-go");
  if (dev === "phone") { ok(await pg.$(".ls-bar.ls-min"), "phone: the bar starts folded"); await pg.click(".ls-bar .ls-tg"); }
  ok(await pg.isVisible('.ls-bar [data-a="flag"]'), "session started: capture buttons shown");
  // no question open yet → flag and vote ask to open one
  await pg.click('.ls-bar [data-a="flag"]'); ok(/Откройте вопрос/.test(await pg.textContent(".ls-toast")), "flag without a question → hint");
  // start PT5 (RW only) and go to the first question
  await pg.click('.mcard[data-m="PT5"]'); await pg.click("#go"); await pg.waitForSelector("#m-dir:not(.hidden)"); await pg.click("#m-dir .btn");
  await pg.waitForSelector("#m-test:not(.hidden)"); await pg.waitForTimeout(2300);
  const lq = await pg.evaluate(() => window.LESSON.where().q); ok(/^PT5\.rw\.m1\.1$/.test(lq), "question id on screen: " + lq);
  // select a word in the passage → «+ Слово»
  const word = await pg.evaluate(() => { const p = document.querySelector("#passage"); const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const m = /[A-Za-z]{6,}/.exec(n.data); if (m) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const s = getSelection(); s.removeAllRanges(); s.addRange(r); return m[0]; } } return ""; });
  await pg.waitForSelector(".ls-word"); await pg.click(".ls-word");
  ok(new RegExp(word).test(await pg.textContent(".ls-toast")), "word saved: " + word);
  await pg.click('.ls-bar [data-a="flag"]'); await pg.click('.ls-pop [data-w="trap"]');
  await pg.click('.ls-bar [data-a="note"]'); await pg.fill("#ls-t", "Сначала своё слово, потом варианты"); await pg.keyboard.press("Enter");
  await pg.click('.ls-vote [data-c="B"]'); await pg.click('.ls-vote [data-c="C"]');
  ok((await pg.getAttribute('.ls-vote [data-c="C"]', "aria-pressed")) === "true", "vote shows the last choice");
  await pg.click('.ls-vote [data-c="A"]'); await pg.click(".ls-toast button");   // undo the last vote
  ok((await pg.getAttribute('.ls-vote [data-c="C"]', "aria-pressed")) === "true", "undo removes only the last mark");
  // the capture never answers the question
  ok(!(await pg.$("#opts .opt.on")), "marking does not choose an option");
  // next question → timeline
  await pg.click("#next").catch(() => {}); await pg.waitForTimeout(2300);
  const S = await pg.evaluate(() => window.LESSON.session());
  const kinds = S.ev.map((e) => e.k).join(",");
  ok(S.group === "Группа А", "session header");
  const tis = [...new Set(S.ev.filter((e) => e.q).map((e) => e.ti))]; ok(tis.length === 1 && /Пробный тест 5 · Reading and Writing · Модуль 1/.test(tis[0]), "the part is recognised by itself: " + tis.join(" | "));
  ok(S.ev.some((e) => !e.q && e.ti === "Пробные тесты"), "pages without a question carry the page name");
  const w = S.ev.find((e) => e.k === "word"); ok(w && w.w === word && w.q === "PT5.rw.m1.1" && w.ctx.includes(word) && w.part === "passage", "word event has the sentence and the question: " + JSON.stringify(w).slice(0, 160));
  ok(S.ev.some((e) => e.k === "flag" && e.why === "trap" && e.q === "PT5.rw.m1.1"), "flag event");
  ok(S.ev.some((e) => e.k === "note" && /своё слово/.test(e.text)), "note event");
  ok(S.ev.filter((e) => e.k === "vote").map((e) => e.c).join("") === "BC", "vote events (A undone)");
  ok(S.ev.filter((e) => e.k === "at").length >= 2 && S.ev.some((e) => e.k === "at" && e.q === "PT5.rw.m1.2"), "timeline: " + kinds);
  // layout: the bar stays inside the screen
  const box = await pg.evaluate(() => { const r = document.querySelector(".ls-bar").getBoundingClientRect(); return { l: r.left, r: innerWidth - r.right, ov: document.documentElement.scrollWidth - innerWidth }; });
  ok(box.l >= 0 && box.r >= 0 && box.ov <= 0, "bar inside the screen " + JSON.stringify(box));
  const clear = await pg.evaluate(() => { const b = document.querySelector(".ls-bar").getBoundingClientRect(); window.scrollTo(0, document.documentElement.scrollHeight); const n = document.querySelector("#next").getBoundingClientRect(); const b2 = document.querySelector(".ls-bar").getBoundingClientRect(); return n.bottom <= b2.top + 1 || b.height === 0; });
  if (dev === "phone") await pg.click(".ls-bar .ls-tg");   // folded again
  await pg.screenshot({ path: `lesson_${dev}.png` });
  // survives a reload, then end → saved to the account
  await pg.reload({ waitUntil: "load" }); await pg.waitForSelector('.ls-bar [data-a="end"]', { state: "attached" }); if (dev === "phone") await pg.click(".ls-bar .ls-tg");
  ok((await pg.evaluate(() => window.LESSON.session().ev.length)) >= S.ev.length, "session survives a reload");
  await pg.click('.ls-bar [data-a="end"]'); await pg.click(".ls-pop .ls-go"); await pg.waitForTimeout(2500);
  ok(await pg.$('.ls-bar [data-a="start"]'), "ended: bar back to «Начать урок»");
  ok(puts >= 1, "session pushed to the account (PUT api/progress): " + puts);
  const saved = await pg.evaluate((id) => { const s = JSON.parse(localStorage.getItem("ls_s_" + id) || "null"); return !!(s && s.t1 > 0); }, S.id);   // the stand-in's KV may hold sessions of earlier runs
  ok(saved, "the finished session is stored");
  // a second device (fresh context) gets the session from the account
  const d2 = await mk("lesson"); await d2.pg.goto(B + "useful.html", { waitUntil: "load" }); await d2.pg.waitForSelector(".ls-bar"); await d2.pg.waitForTimeout(1500);
  ok(await d2.pg.evaluate((id) => !!localStorage.getItem("ls_s_" + id), S.id), "another device receives the session"); await d2.ctx.close();
  ok(forms.length === 0, "nothing sent to the Google Form");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? `${fails} FAILED` : "ALL PASS"); await br.close(); process.exit(fails ? 1 : 0);
})();
