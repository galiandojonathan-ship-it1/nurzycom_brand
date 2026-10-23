// Site login. All private data is encrypted with one master key; access.json holds that key wrapped with a key
// derived from the site password (PBKDF2-SHA256 → AES-GCM). Changing the password rewrites only access.json.
// Pages wait for SITE.ready, then read data with SITE.json(name) and decrypt bundles with SITE.open(bytes).
(function () {
  "use strict";
  document.documentElement.classList.add("locked");
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const toB64 = (u) => btoa(String.fromCharCode(...new Uint8Array(u)));
  const get = (k) => { try { return sessionStorage.getItem(k) || localStorage.getItem(k); } catch (e) { return null; } };
  const put = (k, v, keep) => { try { (keep ? localStorage : sessionStorage).setItem(k, v); } catch (e) { /* private mode */ } };
  const drop = () => { try { ["site_pw", "site_key", "site_wrap"].forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); }); } catch (e) { /* private mode */ } };
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
    const keep = !!(function () { try { return localStorage.getItem("site_pw"); } catch (e) { return null; } })();
    if (get("site_wrap") === a.wrap && get("site_key")) { await useKey(b64(get("site_key"))); return true; }
    try { const raw = await unwrap(pw, a); put("site_key", toB64(raw), false); put("site_wrap", a.wrap, false); if (keep) put("site_pw", pw, true); await useKey(raw); return true; }
    catch (e) { drop(); return false; }
  }
  async function login(pw, keep) {
    const a = await access();
    const raw = await unwrap(pw, a);   // wrong password throws here
    drop(); put("site_pw", pw, keep); put("site_key", toB64(raw), false); put("site_wrap", a.wrap, false);
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
      <p class="sub">Домашние задания, словарь и тексты курса. Пароль — у преподавателя.</p>
      <input type="text" name="username" value="student" autocomplete="username" hidden>
      <input id="auth-pw" type="password" autocomplete="current-password" placeholder="Пароль" aria-label="Пароль" required>
      <label class="auth-keep"><input id="auth-keep" type="checkbox" checked> Запомнить на этом устройстве</label>
      <button class="btn" id="auth-go" type="submit">Войти <span class="arr">→</span></button>
      <p class="hint" id="auth-msg"></p>
      <p class="label auth-foot">Telegram @nurzycom</p></form>`;
    document.body.prepend(d);
    d.querySelector("form").onsubmit = async (e) => {
      e.preventDefault(); const msg = document.getElementById("auth-msg"); msg.textContent = "Проверяю…";
      try { await login(document.getElementById("auth-pw").value.trim(), document.getElementById("auth-keep").checked); }
      catch (err) { msg.textContent = err instanceof TypeError ? "Нет связи с сайтом. Проверьте интернет." : "Неверный пароль. Если пароль сменили, спросите новый у преподавателя."; }
    };
    document.getElementById("auth-pw").focus();
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
    // teacher page: re-wrap the master key with a new password
    async rewrap(current, next) { const raw = await unwrap(current, await access()); return wrap(raw, next); },
    remember(pw) { const keep = (function () { try { return !!localStorage.getItem("site_pw"); } catch (e) { return false; } })(); drop(); put("site_pw", pw, keep); },
    logout() { drop(); location.reload(); },
  };
})();
