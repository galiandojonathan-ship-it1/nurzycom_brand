// Hard words in test questions (2026-11-05). Words of the course vocabulary are underlined in every question, and each
// question can carry its own extra words (data/mockgloss.bin → add): words already in its text that a Russian-speaking
// B2 student would not know (chosen 2026-11-06 for every question; the question text itself is never changed). A tap
// shows the English meaning and the Russian equivalents. Data: vocab.bin (course words) and mockgloss.bin { words: { key: { w, pos, en, ru: [...], forms: [...] } },
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
  const WIDE = { one: new Map() };   // the question words of all tests, matched anywhere (homework: opt.wide)
  let ADD = {}, QSKIP = {}, OFF = new Set();   // OFF: course words never carded in the tests; QSKIP: per question (wrong sense there)

  // the usual English endings of a word, so «undermines», «undermined», «undermining» all find «undermine»
  function forms(w) {
    const out = new Set([w]), last = w.slice(-1), cons = (c) => /[bcdfghjklmnpqrstvwxz]/.test(c);
    out.add(w + "s"); out.add(w + "es"); out.add(w + "ed"); out.add(w + "ing"); out.add(w + "er"); out.add(w + "ly");
    if (last === "e") { out.add(w + "d"); out.add(w.slice(0, -1) + "ing"); if (/[aiu]te$/.test(w)) out.add(w.slice(0, -1) + "ion"); }   // illustrate → illustration; not verse → version
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
    // homework has no per-question word lists: the test words (rare, single-sense words chosen for B2 readers) are matched
    // anywhere there, single words of 5+ letters only, so short or common spellings never get a card; «word#PT…» entries carry
    // the sense of one question (surface, ground, shift) and stay there
    for (const [key, e] of Object.entries(W)) if (e.src === "q" && !key.includes("#")) for (const v of variants(e.w).concat(e.forms || []))
      if (!v.includes(" ") && v.length >= 5) for (const f of forms(v)) if (!WIDE.one.has(f) && !ONE.has(f)) WIDE.one.set(f, key);
    ADD = (extra && extra.add) || {}; QSKIP = (extra && extra.skip) || {}; OFF = new Set((extra && extra.off) || []);
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
  const WORD = /[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’]*(?:-[A-Za-zÀ-ÖØ-öø-ÿ]+)*/g;
  // A course word has one meaning; these rules keep its card off other uses of the same spelling (checked on all 12 tests,
  // 2026-11-06): «novel» (new) is not «a 1905 novel», «maintain» (claim) is not «maintains photographs», «long to» is not
  // «as long to complete». adj: only before a lowercase word; verb: only after a subject, a modal or «to» (or alone).
  const DET = new Set(["a", "an", "the", "this", "that", "these", "those", "his", "her", "its", "their", "our", "my", "your", "no", "some", "any", "each", "every", "one", "world", "chess", "union", "nature", "currency"]);
  const FUNC = new Set(["and", "or", "but", "is", "was", "are", "were", "that", "which", "who", "by", "of", "in", "on", "at", "to", "for", "from", "with", "as", "than", "has", "had", "have"]);
  const SUBJ = new Set(["to", "would", "could", "will", "can", "may", "might", "should", "must", "did", "do", "does", "not", "also", "often", "who", "they", "we", "i", "you", "he", "she", "it", "and", "or", "then", "historians", "critics", "scholars"]);
  const RULES = {
    "novel": { adj: true }, "grave": { adj: true },
    "champion": { verb: true }, "coin": { verb: true }, "moderate": { verb: true }, "address": { verb: true },
    "trace": { notAfter: DET, notBefore: ["of", "amount", "amounts", "element", "elements", "quantities", "quantity", "minerals", "metals"] },
    // checked on all 695 Verbal homework questions (2026-11-08): the card's sense only
    "contemporary": { noun: true }, "politic": { notForms: ["politics"] }, "blend": { before: ["in", "into"] }, "breed": { verb: true }, "stage": { forms: ["staging", "stagings"] }, "reserve": { forms: ["reserved"] }, "lend": { forms: ["lend", "lends"] },
    "long to": { notAfter: new Set(["as", "how", "so", "too", "no", "any", "very", "much", "take", "takes", "took"]), notForms: ["longer", "longest"] },
    "instrumental": { before: ["in"] }, "qualify": { notBefore: ["as", "for"] }, "afford": { notBefore: ["to"] },
    "profit from": { notAfter: new Set([...DET, "in"]) }, "contend / maintain": { maintainThat: true },
  };
  function allowed(key, toks, i, n, text, course) {
    const t = toks[i], prev = toks[i - 1], next = toks[i + n];
    // a capital letter in mid-sentence is a title or a name: The House of Mirth, Gettysburg Address, The Canon of Medicine
    if (course && /[A-Z]/.test(text[t.s]) && /[^\s.!?"“(]\s*$/.test(text.slice(0, t.s))) return false;
    const r = RULES[key]; if (!r) return true;
    const pw = prev && text.slice(prev.e, t.s).trim() === "" ? prev.lw : null;   // the word right before (same sentence part)
    const nw = next && text.slice(toks[i + n - 1].e, next.s).trim() === "" ? next.lw : null;
    if (r.forms && !r.forms.includes(t.lw)) return false;
    if (r.notForms && r.notForms.includes(t.lw)) return false;
    if (r.notAfter && pw && r.notAfter.has(pw)) return false;
    if (r.notBefore && nw && r.notBefore.includes(nw)) return false;
    if (r.before && !(nw && r.before.includes(nw))) return false;
    if (r.adj && /'s$|’s$/i.test(text.slice(t.s, toks[i + n - 1].e + 2).trim())) return false;   // the novel's events
    if (r.adj && !(nw && /^[a-z]/.test(text[next.s]) && !FUNC.has(nw) && !(pw && /^\d{4}$/.test(pw)))) return false;
    if (r.verb && pw && (DET.has(pw) || !SUBJ.has(pw))) return false;
    if (r.noun && next && /^[\s“”"‘’'-]*$/.test(text.slice(toks[i + n - 1].e, next.s)) && !FUNC.has(next.lw)) return false;   // «contemporary styles», «Contemporary Potawatomi» are the adjective
    if (r.maintainThat && /^maintain/.test(t.lw) && nw !== "that") return false;
    return true;
  }
  // underlines the first use of each word in the given elements (in reading order) and returns the keys found
  function apply(els, opt = {}) {
    if (!api.on) return [];
    const extra = local(ADD[opt.key]);
    const seen = new Set(opt.seen || []), found = [];
    const look = (lw, toks, i, text) => {   // → [key, word count] for the longest allowed match starting at token i
      const ok = (key, n) => !OFF.has(key) && !(QSKIP[opt.key] || []).includes(key) && allowed(key, toks, i, n, text, !!W[key] && (W[key].src === "course" || !!opt.wide) && !extra.one.has(lw));
      const cands = [...(extra.many.get(lw) || []), ...(MANY.get(lw) || [])];
      for (const c of cands.sort((a, b) => b.toks.length - a.toks.length))
        if (c.toks.every((t, j) => toks[i + 1 + j] && toks[i + 1 + j].lw === t) && ok(c.key, c.toks.length + 1)) return [c.key, c.toks.length + 1];
      const k = extra.one.get(lw) || ONE.get(lw) || (opt.wide && WIDE.one.get(lw)); return k && ok(k, 1) ? [k, 1] : null;
    };
    for (const root of [].concat(els).filter(Boolean)) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() && !(n.parentElement && n.parentElement.closest(NO)) ? 1 : 2) });
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const text = node.nodeValue, toks = [];
        for (const m of text.matchAll(WORD)) {   // a hyphenated word counts whole, and its parts count too (resin-filled → resin)
          const lw = m[0].toLowerCase().replace(/’/g, "'").replace(/'s$/, "");
          toks.push({ s: m.index, e: m.index + m[0].length, lw });
          if (lw.includes("-") && !(ONE.has(lw) || extra.one.has(lw))) {
            toks.pop(); let at = m.index;
            for (const part of m[0].split("-")) { toks.push({ s: at, e: at + part.length, lw: part.toLowerCase() }); at += part.length + 1; }
          }
        }
        const hits = [];
        for (let i = 0; i < toks.length; i++) {
          const m = look(toks[i].lw, toks, i, text); if (!m) continue;
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
  const POS = { v: "глагол", verb: "глагол", n: "сущ.", noun: "сущ.", adj: "прил.", adjective: "прил.", adv: "нареч.", adverb: "нареч.", phr: "выражение", phrase: "выражение", prep: "предлог", conj: "союз" };
  function show(el) {
    const e = W[el.dataset.k]; if (!e) return;
    if (!pop) { pop = document.createElement("div"); pop.className = "gpop hidden"; pop.setAttribute("role", "dialog"); document.body.appendChild(pop); }
    if (cur) cur.classList.remove("on"); cur = el; el.classList.add("on");
    const pos = POS[String(e.pos).toLowerCase().replace(/\.$/, "")] || e.pos;   // «v» read like a lesson code: say it in Russian
    pop.innerHTML = `<span class="label">${e.src === "course" ? "Словарь курса" : "Слово вопроса"}${pos ? " · " + esc(pos) : ""}</span><b lang="en">${esc(e.w)}</b>`
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
