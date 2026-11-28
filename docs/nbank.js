/* «nurzycom bank» (2026-11-23, Nurassyl: «Create a separate section called “nurzycom bank”. You must maintain the quality and
   authenticity of questions… It will be a bank from which we will be able to fetch questions in future and make it bigger and
   bigger»). A cabinet section over our own original questions (data/nbank.bin, sealed with the master key): every question is
   written to the SAT format by subtopic (the progress taxonomy), in sets of 10 with 3 «контрольные», at least one genuinely
   hard question per set, international themes with topical vocabulary, and kept only after a blind second solve agreed with
   the key (Math keys also recomputed with sympy). The teacher filters, reads every question with its key, explanation, trap
   and word cards, ticks questions and turns them into a «Мой тест» (and assigns it through the usual form). */
window.NBANK = (() => {
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const LEVEL = { E: "лёгкий", M: "средний", H: "сложный" }, SEC = { rw: "Reading and Writing", math: "Math" };
  const PICK_MAX = 60, PAGE = 40;
  const E = { loaded: false, err: "", all: [], f: { source: "", sec: "", skill: "", sub: "", level: "", kind: "", hard: false, theme: "", q: "" }, sel: new Set(), shown: PAGE, title: "", msg: "" };
  let api = { toast: () => {}, render: () => {}, focus: () => {} };
  const NAME = (k) => (window.PVIEW && PVIEW.NAME && PVIEW.NAME[k]) || k;
  const rich = (s) => (window.CTL ? CTL.rich(s || "") : `<p>${esc(s)}</p>`);
  const inline = (s) => (window.CTL ? CTL.inline(s || "") : esc(s));

  async function load() {
    if (E.loaded) return;
    try { const d = await SITE.json("nbank"); E.all = (d.questions || []).filter((q) => q && q.id && q.stem); E.at = d.at; E.err = ""; }
    catch (e) { E.all = []; E.err = "Банк не загрузился. Обновите страницу."; }
    try {
      E.all.push(...(await OfficialPractice.reserve()).map((q) => ({
        id: q.id, sec: q.sec, skill: q.sk, level: q.d, type: q.t, official: true
      })));
    } catch { E.err += (E.err ? " " : "") + "Подборка College Board не загрузилась."; }
    E.loaded = true;
  }
  const match = (q) => { const F = E.f, t = F.q.trim().toLowerCase();
    return (!F.source || F.source === (q.official ? "official" : "original")) && (!F.sec || q.sec === F.sec) && (!F.skill || q.skill === F.skill) && (!F.sub || q.sub === F.sub) && (!F.level || q.level === F.level) &&
      (!F.kind || q.kind === F.kind) && (!F.hard || q.hard) && (!F.theme || q.theme === F.theme) &&
      (!t || [q.passage, q.stem, ...(q.options || []), q.theme, q.id].join(" ").toLowerCase().includes(t)); };
  const list = () => E.all.filter(match);
  const count = (arr, key) => { const m = new Map(); arr.forEach((q) => { const k = key(q); if (k) m.set(k, (m.get(k) || 0) + 1); }); return [...m].sort((a, b) => b[1] - a[1]); };
  const opt = (v, label, cur) => `<option value="${esc(v)}"${v === cur ? " selected" : ""}>${esc(label)}</option>`;
  const today = () => new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  // the start of the passage tells questions apart (RW stems are the standard SAT wording); Math without a passage: the stem
  const snip = (q) => { const t = String(q.passage || q.stem || "").replace(/__|\*\*|\|/g, "").replace(/\s+/g, " ").trim(); return t.length > 150 ? t.slice(0, 150) + "…" : t; };
  function officialCard(q, pick) {
    return `<div class="nb-row${E.sel.has(q.id) ? " on" : ""}">${pick}<details class="nb-q" data-nb-official="${esc(q.id)}">
      <summary><span class="nb-sum"><b>${esc(q.skill)}</b><small>College Board · ноябрь 2026 · ${esc(LEVEL[q.level])}</small></span><code>${esc(q.id)}</code></summary>
      <div class="nb-body" lang="en"></div></details></div>`;
  }
  function card(q) {
    const on = E.sel.has(q.id), L = (k) => "ABCD"[k];
    const pick = `<label class="nb-pick"><input type="checkbox" data-nbsel="${esc(q.id)}" aria-label="Выбрать ${esc(q.id)}"${on ? " checked" : ""}${!on && E.sel.size >= PICK_MAX ? " disabled" : ""}></label>`;
    if (q.official) return officialCard(q, pick);
    const opts = q.type === "spr" ? `<p class="nb-spr">Ответ вводится: <b>${esc((q.accept || [q.key]).join(" · "))}</b></p>`
      : `<ol class="nb-opts">${(q.options || []).map((o, k) => `<li class="${L(k) === q.key ? "ok" : ""}"><b>${L(k)}</b><span class="qhtml">${inline(o)}</span>${L(k) === q.key ? '<em>ответ</em>' : q.traps && q.traps[L(k)] ? `<small>${esc(q.traps[L(k)])}</small>` : ""}</li>`).join("")}</ol>`;
    const words = (q.words || []).length ? `<div class="nb-words"><span class="label">Слова</span>${q.words.map((w) => `<span class="nb-w" title="${esc(w.def)}"><b>${esc(w.lemma || w.w)}</b> ${esc(w.ru)}${w.src === "course" ? " · курс" : ""}</span>`).join("")}</div>` : "";
    return `<div class="nb-row${on ? " on" : ""}">${pick}
      <details class="nb-q"><summary><span class="nb-sum"><b>${esc(NAME(q.sub))}</b> <small>${esc(q.skill)} · ${esc(LEVEL[q.level] || q.level)}${q.theme ? " · " + esc(q.theme) : ""}${q.pattern ? " · " + esc(q.pattern) : ""}</small>
          ${q.hard ? '<i class="nb-tag hard">очень сложный</i>' : ""}${q.kind === "control" ? '<i class="nb-tag ctl">контрольный</i>' : ""}
          <span class="nb-stem">${esc(snip(q))}</span></span><code>${esc(q.id)}</code></summary>
      <div class="nb-body"><div lang="en">${q.passage ? `<div class="qhtml nb-pass">${rich(q.passage)}</div>` : ""}<div class="qhtml nb-stemfull"><b>${rich(q.stem)}</b></div>${opts}</div>
        <p class="nb-why"><b>Почему ${esc(q.key)}.</b> ${esc(q.explanation_ru)}</p>${q.trap_ru ? `<p class="nb-why"><b>Ловушка.</b> ${esc(q.trap_ru)}</p>` : ""}
        ${q.kind === "control" && q.ctrl_note ? `<p class="nb-why"><b>Контрольный.</b> ${esc(q.ctrl_note)}</p>` : ""}${words}</div></details></div>`;
  }
  function html() {
    if (!E.loaded) return '<p class="cb-wait" role="status">Загружаю банк…</p>';
    const L = list(), A = E.all, F = E.f;
    const sel = (id, label, cur, pairs, all, fmt = (v) => v) => `<label>${label}<select data-nbf="${id}">${opt("", all, cur)}${pairs.map(([v, n]) => opt(v, `${fmt(v)} · ${n}`, cur)).join("")}</select></label>`;
    const subs = count(A.filter((q) => !F.sec || q.sec === F.sec), (q) => q.sub), skills = count(A.filter((q) => !F.sec || q.sec === F.sec), (q) => q.skill);
    const picked = A.filter((q) => E.sel.has(q.id)), official = A.filter((q) => q.official).length;
    return `<div class="nb"><div class="cb-section-head"><h2 tabindex="-1" class="cb-section-title">nurzycom bank</h2>
        <p class="hint">Авторские задания · ${A.length - official}${official ? ` · College Board, ноябрь 2026 · ${official}` : ""}. Выберите вопросы, чтобы собрать «Мой тест».</p></div>
      ${E.err ? `<p class="hint bad">${esc(E.err)}</p>` : ""}
      ${A.length ? `<div class="nb-filt">
        ${official ? `<label>Источник<select data-nbf="source">${opt("", "Все источники", F.source)}${opt("original", "Авторские", F.source)}${opt("official", "College Board · ноябрь 2026", F.source)}</select></label>` : ""}
        <label>Раздел<select data-nbf="sec">${opt("", "Все", F.sec)}${["rw", "math"].map((v) => opt(v, SEC[v], F.sec)).join("")}</select></label>
        ${sel("skill", "Навык", F.skill, skills, "Все навыки")}${sel("sub", "Подтема", F.sub, subs, "Все подтемы", NAME)}
        <label>Уровень<select data-nbf="level">${opt("", "Любой", F.level)}${["E", "M", "H"].map((v) => opt(v, LEVEL[v], F.level)).join("")}</select></label>
        <label>Вид<select data-nbf="kind">${opt("", "Все", F.kind)}${opt("target", "Обычные", F.kind)}${opt("control", "Контрольные", F.kind)}</select></label>
        ${sel("theme", "Тема", F.theme, count(A, (q) => q.theme), "Любая")}
        <label class="nb-chk"><input type="checkbox" data-nbf="hard"${F.hard ? " checked" : ""}> Только очень сложные</label>
        <label class="nb-search">Поиск<input type="search" data-nbf="q" value="${esc(F.q)}" placeholder="слово из текста, ID"></label></div>
      <div class="row nb-ctl"><span class="hint">Показано ${Math.min(E.shown, L.length)} из ${L.length} · выбрано <b>${E.sel.size}</b> из ${PICK_MAX}</span>
        <button class="btn ghost" type="button" id="nb-ten">Случайные 10 из показанных</button><button class="btn ghost" type="button" id="nb-all">Отметить показанные</button>
        <button class="btn ghost" type="button" id="nb-none"${E.sel.size ? "" : " disabled"}>Снять</button></div>
      ${picked.length ? `<div class="nb-make"><label>Название теста<input id="nb-title" value="${esc(E.title || defTitle(picked))}"></label>
        <button class="btn" type="button" id="nb-give">Создать тест и задать (${picked.length})</button><button class="btn ghost" type="button" id="nb-save">Только сохранить в «Мои тесты»</button></div>` : ""}
      <p class="hint" role="status" id="nb-msg">${esc(E.msg)}</p>
      <div class="nb-list">${L.slice(0, E.shown).map(card).join("") || '<p class="hint">Под этот выбор вопросов нет.</p>'}</div>
      ${L.length > E.shown ? `<button class="btn ghost" type="button" id="nb-more">Показать ещё ${Math.min(PAGE, L.length - E.shown)}</button>` : ""}`
      : '<p class="hint">Банк пока пуст.</p>'}</div>`;
  }
  function defTitle(picked) {
    const subs = [...new Set(picked.map((q) => q.sub || q.skill))];
    return `nurzycom bank · ${subs.length === 1 ? NAME(subs[0]) : `${picked.length} вопросов`} · ${today()}`;
  }
  function bind(root) {
    const box = root.querySelector(".nb"); if (!box) return;
    const rerender = () => { api.render(); };
    box.querySelectorAll("[data-nbf]").forEach((el) => {
      const k = el.dataset.nbf, ev = el.type === "search" ? "input" : "change";
      el.addEventListener(ev, () => { E.f[k] = el.type === "checkbox" ? el.checked : el.value; if (k === "sec") { E.f.sub = ""; E.f.skill = ""; } E.shown = PAGE; E.msg = "";
        if (k === "source") { E.f.skill = ""; E.f.sub = ""; E.f.kind = ""; E.f.hard = false; E.f.theme = ""; }
      if (k === "q") { clearTimeout(E.t); E.t = setTimeout(() => { api.focus('[data-nbf="q"]'); rerender(); }, 250); } else rerender(); });
    });
    box.querySelectorAll("[data-nb-official]").forEach((details) => details.addEventListener("toggle", async () => {
      if (!details.open || details.dataset.loaded) return;
      const body = details.querySelector(".nb-body");
      details.dataset.loaded = "pending";
      body.innerHTML = '<p class="hint" lang="ru" role="status">Загружаю вопрос…</p>';
      try {
        const q = await OfficialPractice.question(details.dataset.nbOfficial);
        const opts = q.opts.map((o, i) => `<li class="${q.ans === "ABCD"[i] ? "ok" : ""}"><b>${"ABCD"[i]}</b><span class="qhtml">${o}</span></li>`).join("");
        body.innerHTML = `<div class="qhtml nb-pass">${q.stim}</div><div class="qhtml">${q.stem}</div>
          ${opts ? `<ol class="nb-opts">${opts}</ol>` : `<p><b>${esc(q.ans)}</b></p>`}<div class="qhtml">${q.rat}</div>`;
        details.dataset.loaded = "yes";
      } catch {
        delete details.dataset.loaded;
        body.innerHTML = '<p class="hint" lang="ru">Вопрос недоступен. Закройте и откройте его снова.</p>';
      }
    }));
    box.querySelectorAll("[data-nbsel]").forEach((el) => (el.onchange = () => { el.checked ? E.sel.add(el.dataset.nbsel) : E.sel.delete(el.dataset.nbsel); E.title = ""; rerender(); }));
    const b = (id, fn) => { const el = box.querySelector("#" + id); if (el) el.onclick = fn; };
    b("nb-more", () => { E.shown += PAGE; rerender(); });
    b("nb-all", () => { for (const q of list().slice(0, E.shown)) { if (E.sel.size >= PICK_MAX) break; E.sel.add(q.id); } E.title = ""; rerender(); });
    b("nb-none", () => { E.sel.clear(); E.title = ""; rerender(); });
    b("nb-ten", () => {   // 10 at random from what is shown: about 3 controls when there are any, the hard ones kept in
      const L = list(), sh = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
      const c = sh(L.filter((q) => q.kind === "control")).slice(0, 3), h = sh(L.filter((q) => q.kind !== "control" && q.hard)).slice(0, 1), rest = sh(L.filter((q) => q.kind !== "control" && !h.includes(q)));
      E.sel = new Set([...c, ...h, ...rest].slice(0, 10).map((q) => q.id)); E.title = ""; E.msg = E.sel.size ? `Выбрано ${E.sel.size}: обычные, контрольные и очень сложный, если есть.` : "Под этот выбор вопросов нет."; rerender(); });
    const title = box.querySelector("#nb-title"); if (title) title.oninput = () => (E.title = title.value);
    b("nb-save", () => make(false)); b("nb-give", () => make(true));
  }
  function toQuestion(q) {
    if (q.official) return { ...CTL.newQ(q.type), ref: { b: `public:item:${q.id}`, mod: "m1", i: 0 },
      source: `College Board · ${q.id}`, sec: q.sec, skill: q.skill, level: q.level };
    const x = (q.explanation_ru || "") + (q.trap_ru ? `\n\nЛовушка: ${q.trap_ru}` : "");
    return { ...CTL.newQ(q.type), passage: q.passage || "", stem: q.stem, sec: q.sec, skill: q.skill, sub: q.sub, level: q.level, nb: q.id, x,
      ...(q.type === "spr" ? { a: (q.accept || [q.key]).join(";") } : { o: (q.options || []).slice(), a: q.key, gl: q.words || [] }) };
  }
  async function make(assign) {
    if (!window.CTED || !window.CTL) { E.msg = "«Мои тесты» не загрузились: обновите страницу."; api.render(); return; }
    const picked = E.all.filter((q) => E.sel.has(q.id)); if (!picked.length) return;
    const t = CTL.newTest(); t.title = (E.title || defTitle(picked)).trim(); t.src = "nbank";
    t.note = "Решайте без подсказок и проверяйте каждый вариант.";
    t.q = picked.map(toQuestion);
    await CTL.resolve(t.q);
    const bad = t.q.filter((q) => CTL.problems(q).length).length;
    if (bad) { E.msg = `Вопросов с ошибкой формата: ${bad}. Снимите их и попробуйте снова.`; api.render(); return; }
    const ok = await CTED.addTest(t, `Тест «${t.title}» сохранён`);
    E.msg = ok ? `Тест «${t.title}» сохранён в «Мои тесты».` : "Тест не сохранился. Попробуйте ещё раз.";
    if (ok) { E.sel.clear(); E.title = ""; }
    api.render();
    if (assign && ok) CTED.giveTo(t.id);
  }
  return { init: (a) => (api = Object.assign(api, a)), load, html, bind, toQuestion, get loaded() { return E.loaded; }, _E: E };
})();
