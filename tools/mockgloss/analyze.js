// Same matching as docs/gloss.js, run over the decrypted mock tests in ./private (node analyze.js [mockgloss.json]).
// Prints: course words found and what their cards lack; original medium/hard questions with no course word.
const fs = require('fs');
const P = (process.env.PRIV || __dirname + '/private') + '/';
const mocks = JSON.parse(fs.readFileSync(P + 'mocks.json')), vocab = JSON.parse(fs.readFileSync(P + 'vocab.json')), bundles = JSON.parse(fs.readFileSync(P + 'bundles.json'));
const extra = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2])) : { words: {}, add: {} };
const SKIP = new Set(['Местоимения', 'Формы глаголов', 'Короткие слова', 'Старые значения']);
function forms(w) {
  const out = new Set([w]), last = w.slice(-1), cons = (c) => /[bcdfghjklmnpqrstvwxz]/.test(c);
  ['s', 'es', 'ed', 'ing', 'er', 'ly'].forEach((x) => out.add(w + x));
  if (last === 'e') { out.add(w + 'd'); out.add(w.slice(0, -1) + 'ing'); out.add(w.slice(0, -1) + 'ion'); }
  if (last === 'y' && cons(w.slice(-2, -1))) { out.add(w.slice(0, -1) + 'ies'); out.add(w.slice(0, -1) + 'ied'); out.add(w.slice(0, -1) + 'ily'); }
  if (/[^aeiou][aeiou][bdgmnprt]$/.test(w) && w.length <= 7) { out.add(w + last + 'ed'); out.add(w + last + 'ing'); }
  if (/le$/.test(w)) out.add(w.slice(0, -1) + 'y');
  return out;
}
const variants = (en) => String(en).toLowerCase().replace(/\([^)]*\)/g, ' ').split(/\s*[\/;,]\s*/).map((s) => s.replace(/^to\s+/, '').replace(/[^a-z' -]/g, ' ').replace(/\s+/g, ' ').trim()).filter((s) => s.length >= 3);
const ruList = (s) => (Array.isArray(s) ? s : String(s || '').split(/\s*[,;]\s*/)).map((x) => x.trim()).filter(Boolean);
const W = {}, ONE = new Map(), MANY = new Map();
function index(key, w, more, one = ONE, many = MANY) {
  for (const v of variants(w).concat(more || [])) { const t = v.split(' ');
    if (t.length === 1) { if (v.length < 4) continue; for (const f of forms(v)) if (!one.has(f)) one.set(f, key); }
    else { const [h, ...r] = t; for (const f of forms(h)) { const l = many.get(f) || []; l.push({ toks: r, key }); many.set(f, l); } } }
}
vocab.lessons.filter((l) => l.tag[0] === 'V').forEach((l) => l.groups.forEach((g) => { if (SKIP.has(g.name)) return; g.items.forEach((it) => {
  const key = String(it.en).toLowerCase().trim(); if (W[key]) return; const x = extra.words[key] || {};
  W[key] = { w: it.en, pos: x.pos || it.pos || '', en: x.en || it.def || '', ru: [...new Set(ruList(it.ru).concat(ruList(x.ru)))], lesson: l.tag, group: g.name, n: 0 };
  index(key, it.en, x.forms); }); }));
const text = (h) => String(h || '').replace(/<(math|svg)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ');
function hits(parts, one, many) {
  const seen = new Set(), out = [];
  for (const s of parts) { const toks = [...text(s).matchAll(/[A-Za-z][A-Za-z'’]*(?:-[A-Za-z]+)*/g)].map((m) => m[0].toLowerCase().replace(/’/g, "'").replace(/'s$/, ''));
    for (let i = 0; i < toks.length; i++) { let m = null;
      for (const c of [...(many.get(toks[i]) || [])].sort((a, b) => b.toks.length - a.toks.length)) if (c.toks.every((t, j) => toks[i + 1 + j] === t)) { m = [c.key, c.toks.length + 1]; break; }
      if (!m && one.get(toks[i])) m = [one.get(toks[i]), 1];
      if (m) { if (!seen.has(m[0])) { seen.add(m[0]); out.push([m[0], toks.slice(i, i + m[1]).join(' ')]); } i += m[1] - 1; } } }
  return out;
}
const rows = [];
for (const m of mocks.mocks) for (const s of m.sections) for (const [mod, qs] of Object.entries(bundles[s.b].mods)) for (const q of qs) {
  const key = `${m.id}.${s.k}.${mod}.${q.n}`, parts = [q.stim, q.stem, ...(q.opts || [])];
  const h = hits(parts, ONE, MANY); h.forEach(([k]) => W[k].n++);
  const loc = { one: new Map(), many: new Map() }; for (const k of extra.add[key] || []) { const e = extra.words[k]; if (e) index(k, e.w || k, e.forms, loc.one, loc.many); }
  const x = q.own ? hits(parts, loc.one, loc.many) : [];
  rows.push({ key, sec: s.k, own: !!q.own, d: q.d, hits: h.map((y) => y[1]), extra: x.map((y) => y[1]), need: !!q.own && /^[MH]/i.test(q.d || '') && !h.length && !x.length, text: text(parts.join(' ')).replace(/\s+/g, ' ').trim() });
}
fs.writeFileSync(P + 'rows.json', JSON.stringify(rows, null, 1));
const used = Object.entries(W).filter(([, e]) => e.n);
const weak = used.filter(([, e]) => !e.en || e.ru.length < 2);
console.log(`questions ${rows.length} (rw ${rows.filter((r) => r.sec === 'rw').length}) · with a course word ${rows.filter((r) => r.hits.length).length}`);
console.log(`course words used ${used.length} · card incomplete (no English meaning or < 2 Russian) ${weak.length}`);
console.log(`original medium/hard questions with no word yet: ${rows.filter((r) => r.need).length} (rw ${rows.filter((r) => r.need && r.sec === 'rw').length}, math ${rows.filter((r) => r.need && r.sec === 'math').length})`);
fs.writeFileSync(P + 'weak.json', JSON.stringify(weak.map(([k, e]) => ({ key: k, w: e.w, pos: e.pos, en: e.en, ru: e.ru, n: e.n })), null, 1));
fs.writeFileSync(P + 'need.json', JSON.stringify(rows.filter((r) => r.need), null, 1));
