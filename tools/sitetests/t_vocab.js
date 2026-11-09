const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 390, height: 844 } });
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto("http://127.0.0.1:8767/vocab.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(400);
  const hard = { n: await pg.textContent("#hard-n"), disabled: await pg.isDisabled("#hard-go") };
  console.log("hard deck with nothing marked:", JSON.stringify(hard));
  if (!hard.disabled) { await pg.click("#hard-go"); await pg.waitForTimeout(400); console.log("after clicking it:", await pg.evaluate(() => ({ run: !document.getElementById("v-run").classList.contains("hidden"), msg: (document.querySelector("#v-start .hint:not(.hidden), #start-msg") || {}).textContent, flash: (document.getElementById("flash") || {}).innerText }))); }
  await pg.goto("http://127.0.0.1:8767/vocab.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(300);
  await pg.click('#start-modes .pick[data-m="list"]'); await pg.waitForTimeout(400);
  console.log("list mode:", await pg.evaluate(() => { const l = document.getElementById("m-list"); return { shown: l && !l.classList.contains("hidden"), rows: l ? l.querySelectorAll("tr, li, .wi, .row, div > b").length : 0, sx: document.documentElement.scrollWidth - document.documentElement.clientWidth, sample: l ? l.innerText.slice(0, 160).replace(/\s+/g, " ") : "" }; }));
  // nothing selected: what does the start screen say?
  await pg.goto("http://127.0.0.1:8767/vocab.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(300);
  console.log("start summary:", (await pg.textContent("#sum")).trim().slice(0, 140));
  console.log("errors:", errs.length ? errs : "none"); await br.close(); })();
