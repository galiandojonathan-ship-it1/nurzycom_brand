// «Задания от преподавателя» with 12 tasks, long titles and notes at 320px: sideways scroll, panel height, overflowing text
const { chromium } = require("playwright");
(async () => { const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 320, height: 640 } }); await ctx.route(/docs\.google\.com/, (r) => r.abort());
  const iso = (d) => { const t = new Date(Date.now() + d * 864e5); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`; };
  const T = Array.from({ length: 12 }, (_, i) => ({ id: "t" + i, at: Date.now() - 864e5, due: iso(i - 3), note: i % 3 ? "" : "Обратите внимание на вопросы 5–8, особенно на трудные слова в вариантах ответов", kind: i % 2 ? "own" : "hw",
    t: i % 4 ? `Урок ${i + 1} · Домашнее задание` : "Supercalifragilisticexpialidocious-длинное-задание-без-пробелов-для-проверки-переноса", href: i % 2 ? "" : "./?l=V03&p=p3", rk: i % 2 ? null : ["hw_last_", "V0" + (i % 9) + "_p3"] }));
  await ctx.addInitScript((T) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("tasks", JSON.stringify(T)); }, T);
  const pg = await ctx.newPage(); await pg.goto("http://127.0.0.1:8767/index.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(800);
  const r = await pg.evaluate(() => { const s = document.querySelector(".td-tasks"); if (!s) return null; const b = s.getBoundingClientRect();
    return { sw: document.documentElement.scrollWidth - innerWidth, h: Math.round(b.height), rows: s.querySelectorAll("li").length, over: [...s.querySelectorAll("li *")].filter((e) => e.getBoundingClientRect().right > innerWidth).map((e) => e.className || e.tagName).slice(0, 4),
      nextTop: Math.round((document.querySelector(".td-next, .td-stats, .td-grid") || s).getBoundingClientRect().top) }; });
  console.log(JSON.stringify(r)); await pg.screenshot({ path: __dirname + "/../tasks320.png", fullPage: false }); await br.close(); })();
