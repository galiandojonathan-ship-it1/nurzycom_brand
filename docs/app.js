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
    $("student").oninput = check; $("code").oninput = check;
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
      return `<button class="pick part" data-p="${p.id}" aria-pressed="false"><span><span class="t">${esc(p.title)}</span>${p.img ? '<span class="tag">на экране</span>' : ""}<small>${p.q.length} вопросов · ${p.q[0].n}–${p.q[p.q.length - 1].n}</small></span><span class="r">${last ? "последний: " + last : "→"}</span></button>`;
    }).join("") : "";
    $("parts").querySelectorAll(".pick").forEach((b) => (b.onclick = () => {
      $("parts").querySelectorAll(".pick").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      state.part = l.parts.find((p) => p.id === b.dataset.p); check();
    }));
    check();
  }
  function check() {
    const needCode = !!(state.part && state.part.img && !store("hw_code"));
    $("code-row").classList.toggle("hidden", !needCode);
    $("go").disabled = !($("student").value.trim().length >= 2 && state.lesson && state.part && (!needCode || $("code").value.trim().length >= 4));
  }

  // Question images are encrypted; the class code unlocks them (AES-GCM, key from PBKDF2).
  let aesKey = null;
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function unlock(code) {
    const e = state.data.enc;
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(e.salt), iterations: e.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const c = b64(e.check);
    const out = await crypto.subtle.decrypt({ name: "AES-GCM", iv: c.slice(0, 12) }, key, c.slice(12));
    if (new TextDecoder().decode(out) !== "nurzycom") throw new Error("bad");
    return key;
  }
  async function loadImages() {
    const imgs = Array.from($("qs").querySelectorAll("img[data-src]"));
    let k = 0;
    async function worker() {
      while (k < imgs.length) {
        const img = imgs[k++];
        try {
          const buf = new Uint8Array(await (await fetch(img.dataset.src)).arrayBuffer());
          const png = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, aesKey, buf.slice(12));
          img.src = URL.createObjectURL(new Blob([png], { type: "image/png" })); img.removeAttribute("data-src");
        } catch (e) { img.alt = "Не удалось загрузить вопрос. Обновите страницу."; }
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()]);
  }

  async function startAnswers() {
    store("hw_student", $("student").value.trim());
    const { lesson, part } = state; state.answers = {};
    if (part.img && !aesKey) {
      const code = (store("hw_code") || $("code").value).trim().toLowerCase();
      $("start-msg").textContent = "Проверяю код…";
      try { aesKey = await unlock(code); store("hw_code", code); $("start-msg").textContent = ""; }
      catch (e) { try { localStorage.removeItem("hw_code"); } catch (_) {} check(); $("start-msg").textContent = "Неверный код класса. Спросите у преподавателя."; return; }
    }
    $("ans-title").textContent = `${lesson.tag} · ${part.title}`;
    const qs = part.q;
    const ctrl = (q) => q.t === "mc"
      ? `<div class="opts">${"ABCD".split("").map((c) => `<button data-n="${q.n}" data-c="${c}" aria-pressed="false">${c}</button>`).join("")}</div>`
      : `<div><input type="text" inputmode="text" data-n="${q.n}" autocomplete="off" aria-label="Ответ ${q.n}"><div class="hint" id="h${q.n}"></div></div>`;
    $("qs").innerHTML = qs.map((q) => q.img
      ? `<div class="qi"><span class="n">${q.n}</span><img data-src="${q.img}" alt="Вопрос ${q.n}" class="qimg"><div class="q">${ctrl(q)}</div></div>`
      : `<div class="q"><span class="n">${q.n}</span>${ctrl(q)}</div>`).join("");
    $("qs").querySelectorAll(".qimg").forEach((im) => (im.onclick = () => { if (im.src) { $("zoom-img").src = im.src; $("zoom").classList.remove("hidden"); } }));
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
    if (part.img) loadImages();
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

  function renderResult(r, part, seconds) {
    $("res-title").textContent = `${r.lesson} · ${part.title}`;
    $("res-score").textContent = r.score;
    const [a, b] = r.score.split("/").map(Number);
    $("res-meter").style.width = `${(100 * a) / b}%`;
    $("res-time").textContent = `${Math.floor(seconds / 60)} мин ${seconds % 60} с`;
    $("res-att").textContent = r.attempt;
    $("res-wrong").innerHTML = r.wrong ? r.wrong.split(",").map((n) => `<span>${n}</span>`).join("") : "<p>Нет. Всё верно.</p>";
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
  $("home").onclick = () => { renderStart(); if (state.lesson) pickLesson(state.lesson.tag); show("s-start"); };
  $("zoom").onclick = () => $("zoom").classList.add("hidden");

  fetch("lessons.json", { cache: "no-store" }).then((r) => r.json()).then((d) => { state.data = d; renderStart(); })
    .catch(() => { $("start-msg").textContent = "Не удалось загрузить уроки. Обновите страницу."; });
  window.__hw = { parseSpr, sha };  // for testing
})();
