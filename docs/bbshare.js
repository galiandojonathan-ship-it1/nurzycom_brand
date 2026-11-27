/* Bluebook results a student chose to share (bluebook-import.js → synced key bb_share_<hash>), for the teacher's pages.
   fromCopy(B, acct): the shares of one synced copy, newest first. html(shares, o): the card. mistakes(shares): misses as candidates for
   the Gemini picker (twins.js), only those with a College Board skill confirmed by the bank. No question text anywhere. */
window.BBSHARE = (() => {
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const SEC = { rw: "Reading and Writing", math: "Math" }, SIZE = { rw: 27, math: 22 }, ROUTE = { m2h: "модуль 2 сложный", m2e: "модуль 2 лёгкий" };
  // a course question id → words: «PT15.rw.m1.12» → «Пробный тест 15 · М1 · №12», «V03.p2.4» → «Урок 3 · часть 2 · №4»
  function refLabel(ref) {
    const p = String(ref).split(".");
    if (/^P[TR]\d+$/.test(p[0])) return `${p[0][1] === "R" ? "Прогноз" : "Пробный тест"} ${p[0].slice(2)} · ${p[2] === "m1" ? "М1" : "М2"} · №${p[3]}`;
    const m = /^([VM])(\d\d|A|D)$/.exec(p[0]);
    return m ? `${m[1] === "M" ? "Math · " : ""}Урок ${m[2].replace(/^0/, "")} · часть ${String(p[1]).replace(/^p/, "")} · №${p[2]}` : String(ref);
  }
  // the student's own answer to a course practice-test question, from the synced run (mk_done_<name>_<PT>): true right, false wrong, null unknown
  function ownMock(ref, keys, get, name) {
    const p = String(ref).split("."); if (!/^P[TR]\d+$/.test(p[0])) return null;
    try { const d = JSON.parse(get(`mk_done_${name}_${p[0]}`) || "null"), a = d && d.ans && d.ans[`${p[1]}.${p[2]}`] && d.ans[`${p[1]}.${p[2]}`][p[3]];
      return a == null ? null : (keys || []).some((k) => String(k).toUpperCase() === String(a).toUpperCase()); } catch (e) { return null; }
  }
  const dayTime = (t) => { const d = new Date(t); return `${d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} в ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`; };
  const day = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  function verifyTitle(d) {
    const heading = /^(SAT|PSAT\/NMSQT|PSAT 10|PSAT 8\/9) Practice (?:Test )?(\d+)$/i.exec(d.title || "");
    if (!heading) return d;
    for (const [s, x] of Object.entries(d.sections)) {
      if (!x.test || (heading[1].toUpperCase() === "SAT" && x.test === "SAT" + heading[2])) continue;
      // Keep the student's answers from legacy reports but suppress IDs inferred from a conflicting test.
      d.sections[s] = { ...x, test: null, label: null, route: null, conflict: x.label || x.test, skills: {},
        miss: x.miss.map((m) => m.slice(0, 4).concat(null, null, null, 0)) };
    }
    return d;
  }
  function fromCopy(B, acct) {   // acct: the account id of this copy; a record stamped by another account is not its own
    return Object.entries(B || {}).filter(([k, r]) => k.indexOf("bb_share_") === 0 && r && r.v != null)
      .map(([k, r]) => { try { const d = JSON.parse(r.v); return d && d.sections && !d.deleted && (!acct || !d.own || d.own === acct) ? Object.assign(verifyTitle(d), { key: k }) : null; } catch (e) { return null; } })
      .filter(Boolean).sort((a, b) => (b.taken || b.at || 0) - (a.taken || a.at || 0));   // by the date the test was taken
  }
  function html(shares, o = {}) {
    if (!shares.length) return o.empty ? `<p class="hint">${esc(o.empty)}</p>` : "";
    return `<div class="bbs">${shares.map((d, i) => `<details class="bbs-one"${o.open === false ? "" : " open"}><summary><b>Bluebook · ${esc(Object.values(d.sections).map((x) => x.label).find(Boolean) || d.title || "тест не определён")}${d.taken ? ` · пройден ${esc(day(d.taken))}` : ` · ${esc(day(d.at))}`}</b>
        <small>${Object.entries(d.sections).map(([s, x]) => (x.skip && x.skip[0] && x.skip[1] ? `${SEC[s]} не решался` : `${SEC[s]} ${x.tot[0] + x.tot[1]}/${x.n}`)).join(" · ")} · отправлено учеником ${esc(dayTime(d.at))}</small>
        ${d.resent ? `<span class="bbs-resent">отправлен снова после удаления${d.removedAt ? ` ${esc(day(d.removedAt))}` : ""}</span>` : ""}
        ${o.del ? `<button class="chip" type="button" data-bbdel="${esc(d.key)}">Убрать</button>` : ""}</summary>
      ${Object.entries(d.sections).map(([s, x]) => {
        const sk = Object.entries(x.skills || {}).filter(([, v]) => v[0]).sort((a, b) => b[1][0] / b[1][1] - a[1][0] / a[1][1] || b[1][0] - a[1][0]);
        return `<div class="bbs-sec"><p><b>${SEC[s]}</b> · ${x.test ? `${esc(x.label)} · ${ROUTE[x.route] || ""}${d.title ? "" : " · определён по ключам"}` : "тест не определён: навыки не подтверждены"} · ${x.skip && x.skip[0] && x.skip[1] ? "раздел не решался" : `М1 ${x.skip && x.skip[0] ? "не решался" : `${x.tot[0]}/${SIZE[s]}`} · М2 ${x.skip && x.skip[1] ? "не решался" : `${x.tot[1]}/${SIZE[s]}`}`}</p>
          ${x.conflict ? `<p class="hint">В исходном отчёте: ${esc(d.title)}. По ключам получился ${esc(x.conflict)}. Привязка к вопросам скрыта из-за расхождения.</p>` : ""}
          ${x.skip ? `<p class="hint">${x.skip[0] && x.skip[1] ? "Ученик не решал этот раздел (почти все ответы пропущены)" : `Модуль ${x.skip[0] ? 1 : 2} не решался`}: пропуски не считаются ошибками и в анализ не входят.</p>` : ""}
          ${x.domains ? `<p class="hint">Домены College Board: ${Object.entries(x.domains).map(([k, v]) => `${esc(k)} ${v[0]}/${v[1]}`).join(" · ")}</p>` : ""}
          ${sk.length ? `<p class="hint">Ошибки по навыкам (ошибок из вопросов навыка в этом тесте): ${sk.map(([k, v]) => `${esc(k)} ${v[0]} из ${v[1]}`).join(" · ")}</p>` : ""}
          ${o.preview && x.miss.some((m) => m[2] != null && !x.skip?.[m[0] - 1]) ? `<p><button type="button" class="btn ghost" data-bb-preview="${i}:${s}">Открыть вопросы с ошибками</button></p>` : ""}
          ${x.skip && x.skip[0] && x.skip[1] ? "" : x.miss.length ? `<table class="dt bbs-t"><thead><tr><th>Модуль</th><th class="num">№</th><th>Выбор → ответ</th><th>Навык${o.rep ? " · повторы" : ""}</th></tr></thead><tbody>${x.miss.map((m) =>
            `<tr><td>М${m[0]}</td><td class="num">${m[1]}</td><td>${m[2] == null ? "пропуск" : esc(m[2])} → ${esc((m[3] || []).join(", "))}</td><td>${m[5] ? esc(m[5]) + (m[7] ? " <small>(по открытому индексу)</small>" : "") : '<span class="hint">не подтверждён</span>'}${o.rep && m[4] ? o.rep(m[4], d, m) : ""}</td></tr>`).join("")}</tbody></table>` : '<p class="hint">Без ошибок.</p>'}</div>`; }).join("")}
      <p class="hint">Источник: College Board My Practice → Score Details, вставлено учеником. Навык задания взят из банка College Board; причину ошибки уточните в разборе с учеником.</p></details>`).join("")}</div>`;
  }
  // a removed share stays as a mark (not deleted), so the student's devices do not bring it back and the same attempt cannot be resent
  const tomb = (d) => JSON.stringify({ v: 1, deleted: 1, at: Date.now(), hash: d.hash, title: d.title || null, taken: d.taken || null });
  function mistakes(shares) {
    const out = [];
    for (const d of shares) for (const [s, x] of Object.entries(d.sections)) {
      if (!x.test) continue;
      const skip = x.skip || [1, 2].map((k) => x.miss.filter((m) => m[0] === k && m[2] == null).length >= SIZE[s] * 0.8);   // modules not done
      for (const m of x.miss) if (m[5] && !m[7] && !skip[m[0] - 1]) out.push({ id: `BB.${d.hash}.${s}.${m[0]}.${m[1]}`, title: `Bluebook · ${x.label} · ${SEC[s]} · М${m[0]} · №${m[1]}`, plabel: `Bluebook · ${x.label}`,
        sec: s, sk: m[5], d: m[6] || "", chosen: /^[A-D]$/.test(m[2] || "") ? m[2] : "", ts: d.taken || d.at, focus: "", trapKind: "", bb: { keys: m[3] || [] } });
    }
    return out;
  }
  return { fromCopy, html, mistakes, refLabel, ownMock, tomb };
})();
