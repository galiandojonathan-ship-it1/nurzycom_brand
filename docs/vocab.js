// Vocabulary page: list, flashcards and a typed test for every lesson's words.
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const st = { data: null, lesson: null, group: 0, mode: "list", dir: "ru", deck: [], known: 0, test: [], ti: 0, miss: [] };

  function show(id) { ["v-start", "v-lesson"].forEach((s) => $(s).classList.toggle("hidden", s !== id)); window.scrollTo(0, 0); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const items = () => st.lesson.groups[st.group].items;

  function renderStart() {
    $("lessons").innerHTML = st.data.lessons.map((l, i) => {
      const n = l.groups.reduce((s, g) => s + g.items.length, 0);
      return `<button class="pick" data-i="${i}">${esc(l.title)}<small>${n} слов и терминов</small></button>`;
    }).join("");
    $("lessons").querySelectorAll(".pick").forEach((b) => (b.onclick = () => openLesson(Number(b.dataset.i))));
  }

  function openLesson(i, g) {
    st.lesson = st.data.lessons[i]; st.group = g || 0;
    store("vocab_last", st.lesson.tag);
    $("l-title").textContent = st.lesson.title;
    $("groups").innerHTML = st.lesson.groups.map((gr, k) => `<button class="tab" data-g="${k}" aria-pressed="${k === st.group}">${esc(gr.name)} · ${gr.items.length}</button>`).join("");
    $("groups").querySelectorAll(".tab").forEach((b) => (b.onclick = () => { st.group = Number(b.dataset.g); press("groups", b); setMode(st.mode); }));
    show("v-lesson"); setMode(st.mode);
  }
  function press(box, btn) { $(box).querySelectorAll(".tab").forEach((x) => x.setAttribute("aria-pressed", String(x === btn))); }

  function setMode(m) {
    st.mode = m;
    $("modes").querySelectorAll(".tab").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.m === m)));
    ["list", "cards", "test"].forEach((k) => $("m-" + k).classList.toggle("hidden", k !== m));
    if (m === "list") renderList(); else if (m === "cards") startCards(); else startTest(items());
  }

  function renderList() {
    $("m-list").innerHTML = items().map((it) => `<div class="item"><div><span class="en">${esc(it.en)}</span>${it.pos ? `<span class="pos">${esc(it.pos)}</span>` : ""}</div>
      <div class="ru">${esc(it.ru)}</div>${it.def ? `<div class="def">${esc(it.def)}</div>` : ""}${it.ex ? `<div class="ex">${esc(it.ex)}</div>` : ""}</div>`).join("");
  }

  // ---- flashcards
  function startCards() { st.deck = shuffle(items()); st.known = 0; nextCard(); }
  function nextCard() {
    const total = items().length;
    $("f-known").textContent = `Знаю: ${st.known} / ${total}`;
    if (!st.deck.length) {
      $("f-front").textContent = "Колода пройдена"; $("f-back").innerHTML = `<div class="hint">Все ${total} слов отмечены «Знаю». Завтра повторите ещё раз.</div>`;
      $("f-back").classList.remove("hidden"); $("f-btns").classList.add("hidden"); $("f-grade").classList.add("hidden");
      $("f-count").textContent = ""; $("f-btns").innerHTML = ""; return;
    }
    const it = st.deck[0];
    $("f-count").textContent = `Осталось: ${st.deck.length}`;
    $("f-front").textContent = st.dir === "ru" ? it.ru : it.en;
    const backMain = st.dir === "ru" ? it.en : it.ru;
    $("f-back").innerHTML = `<div class="en">${esc(backMain)}</div>${it.def ? `<div class="hint">${esc(it.def)}</div>` : ""}${it.ex ? `<div class="hint"><i>${esc(it.ex)}</i></div>` : ""}`;
    $("f-back").classList.add("hidden");
    $("f-btns").innerHTML = '<button class="btn ghost" id="f-show">Показать ответ</button>';
    $("f-btns").classList.remove("hidden"); $("f-grade").classList.add("hidden");
    $("f-show").onclick = reveal;
  }
  function reveal() { $("f-back").classList.remove("hidden"); $("f-btns").classList.add("hidden"); $("f-grade").classList.remove("hidden"); }
  $("flash").onclick = () => { if ($("f-back").classList.contains("hidden") && st.deck.length) reveal(); };
  $("f-yes").onclick = () => { st.deck.shift(); st.known++; nextCard(); };
  $("f-no").onclick = () => { st.deck.push(st.deck.shift()); nextCard(); };
  $("dir").querySelectorAll(".tab").forEach((b) => (b.onclick = () => { st.dir = b.dataset.d; press("dir", b); startCards(); }));

  // ---- typed test: Russian shown, type the English
  const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/\(.*?\)/g, " ").replace(/[^a-z0-9'+\-−=<>≤≥ ]/g, " ").replace(/^to /, "").replace(/\s+/g, " ").trim();
  function accepted(en) {
    const all = new Set([norm(en)]);
    en.split(/\s*(?:\/|·|,|;| or )\s*/).forEach((p) => { const n = norm(p); if (n) all.add(n); });
    return all;
  }
  function startTest(list) { st.test = shuffle(list); st.ti = 0; st.miss = []; $("t-run").classList.remove("hidden"); $("t-done").classList.add("hidden"); askTest(); }
  function askTest() {
    if (st.ti >= st.test.length) return finishTest();
    const it = st.test[st.ti];
    $("t-count").textContent = `Вопрос ${st.ti + 1} из ${st.test.length}`;
    $("t-q").textContent = it.ru; $("t-help").textContent = it.pos ? it.pos : "";
    $("t-in").value = ""; $("t-fb").innerHTML = ""; $("t-check").textContent = "Проверить"; $("t-check").dataset.next = "";
    $("t-in").focus();
  }
  function checkTest(skip) {
    const it = st.test[st.ti];
    if ($("t-check").dataset.next) { st.ti++; return askTest(); }
    const ok = !skip && accepted(it.en).has(norm($("t-in").value));
    if (!ok) st.miss.push(it);
    $("t-fb").innerHTML = (ok ? "<b>Верно.</b> " : "<b>Ответ:</b> ") + esc(it.en) + (it.ex ? `<br><span class="hint"><i>${esc(it.ex)}</i></span>` : "");
    $("t-check").textContent = "Дальше"; $("t-check").dataset.next = "1";
  }
  function finishTest() {
    $("t-run").classList.add("hidden"); $("t-done").classList.remove("hidden");
    const n = st.test.length, r = n - st.miss.length;
    $("t-score").textContent = `${r} / ${n}`;
    $("t-miss").innerHTML = st.miss.length ? st.miss.map((it) => `<div class="item"><span class="en">${esc(it.en)}</span> — ${esc(it.ru)}</div>`).join("") : '<p class="hint">Ошибок нет.</p>';
    $("t-missonly").classList.toggle("hidden", !st.miss.length);
    store(`vocab_${st.lesson.tag}_${st.group}`, `${r}/${n}`);
  }
  $("t-check").onclick = () => checkTest(false);
  $("t-skip").onclick = () => { if (!$("t-check").dataset.next) checkTest(true); };
  $("t-in").addEventListener("keydown", (e) => { if (e.key === "Enter") checkTest(false); });
  $("t-again").onclick = () => startTest(items());
  $("t-missonly").onclick = () => startTest(st.miss);

  $("modes").querySelectorAll(".tab").forEach((b) => (b.onclick = () => setMode(b.dataset.m)));
  $("back").onclick = () => show("v-start");

  fetch("vocab.json", { cache: "no-store" }).then((r) => r.json()).then((d) => {
    st.data = d; renderStart();
    const want = new URLSearchParams(location.search).get("l");
    const i = d.lessons.findIndex((l) => l.tag === want);
    if (i >= 0) openLesson(i);
  });
})();
