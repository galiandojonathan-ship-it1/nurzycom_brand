// Course plan logic, shared by «План курса» (plan.js) and the «Сегодня» panel on the homework page (today.js), so both
// always agree on what is next and what is done. PLAN.stages(course) builds the plan for a course ("V", "M" or "VM");
// an item is done when the site has its result (res) or the student ticked it by hand (plan_done_<name>).
(function () {
  "use strict";
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  // Reads go through rd(): this browser's storage, or, for the teacher's cabinet, one student's synced copy (PLAN.state(c, src))
  let SRC = null;
  const rd = (k) => (SRC ? SRC.get(k) : store(k));
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
  // Math: the Desmos lesson (MD) comes after lesson 6; one Desmos practice set a week after lessons 7–12
  const DESMOS_AFTER = { 7: "D01", 8: "D02", 9: "D03", 10: "D04", 11: "D05", 12: "D06" };
  const DESMOS = { D01: "Графики и нули", D02: "Системы", D03: "Слайдеры", D04: "Функции и регрессия", D05: "Списки и статистика", D06: "Окружности, неравенства, тригонометрия" };
  const NAME = { V: "SAT Verbal", M: "SAT Math" };
  // workbook part ids (V01 opens with a cold start, V04 has two practice parts)
  const hwPart = (tag) => (tag === "V01" || tag === "V04" ? "p4" : "p3");
  const xPart = (tag) => (tag === "V01" || tag === "V04" ? "p5" : "p4");
  const inClass = (tag) => (tag === "V01" ? "Холодный старт, Практика, Финальный тест" : tag === "V04" ? "Две части практики, Финальный тест" : "Практика, Финальный тест");

  let course = "V";
  const student = () => (SRC ? SRC.name : (store("hw_student") || "").trim());
  const doneKey = () => `plan_done_${student()}`;
  let manual = new Set();
  const loadManual = () => { try { manual = new Set(JSON.parse(rd(doneKey()) || "[]")); } catch (e) { manual = new Set(); } };

  // results the other pages store after a submission
  const hwScore = (tag, pid) => rd(`hw_last_${student()}_${tag}_${pid}`);
  const pct = (s) => { const m = /^(\d+)\/(\d+)$/.exec(s || ""); return m && +m[2] ? (100 * +m[1]) / +m[2] : null; };
  function mockDone(id, secs) {
    const last = rd(`mk_last_${student()}_${id}`) || "";
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
        if (c === "V") week.push({ id: `T${nn(n)}`, crs: tg, t: `Текст ${n}: «${TEXT[n - 1]}»`, s: "Рассказ со словами урока и 6 вопросов · ≈ 15 мин", href: `reading.html?t=T${nn(n)}`, res: rd(`rd_last_${student()}_T${nn(n)}`) });
        const xs = hwScore(tag, xPart(tag));
        week.push({ id: `${tag}-extra`, crs: tg, t: "Дополнительное ДЗ", s: `${hp === null ? "Нужно, если в домашнем задании меньше 80% с первой попытки" : `В домашнем задании ${Math.round(hp)}% с первой попытки${hp < 80 ? ", это меньше 80%" : ""}`} · ≈ ${c === "V" ? 30 : 40} мин`,
          href: `./?l=${tag}&p=${xPart(tag)}`, need: hp !== null && hp < 80, opt: hp !== null && hp >= 80, res: xs });
        if (c === "M" && DESMOS_AFTER[n]) { const x = DESMOS_AFTER[n];
          week.push({ id: x, crs: tg, t: `Desmos: набор ${Number(x.slice(1))} · ${DESMOS[x]}`, s: "8 задач с подсказкой «как набрать» и разбором в Desmos · ≈ 20 мин", href: `desmos.html?s=${x}`, res: rd(`hw_last_${student()}_${x}_p1`) }); }
        if (c === "M" && n === 10) week.push({ id: "unit-circle", crs: tg, t: "Единичная окружность: правила и 4 набора задач", s: "Радианы, особые углы, четверти, sin и cos дополнительных углов · по набору за раз, ≈ 15 мин каждый", href: "circle.html",
          res: ["U01", "U02", "U03", "U04"].every((u) => rd(`hw_last_${student()}_${u}_p1`)) ? "4 набора" : null });
        if (c === "V" && HARD_AFTER[n]) { const x = HARD_AFTER[n];
          week.push({ id: x, crs: tg, t: `Сложные вопросы: ${HARD[x]}`, s: "12 авторских вопросов повышенной сложности, таймер 14 мин · ≈ 25 мин с разбором", href: `practice.html?s=${x}`, res: rd(`px_last_${student()}_${x}`) }); }
      }
      if (MOCK_AFTER[n] && n < 12) week.push(mockItem(MOCK_AFTER[n]));
      if (n === 11) week.push({ id: "bluebook", t: "Официальный пробный тест в Bluebook", need: true,
        s: `В приложении Bluebook: Practice and Prepare → Full-Length Practice, любой тест, который вы ещё не решали · ${course === "VM" ? "весь тест, ≈ 2 ч 15 мин" : `весь тест или только ${course === "V" ? "Reading and Writing" : "Math"}`} · на уроке 12 разбираем ваш отчёт (score report)` });
      if (n < 12) eve.push({ id: `vt-${n}`, t: "Тест по словам", s: `Напечатайте по памяти перевод слов ${n > 1 ? `уроков ${n - 1} и ${n}` : "урока 1"} · ≈ 5 мин`,
        href: `vocab.html?l=${cs.flatMap((c) => (n > 1 ? [`${c}${nn(n - 1)}`, `${c}${nn(n)}`] : [`${c}01`])).join(",")}` });
      const title = cs.map((c) => (course === "VM" ? `${NAME[c]}: ${TOPIC[c][n - 1]}` : TOPIC[c][n - 1])).join(" · ");
      out.push({ no: nn(n), cap: `Урок ${n}`, title, inclass: cs.map((c) => `${course === "VM" ? NAME[c] + ": " : ""}${inClass(`${c}${nn(n)}`)}`).join(" · "),
        items: [{ when: "Сразу после урока", list: now }, { when: "В течение недели", list: week }, eve.length && { when: "Накануне следующего урока", list: eve }].filter(Boolean) });
      if (n === 11 && cs.includes("V")) {   // lesson A «Archaic words» (Verbal, mixed review on old texts) comes after lesson 11
        const tg = course === "VM" ? "V" : "";
        out.push({ no: "A", cap: "Урок A", title: course === "VM" ? "SAT Verbal: Archaic words" : "Archaic words: старый английский", inclass: `${course === "VM" ? "SAT Verbal: " : ""}Холодный старт, Практика, Финальный тест на старых текстах`,
          items: [{ when: "Сразу после урока", list: [{ id: "VA-hw", crs: tg, t: "Домашнее задание", s: "20 вопросов на старых текстах: подсказка со словарём по кнопке · ≈ 35 мин", href: "./?l=VA&p=p3", need: true, res: hwScore("VA", "p3") }] },
            { when: "В течение недели", list: [{ id: "VA-cards", crs: tg, t: "Архаичные слова: карточки", s: "59 слов: thou, hath, wherefore, старые значения · ≈ 10 мин", href: "vocab.html?l=VA" },
              { id: "VA-page", crs: tg, t: "Полезное → Архаичные слова: 3 набора", s: "Правила, словарь и наборы A01–A03 по 8 вопросов · ≈ 15 мин каждый", href: "archaic.html",
                res: ["A01", "A02", "A03"].every((u) => rd(`hw_last_${student()}_${u}_p1`)) ? "3 набора" : null }] }] });
      }
      if (n === 6 && cs.includes("M")) {
        const tg = course === "VM" ? "M" : "";
        out.push({ no: "D", cap: "Урок Desmos", title: course === "VM" ? "SAT Math: Desmos" : "Desmos: решать быстрее", inclass: `${course === "VM" ? "SAT Math: " : ""}Холодный старт рукой, Практика, Финальный тест с Desmos`,
          items: [{ when: "Сразу после урока", list: [{ id: "MD-hw", crs: tg, t: "Домашнее задание", s: "Решайте на экране с Desmos: подсказка «как набрать» по кнопке · ≈ 45 мин", href: "./?l=MD&p=p3", need: true, res: hwScore("MD", "p3") }] },
            { when: "В течение недели", list: [{ id: "MD-cards", crs: tg, t: "Термины урока: карточки", s: "20 слов Desmos по-английски · ≈ 10 мин", href: "vocab.html?l=MD" },
              { id: "MD-guide", crs: tg, t: "Страница Desmos: 10 правил и 12 приёмов", s: "Прочитайте и наберите примеры сами · ≈ 20 мин", href: "desmos.html" }] }] });
      }
    }
    const fin = [mockItem("PT4")];
    if (course !== "M") ["X05", "X06", "X07"].forEach((x) => fin.push({ id: x, t: `Сложные вопросы: ${HARD[x]}`, s: "≈ 25 мин с разбором", href: `practice.html?s=${x}`, res: rd(`px_last_${student()}_${x}`) }));
    if (course !== "M") ["PT5", "PT6", "PT7", "PT8"].forEach((x) => fin.push({ id: x, t: `Пробный тест ${x.slice(2)} · Reading and Writing`, opt: true,
      s: "Ещё практика до экзамена, по одному тесту в неделю · 64 мин, лучше за один раз", href: `mock.html?t=${x}`, res: mockDone(x, ["rw"]) }));
    ["PT9", "PT10", "PT11", "PT12"].forEach((x) => { const it = mockItem(x); fin.push(Object.assign(it, { need: false, opt: true, s: `Ещё практика до экзамена, по одному тесту в неделю · ${it.s}` })); });
    ["PT13", "PT14", "PT15", "PT16", "PT17", "PT18", "PT19"].forEach((x) => { const it = mockItem(x); fin.push(Object.assign(it, { need: false, opt: true, s: `Официальные вопросы College Board, по одному тесту в неделю · ${it.s}` })); });
    if (course !== "M") fin.push({ id: "PR1", t: "Прогноз 1 · Reading and Writing", opt: true,
      s: "Авторские вопросы по шаблонам последних реальных тестов · 64 мин, лучше за неделю до экзамена", href: "mock.html?t=PR1", res: mockDone("PR1", ["rw"]) });
    fin.push({ id: "hard-words", t: "Повторите трудные слова", s: "Словарь → колода трудных слов, карточки и тест · по 10 минут в день до экзамена", href: "vocab.html" });
    fin.push({ id: "compare", t: "Сравните пробный тест 4 с тестом 1", s: "Тесты разные по составу, поэтому смотрите не на точный счёт, а на модуль 2 (сложный или лёгкий) и на разделы, которые выросли" });
    out.push({ no: "13", cap: "После курса", title: "Финальная проверка", items: [{ when: "После урока 12", list: fin }] });
    return out;
  }

  // the whole plan with every item marked ok, plus the first required step not done yet
  // src (optional): { name, get(key) } to read another student's copy instead of this browser
  function state(c, src) {
    SRC = src || null;
    try {
      course = ["V", "M", "VM"].includes(c) ? c : rd("plan_course") || "V"; loadManual();
      const S = stages(), flat = []; let total = 0, done = 0;
      S.forEach((st) => st.items.forEach((g) => g.list.forEach((it) => { it.ok = !!it.res || manual.has(it.id); it.hand = !it.res && manual.has(it.id); total++; if (it.ok) done++; flat.push(Object.assign(it, { stage: st, when: g.when })); })));
      return { S, flat, total, done, course };
    } finally { SRC = null; loadManual(); }
  }

  // ---- shared by «Сегодня» and the teacher's cabinet: results, labels, estimated scores, assigned tasks
  const est = (s) => { const m = String(s || "").match(/≈\s*(\d+)/g); return m ? m.reduce((a, x) => a + Number(x.replace(/\D/g, "")), 0) : null; };
  // the trend of practice-test scores on one scale per course: Verbal → RW only, Math → Math only, both → runs with both sections
  // (an RW-only test on the full course would read as a fall to ~600 of 1600). get(key) reads a stored value.
  const TREND_IDS = [...Array.from({ length: 19 }, (_, i) => `PT${i + 1}`), "PR1"];
  function onScale(c, s) { const secs = c === "V" ? ["RW"] : c === "M" ? ["Math"] : ["RW", "Math"];
    const v = secs.map((k) => (String(s || "").match(new RegExp(`(?:^|· )${k} \\d+/\\d+ ≈ (\\d+)`)) || [])[1]); return v.every(Boolean) ? v.reduce((a, x) => a + Number(x), 0) : null; }
  const trend = (c, name, get) => TREND_IDS.map((id) => ({ id, v: onScale(c, get(`mk_last_${name}_${id}`)) })).filter((x) => x.v);
  function label(rest, kind, lessons) {   // a stored result key → what the student did, in the words of the menu
    if (kind === "mk") return /^PR/.test(rest) ? `Прогноз ${rest.slice(2)}` : `Пробный тест ${rest.replace(/^PT/, "")}`;
    if (kind === "rd") return `Текст ${Number(rest.slice(1))}`;
    if (kind === "px") return `Сложные вопросы · набор ${Number(rest.slice(1))}`;
    const [tag, pid] = rest.split("_"), l = lessons && lessons.find((x) => x.tag === tag), p = l && l.parts.find((x) => x.id === pid);
    const head = /^[VM]\d\d$/.test(tag) ? `${tag[0] === "V" ? "Verbal" : "Math"} · урок ${Number(tag.slice(1))}` : /^[ADU]\d\d$/.test(tag) ? `Набор ${tag}` : `Урок ${tag.slice(1)}`;
    return p ? `${head} · ${p.title}` : head;
  }
  const KINDS = [["hw", "hw_last_"], ["px", "px_last_"], ["rd", "rd_last_"], ["mk", "mk_last_"]];
  // every submitted result of this student: keys(), get(k), meta = { key: time it changed }
  function results(name, keys, get, meta, lessons) {
    const out = [];
    for (const k of keys) for (const [kind, pre] of KINDS) {
      const p = `${pre}${name}_`; if (!k.startsWith(p)) continue; const v = get(k); if (!v) continue;
      const rest = k.slice(p.length);
      out.push({ key: k, kind, rest, t: meta[k] || 0, raw: v, label: label(rest, kind, lessons), score: kind === "mk" ? (est(v) ? `≈ ${est(v)}` : v) : v });
    }
    return out.sort((a, b) => b.t - a.t);
  }
  // the keys a reset removes, so the student can do that work again (attempt counts start over too)
  function resetKeys(name, kind, rest) {
    if (kind === "hw") return [`hw_last_${name}_${rest}`, `hw_att_${name}_${rest}`];
    if (kind === "px") return [`px_last_${name}_${rest}`, `px_att_${name}_${rest}`];
    if (kind === "rd") return [`rd_last_${name}_${rest}`, `rd_att_${name}_${rest}`];
    return [`mk_last_${name}_${rest}`, `mk_done_${name}_${rest}`, `mk_att_${name}_${rest}_rw`, `mk_att_${name}_${rest}_math`];
  }
  // tasks the teacher assigned: [{ id, t, href, due, note, at, rk: [prefix, rest] }]; done when the result came after the task
  // was given (rk), or the student ticked it (tasks_done)
  function taskState(name, get, meta) {
    let T = [], D = []; try { T = JSON.parse(get("tasks") || "[]"); } catch (e) { T = []; } try { D = JSON.parse(get("tasks_done") || "[]"); } catch (e) { D = []; }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return (Array.isArray(T) ? T : []).filter((x) => x && x.id && x.t).map((x) => {
      const k = x.rk ? `${x.rk[0]}${name}_${x.rk[1]}` : null, r = k && get(k);
      const done = (r && (meta[k] || 0) >= (x.at || 0) - 6e4) || D.includes(x.id);
      const late = !done && x.due && new Date(x.due + "T23:59:59") < Date.now();
      return Object.assign({}, x, { done: !!done, late: !!late, result: r || null, auto: !!x.rk, soon: !done && !late && x.due && (new Date(x.due + "T00:00:00") - today) / 864e5 <= 1 });
    }).sort((a, b) => a.done - b.done || String(a.due || "9999").localeCompare(String(b.due || "9999")) || b.at - a.at);
  }
  function tick(id, on) { loadManual(); on ? manual.add(id) : manual.delete(id); store(doneKey(), JSON.stringify([...manual])); }
  window.PLAN = { stages: (c) => { course = c; return stages(); }, state, tick, est, trend, label, results, resetKeys, taskState, TEXT, HARD, DESMOS, NAME, manual: () => (loadManual(), manual), doneKey, student, course: () => store("plan_course") || "V" };
})();
