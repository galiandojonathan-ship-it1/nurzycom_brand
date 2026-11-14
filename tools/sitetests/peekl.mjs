import { webcrypto as C } from "node:crypto"; import fs from "node:fs";
const raw = Buffer.from(fs.readFileSync(process.argv[2], "utf8").trim(), "base64");
const key = await C.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
const u = new Uint8Array(fs.readFileSync("/home/user/nurzycom_brand/docs/data/lessons.bin")); const j = JSON.parse(new TextDecoder().decode(await C.subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, key, u.slice(12))));
const l = j.lessons[0]; console.log(Object.keys(j), Object.keys(l)); const p = l.parts[1]; console.log(Object.keys(p), JSON.stringify(p.q.slice(0, 2)).slice(0, 600));
const b = new Uint8Array(fs.readFileSync("/home/user/nurzycom_brand/docs/" + p.b.replace(/^\.\//, ""))); const it = JSON.parse(new TextDecoder().decode(await C.subtle.decrypt({ name: "AES-GCM", iv: b.slice(0, 12) }, key, b.slice(12))));
console.log(Object.keys(it[0]).join(","), "| ans:", it[0].ans, "| opts:", (it[0].opts||[]).length, "| rat:", String(it[0].rat||it[0].expl||"").slice(0,80));
