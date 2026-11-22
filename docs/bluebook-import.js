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
      const fields = body.slice(0, st.index).split(/\t+|\n+| {2,}/).map((f) => f.trim()).filter(Boolean);
      // fields: [correct answer(s), your answer;] — the answer may share the field with «;» or stand alone
      let correct = fields[0] || "", mine = fields.slice(1).join(" ").replace(/[;,]\s*$/, "").trim();
      if (fields.length === 1 && /;/.test(correct)) { [correct, mine] = correct.split(/;(.*)/s).map((x) => x.trim()); }
      const answers = correct.split(",").map(strip).filter(Boolean);
      const selected = status === "omitted" || !mine || /^[—-]$/.test(mine) ? null : strip(mine);
      if (!answers.length) throw new Error(`У ${LABEL[section]} №${question} нет правильного ответа.`);
      if ((status === "correct" && selected && /^[A-D]$/i.test(selected) && !answers.includes(selected.toUpperCase())) ||
          (status === "incorrect" && selected && answers.some((a) => same(a, selected)))) {
        throw new Error(`Данные вопроса ${LABEL[section]} №${question} противоречат друг другу. Скопируйте таблицу заново.`);
      }
      const row = { section, module: parts.length, question, answers, selected, status };
      cur.push(row); rows.push(row);
    });
    for (const s of Object.keys(SIZES)) {
      const p = modules[s];
      if (p.length && (p.length !== 2 || p.some((m) => m.length !== SIZES[s]))) {
        throw new Error(`${LABEL[s]}: прочитано ${p.map((m) => m.length).join(" + ")} из ${SIZES[s]} + ${SIZES[s]} вопросов. Скопируйте таблицу целиком.`);
      }
    }
    if (!modules.rw.length && !modules.math.length) throw new Error("Данные неполные.");
    return rows;
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
  const sig = (answers) => JSON.stringify([...new Set(answers.map(canon))].sort());

  // ---- which test and route --------------------------------------------------------------------------------------------
  function detect(rows, catalog, section) {
    const sel = rows.filter((r) => r.section === section);
    if (!sel.length || !catalog || !catalog.tests) return { matches: [] };
    const m1 = sel.filter((r) => r.module === 1), m2 = sel.filter((r) => r.module === 2), items = catalog.items || {};
    const fits = (ids, part) => ids && ids.length === part.length && part.every((r, i) => items[ids[i]] && sig(items[ids[i]].k) === sig(r.answers));
    const matches = [];
    for (const [test, t] of Object.entries(catalog.tests)) {
      const s = t[section]; if (!s || !fits(s.m1, m1)) continue;
      for (const route of ["m2h", "m2e"]) if (fits(s[route], m2)) matches.push({ test, label: t.label, route, ids: [s.m1, s[route]] });
    }
    return { matches, match: matches.length === 1 ? matches[0] : null };
  }

  if (typeof module !== "undefined") { module.exports = { parse, detect, canon }; return; }
  window.BBIMPORT = { parse, detect, canon };

  // ---- page ----------------------------------------------------------------------------------------------------------------
  const details = document.getElementById("bb-import"); if (!details) return;
  const form = document.getElementById("bb-form"), input = document.getElementById("bb-text");
  const status = document.getElementById("bb-status"), result = document.getElementById("bb-result"), initial = status.textContent;
  let revision = 0, catalog;
  const ROUTE = { m2h: "сложный", m2e: "лёгкий" };

  function loadCatalog() {
    if (!catalog) catalog = SITE.json("bluebook").catch(() => { catalog = undefined; return null; });
    return catalog;
  }
  function el(tag, text, cls) { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; }

  function render(rows, cat) {
    const out = document.createDocumentFragment();
    for (const section of Object.keys(SIZES)) {
      const sel = rows.filter((r) => r.section === section); if (!sel.length) continue;
      const misses = sel.filter((r) => r.status !== "correct"), det = cat ? detect(rows, cat, section) : { matches: [] }, m = det.match;
      const tot = [1, 2].map((k) => sel.filter((r) => r.module === k && r.status === "correct").length);
      out.append(el("h3", `${LABEL[section]} · М1 ${tot[0]}/${SIZES[section]} · М2 ${tot[1]}/${SIZES[section]}`));
      out.append(el("p", m ? `${m.label} · модуль 2 ${ROUTE[m.route]}. Ошибок и пропусков: ${misses.length}.`
        : cat ? (det.matches.length > 1 ? "Таблица подходит к нескольким тестам: навыки скрыты." : "Тест не найден в справочнике (сейчас: SAT Practice Tests 4–11). Ошибки видны, навыки скрыты.")
          : `Ошибок и пропусков: ${misses.length}. Навыки загружаются…`, "hint"));
      if (!misses.length) continue;
      const ul = el("ul");
      for (const r of misses) {
        const id = m && m.ids[r.module - 1][r.question - 1], it = id && cat.items[id];
        const skill = it ? (it.s || (it.si ? `${it.si} (по открытому индексу)` : "")) : "";
        ul.append(el("li", `М${r.module}, №${r.question} · ${r.selected == null ? "пропуск" : r.selected} → ${r.answers.join(", ")}${skill ? " · " + skill : ""}`));
      }
      out.append(ul);
    }
    result.replaceChildren(out);
  }

  function clear() { revision++; result.replaceChildren(); status.textContent = initial; }
  async function check() {
    const req = ++revision;
    let rows;
    try { rows = parse(input.value); } catch (e) { result.replaceChildren(); status.textContent = e.message; return; }
    render(rows);
    const misses = rows.filter((r) => r.status !== "correct").length, summary = `Прочитано ${rows.length} строк. Ошибок и пропусков: ${misses}.`;
    status.textContent = summary + " Определяем тест и модули…";
    const data = await loadCatalog();
    if (req !== revision) return;
    if (data) render(rows, data);
    status.textContent = data ? summary : summary + " Навыки пока недоступны: нажмите «Проверить таблицу» ещё раз, когда будет связь.";
  }

  SITE.ready.then(() => { details.hidden = false; });
  details.addEventListener("toggle", () => { if (details.open) loadCatalog(); });
  form.addEventListener("input", clear);
  form.addEventListener("reset", clear);
  input.addEventListener("paste", () => setTimeout(check, 0));   // checks at once after pasting
  form.addEventListener("submit", (e) => { e.preventDefault(); check(); });
})();
