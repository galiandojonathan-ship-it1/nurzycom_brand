/* Bluebook results a student chose to share (bluebook-import.js → synced key bb_share_<hash>), for the teacher's pages.
   fromCopy(B): the shares of one synced copy, newest first. html(shares, o): the card. mistakes(shares): misses as candidates for
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
  const day = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  function fromCopy(B) {
    return Object.entries(B || {}).filter(([k, r]) => k.indexOf("bb_share_") === 0 && r && r.v != null)
      .map(([k, r]) => { try { const d = JSON.parse(r.v); return d && d.sections && !d.deleted ? Object.assign(d, { key: k }) : null; } catch (e) { return null; } })
      .filter(Boolean).sort((a, b) => (b.taken || b.at || 0) - (a.taken || a.at || 0));   // by the date the test was taken
  }
  function html(shares, o = {}) {
    if (!shares.length) return o.empty ? `<p class="hint">${esc(o.empty)}</p>` : "";
    return `<div class="bbs">${shares.map((d) => `<details class="bbs-one"${o.open === false ? "" : " open"}><summary><b>Bluebook · ${esc(Object.values(d.sections).map((x) => x.label).find(Boolean) || d.title || "тест не определён")}${d.taken ? ` · пройден ${esc(day(d.taken))}` : ` · ${esc(day(d.at))}`}</b>
        <small>${Object.entries(d.sections).map(([s, x]) => `${SEC[s]} ${x.tot[0] + x.tot[1]}/${x.n}`).join(" · ")} · отправлено учеником${d.taken ? ` ${esc(day(d.at))}` : ""}</small>
        ${d.resent ? `<span class="bbs-resent">отправлен снова после удаления${d.removedAt ? ` ${esc(day(d.removedAt))}` : ""}</span>` : ""}
        ${o.del ? `<button class="chip" type="button" data-bbdel="${esc(d.key)}">Убрать</button>` : ""}</summary>
      ${Object.entries(d.sections).map(([s, x]) => {
        const sk = Object.entries(x.skills || {}).filter(([, v]) => v[0]).sort((a, b) => b[1][0] / b[1][1] - a[1][0] / a[1][1] || b[1][0] - a[1][0]);
        return `<div class="bbs-sec"><p><b>${SEC[s]}</b> · ${x.test ? `${esc(x.label)} · ${ROUTE[x.route] || ""}` : "тест не определён: навыки не подтверждены"} · М1 ${x.tot[0]}/${SIZE[s]} · М2 ${x.tot[1]}/${SIZE[s]}</p>
          ${x.domains ? `<p class="hint">Домены College Board: ${Object.entries(x.domains).map(([k, v]) => `${esc(k)} ${v[0]}/${v[1]}`).join(" · ")}</p>` : ""}
          ${sk.length ? `<p class="hint">Ошибки по навыкам (ошибок из вопросов навыка в этом тесте): ${sk.map(([k, v]) => `${esc(k)} ${v[0]} из ${v[1]}`).join(" · ")}</p>` : ""}
          ${x.miss.length ? `<table class="dt bbs-t"><thead><tr><th>Модуль</th><th class="num">№</th><th>Выбор → ответ</th><th>Навык${o.rep ? " · повторы" : ""}</th></tr></thead><tbody>${x.miss.map((m) =>
            `<tr><td>М${m[0]}</td><td class="num">${m[1]}</td><td>${m[2] == null ? "пропуск" : esc(m[2])} → ${esc((m[3] || []).join(", "))}</td><td>${m[5] ? esc(m[5]) + (m[7] ? " <small>(по открытому индексу)</small>" : "") : '<span class="hint">не подтверждён</span>'}${o.rep && m[4] ? o.rep(m[4], d, m) : ""}</td></tr>`).join("")}</tbody></table>` : '<p class="hint">Без ошибок.</p>'}</div>`; }).join("")}
      <p class="hint">Источник: College Board My Practice → Score Details, вставлено учеником. Навык задания взят из банка College Board; причину ошибки уточните в разборе с учеником.</p></details>`).join("")}</div>`;
  }
  // a removed share stays as a mark (not deleted), so the student's devices do not bring it back and the same attempt cannot be resent
  const tomb = (d) => JSON.stringify({ v: 1, deleted: 1, at: Date.now(), hash: d.hash, title: d.title || null, taken: d.taken || null });
  function mistakes(shares) {
    const out = [];
    for (const d of shares) for (const [s, x] of Object.entries(d.sections)) {
      if (!x.test) continue;
      for (const m of x.miss) if (m[5] && !m[7]) out.push({ id: `BB.${d.hash}.${s}.${m[0]}.${m[1]}`, title: `Bluebook · ${x.label} · ${SEC[s]} · М${m[0]} · №${m[1]}`, plabel: `Bluebook · ${x.label}`,
        sec: s, sk: m[5], d: m[6] || "", chosen: /^[A-D]$/.test(m[2] || "") ? m[2] : "", ts: d.taken || d.at, focus: "", trapKind: "", bb: { keys: m[3] || [] } });
    }
    return out;
  }
  return { fromCopy, html, mistakes, refLabel, ownMock, tomb };
})();
