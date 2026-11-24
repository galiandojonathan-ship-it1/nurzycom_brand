# nurzycom bank: instructions for question writers

You write ONE set of 10 original Digital SAT questions on ONE subtopic. They go into the «nurzycom bank» that Nurassyl
(an SAT tutor, SAT 1560) uses for personal homework. Quality and authenticity come first: every question must look and
feel like a real College Board question of its level, and every key must be beyond doubt.

## Files to read first (Codex: you have only tools/bank/; the private references are summarised in «Patterns» at the end)
- `tools/bank/taxonomy.md` — the subtopic codes, the College Board skill they belong to, and the trap codes.
- «Patterns» at the end of this file — a private study of recurring patterns on recent real tests (P-xx for Reading and Writing, M-xx
  for Math; meta-patterns M1–M4). Use the patterns that fit your subtopic (the table says how often each appears). Never
  copy a passage from it; it describes logic, traps and topic pools only.
- the King's Cross description in «Patterns» — a real College Board hard question, as a difficulty reference for «hard: true». Never copy or
  paraphrase it.
- the course word list (not in the repo: Codex uses topical words only, src "topic") — the 638 hard words of Nurassyl's course.
- Math only: the PrepPros book «150 Hard Questions» (only if Nurassyl gives it to you; never commit it): PrepPros «150 Hard Questions» (copyrighted).
  Use it ONLY as a catalogue of hard question types, techniques and traps at the 700–800 level. Write your own question:
  your own context, wording and numbers; never copy a stem, a table or an option set, and never just change the numbers.

