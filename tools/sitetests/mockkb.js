// Mock test by keyboard: question panel open/close (Escape, focus), next → check screen focus, check grid → question
const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1280, height: 800 } }); await pg.route(/docs\.google\.com/, (r) => r.abort()); pg.on("dialog", (d) => d.dismiss());
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); Object.keys(localStorage).filter((k) => /^mk_state_/.test(k)).forEach((k) => localStorage.removeItem(k)); });
  await pg.goto("http://127.0.0.1:8767/mock.html?t=PR1", { waitUntil: "networkidle" }); await pg.waitForTimeout(500);
  await pg.click('.mcard[data-m="PR1"]').catch(() => {}); await pg.click("#go"); await pg.waitForSelector("#m-dir:not(.hidden)"); await pg.click("#dir-go"); await pg.waitForSelector("#m-test:not(.hidden)"); await pg.waitForTimeout(500);
  const act = () => pg.evaluate(() => { const e = document.activeElement; return e === document.body ? "BODY" : (e.id || e.className || e.tagName) + (e.closest(".hidden") ? " (inside hidden!)" : ""); });
  console.log("after start, focus:", await act());
  await pg.focus("#navbtn"); await pg.keyboard.press("Enter"); await pg.waitForTimeout(200);
  console.log("panel open:", !(await pg.$eval("#navpanel", (e) => e.classList.contains("hidden"))), "| focus:", await act(), "| navbtn aria-expanded:", await pg.getAttribute("#navbtn", "aria-expanded"));
  await pg.keyboard.press("Escape"); await pg.waitForTimeout(200);
  console.log("after Escape, panel open:", !(await pg.$eval("#navpanel", (e) => e.classList.contains("hidden"))), "| focus:", await act());
  await pg.$eval("#navpanel", (e) => e.classList.add("hidden"));
  // jump to the last question with ArrowRight, then Next → check screen
  for (let i = 0; i < 27; i++) await pg.keyboard.press("ArrowRight"); await pg.waitForTimeout(200);
  console.log("at:", (await pg.textContent("#navbtn")).trim());
  await pg.focus("#next"); await pg.keyboard.press("Enter"); await pg.waitForTimeout(400);
  console.log("check screen shown:", await pg.isVisible("#m-check"), "| focus:", await act());
  await pg.keyboard.press("Tab"); console.log("first Tab on check screen →", await act());
  const b = await pg.$("#chk-grid button"); await b.focus(); await pg.keyboard.press("Enter"); await pg.waitForTimeout(300);
  console.log("grid → question:", await pg.isVisible("#m-test"), "| focus:", await act(), "| at:", (await pg.textContent("#navbtn")).trim());
  await br.close(); })();
