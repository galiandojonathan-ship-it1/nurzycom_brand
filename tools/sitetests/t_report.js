// «PDF-отчёт» in the cabinet's student card (report.js): sections, comment, print-only sheet, a real PDF via print media.
// Stand-in: node mkfx.mjs ../../docs <fx> && node pages_dev.mjs <fx> 8768.   usage: node t_report.js [desktop|phone] [csv]
const { chromium, devices } = require("playwright"); const fs = require("fs"); const { execFileSync } = require("child_process"); const { ADMIN } = require("./cbseed");
const B = "http://127.0.0.1:8768/", dev = process.argv[2] || "desktop", WHO = process.argv[4] || "Ayana";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const CSV = process.argv[3] ? fs.readFileSync(process.argv[3], "utf8") : "Timestamp,Student,Lesson,Part,Answers,Score,Wrong,Seconds,Attempt\n" +
  "03/11/2026 10:00:00,Ayana Seitkali,V01,p1 · Практика · экран · 2-я: 4/4,1:A>C 2:A 3:B>A 4:A,2/4,\"1,3\",300,1\n" +
  "12/11/2026 10:00:00,Ayana Seitkali,V01,p1 · Практика · экран · 2-я: 4/4,1:C 2:A 3:A 4:A,4/4,,200,2\n" +
  "20/11/2026 11:00:00,Ayana Seitkali,V01,p2 · Практика · экран,1:A 2:B 3:C 4:D,3/4,4,250,1\n" +
  "21/11/2026 12:00:00,Ayana Seitkali,PT2,RW · M1 20/27 · M2 сложный 22/27,1.1:A,42/54,,3800,1\n";
(async () => {
  const br = await chromium.launch(), ctx = await br.newContext(dev === "phone" ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((A) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("admin_key", A); }, ADMIN);
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(B + "cabinet.html?view=results", { waitUntil: "load" }); await p.waitForTimeout(2500);
  await p.evaluate((csv) => window.TeacherWorkspace.useFile(csv, "report test"), CSV); await p.waitForTimeout(600);
  await p.click('#tabs [data-v="students"]'); await p.waitForTimeout(300);
  await p.click(`#v-students tr.click:has-text("${WHO}")`); await p.waitForSelector("#st-pdf", { timeout: 15000 }); await p.waitForTimeout(1500);
  await p.click("#st-pdf"); await p.waitForSelector("#rp .rp-sheet", { timeout: 10000 });
  const txt = async () => (await p.textContent("#rp-sheet")).replace(/\s+/g, " ");
  let t = await txt(); console.log("sheet:", t.slice(0, 900));
  ok(/Отчёт об учёбе:/.test(t) && /Главное/.test(t) && /работ сдано/.test(t), "the report opens with the student's name and «Главное»");
  ok(/Активность\. Всего сдано \d+/.test(t) && /Точность\./.test(t), "«Главное»: activity and accuracy in plain sentences");
  ok(/Ориентир на SAT\. .{0,40}\d{3}–\d{3}/.test(t) && /не официальный балл College Board и не обещание/.test(t) && /20\d\d/.test(t), "the SAT range is a range with its basis, not a promise; dates with the year");
  ok(/Навыки: что усвоено и что добить/.test(t) && (/Хромает \(\d+\)/.test(t) && /Усвоено \(\d+\)/.test(t) || /Пока мало ответов: подтема попадает сюда/.test(t)), "the skills section: limping, learned, what to finish (or the empty state)");
  ok(/Конфиденциально/.test(t) && /Telegram @nurzycom/.test(t), "footer: contacts and the confidentiality line");
  ok(/Индекс прогресса/.test(t) && (/из 100/.test(t) || /Индекс пока не рассчитан/.test(t)) && /не балл SAT/.test(t), "the progress index is in the report, labelled as not an SAT score");
  ok(!/из 100/.test(t) || (/Последние 4 недели/.test(t) && /Последние 8 недель/.test(t) && /Всё время/.test(t)), "three index charts: 4 weeks, 8 weeks, all time");
  await p.uncheck('[data-rps="recent"]'); t = await txt();
  ok(!/Последние работы/.test(t), "unticking a section removes it from the sheet");
  await p.fill("#rp-note", "Стала увереннее в грамматике."); t = await txt();
  ok(/Комментарий преподавателя/.test(t) && /Стала увереннее в грамматике/.test(t), "the teacher's comment appears on the sheet");
  await p.emulateMedia({ media: "print" });
  const vis = await p.evaluate(() => ({ bar: getComputedStyle(document.querySelector("#rp .rp-bar")).display, nav: [...document.body.children].filter((e) => e.id !== "rp" && getComputedStyle(e).display !== "none").length }));
  ok(vis.bar === "none" && vis.nav === 0, "print: only the sheet is printed (settings and the page itself hidden)");
  const pdf = `${__dirname}/report_${dev}.pdf`; await p.pdf({ path: pdf, format: "A4", printBackground: true });
  let pages = 0, ptxt = ""; try { pages = +/Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [pdf]).toString())[1]; ptxt = execFileSync("pdftotext", [pdf, "-"]).toString(); } catch (e) { /* no poppler */ }
  ok(pages >= 1 && pages <= 3 && /Отчёт об учёбе/.test(ptxt), `a real PDF: ${pages} page(s) with the report text`);
  await p.emulateMedia({ media: "screen" });
  await (await p.$("#rp-sheet")).screenshot({ path: `${__dirname}/report_${dev}.png` });
  if (dev === "phone") ok((await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "phone: no sideways scroll");
  await p.click("#rp-close"); ok(!(await p.$("#rp")) && !(await p.evaluate(() => document.body.classList.contains("rp-on"))), "«Закрыть» returns to the card");
  ok(!errs.length, "no page errors " + JSON.stringify(errs));
  await br.close(); console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log("CRASH", e); process.exit(2); });
