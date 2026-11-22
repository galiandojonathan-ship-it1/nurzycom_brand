// Gemini tests on the lesson: «Пульт урока» → «Тесты преподавателя» lists the cabinet's tests (Gemini first) with
// «Решать вместе» and «Живая практика»; the lesson account's mytest.html list shows every test; ?live=1 opens the round settings.
// usage: node t_lesson_ct.js [desktop|phone]   (pages_dev.mjs on 8768, fixture from mkfx.mjs; logins lesson / loop-test)
const { chromium, devices } = require("playwright");
const B = "http://127.0.0.1:8768/", ADMIN = "local-admin-key-0123456789abcdef", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch(); const opt = dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1280, height: 900 } };
  const ctx = async (login, name, admin) => { const c = await br.newContext(opt);
    await c.addInitScript(([l, n, a]) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", l); localStorage.setItem("hw_student", n); if (a) localStorage.setItem("admin_key", a); }, [login, name, admin]);
    const p = await c.newPage(); p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e))); await p.route(/docs\.google\.com|desmos\.com/, (r) => r.abort()); return p; };
  // the teacher's bank: one ordinary test (newer) and one Gemini test (older), saved sealed like cted.js does
  const host = await ctx("lesson", "Урок", ADMIN);
  await host.goto(B + "mytest.html", { waitUntil: "load" }); await host.waitForTimeout(2500);
  await host.evaluate(async (k) => { await SITE.ready; await SITE.api("admin/claim", { method: "POST", body: JSON.stringify({ key: k }) });
    const q = (a) => Object.assign(CTL.newQ("mc"), { stem: "Synthetic question?", o: ["One", "Two", "Three", "Four"], a, skill: "Transitions", level: "M" });
    const g = Object.assign(CTL.newTest(), { title: "Работа над ошибками · Ayana Seitkali · 22 ноября", src: "gemini", at: Date.now() - 864e5, q: [q("B"), q("C")] });
    const own = Object.assign(CTL.newTest(), { title: "Transitions · проверка", at: Date.now(), q: [q("A")] });
    await SITE.api("admin/custom", { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({ tests: [own, g], at: Date.now() }) }) }); }, ADMIN);
  await host.goto(B + "classroom.html", { waitUntil: "load" }); await host.waitForSelector("#cr-ct-list .cr-item", { timeout: 15000 });
  const items = await host.$$eval("#cr-ct-list .cr-item", (a) => a.map((x) => x.textContent.replace(/\s+/g, " ").trim()));
  console.log("console list:", items.join(" | ").slice(0, 300));
  ok(items.length === 2 && /Gemini · на ошибки/.test(items[0]) && /Работа над ошибками/.test(items[0]), "«Тесты преподавателя»: the Gemini test comes first, labelled");
  ok(/Решать вместе/.test(items[0]) && /Живая практика/.test(items[0]), "each test has «Решать вместе» and «Живая практика»");
  const chip = await host.$eval("#cr-ct-list .cr-chip:not(.main)", (a) => { const s = getComputedStyle(a); return [s.color, s.backgroundColor]; });
  ok(chip[0] !== "rgb(245, 243, 238)", "the buttons are readable on the light card (" + chip.join(" / ") + ")");
  if (dev === "phone") ok((await host.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  await host.screenshot({ path: `${__dirname}/lesson_ct_${dev}.png`, fullPage: false, clip: undefined });
  // «Решать вместе» → the test on screen
  await host.click("#cr-ct-list li:first-child a.cr-chip:not(.main)"); await host.waitForURL(/mytest\.html\?t=/); await host.waitForSelector("#p-start:not(.hidden)", { timeout: 10000 });
  ok(/Работа над ошибками/.test(await host.textContent("#s-title")), "«Решать вместе» opens the Gemini test's start screen");
  await host.click("#go"); await host.waitForSelector("#p-test:not(.hidden)", { timeout: 8000 });
  ok(/Synthetic question/.test(await host.textContent("#p-test")), "the class can solve it on the shared screen");
  // the lesson account's list shows every test
  await host.goto(B + "mytest.html", { waitUntil: "load" }); await host.waitForSelector("#sets .set", { timeout: 10000 });
  const list = await host.$$eval("#sets .set", (a) => a.map((x) => x.textContent.replace(/\s+/g, " ")));
  ok(list.length === 2 && /Для урока · Gemini/.test(list[0]), "mytest.html on the lesson account lists every test, Gemini first");
  // «Живая практика» → the round settings open at once, and the round starts
  await host.goto(B + "classroom.html", { waitUntil: "load" }); await host.waitForSelector("#cr-ct-list .cr-item", { timeout: 15000 });
  await host.click("#cr-ct-list li:first-child a.cr-chip.main"); await host.waitForSelector("dialog.live-settings[open]", { timeout: 10000 });
  ok(true, "«Живая практика» opens the live-round settings at once");
  await host.locator("dialog.live-settings").getByRole("button", { name: "Создать раунд", exact: true }).click();
  await host.waitForURL(/practice\.html\?live=/, { timeout: 10000 }); await host.waitForTimeout(1500);
  ok(/live=[a-f0-9]{32}/.test(host.url()), "a live round is created from the Gemini test");
  // a student does not see the Gemini test in their list (it is not open and not assigned)
  const s = await ctx("loop-test", "Тест Ученик");
  await s.goto(B + "mytest.html", { waitUntil: "load" }); await s.waitForTimeout(3000);
  ok(!/Работа над ошибками/.test(await s.textContent("#p-list")), "students do not see the Gemini test unless it is assigned");
  ok(!host.errs.length && !s.errs.length, "no page errors " + JSON.stringify([...host.errs, ...s.errs]));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
