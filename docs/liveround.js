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
  async function create(set, settings, questions) {
    if (!set?.questions?.length) throw Error("Сначала выберите набор вопросов.");
    const encrypted = await SITE.sealBlob(questions.map(({ prompt, passageLength, options, type }) => ({ prompt, passageLength, options, type })));
    const result = await SITE.api("live?action=create", {
      method: "POST",
      body: JSON.stringify({
        title: set.title.slice(0, 160), set: "sealed:" + encrypted,
        keys: questions.map(({ type, keyType, accepted }) => ({ type: keyType || type, accepted })),
        settings
      })
    });
    if (!result.ok) throw Error(result.data?.error || "Не удалось создать раунд.");
    sessionStorage.setItem("live:" + result.data.round, JSON.stringify({ host: result.data.host }));
    // for the round record the lesson account saves at the end (livepractice.js): course ids, skills and levels of the questions
    try { localStorage.setItem("lr_meta_" + result.data.round, JSON.stringify({ title: set.title, at: Date.now(), sec: set.sec || (set.math ? "math" : "rw"),
      items: questions.map((q) => ({ ref: set.ref && q.meta && q.meta.n != null ? `${set.ref}.${q.meta.n}` : null, sk: (q.meta && q.meta.sk) || null, d: (q.meta && q.meta.d) || null, type: q.type === "mc" ? "mc" : "spr" })) })); } catch { /* the round runs without it */ }
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
      <label class="live-setting-check"><input name="strict" type="checkbox"> Строго по времени</label>
      <label class="live-setting-check" data-self-paced><input name="selfPaced" type="checkbox"> Каждый ученик решает в своём темпе</label>
      <label data-seconds>Секунд на вопрос<input name="seconds" type="number" min="5" max="600" step="1" required></label>
      <p class="hint" data-mode></p>
      <label class="live-setting-check"><input name="calculator" type="checkbox"> Desmos и справочник формул</label>
      <label class="live-setting-check"><input name="shuffle" type="checkbox"> Перемешать выбранные вопросы</label>
      <p class="hint" data-duration></p><p class="hint" role="status"></p>
      <div class="row"><button class="btn" type="submit">Создать раунд</button><button class="btn ghost" type="button" data-cancel>Отмена</button></div>
    </form>`;
    const form = dialog.querySelector("form"), fields = form.elements;
    const first = fields.namedItem("first"), count = fields.namedItem("count");
    const seconds = fields.namedItem("seconds"), strict = fields.namedItem("strict");
    const selfPaced = fields.namedItem("selfPaced"), calculator = fields.namedItem("calculator");
    const shuffle = fields.namedItem("shuffle");
    dialog.querySelector("[data-title]").textContent = set.title;
    first.max = String(set.questions.length);
    count.value = Math.min(set.defaultCount ?? (Number(saved.count) || 10), set.questions.length, 100);
    seconds.value = Number(saved.seconds) || 45;
    strict.checked = saved.strict !== false;
    selfPaced.checked = saved.selfPaced !== false;
    calculator.checked = set.math === true;
    function update() {
      count.max = String(Math.min(100, Math.max(1, set.questions.length - Number(first.value) + 1)));
      if (Number(count.value) > Number(count.max)) count.value = count.max;
      const independent = !strict.checked && selfPaced.checked;
      dialog.querySelector("[data-self-paced]").hidden = strict.checked;
      dialog.querySelector("[data-seconds]").hidden = seconds.disabled = independent;
      dialog.querySelector("[data-mode]").textContent = strict.checked
        ? "Следующий вопрос открывается по таймеру. Ответ можно менять до конца времени на вопрос."
        : independent ? "Ученики сами выбирают вопросы и меняют ответы до завершения раунда."
        : "После сигнала можно продолжать отвечать. Вы переводите весь класс дальше кнопкой «Следующий вопрос».";
      const duration = Number(count.value) * Number(seconds.value);
      dialog.querySelector("[data-duration]").textContent = independent ? "" : "По таймеру: " + Math.floor(duration / 60) + " мин " + duration % 60 + " с";
    }
    form.oninput = update;
    dialog.querySelector("[data-cancel]").onclick = () => dialog.close();
    dialog.onclose = () => dialog.remove();
    form.onsubmit = async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const limit = seconds.valueAsNumber;
      const preferences = { count: Number(count.value), seconds: Number.isInteger(limit) && limit >= 5 && limit <= 600 ? limit : 45,
        strict: strict.checked, selfPaced: selfPaced.checked };
      set.questions.forEach((q, i) => { q.meta = Object.assign({ n: i + 1 }, q.meta || {}); if (q.meta.n == null) q.meta.n = i + 1; });   // position in the set when the bundle has no number
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
        await create(set, { seconds: preferences.seconds, strict: preferences.strict,
          selfPaced: !strict.checked && selfPaced.checked, calculator: calculator.checked }, questions);
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
        if (!set?.questions?.length) throw Error("Сначала выберите набор вопросов.");
        configure(set, status);
      } catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    };
    target.after(button, status);
    return button;
  }
  window.LiveRound = { bundle, workbook, mount, create };
})();
