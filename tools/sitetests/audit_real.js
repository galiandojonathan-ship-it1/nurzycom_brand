// Logged-in pages on the REAL data copy: axe, sideways scroll, console errors, small targets, long tasks during load.
const { chromium } = require("playwright"); const fs = require("fs");
const AXE = fs.readFileSync(__dirname + "/node_modules/axe-core/axe.min.js", "utf8");
const B = "http://127.0.0.1:8767/";
const pages = ["index.html", "plan.html", "vocab.html", "reading.html", "practice.html", "mock.html", "useful.html", "archaic.html", "desmos.html", "circle.html"];
(async () => { const br = await chromium.launch(); const out = {};
  for (const vp of [{ width: 375, height: 760 }, { width: 1280, height: 900 }]) for (const p of pages) {
    const pg = await br.newPage({ viewport: vp }); const errs = [];
    pg.on("pageerror", (e) => errs.push("pageerror: " + e.message)); pg.on("console", (m) => m.type() === "error" && !/Failed to load resource|google|desmos/i.test(m.text()) && errs.push(m.text().slice(0, 120)));
    pg.on("response", (r) => r.status() >= 400 && !/api\//.test(r.url()) && errs.push(r.status() + " " + r.url().replace(/^https?:\/\/[^/]+/, "")));
    await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Test S");
      window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push(Math.round(e.duration)))).observe({ type: "longtask", buffered: true }); });
    await pg.goto(B + p, { waitUntil: "networkidle", timeout: 30000 }).catch((e) => errs.push("goto " + e.message.slice(0, 60)));
    await pg.waitForTimeout(800);
    const r = await pg.evaluate(() => ({ ov: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      lt: window.__lt, small: [...document.querySelectorAll("a,button,input,select,[role=button]")].filter((e) => { const b = e.getBoundingClientRect(); const inText = e.tagName === "A" && e.closest("p,li") && getComputedStyle(e).display === "inline"; return b.width && b.height && (b.height < 24 || b.width < 24) && !inText && !e.closest("label"); })
        .slice(0, 5).map((e) => `${e.tagName}${e.id ? "#" + e.id : ""}.${String(e.className).slice(0, 18)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)} «${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 16)}»`) }));
    // a user can't actually scroll sideways? check by wheel
    await pg.mouse.wheel(300, 0); const sx = await pg.evaluate(() => scrollX);
    await pg.addScriptTag({ content: AXE });
    const axe = await pg.evaluate(async () => (await axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => `${v.impact} ${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`));
    out[`${vp.width} ${p}`] = { sx, ...r, axe, errs: [...new Set(errs)].slice(0, 5) }; await pg.close(); }
  await br.close();
  for (const [k, v] of Object.entries(out)) { const lt = v.lt.filter((x) => x > 100);
    const bad = [...v.axe, ...(v.sx ? ["scrollX " + v.sx] : []), ...v.errs, ...(lt.length ? ["long tasks >100ms: " + lt.join(",")] : []), ...v.small.map((s) => "small " + s)];
    console.log(k, bad.length ? "\n   " + bad.join("\n   ") : "CLEAN"); } })();
