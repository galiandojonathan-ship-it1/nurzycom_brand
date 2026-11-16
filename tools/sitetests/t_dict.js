// Dictionary on selection (docs/dict.js): a student selects a word in a homework passage → the dictionary card (Wiktionary) with
// Russian; a course word keeps its «Словарь курса» card; inflected and irregular forms find their base word; only the small
// parts needed are downloaded; on the lesson account, marking a word with «Слово» also shows its meaning.
// Stand-in on 8768 with the REAL data copy.  usage: node t_dict.js [desktop|phone]
const { chromium, devices } = require("playwright");
const dev = process.argv[2] || "desktop", B = "http://127.0.0.1:8768/";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch(); const ctx = await br.newContext(dev === "phone" ? devices["iPhone 13"] : { viewport: { width: 1280, height: 860 } });
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); });
  const pg = await ctx.newPage(); const errs = [], got = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("dialog", (d) => d.dismiss());
  pg.on("request", (r) => { if (/\/q\/dict\//.test(r.url())) got.push(r.url().split("/").pop()); });
  await pg.goto(B + "index.html?l=V02&p=p2", { waitUntil: "load" }); await pg.waitForSelector(".tile");
  if (await pg.isVisible("#student") && !(await pg.inputValue("#student"))) await pg.fill("#student", "Loop Test");
  await pg.click('.pick[data-p="p2"]'); await pg.click("#go"); await pg.waitForSelector("#s-solve:not(.hidden)"); await pg.waitForTimeout(1200);
  // select words inside the page text, the way a student does with the mouse or a finger
  const pickText = (word) => pg.evaluate((word) => { const host = document.querySelector("#sv-passage") || document.body;
    const p = document.createElement("p"); p.className = "qhtml"; p.id = "dict-probe"; p.textContent = `Probe: ${word} here.`; host.appendChild(p);
    const n = p.firstChild, i = n.data.indexOf(word), r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + word.length); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }, word);
  const card = async () => { await pg.waitForFunction(() => { const c = document.querySelector(".dpop"); return c && !c.classList.contains("hidden") && !/Загружаю/.test(c.textContent); }, null, { timeout: 15000 }); return (await pg.textContent(".dpop")).replace(/\s+/g, " "); };
  const clean = () => pg.evaluate(() => { getSelection().removeAllRanges(); const p = document.getElementById("dict-probe"); if (p) p.remove(); });
  for (const [w, re, what] of [["serendipity", /Wiktionary.*serendipity/i, "an ordinary rare word"], ["interspersing", /Словарь курса.*intersperse/i, "a lesson word keeps its course card"],
    ["undermined", /Словарь курса.*undermine/i, "a course word keeps its course card"], ["lighthouse", /Wiktionary.*lighthouse.*маяк/i, "dictionary with Russian equivalents"],
    ["mice", /Wiktionary.*mice.*plural of mouse/i, "a form names its base word"], ["studies", /Wiktionary.*study/i, "a regular ending finds its base word"], ["thou", /thou.*местоим.*(ye|you)/i, "an archaic pronoun comes first"],
    ["qwzx", /нет в словаре/, "an unknown word says so"]]) {
    await pickText(w); const t = await card(); ok(re.test(t), `${what}: «${w}» → ${t.slice(0, 110)}`); await pg.keyboard.press("Escape"); await clean(); await pg.waitForTimeout(350);
  }
  ok(!/́/.test(await pg.evaluate(() => document.body.textContent)), "no stress marks in Russian");
  const uniq = [...new Set(got)]; ok(uniq.length >= 3 && uniq.length <= 12, `only the parts needed were downloaded (${uniq.length}): ${uniq.join(", ")}`);
  ok(!(await pg.$(".dpop:not(.hidden)")), "Escape hides the card");
  await pg.screenshot({ path: `dict_${dev}.png` });
  // a selection in the menu or a field shows nothing
  await pg.evaluate(() => { const a = document.querySelector("nav a"); const r = document.createRange(); r.selectNodeContents(a); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  await pg.waitForTimeout(700); ok(!(await pg.$(".dpop:not(.hidden)")), "a selection in the menu shows no card");
  // the lesson account: «Слово» + a click on a word saves it and shows its meaning
  const lc = await br.newContext({ viewport: { width: 1280, height: 860 } });
  await lc.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "lesson"); localStorage.setItem("hw_student", "Урок"); });
  const lp = await lc.newPage(); lp.on("pageerror", (e) => errs.push("lesson: " + e.message)); lp.on("dialog", (d) => d.accept());
  await lp.goto(B + "mock.html", { waitUntil: "load" }); await lp.waitForSelector(".ls-bar");
  await lp.click('.ls-bar [data-a="start"]'); await lp.fill("#ls-g", "Проверка словаря"); await lp.click(".ls-pop .ls-go");
  await lp.click('.mcard[data-m="PT5"]'); await lp.click("#go"); await lp.waitForSelector("#m-dir:not(.hidden)"); await lp.click("#m-dir .btn"); await lp.waitForSelector("#m-test:not(.hidden)"); await lp.waitForTimeout(1500);
  await lp.click('.ls-bar [data-a="word"]');
  const o = await lp.evaluate(() => { const t = document.querySelector("#opts .opt:nth-child(2) .tx"); const w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const m = /[A-Za-z]{4,}/.exec(n.data); if (m) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const b = r.getBoundingClientRect(); return { w: m[0], x: b.left + b.width / 2, y: b.top + b.height / 2 }; } } });
  await lp.mouse.click(o.x, o.y);
  await lp.waitForFunction(() => { const c = document.querySelector(".dpop"); return c && !c.classList.contains("hidden") && !/Загружаю/.test(c.textContent); }, null, { timeout: 15000 });
  ok(new RegExp(o.w, "i").test(await lp.textContent(".dpop")) && /Слово сохранено/.test(await lp.textContent(".ls-toast")), `lesson: «${o.w}» saved and its meaning shown`);
  ok(!(await lp.$("#opts .opt.on")), "the option was not chosen");
  await lp.click('.ls-bar [data-a="end"]'); await lp.click(".ls-pop .ls-go");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? `${fails} FAILED` : "ALL PASS"); await br.close(); process.exit(fails ? 1 : 0);
})();
