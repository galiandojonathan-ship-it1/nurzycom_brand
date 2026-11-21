# experimental/ — NURZYCOM experimental site (not deployed)

An experimental concept for the brand site plus a **demo version of the combined SAT Reading & Writing + IELTS course**.
Branch `experimental-site` only. Nothing here is linked from, or changes, the live sites (`site/`, `docs/`).
Every page carries `noindex` and an "Experimental draft" label.

## Pages

| Path | What it is |
|---|---|
| `index.html`, `ru/index.html` | Brand landing concept (EN / RU): results, lessons, method, story, FAQ, contact |
| `course/index.html` | Course demo: the two-line map of 16 lessons, the honest skill-transfer table, the bridge track, IELTS fragments for the SAT course |
| `course/slides.html?id=C01` | **Step 1 · Presentation:** the lesson's 16:9 slide deck (English), keyboard / swipe / full screen / print to PDF |
| `course/lesson.html?id=C01` | **Step 2 · Website homework:** words → SAT → IELTS → speaking → writing → exit check → next steps and hand-off |
| `course/office.html?id=C01` | **Step 3 · Office hours:** the student's own mistakes tagged by type, peer feedback on writing, live speaking prompts, a summary for the teacher |
| `course/progress.html` | **Step 4 · Progress:** four-step grid, diagnostic and check-ins by skill, first-attempt accuracy by skill, retry of missed questions, writing and speaking in numbers |
| `course/lesson.html?id=D0`, `?id=K1`, `?id=K2` | The diagnostic, the Block A check-in (parallel forms, same blueprint) and the Block B check-in |
| `assets/data.js` | Course data and lesson (homework) content |
| `assets/cadence-data.js` | Cadence content: `CADENCE` (steps, trap types, IELTS criteria, check-in plan, skill names), `DECKS` (slides), `OFFICE` (office hours), check-ins `D0`, `K1`, `K2` |
| `assets/common.js` | Shared state, the four-step strip, skill tagging, writing metrics |
| `assets/lesson.js`, `slides.js`, `office.js`, `progress.js`, `course.js`, `styles.css` | Renderers and styles, no build step, no dependencies |

Open locally: `python3 -m http.server` inside `experimental/`, then `http://localhost:8000/`.

## The idea that ties the course together

One theme runs through all 16 lessons: **Making the world readable** (maps → time → data → arguments).
Inside a lesson, the words, the SAT passage, the IELTS passage, the speaking prompt and the writing task are all about the same subject, and each lesson hands its subject to the next one. The course map is drawn as a two-line transit diagram because lesson C01 is about exactly such a diagram.

## The 4-step cadence (added 11 Nov 2026, Nurassyl's request)

Every lesson runs the same four steps, and each step feeds the next:

| Step | Where | What happens | What it hands on |
|---|---|---|---|
| 1 · Presentation | `slides.html` | In class: recall of last lesson's words, today's words, the story, numbered rules (how and why) with the common mistake, a worked SAT example and solution, the same skill in IELTS with its own worked example, the speaking and writing tasks, the next three steps, the hand-off | The skill and the words, ready for homework |
| 2 · Website homework | `lesson.html` | Words, SAT questions, IELTS passage, speaking drill, writing micro-task, exit check; first attempt only | Every answer and the written text, stored for steps 3 and 4 |
| 3 · Office hours | `office.html` | Live, group or one-to-one, three things only: analysis of the student's own SAT (or Listening) mistakes, each tagged by trap type; peer feedback on IELTS writing by the four criteria, practised first on a sample with planted problems, then on each other's homework texts; live speaking on prompts from the same subject | A summary the student sends before the session; tags and peer accuracy for step 4 |
| 4 · Progress | `progress.html` | Retry of every missed question after office hours (counted separately; closes step 4); skills by first attempt; diagnostic vs check-in by skill; writing and speaking counted | Measurable growth per skill and per block |

Block level of step 4: the diagnostic `D0` before C01 and check-in `K1` after C04 share one blueprint (2 × Words in Context, 2 × Boundaries, 2 × Form, Structure, and Sense, 2 × Transitions, 3 × IELTS True / False / Not Given) with new texts, so the change per skill is the growth of Block A. K2 (after C08, built 15 Nov) uses its own blueprint for Block B: 2 × Rhetorical Synthesis, 2 × Command of Evidence (quantitative), 2 × Central Ideas and Details, 2 × Text Structure and Purpose, 3 × IELTS matching information. D0 does not measure these skills, so the progress page sets K2 beside first-attempt homework in C05–C08 on the same skills (shares, not counts). K3 after C11 compares first attempts with two Inferences, two Command of Evidence (textual), two Cross-Text Connections and three IELTS True / False / Not Given items. KF after C16 samples eight SAT skills, IELTS Reading and IELTS Listening. It reports same-skill shares next to first attempts across the course.

**Presentation template** (`DECKS.Cnn`): `rules: [[rule, how and why] × 3]`, `mistake`, `story: [[heading, text] × 3]`, `bridge: [heading, text]`, `ex: [SAT example, IELTS example]`. Each example: `exam, label, text or passage, stem, opts + key` (or `tf: true` and `key: "T" | "F" | "NG"`), `steps` (3), `check`, `why` (one line per option, in option order), `chk`. Worked examples are always new items, never homework questions. Slide order follows the SAT course decks: recall → Part 01 today's words → Part 02 story → Part 03 rules, example, solution → Part 04 bridge, example, solution → Part 05 speaking → Part 06 writing → the next steps → hand-off.

