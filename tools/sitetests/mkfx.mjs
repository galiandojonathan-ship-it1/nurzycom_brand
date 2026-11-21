// Builds a local test copy of docs/ with a throwaway key and fake data (no real questions, no real key).
// usage: node mkfx.mjs <docs dir> <out dir>
import { webcrypto as C } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
const [src, out] = process.argv.slice(2);
execSync(`rm -rf ${out} && cp -r ${src} ${out}`);
const enc = new TextEncoder(), b64 = (u) => Buffer.from(u).toString("base64");
const raw = C.getRandomValues(new Uint8Array(32));
const key = await C.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
async function seal(obj) { const iv = C.getRandomValues(new Uint8Array(12)); return Buffer.from([...iv, ...new Uint8Array(await C.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(obj))))]); }
// access.json: shared password «fixture-pw»
const salt = C.getRandomValues(new Uint8Array(16)), iv = C.getRandomValues(new Uint8Array(12));
const base = await C.subtle.importKey("raw", enc.encode("fixture-pw"), "PBKDF2", false, ["deriveKey"]);
const kek = await C.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 1000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const wrap = b64([...iv, ...new Uint8Array(await C.subtle.encrypt({ name: "AES-GCM", iv }, kek, raw))]);
fs.writeFileSync(path.join(out, "access.json"), JSON.stringify({ v: 1, salt: b64(salt), iter: 1000, wrap }));
const sha = async (t) => Buffer.from(await C.subtle.digest("SHA-256", enc.encode(t))).toString("hex").slice(0, 16);
const SALT = "fx";
const mc = (i, n, stim, stem, opts, ans) => ({ i, n, t: "mc", stim, stem, opts, ans, rat: "<p>Explanation.</p>", own: true });
const V = [
  mc("v1", 1, "<p>The council's decision to <u>undermine</u> the proposal surprised observers, who had expected a ______ response.</p>", "<p>Which choice completes the text with the most logical and precise word or phrase?</p>", ["candid", "devoid", "tentative", "lucid"], "C"),
  mc("v2", 2, "<p>Critics argued that the new policy would undermine public trust, and the report was devoid of any clear evidence. Its authors were notably candid about the gaps.</p>", "<p>Which choice best states the main idea of the text?</p>", ["The report was candid but undermined by weak evidence.", "The policy was popular.", "Critics were wrong.", "Trust increased."], "A"),
  mc("v3", 3, "<p>The museum's collection grew quickly. ______ the curators were candid about the limits of their storage space.</p>", "<p>Which choice completes the text with the most logical transition?</p>", ["Nevertheless,", "Lucidly,", "For example,", "Similarly,"], "A"),
  mc("v4", 4, "<p>As used in the text, the word «lucid» appears in a lucid account of the experiment.</p>", "<p>As used in the text, what does the word «lucid» most nearly mean?</p>", ["Clear", "Bright", "Calm", "Long"], "A"),
];
const M = [mc("m1", 1, "", "<p>If 3x = 12, what is x? The answer is not devoid of meaning.</p>", ["2", "3", "4", "6"], "C")];
const part = async (id, title, mode, items, bundle) => {
  fs.mkdirSync(path.join(out, "q/fx"), { recursive: true });
  fs.writeFileSync(path.join(out, bundle), await seal(items));
  return { id, title, mode, b: bundle, q: await Promise.all(items.map(async (q) => ({ n: q.n, i: q.i, t: q.t, h: [await sha(`${SALT}:${q.i}:${q.ans}`)] }))) };
};
const lessons = { lessons: [
  { tag: "V01", title: "SAT Verbal · Урок 1 · Words in Context", salt: SALT, tip: "Tip.", parts: [await part("p1", "Практика", "learn", V, "q/fx/V01_p1.bin"), await part("p2", "Финальный тест", "test", V, "q/fx/V01_p2.bin")] },
  { tag: "M01", title: "SAT Math · Урок 1 · Linear", salt: SALT, tip: "", parts: [await part("p1", "Практика", "learn", M, "q/fx/M01_p1.bin")] },
] };
const vocab = { lessons: [{ tag: "V01", title: "Урок 1", groups: [{ name: "Слова урока", items: [
  { en: "(to) undermine", ru: "подрывать", def: "to weaken gradually", pos: "v" },
  { en: "devoid of", ru: "лишённый", def: "completely lacking", pos: "adj" },
  { en: "candid", ru: "откровенный", def: "honest and direct", pos: "adj" },
  { en: "lucid", ru: "ясный", def: "easy to understand", pos: "adj" }] }] }] };
const mockgloss = { words: { curators: { w: "curator", pos: "n", en: "a person in charge of a museum collection", ru: ["куратор", "хранитель"] } }, add: {}, skip: {}, off: [] };
fs.writeFileSync(path.join(out, "data/lessons.bin"), await seal(lessons));
fs.writeFileSync(path.join(out, "data/vocab.bin"), await seal(vocab));
fs.writeFileSync(path.join(out, "data/mockgloss.bin"), await seal(mockgloss));
console.log("fixture ready:", out);
