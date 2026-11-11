/* Step 1 · Presentation. Builds a 16:9 slide deck from the lesson data and DECKS[id], in the order of the SAT course decks:
   recall of last lesson's words → today's words → the story → rules → worked example → solution → same skill in the other exam
   → worked example → solution → speaking → writing → the next three steps → hand-off. Slides are in English. */
(function () {
  "use strict";
  var NZ = window.NZ, el = NZ.el;
  var id = NZ.param("id", "C01");
  var L = (window.LESSONS || {})[id], D = (window.DECKS || {})[id], m = NZ.meta(id);
  var root = document.getElementById("deck");
  if (!L || !D || !m) {
    root.appendChild(el("div", { class: "wrap lesson-head" }, [el("span", { class: "label", text: id }), el("h1", { text: "Slides not ready" }),
      el("p", { class: "ru", text: "Для этого урока презентация ещё не собрана. Готовые уроки отмечены на карте курса." }),
      el("p", {}, [el("a", { class: "btn", href: "index.html#map", text: "← Карта курса" })])]));
    return;
  }
  document.title = id + " · Slides · " + L.title + " · NURZYCOM";
  var ieltsOnly = !L.parts.some(function (p) { return p.id === "sat"; });
  var part = function (pid) { return L.parts.filter(function (p) { return p.id === pid; })[0]; };
  var order = window.COURSE.lessons.filter(function (x) { return x.status === "live"; }).map(function (x) { return x.id; });
  var prevId = order[order.indexOf(id) - 1], prev = prevId && window.LESSONS[prevId];
  var next = NZ.meta(L.handoff.next);

  var S = [];  /* each slide: { kind, label, build: () => node } */
  var add = function (kind, label, kids, cls) { S.push({ kind: kind, label: label, kids: kids, cls: cls || "" }); };
  var h = function (t) { return el("h2", { class: "sl-h" }, [el("span", { class: "ul", text: t })]); };
  var lab = function (t) { return el("span", { class: "label sl-l", text: t }); };

  add("title", "Title", [
    lab(id + " · " + (ieltsOnly ? "IELTS only" : "SAT Reading and Writing + IELTS")),
    el("h1", { class: "sl-title", text: L.title }),
    el("p", { class: "sl-thread", text: L.thread }),
    el("p", { class: "sl-meta", text: ieltsOnly ? "IELTS · " + m.ielts : "SAT · " + m.sat + "   ×   IELTS · " + m.ielts })
  ], "ink");

  if (prev && prev.words) {
    var g = el("div", { class: "sl-recall" });
    prev.words.forEach(function (w) { g.appendChild(el("span", { text: w.w })); });
    add("recall", "Recall", [lab("Warm-up · Active recall · " + prevId), h("What do these mean?"),
      el("p", { class: "sl-p", text: "Say each word in a sentence about “" + prev.title + "”. No notes, no translation." }), g]);
  }

  var wg = el("div", { class: "sl-words" });
  L.words.forEach(function (w) { wg.appendChild(el("div", {}, [el("b", { text: w.w }), el("i", { text: " " + w.pos }), el("p", { text: (w.ex || [w.ielts])[w.ex ? 1 : 0] })])); });
  add("words", "Words", [lab("Part 01 · Today's words"), h("Eight words, two exams"), wg]);

  D.story.forEach(function (s, i) {
    add("story", "Story", [lab("Part 02 · The story · " + (i + 1) + " of " + D.story.length), h(s[0]), el("p", { class: "sl-big", text: s[1] })], i === D.story.length - 1 ? "mist" : "");
  });

  var rl = el("ol", { class: "sl-rules" });
  D.rules.forEach(function (r) { rl.appendChild(el("li", {}, [el("b", { text: r[0] }), el("span", { text: " " + r[1] })])); });
  add("rules", "Rules", [lab("Part 03 · " + (ieltsOnly ? "IELTS · " + m.ielts : "SAT · " + m.sat)), h("The rules"), rl,
    el("p", { class: "sl-mistake" }, [el("b", { text: "Common mistake: " }), D.mistake])]);

  function example(ex, n, partLabel) {
    var q = [lab(partLabel + " · Worked example · " + ex.exam + " · " + ex.label)];
    if (ex.passage) q.push(el("p", { class: "sl-pass", text: ex.passage }));
    if (ex.text) q.push(el("p", { class: "sl-pass", text: ex.text }));
    q.push(el("p", { class: "sl-stem", text: ex.stem }));
    var opts = ex.tf ? ["TRUE", "FALSE", "NOT GIVEN"] : ex.opts;
    var ol = el("ol", { class: "sl-opts" + (ex.tf ? " tf" : "") });
    opts.forEach(function (o, k) { ol.appendChild(el("li", {}, [el("span", { class: "k", text: ex.tf ? "" : "ABCD"[k] }), o])); });
    q.push(ol);
    add("q", "Example " + n, q);
    var keyIdx = ex.tf ? ["T", "F", "NG"].indexOf(ex.key) : ex.key;
    var st = el("ol", { class: "sl-steps" }); ex.steps.forEach(function (s) { st.appendChild(el("li", { text: s })); });
    var why = el("ul", { class: "sl-why" });
    opts.forEach(function (o, k) {
      why.appendChild(el("li", { class: k === keyIdx ? "ok" : "" }, [el("span", { class: "k", text: ex.tf ? o : "ABCD"[k] }), el("span", { text: ex.why[k] })]));
    });
    add("sol", "Solution " + n, [lab(partLabel + " · Solution · " + (ex.tf ? ex.key === "NG" ? "NOT GIVEN" : ex.key === "T" ? "TRUE" : "FALSE" : "ABCD"[ex.key])),
      el("div", { class: "sl-cols" }, [el("div", {}, [el("h3", { text: "Steps" }), st, el("p", { class: "sl-check" }, [el("b", { text: "Check: " }), ex.check])]),
        el("div", {}, [el("h3", { text: "Why each option is right or wrong" }), why])])]);
  }
  example(D.ex[0], 1, "Part 03");

  add("bridge", "Bridge", [lab("Part 04 · Same skill, other exam"), h(D.bridge[0]), el("p", { class: "sl-big", text: D.bridge[1] })], "mist");
  example(D.ex[1], 2, "Part 04");

  var sp = part("speak");
  if (sp) {
    var pl = el("ul", { class: "sl-list" }); sp.prompts.forEach(function (t) { pl.appendChild(el("li", { text: t })); });
    var pr = el("p", { class: "sl-pron", text: sp.pron.items.slice(0, 6).join("   ·   ") });
    add("speak", "Speaking", [lab("Part 05 · Speaking · " + sp.label.replace("IELTS-style · ", "")), h(sp.title), pl, el("h3", { text: sp.pron.title }), pr]);
  }
  var wr = part("write");
  if (wr) {
    var wl = el("ol", { class: "sl-list" }); wr.prompts.forEach(function (t) { wl.appendChild(el("li", { text: t })); });
    add("write", "Writing", [lab("Part 06 · Writing micro-task"), h(wr.title), wl,
      el("p", { class: "sl-p", text: "Start in class. Finish it on the website, then bring it to office hours for peer feedback." })]);
  }

  var cad = el("ol", { class: "sl-cad" });
  window.CADENCE.steps.forEach(function (s) {
    cad.appendChild(el("li", { class: s.id === "slides" ? "now" : "" }, [el("span", { class: "hex", text: "0" + s.n }), el("b", { text: s.name }),
      el("span", { text: { slides: "Today, in class.", homework: "Words, questions, speaking and writing, on the website.", office: "Your SAT mistakes, peer feedback on your writing, live speaking.", progress: "Retry what you missed. Your skills, in numbers." }[s.id] })]));
  });
  add("cadence", "Next", [lab("After class"), h("Three more steps"), cad]);

  add("handoff", "Hand-off", [lab("The thread continues"), el("p", { class: "sl-big sl-hand", text: L.handoff.text }),
    el("p", { class: "sl-meta", text: "Next: " + (next ? next.id + " · " + next.title : L.handoff.next) })], "ink");

  /* ---------- viewer ---------- */
  var stage = el("div", { class: "stage", role: "region", "aria-roledescription": "slides", "aria-label": "Слайды урока " + id });
  var nodes = S.map(function (s, i) {
    return el("section", { class: "slide " + s.cls, "aria-roledescription": "slide", "aria-label": (i + 1) + " / " + S.length + " · " + s.label, hidden: i ? "" : null, lang: "en" },
      s.kids.concat([el("span", { class: "sl-foot", text: "NURZYCOM · " + id + " · " + (i + 1) + " / " + S.length })]));
  });
  nodes.forEach(function (n) { stage.appendChild(n); });
  var cur = 0;
  var counter = el("span", { class: "label", "aria-live": "polite" });
  var prevB = el("button", { class: "btn ghost", type: "button", text: "← Назад" });
  var nextB = el("button", { class: "btn", type: "button", text: "Дальше →" });
  var bar = el("div", { class: "deck-bar" }, [prevB, counter, nextB,
    el("button", { class: "btn ghost", type: "button", text: "На весь экран", onclick: function () { var f = stage.requestFullscreen || stage.webkitRequestFullscreen; if (f) f.call(stage); } }),
    el("button", { class: "btn ghost", type: "button", text: "Печать / PDF", onclick: function () { window.print(); } })]);
  var dots = el("div", { class: "deck-dots", role: "tablist", "aria-label": "Слайды" });
  S.forEach(function (s, i) { dots.appendChild(el("button", { type: "button", role: "tab", "aria-label": (i + 1) + " · " + s.label, onclick: function () { go(i); } })); });
  function go(i) {
    cur = Math.max(0, Math.min(S.length - 1, i));
    nodes.forEach(function (n, k) { n.hidden = k !== cur; });
    [].forEach.call(dots.children, function (d, k) { d.setAttribute("aria-selected", k === cur ? "true" : "false"); });
    counter.textContent = (cur + 1) + " / " + S.length + " · " + S[cur].label;
    prevB.disabled = cur === 0; nextB.disabled = cur === S.length - 1;
    if (cur === S.length - 1) NZ.store.set("nz_exp_slides_" + id, true);
    try { history.replaceState(null, "", "#s" + (cur + 1)); } catch (e) { /* file:// */ }
  }
  prevB.addEventListener("click", function () { go(cur - 1); });
  nextB.addEventListener("click", function () { go(cur + 1); });
  document.addEventListener("keydown", function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName)) return;
    if (e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && e.target === document.body)) { e.preventDefault(); go(cur + 1); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(cur - 1); }
    if (e.key === "Home") go(0);
    if (e.key === "End") go(S.length - 1);
  });
  var x0 = null;
  stage.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); x0 = null; });

  root.appendChild(el("header", { class: "wrap lesson-head" }, [
    el("span", { class: "label", text: id + " · Шаг 1 · Презентация" }),
    el("h1", { lang: "en" }, [el("span", { class: "ul", text: L.title })]),
    el("p", { class: "ru", text: "Слайды урока на английском, как в SAT-курсе. Листай стрелками, свайпом или кнопками. Разобранные примеры здесь новые: в домашнем задании будут другие вопросы." })
  ]));
  root.appendChild(NZ.strip(id, "slides"));
  root.appendChild(el("div", { class: "wrap deck" }, [stage, bar, dots]));
  var start = parseInt((location.hash.match(/^#s(\d+)$/) || [])[1], 10);
  go(start ? start - 1 : 0);
})();
