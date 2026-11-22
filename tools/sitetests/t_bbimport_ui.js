// Bluebook import on «Пробные тесты», real browser copy and paste: an HTML page shaped like Score Details is selected with
// Ctrl+A, copied, and pasted into the site; the check starts by itself. Synthetic catalog and answers only.
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev.mjs <fx> 8768.   usage: node t_bbimport_ui.js [desktop|phone]
const { chromium, devices } = require("playwright"); const { synthetic, tableOf } = require("./bbsynth.cjs");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const cat = synthetic(), text = tableOf(cat, "SAT2", { rw: "m2h", math: "m2e" }, "tab", ["rw.1.9", "math.2.8", "math.2.22o"]);
// a Score Details-like page: header, a real <table>, footer — what a student selects with Ctrl+A
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const page = `<html><body><header><h1>My Practice</h1><p>Score Details · SAT Practice Test 2</p><p>Total Score 1350</p></header>
  <table><thead><tr><th>Question</th><th>Section</th><th>Correct Answer</th><th>Your Answer</th><th>Actions</th></tr></thead><tbody>
  ${text.split("\r\n").map((l) => `<tr>${l.split("\t").map((c, i) => `<td>${i === 4 ? `<button>${esc(c)}</button>` : esc(c)}</td>`).join("")}</tr>`).join("")}
  </tbody></table><footer><p>Need help?</p><p>© 2026 College Board</p></footer></body></html>`;
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext(dev === "phone" ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: B });
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); });
  const src = await ctx.newPage(); await src.route("http://127.0.0.1:8768/__scoredetails", (r) => r.fulfill({ contentType: "text/html", body: page }));
  await src.goto(B + "__scoredetails");
  const mod = process.platform === "darwin" ? "Meta" : "Control";
  await src.keyboard.press(`${mod}+A`); await src.keyboard.press(`${mod}+C`);
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(B + "mock.html", { waitUntil: "load" }); await p.waitForSelector("#bb-import:not([hidden])", { timeout: 15000 });
  await p.click("#bb-import summary"); await p.focus("#bb-text");
  const t0 = Date.now(); await p.keyboard.press(`${mod}+V`);
  await p.waitForFunction(() => /Прочитано/.test(document.getElementById("bb-status").textContent), null, { timeout: 8000 });
  await p.waitForFunction(() => /Practice Test/.test(document.getElementById("bb-result").textContent), null, { timeout: 8000 });
  const ms = Date.now() - t0, st = await p.textContent("#bb-status"), res = (await p.textContent("#bb-result")).replace(/\s+/g, " ");
  console.log("status:", st, "|", ms, "ms\nresult:", res.slice(0, 400));
  ok(/Прочитано 98 строк/.test(st), "a real Ctrl+A copy of a Score Details page is read: 98 rows, the check starts by itself after pasting");
  ok(/Reading and Writing · М1 26\/27 · М2 27\/27/.test(res) && /Math · М1 22\/22 · М2 20\/22/.test(res), "module totals are right");
  ok(/SAT Practice Test 2 · модуль 2 сложный/.test(res) && /SAT Practice Test 2 · модуль 2 лёгкий/.test(res), "test and route recognised per section (RW hard, Math easy)");
  ok(/М1, №9 · \w → \w · Skill \d/.test(res) && /М2, №8 · 999 → /.test(res) && /М2, №22 · пропуск → /.test(res), "each miss: module, number, choice → key, skill; the omitted one says «пропуск»");
  ok(ms < 3000, `from paste to preview in ${ms} ms`);
  // a lost row: the student sees what to do
  await p.fill("#bb-text", text.split("\r\n").filter((_, i) => i !== 30).join("\n")); await p.click("#bb-form button[type=submit]");
  ok(/Скопируйте таблицу/.test(await p.textContent("#bb-status")), "a lost row asks to copy again: " + (await p.textContent("#bb-status")).slice(0, 80));
  if (dev === "phone") ok((await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  await p.fill("#bb-text", text); await p.click("#bb-form button[type=submit]"); await p.waitForTimeout(400);
  await (await p.$("#bb-import")).screenshot({ path: `${__dirname}/bbimport_${dev}.png` });
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
