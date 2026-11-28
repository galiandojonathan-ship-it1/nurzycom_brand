// Failed send survives reload. A retry uses the same result once. Also checks automatic retry on «online».
const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }); const ctx = await br.newContext();
  let mode = "fail", hits = 0; const payloads = [];   // the form is first unreachable, then «reachable» (fulfilled locally, never sent to Google)
  await ctx.route(/docs\.google\.com/, (r) => { hits++; payloads.push(r.request().postData()); mode === "fail" ? r.abort() : r.fulfill({ status: 200, body: "" }); });
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); });
  const pg = await ctx.newPage(); pg.on("dialog", (d) => d.accept()); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(process.env.HW_URL || "http://127.0.0.1:8767/index.html?l=V02&p=p2", { waitUntil: "load" });
  await pg.waitForSelector(".tile");
  await pg.click("#go-paper"); await pg.waitForSelector("#s-answers:not(.hidden)");
  await pg.click("#submit"); await pg.waitForSelector("#s-result:not(.hidden)"); await pg.waitForTimeout(300);
  ok(await pg.isVisible("#resend"), "homework: failed send shows «Отправить ещё раз»");
  const score = await pg.textContent("#res-score");
  await pg.reload({ waitUntil: "load" });
  await pg.waitForSelector("#resend");
  ok(await pg.textContent("#res-score") === score && hits === 1, "homework: reload restores the result and does not send it automatically");
  mode = "ok"; await pg.click("#resend");
  await pg.waitForSelector("#resend", { state: "hidden" });
  await pg.waitForFunction(() => /Результат отправлен/.test(document.getElementById("send-status").textContent));
  ok(hits === 2 && payloads[0] === payloads[1], "homework: retry sends the original result once");
  await pg.reload({ waitUntil: "load" });
  await pg.waitForSelector("#s-result:not(.hidden)");
  ok(!(await pg.isVisible("#resend")) && hits === 2, "homework: a successful retry stays sent after reload");
  // automatic retry when the connection returns
  mode = "fail"; await pg.click("#again"); await pg.waitForSelector("#s-answers:not(.hidden)"); await pg.click("#submit"); await pg.waitForTimeout(400);
  const before = hits; mode = "ok"; await ctx.setOffline(true); await ctx.setOffline(false); await pg.waitForTimeout(800);
  ok(hits > before && /Результат отправлен/.test(await pg.textContent("#send-status")), "homework: automatic retry when back online");
  await ctx.setOffline(true); await ctx.setOffline(false); await pg.waitForTimeout(500);
  ok(hits === before + 1, `homework: no duplicate send after success (form requests: ${hits - before})`);
  ok(errs.length === 0, "no page errors " + errs.join("|"));
  await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
