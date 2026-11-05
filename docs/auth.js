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
  const drop = () => { try { ["site_pw", "site_key", "site_wrap", "site_login"].forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); }); } catch (e) { /* private mode */ } };
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
  async function entryFor(a, login) { if (!norm(login)) return a.wrap ? a : null; return (a.users || {})[await lid(login)] || null; }
  async function aes(raw, usage) { return crypto.subtle.importKey("raw", raw, "AES-GCM", false, usage); }
  async function seal(raw, obj) { const iv = crypto.getRandomValues(new Uint8Array(12)); return toB64(new Uint8Array([...iv, ...new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aes(raw, ["encrypt"]), enc.encode(JSON.stringify(obj))))])); }
  async function unseal(raw, s) { const u = b64(s); return JSON.parse(dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: u.slice(0, 12) }, await aes(raw, ["decrypt"]), u.slice(12)))); }
  const sessionRaw = () => { const k = get("site_key"); if (!k) throw new Error("Войдите на сайт заново."); return b64(k); };
  async function useKey(raw) {
    KEY = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
    document.documentElement.classList.remove("locked");
    const g = document.getElementById("auth"); if (g) g.remove();
    resolve(KEY);
  }

  // A stored login is reused while access.json is unchanged; after a password change the old one stops working.
  async function resume() {
    const pw = get("site_pw"); if (!pw) return false;
    let a; try { a = await access(); } catch (e) { return false; }
    const login = get("site_login") || "", e = await entryFor(a, login);
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
    d.innerHTML = `<div class="auth-art" aria-hidden="true"><img src="assets/portrait.webp" alt="">
        <div class="auth-name"><span class="label">Ваш преподаватель</span><span class="auth-word">Нурасыл</span><span class="label auth-cred">SAT 1560 · IELTS 8.0 · Nazarbayev University</span></div></div>
      <form class="auth-box" autocomplete="on">
      <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4l24.2 14v28L32 60 7.8 46V18z"/><text x="32" y="40.5" text-anchor="middle">NK</text></svg>
      <span class="label">nurzycom · SAT</span><h1>Вход</h1>
      <p class="sub">Домашние задания, словарь и тексты курса. Логин и пароль — у преподавателя.</p>
      <input id="auth-login" type="text" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Логин" aria-label="Логин">
      <input id="auth-pw" type="password" autocomplete="current-password" placeholder="Пароль" aria-label="Пароль" required>
      <label class="auth-keep"><input id="auth-keep" type="checkbox" checked> Запомнить на этом устройстве</label>
      <button class="btn" id="auth-go" type="submit">Войти <span class="arr">→</span></button>
      <p class="hint" id="auth-msg"></p>
      <p class="label auth-foot">Telegram @nurzycom</p></form>`;
    document.body.prepend(d);
    d.querySelector("form").onsubmit = async (e) => {
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
    remember(pw) { const keep = (function () { try { return !!localStorage.getItem("site_pw"); } catch (e) { return false; } })(); drop(); put("site_pw", pw, keep); },
    logout() { drop(); location.reload(); },
  };
})();
