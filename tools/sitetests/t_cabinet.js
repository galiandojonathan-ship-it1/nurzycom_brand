// Cabinet 2.0: groups, placing students, group editor, assigning to a group, profile header, axe, phone width. Local stand-in on 8768.
const { chromium } = require("playwright"); const fs = require("fs"); const { seed, page } = require("./cbseed");
const AXE = fs.readFileSync(__dirname + "/node_modules/axe-core/axe.min.js", "utf8");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const axe = async (pg, label) => { await pg.addScriptTag({ content: AXE }); const v = await pg.evaluate(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((x) => `${x.id}×${x.nodes.length} ${x.nodes[0].target.join(" ")}`));
  ok(!v.length, `axe ${label}: ${v.length ? v.join(" | ") : "clean"}`); };
(async () => { const br = await chromium.launch(); const pg = await page(br); const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("dialog", (d) => d.accept());
  console.log(await seed(pg)); await pg.goto("http://127.0.0.1:8768/cabinet.html", { waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
  const vis = (a) => a.map((b) => { const c = b.cloneNode(true); c.querySelectorAll(".sr-only").forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, " ").trim(); });
  const tabs = await pg.$$eval(".gtab", vis); console.log("tabs:", tabs.join(" | "));
  ok(tabs.includes("Группа 0") && tabs.includes("Индивидуальные ученики 0"), "two default groups");
  ok((await pg.$eval(".gtab .sr-only", (e) => e.getBoundingClientRect().width)) <= 1, "group kind is for screen readers only");
  await axe(pg, "overview");
  // place four students into «Группа» from their cards
  const G1 = await pg.$eval('.gtab[data-g]:nth-child(2)', (b) => b.dataset.g), G2 = await pg.$eval('.gtab[data-g]:nth-child(3)', (b) => b.dataset.g);
  for (const nm of ["Ayana Seitkali", "Dias Omarov", "Aruzhan Bek", "Timur Ali"]) { await pg.selectOption(`.scard:has(.sc-nm:text-is("${nm}")) select[data-place]`, G1); await pg.waitForTimeout(250); }
  ok((await pg.$$eval(`.gblock:has(h2:text-is("Группа")) .scard`, (a) => a.length)) === 4, "4 students placed in «Группа» from their cards");
  // group editor: individual students + rename and recolour the class group
  await pg.click(`[data-gedit="${G2}"]`); await pg.waitForSelector("#cb-gform");
  for (const nm of ["Sher Zh", "Mukhamediya K", "Ansara T"]) await pg.check(`#cb-gform .cb-tick:has-text("${nm}") input`);
  await axe(pg, "group editor"); await pg.click('#cb-gform button[type=submit]'); await pg.waitForTimeout(500);
  ok((await pg.$$eval(".gblock .scard", (a) => a.length)) === 3 && /Индивидуальные/.test(await pg.textContent(".gblock h2")), "individual students saved; their tab opens");
  await pg.click(`.gtab[data-g="all"]`); await pg.click(`[data-gedit="${G1}"]`); await pg.fill("#g-name", "SAT группа · ноябрь"); await pg.check('[name=g-color][value=violet]', { force: true }); await pg.click('#cb-gform button[type=submit]'); await pg.waitForTimeout(500);
  const t2 = await pg.$eval(`.gtab[data-g="${G1}"]`, (b) => ({ t: b.innerText.replace(/\s+/g, " "), bg: getComputedStyle(b).backgroundColor }));
  ok(/SAT группа · ноябрь 4/.test(t2.t) && t2.bg === "rgb(106, 61, 158)", `renamed and violet: ${JSON.stringify(t2)}`);
  // groups survive a reload (server copy)
  await pg.evaluate(() => localStorage.removeItem("cb_groups")); await pg.reload({ waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
  const after = await pg.$$eval(".gtab", vis);
  ok(after.includes("SAT группа · ноябрь 4") && after.includes("Индивидуальные ученики 3"), "groups come back from the server after reload: " + after.join(" | "));
  // assign homework to the whole group
  await pg.click(`[data-bulkg="${G1}"]`); await pg.waitForSelector("#cb-assign");
  ok(/выбрано 4/.test(await pg.textContent(".step h3")), "«Задать задание группе» selects its 4 students");
  await pg.click('[data-kind="mk"]'); await pg.selectOption("#cb-item", "PT2"); await pg.click('.due-row .chip:has-text("Через 3 дня")');
  const sum = (await pg.textContent(".cb-sum")).trim(); ok(/«Пробный тест 2» → 4 ученикам, до/.test(sum), "summary: " + sum);
  await axe(pg, "assign form");
  await pg.click("#cb-ago"); await pg.waitForTimeout(1500); const toast = (await pg.textContent("#cb-toast")).trim(); ok(/задано 4 ученикам/.test(toast), "toast: " + toast);
  // profile
  await pg.click(`.scard:has(.sc-nm:text-is("Dias Omarov")) .sc-open`); await pg.waitForSelector(".cb-head");
  const head = await pg.evaluate(() => ({ pill: document.querySelector(".gpill").innerText, crumbs: document.querySelector(".crumbs").innerText.replace(/\s+/g, " "), band: getComputedStyle(document.querySelector(".cb-head")).borderTopColor }));
  ok(/SAT группа · ноябрь · Группа/.test(head.pill) && head.band === "rgb(106, 61, 158)", "profile shows the group pill and colour band: " + JSON.stringify(head));
  ok(/← SAT группа · ноябрь/.test(head.crumbs) && /Ayana Seitkali/.test(head.crumbs) && /Timur Ali/.test(head.crumbs), "back to the group, previous and next student: " + head.crumbs);
  await pg.click('[data-tab="tasks"]'); ok(/Пробный тест 2/.test(await pg.textContent(".cb-body")), "the task is in Dias's «Задания»");
  await axe(pg, "profile");
  await pg.selectOption("#cb-grp", G2); await pg.waitForTimeout(400); ok(/Индивидуальные/.test(await pg.textContent(".gpill")), "moving Dias to another group from his profile");
  // phone width
  const ph = await page(br, { width: 390, height: 844 }); await ph.goto("http://127.0.0.1:8768/cabinet.html", { waitUntil: "load" }); await ph.waitForSelector(".scard", { timeout: 20000 });
  ok((await ph.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone 390px: no sideways scroll on the overview");
  await ph.screenshot({ path: __dirname + "/../cab-phone.png", fullPage: false });
  await pg.click("[data-back]"); await pg.click('.gtab[data-g="all"]'); await pg.waitForTimeout(300); await pg.screenshot({ path: __dirname + "/../cab-after2.png", fullPage: true });
  ok(!errs.length, "no page errors " + JSON.stringify(errs)); await br.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0); })();
