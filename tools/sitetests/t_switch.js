// Two accounts on one browser (2026-11-23: Nurassyl's Bluebook tests appeared on a student's account after he logged in as that
// student on his own browser). A shares a Bluebook result, logs out, B logs in on the same browser: B sees nothing of A's, and
// B's cloud copy gets none of A's keys. Then the teacher's cabinet finds an old leaked record (no owner stamp), also when the
// source account is archived, and removes it.
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev.mjs <fx> 8768.   usage: node t_switch.js [desktop|phone]
const { chromium, devices } = require("playwright"); const { seed, ADMIN } = require("./cbseed"); const { synthetic, tableOf } = require("./bbsynth.cjs");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch(), opt = dev === "phone" ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } };
  const tctx = await br.newContext(opt);
  await tctx.addInitScript((A) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("admin_key", A); }, ADMIN);
  const teacher = await tctx.newPage(); const errs = []; teacher.on("pageerror", (e) => errs.push(e.message));
  console.log(await seed(teacher));
  const copyOf = (login) => teacher.evaluate(async (l) => { const r = await SITE.api("admin/progress?id=" + encodeURIComponent(await SITE.lid(l))); return r.ok ? SITE.unsealBlob(r.data.data) : {}; }, login);

  // one shared browser: log in through the form as Dias, share a Bluebook result
  const ctx = await br.newContext(opt), p = await ctx.newPage(); p.on("pageerror", (e) => errs.push(e.message));
  const logIn = async (login) => { await p.goto(B + "mock.html", { waitUntil: "load" }); await p.waitForSelector("#auth-login", { timeout: 15000 });
    await p.fill("#auth-login", login); await p.fill("#auth-pw", `pass-${login}-1234`); await p.click("#auth-go");
    await p.waitForSelector("#bb-import:not([hidden])", { timeout: 15000 }); };
  await logIn("dias");
  await p.click("#bb-import summary"); await p.fill("#bb-text", tableOf(synthetic(), "SAT2", { rw: "m2h", math: "m2e" }, "mp", ["rw.1.9"])); await p.click("#bb-go");
  await p.waitForFunction(() => /Отправлено/.test(document.getElementById("bb-status").textContent), null, { timeout: 15000 });
  const dias = await copyOf("dias"), dk = Object.keys(dias).filter((k) => k.startsWith("bb_share_"));
  ok(dk.length === 1 && JSON.parse(dias[dk[0]].v).own, "Dias's record is in his copy, stamped with his account");

  // log out, Timur logs in on the same browser
  await p.evaluate(() => SITE.logout()); await logIn("timur"); await p.waitForTimeout(1500);
  await p.click("#bb-import summary");
  const sent = await p.evaluate(() => ({ hidden: document.getElementById("bb-sent").hidden, n: document.getElementById("bb-sum-n").textContent, local: Object.keys(localStorage).filter((k) => /^(bb_share_|hw_last_|mk_)/.test(k)) }));
  ok(sent.hidden && !sent.n && !sent.local.length, "Timur sees no «Уже отправлены» list and the browser holds none of Dias's results: " + JSON.stringify(sent));
  await p.evaluate(() => SITE.syncNow()); await p.waitForTimeout(500);
  const timur = await copyOf("timur");
  ok(!Object.keys(timur).some((k) => k.startsWith("bb_share_")), "nothing of Dias's reached Timur's cloud copy");
  // Timur sends the same attempt himself: it is his own, not «уже отправлен»
  await p.fill("#bb-text", tableOf(synthetic(), "SAT2", { rw: "m2h", math: "m2e" }, "mp", ["rw.1.9"])); await p.click("#bb-go");
  await p.waitForFunction(() => /Отправлено/.test(document.getElementById("bb-status").textContent), null, { timeout: 15000 });
  ok(true, "the same attempt can be sent by Timur as his own");
  // back to Dias: his record comes back from his cloud copy, Timur's does not stay
  await p.evaluate(() => SITE.logout()); await logIn("dias"); await p.waitForTimeout(1500);
  const back = await p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("bb_share_")).map((k) => JSON.parse(localStorage.getItem(k)).own));
  const diasId = await teacher.evaluate(() => SITE.lid("dias"));
  ok(back.length === 1 && back[0] === diasId, "Dias logs in again: only his own record is on the browser");

  // an old leak (before the owner stamp): Dias's record copied into Aruzhan's copy without «own»
  await teacher.evaluate(async (k) => {
    const d = (await (async () => { const r = await SITE.api("admin/progress?id=" + encodeURIComponent(await SITE.lid("dias"))); return SITE.unsealBlob(r.data.data); })())[k];
    const v = JSON.parse(d.v); delete v.own;
    for (const l of ["dias", "aruzhan"]) { const id = await SITE.lid(l), r = await SITE.api("admin/progress?id=" + encodeURIComponent(id)); const Bx = r.ok ? await SITE.unsealBlob(r.data.data) : {};
      Bx[k] = { v: JSON.stringify(v), t: Date.now() }; if (l === "aruzhan") Bx["hw_last_Dias Omarov_V01_p3"] = { v: "24/26", t: Date.now() };
      await SITE.api("admin/progress?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob(Bx) }) }); }
  }, dk[0]);
  // Dias is archived (a former student): his copy still counts for the check
  await teacher.evaluate((id) => localStorage.setItem("cb_groups", JSON.stringify({ groups: [{ id: "g1", name: "Группа", kind: "group", color: "blue", members: [] }], archived: [id], at: Date.now() + 5000 })), diasId);
  await teacher.goto(B + "cabinet.html?view=students", { waitUntil: "load" }); await teacher.waitForSelector(".scard", { timeout: 20000 });
  await teacher.click('.scard:has(.sc-nm:text-is("Aruzhan Bek")) .sc-open'); await teacher.waitForSelector(".cb-head", { timeout: 10000 }); await teacher.waitForSelector(".cb-foreign", { timeout: 10000 }).catch(() => {});
  const box = await teacher.$(".cb-foreign"), txt = box ? (await box.textContent()).replace(/\s+/g, " ") : "";
  console.log("notice:", txt.slice(0, 260));
  ok(/данные другого аккаунта \(Dias Omarov\)/.test(txt) && /SAT Practice Test 2/.test(txt) && /на чужое имя: 1/.test(txt), "the cabinet points out Dias's Bluebook test and his result inside Aruzhan's copy");
  await teacher.click("[data-foreign]"); await teacher.waitForTimeout(1200);
  const ar = await copyOf("aruzhan"), d2 = await copyOf("dias");
  ok(!Object.entries(ar).some(([k, r]) => (k.startsWith("bb_share_") || k.startsWith("hw_last_Dias")) && r.v != null) && !(await teacher.$(".cb-foreign")), "«Удалить чужие данные» removes them from Aruzhan's copy");
  ok(d2[dk[0]] && d2[dk[0]].v, "Dias keeps his record");
  if (dev === "phone") ok((await teacher.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
