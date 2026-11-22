// Local stand-in for Cloudflare Pages: static files from a docs copy + /api/* through the real functions with an in-memory KV
// and, for /api/live, an in-memory D1 (SQLite) built from deploy/live-lesson-d1.sql.
// usage: node pages_dev.mjs <docs dir> <port>
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const [root, port] = [process.argv[2], +process.argv[3] || 8768];
const fn = await import(pathToFileURL("/home/user/nurzycom_brand/functions/api/[[route]].js").href);
const live = await import(pathToFileURL("/home/user/nurzycom_brand/functions/api/live.js").href);
// D1 stand-in for /api/live: in-memory SQLite with the real schema (deploy/live-lesson-d1.sql); prepare/bind/first/all/run/batch like D1
const { DatabaseSync } = await import("node:sqlite");
const sql = new DatabaseSync(":memory:"); sql.exec(fs.readFileSync("/home/user/nurzycom_brand/deploy/live-lesson-d1.sql", "utf8"));
const stmt = (q, args = []) => ({ bind: (...a) => stmt(q, a),
  async first() { return sql.prepare(q).get(...args) ?? null; },
  async all() { return { results: sql.prepare(q).all(...args), meta: {} }; },
  async run() { const r = sql.prepare(q).run(...args); return { results: [], meta: { changes: Number(r.changes) } }; },
  _q: q, _a: args });
const D1 = { prepare: (q) => stmt(q), async batch(list) { sql.exec("BEGIN"); try { const out = list.map((s) => /^\s*select/i.test(s._q) ? { results: sql.prepare(s._q).all(...s._a), meta: {} } : { results: [], meta: { changes: Number(sql.prepare(s._q).run(...s._a).changes) } }); sql.exec("COMMIT"); return out; } catch (e) { sql.exec("ROLLBACK"); throw e; } } };
const mem = new Map(), metadata = new Map();
const KV = { async get(k, t) { const v = mem.get(k); return v == null ? null : t === "json" ? JSON.parse(v) : v; }, async put(k, v, opts) { mem.set(k, String(v)); metadata.set(k, opts?.metadata); },
  async delete(k) { mem.delete(k); metadata.delete(k); },
  async list({ prefix = "" } = {}) { return { keys: [...mem.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name, metadata: metadata.get(name) })), list_complete: true }; } };
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".bin": "application/octet-stream", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const file = (p) => { const f = path.join(root, decodeURIComponent(p.split("?")[0])); return fs.existsSync(f) && fs.statSync(f).isFile() ? f : fs.existsSync(f + ".html") ? f + ".html" : fs.existsSync(path.join(f, "index.html")) ? path.join(f, "index.html") : null; };
const ASSETS = { async fetch(u) { const f = file(new URL(u).pathname); return f ? new Response(fs.readFileSync(f)) : new Response("", { status: 404 }); } };
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname.startsWith("/api/")) { console.log("api", req.method, url.pathname + url.search);
    const chunks = []; for await (const c of req) chunks.push(c); const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const hd = Object.fromEntries(Object.entries(req.headers).filter(([k]) => !["connection", "keep-alive", "host", "transfer-encoding", "content-length"].includes(k)));
    try { const request = new Request(url, { method: req.method, headers: hd, body: ["GET", "HEAD"].includes(req.method) ? undefined : body });
    console.log(" built", JSON.stringify(hd)); const r = url.pathname === "/api/live" ? await live.onRequest({ request, env: { USERS: KV, ASSETS, LIVE_LESSONS: D1, GEMINI_API_KEY: process.env.GEMINI_API_KEY } }) : await fn.onRequest({ request, env: { USERS: KV, ASSETS, GEMINI_API_KEY: process.env.GEMINI_API_KEY }, params: { route: url.pathname.slice(5).split("/") } }); console.log(" done", r.status);
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); } catch (e) { console.log("api error", e); res.writeHead(500); res.end(String(e)); } return;
  }
  const f = file(url.pathname); if (!f) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f));
}).listen(port, "127.0.0.1", () => console.log("pages_dev on", port));
