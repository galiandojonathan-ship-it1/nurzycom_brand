// Teacher's cabinet → «Уроки» (2026-11-16): what the teacher marked in lesson mode (lesson.js), read from the lesson
// account's synced copy (keys ls_s_<id> = one lesson, ls_r_<id> = its review written by the /lesson-review skill).
// A lesson shows: the parts opened with the class and the time on each (taken from the timeline, nothing is typed in),
// hard questions with the reason, the class vote, the «Сработало» notes and the question itself, the words the class did
// not know with their sentences, and the time per question. «Повторяется» collects words and questions marked in
// more than one lesson. Read-only except «Удалить урок».
(function () {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const WHY = { text: "не поняли текст", rule: "не знали правило", trap: "попались в ловушку", slow: "слишком долго", bug: "ошибка в вопросе" };
  const VERDICT = { gloss: "подчеркнуть на сайте", deck: "в колоду группы", skip: "не брать" };
  const LIMIT = 70;   // minutes: every lesson is planned to fit
  let api = null; const L = { id: null, bundles: {}, mocks: null };
  const pl = (n, a, b, c) => { const m = n % 100, d = n % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c; };
  const dur = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return s < 60 ? `${s} с` : `${Math.floor(s / 60)} мин${s % 60 ? ` ${s % 60} с` : ""}`; };
  const day = (t) => new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) + ", " + new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const secOf = (q) => String(q).replace(/\.\d+$/, ""), numOf = (q) => { const m = /\.(\d+)$/.exec(String(q)); return m ? m[1] : ""; };

  // every lesson of every lesson account, newest first, with its numbers worked out once
  function sessions() {
    const out = [];
    for (const u of api.accounts()) {
      if (!u.B) continue;
      for (const [k, r] of Object.entries(u.B)) {
        if (k.indexOf("ls_s_") !== 0 || !r || r.v == null) continue;
        let s; try { s = JSON.parse(r.v); } catch (e) { continue; }
        if (!s || !Array.isArray(s.ev)) continue;
        let rv = null; try { const x = u.B["ls_r_" + s.id]; rv = x && x.v ? JSON.parse(x.v) : null; } catch (e) { rv = null; }
        out.push(digest(s, rv, u));
      }
    }
    return out.sort((a, b) => b.s.t0 - a.s.t0);
  }
  // lessons recorded before the part title was saved with each event: rebuild it from the lesson list
  function oldTitle(q) {
    const sec = secOf(q), h = /^([A-Z]+\d*[A-Z]?)\.([a-z0-9]+)$/i.exec(sec), les = h && api.lessons().find((x) => x.tag === h[1]), part = les && les.parts.find((x) => x.id === h[2]);
    return part ? `${les.title || les.tag} · ${part.title}` : sec;
  }
  function digest(s, rv, u) {
    const end = s.t1 || (s.ev.length ? s.ev[s.ev.length - 1].t : s.t0), at = s.ev.filter((e) => e.k === "at");
    const title = {}, timeQ = {}, parts = [];   // section → title; question → ms on screen; parts in order
    at.forEach((e, i) => {
      const ms = Math.max(0, (i + 1 < at.length ? at[i + 1].t : end) - e.t), ti = e.ti || (e.q ? oldTitle(e.q) : PAGE(e.p));
      if (e.q) { title[secOf(e.q)] = ti; timeQ[e.q] = (timeQ[e.q] || 0) + ms; }
      let p = parts.find((x) => x.ti === ti); if (!p) parts.push((p = { ti, ms: 0, work: !!e.q, qs: new Set() }));
      p.ms += ms; if (e.q) p.qs.add(e.q);
    });
    const label = (q) => (q ? `${title[secOf(q)] || secOf(q)}${numOf(q) ? ` · вопрос ${numOf(q)}` : ""}` : "");
    const marks = (k) => s.ev.filter((e) => e.k === k), Q = {};
    const qOf = (q) => (Q[q] = Q[q] || { q, why: [], notes: [], vote: "", words: [] });
    marks("flag").forEach((e) => { if (e.q) qOf(e.q).why.push(e.why); });
    marks("vote").forEach((e) => { if (e.q) qOf(e.q).vote = e.c; });
    marks("note").forEach((e) => { if (e.q) qOf(e.q).notes.push(e.text); });
    const work = parts.filter((p) => p.work);
    return { s, rv, u, end, len: end - s.t0, parts, work, label, timeQ, words: marks("word"), notes: marks("note"), flags: marks("flag"),
      hard: Object.values(Q).filter((x) => x.why.length || x.vote || x.notes.length), name: work.length ? work.map((p) => p.ti).join(" → ") : s.lesson || "Разделы не открывались" };
  }

  function html() {
    const all = sessions(), one = L.id && all.find((d) => d.s.id === L.id);
    const head = `<div class="cb-ah"><div><span class="label">Режим урока</span><h2 tabindex="-1">${one ? esc(one.s.group) : "Уроки"}</h2></div><button class="tlink" type="button" data-lsclose="1">Закрыть ✕</button></div>`;
    if (!api.accounts().length) return `<div class="lsn">${head}<p class="td-sub">Аккаунта для уроков пока нет. Создайте его на странице преподавателя: «Добавить ученика», имя «Урок», логин <b>lesson</b>. Войдите под ним на уроке, и внизу сайта появится панель для отметок.</p></div>`;
    if (one) return `<div class="lsn">${head}${oneHTML(one)}</div>`;
    if (!all.length) return `<div class="lsn">${head}<p class="td-sub">Уроков пока нет. Войдите на сайт под логином <b>lesson</b>, нажмите «Начать урок» и отмечайте слова и трудные вопросы. После «Завершить» урок появится здесь.</p></div>`;
    return `<div class="lsn">${head}${repeats(all)}
      <h3 class="lsn-h">Все уроки · ${all.length}</h3>
      <div class="lsn-list">${all.map((d) => `<button type="button" class="lsn-card" data-lsid="${esc(d.s.id)}">
        <span class="lsn-d">${esc(day(d.s.t0))}${d.s.t1 ? "" : " · идёт сейчас"}</span>
        <b>${esc(d.s.group)}</b><span class="lsn-n">${esc(d.name)}</span>
        <span class="lsn-tags"><i>${esc(dur(d.len))}</i><i>слов: ${d.words.length}</i><i>трудных вопросов: ${d.hard.filter((x) => x.why.length).length}</i>${d.notes.length ? `<i>объяснений: ${d.notes.length}</i>` : ""}${d.rv ? '<i class="ok">есть разбор</i>' : ""}</span></button>`).join("")}</div></div>`;
  }
  // words and questions marked in more than one lesson: the strongest signal in the whole log
  function repeats(all) {
    const W = {}, Q = {};
    for (const d of all) {
      new Set(d.words.map((e) => e.w.toLowerCase())).forEach((w) => (W[w] = W[w] || []).push(d));
      d.hard.filter((x) => x.why.length).forEach((x) => (Q[x.q] = Q[x.q] || []).push({ d, x }));
    }
    const w = Object.entries(W).filter(([, a]) => a.length > 1).sort((a, b) => b[1].length - a[1].length), q = Object.entries(Q).filter(([, a]) => a.length > 1).sort((a, b) => b[1].length - a[1].length);
    if (!w.length && !q.length) return "";
    return `<div class="lsn-rep"><h3 class="lsn-h">Повторяется из урока в урок</h3>
      ${w.length ? `<p><span class="label">Слова</span> ${w.map(([k, a]) => `<span class="lsn-w">${esc(k)} <small>${a.length} ${pl(a.length, "урок", "урока", "уроков")}</small></span>`).join(" ")}</p>` : ""}
      ${q.length ? `<p><span class="label">Вопросы</span></p><ul>${q.map(([k, a]) => `<li>${esc(a[0].d.label(k))} <small>отмечен в ${a.length} ${pl(a.length, "уроке", "уроках", "уроках")}: ${esc([...new Set(a.flatMap((y) => y.x.why))].map((v) => WHY[v] || v).join(", "))}</small></li>`).join("")}</ul>` : ""}</div>`;
  }
  function oneHTML(d) {
    const s = d.s, min = d.len / 60000, rv = d.rv || {}, rw = {}; (rv.words || []).forEach((x) => (rw[String(x.w).toLowerCase()] = x));
    const maxP = Math.max(1, ...d.parts.map((p) => p.ms)), tq = Object.entries(d.timeQ).sort((a, b) => b[1] - a[1]), maxQ = Math.max(1, ...tq.map((x) => x[1]));
    const hard = d.hard.slice().sort((a, b) => b.why.length - a.why.length || (d.timeQ[b.q] || 0) - (d.timeQ[a.q] || 0));
    return `<p class="crumbs"><button class="tlink" type="button" data-lsback="1">← Все уроки</button></p>
      <p class="td-sub">${esc(day(s.t0))}${s.t1 ? "" : " · урок ещё идёт"} · ${esc(dur(d.len))}${min > LIMIT ? ` · <b class="lsn-over">на ${Math.round(min - LIMIT)} мин дольше ${LIMIT} минут</b>` : ""}</p>
      <div class="lsn-kpi"><div><b>${d.work.length}</b><span>${pl(d.work.length, "раздел", "раздела", "разделов")} с классом</span></div><div><b>${d.words.length}</b><span>${pl(d.words.length, "слово", "слова", "слов")}</span></div><div><b>${hard.filter((x) => x.why.length).length}</b><span>трудных вопросов</span></div><div><b>${d.notes.length}</b><span>объяснений «Сработало»</span></div></div>
      ${rv.summary ? `<div class="lsn-rv"><span class="label">Разбор Claude</span><p>${esc(rv.summary)}</p>${rv.pacing ? `<p>${esc(rv.pacing)}</p>` : ""}</div>` : ""}

      <h3 class="lsn-h">Что открывали с классом</h3>
      ${d.parts.length ? `<div class="lsn-bars">${d.parts.filter((p) => p.work || p.ms >= 20000).map((p) => `<div class="lsn-bar${p.work ? "" : " dim"}"><span class="t">${esc(p.ti)}${p.work ? ` <small>${p.qs.size} ${pl(p.qs.size, "вопрос", "вопроса", "вопросов")}</small>` : ""}</span><span class="b"><i style="width:${Math.max(2, Math.round((100 * p.ms) / maxP))}%"></i></span><span class="v">${esc(dur(p.ms))}</span></div>`).join("")}</div>` : '<p class="td-sub">В этом уроке страницы не записались.</p>'}

      <h3 class="lsn-h">Трудные вопросы и отметки</h3>
      ${hard.length ? hard.map((x) => { const a = (rv.questions || {})[x.q];
        return `<details class="lsn-q" data-lsq="${esc(x.q)}"><summary><span class="t">${esc(d.label(x.q))}</span>
          <span class="lsn-tags">${[...new Set(x.why)].map((v) => `<i class="red">${esc(WHY[v] || v)}</i>`).join("")}${x.vote ? `<i>класс выбрал ${esc(x.vote)}</i>` : ""}${d.timeQ[x.q] ? `<i>${esc(dur(d.timeQ[x.q]))} на экране</i>` : ""}</span></summary>
          ${x.notes.map((n) => `<p class="lsn-note"><span class="label">Сработало</span> ${esc(n)}</p>`).join("")}
          ${a ? `<div class="lsn-rv"><span class="label">Разбор Claude</span><p>${esc(a.text || "")}</p>${a.hint ? `<p><b>Подсказка для сайта:</b> ${esc(a.hint)}</p>` : ""}</div>` : ""}
          <div class="lsn-qb" data-vote="${esc(x.vote)}"><p class="td-sub">Загружаю вопрос…</p></div></details>`; }).join("") : '<p class="td-sub">Вопросы в этом уроке не отмечались.</p>'}
      ${d.notes.filter((e) => !e.q).map((e) => `<p class="lsn-note"><span class="label">Сработало · ${esc(e.ti || "")}</span> ${esc(e.text)}</p>`).join("")}

      <h3 class="lsn-h">Слова, которых класс не знал</h3>
      ${d.words.length ? `<div class="tw"><table class="lsn-t"><tr><th>Слово</th><th>Где встретилось</th><th>Разбор</th></tr>${d.words.map((e) => { const r = rw[e.w.toLowerCase()];
        const i = e.ctx.toLowerCase().indexOf(e.w.toLowerCase()), ctx = i < 0 ? esc(e.ctx) : esc(e.ctx.slice(0, i)) + "<mark>" + esc(e.ctx.slice(i, i + e.w.length)) + "</mark>" + esc(e.ctx.slice(i + e.w.length));
        return `<tr><td><b>${esc(e.w)}</b></td><td><span class="lsn-ctx" lang="en">${ctx}</span><small>${esc(d.label(e.q) || PAGE(e.p))}${e.part === "option" ? " · в варианте ответа" : ""}</small></td>
          <td>${r ? `${esc(r.en || "")}${r.ru ? `<br><span lang="ru">${esc([].concat(r.ru).join(", "))}</span>` : ""}${r.verdict ? `<small>${esc(VERDICT[r.verdict] || r.verdict)}</small>` : ""}` : '<small>ждёт разбора</small>'}</td></tr>`; }).join("")}</table></div>` : '<p class="td-sub">Слова в этом уроке не отмечались.</p>'}

      <h3 class="lsn-h">Время на вопрос</h3>
      ${tq.length ? `<div class="lsn-bars">${tq.slice(0, 12).map(([q, ms]) => `<div class="lsn-bar"><span class="t">${esc(d.label(q))}</span><span class="b"><i style="width:${Math.max(2, Math.round((100 * ms) / maxQ))}%"></i></span><span class="v">${esc(dur(ms))}</span></div>`).join("")}</div>${tq.length > 12 ? `<p class="td-sub">Показаны 12 самых долгих из ${tq.length}.</p>` : ""}` : '<p class="td-sub">Вопросы в этом уроке не открывались.</p>'}
      ${s.t1 ? `<p class="lsn-del"><button class="tlink" type="button" data-lsdel="${esc(s.id)}">Удалить урок</button></p>` : ""}`;
  }
  const PAGE = (p) => ({ index: "Домашние задания", plan: "План курса", vocab: "Словарь", reading: "Тексты", practice: "Сложные вопросы", mock: "Пробные тесты", useful: "Полезное", archaic: "Архаичные слова", desmos: "Desmos", circle: "Единичная окружность", mytest: "Тесты преподавателя" }[p] || p || "");

  // the question itself (text, options, key, explanation), decrypted in this browser like everywhere else in the cabinet
  async function bundle(path) {
    if (!L.bundles[path]) L.bundles[path] = fetch(path, { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("q " + r.status); return r.arrayBuffer(); }).then((b) => SITE.open(b)).then((u) => JSON.parse(new TextDecoder().decode(u)));
    return L.bundles[path];
  }
  async function item(q) {
    const m = /^((?:PT|PR)\d+)\.([a-z]+)\.(m\d[a-z]?)\.(\d+)$/.exec(q);
    if (m) {
      if (!L.mocks) L.mocks = await SITE.json("mocks");
      const mock = L.mocks.mocks.find((x) => x.id === m[1]), sec = mock && mock.sections.find((x) => x.k === m[2]); if (!sec) return null;
      return ((await bundle(sec.b)).mods[m[3]] || []).find((x) => x.n === +m[4]) || null;
    }
    const h = /^([A-Z]+\d*[A-Z]?)\.([a-z0-9]+)\.(\d+)$/i.exec(q); if (!h) return null;
    const les = api.lessons().find((x) => x.tag === h[1]), part = les && les.parts.find((x) => x.id === h[2]); if (!part || !part.b) return null;
    const b = await bundle(part.b); return (Array.isArray(b) ? b : []).find((x) => x.n === +h[3]) || null;
  }
  async function showQ(box, q) {
    if (box.dataset.done) return; box.dataset.done = "1";
    let it = null; try { it = await item(q); } catch (e) { it = null; }
    if (!it) { box.innerHTML = '<p class="td-sub">Текст этого вопроса здесь не открывается (текст, сложный вопрос или «Мой тест»). Откройте его на сайте.</p>'; return; }
    const vote = box.dataset.vote, key = it.t === "mc" || (it.opts && it.opts.length) ? it.ans : "";
    const opts = it.opts && it.opts.length ? it.opts.map((o, k) => { const c = "ABCD"[k]; return `<div class="lsn-o${c === key ? " right" : ""}${c === vote && c !== key ? " voted" : ""}"><span class="lt">${c}</span><span class="qhtml">${o}</span>${c === key ? '<small>верный</small>' : c === vote ? '<small>выбрал класс</small>' : ""}</div>`; }).join("")
      : it.ans ? `<p class="td-sub">Ответ: ${esc([].concat(it.acc || it.ans).join(", "))}</p>` : "";
    const rat = it.rat || "";
    box.innerHTML = `${it.stim ? `<div class="qhtml lsn-stim">${it.stim}</div>` : ""}<div class="qhtml"><b>${it.stem || ""}</b></div>${opts}${rat ? `<div class="sv-expl"><span class="label">Объяснение</span><div class="qhtml">${rat}</div></div>` : ""}`;
  }

  function bind(main) {
    const on = (sel, fn) => main.querySelectorAll(sel).forEach((el) => (el.onclick = (e) => fn(el, e)));
    on("[data-lsclose]", () => api.close());
    on("[data-lsid]", (b) => { L.id = b.dataset.lsid; api.focus(".lsn h2"); api.render(); window.scrollTo({ top: 0 }); });
    on("[data-lsback]", () => { L.id = null; api.focus(".lsn h2"); api.render(); });
    main.querySelectorAll("details[data-lsq]").forEach((d) => d.addEventListener("toggle", () => { if (d.open) showQ(d.querySelector(".lsn-qb"), d.dataset.lsq); }));
    on("[data-lsdel]", async (b) => {
      const d = sessions().find((x) => x.s.id === b.dataset.lsdel); if (!d || !confirm("Удалить этот урок со всеми отметками? Вернуть его будет нельзя.")) return;
      try { await api.change(d.u, (B, set) => { set("ls_s_" + d.s.id, null); if (B["ls_r_" + d.s.id]) set("ls_r_" + d.s.id, null); }); L.id = null; api.toast("Урок удалён."); }
      catch (e) { api.toast(e.message || "Не удалось удалить урок.", true); }
      api.render();
    });
  }
  function escape() { if (L.id) { L.id = null; api.render(); return true; } return false; }
  window.CBL = { init: (a) => (api = a), html, bind, escape, open: () => { L.id = null; }, count: () => (api ? sessions().length : 0) };
})();
