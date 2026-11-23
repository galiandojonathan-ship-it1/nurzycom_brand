// Bluebook import from a PDF (bbpdf.js): a Score Details-like page is printed to PDF by Chromium (as «Печать → Сохранить как
// PDF» does on a phone or a computer) and picked with «Загрузить PDF»; the site reads it in the browser. Synthetic data only;
// pass a real PDF as the 3rd argument to try one locally (never commit a real one).
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev.mjs <fx> 8768.   usage: node t_bbpdf.js [desktop|phone] [real.pdf]
const { chromium, devices } = require("playwright"); const fs = require("fs"); const os = require("os"); const path = require("path");
const { synthetic, tableOf } = require("./bbsynth.cjs");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop", REAL = process.argv[3];
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const cat = synthetic(), mp = tableOf(cat, "SAT2", { rw: "m2h", math: "m2e" }, "mp", ["rw.1.9", "math.2.8"]), tab = tableOf(cat, "SAT2", { rw: "m2h", math: "m2e" }, "tab", ["rw.1.9", "math.2.8"]);
const headLines = mp.split(/\r?\n/); headLines.length = headLines.findIndex((l) => /^Question/.test(l));
const isRow = (l) => /^\d{1,2}\t(Reading and Writing|Math)\t/.test(l);
// the page as Safari or Chrome prints it: header text, the table with «Reading and» / «Writing» on two lines, footer
const html = `<html><body style="font:14px Arial;margin:30px">${headLines.filter(Boolean).map((l) => `<p>${esc(l.replace(/\t/g, "    "))}</p>`).join("")}
  <p>Question Section Correct Answer Your Answer Actions</p><table style="border-collapse:collapse;width:640px">${tab.split(/\r?\n/).filter(isRow).map((l) => { const c = l.split("\t");
    return `<tr><td style="width:40px">${c[0]}</td><td style="width:110px">${c[1] === "Math" ? "Math" : "Reading and<br>Writing"}</td><td style="width:120px">${esc(c[2])}</td><td style="width:160px">${esc(c[3])}</td><td>Review</td></tr>`; }).join("")}</table>
  <p>© 2026 College Board</p></body></html>`;
// the page as Chrome on Android prints it (a student's real PDF, 2026-11-23): a real header row repeated on every page, an
// extra «Domain» column, narrow answer columns so «57.27; Incorrect» wraps above and below the row number
const DOM = ["Craft and Structure", "Information and Ideas", "Algebra", "Advanced Math", "Geometry and Trigonometry"];
const htmlAndroid = `<html><body style="font:13px Arial;margin:24px">${headLines.filter(Boolean).map((l) => `<p>${esc(l.replace(/\t/g, "    "))}</p>`).join("")}
  <table style="border-collapse:collapse;width:520px"><thead><tr><th style="text-align:left;width:60px">Question</th><th style="text-align:left;width:90px">Section</th><th style="text-align:left;width:70px">Correct<br>Answer</th><th style="text-align:left;width:70px">Your<br>Answer</th><th style="text-align:left;width:60px">Actions</th><th style="text-align:left">Domain</th></tr></thead><tbody>
  ${tab.split(/\r?\n/).filter(isRow).map((l, i) => { const c = l.split("\t");
    return `<tr style="height:44px"><td>${c[0]}</td><td>${c[1] === "Math" ? "Math" : "Reading and<br>Writing"}</td><td style="width:70px;word-break:break-word">${esc(c[2])}</td><td style="width:70px">${esc(c[3]).replace("; ", ";<br>")}</td><td>Review</td><td>${DOM[i % DOM.length]}</td></tr>`; }).join("")}</tbody></table>
  <p>© 2026 College Board</p></body></html>`;
