/* «Персональные ДЗ · Gemini» (2026-11-23, Nurassyl: «позволь gemini создать персонализированные домашки (1 дз — 10 вопросов одного
   типа с учетом контрольных) каждому ученику. Если у ученика везде слабо — бить по каждому скиллу одной большой домашкой, других не
   создавать. Если ученик сильный — бить там, где он относительно слаб… жди, пока gemini ответит и задай эти домашки»).
   For every student of a group in «Анализ группы»: the plan comes from the same analysis as the PDF («Навыки: что усвоено и что
   добить»); the questions come from POST admin/twins on the student's own first-attempt mistakes (no names, no College Board text,
   a blind second call must reproduce each key, about 30% «контрольные»); each homework is saved as a «Мой тест» and assigned to the
   student's account as a task.
   Rules of the plan (plan() below, pure, tested in t_hwplan.mjs):
   - fewer than 3 subtopics with 3+ answers: skipped, too little data;
   - weak almost everywhere (60%+ of the subtopics «хромает» and under 20% «усвоено»): ONE big homework, 3 questions on every weak
     College Board skill (the skill's weakest subtopic first), up to 8 skills; no other homework;
   - otherwise: up to N homeworks (default 3) of 10 questions, each on one subtopic where the student is relatively weakest (the
     «добить» order first, then the lowest levels), on that student's mistakes in the subtopic or, when there are none, in its skill. */
