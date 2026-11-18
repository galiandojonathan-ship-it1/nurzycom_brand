// Shared live practice uses the same signed-in question data and renderer as practice.js.
window.mountLivePractice = function ({ sets, blocks, rich, sha, selected }) {
  const start = document.getElementById("p-start");
  const query = new URLSearchParams(location.search);
  const round = query.get("live");
  const isLesson = /^lesson(?:-[a-z0-9]+)?$/.test(SITE.me());
  const panel = document.createElement("section");
  panel.className = "live-practice";
  panel.hidden = true;
  panel.innerHTML = '<h2>Живая практика</h2><p role="status"></p><div data-live-content></div>';
  start.after(panel);
  const message = panel.querySelector("[role=status]");
  const content = panel.querySelector("[data-live-content]");
  let credentials = null, state, shown = "", pending = false, pollTimer, refreshVersion = 0;

  async function api(action, body, id = round) {
    const params = new URLSearchParams({ action });
    if (id) params.set("round", id);
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
    node.onclick = async () => {
      if (pending) return;
      pending = true;
      node.disabled = true;
      message.textContent = "";
      try { await action(); } catch (error) { message.textContent = error.message; }
      finally { pending = false; node.disabled = false; }
    };
    return node;
  }

  if (!round) {
    if (!isLesson) return;
    const create = button("Живая практика · 10 × 45 с", async () => {
      const set = selected();
      if (!set || set.q.length < 10) throw Error("Выберите набор, в котором есть хотя бы 10 вопросов.");
      const keys = await Promise.all(set.q.slice(0, 10).map(async (question) => {
        for (const choice of "ABCD") {
          if (await sha(`${set.salt}:${question.i}:${choice}`) === question.h) return choice;
        }
        throw Error("Не удалось проверить ключ вопроса.");
      }));
      const created = await api("create", { set: set.id, title: set.title, keys });
      sessionStorage.setItem("live:" + created.round, JSON.stringify({ host: created.host }));
      location.href = "practice.html?live=" + created.round;
    });
    document.getElementById("go").parentElement.append(create);
    create.after(message);
    return;
  }

  start.classList.add("hidden");
  panel.hidden = false;
  if (!SITE.me()) {
    message.textContent = "Войдите под своим логином, чтобы участвовать.";
    return;
  }
  const storageKey = "live:" + round;
  try { credentials = JSON.parse(sessionStorage.getItem(storageKey)); } catch { /* no previous session */ }

  function heading(text) {
    const node = document.createElement("h3");
    node.textContent = text;
    return node;
  }

  function questionView(question, options) {
    const section = document.createElement("section");
    section.innerHTML = blocks(question.b) + "<p>" + rich(question.s) + "</p>";
    question.o.forEach((choice, index) => {
      const letter = "ABCD"[index];
      const option = options ? button(letter, () => options(letter)) : document.createElement("p");
      option.innerHTML = letter + ". " + rich(choice);
      section.append(option);
    });
    return section;
  }

  function scoreboard() {
    const table = document.createElement("table");
    const header = table.createTHead().insertRow();
    ["Ученик", ...Array.from({ length: 10 }, (_, i) => String(i + 1)), "Верно"].forEach((label) => {
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
      for (let number = 1; number <= 10; number++) {
        const answer = answers.get(number);
        row.insertCell().textContent = answer ? answer.answer + (answer.correct ? " ✓" : " ✗") : "—";
      }
      row.insertCell().textContent = String([...answers.values()].filter((answer) => answer.correct).length);
    }
    return table;
  }

  function render(set) {
    const elapsed = state.started === null ? null : state.now - state.started;
    const number = elapsed === null || elapsed < 0 ? 0 : Math.min(10, Math.floor(elapsed / 45000) + 1);
    const seconds = Math.ceil(elapsed < 0 ? -elapsed / 1000 : (number * 45000 - elapsed) / 1000);
    if (credentials.host) {
      let results = content.querySelector("[data-results]");
      if (!results) {
        const link = document.createElement("a");
        link.href = new URL("practice.html?live=" + round, location.href);
        link.textContent = "Ссылка для учеников";
        const copy = button("Копировать ссылку", async () => navigator.clipboard.writeText(link.href));
        const launch = button("Начать раунд", async () => { await api("start", {}); await refresh(); });
        launch.dataset.launch = "";
        const close = button("Завершить раунд", async () => { await api("close", {}); await refresh(); });
        close.dataset.close = "";
        results = document.createElement("div");
        results.dataset.results = "";
        results.style.overflowX = "auto";
        content.append(heading(state.title), link, copy, launch, close, results);
      }
      content.querySelector("[data-launch]").hidden = state.started !== null || state.finished;
      content.querySelector("[data-close]").hidden = state.finished;
      results.replaceChildren(scoreboard());
      message.textContent = state.finished ? "Раунд завершён." : number ? `Вопрос ${number} · ${seconds} с` : `В комнате: ${state.students.length}`;
      if (state.finished && !content.querySelector("[data-review]")) {
        const review = document.createElement("div");
        review.dataset.review = "";
        review.append(heading("Разбор вопросов"));
        set.q.slice(0, 10).forEach((question, index) => {
          const detail = document.createElement("details"), summary = document.createElement("summary");
          summary.textContent = "Вопрос " + (index + 1);
          const key = document.createElement("p");
          key.textContent = "Правильный ответ: " + state.keys[index];
          detail.append(summary, questionView(question), key);
          review.append(detail);
        });
        content.append(review);
      }
      return;
    }

    const answer = state.answers.find((item) => item.question_number === number);
    const view = state.finished ? "done" : number + ":" + (answer?.answer || "");
    message.textContent = state.finished ? "Раунд завершён." : number ? `Вопрос ${number} из 10 · ${seconds} с` : "Ждём начала раунда.";
    if (view === shown) return;
    shown = view;
    content.replaceChildren();
    if (state.finished || !number) return;
    if (answer) content.append(heading("Ответ принят: " + answer.answer));
    else content.append(questionView(set.q[number - 1], async (letter) => {
      await api("answer", { number, answer: letter });
      await refresh();
    }));
  }

  async function refresh() {
    clearTimeout(pollTimer);
    const version = ++refreshVersion;
    try {
      const next = await api("state");
      if (version !== refreshVersion) return;
      state = next;
      const set = sets.find((item) => item.id === state.set);
      if (!set || set.q.length < 10) throw Error("Набор вопросов недоступен.");
      render(set);
    } catch (error) {
      if (version !== refreshVersion) return;
      message.textContent = error.message;
    }
    if (!state?.finished) pollTimer = setTimeout(refresh, 1500);
  }

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
