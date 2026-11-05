// Course site accounts (Cloudflare Pages Function, KV namespace bound as USERS).
// Students sign up themselves with the class code; the server never sees the master key or a password.
// Every account entry is the master key wrapped in the browser with the student's own password (PBKDF2 → AES-GCM),
// plus the login and name encrypted with the master key. KV keys:
//   u:<id>   one account (id = hash of the login, made in the browser)
//   invite   { hash, salt, iter, wrap }: the class code's hash and the master key wrapped with the class code
//   admin    hash of the teacher's admin key (claimed once from the teacher page)
// Routes: GET user?id · POST register · GET invite · POST admin/claim · GET admin/users · DELETE admin/user?id
//         POST admin/invite · DELETE admin/invite        (admin routes need the header X-Admin-Key)
const MAX_USERS = 300;
const enc = new TextEncoder();
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const fail = (status, error) => json({ error }, status);
async function sha(s) { return [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join(""); }
const norm = (s) => String(s || "").trim().toLowerCase();
const okId = (id) => typeof id === "string" && /^[A-Za-z0-9+/=]{16,64}$/.test(id);
const okB64 = (s, max) => typeof s === "string" && s.length > 0 && s.length <= max && /^[A-Za-z0-9+/=]+$/.test(s);
const okEntry = (e) => e && okB64(e.salt, 64) && okB64(e.wrap, 200) && okB64(e.n, 1200) && Number.isInteger(e.iter) && e.iter >= 100000 && e.iter <= 2000000;
async function body(request) { try { return await request.json(); } catch (e) { return null; } }
async function isAdmin(env, request) {
  const key = request.headers.get("x-admin-key"), stored = await env.USERS.get("admin");
  return !!(key && stored && (await sha("bynurzy-admin:" + key)) === stored);
}
async function count(env) { let n = 0, cursor; do { const r = await env.USERS.list({ prefix: "u:", cursor }); n += r.keys.length; cursor = r.list_complete ? null : r.cursor; } while (cursor); return n; }

export async function onRequest(context) {
  const { request, env, params } = context;
  if (!env.USERS) return fail(503, "storage not connected");
  const route = [].concat(params.route || []).join("/"), url = new URL(request.url), m = request.method;

  if (route === "user" && m === "GET") {
    const id = url.searchParams.get("id"); if (!okId(id)) return fail(400, "bad id");
    const e = await env.USERS.get("u:" + id, "json"); return e ? json(e) : fail(404, "no such login");
  }
  if (route === "invite" && m === "GET") {
    const inv = await env.USERS.get("invite", "json"); if (!inv) return fail(404, "sign-up closed");
    return json({ salt: inv.salt, iter: inv.iter, wrap: inv.wrap });
  }
  if (route === "register" && m === "POST") {
    const b = await body(request); if (!b || !okId(b.id) || !okEntry(b.entry)) return fail(400, "bad request");
    const inv = await env.USERS.get("invite", "json"); if (!inv) return fail(404, "sign-up closed");
    if ((await sha("bynurzy-invite:" + norm(b.invite))) !== inv.hash) return fail(403, "wrong class code");
    if (await env.USERS.get("u:" + b.id)) return fail(409, "login taken");
    if ((await count(env)) >= MAX_USERS) return fail(429, "too many accounts");
    await env.USERS.put("u:" + b.id, JSON.stringify({ salt: b.entry.salt, iter: b.entry.iter, wrap: b.entry.wrap, n: b.entry.n, at: new Date().toISOString() }));
    return json({ ok: true });
  }
  if (route === "admin/claim" && m === "POST") {
    const b = await body(request); if (!b || typeof b.key !== "string" || b.key.length < 24) return fail(400, "bad key");
    if (await env.USERS.get("admin")) return fail(409, "already claimed");
    await env.USERS.put("admin", await sha("bynurzy-admin:" + b.key)); return json({ ok: true });
  }
  if (route.startsWith("admin/")) {
    if (!(await isAdmin(env, request))) return fail(403, "admin key needed");
    if (route === "admin/users" && m === "GET") {
      const out = []; let cursor;
      do { const r = await env.USERS.list({ prefix: "u:", cursor });
        for (const k of r.keys) { const e = await env.USERS.get(k.name, "json"); if (e) out.push({ id: k.name.slice(2), n: e.n, at: e.at || null }); }
        cursor = r.list_complete ? null : r.cursor; } while (cursor);
      const inv = await env.USERS.get("invite", "json");
      return json({ users: out, invite: !!inv });
    }
    if (route === "admin/user" && m === "DELETE") {
      const id = url.searchParams.get("id"); if (!okId(id)) return fail(400, "bad id");
      await env.USERS.delete("u:" + id); return json({ ok: true });
    }
    if (route === "admin/invite" && m === "POST") {
      const b = await body(request);
      if (!b || !/^[0-9a-f]{64}$/.test(b.hash || "") || !okB64(b.salt, 64) || !okB64(b.wrap, 200) || !Number.isInteger(b.iter)) return fail(400, "bad invite");
      await env.USERS.put("invite", JSON.stringify({ hash: b.hash, salt: b.salt, iter: b.iter, wrap: b.wrap })); return json({ ok: true });
    }
    if (route === "admin/invite" && m === "DELETE") { await env.USERS.delete("invite"); return json({ ok: true }); }
  }
  return fail(404, "not found");
}
