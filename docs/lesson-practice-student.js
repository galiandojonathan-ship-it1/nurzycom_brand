(() => {
  const room = new URLSearchParams(location.search).get("lessonRoom");
  if (!room) return;

  const letters = ["A", "B", "C", "D"];
  const main = document.querySelector("main");
  main.classList.add("lp-student-main");
  main.innerHTML = `<section class="wrap lp-student">
    <header class="lp-session">
      <h1>Практика урока</h1>
      <p role="status" id="lp-status">Войдите под своим учебным аккаунтом.</p>
    </header>
    <section class="lp-question" aria-labelledby="lp-number" hidden>
      <header class="lp-question-head"><h2 id="lp-number" tabindex="-1"></h2></header>
      <div class="lp-text">
        <div class="qhtml lp-passage" lang="en"></div>
        <div class="lp-task">
          <div class="qhtml lp-stem" lang="en"></div>
          <div class="row lp-hints" hidden>
            <button type="button" class="btn ghost" data-hint="1">Подсказка: словарь</button>
            <button type="button" class="btn ghost" data-hint="2">Убрать два неверных варианта</button>
          </div>
          <p data-tip class="hint" role="status" hidden></p>
          <form>
            <fieldset class="lp-fieldset"><legend>Ваш ответ</legend><div class="lp-options"></div></fieldset>
            <div class="lp-submit"><button class="btn" type="submit">Отправить ответ</button><p data-received role="status"></p></div>
          </form>
        </div>
      </div>
    </section>
  </section>`;

  const status = main.querySelector("#lp-status"), section = main.querySelector(".lp-question");
  const heading = section.querySelector("h2"), passage = section.querySelector(".lp-passage"), stem = section.querySelector(".lp-stem");
  const form = section.querySelector("form"), options = section.querySelector(".lp-options");
  const hintRow = section.querySelector(".lp-hints"), hintButtons = [...hintRow.querySelectorAll("button")];
  const tip = section.querySelector("[data-tip]"), received = section.querySelector("[data-received]");
  const send = form.querySelector('[type="submit"]');
  let identity, member, current = null, item, opened = false, closed = false, pending = false, timer, polling = false;
  let attempt, allowed = 0, removed = [], submitting = false;
  const path = (action) => "lesson-practice?room=" + encodeURIComponent(room) + "&action=" + action;
  async function call(action, data) {
    const args = data ? { method: "POST", body: JSON.stringify(data) } : {};
    const result = await SITE.api(path(action) + "&account=" + encodeURIComponent(identity.id) + (action === "state" && current !== null ? "&number=" + current : ""),
      { ...args, headers: { "x-practice-token": member } });
    if (!result.ok) throw Object.assign(new Error(result.data?.error || "Проверьте связь с уроком."), { status: result.status });
    return result.data;
  }
  async function join() {
    const options = { method: "POST", headers: { "x-sync": identity.tok }, body: JSON.stringify({ account: identity.id }) };
    let result = await SITE.api(path("join"), options);
    if (result.status === 428 && await SITE.claimPracticeIdentity()) result = await SITE.api(path("join"), options);
    if (!result.ok) throw Object.assign(new Error(result.data?.error || "Не удалось подключиться."), { status: result.status });
    member = result.data.member;
  }
  function render() {
    const answered = !!attempt?.answer, used = attempt?.hints || 0;
    section.dataset.dictionary = String(!!(allowed & used & 1) && !answered);
    tip.hidden = section.dataset.dictionary !== "true";
    if (tip.hidden) window.DICT?.hide();
    if (!tip.textContent) tip.textContent = "Выделите незнакомое английское слово, чтобы открыть словарь.";
    hintButtons.forEach((button) => {
      const hint = Number(button.dataset.hint);
      button.hidden = answered || !(allowed & hint) || (hint === 2 && (item.type !== "mc" || item.graded === false));
      button.disabled = !opened || !!(used & hint) || pending;
    });
    hintRow.hidden = hintButtons.every((button) => button.hidden);
    options.querySelectorAll("input").forEach((input) => {
      const eliminated = removed.includes(input.value);
      input.disabled = !opened || answered || submitting || eliminated;
      if (eliminated) input.checked = false;
      if (answered && input.type === "radio") input.checked = input.value === attempt.answer;
      if (answered && input.type === "text") input.value = attempt.answer;
      const label = input.closest("label");
      label?.classList.toggle("lp-eliminated", eliminated);
      const flag = label?.querySelector(".lp-eliminated-label");
      if (flag) flag.hidden = !eliminated;
    });
    send.disabled = !opened || answered || submitting;
    if (answered) {
      const message = `Ответ принят · ${attempt.answer} · ${Math.round(attempt.ms / 1000)} с`;
      if (received.textContent !== message) received.textContent = message;
    }
  }
  function question(state, snapshot) {
    current = state.current; item = snapshot; opened = false; attempt = state.attempt;
    section.hidden = false;
    status.textContent = state.title;
    heading.textContent = state.cold ? `Холодный старт · ${state.cold}/4` : "Вопрос " + current;
    const boundary = item.passageLength;
    const separated = Number.isInteger(boundary) && boundary >= 0 && boundary <= item.prompt.length;
    passage.innerHTML = separated ? item.prompt.slice(0, boundary) : "";
    stem.innerHTML = separated ? item.prompt.slice(boundary) : item.prompt;
    passage.hidden = !passage.innerHTML.trim();
    section.classList.toggle("lp-no-passage", passage.hidden);
    received.textContent = "";
    options.replaceChildren();
    if (item.type === "mc") {
      item.options.forEach((content, i) => {
        const row = document.createElement("label");
        row.className = "lp-choice";
        const radio = document.createElement("input");
        Object.assign(radio, { type: "radio", name: "answer", required: true, value: letters[i] });
        const badge = document.createElement("span"); badge.className = "lp-letter"; badge.textContent = letters[i];
        const caption = document.createElement("span"); caption.className = "qhtml"; caption.lang = "en";
        caption.innerHTML = content;
        const flag = document.createElement("small"); flag.className = "lp-eliminated-label"; flag.textContent = "Исключено"; flag.hidden = true;
        row.append(radio, badge, caption, flag);
        options.append(row);
      });
    } else {
      const input = document.createElement("input");
      Object.assign(input, { type: "text", name: "answer", required: true, maxLength: 64, inputMode: "decimal", autocomplete: "off" });
      input.setAttribute("aria-label", "Ваш ответ");
      options.append(input);
    }
    heading.focus();
  }
  async function poll() {
    if (polling || closed) return;
    clearTimeout(timer); polling = true;
    try {
      if (!member) await join();
      const state = await call("state");
      if (state.closed || !state.current) {
        current = null; section.hidden = true; closed = state.closed;
        status.textContent = closed ? "Преподаватель завершил урок." : "Ждём следующий вопрос от преподавателя.";
        window.DICT?.hide();
        return;
      }
      if (state.snapshot && state.current !== current) {
        const snapshot = await SITE.unsealBlob(state.snapshot);
        if (snapshot.type === "mc" && snapshot.options.length !== letters.length) throw new Error("Неверные варианты ответа.");
        question(state, snapshot);
      }
      if (status.textContent !== state.title) status.textContent = state.title;
      if (!attempt?.answer) attempt = state.attempt;
      if (!attempt && !opened) {
        const number = current;
        await call("open", { number });
      }
      opened = true;
      allowed = state.hints; removed = state.removed || [];
      render();
    } catch (error) {
      status.textContent = error.message;
      if (error.status === 403 || error.status === 404) { closed = true; section.hidden = true; }
    } finally {
      polling = false;
      if (!closed) timer = setTimeout(poll, document.hidden ? 15000 : current ? 3000 : 5000);
    }
  }
  form.onsubmit = async (event) => {
    event.preventDefault();
    if (!opened || submitting || attempt?.answer) return;
    const number = current, answer = new FormData(form).get("answer");
    submitting = true; render();
    try {
      const result = await call("answer", { number, answer });
      if (current === number) attempt = { ...attempt, ...result };
    } catch (error) { received.textContent = error.message; }
    finally { submitting = false; if (current === number) render(); }
  };
  hintRow.onclick = async (event) => {
    const button = event.target.closest("[data-hint]");
    if (!button || pending || !opened || attempt?.answer) return;
    const number = current, hint = Number(button.dataset.hint);
    pending = true; render();
    try {
      const result = await call("hint", { number, hint });
      if (current === number) {
        attempt = { ...attempt, hints: (attempt?.hints || 0) | hint };
        if (result.removed) removed = result.removed;
      }
    } catch (error) { received.textContent = error.message; }
    finally { pending = false; if (current === number) render(); }
  };
  document.addEventListener("visibilitychange", () => { if (!document.hidden && identity) poll(); });
  SITE.ready.then(async () => {
    identity = await SITE.practiceIdentity();
    if (!identity) { status.textContent = "Для этого урока нужен личный учебный логин. Выйдите и войдите под своим аккаунтом."; return; }
    status.textContent = "Подключаюсь к уроку…";
    poll();
  });
})();
