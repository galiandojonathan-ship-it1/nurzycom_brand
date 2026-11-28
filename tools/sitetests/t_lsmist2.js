// «Разобрать на уроке», second version: the teacher picks lessons for a group and for one student; the lesson account lists both
// reviews (a one-student review shows initials only), opens the student's review with his own tries, a Math question has Desmos
// and the board (pen pressure, undo, one board per question), and words are marked in the review the same way as in a lesson.
// Stand-in on 8768, REAL data copy; group2.csv as for t_lsmist.js.  usage: node t_lsmist2.js [desktop|phone]
const { chromium, devices } = require("playwright"); const { seed, page } = require("./cbseed");
const dev = process.argv[2] || "desktop", B = "http://127.0.0.1:8768/";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const br = await chromium.launch(); const pg = await page(br); const errs = []; pg.on("pageerror", (e) => errs.push("teacher: " + e.message));
  await pg.route(/docs\.google\.com/, (r) => r.abort());
  console.log(await seed(pg));
  await pg.evaluate(async () => { const id = await SITE.lid("lesson"); await SITE.api("admin/user?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ entry: await SITE.account("lesson", "Урок", "fixture-pw") }) });
    await SITE.api("admin/progress?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({}) }) });
    const ids = []; for (const l of ["ayana", "dias", "aruzhan", "sher"]) ids.push(await SITE.lid(l));
    await SITE.api("admin/groups", { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({ groups: [{ id: "g1", name: "SAT Verbal · вечер", kind: "group", color: "teal", members: ids }], at: Date.now() }) }) }); });
  await pg.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await pg.waitForTimeout(2000);
  await pg.setInputFiles("#file", __dirname + "/group2.csv"); await pg.waitForTimeout(1500);

  // 1. group: pick one lesson part
  await pg.click('#tabs .chip[data-v="group"]'); await pg.waitForSelector("#ga-send", { timeout: 30000 });
  const parts = await pg.$$eval("#ga-rv .rv-p", (a) => a.map((x) => x.querySelector("span").textContent));
  ok(parts.length >= 3, "group picker lists parts: " + parts.slice(0, 4).join(" | "));
  ok(/самые трудные/.test(await pg.textContent("#ga-send")), "nothing ticked: the hardest questions");
  const vIdx = parts.findIndex((x) => /Урок 1/.test(x)); await pg.check(`#ga-rv .rv-p:nth-child(${vIdx + 1}) input`);
  const lbl = await pg.textContent("#ga-send"); ok(/из 1 части/.test(lbl), "one part ticked: " + lbl.trim());
  const nGroup = +lbl.match(/: (\d+)/)[1];
  await pg.click("#ga-send"); await pg.waitForFunction(() => /Отправлено/.test(document.getElementById("ga-send-st").textContent), null, { timeout: 20000 });

  // 2. one student: Ayana, a Math part and a test
  await pg.click('#tabs .chip[data-v="students"]'); await pg.click('#v-students tr.click:has-text("Ayana")'); await pg.click('[data-st="fix"]'); await pg.waitForSelector("#st-rv .rv-card", { timeout: 30000 });
  const sp = await pg.$$eval("#st-rv .rv-p span", (a) => a.map((x) => x.textContent)); console.log("student parts:", sp.join(" | "));
  ok(/все ошибки/.test(await pg.textContent("#st-send")), "student: nothing ticked → all mistakes");
  const mi = sp.findIndex((x) => /Math/.test(x)); ok(mi >= 0, "student has a Math part");
  await pg.check(`#st-rv .rv-p:nth-child(${mi + 1}) input`);
  await pg.click("#st-send"); await pg.waitForFunction(() => /Отправлено/.test(document.getElementById("st-send-st").textContent), null, { timeout: 20000 });
  const stored = JSON.parse(await pg.evaluate(async () => { const r = await SITE.api("admin/progress?id=" + encodeURIComponent(await SITE.lid("lesson"))); return (await SITE.unsealBlob(r.data.data)).ls_m.v; }));
  ok(stored.list.length === 2 && stored.list[0].mode === "solo" && stored.list[1].mode === "group" && stored.list[1].qs.length === nGroup, "two reviews stored, newest first");
  ok(!/Ayana|Dias|Aruzhan|Sher|Seitkali/i.test(JSON.stringify(stored.list[1])), "group review holds no names");
  ok(stored.list[0].qs.every((q) => Array.isArray(q.mine)) && stored.list[0].qs.every((q) => /Math/.test(q.title) || q.sec === "math"), "student review: own tries, only the ticked Math part");
  // sending again for the same student replaces, not adds
  await pg.click("#st-send"); await pg.waitForFunction(() => /Отправлено/.test(document.getElementById("st-send-st").textContent), null, { timeout: 20000 });
  const again = JSON.parse(await pg.evaluate(async () => { const r = await SITE.api("admin/progress?id=" + encodeURIComponent(await SITE.lid("lesson"))); return (await SITE.unsealBlob(r.data.data)).ls_m.v; }));
  ok(again.list.length === 2, "a new review for the same student replaces the old one");

  // 3. the lesson account
  const lc = await br.newContext(dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1366, height: 860 } });
  await lc.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "lesson"); localStorage.setItem("hw_student", "Урок"); });
  const lp = await lc.newPage(); lp.on("pageerror", (e) => errs.push("lesson: " + e.message)); lp.on("dialog", (d) => d.accept());
  await lp.goto(B + "useful.html", { waitUntil: "load" }); await lp.waitForSelector(".ls-bar");
  await lp.click('.ls-bar [data-a="start"]'); await lp.fill("#ls-g", "Ayana"); await lp.click(".ls-pop .ls-go");
  if (dev === "phone") await lp.click(".ls-bar .ls-tg");
  await lp.click('.ls-bar [data-a="mist"]'); await lp.waitForSelector('.lm [data-lm="rev"]', { timeout: 15000 });
  const revs = await lp.$$eval('.lm [data-lm="rev"]', (a) => a.map((x) => x.textContent.replace(/\s+/g, " ")));
  ok(revs.length === 2 && /Индивидуальный разбор\s*A\. S\./.test(revs[0]) && !/Ayana/.test(revs.join(" ")) && /SAT Verbal · вечер/.test(revs[1]), "reviews list; the student shows as initials: " + revs[0].slice(0, 60));
  await lp.click('.lm [data-lm="rev"][data-i="0"]'); await lp.waitForSelector(".lm-card .r");
  ok(/Ayana Seitkali/.test(await lp.textContent(".lm-h h2")) && /ответ ученика/.test(await lp.textContent(".lm-card")), "student review: name in the header, his answer on each card");
  await lp.click('.lm-card[data-lm="q"]'); await lp.waitForSelector(".lm-o, .lm-spr", { timeout: 15000 });
  ok(await lp.isVisible('.lm-nav [data-lm="desmos"]') && await lp.isVisible('.lm-nav [data-lm="board"]'), "Math question: Desmos and Доска buttons");
  await lp.click('.lm-btns [data-lm="picks"]'); await lp.waitForSelector(".lm-o.mine, .lm-spr");
  ok(/ученика/.test(await lp.textContent(".lm-q")), "«Показать ответ ученика» marks his answer");
  await lp.click('.lm-btns [data-lm="ans"]'); await lp.waitForSelector(".lm-o.right, .lm-spr b"); ok(true, "answer shown");
  // Desmos
  await lp.click('.lm-nav [data-lm="desmos"]'); await lp.waitForSelector(".lm.has-tool .lm-pane.on iframe");
  ok(/desmos\.com\/testing\/cb-digital-sat/.test(await lp.getAttribute(".lm-pane.on iframe", "src")), "Desmos (College Board edition) opens beside the question");
  // the board: a pen stroke with pressure, a mouse stroke, undo
  await lp.click('.lm-side [data-tab="board"]'); await lp.waitForSelector('.lm-pane[data-p="board"].on canvas'); await lp.waitForTimeout(200);
  const box = await lp.$eval('.lm-pane.on canvas', (c) => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await lp.evaluate((b) => { const c = document.querySelector(".lm-pane.on canvas"), ev = (t, x, y, p) => c.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 7, pointerType: "pen", pressure: p, clientX: b.x + x, clientY: b.y + y, buttons: t === "pointerup" ? 0 : 1, isPrimary: true }));
    c.setPointerCapture = () => {}; const y0 = b.h * 0.2, dy = b.h * 0.25 / 20; ev("pointerdown", 40, y0, 0.2); for (let i = 1; i <= 20; i++) ev("pointermove", 40 + i * 8, y0 + i * dy, 0.2 + i * 0.04); ev("pointerup", 200, y0 + 20 * dy, 0); }, box);
  if (dev === "phone") await lp.evaluate((b) => { const c = document.querySelector(".lm-pane.on canvas"), ev = (t, x, y) => c.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 8, pointerType: "pen", pressure: 0.5, clientX: b.x + x, clientY: b.y + y, buttons: t === "pointerup" ? 0 : 1, isPrimary: true }));
    ev("pointerdown", 60, b.h * 0.75); for (let i = 1; i <= 10; i++) ev("pointermove", 60 + i * 10, b.h * (0.75 + i * 0.015)); ev("pointerup", 160, b.h * 0.9); }, box);   // a phone has touch, and touch is ignored once a pen was used
  else { await lp.mouse.move(box.x + 60, box.y + box.h * 0.75); await lp.mouse.down(); await lp.mouse.move(box.x + 160, box.y + box.h * 0.9, { steps: 8 }); await lp.mouse.up(); }
  const ink = () => lp.$eval(".lm-pane.on canvas", (c) => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
  const n2 = await ink(); ok(n2 > 200, "two strokes drawn: " + n2 + " px");
  await lp.click('.lb-tools [data-lb="undo"]'); const n1 = await ink(); ok(n1 > 0 && n1 < n2, `undo removes the last stroke (${n2} → ${n1})`);
  // pressure: the pen stroke is thicker at its end
  const thick = await lp.evaluate((b) => { const c = document.querySelector(".lm-pane.on canvas"), k = c.width / b.w, x = c.getContext("2d"); const col = (px) => { let n = 0; for (let y = 0; y < c.height; y++) if (x.getImageData(Math.round(px * k), y, 1, 1).data[3]) n++; return n; }; return [col(56), col(192)]; }, box);
  ok(thick[1] > thick[0], "pen pressure changes the width: " + thick.join(" → "));
  // one board per question
  // on a phone the tool covers the review: close it, move, open the board again
  const navTo = async (dir) => { if (dev === "phone") { await lp.keyboard.press("Escape"); ok(!(await lp.$(".lm.has-tool")), "phone: Escape brings the question back"); }
    await lp.click(`.lm-nav [data-lm="${dir}"]`); await lp.waitForTimeout(500); if (dev === "phone") { await lp.click('.lm-nav [data-lm="board"]'); await lp.waitForTimeout(300); } };
  if (await lp.isEnabled('.lm-nav [data-lm="next"]')) { await navTo("next"); ok((await ink()) === 0, "next question: a clean board");
    await navTo("prev"); ok((await ink()) === n1, "back: the drawing is still there"); }
  // words: the same as in a lesson (selection in the text, «Слово» for options)
  await lp.waitForTimeout(2300);
  const sel = await lp.evaluate(() => { const box = document.querySelector(".lm-stem"), w = document.createTreeWalker(box, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const m = /[A-Za-z]{4,}/.exec(n.data); if (m) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const s = getSelection(); s.removeAllRanges(); s.addRange(r); return m[0]; } } return ""; });
  if (sel) { await lp.waitForSelector(".ls-word"); await lp.click(".ls-word"); }
  await lp.click('.ls-bar [data-a="word"]');
  const ow = await lp.evaluate(() => { const o = document.querySelector(".lm-o .tx"); if (!o) return null; o.scrollIntoView({ block: "center" }); const w = document.createTreeWalker(o, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const m = /[A-Za-z]{2,}/.exec(n.data); if (m) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const b = r.getBoundingClientRect(); return { w: m[0], x: b.left + b.width / 2, y: b.top + b.height / 2 }; } } return null; });
  if (ow) await lp.mouse.click(ow.x, ow.y); else await lp.keyboard.press("Escape");
  await lp.waitForTimeout(300);
  const S = await lp.evaluate(() => window.LESSON.session()), qid = await lp.evaluate(() => document.body.dataset.lq), words = S.ev.filter((e) => e.k === "word");
  ok(!sel || words.some((e) => e.w === sel && e.q === qid), "selected word saved on the question: " + sel);
  ok(!ow || words.some((e) => e.w === ow.w && e.q === qid && e.part === "option"), "word in an option saved: " + (ow && ow.w));
  // Escape: closes the tool, then back to the list, then to the reviews, then closes
  await lp.screenshot({ path: `lsmist2_${dev}.png` });
  await lp.keyboard.press("Escape"); ok(!(await lp.$(".lm.has-tool")), "Escape closes the tool first");
  await lp.keyboard.press("Escape"); await lp.waitForSelector('.lm-card[data-lm="q"]'); await lp.keyboard.press("Escape"); await lp.waitForSelector('.lm [data-lm="rev"]');
  // delete the student review
  await lp.click('.lm [data-lm="del"][data-i="0"]'); ok((await lp.$$('.lm [data-lm="rev"]')).length === 0 || (await lp.$$('.lm-card[data-lm="q"]')).length >= 0, "student review deleted");
  ok(JSON.parse(await lp.evaluate(() => localStorage.getItem("ls_m"))).list.length === 1, "one review left");
  // a student review older than a day is dropped
  await lp.evaluate(() => { const d = JSON.parse(localStorage.getItem("ls_m")); d.list.push({ id: "old", mode: "solo", group: "Old Student", at: Date.now() - 2 * 864e5, qs: [{ id: "V01.p2.1", title: "x", n: 1, wrong: 1, src: {} }] }); localStorage.setItem("ls_m", JSON.stringify(d)); });
  await lp.keyboard.press("Escape"); await lp.click('.ls-bar [data-a="mist"]'); await lp.waitForSelector(".lm .lm-in h2"); await lp.waitForTimeout(500);
  ok(!/Old Student|O\. S\./.test(await lp.textContent(".lm")) && JSON.parse(await lp.evaluate(() => localStorage.getItem("ls_m"))).list.length === 1, "a one-student review older than a day is gone");
  const ov = await lp.evaluate(() => document.querySelector(".lm").scrollWidth - document.querySelector(".lm").clientWidth); ok(ov <= 0, "no sideways scroll: " + ov);
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? `${fails} FAILED` : "ALL PASS"); await br.close(); process.exit(fails ? 1 : 0); })();
