// Match the visible slide to the questions in the selected lesson. No text leaves the browser.
window.SlideQuestionMatch = (() => {
  const tokens = (text) => String(text || "").normalize("NFKC").toLowerCase()
    .replace(/\u00ad/g, "").replace(/[−–]/g, "-").match(/[\p{L}\p{N}]+|[+=≤≥%*/^-]/gu) || [];
  const textOf = (html) => {
    const doc = new DOMParser().parseFromString(String(html || ""), "text/html");
    for (const block of doc.body.querySelectorAll("p,div,br,tr,td,li")) block.after(doc.createTextNode(" "));
    return doc.body.textContent;
  };
  const grams = (words) => new Set(words.slice(2).map((word, i) => words[i] + " " + words[i + 1] + " " + word));
  const ratio = (wanted, available) => {
    if (!wanted.size) return 0;
    return [...wanted].filter((word) => available.has(word)).length / wanted.size;
  };
  const contains = (full, part) => (" " + full + " ").includes(" " + part + " ");
  function similarity(words, full, trigrams) {
    if (!words.length) return 0;
    const joined = words.join(" ");
    if (contains(full, joined)) return 1;
    return ratio(grams(words), trigrams);
  }
  function match(text, candidates) {
    const words = tokens(text), full = words.join(" "), trigrams = grams(words);
    if (words.length < 5) return null;
    const lines = new Set(String(text).split(/\n/).map((line) => tokens(line).join(" ").replace(/^[a-d] /, "")).filter(Boolean));
    const scored = candidates.map(({ question, part }) => {
      const stem = tokens(textOf(question.stem)), passage = tokens(textOf(question.stim));
      const stemScore = similarity(stem, full, trigrams), passageScore = similarity(passage, full, trigrams);
      const options = new Set((question.opts || []).map((opt) => tokens(textOf(opt)).join(" ")).filter(Boolean));
      const hits = [...options].filter((option) => lines.has(option) || (option.includes(" ") && contains(full, option))).length;
      const evidence = stem.length >= 7 && stemScore >= 0.72 ||
        passage.length >= 10 && passageScore >= 0.62 && (stemScore >= 0.65 || hits >= 2) ||
        stem.length >= 4 && stemScore >= 0.65 && hits >= 3;
      const score = (stem.length >= 7 ? 4 : 1.4) * stemScore + (passage.length >= 10 ? 3 : 0.5) * passageScore + hits * 0.65;
      return { part, number: question.n, score, evidence };
    }).sort((a, b) => b.score - a.score);

    // Workbooks can reuse an entire question across parts. Matching duplicates means the part is ambiguous.
    const [first, second] = scored;
    return first?.evidence && first.score - (second?.score || 0) >= 0.8 ? { part: first.part, number: first.number } : null;
  }
  function exactSlide(draft, candidates) {
    // In grammar questions, punctuation and capitalization can be the only differences between options.
    const normalized = (text) => text.normalize("NFKC").replace(/\u00ad/g, "").replace(/\s+/g, " ").trim();
    const prompt = normalized(draft.prompt), options = draft.opts.map(normalized);
    if (options.length !== 4 || options.includes("") || new Set(options).size !== options.length) return null;
    const matches = [];
    for (const candidate of candidates) {
      const { question } = candidate;
      if (question.t !== "mc" || !/^[A-D]$/.test(question.ans) || question.opts?.length !== options.length ||
          normalized(textOf(question.stim) + " " + textOf(question.stem)) !== prompt) continue;
      const source = question.opts.map((option) => normalized(textOf(option)));
      if (!options.every((option) => source.includes(option))) continue;
      const correctText = source["ABCD".indexOf(question.ans)];
      matches.push({ ...candidate, answer: "ABCD"[options.indexOf(correctText)] });
    }
    return matches.length && matches.every(({ answer }) => answer === matches[0].answer) ? matches[0] : null;
  }
  return { match, exactSlide };
})();
