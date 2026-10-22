// nurzycom homework checker: grades answers against hashed keys, sends the result to a Google Form.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const CFG = window.HW_CONFIG || {};
  const state = { data: null, lesson: null, part: null, answers: {}, t0: 0, timer: null };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function show(id) { ["s-start", "s-answers", "s-result"].forEach((s) => $(s).classList.toggle("hidden", s !== id)); window.scrollTo(0, 0); }

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

  function renderStart() {
    const sel = $("lesson");
    sel.innerHTML = '<option value="">Выберите урок</option>' + state.data.lessons.map((l) => `<option value="${l.tag}">${l.title}</option>`).join("");
    $("student").value = store("hw_student") || "";
    const params = new URLSearchParams(location.search);
    if (params.get("l")) sel.value = params.get("l");
    sel.onchange = renderParts; $("student").oninput = check; renderParts();
  }
  function renderParts() {
    const l = state.data.lessons.find((x) => x.tag === $("lesson").value);
    state.lesson = l || null; state.part = null;
    $("parts").innerHTML = l ? l.parts.map((p) => `<button class="part" data-p="${p.id}" aria-pressed="false">${p.title}<small>вопросы ${p.q[0].n}–${p.q[p.q.length - 1].n}</small></button>`).join("") : "";
    $("parts").querySelectorAll(".part").forEach((b) => (b.onclick = () => {
      $("parts").querySelectorAll(".part").forEach((x) => x.setAttribute("aria-pressed", x === b));
      state.part = l.parts.find((p) => p.id === b.dataset.p); check();
    }));
    check();
  }
  function check() { $("go").disabled = !($("student").value.trim().length >= 2 && state.lesson && state.part); }

  function startAnswers() {
    store("hw_student", $("student").value.trim());
    const { lesson, part } = state; state.answers = {};
    $("ans-title").textContent = `${lesson.tag} · ${part.title}`;
    const qs = part.q;
    $("qs").innerHTML = qs.map((q) => q.t === "mc"
      ? `<div class="q"><span class="n">${q.n}</span><div class="opts">${"ABCD".split("").map((c) => `<button data-n="${q.n}" data-c="${c}" aria-pressed="false">${c}</button>`).join("")}</div></div>`
      : `<div class="q"><span class="n">${q.n}</span><div><input type="text" inputmode="text" data-n="${q.n}" autocomplete="off" aria-label="Ответ ${q.n}"><div class="hint" id="h${q.n}"></div></div></div>`).join("");
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
    const total = state.part.q.length;
    $("count").textContent = `${Object.keys(state.answers).length} / ${total}`;
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
    renderResult(res, part, seconds);
    send(res);
  }

  function renderResult(r, part, seconds) {
    $("res-title").textContent = `${r.lesson} · ${part.title} · попытка ${r.attempt}`;
    $("res-score").textContent = r.score;
    $("res-detail").textContent = `Время: ${Math.floor(seconds / 60)} мин ${seconds % 60} с.`;
    $("res-wrong").textContent = r.wrong ? r.wrong.split(",").join(", ") : "Нет. Всё верно.";
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

  $("go").onclick = startAnswers;
  $("back").onclick = () => { clearInterval(state.timer); show("s-start"); };
  $("submit").onclick = grade;
  $("again").onclick = startAnswers;
  $("home").onclick = () => show("s-start");

  fetch("lessons.json", { cache: "no-store" }).then((r) => r.json()).then((d) => { state.data = d; renderStart(); })
    .catch(() => { $("start-msg").textContent = "Не удалось загрузить уроки. Обновите страницу."; });
  window.__hw = { parseSpr, sha };  // for testing
})();
