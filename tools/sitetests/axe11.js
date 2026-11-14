// axe on the teacher dashboard (every tab, with data), cabinet and 404, phone and desktop
const { chromium } = require("playwright"); const fs = require("fs");
const AXE = fs.readFileSync(__dirname + "/node_modules/axe-core/axe.min.js", "utf8");
const run = async (pg, label, out) => { await pg.addScriptTag({ content: AXE }); const r = await pg.evaluate(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] })).violations.map((v) => ({ id: v.id, n: v.nodes.length, ex: v.nodes.slice(0, 2).map((x) => x.target.join(" ") + " :: " + (x.failureSummary || "").split("\n")[1]) })));
  r.forEach((v) => { const k = `${v.id}`; (out[k] = out[k] || []).push(`${label} ×${v.n}  ${v.ex.join(" | ").slice(0, 220)}`); }); };
(async () => { const br = await chromium.launch(); const out = {};
  for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const pg = await br.newPage({ viewport: vp }); await pg.route(/docs\.google\.com/, (r) => r.abort());
    await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); });
    await pg.goto("http://127.0.0.1:8767/teacher.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(500);
    await run(pg, `${vp.width} teacher:source`, out);
    await pg.setInputFiles("#file", __dirname + "/run11.csv"); await pg.waitForTimeout(1200);
    const views = await pg.$$eval("#tabs .chip", (a) => a.map((b) => b.dataset.v));
    for (const v of views) { await pg.click(`#tabs .chip[data-v="${v}"]`).catch(() => {}); await pg.waitForTimeout(1200); await run(pg, `${vp.width} teacher:${v}`, out); }
    for (const u of ["cabinet.html", "404.html"]) { await pg.goto("http://127.0.0.1:8767/" + u, { waitUntil: "networkidle" }); await pg.waitForTimeout(700); await run(pg, `${vp.width} ${u}`, out); }
    await pg.close(); }
  for (const [k, v] of Object.entries(out)) { console.log("== " + k); [...new Set(v)].slice(0, 6).forEach((x) => console.log("   " + x)); }
  if (!Object.keys(out).length) console.log("no axe violations"); await br.close(); })();
