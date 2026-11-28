/* Private read-only preview of the answers behind a student's progress. */
window.TeacherOriginals = (() => {
  const escape = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const plural = new Intl.PluralRules("ru");
  const misses = { one: "неверный ответ", few: "неверных ответа", many: "неверных ответов" };
  const date = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Almaty" });

  function question(c, item) {
    const key = c.bb ? c.bb.keys : item ? [].concat(item.acc || item.ans || []).filter(Boolean) : [];
    const sourceId = c.bb && /^[0-9a-f]{8}$/i.test(c.bb.cid || "") ? c.bb.cid : "";
    const bankKey = item?.bankKeys || [];
    const matchesKey = bankKey.some((v) => key.includes(v));
    const bankNotice = !c.bb ? "" : item
      ? `<p class="hint">${item.originalSource === "course" ? "Источник: это же задание в курсе." : "Источник: SAT Suite Educator Question Bank."}${sourceId ? ` ID <b>${escape(sourceId)}</b>.` : ""} Ответ ученика указан по Bluebook. Варианты ниже в порядке источника.${key.length && bankKey.length && !matchesKey && item.opts ? " Ключи источников различаются." : ""}</p>`
      : `<p class="hint">${sourceId ? `Публичный банк не вернул текст для ID <b>${escape(sourceId)}</b>.` : "Для этой позиции в индексе нет публичного ID."} <a href="https://mypractice.collegeboard.org/dashboard" target="_blank" rel="noopener noreferrer">Открыть My Practice</a></p>`;
    const answer = `<p class="tw-answers"><span>Ответ ученика <b>${escape(c.chosen)}</b></span>${key.length ? `<span>Верный ответ <b>${escape(key.join(" / "))}</b></span>` : ""}</p>`;
    const opts = item?.opts?.map((value, i) => {
      const letter = "ABCD"[i], chosen = !c.bb && letter === c.chosen, right = (c.bb ? bankKey : key).includes(letter);
      return `<li class="${right ? "ok" : chosen ? "trap" : ""}"><b>${letter}</b><span class="qhtml">${value}</span>${right ? "<em>верный</em>" : chosen ? "<em>ответ ученика</em>" : ""}</li>`;
    }).join("");
    return `${answer}${bankNotice}${c.sourceNote ? `<p class="hint">${escape(c.sourceNote)}</p>` : ""}${item?.stim || item?.stem || opts ? `<div class="tw-body" lang="en">
      ${item.stim ? `<div class="qhtml">${item.stim}</div>` : ""}${item.stem ? `<div class="qhtml">${item.stem}</div>` : ""}${opts ? `<ol class="tw-opts">${opts}</ol>` : ""}</div>`
      : !c.sourceNote && !c.bb ? '<p class="hint">Текст задания не загрузился.</p>' : ""}`;
  }

  const count = (n) => `${n} ${({ one: "ошибка", few: "ошибки", many: "ошибок" })[plural.select(n)]}`;
  function groups(list, key) {
    const results = new Map();
    for (const item of list) {
      const id = key(item);
      if (!results.has(id)) results.set(id, []);
      results.get(id).push(item);
    }
    return [...results.values()];
  }

  function mount(box, load, practice) {
    const workspace = box.closest(".review-workspace");
    let complete;
    return function show(label, list, context, options = {}) {
      if (options.quiet) complete = { list, context };
      list = list.slice().sort((a, b) => b.ts - a.ts);
      const indexed = list.map((c, i) => ({ ...c, i }));
      const testGroups = groups(indexed, (c) => c.review?.group || c.title);
      const block = (items, kind, title, children) =>
        `<details class="review-group" data-review-${kind}${items[0].i === 0 && (kind !== "test" || !options.quiet) ? " open" : ""}>
          <summary><span>${title}</span><small>${count(items.length)}</small></summary><div class="review-group-body">${children}</div></details>`;
      const errors = (items) => `<ul class="tw-originals">${items.slice().sort((a, b) =>
        String(a.review?.n ?? a.i).localeCompare(String(b.review?.n ?? b.i), "ru", { numeric: true })).map((c) => `<li>
        <details data-tworiginal="${c.i}"${c.i === 0 && !options.quiet ? " open" : ""}>
          <summary><span><b>${c.review?.n ? `Вопрос ${escape(c.review.n)}` : escape(c.title)}</b><small>Ответ ученика: ${escape(c.chosen)}</small></span></summary>
          ${practice && context && c.observation ? '<button type="button" class="chip review-match" data-original-match>Похожие к этому вопросу</button>' : ""}
          <div class="tw-original-body"></div>
        </details></li>`).join("")}</ul>`;
      const history = testGroups.map((test) => {
        const first = test[0], r = first.review;
        const title = `<strong>${escape(r?.test || first.title)}</strong>${first.ts ? `<span class="review-date">${escape(date.format(first.ts))}${r?.attempt > 1 ? ` · попытка ${r.attempt}` : ""}</span>` : ""}`;
        return block(test, "test", title, groups(test, (c) => c.review?.section || "").map((section) => {
          const [sample] = section;
          if (!sample.review?.module) return errors(section);
          return block(section, "section", escape(sample.review.section), groups(section, (c) => c.review.module).map((mod) =>
            block(mod, "module", escape(mod[0].review.module), errors(mod))).join(""));
        }).join(""));
      }).join("");
      box.innerHTML = `<div class="card tw tw-original-card"><div class="tw-scopehead"><div>
        <h3 tabindex="-1">Ошибки ученика</h3><p>${label ? escape(label) + " · " : ""}${list.length} ${misses[plural.select(list.length)]}</p></div>
        <div class="row">${practice && context && list.length ? '<button type="button" class="btn ghost" data-original-practice>Подобрать готовые по этим ошибкам</button>' : ""}
        ${!options.quiet ? '<button type="button" class="chip" data-original-close>Все ошибки</button>' : ""}</div></div>
        ${testGroups.length > 1 ? '<label class="review-find">Найти тест<input type="search" data-review-search placeholder="Название теста или дата"></label><p class="hint" data-review-no-results role="status" hidden>Тестов по этому запросу нет.</p>' : ""}
        ${history || '<p class="hint">В выбранных источниках нет неверных ответов по этой теме.</p>'}</div>`;
      if (workspace) workspace.classList.toggle("has-originals", list.length > 0);
      const pick = box.querySelector("[data-original-practice]");
      if (pick) pick.onclick = () => practice(context, { compare: true });
      const reset = box.querySelector("[data-original-close]");
      if (reset) reset.onclick = () => {
        if (complete) {
          show("", complete.list, complete.context, { quiet: true });
          box.querySelector("h3").focus();
        } else {
          box.replaceChildren();
          workspace?.classList.remove("has-originals");
          document.querySelector('[data-st="fix"]')?.focus();
        }
      };
      const search = box.querySelector("[data-review-search]");
      if (search) {
        const tests = [...box.querySelectorAll("[data-review-test]")];
        search.oninput = () => {
          const terms = search.value.trim().toLocaleLowerCase("ru").split(/\s+/).filter(Boolean);
          let visible = 0;
          tests.forEach((test) => {
            const text = test.querySelector("summary").textContent.toLocaleLowerCase("ru");
            test.hidden = !terms.every((word) => text.includes(word));
            if (!test.hidden) visible++;
          });
          box.querySelector("[data-review-no-results]").hidden = visible > 0;
        };
      }
      const originalDetails = [...box.querySelectorAll("[data-tworiginal]")];
      originalDetails.forEach((d) => {
        const c = list[+d.dataset.tworiginal], body = d.querySelector(".tw-original-body");
        const match = d.querySelector("[data-original-match]");
        if (match) match.onclick = () => practice({ ...context, label: c.review?.n ? `${c.review.test} · №${c.review.n}` : c.title,
          focus: null, trap: null, mistakes: [c.observation] }, { compare: true });
        let loading;
        const open = () => {
          if (!d.open) return;
          originalDetails.forEach((other) => { if (other !== d) other.open = false; });
          if (loading || options.quiet && box.closest("[hidden]")) return;
          body.innerHTML = '<p class="hint">Загружаю задание…</p>';
          loading = load(c).catch(() => null).then((item) => { body.innerHTML = question(c, item); });
        };
        d.addEventListener("toggle", open);
        if (!options.quiet) open();
      });
      if (!options.quiet) {
        box.querySelector("h3").focus({ preventScroll: true });
        box.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    };
  }
  return { mount };
})();
