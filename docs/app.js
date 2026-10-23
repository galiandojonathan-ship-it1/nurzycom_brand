// nurzycom homework checker: grades answers against hashed keys, sends the result to a Google Form.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const CFG = window.HW_CONFIG || {};
  const state = { data: null, lesson: null, part: null, answers: {}, t0: 0, timer: null };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function show(id) { ["s-start", "s-answers", "s-solve", "s-result"].forEach((s) => $(s).classList.toggle("hidden", s !== id)); window.scrollTo(0, 0); }

  async function sha(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  }

  // Student-produced response: exact value, rounded half away from zero to 4 decimals (same as the key builder).
  function parseSpr(raw) {
    let s = String(raw).trim().replace(/[−–—]/g, "-");
    if (/\s/.test(s)) return null;  // mixed numbers like 3 1/2 are not accepted on the test
    if (/^-?\d*,\d+$/.test(s)) s = s.replace(",", ".");
    let num, den;
    if (/^-?\d+\/\d+$/.test(s)) {
      const [a, b] = s.split("/"); num = BigInt(a); den = BigInt(b);
    } else if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) {
      const neg = s.startsWith("-"); const t = neg ? s.slice(1) : s;
      const [i, f = ""] = t.split(".");
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

  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lastKey = (tag, pid) => `hw_last_${store("hw_student") || ""}_${tag}_${pid}`;

  function renderStart() {
    const courses = [["V", "SAT Verbal", "Reading & Writing"], ["M", "SAT Math", "Math"]];
    $("lessons").innerHTML = courses.map(([c, name, sub]) => {
      const ls = state.data.lessons.filter((l) => l.tag[0] === c);
      return `<div><div class="course-h"><b>${name}</b><span class="label">${ls.length} уроков · ${sub}</span></div><div class="tiles">${ls.map((l) => {
        const nm = l.title.split(" · ").slice(2).join(" · ");
        const done = l.parts.filter((p) => store(lastKey(l.tag, p.id))).length;
        return `<button class="tile" data-l="${l.tag}" aria-pressed="false" title="${esc(l.title)}"><span class="no">${String(Number(l.tag.slice(1))).padStart(2, "0")}</span><span class="nm">${esc(nm)}</span>${done ? `<span class="dot">${done}/${l.parts.length}</span>` : ""}</button>`;
      }).join("")}</div></div>`;
    }).join("");
    $("lessons").querySelectorAll(".tile").forEach((b) => (b.onclick = () => { pickLesson(b.dataset.l); $("step-part").scrollIntoView({ behavior: "smooth", block: "start" }); }));
    $("student").value = store("hw_student") || "";
    $("student").oninput = check;
    const params = new URLSearchParams(location.search);
    if (params.get("l")) pickLesson(params.get("l")); else renderParts();
    if (params.get("p")) pickPart(params.get("p"));
  }
  function pickLesson(tag) {
    state.lesson = state.data.lessons.find((x) => x.tag === tag) || null;
    $("lessons").querySelectorAll(".tile").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.l === tag)));
    renderParts();
  }
  function pickPart(pid) { const b = $("parts").querySelector(`.pick[data-p="${pid}"]`); if (b) b.click(); }
  function renderParts() {
    const l = state.lesson; state.part = null;
    $("parts-empty").classList.toggle("hidden", !!l);
    $("part-lesson").textContent = l ? l.title.replace(/ · Урок /, " · ") : "";
    $("parts").innerHTML = l ? l.parts.map((p) => {
      const last = store(lastKey(l.tag, p.id));
      return `<button class="pick part" data-p="${p.id}" aria-pressed="false"><span><span class="t">${esc(p.title)}</span><span class="tag">${p.mode === "test" ? "как на экзамене" : "2 попытки · объяснения"}</span><small>${p.q.length} вопросов · ${p.q[0].n}–${p.q[p.q.length - 1].n}</small></span><span class="r">${last ? "последний: " + last : "→"}</span></button>`;
    }).join("") : "";
    $("parts").querySelectorAll(".pick").forEach((b) => (b.onclick = () => {
      $("parts").querySelectorAll(".pick").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      state.part = l.parts.find((p) => p.id === b.dataset.p); check();
    }));
    check();
  }
  function check() {
    const ready = $("student").value.trim().length >= 2 && state.lesson && state.part;
    $("go").disabled = !ready;
    $("go-paper").disabled = !ready;
  }

  async function startAnswers() {
    store("hw_student", $("student").value.trim());
    const { lesson, part } = state; state.answers = {};
    state.mode = "paper";
    $("ans-title").textContent = `${lesson.tag} · ${part.title}`;
    const qs = part.q;
    const ctrl = (q) => q.t === "mc"
      ? `<div class="opts">${"ABCD".split("").map((c) => `<button data-n="${q.n}" data-c="${c}" aria-pressed="false">${c}</button>`).join("")}</div>`
      : `<div><input type="text" inputmode="text" data-n="${q.n}" autocomplete="off" aria-label="Ответ ${q.n}"><div class="hint" id="h${q.n}"></div></div>`;
    $("qs").innerHTML = qs.map((q) => `<div class="q"><span class="n">${q.n}</span>${ctrl(q)}</div>`).join("");
    $("qs").querySelectorAll(".opts button").forEach((b) => (b.onclick = () => {
      const n = b.dataset.n;
      b.parentNode.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      state.answers[n] = b.dataset.c; count();
    }));
    $("qs").querySelectorAll("input").forEach((inp) => (inp.oninput = () => {
      const n = inp.dataset.n, v = inp.value.trim();
      if (v) state.answers[n] = v; else delete state.answers[n];
      const ok = !v || parseSpr(v) !== null;
      $("h" + n).textContent = ok ? (/,/.test(v) ? "На экзамене пишите точку: .5, а не ,5" : "") : "Формат: 12, -3, 7/2 или .75";
      count();
    }));
    state.t0 = Date.now(); clearInterval(state.timer);
    state.timer = setInterval(() => { const s = Math.floor((Date.now() - state.t0) / 1000); $("clock").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }, 1000);
    count(); show("s-answers");
  }
  function count() {
    const total = state.part.q.length, n = Object.keys(state.answers).length;
    $("count").textContent = `${n} / ${total}`;
    $("prog").style.width = `${(100 * n) / total}%`;
  }

  async function grade() {
    const { lesson, part, answers } = state;
    const qs = part.q;
    const blanks = qs.filter((q) => !answers[q.n]).map((q) => q.n);
    if (blanks.length && !confirm(`Без ответа: ${blanks.join(", ")}. Сдать всё равно?`)) return;
    clearInterval(state.timer);
    const seconds = Math.round((Date.now() - state.t0) / 1000);
    const wrong = []; let right = 0;
    for (const q of qs) {
      const a = answers[q.n]; let v = null;
      if (a) v = q.t === "mc" ? a : parseSpr(a);
      const ok = v !== null && q.h.includes(await sha(`${lesson.salt}:${q.i}:${v}`));
      if (ok) right++; else wrong.push(q.n);
    }
    const key = `hw_att_${store("hw_student")}_${lesson.tag}_${part.id}`;
    const attempt = Number(store(key) || 0) + 1; store(key, String(attempt));
    const ansStr = qs.map((q) => `${q.n}:${answers[q.n] || "-"}`).join(" ");
    const res = { student: store("hw_student") || $("student").value.trim(), lesson: lesson.tag, part: `${part.id} · ${part.title}`,
      answers: ansStr, score: `${right}/${qs.length}`, wrong: wrong.join(","), seconds: String(seconds), attempt: String(attempt) };
    store(lastKey(lesson.tag, part.id), res.score);
    renderResult(res, part, seconds);
    send(res);
  }

  // ---- on-screen workbook (solve.js): decrypt the part's bundle and hand it over
  async function startScreen() {
    store("hw_student", $("student").value.trim());
    const { lesson, part } = state; state.mode = "screen";
    $("start-msg").textContent = "Загружаю вопросы…";
    let items;
    try {
      items = JSON.parse(new TextDecoder().decode(await SITE.open(await (await fetch(part.b, { cache: "no-store" })).arrayBuffer())));
    } catch (e) { $("start-msg").textContent = "Не удалось загрузить вопросы. Обновите страницу."; return; }
    $("start-msg").textContent = "";
    state.items = items;
    HWSolve.open({ lesson, part, items, student: store("hw_student"), sha, parseSpr, show,
      onClose: () => show("s-result"),
      onFinish: (r, extra) => {
        const key = `hw_att_${store("hw_student")}_${lesson.tag}_${part.id}`;
        const attempt = Number(store(key) || 0) + 1; store(key, String(attempt));
        const res = Object.assign({ student: store("hw_student") }, r, { attempt: String(attempt) });
        store(lastKey(lesson.tag, part.id), res.score);
        state.review = extra.state;
        renderResult(res, part, Number(r.seconds), extra);
        send(res);
      } });
  }

  function renderResult(r, part, seconds, extra) {
    $("res-title").textContent = `${r.lesson} · ${part.title}`;
    $("res-score").textContent = r.score;
    const [a, b] = r.score.split("/").map(Number);
    $("res-meter").style.width = `${(100 * a) / b}%`;
    $("res-time").textContent = `${Math.floor(seconds / 60)} мин ${seconds % 60} с`;
    $("res-att").textContent = r.attempt;
    $("res-wrong").innerHTML = r.wrong ? r.wrong.split(",").map((n) => `<span>${n}</span>`).join("") : "<p>Нет. Всё верно.</p>";
    // on screen the main score counts first attempts; the second attempt is shown next to it
    $("res-2-box").classList.toggle("hidden", !(extra && extra.learn)); if (extra) $("res-2").textContent = extra.second;
    $("res-mode-box").classList.remove("hidden");
    $("res-mode").textContent = !extra ? "ответы из тетради" : extra.learn ? "на экране, 2 попытки" : "на экране, экзамен";
    $("res-wrong-h").textContent = extra && extra.learn ? "Не с первой попытки" : "Ошибки и пропуски";
    $("review").classList.toggle("hidden", !extra);
    const code = ["HW", r.lesson, r.part, r.student, r.score, r.wrong || "-", r.seconds + "s", "a" + r.attempt, r.answers].join(" | ");
    $("res-code").textContent = code;
    $("tg").href = `https://t.me/${CFG.telegram || "nurzycom"}`;
    $("copy").onclick = async () => { try { await navigator.clipboard.writeText(code); $("copy").textContent = "Скопировано"; } catch (e) { $("copy").textContent = "Выделите код вручную"; } };
    show("s-result");
  }

  async function send(r) {
    const f = CFG.fields || {};
    const ready = CFG.formAction && Object.keys(r).every((k) => f[k]);
    if (!ready) { $("send-status").textContent = "Отправка не настроена: пришлите код преподавателю."; $("backup").classList.remove("hidden"); return; }
    $("send-status").textContent = "Отправляю…";
    const body = new URLSearchParams();
    Object.keys(r).forEach((k) => body.append(f[k], r[k]));
    try {
      await fetch(CFG.formAction, { method: "POST", mode: "no-cors", body });
      $("send-status").textContent = "Результат отправлен преподавателю.";
      $("backup").classList.add("hidden");
    } catch (e) {
      $("send-status").textContent = "Не удалось отправить (нет интернета?).";
      $("backup").classList.remove("hidden");
    }
  }

  $("go").onclick = startScreen;
  $("go-paper").onclick = startAnswers;
  $("review").onclick = () => HWSolve.open({ lesson: state.lesson, part: state.part, items: state.items, review: state.review, student: store("hw_student"), sha, parseSpr, show, onClose: () => show("s-result"), onFinish: () => {} });
  $("back").onclick = () => { clearInterval(state.timer); show("s-start"); };
  $("submit").onclick = grade;
  $("again").onclick = () => (state.mode === "screen" ? startScreen() : startAnswers());
  $("home").onclick = () => { renderStart(); if (state.lesson) pickLesson(state.lesson.tag); show("s-start"); };

  SITE.json("lessons").then((d) => { state.data = d; renderStart(); })
    .catch(() => { $("start-msg").textContent = "Не удалось загрузить уроки. Обновите страницу."; });
  window.__hw = { parseSpr, sha };  // for testing
})();
