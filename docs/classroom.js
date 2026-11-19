// «Пульт урока» (classroom.html, 2026-11-16, Nurassyl: «prepare a space where I can put my presentations on lesson account,
// enhance its UI/UX since it is now more interactive live-lesson platform»): the lesson account's home page.
//  · Сейчас: start a lesson with one tap (the names of prepared reviews and recent groups), or see the running one and end it.
//  · Разбор ошибок: the reviews prepared on the teacher page («Подготовить урок» / «Показать на уроке»), opened in lsmist.js.
//  · Презентации и материалы: a tile per lesson; its presentation (a PDF imported by an administrator, or the existing data/decks.bin library),
//    its workbook parts and its words. A presentation opens full screen with a board over the slide.
//  · Слова с уроков: words marked in lessons and whether they are in the deck «VL» yet (filled every two days by /lesson-review).
//  · Прошлые уроки: the last finished lessons of this account.
// Students never see this page: it is not in the menu and it shows nothing without the lesson login.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pl = (n, a, b, c) => { const m = n % 100, d = n % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c; };
  const day = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const time = (t) => new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const initials = (n) => String(n || "").split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + ".").join(" ");
  const store = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const C = { lessons: [], vocab: null, decks: [], course: store("cr_course") || "V", open: null, uploaded: [], lastUpload: null, deckBusy: false };

  function sessions() {
    const out = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.indexOf("ls_s_") === 0) { try { const s = JSON.parse(localStorage.getItem(k)); if (s && Array.isArray(s.ev)) out.push(s); } catch (e) { /* not a session */ } } } } catch (e) { /* storage blocked */ }
    return out.sort((a, b) => b.t0 - a.t0);
  }
  function reviews() {
    let d = null; try { d = JSON.parse(store("ls_m") || "null"); } catch (e) { d = null; }
    const all = !d ? [] : Array.isArray(d.list) ? d.list : d.qs ? [Object.assign({ id: "r0", mode: "group" }, d)] : [];
    const keep = { solo: 864e5, group: 14 * 864e5 };
    return all.filter((r) => r && Array.isArray(r.qs) && Date.now() - (r.at || 0) < (keep[r.mode] || keep.group));
  }
  const shown = (r) => (r.mode === "solo" ? initials(r.group) : r.group);   // the screen may be a group's: a student shows as initials

  // ---------- Сейчас
  function now() {
    const S = window.LESSON && LESSON.session(), box = $("cr-now");
    if (S) {
      const m = Math.max(0, Math.round((Date.now() - S.t0) / 60000)), marks = S.ev.filter((e) => e.k !== "at").length;
      const rv = reviews().find((r) => r.group.trim().toLowerCase() === S.group.trim().toLowerCase());
      box.innerHTML = `<span class="live"><i aria-hidden="true"></i>Идёт урок · ${esc(S.group)} · ${m} мин · отметок: ${marks}</span>
        ${rv ? `<button type="button" class="cr-chip main" data-rv="${esc(rv.id)}">Разбор ошибок: ${rv.qs.length} ${pl(rv.qs.length, "вопрос", "вопроса", "вопросов")}</button>` : ""}
        <button type="button" class="cr-chip" data-end="1">Завершить урок</button>`;
      return;
    }
    const names = [], seen = new Set(), add = (v, label) => { const k = v.trim().toLowerCase(); if (!v || seen.has(k)) return; seen.add(k); names.push([v, label]); };
    reviews().forEach((r) => add(r.group, shown(r)));
    ((window.LESSON && LESSON.groups()) || []).slice(0, 6).forEach((g) => add(g, g));
    box.innerHTML = `${names.slice(0, 8).map(([v, label]) => `<button type="button" class="cr-chip" data-start="${esc(v)}">Начать: ${esc(label)}</button>`).join("")}
      <button type="button" class="cr-chip main" data-ask="1">${names.length ? "Другой урок…" : "Начать урок"}</button>`;
  }

  // ---------- the page
  function render() {
    now();
    const rv = reviews(), ss = sessions().filter((s) => s.t1).slice(0, 6);
    const body = $("cr-body");
    body.innerHTML = `<div class="cr-grid">
      <div class="cr-card" id="cr-rv"><h2>Разбор ошибок</h2><p class="cr-sub">Разборы, подготовленные на странице преподавателя. Нажмите, чтобы открыть на весь экран.</p>
        ${rv.length ? `<ul class="cr-list">${rv.map((r) => `<li><button type="button" class="cr-item" data-rv="${esc(r.id)}"><span><span class="cr-kind">${r.mode === "solo" ? "Индивидуальный разбор" : "Группа"}</span><b>${esc(shown(r))}</b>
          <small>${esc((r.parts || []).slice(0, 2).join(", "))}${(r.parts || []).length > 2 ? ` и ещё ${r.parts.length - 2}` : ""} · ${esc(day(r.at))}</small></span><span class="r">${r.qs.length}</span></button></li>`).join("")}</ul>`
          : '<p class="cr-empty">Пока пусто. На своём устройстве откройте страницу преподавателя: «Анализ группы» для группы или карточку ученика, затем «Подготовить урок».</p>'}</div>
      <div class="cr-card" id="cr-words-card"><h2>Слова с уроков</h2><p class="cr-sub">Слова, отмеченные на уроках. Раз в два дня они получают определение и перевод и подчёркиваются на сайте, как слова курса.</p><div id="cr-words"><p class="cr-empty">Загружаю…</p></div></div>
      <div class="cr-card cr-wide" id="cr-lessons"><h2>Презентации и материалы</h2><p class="cr-sub">Выберите урок: его презентация, части рабочей тетради и слова.</p>
        ${SITE.adminKey() ? '<div class="cr-acts cr-import"><button type="button" id="cr-zip-upload">Загрузить ZIP</button><span>PDF с кодом урока в имени, например V01_v4.pdf. Существующие презентации пропускаются.</span></div><input id="cr-zip-file" type="file" accept=".zip,application/zip" hidden><p class="cr-note" id="cr-zip-msg" role="status"></p>' : ""}
        <div class="cr-tabs" role="group" aria-label="Курс"><button type="button" data-course="V" aria-pressed="${C.course === "V"}">SAT Verbal</button><button type="button" data-course="M" aria-pressed="${C.course === "M"}">SAT Math</button></div>
        <div class="cr-tiles" id="cr-tiles"></div><div id="cr-panel"></div>
        <input id="cr-deck-file" type="file" hidden>
        <p class="cr-note" id="cr-deck-msg" role="status"></p></div>
      <div class="cr-card cr-wide"><h2>Прошлые уроки</h2>${ss.length ? `<ul class="cr-list">${ss.map((s) => { const parts = [...new Set(s.ev.filter((e) => e.k === "at" && e.q && e.ti).map((e) => e.ti.replace(/^Разбор ошибок · /, "")))];
          const n = (k) => s.ev.filter((e) => e.k === k).length;
          return `<li><div class="cr-item" style="cursor:default"><span><b>${esc(s.group)}</b><small>${esc(day(s.t0))}, ${esc(time(s.t0))} · ${Math.round((s.t1 - s.t0) / 60000)} мин${parts.length ? " · " + esc(parts.slice(0, 2).join(", ")) + (parts.length > 2 ? ` и ещё ${parts.length - 2}` : "") : ""}</small></span>
            <small>слов: ${n("word")} · вопросов: ${n("flag")}</small></div></li>`; }).join("")}</ul>` : '<p class="cr-empty">Здесь появятся уроки после «Завершить».</p>'}
        <p class="cr-note">Подробный разбор каждого урока: кабинет преподавателя → «Уроки».</p></div></div>`;
    $("cr-deck-file").onchange = (e) => {
      const file = e.target.files[0];
      e.target.value = "";
      if (file && C.open) uploadDeck(C.open, file);
    };
    const zip = $("cr-zip-file");
    if (zip) {
      $("cr-zip-upload").onclick = () => zip.click();
      zip.onchange = () => {
        const file = zip.files[0];
        zip.value = "";
        if (file) importDecks(file);
      };
    }
    tiles(); words();
  }
  function tiles() {
    const ls = C.lessons.filter((l) => l.tag[0] === C.course), box = $("cr-tiles"); if (!box) return;
    box.innerHTML = ls.length ? ls.map((l) => { const d = deckFor(l.tag), no = /^\D\d+$/.test(l.tag) ? String(Number(l.tag.slice(1))) : l.tag.slice(1);
      return `<button type="button" class="cr-tile" data-l="${esc(l.tag)}" aria-expanded="${C.open === l.tag}"><span class="no">${esc(no)}</span><span class="nm">${esc(String(l.title).split(" · ").slice(2).join(" · ") || l.title)}</span>
        <span class="st${d ? " ok" : ""}">${d ? `презентация · ${d.n} ${pl(d.n, "слайд", "слайда", "слайдов")}` : "презентация скоро"}</span></button>`; }).join("") : '<p class="cr-empty">Уроки не загрузились. Обновите страницу.</p>';
    panel();
  }
  function panel() {
    const importer = $("cr-zip-upload");
    if (importer) importer.disabled = C.deckBusy;
    const box = $("cr-panel"), l = C.lessons.find((x) => x.tag === C.open); if (!box) return;
    if (!l) { box.innerHTML = ""; return; }
    const d = deckFor(l.tag);
    box.innerHTML = `<div class="cr-panel"><h3>${esc(l.title)}</h3><div class="cr-acts">
        ${d ? `<button type="button" class="main" data-deck="${esc(d.id)}">Открыть презентацию · ${d.n} ${pl(d.n, "слайд", "слайда", "слайдов")}</button>` : ""}
        ${SITE.adminKey() ? `<button type="button" data-deck-upload="pdf"${C.deckBusy ? " disabled" : ""}>${d ? "Заменить PDF" : "Загрузить PDF"}</button>
        <button type="button" data-deck-upload="json"${C.deckBusy ? " disabled" : ""}>${d ? "Заменить из JSON" : "Загрузить JSON"}</button>
        ${d?.uploaded ? `<button type="button" data-deck-export="${esc(d.id)}"${C.deckBusy ? " disabled" : ""}>Скачать текст в JSON</button>` : ""}` : '<a href="cabinet.html?view=accounts#reg">Настроить доступ к презентациям</a>'}
        ${d?.uploaded && SITE.adminKey() ? `<button type="button" class="cr-remove" data-deck-delete="${esc(d.id)}"${C.deckBusy ? " disabled" : ""}>Удалить презентацию</button>` : ""}
        ${l.parts.map((p) => `<a href="./?l=${encodeURIComponent(l.tag)}&p=${encodeURIComponent(p.id)}">${esc(p.title)}</a>`).join("")}
        <a href="vocab.html?l=${encodeURIComponent(l.tag)}">${C.course === "V" ? "Слова урока" : "Термины урока"}</a></div>
      ${SITE.adminKey() ? '<p class="cr-note">Словарь открывается при выделении слов в PDF с текстовым слоем и на JSON-слайдах. Чтобы отредактировать текст, скачайте JSON, внесите правки и загрузите его обратно. JSON использует шаблон сайта.</p>' : ""}</div>`;
  }
  function words() {
    const box = $("cr-words"); if (!box) return;
    const deck = C.vocab && C.vocab.lessons.find((l) => l.tag === "VL"), inDeck = {}, set = new Set(((deck && deck.skip) || []).map((x) => String(x.w).toLowerCase()));
    ((deck && deck.groups[0].items) || []).forEach((it) => [it.en].concat(it.marked || []).forEach((w) => (inDeck[String(w).toLowerCase()] = it)));   // the marked form («interspersing») and the dictionary form
    const course = new Set(); ((C.vocab && C.vocab.lessons) || []).filter((l) => l.tag !== "VL").forEach((l) => l.groups.forEach((g) => g.items.forEach((it) => course.add(String(it.en).toLowerCase()))));
    const W = []; const seen = new Set();
    sessions().forEach((s) => s.ev.filter((e) => e.k === "word").forEach((e) => { const k = e.w.toLowerCase(); if (seen.has(k)) return; seen.add(k); W.push(e.w); }));
    if (!W.length) { box.innerHTML = '<p class="cr-empty">Пока нет. На уроке выделите слово в тексте или нажмите «Слово» на панели и затем само слово.</p>'; return; }
    box.innerHTML = `<div class="cr-words">${W.slice(0, 30).map((w) => { const k = w.toLowerCase(), it = inDeck[k];
      const st = it ? '<small class="ok">в словаре</small>' : course.has(k) ? '<small class="ok">уже в словаре курса</small>' : set.has(k) ? "<small>не берём</small>" : '<small class="wait">ждёт разбора</small>';
      return `<div class="cr-w"><span><b lang="en">${esc(w)}</b>${it ? ` — ${esc(it.ru)}` : ""}</span>${st}</div>`; }).join("")}</div>
      ${deck ? `<p class="cr-note"><a href="vocab.html?l=VL">Колода «Слова с уроков» · ${deck.groups[0].items.length} ${pl(deck.groups[0].items.length, "слово", "слова", "слов")}</a></p>` : ""}`;
  }

  function deckFor(id) {
    const uploaded = C.uploaded.find((d) => d.id === id);
    if (!uploaded) return C.decks.find((d) => d.id === id);
    return { ...uploaded, uploaded: true, title: C.lessons.find((l) => l.tag === id)?.title || id };
  }

  const pdfModule = () => import("./vendor/pdfjs-4.10.38/pdf.min.mjs");

  async function readPDF(file, progress) {
    const pdfjs = await pdfModule();
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("vendor/pdfjs-4.10.38/pdf.worker.min.mjs", location.href).href;
    const pdf = pdfjs.getDocument({ data: await file.arrayBuffer(), isEvalSupported: false });
    try {
      const source = await pdf.promise;
      if (source.numPages < 1 || source.numPages > 120) throw new Error("Выберите PDF до 120 страниц.");
      const canvas = document.createElement("canvas");
      const format = canvas.toDataURL("image/webp").startsWith("data:image/webp;") ? "webp" : "jpeg";
      const high = await renderPDFSlides(source, canvas, { edge: 2560, format, quality: 0.94 }, progress);
      if (high) return high;
      const compact = await renderPDFSlides(source, canvas, { edge: 1600, format, quality: 0.85 }, (status) => {
        progress("Уменьшаю размер презентации. " + status);
      });
      if (compact) return compact;
      throw new Error("Слайды слишком велики. Сожмите PDF или разбейте на несколько файлов.");
    } finally {
      await pdf.destroy().catch(() => {});
    }
  }

  async function renderPDFSlides(source, canvas, { edge, format, quality }, progress) {
    const slides = [];
    let bytes = 2, w, h;
    try {
      const encoder = new TextEncoder();
      for (let i = 1; i <= source.numPages; i++) {
        progress(`Подготавливаю слайд ${i} из ${source.numPages}…`);
        const page = await source.getPage(i), size = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: edge / Math.max(size.width, size.height) });
        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));
        if (i === 1) { w = canvas.width; h = canvas.height; }
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        const image = canvas.toDataURL("image/" + format, quality).split(",")[1];
        if (!image) throw new Error("Не удалось подготовить слайды.");
        const text = await page.getTextContent();
        const { width, height, scale, rotation, rawDims } = viewport;
        const slide = { image, format, ...(text.items.some((item) => item.str.trim()) ? { text, viewport: { width, height, scale, rotation, rawDims } } : {}) };
        bytes += encoder.encode(JSON.stringify(slide)).length + 1;
        page.cleanup();
        if (bytes > 10000000) return null;
        slides.push(slide);
      }
      return { slides, w, h };
    } finally {
      canvas.width = canvas.height = 1;
    }
  }

  async function readSource(file) {
    const invalid = "Проверьте JSON: нужна версия 1 и от 1 до 120 слайдов с полями title и paragraphs.";
    const source = await file.text().then(JSON.parse).catch(() => null);
    if (source?.version !== 1 || !Array.isArray(source.slides) || !source.slides.length || source.slides.length > 120) throw new Error(invalid);
    const slides = source.slides.map((entry) => {
      if (typeof entry?.title !== "string" || !Array.isArray(entry.paragraphs) ||
          !entry.paragraphs.every((p) => typeof p === "string") ||
          !(entry.title.trim() || entry.paragraphs.some((p) => p.trim()))) throw new Error(invalid);
      return { title: entry.title, paragraphs: entry.paragraphs };
    });
    return { slides, w: 1600, h: 900 };
  }

  async function uploadDeck(id, file) {
    if (C.deckBusy) return;
    const msg = $("cr-deck-msg"), json = /\.json$/i.test(file.name);
    if ((!json && !/\.pdf$/i.test(file.name)) || file.size > (json ? 1000000 : 20000000)) { msg.textContent = "Выберите PDF до 20 МБ или JSON до 1 МБ."; return; }
    if (deckFor(id) && !confirm(`Заменить презентацию урока ${id}?`)) return;
    C.deckBusy = true;
    panel();
    msg.textContent = json ? "Открываю JSON…" : "Открываю PDF…";
    try {
      const deck = await (json ? readSource(file) : readPDF(file, (status) => { msg.textContent = status; }));
      msg.textContent = "Сохраняю презентацию…";
      const { slides } = deck;
      await saveDeck(id, deck);
      msg.textContent = `Презентация ${id} сохранена · ${slides.length} ${pl(slides.length, "слайд", "слайда", "слайдов")}.`;
    } catch (e) {
      const known = e instanceof Error && /[А-Яа-яЁё]/.test(e.message);
      msg.textContent = known ? e.message : "Не удалось открыть или сохранить презентацию. Проверьте файл и подключение.";
    } finally {
      finishDeckChange(id);
    }
  }

  async function saveDeck(id, { slides, w, h }, createOnly = false) {
    const data = await SITE.sealBlob(slides);
    const response = await SITE.api("admin/deck?id=" + encodeURIComponent(id), {
      method: "PUT", headers: createOnly ? { "If-None-Match": "*" } : undefined,
      body: JSON.stringify({ n: slides.length, w, h, data })
    });
    if (createOnly && response.status === 412) return false;
    if (response.status === 403) throw new Error("Проверьте ключ администратора в кабинете преподавателя.");
    if (!response.ok || !response.data?.deck) throw new Error("Не удалось сохранить презентацию. Попробуйте ещё раз.");
    C.uploaded = C.uploaded.filter((d) => d.id !== id).concat(response.data.deck);
    C.lastUpload = { id, slides };
    try { localStorage.removeItem("dk_pos_" + id); } catch (e) { /* storage blocked */ }
    return true;
  }

  async function readDeckArchive(file, skipped, errors) {
    const files = new Map(), duplicates = new Set();
    const tags = new Set(C.lessons.map((lesson) => lesson.tag));
    let totalBytes = 0;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const entries = window.fflate.unzipSync(bytes, { filter: ({ name, originalSize }) => {
      const parts = name.split(/[\\/]/);
      const filename = parts.at(-1);
      if (!/\.pdf$/i.test(filename) || parts.includes("__MACOSX") || filename.startsWith("._")) return false;
      const id = filename.match(/^([VM]\d{2}|VA|MD)(?:[ ._-].*)?\.pdf$/i)?.[1].toUpperCase();
      if (!tags.has(id)) {
        errors.push(filename + " — урок не найден");
        return false;
      }
      if (deckFor(id)) {
        skipped.add(id);
        return false;
      }
      if (files.has(id)) {
        duplicates.add(id);
        return false;
      }
      files.set(id, name);
      if (originalSize > 20000000) {
        errors.push(id + " — PDF больше 20 МБ");
        return false;
      }
      totalBytes += originalSize;
      if (totalBytes > 120000000) throw new Error("После распаковки PDF занимают больше 120 МБ. Разделите архив.");
      return true;
    } });
    for (const id of duplicates) {
      files.delete(id);
      errors.push(id + " — в ZIP несколько PDF для одного урока");
    }
    return [...files].filter(([, name]) => Object.hasOwn(entries, name)).map(([id, name]) => [id, entries[name]]);
  }

  async function importDecks(file) {
    if (C.deckBusy) return;
    const msg = $("cr-zip-msg");
    if (!/\.zip$/i.test(file.name) || file.size > 50000000) { msg.textContent = "Выберите ZIP до 50 МБ."; return; }
    C.deckBusy = true;
    panel();
    msg.textContent = "Проверяю список презентаций и ZIP…";
    const saved = [], skipped = new Set(), errors = [];
    try {
      const response = await SITE.api("admin/decks");
      if (response.status === 403) throw new Error("Проверьте ключ администратора в кабинете преподавателя.");
      if (!response.ok || !Array.isArray(response.data?.decks)) throw new Error("Не удалось проверить список. Попробуйте ещё раз.");
      C.uploaded = response.data.decks;
      const entries = await readDeckArchive(file, skipped, errors);
      if (!entries.length && !skipped.size && !errors.length) throw new Error("В ZIP нет PDF для загрузки.");
      for (const [index, [id, pdf]] of entries.entries()) {
        const prefix = (index + 1) + "/" + entries.length + " · " + id + ". ";
        try {
          const deck = await readPDF(new Blob([pdf]), (status) => { msg.textContent = prefix + status; });
          msg.textContent = prefix + "Сохраняю…";
          if (await saveDeck(id, deck, true)) saved.push(id);
          else skipped.add(id);
        } catch (e) {
          errors.push(id + " — " + (/[\u0400-\u04ff]/.test(e.message) ? e.message : "не удалось загрузить PDF"));
        }
      }
      msg.textContent = [
        "Загружено " + saved.length + ". Уже были " + skipped.size + ". С ошибками " + errors.length + ".",
        saved.length && "Загружены — " + saved.join(", "),
        skipped.size && "Пропущены — " + [...skipped].join(", "),
        ...errors
      ].filter(Boolean).join("\n");
    } catch (e) {
      msg.textContent = /[\u0400-\u04ff]/.test(e.message) ? e.message : "Не удалось прочитать ZIP. Проверьте архив и подключение.";
    } finally {
      finishDeckChange();
    }
  }

  async function exportDeck(id) {
    if (C.deckBusy) return;
    C.deckBusy = true;
    panel();
    const msg = $("cr-deck-msg");
    msg.textContent = "Готовлю JSON…";
    try {
      const entries = await uploadedSlides(id);
      if (!entries.some((entry) => entry.text || Array.isArray(entry.paragraphs))) {
        msg.textContent = "В этой презентации нет текстового слоя. Загрузите PDF с выбираемым текстом или создайте JSON.";
        return;
      }
      const slides = entries.map((entry, i) => {
        if (Array.isArray(entry.paragraphs)) return entry;
        const lines = (entry.text?.items || []).map((item) => item.str + (item.hasEOL ? "\n" : "")).join("").split("\n").map((line) => line.trim()).filter(Boolean);
        return { title: lines.shift() || `Слайд ${i + 1}`, paragraphs: lines };
      });
      const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, slides }, null, 2)], { type: "application/json" }));
      Object.assign(document.createElement("a"), { href: url, download: id + ".json" }).click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      msg.textContent = "JSON скачан. После правок загрузите его обратно. Слайды без текста представлены заголовками.";
    } catch (e) {
      msg.textContent = "Не удалось скачать JSON. Проверьте подключение и попробуйте ещё раз.";
    } finally {
      finishDeckChange(id);
    }
  }

  function finishDeckChange(id) {
    C.deckBusy = false;
    tiles();
    if (C.open === id) $("cr-panel").querySelector("[data-deck], [data-deck-upload]")?.focus({ preventScroll: true });
  }

  async function deleteDeck(id) {
    if (C.deckBusy || !deckFor(id)?.uploaded || !confirm(`Удалить загруженную презентацию урока ${id}?`)) return;
    C.deckBusy = true;
    panel();
    const msg = $("cr-deck-msg");
    msg.textContent = "Удаляю презентацию…";
    try {
      const response = await SITE.api("admin/deck?id=" + encodeURIComponent(id), { method: "DELETE" });
      if (response.status === 403) { msg.textContent = "Проверьте ключ администратора в кабинете преподавателя."; return; }
      if (!response.ok) throw new Error("delete failed");
      C.uploaded = C.uploaded.filter((d) => d.id !== id);
      if (C.lastUpload?.id === id) C.lastUpload = null;
      try { localStorage.removeItem("dk_pos_" + id); } catch (e) { /* storage blocked */ }
      msg.textContent = `Презентация ${id} удалена. Можно загрузить другой PDF или JSON.`;
    } catch (e) {
      msg.textContent = "Не удалось удалить презентацию. Проверьте подключение и попробуйте ещё раз.";
    } finally {
      finishDeckChange(id);
    }
  }

  async function uploadedSlides(id) {
    if (C.lastUpload?.id === id) return C.lastUpload.slides;
    const r = await SITE.api("admin/deck?id=" + encodeURIComponent(id));
    if (!r.ok) throw new Error("deck unavailable");
    const slides = await SITE.unsealBlob(r.data.data);
    if (!Array.isArray(slides)) throw new Error("invalid deck");
    return slides;
  }

  // ---------- presentation viewer: PDF images with selectable text, editable slides and a drawing board
  const DK = { box: null, d: null, slides: [], i: 0, board: null, prev: null };
  async function openDeck(id) {
    const d = deckFor(id); if (!d || DK.box) return;
    DK.prev = { lq: document.body.dataset.lq, lt: document.body.dataset.lt };
    DK.box = document.createElement("div"); DK.box.className = "dk"; DK.box.setAttribute("role", "dialog"); DK.box.setAttribute("aria-label", "Презентация");
    DK.box.innerHTML = `<div class="dk-bar"><b>${esc(d.title)}</b><button type="button" data-k="prev" aria-label="Предыдущий слайд">←</button><span class="dk-pos" id="dk-pos" aria-live="polite">Загружаю…</span><button type="button" data-k="next" aria-label="Следующий слайд">→</button>
      ${id.startsWith("M") ? '<button type="button" data-k="calc" aria-controls="dk-calc" aria-pressed="false">Desmos</button>' : ""}
      <button type="button" data-k="draw" aria-pressed="false">Рисовать</button><button type="button" data-k="fs">Во весь экран</button><button type="button" data-k="x" aria-label="Закрыть презентацию">✕</button></div>
      <div class="dk-workspace"><div class="dk-stage"><div class="dk-frame" style="--ar:${d.w && d.h ? d.w / d.h : 16 / 9}"><img alt="" hidden>
        <div class="dk-native" hidden lang="en"></div><button type="button" class="dk-nav prev" data-k="prev" tabindex="-1">Назад</button><button type="button" class="dk-nav next" data-k="next" tabindex="-1">Далее</button>
        <div class="dk-text"></div><div class="dk-draw"></div></div></div>
        ${id.startsWith("M") ? '<div id="dk-calc" hidden></div>' : ""}</div>`;
    document.body.appendChild(DK.box); document.documentElement.style.overflow = "hidden";
    DK.board = window.LSBOARD ? LSBOARD.create(DK.box.querySelector(".dk-draw"), { clear: true }) : null;
    DK.box.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b) return; ({ prev: () => go(DK.i - 1), next: () => go(DK.i + 1), draw: toggleDraw, calc: toggleCalc, fs: fullscreen, x: closeDeck })[b.dataset.k](); });
    document.addEventListener("keydown", onKey);
    DK.d = d; DK.uploaded = null; DK.slides = Array.from({ length: d.n }); go(Math.min(d.n - 1, Math.max(0, Number(store("dk_pos_" + id)) || 0)));
  }
  // one encrypted image per slide (tools/private/deckpack.mjs), fetched when shown; the next one is fetched ahead
  function slide(i) {
    const d = DK.d; if (!d || i < 0 || i >= d.n) return null;
    if (!DK.slides[i] && d.uploaded) {
      DK.uploaded ||= uploadedSlides(d.id);
      DK.slides[i] = DK.uploaded.then((slides) => {
        const entry = slides[i];
        if (Array.isArray(entry?.paragraphs)) return entry;
        const encoded = typeof entry === "string" ? entry : entry?.image;
        if (typeof encoded !== "string") throw new Error("slide missing");
        const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
        const type = entry?.format === "webp" ? "image/webp" : "image/jpeg";
        return { url: URL.createObjectURL(new Blob([bytes], { type })), text: entry?.text, viewport: entry?.viewport };
      });
    }
    if (!DK.slides[i]) DK.slides[i] = fetch(`${d.dir}/${i + 1}.bin`).then((r) => { if (!r.ok) throw new Error("slide " + r.status); return r.arrayBuffer(); })
      .then((b) => SITE.open(b)).then((u) => ({ url: URL.createObjectURL(new Blob([u], { type: "image/" + (d.fmt || "jpeg") })) }));
    return DK.slides[i];
  }
  function go(i) {
    if (!DK.d || i < 0 || i >= DK.d.n) return;
    DK.i = i; $("dk-pos").textContent = `${i + 1} / ${DK.d.n}`;
    const box = DK.box, img = box.querySelector(".dk-frame img"), native = box.querySelector(".dk-native"), text = box.querySelector(".dk-text");
    clearDeckText();
    img.hidden = true;
    native.hidden = true;
    native.replaceChildren();
    const current = () => DK.box === box && DK.current === current;
    DK.current = current;
    slide(i).then((entry) => {
      if (!current()) return;
      if (entry.url) {
        img.src = entry.url;
        img.alt = entry.text ? "" : `Слайд ${i + 1}`;
        img.hidden = false;
        if (entry.text) showDeckText(entry, text, current).catch(() => {
          if (current()) $("dk-pos").textContent += " · текст недоступен";
        });
      } else {
        if (entry.title) native.append(Object.assign(document.createElement("h2"), { textContent: entry.title }));
        for (const paragraph of entry.paragraphs) native.append(Object.assign(document.createElement("p"), { textContent: paragraph }));
        native.hidden = false;
        native.scrollTop = 0;
      }
    }).catch(() => {
      if (current()) $("dk-pos").textContent = `${i + 1} / ${DK.d.n} · не загрузился`;
    });
    slide(i + 1)?.catch(() => {});
    try { localStorage.setItem("dk_pos_" + DK.d.id, String(i)); } catch (e) { /* storage blocked */ }
    document.body.dataset.lq = `DECK.${DK.d.id}.${i + 1}`; document.body.dataset.lt = `Презентация · ${DK.d.title}`;   // the lesson's timeline records the slides
    if (window.LESSON && LESSON.tick) LESSON.tick();   // at once, a quick flip through slides is recorded too
    if (DK.board) DK.board.show(`${DK.d.id}.${i}`);
  }
  async function showDeckText({ text, viewport }, host, current) {
    const { TextLayer } = await pdfModule();
    if (!current()) return;
    const page = document.createElement("div"), layer = document.createElement("div");
    const { width, height, scale, rotation, rawDims } = viewport;
    page.className = "dk-text-page";
    layer.className = "dk-text-layer";
    page.style.width = width + "px";
    page.style.height = height + "px";
    layer.style.width = rawDims.pageWidth * scale + "px";
    layer.style.height = rawDims.pageHeight * scale + "px";
    layer.style.setProperty("--scale-factor", scale);
    layer.lang = text.lang || "en";
    page.append(layer);
    host.replaceChildren(page);
    const fit = () => {
      const factor = Math.min(host.clientWidth / width, host.clientHeight / height);
      page.style.left = (host.clientWidth - width * factor) / 2 + "px";
      page.style.top = (host.clientHeight - height * factor) / 2 + "px";
      page.style.transform = `scale(${factor})`;
    };
    const layerTask = new TextLayer({ textContentSource: text, container: layer, viewport });
    const observer = new ResizeObserver(fit);
    DK.textCleanup = () => { observer.disconnect(); layerTask.cancel(); host.replaceChildren(); };
    observer.observe(host);
    fit();
    await layerTask.render();
  }
  function clearDeckText() {
    const selection = window.getSelection();
    if (selection?.anchorNode && DK.box?.querySelector(".dk-frame")?.contains(selection.anchorNode)) selection.removeAllRanges();
    window.DICT?.hide();
    DK.textCleanup?.();
    DK.textCleanup = null;
  }
  function toggleDraw() {
    const on = DK.box.classList.toggle("drawing");
    DK.box.querySelector('[data-k="draw"]').setAttribute("aria-pressed", String(on));
    if (on) {
      window.getSelection()?.removeAllRanges();
      window.DICT?.hide();
      if (DK.board) requestAnimationFrame(DK.board.fit);
    }
  }
  function toggleCalc() {
    const panel = $("dk-calc");
    panel.hidden = !panel.hidden;
    DK.box.classList.toggle("with-calc", !panel.hidden);
    DK.box.querySelector('[data-k="calc"]').setAttribute("aria-pressed", String(!panel.hidden));
    if (!panel.hidden && !panel.firstChild) {
      panel.append(Object.assign(document.createElement("iframe"), { src: BBTools.desmosURL, title: "Графический калькулятор Desmos" }));
    }
    if (DK.board) requestAnimationFrame(DK.board.fit);
  }
  function fullscreen() { if (document.fullscreenElement) document.exitFullscreen(); else if (DK.box.requestFullscreen) DK.box.requestFullscreen().catch(() => {}); }
  function onKey(e) {
    if (!DK.box || e.defaultPrevented || document.documentElement.classList.contains("ls-pick") || document.querySelector(".ls-pop")) return;
    const drawing = DK.box.classList.contains("drawing");
    if (drawing && (e.ctrlKey || e.metaKey) && /^[zyя]$/i.test(e.key)) { e.preventDefault(); if (DK.board) (e.key.toLowerCase() === "y" || e.shiftKey) ? DK.board.redo() : DK.board.undo(); return; }
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key) && !(["Enter", " "].includes(e.key) && e.target.tagName === "BUTTON")) { e.preventDefault(); go(DK.i + 1); }
    else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); go(DK.i - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); } else if (e.key === "End") { e.preventDefault(); go(DK.d ? DK.d.n - 1 : 0); }
    else if (e.key === "Escape" && !document.fullscreenElement) { e.preventDefault(); if (drawing) toggleDraw(); else if (DK.box.classList.contains("with-calc")) toggleCalc(); else closeDeck(); }
  }
  function closeDeck() {
    if (!DK.box) return; if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    clearDeckText();
    DK.slides.forEach((p) => p && p.then(({ url }) => { if (url) URL.revokeObjectURL(url); }).catch(() => {})); DK.slides = [];
    DK.box.remove(); DK.box = null; DK.d = null; DK.uploaded = null; DK.current = null; document.documentElement.style.overflow = ""; document.removeEventListener("keydown", onKey);
    const p = DK.prev || {}; if (p.lq) document.body.dataset.lq = p.lq; else delete document.body.dataset.lq; if (p.lt) document.body.dataset.lt = p.lt; else delete document.body.dataset.lt;
    const t = document.querySelector(`.cr-acts [data-deck]`); if (t) t.focus();
  }

  // ---------- events and start
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-start],[data-ask],[data-end],[data-rv],[data-course],[data-l],[data-deck],[data-deck-upload],[data-deck-delete],[data-deck-export]"); if (!b || !window.LESSON || (DK.box && DK.box.contains(b))) return;
    if (b.dataset.start) LESSON.begin(b.dataset.start, true);
    else if (b.dataset.ask) LESSON.ask();
    else if (b.dataset.end) LESSON.end();
    else if (b.dataset.rv) LESSON.openMist(b.dataset.rv);
    else if (b.dataset.course) { C.course = b.dataset.course; C.open = null; try { localStorage.setItem("cr_course", C.course); } catch (x) { /* blocked */ } document.querySelectorAll("[data-course]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.course === C.course))); tiles(); }
    else if (b.dataset.l) { C.open = C.open === b.dataset.l ? null : b.dataset.l; document.querySelectorAll(".cr-tile").forEach((x) => x.setAttribute("aria-expanded", String(x.dataset.l === C.open))); panel(); }
    else if (b.dataset.deck) openDeck(b.dataset.deck);
    else if (b.dataset.deckUpload) {
      const input = $("cr-deck-file");
      input.accept = b.dataset.deckUpload === "pdf" ? "application/pdf,.pdf" : "application/json,.json";
      input.click();
    }
    else if (b.dataset.deckDelete) deleteDeck(b.dataset.deckDelete);
    else if (b.dataset.deckExport) exportDeck(b.dataset.deckExport);
  });
  document.addEventListener("ls-change", now);
  window.addEventListener("DOMContentLoaded", () => {
    if (!window.SITE) return;
    SITE.ready.then(async () => {
      if (!/^lesson(-[a-z0-9]+)?$/.test(SITE.me() || "")) { $("cr-body").innerHTML = '<p class="cr-empty">Эта страница для аккаунта урока. Войдите на сайт под логином урока.</p>'; $("cr-now").innerHTML = ""; return; }
      for (let i = 0; i < 100 && !window.LESSON; i++) await new Promise((r) => setTimeout(r, 100));   // lesson.js is loaded by auth.js
      try { if (SITE.sync) await Promise.race([SITE.sync(), new Promise((r) => setTimeout(r, 4000))]); } catch (e) { /* offline */ }
      const [L, V, D, uploaded] = await Promise.all([
        SITE.json("lessons").catch(() => null), SITE.json("vocab").catch(() => null), SITE.json("decks").catch(() => null),
        SITE.adminKey() ? SITE.api("admin/decks").catch(() => null) : null
      ]);
      C.lessons = ((L && (L.lessons || L)) || []).filter((l) => l && l.tag && Array.isArray(l.parts) && /^[VM]/.test(l.tag));
      const lesson = new URLSearchParams(location.search).get("lesson");
      if (C.lessons.some((l) => l.tag === lesson)) { C.open = lesson; C.course = lesson[0]; }
      C.vocab = V; C.decks = (D && D.decks) || [];
      C.uploaded = uploaded?.ok && Array.isArray(uploaded.data?.decks) ? uploaded.data.decks : [];
      render(); setInterval(now, 30000);
    });
  });
  window.CLASSROOM = { openDeck, render };
})();
