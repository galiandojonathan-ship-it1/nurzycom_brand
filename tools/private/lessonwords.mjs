// Words marked in lessons («Режим урока», lesson.js) → the vocabulary deck «VL · Слова с уроков» in docs/data/vocab.bin.
// A «V» deck is underlined in tests and homework by gloss.js and is listed on the vocabulary page, like every course deck.
// The definitions are written by a person or by Claude in the /lesson-review skill, never generated here.
//
// 1. pending: the marked words that are not yet in any course deck and were not set aside, with their sentences
//    node tools/private/lessonwords.mjs pending <key.b64> <sessions.json from lessonlog.js> > <scratchpad>/pending.json
// 2. apply: add the defined words (and the set-aside ones) to the deck, sealed again with the master key
//    node tools/private/lessonwords.mjs apply <key.b64> <defs.json>
//    defs.json: { "add": [{ "w": "interspersing", "en": "intersperse", "pos": "v", "ru": "перемежать, вкраплять", "def": "…", "ex": "…", "from": ["V07.p3.14"] }],
//    («w»: the form(s) marked in the lesson, so the lesson home page knows they are done)
//                 "skip": [{ "w": "Bamboo", "why": "name of a plant the passage explains" }] }
// Opened JSON stays in memory; only the sealed vocab.bin is written.
import { webcrypto as C } from "node:crypto"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const [mode, keyfile, file] = process.argv.slice(2);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const VOCAB = process.env.VOCAB || path.join(ROOT, "docs/data/vocab.bin");
if (!["pending", "apply"].includes(mode) || !keyfile || !file) { console.error("usage: lessonwords.mjs pending|apply <key.b64> <file>"); process.exit(1); }
const raw = Buffer.from(fs.readFileSync(keyfile, "utf8").trim(), "base64");
const key = await C.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
const open = async (p) => { const u = fs.readFileSync(p); return JSON.parse(new TextDecoder().decode(await C.subtle.decrypt({ name: "AES-GCM", iv: u.subarray(0, 12) }, key, u.subarray(12)))); };
const seal = async (obj) => { const iv = C.getRandomValues(new Uint8Array(12)); return Buffer.concat([Buffer.from(iv), Buffer.from(await C.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(obj))))]); };
const norm = (w) => String(w || "").toLowerCase().replace(/[“”"«»()[\]]/g, "").replace(/[.,;:!?]+$/g, "").replace(/\s+/g, " ").trim();
const V = await open(VOCAB);
const DECK = { tag: "VL", title: "SAT Verbal · Слова с уроков", groups: [{ name: "Слова", items: [] }], skip: [] };
let deck = V.lessons.find((l) => l.tag === "VL");
// the course words (any deck) and their simple forms, so a word already underlined is not added twice
const known = new Set(); V.lessons.forEach((l) => l.groups.forEach((g) => g.items.forEach((it) => String(it.en).toLowerCase().replace(/\([^)]*\)/g, " ").split(/\s*[\/;,]\s*/).forEach((v) => { const s = v.replace(/^to\s+/, "").trim(); if (s) known.add(s); }))));
const stem = (w) => [w, w.replace(/(ies)$/, "y"), w.replace(/(es|s)$/, ""), w.replace(/(ed|d)$/, ""), w.replace(/ed$/, "e"), w.replace(/ing$/, ""), w.replace(/ing$/, "e"), w.replace(/ly$/, "")];
const isKnown = (w) => stem(norm(w)).some((s) => known.has(s));

if (mode === "pending") {
  const sessions = JSON.parse(fs.readFileSync(file, "utf8")), skip = new Set(((deck && deck.skip) || []).map((x) => norm(x.w)));
  ((deck && deck.groups[0].items) || []).forEach((it) => [it.en].concat(it.marked || []).forEach((w) => skip.add(norm(w))));   // done already
  const P = {};
  for (const s of sessions) {
    if (!s.t1) continue;   // a lesson still running is taken next time
    for (const e of s.ev.filter((x) => x.k === "word")) {
      const w = norm(e.w); if (w.length < 2 || skip.has(w)) continue;
      const p = (P[w] = P[w] || { w: e.w, known: isKnown(w), n: 0, sessions: [], groups: [], ctx: [], q: [] });
      p.n++; if (!p.sessions.includes(s.id)) p.sessions.push(s.id); if (!p.groups.includes(s.group)) p.groups.push(s.group);
      if (e.ctx && !p.ctx.includes(e.ctx)) p.ctx.push(e.ctx); if (e.q && !p.q.includes(e.q)) p.q.push(e.q);
    }
  }
  const out = Object.values(P).sort((a, b) => b.n - a.n || a.w.localeCompare(b.w));
  console.log(JSON.stringify({ deck: deck ? deck.groups[0].items.length : 0, already: out.filter((x) => x.known).map((x) => x.w), pending: out.filter((x) => !x.known) }, null, 1));
} else {
  const D = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!deck) { deck = JSON.parse(JSON.stringify(DECK)); const i = V.lessons.findIndex((l) => l.tag === "V12"); V.lessons.splice(i >= 0 ? i + 1 : V.lessons.length, 0, deck); }
  deck.skip = deck.skip || []; const items = deck.groups[0].items; let added = 0, skipped = 0;
  for (const it of D.add || []) {
    if (!it.en || !it.ru || !it.def) throw new Error("every added word needs en, ru and def: " + JSON.stringify(it));
    if (items.some((x) => norm(x.en) === norm(it.en)) || isKnown(it.en)) continue;
    items.push({ en: it.en, pos: it.pos || "", ru: Array.isArray(it.ru) ? it.ru.join(", ") : it.ru, def: it.def, ex: it.ex || "", from: it.from || [], marked: [].concat(it.w || []).filter(Boolean), at: new Date().toISOString().slice(0, 10) }); added++;
  }
  for (const x of D.skip || []) if (!deck.skip.some((y) => norm(y.w) === norm(x.w))) { deck.skip.push({ w: x.w, why: x.why || "" }); skipped++; }
  fs.writeFileSync(VOCAB, await seal(V));
  const back = await open(VOCAB);   // checked by opening it again
  const d2 = back.lessons.find((l) => l.tag === "VL");
  console.log(`added ${added}, set aside ${skipped}; deck VL now ${d2.groups[0].items.length} words, ${d2.skip.length} set aside → ${path.relative(ROOT, VOCAB)}`);
}
