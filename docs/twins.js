/* «Похожие вопросы · Gemini» in the cabinet (2026-11-22, Nurassyl: «позволь Gemini создавать похожие на ошибки ученика вопросы,
   чтобы я одним кликом мог сгенерировать и бить по слабым точкам студентов после разбора ошибок»).
   One click sends one student's first-attempt mistakes (no name; text only for nurzycom's own questions) to POST admin/twins,
   shows the new questions that passed the blind key check, and one more click saves them as a «Мой тест» and assigns it.
   Picker (2026-11-23, Nurassyl: «let me choose what questions gemini should create based on what homework and what skill… using
   analytics… work with mistakes as precisely as possible»): with o.pool the card lists every first-attempt mistake of the student,
   filtered by work, skill, subtopic and trap (labels from the progress tags), with quick picks from the analytics; the teacher ticks
   the exact mistakes (up to 12, sent to Gemini in batches of 6) and may add a note. Subtopic and trap labels go to Gemini too. */
window.TWINS = (() => {
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const LEVEL = { E: "лёгкий", M: "средний", H: "сложный" };
  // question HTML → plain text with the site's own markup kept for underlines and blanks
  function text(html) {
    const doc = new DOMParser().parseFromString(String(html || "").replace(/<u>([\s\S]*?)<\/u>/gi, "__$1__").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>\s*<p[^>]*>/gi, "\n\n"), "text/html");
    return doc.body.textContent.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  }
  const rich = (s) => (window.CTL ? CTL.rich(s) : `<p>${esc(s)}</p>`);
  const today = () => new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  // m: { id, title, sec, sk, d, chosen, item, focus?, trapKind? } — item is the decrypted bundle question
  function payloadOf(m) {
    const it = m.item || {}, mc = it.t !== "spr" && Array.isArray(it.opts) && it.opts.length === 4;
    const key = mc ? it.ans : [].concat(it.acc || it.ans || "")[0];
    const out = { sec: m.sec, skill: m.sk || it.sk || "", level: m.d || it.d || "M", chosen: /^[A-D]$/.test(m.chosen || "") ? m.chosen : "", key: String(key || "").split(/\s+или\s+|\s+or\s+|;/)[0].trim().slice(0, 24) };   // typed keys list several forms; the server takes one (≤ 24)
    if (m.focus) out.focus = m.focus; if (m.trapKind) out.trapKind = m.trapKind;
    if (it.own === true) {
      out.own = true;
      out.text = { passage: text(it.stim).slice(0, 2400), prompt: text(it.stem).slice(0, 700), ...(mc ? { options: it.opts.map((o) => text(o).slice(0, 420)) } : {}) };
    }
    return out;
  }

  function card(q, i, src) {
    return `<details class="tw-q" open><summary><label class="tw-pick"><input type="checkbox" data-twpick="${i}" checked> Задание ${i + 1}</label>
        <small>${esc(q.skill)} · ${esc(LEVEL[q.level] || q.level)} · на ошибку: ${esc(src ? src.title : "—")}${src && src.focus ? ` · ${esc(src.focus)}` : ""}${src && src.trapKind ? ` · ловушка ${esc(quo(src.trapKind))}` : ""}</small></summary>
      ${q.kind === "decoy" ? '<p class="tw-decb">Контрольное: похоже на слабое место, но верный ответ другого типа. Ученик видит его как обычное задание.</p>' : ""}<p class="tw-mech">Отрабатывает: ${esc(q.mechanism)}</p>
      <div class="tw-body" lang="en">${q.passage ? `<div class="qhtml">${rich(q.passage)}</div>` : ""}<div class="qhtml"><b>${rich(q.prompt)}</b></div>
        <ol class="tw-opts">${q.options.map((o, k) => { const L = "ABCD"[k]; return `<li class="${L === q.answer ? "ok" : L === q.trap ? "trap" : ""}"><b>${L}</b><span class="qhtml">${window.CTL ? CTL.inline(o) : esc(o)}</span>${L === q.answer ? "<em>верный</em>" : L === q.trap ? "<em>ловушка</em>" : ""}</li>`; }).join("")}</ol></div>
      <p class="tw-why"><b>Почему ${q.answer}.</b> ${esc(q.rationale)}</p><p class="tw-why"><b>Ловушка ${q.trap}.</b> ${esc(q.trapWhy)}</p></details>`;
  }

  const PICK_MAX = 12, BATCH = 6, DAY = 864e5;
  const quo = (t) => (/^«/.test(t) ? t : `«${t}»`);   // some trap labels carry their own quotes
  const when = (ts) => (ts ? new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : "");
  const count = (list, key) => { const m = new Map(); list.forEach((c) => { const k = key(c); if (k) m.set(k, (m.get(k) || 0) + 1); }); return [...m].sort((a, b) => b[1] - a[1]); };
  const opt = (v, label, cur) => `<option value="${esc(v)}"${v === cur ? " selected" : ""}>${esc(label)}</option>`;

  /* box: where to draw; o: { name, key, scope?,
       mistakes?: () => Promise<m[]>             fixed list (one part's review): one click, no picker
       pool?: () => Promise<c[]>                 picker: every first-attempt mistake c = { id, title, plabel, sec, sk, d, chosen, ts, focus, trapKind }
       load?: (c) => Promise<m|null>             c + its decrypted question (item)
       quick?: () => [{ label, hint, f }]        picks from the analytics: f = { work, skill, focus, trap, days } } */
  function mount(box, o) {
    const S = { per: 2, decoys: (() => { try { return localStorage.getItem("tw_decoys") !== "0"; } catch (e) { return true; } })(), busy: false, out: null, list: null, pool: null, f: { work: "", skill: "", focus: "", trap: "", days: 0 }, sel: new Set(), note: "", msg: "" };
    const picker = !!o.pool;
    const shown = () => (S.pool || []).filter((c) => (!S.f.work || c.plabel === S.f.work) && (!S.f.skill || c.sk === S.f.skill) && (!S.f.focus || c.focus === S.f.focus) &&
      (!S.f.trap || c.trapKind === S.f.trap) && (!S.f.days || (c.ts || 0) >= Date.now() - S.f.days * DAY));
    function pickHTML() {
      if (!S.pool) return '<p class="hint">Собираю ошибки ученика…</p>';
      if (!S.pool.length) return '<p class="hint">Ошибок с первой попытки нет: отрабатывать нечего.</p>';
      const P = S.pool, F = S.f, list = shown();
      const sel = (id, label, cur, pairs, all) => `<label>${label}<select data-twf="${id}">${opt("", all, cur)}${pairs.map(([v, n]) => opt(v, `${v} · ${n}`, cur)).join("")}</select></label>`;
      const all = o.quick ? o.quick() : [], quick = all.map((q, k) => ({ ...q, k })).filter((q) => q && q.f && P.some((c) => (!q.f.focus || c.focus === q.f.focus) && (!q.f.trap || c.trapKind === q.f.trap)));
      return `<div class="tw-quick"><span class="label">Быстрый выбор</span><div class="row">${quick.map((q) => `<button class="chip" type="button" data-twq="${q.k}" title="${esc(q.hint || "")}">${esc(q.label)}</button>`).join("")}
          <button class="chip" type="button" data-twq="last">Последняя работа</button><button class="chip" type="button" data-twq="reset">Сбросить фильтры</button></div></div>
        <div class="tw-filt">${sel("work", "Работа", F.work, count(P, (c) => c.plabel), "Все работы")}${sel("skill", "Навык", F.skill, count(P, (c) => c.sk), "Все навыки")}
          ${sel("focus", "Подтема", F.focus, count(P, (c) => c.focus), "Все подтемы")}${sel("trap", "Ловушка", F.trap, count(P, (c) => c.trapKind), "Любая")}
          <label>Когда<select data-twf="days">${[[0, "За всё время"], [7, "7 дней"], [14, "14 дней"], [30, "30 дней"]].map(([v, l]) => opt(String(v), l, String(F.days))).join("")}</select></label></div>
        <div class="row tw-selctl"><button class="btn ghost" type="button" id="tw-all">Отметить показанные${list.length > PICK_MAX ? ` (первые ${PICK_MAX})` : ""}</button><button class="btn ghost" type="button" id="tw-none">Снять все</button>
          <span class="hint">Показано ${list.length} из ${P.length} · выбрано <b>${S.sel.size}</b> из ${PICK_MAX}</span></div>
        <ul class="tw-list">${list.map((c) => `<li><label><input type="checkbox" data-twsel="${esc(c.id)}"${S.sel.has(c.id) ? " checked" : ""}${!S.sel.has(c.id) && S.sel.size >= PICK_MAX ? " disabled" : ""}>
          <span><b>${esc(c.title)}</b><small>${[c.sk, LEVEL[c.d], c.focus, c.chosen ? `выбрал ${c.chosen}` : "без ответа", c.trapKind ? `ловушка ${quo(c.trapKind)}` : "", when(c.ts)].filter(Boolean).map(esc).join(" · ")}</small></span></label></li>`).join("") || '<li class="hint">Под эти фильтры ошибок нет.</li>'}</ul>
        <label class="tw-note">Пожелание для Gemini (необязательно)<textarea id="tw-note" rows="2" maxlength="300" placeholder="Например: только запятая перед which и that; тексты про науку">${esc(S.note)}</textarea></label>`;
    }
    const draw = () => {
      const n = S.list ? S.list.length : null, can = picker ? S.sel.size > 0 : true;
      box.innerHTML = `<div class="card tw" aria-busy="${S.busy}"><span class="label">Похожие вопросы · Gemini</span>
        <p class="hint">${picker ? "Выберите, на какие ошибки писать задания: по работе, навыку, подтеме или ловушке, или одной кнопкой из аналитики. " : ""}Gemini пишет новые задания на тот же навык, сложность и ловушку${o.scope ? ` (${esc(o.scope)})` : ""}; подтема и вид ловушки уходят в запрос. Ключ каждого задания проверяет второй, слепой вызов: непрошедшие отбрасываются. Имя ученика в Gemini не уходит, текст отправляется только для авторских вопросов nurzycom.</p>
        ${picker ? pickHTML() : ""}
        <div class="row tw-ctl"><label>Заданий на ошибку <select id="tw-per">${[1, 2, 3].map((k) => `<option${k === S.per ? " selected" : ""}>${k}</option>`).join("")}</select></label>
          <label class="tw-dec" title="Около 30% заданий похожи на слабое место, но верный ответ в них другого типа: ученик учится определять ответ по тексту, а не выбирать привычный"><input type="checkbox" id="tw-decoys"${S.decoys ? " checked" : ""}> Контрольные ~30%</label>
          <button class="btn" type="button" id="tw-go"${S.busy || !can ? " disabled" : ""}>${S.busy ? "Gemini пишет задания…" : S.out ? "Сгенерировать заново" : picker ? `Сгенерировать на выбранные (${S.sel.size})` : "Сгенерировать похожие"}</button></div>
        <p class="hint" role="status" id="tw-st">${esc(S.msg || (picker ? (S.pool && S.pool.length && !S.sel.size ? "Отметьте ошибки в списке." : "") : n === null ? "" : n ? `Ошибок для отработки: ${n}.` : "Ошибок с первой попытки нет: отрабатывать нечего."))}</p>
        <div id="tw-out">${S.out ? S.out.questions.map((q, i) => card(q, i, S.list[q.source - 1])).join("") : ""}</div>
        ${S.out ? `<div class="row"><button class="btn" type="button" id="tw-give">Задать ученику как «Мой тест»</button><button class="btn ghost" type="button" id="tw-save">Только сохранить в «Мои тесты»</button></div>` : ""}</div>`;
      box.querySelector("#tw-per").onchange = (e) => (S.per = +e.target.value);
      box.querySelector("#tw-decoys").onchange = (e) => { S.decoys = e.target.checked; try { localStorage.setItem("tw_decoys", S.decoys ? "1" : "0"); } catch (x) { /* private mode */ } };
      box.querySelector("#tw-go").onclick = run;
      const give = box.querySelector("#tw-give"), save = box.querySelector("#tw-save");
      if (give) give.onclick = () => store(true);
      if (save) save.onclick = () => store(false);
      if (!picker || !S.pool?.length) return;
      box.querySelectorAll("[data-twf]").forEach((el) => (el.onchange = () => { S.f[el.dataset.twf] = el.dataset.twf === "days" ? +el.value : el.value; S.msg = ""; draw(); }));
      box.querySelectorAll("[data-twsel]").forEach((el) => (el.onchange = () => { el.checked ? S.sel.add(el.dataset.twsel) : S.sel.delete(el.dataset.twsel); S.msg = ""; draw(); }));
      const note = box.querySelector("#tw-note"); if (note) note.oninput = () => (S.note = note.value);
      box.querySelector("#tw-all").onclick = () => { for (const c of shown()) { if (S.sel.size >= PICK_MAX) break; S.sel.add(c.id); } draw(); };
      box.querySelector("#tw-none").onclick = () => { S.sel.clear(); draw(); };
      box.querySelectorAll("[data-twq]").forEach((el) => (el.onclick = () => {
        const k = el.dataset.twq, q = (o.quick ? o.quick() : [])[+k];
        if (k === "reset") preset({}, false);
        else if (k === "last") { const c = [...S.pool].sort((a, b) => (b.ts || 0) - (a.ts || 0))[0]; preset({ work: c ? c.plabel : "" }); }
        else if (q) preset(q.f);
      }));
    };
    // set the filters (and tick what they show, up to PICK_MAX); used by the quick picks and by «Похожие» in the progress card
    function preset(f, tick = true) {
      S.f = { work: "", skill: "", focus: "", trap: "", days: 0, ...f }; S.out = null; S.msg = "";
      if (tick) { S.sel.clear(); for (const c of shown()) { if (S.sel.size >= PICK_MAX) break; S.sel.add(c.id); } if (!S.sel.size) S.msg = "Под этот выбор ошибок нет."; }
      draw();
    }
    async function run() {
      if (S.busy) return;
      S.busy = true; S.out = null; S.msg = "Собираю ошибки…"; draw();
      try {
        let list;
        if (picker) { const ids = S.sel; list = (await Promise.all(S.pool.filter((c) => ids.has(c.id)).map((c) => o.load(c).catch(() => null)))).filter(Boolean); }
        else list = (await o.mistakes()).slice(0, PICK_MAX);
        S.list = list;
        if (!list.length) { S.msg = picker ? "Не удалось загрузить выбранные вопросы. Обновите страницу." : "Ошибок с первой попытки нет: отрабатывать нечего."; return; }
        const out = { questions: [], asked: 0, dropped: 0 }, errs = [];
        for (let b = 0; b < list.length; b += BATCH) {
          const part = list.slice(b, b + BATCH);
          S.msg = `Ошибок: ${list.length}. Gemini пишет и проверяет задания${list.length > BATCH ? `, часть ${b / BATCH + 1} из ${Math.ceil(list.length / BATCH)}` : ""}, это до минуты…`; draw();
          const r = await SITE.api("admin/twins", { method: "POST", body: JSON.stringify({ perMistake: S.per, decoys: S.decoys, mistakes: part.map(payloadOf), ...(S.note.trim() ? { note: S.note.trim() } : {}) }) });
          if (!r.ok) { errs.push((r.data && r.data.error) || (r.status === 403 ? "Нужен ключ администратора в этом браузере." : "Не получилось.")); continue; }
          r.data.questions.forEach((q) => out.questions.push({ ...q, source: q.source + b }));
          out.asked += r.data.asked; out.dropped += r.data.dropped || 0;
        }
        if (!out.questions.length) { S.msg = errs[0] || "Не получилось. Попробуйте ещё раз."; return; }
        S.out = out;
        const dc = out.questions.filter((q) => q.kind === "decoy").length;
        S.msg = `Готово: ${out.questions.length} из ${out.asked}${dc ? ` · контрольных: ${dc}` : ""}${out.dropped ? ` · ${out.dropped} не прошли проверку ключа и убраны` : ""}${errs.length ? ` · часть не получилась: ${errs[0]}` : ""}. Снимите галочку с заданий, которые не нужны.`;
      } catch (e) { S.msg = "Не удалось связаться с сервером. Попробуйте ещё раз."; }
      finally { S.busy = false; draw(); }
    }
    async function store(assign) {
      const picked = [...box.querySelectorAll("[data-twpick]")].filter((c) => c.checked).map((c) => S.out.questions[+c.dataset.twpick]);
      if (!picked.length) { S.msg = "Отметьте хотя бы одно задание."; draw(); return; }
      if (!window.CTED || !window.CTL) { S.msg = "«Мои тесты» не загрузились: обновите страницу."; draw(); return; }
      const t = CTL.newTest(), topics = [...new Set(picked.map((q) => (S.list[q.source - 1] || {}).focus || q.skill).filter(Boolean))];
      t.title = `Работа над ошибками · ${o.name}${topics.length === 1 ? ` · ${topics[0]}` : ""} · ${today()}`; t.src = "gemini";
      t.note = "Задания на ваши недавние ошибки. Решайте без подсказок и проверяйте каждый вариант.";
      const mixed = picked.slice(); for (let i = mixed.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [mixed[i], mixed[j]] = [mixed[j], mixed[i]]; }   // decoys anywhere in the test
      t.q = mixed.map((q) => Object.assign(CTL.newQ("mc"), { passage: q.passage, stem: q.prompt, o: q.options.slice(), a: q.answer,
        x: `${q.rationale}\n\nЛовушка ${q.trap}: ${q.trapWhy}`, skill: q.skill, level: q.level || "M" }));
      const bad = t.q.filter((q) => CTL.problems(q).length).length;
      if (bad) { S.msg = `Не готовы заданий: ${bad}. Сгенерируйте заново.`; draw(); return; }
      const ok = await CTED.addTest(t, `Тест «${t.title}» сохранён`);
      S.msg = ok ? "Тест сохранён в «Мои тесты». На уроке он есть на аккаунте урока: «Пульт урока» → «Тесты преподавателя» (решать вместе или живая практика)." : "Тест сохранён только в этом браузере: повторите, когда будет связь.";
      draw();
      if (assign && ok) CTED.giveTo(t.id, o.key);
    }
    draw();
    if (picker) o.pool().then((p) => { S.pool = p || []; draw(); }).catch(() => { S.pool = []; S.msg = "Не удалось собрать ошибки. Обновите страницу."; draw(); });
    return { preset: (f) => { const go = () => { preset(f); box.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
      if (S.pool) go(); else o.pool().then((p) => { S.pool = p || []; go(); }); } };
  }
  return { mount, payloadOf, text };
})();
