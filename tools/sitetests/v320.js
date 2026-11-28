// Vocabulary decks P13–P19 at 320px: sideways scroll, small targets, clipped text, in cards, test and list
const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 320, height: 640 } }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.removeItem("vocab_sel"); });
  await pg.goto("http://127.0.0.1:8767/vocab.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(500);
  const audit = async (label) => { const r = await pg.evaluate(() => { const sw = document.documentElement.scrollWidth - innerWidth;
      const small = [...document.querySelectorAll("button, a, input, select, [role=button]")].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.height && getComputedStyle(e).visibility !== "hidden" && (b.width < 24 || b.height < 24) && !e.closest(".sr-only,.skip"); }).map((e) => (e.id || e.className || e.tagName) + " " + Math.round(e.getBoundingClientRect().width) + "×" + Math.round(e.getBoundingClientRect().height)).slice(0, 6);
      const clip = [...document.querySelectorAll("#v-run *, #v-start *")].filter((e) => e.children.length === 0 && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== "visible").map((e) => (e.id || e.className) + ":" + e.textContent.slice(0, 20)).slice(0, 5);
      return { sw, small, clip }; }); console.log(label.padEnd(12), "sideways:", r.sw, "| small:", r.small.join(", ") || "none", "| clipped:", r.clip.join(", ") || "none"); };
  await audit("start");
  const p = await pg.$$eval('#lessons .tile', (a) => a.filter((t) => /^P1[3-9]$/.test(t.dataset.l)).map((t) => t.dataset.l)); console.log("P decks:", p.join(" "));
  for (const t of p.slice(0, 2)) await pg.click(`#lessons .tile[data-l="${t}"]`); await pg.waitForTimeout(300); await audit("selected");
  const modes = await pg.$$eval("#start-modes button, #start-modes a", (a) => a.map((b) => b.textContent.trim())); console.log("modes:", modes.join(" | "));
  for (const m of modes) { await pg.goto("http://127.0.0.1:8767/vocab.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(300); for (const t of p.slice(0, 2)) await pg.click(`#lessons .tile[data-l="${t}"]`);
    await pg.click(`#start-modes >> text="${m}"`).catch(() => {}); await pg.waitForTimeout(500); await audit(m.slice(0, 12)); }
  console.log("errors:", errs.length ? errs : "none"); await br.close(); })();
