window.SlideMaterialPreview = (() => {
  const safe = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
  const privateNote = /^(?:teacher(?:’s|'s)?\s+note\b|заметка преподавателю)/iu;
  const privateLabel = /^(?:(?:правильный|correct)\s+)?(?:ответ|answer)\s*:/iu;
  const studentText = (text) => text.split("\n").filter((line) => !privateNote.test(line.trim())).join("\n");
  function bounds(item, viewport) {
    if (!item.str?.trim() || !Array.isArray(item.transform)) return null;
    const { pageX, pageY, pageWidth, pageHeight } = viewport.rawDims;
    const [x, y] = item.transform.slice(4);
    return {
      l: (x - pageX) / pageWidth * 100, r: (x - pageX + item.width) / pageWidth * 100,
      t: (1 - (y - pageY + item.height) / pageHeight) * 100,
      b: (1 - (y - pageY - item.height * .25) / pageHeight) * 100
    };
  }
  const intersects = (rect, b) => b && rect.x < b.r && rect.x + rect.w > b.l && rect.y < b.b && rect.y + rect.h > b.t;

  const imageURL = ({ format, image }) => `data:image/${format === "webp" ? "webp" : "jpeg"};base64,${image}`;
  async function crop(entry, rect) {
    const image = new Image();
    image.src = imageURL(entry);
    await image.decode();
    const x = Math.floor(image.naturalWidth * rect.x / 100);
    const y = Math.floor(image.naturalHeight * rect.y / 100);
    const w = Math.floor(image.naturalWidth * rect.w / 100);
    const h = Math.floor(image.naturalHeight * rect.h / 100);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const ratio = Math.min(1, 1000 / Math.max(w, h));
    canvas.width = Math.max(1, Math.round(w * ratio));
    canvas.height = Math.max(1, Math.round(h * ratio));
    context.drawImage(image, x, y, w, h, 0, 0, canvas.width, canvas.height);
    for (const quality of [.86, .68]) {
      const result = canvas.toDataURL("image/webp", quality);
      if (/^data:image\/webp;base64,/.test(result) && result.length <= 92000) return result;
      const jpeg = canvas.toDataURL("image/jpeg", quality);
      if (jpeg.length <= 92000) return jpeg;
    }
    throw Error("Фрагмент слишком большой. Выделите только график.");
  }
  function textHTML(text, underline) {
    return text.split("\n").filter(Boolean).map((line) => {
      const at = underline ? line.indexOf(underline) : -1;
      const html = at === -1 ? safe(line) : safe(line.slice(0, at)) + "<u>" + safe(underline) + "</u>" + safe(line.slice(at + underline.length));
      return `<p>${html}</p>`;
    }).join("");
  }

  const needsGraph = (text) => /\b(?:the|this|following)\s+(?:(?:bar|line|scatter)\s+)?(?:graph|chart|figure|table)\b|\b(?:graph|chart|figure|table)\s+(?:above|below)\b/i.test(text);
  const needsUnderline = (text) => /\bunderlined\s+(?:portion|text|phrase|sentence|word|claim)\b/i.test(text);
  const readDraft = (text) => SlidePracticeContent.parse(studentText(text));
  function requiredMaterial(draft) {
    const prompt = draft?.prompt || "";
    const labels = [];
    if (needsGraph(prompt)) labels.push("график");
    if (needsUnderline(prompt) && SlidePracticeContent.splitPrompt(prompt).underlineFrom === undefined) labels.push("подчёркнутую фразу");
    return labels.join(" и ");
  }
  const fingerprints = new WeakMap();
  async function fingerprint(value) {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  function version(deck, entry) {
    if (!fingerprints.has(entry)) {
      fingerprints.set(entry, fingerprint(JSON.stringify([deck.revision || deck.at, entry.image, entry.text?.items, entry.viewport])));
    }
    return fingerprints.get(entry);
  }
  const storageKey = (deck, index) => `lp-material:${deck.id}:${index}`;
  function saved(deck, index) {
    try { return JSON.parse(localStorage.getItem(storageKey(deck, index))); }
    catch { return null; }
  }
  async function assemble(entry, text, settings) {
    const { rect, alt, underline } = settings;
    let questionText = text;
    if (rect) {
      const dims = entry.viewport?.rawDims;
      if (entry.viewport?.rotation !== 0 || !dims?.pageHeight || !dims?.pageWidth || !entry.image) {
        throw Error("Для выделения нужен PDF с текстовым слоем в обычной ориентации.");
      }
      const { x, y, w, h } = rect;
      if (![x, y, w, h].every(Number.isFinite) || x < 0 || y < 0 || w < 1 || h < 1 ||
          x + w > 100 || y + h > 100 || w * h > 6000 || !alt) {
        throw Error("Проверьте границы фрагмента и добавьте описание графика.");
      }
      const items = entry.text.items;
      if (items.some((item) => (privateLabel.test(item.str.trim()) || privateNote.test(item.str.trim())) &&
          intersects(rect, bounds(item, entry.viewport)))) {
        throw Error("В выделение попадает ключ или заметка. Уменьшите область.");
      }
      const outside = items.filter((item) => !intersects(rect, bounds(item, entry.viewport)));
      // A column can start with the question on the same baseline as the passage.
      const columns = outside.flatMap((item) => {
        const b = bounds(item, entry.viewport);
        const startsQuestion = b && b.l > 46 && /^(?:which|what|how|according to|based on)\b/i.test(item.str.trim());
        return startsQuestion ? [{ str: "", hasEOL: true, height: 0 }, item] : [item];
      });
      questionText = SlidePracticeContent.pdfText(columns);
    }
    const draft = readDraft(questionText);
    if (!draft) throw Error("Вне фрагмента должны остаться вопрос и варианты ответа.");
    if ((!rect && needsGraph(draft.prompt)) || (!underline && needsUnderline(draft.prompt)) || (!rect && !underline)) {
      throw Error("Выделите нужный график и укажите подчёркнутую фразу, если на неё ссылается вопрос.");
    }
    const { passage, stem } = SlidePracticeContent.splitPrompt(draft.prompt);
    const lines = [...passage.split("\n"), ...stem.split("\n")];
    if (underline && (lines.reduce((count, line) => count + line.split(underline).length - 1, 0) !== 1)) {
      throw Error("Подчёркнутая фраза должна встречаться один раз в тексте или вопросе.");
    }
    const figure = rect ? `<figure><img alt="${safe(alt)}" src="${await crop(entry, rect)}"></figure>` : "";
    return { draft, stim: textHTML(passage, underline) + figure, stem: textHTML(stem, underline) };
  }
  async function prepare(deck, index, entry, draft, text) {
    const prior = saved(deck, index);
    if (entry?.image && prior?.settings && prior.revision === await version(deck, entry)) {
      return assemble(entry, text, prior.settings);
    }
    const missing = requiredMaterial(draft);
    if (missing) throw Error(entry?.image ? `Подготовьте ${missing} через «Материал слайда».`
      : "Фрагмент можно добавить из PDF с текстовым слоем.");
    return null;
  }
  const edgeNames = ["x", "y", "w", "h"];
  const rectFromFields = (fields) => Object.fromEntries(edgeNames.map((name) => [name, fields[name].valueAsNumber]));
  const clamp = (value) => Math.min(100, Math.max(0, value));
  function attachCropPicker(board, fields, status, changed, selected = "Область выбрана. Откройте предпросмотр для ученика.") {
    const image = board.querySelector("img"), outline = board.querySelector("[data-outline]");
    let drag;
    const draw = ({ x, y, w, h }) => {
      outline.hidden = ![x, y, w, h].every(Number.isFinite) || x < 0 || y < 0 || w < 1 || h < 1 || x + w > 100.001 || y + h > 100.001;
      if (!outline.hidden) Object.assign(outline.style, { left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` });
    };
    const point = (event) => {
      const { left, top, width, height } = image.getBoundingClientRect();
      return {
        x: Math.round(clamp((event.clientX - left) / width * 100) * 10),
        y: Math.round(clamp((event.clientY - top) / height * 100) * 10)
      };
    };
    const rectangle = (start, end) => ({
      x: Math.min(start.x, end.x) / 10, y: Math.min(start.y, end.y) / 10,
      w: Math.abs(start.x - end.x) / 10, h: Math.abs(start.y - end.y) / 10
    });
    const refresh = () => draw(rectFromFields(fields));
    board.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0 || !image.naturalWidth) return;
      board.setPointerCapture(event.pointerId);
      drag = { id: event.pointerId, start: point(event) };
      event.preventDefault();
    });
    board.addEventListener("pointermove", (event) => {
      if (drag?.id === event.pointerId) draw(rectangle(drag.start, point(event)));
    });
    board.addEventListener("pointerup", (event) => {
      if (drag?.id !== event.pointerId) return;
      const rect = rectangle(drag.start, point(event));
      drag = null;
      if (rect.w < 1 || rect.h < 1) {
        refresh();
        return;
      }
      for (const name of edgeNames) fields[name].value = rect[name];
      changed();
      status.textContent = selected;
    });
    board.addEventListener("lostpointercapture", () => { drag = null; refresh(); });
    return refresh;
  }
  function open(deck, index, readSlide, readText, opener) {
    const dialog = document.createElement("dialog");
    dialog.className = "lp-dialog lp-question-picker lp-material";
    dialog.setAttribute("aria-labelledby", "lp-material-title");
    dialog.innerHTML = `<form>
      <h2 id="lp-material-title">Материал слайда ${index + 1}</h2>
      <p>Перед сохранением сверьте, что на предпросмотре видны все данные задачи, а ключ и заметки остались за границей выделения.</p>
      <label><input name="chart" type="checkbox" disabled> Добавить график</label>
      <p data-crop-help hidden>Обведите график прямо на слайде. Поля ниже позволяют уточнить границы с клавиатуры.</p>
      <div class="lp-crop" aria-hidden="true" hidden><img alt="" draggable="false"><span data-outline hidden></span></div>
      <fieldset disabled>
        <legend>Границы выделения, %</legend>
        <label>Слева <input name="x" type="number" min="0" max="99" step="0.1" value="4" required></label>
        <label>Сверху <input name="y" type="number" min="0" max="99" step="0.1" value="35" required></label>
        <label>Ширина <input name="w" type="number" min="1" max="100" step="0.1" value="42" required></label>
        <label>Высота <input name="h" type="number" min="1" max="100" step="0.1" value="50" required></label>
        <label>Описание графика <input name="alt" type="text" maxlength="400" required></label>
      </fieldset>
      <label>Подчёркнутая фраза <input name="underline" type="text" maxlength="300"></label>
      <p role="status"></p><div class="lp-question-preview" hidden lang="en"></div>
      <div class="lp-control"><button class="btn ghost" type="submit">Предпросмотр для ученика</button>
        <button class="btn red" type="button" data-save disabled>Сохранить для этого слайда</button>
        <button class="btn ghost" type="button" data-back>Закрыть</button></div>
    </form>`;
    const form = dialog.querySelector("form"), fields = form.elements, preview = form.querySelector(".lp-question-preview");
    const status = form.querySelector('[role="status"]'), submit = form.querySelector('[type="submit"]');
    const save = form.querySelector("[data-save]"), fieldset = form.querySelector("fieldset");
    let approval, inputVersion = 0;
    const board = form.querySelector(".lp-crop"), help = form.querySelector("[data-crop-help]");
    const invalidatePreview = () => {
      ++inputVersion;
      board.hidden = help.hidden = fieldset.disabled = !fields.chart.checked;
      approval = null;
      save.disabled = true;
      preview.hidden = true;
      status.textContent = "";
      refreshCrop();
    };
    const refreshCrop = attachCropPicker(board, fields, status, invalidatePreview);
    submit.disabled = true;
    status.textContent = "Читаю слайд…";
    const source = Promise.all([readSlide(index), readText(index)]).then(async ([entry, text]) => {
      if (!entry?.image || !entry.text?.items?.length) throw Error("У слайда нет графики с текстовым слоем.");
      return { entry, text, revision: await version(deck, entry) };
    });
    source.then(({ entry, revision }) => {
      if (!dialog.open) return;
      const record = saved(deck, index);
      const prior = record?.revision === revision ? record.settings : null;
      if (prior && !inputVersion) {
        fields.chart.checked = !!prior.rect;
        if (prior.rect) for (const name of edgeNames) fields[name].value = prior.rect[name];
        fields.alt.value = prior.alt;
        fields.underline.value = prior.underline;
      }
      board.querySelector("img").src = imageURL(entry);
      fields.chart.disabled = false;
      invalidatePreview();
      submit.disabled = false;
    }).catch((err) => { if (dialog.open) status.textContent = err.message; });
    form.oninput = invalidatePreview;
    form.onsubmit = async (event) => {
      event.preventDefault();
      const requested = ++inputVersion;
      approval = null;
      save.disabled = true;
      preview.hidden = true;
      const rect = fields.chart.checked ? rectFromFields(fields) : null;
      const settings = { rect, alt: fields.alt.value.trim(), underline: fields.underline.value.trim() };
      status.textContent = "Готовлю предпросмотр…";
      try {
        const { entry, text, revision } = await source;
        const view = await assemble(entry, text, settings);
        if (!dialog.open || requested !== inputVersion) return;
        preview.innerHTML = view.stim + view.stem + '<ol type="A">' + view.draft.opts.map((opt) => `<li>${safe(opt)}</li>`).join("") + "</ol>";
        preview.hidden = false;
        approval = { revision, settings };
        status.textContent = "Сверьте предпросмотр со слайдом и сохраните материал.";
        save.disabled = false;
      } catch (err) { if (dialog.open && requested === inputVersion) status.textContent = err.message; }
    };
    save.onclick = () => {
      if (!approval) return;
      try {
        localStorage.setItem(storageKey(deck, index), JSON.stringify(approval));
        dialog.close("saved");
      } catch { status.textContent = "Браузер не сохранил материал."; }
    };
    form.querySelector("[data-back]").onclick = () => dialog.close();
    document.body.append(dialog);
    dialog.showModal();
    return new Promise((resolve) => dialog.addEventListener("close", () => {
      dialog.remove();
      if (opener.isConnected) opener.focus();
      resolve(dialog.returnValue === "saved");
    }, { once: true }));
  }
  const reference = async (material, answer) => "v" + (await fingerprint(JSON.stringify([material, answer || ""]))).slice(0, 9);
  return { open, prepare, readDraft, reference, requiredMaterial, attachCropPicker, rectFromFields };
})();
