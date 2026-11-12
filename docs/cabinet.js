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
  const S = { users: [], cur: null, tab: "over", q: "", lessons: [], assign: null, imp: null, loaded: false, groups: [], gview: "all", editG: null, focus: "", ct: false };

  // ---------- groups (2026-11-09, Nurassyl: «one group I need to distinguish clearly, and my individual students»). Each group has a
  // name, a kind (a class group or individual students), a colour and its members (account ids; a student is in one group at most).
  // Saved encrypted in KV «groups» (api/admin/groups) and kept in this browser too, so a missing server still leaves the groups here.
  const GCOL = { blue: ["Синий", "#1F4FA3", "#E4EBF7"], green: ["Зелёный", "#2B6E2F", "#E3EFE1"], amber: ["Охра", "#8A5300", "#F6EBD8"],
    violet: ["Фиолетовый", "#6A3D9E", "#EDE5F6"], teal: ["Бирюзовый", "#165F6E", "#DCEDF0"], rose: ["Малиновый", "#9E2456", "#F6E2EB"] };
  const KINDS = { group: "Группа", solo: "Индивидуальные" };
  const col = (g) => GCOL[(g && g.color) || ""] || null;
  const gStyle = (g) => { const c = col(g); return c ? ` style="--g:${c[1]};--gt:${c[2]}"` : ""; };
  const groupOf = (u) => S.groups.find((g) => g.members.includes(u.id)) || null;
  const membersOf = (g) => S.users.filter((u) => (g ? g.members.includes(u.id) : !groupOf(u)));
  const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 10);
  async function loadGroups() {   // the newer of the server copy and this browser's copy wins; a newer local copy is sent back up
    let srv = null, loc = null;
    const r = await SITE.api("admin/groups").catch(() => ({ status: 0 }));
    if (r.ok) { try { srv = await SITE.unsealBlob(r.data.data); } catch (e) { srv = null; } }
    try { loc = JSON.parse(localStorage.getItem("cb_groups") || "null"); } catch (e) { loc = null; }
    if (Array.isArray(loc)) loc = { groups: loc, at: 0 };   // older format: a bare list
    const pick = srv && Array.isArray(srv.groups) && (!loc || !Array.isArray(loc.groups) || (srv.at || 0) >= (loc.at || 0)) ? srv : loc && Array.isArray(loc.groups) ? loc : null;
    const G = pick ? pick.groups : [{ id: newId(), name: "Группа", kind: "group", color: "blue", members: [] }, { id: newId(), name: "Индивидуальные ученики", kind: "solo", color: "green", members: [] }];
    S.groups = G.filter((g) => g && g.id).map((g) => ({ id: String(g.id), name: String(g.name || "Группа").slice(0, 60), kind: g.kind === "solo" ? "solo" : "group", color: GCOL[g.color] ? g.color : "blue", members: Array.isArray(g.members) ? g.members.map(String) : [] }));
    S.groupsAt = pick ? pick.at || 0 : 0;
    if (pick && pick === loc && r.status !== 0 && r.status !== 503 && (r.ok || r.status === 404)) saveGroups("Группы из этого браузера сохранены на сервере", true);
  }
  async function saveGroups(msg, quiet) {
    S.groupsAt = Date.now();
    try { localStorage.setItem("cb_groups", JSON.stringify({ groups: S.groups, at: S.groupsAt })); } catch (e) { /* private mode */ }
    const r = await SITE.api("admin/groups", { method: "PUT", body: JSON.stringify({ data: await SITE.sealBlob({ groups: S.groups, at: S.groupsAt }) }) }).catch(() => ({ status: 0 }));
    if (!quiet || r.ok) toast(r.ok ? msg : `${msg} · сохранено только в этом браузере (${why(r.status || 0)})`, !r.ok);
  }
  function moveTo(uid, gid) { S.groups.forEach((g) => (g.members = g.members.filter((x) => x !== uid))); const g = S.groups.find((x) => x.id === gid); if (g) g.members.push(uid); }

  // ---------- a student's synced copy: { key: { v, t } }; v: null is a removed key
  const getter = (u) => (k) => (u.B && u.B[k] && u.B[k].v != null ? String(u.B[k].v) : null);
  const metaOf = (u) => { const m = {}; if (u.B) for (const [k, r] of Object.entries(u.B)) m[k] = (r && r.t) || 0; return m; };
  const keysOf = (u) => (u.B ? Object.keys(u.B).filter((k) => u.B[k] && u.B[k].v != null) : []);
  // the name the results are stored under (the login sets it; results made earlier with the shared password may use another)
  const NAME_RE = [/^hw_last_(.+)_(?:[VM]\d\d|VA|MD|[ADU]\d\d)_p\d+$/, /^px_last_(.+)_X\d\d$/, /^rd_last_(.+)_T\d\d$/, /^mk_last_(.+)_P[TR]\d+$/, /^ct_last_(.+)_C[a-z0-9]{8}$/, /^plan_done_(.+)$/];
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
  function toast(t, bad, undo) {   // undo: optional function behind a «Вернуть» button (the toast then stays 8 s)
    const el = $("cb-toast"); el.textContent = t; el.classList.toggle("bad", !!bad); el.classList.toggle("undo", !!undo); el.classList.add("on");
    if (undo) { const b = document.createElement("button"); b.type = "button"; b.className = "cb-undo"; b.textContent = "Вернуть";
      b.onclick = () => { clearTimeout(toastT); el.classList.remove("on", "undo"); undo(); }; el.append(" ", b); }
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on", "undo"), undo ? 8000 : bad ? 6000 : 3200);
  }
  async function act(u, fn, ok, undo) {
    try { await change(u, fn); toast(ok, false, undo); } catch (e) { toast(`Не сохранилось: ${e.message || "нет связи"}`, true); }
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
    const me = SITE.me(); S.users = users.filter((u) => !me || u.login !== me).sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));   // the teacher's own login is not a student
    await loadGroups();
    try { await CTED.load(); } catch (e) { /* the tests are optional: the rest of the cabinet works without them */ }
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

  // ---------- overview: who needs attention, then one coloured block per group with a card per student
  const pctTxt = (I) => (I ? `${I.pct}%` : "—");
  function shown() {   // the students of the chosen group tab, filtered by the search
    const q = S.q.trim().toLowerCase();
    return S.users.filter((u) => (S.gview === "all" ? true : S.gview === "none" ? !groupOf(u) : (groupOf(u) || {}).id === S.gview) && (!q || `${u.name} ${u.login}`.toLowerCase().includes(q)));
  }
  function toolbar() {
    const none = membersOf(null).length, tab = (v, label, n, g, sr) => `<button class="gtab" type="button" data-g="${esc(v)}" aria-pressed="${S.gview === v}"${gStyle(g)}>${g ? '<i class="gdot" aria-hidden="true"></i>' : ""}${esc(label)} <b>${n}</b>${sr ? `<span class="sr-only">, ${esc(sr)}</span>` : ""}</button>`;
    return `<div class="cb-tool">
      <div class="cb-gtabs" role="group" aria-label="Группы учеников">${tab("all", "Все ученики", S.users.length)}${S.groups.map((g) => tab(g.id, g.name, membersOf(g).length, g, KINDS[g.kind])).join("")}${none ? tab("none", "Без группы", none) : ""}
        <button class="gtab add" type="button" data-gnew="1">+ Новая группа</button></div>
      <div class="cb-tool2"><input id="cb-q" type="search" placeholder="Найти ученика: имя или логин" aria-label="Найти ученика" value="${esc(S.q)}" autocomplete="off">
        <button class="btn" type="button" data-bulk="1">Задать задание <span class="arr">+</span></button>
        <button class="btn ghost" type="button" data-ct="1" aria-pressed="${S.ct}">Мои тесты</button>
        <button class="btn ghost" type="button" data-imp="1">Результаты из Google Form</button>
        <button class="tlink" type="button" id="cb-reload">Обновить</button></div></div>`;
  }
  function card(u) {
    const I = u.B ? info(u) : null, g = groupOf(u), T = I ? PLAN.trend(I.course, u.nm, I.get) : [], pt = T[T.length - 1];
    return `<li class="scard${I && I.late ? " is-late" : ""}"${gStyle(g)}>
      <button class="sc-open" type="button" data-u="${esc(u.id)}" aria-label="Открыть: ${esc(u.name)}">
        <span class="sc-nm">${esc(u.name)}</span>
        <span class="sc-sub">${esc(u.login)}${I ? ` · ${esc(COURSES.find((c) => c[0] === I.course)[1])}` : ""}</span>
        <span class="sc-pc"><b>${pctTxt(I)}</b> плана</span><span class="cb-meter" aria-hidden="true"><i style="width:${I ? I.pct : 0}%"></i></span>
        <span class="sc-meta">${u.err ? "копию не прочитать" : `последняя сдача: ${esc(I && I.R[0] ? ago(I.R[0].t) : "нет")}`}</span>
        <span class="sc-tags">${I && I.late ? `<em class="tag late">просрочено ${I.late}</em>` : ""}${I && I.open ? `<em class="tag">заданий ${I.open}</em>` : ""}${pt ? `<em class="tag">${esc(pt.id)} ≈ ${pt.v}</em>` : ""}${I && I.last && Date.now() - I.last > 7 * DAY ? '<em class="tag quiet">не заходил(а) 7+ дней</em>' : ""}</span></button>
      <div class="sc-act"><button class="chip" type="button" data-assign1="${esc(u.id)}">Задать</button>
        ${!g ? `<select data-place="${esc(u.id)}" aria-label="В группу: ${esc(u.name)}"><option value="">В группу…</option>${S.groups.map((x) => `<option value="${esc(x.id)}">${esc(x.name)}</option>`).join("")}</select>` : ""}</div></li>`;
  }
  function block(g, list) {
    const I = list.map((u) => (u.B ? info(u) : null)).filter(Boolean), avg = I.length ? Math.round(I.reduce((a, x) => a + x.pct, 0) / I.length) : 0, late = I.reduce((a, x) => a + (x.late ? 1 : 0), 0);
    return `<section class="gblock${g ? "" : " nogroup"}"${gStyle(g)} aria-label="${esc(g ? g.name : "Без группы")}">
      <header class="gb-h"><div><span class="gb-kind">${g ? esc(KINDS[g.kind]) : "Не распределены"}</span><h2>${esc(g ? g.name : "Без группы")}</h2>
        <p class="gb-stats">${list.length} ${pl(list.length, "ученик", "ученика", "учеников")}${I.length ? ` · план в среднем ${avg}%` : ""}${late ? ` · <em class="late">с просрочкой: ${late}</em>` : ""}</p></div>
        <div class="gb-act">${g ? `${list.length ? `<button class="btn gbtn" type="button" data-bulkg="${esc(g.id)}">Задать задание ${g.kind === "solo" ? "этим ученикам" : "группе"}</button>` : ""}<button class="btn ghost sm" type="button" data-gedit="${esc(g.id)}">Настроить</button>` : ""}</div></header>
      ${list.length ? `<ul class="gb-cards">${list.map(card).join("")}</ul>` : `<p class="gb-empty">${g ? "В группе пока никого. Нажмите «Настроить» и отметьте учеников." : ""}</p>`}</section>`;
  }
  function overviewHTML() {
    const list = shown(), q = S.q.trim();
    const late = list.filter((u) => u.B && info(u).late), quiet = list.filter((u) => u.B && (() => { const I = info(u); return !I.last || Date.now() - I.last > 7 * DAY; })()), none = membersOf(null);
    const who = (us) => us.map((u) => `<button class="tlink" type="button" data-u="${esc(u.id)}">${esc(u.name)}</button>`).join(", ");
    const att = [late.length ? `<li class="att late"><b>Просрочены задания</b><span>${who(late)}</span></li>` : "", quiet.length ? `<li class="att quiet"><b>Не заходили 7+ дней</b><span>${who(quiet)}</span></li>` : "",
      none.length && S.gview === "all" ? `<li class="att place"><b>Без группы: ${none.length}</b><span>Выберите группу в карточке ученика («В группу…») или нажмите «Настроить» у группы.</span></li>` : ""].join("");
    let blocks;
    if (q) blocks = list.length ? block(S.gview !== "all" && S.gview !== "none" ? S.groups.find((g) => g.id === S.gview) : null, list).replace('<h2>Без группы</h2>', `<h2>Поиск: «${esc(q)}»</h2>`) : '<p class="gb-empty">Никого не нашлось.</p>';
    else if (S.gview === "all") blocks = S.groups.map((g) => block(g, membersOf(g))).join("") + (none.length ? block(null, none) : "");
    else if (S.gview === "none") blocks = block(null, none);
    else { const g = S.groups.find((x) => x.id === S.gview); blocks = g ? block(g, membersOf(g)) : ""; }
    return `${att ? `<ul class="cb-att" aria-label="Требуют внимания">${att}</ul>` : ""}${blocks}${S.users.length ? "" : '<p class="gb-empty">Учеников пока нет: аккаунты создаются на странице «Аккаунты учеников».</p>'}`;
  }
  // ---------- group settings: name, kind, colour, members
  function groupHTML() {
    const E = S.editG, isNew = !S.groups.some((g) => g.id === E.id);
    return `<form class="cb-assign cb-gform" id="cb-gform"${gStyle(E)}>
      <div class="cb-ah"><h2 tabindex="-1">${isNew ? "Новая группа" : `Настройки: ${esc(E.name)}`}</h2><button class="tlink" type="button" id="cb-gcancel">Закрыть ✕</button></div>
      <div class="cb-grid"><label class="f"><span>Название</span><input id="g-name" type="text" maxlength="60" required value="${esc(E.name)}" placeholder="Например: SAT группа · ноябрь"></label>
        <fieldset class="f g-kind"><legend>Тип</legend>${Object.entries(KINDS).map(([k, t]) => `<label class="radio"><input type="radio" name="g-kind" value="${k}" ${E.kind === k ? "checked" : ""}> ${t}</label>`).join("")}</fieldset></div>
      <fieldset class="g-colors"><legend>Цвет</legend>${Object.entries(GCOL).map(([k, [t, c]]) => `<label class="sw" style="--g:${c}"><input type="radio" name="g-color" value="${k}" ${E.color === k ? "checked" : ""}><i aria-hidden="true"></i>${t}</label>`).join("")}</fieldset>
      <fieldset class="cb-who"><legend>Ученики · выбрано ${E.members.length}</legend>
        <div class="cb-whol">${S.users.map((u) => { const g = groupOf(u); return `<label class="cb-tick"><input type="checkbox" data-gm="${esc(u.id)}" ${E.members.includes(u.id) ? "checked" : ""}><span>${esc(u.name)}<small>${esc(u.login)}${g && g.id !== E.id ? ` · сейчас: ${esc(g.name)}` : ""}</small></span></label>`; }).join("")}</div></fieldset>
      <p class="hint">Ученик может быть только в одной группе: если отметить ученика из другой группы, он перейдёт сюда. Группы видите только вы.</p>
      <div class="row"><button class="btn" type="submit">Сохранить группу</button>${isNew ? "" : '<button class="btn ghost" type="button" id="g-del">Удалить группу</button>'}</div></form>`;
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
    const T = PLAN.trend(I.course, u.nm, I.get);
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
        <p class="hint">Ученик видит задания вверху страницы «Домашние задания». Работа с результатом отмечается сама, когда ученик её сдаст; если он уже сделал её раньше, задание сразу считается выполненным («сделано раньше»). Чтобы ученик сделал работу заново, сбросьте результат во вкладке «Результаты».</p></div>
      ${I.T.length ? `<ul class="cb-rows cb-tasks">${I.T.map((x) => `<li class="${x.done ? "ok" : x.late ? "late" : ""}">
          <span>${esc(x.t)}<small>${x.done ? `сделано${x.early ? " раньше" : ""}${x.result ? ` · ${esc(PLAN.est(x.result) ? "≈ " + PLAN.est(x.result) : x.result)}` : ""}` : esc(PLAN.dueTxt(x.due))}${x.note ? ` · ${esc(x.note)}` : ""} · задано ${esc(ago(x.at))}</small></span>
          <button class="chip" type="button" data-deltask="${esc(x.id)}">Убрать</button></li>`).join("")}</ul>` : '<p class="td-sub">Заданий пока нет.</p>'}`;
  }

  // ---------- assign homework to one or several students
  const KIND = [["hw", "Часть тетради"], ["rd", "Текст для чтения"], ["px", "Сложные вопросы"], ["mk", "Пробный тест"], ["ds", "Desmos: набор"], ["uc", "Единичная окружность: набор"],
    ["ar", "Архаичные слова: набор"], ["vc", "Карточки слов урока"], ["ct", "Мой тест"], ["own", "Своё задание"]];
  function items(kind) {   // [{ v, t, href, rk }] for one kind
    const L = S.lessons;
    if (kind === "rd") return PLAN.TEXT.map((x, i) => ({ v: `T${nn(i + 1)}`, t: `Текст ${i + 1} · «${x}»`, href: `reading.html?t=T${nn(i + 1)}`, rk: ["rd_last_", `T${nn(i + 1)}`] }));
    if (kind === "px") return Object.entries(PLAN.HARD).map(([x, t]) => ({ v: x, t: `Сложные вопросы ${x} · ${t}`, href: `practice.html?s=${x}`, rk: ["px_last_", x] }));
    if (kind === "mk") return [...Array.from({ length: 19 }, (_, i) => `PT${i + 1}`), "PR1", "PR2", "PR3"].map((x) => { const n = +x.slice(2), rw = x === "PR1" || (x[1] === "T" && n >= 5 && n <= 8); return { v: x, t: `${x[1] === "R" ? "Прогноз" : "Пробный тест"} ${n}${rw ? " · Reading and Writing" : ""}`, href: `mock.html?t=${x}`, rk: ["mk_last_", x] }; });
    if (kind === "ds") return Object.entries(PLAN.DESMOS).map(([x, t]) => ({ v: x, t: `Desmos · набор ${Number(x.slice(1))} · ${t}`, href: `desmos.html?s=${x}`, rk: ["hw_last_", `${x}_p1`] }));
    if (kind === "uc") return ["U01", "U02", "U03", "U04"].map((x, i) => ({ v: x, t: `Единичная окружность · набор ${i + 1}`, href: `circle.html?s=${x}`, rk: ["hw_last_", `${x}_p1`] }));
    if (kind === "ar") return ["A01", "A02", "A03"].map((x, i) => ({ v: x, t: `Архаичные слова · набор ${i + 1}`, href: `archaic.html?s=${x}`, rk: ["hw_last_", `${x}_p1`] }));
    if (kind === "vc") return L.map((l) => ({ v: l.tag, t: `Карточки · ${short(l)}`, href: `vocab.html?l=${l.tag}`, rk: null }));
    if (kind === "hw") return L.map((l) => ({ v: l.tag, t: short(l) }));
    if (kind === "ct") return window.CTED ? CTED.items() : [];
    return [];
  }
  const short = (l) => { const p = String(l.title || l.tag).split(" · "); return p.length > 2 ? `${p[0].replace("SAT ", "")} · ${p.slice(1).join(" · ")}` : l.title || l.tag; };
  const parts = (tag) => { const l = S.lessons.find((x) => x.tag === tag); return l ? l.parts.map((p) => ({ v: p.id, t: p.title, href: `./?l=${tag}&p=${p.id}`, rk: ["hw_last_", `${tag}_${p.id}`], label: PLAN.label(`${tag}_${p.id}`, "hw", S.lessons) })) : []; };

  function assignHTML() {
    const A = S.assign, its = items(A.kind), P = A.kind === "hw" ? parts(A.item) : [];
    const opts = (list, sel) => list.map((x) => `<option value="${esc(x.v)}"${x.v === sel ? " selected" : ""}>${esc(x.t)}</option>`).join("");
    const n = A.ids.size, t = taskOf(true), quick = [["Завтра", 1], ["Через 3 дня", 3], ["Через неделю", 7]];
    const groupsWith = S.groups.filter((g) => membersOf(g).length), none = membersOf(null);
    const whoList = (g, list) => `<div class="who-g"${gStyle(g)}><span class="who-h">${g ? '<i class="gdot" aria-hidden="true"></i>' : ""}${esc(g ? g.name : "Без группы")}</span>
        <div class="cb-whol">${list.map((u) => `<label class="cb-tick"><input type="checkbox" data-who="${esc(u.id)}" ${A.ids.has(u.id) ? "checked" : ""} ${u.err ? "disabled" : ""}><span>${esc(u.name)}<small>${esc(u.login)}</small></span></label>`).join("")}</div></div>`;
    return `<form class="cb-assign" id="cb-assign">
      <div class="cb-ah"><h2 tabindex="-1">Новое задание</h2><button class="tlink" type="button" id="cb-acancel">Закрыть ✕</button></div>
      <section class="step"><h3><span class="sn">1</span> Кому <small>· выбрано ${n}</small></h3>
        <div class="chips gsel-row">${groupsWith.map((g) => { const ids = membersOf(g).filter((u) => !u.err).map((u) => u.id), on = ids.length && ids.every((x) => A.ids.has(x));
          return `<button class="gsel" type="button" data-gsel="${esc(g.id)}" aria-pressed="${!!on}"${gStyle(g)}><i class="gdot" aria-hidden="true"></i>${esc(g.name)} · ${ids.length}</button>`; }).join("")}
          <button class="chip" type="button" id="cb-all">${n && n === S.users.filter((u) => !u.err).length ? "Снять всех" : "Все ученики"}</button></div>
        ${groupsWith.map((g) => whoList(g, membersOf(g))).join("")}${none.length ? whoList(null, none) : ""}</section>
      <section class="step"><h3><span class="sn">2</span> Что задать</h3>
        <div class="chips kind-row" role="radiogroup" aria-label="Что задать">${KIND.map(([k, t]) => `<button class="chip" type="button" role="radio" data-kind="${k}" aria-checked="${k === A.kind}">${t}</button>`).join("")}</div>
        <div class="cb-grid">${A.kind === "own" ? `<label class="f"><span>Задание</span><input id="cb-own" type="text" maxlength="140" placeholder="Например: выписать 10 слов из урока 3" value="${esc(A.own)}" required></label>
          <label class="f"><span>Ссылка (необязательно)</span><input id="cb-link" type="text" maxlength="300" placeholder="https://… или vocab.html" value="${esc(A.link)}"></label>`
        : its.length ? `<label class="f"><span>${A.kind === "hw" || A.kind === "vc" ? "Урок" : "Что именно"}</span><select id="cb-item">${opts(its, A.item)}</select></label>
          ${A.kind === "hw" ? `<label class="f"><span>Часть тетради</span><select id="cb-part">${opts(P, A.part)}</select></label>` : ""}`
        : A.kind === "ct" ? '<p class="hint f">Готовых тестов пока нет. Создайте тест: кнопка «Мои тесты» вверху.</p>' : '<p class="hint f">Список уроков не загрузился. Обновите страницу или выберите другое задание.</p>'}</div></section>
      <section class="step"><h3><span class="sn">3</span> Срок и комментарий</h3>
        <div class="chips due-row">${quick.map(([l, d]) => { const v = iso(Date.now() + d * DAY); return `<button class="chip" type="button" data-due="${v}" aria-pressed="${A.due === v}">${l}</button>`; }).join("")}<button class="chip" type="button" data-due="" aria-pressed="${!A.due}">Без срока</button></div>
        <div class="cb-grid"><label class="f"><span>Срок</span><input id="cb-due" type="date" value="${esc(A.due)}" min="${iso(Date.now())}"></label>
          <label class="f"><span>Комментарий для ученика (необязательно)</span><input id="cb-note" type="text" maxlength="200" placeholder="Например: обратите внимание на вопросы 5–8" value="${esc(A.note)}"></label></div></section>
      <div class="cb-sum" aria-live="polite">${t && n ? `<b>«${esc(t.t)}»</b> → ${n} ${pl(n, "ученику", "ученикам", "ученикам")}${A.due ? `, до ${esc(dateTxt(A.due))}` : ", без срока"}` : n ? "Выберите задание." : "Выберите, кому задать."}</div>
      <div class="row"><button class="btn" type="submit" id="cb-ago" ${n && t ? "" : "disabled"}>Задать${n > 1 ? ` · ${n} ${pl(n, "ученику", "ученикам", "ученикам")}` : ""} <span class="arr">→</span></button><span class="hint" id="cb-amsg"></span></div></form>`;
  }
  function openAssign(ids, kind, item) {
    const due = iso(Date.now() + 7 * DAY), first = (S.lessons[0] || {}).tag || "";
    S.editG = null; S.imp = null; S.ct = false;
    S.assign = { kind: kind || (S.lessons.length ? "hw" : "mk"), item: item || first, part: "", due, note: "", own: "", link: "", ids: new Set(ids) };
    S.focus = "#cb-assign h2"; fixAssign(); render(); setTimeout(() => { const f = $("cb-assign"); if (f) f.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }, 30);
  }
  function fixAssign() {   // keep item and part valid for the chosen kind
    const A = S.assign, its = items(A.kind);
    if (!its.some((x) => x.v === A.item)) A.item = its.length ? its[0].v : "";
    if (A.kind === "hw") { const P = parts(A.item); if (!P.some((x) => x.v === A.part)) A.part = (P.find((x) => /домаш/i.test(x.t)) || P[0] || {}).v || ""; }
  }
  function taskOf(preview) {
    const A = S.assign, id = preview ? "" : Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 10);
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
    if ($("cb-icancel")) $("cb-icancel").onclick = closeForm;
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
  function profileHead(u, I) {
    const g = groupOf(u), names = Object.keys(I.names), mates = (g ? membersOf(g) : membersOf(null)), k = mates.findIndex((x) => x.id === u.id);
    const prev = k > 0 ? mates[k - 1] : null, next = k >= 0 && k < mates.length - 1 ? mates[k + 1] : null;
    return `<header class="cb-head"${gStyle(g)}>
        <nav class="crumbs" aria-label="Навигация"><button class="tlink" type="button" data-back="1">← ${esc(g ? g.name : "Все ученики")}</button>
          <span class="pn">${prev ? `<button class="tlink" type="button" data-u="${esc(prev.id)}" aria-label="Предыдущий: ${esc(prev.name)}">‹ ${esc(prev.name)}</button>` : ""}${next ? `<button class="tlink" type="button" data-u="${esc(next.id)}" aria-label="Следующий: ${esc(next.name)}">${esc(next.name)} ›</button>` : ""}</span></nav>
        <div class="ph-row"><div class="ph-id">
          <span class="gpill">${g ? `<i class="gdot" aria-hidden="true"></i>${esc(g.name)} · ${esc(KINDS[g.kind])}` : "Без группы"}</span>
          <h1 class="cb-name">${esc(u.name)}</h1>
          <span class="label">[ ${esc(u.login)} · ${esc(COURSES.find((c) => c[0] === I.course)[1])} · ${I.last ? `был(а) ${esc(ago(I.last))}` : "ещё не сдавал(а)"} ]</span></div>
          <div class="ph-act"><button class="btn" type="button" data-new="1">Задать задание <span class="arr">+</span></button>
            <label class="cb-as"><span>Группа</span><select id="cb-grp"><option value="">Без группы</option>${S.groups.map((x) => `<option value="${esc(x.id)}"${g && g.id === x.id ? " selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label></div></div>
        ${names.length > 1 || (names.length && !I.names[u.name]) ? `<label class="cb-as"><span>Результаты под именем</span><select id="cb-nm">${[...new Set([u.name, ...names])].map((x) => `<option${x === u.nm ? " selected" : ""}>${esc(x)}</option>`).join("")}</select></label>` : ""}
        ${u.none ? '<p class="hint">Ученик ещё ничего не сохранил в аккаунте. Задание всё равно можно задать: оно появится, когда ученик войдёт.</p>' : ""}
      </header>`;
  }
  function render() {
    const main = $("cb"); if (!S.loaded) return;
    const u = S.users.find((x) => x.id === S.cur), focusQ = document.activeElement && document.activeElement.id === "cb-q";
    document.body.classList.toggle("cb-has", !!u || !!S.assign || !!S.imp || !!S.editG || S.ct);
    let detail;
    if (S.ct) detail = CTED.html();
    else if (S.imp) detail = importHTML();
    else if (S.assign) detail = assignHTML();
    else if (S.editG) detail = groupHTML();
    else if (!u) detail = overviewHTML();
    else if (u.err) detail = `<div class="cb-empty"><button class="tlink" type="button" data-back="1">← Все ученики</button><h2>${esc(u.name)}</h2><p class="td-sub">${u.err === "key" ? "Копию этого ученика не удалось расшифровать." : esc(why(u.err))}</p></div>`;
    else {
      const I = info(u);
      detail = profileHead(u, I) + `<div class="chips cb-tabs" role="tablist">${[["over", "Обзор"], ["plan", "План"], ["res", `Результаты · ${I.R.length}`], ["tasks", `Задания${I.open ? ` · ${I.open}` : ""}`]].map(([k, t]) => `<button class="chip" role="tab" type="button" data-tab="${k}" aria-selected="${S.tab === k}">${t}</button>`).join("")}</div>
        <div class="cb-body">${S.tab === "plan" ? plan(u, I) : S.tab === "res" ? results(u, I) : S.tab === "tasks" ? tasks(u, I) : over(u, I)}</div>`;
    }
    main.innerHTML = toolbar() + `<section class="cb-detail" aria-live="polite">${detail}</section>`;
    bind(u);
    if (S.ct) CTED.bind(main);
    if (S.focus) { const el = main.querySelector(S.focus); S.focus = ""; if (el) el.focus({ preventScroll: true }); }
    if (focusQ) { const q = $("cb-q"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }
  // close whichever form is open (button «Закрыть ✕» or Escape) and put focus back on the button that opens it
  function closeForm() {
    if (S.ct) { if (CTED.escape()) return true; if (!CTED.leave()) return true; S.ct = false; S.focus = "[data-ct]"; }
    else if (S.assign) { S.assign = null; S.focus = S.cur ? '[data-new="1"]' : '[data-bulk="1"]'; }
    else if (S.editG) { const id = S.editG.id; S.editG = null; S.focus = S.groups.some((g) => g.id === id) ? `[data-gedit="${id}"]` : ".gtab.add"; }
    else if (S.imp) { S.imp = null; S.focus = "[data-imp]"; }
    else return false;
    render(); return true;
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented && (S.assign || S.editG || S.imp || S.ct) && closeForm()) e.preventDefault(); });
  const top = () => window.scrollTo({ top: Math.max(0, ($("cb").getBoundingClientRect().top + scrollY) - 70) });
  const offCt = () => { if (S.ct && !CTED.leave()) return false; S.ct = false; return true; };   // leaving «Мои тесты» asks about unsaved edits
  function bind(u) {
    const main = $("cb"), on = (sel, fn0) => main.querySelectorAll(sel).forEach((el) => (el.onclick = (e) => fn0(el, e)));
    const away = (fn) => (el, e) => { if (offCt()) fn(el, e); };
    $("cb-q").oninput = (e) => { if (!offCt()) { e.target.value = S.q; return; } S.q = e.target.value; S.cur = null; S.assign = null; S.editG = null; render(); };
    on("[data-ct]", () => { if (S.ct) return; S.assign = null; S.imp = null; S.editG = null; S.cur = null; S.ct = true; CTED.open(); S.focus = ".ct h2"; render(); top(); });
    on("[data-g]", away((b) => { S.gview = b.dataset.g; S.cur = null; S.assign = null; S.editG = null; S.imp = null; render(); }));
    on("[data-u]", away((b) => { S.cur = b.dataset.u; S.assign = null; S.editG = null; S.imp = null; S.tab = "over"; render(); top(); }));
    on("[data-back]", away(() => { S.cur = null; render(); top(); }));
    on("[data-bulk]", away(() => openAssign(S.cur ? [S.cur] : S.gview !== "all" ? shown().filter((x) => !x.err).map((x) => x.id) : [])));
    on("[data-bulkg]", away((b) => { const g = S.groups.find((x) => x.id === b.dataset.bulkg); openAssign(membersOf(g).filter((x) => !x.err).map((x) => x.id)); }));
    on("[data-assign1]", away((b) => openAssign([b.dataset.assign1])));
    on("[data-imp]", away(() => { S.editG = null; openImport(); }));
    on("[data-tab]", (b) => { S.tab = b.dataset.tab; render(); });
    on("[data-gnew]", away(() => { S.assign = null; S.imp = null; S.cur = null; S.editG = { id: newId(), name: "", kind: "group", color: Object.keys(GCOL).find((c) => !S.groups.some((g) => g.color === c)) || "blue", members: [] }; S.focus = "#cb-gform h2"; render(); top(); }));
    on("[data-gedit]", away((b) => { const g = S.groups.find((x) => x.id === b.dataset.gedit); if (g) { S.editG = JSON.parse(JSON.stringify(g)); S.cur = null; S.focus = "#cb-gform h2"; render(); top(); } }));
    main.querySelectorAll("[data-place]").forEach((sel) => (sel.onchange = () => { if (!sel.value) return; const st = S.users.find((x) => x.id === sel.dataset.place), g = S.groups.find((x) => x.id === sel.value);
      moveTo(sel.dataset.place, sel.value); render(); saveGroups(`${st.name} → ${g.name}`); }));
    $("cb-reload").onclick = async () => { S.loaded = false; S.users.forEach((x) => (x.nm = "")); await load(); toast("Обновлено"); };
    if ($("cb-nm")) $("cb-nm").onchange = (e) => { u.nm = e.target.value; render(); };
    if ($("cb-grp")) $("cb-grp").onchange = (e) => { const g = S.groups.find((x) => x.id === e.target.value); moveTo(u.id, e.target.value); render(); saveGroups(g ? `${u.name} → ${g.name}` : `${u.name}: без группы`); };
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
      on("[data-deltask]", (b) => {   // no confirm dialog (Nurassyl, 2026-11-12): the task goes at once, «Вернуть» in the message puts it back
        const L0 = (() => { try { return JSON.parse(I.get("tasks") || "[]"); } catch (e) { return []; } })(), orig = L0.find((t) => t.id === b.dataset.deltask); if (!orig) return;
        const rd = (get) => { try { return JSON.parse(get("tasks") || "[]"); } catch (e) { return []; } };
        act(u, (B, set, get) => set("tasks", JSON.stringify(rd(get).filter((t) => t.id !== orig.id))), `Задание «${orig.t}» убрано`,
          () => act(u, (B, set, get) => { const L = rd(get); if (!L.some((t) => t.id === orig.id)) L.push(orig); set("tasks", JSON.stringify(L)); }, "Задание возвращено")); });
    }
    if (S.imp) bindImport();
    const gf = $("cb-gform");
    if (gf) {
      const E = S.editG;
      $("cb-gcancel").onclick = closeForm;
      $("g-name").oninput = (e) => (E.name = e.target.value);
      gf.querySelectorAll("[name=g-kind]").forEach((r) => (r.onchange = () => (E.kind = r.value)));
      gf.querySelectorAll("[name=g-color]").forEach((r) => (r.onchange = () => { E.color = r.value; render(); }));
      gf.querySelectorAll("[data-gm]").forEach((c) => (c.onchange = () => { E.members = E.members.filter((x) => x !== c.dataset.gm); if (c.checked) E.members.push(c.dataset.gm); render(); }));
      gf.onsubmit = (e) => { e.preventDefault(); E.name = E.name.trim() || "Группа";
        const old = S.groups.find((g) => g.id === E.id); if (old) Object.assign(old, { name: E.name, kind: E.kind, color: E.color, members: [] }); else S.groups.push({ id: E.id, name: E.name, kind: E.kind, color: E.color, members: [] });
        E.members.forEach((uid) => moveTo(uid, E.id)); S.gview = E.id; S.editG = null; render(); saveGroups(`Группа «${E.name}» сохранена`); };
      if ($("g-del")) $("g-del").onclick = () => { if (!confirm(`Удалить группу «${E.name}»? Ученики останутся, но без группы.`)) return; S.groups = S.groups.filter((g) => g.id !== E.id); S.gview = "all"; S.editG = null; render(); saveGroups(`Группа «${E.name}» удалена`); };
    }
    const f = $("cb-assign"); if (!f) return;
    const A = S.assign, keep = (fn) => (e) => { fn(e.target.value); fixAssign(); render(); };
    on("[data-kind]", (b) => { A.kind = b.dataset.kind; fixAssign(); render(); });
    on("[data-due]", (b) => { A.due = b.dataset.due; render(); });
    on("[data-gsel]", (b) => { const ids = membersOf(S.groups.find((g) => g.id === b.dataset.gsel)).filter((x) => !x.err).map((x) => x.id), all = ids.every((x) => A.ids.has(x)); ids.forEach((x) => (all ? A.ids.delete(x) : A.ids.add(x))); render(); });
    if ($("cb-item")) $("cb-item").onchange = keep((v) => (A.item = v));
    if ($("cb-part")) $("cb-part").onchange = keep((v) => (A.part = v));
    $("cb-due").onchange = keep((v) => (A.due = v));
    $("cb-note").oninput = (e) => (A.note = e.target.value);
    if ($("cb-own")) $("cb-own").oninput = (e) => { A.own = e.target.value; const b = $("cb-ago"); if (b) b.disabled = !(A.ids.size && A.own.trim()); };
    if ($("cb-link")) $("cb-link").oninput = (e) => (A.link = e.target.value);
    main.querySelectorAll("[data-who]").forEach((c) => (c.onchange = () => { c.checked ? A.ids.add(c.dataset.who) : A.ids.delete(c.dataset.who); render(); }));
    $("cb-all").onclick = () => { const ok = S.users.filter((x) => !x.err); if (A.ids.size === ok.length) A.ids.clear(); else ok.forEach((x) => A.ids.add(x.id)); render(); };
    $("cb-acancel").onclick = closeForm;
    f.onsubmit = (e) => { e.preventDefault(); submitAssign(); };
  }

  // «Мои тесты» (cted.js): what the editor needs from the cabinet
  if (window.CTED) CTED.init({ toast, render, users: () => S.users, focus: (sel) => (S.focus = sel),
    close: () => { S.ct = false; S.focus = "[data-ct]"; render(); },
    give: (id) => openAssign(S.gview !== "all" ? shown().filter((x) => !x.err).map((x) => x.id) : [], "ct", id),
    copy: (u) => { if (!u.B || u.err) return null; const I = info(u); return { nm: u.nm, get: I.get, meta: I.meta, tasks: I.T }; } });
  window.addEventListener("DOMContentLoaded", () => {
    if (!window.SITE) return;
    SITE.ready.then(async () => {
      try { const d = await SITE.json("lessons"); S.lessons = (d.lessons || d).filter((l) => l && l.tag && Array.isArray(l.parts)); } catch (e) { S.lessons = []; }
      load();
    });
  });
})();
