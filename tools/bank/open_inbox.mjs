// Claude only: opens sealed inbox sets with the private key. usage: node tools/bank/open_inbox.mjs <private.jwk.json> <out dir> [files…]
// (the private key: unpack notes/private/bank-inbox-key.bin with tools/private/unpack.mjs and the master key)
import { webcrypto as C } from "node:crypto"; import fs from "node:fs"; import path from "node:path";
const [keyf, outDir, ...files] = process.argv.slice(2);
const prv = await C.subtle.importKey("jwk", JSON.parse(fs.readFileSync(keyf, "utf8")), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
const list = files.length ? files : fs.readdirSync("notes/bank-inbox").filter((f) => f.endsWith(".bin")).map((f) => path.join("notes/bank-inbox", f));
fs.mkdirSync(outDir, { recursive: true });
for (const f of list) {
  const e = JSON.parse(fs.readFileSync(f, "utf8")), b = (s) => Buffer.from(s, "base64");
  const raw = await C.subtle.decrypt({ name: "RSA-OAEP" }, prv, b(e.k));
  const aes = await C.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
  const text = new TextDecoder().decode(await C.subtle.decrypt({ name: "AES-GCM", iv: b(e.iv) }, aes, b(e.d)));
  fs.writeFileSync(path.join(outDir, path.basename(f, ".bin") + ".json"), text); console.log("opened", f);
}
