// Timed adaptive mock tests in the Bluebook format: Reading and Writing (2 × 27 questions, 32 min), a 10-minute break,
// Math (2 × 22, 35 min). Module 1 decides whether module 2 is the harder or the easier one.
// The whole run is kept in localStorage against fixed deadlines, so a reload or a closed tab continues where it stopped
// and the clock keeps running, as on the real test. Results: raw counts per module and section (no 200–800 estimate).
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const CFG = window.HW_CONFIG || {};
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const SEC = { rw: "Reading and Writing", math: "Math" };
  const DOM = { CAS: "Craft and Structure", INI: "Information and Ideas", SEC: "Standard English Conventions", EOI: "Expression of Ideas",
    H: "Algebra", P: "Advanced Math", Q: "Problem-Solving and Data Analysis", S: "Geometry and Trigonometry" };
  const BREAK = 10 * 60;
  const T = { index: null, mock: null, fmt: "full", bundles: {}, st: null, cur: 0, out: {}, timer: null, hidden: false };

  // Typed answers: exact value rounded half away from zero to 4 decimals (same rule as the key builder and app.js).
  function parseSpr(raw) {
    let s = String(raw).trim().replace(/[−–—]/g, "-");
    if (/\s/.test(s)) return null;
    if (/^-?\d*,\d+$/.test(s)) s = s.replace(",", ".");
    let num, den;
    if (/^-?\d+\/\d+$/.test(s)) { const [a, b] = s.split("/"); num = BigInt(a); den = BigInt(b); }
    else if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) {
      const neg = s.startsWith("-"); const t = neg ? s.slice(1) : s; const [i, f = ""] = t.split(".");
      den = 10n ** BigInt(f.length); num = BigInt((i || "0") + f) * (neg ? -1n : 1n);
    } else return null;
    if (den === 0n) return null;
    const sign = (num < 0n) !== (den < 0n) ? -1n : 1n;
    const an = num < 0n ? -num : num, ad = den < 0n ? -den : den;
    let q = (an * 10000n) / ad; const r = (an * 10000n) % ad;
    if (2n * r >= ad) q += 1n;
    if (q === 0n) return "0.0000";
    const str = q.toString().padStart(5, "0");
    return (sign < 0n ? "-" : "") + str.slice(0, -4) + "." + str.slice(-4);
  }

  function show(id) { ["m-start", "m-dir", "m-test", "m-check", "m-break", "m-result"].forEach((s) => $(s).classList.toggle("hidden", s !== id)); window.scrollTo(0, 0); }
  const student = () => store("hw_student") || "";
  const stKey = (mid) => `mk_state_${student()}_${mid}`;
  const lastKey = (mid) => `mk_last_${student()}_${mid}`;
  function save() { if (T.st) store(stKey(T.st.mid), JSON.stringify(T.st)); }
  function load(mid) { try { return JSON.parse(store(stKey(mid))); } catch (e) { return null; } }

  // ---- start screen
  function renderStart() {
    $("student").value = student();
    const card = (m) => {
      const run = load(m.id), last = store(lastKey(m.id));
      const status = run && run.phase !== "done" ? "в процессе" : last ? `последний: ${esc(last)}` : "не начат";
      return `<button class="mcard" data-m="${m.id}" aria-pressed="${T.mock && T.mock.id === m.id}"><span class="no">${m.id.slice(2)}</span>
        <span class="t">${esc(m.title)}</span><small>${m.sections.map((s) => `${s.name}: ${2 * s.n} вопросов`).join(" · ")}</small><span class="label">${status}</span></button>`;
    };
    const full = T.index.mocks.filter((m) => !m.only), rw = T.index.mocks.filter((m) => m.only === "rw");
    $("mocks").innerHTML = `<div class="course-h" style="grid-column:1/-1"><b>Полные тесты</b><span class="label">Reading and Writing и Math</span></div>${full.map(card).join("")}`
      + (rw.length ? `<div class="course-h" style="grid-column:1/-1;margin-top:18px"><b>Тесты Reading and Writing</b><span class="label">только авторские вопросы nurzycom</span></div>${rw.map(card).join("")}` : "");
    $("mocks").querySelectorAll(".mcard").forEach((b) => (b.onclick = () => { T.mock = T.index.mocks.find((m) => m.id === b.dataset.m); renderStart(); }));
    $("formats").querySelectorAll(".pick").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.f === fmt())); b.disabled = !!(T.mock && T.mock.only && b.dataset.f !== T.mock.only); });
    $("fmt-note").classList.toggle("hidden", !(T.mock && T.mock.only));
    ready();
  }
  const fmt = () => (T.mock && T.mock.only) || T.fmt;   // a Reading and Writing test has only one format
  function ready() { $("go").disabled = !($("student").value.trim().length >= 2 && T.mock); }
  $("student").oninput = () => { store("hw_student", $("student").value.trim()); renderStart(); };
  $("formats").querySelectorAll(".pick").forEach((b) => (b.onclick = () => { T.fmt = b.dataset.f; renderStart(); }));

  async function bundle(sec) {
    const s = T.mock.sections.find((x) => x.k === sec);
    if (!T.bundles[s.b]) T.bundles[s.b] = JSON.parse(new TextDecoder().decode(await SITE.open(await (await fetch(s.b, { cache: "no-store" })).arrayBuffer())));
    return T.bundles[s.b];
  }
  const secInfo = (sec) => T.mock.sections.find((x) => x.k === sec);
  const curSec = () => T.st.secs[T.st.si];
  const mkey = () => `${curSec()}.${T.st.mod}`;
  const items = () => T.bundles[secInfo(curSec()).b].mods[T.st.mod];

  async function begin() {
    store("hw_student", $("student").value.trim());
    const old = load(T.mock.id);
    if (old && old.phase !== "done" && confirm("Этот тест уже начат. Продолжить с того же места? «Отмена» начнёт тест заново.")) T.st = old;
    else T.st = { mid: T.mock.id, secs: fmt() === "full" ? ["rw", "math"] : [fmt()], si: 0, mod: "m1", phase: "dir", deadline: 0, ans: {}, mk: {}, res: {}, sent: {} };
    $("start-msg").textContent = "Загружаю тест…";
    try { for (const s of T.st.secs) await bundle(s); }
    catch (e) { $("start-msg").textContent = "Не удалось загрузить тест. Обновите страницу."; return; }
    $("start-msg").textContent = "";
    save(); resume();
  }
  // Puts the screen in line with the saved phase; a deadline that passed while the page was closed is applied here.
  function resume() {
    clearInterval(T.timer); T.out = {};
    const p = T.st.phase;
    if (p === "test" || p === "check") { if (Date.now() >= T.st.deadline) return submitModule(true); T.cur = 0; T.timer = setInterval(tick, 500); tick(); p === "test" ? openTest() : openCheck(); }
    else if (p === "break") { if (Date.now() >= T.st.deadline) return nextSection(); T.timer = setInterval(tickBreak, 500); tickBreak(); show("m-break"); }
    else if (p === "done") results();
    else directions();
  }

  // ---- directions before each module
  function directions() {
    const sec = curSec(), s = secInfo(sec), m2 = T.st.mod !== "m1";
    $("dir-label").textContent = `${T.mock.title} · ${s.name}`;
    $("dir-title").textContent = `Модуль ${m2 ? 2 : 1}`;
    $("dir-n").textContent = s.n; $("dir-min").textContent = `${s.min} мин`;
    const rules = sec === "rw"
      ? ["Каждый вопрос — короткий текст или пара текстов и один вопрос с четырьмя вариантами.", "Внутри модуля можно отмечать вопросы, вычёркивать варианты и возвращаться назад."]
      : ["В вопросах с вариантами выберите один ответ. В остальных впишите число: целое, дробь 7/2 или десятичную .75.", "Калькулятор Desmos и справочник формул — кнопки справа вверху, как в Bluebook."];
    rules.push(m2 ? "Этот модуль подобран по результату первого." : "От результата этого модуля зависит, каким будет второй: сложнее или легче.",
      "Когда время закончится, модуль сдастся сам. После сдачи к модулю вернуться нельзя.");
    $("dir-rules").innerHTML = rules.map((r) => `<li>${esc(r)}</li>`).join("");
    show("m-dir");
  }
  $("dir-go").onclick = () => {
    T.st.phase = "test"; T.st.deadline = Date.now() + secInfo(curSec()).min * 60000;
    T.st.ans[mkey()] = T.st.ans[mkey()] || {}; T.st.mk[mkey()] = T.st.mk[mkey()] || [];
    save(); resume();
  };
  $("dir-exit").onclick = home;
  function home() { clearInterval(T.timer); if (window.BBTools) BBTools.close(); renderStart(); show("m-start"); }

  // ---- timer
  function left() { return Math.max(0, Math.ceil((T.st.deadline - Date.now()) / 1000)); }
  function tick() {
    const s = left(), low = s <= 300;
    $("clock").textContent = mmss(s); $("chk-clock").textContent = mmss(s);
    $("timer").classList.toggle("low", low);
    $("timer").classList.toggle("hide", T.hidden && !low);   // Bluebook shows the clock again for the last 5 minutes
    $("hide-t").classList.toggle("hidden", low);
    if (s === 0) submitModule(true);
  }
  $("hide-t").onclick = () => { T.hidden = !T.hidden; $("hide-t").textContent = T.hidden ? "Показать" : "Скрыть"; tick(); };

  // ---- one question
  function openTest() {
    const sec = curSec(), s = secInfo(sec);
    $("t-title").textContent = `${s.name} · Модуль ${T.st.mod === "m1" ? 1 : 2}`;
    $("wrap").classList.toggle("one", sec === "math");
    if (window.BBTools) { if (!$("t-tools").childElementCount) BBTools.mount($("t-tools")); BBTools.show(sec === "math"); }
    show("m-test"); render();
  }
  function render() {
    const its = items(), q = its[T.cur], A = T.st.ans[mkey()], math = curSec() === "math";
    $("passage").innerHTML = math ? "" : q.stim; $("passage").classList.toggle("hidden", math || !q.stim);
    $("stem").innerHTML = (math ? q.stim : "") + q.stem;
    $("qnum").textContent = q.n; $("qn").textContent = `из ${its.length}`;
    $("flag").setAttribute("aria-pressed", String(T.st.mk[mkey()].includes(q.n)));
    const out = T.out[q.n] || new Set();
    if (q.t === "mc") {
      $("opts").innerHTML = q.opts.map((o, k) => { const c = "ABCD"[k];
        return `<div class="opt${A[q.n] === c ? " on" : ""}${out.has(c) ? " out" : ""}"><button class="ch" data-c="${c}"><span class="lt">${c}</span><span class="tx qhtml">${o}</span></button><button class="x" data-c="${c}" aria-label="Вычеркнуть ${c}" title="Вычеркнуть">${out.has(c) ? "↺" : "×"}</button></div>`; }).join("");
      $("opts").querySelectorAll(".ch").forEach((b) => (b.onclick = () => choose(b.dataset.c)));
      $("opts").querySelectorAll(".x").forEach((b) => (b.onclick = () => strike(b.dataset.c)));
    } else {
      $("opts").innerHTML = `<div class="spr"><label class="label" for="m-in">Ваш ответ</label><input id="m-in" type="text" autocomplete="off" value="${esc(A[q.n] || "")}">
        <p class="hint" id="m-in-h"></p></div>`;
      const hint = () => { const v = $("m-in").value.trim(); $("m-in-h").textContent = !v ? "Целое, дробь 7/2 или десятичная .75. Смешанные числа (3 1/2) не принимаются."
        : parseSpr(v) === null ? "Формат: 12, -3, 7/2 или .75" : /,/.test(v) ? "На экзамене пишите точку: .5, а не ,5" : "Ответ: " + v; };
      $("m-in").oninput = () => { const v = $("m-in").value.trim(); if (v) A[q.n] = v; else delete A[q.n]; save(); hint(); renderGrid(); };
      hint();
    }
    $("prev").disabled = T.cur === 0;
    $("next").textContent = T.cur === its.length - 1 ? "К проверке →" : "Далее →";
    $("navbtn").textContent = `${q.n} из ${its.length} ▴`;
    renderGrid();
  }
  function gridHtml(cls) {
    const A = T.st.ans[mkey()], M = T.st.mk[mkey()];
    return items().map((q, k) => `<button data-k="${k}" class="${A[q.n] ? "ans" : ""}${cls && k === T.cur ? " cur" : ""}${M.includes(q.n) ? " mk" : ""}">${q.n}</button>`).join("");
  }
  function renderGrid() {
    $("grid").innerHTML = gridHtml(true);
    $("grid").querySelectorAll("button").forEach((b) => (b.onclick = () => go(Number(b.dataset.k))));
  }
  function choose(c) { const q = items()[T.cur]; T.st.ans[mkey()][q.n] = c; if (T.out[q.n]) T.out[q.n].delete(c); save(); render(); }
  function strike(c) {
    const q = items()[T.cur], A = T.st.ans[mkey()], o = T.out[q.n] || (T.out[q.n] = new Set());
    if (o.has(c)) o.delete(c); else { o.add(c); if (A[q.n] === c) { delete A[q.n]; save(); } }
    render();
  }
  function go(k) { T.cur = Math.max(0, Math.min(items().length - 1, k)); $("navpanel").classList.add("hidden"); if (T.st.phase !== "test") { T.st.phase = "test"; save(); show("m-test"); } render(); window.scrollTo(0, 0); }
  $("prev").onclick = () => go(T.cur - 1);
  $("next").onclick = () => (T.cur === items().length - 1 ? openCheck() : go(T.cur + 1));
  $("navbtn").onclick = () => $("navpanel").classList.toggle("hidden");
  $("closenav").onclick = () => $("navpanel").classList.add("hidden");
  $("to-check").onclick = () => openCheck();
  $("flag").onclick = () => { const n = items()[T.cur].n, M = T.st.mk[mkey()], k = M.indexOf(n); k < 0 ? M.push(n) : M.splice(k, 1); save(); render(); };
  document.addEventListener("keydown", (e) => {
    if ($("m-test").classList.contains("hidden") || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const k = e.key.toUpperCase(), q = items()[T.cur];
    if (q.t === "mc" && k.length === 1 && "ABCD".includes(k)) choose(k);
    else if (e.key === "ArrowRight" && T.cur < items().length - 1) go(T.cur + 1);
    else if (e.key === "ArrowLeft") go(T.cur - 1);
  });

  // ---- check your work, then submit the module
  function openCheck() {
    $("navpanel").classList.add("hidden"); if (window.BBTools) BBTools.close();
    T.st.phase = "check"; save();
    const its = items(), A = T.st.ans[mkey()], M = T.st.mk[mkey()];
    $("chk-label").textContent = `${secInfo(curSec()).name} · Модуль ${T.st.mod === "m1" ? 1 : 2}`;
    $("chk-grid").innerHTML = gridHtml(false);
    $("chk-grid").querySelectorAll("button").forEach((b) => (b.onclick = () => go(Number(b.dataset.k))));
    const blank = its.filter((q) => !A[q.n]).map((q) => q.n);
    $("chk-sum").textContent = `Отвечено: ${its.length - blank.length} из ${its.length}.${blank.length ? ` Без ответа: ${blank.join(", ")}.` : ""}${M.length ? ` Отмечены: ${[...M].sort((a, b) => a - b).join(", ")}.` : ""}`;
    show("m-check"); tick();
  }
  $("chk-back").onclick = () => go(T.cur);
  $("chk-submit").onclick = () => submitModule(false);

  const right = (q, a) => !!a && (q.t === "mc" ? a === q.acc[0] : q.acc.includes(parseSpr(a)));
  function submitModule(auto) {
    if (!T.st || (T.st.phase !== "test" && T.st.phase !== "check")) return;
    clearInterval(T.timer); if (window.BBTools) BBTools.close();
    const sec = curSec(), s = secInfo(sec), its = items(), A = T.st.ans[mkey()] || {};
    const raw = its.filter((q) => right(q, A[q.n])).length;
    const used = Math.min(s.min * 60, s.min * 60 - Math.max(0, Math.ceil((T.st.deadline - Date.now()) / 1000)));
    (T.st.res[sec] = T.st.res[sec] || {})[T.st.mod] = { raw, n: its.length, sec: used, auto };
    if (T.st.mod === "m1") { T.st.mod = raw >= s.route ? "m2h" : "m2e"; T.st.phase = "dir"; save(); if (auto) alert("Время модуля 1 закончилось: модуль сдан."); return resume(); }
    if (auto) alert("Время модуля 2 закончилось: модуль сдан.");
    if (T.st.si < T.st.secs.length - 1) { T.st.phase = "break"; T.st.deadline = Date.now() + BREAK * 1000; save(); return resume(); }
    T.st.phase = "done"; save(); resume();
  }
  function tickBreak() { const s = left(); $("brk-clock").textContent = mmss(s); if (s === 0) nextSection(); }
  function nextSection() { clearInterval(T.timer); T.st.si++; T.st.mod = "m1"; T.st.phase = "dir"; save(); resume(); }
  $("brk-go").onclick = nextSection;

  // ---- results, review and sending
  function modsOf(sec) { const r = T.st.res[sec]; return ["m1", r.m2h ? "m2h" : "m2e"]; }
  function results() {
    clearInterval(T.timer);
    const parts = [];
    $("res-title").textContent = `${T.mock.title} · результат`;
    $("res-secs").innerHTML = T.st.secs.map((sec) => {
      const r = T.st.res[sec], [, m2] = modsOf(sec), b = T.bundles[secInfo(sec).b];
      const tot = r.m1.raw + r[m2].raw, n = r.m1.n + r[m2].n, secs = r.m1.sec + r[m2].sec;
      parts.push(`${sec === "rw" ? "RW" : "Math"} ${tot}/${n}`);
      const dom = {};
      for (const mod of ["m1", m2]) for (const q of b.mods[mod]) { const d = dom[q.dom] || (dom[q.dom] = [0, 0]); d[1]++; if (right(q, T.st.ans[`${sec}.${mod}`][q.n])) d[0]++; }
      return `<div class="secres"><span class="label">${SEC[sec]}</span>
        <div class="result-grid"><div><div class="big">${tot}/${n}</div><div class="meter"><i style="width:${(100 * tot) / n}%"></i></div></div>
        <div class="stats"><div><span class="label">Модуль 1</span><b>${r.m1.raw}/${r.m1.n}</b></div><div><span class="label">Модуль 2 · ${m2 === "m2h" ? "сложный" : "лёгкий"}</span><b>${r[m2].raw}/${r[m2].n}</b></div>
        <div><span class="label">Время</span><b>${Math.floor(secs / 60)} мин ${secs % 60} с</b></div><div><span class="label">Верно</span><b>${Math.round((100 * tot) / n)}%</b></div></div></div>
        <div style="margin-top:14px">${Object.entries(dom).map(([d, [a, k]]) => `<div class="dom"><span>${DOM[d] || d}</span><span class="bar2"><i style="width:${(100 * a) / k}%"></i></span><span class="mono">${a}/${k}</span></div>`).join("")}</div></div>`;
    }).join("") + `<p class="hint" style="margin-top:18px">Здесь показано число верных ответов. Шкалу 200–800 считает только College Board: для оценки балла решите официальный тест в Bluebook. ${T.st.secs.some((s) => T.st.res[s].m2e) ? "Лёгкий второй модуль на настоящем экзамене ограничивает максимальный балл: стоит подтянуть первый модуль." : ""}</p>`;
    store(lastKey(T.st.mid), parts.join(" · "));
    $("review").classList.add("hidden"); $("res-review").textContent = "Разбор вопросов";
    show("m-result"); send();
  }
  $("res-review").onclick = () => {
    const r = $("review"); if (!r.classList.contains("hidden")) { r.classList.add("hidden"); $("res-review").textContent = "Разбор вопросов"; return; }
    r.innerHTML = T.st.secs.map((sec) => modsOf(sec).map((mod) => {
      const its = T.bundles[secInfo(sec).b].mods[mod], A = T.st.ans[`${sec}.${mod}`];
      return `<div class="revmod"><span class="label">${SEC[sec]} · Модуль ${mod === "m1" ? "1" : `2 · ${mod === "m2h" ? "сложный" : "лёгкий"}`}</span>${its.map((q) => {
        const a = A[q.n], ok = right(q, a);
        const opts = q.t === "mc" ? q.opts.map((o, k) => { const c = "ABCD"[k];
          return `<div class="ropt${c === q.ans ? " right" : ""}${a === c ? " mine" : ""}"><span class="lt">${c}</span><span class="qhtml">${o}</span>${c === q.ans ? '<span class="tg">верный</span>' : a === c ? '<span class="tg">ваш ответ</span>' : ""}</div>`; }).join("") : "";
        return `<details class="rv"><summary><span class="mk ${ok ? "ok" : "no"}">${q.n}</span><span><b>${ok ? "Верно" : a ? "Ошибка" : "Без ответа"}</b><br><small>Ваш ответ: ${esc(a || "—")} · верный: ${esc(q.ans)} · ${esc(q.sk)}${q.own ? " · авторский вопрос" : ""}</small></span></summary>
          <div class="rbody">${q.stim ? `<div class="qhtml">${q.stim}</div>` : ""}<div class="qhtml">${q.stem}</div>${opts}<div class="sv-expl"><span class="label">${q.own ? "Разбор nurzycom · авторский вопрос" : "Объяснение College Board"}</span><div class="qhtml">${q.rat}</div></div></div></details>`;
      }).join("")}</div>`;
    }).join("")).join("");
    r.classList.remove("hidden"); $("res-review").textContent = "Скрыть разбор";
  };
  $("res-home").onclick = home;

  async function send() {
    const f = CFG.fields || {}, todo = T.st.secs.filter((s) => !T.st.sent[s]);
    if (!todo.length) { $("send-status").textContent = "Результат отправлен преподавателю."; return; }
    if (!CFG.formAction) { $("send-status").textContent = "Отправка не настроена: пришлите скриншот результата преподавателю."; return; }
    $("send-status").textContent = "Отправляю…";
    try {
      for (const sec of todo) {
        const r = T.st.res[sec], [, m2] = modsOf(sec), b = T.bundles[secInfo(sec).b];
        const ans = [], wrong = [];
        ["m1", m2].forEach((mod, k) => b.mods[mod].forEach((q) => { const a = T.st.ans[`${sec}.${mod}`][q.n]; ans.push(`${k + 1}.${q.n}:${a || "-"}`); if (!right(q, a)) wrong.push(`${k + 1}.${q.n}`); }));
        const ak = `mk_att_${student()}_${T.st.mid}_${sec}`, attempt = Number(store(ak) || 0) + 1;
        const res = { student: student(), lesson: T.st.mid, part: `${sec === "rw" ? "RW" : "Math"} · M1 ${r.m1.raw}/${r.m1.n} · M2 ${m2 === "m2h" ? "сложный" : "лёгкий"} ${r[m2].raw}/${r[m2].n}`,
          answers: ans.join(" "), score: `${r.m1.raw + r[m2].raw}/${r.m1.n + r[m2].n}`, wrong: wrong.join(","), seconds: String(r.m1.sec + r[m2].sec), attempt: String(attempt) };
        const body = new URLSearchParams(); Object.keys(res).forEach((k) => f[k] && body.append(f[k], res[k]));
        await fetch(CFG.formAction, { method: "POST", mode: "no-cors", body });
        store(ak, String(attempt)); T.st.sent[sec] = true; save();
      }
      $("send-status").textContent = "Результат отправлен преподавателю.";
    } catch (e) { $("send-status").textContent = "Не удалось отправить (нет интернета?). Сделайте скриншот результата и пришлите преподавателю в Telegram."; }
  }

  $("go").onclick = begin;
  SITE.json("mocks").then((d) => {
    T.index = d; renderStart();
    const want = new URLSearchParams(location.search).get("t");
    if (want) { T.mock = d.mocks.find((m) => m.id === want) || null; renderStart(); }
  }).catch(() => { $("start-msg").textContent = "Не удалось загрузить тесты. Обновите страницу."; });
  window.__mock = { parseSpr, state: () => T.st };   // for testing
})();
