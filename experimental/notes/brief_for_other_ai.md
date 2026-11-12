# NURZYCOM: SAT + IELTS course. The idea, as a brief for another AI

**Who this is for:** another AI that will write prompts for Claude to continue this work.
**How to use it:** read the whole brief, then use the prompt skeleton in section 9. This copy sits in a public repository; the lesson anatomy it describes is already in `experimental/README.md`, and lesson timings are not included.

---

## 1. The project in one paragraph

Nurassyl Kunanbayev (brand NURZYCOM) is an online tutor from Kazakhstan. His students are in grades 9–12 and are applying to Nazarbayev University or abroad. He already runs a 12-lesson SAT Reading & Writing course with a student website. The new product is a **combined SAT Reading & Writing + IELTS course**. It starts as an experimental demo website, and the first version was built overnight on 11 Nov 2026. The demo launches after the December 2026 SAT results.

## 2. The core idea

**Both exams test English.** Vocabulary in context, sentence structure, cohesion and reading strategy carry over between them. So the course **teaches each shared skill once, then shows how each exam tests it.** Skills that exist only in IELTS get their own lessons: Listening, Speaking, pronunciation and essay assembly.

**Be honest about the overlap.** Of 40 pairings between SAT domains and IELTS criteria, only 4 transfer directly, 19 partly and 17 not at all. The course shows this table publicly and does not oversell.

## 3. What makes it unique: the lacing

1. **One story runs through the whole course: "Making the world readable."** Lessons move maps → time → data → arguments. Examples:
   - C01: a map is useful because of what it leaves out.
   - C02: time zones and the date line.
   - C03: railways forcing towns onto one clock.
   - C04: a clock that solved longitude.
   - C07: Nightingale's diagram.
   - C12: back to maps, but now you only hear them (Listening).
2. **Inside a lesson, every part is about the same subject.** The words, the SAT passage, the IELTS passage, the speaking prompt and the writing task all talk about the same thing.
3. **The lesson's words reappear everywhere in that lesson:** passages, questions, the model spoken answer and the model written answer.
4. **Each lesson ends with a hand-off line** that turns its subject into the next lesson's subject. For example: "A clock turned time into position. Next, a census turns a country into a table."
5. **The course map is drawn as a two-line metro diagram,** because lesson C01 is about the London Underground diagram. A black line is SAT, a grey line is IELTS, and they meet at shared stations. A red line of text at each station states the story thread.

## 4. Course structure

| Block | Lessons | Content |
|---|---|---|
| A · The sentence | C01–C04 | word in context, boundaries, form and agreement, transitions |
| B · The paragraph | C05–C08 | selecting facts, data as evidence, main idea, structure and purpose |
| C · The argument | C09–C11 | inference, claim and support, two points of view |
| D · IELTS only | C12–C15 | Listening (maps, lectures), Speaking + pronunciation, essay assembly |
| E · Assembly | C16 | mixed review, realistic score range |

- **Track 2, "IELTS after SAT":** an 8-lesson bridge for students who have already finished the SAT course.
- **Proposal only:** a short IELTS fragment inside each of SAT lessons 1–10. The running SAT course is not changed until Nurassyl decides.

**Status on 12 Nov 2026:** 8 of 16 lessons are live (C01–C07, C12), all with the 4-step cadence; C01's IELTS part is rebuilt at exam size (see `IELTS_SPEC.md`). Next: C02–C07 IELTS parts at exam size, C12 Listening question types, then C08–C11, C13–C16.

## 5. The lesson anatomy (private)

Every lesson lasts 70 minutes at most. Each lesson has these parts, in this order:

1. **Words:** 8 words. Each has a Russian translation and two original example sentences, one SAT-style and one IELTS-style.
2. **SAT:** a 3-line rule card in Russian and 4 questions in the digital SAT format.
3. **IELTS-style:** one original passage of 200–260 words and 6 questions (True / False / Not Given plus multiple choice).
4. **Speaking:** a timed prompt, an optional recording that stays on the device, a pronunciation focus and a model answer.
5. **Writing micro-task:** a prompt, a minimum word count, a Russian self-check list and a model answer.
6. **Exit check:** 2 questions, one per exam.
7. **Result and hand-off:** the lesson score (never presented as an exam prediction) and the link to the next lesson.

IELTS-only lessons replace the SAT part with a **Listening** part. Its script is read aloud by the browser's speech synthesis, and a transcript opens after answering.

## 6. Rules that are never broken

