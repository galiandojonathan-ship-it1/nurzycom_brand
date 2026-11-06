// Google Form answers, shared by the teacher page and the cabinet: CSV reading, dates, one row per result, and student
// names merged (2026-11-06, Nurassyl: «Шер Ж. and Sher Zh. is the same person»).
// Students type their name by hand, in Cyrillic or Latin, with or without dots. Every spelling is romanized; spellings with
// the same first name and the same surname initial are one student, shown under one romanized name (the most frequent
// spelling; a Cyrillic one is romanized). A bare first name («Sherniyaz») joins the only student whose first name starts
// the same way. The teacher can split or join spellings by hand (aliases: { spelling: key of another student or "!" }).
(function () {
  "use strict";
  const MAP = { а: "a", ә: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y", к: "k", қ: "k", л: "l", м: "m",
    н: "n", ң: "n", о: "o", ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ұ: "u", ү: "u", ф: "f", х: "kh", һ: "h", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
    ъ: "", ы: "y", і: "i", ь: "", э: "e", ю: "yu", я: "ya" };
  const clean = (s) => String(s || "").normalize("NFC").replace(/[.,_]+/g, " ").replace(/\s+/g, " ").trim();
  const isCyr = (s) => /[а-яёәғқңөұүһі]/i.test(s);
  function roman(s) {   // «Шер. Ж.» → «Sher Zh»
    return clean(s).split(" ").map((w) => { const r = [...w.toLowerCase()].map((c) => (c in MAP ? MAP[c] : c)).join(""); return r.charAt(0).toUpperCase() + r.slice(1); }).join(" ");
  }
  // spelling-proof skeleton of a word: kh/h, y/i/j and doubled letters count as the same
  const skel = (w) => w.toLowerCase().replace(/[^a-z]/g, "").replace(/kh/g, "h").replace(/[yj]/g, "i").replace(/(.)\1+/g, "$1");
  function parts(s) { const w = roman(s).split(" ").filter(Boolean); return { first: skel(w[0] || ""), init: w[1] ? skel(w[1]).charAt(0) : "" }; }
  const key = (s) => { const p = parts(s); return p.first ? `${p.first}|${p.init}` : ""; };

  // spellings → { spelling: { key, name } } and groups [{ key, name, spellings: { spelling: count } }]
  function group(counts, aliases) {
    const A = aliases || {}, G = {};
    const add = (k, sp, n) => { (G[k] = G[k] || { key: k, spellings: {} }).spellings[sp] = (G[k].spellings[sp] || 0) + n; };
    const bare = [];
    for (const [sp, n] of Object.entries(counts)) {
      if (A[sp] && A[sp] !== "!") { add(A[sp], sp, n); continue; }
      const k = A[sp] === "!" ? `!${clean(sp).toLowerCase()}` : key(sp); if (!k) continue;
      if (A[sp] !== "!" && k.endsWith("|")) bare.push([sp, n, k]); else add(k, sp, n);
    }
    for (const [sp, n, k] of bare) {   // a first name alone: the one student whose first name starts the same way
      const f = k.slice(0, -1), hit = Object.keys(G).filter((g) => !g.startsWith("!") && f.length >= 3 && (g.startsWith(f) || f.startsWith(g.split("|")[0])) && g.split("|")[0].length >= 3);
      add(hit.length === 1 ? hit[0] : k, sp, n);
    }
    const out = {}, groups = Object.values(G).map((g) => {
      const sp = Object.entries(g.spellings).sort((a, b) => b[1] - a[1] || isCyr(a[0]) - isCyr(b[0]) || b[0].length - a[0].length);
      g.name = roman(sp[0][0]); sp.forEach(([s]) => (out[s] = { key: g.key, name: g.name })); return g;
    });
    return { of: out, groups: groups.sort((a, b) => a.name.localeCompare(b.name)) };
  }
  // ---------- CSV (moved here from teacher.js)
  function parseCSV(text) {
    const rows = []; let row = [], f = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
      else f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim()));
  }
  // Columns by header name; if renamed, by what the values look like.
  const NAMES = { ts: /^(timestamp|отметка времени|время отправки)/i, student: /^(student|ученик|имя)/i, lesson: /^(lesson|урок)/i, part: /^(part|часть)/i,
    answers: /^(answers|ответы)/i, score: /^(score|счёт|счет|результат)/i, wrong: /^(wrong|ошибки)/i, seconds: /^(seconds|секунды|время)$/i, attempt: /^(attempt|попытка)/i };
  function columns(head, body) {
    const col = {};
    Object.entries(NAMES).forEach(([k, re]) => { const i = head.findIndex((h) => re.test(h.trim())); if (i >= 0) col[k] = i; });
    const sample = body.slice(0, 50), used = new Set(Object.values(col));
    const guess = (k, test) => { if (col[k] !== undefined) return; for (let i = 0; i < head.length; i++) if (!used.has(i) && sample.length && sample.filter((r) => test(r[i] || "")).length >= sample.length * 0.8) { col[k] = i; used.add(i); return; } };
    guess("ts", (v) => /\d{1,4}[./-]\d{1,2}[./-]\d{2,4}/.test(v)); guess("lesson", (v) => /^([VMXTDUA]\d\d|PT\d\d?|MD|VA)$/.test(v.trim())); guess("score", (v) => /^\d+\/\d+$/.test(v.trim()));
    guess("answers", (v) => /^\d+:/.test(v.trim())); guess("part", (v) => /·|^p\d/.test(v)); guess("attempt", (v) => /^\d{1,2}$/.test(v.trim()));
    guess("seconds", (v) => /^\d+$/.test(v.trim())); guess("wrong", (v) => /^[\d,]*$/.test(v.trim())); guess("student", (v) => v.trim().length > 1);
    return col;
  }
  // «04/11/2026» is 4 November in most locales (UK, Kazakhstan) but 11 April in US English: the order is decided once per file
  function slashOrder(strs) {
    const ms = strs.map((s) => (s || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)).filter(Boolean);
    if (!ms.length) return "dmy";
    const dayFirst = ms.some((m) => +m[1] > 12), monthFirst = ms.some((m) => +m[2] > 12);
    if (dayFirst !== monthFirst) return dayFirst ? "dmy" : "mdy";
    // still ambiguous: form rows are appended in time order, and no answer comes from the future
    const cost = (o) => { let bad = 0, prev = 0; const now = Date.now() + 86400000;
      strs.forEach((s) => { const d = parseDate(s, o); if (!d) return; if (+d > now) bad += 1000; if (+d < prev) bad++; prev = +d; }); return bad; };
    const last = (o) => Math.max(0, ...strs.map((s) => +(parseDate(s, o) || 0)));   // a tie goes to the reading with the more recent answers
    const cm = cost("mdy"), cd = cost("dmy");
    return cm < cd || (cm === cd && last("mdy") > last("dmy")) ? "mdy" : "dmy";
  }
  function parseDate(s, order = "dmy") {
    s = (s || "").trim(); let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T]?(\d{1,2})?:?(\d{2})?:?(\d{2})?/))) return new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    if ((m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4}),?\s*(\d{1,2})?:?(\d{2})?:?(\d{2})?/))) return new Date(+m[3], m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2})?:?(\d{2})?:?(\d{2})?\s*(AM|PM)?/i))) {
      let h = +(m[4] || 0); if (m[7] && /pm/i.test(m[7]) && h < 12) h += 12; if (m[7] && /am/i.test(m[7]) && h === 12) h = 0;
      const [mo, dd] = order === "mdy" ? [+m[1], +m[2]] : [+m[2], +m[1]];
      return new Date(+m[3], mo - 1, dd, h, +(m[5] || 0), +(m[6] || 0));
    }
    const d = new Date(s); return isNaN(d) ? null : d;
  }

  // one result per form row: { ts, raw, lesson, kind, part, pid, a, b, attempt, sec, sec2 (mock section) }
  function rows(text) {
    const all = parseCSV(String(text || "").replace(/^\uFEFF/, "")); if (all.length < 2) return [];
    const head = all[0], body = all.slice(1), c = columns(head, body), out = [];
    if (c.student === undefined || c.lesson === undefined || c.score === undefined) return [];
    const order = c.ts === undefined ? "dmy" : slashOrder(body.map((r) => r[c.ts]));
    for (const r of body) {
      const g = (k) => (c[k] === undefined ? "" : (r[c[k]] || "").trim());
      const lesson = g("lesson").toUpperCase(), sc = g("score").match(/^(\d+)\/(\d+)$/); if (!/^([VMXTDUA]\d\d|PT\d\d?|MD|VA)$/.test(lesson) || !sc) continue;
      const part = g("part");
      out.push({ ts: parseDate(g("ts"), order), raw: g("student"), lesson, kind: lesson[0], part, pid: (part.match(/^p\d+/) || [""])[0], a: +sc[1], b: +sc[2],
        attempt: Number(g("attempt")) || 1, sec: Number(g("seconds")) || 0, sec2: lesson.startsWith("PT") ? (/^Math/.test(part) ? "math" : "rw") : "", hard: /M2 сложный/.test(part) });
    }
    return out.sort((x, y) => (x.ts || 0) - (y.ts || 0));
  }
  window.FORMKIT = { roman, key, group, clean, parseCSV, columns, slashOrder, parseDate, rows };
})();
