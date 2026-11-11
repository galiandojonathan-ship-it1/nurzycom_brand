/* Shared helpers for the 4-step cadence: state per lesson, the step strip, skill tagging and metrics.
   Everything is stored in this browser only (localStorage), never sent anywhere. */
(function () {
  "use strict";
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
  var C = window.COURSE || { lessons: [] };
  var meta = function (id) { return C.lessons.filter(function (x) { return x.id === id; })[0]; };
  var param = function (name, dflt) { return (new URLSearchParams(location.search).get(name) || dflt || "").toUpperCase(); };

  /* every scored question of a lesson, with its skill code */
  function items(id) {
    var L = (window.LESSONS || {})[id], m = meta(id), out = [];
    if (!L) return out;
    L.parts.forEach(function (p) {
      if (p.type !== "questions") return;
      p.items.forEach(function (q, i) {
        var skill = q.skill;
        if (!skill) {
          if (p.id === "listen") skill = "LIS";
          else if (q.kind === "tfng") skill = "R-TFNG";
          else if (p.id === "ielts") skill = "R-MC";
          else if (p.id === "exit" && m && m.code === "LIS") skill = "LIS";
          else skill = m ? m.code : "?";
        }
        out.push({ qid: p.id + "." + i, part: p.id, q: q, skill: skill });
      });
    });
    return out;
  }
  var lessonState = function (id) { return store.get("nz_exp_" + id) || { ans: {}, done: {} }; };

  /* the four steps for one lesson */
  function cadence(id) {
    var st = lessonState(id), its = items(id);
    var answered = its.filter(function (x) { return st.ans[x.qid] !== undefined; });
    var missed = answered.filter(function (x) { return st.ans[x.qid] !== x.q.key; });
    var retry = store.get("nz_exp_retry_" + id) || {};
    var oh = store.get("nz_exp_oh_" + id) || {};
    return {
      slides: !!store.get("nz_exp_slides_" + id),
      homework: its.length > 0 && answered.length === its.length,
      office: !!oh.attended,
      progress: its.length > 0 && answered.length === its.length && missed.every(function (x) { return retry[x.qid] !== undefined; }),
      answered: answered.length, total: its.length, right: answered.length - missed.length, missed: missed, retry: retry
    };
  }

  /* the step strip shown on all four pages of a lesson */
  function strip(id, current) {
    var cd = cadence(id), steps = (window.CADENCE || {}).steps || [];
    var hrefs = { slides: "slides.html?id=" + id, homework: "lesson.html?id=" + id, office: "office.html?id=" + id, progress: "progress.html#" + id };
    var ol = el("ol", { class: "cad" });
    steps.forEach(function (s) {
      var done = cd[s.id];
      var a = el("a", { href: hrefs[s.id], "aria-current": s.id === current ? "step" : null, class: (s.id === current ? "cur " : "") + (done ? "done" : "") }, [
        el("span", { class: "cad-n", text: done ? "✓" : String(s.n) }),
        el("span", { class: "cad-t" }, [el("b", { text: s.ru }), el("small", { text: done ? "готово" : s.id === current ? "сейчас" : "" })])
      ]);
      ol.appendChild(el("li", {}, [a]));
    });
    return el("nav", { class: "cad-wrap", "aria-label": "Четыре шага урока " + id }, [el("div", { class: "wrap" }, [ol])]);
  }

  /* writing metrics: words, linking words, the lesson's own words */
  var LINKS = ["however", "nevertheless", "consequently", "therefore", "moreover", "in addition", "likewise", "similarly", "whereas", "although", "by contrast", "for example", "for instance", "as a result", "because", "even so", "while", "overall", "instead"];
  function writing(id) {
    var st = lessonState(id), L = (window.LESSONS || {})[id], t = (st.text || "").toLowerCase();
    if (!t.trim()) return null;
    var words = (t.match(/[a-z’']+/g) || []);
    var links = LINKS.filter(function (w) { return new RegExp("\\b" + w + "\\b").test(t); });
    var own = (L && L.words || []).filter(function (w) {
      var stem = w.w.toLowerCase().replace(/(e|y|ate)$/, "");
      return new RegExp("\\b" + stem.slice(0, Math.max(4, stem.length))).test(t);
    }).map(function (w) { return w.w; });
    return { words: words.length, links: links, own: own };
  }

  /* fold a section: its h2 becomes a toggle; everything after the h2 hides until opened */
  function fold(sec, open, hint) {
    var h2 = sec.querySelector("h2"); if (!h2) return sec;
    var body = el("div", { class: "fold-body" });
    var moved = [], node = h2;
    while (node && node !== sec) {               /* everything after the h2, at every level up to the section */
      var sib = node.nextSibling;
      while (sib) { moved.push(sib); sib = sib.nextSibling; }
      node = node.parentNode;
    }
    var parent = h2.parentNode;
    var btn = el("button", { type: "button", class: "fold-btn", "aria-expanded": open ? "true" : "false" }, [el("span", { text: h2.textContent }), hint ? el("small", { text: hint }) : null]);
    h2.textContent = ""; h2.appendChild(btn); h2.classList.add("fold-h");
    moved.forEach(function (n) { body.appendChild(n); });
    parent.insertBefore(body, h2.nextSibling);
    body.hidden = !open; sec.classList.add("fold");
    btn.addEventListener("click", function () { var o = btn.getAttribute("aria-expanded") !== "true"; btn.setAttribute("aria-expanded", o ? "true" : "false"); body.hidden = !o; });
    return sec;
  }

  window.NZ = { fold: fold, el: el, store: store, meta: meta, param: param, items: items, lessonState: lessonState, cadence: cadence, strip: strip, writing: writing };
})();
