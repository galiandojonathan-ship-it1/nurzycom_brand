const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1280, height: 900 } }); const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message)); pg.on("dialog", (d) => d.accept());
  await pg.addInitScript(() => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("hw_student", "Test S"); });
  const gl = []; pg.on("request", (r) => /vocab\.bin|mockgloss\.bin/.test(r.url()) && gl.push(r.url().split("/").pop()));
  await pg.goto("http://127.0.0.1:8767/mock.html", { waitUntil: "networkidle" });
  console.log("mock page loaded, word data requested before a test:", gl.length ? gl : "none");
  await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "networkidle" }); console.log("homework page, word data requested on load:", gl.length ? gl : "none", "| errors:", errs.length ? errs : "none");
  await br.close(); })();
