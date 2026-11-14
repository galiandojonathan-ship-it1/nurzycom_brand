// «Мои тесты»: the teacher's own questions and tests (2026-11-10, Nurassyl: «allow to create my own questions and tests in
// the admin cabinet»). Shared by the cabinet (editor, preview, results) and mytest.html (the student's test screen).
// The bank is one object { at, tests: [test] }, sealed with the master key in the browser and kept in KV «custom»
// (GET api/custom for any visitor of the site, PUT api/admin/custom with the admin key). The server never sees it in clear.
//   test: { id: "C…", title, note, minutes (0 = no limit), review: "full" | "marks" | "score", open (listed for every student),
//           at (last change), q: [question] }
//   question: { id, type: "mc" | "spr", passage, stem, o: [4 options], a: "B" (mc) or "12; 0.5; 1/2" (spr, accepted answers),
//               x (explanation), skill, level: "E" | "M" | "H" }
// Results live in the student's synced copy: ct_last_<name>_<id> = "7/10", ct_att_<name>_<id> = attempts,
// ct_ans_<name>_<id> = "<qid>:B <qid>:12.5 · 512s" (the teacher's per-question view; keyed by question id, so reordering is safe).
(function () {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const LETTERS = "ABCD";
  const SKILLS = [
    ["Craft and Structure", ["Words in Context", "Text Structure and Purpose", "Cross-Text Connections"]],
    ["Information and Ideas", ["Central Ideas and Details", "Command of Evidence: Textual", "Command of Evidence: Quantitative", "Inferences"]],
    ["Standard English Conventions", ["Boundaries", "Form, Structure, and Sense"]],
    ["Expression of Ideas", ["Rhetorical Synthesis", "Transitions"]],
    ["Algebra", ["Linear equations in one variable", "Linear functions", "Linear equations in two variables", "Systems of two linear equations", "Linear inequalities"]],
    ["Advanced Math", ["Equivalent expressions", "Nonlinear equations and systems", "Nonlinear functions"]],
    ["Problem-Solving and Data Analysis", ["Ratios, rates, proportions, and units", "Percentages", "One-variable data", "Two-variable data", "Probability", "Inference from samples", "Evaluating statistical claims"]],
    ["Geometry and Trigonometry", ["Area and volume", "Lines, angles, and triangles", "Right triangles and trigonometry", "Circles"]],
  ];
  const LEVELS = { E: "Easy", M: "Medium", H: "Hard" };
  const REVIEW = { full: "Ответы и разбор после сдачи", marks: "Только верно / неверно", score: "Только итоговый балл" };
  const rid = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => (b % 36).toString(36)).join("");
  const newTest = () => ({ id: "C" + rid(8), title: "", note: "", minutes: 0, review: "full", open: false, at: Date.now(), q: [] });
  const newQ = (type) => ({ id: rid(6), type: type === "spr" ? "spr" : "mc", passage: "", stem: "", o: ["", "", "", ""], a: type === "spr" ? "" : "", x: "", skill: "", level: "M" });

  // ---- text markup (teacher's own writing): a blank line = new paragraph; "• " or "- " lines = a list; "| a | b |" lines = a table
  // (first row = header); ______ = the blank; **bold**, *italic*, __underline__. Everything is escaped first.
  function inline(t) {
    return esc(t).replace(/_{4,}/g, '<span class="blank" aria-label="пропуск">______</span>')
      .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>").replace(/__([^_\n]+)__/g, "<u>$1</u>").replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  }
  function rich(text) {
    const out = [], paras = String(text || "").replace(/\r/g, "").split(/\n\s*\n/);
    for (const p of paras) {
      const lines = p.split("\n").filter((l) => l.trim());
      if (!lines.length) continue;
      if (lines.every((l) => /^\s*[•\-–]\s+/.test(l))) { out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[•\-–]\s+/, ""))}</li>`).join("")}</ul>`); continue; }
      if (lines.length > 1 && lines.every((l) => /^\s*\|.*\|\s*$/.test(l))) {
        const rows = lines.filter((l) => !/^\s*\|[\s:|-]+\|\s*$/.test(l)).map((l) => l.trim().slice(1, -1).split("|").map((c) => c.trim()));
        const [h, ...b] = rows;
        out.push(`<div class="tw"><table class="dt"><thead><tr>${h.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${b.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
        continue;
      }
      out.push(`<p>${lines.map(inline).join("<br>")}</p>`);
    }
    return out.join("");
  }

  // ---- typed answers (as on the SAT: 0.5, .5, 1/2 and 2/4 are the same number); text answers compare without case and spaces
  function num(s) {
    const t = String(s).trim().replace(/\s+/g, "").replace(/,/g, ".").replace(/^\+/, "").replace(/[−–]/g, "-");
    if (/^-?\d*\.?\d+$/.test(t)) return Number(t);
    const m = /^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/.exec(t); if (m && Number(m[2]) !== 0) return Number(m[1]) / Number(m[2]);
    return null;
  }
  const accepted = (a) => String(a || "").split(/[;\n]/).map((x) => x.trim()).filter(Boolean);
  function isRight(q, ans) {
    if (ans == null || String(ans).trim() === "") return false;
    if (q.type !== "spr") return /^[ABCD]$/.test(q.a || "") && String(ans).toUpperCase() === q.a;
    const n = num(ans), clean = (s) => String(s).trim().toLowerCase().replace(/\s+/g, "");
    return accepted(q.a).some((x) => { const v = num(x); return v != null && n != null ? Math.abs(v - n) < 1e-9 * Math.max(1, Math.abs(v)) : clean(x) === clean(ans); });
  }
  const answerText = (q) => (q.type === "spr" ? accepted(q.a).join(" или ") : q.a);

  // ---- a question is ready when it can be graded
  function problems(q) {
    const p = [];
    if (!String(q.stem || "").trim() && !String(q.passage || "").trim()) p.push("нет текста вопроса");
    if (q.type === "mc") {
      if ((q.o || []).filter((x) => String(x).trim()).length < 4) p.push("нужны 4 варианта");
      if (!/^[ABCD]$/.test(q.a || "")) p.push("не отмечен верный ответ");   // "ABCD".includes("") is true: test the letter itself
    } else if (!accepted(q.a).length) p.push("нет верного ответа");
    return p;
  }

  // ---- import from text (one question per block; blocks split by a line "---" or "===", or by a numbered heading: a line "1." / "2)" /
  // "Question 3", or "4. P: …" with the number on the first line; 2026-11-12, Nurassyl pasted numbered questions):
  //   P: passage (may continue on the next lines)   Q: question   A) … B) … C) … D) …   Answer: B (or the typed answer)
  //   Explanation: …   Skill: Transitions   Level: H (also Easy / Medium / Hard, Лёгкий / Средний / Сложный; anything else, such as
  //   «Not provided», leaves the default «средний»)
  // A block with no A)–D) lines is a typed-answer (SPR) question.
  function parseText(src) {
    const out = [], errs = [];
    const HEAD = /^\s*(?:(?:Question|Вопрос|№)\s*)?(\d{1,3})\s*[.):]?\s*$/i, HEADP = /^\s*(\d{1,3})[.)]\s+(?=(?:P|Passage|Текст|Q|Question|Вопрос)\s*:)/i;
    const blocks = [{ no: null, lines: [] }];
    for (const line of String(src || "").replace(/\r/g, "").split("\n")) {
      let m;
      if (/^\s*(?:-{3,}|={3,})\s*$/.test(line)) { blocks.push({ no: null, lines: [] }); continue; }
      if ((m = HEAD.exec(line))) { blocks.push({ no: +m[1], lines: [] }); continue; }
      if ((m = HEADP.exec(line))) { blocks.push({ no: +m[1], lines: [line.slice(m[0].length)] }); continue; }
      blocks[blocks.length - 1].lines.push(line);
    }
    let count = 0;
    blocks.forEach(({ no, lines }) => {
      const block = lines.join("\n"); if (!block.trim()) return;
      const bi = no ? no - 1 : count; count++;
      const q = newQ("mc"); let cur = null, opts = {};
      for (const raw of block.split("\n")) {
        const line = raw.replace(/\s+$/, "");
        let m;
        if ((m = /^\s*(?:P|Passage|Текст)\s*:\s*(.*)$/i.exec(line))) { cur = "passage"; q.passage = m[1]; continue; }
        if ((m = /^\s*(?:Q|Question|Вопрос)\s*:\s*(.*)$/i.exec(line))) { cur = "stem"; q.stem = m[1]; continue; }
        if ((m = /^\s*([A-D])[).]\s+(.*)$/.exec(line))) { cur = "o" + m[1]; opts[m[1]] = m[2]; continue; }
        if ((m = /^\s*(?:Answer|Ответ|Key)\s*:\s*(.*)$/i.exec(line))) { cur = null; q.a = m[1].trim(); continue; }
        if ((m = /^\s*(?:Explanation|Разбор|Объяснение)\s*:\s*(.*)$/i.exec(line))) { cur = "x"; q.x = m[1]; continue; }
        if ((m = /^\s*(?:Skill|Навык)\s*:\s*(.*)$/i.exec(line))) { cur = null; q.skill = m[1].trim(); continue; }
        if ((m = /^\s*(?:Level|Difficulty|Уровень)\s*:\s*(.*)$/i.exec(line))) { cur = null; const v = m[1].trim().toLowerCase(); q.level = /^(e|easy|л[её]гк|просто)/.test(v) ? "E" : /^(h|hard|difficult|слож|трудн)/.test(v) ? "H" : "M"; continue; }
        if (!cur) continue;
        if (cur === "passage") q.passage += "\n" + line; else if (cur === "stem") q.stem += "\n" + line; else if (cur === "x") q.x += "\n" + line;
        else if (cur[0] === "o") opts[cur[1]] += " " + line.trim();
      }
      const keys = Object.keys(opts);
      if (keys.length) { q.o = LETTERS.split("").map((c) => (opts[c] || "").trim()); q.a = String(q.a).trim().toUpperCase().replace(/[^A-D]/g, "").slice(0, 1); }
      else { q.type = "spr"; q.o = ["", "", "", ""]; }
      q.passage = q.passage.trim(); q.stem = q.stem.trim(); q.x = q.x.trim();
      const p = problems(q); if (p.length) errs.push(`Вопрос ${bi + 1}: ${p.join(", ")}`);
      out.push(q);
    });
    return { qs: out, errs };
  }

  // ---- results stored in a student's copy
  const keys = (name, id) => ({ last: `ct_last_${name}_${id}`, att: `ct_att_${name}_${id}`, ans: `ct_ans_${name}_${id}` });
  function parseAns(s) {   // "k3f9a1:B x0p2m7:12.5 · 512s" → { k3f9a1: "B", …, sec: 512 }
    const o = {}; const [a, t] = String(s || "").split(" · ");
    (a || "").split(" ").forEach((p) => { const i = p.indexOf(":"); if (i > 0) o[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1)); });
    const m = /(\d+)s/.exec(t || ""); if (m) o.sec = Number(m[1]);
    return o;
  }
  const packAns = (qs, ans, sec) => qs.map((q) => `${q.id}:${ans[q.id] == null || ans[q.id] === "" ? "-" : encodeURIComponent(ans[q.id])}`).join(" ") + ` · ${Math.round(sec)}s`;

  // ---- the bank on the server
  async function loadBank() {
    const r = await SITE.api("custom").catch(() => ({ status: 0 }));
    if (r.status === 404) return { tests: [], at: 0 };
    if (!r.ok) throw new Error(String(r.status || "net"));
    const B = await SITE.unsealBlob(r.data.data);
    return { tests: Array.isArray(B && B.tests) ? B.tests : [], at: (B && B.at) || 0 };
  }

  window.CTL = { esc, rich, inline, isRight, answerText, accepted, problems, parseText, newTest, newQ, keys, parseAns, packAns, loadBank, SKILLS, LEVELS, REVIEW, LETTERS };
})();
