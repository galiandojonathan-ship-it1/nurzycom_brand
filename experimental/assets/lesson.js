/* Lesson renderer for the experimental course demo. No dependencies. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be unavailable */ } }
  };

  var id = (new URLSearchParams(location.search).get("id") || "C01").toUpperCase();
  var L = (window.LESSONS || {})[id];
  var meta = (window.COURSE.lessons || []).filter(function (x) { return x.id === id; })[0];
  var root = $("#lesson");

  if (!L) {
    document.title = id + " · NURZYCOM";
    root.appendChild(el("div", { class: "wrap lesson-head" }, [
      el("span", { class: "label", text: id + " · в плане" }),
      el("h1", { text: meta ? meta.title : "Lesson not found" }),
      el("p", { class: "ru", text: meta ? "Этот урок ещё не собран в демо-версии. Сейчас готовы уроки с пометкой «Demo» на карте курса." : "Такого урока нет." }),
      el("p", {}, [el("a", { class: "btn", href: "index.html#map", text: "← Карта курса" })])
    ]));
    return;
  }

  document.title = L.id + " · " + L.title + " · NURZYCOM";
  var KEY = "nz_exp_" + L.id;
  var state = store.get(KEY) || { ans: {}, done: {} };
  var save = function () { store.set(KEY, state); };
  var total = 0;
  L.parts.forEach(function (p) { if (p.type === "questions") total += p.items.length; });

  /* IELTS-only lessons (C12–C15) have no "sat" part */
  var ieltsOnly = !L.parts.some(function (p) { return p.id === "sat"; });

  /* header */
  root.appendChild(el("header", { class: "wrap lesson-head" }, [
    el("span", { class: "label", text: L.checkin ? L.id + " · Шаг 4 · Check-in" : L.id + " · Шаг 2 · Домашнее задание" + (ieltsOnly ? " · IELTS only" : " · SAT Reading and Writing + IELTS") }),
    el("h1", { lang: "en" }, [el("span", { class: "ul", text: L.title })]),
    el("p", { class: "st", lang: "en" }, [el("span", { class: "thread", text: "The thread: " + L.thread })]),
    el("p", { class: "ru", text: L.intro })
  ]));

  if (!L.checkin && window.NZ && window.CADENCE) root.appendChild(window.NZ.strip(L.id, "homework"));

  /* step bar */
  var steps = (L.words ? [["words", "Words"]] : []).concat(L.parts.map(function (p) {
    return [p.id, { sat: "SAT", ielts: "IELTS", listen: "Listening", speak: "Speaking", write: "Writing", exit: "Exit check" }[p.id] || p.label];
  })).concat([["result", "Result"]]);
  var bar = el("ol");
  steps.forEach(function (s) { bar.appendChild(el("li", {}, [el("a", { href: "#" + s[0], "data-step": s[0], text: s[1] })])); });
  root.appendChild(el("nav", { class: "steps", "aria-label": "Части урока" }, [bar]));
  var markDone = function (sid) {
    state.done[sid] = true; save();
    var a = $('[data-step="' + sid + '"]'); if (a) a.classList.add("done");
    renderResult();
  };

  var main = el("div", { class: "wrap" });
  root.appendChild(main);

  /* 1. words (check-ins have none) */
  if (L.words) {
  var wsec = el("section", { class: "part", id: "words" }, [
    el("span", { class: "label", text: "Part 01 · Today's words" }),
    el("h2", { text: L.wordsTitle || "Eight words, two exams" }),
    el("p", { class: "ru", text: L.wordsRu || "У каждого слова два примера: как в тексте SAT и как в ответе IELTS. Сначала попробуй вспомнить перевод сам, потом нажми «показать перевод»." })
  ]);
  var grid = el("div", { class: "words" });
  /* a word carries either { sat, ielts } or, in IELTS-only lessons, ex: [a, b] with the lesson's own wordLabels */
  var wl = L.wordLabels || ["SAT-style", "IELTS-style"];
  L.words.forEach(function (w) {
    var ex = w.ex || [w.sat, w.ielts];
    var tr = el("button", { type: "button", "aria-expanded": "false", text: "показать перевод" });
    tr.addEventListener("click", function () { tr.textContent = w.ru; tr.setAttribute("aria-expanded", "true"); });
    grid.appendChild(el("article", { class: "word" }, [
      el("b", { lang: "en", text: w.w }), el("span", { class: "pos", lang: "en", text: w.pos }),
      el("span", { class: "tr" }, [tr]),
      el("p", { lang: "en" }, [el("span", { text: wl[0] }), ex[0]]),
      el("p", { lang: "en" }, [el("span", { text: wl[1] }), ex[1]])
    ]));
  });
  wsec.appendChild(grid);
  wsec.appendChild(el("p", { class: "row", style: "margin-top:18px" }, [
    el("button", { class: "btn ghost", type: "button", text: "Слова разобраны", onclick: function () { markDone("words"); } })
  ]));
  main.appendChild(wsec);
  }

  /* question block */
  var TF = [["T", "TRUE"], ["F", "FALSE"], ["NG", "NOT GIVEN"]];
  function qBlock(p, n) {
    var sec = el("section", { class: "part", id: p.id }, [
      el("span", { class: "label", text: "Part 0" + n + " · " + p.label }),
      el("h2", { text: p.title }),
      el("p", { class: "ru", text: p.ru })
    ]);
    if (p.rule) {
      var ul = el("ul"); p.rule.forEach(function (r) { ul.appendChild(el("li", { text: r })); });
      sec.appendChild(el("div", { class: "card" }, [el("span", { class: "label", text: "Правило" }), ul]));
    }
    if (p.audio) sec.appendChild(audioCard(p));
    if (p.table) {
      var tw = el("div", { class: "tw dtab", lang: "en" }), tb = el("table");
      tb.appendChild(el("caption", { text: p.table.caption }));
      tb.appendChild(el("thead", {}, [el("tr", {}, p.table.head.map(function (h) { return el("th", { scope: "col", text: h }); }))]));
      var tbd = el("tbody");
      p.table.rows.forEach(function (r) { tbd.appendChild(el("tr", {}, r.map(function (c, i) { return el(i ? "td" : "th", i ? { text: c } : { scope: "row", text: c }); }))); });
      tb.appendChild(tbd); tw.appendChild(tb); sec.appendChild(tw);
    }
    if (p.passage) {
      var pas = el("div", { class: "passage", lang: "en" }, [el("h3", { text: p.passageTitle || "Text" })]);
      if (p.glossary) { var gl = el("p", { class: "gloss small" }); p.glossary.forEach(function (g, k) { gl.appendChild(el("span", {}, [el("b", { text: "*" + g[0] }), " " + g[1] + (k < p.glossary.length - 1 ? "   " : "")])); }); }
      p.passage.forEach(function (t, k) {
        pas.appendChild(p.lettered ? el("p", { class: "lettered" }, [el("b", { class: "plet", text: "ABCDEFGHIJ"[k] }), el("span", { text: t })]) : el("p", { text: t }));
      });
      if (p.glossary) pas.appendChild(gl);
      sec.appendChild(pas);
    }
    var heads = null, ROM = (window.NZ && window.NZ.ROMAN) || ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];
    var isOk = function (q, a) { return window.NZ ? window.NZ.ok(q, a) : a === q.key; };
    p.items.forEach(function (q, i) {
      var qid = p.id + "." + i;
      if (q.group) {
        var g = el("div", { class: "qgroup", lang: "en" }, [el("h3", { text: q.group.title }), q.group.task ? el("p", { class: "task", text: q.group.task }) : null,
          q.group.ru ? el("p", { class: "ru small", lang: "ru", text: q.group.ru }) : null]);
        if (q.group.headings) {
          heads = q.group.headings;
          var hl = el("ol", { class: "heads" });
          heads.forEach(function (h, k) { hl.appendChild(el("li", {}, [el("b", { text: ROM[k] }), " " + h])); });
          g.appendChild(el("div", { class: "headbox" }, [el("span", { class: "label", text: "List of headings" }), hl]));
        }
        sec.appendChild(g);
      }
      if (q.kind === "gap") { sec.appendChild(gapBox(p, q, qid, i)); return; }
      var box = el("div", { class: "q", lang: "en" }, [el("span", { class: "qn", text: "Question " + (i + 1) + " of " + p.items.length })]);
      if (q.text) box.appendChild(el("p", { class: "txt", text: q.text }));
      box.appendChild(el("p", { class: "stem", text: q.stem }));
      var opts = el("div", { class: "opts" + (q.kind === "tfng" ? " tf" : ""), role: "group", "aria-label": "Answer choices" });
      var exp = el("div", { class: "exp", lang: "ru", hidden: "", "aria-live": "polite" });
      var list = q.kind === "tfng" ? TF.map(function (t) { return { val: t[0], label: t[1] }; })
        : q.kind === "match" ? heads.map(function (h, k) { return { val: k, label: ROM[k], aria: ROM[k] + ": " + h }; })
        : q.opts.map(function (o, k) { return { val: k, label: o, letter: "ABCD"[k] }; });
      if (q.kind === "match") opts.className = "opts rom";
      var btns = [];
      var reveal = function (chosen) {
        btns.forEach(function (b) {
          b.node.setAttribute("aria-disabled", "true");
          var note = b.val === q.key ? "верный ответ" : b.val === chosen ? "твой ответ, неверно" : "";
          if (b.val === q.key) b.node.classList.add("right");
          else if (b.val === chosen) b.node.classList.add("wrong");
          if (note && !b.node.querySelector(".sr-only")) b.node.appendChild(el("span", { class: "sr-only", lang: "ru", text: " (" + note + ")" }));
        });
        var ok = isOk(q, chosen);
        exp.hidden = false; exp.textContent = "";
        exp.appendChild(el("b", { text: ok ? "Верно" : "Неверно" }));
        exp.appendChild(document.createTextNode(q.ru));
        if (q.chk) exp.appendChild(el("span", { class: "chk", text: "Ключ проверен ×" + q.chk }));
      };
      list.forEach(function (o) {
        var b = el("button", { class: "opt", type: "button", "aria-label": o.aria || null }, [o.letter ? el("span", { class: "k", text: o.letter }) : null, el("span", { text: o.label })]);
        b.addEventListener("click", function () {
          if (state.ans[qid] !== undefined) return;
          state.ans[qid] = o.val; save(); reveal(o.val);
          if (p.items.every(function (_, j) { return state.ans[p.id + "." + j] !== undefined; })) markDone(p.id);
          renderResult();
        });
        btns.push({ node: b, val: o.val }); opts.appendChild(b);
      });
      box.appendChild(opts); box.appendChild(exp);
      if (state.ans[qid] !== undefined) reveal(state.ans[qid]);
      sec.appendChild(box);
    });
    function gapBox(p, q, qid, i) {
      var box = el("div", { class: "q gapq", lang: "en" }, [el("span", { class: "qn", text: "Question " + (i + 1) + " of " + p.items.length })]);
      var parts = q.stem.split("______");
      var inp = el("input", { type: "text", class: "gap-in", "aria-label": "Answer to question " + (i + 1), autocomplete: "off", autocapitalize: "off", spellcheck: "false" });
      box.appendChild(el("p", { class: "stem gapline" }, [parts[0], inp, parts[1] || ""]));
      var exp = el("div", { class: "exp", lang: "ru", hidden: "", "aria-live": "polite" });
      var go = el("button", { class: "btn ghost small-btn", type: "button", text: "Ответить" });
      var reveal = function (val) {
        var right = isOk(q, val);
        inp.value = val; inp.disabled = true; go.hidden = true;
        inp.classList.add(right ? "right" : "wrong");
        exp.hidden = false; exp.textContent = "";
        exp.appendChild(el("b", { text: right ? "Верно" : "Неверно" }));
        if (!right) exp.appendChild(el("span", { class: "key", lang: "en", text: "Answer: " + q.accept[0] + (q.accept.length > 1 ? " (also: " + q.accept.slice(1).join(", ") + ")" : "") + ". " }));
        exp.appendChild(document.createTextNode(q.ru));
        if (q.chk) exp.appendChild(el("span", { class: "chk", text: "Ключ проверен ×" + q.chk }));
      };
      var submit = function () {
        var v = inp.value.trim(); if (!v || state.ans[qid] !== undefined) return;
        state.ans[qid] = v; save(); reveal(v);
        if (p.items.every(function (_, j) { return state.ans[p.id + "." + j] !== undefined; })) markDone(p.id);
        renderResult();
      };
      go.addEventListener("click", submit);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); submit(); } });
      box.appendChild(el("p", { class: "row" }, [go, q.limit ? el("span", { class: "small", lang: "ru", text: "не больше " + q.limit + " " + (q.limit === 1 ? "слова" : "слов") }) : null]));
      box.appendChild(exp);
      if (state.ans[qid] !== undefined) reveal(state.ans[qid]);
      return box;
    }
    if (p.transcript) {
      var tr = el("details", {}, [el("summary", { text: "Текст записи (открой после ответов)" })]);
      p.transcript.forEach(function (t) { tr.appendChild(el("p", { lang: "en", text: t })); });
      sec.appendChild(tr);
    }
    return sec;
  }

  /* listening: the browser reads an original script aloud (no audio files) */
  function audioCard(p) {
    var can = "speechSynthesis" in window;
    var info = el("p", { class: "small", text: can ? "Запись читает синтезатор речи твоего браузера. На экзамене говорит человек, поэтому это только тренировка." : "Этот браузер не умеет читать текст вслух. Открой текст записи ниже и попроси кого-нибудь прочитать его." });
    var play = el("button", { class: "btn", type: "button", text: "▶ Слушать", disabled: can ? null : "" });
    var stop = el("button", { class: "btn ghost", type: "button", text: "Стоп" });
    var status = el("p", { class: "small", "aria-live": "polite", text: "" });
    var run = 0;
    /* One utterance per sentence: some browsers cut off a single long utterance part-way through. */
    play.addEventListener("click", function () {
      var synth = window.speechSynthesis, mine = ++run;
      synth.cancel();
      status.textContent = "Идёт запись: " + p.audio.length + " предложений.";
      play.textContent = "↻ Слушать сначала";
      p.audio.forEach(function (s, i) {
        var u = new SpeechSynthesisUtterance(s);
        u.lang = "en-GB"; u.rate = 0.92;
        if (i === p.audio.length - 1) u.onend = function () { if (mine === run) status.textContent = "Запись закончилась."; };
        u.onerror = function (e) { if (mine === run && e.error !== "canceled" && e.error !== "interrupted") status.textContent = "Браузер не смог прочитать запись. Открой текст записи ниже."; };
        synth.speak(u);
      });
    });
    stop.addEventListener("click", function () { if (!can) return; run += 1; window.speechSynthesis.cancel(); status.textContent = "Остановлено."; });
    if (can) window.addEventListener("pagehide", function () { window.speechSynthesis.cancel(); });
    return el("div", { class: "card" }, [el("span", { class: "label", text: "Audio" }), info, el("div", { class: "row" }, [play, stop]), status]);
  }

  /* speaking */
  function speakBlock(p, n) {
    var sec = el("section", { class: "part", id: p.id }, [
      el("span", { class: "label", text: "Part 0" + n + " · " + p.label }),
      el("h2", { text: p.title }),
      el("p", { class: "ru", text: p.ru })
    ]);
    var ul = el("ul", { lang: "en" }); p.prompts.forEach(function (t) { ul.appendChild(el("li", { text: t })); });
    var time = el("span", { class: "timer", "aria-live": "off", text: fmt(p.talk) });
    var status = el("p", { class: "small", "aria-live": "polite", text: "Подготовка " + p.prep + " с, затем ответ " + p.talk + " с." });
    var start = el("button", { class: "btn", type: "button", text: "Начать" });
    var recBtn = el("button", { class: "btn ghost", type: "button", text: "● Записать ответ" });
    var player = el("audio", { controls: "", hidden: "" });
    var tick = null, rec = null, chunks = [];
    function fmt(s) { return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
    function run(sec0, label, next) {
      var s = sec0; clearInterval(tick); status.textContent = label; time.textContent = fmt(s);
      tick = setInterval(function () { s -= 1; time.textContent = fmt(Math.max(s, 0)); if (s <= 0) { clearInterval(tick); next(); } }, 1000);
    }
    start.addEventListener("click", function () {
      start.disabled = true;
      run(p.prep, "Подготовка: продумай ответ.", function () {
        run(p.talk, "Говори вслух.", function () {
          status.textContent = "Время вышло. Сравни свой ответ с образцом ниже.";
          start.disabled = false; stopRec(); markDone(p.id);
        });
      });
    });
    function stopRec() { if (rec && rec.state !== "inactive") rec.stop(); }
    recBtn.addEventListener("click", function () {
      if (rec && rec.state === "recording") { stopRec(); return; }
      if (!navigator.mediaDevices || !window.MediaRecorder) { status.textContent = "Запись в этом браузере недоступна. Запиши ответ на диктофон телефона."; return; }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        chunks = []; rec = new MediaRecorder(stream);
        rec.ondataavailable = function (e) { chunks.push(e.data); };
        rec.onstop = function () {
          stream.getTracks().forEach(function (t) { t.stop(); });
          player.src = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })); player.hidden = false;
          recBtn.textContent = "● Записать ещё раз"; status.textContent = "Запись готова. Она хранится только в этой вкладке и никуда не отправляется.";
        };
        rec.start(); recBtn.textContent = "■ Остановить запись"; status.textContent = "Идёт запись.";
      }).catch(function () { status.textContent = "Нет доступа к микрофону. Разреши его в настройках браузера или запиши ответ на диктофон."; });
    });
    sec.appendChild(el("div", { class: "card" }, [el("span", { class: "label", text: "Questions" }), ul, time, status, el("div", { class: "row" }, [start, recBtn]), player]));
    var pl = el("ul"); p.pron.items.forEach(function (t) { pl.appendChild(el("li", { text: t })); });
    sec.appendChild(el("div", { class: "card" }, [el("span", { class: "label", text: p.pron.title }), el("p", { class: "ru", text: p.pron.ru }), pl]));
    sec.appendChild(el("details", {}, [el("summary", { text: "Образец ответа (сначала ответь сам)" }), el("p", { lang: "en", text: p.model })]));
    return sec;
  }

  /* writing */
  function writeBlock(p, n) {
    var sec = el("section", { class: "part", id: p.id }, [
      el("span", { class: "label", text: "Part 0" + n + " · " + p.label }),
      el("h2", { text: p.title }),
      el("p", { class: "ru", text: p.ru })
    ]);
    var ul = el("ol", { lang: "en" }); p.prompts.forEach(function (t) { ul.appendChild(el("li", { text: t })); });
    var ta = el("textarea", { "aria-label": "Твой ответ", lang: "en", placeholder: "Write here…", spellcheck: "true" });
    ta.value = state.text || "";
    var count = el("span", { class: "small", "aria-live": "polite" });
    var show = el("button", { class: "btn", type: "button", text: "Показать образец" });
    var model = el("div", { class: "exp", hidden: "" }, [el("b", { text: "Model answer (один из возможных)" })]);
    p.model.forEach(function (t) { model.appendChild(el("p", { lang: "en", text: t })); });
    if (state.done[p.id]) model.hidden = false;
    var words = function () { return (ta.value.trim().match(/\S+/g) || []).length; };
    var upd = function () { var w = words(); count.textContent = w + " / " + p.minWords + " слов"; show.disabled = w < p.minWords; };
    ta.addEventListener("input", function () { state.text = ta.value; save(); upd(); });
    show.addEventListener("click", function () { model.hidden = false; markDone(p.id); });
    var chk = el("div", { class: "check" });
    state.checks = state.checks || {};
    p.checklist.forEach(function (c, i) {
      var cb = el("input", { type: "checkbox" });
      cb.checked = !!state.checks[i];
      cb.addEventListener("change", function () { state.checks[i] = cb.checked; save(); });
      chk.appendChild(el("label", {}, [cb, el("span", { text: c })]));
    });
    sec.appendChild(el("div", { class: "card" }, [el("span", { class: "label", text: "Task" }), ul, ta, el("div", { class: "row", style: "margin-top:10px" }, [show, count]),
      el("p", { class: "small", style: "margin-top:14px", text: "Проверь себя до образца:" }), chk, model]));
    upd();
    return sec;
  }

  var n = L.words ? 2 : 1;
  L.parts.forEach(function (p) {
    main.appendChild(p.type === "questions" ? qBlock(p, n) : p.type === "speaking" ? speakBlock(p, n) : writeBlock(p, n));
    n += 1;
  });

  /* result + hand-off */
  var res = el("section", { class: "part", id: "result" });
  main.appendChild(res);
  function renderResult() {
    var right = 0, answered = 0;
    L.parts.forEach(function (p) {
      if (p.type !== "questions") return;
      p.items.forEach(function (q, i) { var a = state.ans[p.id + "." + i]; if (a !== undefined) { answered += 1; if (window.NZ ? window.NZ.ok(q, a) : a === q.key) right += 1; } });
    });
    res.textContent = "";
    res.appendChild(el("span", { class: "label", text: "Result" }));
    res.appendChild(el("p", { class: "score", text: right + " / " + total }));
    if (L.checkin) {
      res.appendChild(el("p", { class: "ru", text: answered < total ? "Отвечено " + answered + " из " + total + ". Счёт идёт по первой попытке." : "Готово. Результат по навыкам сохранён на странице «Прогресс». Это не прогноз балла." }));
      res.appendChild(el("p", {}, [el("a", { class: "btn", href: "progress.html#checkins", text: "Шаг 4 · Прогресс →" })]));
      return;
    }
    res.appendChild(el("p", { class: "ru", text: answered < total ? "Отвечено " + answered + " из " + total + ". Счёт идёт по первой попытке." : "Это счёт одного урока, а не прогноз балла на экзамене. Реалистичный диапазон даёт только диагностика." }));
    var next = (window.COURSE.lessons || []).filter(function (x) { return x.id === L.handoff.next; })[0];
    res.appendChild(el("div", { class: "handoff" }, [
      el("span", { class: "label", text: "Next steps" }),
      el("p", { class: "ru", style: "font:400 16px/1.5 var(--sans);margin:6px 0 4px", text: "Шаг 3: подготовь office hours по этому уроку. Шаг 4: после встречи исправь ошибки на странице «Прогресс»." }),
      el("div", { class: "row", style: "margin-bottom:22px" }, [
        el("a", { class: "btn", href: "office.html?id=" + L.id, text: "Шаг 3 · Office hours →" }),
        el("a", { class: "btn ghost", style: "color:#F5F3EE;border-color:#F5F3EE", href: "progress.html#" + L.id, text: "Шаг 4 · Прогресс" })
      ]),
      el("span", { class: "label", text: "The thread continues" }),
      el("p", { lang: "en", text: L.handoff.text }),
      el("div", { class: "row" }, [
        el("a", { class: "btn", href: "lesson.html?id=" + L.handoff.next, text: (next ? next.id + " · " + next.title + (next.status === "live" ? "" : " (в плане)") : "Next") + " →" }),
        el("a", { class: "btn ghost", style: "color:#F5F3EE;border-color:#F5F3EE", href: "index.html#map", text: "Карта курса" })
      ])
    ]));
    res.appendChild(el("p", { class: "row", style: "margin-top:18px" }, [
      el("button", { class: "btn ghost", type: "button", text: "Пройти урок заново", onclick: function () { store.set(KEY, null); location.hash = ""; location.reload(); } })
    ]));
  }
  Object.keys(state.done).forEach(function (s) { var a = $('[data-step="' + s + '"]'); if (a) a.classList.add("done"); });

  /* one part at a time: the step bar switches parts, each part ends with a "next" button */
  var partIds = steps.map(function (s) { return s[0]; });
  var show = function (sid, scroll) {
    if (partIds.indexOf(sid) < 0) sid = partIds[0];
    partIds.forEach(function (pid) { var sec = document.getElementById(pid); if (sec) sec.hidden = pid !== sid; });
    [].forEach.call(bar.querySelectorAll("a"), function (a) { if (a.getAttribute("data-step") === sid) a.setAttribute("aria-current", "step"); else a.removeAttribute("aria-current"); });
    state.cur = sid; save();
    if (scroll) { var top = root.querySelector(".steps"); if (top) top.scrollIntoView(); }
  };
  [].forEach.call(bar.querySelectorAll("a"), function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); show(a.getAttribute("data-step"), true); });
  });
  partIds.forEach(function (pid, i) {
    var sec = document.getElementById(pid), nxt = partIds[i + 1];
    if (!sec || !nxt) return;
    var label = (steps[i + 1] || [])[1];
    sec.appendChild(el("p", { class: "next-part" }, [el("button", { class: "btn", type: "button", text: "Дальше: " + label + " →", onclick: function () { show(nxt, true); } })]));
  });
  show(state.cur || partIds[0], false);
  renderResult();
})();
