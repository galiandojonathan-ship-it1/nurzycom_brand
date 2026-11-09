// Local stand-in for Cloudflare Pages: static files from a docs copy + /api/* through the real function with an in-memory KV.
// usage: node pages_dev.mjs <docs dir> <port>
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const [root, port] = [process.argv[2], +process.argv[3] || 8768];
const fn = await import(pathToFileURL("/home/user/nurzycom_brand/functions/api/[[route]].js").href);
const mem = new Map();
const KV = { async get(k, t) { const v = mem.get(k); return v == null ? null : t === "json" ? JSON.parse(v) : v; }, async put(k, v) { mem.set(k, String(v)); }, async delete(k) { mem.delete(k); },
  async list({ prefix = "" } = {}) { return { keys: [...mem.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; } };
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".bin": "application/octet-stream", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const file = (p) => { const f = path.join(root, decodeURIComponent(p.split("?")[0])); return fs.existsSync(f) && fs.statSync(f).isFile() ? f : fs.existsSync(f + ".html") ? f + ".html" : fs.existsSync(path.join(f, "index.html")) ? path.join(f, "index.html") : null; };
const ASSETS = { async fetch(u) { const f = file(new URL(u).pathname); return f ? new Response(fs.readFileSync(f)) : new Response("", { status: 404 }); } };
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname.startsWith("/api/")) { console.log("api", req.method, url.pathname + url.search);
    const chunks = []; for await (const c of req) chunks.push(c); const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const hd = Object.fromEntries(Object.entries(req.headers).filter(([k]) => !["connection", "keep-alive", "host", "transfer-encoding", "content-length"].includes(k)));
    try { const request = new Request(url, { method: req.method, headers: hd, body: ["GET", "HEAD"].includes(req.method) ? undefined : body });
    console.log(" built", JSON.stringify(hd)); const r = await fn.onRequest({ request, env: { USERS: KV, ASSETS }, params: { route: url.pathname.slice(5).split("/") } }); console.log(" done", r.status);
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); } catch (e) { console.log("api error", e); res.writeHead(500); res.end(String(e)); } return;
  }
  const f = file(url.pathname); if (!f) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f));
}).listen(port, "127.0.0.1", () => console.log("pages_dev on", port));
