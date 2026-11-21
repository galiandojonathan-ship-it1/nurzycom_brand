import assert from "node:assert/strict";

globalThis.window = globalThis;
await import("../../docs/slide-practice-content.js");
const { pdfText, parse, splitPrompt } = SlidePracticeContent;

const run = (str, x, y, { width = 20, height = 18, hasEOL = false } = {}) =>
  ({ str, transform: [18, 0, 0, 18, x, y], width, height, hasEOL });

const question = parse(pdfText([
  run("Практика", 10, 450, { hasEOL: true }),
  run("Which percentage is the least?", 10, 400, { hasEOL: true }),
  run("A", 10, 320), run("50", 50, 320), run("%", 70, 320),
  run("B", 400, 320), run("60%", 440, 320),
  run("C", 10, 260), run("70%", 50, 260),
  run("D", 400, 260), run("80%", 440, 260, { hasEOL: true }),
  run("Урок 1 · Fractions", 10, 490)
]));
assert.deepEqual(question, {
  prompt: "Which percentage is the least?",
  opts: ["50%", "60%", "70%", "80%"]
});

const passage = splitPrompt([
  "Text 1 is adapted from a study.",
  "Text 1",
  "Rain fell throughout the night.",
  "Text 2: The field was dry by morning.",
  "Both authors would most likely agree that"
].join("\n"));
assert.deepEqual(passage, {
  passage: "Text 1 is adapted from a study.\nText 1\nRain fell throughout the night.\nText 2\nThe field was dry by morning.",
  stem: "Both authors would most likely agree that"
});

const notes = pdfText([
  run("While researching a topic, a student took these notes:", 10, 390, { hasEOL: true }),
  run("One animal appeared early.", 40, 340),
  run("Two others followed shortly", 40, 310),
  run("afterward.", 40, 280, { hasEOL: true }),
  run("The student wants to describe the order. Which choice does that?", 10, 230)
]);
assert.deepEqual(splitPrompt(notes), {
  passage: "While researching a topic, a student took these notes:\nOne animal appeared early.\nTwo others followed shortly afterward.",
  stem: "The student wants to describe the order. Which choice does that?"
});
