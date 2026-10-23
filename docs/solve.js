// On-screen workbook in the style of Bluebook: one question per screen, two attempts and the official explanation
// right after each answer ("learn"), or exam style with explanations after submitting ("test").
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let S = null;  // session: ctx, items, state per question, current index, marks, eliminated options

  const key = () => `hw_prog_${S.ctx.student}_${S.ctx.lesson.tag}_${S.ctx.part.id}`;
  function save() { try { localStorage.setItem(key(), JSON.stringify({ st: S.st, mk: [...S.mk], el: Date.now() - S.t0 })); } catch (e) { /* private mode */ } }
  function clear() { try { localStorage.removeItem(key()); } catch (e) { /* private mode */ } }

  function open(ctx) {
    S = { ctx, items: ctx.items, cur: 0, st: {}, mk: new Set(), out: {}, t0: Date.now(), review: !!ctx.review, timer: null };
    S.hash = {}; ctx.part.q.forEach((q) => (S.hash[q.i] = q.h));
    S.items.forEach((q) => (S.st[q.i] = { tries: [], done: false, ok: false }));
    if (ctx.review) { Object.assign(S.st, ctx.review); }
    else {
      let saved = null; try { saved = JSON.parse(localStorage.getItem(key())); } catch (e) { saved = null; }
      if (saved && saved.st && Object.values(saved.st).some((s) => s.tries.length) && confirm("Продолжить с того места, где вы остановились?")) {
        Object.assign(S.st, saved.st); S.mk = new Set(saved.mk || []); S.t0 = Date.now() - (saved.el || 0);
        const k = S.items.findIndex((q) => !S.st[q.i].done && !(ctx.part.mode === "test" && S.st[q.i].tries.length)); S.cur = k < 0 ? 0 : k;
      } else clear();
    }
    $("sv-title").textContent = `${ctx.lesson.tag} · ${ctx.part.title}${S.review ? " · разбор" : ""}`;
    $("sv-wrap").classList.toggle("one", ctx.lesson.tag[0] === "M");
    clearInterval(S.timer);
    if (!S.review) { S.timer = setInterval(tick, 1000); tick(); } else $("sv-clock").textContent = "разбор";
    $("sv-finish").textContent = S.review ? "Закрыть разбор" : "Сдать";
    ctx.show("s-solve"); render();
  }
  function tick() { const s = Math.floor((Date.now() - S.t0) / 1000); $("sv-clock").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }
  const learn = () => S.ctx.part.mode !== "test";
  const revealed = (s) => S.review || (learn() && s.done);

  function render() {
    const q = S.items[S.cur], s = S.st[q.i], n = S.items.length, math = S.ctx.lesson.tag[0] === "M";
    const answered = S.items.filter((x) => S.st[x.i].done || (!learn() && S.st[x.i].tries.length)).length;
    $("sv-pos").textContent = `${answered} / ${n}`; $("sv-prog").style.width = `${(100 * answered) / n}%`;
    $("sv-qn").textContent = `Вопрос ${q.n} · ${S.cur + 1} из ${n}`;
    $("sv-flag").setAttribute("aria-pressed", String(S.mk.has(q.i)));
    // Verbal: passage on the left, question on the right. Math: one column, as in Bluebook.
    $("sv-passage").innerHTML = math ? "" : q.stim; $("sv-passage").classList.toggle("hidden", math || !q.stim);
    $("sv-stem").innerHTML = (math ? q.stim : "") + q.stem;
    const out = S.out[q.i] || new Set(), last = s.tries[s.tries.length - 1];  // last: what the box shows after the question is closed
    if (q.t === "mc") {
      $("sv-opts").innerHTML = q.opts.map((o, k) => { const c = "ABCD"[k];
        const bad = (learn() || S.review) && s.tries.includes(c) && c !== q.ans;   // a wrong attempt
        const good = revealed(s) && c === q.ans;
        const on = !S.review && !s.done && (learn() ? S.sel === c : s.tries[0] === c);
        const cls = `${on ? " on" : ""}${out.has(c) && !s.done ? " out" : ""}${bad ? " bad" : ""}${good ? " good" : ""}`;
        return `<div class="opt${cls}" data-c="${c}"><button class="ch" data-c="${c}"${s.done || bad ? " disabled" : ""}><span class="lt">${c}</span><span class="tx qhtml">${o}</span></button><button class="x" data-c="${c}" aria-label="Вычеркнуть ${c}"${s.done ? " disabled" : ""}>${out.has(c) ? "↺" : "×"}</button></div>`; }).join("");
      $("sv-opts").querySelectorAll(".ch").forEach((b) => (b.onclick = () => choose(b.dataset.c)));
      $("sv-opts").querySelectorAll(".x").forEach((b) => (b.onclick = () => strike(b.dataset.c)));
    } else {
      const val = S.spr ?? (s.done || !learn() ? last || "" : "");
      $("sv-opts").innerHTML = `<div class="spr"><label class="label" for="sv-in">Ваш ответ</label><input id="sv-in" type="text" autocomplete="off" inputmode="text" value="${(val || "").replace(/"/g, "&quot;")}"${s.done ? " disabled" : ""}>
        <p class="hint" id="sv-in-h">Целое, дробь 7/2 или десятичная .75. Смешанные числа (3 1/2) не принимаются.</p></div>`;
      $("sv-in").oninput = () => { S.spr = $("sv-in").value; const v = S.spr.trim(); $("sv-in-h").textContent = !v || S.ctx.parseSpr(v) !== null ? "Ответ: " + (v || "—") : "Формат: 12, -3, 7/2 или .75";
        if (!learn()) { const st = S.st[q.i]; st.tries = v ? [v] : []; save(); renderGrid(); } };
      $("sv-in").onkeydown = (e) => { if (e.key === "Enter" && learn()) check(); };
    }
    // feedback and explanation
    let fb = "";
    if (learn() || S.review) {
      if (s.done && s.ok) fb = s.tries.length === 1 ? "<b>Верно.</b>" : "<b>Верно со второй попытки.</b>";
      else if (s.done) fb = `<b>Неверно.</b> Правильный ответ: <b>${q.ans}</b>.`;
      else if (s.tries.length === 1 && learn()) fb = "<b>Неверно.</b> Осталась одна попытка.";
      if (S.review && !s.tries.length) fb = `Без ответа. Правильный ответ: <b>${q.ans}</b>.`;
    }
    $("sv-fb").innerHTML = fb; $("sv-fb").className = `fb${fb ? "" : " hidden"}${s.done && s.ok ? " ok" : fb ? " no" : ""}`;
    $("sv-expl").innerHTML = revealed(s) ? `<span class="label">Объяснение College Board</span><div class="qhtml">${q.rat}</div>` : "";
    $("sv-expl").classList.toggle("hidden", !revealed(s));
    $("sv-check").classList.toggle("hidden", !learn() || s.done || S.review);
    $("sv-check").textContent = s.tries.length ? "Проверить ещё раз" : "Проверить";
    $("sv-prev").disabled = S.cur === 0;
    $("sv-next").textContent = S.cur === n - 1 ? (S.review ? "Закрыть" : "Сдать →") : "Далее →";
    $("navbtn").textContent = `${S.cur + 1} / ${n} ▴`;
    renderGrid();
  }
  function renderGrid() {
    $("sv-grid").innerHTML = S.items.map((q, k) => { const s = S.st[q.i];
      const c = learn() || S.review ? (s.done ? (s.ok ? (s.tries.length === 1 ? "f1" : "f2") : "fx") : s.tries.length ? "half" : "") : s.tries.length ? "f1" : "";
      return `<button data-k="${k}" class="${c}${k === S.cur ? " cur" : ""}${S.mk.has(q.i) ? " mk" : ""}">${q.n}</button>`; }).join("");
    $("sv-grid").querySelectorAll("button").forEach((b) => (b.onclick = () => go(Number(b.dataset.k))));
    $("sv-legend").innerHTML = learn() || S.review ? "<span>■ верно с 1-й</span><span>▣ верно со 2-й</span><span>☒ неверно</span><span>◥ отмечен</span>" : "<span>■ есть ответ</span><span>□ без ответа</span><span>◥ отмечен</span>";
  }
  function choose(c) {
    const q = S.items[S.cur], s = S.st[q.i]; if (s.done || S.review) return;
    if (learn()) S.sel = c; else { s.tries = [c]; save(); }
    if (S.out[q.i]) S.out[q.i].delete(c);
    render();
  }
  function strike(c) {
    const q = S.items[S.cur]; if (S.st[q.i].done) return;
    const o = S.out[q.i] || (S.out[q.i] = new Set()); o.has(c) ? o.delete(c) : o.add(c);
    if (S.sel === c) S.sel = null;
    render();
  }
  async function graded(q, raw) {
    const v = q.t === "mc" ? raw : S.ctx.parseSpr(raw);
    return v !== null && S.hash[q.i].includes(await S.ctx.sha(`${S.ctx.lesson.salt}:${q.i}:${v}`));
  }
  async function check() {
    const q = S.items[S.cur], s = S.st[q.i]; if (s.done || !learn()) return;
    const raw = q.t === "mc" ? S.sel : (S.spr || "").trim();
    if (!raw) { $("sv-fb").innerHTML = q.t === "mc" ? "Выберите вариант." : "Введите ответ."; $("sv-fb").className = "fb no"; return; }
    if (q.t !== "mc" && S.ctx.parseSpr(raw) === null) { $("sv-in-h").textContent = "Формат: 12, -3, 7/2 или .75"; return; }
    if (q.t === "mc" && s.tries.includes(raw)) return;
    const ok = await graded(q, raw);
    s.tries.push(raw); S.sel = null; S.spr = null;
    if (ok || s.tries.length >= 2) { s.done = true; s.ok = ok; }
    save(); render();
    if (s.done) $("sv-fb").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function go(k) { S.cur = Math.max(0, Math.min(S.items.length - 1, k)); S.sel = null; S.spr = null; $("sv-nav").classList.add("hidden"); render(); window.scrollTo(0, 0); }

  async function finish() {
    if (S.review) { S.ctx.onClose(); return; }
    const n = S.items.length;
    const open_ = S.items.filter((q) => learn() ? !S.st[q.i].done : !S.st[q.i].tries.length).map((q) => q.n);
    if (open_.length && !confirm(`Без ответа: ${open_.join(", ")}. Сдать всё равно?`)) return;
    clearInterval(S.timer);
    if (!learn()) for (const q of S.items) { const s = S.st[q.i]; s.ok = !!s.tries.length && (await graded(q, s.tries[0])); s.done = true; }
    const seconds = Math.round((Date.now() - S.t0) / 1000);
    const first = S.items.filter((q) => S.st[q.i].ok && S.st[q.i].tries.length === 1);
    const any = S.items.filter((q) => S.st[q.i].ok);
    const res = { lesson: S.ctx.lesson.tag, part: `${S.ctx.part.id} · ${S.ctx.part.title} · экран${learn() ? ` · 2-я: ${any.length}/${n}` : ""}`,
      answers: S.items.map((q) => `${q.n}:${S.st[q.i].tries.join(">") || "-"}`).join(" "),
      score: `${first.length}/${n}`, wrong: S.items.filter((q) => !first.includes(q)).map((q) => q.n).join(","), seconds: String(seconds) };
    const st = JSON.parse(JSON.stringify(S.st)); clear();
    S.ctx.onFinish(res, { second: `${any.length}/${n}`, learn: learn(), state: st });
  }

  $("sv-check").onclick = check;
  $("sv-prev").onclick = () => go(S.cur - 1);
  $("sv-next").onclick = () => (S.cur === S.items.length - 1 ? finish() : go(S.cur + 1));
  $("navbtn").onclick = () => $("sv-nav").classList.toggle("hidden");
  $("sv-close").onclick = () => $("sv-nav").classList.add("hidden");
  $("sv-finish").onclick = finish;
  $("sv-flag").onclick = () => { const q = S.items[S.cur]; S.mk.has(q.i) ? S.mk.delete(q.i) : S.mk.add(q.i); save(); render(); };
  $("sv-clock-t").onclick = () => $("sv-clock").classList.toggle("blur");
  document.addEventListener("keydown", (e) => {
    if (!S || $("s-solve").classList.contains("hidden") || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const k = e.key.toUpperCase(), q = S.items[S.cur];
    if (q.t === "mc" && "ABCD".includes(k) && k.length === 1) choose(k);
    else if (e.key === "Enter" && learn()) check();
    else if (e.key === "ArrowRight") go(S.cur + 1);
    else if (e.key === "ArrowLeft") go(S.cur - 1);
  });
  window.HWSolve = { open };
})();
