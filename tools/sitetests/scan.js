const { chromium } = require("playwright"); const fs = require("fs");
(async () => { const br = await chromium.launch(); const pg = await br.newPage();
  await pg.addInitScript(() => localStorage.setItem("site_pw", "fixture-pw"));
  await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "networkidle" });
  const r = await pg.evaluate(async () => {
    await GLOSS.ready; GLOSS.on = true;
    const WIC = /most logical and precise word or phrase|what does the word .{1,40} most nearly mean/i, GIVE = /most logical transition|conventions of standard english/i;
    const L = await SITE.json("lessons"), out = [];
    for (const l of L.lessons.filter((x) => x.tag[0] === "V" && !/^VA/.test(x.tag))) for (const p of l.parts) {
      const items = JSON.parse(new TextDecoder().decode(await SITE.open(await (await fetch(p.b)).arrayBuffer())));
      for (const q of items) {
        const t = (q.stem || "").replace(/<[^>]+>/g, " ");
        const box = document.createElement("div"), pa = document.createElement("div"), st = document.createElement("div");
        pa.innerHTML = q.stim || ""; st.innerHTML = q.stem || ""; box.append(pa, st);
        const ops = (q.opts || []).map((o) => { const d = document.createElement("div"); d.innerHTML = o; box.append(d); return d; });
        document.body.append(box);
        let kind = WIC.test(t) ? "wic" : GIVE.test(t) ? "give" : "other", words = [];
        if (kind !== "wic") { GLOSS.apply([pa].concat(kind === "give" ? [] : ops), { wide: true }); words = [...box.querySelectorAll(".gw")].map((x) => `${x.textContent}→${x.dataset.k}`); }
        out.push({ l: l.tag, p: p.id, n: q.n, kind, words });
        box.remove();
      }
    }
    return out;
  });
  fs.writeFileSync(__dirname + "/scan.json", JSON.stringify(r)); await br.close();
  const by = (f) => r.filter(f).length;
  console.log("questions:", r.length, "| WIC skipped:", by((x) => x.kind === "wic"), "| transitions/grammar (options held back):", by((x) => x.kind === "give"), "| other:", by((x) => x.kind === "other"));
  const nonw = r.filter((x) => x.kind !== "wic");
  console.log("non-WIC with ≥1 word:", nonw.filter((x) => x.words.length).length, "of", nonw.length, "| avg words:", (nonw.reduce((a, x) => a + x.words.length, 0) / nonw.length).toFixed(2));
  const freq = {}; nonw.forEach((x) => x.words.forEach((w) => (freq[w] = (freq[w] || 0) + 1)));
  console.log("distinct word hits:", Object.keys(freq).length);
  console.log(Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 60).map(([w, c]) => `${w}(${c})`).join("  "));
})();
