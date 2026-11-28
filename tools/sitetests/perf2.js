// Logged-in page weight on the local real copy (slow 4G): requests, bytes, duplicated downloads
const { chromium } = require("playwright");
(async () => { const br = await chromium.launch();
  for (const p of ["index.html", "mock.html", "vocab.html", "plan.html", "reading.html"]) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); });
    const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg); await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
    const res = []; pg.on("response", async (r) => { try { const b = await r.body(); res.push({ u: r.url().replace(/^https?:\/\/[^/]+\//, "").replace(/\?v=\d+/, ""), kb: b.length / 1024 }); } catch (e) {} });
    const t0 = Date.now(); await pg.goto("http://127.0.0.1:8767/" + p, { waitUntil: "networkidle", timeout: 90000 }); const load = Date.now() - t0;
    const dup = Object.entries(res.reduce((a, r) => ((a[r.u] = (a[r.u] || 0) + 1), a), {})).filter(([, n]) => n > 1).map(([u, n]) => `${u}×${n}`);
    console.log(`${p.padEnd(13)} ${load} ms · ${res.length} req · ${Math.round(res.reduce((a, r) => a + r.kb, 0))} KB · biggest: ${res.sort((a, b) => b.kb - a.kb).slice(0, 3).map((r) => `${r.u} ${Math.round(r.kb)}KB`).join(", ")}${dup.length ? " · DUPLICATES: " + dup.join(", ") : ""}`);
    await ctx.close(); }
  await br.close(); })();
