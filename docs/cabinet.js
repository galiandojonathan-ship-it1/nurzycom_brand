// «Кабинет»: the teacher's cabinet for students' progress and homework (2026-11-06, Nurassyl's request: «more abilities to
// manipulate students' progress and give them homework»). Opens with the teacher's login plus the admin key.
// Reads each student's synced copy (api/admin/progress, encrypted with the master key, decrypted only in this browser),
// and writes changes back the same way: plan ticks and the course (plan_done_<name>, plan_course), a reset of a result
// (the result key and its attempt count become v: null, so every device of the student drops them at the next sync), and
// homework (key «tasks»; the student's own ticks go to «tasks_done»). Every change carries the time of the change, so the
// newer side wins on the student's devices; the student sees it at the next page they open.
(function () {
  "use strict";
  const pl = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many);   // Russian plural: 1 шаг, 2 шага, 5 шагов
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAY = 864e5, nn = (n) => String(n).padStart(2, "0");
  const COURSES = [["V", "Verbal"], ["M", "Math"], ["VM", "Verbal и Math"]];
  const S = { users: [], cur: null, tab: "over", filter: "all", q: "", lessons: [], assign: null, imp: null, loaded: false };

  // ---------- a student's synced copy: { key: { v, t } }; v: null is a removed key
  const getter = (u) => (k) => (u.B && u.B[k] && u.B[k].v != null ? String(u.B[k].v) : null);
  const metaOf = (u) => { const m = {}; if (u.B) for (const [k, r] of Object.entries(u.B)) m[k] = (r && r.t) || 0; return m; };
  const keysOf = (u) => (u.B ? Object.keys(u.B).filter((k) => u.B[k] && u.B[k].v != null) : []);
  // the name the results are stored under (the login sets it; results made earlier with the shared password may use another)
  const NAME_RE = [/^hw_last_(.+)_(?:[VM]\d\d|VA|MD|[ADU]\d\d)_p\d+$/, /^px_last_(.+)_X\d\d$/, /^rd_last_(.+)_T\d\d$/, /^mk_last_(.+)_PT\d+$/, /^plan_done_(.+)$/];
  function namesOf(u) {
    const c = {}; for (const k of keysOf(u)) for (const re of NAME_RE) { const m = re.exec(k); if (m) { c[m[1]] = (c[m[1]] || 0) + 1; break; } }
    return c;
  }
  function info(u) {   // everything the list and the card show, computed from the copy
    const get = getter(u), meta = metaOf(u), names = namesOf(u), list = Object.keys(names);
    if (!u.nm) u.nm = names[u.name] || !list.length ? u.name : list.sort((a, b) => names[b] - names[a])[0];
    const course = get("plan_course") || "V";
    const P = PLAN.state(course, { name: u.nm, get });
    const R = PLAN.results(u.nm, keysOf(u), get, meta, S.lessons), T = PLAN.taskState(u.nm, get, meta);
    const last = Math.max(0, ...Object.values(meta));
    return { get, meta, names, course, P, R, T, last, pct: P.total ? Math.round((100 * P.done) / P.total) : 0,
      late: T.filter((x) => x.late).length, open: T.filter((x) => !x.done).length };
  }

  // ---------- server
  const why = (st) => (st === 403 ? "Нужен ключ администратора." : st === 404 || st === 405 ? "Кабинет работает только на https://study.bynurzy.com/." : st === 503 ? "Хранилище аккаунтов не подключено." : `Сервер ответил ${st}.`);
  async function fetchCopy(u) {
    const r = await SITE.api("admin/progress?id=" + encodeURIComponent(u.id)).catch(() => ({ status: 0 }));
    if (r.status === 404) { u.B = {}; u.none = true; u.err = 0; return; }
    if (!r.ok) { u.err = r.status || 1; u.B = null; return; }
    try { const B = await SITE.unsealBlob(r.data.data); u.B = B && typeof B === "object" ? B : {}; u.none = false; u.err = 0; u.claimed = r.data.claimed; }
    catch (e) { u.err = "key"; u.B = null; }
  }
  // read the newest copy, change it, write it back (re-reading first keeps what the student saved a moment ago)
  async function change(u, fn) {
    const r = await SITE.api("admin/progress?id=" + encodeURIComponent(u.id));
    let B = {};
    if (r.ok) B = await SITE.unsealBlob(r.data.data); else if (r.status !== 404) throw new Error(why(r.status));
    const now = Date.now();
    fn(B, (k, v) => (B[k] = { v: v === null ? null : String(v), t: now }), getter({ B }));
    const p = await SITE.api("admin/progress?id=" + encodeURIComponent(u.id), { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob(B) }) });
    if (!p.ok) throw new Error(why(p.status));
    u.B = B; u.none = false;
  }
  let toastT = 0;
  function toast(t, bad) {
    const el = $("cb-toast"); el.textContent = t; el.classList.toggle("bad", !!bad); el.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on"), bad ? 6000 : 3200);
  }
  async function act(u, fn, ok) {
    try { await change(u, fn); toast(ok); } catch (e) { toast(`Не сохранилось: ${e.message || "нет связи"}`, true); }
    render();
  }

  async function load() {
    const main = $("cb");
    if (!SITE.me()) { main.innerHTML = gate("Войдите на сайт своим логином преподавателя."); return; }
    if (!SITE.adminKey()) { main.innerHTML = gate("В этом браузере нет ключа администратора. Откройте раздел «Аккаунты учеников» и вставьте ключ, потом вернитесь сюда."); return; }
    main.innerHTML = '<p class="cb-wait">Загружаю учеников…</p>';
    const r = await SITE.api("admin/users").catch(() => ({ status: 0 }));
    if (!r.ok) { main.innerHTML = gate(why(r.status || 0)); return; }
    const seen = new Set(), users = [];
    for (const x of r.data.users) { let me = { login: "?", name: "?" }; try { me = await SITE.nameOf(x.n); } catch (e) { /* unreadable */ } seen.add(x.id); users.push(Object.assign({ id: x.id, at: x.at }, me)); }
    try { for (const a of await SITE.accounts(await SITE.access())) if (!seen.has(a.id)) users.push(Object.assign({ old: true }, a)); } catch (e) { /* access.json is optional */ }
    S.users = users.sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));
    let i = 0; const next = async () => { while (i < S.users.length) await fetchCopy(S.users[i++]); };
    await Promise.all(Array.from({ length: Math.min(5, S.users.length) }, next));
    S.loaded = true; render();
  }
  const gate = (t) => `<div class="cb-gate"><span class="label">[ Кабинет закрыт ]</span><p>${esc(t)}</p><a class="btn" href="teacher.html#reg">Аккаунты учеников <span class="arr">→</span></a></div>`;

  // ---------- small formatters
  const midnight = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return +d; };
  function ago(t) {
    if (!t) return "ещё не заходил(а)";
    const d = Math.round((midnight(Date.now()) - midnight(t)) / DAY);
    return d <= 0 ? "сегодня" : d === 1 ? "вчера" : d < 7 ? `${d} дн. назад` : new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  }
  const dateTxt = (d) => new Date(d + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const iso = (t) => { const d = new Date(t); return `${d.getFullYear()}-${nn(d.getMonth() + 1)}-${nn(d.getDate())}`; };
  const stepCap = (it) => `${it.stage.cap}${it.crs ? ` · ${it.crs === "V" ? "Verbal" : "Math"}` : ""}`;

  // ---------- the list of students
  function listHTML() {
    const q = S.q.trim().toLowerCase();
    const rows = S.users.map((u) => ({ u, I: u.B ? info(u) : null })).filter(({ u, I }) => {
      if (q && !`${u.name} ${u.login}`.toLowerCase().includes(q)) return false;
      if (S.filter === "late") return I && I.late;
      if (S.filter === "quiet") return !I || !I.last || Date.now() - I.last > 7 * DAY;
      return true;
    });
    const all = S.users.length, late = S.users.filter((u) => u.B && info(u).late).length;
    return `<div class="cb-find"><input id="cb-q" type="search" placeholder="Поиск: имя или логин" aria-label="Поиск ученика" value="${esc(S.q)}" autocomplete="off"></div>
      <div class="chips cb-filters" role="group" aria-label="Фильтр">
        ${[["all", `Все · ${all}`], ["late", `Просрочено · ${late}`], ["quiet", "Не заходили 7+ дней"]].map(([f, t]) => `<button class="chip" type="button" data-f="${f}" aria-pressed="${S.filter === f}">${t}</button>`).join("")}</div>
      <ul class="cb-sts">${rows.length ? rows.map(({ u, I }) => `<li><button type="button" class="cb-st" data-u="${esc(u.id)}" aria-current="${S.cur === u.id}">
          <span class="nm">${esc(u.name)}${I && I.late ? '<i class="dot" title="Есть просроченные задания"></i>' : ""}</span>
          <span class="pc">${I ? `${I.pct}%` : "—"}</span>
          <small>${esc(u.login)} · ${u.err ? "не прочитать" : esc(ago(I && I.last))}${I && I.open ? ` · заданий: ${I.open}` : ""}</small>
          <span class="cb-meter" aria-hidden="true"><i style="width:${I ? I.pct : 0}%"></i></span></button></li>`).join("")
        : `<li class="cb-none">${all ? "Никого не нашлось." : "Учеников пока нет."}</li>`}</ul>`;
  }

  // ---------- the student's card
  function trend(T, course) {
    const full = course === "VM", lo = full ? 400 : 200, hi = full ? 1600 : 800, vals = T.map((t) => t.v);
    const min = Math.max(lo, Math.floor((Math.min(...vals) - 60) / 100) * 100), max = Math.min(hi, Math.ceil((Math.max(...vals) + 60) / 100) * 100);
    const W = 420, H = 150, L = 38, Rp = 12, Tp = 16, B = 26, n = T.length, PAD = 22;
    const x = (i) => (n === 1 ? (L + W - Rp) / 2 : L + PAD + (i * (W - L - Rp - 2 * PAD)) / (n - 1)), y = (v) => Tp + (1 - (v - min) / (max - min || 1)) * (H - Tp - B);
    const st = max - min > 400 ? 200 : 100, ticks = []; for (let v = min; v <= max; v += st) ticks.push(v);
    return `<svg class="td-trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="Примерный балл: ${T.map((t) => `${t.id} ${t.v}`).join(", ")}">
      ${ticks.map((v) => `<line x1="${L}" x2="${W - Rp}" y1="${y(v)}" y2="${y(v)}" class="g"/><text x="${L - 6}" y="${y(v) + 3}" class="ax" text-anchor="end">${v}</text>`).join("")}
      ${n > 1 ? `<polyline class="ln" points="${T.map((t, i) => `${x(i)},${y(t.v)}`).join(" ")}"/>` : ""}
      ${T.map((t, i) => `<circle cx="${x(i)}" cy="${y(t.v)}" r="4.5" class="pt"/><text x="${x(i)}" y="${y(t.v) - 10}" class="vl" text-anchor="middle">${t.v}</text><text x="${x(i)}" y="${H - 8}" class="ax" text-anchor="middle">${t.id}</text>`).join("")}</svg>`;
  }
  function days14(R) {
    const set = new Set(R.filter((r) => r.t).map((r) => midnight(r.t))), today = midnight(Date.now());
    return `<ol class="cb-days" aria-label="Дни со сдачами за 14 дней">${Array.from({ length: 14 }, (_, i) => { const d = today - (13 - i) * DAY, on = set.has(d);
      return `<li class="${on ? "on" : ""}${i === 13 ? " now" : ""}" title="${new Date(d).toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" })}${on ? ": были сдачи" : ""}"><i></i></li>`; }).join("")}</ol>`;
  }
  function over(u, I) {
    const todo = I.P.flat.filter((it) => !it.ok && !it.opt), next = todo.find((it) => it.need) || todo[0];
    const T = Array.from({ length: 19 }, (_, i) => `PT${i + 1}`).map((id) => ({ id, v: PLAN.est(I.get(`mk_last_${u.nm}_${id}`)) })).filter((x) => x.v);
    const lessons = I.P.flat.filter((it) => /^[VM]\d\d-hw$/.test(it.id)), ld = lessons.filter((it) => it.ok).length;
    return `<div class="cb-kpis">
        <div><span>План курса</span><b>${I.pct}%</b><div class="meter"><i style="width:${I.pct}%"></i></div><small>${I.P.done} из ${I.P.total} ${pl(I.P.total, "шаг", "шага", "шагов")}</small></div>
        <div><span>Уроков сдано</span><b>${ld}<small> / ${lessons.length}</small></b></div>
        <div><span>Задания</span><b>${I.open}</b><small>${I.late ? `<em class="late">просрочено: ${I.late}</em>` : "открытых"}</small></div>
        <div><span>Последняя сдача</span><b class="sm">${esc(I.R[0] ? ago(I.R[0].t) : "—")}</b></div></div>
      <div class="cb-two">
        <section><h3>Сейчас в плане</h3>${next ? `<p class="td-where"><span>[ ${esc(stepCap(next))} · ${esc(next.when.toLowerCase())} ]</span></p><p class="cb-next">${esc(next.t)}</p>` : "<p class=\"td-sub\">Все шаги плана сделаны.</p>"}
          <h3 style="margin-top:22px">Активность за 14 дней</h3>${days14(I.R)}</section>
        <section><h3>Пробные тесты · примерный балл</h3>${T.length ? trend(T, I.course) + '<p class="td-note">Оценка по таблице nurzycom, ±40 на раздел. Только для вас и ученика.</p>' : '<p class="td-sub">Пока ни одного теста.</p>'}</section></div>
      <section><h3>Последние сдачи</h3>${I.R.length ? `<ul class="cb-rows">${I.R.slice(0, 6).map((r) => `<li><span>${esc(r.label)}<small>${esc(ago(r.t))}</small></span><b>${esc(r.score)}</b></li>`).join("")}</ul>` : '<p class="td-sub">Сдач пока нет.</p>'}</section>`;
  }
  function plan(u, I) {
    return `<div class="cb-bar"><div class="chips" role="group" aria-label="Курс ученика">${COURSES.map(([c, t]) => `<button class="chip" type="button" data-course="${c}" aria-pressed="${I.course === c}">${t}</button>`).join("")}</div>
        <p class="hint">Курс и отметки увидит ученик. Шаг с результатом отмечен сам: чтобы его вернуть, сбросьте результат.</p></div>
      ${I.P.S.map((st) => { const items = st.items.flatMap((g) => g.list), done = items.filter((it) => it.ok).length;
        return `<details class="cb-stage"${items.some((it) => !it.ok && !it.opt) && done ? " open" : ""}>
          <summary><span class="no">${esc(st.no)}</span><span class="tt">${esc(st.cap)}<small>${esc(st.title)}</small></span><span class="ct">${done}/${items.length}</span></summary>
          <ul>${items.map((it) => `<li class="${it.ok ? "ok" : ""}">
            <label class="cb-tick"><input type="checkbox" data-step="${esc(it.id)}" ${it.ok ? "checked" : ""} ${it.res ? "disabled" : ""}><span>${esc(it.t)}<small>${esc(it.when)}${it.crs ? ` · ${it.crs === "V" ? "Verbal" : "Math"}` : ""}${it.need ? " · обязательно" : it.opt ? " · по желанию" : ""}</small></span></label>
            <span class="st">${it.res ? `<b>${esc(it.res)}</b>` : it.hand ? "отмечено" : ""}</span></li>`).join("")}</ul>
          <div class="row"><button class="btn ghost sm" type="button" data-stage="${esc(st.no)}">Отметить весь этап</button></div></details>`; }).join("")}`;
  }
  function results(u, I) {
    return `<p class="hint cb-lead">«Сбросить» убирает результат и счётчик попыток, и ученик решает эту работу заново как в первый раз. Ответы, уже отправленные в Google Form, остаются там.</p>
      ${I.R.length ? `<ul class="cb-rows cb-res">${I.R.map((r) => `<li><span>${esc(r.label)}<small>${esc(r.t ? new Date(r.t).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "")}</small></span>
          <b>${esc(r.score)}</b><button class="chip" type="button" data-reset="${esc(r.key)}">Сбросить</button></li>`).join("")}</ul>` : '<p class="td-sub">Сдач пока нет.</p>'}`;
  }
  function tasks(u, I) {
    return `<div class="cb-bar"><button class="btn" type="button" data-new="1">Новое задание <span class="arr">+</span></button>
        <p class="hint">Ученик видит задания вверху страницы «Домашние задания». Работа с результатом отмечается сама, когда ученик её сдаст.</p></div>
      ${I.T.length ? `<ul class="cb-rows cb-tasks">${I.T.map((x) => `<li class="${x.done ? "ok" : x.late ? "late" : ""}">
          <span>${esc(x.t)}<small>${x.done ? `сделано${x.result ? ` · ${esc(PLAN.est(x.result) ? "≈ " + PLAN.est(x.result) : x.result)}` : ""}` : x.due ? `${x.late ? "просрочено · " : "до "}${esc(dateTxt(x.due))}` : "без срока"}${x.note ? ` · ${esc(x.note)}` : ""} · задано ${esc(ago(x.at))}</small></span>
          <button class="chip" type="button" data-deltask="${esc(x.id)}">Убрать</button></li>`).join("")}</ul>` : '<p class="td-sub">Заданий пока нет.</p>'}`;
  }

  // ---------- assign homework to one or several students
  const KIND = [["hw", "Часть тетради"], ["rd", "Текст для чтения"], ["px", "Сложные вопросы"], ["mk", "Пробный тест"], ["ds", "Desmos: набор"], ["uc", "Единичная окружность: набор"],
    ["ar", "Архаичные слова: набор"], ["vc", "Карточки слов урока"], ["own", "Своё задание"]];
  function items(kind) {   // [{ v, t, href, rk }] for one kind
    const L = S.lessons;
    if (kind === "rd") return PLAN.TEXT.map((x, i) => ({ v: `T${nn(i + 1)}`, t: `Текст ${i + 1} · «${x}»`, href: `reading.html?t=T${nn(i + 1)}`, rk: ["rd_last_", `T${nn(i + 1)}`] }));
    if (kind === "px") return Object.entries(PLAN.HARD).map(([x, t]) => ({ v: x, t: `Сложные вопросы ${x} · ${t}`, href: `practice.html?s=${x}`, rk: ["px_last_", x] }));
    if (kind === "mk") return Array.from({ length: 12 }, (_, i) => `PT${i + 1}`).map((x, i) => ({ v: x, t: `Пробный тест ${i + 1}${i >= 4 && i < 8 ? " · Reading and Writing" : ""}`, href: `mock.html?t=${x}`, rk: ["mk_last_", x] }));
    if (kind === "ds") return Object.entries(PLAN.DESMOS).map(([x, t]) => ({ v: x, t: `Desmos · набор ${Number(x.slice(1))} · ${t}`, href: `desmos.html?s=${x}`, rk: ["hw_last_", `${x}_p1`] }));
    if (kind === "uc") return ["U01", "U02", "U03", "U04"].map((x, i) => ({ v: x, t: `Единичная окружность · набор ${i + 1}`, href: `circle.html?s=${x}`, rk: ["hw_last_", `${x}_p1`] }));
    if (kind === "ar") return ["A01", "A02", "A03"].map((x, i) => ({ v: x, t: `Архаичные слова · набор ${i + 1}`, href: `archaic.html?s=${x}`, rk: ["hw_last_", `${x}_p1`] }));
    if (kind === "vc") return L.map((l) => ({ v: l.tag, t: `Карточки · ${short(l)}`, href: `vocab.html?l=${l.tag}`, rk: null }));
    if (kind === "hw") return L.map((l) => ({ v: l.tag, t: short(l) }));
    return [];
  }
  const short = (l) => { const p = String(l.title || l.tag).split(" · "); return p.length > 2 ? `${p[0].replace("SAT ", "")} · ${p.slice(1).join(" · ")}` : l.title || l.tag; };
  const parts = (tag) => { const l = S.lessons.find((x) => x.tag === tag); return l ? l.parts.map((p) => ({ v: p.id, t: p.title, href: `./?l=${tag}&p=${p.id}`, rk: ["hw_last_", `${tag}_${p.id}`], label: PLAN.label(`${tag}_${p.id}`, "hw", S.lessons) })) : []; };

  function assignHTML() {
    const A = S.assign, its = items(A.kind), P = A.kind === "hw" ? parts(A.item) : [];
    const opts = (list, sel) => list.map((x) => `<option value="${esc(x.v)}"${x.v === sel ? " selected" : ""}>${esc(x.t)}</option>`).join("");
    const n = A.ids.size;
    return `<form class="cb-assign" id="cb-assign">
      <div class="cb-ah"><h2>Новое задание</h2><button class="tlink" type="button" id="cb-acancel">Закрыть ✕</button></div>
      <div class="cb-grid">
        <label class="f"><span>Что задать</span><select id="cb-kind">${KIND.map(([k, t]) => `<option value="${k}"${k === A.kind ? " selected" : ""}>${t}</option>`).join("")}</select></label>
        ${A.kind === "own" ? `<label class="f"><span>Задание</span><input id="cb-own" type="text" maxlength="140" placeholder="Например: выписать 10 слов из урока 3" value="${esc(A.own)}" required></label>
          <label class="f"><span>Ссылка (необязательно)</span><input id="cb-link" type="text" maxlength="300" placeholder="https://… или vocab.html" value="${esc(A.link)}"></label>`
        : its.length ? `<label class="f"><span>${A.kind === "hw" || A.kind === "vc" ? "Урок" : "Что именно"}</span><select id="cb-item">${opts(its, A.item)}</select></label>
          ${A.kind === "hw" ? `<label class="f"><span>Часть тетради</span><select id="cb-part">${opts(P, A.part)}</select></label>` : ""}`
        : '<p class="hint f">Список уроков не загрузился. Обновите страницу или выберите другое задание.</p>'}
        <label class="f"><span>Срок</span><input id="cb-due" type="date" value="${esc(A.due)}" min="${iso(Date.now())}"></label>
        <label class="f wide"><span>Комментарий для ученика (необязательно)</span><input id="cb-note" type="text" maxlength="200" placeholder="Например: обратите внимание на вопросы 5–8" value="${esc(A.note)}"></label>
      </div>
      <fieldset class="cb-who"><legend>Кому · выбрано ${n}</legend>
        <div class="chips"><button class="chip" type="button" id="cb-all">${n === S.users.length ? "Снять всех" : "Выбрать всех"}</button></div>
        <div class="cb-whol">${S.users.map((u) => `<label class="cb-tick"><input type="checkbox" data-who="${esc(u.id)}" ${A.ids.has(u.id) ? "checked" : ""} ${u.err ? "disabled" : ""}><span>${esc(u.name)}<small>${esc(u.login)}</small></span></label>`).join("")}</div></fieldset>
      <div class="row"><button class="btn" type="submit" id="cb-ago" ${n ? "" : "disabled"}>Задать${n > 1 ? ` · ${n} ${pl(n, "ученику", "ученикам", "ученикам")}` : ""} <span class="arr">→</span></button><span class="hint" id="cb-amsg"></span></div></form>`;
  }
  function openAssign(ids) {
    const due = iso(Date.now() + 7 * DAY), first = (S.lessons[0] || {}).tag || "";
    S.assign = { kind: S.lessons.length ? "hw" : "mk", item: first, part: "", due, note: "", own: "", link: "", ids: new Set(ids) };
    fixAssign(); render(); setTimeout(() => { const f = $("cb-assign"); if (f) f.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }, 30);
  }
  function fixAssign() {   // keep item and part valid for the chosen kind
    const A = S.assign, its = items(A.kind);
    if (!its.some((x) => x.v === A.item)) A.item = its.length ? its[0].v : "";
    if (A.kind === "hw") { const P = parts(A.item); if (!P.some((x) => x.v === A.part)) A.part = (P.find((x) => /домаш/i.test(x.t)) || P[0] || {}).v || ""; }
  }
  function taskOf() {
    const A = S.assign, id = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 10);
    const base = { id, at: Date.now(), due: A.due || "", note: A.note.trim(), kind: A.kind };
    if (A.kind === "own") { const t = A.own.trim(); if (!t) return null; const link = A.link.trim(); return Object.assign(base, { t, href: /^(https:\/\/|[a-z0-9_-]+\.html|\.\/)/i.test(link) ? link : "", rk: null }); }
    if (A.kind === "hw") { const p = parts(A.item).find((x) => x.v === A.part); return p ? Object.assign(base, { t: p.label, href: p.href, rk: p.rk }) : null; }
    const it = items(A.kind).find((x) => x.v === A.item); return it ? Object.assign(base, { t: it.t, href: it.href, rk: it.rk }) : null;
  }
  async function submitAssign() {
    const t = taskOf(), msg = (s) => ($("cb-amsg").textContent = s);
    if (!t) { msg("Выберите задание."); return; }
    const who = S.users.filter((u) => S.assign.ids.has(u.id)); let ok = 0; const bad = [];
    $("cb-ago").disabled = true;
    for (const u of who) {
      msg(`Сохраняю ${ok + bad.length + 1} из ${who.length}…`);
      try { await change(u, (B, set, get) => { let L = []; try { L = JSON.parse(get("tasks") || "[]"); } catch (e) { L = []; } L.push(Object.assign({}, t)); set("tasks", JSON.stringify(L.slice(-60))); }); ok++; }
      catch (e) { bad.push(u.name); }
    }
    S.assign = null; render();
    toast(bad.length ? `Задано ${ok} из ${who.length}. Не получилось: ${bad.join(", ")}` : `«${t.t}» задано ${ok === 1 ? `ученику ${who[0].name}` : `${ok} ${pl(ok, "ученику", "ученикам", "ученикам")}`} · появится при следующем открытии сайта`, !!bad.length);
  }

  // ---------- results from the Google Form → the students' accounts (2026-11-06). Work sent before the logins existed, or from
  // another device, then ticks the plan, shows in «Сегодня» and in this cabinet. A key is written only when the account has no
  // newer value; its time is the time of the form answer, so a newer result on the student's device still wins.
  async function openImport() {
    S.assign = null; S.imp = { busy: "Загружаю ответы формы…", map: {} }; render();
    const r = await SITE.api("admin/form").catch(() => ({ status: 0 }));
    if (r.ok) { try { const f = await SITE.unsealBlob(r.data.data); return useForm(f.csv, f.aliases || {}, `сохранены ${new Date(r.data.at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`); } catch (e) { /* fall through */ } }
    S.imp = { busy: "", none: true, map: {} }; render();
  }
  function useForm(csv, aliases, label) {
    const rows = FORMKIT.rows(csv); if (!rows.length) { S.imp = { none: true, err: "В файле нет результатов с сайта.", map: {} }; return render(); }
    const counts = {}; rows.forEach((r) => (counts[r.raw] = (counts[r.raw] || 0) + 1));
    const G = FORMKIT.group(counts, aliases), me = SITE.me(), map = {};
    G.groups.forEach((g) => {
      const hit = S.users.filter((u) => !u.err && u.login !== me && FORMKIT.key(u.name) === g.key);
      map[g.key] = hit.length === 1 ? hit[0].id : "";
    });
    S.imp = { csv, aliases, label, rows, G, map }; render();
  }
  function entries(rows, n) {   // the storage keys a student's form rows stand for: { key: { v, t } }
    const E = {}, put = (k, v, t) => { if (!E[k] || E[k].t <= t) E[k] = { v: String(v), t }; }, cnt = (k, t) => { E[k] = { v: String((E[k] ? Number(E[k].v) : 0) + 1), t: Math.max(t, E[k] ? E[k].t : 0) }; };
    const mocks = {};
    for (const r of rows) {
      const t = +r.ts || 0;
      if (r.kind === "P") { (mocks[r.lesson] = mocks[r.lesson] || []).push(r); continue; }
      if (r.kind === "X") { put(`px_last_${n}_${r.lesson}`, `${r.a}/${r.b}`, t); cnt(`px_att_${n}_${r.lesson}`, t); continue; }
      if (r.kind === "T") { put(`rd_last_${n}_${r.lesson}`, `${r.a}/${r.b}`, t); cnt(`rd_att_${n}_${r.lesson}`, t); continue; }
      const pid = r.pid || (/^[ADU]\d\d$/.test(r.lesson) ? "p1" : ""); if (!pid) continue;
      put(`hw_last_${n}_${r.lesson}_${pid}`, `${r.a}/${r.b}`, t); cnt(`hw_att_${n}_${r.lesson}_${pid}`, t);
    }
    for (const [id, rs] of Object.entries(mocks)) {   // the latest run of a test: its sections sent within 15 minutes of each other
      const last = rs[rs.length - 1], run = {};
      rs.filter((r) => Math.abs((+r.ts || 0) - (+last.ts || 0)) < 9e5).forEach((r) => (run[r.sec2] = r));
      const v = ["rw", "math"].filter((x) => run[x]).map((x) => { const r = run[x]; return `${x === "rw" ? "RW" : "Math"} ${r.a}/${r.b} ≈ ${window.SATSCALE ? SATSCALE.section(x, r.hard, r.a) : "?"}`; }).join(" · ");
      put(`mk_last_${n}_${id}`, v, +last.ts || 0);
      rs.forEach((r) => cnt(`mk_att_${n}_${id}_${r.sec2}`, +r.ts || 0));
    }
    return E;
  }
  const fresh = (B, E) => Object.entries(E).filter(([k, e]) => !(B && B[k] && (B[k].t || 0) >= e.t));
  function planFor(g) {   // what one group would bring into the chosen account
    const u = S.users.find((x) => x.id === S.imp.map[g.key]); if (!u) return null;
    const rows = S.imp.rows.filter((r) => g.spellings[r.raw]), E = entries(rows, u.name);
    return { u, rows, E, add: fresh(u.B, E).filter(([k]) => /_last_/.test(k)).length };
  }
  function importHTML() {
    const I = S.imp;
    if (I.busy) return `<p class="cb-wait">${esc(I.busy)}</p>`;
    const head = `<div class="cb-ah"><h2>Результаты из Google Form</h2><button class="tlink" type="button" id="cb-icancel">Закрыть ✕</button></div>`;
    if (I.none) return `<div class="cb-assign">${head}<p class="td-sub">${esc(I.err || "Ответы формы ещё не сохранены в кабинете.")} Выберите файл ответов: Google Forms → Responses → View in Sheets → File → Download → Comma Separated Values (.csv).</p>
      <label class="drop" for="cb-ifile">Выбрать CSV<input id="cb-ifile" type="file" accept=".csv,text/csv" hidden></label>
      <p class="hint">Файл, загруженный на странице «Ответы из Google Form», сохраняется в кабинете сам.</p></div>`;
    const accs = S.users.filter((u) => !u.err);
    const P = I.G.groups.map((g) => ({ g, p: planFor(g), n: I.rows.filter((r) => g.spellings[r.raw]).length }));
    const go = P.filter((x) => x.p && x.p.add), total = go.reduce((a, x) => a + x.p.add, 0);
    return `<div class="cb-assign cb-imp">${head}
      <p class="hint cb-lead">${I.rows.length} результатов · ${esc(I.label || "")}. Разные написания одного имени объединены. Выберите, в чей аккаунт перенести результаты: тогда они отметят план, появятся у ученика в «Сегодня» и здесь, в карточке. Более новые результаты ученика не заменяются.</p>
      <ul class="cb-rows">${P.map(({ g, p, n }) => `<li><span><b class="nm">${esc(g.name)}</b><small>${esc(Object.keys(g.spellings).join(" · "))} · ${n} ${n === 1 ? "результат" : n < 5 ? "результата" : "результатов"}</small></span>
        <select data-imap="${esc(g.key)}" aria-label="Аккаунт для ${esc(g.name)}"><option value="">Не переносить</option>${accs.map((u) => `<option value="${esc(u.id)}"${I.map[g.key] === u.id ? " selected" : ""}>${esc(u.name)} · ${esc(u.login)}</option>`).join("")}</select>
        <b class="ct">${p ? (p.add ? `+${p.add}` : "уже есть") : "—"}</b></li>`).join("")}</ul>
      <div class="row"><button class="btn" type="button" id="cb-igo" ${total ? "" : "disabled"}>Перенести${total ? ` · ${total} в ${go.length} ${go.length === 1 ? "аккаунт" : go.length < 5 ? "аккаунта" : "аккаунтов"}` : ""} <span class="arr">→</span></button><span class="hint" id="cb-imsg"></span></div>
      <p class="hint">Ученики без аккаунта остаются только в «Ответах из Google Form». «Пробные тесты»: переносится последний результат с примерным баллом; разбор вопросов откроется только на устройстве, где тест решали.</p></div>`;
  }
  function bindImport() {
    if ($("cb-icancel")) $("cb-icancel").onclick = () => { S.imp = null; render(); };
    if ($("cb-ifile")) $("cb-ifile").onchange = () => { const f = $("cb-ifile").files[0]; if (!f) return; const rd = new FileReader();
      rd.onload = async () => { useForm(rd.result, {}, "файл " + f.name);
        if (S.imp && S.imp.rows) SITE.api("admin/form", { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({ csv: rd.result, aliases: {}, at: Date.now() }) }) }).catch(() => {}); };
      rd.readAsText(f, "utf-8"); };
    $("cb").querySelectorAll("[data-imap]").forEach((sel) => (sel.onchange = () => { S.imp.map[sel.dataset.imap] = sel.value; render(); }));
    if ($("cb-igo")) $("cb-igo").onclick = async () => {
      const go = S.imp.G.groups.map(planFor).filter((p) => p && p.add); let ok = 0, n = 0; const bad = [];
      $("cb-igo").disabled = true;
      for (const p of go) {
        $("cb-imsg").textContent = `Переношу ${ok + bad.length + 1} из ${go.length}…`;
        try { await change(p.u, (B) => { for (const [k, e] of fresh(B, p.E)) { B[k] = e; if (/_last_/.test(k)) n++; } }); ok++; } catch (e) { bad.push(p.u.name); }
      }
      S.imp = null; render();
      toast(bad.length ? `Перенесено в ${ok} из ${go.length}. Не получилось: ${bad.join(", ")}` : `Перенесено ${n} результатов в ${ok} ${ok === 1 ? "аккаунт" : "аккаунта(ов)"} · ученики увидят их при следующем входе`, !!bad.length);
    };
  }

  // ---------- page
  function render() {
    const main = $("cb"); if (!S.loaded) return;
    const u = S.users.find((x) => x.id === S.cur), focusQ = document.activeElement && document.activeElement.id === "cb-q";
    document.body.classList.toggle("cb-has", !!u || !!S.assign || !!S.imp);
    let detail = "";
    if (S.imp) detail = importHTML();
    else if (S.assign) detail = assignHTML();
    else if (!u) detail = `<div class="cb-empty"><span class="label">[ Кабинет ]</span><h2>Выберите ученика слева</h2><p class="td-sub">Прогресс, план, результаты и задания. Или задайте одно задание сразу нескольким ученикам.</p>
        <div class="row"><button class="btn" type="button" data-bulk="1">Задать задание группе <span class="arr">→</span></button></div></div>`;
    else if (u.err) detail = `<div class="cb-empty"><h2>${esc(u.name)}</h2><p class="td-sub">${u.err === "key" ? "Копию этого ученика не удалось расшифровать." : esc(why(u.err))}</p></div>`;
    else {
      const I = info(u), names = Object.keys(I.names);
      detail = `<header class="cb-head"><button class="tlink cb-back" type="button" data-back="1">← Все ученики</button>
          <span class="label">[ ${esc(u.login)} · ${esc(COURSES.find((c) => c[0] === I.course)[1])} · ${I.last ? `был(а) ${esc(ago(I.last))}` : "ещё не сдавал(а)"} ]</span>
          <h1 class="cb-name">${esc(u.name)}</h1>
          ${names.length > 1 || (names.length && !I.names[u.name]) ? `<label class="cb-as"><span>Результаты под именем</span><select id="cb-nm">${[...new Set([u.name, ...names])].map((x) => `<option${x === u.nm ? " selected" : ""}>${esc(x)}</option>`).join("")}</select></label>` : ""}
          ${u.none ? '<p class="hint">Ученик ещё ничего не сохранил в аккаунте. Задание всё равно можно задать: оно появится, когда ученик войдёт.</p>' : ""}
        </header>
        <div class="chips cb-tabs" role="tablist">${[["over", "Обзор"], ["plan", "План"], ["res", `Результаты · ${I.R.length}`], ["tasks", `Задания${I.open ? ` · ${I.open}` : ""}`]].map(([k, t]) => `<button class="chip" role="tab" type="button" data-tab="${k}" aria-selected="${S.tab === k}" aria-pressed="${S.tab === k}">${t}</button>`).join("")}</div>
        <div class="cb-body">${S.tab === "plan" ? plan(u, I) : S.tab === "res" ? results(u, I) : S.tab === "tasks" ? tasks(u, I) : over(u, I)}</div>`;
    }
    main.innerHTML = `<aside class="cb-side">${listHTML()}<div class="row cb-bulk"><button class="btn ghost" type="button" data-bulk="1">Задать задание группе</button><button class="btn ghost" type="button" data-imp="1">Результаты из Google Form</button><button class="tlink" type="button" id="cb-reload">Обновить</button></div></aside>
      <section class="cb-detail" aria-live="polite">${detail}</section>`;
    bind(u);
    if (focusQ) { const q = $("cb-q"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }
  function bind(u) {
    const main = $("cb"), on = (sel, fn) => main.querySelectorAll(sel).forEach((el) => (el.onclick = (e) => fn(el, e)));
    $("cb-q").oninput = (e) => { S.q = e.target.value; render(); };
    on("[data-f]", (b) => { S.filter = b.dataset.f; render(); });
    on(".cb-st", (b) => { S.cur = b.dataset.u; S.assign = null; S.tab = "over"; render(); window.scrollTo({ top: 0 }); });
    on("[data-back]", () => { S.cur = null; render(); });
    on("[data-bulk]", () => { S.imp = null; openAssign(S.cur ? [S.cur] : []); });
    on("[data-imp]", () => openImport());
    on("[data-tab]", (b) => { S.tab = b.dataset.tab; render(); });
    $("cb-reload").onclick = async () => { S.loaded = false; S.users.forEach((x) => (x.nm = "")); await load(); toast("Обновлено"); };
    if ($("cb-nm")) $("cb-nm").onchange = (e) => { u.nm = e.target.value; render(); };
    if (u) {
      const I = u.B ? info(u) : null, nm = u.nm;
      on("[data-course]", (b) => act(u, (B, set) => set("plan_course", b.dataset.course), `Курс: ${b.textContent}`));
      main.querySelectorAll("[data-step]").forEach((c) => (c.onchange = () => act(u, (B, set, get) => {
        let M = []; try { M = JSON.parse(get(`plan_done_${nm}`) || "[]"); } catch (e) { M = []; }
        M = M.filter((x) => x !== c.dataset.step); if (c.checked) M.push(c.dataset.step); set(`plan_done_${nm}`, JSON.stringify(M));
      }, c.checked ? "Шаг отмечен" : "Отметка снята")));
      on("[data-stage]", (b) => { const st = I.P.S.find((x) => x.no === b.dataset.stage), ids = st.items.flatMap((g) => g.list).filter((it) => !it.ok).map((it) => it.id);
        if (!ids.length) { toast("Здесь уже всё отмечено"); return; }
        act(u, (B, set, get) => { let M = []; try { M = JSON.parse(get(`plan_done_${nm}`) || "[]"); } catch (e) { M = []; } set(`plan_done_${nm}`, JSON.stringify([...new Set([...M, ...ids])])); }, `${st.cap}: отмечено ${ids.length}`); });
      on("[data-reset]", (b) => { const r = I.R.find((x) => x.key === b.dataset.reset); if (!r || !confirm(`Сбросить «${r.label}» (${r.score}) у ${u.name}? Ученик решит эту работу заново.`)) return;
        act(u, (B, set) => PLAN.resetKeys(nm, r.kind, r.rest).forEach((k) => set(k, null)), `Сброшено: ${r.label}`); });
      on("[data-new]", () => openAssign([u.id]));
      on("[data-deltask]", (b) => { const x = I.T.find((t) => t.id === b.dataset.deltask); if (!x || !confirm(`Убрать задание «${x.t}» у ${u.name}?`)) return;
        act(u, (B, set, get) => { let L = []; try { L = JSON.parse(get("tasks") || "[]"); } catch (e) { L = []; } set("tasks", JSON.stringify(L.filter((t) => t.id !== x.id))); }, "Задание убрано"); });
    }
    if (S.imp) bindImport();
    const f = $("cb-assign"); if (!f) return;
    const A = S.assign, keep = (fn) => (e) => { fn(e.target.value); fixAssign(); render(); };
    $("cb-kind").onchange = keep((v) => (A.kind = v));
    if ($("cb-item")) $("cb-item").onchange = keep((v) => (A.item = v));
    if ($("cb-part")) $("cb-part").onchange = (e) => (A.part = e.target.value);
    $("cb-due").onchange = (e) => (A.due = e.target.value);
    $("cb-note").oninput = (e) => (A.note = e.target.value);
    if ($("cb-own")) $("cb-own").oninput = (e) => (A.own = e.target.value);
    if ($("cb-link")) $("cb-link").oninput = (e) => (A.link = e.target.value);
    main.querySelectorAll("[data-who]").forEach((c) => (c.onchange = () => { c.checked ? A.ids.add(c.dataset.who) : A.ids.delete(c.dataset.who); render(); }));
    $("cb-all").onclick = () => { if (A.ids.size === S.users.length) A.ids.clear(); else S.users.filter((x) => !x.err).forEach((x) => A.ids.add(x.id)); render(); };
    $("cb-acancel").onclick = () => { S.assign = null; render(); };
    f.onsubmit = (e) => { e.preventDefault(); submitAssign(); };
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (!window.SITE) return;
    SITE.ready.then(async () => {
      try { const d = await SITE.json("lessons"); S.lessons = (d.lessons || d).filter((l) => l && l.tag && Array.isArray(l.parts)); } catch (e) { S.lessons = []; }
      load();
    });
  });
})();
