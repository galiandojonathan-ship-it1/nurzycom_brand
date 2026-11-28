// «Свой темп»: fast answers while an earlier save is still in flight must all reach the server.
// A: answer Q1 (slow, 2 s), go on, answer Q2 at once (fast).  B: on Q3 pick A (slow) then change to C at once.
// C: Q4 answered while Q1's refresh comes back late. Then a reload shows what the server really kept.
// usage: node t_live_fast.js [desktop|phone]   (pages_dev.mjs on 8768, fixture with X01 and logins lesson / loop-test)
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
  await host.click('[data-s="X01"]'); await host.locator("button", { hasText: "Живая практика" }).click();
  const dlg = host.locator("dialog.live-settings");
  const sp = dlg.locator('input[name="selfPaced"]'); if (!(await sp.isChecked())) await sp.check();
  const st = dlg.locator('input[name="strict"]'); if (await st.isChecked()) await st.uncheck();
  await dlg.getByRole("button", { name: "Создать раунд", exact: true }).click();
  await host.waitForURL(/live=/, { timeout: 8000 }); await host.waitForTimeout(2000);
  const link = await host.locator(".live-practice a").getAttribute("href");
  const s = await ctx("loop-test", "Быстрый Тест");
  await s.goto(link, { waitUntil: "load" }); await s.waitForTimeout(2500); await s.locator("button", { hasText: "Войти в раунд" }).click(); await s.waitForTimeout(1200);
  await host.locator("[data-launch]").click(); await s.waitForTimeout(4500);
  ok(/Вопрос 1 из 10/.test(await msg(s)) && /Отвечено 0/.test(await msg(s)), "self-paced round started: " + await msg(s));
  // network: answers to Q1 and the first try on Q3 take 2 s; state polls right after Q1 are slow too (stale refresh)
  let slowState = false, sent = [];
  await s.route(/\/api\/live\?/, async (r) => { const u = r.request().url(), body = r.request().postData() || "";
    let n = 0; try { n = JSON.parse(body).number; } catch { /* GET */ }
    if (/action=answer/.test(u)) { const a = JSON.parse(body).answer; sent.push(n + ":" + a + "@" + (Date.now() % 100000)); if (n === 1 || (n === 3 && a === "A")) await new Promise((x) => setTimeout(x, 2000)); }
    else if (slowState) await new Promise((x) => setTimeout(x, 1500));
    r.continue(); });
  const opt_ = (k) => s.locator(".live-practice [data-live-content] [data-live-submit]").nth(k);
  const next = () => s.locator(".live-review-nav button", { hasText: "Далее" }).click();
  // A
  await opt_(1).click(); slowState = true; await next(); await s.waitForTimeout(100); await opt_(3).click();
  await s.waitForTimeout(300); console.log("while saving:", await msg(s));
  // B: Q3 pick A then change to C within the slow save
  // force: during a save the options carry aria-disabled, which makes Playwright wait; a real tap is not held back
  await next(); await s.waitForTimeout(100); await opt_(0).click(); await s.waitForTimeout(150); await opt_(2).click({ force: true });
  // C: Q4 right away
  await next(); await s.waitForTimeout(100); await opt_(1).click();
  slowState = false; await s.waitForTimeout(5000);
  console.log("sent:", sent.join(" "), "| status:", await msg(s));
  ok(sent.some((x) => x.startsWith("2:D")), "Q2 was sent while Q1 was still saving");
  ok(sent.some((x) => x.startsWith("4:B")), "Q4 was sent");
  ok(sent.some((x) => x.startsWith("3:C")), "Q3: the changed choice C was sent (not dropped while A was saving)");
  // what the server kept: reload the student page
  await s.unroute(/\/api\/live\?/); await s.reload({ waitUntil: "load" }); await s.waitForTimeout(4000);
  const kept = {};
  for (let q = 1; q <= 4; q++) { await s.selectOption(".live-review-nav select", String(q)); await s.waitForTimeout(250);
    kept[q] = await s.$eval(".live-practice [data-live-content]", (c) => (c.querySelector('[aria-pressed="true"]') || {}).dataset?.liveChoice || ((c.querySelector(".live-receipt") || {}).textContent || "").replace("Ответ принят: ", "")).catch(() => ""); }
  console.log("server after reload:", JSON.stringify(kept), "|", await msg(s));
  ok(kept[1] === "B" && kept[2] === "D" && kept[4] === "B", "after reload Q1=B, Q2=D, Q4=B are kept");
  ok(kept[3] === "C", "after reload Q3 is the last choice C");
  ok(/Отвечено 4 из 10/.test(await msg(s)), "progress counts 4 answers");
  ok(!s.errs.length && !host.errs.length, "no page errors " + JSON.stringify([...s.errs, ...host.errs]));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
