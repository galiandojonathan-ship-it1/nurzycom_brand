/* Private read-only preview of the answers behind a student's progress. */
window.TeacherOriginals = (() => {
  const escape = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const plural = new Intl.PluralRules("ru");
  const misses = { one: "неверный ответ", few: "неверных ответа", many: "неверных ответов" };
  const date = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" });

  function question(c, item) {
    const key = item ? [].concat(item.acc || item.ans || []).filter(Boolean) : [];
    const answer = `<p class="tw-answers"><span>Ответ ученика <b>${escape(c.chosen)}</b></span>${key.length ? `<span>Верный ответ <b>${escape(key.join(" / "))}</b></span>` : ""}</p>`;
    const opts = item?.opts?.map((value, i) => {
      const letter = "ABCD"[i], chosen = letter === c.chosen, right = key.includes(letter);
      return `<li class="${right ? "ok" : chosen ? "trap" : ""}"><b>${letter}</b><span class="qhtml">${value}</span>${right ? "<em>верный</em>" : chosen ? "<em>ответ ученика</em>" : ""}</li>`;
    }).join("");
    return `${answer}${c.sourceNote ? `<p class="hint">${escape(c.sourceNote)}</p>` : ""}${item?.stim || item?.stem || opts ? `<div class="tw-body" lang="en">
      ${item.stim ? `<div class="qhtml">${item.stim}</div>` : ""}${item.stem ? `<div class="qhtml">${item.stem}</div>` : ""}${opts ? `<ol class="tw-opts">${opts}</ol>` : ""}</div>`
      : !c.sourceNote ? '<p class="hint">Текст задания не загрузился.</p>' : ""}`;
  }

  function mount(box, load) {
    return (label, list) => {
      list.sort((a, b) => b.ts - a.ts);
      box.innerHTML = `<div class="card tw tw-original-card"><div class="tw-scopehead"><div>
        <h3 tabindex="-1">Ошибки ученика</h3><p>${escape(label)} · ${list.length} ${misses[plural.select(list.length)]}</p></div>
        <button type="button" class="btn ghost" data-original-close>Закрыть</button></div>
        ${list.length ? `<ul class="tw-originals">${list.map((c, i) => `<li><details data-tworiginal="${i}"${i === 0 ? " open" : ""}>
          <summary><span><b>${escape(c.title)}</b><small>${[c.ts ? date.format(c.ts) : "", `ответ ученика: ${c.chosen}`].filter(Boolean).map(escape).join(" · ")}</small></span></summary>
          <div class="tw-original-body"></div></details></li>`).join("")}</ul>` : '<p class="hint">В выбранных источниках нет неверных ответов по этой теме.</p>'}</div>`;
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
