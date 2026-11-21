// The presentation only controls the active question. Names and answers stay in the teacher monitor.
window.LessonPracticeHost = (() => {
  const params = new URLSearchParams(location.search), hostId = params.get("practiceHost");
  const storageKey = "lp-room";
  const stored = (key) => { try { return sessionStorage.getItem(key) || ""; } catch { return ""; } };
  const remember = (id) => { try { sessionStorage.setItem(storageKey, id); } catch { /* optional resume */ } };
  const el = (tag, value) => { const node = document.createElement(tag); if (value != null) node.textContent = value; return node; };
  const skill = (q, l) => q.sk || [
    "Words in Context", "Text Structure and Purpose", "Cross-Text Connections", "Central Ideas and Details", "Command of Evidence",
    "Inferences", "Boundaries", "Form, Structure, and Sense", "Transitions", "Rhetorical Synthesis"
  ].find((s) => l.title.includes(s)) || "";
  let room = hostId || stored(storageKey), closed = false, panels, status, roster, monitorLink, studentLink;
  let signature = "", findings = new Map(), running = false, activeLesson = "", dispatchNumber = 0, dispatch = Promise.resolve(), sent = null;
  let accounts, autoReport = false, cold = 0, activeNumber, advancing = false;
  let historyCurrent, historyRoom, attemptsByKey = new Map();
  const coldPart = (lesson) => lesson?.parts.find((p) => p.b && p.q?.length >= 4 && /холодн|cold[ -]+start/i.test(p.title));
  const deckUIs = new Map(), bundles = new Map();

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
  function links() {
    const visible = !!room && !closed;
    if (panels) panels.hidden = !room;
    if (room && studentLink) {
      studentLink.href = link("practice.html", "lessonRoom");
      studentLink.textContent = visible ? "Ссылка для учеников" : "Ссылка на завершённую практику";
      monitorLink.href = link("classroom.html", "practiceHost");
      panels.querySelector("[data-lp-finish]").hidden = closed;
      panels.querySelector("[data-lp-copy]").hidden = closed;
    }
    const updateAdvance = (button) => {
      button.hidden = !visible || !cold;
      button.disabled = advancing;
      button.textContent = cold === 4 ? "Закончить холодный старт · 4/4" : `Следующий вопрос · ${cold}/4`;
    };
    if (panels) updateAdvance(panels.querySelector("[data-lp-advance]"));
    for (const controls of deckUIs.values()) {
      updateAdvance(controls.advance);
      controls.monitor.hidden = !room;
      controls.monitor.href = room ? link("classroom.html", "practiceHost") : "#";
      controls.copy.hidden = !visible;
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
    if (room && !closed) return room;
    const result = await api("create", { title: title.slice(0, 160) });
    room = result.room; remember(room); closed = false; cold = 0; activeNumber = null; sent = null; findings = new Map(); autoReport = false; signature = "";
    activeLesson = window.LESSON?.session()?.id || "";
    links(); notify("Практика открыта. Скопируйте ссылку и покажите первый вопрос.");
    for (const { deck, lesson, current } of deckUIs.values()) publish(deck, current(), lesson);
    return room;
  }
  function newRoom(title, after) {
    const dialog = el("dialog"); dialog.className = "lp-dialog";
    const form = el("form"), heading = el("h2", "Открыть практику"), label = el("label", "Название для учеников");
    const input = el("input"); input.required = true; input.maxLength = 160; input.value = title;
    const message = el("p"); message.setAttribute("role", "status");
    const submit = el("button", "Создать ссылку"); submit.type = "submit"; submit.className = "btn";
    form.append(heading, label, message, submit, action("Отмена", () => dialog.close())); label.append(input);
    dialog.append(form); document.body.append(dialog);
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    form.onsubmit = async (event) => {
      event.preventDefault(); submit.disabled = true;
      try { await create(input.value); dialog.close(); if (after) after(); } catch (error) { message.textContent = error.message; submit.disabled = false; }
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
    if (!room || closed) return;
    try {
      await api("close", {});
      closed = true; cold = 0; autoReport = true; links();
      notify("Практика завершена. Gemini анализирует ответы учеников.");
      refresh();
    } catch (error) { notify(error.message); }
  }
  function answerDetails(name, question, answer, focusKey) {
    const dialog = el("dialog"); dialog.className = "lp-dialog";
    const title = el("h2", `${name} · вопрос ${question.number}`);
    dialog.append(title, el("p", `${question.ref.replace(/:cold:\d$/, "")} · ${question.skill}`));
    if (answer) {
      const hints = [answer.hints & 1 ? "словарь" : "", answer.hints & 2 ? "исключение вариантов" : ""].filter(Boolean);
      dialog.append(el("p", `Ответ ${answer.answer} · ${answer.correct ? "верно" : "ошибка"}`),
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
    const heading = el("p", state.closed ? "Итоги практики" : state.cold ? `Холодный старт · ${state.cold}/4` :
      state.current ? `Сейчас вопрос ${state.current}` : "Ученики ждут вопрос.");
    heading.className = "lp-matrix-status";
    roster.replaceChildren(heading);
    if (!state.members.length) { roster.append(el("p", "Пока никто не подключился.")); return; }
    const legend = el("p", "✓ Верно · × Ошибка · — Нет ответа");
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
        hasAnswer ||= !!answer;
        const cell = el("td"), button = el("button", answer ? (answer.correct ? "✓" : "×") : "—");
        button.type = "button"; button.className = "lp-answer " + (answer ? (answer.correct ? "lp-right" : "lp-wrong") : "lp-empty");
        button.dataset.lpFocus = key;
        const verdict = answer ? `${answer.correct ? "верно" : "ошибка"}, ответ ${answer.answer}` : "нет ответа";
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
  async function refresh() {
    if (running || !room || !roster) return;
    running = true;
    const roomId = room;
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
      links();
      const data = JSON.stringify([state, [...attemptsByKey.values()]]);
      if (signature !== data) {
        signature = data;
        const names = await canonicalAccounts();
        if (roomId !== room) return;
        renderMonitor(state, names);
      }
      if (state.closed && autoReport) {
        // One request at a time keeps each report within the same quota as a short lesson generation call.
        autoReport = false;
        const answered = new Set(state.attempts.map((a) => a.account));
        (async () => {
          for (const m of state.members) if (answered.has(m.account) && !m.report) await report(m.account, roomId);
          if (roomId === room) notify("Анализ завершён. Откройте отчёты в строках учеников.");
        })();
      }
    } catch (error) {
      if (roomId !== room) return;
      if (error.status === 404 && !hostId) { room = ""; remember(""); links(); }
      notify(error.message);
    }
    finally { running = false; }
  }
  function mount(root) {
    if (!root || !SITE.adminKey()) return;
    root.hidden = false;
    root.innerHTML = `<section class="cr-card">
      <h2>${hostId ? "Монитор преподавателя" : "Практика с учениками"}</h2><p>${hostId ? "Нажмите на ответ, чтобы увидеть время и подсказки." : "Раздайте одну ссылку. Откройте презентацию и нажмите «Показать с этого слайда»."}</p>
      <div class="lp-control"><button class="btn" type="button" data-lp-new>Открыть практику</button>
        <div data-lp-panels class="lp-control" hidden><a class="btn ghost" data-lp-link></a>
          <button class="btn ghost" data-lp-copy type="button">Копировать ссылку</button>
          <a class="btn ghost" data-lp-monitor target="_blank" rel="noopener">Монитор преподавателя</a>
          <button class="btn ghost" data-lp-advance type="button" hidden></button>
          <button class="btn ghost" data-lp-finish type="button">Завершить и запустить анализ</button></div></div>
      <p data-lp-status role="status"></p><div class="lp-roster"></div></section>`;
    panels = root.querySelector("[data-lp-panels]"); status = root.querySelector("[data-lp-status]"); roster = root.querySelector(".lp-roster");
    monitorLink = root.querySelector("[data-lp-monitor]"); studentLink = root.querySelector("[data-lp-link]");
    root.querySelector("[data-lp-new]").onclick = () => room && !closed ? notify("Ссылка уже готова. Её можно скопировать.") : newRoom(window.LESSON?.session()?.group || "Практика SAT");
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
      if (activeLesson && !window.LESSON?.session()) { activeLesson = ""; finish(); }
    });
  }
  function key(deck) { return "lp-slide:" + deck.id + ":" + deck.n + ":" + (deck.at || ""); }
  function mapping(deck) {
    try { return JSON.parse(localStorage.getItem(key(deck)) || "{}"); } catch { return {}; }
  }
  async function readPart(part) {
    if (!bundles.has(part.b)) bundles.set(part.b, LiveRound.bundle(part.b).catch((error) => { bundles.delete(part.b); throw error; }));
    return bundles.get(part.b);
  }
  async function questionPayload(question, part, lesson) {
    const [workbook] = LiveRound.workbook([question]), { accepted, ...visible } = workbook;
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
    if (cold && !choice) return;
    const revision = ++dispatchNumber, id = room;
    if (!id || closed || !lesson) return;
    const map = choice || mapping(deck)[index];
    dispatch = dispatch.catch(() => {}).then(async () => {
      if (revision !== dispatchNumber || id !== room || closed) return;
      const part = map && lesson.parts.find((p) => p.id === map.part);
      const ref = part ? `${lesson.tag}.${part.id}.${map.number}` : "";
      if (ref === sent) return;
      if (!ref) { await api("pause", {}); sent = ""; return; }
      const q = (await readPart(part)).find((x) => x.n === map.number);
      if (!q) throw new Error("Вопрос исчез из задания. Привяжите другой вопрос.");
      const payload = await questionPayload(q, part, lesson);
      if (revision !== dispatchNumber || id !== room || closed) return;
      await api("show", payload);
      cold = 0; links();
      sent = ref;
      notify(`Открыт вопрос №${map.number} из «${part.title}».`);
    }).catch((error) => notify(error.message));
    return dispatch;
  }
  function picker(box, deck, index, lesson, why = "") {
    if (!room || closed) { newRoom(lesson.title, () => picker(box, deck, index, lesson, why)); return; }
    const dialog = el("dialog"); dialog.className = "lp-dialog";
    const form = el("form"), title = el("h2", `Вопрос для слайда ${index + 1}`);
    const part = el("select"), number = el("select");
    part.setAttribute("aria-label", "Часть урока"); number.setAttribute("aria-label", "Вопрос");
    const saved = mapping(deck)[index];
    const supported = lesson.parts.filter((p) => p.b && p.q?.length);
    const selected = saved?.part || supported.find((p) => /практи/i.test(p.title))?.id;
    for (const item of supported) part.append(new Option(item.title, item.id, false, item.id === selected));
    const options = () => {
      const found = supported.find((p) => p.id === part.value);
      number.replaceChildren(...(found?.q || []).map((q) => new Option("№" + q.n, String(q.n), false, q.n === saved?.number)));
    };
    part.onchange = options; options();
    const partLabel = el("label", "Часть урока"), numberLabel = el("label", "Вопрос");
    partLabel.append(part); numberLabel.append(number);
    const primary = el("button", "Привязать и показать"); primary.className = "btn"; primary.type = "submit"; primary.disabled = !supported.length;
    const persist = (value) => {
      saveMapping(deck, index, value);
      dialog.close(); publish(deck, index, lesson, value);
    };
    form.append(title);
    if (why) form.append(el("p", why));
    form.append(partLabel, numberLabel, primary);
    if (saved) form.append(action("Снять привязку", () => persist(null)));
    form.append(action("Закрыть", () => dialog.close())); dialog.append(form);
    box.append(dialog); dialog.addEventListener("close", () => dialog.remove(), { once: true });
    form.onsubmit = (event) => { event.preventDefault(); if (part.value && number.value) persist({ part: part.value, number: Number(number.value) }); };
    dialog.showModal();
  }
  async function questionCandidates(lesson) {
    const parts = lesson.parts.filter((p) => p.b && p.q?.length);
    return (await Promise.all(parts.map(async (p) => (await readPart(p)).map((question) => ({ part: p.id, question }))))).flat();
  }
  async function recognize(box, deck, lesson, current, readText) {
    const index = current();
    if (!room || closed) { newRoom(lesson.title, () => recognize(box, deck, lesson, current, readText)); return; }
    const saved = mapping(deck)[index];
    if (saved) return publish(deck, index, lesson, saved);
    notify("Ищу вопрос по тексту слайда…");
    try {
      const text = await readText(index);
      if (!text.trim()) {
        if (box.isConnected && index === current()) picker(box, deck, index, lesson, "У слайда нет текстового слоя. Выберите вопрос вручную.");
        return;
      }
      const candidates = await questionCandidates(lesson);
      if (!box.isConnected || index !== current()) return;
      const match = SlideQuestionMatch.match(text, candidates);
      if (!match) { picker(box, deck, index, lesson, "Однозначного совпадения не нашлось. Выберите вопрос вручную."); return; }
      saveMapping(deck, index, match);
      return publish(deck, index, lesson, match);
    } catch {
      if (box.isConnected && index === current()) picker(box, deck, index, lesson, "Не удалось прочитать слайд или рабочую тетрадь. Можно выбрать вопрос вручную.");
    }
  }
  async function coldQuestions(lesson, part, deck, readText) {
    if (part) {
      const items = await readPart(part);
      return part.q.slice(0, 4).map(({ n }) => ({ part, question: items.find((q) => q.n === n) }));
    }
    if (!deck || !readText) return [];
    const slides = new Map();
    for (let i = 0; i < deck.n && slides.size < 4; i++) {
      const text = await readText(i);
      const number = /(?:холодный\s+старт|cold\s+start)\s*[·:—–-]?\s*(?:вопрос|question)\s*([1-4])\s*(?:из|of|\/)\s*4/i.exec(text)?.[1];
      if (number && !slides.has(number)) slides.set(number, text);
    }
    if (slides.size !== 4) return [];
    const candidates = await questionCandidates(lesson);
    return ["1", "2", "3", "4"].map((number) => {
      const match = SlideQuestionMatch.match(slides.get(number), candidates);
      return { part: lesson.parts.find((p) => p.id === match?.part),
        question: candidates.find((q) => q.part === match?.part && q.question.n === match.number)?.question };
    });
  }
  async function startCold(lesson, deck, readText) {
    if (!lesson) return;
    const part = coldPart(lesson);
    if (!room || closed) { newRoom(lesson.title, () => startCold(lesson, deck, readText)); return; }
    const id = room;
    ++dispatchNumber;
    try {
      await dispatch;
      notify("Готовлю четыре вопроса холодного старта…");
      const selected = await coldQuestions(lesson, part, deck, readText);
      if (selected.length !== 4 || selected.some((q) => !q.part || !q.question)) {
        throw new Error("Не удалось сопоставить все четыре вопроса холодного старта с рабочей тетрадью. Показать отдельный вопрос можно со слайда.");
      }
      const questions = await Promise.all(selected.map(({ part, question }) => questionPayload(question, part, lesson)));
      if (id !== room || closed) return;
      await api("cold", { questions });
      sent = null; cold = 1; activeNumber = null; links();
      await refresh();
      notify("Холодный старт открыт. Переключайте вопросы кнопкой «Следующий вопрос».");
    } catch (error) { notify(error.message); }
  }
  async function advance() {
    if (!room || !activeNumber || !cold || advancing) return;
    advancing = true; links();
    try {
      const step = cold;
      await api("advance", { number: activeNumber });
      activeNumber = null;
      if (step === 4) { cold = 0; notify("Холодный старт завершён."); }
      await refresh();
    } catch (error) { notify(error.message); }
    finally { advancing = false; links(); }
  }
  function attach(box, deck, lesson, current, readText) {
    if (!lesson || !SITE.adminKey()) return;
    const bar = el("div"); bar.className = "lp-control dk-bar";
    const pick = action("Показать с этого слайда", () => recognize(box, deck, lesson, current, readText));
    const manual = action("Выбрать вручную", () => picker(box, deck, current(), lesson));
    const next = action("Следующий вопрос", advance);
    next.hidden = true;
    const copy = action("Ссылка для учеников", copyLink);
    const monitor = el("a", "Монитор преподавателя"); monitor.target = "_blank"; monitor.rel = "noopener";
    const status = el("small"); status.setAttribute("role", "status");
    bar.append(pick, manual);
    if (coldPart(lesson) || deck.uploaded) bar.append(action("Холодный старт · 4 вопроса", () => startCold(lesson, deck, readText)));
    bar.append(next, copy, monitor, status); box.querySelector(".dk-bar").after(bar);
    deckUIs.set(box, { monitor, copy, status, deck, lesson, current, advance: next });
    links();
  }
  return { mount, attach, publish, startCold, coldPart, detach: (box) => deckUIs.delete(box) };
})();
