// «Тесты преподавателя» (mytest.html): the student's screen for the tests the teacher made in the cabinet («Мои тесты»).
// Bluebook-style: one question at a time, × strikes an option, «Отметить» flags a question, typed answers for SPR questions.
// An unfinished run is kept in this browser (ct_run_<id>) so a reload or a closed tab continues it; a time limit keeps running.
// The result is saved under the student's name (ct_last_, ct_att_, ct_ans_: synced with the account, read by the cabinet).
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const pl = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many);
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } return null; };
  const { esc, rich } = CTL;
  const st = { bank: [], t: null, run: null, cur: 0, timer: 0 };
  const runKey = (id) => `ct_run_${id}`;
  const who = () => store("hw_student") || "";

  function show(id) { ["p-list", "p-start", "p-test", "p-result"].forEach((s) => $(s).classList.toggle("hidden", s !== id)); window.scrollTo(0, 0); }
  const mins = (t) => (t.minutes ? `${t.minutes} мин` : "без ограничения времени");
  const qn = (n) => `${n} ${pl(n, "вопрос", "вопроса", "вопросов")}`;

  // ---- the list: tests the teacher assigned to me first, then the open ones
  function myTasks() { let T = []; try { T = JSON.parse(store("tasks") || "[]"); } catch (e) { T = []; } return (Array.isArray(T) ? T : []).filter((x) => x && x.kind === "ct" && x.rk); }
  function renderList() {
    const tasks = myTasks(), byId = Object.fromEntries(st.bank.map((t) => [t.id, t]));
    const mine = [...new Set(tasks.map((x) => x.rk[1]))].filter((id) => byId[id]);
    const open = st.bank.filter((t) => t.open && !mine.includes(t.id));
    const card = (t, tag) => {
      const K = CTL.keys(who(), t.id), last = store(K.last), task = tasks.filter((x) => x.rk[1] === t.id).sort((a, b) => b.at - a.at)[0], run = store(runKey(t.id));
      return `<a class="set" href="mytest.html?t=${encodeURIComponent(t.id)}"><span class="no">${esc(t.q.length)}</span><span class="t">${esc(t.title || "Без названия")}</span>
        <span class="meta"><span class="label">${esc(tag)}${task && task.due ? ` · <span class="due">${esc(PLAN.dueTxt(task.due))}</span>` : ""}</span><span class="label">${qn(t.q.length)} · ${esc(mins(t))}${last ? ` · ${esc(last)}` : run ? " · начат" : ""}</span></span></a>`;
    };
    const html = mine.map((id) => card(byId[id], "Задано вам")).join("") + open.map((t) => card(t, "Открыт для всех")).join("");
    $("sets").innerHTML = html;
    $("list-msg").textContent = html ? "" : "Пока здесь пусто. Когда преподаватель задаст вам тест или откроет его для всех, он появится здесь.";
  }

  // ---- the start screen
  function renderStart() {
    const t = st.t, K = CTL.keys(who(), t.id), last = store(K.last), run = loadRun();
    $("s-title").textContent = t.title || "Без названия";
    $("s-meta").innerHTML = [qn(t.q.length), mins(t), CTL.REVIEW[t.review] || CTL.REVIEW.full, last ? `последний результат ${last}` : ""].filter(Boolean).map((x) => `<span class="label">${esc(x)}</span>`).join("");
    $("s-note").textContent = t.note || "";
    $("s-note").classList.toggle("hidden", !t.note);
    $("s-name-step").classList.toggle("hidden", !!SITE.me());
    $("student").value = who();
    $("go").innerHTML = run ? 'Продолжить <span class="arr">→</span>' : 'Начать <span class="arr">→</span>';
    $("restart").classList.toggle("hidden", !run);
    $("s-msg").textContent = run && run.deadline ? `Время идёт: осталось ${clockTxt(Math.max(0, run.deadline - Date.now()))}.` : "";
    document.title = `${t.title || "Тест"} · nurzycom`;
    show("p-start"); $("s-title").focus({ preventScroll: true });
  }
  function loadRun() { try { const r = JSON.parse(store(runKey(st.t.id)) || "null"); return r && r.at === st.t.at ? r : null; } catch (e) { return null; } }
  const save = () => store(runKey(st.t.id), JSON.stringify(st.run));
  function begin(fresh) {
    if (!SITE.me()) { const n = $("student").value.trim(); if (n.length < 2) { $("s-msg").textContent = "Напишите имя и первую букву фамилии."; $("student").focus(); return; } store("hw_student", n); }
    st.run = fresh ? null : loadRun();
    if (!st.run) { const now = Date.now(); st.run = { at: st.t.at, t0: now, deadline: st.t.minutes ? now + st.t.minutes * 60000 : 0, ans: {}, out: {}, marked: [], cur: 0 }; }
    st.cur = st.run.cur || 0; save();
    $("t-title").textContent = st.t.title || "Тест";
    clearInterval(st.timer); show("p-test"); renderQ();
    st.timer = setInterval(tick, 1000); tick();   // after drawing: an expired run submits at once and shows the result
  }
  const clockTxt = (ms) => { const s = Math.ceil(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
  function tick() {
    if (!st.run) return;
    if (st.run.deadline) {
      const left = st.run.deadline - Date.now(); $("clock").textContent = clockTxt(Math.max(0, left)); $("clock").classList.toggle("low", left < 5 * 60000);
      if (left <= 0) finish(true);
    } else $("clock").textContent = clockTxt(Date.now() - st.run.t0);
  }

  // ---- one question
  const Q = () => st.t.q[st.cur];
  function renderQ() {
    const qs = st.t.q, q = Q(), A = st.run.ans, out = new Set(st.run.out[q.id] || []), n = Object.values(A).filter((v) => v !== "" && v != null).length;
    $("passage").innerHTML = rich(q.passage);
    $("qwrap").classList.toggle("solo", !String(q.passage || "").trim());
    $("passage").classList.toggle("hidden", !String(q.passage || "").trim());
    $("qn").textContent = `Вопрос ${st.cur + 1} из ${qs.length}`;
    $("t-pos").textContent = `${n} / ${qs.length}`;
    $("prog").style.width = `${(100 * n) / qs.length}%`;
    $("stem").innerHTML = rich(q.stem);
    $("flag").setAttribute("aria-pressed", String(st.run.marked.includes(q.id)));
    if (q.type === "spr") {
      $("opts").innerHTML = `<label class="spr"><span class="label">Ваш ответ</span><input id="spr" type="text" inputmode="decimal" autocomplete="off" maxlength="12" value="${esc(A[q.id] || "")}" aria-label="Ваш ответ на вопрос ${st.cur + 1}"><small>Число или дробь: 0.5, .5 и 1/2 считаются одинаково.</small></label>`;
      $("spr").oninput = (e) => { A[q.id] = e.target.value.trim(); save(); $("t-pos").textContent = `${Object.values(A).filter((v) => v !== "" && v != null).length} / ${qs.length}`; renderGrid(); };
    } else {
      $("opts").innerHTML = q.o.map((o, k) => { const c = "ABCD"[k];
        return `<div class="opt${A[q.id] === c ? " on" : ""}${out.has(c) ? " out" : ""}" data-c="${c}"><button class="ch" data-c="${c}" aria-pressed="${A[q.id] === c}"><span class="lt">${c}</span><span class="tx">${CTL.inline(o)}</span></button><button class="x" data-c="${c}" aria-label="${out.has(c) ? "Вернуть" : "Вычеркнуть"} ${c}" title="Вычеркнуть">${out.has(c) ? "↺" : "×"}</button></div>`; }).join("");
      $("opts").querySelectorAll(".ch").forEach((b) => (b.onclick = () => choose(b.dataset.c)));
      $("opts").querySelectorAll(".x").forEach((b) => (b.onclick = () => strike(b.dataset.c)));
    }
    $("prev").disabled = st.cur === 0;
    $("next").innerHTML = st.cur === qs.length - 1 ? "Сдать →" : "Далее →";
    $("navbtn").textContent = `${st.cur + 1} / ${qs.length} ▴`;
    renderGrid();
  }
  function choose(c) { const q = Q(); st.run.ans[q.id] = c; const o = st.run.out[q.id]; if (o) st.run.out[q.id] = o.filter((x) => x !== c); save(); renderQ(); const b = $("opts").querySelector(`.ch[data-c="${c}"]`); if (b) b.focus(); }
  function strike(c) {
    const q = Q(), o = new Set(st.run.out[q.id] || []);
    if (o.has(c)) o.delete(c); else { o.add(c); if (st.run.ans[q.id] === c) delete st.run.ans[q.id]; }
    st.run.out[q.id] = [...o]; save(); renderQ(); const b = $("opts").querySelector(`.x[data-c="${c}"]`); if (b) b.focus();
  }
  function go(k) { st.cur = Math.max(0, Math.min(st.t.q.length - 1, k)); st.run.cur = st.cur; save(); $("navpanel").classList.add("hidden"); renderQ(); window.scrollTo(0, 0); $("qn").focus({ preventScroll: true }); }
  function renderGrid() {
    const A = st.run.ans;
    $("grid").innerHTML = st.t.q.map((q, k) => `<button data-k="${k}" class="${A[q.id] ? "ans" : ""}${k === st.cur ? " cur" : ""}${st.run.marked.includes(q.id) ? " mk" : ""}" aria-label="Вопрос ${k + 1}${A[q.id] ? ", есть ответ" : ""}${st.run.marked.includes(q.id) ? ", отмечен" : ""}">${k + 1}</button>`).join("");
    $("grid").querySelectorAll("button").forEach((b) => (b.onclick = () => go(Number(b.dataset.k))));
  }
  $("prev").onclick = () => go(st.cur - 1);
  $("next").onclick = () => (st.cur === st.t.q.length - 1 ? finish() : go(st.cur + 1));
  $("navbtn").onclick = () => $("navpanel").classList.toggle("hidden");
  $("closenav").onclick = () => $("navpanel").classList.add("hidden");
  $("finish2").onclick = () => finish();
  $("flag").onclick = () => { const id = Q().id, m = st.run.marked; st.run.marked = m.includes(id) ? m.filter((x) => x !== id) : m.concat(id); save(); renderQ(); $("flag").focus(); };
  document.addEventListener("keydown", (e) => {
    if ($("p-test").classList.contains("hidden") || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.key === "Escape" && !$("navpanel").classList.contains("hidden")) { $("navpanel").classList.add("hidden"); $("navbtn").focus(); return; }
    const k = e.key.toUpperCase();
    if (Q().type === "mc" && "ABCD".includes(k) && k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) choose(k);
    else if (e.key === "ArrowRight" && st.cur < st.t.q.length - 1) go(st.cur + 1);
    else if (e.key === "ArrowLeft" && st.cur > 0) go(st.cur - 1);
  });

  // ---- grade, save, review
  function finish(timeUp) {
    if (!st.run) return;
    const qs = st.t.q, A = st.run.ans;
    if (!timeUp) {
      const blanks = qs.map((q, i) => (A[q.id] ? null : i + 1)).filter(Boolean);
      if (blanks.length && !confirm(`Без ответа: ${blanks.join(", ")}. Сдать всё равно?`)) return;
    }
    clearInterval(st.timer);
    const sec = Math.min(Date.now(), st.run.deadline || Infinity) - st.run.t0;
    const ok = qs.map((q) => CTL.isRight(q, A[q.id])), right = ok.filter(Boolean).length;
    const name = who() || SITE.me() || "ученик", K = CTL.keys(name, st.t.id);
    const att = Number(store(K.att) || 0) + 1;
    store(K.att, String(att)); store(K.ans, CTL.packAns(qs, A, sec / 1000)); store(K.last, `${right}/${qs.length}`);
    store(runKey(st.t.id), null);
    const done = st.run; st.run = null;
    if (SITE.sync) SITE.sync().catch(() => {});
    $("res-title").textContent = `${st.t.title || "Тест"} · попытка ${att}${timeUp ? " · время вышло" : ""}`;
    $("res-score").textContent = `${right}/${qs.length}`;
    $("res-meter").style.width = `${(100 * right) / qs.length}%`;
    const s = Math.round(sec / 1000);
    $("res-time").textContent = `${Math.floor(s / 60)} мин ${s % 60} с`;
    $("res-per").textContent = `${Math.round(s / qs.length)} с`;
    $("send-status").textContent = SITE.me() ? "Результат сохранён в вашем аккаунте: преподаватель увидит его в кабинете." : "Результат сохранён только на этом устройстве: войдите своим логином, чтобы его видел преподаватель.";
    renderReview(done, ok);
    show("p-result");
  }
  function renderReview(run, ok) {
    const mode = st.t.review || "full", qs = st.t.q;
    $("rev-step").classList.toggle("hidden", mode === "score");
    if (mode === "score") return;
    $("rev").innerHTML = qs.map((q, i) => {
      const mine = run.ans[q.id], full = mode === "full";
      const body = full ? `<div class="rbody">${q.passage ? `<div class="passage" style="padding:8px 0 4px">${rich(q.passage)}</div>` : ""}<div class="stem">${rich(q.stem)}</div>
        ${q.type === "spr" ? `<div class="ropt right"><span>Верный ответ: <b>${esc(CTL.answerText(q))}</b></span></div><div class="ropt${ok[i] ? " right" : " mine"}"><span>Ваш ответ: ${esc(mine || "—")}</span></div>`
          : q.o.map((o, k) => { const c = "ABCD"[k], r = q.a === c; return `<div class="ropt${r ? " right" : ""}${mine === c ? " mine" : ""}"><span class="lt">${c}</span><span>${CTL.inline(o)}</span>${r ? '<span class="tg">верный</span>' : mine === c ? '<span class="tg">ваш ответ</span>' : ""}</div>`; }).join("")}
        ${q.x ? `<div class="expl"><span class="label">Разбор</span>${rich(q.x)}</div>` : ""}</div>` : "";
      const sum = `<span class="mk ${ok[i] ? "ok" : "no"}">${i + 1}</span><span class="sm"><b>${ok[i] ? "Верно" : mine ? "Ошибка" : "Без ответа"}</b><small>Ваш ответ: ${esc(mine || "—")}${full ? ` · верный: ${esc(CTL.answerText(q))}` : ""}${q.skill ? ` · ${esc(q.skill)}` : ""}</small></span>`;
      return full ? `<details><summary>${sum}<span class="ar">›</span></summary>${body}</details>` : `<div class="rrow" style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--studio)">${sum}</div>`;
    }).join("");
  }

  $("go").onclick = () => begin(false);
  $("restart").onclick = () => { if (confirm("Начать тест заново? Ответы этой попытки сотрутся.")) { store(runKey(st.t.id), null); begin(true); } };
  $("again").onclick = () => begin(true);

  // ---- start
  window.addEventListener("DOMContentLoaded", () => {
    if (!window.SITE) return;
    SITE.ready.then(async () => {
      try { const B = await CTL.loadBank(); st.bank = B.tests.filter((t) => t && t.id && Array.isArray(t.q) && t.q.length); }
      catch (e) { $("list-msg").textContent = SITE.failMsg(); show("p-list"); return; }
      st.bank.forEach((t) => (PLAN.CT[t.id] = t.title));
      const id = new URLSearchParams(location.search).get("t");
      st.t = id ? st.bank.find((t) => t.id === id) : null;
      if (id && !st.t) { $("list-msg").textContent = "Этот тест не найден: возможно, преподаватель его удалил. Вот другие тесты."; }
      if (st.t) { const r = loadRun(); if (r && r.deadline && r.deadline <= Date.now()) { st.run = r; begin(false); return; } renderStart(); } else { renderList(); show("p-list"); }
    });
  });
})();
