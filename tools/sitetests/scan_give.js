const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage();
  await pg.addInitScript(() => localStorage.setItem("site_pw", "fixture-pw"));
  await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "networkidle" });
  const r = await pg.evaluate(async () => { await GLOSS.ready; GLOSS.on = true;
    const GIVE = /most logical transition|conventions of standard english/i, L = await SITE.json("lessons"), f = {}; let qs = 0, withw = 0;
    for (const l of L.lessons.filter((x) => x.tag[0] === "V" && !/^VA/.test(x.tag))) for (const p of l.parts) {
      const items = JSON.parse(new TextDecoder().decode(await SITE.open(await (await fetch(p.b)).arrayBuffer())));
      for (const q of items) { if (!GIVE.test((q.stem || "").replace(/<[^>]+>/g, " "))) continue; qs++;
        const pa = document.createElement("div"); pa.innerHTML = q.stim || ""; const ops = (q.opts || []).map((o) => { const d = document.createElement("div"); d.innerHTML = o; return d; });
        document.body.append(pa, ...ops); GLOSS.apply([pa, ...ops], { wide: true });
        const ow = ops.flatMap((d) => [...d.querySelectorAll(".gw")]); if (ow.length) withw++;
        ow.forEach((g) => { const k = `${g.textContent} → ${GLOSS.entry(g.dataset.k).w}: ${GLOSS.entry(g.dataset.k).en}`; f[k] = (f[k] || 0) + 1; });
        pa.remove(); ops.forEach((d) => d.remove()); } }
    return { qs, withw, f }; });
  console.log("transitions/grammar questions:", r.qs, "| with an underlined option after answering:", r.withw);
  console.log(Object.entries(r.f).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}× ${k}`).join("\n")); await br.close(); })();
