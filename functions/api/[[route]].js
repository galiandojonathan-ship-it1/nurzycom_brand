// Course site accounts (Cloudflare Pages Function, KV namespace bound as USERS).
// Students sign up themselves with the class code; the server never sees the master key or a password.
// Every account entry is the master key wrapped in the browser with the student's own password (PBKDF2 → AES-GCM),
// plus the login and name encrypted with the master key. KV keys:
//   u:<id>   one account (id = hash of the login, made in the browser)
//   invite   { hash, salt, iter, wrap }: the class code's hash and the master key wrapped with the class code
//   admin    hash of the teacher's admin key (claimed once from the teacher page)
//   form     the Google Form answers and the teacher's name merges, encrypted in the browser; admin key only, students never read it
//   p:<id>   the student's results and progress, encrypted in the browser with the master key; only the account owner can
//            read or write it: the browser sends a token derived from the password (PBKDF2, never the password itself), the
//            server keeps its hash and the account's wrap; after a password change the old record is dropped and claimed anew.
//            The teacher's cabinet (admin key) may read and write it too, to tick plan steps, reset a result or assign homework;
//            a record the teacher made before the student's first sync has no hash yet ("unclaimed") and is claimed by the
//            student's first save. When the teacher sets a new password, the record moves to it (the teacher's browser derives
//            the new sync token), so the student keeps the cloud copy.
// Routes: GET user?id · POST register · POST invite · GET/PUT progress?id (header X-Sync) · POST admin/claim · PUT admin/user?id · GET admin/users · DELETE admin/user?id
//         GET/PUT admin/progress?id · GET/PUT admin/form · POST admin/invite · DELETE admin/invite        (admin routes need the header X-Admin-Key)
// The wrapped key of the class code is given out only after the server has checked the code (POST invite), so the code
// cannot be guessed offline; wrong codes are limited per IP (10 per 15 minutes, counted in the Cloudflare cache, no KV writes).
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
const LIMIT = 10, WINDOW = 900;
async function misses(request, add) {   // wrong class codes from this IP in the last 15 minutes
  try {
    const key = new Request("https://throttle.invalid/" + (await sha("bynurzy-throttle:" + (request.headers.get("cf-connecting-ip") || "?"))));
    const hit = await caches.default.match(key), n = hit ? Number(await hit.text()) || 0 : 0;
    if (add) await caches.default.put(key, new Response(String(n + 1), { headers: { "cache-control": "max-age=" + WINDOW } }));
    return n + (add ? 1 : 0);
  } catch (e) { return 0; }   // no cache (local test): no limit
}
async function codeOk(request, inv, code) {
  if ((await misses(request, false)) >= LIMIT) return "slow";
  if ((await sha("bynurzy-invite:" + norm(code))) === inv.hash) return "ok";
  await misses(request, true); return "wrong";
}
// the account's current wrap: self-made accounts in KV, teacher-made logins in access.json (served by the site itself)
async function accountWrap(env, request, id) {
  const e = await env.USERS.get("u:" + id, "json"); if (e) return e.wrap;
  try { const r = await env.ASSETS.fetch(new URL("/access.json", request.url)); const u = ((await r.json()).users || {})[id]; return u ? u.wrap : null; } catch (x) { return null; }
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
  if (route === "invite" && m === "POST") {
    const b = await body(request); if (!b || typeof b.invite !== "string" || b.invite.length > 200) return fail(400, "bad request");
    const inv = await env.USERS.get("invite", "json"); if (!inv) return fail(404, "sign-up closed");
    const v = await codeOk(request, inv, b.invite);
    if (v === "slow") return fail(429, "slow down"); if (v === "wrong") return fail(403, "wrong class code");
    return json({ salt: inv.salt, iter: inv.iter, wrap: inv.wrap });
  }
  if (route === "register" && m === "POST") {
    const b = await body(request); if (!b || !okId(b.id) || !okEntry(b.entry)) return fail(400, "bad request");
    const inv = await env.USERS.get("invite", "json"); if (!inv) return fail(404, "sign-up closed");
    if (typeof b.invite !== "string" || b.invite.length > 200) return fail(400, "bad request");
    const v = await codeOk(request, inv, b.invite);
    if (v === "slow") return fail(429, "slow down"); if (v === "wrong") return fail(403, "wrong class code");
    if (await env.USERS.get("u:" + b.id)) return fail(409, "login taken");
    if ((await count(env)) >= MAX_USERS) return fail(429, "too many accounts");
    await env.USERS.put("u:" + b.id, JSON.stringify({ salt: b.entry.salt, iter: b.entry.iter, wrap: b.entry.wrap, n: b.entry.n, at: new Date().toISOString() }));
    return json({ ok: true });
  }
  if (route === "progress" && (m === "GET" || m === "PUT")) {
    const id = url.searchParams.get("id"), tok = request.headers.get("x-sync") || "";
    if (!okId(id) || !okB64(tok, 64) || tok.length < 40) return fail(400, "bad request");
    const w = await accountWrap(env, request, id); if (!w) return fail(404, "no such login");
    const rec = await env.USERS.get("p:" + id, "json"), h = await sha("bynurzy-sync:" + tok);
    const stale = rec && rec.w !== w, open = rec && !stale && !rec.h, mine = rec && !stale && (rec.h === h || open);   // stale: the password changed; open: made by the teacher, not claimed yet
    if (m === "GET") { if (!rec || stale) return fail(404, "nothing saved"); if (!mine) return fail(403, "not yours"); return json({ data: rec.data, at: rec.at }); }
    if (rec && !stale && !mine) return fail(403, "not yours");
    const b = await body(request); if (!b || !okB64(b.data, 600000)) return fail(400, "bad data");
    await env.USERS.put("p:" + id, JSON.stringify({ h, w, data: b.data, at: new Date().toISOString() }));
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
    if (route === "admin/user" && m === "PUT") {   // a login the teacher made on the teacher page: works at once, no GitHub step
      const id = url.searchParams.get("id"), b = await body(request); if (!okId(id) || !b || !okEntry(b.entry)) return fail(400, "bad request");
      if (!b.replace && (await env.USERS.get("u:" + id))) return fail(409, "login taken");
      if (!b.replace && (await count(env)) >= MAX_USERS) return fail(429, "too many accounts");
      const old = await env.USERS.get("u:" + id, "json");
      await env.USERS.put("u:" + id, JSON.stringify({ salt: b.entry.salt, iter: b.entry.iter, wrap: b.entry.wrap, n: b.entry.n, at: (old && old.at) || new Date().toISOString(), by: (old && old.by) || "teacher" }));
      if (b.replace && okB64(b.sync, 64) && b.sync.length >= 40) {   // a new password: the cloud copy of results moves to it
        const rec = await env.USERS.get("p:" + id, "json");
        if (rec) await env.USERS.put("p:" + id, JSON.stringify(Object.assign(rec, { h: await sha("bynurzy-sync:" + b.sync), w: b.entry.wrap })));
      }
      return json({ ok: true });
    }
    if (route === "admin/user" && m === "DELETE") {
      const id = url.searchParams.get("id"); if (!okId(id)) return fail(400, "bad id");
      await env.USERS.delete("u:" + id); await env.USERS.delete("p:" + id); return json({ ok: true });
    }
    if (route === "admin/progress" && (m === "GET" || m === "PUT")) {   // the teacher's cabinet: a student's results, plan and tasks
      const id = url.searchParams.get("id"); if (!okId(id)) return fail(400, "bad id");
      const w = await accountWrap(env, request, id); if (!w) return fail(404, "no such login");
      const rec = await env.USERS.get("p:" + id, "json");
      if (m === "GET") return rec ? json({ data: rec.data, at: rec.at, claimed: !!rec.h && rec.w === w }) : fail(404, "nothing saved");
      const b = await body(request); if (!b || !okB64(b.data, 600000)) return fail(400, "bad data");
      const h = rec && rec.w === w ? rec.h || null : null;   // keep the owner's claim; after a password change the next login claims it
      await env.USERS.put("p:" + id, JSON.stringify({ h, w, data: b.data, at: new Date().toISOString(), by: "teacher" }));
      return json({ ok: true });
    }
    if (route === "admin/form" && m === "GET") { const f = await env.USERS.get("form", "json"); return f ? json(f) : fail(404, "nothing saved"); }
    if (route === "admin/form" && m === "PUT") {
      const b = await body(request); if (!b || !okB64(b.data, 8000000)) return fail(400, "bad data");
      await env.USERS.put("form", JSON.stringify({ data: b.data, at: new Date().toISOString() })); return json({ ok: true });
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