- **Originality.** Every passage, question and example sentence is new and built on well-established facts. Never copy or reword material from College Board, Cambridge/IELTS or any publisher. Quotations may come only from public-domain works, checked word for word.
- **Unsure facts.** If a date or number is uncertain, leave it out.
- **Languages.** Instructions and explanations for students are in Russian. Exam content is in English. Russian sentences are short.
- **Keys.** Every question has a short Russian explanation: why the key is right and why the tempting options are wrong. Each question has exactly one defensible answer. Every key is solved twice, independently, before it is marked "checked ×2".
- **Teacher facts.** Use only these: SAT 1560 (Reading & Writing 760, Math 800); IELTS 8.0 overall, test of 28 Feb 2025 (L 8, R 8.5, W 8, S 7). Never write IELTS 8.5 overall. Never call him a native speaker.
- **No invented proof.** No prices, testimonials, student names, statistics or promised scores. Score language is always "a realistic range after a diagnostic". Unknown facts appear as a visible `[FACT NEEDED]`.
- **Public method.** Public pages may name only active recall, vocabulary expansion and a supportive atmosphere. Lesson timings and tutor procedures stay private.

## 7. Decisions Nurassyl has made

| Question | Answer |
|---|---|
| Who is the course for? | Both new students and graduates of the SAT course |
| Bridge for SAT graduates? | Yes, plus IELTS fragments inside the SAT course |
| Pace | Does not matter |
| Listening | IELTS-only, taught in class |
| Speaking range | He takes students from band 5.0 to 7.0 and higher. The course suits strong students who lack exam knowledge. |
| IELTS Writing as a separate offer | No |
| Marking load | Claude's choice: one micro-task and one recording per student per week, two full essays per course |
| Launch | After the December 2026 SAT results, as a demo first |

**Still open:**
- Keep or replace True / False / Not Given in C12 Listening (real IELTS Listening does not use it).
- Whether the public site may show a target Speaking band. Verified Speaking is 7.0, so naming "7.0 and higher" is a credibility risk.
- Prices, start date and minimum level.
- A checked list of Academic Word List words and its terms of use.

## 8. Where things live

- **Repo:** `galiandojonathan-ship-it1/nurzycom_brand`. It is public, so private method details must not be committed there in plain text.
- **Branch:** `experimental-site`. **Folder:** `experimental/`. It is not deployed, and every page has `noindex`.
- **Content:** all course content is in `experimental/assets/data.js`. The format and the build order are in `experimental/README.md`.
- **Protected:** `main`, `docs/` (the live student site), `site/`, `functions/`, `deploy/`, `notes/`, encrypted data, and the running SAT course. Never touch these.
- **Ground truth:** `CLAUDE.md` in the repo is the single source of truth for brand, facts and hard rules.

## 9. How to write a prompt for Claude from this brief

A good prompt for the next session contains:

1. **Setup:** attach the repo with push access, check out `experimental-site`, and read `CLAUDE.md`, `experimental/README.md` and `experimental/assets/data.js`. The live lessons are the quality bar.
2. **One concrete task:** for example, "build C05 and C06". Name each lesson's subject, its SAT skill and its IELTS skill, and say how its subject grows out of the previous lesson.
3. **The lacing requirement:** the words reappear in the passages and models, and the hand-off leads to the next lesson.
4. **The rules in section 6,** restated briefly.
5. **The protected areas,** and an instruction to change files only inside `experimental/`.
6. **Verification:**
   - Re-solve every key blind.
   - Use Playwright at 320, 360 and 1280 px: no page errors, no horizontal overflow, and every correct key gives a full score.
   - Confirm that `git diff --stat origin/main` lists only `experimental/` paths.
7. **Finish:** commit, push only `experimental-site`, and give a short report in plain language. The report covers what was added, what is uncertain and what to do next.
8. **Unattended runs only:** say "do not ask questions, make sensible calls and record them". Give a time limit if other runs follow on the same branch.

**Prompt skeleton:**

> You are continuing the NURZYCOM SAT + IELTS course demo. Attach `galiandojonathan-ship-it1/nurzycom_brand` (push access), check out `experimental-site`, and read `CLAUDE.md`, `experimental/README.md` and `experimental/assets/data.js`.
>
> **Task:** [lessons or feature]. Subject of each lesson: [subject], grown from [previous lesson's subject]. SAT skill: [skill]. IELTS skill: [skill].
>
> Follow the lesson anatomy and the lacing rules in the README. All content is original and uses only well-established facts. Russian for explanations, English for exam content. Solve every key twice.
>
> Change files only in `experimental/`. Never touch `main`, `docs/` or the live SAT course.
>
> **Verify:** re-solve all keys blind; run Playwright at 320, 360 and 1280 px; confirm that the diff against `main` lists only `experimental/` paths.
>
> **Finish:** commit, push `experimental-site`, and give a short report: what was added, what is uncertain, what to do next.
