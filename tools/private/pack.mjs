// Encrypts private working files (pattern study, Прогноз sources) into one .bin with the course master key, so they can live in
// the public repo. Same format as docs/data/*.bin: 12-byte IV + AES-GCM ciphertext of JSON { files: { path: text } }.
// usage: node tools/private/pack.mjs <master_key.b64> <out.bin> <file-or-dir>...   (paths are stored relative to their parent dir)
import { webcrypto as C } from "node:crypto"; import fs from "node:fs"; import path from "node:path";
const [keyfile, out, ...ins] = process.argv.slice(2);
if (!keyfile || !out || !ins.length) { console.error("usage: pack.mjs <key.b64> <out.bin> <paths...>"); process.exit(1); }
const key = await C.subtle.importKey("raw", Buffer.from(fs.readFileSync(keyfile, "utf8").trim(), "base64"), "AES-GCM", false, ["encrypt"]);
const files = {};
const add = (p, base) => { const st = fs.statSync(p); if (st.isDirectory()) { for (const f of fs.readdirSync(p)) if (!/^(__pycache__|backup|node_modules)$/.test(f)) add(path.join(p, f), base); } else files[path.relative(base, p)] = fs.readFileSync(p, "utf8"); };
for (const p of ins) add(p, path.dirname(path.resolve(p)));
const iv = C.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await C.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify({ files, at: new Date().toISOString() }))));
fs.writeFileSync(out, Buffer.concat([Buffer.from(iv), Buffer.from(ct)])); console.log(`packed ${Object.keys(files).length} files → ${out}`);
