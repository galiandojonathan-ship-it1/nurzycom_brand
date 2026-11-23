// Shared live practice uses the same signed-in question data and renderer as practice.js.
window.mountLivePractice = function ({ sets, blocks, rich, sha, selected }) {
  const start = document.getElementById("p-start");
  const query = new URLSearchParams(location.search);
  const round = query.get("live");
  const isLesson = /^lesson(?:-[a-z0-9]+)?$/.test(SITE.me());
  const panel = document.createElement("section");
  panel.className = "live-practice";
  panel.hidden = true;
  panel.innerHTML = '<h2>Живая практика</h2><p role="status"></p><p class="live-feedback" role="alert"></p><div data-live-content></div>';
  start.after(panel);
  const message = panel.querySelector("[role=status]");
  const feedback = panel.querySelector("[role=alert]");
  const content = panel.querySelector("[data-live-content]");
  let credentials = null, state, shown = "", pending = false, pollTimer, refreshVersion = 0;
  let sealedSet = null, displayedSet = null, receivedAt = 0;
  let hideCorrect = false, studentNumber = 1, hostPreview = null, tools, studentNav;
  const drafts = new Map();
  const submissions = new Map();

  async function api(action, body, id = round) {
    const params = new URLSearchParams({ action });
    if (id) params.set("round", id);
    if (action === "state" && state?.set) params.set("snapshot", "0");
    if (credentials?.participant) params.set("student", credentials.participant);
    const token = credentials?.host || credentials?.student;
    const result = await SITE.api("live?" + params, {
      method: body === undefined ? "GET" : "POST",
      headers: token ? { "x-live-token": token } : {},
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!result.ok) throw Error(result.data?.error || "Не удалось связаться с сервером.");
    return result.data;
  }

  function button(label, action) {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "btn";
    node.textContent = label;
    if (!action) return node;
    node.onclick = async () => {
      if (pending) return;
      pending = true;
      node.disabled = true;
      feedback.textContent = "";
      try { await action(); } catch (error) { feedback.textContent = error.message; }
      finally { pending = false; node.disabled = false; }
    };
    return node;
  }

  if (!round) {
    if (!isLesson) return;
    LiveRound.mount("go", async () => {
      const set = selected();
      if (!set) throw Error("Выберите набор вопросов.");
      const questions = await Promise.all(set.q.map(async (question) => {
        let answer;
        for (const choice of "ABCD") {
          if (await sha(`${set.salt}:${question.i}:${choice}`) === question.h) answer = choice;
        }
        if (!answer) throw Error("Не удалось проверить ключ вопроса.");
        const passage = blocks(question.b);
        return { prompt: passage + "<p>" + rich(question.s) + "</p>", passageLength: passage.length,
          options: question.o.map((option) => rich(option)), type: "mc", accepted: [answer] };
      }));
      return { title: set.title, ref: set.id, questions };
    });
    return;
  }

  document.body.classList.add("live-round-page");
  start.classList.add("hidden");
  panel.hidden = false;
  if (!SITE.me()) {
    message.textContent = "Войдите под своим логином, чтобы участвовать.";
    return;
  }
  const storageKey = "live:" + round;
  try { credentials = JSON.parse(sessionStorage.getItem(storageKey)); } catch { /* no previous session */ }
  const positionKey = storageKey + ":question";
  try { studentNumber = Number(sessionStorage.getItem(positionKey)) || 1; } catch { /* optional */ }

  function setMessage(value) {
    if (message.textContent !== value) message.textContent = value;
  }

  function heading(text) {
    const node = document.createElement("h3");
    node.textContent = text;
    return node;
  }

  function questionView(question, controls) {
    const section = document.createElement("section");
    section.className = "live-bluebook qwrap";
    const passage = document.createElement("div");
    passage.className = "passage qhtml";
    const ask = document.createElement("div");
    ask.className = "ask";
    const stem = document.createElement("div");
    stem.className = "stem qhtml";
    let choices, type;
    if (question.prompt !== undefined) {
      const boundary = question.passageLength;
      if (Number.isInteger(boundary) && boundary >= 0 && boundary <= question.prompt.length) {
        passage.innerHTML = question.prompt.slice(0, boundary);
        stem.innerHTML = question.prompt.slice(boundary);
      } else {
        // Earlier encrypted snapshots combined the passage and stem. Keep all their content.
        passage.innerHTML = question.prompt;
      }
      choices = question.options;
      type = question.type;
    } else {
      passage.innerHTML = blocks(question.b);
      stem.innerHTML = "<p>" + rich(question.s) + "</p>";
      choices = question.o.map((choice) => rich(choice));
      type = "mc";
    }
    const hasPassage = !!passage.innerHTML.trim();
    passage.hidden = !hasPassage;
    section.classList.toggle("no-passage", !hasPassage);
    ask.append(stem);
    if (type !== "mc" && controls) {
      const label = document.createElement("label");
      label.textContent = "Ваш ответ";
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 64;
      input.autocomplete = "off";
      input.value = controls.draft ?? controls.answer ?? "";
      input.oninput = () => controls.update(input.value);
      label.append(input);
      const submit = button("Отправить ответ");
      submit.dataset.liveSubmit = "";
      submit.onclick = () => {
        if (!input.value.trim()) input.focus();
        controls.submit(input.value.trim());
      };
      input.onkeydown = (event) => { if (event.key === "Enter") submit.click(); };
      ask.append(label, submit);
    } else {
      choices.forEach((choice, index) => {
        const letter = "ABCD"[index];
        const row = document.createElement("div");
        row.className = "opt";
        const option = controls ? button(letter) : document.createElement("div");
        option.className = controls ? "ch btn" : "ch";
        if (controls) {
          option.dataset.liveSubmit = "";
          option.onclick = () => controls.submit(letter);
          if (controls.editable) option.dataset.liveChoice = letter;
        }
        const badge = document.createElement("span");
        badge.className = "lt";
        badge.textContent = letter;
        const text = document.createElement("span");
        text.className = "tx qhtml";
        text.innerHTML = choice;
        option.replaceChildren(badge, text);
        row.append(option);
        ask.append(row);
      });
    }
    section.append(passage, ask);
    return section;
  }

  function scoreboard() {
    const table = document.createElement("table");
    table.setAttribute("aria-label", "Ответы группы по вопросам");
    const header = table.createTHead().insertRow();
    ["Ученик", ...Array.from({ length: state.total || 10 }, (_, i) => String(i + 1)), ...(hideCorrect ? [] : ["Верно"])].forEach((label) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = label;
      header.append(cell);
    });
    const tbody = table.createTBody();
    const byStudent = new Map(state.students.map((student) => [student.id, new Map()]));
    for (const answer of state.answers) byStudent.get(answer.participant_id)?.set(answer.question_number, answer);
    for (const student of state.students) {
      const row = tbody.insertRow(), answers = byStudent.get(student.id);
      row.insertCell().textContent = student.display_name;
      for (let number = 1; number <= (state.total || 10); number++) {
        const answer = answers.get(number);
        const cell = row.insertCell();
        if (hideCorrect && answer?.correct) {
          cell.textContent = "—";
          cell.setAttribute("aria-label", "Ответ скрыт");
          continue;
        }
        cell.textContent = answer ? answer.answer + (answer.correct ? " ✓" : " ✗") : "—";
        if (answer) cell.classList.add(answer.correct ? "answer-correct" : "answer-incorrect");
      }
      if (!hideCorrect) row.insertCell().textContent = String([...answers.values()].filter((answer) => answer.correct).length);
    }
    return table;
  }

  // the lesson account keeps a record of every round for the teacher's analysis (2026-11-23, Nurassyl: «activity on lessons»):
  // synced key lv_r_<round> with the questions' course ids, skills and levels (lr_meta_ from liveround.js) and each student's answers
  function saveRound() {
    if (!credentials?.host || !state.students?.length || state.started == null) return;
    let meta = null; try { meta = JSON.parse(localStorage.getItem("lr_meta_" + round) || "null"); } catch { /* none */ }
    const by = new Map(state.students.map((student) => [student.id, { name: student.display_name, ans: {} }]));
    for (const answer of state.answers) { const st = by.get(answer.participant_id); if (st) st.ans[answer.question_number] = [String(answer.answer).slice(0, 64), answer.correct ? 1 : 0]; }
    const record = { v: 1, round, at: state.started, title: (meta && meta.title) || "Живая практика",
      items: (meta && meta.items) || Array.from({ length: state.total || 0 }, () => ({ sec: (meta && meta.sec) || "rw" })), students: [...by.values()] };
    record.items.forEach((it) => { if (!it.sec) it.sec = (meta && meta.sec) || "rw"; });
    try { localStorage.setItem("lv_r_" + round, JSON.stringify(record)); } catch { /* storage full */ }
  }
  function updateScoreboard(results) {
    const signature = JSON.stringify([hideCorrect, state.students, state.answers]);
    if (results.dataset.signature !== signature) {
      results.replaceChildren(scoreboard());
      results.dataset.signature = signature;
      saveRound();
    }
  }

  function reviewView(questions) {
    const review = document.createElement("div");
    review.dataset.review = "";
    const nav = document.createElement("div");
    nav.className = "live-review-nav";
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Перейти к вопросу");
    questions.forEach((_, i) => select.add(new Option("Вопрос " + (i + 1), i)));
    const card = document.createElement("article");
    card.className = "live-host-question";
    const title = heading("");
    title.setAttribute("aria-live", "polite");
    const body = document.createElement("div");
    card.append(title, body);
    function step(label, offset) {
      const control = document.createElement("button");
      control.type = "button";
      control.className = "btn ghost";
      control.textContent = label;
      control.onclick = () => show(select.selectedIndex + offset);
      return control;
    }
    const prev = step("← Назад", -1), next = step("Далее →", 1);
    function show(index) {
      if (!questions[index]) return;
      select.selectedIndex = index;
      title.textContent = `Вопрос ${index + 1} из ${questions.length}`;
      if (index === 0 && document.activeElement === prev ||
          index === questions.length - 1 && document.activeElement === next) select.focus();
      prev.disabled = index === 0;
      next.disabled = index === questions.length - 1;
      const key = document.createElement("details");
      key.className = "live-review-key";
      const summary = document.createElement("summary");
      summary.textContent = "Правильный ответ";
      const value = document.createElement("p");
      const grading = state.keys[index];
      value.textContent = typeof grading === "string" ? grading : grading.accepted.join("; ");
      key.append(summary, value);
      body.replaceChildren(questionView(questions[index]), key);
    }
    select.onchange = () => show(select.selectedIndex);
    nav.append(prev, select, next);
    review.append(heading("Разбор вопросов"), nav, card);
    show(0);
    return review;
  }

  function studentNavigation() {
    const nav = document.createElement("nav");
    nav.className = "live-review-nav";
    nav.setAttribute("aria-label", "Вопросы раунда");
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Перейти к вопросу");
    for (let i = 1; i <= state.total; i++) select.add(new Option("Вопрос " + i, i));
    function go(number) {
      if (number < 1 || number > state.total) return;
      studentNumber = number;
      try { sessionStorage.setItem(positionKey, String(number)); } catch { /* optional */ }
      feedback.textContent = "";
      render(displayedSet);
    }
    function step(label, offset) {
      const control = document.createElement("button");
      control.type = "button";
      control.className = "btn ghost";
      control.textContent = label;
      control.onclick = () => go(studentNumber + offset);
      return control;
    }
    const previous = step("← Назад", -1), next = step("Далее →", 1);
    select.onchange = () => go(Number(select.value));
    nav.append(previous, select, next);
    panel.insertBefore(nav, content);
    return { nav, select, previous, next };
  }

  async function saveAnswer(number, value) {
    const current = submissions.get(number);
    if (current?.saving) {
      // An editable round keeps the student's latest choice: send it as soon as the earlier save ends.
      if (state.editable && value) { current.next = value; render(displayedSet); }
      return;
    }
    if (!value) {
      submissions.set(number, { error: "Введите ответ." });
      render(displayedSet);
      return;
    }
    submissions.set(number, { saving: true, value });
    render(displayedSet);
    let failure = null;
    try {
      await api("answer", { number, answer: value });
    } catch (error) {
      failure = error;
    }
    const next = submissions.get(number)?.next;
    if (!failure) {
      if (drafts.get(number)?.trim() === value) drafts.delete(number);
      state.answers = state.answers.filter((item) => item.question_number !== number);
      state.answers.push({ question_number: number, answer: value });
    }
    submissions.delete(number);
    if (next && next !== value) return saveAnswer(number, next);
    if (failure) {
      submissions.set(number, { error: failure.message });
      render(displayedSet);
      return;
    }
    render(displayedSet);
    await refresh();
  }

  function renderStudent(questions, classNumber, ended, timing) {
    const independent = state.selfPaced && classNumber && !ended;
    if (independent && !studentNav) studentNav = studentNavigation();
    if (studentNav) studentNav.nav.hidden = !independent;
    if (!Number.isInteger(studentNumber) || studentNumber < 1 || studentNumber > state.total) studentNumber = 1;
    const number = independent ? studentNumber : classNumber;
    if (independent) {
      const { select, previous, next } = studentNav;
      select.value = String(number);
      if ((number === 1 && document.activeElement === previous) ||
          (number === state.total && document.activeElement === next)) select.focus();
      previous.disabled = number === 1;
      next.disabled = number === state.total;
    }
    if (state.calculator && !tools) {
      tools = document.createElement("div");
      panel.insertBefore(tools, studentNav?.nav || content);
      BBTools.mount(tools, { reference: true, label: "Desmos" });   // Math as in Bluebook: Desmos and the reference sheet
    }
    if (tools) {
      const visible = !!number && !ended;
      if (tools.hidden === visible) {
        tools.hidden = !visible;
        BBTools.show(visible);
      }
    }
    const answer = state.answers.find((item) => item.question_number === number)?.answer;
    const view = ended ? "done" : state.editable ? String(number) : number + ":" + (answer || "");
    let progress = `Отвечено ${state.answers.length} из ${state.total}`;
    if (independent && submissions.size) {
      const waiting = [...submissions].filter(([, entry]) => entry.saving).map(([question]) => question);
      const failed = [...submissions].filter(([, entry]) => entry.error).map(([question]) => question);
      if (waiting.length) progress += ` · Сохраняем №${waiting.join(", ")}`;
      if (failed.length) progress += ` · Не сохранён выбор №${failed.join(", ")}`;
    }
    setMessage(ended ? "Раунд завершён." : number
      ? `Вопрос ${number} из ${state.total} · ${independent ? progress : timing}`
      : "Ждём начала раунда.");
    if (view !== shown) {
      shown = view;
      content.replaceChildren();
      if (ended || !number) return;
      if (answer && !state.editable) {
        content.append(heading("Ответ принят: " + answer));
        return;
      }
      content.append(questionView(questions[number - 1], {
        answer, editable: state.editable, draft: drafts.get(number),
        update: (value) => drafts.set(number, value),
        submit: (value) => saveAnswer(number, value)
      }));
      const receipt = document.createElement("p");
      receipt.className = "live-receipt";
      receipt.setAttribute("aria-live", "polite");
      content.append(receipt);
    }
    const receipt = content.querySelector(".live-receipt");
    if (!receipt) return;
    const submission = submissions.get(number);
    const chosen = submission?.saving && state.editable ? submission.next || submission.value : answer;
    const text = submission?.saving ? "Сохраняем ответ" + (state.editable ? ": " + chosen + "…" : "…") : submission?.error || (answer ? "Ответ принят: " + answer : "");
    if (receipt.textContent !== text) receipt.textContent = text;
    receipt.classList.toggle("live-feedback", !!submission?.error);
    for (const control of content.querySelectorAll("[data-live-submit]")) {
      control.setAttribute("aria-disabled", String(!!submission?.saving && !state.editable));
      if (control.dataset.liveChoice) control.setAttribute("aria-pressed", String(control.dataset.liveChoice === chosen));
    }
  }

  function render(set) {
    const now = state.now + Date.now() - receivedAt;
    const strict = state.strict !== false, duration = (state.seconds || 45) * 1000;
    const elapsed = state.started === null ? null : now - state.started;
    const number = elapsed === null || elapsed < 0 ? 0 : strict
      ? Math.min(state.total || 10, Math.floor(elapsed / duration) + 1)
      : state.current;
    const remaining = strict ? number * duration - elapsed : duration - (now - state.questionStartedAt);
    const seconds = Math.ceil(remaining / 1000);
    const ended = state.finished || strict && elapsed !== null && elapsed >= (state.total || 10) * duration;
    const timing = seconds > 0 ? seconds + " с" : "сверх времени: " + Math.abs(seconds) + " с";
    if (credentials.host) {
      let results = content.querySelector("[data-results]");
      if (!results) {
        const link = document.createElement("a");
        link.href = new URL("practice.html?live=" + round, location.href);
        link.textContent = "Ссылка для учеников";
        const copy = button("Копировать ссылку", async () => navigator.clipboard.writeText(link.href));
        copy.classList.add("ghost");
        const launch = button("Начать раунд", async () => { await api("start", {}); await refresh(); });
        launch.dataset.launch = "";
        const previous = button("Предыдущий вопрос", async () => {
          if (state.strict) {
            hostPreview = Number(content.querySelector("[data-current-question]").dataset.number) - 1;
            render(set);
          } else {
            await api("previous", { number: state.current });
            await refresh();
          }
        });
        previous.classList.add("ghost");
        previous.dataset.back = "";
        const next = button("Следующий вопрос", async () => {
          if (state.strict) {
            if (hostPreview !== null) hostPreview++;
            render(set);
          } else {
            await api("next", { number: state.current });
            await refresh();
          }
        });
        next.dataset.advance = "";
        const close = button("Завершить раунд", async () => { await api("close", {}); await refresh(); });
        close.dataset.close = "";
        close.classList.add("ghost");
        results = document.createElement("div");
        results.dataset.results = "";
        results.tabIndex = 0;
        results.setAttribute("role", "region");
        results.setAttribute("aria-label", "Таблица ответов группы");
        const answers = document.createElement("details");
        answers.className = "live-group-answers";
        answers.open = true;
        const summary = document.createElement("summary");
        summary.textContent = "Ответы группы";
        const filter = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = hideCorrect;
        checkbox.onchange = () => { hideCorrect = checkbox.checked; updateScoreboard(results); };
        filter.append(checkbox, " Скрыть верные ответы учеников");
        answers.append(summary, filter, results);
        const currentQuestion = document.createElement("article");
        currentQuestion.className = "live-host-question qhtml";
        currentQuestion.dataset.currentQuestion = "";
        currentQuestion.hidden = true;
        content.append(heading(state.title), link, copy, launch, previous, next, close, currentQuestion, answers);
      }
      content.querySelector("[data-launch]").hidden = state.started !== null || state.finished;
      content.querySelector("[data-close]").hidden = state.finished;
      if (hostPreview !== null && hostPreview >= number) hostPreview = null;
      const displayed = hostPreview ?? number;
      const back = content.querySelector("[data-back]");
      back.hidden = !number || ended || displayed <= 1 || (strict && !state.editable);
      const advance = content.querySelector("[data-advance]");
      advance.hidden = !number || ended || (strict && hostPreview === null) || (state.selfPaced && number === state.total);
      advance.textContent = !strict && !state.selfPaced && number === state.total ? "Завершить после этого вопроса" : "Следующий вопрос";
      const currentQuestion = content.querySelector("[data-current-question]");
      const showQuestion = !!number && !ended;
      currentQuestion.hidden = !showQuestion;
      if (showQuestion && currentQuestion.dataset.number !== String(displayed)) {
        currentQuestion.replaceChildren(heading("Вопрос " + displayed), questionView(set.q[displayed - 1]));
        currentQuestion.dataset.number = String(displayed);
      }
      updateScoreboard(results);
      const mode = state.selfPaced ? "каждый в своём темпе"
        : `${timing} · ${strict ? "строго" : "без строгого лимита"}${hostPreview === null ? "" : ` · просмотр вопроса ${hostPreview}`}`;
      const waiting = state.selfPaced ? "каждый в своём темпе" : `${state.seconds} с на вопрос · ${strict ? "строго" : "без строгого лимита"}`;
      setMessage(ended ? "Раунд завершён." : number ? `Вопрос ${number} из ${state.total} · ${mode}` : `В комнате: ${state.students.length} · ${waiting}`);
      if (state.finished && !content.querySelector("[data-review]")) {
        results.parentElement.before(reviewView(set.q.slice(0, state.total || 10)));
      }
      return;
    }

    renderStudent(set.q, number, ended, timing);
  }

  async function refresh() {
    clearTimeout(pollTimer);
    const version = ++refreshVersion;
    try {
      const next = await api("state");
      if (version !== refreshVersion) return;
      next.set = next.set || state?.set;
      state = next;
      receivedAt = Date.now();
      let set;
      if (state.set.startsWith("sealed:")) {
        if (!sealedSet) sealedSet = { q: await SITE.unsealBlob(state.set.slice(7)) };
        set = sealedSet;
      } else set = sets.find((item) => item.id === state.set);
      if (!set || set.q.length < (state.total || 10)) throw Error("Набор вопросов недоступен.");
      displayedSet = set;
      render(set);
    } catch (error) {
      if (version !== refreshVersion) return;
      message.textContent = error.message;
    }
    if (!state?.finished) pollTimer = setTimeout(refresh, 1500);
  }

  const clockTimer = setInterval(() => {
    if (state && displayedSet) render(displayedSet);
  }, 200);
  window.addEventListener("pagehide", () => { clearInterval(clockTimer); clearTimeout(pollTimer); });
  window.addEventListener("pageshow", (event) => { if (event.persisted) location.reload(); });

  if (credentials) {
    refresh();
  } else {
    content.append(button("Войти в раунд", async () => {
      credentials = await api("join", { name: localStorage.getItem("hw_student") || SITE.me() });
      sessionStorage.setItem(storageKey, JSON.stringify(credentials));
      content.replaceChildren();
      await refresh();
    }));
  }
};
