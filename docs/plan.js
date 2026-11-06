// Course plan: what to do after each lesson, in order. Items the student submitted on this device tick themselves
// (from the results the other pages keep in localStorage); the rest are ticked by hand and kept per student.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const nn = (n) => String(n).padStart(2, "0");

  // the plan itself is built by planlogic.js (shared with the «Сегодня» panel)
  let course = PLAN.course();
  const student = PLAN.student, doneKey = PLAN.doneKey;
  let manual = new Set();
  const loadManual = () => { manual = PLAN.manual(); };
  const stages = () => PLAN.stages(course);

  function render() {
    loadManual();
    $("courses").querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === course)));
    const S = stages();
    let total = 0, done = 0, cur = null;
    S.forEach((st) => st.items.forEach((g) => g.list.forEach((it) => { it.ok = !!it.res || manual.has(it.id); total++; if (it.ok) done++; })));
    cur = S.find((st) => st.items.some((g) => g.list.some((it) => it.need && !it.ok)));
    $("prog-t").textContent = `${done} из ${total}`;
    $("prog-m").style.width = `${total ? (100 * done) / total : 0}%`;
    $("plan").innerHTML = S.map((st) => {
      const n = st.items.reduce((a, g) => a + g.list.length, 0), d = st.items.reduce((a, g) => a + g.list.filter((x) => x.ok).length, 0);
      return `<section class="stage${st === cur ? " cur" : ""}" id="st-${st.no}"><div class="no">${st.no}<small>${esc(st.cap)}${st === cur && student() ? " · сейчас" : ""}</small></div><div>
        <h2>${esc(st.title)}</h2>${st.inclass ? `<p class="inclass">На уроке: ${esc(st.inclass)}. Пропустили урок — решите эти части на сайте сами.</p>` : ""}
        ${st.items.map((g) => `<div class="when">${esc(g.when)}</div>${g.list.map((it) => `<div class="it${it.ok ? " done" : ""}">
          <input type="checkbox" data-id="${esc(it.id)}"${it.ok ? " checked" : ""}${it.res ? ' data-auto="1" title="Сдано на сайте"' : ""} aria-label="${esc(it.t)}">
          <div><div class="t">${it.crs ? `<span class="crs">${it.crs === "V" ? "VERBAL" : "MATH"}</span>` : ""}<span class="nm">${esc(it.t)}</span>${it.need && !it.ok ? '<span class="need">обязательно</span>' : ""}${it.opt && !it.ok ? '<span class="opt2">по желанию</span>' : ""}${it.res ? `<span class="res">${esc(it.res)}</span>` : ""}</div><small>${esc(it.s || "")}</small></div>
          ${it.href ? `<a class="go" href="${esc(it.href)}">Открыть →</a>` : "<span></span>"}</div>`).join("")}`).join("")}
        <p class="sum">Сделано ${d} из ${n}</p></div></section>`;
    }).join("");
    $("plan").querySelectorAll("input[data-auto]").forEach((c) => (c.onclick = (e) => e.preventDefault()));   // submitted on the site: stays ticked
    $("plan").querySelectorAll("input[type=checkbox]:not([data-auto])").forEach((c) => (c.onchange = () => {
      c.checked ? manual.add(c.dataset.id) : manual.delete(c.dataset.id);
      store(doneKey(), JSON.stringify([...manual])); render();
    }));
  }

  $("student").value = student();
  if (window.SITE && SITE.me()) ["plan-who", "plan-who-hint"].forEach((id) => $(id) && $(id).classList.add("hidden"));   // the login already sets the name
  $("student").oninput = () => { store("hw_student", $("student").value.trim()); render(); };
  $("courses").querySelectorAll(".chip").forEach((b) => (b.onclick = () => { course = b.dataset.c; store("plan_course", course); render(); }));
  $("print").onclick = () => window.print();
  const want = new URLSearchParams(location.search).get("c");
  if (["V", "M", "VM"].includes(want)) course = want;
  render();
  if (location.hash) { const el = document.querySelector(location.hash); if (el) el.scrollIntoView(); }
})();
