/* Ready questions for an individual student's mistakes. All matching happens in the cabinet. */
window.TeacherPractice = (() => {
  const LIMIT = 12, PAGE = 16;
  const SOURCE = { bank: "nurzycom bank", mock: "Пробные тесты" };
  const LEVEL = { E: "лёгкий", M: "средний", H: "сложный" };
  const WHY = ["Тот же навык", "Похожая подтема", "Та же подтема", "Та же ловушка"];
  const esc = (value) => CTL.esc(value);
  const norm = (value) => String(value || "").trim().toLowerCase().replace(/^command of evidence.*$/, "command of evidence");
  const today = () => new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "Asia/Almaty" });

  function rank(candidate, targets) {
    let best = null;
    for (const target of targets) {
      if (candidate.sec !== target.sec) continue;
      const exact = target.primary && target.primary === candidate.primary;
      const related = target.subs.some((sub) => candidate.subs.includes(sub));
      const skill = candidate.skill && norm(candidate.skill) === norm(target.skill);
      const trap = target.trap && candidate.traps.includes(target.trap);
      if (!exact && !related && !skill && (!trap || target.subs.length || target.skill)) continue;
      const why = trap ? 3 : exact ? 2 : related ? 1 : 0;
      const score = (exact ? 100 : related ? 70 : skill ? 30 : 0) + (trap ? 65 : 0)
        + (candidate.level === target.level ? 8 : 0);
      if (!best || score > best.score) best = { score, why };
    }
    return best;
  }

  function fingerprint(item) {
    // Include the answer choices so equal SAT prompts on their own do not collapse unrelated questions.
    const clean = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/&[a-z0-9#]+;/gi, " ").replace(/\s+/g, " ").toLowerCase().trim();
    // Graphics can carry the whole question; retain their markup when comparing those items.
    const keep = (s) => /<(?:svg|img|math)\b/i.test(s || "") ? String(s).trim() : clean(s);
    return [keep(item.passage), keep(item.stem), ...item.o.map(keep).sort(), item.type === "spr" ? item.a : ""].join("|");
  }

  function matches(candidates, context) {
    const seen = new Set(context.seen), used = new Set(candidates.filter((c) => seen.has(c.id)).map((c) => fingerprint(c.item))), ranked = [];
    for (const c of candidates) {
      if (seen.has(c.id)) continue;
      const result = rank(c, context.targets);
      if (result) ranked.push({ ...c, ...result });
    }
    ranked.sort((a, b) => b.score - a.score || a.source.localeCompare(b.source) || a.id.localeCompare(b.id, "en", { numeric: true }));
    return ranked.filter((c) => {
      const key = fingerprint(c.item);
      if (used.has(key)) return false;
      used.add(key);
      return true;
    });
  }

  function body(c) {
    const { item } = c, markup = (s) => c.ref ? s : CTL.rich(s);
    const options = item.type === "mc" ? `<ol class="tw-opts">${item.o.map((value, index) => {
      const letter = "ABCD"[index], ok = item.a === letter;
      return `<li${ok ? ' class="ok"' : ""}><b>${letter}</b><span class="qhtml">${c.ref ? value : CTL.inline(value)}</span>${ok ? "<em>верный</em>" : ""}</li>`;
    }).join("")}</ol>` : `<p>Верный ответ <b>${esc(item.a)}</b></p>`;
    return `<div class="qhtml" lang="en">${markup(item.passage)}${markup(item.stem)}</div>${options}`;
  }

  function mount(box, options) {
    let current = null, cached = new Map();
    box.innerHTML = `<button class="btn" type="button" data-rp-open>Подобрать готовые задания</button><div data-rp-panel></div>`;
    const opener = box.querySelector("[data-rp-open]"), panel = box.querySelector("[data-rp-panel]");
    opener.onclick = () => open();
    async function open(input) {
      if (current?.busy) return;
      const state = { source: "", selected: new Map(), context: null, count: PAGE, draft: null, loading: true, busy: false, message: "" };
      current = state;
      panel.innerHTML = '<p class="hint" role="status">Подбираю задания по ошибкам ученика…</p>';
      box.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      try {
        state.context = await options.context(input);
        if (current !== state) return;
        draw(state, true);
      } catch {
        if (current === state) panel.innerHTML = '<p class="hint" role="status">Не удалось прочитать ошибки ученика. Повторите попытку.</p>';
        return;
      }
      await load(state);
    }

    function candidates(source) {
      if (!cached.has(source)) cached.set(source, options.candidates(source).catch((err) => {
        cached.delete(source);
        throw err;
      }));
      return cached.get(source);
    }
    async function load(state) {
      const source = state.source, types = source ? [source] : Object.keys(SOURCE), token = (state.loadingToken = {});
      state.loading = true; state.message = ""; draw(state);
      if (state.context.targets.length) {
        const result = await Promise.allSettled(types.map(candidates));
        if (current !== state || state.source !== source || state.loadingToken !== token) return;
        const successful = result.filter((r) => r.status === "fulfilled");
        state.list = matches(successful.flatMap((r) => r.value.items), state.context);
        state.message = successful.length !== types.length || successful.some((r) => r.value.incomplete)
          ? "Часть источников не загрузилась. Нажмите «Обновить подбор», чтобы повторить." : "";
      } else state.list = [];
      state.loading = false;
      draw(state);
    }
    function draw(state, focusTitle) {
      if (current !== state) return;
      const list = state.list || [], { context, source } = state;
      const opened = new Set(Array.from(panel.querySelectorAll("details[open]"), (d) => d.dataset.preview));
      panel.innerHTML = `<section class="card rp"><h3 tabindex="-1">Готовые задания${context.label ? ` · ${esc(context.label)}` : ""}</h3>
        <div class="rp-toolbar"><label>Источник<select data-rp-source${state.busy ? " disabled" : ""}>
          <option value="">Все источники</option>${Object.entries(SOURCE).map(([k, v]) => `<option value="${k}"${source === k ? " selected" : ""}>${v}</option>`).join("")}</select></label>
          <button class="btn ghost" type="button" data-rp-refresh${state.loading || state.busy ? " disabled" : ""}>Обновить подбор</button></div>
        ${state.loading ? '<p class="hint" role="status">Ищу в выбранных источниках…</p>' : list.length ?
          `<div class="rp-list">${list.slice(0, state.count).map((c, i) => `<div class="rp-entry">
            <label class="rp-pick"><input type="checkbox" data-rp-pick="${i}" aria-label="Выбрать ${esc(c.label)}"${state.selected.has(c.id) ? " checked" : ""}${state.busy || (!state.selected.has(c.id) && state.selected.size >= LIMIT) ? " disabled" : ""}></label>
            <details data-preview="${esc(c.id)}"${opened.has(c.id) ? " open" : ""}><summary><b>${esc(c.label)}</b><small>${[WHY[c.why], c.skill, LEVEL[c.level]].filter(Boolean).map(esc).join(" · ")}</small></summary>
              <div class="rp-question"></div></details></div>`).join("")}</div>
          ${list.length > state.count ? `<button type="button" class="btn ghost" data-rp-more>Ещё вопросы · ${list.length - state.count}</button>` : ""}` :
          `<p class="hint">${context.targets.length ? "В выбранных источниках нет новых вопросов по этим ошибкам." : "В этой работе пока нет ошибок с подтверждённым навыком или подтемой."}</p>`}
        <p class="hint" role="status" data-rp-message>${esc(state.message)}</p>
        <div class="row rp-actions"><span class="hint" data-rp-count>Выбрано ${state.selected.size} из ${LIMIT}</span>
          <button type="button" class="btn ghost" data-rp-save${state.busy || !state.selected.size ? " disabled" : ""}>Сохранить в «Мои тесты»</button>
          <button type="button" class="btn" data-rp-assign${state.busy || !state.selected.size ? " disabled" : ""}>Перейти к назначению</button></div></section>`;
      const on = (sel, fn) => { const node = panel.querySelector(sel); if (node) node.onclick = fn; };
      if (focusTitle) panel.querySelector("h3").focus({ preventScroll: true });
      panel.querySelector("[data-rp-source]").onchange = (e) => { state.source = e.target.value; state.count = PAGE; load(state); };
      on("[data-rp-refresh]", () => { cached = new Map(); return load(state); });
      on("[data-rp-more]", () => {
        const at = state.count; state.count += PAGE; draw(state);
        panel.querySelector(`[data-rp-pick="${at}"]`)?.focus({ preventScroll: true });
      });
      panel.querySelectorAll("[data-preview]").forEach((details, i) => {
        const display = () => {
          const content = details.querySelector(".rp-question");
          if (details.open && !content.hasChildNodes()) content.innerHTML = body(list[i]);
        };
        details.addEventListener("toggle", display);
        display();
      });
      panel.querySelectorAll("[data-rp-pick]").forEach((input) => (input.onchange = () => {
        const i = +input.dataset.rpPick, c = list[i];
        if (input.checked) state.selected.set(c.id, c); else state.selected.delete(c.id);
        state.message = ""; draw(state);
        panel.querySelector(`[data-rp-pick="${i}"]`)?.focus({ preventScroll: true });
      }));
      on("[data-rp-save]", () => save(state, false));
      on("[data-rp-assign]", () => save(state, true));
    }

    async function save(state, assign) {
      if (state.busy || !state.selected.size) return;
      const picks = [...state.selected.values()];
      const signature = JSON.stringify(picks.map((c) => c.id));
      const draft = state.draft?.signature === signature ? state.draft : { signature, test: {
        ...CTL.newTest(), src: "ready",
        title: `Готовые задания · ${state.context.label ? state.context.label + " · " : ""}${today()}`.slice(0, 90),
        q: picks.map((c) => c.ref ? { id: CTL.newQ().id, type: c.item.type, ref: c.ref, source: c.label, skill: c.skill, level: c.level } : NBANK.toQuestion(c.raw))
      } };
      state.draft = draft; state.busy = true; state.message = "Сохраняю тест…"; draw(state);
      try {
        await CTL.resolve(draft.test.q);
        if (draft.test.q.some((q) => CTL.problems(q).length)) {
          state.message = "Один из выбранных вопросов недоступен. Проверьте подбор.";
          return;
        }
        if (!draft.saved) draft.saved = await CTED.addTest(draft.test, `Тест «${draft.test.title}» сохранён`);
        state.message = draft.saved ? "Тест сохранён в «Мои тесты»." : "Сохранение на сервере не подтверждено. Повторите попытку.";
        if (assign && draft.saved) await CTED.giveTo(draft.test.id, options.key);
      } catch { state.message = "Не удалось завершить действие. Повторите попытку."; }
      finally { state.busy = false; draw(state); }
    }
    return open;
  }

  return { mount };
})();
