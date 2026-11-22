/* «Похожие вопросы · Gemini» in the cabinet (2026-11-22, Nurassyl: «позволь Gemini создавать похожие на ошибки ученика вопросы,
   чтобы я одним кликом мог сгенерировать и бить по слабым точкам студентов после разбора ошибок»).
   One click sends one student's first-attempt mistakes (no name; text only for nurzycom's own questions) to POST admin/twins,
   shows the new questions that passed the blind key check, and one more click saves them as a «Мой тест» and assigns it. */
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

  // m: { id, title, sec, sk, d, chosen, item } — item is the decrypted bundle question
  function payloadOf(m) {
    const it = m.item || {}, mc = it.t !== "spr" && Array.isArray(it.opts) && it.opts.length === 4;
    const key = mc ? it.ans : [].concat(it.acc || it.ans || "")[0];
    const out = { sec: m.sec, skill: m.sk || it.sk || "", level: m.d || it.d || "M", chosen: /^[A-D]$/.test(m.chosen || "") ? m.chosen : "", key: String(key || "") };
    if (it.own === true) {
      out.own = true;
      out.text = { passage: text(it.stim).slice(0, 2400), prompt: text(it.stem).slice(0, 700), ...(mc ? { options: it.opts.map((o) => text(o).slice(0, 420)) } : {}) };
    }
    return out;
  }

  function card(q, i, src) {
    return `<details class="tw-q" open><summary><label class="tw-pick"><input type="checkbox" data-twpick="${i}" checked> Задание ${i + 1}</label>
        <small>${esc(q.skill)} · ${esc(LEVEL[q.level] || q.level)} · на ошибку: ${esc(src ? src.title : "—")}</small></summary>
      <p class="tw-mech">Отрабатывает: ${esc(q.mechanism)}</p>
      <div class="tw-body" lang="en">${q.passage ? `<div class="qhtml">${rich(q.passage)}</div>` : ""}<div class="qhtml"><b>${rich(q.prompt)}</b></div>
        <ol class="tw-opts">${q.options.map((o, k) => { const L = "ABCD"[k]; return `<li class="${L === q.answer ? "ok" : L === q.trap ? "trap" : ""}"><b>${L}</b><span class="qhtml">${window.CTL ? CTL.inline(o) : esc(o)}</span>${L === q.answer ? "<em>верный</em>" : L === q.trap ? "<em>ловушка</em>" : ""}</li>`; }).join("")}</ol></div>
      <p class="tw-why"><b>Почему ${q.answer}.</b> ${esc(q.rationale)}</p><p class="tw-why"><b>Ловушка ${q.trap}.</b> ${esc(q.trapWhy)}</p></details>`;
  }

  // box: where to draw; o: { name, key, mistakes: () => Promise<m[]>, toast(msg) }
  function mount(box, o) {
    const S = { per: 2, busy: false, out: null, list: null };
    const draw = () => {
      const n = S.list ? S.list.length : null;
      box.innerHTML = `<div class="card tw" aria-busy="${S.busy}"><span class="label">Похожие вопросы · Gemini</span>
        <p class="hint">Gemini пишет новые задания на тот же навык, сложность и ловушку, что в ошибках ученика${o.scope ? ` (${esc(o.scope)})` : ""}. Ключ каждого задания проверяет второй, слепой вызов: непрошедшие отбрасываются. Перед отправкой просмотрите задания. Имя ученика в Gemini не уходит, текст отправляется только для авторских вопросов nurzycom.</p>
        <div class="row tw-ctl"><label>Заданий на ошибку <select id="tw-per">${[1, 2, 3].map((k) => `<option${k === S.per ? " selected" : ""}>${k}</option>`).join("")}</select></label>
          <button class="btn" type="button" id="tw-go"${S.busy ? " disabled" : ""}>${S.busy ? "Gemini пишет задания…" : S.out ? "Сгенерировать заново" : "Сгенерировать похожие"}</button></div>
        <p class="hint" role="status" id="tw-st">${esc(S.msg || (n === null ? "" : n ? `Ошибок для отработки: ${n}.` : "Ошибок с первой попытки нет: отрабатывать нечего."))}</p>
        <div id="tw-out">${S.out ? S.out.questions.map((q, i) => card(q, i, S.list[q.source - 1])).join("") : ""}</div>
        ${S.out ? `<div class="row"><button class="btn" type="button" id="tw-give">Задать ученику как «Мой тест»</button><button class="btn ghost" type="button" id="tw-save">Только сохранить в «Мои тесты»</button></div>` : ""}</div>`;
      box.querySelector("#tw-per").onchange = (e) => (S.per = +e.target.value);
      box.querySelector("#tw-go").onclick = run;
      const give = box.querySelector("#tw-give"), save = box.querySelector("#tw-save");
      if (give) give.onclick = () => store(true);
      if (save) save.onclick = () => store(false);
    };
    async function run() {
      if (S.busy) return;
      S.busy = true; S.msg = "Собираю ошибки…"; draw();
      try {
        S.list = (await o.mistakes()).slice(0, 6);
        if (!S.list.length) { S.msg = "Ошибок с первой попытки нет: отрабатывать нечего."; return; }
        S.msg = `Ошибок: ${S.list.length}. Gemini пишет и проверяет задания, это до минуты…`; draw();
        const r = await SITE.api("admin/twins", { method: "POST", body: JSON.stringify({ perMistake: S.per, mistakes: S.list.map(payloadOf) }) });
        if (!r.ok) { S.msg = (r.data && r.data.error) || (r.status === 403 ? "Нужен ключ администратора в этом браузере." : "Не получилось. Попробуйте ещё раз."); return; }
        S.out = r.data;
        S.msg = `Готово: ${r.data.questions.length} из ${r.data.asked}${r.data.dropped ? ` · ${r.data.dropped} не прошли проверку ключа и убраны` : ""}. Снимите галочку с заданий, которые не нужны.`;
      } catch (e) { S.msg = "Не удалось связаться с сервером. Попробуйте ещё раз."; }
      finally { S.busy = false; draw(); }
    }
    async function store(assign) {
      const picked = [...box.querySelectorAll("[data-twpick]")].filter((c) => c.checked).map((c) => S.out.questions[+c.dataset.twpick]);
      if (!picked.length) { S.msg = "Отметьте хотя бы одно задание."; draw(); return; }
      if (!window.CTED || !window.CTL) { S.msg = "«Мои тесты» не загрузились: обновите страницу."; draw(); return; }
      const t = CTL.newTest();
      t.title = `Работа над ошибками · ${o.name} · ${today()}`;
      t.note = "Задания на ваши недавние ошибки. Решайте без подсказок и проверяйте каждый вариант.";
      t.q = picked.map((q) => Object.assign(CTL.newQ("mc"), { passage: q.passage, stem: q.prompt, o: q.options.slice(), a: q.answer,
        x: `${q.rationale}\n\nЛовушка ${q.trap}: ${q.trapWhy}`, skill: q.skill, level: q.level || "M" }));
      const bad = t.q.filter((q) => CTL.problems(q).length).length;
      if (bad) { S.msg = `Не готовы заданий: ${bad}. Сгенерируйте заново.`; draw(); return; }
      const ok = await CTED.addTest(t, `Тест «${t.title}» сохранён`);
      S.msg = ok ? "Тест сохранён в «Мои тесты»." : "Тест сохранён только в этом браузере: повторите, когда будет связь.";
      draw();
      if (assign && ok) CTED.giveTo(t.id, o.key);
    }
    draw();
  }
  return { mount, payloadOf, text };
})();
