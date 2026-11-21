// WCAG 1.4.10 reflow: 320 CSS px wide (= 1280px at 400% / 640px at 200%); the user must not scroll sideways (tables excepted)
const { chromium } = require("playwright");
const pages = ["index.html", "plan.html", "vocab.html", "reading.html", "practice.html", "mock.html", "useful.html", "archaic.html", "desmos.html", "circle.html"];
(async () => { const br = await chromium.launch();
  for (const p of pages) { const pg = await br.newPage({ viewport: { width: 320, height: 640 } });
    await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Loop Test"); });
    await pg.goto("http://127.0.0.1:8767/" + p, { waitUntil: "networkidle" }); await pg.waitForTimeout(500);
    await pg.mouse.wheel(400, 0); await pg.waitForTimeout(100);
    const r = await pg.evaluate(() => { const cw = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); if (!b.width || b.right <= cw + 1) return false;
        for (let a = e.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") return false; } return true; });
      return { sx: scrollX, wide: wide.slice(0, 4).map((e) => `${e.tagName}#${e.id}.${String(e.className).slice(0, 24)} r=${Math.round(e.getBoundingClientRect().right)}`) }; });
    console.log(p.padEnd(14), r.sx ? "SCROLLS " + r.sx + "px" : "ok", r.wide.length ? r.wide.join(" | ") : ""); await pg.close(); }
  await br.close(); })();
