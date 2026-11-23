/* «Прогресс ученика» view for the cabinet's student card (results). Draws what PROGRESS.compute returns:
   index over weeks, the five parts, where growth came from, difficulty curves, the subtopic map, traps and habits.
   Charts are inline SVG with a hover tooltip; text uses ink tokens, colour only marks data. */
window.PVIEW = (() => {
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pct = (v) => Math.round(v * 100);
  const NAME = {
    b_splice: "Comma splice и слитные предложения", b_fanboys: "Запятая + and/but/so", b_semicolon: "Точка с запятой", b_colon_dash: "Двоеточие и тире",
    b_nonessential: "Вставка в парных знаках", b_no_break: "Лишняя запятая (подлежащее–сказуемое)", b_intro: "Запятая после вводной части", b_other: "Другая пунктуация",
    f_sv_agree: "Главное подлежащее и сказуемое", f_pronoun: "Местоимения", f_tense: "Время глагола", f_verb_form: "Форма глагола (есть ли сказуемое)",
    f_modifier: "Висящий модификатор", f_possessive: "Притяжательная форма и апостроф", f_noun_number: "Число существительного",
    t_contrast: "Переход-контраст", t_concession: "Переход-уступка", t_cause: "Переход-причина и следствие", t_addition: "Переход-добавление и пример",
    t_sequence: "Переход-последовательность", t_restate: "Переход-пересказ и вывод", rs_goal: "Синтез заметок под цель",
    wic_precise: "Точное слово по контексту", wic_meaning: "Значение слова в тексте", ts_purpose: "Цель текста", ts_function: "Функция предложения",
    ts_structure: "Структура текста", ctc: "Связь двух текстов", ci_main: "Главная идея", ci_detail: "Деталь текста", coe_text: "Цитата-доказательство",
    coe_quant: "Данные таблицы и графика", inf_complete: "Вывод «логично завершает»",
    alg_lin1: "Линейное уравнение", alg_linfunc: "Линейная функция", alg_lin2: "Уравнение с двумя переменными", alg_system: "Система уравнений", alg_ineq: "Неравенства",
    adv_equiv: "Равносильные выражения", adv_quad: "Квадратные уравнения и парабола", adv_exp: "Экспонента и проценты роста", adv_func: "Функции и их запись",
    adv_nonlin: "Нелинейные уравнения и системы", psda_ratio: "Отношения, скорости, единицы", psda_pct: "Проценты", psda_stats1: "Среднее, медиана, разброс",
    psda_stats2: "Диаграммы рассеяния и модели", psda_prob: "Вероятность", psda_infer: "Выборки и выводы", geo_areavol: "Площадь и объём",
    geo_lines: "Прямые, углы, треугольники", geo_trig: "Прямоугольный треугольник и тригонометрия", geo_circle: "Окружность" };
  const DOMN = { rw: ["Смысл и структура", "Информация и идеи", "Стандарт английского", "Выразительность"], math: ["Алгебра", "Продвинутая алгебра", "Данные и задачи", "Геометрия и тригонометрия"] };
  const TRAP = { too_strong: "Слишком сильно сказано", off_topic: "Правда, но не по вопросу", reversed: "Перевёрнутая связь", half_right: "Половина верна", scope: "Шире или уже текста",
    unsupported: "Не следует из текста", wrong_relation: "Неверная логическая связь", wrong_sense: "Обычное значение вместо контекстного", goal_miss: "Не та цель заметок",
    sounds_right: "«Звучит правильно», но нарушает правило", wordy: "Лишние слова", sign_error: "Ошибка знака", step_short: "Остановился на шаг раньше",
    wrong_quantity: "Нашёл не ту величину", operation: "Не то действие или формула", misread: "Неверно прочитал график или условие", other: "Другое" };
  const PARTS = [["M", "Мастерство"], ["X", "Перенос на экзамен"], ["R", "Удержание"], ["P", "Темп"], ["C", "Исправление"]];
  const NS = "http://www.w3.org/2000/svg", el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a || {}) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const day = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }).replace(/\s?г\.?$/, "");   // with the year (Nurassyl: «добавь года в датах»)
  let tip;
  function showTip(e, html) { if (!tip) { tip = document.createElement("div"); tip.className = "pg-tip"; tip.setAttribute("role", "status"); document.body.appendChild(tip); }
    tip.innerHTML = html; tip.style.opacity = 1; tip.style.left = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8) + "px"; tip.style.top = Math.max(8, e.clientY - tip.offsetHeight - 12) + "px"; }
  const hideTip = () => tip && (tip.style.opacity = 0);

  // a smooth line through the points that never overshoots them (monotone cubic, Fritsch–Carlson), and a y range zoomed to the
  // data (Nurassyl, 2026-11-23: «увеличь масштаб графиков и сделай изменения более заметными»): at least `span` wide, rounded to `step`
  function curve(pts) {
    if (pts.length < 3) return pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
    const n = pts.length, d = [], m = [];
    for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0] || 1));
    m.push(d[0]); for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
    for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; } }
    let path = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], h = (x1 - x0) / 3;
      path += `C${(x0 + h).toFixed(1)},${(y0 + m[i] * h).toFixed(1)} ${(x1 - h).toFixed(1)},${(y1 - m[i + 1] * h).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`; }
    return path;
  }
  function zoom(vals, { lo = 0, hi = 100, span = 10, step = 5 } = {}) {
    const v = vals.filter((x) => x != null && !isNaN(x)); if (!v.length) return [lo, hi];
    let a = Math.min(...v), b = Math.max(...v); const pad = Math.max((b - a) * 0.15, span * 0.15);
    a = Math.floor((a - pad) / step) * step; b = Math.ceil((b + pad) / step) * step;
    while (b - a < span) { if (a > lo) a -= step; if (b - a < span && b < hi) b += step; if (a <= lo && b >= hi) break; }
    return [Math.max(lo, a), Math.min(hi, b)];
  }
  function line(box, { series, times, ymax = 100, fmt = (v) => v, marks = [], h = 220, note = null, dots = false, vline = null }) {
    box.innerHTML = ""; const W = 720, P = { l: 34, r: 92, t: 10, b: 26 }, n = times.length; if (!n) return;
    const svg = el("svg", { viewBox: `0 0 ${W} ${h}`, role: "img", "aria-label": series.map((s) => s.label).join(", ") }, box);
    const [y0, y1] = zoom(series.flatMap((s) => s.v), { hi: ymax, span: Math.max(10, ymax / 10), step: 5 });
    const x = (i) => P.l + (W - P.l - P.r) * (n === 1 ? 0.5 : i / (n - 1)), y = (v) => P.t + (h - P.t - P.b) * (1 - (v - y0) / (y1 - y0 || 1));
    const ax = el("g", { class: "pg-axis" }, svg);
    const tk = y1 - y0 <= 20 ? 5 : y1 - y0 <= 50 ? 10 : 25;   // round ticks: 15 20 25 30, not 15 19 23 26 30
    for (let v = y0; v <= y1 + 0.001; v += tk) { el("line", { x1: P.l, x2: W - P.r, y1: y(v), y2: y(v) }, ax); el("text", { x: P.l - 6, y: y(v) + 4, "text-anchor": "end" }, ax).textContent = fmt(v); }
    if (vline && n > 1 && vline.t <= times[n - 1]) {   // the day work began (teacher.js «Начало работы»); earlier than the chart: at its left edge
      const before = vline.t < times[0]; let i = 0; while (i < n - 2 && times[i + 1] < vline.t) i++;
      const xv = before ? x(0) : x(i) + (x(i + 1) - x(i)) * Math.min(1, Math.max(0, (vline.t - times[i]) / ((times[i + 1] - times[i]) || 1)));
      el("line", { x1: xv, x2: xv, y1: P.t, y2: h - P.b, stroke: "#A63328", "stroke-width": 1.6, "stroke-dasharray": "4 4" }, svg);
      el("text", { x: xv + 4, y: P.t + 10, "font-size": 11, fill: "#A63328", "font-weight": 600 }, svg).textContent = (before ? "← " : "") + vline.label;
    }
    const step = Math.max(1, Math.ceil(n / 6));
    times.forEach((t, i) => { if (i % step === 0 || i === n - 1) el("text", { x: x(i), y: h - 6, "text-anchor": "middle" }, ax).textContent = day(t); });
    const ends = [];
    series.forEach((s) => {
      const pts = s.v.map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean); if (!pts.length) return;
      if (!s.dash && (dots || s.w >= 3)) pts.forEach((p) => el("circle", { cx: p[0], cy: p[1], r: s.w >= 3 ? 3 : 2.2, fill: s.color }, svg));
      el("path", { d: curve(pts), ...(s.dash ? { "stroke-dasharray": "6 5" } : {}), fill: "none", stroke: s.color, "stroke-width": s.w || 2, "stroke-linejoin": "round", "stroke-linecap": "round", ...(s.dim ? { opacity: 0.85 } : {}) }, svg);
      const lv = s.v[s.v.length - 1]; if (lv != null && !s.nolabel) ends.push({ y: y(lv) + 4, t: `${s.label} ${fmt(lv)}`, bold: s.w >= 3 });
    });
    ends.sort((a, b) => a.y - b.y); for (let k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < 13) ends[k].y = ends[k - 1].y + 13;   // end labels never overlap
    ends.forEach((e) => (el("text", { x: x(n - 1) + 8, y: e.y, class: "pg-dl" + (e.bold ? " pg-dlb" : "") }, svg).textContent = e.t));
    marks.forEach((i) => { const v = series[0].v[i]; if (v != null) el("circle", { cx: x(i), cy: y(v), r: 5, fill: "#A63328", stroke: "#fff", "stroke-width": 2 }, svg); });
    const cross = el("line", { y1: P.t, y2: h - P.b, stroke: "#77736D", opacity: 0 }, svg), hit = el("rect", { x: P.l, y: P.t, width: W - P.l - P.r, height: h - P.t - P.b, fill: "transparent" }, svg);
    hit.addEventListener("mousemove", (e) => { const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (W / r.width), i = n === 1 ? 0 : Math.max(0, Math.min(n - 1, Math.round((px - P.l) / ((W - P.l - P.r) / (n - 1)))));
      cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("opacity", 1);
      showTip(e, `<b>${day(times[i])}</b><br>` + series.map((s) => `${esc(s.label)}: <b>${s.v[i] == null ? "—" : fmt(s.v[i])}</b>`).join("<br>") + (marks.includes(i) ? "<br>пробный тест" : "") + (note ? note(i) : "")); });
    hit.addEventListener("mouseleave", () => { cross.setAttribute("opacity", 0); hideTip(); });
  }
  // a small line zoomed to its own values (at least 10 points tall), with the first and the last value written beside it
  function spark(vals, color = "#0F0F0F", w = 110, h = 26) {
    h = Math.max(h, 34); const W = w + 34;
    const s = el("svg", { viewBox: `0 0 ${W} ${h}`, width: W, height: h, "aria-hidden": "true" }), v = vals.filter((x) => x != null); if (v.length < 2) return s;
    const [lo, hi] = zoom(v.map((q) => q * 100), { span: 10, step: 5 }), first = vals.findIndex((q) => q != null);
    const x = (i) => 3 + (w - 6) * i / (vals.length - 1), y = (q) => h - 4 - (h - 8) * ((q * 100 - lo) / (hi - lo || 1));
    const pts = vals.map((q, i) => (q == null ? null : [x(i), y(q)])).filter(Boolean);
    el("path", { d: curve(pts), fill: "none", stroke: color, "stroke-width": 2, "stroke-linecap": "round" }, s);
    const last = pts[pts.length - 1]; el("circle", { cx: last[0], cy: last[1], r: 2.6, fill: color === "#0F0F0F" ? "#A63328" : color }, s);
    const d = Math.round(v[v.length - 1] * 100 - vals[first] * 100);
    const t = el("text", { x: w + 2, y: h / 2 + 4, "font-size": 11, fill: d > 0 ? "#2F7A33" : d < 0 ? "#A63328" : "#5E5A54", "font-weight": 600 }, s); t.textContent = `${d > 0 ? "+" : d < 0 ? "−" : "±"}${Math.abs(d)}`;
    return s;
  }

  // index change a steady simulated student shows by chance (1 sd, 2026-11-22): ±7 at 72 answers a week, ±15 at 36; scales as 1/√answers
  const noiseOf = (perWeek) => Math.min(25, 7 * Math.sqrt(72 / Math.max(10, perWeek)));
  // box: container; res: PROGRESS.compute result; o: { name }
  function render(box, res, o = {}) {
    if (o.target && window.PROGRESS && PROGRESS.targetFor) o = { ...o, target: PROGRESS.targetFor(res, o.target) };
    // period: 8 weeks, or all the time when the last answers are older than that (practice tests taken long ago)
    const lastNew = (() => { const S = res.snaps; for (let i = S.length - 1; i > 0; i--) if (S[i].nAns > S[i - 1].nAns) return i; return 0; })();
    const st = { weeks: res.snaps.length - 1 - lastNew > 8 ? 99 : 8, sec: res.secs[0], dom: null };
    const T0 = o.start && o.start.t ? o.start.t : null, VL = T0 ? { t: T0, label: "начало работы · " + day(T0) } : null;
    if (T0 && res.snaps.some((x) => x.t >= T0)) st.weeks = -1;   // with a start date the block opens on «С начала работы»
    // which sources count (teacher.js): chips that stay even when the chosen sources give too few answers for an index
    const srcHTML = () => (o.sources && o.sources.list.length ? `<div class="chips pg-src" role="group" aria-label="Что учитывать">${o.sources.list.map((x) => `<button class="chip" type="button" data-src="${x.k}" aria-pressed="${x.on}">${esc(x.l)} <small>${x.n}</small></button>`).join("")}</div>` : "");
    const srcWire = () => { if (o.sources) box.querySelectorAll("[data-src]").forEach((b) => (b.onclick = () => {   // at least one source stays on
      const on = b.getAttribute("aria-pressed") !== "true"; if (!on && o.sources.list.filter((x) => x.on).length <= 1) return; o.sources.set(b.dataset.src, on); })); };
    // «С начала работы» (2026-11-23, Nurassyl: «с какого момента начал работу… добавь глубинного анализа каждому»): the index then
    // and now, the answers and active weeks since, the subtopics that grew most and the ones standing still, answers per week
    function sinceHTML(S, n, k0) {
      const after = S.filter((x) => x.t > T0), WK = 6048e5, weeks = after.length ? Math.floor((after[after.length - 1].t - T0 - 1) / WK) + 1 : 0;
      if (!weeks) return `<section class="pg-since"><b>С начала работы · ${esc(day(T0))}</b><p class="hint">После этой даты ответов пока нет.</p></section>`;
      const base = k0 >= 0 ? S[k0] : null, b0 = S.findIndex((x) => x.t >= (base ? base.t : T0) && x.index != null && x.nAns >= PROGRESS.MIN_IX);
      const from = base && base.index != null && base.nAns >= PROGRESS.MIN_IX ? base : b0 >= 0 ? S[b0] : null, last = S[n - 1];
      const ans = last.nAns - (base ? base.nAns : 0), per = Array(weeks).fill(0); let prev = base ? base.nAns : 0;
      for (const x of after) { per[Math.floor((x.t - T0 - 1) / WK)] += x.nAns - prev; prev = x.nAns; }   // weeks counted from the start date
      const active = per.filter((v) => v > 0).length, mxp = Math.max(1, ...per);
      const ki = from ? S.indexOf(from) : -1;
      const ch = ki < 0 ? [] : res.subs.filter((x) => x.n >= 3 && x.series[n - 1] != null && x.series[ki] != null).map((x) => ({ k: x.k, d: x.series[n - 1] - x.series[ki], now: x.series[n - 1] })).sort((p, q) => q.d - p.d);
      const up = ch.filter((x) => x.d > 0.02).slice(0, 3), flat = ch.slice().reverse().filter((x) => x.d <= 0.02).slice(0, 3);
      const d = from ? last.index - from.index : null;
      return `<section class="pg-since"><b>С начала работы · ${esc(day(T0))}</b>${o.start.from ? ` <span class="hint">(${esc(o.start.from)})</span>` : ""}
        <div class="pg-since-row"><div><span class="hint">индекс</span><div class="n">${from ? `${from.index} → ${last.index}` : "—"}${d != null ? ` <small class="${d >= 0 ? "up" : "down"}">${d >= 0 ? "+" : "−"}${Math.abs(d)}</small>` : ""}</div>${from && from !== base ? '<div class="hint">точка отсчёта: первая неделя с достаточным числом ответов</div>' : ""}</div>
          <div><span class="hint">ответов с первой попытки</span><div class="n">${ans}</div></div>
          <div><span class="hint">недель с работой</span><div class="n">${active} из ${weeks}</div></div></div>
        <div class="pg-weeks" aria-label="Ответы по неделям">${per.map((v, i) => `<i style="height:${Math.round(4 + 40 * v / mxp)}px" title="неделя с ${esc(day(T0 + i * WK))}: ${v} ответов"${v ? "" : ' class="zero"'}></i>`).join("")}</div>
        <div class="pg-grid2"><div><span class="hint">Выросло больше всего</span>${up.length ? `<ul>${up.map((x) => `<li>${esc(NAME[x.k] || x.k)} <b class="up">+${pct(x.d)}</b> <span class="hint">· сейчас ${pct(x.now)}%</span></li>`).join("")}</ul>` : `<p class="hint">${ch.length ? "Пока нет заметного роста." : "Мало данных по подтемам."}</p>`}</div>
          <div><span class="hint">Стоит на месте или просело</span>${flat.length ? `<ul>${flat.map((x) => `<li>${esc(NAME[x.k] || x.k)} <b class="${x.d < -0.02 ? "down" : ""}">${x.d >= 0 ? "+" : "−"}${pct(Math.abs(x.d))}</b> <span class="hint">· сейчас ${pct(x.now)}%</span></li>`).join("")}</ul>` : ch.length ? '<p class="hint">Всё растёт.</p>' : '<p class="hint">Мало данных по подтемам.</p>'}</div></div></section>`;
    }
    const draw = () => {
      const S = res.snaps, n = S.length, start = S.findIndex((s) => s.nAns >= PROGRESS.MIN_IX && s.index != null), last = S[n - 1];
      // weeks resting on fewer than MIN_IX answers are not drawn: there the start value of the model, not the student, sets the line
      if (start < 0) { const na = last ? last.nAns : 0, c = (last && last.cnt) || {}, by = Object.keys(c).map((k) => `${k === "rw" ? "Reading and Writing" : "Math"}: ${Object.values(c[k]).reduce((x, y) => x + y[1], 0)}`).join(", ");
        box.innerHTML = `<div class="card pg"><span class="label">Прогресс ученика</span>${srcHTML()}<p class="hint">${na < PROGRESS.MIN_IX ? `Мало ответов для расчёта: ${na} из ${PROGRESS.MIN_IX}.` : `Ни в одном разделе пока нет ${PROGRESS.MIN_SEC} ответов (${by}).`} Индекс появится, когда ответов с первой попытки будет ${PROGRESS.MIN_IX}, из них ${PROGRESS.MIN_SEC} в одном разделе.</p></div>`; srcWire(); return; }
      let k0 = -1; if (T0) S.forEach((x, i) => { if (x.t <= T0 + 864e5) k0 = i; });
      const a = st.weeks === -1 ? Math.max(start, Math.max(0, k0)) : Math.max(start, n - 1 - st.weeks), cut = S.slice(a), first = cut[0];
      const NOISE = noiseOf((last.nAns - first.nAns) / Math.max(1, (last.t - first.t) / 6048e5)), d = last.index - first.index, slope = cut.length > 1 ? (last.index - cut[Math.max(0, cut.length - 4)].index) / Math.min(3, cut.length - 1) : 0;
      const drv = PROGRESS.drivers(res, a, n - 1).slice(0, 6), mx = Math.max(1e-6, ...drv.map((x) => Math.abs(x.v)));
      box.innerHTML = `<div class="card pg"><div class="pg-top"><div><span class="label">Прогресс ученика · индекс</span>
          <p class="hint">Внутренняя аналитика по ответам с первой попытки и разметке подтем. Не балл SAT и не для публикации.</p></div>
          ${srcHTML()}
          <div class="chips" role="group" aria-label="Период">${[...(T0 ? [[-1, "С начала работы"]] : []), [4, "4 недели"], [8, "8 недель"], [99, "Всё время"]].map(([v, l]) => `<button class="chip" type="button" data-pw="${v}" aria-pressed="${st.weeks === v}">${l}</button>`).join("")}</div></div>
        <div class="pg-grid">
          <section class="pg-hero">${o.target && Object.keys(o.target).length ? `<div class="pg-goal">${Object.entries(o.target).map(([sec, t]) => { const ms = res.subs.filter((x) => x.sec === sec && x.n >= 3 && x.series[S.length - 1] != null), cur = ms.length ? ms.reduce((q, x) => q + x.series[S.length - 1], 0) / ms.length : null, below = ms.filter((x) => (t.sub[x.k] ?? t.mastery) - x.series[S.length - 1] > 0.05).length;
            if (t.current && t.current >= t.score) return `<div><b>Цель ${sec === "rw" ? "RW" : "Math"} ${t.score}</b> (ориентир сейчас ≈ ${t.current}): уже на уровне цели, её можно поднять.</div>`;
            return `<div><b>Цель ${sec === "rw" ? "RW" : "Math"} ${t.score}</b>${t.current ? ` (ориентир сейчас ≈ ${t.current})` : ""} · нужно мастерство ${pct(t.mastery)}%${cur != null ? `, сейчас в среднем ${pct(cur)}%` : ""} · трудные вопросы: нужно ${pct(t.acc.H)}% · ниже цели: ${below} из ${ms.length} подтем</div>`; }).join("")}${Object.values(o.target).some((t) => !t.current) ? '<div class="hint">Без пробного теста цель сравнивается по шкале nurzycom напрямую и получается строже; после первого полного пробника сравнение идёт от ориентира ученика.</div>' : ""}</div>` : ""}<div class="pg-big">${last.index}</div><div class="pg-delta ${Math.abs(d) < NOISE ? "pg-noise" : d >= 0 ? "up" : "down"}">${d >= 0 ? "▲ +" : "▼ "}${d} <span>с ${day(first.t)}${Math.abs(d) < NOISE ? ` · в пределах шума (±${Math.round(NOISE)})` : ""}</span></div>
            <div class="pg-kv"><span>Скорость <b>${slope >= 0 ? "+" : ""}${slope.toFixed(1)}</b> в неделю</span><span>Ответов <b>${res.n}</b>, размечено <b>${res.tagged}</b></span></div>${start > 0 ? `<p class="hint">Недели до ${day(S[start].t)} не показаны: меньше ${PROGRESS.MIN_IX} ответов.</p>` : ""}
            <p class="hint">Собран из ${last.used} частей из 5${last.used < 5 ? ": для остальных пока мало данных" : ""}. Около 0 — ответы наугад, 100 — уверенное решение на экзаменационном уровне.</p></section>
          <section class="pg-chart"><b>Индекс по неделям</b><div id="pg-ix"></div></section></div>
        <div class="pg-parts">${PARTS.map(([k, l]) => { const v = cut.map((s) => s.parts[k]), now = last.parts[k], was = first.parts[k];
          return `<div class="pg-part" data-pp="${k}"><div class="l">${l}</div><div class="n">${now == null ? "—" : Math.round(now)}${now != null && was != null ? ` <small class="${now >= was ? "up" : "down"}">${now >= was ? "+" : ""}${Math.round(now - was)}</small>` : ""}</div><div class="w">${now == null ? "мало данных" : "вес " + String(PROGRESS.W[k]).replace(".", ",")}</div></div>`; }).join("")}</div>
        ${T0 ? sinceHTML(S, n, k0) : ""}
        <div class="pg-grid2"><section><b>Откуда рост за период</b><p class="hint">Только изменения больше шума.</p><ul class="pg-drv">${drv.length ? drv.map((x) => `<li><div><span>${esc(NAME[x.k] || x.k)}</span><div class="pg-bar"><i style="width:${Math.abs(x.v) / mx * 100}%;background:${x.v >= 0 ? "#0F0F0F" : "#A63328"}"></i></div></div><b class="${x.v >= 0 ? "up" : "down"}">${x.v >= 0 ? "+" : ""}${x.v.toFixed(1)}</b></li>`).join("") : '<li class="hint">За период нет изменений больше шума. По 4–5 ответам в неделю на подтему рост виден через 3–4 недели.</li>'}</ul></section>
          <section><b>Сложность вопросов</b>${res.secs.length > 1 ? `<div class="chips">${res.secs.map((s) => `<button class="chip" type="button" data-ps="${s}" aria-pressed="${st.sec === s}">${s === "rw" ? "Reading and Writing" : "Math"}</button>`).join("")}</div>` : ""}
            <p class="hint">Ожидаемая доля верных ответов, угадывание учтено. Линия уровня появляется после ${PROGRESS.MIN_LV} ответов этого уровня.</p><div class="pg-legend"><span><i style="background:#2A7DB8"></i>Лёгкие</span><span><i style="background:#6E57C9"></i>Средние</span><span><i style="background:#B5402F"></i>Трудные</span></div><div id="pg-df"></div></section></div>
        <section class="pg-domain"><b>Домен</b><div class="chips" role="group" aria-label="Домен">${res.secs.flatMap((sec) => DOMN[sec].map((d, i) => `<button class="chip" type="button" data-pd="${sec}:${i}">${esc(d)}</button>`)).join("")}</div>
          <p class="hint">Жирная линия — домен в целом, тонкие — навыки College Board внутри него. Навык показан, когда по нему есть ответы; «хромает» — ниже домена на 5 пунктов и больше.</p><div class="pg-legend" id="pg-domleg"></div><div id="pg-dom"></div></section>
        <section><b>Карта подтем</b><p class="hint">Чёрная полоса — сейчас, красная метка — начало периода. Изменение серым — в пределах шума: по стольким ответам его нельзя отличить от случайности. Серая строка — меньше трёх ответов.</p>
          <div id="pg-mapctl"></div><div class="tw"><table class="dt pg-map"><thead><tr><th>Подтема</th><th style="width:26%">Мастерство</th><th class="num">Сейчас</th><th class="num">Изм.</th><th>По неделям</th><th class="num">Ответов</th><th>Статус</th>${o.onTwins ? "<th><span class=\"sr-only\">Gemini</span></th>" : ""}</tr></thead><tbody id="pg-rows"></tbody></table></div></section>
        <div class="pg-grid2"><section><b>Ловушки</b><p class="hint">Как часто выбирает ловушку, когда она есть: начало → сейчас. Меньше — лучше.</p><div id="pg-tr"></div></section>
          <section><b>Привычки</b><div id="pg-hb"></div></section></div></div>`;
      line(box.querySelector("#pg-ix"), { vline: VL, series: [{ v: cut.map((s) => s.index), color: "#0F0F0F", label: "Индекс", w: 2.5 }], times: cut.map((s) => s.t), dots: true,
        marks: cut.map((s, i) => (res.mocks.some((t) => t <= s.t && t > (cut[i - 1] ? cut[i - 1].t : 0)) ? i : -1)).filter((i) => i >= 0) });
      const ds = cut.map((s) => s.diff[st.sec] || {});
      const TG = o.target && o.target[st.sec];
      line(box.querySelector("#pg-df"), { vline: VL, series: [["E", "#2A7DB8", "Лёгкие"], ["M", "#6E57C9", "Средние"], ["H", "#B5402F", "Трудные"]].flatMap(([k, c, l]) => [{ v: ds.map((x) => (x[k] == null ? null : x[k] * 100)), color: c, label: l },
          ...(TG && ds.some((x) => x[k] != null) ? [{ v: ds.map(() => TG.acc[k] * 100), color: c, label: `цель ${l.toLowerCase()}`, w: 1.4, dash: true }] : [])]),
        times: cut.map((s) => s.t), fmt: (v) => Math.round(v) + "%", h: 240,
        note: (i) => { const c = (cut[i].cnt || {})[st.sec] || {}, f = [["E", "лёгкие"], ["M", "средние"], ["H", "трудные"]].filter(([k]) => c[k]).map(([k, l]) => `${l} ${c[k][0]}/${c[k][1]}`); return f.length ? `<br><span class="pg-tipn">Факт к этой дате: ${f.join(" · ")}</span>` : ""; } });
      box.querySelectorAll("[data-pp]").forEach((elx) => elx.appendChild(spark(cut.map((s) => (s.parts[elx.dataset.pp] == null ? null : s.parts[elx.dataset.pp] / 100)), "#0F0F0F", 140, 28)));
      // «Карта подтем»: grouping, a status filter, sorting and folding (Nurassyl, 2026-11-23: «allow me to categorize the sections
      // here»); the choice is kept in this browser for every student
      const MK = "pg_map", mp = (() => { try { return Object.assign({ g: "dom", f: "all", s: "order", closed: {} }, JSON.parse(localStorage.getItem(MK) || "{}")); } catch (e) { return { g: "dom", f: "all", s: "order", closed: {} }; } })();
      const saveMap = () => { try { localStorage.setItem(MK, JSON.stringify(mp)); } catch (e) { /* private mode */ } };
      const HAS_T = !!(o.target && Object.keys(o.target).length);
      const ST_ORDER = HAS_T ? [["stuck", "Ниже цели"], ["grow", "На уровне цели"], ["ok", "Выше цели"], ["thin", "Мало данных"]] : [["stuck", "Требуют внимания"], ["grow", "Растут"], ["", "Держатся"], ["ok", "Освоено"], ["thin", "Мало данных"]];
      const all = [];
      res.secs.forEach((sec) => PROGRESS.DOMAINS[sec].forEach(([, list], gi) => res.subs.filter((x) => x.sec === sec && list.includes(x.k) && x.n > 0).forEach((x) => {
        const thin = x.n < 3, c = thin ? null : PROGRESS.change(res, x, a, n - 1), b0 = c ? c.from : n - 1, now = x.series[n - 1] ?? 0, was = x.series[b0] ?? now, ch = c ? c.ch : 0, sig = c && Math.abs(c.z) >= PROGRESS.ZMIN, late = !!c && b0 > a;   // change from the first reliable value; sig: above the noise
        const need = o.target && o.target[sec] ? o.target[sec].sub[x.k] ?? o.target[sec].mastery : null;
        const stt = need != null ? PROGRESS.vsTarget(thin ? null : now, need, x.n) : thin ? ["thin", "мало данных"] : now >= 0.8 ? ["ok", "освоено"] : sig && ch > 0 ? ["grow", "растёт"] : sig && ch < 0 ? ["stuck", "просело"] : now < 0.45 ? ["stuck", "слабое место"] : ["", "держится"];
        all.push({ x, sec, gi, thin, c, b0, now, was, ch, sig, late, stt, need, gap: need != null ? need - now : null });
      })));
      const SECN = { rw: "Reading and Writing", math: "Math" };
      const groupOf = (r) => mp.g === "dom" ? [`d:${r.sec}:${r.gi}`, DOMN[r.sec][r.gi], `${r.sec}${r.gi}`] : mp.g === "status" ? [`s:${r.stt[0]}`, ST_ORDER.find(([k]) => k === r.stt[0])[1], String(ST_ORDER.findIndex(([k]) => k === r.stt[0]))] : mp.g === "sec" ? [`c:${r.sec}`, SECN[r.sec], r.sec === "rw" ? "0" : "1"] : ["all", "", "0"];
      const keep = (r) => mp.f === "all" || (mp.f === "attn" ? r.stt[0] === "stuck" : r.stt[0] === mp.f);
      const sorter = mp.s === "gap" ? (p, q) => (p.thin - q.thin) || (q.gap ?? -9) - (p.gap ?? -9) : mp.s === "low" ? (p, q) => (p.thin - q.thin) || p.now - q.now : mp.s === "change" ? (p, q) => (p.thin - q.thin) || p.ch - q.ch : mp.s === "n" ? (p, q) => q.x.n - p.x.n : () => 0;
      const shown = all.filter(keep), G = new Map();
      for (const r of shown) { const [id, title, ord] = groupOf(r); if (!G.has(id)) G.set(id, { id, title, ord, rows: [] }); G.get(id).rows.push(r); }
      const cnt = (f) => (f === "all" ? all.length : all.filter((r) => (f === "attn" ? r.stt[0] === "stuck" : r.stt[0] === f)).length);
      const chip = (attr, v, cur, label) => `<button class="chip" type="button" data-${attr}="${v}" aria-pressed="${cur === v}">${label}</button>`;
      box.querySelector("#pg-mapctl").innerHTML = `<div class="pg-mapctl"><span class="hint">Группировать</span><div class="chips" role="group" aria-label="Группировать">${[["dom", "по доменам"], ["status", "по статусу"], ["sec", "по разделу"], ["none", "без групп"]].map(([v, l]) => chip("mg", v, mp.g, l)).join("")}</div></div>
        <div class="pg-mapctl"><span class="hint">Показать</span><div class="chips" role="group" aria-label="Показать">${(HAS_T ? [["all", "все"], ["attn", "ниже цели"], ["grow", "на уровне цели"], ["ok", "выше цели"], ["thin", "мало данных"]] : [["all", "все"], ["attn", "требуют внимания"], ["grow", "растут"], ["", "держатся"], ["ok", "освоено"], ["thin", "мало данных"]]).filter(([v]) => v === "all" || cnt(v)).map(([v, l]) => chip("mf", v, mp.f, `${l} <small>${cnt(v)}</small>`)).join("")}</div></div>
        <div class="pg-mapctl"><span class="hint">Сортировать</span><div class="chips" role="group" aria-label="Сортировать">${[["order", "как в SAT"], ...(HAS_T ? [["gap", "дальше от цели сверху"]] : []), ["low", "слабые сверху"], ["change", "просели сверху"], ["n", "больше ответов"]].map(([v, l]) => chip("ms", v, mp.s, l)).join("")}</div></div>`;
      const tb = box.querySelector("#pg-rows"), cols = o.onTwins ? 8 : 7;
      if (!shown.length) tb.innerHTML = `<tr><td colspan="${cols}" class="hint">Нет подтем с таким статусом.</td></tr>`;
      [...G.values()].sort((p, q) => (p.ord < q.ord ? -1 : p.ord > q.ord ? 1 : 0)).forEach((g) => {
        const closed = !!mp.closed[g.id], rated = g.rows.filter((r) => !r.thin), avg = rated.length ? rated.reduce((a, r) => a + r.now, 0) / rated.length : null;
        if (g.title) tb.insertAdjacentHTML("beforeend", `<tr class="pg-grp"><td class="pg-dom" colspan="${cols}"><button type="button" class="pg-fold" data-mfold="${esc(g.id)}" aria-expanded="${!closed}"><span class="pg-caret" aria-hidden="true">${closed ? "▸" : "▾"}</span>${esc(g.title)} <small>${g.rows.length} ${g.rows.length === 1 ? "подтема" : g.rows.length < 5 ? "подтемы" : "подтем"}${avg != null ? ` · в среднем ${pct(avg)}%` : ""}</small></button></td></tr>`);
        if (closed) return;
        g.rows.slice().sort(sorter).forEach((r) => {
          const { x, thin, c, b0, now, was, ch, sig, late, stt } = r;
          const tr = document.createElement("tr"); if (thin) tr.className = "pg-thin";
          tr.innerHTML = `<td>${esc(NAME[x.k] || x.k)}</td><td><div class="pg-bar"><i style="width:${pct(now)}%"></i><em style="left:calc(${pct(was)}% - 1px)"></em>${r.need != null ? `<u class="pg-need" style="left:calc(${pct(r.need)}% - 1px)" title="нужно для цели ${pct(r.need)}%"></u>` : ""}</div></td><td class="num"><b>${x.series[n - 1] == null ? "—" : pct(now) + "%"}</b>${r.need != null && !thin ? `<div class="hint">нужно ${pct(r.need)}%</div>` : ""}</td><td class="num ${!sig ? "pg-noise" : ch >= 0 ? "up" : "down"}"${late ? ` title="изменение с ${day(S[b0].t)}, когда появилось 3 ответа"` : ""}>${thin ? "—" : (ch >= 0 ? "+" : "") + pct(ch)}${late ? `<div class="hint">с ${day(S[b0].t)}</div>` : ""}</td><td class="sp"></td><td class="num">${x.n}</td><td><span class="pg-pill ${stt[0]}">${stt[1]}</span></td>${o.onTwins ? `<td><button class="pg-tw" type="button" data-twk="${x.k}" title="Похожие вопросы на ошибки этой подтемы">Похожие</button></td>` : ""}`;
          tr.querySelector(".sp").appendChild(spark(x.series.slice(a).map((v, j) => (a + j < b0 ? null : v)), thin ? "#D9D5CD" : "#0F0F0F"));
          tb.appendChild(tr);
        });
      });
      const ctl = box.querySelector("#pg-mapctl");
      ctl.querySelectorAll("[data-mg]").forEach((b) => (b.onclick = () => { mp.g = b.dataset.mg; saveMap(); draw(); }));
      ctl.querySelectorAll("[data-mf]").forEach((b) => (b.onclick = () => { mp.f = b.dataset.mf; saveMap(); draw(); }));
      ctl.querySelectorAll("[data-ms]").forEach((b) => (b.onclick = () => { mp.s = b.dataset.ms; saveMap(); draw(); }));
      tb.querySelectorAll("[data-mfold]").forEach((b) => (b.onclick = () => { const k = b.dataset.mfold; if (mp.closed[k]) delete mp.closed[k]; else mp.closed[k] = 1; saveMap(); draw(); }));
      box.querySelector("#pg-tr").innerHTML = res.traps.length ? res.traps.slice(0, 6).map((x) => `<div class="pg-trap"><div><span>${esc(TRAP[x.trap] || x.trap)}</span><span class="num"><span class="hint">${pct(x.was)}%</span> → <b>${pct(x.now)}%</b></span></div><div class="pg-bar"><i style="width:${pct(x.now)}%"></i><em style="left:calc(${pct(x.was)}% - 1px)"></em></div>${o.onTwins ? `<button class="pg-tw" type="button" data-twt="${esc(x.trap)}" title="Похожие вопросы на ошибки с этой ловушкой">Похожие</button>` : ""}</div>`).join("") : '<p class="hint">Пока мало вопросов с размеченными ловушками.</p>';
      const H = res.habits;
      box.querySelector("#pg-hb").innerHTML = [["Невнимательность", "ошибки там, где модель была почти уверена в верном ответе", H.slip, H.slipExpected], ["Пропуски", "вопросы без ответа", H.blank, null]]
        .map(([l, s, v, e]) => `<div class="pg-hab"><div><b>${l}</b><div class="hint">${s}</div></div><div class="num">${v == null ? "—" : pct(v) + "%"}${e != null ? `<div class="hint">ожидалось ${pct(e)}%</div>` : ""}</div></div>`).join("");
      box.querySelectorAll("[data-pw]").forEach((b) => (b.onclick = () => { st.weeks = +b.dataset.pw; draw(); }));
      srcWire();
      // the domain chart: the weakest domain by default
      const DS = res.secs.flatMap((sec) => DOMN[sec].map((d, i) => ({ id: `${sec}:${i}`, sec, i, d: PROGRESS.domainSeries(res, sec, i) })));
      if (!st.dom || !DS.some((x) => x.id === st.dom)) { const last = (x) => { const v = x.d && x.d.dom.filter((y) => y != null); return v && v.length ? v[v.length - 1] : 9; }; st.dom = (DS.slice().sort((a, b) => last(a) - last(b))[0] || {}).id; }
      const cur = DS.find((x) => x.id === st.dom);
      box.querySelectorAll("[data-pd]").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.pd === st.dom)); b.onclick = () => { st.dom = b.dataset.pd; draw(); }; });
      if (cur && cur.d) {
        const PAL = ["#2A7DB8", "#B5402F", "#3E8E41", "#C77C02", "#6E57C9", "#1B8A8A", "#B0397E", "#5E5A54"], N = res.snaps.length;
        const domNow = cur.d.dom[N - 1], sk = cur.d.skills.map((x, k) => ({ ...x, color: PAL[k % PAL.length], now: x.series[N - 1] })).sort((p, q) => (p.now ?? 9) - (q.now ?? 9));
        const hid = (st.hide = st.hide || {}), off = (k) => !!hid[cur.id + "|" + k];   // lines switched off in the legend (all on by default)
        const lg = (k, inner, cls) => `<button type="button" class="pg-lg${cls ? " " + cls : ""}" data-lg="${esc(k)}" aria-pressed="${!off(k)}" title="Показать или скрыть линию">${inner}</button>`;
        box.querySelector("#pg-domleg").innerHTML = lg("dom", `<i style="background:#0F0F0F;height:4px"></i><b>${esc(DOMN[cur.sec][cur.i])} в целом</b>`) + sk.map((x) => lg(x.skill, `<i style="background:${x.color}"></i>${esc(x.skill)} <small>· ответов ${Math.round(x.n)}</small>${x.now != null && domNow != null && x.now < domNow - 0.05 ? " · хромает" : ""}`, x.now != null && domNow != null && x.now < domNow - 0.05 ? "pg-limp" : "")).join("")
          + (Object.keys(hid).some((k) => k.startsWith(cur.id + "|") && hid[k]) ? '<button type="button" class="pg-lg pg-lg-all" data-lg-all>Показать все</button>' : "");
        box.querySelectorAll("#pg-domleg [data-lg]").forEach((b) => (b.onclick = () => { const k = cur.id + "|" + b.dataset.lg, vis = 1 + sk.length - sk.filter((x) => off(x.skill)).length - (off("dom") ? 1 : 0);
          if (!hid[k] && vis <= 1) return;   // the last visible line stays
          hid[k] = !hid[k]; draw(); }));
        const all = box.querySelector("#pg-domleg [data-lg-all]"); if (all) all.onclick = () => { Object.keys(hid).forEach((k) => { if (k.startsWith(cur.id + "|")) delete hid[k]; }); draw(); };
        const TD = o.target && o.target[cur.sec];
        line(box.querySelector("#pg-dom"), { vline: VL, series: [...(TD ? [{ v: cur.d.dom.slice(a).map(() => TD.mastery * 100), color: "#A63328", label: "Нужно для цели", w: 1.4, dash: true }] : []),
          ...(off("dom") ? [] : [{ v: cur.d.dom.slice(a).map((v) => (v == null ? null : v * 100)), color: "#0F0F0F", label: "Домен", w: 3.5 }]),
          ...sk.filter((x) => !off(x.skill)).map((x) => ({ v: x.series.slice(a).map((v) => (v == null ? null : v * 100)), color: x.color, label: x.skill, w: 1.6, nolabel: true }))],   // skill names are in the legend
          times: cut.map((q) => q.t), fmt: (v) => Math.round(v) + "%", h: 260 });
      }
      if (o.onTwins) { box.querySelectorAll("[data-twk]").forEach((b) => (b.onclick = () => o.onTwins({ focus: NAME[b.dataset.twk] || "" })));
        box.querySelectorAll("[data-twt]").forEach((b) => (b.onclick = () => o.onTwins({ trap: TRAP[b.dataset.twt] || "" }))); }
      box.querySelectorAll("[data-ps]").forEach((b) => (b.onclick = () => { st.sec = b.dataset.ps; draw(); }));
    };
    draw();
  }
  return { render, NAME, TRAP, DOMN, line, spark, day };   // line/spark/day also draw the group block (teacher.js)
})();
