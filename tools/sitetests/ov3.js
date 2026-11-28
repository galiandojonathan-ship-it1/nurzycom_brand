const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.addInitScript(() => localStorage.setItem("site_pw", "fixture-pw"));
  await pg.goto("http://127.0.0.1:8765/teacher.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(1500);
  console.log(await pg.evaluate(() => {
    const sw = () => document.documentElement.scrollWidth; const base = sw(); const res = [];
    const walk = (el, depth) => { for (const c of el.children) { const d = c.style.display; c.style.display = "none"; const s = sw(); c.style.display = d;
      if (s < base) { res.push("  ".repeat(depth) + c.tagName + "#" + c.id + "." + String(c.className).slice(0, 40) + " → " + s); if (depth < 6) walk(c, depth + 1); } } };
    walk(document.body, 0); return [base, ...res].join("\n"); }));
  await br.close(); })();
