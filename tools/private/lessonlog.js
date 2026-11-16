// Reads the lesson-mode sessions (docs/lesson.js) from the lesson account by logging in to the live site, like getkey.js.
// The sessions hold words and sentences from questions, so OUT goes to the session scratchpad, never into the repo.
// usage: L=lesson P=<password> OUT=<scratchpad>/lessons.json node tools/private/lessonlog.js
//        … PRUNE=<id>,<id> node tools/private/lessonlog.js    also removes these reviewed sessions from the account
//        (only after they are saved in notes/private/lesson-log.bin; an unfinished session, t1 = 0, is never removed)
const { chromium } = require("playwright"); const fs = require("fs");
(async () => { const br = await chromium.launch(); const pg = await br.newPage();
  await pg.goto(process.env.SITE_URL || "https://study.bynurzy.com/", { waitUntil: "load", timeout: 30000 });
  await pg.fill("#auth-login", process.env.L); await pg.fill("#auth-pw", process.env.P); await pg.press("#auth-pw", "Enter");
  await pg.waitForFunction(() => sessionStorage.getItem("site_key") || localStorage.getItem("site_key"), null, { timeout: 30000 });
  await pg.waitForSelector(".ls-bar", { timeout: 15000 }); await pg.waitForTimeout(3000);   // the first sync has brought the account's keys
  const all = await pg.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("ls_s_")).map((k) => JSON.parse(localStorage.getItem(k))));
  all.sort((a, b) => a.t0 - b.t0);
  fs.writeFileSync(process.env.OUT, JSON.stringify(all, null, 1), { mode: 0o600 });
  for (const s of all) { const n = (k) => s.ev.filter((e) => e.k === k).length; console.log(`${s.id}  ${new Date(s.t0).toISOString().slice(0, 16)}  ${s.t1 ? Math.round((s.t1 - s.t0) / 60000) + " min" : "not finished"}  words ${n("word")}  flags ${n("flag")}  notes ${n("note")}  votes ${n("vote")}`); }
  const prune = (process.env.PRUNE || "").split(",").filter(Boolean);
  if (prune.length) { const done = await pg.evaluate(async (ids) => { const out = []; for (const id of ids) { const k = "ls_s_" + id, s = JSON.parse(localStorage.getItem(k) || "null"); if (s && s.t1) { localStorage.removeItem(k); out.push(id); } } await SITE.sync(); return out; }, prune);
    await pg.waitForTimeout(2500); console.log("removed from the account:", done.join(", ") || "none"); }
  console.log(`${all.length} sessions → ${process.env.OUT}`); await br.close(); })();
