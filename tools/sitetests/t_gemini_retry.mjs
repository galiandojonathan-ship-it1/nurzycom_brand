// lib/verbal-lesson.js generate(): a Gemini 503 «high demand» is tried again after a pause; a 400 is not; Google's reason is kept.
import { generate } from "../../lib/verbal-lesson.js";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const good = { candidates: [{ finishReason: "STOP", content: { parts: [{ text: '{"x":1}' }] } }] };
let calls = 0; globalThis.fetch = async () => (++calls < 3 ? reply(503, { error: { message: "high demand" } }) : reply(200, good));
ok(JSON.stringify(await generate("k", "i", {}, {}, 10, "low", [1, 1])) === '{"x":1}' && calls === 3, "503 twice, then the answer: 3 calls");
calls = 0; globalThis.fetch = async () => { calls++; return reply(503, { error: { message: "high demand" } }); };
let e = null; try { await generate("k", "i", {}, {}, 10, "low", [1, 1]); } catch (x) { e = x; }
ok(e && e.status === 503 && e.why === "high demand" && calls === 3, "still 503 after the retries: the error carries Google's reason");
calls = 0; globalThis.fetch = async () => { calls++; return reply(400, { error: { message: "bad schema" } }); };
e = null; try { await generate("k", "i", {}, {}, 10, "low", [1, 1]); } catch (x) { e = x; }
ok(e && e.status === 400 && calls === 1, "a 400 is not retried");
console.log(fails ? `${fails} FAILED` : "ALL PASS"); process.exit(fails ? 1 : 0);
