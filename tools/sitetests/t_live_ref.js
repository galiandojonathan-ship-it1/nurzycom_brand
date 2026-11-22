// Live practice for Math: with «Desmos и справочник формул» on, a student sees both tools, as in Bluebook.
// usage: node t_live_ref.js [desktop|phone]   (pages_dev.mjs on 8768, fixture from mkfx.mjs: X01 and logins lesson / loop-test)
const { chromium, devices } = require("playwright");
const B = "http://127.0.0.1:8768/", ADMIN = "local-admin-key-0123456789abcdef", dev = process.argv[2] || "desktop";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch(); const opt = dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1280, height: 900 } };
  const ctx = async (login, name, admin) => { const c = await br.newContext(opt);
    await c.addInitScript(([l, n, a]) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", l); localStorage.setItem("hw_student", n); if (a) localStorage.setItem("admin_key", a); }, [login, name, admin]);
    const p = await c.newPage(); p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e))); await p.route(/docs\.google\.com|desmos\.com/, (r) => r.abort()); return p; };
  const host = await ctx("lesson", "Урок", ADMIN);
  await host.goto(B + "practice.html", { waitUntil: "load" }); await host.waitForTimeout(2500);
  await host.evaluate(async (k) => { await SITE.ready; await SITE.api("admin/claim", { method: "POST", body: JSON.stringify({ key: k }) }); }, ADMIN);
  await host.click('[data-s="X01"]'); await host.locator("button", { hasText: "Живая практика" }).click();
  const dlg = host.locator("dialog.live-settings");
  ok(await dlg.getByText("Desmos и справочник формул").count() === 1, "settings: «Desmos и справочник формул»");
  const calc = dlg.locator('input[name="calculator"]'); if (!(await calc.isChecked())) await calc.check();
  await dlg.getByRole("button", { name: "Создать раунд", exact: true }).click();
  await host.waitForURL(/live=/, { timeout: 8000 }); await host.waitForTimeout(2000);
  const link = await host.locator(".live-practice a").getAttribute("href");
  const s = await ctx("loop-test", "Тест Справочник");
  await s.goto(link, { waitUntil: "load" }); await s.waitForTimeout(2500); await s.locator("button", { hasText: "Войти в раунд" }).click(); await s.waitForTimeout(1200);
  ok(!(await s.locator(".live-practice .bb-t-ref").isVisible().catch(() => false)), "before the start: no tools");
  await host.locator("[data-launch]").click(); await s.waitForTimeout(4500);
  const desmos = s.locator(".live-practice .bb-t-calc"), ref = s.locator(".live-practice .bb-t-ref");
  ok(await desmos.isVisible() && /Desmos/.test(await desmos.textContent()), "student sees «Desmos»");
  ok(await ref.isVisible() && /Справочник/.test(await ref.textContent()), "student sees «Справочник»");
  await ref.click(); await s.waitForTimeout(300);
  const sheet = s.locator(".bb-ref");
  ok(await sheet.isVisible() && /A = πr²/.test(await sheet.textContent()) && /2π/.test(await sheet.textContent()), "the reference sheet opens with the SAT formulas");
  if (dev === "phone") { const box = await s.locator(".bb-ref-box").boundingBox(); ok(box && box.x >= -1 && box.x + box.width <= 391, "phone: the sheet fits the screen width"); }
  await s.screenshot({ path: `${__dirname}/live_ref_${dev}.png` });
  await s.keyboard.press("Escape"); await s.waitForTimeout(200);
  ok(!(await sheet.isVisible()), "Escape closes the sheet");
  await ref.click(); await s.locator(".bb-ref .bb-x").click(); await s.waitForTimeout(200);
  ok(!(await sheet.isVisible()), "× closes the sheet");
  ok(await s.locator(".live-practice [data-live-content] [data-live-submit]").count() === 4, "the question and its 4 options stay on screen");
  await host.locator("[data-close]").click(); await s.waitForTimeout(4000);
  ok(!(await ref.isVisible().catch(() => false)), "after the round ends the tools are hidden");
  ok(!s.errs.length && !host.errs.length, "no page errors " + JSON.stringify([...s.errs, ...host.errs]));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
