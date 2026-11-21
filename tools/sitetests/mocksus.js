const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage();
  await pg.addInitScript(() => localStorage.setItem("site_pw", "fixture-pw"));
  await pg.goto("http://127.0.0.1:8767/mock.html", { waitUntil: "networkidle" });
  const r = await pg.evaluate(async () => { await GLOSS.ready; GLOSS.on = true; const M = await SITE.json("mocks"); const pairs = {};
    for (const t of M.mocks) for (const sec of t.sections.filter((x) => x.k === "rw")) {
      const bd = JSON.parse(new TextDecoder().decode(await SITE.open(await (await fetch(sec.b)).arrayBuffer())));
      for (const [mod, items] of Object.entries(bd.mods)) for (const q of items) { const d = document.createElement("div"); d.innerHTML = (q.stim || "") + " " + (q.stem || "") + " " + (q.opts || []).join(" "); document.body.append(d);
        GLOSS.apply([d], { key: `${t.id}.rw.${mod}.${q.n}` });
        d.querySelectorAll(".gw").forEach((g) => { const s = g.textContent.toLowerCase(), k = g.dataset.k, e = GLOSS.entry(k);
          const head = String(e.w).toLowerCase().replace(/\([^)]*\)/g, "").replace(/^to\s+/, "").trim();
          const heads = head.split(/\s*[\/;,]\s*/).map((x) => x.trim());
          const susp = !heads.some((h) => s.startsWith(h.slice(0, Math.min(4, h.length))));
          const kk = s + " → " + e.w; if (susp) { if (!pairs[kk]) { const t2 = g.parentNode.textContent, i = t2.indexOf(g.textContent); pairs[kk] = { n: 0, ctx: t2.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, " ") }; } pairs[kk].n++; } });
        d.remove(); } }
    return pairs; });
  for (const [k, v] of Object.entries(r).sort((a, b) => b[1].n - a[1].n)) console.log(`${k} (${v.n})  …${v.ctx}…`);
  await br.close(); })();
