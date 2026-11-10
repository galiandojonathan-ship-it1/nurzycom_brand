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

  /* header */
  root.appendChild(el("header", { class: "wrap lesson-head" }, [
    el("span", { class: "label", text: L.id + " · SAT Reading and Writing + IELTS · demo" }),
    el("h1", {}, [el("span", { class: "ul", text: L.title })]),
    el("p", { class: "st" }, [el("span", { class: "thread", text: "The thread: " + L.thread })]),
    el("p", { class: "ru", text: L.intro })
  ]));

  /* step bar */
  var steps = [["words", "Words"]].concat(L.parts.map(function (p) {
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

  /* 1. words */
  var wsec = el("section", { class: "part", id: "words" }, [
    el("span", { class: "label", text: "Part 01 · Today's words" }),
    el("h2", { text: "Eight words, two exams" }),
    el("p", { class: "ru", text: "У каждого слова два примера: как в тексте SAT и как в ответе IELTS. Сначала попробуй вспомнить перевод сам, потом нажми «показать перевод»." })
  ]);
  var grid = el("div", { class: "words" });
  L.words.forEach(function (w) {
    var tr = el("button", { type: "button", "aria-expanded": "false", text: "показать перевод" });
    tr.addEventListener("click", function () { tr.textContent = w.ru; tr.setAttribute("aria-expanded", "true"); });
    grid.appendChild(el("article", { class: "word" }, [
      el("b", { text: w.w }), el("span", { class: "pos", text: w.pos }),
      el("span", { class: "tr" }, [tr]),
      el("p", {}, [el("span", { text: "SAT-style" }), w.sat]),
      el("p", {}, [el("span", { text: "IELTS-style" }), w.ielts])
    ]));
  });
  wsec.appendChild(grid);
  wsec.appendChild(el("p", { class: "row", style: "margin-top:18px" }, [
    el("button", { class: "btn ghost", type: "button", text: "Слова разобраны", onclick: function () { markDone("words"); } })
  ]));
  main.appendChild(wsec);

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
    if (p.passage) {
      var pas = el("div", { class: "passage" }, [el("h3", { text: p.passageTitle || "Text" })]);
      p.passage.forEach(function (t) { pas.appendChild(el("p", { text: t })); });
      sec.appendChild(pas);
    }
    p.items.forEach(function (q, i) {
      var qid = p.id + "." + i;
      var box = el("div", { class: "q" }, [el("span", { class: "qn", text: "Question " + (i + 1) + " of " + p.items.length })]);
      if (q.text) box.appendChild(el("p", { class: "txt", text: q.text }));
      box.appendChild(el("p", { class: "stem", text: q.stem }));
      var opts = el("div", { class: "opts" + (q.kind === "tfng" ? " tf" : ""), role: "group", "aria-label": "Варианты ответа" });
      var exp = el("div", { class: "exp", hidden: "", "aria-live": "polite" });
      var list = q.kind === "tfng" ? TF.map(function (t) { return { val: t[0], label: t[1] }; })
        : q.opts.map(function (o, k) { return { val: k, label: o, letter: "ABCD"[k] }; });
      var btns = [];
      var reveal = function (chosen) {
        btns.forEach(function (b) {
          b.node.disabled = true;
          if (b.val === q.key) b.node.classList.add("right");
          else if (b.val === chosen) b.node.classList.add("wrong");
        });
        var ok = chosen === q.key;
        exp.hidden = false; exp.textContent = "";
        exp.appendChild(el("b", { text: ok ? "Верно" : "Неверно" }));
        exp.appendChild(document.createTextNode(q.ru));
        if (q.chk) exp.appendChild(el("span", { class: "chk", text: "Ключ проверен ×" + q.chk }));
      };
      list.forEach(function (o) {
        var b = el("button", { class: "opt", type: "button" }, [o.letter ? el("span", { class: "k", text: o.letter }) : null, el("span", { text: o.label })]);
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
    if (p.transcript) {
      var tr = el("details", {}, [el("summary", { text: "Текст записи (открой после ответов)" })]);
      p.transcript.forEach(function (t) { tr.appendChild(el("p", { text: t })); });
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
    play.addEventListener("click", function () {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(p.audio.join(" "));
      u.lang = "en-GB"; u.rate = 0.92;
      window.speechSynthesis.speak(u);
    });
    stop.addEventListener("click", function () { if (can) window.speechSynthesis.cancel(); });
    return el("div", { class: "card" }, [el("span", { class: "label", text: "Audio" }), info, el("div", { class: "row" }, [play, stop])]);
  }

  /* speaking */
  function speakBlock(p, n) {
    var sec = el("section", { class: "part", id: p.id }, [
      el("span", { class: "label", text: "Part 0" + n + " · " + p.label }),
      el("h2", { text: p.title }),
      el("p", { class: "ru", text: p.ru })
    ]);
    var ul = el("ul"); p.prompts.forEach(function (t) { ul.appendChild(el("li", { text: t })); });
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
    sec.appendChild(el("details", {}, [el("summary", { text: "Образец ответа (сначала ответь сам)" }), el("p", { text: p.model })]));
    return sec;
  }

  /* writing */
  function writeBlock(p, n) {
    var sec = el("section", { class: "part", id: p.id }, [
      el("span", { class: "label", text: "Part 0" + n + " · " + p.label }),
      el("h2", { text: p.title }),
      el("p", { class: "ru", text: p.ru })
    ]);
    var ul = el("ol"); p.prompts.forEach(function (t) { ul.appendChild(el("li", { text: t })); });
    var ta = el("textarea", { "aria-label": "Твой ответ", placeholder: "Write here…", spellcheck: "true" });
    ta.value = state.text || "";
    var count = el("span", { class: "small", "aria-live": "polite" });
    var show = el("button", { class: "btn", type: "button", text: "Показать образец" });
    var model = el("div", { class: "exp", hidden: "" }, [el("b", { text: "Model answer (один из возможных)" })]);
    p.model.forEach(function (t) { model.appendChild(el("p", { text: t })); });
    var words = function () { return (ta.value.trim().match(/\S+/g) || []).length; };
    var upd = function () { var w = words(); count.textContent = w + " / " + p.minWords + " слов"; show.disabled = w < p.minWords; };
    ta.addEventListener("input", function () { state.text = ta.value; save(); upd(); });
    show.addEventListener("click", function () { model.hidden = false; markDone(p.id); });
    var chk = el("div", { class: "check" });
    p.checklist.forEach(function (c) { chk.appendChild(el("label", {}, [el("input", { type: "checkbox" }), el("span", { text: c })])); });
    sec.appendChild(el("div", { class: "card" }, [el("span", { class: "label", text: "Task" }), ul, ta, el("div", { class: "row", style: "margin-top:10px" }, [show, count]),
      el("p", { class: "small", style: "margin-top:14px", text: "Проверь себя до образца:" }), chk, model]));
    upd();
    return sec;
  }

  var n = 2;
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
      p.items.forEach(function (q, i) { var a = state.ans[p.id + "." + i]; if (a !== undefined) { answered += 1; if (a === q.key) right += 1; } });
    });
    res.textContent = "";
    res.appendChild(el("span", { class: "label", text: "Result" }));
    res.appendChild(el("p", { class: "score", text: right + " / " + total }));
    res.appendChild(el("p", { class: "ru", text: answered < total ? "Отвечено " + answered + " из " + total + ". Счёт идёт по первой попытке." : "Это счёт одного урока, а не прогноз балла на экзамене. Реалистичный диапазон даёт только диагностика." }));
    var next = (window.COURSE.lessons || []).filter(function (x) { return x.id === L.handoff.next; })[0];
    res.appendChild(el("div", { class: "handoff" }, [
      el("span", { class: "label", text: "The thread continues" }),
      el("p", { text: L.handoff.text }),
      el("div", { class: "row" }, [
        el("a", { class: "btn", href: "lesson.html?id=" + L.handoff.next, text: (next ? next.id + " · " + next.title : "Next") + " →" }),
        el("a", { class: "btn ghost", style: "color:#F5F3EE;border-color:#F5F3EE", href: "index.html#map", text: "Карта курса" })
      ])
    ]));
    res.appendChild(el("p", { class: "row", style: "margin-top:18px" }, [
      el("button", { class: "btn ghost", type: "button", text: "Пройти урок заново", onclick: function () { store.set(KEY, null); location.hash = ""; location.reload(); } })
    ]));
  }
  Object.keys(state.done).forEach(function (s) { var a = $('[data-step="' + s + '"]'); if (a) a.classList.add("done"); });
  renderResult();
})();
