// Live practice, managing the room (2026-11-23, Nurassyl: «позволь мне удалять участников… быстро списком перемещаться по
// вопросам при нестрогом раунде»). A: a student joins from two devices, the host sees «два входа» and removes one; in a
// teacher-led round without the strict clock the host jumps to question 4 and the class follows. B: in a self-paced round the
// student goes straight to a question from the row of numbers, answered ones are filled.
// usage: node t_live_manage.js [desktop|phone]   (pages_dev.mjs on 8768 with a mkfx.mjs fixture)
const { chromium, devices } = require("playwright");
const B = "http://127.0.0.1:8768/", ADMIN = "local-admin-key-0123456789abcdef", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch(); const opt = dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1280, height: 900 } };
  const ctx = async (login, name, admin) => { const c = await br.newContext(opt);
    await c.addInitScript(([l, n, a]) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", l); localStorage.setItem("hw_student", n); if (a) localStorage.setItem("admin_key", a); }, [login, name, admin]);
    const p = await c.newPage(); p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e))); await p.route(/docs\.google\.com/, (r) => r.abort()); return p; };
  const msg = (p) => p.$eval(".live-practice [role=status]", (e) => e.textContent).catch(() => "");
  const host = await ctx("lesson", "Урок", ADMIN);
  await host.goto(B + "practice.html", { waitUntil: "load" }); await host.waitForTimeout(2500);
  await host.evaluate(async (k) => { await SITE.ready; await SITE.api("admin/claim", { method: "POST", body: JSON.stringify({ key: k }) }); }, ADMIN);
  const create = async (selfPaced) => {
    await host.goto(B + "practice.html", { waitUntil: "load" }); await host.waitForTimeout(2000);
    await host.click('[data-s="X01"]'); await host.locator("button", { hasText: "Живая практика" }).click();
    const dlg = host.locator("dialog.live-settings");
    const st = dlg.locator('input[name="strict"]'); if (await st.isChecked()) await st.uncheck();
    const sp = dlg.locator('input[name="selfPaced"]'); if ((await sp.isChecked()) !== selfPaced) await sp.setChecked(selfPaced);
    await dlg.getByRole("button", { name: "Создать раунд", exact: true }).click();
    await host.waitForURL(/live=/, { timeout: 8000 }); await host.waitForTimeout(2000);
    return host.locator(".live-practice a").first().getAttribute("href");
  };
  const join = async (link) => { const s = await ctx("loop-test", "Быстрый Тест"); await s.goto(link, { waitUntil: "load" }); await s.waitForTimeout(2500);
    await s.locator("button", { hasText: "Войти в раунд" }).click(); await s.waitForTimeout(1200); return s; };

  // A: teacher-led, no strict clock
  const link = await create(false);
  const s1 = await join(link), s2 = await join(link);
  await host.waitForTimeout(3500);
  const dup = await host.$$eval(".live-practice .live-dup", (x) => x.length);
  ok(dup === 2, "the same student from two devices is marked «два входа» (" + dup + ")");
  const del = host.locator(".live-practice .live-del").last();
  await del.click(); ok((await del.getAttribute("data-sure")) === "1" && /Точно удалить/.test(await del.getAttribute("aria-label")), "the first click asks «Удалить?»");
  await del.click(); await host.waitForTimeout(3500);
  const rows = await host.$$eval(".live-practice [data-results] tbody tr", (x) => x.length);
  ok(rows === 1 && !(await host.$(".live-practice .live-dup")), "the second click removes the extra device: one row left, no «два входа»");
  await host.locator("[data-launch]").click(); await s1.waitForTimeout(4500);
  ok(/Вопрос 1 из 10/.test(await msg(s1)), "the round started: " + await msg(s1));
  await host.waitForSelector(".live-practice [data-jump] button[data-q='4']", { timeout: 8000 });
  await host.click(".live-practice [data-jump] button[data-q='4']"); await s1.waitForTimeout(4000);
  ok(/Вопрос 4 из 10/.test(await msg(s1)), "a click on «4» in the host's row moves the class to question 4: " + await msg(s1));
  ok((await host.getAttribute(".live-practice [data-jump] button[data-q='4']", "aria-current")) === "true", "the host's row marks the current question");
  // B: self-paced
  const link2 = await create(true);
  const s3 = await join(link2); await host.locator("[data-launch]").click(); await s3.waitForTimeout(4500);
  await s3.waitForSelector(".live-qgrid button[data-q='5']", { timeout: 8000 });
  await s3.click(".live-qgrid button[data-q='5']"); await s3.waitForTimeout(500);
  ok(/Вопрос 5 из 10/.test(await msg(s3)), "self-paced: the student jumps to question 5 from the row of numbers: " + await msg(s3));
  await s3.locator(".live-practice [data-live-content] [data-live-submit]").nth(1).click(); await s3.waitForTimeout(2500);
  ok(await s3.$eval(".live-qgrid button[data-q='5']", (b) => b.classList.contains("done")), "an answered question is filled in the row");
  await host.waitForTimeout(3000);
  ok(await host.$(".live-practice [data-jump]:not([hidden]) button[data-q='5'] small"), "the host's row in a self-paced round shows how many answered each question");
  if (dev === "phone") ok((await s3.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  const errs = [...host.errs, ...s1.errs, ...s2.errs, ...s3.errs];
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
