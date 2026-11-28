// Read the teacher's existing presentation in the browser. Recognized questions use the original slide key.
window.SlidePracticeContent = (() => {
  const letters = ["A", "B", "C", "D"];
  const coldHeading = /^(?:холодный\s+старт|cold\s+start)\s*[·:—–-]?\s*(?:вопрос|question)\s*([1-4])\s*(?:из|of|\/)\s*4\s*$/i;
  const cleanLines = (text) => String(text || "").split("\n").map((line) => line.trim()).filter(Boolean);
  const coldNumber = (text) => Number(cleanLines(text).slice(0, 3).map((line) => coldHeading.exec(line)?.[1]).find(Boolean)) || 0;
  const keyLine = /^(?:(?:правильный|correct)\s+)?(?:ответ|answer)\s*:\s*([A-D])(?:\s*[.)—–-].*|\s+\((?:None|(?=[^()]*\d)[^()]+)\))?$/i;
  const footer = /^(?:nurzycom\b|урок\s+[\wА-ЯЁ]+\s*·|\d+\s*[cс]\s*$|\d+\s*\/\s*\d+\s*$|(?:(?:правильный|correct)\s+)?(?:ответ|answer)\s*:)/i;
  const sections = (heading = "") => heading.toLowerCase().replace(/\s+/g, " ").split(" · ");
  const solution = /^(?:решение|solution|answer explanation)$/i;
  const questionHeading = /^(?:практика|ваша очередь|practice|try it|решите|вопрос(?:\s|$)|ещ[ёе] один вопрос(?:\s|$)|question\b|итоговый тест|разбор · официальный вопрос|пример\s+\d+\s+·)/iu;
  const isSolution = (text) => solution.test(sections(cleanLines(text)[0]).at(-1));
  // These published excerpts use one PDF text line per line of verse, after an attribution.
  const verseExcerpts = [
    { work: /Monna Innominata 2/, first: /^I wish I could remember/, lines: 8 },
    { work: /Romeo and Juliet/, first: /^JULIET: O Romeo, Romeo/, lines: 4, title: "Romeo and Juliet" },
    { work: /Sonnet 29/, first: /^When in disgrace/, lines: 14 },
    { work: /1600 play Hamlet/, first: /^POLONIUS: Neither a borrower/, lines: 6, title: "Hamlet" },
    { work: /The Rime of the Ancient Mariner/, first: /^It is an ancient Mariner/, lines: 8 },
    { work: /Sonnet 116/, first: /^Let me not to the marriage/, lines: 8 },
    { work: /A Psalm of Life/, first: /^Tell me not, in mournful numbers/, lines: 8 }
  ];

  function pdfText(items) {
    const labels = items.flatMap((item, index) => {
      const letter = item.str?.trim();
      return /^[A-D]$/.test(letter) && item.height > 0 ? [{ letter, index, x: item.transform[4], y: item.transform[5] }] : [];
    });
    const grid = new Set();
    for (const a of labels.filter(({ letter }) => letter === "A").reverse()) {
      const b = labels.find((p) => p.letter === "B" && p.index > a.index && p.x - a.x > 40 && Math.abs(p.y - a.y) < 8);
      if (!b) continue;
      const c = labels.find((p) => p.letter === "C" && p.index > b.index && Math.abs(p.x - a.x) < 8 && a.y - p.y > 18);
      if (!c) continue;
      const d = labels.find((p) => p.letter === "D" && p.index > c.index && Math.abs(p.x - b.x) < 8 && Math.abs(p.y - c.y) < 8);
      if (!d) continue;
      for (const { index } of [a, b, c, d]) grid.add(index);
      break;
    }
    return items.map((item, index) => {
      // In a two-column layout, PDF.js can emit two choices on one line.
      if (grid.has(index)) return "\n" + item.str + "\n";
      const next = items[index + 1];
      const baseline = item.str?.trim() && next?.str?.trim() ? item.transform[5] - next.transform[5] : 0;
      const endsLine = item.hasEOL || baseline > Math.max(item.height, next?.height || 0) * 0.8;
      // Adjacent font runs can form one word or number. PDF.js represents actual spaces as separate items.
      const touching = item.str?.trim() && next?.str?.trim() && Math.abs(baseline) < 1 &&
        Math.abs(next.transform[4] - item.transform[4] - item.width) < 1;
      return (item.str || "") + (endsLine ? "\n" : touching ? "" : " ");
    }).join("");
  }

  function optionPositions(lines, pattern) {
    const choices = new Map();
    for (const [i, line] of lines.entries()) {
      const part = pattern.exec(line);
      if (part?.[1] !== letters[choices.size]) continue;
      choices.set(part[1], { i, inline: part[2] || part[3] || "" });
      if (choices.size === 4) return choices;
    }
    return choices;
  }
  function parse(text) {
    const lines = cleanLines(text);
    const heading = (lines[0] || "").replace(/\s+/g, " ");
    const parts = sections(heading);
    if (isSolution(text)) return null;
    // Prefer the PDF's dedicated letter columns. A continuation of an option can start with an abbreviation such as “A.”.
    let choices = optionPositions(lines, /^([A-D])(?:$|\s{2,}(.+)$)/);
    if (choices.size !== 4) choices = optionPositions(lines, /^([A-D])(?:$|[.)]\s+(.+)$|\s{2,}(.+)$)/);
    if (choices.size !== 4 || choices.get("A").i < 1) return null;
    const start = coldHeading.test(heading) || questionHeading.test(heading) || /^угадайте(?:\s|$)/i.test(heading) ||
      parts.slice(1).some((part) => /^(?:вопрос|пример|ещё|угадайте)/i.test(part)) ? 1 : 0;
    const prompt = lines.slice(start, choices.get("A").i).filter((line) => !keyLine.test(line)).join("\n");
    const opts = letters.map((letter, i) => {
      const { i: pos, inline } = choices.get(letter);
      const end = i < 3 ? choices.get(letters[i + 1]).i : lines.findIndex((line, index) => index > pos && footer.test(line));
      return [inline, ...lines.slice(pos + 1, end < 0 ? undefined : end)].filter((line) => line && !keyLine.test(line)).join(" ");
    });
    if (!prompt.trim() || opts.some((value) => !value)) return null;
    return { prompt, opts };
  }
  function splitPrompt(prompt) {
    const lines = cleanLines(prompt);
    const label = /^Text\s+([12])(?:$|\s*[:–—]\s*(.*)$)/i;
    const paired = lines.some((line) => label.exec(line)?.[1] === "1") && lines.some((line) => label.exec(line)?.[1] === "2");
    const start = lines.findLastIndex((line) => /^(?:which|what|how|according to|based on|as used in|the student wants)\b/i.test(line) ||
      paired && /^both (?:authors|texts|passages)\b.*\b(?:agree|suggest|imply)\b/i.test(line));
    if (start <= 0 || !paired && !/\?\s*$/.test(lines.at(-1))) return { passage: "", stem: prompt };
    const body = lines.slice(0, start);
    const stem = lines.slice(start).join(" ");
    for (const excerpt of verseExcerpts) {
      const first = body.length - excerpt.lines;
      const attribution = body.slice(0, first).join(" ");
      if (first <= 0 || !/^The following text is (?:adapted )?from\b/i.test(attribution) ||
          !excerpt.work.test(attribution) || !excerpt.first.test(body[first])) continue;
      const verse = body.slice(first);
      const underlineFrom = excerpt.title === "Hamlet" && /^This above all:/.test(verse[3]) &&
        /^Thou canst not then be false/.test(verse[5]) && /function of the underlined portion/i.test(stem) ? 3 : undefined;
      return { passage: [attribution, ...verse].join("\n"), stem, verse: true, title: excerpt.title, underlineFrom };
    }
    const excerpt = body.findIndex((line) => /^Every day when \[Bill\]/.test(line));
    if (excerpt > 0 && /Stevenson[’']s 1883 novel Treasure Island\./.test(body.slice(0, excerpt).join(" "))) {
      return { passage: [body.slice(0, excerpt).join(" "), body.slice(excerpt).join(" ")].join("\n"), stem, title: "Treasure Island" };
    }
    const notes = /^while researching\b/i.test(body[0]);
    const secondStudyParagraph = /^Hypothesizing that reliance on smartphones\b/i.test(body[0]) &&
      body.findIndex((line) => /^When surveyed a week later\b/.test(line));
    const blocks = [];
    for (const [i, line] of body.entries()) {
      const title = paired && label.exec(line);
      if (title) {
        blocks.push("Text " + title[1], title[2] || "");
      } else if (!i || i === secondStudyParagraph || /^[•●▪]\s/.test(line) || notes && /[.:!?]$/.test(body[i - 1]) && /^[A-Z]/.test(line)) {
        blocks.push(line);
      } else {
        const last = blocks.at(-1);
        const wrappedWord = /[a-z]-$/i.test(last) && /^[a-z]/.test(line);
        blocks[blocks.length - 1] = [last, line].filter(Boolean).join(wrappedWord ? "" : " ");
      }
    }
    return { passage: blocks.filter(Boolean).join("\n"), stem };
  }
  function answerKey(text) {
    const keys = new Set(cleanLines(text).map((line) => keyLine.exec(line)?.[1]?.toUpperCase()).filter(Boolean));
    return keys.size === 1 ? [...keys][0] : null;
  }
  function nextKey(question, next, following) {
    const [from, to, after] = [question, next, following].map((text) => sections(cleanLines(text)[0]));
    const hasContext = (parts) => parts.length > 1 && parts.slice(0, -1).every((part, i) => part === from[i]);
    if (solution.test(to.at(-1)) && (hasContext(to) || to.length === 1 && questionHeading.test(from.join(" · ")))) {
      return answerKey(next);
    }
    // Some lessons have a worked explanation between the English question and its answer slide.
    if (hasContext(to) && /^(?:разбор|схема сложного вопроса)$/.test(to.at(-1)) &&
        hasContext(after) && solution.test(after.at(-1))) return answerKey(following);
    return null;
  }
  function recapKeys(text) {
    const lines = cleanLines(text);
    if (!lines.slice(0, 3).some((line) => /^(?:назад к холодному старту|вернитесь к холодному старту|back to (?:the )?cold start)/i.test(line.replace(/\s+/g, " ")))) return null;
    const keys = new Map();
    for (const m of lines.join("\n").matchAll(/^([1-4])\s*[:.)–—-]?\s*([A-D])(?=\s|[.)]|$)/gm)) {
      if (keys.has(m[1])) return null;
      keys.set(m[1], m[2]);
    }
    return keys.size === 4 ? [1, 2, 3, 4].map((n) => keys.get(String(n))) : null;
  }
  return { pdfText, parse, splitPrompt, answerKey, nextKey, isSolution, coldNumber, recapKeys };
})();
