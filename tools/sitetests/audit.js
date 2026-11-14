// UI/UX audit: axe-core, horizontal overflow, small tap targets, console errors. Pages of the fixture course site and the landing.
const { chromium } = require("playwright");
const fs = require("fs");
const AXE = fs.readFileSync(__dirname + "/node_modules/axe-core/axe.min.js", "utf8");
const C = "http://127.0.0.1:8765/", L = "http://127.0.0.1:8766/";
const pages = [L + "index.html", L + "ru/index.html", C + "index.html", C + "plan.html", C + "vocab.html", C + "mock.html", C + "useful.html", C + "teacher.html", C + "404.html"];
const only = process.argv[2];
(async () => {
  const br = await chromium.launch(); const out = {};
  for (const vp of [{ width: 375, height: 760 }, { width: 1280, height: 900 }]) {
    for (const url of pages.filter((u) => !only || u.includes(only))) {
      const pg = await br.newPage({ viewport: vp }); const errs = [];
      pg.on("pageerror", (e) => errs.push("pageerror: " + e.message));
      pg.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errs.push(m.text()));
      pg.on("requestfailed", (r) => errs.push("reqfail: " + r.url().replace(/^https?:\/\/[^/]+/, "")));
      pg.on("response", (r) => r.status() >= 400 && errs.push(r.status() + " " + r.url().replace(/^https?:\/\/[^/]+/, "")));
      await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Test Student"); });
      try { await pg.goto(url, { waitUntil: "networkidle", timeout: 20000 }); } catch (e) { errs.push("goto: " + e.message.slice(0, 80)); }
      await pg.waitForTimeout(600);
      const r = await pg.evaluate(() => {
        const ov = document.documentElement.scrollWidth - innerWidth;
        const wide = ov > 0 ? [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 && getComputedStyle(e).position !== "fixed"; }).slice(0, 4).map((e) => e.tagName + "." + e.className) : [];
        const small = [...document.querySelectorAll("a,button,input,select,[role=button]")].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.height && (b.height < 24 || b.width < 24) && getComputedStyle(e).visibility !== "hidden"; }).slice(0, 6).map((e) => `${e.tagName}${e.id ? "#" + e.id : ""}.${String(e.className).slice(0, 20)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)} «${(e.textContent || "").trim().slice(0, 18)}»`);
        return { ov, wide, small };
      });
      await pg.addScriptTag({ content: AXE });
      const axe = await pg.evaluate(async () => (await axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => `${v.impact} ${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`));
      out[`${vp.width} ${url.replace(/^http:\/\/127.0.0.1:/, "")}`] = { ...r, axe, errs: [...new Set(errs)].slice(0, 6) };
      await pg.close();
    }
  }
  await br.close(); console.log(JSON.stringify(out, null, 1));
})();
