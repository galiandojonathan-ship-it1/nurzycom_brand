// Dictionary on selection (2026-11-16, Nurassyl: «download a dictionary and make it so whenever I highlight the word, its meaning
// appears immediately… allow students to use it on their own, but still highlight the course vocabulary»). Select a word or a
// short phrase in a passage, a question or a text, and a card shows its meaning at once:
//  · a course or test word (gloss.js) keeps its own card «Словарь курса», with the course definition and Russian equivalents;
//  · any other word comes from the site dictionary: English Wiktionary (CC BY-SA 4.0, via kaikki.org), about 2 senses per part
//    of speech and up to 5 Russian equivalents, built by tools/dict/build_dict.py. A dictionary does not know the context: it shows
//    the most common senses, which is why words marked in lessons still get a checked definition in the deck «VL».
// The data: docs/data/dict.json names the build, and only the small two-letter part a word needs loads (about 30 KB), then stays cached.
// Answer options in the workbook review are selectable text. Course words still have their own card.
(function () {
  "use strict";
  if (window.DICT) return;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const POSN = { n: "сущ.", v: "глаг.", adj: "прил.", adv: "нареч.", phr: "выражение", pron: "местоим.", prep: "предлог", conj: "союз", det: "определитель" };
  let data = null, pop = null, timer = 0, lastKey = "";

  // data/dict.json names the build; each two-letter part (q/dict/<build>/in.json.gz) loads when a word needs it, then stays cached
  let meta = null; const parts = {};
  const pre = (w) => (w + "__").slice(0, 2).replace(/[^a-z]/g, "_");
  function part(k) {
    return parts[k] || (parts[k] = (meta ? Promise.resolve(meta) : fetch("data/dict.json", { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error("dict " + r.status); return r.json(); }).then((m) => (meta = m)))
      .then((m) => (m.parts.includes(k) ? fetch(`${m.dir}/${k}.json.gz`).then((r) => { if (!r.ok) throw new Error("dict part " + r.status); return r.arrayBuffer(); })
        .then((b) => { const u = new Uint8Array(b); if (u[0] !== 0x1f || u[1] !== 0x8b) return JSON.parse(new TextDecoder().decode(u));   // a server may unpack it on the way
          return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).json(); }) : { w: {}, f: {} }))
      .catch((e) => { delete parts[k]; throw e; }));
  }
  async function load(w) {   // the parts a word and its possible base forms need
    const first = await part(pre(w)), irr = first.f[w];
    data = { w: {}, f: {} };
    const need = new Set(lemmas(w, irr).map(pre));
    for (const k of need) { const p = await part(k); Object.assign(data.w, p.w); Object.assign(data.f, p.f); }
    return data;
  }
  // the dictionary keeps base forms: «interspersing» → «intersperse», «studies» → «study», «running» → «run», «went» → «go»
  function lemmas(w, irr) {
    const out = [w], add = (x) => { if (x && x.length > 1 && !out.includes(x)) out.push(x); };
    add(irr || (data && data.f[w]));
    const d2 = (s) => (s.length > 2 && s[s.length - 1] === s[s.length - 2] ? s.slice(0, -1) : "");
    if (/ies$/.test(w)) add(w.slice(0, -3) + "y");
    if (/ied$/.test(w)) add(w.slice(0, -3) + "y");
    if (/es$/.test(w)) add(w.slice(0, -2));
    if (/s$/.test(w) && !/ss$/.test(w)) add(w.slice(0, -1));
    if (/ed$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -1)); add(d2(w.slice(0, -2))); }
    if (/ing$/.test(w)) { add(w.slice(0, -3)); add(w.slice(0, -3) + "e"); add(d2(w.slice(0, -3))); }
    if (/ly$/.test(w)) { add(w.slice(0, -2)); if (/ily$/.test(w)) add(w.slice(0, -3) + "y"); }
    if (/(er|est)$/.test(w)) { const b = w.replace(/(er|est)$/, ""); add(b); add(b + "e"); add(d2(b)); if (/i$/.test(b)) add(b.slice(0, -1) + "y"); }
    return out;
  }
  function find(text) {
    const w = text.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z' -]/g, " ").replace(/\s+/g, " ").trim();
    if (!w || !data) return null;
    for (const c of lemmas(w)) if (data.w[c]) return { w: c, e: data.w[c] };
    return null;
  }

  function card(html, rect) {
    if (!pop) { pop = document.createElement("div"); pop.className = "gpop dpop hidden"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-live", "polite"); document.body.appendChild(pop); }
    pop.innerHTML = html; pop.classList.remove("hidden");
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    pop.style.left = Math.max(8, Math.min(innerWidth - pw - 8, rect.left + rect.width / 2 - pw / 2)) + "px";
    pop.style.top = (rect.bottom + 10 + ph <= innerHeight - 8 ? rect.bottom + 10 : Math.max(8, rect.top - ph - 10)) + "px";
  }
  function hide() { if (pop) pop.classList.add("hidden"); lastKey = ""; }
  async function show(text, rect) {
    const t = String(text || "").replace(/\s+/g, " ").trim(); if (!t || !rect) return;
    // 1. a course or test word keeps its own card
    if (window.GLOSS) { try { await GLOSS.ready; } catch (e) { /* no course data */ } const g = GLOSS.find && GLOSS.find(t);
      if (g) return card(`<span class="label">Словарь курса</span><b lang="en">${esc(g.w)}</b>${g.en ? `<span class="gpop-en" lang="en">${esc(g.en)}</span>` : ""}${g.ru && g.ru.length ? `<span class="gpop-ru">${esc(g.ru.join(", "))}</span>` : ""}`, rect); }
    // 2. the site dictionary
    const wn = t.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z' -]/g, " ").replace(/\s+/g, " ").trim();
    if (!wn) return;
    const slow = setTimeout(() => card(`<span class="label">Словарь</span><b lang="en">${esc(t)}</b><span class="gpop-en">Загружаю словарь…</span>`, rect), 250);
    try { await load(wn); clearTimeout(slow); } catch (e) { clearTimeout(slow); return card(`<span class="label">Словарь</span><b lang="en">${esc(t)}</b><span class="gpop-en">Словарь не загрузился. Проверьте интернет.</span>`, rect); }
    let f = find(wn), via = "", also = null;
    // a form entry («reinvigorated: simple past and past participle of reinvigorate») also shows its base word's meaning;
    // when the entry has nothing else, the base word becomes the card
    const FORM = (g) => / of ([a-z'-]+)\W*$/i.test(g) && /\b(past|participle|plural|singular|form|comparative|superlative|present)\b/i.test(g);
    const formOf = f && (f.e.p.flatMap(([, gs]) => gs).find(FORM) || "").match(/ of ([a-z'-]+)\W*$/i);
    const base = f && ((formOf && formOf[1].toLowerCase()) || data.f[f.w]);
    if (base && base !== f.w) { try { await load(base); const b = find(base);
      if (b) { if (f.e.p.every(([, gs]) => gs.every(FORM))) { via = f.w; f = b; } else also = b; } } catch (e) { /* keep the form entry */ } }
    if (!f) return card(`<span class="label">Словарь</span><b lang="en">${esc(t)}</b><span class="gpop-en">Этого слова нет в словаре сайта.</span>`, rect);
    const senses = f.e.p.map(([pos, gs]) => `<span class="dpop-pos">${esc(POSN[pos] || pos)}</span><ol>${gs.map((g) => `<li lang="en">${esc(g)}</li>`).join("")}</ol>`).join("");
    const more = also ? `<span class="dpop-pos">${esc(also.w)}</span><ol>${also.e.p.flatMap(([, gs]) => gs).filter((g) => !FORM(g)).slice(0, 2).map((g) => `<li lang="en">${esc(g)}</li>`).join("")}</ol>${also.e.r.length && !f.e.r.length ? `<span class="gpop-ru">${esc(also.e.r.join(", "))}</span>` : ""}` : "";
    card(`<span class="label">Словарь · Wiktionary</span><b lang="en">${esc(f.w)}</b>${via ? `<span class="gpop-en">форма слова: ${esc(via)} → ${esc(f.w)}</span>` : ""}${senses}${more}${f.e.r.length ? `<span class="gpop-ru">${esc(f.e.r.join(", "))}</span>` : ""}<small class="dpop-src">Wiktionary, CC BY-SA 4.0 · значение может зависеть от контекста</small>`, rect);
  }

  // a selection of 1–4 words inside the page's text (not in fields, the menu, the lesson bar or a card)
  function onSelect() {
    const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const text = sel.toString().replace(/\s+/g, " ").trim();
    if (text.length < 2 || text.length > 48 || text.split(" ").length > 4 || !/[a-z]/i.test(text) || /[а-яё]/i.test(text)) return;
    const r = sel.getRangeAt(0), host = r.commonAncestorContainer.nodeType === 1 ? r.commonAncestorContainer : r.commonAncestorContainer.parentElement;
    if (!host || host.closest("input,textarea,nav,header,footer,.ls-bar,.ls-pop,.ls-toast,.gpop,.lb-tools,.cr-tiles")) return;
    const key = text + "|" + Math.round(r.getBoundingClientRect().top); if (key === lastKey) return; lastKey = key;
    show(text, r.getBoundingClientRect());
  }
  document.addEventListener("selectionchange", () => { clearTimeout(timer); timer = setTimeout(onSelect, 280); });
  document.addEventListener("pointerdown", (e) => { if (pop && !pop.contains(e.target)) hide(); }, true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && pop && !pop.classList.contains("hidden")) hide(); });
  addEventListener("scroll", hide, { passive: true, capture: true });
  const css = `.dpop{z-index:70;max-width:min(380px,calc(100vw - 16px))}.dpop ol{margin:4px 0 6px;padding-left:18px}.dpop li{margin:2px 0;font-size:14px;line-height:1.4}
.dpop-pos{display:block;margin-top:6px;font:500 12px var(--sans);letter-spacing:.04em;text-transform:uppercase;opacity:.75}.dpop-src{display:block;margin-top:6px;font-size:11px;opacity:.65}`;
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: css }));
  window.DICT = { show, hide, lookup: async (t) => { const w = String(t).toLowerCase().trim(); await load(w); return find(w); } };
})();
