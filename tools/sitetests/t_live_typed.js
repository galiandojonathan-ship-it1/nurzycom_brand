// Live practice with typed (number) answers: what the student types must reach the teacher's table, graded.
// usage: node t_live_typed.js [desktop|phone]   (pages_dev.mjs on 8768, fixture from mkfx.mjs; logins lesson / loop-test)
const { chromium, devices } = require("playwright");
const B = "http://127.0.0.1:8768/", ADMIN = "local-admin-key-0123456789abcdef", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const ITEMS = [
  { t: "mc", stim: "", stem: "<p>Which is 2 + 2?</p>", opts: ["3", "4", "5", "6"], ans: "B" },
  { t: "spr", stim: "", stem: "<p>Type 655.</p>", ans: "655" },
  { t: "spr", stim: "", stem: "<p>Type three halves.</p>", acc: ["3/2", "1.5"], ans: "3/2" },
  { t: "spr", stim: "", stem: "<p>Solve x + 1 = 5.</p>", ans: "x = 4" },
  { t: "spr", stim: "", stem: "<p>Type 2√3.</p>", ans: "2√3" },
  { t: "spr", stim: "", stem: "<p>Type twelve as a number.</p>", ans: "12" },
];
(async () => {
  const br = await chromium.launch(); const opt = dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1280, height: 900 } };
  const ctx = async (login, name, admin) => { const c = await br.newContext(opt);
    await c.addInitScript(([l, n, a]) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", l); localStorage.setItem("hw_student", n); if (a) localStorage.setItem("admin_key", a); }, [login, name, admin]);
    const p = await c.newPage(); p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e))); await p.route(/docs\.google\.com|desmos\.com/, (r) => r.abort()); return p; };
  const host = await ctx("lesson", "Урок", ADMIN);
  await host.goto(B + "practice.html", { waitUntil: "load" }); await host.waitForTimeout(2500);
  await host.evaluate(async ([k, items]) => { await SITE.ready; await SITE.api("admin/claim", { method: "POST", body: JSON.stringify({ key: k }) });
    const qs = LiveRound.workbook(items);
    LiveRound.create({ title: "Typed test", questions: qs }, { seconds: 45, strict: false, selfPaced: true, calculator: true }, qs).catch((e) => (window.__err = e.message)); }, [ADMIN, ITEMS]);
  await host.waitForURL(/live=/, { timeout: 8000 }).catch(async () => console.log("create error:", await host.evaluate(() => window.__err)));
  await host.waitForTimeout(2000);
  const link = await host.locator(".live-practice a").getAttribute("href");
  const s = await ctx("loop-test", "Бексултан Ж");
  s.on("response", async (r) => { if (/action=answer/.test(r.url())) console.log("  answer →", r.status(), (await r.text().catch(() => "")).slice(0, 120)); });
  await s.goto(link, { waitUntil: "load" }); await s.waitForTimeout(2500); await s.locator("button", { hasText: "Войти в раунд" }).click(); await s.waitForTimeout(1200);
  await host.locator("[data-launch]").click(); await s.waitForTimeout(4500);
  const content = ".live-practice [data-live-content]";
  const next = () => s.locator(".live-review-nav button", { hasText: "Далее" }).click();
  await s.locator(`${content} [data-live-submit]`).nth(1).click(); await s.waitForTimeout(800);   // Q1: B
  const typed = ["x = 655", "1.5", "4", "2√3", "двенадцать"];
  for (let i = 0; i < typed.length; i++) {
    await next(); await s.waitForTimeout(400);
    const input = s.locator(`${content} input[type=text]`);
    ok(await input.isVisible(), `Q${i + 2}: the student sees a field for the answer`);
    await input.fill(typed[i]); await s.locator(`${content} button`, { hasText: "Отправить ответ" }).click(); await s.waitForTimeout(900);
    console.log(`  Q${i + 2} receipt:`, (await s.locator(`${content} .live-receipt`).textContent().catch(() => "")).trim());
  }
  await host.waitForTimeout(3000);
  const row = await host.$$eval(".live-practice table tbody tr", (rows) => rows.map((r) => [...r.cells].map((c) => c.textContent.trim())));
  console.log("teacher table:", JSON.stringify(row));
  const cells = (row[0] || []).slice(1, 7);
  ok(cells[0] === "B ✓", "Q1 multiple choice: B ✓");
  ok(cells[1] === "x = 655 ✓" && cells[2] === "1.5 ✓" && cells[3] === "4 ✓" && cells[4] === "2√3 ✓", "typed answers are shown to the teacher with ✓ («x = 655» counts as 655)");
  ok(cells[5] === "двенадцать ✗", "a typed answer that is not a number is kept and shown with ✗");
  ok((row[0] || [])[7] === "5", "«Верно» counts 5");
  ok(!s.errs.length && !host.errs.length, "no page errors " + JSON.stringify([...s.errs, ...host.errs]));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
