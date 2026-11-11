/* Step 3 · Office hours. A prep sheet the student fills in before the live session and finishes during it:
   SAT (or Listening) mistake analysis from their own homework, peer feedback on IELTS writing, live speaking practice,
   and a summary to send to the teacher. Nothing leaves this browser unless the student copies it. */
(function () {
  "use strict";
  var NZ = window.NZ, el = NZ.el, CAD = window.CADENCE;
  var id = NZ.param("id", "C01");
  var L = (window.LESSONS || {})[id], O = (window.OFFICE || {})[id], m = NZ.meta(id);
  var root = document.getElementById("office");
  if (!L || !O || !m) {
    root.appendChild(el("div", { class: "wrap lesson-head" }, [el("span", { class: "label", text: id }), el("h1", { text: "Office hours not ready" }),
      el("p", { class: "ru", text: "Для этого урока office hours ещё не подготовлены." }), el("p", {}, [el("a", { class: "btn", href: "index.html#map", text: "← Карта курса" })])]));
    return;
  }
  document.title = id + " · Office hours · " + L.title + " · NURZYCOM";
  var KEY = "nz_exp_oh_" + id;
  var S = NZ.store.get(KEY) || {};
  S.tags = S.tags || {}; S.peer = S.peer || {}; S.partner = S.partner || {};
  var save = function () { NZ.store.set(KEY, S); };
  var cd = NZ.cadence(id), ls = NZ.lessonState(id);
  var part = function (pid) { return L.parts.filter(function (p) { return p.id === pid; })[0]; };
  var listenLesson = m.code === "LIS";

  root.appendChild(el("header", { class: "wrap lesson-head" }, [
    el("span", { class: "label", text: id + " · Шаг 3 · Office hours" }),
    el("h1", { lang: "en" }, [el("span", { class: "ul", text: L.title })]),
    el("p", { class: "ru", text: "Живая встреча в группе или один на один. Три дела и только они: разобрать твои ошибки " + (listenLesson ? "в Listening" : "SAT") + ", проверить письмо друг друга по критериям IELTS и поговорить вслух. Заполни эту страницу до встречи: так время уйдёт на разбор, а не на поиски." })
  ]));
  root.appendChild(NZ.strip(id, "office"));
  var main = el("div", { class: "wrap" }); root.appendChild(main);

  /* 0. ready? */
  var sp = part("speak");
  var ready = [
    [cd.homework, "Домашнее задание на сайте сделано полностью (" + cd.answered + " / " + cd.total + ")."],
    [!!(ls.text || "").trim(), "Письменное задание написано."],
    [!!(ls.done && ls.done.speak), "Устный ответ отработан дома."]
  ];
  var rl = el("ul", { class: "ready" });
  ready.forEach(function (r) { rl.appendChild(el("li", { class: r[0] ? "ok" : "" }, [el("span", { "aria-hidden": "true", text: r[0] ? "✓" : "○" }), " " + r[1]])); });
  main.appendChild(el("section", { class: "part", id: "ready" }, [el("span", { class: "label", text: "Before you come" }), el("h2", { text: "Ready for office hours?" }), rl,
    cd.homework ? null : el("p", {}, [el("a", { class: "btn", href: "lesson.html?id=" + id, text: "Открыть домашнее задание →" })])]));

  /* 1. mistake analysis */
  var sec1 = el("section", { class: "part", id: "mistakes" }, [
    el("span", { class: "label", text: "01 · " + (listenLesson ? "Listening" : "SAT") + " mistake analysis" }),
    el("h2", { text: "Your mistakes, one by one" }),
    el("p", { class: "ru", text: O.focus + " Для каждой ошибки выбери тип. На встрече разбираем типы, которые повторяются у группы, а не каждую ошибку по отдельности." })
  ]);
  var mis = cd.missed;
  if (!cd.answered) sec1.appendChild(el("p", { class: "small", text: "Пока нет ответов: сначала сделай домашнее задание." }));
  else if (!mis.length) sec1.appendChild(el("p", { class: "small", text: "Ошибок нет. На встрече ты объясняешь группе один вопрос: почему верный ответ доказан текстом." }));
  var tagCounts = function () { var c = {}; mis.forEach(function (x) { var t = S.tags[x.qid]; if (t) c[t] = (c[t] || 0) + 1; }); return c; };
  mis.forEach(function (x, i) {
    var q = x.q, ans = ls.ans[x.qid];
    var lbl = function (v) { return q.kind === "tfng" ? { T: "TRUE", F: "FALSE", NG: "NOT GIVEN" }[v] : "ABCD"[v] + ") " + q.opts[v]; };
    var sel = el("select", { "aria-label": "Тип ошибки, вопрос " + (i + 1) });
    sel.appendChild(el("option", { value: "", text: "Тип ошибки…" }));
    CAD.traps.forEach(function (t) { var o = el("option", { value: t, text: t }); if (S.tags[x.qid] === t) o.selected = true; sel.appendChild(o); });
    sel.addEventListener("change", function () { S.tags[x.qid] = sel.value; save(); renderSummary(); });
    var src = q.text || q.stem;
    sec1.appendChild(el("div", { class: "q mis" }, [
      el("span", { class: "qn", text: { sat: "SAT", ielts: "IELTS Reading", listen: "Listening", exit: "Exit check" }[x.part] + " · " + (NZ.meta(id) ? (window.CADENCE.skills[x.skill] || x.skill) : "") }),
      el("p", { class: "txt", lang: "en", text: src.length > 260 ? src.slice(0, 257) + "…" : src }),
      el("p", { class: "small" }, [el("span", { class: "strike", lang: "en", text: lbl(ans) }), "  →  ", el("b", { lang: "en", text: lbl(q.key) })]),
      sel
    ]));
  });
  main.appendChild(sec1);

  /* 2. peer feedback */
  var sec2 = el("section", { class: "part", id: "peer" }, [
    el("span", { class: "label", text: "02 · IELTS Writing · peer feedback" }),
    el("h2", { text: "Feedback like an examiner" }),
    el("p", { class: "ru", text: "Сначала потренируйся на чужом тексте. Это работа выдуманного ученика на то же задание: «" + O.peer.task + "». Отметь по каждому критерию, всё ли в порядке, и напиши одну короткую причину. Потом открой, что нашёл преподаватель. На встрече вы меняетесь своими текстами и проверяете друг друга по тем же четырём вопросам." })
  ]);
  sec2.appendChild(el("div", { class: "passage", lang: "en" }, [el("h3", { text: "Sample answer" }), el("p", { text: O.peer.sample })]));
  var crit = el("div", { class: "crit" });
  CAD.criteria.forEach(function (c) {
    var v = S.peer[c.c] || {};
    var name = "pr-" + c.c;
    var ok = el("input", { type: "radio", name: name, value: "ok" }), bad = el("input", { type: "radio", name: name, value: "fix" });
    if (v.v === "ok") ok.checked = true; if (v.v === "fix") bad.checked = true;
    var note = el("input", { type: "text", "aria-label": c.name + ": комментарий", placeholder: "Одна причина…", value: v.note || "" });
    var upd = function () { S.peer[c.c] = { v: ok.checked ? "ok" : bad.checked ? "fix" : "", note: note.value }; save(); };
    [ok, bad].forEach(function (r) { r.addEventListener("change", upd); }); note.addEventListener("input", upd);
    crit.appendChild(el("fieldset", {}, [el("legend", {}, [el("b", { lang: "en", text: c.c + " · " + c.name }), el("span", { class: "small", text: " " + c.ru })]),
      el("label", {}, [ok, " в порядке"]), el("label", {}, [bad, " нужно исправить"]), note]));
  });
  sec2.appendChild(crit);
  var found = el("div", { class: "exp", hidden: S.revealed ? null : "" });
  var flagged = O.peer.issues.map(function (x) { return x[0]; });
  function renderFound() {
    found.textContent = "";
    var hit = CAD.criteria.filter(function (c) { return flagged.indexOf(c.c) >= 0 && (S.peer[c.c] || {}).v === "fix"; }).length;
    var need = CAD.criteria.filter(function (c) { return flagged.indexOf(c.c) >= 0; }).length;
    found.appendChild(el("b", { text: "Что нашёл преподаватель · ты отметил(а) " + hit + " из " + need + " проблемных критериев" }));
    var ul = el("ul"); O.peer.issues.forEach(function (x) { ul.appendChild(el("li", {}, [el("b", { lang: "en", text: x[0] + ": " }), x[1]])); });
    found.appendChild(ul);
    S.peerScore = [hit, need]; save();
  }
  if (S.revealed) renderFound();
  sec2.appendChild(el("p", { class: "row" }, [el("button", { class: "btn", type: "button", text: "Показать, что нашёл преподаватель", onclick: function () { S.revealed = true; save(); renderFound(); found.hidden = false; renderSummary(); } })]));
  sec2.appendChild(found);
  var own = (ls.text || "").trim();
  var partnerBox = el("div", { class: "card" }, [el("span", { class: "label", text: "On the day · your own text" }),
    own ? el("p", { lang: "en", class: "own", text: own }) : el("p", { class: "small", text: "Своего текста пока нет: напиши его в домашнем задании." }),
    el("p", { class: "small", text: "Комментарии партнёра по четырём критериям (впиши на встрече):" })]);
  CAD.criteria.forEach(function (c) {
    var t = el("input", { type: "text", "aria-label": "Комментарий партнёра: " + c.name, placeholder: c.c + " · …", value: S.partner[c.c] || "" });
    t.addEventListener("input", function () { S.partner[c.c] = t.value; save(); });
    partnerBox.appendChild(t);
  });
  sec2.appendChild(partnerBox);
  main.appendChild(sec2);

  /* 3. live speaking */
  var ul3 = el("ol", { lang: "en" }); O.live.forEach(function (t) { ul3.appendChild(el("li", { text: t })); });
  var fix = el("input", { type: "text", "aria-label": "Одна вещь, которую исправить", placeholder: "Например: пауза после связки, ударение в numbers…", value: S.fix || "" });
  fix.addEventListener("input", function () { S.fix = fix.value; save(); });
  main.appendChild(el("section", { class: "part", id: "live" }, [
    el("span", { class: "label", text: "03 · IELTS Speaking · live" }),
    el("h2", { text: "Speak, then fix one thing" }),
    el("p", { class: "ru", text: "На встрече каждый отвечает вслух на эти вопросы. Тема та же, что в уроке, поэтому слова урока уже в голове. Фокус произношения: " + (sp ? sp.pron.title.replace("Pronunciation: ", "") : "—") + ". После ответа запиши одну вещь, которую исправишь в следующий раз." }),
    el("div", { class: "card" }, [el("span", { class: "label", text: "Live prompts" }), ul3]),
    el("label", { class: "f" }, [el("span", { class: "small", text: "Одна вещь, которую исправлю:" }), fix])
  ]));

  /* 4. summary + attended */
  var pre = el("pre", { class: "summary", "aria-live": "polite" });
  function summary() {
    var c = tagCounts(), lines = [];
    lines.push("Office hours · " + id + " · " + L.title);
    lines.push("Домашнее задание: " + cd.right + " / " + cd.total + " с первой попытки.");
    if (mis.length) {
      lines.push("Ошибки по типам:");
      Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).forEach(function (k) { lines.push("  • " + k + ": " + c[k]); });
      var un = mis.length - Object.keys(c).reduce(function (s, k) { return s + c[k]; }, 0);
      if (un) lines.push("  • без типа: " + un);
    } else lines.push("Ошибок нет.");
    if (S.peerScore) lines.push("Peer review: нашёл(ла) " + S.peerScore[0] + " из " + S.peerScore[1] + " проблемных критериев.");
    var w = NZ.writing(id);
    if (w) lines.push("Письмо: " + w.words + " слов, связки: " + (w.links.join(", ") || "нет") + ", слова урока: " + (w.own.join(", ") || "нет") + ".");
    if (S.fix) lines.push("Speaking, исправлю: " + S.fix);
    if (own) { lines.push(""); lines.push("Мой текст:"); lines.push(own); }
    return lines.join("\n");
  }
  function renderSummary() { pre.textContent = summary(); }
  var copyMsg = el("span", { class: "small", "aria-live": "polite" });
  var att = el("input", { type: "checkbox" }); att.checked = !!S.attended;
  att.addEventListener("change", function () { S.attended = att.checked; save(); });
  main.appendChild(el("section", { class: "part", id: "summary" }, [
    el("span", { class: "label", text: "04 · Summary for the teacher" }),
    el("h2", { text: "Send it before the session" }),
    el("p", { class: "ru", text: "Скопируй и отправь преподавателю в Telegram до встречи. Так он увидит ошибки группы заранее и соберёт разбор по типам." }),
    pre,
    el("p", { class: "row" }, [
      el("button", { class: "btn", type: "button", text: "Скопировать", onclick: function () {
        var t = summary();
        var done = function () { copyMsg.textContent = "Скопировано."; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () { copyMsg.textContent = "Не получилось скопировать: выдели текст вручную."; });
        else copyMsg.textContent = "Выдели текст выше и скопируй вручную.";
      } }),
      el("a", { class: "btn ghost", href: "https://t.me/nurzycom", text: "Открыть Telegram" }), copyMsg]),
    el("label", { class: "check f" }, [att, el("span", { text: "Я был(а) на office hours по этому уроку." })]),
    el("p", {}, [el("a", { class: "btn ghost", href: "progress.html#" + id, text: "Шаг 4 · Прогресс →" })])
  ]));
  renderSummary();
  var hints = { mistakes: mis.length ? mis.length + " " + (mis.length === 1 ? "ошибка" : mis.length < 5 ? "ошибки" : "ошибок") : "ошибок нет", peer: S.peerScore ? "найдено " + S.peerScore[0] + " из " + S.peerScore[1] : "4 критерия", live: O.live.length + " вопроса", summary: S.attended ? "встреча была" : "скопировать и отправить" };
  ["mistakes", "peer", "live", "summary"].forEach(function (sid, i) { var sec = document.getElementById(sid); if (sec) NZ.fold(sec, i === 0, hints[sid]); });
})();
