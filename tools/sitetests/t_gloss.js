// Feature test: difficult words in homework (fixture site on :8765)
const { chromium } = require("playwright");
const B = "http://127.0.0.1:8765/";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => {
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Test Student"); });
  pg.on("dialog", (d) => d.dismiss());
  const open = async (l, p) => {
    await pg.goto(B + `index.html?l=${l}&p=${p}`); await pg.waitForSelector(".tile");
    await pg.fill("#student", "Test Student"); await pg.click(`.pick[data-p="${p}"]`); await pg.click("#go");
    await pg.waitForSelector("#s-solve:not(.hidden)"); await pg.waitForTimeout(400);
  };
  const gw = (sel) => pg.$$eval(sel + " .gw", (a) => a.map((x) => x.textContent));
  await open("V01", "p1");
  ok(await pg.isVisible("#sv-gloss"), "switch is visible in Verbal homework");
  ok((await gw("#sv-wrap")).length === 0, "Q1 Words in Context: nothing underlined");
  await pg.click("#sv-next"); await pg.waitForTimeout(300);
  const p2 = await gw("#sv-passage"), o2 = await gw("#sv-opts");
  ok(p2.length >= 2, "Q2 main idea: passage words underlined: " + p2.join(", "));
  ok(o2.length >= 0, "Q2 options: " + o2.join(", "));
  // tap a word inside an option: the card opens and the option is not chosen
  const optWord = await pg.$("#sv-opts .gw");
  if (optWord) { await optWord.click(); ok(await pg.isVisible(".gpop"), "tap shows the card"); ok((await pg.$$("#sv-opts .opt.on")).length === 0, "tap on a word does not choose the option"); await pg.keyboard.press("Escape"); ok(!(await pg.isVisible(".gpop")), "Escape closes the card"); }
  await pg.click("#sv-next"); await pg.waitForTimeout(300);
  ok((await gw("#sv-opts")).length === 0, "Q3 transitions: options not underlined before answering");
  ok((await gw("#sv-passage")).includes("curators"), "Q3 transitions: wide test word «curators» underlined in passage");
  await pg.click('#sv-opts .ch[data-c="A"]'); await pg.click("#sv-check"); await pg.waitForTimeout(400);
  ok((await gw("#sv-opts")).length >= 1, "Q3 after answering: options underlined (Lucidly)");
  await pg.click("#sv-next"); await pg.waitForTimeout(300);
  ok((await gw("#sv-wrap")).length === 0, "Q4 «most nearly mean»: nothing underlined");
  await pg.click("#sv-prev"); await pg.click("#sv-prev"); await pg.waitForTimeout(300);
  await pg.click("#sv-gloss"); await pg.waitForTimeout(300);
  ok((await gw("#sv-wrap")).length === 0 && (await pg.textContent("#sv-gloss")).includes("выкл"), "switch off removes underlines");
  await pg.click("#sv-gloss"); await pg.waitForTimeout(300);
  ok((await gw("#sv-passage")).length >= 2, "switch on brings them back");
  // test mode
  await open("V01", "p2"); await pg.click("#sv-next"); await pg.waitForTimeout(300);
  ok((await gw("#sv-passage")).length >= 2, "final test (exam mode): passage underlined too");
  // Math: no switch, no underline
  await open("M01", "p1");
  ok(!(await pg.isVisible("#sv-gloss")) && (await gw("#sv-wrap")).length === 0, "Math homework: no switch, no underline");
  // phone
  await pg.setViewportSize({ width: 375, height: 760 }); await open("V01", "p1"); await pg.click("#sv-next"); await pg.waitForTimeout(300);
  const ov = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(ov <= 0, "phone: no horizontal scroll (" + ov + "px)");
  await pg.screenshot({ path: __dirname + "/shot_gloss_phone.png" });
  ok(errs.length === 0, "no console errors " + errs.join(" | "));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})();
