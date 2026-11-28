// Links Bluebook catalog questions to the same questions inside the course: workbook parts (lessons.bin) and practice tests
// (mocks.bin). Fingerprints from fingerprints.py; the same normalisation here. Writes `c: [course question ids]` into the catalog
// items, ids in the form the teacher pages use: «V03.p2.4» (lesson.part.question), «PT15.rw.m1.12» (test.section.module.question).
// Only ids are added: no text. usage: node link_course.mjs <master_key.b64> <catalog.json> <fp.json> <out.json>
import { webcrypto as C, createHash } from "node:crypto"; import fs from "node:fs"; import path from "node:path";
const [keyFile, catFile, fpFile, outFile] = process.argv.slice(2);
const DOCS = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../docs");
const key = await C.subtle.importKey("raw", Buffer.from(fs.readFileSync(keyFile, "utf8").trim(), "base64"), "AES-GCM", false, ["decrypt"]);
const open = async (rel) => { const u = new Uint8Array(fs.readFileSync(path.join(DOCS, rel))); return JSON.parse(new TextDecoder().decode(await C.subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, key, u.slice(12)))); };
const norm = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&[a-zA-Z0-9#]+;/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const fps = (q) => { const a = norm(q.stim) + "|" + norm(q.stem), h = (s) => createHash("sha1").update(s).digest("hex").slice(0, 16);
  return [h(a), h(a + "|" + (q.opts || []).map(norm).join("|"))]; };
const cat = JSON.parse(fs.readFileSync(catFile, "utf8")), fp = JSON.parse(fs.readFileSync(fpFile, "utf8"));
const byFull = new Map(), byLoose = new Map();
for (const [id, [loose, full]] of Object.entries(fp)) { byFull.set(full, id); if (!byLoose.has(loose)) byLoose.set(loose, []); byLoose.get(loose).push(id); }
const links = {}; let seen = 0, exact = 0, loose1 = 0;
const add = (q, ref) => {
  if (q.own === true) return; seen++;
  const [l, f] = fps(q); let id = byFull.get(f);
  if (id) exact++; else { const c = byLoose.get(l); if (c && c.length === 1) { id = c[0]; loose1++; } }   // options differ in markup only
  if (id) (links[id] = links[id] || []).push(ref);
};
const lessons = (await open("data/lessons.bin")).lessons;
for (const L of lessons) for (const P of L.parts || []) { if (!P.b) continue; let items; try { items = await open(P.b); } catch (e) { continue; }
  (Array.isArray(items) ? items : []).forEach((q) => add(q, `${L.tag}.${P.id}.${q.n}`)); }
const mocks = (await open("data/mocks.bin")).mocks;
for (const M of mocks) for (const S of M.sections || []) { let b; try { b = await open(S.b); } catch (e) { continue; }
  for (const [mod, items] of Object.entries(b.mods || {})) items.forEach((q, i) => add(q, `${M.id}.${S.k}.${mod}.${q.n || i + 1}`)); }
let linked = 0;
for (const [id, refs] of Object.entries(links)) if (cat.items[id]) { cat.items[id].c = [...new Set(refs)]; linked++; }
fs.writeFileSync(outFile, JSON.stringify(cat));
console.log(`course questions from the bank: ${seen} · matched exactly ${exact}, by text without options ${loose1} · Bluebook items linked to the course: ${linked}/${Object.keys(fp).length}`);
const per = {}; for (const refs of Object.values(links)) for (const r of refs) { const k = r.split(".")[0].replace(/\d+$/, (d) => (/^PT/.test(r) ? d : "")); per[k] = (per[k] || 0) + 1; }
console.log("links by place:", Object.entries(per).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => `${k} ${v}`).join(" · "));
