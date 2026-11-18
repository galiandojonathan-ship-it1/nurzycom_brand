// «Живая практика» (livepractice.js + functions/api/live.js): a full round on the local stand-in (pages_dev.mjs on 8768, D1 in memory).
// The lesson account creates a round from a hard set, two students join by the link and answer, a third is refused after the start,
// the host sees the scoreboard and, after closing, the keys. Also: the lesson bar's 45 s timer, and no round button for a student.
// usage: node t_live.js [desktop|phone]   (needs mkreal.mjs copy served by pages_dev.mjs; logins lesson and loop-test, password fixture-pw)
const { chromium, devices } = require("playwright");
const B = "http://127.0.0.1:8768/", ADMIN = "local-admin-key-0123456789abcdef";
const dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch();
  const opt = dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1366, height: 900 } };
  const ctx = async (login, name, admin) => {
    const c = await br.newContext(opt);
    await c.addInitScript(([l, n, a]) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", l); localStorage.setItem("hw_student", n); if (a) localStorage.setItem("admin_key", a); }, [login, name, admin]);
    const p = await c.newPage(); p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e))); await p.route(/docs\.google\.com/, (r) => r.abort()); return p;
  };
  const vis = (p, sel) => p.$eval(sel, (e) => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length) && getComputedStyle(e).display !== "none").catch(() => false);
  const msg = (p) => p.$eval(".live-practice [role=status]", (e) => e.textContent).catch(() => "");

  // setup check: the four tables exist
  const health = await (await fetch(B + "api/live?action=health")).json();
  ok(health.ok === true && health.missing.length === 0, "api/live health: all tables present " + JSON.stringify(health));

  // host: the lesson account (admin key in this browser, as on Nurassyl's computer)
  const host = await ctx("lesson", "Урок", ADMIN);
  await host.goto(B + "practice.html", { waitUntil: "load" }); await host.waitForTimeout(2500);
  await host.evaluate(async (k) => { await SITE.ready; await SITE.api("admin/claim", { method: "POST", body: JSON.stringify({ key: k }) }); }, ADMIN);
  const createBtn = host.locator("button", { hasText: "Живая практика" });
  ok(await createBtn.count() === 1, "lesson account sees «Живая практика · 10 × 45 с»");
  await createBtn.click(); await host.waitForTimeout(600);
  ok(/Выберите набор/.test(await host.locator("#p-start").innerText()), "without a set: asks to choose one");
  await host.click('[data-s="X01"]'); await createBtn.click();
  await host.locator("dialog.live-settings").getByRole("button", { name: "Создать раунд", exact: true }).click();
  await host.waitForURL(/live=/, { timeout: 8000 }); await host.waitForTimeout(2500);
  const link = await host.locator(".live-practice a").getAttribute("href");
  ok(/practice\.html\?live=[a-f0-9]{32}$/.test(link), "round created, link " + link);
  ok(await vis(host, "[data-launch]") && await vis(host, "[data-close]"), "host sees «Начать раунд» and «Завершить раунд»");
  ok(/В комнате: 0/.test(await msg(host)), "room empty: " + await msg(host));

  // two students join
  const s1 = await ctx("loop-test", "Аяна Тест"), s2 = await ctx("loop-test", "Диас Тест");
  for (const s of [s1, s2]) { await s.goto(link, { waitUntil: "load" }); await s.waitForTimeout(2500); await s.locator("button", { hasText: "Войти в раунд" }).click(); await s.waitForTimeout(1200); }
  ok(/Ждём начала/.test(await msg(s1)) && /Ждём начала/.test(await msg(s2)), "students wait for the start");
  ok(!(await vis(s1, "#p-start")), "student does not see the normal start screen");
  await host.waitForTimeout(1800);
  ok(/В комнате: 2/.test(await msg(host)), "host sees 2 in the room: " + await msg(host));

  // start
  await host.locator("[data-launch]").click(); await host.waitForTimeout(800);
  ok(!(await vis(host, "[data-launch]")), "«Начать раунд» disappears after the start");
  ok(!/\$\{HOME\}/.test(await host.locator(".ls-bar").innerText()), "lesson bar shows no «${HOME}» placeholder");
  await s1.waitForTimeout(4500);
  const q1 = await s1.locator(".live-practice [data-live-content] .btn").count();
  ok(q1 === 4, "student 1 sees question 1 with 4 options (" + q1 + ")");
  ok(/Вопрос 1 из 10/.test(await msg(s1)), "student timer: " + await msg(s1));
  await s1.screenshot({ path: `live_student_${dev}.png`, fullPage: false });
  await s1.locator(".live-practice [data-live-content] .btn").nth(0).click(); await s1.waitForTimeout(1200);
  await s2.locator(".live-practice [data-live-content] .btn").nth(1).click(); await s2.waitForTimeout(1200);
  ok(/Ответ принят: A/.test(await s1.locator(".live-practice").innerText()), "student 1: «Ответ принят: A»");

  // late join is refused
  const s3 = await ctx("loop-test", "Поздний Тест");
  await s3.goto(link, { waitUntil: "load" }); await s3.waitForTimeout(2500); await s3.locator("button", { hasText: "Войти в раунд" }).click(); await s3.waitForTimeout(1200);
  ok(/Вход в раунд закрыт/.test(await msg(s3)), "late join refused: " + await msg(s3));

  // host scoreboard
  await host.waitForTimeout(2000);
  const rows = await host.$$eval(".live-practice table tbody tr", (rs) => rs.map((r) => [...r.cells].map((c) => c.textContent)));
  ok(rows.length === 2, "scoreboard has 2 students");
  ok(rows.some((r) => r[0] === "Аяна Тест" && /^A [✓✗]$/.test(r[1])) && rows.some((r) => r[0] === "Диас Тест" && /^B [✓✗]$/.test(r[1])), "scoreboard shows each answer with ✓/✗: " + JSON.stringify(rows.map((r) => r.slice(0, 2))));
  const right = rows.filter((r) => /✓/.test(r[1])).length; ok(right <= 1, "at most one of A/B is right (" + right + ")");
  ok(rows.every((r) => r[11] === (/✓/.test(r[1]) ? "1" : "0")), "«Верно» column counts the right answers");
  await host.screenshot({ path: `live_host_${dev}.png`, fullPage: true });

  // close: keys for the host, students see the end
  await host.locator("[data-close]").click(); await host.waitForTimeout(2500);
  ok(/Раунд завершён/.test(await msg(host)), "host: round finished");
  ok(!(await vis(host, "[data-close]")), "«Завершить раунд» disappears after the end");
  const keys = await host.$$eval("[data-review] details p", (ps) => ps.map((p) => p.textContent));   // closed <details> have no innerText
  ok(keys.filter((t) => /^Правильный ответ: [A-D]$/.test(t)).length === 10, "review shows 10 keys");
  const k1 = (keys.find((t) => /^Правильный ответ/.test(t)) || "").slice(-1);
  ok(rows.every((r) => (r[1][0] === k1) === /✓/.test(r[1])), "✓ matches the key of question 1 (" + k1 + ")");
  await s1.waitForTimeout(2500); ok(/Раунд завершён/.test(await msg(s1)), "student: round finished");

  // a student account has no round button on the plain page
  const s4 = await ctx("loop-test", "Аяна Тест");
  await s4.goto(B + "practice.html", { waitUntil: "load" }); await s4.waitForTimeout(2500);
  ok(await s4.locator("button", { hasText: "Живая практика" }).count() === 0, "student account: no «Живая практика» button");

  // the lesson bar's timer (lesson.js) on a normal question
  const t = await ctx("lesson", "Урок", ADMIN);
  await t.goto(B + "practice.html", { waitUntil: "load" }); await t.waitForTimeout(2500);
  await t.click('[data-s="X01"]'); await t.fill("#student", "Урок"); await t.click("#go"); await t.waitForTimeout(1500);
  const tb = t.locator('.ls-bar [data-a="timer"]');
  ok(await tb.count() === 1 && await tb.isVisible(), "lesson bar shows the timer on a question");
  ok(/Таймер · 45 с/.test(await tb.innerText()), "timer off: " + await tb.innerText());
  await tb.click(); await t.waitForTimeout(1300);
  ok(/^4[34] с · Стоп$/.test(await tb.innerText()), "timer runs: " + await tb.innerText());
  await tb.click(); await t.waitForTimeout(300);
  ok(/Таймер · 45 с/.test(await tb.innerText()), "timer stops");

  for (const p of [host, s1, s2, s3, s4, t]) ok(!p.errs.length, "no page errors " + p.errs.join(" | "));
  await br.close();
  console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})();
