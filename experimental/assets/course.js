/* Course map page: renders the two-line map, the transfer table, the bridge track and the SAT-course fragments from data.js. */
(function () {
  "use strict";
  var C = window.COURSE;
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === "text") n.textContent = attrs[k]; else if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var done = function (id) { try { var s = JSON.parse(localStorage.getItem("nz_exp_" + id)); return s && s.done && s.done.exit; } catch (e) { return false; } };

  var cadLinks = function (id) {
    if (!window.NZ || !window.CADENCE) return null;
    var cd = window.NZ.cadence(id), box = el("p", { class: "cadlinks" });
    var hrefs = { slides: "slides.html?id=" + id, homework: "lesson.html?id=" + id, office: "office.html?id=" + id, progress: "progress.html#" + id };
    window.CADENCE.steps.forEach(function (s) {
      var a = el("a", { href: hrefs[s.id], class: cd[s.id] ? "done" : "", text: s.n + " · " + s.ru });
      box.appendChild(a);
    });
    return box;
  };
  var cs = document.getElementById("cad-steps");
  if (cs && window.CADENCE) window.CADENCE.steps.forEach(function (s) {
    cs.appendChild(el("li", {}, [el("span", { class: "hex", text: "0" + s.n }), el("h3", {}, [document.createTextNode(s.ru)]), el("p", { class: "small", lang: "en", text: s.name }), el("p", { class: "small", text: s.what })]));
  });
  var map = document.getElementById("map-list");
  if (map) {
    var last = null;
    C.lessons.forEach(function (l) {
      if (l.block !== last) {
        last = l.block;
        var b = C.blocks.filter(function (x) { return x.id === l.block; })[0];
        map.appendChild(el("li", { class: "block-title", style: "display:block;padding-bottom:6px", text: b.title + " · " + b.ru }));
      }
      var ieltsOnly = l.sat === "—";
      var live = l.status === "live";
      var title = live ? el("a", { href: "lesson.html?id=" + l.id, text: l.title }) : document.createTextNode(l.title);
      var dl = el("dl");
      [["Shared", l.shared], ["SAT", l.sat], ["IELTS", l.ielts], ["Speak", l.speak], ["Write", l.write]].forEach(function (r) {
        if (r[1] === "—") return;
        dl.appendChild(el("dt", { text: r[0] })); dl.appendChild(el("dd", { text: r[1] }));
      });
      map.appendChild(el("li", { class: ieltsOnly ? "ielts" : "both" }, [
        el("div", { class: "rail", "aria-hidden": "true" }, [el("span", { class: "dot s" }), el("span", { class: "link" }), el("span", { class: "dot i" })]),
        el("div", { class: "st" }, [
          el("span", { class: "label" }, [el("span", { text: l.id }), el("span", { class: "pill" + (live ? " live" : ""), text: live ? (done(l.id) ? "Demo · пройден" : "Demo · открыт") : "В плане" }),
            el("span", { text: ieltsOnly ? "IELTS only" : "SAT + IELTS" })]),
          el("h3", {}, [title]),
          el("span", { class: "thread", text: l.thread }),
          dl,
          live ? cadLinks(l.id) : null
        ])
      ]));
    });
  }

  var tb = document.getElementById("transfer");
  if (tb) {
    var name = { D: "Напрямую", P: "Частично", N: "Нет" };
    var head = el("tr", {}, [el("th", { scope: "col", text: "SAT domain" })].concat(C.transfer.cols.map(function (c) { return el("th", { scope: "col", text: c }); })));
    tb.appendChild(el("thead", {}, [head]));
    var body = el("tbody");
    C.transfer.rows.forEach(function (r) {
      body.appendChild(el("tr", {}, [el("th", { scope: "row", text: r[0] })].concat(r.slice(1).map(function (v) { return el("td", { class: v, text: name[v] }); }))));
    });
    tb.appendChild(body);
    var flat = [].concat.apply([], C.transfer.rows.map(function (r) { return r.slice(1); }));
    var cnt = function (v) { return flat.filter(function (x) { return x === v; }).length; };
    var sum = document.getElementById("transfer-sum");
    if (sum) sum.textContent = "Из " + flat.length + " пар: напрямую " + cnt("D") + ", частично " + cnt("P") + ", не переносится " + cnt("N") + ".";
  }

  var fill = function (id, rows) {
    var t = document.getElementById(id); if (!t) return;
    rows.forEach(function (r) { t.appendChild(el("tr", {}, r.map(function (c, i) { return el(i === 0 ? "th" : "td", i === 0 ? { scope: "row", text: c } : { text: c }); }))); });
  };
  fill("bridge", C.bridge);
  fill("fragments", C.fragments);

  var live = C.lessons.filter(function (l) { return l.status === "live"; }).length;
  var c = document.getElementById("count-live"); if (c) c.textContent = live + " из " + C.lessons.length;
  var th = document.getElementById("theme-ru"); if (th) th.textContent = C.themeRu;
})();
