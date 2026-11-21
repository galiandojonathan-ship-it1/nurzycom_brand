/* Private lesson plan in the cabinet. The lesson console receives only the question queue. */
window.VerbalLesson = (() => {
  const phaseNames = ["Мини-диагностика", "Разбор исходных заданий", "Моделирование стратегии", "Практика с подсказкой", "Самостоятельный перенос"];
  const phaseTimes = { 30: [4, 7, 6, 8, 5], 45: [6, 10, 8, 14, 7], 60: [7, 13, 12, 19, 9], 70: [8, 15, 14, 22, 11] };
  const targets = {
    vocabulary: "Слово в контексте", sentence_function: "Функция предложения", two_choices: "Выбор между двумя вариантами",
    locate_evidence: "Поиск доказательства", scope: "Границы утверждения", inference: "Обоснованность вывода",
    connect_ideas: "Связь между идеями", viewpoint: "Позиция автора", task_goal: "Цель вопроса",
    grammar: "Границы и грамматические связи", confidence: "Проверка ответа перед выбором"
  };
  const skillNames = [
    "Words in Context", "Text Structure and Purpose", "Cross-Text Connections", "Central Ideas and Details",
    "Command of Evidence", "Inferences", "Boundaries", "Form, Structure, and Sense", "Transitions", "Rhetorical Synthesis"
  ];
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const plainText = (markup) => new DOMParser().parseFromString(String(markup || ""), "text/html").body.textContent.replace(/\s+/g, " ").trim();

  async function source(q, readQuestion, shareText) {
    const skill = skillNames.find((s) => s === q.sk || ((!q.sk || !skillNames.includes(q.sk)) && q.plabel.includes(s)));
    const picks = {};
    for (const letter of ["A", "B", "C", "D", "—"]) {
      if (q.picks[letter] >= 2) picks[letter === "—" ? "blank" : letter] = q.picks[letter];
    }
    let authorQuestion;
    if (shareText || !skill) {
      const it = await readQuestion(q).catch(() => null);
      if (shareText && it?.own === true && Array.isArray(it.opts) && it.opts.length === 4 && /^[A-D]$/.test(it.ans)) {
        authorQuestion = { passage: plainText(it.stim).slice(0, 2400), prompt: plainText(it.stem).slice(0, 550),
          options: it.opts.map((v) => plainText(v).slice(0, 420)), answer: it.ans };
      }
      const catalogSkill = skillNames.find((s) => s === it?.sk);
      if (catalogSkill && !skill) return { code: q.id, n: q.n, wrong: q.wrong, picks, skill: catalogSkill, level: q.d, authorQuestion };
    }
    return { code: q.id, n: q.n, wrong: q.wrong, picks, skill, level: q.d, authorQuestion };
  }

  function sequence(plan, originals) {
    const originalMap = new Map(originals.map((q) => [q.id, q]));
    const related = [...new Set(plan.focuses.map((f) => f.sources[0]))].map((id) => originalMap.get(id));
    const questionsFor = (role) => plan.questions.filter((q) => q.role === role).sort((a, b) => a.focus - b.focus);
    return [questionsFor("diagnose"), related, [], questionsFor("drill"), questionsFor("transfer")];
  }

  function practice(q, i, n) {
    return `<details class="vl-question"><summary>Новое задание ${n} · ${escape(phaseNames[i])}</summary>
      <div lang="en"><p>${escape(q.passage)}</p><p><b>${escape(q.prompt)}</b></p>
      <ol type="A">${q.options.map((o) => `<li>${escape(o)}</li>`).join("")}</ol></div>
      <p><b>Ключ ${q.answer}.</b> ${escape(q.rationale)}</p><p>Доказательство: <q lang="en">${escape(q.clue)}</q></p>
      <p><b>Ловушка ${q.trap}.</b> ${escape(q.trapWhy)}</p></details>`;
  }

  function renderPlan(output, plan, minutes, originals, payload, previewOriginal) {
    const questions = sequence(plan, originals);
    const stats = new Map(payload.map((s) => [s.code, s]));
    const originalMap = new Map(originals.map((q) => [q.id, q]));
    let number = 0;
    output.innerHTML = `<h4 tabindex="-1">${escape(plan.title)} · ${minutes} мин</h4>
      <div class="vl-focus">${plan.focuses.map((f) => `<section><h5>${escape(targets[f.target])}</h5>
        <ul>${f.sources.map((code) => { const s = stats.get(code); return `<li>${escape(originalMap.get(code).title)} · ${s.wrong} из ${s.n} с ошибкой${s.authorQuestion ? "" : " · гипотеза по сводке"}.</li>`; }).join("")}</ul>
        <p><b>Гипотеза.</b> ${escape(f.hypothesis)}</p><p><b>Что ещё возможно.</b> ${escape(f.alternative)}</p><p><b>Как различить.</b> ${escape(f.test)}</p>
      </section>`).join("")}</div>
      <ol class="vl-steps">${plan.steps.map((s, i) => `<li><h5>${phaseNames[i]} · ${phaseTimes[minutes][i]} мин</h5>
        <p>${escape(s.teacher)}</p><p><b>Критерий.</b> ${escape(s.check)}</p><p><b>Если застряли.</b> ${escape(s.repair)}</p>
        ${questions[i].map((q) => q.id ? `<details class="vl-question" data-vl-original="${escape(q.id)}"><summary>Исходное задание · ${escape(q.title)}</summary><div class="rbody"></div></details>` : practice(q, i, ++number)).join("")}</li>`).join("")}</ol>
      <label class="vl-option"><input type="checkbox" data-vl-reviewed> Я проверил ключи и объяснения новых заданий</label>
      <button class="btn ghost" type="button" data-vl-send disabled>Отправить задания в «Пульт урока»</button>
      <p class="hint" data-vl-send-status role="status"></p>`;
    output.querySelectorAll("[data-vl-original]").forEach((d) => d.addEventListener("toggle", () => {
      if (d.open) previewOriginal(d, originalMap.get(d.dataset.vlOriginal));
    }));
    output.querySelector("h4").focus();
  }

  function queue(plan, originals) {
    let number = 0;
    const prefix = crypto.randomUUID();
    return sequence(plan, originals).flatMap((qs, phase) => qs.map((q) => {
      if (q.id) return { ...q, title: `${phaseNames[phase]} · ${q.title}` };
      return { id: prefix + "-" + (++number), sec: "rw", title: `${phaseNames[phase]} · Новое задание ${number}`, sk: targets[plan.focuses[q.focus - 1].target],
        authored: { passage: q.passage, prompt: q.prompt, options: q.options, answer: q.answer,
          explanation: `${q.rationale}\nДоказательство: ${q.clue}\nЛовушка ${q.trap}. ${q.trapWhy}` } };
    }));
  }

  function mount(box, { select, readQuestion, previewOriginal, send }) {
    const root = box.querySelector("[data-vl]"); if (!root) return;
    root.innerHTML = `<h4>Урок SAT Verbal по ошибкам группы</h4>
      <p class="hint">Выберите задания ниже или воспользуйтесь автоподбором. Gemini составит сценарий урока, подберёт исходные вопросы и создаст новые для диагностики, тренировки и проверки навыка.</p>
      <div class="vl-controls"><label>Длительность <select data-vl-minutes>${[30, 45, 60, 70].map((m) => `<option value="${m}"${m === 60 ? " selected" : ""}>${m} мин</option>`).join("")}</select></label>
      <button class="btn" type="button" data-vl-start>Собрать урок с Gemini</button></div>
      <label class="vl-option"><input type="checkbox" data-vl-share> Добавить тексты авторских заданий курса для более точной гипотезы</label>
      <p class="hint">Gemini получает коды, навыки и сводку ошибок. Если включить опцию, к сводке добавятся только авторские формулировки курса. Имена, индивидуальные ответы и тексты College Board не передаются.</p>
      <p class="hint" data-vl-status role="status"></p><div data-vl-output></div>`;
    const button = root.querySelector("[data-vl-start]"), duration = root.querySelector("[data-vl-minutes]"),
      share = root.querySelector("[data-vl-share]"), status = root.querySelector("[data-vl-status]"), output = root.querySelector("[data-vl-output]");
    button.onclick = async () => {
      const originals = select(), minutes = +duration.value;
      if (!originals.length) { status.textContent = "Нужны вопросы Reading and Writing, на которых ошибались ученики. Проверьте задания и фильтры."; return; }
      output.replaceChildren();
      button.disabled = duration.disabled = share.disabled = true;
      status.textContent = "Gemini составляет урок и отдельно проверяет новые задания…";
      try {
        const sources = await Promise.all(originals.map((q) => source(q, readQuestion, share.checked)));
        const response = await SITE.api("admin/verbal-lesson", { method: "POST", body: JSON.stringify({ minutes, sources }) });
        if (!response.ok || !response.data?.plan) {
          status.textContent = response.data?.error || "Не удалось получить урок. Попробуйте ещё раз.";
          return;
        }
        const plan = response.data.plan;
        status.textContent = "Черновик урока готов. Проверьте ключи перед отправкой.";
        renderPlan(output, plan, minutes, originals, sources, previewOriginal);
        const reviewed = output.querySelector("[data-vl-reviewed]"), publish = output.querySelector("[data-vl-send]"), sendStatus = output.querySelector("[data-vl-send-status]");
        reviewed.onchange = () => { publish.disabled = !reviewed.checked; };
        publish.onclick = async () => {
          publish.disabled = reviewed.disabled = true;
          sendStatus.textContent = "Отправляю задания…";
          try {
            await send(plan.title, queue(plan, originals));
            sendStatus.textContent = "Задания отправлены. В «Пульте урока» откройте карточку «Урок SAT Verbal».";
          } catch (e) { sendStatus.textContent = e.message || "Не удалось отправить. Попробуйте ещё раз."; }
          finally { reviewed.disabled = false; publish.disabled = !reviewed.checked; }
        };
      } catch {
        status.textContent = "Не удалось связаться с Gemini. Попробуйте ещё раз.";
      } finally { button.disabled = duration.disabled = share.disabled = false; }
    };
  }

  return { mount };
})();
