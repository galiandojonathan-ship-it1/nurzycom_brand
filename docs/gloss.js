// Hard words in test questions (2026-11-05). Words of the course vocabulary are underlined in every question; an original
// nurzycom question of medium or hard level may also carry its own extra words (data/mockgloss.bin → add), and a College
// Board question never gets a word that is not in the course vocabulary. A tap shows the English meaning and the Russian
// equivalents. Data: vocab.bin (course words) and mockgloss.bin { words: { key: { w, pos, en, ru: [...], forms: [...] } },
// add: { "PT1.rw.m1.5": ["key", ...] } }; mockgloss entries complete the course words (definition, more translations).
// GLOSS.ready → GLOSS.apply(elements, { key, own }) underlines the first use of each word inside the elements.
(function () {
  "use strict";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // groups of the course vocabulary that are meant for any text: lesson words, review, question words. Lesson A's old meanings
  // of familiar words (still, want, fond) and its pronouns and verb forms belong to archaic passages only, Math decks are terms.
  const SKIP = new Set(["Местоимения", "Формы глаголов", "Короткие слова", "Старые значения"]);
  const W = {};                 // key → { w, pos, en, ru: [], src: "course" | "q" }
  const ONE = new Map();        // one-word surface form → key
  const MANY = new Map();       // first word of a phrase → [{ toks, key }]
  let ADD = {};

  // the usual English endings of a word, so «undermines», «undermined», «undermining» all find «undermine»
  function forms(w) {
    const out = new Set([w]), last = w.slice(-1), cons = (c) => /[bcdfghjklmnpqrstvwxz]/.test(c);
    out.add(w + "s"); out.add(w + "es"); out.add(w + "ed"); out.add(w + "ing"); out.add(w + "er"); out.add(w + "ly");
    if (last === "e") { out.add(w + "d"); out.add(w.slice(0, -1) + "ing"); out.add(w.slice(0, -1) + "ion"); }
    if (last === "y" && cons(w.slice(-2, -1))) { out.add(w.slice(0, -1) + "ies"); out.add(w.slice(0, -1) + "ied"); out.add(w.slice(0, -1) + "ily"); }
    if (/[^aeiou][aeiou][bdgmnprt]$/.test(w) && w.length <= 7) { out.add(w + last + "ed"); out.add(w + last + "ing"); }
    if (/le$/.test(w)) out.add(w.slice(0, -1) + "y");
    return out;
  }
  // a course entry such as «(to) undermine», «devoid of», «adverse / averse» gives one or more plain forms
  const variants = (en) => String(en).toLowerCase().replace(/\([^)]*\)/g, " ").split(/\s*[\/;,]\s*/)
    .map((s) => s.replace(/^to\s+/, "").replace(/[^a-z' -]/g, " ").replace(/\s+/g, " ").trim()).filter((s) => s.length >= 3);
  function index(key, entry, extraForms) {
    for (const v of variants(entry.w).concat(extraForms || [])) {
      const toks = v.split(" ");
      if (toks.length === 1) { if (v.length < 4) continue; for (const f of forms(v)) if (!ONE.has(f)) ONE.set(f, key); }
      else { const [h, ...rest] = toks; for (const f of forms(h)) { const l = MANY.get(f) || []; l.push({ toks: rest, key }); MANY.set(f, l); } }
    }
  }
  const ruList = (s) => (Array.isArray(s) ? s : String(s || "").split(/\s*[,;]\s*/)).map((x) => x.trim()).filter(Boolean);
  function setup(vocab, extra) {
    const E = (extra && extra.words) || {};
    ((vocab && vocab.lessons) || []).filter((l) => l.tag[0] === "V").forEach((l) => l.groups.forEach((g) => {
      if (SKIP.has(g.name)) return;
      g.items.forEach((it) => {
        const key = String(it.en).toLowerCase().trim(); if (W[key]) return;
        const x = E[key] || {};
        const ru = [...new Set(ruList(it.ru).concat(ruList(x.ru)))];
        W[key] = { w: it.en, pos: x.pos || it.pos || "", en: x.en || it.def || "", ru, src: "course" };
        index(key, W[key], x.forms);
      });
    }));
    for (const [key, x] of Object.entries(E)) if (!W[key]) W[key] = { w: x.w || key, pos: x.pos || "", en: x.en || "", ru: ruList(x.ru), forms: x.forms || [], src: "q" };
    ADD = (extra && extra.add) || {};
  }
  // the extra words of one question, matched only inside it
  function local(keys) {
    const one = new Map(), many = new Map();
    for (const key of keys || []) { const e = W[key]; if (!e) continue;
      for (const v of variants(e.w).concat(e.forms || [])) { const toks = v.split(" ");
        if (toks.length === 1) { for (const f of forms(v)) one.set(f, key); }
        else { const [h, ...rest] = toks; for (const f of forms(h)) { const l = many.get(f) || []; l.push({ toks: rest, key }); many.set(f, l); } } } }
    return { one, many };
  }

  const NO = "math,svg,script,style,code,textarea,input,select,.vw,mjx-container,.MathJax,.katex,[data-nogloss]";
  const WORD = /[A-Za-z][A-Za-z'’]*(?:-[A-Za-z]+)*/g;
  // underlines the first use of each word in the given elements (in reading order) and returns the keys found
  function apply(els, opt = {}) {
    if (!api.on) return [];
    const own = !!opt.own, extra = own ? local(ADD[opt.key]) : { one: new Map(), many: new Map() };
    const seen = new Set(opt.seen || []), found = [];
    const look = (lw, toks, i) => {   // → [key, word count] for the longest match starting at token i
      const cands = [...(extra.many.get(lw) || []), ...(MANY.get(lw) || [])];
      for (const c of cands.sort((a, b) => b.toks.length - a.toks.length))
        if (c.toks.every((t, j) => toks[i + 1 + j] && toks[i + 1 + j].lw === t)) return [c.key, c.toks.length + 1];
      const k = extra.one.get(lw) || ONE.get(lw); return k ? [k, 1] : null;
    };
    for (const root of [].concat(els).filter(Boolean)) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() && !(n.parentElement && n.parentElement.closest(NO)) ? 1 : 2) });
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const text = node.nodeValue, toks = [...text.matchAll(WORD)].map((m) => ({ s: m.index, e: m.index + m[0].length, lw: m[0].toLowerCase().replace(/’/g, "'").replace(/'s$/, "") }));
        const hits = [];
        for (let i = 0; i < toks.length; i++) {
          const m = look(toks[i].lw, toks, i); if (!m) continue;
          const [key, n] = m; if (seen.has(key)) { i += n - 1; continue; }
          seen.add(key); found.push(key); hits.push({ s: toks[i].s, e: toks[i + n - 1].e, key }); i += n - 1;
        }
        if (!hits.length) continue;
        const frag = document.createDocumentFragment(); let at = 0;
        for (const h of hits) {
          if (h.s > at) frag.appendChild(document.createTextNode(text.slice(at, h.s)));
          const sp = document.createElement("span"); sp.className = "vw gw"; sp.dataset.k = h.key; sp.textContent = text.slice(h.s, h.e);
          if (!node.parentElement.closest("button")) { sp.tabIndex = 0; sp.setAttribute("role", "button"); }
          frag.appendChild(sp); at = h.e;
        }
        if (at < text.length) frag.appendChild(document.createTextNode(text.slice(at)));
        node.parentNode.replaceChild(frag, node);
      }
    }
    return found;
  }

  // ---- the card with the meaning
  let pop = null, cur = null;
  function show(el) {
    const e = W[el.dataset.k]; if (!e) return;
    if (!pop) { pop = document.createElement("div"); pop.className = "gpop hidden"; pop.setAttribute("role", "dialog"); document.body.appendChild(pop); }
    if (cur) cur.classList.remove("on"); cur = el; el.classList.add("on");
    pop.innerHTML = `<span class="label">${e.src === "course" ? "Словарь курса" : "Слово вопроса"}${e.pos ? " · " + esc(e.pos) : ""}</span><b lang="en">${esc(e.w)}</b>`
      + (e.en ? `<span class="gpop-en" lang="en">${esc(e.en)}</span>` : "") + (e.ru.length ? `<span class="gpop-ru">${esc(e.ru.join(", "))}</span>` : "");
    pop.setAttribute("aria-label", e.w);
    pop.classList.remove("hidden"); place();
  }
  // next to the word: below it, or above when there is no room; it follows the word while the page scrolls
  function place() {
    if (!cur || !pop) return;
    const r = cur.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || !cur.isConnected) return hide();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    pop.style.left = Math.max(8, Math.min(innerWidth - pw - 8, r.left + r.width / 2 - pw / 2)) + "px";
    pop.style.top = (r.bottom + 8 + ph <= innerHeight - 8 ? r.bottom + 8 : Math.max(8, r.top - ph - 8)) + "px";
  }
  function hide() { if (pop) pop.classList.add("hidden"); if (cur) cur.classList.remove("on"); cur = null; }
  // capture phase: a tap on a word inside an answer option shows the meaning and does not choose the option
  document.addEventListener("click", (ev) => {
    const el = ev.target.closest && ev.target.closest(".gw");
    if (el) { ev.preventDefault(); ev.stopPropagation(); if (cur === el) hide(); else show(el); return; }
    if (pop && !pop.contains(ev.target)) hide();
  }, true);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") return hide();
    const el = document.activeElement; if ((ev.key === "Enter" || ev.key === " ") && el && el.classList && el.classList.contains("gw")) { ev.preventDefault(); ev.stopPropagation(); show(el); }
  }, true);
  addEventListener("scroll", place, { passive: true, capture: true }); addEventListener("resize", place);

  const PREF = "mk_gloss";
  const api = {
    get on() { try { return localStorage.getItem(PREF) !== "0"; } catch (e) { return true; } },
    set on(v) { try { localStorage.setItem(PREF, v ? "1" : "0"); } catch (e) { /* private mode */ } },
    apply, hide, entry: (k) => W[k],
    ready: null,
  };
  api.ready = (window.SITE ? Promise.all([SITE.json("vocab").catch(() => null), SITE.json("mockgloss").catch(() => null)]) : Promise.resolve([null, null]))
    .then(([v, g]) => { setup(v, g); return api; });
  window.GLOSS = api;
})();
