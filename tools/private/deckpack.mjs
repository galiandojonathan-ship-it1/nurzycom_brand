// Puts a lesson presentation on the lesson account's home page («Пульт урока», classroom.js): one encrypted image per slide.
// usage: node tools/private/deckpack.mjs <key.b64> <lesson tag, e.g. V02> "<title>" <deck.pdf | folder of slide images>
//        node tools/private/deckpack.mjs <key.b64> <tag> --remove
// A PDF is turned into JPEG slides with pdftoppm (1600 px on the long side). Slides go to docs/q/decks/<random>/<n>.bin
// (12-byte IV + AES-GCM of the image bytes, like every bundle) and the list to docs/data/decks.bin:
// { decks: [{ id, title, n, w, h, fmt, dir }] }. A new upload of the same tag replaces the old slides.
import { webcrypto as C } from "node:crypto"; import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { execFileSync } from "node:child_process"; import { fileURLToPath } from "node:url";
const [keyfile, tag, title, src] = process.argv.slice(2);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."), DOCS = process.env.DOCS || path.join(ROOT, "docs");
const INDEX = path.join(DOCS, "data/decks.bin");
if (!keyfile || !tag || !title) { console.error('usage: deckpack.mjs <key.b64> <TAG> "<title>" <pdf|dir>  |  <key.b64> <TAG> --remove'); process.exit(1); }
const key = await C.subtle.importKey("raw", Buffer.from(fs.readFileSync(keyfile, "utf8").trim(), "base64"), "AES-GCM", false, ["encrypt", "decrypt"]);
const seal = async (bytes) => { const iv = C.getRandomValues(new Uint8Array(12)); return Buffer.concat([Buffer.from(iv), Buffer.from(await C.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes))]); };
const open = async (buf) => Buffer.from(await C.subtle.decrypt({ name: "AES-GCM", iv: buf.subarray(0, 12) }, key, buf.subarray(12)));
const index = fs.existsSync(INDEX) ? JSON.parse((await open(fs.readFileSync(INDEX))).toString("utf8")) : { v: 1, decks: [] };
const old = index.decks.find((d) => d.id === tag);
const drop = () => { if (old && old.dir && /^q\/decks\/[a-f0-9]+$/.test(old.dir)) fs.rmSync(path.join(DOCS, old.dir), { recursive: true, force: true }); index.decks = index.decks.filter((d) => d.id !== tag); };
if (title === "--remove") { drop(); fs.writeFileSync(INDEX, await seal(Buffer.from(JSON.stringify(index)))); console.log(`removed ${tag}; ${index.decks.length} decks left`); process.exit(0); }
if (!src || !fs.existsSync(src)) { console.error("no such file or folder: " + src); process.exit(1); }

let files = [], tmp = null;
if (fs.statSync(src).isFile() && /\.pdf$/i.test(src)) {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "deck-"));
  execFileSync("pdftoppm", ["-jpeg", "-jpegopt", "quality=82", "-scale-to", "1600", src, path.join(tmp, "s")]);
  files = fs.readdirSync(tmp).map((f) => path.join(tmp, f));
} else files = fs.readdirSync(src).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).map((f) => path.join(src, f));
files.sort((a, b) => path.basename(a).localeCompare(path.basename(b), "en", { numeric: true }));
if (!files.length) { console.error("no slides found"); process.exit(1); }
const fmt = { jpg: "jpeg", jpeg: "jpeg", png: "png", webp: "webp" }[path.extname(files[0]).slice(1).toLowerCase()];
let w = 16, h = 9; try { [w, h] = execFileSync("identify", ["-format", "%w %h", files[0] + "[0]"]).toString().trim().split(" ").map(Number); } catch (e) { /* 16:9 */ }
drop();
const dir = "q/decks/" + Buffer.from(C.getRandomValues(new Uint8Array(6))).toString("hex");
fs.mkdirSync(path.join(DOCS, dir), { recursive: true });
let bytes = 0;
for (const [i, f] of files.entries()) { const b = await seal(fs.readFileSync(f)); bytes += b.length; fs.writeFileSync(path.join(DOCS, dir, `${i + 1}.bin`), b); }
index.decks.push({ id: tag, title, n: files.length, w, h, fmt, dir });
index.decks.sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
fs.writeFileSync(INDEX, await seal(Buffer.from(JSON.stringify(index))));
// checked by opening the list and the first slide again
const back = JSON.parse((await open(fs.readFileSync(INDEX))).toString("utf8")), first = await open(fs.readFileSync(path.join(DOCS, dir, "1.bin")));
if (!back.decks.some((d) => d.id === tag) || first.length !== fs.readFileSync(files[0]).length) throw new Error("check failed");
if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${tag}: ${files.length} slides, ${w}×${h}, ${(bytes / 1048576).toFixed(1)} MB → ${dir}; ${back.decks.length} decks in data/decks.bin`);
