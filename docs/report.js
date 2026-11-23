/* «PDF-отчёт» (2026-11-23, Nurassyl: «allow me to create a PDF of the student's progress to send anyone interested in»).
   REPORT.open(d) shows an A4 report over the teacher page; «Сохранить PDF» calls the browser's print dialog (Save as PDF),
   so no library and no data leaves the browser. The teacher picks the sections and writes a comment and next steps.
   d: { name, rows: [{ t, what, a, b, pct, kind, est }], skills: [{ label, n, value }], strong: [names], weak: [names],
        shares: BBSHARE records, teacher } — numbers come from the student's own submissions only.
   Rules kept: practice-test numbers are labelled as estimates, never as official SAT results (hard rule 2); the internal
   progress index is printed with its plain meaning and «not an SAT score» (since 2026-11-23, Nurassyl's request); the report
   says it is confidential. */
window.REPORT = (() => {
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const dLong = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const dShort = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }).replace(/\s?г\.?$/, "");
  const P = (x) => (x == null || isNaN(x) ? "—" : Math.round(x) + "%");
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const SECTIONS = [["sum", "Главное", true], ["index", "Индекс прогресса", true], ["pred", "Ориентир на SAT", true], ["trend", "Динамика по неделям", true], ["skills", "Навыки", true], ["focus", "Сильные стороны и что подтянуть", true],
    ["mocks", "Пробные тесты на сайте", true], ["bb", "Официальные пробники Bluebook", true], ["recent", "Последние работы", true], ["note", "Комментарий преподавателя", true]];
  const HEX = '<svg viewBox="0 0 48 52" width="34" height="37" aria-hidden="true"><path d="M24 2 45 14v24L24 50 3 38V14z" fill="none" stroke="#0F0F0F" stroke-width="1.4"/><text x="24" y="31" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="15" fill="#0F0F0F">NK</text></svg>';

  // weekly first-try accuracy of homework, as an SVG line (one series, ink; red only for the last point)
  function trendSVG(rows) {
    const hw = rows.filter((r) => r.kind === "hw" && r.pct != null), wk = new Map();
    for (const r of hw) { const d = new Date(r.t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); const k = +d; if (!wk.has(k)) wk.set(k, []); wk.get(k).push(r.pct); }
    const pts = [...wk].sort((a, b) => a[0] - b[0]).map(([t, v]) => [t, mean(v), v.length]);
    if (pts.length < 2) return '<p class="rp-hint">Нужно больше двух недель с домашними заданиями, чтобы показать динамику.</p>';
    const W = 640, H = 180, L = 36, R = 34, T = 24, B = 26, x = (i) => L + (W - L - R) * i / (pts.length - 1), y = (v) => T + (H - T - B) * (1 - v / 100);
    const grid = [0, 50, 100].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#D9D5CD"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#5E5A54">${v}%</text>`).join("");
    const path = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`).join("");
    const labels = pts.map((p, i) => (i % Math.ceil(pts.length / 6) === 0 || i === pts.length - 1 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="#5E5A54">${esc(dShort(p[0]))}</text>` : "")).join("");
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" class="rp-chart" role="img" aria-label="Точность домашних заданий по неделям">${grid}<path d="${path}" fill="none" stroke="#0F0F0F" stroke-width="2"/>${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p[1])}" r="${i === pts.length - 1 ? 4 : 2.5}" fill="${i === pts.length - 1 ? "#A63328" : "#0F0F0F"}"/>`).join("")}${labels}
      <text x="${x(pts.length - 1) - 6}" y="${y(last[1]) - 8}" text-anchor="end" font-size="11" font-weight="600" fill="#0F0F0F">${P(last[1])}</text></svg>
      <p class="rp-hint">Доля вопросов домашних заданий, решённых с первой попытки, в среднем за неделю. Точек: ${pts.length}.</p>`;
  }

  const NM = { rw: "Reading and Writing", math: "Math" };
  const rng = (x) => `${x.lo}–${x.hi}`;
  // the weekly progress index: a number 0–100 with its change, a line and the five parts, explained in plain words
  const PARTS = [["M", "Мастерство", "решает подтемы с учётом сложности"], ["X", "Перенос на экзамен", "результаты в полных пробниках"], ["R", "Удержание", "помнит решённое неделями позже"], ["P", "Темп", "укладывается во время"], ["C", "Исправление", "исправляет ошибки со второй попытки"]];
  function indexSVG(w) {
    if (w.length < 2) return "";
    const W = 640, H = 120, L = 30, R = 50, T = 16, B = 24, x = (i) => L + (W - L - R) * i / (w.length - 1), y = (v) => T + (H - T - B) * (1 - v / 100);
    const grid = [0, 50, 100].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#D9D5CD"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#5E5A54">${v}</text>`).join("");
    const path = w.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`).join(""), step = Math.ceil(w.length / 6);
    const labels = w.map((p, i) => (i % step === 0 || i === w.length - 1 ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#5E5A54">${esc(dShort(p[0]))}</text>` : "")).join("");
    const last = w[w.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" class="rp-chart" role="img" aria-label="Индекс прогресса по неделям">${grid}<path d="${path}" fill="none" stroke="#0F0F0F" stroke-width="2"/><circle cx="${x(w.length - 1)}" cy="${y(last[1])}" r="4" fill="#A63328"/>${labels}<text x="${x(w.length - 1) + 8}" y="${y(last[1]) + 4}" font-size="11" font-weight="600" fill="#0F0F0F">${last[1]}</text></svg>`;
  }
  // three windows, as in the card (Nurassyl, 2026-11-23: «three graphs for the last 4 weeks, 8 weeks and all time»)
  function indexCharts(ix) {
    const last = ix.weeks[ix.weeks.length - 1][0], WEEK = 6048e5;
    return [["Последние 4 недели", 4], ["Последние 8 недель", 8], ["Всё время", 0]].map(([title, n]) => {
      const w = n ? ix.weeks.filter(([t]) => t >= last - n * WEEK) : ix.weeks;
      if (w.length < 2) return `<div class="rp-ixw"><h3>${title}</h3><p class="rp-hint">Пока одна точка: ${w.length ? w[0][1] : "—"}. Линия появится через неделю.</p></div>`;
      const d = w[w.length - 1][1] - w[0][1];
      return `<div class="rp-ixw"><h3>${title} <span class="rp-hint">${d >= 0 ? "+" : "−"}${Math.abs(d)} с ${esc(dShort(w[0][0]))} · было ${w[0][1]}, сейчас ${w[w.length - 1][1]}</span></h3>${indexSVG(w)}</div>`;
    }).join("");
  }
  function indexHTML(ix) {
    if (!ix || ix.thin) return `<p>Индекс пока не рассчитан: для него нужно около ${ix ? ix.need : 30} ответов с первой попытки в размеченных заданиях, сейчас ${ix ? ix.nAns : 0}. Он появится в следующих отчётах по мере выполнения домашних заданий и пробных тестов.</p><p class="rp-hint">Индекс nurzycom от 0 до 100 — внутренняя мера прогресса, а не балл SAT.</p>`;
    const d = ix.now - ix.first;
    return `<div class="rp-pred"><div class="rp-pred-big">${ix.now}<small style="font-size:14px;font-weight:500"> из 100</small></div><div>${ix.weeks.length > 1 ? `<b>${d >= 0 ? "+" : "−"}${Math.abs(d)}</b> с ${esc(dShort(ix.from))} (было ${ix.first})` : `на ${esc(dShort(ix.at))}`} · ответов в расчёте: ${ix.nAns}</div></div>
      ${indexCharts(ix)}
      <table class="rp-t"><thead><tr><th>Часть индекса</th><th>Что показывает</th><th class="n">Сейчас</th></tr></thead><tbody>${PARTS.map(([k, l, what]) => { const v = ix.parts[k], v0 = ix.parts0[k];
        return `<tr><td>${l}</td><td>${what}</td><td class="n">${v == null ? "мало данных" : Math.round(v) + (v0 != null && ix.weeks.length > 1 ? ` <span class="rp-hint">(${Math.round(v - v0) >= 0 ? "+" : "−"}${Math.abs(Math.round(v - v0))})</span>` : "")}</td></tr>`; }).join("")}</tbody></table>
      <p class="rp-hint">Индекс nurzycom от 0 до 100 по всем ответам ученика с первой попытки с учётом сложности вопросов: около 0 — ответы наугад, 100 — уверенное решение на уровне экзамена. Это внутренняя мера прогресса, а не балл SAT.</p>`;
  }
  // a range, never one number; always with what it rests on and that it is not an official score and not a promise (hard rules 2, 6)
  function predHTML(p) {
    if (!p || !p.est || !Object.keys(p.est.sections).length) return "";
    const E = p.est, S = E.sections;
    return `<div class="rp-pred">${E.total ? `<div class="rp-pred-big">${rng(E.total)}</div>` : ""}
      <div>${Object.entries(S).map(([k, x]) => `<div><b>${NM[k]}</b> ${rng(x)} <span class="rp-hint">· ${x.n} ${x.n === 1 ? "тест" : x.n < 5 ? "теста" : "тестов"}, последний ${esc(dShort(x.last))}${x.weak ? " · мало свежих данных" : ""}</span></div>`).join("")}</div></div>
      <p class="rp-hint">Примерный диапазон по ${p.n} полным пробным тестам (${p.bb} в Bluebook, ${p.n - p.bb} на сайте nurzycom); свежие тесты весят больше. Это оценка преподавателя, а не официальный балл College Board и не обещание результата.</p>`;
  }
  // «Главное»: 3–5 plain sentences a student, a parent and a manager read in half a minute
  function main(d, rows, hw, weak, on) {
    const out = [], now = Date.now(), D = 864e5;
    if (rows.length) { const d30 = rows.filter((r) => r.t > now - 30 * D).length;
      out.push(`<b>Активность.</b> Всего сдано ${rows.length} ${rows.length % 10 === 1 && rows.length % 100 !== 11 ? "работа" : [2, 3, 4].includes(rows.length % 10) && ![12, 13, 14].includes(rows.length % 100) ? "работы" : "работ"}, за последние 30 дней ${d30}.${d30 === 0 ? " Последний месяц без сданных работ." : ""}`); }
    const pts = hw.filter((r) => r.pct != null);
    if (pts.length >= 4) { const k = Math.max(2, Math.floor(pts.length / 3)), a = mean(pts.slice(0, k).map((r) => r.pct)), b = mean(pts.slice(-k).map((r) => r.pct)), dd = Math.round(b - a);
      out.push(`<b>Точность.</b> Домашние задания с первой попытки: ${P(a)} в начале, ${P(b)} в последних работах (${dd >= 0 ? "+" : "−"}${Math.abs(dd)} п.).`); }
    else if (pts.length) out.push(`<b>Точность.</b> Домашние задания с первой попытки: ${P(mean(pts.map((r) => r.pct)))}.`);
    if (on.index && d.index && !d.index.thin) { const dd = d.index.now - d.index.first;
      out.push(`<b>Индекс прогресса.</b> ${d.index.now} из 100${d.index.weeks.length > 1 ? `, ${dd >= 0 ? "+" : "−"}${Math.abs(dd)} с ${esc(dShort(d.index.from))}` : ""} (внутренняя мера nurzycom, не балл SAT).`); }
    if (on.pred && d.pred && d.pred.est && Object.keys(d.pred.est.sections).length) { const E = d.pred.est;
      out.push(`<b>Ориентир на SAT.</b> ${E.total ? rng(E.total) : Object.entries(E.sections).map(([k, x]) => `${NM[k]} ${rng(x)}`).join(", ")} по полным пробным тестам; это оценка, не официальный балл.`); }
    if (d.strong.length) out.push(`<b>Получается.</b> ${esc(d.strong.slice(0, 3).join("; "))}.`);
    if (weak.length) out.push(`<b>В работе.</b> ${esc(weak.slice(0, 3).join("; "))}.`);
    return out.map((x) => `<li>${x}</li>`).join("");
  }

  let cell = () => "—";
  function sheet(d, on, note, next) {
    const rows = d.rows.slice().sort((a, b) => a.t - b.t), hw = rows.filter((r) => r.kind === "hw");
    const first = rows[0], last = rows[rows.length - 1], days30 = new Set(rows.filter((r) => r.t > Date.now() - 30 * 864e5).map((r) => new Date(r.t).toDateString())).size;
    const lessons = new Set(hw.map((r) => r.lesson)).size, mocks = rows.filter((r) => r.kind === "mock");
    const kpi = (v, l) => `<div class="rp-kpi"><b>${esc(v)}</b><span>${esc(l)}</span></div>`;
    const sec = (id, title, body) => (on[id] && body ? `<section class="rp-sec"><h2>${title}</h2>${body}</section>` : "");
    const sk = d.skills.filter((x) => x.n >= 3);
    // «Над чем работаем»: weak subtopics from the analysis, else homework skills under 70% with 5+ questions
    const weak = d.weak.length ? d.weak : d.skills.filter((x) => x.n >= 5 && x.value < 70).sort((a, b) => a.value - b.value).slice(0, 3).map((x) => `${x.label} (${P(x.value)} с первой попытки)`);
    return `<header class="rp-head">${HEX}<div><div class="rp-brand">nurzycom · подготовка к SAT</div><h1>Отчёт об учёбе: ${esc(d.name)}</h1>
        <div class="rp-meta">${first ? `Период: ${esc(dLong(first.t))} — ${esc(dLong(last.t))}` : "Работ пока нет"} · составлен ${esc(dLong(Date.now()))}</div></div></header>
      ${sec("sum", "Главное", `<ul class="rp-main">${main(d, rows, hw, weak, on)}</ul><div class="rp-kpis">${kpi(rows.length, "работ сдано")}${kpi(lessons, "уроков с домашним заданием")}${kpi(P(mean(hw.map((r) => r.pct))), "домашних заданий с первой попытки")}${kpi(days30, "дней с работами за 30 дней")}</div>`)}
      ${sec("index", "Индекс прогресса", indexHTML(d.index))}
      ${sec("pred", "Ориентир на SAT", predHTML(d.pred))}
      ${sec("trend", "Динамика по неделям", hw.length ? trendSVG(rows) : "")}
      ${sec("skills", "Навыки", sk.length ? `<table class="rp-t"><thead><tr><th>Навык College Board</th><th class="n">Вопросов</th><th>С первой попытки</th></tr></thead><tbody>${sk.slice().sort((a, b) => b.value - a.value).map((x) =>
        `<tr><td>${esc(x.label)}</td><td class="n">${x.n}</td><td><span class="rp-meter"><i style="width:${Math.round(x.value)}%"></i></span> ${P(x.value)}</td></tr>`).join("")}</tbody></table><p class="rp-hint">Навыки с тремя и более вопросами в домашних заданиях.</p>` : "")}
      ${sec("focus", "Сильные стороны и что подтянуть", d.strong.length || weak.length ? `<div class="rp-two"><div><h3>Получается хорошо</h3>${d.strong.length ? `<ul>${d.strong.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : '<p class="rp-hint">Пока мало данных.</p>'}</div>
        <div><h3>Над чем работаем</h3>${weak.length ? `<ul>${weak.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : '<p class="rp-hint">Явных слабых мест нет.</p>'}</div></div><p class="rp-hint">По разбору всех ответов ученика с учётом сложности вопросов.</p>` : "")}
      ${sec("mocks", "Пробные тесты на сайте", mocks.length ? `<table class="rp-t"><thead><tr><th>Дата</th><th>Тест и раздел</th><th class="n">Верно</th><th class="n">Примерный балл</th></tr></thead><tbody>${mocks.slice().reverse().map((r) =>
        `<tr><td>${esc(dShort(r.t))}</td><td>${esc(r.what)}</td><td class="n">${r.a}/${r.b}</td><td class="n">${r.est ? "≈ " + esc(r.est) : "—"}</td></tr>`).join("")}</tbody></table><p class="rp-hint">Примерный балл считается по шкале nurzycom (±40) и не является официальным результатом SAT.</p>` : "")}
      ${(() => { cell = (x) => (!x ? "—" : x.skip && x.skip[0] && x.skip[1] ? "не решался" : `${x.tot[0] + x.tot[1]}/${x.n}`); return ""; })()}
      ${sec("bb", "Официальные пробники Bluebook", d.shares.length ? `<table class="rp-t"><thead><tr><th>Дата</th><th>Тест</th><th class="n">Reading and Writing</th><th class="n">Math</th></tr></thead><tbody>${d.shares.map((s) => { const rw = s.sections.rw, m = s.sections.math;
        return `<tr><td>${esc(dShort(s.taken || s.at))}</td><td>${esc((rw && rw.label) || (m && m.label) || s.title || "Bluebook")}</td><td class="n">${cell(rw)}</td><td class="n">${cell(m)}</td></tr>`; }).join("")}</tbody></table>
        <p class="rp-hint">Число верных ответов из таблицы College Board My Practice, которую прислал ученик. Официальный балл смотрите в самом Bluebook.</p>` : "")}
      ${sec("recent", "Последние работы", rows.length ? `<table class="rp-t"><thead><tr><th>Дата</th><th>Работа</th><th class="n">Результат</th></tr></thead><tbody>${rows.slice(-10).reverse().map((r) =>
        `<tr><td>${esc(dShort(r.t))}</td><td>${esc(r.what)}</td><td class="n">${r.a}/${r.b}</td></tr>`).join("")}</tbody></table>` : "")}
      ${sec("note", "Комментарий преподавателя", note.trim() || next.trim() ? `${note.trim() ? `<blockquote>${esc(note.trim()).replace(/\n/g, "<br>")}</blockquote>` : ""}${next.trim() ? `<h3>Следующие шаги</h3><p>${esc(next.trim()).replace(/\n/g, "<br>")}</p>` : ""}` : "")}
      <footer class="rp-foot"><div><b>${esc(d.teacher || "Нурасыл Кунанбаев")}</b> · преподаватель SAT · SAT 1560 · IELTS 8.0 · Nazarbayev University</div>
        <div>Telegram @nurzycom · WhatsApp +7 705 421 1262</div><div class="rp-conf">Конфиденциально: данные из работ ученика на study.bynurzy.com, для ученика, родителей и тех, кому ученик согласен показать.</div></footer>`;
  }

  function open(d) {
    close();
    const st = { on: Object.fromEntries(SECTIONS.map(([k, , v]) => [k, v])), note: "", next: "" };
    const wk = d.weak.length ? d.weak : d.skills.filter((x) => x.n >= 5 && x.value < 70).sort((a, b) => a.value - b.value).slice(0, 3).map((x) => x.label);
    if (wk.length) st.next = `Работаем над: ${wk.slice(0, 3).join(", ")}.`;
    const box = document.createElement("div"); box.id = "rp"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "PDF-отчёт об учёбе");
    document.body.appendChild(box); document.body.classList.add("rp-on");
    const draw = () => {
      box.innerHTML = `<div class="rp-bar"><div class="rp-bar-in"><b>PDF-отчёт · ${esc(d.name)}</b>
          <div class="rp-opts">${SECTIONS.map(([k, l]) => `<label><input type="checkbox" data-rps="${k}"${st.on[k] ? " checked" : ""}> ${l}</label>`).join("")}</div>
          <label class="rp-ta">Комментарий для родителей<textarea id="rp-note" rows="2" maxlength="900" placeholder="Например: Айбике стала увереннее в грамматике, теперь главное — время на втором модуле.">${esc(st.note)}</textarea></label>
          <label class="rp-ta">Следующие шаги<textarea id="rp-next" rows="2" maxlength="600">${esc(st.next)}</textarea></label>
          <p class="hint">В отчёте имя и результаты ученика. Отправляйте ученику, родителям или тем, кому ученик согласен показать. Внутренний индекс прогресса в отчёт не входит.</p>
          <div class="row"><button class="btn" type="button" id="rp-print">Сохранить PDF</button><button class="btn ghost" type="button" id="rp-close">Закрыть</button></div>
          <p class="hint">В окне печати выберите «Сохранить как PDF» (Save as PDF).</p></div></div>
        <div class="rp-paper"><article class="rp-sheet" id="rp-sheet">${sheet(d, st.on, st.note, st.next)}</article></div>`;
      box.querySelectorAll("[data-rps]").forEach((c) => (c.onchange = () => { st.on[c.dataset.rps] = c.checked; refresh(); }));
      box.querySelector("#rp-note").oninput = (e) => { st.note = e.target.value; refresh(); };
      box.querySelector("#rp-next").oninput = (e) => { st.next = e.target.value; refresh(); };
      box.querySelector("#rp-print").onclick = () => { const t = document.title; document.title = `Отчёт ${d.name} ${new Date().toISOString().slice(0, 10)}`; window.print(); document.title = t; };
      box.querySelector("#rp-close").onclick = close;
    };
    const refresh = () => { const s = box.querySelector("#rp-sheet"); if (s) s.innerHTML = sheet(d, st.on, st.note, st.next); };
    draw(); box.querySelector("#rp-print").focus();
    document.addEventListener("keydown", esc_);
  }
  function esc_(e) { if (e.key === "Escape" && document.getElementById("rp")) close(); }
  function close() { const b = document.getElementById("rp"); if (b) b.remove(); document.body.classList.remove("rp-on"); document.removeEventListener("keydown", esc_); }
  return { open, close, sheet };
})();
