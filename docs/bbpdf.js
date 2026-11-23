/* Bluebook import from a PDF (Nurassyl, 2026-11-23: «импорт с Bluebook с телефона в качестве pdf. У всех разные телефоны и не
   всегда можно скопировать весь PDF»). The student saves My Practice → Score Details as a PDF (Share → Print → Save to Files on
   an iPhone, Print → Save as PDF on Android or a computer) and picks the file. pdf.js (Mozilla, Apache-2.0, self-hosted in
   vendor/, loaded only when a PDF is chosen) reads the text in the browser; nothing is uploaded. The text items are put back
   into lines by position, then into the table the copy-paste importer already reads (bluebook-import.js parse/parseMeta).
   The rows are read by column (grid): the header «Question · Section · Correct Answer · Your Answer · Actions» gives the column
   positions on each page, every number in the Question column starts a row, and each piece of text joins the nearest row.
   Phones lay the table out differently (2026-11-23: Chrome on Android adds a «Domain» column, repeats the header on every
   page and wraps a long typed answer above and below the row, «57.27;» / «Incorrect»), and this reads both; the older
   line-by-line reading stays as a fallback for a PDF without the header.
   A PDF printed from the page as a picture has no text: the student is asked to save it from the page itself. */
(function (root) {
  const PDFJS = "vendor/pdfjs-4.10.38/";   // the copy the lesson console already uses
  // items: [{ str, x, y, w, h }] of one page → lines of text, cells split by a tab where the gap is wide
  function lines(items) {
    const it = items.filter((t) => t.str && t.str.trim()).sort((a, b) => b.y - a.y || a.x - b.x), rows = [];
    for (const t of it) {
      const tol = Math.max(2, (t.h || 10) * 0.45), r = rows.find((q) => Math.abs(q.y - t.y) <= tol);
      if (r) r.items.push(t); else rows.push({ y: t.y, items: [t] });
    }
    return rows.sort((a, b) => b.y - a.y).map((r) => {
      const cells = r.items.sort((a, b) => a.x - b.x); let s = "", end = null;
      for (const c of cells) { if (end != null) s += c.x - end > Math.max(6, (c.h || 10) * 0.9) ? "\t" : c.x - end > 0.5 ? " " : ""; s += c.str; end = c.x + (c.w || 0); }
      return s.replace(/[  ]+/g, " ").trim();
    }).filter(Boolean);
  }
  // the lines of all pages → the question table as the importer reads it, plus the page's header lines (test, date, totals)
  const SEC = /^(Reading (?:and|&)(?: Writing)?|Writing|Math)$/i, STAT = /(?:^|;\s*)(Correct|Incorrect|Omitted|Unanswered|Not answered|Skipped|No answer)$/i;
  function table(all) {
    const head = [], tokens = [];
    let inTable = false;
    for (const l of all) {
      if (!inTable && /^Question\b.*Section/i.test(l.replace(/\t/g, " "))) { inTable = true; continue; }
      if (!inTable) {
        // the three totals sit side by side in a PDF («98 85 13» over «Total Questions Correct Answers Incorrect Answers»)
        const v = l.split("\t"), prev = head[head.length - 1];
        if (/Total Questions/.test(l) && prev && /^\d+(\t\d+){1,2}$/.test(prev)) { const n = prev.split("\t"); head.pop();
          v.forEach((lab, k) => { if (n[k] != null) head.push(n[k], lab.trim()); }); continue; }
        head.push(l); continue; }
      if (/^©|College Board$|trademark/i.test(l)) break;
      for (const c of l.split("\t")) { const x = c.trim(); if (!x || x === ":" || /^(Review|Actions|Answer|Correct Answer|Your Answer)$/i.test(x)) continue;
        // a cell may hold «1 Reading and» when the gap is narrow
        const m = /^(\d{1,2}) (Reading (?:and|&)(?: Writing)?|Math)$/i.exec(x); if (m) { tokens.push(m[1], m[2]); continue; }
        tokens.push(x); }
    }
    const rows = []; let from = 0;
    for (let i = 0; i < tokens.length; i++) {
      if (!STAT.test(tokens[i]) || SEC.test(tokens[i])) continue;
      const win = tokens.slice(from, i), isMath = win.some((x) => /^Math$/i.test(x)), isRw = win.some((x) => /^Reading/i.test(x));
      const rest = win.filter((x) => !SEC.test(x)), key = rest[rest.length - 1], num = rest.slice(0, -1).reverse().find((x) => /^\d{1,2}$/.test(x));
      // an omitted row may have no key column text before the status when «Show Correct Answers» is off
      if (num && (isMath || isRw)) rows.push([num, isMath ? "Math" : "Reading and Writing", key && key !== num ? key : "", tokens[i], "Review"].join("\t"));
      from = i + 1;
    }
    return head.join("\n") + "\nQuestion\tSection\tCorrect Answer\tYour Answer\tActions\n" + rows.join("\n");
  }
  // pages: [[{ str, x, y, w, h }]] → the question rows, or null when no header with the columns is found
  function grid(pages) {
    const rows = []; let cols = null;
    const isHead = (t) => /^Question$/i.test(t.str.trim());
    for (const items0 of pages) {
      const items = items0.filter((t) => t.str && t.str.trim());
      let top = Infinity;
      // header words, each with its own x: some PDFs keep neighbouring cells in one text item («Question Section»), so an item
      // is split into words and each word's x is estimated from the item's width
      const words = items.flatMap((t) => { const str = t.str, w = t.w || 0, out = []; let m; const re = /\S+/g;
        while ((m = re.exec(str))) out.push({ str: m[0], x: t.x + (str.length ? (w * m.index) / str.length : 0), y: t.y, h: t.h }); return out; });
      const h = words.find((t) => isHead(t) && words.some((u) => /^Section$/i.test(u.str) && Math.abs(u.y - t.y) < 12 && u.x > t.x));
      if (h) {
        const at = (re) => { const u = words.filter((v) => re.test(v.str) && Math.abs(v.y - h.y) < 12 && v.x > h.x).sort((a, b) => a.x - b.x)[0]; return u ? u.x : null; };
        const c = [h.x, at(/^Section$/i), at(/^Correct( Answer)?$/i), at(/^Your( Answer)?$/i), at(/^Actions$/i), at(/^Domain$/i)];
        if (c[1] != null && c[2] != null && c[3] != null) { cols = c; top = h.y - 2; }
      }
      if (!cols) continue;
      const bounds = cols.map((x, i) => (x == null ? null : [x - 3, i]))
        .filter(Boolean).sort((a, b) => a[0] - b[0]);
      const colOf = (t) => { let c = -1; for (const [x, i] of bounds) if (t.x >= x) c = i; return c; };
      const body = items.filter((t) => t.y < top && !/^©/.test(t.str.trim()));
      const anchors = body.filter((t) => colOf(t) === 0 && /^\d{1,2}$/.test(t.str.trim())).sort((a, b) => b.y - a.y);
      if (!anchors.length) continue;
      const gaps = anchors.slice(1).map((a, i) => anchors[i].y - a.y).filter((g) => g > 0).sort((a, b) => a - b);
      const band = gaps.length ? Math.max(8, gaps[Math.floor(gaps.length / 2)] * 0.62) : 24;
      const cells = anchors.map(() => ({ 1: [], 2: [], 3: [] }));
      for (const t of body) {
        const c = colOf(t); if (c < 1 || c > 3) continue;
        let best = -1, d = Infinity; anchors.forEach((a, i) => { const e = Math.abs(a.y - t.y); if (e < d) { d = e; best = i; } });
        if (best >= 0 && d <= band) cells[best][c].push(t);
      }
      const join = (list) => list.sort((a, b) => b.y - a.y || a.x - b.x).map((t) => t.str.trim()).join(" ").replace(/\s+/g, " ").replace(/\s*;\s*/g, "; ").trim();
      anchors.forEach((a, i) => {
        const sec = join(cells[i][1]), key = join(cells[i][2]), your = join(cells[i][3]);
        if (!/Math|Reading|Writing/i.test(sec) || !STAT.test(your)) return;
        rows.push([a.str.trim(), /Math/i.test(sec) ? "Math" : "Reading and Writing", key, your, "Review"].join("\t"));
      });
    }
    return rows.length ? rows : null;
  }
  // the head lines (test, date, totals) from the lines, the rows from the grid when it finds them
  function fromPages(pages) {
    const all = pages.flatMap(lines), byLines = table(all), g = grid(pages);
    if (!g) return byLines;
    return byLines.slice(0, byLines.indexOf("\nQuestion\tSection\tCorrect Answer")) + "\nQuestion\tSection\tCorrect Answer\tYour Answer\tActions\n" + g.join("\n");
  }
  let lib = null;
  const load = () => (lib ??= import(new URL(PDFJS + "pdf.min.mjs", document.baseURI).href).then((m) => { m.GlobalWorkerOptions.workerSrc = new URL(PDFJS + "pdf.worker.min.mjs", document.baseURI).href; return m; })
    .catch((e) => { lib = null; throw e; }));
  async function text(file) {
    const pdfjs = await load(), data = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data, isEvalSupported: false, disableFontFace: true, useSystemFonts: false }).promise;
    const pages = []; let chars = 0;
    for (let p = 1; p <= Math.min(doc.numPages, 30); p++) {
      const page = await doc.getPage(p), c = await page.getTextContent();
      const items = c.items.map((t) => ({ str: t.str, x: t.transform[4], y: t.transform[5], w: t.width, h: t.height || Math.abs(t.transform[3]) }));
      chars += items.reduce((a, t) => a + (t.str || "").length, 0);
      pages.push(items);
    }
    await doc.destroy();
    if (chars < 200) throw new Error("В этом PDF нет текста (похоже, это снимок экрана). Сохраните PDF прямо со страницы Score Details: «Поделиться» → «Печать» → «Сохранить в Файлы».");
    return fromPages(pages);
  }
  const api = { lines, table, grid, fromPages, text };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.BBPDF = api;
})(typeof window !== "undefined" ? window : globalThis);
