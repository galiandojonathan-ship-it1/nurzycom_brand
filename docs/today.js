// «Сегодня»: the start panel on the homework page for a logged-in student (2026-11-06, design in
// design/superpowers/specs/2026-11-06-student-today-design.md). Answers «what do I do now?» from the course plan
// (planlogic.js), shows plan progress, the estimated score of each finished practice test («примерный балл», private,
// hard rule 2) and the newest submissions. Everything comes from this browser's results, which the account sync keeps.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const HEX = '<svg class="td-hex" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4l24.2 14v28L32 60 7.8 46V18z"/></svg>';
  const COURSES = [["V", "Verbal"], ["M", "Math"], ["VM", "Verbal и Math"]];
  let lessons = null;

  const est = (s) => { const m = String(s || "").match(/≈\s*(\d+)/g); return m ? m.reduce((a, x) => a + Number(x.replace(/\D/g, "")), 0) : null; };
  const ago = (t) => {
    if (!t) return "";
    const d = new Date(t), days = Math.floor((Date.now() - t) / 864e5);
    return days <= 0 ? "сегодня" : days === 1 ? "вчера" : days < 7 ? `${days} дн. назад` : d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };
  // a stored result key → what the student did, in words they know from the menu
  function what(rest, kind) {
    if (kind === "mk") return `Пробный тест ${rest.replace(/^PT/, "")}`;
    if (kind === "rd") return `Текст ${Number(rest.slice(1))}`;
    if (kind === "px") return `Сложные вопросы · набор ${Number(rest.slice(1))}`;
    const [tag, pid] = rest.split("_"), l = lessons && lessons.find((x) => x.tag === tag), p = l && l.parts.find((x) => x.id === pid);
    const head = /^[VM]\d\d$/.test(tag) ? `${tag[0] === "V" ? "Verbal" : "Math"} · урок ${Number(tag.slice(1))}` : /^[ADU]\d\d$/.test(tag) ? `Набор ${tag}` : `Урок ${tag.slice(1)}`;
    return p ? `${head} · ${p.title}` : head;
  }
  function recent(name) {
    let meta = {}; try { meta = JSON.parse(store("sync_meta") || "{}"); } catch (e) { /* none */ }
    const out = [];
    for (const [kind, pre] of [["hw", `hw_last_${name}_`], ["px", `px_last_${name}_`], ["rd", `rd_last_${name}_`], ["mk", `mk_last_${name}_`]]) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i); if (!k.startsWith(pre)) continue;
        const v = store(k); if (!v) continue;
        out.push({ t: meta[k] || 0, label: what(k.slice(pre.length), kind), score: kind === "mk" ? (est(v) ? `≈ ${est(v)}` : v) : v });
      }
    }
    return out.sort((a, b) => b.t - a.t).slice(0, 3);
  }
  function tests(name) {
    const ids = ["PT1", "PT2", "PT3", "PT4", "PT5", "PT6", "PT7", "PT8", "PT9", "PT10", "PT11", "PT12"];
    return ids.map((id) => ({ id, v: est(store(`mk_last_${name}_${id}`)) })).filter((x) => x.v);
  }

  function render() {
    const box = $("today"); if (!box || !window.PLAN || !window.SITE || !SITE.me()) return;
    const name = (store("hw_student") || "").trim(); if (!name) return;
    const P = PLAN.state(PLAN.course()), todo = P.flat.filter((it) => !it.ok && !it.opt);
    const next = todo.find((it) => it.need) || todo[0], then = todo.filter((it) => it !== next).slice(0, 2);
    const T = tests(name), R = recent(name), first = name.split(" ")[0];
    const scaleMax = P.course === "VM" ? 1600 : 800, scaleMin = P.course === "VM" ? 400 : 200;
    const step = (it) => `${esc(it.stage.cap)}${it.crs ? ` · ${it.crs === "V" ? "Verbal" : "Math"}` : ""}`;
    const open = (it) => (it.href ? `<a class="btn" href="${esc(it.href)}">Открыть</a>` : `<button class="btn" type="button" data-tick="${esc(it.id)}">Отметить сделанным</button>`);
    box.innerHTML = `
      <div class="td-head"><h2>${esc(first)}, что дальше</h2>
        <div class="td-course" role="group" aria-label="Курс">${COURSES.map(([c, t]) => `<button type="button" class="chip" data-c="${c}" aria-pressed="${P.course === c}">${t}</button>`).join("")}</div></div>
      <div class="td-grid">
        <section class="td-next">${next ? `
          <p class="td-where">${HEX}<span>${step(next)} · ${esc(next.when.toLowerCase())}</span></p>
          <h3 class="td-title">${esc(next.t)}</h3>
          ${next.s ? `<p class="td-sub">${esc(next.s)}</p>` : ""}
          <div class="row">${open(next)}${next.href ? "" : ""}</div>
          ${then.length ? `<ol class="td-then">${then.map((it) => `<li><span>${esc(it.t)}<small>${step(it)}</small></span>${it.href ? `<a href="${esc(it.href)}" aria-label="Открыть: ${esc(it.t)}">Открыть</a>` : `<button type="button" class="tlink" data-tick="${esc(it.id)}">Сделано</button>`}</li>`).join("")}</ol>` : ""}`
          : `<h3 class="td-title">План пройден</h3><p class="td-sub">Все обязательные шаги сделаны. Дальше: пробные тесты для практики и трудные слова в словаре.</p>`}
        </section>
        <section class="td-prog" aria-label="План курса">
          <h3>План курса</h3>
          <p class="td-num"><b>${P.done}</b> из ${P.total} шагов</p>
          <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${P.total}" aria-valuenow="${P.done}"><i style="width:${P.total ? (100 * P.done) / P.total : 0}%"></i></div>
          <p class="td-sub">${next ? `Сейчас: ${esc(next.stage.cap.toLowerCase())}` : "Все уроки позади"}</p>
          <a class="td-link" href="plan.html">Весь план</a>
        </section>
        <section class="td-tests" aria-label="Пробные тесты">
          <h3>Пробные тесты</h3>
          ${T.length ? `<div class="td-bars">${T.map((x) => `<a class="td-bar" href="mock.html?t=${x.id}&r=1" title="Результат и разбор: пробный тест ${x.id.slice(2)}">
              <span class="td-v">${x.v}</span><i style="--h:${Math.max(6, Math.min(100, (100 * (x.v - scaleMin)) / (scaleMax - scaleMin)))}%"></i><span class="td-k">${x.id}</span></a>`).join("")}</div>
            <p class="td-note">Примерный балл: оценка по таблице nurzycom, ±40 на раздел. Нажмите на тест, чтобы открыть разбор.</p>`
          : `<p class="td-sub">Пока ни одного. Начните с пробного теста 1: он покажет исходную точку.</p><a class="td-link" href="mock.html?t=PT1">Открыть пробный тест 1</a>`}
        </section>
        <section class="td-recent" aria-label="Последние сдачи">
          <h3>Последние сдачи</h3>
          ${R.length ? `<ul>${R.map((r) => `<li><span>${esc(r.label)}<small>${esc(ago(r.t))}</small></span><b>${esc(r.score)}</b></li>`).join("")}</ul>`
          : '<p class="td-sub">Здесь появятся ваши результаты после первой сдачи.</p>'}
        </section>
      </div>`;
    box.classList.remove("hidden"); document.body.classList.add("has-today");
    box.querySelectorAll(".td-course .chip").forEach((b) => (b.onclick = () => { store("plan_course", b.dataset.c); render(); }));
    box.querySelectorAll("[data-tick]").forEach((b) => (b.onclick = () => { PLAN.tick(b.dataset.tick, true); render(); }));
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
