import { webcrypto as C } from "node:crypto"; import fs from "node:fs";
const raw = Buffer.from(fs.readFileSync(process.argv[2], "utf8").trim(), "base64"); const key = await C.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
const u = new Uint8Array(fs.readFileSync("/home/user/nurzycom_brand/docs/data/mocks.bin")); const j = JSON.parse(new TextDecoder().decode(await C.subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, key, u.slice(12))));
console.log(j.mocks.map((m) => `${m.id}:${m.group || "-"}:${m.only || ""}:${m.title}`).join("\n"));