## The set: 10 questions
- 7 **target** questions: test exactly the subtopic, the way it is tested on the SAT.
- 3 **control** questions (`kind: "control"`): same question type and look as the subtopic, written so that the student's
  habit for this subtopic picks the wrong answer and the key is of a different type. Examples:
  - transitions «contrast» set: a transition question whose right answer is a cause or restatement word, with a contrast
    word as the most tempting option;
  - b_splice set: the two parts are not both independent clauses, so the «fix the splice» option (period / semicolon) is
    wrong and the comma or no punctuation is right;
  - wic_precise set: the context reverses the expected tone, so the word with the usual connotation is the trap;
  - inference set: the hedged option beats the strong-sounding one, or the key draws on the second sentence, not the first;
  - Math linear-function set: the table is actually exponential, or the question asks for a different quantity
    (the y-intercept's meaning, not the slope).
  Write a one-line English `ctrl_note`: the habitual wrong pick and what makes the key different.
- Levels: 1 easy, 3 medium, 6 hard across the 10 (controls included). The group is advanced. A blind reviewer re-rates every
  question and the bank keeps the LOWER level, so «hard» must be hard on the real SAT scale (module 2 hard route), not merely long.
- **At least one question has `hard: true`**: genuinely hard, at the level of the King's Cross description in «Patterns»:
  - dense academic or literary-critical register; for cross-text, two texts that each make a real argument;
  - all four options are long (20–40 words), use the passage's own vocabulary, and look plausible;
  - the key is an abstract paraphrase that needs two parts of the passage (or both texts) put together;
  - each wrong option fails on ONE element only: reversed relation, too strong (M2: solely, always, proves), true but off
    the question, or new information the text never gives;
  - where it fits, use M4 (an apparent finding explained by how it was measured or sampled).
  For Math, `hard: true` means a multi-step problem at the top of the SAT range (parameters that cancel, M-05; systems with
  a parameter, M-06; quadratic from a symmetric table, M-27; similar solids k vs k² vs k³, M-18; M-22, M-23, M-29), where
  every wrong option is the result of a specific, common mistake.

### Self-test for every «H» and «hard: true» question (blind reviewers have been rating our «hard» as medium)
- A strong 1450+ student needs at least two reasoning steps and more than 90 seconds; if one rule or one look at the passage
  settles it, it is medium, so make it harder or label it M.
- RW hard: the right option is never the one that repeats the passage's words; at least two wrong options are attractive to a
  careful reader (each wrong on one point only); the passage is dense (abstract nouns, qualifications, a concession, a
  contrast between two views or two findings); the stem may ask about an underlined claim, an author's likely response, the
  function of a sentence inside an argument, or what «most logically completes» a chain with a hedge.
- Grammar/transition hard: long sentences with interrupters, the tested spot far from its subject, two options that each fix
  one problem but not both, transitions whose logic depends on the sentence before the previous one.
- Math «H» and «hard: true»: pick a hard item type from the PrepPros book (if you have it) first, then write your OWN question of that type
  (new context, wording, numbers, options) at the same demand; put «PP-<number>» in `pattern` (or the M-xx code). Reviewers
  calibrate against that book, and our «hard» questions were coming out medium.
- Math hard: a parameter, a condition on the number of solutions, a reverse question (find the input, the constant, the
  missing coefficient), a context that hides the model, or a figure described in words with two linked unknowns; wrong
  options are the results of real slips (sign, step short, wrong quantity, k vs k²).

## Authenticity rules
- Format, wording of stems and option style exactly as on the digital SAT (Bluebook). Use the standard stems («Which
  choice completes the text with the most logical and precise word or phrase?», «Which choice completes the text so that
  it conforms to the conventions of Standard English?», «Which choice most logically completes the text?», «The student
  wants to … Which choice most effectively uses relevant information from the notes to accomplish this goal?», «Based on
  the texts, how would … most likely respond to …?»).
- Passage length (words): easy 40–80, medium 70–120, hard 100–160; cross-text 50–100 per text; notes questions 4–6
  bullet notes («• ») plus the goal.
- Exactly one objectively correct answer. Three plausible wrong answers, each with a trap code from the taxonomy.
- Balance key letters across the set (no letter more than 4 times).
- Facts: only well-established facts (science, history of science, art, music, architecture, economics…). Research
  summaries may use a plausible research team («a team led by ecologist Maria Okafor») describing a hypothetical study, as
  the SAT does, but must not contradict established science and must not attribute invented findings or words to a real,
  named living person. No literary quotations (they cannot be checked against the source tonight); a literary-style
  passage must be your own prose and must not pretend to be a quotation.
- Themes: international only. Rotate through astronomy, ecology, marine biology, medicine, neuroscience, psychology,
  archaeology, palaeontology, geology, climate science, history of science, engineering, architecture, urban planning,
  economics, linguistics, music, visual art, film, literature (as a subject), skilled trades (P-31: HVAC, plumbing,
  carpentry, electricians, mechanics, logistics). At least 6 different fields in one set; never two questions in the same
  field back to back.
- **Never** use Kazakhstan, Kyrgyzstan, Central Asia, Russia or the post-Soviet region, their people, places or names.
  No current politics, wars, religion, or sensitive social topics. Names of people from many cultures (Nigerian, Japanese,
  Brazilian, Norwegian, Indian, Mexican, Korean, Italian…).
- No College Board or Barron's text, copied or lightly reworded.
- Math: clean numbers, no diagrams (describe a figure in words or give a table). About 2 of 10 Math questions are typed
  answers (`type: "spr"`, `accept: ["3/2", "1.5"]`); the rest multiple choice. Every Math question has a `check`: a short
  Python/sympy expression or snippet whose last line evaluates to the key's value (a number, or the letter for option
  checks), e.g. `from sympy import *; x=symbols('x'); solve(3*x+5-20, x)[0]`.

## Topical vocabulary (Reading and Writing)
Every RW passage carries words a strong B2 Russian-speaking student would not know:
- 2–3 **topical words** that belong naturally to the passage's field (e.g. ecology: *symbiosis, keystone, forage*;
  architecture: *buttress, cantilever, façade*; economics: *subsidy, liquidity*). Real academic words (word frequency about
  Zipf 2–4), not jargon only a specialist knows, not easy words.
- 1–2 **course words** from the course word list (not in the repo: Codex uses topical words only, src "topic") where they fit naturally (not forced).
- List each in `words`: `{ "w": the exact form in the passage, "lemma", "pos", "def": a simple English definition in the
  sense used here, "ru": "2–3 Russian equivalents", "src": "topic" | "course" }`.
- Never put a glossed word inside the answer options of Words in Context, transitions or grammar questions (the options
  are the answer); glossed words go in the passage or the stem.
- Math word problems: 0–1 topical word, only when natural.

## Explanations (Russian, for the teacher's answer sheet and the student's review)
- `explanation_ru`: 3–6 sentences. The evidence in the text (quote the key words in English), why the key follows, and in
  one short sentence each why the other three fail. For control questions, say what makes it different from the usual
  type of this subtopic. Math: the steps.
- `trap_ru`: the most tempting wrong option and exactly why it is wrong (1–2 sentences).
- Plain, precise Russian; English for quotations and SAT terms.

