// Site login. All private data is encrypted with one master key; access.json holds that key wrapped with a key
// derived from a password (PBKDF2-SHA256 → AES-GCM). Changing passwords rewrites only access.json.
// Each student has an own login (added 2026-11-05): access.json → users[id] holds the master key wrapped with that
// student's password; id is a hash of the login and the login and name are stored encrypted with the master key,
// because the repository is public. The old shared password (top-level salt/iter/wrap) works while it is switched on.
// Pages wait for SITE.ready, then read data with SITE.json(name) and decrypt bundles with SITE.open(bytes).
(function () {
  "use strict";
  document.documentElement.classList.add("locked");
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const toB64 = (u) => btoa(String.fromCharCode(...new Uint8Array(u)));
  const get = (k) => { try { return sessionStorage.getItem(k) || localStorage.getItem(k); } catch (e) { return null; } };
  const put = (k, v, keep) => { try { (keep ? localStorage : sessionStorage).setItem(k, v); } catch (e) { /* private mode */ } };
  const drop = () => { try { ["site_pw", "site_key", "site_wrap", "site_login", "site_sync"].forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); }); } catch (e) { /* private mode */ } };
  let resolve; const ready = new Promise((r) => (resolve = r)); let KEY = null;

  async function kek(pw, a, usage) {
    const base = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(a.salt), iterations: a.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, usage);
  }
  async function unwrap(pw, a) {   // throws if the password is wrong
    const w = b64(a.wrap), k = await kek(pw, a, ["decrypt"]);
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: w.slice(0, 12) }, k, w.slice(12)));
  }
  async function wrap(raw, pw) {   // a new access.json for a new password (teacher page)
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const a = { v: 1, salt: toB64(salt), iter: 250000 };
    const k = await kek(pw, a, ["encrypt"]);
    return Object.assign(a, { wrap: toB64(new Uint8Array([...iv, ...new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, raw))])) });
  }
  const access = () => fetch("access.json", { cache: "no-store" }).then((r) => r.json());
  const norm = (l) => String(l || "").trim().toLowerCase();
  async function lid(login) { return toB64(await crypto.subtle.digest("SHA-256", enc.encode("bynurzy-login:" + norm(login)))).slice(0, 24); }
  // A login is looked up in access.json first (logins the teacher made), then in the accounts students made
  // themselves (Cloudflare function, api/user). A network failure throws, so a stored login is not dropped offline.
  async function entryFor(a, login) {
    if (!norm(login)) return a.wrap ? a : null;
    const id = await lid(login), own = (a.users || {})[id]; if (own) return own;
    const r = await fetch("api/user?id=" + encodeURIComponent(id), { cache: "no-store" });
    if (r.ok) { try { return await r.json(); } catch (x) { return null; } }
    if (r.status === 404 || r.status === 400 || r.status === 405) return null;
    throw new TypeError("api " + r.status);
  }
  const PW_OK = (pw) => pw.length >= 8 && /[a-zа-яё]/i.test(pw) && /\d/.test(pw);
  const LOGIN_OK = (l) => /^[a-z0-9][a-z0-9._-]{1,23}$/.test(l);
  async function signup(code, name, user, pw, keep) {
    // the server checks the class code first and only then gives out the key wrapped with it
    const r = await fetch("api/invite", { method: "POST", cache: "no-store", headers: { "content-type": "application/json" }, body: JSON.stringify({ invite: norm(code) }) });
    if (r.status === 404 || r.status === 405) throw new Error("closed");
    if (r.status === 403) throw new Error("code");
    if (r.status === 429) throw new Error("slow");
    if (!r.ok) throw new TypeError("api " + r.status);
    const inv = await r.json(); let raw;
    try { raw = await unwrap(norm(code), inv); } catch (x) { throw new Error("code"); }
    const login = norm(user), id = await lid(login), w = await wrap(raw, pw);
    const entry = { salt: w.salt, iter: w.iter, wrap: w.wrap, n: await seal(raw, { login, name }) };
    const s = await fetch("api/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ invite: norm(code), id, entry }) });
    if (s.status === 409) throw new Error("taken");
    if (s.status === 403) throw new Error("code");
    if (s.status === 429) { let why = ""; try { why = (await s.json()).error; } catch (x) { /* empty */ } throw new Error(why === "slow down" ? "slow" : "full"); }
    if (!s.ok) throw new TypeError("api " + s.status);
    drop(); put("site_pw", pw, keep); put("site_login", login, keep); put("site_key", toB64(raw), false); put("site_wrap", entry.wrap, false);
    try { localStorage.setItem("hw_student", name); } catch (x) { /* private mode */ }
    await useKey(raw);
  }
  async function aes(raw, usage) { return crypto.subtle.importKey("raw", raw, "AES-GCM", false, usage); }
  async function seal(raw, obj) { const iv = crypto.getRandomValues(new Uint8Array(12)); return toB64(new Uint8Array([...iv, ...new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aes(raw, ["encrypt"]), enc.encode(JSON.stringify(obj))))])); }
  async function unseal(raw, s) { const u = b64(s); return JSON.parse(dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, await aes(raw, ["decrypt"]), u.slice(12)))); }
  const sessionRaw = () => { const k = get("site_key"); if (!k) throw new Error("Войдите на сайт заново."); return b64(k); };
  // ---- results on the account (added 2026-11-05): finished work, scores and progress follow the login to any device.
  // Which localStorage keys travel: finished results and progress; not the login itself, teacher settings or a test in progress.
  const SYNC = /^(hw_last_|hw_att_|px_last_|px_att_|rd_last_|rd_att_|mk_last_|mk_att_|mk_done_|plan_done_)|^(plan_course|vocab_hard|vocab_sel|mk_show_answers|mk_gloss|tasks|tasks_done)$/;   // tasks: homework the teacher assigned in the cabinet
  const META = "sync_meta";   // when each synced key last changed on this device
  const LS = (() => { try { return window.localStorage; } catch (e) { return null; } })();
  const rawSet = Storage.prototype.setItem, rawRemove = Storage.prototype.removeItem;
  let applying = false, timer = 0, busy = false, again = false;
  const meta = () => { try { return JSON.parse(LS.getItem(META) || "{}"); } catch (e) { return {}; } };
  function touch(k) { if (applying) return; const m = meta(); m[k] = Date.now(); try { rawSet.call(LS, META, JSON.stringify(m)); } catch (e) { /* full */ } later(); }
  if (LS) {
    Storage.prototype.setItem = function (k, v) { rawSet.call(this, k, v); if (this === LS && SYNC.test(k)) touch(k); };
    Storage.prototype.removeItem = function (k) { rawRemove.call(this, k); if (this === LS && SYNC.test(k)) touch(k); };
  }
  function local() {   // { key: { v, t } }; a removed key travels as v: null
    const m = meta(), out = {};
    for (let i = 0; i < LS.length; i++) { const k = LS.key(i); if (SYNC.test(k)) out[k] = { v: LS.getItem(k), t: m[k] || 0 }; }
    for (const k of Object.keys(m)) if (!(k in out) && SYNC.test(k)) out[k] = { v: null, t: m[k] };
    return out;
  }
  // the newer side wins per key (a tie keeps this device); returns the merged map and whether the server lacks something
  function merge(remote) {
    const L = local(), m = meta(), out = Object.assign({}, remote); let push = false; applying = true;
    try {
      for (const [k, r] of Object.entries(remote)) {
        if (!SYNC.test(k) || !r || typeof r.t !== "number") { delete out[k]; continue; }
        const l = L[k]; if (l && l.t >= r.t) continue;
        if (r.v === null) rawRemove.call(LS, k); else rawSet.call(LS, k, String(r.v));
        m[k] = r.t;
      }
      for (const [k, l] of Object.entries(L)) { const r = remote[k]; if (!r || l.t > r.t || (l.t === r.t && l.v !== r.v)) { out[k] = l; push = true; } }
      rawSet.call(LS, META, JSON.stringify(m));
    } catch (e) { /* storage full or blocked */ } finally { applying = false; }
    return { out, push };
  }
  async function syncToken(id, pw) {   // proves the owner to api/progress without sending the password
    const base = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
    return toB64(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode("bynurzy-sync:" + id), iterations: 150000, hash: "SHA-256" }, base, 256));
  }
  async function syncAuth() {
    const pw = get("site_pw"), login = get("site_login"), key = get("site_key"); if (!pw || !login || !key || !LS) return null;
    const id = await lid(login); let tok = get("site_sync");
    if (!tok) { tok = await syncToken(id, pw); put("site_sync", tok, !!(LS && LS.getItem("site_pw"))); }
    return { id, tok, raw: b64(key) };
  }
  async function sync() {
    if (busy) { again = true; return; }
    busy = true; clearTimeout(timer); timer = 0;
    try {
      const a = await syncAuth(); if (!a) return;
      const url = "api/progress?id=" + encodeURIComponent(a.id), h = { "x-sync": a.tok };
      const r = await fetch(url, { cache: "no-store", headers: h });
      let remote = {};
      if (r.ok) { const j = await r.json(); if (j.data) remote = await unseal(a.raw, j.data); }
      else if (r.status !== 404) return;   // 403 (not this account's record) or offline: keep everything on this device
      const { out, push } = merge(remote);
      if (push) await fetch(url, { method: "PUT", cache: "no-store", headers: Object.assign({ "content-type": "application/json" }, h), body: JSON.stringify({ data: await seal(a.raw, out) }) });
    } catch (e) { /* offline: try again with the next change or page */ }
    finally { busy = false; if (again) { again = false; later(); } }
  }
  function later() { clearTimeout(timer); timer = setTimeout(sync, 15000); }   // bundle a burst of changes into one write
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && timer) sync(); });

  async function useKey(raw) {
    KEY = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
    await Promise.race([sync(), new Promise((r) => setTimeout(r, 4000))]);   // bring this account's results before the page reads them
    document.documentElement.classList.remove("locked");
    const g = document.getElementById("auth"); if (g) g.remove();
    resolve(KEY);
  }

  // A stored login is reused while access.json is unchanged; after a password change the old one stops working.
  async function resume() {
    const pw = get("site_pw"); if (!pw) return false;
    let a; try { a = await access(); } catch (e) { return false; }
    const login = get("site_login") || ""; let e;
    try { e = await entryFor(a, login); } catch (x) { return false; }   // offline: keep the stored login for later
    if (!e) { drop(); return false; }   // the login was deleted or the shared password switched off
    const keep = !!(function () { try { return localStorage.getItem("site_pw"); } catch (x) { return null; } })();
    if (get("site_wrap") === e.wrap && get("site_key")) { await useKey(b64(get("site_key"))); return true; }
    try { const raw = await unwrap(pw, e); put("site_key", toB64(raw), false); put("site_wrap", e.wrap, false); if (keep) { put("site_pw", pw, true); if (login) put("site_login", login, true); } await useKey(raw); return true; }
    catch (x) { drop(); return false; }
  }
  async function login(user, pw, keep) {
    const a = await access(), e = await entryFor(a, user);
    if (!e) throw new Error(norm(user) ? "nologin" : "needlogin");
    const raw = await unwrap(pw, e);   // wrong password throws here
    drop(); put("site_pw", pw, keep); if (norm(user)) put("site_login", norm(user), keep); put("site_key", toB64(raw), false); put("site_wrap", e.wrap, false);
    if (e.n) { try { const me = await unseal(raw, e.n); localStorage.setItem("hw_student", me.name); } catch (x) { /* name is optional */ } }
    await useKey(raw);
  }
  function gate() {
    if (!document.documentElement.classList.contains("locked")) return;
    const d = document.createElement("div"); d.id = "auth";
    d.innerHTML = `<div class="auth-art" aria-hidden="true"><img src="assets/portrait.webp" srcset="assets/portrait-512.webp 512w, assets/portrait.webp 1024w" sizes="(max-width: 899px) 230px, 600px" width="1024" height="1536" alt="">
        <div class="auth-name"><span class="label">Ваш преподаватель</span><span class="auth-word">Нурасыл</span><span class="label auth-cred">SAT 1560 · IELTS 8.0 · Nazarbayev University</span></div></div>
      <form class="auth-box" id="auth-in" autocomplete="on">
      <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4l24.2 14v28L32 60 7.8 46V18z"/><text x="32" y="40.5" text-anchor="middle">NK</text></svg>
      <span class="label">nurzycom · SAT</span><h1>Вход</h1>
      <p class="sub">Домашние задания, словарь и тексты курса. Первый раз здесь? Создайте аккаунт с кодом класса от преподавателя.</p>
      <label class="auth-f">Логин<input id="auth-login" type="text" name="username" autocomplete="username" autocapitalize="none" spellcheck="false"></label>
      <label class="auth-f">Пароль<input id="auth-pw" type="password" autocomplete="current-password" required></label>
      <label class="auth-keep auth-show"><input type="checkbox" data-show="auth-pw"> Показать пароль</label>
      <label class="auth-keep"><input id="auth-keep" type="checkbox" checked> Запомнить на этом устройстве</label>
      <button class="btn" id="auth-go" type="submit">Войти <span class="arr">→</span></button>
      <p class="hint" id="auth-msg" role="status" aria-live="polite"></p>
      <button class="btn ghost" id="auth-to-up" type="button">Создать аккаунт</button>
      <p class="label auth-foot"><a href="https://t.me/nurzycom" target="_blank" rel="noopener">Telegram @nurzycom</a></p></form>
      <form class="auth-box hidden" id="auth-up" autocomplete="on">
      <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4l24.2 14v28L32 60 7.8 46V18z"/><text x="32" y="40.5" text-anchor="middle">NK</text></svg>
      <span class="label">nurzycom · SAT</span><h1>Новый аккаунт</h1>
      <p class="sub">Один раз: код класса от преподавателя, ваше имя, логин и пароль. Потом входите по логину и паролю.</p>
      <label class="auth-f"><span>Код класса</span><input id="up-code" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" required></label>
      <label class="auth-f"><span>Имя и первая буква фамилии: Айгерим К.</span><input id="up-name" type="text" autocomplete="name" required></label>
      <label class="auth-f"><span>Придумайте логин: латиница, например aigerim.k</span><input id="up-login" type="text" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
      <label class="auth-f"><span>Пароль: от 8 символов, буквы и цифры</span><input id="up-pw" type="password" autocomplete="new-password" required></label>
      <label class="auth-f"><span>Пароль ещё раз</span><input id="up-pw2" type="password" autocomplete="new-password" required></label>
      <label class="auth-keep auth-show"><input type="checkbox" data-show="up-pw up-pw2"> Показать пароль</label>
      <label class="auth-keep"><input id="up-keep" type="checkbox" checked> Запомнить на этом устройстве</label>
      <button class="btn" id="up-go" type="submit">Создать аккаунт <span class="arr">→</span></button>
      <p class="hint" id="up-msg" role="status" aria-live="polite"></p>
      <button class="btn ghost" id="auth-to-in" type="button">У меня уже есть аккаунт</button></form>`;
    document.body.prepend(d);
    // «Показать пароль»: phones make typos in hidden passwords; the fields go back to hidden on submit
    d.querySelectorAll("[data-show]").forEach((c) => (c.onchange = () => c.dataset.show.split(" ").forEach((id) => (document.getElementById(id).type = c.checked ? "text" : "password"))));
    d.querySelectorAll("form").forEach((f) => f.addEventListener("submit", () => f.querySelectorAll("[data-show]").forEach((c) => { if (c.checked) { c.checked = false; c.onchange(); } }), true));
    const show = (up) => { document.getElementById("auth-in").classList.toggle("hidden", up); document.getElementById("auth-up").classList.toggle("hidden", !up); document.getElementById(up ? "up-code" : "auth-login").focus(); };
    document.getElementById("auth-to-up").onclick = () => show(true);
    document.getElementById("auth-to-in").onclick = () => show(false);
    document.getElementById("auth-up").onsubmit = async (e) => {
      e.preventDefault(); const msg = document.getElementById("up-msg"), v = (i) => document.getElementById(i).value;
      const name = v("up-name").trim().replace(/\s+/g, " "), login = norm(v("up-login")), pw = v("up-pw").trim();
      if (name.length < 2) { msg.textContent = "Введите имя: так оно будет стоять в ваших результатах."; return; }
      if (!LOGIN_OK(login)) { msg.textContent = "Логин: от 2 до 24 символов, латинские буквы, цифры, точка, дефис. Например aigerim.k"; return; }
      if (!PW_OK(pw)) { msg.textContent = "Пароль: не короче 8 символов, нужны и буквы, и цифры."; return; }
      if (pw !== v("up-pw2").trim()) { msg.textContent = "Пароли не совпадают."; return; }
      msg.textContent = "Создаю аккаунт…";
      try { await signup(v("up-code"), name, login, pw, document.getElementById("up-keep").checked); }
      catch (err) {
        msg.textContent = err instanceof TypeError ? "Нет связи с сайтом. Проверьте интернет и попробуйте ещё раз."
          : err.message === "code" ? "Неверный код класса. Проверьте его в сообщении преподавателя."
          : err.message === "taken" ? "Такой логин уже занят. Придумайте другой."
          : err.message === "closed" ? "Регистрация сейчас закрыта. Напишите преподавателю."
          : err.message === "slow" ? "Слишком много попыток с неверным кодом. Подождите 15 минут и попробуйте снова."
          : err.message === "full" ? "Достигнут предел аккаунтов. Напишите преподавателю." : "Не получилось создать аккаунт. Напишите преподавателю.";
      }
    };
    document.getElementById("auth-in").onsubmit = async (e) => {
      e.preventDefault(); const msg = document.getElementById("auth-msg"); msg.textContent = "Проверяю…";
      try { await login(document.getElementById("auth-login").value, document.getElementById("auth-pw").value.trim(), document.getElementById("auth-keep").checked); }
      catch (err) {
        msg.textContent = err instanceof TypeError ? "Нет связи с сайтом. Проверьте интернет."
          : err.message === "nologin" ? "Такого логина нет. Проверьте написание или спросите у преподавателя."
          : err.message === "needlogin" ? "Введите логин." : "Неверный пароль. Если забыли пароль, напишите преподавателю.";
      }
    };
    document.getElementById("auth-login").focus();
  }
  function logoutLink() {
    const nav = document.querySelector(".nav"); if (!nav || nav.querySelector(".out")) return;
    const a = document.createElement("a"); a.href = "#"; a.className = "out"; a.textContent = "Выйти";
    a.onclick = (e) => { e.preventDefault(); drop(); location.reload(); }; nav.appendChild(a);
  }
  document.addEventListener("DOMContentLoaded", async () => { logoutLink(); if (!(await resume())) gate(); });

  window.SITE = {
    ready,
    async open(bytes) { const k = await ready; const u = new Uint8Array(bytes); return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, k, u.slice(12))); },
    async json(name) { const r = await fetch(`data/${name}.bin`, { cache: "no-store" }); return JSON.parse(dec.decode(await SITE.open(await r.arrayBuffer()))); },
    async sealed(s) { return JSON.parse(dec.decode(await SITE.open(b64(s)))); },   // per-item encrypted fields (explanations)
    // teacher page: the shared password (kept until it is switched off) and the students' own logins
    async rewrap(current, next) { const a = await access(); const raw = a.wrap ? await unwrap(current, a) : sessionRaw(); return Object.assign({}, a, await wrap(raw, next)); },
    access, lid, norm,
    async account(login, name, pw) { const raw = sessionRaw(), w = await wrap(raw, pw); return { salt: w.salt, iter: w.iter, wrap: w.wrap, n: await seal(raw, { login: norm(login), name }) }; },
    async accounts(a) { const raw = sessionRaw(), out = []; for (const [id, e] of Object.entries(a.users || {})) { try { out.push(Object.assign({ id }, await unseal(raw, e.n))); } catch (x) { out.push({ id, login: "?", name: "?" }); } } return out; },
    me() { return get("site_login") || ""; },
    sync,   // pages may ask for an early save, e.g. right after a result
    // teacher page: accounts students made themselves (api/admin/…, header X-Admin-Key)
    adminKey(v) { try { if (v === undefined) return localStorage.getItem("admin_key") || ""; if (v === null) localStorage.removeItem("admin_key"); else localStorage.setItem("admin_key", v); } catch (x) { return ""; } },
    async api(path, opts = {}) {
      const h = Object.assign({ "content-type": "application/json" }, opts.headers || {}); const k = SITE.adminKey(); if (k) h["x-admin-key"] = k;
      const r = await fetch("api/" + path, Object.assign({}, opts, { headers: h, cache: "no-store" }));
      let data = null; try { data = await r.json(); } catch (x) { /* empty */ }
      return { ok: r.ok, status: r.status, data };
    },
    async inviteFor(code) { const raw = sessionRaw(), w = await wrap(raw, norm(code)), h = [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode("bynurzy-invite:" + norm(code))))].map((b) => b.toString(16).padStart(2, "0")).join(""); return { hash: h, salt: w.salt, iter: w.iter, wrap: w.wrap }; },
    async nameOf(n) { return unseal(sessionRaw(), n); },
    // teacher's cabinet: a student's synced results ({ key: { v, t } }), encrypted with the master key like the student's own sync
    async unsealBlob(s) { return unseal(sessionRaw(), s); },
    async sealBlob(obj) { return seal(sessionRaw(), obj); },
    syncToken, SYNC,
    remember(pw) { const keep = (function () { try { return !!localStorage.getItem("site_pw"); } catch (e) { return false; } })(); drop(); put("site_pw", pw, keep); },
    logout() { drop(); location.reload(); },
  };
})();
