const { chromium } = require("playwright");
(async () => { const br = await chromium.launch();
  for (const url of process.argv.slice(2)) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 } }); const pg = await ctx.newPage();
    const cdp = await ctx.newCDPSession(pg); await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });   // «slow 4G»
    const res = []; pg.on("response", async (r) => { try { const b = await r.body(); res.push({ u: r.url().replace(/^https?:\/\//, "").slice(0, 70), t: r.request().resourceType(), kb: b.length / 1024 }); } catch (e) { /* redirects */ } });
    const t0 = Date.now(); await pg.goto(url, { waitUntil: "load", timeout: 60000 }); const load = Date.now() - t0;
    const lcp = await pg.evaluate(() => new Promise((ok) => { let v = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) v = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); setTimeout(() => ok(Math.round(v)), 1500); }));
    const fcp = await pg.evaluate(() => Math.round((performance.getEntriesByName("first-contentful-paint")[0] || {}).startTime || 0));
    const by = {}; res.forEach((r) => (by[r.t] = (by[r.t] || 0) + r.kb));
    console.log(`\n${url}\n  load ${load} ms · FCP ${fcp} ms · LCP ${lcp} ms · ${res.length} requests · ${Math.round(res.reduce((a, r) => a + r.kb, 0))} KB`);
    console.log("  by type: " + Object.entries(by).map(([k, v]) => `${k} ${Math.round(v)} KB`).join(", "));
    console.log("  biggest: " + res.sort((a, b) => b.kb - a.kb).slice(0, 5).map((r) => `${r.u} ${Math.round(r.kb)} KB`).join(" | "));
    await ctx.close(); }
  await br.close(); })();
