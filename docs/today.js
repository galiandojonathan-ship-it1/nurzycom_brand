// «Сегодня»: the start panel on the homework page for a logged-in student (2026-11-06, design in
// design/superpowers/specs/2026-11-06-student-today-design.md; layout after Nurassyl's moodboard: a stats strip, «Дальше»,
// the week, the practice-test trend in red, the latest submissions). Everything comes from this browser's results, which
// the account sync keeps. Estimated test scores are always «примерный балл», private to the student (hard rule 2).
(function () {
  "use strict";
  const pl = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many);   // Russian plural: 1 шаг, 2 шага, 5 шагов
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const HEX = '<svg class="td-hex" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4l24.2 14v28L32 60 7.8 46V18z"/></svg>';
  const COURSES = [["V", "Verbal"], ["M", "Math"], ["VM", "Verbal и Math"]];
  const DAY = 864e5, WD = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  let lessons = null;

  const est = (s) => PLAN.est(s);
  const midnight = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return +d; };
  const ago = (t) => {
    if (!t) return "";
    const days = Math.round((midnight(Date.now()) - midnight(t)) / DAY);
    return days <= 0 ? "сегодня" : days === 1 ? "вчера" : days < 7 ? `${days} дн. назад` : new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };
  const keys = () => { const out = []; for (let i = 0; i < localStorage.length; i++) out.push(localStorage.key(i)); return out; };
  const meta = () => { try { return JSON.parse(store("sync_meta") || "{}"); } catch (e) { return {}; } };
  const results = (name) => PLAN.results(name, keys(), store, meta(), lessons);   // every submitted result, newest first
  const safe = (h) => /^(https:\/\/|[a-z0-9_-]+\.html(\?|#|$)|\.\/)/i.test(String(h || ""));   // task links: site pages or https only
  const dueTxt = (d) => new Date(d + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  function tasks(name) {   // homework the teacher assigned in the cabinet (synced key «tasks»)
    const L = PLAN.taskState(name, store, meta()); if (!L.length) return "";
    const open = L.filter((x) => !x.done), done = L.filter((x) => x.done);
    const since = Date.now() - 7 * 864e5, recent = done.filter((x) => (x.at || 0) > since);
    if (!open.length && !recent.length) return "";
    const row = (x) => `<li class="${x.done ? "ok" : x.late ? "late" : ""}">
        <span class="tk-t">${esc(x.t)}${x.note ? `<small>${esc(x.note)}</small>` : ""}</span>
        <span class="tk-due">${x.done ? (x.result ? `сдано · ${esc(PLAN.est(x.result) ? "≈ " + PLAN.est(x.result) : x.result)}` : "сделано") : x.due ? `${x.late ? "просрочено · " : "до "}${esc(dueTxt(x.due))}` : "без срока"}</span>
        <span class="tk-go">${x.done ? "" : `${safe(x.href) ? `<a class="btn" href="${esc(x.href)}">Открыть</a>` : ""}${x.auto ? "" : `<button type="button" class="tlink" data-task="${esc(x.id)}">Сделано</button>`}`}</span></li>`;
    return `<section class="td-tasks" aria-label="Задания от преподавателя">
      <h3>Задания от преподавателя${open.length ? ` <b>${open.length}</b>` : ""}</h3>
      <ul>${open.map(row).join("")}${recent.map(row).join("")}</ul>
      ${open.length ? '<p class="td-note">Сданная работа отмечается сама. Задания без страницы отметьте кнопкой «Сделано».</p>' : '<p class="td-note">Все задания сделаны. Спасибо.</p>'}
    </section>`;
  }
  function week(R) {   // this week Mon–Sun: the days with at least one submission, and the run of days up to today
    const today = midnight(Date.now()), dow = (new Date(today).getDay() + 6) % 7, mon = today - dow * DAY;
    const days = new Set(R.filter((r) => r.t).map((r) => midnight(r.t)));
    const dots = WD.map((w, i) => ({ w, on: days.has(mon + i * DAY), today: i === dow, future: i > dow }));
    let run = 0, d = days.has(today) ? today : today - DAY; while (days.has(d)) { run++; d -= DAY; }
    return { dots, run, active: [...days].filter((x) => x >= mon).length };
  }
  function trend(T, min, max) {   // the estimated scores of finished tests as a red line on a quiet grid
    const W = 320, H = 150, L = 38, Rp = 12, Tp = 14, B = 26, n = T.length;
    const PAD = 22, x = (i) => (n === 1 ? (L + W - Rp) / 2 : L + PAD + (i * (W - L - Rp - 2 * PAD)) / (n - 1)), y = (v) => Tp + (1 - (v - min) / (max - min)) * (H - Tp - B);
    const stepT = max - min > 400 ? 200 : 100, ticks = []; for (let v = min; v <= max; v += stepT) ticks.push(v);   // round steps: 500 · 600 · 700
    return `<svg class="td-trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="Примерный балл по пробным тестам: ${T.map((t) => `${t.id} ${t.v}`).join(", ")}">
      ${ticks.map((v) => `<line x1="${L}" x2="${W - Rp}" y1="${y(v)}" y2="${y(v)}" class="g"/><text x="${L - 6}" y="${y(v) + 3}" class="ax" text-anchor="end">${v}</text>`).join("")}
      ${n > 1 ? `<polyline class="ln" points="${T.map((t, i) => `${x(i)},${y(t.v)}`).join(" ")}"/>` : ""}
      ${T.map((t, i) => `<a href="mock.html?t=${t.id}&r=1" aria-label="Пробный тест ${t.id.slice(2)}: результат и разбор"><circle cx="${x(i)}" cy="${y(t.v)}" r="4.5" class="pt"/><text x="${x(i)}" y="${y(t.v) - 10}" class="vl" text-anchor="middle">${t.v}</text><text x="${x(i)}" y="${H - 8}" class="ax" text-anchor="middle">${t.id}</text></a>`).join("")}
    </svg>`;
  }

  function render() {
    const box = $("today"); if (!box || !window.PLAN || !window.SITE || !SITE.me()) return;
    const name = (store("hw_student") || "").trim(); if (!name) return;
    const P = PLAN.state(PLAN.course()), todo = P.flat.filter((it) => !it.ok && !it.opt);
    const next = todo.find((it) => it.need) || todo[0], then = todo.filter((it) => it !== next).slice(0, 2);
    const R = results(name), Wk = week(R), first = name.split(" ")[0];
    const T = Array.from({ length: 19 }, (_, i) => `PT${i + 1}`).map((id) => ({ id, v: est(store(`mk_last_${name}_${id}`)) })).filter((x) => x.v);
    const full = P.course === "VM", lo = full ? 400 : 200, hi = full ? 1600 : 800;
    const vals = T.map((t) => t.v), min = Math.max(lo, Math.floor((Math.min(...vals, hi) - 60) / 100) * 100), max = Math.min(hi, Math.ceil((Math.max(...vals, lo) + 60) / 100) * 100);
    const lessonsDone = P.flat.filter((it) => /^[VM]\d\d-hw$/.test(it.id) && it.ok).length, lessonsAll = P.flat.filter((it) => /^[VM]\d\d-hw$/.test(it.id)).length;
    const stageLeft = next ? next.stage.items.reduce((a, g) => a + g.list.filter((it) => !it.ok && !it.opt).length, 0) : 0;
    const nextMock = P.flat.find((it) => /^PT\d+$/.test(it.id) && !it.ok && !it.opt);
    const pctDone = P.total ? Math.round((100 * P.done) / P.total) : 0;
    const hour = new Date().getHours(), hello = hour < 5 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
    const step = (it) => `${esc(it.stage.cap)}${it.crs ? ` · ${it.crs === "V" ? "Verbal" : "Math"}` : ""}`;
    const open = (it) => (it.href ? `<a class="btn" href="${esc(it.href)}">Начать</a>` : `<button class="btn" type="button" data-tick="${esc(it.id)}">Отметить сделанным</button>`);
    box.innerHTML = `
      <div class="td-head"><div><h2>${hello}, ${esc(first)}.</h2><p class="td-sub">Шаг за шагом: регулярность даёт балл.</p></div>
        <div class="td-course" role="group" aria-label="Курс">${COURSES.map(([c, t]) => `<button type="button" class="chip" data-c="${c}" aria-pressed="${P.course === c}">${t}</button>`).join("")}</div></div>
      ${tasks(name)}
      <div class="td-stats" aria-label="Прогресс">
        <div class="td-big"><span>План курса</span><b>${pctDone}%</b><div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pctDone}"><i style="width:${pctDone}%"></i></div></div>
        <div><b>${lessonsDone}<small> / ${lessonsAll}</small></b><span>уроков сдано</span></div>
        <div><b>${stageLeft}</b><span>${next ? `${pl(stageLeft, "шаг", "шага", "шагов")} в «${esc(next.stage.cap.toLowerCase())}»` : `${pl(stageLeft, "шаг остался", "шага осталось", "шагов осталось")}`}</span></div>
        <div><b>${nextMock ? nextMock.id : "—"}</b><span>${nextMock ? "следующий пробный тест" : "пробные тесты пройдены"}</span></div>
      </div>
      <div class="td-grid">
        <section class="td-next" aria-label="Дальше">${next ? `
          <p class="td-where">${HEX}<span>[ Дальше · ${step(next)} · ${esc(next.when.toLowerCase())} ]</span></p>
          <h3 class="td-title">${esc(next.t)}</h3>
          ${next.s ? `<p class="td-sub">${esc(next.s)}</p>` : ""}
          <div class="row">${open(next)}<a class="td-link" href="plan.html#st-${esc(next.stage.no)}">Весь урок в плане</a></div>
          ${then.length ? `<ol class="td-then">${then.map((it) => `<li><span>${esc(it.t)}<small>${step(it)}</small></span>${it.href ? `<a href="${esc(it.href)}" aria-label="Открыть: ${esc(it.t)}">Открыть</a>` : `<button type="button" class="tlink" data-tick="${esc(it.id)}">Сделано</button>`}</li>`).join("")}</ol>` : ""}`
          : `<p class="td-where">${HEX}<span>[ План пройден ]</span></p><h3 class="td-title">Все шаги сделаны</h3><p class="td-sub">Дальше: пробные тесты для практики и трудные слова в словаре.</p>`}
        </section>
        <section class="td-week" aria-label="Эта неделя">
          <h3>Эта неделя</h3>
          <p class="td-run"><b>${Wk.run}</b> ${Wk.run % 10 === 1 && Wk.run % 100 !== 11 ? "день" : [2, 3, 4].includes(Wk.run % 10) && ![12, 13, 14].includes(Wk.run % 100) ? "дня" : "дней"} подряд</p>
          <ol class="td-dots">${Wk.dots.map((d) => `<li class="${d.on ? "on" : ""}${d.today ? " now" : ""}${d.future ? " fut" : ""}" title="${d.w}${d.on ? ": были сдачи" : ""}"><i></i><span>${d.w}</span></li>`).join("")}</ol>
          <p class="td-note">${Wk.active ? `Занимались ${Wk.active} ${Wk.active === 1 ? "день" : Wk.active < 5 ? "дня" : "дней"} на этой неделе.` : "На этой неделе сдач пока нет. Начните с шага слева."}</p>
        </section>
        <section class="td-tests" aria-label="Пробные тесты">
          <h3>Пробные тесты · примерный балл</h3>
          ${T.length ? `${trend(T, min, max)}<p class="td-note">Оценка по таблице nurzycom, ±40 на раздел. Нажмите на точку, чтобы открыть разбор.</p>`
          : `<p class="td-sub">Пока ни одного. Начните с пробного теста 1: он покажет исходную точку.</p><a class="td-link" href="mock.html?t=PT1">Открыть пробный тест 1</a>`}
        </section>
        <section class="td-recent" aria-label="Последние сдачи">
          <h3>Последние сдачи</h3>
          ${R.length ? `<ul>${R.slice(0, 4).map((r) => `<li><span>${esc(r.label)}<small>${esc(ago(r.t))}</small></span><b>${esc(r.score)}</b></li>`).join("")}</ul>`
          : '<p class="td-sub">Здесь появятся ваши результаты после первой сдачи.</p>'}
        </section>
      </div>`;
    box.classList.remove("hidden"); document.body.classList.add("has-today");
    box.querySelectorAll(".td-course .chip").forEach((b) => (b.onclick = () => { store("plan_course", b.dataset.c); render(); }));
    box.querySelectorAll("[data-tick]").forEach((b) => (b.onclick = () => { PLAN.tick(b.dataset.tick, true); render(); }));
    box.querySelectorAll("[data-task]").forEach((b) => (b.onclick = () => {
      let D = []; try { D = JSON.parse(store("tasks_done") || "[]"); } catch (e) { D = []; }
      if (!D.includes(b.dataset.task)) D.push(b.dataset.task); store("tasks_done", JSON.stringify(D)); render();
    }));
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (!window.SITE) return;
    SITE.ready.then(() => {
      if (SITE.me()) {   // the login already sets the name: hide the name step and number the rest from 01
        const s = $("student-step");
        if (s) { s.classList.add("hidden"); document.querySelectorAll("#s-start .step:not(.hidden) .step-h .num").forEach((n, i) => (n.textContent = String(i + 1).padStart(2, "0"))); }
      }
      render();
      SITE.json("lessons").then((d) => { lessons = d.lessons || d; render(); }).catch(() => { /* part names stay short */ });
    });
  });
})();
