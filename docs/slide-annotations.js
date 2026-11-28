window.SlideAnnotations = (() => {
  const tools = { highlight: "Маркер", underline: "Подчёркивание", outline: "Рамка" };
  const validBox = ({ x, y, w, h }) => [x, y, w, h].every(Number.isFinite) && x >= 0 && y >= 0 &&
    w >= 1 && h >= 1 && x + w <= 100.001 && y + h <= 100.001;
  function draw(layer, marks) {
    layer.replaceChildren(...marks.map(({ kind, rect }) => {
      const span = document.createElement("span");
      span.className = `annotation annotation-${kind}`;
      const { x, y, w, h } = rect;
      Object.assign(span.style, { left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` });
      return span;
    }));
  }
  async function fingerprint(bytes) {
    const value = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(value), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  function create(box, deck) {
    const edit = box.querySelector("[data-annotation-edit]"), reveal = box.querySelector("[data-annotation-next]"), hide = box.querySelector("[data-annotation-hide]");
    const frame = box.querySelector(".dk-frame"), image = frame.querySelector("img");
    const layer = document.createElement("div"); layer.className = "annotation-layer annotation-screen";
    layer.setAttribute("aria-hidden", "true"); frame.insertBefore(layer, frame.querySelector(".dk-text"));
    let marks = [], shown = 0, key, sequence = 0, ratio;
    const fit = () => {
      if (!ratio) return;
      const width = Math.min(frame.clientWidth, frame.clientHeight * ratio);
      layer.style.width = `${width}px`;
      layer.style.height = `${width / ratio}px`;
    };
    const observer = new ResizeObserver(fit); observer.observe(frame);
    function render() {
      edit.disabled = !key;
      reveal.hidden = shown >= marks.length;
      reveal.textContent = shown ? `Следующая пометка · ${shown + 1}/${marks.length}` : `Показать пометки · ${marks.length}`;
      hide.hidden = !shown;
      draw(layer, marks.slice(0, shown));
    }
    reveal.onclick = () => {
      shown++; render();
      if (reveal.hidden) hide.focus();
    };
    hide.onclick = () => { shown = 0; render(); reveal.focus(); };
    function reset() {
      ++sequence; key = null; ratio = null; shown = 0; marks = []; render();
    }
    async function showSlide(signature) {
      const current = sequence;
      try {
        const [hash] = await Promise.all([signature, image.decode()]);
        if (current !== sequence) return;
        key = `lp-annotations:${deck.id}:${hash}`;
        ratio = image.naturalWidth / image.naturalHeight;
        try {
          const saved = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(saved)) marks = saved.filter((mark) => mark?.rect && Object.hasOwn(tools, mark.kind) && validBox(mark.rect));
        } catch { /* The editor will report any storage error when saving. */ }
        fit(); render();
      } catch { /* Keep the annotation tools disabled for an unavailable slide. */ }
    }
    edit.onclick = () => {
      if (!key) return;
      const dialog = document.createElement("dialog");
      dialog.className = "lp-dialog lp-question-picker annotation-editor";
      dialog.setAttribute("aria-labelledby", "annotation-title");
      dialog.innerHTML = `<h2 id="annotation-title">Пометки на слайде</h2>
        <p>Показывай пометки по одной во время демонстрации экрана.</p>
        <form><div class="lp-crop"><img alt="Предпросмотр слайда" draggable="false"><div class="annotation-layer" aria-hidden="true"></div><span data-outline hidden></span></div>
        <label>Вид пометки <select name="kind">${Object.entries(tools).map(([key, label]) => `<option value="${key}">${label}</option>`).join("")}</select></label>
        <fieldset><legend>Обведи область на слайде или задай границы в процентах</legend>
        ${[["x", "Слева", 20], ["y", "Сверху", 30], ["w", "Ширина", 35], ["h", "Высота", 8]].map(([name, label, value]) => `<label>${label}<input type="number" name="${name}" value="${value}" step="0.1" min="${name === "w" || name === "h" ? 1 : 0}" max="100" required></label>`).join("")}</fieldset>
        <div class="lp-control"><button class="btn" type="submit">Добавить пометку</button><button class="btn ghost" type="button" data-close>Закрыть</button></div>
        <p role="status"></p></form><ol></ol>`;
      const form = dialog.querySelector("form"), board = form.querySelector(".lp-crop"), list = dialog.querySelector("ol");
      const status = form.querySelector("[role=status]"), preview = board.querySelector(".annotation-layer");
      const { attachCropPicker, rectFromFields } = SlideMaterialPreview;
      const refresh = attachCropPicker(board, form.elements, status, () => {}, "Область выбрана. Добавь пометку.");
      board.querySelector("img").src = image.src;
      const redraw = () => {
        draw(preview, marks);
        list.replaceChildren(...marks.map(({ kind }, i) => {
          const row = document.createElement("li"), remove = document.createElement("button");
          remove.type = "button"; remove.className = "btn ghost"; remove.textContent = "Удалить";
          remove.setAttribute("aria-label", `Удалить пометку ${i + 1}`);
          remove.onclick = () => { save(marks.filter((_, index) => index !== i)); form.querySelector("[type=submit]").focus(); };
          row.append(tools[kind], remove); return row;
        }));
      };
      function save(next) {
        try { localStorage.setItem(key, JSON.stringify(next)); }
        catch { status.textContent = "Браузер не сохранил пометки. Проверь доступное место."; return; }
        marks = next; shown = 0; render(); redraw(); status.textContent = "Пометки сохранены.";
      }
      form.addEventListener("input", refresh);
      form.onsubmit = (event) => {
        event.preventDefault();
        const kind = form.elements.kind.value, rect = rectFromFields(form.elements);
        if (!validBox(rect)) { status.textContent = "Область должна целиком помещаться на слайде."; return; }
        save([...marks, { kind, rect }]);
      };
      dialog.querySelector("[data-close]").onclick = () => dialog.close();
      dialog.addEventListener("close", () => { dialog.remove(); if (edit.isConnected) edit.focus(); }, { once: true });
      document.body.append(dialog); dialog.showModal(); redraw(); refresh();
    };
    reset();
    return { reset, showSlide, destroy() { reset(); observer.disconnect(); } };
  }
  return { create, fingerprint };
})();
