// «Ошибки класса» (docs/lsmist.js): teacher.html → «Анализ группы» → «Показать на уроке» writes the group's hardest
// questions (no names) into the lesson account; the lesson account opens them from the bar, shows the class's choices and
// the answer on request, and the bar's marks apply to the question on screen. Stand-in on 8768 with the REAL data copy.
// Needs the fake class CSV: node mkgroupcsv.mjs <key.b64> <docs> group2.csv
// usage: node t_lsmist.js [desktop|phone]
const { chromium, devices } = require("playwright"); const { seed, page } = require("./cbseed");
const dev = process.argv[2] || "desktop", B = "http://127.0.0.1:8768/";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const pg = await page(br); const errs = []; pg.on("pageerror", (e) => errs.push("teacher: " + e.message));
  await pg.route(/docs\.google\.com/, (r) => r.abort());
  console.log(await seed(pg));
  await pg.evaluate(async () => { const id = await SITE.lid("lesson"); await SITE.api("admin/user?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ entry: await SITE.account("lesson", "Урок", "fixture-pw") }) });
    await SITE.api("admin/progress?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({}) }) });
    const ids = []; for (const l of ["ayana", "dias", "aruzhan", "sher"]) ids.push(await SITE.lid(l));
    await SITE.api("admin/groups", { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({ groups: [{ id: "g1", name: "SAT Verbal · вечер", kind: "group", color: "teal", members: ids }], at: Date.now() }) }) }); });

  // the lesson account is open first (as on the shared screen), with nothing sent yet
  const lc = await br.newContext(dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1280, height: 860 } });
  await lc.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "lesson"); localStorage.setItem("hw_student", "Урок"); });
  const lp = await lc.newPage(); lp.on("pageerror", (e) => errs.push("lesson: " + e.message)); lp.on("dialog", (d) => d.accept());
  await lp.goto(B + "index.html", { waitUntil: "load" }); await lp.waitForSelector(".ls-bar");
  ok(await lp.isVisible('.ls-bar [data-a="mist"]'), "«Ошибки класса» on the bar before a lesson starts");
  await lp.click('.ls-bar [data-a="mist"]'); await lp.waitForSelector(".lm .lm-empty");
  ok(/Показать на уроке/.test(await lp.textContent(".lm")), "empty: says how to send the mistakes");
  await lp.keyboard.press("Escape"); ok(!(await lp.$(".lm")), "Escape closes");
  await lp.click('.ls-bar [data-a="start"]'); await lp.fill("#ls-g", "SAT Verbal · вечер"); await lp.click(".ls-pop .ls-go");
  if (dev === "phone") await lp.click(".ls-bar .ls-tg");

  // the teacher page sends the group's hardest questions
  await pg.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await pg.waitForTimeout(2000);
  await pg.setInputFiles("#file", __dirname + "/group2.csv"); await pg.waitForTimeout(1500);
  await pg.click('#tabs .chip[data-v="group"]'); await pg.waitForSelector("#ga-send", { timeout: 30000 });
  const titles = await pg.$$eval(".ga-q summary b", (a) => a.map((x) => x.textContent));
  await pg.click("#ga-send"); await pg.waitForFunction(() => /Отправлено/.test(document.getElementById("ga-send-st").textContent), null, { timeout: 20000 });
  ok(true, "teacher: " + (await pg.textContent("#ga-send-st")));
  const stored = await pg.evaluate(async () => { const r = await SITE.api("admin/progress?id=" + encodeURIComponent(await SITE.lid("lesson"))); return (await SITE.unsealBlob(r.data.data)).ls_m.v; });
  ok(!/Ayana|Dias|Aruzhan|Sher|Seitkali|Omarov/i.test(stored), "the snapshot holds no student names");

  // the lesson account opens it
  await lp.click('.ls-bar [data-a="mist"]'); await lp.waitForSelector(".lm-card", { timeout: 15000 });
  const cards = await lp.$$eval(".lm-card b", (a) => a.map((x) => x.textContent));
  ok(cards.length === titles.length && cards[0] === titles[0], `same ${cards.length} questions in the same order: ${cards[0]}`);
  ok(/SAT Verbal · вечер/.test(await lp.textContent(".lm-h h2")), "group name in the header");
  const i = Math.max(0, cards.findIndex((c) => /PR2|Прогноз/.test(c)));
  await lp.click(`.lm-card[data-i="${i}"]`); await lp.waitForSelector(".lm-o, .lm-spr", { timeout: 15000 });
  ok(!(await lp.$(".lm-o .bar")) && !(await lp.$(".lm-o.right")) && !(await lp.$(".lm-expl")), "choices and answer stay hidden until asked");
  await lp.click('[data-lm="picks"]'); await lp.waitForSelector(".lm-o .bar, .lm-sum");
  const sum = await lp.textContent(".lm-sum"); ok(/Ответили \d+/.test(sum) && /Имена не показываются/.test(sum), "class choices shown: " + sum.trim());
  await lp.click('[data-lm="ans"]'); await lp.waitForSelector(".lm-o.right, .lm-spr b");
  ok((await lp.$$(".lm-o.right")).length === 1 || !!(await lp.$(".lm-spr b")), "the right answer is marked");
  ok(await lp.$(".lm-expl"), "explanation shown");
  // marks apply to this question
  await lp.waitForTimeout(2300);
  await lp.click('.ls-bar [data-a="flag"]'); await lp.click('.ls-pop [data-w="trap"]'); await lp.click('.ls-vote [data-c="C"]');
  await lp.click('.ls-bar [data-a="word"]');
  const w = await lp.evaluate(() => { const box = document.querySelector(".lm-stim, .lm-stem"), stim = box.classList.contains("lm-stim"); box.scrollIntoView({ block: "center" }); const t = document.createTreeWalker(box, NodeFilter.SHOW_TEXT); let n; while ((n = t.nextNode())) { const m = /[A-Za-z]{5,}/.exec(n.data); if (m) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const b = r.getBoundingClientRect(); return { w: m[0], stim, x: b.left + b.width / 2, y: b.top + b.height / 2 }; } } });
  await lp.mouse.click(w.x, w.y); await lp.waitForTimeout(300);
  const S = await lp.evaluate(() => window.LESSON.session()), qid = cards[i] && (await lp.evaluate(() => document.body.dataset.lq));
  const fl = S.ev.find((e) => e.k === "flag"), wd = S.ev.find((e) => e.k === "word"), at = S.ev.filter((e) => e.k === "at" && e.q === qid);
  ok(fl && fl.q === qid && /^Разбор ошибок · /.test(fl.ti), "flag recorded on the question: " + (fl && fl.q) + " · " + (fl && fl.ti));
  ok(wd && wd.w === w.w && wd.q === qid && wd.part === (w.stim ? "passage" : "question"), "word recorded on the question: " + (wd && [wd.w, wd.part].join(" · ")));
  ok(at.length >= 1, "timeline has the question");
  ok(S.ev.some((e) => e.k === "vote" && e.c === "C" && e.q === qid), "class vote recorded");
  // next question, back to the list, close restores the page
  if (cards.length > 1) { await lp.click('[data-lm="next"]'); await lp.waitForTimeout(400); ok((await lp.evaluate(() => document.body.dataset.lq)) !== qid, "«Далее» opens the next question"); }
  const ov = await lp.evaluate(() => document.querySelector(".lm").scrollWidth - document.querySelector(".lm").clientWidth); ok(ov <= 0, "no sideways scroll: " + ov);
  await lp.screenshot({ path: `lsmist_${dev}.png` });
  await lp.keyboard.press("Escape"); await lp.waitForSelector(".lm-card"); await lp.keyboard.press("Escape");
  ok(!(await lp.$(".lm")) && !(await lp.evaluate(() => document.body.dataset.lq)), "closed: the page's own state comes back");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? `${fails} FAILED` : "ALL PASS"); await br.close(); process.exit(fails ? 1 : 0); })();
