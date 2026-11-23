/* Импорт результатов Bluebook (2026-11-23; pilot by Codex, generalised by Claude).
   The student copies College Board My Practice → Score Details (the table, or the whole page with Ctrl+A / «Выбрать всё»)
   and pastes it on «Пробные тесты». Everything is read in this browser tab; nothing is sent.
   - parse(): rows «N  Section  Correct answer(s)  Your answer; Status». Tabs, line breaks, extra page text around the table,
     non-breaking spaces and «\» line endings are tolerated. Question numbers restart at 1 for module 2.
   - detect(): the ordered correct answers of a section are compared with every test of the catalog (data/bluebook.bin,
     tools/bluebook/build_catalog.py: College Board IDs, keys and skills of SAT Practice Tests 4–11, no question text).
     Module 1 is shared, module 2 is easier (m2e) or harder (m2h). A skill is shown only for a single exact match.
   - Fractions and finite decimals are compared as exact numbers (441/100 = 4.410 ≠ 4.4101). */
(function () {
  "use strict";
  const SIZES = { rw: 27, math: 22 };
  const LABEL = { rw: "Reading and Writing", math: "Math" };
  const STATUS = /\b(correct|incorrect|omitted|unanswered|not answered|skipped|no answer)\b/i;
  const strip = (v) => String(v).trim().replace(/−/g, "-").replace(/[–—]/g, (c, i, s) => (s.trim() === c ? "—" : "-"));

  // ---- parsing -------------------------------------------------------------------------------------------------------
  function parse(source) {
    const text = String(source || "").replace(/\r\n?/g, "\n").replace(/ /g, " ").replace(/\\[ \t]*$/gm, "");
    const rowStart = /^[ \t]*(\d{1,2})[ \t]*(?:\t|\n|[ \t]{1,})[ \t]*(Reading (?:and|&) Writing|Math)\b[ \t]*/gim;
    const starts = [...text.matchAll(rowStart)];
    if (!starts.length) throw new Error("Строки таблицы не найдены. Откройте Score Details и скопируйте таблицу вопросов целиком.");
    const rows = [], modules = { rw: [], math: [] };
    starts.forEach((entry, idx) => {
      const section = /math/i.test(entry[2]) ? "math" : "rw", question = +entry[1], parts = modules[section];
      if (question === 1) parts.push([]);
      const cur = parts[parts.length - 1];
      if (!cur || parts.length > 2 || question !== cur.length + 1 || question > SIZES[section]) {
        throw new Error(`Порядок вопросов нарушен у ${LABEL[section]} №${question}. Скопируйте таблицу заново, целиком и по порядку.`);
      }
      const end = starts[idx + 1] ? starts[idx + 1].index : text.length;
      let body = text.slice(entry.index + entry[0].length, end);
      const st = body.match(STATUS);
      if (!st) throw new Error(`У ${LABEL[section]} №${question} не найден результат (Correct / Incorrect / Omitted).`);
      body = body.slice(0, st.index + st[0].length);   // drops «Review» and any page text after the status
      const status = /^correct$/i.test(st[1]) ? "correct" : /^incorrect$/i.test(st[1]) ? "incorrect" : "omitted";
      // the status cell is «Your answer; Status» on its own line (or the last tab/space-separated cell); what comes before is the key
      const nl = body.lastIndexOf("\n", st.index); let line = body.slice(nl + 1), before = body.slice(0, nl + 1);
      const cells = line.split(/\t+| {2,}/); if (cells.length > 1) { line = cells.pop(); before += " " + cells.join(" "); }
      const mine = line.slice(0, line.search(STATUS)).replace(/[;,]\s*$/, "").trim(), keyText = before.replace(/\s+/g, " ").trim();
      const selected = status === "omitted" || !mine || /^[—-]$/.test(mine) ? null : strip(mine);
      // «Show Correct Answers» off: no key column. A correct answer is its own key; a wrong one is filled in from the catalog later
      let answers = keyText ? keyText.split(",").map(strip).filter(Boolean) : [], inferred = false;
      if (!answers.length && status === "correct" && selected) { answers = [selected]; inferred = true; }
      if (keyText && (status === "correct" && selected && /^[A-D]$/i.test(selected) && !answers.includes(selected.toUpperCase())) ||
          (status === "incorrect" && selected && answers.some((a) => same(a, selected)))) {
        throw new Error(`Данные вопроса ${LABEL[section]} №${question} противоречат друг другу. Скопируйте таблицу заново.`);
      }
      const row = { section, module: parts.length, question, answers, selected, status, ...(inferred || !answers.length ? { nokey: 1 } : {}) };
      cur.push(row); rows.push(row);
    });
    for (const s of Object.keys(SIZES)) {
      const p = modules[s];
      if (p.length && (p.length !== 2 || p.some((m) => m.length !== SIZES[s]))) {
        throw new Error(`${LABEL[s]}: прочитано ${p.map((m) => m.length).join(" + ")} из ${SIZES[s]} + ${SIZES[s]} вопросов. Над таблицей выберите «View: All», затем снова Ctrl+A и Ctrl+C.`);
      }
    }
    if (!modules.rw.length && !modules.math.length) throw new Error("Данные неполные.");
    return rows;
  }

  // ---- what else the copied page says: test name and date, totals, official domain scores (Knowledge and Skills) ------
  const DOMAINS = { rw: ["Information and Ideas", "Craft and Structure", "Expression of Ideas", "Standard English Conventions"],
    math: ["Algebra", "Advanced Math", "Problem-Solving and Data Analysis", "Geometry and Trigonometry"] };
  function parseMeta(source) {
    const text = String(source || "").replace(/\r\n?/g, "\n").replace(/\u00a0/g, " "), out = {};
    const h = text.match(/\b(SAT|PSAT\/NMSQT|PSAT 10|PSAT 8\/9)\s+Practice\s+(?:Test\s+)?(\d+)\s*[-–—]\s*([A-Z][a-z]+\.? \d{1,2},? \d{4})/);
    if (h) { out.program = h[1]; out.num = +h[2]; const t = Date.parse(h[3].replace(/\./, "")); if (!isNaN(t)) out.taken = t; out.title = `${h[1]} Practice ${h[2]}`; }
    const num = (label) => { const m = text.match(new RegExp("(\\d+)\\s*\\n\\s*" + label)); return m ? +m[1] : null; };
    out.total = num("Total Questions"); out.correct = num("Correct Answers"); out.incorrect = num("Incorrect Answers");
    const dom = {};
    for (const [sec, list] of Object.entries(DOMAINS)) for (const d of list) {
      const m = text.match(new RegExp("(?:^|\\n)" + d.replace(/[-/]/g, "\\$&") + "\\s*\\n[^]*?(\\d+) out of (\\d+)"));
      if (m) (dom[sec] = dom[sec] || {})[d] = [+m[1], +m[2]];
    }
    if (Object.keys(dom).length) out.domains = dom;
    return out;
  }

  // ---- exact answer comparison ---------------------------------------------------------------------------------------
  function canon(answer) {
    const t = strip(answer).toUpperCase();
    const fr = t.match(/^([+-]?\d+)\s*[\/⁄]\s*(\d+)$/), dec = t.match(/^([+-]?)(\d*)(?:\.(\d*))?$/);
    let n, d;
    if (fr) { n = BigInt(fr[1]); d = BigInt(fr[2]); }
    else if (dec && (dec[2] || dec[3])) { const f = dec[3] || ""; n = BigInt(dec[1] + (dec[2] || "0") + f); d = 10n ** BigInt(f.length); }
    else return t;
    if (!d) return t;
    let a = n < 0n ? -n : n, b = d; while (b) [a, b] = [b, a % b];
    return a ? `${n / a}/${d / a}` : "0/1";
  }
  const same = (x, y) => canon(x) === canon(y);

  // ---- which test and route --------------------------------------------------------------------------------------------
  function detect(rows, catalog, section) {
    const sel = rows.filter((r) => r.section === section);
    if (!sel.length || !catalog || !catalog.tests) return { matches: [] };
    const m1 = sel.filter((r) => r.module === 1), m2 = sel.filter((r) => r.module === 2), items = catalog.items || {};
    // a question fits when the table and the catalog share an accepted answer (typed answers may be listed with or without decimal forms)
    const meets = (k, answers) => { const c = new Set(answers.map(canon)); return k.some((x) => c.has(canon(x))); };
    // rows without a key (copied with «Show Correct Answers» off) are skipped, but most of each module must be known
    const fits = (ids, part) => ids && ids.length === part.length && part.filter((r) => r.answers.length).length >= part.length * 0.6 &&
      part.every((r, i) => items[ids[i]] && (!r.answers.length || meets(items[ids[i]].k, r.answers)));
    const matches = [];
    for (const [test, t] of Object.entries(catalog.tests)) {
      const s = t[section]; if (!s || !fits(s.m1, m1)) continue;
      for (const route of ["m2h", "m2e"]) if (fits(s[route], m2)) matches.push({ test, label: t.label, route, ids: [s.m1, s[route]] });
    }
    return { matches, match: matches.length === 1 ? matches[0] : null };
  }

  // after a single match, a row copied without its key gets the catalog key (and keeps the mark nokey)
  function fillKeys(rows, cat) {
    for (const section of Object.keys(SIZES)) {
      const m = detect(rows, cat, section).match; if (!m) continue;
      rows.filter((r) => r.section === section && r.nokey).forEach((r) => { const it = cat.items[m.ids[r.module - 1][r.question - 1]]; if (it) r.answers = it.k.slice(0, 3); });
    }
    return rows;
  }

  /* «Поделиться с преподавателем»: what the teacher gets. Only numbers, letters and skills: no question text, no College Board
     account. One attempt = one key bb_share_<hash of the rows>, so sharing the same table twice changes nothing.
     sec: { test, label, route, n, tot: [m1, m2], miss: [[module, q, chosen|null, keys, id|null, skill|null, level|null, unverified]],
            skills: { skill: [wrong, total] } }   (skills only with a single exact route match) */
  async function shareOf(rows, cat, meta = {}) {
    // the attempt's identity: its test, date and the student's own answers (not the key column, which may be switched off)
    const enc = new TextEncoder().encode((meta.title || "") + "|" + (meta.taken || "") + "|" + rows.map((r) => `${r.section}.${r.module}.${r.question}:${r.selected || ""}:${r.status}`).join(";"));
    const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc))].slice(0, 6).map((b) => b.toString(16).padStart(2, "0")).join("");
    const out = { v: 1, src: "bluebook", at: Date.now(), hash, sections: {}, ...(meta.taken ? { taken: meta.taken } : {}), ...(meta.title ? { title: meta.title } : {}) };
    for (const section of Object.keys(SIZES)) {
      const sel = rows.filter((r) => r.section === section); if (!sel.length) continue;
      const m = cat ? detect(rows, cat, section).match : null, items = (cat && cat.items) || {}, skills = {};
      const itemOf = (r) => (m ? m.ids[r.module - 1][r.question - 1] : null);
      if (m) sel.forEach((r) => { const it = items[itemOf(r)], k = it && (it.s || it.si); if (!k) return; const x = (skills[k] = skills[k] || [0, 0]); x[1]++; if (r.status !== "correct") x[0]++; });
      out.sections[section] = { test: m ? m.test : null, label: m ? m.label : null, route: m ? m.route : null, n: sel.length,
        tot: [1, 2].map((k) => sel.filter((r) => r.module === k && r.status === "correct").length),
        miss: sel.filter((r) => r.status !== "correct").map((r) => { const id = itemOf(r), it = items[id] || null;
          return [r.module, r.question, r.selected, r.answers, id, it ? it.s || it.si || null : null, it ? it.d || null : null, it && it.u ? 1 : 0]; }),
        skills, ...(meta.domains && meta.domains[section] ? { domains: meta.domains[section] } : {}) };
    }
    return out;
  }

  if (typeof module !== "undefined") { module.exports = { parse, detect, canon, shareOf, parseMeta, fillKeys }; return; }
  window.BBIMPORT = { parse, detect, canon, shareOf, parseMeta, fillKeys };

  // ---- page ----------------------------------------------------------------------------------------------------------------
  const details = document.getElementById("bb-import"); if (!details) return;
  const form = document.getElementById("bb-form"), input = document.getElementById("bb-text");
  const status = document.getElementById("bb-status"), result = document.getElementById("bb-result"), initial = status.textContent;
  let revision = 0, catalog, last = null;   // last: { rows, cat } of the shown preview
  const ROUTE = { m2h: "сложный", m2e: "лёгкий" };

  function loadCatalog() {
    if (!catalog) catalog = SITE.json("bluebook").catch(() => { catalog = undefined; return null; });
    return catalog;
  }
  function el(tag, text, cls) { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; }

  function render(rows, cat, meta = {}) {
    const out = document.createDocumentFragment();
    if (meta.title || meta.taken) out.append(el("p", `${meta.title || "Пробник Bluebook"}${meta.taken ? " · пройден " + new Date(meta.taken).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : ""}`, "bb-title"));
    if (meta.total && meta.total !== rows.length) out.append(el("p", `На странице ${meta.total} вопросов, прочитано ${rows.length}. Над таблицей выберите «View: All» и скопируйте снова.`, "bb-warn"));
    if (rows.some((r) => r.nokey)) out.append(el("p", cat ? "«Show Correct Answers» был выключен: правильные ответы взяты из справочника." : "«Show Correct Answers» выключен: включите его над таблицей и скопируйте снова, чтобы увидеть правильные ответы.", "hint"));
    for (const section of Object.keys(SIZES)) {
      const sel = rows.filter((r) => r.section === section); if (!sel.length) continue;
      const misses = sel.filter((r) => r.status !== "correct"), det = cat ? detect(rows, cat, section) : { matches: [] }, m = det.match;
      const tot = [1, 2].map((k) => sel.filter((r) => r.module === k && r.status === "correct").length);
      out.append(el("h3", `${LABEL[section]} · М1 ${tot[0]}/${SIZES[section]} · М2 ${tot[1]}/${SIZES[section]}`));
      if (m && meta.num && m.test !== "SAT" + meta.num) out.append(el("p", `В заголовке ${meta.title}, а ответы совпадают с ${m.label}. Проверьте, что скопирована страница нужного теста.`, "bb-warn"));
      const dm = meta.domains && meta.domains[section];
      if (dm) out.append(el("p", "Домены College Board: " + Object.entries(dm).map(([d, v]) => `${d} ${v[0]}/${v[1]}`).join(" · "), "hint"));
      out.append(el("p", m ? `${m.label} · модуль 2 ${ROUTE[m.route]}. Ошибок и пропусков: ${misses.length}.`
        : cat ? (det.matches.length > 1 ? "Таблица подходит к нескольким тестам: навыки скрыты." : "Тест не найден в справочнике (сейчас: SAT Practice Tests 4–11). Ошибки видны, навыки скрыты.")
          : `Ошибок и пропусков: ${misses.length}. Навыки загружаются…`, "hint"));
      if (!misses.length) continue;
      const ul = el("ul"); let seenN = 0, againN = 0;
      for (const r of misses) {
        const id = m && m.ids[r.module - 1][r.question - 1], it = id && cat.items[id];
        const skill = it ? (it.s || (it.si ? `${it.si} (по открытому индексу)` : "")) : "";
        const li = el("li", `М${r.module}, №${r.question} · ${r.selected == null ? "пропуск" : r.selected} → ${r.answers.join(", ")}${skill ? " · " + skill : ""}`);
        const rp = repeatsOf(id, m && m.test, cat);
        if (rp.length) { seenN++; if (rp.some((x) => x.wrong)) againN++;
          li.append(el("small", ` Этот вопрос есть и в: ${rp.map((x) => x.label + (x.wrong ? " (ошибка и тогда)" : x.right ? " (тогда верно)" : "")).join("; ")}.`, "bb-rep")); }
        ul.append(li);
      }
      if (seenN) out.append(el("p", `Из этих ошибок ${seenN} — вопросы, которые есть и в курсе или в других пробниках${againN ? `; в ${againN} из них вы ошиблись и тогда: это первые кандидаты на разбор` : ""}.`, "hint bb-repsum"));
      out.append(ul);
    }
    result.replaceChildren(out);
  }

  // where else this question was: in the course (catalog item c: course question ids) and in other Bluebook tests of the catalog
  let testsOf = null;
  function repeatsOf(id, test, cat) {
    if (!id || !cat) return [];
    if (!testsOf) { testsOf = new Map(); for (const [t, x] of Object.entries(cat.tests)) for (const sec of ["rw", "math"]) for (const ids of Object.values(x[sec] || {})) ids.forEach((i) => { if (!testsOf.has(i)) testsOf.set(i, new Set()); testsOf.get(i).add(t); }); }
    const it = cat.items[id] || {}, out = [], name = localStorage.getItem("hw_student") || "", get = (k) => localStorage.getItem(k);
    for (const ref of it.c || []) { const own = window.BBSHARE ? BBSHARE.ownMock(ref, it.k, get, name) : null;
      out.push({ label: window.BBSHARE ? BBSHARE.refLabel(ref) : ref, wrong: own === false, right: own === true }); }
    for (const t of testsOf.get(id) || []) if (t !== test) out.push({ label: (cat.tests[t] || {}).label || t });
    return out;
  }
  function clear() { revision++; last = null; result.replaceChildren(); status.textContent = initial; }

  // the share block under a preview: explicit confirmation, one key per attempt, only with the student's own login
  function shareBox() {
    const box = el("div", null, "bb-share"); result.append(box);
    const me = window.SITE && SITE.me ? SITE.me() : "";
    if (!me || /^lesson(-|$)/.test(me)) { box.append(el("p", "Чтобы поделиться результатом с преподавателем, войдите на сайт под своим логином.", "hint")); return; }
    const ask = el("button", "Поделиться с преподавателем", "btn"); ask.type = "button"; box.append(ask);
    const note = el("p", "", "hint"); note.setAttribute("role", "status"); box.append(note);
    ask.onclick = async () => {
      ask.disabled = true; await SITE.syncNow().catch(() => false); ask.disabled = false;   // see the teacher's latest change (a removal) first
      const data = await shareOf(last.rows, last.cat, last.meta), key = "bb_share_" + data.hash, was = localStorage.getItem(key);
      // a removed attempt (the teacher's mark) may be sent again (Nurassyl: «I may change my mind»); the teacher sees it was resent
      let removed = null;
      if (was) { let at = ""; try { const w = JSON.parse(was); if (w.deleted) removed = w.at || Date.now(); at = new Date(w.at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }); } catch (e) { /* old */ }
        if (!removed) { note.textContent = `Этот результат уже отправлен${at ? " " + at : ""}. Повторно отправлять не нужно.`; return; } }
      if (removed) Object.assign(data, { resent: 1, removedAt: removed });
      ask.hidden = true;
      const c = el("div", null, "bb-confirm");
      c.append(el("p", "Преподаватель увидит: какой это тест и модули, номера ошибок и пропусков, ваш выбор и правильный ответ, навыки. Текст вопросов и ваш аккаунт College Board не передаются."));
      const yes = el("button", "Отправить", "btn"), no = el("button", "Отмена", "btn ghost"); yes.type = no.type = "button";
      const row = el("div", null, "row"); row.append(yes, no); c.append(row); box.insertBefore(c, note); yes.focus();
      no.onclick = () => { c.remove(); ask.hidden = false; note.textContent = "Не отправлено."; };
      yes.onclick = async () => {
        yes.disabled = no.disabled = true; note.textContent = "Отправляю…";
        localStorage.setItem(key, JSON.stringify(data));   // synced with the account (auth.js SYNC: bb_share_)
        const saved = await SITE.syncNow().catch(() => false);
        c.remove();
        note.textContent = saved ? "Отправлено. Преподаватель увидит ошибки в своём кабинете и сможет разобрать их на уроке." : "Сохранено на этом устройстве. Отправится само, когда будет связь.";
      };
    };
  }
  async function check() {
    const req = ++revision;
    let rows; const meta = parseMeta(input.value);
    try { rows = parse(input.value); } catch (e) { result.replaceChildren(); status.textContent = e.message; return; }
    render(rows, null, meta);
    const misses = rows.filter((r) => r.status !== "correct").length, summary = `Прочитано ${rows.length} строк. Ошибок и пропусков: ${misses}.`;
    status.textContent = summary + " Определяем тест и модули…";
    const data = await loadCatalog();
    if (req !== revision) return;
    if (data) { fillKeys(rows, data); render(rows, data, meta); }
    last = { rows, cat: data, meta }; shareBox();
    status.textContent = data ? summary : summary + " Навыки пока недоступны: нажмите «Проверить таблицу» ещё раз, когда будет связь.";
  }

  SITE.ready.then(() => { details.hidden = false; });
  details.addEventListener("toggle", () => { if (details.open) loadCatalog(); });
  form.addEventListener("input", clear);
  form.addEventListener("reset", clear);
  input.addEventListener("paste", () => setTimeout(check, 0));   // checks at once after pasting
  form.addEventListener("submit", (e) => { e.preventDefault(); check(); });
})();
