// Course plan: what to do after each lesson, in order. Items the student submitted on this device tick themselves
// (from the results the other pages keep in localStorage); the rest are ticked by hand and kept per student.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const nn = (n) => String(n).padStart(2, "0");

  const TOPIC = {
    V: ["Words in Context", "Boundaries", "Form, Structure, and Sense", "Rhetorical Synthesis", "Transitions", "Text Structure and Purpose",
      "Cross-Text Connections", "Central Ideas and Details", "Command of Evidence", "Inferences", "Mixed review", "Practice test review"],
    M: ["Algebra I", "Algebra II", "Advanced Math I", "Advanced Math II", "Advanced Math III", "Advanced Math IV",
      "Data Analysis I", "Data Analysis II", "Geometry I", "Geometry II", "Hard questions", "Practice test review"],
  };
  const TEXT = ["The Red Ink", "The Water Committee", "The Poet Next Door", "The River That Shimmered", "The Stone Above the Door", "The Jar of Seeds",
    "One Sentence", "Seven O’Clock", "The Uncle Who Never Was", "The Shipyard Republic", "The Temperamental Robot", "The Mushroom Walker"];
  const HARD = { X01: "Философия и идеи", X02: "География", X03: "Наука и открытия", X04: "История, языки и искусство",
    X05: "Американская литература: XIX век", X06: "Американская литература: XX век, проза", X07: "Американская литература: драма, поэзия, общество" };
  const HARD_AFTER = { 6: "X01", 7: "X02", 9: "X03", 10: "X04" };   // the rest after lesson 12; none in the weeks with a full test
  const MOCK_AFTER = { 0: "PT1", 4: "PT2", 8: "PT3", 12: "PT4" };
  const NAME = { V: "SAT Verbal", M: "SAT Math" };
  // workbook part ids (V01 opens with a cold start, V04 has two practice parts)
  const hwPart = (tag) => (tag === "V01" || tag === "V04" ? "p4" : "p3");
  const xPart = (tag) => (tag === "V01" || tag === "V04" ? "p5" : "p4");
  const inClass = (tag) => (tag === "V01" ? "Холодный старт, Практика, Финальный тест" : tag === "V04" ? "Две части практики, Финальный тест" : "Практика, Финальный тест");

  let course = store("plan_course") || "V";
  const student = () => (store("hw_student") || "").trim();
  const doneKey = () => `plan_done_${student()}`;
  let manual = new Set();
  const loadManual = () => { try { manual = new Set(JSON.parse(store(doneKey()) || "[]")); } catch (e) { manual = new Set(); } };

  // results the other pages store after a submission
  const hwScore = (tag, pid) => store(`hw_last_${student()}_${tag}_${pid}`);
  const pct = (s) => { const m = /^(\d+)\/(\d+)$/.exec(s || ""); return m && +m[2] ? (100 * +m[1]) / +m[2] : null; };
  function mockDone(id, secs) {
    const last = store(`mk_last_${student()}_${id}`) || "";
    return secs.every((s) => last.includes(s === "rw" ? "RW " : "Math ")) ? last : null;
  }

  function mockItem(id, entry) {
    const secs = course === "V" ? ["rw"] : course === "M" ? ["math"] : ["rw", "math"];
    const fmt = course === "VM" ? "весь тест: Reading and Writing, перерыв, Math" : course === "V" ? "только Reading and Writing" : "только Math";
    const min = course === "VM" ? "2 ч 24 мин вместе с перерывом" : course === "V" ? "64 мин" : "70 мин";
    return { id, t: `Пробный тест ${id.slice(2)}`, s: `${fmt} · ${min}, лучше за один раз${entry ? " · не готовьтесь специально: тест покажет исходную точку" : ""}`,
      href: `mock.html?t=${id}`, need: true, res: mockDone(id, secs) };
  }

  function stages() {
    const cs = course === "VM" ? ["V", "M"] : [course];
    const out = [];
    out.push({ no: "00", cap: "До первого урока", title: "Старт", items: [
      { when: "До первого урока", list: [mockItem("PT1", true),
        { id: "bluebook-app", t: "Установите приложение Bluebook", s: "Оно понадобится перед уроком 12 · ноутбук или планшет, не телефон", need: false }] }] });
    for (let n = 1; n <= 12; n++) {
      const now = [], week = [], eve = [];
      for (const c of cs) {
        const tag = `${c}${nn(n)}`, tg = course === "VM" ? c : "";
        const hs = hwScore(tag, hwPart(tag)), hp = pct(hs);
        now.push({ id: `${tag}-hw`, crs: tg, t: "Домашнее задание", s: `Решайте на экране: две попытки и объяснение после ответа · ≈ ${c === "V" ? 40 : 50} мин`, href: `./?l=${tag}&p=${hwPart(tag)}`, need: true, res: hs });
        week.push({ id: `${tag}-cards`, crs: tg, t: c === "V" ? "Слова урока: карточки" : "Термины урока: карточки", s: "Пометьте трудные слова — они соберутся в отдельную колоду · ≈ 10 мин", href: `vocab.html?l=${tag}` });
        if (c === "V") week.push({ id: `T${nn(n)}`, crs: tg, t: `Текст ${n}: «${TEXT[n - 1]}»`, s: "Рассказ со словами урока и 6 вопросов · ≈ 15 мин", href: `reading.html?t=T${nn(n)}`, res: store(`rd_last_${student()}_T${nn(n)}`) });
        const xs = hwScore(tag, xPart(tag));
        week.push({ id: `${tag}-extra`, crs: tg, t: "Дополнительное ДЗ", s: `${hp === null ? "Нужно, если в домашнем задании меньше 80% с первой попытки" : `В домашнем задании ${Math.round(hp)}% с первой попытки${hp < 80 ? ", это меньше 80%" : ""}`} · ≈ ${c === "V" ? 30 : 40} мин`,
          href: `./?l=${tag}&p=${xPart(tag)}`, need: hp !== null && hp < 80, opt: hp !== null && hp >= 80, res: xs });
        if (c === "V" && HARD_AFTER[n]) { const x = HARD_AFTER[n];
          week.push({ id: x, crs: tg, t: `Сложные вопросы: ${HARD[x]}`, s: "12 авторских вопросов повышенной сложности, таймер 14 мин · ≈ 25 мин с разбором", href: `practice.html?s=${x}`, res: store(`px_last_${student()}_${x}`) }); }
      }
      if (MOCK_AFTER[n] && n < 12) week.push(mockItem(MOCK_AFTER[n]));
      if (n === 11) week.push({ id: "bluebook", t: "Официальный пробный тест в Bluebook", need: true,
        s: `В приложении Bluebook: Practice and Prepare → Full-Length Practice, любой тест, который вы ещё не решали · ${course === "VM" ? "весь тест, ≈ 2 ч 15 мин" : `весь тест или только ${course === "V" ? "Reading and Writing" : "Math"}`} · на уроке 12 разбираем ваш отчёт (score report)` });
      if (n < 12) eve.push({ id: `vt-${n}`, t: "Тест по словам", s: `Напечатайте по памяти перевод слов ${n > 1 ? `уроков ${n - 1} и ${n}` : "урока 1"} · ≈ 5 мин`,
        href: `vocab.html?l=${cs.flatMap((c) => (n > 1 ? [`${c}${nn(n - 1)}`, `${c}${nn(n)}`] : [`${c}01`])).join(",")}` });
      const title = cs.map((c) => (course === "VM" ? `${NAME[c]}: ${TOPIC[c][n - 1]}` : TOPIC[c][n - 1])).join(" · ");
      out.push({ no: nn(n), cap: `Урок ${n}`, title, inclass: cs.map((c) => `${course === "VM" ? NAME[c] + ": " : ""}${inClass(`${c}${nn(n)}`)}`).join(" · "),
        items: [{ when: "Сразу после урока", list: now }, { when: "В течение недели", list: week }, eve.length && { when: "Накануне следующего урока", list: eve }].filter(Boolean) });
    }
    const fin = [mockItem("PT4")];
    if (course !== "M") ["X05", "X06", "X07"].forEach((x) => fin.push({ id: x, t: `Сложные вопросы: ${HARD[x]}`, s: "≈ 25 мин с разбором", href: `practice.html?s=${x}`, res: store(`px_last_${student()}_${x}`) }));
    if (course !== "M") ["PT5", "PT6", "PT7", "PT8"].forEach((x) => fin.push({ id: x, t: `Пробный тест ${x.slice(2)} · Reading and Writing`, opt: true,
      s: "Ещё практика до экзамена, по одному тесту в неделю · 64 мин, лучше за один раз", href: `mock.html?t=${x}`, res: mockDone(x, ["rw"]) }));
    fin.push({ id: "hard-words", t: "Повторите трудные слова", s: "Словарь → колода трудных слов, карточки и тест · по 10 минут в день до экзамена", href: "vocab.html" });
    fin.push({ id: "compare", t: "Сравните пробный тест 4 с тестом 1", s: "Тесты разные по составу, поэтому смотрите не на точный счёт, а на модуль 2 (сложный или лёгкий) и на разделы, которые выросли" });
    out.push({ no: "13", cap: "После курса", title: "Финальная проверка", items: [{ when: "После урока 12", list: fin }] });
    return out;
  }

  function render() {
    loadManual();
    $("courses").querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === course)));
    const S = stages();
    let total = 0, done = 0, cur = null;
    S.forEach((st) => st.items.forEach((g) => g.list.forEach((it) => { it.ok = !!it.res || manual.has(it.id); total++; if (it.ok) done++; })));
    cur = S.find((st) => st.items.some((g) => g.list.some((it) => it.need && !it.ok)));
    $("prog-t").textContent = `${done} из ${total}`;
    $("prog-m").style.width = `${total ? (100 * done) / total : 0}%`;
    $("plan").innerHTML = S.map((st) => {
      const n = st.items.reduce((a, g) => a + g.list.length, 0), d = st.items.reduce((a, g) => a + g.list.filter((x) => x.ok).length, 0);
      return `<section class="stage${st === cur ? " cur" : ""}" id="st-${st.no}"><div class="no">${st.no}<small>${esc(st.cap)}${st === cur && student() ? " · сейчас" : ""}</small></div><div>
        <h2>${esc(st.title)}</h2>${st.inclass ? `<p class="inclass">На уроке: ${esc(st.inclass)}. Пропустили урок — решите эти части на сайте сами.</p>` : ""}
        ${st.items.map((g) => `<div class="when">${esc(g.when)}</div>${g.list.map((it) => `<div class="it${it.ok ? " done" : ""}">
          <input type="checkbox" data-id="${esc(it.id)}"${it.ok ? " checked" : ""}${it.res ? ' data-auto="1" title="Сдано на сайте"' : ""} aria-label="${esc(it.t)}">
          <div><div class="t">${it.crs ? `<span class="crs">${it.crs === "V" ? "VERBAL" : "MATH"}</span>` : ""}<span class="nm">${esc(it.t)}</span>${it.need && !it.ok ? '<span class="need">обязательно</span>' : ""}${it.opt && !it.ok ? '<span class="opt2">по желанию</span>' : ""}${it.res ? `<span class="res">${esc(it.res)}</span>` : ""}</div><small>${esc(it.s || "")}</small></div>
          ${it.href ? `<a class="go" href="${esc(it.href)}">Открыть →</a>` : "<span></span>"}</div>`).join("")}`).join("")}
        <p class="sum">Сделано ${d} из ${n}</p></div></section>`;
    }).join("");
    $("plan").querySelectorAll("input[data-auto]").forEach((c) => (c.onclick = (e) => e.preventDefault()));   // submitted on the site: stays ticked
    $("plan").querySelectorAll("input[type=checkbox]:not([data-auto])").forEach((c) => (c.onchange = () => {
      c.checked ? manual.add(c.dataset.id) : manual.delete(c.dataset.id);
      store(doneKey(), JSON.stringify([...manual])); render();
    }));
  }

  $("student").value = student();
  $("student").oninput = () => { store("hw_student", $("student").value.trim()); render(); };
  $("courses").querySelectorAll(".chip").forEach((b) => (b.onclick = () => { course = b.dataset.c; store("plan_course", course); render(); }));
  $("print").onclick = () => window.print();
  const want = new URLSearchParams(location.search).get("c");
  if (["V", "M", "VM"].includes(want)) course = want;
  render();
  if (location.hash) { const el = document.querySelector(location.hash); if (el) el.scrollIntoView(); }
})();
