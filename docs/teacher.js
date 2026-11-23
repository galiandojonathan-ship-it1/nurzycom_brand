// Teacher dashboard: reads the Google Form responses (CSV file or a published CSV link) in the browser and summarises them.
(function () {
  "use strict";
  const pl = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many);   // Russian plural: 1 шаг, 2 шага, 5 шагов
  const mockName = (id) => (/^PR/.test(id) ? "Прогноз " : "Пробный тест ") + id.slice(2);   // PT3 → Пробный тест 3, PR1 → Прогноз 1
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
  const D = { csv: "", aliases: {}, lessons: [], sets: [], texts: [], mocks: null, bundles: {}, t: {}, rows: [], students: [], demo: false, view: "overview", student: null, lesson: null, sort: null };
  const DAY = 864e5;

  // CSV reading, dates and student names are shared with the cabinet (formkit.js)
  const { parseCSV, columns, slashOrder, parseDate } = window.FORMKIT;
  const norm = (n) => n.toLowerCase().replace(/ё/g, "е").replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();

  function load(text, label) {
    const all = parseCSV(text.replace(/^﻿/, ""));
    if (all.length < 2) throw new Error("В файле нет ответов.");
    const head = all[0], body = all.slice(1), c = columns(head, body);
    if (c.student === undefined || c.lesson === undefined || c.score === undefined) throw new Error("Не нашёл столбцы Student, Lesson и Score. Это точно таблица ответов формы?");
    const rows = [], order = c.ts === undefined ? "dmy" : slashOrder(body.map((r) => r[c.ts]));
    body.forEach((r) => {
      const g = (k) => (c[k] === undefined ? "" : (r[c[k]] || "").trim());
      let lesson = g("lesson").toUpperCase(); const sc = g("score").match(/^(\d+)\/(\d+)$/);
      if (!/^([VMXTDUA]\d\d|P[TR]\d\d?|MD|VA)$/.test(lesson) || !sc) return;
      const part = g("part"), pid = (part.match(/^p\d+/) || [""])[0];
      if (lesson[0] === "P") lesson += /^Math/.test(part) ? "·Math" : "·RW";   // mock tests: one row per section
      const answers = g("answers").split(/\s+/).filter(Boolean).map((t) => { const [n, v = "-"] = t.split(":"); return { n: /\./.test(n) ? n : Number(n), tries: v === "-" ? [] : v.split(">") }; });
      const s2 = part.match(/2-я: (\d+)\/(\d+)/);   // on-screen parts also report the score after the second attempt
      rows.push({ ts: parseDate(g("ts"), order), name: g("student"), raw: g("student"), key: norm(g("student")), lesson, kind: lesson[0], part, pid, screen: /экран/.test(part), second: s2 ? (100 * +s2[1]) / +s2[2] : null,
        a: +sc[1], b: +sc[2], pct: +sc[2] ? (100 * +sc[1]) / +sc[2] : 0, wrong: g("wrong").split(",").map((x) => x.trim()).filter(Boolean).map((x) => (/^\d+$/.test(x) ? Number(x) : x)), sec: Number(g("seconds")) || 0,
        attempt: Number(g("attempt")) || 1, answers });
    });
    if (!rows.length) throw new Error("Строки есть, но ни одна не похожа на результат с сайта.");
    rows.sort((x, y) => (x.ts || 0) - (y.ts || 0));
    // one student, several spellings («Шер. Ж.», «Sher Zh», «Sherniyaz»): merged under one romanized name (formkit.js)
    const counts = {}; rows.forEach((r) => (counts[r.raw] = (counts[r.raw] || 0) + 1));
    const G = FORMKIT.group(counts, D.aliases);
    if (G) rows.forEach((r) => { const x = G.of[r.raw]; if (x) { r.key = x.key; r.name = x.name; } });
    D.groups = G ? G.groups : []; D.csv = text; D.cbg = null;   // cabinet groups are read again with the new names
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
    if (r.kind === "U") { const l = lessonOf(r.lesson); return `Окружность · ${l ? l.title.split(" · ").slice(1).join(" · ") : r.lesson}`; }
    if (r.kind === "A") { const l = lessonOf(r.lesson); return `Архаичные слова · ${l ? l.title.split(" · ").slice(1).join(" · ") : r.lesson}`; }
    if (r.kind === "D") { const l = lessonOf(r.lesson); return `Desmos · ${l ? l.title.split(" · ").slice(1).join(" · ") : r.lesson}`; }
    if (r.kind === "P") return `${mockName(r.lesson).replace("·", " · ")} · ${r.part.replace(/^\S+ · /, "")}`;
    if (r.kind === "T") { const t = D.texts.find((x) => x.id === r.lesson); return `Текст · ${t ? t.title : r.lesson}`; }
    const p = partOf(r.lesson, r.pid); return `${r.lesson} · ${p ? p.title : r.part}`;
  };
  const best = (rows) => rows.reduce((m, r) => (m === null || r.pct > m.pct ? r : m), null);
  // per-question first-try misses, with the skill of each question from lessons.json
  function skillStats(rows) {
    const sk = {};
    rows.forEach((r) => {
      if (!"VMDUA".includes(r.kind)) return;
      const p = partOf(r.lesson, r.pid); if (!p) return;
      const wrong = new Set(r.wrong);
      p.q.forEach((q) => { if (!q.sk) return; const s = (sk[q.sk] = sk[q.sk] || { n: 0, ok: 0 }); s.n++; if (!wrong.has(q.n)) s.ok++; });
    });
    return Object.entries(sk).map(([k, v]) => ({ label: k, n: v.n, value: (100 * v.ok) / v.n })).sort((a, b) => a.value - b.value);
  }
  const shade = (v) => (v === null ? null : v >= 90 ? ["#0F0F0F", "#F5F3EE"] : v >= 75 ? ["#3A3936", "#F5F3EE"] : v >= 60 ? ["#7A7872", "#F5F3EE"] : v >= 40 ? ["#BDBBB5", "#0F0F0F"] : ["#E2E0DA", "#0F0F0F"]);

  // ---------- charts (single series, black and white)
  const tip = $("tip");
  function showTip(e, html) { tip.innerHTML = html; tip.classList.remove("hidden"); const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8); tip.style.left = x + "px"; tip.style.top = e.clientY + 14 + "px"; }
  const hideTip = () => tip.classList.add("hidden");
  function columns_(el, data, unit) {
    const W = Math.max(320, el.clientWidth - 28), H = 180, pad = { l: 28, b: 22, t: 10 }, n = data.length;
    const max = Math.max(1, ...data.map((d) => d.value)), top = max <= 5 ? max : Math.ceil(max / 5) * 5;
    const step = (W - pad.l) / n, bw = Math.min(24, step - 2), y = (v) => H - pad.b - ((H - pad.b - pad.t) * v) / top;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(unit)}">`;
    [0, top / 2, top].forEach((t) => { s += `<line x1="${pad.l}" x2="${W}" y1="${y(t)}" y2="${y(t)}" stroke="#E2E0DA" stroke-width="1"/><text x="${pad.l - 6}" y="${y(t) + 4}" text-anchor="end" font-family="IBM Plex Mono" font-size="10" fill="#5E5A54">${Math.round(t)}</text>`; });
    data.forEach((d, i) => {
      const x = pad.l + i * step + (step - bw) / 2, h = H - pad.b - y(d.value), r = Math.min(4, h);
      if (d.value > 0) s += `<path d="M${x},${H - pad.b} V${y(d.value) + r} q0,-${r} ${r},-${r} H${x + bw - r} q${r},0 ${r},${r} V${H - pad.b} Z" fill="#0F0F0F"/>`;
      s += `<rect class="hit" data-i="${i}" x="${pad.l + i * step}" y="${pad.t}" width="${step}" height="${H - pad.t}" fill="transparent"/>`;
      if (d.tick) s += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" fill="#5E5A54">${esc(d.tick)}</text>`;
    });
    el.innerHTML = s + "</svg>";
    el.querySelectorAll(".hit").forEach((h) => { h.onmousemove = (e) => showTip(e, data[h.dataset.i].tip); h.onmouseleave = hideTip; });
  }
  function hbars(el, data) {
    if (!data.length) { el.innerHTML = '<p class="hint">Пока мало данных.</p>'; return; }
    el.innerHTML = `<div class="hbars">${data.map((d) => `<div class="hb"><span>${esc(d.label)}</span><div class="hbar" aria-hidden="true"><i style="width:${Math.min(100, Math.max(0, d.value))}%"></i></div><span class="hb-value">${pct(d.value)} · ${d.n}</span></div>`).join("")}</div>`;
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
    return `<div class="tw" tabindex="0" role="region" aria-label="${esc(String(opts.label || cols.join(" · ")).replace(/<[^>]+>/g, ""))}"><table class="t"><thead><tr>${cols.map((c, i) => `<th data-c="${i}">${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr${opts.click ? ` class="click" data-k="${esc(r.k)}"` : ""}>${r.cells.map((c, i) => `<td${opts.num && opts.num.includes(i) ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  // ---------- views
  function render() {
    $("st-line").innerHTML = `${D.demo ? '<span class="demo-flag">Демо · вымышленные данные</span> ' : ""}${D.rows.length} записей · ${D.students.length} ${pl(D.students.length, "ученик", "ученика", "учеников")} · ${esc(D.label || "")}`;
    $("tabs").querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === D.view)));
    ["overview", "students", "lessons", "tests", "group", "missing", "log"].forEach((v) => $("v-" + v).classList.toggle("hidden", v !== D.view));
    ({ overview, students, lessons, tests, group: groupView, missing, log })[D.view]();
    bindTips(document);
  }
  function overview() {
    const now = Date.now(), wk = D.rows.filter((r) => r.ts && now - r.ts < 7 * DAY), m30 = D.rows.filter((r) => r.ts && now - r.ts < 30 * DAY);
    const hw30 = m30.filter((r) => "VM".includes(r.kind));
    const per = hw30.filter((r) => r.sec > 0 && r.b).map((r) => r.sec / r.b);
    let html = kpis([["Активны за 7 дней", new Set(wk.map((r) => r.key)).size, `из ${D.students.length} ${pl(D.students.length, "ученик", "ученика", "учеников")}`], ["Сдач за 7 дней", wk.length, `${m30.length} за 30 дней`],
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
      '<p class="hint">Разные написания одного имени («Шер. Ж.», «Sher Zh») сайт объединяет сам, под латинским написанием. Если объединил не тех или не объединил своих, откройте ученика: там можно отделить или присоединить написание.</p>';
    clickStudents($("v-students"));
  }
  function studentDetail(s) {
    if (!s) { D.student = null; return students(); }
    const hw = s.rows.filter((r) => "VM".includes(r.kind)), scr = hw.filter((r) => r.screen);
    const per = hw.filter((r) => r.sec > 0 && r.b).map((r) => r.sec / r.b);
    const used = D.lessons.filter((l) => s.rows.some((r) => r.lesson === l.tag));
    const rowsOf = (tag, pid) => s.rows.filter((r) => r.lesson === tag && r.pid === pid);
    let html = `<div class="row" style="margin-top:0"><button class="btn ghost" id="back-st">← Все ученики</button>${window.REPORT ? '<button class="btn" id="st-pdf" type="button">PDF-отчёт</button>' : ""}</div><h2 style="font:600 44px/1.1 var(--serif);margin-top:18px">${esc(s.name)}</h2>`;
    const grp = (D.groups || []).find((g) => g.key === s.key), sps = grp ? Object.entries(grp.spellings) : [];
    const others = D.students.filter((x) => x.key !== s.key);
    html += `<div class="card spell"><span class="label">Как ученик подписывал работы</span><div class="spl">${sps.map(([sp, n]) => `<span class="sp">${esc(sp)} <small>×${n}</small>${sps.length > 1 ? `<button class="chip" data-split="${esc(sp)}" title="Это другой ученик">Отделить</button>` : ""}</span>`).join("")}</div>
      ${others.length ? `<div class="row" style="margin-top:10px"><select id="join-sel" aria-label="Присоединить другого ученика"><option value="">Присоединить: это тот же ученик…</option>${others.map((x) => `<option value="${esc(x.key)}">${esc(x.name)}</option>`).join("")}</select><button class="btn ghost" id="join-go">Объединить</button></div>` : ""}
      ${Object.keys(D.aliases).length ? '<p class="hint"><a href="#" id="alias-reset">Вернуть автоматическое объединение имён</a></p>' : ""}</div>`;
    html += kpis([["Сдач", s.rows.length, `последняя: ${ago(s.last)} · текстов и сложных: ${s.rows.filter((r) => !"VM".includes(r.kind)).length}`], ["ДЗ с 1-й попытки", pct(mean(hw.map((r) => r.pct))), `${hw.length} ${pl(hw.length, "часть", "части", "частей")} тетради`],
      ["Со 2-й попытки", pct(mean(scr.filter((r) => r.second !== null).map((r) => r.second))), "на экране, после второй попытки"], ["Время на вопрос", per.length ? `${Math.round(median(per))} с` : "—", "медиана"]]);
    html += '<div id="st-prog"></div><div id="st-bb"></div><div id="st-live"></div><div id="st-rv"></div><div id="st-tw"></div>';
    html += `<h2>Уроки</h2><p class="hint">Лучший результат с первой попытки по частям тетради, %. Наведите на клетку, чтобы увидеть часть. Тёмнее — лучше.</p>` + (used.filter((l) => "VM".includes(l.tag[0])).length ? heat(rowsOf, D.lessons.filter((l) => "VM".includes(l.tag[0]) && s.rows.some((r) => r.lesson === l.tag))) : '<p class="hint">Пока нет сданных частей.</p>');
    html += `<h2>Навыки</h2><p class="hint">Доля вопросов, решённых с первой попытки, по навыкам College Board (от слабых к сильным). Число справа — сколько вопросов.</p><div id="st-sk"></div>`;
    html += `<h2>История</h2><p class="hint">«разбор →» открывает вопросы этой части только с ответами этого ученика: ошибки, его попытки, верный ответ и объяснение.</p><div id="st-hw"></div>` + table(["Когда", "Что", "Результат", "Ошибки (1-я попытка)", "Попытка", "Время"], [...s.rows].reverse().map((r) => ({ k: r.key, cells: [when(r.ts), esc(whatOf(r)) + (r.screen ? '<span class="pill">экран</span>' : "") + ("VM".includes(r.kind) && (partOf(r.lesson, r.pid) || {}).b ? ` <a href="#" class="to-hw pill" data-i="${s.rows.indexOf(r)}">разбор →</a>` : "") + (r.kind === "P" ? ` <a href="#" class="to-test pill" data-m="${r.lesson.split("·")[0]}" data-s="${/Math/.test(r.lesson) ? "math" : "rw"}">ответы →</a>` : ""), `${r.a}/${r.b} · ${pct(r.pct)}` + (r.kind === "P" && window.SATSCALE ? ` · ≈ ${SATSCALE.section(/Math/.test(r.lesson) ? "math" : "rw", /M2 сложный/.test(r.part), r.a)}` : ""), r.wrong.length ? esc(r.wrong.join(", ")) : "—", r.attempt, r.sec ? `${Math.round(r.sec / 60)} мин` : "—"] })), { num: [2, 4, 5] });
    $("v-students").innerHTML = html;
    $("v-students").querySelectorAll(".to-test").forEach((el) => (el.onclick = (e) => { e.preventDefault(); e.stopPropagation(); Object.assign(D.t, { mid: el.dataset.m, sec: el.dataset.s, mod: "m1", who: s.key, bad: true, others: false }); D.view = "tests"; D.student = null; render(); }));
    hbars($("st-sk"), skillStats(hw).filter((x) => x.n >= 2));
    progMount(s).catch(() => { const b = $("st-prog"); if (b) b.innerHTML = ""; });
    gaCollect({ keys: new Set([s.key]) }).then((all) => { bbRender(s, all); if (D.student === s.key && $("st-rv")) rvMount($("st-rv"), { slot: "st", mode: "solo", title: s.name, all, keys: new Set([s.key]), names: [s.name] });
      if (D.student === s.key && $("st-tw") && window.TWINS) D.tw = TWINS.mount($("st-tw"), { name: s.name, key: s.key, pool: async () => [...(await twinPool(all)), ...(window.BBSHARE ? BBSHARE.mistakes(await bbShares(s).catch(() => [])) : [])].sort((a, b) => (b.ts || 0) - (a.ts || 0)), quick: () => twinQuick(s),
        load: async (c) => { if (c.bb) return { ...c, item: { t: /^[A-D]$/.test(c.bb.keys[0] || "") ? "mc" : "spr", ans: c.bb.keys[0], acc: c.bb.keys, sk: c.sk, d: c.d } };   // Bluebook: no text, key and skill only
          const item = await teacherReviewItem(c.q); return item ? { ...c, sk: c.sk || item.sk, d: c.d || item.d, item } : null; } }); }).catch(() => { /* the card works without it */ });
    $("v-students").querySelectorAll(".to-hw").forEach((el) => (el.onclick = (e) => { e.preventDefault(); e.stopPropagation(); D.hwAll = false; hwReview(s, s.rows[+el.dataset.i]); }));
    $("back-st").onclick = () => { D.student = null; render(); };
    if ($("st-pdf")) $("st-pdf").onclick = async () => { const b = $("st-pdf"); b.disabled = true; try { REPORT.open(await reportData(s)); } finally { b.disabled = false; } };
    $("v-students").querySelectorAll("[data-split]").forEach((b) => (b.onclick = () => { D.aliases[b.dataset.split] = "!"; relink(); }));
    if ($("join-go")) $("join-go").onclick = () => { const k = $("join-sel").value, o = D.students.find((x) => x.key === k); if (!o) return;
      new Set(o.rows.map((r) => r.raw)).forEach((sp) => (D.aliases[sp] = s.key)); relink(); };
    if ($("alias-reset")) $("alias-reset").onclick = (e) => { e.preventDefault(); D.aliases = {}; relink(); };
  }
  // «Прогресс ученика» (progress.js + progress-view.js): this student's first attempts → observations for the index
  let tagsReady = null;
  const progTags = () => (tagsReady ??= SITE.json("tags").then((t) => (t && t.q) || {}).catch(() => { tagsReady = null; return {}; }));
  function progObs(s, TAGS) {
    const out = [];
    for (const r of s.rows) {
      const wrong = new Set(r.wrong.map(String)), per = r.sec && r.b ? r.sec / r.b : 0;
      let base;
      if (r.kind === "P") { const mid = r.lesson.split("·")[0], sec = /·Math$/.test(r.lesson) ? "math" : "rw", m2 = /M2 сложный/.test(r.part) ? "m2h" : "m2e";
        base = (a) => { const [mn, qn] = String(a.n).split("."); return { id: `${mid}.${sec}.${mn === "1" ? "m1" : m2}.${qn}`, sec, ctx: "mock", src: "mock" }; };
      } else if (r.kind === "X") base = (a) => ({ id: `${r.lesson}.${a.n}`, sec: "rw", ctx: "final", src: "hw" });
      else if ("VAM".includes(r.kind)) { const P = partOf(r.lesson, r.pid); if (!P) continue;
        const ctx = P.mode === "test" ? "final" : /Домашн|Дополн/.test(P.title) ? "hw" : "learn", sec = "VA".includes(r.lesson[0]) ? "rw" : "math";
        base = (a) => ({ id: `${r.lesson}.${r.pid}.${a.n}`, sec, ctx, src: "hw" });
      } else continue;
      // an abandoned practice-test section (more than half the questions skipped) shows no skill: left out of the analysis
      if (r.kind === "P" && r.answers.length && r.answers.filter((a) => !a.tries.length).length > r.answers.length / 2) continue;
      for (const a of r.answers) {
        const b = base(a), tag = TAGS[b.id], blank = !a.tries.length;
        out.push({ ...b, t: +r.ts, x: blank || wrong.has(String(a.n)) ? 0 : 1, blank, level: tag ? tag.d : "M", type: tag ? tag.ty : "mc", part: `${r.lesson}|${r.pid}|${+r.ts}`,
          attempt: r.attempt || 1, chosen: a.tries[0] || "", second: a.tries.length > 1 && tag && tag.ty === "mc" ? (a.tries[1] === tag.k ? 1 : 0) : null, secs: per });
      }
    }
    return out;
  }
  /* Bluebook practice tests the student shared and practice on live lessons, as observations for the progress engine (2026-11-23,
     Nurassyl: «включи эти пробные тесты в анализ… учти повторения, дату… activity on lessons»).
     Bluebook: every position of the recognised route (from the catalog), dated by the day the test was taken, weight of a mock.
     A question that is also in the course takes the course id, so the engine counts a later meeting as a repeat and uses its
     subtopic; otherwise its College Board skill spreads the evidence over that skill's subtopics. Live rounds: the round records
     the lesson account saves (lv_r_), matched to this student by name, weight of a learning part. */
  let LIVE = null;
  function liveRecords() {
    if (!LIVE) LIVE = (async () => { const out = [];
      for (const id of await lessonIds()) { const g = await SITE.api("admin/progress?id=" + encodeURIComponent(id)); if (!g.ok) continue;
        const B = await SITE.unsealBlob(g.data.data).catch(() => ({}));
        for (const [k, r] of Object.entries(B)) if (k.indexOf("lv_r_") === 0 && r && r.v != null) { try { out.push(JSON.parse(r.v)); } catch (e) { /* broken */ } } }
      return out.sort((a, b) => (a.at || 0) - (b.at || 0)); })().catch(() => { LIVE = null; return []; });
    return LIVE;
  }
  async function liveOf(s) {
    const key = (n) => (window.FORMKIT ? FORMKIT.key(n) : String(n).toLowerCase());
    return (await liveRecords()).map((rec) => ({ rec, me: (rec.students || []).find((st) => key(st.name) === s.key) })).filter((x) => x.me);
  }
  async function progExtra(s, TAGS) {
    const obs = [], tags = {};
    if (!SITE.adminKey()) return { obs, tags };
    const [sh, cat, lv] = await Promise.all([window.BBSHARE ? bbShares(s).catch(() => []) : [], SITE.json("bluebook").catch(() => null), liveOf(s).catch(() => [])]);
    if (cat) for (const d of sh) for (const [sec, x] of Object.entries(d.sections)) {
      const T = cat.tests[x.test], lists = T && T[sec] ? [T[sec].m1, T[sec][x.route]] : null; if (!lists || !lists[0] || !lists[1]) continue;
      const miss = new Map(x.miss.map((m) => [`${m[0]}.${m[1]}`, m])), size = sec === "rw" ? 27 : 22;
      // a module the student did not do: marked by the import (skip), or, in records sent before 2026-11-23, 80%+ blanks among the misses
      const skip = x.skip || [1, 2].map((k) => x.miss.filter((m) => m[0] === k && m[2] == null).length >= size * 0.8);
      lists.forEach((ids, mi) => { if (skip[mi]) return; ids.forEach((cid, qi) => {
        const it = cat.items[cid] || {}, m = miss.get(`${mi + 1}.${qi + 1}`);
        let id = (it.c || []).find((r) => TAGS[r]);
        if (!id) { id = "BB." + cid; if (!tags[id]) { const tg = PROGRESS.tagFromSkill(it.s || it.si); if (tg) tags[id] = tg; } }
        obs.push({ id, t: d.taken || d.at, x: m ? 0 : 1, blank: !!(m && m[2] == null), sec, level: it.d || "M", type: /^[A-D]$/.test((it.k || [])[0] || "") ? "mc" : "spr",
          ctx: "mock", src: "bb", part: `bb|${d.hash}|${sec}|${mi}`, attempt: 1, chosen: m && m[2] ? m[2] : "", second: null, secs: 0 });
      }); });
    }
    for (const { rec, me } of lv) (rec.items || []).forEach((it, i) => {
      const a = (me.ans || {})[i + 1]; if (!a) return;
      const id = it.ref && TAGS[it.ref] ? it.ref : `LV.${rec.round}.${i + 1}`;
      if (!TAGS[id] && it.sk && !tags[id]) { const tg = PROGRESS.tagFromSkill(it.sk); if (tg) tags[id] = tg; }
      obs.push({ id, t: rec.at, x: a[1] ? 1 : 0, blank: false, sec: it.sec || "rw", level: it.d || "M", type: it.type === "mc" ? "mc" : "spr",
        ctx: "learn", src: "live", part: `live|${rec.round}`, attempt: 1, chosen: /^[A-D]$/.test(a[0] || "") ? a[0] : "", second: null, secs: 0 });
    });
    return { obs, tags };
  }
  const SRC = [["hw", "Домашние"], ["mock", "Пробные на сайте"], ["bb", "Bluebook"], ["live", "Уроки"]];
  async function progMount(s) {
    const box = $("st-prog"); if (!box || !window.PROGRESS || !window.PVIEW) return;
    box.innerHTML = '<div class="card pg"><span class="label">Прогресс ученика</span><p class="hint">Считаю индекс…</p></div>';
    const TAGS = await progTags(); if ($("st-prog") !== box || D.student !== s.key) return;
    const tags = {}; for (const id in TAGS) tags[id] = { p: TAGS[id].p, s: TAGS[id].s, t: TAGS[id].t };
    const extra = await progExtra(s, TAGS).catch(() => ({ obs: [], tags: {} })); if ($("st-prog") !== box || D.student !== s.key) return;
    Object.assign(tags, extra.tags);
    const all = [...progObs(s, TAGS), ...extra.obs], counts = {}; all.forEach((o) => (counts[o.src] = (counts[o.src] || 0) + 1));
    // which sources count, remembered per student (Nurassyl's own account: homework off, it was only testing the site)
    const KEY = "pg_src_" + s.key; let sel = {}; try { sel = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { sel = {}; }
    const draw = () => {
      const res = PROGRESS.compute(all.filter((o) => sel[o.src] !== false), tags); D.prog = { key: s.key, res };
      PVIEW.render(box, res, { name: s.name, onTwins: (f) => { if (D.tw && D.student === s.key) D.tw.preset(f); },   // «Похожие» on a subtopic or a trap
        sources: { list: SRC.filter(([k]) => counts[k]).map(([k, l]) => ({ k, l, n: counts[k], on: sel[k] !== false })),
          set: (k, on) => { sel[k] = on; try { localStorage.setItem(KEY, JSON.stringify(sel)); } catch (e) { /* private mode */ } draw(); } } });
    };
    draw();
    liveMount(s).catch(() => { /* no lesson account */ });
  }
  // «Уроки · живая практика»: the rounds this student answered on lessons
  async function liveMount(s) {
    const box = $("st-live"); if (!box || !SITE.adminKey()) return;
    const lv = await liveOf(s); if ($("st-live") !== box || D.student !== s.key || !lv.length) return;
    const day = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    box.innerHTML = `<div class="card"><span class="label">Уроки · живая практика</span><p class="hint">Раунды на уроках, где ученик отвечал со своего устройства (сохраняет аккаунт урока после каждого раунда).</p>
      ${table(["Дата", "Раунд", "Отвечено", "Верно"], lv.slice().reverse().map(({ rec, me }) => { const a = Object.values(me.ans || {}); return { cells: [esc(day(rec.at)), esc(rec.title || "Раунд"), `${a.length}/${(rec.items || []).length}`, `${a.filter((x) => x[1]).length}`] }; }), { num: [2, 3] })}</div>`;
  }
  // «PDF-отчёт»: what the report shows for one student (report.js); only the student's own submissions, no internal index
  async function reportData(s) {
    const hw = s.rows.filter((r) => "VM".includes(r.kind)), NAME = (window.PVIEW && PVIEW.NAME) || {};
    const rows = s.rows.map((r) => ({ t: +r.ts, what: whatOf(r), a: r.a, b: r.b, pct: r.pct, lesson: r.lesson, kind: "VM".includes(r.kind) ? "hw" : r.kind === "P" ? "mock" : "other",
      est: r.kind === "P" && window.SATSCALE ? SATSCALE.section(/Math/.test(r.lesson) ? "math" : "rw", /M2 сложный/.test(r.part), r.a) : null }));
    const strong = [], weak = [];
    if (D.prog && D.prog.key === s.key) {
      const res = D.prog.res, n = res.snaps.length - 1, subs = res.subs.filter((x) => x.n >= 3 && x.series[n] != null && NAME[x.k]);
      subs.filter((x) => x.series[n] >= 0.75).sort((a, b) => b.series[n] - a.series[n]).slice(0, 4).forEach((x) => strong.push(NAME[x.k]));
      subs.filter((x) => { const c = PROGRESS.change(res, x, 0, n); return x.series[n] < 0.5 || (c && c.z <= -PROGRESS.ZMIN); }).sort((a, b) => a.series[n] - b.series[n]).slice(0, 4).forEach((x) => weak.push(NAME[x.k]));
    }
    const shares = window.BBSHARE && SITE.adminKey() ? await bbShares(s).catch(() => []) : [];
    return { name: s.name, rows, skills: skillStats(hw), strong, weak, shares };
  }
  // Bluebook results the student shared from their own login (bb_share_ keys), found by matching account names to this form student
  let ACCT = null;
  function accountsByName() {
    if (!ACCT) ACCT = (async () => { const m = new Map(), r = await SITE.api("admin/users"); if (!r.ok) return m;
      for (const u of r.data.users || []) { const nm = await SITE.nameOf(u.n).catch(() => null), k = nm && nm.name && window.FORMKIT ? FORMKIT.key(nm.name) : ""; if (k) { if (!m.has(k)) m.set(k, []); m.get(k).push(u.id); } }
      return m; })().catch(() => { ACCT = null; return new Map(); });
    return ACCT;
  }
  // the Bluebook block of a student card, with repeats: the same College Board question in the course (form answers of this
  // student: right or wrong then) and in an earlier shared Bluebook result
  async function bbRender(s, all) {
    if (!window.BBSHARE || !SITE.adminKey()) return;
    const [sh, cat] = await Promise.all([bbShares(s).catch(() => []), SITE.json("bluebook").catch(() => null)]);
    const b = $("st-bb"); if (!b || D.student !== s.key) return;
    if (!sh.length) { b.innerHTML = b.innerHTML ? '<div class="card"><span class="label">Bluebook · отправлено учеником</span><p class="hint" role="status" id="bb-del-st"></p><p class="hint">Отправленных пробников нет.</p></div>' : ""; return; }
    const byId = new Map(all.map((q) => [q.id, q])); let again = 0;
    const rep = (id, d) => {
      const it = cat && cat.items[id], parts = [];
      for (const ref of (it && it.c) || []) { const q = byId.get(ref); parts.push(`${BBSHARE.refLabel(ref)}${q ? (q.wrong ? ` · ✗ ${esc((q.mine || [])[0] || "")}` : " · ✓") : ""}`); if (q && q.wrong) again++; }
      for (const e of sh) if ((e.taken || e.at) < (d.taken || d.at)) for (const x of Object.values(e.sections)) if (x.miss.some((m) => m[4] === id)) { parts.push(`Bluebook ${esc(x.label || "")} · ✗`); again++; }
      return parts.length ? `<br><small class="bb-rep">Уже был: ${parts.join("; ")}</small>` : "";
    };
    const body = BBSHARE.html(sh, { open: true, rep, del: true });
    b.innerHTML = `<div class="card"><span class="label">Bluebook · отправлено учеником</span><p class="hint">«Убрать» удаляет пробник из кабинета и подсказок Gemini. Сразу после удаления можно вернуть. Если ученик отправит его снова, он появится с пометкой «отправлен снова после удаления».</p><p class="hint" role="status" id="bb-del-st"></p>${again ? `<p class="hint"><b>Повторные ошибки: ${again}.</b> Эти вопросы ученик уже решал в курсе или в прошлом пробнике и ошибся снова (✗).</p>` : ""}${body}<p class="hint">Ошибки с подтверждённым навыком есть в «Похожие вопросы · Gemini» ниже (работа «Bluebook · …»).</p></div>`;
    bbDelWire(s, all, sh);
  }
  // remove a shared Bluebook result (or put it back): rewrite one key on the student's synced copy, newest change wins
  async function bbSet(acct, key, value) {
    const url = "admin/progress?id=" + encodeURIComponent(acct), g = await SITE.api(url); if (!g.ok) throw new Error(`Сервер ответил ${g.status}.`);
    const B = await SITE.unsealBlob(g.data.data); B[key] = { v: value, t: Date.now() };
    const p = await SITE.api(url, { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob(B) }) }); if (!p.ok) throw new Error(`Сервер ответил ${p.status}.`);
  }
  function bbDelWire(s, all, sh) {
    const box = $("st-bb"); if (!box) return;
    box.querySelectorAll("[data-bbdel]").forEach((btn) => (btn.onclick = async (e) => {
      e.preventDefault(); e.stopPropagation();
      const d = sh.find((x) => x.key === btn.dataset.bbdel), st = $("bb-del-st"); if (!d) return;
      const orig = JSON.stringify(Object.fromEntries(Object.entries(d).filter(([k]) => k !== "key" && k !== "acct")));
      btn.disabled = true;
      try { await bbSet(d.acct, d.key, BBSHARE.tomb(d)); } catch (err) { st.textContent = "Не удалось убрать: " + err.message; btn.disabled = false; return; }
      await bbRender(s, all);
      const st2 = $("bb-del-st"); if (!st2) return;
      st2.innerHTML = `Пробник «${esc(Object.values(d.sections).map((x) => x.label).find(Boolean) || d.title || "Bluebook")}» убран. <button class="chip" type="button" id="bb-undo">Вернуть</button>`;
      const timer = setTimeout(() => { if ($("bb-undo")) st2.textContent = "Пробник убран."; }, 10000);
      $("bb-undo").onclick = async () => { clearTimeout(timer); try { await bbSet(d.acct, d.key, orig); await bbRender(s, all); const st3 = $("bb-del-st"); if (st3) st3.textContent = "Пробник возвращён."; } catch (err) { st2.textContent = "Не удалось вернуть: " + err.message; } };
    }));
  }
  async function bbShares(s) {
    const out = [];
    for (const id of (await accountsByName()).get(s.key) || []) {
      const g = await SITE.api("admin/progress?id=" + encodeURIComponent(id)); if (!g.ok) continue;
      out.push(...BBSHARE.fromCopy(await SITE.unsealBlob(g.data.data).catch(() => null)).map((x) => Object.assign(x, { acct: id })));
    }
    return out.sort((a, b) => (b.at || 0) - (a.at || 0));
  }
  // every first-attempt mistake of one student for the Gemini picker, with the subtopic and the trap from the progress tags
  async function twinPool(all) {
    const TAGS = await progTags().catch(() => ({})), NAME = (window.PVIEW && PVIEW.NAME) || {}, TRAP = (window.PVIEW && PVIEW.TRAP) || {};
    return all.filter((q) => q.wrong > 0).sort((a, b) => (b.ts || 0) - (a.ts || 0)).map((q) => {
      const tg = TAGS[q.id] || {}, ch = /^[A-D]$/.test((q.mine || [])[0] || "") ? q.mine[0] : "", tk = ch && tg.t ? tg.t[ch] : "";
      return { id: q.id, title: q.title, plabel: q.plabel || q.work || "", sec: q.sec, sk: q.sk || "", d: q.d || tg.d || "", chosen: ch, ts: q.ts, focus: NAME[tg.p] || "", trapKind: TRAP[tk] || "", q };
    });
  }
  // picks from the progress analytics: weak and dropped subtopics, the trap chosen most often
  function twinQuick(s) {
    const r = D.prog && D.prog.key === s.key ? D.prog.res : null, NAME = (window.PVIEW && PVIEW.NAME) || {}, TRAP = (window.PVIEW && PVIEW.TRAP) || {};
    if (!r || !r.snaps.length) return [];
    const n = r.snaps.length - 1, out = [];
    r.subs.filter((x) => x.n >= 3 && x.series[n] != null && x.series[n] < 0.45).sort((a, b) => a.series[n] - b.series[n]).slice(0, 2)
      .forEach((x) => NAME[x.k] && out.push({ label: `Слабое место: ${NAME[x.k]}`, hint: `мастерство ${Math.round(x.series[n] * 100)}%`, f: { focus: NAME[x.k] } }));
    r.subs.filter((x) => x.n >= 3).map((x) => ({ x, c: PROGRESS.change(r, x, 0, n) })).filter((y) => y.c && y.c.z <= -PROGRESS.ZMIN).slice(0, 2)
      .forEach(({ x }) => NAME[x.k] && out.push({ label: `Просело: ${NAME[x.k]}`, hint: "падение больше шума", f: { focus: NAME[x.k] } }));
    r.traps.filter((t) => t.n >= 4 && TRAP[t.trap]).sort((a, b) => b.now - a.now).slice(0, 2)
      .forEach((t) => out.push({ label: `Ловушка: ${TRAP[t.trap]}`, hint: `выбирает в ${Math.round(t.now * 100)}% случаев, когда она есть`, f: { trap: TRAP[t.trap] } }));
    return out;
  }
  // one result of one student, question by question: only this student's answers (for discussing mistakes together)
  async function hwReview(s, r) {
    const box = $("st-hw"), P = r && partOf(r.lesson, r.pid); if (!box || !P) return;
    box.innerHTML = '<p class="hint">Загружаю вопросы…</p>';
    box.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    let items; try { items = await bundleT(P.b); } catch (e) { box.innerHTML = '<p class="hint">Не удалось загрузить вопросы этой части. Обновите страницу.</p>'; return; }
    if ($("st-hw") !== box || D.student !== s.key) return;   // the view changed while loading
    const tries = {}; r.answers.forEach((a) => (tries[String(a.n)] = a.tries));
    const bad = new Set(r.wrong.map(String)), list = items.filter((q) => D.hwAll || bad.has(String(q.n)));
    const nWrong = items.filter((q) => bad.has(String(q.n))).length;
    const q1 = (q) => {
      const T = tries[String(q.n)] || [], ok = !bad.has(String(q.n)), acc = [].concat(q.acc || q.ans).filter(Boolean);
      const opts = q.t === "mc" && q.opts ? q.opts.map((o, k) => { const L = "ABCD"[k], tg = [L === q.ans ? "верный" : "", T[0] === L ? "1-я попытка" : "", T[1] === L && T[1] !== T[0] ? "2-я попытка" : ""].filter(Boolean);
          return `<div class="ropt${L === q.ans ? " right" : ""}${T[0] === L && L !== q.ans ? " mine" : ""}"><span class="lt">${L}</span><span class="qhtml">${o}</span><span class="tg">${tg.join(" · ")}</span></div>`; }).join("")
        : `<p class="hint">Ответ ученика: <b>${esc(T.join(" → ") || "—")}</b> · принимаются: ${esc(acc.join(", "))}</p>`;
      return `<details class="rv tq${ok ? "" : " bad"}"${ok ? "" : " open"}><summary><span class="mk ${ok ? "ok" : "no"}">${q.n}</span><span class="tq-s"><b>${esc(q.sk || "Вопрос " + q.n)}</b>
        <br><small>${T.length ? `ответ: ${esc(T.join(" → "))}` : "без ответа"} · верный: ${esc(acc.join(", "))} · ${ok ? "✓ с первой попытки" : T.length > 1 && acc.includes(T[T.length - 1]) ? "✗ с первой, ✓ со второй" : "✗ ошибка"}</small></span></summary>
        <div class="rbody">${q.stim ? `<div class="qhtml">${q.stim}</div>` : ""}<div class="qhtml">${q.stem || ""}</div>${opts}
        ${q.rat ? `<div class="sv-expl"><span class="label">Объяснение</span><div class="qhtml">${q.rat}</div>${q.dz || ""}</div>` : ""}</div></details>`;
    };
    box.innerHTML = `<div class="card hwrev"><span class="label">Разбор · только ответы ученика</span>
      <h3 style="margin:6px 0 4px">${esc(s.name)} · ${esc(whatOf(r))}</h3>
      <p class="hint" style="margin:0 0 10px">Сдано ${when(r.ts)} · ${r.a}/${r.b} с первой попытки · ошибок: ${nWrong}${r.screen ? " · решал(а) на экране" : ""}</p>
      <div class="row t-filters"><label class="onlybad"><input type="checkbox" id="hw-all"${D.hwAll ? " checked" : ""}> Показать все вопросы</label>${nWrong && window.TWINS ? '<button class="btn" id="hw-tw">Похожие вопросы на эти ошибки</button>' : ""}<button class="btn ghost" id="hw-close">Закрыть разбор</button></div><div id="hw-twbox"></div>
      <div id="hw-list">${list.length ? list.map(q1).join("") : `<p class="hint">${nWrong ? "" : "Ошибок с первой попытки нет. "}Отметьте «Показать все вопросы», чтобы пройти часть целиком.</p>`}</div></div>`;
    $("hw-all").onchange = () => { D.hwAll = $("hw-all").checked; hwReview(s, r); };
    $("hw-close").onclick = () => { box.innerHTML = ""; };
    if ($("hw-tw")) $("hw-tw").onclick = () => { $("hw-tw").remove(); TWINS.mount($("hw-twbox"), { name: s.name, key: s.key, scope: whatOf(r),
      mistakes: async () => { const TAGS = await progTags().catch(() => ({})), NAME = (window.PVIEW && PVIEW.NAME) || {}, TRAP = (window.PVIEW && PVIEW.TRAP) || {};
        return items.filter((q) => bad.has(String(q.n))).map((q) => { const id = `${r.lesson}.${r.pid}.${q.n}`, tg = TAGS[id] || {}, ch = (tries[String(q.n)] || [])[0] || "";
          return { id, title: `${whatOf(r)} · №${q.n}`, sec: "VA".includes(r.lesson[0]) ? "rw" : "math", sk: q.sk, d: q.d, chosen: ch, item: q, focus: NAME[tg.p] || "", trapKind: (tg.t && TRAP[tg.t[ch]]) || "" }; }); } });
      $("hw-twbox").querySelector("#tw-go").click(); };
  }
  function relink() {   // apply the teacher's merges again and keep them with the saved answers
    const keep = D.student, k = D.view; load(D.csv, D.label); D.view = k;
    D.student = D.students.some((x) => x.key === keep) ? keep : (D.students.find((x) => Object.keys(D.aliases).some((sp) => x.rows.some((r) => r.raw === sp))) || {}).key || null;
    try { localStorage.setItem("name_alias", JSON.stringify(D.aliases)); } catch (e) { /* private mode */ }
    if (!D.demo) cloudSave(); render();
  }
  // ---------- mock tests: every question with its answer, explanation and what each student chose
  const MODN = { m1: "Модуль 1", m2h: "Модуль 2 · сложный", m2e: "Модуль 2 · лёгкий" };
  const DOMN = { CAS: "Craft and Structure", INI: "Information and Ideas", SEC: "Standard English Conventions", EOI: "Expression of Ideas",
    H: "Algebra", P: "Advanced Math", Q: "Problem-Solving and Data Analysis", S: "Geometry and Trigonometry" };
  const DIFN = { E: "лёгкий", M: "средний", H: "сложный" };
  async function bundleT(path) {
    if (!D.bundles[path]) D.bundles[path] = JSON.parse(new TextDecoder().decode(await SITE.open(await (await fetch(path, { cache: "no-store" })).arrayBuffer())));
    return D.bundles[path];
  }
  // each student's latest submission of one test section (older ones are counted, not shown)
  function mockRuns(mid, sec) {
    const tag = `${mid}·${sec === "rw" ? "RW" : "Math"}`, by = {};
    D.rows.filter((r) => r.lesson === tag).forEach((r) => (by[r.key] = by[r.key] || []).push(r));
    return Object.values(by).map((rs) => {
      const r = rs[rs.length - 1], m2 = /M2 сложный/.test(r.part) ? "m2h" : "m2e", ans = {}, bad = new Set(r.wrong.map(String));
      r.answers.forEach((a) => { const [k, n] = String(a.n).split("."); if (n) ans[`${k === "1" ? "m1" : m2}.${n}`] = a.tries[0] || ""; });
      const raw = (m) => +((r.part.match(m === "m1" ? /M1 (\d+)\/(\d+)/ : /M2 \S+ (\d+)\/(\d+)/) || [])[1] || 0);
      return { r, count: rs.length, m2, ans, bad, m1: raw("m1"), m2raw: raw("m2"), est: window.SATSCALE ? SATSCALE.section(sec, m2 === "m2h", r.a) : null };
    }).sort((x, y) => x.r.name.localeCompare(y.r.name, "ru"));
  }
  const tnum = (m) => +m.id.replace(/\D/g, "");   // the five groups of mock.html, in its order
  const TGROUPS = [["Полные тесты 1–4", (m) => !m.group && !m.only && tnum(m) <= 4], ["Reading and Writing 5–8", (m) => !m.group && m.only === "rw"],
    ["Полные тесты 9–12", (m) => !m.group && !m.only && tnum(m) > 4], ["Официальные вопросы College Board", (m) => m.group === "official"],
    ["Прогнозы", (m) => m.group === "prediction"], ["Другие", (m) => m.group && !["official", "prediction"].includes(m.group)]];
  async function tests() {
    const box = $("v-tests"), M = (D.mocks && D.mocks.mocks) || [], T = D.t;
    if (!M.length) { box.innerHTML = '<h2>Пробные тесты</h2><p class="hint">Не удалось загрузить тесты. Обновите страницу.</p>'; return; }
    if (!T.mid) { const last = [...D.rows].reverse().find((r) => r.kind === "P"); T.mid = last ? last.lesson.split("·")[0] : M[0].id; }
    const mock = M.find((m) => m.id === T.mid) || M[0]; T.mid = mock.id;
    if (!mock.sections.some((s) => s.k === T.sec)) T.sec = mock.sections[0].k;
    const S = mock.sections.find((s) => s.k === T.sec), runs = mockRuns(mock.id, S.k);
    const solo = !!T.who && !T.others, shown = solo ? runs.filter((x) => x.r.key === T.who) : runs;   // one student: nobody else's answers, names or scores on screen
    const soloName = solo ? ((D.students.find((x) => x.key === T.who) || {}).name || "") : "";
    const took = (mod) => shown.filter((x) => mod === "m1" || x.m2 === mod);
    if (!MODN[T.mod]) T.mod = "m1";
    const nSub = (m) => new Set(D.rows.filter((r) => r.lesson.split("·")[0] === m.id).map((r) => r.key)).size;
    let html = `${solo ? '<div class="row" style="margin-top:0"><button class="btn ghost" id="t-back">← Карточка ученика</button></div>' : ""}<h2>Пробные тесты${solo ? ` · ${esc(soloName)}` : ""}</h2><p class="hint">${solo ? "Показаны только ответы этого ученика: ответы, имена и баллы других учеников скрыты. Удобно разбирать ошибки вместе с учеником." : "Все вопросы каждого теста с верным ответом и разбором. Под каждым вопросом — что выбрал каждый ученик (последняя сдача этого раздела). Число на кнопке теста — сколько учеников его сдали."}</p>
      <div id="t-mock">${TGROUPS.map(([cap, f]) => { const ms = M.filter(f); return ms.length ? `<div class="tgrp"><span class="label">${cap}</span><div class="chips" role="group" aria-label="${cap}">${ms.map((m) => { const k = nSub(m);
        return `<button class="chip" data-m="${m.id}" aria-pressed="${m.id === mock.id}">${m.id}${k && !solo ? ` · ${k}` : ""}</button>`; }).join("")}</div></div>` : ""; }).join("")}</div>
      <div class="chips" id="t-sec" style="margin-top:8px">${mock.sections.map((s) => `<button class="chip" data-s="${s.k}" aria-pressed="${s.k === S.k}">${esc(s.name)}</button>`).join("")}</div>`;
    if (shown.length) {
      html += `<h2>${solo ? "Результат ученика" : `Кто сдал · ${runs.length}`}</h2>` + table(["Ученик", "Когда", "Модуль 1", "Модуль 2", "Верно", "Примерный балл", "Сдач"], shown.map((x) => ({ k: x.r.key,
        cells: [`<b>${esc(x.r.name)}</b>`, when(x.r.ts), `${x.m1}/${S.n}`, `${x.m2 === "m2h" ? "сложный" : "лёгкий"} · ${x.m2raw}/${S.n}`, `${x.r.a}/${x.r.b} · ${pct(x.r.pct)}`, x.est ? `≈ ${x.est}` : "—", x.count] })), { click: true, num: [2, 4, 5, 6] });
    } else html += `<p class="hint" style="margin-top:18px">${solo ? `${esc(soloName)} пока не сдавал(а) этот раздел.` : "Этот раздел пока никто не сдал."} Вопросы и разборы ниже всё равно доступны.</p>`;
    html += `<div class="chips" id="t-mod" style="margin-top:22px">${Object.keys(MODN).map((m) => `<button class="chip" data-d="${m}" aria-pressed="${m === T.mod}">${MODN[m]}${runs.length && !solo ? ` · ${took(m).length}` : ""}</button>`).join("")}</div>
      <div class="row t-filters"><select id="t-who" aria-label="Ученик"><option value="">Все ученики</option>${runs.map((x) => `<option value="${esc(x.r.key)}"${x.r.key === T.who ? " selected" : ""}>${esc(x.r.name)}</option>`).join("")}</select>
      <label class="onlybad"><input type="checkbox" id="t-bad"${T.bad ? " checked" : ""}> Только вопросы с ошибками</label>
      <label class="onlybad"><input type="checkbox" id="t-sort"${T.sort ? " checked" : ""}> Сначала самые трудные</label>
      ${T.who ? `<label class="onlybad"><input type="checkbox" id="t-oth"${T.others ? " checked" : ""}> Показать других учеников</label>` : ""}
      <button class="btn ghost" id="t-open">Раскрыть все</button></div><div id="t-list"><p class="hint">Загружаю вопросы…</p></div>`;
    box.innerHTML = html;
    box.querySelectorAll("#t-mock .chip").forEach((b) => (b.onclick = () => { T.mid = b.dataset.m; T.mod = "m1"; T.who = ""; render(); }));
    box.querySelectorAll("#t-sec .chip").forEach((b) => (b.onclick = () => { T.sec = b.dataset.s; T.mod = "m1"; render(); }));
    box.querySelectorAll("#t-mod .chip").forEach((b) => (b.onclick = () => { T.mod = b.dataset.d; render(); }));
    box.querySelectorAll("tr.click").forEach((tr) => (tr.onclick = () => { T.who = tr.dataset.k; const x = runs.find((y) => y.r.key === T.who); if (x && T.mod !== "m1" && T.mod !== x.m2) T.mod = x.m2; render(); }));
    $("t-who").onchange = () => { T.who = $("t-who").value; const x = runs.find((y) => y.r.key === T.who); if (x && T.mod !== "m1" && T.mod !== x.m2) T.mod = x.m2; render(); };
    $("t-bad").onchange = () => { T.bad = $("t-bad").checked; render(); };
    $("t-sort").onchange = () => { T.sort = $("t-sort").checked; render(); };
    if ($("t-oth")) $("t-oth").onchange = () => { T.others = $("t-oth").checked; render(); };
    if ($("t-back")) $("t-back").onclick = () => { D.view = "students"; D.student = T.who; render(); };
    let b;
    try { b = await bundleT(S.b); } catch (e) { $("t-list").innerHTML = '<p class="hint">Не удалось загрузить вопросы этого теста.</p>'; return; }
    if (D.view !== "tests" || !$("t-list")) return;   // the view changed while the questions were loading
    const who = took(T.mod), focus = runs.find((x) => x.r.key === T.who);
    let qs = b.mods[T.mod].map((q) => {
      const ch = who.map((x) => ({ x, a: x.ans[`${T.mod}.${q.n}`] || "", ok: !x.bad.has(`${T.mod === "m1" ? 1 : 2}.${q.n}`) }));
      return { q, ch, right: ch.filter((c) => c.ok).length };
    });
    if (T.bad) qs = qs.filter((o) => o.right < o.ch.length || (focus && o.ch.some((c) => c.x === focus && !c.ok)));
    if (focus && T.bad) qs = qs.filter((o) => o.ch.some((c) => c.x === focus && !c.ok));
    if (T.sort) qs.sort((u, v) => (u.ch.length ? u.right / u.ch.length : 1) - (v.ch.length ? v.right / v.ch.length : 1) || u.q.n - v.q.n);
    if (focus && T.mod !== "m1" && focus.m2 !== T.mod) { $("t-list").innerHTML = `<p class="hint" style="margin-top:14px">${esc(focus.r.name)} решал(а) ${MODN[focus.m2].toLowerCase()}, а не этот модуль.</p>`; }
    else $("t-list").innerHTML = qs.length ? qs.map(({ q, ch, right }) => {
      const mine = focus && ch.find((c) => c.x === focus);
      const tag = (c) => `<span class="who ${c.ok ? "ok" : "no"}">${esc(c.x.r.name)}: <b>${esc(c.a || "—")}</b></span>`;
      const opts = q.t === "mc" ? q.opts.map((o, k) => { const L = "ABCD"[k], by = ch.filter((c) => c.a === L);
        return `<div class="ropt${L === q.ans ? " right" : ""}${mine && mine.a === L ? " mine" : ""}"><span class="lt">${L}</span><span class="qhtml">${o}</span><span class="tg">${solo ? [L === q.ans ? "верный" : "", by.length ? "ответ ученика" : ""].filter(Boolean).join(" · ") : `${L === q.ans ? "верный · " : ""}${by.length}${by.length ? ` · ${by.map((c) => esc(c.x.r.name)).join(", ")}` : ""}`}</span></div>`; }).join("")
        : `<p class="hint">Ответ вводится. Принимаются: ${esc(q.acc.join(", "))}.${ch.length ? ` Ответы учеников: ${ch.map(tag).join(" ")}` : ""}</p>`;
      return `<details class="rv tq${right < ch.length ? " bad" : ""}"><summary><span class="mk ${!ch.length ? "" : right === ch.length ? "ok" : "no"}">${q.n}</span>
        <span class="tq-s"><b>${esc(q.sk)}</b> <small>· ${DOMN[q.dom] || q.dom} · ${DIFN[q.d] || q.d}${q.own ? " · авторский" : " · College Board"} · ответ ${esc(q.ans)}</small>
        <br><small>${solo ? (mine ? `ответ ученика: ${esc(mine.a || "без ответа")} ${mine.ok ? "✓ верно" : "✗ ошибка"}` : "ученик не решал этот модуль") : ch.length ? `верно ${right} из ${ch.length}${mine ? ` · ${esc(focus.r.name)}: ${esc(mine.a || "без ответа")} ${mine.ok ? "✓" : "✗"}` : ""}` : "никто не решал"}</small>
        ${!focus && ch.some((c) => !c.ok) ? `<span class="whos">${ch.filter((c) => !c.ok).map(tag).join("")}</span>` : ""}</span></summary>
        <div class="rbody">${q.stim ? `<div class="qhtml">${q.stim}</div>` : ""}<div class="qhtml">${q.stem}</div>${opts}
        <div class="sv-expl"><span class="label">${q.own ? "Разбор nurzycom · авторский вопрос" : "Объяснение College Board"}</span><div class="qhtml">${q.rat}</div>${q.dz || ""}</div></div></details>`;
    }).join("") : '<p class="hint" style="margin-top:14px">Нет вопросов под этот фильтр.</p>';
    $("t-open").onclick = () => { const all = [...document.querySelectorAll("#t-list details")], open = all.some((d) => !d.open); all.forEach((d) => (d.open = open)); $("t-open").textContent = open ? "Свернуть все" : "Раскрыть все"; };
  }
  function lessons() {
    const all = D.lessons.map((l) => l.tag).concat(D.sets.map((x) => x.id), D.texts.map((x) => x.id), [...new Set(D.rows.filter((r) => r.kind === "P").map((r) => r.lesson))].sort());
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
      html += `<h2>${esc(D.lesson[0] === "P" ? mockName(D.lesson).replace("·", " · ") : whatOf(rows[0] || { kind: D.lesson[0], lesson: D.lesson }))}</h2>` + table(["Ученик", "Лучший", "Сдач", "Последняя"], D.students.filter((s) => rows.some((r) => r.key === s.key)).map((s) => { const rs = rows.filter((r) => r.key === s.key), b = best(rs);
        return { k: s.key, cells: [esc(s.name), `${b.a}/${b.b} · ${pct(b.pct)}`, rs.length, when(rs[rs.length - 1].ts)] }; }), { num: [1, 2] });
      const qs = {}; rows.forEach((r) => r.wrong.forEach((n) => (qs[n] = (qs[n] || 0) + 1)));
      html += `<h2>Чаще всего ошибаются</h2><div id="les-miss"></div>`;
      $("v-lessons").innerHTML = html; hbars($("les-miss"), Object.entries(qs).map(([n, k]) => ({ label: /\./.test(n) ? `Модуль ${n.split(".")[0]} · вопрос ${n.split(".")[1]}` : `Вопрос ${n}`, value: (100 * k) / rows.length, n: rows.length })).sort((a, b) => b.value - a.value).slice(0, 10));
    }
    $("les-pick").querySelectorAll(".chip").forEach((b) => (b.onclick = () => { D.lesson = b.dataset.t; render(); }));
  }
  // ---------- the whole group (2026-11-09, Nurassyl: «analysis of the group, not individuals: the most difficult questions and where people miss
  // very much»). Every student's FIRST submission of each homework part and test section counts once; no names are shown.
  const GA = { sec: "all", days: 0, min: 3, top: 15, kind: "all", gid: null };
  // the cabinet's groups (2026-11-09, Nurassyl: «the group of students who I conduct the group lessons to; I assigned students to the
  // group»): members are account ids; their account names are matched to the form's merged names (FORMKIT.key, same rule as the
  // cabinet's import). Needs the admin key in this browser, like the cabinet.
  const GCOLT = { blue: "#1F4FA3", green: "#2B6E2F", amber: "#8A5300", violet: "#6A3D9E", teal: "#165F6E", rose: "#9E2456" };
  async function gaGroups() {
    if (D.cbg) return D.cbg;
    if (!SITE.adminKey()) return (D.cbg = { err: "nokey", groups: [] });
    const r = await SITE.api("admin/users").catch(() => ({ status: 0 }));
    if (!r.ok) return (D.cbg = { err: "users", groups: [] });
    const users = {}; for (const x of r.data.users) { try { users[x.id] = await SITE.nameOf(x.n); } catch (e) { /* unreadable */ } }
    let saved = null;
    const g = await SITE.api("admin/groups").catch(() => ({ status: 0 }));
    if (g.ok) { try { saved = await SITE.unsealBlob(g.data.data); } catch (e) { /* use the local copy below */ } }
    try {
      let local = JSON.parse(store("cb_groups"));
      if (Array.isArray(local)) local = { groups: local };
      if (Array.isArray(local?.groups) && (!Array.isArray(saved?.groups) || local.at > saved.at)) saved = local;
    } catch (e) { /* ignore an unreadable local copy */ }
    const archived = new Set(Array.isArray(saved?.archived) ? saved.archived : []);
    const groups = (saved?.groups || []).filter((x) => x && x.id && Array.isArray(x.members)).map((x) => {
      const names = x.members.filter((id) => !archived.has(id)).map((id) => users[id]?.name).filter(Boolean);
      return { id: String(x.id), name: String(x.name || "Группа"), kind: x.kind === "solo" ? "solo" : "group", color: GCOLT[x.color] || GCOLT.blue, names, keys: new Set(names.map((n) => FORMKIT.key(n)).filter(Boolean)) };
    }).filter((x) => x.names.length);
    return (D.cbg = { groups });
  }
  const WORK = (r, P) => (r.kind === "P" ? "Пробные тесты" : "DUA".includes(r.kind) ? "Наборы «Полезное»" : !P ? "Другое" : /Холодный/.test(P.title) ? "Холодный старт" : /Финальный/.test(P.title) ? "Финальный тест" : /Дополнительное/.test(P.title) ? "Дополнительное ДЗ" : /Домашнее/.test(P.title) ? "Домашнее задание" : "Практика на уроке");
  // opt.keys: only these students and no filters (one student's review on the lesson account); otherwise the «Анализ группы» filters
  async function gaCollect(opt) {
    const o = opt || {}, now = Date.now(), seen = new Set(), Q = {};
    const grp = !o.keys && GA.gid && D.cbg && D.cbg.groups.find((g) => g.id === GA.gid);
    const days = o.keys ? 0 : GA.days, secF = o.keys ? "all" : GA.sec, kindF = o.keys ? "all" : GA.kind;
    const rows = D.rows.filter((r) => (!days || (r.ts && now - r.ts < days * DAY)) && "VMDUAP".includes(r.kind) && (o.keys ? o.keys.has(r.key) : !grp || grp.keys.has(r.key)));
    for (const r of rows) {
      const mock = r.kind === "P", sec = mock ? (/·Math$/.test(r.lesson) ? "math" : "rw") : r.lesson[0] === "V" || r.lesson[0] === "A" ? "rw" : "math";
      if (secF !== "all" && secF !== sec) continue;
      if (kindF === "hw" && mock || kindF === "mk" && !mock) continue;
      const id = `${r.key}|${r.lesson}|${r.pid}`; if (seen.has(id) || r.attempt > 1) continue; seen.add(id);
      const bad = new Set(r.wrong.map(String)), pick = {}, TR = {}; r.answers.forEach((a) => { pick[String(a.n)] = a.tries[0] || ""; TR[String(a.n)] = a.tries; });
      if (mock) {
        const mid = r.lesson.split("·")[0], M = ((D.mocks && D.mocks.mocks) || []).find((m) => m.id === mid), S = M && M.sections.find((s) => s.k === sec); if (!S) continue;
        let b; try { b = await bundleT(S.b); } catch (e) { continue; }
        const m2 = /M2 сложный/.test(r.part) ? "m2h" : "m2e";
        Object.keys(pick).forEach((k) => { const [mn, qn] = k.split("."); const mod = mn === "1" ? "m1" : m2, q = (b.mods[mod] || [])[+qn - 1]; if (!q) return;
          const st = (Q[`${mid}.${sec}.${mod}.${qn}`] = Q[`${mid}.${sec}.${mod}.${qn}`] || { id: `${mid}.${sec}.${mod}.${qn}`, part: `${mid}.${sec}`, plabel: `${mockName(mid)} · ${S.name}`, src: { b: S.b, mod, i: +qn - 1 }, title: `${mockName(mid)} · ${S.name} · ${MODN[mod]} · №${qn}`, sec, sk: q.sk, d: q.d, work: "Пробные тесты", n: 0, wrong: 0, picks: {}, who: new Set() });
          st.n++; st.who.add(r.key); st.ts = Math.max(st.ts || 0, +r.ts || 0); if (o.keys) st.mine = TR[k] || []; if (bad.has(k)) { st.wrong++; const p = pick[k] || "—"; st.picks[p] = (st.picks[p] || 0) + 1; } });
      } else {
        const P = partOf(r.lesson, r.pid); if (!P) continue;
        P.q.forEach((q) => { const k = String(q.n); if (!(k in pick) && !bad.has(k)) return;
          const st = (Q[`${r.lesson}.${r.pid}.${k}`] = Q[`${r.lesson}.${r.pid}.${k}`] || { id: `${r.lesson}.${r.pid}.${k}`, part: `${r.lesson}.${r.pid}`, plabel: `${(lessonOf(r.lesson) || {}).title || r.lesson} · ${P.title}`, src: { b: P.b, n: q.n }, title: `${r.lesson} · ${P.title} · №${k}`, sec, sk: q.sk, d: DIFN[q.d] ? q.d : "", work: WORK(r, P), n: 0, wrong: 0, picks: {}, who: new Set() });
          st.n++; st.who.add(r.key); st.ts = Math.max(st.ts || 0, +r.ts || 0); if (o.keys) st.mine = TR[k] || []; if (bad.has(k)) { st.wrong++; const p = pick[k] || "—"; st.picks[p] = (st.picks[p] || 0) + 1; } });
      }
    }
    return Object.values(Q);
  }
  const trapOf = (q) => { const e = Object.entries(q.picks).filter(([o]) => /^[A-D]$/.test(o)).sort((a, b) => b[1] - a[1])[0]; return e && e[1] >= 2 && e[1] / q.wrong >= 0.6 ? e : null; };
  async function groupView() {
    const box = $("v-group");
    box.innerHTML = '<h2>Анализ группы</h2><p class="hint">Загружаю группы из кабинета и считаю ответы…</p>';
    const CB = await gaGroups(); if (D.view !== "group") return;
    if (GA.gid === null) { const first = CB.groups.find((g) => g.kind === "group" && D.students.some((st) => g.keys.has(st.key))); GA.gid = first ? first.id : ""; }
    if (GA.gid && !CB.groups.some((g) => g.id === GA.gid)) GA.gid = "";
    const all = await gaCollect(); if (D.view !== "group") return;
    const grp = CB.groups.find((g) => g.id === GA.gid);
    const err = (x) => (x.n ? (100 * x.wrong) / x.n : 0);
    const agg = (key) => { const g = {}; all.forEach((q) => { const k = key(q); if (!k) return; const s = (g[k] = g[k] || { n: 0, wrong: 0, q: 0 }); s.n += q.n; s.wrong += q.wrong; s.q++; });
      return Object.entries(g).map(([label, s]) => ({ label, n: s.n, value: err(s), q: s.q })).sort((a, b) => b.value - a.value); };
    const tot = (s) => all.filter((q) => q.sec === s).reduce((a, q) => [a[0] + q.n, a[1] + q.wrong], [0, 0]);
    const rw = tot("rw"), ma = tot("math"), who = new Set(all.flatMap((q) => [...q.who]));
    const ranked = all.filter((q) => q.who.size >= GA.min).sort((a, b) => err(b) - err(a) || b.n - a.n), hard = ranked.slice(0, GA.top);
    const traps = ranked.filter(trapOf).sort((a, b) => trapOf(b)[1] - trapOf(a)[1]).slice(0, 10);
    const skills = agg((q) => q.sk).filter((s) => s.n >= 4);
    const chips = (id, cur, list) => `<div class="chips" id="${id}">${list.map(([v, t]) => `<button class="chip" data-x="${v}" aria-pressed="${String(v) === String(cur)}">${t}</button>`).join("")}</div>`;
    const gchips = `<div class="chips" id="ga-grp" role="group" aria-label="Группа из кабинета"><button class="chip" data-x="" aria-pressed="${!GA.gid}">Все ученики</button>${CB.groups.map((g) => `<button class="chip" data-x="${esc(g.id)}" aria-pressed="${g.id === GA.gid}"><i aria-hidden="true" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${g.color};margin-right:7px"></i>${esc(g.name)}<small style="opacity:.7"> · ${g.names.length}</small></button>`).join("")}</div>`;
    const found = grp ? grp.names.filter((n) => D.students.some((st) => st.key === FORMKIT.key(n))) : [], lost = grp ? grp.names.filter((n) => !found.includes(n)) : [];
    const gnote = CB.err === "nokey" ? '<p class="hint">Группы из кабинета появятся здесь в браузере, где сохранён ключ администратора (раздел «Аккаунты учеников · регистрация»). Пока показаны все ученики.</p>'
      : CB.err ? '<p class="hint">Не удалось загрузить группы из кабинета. Пока показаны все ученики; обновите страницу позже.</p>'
      : !CB.groups.length ? '<p class="hint">В кабинете пока нет групп с учениками. Показаны все ученики.</p>'
      : grp ? `<p class="hint">В группе «${esc(grp.name)}» ${grp.names.length} ${pl(grp.names.length, "ученик", "ученика", "учеников")}; в ответах формы найдены: ${found.length ? esc(found.join(", ")) : "никто"}.${lost.length ? ` Нет ответов в форме: ${esc(lost.join(", "))} (не сдавали или подписывались другим именем: объедините написания на вкладке «Ученики»).` : ""}</p>` : "";
    let html = `<h2>Анализ группы</h2>${gchips}${gnote}<p class="hint">Вся группа вместе, без имён. Учитывается только первая сдача каждой части и каждого раздела пробного теста (первая попытка), чтобы повторные сдачи не смягчали картину. Сложные наборы X и тексты T сюда не входят.</p>
      <div class="row t-filters">${chips("ga-sec", GA.sec, [["all", "Всё"], ["rw", "Reading and Writing"], ["math", "Math"]])}${chips("ga-kind", GA.kind, [["all", "ДЗ и тесты"], ["hw", "Только уроки и ДЗ"], ["mk", "Только пробные тесты"]])}
      ${chips("ga-days", GA.days, [[0, "Всё время"], [30, "30 дней"], [14, "14 дней"]])}${chips("ga-min", GA.min, [[2, "от 2 учеников"], [3, "от 3"], [5, "от 5"]])}</div>`;
    html += kpis([["Учеников", who.size, "сдавали за выбранный период"], ["Ответов", rw[0] + ma[0], `${all.length} разных вопросов`],
      ["Ошибок · RW", rw[0] ? pct((100 * rw[1]) / rw[0]) : "—", `${rw[1]} из ${rw[0]} с первой попытки`], ["Ошибок · Math", ma[0] ? pct((100 * ma[1]) / ma[0]) : "—", `${ma[1]} из ${ma[0]} с первой попытки`]]);
    if (!all.length) { box.innerHTML = html + '<p class="hint">Нет сдач для этого выбора.</p>'; gaBind(box); return; }
    const top = skills.filter((s) => s.n >= 8).slice(0, 3);
    html += `<div id="ga-rv"></div><h2>1. Самые трудные вопросы</h2><p class="hint">Доля учеников, ошибившихся с первой попытки. В список входят вопросы, которые решили не меньше ${GA.min} учеников (${ranked.length} таких). Откройте вопрос, чтобы увидеть текст, верный ответ и что выбирали.</p><div id="ga-hard">`;
    html += hard.map((q, i) => { const t = trapOf(q), e = err(q);
      return `<details class="rv tq ga-q" data-i="${all.indexOf(q)}"><summary><span class="mk${e >= 50 ? " no" : ""}">${i + 1}</span><span class="tq-s"><b>${esc(q.title)}</b><br><small>${esc(q.sk || "—")}${q.d ? " · " + DIFN[q.d] : ""} · ${esc(q.work)}${t ? ` · <span style="color:var(--oxide,#A63328)">общая ловушка ${t[0]}</span>` : ""}</small></span>
        <span class="rate">${pct(e)}<small>${q.wrong} из ${q.n}</small></span></summary><div class="rbody"><p class="hint">Загружаю…</p></div></details>`; }).join("") + (hard.length ? "" : '<p class="hint">Пока ни один вопрос не решили столько учеников. Выберите «от 2 учеников».</p>') + "</div>";
    html += `<h2>2. Где группа ошибается больше всего</h2><h3>По навыкам</h3><p class="hint">Доля ошибок с первой попытки · число ответов.</p><div id="ga-sk"></div>`;
    html += `<h3>По доменам</h3><div id="ga-dom"></div><h3>По типу работы</h3><div id="ga-work"></div><h3>По урокам и тестам</h3><p class="hint">Уроки и тесты, где ответов не меньше 10.</p><div id="ga-les"></div>`;
    const difs = agg((q) => (q.d ? `${q.sec === "rw" ? "Reading and Writing" : "Math"} · ${DIFN[q.d]}` : null));
    if (difs.length) html += `<h3>По указанному уровню сложности</h3><div id="ga-dif"></div>`;
    html += `<h3>Общие ловушки</h3><p class="hint">Вопросы, где 60% и больше ошибившихся выбрали один и тот же неверный вариант. Обычно за этим стоит одна и та же ошибка мышления: такие вопросы стоит разобрать на уроке.</p>` +
      (traps.length ? table(["Вопрос", "Навык", "Ловушка", "Выбрали"], traps.map((q) => { const t = trapOf(q); return { k: "", cells: [esc(q.title), esc(q.sk || "—"), `<b>${t[0]}</b>`, `${t[1]} из ${q.wrong}`] }; }), { num: [3] }) : '<p class="hint">Таких вопросов пока нет.</p>');
    box.innerHTML = html;
    const DOMSK = { "Words in Context": "Craft and Structure", "Text Structure and Purpose": "Craft and Structure", "Cross-Text Connections": "Craft and Structure", "Central Ideas and Details": "Information and Ideas",
      "Command of Evidence": "Information and Ideas", "Inferences": "Information and Ideas", "Boundaries": "Standard English Conventions", "Form, Structure, and Sense": "Standard English Conventions", "Transitions": "Expression of Ideas", "Rhetorical Synthesis": "Expression of Ideas" };
    const MDOM = (s) => (/^Linear|^Systems/.test(s) ? "Algebra" : /^Equivalent|^Nonlinear/.test(s) ? "Advanced Math" : /^Area|^Lines|^Right|^Circles/.test(s) ? "Geometry and Trigonometry" : s ? "Problem-Solving and Data Analysis" : null);
    hbars($("ga-sk"), skills.slice(0, 14).map((s) => ({ label: s.label, value: s.value, n: s.n })));
    hbars($("ga-dom"), agg((q) => (q.sec === "rw" ? DOMSK[q.sk] : MDOM(q.sk || ""))).map((s) => ({ label: s.label, value: s.value, n: s.n })));
    hbars($("ga-work"), agg((q) => q.work).map((s) => ({ label: s.label, value: s.value, n: s.n })));
    hbars($("ga-les"), agg((q) => q.title.split(" · №")[0].replace(/ · (Модуль|Reading|Math).*$/, "")).filter((s) => s.n >= 10).slice(0, 12).map((s) => ({ label: s.label, value: s.value, n: s.n })));
    if (difs.length) hbars($("ga-dif"), difs.map((s) => ({ label: s.label, value: s.value, n: s.n })));
    box.querySelectorAll(".ga-q").forEach((d) => d.addEventListener("toggle", () => d.open && gaOpen(d, all[+d.dataset.i])));
    rvMount($("ga-rv"), { slot: "ga", mode: "group", title: grp ? grp.name : "Все ученики", all, ranked, top, keys: grp ? grp.keys : null, names: grp ? grp.names : D.students.map((x) => x.name),
      note: [{ all: "", rw: "Reading and Writing", math: "Math" }[GA.sec], { all: "", hw: "уроки и ДЗ", mk: "пробные тесты" }[GA.kind], GA.days ? `за ${GA.days} дней` : ""].filter(Boolean).join(" · ") });
    gaBind(box);
  }
  // ---------- «Разобрать на уроке» (2026-11-16, Nurassyl: the class's mistakes on the shared screen, then «for individual students too
  // … let me choose which lessons to review»): pick lessons and tests, then the questions with mistakes go to the lesson account
  // (login «lesson», lesson.js → lsmist.js) as key «ls_m» of its synced copy: up to 8 reviews, newest first. A group review holds
  // counts and the wrong options chosen, no names; a one-student review holds that student's own tries and the name.
  D.rvSel = D.rvSel || {};
  const rvFilters = new Map();
  const errorShare = (x) => x.wrong / x.n;
  const byShare = (a, b) => errorShare(b) - errorShare(a) || b.wrong - a.wrong;
  const byWrong = (a, b) => b.wrong - a.wrong || byShare(a, b);
  const difficulty = { H: 3, M: 2, E: 1 };
  const qOrder = (a, b) => String(a.id).localeCompare(String(b.id), "en", { numeric: true });
  function rvParts(all) {
    const parts = new Map();
    for (const q of all) {
      if (!parts.has(q.part)) parts.set(q.part, { k: q.part, label: q.plabel, work: q.work, ts: 0, nq: 0, wrong: 0, n: 0, peak: 0 });
      const p = parts.get(q.part);
      p.n += q.n;
      p.wrong += q.wrong;
      p.nq += Number(q.wrong > 0);
      p.peak = Math.max(p.peak, q.wrong);
      if (q.wrong) p.ts = Math.max(p.ts, q.ts || 0);
    }
    return [...parts.values()].filter((p) => p.wrong).sort((a, b) => b.ts - a.ts || a.label.localeCompare(b.label, "ru", { numeric: true }));
  }
  function rvPick(c) {
    const sel = D.rvSel[c.key] || new Set(), wrong = c.all.filter((q) => q.wrong && (!sel.size || sel.has(q.part)));
    const sort = rvFilters.get(c.key)?.questions;
    const compare = sort === "wrong" ? byWrong : sort === "level" ? (a, b) => (difficulty[b.d] || 0) - (difficulty[a.d] || 0) || byShare(a, b) : byShare;
    if (c.mode === "group") return (sel.size ? wrong : c.ranked.filter((q) => q.wrong)).sort((a, b) => compare(a, b) || qOrder(a, b)).slice(0, sel.size ? 40 : GA.top);
    if (sort) return wrong.sort((a, b) => compare(a, b) || qOrder(a, b)).slice(0, 60);
    const ts = {}; rvParts(c.all).forEach((p) => (ts[p.k] = p.ts));
    return wrong.sort((a, b) => (ts[b.part] || 0) - (ts[a.part] || 0) || qOrder(a, b)).slice(0, 60);
  }
  function rvSummary(c) {
    if (c.mode !== "group" || !c.ranked.length) return "";
    const weak = rvParts(c.ranked).sort(byShare)[0];
    const impact = c.ranked.filter((q) => q.wrong).sort(byWrong)[0];
    if (!weak || !impact) return "";
    const trap = trapOf(impact);
    return `<div class="rv-summary">
      <section><span class="label">Наибольшая доля ошибок в задании</span><b>${pct(100 * errorShare(weak))}</b><p>${esc(weak.label)} · ${weak.wrong} из ${weak.n} ответов</p><button class="chip" type="button" data-rvquick="${esc(weak.k)}">Выбрать для урока</button></section>
      <section><span class="label">Больше всего учеников ошиблись</span><b>${impact.wrong} из ${impact.n}</b><p>${esc(impact.title)}</p><button class="chip" type="button" data-rvquick="${esc(impact.part)}">Выбрать это задание</button></section>
      <section><span class="label">С чего начать разбор</span><p>${trap ? `На вопросе «${esc(impact.title)}» вариант ${esc(trap[0])} выбрали ${trap[1]} из ${impact.wrong} ошибившихся. Разберите, почему этот вариант кажется подходящим.` : `Начните с вопроса «${esc(impact.title)}» и попросите учеников объяснить, почему они выбрали свой вариант.`}</p>
      ${c.top[0] ? `<p>Затем повторите ${esc(c.top[0].label)} · ${pct(c.top[0].value)} ошибок по ${c.top[0].n} ответам.</p>` : ""}</section>
    </div>`;
  }
  function rvMount(box, c) {
    if (!box) return;
    c.key = `${c.mode}:${c.title}`; const sel = (D.rvSel[c.key] = D.rvSel[c.key] || new Set()), parts = rvParts(c.all), id = c.slot;
    if (!parts.length) { box.innerHTML = ""; return; }
    const available = new Set(parts.map((p) => p.k));
    for (const k of sel) if (!available.has(k)) sel.delete(k);
    const filters = rvFilters.get(c.key) || { search: "", parts: "recent", questions: "" };
    rvFilters.set(c.key, filters);
    const day = (ts) => (ts ? new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : "");
    box.innerHTML = `<div class="card rv-card"><h2>Разбор на уроке</h2>
      ${rvSummary(c)}
      <h3>Выберите задания</h3>
      <div class="rv-controls">
        <label>Поиск задания<input type="search" data-rvsearch placeholder="Урок, тема или код"></label>
        <label>Сортировка заданий<select data-rvparts><option value="recent">Сначала недавние</option><option value="share">По доле ошибок</option><option value="wrong">По числу ошибок</option><option value="peak">По максимуму ошибившихся на вопросе</option></select></label>
        <label>Порядок вопросов<select data-rvquestions><option value="">${c.mode === "group" ? "По доле ошибившихся" : "По порядку заданий"}</option><option value="wrong">По числу ошибившихся</option><option value="level">По уровню сложности, если указан</option></select></label>
      </div>
      <div class="rv-parts" role="group" aria-label="Уроки и тесты для разбора"></div>
      <p class="rv-all"><button type="button" class="tlink" data-rvall="1">Выбрать найденные</button> · <button type="button" class="tlink" data-rvall="0">Снять выбор</button></p>
      <p class="hint" data-rvcount role="status"></p>
      ${c.mode === "group" && SITE.adminKey() && c.all.some((q) => q.sec === "rw") ? '<section class="rv-ai" data-vl></section>' : ""}
      <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><button class="btn" type="button" id="${id}-prep">Подготовить урок <span class="arr">→</span></button><button class="btn ghost" type="button" id="${id}-send"></button></div>
      <p class="hint">«Подготовить урок» автоматически подбирает свежие ошибки. Отправленный разбор появится в «Ошибках класса».</p>
      <span class="hint" id="${id}-send-st" role="status"></span><div class="rv-note" id="${id}-note"></div>
      <details class="rv-preview"><summary>Вопросы для отправки</summary><div data-rvpreview></div></details></div>`;
    const btn = $(`${id}-send`), list = box.querySelector(".rv-parts"), preview = box.querySelector("[data-rvpreview]");
    const count = box.querySelector("[data-rvcount]"), search = box.querySelector("[data-rvsearch]");
    const partSort = box.querySelector("[data-rvparts]"), questionSort = box.querySelector("[data-rvquestions]");
    search.value = filters.search;
    partSort.value = filters.parts;
    questionSort.value = filters.questions;
    function label() {
      const qs = rvPick(c);
      count.textContent = sel.size ? `Выбрано заданий · ${sel.size}. К отправке · ${qs.length}.` : `Автоподбор · ${qs.length} ${pl(qs.length, "вопрос", "вопроса", "вопросов")}.`;
      btn.textContent = qs.length ? "Показать на уроке →" : "Нет вопросов с ошибками";
      btn.disabled = !qs.length;
      preview.innerHTML = qs.map((q, i) => `<details class="rv tq" data-rvq="${i}"><summary><span class="tq-s"><b>${esc(q.title)}</b><br><small>Ошиблись ${q.wrong} из ${q.n} · ${pct(100 * errorShare(q))}${DIFN[q.d] ? " · " + DIFN[q.d] : ""}</small></span></summary><div class="rbody"></div></details>`).join("") || '<p class="hint">Нет вопросов с ошибками.</p>';
      preview.querySelectorAll("[data-rvq]").forEach((d) => d.addEventListener("toggle", () => { if (d.open) gaOpen(d, qs[+d.dataset.rvq]); }));
    }
    function visibleParts() {
      const term = filters.search.trim().toLowerCase();
      const matched = parts.filter((p) => `${p.label} ${p.k}`.toLowerCase().includes(term));
      if (filters.parts === "share") matched.sort(byShare);
      else if (filters.parts === "wrong") matched.sort(byWrong);
      else if (filters.parts === "peak") matched.sort((a, b) => b.peak - a.peak || byWrong(a, b));
      return matched;
    }
    function renderParts() {
      list.innerHTML = visibleParts().map((p) => `<label class="rv-p"><input type="checkbox" data-rvp="${esc(p.k)}"${sel.has(p.k) ? " checked" : ""}><span>${esc(p.label)}</span><small>${pct(100 * errorShare(p))} ошибок · ${p.wrong} из ${p.n} ответов · до ${p.peak} ошибившихся на одном вопросе${p.ts ? " · " + day(p.ts) : ""}</small></label>`).join("") || '<p class="hint">По этому запросу заданий нет.</p>';
    }
    search.oninput = () => { filters.search = search.value; renderParts(); };
    partSort.onchange = () => { filters.parts = partSort.value; renderParts(); };
    questionSort.onchange = () => { filters.questions = questionSort.value; label(); };
    list.onchange = ({ target }) => { if (!target.matches("[data-rvp]")) return; if (target.checked) sel.add(target.dataset.rvp); else sel.delete(target.dataset.rvp); label(); };
    box.querySelectorAll("[data-rvall]").forEach((x) => (x.onclick = () => { if (x.dataset.rvall === "1") visibleParts().forEach((p) => sel.add(p.k)); else sel.clear(); renderParts(); label(); }));
    box.querySelectorAll("[data-rvquick]").forEach((x) => (x.onclick = () => { sel.add(x.dataset.rvquick); search.value = filters.search = ""; renderParts(); label(); list.querySelectorAll("[data-rvp]").forEach((input) => { if (input.dataset.rvp === x.dataset.rvquick) input.focus(); }); }));
    if (window.VerbalLesson) VerbalLesson.mount(box, {
      select: () => {
        const candidates = c.ranked.filter((q) => q.sec === "rw" && q.wrong && (!sel.size || sel.has(q.part))).sort(byWrong);
        // Give other skills a chance when many missed questions belong to the same assignment.
        const varied = [], remainder = [], perSkill = new Map();
        for (const q of candidates) {
          const key = q.sk || q.part, count = perSkill.get(key) || 0;
          (count < 2 ? varied : remainder).push(q);
          perSkill.set(key, count + 1);
        }
        return [...varied, ...remainder].slice(0, 8).map(rvQuestion);
      },
      readQuestion: teacherReviewItem, previewOriginal: gaOpen,
      send: (title, qs) => rvSaveSnapshot({ id: crypto.randomUUID(), v: 2, at: Date.now(), mode: "verbal",
        group: c.title, title, parts: [...new Set(qs.filter((q) => q.plabel).map((q) => q.plabel))], qs })
    });
    btn.onclick = () => rvSend(c, btn, $(`${id}-send-st`));
    $(`${id}-prep`).onclick = () => rvPrepare(c, box);
    renderParts(); label();
  }
  function rvQuestion(q) {
    return { id: q.id, title: q.title, sec: q.sec, sk: q.sk || "", d: q.d || "", work: q.work, n: q.n,
      wrong: q.wrong, picks: q.picks, src: q.src, plabel: q.plabel };
  }
  async function teacherReviewItem(q) {
    const b = await bundleT(q.src.b);
    return q.src.mod ? b.mods[q.src.mod][q.src.i] : b.find((x) => x.n === q.src.n);
  }
  async function lessonIds() {
    const [r, access] = await Promise.all([SITE.api("admin/users"), SITE.access()]);
    if (!r.ok) throw new Error(`Сервер ответил ${r.status}.`);
    const accounts = new Map(Object.entries(access.users || {}));
    for (const user of r.data.users) accounts.set(user.id, user);
    const ids = [], lessonId = await SITE.lid("lesson");
    for (const [id, account] of accounts) {
      // The ID identifies the exact lesson login even if its name record cannot be decoded.
      if (id === lessonId) { ids.push(id); continue; }
      const owner = await SITE.nameOf(account.n).catch(() => null);
      if (/^lesson-[a-z0-9]+$/.test(owner?.login || "")) ids.push(id);
    }
    if (!ids.length) throw new Error("Аккаунта урока нет. Добавьте его в разделе «Логины учеников»: имя «Урок», логин lesson.");
    return ids;
  }
  // «Подготовить урок» (2026-11-16, Nurassyl: «make "prepare a lesson" button for repeating mistakes»): the parts submitted since
  // the last lesson with this group or student (a lesson-mode session with the same name, read from the lesson account) or since
  // the last review sent to them; with neither, the last 7 days. Ticks those parts, sends their mistakes and writes a private note
  // here: who has not submitted since then and the common traps. The note stays on this page; the lesson screen never shows it.
  async function rvPrepare(c, box) {
    const st = $(`${c.slot}-send-st`), note = $(`${c.slot}-note`), btn = $(`${c.slot}-prep`);
    if (!SITE.adminKey()) { st.textContent = "Нужен ключ администратора в этом браузере: раздел «Аккаунты учеников · регистрация»."; return; }
    btn.disabled = true; st.textContent = "Ищу прошлый урок…"; note.innerHTML = "";
    let since = 0, why = "";
    try {
      const same = (a) => String(a || "").trim().toLowerCase() === String(c.title).trim().toLowerCase();
      for (const id of await lessonIds()) {
        const g = await SITE.api("admin/progress?id=" + encodeURIComponent(id)); if (!g.ok) continue;
        const B = await SITE.unsealBlob(g.data.data);
        for (const [k, r] of Object.entries(B)) {
          if (!r || r.v == null) continue;
          if (k.indexOf("ls_s_") === 0) { try { const s = JSON.parse(r.v); if (s.t1 && same(s.group) && s.t0 > since) { since = s.t0; why = "прошлого урока"; } } catch (e) { /* not a session */ } }
          if (k === "ls_m") { try { const d = JSON.parse(r.v); (d.list || (d.qs ? [d] : [])).forEach((x) => { if (x.mode === c.mode && same(x.group) && x.at > since) { since = x.at; why = "прошлого разбора"; } }); } catch (e) { /* old format */ } }
        }
      }
    } catch (e) { st.textContent = e.message || "Не удалось прочитать аккаунт урока."; btn.disabled = false; return; }
    if (!since) { since = Date.now() - 7 * DAY; why = "последних 7 дней"; }
    const day = new Date(since).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
    const fresh = rvParts(c.all).filter((pp) => pp.ts > since);
    btn.disabled = false;
    if (!fresh.length) { st.textContent = `С ${why} (${day}) новых ошибок нет: отметьте части вручную или нажмите «Показать на уроке».`; return; }
    const sel = (D.rvSel[`${c.mode}:${c.title}`] = new Set(fresh.map((pp) => pp.k)));
    // who has not submitted anything since then (group only; the student's own card shows his history)
    const keyOf = (n) => (window.FORMKIT ? FORMKIT.key(n) : n.toLowerCase());
    const quiet = c.mode === "group" ? (c.names || []).filter((n) => !D.rows.some((r) => r.key === keyOf(n) && r.ts && r.ts > since)) : [];
    const qs = rvPick(c), traps = qs.filter((q) => trapOf(q)).slice(0, 3);
    rvMount(box, c);   // shows the ticked parts
    await rvSend(c, $(`${c.slot}-send`), $(`${c.slot}-send-st`));
    $(`${c.slot}-note`).innerHTML = `<div class="card" style="margin-top:10px;background:var(--mist)"><b>Только для вас.</b> С ${esc(why)} (${esc(day)}): ${sel.size} ${pl(sel.size, "часть", "части", "частей")} с ошибками.
      ${c.mode === "group" ? (quiet.length ? ` Ничего не сдавали с тех пор: ${esc(quiet.join(", "))}.` : " Сдавали все.") : ""}
      ${traps.length ? `<br>Общие ловушки: ${traps.map((q) => `${esc(q.title)} → ${esc(trapOf(q)[0])}`).join("; ")}.` : ""}</div>`;
  }
  async function rvSend(c, btn, st) {
    if (!SITE.adminKey()) { st.textContent = "Нужен ключ администратора в этом браузере: раздел «Аккаунты учеников · регистрация»."; return; }
    const qs = rvPick(c); if (!qs.length) return;
    btn.disabled = true; st.textContent = "Отправляю…";
    try {
      const sel = D.rvSel[c.key], solo = c.mode === "solo";
      const snap = { id: Date.now().toString(36), v: 2, at: Date.now(), mode: c.mode, group: c.title, note: c.note || "",
        parts: [...new Set(qs.map((q) => q.plabel))], qs: qs.map((q) => solo ? { ...rvQuestion(q), picks: {}, mine: q.mine || [] } : rvQuestion(q)) };
      await rvSaveSnapshot(snap);
      st.textContent = `Отправлено: ${qs.length} ${pl(qs.length, "вопрос", "вопроса", "вопросов")} («${c.title}»${sel && sel.size ? `, ${sel.size} ${pl(sel.size, "часть", "части", "частей")}` : ""}). В аккаунте урока нажмите «Ошибки класса».`;
    } catch (e) { st.textContent = e.message || "Не удалось отправить. Попробуйте ещё раз."; }
    finally { btn.disabled = false; }
  }
  async function rvSaveSnapshot(snap) {
    const ids = await lessonIds();
    let sent = 0;
    try {
      for (const id of ids) {
        const url = "admin/progress?id=" + encodeURIComponent(id), g = await SITE.api(url);
        if (!g.ok && g.status !== 404) throw new Error(`Сервер ответил ${g.status}.`);
        const data = g.ok ? await SITE.unsealBlob(g.data.data) : {};
        let list = [];
        try {
          const old = JSON.parse(data.ls_m?.v || "null");
          list = old ? (Array.isArray(old.list) ? old.list : old.qs ? [old] : []) : [];
        } catch { /* malformed old snapshot */ }
        list = [snap, ...list.filter((r) => !(r.mode === snap.mode && r.group === snap.group))].slice(0, 8);
        data.ls_m = { v: JSON.stringify({ v: 2, list }), t: Date.now() };
        const result = await SITE.api(url, { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob(data) }) });
        if (!result.ok) throw new Error(`Сервер ответил ${result.status}.`);
        sent++;
      }
    } catch (e) {
      if (!sent) throw e;
      throw new Error(`Отправлено в ${sent} из ${ids.length} аккаунтов урока. Повторите отправку для остальных.`);
    }
  }
  function gaBind(box) {
    [["ga-grp", "gid"], ["ga-sec", "sec"], ["ga-kind", "kind"], ["ga-days", "days"], ["ga-min", "min"]].forEach(([id, k]) => box.querySelectorAll(`#${id} .chip`).forEach((b) => (b.onclick = () => { GA[k] = k !== "gid" && typeof GA[k] === "number" ? +b.dataset.x : b.dataset.x; render(); })));
  }
  async function gaOpen(d, q) {
    const body = d.querySelector(".rbody"); if (body.dataset.done) return;
    let item; try { item = await teacherReviewItem(q); } catch (e) { body.innerHTML = '<p class="hint">Не удалось загрузить вопрос. Обновите страницу.</p>'; return; }
    if (!item) { body.innerHTML = '<p class="hint">Вопрос не найден.</p>'; return; }
    const t = trapOf(q), acc = [].concat(item.acc || item.ans).filter(Boolean), ok = q.n - q.wrong;
    const opts = item.t === "mc" && item.opts && item.opts.length ? item.opts.map((o, k) => { const L = "ABCD"[k], c = L === item.ans ? ok : q.picks[L] || 0;
        return `<div class="ropt${L === item.ans ? " right" : ""}${t && t[0] === L ? " mine" : ""}"><span class="lt">${L}</span><span class="qhtml">${o}</span><span class="tg">${L === item.ans ? "верный · " : ""}${c} ${pl(c, "ученик", "ученика", "учеников")}</span></div>`; }).join("")
      : `<p class="hint">Принимаются: ${esc(acc.join(", "))} · неверные ответы: ${esc(Object.entries(q.picks).map(([v, c]) => `${v} (${c})`).join(", ") || "—")}</p>`;
    body.innerHTML = `${item.stim ? `<div class="qhtml">${item.stim}</div>` : ""}<div class="qhtml">${item.stem || ""}</div>${opts}
      ${t ? `<p class="ga-trap">Общая ловушка: вариант <b>${t[0]}</b> выбрали ${t[1]} из ${q.wrong} ошибившихся. Стоит разобрать, почему он кажется верным.</p>` : ""}
      ${item.rat ? `<div class="sv-expl"><span class="label">Объяснение</span><div class="qhtml">${item.rat}</div>${item.dz || ""}</div>` : ""}`;
    body.dataset.done = "1";
  }
  function heatStudents(L, rows) {
    let s = `<div class="tw"><table class="heat"><tr><th></th>${L.parts.map((p) => `<th title="${esc(p.title)}">${esc(p.title.split(" ")[0].slice(0, 9))}</th>`).join("")}</tr>`;
    D.students.forEach((st) => {
      s += `<tr><th>${esc(st.name)}</th>` + L.parts.map((p) => { const rs = rows.filter((r) => r.key === st.key && r.pid === p.id), b = best(rs), c = shade(b ? b.pct : null);
        return `<td data-tip="${esc(`<b>${esc(st.name)} · ${esc(p.title)}</b><br>${b ? `${b.a}/${b.b}, сдач: ${rs.length}` : "Не сдано"}`)}"${c ? ` style="background:${c[0]};color:${c[1]}"` : ""}>${b ? Math.round(b.pct) : "·"}</td>`; }).join("") + "</tr>";
    });
    return s + "</table></div>";
  }
  function missing() {
    const L = lessonOf(D.mLesson) || D.lessons[0];
    D.mLesson = L.tag; const P = L.parts.find((p) => p.id === D.mPart) || L.parts.find((p) => p.title === "Домашнее задание") || L.parts[0]; D.mPart = P.id;
    const who = D.students.filter((s) => !s.rows.some((r) => r.lesson === L.tag && r.pid === P.id));
    const did = D.students.filter((s) => s.rows.some((r) => r.lesson === L.tag && r.pid === P.id));
    $("v-missing").innerHTML = `<h2>Кто не сдал</h2><p class="hint">Выберите урок и часть. Список учеников — все, кто хотя бы раз что-то сдавал.</p>
      <div class="row" style="margin-top:0"><select id="m-l" aria-label="Урок">${D.lessons.map((l) => `<option value="${l.tag}"${l.tag === L.tag ? " selected" : ""}>${esc(l.title)}</option>`).join("")}</select>
      <select id="m-p" aria-label="Часть урока">${L.parts.map((p) => `<option value="${p.id}"${p.id === P.id ? " selected" : ""}>${esc(p.title)}</option>`).join("")}</select></div>
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
      table(["Когда", "Ученик", "Что", "Результат", "Ошибки", "Ответы"], rows.slice(0, 400).map((r) => ({ k: r.key, cells: [when(r.ts), esc(r.name), esc(whatOf(r)) + (r.screen ? '<span class="pill">экран</span>' : ""), `${r.a}/${r.b}`, esc(r.wrong.join(", ")) || "—", `<span class="mono" style="font-size:12px">${esc(r.answers.map((a) => `${a.n}:${a.tries.join(">") || "-"}`).join(" "))}</span>`] })), { num: [3] });
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
    try { const r = await fetch(u, { cache: "no-store" }); if (!r.ok) throw new Error("HTTP " + r.status); D.demo = false; load(await r.text(), "живая ссылка · " + new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })); store("teacher_url", u); cloudSave(); }
    catch (e) { $("src-msg").textContent = "Не удалось загрузить по ссылке: " + e.message + ". Проверьте, что выбран формат CSV, или загрузите файл."; }
  }
  function fromFile(f) {
    const rd = new FileReader();
    rd.onload = () => { try { useFile(rd.result, "файл " + f.name); } catch (e) { $("src-msg").textContent = e.message; } };
    rd.readAsText(f, "utf-8");
  }
  function useFile(csv, label, aliases) {
    D.demo = false;
    if (aliases) D.aliases = aliases;
    load(csv, label);
    store("teacher_url", null);
    $("url").value = "";
    return cloudSave();
  }
  // ---------- the answers in the cloud (api/admin/form, admin key only, encrypted here): the dashboard and the cabinet open them
  // on any device without loading the file again
  let lastSaved = "", formWrites = Promise.resolve();
  function formBadge() {
    const line = $("st-line");
    if (!line.querySelector("[data-form-saved]")) line.insertAdjacentHTML("beforeend", ' <span class="pill" data-form-saved>сохранено в кабинете</span>');
  }
  function cloudSave() {
    if (!SITE.adminKey() || !D.csv) return;
    const body = JSON.stringify({ csv: D.csv, aliases: D.aliases });
    formWrites = formWrites.then(async () => {
      try {
        if (body !== lastSaved) {
          const data = await SITE.sealBlob({ ...JSON.parse(body), at: Date.now() });
          const r = await SITE.api("admin/form", { method: "PUT", body: JSON.stringify({ data }) });
          if (!r.ok) return;
          lastSaved = body;
        }
        if (body === JSON.stringify({ csv: D.csv, aliases: D.aliases }) && !D.demo) formBadge();
      } catch (e) { /* the results can still be viewed without a server copy */ }
    });
    return formWrites;
  }
  async function cloudLoad() {
    if (!SITE.adminKey()) return false;
    try { const r = await SITE.api("admin/form"); if (!r.ok) return false; const f = await SITE.unsealBlob(r.data.data); if (!f || !f.csv || D.csv) return false;
      D.aliases = Object.assign({}, f.aliases || {}, D.aliases); D.demo = false; load(f.csv, "сохранено " + new Date(r.data.at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
      lastSaved = JSON.stringify({ csv: f.csv, aliases: D.aliases }); formBadge(); return true; } catch (e) { return false; }
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
  $("forget").onclick = () => { store("teacher_url", null); D.rows = []; D.csv = ""; $("url").value = ""; $("dash").classList.add("hidden"); sources(true); $("src-msg").textContent = "Данные убраны с этой страницы."; };
  $("demo").onclick = () => { D.demo = true; const a = D.aliases; D.aliases = {}; load(demoCSV(), "пример"); D.aliases = a; };
  $("tabs").querySelectorAll(".chip").forEach((b) => (b.onclick = () => { D.view = b.dataset.v; if (D.view !== "students") D.student = null; render(); }));
  addEventListener("resize", () => { if (!$("teacher-results").classList.contains("hidden") && !$("dash").classList.contains("hidden") && D.view === "overview") render(); });


  // ---------- site password: re-wrap the master key with a new password and publish access.json
  const DEP = (window.HW_CONFIG && HW_CONFIG.deploy) || {};
  const cleanTok = (s) => String(s || "").replace(/[^\x21-\x7E]/g, "");   // a token is plain ASCII; drops spaces, line breaks, stray letters
  const GH = () => ({ token: cleanTok(store("gh_token")), repo: store("gh_repo") || DEP.repo || "galiandojonathan-ship-it1/nurzycom_brand", branch: store("gh_branch") || DEP.branch || "main" });
  function ghState() { const g = GH(); $("gh-state").textContent = g.token ? `· подключено: ${g.repo}, ветка ${g.branch}` : "· не подключено"; $("gh-repo").value = g.repo; $("gh-branch").value = g.branch; }
  async function newAccess() {
    const cur = $("pw-cur").value, a = $("pw-new").value.trim(), b = $("pw-new2").value.trim();
    if (a.length < 6) throw new Error("Новый пароль — не короче 6 символов.");
    if (a !== b) throw new Error("Новые пароли не совпадают.");
    if (a === cur.trim()) throw new Error("Новый пароль совпадает с текущим.");
    try { return { json: JSON.stringify(await SITE.rewrap(cur.trim(), a)), pw: a }; } catch (e) { throw new Error("Текущий пароль неверный."); }
  }
  const pwMsg = (t) => ($("pw-msg").textContent = t);
  // writes docs/access.json to the site's branch on GitHub; the hosting rebuilds the site from it
  async function ghPut(json, message) {
    const g = GH(); if (!g.token) { $("gh-set").open = true; throw new Error("Сначала подключите GitHub ниже (один раз) или скачайте файл вручную."); }
    const url = `https://api.github.com/repos/${g.repo}/contents/docs/access.json`, hd = { Authorization: `Bearer ${g.token}`, Accept: "application/vnd.github+json" };
    const cur = await fetch(`${url}?ref=${encodeURIComponent(g.branch)}`, { headers: hd });
    if (cur.status === 401 || cur.status === 403) throw new Error("GitHub не принял токен. Проверьте токен и права Contents: Read and write.");
    if (!cur.ok && cur.status !== 404) throw new Error(`GitHub ответил ${cur.status}. Проверьте репозиторий и ветку.`);
    const sha = cur.ok ? (await cur.json()).sha : undefined;
    const put = await fetch(url, { method: "PUT", headers: hd, body: JSON.stringify({ message, content: btoa(unescape(encodeURIComponent(json))), branch: g.branch, sha }) });
    if (!put.ok) throw new Error(`GitHub не сохранил файл (${put.status}).`);
  }
  $("pw-gh").onclick = async () => {
    try {
      pwMsg("Меняю пароль…"); const n = await newAccess();
      if (ACC.a) { const fresh = JSON.parse(n.json); ACC.a = Object.assign({}, ACC.a, { v: fresh.v, salt: fresh.salt, iter: fresh.iter, wrap: fresh.wrap }); n.json = JSON.stringify(ACC.a); }
      await ghPut(n.json, "Change the shared site password");
      if (!SITE.me()) SITE.remember(n.pw); ["pw-cur", "pw-new", "pw-new2"].forEach((i) => ($(i).value = "")); accRender();
      pwMsg("Готово. Пароль сменён: через 1–10 минут сайт будет принимать только новый пароль. Отправьте его ученикам.");
    } catch (e) { pwMsg(e.message); }
  };
  $("pw-dl").onclick = async () => {
    try {
      const n = await newAccess();
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([n.json], { type: "application/json" })); a.download = "access.json"; a.click();
      if (!SITE.me()) SITE.remember(n.pw);
      pwMsg("Файл access.json скачан. Загрузите его на GitHub: репозиторий → папка docs → Add file → Upload files → перетащите файл → Commit changes. Пока файл не загружен, работает старый пароль.");
    } catch (e) { pwMsg(e.message); }
  };
  // ---------- students' own logins: access.json → users (master key wrapped per student; login and name encrypted)
  const ACC = { a: null, list: [], dirty: false };
  const TR = { а: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i", і: "i", к: "k", қ: "q", л: "l", м: "m", н: "n", ң: "n", о: "o", ө: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ұ: "u", ү: "u", ф: "f", х: "kh", һ: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", ә: "a" };
  const toLogin = (s) => s.toLowerCase().split("").map((c) => (c in TR ? TR[c] : c)).join("").replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "").slice(0, 24);
  function genPw() { const A = "abcdefghjkmnpqrstuvwxyz23456789", r = crypto.getRandomValues(new Uint8Array(10)); const s = Array.from(r, (x) => A[x % A.length]).join(""); return s.slice(0, 5) + "-" + s.slice(5); }
  const siteUrl = () => new URL("./", location.href).href;
  const accMsg = (t) => ($("acc-msg").textContent = t);
  async function accLoad() { try { ACC.a = await SITE.access(); ACC.list = await SITE.accounts(ACC.a); accRender(); } catch (e) { $("acc-list").innerHTML = '<p class="hint">Не удалось загрузить список логинов. Обновите страницу.</p>'; } }
  function accRender() {
    if (!ACC.a) return;
    const me = SITE.me();
    $("acc-list").innerHTML = ACC.list.length ? table(["Ученик", "Логин", '<span class="sr-only">Действия</span>'], ACC.list.slice().sort((x, y) => x.name.localeCompare(y.name, "ru")).map((u) => ({ k: u.id,
      cells: [esc(u.name) + (u.login === me ? '<span class="me">· это вы</span>' : ""), `<span class="mono">${esc(u.login)}</span>`,
        `<span class="chips"><button class="chip" data-np="${esc(u.id)}">Новый пароль</button><button class="chip" data-del="${esc(u.id)}">Удалить</button></span>`] })))
      .replace('<table class="t">', '<table class="t acct">') : '<p class="hint">Логинов пока нет. Начните с себя: добавьте своё имя, сохраните и войдите на сайт со своим логином.</p>';
    $("acc-list").querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => {
      const u = ACC.list.find((x) => x.id === b.dataset.del); if (!u) return;
      if (u.login === me) { accMsg("Это ваш логин: с ним вы сейчас вошли. Удалить его отсюда нельзя."); return; }
      if (!confirm(`Удалить логин ${u.login} (${u.name})? Ученик больше не сможет войти.`)) return;
      delete ACC.a.users[u.id]; ACC.list = ACC.list.filter((x) => x !== u); ACC.dirty = true; accMsg(`Логин ${u.login} удалён. Нажмите «Сохранить на сайте».`); accRender();
    }));
    $("acc-list").querySelectorAll("[data-np]").forEach((b) => (b.onclick = async () => {
      const u = ACC.list.find((x) => x.id === b.dataset.np); if (!u) return; const pw = genPw();
      ACC.a.users[u.id] = await SITE.account(u.login, u.name, pw); ACC.dirty = true; showNew(u.name, u.login, pw, true); accRender();
    }));
    const sh = $("acc-shared");
    if (ACC.a.wrap) sh.innerHTML = `<span class="label">Общий пароль · включён</span><p class="hint" style="margin:6px 0 10px">Пока он включён, на сайт можно войти и без логина, по старому общему паролю (поле «Логин» пустое). Когда все ученики получат свои логины, выключите его.</p><button class="btn ghost" id="acc-off">Выключить общий пароль</button>`;
    else sh.innerHTML = `<span class="label">Общий пароль · выключен</span><p class="hint" style="margin:6px 0 0">Войти можно только по логину и паролю. Чтобы включить общий пароль снова, задайте новый в разделе ниже.</p>`;
    if ($("acc-off")) $("acc-off").onclick = () => {
      const mine = ACC.list.find((x) => x.login === me) || REG.list.find((x) => x.login === me);
      if (!mine) { accMsg("Сначала создайте логин себе, сохраните, выйдите и войдите на сайт со своим логином. Иначе после выключения вы сами не войдёте."); return; }
      if (!confirm("Выключить общий пароль? Ученики без своего логина больше не смогут войти.")) return;
      ["salt", "iter", "wrap"].forEach((k) => delete ACC.a[k]); ACC.dirty = true; accMsg("Общий пароль будет выключен после «Сохранить на сайте»."); accRender();
    };
  }
  function showNew(name, login, pw, reset, live) {
    const text = `${reset ? "Новый пароль для сайта курса" : "Твой вход на сайт курса"}\n${siteUrl()}\nЛогин: ${login}\nПароль: ${pw}\n\nПароль личный, не передавай его другим. Отметь «Запомнить на этом устройстве», и вводить его каждый раз не придётся. Забудешь — напиши мне.`;
    const box = $("acc-new"); box.classList.remove("hidden");
    box.innerHTML = `<span class="label">${esc(name)} · ${reset ? "новый пароль" : "новый логин"}</span><pre>${esc(text)}</pre><p class="hint">Пароль виден только сейчас. Скопируйте сообщение и отправьте ученику в Telegram. ${live ? "Логин уже работает: он сохранён в аккаунтах сайта (список «Аккаунты учеников · регистрация»)." : "<b>Логин заработает только после «Сохранить на сайте».</b>"}</p><div class="row" style="margin-top:6px"><button class="btn ghost" id="acc-copy">Скопировать сообщение</button></div>`;
    $("acc-copy").onclick = async () => { try { await navigator.clipboard.writeText(text); $("acc-copy").textContent = "Скопировано"; } catch (e) { accMsg("Не удалось скопировать: выделите текст выше вручную."); } };
  }
  $("acc-add").onclick = async () => {
    try {
      if (!ACC.a) throw new Error("Список ещё загружается.");
      const name = $("acc-name").value.trim(); if (name.length < 2) throw new Error("Введите имя ученика, как оно должно стоять в результатах.");
      const login = SITE.norm($("acc-login").value) || toLogin(name);
      if (!/^[a-z0-9][a-z0-9._-]{1,23}$/.test(login)) throw new Error("Логин: от 2 до 24 символов, латинские буквы, цифры, точка, дефис.");
      const id = await SITE.lid(login); if ((ACC.a.users || {})[id]) throw new Error(`Логин ${login} уже есть. Впишите другой логин.`);
      const pw = genPw(), entry = await SITE.account(login, name, pw);
      // with the administrator key the login goes straight into the site's accounts and works at once (no GitHub step)
      if (SITE.adminKey()) {
        const r = await SITE.api("admin/user?id=" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ entry }) });
        if (r.status === 409) throw new Error(`Логин ${login} уже занят. Впишите другой логин.`);
        if (r.ok) { $("acc-name").value = ""; $("acc-login").value = ""; showNew(name, login, pw, false, true); accMsg(""); regLoad(); return; }
      }
      ACC.a.users = ACC.a.users || {}; ACC.a.v = 2;
      ACC.a.users[id] = entry; ACC.list.push({ id, login, name }); ACC.dirty = true;
      $("acc-name").value = ""; $("acc-login").value = ""; showNew(name, login, pw, false); accMsg("Логин ещё не работает: нажмите «Сохранить на сайте» ниже."); accRender();
    } catch (e) { accMsg(e.message); }
  };
  $("acc-save").onclick = async () => {
    try { if (!ACC.dirty) { accMsg("Изменений нет."); return; } accMsg("Сохраняю…"); await ghPut(JSON.stringify(ACC.a), "Update student logins"); ACC.dirty = false; accMsg("Сохранено. Через 1–2 минуты новые логины начнут работать."); }
    catch (e) { accMsg(e.message); }
  };
  $("acc-dl").onclick = () => {
    if (!ACC.a) return; const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(ACC.a)], { type: "application/json" })); a.download = "access.json"; a.click();
    accMsg("Файл скачан. Загрузите его на GitHub: репозиторий → папка docs → Add file → Upload files → Commit changes.");
  };
  addEventListener("beforeunload", (e) => { if (ACC.dirty) { e.preventDefault(); e.returnValue = ""; } });

  // ---------- accounts students create themselves (Cloudflare function api/…, KV storage); works only on study.bynurzy.com
  const REG = { list: [], invite: false };
  const regMsg = (t) => ($("reg-msg").textContent = t);
  const newKey = () => { const u = crypto.getRandomValues(new Uint8Array(24)); return btoa(String.fromCharCode(...u)).replace(/[+/=]/g, "").slice(0, 32); };
  function regExplain(status) {
    if (status === 404 || status === 405) return "Регистрация работает только на https://study.bynurzy.com/. Откройте кабинет по этому адресу.";
    if (status === 503) return "Хранилище аккаунтов ещё не подключено в Cloudflare. Сделайте шаг «KV» из инструкции, потом обновите страницу.";
    return `Сервер ответил ${status}. Обновите страницу через минуту.`;
  }
  async function regLoad() {
    const box = $("reg-admin");
    if (!SITE.adminKey()) {
      REG.list = []; REG.invite = false;
      $("reg-invite").classList.add("hidden");
      $("reg-list").replaceChildren();
      $("reg-new")?.remove();
      const probe = await SITE.api("admin/users").catch(() => ({ status: 0 }));
      if (probe.status !== 403) { box.innerHTML = `<p class="hint">${esc(regExplain(probe.status || 503))}</p>`; return; }
      box.innerHTML = `<span class="label">Ключ администратора</span>
        <p class="hint" style="margin:6px 0">Ключ отличает вас от учеников: только с ним видно список аккаунтов и можно удалять. Первый раз нажмите «Стать администратором». На другом устройстве вставьте сохранённый ключ.</p>
        <div class="row"><button class="btn" id="reg-claim">Стать администратором</button></div>
        <div class="row"><input id="reg-key" type="password" placeholder="Вставить сохранённый ключ" autocomplete="off" aria-label="Ключ администратора"><button class="btn ghost" id="reg-key-go">Войти с ключом</button></div>`;
      $("reg-claim").onclick = async () => {
        const key = newKey(), r = await SITE.api("admin/claim", { method: "POST", body: JSON.stringify({ key }) });
        if (r.status === 409) { regMsg("Администратор уже назначен. Вставьте свой сохранённый ключ ниже."); return; }
        if (!r.ok) { regMsg(regExplain(r.status)); return; }
        SITE.adminKey(key); regMsg(""); await regLoad();
        $("reg-admin").insertAdjacentHTML("afterbegin", `<div style="margin-bottom:10px"><span class="label">Ваш ключ администратора · сохраните его</span><pre>${esc(key)}</pre><p class="hint">Сохраните ключ в Заметках или менеджере паролей. Он нужен, чтобы открыть этот раздел на другом устройстве. Ученикам его не отправляйте.</p></div>`);
      };
      $("reg-key-go").onclick = async () => { SITE.adminKey($("reg-key").value.trim()); await regLoad(); };
      return;
    }
    const r = await SITE.api("admin/users").catch(() => ({ status: 0 }));
    if (r.status === 403) { SITE.adminKey(null); regMsg("Ключ не подошёл. Вставьте правильный ключ."); return regLoad(); }
    if (!r.ok) { box.innerHTML = `<p class="hint">${esc(regExplain(r.status || 503))}</p>`; return; }
    box.innerHTML = `<span class="label">Администратор · вы</span><p class="hint" style="margin:6px 0 0">Ключ сохранён в этом браузере. <a href="#" id="reg-forget">Убрать ключ с этого устройства</a></p>`;
    $("reg-forget").onclick = (e) => { e.preventDefault(); SITE.adminKey(null); regLoad(); };
    REG.invite = r.data.invite; REG.list = [];
    for (const u of r.data.users) { try { const me = await SITE.nameOf(u.n); REG.list.push(Object.assign({ id: u.id, at: u.at }, me)); } catch (x) { REG.list.push({ id: u.id, at: u.at, login: "?", name: "?" }); } }
    regRender(); accRender();
  }
  function studentText(code) {
    return `Сайт курса: ${siteUrl()}\n1. Нажми «Создать аккаунт».\n2. Код класса: ${code}\n3. Впиши имя и первую букву фамилии, придумай логин и пароль (от 8 символов, буквы и цифры).\nПотом входи по своему логину и паролю. Отметь «Запомнить на этом устройстве».`;
  }
  function regRender(fresh) {
    const iv = $("reg-invite"); iv.classList.remove("hidden");
    iv.innerHTML = (fresh ? `<span class="label">Новый код класса · отправьте ученикам</span><pre>${esc(studentText(fresh))}</pre><p class="hint">Код виден только сейчас. Скопируйте сообщение и отправьте в чат учеников.</p><div class="row"><button class="btn ghost" id="reg-copy">Скопировать сообщение</button></div>`
      : REG.invite ? `<span class="label">Код класса · действует</span><p class="hint" style="margin:6px 0 0">С ним ученики создают аккаунты. Если код утёк или вы его потеряли, создайте новый: старый перестанет работать, созданные аккаунты останутся.</p>`
      : `<span class="label">Код класса · не создан</span><p class="hint" style="margin:6px 0 0">Пока кода нет, создать аккаунт нельзя. Создайте код и отправьте его ученикам.</p>`)
      + `<div class="row"><button class="btn${REG.invite && !fresh ? " ghost" : ""}" id="reg-newcode">${REG.invite ? "Новый код класса" : "Создать код класса"}</button>${REG.invite ? '<button class="btn ghost" id="reg-close">Закрыть регистрацию</button>' : ""}</div>`;
    if ($("reg-copy")) $("reg-copy").onclick = async () => { try { await navigator.clipboard.writeText(studentText(fresh)); $("reg-copy").textContent = "Скопировано"; } catch (e) { regMsg("Не удалось скопировать: выделите текст вручную."); } };
    $("reg-newcode").onclick = async () => {
      if (REG.invite && !confirm("Создать новый код? Старый код перестанет работать для новых аккаунтов.")) return;
      const code = genPw(), body = await SITE.inviteFor(code), r = await SITE.api("admin/invite", { method: "POST", body: JSON.stringify(body) });
      if (!r.ok) { regMsg(regExplain(r.status)); return; } REG.invite = true; regMsg(""); regRender(code);
    };
    if ($("reg-close")) $("reg-close").onclick = async () => {
      if (!confirm("Закрыть регистрацию? Новые аккаунты создать будет нельзя, созданные продолжат работать.")) return;
      const r = await SITE.api("admin/invite", { method: "DELETE" }); if (!r.ok) { regMsg(regExplain(r.status)); return; } REG.invite = false; regRender();
    };
    const me = SITE.me();
    $("reg-list").innerHTML = REG.list.length ? table(["Ученик", "Логин", "Создан", '<span class="sr-only">Действия</span>'], REG.list.slice().sort((x, y) => String(x.name).localeCompare(String(y.name), "ru")).map((u) => ({ k: u.id,
      cells: [esc(u.name) + (u.login === me ? '<span class="me">· это вы</span>' : ""), `<span class="mono">${esc(u.login)}</span>`, u.at ? when(new Date(u.at)) : "—",
        u.login === me ? "" : `<span class="chips"><button class="chip" data-regpw="${esc(u.id)}">Новый пароль</button><button class="chip" data-regdel="${esc(u.id)}">Удалить</button></span>`] }))).replace('<table class="t">', '<table class="t acct">')
      : '<p class="hint">Аккаунтов пока нет. Создайте себе аккаунт первым: выйдите, на странице входа нажмите «Создать аккаунт» и введите код класса.</p>';
    // a student forgot the password: the teacher types a new one (or leaves it empty for a generated one); it works at once,
    // and the old one stops working on every device
    $("reg-list").querySelectorAll("[data-regpw]").forEach((b) => (b.onclick = () => {
      const u = REG.list.find((x) => x.id === b.dataset.regpw);
      if (!u || !u.login || u.login === "?") { regMsg("Не удалось прочитать логин этого аккаунта. Обновите страницу."); return; }
      const box = regBox();
      box.innerHTML = `<span class="label">${esc(u.name)} · ${esc(u.login)} · новый пароль</span>
        <div class="field" style="margin-top:10px"><input id="reg-pwin" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Новый пароль" aria-label="Новый пароль"></div>
        <p class="hint" style="margin:6px 0 10px">От 8 символов, нужны и буквы, и цифры. Оставьте поле пустым, и сайт придумает пароль сам. Старый пароль перестанет работать на всех устройствах.</p>
        <div class="row" style="margin-top:0"><button class="btn" id="reg-pwgo">Сохранить пароль</button><button class="btn ghost" id="reg-pwno">Отмена</button></div><p class="hint" id="reg-pwmsg"></p>`;
      const save = async () => {
        const typed = $("reg-pwin").value.trim(), msg = (s) => ($("reg-pwmsg").textContent = s);
        if (typed && !(typed.length >= 8 && /[a-zа-яё]/i.test(typed) && /\d/.test(typed))) { msg("Пароль: не короче 8 символов, нужны и буквы, и цифры."); return; }
        const pw = typed || genPw(); msg("Сохраняю…");
        const entry = await SITE.account(u.login, u.name, pw);
        const sync = await SITE.syncToken(u.id, pw);   // the student's results in the account move to the new password
        const r = await SITE.api("admin/user?id=" + encodeURIComponent(u.id), { method: "PUT", body: JSON.stringify({ entry, replace: true, sync }) });
        if (!r.ok) { msg(regExplain(r.status)); return; }
        regMsg(""); regNewPw(u, pw);
      };
      $("reg-pwgo").onclick = save;
      $("reg-pwin").onkeydown = (e) => { if (e.key === "Enter") save(); };
      $("reg-pwno").onclick = () => box.remove();
      $("reg-pwin").focus();
    }));
    $("reg-list").querySelectorAll("[data-regdel]").forEach((b) => (b.onclick = async () => {
      const u = REG.list.find((x) => x.id === b.dataset.regdel); if (!u || !confirm(`Удалить аккаунт ${u.login} (${u.name})? Ученик больше не сможет войти.`)) return;
      const r = await SITE.api("admin/user?id=" + encodeURIComponent(u.id), { method: "DELETE" }); if (!r.ok) { regMsg(regExplain(r.status)); return; }
      REG.list = REG.list.filter((x) => x !== u); regMsg(`Аккаунт ${u.login} удалён.`); regRender();
    }));
  }
  function regBox() { let box = $("reg-new"); if (!box) { box = document.createElement("div"); box.id = "reg-new"; box.className = "card"; box.style.marginTop = "10px"; $("reg-list").before(box); } box.scrollIntoView({ block: "center" }); return box; }
  function regNewPw(u, pw) {
    const text = `Новый пароль для сайта курса\n${siteUrl()}\nЛогин: ${u.login}\nПароль: ${pw}\n\nПароль личный, не передавай его другим. Отметь «Запомнить на этом устройстве», и вводить его каждый раз не придётся. Забудешь — напиши мне.`;
    const box = regBox();
    box.innerHTML = `<span class="label">${esc(u.name)} · новый пароль · уже работает</span><pre>${esc(text)}</pre><p class="hint">Пароль виден только сейчас. Скопируйте сообщение и отправьте ученику. Результаты, план и задания ученика остаются в аккаунте.</p><div class="row" style="margin-top:6px"><button class="btn ghost" id="reg-pwcopy">Скопировать сообщение</button></div>`;
    $("reg-pwcopy").onclick = async () => { try { await navigator.clipboard.writeText(text); $("reg-pwcopy").textContent = "Скопировано"; } catch (e) { regMsg("Не удалось скопировать: выделите текст выше вручную."); } };
    box.scrollIntoView({ block: "center" });
  }

  $("gh-save").onclick = () => {
    const raw = $("gh-token").value, tok = cleanTok(raw);
    if (raw.trim() && !/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(tok)) { store("gh_token", null); ghState(); $("gh-state").textContent = "· это не похоже на токен GitHub: он начинается с github_pat_ и состоит только из латинских букв, цифр и _. Скопируйте токен заново и вставьте только его."; return; }
    if (tok) store("gh_token", tok); store("gh_repo", $("gh-repo").value.trim() || GH().repo); store("gh_branch", $("gh-branch").value.trim() || DEP.branch || "main"); $("gh-token").value = ""; ghState(); };
  $("gh-forget").onclick = () => { store("gh_token", null); ghState(); };
  ghState();

  let resultsReady = null, accountsLoading = null;
  window.TeacherWorkspace = {
    useFile: (csv, label) => useFile(csv, label, {}),
    form: () => D.csv && !D.demo ? { csv: D.csv, aliases: D.aliases, label: D.label } : null,
    open(view) {
      if (view === "accounts") {
        if (!accountsLoading) accountsLoading = Promise.all([accLoad(), regLoad()]).finally(() => { accountsLoading = null; });
        return accountsLoading;
      }
      hideTip();
      D.cbg = null;
      if (!resultsReady) {
        resultsReady = Promise.all(["lessons", "practice", "reading", "mocks"].map((f) => SITE.json(f).catch(() => null))).then(([l, p, t, m]) => {
          D.lessons = (l && l.lessons) || []; D.sets = (p && p.sets) || []; D.texts = (t && t.texts) || []; D.mocks = m;
          try { D.aliases = JSON.parse(store("name_alias") || "{}") || {}; } catch (e) { D.aliases = {}; }
          if (D.csv) { render(); return; }
          const u = store("teacher_url");
          if (u) { $("url").value = u; return fromUrl(u); }
          return cloudLoad();
        });
      } else if (!$("dash").classList.contains("hidden")) render();
      return resultsReady;
    }
  };
  window.__teacher = { parseCSV, parseDate, columns };   // for testing
})();
