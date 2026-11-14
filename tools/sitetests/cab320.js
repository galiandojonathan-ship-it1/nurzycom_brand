// Cabinet at 320px + keyboard: sideways scroll and small targets on each screen; Escape on forms; Tab order reaches group tabs
const { chromium } = require("playwright"); const { seed, page } = require("./cbseed");
(async () => { const br = await chromium.launch(); const pg = await page(br, { width: 320, height: 640 }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("dialog", (d) => d.accept());
  console.log(await seed(pg)); await pg.goto("http://127.0.0.1:8768/cabinet.html", { waitUntil: "load" }); await pg.waitForSelector(".scard", { timeout: 20000 });
  const audit = async (label) => { const r = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth - innerWidth,
      wide: [...document.querySelectorAll("#cb *")].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(e).position !== "fixed").map((e) => (e.id || e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().right)).slice(0, 5),
      small: [...document.querySelectorAll("#cb button, #cb a, #cb input, #cb select, #cb label.sw")].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.height && (b.height < 24 || b.width < 24) && !e.closest(".sr-only"); }).map((e) => (e.id || e.className || e.tagName) + " " + Math.round(e.getBoundingClientRect().width) + "×" + Math.round(e.getBoundingClientRect().height)).slice(0, 5) }));
    console.log(label.padEnd(14), "sideways:", r.sw, "| too wide:", r.wide.join(", ") || "none", "| small:", r.small.join(", ") || "none"); };
  await audit("overview");
  await pg.click(".gtab.add"); await pg.waitForSelector("#cb-gform"); await audit("group editor");
  await pg.keyboard.press("Escape"); await pg.waitForTimeout(200); console.log("Escape closes the group editor:", !(await pg.$("#cb-gform")));
  if (await pg.$("#cb-gform")) await pg.click("#cb-gcancel");
  await pg.click('[data-bulk="1"]'); await pg.waitForSelector("#cb-assign"); await audit("assign");
  await pg.keyboard.press("Escape"); await pg.waitForTimeout(200); console.log("Escape closes the assign form:", !(await pg.$("#cb-assign")));
  if (await pg.$("#cb-assign")) await pg.click("#cb-acancel");
  await pg.click(".scard .sc-open"); await pg.waitForSelector(".cb-head"); await audit("profile");
  for (const t of ["plan", "res", "tasks"]) { await pg.click(`[data-tab="${t}"]`); await pg.waitForTimeout(200); await audit("profile " + t); }
  // keyboard: after closing a form, where is focus?
  await pg.click('[data-new="1"]'); await pg.waitForSelector("#cb-assign"); await pg.click("#cb-acancel"); await pg.waitForTimeout(200);
  console.log("focus after «Закрыть» (profile):", await pg.evaluate(() => { const e = document.activeElement; return e === document.body ? "BODY" : e.id || e.className || e.tagName; }));
  await pg.click('[data-u]').catch(() => {}); console.log("errors:", errs.length ? errs : "none"); await br.close(); })();