(async () => {
  const br = await chromium.launch();
  const maker = await br.newPage(); await maker.setContent(html); const pdfPath = path.join(os.tmpdir(), `bbpdf_${process.pid}.pdf`);
  fs.writeFileSync(pdfPath, await maker.pdf({ format: "A4" }));
  const ctx = await br.newContext(dev === "phone" ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(B + "mock.html", { waitUntil: "load" }); await p.waitForSelector("#bb-import:not([hidden])", { timeout: 15000 });
  await p.click("#bb-import summary");
  ok(await p.isVisible("label[for=bb-file]") && /Сохраните PDF/.test(await p.textContent(".bb-steps")), "a «Загрузить PDF» button and the steps for saving a PDF on a phone");
  const t0 = Date.now(); await p.setInputFiles("#bb-file", pdfPath);
  await p.waitForFunction(() => /PDF прочитан|PDF|Прочитано/.test(document.getElementById("bb-status").textContent) && /Practice Test/.test(document.getElementById("bb-result").textContent), null, { timeout: 30000 }).catch(() => {});
  const st = await p.textContent("#bb-status"), res = (await p.textContent("#bb-result")).replace(/\s+/g, " ");
  console.log("status:", st, "|", Date.now() - t0, "ms\nresult:", res.slice(0, 260));
  ok(/PDF прочитан/.test(st) && /Прочитано 98 строк/.test(st), "the PDF is read in the browser: 98 rows");
  ok(/SAT Practice Test 2 · модуль 2 сложный/.test(res) && /SAT Practice Test 2 · модуль 2 лёгкий/.test(res), "test and both routes recognised from the PDF");
  ok(/М1, №9 · \w → \w/.test(res) && /М2, №8 · 999 → /.test(res) && /SAT Practice 2 · пройден 2 марта 2025/.test(res), "each miss and the date taken come through the PDF");
  // the Android layout: header on every page, a Domain column, wrapped answers
  const and = await br.newPage(); await and.setContent(htmlAndroid); const andPath = path.join(os.tmpdir(), `bband_${process.pid}.pdf`);
  fs.writeFileSync(andPath, await and.pdf({ format: "A4" }));
  await p.setInputFiles("#bb-file", andPath);
  await p.waitForFunction(() => !/Читаю/.test(document.getElementById("bb-status").textContent) && /Practice Test|Порядок|Скопируйте|не найдены/.test(document.getElementById("bb-status").textContent + document.getElementById("bb-result").textContent), null, { timeout: 30000 }).catch(() => {});
  const st2 = await p.textContent("#bb-status"), res2 = (await p.textContent("#bb-result")).replace(/\s+/g, " "); console.log("android-like:", st2);
  ok(/Прочитано 98 строк/.test(st2) && /М1, №9 · \w → \w/.test(res2) && /М2, №8 · 999 → /.test(res2), "Android layout (header on every page, Domain column, wrapped answers) reads 98 rows and the same misses");
  fs.unlinkSync(andPath);
  // a PDF with no text (a picture of the page)
  const pic = await br.newPage(); await pic.setContent('<html><body><svg width="400" height="300"><rect width="400" height="300" fill="#ccc"/></svg></body></html>');
  const picPath = path.join(os.tmpdir(), `bbpic_${process.pid}.pdf`); fs.writeFileSync(picPath, await pic.pdf({ format: "A4" }));
  await p.setInputFiles("#bb-file", picPath); await p.waitForFunction(() => /нет текста/.test(document.getElementById("bb-status").textContent), null, { timeout: 20000 }).catch(() => {});
  ok(/нет текста/.test(await p.textContent("#bb-status")), "a PDF without text says how to save it from the page");
  if (REAL) { await p.setInputFiles("#bb-file", REAL); await p.waitForFunction(() => /PDF прочитан|PDF|нет текста|Скопируйте|не найдены/.test(document.getElementById("bb-status").textContent) && !/Читаю/.test(document.getElementById("bb-status").textContent), null, { timeout: 30000 }).catch(() => {});
    console.log("real PDF:", await p.textContent("#bb-status")); ok(/Прочитано 98 строк/.test(await p.textContent("#bb-status")), "the real PDF reads 98 rows"); }
  if (dev === "phone") ok((await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  fs.unlinkSync(pdfPath); fs.unlinkSync(picPath);
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
