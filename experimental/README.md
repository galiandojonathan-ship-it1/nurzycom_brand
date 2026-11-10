# experimental/ — NURZYCOM experimental site (not deployed)

An experimental concept for the brand site plus a **demo version of the combined SAT Reading & Writing + IELTS course**.
Branch `experimental-site` only. Nothing here is linked from, or changes, the live sites (`site/`, `docs/`).
Every page carries `noindex` and an "Experimental draft" label.

## Pages

| Path | What it is |
|---|---|
| `index.html`, `ru/index.html` | Brand landing concept (EN / RU): results, lessons, method, story, FAQ, contact |
| `course/index.html` | Course demo: the two-line map of 16 lessons, the honest skill-transfer table, the bridge track, IELTS fragments for the SAT course |
| `course/lesson.html?id=C01` | Interactive lesson: words → SAT → IELTS → speaking → writing → exit check → hand-off |
| `assets/data.js` | All course data and lesson content |
| `assets/lesson.js`, `assets/course.js`, `assets/styles.css` | Renderers and styles, no build step, no dependencies |

Open locally: `python3 -m http.server` inside `experimental/`, then `http://localhost:8000/`.

## The idea that ties the course together

One theme runs through all 16 lessons: **Making the world readable** (maps → time → data → arguments).
Inside a lesson, the words, the SAT passage, the IELTS passage, the speaking prompt and the writing task are all about the same subject, and each lesson hands its subject to the next one. The course map is drawn as a two-line transit diagram because lesson C01 is about exactly such a diagram.

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
| C04 | 12 | 2026-11-11 | 2026-11-11 |

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

Build order: C02, C03, C07, C12 (listening), then C05, C06, C08–C11, C13–C16.
