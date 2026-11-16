// Open or seal one encrypted data file of the course site (docs/data/*.bin, docs/q/**/*.bin): AES-GCM with the master key,
// format = 12-byte IV + ciphertext of the UTF-8 text (JSON). Same format the site reads with SITE.open / SITE.json.
// usage:
//   node tools/private/datafile.mjs open <master_key.b64> docs/data/vocab.bin <scratchpad>/vocab.json
//   node tools/private/datafile.mjs seal <master_key.b64> <scratchpad>/vocab.json docs/data/vocab.bin
// Keep the opened JSON in the session scratchpad, never in the repository (the repository is public).
import { webcrypto as C } from "node:crypto"; import fs from "node:fs";
const [cmd, keyfile, inp, out] = process.argv.slice(2);
if (!["open", "seal"].includes(cmd) || !keyfile || !inp || !out) { console.error("usage: datafile.mjs open|seal <key.b64> <in> <out>"); process.exit(1); }
const key = await C.subtle.importKey("raw", Buffer.from(fs.readFileSync(keyfile, "utf8").trim(), "base64"), "AES-GCM", false, ["encrypt", "decrypt"]);
if (cmd === "open") {
  const u = new Uint8Array(fs.readFileSync(inp));
  fs.writeFileSync(out, Buffer.from(await C.subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, key, u.slice(12))));
} else {
  const text = fs.readFileSync(inp, "utf8");
  if (inp.endsWith(".json")) JSON.parse(text);   // refuse to seal broken JSON
  const iv = C.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await C.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text)));
  fs.writeFileSync(out, Buffer.concat([Buffer.from(iv), Buffer.from(ct)]));
}
console.log(cmd, "→", out);
