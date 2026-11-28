// «nurzycom bank» (nbank.js): the cabinet section lists the bank, filters by section / level / kind / hard / search, shows the key,
// explanation and word cards, picks «Случайные 10», and turns the ticked questions into a «Мой тест».
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev.mjs <fx> 8768.   usage: node t_nbank.js [desktop|phone]
const { chromium, devices } = require("playwright"); const { seed, ADMIN } = require("./cbseed");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch(), opt = dev === "phone" ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } };
  const ctx = await br.newContext(opt);
  await ctx.addInitScript((A) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("admin_key", A); }, ADMIN);
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  console.log(await seed(p));
  await p.goto(B + "cabinet.html?view=bank", { waitUntil: "load" });
  await p.waitForSelector(".nb .nb-row", { timeout: 30000 });
  const head = (await p.textContent(".nb .cb-section-head")).replace(/\s+/g, " ");
  ok(/nurzycom bank/.test(head) && /4 вопроса, 3 подтемы/.test(head), "the section opens with the count: " + head.slice(0, 90));
  ok((await p.$$(".nb .nb-row")).length === 4, "all 4 questions listed");
  await p.selectOption('[data-nbf="sec"]', "math"); await p.waitForTimeout(200);
  ok((await p.$$(".nb .nb-row")).length === 1, "section Math: 1 question");
  await p.selectOption('[data-nbf="sec"]', ""); await p.check('[data-nbf="hard"]'); await p.waitForTimeout(200);
  ok((await p.$$(".nb .nb-row")).length === 1 && /очень сложный/.test(await p.textContent(".nb-list")), "«Только очень сложные»: the hard one");
  await p.uncheck('[data-nbf="hard"]'); await p.selectOption('[data-nbf="kind"]', "control"); await p.waitForTimeout(200);
  ok((await p.$$(".nb .nb-row")).length === 1 && /контрольный/.test(await p.textContent(".nb-list")), "«Контрольные»: the control one");
  await p.selectOption('[data-nbf="kind"]', ""); await p.fill('[data-nbf="q"]', "f(4)"); await p.waitForTimeout(600);
  ok((await p.$$(".nb .nb-row")).length === 1, "search finds the Math question by its text");
  await p.fill('[data-nbf="q"]', ""); await p.waitForTimeout(600);
  await p.click(".nb-row:first-child summary"); await p.waitForTimeout(200);
  const body = (await p.textContent(".nb-row:first-child .nb-body")).replace(/\s+/g, " ");
  ok(/ответ/.test(body) && /Почему/.test(body) && /Ловушка/.test(body) && /reed/.test(body) && /тростник/.test(body), "a question shows the key, explanation, trap and its word cards");
  await p.click("#nb-ten"); await p.waitForTimeout(200);
  ok((await p.$$("[data-nbsel]:checked")).length === 4 && /выбрано 4/.test(await p.textContent(".nb-ctl")), "«Случайные 10» ticks what is there (4)");
  ok(/nurzycom bank · 4 вопросов/.test(await p.inputValue("#nb-title")), "a default test title");
  await p.fill("#nb-title", "Bank test"); await p.click("#nb-save");
  await p.waitForFunction(() => /сохранён/.test(document.getElementById("nb-msg")?.textContent || ""), null, { timeout: 15000 });
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem("cb_ct") || "{}"));
  const t = (saved.tests || []).find((x) => x.title === "Bank test");
  ok(t && t.q.length === 4 && t.src === "nbank" && t.q.some((q) => q.type === "spr" && q.a === "14") && t.q.every((q) => q.nb), "saved as a «Мой тест» with 4 questions (the typed one keeps its answer)");
  if (dev === "phone") ok((await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  await (await p.$(".nb")).screenshot({ path: `${__dirname}/nbank_${dev}.png` });
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
