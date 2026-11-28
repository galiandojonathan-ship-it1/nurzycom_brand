// «Мои тесты»: after the teacher replaces questions in an already-taken test, the mistakes review must not claim «Ошибок нет».
// Runs after t_ct.js on the same stand-in (8768): Ayana has 2/4 on «Transitions · проверка».
const { chromium } = require("playwright"); const { page } = require("./cbseed");
const B = "http://127.0.0.1:8768/"; let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const MODE = process.argv[2] || "all"; // all = replace every question; part = replace two of four
(async () => {
  const br = await chromium.launch(); const pg = await page(br); const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("dialog", (d) => d.accept());
  await pg.goto(B + "cabinet.html?view=students", { waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
  await pg.click("[data-ct]"); await pg.waitForSelector(".ct-list");
  await pg.click(".ct-list [data-ctedit]"); await pg.waitForSelector("#ct-form");
  const n0 = await pg.$$eval("details.ct-q", (a) => a.length);
  const del = MODE === "all" ? n0 : 2;
  for (let i = 0; i < del; i++) { const L = pg.locator("details.ct-q").last(); await L.evaluate((d) => d.open = true); await L.locator("[data-qdel]").click(); await pg.waitForTimeout(80); }
  console.log("questions left:", await pg.$$eval("details.ct-q", (a) => a.length));
  await pg.click("[data-qimp]");
  await pg.fill("#ct-imp", "Q: Which choice is a noun?\nA) run\nB) table\nC) quickly\nD) blue\nAnswer: B\n---\nQ: Which choice is a verb?\nA) jump\nB) chair\nC) red\nD) softly\nAnswer: A");
  await pg.click("#ct-impgo"); await pg.waitForTimeout(200);
  await pg.click('#ct-form button[type=submit]'); await pg.waitForTimeout(800);
  console.log("save:", (await pg.textContent(".ct .cb-sum")).trim());
  await pg.click("[data-ctlist]").catch(() => {}); await pg.waitForSelector(".ct-list");
  await pg.click(".ct-list [data-ctres]"); await pg.waitForSelector("#ct-mist");
  const grp = (await pg.textContent("#ct-mist")).replace(/\s+/g, " ");
  console.log("group:", grp.slice(0, 400));
  ok(!/Ошибок нет: все ответили верно/.test(grp), "group review does not claim «все ответили верно»");
  ok(/замен|без ответов|нет ответов/i.test(grp), "group review says some questions have no answers (replaced after submitting)");
  await pg.uncheck("#ct-only").catch(() => {}); await pg.waitForTimeout(150);
  console.log("group all:", (await pg.textContent("#ct-mist")).replace(/\s+/g, " ").slice(0, 300));
  await pg.check("#ct-only").catch(() => {});
  await pg.click("[data-ctstu]"); await pg.waitForTimeout(200);
  const stu = (await pg.textContent("#ct-mist")).replace(/\s+/g, " ");
  console.log("student:", stu.slice(0, 400));
  ok(!/Ошибок нет: все ответы верные/.test(stu) || /замен|без ответов|нет ответов/i.test(stu), "student review does not say «все ответы верные» without noting the replaced questions");
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAIL` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
