// Local copy of docs/ with the REAL data; access.json re-wrapped under a local test password. Never commit the output.
import { webcrypto as C } from "node:crypto"; import fs from "node:fs"; import { execSync } from "node:child_process";
const [src, out, keyfile] = process.argv.slice(2);
execSync(`rm -rf ${out} && cp -r ${src} ${out}`);
const raw = Buffer.from(fs.readFileSync(keyfile, "utf8").trim(), "base64"), enc = new TextEncoder(), b64 = (u) => Buffer.from(u).toString("base64");
const salt = C.getRandomValues(new Uint8Array(16)), iv = C.getRandomValues(new Uint8Array(12));
const base = await C.subtle.importKey("raw", enc.encode("fixture-pw"), "PBKDF2", false, ["deriveKey"]);
const kek = await C.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 1000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const entry = { v: 1, salt: b64(salt), iter: 1000, wrap: b64([...iv, ...new Uint8Array(await C.subtle.encrypt({ name: "AES-GCM", iv }, kek, raw))]) };
// a local test login «loop-test» (same password) so pages that need a personal login (Сегодня) can be tested
const lid = Buffer.from(await C.subtle.digest("SHA-256", enc.encode("bynurzy-login:loop-test"))).toString("base64").slice(0, 24);
fs.writeFileSync(`${out}/access.json`, JSON.stringify({ ...entry, users: { [lid]: entry } }));
console.log("real copy ready");
