// Launch an existing question set as a shared round. Only the teacher browser sends grading keys.
(function () {
  "use strict";
  const isLesson = () => /^lesson(?:-[a-z0-9]+)?$/.test(SITE.me());
  async function bundle(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw Error("Не удалось загрузить вопросы.");
    return JSON.parse(new TextDecoder().decode(await SITE.open(await response.arrayBuffer())));
  }
  function workbook(items) {
    return items.map((q) => ({
      prompt: (q.stim || "") + q.stem,
      options: q.t === "mc" ? q.opts : [],
      type: q.t === "mc" ? "mc" : "spr",
      accepted: q.t === "mc" ? [q.ans] : [].concat(q.acc || q.ans).map(String)
    }));
  }
  async function create(set, settings, questions) {
    if (!set?.questions?.length) throw Error("Сначала выберите набор вопросов.");
    const encrypted = await SITE.sealBlob(questions.map(({ prompt, options, type }) => ({ prompt, options, type })));
    const result = await SITE.api("live?action=create", {
      method: "POST",
      body: JSON.stringify({
        title: set.title.slice(0, 160), set: "sealed:" + encrypted,
        keys: questions.map(({ type, accepted }) => ({ type, accepted })),
        settings
      })
    });
    if (!result.ok) throw Error(result.data?.error || "Не удалось создать раунд.");
    sessionStorage.setItem("live:" + result.data.round, JSON.stringify({ host: result.data.host }));
    location.href = "practice.html?live=" + result.data.round;
  }
  function configure(set, status) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("live_round_settings") || "{}"); } catch { /* defaults */ }
    const dialog = document.createElement("dialog");
    dialog.className = "live-settings";
    dialog.setAttribute("aria-labelledby", "live-settings-title");
    dialog.innerHTML = `<form>
      <h2 id="live-settings-title">Настроить живую практику</h2><p data-title></p>
      <label>Начать с вопроса<input name="first" type="number" min="1" step="1" value="1" required></label>
      <label>Количество вопросов<input name="count" type="number" min="1" step="1" required></label>
      <label>Секунд на вопрос<input name="seconds" type="number" min="5" max="600" step="1" required></label>
      <label class="live-setting-check"><input name="strict" type="checkbox"> Строго по времени</label>
      <p class="hint" data-mode></p>
      <label class="live-setting-check"><input name="shuffle" type="checkbox"> Перемешать выбранные вопросы</label>
      <p class="hint" data-duration></p><p class="hint" role="status"></p>
      <div class="row"><button class="btn" type="submit">Создать раунд</button><button class="btn ghost" type="button" data-cancel>Отмена</button></div>
    </form>`;
    const form = dialog.querySelector("form"), fields = form.elements;
    const first = fields.namedItem("first"), count = fields.namedItem("count");
    const seconds = fields.namedItem("seconds"), strict = fields.namedItem("strict");
    const shuffle = fields.namedItem("shuffle");
    dialog.querySelector("[data-title]").textContent = set.title;
    first.max = String(set.questions.length);
    count.value = Math.min(Number(saved.count) || 10, set.questions.length, 100);
    seconds.value = Number(saved.seconds) || 45;
    strict.checked = saved.strict !== false;
    function update() {
      count.max = String(Math.min(100, Math.max(1, set.questions.length - Number(first.value) + 1)));
      if (Number(count.value) > Number(count.max)) count.value = count.max;
      dialog.querySelector("[data-mode]").textContent = strict.checked
        ? "Когда время выйдет, следующий вопрос откроется автоматически. Поздний ответ не принимается."
        : "После сигнала можно продолжать отвечать. Вы переводите весь класс дальше кнопкой «Следующий вопрос».";
      const duration = Number(count.value) * Number(seconds.value);
      dialog.querySelector("[data-duration]").textContent = "По таймеру: " + Math.floor(duration / 60) + " мин " + duration % 60 + " с";
    }
    form.oninput = update;
    dialog.querySelector("[data-cancel]").onclick = () => dialog.close();
    dialog.onclose = () => dialog.remove();
    form.onsubmit = async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const preferences = { count: Number(count.value), seconds: Number(seconds.value), strict: strict.checked };
      const questions = set.questions.slice(Number(first.value) - 1, Number(first.value) - 1 + preferences.count);
      if (shuffle.checked) {
        for (let index = questions.length - 1; index > 0; index--) {
          const other = Math.floor(Math.random() * (index + 1));
          [questions[index], questions[other]] = [questions[other], questions[index]];
        }
      }
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        try { localStorage.setItem("live_round_settings", JSON.stringify(preferences)); } catch { /* The round can run without saved preferences. */ }
        await create(set, { seconds: preferences.seconds, strict: preferences.strict }, questions);
      } catch (error) {
        dialog.querySelector('[role="status"]').textContent = error.message;
        submit.disabled = false;
      }
    };
    document.body.append(dialog);
    update();
    status.textContent = "";
    dialog.showModal();
  }
  function mount(anchor, selection) {
    if (!isLesson()) return;
    const target = document.getElementById(anchor);
    if (!target || document.getElementById("live-" + anchor)) return;
    const button = document.createElement("button");
    button.id = "live-" + anchor;
    button.type = "button";
    button.className = "btn";
    button.textContent = "Живая практика";
    const status = document.createElement("p");
    status.className = "hint";
    status.setAttribute("role", "status");
    button.onclick = async () => {
      button.disabled = true;
      status.textContent = "Готовлю вопросы…";
      try {
        const set = await selection();
        if (!set?.questions?.length) throw Error("Сначала выберите набор вопросов.");
        configure(set, status);
      } catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    };
    target.after(button, status);
  }
  window.LiveRound = { bundle, workbook, mount, create };
})();
