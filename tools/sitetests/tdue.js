// «Сегодня»: cabinet tasks due yesterday, today, tomorrow, in a week, no date → what the student reads
const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 } }); await ctx.route(/docs\.google\.com/, (r) => r.abort());
  const iso = (d) => { const t = new Date(Date.now() + d * 864e5); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`; };
  const tasks = [[-1, "вчера"], [0, "сегодня"], [1, "завтра"], [7, "через неделю"], [null, "без срока"]].map(([d, n], i) => ({ id: "t" + i, at: Date.now() - 864e5, due: d === null ? "" : iso(d), note: "", kind: "own", t: "Задание " + n, href: "", rk: null }));
  await ctx.addInitScript((T) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("tasks", JSON.stringify(T)); }, tasks);
  const pg = await ctx.newPage(); await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(800);
  console.log(await pg.evaluate(() => [...document.querySelectorAll(".tk li, [class*=tk-] , .td-tasks li")].map((x) => x.innerText.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 8).join("\n")));
  await br.close(); })();
