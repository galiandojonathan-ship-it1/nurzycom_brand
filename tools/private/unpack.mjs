// Opens a .bin made by pack.mjs. usage: node tools/private/unpack.mjs <master_key.b64> <in.bin> <out dir>
import { webcrypto as C } from "node:crypto"; import fs from "node:fs"; import path from "node:path";
const [keyfile, inp, outDir] = process.argv.slice(2);
if (!keyfile || !inp || !outDir) { console.error("usage: unpack.mjs <key.b64> <in.bin> <out dir>"); process.exit(1); }
const key = await C.subtle.importKey("raw", Buffer.from(fs.readFileSync(keyfile, "utf8").trim(), "base64"), "AES-GCM", false, ["decrypt"]);
const u = new Uint8Array(fs.readFileSync(inp));
const { files, at } = JSON.parse(new TextDecoder().decode(await C.subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, key, u.slice(12))));
for (const [p, t] of Object.entries(files)) { const f = path.join(outDir, p); if (!path.resolve(f).startsWith(path.resolve(outDir))) continue; fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, t); }
console.log(`unpacked ${Object.keys(files).length} files (packed ${at}) → ${outDir}`);
