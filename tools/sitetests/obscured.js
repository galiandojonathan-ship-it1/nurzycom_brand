// WCAG 2.4.11/2.4.12: Tab forward and Shift+Tab back through each page; report focused elements covered by sticky/fixed bars
const { chromium } = require("playwright");
const pages = process.argv[3] ? process.argv[3].split(",") : ["index.html", "plan.html", "vocab.html", "reading.html", "practice.html", "mock.html", "useful.html", "desmos.html", "archaic.html", "circle.html", "teacher.html"];
const vp = process.argv[2] === "phone" ? { width: 390, height: 664 } : { width: 1280, height: 720 };
(async () => { const br = await chromium.launch(); const res = { full: {}, part: {} }; let checked = 0;
  for (const p of pages) { const pg = await br.newPage({ viewport: vp }); await pg.route(/docs\.google\.com/, (r) => r.abort());
    await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); });
    await pg.goto("http://127.0.0.1:8767/" + p, { waitUntil: "networkidle" }); await pg.waitForTimeout(400);
    if (process.argv[4] === "solve") { if (p.startsWith("index")) { await pg.click('.tile[data-l="V03"]'); await pg.click('.pick[data-p="p1"]'); await pg.click("#go"); } else if (p.startsWith("practice")) { await pg.click(".set >> nth=0").catch(() => {}); await pg.click("#start, #go").catch(() => {}); } await pg.waitForTimeout(1500); await pg.mouse.wheel(0, 600); }
    if (p === "teacher.html") { await pg.setInputFiles("#file", __dirname + "/solo.csv"); await pg.waitForTimeout(900); await pg.click('#tabs .chip[data-v="log"]').catch(() => {}); await pg.waitForTimeout(400); }
    const probe = async () => pg.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const r = e.getBoundingClientRect(); if (!r.height) return null;
      const inBar = (x) => { for (let n = x; n; n = n.parentElement) { const s = getComputedStyle(n); if (s.position === "sticky" || s.position === "fixed") return !n.contains(e); } return false; };
      const xs = [0.15, 0.5, 0.85].map((f) => r.left + f * r.width), ys = [0.15, 0.5, 0.85].map((f) => r.top + f * r.height); let n = 0, hid = 0;
      for (const x of xs) for (const y of ys) { if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue; n++; const t = document.elementFromPoint(x, y); if (t && !e.contains(t) && !t.contains(e) && inBar(t)) hid++; }
      const cover = n ? hid / n : 0;
      const vis = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height;
      return { d: e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + ((e.textContent || "").trim() ? " «" + e.textContent.trim().slice(0, 22) + "»" : ""), cover: vis > 0 ? cover : 0 }; });
    for (const key of ["Tab", "Shift+Tab"]) for (let i = 0; i < (key === "Tab" ? 60 : 60); i++) { await pg.keyboard.press(key); const r = await probe(); if (!r) continue; checked++;
      const k = `${p}: ${r.d}`; if (r.cover >= 0.99) res.full[k] = key; else if (r.cover > 0.25) res.part[k] = key + " " + Math.round(r.cover * 100) + "%"; }
    await pg.close(); }
  console.log(`checked ${checked} focus stops at ${vp.width}px`); for (const [k, v] of Object.entries(res.full)) console.log("FULLY HIDDEN  " + k + "  (" + v + ")");
  for (const [k, v] of Object.entries(res.part)) console.log("partly hidden " + k + "  (" + v + ")"); await br.close(); })();
