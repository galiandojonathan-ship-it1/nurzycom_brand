// Cabinet → «Мои тесты» (2026-11-10, Nurassyl: «allow to create my own questions and tests in the admin cabinet»).
// The teacher writes questions (multiple choice A–D or a typed answer), groups them into tests, saves the bank (sealed with the
// master key, KV «custom», PUT api/admin/custom; a copy stays in this browser) and assigns a test like any other task
// (kind «ct», result key ct_last_<name>_<id>). Results: every student's score, attempts and answer per question, from their
// synced copies. Data model and checking: ctlogic.js. The student's screen: mytest.html.
(function () {
  "use strict";
  const { esc, rich } = CTL;
  const pl = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many);
  const E = { view: "list", tests: [], at: 0, d: null, dirty: false, open: new Set(), imp: false, impText: "", impMsg: "", resId: "", msg: "", loaded: false };
  let api = null;
  const qn = (n) => `${n} ${pl(n, "вопрос", "вопроса", "вопросов")}`;
  const when = (t) => (t ? new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : "—");
  const clone = (x) => JSON.parse(JSON.stringify(x));

  // ---- the bank: the newer of the server copy and this browser's copy wins (as with the groups)
  async function load() {
    let srv = null, loc = null;
    try { srv = await CTL.loadBank(); } catch (e) { srv = null; }
    try { loc = JSON.parse(localStorage.getItem("cb_ct") || "null"); } catch (e) { loc = null; }
    const pick = srv && (!loc || (srv.at || 0) >= (loc.at || 0)) ? srv : loc || { tests: [], at: 0 };
    E.tests = Array.isArray(pick.tests) ? pick.tests : []; E.at = pick.at || 0; E.loaded = true;
    titles();
    if (pick === loc && srv && (loc.at || 0) > (srv.at || 0)) save("Тесты из этого браузера сохранены на сервере", true);
  }
  function titles() { E.tests.forEach((t) => (PLAN.CT[t.id] = t.title || "Без названия")); }
  async function save(msg, quiet) {
    E.at = Date.now(); titles();
    try { localStorage.setItem("cb_ct", JSON.stringify({ tests: E.tests, at: E.at })); } catch (e) { /* storage full or private mode */ }
    const r = await SITE.api("admin/custom", { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({ tests: E.tests, at: E.at }) }) }).catch(() => ({ status: 0 }));
    if (!quiet || r.ok) api.toast(r.ok ? msg : `${msg} · сохранено только в этом браузере (${r.status === 403 ? "нужен ключ администратора" : r.status === 400 ? "тесты слишком большие" : "нет связи с сервером"})`, !r.ok);
    return r.ok;
  }
  const items = () => E.tests.filter((t) => t.q && t.q.length).map((t) => ({ v: t.id, t: `Мой тест · ${t.title || "Без названия"} · ${qn(t.q.length)}`, href: `mytest.html?t=${t.id}`, rk: ["ct_last_", t.id] }));

  // ---- results of one test, from every student's synced copy
  function resultsOf(t) {
    const rows = [], waiting = [];
    for (const u of api.users()) {
      const c = api.copy(u); if (!c) continue;
      const K = CTL.keys(c.nm, t.id), last = c.get(K.last);
      if (last) rows.push({ u, last, att: Number(c.get(K.att) || 1), A: CTL.parseAns(c.get(K.ans)), t: c.meta[K.last] || 0 });
      else if (c.tasks.some((x) => x.rk && x.rk[1] === t.id && !x.done)) waiting.push(u);
    }
    return { rows: rows.sort((a, b) => b.t - a.t), waiting };
  }

  // ---- views
  function listHTML() {
    return `<div class="cb-assign ct">
      <div class="cb-ah"><h2 tabindex="-1">Мои тесты</h2><button class="tlink" type="button" data-ctclose="1">Закрыть ✕</button></div>
      <p class="hint">Свои вопросы и тесты: с вариантами A–D или с ответом-числом, с разбором. Тест задаётся ученикам как обычное задание (тип «Мой тест»), результат приходит сюда и во вкладку «Результаты» ученика. Тесты с отметкой «открыт для всех» ученики видят в разделе Полезное → Тесты преподавателя.</p>
      <div class="row"><button class="btn" type="button" data-ctnew="1">Новый тест <span class="arr">+</span></button></div>
      ${E.tests.length ? `<ul class="cb-rows ct-list">${E.tests.map((t) => { const R = resultsOf(t), bad = t.q.filter((q) => CTL.problems(q).length).length;
        return `<li><div class="ct-l"><b>${esc(t.title || "Без названия")}</b><small>${qn(t.q.length)} · ${t.minutes ? `${t.minutes} мин` : "без лимита"} · ${t.open ? "открыт для всех" : "по заданию"} · изменён ${when(t.at)} · сдали ${R.rows.length}${R.waiting.length ? ` · ждут ${R.waiting.length}` : ""}${bad ? ` · <span class="bad">не готово: ${bad}</span>` : ""}</small></div>
          <div class="ct-act"><button class="chip" type="button" data-ctedit="${esc(t.id)}">Изменить</button><button class="chip" type="button" data-ctres="${esc(t.id)}">Результаты</button>${t.q.length && !bad ? `<button class="chip" type="button" data-ctgive="${esc(t.id)}">Задать</button><a class="chip" href="mytest.html?t=${esc(t.id)}" target="_blank" rel="noopener">Как ученик ↗</a>` : ""}<button class="chip" type="button" data-ctcopy="${esc(t.id)}">Копия</button><button class="chip" type="button" data-ctdel="${esc(t.id)}">Удалить</button></div></li>`; }).join("")}</ul>`
        : '<p class="td-sub">Тестов пока нет. Нажмите «Новый тест».</p>'}</div>`;
  }
  const skillOpts = (sel) => `<option value="">—</option>${CTL.SKILLS.map(([d, list]) => `<optgroup label="${esc(d)}">${list.map((s) => `<option${s === sel ? " selected" : ""}>${esc(s)}</option>`).join("")}</optgroup>`).join("")}${sel && !CTL.SKILLS.some(([, l]) => l.includes(sel)) ? `<option selected>${esc(sel)}</option>` : ""}`;
  function qHTML(q, i, n) {
    const p = CTL.problems(q), open = E.open.has(q.id);
    const head = `${i + 1} · ${q.type === "spr" ? "ответ-число" : "A–D"}${q.skill ? ` · ${q.skill}` : ""} · ${CTL.LEVELS[q.level] || "Medium"}`;
    const preview = String(q.stem || q.passage || "").replace(/\s+/g, " ").slice(0, 90);
    return `<details class="ct-q${p.length ? " has-bad" : ""}" data-q="${esc(q.id)}"${open ? " open" : ""}><summary><span class="ct-n">${esc(head)}</span><span class="ct-pv">${esc(preview || "пустой вопрос")}</span>${p.length ? `<span class="bad">${esc(p.join(", "))}</span>` : ""}</summary>
      <div class="ct-qb"><div class="ct-ed">
        <div class="cb-grid ct-3"><label class="f"><span>Тип</span><select data-qf="type"><option value="mc"${q.type === "mc" ? " selected" : ""}>Варианты A–D</option><option value="spr"${q.type === "spr" ? " selected" : ""}>Ответ-число (SPR)</option></select></label>
          <label class="f"><span>Навык</span><select data-qf="skill">${skillOpts(q.skill)}</select></label>
          <label class="f"><span>Уровень</span><select data-qf="level">${Object.entries(CTL.LEVELS).map(([k, v]) => `<option value="${k}"${q.level === k ? " selected" : ""}>${v}</option>`).join("")}</select></label></div>
        <label class="f"><span>Текст (необязательно)</span><textarea data-qf="passage" rows="5" placeholder="Отрывок, заметки или таблица. Пустая строка = новый абзац; ______ = пропуск; **жирный**, *курсив*, __подчёркнутый__; строки «• …» = список; «| a | b |» = таблица">${esc(q.passage)}</textarea></label>
        <label class="f"><span>Вопрос</span><textarea data-qf="stem" rows="2" placeholder="Which choice completes the text with the most logical transition?">${esc(q.stem)}</textarea></label>
        ${q.type === "spr" ? `<label class="f"><span>Верные ответы (через ; если их несколько)</span><input type="text" data-qf="a" value="${esc(q.a)}" placeholder="Например: 12.5; 25/2"><small class="hint">0.5, .5 и 1/2 засчитываются одинаково.</small></label>`
          : `<fieldset class="f ct-opts"><legend>Варианты · отметьте верный</legend>${q.o.map((o, k) => { const c = "ABCD"[k]; return `<div class="ct-o"><label class="ct-r"><input type="radio" name="a-${esc(q.id)}" data-qa="${c}"${q.a === c ? " checked" : ""}> ${c}</label><input type="text" data-qo="${k}" value="${esc(o)}" aria-label="Вариант ${c}"></div>`; }).join("")}</fieldset>`}
        <label class="f"><span>Разбор (ученик видит после сдачи)</span><textarea data-qf="x" rows="3" placeholder="Почему верный ответ верный и почему остальные нет">${esc(q.x)}</textarea></label>
        <div class="row ct-qact"><button class="chip" type="button" data-qup="1"${i ? "" : " disabled"}>↑ Выше</button><button class="chip" type="button" data-qdown="1"${i < n - 1 ? "" : " disabled"}>↓ Ниже</button><button class="chip" type="button" data-qdup="1">Копия</button><button class="chip" type="button" data-qdel="1">Удалить</button></div>
      </div><div class="ct-prev"><span class="label">Как увидит ученик</span><div class="ct-pbox">${previewHTML(q)}</div></div></div></details>`;
  }
  function previewHTML(q) {
    return `${q.passage ? `<div class="passage">${rich(q.passage)}</div>` : ""}<div class="stem">${rich(q.stem) || '<p class="hint">Вопрос пока пуст.</p>'}</div>
      ${q.type === "spr" ? `<div class="ct-spr">Ответ: ${esc(CTL.answerText(q) || "—")}</div>` : `<ol class="ct-pv-o">${q.o.map((o, k) => `<li class="${q.a === "ABCD"[k] ? "on" : ""}"><b>${"ABCD"[k]}</b> ${CTL.inline(o) || "…"}</li>`).join("")}</ol>`}`;
  }
  function editHTML() {
    const d = E.d, bad = d.q.filter((q) => CTL.problems(q).length).length;
    return `<form class="cb-assign ct" id="ct-form" novalidate>
      <div class="cb-ah"><button class="tlink" type="button" data-ctlist="1">← Мои тесты</button><button class="tlink" type="button" data-ctclose="1">Закрыть ✕</button></div>
      <h2 tabindex="-1">${esc(d.title || "Новый тест")}</h2>
      <section class="step"><h3><span class="sn">1</span> Тест</h3>
        <div class="cb-grid"><label class="f"><span>Название</span><input id="ct-title" type="text" maxlength="90" value="${esc(d.title)}" placeholder="Например: Transitions · 10 hard" required></label>
          <label class="f"><span>Время, минут (0 = без ограничения)</span><input id="ct-min" type="number" min="0" max="240" step="1" value="${esc(d.minutes || 0)}"></label>
          <label class="f"><span>После сдачи ученик видит</span><select id="ct-rev">${Object.entries(CTL.REVIEW).map(([k, v]) => `<option value="${k}"${d.review === k ? " selected" : ""}>${v}</option>`).join("")}</select></label>
          <label class="cb-tick ct-open"><input type="checkbox" id="ct-open"${d.open ? " checked" : ""}><span>Открыт для всех учеников<small>в разделе Полезное → Тесты преподавателя; иначе только по заданию</small></span></label></div>
        <label class="f"><span>Инструкция для ученика (необязательно)</span><textarea id="ct-note" rows="2" maxlength="600" placeholder="Например: 12 вопросов, 15 минут, решайте без словаря">${esc(d.note)}</textarea></label></section>
      <section class="step"><h3><span class="sn">2</span> Вопросы <small>· ${d.q.length}${bad ? ` · <span class="bad">не готово: ${bad}</span>` : ""}</small></h3>
        <div class="ct-qs">${d.q.map((q, i) => qHTML(q, i, d.q.length)).join("") || '<p class="td-sub">Вопросов пока нет.</p>'}</div>
        <div class="row"><button class="btn ghost" type="button" data-qadd="mc">+ Вопрос с вариантами</button><button class="btn ghost" type="button" data-qadd="spr">+ Вопрос с ответом-числом</button><button class="btn ghost" type="button" data-qimp="1" aria-expanded="${E.imp}">Вставить из текста</button></div>
        ${E.imp ? `<div class="ct-imp"><label class="f"><span>Вопросы текстом: блоки через строку «---»</span><textarea id="ct-imp" rows="12" spellcheck="false" placeholder="P: Researchers studied …\nQ: Which choice completes the text with the most logical transition?\nA) However,\nB) Moreover,\nC) For example,\nD) Thus,\nAnswer: B\nExplanation: …\nSkill: Transitions\nLevel: H\n---\nQ: If 3x + 5 = 20, what is x?\nAnswer: 5\nExplanation: 3x = 15, x = 5.">${esc(E.impText)}</textarea></label>
          <p class="hint">P: текст · Q: вопрос · A) – D) варианты · Answer: буква или число · Explanation: разбор · Skill и Level (E, M, H) необязательны. Блок без вариантов станет вопросом с ответом-числом.</p>
          <div class="row"><button class="btn" type="button" id="ct-impgo">Добавить вопросы</button></div></div>` : ""}
        ${E.impMsg ? `<p class="hint" role="status">${esc(E.impMsg)}</p>` : ""}</section>
      <div class="cb-sum" aria-live="polite">${E.msg ? esc(E.msg) : E.dirty ? "Есть несохранённые изменения." : "Все изменения сохранены."}</div>
      <div class="row"><button class="btn" type="submit">Сохранить тест <span class="arr">→</span></button>${E.tests.some((t) => t.id === d.id) ? `<a class="btn ghost" href="mytest.html?t=${esc(d.id)}" target="_blank" rel="noopener">Открыть как ученик ↗</a>` : ""}</div></form>`;
  }
  function resHTML() {
    const t = E.tests.find((x) => x.id === E.resId); if (!t) { E.view = "list"; return listHTML(); }
    const R = resultsOf(t), n = t.q.length;
    const per = t.q.map((q) => { const done = R.rows.filter((r) => r.A[q.id] != null); const ok = done.filter((r) => CTL.isRight(q, r.A[q.id] === "-" ? "" : r.A[q.id])).length; return done.length ? Math.round((100 * ok) / done.length) : null; });
    const mean = R.rows.length ? Math.round(R.rows.reduce((a, r) => a + Number(r.last.split("/")[0]) / n, 0) * 100 / R.rows.length) : null;
    return `<div class="cb-assign ct">
      <div class="cb-ah"><button class="tlink" type="button" data-ctlist="1">← Мои тесты</button><button class="tlink" type="button" data-ctclose="1">Закрыть ✕</button></div>
      <h2 tabindex="-1">Результаты · ${esc(t.title || "Без названия")}</h2>
      <p class="hint">${qn(n)} · сдали ${R.rows.length}${mean != null ? ` · в среднем ${mean}%` : ""}${R.waiting.length ? ` · ещё не сдали: ${R.waiting.map((u) => esc(u.name)).join(", ")}` : ""}. Результаты приходят, когда ученик сдал тест в своём аккаунте; нажмите «Обновить», чтобы подтянуть новые.</p>
      <div class="row"><button class="btn" type="button" data-ctgive="${esc(t.id)}">Задать <span class="arr">+</span></button><button class="btn ghost" type="button" data-ctedit="${esc(t.id)}">Изменить тест</button></div>
      ${R.rows.length ? `<div class="tw ct-tw"><table class="dt ct-res"><thead><tr><th scope="col">Ученик</th><th scope="col">Балл</th><th scope="col">Попыток</th><th scope="col">Сдал(а)</th>${t.q.map((q, i) => `<th scope="col" title="${esc(q.skill || "")}">${i + 1}</th>`).join("")}</tr></thead><tbody>
        ${R.rows.map((r) => `<tr><th scope="row">${esc(r.u.name)}</th><td><b>${esc(r.last)}</b></td><td>${r.att}</td><td>${when(r.t)}${r.A.sec ? ` · ${Math.round(r.A.sec / 60)} мин` : ""}</td>${t.q.map((q) => { const a = r.A[q.id], blank = a == null || a === "-", ok = !blank && CTL.isRight(q, a);
          return `<td class="${ok ? "ok" : "no"}" title="${ok ? "верно" : blank ? "без ответа" : `ответ ${esc(a)}, верный ${esc(CTL.answerText(q))}`}">${blank ? "—" : esc(String(a).slice(0, 6))}</td>`; }).join("")}</tr>`).join("")}</tbody>
        <tfoot><tr><th scope="row">Верно, %</th><td></td><td></td><td></td>${per.map((p) => `<td class="${p != null && p < 50 ? "low" : ""}">${p == null ? "—" : p}</td>`).join("")}</tr><tr><th scope="row">Верный ответ</th><td></td><td></td><td></td>${t.q.map((q) => `<td title="${esc(CTL.answerText(q))}">${esc((q.type === "spr" ? CTL.accepted(q.a)[0] || "" : q.a).slice(0, 8))}</td>`).join("")}</tr></tfoot></table></div>`
        : '<p class="td-sub">Пока никто не сдал этот тест.</p>'}</div>`;
  }
  const html = () => (!E.loaded ? '<p class="cb-wait">Загружаю тесты…</p>' : E.view === "edit" && E.d ? editHTML() : E.view === "res" ? resHTML() : listHTML());

  // ---- actions
  function leave() { if (E.view === "edit" && E.dirty && !confirm("Выйти без сохранения? Изменения в тесте пропадут.")) return false; E.dirty = false; E.d = null; E.imp = false; E.msg = ""; return true; }
  function openEdit(t) { E.d = clone(t); E.view = "edit"; E.dirty = !E.tests.some((x) => x.id === t.id); E.open = new Set(); E.imp = false; E.impMsg = ""; E.msg = ""; api.focus("#ct-form h2"); }
  async function submit() {
    const d = E.d;
    d.title = d.title.trim(); d.minutes = Math.max(0, Math.min(240, Math.round(Number(d.minutes) || 0)));
    const bad = d.q.map((q, i) => (CTL.problems(q).length ? i + 1 : null)).filter(Boolean);
    if (!d.title) { E.msg = "Напишите название теста."; api.render(); const el = document.getElementById("ct-title"); if (el) el.focus(); return; }
    if (!d.q.length) { E.msg = "Добавьте хотя бы один вопрос."; api.render(); return; }
    if (bad.length) { E.msg = `Не готовы вопросы: ${bad.join(", ")}. Исправьте их (подсказка красным в заголовке вопроса), потом сохраните.`; bad.forEach((i) => E.open.add(d.q[i - 1].id)); api.render(); return; }
    d.at = Date.now();
    const i = E.tests.findIndex((t) => t.id === d.id); if (i >= 0) E.tests[i] = clone(d); else E.tests.unshift(clone(d));
    E.dirty = false; E.msg = "";
    const ok = await save(`Тест «${d.title}» сохранён`);
    E.msg = ok ? "Сохранено. Ученики увидят изменения при следующем открытии теста." : "Сохранено только в этом браузере: повторите, когда будет связь."; api.render();
  }
  const Qof = (el) => { const box = el.closest("[data-q]"); return box ? E.d.q.find((q) => q.id === box.dataset.q) : null; };
  function refreshQ(el) {   // update one question's preview and header without re-rendering the form (keeps the cursor)
    const box = el.closest("[data-q]"), q = Qof(el); if (!box || !q) return;
    box.querySelector(".ct-pbox").innerHTML = previewHTML(q);
    const p = CTL.problems(q); box.classList.toggle("has-bad", !!p.length);
    const s = box.querySelector("summary"); s.querySelector(".ct-pv").textContent = String(q.stem || q.passage || "").replace(/\s+/g, " ").slice(0, 90) || "пустой вопрос";
    let b = s.querySelector(".bad"); if (p.length) { if (!b) { b = document.createElement("span"); b.className = "bad"; s.appendChild(b); } b.textContent = p.join(", "); } else if (b) b.remove();
    dirty();
  }
  function dirty() { E.dirty = true; E.msg = ""; const s = document.querySelector(".ct .cb-sum"); if (s) s.textContent = "Есть несохранённые изменения."; }

  function bind(main) {
    const on = (sel, fn) => main.querySelectorAll(sel).forEach((el) => (el.onclick = (e) => fn(el, e)));
    on("[data-ctclose]", () => { if (leave()) api.close(); });
    on("[data-ctlist]", () => { if (!leave()) return; E.view = "list"; api.focus(".ct h2"); api.render(); });
    on("[data-ctnew]", () => { openEdit(CTL.newTest()); api.render(); });
    on("[data-ctedit]", (b) => { const t = E.tests.find((x) => x.id === b.dataset.ctedit); if (t) { openEdit(t); api.render(); } });
    on("[data-ctres]", (b) => { E.resId = b.dataset.ctres; E.view = "res"; api.focus(".ct h2"); api.render(); });
    on("[data-ctgive]", (b) => { if (!leave()) return; api.give(b.dataset.ctgive); });
    on("[data-ctcopy]", (b) => { const t = E.tests.find((x) => x.id === b.dataset.ctcopy); if (!t) return; const c = clone(t); c.id = CTL.newTest().id; c.title = `${t.title} (копия)`; c.open = false; c.at = Date.now(); E.tests.unshift(c); save(`Создана копия «${t.title}»`); api.render(); });
    on("[data-ctdel]", (b) => { const t = E.tests.find((x) => x.id === b.dataset.ctdel); if (!t || !confirm(`Удалить тест «${t.title}»? Ученики больше не смогут его открыть; их результаты останутся в кабинете.`)) return; E.tests = E.tests.filter((x) => x.id !== t.id); save(`Тест «${t.title}» удалён`); api.render(); });
    const f = document.getElementById("ct-form"); if (!f) return;
    const d = E.d;
    f.onsubmit = (e) => { e.preventDefault(); submit(); };
    document.getElementById("ct-title").oninput = (e) => { d.title = e.target.value; dirty(); };
    document.getElementById("ct-min").oninput = (e) => { d.minutes = e.target.value; dirty(); };
    document.getElementById("ct-rev").onchange = (e) => { d.review = e.target.value; dirty(); };
    document.getElementById("ct-open").onchange = (e) => { d.open = e.target.checked; dirty(); };
    document.getElementById("ct-note").oninput = (e) => { d.note = e.target.value; dirty(); };
    main.querySelectorAll("details.ct-q").forEach((el) => (el.ontoggle = () => (el.open ? E.open.add(el.dataset.q) : E.open.delete(el.dataset.q))));
    main.querySelectorAll("[data-qf]").forEach((el) => {
      const k = el.dataset.qf, structural = k === "type";
      const fn = () => { const q = Qof(el); if (!q) return; q[k] = el.value; if (structural) { q.a = ""; E.open.add(q.id); dirty(); api.render(); } else refreshQ(el); };
      el[el.tagName === "SELECT" ? "onchange" : "oninput"] = fn;
    });
    main.querySelectorAll("[data-qo]").forEach((el) => (el.oninput = () => { const q = Qof(el); if (q) { q.o[Number(el.dataset.qo)] = el.value; refreshQ(el); } }));
    main.querySelectorAll("[data-qa]").forEach((el) => (el.onchange = () => { const q = Qof(el); if (q) { q.a = el.dataset.qa; refreshQ(el); } }));
    const idx = (el) => d.q.indexOf(Qof(el));
    on("[data-qup]", (b) => { const i = idx(b); if (i > 0) { [d.q[i - 1], d.q[i]] = [d.q[i], d.q[i - 1]]; dirty(); api.render(); } });
    on("[data-qdown]", (b) => { const i = idx(b); if (i >= 0 && i < d.q.length - 1) { [d.q[i + 1], d.q[i]] = [d.q[i], d.q[i + 1]]; dirty(); api.render(); } });
    on("[data-qdup]", (b) => { const i = idx(b); if (i < 0) return; const c = clone(d.q[i]); c.id = CTL.newQ().id; d.q.splice(i + 1, 0, c); E.open.add(c.id); dirty(); api.render(); });
    on("[data-qdel]", (b) => { const i = idx(b); if (i < 0 || !confirm(`Удалить вопрос ${i + 1}?`)) return; d.q.splice(i, 1); dirty(); api.render(); });
    on("[data-qadd]", (b) => { const q = CTL.newQ(b.dataset.qadd); d.q.push(q); E.open.add(q.id); dirty(); api.focus(`[data-q="${q.id}"] textarea[data-qf="stem"]`); api.render(); });
    on("[data-qimp]", () => { E.imp = !E.imp; E.impMsg = ""; if (E.imp) api.focus("#ct-imp"); api.render(); });
    const ta = document.getElementById("ct-imp"); if (ta) ta.oninput = (e) => (E.impText = e.target.value);
    const go = document.getElementById("ct-impgo");
    if (go) go.onclick = () => {
      const r = CTL.parseText(E.impText);
      if (!r.qs.length) { E.impMsg = "Не нашёл ни одного вопроса: проверьте формат (Q:, A) … D), Answer:)."; api.render(); return; }
      d.q.push(...r.qs); r.qs.forEach((q) => CTL.problems(q).length && E.open.add(q.id));
      E.impText = r.errs.length ? E.impText : ""; E.impMsg = `Добавлено: ${qn(r.qs.length)}.${r.errs.length ? ` Проверьте: ${r.errs.join("; ")}.` : ""}`; E.imp = !!r.errs.length; dirty(); api.render();
    };
  }
  // Escape: close the importer first, then go back from a test to the list; the list itself closes like the other cabinet forms
  function escape() {
    if (E.view === "edit" && E.imp) { E.imp = false; api.render(); return true; }
    if (E.view !== "list") { if (!leave()) return true; E.view = "list"; api.render(); return true; }
    return false;
  }
  window.CTED = { init: (a) => (api = a), load, html, bind, items, escape, leave, open: () => { E.view = "list"; }, get loaded() { return E.loaded; } };
})();
