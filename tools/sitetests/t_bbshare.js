// «Поделиться с преподавателем» for a Bluebook result: explicit confirmation, one record per attempt, access between two
// synthetic accounts (ayana, dias from cbseed.js), the teacher's views and the Gemini picker. Synthetic data only.
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev.mjs <fx> 8768.   usage: node t_bbshare.js [desktop|phone]
const { chromium, devices } = require("playwright"); const { seed, ADMIN } = require("./cbseed"); const { synthetic, tableOf } = require("./bbsynth.cjs");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const text = tableOf(synthetic(), "SAT2", { rw: "m2h", math: "m2e" }, "tab", ["rw.1.9", "rw.2.4", "math.2.8", "math.2.22o"]);
const CSV = "Timestamp,Student,Lesson,Part,Answers,Score,Wrong,Seconds,Attempt\n20/11/2026 10:00:00,Ayana Seitkali,V01,p1 · Практика · экран · 2-я: 4/4,1:A>C 2:A 3:B>A 4:A,2/4,\"1,3\",300,1\n";
(async () => {
  const br = await chromium.launch(), opt = dev === "phone" ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } };
  const teacher = await (await br.newContext(opt)).newPage();
  await teacher.context().addInitScript((A) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("admin_key", A); }, ADMIN);
  console.log(await seed(teacher));
  const student = async (login) => { const c = await br.newContext(opt); await c.addInitScript((L) => { localStorage.setItem("site_pw", `pass-${L}-1234`); localStorage.setItem("site_login", L); }, login);
    const p = await c.newPage(); p.errs = []; p.on("pageerror", (e) => p.errs.push(e.message)); return p; };
  // Ayana shares
  const a = await student("ayana");
  await a.goto(B + "mock.html", { waitUntil: "load" }); await a.waitForSelector("#bb-import:not([hidden])", { timeout: 15000 });
  const st = () => a.textContent("#bb-status"), waitSt = (re) => a.waitForFunction((r) => new RegExp(r).test(document.getElementById("bb-status").textContent), re.source, { timeout: 15000 }).catch(() => {});
  ok(/Отправить преподавателю/.test(await a.textContent("#bb-go")) && /Текст вопросов и ваш аккаунт College Board не передаются/.test(await a.textContent("#bb-note")), "the button says «Отправить преподавателю», the note under it says what is sent");
  await a.click("#bb-import summary"); await a.focus("#bb-text");
  await a.evaluate((t) => { const el = document.getElementById("bb-text"); el.value = t; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("paste", { bubbles: true })); }, text);
  await waitSt(/Всё прочитано/);
  ok(/Всё прочитано: нажмите «Отправить преподавателю»/.test(await st()) && !(await a.evaluate(() => Object.keys(localStorage).some((k) => k.startsWith("bb_share_")))), "pasting checks at once and sends nothing by itself");
  await a.click("#bb-go"); await waitSt(/Отправлено|Сохранено/);
  ok(/Отправлено ✓/.test(await st()), "one click on «Отправить преподавателю» saves it on the account: " + (await st()));
  ok(/Уже отправлены преподавателю/.test(await a.textContent("#bb-sent")) && /SAT Practice Test 2/.test(await a.textContent("#bb-sent")) && /отправлено: 1/.test(await a.textContent("#bb-import summary")), "a visible list «Уже отправлены преподавателю» shows the test, and the heading counts it");
  await a.click("#bb-go"); await waitSt(/уже отправлен/);
  ok(/уже отправлен/.test(await st()), "sending the same table again: «уже отправлен», no second record");
  await a.reload(); await a.waitForSelector("#bb-import:not([hidden])");
  ok(/SAT Practice Test 2/.test(await a.textContent("#bb-sent")), "after a reload the list still shows what was sent");
  await a.click("#bb-import summary"); await a.fill("#bb-text", text); await a.click("#bb-go"); await waitSt(/уже отправлен/);
  ok(/уже отправлен/.test(await st()), "after a reload the same attempt is still recognised as sent (one click checks, then refuses the duplicate)");
  // a broken table is never sent
  await a.fill("#bb-text", text.split("\r\n").slice(0, 30).join("\n")); await a.click("#bb-go"); await a.waitForTimeout(600);
  ok(/View: All|Скопируйте/.test(await st()) && !/Отправлено/.test(await st()), "a partial table is not sent; the message says what to do");
  // a later attempt (SAT3 shares module 1 with SAT2) with the same RW question missed again
  await a.fill("#bb-text", tableOf(synthetic(), "SAT3", { rw: "m2e", math: "m2h" }, "tab", ["rw.1.9"])); await a.click("#bb-go"); await waitSt(/Отправлено|Сохранено/);
  ok(/SAT Practice Test 2/.test(await a.textContent("#bb-sent")) && /SAT Practice Test 3/.test(await a.textContent("#bb-sent")), "the list shows both sent tests");
  // access between accounts
  const d = await student("dias"); await d.goto(B + "mock.html", { waitUntil: "load" }); await d.waitForTimeout(1500);
  const cross = await d.evaluate(async () => { const me = await SITE.practiceIdentity(), other = await SITE.lid("ayana");
    const r = await fetch("api/progress?id=" + encodeURIComponent(other), { headers: { "x-sync": me.tok }, cache: "no-store" }); return r.status; });
  ok(cross === 403, `Dias's login cannot read Ayana's copy (status ${cross})`);
  const own = await a.evaluate(async () => { const me = await SITE.practiceIdentity(); const r = await fetch("api/progress?id=" + encodeURIComponent(me.id), { headers: { "x-sync": me.tok }, cache: "no-store" }); return r.status; });
  ok(own === 200, "Ayana reads her own copy");
  const copies = await teacher.evaluate(async () => { const out = {}; for (const L of ["ayana", "dias"]) { const id = await SITE.lid(L), g = await SITE.api("admin/progress?id=" + encodeURIComponent(id));
    const Bx = g.ok ? await SITE.unsealBlob(g.data.data) : {}; out[L] = Object.keys(Bx).filter((k) => k.startsWith("bb_share_") && Bx[k].v != null).map((k) => JSON.parse(Bx[k].v)); } return out; });
  ok(copies.ayana.length === 2 && copies.dias.length === 0, `two different attempts → two records on Ayana's account, none on Dias's (${copies.ayana.length}/${copies.dias.length})`);
  const sh = copies.ayana.find((x) => x.sections.rw && x.sections.rw.test === "SAT2") || { sections: {} };
  ok(sh.sections.rw && sh.sections.rw.test === "SAT2" && sh.sections.rw.miss.length === 2 && sh.sections.math.route === "m2e" && sh.sections.math.miss.length === 2, "the record: test, route and the 4 misses");
  ok(!JSON.stringify(sh).match(/passage|stem|stim|<p>/), "no question text in the record");
  ok(Object.values(sh.sections.rw.skills).every((v) => v[1] >= v[0] && v[1] > 0), "skills carry the sample size (wrong of total)");
  // teacher: cabinet account card
  await teacher.goto(B + "cabinet.html?view=students", { waitUntil: "load" }); await teacher.waitForSelector(".scard", { timeout: 20000 });
  await teacher.click(`.scard:has(.sc-nm:text-is("Ayana Seitkali")) .sc-open`); await teacher.waitForSelector(".cb-head");
  await teacher.click('[data-tab="res"]'); await teacher.waitForTimeout(300);
  const res = (await teacher.textContent(".cb-body")).replace(/\s+/g, " ");
  ok(/Bluebook · отправлено учеником/.test(res) && /SAT Practice Test 2/.test(res), "cabinet → Ayana → «Результаты» shows the Bluebook record");
  await teacher.click(".bbs-one summary b"); await teacher.waitForTimeout(200);
  const det = (await teacher.textContent(".bbs-one")).replace(/\s+/g, " ");
  ok(/М1 9/.test(det.replace(/М1(\d)/, "М1 $1")) || /М1\s*9/.test(det) || /9 \S+ → /.test(det), "module, number, choice → key in the table");
  ok(/из \d+/.test(det) && /причину ошибки уточните в разборе/.test(det), "skills with sample size and the source note");
  // teacher: results view card and the Gemini picker
  await teacher.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await teacher.waitForTimeout(2500);
  await teacher.evaluate((csv) => window.TeacherWorkspace.useFile(csv, "bb test"), CSV); await teacher.waitForTimeout(600);
  await teacher.click('#tabs [data-v="students"]'); await teacher.waitForTimeout(300);
  await teacher.click('#v-students tr.click:has-text("Ayana")'); await teacher.waitForSelector("#st-bb .bbs", { timeout: 15000 });
  const bbTxt = (await teacher.textContent("#st-bb")).replace(/\s+/g, " ");
  ok(/SAT Practice Test 2/.test(bbTxt) && /SAT Practice Test 3/.test(bbTxt), "the results card shows both shared Bluebook results");
  ok(/Повторные ошибки: \d/.test(bbTxt) && /Уже был: Пробный тест 1 · М1 · №3; Bluebook SAT Practice Test 2 · ✗/.test(bbTxt), "the later miss is flagged: it was in our PT1 and was missed in the earlier Bluebook attempt");
  await teacher.waitForSelector("#st-tw [data-twsel]", { timeout: 15000 });
  const works = await teacher.$$eval('#st-tw [data-twf="work"] option', (o) => o.map((x) => x.textContent));
  ok(works.some((w) => /^Bluebook · SAT Practice Test 2 · 4$/.test(w)) && works.some((w) => /^Bluebook · SAT Practice Test 3 · 1$/.test(w)), "the Gemini picker offers the Bluebook misses as works: " + works.join(" | "));
  // remove in the results card: «Убрать» → «Вернуть» → «Убрать»; the record becomes a mark, the student cannot resend it
  const delBtn = () => teacher.$(`#st-bb .bbs-one:has(summary b:has-text("SAT Practice Test 2")) [data-bbdel]`);
  await (await delBtn()).click(); await teacher.waitForSelector("#bb-undo", { timeout: 10000 });
  const left = await teacher.$$eval("#st-bb .bbs-one summary b", (x) => x.map((e) => e.textContent)); console.log("left after removal:", left, "|", await teacher.textContent("#bb-del-st"));
  ok(!left.some((t) => /Practice Test 2\b/.test(t)) && /убран/.test(await teacher.textContent("#bb-del-st")), "«Убрать» in the results card removes the attempt at once and offers «Вернуть»");
  await teacher.click("#bb-undo"); await teacher.waitForFunction(() => /возвращён/.test((document.getElementById("bb-del-st") || {}).textContent || ""), null, { timeout: 10000 });
  ok(/SAT Practice Test 2/.test(await teacher.textContent("#st-bb")), "«Вернуть» puts it back");
  await (await delBtn()).click(); await teacher.waitForSelector("#bb-undo", { timeout: 10000 });
  const marks = await teacher.evaluate(async () => { const id = await SITE.lid("ayana"), g = await SITE.api("admin/progress?id=" + encodeURIComponent(id)), Bx = await SITE.unsealBlob(g.data.data);
    return Object.keys(Bx).filter((k) => k.startsWith("bb_share_")).map((k) => JSON.parse(Bx[k].v)); });
  ok(marks.length === 2 && marks.filter((m) => m.deleted).length === 1 && !JSON.stringify(marks.find((m) => m.deleted)).includes("miss"), "on the account: one record kept as a «removed» mark without data, the other untouched");
  await a.reload(); await a.waitForSelector("#bb-import:not([hidden])"); await a.waitForTimeout(1500);
  await a.evaluate(() => SITE.syncNow()); await a.reload(); await a.waitForSelector("#bb-import:not([hidden])");
  await a.click("#bb-import summary"); await a.fill("#bb-text", text); await a.click("#bb-go");
  await a.waitForFunction(() => /Отправлено ✓/.test(document.getElementById("bb-status").textContent), null, { timeout: 15000 });
  ok(true, "a removed attempt can be sent again (the teacher may change their mind)");
  await teacher.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await teacher.waitForTimeout(2500);
  await teacher.evaluate((csv) => window.TeacherWorkspace.useFile(csv, "bb test"), CSV); await teacher.waitForTimeout(600);
  await teacher.click('#tabs [data-v="students"]'); await teacher.waitForTimeout(300);
  await teacher.click('#v-students tr.click:has-text("Ayana")'); await teacher.waitForSelector("#st-bb .bbs", { timeout: 15000 });
  ok(/отправлен снова после удаления/.test(await teacher.textContent("#st-bb .bbs-one:has(summary b:has-text(\"SAT Practice Test 2\")) summary")), "the teacher sees it back with the mark «отправлен снова после удаления»");
  // remove in the cabinet
  await teacher.goto(B + "cabinet.html?view=students", { waitUntil: "load" }); await teacher.waitForSelector(".scard", { timeout: 20000 });
  await teacher.click(`.scard:has(.sc-nm:text-is("Ayana Seitkali")) .sc-open`); await teacher.waitForSelector(".cb-head"); await teacher.click('[data-tab="res"]');
  await teacher.click("[data-bbdel]"); await teacher.waitForTimeout(1500);
  ok(/Вернуть/.test(await teacher.textContent("#cb-toast")), "cabinet «Убрать»: the message offers «Вернуть»");
  await teacher.click("[data-bbdel]"); await teacher.waitForTimeout(1500);
  ok(!/Bluebook · отправлено/.test(await teacher.textContent(".cb-body")), "cabinet «Убрать» removes them from the account");
  if (dev === "phone") ok((await a.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll on the student page");
  ok(!a.errs.length && !d.errs.length, "no page errors " + JSON.stringify([...a.errs, ...d.errs]));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
