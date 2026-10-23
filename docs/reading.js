// Reading texts: course words in context, a glossary on tap, then a 6-question check graded by hashed keys.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const CFG = window.HW_CONFIG || {};
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const st = { data: null, t: null, ans: {}, ok: null, key: null, quiz: false };
  const MK = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
  const plural = (n, a, b, c) => { const m = n % 100, k = n % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k >= 2 && k <= 4 ? b : c; };
  const words = (n) => `${n} ${plural(n, "слово", "слова", "слов")}`;
  const lastKey = (id) => `rd_last_${store("hw_student") || ""}_${id}`;

  function show(id) { ["r-start", "r-read"].forEach((s) => $(s).classList.toggle("hidden", s !== id)); window.scrollTo(0, 0); }
  async function sha(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  }
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function unlock(code) {
    const e = st.data.enc;
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(e.salt), iterations: e.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const c = b64(e.check);
    const out = await crypto.subtle.decrypt({ name: "AES-GCM", iv: c.slice(0, 12) }, key, c.slice(12));
    if (new TextDecoder().decode(out) !== "nurzycom") throw new Error("bad");
    return key;
  }
  async function tryCode(code) {
    code = (code || "").trim().toLowerCase();
    if (code.length < 4) return false;
    try { st.key = await unlock(code); store("hw_code", code); return true; } catch (e) { return false; }
  }
  async function openSealed(s) {
    const buf = b64(s);
    return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, st.key, buf.slice(12))));
  }

  // ---- list of texts
  function renderStart() {
    $("texts").innerHTML = st.data.texts.map((t) => {
      const last = store(lastKey(t.id));
      return `<button class="tcard" data-t="${t.id}"><span class="no">${t.id.slice(1)}</span><span class="t">${esc(t.title)}</span>
        <span class="meta"><span class="label">Verbal ${Number(t.lesson.slice(1))} · ${esc(t.lt)}</span></span>
        <span class="meta"><span class="label">${words(t.len)} · ${t.w.length} из словаря курса</span><span class="label">${last ? "последний: " + last : esc(t.genre)}</span></span></button>`;
    }).join("");
    $("texts").querySelectorAll(".tcard").forEach((b) => (b.onclick = () => openText(b.dataset.t)));
  }

  // ---- reader
  function openText(id) {
    const t = st.data.texts.find((x) => x.id === id); if (!t) return;
    st.t = t; st.ans = {}; st.ok = null; st.quiz = false;
    history.replaceState(null, "", `?t=${id}`);
    $("a-label").textContent = `Текст ${t.id.slice(1)} · Verbal ${Number(t.lesson.slice(1))} · ${t.lt}`;
    $("a-title").textContent = t.title;
    $("a-meta").textContent = `${t.genre} · ${words(t.len)} · около ${Math.max(2, Math.round(t.len / 150))} мин · из словаря курса: ${t.own} этого урока, ${t.w.length - t.own} из прошлых`;
    $("story").innerHTML = t.paras.map((p) => `<p>${esc(p).replace(MK, (m, w, k) => `<span class="vw" data-k="${k}" tabindex="0" role="button">${w}</span>`)}</p>`).join("");
    $("story").querySelectorAll(".vw").forEach((el) => { el.onclick = (e) => { e.stopPropagation(); pop(el); }; el.onkeydown = (e) => { if (e.key === "Enter") pop(el); }; });
    $("gl-n").textContent = `Словарик текста · ${t.w.length}`;
    $("gl-list").innerHTML = t.w.map((k) => { const g = st.data.gloss[k]; return `<div class="gi"><b>${esc(g.en)}</b><span>${esc(g.ru)}</span><span class="label">${g.l}</span></div>`; }).join("");
    $("gl").open = false;
    setQuiet(false);
    $("quiz").classList.add("hidden"); $("to-quiz-row").classList.remove("hidden"); $("gl").classList.remove("hidden");
    show("r-read");
  }
  function setQuiet(q) {
    $("story").classList.toggle("quiet", q || $("hl").getAttribute("aria-pressed") !== "true");
    $("hl").disabled = q; hidePop();
  }
  function pop(el) {
    if ($("story").classList.contains("quiet")) return;
    const g = st.data.gloss[el.dataset.k];
    $("story").querySelectorAll(".vw.on").forEach((x) => x.classList.remove("on")); el.classList.add("on");
    $("pop").innerHTML = `<span class="label">${g.l}</span><b>${esc(g.en)}</b>${esc(g.ru)}`;
    $("pop").classList.remove("hidden");
  }
  function hidePop() { $("pop").classList.add("hidden"); $("story").querySelectorAll(".vw.on").forEach((x) => x.classList.remove("on")); }
  document.addEventListener("click", hidePop);
  $("hl").onclick = () => { $("hl").setAttribute("aria-pressed", String($("hl").getAttribute("aria-pressed") !== "true")); setQuiet(st.quiz); };

  // ---- quiz
  function startQuiz() {
    st.quiz = true; st.ans = {}; st.ok = null; setQuiet(true);
    $("gl").classList.add("hidden"); $("to-quiz-row").classList.add("hidden"); $("quiz").classList.remove("hidden");
    $("name-row").classList.toggle("hidden", !!store("hw_student"));
    $("q-n").textContent = `${st.t.q.length} вопросов · подсказки выключены`;
    $("q-res").classList.add("hidden"); $("check").classList.remove("hidden"); $("q-msg").textContent = "";
    renderQuiz({});
    $("quiz").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderQuiz(info) {
    const done = !!st.ok;
    $("q-list").innerHTML = st.t.q.map((q) => {
      const mine = st.ans[q.i], inf = info[q.i];
      const verdict = done ? `<span class="verdict">${st.ok[q.i] ? "верно" : mine ? "ошибка" : "без ответа"}</span>` : "";
      return `<div class="rq${done ? " done" : ""}"><span class="label">Вопрос ${q.i}${verdict}</span><p class="stem">${esc(q.s)}</p>${q.o.map((o, k) => { const c = "ABCD"[k];
        const cls = done ? (inf && inf.a === c ? " right" : mine === c && !st.ok[q.i] ? " mine-no" : "") : "";
        return `<button class="ch${cls}" data-q="${q.i}" data-c="${c}" aria-pressed="${mine === c}"><span class="lt">${c}</span><span>${esc(o)}</span></button>`; }).join("")}
        ${inf ? `<div class="expl">${esc(inf.x)}</div>` : ""}</div>`;
    }).join("");
    if (!done) $("q-list").querySelectorAll(".ch").forEach((b) => (b.onclick = () => { st.ans[b.dataset.q] = b.dataset.c; renderQuiz({}); }));
  }
  async function check() {
    const qs = st.t.q;
    if (!store("hw_student")) {
      const n = $("student").value.trim();
      if (n.length < 2) { $("q-msg").textContent = "Введите имя, чтобы результат дошёл до преподавателя."; $("student").focus(); return; }
      store("hw_student", n);
    }
    const blanks = qs.filter((q) => !st.ans[q.i]).map((q) => q.i);
    if (blanks.length && !confirm(`Без ответа: ${blanks.join(", ")}. Проверить всё равно?`)) return;
    st.ok = {}; let right = 0;
    for (const q of qs) { const a = st.ans[q.i]; st.ok[q.i] = !!a && (await sha(`${st.t.salt}:${q.i}:${a}`)) === q.h; if (st.ok[q.i]) right++; }
    const res = { student: store("hw_student"), lesson: st.t.id, part: `Текст · ${st.t.title}`, answers: qs.map((q) => `${q.i}:${st.ans[q.i] || "-"}`).join(" "),
      score: `${right}/${qs.length}`, wrong: qs.filter((q) => !st.ok[q.i]).map((q) => q.i).join(","), seconds: "0", attempt: "" };
    const ak = `rd_att_${res.student}_${st.t.id}`; res.attempt = String(Number(store(ak) || 0) + 1); store(ak, res.attempt);
    store(lastKey(st.t.id), res.score);
    $("res-score").textContent = res.score; $("res-meter").style.width = `${(100 * right) / qs.length}%`;
    $("check").classList.add("hidden"); $("q-res").classList.remove("hidden"); $("q-msg").textContent = "";
    st.quiz = false; setQuiet(false); $("gl").classList.remove("hidden");
    if (!st.key && store("hw_code")) await tryCode(store("hw_code"));
    await reveal();
    $("q-res").scrollIntoView({ behavior: "smooth", block: "center" });
    send(res);
  }
  async function reveal() {
    const info = {};
    if (st.key) for (const q of st.t.q) { try { info[q.i] = await openSealed(q.x); } catch (e) { /* stays locked */ } }
    $("lock").classList.toggle("hidden", Object.keys(info).length === st.t.q.length);
    renderQuiz(info);
  }
  async function send(r) {
    const f = CFG.fields || {};
    if (!(CFG.formAction && Object.keys(r).every((k) => f[k]))) { $("send-status").textContent = "Отправка не настроена."; return; }
    const body = new URLSearchParams(); Object.keys(r).forEach((k) => body.append(f[k], r[k]));
    try { await fetch(CFG.formAction, { method: "POST", mode: "no-cors", body }); $("send-status").textContent = "Результат отправлен преподавателю."; }
    catch (e) { $("send-status").textContent = "Не удалось отправить (нет интернета?). Пришлите счёт преподавателю в Telegram."; }
  }
  $("to-quiz").onclick = startQuiz;
  $("check").onclick = check;
  $("again").onclick = startQuiz;
  $("unlock").onclick = async () => {
    $("lock-msg").textContent = "Проверяю…";
    if (await tryCode($("code2").value)) { $("lock-msg").textContent = ""; await reveal(); } else $("lock-msg").textContent = "Неверный код класса.";
  };
  $("code2").addEventListener("keydown", (e) => { if (e.key === "Enter") $("unlock").click(); });
  $("next").onclick = () => { const i = st.data.texts.indexOf(st.t); openText(st.data.texts[(i + 1) % st.data.texts.length].id); };
  $("back").onclick = () => { history.replaceState(null, "", location.pathname); renderStart(); show("r-start"); };

  fetch("reading.json", { cache: "no-store" }).then((r) => r.json()).then((d) => {
    st.data = d; renderStart();
    const want = new URLSearchParams(location.search).get("t");
    if (want) openText(want);
  });
})();