(typeof window !== "undefined" ? window : globalThis).HWPLAN = (() => {
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const SIZE = 10, PER = 3, BROAD_MAX = 8, BROAD_BATCH = 4, DECOY = 0.3, DAY = 864e5;
  const RW_OK = ["Words in Context", "Text Structure and Purpose", "Cross-Text Connections", "Central Ideas and Details", "Command of Evidence: Textual",
    "Command of Evidence: Quantitative", "Command of Evidence", "Inferences", "Boundaries", "Form, Structure, and Sense", "Transitions", "Rhetorical Synthesis"];
  const usable = (c) => c && c.sk && (c.sec === "math" || RW_OK.includes(c.sk));
  const recent = (a, b) => (b.ts || 0) - (a.ts || 0);

  // sm: skillMap() of one student; pool: his first-attempt mistakes { id, sec, sk, focus, ts, … }; n: homeworks for a stronger student
  // sec: "rw" | "math" | "" (both) — a Verbal group gets only Reading and Writing homework
  function plan(sm, pool, n = 3, sec = "") {
    const items = (sm && sm.items ? sm.items : []).filter((x) => !sec || x.sec === sec), P = (pool || []).filter((c) => usable(c) && (!sec || c.sec === sec));
    if (items.length < 3) return { skip: "мало данных: меньше трёх подтем, где есть хотя бы три ответа" };
    if (!P.length) return { skip: "нет ошибок с первой попытки, на которые можно писать задания" };
    const weak = items.filter((x) => x.st === "weak"), ok = items.filter((x) => x.st === "ok");
    if (weak.length / items.length >= 0.6 && ok.length / items.length < 0.2) {
      const bySkill = new Map();
      weak.slice().sort((a, b) => a.now - b.now).forEach((x) => { if (!bySkill.has(x.skill)) bySkill.set(x.skill, []); bySkill.get(x.skill).push(x); });
      const parts = [];
      for (const [skill, subs] of bySkill) {
        if (parts.length >= BROAD_MAX) break;
        // the weakest subtopic of the skill that has a mistake, else any mistake of the skill (aimed at its weakest subtopic)
        let sub = subs.find((x) => P.some((m) => m.focus === x.name)), c = sub && P.filter((m) => m.focus === sub.name).sort(recent)[0];
        if (!c) { sub = subs[0]; c = P.filter((m) => m.sk === skill).sort(recent)[0]; }
        if (c) parts.push({ skill, topic: sub.name, now: sub.now, m: { ...c, focus: c.focus || sub.name } });
      }
      if (!parts.length) return { skip: "слабые навыки есть, но нет ошибок по ним, на которые можно писать задания" };
      return { mode: "broad", hws: [{ kind: "broad", topic: "все слабые навыки", skills: parts.map((p) => p.skill), size: parts.length * PER, mistakes: parts.map((p) => p.m), note: `Одно задание на каждую ошибку: проверяется её навык и подтема. Навыки: ${parts.map((p) => p.skill).join(", ")}.` }] };
    }
    // relatively weakest first: the «добить» order (gap × weight), then every other subtopic by its level
    const seen = new Set(), order = [...(sm.top || []).filter((x) => !sec || x.sec === sec), ...items.slice().sort((a, b) => a.now - b.now)].filter((x) => !seen.has(x.k) && seen.add(x.k));
    const hws = [];
    for (const x of order) {
      if (hws.length >= n) break;
      let ms = P.filter((m) => m.focus === x.name).sort(recent);
      if (!ms.length) ms = P.filter((m) => m.sk === x.skill).sort(recent);
      if (!ms.length) continue;
      const need = Math.ceil((SIZE + 2) / PER), list = [];   // 12 asked, the best 10 kept after the blind check
      for (let i = 0; list.length < need; i++) list.push({ ...ms[i % ms.length], focus: x.name });
      hws.push({ kind: "focus", topic: x.name, skill: x.skill, now: x.now, need: x.need, size: SIZE, mistakes: list,
        note: `Все задания — только на подтему «${x.name}» (${x.skill}). Разные темы текстов и разные ловушки этой подтемы.` });
    }
    if (!hws.length) return { skip: "нет ошибок по слабым подтемам, на которые можно писать задания" };
    return { mode: "focus", hws };
  }
  // keep `size` questions with about 30% decoys among them when there are enough of each kind
  function trim(qs, size) {
    if (qs.length <= size) return qs;
    const dec = qs.filter((q) => q.kind === "decoy"), tar = qs.filter((q) => q.kind !== "decoy"), d = Math.min(dec.length, Math.round(size * DECOY));
    const out = [...dec.slice(0, d), ...tar.slice(0, size - d)];
    return out.length < size ? [...out, ...dec.slice(d, d + size - out.length)] : out;
  }

  /* box: where to draw; o: { group: { id, name }, students: [s], skillMap(s), pool(s), load(c), acct(s) → account id or null, payloadOf } */
  function mount(box, o) {
    const S = { sec: /verbal|reading|\brw\b/i.test(o.group.name) ? "rw" : /math|матем/i.test(o.group.name) ? "math" : "", n: 3, due: 7, decoys: true, busy: false, rows: null, msg: "", log: [] };
    const skills = (k) => `${k} ${k % 10 === 1 && k % 100 !== 11 ? "навык" : [2, 3, 4].includes(k % 10) && ![12, 13, 14].includes(k % 100) ? "навыка" : "навыков"}`;
    const titleOf = (r, hw) => `ДЗ · ${r.s.name} · ${hw.kind === "broad" ? "все слабые навыки" : hw.topic} · ${today()}`;
    const dueOf = () => (S.due ? new Date(Date.now() + S.due * DAY).toISOString().slice(0, 10) : "");
    const today = () => new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
    const desc = (r) => r.p.skip ? `<span class="hint">пропущен: ${esc(r.p.skip)}</span>`
      : r.p.mode === "broad" ? `<b>Одна большая ДЗ</b> по всем слабым навыкам: ${skills(r.p.hws[0].mistakes.length)} × 3 = ${r.p.hws[0].size} вопросов<div class="hint">${esc(r.p.hws[0].skills.join(" · "))}</div>`
        : `<b>${r.p.hws.length} ДЗ × 10 вопросов</b> на относительно слабые места<div class="hint">${r.p.hws.map((h) => `${esc(h.topic)} (${h.now}%${h.need != null ? `, цель ${h.need}%` : ""})`).join(" · ")}</div>`;
    const stat = (r) => (r.st || []).map((x) => `<div class="hwp-st ${x.bad ? "bad" : x.ok ? "ok" : ""}">${esc(x.t)}</div>`).join("");
    function draw() {
      const planned = S.rows ? S.rows.filter((r) => !r.p.skip).reduce((a, r) => a + r.p.hws.length, 0) : 0;
      box.innerHTML = `<div class="card hwp" aria-busy="${S.busy}"><span class="label">Персональные ДЗ · Gemini</span>
        <p class="hint">Каждому ученику группы «${esc(o.group.name)}»: если слабо почти всё, одна большая домашка по каждому слабому навыку (3 вопроса на навык); иначе до ${S.n} домашек по 10 вопросов на подтемы, где он относительно слабее всего (с учётом цели, если она задана). Gemini пишет задания на ошибки самого ученика (без имён и без текста College Board), второй вызов вслепую проверяет каждый ключ, около 30% заданий контрольные. Каждая домашка сохраняется в «Мои тесты» и задаётся ученику.</p>
        <div class="row hwp-ctl"><label>Раздел <select id="hwp-sec"${S.busy ? " disabled" : ""}>${[["", "RW и Math"], ["rw", "Reading and Writing"], ["math", "Math"]].map(([v, l]) => `<option value="${v}"${v === S.sec ? " selected" : ""}>${l}</option>`).join("")}</select></label>
          <label>ДЗ сильному ученику <select id="hwp-n"${S.busy ? " disabled" : ""}>${[1, 2, 3].map((k) => `<option${k === S.n ? " selected" : ""}>${k}</option>`).join("")}</select></label>
          <label>Срок <select id="hwp-due"${S.busy ? " disabled" : ""}>${[[3, "Через 3 дня"], [7, "Через неделю"], [0, "Без срока"]].map(([v, l]) => `<option value="${v}"${v === S.due ? " selected" : ""}>${l}</option>`).join("")}</select></label>
          <label class="tw-dec"><input type="checkbox" id="hwp-dec"${S.decoys ? " checked" : ""}${S.busy ? " disabled" : ""}> Контрольные ~30%</label>
          <button class="btn ghost" type="button" id="hwp-plan"${S.busy ? " disabled" : ""}>${S.rows ? "Пересчитать план" : "Составить план"}</button>
          ${S.rows && planned ? `<button class="btn" type="button" id="hwp-go"${S.busy ? " disabled" : ""}>${S.busy ? "Gemini пишет задания…" : `Создать в Gemini и задать (${planned})`}</button>` : ""}</div>
        <p class="hint" role="status" id="hwp-msg">${esc(S.msg)}</p>
        ${S.rows ? `<table class="hwp-t"><thead><tr><th>Ученик</th><th>План</th><th>Готово</th></tr></thead><tbody>${S.rows.map((r) => `<tr><td><b>${esc(r.s.name)}</b>${r.acct ? "" : '<div class="hint">нет аккаунта: тесты сохранятся, задать вручную</div>'}</td><td>${desc(r)}</td><td>${stat(r)}</td></tr>`).join("")}</tbody></table>` : ""}</div>`;
      const g = (id) => box.querySelector("#" + id);
      g("hwp-n").onchange = (e) => { S.n = +e.target.value; if (S.rows) makePlan(); };
      g("hwp-sec").onchange = (e) => { S.sec = e.target.value; if (S.rows) makePlan(); };
      g("hwp-due").onchange = (e) => (S.due = +e.target.value);
      g("hwp-dec").onchange = (e) => (S.decoys = e.target.checked);
      g("hwp-plan").onclick = makePlan;
      if (g("hwp-go")) g("hwp-go").onclick = run;
    }
    async function makePlan() {
      if (S.busy) return;
      S.busy = true; S.msg = "Считаю анализ и собираю ошибки каждого ученика…"; S.rows = null; draw();
      const rows = [];
      for (const s of o.students) {
        let p; try { const [sm, pool] = await Promise.all([o.skillMap(s), o.pool(s)]); p = plan(sm, pool, S.n, S.sec); } catch (e) { p = { skip: "анализ не посчитался" }; }
        rows.push({ s, p, acct: await o.acct(s).catch(() => null), st: [] });
        S.msg = `Посчитано ${rows.length} из ${o.students.length}…`; S.rows = rows; draw();
      }
      const n = rows.filter((r) => !r.p.skip).reduce((a, r) => a + r.p.hws.length, 0);
      S.msg = n ? `План: ${n} домашек для ${rows.filter((r) => !r.p.skip).length} учеников. Проверьте и нажмите «Создать в Gemini и задать».` : "Домашек по плану нет.";
      S.busy = false; draw();
    }
    async function gen(hw, onStep) {
      let qs = [], asked = 0, dropped = 0;
      if (hw.kind === "broad") {
        for (let b = 0; b < hw.mistakes.length; b += BROAD_BATCH) {
          const part = hw.mistakes.slice(b, b + BROAD_BATCH); onStep(`часть ${b / BROAD_BATCH + 1} из ${Math.ceil(hw.mistakes.length / BROAD_BATCH)}`);
          const r = await call(part, hw.note); if (!r.ok) throw new Error(r.err);
          qs.push(...r.q); asked += r.asked; dropped += r.dropped;
        }
        return { qs, asked, dropped };
      }
      for (let round = 0; round < 3 && qs.length < hw.size; round++) {
        const k = Math.min(6, Math.ceil((hw.size - qs.length + 2) / PER)), part = hw.mistakes.slice(0, k);
        onStep(round ? `добираю ещё ${hw.size - qs.length}` : "пишет и проверяет");
        const r = await call(part, hw.note); if (!r.ok) { if (qs.length) break; throw new Error(r.err); }
        qs.push(...r.q); asked += r.asked; dropped += r.dropped;
      }
      return { qs: trim(qs, hw.size), asked, dropped };
    }
    async function call(part, note) {
      const r = await SITE.api("admin/twins", { method: "POST", body: JSON.stringify({ perMistake: PER, decoys: S.decoys, note, mistakes: (await Promise.all(part.map((c) => o.load(c).catch(() => null)))).filter(Boolean).map((m) => o.payloadOf(m)) }) });
      if (!r.ok) return { ok: false, err: (r.data && r.data.error) || (r.status === 403 ? "Нужен ключ администратора в этом браузере." : `Сервер ответил ${r.status}.`) };
      return { ok: true, q: r.data.questions, asked: r.data.asked, dropped: r.data.dropped || 0 };
    }
    async function give(acct, task) {
      const url = "admin/progress?id=" + encodeURIComponent(acct), g = await SITE.api(url);
      let B = {}; if (g.ok) B = await SITE.unsealBlob(g.data.data); else if (g.status !== 404) throw new Error(`Сервер ответил ${g.status}.`);
      let L = []; try { L = JSON.parse((B.tasks && B.tasks.v) || "[]"); } catch (e) { L = []; }
      L.push(task); B.tasks = { v: JSON.stringify(L.slice(-60)), t: Date.now() };
      const p = await SITE.api(url, { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob(B) }) }); if (!p.ok) throw new Error(`Сервер ответил ${p.status}.`);
    }
    async function run() {
      if (S.busy || !S.rows) return;
      if (!window.CTED || !window.CTL) { S.msg = "«Мои тесты» не загрузились: обновите страницу."; draw(); return; }
      S.busy = true; draw();
      let made = 0, given = 0, failed = 0; const total = S.rows.filter((r) => !r.p.skip).reduce((a, r) => a + r.p.hws.length, 0);
      for (const r of S.rows) {
        if (r.p.skip) continue;
        r.st = [];
        // a homework with the same title already assigned to this student today is not made again (a second click, a re-plan)
        let have = new Set();
        if (r.acct) { try { const g = await SITE.api("admin/progress?id=" + encodeURIComponent(r.acct)); if (g.ok) { const B = await SITE.unsealBlob(g.data.data);
          have = new Set(JSON.parse((B.tasks && B.tasks.v) || "[]").map((x) => String(x.t || "").replace(/ · \d+ вопрос\S*$/, ""))); } } catch (e) { /* checked again at the next run */ } }
        for (const hw of r.p.hws) {
          if (hw.done) { r.st.push(hw.done); continue; }
          if (have.has(`Мой тест · ${titleOf(r, hw)}`)) { hw.done = { t: `${hw.topic}: уже задано сегодня`, ok: true }; r.st.push(hw.done); continue; }
          const line = { t: `${hw.topic}: Gemini пишет…` }; r.st.push(line);
          const step = (t) => { line.t = `${hw.topic}: ${t}…`; S.msg = `Домашка ${made + failed + 1} из ${total} · ${r.s.name}`; draw(); };
          try {
            const out = await gen(hw, step);
            if (!out.qs.length) throw new Error("ни одно задание не прошло проверку ключа");
            const t = CTL.newTest(), mixed = out.qs.slice(); for (let i = mixed.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [mixed[i], mixed[j]] = [mixed[j], mixed[i]]; }
            t.title = titleOf(r, hw); t.src = "gemini";
            t.note = hw.kind === "broad" ? "Персональная домашка по всем навыкам, которые пока даются тяжело. Решайте без подсказок и проверяйте каждый вариант."
              : `Персональная домашка на «${hw.topic}». Решайте без подсказок: в части заданий верный ответ другого типа, проверяйте каждый вариант.`;
            t.q = mixed.map((q) => Object.assign(CTL.newQ("mc"), { passage: q.passage, stem: q.prompt, o: q.options.slice(), a: q.answer,
              x: `${q.rationale}\n\nЛовушка ${q.trap}: ${q.trapWhy}`, skill: q.skill, level: q.level || "M" }));
            t.q = t.q.filter((q) => !CTL.problems(q).length);
            if (!t.q.length) throw new Error("задания неполные");
            if (!(await CTED.addTest(t, `Тест «${t.title}» сохранён`))) throw new Error("тест не сохранился");
            made++;
            const dec = mixed.filter((q) => q.kind === "decoy").length;
            line.t = `${hw.topic}: ${t.q.length} вопр.${dec ? `, контрольных ${dec}` : ""}`; line.ok = true;
            if (r.acct) {
              const task = { id: Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 10), at: Date.now(), due: dueOf(),
                note: hw.kind === "broad" ? "Персональная домашка по слабым навыкам" : `Персональная домашка: ${hw.topic}`, kind: "ct",
                t: `Мой тест · ${t.title} · ${t.q.length} вопросов`, href: `mytest.html?t=${t.id}`, rk: ["ct_last_", t.id] };
              await give(r.acct, task); given++; line.t += " · задано";
            } else line.t += " · сохранено, задайте вручную";
            hw.done = line;
          } catch (e) { failed++; line.t = `${hw.topic}: не получилось (${e.message || e})`; line.bad = true; }
          draw();
        }
      }
      S.busy = false;
      S.msg = `Готово: создано ${made}, задано ${given}${failed ? `, не получилось ${failed}: нажмите «Создать в Gemini и задать» ещё раз, готовые не повторятся` : ""}.`;
      draw();
    }
    draw();
  }
  return { plan, trim, mount };
})();
if (typeof module !== "undefined") module.exports = globalThis.HWPLAN;
