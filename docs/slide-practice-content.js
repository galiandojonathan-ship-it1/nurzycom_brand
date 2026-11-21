// Read the teacher's existing presentation in the browser. Recognized questions use the original slide key.
window.SlidePracticeContent = (() => {
  const letters = ["A", "B", "C", "D"];
  const coldHeading = /^(?:холодный\s+старт|cold\s+start)\s*[·:—–-]?\s*(?:вопрос|question)\s*([1-4])\s*(?:из|of|\/)\s*4\s*$/i;
  const cleanLines = (text) => String(text || "").split("\n").map((line) => line.trim()).filter(Boolean);
  const coldNumber = (text) => Number(cleanLines(text).slice(0, 3).map((line) => coldHeading.exec(line)?.[1]).find(Boolean)) || 0;
  const footer = /^(?:nurzycom\b|урок\s+[\wА-ЯЁ]+\s*·|\d+\s*[cс]\s*$|\d+\s*\/\s*\d+\s*$|ответ\s*:|answer\s*:)/i;

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
    // Prefer the PDF's dedicated letter columns. A continuation of an option can start with an abbreviation such as “A.”.
    let choices = optionPositions(lines, /^([A-D])(?:$|\s{2,}(.+)$)/);
    if (choices.size !== 4) choices = optionPositions(lines, /^([A-D])(?:$|[.)]\s+(.+)$|\s{2,}(.+)$)/);
    if (choices.size !== 4 || choices.get("A").i < 1) return null;
    const start = coldHeading.test(lines[0]) || /^(?:практика|ваша очередь|practice|try it|решите|вопрос\s+\d+)/i.test(lines[0]) ? 1 : 0;
    const prompt = lines.slice(start, choices.get("A").i).join("\n");
    const opts = letters.map((letter, i) => {
      const { i: pos, inline } = choices.get(letter);
      const end = i < 3 ? choices.get(letters[i + 1]).i : lines.findIndex((line, index) => index > pos && footer.test(line));
      return [inline, ...lines.slice(pos + 1, end < 0 ? undefined : end)].filter(Boolean).join(" ");
    });
    if (!prompt.trim() || opts.some((value) => !value)) return null;
    return { prompt, opts };
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
  return { parse, coldNumber, recapKeys };
})();
