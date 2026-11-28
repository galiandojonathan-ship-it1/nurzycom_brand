// Vocabulary typed test: Russian-layout typing of the right word counts with a note; Cyrillic nonsense is not counted
const { chromium } = require("playwright");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const RU = "йцукенгшщзхъфывапролджэячсмитьбю", EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.";
const toRu = (w) => w.split("").map((c) => { const i = EN.indexOf(c); return i < 0 ? c : RU[i]; }).join("");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.removeItem("vocab_sel"); localStorage.removeItem("vocab_hard"); });
  await pg.goto("http://127.0.0.1:8767/vocab.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(400);
  await pg.click('#lessons .tile[data-l="V01"]'); await pg.click('#start-modes .pick[data-m="list"]'); await pg.waitForSelector("#m-list .item");
  const map = await pg.$$eval("#m-list .item", (a) => Object.fromEntries(a.map((x) => [x.querySelector(".ru").textContent.trim(), x.querySelector(".en").textContent.trim()])));
  await pg.goto("http://127.0.0.1:8767/vocab.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(300);
  await pg.click('#lessons .tile[data-l="V01"]').catch(() => {}); if (!(await pg.$('#lessons .tile[data-l="V01"][aria-pressed="true"]'))) await pg.click('#lessons .tile[data-l="V01"]');
  await pg.click('#start-modes .pick[data-m="test"]'); await pg.waitForSelector("#t-in");
  let tried = 0, passed = false;
  for (let i = 0; i < 10 && !passed; i++) {
    const q = (await pg.textContent("#t-q")).trim(), en = map[q]; const word = en && en.split(/\s*(?:\/|·|,|;| or )\s*/)[0].replace(/\(.*?\)/g, "").replace(/^to /, "").trim().toLowerCase();
    if (!word || !/^[a-z' -]+$/.test(word) || /[\[\];',.`]/.test(word)) { await pg.click("#t-check"); await pg.click("#t-check"); continue; }   // skip words whose letters map to punctuation
    tried++; await pg.fill("#t-in", toRu(word)); await pg.click("#t-check"); const fb = (await pg.textContent("#t-fb")).trim();
    console.log(`«${q}» → typed «${toRu(word)}» (= ${word}) → ${fb.slice(0, 70)}`); passed = /^Верно\. \(набрано в русской раскладке/.test(fb);
  }
  ok(passed, "the right word typed in the Russian layout counts, with a note");
  await pg.click("#t-check"); await pg.fill("#t-in", "щщщ"); await pg.click("#t-check"); const fb1 = (await pg.textContent("#t-fb")).trim();
  ok(/русская раскладка/.test(fb1) && (await pg.textContent("#t-check")).trim() === "Проверить", "Cyrillic nonsense: asked to switch the keyboard, not graded");
  ok((await pg.getAttribute("#t-in", "autocorrect")) === "off" && (await pg.getAttribute("#t-in", "lang")) === "en", "answer field: autocorrect off, lang en");
  ok(!errs.length, "no page errors " + JSON.stringify(errs)); await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); })();
