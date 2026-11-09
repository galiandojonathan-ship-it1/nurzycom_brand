// Fake class for the «Анализ группы» test: 6 students, homework V01/V02/M01 and PR2 (both sections), answers built from the real keys.
// A shared trap is planted on V01 p2 №3 and PR2 RW module 1 №5 (everybody who misses picks the same wrong letter).
import { webcrypto as C } from "node:crypto"; import fs from "node:fs";
const [keyfile, docs, out] = process.argv.slice(2);
const key = await C.subtle.importKey("raw", Buffer.from(fs.readFileSync(keyfile, "utf8").trim(), "base64"), "AES-GCM", false, ["decrypt"]);
const open = async (f) => { const u = new Uint8Array(fs.readFileSync(`${docs}/${f}`)); return JSON.parse(new TextDecoder().decode(await C.subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, key, u.slice(12)))); };
const L = (await open("data/lessons.bin")).lessons, M = (await open("data/mocks.bin")).mocks;
let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const other = (a) => "ABCD".replace(a, "")[Math.floor(rnd() * 3)];
const rows = [["Timestamp", "Student", "Lesson", "Part", "Answers", "Score", "Wrong", "Seconds", "Attempt"]];
const names = ["Aru K", "Bek S", "Dana M", "Erlan T", "Zhan B", "Mira O"];
for (const [si, nm] of names.entries()) {
  for (const tag of ["V01", "V02", "M01"]) for (const p of L.find((l) => l.tag === tag).parts.slice(0, 3)) {
    const b = await open(p.b); const wrong = [], ans = [];
    for (const q of b) { const miss = (tag === "V01" && p.id === "p2" && q.n === 3) ? si < 5 : rnd() < 0.25 + si * 0.03;
      const pick = q.t === "mc" ? (miss ? (tag === "V01" && p.id === "p2" && q.n === 3 ? "ABCD".replace(q.ans, "")[0] : other(q.ans)) : q.ans) : (miss ? "999" : String([].concat(q.ans)[0]));
      if (miss) wrong.push(q.n); ans.push(`${q.n}:${pick}`); }
    rows.push([`05/11/2026 1${si}:00:00`, nm, tag, `${p.id} · ${p.title} · экран`, ans.join(" "), `${b.length - wrong.length}/${b.length}`, wrong.join(","), "600", "1"]);
    if (si === 0) rows.push([`06/11/2026 10:00:00`, nm, tag, `${p.id} · ${p.title} · экран`, ans.join(" ").replace(/:[A-D]/g, ":A"), `${b.length}/${b.length}`, "", "500", "2"]);   // a retry: must not count
  }
  const pr = M.find((m) => m.id === "PR2");
  for (const S of pr.sections) {
    const b = await open(S.b); const parts = [], wrong = []; let m1 = 0, m2 = 0;
    for (const [mi, mod] of [[1, "m1"], [2, "m2h"]]) b.mods[mod].forEach((q, i) => { const k = `${mi}.${i + 1}`;
      const miss = (S.k === "rw" && mod === "m1" && i === 4) ? si < 4 : rnd() < (mod === "m2h" ? 0.45 : 0.2);
      const pick = q.t === "mc" ? (miss ? (S.k === "rw" && mod === "m1" && i === 4 ? "ABCD".replace(q.ans, "")[1] : other(q.ans)) : q.ans) : (miss ? "0" : q.ans.split(" (")[0]);
      if (miss) wrong.push(k); else mi === 1 ? m1++ : m2++; parts.push(`${k}:${pick}`); });
    const n = b.mods.m1.length;
    rows.push([`07/11/2026 1${si}:00:00`, nm, "PR2", `${S.k === "rw" ? "RW" : "Math"} · M1 ${m1}/${n} · M2 сложный ${m2}/${n}`, parts.join(" "), `${m1 + m2}/${2 * n}`, wrong.join(","), "3600", "1"]);
  }
}
fs.writeFileSync(out, rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(",")).join("\n"));
console.log("rows", rows.length - 1);
