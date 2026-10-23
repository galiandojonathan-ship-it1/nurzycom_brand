// Teacher dashboard: reads the Google Form responses (CSV file or a published CSV link) in the browser and summarises them.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
  const D = { lessons: [], sets: [], texts: [], rows: [], students: [], demo: false, view: "overview", student: null, lesson: null, sort: null };
  const DAY = 864e5;

  // ---------- CSV
  function parseCSV(text) {
    const rows = []; let row = [], f = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
      else f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim()));
  }
  // Columns by header name; if renamed, by what the values look like.
  const NAMES = { ts: /^(timestamp|отметка времени|время отправки)/i, student: /^(student|ученик|имя)/i, lesson: /^(lesson|урок)/i, part: /^(part|часть)/i,
    answers: /^(answers|ответы)/i, score: /^(score|счёт|счет|результат)/i, wrong: /^(wrong|ошибки)/i, seconds: /^(seconds|секунды|время)$/i, attempt: /^(attempt|попытка)/i };
  function columns(head, body) {
    const col = {};
    Object.entries(NAMES).forEach(([k, re]) => { const i = head.findIndex((h) => re.test(h.trim())); if (i >= 0) col[k] = i; });
    const sample = body.slice(0, 50), used = new Set(Object.values(col));
    const guess = (k, test) => { if (col[k] !== undefined) return; for (let i = 0; i < head.length; i++) if (!used.has(i) && sample.length && sample.filter((r) => test(r[i] || "")).length >= sample.length * 0.8) { col[k] = i; used.add(i); return; } };
    guess("ts", (v) => /\d{1,4}[./-]\d{1,2}[./-]\d{2,4}/.test(v)); guess("lesson", (v) => /^[VMXT]\d\d$/.test(v.trim())); guess("score", (v) => /^\d+\/\d+$/.test(v.trim()));
    guess("answers", (v) => /^\d+:/.test(v.trim())); guess("part", (v) => /·|^p\d/.test(v)); guess("attempt", (v) => /^\d{1,2}$/.test(v.trim()));
    guess("seconds", (v) => /^\d+$/.test(v.trim())); guess("wrong", (v) => /^[\d,]*$/.test(v.trim())); guess("student", (v) => v.trim().length > 1);
    return col;
  }
  function parseDate(s) {
    s = (s || "").trim(); let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T]?(\d{1,2})?:?(\d{2})?:?(\d{2})?/))) return new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    if ((m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4}),?\s*(\d{1,2})?:?(\d{2})?:?(\d{2})?/))) return new Date(+m[3], m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2})?:?(\d{2})?:?(\d{2})?\s*(AM|PM)?/i))) {
      let h = +(m[4] || 0); if (m[7] && /pm/i.test(m[7]) && h < 12) h += 12; if (m[7] && /am/i.test(m[7]) && h === 12) h = 0;
      return new Date(+m[3], m[1] - 1, +m[2], h, +(m[5] || 0), +(m[6] || 0));   // Google Sheets in English: month/day/year
    }
    const d = new Date(s); return isNaN(d) ? null : d;
  }
  const norm = (n) => n.toLowerCase().replace(/ё/g, "е").replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();

  function load(text, label) {
    const all = parseCSV(text.replace(/^﻿/, ""));
    if (all.length < 2) throw new Error("В файле нет ответов.");
    const head = all[0], body = all.slice(1), c = columns(head, body);
    if (c.student === undefined || c.lesson === undefined || c.score === undefined) throw new Error("Не нашёл столбцы Student, Lesson и Score. Это точно таблица ответов формы?");
    const rows = [];
    body.forEach((r) => {
      const g = (k) => (c[k] === undefined ? "" : (r[c[k]] || "").trim());
      const lesson = g("lesson").toUpperCase(), sc = g("score").match(/^(\d+)\/(\d+)$/);
      if (!/^[VMXT]\d\d$/.test(lesson) || !sc) return;
      const part = g("part"), pid = (part.match(/^p\d+/) || [""])[0];
      const answers = g("answers").split(/\s+/).filter(Boolean).map((t) => { const [n, v = "-"] = t.split(":"); return { n: Number(n), tries: v === "-" ? [] : v.split(">") }; });
      const s2 = part.match(/2-я: (\d+)\/(\d+)/);   // on-screen parts also report the score after the second attempt
      rows.push({ ts: parseDate(g("ts")), name: g("student"), key: norm(g("student")), lesson, kind: lesson[0], part, pid, screen: /экран/.test(part), second: s2 ? (100 * +s2[1]) / +s2[2] : null,
        a: +sc[1], b: +sc[2], pct: +sc[2] ? (100 * +sc[1]) / +sc[2] : 0, wrong: g("wrong").split(",").map(Number).filter((x) => x), sec: Number(g("seconds")) || 0,
        attempt: Number(g("attempt")) || 1, answers });
    });
    if (!rows.length) throw new Error("Строки есть, но ни одна не похожа на результат с сайта.");
    rows.sort((x, y) => (x.ts || 0) - (y.ts || 0));
    D.rows = rows; D.label = label;
    const by = {}; rows.forEach((r) => { (by[r.key] = by[r.key] || { key: r.key, rows: [] }).rows.push(r); });
    const usual = (rs) => { const c = {}; rs.forEach((r) => (c[r.name] = (c[r.name] || 0) + 1)); return Object.keys(c).sort((x, y) => c[y] - c[x])[0]; };   // most frequent spelling
    D.students = Object.values(by).map((s) => Object.assign(s, { name: usual(s.rows), last: s.rows[s.rows.length - 1].ts })).sort((a, b) => a.name.localeCompare(b.name, "ru"));
    $("dash").classList.remove("hidden"); $("src-msg").textContent = ""; sources(false);
    render();
  }

  // ---------- helpers over the data
  const lessonOf = (tag) => D.lessons.find((l) => l.tag === tag);
  const partOf = (tag, pid) => { const l = lessonOf(tag); return l && l.parts.find((p) => p.id === pid); };
  const pct = (x) => (x === null || x === undefined || isNaN(x) ? "—" : `${Math.round(x)}%`);
  const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
  const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const when = (d) => (d ? d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) + ", " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "—");
  const ago = (d) => { if (!d) return "—"; const n = Math.floor((Date.now() - d) / DAY); return n <= 0 ? "сегодня" : n === 1 ? "вчера" : `${n} дн. назад`; };
  const whatOf = (r) => {
    if (r.kind === "X") { const s = D.sets.find((x) => x.id === r.lesson); return `Сложные вопросы · ${s ? s.title : r.lesson}`; }
    if (r.kind === "T") { const t = D.texts.find((x) => x.id === r.lesson); return `Текст · ${t ? t.title : r.lesson}`; }
    const p = partOf(r.lesson, r.pid); return `${r.lesson} · ${p ? p.title : r.part}`;
  };
  const best = (rows) => rows.reduce((m, r) => (m === null || r.pct > m.pct ? r : m), null);
  // per-question first-try misses, with the skill of each question from lessons.json
  function skillStats(rows) {
    const sk = {};
    rows.forEach((r) => {
      if (!"VM".includes(r.kind)) return;
      const p = partOf(r.lesson, r.pid); if (!p) return;
      const wrong = new Set(r.wrong);
      p.q.forEach((q) => { if (!q.sk) return; const s = (sk[q.sk] = sk[q.sk] || { n: 0, ok: 0 }); s.n++; if (!wrong.has(q.n)) s.ok++; });
    });
    return Object.entries(sk).map(([k, v]) => ({ label: k, n: v.n, value: (100 * v.ok) / v.n })).sort((a, b) => a.value - b.value);
  }
  const shade = (v) => (v === null ? null : v >= 90 ? ["#0A0A0A", "#FAF8F3"] : v >= 75 ? ["#3A3936", "#FAF8F3"] : v >= 60 ? ["#7A7872", "#FAF8F3"] : v >= 40 ? ["#BDBBB5", "#0A0A0A"] : ["#E2E0DA", "#0A0A0A"]);

  // ---------- charts (single series, black and white)
  const tip = $("tip");
  function showTip(e, html) { tip.innerHTML = html; tip.classList.remove("hidden"); const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8); tip.style.left = x + "px"; tip.style.top = e.clientY + 14 + "px"; }
  const hideTip = () => tip.classList.add("hidden");
  function columns_(el, data, unit) {
    const W = Math.max(320, el.clientWidth - 28), H = 180, pad = { l: 28, b: 22, t: 10 }, n = data.length;
    const max = Math.max(1, ...data.map((d) => d.value)), top = max <= 5 ? max : Math.ceil(max / 5) * 5;
    const step = (W - pad.l) / n, bw = Math.min(24, step - 2), y = (v) => H - pad.b - ((H - pad.b - pad.t) * v) / top;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(unit)}">`;
    [0, top / 2, top].forEach((t) => { s += `<line x1="${pad.l}" x2="${W}" y1="${y(t)}" y2="${y(t)}" stroke="#E2E0DA" stroke-width="1"/><text x="${pad.l - 6}" y="${y(t) + 4}" text-anchor="end" font-family="IBM Plex Mono" font-size="10" fill="#5A5852">${Math.round(t)}</text>`; });
    data.forEach((d, i) => {
      const x = pad.l + i * step + (step - bw) / 2, h = H - pad.b - y(d.value), r = Math.min(4, h);
      if (d.value > 0) s += `<path d="M${x},${H - pad.b} V${y(d.value) + r} q0,-${r} ${r},-${r} H${x + bw - r} q${r},0 ${r},${r} V${H - pad.b} Z" fill="#0A0A0A"/>`;
      s += `<rect class="hit" data-i="${i}" x="${pad.l + i * step}" y="${pad.t}" width="${step}" height="${H - pad.t}" fill="transparent"/>`;
      if (d.tick) s += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" fill="#5A5852">${esc(d.tick)}</text>`;
    });
    el.innerHTML = s + "</svg>";
    el.querySelectorAll(".hit").forEach((h) => { h.onmousemove = (e) => showTip(e, data[h.dataset.i].tip); h.onmouseleave = hideTip; });
  }
  function hbars(el, data) {
    if (!data.length) { el.innerHTML = '<p class="hint">Пока мало данных.</p>'; return; }
    el.innerHTML = `<div class="hbars">${data.map((d) => `<div class="hb"><span>${esc(d.label)}</span><div class="hbar"><i style="width:${Math.max(0.5, d.value) * 0.82}%"></i><span style="left:calc(${Math.max(0.5, d.value) * 0.82}% + 8px)">${pct(d.value)} · ${d.n}</span></div></div>`).join("")}</div>`;
  }
  function heat(rowsOf, lessons) {
    // rows: lessons; cells: their parts in order; value = best first-try % (tooltip names the part)
    const maxp = Math.max(...lessons.map((l) => l.parts.length));
    let s = `<div class="tw"><table class="heat"><tr><th></th>${Array.from({ length: maxp }, (_, i) => `<th>${i + 1}</th>`).join("")}</tr>`;
    lessons.forEach((l) => {
      s += `<tr><th>${l.tag} · ${esc(l.title.split(" · ").pop())}</th>`;
      for (let i = 0; i < maxp; i++) {
        const p = l.parts[i]; if (!p) { s += "<td style=\"background:transparent\"></td>"; continue; }
        const rs = rowsOf(l.tag, p.id), b = best(rs), c = shade(b ? b.pct : null);
        const t = `<b>${l.tag} · ${esc(p.title)}</b><br>${b ? `Лучший результат: ${b.a}/${b.b} (${pct(b.pct)})<br>Сдач: ${rs.length}${b.screen ? " · на экране" : ""}` : "Не сдано"}`;
        s += `<td data-tip="${esc(t)}"${c ? ` style="background:${c[0]};color:${c[1]}"` : ""}>${b ? Math.round(b.pct) : "·"}</td>`;
      }
      s += "</tr>";
    });
    return s + "</table></div>";
  }
  function bindTips(root) { root.querySelectorAll("[data-tip]").forEach((el) => { el.onmousemove = (e) => showTip(e, el.dataset.tip); el.onmouseleave = hideTip; }); }
  const kpis = (items) => `<div class="kpis">${items.map(([l, v, s]) => `<div class="kpi"><span class="label">${l}</span><div class="v">${v}</div>${s ? `<small>${s}</small>` : ""}</div>`).join("")}</div>`;
  function table(cols, rows, opts = {}) {
    return `<div class="tw"><table class="t"><thead><tr>${cols.map((c, i) => `<th data-c="${i}">${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr${opts.click ? ` class="click" data-k="${esc(r.k)}"` : ""}>${r.cells.map((c, i) => `<td${opts.num && opts.num.includes(i) ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  // ---------- views
  function render() {
    $("st-line").innerHTML = `${D.demo ? '<span class="demo-flag">Демо · вымышленные данные</span> ' : ""}${D.rows.length} записей · ${D.students.length} учеников · ${esc(D.label || "")}`;
    $("tabs").querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === D.view)));
    ["overview", "students", "lessons", "missing", "log"].forEach((v) => $("v-" + v).classList.toggle("hidden", v !== D.view));
    ({ overview, students, lessons, missing, log })[D.view]();
    bindTips(document);
  }
  function overview() {
    const now = Date.now(), wk = D.rows.filter((r) => r.ts && now - r.ts < 7 * DAY), m30 = D.rows.filter((r) => r.ts && now - r.ts < 30 * DAY);
    const hw30 = m30.filter((r) => "VM".includes(r.kind));
    const per = hw30.filter((r) => r.sec > 0 && r.b).map((r) => r.sec / r.b);
    let html = kpis([["Активны за 7 дней", new Set(wk.map((r) => r.key)).size, `из ${D.students.length} учеников`], ["Сдач за 7 дней", wk.length, `${m30.length} за 30 дней`],
      ["С первой попытки", pct(mean(hw30.map((r) => r.pct))), "средний результат ДЗ за 30 дней"], ["Время на вопрос", per.length ? `${Math.round(median(per))} с` : "—", "медиана за 30 дней; на SAT ≈71 с (Verbal), 95 с (Math)"]]);
    html += `<h2>Активность</h2><p class="hint">Сдачи по дням за последние 30 дней.</p><div class="chart" id="ch-act"></div>`;
    const recent = [...D.rows].reverse().slice(0, 12);
    html += `<h2>Последние сдачи</h2>` + table(["Когда", "Ученик", "Что", "Результат", "Время"], recent.map((r) => ({ k: r.key, cells: [when(r.ts), esc(r.name), esc(whatOf(r)) + (r.screen ? '<span class="pill">экран</span>' : ""), `${r.a}/${r.b} · ${pct(r.pct)}`, r.sec ? `${Math.round(r.sec / 60)} мин` : "—"] })), { click: true, num: [3, 4] });
    html += `<h2>Что повторить</h2><p class="hint">Навыки с самым низким результатом с первой попытки у всех учеников (ДЗ, последние 30 дней).</p><div id="ch-sk"></div>`;
    $("v-overview").innerHTML = html;
    const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(now - (29 - i) * DAY); d.setHours(0, 0, 0, 0); return d; });
    const data = days.map((d, i) => { const rs = D.rows.filter((r) => r.ts && r.ts >= d && r.ts < new Date(+d + DAY)); return { value: rs.length, tick: i % 5 === 4 ? d.toLocaleDateString("ru-RU", { day: "numeric", month: "numeric" }) : "",
      tip: `<b>${d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</b><br>Сдач: ${rs.length}${rs.length ? "<br>" + [...new Set(rs.map((r) => esc(r.name)))].join(", ") : ""}` }; });
    columns_($("ch-act"), data, "Сдачи по дням");
    hbars($("ch-sk"), skillStats(hw30).filter((s) => s.n >= 3).slice(0, 8));
    clickStudents($("v-overview"));
  }
  function clickStudents(root) { root.querySelectorAll("tr.click").forEach((tr) => (tr.onclick = () => { D.view = "students"; D.student = tr.dataset.k; render(); })); }
  function students() {
    if (D.student) return studentDetail(D.students.find((s) => s.key === D.student));
    const V = D.lessons.filter((l) => l.tag[0] === "V"), M = D.lessons.filter((l) => l.tag[0] === "M");
    const total = (ls) => ls.reduce((s, l) => s + l.parts.length, 0);
    const done = (s, ls) => ls.reduce((n, l) => n + l.parts.filter((p) => s.rows.some((r) => r.lesson === l.tag && r.pid === p.id)).length, 0);
    const rows = D.students.map((s) => { const hw = s.rows.filter((r) => "VM".includes(r.kind)), sk = skillStats(hw).filter((x) => x.n >= 3)[0];
      return { k: s.key, sortv: [s.name, -(s.last || 0), -s.rows.length, -(mean(hw.map((r) => r.pct)) ?? -1)], cells: [`<b>${esc(s.name)}</b>`, ago(s.last), s.rows.length, pct(mean(hw.map((r) => r.pct))),
        `${done(s, V)} / ${total(V)}`, `${done(s, M)} / ${total(M)}`, sk ? `${esc(sk.label)} · ${pct(sk.value)}` : "—"] }; });
    $("v-students").innerHTML = `<h2>Ученики</h2><p class="hint">Нажмите на ученика, чтобы открыть его карточку. Части = части рабочей тетради, сданные хотя бы раз.</p>` +
      table(["Ученик", "Активность", "Сдач", "С 1-й попытки", "Verbal: части", "Math: части", "Слабый навык"], rows, { click: true, num: [2, 3, 4, 5] }) +
      '<p class="hint">Один ученик записан дважды? Значит, имя набрано по-разному (например, «Айгерим К.» и «Aigerim K»). Попросите писать имя одинаково.</p>';
    clickStudents($("v-students"));
  }
  function studentDetail(s) {
    if (!s) { D.student = null; return students(); }
    const hw = s.rows.filter((r) => "VM".includes(r.kind)), scr = hw.filter((r) => r.screen);
    const per = hw.filter((r) => r.sec > 0 && r.b).map((r) => r.sec / r.b);
    const used = D.lessons.filter((l) => s.rows.some((r) => r.lesson === l.tag));
    const rowsOf = (tag, pid) => s.rows.filter((r) => r.lesson === tag && r.pid === pid);
    let html = `<div class="row" style="margin-top:0"><button class="btn ghost" id="back-st">← Все ученики</button></div><h2 style="font:italic 300 44px/1.1 var(--serif);margin-top:18px">${esc(s.name)}</h2>`;
    html += kpis([["Сдач", s.rows.length, `последняя: ${ago(s.last)} · текстов и сложных: ${s.rows.filter((r) => !"VM".includes(r.kind)).length}`], ["ДЗ с 1-й попытки", pct(mean(hw.map((r) => r.pct))), `${hw.length} частей тетради`],
      ["Со 2-й попытки", pct(mean(scr.filter((r) => r.second !== null).map((r) => r.second))), "на экране, после второй попытки"], ["Время на вопрос", per.length ? `${Math.round(median(per))} с` : "—", "медиана"]]);
    html += `<h2>Уроки</h2><p class="hint">Лучший результат с первой попытки по частям тетради, %. Наведите на клетку, чтобы увидеть часть. Тёмнее — лучше.</p>` + (used.filter((l) => "VM".includes(l.tag[0])).length ? heat(rowsOf, D.lessons.filter((l) => "VM".includes(l.tag[0]) && s.rows.some((r) => r.lesson === l.tag))) : '<p class="hint">Пока нет сданных частей.</p>');
    html += `<h2>Навыки</h2><p class="hint">Доля вопросов, решённых с первой попытки, по навыкам College Board (от слабых к сильным). Число справа — сколько вопросов.</p><div id="st-sk"></div>`;
    html += `<h2>История</h2>` + table(["Когда", "Что", "Результат", "Ошибки (1-я попытка)", "Попытка", "Время"], [...s.rows].reverse().map((r) => ({ k: r.key, cells: [when(r.ts), esc(whatOf(r)) + (r.screen ? '<span class="pill">экран</span>' : ""), `${r.a}/${r.b} · ${pct(r.pct)}`, r.wrong.length ? r.wrong.join(", ") : "—", r.attempt, r.sec ? `${Math.round(r.sec / 60)} мин` : "—"] })), { num: [2, 4, 5] });
    $("v-students").innerHTML = html;
    hbars($("st-sk"), skillStats(hw).filter((x) => x.n >= 2));
    $("back-st").onclick = () => { D.student = null; render(); };
  }
  function lessons() {
    const all = D.lessons.map((l) => l.tag).concat(D.sets.map((x) => x.id), D.texts.map((x) => x.id));
    const have = all.filter((t) => D.rows.some((r) => r.lesson === t));
    if (!D.lesson || !have.includes(D.lesson)) D.lesson = have[have.length - 1] || all[0];
    let html = `<h2>Уроки</h2><p class="hint">Выберите урок: кто сдал, средний результат и вопросы, на которых ошибаются чаще всего.</p><div class="chips" id="les-pick">${have.map((t) => `<button class="chip" data-t="${t}" aria-pressed="${t === D.lesson}">${t}</button>`).join("")}</div>`;
    const rows = D.rows.filter((r) => r.lesson === D.lesson), L = lessonOf(D.lesson);
    if (L) {
      const st = D.students;
      html += `<h2>${esc(L.title)}</h2>` + table(["Часть", "Сдали", "С 1-й попытки, средн.", "Медиана времени", "На экране"], L.parts.map((p) => { const rs = rows.filter((r) => r.pid === p.id), who = new Set(rs.map((r) => r.key));
        return { k: p.id, cells: [esc(p.title), `${who.size} / ${st.length}`, pct(mean(rs.map((r) => r.pct))), rs.some((r) => r.sec) ? `${Math.round(median(rs.filter((r) => r.sec).map((r) => r.sec)) / 60)} мин` : "—", rs.filter((r) => r.screen).length] }; }), { num: [1, 2, 3, 4] });
      // most-missed questions on the first attempt
      const miss = [];
      L.parts.forEach((p) => { const rs = rows.filter((r) => r.pid === p.id); if (!rs.length) return;
        p.q.forEach((q) => { const w = rs.filter((r) => r.wrong.includes(q.n)); if (w.length) miss.push({ label: `${p.title} · №${q.n}${q.sk ? " · " + q.sk : ""}`, value: (100 * w.length) / rs.length, n: rs.length, who: w.map((r) => r.name) }); }); });
      miss.sort((a, b) => b.value - a.value);
      html += `<h2>Чаще всего ошибаются</h2><p class="hint">Доля сдач, где вопрос решён неверно с первой попытки. Число справа — сколько сдач. Номера — как в рабочей тетради.</p><div id="les-miss"></div>`;
      html += `<h2>Ученики × части</h2><p class="hint">Лучший результат с первой попытки, %.</p>` + heatStudents(L, rows);
      $("v-lessons").innerHTML = html; hbars($("les-miss"), miss.slice(0, 10));
    } else {
      html += `<h2>${esc(whatOf(rows[0] || { kind: D.lesson[0], lesson: D.lesson }))}</h2>` + table(["Ученик", "Лучший", "Сдач", "Последняя"], D.students.filter((s) => rows.some((r) => r.key === s.key)).map((s) => { const rs = rows.filter((r) => r.key === s.key), b = best(rs);
        return { k: s.key, cells: [esc(s.name), `${b.a}/${b.b} · ${pct(b.pct)}`, rs.length, when(rs[rs.length - 1].ts)] }; }), { num: [1, 2] });
      const qs = {}; rows.forEach((r) => r.wrong.forEach((n) => (qs[n] = (qs[n] || 0) + 1)));
      html += `<h2>Чаще всего ошибаются</h2><div id="les-miss"></div>`;
      $("v-lessons").innerHTML = html; hbars($("les-miss"), Object.entries(qs).map(([n, k]) => ({ label: `Вопрос ${n}`, value: (100 * k) / rows.length, n: rows.length })).sort((a, b) => b.value - a.value).slice(0, 10));
    }
    $("les-pick").querySelectorAll(".chip").forEach((b) => (b.onclick = () => { D.lesson = b.dataset.t; render(); }));
  }
  function heatStudents(L, rows) {
    let s = `<div class="tw"><table class="heat"><tr><th></th>${L.parts.map((p) => `<th title="${esc(p.title)}">${esc(p.title.split(" ")[0].slice(0, 9))}</th>`).join("")}</tr>`;
    D.students.forEach((st) => {
      s += `<tr><th>${esc(st.name)}</th>` + L.parts.map((p) => { const rs = rows.filter((r) => r.key === st.key && r.pid === p.id), b = best(rs), c = shade(b ? b.pct : null);
        return `<td data-tip="${esc(`<b>${st.name} · ${p.title}</b><br>${b ? `${b.a}/${b.b}, сдач: ${rs.length}` : "Не сдано"}`)}"${c ? ` style="background:${c[0]};color:${c[1]}"` : ""}>${b ? Math.round(b.pct) : "·"}</td>`; }).join("") + "</tr>";
    });
    return s + "</table></div>";
  }
  function missing() {
    const L = lessonOf(D.mLesson) || D.lessons[0];
    D.mLesson = L.tag; const P = L.parts.find((p) => p.id === D.mPart) || L.parts.find((p) => p.title === "Домашнее задание") || L.parts[0]; D.mPart = P.id;
    const who = D.students.filter((s) => !s.rows.some((r) => r.lesson === L.tag && r.pid === P.id));
    const did = D.students.filter((s) => s.rows.some((r) => r.lesson === L.tag && r.pid === P.id));
    $("v-missing").innerHTML = `<h2>Кто не сдал</h2><p class="hint">Выберите урок и часть. Список учеников — все, кто хотя бы раз что-то сдавал.</p>
      <div class="row" style="margin-top:0"><select id="m-l">${D.lessons.map((l) => `<option value="${l.tag}"${l.tag === L.tag ? " selected" : ""}>${esc(l.title)}</option>`).join("")}</select>
      <select id="m-p">${L.parts.map((p) => `<option value="${p.id}"${p.id === P.id ? " selected" : ""}>${esc(p.title)}</option>`).join("")}</select></div>
      <h2>Не сдали · ${who.length}</h2>${who.length ? `<div class="miss">${who.map((s) => `<span>${esc(s.name)} <small class="hint">· ${ago(s.last)}</small></span>`).join("")}</div>
      <div class="row"><button class="btn ghost" id="m-copy">Скопировать напоминание</button><span class="hint" id="m-msg"></span></div>` : '<p class="hint">Все сдали.</p>'}
      <h2>Сдали · ${did.length}</h2><div class="miss">${did.map((s) => { const b = best(s.rows.filter((r) => r.lesson === L.tag && r.pid === P.id)); return `<span>${esc(s.name)} <small class="hint">· ${b.a}/${b.b}</small></span>`; }).join("") || '<p class="hint">Пока никто.</p>'}</div>`;
    $("m-l").onchange = () => { D.mLesson = $("m-l").value; D.mPart = null; render(); };
    $("m-p").onchange = () => { D.mPart = $("m-p").value; render(); };
    if ($("m-copy")) $("m-copy").onclick = async () => {
      const t = `Напоминание: ${L.title.replace("SAT ", "")} — «${P.title}». Сайт: решать на экране или ввести ответы из тетради. Ещё не сдали: ${who.map((s) => s.name).join(", ")}.`;
      try { await navigator.clipboard.writeText(t); $("m-msg").textContent = "Скопировано. Вставьте в Telegram."; } catch (e) { $("m-msg").textContent = t; }
    };
  }
  function log() {
    const q = (D.q || "").toLowerCase();
    const rows = [...D.rows].reverse().filter((r) => !q || (r.name + " " + whatOf(r) + " " + r.lesson).toLowerCase().includes(q));
    $("v-log").innerHTML = `<h2>Журнал</h2><div class="field"><input id="q" type="text" placeholder="Поиск: имя, урок, часть" value="${esc(D.q || "")}"></div><p class="hint">${rows.length} записей. Ответы: «3:B>C» — вопрос 3, первая попытка B, вторая C.</p>` +
      table(["Когда", "Ученик", "Что", "Результат", "Ошибки", "Ответы"], rows.slice(0, 400).map((r) => ({ k: r.key, cells: [when(r.ts), esc(r.name), esc(whatOf(r)) + (r.screen ? '<span class="pill">экран</span>' : ""), `${r.a}/${r.b}`, r.wrong.join(", ") || "—", `<span class="mono" style="font-size:12px">${esc(r.answers.map((a) => `${a.n}:${a.tries.join(">") || "-"}`).join(" "))}</span>`] })), { num: [3] });
    $("q").oninput = () => { D.q = $("q").value; const pos = $("q").selectionStart; render(); $("q").focus(); $("q").setSelectionRange(pos, pos); };
  }

  // ---------- demo data: fictional students, clearly labelled, to see the dashboard before real results exist
  function demoCSV() {
    const names = ["Ученик А.", "Ученик Б.", "Ученик В.", "Ученик Г."], out = [["Timestamp", "Student", "Lesson", "Part", "Answers", "Score", "Wrong", "Seconds", "Attempt"]];
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const now = Date.now();
    names.forEach((nm, si) => D.lessons.filter((l) => +l.tag.slice(1) <= 5 - si % 3).forEach((l, li) => l.parts.forEach((p, pi) => {
      if (rnd() < 0.25) return;
      const n = p.q.length, skill = 0.55 + si * 0.08 + rnd() * 0.2, wrong = p.q.filter(() => rnd() > skill).map((q) => q.n), screen = rnd() > 0.4;
      const ans = p.q.map((q) => `${q.n}:${wrong.includes(q.n) ? (screen && rnd() > 0.4 ? "A>B" : "A") : "C"}`).join(" ");
      const d = new Date(now - (28 - li * 2 - pi * 0.3 - si) * DAY * (0.8 + rnd() * 0.3));
      out.push([`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}:00`, nm, l.tag, `${p.id} · ${p.title}${screen ? " · экран" : ""}`, ans, `${n - wrong.length}/${n}`, wrong.join(","), String(Math.round(n * (60 + rnd() * 50))), "1"]);
    })));
    return out.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n");
  }

  // ---------- sources
  async function fromUrl(u) {
    $("src-msg").textContent = "Загружаю…";
    try { const r = await fetch(u, { cache: "no-store" }); if (!r.ok) throw new Error("HTTP " + r.status); D.demo = false; load(await r.text(), "живая ссылка · " + new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })); store("teacher_url", u); }
    catch (e) { $("src-msg").textContent = "Не удалось загрузить по ссылке: " + e.message + ". Проверьте, что выбран формат CSV, или загрузите файл."; }
  }
  function fromFile(f) {
    const rd = new FileReader();
    rd.onload = () => { try { D.demo = false; load(rd.result, "файл " + f.name); } catch (e) { $("src-msg").textContent = e.message; } };
    rd.readAsText(f, "utf-8");
  }
  function sources(on) { $("src").classList.toggle("hidden", !on); $("demo-row").classList.toggle("hidden", !on); }
  $("change").onclick = () => sources($("src").classList.contains("hidden"));
  $("file").onchange = () => $("file").files[0] && fromFile($("file").files[0]);
  const drop = $("drop");
  ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("on"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("on"); }));
  drop.addEventListener("drop", (e) => e.dataTransfer.files[0] && fromFile(e.dataTransfer.files[0]));
  $("load-url").onclick = () => $("url").value.trim() && fromUrl($("url").value.trim());
  $("reload").onclick = () => { const u = store("teacher_url"); if (u && !D.demo) fromUrl(u); else $("file").click(); };
  $("forget").onclick = () => { store("teacher_url", null); D.rows = []; $("url").value = ""; $("dash").classList.add("hidden"); sources(true); $("src-msg").textContent = "Данные убраны с этой страницы."; };
  $("demo").onclick = () => { D.demo = true; load(demoCSV(), "пример"); };
  $("tabs").querySelectorAll(".chip").forEach((b) => (b.onclick = () => { D.view = b.dataset.v; if (D.view !== "students") D.student = null; render(); }));
  addEventListener("resize", () => { if (!$("dash").classList.contains("hidden") && D.view === "overview") render(); });


  // ---------- site password: re-wrap the master key with a new password and publish access.json
  const GH = () => ({ token: store("gh_token") || "", repo: store("gh_repo") || "galiandojonathan-ship-it1/nurzycom_brand", branch: store("gh_branch") || "main" });
  function ghState() { const g = GH(); $("gh-state").textContent = g.token ? `· подключено: ${g.repo}, ветка ${g.branch}` : "· не подключено"; $("gh-repo").value = g.repo; $("gh-branch").value = g.branch; }
  async function newAccess() {
    const cur = $("pw-cur").value, a = $("pw-new").value.trim(), b = $("pw-new2").value.trim();
    if (a.length < 6) throw new Error("Новый пароль — не короче 6 символов.");
    if (a !== b) throw new Error("Новые пароли не совпадают.");
    if (a === cur.trim()) throw new Error("Новый пароль совпадает с текущим.");
    try { return { json: JSON.stringify(await SITE.rewrap(cur.trim(), a)), pw: a }; } catch (e) { throw new Error("Текущий пароль неверный."); }
  }
  const pwMsg = (t) => ($("pw-msg").textContent = t);
  $("pw-gh").onclick = async () => {
    const g = GH(); if (!g.token) { $("gh-set").open = true; pwMsg("Сначала подключите GitHub ниже (один раз) или скачайте файл вручную."); return; }
    try {
      pwMsg("Меняю пароль…"); const n = await newAccess();
      const url = `https://api.github.com/repos/${g.repo}/contents/docs/access.json`, hd = { Authorization: `Bearer ${g.token}`, Accept: "application/vnd.github+json" };
      const cur = await fetch(`${url}?ref=${encodeURIComponent(g.branch)}`, { headers: hd });
      if (cur.status === 401 || cur.status === 403) throw new Error("GitHub не принял токен. Проверьте токен и права Contents: Read and write.");
      if (!cur.ok && cur.status !== 404) throw new Error(`GitHub ответил ${cur.status}. Проверьте репозиторий и ветку.`);
      const sha = cur.ok ? (await cur.json()).sha : undefined;
      const put = await fetch(url, { method: "PUT", headers: hd, body: JSON.stringify({ message: "Change site password", content: btoa(n.json), branch: g.branch, sha }) });
      if (!put.ok) throw new Error(`GitHub не сохранил файл (${put.status}).`);
      SITE.remember(n.pw); ["pw-cur", "pw-new", "pw-new2"].forEach((i) => ($(i).value = ""));
      pwMsg("Готово. Пароль сменён: через 1–10 минут сайт будет принимать только новый пароль. Отправьте его ученикам.");
    } catch (e) { pwMsg(e.message); }
  };
  $("pw-dl").onclick = async () => {
    try {
      const n = await newAccess();
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([n.json], { type: "application/json" })); a.download = "access.json"; a.click();
      SITE.remember(n.pw);
      pwMsg("Файл access.json скачан. Загрузите его на GitHub: репозиторий → папка docs → Add file → Upload files → перетащите файл → Commit changes. Пока файл не загружен, работает старый пароль.");
    } catch (e) { pwMsg(e.message); }
  };
  $("gh-save").onclick = () => { if ($("gh-token").value.trim()) store("gh_token", $("gh-token").value.trim()); store("gh_repo", $("gh-repo").value.trim() || GH().repo); store("gh_branch", $("gh-branch").value.trim() || "main"); $("gh-token").value = ""; ghState(); };
  $("gh-forget").onclick = () => { store("gh_token", null); ghState(); };
  ghState();

  Promise.all(["lessons", "practice", "reading"].map((f) => SITE.json(f).catch(() => null))).then(([l, p, t]) => {
    D.lessons = (l && l.lessons) || []; D.sets = (p && p.sets) || []; D.texts = (t && t.texts) || [];
    const u = store("teacher_url"); if (u) { $("url").value = u; fromUrl(u); }
  });
  window.__teacher = { parseCSV, parseDate, columns };   // for testing
})();
