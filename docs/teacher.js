// Teacher dashboard: reads the Google Form responses (CSV file or a published CSV link) in the browser and summarises them.
(function () {
  "use strict";
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
      if (!/^([VMXTDUA]\d\d|PT\d\d?|MD|VA)$/.test(lesson) || !sc) return;
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
    D.groups = G ? G.groups : []; D.csv = text;
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
    if (r.kind === "P") return `Пробный тест ${r.lesson.slice(2).replace("·", " · ")} · ${r.part.replace(/^\S+ · /, "")}`;
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
    ["overview", "students", "lessons", "tests", "missing", "log"].forEach((v) => $("v-" + v).classList.toggle("hidden", v !== D.view));
    ({ overview, students, lessons, tests, missing, log })[D.view]();
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
      '<p class="hint">Разные написания одного имени («Шер. Ж.», «Sher Zh») сайт объединяет сам, под латинским написанием. Если объединил не тех или не объединил своих, откройте ученика: там можно отделить или присоединить написание.</p>';
    clickStudents($("v-students"));
  }
  function studentDetail(s) {
    if (!s) { D.student = null; return students(); }
    const hw = s.rows.filter((r) => "VM".includes(r.kind)), scr = hw.filter((r) => r.screen);
    const per = hw.filter((r) => r.sec > 0 && r.b).map((r) => r.sec / r.b);
    const used = D.lessons.filter((l) => s.rows.some((r) => r.lesson === l.tag));
    const rowsOf = (tag, pid) => s.rows.filter((r) => r.lesson === tag && r.pid === pid);
    let html = `<div class="row" style="margin-top:0"><button class="btn ghost" id="back-st">← Все ученики</button></div><h2 style="font:italic 300 44px/1.1 var(--serif);margin-top:18px">${esc(s.name)}</h2>`;
    const grp = (D.groups || []).find((g) => g.key === s.key), sps = grp ? Object.entries(grp.spellings) : [];
    const others = D.students.filter((x) => x.key !== s.key);
    html += `<div class="card spell"><span class="label">Как ученик подписывал работы</span><div class="spl">${sps.map(([sp, n]) => `<span class="sp">${esc(sp)} <small>×${n}</small>${sps.length > 1 ? `<button class="chip" data-split="${esc(sp)}" title="Это другой ученик">Отделить</button>` : ""}</span>`).join("")}</div>
      ${others.length ? `<div class="row" style="margin-top:10px"><select id="join-sel" aria-label="Присоединить другого ученика"><option value="">Присоединить: это тот же ученик…</option>${others.map((x) => `<option value="${esc(x.key)}">${esc(x.name)}</option>`).join("")}</select><button class="btn ghost" id="join-go">Объединить</button></div>` : ""}
      ${Object.keys(D.aliases).length ? '<p class="hint"><a href="#" id="alias-reset">Вернуть автоматическое объединение имён</a></p>' : ""}</div>`;
    html += kpis([["Сдач", s.rows.length, `последняя: ${ago(s.last)} · текстов и сложных: ${s.rows.filter((r) => !"VM".includes(r.kind)).length}`], ["ДЗ с 1-й попытки", pct(mean(hw.map((r) => r.pct))), `${hw.length} частей тетради`],
      ["Со 2-й попытки", pct(mean(scr.filter((r) => r.second !== null).map((r) => r.second))), "на экране, после второй попытки"], ["Время на вопрос", per.length ? `${Math.round(median(per))} с` : "—", "медиана"]]);
    html += `<h2>Уроки</h2><p class="hint">Лучший результат с первой попытки по частям тетради, %. Наведите на клетку, чтобы увидеть часть. Тёмнее — лучше.</p>` + (used.filter((l) => "VM".includes(l.tag[0])).length ? heat(rowsOf, D.lessons.filter((l) => "VM".includes(l.tag[0]) && s.rows.some((r) => r.lesson === l.tag))) : '<p class="hint">Пока нет сданных частей.</p>');
    html += `<h2>Навыки</h2><p class="hint">Доля вопросов, решённых с первой попытки, по навыкам College Board (от слабых к сильным). Число справа — сколько вопросов.</p><div id="st-sk"></div>`;
    html += `<h2>История</h2>` + table(["Когда", "Что", "Результат", "Ошибки (1-я попытка)", "Попытка", "Время"], [...s.rows].reverse().map((r) => ({ k: r.key, cells: [when(r.ts), esc(whatOf(r)) + (r.screen ? '<span class="pill">экран</span>' : "") + (r.kind === "P" ? ` <a href="#" class="to-test pill" data-m="${r.lesson.split("·")[0]}" data-s="${/Math/.test(r.lesson) ? "math" : "rw"}">ответы →</a>` : ""), `${r.a}/${r.b} · ${pct(r.pct)}` + (r.kind === "P" && window.SATSCALE ? ` · ≈ ${SATSCALE.section(/Math/.test(r.lesson) ? "math" : "rw", /M2 сложный/.test(r.part), r.a)}` : ""), r.wrong.length ? esc(r.wrong.join(", ")) : "—", r.attempt, r.sec ? `${Math.round(r.sec / 60)} мин` : "—"] })), { num: [2, 4, 5] });
    $("v-students").innerHTML = html;
    $("v-students").querySelectorAll(".to-test").forEach((el) => (el.onclick = (e) => { e.preventDefault(); e.stopPropagation(); Object.assign(D.t, { mid: el.dataset.m, sec: el.dataset.s, mod: "m1", who: s.key }); D.view = "tests"; D.student = null; render(); }));
    hbars($("st-sk"), skillStats(hw).filter((x) => x.n >= 2));
    $("back-st").onclick = () => { D.student = null; render(); };
    $("v-students").querySelectorAll("[data-split]").forEach((b) => (b.onclick = () => { D.aliases[b.dataset.split] = "!"; relink(); }));
    if ($("join-go")) $("join-go").onclick = () => { const k = $("join-sel").value, o = D.students.find((x) => x.key === k); if (!o) return;
      new Set(o.rows.map((r) => r.raw)).forEach((sp) => (D.aliases[sp] = s.key)); relink(); };
    if ($("alias-reset")) $("alias-reset").onclick = (e) => { e.preventDefault(); D.aliases = {}; relink(); };
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
  async function tests() {
    const box = $("v-tests"), M = (D.mocks && D.mocks.mocks) || [], T = D.t;
    if (!M.length) { box.innerHTML = '<h2>Пробные тесты</h2><p class="hint">Не удалось загрузить тесты. Обновите страницу.</p>'; return; }
    if (!T.mid) { const last = [...D.rows].reverse().find((r) => r.kind === "P"); T.mid = last ? last.lesson.split("·")[0] : M[0].id; }
    const mock = M.find((m) => m.id === T.mid) || M[0]; T.mid = mock.id;
    if (!mock.sections.some((s) => s.k === T.sec)) T.sec = mock.sections[0].k;
    const S = mock.sections.find((s) => s.k === T.sec), runs = mockRuns(mock.id, S.k);
    const took = (mod) => runs.filter((x) => mod === "m1" || x.m2 === mod);
    if (!MODN[T.mod]) T.mod = "m1";
    const nSub = (m) => new Set(D.rows.filter((r) => r.lesson.split("·")[0] === m.id).map((r) => r.key)).size;
    let html = `<h2>Пробные тесты</h2><p class="hint">Все вопросы каждого теста с верным ответом и разбором. Под каждым вопросом — что выбрал каждый ученик (последняя сдача этого раздела). Число на кнопке теста — сколько учеников его сдали.</p>
      <div class="chips" id="t-mock">${M.map((m) => { const k = nSub(m); return `<button class="chip" data-m="${m.id}" aria-pressed="${m.id === mock.id}">${m.id}${k ? ` · ${k}` : ""}</button>`; }).join("")}</div>
      <div class="chips" id="t-sec" style="margin-top:8px">${mock.sections.map((s) => `<button class="chip" data-s="${s.k}" aria-pressed="${s.k === S.k}">${esc(s.name)}</button>`).join("")}</div>`;
    if (runs.length) {
      html += `<h2>Кто сдал · ${runs.length}</h2>` + table(["Ученик", "Когда", "Модуль 1", "Модуль 2", "Верно", "Примерный балл", "Сдач"], runs.map((x) => ({ k: x.r.key,
        cells: [`<b>${esc(x.r.name)}</b>`, when(x.r.ts), `${x.m1}/${S.n}`, `${x.m2 === "m2h" ? "сложный" : "лёгкий"} · ${x.m2raw}/${S.n}`, `${x.r.a}/${x.r.b} · ${pct(x.r.pct)}`, x.est ? `≈ ${x.est}` : "—", x.count] })), { click: true, num: [2, 4, 5, 6] });
    } else html += '<p class="hint" style="margin-top:18px">Этот раздел пока никто не сдал. Вопросы и разборы ниже всё равно доступны.</p>';
    html += `<div class="chips" id="t-mod" style="margin-top:22px">${Object.keys(MODN).map((m) => `<button class="chip" data-d="${m}" aria-pressed="${m === T.mod}">${MODN[m]}${runs.length ? ` · ${took(m).length}` : ""}</button>`).join("")}</div>
      <div class="row t-filters"><select id="t-who" aria-label="Ученик"><option value="">Все ученики</option>${runs.map((x) => `<option value="${esc(x.r.key)}"${x.r.key === T.who ? " selected" : ""}>${esc(x.r.name)}</option>`).join("")}</select>
      <label class="onlybad"><input type="checkbox" id="t-bad"${T.bad ? " checked" : ""}> Только вопросы с ошибками</label>
      <label class="onlybad"><input type="checkbox" id="t-sort"${T.sort ? " checked" : ""}> Сначала самые трудные</label>
      <button class="btn ghost" id="t-open">Раскрыть все</button></div><div id="t-list"><p class="hint">Загружаю вопросы…</p></div>`;
    box.innerHTML = html;
    box.querySelectorAll("#t-mock .chip").forEach((b) => (b.onclick = () => { T.mid = b.dataset.m; T.mod = "m1"; T.who = ""; render(); }));
    box.querySelectorAll("#t-sec .chip").forEach((b) => (b.onclick = () => { T.sec = b.dataset.s; T.mod = "m1"; render(); }));
    box.querySelectorAll("#t-mod .chip").forEach((b) => (b.onclick = () => { T.mod = b.dataset.d; render(); }));
    box.querySelectorAll("tr.click").forEach((tr) => (tr.onclick = () => { T.who = tr.dataset.k; const x = runs.find((y) => y.r.key === T.who); if (x && T.mod !== "m1" && T.mod !== x.m2) T.mod = x.m2; render(); }));
    $("t-who").onchange = () => { T.who = $("t-who").value; const x = runs.find((y) => y.r.key === T.who); if (x && T.mod !== "m1" && T.mod !== x.m2) T.mod = x.m2; render(); };
    $("t-bad").onchange = () => { T.bad = $("t-bad").checked; render(); };
    $("t-sort").onchange = () => { T.sort = $("t-sort").checked; render(); };
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
        return `<div class="ropt${L === q.ans ? " right" : ""}${mine && mine.a === L ? " mine" : ""}"><span class="lt">${L}</span><span class="qhtml">${o}</span><span class="tg">${L === q.ans ? "верный · " : ""}${by.length}${by.length ? ` · ${by.map((c) => esc(c.x.r.name)).join(", ")}` : ""}</span></div>`; }).join("")
        : `<p class="hint">Ответ вводится. Принимаются: ${esc(q.acc.join(", "))}.${ch.length ? ` Ответы учеников: ${ch.map(tag).join(" ")}` : ""}</p>`;
      return `<details class="rv tq${right < ch.length ? " bad" : ""}"><summary><span class="mk ${!ch.length ? "" : right === ch.length ? "ok" : "no"}">${q.n}</span>
        <span class="tq-s"><b>${esc(q.sk)}</b> <small>· ${DOMN[q.dom] || q.dom} · ${DIFN[q.d] || q.d}${q.own ? " · авторский" : " · College Board"} · ответ ${esc(q.ans)}</small>
        <br><small>${ch.length ? `верно ${right} из ${ch.length}${mine ? ` · ${esc(focus.r.name)}: ${esc(mine.a || "без ответа")} ${mine.ok ? "✓" : "✗"}` : ""}` : "никто не решал"}</small>
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
      html += `<h2>${esc(D.lesson[0] === "P" ? `Пробный тест ${D.lesson.slice(2).replace("·", " · ")}` : whatOf(rows[0] || { kind: D.lesson[0], lesson: D.lesson }))}</h2>` + table(["Ученик", "Лучший", "Сдач", "Последняя"], D.students.filter((s) => rows.some((r) => r.key === s.key)).map((s) => { const rs = rows.filter((r) => r.key === s.key), b = best(rs);
        return { k: s.key, cells: [esc(s.name), `${b.a}/${b.b} · ${pct(b.pct)}`, rs.length, when(rs[rs.length - 1].ts)] }; }), { num: [1, 2] });
      const qs = {}; rows.forEach((r) => r.wrong.forEach((n) => (qs[n] = (qs[n] || 0) + 1)));
      html += `<h2>Чаще всего ошибаются</h2><div id="les-miss"></div>`;
      $("v-lessons").innerHTML = html; hbars($("les-miss"), Object.entries(qs).map(([n, k]) => ({ label: /\./.test(n) ? `Модуль ${n.split(".")[0]} · вопрос ${n.split(".")[1]}` : `Вопрос ${n}`, value: (100 * k) / rows.length, n: rows.length })).sort((a, b) => b.value - a.value).slice(0, 10));
    }
    $("les-pick").querySelectorAll(".chip").forEach((b) => (b.onclick = () => { D.lesson = b.dataset.t; render(); }));
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
    rd.onload = () => { try { D.demo = false; load(rd.result, "файл " + f.name); cloudSave(); } catch (e) { $("src-msg").textContent = e.message; } };
    rd.readAsText(f, "utf-8");
  }
  // ---------- the answers in the cloud (api/admin/form, admin key only, encrypted here): the dashboard and the cabinet open them
  // on any device without loading the file again
  let lastSaved = "";
  async function cloudSave() {
    if (!SITE.adminKey() || !D.csv) return;
    const body = JSON.stringify({ csv: D.csv, aliases: D.aliases }); if (body === lastSaved) return;
    try { const r = await SITE.api("admin/form", { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({ csv: D.csv, aliases: D.aliases, at: Date.now() }) }) });
      if (r.ok) { lastSaved = body; $("st-line").insertAdjacentHTML("beforeend", ' <span class="pill">сохранено в кабинете</span>'); } } catch (e) { /* offline: the page still works */ }
  }
  async function cloudLoad() {
    if (!SITE.adminKey()) return false;
    try { const r = await SITE.api("admin/form"); if (!r.ok) return false; const f = await SITE.unsealBlob(r.data.data); if (!f || !f.csv) return false;
      D.aliases = Object.assign({}, f.aliases || {}, D.aliases); D.demo = false; load(f.csv, "сохранено " + new Date(r.data.at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
      lastSaved = JSON.stringify({ csv: f.csv, aliases: D.aliases }); return true; } catch (e) { return false; }
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
  $("demo").onclick = () => { D.demo = true; const a = D.aliases; D.aliases = {}; load(demoCSV(), "пример"); D.aliases = a; };
  $("tabs").querySelectorAll(".chip").forEach((b) => (b.onclick = () => { D.view = b.dataset.v; if (D.view !== "students") D.student = null; render(); }));
  addEventListener("resize", () => { if (!$("dash").classList.contains("hidden") && D.view === "overview") render(); });


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
  const siteUrl = () => location.href.replace(/teacher(\.html)?([?#].*)?$/, "");
  const accMsg = (t) => ($("acc-msg").textContent = t);
  async function accLoad() { try { ACC.a = await SITE.access(); ACC.list = await SITE.accounts(ACC.a); accRender(); } catch (e) { $("acc-list").innerHTML = '<p class="hint">Не удалось загрузить список логинов. Обновите страницу.</p>'; } }
  function accRender() {
    if (!ACC.a) return;
    const me = SITE.me();
    $("acc-list").innerHTML = ACC.list.length ? table(["Ученик", "Логин", ""], ACC.list.slice().sort((x, y) => x.name.localeCompare(y.name, "ru")).map((u) => ({ k: u.id,
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
  SITE.ready.then(accLoad);

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
    $("reg-list").innerHTML = REG.list.length ? table(["Ученик", "Логин", "Создан", ""], REG.list.slice().sort((x, y) => String(x.name).localeCompare(String(y.name), "ru")).map((u) => ({ k: u.id,
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
  SITE.ready.then(regLoad);

  $("gh-save").onclick = () => {
    const raw = $("gh-token").value, tok = cleanTok(raw);
    if (raw.trim() && !/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(tok)) { store("gh_token", null); ghState(); $("gh-state").textContent = "· это не похоже на токен GitHub: он начинается с github_pat_ и состоит только из латинских букв, цифр и _. Скопируйте токен заново и вставьте только его."; return; }
    if (tok) store("gh_token", tok); store("gh_repo", $("gh-repo").value.trim() || GH().repo); store("gh_branch", $("gh-branch").value.trim() || DEP.branch || "main"); $("gh-token").value = ""; ghState(); };
  $("gh-forget").onclick = () => { store("gh_token", null); ghState(); };
  ghState();

  Promise.all(["lessons", "practice", "reading", "mocks"].map((f) => SITE.json(f).catch(() => null))).then(([l, p, t, m]) => {
    D.lessons = (l && l.lessons) || []; D.sets = (p && p.sets) || []; D.texts = (t && t.texts) || []; D.mocks = m;
    try { D.aliases = JSON.parse(store("name_alias") || "{}") || {}; } catch (e) { D.aliases = {}; }
    const u = store("teacher_url"); if (u) { $("url").value = u; fromUrl(u); } else SITE.ready.then(cloudLoad);
  });
  window.__teacher = { parseCSV, parseDate, columns };   // for testing
})();
