/* Private read-only preview of the answers behind a student's progress. */
window.TeacherOriginals = (() => {
  const escape = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const plural = new Intl.PluralRules("ru");
  const misses = { one: "неверный ответ", few: "неверных ответа", many: "неверных ответов" };
  const date = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" });

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

  function mount(box, load, practice) {
    return (label, list, context) => {
      list.sort((a, b) => b.ts - a.ts);
      box.innerHTML = `<div class="card tw tw-original-card"><div class="tw-scopehead"><div>
        <h3 tabindex="-1">Ошибки ученика</h3><p>${escape(label)} · ${list.length} ${misses[plural.select(list.length)]}</p></div>
        <div class="row">${practice && context && list.length ? '<button type="button" class="btn ghost" data-original-practice>Подобрать готовые по этим ошибкам</button>' : ""}
        <button type="button" class="btn ghost" data-original-close>Закрыть</button></div></div>
        ${list.length ? `<ul class="tw-originals">${list.map((c, i) => `<li><details data-tworiginal="${i}"${i === 0 ? " open" : ""}>
          <summary><span><b>${escape(c.title)}</b><small>${[c.ts ? date.format(c.ts) : "", `ответ ученика: ${c.chosen}`].filter(Boolean).map(escape).join(" · ")}</small></span></summary>
          <div class="tw-original-body"></div></details></li>`).join("")}</ul>` : '<p class="hint">В выбранных источниках нет неверных ответов по этой теме.</p>'}</div>`;
      const pick = box.querySelector("[data-original-practice]");
      if (pick) pick.onclick = () => practice(context);
      box.querySelector("[data-original-close]").onclick = () => {
        box.replaceChildren();
        document.querySelector('[data-st="fix"]')?.focus();
      };
      box.querySelectorAll("[data-tworiginal]").forEach((d) => {
        const c = list[+d.dataset.tworiginal], body = d.querySelector(".tw-original-body");
        let loading;
        const open = () => {
          if (!d.open || loading) return;
          body.innerHTML = '<p class="hint">Загружаю задание…</p>';
          loading = load(c).catch(() => null).then((item) => { body.innerHTML = question(c, item); });
        };
        d.addEventListener("toggle", open);
        open();
      });
      box.querySelector("h3").focus({ preventScroll: true });
      box.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
  }
  return { mount };
})();
