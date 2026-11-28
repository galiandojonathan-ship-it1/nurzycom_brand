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
    let current = null, cached = new Map(), draft = null;
    const selected = new Map(), workspace = box.closest(".review-workspace");
    box.innerHTML = `<button class="btn" type="button" data-rp-open>Подобрать готовые задания</button><div data-rp-panel></div>`;
    const opener = box.querySelector("[data-rp-open]"), panel = box.querySelector("[data-rp-panel]");
    opener.onclick = () => open();
    async function open(input, behavior = {}) {
      if (current?.busy) return;
      const state = { source: current?.source || "", kind: current?.kind || "", selected, context: null, count: PAGE, loading: true, busy: false, message: "" };
      current = state;
      workspace?.classList.add("has-practice");
      opener.hidden = true;
      panel.innerHTML = '<p class="hint" role="status">Подбираю задания по ошибкам ученика…</p>';
      if (!behavior.compare || !matchMedia("(min-width: 1050px)").matches) box.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      try {
        state.context = await options.context(input);
        if (current !== state) return;
        draw(state, true);
      } catch {
        if (current === state) { opener.hidden = false; panel.innerHTML = '<p class="hint" role="status">Не удалось прочитать ошибки ученика. Повторите попытку.</p>'; }
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
    function addBatch(state, list, count, selector) {
      const available = list.filter((c) => !selected.has(c.id));
      const size = Math.min(count, LIMIT - selected.size, available.length);
      if (!size || state.busy) return;
      let picks = available.slice(0, size);
      if (!state.kind) {
        const controls = available.filter((c) => c.control);
        const regular = available.filter((c) => !c.control);
        const have = [...selected.values()].filter((c) => c.control).length;
        const needed = Math.min(controls.length, size, Math.max(0, Math.round((selected.size + size) * 0.3) - have, size - regular.length));
        picks = regular.slice(0, size - needed);
        controls.slice(0, needed).forEach((c, i) => picks.splice(Math.min(2 + i * 3, picks.length), 0, c));
      }
      picks.forEach((c) => selected.set(c.id, c));
      const controls = picks.filter((c) => c.control).length;
      state.message = `Добавлено: ${picks.length}${controls ? ` · контрольных: ${controls}` : ""}.`;
      draw(state);
      const anchor = panel.querySelector(selector);
      (anchor?.disabled ? panel.querySelector(".rp-tray summary") : anchor)?.focus({ preventScroll: true });
    }

    function draw(state, focusTitle) {
      if (current !== state) return;
      const all = state.list || [], { context, source, kind } = state;
      const list = kind ? all.filter((c) => !!c.control === (kind === "control")) : all;
      const canAdd = !state.loading && !state.busy && selected.size < LIMIT && list.some((c) => !selected.has(c.id));
      const selectedControls = [...selected.values()].filter((c) => c.control).length;
      const opened = new Set(Array.from(panel.querySelectorAll("details[open]"), (d) => d.dataset.preview));
      panel.innerHTML = `<section class="card rp"><header class="rp-head"><h3 tabindex="-1">Готовые задания</h3><button type="button" class="chip" data-rp-close${state.busy ? " disabled" : ""}>Свернуть</button></header>
        ${context.label ? `<p class="hint rp-context">${esc(context.label)}</p>` : ""}
        <div class="rp-toolbar"><label>Источник<select data-rp-source${state.busy ? " disabled" : ""}>
          <option value="">Все источники</option>${Object.entries(SOURCE).map(([k, v]) => `<option value="${k}"${source === k ? " selected" : ""}>${v}</option>`).join("")}</select></label>
          <label>Тип<select data-rp-kind${state.busy ? " disabled" : ""}>
            ${[["", "Все задания"], ["regular", "Основные"], ["control", "Контрольные"]].map(([value, name]) =>
              `<option value="${value}"${kind === value ? " selected" : ""}>${name}</option>`).join("")}</select></label>
          <button class="btn ghost" type="button" data-rp-refresh${state.loading || state.busy ? " disabled" : ""}>Обновить подбор</button></div>
        ${!state.loading && list.length ? `<div class="rp-batch" role="group" aria-label="Быстрый выбор"><button class="chip" type="button" data-rp-add-five${canAdd ? "" : " disabled"}>Добавить 5</button>
          <button class="chip" type="button" data-rp-fill${canAdd ? "" : " disabled"}>Заполнить до ${LIMIT}</button></div>` : ""}
        ${state.loading ? '<p class="hint" role="status">Ищу в выбранных источниках…</p>' : list.length ?
          `<div class="rp-list">${list.slice(0, state.count).map((c, i) => `<div class="rp-entry">
            <label class="rp-pick"><input type="checkbox" data-rp-pick="${i}" aria-label="Выбрать ${esc(c.label)}"${state.selected.has(c.id) ? " checked" : ""}${state.busy || (!state.selected.has(c.id) && state.selected.size >= LIMIT) ? " disabled" : ""}></label>
            <details data-preview="${esc(c.id)}"${opened.has(c.id) ? " open" : ""}><summary><span class="rp-reason">${esc(WHY[c.why])}</span>${c.control ? ' <span class="rp-reason rp-control">Контрольное</span>' : ""}<b>${esc(c.label)}</b><small>${[c.skill, LEVEL[c.level]].filter(Boolean).map(esc).join(" · ")}</small></summary>
              <div class="rp-question"></div></details></div>`).join("")}</div>
          ${list.length > state.count ? `<button type="button" class="btn ghost" data-rp-more>Ещё вопросы · ${list.length - state.count}</button>` : ""}` :
          `<p class="hint">${context.targets.length ? kind === "control" ? "По этим ошибкам в выбранном источнике нет контрольных вопросов." : "В выбранных источниках нет новых вопросов по этим ошибкам." : "В этой работе пока нет ошибок с подтверждённым навыком или подтемой."}</p>`}
        <footer class="rp-dock${selected.size ? " has-selection" : ""}">
          <p class="hint" role="status" data-rp-message>${esc(state.message)}</p>
          <div class="rp-actions"><details class="rp-tray"${panel.querySelector(".rp-tray[open]") ? " open" : ""}>
            <summary><span data-rp-count>Выбрано ${selected.size} из ${LIMIT}${selectedControls ? ` · контрольных: ${selectedControls}` : ""}</span></summary>
            ${selected.size ? `<ul>${[...selected.values()].map((c) => `<li><span>${esc(c.label)}${c.control ? '<small class="rp-reason rp-control">Контрольное</small>' : ""}</span>
              <button type="button" class="chip" data-rp-remove="${esc(c.id)}" aria-label="Убрать ${esc(c.label)}"${state.busy ? " disabled" : ""}>Убрать</button></li>`).join("")}</ul><button type="button" class="chip" data-rp-clear${state.busy ? " disabled" : ""}>Снять все</button>`
              : '<p class="hint">Отметьте вопросы, которые хотите задать.</p>'}</details>
            <button type="button" class="btn ghost" data-rp-save${state.busy || !selected.size ? " disabled" : ""}>Сохранить</button>
            <button type="button" class="btn" data-rp-assign${state.busy || !selected.size ? " disabled" : ""}>Назначить</button>
          </div></footer></section>`;
      const on = (sel, fn) => { const node = panel.querySelector(sel); if (node) node.onclick = fn; };
      if (focusTitle) panel.querySelector("h3").focus({ preventScroll: true });
      on("[data-rp-close]", () => {
        current = null; panel.replaceChildren(); workspace?.classList.remove("has-practice");
        opener.hidden = false; opener.focus();
      });
      panel.querySelectorAll("[data-rp-remove]").forEach((button) => {
        button.onclick = () => { selected.delete(button.dataset.rpRemove); state.message = ""; draw(state); panel.querySelector(".rp-tray summary")?.focus({ preventScroll: true }); };
      });
      panel.querySelector("[data-rp-source]").onchange = (e) => { state.source = e.target.value; state.count = PAGE; load(state); };
      panel.querySelector("[data-rp-kind]").onchange = (e) => {
        state.kind = e.target.value; state.count = PAGE; state.message = ""; draw(state);
        queueMicrotask(() => {
          const node = panel.querySelector("[data-rp-kind]");
          (node?.parentElement.querySelector('[role="combobox"]') || node)?.focus({ preventScroll: true });
        });
      };
      on("[data-rp-add-five]", () => addBatch(state, list, 5, "[data-rp-add-five]"));
      on("[data-rp-fill]", () => addBatch(state, list, LIMIT, "[data-rp-fill]"));
      on("[data-rp-clear]", () => { selected.clear(); state.message = ""; draw(state); panel.querySelector(".rp-tray summary")?.focus(); });
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
      draft = draft?.signature === signature ? draft : { signature, test: {
        ...CTL.newTest(), src: "ready",
        title: `Готовые задания · ${state.context.label ? state.context.label + " · " : ""}${today()}`.slice(0, 90),
        q: picks.map((c) => c.ref ? { id: CTL.newQ().id, type: c.item.type, ref: c.ref, source: c.label, sec: c.sec, skill: c.skill, level: c.level } : NBANK.toQuestion(c.raw))
      } };
      state.busy = true; state.message = "Сохраняю тест…"; draw(state);
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
