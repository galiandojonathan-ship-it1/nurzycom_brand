// Vocabulary page: pick any lessons, then flashcards, a typed test or a list over one combined deck.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const load = (k, d) => { try { return JSON.parse(store(k)) || d; } catch (e) { return d; } };
  const st = { data: null, sel: new Set(), cats: new Set(["words", "terms", "review"]), deck: [], title: "", mode: "cards", dir: "ru",
    cards: [], known: 0, again: 0, test: [], ti: 0, miss: [] };
  const hard = new Set(load("vocab_hard", []));
  const keyOf = (it) => `${it.en}|${it.ru}`;
  const saveHard = () => { store("vocab_hard", JSON.stringify([...hard])); $("hard-n").textContent = hardItems().length; };

  function show(id) { ["v-start", "v-run"].forEach((s) => $(s).classList.toggle("hidden", s !== id)); window.scrollTo(0, 0); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const catOf = (g) => (g.name === "Слова" ? "words" : g.name === "Повторение" ? "review" : "terms");
  const short = (l) => `${l.tag[0] === "V" ? "Verbal" : "Math"} ${Number(l.tag.slice(1))}`;

  // All words of the chosen lessons and categories, each word once (first lesson wins).
  function build(onlyHard) {
    const seen = new Set(), out = [];
    const lessons = onlyHard ? st.data.lessons : st.data.lessons.filter((l) => st.sel.has(l.tag));
    lessons.forEach((l) => l.groups.forEach((g) => {
      if (!onlyHard && !st.cats.has(catOf(g))) return;
      g.items.forEach((it) => {
        const k = it.en.toLowerCase().trim();
        if (seen.has(k) || (onlyHard && !hard.has(keyOf(it)))) return;
        seen.add(k); out.push(Object.assign({ tag: l.tag, from: short(l), group: g.name }, it));
      });
    }));
    return out;
  }
  const hardItems = () => build(true);

  function renderStart() {
    const courses = [["V", "SAT Verbal"], ["M", "SAT Math"]];
    $("lessons").innerHTML = courses.map(([c, name]) => {
      const ls = st.data.lessons.filter((l) => l.tag[0] === c);
      return `<div><div class="course-h"><b>${name}</b><span class="label">${ls.length} уроков</span></div><div class="tiles">${ls.map((l) => {
        const n = l.groups.reduce((s, g) => s + g.items.length, 0);
        return `<button class="tile" data-l="${l.tag}" aria-pressed="false" title="${esc(l.title)}"><span class="no">${String(Number(l.tag.slice(1))).padStart(2, "0")}</span><span class="nm">${esc(l.title.split(" · ").slice(2).join(" · "))}</span><span class="dot">${n}</span></button>`;
      }).join("")}</div></div>`;
    }).join("");
    $("lessons").querySelectorAll(".tile").forEach((b) => (b.onclick = () => { const t = b.dataset.l; st.sel.has(t) ? st.sel.delete(t) : st.sel.add(t); sync(); }));
    $("cats").querySelectorAll(".chip").forEach((b) => (b.onclick = () => { const c = b.dataset.c; st.cats.has(c) ? st.cats.delete(c) : st.cats.add(c); sync(); }));
    const setAll = (c) => { st.data.lessons.filter((l) => l.tag[0] === c).forEach((l) => st.sel.add(l.tag)); sync(); };
    $("all-v").onclick = () => setAll("V"); $("all-m").onclick = () => setAll("M");
    $("clear").onclick = () => { st.sel.clear(); sync(); };
    $("start-modes").querySelectorAll(".pick").forEach((b) => (b.onclick = () => start(b.dataset.m, false)));
    $("hard-go").onclick = () => start("cards", true);
    sync();
  }
  function sync() {
    $("lessons").querySelectorAll(".tile").forEach((b) => b.setAttribute("aria-pressed", String(st.sel.has(b.dataset.l))));
    $("cats").querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(st.cats.has(b.dataset.c))));
    const n = build(false).length;
    $("sum").innerHTML = st.sel.size ? `Выбрано уроков: <b>${st.sel.size}</b> · в колоде <b>${n}</b> ${plural(n, "слово", "слова", "слов")}` : "Выберите хотя бы один урок.";
    $("start-modes").querySelectorAll(".pick").forEach((b) => (b.disabled = !n));
    $("hard-go").disabled = !hardItems().length; $("hard-n").textContent = hardItems().length;
    store("vocab_sel", JSON.stringify({ sel: [...st.sel], cats: [...st.cats] }));
  }
  function plural(n, a, b, c) { const m = n % 100, k = n % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k >= 2 && k <= 4 ? b : c; }

  function start(mode, onlyHard) {
    st.deck = onlyHard ? hardItems() : build(false);
    if (!st.deck.length) return;
    const names = onlyHard ? ["трудные слова"] : st.data.lessons.filter((l) => st.sel.has(l.tag)).map(short);
    st.title = `${names.length > 4 ? names.length + " уроков" : names.join(" · ")} · ${st.deck.length} ${plural(st.deck.length, "слово", "слова", "слов")}`;
    $("run-title").textContent = st.title;
    show("v-run"); setMode(mode);
  }
  function setMode(m) {
    st.mode = m;
    $("modes").querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.m === m)));
    ["list", "cards", "test"].forEach((k) => $("m-" + k).classList.toggle("hidden", k !== m));
    if (m === "list") renderList(); else if (m === "cards") startCards(st.deck); else startTest(st.deck);
  }

  function renderList() {
    const by = [];
    st.deck.forEach((it) => { const k = `${it.from} · ${it.group}`; let g = by.find((x) => x[0] === k); if (!g) by.push((g = [k, []])); g[1].push(it); });
    $("m-list").innerHTML = by.map(([k, its]) => `<div class="lgroup"><h3>${esc(k)}</h3>${its.map((it) => `<div class="item"><div><span class="en">${esc(it.en)}</span>${it.pos ? `<span class="pos">${esc(it.pos)}</span>` : ""}${hard.has(keyOf(it)) ? '<span class="hard">трудное</span>' : ""}</div>
      <div><div class="ru">${esc(it.ru)}</div>${it.def ? `<div class="def">${esc(it.def)}</div>` : ""}${it.ex ? `<div class="ex">${esc(it.ex)}</div>` : ""}</div></div>`).join("")}</div>`).join("");
  }

  // ---- flashcards
  function startCards(list) {
    st.cards = shuffle(list); st.total = list.length; st.known = 0; st.again = 0; st.missed = new Set();
    $("f-run").classList.remove("hidden"); $("f-done").classList.add("hidden"); nextCard();
  }
  function nextCard() {
    $("flash").classList.remove("on");
    $("f-known").textContent = `Знаю: ${st.known} / ${st.total}`;
    $("f-prog").style.width = `${(100 * st.known) / st.total}%`;
    if (!st.cards.length) return finishCards();
    const it = st.cards[0];
    $("f-count").textContent = `Осталось: ${st.cards.length}`;
    $("f-lesson").textContent = $("f-lesson2").textContent = it.from;
    $("f-pos").textContent = st.dir === "en" && it.pos ? it.pos : "";
    // Wait for the flip back before showing the next word, so the answer never shows through.
    const fill = () => {
      $("f-front").textContent = st.dir === "ru" ? it.ru : it.en;
      $("f-ans").textContent = st.dir === "ru" ? it.en : it.ru;
      $("f-def").textContent = it.def || ""; $("f-ex").textContent = it.ex || "";
    };
    if (st.flipped) { st.flipped = false; setTimeout(fill, 180); } else fill();
    $("f-btns").classList.remove("hidden"); $("f-grade").classList.add("hidden");
  }
  function reveal() {
    if (!st.cards.length || $("flash").classList.contains("on")) return;
    $("flash").classList.add("on"); st.flipped = true;
    $("f-btns").classList.add("hidden"); $("f-grade").classList.remove("hidden");
  }
  function gradeCard(ok) {
    if (!st.cards.length || !$("flash").classList.contains("on")) return;
    const it = st.cards.shift();
    // A word leaves the hard list only when it is known at first sight, not after a repeat in the same deck.
    if (ok) { st.known++; if (!st.missed.has(keyOf(it))) hard.delete(keyOf(it)); }
    else { st.again++; st.missed.add(keyOf(it)); hard.add(keyOf(it)); st.cards.splice(Math.min(st.cards.length, 4 + Math.floor(Math.random() * 4)), 0, it); }
    saveHard(); nextCard();
  }
  function finishCards() {
    $("f-run").classList.add("hidden"); $("f-done").classList.remove("hidden");
    $("f-score").textContent = `${st.total}`;
    $("f-sum").textContent = `${plural(st.total, "Слово", "Слова", "Слов")} в колоде: ${st.total}. Нажатий «Ещё раз»: ${st.again}. Трудных слов сейчас: ${hardItems().length}.`;
    $("f-hard").disabled = !hardItems().length;
  }
  $("flash").onclick = reveal;
  $("flash").onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); reveal(); } };
  $("f-show").onclick = reveal;
  $("f-yes").onclick = () => gradeCard(true);
  $("f-no").onclick = () => gradeCard(false);
  $("f-again").onclick = () => startCards(st.deck);
  $("f-hard").onclick = () => start("cards", true);
  $("dir").querySelectorAll(".chip").forEach((b) => (b.onclick = () => { st.dir = b.dataset.d; $("dir").querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); st.flipped = false; startCards(st.deck); }));
  document.addEventListener("keydown", (e) => {
    if (st.mode !== "cards" || $("v-run").classList.contains("hidden") || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === " ") { e.preventDefault(); reveal(); }
    else if (e.key === "ArrowRight") gradeCard(true);
    else if (e.key === "ArrowLeft") gradeCard(false);
  });

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
    $("t-lesson").textContent = it.from;
    $("t-q").textContent = it.ru; $("t-help").textContent = it.pos || "";
    $("t-in").value = ""; $("t-fb").innerHTML = ""; $("t-fb").className = "fb"; $("t-check").textContent = "Проверить"; $("t-check").dataset.next = "";
    $("t-in").focus();
  }
  function checkTest(skip) {
    const it = st.test[st.ti];
    if ($("t-check").dataset.next) { st.ti++; return askTest(); }
    const ok = !skip && accepted(it.en).has(norm($("t-in").value));
    if (!ok) { st.miss.push(it); hard.add(keyOf(it)); } else hard.delete(keyOf(it));
    saveHard();
    $("t-fb").className = "fb " + (ok ? "ok" : "no");
    $("t-fb").innerHTML = (ok ? "<b>Верно.</b> " : "<b>Ответ:</b> ") + esc(it.en) + (it.ex ? `<br><span class="hint"><i>${esc(it.ex)}</i></span>` : "");
    $("t-check").textContent = "Дальше →"; $("t-check").dataset.next = "1";
  }
  function finishTest() {
    $("t-run").classList.add("hidden"); $("t-done").classList.remove("hidden");
    const n = st.test.length, r = n - st.miss.length;
    $("t-score").textContent = `${r} / ${n}`;
    $("t-miss").innerHTML = st.miss.length ? st.miss.map((it) => `<div class="item"><div><span class="en">${esc(it.en)}</span></div><div>${esc(it.ru)}</div></div>`).join("") : '<p class="hint">Ошибок нет.</p>';
    $("t-missonly").classList.toggle("hidden", !st.miss.length);
  }
  $("t-check").onclick = () => checkTest(false);
  $("t-skip").onclick = () => { if (!$("t-check").dataset.next) checkTest(true); };
  $("t-in").addEventListener("keydown", (e) => { if (e.key === "Enter") checkTest(false); });
  $("t-again").onclick = () => startTest(st.deck);
  $("t-missonly").onclick = () => startTest(st.miss);

  $("modes").querySelectorAll(".chip").forEach((b) => (b.onclick = () => setMode(b.dataset.m)));
  $("back").onclick = () => { sync(); show("v-start"); };

  fetch("vocab.json", { cache: "no-store" }).then((r) => r.json()).then((d) => {
    st.data = d;
    const saved = load("vocab_sel", null);
    if (saved) { st.sel = new Set(saved.sel || []); st.cats = new Set(saved.cats || []); }
    // ?l=V03,V04 opens those lessons straight away (links from lesson materials).
    const want = (new URLSearchParams(location.search).get("l") || "").split(",").filter((t) => d.lessons.some((l) => l.tag === t));
    if (want.length) { st.sel = new Set(want); st.cats = new Set(["words", "terms", "review"]); }
    renderStart();
    if (want.length) start("cards", false);
  });
})();
