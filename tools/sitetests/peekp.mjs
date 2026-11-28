import { webcrypto as C } from "node:crypto"; import fs from "node:fs";
const raw = Buffer.from(fs.readFileSync(process.argv[2], "utf8").trim(), "base64"); const key = await C.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
const open = async (f) => { const u = new Uint8Array(fs.readFileSync(f)); return JSON.parse(new TextDecoder().decode(await C.subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, key, u.slice(12)))); };
const j = await open("/home/user/nurzycom_brand/docs/data/lessons.bin"); const l = j.lessons.find((x) => x.tag === "V03");
for (const p of l.parts) { const it = p.b ? await open("/home/user/nurzycom_brand/docs/" + p.b.replace(/^\.\//, "")) : []; console.log(p.id, p.title, p.q.length, it.slice(0, 4).map((q) => q.n + ":" + q.ans + ":" + q.t).join(" ")); }
