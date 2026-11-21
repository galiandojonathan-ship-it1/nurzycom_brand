// nurzycom homework checker: grades answers against hashed keys, sends the result to a Google Form.
(function () {
  "use strict";
  const pl = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many);   // Russian plural: 1 шаг, 2 шага, 5 шагов
  const $ = (id) => document.getElementById(id);
  const CFG = window.HW_CONFIG || {};
  const state = { data: null, lesson: null, part: null, answers: {}, t0: 0, timer: null };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function show(id) { ["s-start", "s-answers", "s-solve", "s-result"].forEach((s) => $(s).classList.toggle("hidden", s !== id)); window.scrollTo(0, 0); }

  const account = () => encodeURIComponent(SITE.me() || "@" + (store("hw_student") || ""));
  const attemptPrefix = () => `hw_saved_${account()}:`;
  const resumeKey = () => `hw_resume_${account()}`;
  const draftKey = (lesson, part) => `hw_draft_${account()}:${lesson.tag}:${part.id}`;
  let active = null;
  const sending = new Set();

  function read(key) {
    try { return JSON.parse(store(key)); } catch (e) { return null; }
  }

  function saveAttempt(attempt) {
    try {
      localStorage.setItem(attemptPrefix() + attempt.id, JSON.stringify(attempt));
      return true;
    } catch (e) { return false; }
  }

  function attempts() {
    const prefix = attemptPrefix();
    try {
      return Object.keys(localStorage).filter((k) => k.startsWith(prefix))
        .map(read).filter(Boolean).sort((a, b) => b.t - a.t);
    } catch (e) { return []; }
  }

  function resultURL(id) {
    const url = new URL(location.href);
    url.searchParams.set("result", id);
    return url;
  }

  function updateRecovery() {
    window.dispatchEvent(new Event("hw-history"));
    const draft = read(resumeKey());
    let lesson = state.data.lessons.find((l) => l.tag === draft?.lesson);
    let part = lesson?.parts.find((p) => p.id === draft.part);
    if (!part || !read(draftKey(lesson, part))) {
      // Drafts created before the resume button were keyed by the student's name.
      const student = store("hw_student");
      part = null;
      for (const candidate of state.data.lessons) {
        if (!student || !/^[VM]/.test(candidate.tag)) continue;
        part = candidate.parts.find((p) => {
          const saved = read(`hw_prog_${student}_${candidate.tag}_${p.id}`);
          return saved?.st && Object.values(saved.st).some((q) => q.tries.length);
        });
        if (part) { lesson = candidate; break; }
      }
    }
    const canResume = !!part;
    const pending = attempts().filter((a) => a.status !== "sent");
    $("hw-recovery").classList.toggle("hidden", !canResume && !pending.length);
    $("hw-resume").classList.toggle("hidden", !canResume);
    $("hw-resume").textContent = canResume ? `Продолжить · ${lesson.tag} · ${part.title}` : "";
    $("hw-resume").onclick = canResume ? () => { pickLesson(lesson.tag); pickPart(part.id); startScreen(true); } : null;
    $("hw-pending").replaceChildren(...pending.map((a) => {
      const link = document.createElement("a");
      link.className = "td-link";
      link.href = resultURL(a.id);
      link.textContent = `${a.result.lesson} · попытка ${a.result.attempt} · ${a.status === "sending" ? "проверьте отправку" : "не отправлено"}`;
      const row = document.createElement("span");
      row.append(link, document.createElement("br"));
      return row;
    }));
  }

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
      return `<div><div class="course-h"><b>${name}</b><span class="label">${ls.length} ${pl(ls.length, "урок", "урока", "уроков")} · ${sub}</span></div><div class="tiles">${ls.map((l) => {
        const nm = l.title.split(" · ").slice(2).join(" · ");
        const done = l.parts.filter((p) => store(lastKey(l.tag, p.id))).length;
        return `<button class="tile" data-l="${l.tag}" aria-pressed="false" title="${esc(l.title)}"><span class="no">${/^\D\d+$/.test(l.tag) ? String(Number(l.tag.slice(1))).padStart(2, "0") : l.tag.slice(1)}</span><span class="nm">${esc(nm)}</span>${done ? `<span class="dot">${done}/${l.parts.length}</span>` : ""}</button>`;
      }).join("")}</div></div>`;
    }).join("");
    $("lessons").querySelectorAll(".tile").forEach((b) => (b.onclick = () => { pickLesson(b.dataset.l); $("step-part").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }));
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
    $("tip-card").classList.toggle("hidden", !(l && l.tip)); if (l && l.tip) $("tip-text").textContent = l.tip;
    $("part-lesson").textContent = l ? l.title.replace(/ · Урок /, " · ") : "";
    $("parts").innerHTML = l ? l.parts.map((p) => {
      const last = store(lastKey(l.tag, p.id));
      return `<button class="pick part" data-p="${p.id}" aria-pressed="false"><span><span class="t">${esc(p.title)}</span><span class="tag">${p.mode === "test" ? "как на экзамене" : "2 попытки · объяснения"}</span><small>${p.q.length} ${pl(p.q.length, "вопрос", "вопроса", "вопросов")} · ${p.q[0].n}–${p.q[p.q.length - 1].n}</small></span><span class="r">${last ? "последний: " + last : "→"}</span></button>`;
    }).join("") : "";
    $("parts").querySelectorAll(".pick").forEach((b) => (b.onclick = () => {
      $("parts").querySelectorAll(".pick").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      state.part = l.parts.find((p) => p.id === b.dataset.p); check();
    }));
    check();
  }
  function check() {
    const ready = $("student").value.trim().length >= 2 && state.lesson && state.part;
    LiveRound.mount("go", async () => {
      if (!state.lesson || !state.part) throw Error("Выберите урок и часть урока.");
      return { title: state.lesson.title + " · " + state.part.title,
        questions: LiveRound.workbook(await LiveRound.bundle(state.part.b)) };
    });
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

  let grading = false;
  async function grade() {
    if (grading) return;
    const { lesson, part } = state, answers = { ...state.answers };
    const qs = part.q;
    const blanks = qs.filter((q) => !answers[q.n]).map((q) => q.n);
    if (blanks.length && !confirm(`Без ответа: ${blanks.join(", ")}. Сдать всё равно?`)) return;
    grading = true;
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
    const attempt = Number(store(key) || 0) + 1;
    const ansStr = qs.map((q) => `${q.n}:${answers[q.n] || "-"}`).join(" ");
    const res = { student: store("hw_student") || $("student").value.trim(), lesson: lesson.tag, part: `${part.id} · ${part.title}`,
      answers: ansStr, score: `${right}/${qs.length}`, wrong: wrong.join(","), seconds: String(seconds), attempt: String(attempt) };
    complete(res, part, null, answers);
    grading = false;
  }

  // ---- on-screen workbook (solve.js): decrypt the part's bundle and hand it over
  async function loadItems(part) {
    const response = await fetch(part.b, { cache: "no-store" });
    if (!response.ok) throw Error("Questions unavailable");
    return JSON.parse(new TextDecoder().decode(await SITE.open(await response.arrayBuffer())));
  }

  let opening = false;
  async function startScreen(resume = false, newAttempt = false) {
    if (opening) return;
    store("hw_student", $("student").value.trim());
    const { lesson, part } = state;
    opening = true;
    $("start-msg").textContent = "Загружаю вопросы…";
    let items;
    try { items = await loadItems(part); }
    catch (e) {
      $(newAttempt ? "review-msg" : "start-msg").textContent = SITE.failMsg("попробуйте открыть задание ещё раз");
      return;
    }
    finally { opening = false; }
    $("start-msg").textContent = "";
    if (newAttempt) leaveResult();
    state.mode = "screen";
    HWSolve.open({ lesson, part, items, student: store("hw_student"), sha, parseSpr, show,
      draftKey: draftKey(lesson, part), resume: resume === true,
      onSave: () => store(resumeKey(), JSON.stringify({ lesson: lesson.tag, part: part.id })),
      onClose: () => show("s-result"),
      onFinish: (r, extra) => {
        const key = `hw_att_${store("hw_student")}_${lesson.tag}_${part.id}`;
        const attempt = Number(store(key) || 0) + 1;
        const res = Object.assign({ student: store("hw_student") }, r, { attempt: String(attempt) });
        return complete(res, part, extra);
      } });
  }

  function complete(result, part, review, paperAnswers) {
    const attempt = { id: crypto.randomUUID(), t: Date.now(), part: part.id, result, review, paperAnswers,
      bundle: part.b, status: "pending" };
    const saved = saveAttempt(attempt);
    if (saved) {
      store(`hw_att_${result.student}_${result.lesson}_${part.id}`, result.attempt);
      history.replaceState(null, "", resultURL(attempt.id));
    }
    openResult(attempt, part);
    if (!saved) $("send-status").textContent = "Не удалось сохранить попытку в браузере. Скопируйте код результата.";
    else if (navigator.onLine) send(attempt.id);
    return saved;
  }

  function openResult(attempt, part) {
    active = attempt;
    pickLesson(attempt.result.lesson);
    pickPart(attempt.part);
    $("student").value = attempt.result.student;
    state.mode = attempt.review ? "screen" : "paper";
    renderResult(attempt.result, part, Number(attempt.result.seconds), attempt.review);
    renderDelivery();
    $("res-title").focus();
  }

  function renderResult(r, part, seconds, extra) {
    $("review-msg").textContent = "";
    $("res-title").textContent = `${r.lesson} · ${part.title}`;
    $("res-score").textContent = r.score;
    const [a, b] = r.score.split("/").map(Number);
    $("res-meter").style.width = `${(100 * a) / b}%`;
    $("res-time").textContent = `${Math.floor(seconds / 60)} мин ${seconds % 60} с`;
    $("res-att").textContent = r.attempt;
    renderMistakes(active, part);
    // on screen the main score counts first attempts; the second attempt is shown next to it
    $("res-2-box").classList.toggle("hidden", !(extra && extra.learn)); if (extra) $("res-2").textContent = extra.second;
    $("res-mode-box").classList.remove("hidden");
    $("res-mode").textContent = !extra ? "ответы из тетради" : extra.learn ? "на экране, 2 попытки" : "на экране, экзамен";
    $("res-wrong-h").textContent = extra && extra.learn ? "Не с первой попытки" : "Ошибки и пропуски";
    $("review").classList.toggle("hidden", !active.bundle);
    const code = ["HW", r.lesson, r.part, r.student, r.score, r.wrong || "-", r.seconds + "s", "a" + r.attempt, r.answers].join(" | ");
    $("res-code").textContent = code;
    $("tg").href = `https://t.me/${CFG.telegram || "nurzycom"}`;
    $("copy").onclick = async () => { try { await navigator.clipboard.writeText(code); $("copy").textContent = "Скопировано"; } catch (e) { $("copy").textContent = "Выделите код вручную"; } };
    show("s-result");
  }

  function answersFromPaper(attempt) {
    if (attempt.paperAnswers) return attempt.paperAnswers;
    // Earlier saved paper attempts store the answers in the form submission format.
    return Object.fromEntries(Array.from(attempt.result.answers.matchAll(/(?:^| )(\d+):(\S+)/g), ([, n, answer]) =>
      [n, answer === "-" ? "" : answer]));
  }

  function renderMistakes(attempt, part) {
    const missed = new Set(attempt.result.wrong.split(",").filter(Boolean));
    const container = $("res-wrong");
    container.replaceChildren();
    if (!missed.size) {
      const message = document.createElement("p");
      message.textContent = "Нет. Всё верно.";
      container.append(message);
      return;
    }
    const list = document.createElement("ul");
    const paper = attempt.review ? null : answersFromPaper(attempt);
    for (const n of missed) {
      const q = part.q.find((question) => String(question.n) === n);
      const status = attempt.review?.state[q?.i];
      const tries = status?.tries || (paper?.[n] ? [paper[n]] : []);
      const row = document.createElement("li");
      const detail = document.createElement("span");
      detail.textContent = tries.length > 1 ? `Попытки: ${tries.join(" → ")}${status?.ok ? " · исправлено" : ""}` :
        tries.length ? `Ваш ответ: ${tries[0]}` : "Пропуск";
      if (attempt.bundle) {
        const button = document.createElement("button");
        button.className = "tlink";
        button.type = "button";
        button.textContent = `Вопрос ${n}`;
        button.setAttribute("aria-label", `Разобрать вопрос ${n}`);
        button.onclick = () => openReview(button, n);
        row.append(button, detail);
      } else row.append(`Вопрос ${n}`, detail);
      list.append(row);
    }
    container.append(list);
  }

  function renderDelivery() {
    const {status, id} = active;
    const busy = sending.has(id);
    const messages = {
      pending: "Результат сохранён. Не отправлено.",
      sending: "Отправка была прервана. Уточните у преподавателя, получен ли результат, прежде чем повторить.",
      sent: "Результат отправлен. Google Forms не подтверждает получение на этой странице."
    };
    const message = busy ? "Отправляю…" : messages[status];
    if ($("send-status").textContent !== message) $("send-status").textContent = message;
    if (busy && document.activeElement === $("resend")) $("send-status").focus({ preventScroll: true });
    $("resend").classList.toggle("hidden", status === "sent" || busy || !read(attemptPrefix() + id));
    $("backup").classList.toggle("hidden", status === "sent" || busy);
  }

  async function send(id, retry = false) {
    if (sending.has(id) || !navigator.onLine) return;
    const key = attemptPrefix() + id;
    async function deliver() {
      const attempt = read(key);
      if (!attempt || attempt.status === "sent" || (attempt.status === "sending" && !retry)) return;
      const r = attempt.result, f = CFG.fields || {};
      if (!CFG.formAction || !Object.keys(r).every((k) => f[k])) return;
      if (!saveAttempt({ ...attempt, status: "sending" })) return;
      sending.add(id);
      if (active?.id === id) { active = { ...attempt, status: "sending" }; renderDelivery(); }
      try {
        const body = new URLSearchParams(Object.keys(r).map((k) => [f[k], r[k]]));
        const response = await fetch(CFG.formAction, { method: "POST", mode: "no-cors", body });
        if (response.type !== "opaque" && !response.ok) throw Error("Delivery failed");
        attempt.status = "sent";
        attempt.sentAt = Date.now();
      } catch (e) {
        attempt.status = "pending";
      } finally {
        saveAttempt(attempt);
        sending.delete(id);
        if (attempt.status === "sent") {
          const scoreKey = `hw_last_${r.student}_${r.lesson}_${attempt.part}`;
          const newerDelivered = attempts().some((a) => a.status === "sent" && a.t > attempt.t &&
            a.result.student === r.student && a.result.lesson === r.lesson && a.part === attempt.part);
          if (!newerDelivered) store(scoreKey, r.score);
        }
        if (active?.id === id) { active = attempt; renderDelivery(); }
        updateRecovery();
      }
    }
    if (navigator.locks) await navigator.locks.request(key, { ifAvailable: true }, (lock) => lock && deliver());
    else await deliver();
  }

  $("go").onclick = () => startScreen();
  $("go-paper").onclick = startAnswers;
  $("resend").onclick = () => { if (active) send(active.id, true); };
  addEventListener("online", () => {
    if (state.data) attempts().filter((a) => a.status === "pending").forEach((a) => send(a.id));
  });
  addEventListener("storage", (event) => {
    if (!state.data || !event.key?.startsWith(attemptPrefix())) return;
    if (active && event.key === attemptPrefix() + active.id) {
      active = read(event.key) || active;
      renderDelivery();
    }
    updateRecovery();
  });

  let reviewOpening = false;
  async function openReview(opener, number) {
    if (reviewOpening || !active) return;
    const attempt = active, { lesson, part } = state;
    reviewOpening = true;
    $("review-msg").textContent = "Загружаю разбор…";
    try {
      const items = await loadItems({ b: attempt.bundle });
      if (attempt.id !== active?.id || $("s-result").classList.contains("hidden")) return;
      let review = attempt.review?.state;
      if (!review) {
        const answers = answersFromPaper(attempt), missed = new Set(attempt.result.wrong.split(","));
        review = Object.fromEntries(items.map((q) => [q.i, {
          tries: answers[q.n] ? [answers[q.n]] : [], done: true, ok: !missed.has(String(q.n))
        }]));
      }
      $("review-msg").textContent = "";
      HWSolve.open({ lesson, part, items, review, reviewQuestion: number, student: attempt.result.student,
        sha, parseSpr, show, onClose: () => { show("s-result"); opener.focus(); }, onFinish: () => {} });
    } catch (e) {
      if (attempt.id === active?.id) $("review-msg").textContent = SITE.failMsg("попробуйте открыть разбор ещё раз");
    } finally { reviewOpening = false; }
  }
  $("review").onclick = () => openReview($("review"));
  $("back").onclick = () => { clearInterval(state.timer); show("s-start"); };
  $("submit").onclick = grade;
  function leaveResult() {
    const url = new URL(location.href);
    url.searchParams.delete("result");
    history.replaceState(null, "", url);
    active = null;
  }
  $("again").onclick = () => {
    if (state.mode === "screen") startScreen(false, true);
    else { leaveResult(); startAnswers(); }
  };
  $("home").onclick = () => {
    leaveResult();
    const tag = state.lesson?.tag;
    renderStart();
    if (tag) pickLesson(tag);
    updateRecovery();
    show("s-start");
  };

  SITE.json("lessons").then((d) => {
    state.data = d;
    renderStart();
    updateRecovery();
    const id = new URL(location.href).searchParams.get("result");
    const attempt = id && read(attemptPrefix() + id);
    const part = attempt && d.lessons.find((l) => l.tag === attempt.result.lesson)?.parts.find((p) => p.id === attempt.part);
    if (part) openResult(attempt, part);
    else if (id) $("start-msg").textContent = "Эта попытка недоступна в текущем браузере.";
  }).catch(() => { $("start-msg").textContent = "Не удалось загрузить уроки. Обновите страницу."; });

  window.HWHistory = { attempts, resultURL };
  window.__hw = { parseSpr, sha };  // for testing
})();
