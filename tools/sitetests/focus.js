// WCAG 2.4.7: every focusable element must look different when focused by keyboard. Tab through each page and compare styles.
const { chromium } = require("playwright");
const pages = [["http://127.0.0.1:8767/", ["index.html", "plan.html", "vocab.html", "reading.html", "practice.html", "mock.html", "useful.html", "desmos.html"]], ["http://127.0.0.1:8766/", ["ru/index.html"]]];
(async () => { const br = await chromium.launch(); const bad = {};
  for (const [base, list] of pages) for (const p of list) {
    const pg = await br.newPage({ viewport: { width: 1280, height: 900 } });
    await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); });
    await pg.goto(base + p, { waitUntil: "networkidle" }); await pg.waitForTimeout(400);
    for (let i = 0; i < 45; i++) {
      await pg.keyboard.press("Tab");
      const r = await pg.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null;
        const sig = (s) => [s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0 ? s.outlineStyle + s.outlineWidth + s.outlineColor : "", s.boxShadow, s.backgroundColor, s.color, s.borderColor, s.textDecorationLine + s.textDecorationStyle].join("|");
        const on = sig(getComputedStyle(e)); const tmp = document.createElement("button"); // compare with the same element unfocused
        e.blur(); const off = sig(getComputedStyle(e)); e.focus({ preventScroll: true });
        const d = `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${e.className && typeof e.className === "string" ? "." + e.className.split(" ").slice(0, 2).join(".") : ""}`;
        return { d, same: on === off, text: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 24) }; });
      if (!r) continue; if (r.same) { const k = `${p}: ${r.d}`; if (!bad[k]) bad[k] = r.text; }
    }
    await pg.close(); }
  const keys = Object.keys(bad); console.log(keys.length ? keys.map((k) => `NO VISIBLE FOCUS  ${k}  «${bad[k]}»`).join("\n") : "every focused element changes its look"); await br.close(); })();
