// «Ошибки класса» (2026-11-16, Nurassyl: «what if I want to discuss class's mistakes… integrate teacher's website to that
// lesson account»): the lesson account (lesson.js loads this file on demand) shows the group's hardest questions on the
// shared screen. The teacher sends them from teacher.html → «Анализ группы» → «Показать на уроке»: the teacher page writes a
// snapshot without names (question ids, how many answered and missed, which wrong options were chosen) into the lesson
// account's synced copy as key «ls_m». Nothing here needs the admin key, and no student name ever reaches this screen.
// While a question is open the lesson bar's marks (word, hard question, «Сработало», class vote) apply to it.
(function () {
  "use strict";
  if (window.LSMIST) return;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pl = (n, a, b, c) => { const m = n % 100, d = n % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c; };
  const DIFN = { E: "лёгкий", M: "средний", H: "сложный" };
  const M = { box: null, data: null, cur: -1, show: { picks: false, ans: false }, bundles: {}, prev: null, opener: null };
  const css = `
.lm{position:fixed;inset:0;z-index:55;background:var(--paper,#F5F3EE);overflow:auto;padding:28px 20px calc(var(--ls-h,56px) + 48px)}
.lm-in{max-width:1080px;margin:0 auto}
.lm-h{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:1.5px solid var(--ink,#0F0F0F);padding-bottom:14px;margin-bottom:18px}
.lm-h h2{font:600 clamp(26px,3.4vw,38px)/1.1 var(--sans);margin:4px 0 6px;letter-spacing:-.01em}.lm-h p{margin:0;color:#5E5A54;font-size:15px}
.lm-x{font:500 15px var(--sans);background:transparent;border:1.5px solid var(--studio,#D9D5CD);border-radius:999px;padding:9px 16px;cursor:pointer;white-space:nowrap}
.lm-x:hover,.lm-x:focus-visible{border-color:var(--ink,#0F0F0F)}
.lm-list{display:grid;gap:10px;padding:0;margin:0;list-style:none}
.lm-card{width:100%;display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:14px;align-items:center;text-align:left;background:#fff;border:1.5px solid var(--studio,#D9D5CD);border-radius:16px;padding:14px 16px;font:inherit;color:inherit;cursor:pointer}
.lm-card:hover,.lm-card:focus-visible{border-color:var(--ink,#0F0F0F)}
.lm-card .n{font:600 22px/1 var(--sans);text-align:center}.lm-card b{font:600 17px/1.3 var(--sans);display:block}.lm-card small{color:#5E5A54;font-size:14px}
.lm-card .r{text-align:right;font:600 22px/1 var(--sans)}.lm-card .r small{display:block;font:400 13px var(--sans);margin-top:4px}
.lm-trap{color:#A63328}
.lm-nav{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.lm-nav .lm-pos{font:500 15px var(--sans);color:#5E5A54}
.lm-q{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:28px;align-items:start}
.lm-q.solo{grid-template-columns:minmax(0,1fr)}
.lm-stim{font-size:18px;line-height:1.6;background:#fff;border:1.5px solid var(--studio,#D9D5CD);border-radius:16px;padding:18px 20px}
.lm-stem{font:600 18px/1.45 var(--sans);margin:0 0 14px}
.lm-o{display:grid;grid-template-columns:34px minmax(0,1fr);gap:12px;align-items:start;background:#fff;border:1.5px solid var(--studio,#D9D5CD);border-radius:14px;padding:12px 14px;margin-bottom:10px;font-size:17px;line-height:1.45}
.lm-o .lt{width:30px;height:30px;border:1.5px solid var(--ink,#0F0F0F);border-radius:50%;display:grid;place-items:center;font:600 14px var(--sans)}
.lm-o .bar{grid-column:2;display:flex;align-items:center;gap:10px;font:500 14px var(--sans);color:#5E5A54}
.lm-o .bar span{flex:1;height:8px;border-radius:999px;background:var(--mist,#ECE9E2);overflow:hidden}.lm-o .bar i{display:block;height:100%;background:#77736D;border-radius:999px}
.lm-o.trap{border-color:#A63328}.lm-o.trap .bar i{background:#A63328}
.lm-o.right{border-color:#1F5A33;background:#F0F6F1}.lm-o.right .lt{background:#1F5A33;border-color:#1F5A33;color:#fff}.lm-o.right .bar i{background:#1F5A33}
.lm-btns{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0}
.lm-btns button{font:500 15px var(--sans);border-radius:999px;padding:10px 16px;border:1.5px solid var(--ink,#0F0F0F);background:#fff;cursor:pointer}
.lm-btns button[aria-pressed="true"]{background:var(--ink,#0F0F0F);color:var(--paper,#F5F3EE)}
.lm-spr{font-size:16px;margin:8px 0}.lm-expl{background:var(--mist,#ECE9E2);border-radius:14px;padding:14px 18px;margin-top:16px;font-size:16px;line-height:1.55}
.lm-sum{font:500 15px var(--sans);margin:12px 0 0;color:#5E5A54}
.lm-empty{max-width:640px;font-size:17px;line-height:1.55}
@media(max-width:800px){.lm-q{grid-template-columns:minmax(0,1fr)}.lm-card{grid-template-columns:32px minmax(0,1fr)}.lm-card .r{grid-column:2;text-align:left}}
@media print{.lm{display:none !important}}`;
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: css }));

  const read = () => { try { const d = JSON.parse(localStorage.getItem("ls_m") || "null"); return d && Array.isArray(d.qs) ? d : null; } catch (e) { return null; } };
  const day = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) + ", " + new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const pct = (q) => (q.n ? Math.round((100 * q.wrong) / q.n) : 0);
  const trapOf = (q) => { const e = Object.entries(q.picks || {}).filter(([o]) => /^[A-D]$/.test(o)).sort((a, b) => b[1] - a[1])[0]; return e && e[1] >= 2 && e[1] / q.wrong >= 0.6 ? e[0] : ""; };
  const secTitle = (q) => String(q.title || q.id).replace(/ · №\d+$/, "");

  async function open() {
    if (!M.box) {
      M.opener = document.activeElement;
      M.prev = { lq: document.body.dataset.lq, lt: document.body.dataset.lt };   // the page's own question comes back on close
      M.box = Object.assign(document.createElement("div"), { className: "lm", role: "dialog", ariaLabel: "Ошибки класса" });
      M.box.setAttribute("aria-modal", "false"); M.box.innerHTML = '<div class="lm-in"><p class="lm-empty">Загружаю…</p></div>';
      document.body.appendChild(M.box); document.documentElement.style.overflow = "hidden";
      M.box.addEventListener("click", onClick); document.addEventListener("keydown", onKey);
    }
    try { await Promise.race([window.SITE && SITE.sync ? SITE.sync() : null, new Promise((r) => setTimeout(r, 4000))]); } catch (e) { /* offline: show what this device has */ }
    M.data = read(); M.cur = -1; list();
  }
  function close() {
    if (!M.box) return;
    M.box.remove(); M.box = null; document.documentElement.style.overflow = ""; document.removeEventListener("keydown", onKey);
    const p = M.prev || {}; if (p.lq) document.body.dataset.lq = p.lq; else delete document.body.dataset.lq; if (p.lt) document.body.dataset.lt = p.lt; else delete document.body.dataset.lt;
    if (M.opener && M.opener.focus) M.opener.focus();
  }
  function onKey(e) {
    if (!M.box || e.defaultPrevented || document.documentElement.classList.contains("ls-pick") || document.querySelector(".ls-pop")) return;
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === "Escape") { e.preventDefault(); if (M.cur >= 0) list(); else close(); }
    else if (M.cur >= 0 && e.key === "ArrowRight") { e.preventDefault(); go(M.cur + 1); }
    else if (M.cur >= 0 && e.key === "ArrowLeft") { e.preventDefault(); go(M.cur - 1); }
  }
  function head(sub) {
    const d = M.data;
    return `<div class="lm-h"><div><span class="label">Разбор ошибок класса</span><h2 tabindex="-1">${esc(d ? d.group : "Ошибки класса")}</h2><p>${sub}</p></div><button type="button" class="lm-x" data-lm="close">Закрыть ✕</button></div>`;
  }
  function list() {
    M.cur = -1; delete document.body.dataset.lq; delete document.body.dataset.lt;
    const d = M.data, inn = M.box.querySelector(".lm-in");
    if (!d || !d.qs.length) {
      inn.innerHTML = head("Список пуст") + `<div class="lm-empty"><p>Вопросов для разбора пока нет.</p><p>Как прислать их сюда: на своём устройстве откройте страницу преподавателя, вкладку «Анализ группы», выберите группу и нажмите «Показать на уроке». Затем снова нажмите «Ошибки класса» здесь.</p></div>`;
    } else {
      inn.innerHTML = head(`${esc(d.note || "")}${d.note ? " · " : ""}обновлено ${esc(day(d.at))} · ${d.qs.length} ${pl(d.qs.length, "вопрос", "вопроса", "вопросов")}, самые трудные сверху`) +
        `<ol class="lm-list">${d.qs.map((q, i) => { const t = trapOf(q); return `<li><button type="button" class="lm-card" data-lm="q" data-i="${i}"><span class="n">${i + 1}</span>
          <span><b>${esc(q.title)}</b><small>${esc(q.sk || "—")}${q.d ? " · " + DIFN[q.d] : ""}${q.work ? " · " + esc(q.work) : ""}${t ? ` · <span class="lm-trap">общая ловушка ${t}</span>` : ""}</small></span>
          <span class="r">${pct(q)}%<small>ошиблись ${q.wrong} из ${q.n}</small></span></button></li>`; }).join("")}</ol>`;
    }
    focusH();
  }
  const focusH = () => { const h = M.box && M.box.querySelector("h2"); if (h) h.focus({ preventScroll: true }); M.box.scrollTop = 0; };
  function go(i) { if (!M.data || i < 0 || i >= M.data.qs.length) return; M.cur = i; M.show = { picks: false, ans: false }; question(); }

  async function bundle(path) {
    if (!M.bundles[path]) M.bundles[path] = fetch(path, { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("q " + r.status); return r.arrayBuffer(); }).then((b) => SITE.open(b)).then((u) => JSON.parse(new TextDecoder().decode(u)));
    return M.bundles[path];
  }
  async function item(q) {
    const s = q.src || {}; if (!s.b) return null;
    const b = await bundle(s.b);
    if (s.mod) return ((b.mods || {})[s.mod] || [])[s.i] || null;
    return (Array.isArray(b) ? b : []).find((x) => x.n === s.n) || null;
  }
  async function question() {
    const q = M.data.qs[M.cur], i = M.cur, n = M.data.qs.length, inn = M.box.querySelector(".lm-in");
    document.body.dataset.lq = q.id; document.body.dataset.lt = "Разбор ошибок · " + secTitle(q);   // the lesson bar's marks apply to this question
    const nav = `<div class="lm-nav"><button type="button" class="lm-x" data-lm="list">← Все вопросы</button><span class="lm-pos" id="ls-mq">Вопрос ${i + 1} из ${n}</span>
      <span><button type="button" class="lm-x" data-lm="prev"${i ? "" : " disabled"}>← Назад</button> <button type="button" class="lm-x" data-lm="next"${i < n - 1 ? "" : " disabled"}>Далее →</button></span></div>`;
    inn.innerHTML = head(`${esc(q.title)} · ${esc(q.sk || "—")}`) + nav + '<p class="lm-empty">Загружаю вопрос…</p>';
    let it = null; try { it = await item(q); } catch (e) { it = null; }
    if (M.cur !== i || !M.box) return;
    const body = inn.querySelector(".lm-empty");
    if (!it) { body.textContent = "Не удалось открыть этот вопрос. Обновите страницу или перейдите к следующему."; return; }
    const right = q.n - q.wrong, mc = !!(it.opts && it.opts.length), trap = trapOf(q), max = Math.max(1, right, ...Object.values(q.picks || {}));
    const stim = String(it.stim || "").trim(), cnt = (c) => (c === it.ans ? right : (q.picks || {})[c] || 0);
    const opts = mc ? it.opts.map((o, k) => { const c = "ABCD"[k], v = cnt(c);
        const cls = `${M.show.ans && c === it.ans ? " right" : ""}${M.show.picks && !M.show.ans && c === trap ? " trap" : ""}`;
        return `<div class="lm-o${cls}"><span class="lt">${c}</span><span class="qhtml tx">${o}</span>${M.show.picks ? `<span class="bar"><span><i style="width:${Math.round((100 * v) / max)}%"></i></span>${v} ${pl(v, "ученик", "ученика", "учеников")}</span>` : ""}</div>`; }).join("")
      : `<p class="lm-spr">Ответ вводится вручную.</p>${M.show.picks ? `<p class="lm-spr">Неверные ответы класса: ${esc(Object.entries(q.picks || {}).map(([v, c]) => `${v} (${c})`).join(", ") || "—")} · верно ответили: ${right}</p>` : ""}${M.show.ans ? `<p class="lm-spr"><b>Верный ответ:</b> ${esc([].concat(it.acc || it.ans).join(", "))}</p>` : ""}`;
    const blank = (q.picks || {})["—"] || 0;
    body.outerHTML = `<div class="lm-q${stim ? "" : " solo"}">${stim ? `<div class="lm-stim qhtml">${stim}</div>` : ""}<div><div class="lm-stem qhtml">${it.stem || ""}</div>${opts}
      ${M.show.picks ? `<p class="lm-sum">Ответили ${q.n} ${pl(q.n, "ученик", "ученика", "учеников")}, ошиблись ${q.wrong}${blank ? `, без ответа ${blank}` : ""}. Имена не показываются.</p>` : ""}
      <div class="lm-btns"><button type="button" data-lm="picks" aria-pressed="${M.show.picks}">${M.show.picks ? "Скрыть выбор класса" : "Показать выбор класса"}</button><button type="button" data-lm="ans" aria-pressed="${M.show.ans}">${M.show.ans ? "Скрыть ответ" : "Показать ответ"}</button></div>
      ${M.show.ans && it.rat ? `<div class="lm-expl"><span class="label">${it.own ? "Объяснение nurzycom" : "Объяснение College Board"}</span><div class="qhtml">${it.rat}</div>${it.dz || ""}</div>` : ""}</div></div>`;
  }
  function onClick(e) {
    const b = e.target.closest("[data-lm]"); if (!b) return;
    const a = b.dataset.lm;
    if (a === "close") close();
    else if (a === "list") list();
    else if (a === "q") go(+b.dataset.i);
    else if (a === "prev") go(M.cur - 1);
    else if (a === "next") go(M.cur + 1);
    else if (a === "picks" || a === "ans") { M.show[a] = !M.show[a]; const y = M.box.scrollTop; question().then(() => { if (M.box) { M.box.scrollTop = y; const f = M.box.querySelector(`[data-lm="${a}"]`); if (f) f.focus({ preventScroll: true }); } }); }
  }
  window.LSMIST = { open, close, isOpen: () => !!M.box };
})();
