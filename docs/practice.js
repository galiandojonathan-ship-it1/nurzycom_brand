// Hard practice sets: one question at a time (as in Bluebook), graded by hashed keys; explanations open after submitting.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const CFG = window.HW_CONFIG || {};
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const st = { data: null, set: null, cur: 0, ans: {}, out: {}, marked: new Set(), t0: 0, timer: null, rev: null };

  function show(id) { ["p-start", "p-test", "p-result"].forEach((s) => $(s).classList.toggle("hidden", s !== id)); window.scrollTo(0, 0); }
  async function sha(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  }
  // Text: escape, then ⟦underline⟧ and the blank.
  // Course words are marked [[surface|key]]: plain during the test, highlighted with the translation in the review.
  const MK = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
  const rich = (t, hl) => esc(t).replace(/⟦/g, "<u>").replace(/⟧/g, "</u>").replace(/_{4,}/g, '<span class="blank" aria-label="пропуск">______</span>')
    .replace(MK, (m, w, k) => { const g = (st.data.gloss || {})[k]; return hl && g ? `<span class="vw" title="${esc(g.ru)} · ${g.l}">${w}</span>` : w; });
  function blocks(bs, hl) {
    return bs.map((b) => {
      if (b.k === "p") return `<p>${rich(b.v, hl)}</p>`;
      if (b.k === "h") return `<p class="th">${esc(b.v)}</p>`;
      if (b.k === "ul") return `<ul>${b.v.map((x) => `<li>${rich(x, hl)}</li>`).join("")}</ul>`;
      if (b.k === "table") {
        const [head, ...rows] = b.rows;
        return `<div class="tw"><table class="dt"><caption>${esc(b.c)}</caption><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      }
      return "";
    }).join("");
  }

  // ---- start
  const lastKey = (id) => `px_last_${store("hw_student") || ""}_${id}`;
  function renderStart() {
    $("student").value = store("hw_student") || "";
    const card = (s) => {
      const last = store(lastKey(s.id)), nw = s.q.reduce((a, q) => a + (q.w || []).length, 0);
      return `<button class="set" data-s="${s.id}" aria-pressed="false"><span class="no">${s.id.slice(1)}</span><span class="t">${esc(s.title)}</span>
        <span class="meta"><span class="label">${esc(s.en)}</span><span class="label">${s.q.length} вопросов · ${s.minutes} мин${nw ? ` · ${nw} из словаря курса` : ""}${last ? " · " + last : ""}</span></span></button>`;
    };
    const groups = [["Разные темы", (s) => s.id < "X05"], ["Американская литература", (s) => s.id >= "X05"]];
    $("sets").innerHTML = groups.map(([name, f]) => { const ss = st.data.sets.filter(f);
      return ss.length ? `<div class="course-h" style="grid-column:1/-1;margin-top:8px"><b>${name}</b><span class="label">${ss.length} ${ss.length > 4 ? "наборов" : "набора"}</span></div>${ss.map(card).join("")}` : ""; }).join("");
    $("sets").querySelectorAll(".set").forEach((b) => (b.onclick = () => {
      $("sets").querySelectorAll(".set").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      st.set = st.data.sets.find((s) => s.id === b.dataset.s); check();
    }));
    $("student").oninput = check;
    const want = new URLSearchParams(location.search).get("s");
    if (want) { const b = $("sets").querySelector(`.set[data-s="${want}"]`); if (b) b.click(); }
    check();
  }
  function check() { $("go").disabled = !($("student").value.trim().length >= 2 && st.set); }

  async function begin() {
    store("hw_student", $("student").value.trim());
    st.ans = {}; st.out = {}; st.marked = new Set(); st.cur = 0;
    $("t-title").textContent = `${st.set.id} · ${st.set.title}`;
    st.t0 = Date.now(); clearInterval(st.timer);
    st.timer = setInterval(tick, 1000); tick();
    show("p-test"); renderQ();
  }
  function tick() { const s = Math.floor((Date.now() - st.t0) / 1000); $("clock").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }

  // ---- one question
  function renderQ() {
    const qs = st.set.q, q = qs[st.cur], n = q.i;
    $("passage").innerHTML = blocks(q.b);
    $("qn").textContent = `Вопрос ${n} из ${qs.length}`;
    $("t-pos").textContent = `${Object.keys(st.ans).length} / ${qs.length}`;
    $("prog").style.width = `${(100 * Object.keys(st.ans).length) / qs.length}%`;
    $("stem").innerHTML = rich(q.s);
    $("flag").setAttribute("aria-pressed", String(st.marked.has(n)));
    const out = st.out[n] || new Set();
    $("opts").innerHTML = q.o.map((o, k) => { const c = "ABCD"[k];
      return `<div class="opt${st.ans[n] === c ? " on" : ""}${out.has(c) ? " out" : ""}" data-c="${c}"><button class="ch" data-c="${c}"><span class="lt">${c}</span><span class="tx">${rich(o)}</span></button><button class="x" data-c="${c}" aria-label="Вычеркнуть ${c}" title="Вычеркнуть">${out.has(c) ? "↺" : "×"}</button></div>`; }).join("");
    $("opts").querySelectorAll(".ch").forEach((b) => (b.onclick = () => choose(b.dataset.c)));
    $("opts").querySelectorAll(".x").forEach((b) => (b.onclick = () => strike(b.dataset.c)));
    $("prev").disabled = st.cur === 0;
    $("next").innerHTML = st.cur === qs.length - 1 ? "Сдать →" : "Далее →";
    $("navbtn").textContent = `${n} / ${qs.length} ▴`;
    renderGrid();
  }
  function choose(c) {
    const n = st.set.q[st.cur].i;
    st.ans[n] = c; if (st.out[n]) st.out[n].delete(c);
    renderQ();
  }
  function strike(c) {
    const n = st.set.q[st.cur].i;
    const s = st.out[n] || (st.out[n] = new Set());
    if (s.has(c)) s.delete(c); else { s.add(c); if (st.ans[n] === c) delete st.ans[n]; }
    renderQ();
  }
  function go(k) { st.cur = Math.max(0, Math.min(st.set.q.length - 1, k)); $("navpanel").classList.add("hidden"); renderQ(); window.scrollTo(0, 0); }
  function renderGrid() {
    $("grid").innerHTML = st.set.q.map((q, k) => `<button data-k="${k}" class="${st.ans[q.i] ? "ans" : ""}${k === st.cur ? " cur" : ""}${st.marked.has(q.i) ? " mk" : ""}">${q.i}</button>`).join("");
    $("grid").querySelectorAll("button").forEach((b) => (b.onclick = () => go(Number(b.dataset.k))));
  }
  $("prev").onclick = () => go(st.cur - 1);
  $("next").onclick = () => (st.cur === st.set.q.length - 1 ? finish() : go(st.cur + 1));
  $("navbtn").onclick = () => $("navpanel").classList.toggle("hidden");
  $("closenav").onclick = () => $("navpanel").classList.add("hidden");
  $("finish2").onclick = () => finish();
  $("flag").onclick = () => { const n = st.set.q[st.cur].i; st.marked.has(n) ? st.marked.delete(n) : st.marked.add(n); renderQ(); };
  document.addEventListener("keydown", (e) => {
    if ($("p-test").classList.contains("hidden") || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const k = e.key.toUpperCase();
    if ("ABCD".includes(k) && k.length === 1) choose(k);
    else if (e.key === "ArrowRight" && st.cur < st.set.q.length - 1) go(st.cur + 1);
    else if (e.key === "ArrowLeft") go(st.cur - 1);
  });

  // ---- grade and review
  async function finish() {
    const qs = st.set.q;
    const blanks = qs.filter((q) => !st.ans[q.i]).map((q) => q.i);
    if (blanks.length && !confirm(`Без ответа: ${blanks.join(", ")}. Сдать всё равно?`)) return;
    clearInterval(st.timer);
    const seconds = Math.round((Date.now() - st.t0) / 1000);
    const wrong = []; let right = 0; const ok = {};
    for (const q of qs) {
      const a = st.ans[q.i];
      ok[q.i] = !!a && (await sha(`${st.set.salt}:${q.i}:${a}`)) === q.h;
      if (ok[q.i]) right++; else wrong.push(q.i);
    }
    const student = store("hw_student") || $("student").value.trim();
    const ak = `px_att_${student}_${st.set.id}`;
    const attempt = Number(store(ak) || 0) + 1; store(ak, String(attempt));
    const res = { student, lesson: st.set.id, part: `Сложные вопросы · ${st.set.title}`, answers: qs.map((q) => `${q.i}:${st.ans[q.i] || "-"}`).join(" "),
      score: `${right}/${qs.length}`, wrong: wrong.join(","), seconds: String(seconds), attempt: String(attempt) };
    store(lastKey(st.set.id), res.score);
    st.rev = { ok, res, seconds };
    $("res-title").textContent = `${st.set.id} · ${st.set.title} · попытка ${attempt}`;
    $("res-score").textContent = res.score;
    $("res-meter").style.width = `${(100 * right) / qs.length}%`;
    $("res-time").textContent = `${Math.floor(seconds / 60)} мин ${seconds % 60} с`;
    $("res-per").textContent = `${Math.round(seconds / qs.length)} с`;
    const code = ["PX", res.lesson, res.student, res.score, res.wrong || "-", res.seconds + "s", "a" + attempt, res.answers].join(" | ");
    $("res-code").textContent = code;
    $("tg").href = `https://t.me/${CFG.telegram || "nurzycom"}`;
    $("copy").onclick = async () => { try { await navigator.clipboard.writeText(code); $("copy").textContent = "Скопировано"; } catch (e) { $("copy").textContent = "Выделите код вручную"; } };
    show("p-result");
    await renderReview();
    send(res);
  }
  async function renderReview() {
    const { ok } = st.rev, qs = st.set.q;
    const info = {};
    for (const q of qs) info[q.i] = await SITE.sealed(q.x);
    $("rev").innerHTML = qs.map((q) => {
      const mine = st.ans[q.i], inf = info[q.i];
      const opts = q.o.map((o, k) => { const c = "ABCD"[k]; const right = inf && inf.a === c;
        return `<div class="ropt${right ? " right" : ""}${mine === c ? " mine" : ""}"><span class="lt">${c}</span><span>${rich(o, true)}</span>${right ? '<span class="tg">верный</span>' : mine === c ? '<span class="tg">ваш ответ</span>' : ""}</div>`; }).join("");
      return `<details><summary><span class="mk ${ok[q.i] ? "ok" : "no"}">${q.i}</span><span class="sm"><b>${ok[q.i] ? "Верно" : mine ? "Ошибка" : "Без ответа"}</b><small>Ваш ответ: ${mine || "—"}${inf ? ` · верный: ${inf.a} · ${esc(inf.t)}` : ""}</small></span><span class="ar">›</span></summary>
        <div class="rbody"><div class="passage" style="padding:8px 0 4px">${blocks(q.b, true)}</div><p class="stem">${rich(q.s, true)}</p>${opts}${inf ? `<div class="expl"><span class="label">Разбор · ${esc(inf.t)}</span>${esc(inf.x)}</div>` : ""}${words(q)}</div></details>`;
    }).join("");
  }
  function words(q) {
    const ws = (q.w || []).map((k) => st.data.gloss[k]).filter(Boolean);
    return ws.length ? `<div class="wlist"><span class="label">Слова курса в вопросе</span>${ws.map((g) => `<div><b>${esc(g.en)}</b> — ${esc(g.ru)} <span class="label">${g.l}</span></div>`).join("")}</div>` : "";
  }

  async function send(r) {
    const f = CFG.fields || {};
    const ready = CFG.formAction && Object.keys(r).every((k) => f[k]);
    if (!ready) { $("send-status").textContent = "Отправка не настроена: пришлите код преподавателю."; $("backup").classList.remove("hidden"); return; }
    $("send-status").textContent = "Отправляю…";
    const body = new URLSearchParams();
    Object.keys(r).forEach((k) => body.append(f[k], r[k]));
    try {
      await fetch(CFG.formAction, { method: "POST", mode: "no-cors", body });
      $("send-status").textContent = "Результат отправлен преподавателю.";
      $("backup").classList.add("hidden");
    } catch (e) {
      $("send-status").textContent = "Не удалось отправить (нет интернета?).";
      $("backup").classList.remove("hidden");
    }
  }

  $("go").onclick = begin;
  $("again").onclick = begin;
  $("home").onclick = () => { renderStart(); show("p-start"); };

  SITE.json("practice").then((d) => { st.data = d; renderStart(); })
    .catch(() => { $("start-msg").textContent = "Не удалось загрузить вопросы. Обновите страницу."; });
})();
