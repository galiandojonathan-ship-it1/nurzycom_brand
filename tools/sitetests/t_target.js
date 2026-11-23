// «Цель ученика» (2026-11-23): the teacher sets a target in the card, the analysis compares with it, the student sees it.
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev.mjs <fx> 8768.   usage: node t_target.js [desktop|phone]
const { chromium, devices } = require("playwright"); const { seed, ADMIN } = require("./cbseed"); const { synthetic, tableOf } = require("./bbsynth.cjs");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const CSV = "Timestamp,Student,Lesson,Part,Answers,Score,Wrong,Seconds,Attempt\n20/11/2026 10:00:00,Ayana Seitkali,V01,p1 · Практика · экран · 2-я: 4/4,1:A>C 2:A 3:B>A 4:A,2/4,\"1,3\",300,1\n";
(async () => {
  // the pure part: target → needed accuracy
  global.window = global; require("../../docs/scale.js"); const PGX = require("../../docs/progress.js"); window.PROGRESS = window.PROGRESS || PGX;
  const N = window.PROGRESS.targetNeeds({ rw: 700, math: 550 }, window.SATSCALE);
  ok(N.rw.acc.E > N.rw.acc.M && N.rw.acc.M > N.rw.acc.H && N.rw.acc.H > 0.7 && N.math.mastery < N.rw.mastery, `target → accuracy: RW 700 needs ${Math.round(N.rw.acc.E * 100)}/${Math.round(N.rw.acc.M * 100)}/${Math.round(N.rw.acc.H * 100)}% on easy/medium/hard; a lower target needs less`);
  ok(window.PROGRESS.vsTarget(0.7, 0.85, 10)[1] === "ниже цели" && window.PROGRESS.vsTarget(0.84, 0.85, 10)[1] === "на уровне цели" && window.PROGRESS.vsTarget(0.95, 0.85, 10)[1] === "выше цели" && window.PROGRESS.vsTarget(0.95, 0.85, 2)[0] === "thin", "status against the target, with a 5-point margin and «мало данных»");
  delete global.window;

  const br = await chromium.launch(), opt = dev === "phone" ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } };
  const tctx = await br.newContext(opt);
  await tctx.addInitScript((A) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("admin_key", A); }, ADMIN);
  const teacher = await tctx.newPage(); const errs = []; teacher.on("pageerror", (e) => errs.push(e.message));
  console.log(await seed(teacher));
  // Ayana shares a Bluebook result so the index is drawn
  const sctx = await br.newContext(opt); await sctx.addInitScript(() => { localStorage.setItem("site_pw", "pass-ayana-1234"); localStorage.setItem("site_login", "ayana"); localStorage.setItem("hw_student", "Ayana Seitkali"); });
  const a = await sctx.newPage(); await a.goto(B + "mock.html", { waitUntil: "load" }); await a.waitForSelector("#bb-import:not([hidden])", { timeout: 15000 });
  await a.click("#bb-import summary"); await a.fill("#bb-text", tableOf(synthetic(), "SAT2", { rw: "m2h", math: "m2e" }, "mp", ["rw.1.9", "math.2.8"])); await a.click("#bb-go");
  await a.waitForFunction(() => /Отправлено/.test(document.getElementById("bb-status").textContent), null, { timeout: 15000 });
  // the teacher sets a target
  await teacher.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await teacher.waitForTimeout(2500);
  await teacher.evaluate((csv) => window.TeacherWorkspace.useFile(csv, "target test"), CSV); await teacher.waitForTimeout(600);
  await teacher.click('#tabs [data-v="students"]'); await teacher.waitForTimeout(300);
  await teacher.click('#v-students tr.click:has-text("Ayana")'); await teacher.waitForSelector("#goal-edit", { timeout: 20000 });
  ok(/Цель не задана/.test(await teacher.textContent("#st-goal")), "a card without a target offers «Задать цель»");
  await teacher.click("#goal-edit"); await teacher.fill("#goal-rw", "700"); await teacher.fill("#goal-m", "650"); await teacher.selectOption("#goal-ex", "2027-03-06");
  await teacher.click("#goal-f button[type=submit]"); await teacher.waitForFunction(() => /Цель сохранена/.test(document.getElementById("st-goal").textContent), null, { timeout: 15000 });
  const line = (await teacher.textContent("#st-goal")).replace(/\s+/g, " "); console.log("goal:", line.slice(0, 200));
  ok(/RW 700 · Math 650 · всего 1350/.test(line) && /экзамен 6 марта 2027/.test(line), "the target and the exam date are shown above the tabs");
  const copy = await teacher.evaluate(async () => { const r = await SITE.api("admin/progress?id=" + encodeURIComponent(await SITE.lid("ayana"))); return (await SITE.unsealBlob(r.data.data)).goal_target; });
  ok(copy && JSON.parse(copy.v).rw === 700, "saved in the student's own copy (goal_target)");
  await teacher.click('[data-st="charts"]'); await teacher.waitForSelector("#st-prog .pg-goal", { timeout: 20000 });
  const hero = (await teacher.textContent("#st-prog .pg-goal")).replace(/\s+/g, " "); console.log("hero:", hero);
  ok(/Цель RW 700 \(ориентир сейчас ≈ \d+\)/.test(hero) && (/уже на уровне цели/.test(hero) || /нужно мастерство \d+%/.test(hero)) && /Цель Math 650 .*трудные вопросы: нужно \d+%/.test(hero), "the progress block compares the target with the current ориентир and says what it needs");
  ok(/Цель:.*RW 700/.test((await teacher.textContent("#st-pred")).replace(/\s+/g, " ")), "«Ориентир на SAT» shows the target next to the range");
  const dashed = await teacher.$$eval("#pg-df path[stroke-dasharray]", (x) => x.length);
  ok(dashed >= 1, `dashed «цель» lines on the difficulty chart: ${dashed}`);
  // the student sees it
  const st = await sctx.newPage(); await st.goto(B + "index.html", { waitUntil: "load" }); await st.waitForTimeout(2500); await st.evaluate(() => SITE.syncNow && SITE.syncNow()); await st.reload({ waitUntil: "load" });
  await st.waitForSelector(".td-goal", { timeout: 20000 }).catch(() => {});
  const td = (await st.textContent(".td-goal").catch(() => "")).replace(/\s+/g, " "); console.log("student:", td);
  ok(/Твоя цель/.test(td) && /RW 700 · Math 650/.test(td) && /экзамен 6 марта/.test(td), "the student sees the target on «Сегодня»");
  if (dev === "phone") ok((await teacher.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  await (await teacher.$("#st-goal")).screenshot({ path: `${__dirname}/target_${dev}.png` });
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
