// «Ошибки класса» (2026-11-16): the lesson account (lesson.js loads this file on demand) shows reviews of mistakes on the shared
// screen. The teacher prepares them on teacher.html («Анализ группы» for a group, a student's card for one student): pick lessons
// and tests, «Показать на уроке» writes the questions with mistakes into the lesson account's synced copy as key «ls_m»
// ({ v: 2, list: [review…] }, newest first, up to 8). A group review holds counts and the wrong options chosen, no names; a
// one-student review holds that student's tries and is dropped here a day after it was sent. Nothing here needs the admin key.
// Math questions get two tools beside the question: the College Board Desmos and «Доска», a board for a pen tablet (pressure,
// colours, eraser, undo; one board per question). While a question is open the lesson bar's marks (words, hard question,
// «Сработало», class vote) apply to it.
(function () {
  "use strict";
  if (window.LSMIST) return;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pl = (n, a, b, c) => { const m = n % 100, d = n % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c; };
  const DIFN = { E: "лёгкий", M: "средний", H: "сложный" }, DAY = 864e5, KEEP = { solo: DAY, group: 14 * DAY };
  const DESMOS = "https://www.desmos.com/testing/cb-digital-sat/graphing";
  const M = { box: null, list: [], snap: null, cur: -1, show: { picks: false, ans: false }, bundles: {}, prev: null, opener: null, tool: null, full: false, boards: {}, math: false };
  const css = `
.lm{position:fixed;inset:0;z-index:55;background:var(--paper,#F5F3EE);overflow:auto;padding:28px 20px calc(var(--ls-h,56px) + 48px)}
.lm-in{max-width:1080px;margin:0 auto}
.lm.has-tool .lm-in{max-width:none;margin:0;width:calc(50vw - 40px)}
.lm-h{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:1.5px solid var(--ink,#0F0F0F);padding-bottom:14px;margin-bottom:18px}
.lm-h h2{font:600 clamp(26px,3.4vw,38px)/1.1 var(--sans);margin:4px 0 6px;letter-spacing:-.01em}.lm-h p{margin:0;color:#5E5A54;font-size:15px}
.lm-x{font:500 15px var(--sans);background:transparent;border:1.5px solid var(--studio,#D9D5CD);border-radius:999px;padding:9px 16px;cursor:pointer;white-space:nowrap;color:inherit}
.lm-x:hover,.lm-x:focus-visible{border-color:var(--ink,#0F0F0F)}.lm-x[aria-pressed="true"]{background:var(--ink,#0F0F0F);color:var(--paper,#F5F3EE);border-color:var(--ink,#0F0F0F)}
.lm-x:disabled{opacity:.4;cursor:default}
.lm-list{display:grid;gap:10px;padding:0;margin:0;list-style:none}
.lm-card{width:100%;display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:14px;align-items:center;text-align:left;background:#fff;border:1.5px solid var(--studio,#D9D5CD);border-radius:16px;padding:14px 16px;font:inherit;color:inherit;cursor:pointer}
.lm-card:hover,.lm-card:focus-visible{border-color:var(--ink,#0F0F0F)}
.lm-card .n{font:600 22px/1 var(--sans);text-align:center}.lm-card b{font:600 17px/1.3 var(--sans);display:block}.lm-card small{color:#5E5A54;font-size:14px}
.lm-card .r{text-align:right;font:600 22px/1 var(--sans)}.lm-card .r small{display:block;font:400 13px var(--sans);margin-top:4px}
.lm-rev{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:stretch}.lm-rev .lm-card{grid-template-columns:minmax(0,1fr) auto}
.lm-kind{display:inline-block;font:500 12px var(--sans);letter-spacing:.04em;text-transform:uppercase;color:#5E5A54;margin-bottom:4px}
.lm-trap{color:#A63328}
.lm-nav{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.lm-nav .lm-pos{font:500 15px var(--sans);color:#5E5A54}
.lm.has-tool .lm-nav{position:sticky;top:-28px;z-index:57;background:var(--paper,#F5F3EE);padding:10px 0;margin-top:-10px}.lm-nav span{display:inline-flex;gap:6px;flex-wrap:wrap}
.lm-q{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:28px;align-items:start}
.lm-q.solo,.lm.has-tool .lm-q{grid-template-columns:minmax(0,1fr);gap:16px}
.lm-stim{font-size:18px;line-height:1.6;background:#fff;border:1.5px solid var(--studio,#D9D5CD);border-radius:16px;padding:18px 20px}
.lm-stem{font:600 18px/1.45 var(--sans);margin:0 0 14px}
.lm-o{display:grid;grid-template-columns:34px minmax(0,1fr);gap:12px;align-items:start;background:#fff;border:1.5px solid var(--studio,#D9D5CD);border-radius:14px;padding:12px 14px;margin-bottom:10px;font-size:17px;line-height:1.45}
.lm-o .lt{width:30px;height:30px;border:1.5px solid var(--ink,#0F0F0F);border-radius:50%;display:grid;place-items:center;font:600 14px var(--sans)}
.lm-o .bar{grid-column:2;display:flex;align-items:center;gap:10px;font:500 14px var(--sans);color:#5E5A54}
.lm-o .bar span{flex:1;height:8px;border-radius:999px;background:var(--mist,#ECE9E2);overflow:hidden}.lm-o .bar i{display:block;height:100%;background:#77736D;border-radius:999px}
.lm-o .tag{grid-column:2;font:500 14px var(--sans);color:#A63328}
.lm-o.trap,.lm-o.mine{border-color:#A63328}.lm-o.trap .bar i{background:#A63328}
.lm-o.right{border-color:#1F5A33;background:#F0F6F1}.lm-o.right .lt{background:#1F5A33;border-color:#1F5A33;color:#fff}.lm-o.right .bar i{background:#1F5A33}.lm-o.right .tag{color:#1F5A33}
.lm-btns{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0}
.lm-btns button{font:500 15px var(--sans);border-radius:999px;padding:10px 16px;border:1.5px solid var(--ink,#0F0F0F);background:#fff;cursor:pointer;color:inherit}
.lm-btns button[aria-pressed="true"]{background:var(--ink,#0F0F0F);color:var(--paper,#F5F3EE)}
.lm-spr{font-size:16px;margin:8px 0}.lm-expl{background:var(--mist,#ECE9E2);border-radius:14px;padding:14px 18px;margin-top:16px;font-size:16px;line-height:1.55}
.lm-sum{font:500 15px var(--sans);margin:12px 0 0;color:#5E5A54}
.lm-empty{max-width:640px;font-size:17px;line-height:1.55}
.lm-side{position:fixed;z-index:56;top:16px;right:16px;bottom:calc(var(--ls-h,56px) + 28px);width:calc(50vw - 24px);display:none;flex-direction:column;background:#fff;border:1.5px solid var(--ink,#0F0F0F);border-radius:16px;overflow:hidden}
.lm.has-tool .lm-side{display:flex}.lm.full .lm-side{left:16px;width:auto}
.lm-side-h{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--studio,#D9D5CD);flex-wrap:wrap}
.lm-side-h .sp{flex:1}
.lm-pane{flex:1;min-height:0;display:none;flex-direction:column}.lm-pane.on{display:flex}
.lm-pane iframe{flex:1;width:100%;border:0}
@media(max-width:900px){.lm.has-tool .lm-in{width:auto}.lm-side{left:8px;right:8px;top:max(170px,38vh);width:auto;bottom:calc(var(--ls-h,56px) + 16px)}.lm.has-tool{padding-bottom:calc(62vh + var(--ls-h,56px) + 40px)}.lm.full .lm-side{top:8px;left:8px;height:auto}
  .lm-side-h,.lb-tools{padding:6px 8px;gap:4px}.lm-side-h .lm-x{padding:6px 10px;font-size:14px}.lb-tools button{padding:5px 9px;font-size:13px}.lb-tools .lb-col{width:26px;height:26px}}
@media(max-width:700px){.lm.has-tool .lm-side{top:8px;left:8px;right:8px;bottom:calc(var(--ls-h,56px) + 16px)}}   /* a phone: the tool covers the review, ✕ or Escape brings the question back */
@media(max-width:800px){.lm-q{grid-template-columns:minmax(0,1fr)}.lm-card{grid-template-columns:32px minmax(0,1fr)}.lm-card .r{grid-column:2;text-align:left}}
@media print{.lm{display:none !important}}`;
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: css }));

  // ---------- the reviews sent from the teacher page
  function readList() {
    let d = null; try { d = JSON.parse(localStorage.getItem("ls_m") || "null"); } catch (e) { d = null; }
    const all = !d ? [] : Array.isArray(d.list) ? d.list : Array.isArray(d.qs) ? [Object.assign({ id: "r0", mode: "group" }, d)] : [];
    const now = Date.now(), list = all.filter((r) => r && Array.isArray(r.qs) && now - (r.at || 0) < (KEEP[r.mode] || KEEP.group));
    if (list.length !== all.length) saveList(list);   // a one-student review is gone a day after it was sent
    return list;
  }
  function saveList(list) { try { localStorage.setItem("ls_m", JSON.stringify({ v: 2, list })); } catch (e) { /* storage blocked */ } }
  const day = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) + ", " + new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const pct = (q) => (q.n ? Math.round((100 * q.wrong) / q.n) : 0);
  const trapOf = (q) => { const e = Object.entries(q.picks || {}).filter(([o]) => /^[A-D]$/.test(o)).sort((a, b) => b[1] - a[1])[0]; return e && e[1] >= 2 && e[1] / q.wrong >= 0.6 ? e[0] : ""; };
  const secTitle = (q) => String(q.title || q.id).replace(/ · №\d+$/, "");
  const initials = (n) => String(n || "").split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + ".").join(" ");
  const solo = () => M.snap && M.snap.mode === "solo";
  const tries = (q) => (Array.isArray(q.mine) ? q.mine.filter(Boolean) : []);

  async function open(rid) {   // rid: open this review at once (the lesson home page)
    if (!M.box) {
      M.opener = document.activeElement;
      M.prev = { lq: document.body.dataset.lq, lt: document.body.dataset.lt };   // the page's own question comes back on close
      M.box = document.createElement("div"); M.box.className = "lm"; M.box.setAttribute("role", "dialog"); M.box.setAttribute("aria-label", "Разбор ошибок");
      M.box.innerHTML = '<div class="lm-in"><p class="lm-empty">Загружаю…</p></div>' + sideHTML();
      document.body.appendChild(M.box); document.documentElement.style.overflow = "hidden";
      M.box.addEventListener("click", onClick); document.addEventListener("keydown", onKey);
      M.board = window.LSBOARD ? LSBOARD.create(M.box.querySelector('.lm-pane[data-p="board"]')) : null;   // lsboard.js, loaded with this file by lesson.js
    }
    try { await Promise.race([window.SITE && SITE.sync ? SITE.sync() : null, new Promise((r) => setTimeout(r, 4000))]); } catch (e) { /* offline: show what this device has */ }
    M.list = readList();
    const pick = rid && M.list.find((r) => r.id === rid);
    if (pick || M.list.length === 1) { M.snap = pick || M.list[0]; list(); } else reviews();
  }
  function close() {
    if (!M.box) return;
    M.box.remove(); M.box = null; M.tool = null; M.full = false; document.documentElement.style.overflow = ""; document.removeEventListener("keydown", onKey);
    const p = M.prev || {}; if (p.lq) document.body.dataset.lq = p.lq; else delete document.body.dataset.lq; if (p.lt) document.body.dataset.lt = p.lt; else delete document.body.dataset.lt;
    if (M.opener && M.opener.focus) M.opener.focus();
  }
  function onKey(e) {
    if (!M.box || e.defaultPrevented || document.documentElement.classList.contains("ls-pick") || document.querySelector(".ls-pop")) return;
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (M.tool === "board" && (e.ctrlKey || e.metaKey) && /^[zyя]$/i.test(e.key)) { e.preventDefault(); if (M.board) (e.key.toLowerCase() === "y" || e.shiftKey) ? M.board.redo() : M.board.undo(); return; }
    if (e.key === "Escape") { e.preventDefault(); if (M.full) setFull(false); else if (M.tool) setTool(null); else if (M.cur >= 0) list(); else if (M.snap && M.list.length > 1) reviews(); else close(); }
    else if (M.cur >= 0 && e.key === "ArrowRight" && !e.target.closest(".lm-side")) { e.preventDefault(); go(M.cur + 1); }
    else if (M.cur >= 0 && e.key === "ArrowLeft" && !e.target.closest(".lm-side")) { e.preventDefault(); go(M.cur - 1); }
  }
  const inner = () => M.box.querySelector(".lm-in");
  function head(label, title, sub) {
    return `<div class="lm-h"><div><span class="label">${esc(label)}</span><h2 tabindex="-1">${esc(title)}</h2><p>${sub}</p></div><button type="button" class="lm-x" data-lm="close">Закрыть ✕</button></div>`;
  }
  const kindLabel = (r) => (r.mode === "solo" ? "Индивидуальный разбор" : "Разбор ошибок группы");
  function leaveQuestion() { M.cur = -1; delete document.body.dataset.lq; delete document.body.dataset.lt; setTool(null); }

  // all reviews (when there is more than one): a one-student review shows only initials here, the screen may be a group's
  function reviews() {
    leaveQuestion(); M.snap = null;
    if (!M.list.length) {
      inner().innerHTML = head("Разбор ошибок", "Ошибки класса", "Список пуст") + `<div class="lm-empty"><p>Вопросов для разбора пока нет.</p><p>Как прислать их сюда: на своём устройстве откройте страницу преподавателя. Для группы: вкладка «Анализ группы», выберите группу и уроки. Для одного ученика: вкладка «Ученики», карточка ученика. Затем нажмите «Показать на уроке» и снова «Ошибки класса» здесь.</p></div>`;
      return focusH();
    }
    inner().innerHTML = head("Разбор ошибок", "Что разбираем", `${M.list.length} ${pl(M.list.length, "разбор", "разбора", "разборов")}, новые сверху`) +
      `<ul class="lm-list">${M.list.map((r, i) => `<li class="lm-rev"><button type="button" class="lm-card" data-lm="rev" data-i="${i}"><span><span class="lm-kind">${kindLabel(r)}</span><b>${esc(r.mode === "solo" ? initials(r.group) : r.group)}</b>
        <small>${esc((r.parts || []).slice(0, 3).join(", "))}${(r.parts || []).length > 3 ? ` и ещё ${r.parts.length - 3}` : ""}</small></span><span class="r">${r.qs.length}<small>${pl(r.qs.length, "вопрос", "вопроса", "вопросов")} · ${esc(day(r.at))}</small></span></button>
        <button type="button" class="lm-x" data-lm="del" data-i="${i}" aria-label="Удалить разбор">Удалить</button></li>`).join("")}</ul>`;
    focusH();
  }
  function list() {
    leaveQuestion();
    const d = M.snap, back = M.list.length > 1 ? '<p style="margin:0 0 14px"><button type="button" class="lm-x" data-lm="reviews">← Все разборы</button></p>' : "";
    if (!d || !d.qs.length) return reviews();
    const parts = (d.parts || []).length ? ` · ${esc(d.parts.slice(0, 3).join(", "))}${d.parts.length > 3 ? ` и ещё ${d.parts.length - 3}` : ""}` : d.note ? ` · ${esc(d.note)}` : "";
    inner().innerHTML = head(kindLabel(d), d.group, `обновлено ${esc(day(d.at))} · ${d.qs.length} ${pl(d.qs.length, "вопрос", "вопроса", "вопросов")}${parts}`) + back +
      `<ol class="lm-list">${d.qs.map((q, i) => { const t = trapOf(q), m = tries(q);
        return `<li><button type="button" class="lm-card" data-lm="q" data-i="${i}"><span class="n">${i + 1}</span>
          <span><b>${esc(q.title)}</b><small>${esc(q.sk || "—")}${q.d ? " · " + DIFN[q.d] : ""}${q.work ? " · " + esc(q.work) : ""}${t ? ` · <span class="lm-trap">общая ловушка ${t}</span>` : ""}</small></span>
          ${solo() ? `<span class="r">${m.length ? esc(m.join(" → ")) : "—"}<small>ответ ученика</small></span>` : `<span class="r">${pct(q)}%<small>ошиблись ${q.wrong} из ${q.n}</small></span>`}</button></li>`; }).join("")}</ol>`;
    focusH();
  }
  const focusH = () => { const h = M.box && M.box.querySelector(".lm-in h2"); if (h) h.focus({ preventScroll: true }); if (M.box) M.box.scrollTop = 0; };
  function go(i) { if (!M.snap || i < 0 || i >= M.snap.qs.length) return; M.cur = i; M.show = { picks: false, ans: false }; question(); }

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
    const q = M.snap.qs[M.cur], i = M.cur, n = M.snap.qs.length;
    M.math = q.sec === "math"; if (M.tool === "desmos" && !M.math) setTool(null);
    document.body.dataset.lq = q.id; document.body.dataset.lt = "Разбор ошибок · " + secTitle(q);   // the lesson bar's marks apply to this question
    setTimeout(() => window.LESSON && LESSON.tick && LESSON.tick(), 0);   // recorded on the timeline at once (after the nav with its marker is drawn)
    if (M.board) M.board.show(q.id);
    const tools = `${M.math ? `<button type="button" class="lm-x" data-lm="desmos" aria-pressed="${M.tool === "desmos"}">Desmos</button>` : ""}<button type="button" class="lm-x" data-lm="board" aria-pressed="${M.tool === "board"}">Доска</button>`;
    const nav = `<div class="lm-nav"><button type="button" class="lm-x" data-lm="list">← Все вопросы</button><span class="lm-pos" id="ls-mq">Вопрос ${i + 1} из ${n}</span>
      <span>${tools}<button type="button" class="lm-x" data-lm="prev"${i ? "" : " disabled"}>← Назад</button><button type="button" class="lm-x" data-lm="next"${i < n - 1 ? "" : " disabled"}>Далее →</button></span></div>`;
    inner().innerHTML = head(kindLabel(M.snap), M.snap.group, `${esc(q.title)} · ${esc(q.sk || "—")}`) + nav + '<p class="lm-empty">Загружаю вопрос…</p>';
    let it = null; try { it = await item(q); } catch (e) { it = null; }
    if (M.cur !== i || !M.box) return;
    const body = inner().querySelector(".lm-empty");
    if (!it) { body.textContent = "Не удалось открыть этот вопрос. Обновите страницу или перейдите к следующему."; return; }
    const stim = String(it.stim || "").trim(), mc = !!(it.opts && it.opts.length), one = solo(), m = tries(q);
    let opts, sum = "";
    if (one) {
      const tag = (c) => { const k = m.indexOf(c); return k < 0 ? "" : m.length > 1 ? `${k + 1}-я попытка ученика` : "ответ ученика"; };
      opts = mc ? it.opts.map((o, k) => { const c = "ABCD"[k], t = M.show.picks ? tag(c) : "", ok = M.show.ans && c === it.ans;
          return `<div class="lm-o${ok ? " right" : ""}${t && !ok ? " mine" : ""}"><span class="lt">${c}</span><span class="qhtml tx">${o}</span>${t || ok ? `<span class="tag">${[ok ? "верный ответ" : "", t].filter(Boolean).join(" · ")}</span>` : ""}</div>`; }).join("")
        : `<p class="lm-spr">Ответ вводится вручную.</p>${M.show.picks ? `<p class="lm-spr">Ответ ученика: ${esc(m.join(" → ") || "без ответа")}</p>` : ""}${M.show.ans ? `<p class="lm-spr"><b>Верный ответ:</b> ${esc([].concat(it.acc || it.ans).join(", "))}</p>` : ""}`;
    } else {
      const right = q.n - q.wrong, trap = trapOf(q), max = Math.max(1, right, ...Object.values(q.picks || {})), cnt = (c) => (c === it.ans ? right : (q.picks || {})[c] || 0);
      opts = mc ? it.opts.map((o, k) => { const c = "ABCD"[k], v = cnt(c);
          const cls = `${M.show.ans && c === it.ans ? " right" : ""}${M.show.picks && !M.show.ans && c === trap ? " trap" : ""}`;
          return `<div class="lm-o${cls}"><span class="lt">${c}</span><span class="qhtml tx">${o}</span>${M.show.picks ? `<span class="bar"><span><i style="width:${Math.round((100 * v) / max)}%"></i></span>${v} ${pl(v, "ученик", "ученика", "учеников")}</span>` : ""}</div>`; }).join("")
        : `<p class="lm-spr">Ответ вводится вручную.</p>${M.show.picks ? `<p class="lm-spr">Неверные ответы: ${esc(Object.entries(q.picks || {}).map(([v, c]) => `${v} (${c})`).join(", ") || "—")} · верно ответили: ${right}</p>` : ""}${M.show.ans ? `<p class="lm-spr"><b>Верный ответ:</b> ${esc([].concat(it.acc || it.ans).join(", "))}</p>` : ""}`;
      const blank = (q.picks || {})["—"] || 0;
      if (M.show.picks) sum = `<p class="lm-sum">Ответили ${q.n} ${pl(q.n, "ученик", "ученика", "учеников")}, ошиблись ${q.wrong}${blank ? `, без ответа ${blank}` : ""}. Имена не показываются.</p>`;
    }
    const pick = one ? (M.show.picks ? "Скрыть ответ ученика" : "Показать ответ ученика") : M.show.picks ? "Скрыть выбор класса" : "Показать выбор класса";
    body.outerHTML = `<div class="lm-q${stim ? "" : " solo"}">${stim ? `<div class="lm-stim qhtml">${stim}</div>` : ""}<div><div class="lm-stem qhtml">${it.stem || ""}</div>${opts}${sum}
      <div class="lm-btns"><button type="button" data-lm="picks" aria-pressed="${M.show.picks}">${pick}</button><button type="button" data-lm="ans" aria-pressed="${M.show.ans}">${M.show.ans ? "Скрыть ответ" : "Показать ответ"}</button></div>
      ${M.show.ans && it.rat ? `<div class="lm-expl"><span class="label">${it.own ? "Объяснение nurzycom" : "Объяснение College Board"}</span><div class="qhtml">${it.rat}</div>${it.dz || ""}</div>` : ""}</div></div>`;
  }
  function onClick(e) {
    const b = e.target.closest("[data-lm]"); if (!b) return;
    const a = b.dataset.lm;
    if (a === "close") close();
    else if (a === "reviews") reviews();
    else if (a === "rev") { M.snap = M.list[+b.dataset.i]; list(); }
    else if (a === "del") { M.list.splice(+b.dataset.i, 1); saveList(M.list); reviews(); }
    else if (a === "list") list();
    else if (a === "q") go(+b.dataset.i);
    else if (a === "prev") go(M.cur - 1);
    else if (a === "next") go(M.cur + 1);
    else if (a === "desmos" || a === "board") setTool(M.tool === a ? null : a);
    else if (a === "full") setFull(!M.full);
    else if (a === "picks" || a === "ans") { M.show[a] = !M.show[a]; const y = M.box.scrollTop; question().then(() => { if (M.box) { M.box.scrollTop = y; const f = M.box.querySelector(`.lm-btns [data-lm="${a}"]`); if (f) f.focus({ preventScroll: true }); } }); }
  }

  // ---------- tools beside the question: Desmos (Math) and the board (both kept for the whole review)
  function sideHTML() {
    return `<aside class="lm-side" aria-label="Инструменты"><div class="lm-side-h"><button type="button" class="lm-x" data-lm="desmos" data-tab="desmos">Desmos</button><button type="button" class="lm-x" data-lm="board" data-tab="board">Доска</button><span class="sp"></span>
      <button type="button" class="lm-x" data-lm="full" aria-pressed="false">Во весь экран</button><button type="button" class="lm-x" data-lm="${"desmos"}" data-close="1" aria-label="Закрыть инструмент">✕</button></div>
      <div class="lm-pane" data-p="desmos"><iframe title="Графический калькулятор Desmos" src="about:blank" allow="clipboard-write"></iframe></div><div class="lm-pane" data-p="board"></div></aside>`;
  }
  function setTool(t) {
    if (!M.box) return;
    M.tool = t; if (!t) M.full = false;
    M.box.classList.toggle("has-tool", !!t); M.box.classList.toggle("full", !!t && M.full);
    const side = M.box.querySelector(".lm-side");
    side.querySelectorAll(".lm-pane").forEach((p) => p.classList.toggle("on", p.dataset.p === t));
    side.querySelector('[data-tab="desmos"]').hidden = !M.math;
    side.querySelectorAll("[data-tab]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.tab === t)));
    const cl = side.querySelector("[data-close]"); cl.dataset.lm = t || "board";   // ✕ toggles the open tool off
    side.querySelector('[data-lm="full"]').setAttribute("aria-pressed", String(M.full));
    if (t === "desmos") { const f = side.querySelector("iframe"); if (f.src === "about:blank") f.src = DESMOS; }   // load once, the work stays between questions
    if (t === "board" && M.board) requestAnimationFrame(M.board.fit);
    M.box.querySelectorAll('.lm-nav [data-lm="desmos"], .lm-nav [data-lm="board"]').forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.lm === t)));
  }
  function setFull(on) { M.full = !!on && !!M.tool; M.box.classList.toggle("full", M.full); M.box.querySelector('.lm-side [data-lm="full"]').setAttribute("aria-pressed", String(M.full)); if (M.tool === "board" && M.board) requestAnimationFrame(M.board.fit); }


  window.LSMIST = { open, close, isOpen: () => !!M.box, reviews: readList };
})();
