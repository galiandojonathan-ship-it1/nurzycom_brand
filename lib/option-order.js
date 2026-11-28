// Gemini tends to put the right option first (Nurassyl, 2026-11-22: a live round where every key was A).
// After generation, each question's options are reordered so the keys of one batch are spread evenly over A–D in a random
// order; the trap and the other options take random places. Letters mentioned in the explanations are remapped too.
const L = ["A", "B", "C", "D"];
const rand = (n) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
function shuffle(list) { for (let i = list.length - 1; i > 0; i--) { const j = rand(i + 1); [list[i], list[j]] = [list[j], list[i]]; } return list; }

// «вариант B», «ответ C», «ловушка A», «option D», «(B)», «B)» at the start: the letter forms an explanation can use
const LETTER = /((?:вариант|ответ|ловушк|option|choice|answer)[а-яa-z]*\s+)([A-D])(?![A-Za-zА-Яа-яЁё])|\(([A-D])\)|(^|\s)([A-D])\)/gi;
export function remapLetters(text, map) {
  return String(text).replace(LETTER, (m, word, a, b, lead, c) => word !== undefined ? word + (map[a.toUpperCase()] || a)
    : b !== undefined ? `(${map[b.toUpperCase()] || b})` : `${lead}${map[c.toUpperCase()] || c})`);
}

// questions: [{ options[4], answer, trap, ...text fields }]; fields: the text fields whose letter mentions follow the options
export function balanceKeys(questions, fields = ["rationale", "trapWhy"]) {
  // blocks of A–D, each block shuffled: even over the batch (±1) and random even for one or two questions
  const targets = []; while (targets.length < questions.length) targets.push(...shuffle([...L]));
  return questions.map((q, i) => {
    const key = L.indexOf(q.answer), trap = L.indexOf(q.trap);
    const order = new Array(4), want = L.indexOf(targets[i]);
    order[want] = key;
    const free = shuffle([0, 1, 2, 3].filter((p) => p !== want));
    const rest = shuffle([0, 1, 2, 3].filter((k) => k !== key));
    free.forEach((p, n) => (order[p] = rest[n]));
    const map = {}; order.forEach((from, to) => (map[L[from]] = L[to]));
    const out = { ...q, options: order.map((k) => q.options[k]), answer: L[want], trap: trap >= 0 ? map[L[trap]] : q.trap };
    fields.forEach((f) => { if (typeof q[f] === "string") out[f] = remapLetters(q[f], map); });
    return out;
  });
}
