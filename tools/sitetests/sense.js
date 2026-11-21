const { chromium } = require("playwright");
const W = ["stage", "breed", "yield", "suit", "dense", "deposit", "grasp", "eventual", "distinct", "contemporary", "address", "trace", "seek", "blend", "debris", "emit", "discarded", "respectively"];
(async () => { const br = await chromium.launch(); const pg = await br.newPage();
  await pg.addInitScript(() => localStorage.setItem("site_pw", "fixture-pw"));
  await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "networkidle" });
  const r = await pg.evaluate(async (W) => {
    await GLOSS.ready; const L = await SITE.json("lessons"), out = {};
    for (const l of L.lessons.filter((x) => x.tag[0] === "V" && !/^VA/.test(x.tag))) for (const p of l.parts) {
      const items = JSON.parse(new TextDecoder().decode(await SITE.open(await (await fetch(p.b)).arrayBuffer())));
      for (const q of items) { const d = document.createElement("div"); d.innerHTML = q.stim || ""; document.body.append(d); GLOSS.apply([d], { wide: true });
        d.querySelectorAll(".gw").forEach((g) => { const k = g.dataset.k; if (!W.includes(k) || (out[k] || []).length >= 2) return;
          const t = g.parentNode.textContent, i = t.indexOf(g.textContent); (out[k] = out[k] || []).push("…" + t.slice(Math.max(0, i - 50), i + 40).replace(/\s+/g, " ") + "…"); });
        d.remove(); } }
    return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { en: GLOSS.entry(k).en, ru: GLOSS.entry(k).ru.slice(0, 3).join(", "), ctx: v }]));
  }, W);
  for (const [k, v] of Object.entries(r)) console.log(`\n[${k}] ${v.en} | ${v.ru}\n  ` + v.ctx.join("\n  "));
  await br.close(); })();
