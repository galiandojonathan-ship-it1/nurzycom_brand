// The presentation only controls the active question. Names and answers stay in the teacher monitor.
window.LessonPracticeHost = (() => {
  const params = new URLSearchParams(location.search), hostId = params.get("practiceHost");
  const storageKey = "lp-room", viewKey = "lp-room-view", queueKey = "lp-room-queue";
  const stored = (key) => { try { return sessionStorage.getItem(key) || ""; } catch { return ""; } };
  const remember = (id) => { try { sessionStorage.setItem(storageKey, id); } catch { /* optional resume */ } };
  const el = (tag, value) => { const node = document.createElement(tag); if (value != null) node.textContent = value; return node; };
  const skill = (q, l) => q.sk || [
    "Words in Context", "Text Structure and Purpose", "Cross-Text Connections", "Central Ideas and Details", "Command of Evidence",
    "Inferences", "Boundaries", "Form, Structure, and Sense", "Transitions", "Rhetorical Synthesis"
  ].find((s) => l.title.includes(s)) || "";
  let room = hostId || stored(storageKey), closed = false, panels, status, roster, monitorLink, studentLink;
  let signature = "", findings = new Map(), refreshing, activeLesson = "", dispatchNumber = 0, dispatch = Promise.resolve(), sent = null;
  let restoring = !!room, resumeFailed = false, teachingView, home;
  const roomStorage = (key) => { try { return JSON.parse(stored(key)); } catch { return null; } };
  let savedView = roomStorage(viewKey), queue = roomStorage(queueKey), sendingStage = false;
  const saveQueue = () => { try { sessionStorage.setItem(queueKey, JSON.stringify(queue)); } catch { /* optional resume */ } };
  const deckPosition = (deck) => ({ id: deck.id, updated: deck.revision || deck.at || null, count: deck.n });
  function rememberView(position = teachingView) {
    if (hostId || !room || closed || !position) return;
    savedView = { ...position, room };
    try { sessionStorage.setItem(viewKey, JSON.stringify(savedView)); } catch { /* optional resume */ }
  }
  function view(deck, index) {
    teachingView = { ...deckPosition(deck), index };
    if (!restoring) rememberView();
  }
  let accounts, creating, cold = 0, activeNumber, advancing = false, preparingCold = false;
  let historyCurrent, historyRoom, attemptsByKey = new Map();
  const coldPart = (lesson) => lesson?.parts.find((p) => p.b && p.q?.length >= 4 && /холодн|cold[ -]+start/i.test(p.title));
  const deckUIs = new Map(), bundles = new Map(), coldDecks = new WeakMap();

  const link = (page, key) => new URL(page + "?" + key + "=" + encodeURIComponent(room), location.href).href;
  async function api(action, body, all = false, roomId = room) {
    const path = "lesson-practice?action=" + action + (roomId && action !== "create" ? "&room=" + encodeURIComponent(roomId) : "") + (all ? "&all=1" : "");
    const result = await SITE.api(path, body ? { method: "POST", body: JSON.stringify(body) } : {});
    if (!result.ok) throw Object.assign(new Error(result.data?.error || "Сервер практики временно недоступен."), { status: result.status });
    return result.data;
  }
  function notify(message) {
    if (status) status.textContent = message;
    for (const controls of deckUIs.values()) controls.status.textContent = message;
  }
  function setClassState(node, message) {
    node.hidden = !message;
    if (node.textContent !== message) node.textContent = message;
  }
  function links() {
    const visible = !!room && !closed && !restoring;
    const classState = restoring ? "Восстанавливаю практику…" : visible
      ? cold ? `У класса холодный старт · ${cold} из 4` : activeNumber ? `У класса вопрос ${activeNumber}` : "Класс ждёт следующий вопрос"
      : "";
    if (panels) panels.hidden = !room || restoring;
    if (home) {
      home.create.disabled = restoring;
      home.create.hidden = !!hostId || (!!room && !closed);
      home.retry.hidden = !restoring || !resumeFailed;
      setClassState(home.state, classState);
      const candidate = visible && !hostId && savedView?.room === room ? savedView : null;
      const available = candidate && home.canReturn(candidate);
      home.returnSlide.hidden = !available;
      if (available) home.returnSlide.textContent = `Вернуться к слайду ${candidate.index + 1}`;
      if (home.unavailable) setClassState(home.unavailable, candidate && !available ? "Презентация изменилась. Откройте её из списка уроков." : "");
    }
    if (room && studentLink) {
      studentLink.href = link("practice.html", "lessonRoom");
      studentLink.textContent = visible ? "Ссылка для учеников" : "Ссылка на завершённую практику";
      monitorLink.href = link("classroom.html", "practiceHost");
      panels.querySelector("[data-lp-finish]").hidden = closed;
      panels.querySelector("[data-lp-copy]").hidden = closed;
    }
    const updateAdvance = (button) => {
      button.hidden = !visible || !cold;
      button.disabled = advancing || !activeNumber || sendingStage || !!roomQueue()?.pending;
      button.textContent = cold === 4 ? "Закончить холодный старт · 4/4" : `Следующий вопрос · ${cold}/4`;
    };
    if (panels) updateAdvance(panels.querySelector("[data-lp-advance]"));
    for (const controls of deckUIs.values()) {
      updateAdvance(controls.advance);
      controls.monitor.hidden = !room;
      controls.monitor.href = room ? link("classroom.html", "practiceHost") : "#";
      controls.copy.hidden = !visible;
      setClassState(controls.state, classState);
      if (controls.queue) renderQueue(controls.queue);
    }
  }
  async function canonicalAccounts(refresh = false) {
    if (refresh) accounts = null;
    accounts ||= Promise.all([SITE.access(), SITE.api("admin/users")]).then(async ([access, result]) => {
      const rows = new Map(Object.entries(access.users || {}));
      for (const student of result.data?.users || []) rows.set(student.id, student);
      const names = await Promise.all([...rows].map(async ([id, entry]) => [id, (await SITE.nameOf(entry.n).catch(() => null))?.name]));
      return new Map(names);
    }).catch(() => new Map());
    return accounts;
  }
  const action = (label, callback) => {
    const button = el("button", label); button.type = "button"; button.className = "btn ghost"; button.onclick = callback; return button;
  };
  async function copyLink() {
    if (!room) return;
    const url = link("practice.html", "lessonRoom");
    try { await navigator.clipboard.writeText(url); notify("Ссылка для учеников скопирована."); }
    catch { notify(url); }
  }
  async function create(title) {
    if (restoring) {
      await refresh();
      if (restoring) throw Error("Дождитесь восстановления практики и попробуйте ещё раз.");
    }
    if (room && !closed) return room;
    creating ||= api("create", { title: title.slice(0, 160) }).then(({ room: id }) => {
      room = id; remember(room); closed = false; cold = 0; activeNumber = null; sent = null; findings = new Map(); signature = "";
      activeLesson = window.LESSON?.session()?.id || "";
      rememberView();
      links(); notify("Практика открыта. Скопируйте ссылку для учеников.");
      return id;
    }).finally(() => { creating = null; });
    return creating;
  }
  function newRoom(title) {
    const dialog = el("dialog"); dialog.className = "lp-dialog";
    const form = el("form"), heading = el("h2", "Подготовить ссылку для учеников"), label = el("label", "Название для учеников");
    const input = el("input"); input.required = true; input.maxLength = 160; input.value = title;
    const message = el("p"); message.setAttribute("role", "status");
    const submit = el("button", "Создать ссылку"); submit.type = "submit"; submit.className = "btn";
    form.append(heading, label, message, submit, action("Отмена", () => dialog.close())); label.append(input);
    dialog.append(form); document.body.append(dialog);
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    form.onsubmit = async (event) => {
      event.preventDefault(); submit.disabled = true;
      try { await create(input.value); dialog.close(); } catch (error) { message.textContent = error.message; submit.disabled = false; }
    };
    dialog.showModal();
  }
  async function profiles(member, name) {
    const dialog = el("dialog"); dialog.className = "lp-dialog";
    const form = el("form"), title = el("h2", name), label = el("label", "Затруднение или заметка для следующего урока");
    const note = el("textarea"); note.maxLength = 700; label.append(note);
    const values = [1, 2].map((hint) => {
      const row = el("label"), input = el("input"); input.type = "checkbox";
      row.append(input, document.createTextNode(hint === 1 ? "Подсказка со словарём" : "Исключение двух неверных вариантов"));
      return { row, input, hint };
    });
    const message = el("p", "Загружаю…"); message.setAttribute("role", "status");
    const submit = el("button", "Сохранить"); submit.className = "btn"; submit.type = "submit"; submit.disabled = true;
    form.append(title, label, ...values.map(({ row }) => row), message, submit, action("Закрыть", () => dialog.close()));
    dialog.append(form); document.body.append(dialog); dialog.showModal();
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    const account = member.account;
    try {
      const entry = await api("profile", { account });
      note.value = entry.note ? (await SITE.unsealBlob(entry.note)).text : "";
      for (const { hint, input } of values) input.checked = !!(entry.hints & hint);
      submit.disabled = false; message.textContent = "Заметка видна только преподавателю.";
    } catch (error) { message.textContent = error.message; }
    form.onsubmit = async (event) => {
      event.preventDefault(); submit.disabled = true;
      try {
        const hints = values.reduce((mask, { hint, input }) => mask | (input.checked ? hint : 0), 0);
        await api("profile", { account, hints, note: note.value.trim() ? await SITE.sealBlob({ text: note.value.trim() }) : "" });
        dialog.close(); notify("Заметка и подсказки сохранены.");
      } catch (error) { message.textContent = error.message; submit.disabled = false; }
    };
  }
  async function report(account, roomId = room) {
    if (roomId !== room || findings.get(account)?.busy) return;
    findings.set(account, { busy: true, text: "Gemini анализирует ответы…" }); signature = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await api("report", { account }, false, roomId);
        if (roomId !== room) return;
        findings.set(account, { text: result.report }); signature = ""; refresh(); return;
      } catch (error) {
        if (roomId !== room) return;
        if (attempt === 0 && error.status === 502) continue;
        findings.set(account, { text: error.message, failed: true }); signature = ""; refresh(); return;
      }
    }
  }
  async function finish() {
    if (!room || closed || restoring) return;
    try {
      await api("close", {});
      closed = true; cold = 0; links();
      notify("Практика завершена.");
      refresh(true);
    } catch (error) { notify(error.message); }
  }
  const answerStatus = (answer) => answer.correct == null ? "без ключа" : answer.correct ? "верно" : "ошибка";
  function answerDetails(name, question, answer, focusKey) {
    const dialog = el("dialog"); dialog.className = "lp-dialog";
    const title = el("h2", `${name} · вопрос ${question.number}`);
    dialog.append(title, el("p", `${question.ref.replace(/:cold:\d$/, "")} · ${question.skill}`));
    if (answer) {
      const hints = [answer.hints & 1 ? "словарь" : "", answer.hints & 2 ? "исключение вариантов" : ""].filter(Boolean);
      dialog.append(el("p", `Ответ ${answer.answer} · ${answerStatus(answer)}`),
        el("p", `Время ${(answer.ms / 1000).toFixed(1)} с`),
        el("p", hints.length ? "Подсказки: " + hints.join(", ") : "Без подсказок"));
    } else dialog.append(el("p", "Ответ пока не отправлен."));
    dialog.append(action("Закрыть", () => dialog.close()));
    document.body.append(dialog);
    dialog.addEventListener("close", () => {
      dialog.remove();
      [...roster.querySelectorAll("[data-lp-focus]")].find((button) => button.dataset.lpFocus === focusKey)?.focus({ preventScroll: true });
    }, { once: true });
    dialog.showModal();
  }
  function renderMonitor(state, names) {
    const previous = roster.querySelector(".lp-matrix-wrap"), scroll = previous?.scrollLeft || 0;
    const focused = previous?.contains(document.activeElement) ? document.activeElement.dataset.lpFocus : null;
    const heading = el("p", state.closed ? "Итоги практики" : "Ответы учеников");
    heading.className = "lp-matrix-status";
    roster.replaceChildren(heading);
    if (!state.members.length) { roster.append(el("p", "Пока никто не подключился.")); return; }
    const legend = el("p", "✓ Верно · × Ошибка · ○ Без ключа · — Нет ответа");
    legend.className = "hint";
    const wrap = el("div"); wrap.className = "lp-matrix-wrap"; wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", "Ответы по вопросам"); wrap.tabIndex = 0;
    const table = el("table"); table.className = "lp-matrix";
    const head = el("thead"), header = el("tr"), body = el("tbody");
    const label = el("th", "Ученик"); label.scope = "col"; header.append(label);
    for (const q of state.questions) {
      const col = el("th", String(q.number)); col.scope = "col"; col.title = q.ref.replace(/:cold:\d$/, "");
      col.classList.toggle("lp-current", q.number === state.current);
      if (q.number === state.current) col.setAttribute("aria-current", "true");
      header.append(col);
    }
    const tools = el("th", "Действия"); tools.scope = "col"; header.append(tools);
    head.append(header); table.append(head, body); wrap.append(table); roster.append(legend, wrap);
    for (const [index, member] of state.members.entries()) {
      const row = el("tr"), name = names.get(member.account) || `Ученик ${index + 1}`;
      const student = el("th", name); student.scope = "row"; row.append(student);
      let hasAnswer = false;
      for (const q of state.questions) {
        const key = `${member.account}:${q.number}`, answer = attemptsByKey.get(key);
        hasAnswer ||= answer?.correct != null;
        const cell = el("td"), button = el("button", answer ? (answer.correct == null ? "○" : answer.correct ? "✓" : "×") : "—");
        button.type = "button"; button.className = "lp-answer " + (answer ? (answer.correct == null ? "lp-ungraded" : answer.correct ? "lp-right" : "lp-wrong") : "lp-empty");
        button.dataset.lpFocus = key;
        const verdict = answer ? `${answerStatus(answer)}, ответ ${answer.answer}` : "нет ответа";
        button.setAttribute("aria-label", `${name}, вопрос ${q.number}: ${verdict}`);
        if (answer && /^[A-D]$/.test(answer.answer)) button.prepend(document.createTextNode(answer.answer + " "));
        cell.classList.toggle("lp-current", q.number === state.current);
        button.onclick = () => answerDetails(name, q, answer, key);
        cell.append(button); row.append(cell);
      }
      const actions = el("td");
      const profile = action("Затруднения и подсказки", () => profiles(member, name)); profile.dataset.lpFocus = member.account;
      actions.append(profile);
      const result = member.report ? { text: member.report } : findings.get(member.account);
      if (result) {
        const reportButton = action("Отчёт Gemini", () => {
          const dialog = el("dialog"); dialog.className = "lp-dialog";
          const text = el("p", result.text); text.style.whiteSpace = "pre-wrap";
          dialog.append(el("h2", name), text, action("Закрыть", () => dialog.close()));
          document.body.append(dialog); dialog.addEventListener("close", () => dialog.remove(), { once: true }); dialog.showModal();
        });
        actions.append(reportButton);
      }
      if (state.closed && hasAnswer && !member.report && !result?.busy && (!result || result.failed)) {
        actions.append(action(result?.failed ? "Повторить анализ" : "Анализ Gemini", () => report(member.account)));
      }
      row.append(actions); body.append(row);
    }
    wrap.scrollLeft = scroll;
    if (focused) [...wrap.querySelectorAll("[data-lp-focus]")].find((button) => button.dataset.lpFocus === focused)?.focus({ preventScroll: true });
  }
  async function refresh(afterUpdate = false) {
    if (afterUpdate) await refreshing;
    if (!room || !roster) return;
    refreshing ||= readRoom(room).finally(() => { refreshing = null; });
    return refreshing;
  }
  async function readRoom(roomId) {
    try {
      let full = historyRoom !== roomId || closed;
      let state = await api("host", undefined, full, roomId);
      if (roomId !== room) return;
      if (!full && (state.current !== historyCurrent || state.closed)) {
        state = await api("host", undefined, true, roomId);
        full = true;
        if (roomId !== room) return;
      }
      if (full) attemptsByKey.clear();
      for (const a of state.attempts) attemptsByKey.set(`${a.account}:${a.number}`, a);
      historyRoom = roomId; historyCurrent = state.current;
      closed = state.closed; cold = state.cold || 0; activeNumber = state.current;
      if (restoring) {
        restoring = false; resumeFailed = false;
        if (status) status.textContent = "";
        for (const controls of deckUIs.values()) controls.status.textContent = "";
        rememberView();
      }
      reconcileQueue(state);
      links();
      const data = JSON.stringify([state, [...attemptsByKey.values()]]);
      if (signature !== data) {
        signature = data;
        const names = await canonicalAccounts();
        if (roomId !== room) return;
        renderMonitor(state, names);
      }
    } catch (error) {
      if (roomId !== room) return;
      if (error.status === 404) {
        room = ""; restoring = false; resumeFailed = false;
        if (!hostId) remember("");
        links();
        notify("Сохранённая практика больше недоступна.");
      } else if (restoring) {
        resumeFailed = true; links();
        notify("Связь прервалась. Пульт повторит проверку.");
      } else notify(error.message);
    }
  }
  function mount(root, canReturn, returnToSlide) {
    if (!root || !SITE.adminKey()) return;
    root.hidden = false;
    root.innerHTML = `<section class="cr-card">
      <h2>${hostId ? "Монитор преподавателя" : "Практика с учениками"}</h2><p class="cr-sub">${hostId ? "Нажмите на ответ, чтобы увидеть время и подсказки." : "Ссылка появится при отправке первого вопроса. Её можно подготовить заранее."}</p>
      <p data-lp-current role="status" hidden></p>
      <div class="lp-control"><button class="btn" type="button" data-lp-new>Подготовить ссылку заранее</button>
        <button class="btn ghost" type="button" data-lp-retry hidden>Повторить восстановление</button>
        <div data-lp-panels class="lp-control" hidden>
          <div class="lp-home-actions" role="group" aria-label="Ход практики">
            <button class="btn" data-lp-return type="button" hidden></button>
            <button class="btn ghost" data-lp-advance type="button" hidden></button></div>
          <div class="lp-home-actions" role="group" aria-label="Ссылка и монитор">
            <a class="btn ghost" data-lp-link></a>
            <button class="btn ghost" data-lp-copy type="button">Копировать ссылку</button>
            <a class="btn ghost" data-lp-monitor target="_blank" rel="noopener">Монитор преподавателя</a></div>
          <button class="btn ghost lp-home-end" data-lp-finish type="button">Завершить практику</button></div></div>
      <p data-lp-view-notice hidden></p><p data-lp-status role="status"></p><div class="lp-roster"></div></section>`;
    panels = root.querySelector("[data-lp-panels]"); status = root.querySelector("[data-lp-status]"); roster = root.querySelector(".lp-roster");
    monitorLink = root.querySelector("[data-lp-monitor]"); studentLink = root.querySelector("[data-lp-link]");
    home = { create: root.querySelector("[data-lp-new]"), retry: root.querySelector("[data-lp-retry]"),
      returnSlide: root.querySelector("[data-lp-return]"), unavailable: root.querySelector("[data-lp-view-notice]"),
      state: root.querySelector("[data-lp-current]"), canReturn };
    home.create.onclick = () => room && !closed ? notify("Ссылка уже готова. Её можно скопировать.") : newRoom(window.LESSON?.session()?.group || "Практика SAT");
    home.retry.onclick = async () => {
      home.retry.disabled = true;
      try { await refresh(); } finally { home.retry.disabled = false; }
    };
    home.returnSlide.onclick = () => {
      if (savedView?.room === room && !restoring && !closed && canReturn(savedView)) returnToSlide(savedView);
      else links();
    };
    root.querySelector("[data-lp-copy]").onclick = copyLink;
    root.querySelector("[data-lp-finish]").onclick = finish;
    root.querySelector("[data-lp-advance]").onclick = advance;
    if (hostId) {
      root.querySelector("[data-lp-new]").hidden = true;
      monitorLink.hidden = true;
      document.getElementById("cr-body").hidden = true;
    }
    activeLesson = room ? window.LESSON?.session()?.id || "" : "";
    links();
    (async function tick() {
      await refresh();
      setTimeout(tick, document.hidden || closed ? 8000 : 2500);
    })();
    document.addEventListener("ls-change", () => {
      const session = window.LESSON?.session();
      if (activeLesson && !session) { activeLesson = ""; finish(); }
      else if (!activeLesson && session && room && !closed && !restoring && !hostId) activeLesson = session.id;
    });
  }
  function key(deck) { return "lp-slide:" + deck.id + ":" + deck.n + ":" + (deck.revision || deck.at || ""); }
  function mapping(deck) {
    try { return JSON.parse(localStorage.getItem(key(deck)) || "{}"); } catch { return {}; }
  }
  async function readPart(part) {
    if (!bundles.has(part.b)) bundles.set(part.b, LiveRound.bundle(part.b).catch((error) => { bundles.delete(part.b); throw error; }));
    return bundles.get(part.b);
  }
  async function questionPayload(question, part, lesson) {
    const [workbook] = LiveRound.workbook([question]), { accepted: keys, ...visible } = workbook;
    const accepted = part.id === "slide" ? keys.filter(Boolean) : keys;
    if (!accepted.length) visible.graded = false;
    return { ref: `${lesson.tag}.${part.id}.${question.n}`, snapshot: await SITE.sealBlob(visible),
      kind: workbook.type, accepted, skill: skill(question, lesson) };
  }
  function saveMapping(deck, index, value) {
    const map = mapping(deck);
    if (value) map[index] = value; else delete map[index];
    try { localStorage.setItem(key(deck), JSON.stringify(map)); }
    catch { notify("Не удалось сохранить привязку в браузере."); }
  }
  async function publish(deck, index, lesson, choice) {
    if ((cold || restoring || sendingStage || roomQueue()?.pending || roomQueue()?.stage >= 0) && !choice) return;
    const map = choice || mapping(deck)[index];
    if (!map || !room || closed || !lesson) return;
    const revision = ++dispatchNumber, id = room;
    dispatch = dispatch.catch(() => {}).then(async () => {
      if (revision !== dispatchNumber || id !== room || closed) return;
      const part = map && lesson.parts.find((p) => p.id === map.part);
      const ref = part ? `${lesson.tag}.${part.id}.${map.number}` : "";
      if (ref === sent && !choice) return;
      if (!ref || !part.b) throw new Error("Вопрос исчез из задания. Привяжите другой вопрос.");
      const q = (await readPart(part)).find((x) => x.n === map.number);
      if (!q) throw new Error("Вопрос исчез из задания. Привяжите другой вопрос.");
      const payload = await questionPayload(q, part, lesson);
      if (revision !== dispatchNumber || id !== room || closed) return;
      const result = await api("show", { ...payload, automatic: !choice });
      if (result.keptCold) return;
      cold = 0; links();
      sent = ref;
      notify(`Открыт вопрос №${map.number} из «${part.title}».`);
    }).catch((error) => notify(error.message));
    return dispatch;
  }
  const plain = (html) => new DOMParser().parseFromString(html || "", "text/html").body.textContent;
  const safeText = (text) => String(text).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const paragraphs = (text) => text.trim().split(/\n+/).filter(Boolean).map((line) => `<p>${safeText(line)}</p>`).join("");
  function passageHTML(passage, { verse, title, underlineFrom }) {
    if (!passage) return "";
    const [first, ...rest] = passage.split("\n");
    const attribution = title ? `<p>${safeText(first).replace(title, `<em>${title}</em>`)}</p>` : paragraphs(first);
    if (verse) {
      const lines = rest.map((line, i) => underlineFrom !== undefined && i >= underlineFrom ? `<u>${safeText(line)}</u>` : safeText(line));
      return attribution + `<p>${lines.join("<br>")}</p>`;
    }
    if (title) return attribution + paragraphs(rest.join("\n"));
    if (rest.length && /^while researching\b/i.test(first)) {
      return paragraphs(first) + "<ul>" + rest.map((line) => `<li>${safeText(line.replace(/^[•●▪]\s+/, ""))}</li>`).join("") + "</ul>";
    }
    return paragraphs(passage);
  }
  const answerLetters = ["A", "B", "C", "D"];
  function keySelect(label, value = "") {
    const input = el("select");
    input.setAttribute("aria-label", label);
    input.append(new Option("Выберите ответ", ""), ...answerLetters.map((letter) => new Option(letter, letter)));
    input.value = value; input.required = true;
    return input;
  }
  function slideItem(index, draft, answer, material) {
    const layout = SlidePracticeContent.splitPrompt(draft.prompt);
    return { t: "mc", n: index + 1, stim: material?.stim ?? passageHTML(layout.passage, layout), stem: material?.stem ?? paragraphs(layout.stem),
      opts: draft.opts.map(safeText), ans: answer };
  }
  async function slidePayload(lesson, index, draft, answer, material) {
    const question = slideItem(index, draft, answer, material);
    const payload = await questionPayload(question, { id: "slide" }, lesson);
    if (material) {
      payload.ref = `${lesson.tag}.${await SlideMaterialPreview.reference(material, answer)}.${index + 1}`;
      if (payload.snapshot.length > 160000) throw Error("Фрагмент слишком большой. Уменьшите выделение.");
    }
    return payload;
  }
  async function publishSlide(lesson, index, draft, answer, visible = () => true, material) {
    const payload = await slidePayload(lesson, index, draft, answer, material);
    if (!visible()) return;
    const id = await create(window.LESSON?.session()?.group || lesson.title);
    const revision = ++dispatchNumber;
    const send = dispatch.catch(() => {}).then(async () => {
      if (revision !== dispatchNumber || id !== room || !visible()) return;
      await api("show", payload);
      cold = 0; sent = null; links(); await refresh(true);
      notify(`Вопрос со слайда ${index + 1} открыт у учеников.${answer ? "" : " Ключ не найден. Ответы сохраняются без оценки."}`);
    });
    dispatch = send;
    return send;
  }
  function picker(box, deck, index, lesson, readText) {
    const dialog = el("dialog"); dialog.className = "lp-dialog lp-question-picker";
    const form = el("form"), title = el("h2", `Вопрос для слайда ${index + 1}`);
    const source = el("select"), part = el("select"), number = el("select");
    source.setAttribute("aria-label", "Источник вопроса");
    part.setAttribute("aria-label", "Часть урока"); number.setAttribute("aria-label", "Вопрос");
    const saved = mapping(deck)[index];
    const supported = lesson.parts.filter((p) => p.b && p.q?.length);
    if (supported.length) source.append(new Option("Рабочая тетрадь", "workbook"));
    source.append(new Option("Вопрос со слайда", "slide"));
    const selected = saved?.part || supported.find((p) => /практи/i.test(p.title))?.id;
    for (const item of supported) part.append(new Option(item.title, item.id, false, item.id === selected));

    const workbook = el("div"), preview = el("div"), slideForm = el("div"), fields = el("div");
    workbook.className = "lp-picker-fields"; slideForm.className = "lp-picker-fields";
    preview.className = "lp-question-preview"; preview.lang = "en";
    fields.className = "lp-picker-selects";
    const label = (text, input) => { const row = el("label", text); row.append(input); return row; };
    fields.append(label("Часть урока", part), label("Вопрос", number));
    workbook.append(fields, preview);
    const prompt = el("textarea"); prompt.rows = 6; prompt.required = true; prompt.maxLength = 12000; prompt.lang = "en";
    const options = answerLetters.map((letter) => {
      const input = el("input"); input.required = true; input.maxLength = 1600; input.lang = "en";
      const controls = label(`Вариант ${letter}`, input); controls.className = "lp-option-input";
      return { input, controls };
    });
    const answer = keySelect("Правильный ответ");
    slideForm.append(label("Текст задания", prompt), ...options.map(({ controls }) => controls), label("Правильный ответ", answer));
    const primary = el("button", "Привязать и показать"); primary.className = "btn"; primary.type = "submit";
    const message = el("p"); message.setAttribute("role", "status");
    let currentQuestion, request = 0, saving = false;
    const update = () => {
      const slide = source.value === "slide";
      workbook.hidden = slide; slideForm.hidden = !slide;
      [prompt, answer, ...options.map(({ input }) => input)].forEach((input) => { input.disabled = !slide; });
      primary.textContent = slide ? "Показать ученикам" : "Привязать и показать";
      primary.disabled = saving || (!slide && !currentQuestion);
    };
    async function loadQuestion() {
      const wanted = ++request, found = supported.find((p) => p.id === part.value);
      currentQuestion = null; preview.textContent = "Загружаю вопрос…"; update();
      try {
        const item = (await readPart(found)).find((q) => q.n === Number(number.value));
        if (wanted !== request) return;
        currentQuestion = item;
        if (!item) { preview.textContent = "Вопрос не загрузился. Выберите другой или используйте слайд."; return; }
        preview.replaceChildren(el("p", plain(item.stim)), el("p", plain(item.stem)), ...(item.opts || []).map((option, i) => el("p", answerLetters[i] + ". " + plain(option))));
      } catch { if (wanted === request) preview.textContent = "Рабочая тетрадь недоступна. Можно использовать вопрос со слайда."; }
      finally { if (wanted === request) update(); }
    }
    function loadOptions() {
      const found = supported.find((p) => p.id === part.value);
      number.replaceChildren(...(found?.q || []).map((q) => new Option("№" + q.n, String(q.n), false, q.n === saved?.number)));
      loadQuestion();
    }
    source.onchange = update; part.onchange = loadOptions; number.onchange = loadQuestion;
    form.append(title);
    form.append(label("Источник вопроса", source), workbook, slideForm, message, primary);
    const buttons = el("div"); buttons.className = "lp-control";
    if (saved) buttons.append(action("Снять привязку", () => { saveMapping(deck, index, null); dialog.close(); }));
    buttons.append(action("Закрыть", () => dialog.close()));
    form.append(buttons); dialog.append(form); box.append(dialog);
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    form.onsubmit = async (event) => {
      event.preventDefault();
      if (saving) return;
      saving = true; update();
      try {
        if (source.value === "slide") {
          const draft = { prompt: prompt.value.trim(), opts: options.map(({ input }) => input.value.trim()) };
          if (!draft.prompt || draft.opts.some((value) => !value) || !answer.value) throw new Error("Укажите текст, четыре варианта и правильный ответ.");
          await publishSlide(lesson, index, draft, answer.value);
          saveMapping(deck, index, null);
          dialog.close();
        } else if (currentQuestion) {
          const choice = { part: part.value, number: currentQuestion.n };
          await create(window.LESSON?.session()?.group || lesson.title);
          saveMapping(deck, index, choice);
          await publish(deck, index, lesson, choice);
          dialog.close();
        }
      } catch (error) { message.textContent = error.message; }
      finally { saving = false; update(); }
    };
    if (supported.length) loadOptions(); else update();
    dialog.showModal();
    readText?.(index).then(async (text) => {
      const draft = SlidePracticeContent.parse(text);
      if (!dialog.open) return;
      if (draft) {
        if (!prompt.value) prompt.value = draft.prompt;
        options.forEach(({ input }, i) => { if (!input.value) input.value = draft.opts[i]; });
      }
      const slot = SlidePracticeContent.coldNumber(text);
      if (!answer.value) answer.value = SlidePracticeContent.answerKey(text) || "";
      if (slot) {
        const { keys } = await readColdDeck(deck, readText);
        if (dialog.open && !answer.value) answer.value = keys?.[slot - 1] || "";
      }
    }).catch(() => { /* the teacher can enter text manually */ });
  }
  async function questionCandidates(lesson) {
    const parts = lesson.parts.filter((p) => p.b && p.q?.length);
    const loaded = await Promise.allSettled(parts.map(async (p) => (await readPart(p)).map((question) => ({ part: p.id, question }))));
    return loaded.flatMap((part) => part.status === "fulfilled" ? part.value : []);
  }
  async function resolveSlide(deck, lesson, index, readText, readSlide) {
    const text = await readText(index);
    const parsed = SlideMaterialPreview.readDraft(text);
    const material = readSlide ? await SlideMaterialPreview.prepare(deck, index, await readSlide(index), parsed, text) : null;
    const draft = material?.draft || parsed;
    if (!draft) return { text };
    let answer = SlidePracticeContent.answerKey(text);
    const slot = SlidePracticeContent.coldNumber(text);
    if (!answer && slot) {
      const recap = await readColdDeck(deck, readText).catch(() => null);
      answer = recap?.keys?.[slot - 1];
    }
    if (!answer && index + 1 < deck.n) {
      const next = await readText(index + 1).catch(() => "");
      answer = SlidePracticeContent.nextKey(text, next);
      if (!answer && index + 2 < deck.n) {
        answer = SlidePracticeContent.nextKey(text, next, await readText(index + 2).catch(() => ""));
      }
    }
    if (!answer) answer = SlideQuestionMatch.exactSlide(draft, await questionCandidates(lesson))?.answer;
    return { text, draft, answer, material };
  }
  async function recognize(box, deck, lesson, current, readText, readSlide, button) {
    const index = current();
    const visible = () => box.isConnected && index === current();
    button.disabled = true;
    notify("Ищу вопрос по тексту слайда…");
    try {
      const { text, draft, answer, material } = await resolveSlide(deck, lesson, index, readText, readSlide);
      if (!visible()) return;
      if (!draft) {
        const saved = mapping(deck)[index];
        if (saved && !SlidePracticeContent.isSolution(text)) {
          await create(lesson.title);
          if (visible()) await publish(deck, index, lesson, saved);
        } else {
          notify(text.trim() ? "На этом слайде не найден вопрос с четырьмя вариантами." : "У этого слайда нет текстового слоя.");
        }
        return;
      }
      await publishSlide(lesson, index, draft, answer, visible, material);
    } catch (error) { if (visible()) notify(error.message); }
    finally { button.disabled = false; }
  }
  async function readColdDeck(deck, readText) {
    if (!deck || !readText) return { slides: new Map(), keys: null };
    if (!coldDecks.has(deck)) {
      const reading = (async () => {
        const slides = new Map();
        let keys = null;
        for (let i = 0; i < deck.n; i++) {
          const text = await readText(i), number = SlidePracticeContent.coldNumber(text);
          if (number && !slides.has(number)) slides.set(number, { index: i, text, draft: SlideMaterialPreview.readDraft(text) });
          keys ||= SlidePracticeContent.recapKeys(text);
          if (slides.size === 4 && keys) break;
        }
        return { slides, keys };
      })().catch((error) => { coldDecks.delete(deck); throw error; });
      coldDecks.set(deck, reading);
    }
    return coldDecks.get(deck);
  }
  const coldSlots = [1, 2, 3, 4];
  async function checkMaterial(deck, slide, readSlide) {
    if (!readSlide) return {};
    const { index, draft, text } = slide;
    const entry = await readSlide(index);
    try { return { material: await SlideMaterialPreview.prepare(deck, index, entry, draft, text) }; }
    catch (error) { return { issue: error.message }; }
  }
  async function coldQuestions(lesson, deck, readText, readSlide) {
    const { slides, keys } = await readColdDeck(deck, readText);
    if (slides.size) {
      const candidates = keys && [...slides.values()].every(({ draft }) => draft) ? []
        : await questionCandidates(lesson).catch(() => []);
      return Promise.all(coldSlots.map(async (slot) => {
        const slide = slides.get(slot);
        if (!slide) return { slot, issue: "Слайд с этим номером не найден." };
        const { material, issue } = await checkMaterial(deck, slide, readSlide);
        if (issue) return { ...slide, slot, issue };
        const draft = material?.draft || slide.draft;
        if (draft) {
          const answer = SlidePracticeContent.answerKey(slide.text) || keys?.[slot - 1] ||
            SlideQuestionMatch.exactSlide(draft, candidates)?.answer;
          return { ...slide, slot, draft, answer, material };
        }
        const match = SlideQuestionMatch.match(slide.text, candidates);
        const question = match && candidates.find((item) => item.part === match.part && item.question.n === match.number)?.question;
        if (question) return { ...slide, slot, part: lesson.parts.find((part) => part.id === match.part), question };
        return { ...slide, slot, issue: "Не удалось прочитать вопрос и четыре варианта." };
      }));
    }
    const part = coldPart(lesson);
    if (!part) return [];
    const items = await readPart(part);
    return coldSlots.map((slot) => {
      const question = items.find((item) => item.n === part.q[slot - 1]?.n);
      return question ? { slot, part, question } : { slot, issue: "Вопрос из рабочей тетради не загрузился." };
    });
  }
  async function readiness(deck, lesson, readText, readSlide, opener, jump) {
    const dialog = el("dialog"); dialog.className = "lp-dialog lp-question-picker lp-deck-check";
    const title = el("h2", "Готовность презентации"); title.id = "lp-deck-check-title";
    dialog.setAttribute("aria-labelledby", title.id);
    const status = el("p", "Проверяю текст слайдов…"); status.setAttribute("role", "status");
    const results = el("div");
    const close = action("Закрыть", () => dialog.close());
    const header = el("header"); header.append(title, close);
    let jumping = false;
    dialog.append(header, status, results);
    document.body.append(dialog);
    dialog.addEventListener("close", () => {
      dialog.remove();
      if (!jumping && opener.isConnected) opener.focus();
    }, { once: true });
    dialog.showModal();
    function row(title, message, index) {
      const item = el("li"); item.append(el("strong", title), el("span", message));
      if (index !== undefined) item.append(action(`Перейти к слайду ${index + 1}`, () => {
        jumping = true;
        dialog.close();
        jump(index);
      }));
      return item;
    }
    try {
      const series = await coldQuestions(lesson, deck, readText, readSlide);
      const seriesIndex = new Set(series.map(({ index }) => index));
      const missing = [];
      for (let index = 0; index < deck.n && dialog.open; index++) {
        if (seriesIndex.has(index)) continue;
        const text = await readText(index), draft = SlideMaterialPreview.readDraft(text);
        if (!SlideMaterialPreview.requiredMaterial(draft)) continue;
        const { issue } = await checkMaterial(deck, { index, text, draft }, readSlide);
        if (issue) missing.push({ index, issue });
      }
      if (!dialog.open) return;
      const seriesList = el("ul"), mediaList = el("ul");
      const ready = series.filter(({ issue }) => !issue).length;
      for (const item of series) {
        const slide = item.index === undefined ? item.question ? " · тетрадь" : "" : ` · слайд ${item.index + 1}`;
        const state = item.issue || (item.answer || item.question?.ans || item.question?.acc?.length ? "Готов" : "Готов · без оценки");
        seriesList.append(row(`Вопрос ${item.slot}${slide}`, state, item.issue ? item.index : undefined));
      }
      for (const { index, issue } of missing) mediaList.append(row(`Слайд ${index + 1}`, issue, index));
      results.append(el("h3", "Холодный старт"), series.length ? seriesList : el("p", "Четыре вопроса не найдены."),
        el("h3", "Другие задания"), missing.length ? mediaList : el("p", "У распознанных заданий нет пропущенных фрагментов."));
      status.textContent = `${series.length ? `Холодный старт · ${ready} из 4 готовы. ` : ""}Другие задания для подготовки · ${missing.length}.`;
    } catch (error) {
      if (dialog.open) status.textContent = "Проверка прервалась. Проверьте подключение и снова откройте презентацию.";
    }
  }
  async function coldPayload(lesson, deck, readText, readSlide) {
    const selected = await coldQuestions(lesson, deck, readText, readSlide);
    if (!selected.length) throw Error("В презентации и рабочей тетради не найдены четыре вопроса холодного старта.");
    const pending = selected.filter(({ issue }) => issue);
    if (pending.length) {
      const titles = pending.map(({ slot, index }) => index === undefined ? `вопрос ${slot}` : `слайд ${index + 1}`);
      throw Error(`Подготовьте ${titles.join(", ")}.${deck?.uploaded ? " Подробности в «Проверить готовность»." : ""}`);
    }
    const source = selected.map((item) => ({
      question: item.question || slideItem(item.index, item.draft, item.answer, item.material), part: item.part || { id: "slide" }
    }));
    const series = selected.some(({ index }) => index !== undefined)
      ? await SlideMaterialPreview.reference(source.map(({ question, part }) => [part.id, question])) : null;
    return Promise.all(source.map(async ({ question, part }, index) => {
      const payload = await questionPayload(question, part, lesson);
      if (payload.snapshot.length > 160000) throw Error(`Вопрос ${index + 1} слишком большой.`);
      if (series) payload.ref = `${lesson.tag}.${series}.${index + 1}`;
      return payload;
    }));
  }
  async function startCold(lesson, deck, readText, readSlide, visible = () => true) {
    if (!lesson || preparingCold) return;
    preparingCold = true;
    try {
      notify("Готовлю четыре вопроса холодного старта…");
      const questions = await coldPayload(lesson, deck, readText, readSlide);
      if (!visible()) return;
      const id = await create(window.LESSON?.session()?.group || lesson.title);
      const revision = ++dispatchNumber;
      const send = dispatch.catch(() => {}).then(async () => {
        if (revision !== dispatchNumber || id !== room || !visible()) return;
        await api("cold", { questions });
        sent = null;
        await refresh(true);
        const ungraded = questions.some(({ accepted }) => !accepted.length);
        notify("Холодный старт открыт. Переключайте вопросы кнопкой «Следующий вопрос»." +
          (ungraded ? " Вопросы без ключа сохраняются без оценки." : ""));
      });
      dispatch = send;
      await send;
    } catch (error) { if (visible()) notify(error.message); }
    finally { preparingCold = false; }
  }
  async function advance() {
    if (!room || !activeNumber || !cold || advancing || sendingStage || roomQueue()?.pending) return;
    advancing = true; links();
    try {
      const step = cold;
      await api("advance", { number: activeNumber });
      activeNumber = null;
      if (step === 4) { cold = 0; notify("Холодный старт завершён."); }
      await refresh(true);
    } catch (error) { notify(error.message); }
    finally { advancing = false; links(); }
  }
  const stages = ["Холодный старт", "Объяснение", "Упражнение 1", "Упражнение 2"];
  function roomQueue() {
    return room && !closed && queue?.room === room ? queue : null;
  }
  function matchesDeck(deck) {
    const { id, updated, count } = deckPosition(deck);
    return queue?.deck?.id === id && queue.deck.updated === updated && queue.deck.count === count;
  }
  function reconcileQueue(state) {
    const pending = roomQueue()?.pending;
    if (!pending || sendingStage) return;
    const ref = state.questions.find(({ number }) => number === state.current)?.ref;
    const matched = pending.refs.length ? pending.refs.includes(ref) : state.current === null;
    if (matched) {
      queue.stage = pending.target;
      rememberView({ ...queue.deck, index: pending.slide });
    }
    queue.pending = null;
    saveQueue();
    if (!matched) notify("Переход не подтверждён. Нажмите кнопку этапа ещё раз.");
  }
  function renderQueue(controls) {
    const configured = matchesDeck(controls.deck);
    const current = configured ? roomQueue() : null;
    const stage = current?.stage ?? -1;
    const blocked = restoring || sendingStage || !!current?.pending || advancing || (stage >= 0 && !!cold);
    setClassState(controls.label, !configured ? "" : stage < 0 ? "План готов · 4 этапа" : `Этап ${stage + 1} из 4 · ${stages[stage]}`);
    controls.prev.hidden = stage < 1;
    controls.prev.disabled = blocked;
    controls.next.hidden = !configured || stage >= stages.length - 1;
    controls.next.disabled = blocked;
    controls.next.textContent = stage < 0 ? "Начать по плану" : "Далее по плану";
    controls.setup.disabled = sendingStage || !!current?.pending;
  }
  function editQueue(controls) {
    const dialog = el("dialog"); dialog.className = "lp-dialog lp-question-picker";
    const title = el("h2", "План урока"); title.id = "lp-queue-title";
    dialog.setAttribute("aria-labelledby", title.id);
    const form = el("form"), message = el("p"); message.setAttribute("role", "status");
    const saved = matchesDeck(controls.deck) ? queue.slides : [];
    const fields = stages.slice(1).map((name, i) => {
      const input = el("select"), label = el("label", name); input.required = true;
      input.setAttribute("aria-label", name);
      input.append(new Option("Выберите слайд", ""));
      for (let index = 0; index < controls.deck.n; index++) input.append(new Option(`Слайд ${index + 1}`, index));
      input.value = saved[i] ?? "";
      label.append(input); form.append(label);
      return input;
    });
    const save = el("button", "Сохранить план"); save.className = "btn"; save.type = "submit";
    form.append(message, save, action("Закрыть", () => dialog.close()));
    dialog.append(title, el("p", "Первый этап — четыре вопроса холодного старта."), form);
    dialog.addEventListener("close", () => { dialog.remove(); controls.setup.focus(); }, { once: true });
    form.onsubmit = (event) => {
      event.preventDefault();
      const slides = fields.map((field) => Number(field.value));
      if (slides[1] === slides[2]) { message.textContent = "Выберите разные слайды для двух упражнений."; return; }
      if (!saved.every((slide, index) => slide === slides[index]) || !saved.length) {
        queue = { deck: deckPosition(controls.deck), slides, stage: -1, room: null };
        saveQueue();
      }
      renderQueue(controls);
      dialog.close();
    };
    document.body.append(dialog); dialog.showModal();
  }
  async function exercisePayload(controls, index) {
    const { deck, lesson, readText, readSlide } = controls;
    try {
      const { draft, answer, material } = await resolveSlide(deck, lesson, index, readText, readSlide);
      if (!draft) throw Error("Нужен вопрос с четырьмя вариантами.");
      return await slidePayload(lesson, index, draft, answer, material);
    } catch (error) { throw Error(`Слайд ${index + 1}. ${error.message}`); }
  }
  async function changeStage(controls, offset) {
    if (!matchesDeck(controls.deck) || sendingStage || restoring || advancing || roomQueue()?.pending) return;
    const { deck, lesson, readText, readSlide, box, jump } = controls;
    const previous = roomQueue()?.stage ?? -1;
    const target = previous + offset;
    if (target < 0 || target >= stages.length || (previous >= 0 && cold)) return;
    const plan = queue;
    sendingStage = true; links();
    let slide;
    try {
      let actionName, body, refs;
      if (target === 0) {
        const questions = await coldPayload(lesson, deck, readText, readSlide);
        await Promise.all(plan.slides.slice(1).map((index) => exercisePayload(controls, index)));
        const manifest = await readColdDeck(deck, readText);
        slide = manifest.slides.get(1)?.index ?? 0;
        actionName = "cold"; body = { questions }; refs = questions.map((q, i) => `${q.ref}:cold:${i + 1}`);
      } else {
        slide = plan.slides[target - 1];
        if (target === 1) { actionName = "pause"; body = {}; refs = []; }
        else { actionName = "show"; body = await exercisePayload(controls, slide); refs = [body.ref]; }
      }
      if (plan !== queue || !box.isConnected) return;
      const id = await create(window.LESSON?.session()?.group || lesson.title);
      if (plan !== queue || !box.isConnected) return;
      const revision = ++dispatchNumber;
      const send = dispatch.catch(() => {}).then(async () => {
        if (revision !== dispatchNumber || id !== room || !box.isConnected) return;
        queue.room = id;
        queue.pending = { target, refs, slide }; saveQueue();
        await api(actionName, body, false, id);
        sent = null;
      });
      dispatch = send;
      await send;
    } catch (error) { if (box.isConnected) notify(error.message); }
    finally {
      sendingStage = false;
      if (plan === queue && roomQueue()?.pending) {
        await refresh(true);
        if (queue.stage === target && !queue.pending && box.isConnected) {
          jump(slide);
          const nextAction = target === 0 ? box.querySelector("[data-lp-deck-advance]") : controls.next.hidden ? controls.prev : controls.next;
          if (nextAction && !nextAction.hidden && !nextAction.disabled) nextAction.focus();
          notify(`${stages[target]} · этап ${target + 1} из 4.`);
        }
      }
      links();
    }
  }
  function attachQueue(box, preparation, bar, context) {
    const label = el("span"); label.className = "lp-queue-state"; label.setAttribute("role", "status");
    const controls = { ...context, box, label };
    controls.setup = action("План урока", () => editQueue(controls));
    controls.setup.setAttribute("aria-haspopup", "dialog");
    controls.prev = action("Назад по плану", () => changeStage(controls, -1));
    controls.next = action("Начать по плану", () => changeStage(controls, 1));
    preparation.append(controls.setup);
    bar.append(controls.prev, controls.next, label);
    return controls;
  }
  function attach(box, deck, lesson, current, readText, readSlide, jump) {
    if (!lesson || !SITE.adminKey()) return;
    const bar = el("div"); bar.className = "lp-control dk-bar dk-practice";
    const questions = el("div"); questions.className = "dk-actions";
    questions.setAttribute("role", "group"); questions.setAttribute("aria-label", "Вопросы для класса");
    const connection = el("div"); connection.className = "dk-actions";
    connection.setAttribute("role", "group"); connection.setAttribute("aria-label", "Связь с классом");
    const preparation = el("details"); preparation.className = "dk-prep";
    const prepActions = el("div"); prepActions.className = "dk-actions";
    preparation.append(el("summary", "Подготовка"), prepActions);
    const pick = action("Показать с этого слайда", () => recognize(box, deck, lesson, current, readText, readSlide, pick));
    pick.className = "lp-show-slide";
    const manual = action("Выбрать вручную", () => picker(box, deck, current(), lesson, readText));
    const next = action("Следующий вопрос", advance);
    next.dataset.lpDeckAdvance = "";
    next.hidden = true;
    const copy = action("Ссылка для учеников", copyLink);
    const monitor = el("a", "Монитор преподавателя"); monitor.target = "_blank"; monitor.rel = "noopener";
    const status = el("small"); status.setAttribute("role", "status");
    const state = el("small"); state.className = "lp-class-state"; state.setAttribute("role", "status");
    questions.append(pick, next);
    prepActions.append(manual);
    if (readSlide) {
      const material = action("Материал слайда", async () => {
        if (await SlideMaterialPreview.open(deck, current(), readSlide, readText, material)) {
          notify("Материал сохранён для этого слайда.");
        }
      });
      const ready = action("Проверить готовность", () => readiness(deck, lesson, readText, readSlide, ready, (index) => {
        jump(index);
        material.focus();
      }));
      ready.setAttribute("aria-haspopup", "dialog");
      prepActions.append(material, ready);
    }
    if (coldPart(lesson) || deck.uploaded) {
      const start = action("Холодный старт · 4 вопроса", async () => {
        start.disabled = true;
        try { await startCold(lesson, deck, readText, readSlide, () => box.isConnected); }
        finally { start.disabled = false; }
      });
      questions.append(start);
    }
    const plan = el("div"); plan.className = "dk-actions dk-plan";
    const queueControls = readSlide ? attachQueue(box, prepActions, plan, { deck, lesson, readText, readSlide, jump }) : null;
    connection.append(copy, monitor);
    bar.append(questions, connection, preparation);
    if (queueControls) bar.append(plan);
    bar.append(state, status); box.querySelector(".dk-bar").after(bar);
    deckUIs.set(box, { monitor, copy, status, state, advance: next, queue: queueControls });
    links();
  }
  function detach(box) {
    deckUIs.delete(box);
    teachingView = null;
  }
  return { mount, attach, publish, startCold, coldPart, view, detach };
})();
