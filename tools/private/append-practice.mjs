// Add an authored set to an encrypted practice catalog without replacing historical sets.
// node tools/private/append-practice.mjs <key.b64> <author.json> <existing.bin> <new.bin>
import assert from "node:assert/strict";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const [keyPath, authorPath, inputPath, outputPath, ...extra] = process.argv.slice(2);
if (!outputPath || extra.length) {
  console.error("Usage: node tools/private/append-practice.mjs <key.b64> <author.json> <existing.bin> <new.bin>");
  process.exit(1);
}
const key = Buffer.from(readFileSync(keyPath, "utf8").trim(), "base64");
assert.equal(key.length, 32, "Expected a 256-bit course key");

function seal(data) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  return Buffer.concat([iv, encrypted, cipher.getAuthTag()]);
}

const input = readFileSync(inputPath);
const decipher = createDecipheriv("aes-256-gcm", key, input.subarray(0, 12));
decipher.setAuthTag(input.subarray(-16));
const catalog = JSON.parse(Buffer.concat([decipher.update(input.subarray(12, -16)), decipher.final()]).toString("utf8"));
const { id, title, en, category, minutes, gloss, questions } = JSON.parse(readFileSync(authorPath, "utf8"));

assert(typeof id === "string" && /^X\d{2}$/.test(id), "Invalid set ID");
assert(!catalog.sets.some((set) => set.id === id), "Set ID already exists");
const text = (value) => typeof value === "string" && value.trim().length > 0;
assert(text(title) && text(en) && ["mixed", "literature"].includes(category));
assert(Number.isInteger(minutes) && minutes > 0);
assert.equal(questions.length, 12, "A hard set must have twelve questions");

const seenWords = new Set();
const keyCounts = { A: 0, B: 0, C: 0, D: 0 };
const salt = randomBytes(16).toString("hex");
const q = questions.map(({ i, t, pattern, b, s, o, a, x, traps, w }, index) => {
  const number = `Question ${index + 1}`;
  assert.equal(i, index + 1, number);
  assert(text(t) && text(pattern) && text(x) && text(s), number);
  assert(Array.isArray(b) && b.length > 0, number);
  for (const block of b) {
    const valid = block.k === "p" || block.k === "h" ? text(block.v)
      : block.k === "ul" ? Array.isArray(block.v) && block.v.length > 0 && block.v.every(text)
      : block.k === "table" && text(block.c) && Array.isArray(block.rows) && block.rows.length >= 2
        && Array.isArray(block.rows[0]) && block.rows[0].length >= 2
        && block.rows.every((row) => Array.isArray(row) && row.length === block.rows[0].length && row.every(text));
    assert(valid, `${number} has an invalid passage block`);
  }
  assert(Array.isArray(o) && o.length === 4 && o.every(text) && new Set(o).size === 4, number);
  assert(Object.hasOwn(keyCounts, a), `${number} has an invalid answer`);
  keyCounts[a]++;
  assert.deepEqual(Object.keys(traps).sort(), [..."ABCD"].filter((letter) => letter !== a), `${number} needs three distractor explanations`);
  assert(Object.values(traps).every(text), number);

  const marked = new Set();
  const richText = [s, ...o, ...b.flatMap((block) => block.k === "p" || block.k === "ul" ? block.v : [])];
  for (const content of richText) {
    const plain = content.replace(/\[\[([^|\[\]]+)\|([^|\[\]]+)\]\]/g, (_, surface, lemma) => {
      const entry = Object.hasOwn(gloss, lemma) && gloss[lemma];
      assert(text(surface) && entry && text(entry.en) && text(entry.ru) && /^V(?:\d{2}|A|L)$/.test(entry.l),
        `${number} has an unknown course word: ${lemma}`);
      marked.add(lemma);
      seenWords.add(lemma);
      return surface;
    });
    assert(!/\[\[|\]\]/.test(plain), `${number} has a broken glossary mark`);
  }
  assert(marked.size >= 5, `${number} needs at least five distinct course words`);
  assert.deepEqual(w, [...marked], `${number} glossary list does not match the passage and choices`);
  const h = createHash("sha256").update(`${salt}:${i}:${a}`).digest("hex").slice(0, 16);
  return { i, b, s, o, h, x: seal({ a, t, x }).toString("base64"), w };
});
assert(Object.values(keyCounts).every((count) => count === 3), "Distribute the 12 keys evenly across A–D");

catalog.gloss ||= {};
for (const word of seenWords) {
  const original = Object.hasOwn(catalog.gloss, word) ? catalog.gloss[word] : null;
  if (original) assert.equal(original.en.toLowerCase(), gloss[word].en.toLowerCase(), `Conflicting glossary entry: ${word}`);
  else Object.defineProperty(catalog.gloss, word, { value: gloss[word], enumerable: true });
}
catalog.sets.push({ id, title, en, category, minutes, salt, q });
writeFileSync(outputPath, seal(catalog), { flag: "wx", mode: 0o600 });
console.log(`${id}: ${q.length} questions, ${seenWords.size} course terms; ${catalog.sets.length - 1} existing sets retained.`);
