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
| `course/lesson.html?id=D0`, `?id=K1` | The diagnostic and the Block A check-in (parallel forms, same blueprint) |
| `assets/data.js` | Course data and lesson (homework) content |
| `assets/cadence-data.js` | Cadence content: `CADENCE` (steps, trap types, IELTS criteria, check-in plan, skill names), `DECKS` (slides), `OFFICE` (office hours), check-ins `D0`, `K1` |
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

Block level of step 4: the diagnostic `D0` before C01 and check-in `K1` after C04 share one blueprint (2 × Words in Context, 2 × Boundaries, 2 × Form, Structure, and Sense, 2 × Transitions, 3 × IELTS True / False / Not Given) with new texts, so the change per skill is the growth of Block A. K2 (after C08), K3 (after C11) and the final check (C16) are planned.

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

| Lesson | Questions | First check | Second check (independent re-solve) |
|---|---|---|---|
| C01 | 12 | 2026-11-11 | 2026-11-11 |
| C02 | 12 | 2026-11-11 | 2026-11-11 (blind re-solve by a separate agent) |
| C03 | 12 | 2026-11-11 | 2026-11-11 (blind re-solve by a separate agent) |
| C04 | 12 | 2026-11-11 | 2026-11-11 |
| C07 | 12 | 2026-11-11 | 2026-11-11 (blind re-solve by a separate agent: 12 of 12 keys matched; wording of 3 items tightened after its notes) |
| C12 | 8 | 2026-11-11 | 2026-11-11 (blind re-solve by a separate agent from the transcript: 8 of 8 keys matched) |
| C05 | 12 | 2026-11-11 | 2026-11-11 |
| C06 | 12 | 2026-11-11 | 2026-11-11 |
| D0 (diagnostic) | 11 | 2026-11-11 | 2026-11-11 |
| K1 (check-in A) | 11 | 2026-11-11 | 2026-11-11 (one boundary item rewritten: option C allowed a second correct sentence) |
| Slide worked examples, 8 lessons | 16 | 2026-11-11 | 2026-11-11 |

Third pass, 2026-11-11 (quality-check run): all 68 questions solved again with the keys hidden; 68 of 68 matched. Three items were reworded so that only one answer can be defended (C01 exit 2, C04 IELTS 4, C12 listening 6); their keys did not change.

## Open `[FACT NEEDED]`

1. Student result with official score and written consent (landing).
2. Prices and start date of the combined course.
3. Minimum level for the combined course.
4. Portrait and story text approved by Nurassyl.
5. IELTS format details checked against ielts.org before anything is published.
6. Academic Word List: membership of each word and terms of use. No word is labelled "AWL" until this is checked.

## Lesson data format (for the next build run)

`window.LESSONS.Cnn = { id, title, thread, intro (RU), words: [8 × { w, pos, ru, sat, ielts }], parts: [...], handoff: { text, next } }`

Parts, in order: `sat` (4 questions) → `ielts` (one passage of 200–260 words, 6 questions) → `speak` → `write` → `exit` (2 questions).
IELTS-only lessons replace `sat` with a `listen` part: `{ type: "questions", id: "listen", audio: [sentences read by the browser], transcript: [...], items: [...] }`.
Question kinds: `mcq` (`opts`, `key` = index) and `tfng` (`key` = "T" | "F" | "NG"). Set a lesson's `status` to `"live"` in `COURSE.lessons` when it is complete.

IELTS-only lessons may also set `wordsTitle`, `wordsRu` and `wordLabels: [a, b]`, and give each word `ex: [a, b]` instead of `sat` / `ielts` (see C12). The renderer shows "IELTS only" in the header when a lesson has no `sat` part, and reads `audio` one sentence per utterance (a single long utterance is cut off in some browsers). Keep `audio` and `transcript` word-for-word the same.

Build order: ~~C02, C03~~, ~~C07, C12~~, ~~C05, C06~~ (all done 2026-11-11), then C08–C11, C13–C16. Each new lesson needs its homework (`LESSONS`), its deck (`DECKS`) and its office hours (`OFFICE`); K2 goes with C08.

IELTS-part tables: a part may carry `table: { caption, head, rows }`, shown above its questions. Notes in Rhetorical Synthesis items use `\n•` line breaks.

## Calls made in the overnight run of 11 Nov 2026 (to confirm with Nurassyl)

- C07 and C12 are live although the lessons before them (C05, C06, C08–C11) are not built yet, so C07's intro refers back to C06 and both hand-offs point to planned lessons.
- C07 facts kept deliberately plain: Scutari, November 1854; Sanitary Commission, spring 1855; work with William Farr after 1856; diagram published 1858. Left out because not certain enough or not needed: exact death counts, Queen Victoria receiving a copy, the Statistical Society election. The real diagram has two circles; the texts say "circles, each divided into twelve wedges".
- C12: Larkmoor College, Dana and Mill Road are invented. The script is 200 words. Listening was checked from the transcript and with a stubbed speech engine; **nobody has yet listened to it with a real browser voice** (the build server has none). Listen once on a phone before showing it to students.
- C12 has 8 scored questions (6 listening + 2 exit), not 12, because it has no SAT and no Reading part.
- The map row for C12 now reads "Listening: directions on a map, predicting the answer type" (forms are not in this lesson).

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
- Kept: "70 minutes" as the lesson length (it is in CLAUDE.md as a set fact). Say if it should go too.
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
2. Prices and start date of the combined course.
3. Minimum level for the combined course.
4. Portrait and story text approved by Nurassyl.
5. IELTS format details checked against ielts.org before anything is published.
6. Academic Word List: membership of each word and terms of use.

**Still not done:** nobody has listened to C12 with a real browser voice (this server has none).

**Next 3 steps**
1. Nurassyl: listen to C12 once on a phone, and decide about questions 4–6 (see 3).
2. Nurassyl: read one lesson as a student (C01 is the shortest) and confirm the calls listed in the section above.
3. Next build run: C05 and C06, so that C04's hand-off and C07's intro stop pointing at lessons that do not exist yet.
