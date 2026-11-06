// Unit circle page: rules from data/circle.bin, an interactive unit circle, the special-angle table, and the practice sets
// U01–U04 solved on screen with solve.js (hint on request, two attempts, explanation) and sent to the Google Form.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const CFG = window.HW_CONFIG || {};
  const state = { guide: null, lessons: [], set: null, items: null, review: null, deg: 30, snap: true };
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

  // ---- exact values
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  function rad(deg) {   // degrees → "5π/6"
    if (deg === 0) return "0";
    const g = gcd(deg, 180), p = deg / g, q = 180 / g;
    return `${p === 1 ? "" : p}π${q === 1 ? "" : "/" + q}`;
  }
  const REF = { 0: ["1", "0", "0"], 30: ["√3/2", "1/2", "√3/3"], 45: ["√2/2", "√2/2", "1"], 60: ["1/2", "√3/2", "√3"], 90: ["0", "1", null] };
  function quadrant(d) { return d % 90 === 0 ? null : Math.floor(d / 90) + 1; }
  function refAngle(d) { const m = d % 180; return m <= 90 ? m : 180 - m; }
  // exact cos, sin, tan for multiples of 30° and 45°; null when not special
  function exact(d) {
    const r = refAngle(d); if (!(r in REF)) return null;
    const c = Math.cos((d * Math.PI) / 180), s = Math.sin((d * Math.PI) / 180);
    const sg = (v, txt) => (txt === "0" ? "0" : (v < 0 ? "−" : "") + txt);
    const [rc, rs, rt] = REF[r];
    const t = rt === null ? null : rt === "0" ? "0" : (c * s < 0 ? "−" : "") + rt;
    return { cos: sg(c, rc), sin: sg(s, rs), tan: t };
  }
  const num = (v) => (Math.abs(v) < 5e-10 ? "0" : (v < 0 ? "−" : "") + Math.abs(v).toFixed(3).replace(/\.?0+$/, ""));

  // ---- the interactive circle
  const SPECIAL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  function drawCircle() {
    const d = state.deg, a = (d * Math.PI) / 180, R = 150, cx = 180, cy = 180;
    const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
    const big = d > 180 ? 1 : 0, ar = 34;
    const arc = d === 0 ? "" : d === 360 ? "" : `<path class="uc-ang" d="M ${cx + ar} ${cy} A ${ar} ${ar} 0 ${big} 0 ${cx + ar * Math.cos(a)} ${cy - ar * Math.sin(a)}"/>`;
    const dots = SPECIAL.map((s) => { const b = (s * Math.PI) / 180; return `<circle class="uc-dot${s === d ? " on" : ""}" cx="${cx + R * Math.cos(b)}" cy="${cy - R * Math.sin(b)}" r="3.5" data-d="${s}"/>`; }).join("");
    $("uc-svg").innerHTML = `
      <line class="uc-axis" x1="10" y1="${cy}" x2="350" y2="${cy}"/><line class="uc-axis" x1="${cx}" y1="10" x2="${cx}" y2="350"/>
      <text class="uc-q" x="265" y="70">I</text><text class="uc-q" x="85" y="70">II</text><text class="uc-q" x="85" y="300">III</text><text class="uc-q" x="265" y="300">IV</text>
      <circle class="uc-c" cx="${cx}" cy="${cy}" r="${R}"/>${dots}${arc}
      <line class="uc-cos" x1="${cx}" y1="${cy}" x2="${x}" y2="${cy}"/><line class="uc-sin" x1="${x}" y1="${cy}" x2="${x}" y2="${y}"/>
      <line class="uc-r" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>
      <circle class="uc-p" cx="${x}" cy="${y}" r="9"/>
      <text class="uc-t" x="${cx + 8}" y="${cy - 8}">O</text><text class="uc-t" x="338" y="${cy - 8}">x</text><text class="uc-t" x="${cx + 8}" y="22">y</text>`;
    const e = exact(d), c = Math.cos(a), s = Math.sin(a), q = quadrant(d);
    const val = (ex, v) => (ex === null ? "не определён" : ex !== undefined && ex !== num(v) ? `${ex} ≈ ${num(v)}` : num(v));
    const tanv = Math.abs(c) < 1e-12 ? null : s / c;
    $("uc-out").innerHTML = `
      <div class="uc-big"><span>${d}°</span><small>${rad(d)} рад</small></div>
      <dl>
        <dt>Четверть</dt><dd>${q ? ["I", "II", "III", "IV"][q - 1] : "на оси"}</dd>
        <dt>Опорный угол</dt><dd>${refAngle(d)}°</dd>
        <dt>cos θ = x</dt><dd>${e ? val(e.cos, c) : num(c)}</dd>
        <dt>sin θ = y</dt><dd>${e ? val(e.sin, s) : num(s)}</dd>
        <dt>tan θ</dt><dd>${tanv === null ? "не определён (cos θ = 0)" : e ? val(e.tan, tanv) : num(tanv)}</dd>
        <dt>Точка</dt><dd>(${e ? e.cos : num(c)}, ${e ? e.sin : num(s)})</dd>
      </dl>`;
    $("uc-chips").querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.d) === d)));
    $("uc-svg").setAttribute("aria-label", `Угол ${d} градусов`);
  }
  function setDeg(d) { state.deg = ((Math.round(d) % 360) + 360) % 360; drawCircle(); }
  function fromPointer(ev) {
    const r = $("uc-svg").getBoundingClientRect(), sx = 360 / r.width;
    const x = (ev.clientX - r.left) * sx - 180, y = 180 - (ev.clientY - r.top) * sx;
    let d = (Math.atan2(y, x) * 180) / Math.PI; if (d < 0) d += 360;
    if (state.snap) { const near = SPECIAL.concat([360]).reduce((b, s) => (Math.abs(s - d) < Math.abs(b - d) ? s : b), 0); d = Math.abs(near - d) <= 7 ? near % 360 : Math.round(d); }
    setDeg(d);
  }
  function mountCircle() {
    $("uc-chips").innerHTML = SPECIAL.map((s) => `<button class="chip" type="button" data-d="${s}" aria-pressed="false">${s}°</button>`).join("");
    $("uc-chips").querySelectorAll(".chip").forEach((b) => (b.onclick = () => setDeg(Number(b.dataset.d))));
    const svg = $("uc-svg"); let drag = false;
    svg.addEventListener("pointerdown", (e) => { drag = true; svg.setPointerCapture(e.pointerId); fromPointer(e); });
    svg.addEventListener("pointermove", (e) => { if (drag) fromPointer(e); });
    svg.addEventListener("pointerup", () => { drag = false; });
    svg.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 1 : 15;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { setDeg(state.deg + step); e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { setDeg(state.deg - step); e.preventDefault(); }
    });
    $("uc-snap").onchange = () => { state.snap = $("uc-snap").checked; };
    drawCircle();
  }
  function renderTable() {
    const rows = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360].map((d) => {
      const e = exact(d % 360);
      return `<tr><td>${d}°</td><td>${rad(d)}</td><td>${e.cos}</td><td>${e.sin}</td><td>${e.tan === null ? "—" : e.tan}</td></tr>`;
    }).join("");
    $("uc-table").innerHTML = `<thead><tr><th>Градусы</th><th>Радианы</th><th>cos</th><th>sin</th><th>tan</th></tr></thead><tbody>${rows}</tbody>`;
  }

  // ---- guide and practice
  function renderGuide() {
    $("rule-list").innerHTML = state.guide.rules.map(([t, p], k) => `<div class="rule"><span class="no">${k + 1}</span><div><b>${esc(t)}</b><p>${esc(p)}</p></div></div>`).join("");
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
    catch (e) { $("send-status").textContent = "Не удалось отправить (нет интернета?)."; $("backup").classList.remove("hidden"); }
  }

  $("go").onclick = start;
  $("again").onclick = start;
  $("home").onclick = () => { renderSets(); show("s-start"); $("practice").scrollIntoView(); };
  $("review").onclick = () => HWSolve.open({ lesson: state.set, part: state.set.parts[0], items: state.items, review: state.review, student: store("hw_student"), sha, parseSpr, show, onClose: () => show("s-result"), onFinish: () => {} });

  mountCircle(); renderTable();
  Promise.all([SITE.json("circle"), SITE.json("lessons")]).then(([g, l]) => {
    state.guide = g; state.lessons = l.lessons.filter((x) => /^U\d\d$/.test(x.tag));
    renderGuide(); renderSets();
    if (location.hash) { const el = document.querySelector(location.hash); if (el) el.scrollIntoView(); }
  }).catch(() => { $("start-msg").textContent = "Не удалось загрузить страницу. Обновите её."; });
  window.__uc = { exact, rad, setDeg, state };   // for testing
})();
