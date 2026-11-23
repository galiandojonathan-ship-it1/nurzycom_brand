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

  function line(box, { series, times, ymax = 100, fmt = (v) => v, marks = [], h = 220, note = null }) {
    box.innerHTML = ""; const W = 720, P = { l: 34, r: 92, t: 10, b: 26 }, n = times.length; if (!n) return;
    const svg = el("svg", { viewBox: `0 0 ${W} ${h}`, role: "img", "aria-label": series.map((s) => s.label).join(", ") }, box);
    const x = (i) => P.l + (W - P.l - P.r) * (n === 1 ? 0.5 : i / (n - 1)), y = (v) => P.t + (h - P.t - P.b) * (1 - v / ymax);
    const ax = el("g", { class: "pg-axis" }, svg);
    for (let k = 0; k <= 4; k++) { const v = ymax * k / 4; el("line", { x1: P.l, x2: W - P.r, y1: y(v), y2: y(v) }, ax); el("text", { x: P.l - 6, y: y(v) + 4, "text-anchor": "end" }, ax).textContent = fmt(v); }
    const step = Math.max(1, Math.ceil(n / 6));
    times.forEach((t, i) => { if (i % step === 0 || i === n - 1) el("text", { x: x(i), y: h - 6, "text-anchor": "middle" }, ax).textContent = day(t); });
    const ends = [];
    series.forEach((s) => {
      const pts = s.v.map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean); if (!pts.length) return;
      el("path", { d: pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(""), fill: "none", stroke: s.color, "stroke-width": s.w || 2, "stroke-linejoin": "round", "stroke-linecap": "round", ...(s.dim ? { opacity: 0.85 } : {}) }, svg);
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
  function spark(vals, color = "#0F0F0F", w = 110, h = 26) {
    const s = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, "aria-hidden": "true" }), v = vals.filter((x) => x != null); if (v.length < 2) return s;
    const x = (i) => 2 + (w - 4) * i / (vals.length - 1), y = (q) => h - 3 - (h - 6) * q;
    el("path", { d: vals.map((q, i) => (q == null ? "" : `${i && vals[i - 1] != null ? "L" : "M"}${x(i)},${y(q)}`)).join(""), fill: "none", stroke: color, "stroke-width": 2, "stroke-linecap": "round" }, s);
    return s;
  }

  // index change a steady simulated student shows by chance (1 sd, 2026-11-22): ±7 at 72 answers a week, ±15 at 36; scales as 1/√answers
  const noiseOf = (perWeek) => Math.min(25, 7 * Math.sqrt(72 / Math.max(10, perWeek)));
  // box: container; res: PROGRESS.compute result; o: { name }
  function render(box, res, o = {}) {
    // period: 8 weeks, or all the time when the last answers are older than that (practice tests taken long ago)
    const lastNew = (() => { const S = res.snaps; for (let i = S.length - 1; i > 0; i--) if (S[i].nAns > S[i - 1].nAns) return i; return 0; })();
    const st = { weeks: res.snaps.length - 1 - lastNew > 8 ? 99 : 8, sec: res.secs[0], dom: null };
    // which sources count (teacher.js): chips that stay even when the chosen sources give too few answers for an index
    const srcHTML = () => (o.sources && o.sources.list.length ? `<div class="chips pg-src" role="group" aria-label="Что учитывать">${o.sources.list.map((x) => `<button class="chip" type="button" data-src="${x.k}" aria-pressed="${x.on}">${esc(x.l)} <small>${x.n}</small></button>`).join("")}</div>` : "");
    const srcWire = () => { if (o.sources) box.querySelectorAll("[data-src]").forEach((b) => (b.onclick = () => {   // at least one source stays on
      const on = b.getAttribute("aria-pressed") !== "true"; if (!on && o.sources.list.filter((x) => x.on).length <= 1) return; o.sources.set(b.dataset.src, on); })); };
    const draw = () => {
      const S = res.snaps, n = S.length, start = S.findIndex((s) => s.nAns >= PROGRESS.MIN_IX && s.index != null), last = S[n - 1];
      // weeks resting on fewer than MIN_IX answers are not drawn: there the start value of the model, not the student, sets the line
      if (start < 0) { const na = last ? last.nAns : 0, c = (last && last.cnt) || {}, by = Object.keys(c).map((k) => `${k === "rw" ? "Reading and Writing" : "Math"}: ${Object.values(c[k]).reduce((x, y) => x + y[1], 0)}`).join(", ");
        box.innerHTML = `<div class="card pg"><span class="label">Прогресс ученика</span>${srcHTML()}<p class="hint">${na < PROGRESS.MIN_IX ? `Мало ответов для расчёта: ${na} из ${PROGRESS.MIN_IX}.` : `Ни в одном разделе пока нет ${PROGRESS.MIN_SEC} ответов (${by}).`} Индекс появится, когда ответов с первой попытки будет ${PROGRESS.MIN_IX}, из них ${PROGRESS.MIN_SEC} в одном разделе.</p></div>`; srcWire(); return; }
      const a = Math.max(start, n - 1 - st.weeks), cut = S.slice(a), first = cut[0];
      const NOISE = noiseOf((last.nAns - first.nAns) / Math.max(1, (last.t - first.t) / 6048e5)), d = last.index - first.index, slope = cut.length > 1 ? (last.index - cut[Math.max(0, cut.length - 4)].index) / Math.min(3, cut.length - 1) : 0;
      const drv = PROGRESS.drivers(res, a, n - 1).slice(0, 6), mx = Math.max(1e-6, ...drv.map((x) => Math.abs(x.v)));
      box.innerHTML = `<div class="card pg"><div class="pg-top"><div><span class="label">Прогресс ученика · индекс</span>
          <p class="hint">Внутренняя аналитика по ответам с первой попытки и разметке подтем. Не балл SAT и не для публикации.</p></div>
          ${srcHTML()}
          <div class="chips" role="group" aria-label="Период">${[[4, "4 недели"], [8, "8 недель"], [99, "Всё время"]].map(([v, l]) => `<button class="chip" type="button" data-pw="${v}" aria-pressed="${st.weeks === v}">${l}</button>`).join("")}</div></div>
        <div class="pg-grid">
          <section class="pg-hero"><div class="pg-big">${last.index}</div><div class="pg-delta ${Math.abs(d) < NOISE ? "pg-noise" : d >= 0 ? "up" : "down"}">${d >= 0 ? "▲ +" : "▼ "}${d} <span>с ${day(first.t)}${Math.abs(d) < NOISE ? ` · в пределах шума (±${Math.round(NOISE)})` : ""}</span></div>
            <div class="pg-kv"><span>Скорость <b>${slope >= 0 ? "+" : ""}${slope.toFixed(1)}</b> в неделю</span><span>Ответов <b>${res.n}</b>, размечено <b>${res.tagged}</b></span></div>${start > 0 ? `<p class="hint">Недели до ${day(S[start].t)} не показаны: меньше ${PROGRESS.MIN_IX} ответов.</p>` : ""}
            <p class="hint">Собран из ${last.used} частей из 5${last.used < 5 ? ": для остальных пока мало данных" : ""}. Около 0 — ответы наугад, 100 — уверенное решение на экзаменационном уровне.</p></section>
          <section class="pg-chart"><b>Индекс по неделям</b><div id="pg-ix"></div></section></div>
        <div class="pg-parts">${PARTS.map(([k, l]) => { const v = cut.map((s) => s.parts[k]), now = last.parts[k], was = first.parts[k];
          return `<div class="pg-part" data-pp="${k}"><div class="l">${l}</div><div class="n">${now == null ? "—" : Math.round(now)}${now != null && was != null ? ` <small class="${now >= was ? "up" : "down"}">${now >= was ? "+" : ""}${Math.round(now - was)}</small>` : ""}</div><div class="w">${now == null ? "мало данных" : "вес " + String(PROGRESS.W[k]).replace(".", ",")}</div></div>`; }).join("")}</div>
        <div class="pg-grid2"><section><b>Откуда рост за период</b><p class="hint">Только изменения больше шума.</p><ul class="pg-drv">${drv.length ? drv.map((x) => `<li><div><span>${esc(NAME[x.k] || x.k)}</span><div class="pg-bar"><i style="width:${Math.abs(x.v) / mx * 100}%;background:${x.v >= 0 ? "#0F0F0F" : "#A63328"}"></i></div></div><b class="${x.v >= 0 ? "up" : "down"}">${x.v >= 0 ? "+" : ""}${x.v.toFixed(1)}</b></li>`).join("") : '<li class="hint">За период нет изменений больше шума. По 4–5 ответам в неделю на подтему рост виден через 3–4 недели.</li>'}</ul></section>
          <section><b>Сложность вопросов</b>${res.secs.length > 1 ? `<div class="chips">${res.secs.map((s) => `<button class="chip" type="button" data-ps="${s}" aria-pressed="${st.sec === s}">${s === "rw" ? "Reading and Writing" : "Math"}</button>`).join("")}</div>` : ""}
            <p class="hint">Ожидаемая доля верных ответов, угадывание учтено. Линия уровня появляется после ${PROGRESS.MIN_LV} ответов этого уровня.</p><div class="pg-legend"><span><i style="background:#2A7DB8"></i>Лёгкие</span><span><i style="background:#6E57C9"></i>Средние</span><span><i style="background:#B5402F"></i>Трудные</span></div><div id="pg-df"></div></section></div>
        <section class="pg-domain"><b>Домен</b><div class="chips" role="group" aria-label="Домен">${res.secs.flatMap((sec) => DOMN[sec].map((d, i) => `<button class="chip" type="button" data-pd="${sec}:${i}">${esc(d)}</button>`)).join("")}</div>
          <p class="hint">Жирная линия — домен в целом, тонкие — навыки College Board внутри него. Навык показан, когда по нему есть ответы; «хромает» — ниже домена на 5 пунктов и больше.</p><div class="pg-legend" id="pg-domleg"></div><div id="pg-dom"></div></section>
        <section><b>Карта подтем</b><p class="hint">Чёрная полоса — сейчас, красная метка — начало периода. Изменение серым — в пределах шума: по стольким ответам его нельзя отличить от случайности. Серая строка — меньше трёх ответов.</p>
          <div class="tw"><table class="dt pg-map"><thead><tr><th>Подтема</th><th style="width:26%">Мастерство</th><th class="num">Сейчас</th><th class="num">Изм.</th><th>По неделям</th><th class="num">Ответов</th><th>Статус</th>${o.onTwins ? "<th><span class=\"sr-only\">Gemini</span></th>" : ""}</tr></thead><tbody id="pg-rows"></tbody></table></div></section>
        <div class="pg-grid2"><section><b>Ловушки</b><p class="hint">Как часто выбирает ловушку, когда она есть: начало → сейчас. Меньше — лучше.</p><div id="pg-tr"></div></section>
          <section><b>Привычки</b><div id="pg-hb"></div></section></div></div>`;
      line(box.querySelector("#pg-ix"), { series: [{ v: cut.map((s) => s.index), color: "#0F0F0F", label: "Индекс", w: 2.5 }], times: cut.map((s) => s.t),
        marks: cut.map((s, i) => (res.mocks.some((t) => t <= s.t && t > (cut[i - 1] ? cut[i - 1].t : 0)) ? i : -1)).filter((i) => i >= 0) });
      const ds = cut.map((s) => s.diff[st.sec] || {});
      line(box.querySelector("#pg-df"), { series: [["E", "#2A7DB8", "Лёгкие"], ["M", "#6E57C9", "Средние"], ["H", "#B5402F", "Трудные"]].map(([k, c, l]) => ({ v: ds.map((x) => (x[k] == null ? null : x[k] * 100)), color: c, label: l })),
        times: cut.map((s) => s.t), fmt: (v) => Math.round(v) + "%", h: 240,
        note: (i) => { const c = (cut[i].cnt || {})[st.sec] || {}, f = [["E", "лёгкие"], ["M", "средние"], ["H", "трудные"]].filter(([k]) => c[k]).map(([k, l]) => `${l} ${c[k][0]}/${c[k][1]}`); return f.length ? `<br><span class="pg-tipn">Факт к этой дате: ${f.join(" · ")}</span>` : ""; } });
      box.querySelectorAll("[data-pp]").forEach((elx) => elx.appendChild(spark(cut.map((s) => (s.parts[elx.dataset.pp] == null ? null : s.parts[elx.dataset.pp] / 100)), "#0F0F0F", 140, 28)));
      const tb = box.querySelector("#pg-rows"), groups = PROGRESS.DOMAINS;
      res.secs.forEach((sec) => groups[sec].forEach(([, list], gi) => {
        const rows = res.subs.filter((x) => x.sec === sec && list.includes(x.k) && (x.n > 0));
        if (!rows.length) return;
        tb.insertAdjacentHTML("beforeend", `<tr><td class="pg-dom" colspan="${o.onTwins ? 8 : 7}">${esc(DOMN[sec][gi])}</td></tr>`);
        rows.forEach((x) => {
          const thin = x.n < 3, c = thin ? null : PROGRESS.change(res, x, a, n - 1), b0 = c ? c.from : n - 1, now = x.series[n - 1] ?? 0, was = x.series[b0] ?? now, ch = c ? c.ch : 0, sig = c && Math.abs(c.z) >= PROGRESS.ZMIN, late = !!c && b0 > a;   // change from the first reliable value; sig: above the noise
          const stt = thin ? ["thin", "мало данных"] : now >= 0.8 ? ["ok", "освоено"] : sig && ch > 0 ? ["grow", "растёт"] : sig && ch < 0 ? ["stuck", "просело"] : now < 0.45 ? ["stuck", "слабое место"] : ["", "держится"];
          const tr = document.createElement("tr"); if (thin) tr.className = "pg-thin";
          tr.innerHTML = `<td>${esc(NAME[x.k] || x.k)}</td><td><div class="pg-bar"><i style="width:${pct(now)}%"></i><em style="left:calc(${pct(was)}% - 1px)"></em></div></td><td class="num"><b>${x.series[n - 1] == null ? "—" : pct(now) + "%"}</b></td><td class="num ${!sig ? "pg-noise" : ch >= 0 ? "up" : "down"}"${late ? ` title="изменение с ${day(S[b0].t)}, когда появилось 3 ответа"` : ""}>${thin ? "—" : (ch >= 0 ? "+" : "") + pct(ch)}${late ? `<div class="hint">с ${day(S[b0].t)}</div>` : ""}</td><td class="sp"></td><td class="num">${x.n}</td><td><span class="pg-pill ${stt[0]}">${stt[1]}</span></td>${o.onTwins ? `<td><button class="pg-tw" type="button" data-twk="${x.k}" title="Похожие вопросы на ошибки этой подтемы">Похожие</button></td>` : ""}`;
          tr.querySelector(".sp").appendChild(spark(x.series.slice(a).map((v, j) => (a + j < b0 ? null : v)), thin ? "#D9D5CD" : "#0F0F0F"));
          tb.appendChild(tr);
        });
      }));
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
        line(box.querySelector("#pg-dom"), { series: [...(off("dom") ? [] : [{ v: cur.d.dom.slice(a).map((v) => (v == null ? null : v * 100)), color: "#0F0F0F", label: "Домен", w: 3.5 }]),
          ...sk.filter((x) => !off(x.skill)).map((x) => ({ v: x.series.slice(a).map((v) => (v == null ? null : v * 100)), color: x.color, label: x.skill, w: 1.6, nolabel: true }))],   // skill names are in the legend
          times: cut.map((q) => q.t), fmt: (v) => Math.round(v) + "%", h: 260 });
      }
      if (o.onTwins) { box.querySelectorAll("[data-twk]").forEach((b) => (b.onclick = () => o.onTwins({ focus: NAME[b.dataset.twk] || "" })));
        box.querySelectorAll("[data-twt]").forEach((b) => (b.onclick = () => o.onTwins({ trap: TRAP[b.dataset.twt] || "" }))); }
      box.querySelectorAll("[data-ps]").forEach((b) => (b.onclick = () => { st.sec = b.dataset.ps; draw(); }));
    };
    draw();
  }
  return { render, NAME, TRAP };
})();
