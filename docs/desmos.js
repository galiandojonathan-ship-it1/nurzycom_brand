// Desmos page: the guide (rules, typing, 12 techniques) from data/desmos.bin and the practice sets D01–D06,
// solved on screen with solve.js (hint on request, two attempts, explanation + Desmos solution) and sent to the Google Form.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const CFG = window.HW_CONFIG || {};
  const state = { guide: null, lessons: [], set: null, items: null, review: null };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function show(id) { ["s-start", "s-solve", "s-result"].forEach((s) => $(s).classList.toggle("hidden", s !== id)); window.scrollTo(0, 0); }
  async function sha(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  }
  // the same rule as the homework page: exact value, rounded half away from zero to 4 decimals
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
  const lastKey = (tag) => `hw_last_${store("hw_student") || ""}_${tag}_p1`;
  // Desmos input in the text: words without Cyrillic that contain = < > ^ ~ or a function call
  const code = (t) => esc(t).split(/(\s+)/).map((w) => (!/[А-Яа-яЁё]/.test(w) && /[A-Za-z0-9]/.test(w) && (/[=<>^~]|&lt;|&gt;/.test(w) || /^(sqrt|mean|median|stdev|total|abs)\(/.test(w)) ? `<code>${w.replace(/[,.;:]+$/, "")}</code>${(w.match(/[,.;:]+$/) || [""])[0]}` : w)).join("");

  function renderGuide() {
    const g = state.guide;
    $("rule-list").innerHTML = g.rules.map(([t, p], k) => `<div class="rule"><span class="no">${k + 1}</span><div><b>${esc(t)}</b><p>${code(p)}</p></div></div>`).join("");
    $("key-list").innerHTML = g.keys.map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td>${esc(v)}</td></tr>`).join("");
    $("tech-list").innerHTML = g.techs.map((t, k) => `<article class="tech" id="t-${t.c}"><div class="th"><span class="no">${String(k + 1).padStart(2, "0")}</span><b>${esc(t.n)}</b></div>
      <p><span class="label">Когда</span><br>${esc(t.when)}</p>
      <div class="in"><span class="label">Наберите</span>${t.t.map((l) => `<code>${esc(l)}</code>`).join("")}</div>
      <p><span class="label">Смотрите</span><br>${code(t.r)}</p>
      <p class="tr"><span class="label">Ловушка</span><br>${code(t.trap)}</p>
      <details><summary>Пример</summary><p class="exq">${esc(t.ex)}</p><div class="exa"><b>Ответ: ${esc(t.a)}.</b> ${code(t.how)}</div></details></article>`).join("");
  }
  function renderSets() {
    $("student").value = store("hw_student") || "";
    $("sets").innerHTML = state.guide.sets.map((s) => {
      const L = state.lessons.find((l) => l.tag === s.id); if (!L) return "";
      const last = store(lastKey(s.id));
      return `<button class="set" data-s="${s.id}" aria-pressed="false"><span class="no">${s.id}</span><span class="t">${esc(s.title)}</span><span class="label">${esc(s.en)}</span><span class="label">${L.parts[0].q.length} задач${last ? " · последний: " + last : ""}</span></button>`;
    }).join("");
    $("sets").querySelectorAll(".set").forEach((b) => (b.onclick = () => {
      $("sets").querySelectorAll(".set").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      state.set = state.lessons.find((l) => l.tag === b.dataset.s); check();
    }));
    $("student").oninput = check;
    const want = new URLSearchParams(location.search).get("s");
    if (want) { const b = $("sets").querySelector(`.set[data-s="${want}"]`); if (b) { b.click(); $("practice").scrollIntoView(); } }
    check();
  }
  function check() { $("go").disabled = !($("student").value.trim().length >= 2 && state.set); }

  async function start() {
    store("hw_student", $("student").value.trim());
    const lesson = state.set, part = lesson.parts[0];
    $("start-msg").textContent = "Загружаю задачи…";
    let items;
    try { items = JSON.parse(new TextDecoder().decode(await SITE.open(await (await fetch(part.b, { cache: "no-store" })).arrayBuffer()))); }
    catch (e) { $("start-msg").textContent = "Не удалось загрузить задачи. Обновите страницу."; return; }
    $("start-msg").textContent = ""; state.items = items;
    HWSolve.open({ lesson, part, items, student: store("hw_student"), sha, parseSpr, show,
      onClose: () => show("s-result"),
      onFinish: (r, extra) => {
        const key = `hw_att_${store("hw_student")}_${lesson.tag}_${part.id}`;
        const attempt = Number(store(key) || 0) + 1; store(key, String(attempt));
        const res = Object.assign({ student: store("hw_student") }, r, { attempt: String(attempt) });
        store(lastKey(lesson.tag), res.score);
        state.review = extra.state;
        renderResult(res, lesson, Number(r.seconds), extra);
        send(res);
      } });
  }
  function renderResult(r, lesson, seconds, extra) {
    $("res-title").textContent = `${lesson.tag} · ${lesson.title.split(" · ").slice(2).join(" · ")}`;
    $("res-score").textContent = r.score;
    const [a, b] = r.score.split("/").map(Number);
    $("res-meter").style.width = `${(100 * a) / b}%`;
    $("res-time").textContent = `${Math.floor(seconds / 60)} мин ${seconds % 60} с`;
    $("res-att").textContent = r.attempt;
    $("res-2-box").classList.remove("hidden"); $("res-2").textContent = extra.second;
    $("res-mode-box").classList.remove("hidden"); $("res-mode").textContent = extra.hints ? `подсказок: ${extra.hints}` : "без подсказок";
    $("res-wrong-h").textContent = "Не с первой попытки";
    $("res-wrong").innerHTML = r.wrong ? r.wrong.split(",").map((n) => `<span>${n}</span>`).join("") : "<p>Нет. Всё верно с первой попытки.</p>";
    $("review").classList.remove("hidden");
    const codeStr = ["HW", r.lesson, r.part, r.student, r.score, r.wrong || "-", r.seconds + "s", "a" + r.attempt, r.answers].join(" | ");
    $("res-code").textContent = codeStr;
    $("tg").href = `https://t.me/${CFG.telegram || "nurzycom"}`;
    $("copy").onclick = async () => { try { await navigator.clipboard.writeText(codeStr); $("copy").textContent = "Скопировано"; } catch (e) { $("copy").textContent = "Выделите код вручную"; } };
    show("s-result");
  }
  async function send(r) {
    const f = CFG.fields || {};
    if (!(CFG.formAction && Object.keys(r).every((k) => f[k]))) { $("send-status").textContent = "Отправка не настроена: пришлите код преподавателю."; $("backup").classList.remove("hidden"); return; }
    $("send-status").textContent = "Отправляю…";
    const body = new URLSearchParams(); Object.keys(r).forEach((k) => body.append(f[k], r[k]));
    try { await fetch(CFG.formAction, { method: "POST", mode: "no-cors", body }); $("send-status").textContent = "Результат отправлен преподавателю."; $("backup").classList.add("hidden"); }
    catch (e) { /* retry by hand, or by itself when the connection returns */ (() => { $("send-status").innerHTML = 'Не удалось отправить (нет интернета?). <button class="tlink resend" id="resend">Отправить ещё раз</button>'; $("resend").onclick = () => send(r); addEventListener("online", () => { const b = $("resend"); if (b && b.isConnected) send(r); }, { once: true }); })(); $("backup").classList.remove("hidden"); }
  }

  $("go").onclick = start;
  $("again").onclick = start;
  $("home").onclick = () => { renderSets(); show("s-start"); $("practice").scrollIntoView(); };
  $("review").onclick = () => HWSolve.open({ lesson: state.set, part: state.set.parts[0], items: state.items, review: state.review, student: store("hw_student"), sha, parseSpr, show, onClose: () => show("s-result"), onFinish: () => {} });
  $("open-calc").onclick = () => BBTools.calc(true);

  Promise.all([SITE.json("desmos"), SITE.json("lessons")]).then(([g, l]) => {
    state.guide = g; state.lessons = l.lessons.filter((x) => /^D\d\d$/.test(x.tag));
    renderGuide(); renderSets();
    if (location.hash) { const el = document.querySelector(location.hash); if (el) el.scrollIntoView(); }
  }).catch(() => { $("start-msg").textContent = "Не удалось загрузить страницу. Обновите её."; });
  window.__dz = { parseSpr, state };   // for testing
})();
