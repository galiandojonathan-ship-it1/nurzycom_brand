const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 390, height: 844 } });
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); localStorage.removeItem("vocab_sel"); }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto("http://127.0.0.1:8767/vocab.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(300);
  console.log("nothing chosen → summary:", JSON.stringify((await pg.textContent("#sum")).trim()), "| hard-go title:", await pg.getAttribute("#hard-go", "title"), "| hard hint:", await pg.evaluate(() => { const b = document.getElementById("hard-go"); return b.parentElement.innerText.replace(/\s+/g, " ").slice(0, 120); }));
  await pg.click("#all-v"); await pg.waitForTimeout(200); console.log("all Verbal → summary:", (await pg.textContent("#sum")).trim().slice(0, 120));
  await pg.click('#start-modes .pick[data-m="list"]'); await pg.waitForTimeout(400);
  console.log("list mode:", JSON.stringify(await pg.evaluate(() => { const l = document.getElementById("m-list"); return { shown: !l.classList.contains("hidden"), text: l.innerText.slice(0, 200).replace(/\s+/g, " "), items: l.children.length, sx: document.documentElement.scrollWidth - document.documentElement.clientWidth }; })));
  console.log("errors:", errs.length ? errs : "none"); await br.close(); })();