## Output: write ONE JSON file (UTF-8) at the path you are given, and nothing else
```
{ "sub": "<subtopic code>", "set": <n>, "questions": [ {
  "n": 1, "kind": "target" | "control", "hard": false, "level": "E" | "M" | "H",
  "skill": "<exact College Board skill, e.g. Transitions, Boundaries, Words in Context, Linear functions>",
  "pattern": "P-18" | "M-07" | "", "theme": "<field>",
  "passage": "<text; blank = ______ ; underline = __text__ ; paragraphs = blank line; table = | a | b | rows>",
  "stem": "<question>",
  "type": "mc" | "spr", "options": ["...", "...", "...", "..."], "key": "A" | "B" | "C" | "D" | "<spr value>",
  "accept": ["..."] (spr only), "traps": { "<wrong letter>": "<trap code>", … },
  "ctrl_note": "<control only>", "words": [ … ], "explanation_ru": "…", "trap_ru": "…", "check": "<Math only>"
} ] }
```
Before writing the file, solve every question yourself as a student would, from scratch, and fix anything ambiguous.
Reply with one line only: the path, the count, and how many are hard / control.


## Patterns (public-safe summary of the private pattern study; Codex works from this)
- **M1 clone engine:** the SAT reuses a passage with a different question type, so build each passage so that several question
  types could be asked about it; never rely on letter positions.
- **M2 hedging:** in hard questions the key is hedged («may partly reflect», «might not include», «moderately supported»); the
  traps are absolute (solely, consistently, proves, guarantees, all, will). When two options fit, the one that claims less wins.
- **M3 four kinds of wrong answer (every skill):** true but off the goal; swapped or reversed (more ↔ less, earlier ↔ later,
  cause ↔ effect); too strong; right topic but new information the text never gives.
- **M4 measurement artifact (core of the hard module):** an apparent finding explained by how it was measured or sampled
  (only rich households' records; 12 fish; captive vs wild; observers who only worked by day; averages hiding a sensitive
  subgroup). Use it in inference, evidence and cross-text hard questions.
- RW patterns: P-01 absolute phrase («…, each a portrait of…»); P-02 sentence boundary around a long phrase; P-03 semicolons in
  lists with internal commas; P-04 Words-in-Context opposite-meaning traps; P-05 WIC by tone; P-06 logical completion with a
  strict chain where the trap swaps one element; P-10 support/weaken that must hit the exact mechanism; P-12 table/graph
  completion (right row, variable, direction); P-13 quotation illustrates a claim; P-15 purpose/structure (the plain
  descriptive answer wins); P-16 function of a sentence; P-17 cross-text (Text 2's response; shared purpose); P-18
  transitions («Indeed» sharpens; «Specifically» narrows to a number or list); P-20 notes: the goal word decides
  (similarity / difference / order / specify / explain how / audience already familiar, P-39); P-22 dangling modifier;
  P-24 agreement across an interrupter; P-25 restrictive appositive, no commas; P-27 verb form and tense; P-28 negated
  WIC («hardly ___»); P-31 skilled-trades vocabulary; P-33 table with a constraint; P-37 «…, for instance, while…»;
  P-38 colon after a complete clause.
- Math patterns: M-01 asked for an expression, not the variable; M-02 interpret a model value; M-03 exponential; M-04
  percent chains; M-05 parameter that cancels or flips; M-06 number of solutions, line meets parabola; M-07 context model
  (first unit + (x − 1)); M-10 triangles; M-13 inequality from a context; M-18 similar figures k, k², k³; M-21 outlier: mean
  moves, median may not; M-22 sum of roots with a coefficient; M-23 exponential known at t ≠ 0; M-27 quadratic from a
  symmetric table; M-29 sum of coefficients = value at x = 1.
- **King's Cross (the «hard: true» reference, a real College Board cross-text item, not reproduced here):** Text 1 is a dense
  literary passage (a character sees a railway station as a gateway to something infinite, set against a showier
  neighbouring building); Text 2 is literary criticism arguing that the novel maps city = materialism, countryside =
  idealism. The question asks what the author of Text 2 would say about the station as Text 1 depicts it. All four options
  are 30–40 words and use both texts' vocabulary; the key is an abstract paraphrase joining both texts (a point of
  connection promising intangible abundance); the traps each fail on one element: reversed (the station as the intrusion
  of materialism), a misreading of tone (disillusionment), and a half-truth about appearance that inverts the comparison.
