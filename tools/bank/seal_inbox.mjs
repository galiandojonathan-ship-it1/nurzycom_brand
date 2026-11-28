// Seals one written question set for the «nurzycom bank» inbox, so it can sit in this public repository.
// Hybrid encryption: a random AES-256-GCM key encrypts the set; the RSA-OAEP public key in inbox_pub.json wraps that key.
// Only Claude (who holds the private key, itself sealed with the course master key) can open it. You cannot open it again.
// usage: node tools/bank/seal_inbox.mjs <set.json>   → notes/bank-inbox/<sub>-<set>.bin
import { webcrypto as C } from "node:crypto"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), repo = path.resolve(here, "../..");
const file = process.argv[2]; if (!file) { console.error("usage: node tools/bank/seal_inbox.mjs <set.json>"); process.exit(1); }
const text = fs.readFileSync(file, "utf8"), d = JSON.parse(text);
if (!d.sub || !Array.isArray(d.questions) || !d.questions.length) { console.error("not a set: needs sub and questions"); process.exit(1); }
const pub = await C.subtle.importKey("jwk", JSON.parse(fs.readFileSync(path.join(here, "inbox_pub.json"), "utf8")), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
const raw = C.getRandomValues(new Uint8Array(32)), iv = C.getRandomValues(new Uint8Array(12));
const aes = await C.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
const body = new Uint8Array(await C.subtle.encrypt({ name: "AES-GCM", iv }, aes, new TextEncoder().encode(text)));
const wrapped = new Uint8Array(await C.subtle.encrypt({ name: "RSA-OAEP" }, pub, raw));
const out = path.join(repo, "notes/bank-inbox", `${d.sub}-${d.set}.bin`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ v: 1, k: Buffer.from(wrapped).toString("base64"), iv: Buffer.from(iv).toString("base64"), d: Buffer.from(body).toString("base64") }));
console.log("sealed →", path.relative(repo, out), `(${d.questions.length} questions)`);
