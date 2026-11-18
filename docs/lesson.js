// «Режим урока» (2026-11-16): the teacher's capture bar for live lessons. auth.js loads this file only for the lesson
// account (login «lesson» or «lesson-…»), so students never download it. During a lesson the teacher marks what the class
// struggled with; nothing is analysed here. Everything goes into one session record, localStorage «ls_s_<id>», which
// travels with the account like results do (encrypted with the master key). Later the /lesson-review skill reads the
// sessions (tools/private/lessonlog.js) and turns them into definitions, hints and follow-up work.
// The lesson's parts are not typed in: every page script writes the part on screen to <body data-lt> («SAT Verbal · Урок 7 ·
// Практика», «Пробный тест 5 · Reading and Writing · Модуль 1») and each «at» event carries it, so the cabinet and the review
// see what was opened with the class and for how long.
// Events: at (which question is on screen, logged by itself → the lesson timeline), word (a selected word with its
// sentence), flag (hard question + reason), note («Сработало»: the explanation that worked), vote (the option most of the
// class chose). The account is not a student: its results are never sent to the Google Form.
(function () {
  "use strict";
  if (window.LESSON) return;
  const LS = (() => { try { return window.localStorage; } catch (e) { return null; } })(); if (!LS) return;
  const CUR = "ls_cur", KEY = (id) => "ls_s_" + id;
  const WHY = [["text", "Не поняли текст"], ["rule", "Не знали правило"], ["trap", "Попались в ловушку"], ["slow", "Слишком долго"], ["bug", "Ошибка в вопросе"]];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
  const PAGES = { classroom: "Пульт урока", index: "Домашние задания", plan: "План курса", vocab: "Словарь", reading: "Тексты", practice: "Сложные вопросы", mock: "Пробные тесты", useful: "Полезное", archaic: "Архаичные слова", desmos: "Desmos", circle: "Единичная окружность", mytest: "Тесты преподавателя" };
  // «Ошибки класса»: the group's hardest questions sent from the teacher page (lsmist.js, loaded on first use)
  const VER = ((document.currentScript && document.currentScript.src) || "").split("?")[1] || "";
  // scripts loaded on first use: the board (lsboard.js) and the review (lsmist.js)
  function need(name, test) {
    if (test()) return Promise.resolve();
    return new Promise((ok, bad) => { const s = document.createElement("script"); s.src = name + (VER ? "?" + VER : ""); s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
  }
  function openMist(rid) {
    need("lsboard.js", () => window.LSBOARD).then(() => need("lsmist.js", () => window.LSMIST)).then(() => LSMIST.open(typeof rid === "string" ? rid : undefined))
      .catch(() => toast("Не удалось загрузить разбор ошибок. Обновите страницу."));
  }
  const HOME = /classroom\.html$/.test(location.pathname) ? "" : '<button type="button" data-a="home">Пульт урока</button>';   // the lesson home page (classroom.html)
  let S = null, lastAt = null, lastTi = null, undoTimer = 0;

  // results of this account stay off the teacher's Google Form (it would look like one more student)
  const rawFetch = window.fetch.bind(window);
  window.fetch = function (u, o) {
    const form = window.CFG && window.CFG.formAction;
    if (form && String(u && u.url ? u.url : u).indexOf(form) === 0) return Promise.resolve(new Response("", { status: 200 }));
    return rawFetch(u, o);
  };

  function load() { const id = LS.getItem(CUR); if (!id) return null; try { const s = JSON.parse(LS.getItem(KEY(id))); return s && !s.t1 ? s : null; } catch (e) { return null; } }
  function save() { try { LS.setItem(KEY(S.id), JSON.stringify(S)); } catch (e) { toast("Память браузера заполнена: отметка не сохранена."); } }
  // which question is on screen: solve.js and mock.js write it to <body data-lq>; it counts only while the question view is visible
  function where() {
    const page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
    const on = ["dk-pos", "ls-mq", "sv-qn", "qnum", "qn", "r-read"].some((id) => { const e = document.getElementById(id); return e && e.offsetParent; });
    return { p: page, q: on ? document.body.dataset.lq || "" : "", ti: on && document.body.dataset.lq ? document.body.dataset.lt || "" : PAGES[page] || page };
  }
  function log(ev, quiet) {
    if (!S) return; const w = where();
    S.ev.push(Object.assign({ t: Date.now(), p: w.p, q: w.q, ti: w.ti }, ev)); save();
    if (!quiet) count();
  }
  function watch() {
    if (!S) return; const w = where(), k = w.p + "|" + w.q; if (k === lastAt) return;
    lastAt = k; log({ k: "at" }, true);
    if (w.q && w.ti !== lastTi) { if (!toastEl) toast("Раздел урока: " + w.ti); }   // the teacher sees that the part was recognised
    lastTi = w.ti;
  }

  // The lesson countdown follows the visible question independently of the test's own clock.
  let timerButton, timerStatus, timerQuestion = "", deadline = 0;
  let timed = sessionStorage.getItem("ls_timed") === "1";
  function updateTimer() {
    if (!timerButton) return;
    const page = document.querySelector("#sv-qn, #qnum, #qn");
    const question = page && page.offsetParent ? document.body.dataset.lq || "" : "";
    if (timerButton.hidden === Boolean(question)) {
      timerButton.hidden = !question;
      place();
    }
    if (question !== timerQuestion) {
      timerQuestion = question;
      deadline = timed && question ? Date.now() + 45000 : 0;
    }
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    const label = !timed ? "Таймер · 45 с" : seconds ? seconds + " с · Стоп" : "Время вышло · Стоп";
    if (timerButton.textContent !== label) timerButton.textContent = label;
    timerButton.setAttribute("aria-pressed", String(timed));
    timerButton.classList.toggle("ls-time-low", timed && !!question && seconds <= 10);
    const status = timed && question && !seconds ? "Время на вопрос вышло." : "";
    if (timerStatus.textContent !== status) timerStatus.textContent = status;
  }
  function toggleTimer() {
    timed = !timed;
    sessionStorage.setItem("ls_timed", timed ? "1" : "0");
    timerQuestion = "";
    updateTimer();
  }

  // ---- the bar
  const css = `
.ls-bar{position:fixed;z-index:60;left:50%;bottom:12px;transform:translateX(-50%);display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;
  max-width:calc(100vw - 16px);background:#0F0F0F;color:#F5F3EE;padding:8px 10px;border-radius:14px;box-shadow:0 6px 24px rgba(15,15,15,.28);font:500 13px/1.2 var(--sans)}
.ls-bar button{font:500 13px/1 var(--sans);color:#F5F3EE;background:transparent;border:1px solid rgba(245,243,238,.32);border-radius:999px;padding:8px 12px;cursor:pointer}
.ls-bar button:hover,.ls-bar button:focus-visible{background:#F5F3EE;color:#0F0F0F}
.ls-bar button.ls-time-low{background:#A63328;color:#fff;border-color:#A63328}
.ls-timer-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.ls-bar .ls-main{background:#F5F3EE;color:#0F0F0F;border-color:#F5F3EE}
.ls-bar .ls-st{display:flex;align-items:center;gap:7px;padding:0 6px 0 4px;white-space:nowrap}
.ls-bar .ls-dot{width:9px;height:9px;border-radius:50%;background:#A63328;flex:none}
.ls-bar .ls-vote{display:flex;align-items:center;gap:4px;padding-left:4px;color:rgba(245,243,238,.7)}
.ls-bar .ls-vote button{width:32px;padding:8px 0}
.ls-bar .ls-vote button[aria-pressed="true"],.ls-bar button[data-a="word"][aria-pressed="true"]{background:#A63328;border-color:#A63328;color:#fff}
html.ls-pick body,html.ls-pick body *{cursor:crosshair !important}html.ls-pick .ls-bar,html.ls-pick .ls-bar *{cursor:pointer !important}
.ls-bar.ls-min > :not(.ls-st):not(.ls-tg):not([data-a="timer"]):not(.ls-timer-status){display:none}
.ls-bar.ls-min{flex-wrap:nowrap}
.ls-pop{position:fixed;z-index:61;left:50%;bottom:calc(var(--ls-h,56px) + 22px);transform:translateX(-50%);width:min(440px,calc(100vw - 16px));background:#fff;color:#0F0F0F;border:1.5px solid #0F0F0F;border-radius:16px;padding:16px;box-shadow:0 10px 32px rgba(15,15,15,.25);font:400 15px/1.4 var(--sans)}
.ls-pop h4{margin:0 0 10px;font:600 16px/1.3 var(--sans)}
.ls-pop label{display:block;font:500 13px var(--sans);margin:10px 0 4px}
.ls-pop input[type=text]{width:100%;font:400 15px var(--sans);padding:10px 12px;border:1.5px solid #D9D5CD;border-radius:10px;background:#fff}
.ls-pop .ls-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.ls-pop button{font:500 14px var(--sans);padding:9px 14px;border-radius:999px;border:1.5px solid #D9D5CD;background:#fff;cursor:pointer}
.ls-pop button.ls-go{background:#0F0F0F;color:#F5F3EE;border-color:#0F0F0F}
.ls-pop button:hover{border-color:#0F0F0F}
.ls-pop small{display:block;color:#5E5A54;margin-top:8px;font-size:13px}
.ls-word{position:fixed;z-index:62;font:600 13px/1 var(--sans);background:#A63328;color:#fff;border:0;border-radius:999px;padding:9px 13px;cursor:pointer;box-shadow:0 4px 14px rgba(15,15,15,.3)}
.ls-toast{position:fixed;z-index:63;left:50%;bottom:calc(var(--ls-h,56px) + 22px);transform:translateX(-50%);background:#0F0F0F;color:#F5F3EE;border-radius:12px;padding:10px 14px;font:500 14px/1.3 var(--sans);display:flex;gap:12px;align-items:center;max-width:calc(100vw - 16px)}
.ls-toast button{font:500 13px var(--sans);background:transparent;color:#F5F3EE;border:0;text-decoration:underline;cursor:pointer;padding:0}
@media(max-width:700px){.ls-bar{gap:5px;padding:7px 8px}.ls-bar button{padding:7px 10px}.ls-bar .ls-vote button{width:30px;padding:7px 0}}
@media print{.ls-bar,.ls-pop,.ls-word,.ls-toast{display:none !important}}`;
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: css }));

  let bar = null, pop = null, wordBtn = null, toastEl = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function toast(msg, undo) {
    if (toastEl) toastEl.remove(); clearTimeout(undoTimer);
    toastEl = el(`<div class="ls-toast" role="status"><span>${esc(msg)}</span>${undo ? '<button type="button">Отменить</button>' : ""}</div>`);
    if (undo) toastEl.querySelector("button").onclick = () => { if (S && S.ev.length && S.ev[S.ev.length - 1] === undo) { S.ev.pop(); save(); count(); voteSync(); } toast("Отменено."); };
    document.body.appendChild(toastEl); undoTimer = setTimeout(() => { if (toastEl) { toastEl.remove(); toastEl = null; } }, undo ? 6000 : 2600);
  }
  const marks = () => (S ? S.ev.filter((e) => e.k !== "at").length : 0);
  const mmss = () => { const s = Math.floor((Date.now() - S.t0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  function count() { const c = bar && bar.querySelector(".ls-n"); if (c) c.textContent = `${S.group} · ${mmss()} · отметок: ${marks()}`; }
  function voteSync() {
    if (!bar || !S) return; const q = where().q; let last = null;
    for (const e of S.ev) if (e.k === "vote" && e.q === q && q) last = e.c;
    bar.querySelectorAll(".ls-vote button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === last)));
  }

  function draw() {
    if (bar) bar.remove(); closePop(); picking = false; document.documentElement.classList.remove("ls-pick");
    if (!S) {
      bar = el(`<div class="ls-bar" role="region" aria-label="Режим урока"><span class="ls-st"><i class="ls-dot" style="background:#77736D"></i>Режим урока</span>${HOME}<button type="button" data-a="mist">Ошибки класса</button><button type="button" class="ls-main" data-a="start">Начать урок</button></div>`);
    } else {
      bar = el(`<div class="ls-bar${(LS.getItem("ls_min") || (window.innerWidth < 700 ? "1" : "0")) === "1" ? " ls-min" : ""}" role="region" aria-label="Режим урока">
        <span class="ls-st"><i class="ls-dot"></i><span class="ls-n"></span></span>
        <button type="button" data-a="word" aria-pressed="false">Слово</button>
        <button type="button" data-a="flag">Трудный вопрос</button>
        <button type="button" data-a="note">Сработало</button>
        <span class="ls-vote" role="group" aria-label="Класс выбрал">Класс выбрал ${["A", "B", "C", "D"].map((c) => `<button type="button" data-c="${c}" aria-pressed="false">${c}</button>`).join("")}</span>
        <button type="button" data-a="mist">Ошибки класса</button>${HOME}
        <button type="button" data-a="end">Завершить</button>
        <button type="button" class="ls-tg" data-a="min" aria-label="Свернуть или развернуть панель урока">⇕</button></div>`);
    }
    timerButton = el('<button type="button" data-a="timer" title="45 секунд на каждый вопрос"></button>');
    timerStatus = el('<span class="ls-timer-status" role="status"></span>');
    bar.querySelector(".ls-st").after(timerButton);
    bar.appendChild(timerStatus);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.c) return vote(b.dataset.c);
      ({ timer: toggleTimer, home: () => (location.href = "classroom.html"), start: askStart, mist: openMist, word: () => pick(!picking), flag: askFlag, note: askNote, end: askEnd, min: () => { LS.setItem("ls_min", bar.classList.toggle("ls-min") ? "1" : "0"); place(); } })[b.dataset.a]();
    });
    document.body.appendChild(bar); if (S) { count(); voteSync(); } updateTimer(); place();
  }
  // the page keeps room under its last line for the bar, and messages sit just above the bar
  function place() { if (!bar) return; const h = bar.offsetHeight; document.documentElement.style.setProperty("--ls-h", h + "px"); document.body.style.paddingBottom = h + 24 + "px"; }
  window.addEventListener("resize", place);
  function open(html) { closePop(); pop = el(`<div class="ls-pop" role="dialog" aria-modal="false">${html}</div>`); document.body.appendChild(pop); const f = pop.querySelector("input[type=text],button"); if (f) f.focus(); pop.addEventListener("keydown", (e) => { if (e.key === "Escape") closePop(); }); return pop; }

  function askStart() {
    let groups = []; try { groups = JSON.parse(LS.getItem("ls_groups") || "[]"); } catch (e) { groups = []; }
    const p = open(`<h4>Начать урок</h4>
      <label for="ls-g">Группа или ученик</label><input type="text" id="ls-g" list="ls-gl" maxlength="40" autocomplete="off" value="${esc(groups[0] || "")}"><datalist id="ls-gl">${groups.map((g) => `<option value="${esc(g)}">`).join("")}</datalist>
      <label style="display:flex;gap:8px;align-items:center;font-weight:400"><input type="checkbox" id="ls-c" checked> Очистить прошлые ответы этого аккаунта</label>
      <div class="ls-row"><button type="button" class="ls-go">Начать</button><button type="button" data-x>Отмена</button></div>
      <small>Раздел урока определится сам, когда вы откроете часть урока, тест или текст. Чтобы сохранить слово, выделите его в тексте или нажмите «Слово» и затем само слово (так работает и в вариантах ответа). Кнопки внизу отмечают трудный вопрос, удачное объяснение и вариант, который выбрал класс.</small>`);
    p.querySelector("[data-x]").onclick = closePop;
    const go = () => {
      const g = p.querySelector("#ls-g").value.trim(), l = "";
      if (g.length < 2) { p.querySelector("#ls-g").focus(); return; }
      begin(g, p.querySelector("#ls-c").checked);
    };
    p.querySelector(".ls-go").onclick = go; p.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.tagName === "INPUT") go(); });
  }
  function begin(g, clean) {
    let groups = []; try { groups = JSON.parse(LS.getItem("ls_groups") || "[]"); } catch (e) { groups = []; }
    if (clean) wipe();
    LS.setItem("ls_groups", JSON.stringify([g, ...groups.filter((x) => x !== g)].slice(0, 12)));
    S = { v: 1, id: Date.now().toString(36), group: g, lesson: "", t0: Date.now(), t1: 0, ev: [] };
    LS.setItem(CUR, S.id); lastAt = null; lastTi = null; save(); draw(); toast("Урок начат."); watch(); changed();
  }
  function finish() { if (!S) return; S.t1 = Date.now(); save(); LS.removeItem(CUR); S = null; draw(); toast("Урок сохранён."); if (window.SITE && SITE.sync) SITE.sync(); changed(); }
  const changed = () => document.dispatchEvent(new CustomEvent("ls-change"));   // the lesson home page redraws its status
  // a new lesson starts on clean pages: only this account's own answers are removed (keys carry the account's name),
  // so another login used in the same browser keeps its results
  function wipe() {
    const name = LS.getItem("hw_student") || ""; if (!name) return; const drop = [];
    for (let i = 0; i < LS.length; i++) { const k = LS.key(i), m = /^(hw|px|rd|mk|ct)_[a-z]+_(.*)$/.exec(k); if (m && (m[2] === name || m[2].indexOf(name + "_") === 0)) drop.push(k); }
    drop.forEach((k) => LS.removeItem(k));
  }
  function askFlag() {
    if (!where().q) { toast("Откройте вопрос, который нужно отметить."); return; }
    const p = open(`<h4>Трудный вопрос: в чём причина?</h4><div class="ls-row">${WHY.map(([k, t]) => `<button type="button" data-w="${k}">${t}</button>`).join("")}</div>`);
    p.querySelectorAll("[data-w]").forEach((b) => (b.onclick = () => { const ev = { k: "flag", why: b.dataset.w }; log(ev); closePop(); toast("Вопрос отмечен.", S.ev[S.ev.length - 1]); }));
  }
  function askNote() {
    const p = open(`<h4>Сработало: какое объяснение помогло?</h4><input type="text" id="ls-t" maxlength="300" autocomplete="off" placeholder="Одна строка своими словами">
      <div class="ls-row"><button type="button" class="ls-go">Сохранить</button><button type="button" data-x>Отмена</button></div>`);
    p.querySelector("[data-x]").onclick = closePop;
    const go = () => { const t = p.querySelector("#ls-t").value.trim(); if (!t) return; log({ k: "note", text: t }); closePop(); toast("Объяснение сохранено.", S.ev[S.ev.length - 1]); };
    p.querySelector(".ls-go").onclick = go; p.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  }
  function vote(c) {
    if (!where().q) { toast("Откройте вопрос, чтобы отметить выбор класса."); return; }
    log({ k: "vote", c }); voteSync(); toast(`Класс выбрал ${c}.`, S.ev[S.ev.length - 1]);
  }
  function askEnd() {
    const words = S.ev.filter((e) => e.k === "word").length, flags = S.ev.filter((e) => e.k === "flag").length;
    const p = open(`<h4>Завершить урок?</h4><p style="margin:0">Сохранено слов: ${words}, трудных вопросов: ${flags}, всего отметок: ${marks()}.</p>
      <div class="ls-row"><button type="button" class="ls-go">Завершить</button><button type="button" data-x>Продолжить урок</button></div>`);
    p.querySelector("[data-x]").onclick = closePop;
    p.querySelector(".ls-go").onclick = finish;
  }

  // ---- a word: select it in the text, then «+ Слово»
  function sentence(node, word) {
    let b = node.nodeType === 1 ? node : node.parentElement;
    while (b && b !== document.body && !/^(P|LI|TD|BLOCKQUOTE|BUTTON|H1|H2|H3)$/.test(b.tagName) && !(b.classList && (b.classList.contains("qhtml") || b.classList.contains("tx")))) b = b.parentElement;
    const text = ((b && b !== document.body ? b : node.parentElement || node).textContent || "").replace(/\s+/g, " ").trim();
    const i = text.toLowerCase().indexOf(word.toLowerCase()); if (i < 0) return text.slice(0, 240);
    let a = i, z = i + word.length;
    while (a > 0 && !/[.!?]/.test(text[a - 1]) && i - a < 160) a--;
    while (z < text.length && !/[.!?]/.test(text[z]) && z - i < 160) z++;
    return text.slice(a, Math.min(text.length, z + 1)).trim();
  }
  function saveWord(w, node, host) {
    const part = host.closest(".opt,.ch,#sv-opts,#opts,.lm-o") ? "option" : host.closest("#passage,#sv-passage,.passage,.lm-stim") ? "passage" : "question";
    log({ k: "word", w, ctx: sentence(node, w), part }); toast(`Слово сохранено: ${w}`, S.ev[S.ev.length - 1]);
  }
  // «Слово» on the bar: the next click on any word saves it. Answer options are buttons, and a browser does not let
  // text inside a button be selected, so selecting cannot work there; this click never chooses the option.
  let picking = false;
  function pick(on) {
    picking = !!on && !!S; document.documentElement.classList.toggle("ls-pick", picking);
    const b = bar && bar.querySelector('[data-a="word"]'); if (b) b.setAttribute("aria-pressed", String(picking));
    if (picking) toast("Нажмите на слово в тексте или в варианте ответа.");
  }
  const LETTER = /[\p{L}\p{N}'’-]/u;
  function wordAt(x, y, root) {
    let node = null, off = 0;
    if (document.caretPositionFromPoint) { const c = document.caretPositionFromPoint(x, y); if (c) { node = c.offsetNode; off = c.offset; } }
    else if (document.caretRangeFromPoint) { const c = document.caretRangeFromPoint(x, y); if (c) { node = c.startContainer; off = c.startOffset; } }
    if (node && node.nodeType === 3) {
      const s = node.data; let a = off, z = off;
      while (a > 0 && LETTER.test(s[a - 1])) a--; while (z < s.length && LETTER.test(s[z])) z++;
      const w = s.slice(a, z).replace(/^['’-]+|['’-]+$/g, ""); if (w.length >= 2) return { w, node };
    }
    // inside a button the caret lookup can miss: find the word whose box is under the pointer
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), rg = document.createRange(); let n;
    while ((n = tw.nextNode())) {
      const re = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu; let m;
      while ((m = re.exec(n.data))) {
        rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        for (const b of rg.getClientRects()) if (x >= b.left - 1 && x <= b.right + 1 && y >= b.top - 1 && y <= b.bottom + 1) { const w = m[0].replace(/['’-]+$/, ""); return w.length >= 2 ? { w, node: n } : null; }
      }
    }
    return null;
  }
  document.addEventListener("click", (e) => {
    if (!picking || !S || e.target.closest(".ls-bar,.ls-pop,.ls-toast")) return;
    e.preventDefault(); e.stopPropagation();   // the option is not chosen and a glossary card does not open
    const box = e.target.closest(".opt,.ch,p,li,td,.qhtml,.stem,.passage") || e.target, hit = wordAt(e.clientX, e.clientY, box);
    if (!hit) { toast("Здесь нет слова. Нажмите прямо на слово."); return; }
    saveWord(hit.w, hit.node, e.target); pick(false);
    if (window.DICT) DICT.show(hit.w, { left: e.clientX - 1, width: 2, top: e.clientY - 12, bottom: e.clientY + 12 });   // the meaning at once (dict.js)
  }, true);
  document.addEventListener("keydown", (e) => { if (picking && e.key === "Escape") { pick(false); e.preventDefault(); } });
  function hideWord() { if (wordBtn) { wordBtn.remove(); wordBtn = null; } }
  function onSelect() {
    hideWord(); if (!S) return;
    const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const w = sel.toString().replace(/\s+/g, " ").trim(); if (w.length < 2 || w.length > 60 || w.split(" ").length > 6) return;
    const r = sel.getRangeAt(0), host = r.commonAncestorContainer.nodeType === 1 ? r.commonAncestorContainer : r.commonAncestorContainer.parentElement;
    if (!host || host.closest(".ls-bar,.ls-pop,.ls-toast,input,textarea,nav,.top")) return;
    const box = r.getBoundingClientRect(); if (!box.width) return;
    wordBtn = el('<button type="button" class="ls-word">+ Слово</button>');
    wordBtn.style.left = Math.max(8, Math.min(window.innerWidth - 110, box.left + box.width / 2 - 45)) + "px";
    wordBtn.style.top = (box.top > 56 ? box.top - 44 : box.bottom + 8) + "px";
    wordBtn.addEventListener("mousedown", (e) => e.preventDefault());   // keep the selection
    wordBtn.onclick = () => { saveWord(w, r.startContainer, host); hideWord(); sel.removeAllRanges(); };
    document.body.appendChild(wordBtn);
  }
  let selT = 0;
  document.addEventListener("selectionchange", () => { clearTimeout(selT); selT = setTimeout(onSelect, 250); });
  window.addEventListener("scroll", hideWord, { passive: true });

  S = load(); draw();
  setInterval(updateTimer, 200);
  setInterval(() => { watch(); if (S) { count(); voteSync(); } }, 2000); watch();
  // the lesson home page (classroom.js) drives the same bar
  window.LESSON = { session: () => S, where, tick: watch, begin, end: () => (S ? askEnd() : null), ask: () => askStart(), openMist, need, toast, groups: () => { try { return JSON.parse(LS.getItem("ls_groups") || "[]"); } catch (e) { return []; } } };
  document.dispatchEvent(new CustomEvent("ls-ready"));
})();
