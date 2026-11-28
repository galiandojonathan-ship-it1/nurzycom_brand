const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const res = {};
  for (const port of [8767, 8768]) { const pg = await br.newPage(); await pg.addInitScript(() => localStorage.setItem("site_pw", "fixture-pw"));
    await pg.goto(`http://127.0.0.1:${port}/mock.html`, { waitUntil: "networkidle" });
    res[port] = await pg.evaluate(async () => { await GLOSS.ready; GLOSS.on = true; const M = await SITE.json("mocks"); let n = 0, qs = 0; const ws = {};
      for (const t of M.mocks) for (const sec of t.sections.filter((x) => x.k === "rw")) {
        const bd = JSON.parse(new TextDecoder().decode(await SITE.open(await (await fetch(sec.b)).arrayBuffer())));
        for (const [mod, items] of Object.entries(bd.mods)) for (const q of items) { qs++; const d = document.createElement("div"); d.innerHTML = (q.stim || "") + (q.stem || "") + (q.opts || []).join(" "); document.body.append(d);
          GLOSS.apply([d], { key: `${t.id}.rw.${mod}.${q.n}` }); d.querySelectorAll(".gw").forEach((g) => { n++; ws[g.dataset.k] = (ws[g.dataset.k] || 0) + 1; }); d.remove(); } }
      return { qs, n, ws }; });
    await pg.close(); }
  const a = res[8768], b = res[8767]; console.log("practice tests RW questions:", a.qs, "| underlines before:", a.n, "after:", b.n);
  const diff = Object.keys({ ...a.ws, ...b.ws }).filter((k) => (a.ws[k] || 0) !== (b.ws[k] || 0)).map((k) => `${k}: ${a.ws[k] || 0}→${b.ws[k] || 0}`);
  console.log("changed words:", diff.join(" | ") || "none"); await br.close(); })();
