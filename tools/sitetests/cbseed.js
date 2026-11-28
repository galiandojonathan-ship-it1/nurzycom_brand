// Seeds the local stand-in (8768) with sample student accounts and progress; exports open(page) for cabinet tests.
const ADMIN = "local-admin-key-0123456789abcdef";
async function seed(pg) {
  await pg.goto("http://127.0.0.1:8768/cabinet.html", { waitUntil: "load" }); await pg.waitForTimeout(1500);
  return pg.evaluate(async (ADMIN) => {
    await SITE.ready; SITE.adminKey(ADMIN); await SITE.api("admin/claim", { method: "POST", body: JSON.stringify({ key: ADMIN }) });
    const have = await SITE.api("admin/users"); if (have.ok && have.data.users.length) return "already seeded: " + have.data.users.length;
    const now = Date.now(), D = 864e5, S = [
      ["ayana", "Ayana Seitkali", "V", { hw: [["V01_p3", "20/26", 9], ["V02_p3", "22/26", 6], ["V03_p1", "8/10", 2]], late: 1, mk: ["PT1", "RW 30/54 ≈ 560", 8] }],
      ["dias", "Dias Omarov", "V", { hw: [["V01_p3", "24/26", 10], ["V02_p3", "25/26", 5], ["V03_p3", "21/26", 1]] }],
      ["aruzhan", "Aruzhan Bek", "V", { hw: [["V01_p3", "15/26", 12]], late: 2 }],
      ["timur", "Timur Ali", "V", { hw: [] }],
      ["sher", "Sher Zh", "VM", { hw: [["V01_p3", "23/26", 3], ["M01_p3", "18/22", 2]], mk: ["PT1", "RW 38/54 ≈ 620 · Math 30/44 ≈ 640", 4] }],
      ["mukha", "Mukhamediya K", "V", { hw: [["V05_p3", "25/26", 0]], mk: ["PT2", "RW 44/54 ≈ 700", 2] }],
      ["ansara", "Ansara T", "M", { hw: [["M02_p3", "17/22", 1]] }],
    ];
    for (const [login, name, course, P] of S) {
      const id = await SITE.lid(login), entry = await SITE.account(login, name, "pass-" + login + "-1234");
      await SITE.api("admin/user?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ entry }) });
      const B = { plan_course: { v: course, t: now - 20 * D } };
      for (const [k, v, ago] of P.hw) { B[`hw_last_${name}_${k}`] = { v, t: now - ago * D }; B[`hw_att_${name}_${k}`] = { v: "1", t: now - ago * D }; }
      if (P.mk) B[`mk_last_${name}_${P.mk[0]}`] = { v: P.mk[1], t: now - P.mk[2] * D };
      const tasks = []; for (let i = 0; i < (P.late || 0); i++) tasks.push({ id: "late" + i + login, at: now - 9 * D, due: new Date(now - (3 + i) * D).toISOString().slice(0, 10), note: "", kind: "hw", t: "Урок 2 · Домашнее задание", href: "./?l=V02&p=p3", rk: ["hw_last_", "V04_p3"] });
      if (tasks.length) B.tasks = { v: JSON.stringify(tasks), t: now - 9 * D };
      await SITE.api("admin/progress?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob(B) }) });
    }
    return "seeded " + S.length;
  }, ADMIN);
}
async function page(br, vp) {
  const ctx = await br.newContext({ viewport: vp || { width: 1366, height: 900 } });
  await ctx.addInitScript((A) => { localStorage.setItem("site_pw", "fixture-pw"); localStorage.setItem("site_login", "loop-test"); localStorage.setItem("hw_student", "Loop Test"); localStorage.setItem("admin_key", A); }, ADMIN);
  const pg = await ctx.newPage(); return pg;
}
module.exports = { seed, page, ADMIN };
