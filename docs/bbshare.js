/* Bluebook results a student chose to share (bluebook-import.js → synced key bb_share_<hash>), for the teacher's pages.
   fromCopy(B): the shares of one synced copy, newest first. html(shares, o): the card. mistakes(shares): misses as candidates for
   the Gemini picker (twins.js), only those with a College Board skill confirmed by the bank. No question text anywhere. */
window.BBSHARE = (() => {
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const SEC = { rw: "Reading and Writing", math: "Math" }, SIZE = { rw: 27, math: 22 }, ROUTE = { m2h: "модуль 2 сложный", m2e: "модуль 2 лёгкий" };
  const day = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  function fromCopy(B) {
    return Object.entries(B || {}).filter(([k, r]) => k.indexOf("bb_share_") === 0 && r && r.v != null)
      .map(([k, r]) => { try { const d = JSON.parse(r.v); return d && d.sections ? Object.assign(d, { key: k }) : null; } catch (e) { return null; } })
      .filter(Boolean).sort((a, b) => (b.at || 0) - (a.at || 0));
  }
  function html(shares, o = {}) {
    if (!shares.length) return o.empty ? `<p class="hint">${esc(o.empty)}</p>` : "";
    return `<div class="bbs">${shares.map((d) => `<details class="bbs-one"${o.open === false ? "" : " open"}><summary><b>Bluebook · ${esc(day(d.at))}</b>
        <small>${Object.entries(d.sections).map(([s, x]) => `${SEC[s]} ${x.tot[0] + x.tot[1]}/${x.n}`).join(" · ")} · отправлено учеником</small>
        ${o.del ? `<button class="chip" type="button" data-bbdel="${esc(d.key)}">Убрать</button>` : ""}</summary>
      ${Object.entries(d.sections).map(([s, x]) => {
        const sk = Object.entries(x.skills || {}).filter(([, v]) => v[0]).sort((a, b) => b[1][0] / b[1][1] - a[1][0] / a[1][1] || b[1][0] - a[1][0]);
        return `<div class="bbs-sec"><p><b>${SEC[s]}</b> · ${x.test ? `${esc(x.label)} · ${ROUTE[x.route] || ""}` : "тест не определён: навыки не подтверждены"} · М1 ${x.tot[0]}/${SIZE[s]} · М2 ${x.tot[1]}/${SIZE[s]}</p>
          ${sk.length ? `<p class="hint">Ошибки по навыкам (ошибок из вопросов навыка в этом тесте): ${sk.map(([k, v]) => `${esc(k)} ${v[0]} из ${v[1]}`).join(" · ")}</p>` : ""}
          ${x.miss.length ? `<table class="dt bbs-t"><thead><tr><th>Модуль</th><th class="num">№</th><th>Выбор → ответ</th><th>Навык</th></tr></thead><tbody>${x.miss.map((m) =>
            `<tr><td>М${m[0]}</td><td class="num">${m[1]}</td><td>${m[2] == null ? "пропуск" : esc(m[2])} → ${esc((m[3] || []).join(", "))}</td><td>${m[5] ? esc(m[5]) + (m[7] ? " <small>(по открытому индексу)</small>" : "") : '<span class="hint">не подтверждён</span>'}</td></tr>`).join("")}</tbody></table>` : '<p class="hint">Без ошибок.</p>'}</div>`; }).join("")}
      <p class="hint">Источник: College Board My Practice → Score Details, вставлено учеником. Навык задания взят из банка College Board; причину ошибки уточните в разборе с учеником.</p></details>`).join("")}</div>`;
  }
  function mistakes(shares) {
    const out = [];
    for (const d of shares) for (const [s, x] of Object.entries(d.sections)) {
      if (!x.test) continue;
      for (const m of x.miss) if (m[5] && !m[7]) out.push({ id: `BB.${d.hash}.${s}.${m[0]}.${m[1]}`, title: `Bluebook · ${x.label} · ${SEC[s]} · М${m[0]} · №${m[1]}`, plabel: `Bluebook · ${x.label}`,
        sec: s, sk: m[5], d: m[6] || "", chosen: /^[A-D]$/.test(m[2] || "") ? m[2] : "", ts: d.at, focus: "", trapKind: "", bb: { keys: m[3] || [] } });
    }
    return out;
  }
  return { fromCopy, html, mistakes };
})();
