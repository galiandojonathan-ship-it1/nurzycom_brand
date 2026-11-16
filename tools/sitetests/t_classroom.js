// «Подготовить урок» (teacher.html) + «Пульт урока» (classroom.html): the parts submitted since the last lesson with a group are
// ticked and sent; a second press finds nothing new; the lesson home page starts a lesson in one tap, lists the review, shows the
// lesson tiles with a presentation (built here with deckpack.mjs into the local copy only), the presentation opens full screen,
// moves with the keys, records the slides on the lesson timeline and takes drawings; the words card shows the deck «VL».
// Stand-in on 8768 with the REAL data copy; group2.csv as for t_lsmist.js.
// usage: node t_classroom.js <real copy dir> <key.b64> [desktop|phone]
const { chromium, devices } = require("playwright"); const { seed, page } = require("./cbseed"); const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");
const [REAL, KEY, dev = "desktop"] = process.argv.slice(2), B = "http://127.0.0.1:8768/", REPO = path.resolve(__dirname, process.env.REPO || "/home/user/nurzycom_brand");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  // a 3-slide presentation for V02 and two words in the deck VL, written into the local copy only
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "slides-"));
  for (let i = 1; i <= 3; i++) execFileSync("convert", ["-size", "1600x900", "xc:#F5F3EE", "-fill", "#0F0F0F", "-pointsize", "120", "-annotate", "+120+300", `Slide ${i}`, path.join(tmp, `s-${i}.jpg`)]);
  console.log(execFileSync("node", [path.join(REPO, "tools/private/deckpack.mjs"), KEY, "V02", "SAT Verbal · Урок 2 · Boundaries", tmp], { env: Object.assign({}, process.env, { DOCS: REAL }) }).toString().trim());
  const defs = path.join(tmp, "defs.json"); fs.writeFileSync(defs, JSON.stringify({ add: [{ w: "interspersing", en: "intersperse", pos: "v", ru: "перемежать, вкраплять", def: "to put things here and there among other things", ex: "The recipes and memoir passages interspersing them are elegant.", from: ["V07.p3.14"] }], skip: [{ w: "Bamboo", why: "test" }] }));
  console.log(execFileSync("node", [path.join(REPO, "tools/private/lessonwords.mjs"), "apply", KEY, defs], { env: Object.assign({}, process.env, { VOCAB: path.join(REAL, "data/vocab.bin") }) }).toString().trim());

  const br = await chromium.launch(); const pg = await page(br); const errs = []; pg.on("pageerror", (e) => errs.push("teacher: " + e.message));
  await pg.route(/docs\.google\.com/, (r) => r.abort());
  console.log(await seed(pg));
  const t7 = new Date(2026, 10, 6, 18).getTime();   // the last lesson with the group: 6 November (the fake class submits 5–7 November)
  await pg.evaluate(async (t7) => { const id = await SITE.lid("lesson"); await SITE.api("admin/user?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ entry: await SITE.account("lesson", "Урок", "fixture-pw") }) });
    const s = { v: 1, id: "old7", group: "SAT Verbal · вечер", lesson: "", t0: t7, t1: t7 + 3600e3, ev: [{ t: t7, p: "index", q: "V07.p3.14", ti: "SAT Verbal · Урок 7 · Практика", k: "at" }, { t: t7 + 6e4, p: "index", q: "V07.p3.14", k: "word", w: "interspersing", ctx: "The recipes and memoir passages interspersing them…", part: "passage" }, { t: t7 + 7e4, p: "index", q: "V07.p3.14", k: "word", w: "inarguable", ctx: "Yet despite its inarguable value…", part: "passage" }] };
    await SITE.api("admin/progress?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({ ls_s_old7: { v: JSON.stringify(s), t: t7 + 3600e3 } }) }) });
    const ids = []; for (const l of ["ayana", "dias", "aruzhan", "sher"]) ids.push(await SITE.lid(l));
    await SITE.api("admin/groups", { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({ groups: [{ id: "g1", name: "SAT Verbal · вечер", kind: "group", color: "teal", members: ids }], at: Date.now() }) }) }); }, t7);
  await pg.goto(B + "teacher.html", { waitUntil: "load" }); await pg.waitForTimeout(2000);
  await pg.setInputFiles("#file", __dirname + "/group2.csv"); await pg.waitForTimeout(1500);
  await pg.click('#tabs .chip[data-v="group"]'); await pg.waitForSelector("#ga-prep", { timeout: 30000 });

  // 1. «Подготовить урок»: parts since 7 November are ticked and sent, a private note appears
  await pg.click("#ga-prep"); await pg.waitForFunction(() => /Отправлено|новых ошибок нет/.test(document.getElementById("ga-send-st").textContent), null, { timeout: 30000 });
  const st = await pg.textContent("#ga-send-st"), note = (await pg.textContent("#ga-note")).replace(/\s+/g, " ");
  ok(/Отправлено/.test(st), "prepare: sent · " + st.trim());
  ok(/С прошлого урока \(6 ноября\)/.test(note) && /Только для вас/.test(note), "private note: since the last lesson · " + note.slice(0, 160));
  const ticked = await pg.$$eval("#ga-rv .rv-p input:checked", (a) => a.length), all = await pg.$$eval("#ga-rv .rv-p", (a) => a.length);
  ok(ticked > 0 && ticked < all, `only the newer parts are ticked (${ticked} of ${all})`);
  // 2. a second press: the review just sent is the new «last time», nothing newer
  await pg.click("#ga-prep"); await pg.waitForFunction(() => /новых ошибок нет/.test(document.getElementById("ga-send-st").textContent), null, { timeout: 30000 });
  ok(true, "second press: " + (await pg.textContent("#ga-send-st")).trim());

  // 3. the lesson home page
  const lc = await br.newContext(dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1366, height: 860 } });
  await lc.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "lesson"); localStorage.setItem("hw_student", "Урок"); });
  const lp = await lc.newPage(); lp.on("pageerror", (e) => errs.push("lesson: " + e.message)); lp.on("dialog", (d) => d.accept());
  await lp.goto(B + "classroom.html", { waitUntil: "load" }); await lp.waitForSelector("#cr-tiles .cr-tile", { timeout: 30000 });
  const chips = await lp.$$eval("#cr-now .cr-chip", (a) => a.map((x) => x.textContent.trim()));
  ok(chips.some((c) => /Начать: SAT Verbal · вечер/.test(c)), "hero: one tap to start with the group · " + chips.join(" | "));
  ok(/SAT Verbal · вечер/.test(await lp.textContent("#cr-rv")), "review card lists the prepared review");
  const words = (await lp.textContent("#cr-words")).replace(/\s+/g, " ");
  ok(/interspersing\s*— перемежать.*в словаре/.test(words) && /inarguable\s*ждёт разбора/.test(words) && /Слова с уроков» · 1 слово/.test(words), "words card: a defined word, a waiting word, the VL deck · " + words.slice(0, 160));
  ok(!(await lp.$(".ls-bar [data-a='home']")), "the bar has no «Пульт урока» button on the home page itself");
  await lp.click('#cr-now [data-start="SAT Verbal · вечер"]'); await lp.waitForSelector("#cr-now .live");
  ok(/Идёт урок · SAT Verbal · вечер/.test(await lp.textContent("#cr-now")), "lesson started from the hero");
  // tiles and the lesson panel
  const v2 = await lp.textContent('.cr-tile[data-l="V02"]'); ok(/презентация · 3 слайда/.test(v2), "tile V02: presentation ready · " + v2.replace(/\s+/g, " "));
  ok(/презентация скоро/.test(await lp.textContent('.cr-tile[data-l="V03"]')), "tile V03: presentation coming");
  await lp.click('.cr-tile[data-l="V02"]'); await lp.waitForSelector(".cr-panel");
  ok((await lp.$$(".cr-panel .cr-acts a")).length >= 5, "panel: workbook parts and words links");
  // the presentation
  await lp.click(".cr-panel [data-deck]"); await lp.waitForFunction(() => { const i = document.querySelector(".dk img"); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 15000 });
  ok((await lp.textContent("#dk-pos")).trim() === "1 / 3", "slide 1 of 3 shown");
  await lp.keyboard.press("ArrowRight"); await lp.waitForTimeout(400); ok((await lp.textContent("#dk-pos")).trim() === "2 / 3", "→ slide 2");
  await lp.keyboard.press("PageDown"); await lp.waitForTimeout(400); ok((await lp.textContent("#dk-pos")).trim() === "3 / 3", "PageDown (a clicker) → slide 3");
  await lp.keyboard.press("PageDown"); await lp.waitForTimeout(200); ok((await lp.textContent("#dk-pos")).trim() === "3 / 3", "stops at the last slide");
  await lp.waitForTimeout(2300);
  const S1 = await lp.evaluate(() => window.LESSON.session()), at = S1.ev.filter((e) => e.k === "at" && /^DECK\.V02\./.test(e.q));
  ok(at.length >= 2 && at.every((e) => /Презентация · SAT Verbal · Урок 2/.test(e.ti)), "slides recorded on the lesson timeline · " + at.map((e) => e.q).join(", "));
  await lp.click('.dk-bar [data-k="draw"]'); await lp.waitForTimeout(300);
  const box = await lp.$eval(".dk-draw canvas", (c) => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await lp.evaluate((b) => { const c = document.querySelector(".dk-draw canvas"), ev = (t, x, y) => c.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 9, pointerType: "pen", pressure: 0.6, clientX: b.x + x, clientY: b.y + y, buttons: t === "pointerup" ? 0 : 1 }));
    c.setPointerCapture = () => {}; ev("pointerdown", b.w * 0.2, b.h * 0.5); for (let i = 1; i <= 12; i++) ev("pointermove", b.w * (0.2 + i * 0.03), b.h * 0.5); ev("pointerup", b.w * 0.56, b.h * 0.5); }, box);
  const ink = await lp.$eval(".dk-draw canvas", (c) => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
  ok(ink > 100, "drawing over the slide: " + ink + " px");
  await lp.screenshot({ path: `classroom_deck_${dev}.png` });
  await lp.keyboard.press("Escape"); ok(!(await lp.$(".dk.drawing")), "Escape ends drawing first");
  await lp.keyboard.press("Escape"); ok(!(await lp.$(".dk")), "Escape closes the presentation");
  ok(!(await lp.evaluate(() => document.body.dataset.lq)), "closed: no slide left as the current question");
  // reopening goes back to the last slide
  await lp.click(".cr-panel [data-deck]"); await lp.waitForTimeout(800); ok((await lp.textContent("#dk-pos")).trim() === "3 / 3", "reopened at the last slide shown"); await lp.keyboard.press("Escape");
  // the review opens from the card, then the lesson ends from the hero
  await lp.click('#cr-rv [data-rv]'); await lp.waitForSelector(".lm .lm-card", { timeout: 15000 }); ok(/SAT Verbal · вечер/.test(await lp.textContent(".lm-h h2")), "review opens from the card");
  await lp.keyboard.press("Escape"); await lp.waitForTimeout(200);
  const ov = await lp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok(ov <= 0, "no sideways scroll: " + ov);
  await lp.screenshot({ path: `classroom_${dev}.png`, fullPage: true });
  await lp.click('#cr-now [data-end]'); await lp.click(".ls-pop .ls-go"); await lp.waitForSelector('#cr-now [data-ask]');
  ok(true, "lesson ended from the hero");
  // vocabulary page lists the new deck
  await lp.goto(B + "vocab.html?l=VL", { waitUntil: "load" }); await lp.waitForTimeout(1500);
  ok(/Слова с уроков|Verbal L/.test(await lp.textContent("main")) && await lp.$('.tile[data-l="VL"]'), "vocabulary page has the deck VL");
  // a student never sees the home page
  const sc = await br.newContext(); await sc.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); });
  const sp = await sc.newPage(); await sp.goto(B + "classroom.html", { waitUntil: "load" }); await sp.waitForTimeout(2500);
  ok(/для аккаунта урока/.test(await sp.textContent("#cr-body")), "a student login sees only a note");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(fails ? `${fails} FAILED` : "ALL PASS"); await br.close(); process.exit(fails ? 1 : 0);
})();