**Office hours template** (`OFFICE.Cnn`): `focus` (Russian: what the mistake analysis looks at), `peer: { task, sample, issues: [[criterion, Russian note]] }` (a sample by an invented student with 2–3 planted problems), `live` (3 English prompts on the lesson's subject).

**Skill codes** (`code` in `COURSE.lessons`, `skill` on check-in items): WIC, BND, FSS, TRN, RS, COEQ, CID, …, R-TFNG, R-MC, LIS. Homework items get their skill from the part: `sat` → the lesson's code, IELTS True / False / Not Given → R-TFNG, other IELTS → R-MC, `listen` → LIS.

What stays out of this public folder: lesson timings, tutor run-sheets for office hours, and any marking scheme beyond the public IELTS criteria names.

## Decisions taken (Nurassyl's answers, 11 Nov 2026)

- Audience: both new students and SAT-course graduates. Graduates get the 8-lesson bridge (`COURSE.bridge`).
- IELTS fragments inside the running SAT course: listed as a proposal (`COURSE.fragments`). The live SAT course is untouched.
- Listening: IELTS-only, taught in class (lessons C12, C13).
- IELTS Writing is not sold as a separate offer. Writing appears only as micro-tasks and one assembly lesson inside the course. **Assumption, to confirm.**
- Launch after the December 2026 SAT results; this is the first demo version.
- Marking load chosen: per student, one writing micro-task and one recording a week, two full essays per course.

## Content rules (do not break)

- Every passage, question and example sentence is original and built on well-established facts. Nothing is copied or reworded from College Board, Cambridge/IELTS or any publisher. Public-domain quotations only, checked word for word.
- Student instructions and explanations in Russian; exam content in English.
- Every question has a short Russian explanation and `chk: 2` only after its key was solved independently twice.
- Teacher facts: SAT 1560 (RW 760, Math 800); IELTS 8.0 overall, 28 Feb 2025 (L 8, R 8.5, W 8, S 7). Never IELTS 8.5 overall, never "native speaker".
- No prices, testimonials, student names, statistics or promised scores. Unknown facts are visible `[FACT NEEDED]` placeholders.
- No lesson timings, tutor guides or step-by-step teaching procedure in this folder (the method stays private; this repository is public).

## Key checks

- 2026-11-20 · Final QA: independently re-solved edited C01–C03, D0, K1 and K2 items from redacted text. The new C03 Reading 12 key is “telegraph offices”.

- 2026-11-20 · C16 and KF: 29 homework questions, two slide examples and 16 final-check items independently solved. Re-solved C16 SAT 4, Reading 12 and KF SAT 2 and 6 after editing wording and literal gap insertion.

- 2026-11-20 · C15: three exit questions and two slide examples independently solved.

- 2026-11-20 · C14: three exit questions and two slide examples independently solved. Exit 3 tightened to ask for a general reason.

- 2026-11-20 · C13: 12 homework questions and two worked examples independently solved. “Noon” and “local noon” both occur in the recording and are accepted.

- 2026-11-20 · C11 and K3: 19 homework questions, two slide examples and nine check-in items independently solved. Re-solved revised C11 SAT 1 and 3, Reading 1, 5, 8 and 12, and K3 SAT 1–2.

- 2026-11-20 · C10: 19 homework questions and two slide examples independently solved. Re-solved the revised SAT 1–2, Reading 10–11 and Exit 2 after tightening the evidence and its scope.

- 2026-11-20 · C09: 19 homework questions and two slide examples solved independently from redacted text and diagram. Re-solved the revised homework questions after narrowing the wording of SAT 1 and 3, Reading 4 and Exit 2.

20 November audit: C04–C08, C12 and K2 (118 scored items) independently solved from redacted copies before the course files were edited. The QA report records the wording and acceptance fixes. The keyed options stayed in the same positions.

| Lesson | Questions | First check | Second check (independent re-solve) |
|---|---|---|---|
| C01 | 19 (IELTS part rebuilt at exam size: 13 items) | 2026-11-12 | 2026-11-12 |
| C02 | 19 (IELTS part rebuilt at exam size: 13 items; one gap item fixed on the second solve) | 2026-11-13 | 2026-11-13 |
| C03 | 19 (IELTS part rebuilt at exam size: 13 items; one short answer widened to accept "telegraph" on the second solve) | 2026-11-14 | 2026-11-14 |
| C04 | 19 (IELTS part rebuilt at exam size: 13 items) | 2026-11-15 | 2026-11-15 (blind re-solve by a separate agent: 13 of 13; five stems de-echoed) |
| C08 | 19 (new lesson) + 2 slide examples | 2026-11-15 | 2026-11-15 (blind re-solve by a separate agent: 21 of 21) |
| K2 (check-in B) | 11 | 2026-11-15 | 2026-11-15 (blind re-solve by a separate agent: 11 of 11; K2 passage and one option reworded after its notes) |
| C07 | 19 (IELTS part rebuilt at exam size: 13 items) | 2026-11-15 | 2026-11-15 (blind re-solve by a separate agent: 13 of 13; 4 items tightened) |
| C06 | 19 (IELTS part rebuilt at exam size: 13 items) | 2026-11-15 | 2026-11-15 (blind re-solve by a separate agent: 13 of 13) |
| C05 | 19 (IELTS part rebuilt at exam size: 13 items; question 10 now has "years" after the gap, so only the number is accepted) | 2026-11-15 | 2026-11-15 (blind re-solve by a separate agent: 13 of 13) |
| C02 | 12 | 2026-11-11 | 2026-11-11 (blind re-solve by a separate agent) |
| C03 | 12 | 2026-11-11 | 2026-11-11 (blind re-solve by a separate agent) |
| C04 | 12 | 2026-11-11 | 2026-11-11 |
| C07 | 12 | 2026-11-11 | 2026-11-11 (blind re-solve by a separate agent: 12 of 12 keys matched; wording of 3 items tightened after its notes) |
| C12 | 12 (rebuilt 2026-11-15: 10 listening + 2 exit) | 2026-11-15 | 2026-11-15 (blind re-solve by a separate agent from the transcript: 12 of 12) |
| C12 (old version) | 8 | 2026-11-11 | 2026-11-11 (blind re-solve by a separate agent from the transcript: 8 of 8 keys matched) |
| C05 | 12 | 2026-11-11 | 2026-11-11 |
| C06 | 12 | 2026-11-11 | 2026-11-11 |
| D0 (diagnostic) | 11 | 2026-11-11 | 2026-11-11 |
| K1 (check-in A) | 11 | 2026-11-11 | 2026-11-11 (one boundary item rewritten: option C allowed a second correct sentence) |
| Slide worked examples, 8 lessons | 16 | 2026-11-11 | 2026-11-11 |

Third pass, 2026-11-11 (quality-check run): all 68 questions solved again with the keys hidden; 68 of 68 matched. Three items were reworded so that only one answer can be defended (C01 exit 2, C04 IELTS 4, C12 listening 6); their keys did not change.

## Open `[FACT NEEDED]`

1. Student result with official score and written consent (landing).
2. Start date of the combined course.
3. Minimum level for the combined course.
4. Portrait and story text approved by Nurassyl.
5. Phone playback, human listening recordings and pilot feedback before a public course launch.
6. Academic Word List: coverage is measured below. Permission would be needed before reproducing the University's protected material commercially.

## Lesson data format (for the next build run)

`window.LESSONS.Cnn = { id, title, thread, intro (RU), words: [8 × { w, pos, ru, sat, ielts }], parts: [...], handoff: { text, next } }`

Combined lessons use `sat` → `ielts` → `speak` → `write` → `exit`. Academic Reading parts use one full passage and 13 questions. C16 also includes Listening. C12–C15 are IELTS-only and use the parts that fit their focus. Check-ins have their own shorter blueprints.
A lesson may include a `listen` part: `{ type: "questions", id: "listen", audio: [sentences read by the browser], transcript: [...], items: [...] }`.
Question kinds: `mcq` (`opts`, `key` = index) and `tfng` (`key` = "T" | "F" | "NG"; add `yn: true` on each item for Yes / No / Not Given). Set a lesson's `status` to `"live"` in `COURSE.lessons` when it is complete.

IELTS-only lessons may also set `wordsTitle`, `wordsRu` and `wordLabels: [a, b]`, and give each word `ex: [a, b]` instead of `sat` / `ielts` (see C12). The renderer shows "IELTS only" in the header when a lesson has no `sat` part, and reads `audio` one sentence per utterance (a single long utterance is cut off in some browsers). Keep `audio` and `transcript` word-for-word the same. Since 15 Nov a listening part may set `voices: { Name: { pitch, rate, lang } }`: audio lines written as `Name: text` are read with that speaker's settings (and a different browser voice where one exists), and the label is not read aloud; the transcript keeps the label once per turn. A plan-labelling group uses `places: n` (letters A…) and `plan` (trusted inline SVG, written in this repo only) with `planCaption`.

Build order: ~~C02, C03~~, ~~C07, C12~~, ~~C05, C06~~ (all done 2026-11-11), then C08–C11, C13–C16. Each new lesson needs its homework (`LESSONS`), its deck (`DECKS`) and its office hours (`OFFICE`); K2 goes with C08.

**IELTS exam format (12 Nov 2026, pilot in C01):** spec in `IELTS_SPEC.md`; measure any passage with `python3 tools/ielts_measure.py --lesson C01` (words, sentence length, Flesch–Kincaid; AWL share with `--awl list.txt`). A part may set `lettered: true` (paragraphs A, B, C…) and `glossary: [[term, gloss]]`. An item may open a question group with `group: { title, task (English exam instruction), ru, headings? }`. New kinds: `match` (heading matching: `key` = index into the group's `headings`, shown as i, ii, iii…) and `gap` (typed answer: `accept: [...]`, `limit` = word limit; over the limit counts as wrong). All pages check answers through `NZ.ok(q, a)`. Measured before the rebuild: C01, C04, C06 and C07 passages were 212–254 words at grade 8–10; the rebuilt C01 passage is 754 words, 22.2 words per sentence, grade 11.6. The other lessons' IELTS parts are still short and are next.

**Notes and tests (12 Nov 2026):**

| Path | What |
|---|---|
| `notes/course_design_v0.1.md` | First course design (Russian), with a status box of what changed since; the minute-by-minute lesson timing is left out (public repo) |
| `notes/brief_for_other_ai.md` | The course idea as a brief, with a prompt skeleton for new sessions |
| `notes/student_weak_spots.md` | Nine categories of likely student weak spots with signs and where each shows; a copy of the private doc where the homework column is filled |
| `tools/tests/` | Playwright tests: whole site, IELTS formats, single-file build; how to run in `tools/tests/README.md` |

`tools/bundle_single_html.py` builds the whole site into one HTML file for sharing (`python3 tools/bundle_single_html.py out.html`).

IELTS-part tables: a part may carry `table: { caption, head, rows }`, shown above its questions. A question group may also carry `flow: [steps]` and `flowTitle` for flow-chart completion (boxes joined by arrows; gap stems repeat their step). Since 15 Nov a writing part may carry the same `table` (shown above the task), and a question group may carry `group.table` for table completion (cells hold numbered gaps like `(6) ______`; each gap item's stem repeats its row so office hours and retries make sense without the table). Notes in Rhetorical Synthesis items use `\n•` line breaks.

## Calls made in the overnight run of 11 Nov 2026 (to confirm with Nurassyl)

- C07 and C12 are live although the lessons before them (C05, C06, C08–C11) are not built yet, so C07's intro refers back to C06 and both hand-offs point to planned lessons.
- C07 facts kept deliberately plain: Scutari, November 1854; Sanitary Commission, spring 1855; work with William Farr after 1856; diagram published 1858. Left out because not certain enough or not needed: exact death counts, Queen Victoria receiving a copy, the Statistical Society election. The real diagram has two circles; the texts say "circles, each divided into twelve wedges".
- C12: Larkmoor College, Dana and Mill Road are invented. The script is 200 words. Listening was checked from the transcript and with a stubbed speech engine; **nobody has yet listened to it with a real browser voice** (the build server has none). Listen once on a phone before showing it to students.
- C12 has 8 scored questions (6 listening + 2 exit), not 12, because it has no SAT and no Reading part.
- The map row for C12 now reads "Listening: directions on a map, predicting the answer type" (forms are not in this lesson).

## Build queue (scheduled runs work from the top)

Each scheduled run takes the first unchecked items it can finish **to the full quality bar** (usually one or two), ticks them here with the date, and pushes. The final run of a batch is always the QA item.

- [x] C01 IELTS part at exam size (12 Nov): 754 words, grade 11.6. Types: matching headings, True / False / Not Given, summary completion.
- [x] C02 IELTS part at exam size (13 Nov): 752 words. Types: matching information (paragraph letters), sentence completion (one word), multiple choice.
- [x] C03 IELTS part at exam size (14 Nov): 675 words, grade 11.3. Types: matching sentence endings (A–H, `group.labels: "letters"`), note completion, short-answer questions.
- [x] C04 IELTS part at exam size (15 Nov, run 1): 984 words, 7 paragraphs, 25.2 words per sentence, grade 12.1. Types: matching features (7 people → 5 statements, `group.labels: "letters"`), table completion (`group.table`, two words), multiple choice. Blind re-solve by a separate agent: 13 of 13 keys matched; five stems reworded afterwards so they no longer echo the passage.
- [x] C05 IELTS part at exam size (15 Nov, run 1): about 760 words, 7 paragraphs, 25 words per sentence, grade 13.6. Article "Counting Heads: A Short History of the Census". Types: True / False / Not Given (two NOT GIVEN with real-world traps: John Rickman, census fines), short-answer questions, summary completion with a word box (match kind, A–H). The Marsh End table moved to the writing part (`table` on a writing part). Blind re-solve: 13 of 13 matched; paragraph E reordered so the 1801–1811 counts, not 1841, settle the growth debate.
- [x] C06 IELTS part at exam size (15 Nov, run 1): 814 words, 7 paragraphs, 23.2 words per sentence, grade 11.6. "The Doctor Who Followed the Water". Types: matching headings (9 headings, paragraphs B–G), flow-chart completion (new `group.flow`), multiple choice. Flow chart chosen instead of table completion because C04 already covers tables. Blind re-solve: 13 of 13; flow-chart stems paraphrased and paragraph G now names the General Board of Health's committee (the parish inquiry largely accepted Snow) after its notes.
- [x] C07 IELTS part at exam size (15 Nov, run 1): about 750 words by the script, 7 paragraphs, 22.6 words per sentence, grade 11.5. "More Than a Lamp", a discursive passage with a clear writer's position (Nightingale as statistician; her diagram as an argument to read critically). Types: Yes / No / Not Given (new: `kind: "tfng", yn: true`, keys stay T / F / NG, labels YES / NO / NOT GIVEN on every page), matching sentence endings (A–G), summary completion (ONE WORD ONLY). Blind re-solve: 13 of 13; two Yes / No / Not Given items and two endings rewritten afterwards because a second answer or word-matching was possible.
- [x] C12 Listening rebuilt (15 Nov, run 1): two sections in one recording, about 500 words. Section 1 (assistant and student, form completion as a `group.table`, ONE WORD AND/OR A NUMBER, 4 items), Section 2 (guide's tour, plan labelling with an inline SVG plan, `group.places: 8` and `group.plan`, 4 items; then multiple choice, 2 items). Corrections: course (History → Geography), the letter of offer dropped, sports-hall building turned into a lecture theatre, bus stop moved, café closed. No True / False / Not Given. Exit question 2 now tests a time correction. Blind re-solve from the transcript: 12 of 12; the Block item lost its correction afterwards so that not every answer is corrected.
- [x] Lesson C08 "How a Report Persuades" (15 Nov, run 1): homework (8 words; 4 SAT Text Structure and Purpose; IELTS passage "A Report Built to Persuade" on Chadwick's 1842 report, 694 words, grade 11.9, 22.4 words per sentence in the original build (remeasured on 20 Nov before edits), with matching information (paragraph letters, any letter more than once), sentence completion and multiple choice; Speaking Part 2 for two full minutes; a Task 2 body paragraph of 90+ words; exit), deck `DECKS.C08`, office hours `OFFICE.C08`, check-in `K2` and its progress table. Blind re-solve: 30 of 30 plus both slide examples; afterwards one SAT text, one passage sentence, one K2 option and the K2 passage (now two sentences per paragraph, less word-matching) were reworded.
- [x] QA pass (20 Nov): 118 scored items independently solved. C04–C08 passed reading size, grade and sentence checks. See the QA report for measurements, corrections and the limits of source and device verification.
- [x] C09 · Inferences and diagram label completion (20 Nov): 692 words, grade 11.3, 23.1 words per sentence. Yes / No / Not Given, diagram labels, multiple choice. Homework, slides and office hours.
- [x] C10 · Command of Evidence (textual), 20 Nov: 653 words, grade 12.6, 20.4 words per sentence. Matching headings, summary with a word box and multiple choice. Homework, slides and office hours.
- [x] C11 and K3 (20 Nov) · Cross-Text Connections and Block C check-in. C11 Reading: 737 words, grade 11.2, 20.5 words per sentence. Matching features, sentence completion and multiple choice. K3: nine short scored questions.
- [x] C13 · Listening lecture (20 Nov): 482 spoken words, 36 utterances, 10 ordered Part 4 note-completion items, two exit items and two slide examples. Homework, slides and office hours.
- [x] C14 · Speaking (20 Nov): all three parts, local playback and download, Russian self-review, 3 exit items and 2 slide examples. Homework, slides and office hours.
- [x] C15 · Writing assembly (20 Nov): complete Task 2 discussion, 282-word original model, all four public criteria, three exit items and two worked examples. Homework, slides and office hours.
- [x] C16 and KF (20 Nov) · Mixed review and final check. C16 Reading: 691 words, grade 12.7, 25.6 words per sentence. C16: 29 scored items across SAT, Reading, a ten-question Listening Part 3 dialogue and exit. KF: 16 scored items across SAT, Reading and Listening.
- [x] QA (20 Nov) · Rechecked revised keys, dates and figures, all 12 Reading passages, mobile and keyboard paths, and the three browser suites. See End-of-course QA for measurements and the verification limits.
- [x] Follow-up QA (21 Nov) · Measured AWL coverage and checked Orca and native Chromium speech. Added text positions to the C12 plan, exposed answer status to screen readers and fixed voice-locale and interrupted playback handling.

**Type coverage across the demo.** Reading includes matching headings (C01), True / False / Not Given (C01, C05), summary completion (C01; with a word box C05), matching information (C02), sentence completion (C02), multiple choice (C02, C04), matching sentence endings (C03), note completion (C03), short-answer questions (C03, C05), matching features (C04), table completion (C04), flow-chart completion (C06), Yes / No / Not Given (C07). Diagram label completion (C09), using an original SVG and typed labels. Listening notes: C13 and KF. C16 adds matching actions to speakers in a Part 3 discussion. C12 uses forms, plans and multiple choice.

## Loop log

- 2026-11-21 · Follow-up QA: measured exact AWL forms for the Reading passages and vocabulary cards. Checked three accessible lesson states with Orca and all four Listening scripts with Chromium's native speech backend. See the follow-up below for device coverage and the tests.

- 2026-11-20 · Final QA: ran all three browser suites, tested contrast and accessible names at 320 and 360 px, remeasured all Reading passages and documented source corrections. The full demo contains 16 lessons and five checks.

- 2026-11-20 · C16 and KF: closed the course thread with a guide trial, a different Listening discussion, a personal review and an original mixed final check. Added a link from C16 and a skill comparison in Progress.

- 2026-11-20 · C15: full Task 2 discussion of shared and local timetable formats. The browser test verifies the 250-word gate, the visible model paragraphs and persistence of the student draft.

- 2026-11-20 · C14: added three Speaking sections and a local recording download tested with a simulated microphone. The optional timer runs Part 2 and does not stop the combined recording. Progress stores completion only.

- 2026-11-20 · C13: full-length Part 4 question count, one fictional railway lecture, notes and a check that the speech engine receives the same text as the transcript. The timing example illustrates [NIST’s distinction between transmission delay and clock instability](https://tf.nist.gov/general/pdf/1799.pdf). The Reading measuring tool skips lessons that have no Reading passage.

- 2026-11-20 · C11 and K3: taught where two views diverge, linked the check-in from C11 and added same-skill comparisons to Progress. The market debate is fictional. The history of the metre was checked with the [BIPM](https://www.bipm.org/en/history-si/metre).

- 2026-11-20 · C10: compared medical claims with the results that would support them. Dates and structure of the historical comparison checked against the [James Lind Library](https://www.jameslindlibrary.org/semmelweis-i-1861/) and a [historical review](https://pmc.ncbi.nlm.nih.gov/articles/PMC3807776/).

- 2026-11-20 · C09: lesson, deck and office hours added. Browser test checks an accessible SVG and typed diagram labels.

- 2026-11-20: audited C04–C08, C12 and K2. Two blind solves recovered all 118 intended keys. Fixed ambiguities, source-word grading, a C12 recording-order problem, historical figures and mobile/keyboard issues. Reading measurements (words / Flesch–Kincaid grade / words per sentence): C04 987 / 12.2 / 25.3; C05 759 / 13.6 / 25.3; C06 814 / 11.6 / 23.3; C07 750 / 11.2 / 22.1; C08 721 / 12.0 / 23.3. Queued the remaining lessons and a final QA pass.

- 2026-11-15, run 1 of 5: C04 and C05 IELTS parts at exam size; renderer: `group.table` and a table on writing parts. Calls: C04 says Harrison was "never formally awarded the prize itself" and leaves out sums paid; C05 says Denmark's register census dates from "the early 1980s" (not a year) and Han China's count "close to sixty million". The old C04 item "Harrison himself sailed to Jamaica" is gone with the old passage. Then C06 (flow chart; C06 keeps Snow's "roughly eight times", from 315 vs 37). The C06 passage is about a disease outbreak, which IELTS_SPEC.md says to avoid as a main subject; kept because the lesson is built on Snow, told neutrally as a story of method. `ielts_formats.test.js` now also checks the C04 table group, the C06 flow chart and the C05 writing table. Then C07 (Yes / No / Not Given; the skill R-TFNG now reads "True / False / Not Given, Yes / No / Not Given"). C07 leaves out the Statistical Society election, as the 11 Nov run did. Then C12 Listening (two voices now differ by pitch and, where the browser has several English voices, by voice; still nobody has listened on a real phone). Then C08 with K2. Calls: C08's SAT item 3 says the 1848 Act made local boards compulsory only where the death rate was especially high (no threshold given); the K2 notes keep only the 1807 Pall Mall demonstration and that lamps were lit by hand. The skill code TSP was added to `CADENCE.skills`. All Build-queue items except the QA pass are now ticked; run 2 should start with the QA item only if Nurassyl adds nothing to the queue, otherwise with any new item.

## Calls after QA (to confirm with Nurassyl)

- Confirm the minimum entry level, launch and bridge plan, and feedback workload. Pilot the short checks before relying on individual skill comparisons. Confirm availability of original human Listening recordings and phone playback.

- KF is a short final check across exam tasks. It reports the sampled skills and gives no converted score. Speaking and Writing remain separate qualitative assessments in C14–C16.

- C15 is the full Writing Task 2 exercise within the combined course. The website checks the word count and saves the draft. The teacher gives qualitative feedback using the public criteria.

- C14 lets learners export a recording themselves. Keep pronunciation and fluency judgments with a person. The recorded audio is not part of course progress or automatically shared.

- C13 has the official number of Part 4 items. Browser speech is a practice aid. Use a human recording and a phone playback check before presenting it as exam simulation.

- K3 shows skill results beside C09–C11 first attempts. The short sets have different item counts and difficulty, so treat each comparison as practice feedback.

- C10 uses the title “What Changed in the Ward”. The earlier “The Doctor Nobody Believed” overstated what the historical evidence supports.

- C09 uses a fictional canal log and a teaching model of its gauge. The diagram is original and its labels use words from the article.

- Keep C12 as clearly marked short practice. A real recording and playback on a phone are needed before using it as exam simulation.
- Keep C08's history and teach persuasion through a selected reading route. In C06 use rates recalculated from Snow's original counts so the student can reproduce them.
- Keep the demo labelled as such until the minimum entry level, start date, bridge use and teacher feedback load are confirmed. Treat check-ins as practice until a pilot provides item-level evidence.

## Calls made in the cadence run of 11 Nov 2026 (to confirm with Nurassyl)

- The prompt named no lessons, so this run built the next two in order, C05 and C06, and put the cadence on all eight live lessons.
- C05 uses a fictional town (Marsh End) for its table, labelled fictional. C06 uses John Snow's own figures for the 1854 epidemic (315, 37 and 59 deaths per 10,000 houses, rounded): check them against a source before anything is published.
- C06's thread now reads "A map of marks became an argument" (Snow drew short bars, not dots), and C07's intro was changed to match.
- One office-hours session per lesson. With two lessons a week, merge two lessons into one session; the page works per lesson either way.
- Office hours analyse mistake **types**, not every mistake: the student tags each one before the session and sends the summary, so the teacher can group the class's mistakes in advance.
- Step 4 for a lesson closes when every missed homework question has been retried. The first attempt never changes; retries are counted separately as "fixed after office hours".
- Speaking and writing are not scored automatically. Progress counts only what can be counted honestly (length, linking words, lesson words used, peer-review accuracy, practice done); band judgements stay with the teacher.
- No score prediction anywhere; check-ins report skills, not a scaled score.
- Teacher load at this design: one office-hours session per lesson per group, plus reading one summary per student before each session.
- **Privacy:** this repository is public. The cadence is student-facing, so it is visible to anyone who opens this branch. Making the repository private (an open item in CLAUDE.md) would also protect it.

## Morning report, 11 Nov 2026

Quality-check run, no new lessons. Only files inside `experimental/` were changed.

**Live lessons (6 of 16):** C01, C02, C03, C04, C07 (12 questions each) and C12 (8 questions, IELTS Listening only).

**1. Blind key check.** All 68 questions solved from the text with the keys hidden: 68 of 68 keys matched, no wrong key found. Three items could be argued two ways and were reworded (keys unchanged, Russian explanations updated):
- C01 exit 2: the quoted text now says the stations were spaced evenly "regardless of the real distances between them", so FALSE is proved by the text itself.
- C04 IELTS 4: "Harrison built his fourth timekeeper in Jamaica" could be read as FALSE (it was finished in 1759, before the voyage). Now: "Harrison himself sailed to Jamaica with his fourth timekeeper", a clean NOT GIVEN.
- C12 listening 6: "closes at half past seven in the evening" could be read as FALSE. Now: "closes at four o'clock in the afternoon", a clean NOT GIVEN.
- C01: five of the six multiple-choice answers were option A. The options were reordered (same right answers, now A, B, C, D, C, B).

**2. Fact check.** Every date and number was re-read. Web searches were run on the railway-time, Harrison and date-line facts; the result pages were not read in full, so this is a second look, not a source-by-source audit. Changed:
- C02: "In 1995 Kiribati shifted the line" is now "At the start of 1995" (the change took effect at the turn of 1994–95).
- C04 exit 1: "bulky machines that had to be mounted in their own frames" is now "large, heavy machines" (the frame detail was not certain).
- C04 passage: added that Harrison designed mechanisms to compensate for heat, cold and the rolling of a ship (well established).
- Nothing else needed softening. Kept as is: Mercator 1569; Beck 1933; Washington conference, October 1884, 25 nations, France abstained, Paris time until 1911; Samoa skipped 30 December 2011; Great Western Railway, November 1840; Railway Clearing House 1847; telegraph time signal from 1852; Act of 1880; Longitude reward 1714, up to £20,000; fourth timekeeper 1759, Jamaica voyage 1761–62, settled 1773 at age 80; Scutari, November 1854; Sanitary Commission, spring 1855; diagram 1858; Kazakhstan's single time zone, 2024.

**3. Originality and rules.** No copied or reworded exam material found. Teacher facts are correct on every page (SAT 1560 = RW 760 + Math 800; IELTS 8.0 overall, 28 Feb 2025, L 8, R 8.5, W 8, S 7). No prices, testimonials, student names or promised scores. Every page has `noindex`; the Russian pages now show the words "Experimental draft" too. Changed:
- Course page: "Десяти минут в уроке мало" and "5-minute IELTS fragment" were timings inside a lesson and are now worded without minutes. The sentence about IELTS fragments in the SAT course now says they are proposed, not already there.
- The lesson duration was removed from the public copy in the 20 November QA.
- C12: real IELTS Listening has no True / False / Not Given task. The lesson now says so in its instruction. **Decision for Nurassyl:** keep questions 4–6 as attention training, or turn them into multiple choice.

**4. Lacing.** Every lesson word now appears in that lesson's texts or model answers. Added: "reliable" and "scale" to the C01 passage, "approximate" to the C01 speaking model, "compensate" and "precise" to the C04 passage, "likewise" to the C04 speaking model. C04's intro now picks up the thread from C03. Hand-off buttons that lead to a lesson not built yet say "(в плане)".

**5. Language.** C04 said "three statements" where there are four: fixed. C03 writing model: "nobody had worried" corrected to "nobody worried". No other errors found in the Russian or the English.

**6. Browser (Playwright, 320 / 360 / 1280 px; landing EN and RU, course page, six lessons).** No page errors, no horizontal overflow, one h1 per page, every answer button reachable and usable from the keyboard, all correct keys give a full score (12 / 12, 8 / 8), a wrong answer is struck through with its explanation, answers survive a reload. Five flaws reproduced and fixed:
1. On desktop the menu links "Results", "Method", "FAQ" and "Сайт" were drawn as grey boxes: they shared the class name `opt` with the answer buttons. The answer style now applies to buttons only.
2. After an answer was given from the keyboard, focus dropped to the page body because the buttons were disabled. Focus now stays on the chosen answer, and screen readers hear which option was right.
3. Ticks in the writing checklist and the opened model answer were lost on reload. Both are saved now.
4. All English text sat inside a block marked as Russian, so a screen reader would read passages with a Russian voice. English parts are now marked `lang="en"`.
5. The answer-position bias in C01 (see 1).

**Remaining `[FACT NEEDED]`** (unchanged, all waiting on Nurassyl):
1. Student result with official score and written consent (landing).
2. Start date of the combined course.
3. Minimum level for the combined course.
4. Portrait and story text approved by Nurassyl.
5. Phone playback, human listening recordings and pilot feedback before a public course launch.
6. Academic Word List: membership of each word and terms of use.

**Still not done:** nobody has listened to C12 with a real browser voice (this server has none).

**Next 3 steps**
1. Nurassyl: listen to C12 once on a phone, and decide about questions 4–6 (see 3).
2. Nurassyl: read one lesson as a student (C01 is the shortest) and confirm the calls listed in the section above.
3. Next build run: C05 and C06, so that C04's hand-off and C07's intro stop pointing at lessons that do not exist yet.

## QA report, 20 November 2026

Two blind solves of C04–C08, C12 and K2 recovered the intended answers for all 118 scored items (95 lesson questions, 12 in C12 and 11 in K2). A second solver received the wording, inputs and options only. Matching the intended answer was treated separately from whether the item is fair.

| Area | Before fixes | Evidence |
|---|---:|---|
| Keys | 4/5 | C04 Exit 2: “The clock worked; consequently, the officials wanted more tests” describes a plausible consequence; “nevertheless” describes a plausible unexpected response. The revised stem explicitly asks for the unexpected response. C07 Reading 6 said “statisticians” and “nurses” where the passage refers to students and says “at least as much”. The revision preserves both groups and the qualifier. |
| Exam fidelity | 3/5 | C12 Listening 9 (“What has happened to the building…”) was answered before 7 and 8. Also, 4 and 6 prompts are shorter practice sections than the official 10 per part. C05 Reading 5–6 correctly require NOT GIVEN even if the reader knows about Rickman or fines. C05 Reading 10 is now a standalone short-answer task; C06 Reading 8–10 uses text words and “as high as”. |
| Facts | 3/5 | C06 SAT 2 compared 59, 37 and 315 as rounded rates. Recalculating Table IX gives about 55, 38 and 315 per 10,000 houses. C07 SAT 2 originally said “how many soldiers died”; the diagram requires comparing death rates. C08 Reading C–F now presents an explicitly selected route through the report. The source supports the evidence and policy proposals, while claims about the reactions of individual readers and precise original sequence were stronger than the sources checked. |
| Cohesion | 4/5 | Each of the six lessons contains all eight targets in its texts, prompts or models, counting inflections and excluding vocabulary-card examples. For example, C06 moves from “contaminated water” in SAT 1 to comparing the same rates aloud and in writing. C08 Speaking Part 2 transfers structure to an everyday story, while its writing example returns to public sanitation. |
| Russian feedback | 4/5 | C05 Reading 6 correctly points to confidentiality in F and explains why it cannot prove penalties. C06 Reading 8 previously said “смысл тот же”, licensing words absent from the source phrase. The new explanation names the exact textual cue. C08 SAT 2 now explains the two genuinely different recommendations-first and recommendations-last arrangements. |
| Code and accessibility | 3/5 | At 320 px, the Russian landing page overflowed by 2 px. C05 SAT example overflowed its slide by 3 px at 1280 px. Enter on a gap answer moved keyboard focus to the document body. The heading wraps, the example is shorter and the answer stays focusable and read-only. Lesson tables can be scrolled with the keyboard. |
| Product | 3/5 | C12 Listening practice needs an audible English voice, which the test Chromium did not provide. Teacher feedback is a student-shared summary; the app measures first attempts but has no cohort item evidence for calibrating distractors. A worked check-in reports skill shares without predicting a band. |

The second solve found no changed best-option index in the initial 118. It identified these wording and acceptance issues:

| Item | Issue found during the audit |
|---|---|
| C04 Exit 2 | Both A and B are plausible in the original stem. Success can motivate further trials, or the demand can be surprising. The revised stem asks for surprise. |
| C05 Reading 7, 9, 10 | The original grader also accepted forms absent from the passage in 7 and 9. The valid short forms are `hearth tax` or `a hearth tax`, and `householder` or `each householder`. Question 10 originally combined a full short-answer question with a printed unit. The revised question accepts the duration as a number or a phrase. |
| C06 Reading 8–10 | `water company` was not the source phrase. The old salt clue could also suggest `salt content`. Question 10 used “eight times higher”, which can express different ratios. The new cue asks for the substance and uses “as high as” for the ratio. |
| C07 Reading 3, 6, 9 | In 3 the original paraphrase compared sanitation with nursing in general, while the writer compares it with what one nurse could do. In 6 the groups and “at least” were changed, giving a strict reader grounds for NOT GIVEN. In 9 “rather than tables” could imply the tables were absent. The revised wording preserves all three distinctions. |
| C08 SAT 2 and Reading 8–9 | Front-loading evidence and placing recommendations last could coexist in SAT 2. The two placements are now clearly distinct. The demo accepts article and modifier variants in the typed Reading answers. In strict source-word calibration, prefer `gentry` and `engineers`. |
| C12 Listening 3, 4, 9 | The form expects a single letter for 3, now stated. Both `photo` and `photograph` are spoken and fit 4. The statement answering 9 originally preceded answers 7 and 8. The audio cue and answer are now in order. |
| K2 SAT 1 | The old C included a comparison with electric lamps unsupported by that item's notes. The revised C gives the manual work drawback directly. |

Five priorities in order of impact:

1. Protect the score from questionable judgments. Resolve double readings in C04 Exit 2 and C07 Reading 6, enforce source-word limits, and keep an item-by-item independent check for every new set.
2. Use figures and units that survive a source check. C06 uses recalculated house-based rates, C07 distinguishes counts from rates, and C08 distinguishes its reading route from a claim about the printed order.
3. Put Listening prompts in recorded order and label the short sections as practice. A human recording with distinct speakers and a phone playback check are still needed for a realistic simulation.
4. Keep mobile navigation and keyboard feedback usable. The Russian landing, C05 slide and gap focus were repaired. A screen-reader and a real-device audio run remain open.
5. Pilot the unit with students and a teacher. Observe where they get stuck and use item-level first-attempt evidence to revise distractors before treating a check-in as a benchmark.

Sources for the corrected items and format: [Royal Museums Greenwich, Harrison's timekeepers](https://www.rmg.co.uk/stories/time/harrisons-clocks-longitude-problem), [ONS, story of the census](https://www.ons.gov.uk/visualisations/storyofthecensus/), [UCLA, Snow's Table IX](https://epi-snow.ph.ucla.edu/Stream3_GrandExperiment_d.html), [American Journal of Epidemiology, arithmetic correction](https://doi.org/10.1093/aje/kwh045), [Nightingale's diagram and supporting table](https://onepagepapers.com/nightingale-rose/read/), [National Army Museum, Scutari and the training school](https://www.nam.ac.uk/explore/florence-nightingale-lady-lamp), [Wellcome Collection, Chadwick's report](https://wellcomecollection.org/works/vgy8svyj), [UK Parliament, Public Health Act](https://www.parliament.uk/about/living-heritage/transformingsociety/towncountry/towns/tyne-and-wear-case-study/about-the-group/public-administration/the-1848-public-health-act/), [IELTS Reading format](https://www.ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading), [IELTS Listening format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening).

The source review confirmed key dates and figures for the audited historical texts and documented the corrections above. At this point, C01–C03, D0 and K1 still needed a source pass. See End-of-course QA for the next review. The C12 transcript is fictional and was checked for internal consistency. The Reading measure has no passage to score for C12 or K2's abbreviated check-in.

## End-of-course QA, 20 November 2026

The demo has 16 complete lesson packages and five checks. There are 326 scored items and 32 worked slide examples across the demo. This build added 129 scored items and 14 worked examples. The second solver received redacted copies and re-solved any item whose wording could change the answer. C03 Reading 12 now asks where people checked their watches. The new key comes from paragraph E: telegraph offices.

| Reading lesson | Words | Approx. grade | Words per sentence |
|---|---:|---:|---:|
| C01 | 755 | 11.7 | 22.2 |
| C02 | 754 | 11.7 | 21.5 |
| C03 | 685 | 11.5 | 21.4 |
| C04 | 987 | 12.2 | 25.3 |
| C05 | 759 | 13.6 | 25.3 |
| C06 | 814 | 11.6 | 23.3 |
| C07 | 750 | 11.2 | 22.1 |
| C08 | 721 | 12.0 | 23.3 |
| C09 | 692 | 11.3 | 23.1 |
| C10 | 653 | 12.6 | 20.4 |
| C11 | 737 | 11.2 | 20.5 |
| C16 | 691 | 12.7 | 25.6 |

Each Reading lesson has 13 items and passes the measured length, grade and sentence checks. C12–C15 have no Academic Reading passage. Check-ins use short samples. C13 has 482 spoken words and 10 Listening items. C16 has 481 spoken words and 10 Listening items. KF has 165 spoken words and four Listening items. The C15 essay model has 282 words.

The site, IELTS format and single-file browser suites returned `ALL OK`. The site suite covered 320, 360 and 1280 px. Axe checked WCAG 2.0 and 2.1 A/AA rules on 11 representative page and lesson states at 320 and 360 px after adjustments to contrast, logo links, slide navigation and space for the mobile header. The sample returned no automated violations. The retry links now open the reading or listening part directly, and the bundled page retains the final check on reload. Navigation in the bundle releases an active recording and the download stays local. Actual screen-reader use, phone speech synthesis, human recordings and classroom performance remain unverified.

### Historical claims checked

- C01 uses the 1863 opening, Beck's 1931 design and 1933 pocket edition, and New York's 1972 design. The trial's exact year is omitted because the museum accounts differ. MoMA credits Vignelli's colleagues. The TfL walking map and the route-choice study support the examples separately. [London Transport Museum, opening](https://library.ltmuseum.co.uk/portal/Default/en-GB/RecordView/Index/108), [Beck](https://library.ltmuseum.co.uk/portal/Default/en-GB/RecordView/Index/106), [MoMA](https://www.moma.org/collection/works/89300), [Guo](https://www.sciencedirect.com/science/article/pii/S0965856411000590), [TfL walking map](https://content.tfl.gov.uk/walking-tube-map.pdf).
- C02 uses the 1883 railway change and 1918 U.S. law, the 1884 conference resolutions and vote, the 1911 French civil-time change, the dates skipped in Kiribati and Samoa, and the 2024 Kazakhstan move. The date-line claim now refers to the side of the line. [Library of Congress](https://guides.loc.gov/this-month-in-business-history/november/day-of-two-noons), [1884 proceedings](https://dev.gutenberg.org/cache/epub/17759/pg17759-images.html), [French law reported in Nature](https://www.nature.com/articles/086092b0), [U.S. State Department date-line bulletin](https://www.hiu.state.gov/cartographic_guidance_bulletins/31-International-Dateline-2012.pdf), [Kazakhstan government](https://www.gov.kz/org/mti/press/news/details/688998?lang=ru).
- C03 keeps the 1840 Great Western decision, 1847 recommendation, 1848 uptake by railways, Greenwich signals from 1852 and the 1880 legislation. The signals provided a reference. The lesson no longer implies that every local clock was automatically adjusted. [British Journal for the History of Science](https://www.cambridge.org/core/journals/british-journal-for-the-history-of-science/article/tremoring-transits-railways-the-royal-observatory-and-the-capitalist-challenge-to-victorian-astronomical-science/3EA125839341F1C175D83538F3D9BA78), [Bristol clock and GWR](https://www.nationalhistoricships.org.uk/page/nhs/railway-200-week-royal-museums-greenwich).
- C04–C08 corrections are in the first QA report. C05 cross-checked the Han count, Swedish reports, the first U.S. count, the use of Hollerith equipment, the 1897 Russian Empire census and Danish register figures. [CSO](https://www-cloud.cso.ie/en/census/censusthroughhistory/), [Statistics Sweden](https://www.scb.se/statistics-swedens-history/), [U.S. Census Bureau](https://www.census.gov/library/stories/2026/06/america-counts-250-years.html), [1890 Census](https://www.census.gov/programs-surveys/decennial-census/decade/1890/about-1890.html), [Presidential Library](https://www.prlib.ru/history/619019), [Statistics Denmark](https://www.dst.dk/da/Statistik/udgivelser/VisPub?cid=19590).
- D0 uses the standard Beaufort scale and FitzRoy's 1854 appointment and 1861 warnings. K1 separates Britain's change of calendar from England's change in the start of the legal year. K2 discusses early gas lighting and confines the manual-lighting claim to that context. [Met Office, Beaufort scale](https://weather.metoffice.gov.uk/guides/coast-and-sea/beaufort-scale), [FitzRoy](https://www.metoffice.gov.uk/research/library-and-archive/archive-hidden-treasures/robert-fitzroy), [Calendar (New Style) Act](https://www.legislation.gov.uk/apgb/Geo2/24/23/contents), [National Records of Scotland](https://www.nrscotland.gov.uk/learning-and-events/research-guides/change-in-calendar-dates-in-the-old-parish-registers/), [London Museum, gas street lighting](https://www.londonmuseum.org.uk/collections/london-stories/gas-lamps-illuminated-london/), [Westminster lighting plan](https://www.westminster.gov.uk/sites/default/files/media/documents/2024%20Westminster%20Lighting%20Master%20Plan.pdf).

The fact review addressed dates, counts and directly assessed claims. Some background historical generalisations still lack an individual citation. Academic Word List coverage and calibration against licensed exam passages were not measured. No class pilot was available to establish distractor performance or teaching workload.


## Follow-up QA, 21 November 2026

### Academic Word List

The check used all printed word-family forms in Averil Coxhead's list, downloaded from Victoria University of Wellington. `tools/ielts_measure.py --awl` matches case-insensitive spellings as printed, without stemming or sense disambiguation. The Reading percentage counts running words. The vocabulary column counts headwords that match one of the listed forms. A repeated card in two lessons counts twice. [AWL sublist families](https://www.wgtn.ac.nz/lals/resources/academicwordlist/sublists)

| Lesson | AWL share of Reading | Vocabulary cards matching AWL |
|---|---:|---:|
| C01 | 8.9% | 3 / 8 |
| C02 | 5.6% | 5 / 8 |
| C03 | 4.7% | 3 / 8 |
| C04 | 6.0% | 7 / 8 |
| C05 | 8.0% | 7 / 8 |
| C06 | 5.5% | 2 / 8 |
| C07 | 5.3% | 3 / 8 |
| C08 | 5.3% | 3 / 8 |
| C09 | 3.8% | 2 / 8 |
| C10 | 6.4% | 5 / 8 |
| C11 | 8.0% | 4 / 8 |
| C12 | — | 3 / 8 |
| C13 | — | 2 / 8 |
| C14 | — | 3 / 8 |
| C15 | — | 3 / 8 |
| C16 | 8.8% | 8 / 8 |

Six of the 12 Reading passages are within the project's working band of 6–10% on the script's rounded percentages. Overall, 63 of 128 vocabulary cards match a listed form. The lowest is C09, whose technical instructions use several concrete instrument nouns. Word choice was kept for clarity and alignment with existing questions; future revisions can use these figures when considering vocabulary. The numerical band is a course-writing diagnostic. The source list stays out of the repository: the University's website terms require written permission for commercial reproduction. [University copyright terms](https://www.wgtn.ac.nz/site-info/copyright)

### Screen reader and playback

- Orca on Linux Chromium announced the C09 input label, result and answer explanation after Enter. It also announced both correct and incorrect status when focus returned to choices in C01, and read the new location description for all eight markers in the C12 plan. In some runs it repeated the short verdict in addition to reading the explanation.
- With Chromium Web Speech, Speech Dispatcher and eSpeak NG, C12, C13, C16 and KF played to completion at a 360 px touch-enabled viewport (36, 36, 41 and 17 utterances). Stop and replay were exercised in C12. An interruption during the screen-reader run could previously leave the status saying playback was in progress. The page now reports the interruption and offers replay. Exact language matches are preferred even when the system provides a single voice for that locale.
- The desktop run used a local audio sink. Sound on a physical phone, recordings by human speakers, a classroom pilot and calibration against licensed IELTS passages remain open.
