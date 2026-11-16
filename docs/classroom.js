// «Пульт урока» (classroom.html, 2026-11-16, Nurassyl: «prepare a space where I can put my presentations on lesson account,
// enhance its UI/UX since it is now more interactive live-lesson platform»): the lesson account's home page.
//  · Сейчас: start a lesson with one tap (the names of prepared reviews and recent groups), or see the running one and end it.
//  · Разбор ошибок: the reviews prepared on the teacher page («Подготовить урок» / «Показать на уроке»), opened in lsmist.js.
//  · Презентации и материалы: a tile per lesson; its presentation (data/decks.bin, filled later with tools/private/deckpack.mjs),
//    its workbook parts and its words. A presentation opens full screen with a board over the slide.
//  · Слова с уроков: words marked in lessons and whether they are in the deck «VL» yet (filled every two days by /lesson-review).
//  · Прошлые уроки: the last finished lessons of this account.
// Students never see this page: it is not in the menu and it shows nothing without the lesson login.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pl = (n, a, b, c) => { const m = n % 100, d = n % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c; };
  const day = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const time = (t) => new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const initials = (n) => String(n || "").split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + ".").join(" ");
  const store = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const C = { lessons: [], vocab: null, decks: [], course: store("cr_course") || "V", open: null, bundles: {} };

  function sessions() {
    const out = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.indexOf("ls_s_") === 0) { try { const s = JSON.parse(localStorage.getItem(k)); if (s && Array.isArray(s.ev)) out.push(s); } catch (e) { /* not a session */ } } } } catch (e) { /* storage blocked */ }
    return out.sort((a, b) => b.t0 - a.t0);
  }
  function reviews() {
    let d = null; try { d = JSON.parse(store("ls_m") || "null"); } catch (e) { d = null; }
    const all = !d ? [] : Array.isArray(d.list) ? d.list : d.qs ? [Object.assign({ id: "r0", mode: "group" }, d)] : [];
    const keep = { solo: 864e5, group: 14 * 864e5 };
    return all.filter((r) => r && Array.isArray(r.qs) && Date.now() - (r.at || 0) < (keep[r.mode] || keep.group));
  }
  const shown = (r) => (r.mode === "solo" ? initials(r.group) : r.group);   // the screen may be a group's: a student shows as initials

  // ---------- Сейчас
  function now() {
    const S = window.LESSON && LESSON.session(), box = $("cr-now");
    if (S) {
      const m = Math.max(0, Math.round((Date.now() - S.t0) / 60000)), marks = S.ev.filter((e) => e.k !== "at").length;
      const rv = reviews().find((r) => r.group.trim().toLowerCase() === S.group.trim().toLowerCase());
      box.innerHTML = `<span class="live"><i aria-hidden="true"></i>Идёт урок · ${esc(S.group)} · ${m} мин · отметок: ${marks}</span>
        ${rv ? `<button type="button" class="cr-chip main" data-rv="${esc(rv.id)}">Разбор ошибок: ${rv.qs.length} ${pl(rv.qs.length, "вопрос", "вопроса", "вопросов")}</button>` : ""}
        <button type="button" class="cr-chip" data-end="1">Завершить урок</button>`;
      return;
    }
    const names = [], seen = new Set(), add = (v, label) => { const k = v.trim().toLowerCase(); if (!v || seen.has(k)) return; seen.add(k); names.push([v, label]); };
    reviews().forEach((r) => add(r.group, shown(r)));
    ((window.LESSON && LESSON.groups()) || []).slice(0, 6).forEach((g) => add(g, g));
    box.innerHTML = `${names.slice(0, 8).map(([v, label]) => `<button type="button" class="cr-chip" data-start="${esc(v)}">Начать: ${esc(label)}</button>`).join("")}
      <button type="button" class="cr-chip main" data-ask="1">${names.length ? "Другой урок…" : "Начать урок"}</button>`;
  }

  // ---------- the page
  function render() {
    now();
    const rv = reviews(), ss = sessions().filter((s) => s.t1).slice(0, 6);
    const body = $("cr-body");
    body.innerHTML = `<div class="cr-grid">
      <div class="cr-card" id="cr-rv"><h2>Разбор ошибок</h2><p class="cr-sub">Разборы, подготовленные на странице преподавателя. Нажмите, чтобы открыть на весь экран.</p>
        ${rv.length ? `<ul class="cr-list">${rv.map((r) => `<li><button type="button" class="cr-item" data-rv="${esc(r.id)}"><span><span class="cr-kind">${r.mode === "solo" ? "Индивидуальный разбор" : "Группа"}</span><b>${esc(shown(r))}</b>
          <small>${esc((r.parts || []).slice(0, 2).join(", "))}${(r.parts || []).length > 2 ? ` и ещё ${r.parts.length - 2}` : ""} · ${esc(day(r.at))}</small></span><span class="r">${r.qs.length}</span></button></li>`).join("")}</ul>`
          : '<p class="cr-empty">Пока пусто. На своём устройстве откройте страницу преподавателя: «Анализ группы» для группы или карточку ученика, затем «Подготовить урок».</p>'}</div>
      <div class="cr-card" id="cr-words-card"><h2>Слова с уроков</h2><p class="cr-sub">Слова, отмеченные на уроках. Раз в два дня они получают определение и перевод и подчёркиваются на сайте, как слова курса.</p><div id="cr-words"><p class="cr-empty">Загружаю…</p></div></div>
      <div class="cr-card cr-wide" id="cr-lessons"><h2>Презентации и материалы</h2><p class="cr-sub">Выберите урок: его презентация, части рабочей тетради и слова.</p>
        <div class="cr-tabs" role="group" aria-label="Курс"><button type="button" data-course="V" aria-pressed="${C.course === "V"}">SAT Verbal</button><button type="button" data-course="M" aria-pressed="${C.course === "M"}">SAT Math</button></div>
        <div class="cr-tiles" id="cr-tiles"></div><div id="cr-panel"></div></div>
      <div class="cr-card cr-wide"><h2>Прошлые уроки</h2>${ss.length ? `<ul class="cr-list">${ss.map((s) => { const parts = [...new Set(s.ev.filter((e) => e.k === "at" && e.q && e.ti).map((e) => e.ti.replace(/^Разбор ошибок · /, "")))];
          const n = (k) => s.ev.filter((e) => e.k === k).length;
          return `<li><div class="cr-item" style="cursor:default"><span><b>${esc(s.group)}</b><small>${esc(day(s.t0))}, ${esc(time(s.t0))} · ${Math.round((s.t1 - s.t0) / 60000)} мин${parts.length ? " · " + esc(parts.slice(0, 2).join(", ")) + (parts.length > 2 ? ` и ещё ${parts.length - 2}` : "") : ""}</small></span>
            <small>слов: ${n("word")} · вопросов: ${n("flag")}</small></div></li>`; }).join("")}</ul>` : '<p class="cr-empty">Здесь появятся уроки после «Завершить».</p>'}
        <p class="cr-note">Подробный разбор каждого урока: кабинет преподавателя → «Уроки».</p></div></div>`;
    tiles(); words();
  }
  function tiles() {
    const ls = C.lessons.filter((l) => l.tag[0] === C.course), box = $("cr-tiles"); if (!box) return;
    const deck = (tag) => C.decks.find((d) => d.id === tag);
    box.innerHTML = ls.length ? ls.map((l) => { const d = deck(l.tag), no = /^\D\d+$/.test(l.tag) ? String(Number(l.tag.slice(1))) : l.tag.slice(1);
      return `<button type="button" class="cr-tile" data-l="${esc(l.tag)}" aria-expanded="${C.open === l.tag}"><span class="no">${esc(no)}</span><span class="nm">${esc(String(l.title).split(" · ").slice(2).join(" · ") || l.title)}</span>
        <span class="st${d ? " ok" : ""}">${d ? `презентация · ${d.n} ${pl(d.n, "слайд", "слайда", "слайдов")}` : "презентация скоро"}</span></button>`; }).join("") : '<p class="cr-empty">Уроки не загрузились. Обновите страницу.</p>';
    panel();
  }
  function panel() {
    const box = $("cr-panel"), l = C.lessons.find((x) => x.tag === C.open); if (!box) return;
    if (!l) { box.innerHTML = ""; return; }
    const d = C.decks.find((x) => x.id === l.tag);
    box.innerHTML = `<div class="cr-panel"><h3>${esc(l.title)}</h3><div class="cr-acts">
        ${d ? `<button type="button" class="main" data-deck="${esc(d.id)}">Открыть презентацию · ${d.n} ${pl(d.n, "слайд", "слайда", "слайдов")}</button>` : '<button type="button" disabled>Презентация появится здесь</button>'}
        ${l.parts.map((p) => `<a href="./?l=${encodeURIComponent(l.tag)}&p=${encodeURIComponent(p.id)}">${esc(p.title)}</a>`).join("")}
        <a href="vocab.html?l=${encodeURIComponent(l.tag)}">${C.course === "V" ? "Слова урока" : "Термины урока"}</a></div>
      ${d ? "" : '<p class="cr-note">Когда презентации будут готовы, Claude положит их сюда: по одной на урок, слайды открываются на весь экран, поверх можно рисовать.</p>'}</div>`;
  }
  function words() {
    const box = $("cr-words"); if (!box) return;
    const deck = C.vocab && C.vocab.lessons.find((l) => l.tag === "VL"), inDeck = {}, set = new Set(((deck && deck.skip) || []).map((x) => String(x.w).toLowerCase()));
    ((deck && deck.groups[0].items) || []).forEach((it) => [it.en].concat(it.marked || []).forEach((w) => (inDeck[String(w).toLowerCase()] = it)));   // the marked form («interspersing») and the dictionary form
    const course = new Set(); ((C.vocab && C.vocab.lessons) || []).filter((l) => l.tag !== "VL").forEach((l) => l.groups.forEach((g) => g.items.forEach((it) => course.add(String(it.en).toLowerCase()))));
    const W = []; const seen = new Set();
    sessions().forEach((s) => s.ev.filter((e) => e.k === "word").forEach((e) => { const k = e.w.toLowerCase(); if (seen.has(k)) return; seen.add(k); W.push(e.w); }));
    if (!W.length) { box.innerHTML = '<p class="cr-empty">Пока нет. На уроке выделите слово в тексте или нажмите «Слово» на панели и затем само слово.</p>'; return; }
    box.innerHTML = `<div class="cr-words">${W.slice(0, 30).map((w) => { const k = w.toLowerCase(), it = inDeck[k];
      const st = it ? '<small class="ok">в словаре</small>' : course.has(k) ? '<small class="ok">уже в словаре курса</small>' : set.has(k) ? "<small>не берём</small>" : '<small class="wait">ждёт разбора</small>';
      return `<div class="cr-w"><span><b lang="en">${esc(w)}</b>${it ? ` — ${esc(it.ru)}` : ""}</span>${st}</div>`; }).join("")}</div>
      ${deck ? `<p class="cr-note"><a href="vocab.html?l=VL">Колода «Слова с уроков» · ${deck.groups[0].items.length} ${pl(deck.groups[0].items.length, "слово", "слова", "слов")}</a></p>` : ""}`;
  }

  // ---------- presentation viewer: slides as images, full screen, arrows / PageDown (a clicker), a board over the slide
  const DK = { box: null, d: null, slides: [], i: 0, board: null, prev: null };   // slides: a promise of an image address per slide
  async function openDeck(id) {
    const d = C.decks.find((x) => x.id === id); if (!d) return;
    DK.prev = { lq: document.body.dataset.lq, lt: document.body.dataset.lt };
    DK.box = document.createElement("div"); DK.box.className = "dk"; DK.box.setAttribute("role", "dialog"); DK.box.setAttribute("aria-label", "Презентация");
    DK.box.innerHTML = `<div class="dk-bar"><b>${esc(d.title)}</b><button type="button" data-k="prev" aria-label="Предыдущий слайд">←</button><span class="dk-pos" id="dk-pos" aria-live="polite">Загружаю…</span><button type="button" data-k="next" aria-label="Следующий слайд">→</button>
      <button type="button" data-k="draw" aria-pressed="false">Рисовать</button><button type="button" data-k="fs">Во весь экран</button><button type="button" data-k="x" aria-label="Закрыть презентацию">✕</button></div>
      <div class="dk-stage"><div class="dk-frame" style="--ar:${d.w && d.h ? `${d.w}/${d.h}` : "16/9"}"><img alt=""><div class="dk-draw"></div><button type="button" class="dk-nav prev" data-k="prev" tabindex="-1">Назад</button><button type="button" class="dk-nav next" data-k="next" tabindex="-1">Далее</button></div></div>`;
    document.body.appendChild(DK.box); document.documentElement.style.overflow = "hidden";
    DK.board = window.LSBOARD ? LSBOARD.create(DK.box.querySelector(".dk-draw"), { clear: true }) : null;
    DK.box.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b) return; ({ prev: () => go(DK.i - 1), next: () => go(DK.i + 1), draw: toggleDraw, fs: fullscreen, x: closeDeck })[b.dataset.k](); });
    document.addEventListener("keydown", onKey);
    DK.d = d; DK.slides = Array.from({ length: d.n }); go(Math.min(d.n - 1, Math.max(0, Number(store("dk_pos_" + id)) || 0)));
  }
  // one encrypted image per slide (tools/private/deckpack.mjs), fetched when shown; the next one is fetched ahead
  function slide(i) {
    const d = DK.d; if (!d || i < 0 || i >= d.n) return null;
    if (!DK.slides[i]) DK.slides[i] = fetch(`${d.dir}/${i + 1}.bin`).then((r) => { if (!r.ok) throw new Error("slide " + r.status); return r.arrayBuffer(); })
      .then((b) => SITE.open(b)).then((u) => URL.createObjectURL(new Blob([u], { type: "image/" + (d.fmt || "jpeg") })));
    return DK.slides[i];
  }
  function go(i) {
    if (!DK.d || i < 0 || i >= DK.d.n) return;
    DK.i = i; $("dk-pos").textContent = `${i + 1} / ${DK.d.n}`;
    const img = DK.box.querySelector("img");
    slide(i).then((url) => { if (DK.box && DK.i === i) { img.src = url; img.alt = `Слайд ${i + 1}`; } }).catch(() => { if (DK.box && DK.i === i) $("dk-pos").textContent = `${i + 1} / ${DK.d.n} · не загрузился`; });
    slide(i + 1);
    try { localStorage.setItem("dk_pos_" + DK.d.id, String(i)); } catch (e) { /* storage blocked */ }
    document.body.dataset.lq = `DECK.${DK.d.id}.${i + 1}`; document.body.dataset.lt = `Презентация · ${DK.d.title}`;   // the lesson's timeline records the slides
    if (window.LESSON && LESSON.tick) LESSON.tick();   // at once, a quick flip through slides is recorded too
    if (DK.board) DK.board.show(`${DK.d.id}.${i}`);
  }
  function toggleDraw() { const on = DK.box.classList.toggle("drawing"); DK.box.querySelector('[data-k="draw"]').setAttribute("aria-pressed", String(on)); if (on && DK.board) requestAnimationFrame(DK.board.fit); }
  function fullscreen() { if (document.fullscreenElement) document.exitFullscreen(); else if (DK.box.requestFullscreen) DK.box.requestFullscreen().catch(() => {}); }
  function onKey(e) {
    if (!DK.box || e.defaultPrevented || document.documentElement.classList.contains("ls-pick") || document.querySelector(".ls-pop")) return;
    const drawing = DK.box.classList.contains("drawing");
    if (drawing && (e.ctrlKey || e.metaKey) && /^[zyя]$/i.test(e.key)) { e.preventDefault(); if (DK.board) (e.key.toLowerCase() === "y" || e.shiftKey) ? DK.board.redo() : DK.board.undo(); return; }
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key) && !(e.key === "Enter" && e.target.tagName === "BUTTON")) { e.preventDefault(); go(DK.i + 1); }
    else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); go(DK.i - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); } else if (e.key === "End") { e.preventDefault(); go(DK.d ? DK.d.n - 1 : 0); }
    else if (e.key === "Escape" && !document.fullscreenElement) { e.preventDefault(); if (drawing) toggleDraw(); else closeDeck(); }
  }
  function closeDeck() {
    if (!DK.box) return; if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    DK.slides.forEach((p) => p && p.then((u) => URL.revokeObjectURL(u)).catch(() => {})); DK.slides = [];
    DK.box.remove(); DK.box = null; DK.d = null; document.documentElement.style.overflow = ""; document.removeEventListener("keydown", onKey);
    const p = DK.prev || {}; if (p.lq) document.body.dataset.lq = p.lq; else delete document.body.dataset.lq; if (p.lt) document.body.dataset.lt = p.lt; else delete document.body.dataset.lt;
    const t = document.querySelector(`.cr-acts [data-deck]`); if (t) t.focus();
  }

  // ---------- events and start
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-start],[data-ask],[data-end],[data-rv],[data-course],[data-l],[data-deck]"); if (!b || !window.LESSON || (DK.box && DK.box.contains(b))) return;
    if (b.dataset.start) LESSON.begin(b.dataset.start, true);
    else if (b.dataset.ask) LESSON.ask();
    else if (b.dataset.end) LESSON.end();
    else if (b.dataset.rv) LESSON.openMist(b.dataset.rv);
    else if (b.dataset.course) { C.course = b.dataset.course; C.open = null; try { localStorage.setItem("cr_course", C.course); } catch (x) { /* blocked */ } document.querySelectorAll("[data-course]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.course === C.course))); tiles(); }
    else if (b.dataset.l) { C.open = C.open === b.dataset.l ? null : b.dataset.l; document.querySelectorAll(".cr-tile").forEach((x) => x.setAttribute("aria-expanded", String(x.dataset.l === C.open))); panel(); }
    else if (b.dataset.deck) openDeck(b.dataset.deck);
  });
  document.addEventListener("ls-change", now);
  window.addEventListener("DOMContentLoaded", () => {
    if (!window.SITE) return;
    SITE.ready.then(async () => {
      if (!/^lesson(-[a-z0-9]+)?$/.test(SITE.me() || "")) { $("cr-body").innerHTML = '<p class="cr-empty">Эта страница для аккаунта урока. Войдите на сайт под логином урока.</p>'; $("cr-now").innerHTML = ""; return; }
      for (let i = 0; i < 100 && !window.LESSON; i++) await new Promise((r) => setTimeout(r, 100));   // lesson.js is loaded by auth.js
      try { if (SITE.sync) await Promise.race([SITE.sync(), new Promise((r) => setTimeout(r, 4000))]); } catch (e) { /* offline */ }
      const [L, V, D] = await Promise.all([SITE.json("lessons").catch(() => null), SITE.json("vocab").catch(() => null), SITE.json("decks").catch(() => null)]);
      C.lessons = ((L && (L.lessons || L)) || []).filter((l) => l && l.tag && Array.isArray(l.parts) && /^[VM]/.test(l.tag));
      C.vocab = V; C.decks = (D && D.decks) || [];
      render(); setInterval(now, 30000);
    });
  });
  window.CLASSROOM = { openDeck, render };
})();
