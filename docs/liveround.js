// Launch an existing question set as a shared round. Only the teacher browser sends grading keys.
(function () {
  "use strict";
  const isLesson = () => /^lesson(?:-[a-z0-9]+)?$/.test(SITE.me());
  async function bundle(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw Error("Не удалось загрузить вопросы.");
    return JSON.parse(new TextDecoder().decode(await SITE.open(await response.arrayBuffer())));
  }
  // Typed-answer keys arrive as display text: «3/2», «3/2; 1.5», «x = 4», «.75 (or 3/4)», «−2 или 2».
  // Keep every piece that is a number the server can compare; a key with no number (for example «2√3») is graded as text.
  const NUMBER = /^[+-]?(?:\d+\/\d+|\d+(?:[.,]\d*)?|[.,]\d+)$/;
  function typedKeys(q) {
    const raw = [].concat(q.acc != null && String(q.acc).trim() ? q.acc : q.ans).filter((v) => v != null && String(v).trim()).map(String);
    const pieces = raw.flatMap((v) => v.split(/\s*(?:;|\||,\s+|\s+(?:или|or)\s+)\s*/i)).map((v) => v
      .normalize("NFKC").replace(/[−–—]/g, "-").replace(/[⁄∕]/g, "/")
      .replace(/\s*\([^()]*\)\s*/g, " ").replace(/^\s*[a-zа-я]\s*=\s*/i, "").replace(/^[≈~]\s*/, "").trim()).filter(Boolean);
    const numbers = [...new Set(pieces.filter((v) => NUMBER.test(v.replace(/\s/g, ""))).map((v) => v.replace(/\s/g, "")))];
    return numbers.length ? { type: "spr", accepted: numbers } : { type: "custom", accepted: (pieces.length ? pieces : raw).slice(0, 20).map((v) => v.slice(0, 64)) };
  }
  function workbook(items) {
    return items.map((q) => {
      const key = q.t === "mc" ? { type: "mc", accepted: [q.ans] } : typedKeys(q);
      return {
        prompt: (q.stim || "") + q.stem,
        passageLength: (q.stim || "").length,
        options: q.t === "mc" ? q.opts : [],
        // the student screen shows an input for both typed kinds; only the grading differs
        type: key.type === "mc" ? "mc" : "spr",
        keyType: key.type,
        accepted: key.accepted,
        meta: { n: q.n, sk: q.sk || null, d: q.d || null }   // where the question comes from; stays in the teacher's browser
      };
    });
  }
  function itemMeta(set, q, index) {
    const n = set.module ? index + 1 : q.meta?.n ?? index + 1;
    return { n: index + 1, ref: set.ref ? `${set.ref}.${n}` : null, sk: q.meta?.sk || null,
      d: q.meta?.d || null, type: q.type === "mc" ? "mc" : "spr" };
  }

  async function create(set, settings, questions, progress = "answered") {
    if (!set?.questions?.length || !questions.length) throw Error("Сначала выберите набор вопросов.");
    if (!["off", "answered", "module"].includes(progress) || progress === "module" && !set.module) throw Error("Выберите режим учёта в индексе.");
    questions = questions.map((q, i) => Object.hasOwn(q.meta || {}, "ref") ? q : { ...q, meta: itemMeta(set, q, i) });
    const sec = set.sec || (set.math ? "math" : "rw");
    const record = { title: set.title, sec, progress, items: questions.map(({ meta }) => meta) };
    if (progress === "module") record.module = set.questions.map((q, i) => itemMeta(set, q, i));
    const [encrypted, sealedRecord] = await Promise.all([
      SITE.sealBlob(questions.map(({ prompt, passageLength, options, type, meta }) => ({ prompt, passageLength, options, type, number: meta.n }))),
      SITE.sealBlob(record)
    ]);
    const result = await SITE.api("live?action=create", {
      method: "POST",
      body: JSON.stringify({
        title: set.title.slice(0, 160), set: "sealed:" + encrypted,
        keys: questions.map(({ type, keyType, accepted }) => ({ type: keyType || type, accepted })),
        settings: { ...settings, record: sealedRecord }
      })
    });
    if (!result.ok) throw Error(result.data?.error || "Не удалось создать раунд.");
    sessionStorage.setItem("live:" + result.data.round, JSON.stringify({ host: result.data.host }));
    location.href = "practice.html?live=" + result.data.round;
  }

  function questionNumbers(value, total) {
    const groups = value.trim().split(/\s*[,;]\s*/);
    const numbers = new Set();
    for (const group of groups) {
      const m = /^(\d+)(?:\s*[-–—]\s*(\d+))?$/.exec(group);
      if (!m) return [];
      const start = Number(m[1]), end = Number(m[2] || m[1]);
      if (start < 1 || end > total || end < start) return [];
      for (let n = start; n <= end; n++) numbers.add(n);
      if (numbers.size > 100) return [];
    }
    return [...numbers].sort((a, b) => a - b);
  }

  function configure(source, status) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("live_round_settings") || "{}"); } catch { /* defaults */ }
    const dialog = document.createElement("dialog");
    dialog.className = "live-settings";
    dialog.setAttribute("aria-labelledby", "live-settings-title");
    dialog.innerHTML = `<form>
      <h2 id="live-settings-title">Настроить живую практику</h2><p class="live-settings-title" data-title></p>
      <label data-module hidden>Модуль<select name="module"></select></label>
      <div class="live-range">
        <label>Номера вопросов<input name="numbers" type="text" required aria-describedby="live-range-hint" placeholder="Например, 3–7, 12, 18–21"></label>
        <button class="chip" type="button" data-all>Весь набор</button>
      </div>
      <p id="live-range-hint" class="hint" data-range></p>
      <fieldset class="live-index"><legend>Учёт в индексе прогресса</legend>
        <label><input type="radio" name="progress" value="off"><span><b>Не учитывать</b><small>Ответы останутся в истории урока.</small></span></label>
        <label><input type="radio" name="progress" value="answered"><span><b>Только ответы</b><small>В индекс войдут отправленные ответы. Пропуски не учитываются.</small></span></label>
        <label data-module-grade hidden><input type="radio" name="progress" value="module"><span><b>Как полный модуль пробника</b><small data-full-hint></small></span></label>
      </fieldset>
      <p class="hint live-index-note">Индекс обновится после завершения раунда.</p>
      <details class="live-more"><summary>Темп, Desmos и порядок вопросов</summary>
        <label class="live-setting-check"><input name="strict" type="checkbox"> Строго по времени</label>
        <label class="live-setting-check" data-self-paced><input name="selfPaced" type="checkbox"> Каждый ученик решает в своём темпе</label>
        <label data-seconds>Секунд на вопрос<input name="seconds" type="number" min="5" max="600" step="1" required></label>
        <p class="hint" data-mode></p>
        <label class="live-setting-check"><input name="calculator" type="checkbox"> Desmos и справочник формул</label>
        <label class="live-setting-check"><input name="shuffle" type="checkbox"> Перемешать выбранные вопросы</label>
        <p class="hint" data-duration></p></details>
      <p class="hint" role="status"></p>
      <div class="row live-actions"><button class="btn" type="submit">Создать раунд</button><button class="btn ghost" type="button" data-cancel>Отмена</button></div>
    </form>`;
    const form = dialog.querySelector("form"), fields = form.elements;
    const { numbers, module: moduleSelect, seconds, strict, selfPaced, calculator, shuffle, progress } = fields;
    const submit = form.querySelector('[type="submit"]'), message = dialog.querySelector('[role="status"]');
    const cancel = dialog.querySelector("[data-cancel]"), all = dialog.querySelector("[data-all]");
    let set = null, request = 0, busy = false;
    dialog.querySelector("[data-title]").textContent = source.title;
    seconds.value = Number(saved.seconds) || 45;
    strict.checked = saved.strict !== false;
    selfPaced.checked = saved.selfPaced !== false;
    shuffle.checked = saved.shuffle === true;
    progress.value = source.modules ? "off" : "answered";
    const range = (end) => end > 1 ? `1–${end}` : "1";

    function update() {
      const total = set?.questions.length || 0;
      const selected = questionNumbers(numbers.value, total);
      numbers.disabled = all.disabled = !total || busy;
      const error = total && !selected.length ? `Укажите номера от 1 до ${total}, например 3–7, 12. Максимум 100 вопросов.` : "";
      numbers.setCustomValidity(error);
      numbers.setAttribute("aria-invalid", String(!!error));
      dialog.querySelector("[data-range]").textContent = error || (total ? `Выбрано ${selected.length} из ${total}. Можно указать диапазон и отдельные номера через запятую.` : "");
      all.textContent = source.modules ? "Весь модуль" : total > 100 ? "Первые 100" : "Весь набор";
      const full = dialog.querySelector("[data-module-grade]");
      full.hidden = !source.modules;
      full.querySelector("input").disabled = !set?.module;
      if (set && !set.module && progress.value === "module") progress.value = "answered";
      const excluded = Math.max(0, total - selected.length);
      dialog.querySelector("[data-full-hint]").textContent = `С весом пробника. В индекс войдут все ${total} вопросов, включая пропуски${excluded ? ` и ${excluded} вне выбора` : ""}. Учитываются ученики, отправившие хотя бы один ответ.`;
      const independent = !strict.checked && selfPaced.checked;
      dialog.querySelector("[data-self-paced]").hidden = strict.checked;
      dialog.querySelector("[data-seconds]").hidden = seconds.disabled = independent;
      dialog.querySelector("[data-mode]").textContent = strict.checked
        ? "Следующий вопрос открывается по таймеру."
        : independent ? "Ученики сами выбирают вопросы и меняют ответы до завершения раунда."
        : "Вы переводите класс дальше кнопкой «Следующий вопрос».";
      const duration = selected.length * Number(seconds.value);
      dialog.querySelector("[data-duration]").textContent = independent || !selected.length ? "" : `По таймеру: ${Math.floor(duration / 60)} мин ${duration % 60} с`;
      submit.disabled = busy || !selected.length;
      return selected;
    }
    function use(next) {
      set = next;
      if (next.module) dialog.querySelector("[data-title]").textContent = `${source.title} · ${next.sec === "math" ? "Math" : "Reading and Writing"}`;
      const max = Math.min(next.questions.length, 100);
      numbers.value = range(Math.min(next.defaultCount ?? (Number(saved.count) || 10), max));
      calculator.checked = next.math === true;
      update();
    }
    async function loadModule() {
      const attempt = ++request;
      set = null; numbers.value = ""; update();
      message.textContent = "Загружаю вопросы модуля…";
      try {
        const next = await source.load(moduleSelect.value);
        if (attempt !== request || !dialog.open) return;
        if (!next?.questions?.length) throw Error("В этом модуле нет вопросов.");
        use(next); message.textContent = "";
      } catch (error) {
        if (attempt === request && dialog.open) message.textContent = error.message + " Выберите другой модуль или откройте окно заново.";
      }
    }
    all.onclick = () => { numbers.value = range(Math.min(100, set.questions.length)); update(); numbers.focus(); };
    form.oninput = update;
    cancel.onclick = () => { if (!busy) dialog.close(); };
    dialog.oncancel = (event) => { if (busy) event.preventDefault(); };
    dialog.onclose = () => { request++; dialog.remove(); };
    form.onsubmit = async (event) => {
      event.preventDefault();
      const selected = update();
      if (busy || !selected.length || !form.reportValidity()) return;
      const limit = seconds.valueAsNumber, mode = progress.value;
      const preferences = { count: selected.length, seconds: Number.isInteger(limit) && limit >= 5 && limit <= 600 ? limit : 45,
        strict: strict.checked, selfPaced: selfPaced.checked, shuffle: shuffle.checked };
      const questions = selected.map((n) => {
        const q = set.questions[n - 1];
        return { ...q, meta: itemMeta(set, q, n - 1) };
      });
      if (shuffle.checked) {
        for (let index = questions.length - 1; index > 0; index--) {
          const other = Math.floor(Math.random() * (index + 1));
          [questions[index], questions[other]] = [questions[other], questions[index]];
        }
      }
      busy = moduleSelect.disabled = cancel.disabled = true;
      update();
      message.textContent = "Создаю раунд…";
      try {
        try { localStorage.setItem("live_round_settings", JSON.stringify(preferences)); } catch { /* optional */ }
        await create(set, { seconds: preferences.seconds, strict: preferences.strict,
          selfPaced: !strict.checked && selfPaced.checked, calculator: calculator.checked }, questions, mode);
      } catch (error) {
        message.textContent = error.message;
        busy = moduleSelect.disabled = cancel.disabled = false;
        update();
      }
    };
    document.body.append(dialog);
    status.textContent = "";
    if (source.modules) {
      dialog.querySelector("[data-module]").hidden = false;
      for (const section of source.modules) {
        const group = document.createElement("optgroup"); group.label = section.label;
        group.append(...section.options.map((opt) => new Option(opt.label, opt.value)));
        moduleSelect.append(group);
      }
      moduleSelect.value = source.selected;
      moduleSelect.onchange = loadModule;
      update();
      dialog.showModal();
      loadModule();
    } else { use(source); dialog.showModal(); }
  }
  function mount(anchor, selection) {
    if (!isLesson()) return;
    const target = document.getElementById(anchor);
    if (!target) return;
    const existing = document.getElementById("live-" + anchor);
    if (existing) return existing;
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
        if (!set?.questions?.length && !set?.modules?.length) throw Error("Сначала выберите набор вопросов.");
        configure(set, status);
      } catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    };
    target.after(button, status);
    return button;
  }
  window.LiveRound = { bundle, workbook, mount, create };
})();
