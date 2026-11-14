// «Мои тесты» paste format (2026-11-12): numbered blocks («1.», «2)», «Question 3», «4. P: …»), the old «---» blocks, levels in words.
// Runs ctlogic.js in node (no browser).
const fs = require("fs"), vm = require("vm"), path = require("path");
const docs = process.argv[2] || "/home/user/nurzycom_brand/docs";
const ctx = { window: {}, console, crypto: require("crypto").webcrypto, TextEncoder, TextDecoder }; ctx.self = ctx.window; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(docs, "ctlogic.js"), "utf8"), ctx);
const CTL = ctx.window.CTL; let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const A = `1.
P: Honeybees that find a rich patch of flowers perform a dance whose angle and length ______ the direction of the food.
Q: Which choice completes the text with the most logical and precise word or phrase?
A) obscure
B) convey
C) delay
D) deny
Answer: B
Explanation: The dance tells other bees where the food is.
Skill: Words in Context
Level: Not provided in the PDF.

2.
P: Glass is made by melting sand. ______ it can be recycled many times.
Q: Which choice completes the text with the most logical transition?
A) Moreover,
B) However,
C) For example,
D) Similarly,
Answer: A
Level: Hard

Question 3
Q: If 3x + 5 = 20, what is the value of x?
Answer: 5
Level: лёгкий

4. P: A second line of the passage
continues here.
Q: What does the text mainly do?
A) one
B) two
C) three
D) four
Answer: d
Level: Medium`;
const r = CTL.parseText(A);
ok(r.qs.length === 4, "4 numbered questions found: " + r.qs.length);
ok(r.errs.length === 0, "no errors: " + JSON.stringify(r.errs));
ok(r.qs[0].a === "B" && r.qs[0].o[1] === "convey" && /______/.test(r.qs[0].passage) && r.qs[0].skill === "Words in Context", "Q1 options, key, passage, skill");
ok(r.qs[0].level === "M", "«Not provided» → средний (M)");
ok(r.qs[1].level === "H" && r.qs[1].a === "A" && r.qs[1].o[0] === "Moreover,", "Q2: Level Hard → H, key A");
ok(r.qs[2].type === "spr" && r.qs[2].a === "5" && r.qs[2].level === "E", "Question 3: typed answer 5, «лёгкий» → E");
ok(r.qs[3].passage === "A second line of the passage\ncontinues here." && r.qs[3].a === "D", "«4. P: …» on one line: passage kept, key d → D");
const old = CTL.parseText(`Q: One?\nA) a\nB) b\nC) c\nD) d\nAnswer: C\n---\nQ: Two?\nA) a\nB) b\nC) c\nD) d\nAnswer: A`);
ok(old.qs.length === 2 && old.qs[0].a === "C" && old.qs[1].a === "A", "old «---» format still works");
const bad = CTL.parseText(`1.\nQ: Missing key?\nA) a\nB) b\nC) c\nD) d\n\n7.\nQ: Fine?\nA) a\nB) b\nC) c\nD) d\nAnswer: B`);
ok(bad.qs.length === 2 && bad.errs.length === 1 && /^Вопрос 1:/.test(bad.errs[0]), "an error names the question by its own number: " + bad.errs.join(" | "));
console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0);
