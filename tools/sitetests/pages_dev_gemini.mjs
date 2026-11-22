// pages_dev.mjs with a fake Gemini: GEMINI_API_KEY is set and calls to generativelanguage.googleapis.com are answered locally.
// Drafts: perMistake questions per mistake, key B, trap A. Blind solver: answers B, except the 2nd question (C), so one is dropped.
// usage: node pages_dev_gemini.mjs <docs dir> <port>    (log of what reached «Gemini»: gemini.log next to this file)
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const LOG = path.join(path.dirname(fileURLToPath(import.meta.url)), "gemini.log");
process.env.GEMINI_API_KEY = "fake-local-key";
const real = globalThis.fetch;
globalThis.fetch = async (url, opt) => {
  if (!String(url).includes("generativelanguage.googleapis.com")) return real(url, opt);
  const data = JSON.parse(JSON.parse(opt.body).contents[0].parts[0].text);
  fs.appendFileSync(LOG, JSON.stringify(data) + "\n");
  let out;
  if (data.mistakes) {
    out = { questions: data.mistakes.flatMap((m) => Array.from({ length: data.perMistake }, (_, k) => ({ source: m.source,
      mechanism: `Тренирует ловушку навыка ${m.skill} (вариант ${m.chosen || "пропуск"}).`,
      passage: m.sec === "math" ? "" : `Synthetic passage ${m.source}.${k} about a river town whose market grew after a new bridge opened; ______ the old ferry kept a few loyal passengers every morning.`,
      prompt: m.sec === "math" ? `If 2x + ${m.source + k} = ${2 * (m.source + 3) + m.source + k}, what is x?` : "Which choice completes the text with the most logical transition?",
      options: m.sec === "math" ? [`${m.source + 2}`, `${m.source + 3}`, `${m.source + 4}`, `${m.source + 5}`] : ["Similarly,", "Even so,", "For example,", "In short,"],
      answer: "B", trap: "A", rationale: "Синтетическое объяснение: верен B.", trapWhy: "A вводит сходство, а не контраст." }))) };
  } else out = { items: data.questions.map((q, i) => ({ answer: i === 1 ? "C" : "B", sound: true })) };
  return new Response(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(out) }] } }] }), { status: 200, headers: { "content-type": "application/json" } });
};
await import("./pages_dev.mjs");
