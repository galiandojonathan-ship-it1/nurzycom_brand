/* Step 4 · Progress. Measurable growth only, never a score prediction:
   the cadence grid, the diagnostic and block check-ins compared skill by skill, first-attempt accuracy by skill from homework,
   a retry of every missed question after office hours, and writing and speaking in numbers. */
(function () {
  "use strict";
  var NZ = window.NZ, el = NZ.el, CAD = window.CADENCE, C = window.COURSE;
  var root = document.getElementById("progress");
  var live = C.lessons.filter(function (l) { return l.status === "live"; });
  var pct = function (a, b) { return b ? Math.round(100 * a / b) : null; };
  var SK = CAD.skills;

  root.appendChild(el("header", { class: "wrap lesson-head" }, [
    el("span", { class: "label", text: "Шаг 4 · Прогресс" }),
    el("h1", { lang: "en" }, [el("span", { class: "ul", text: "Your progress, in numbers" })]),
    el("p", { class: "ru", text: "Здесь только то, что можно посчитать: навыки по первой попытке, рост от диагностики к check-in, ошибки, исправленные после office hours, письмо и речь. Это не прогноз балла: реалистичный диапазон даёт преподаватель после диагностики. Данные хранятся только в этом браузере." })
  ]));
  var main = el("div", { class: "wrap" }); root.appendChild(main);

  /* 1. cadence grid */
  var tb = el("tbody");
  live.forEach(function (l) {
    var cd = NZ.cadence(l.id);
    var cell = function (ok, href, t) { return el("td", { class: ok ? "ok" : "" }, [el("a", { href: href, text: ok ? "✓" : t })]); };
    tb.appendChild(el("tr", { id: l.id }, [el("th", { scope: "row" }, [el("span", { class: "label", text: l.id }), " ", el("span", { lang: "en", text: l.title })]),
      cell(cd.slides, "slides.html?id=" + l.id, "открыть"), cell(cd.homework, "lesson.html?id=" + l.id, cd.answered ? cd.answered + "/" + cd.total : "начать"),
      cell(cd.office, "office.html?id=" + l.id, "подготовить"), cell(cd.progress, "#retry-" + l.id, cd.missed.length ? "исправить" : "—")]));
  });
  main.appendChild(el("section", { class: "part", id: "grid" }, [el("span", { class: "label", text: "01 · Four steps, every lesson" }), el("h2", { text: "Where you are" }),
    el("p", { class: "ru", text: "Каждый урок проходит четыре шага. Шаг 4 закрывается, когда ты заново решил(а) все вопросы, где ошибся(лась)." }),
    el("div", { class: "tw" }, [el("table", { class: "grid4" }, [el("thead", {}, [el("tr", {}, [el("th", { scope: "col", text: "Урок" })].concat(CAD.steps.map(function (s) { return el("th", { scope: "col", text: s.n + " · " + s.ru }); })))]), tb])])]));

  /* 2. check-ins */
  function ck(cid) {
    var st = NZ.lessonState(cid), its = NZ.items(cid), by = {};
    its.forEach(function (x) { var a = st.ans[x.qid]; by[x.skill] = by[x.skill] || { r: 0, n: 0, t: 0 }; by[x.skill].t += 1; if (a !== undefined) { by[x.skill].n += 1; if (NZ.ok(x.q, a)) by[x.skill].r += 1; } });
    var n = its.filter(function (x) { return st.ans[x.qid] !== undefined; }).length;
    var r = its.filter(function (x) { return NZ.ok(x.q, st.ans[x.qid]); }).length;
    return { by: by, n: n, r: r, t: its.length, done: its.length && n === its.length };
  }
  var cl = el("div", { class: "grid g4" });
  CAD.checkins.forEach(function (c) {
    var s = c.status === "live" ? ck(c.id) : null;
    cl.appendChild(el("div", {}, [el("span", { class: "label", text: c.ru }), el("h3", { lang: "en", text: c.title }),
      s ? el("span", { class: "num", text: s.done ? s.r + "/" + s.t : "—" }) : el("span", { class: "pill", text: "В плане" }),
      s ? el("a", { class: "btn" + (s.done ? " ghost" : ""), href: "lesson.html?id=" + c.id, text: s.done ? "Разбор" : s.n ? "Продолжить" : "Пройти" }) : null]));
  });
  var d0 = ck("D0"), k1 = ck("K1");
  var cmp = el("tbody");
  ["WIC", "BND", "FSS", "TRN", "R-TFNG"].forEach(function (k) {
    var a = d0.by[k] || { r: 0, t: 0, n: 0 }, b = k1.by[k] || { r: 0, t: 0, n: 0 };
    var diff = d0.done && k1.done ? b.r - a.r : null;
    cmp.appendChild(el("tr", {}, [el("th", { scope: "row", lang: "en", text: SK[k] }),
      el("td", { text: d0.done ? a.r + " / " + a.t : "—" }), el("td", { text: k1.done ? b.r + " / " + b.t : "—" }),
      el("td", { class: diff > 0 ? "up" : diff < 0 ? "down" : "", text: diff === null ? "—" : diff > 0 ? "+" + diff : String(diff) })]));
  });
  main.appendChild(el("section", { class: "part", id: "checkins" }, [el("span", { class: "label", text: "02 · Check-ins" }), el("h2", { text: "Start, then every block" }),
    el("p", { class: "ru", text: "Диагностика и check-in A построены по одной схеме: те же навыки, по два-три вопроса на навык, новые тексты. Разница по каждому навыку и есть рост за блок. Вопросов мало, поэтому разница в один вопрос — сигнал, а не приговор." }),
    cl,
    el("div", { class: "tw", style: "margin-top:22px" }, [el("table", {}, [el("caption", { class: "sr-only", text: "Диагностика и check-in A по навыкам" }),
      el("thead", {}, [el("tr", {}, [el("th", { scope: "col", text: "Навык" }), el("th", { scope: "col", text: "Диагностика" }), el("th", { scope: "col", text: "Check-in A" }), el("th", { scope: "col", text: "Рост" })])]), cmp])])]));

  /* 3. skills from homework */
  var agg = {};
  live.forEach(function (l) {
    var st = NZ.lessonState(l.id), rt = NZ.store.get("nz_exp_retry_" + l.id) || {};
    NZ.items(l.id).forEach(function (x) {
      var a = st.ans[x.qid]; if (a === undefined) return;
      var g = agg[x.skill] = agg[x.skill] || { n: 0, r: 0, miss: 0, fixed: 0 };
      g.n += 1; if (NZ.ok(x.q, a)) g.r += 1; else { g.miss += 1; if (NZ.ok(x.q, rt[x.qid])) g.fixed += 1; }
    });
  });
  var sk = el("tbody");
  Object.keys(SK).forEach(function (k) {
    var g = agg[k]; if (!g) return;
    var p = pct(g.r, g.n);
    sk.appendChild(el("tr", {}, [el("th", { scope: "row", lang: "en", text: SK[k] }), el("td", { text: g.r + " / " + g.n }),
      el("td", {}, [el("span", { class: "bar", role: "img", "aria-label": p + "%" }, [el("i", { style: "width:" + p + "%" })]), " " + p + "%"]),
      el("td", { text: g.miss ? g.fixed + " / " + g.miss : "—" })]));
  });
  main.appendChild(el("section", { class: "part", id: "skills" }, [el("span", { class: "label", text: "03 · Skills from homework" }), el("h2", { text: "First attempt, by skill" }),
    el("p", { class: "ru", text: "Считается только первая попытка в домашнем задании. Последний столбец: сколько ошибок ты исправил(а) при повторе после office hours." }),
    sk.children.length ? el("div", { class: "tw" }, [el("table", {}, [el("thead", {}, [el("tr", {}, [el("th", { scope: "col", text: "Навык" }), el("th", { scope: "col", text: "Верно" }), el("th", { scope: "col", text: "Доля" }), el("th", { scope: "col", text: "Исправлено при повторе" })])]), sk])])
      : el("p", { class: "small", text: "Пока пусто: сделай домашнее задание хотя бы одного урока." })]));

  /* 4. retry */
  var sec4 = el("section", { class: "part", id: "retry" }, [el("span", { class: "label", text: "04 · Retry after office hours" }), el("h2", { text: "Fix what you missed" }),
    el("p", { class: "ru", text: "После разбора на office hours реши заново вопросы, где ошибся(лась). Первая попытка не меняется: повтор считается отдельно и закрывает шаг 4." })]);
  var any = false;
  var TF = [["T", "TRUE"], ["F", "FALSE"], ["NG", "NOT GIVEN"]];
  live.forEach(function (l) {
    var cd = NZ.cadence(l.id); if (!cd.missed.length) return;
    any = true;
    var box = el("div", { class: "card", id: "retry-" + l.id }, [el("span", { class: "label", text: l.id + " · " + cd.missed.length + " to retry" }), el("h3", { lang: "en", text: l.title })]);
    cd.missed.forEach(function (x) {
      var q = x.q, rt = NZ.store.get("nz_exp_retry_" + l.id) || {};
      var qb = el("div", { class: "q", lang: "en" });
      if (q.text) qb.appendChild(el("p", { class: "txt", text: q.text }));
      qb.appendChild(el("p", { class: "stem", text: q.stem }));
      if (x.part === "ielts" || x.part === "listen") qb.appendChild(el("p", { class: "small", lang: "ru" }, ["Текст к вопросу: ", el("a", { href: "lesson.html?id=" + l.id + "#" + x.part, text: "открыть в уроке" })]));
      var opts = el("div", { class: "opts" + (q.kind === "tfng" ? " tf" : "") }), exp = el("p", { class: "exp", lang: "ru", hidden: "" });
      var list = q.kind === "tfng" ? TF.map(function (t) { return { v: t[0], t: t[1] }; })
        : q.kind === "match" ? (x.heads || []).map(function (h, k) { return { v: k, t: NZ.ROMAN[k] + " · " + h }; })
        : q.kind === "gap" ? [] : q.opts.map(function (o, k) { return { v: k, t: "ABCD"[k] + ") " + o }; });
      var btns = [];
      var show = function (v) {
        btns.forEach(function (b) { b.n.setAttribute("aria-disabled", "true"); if (b.v === v) b.n.classList.add(NZ.ok(q, v) ? "right" : "wrong"); });
        if (gin) { gin.value = v; gin.disabled = true; gin.classList.add(NZ.ok(q, v) ? "right" : "wrong"); }
        exp.hidden = false; exp.textContent = NZ.ok(q, v) ? "Исправлено. " + q.ru : "Пока неверно. Вернись к разбору на office hours.";
      };
      list.forEach(function (o) {
        var b = el("button", { class: "opt", type: "button", text: o.t });
        b.addEventListener("click", function () {
          var r = NZ.store.get("nz_exp_retry_" + l.id) || {};
          if (r[x.qid] !== undefined) return;
          r[x.qid] = o.v; NZ.store.set("nz_exp_retry_" + l.id, r); show(o.v);
        });
        btns.push({ n: b, v: o.v }); opts.appendChild(b);
      });
      var gin = null;
      if (q.kind === "gap") {
        gin = el("input", { type: "text", class: "gap-in", "aria-label": "Ответ", autocomplete: "off" });
        var save1 = function () { var r = NZ.store.get("nz_exp_retry_" + l.id) || {}; if (r[x.qid] !== undefined || !gin.value.trim()) return; r[x.qid] = gin.value.trim(); NZ.store.set("nz_exp_retry_" + l.id, r); show(r[x.qid]); };
        gin.addEventListener("keydown", function (e) { if (e.key === "Enter") save1(); });
        opts.appendChild(gin); opts.appendChild(el("button", { class: "btn ghost", type: "button", text: "Ответить", onclick: save1 }));
      }
      qb.appendChild(opts); qb.appendChild(exp);
      if (rt[x.qid] !== undefined) show(rt[x.qid]);
      box.appendChild(qb);
    });
    sec4.appendChild(box);
  });
  if (!any) sec4.appendChild(el("p", { class: "small", text: "Повторять нечего: ошибок в сделанных уроках нет, или домашние задания ещё не сделаны." }));
  main.appendChild(sec4);

  /* 5. writing and speaking */
  var wt = el("tbody");
  live.forEach(function (l) {
    var w = NZ.writing(l.id), st = NZ.lessonState(l.id), oh = NZ.store.get("nz_exp_oh_" + l.id) || {};
    wt.appendChild(el("tr", {}, [el("th", { scope: "row", text: l.id }), el("td", { text: w ? String(w.words) : "—" }),
      el("td", { lang: "en", text: w ? (w.links.join(", ") || "—") : "—" }), el("td", { lang: "en", text: w ? (w.own.join(", ") || "—") : "—" }),
      el("td", { text: oh.peerScore ? oh.peerScore[0] + " / " + oh.peerScore[1] : "—" }),
      el("td", { text: st.done && st.done.speak ? "✓" : "—" }), el("td", { text: oh.attended ? "✓" : "—" })]));
  });
  main.appendChild(el("section", { class: "part", id: "output" }, [el("span", { class: "label", text: "05 · Writing and speaking" }), el("h2", { text: "Your own English, counted" }),
    el("p", { class: "ru", text: "Письмо и речь не проверяются автоматически, поэтому здесь считается то, что можно посчитать честно: длина, связки, слова урока в твоём тексте, точность взаимной проверки и сделанная практика. Оценку по критериям IELTS даёт преподаватель на office hours." }),
    el("div", { class: "tw" }, [el("table", {}, [el("thead", {}, [el("tr", {}, ["Урок", "Слов", "Связки", "Слова урока", "Peer review", "Speaking дома", "Office hours"].map(function (t) { return el("th", { scope: "col", text: t }); }))]), wt])])]));

  /* at a glance: three numbers first, details folded below */
  var allDone = live.filter(function (l) { var c = NZ.cadence(l.id); return c.slides && c.homework && c.office && c.progress; }).length;
  var totN = 0, totR = 0, totMiss = 0, totFix = 0;
  Object.keys(agg).forEach(function (k) { totN += agg[k].n; totR += agg[k].r; totMiss += agg[k].miss; totFix += agg[k].fixed; });
  var glance = el("section", { class: "part glance" }, [el("div", { class: "grid g3" }, [
    el("div", {}, [el("span", { class: "num", text: allDone + " / " + live.length }), el("p", { class: "small", text: "уроков прошли все четыре шага" })]),
    el("div", {}, [el("span", { class: "num", text: totN ? pct(totR, totN) + "%" : "—" }), el("p", { class: "small", text: "верно с первой попытки в домашних заданиях" })]),
    el("div", {}, [el("span", { class: "num", text: totMiss ? totFix + " / " + totMiss : "—" }), el("p", { class: "small", text: "ошибок исправлено после office hours" })])
  ])]);
  main.insertBefore(glance, main.firstChild);
  var open = (location.hash || "").slice(1);
  [["grid", "по урокам"], ["checkins", d0.done ? "диагностика " + d0.r + "/" + d0.t : "начни с диагностики"], ["skills", Object.keys(agg).length + " навыков"], ["retry", totMiss - totFix > 0 ? (totMiss - totFix) + " осталось" : "нечего исправлять"], ["output", "письмо и речь"]].forEach(function (x, i) {
    var sec = document.getElementById(x[0]);
    var want = open && (open === x[0] || (x[0] === "retry" && /^retry-/.test(open)) || (x[0] === "grid" && /^C\d\d$/.test(open)));
    if (sec) NZ.fold(sec, want || (!open && i === 0), x[1]);
  });
  if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
})();
