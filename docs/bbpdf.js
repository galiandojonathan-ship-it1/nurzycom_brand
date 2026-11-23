/* Bluebook import from a PDF (Nurassyl, 2026-11-23: «импорт с Bluebook с телефона в качестве pdf. У всех разные телефоны и не
   всегда можно скопировать весь PDF»). The student saves My Practice → Score Details as a PDF (Share → Print → Save to Files on
   an iPhone, Print → Save as PDF on Android or a computer) and picks the file. pdf.js (Mozilla, Apache-2.0, self-hosted in
   vendor/, loaded only when a PDF is chosen) reads the text in the browser; nothing is uploaded. The text items are put back
   into lines by position, then into the table the copy-paste importer already reads (bluebook-import.js parse/parseMeta).
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
  let lib = null;
  const load = () => (lib ??= import(new URL(PDFJS + "pdf.min.mjs", document.baseURI).href).then((m) => { m.GlobalWorkerOptions.workerSrc = new URL(PDFJS + "pdf.worker.min.mjs", document.baseURI).href; return m; })
    .catch((e) => { lib = null; throw e; }));
  async function text(file) {
    const pdfjs = await load(), data = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data, isEvalSupported: false, disableFontFace: true, useSystemFonts: false }).promise;
    const all = []; let chars = 0;
    for (let p = 1; p <= Math.min(doc.numPages, 30); p++) {
      const page = await doc.getPage(p), c = await page.getTextContent();
      const items = c.items.map((t) => ({ str: t.str, x: t.transform[4], y: t.transform[5], w: t.width, h: t.height || Math.abs(t.transform[3]) }));
      chars += items.reduce((a, t) => a + (t.str || "").length, 0);
      all.push(...lines(items));
    }
    await doc.destroy();
    if (chars < 200) throw new Error("В этом PDF нет текста (похоже, это снимок экрана). Сохраните PDF прямо со страницы Score Details: «Поделиться» → «Печать» → «Сохранить в Файлы».");
    return table(all);
  }
  const api = { lines, table, text };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.BBPDF = api;
})(typeof window !== "undefined" ? window : globalThis);
