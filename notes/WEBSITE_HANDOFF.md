# Website handoff: how to change the course site in a new chat (2026-11-16)

For a new Claude session that has to change the course site. Read `CLAUDE.md` first: it is the single source of truth for the
business, the hard rules, the brand and the full feature history of every page. This file adds the practical how-to.

This file is public, like the whole repository. Never write passwords, the master key, the class code or question text into it.

## 1. First five minutes

1. `git status --short --branch`. Start from the latest `main`, work on a `codex/<task>` branch, and merge tested changes through a pull request. Every merge to `main` goes live.
2. Ask Nurassyl for the password of Claude's own course login `claude` only if the task touches encrypted data (questions,
   vocabulary, tests) or needs a local copy with real data. Never write the password anywhere in the repository.
3. If OMC is missing and you want it: `npm i -g oh-my-claude-sisyphus@latest && omc setup --no-plugin` (optional).
4. Students use the site daily. Small, tested changes; never push untested JavaScript.

## 2. What lives where

| Thing | Where |
|---|---|
| Live course site | `docs/` → https://study.bynurzy.com (Cloudflare Pages project `bynurzy-study`, branch `main`, output `docs`, no build step) |
| Server API | `functions/api/[[route]].js` (Cloudflare Pages Function), KV namespace bound as `USERS`; `functions/_middleware.js` redirects `*.pages.dev` |
| Marketing site (not live yet) | `site/` (EN `site/index.html`, RU `site/ru/index.html`), meant for https://bynurzy.com |
| Hosting notes | `deploy/README.md`, `deploy/bump_version.py`, `deploy/set_domain.py` |
| Test kit | `tools/sitetests/` (Playwright scripts, local stand-ins) |
| Key and data tools | `tools/private/` (`getkey.js`, `datafile.mjs`, `pack.mjs`, `unpack.mjs`, `lessonlog.js` = read lesson-mode sessions, `lessonwords.mjs` = marked words → deck VL, `deckpack.mjs` = a presentation for «Пульт урока») |
| Private sources | `notes/private/*.bin`: encrypted bundles of deck sources and the SAT pattern study (open with `unpack.mjs`) |

### Pages and their scripts (all in `docs/`)

| Page | Scripts | What it is |
|---|---|---|
| `index.html` (body `hw-page`) | `app.js`, `today.js`, `planlogic.js`, `solve.js`, `gloss.js`, `tools.js` | Homework start page: «Сегодня» panel, lesson tiles, workbook parts solved on screen |
| `plan.html` | `plan.js`, `planlogic.js` | Course plan (Verbal, Math, both) |
| `vocab.html` | `vocab.js` | Flashcards, typed test, list |
| `reading.html` | `reading.js` | 12 short stories with word glosses |
| `practice.html` | `practice.js` | Hard sets X01–X07 |
| `mock.html` | `mock.js`, `scale.js`, `gloss.js`, `tools.js` | Practice tests PT1–PT19 and Прогнозы PR1–PR3 |
| `useful.html` + `archaic.html`, `desmos.html`, `circle.html`, `mytest.html` | `archaic.js`, `desmos.js`, `circle.js`, `mytest.js`, `ctlogic.js` | «Полезное» (07.n pages) |
| `cabinet.html` | `cabinet.js`, `teacher.js`, `teacher.css`, `cted.js`, `cblesson.js`, `ctlogic.js`, `formkit.js` | Teacher dashboard, groups and former students, assignments, tests, lesson sessions, Google Forms analytics and import, accounts and access |
| `teacher.html` | `teacher_entry.js` | Legacy entry point for the teacher dashboard. Keeps section queries and account bookmarks |
| every page | `auth.js`, `config.js`, `site.css` | Login, decryption, sync, shared styles |
| question and text pages | `dict.js` | Dictionary on selection (Wiktionary, `data/dict.json` + `q/dict/`; rebuild: `tools/dict/`) |
| every page, lesson account only | `lesson.js` (loaded by `auth.js` for login `lesson`), `lsmist.js` («Ошибки класса», loaded by `lesson.js`) |
| `classroom.html` (lesson login only, «Пульт урока») | `classroom.js`, `lsboard.js` | Lesson home: start, reviews, presentations (imported PDF slides via encrypted `admin/deck`, or `data/decks.bin` and `q/decks/`), words from lessons, past lessons | «Режим урока»: the teacher's capture bar (words, hard questions, notes, class vote, timeline); analysed by the `/lesson-review` skill |

## 3. Data and encryption

- All private content is encrypted with one AES-GCM **master key** that is never in the repository. `docs/access.json` holds the key wrapped with
  passwords (old shared password, per-student logins); KV `u:<id>` holds self-registered accounts.
- File format, used by `docs/data/*.bin` and `docs/q/**/*.bin`: 12-byte IV followed by the ciphertext of UTF-8 JSON.
- Getting the key (needs the `claude` password from Nurassyl):
  `L=claude P=<password> OUT=<scratchpad>/master_key.b64 node tools/private/getkey.js`. Keep it in the scratchpad only.
- Opening and sealing one file:
  `node tools/private/datafile.mjs open <key.b64> docs/data/vocab.bin <scratchpad>/vocab.json`
  `node tools/private/datafile.mjs seal <key.b64> <scratchpad>/vocab.json docs/data/vocab.bin`
  Opened JSON stays in the scratchpad. Sealing writes a new IV, so the `.bin` always changes.
- Data files:
  - `lessons.bin`: 39 lessons; each has `tag`, `title`, `tip`, `salt`, `parts[]` (`id`, `title`, `mode`, `b` = bundle path in `q/`,
    `q[]` with `h` = salted answer hashes, so keys are not readable even after decryption);
  - `vocab.bin`: word decks;
  - `reading.bin`, `practice.bin`;
  - `mocks.bin`: tests, `sections`, `rev`, `group`, the `skills` map;
  - `mockgloss.bin`: test glossary (see `tools/mockgloss/README.md`);
  - `desmos.bin`, `circle.bin`, `archaic.bin`.
- `docs/q/<TAG>/<hash>.bin`: per-part question bundles (question HTML, options, official explanations).
- **The build folder is gone.** It held the question sources, selections and the College Board cache, and it lived in an earlier
  session's workspace. Small edits are fine with `datafile.mjs`. To rebuild from the bank, re-fetch it, read-only, no login:
  - list: `POST https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/get-questions` with
    `{"asmtEventId":99,"test":1,"domain":"INI,CAS,EOI,SEC"}` (RW; Math domains `H,P,Q,S`, test 2);
  - one question: `.../get-question` with `{"external_id":"…"}`.

  College Board text goes only inside encrypted bundles, never as plain files in the repository.
- Never commit the master key, the class code, opened JSON or a local copy of `docs/` made with real data.

## 4. Server API (functions/api/[[route]].js)

Routes:
- `GET user`, `POST invite`, `POST register`;
- `GET/PUT progress` (a student's synced results, owner only);
- `GET custom`;
- `POST admin/claim`;
- `admin/*` routes need the `X-Admin-Key` header, which lives only in the teacher's browser (`admin_key`): `users`, `user` (PUT, DELETE), `progress`, `form`, `groups`, `custom`, `invite`.

The server never sees passwords or the master key: everything is encrypted in the browser.

The lesson account can upload a PDF from its lesson card under «Пульт урока» using the administrator key. The browser converts it to slides
with the vendored PDF.js 4.10.38 distribution (Apache-2.0), seals them with the course key, and uses `GET admin/decks` to list and
`GET/PUT/DELETE admin/deck?id=V01` to read, replace or delete an uploaded presentation. The PDF itself stays on the uploading device.
New PDF imports save the text and coordinates alongside the images so the site dictionary works on selected words. Image-only decks
need a fresh import from a PDF with embedded text. In Math lessons, the Desmos button opens the SAT graphing calculator next to the slides.
«Загрузить ZIP» imports PDFs named with their lesson code, such as `Math/M01_v4.pdf`. It checks both the built-in library and the uploaded
catalog, then sends conditional uploads for missing lessons. The browser extracts the archive and uses the same encrypted flow as individual PDF uploads.
«Заменить из ZIP» asks for confirmation with the existing lesson codes before replacing them and adds any missing presentations from the same archive.
PDF imports render the long edge at 2560 px, using WebP where the browser supports encoding. If the high-resolution deck exceeds
the existing upload limit, the importer retries at 1600 px. Reimport the original PDF to upgrade a deck stored at the old resolution.

For code edits, download the text as JSON from the lesson card, edit or reorder `slides`, and upload the result via «Заменить из JSON».
The JSON renderer uses the site's slide template. PDF graphics and original formatting stay in the PDF. This example shows the source format.

```json
{"version":1,"slides":[{"title":"Linear equations","paragraphs":["Solve for x.","Check the result using Desmos."]}]}
```

«Пометки» adds highlights, underlines or frames to the uploaded PDF viewer. The teacher reveals them in order during screen sharing.
The marks live in the teacher browser and are keyed by lesson and the SHA-256 of the rendered slide image. Reordering identical images preserves their marks. A changed image starts with separate marks. Keep the source PDF for changes to the slides themselves.

`functions/api/live.js` (live practice rounds) uses the D1 binding `LIVE_LESSONS`; schema `deploy/live-lesson-d1.sql`; locally `pages_dev.mjs` serves it with an in-memory SQLite D1 (tests `t_live.js` and `t_live_sources.mjs`).
New rounds allow students to update their answers while the question is open. «Каждый ученик решает в своём темпе» gives each student
their own navigation until the teacher closes the round. In teacher-paced rounds, going back reopens the question for the class.
In strict rounds, going back changes the teacher's view while the shared timer continues. Math lessons and the Desmos sets
enable the student calculator by default. The same D1 tables store the latest answer per question and student.

Presentation practice uses `/api/lesson-practice` and the same `LIVE_LESSONS` D1 binding. The first teacher room
creates the additive `lp_*` tables in `lib/lesson-practice-schema.js`. A room is active for up to three hours, and
its results are kept for 14 days. In «Пульт урока», «Показать с этого слайда» reads the current PDF text layer or JSON slide,
opens the room if needed, and sends the question immediately. Share the resulting student link once. The student's screen
puts the passage and question side by side on desktop and stacks them on mobile. For grading, the browser uses an explicit
key on the slide, the matching solution or Cold Start recap, or an exact workbook match. Without a key, the teacher still
sees the answer and elapsed time. The answer stays ungraded and the two-choice hint is unavailable. Image-only slides can
still be mapped to a workbook question with the separate manual picker. Cold Start can open four numbered slides at once.
The question snapshot is encrypted as for workbook practice. The teacher advances the whole group
under the same link, and automatic presentation actions preserve an active Cold Start across refreshes. The monitor keeps prior answers in a clickable matrix. Selected question and timing
are server-side; only the teacher monitor sees the roster, grading and the saved encrypted notes. Hint permissions
follow the student account to the next practice. Gemini receives only anonymous facts for one student at a time
(question numbers, skills, correctness, times and hint flags) after closing the room. No audio is collected.

KV free limit: 1,000 writes a day. That is why `auth.js` bundles saves.

«Похожие вопросы · Gemini» (`docs/twins.js`, `lib/mistake-twins.js`, `POST admin/twins`, 2026-11-22): in the cabinet's results,
a student card («последние ошибки, по одной на навык», up to 6) and the one-part review («Похожие вопросы на эти ошибки») send
that student's first-attempt mistakes to Gemini: section, skill, level, chosen and correct letters, and the text only for
nurzycom's own questions. No name, no account id, no College Board text. Gemini writes 1–3 new questions per mistake on the
same skill, level and trap; the server drops drafts that copy 8 words of the source passage, repeat options or set the trap
as the key, and a separate blind call solves the rest: a question whose key it does not reproduce, or that it calls
ambiguous, is dropped. The teacher unticks what is not needed and clicks «Задать ученику как «Мой тест»»: the test
(«Работа над ошибками · <имя> · <дата>») is saved in the sealed bank and the assign form opens with that student ticked.
Uses the same `GEMINI_API_KEY`. Tests: `t_twins_lib.mjs`, `t_twins.js desktop|phone` on `pages_dev_gemini.mjs` (fake Gemini).
Picker (2026-11-23): `TWINS.mount(box, { pool, load, quick })` lists every first-attempt mistake (`twinPool` in `teacher.js`:
gaCollect rows + `tags.bin` subtopic `p` and trap `t[chosen]`, labels from `PVIEW.NAME`/`PVIEW.TRAP`). It filters by work, skill,
subtopic, trap and period. Quick picks come from the progress result `D.prog` (`twinQuick`: mastery < 45% with n ≥ 3, a drop
beyond 1 SE, traps chosen most). The handle's `preset(f)` is called by «Похожие» in the progress card (`PVIEW.render` `onTwins`).
Up to 12 mistakes, sent as batches of 6 (the server keeps MAX_ITEMS 6). The payload adds `focus`, `trapKind` (≤ 80 characters)
and `note` (≤ 300 → `teacherNote`) to the prompt. The one-part review keeps the one-click mode (`mistakes`, up to 12).
Gemini puts the right option first: `lib/option-order.js` `balanceKeys` reorders every generated question (twins and the
Verbal lesson) so a batch's keys are spread evenly over A–D, and remaps letter mentions in the explanations. Test: `t_option_order.mjs`.
On the lesson: «Пульт урока» → «Тесты преподавателя» lists the bank (Gemini tests first, `src: "gemini"`) with «Решать вместе»
(`mytest.html?t=<id>` on the shared screen) and «Живая практика» (`&live=1` opens the round settings at once); the lesson account's
`mytest.html` list shows every test. Students still see a Gemini test only when it is assigned. Test: `t_lesson_ct.js desktop|phone`.

«Импорт результатов Bluebook» (2026-11-23; pilot by Codex from the handoff archive, generalised by Claude): on `mock.html`
(`docs/bluebook-import.js`) a student pastes College Board My Practice → Score Details (the table, or the whole page with Ctrl+A,
on a phone «Выбрать всё»). Parsing is in the browser and nothing is sent. The check starts on paste. Rows are «N  Section
Correct answer(s)  Your answer; Status»; tabs, line breaks, «\» endings, non-breaking spaces and page text around the table are
tolerated. Numbering restarting at 1 marks module 2. A lost or swapped row asks for a new copy. The test and route are found
from the ordered correct answers of each section against every test of `data/bluebook.bin` (module 1 shared; m2e easier, m2h
harder). A skill is shown only for a single exact match. Fractions and finite decimals are compared as exact numbers.
Catalog: `tools/bluebook/build_catalog.py out.json --rw rw.txt [--math math.txt]` reads the open indexes (pdftotext -layout of
the Dropbox PDFs linked in the handoff) and checks every College Board ID against the public question bank API: the key must
match, and the skill and difficulty come from the bank. No question text is kept. Questions missing from the bank (placeholders
«xyz…»/«abcd…», and all of SAT 11, which has no IDs yet) keep the index key for routing, with the index skill labelled «по
открытому индексу». Seal it with `datafile.mjs seal`. Built 2026-11-23: Reading and Writing of SAT Practice Tests 4–11, 648
positions, 641 items, 0 key mismatches. Math waits for the Math index PDF (the handoff's Math link opens a Dropbox login).
Tests: `t_bbimport.js [opened catalog]` (formats, Ctrl+A page, unique test and route for every test, exact numbers, errors),
`t_bbimport_ui.js desktop|phone` (a real Ctrl+A copy of a Score Details-shaped HTML page pasted into the site; fixture from
`mkfx.mjs`, which seals the synthetic catalog of `bbsynth.cjs`).

«Прогресс ученика · индекс» (2026-11-22): in the cabinet's results, a student card (`#st-prog`, `progMount` / `progObs` in
`teacher.js`) runs `docs/progress.js` (engine, `PROGRESS.compute`) and draws it with `docs/progress-view.js` (`PVIEW.render`; styles `.pg-*`).
The index is internal analytics, not an SAT score, and is never published. Engine: per subtopic and per section a 3PL model
(guess 0.25 for A–D, 0 for typed; b: easy −1.2, medium 0, hard +1.2) with a Laplace update of θ and its variance, drift 0.05/day,
start θ = −1. Weights: mock or final 1, homework 0.8, learning part 0.6; a repeat ×0.3; hints ×(1 − 0.5·share).
Mastery = mean over easy/medium/hard of σ(θ − 0.5√v − b), weighted by exam domain shares (RW 28/26/26/20, Math 35/35/15/15)
and bank frequency inside a domain. Index = 0.60 mastery + 0.15 transfer (mock results against prediction, only subtopics practised 3+
times outside mocks) + 0.10 retention (subtopic seen again after 7+ days) + 0.10 pace (timed parts against SAT time, keeping accuracy)
+ 0.05 correction (second try after a miss, rescaled above chance). The weight of a missing part is shared among the others.
Drivers count subtopics with n ≥ 3.
Corrected the same day after Nurassyl asked whether a first-day point was real (Beksultan, 1 Nov: 16 answers drew curves of
61/32/12%, almost all from the prior):
- a section counts from 20 first-try answers, a difficulty level from 5, the index from 30; weeks below that are not drawn;
- subtopic θ = section level + offset (offset prior 0, variance 1); the section level is learned net of the subtopic's offset;
- weekly points are smoothed backwards (RTS, uncapped drift), so each week uses later answers too;
- a subtopic's change counts from its first point with 3+ answers, never from the prior, and only when it is at least 1 standard
  error (drivers and «растёт/просело»; otherwise grey, «в пределах шума»). The hero marks a change below the noise (±7 points at
  72 answers a week, ±15 at 36);
- the difficulty chart shows the expected share right with guessing, and the tooltip shows the actual count;
- simulated steady student: index change 0.6 ± 6.9 over 8 weeks (before the fix +23); a learned subtopic is found 2 times in 3
  at 72 answers a week, with 0.17 false drivers per student. One answer to a question with 25% guessing carries little
  information, so subtopic trends need 3–4 weeks to show. Tags: `docs/data/tags.bin` (sealed with the master key: per question id the primary and
secondary subtopic, trap per wrong letter, flags, level, type, key; no question text). It covers the 1,087 questions students had
answered on 2026-11-22. Untagged questions still move the section ability but not the subtopics. Tag new questions with the kit in
`notes/private/progress-tagging.bin` (taxonomy, scripts, README; open with `tools/private/unpack.mjs`). Tests: `t_progress_engine.js`
(synthetic students, node). The real-data render check was run on a local copy only.

Group analysis builds a SAT Verbal lesson on demand via `POST admin/verbal-lesson`. Set the encrypted Cloudflare Pages
secret `GEMINI_API_KEY` in the production environment for `bynurzy-study` and redeploy. The endpoint uses aggregate
first-attempt counts, including option counts of two or more, and course skill labels. The teacher can opt in to send
the text of course-authored questions. Names, individual attempts and College Board text stay out of the request.
Each HTTP request builds one focus, and a separate blind model call checks that focus before it reaches the teacher.
The cabinet combines two validated focuses into a lesson and can present the first on its own if the second fails. After reviewing the keys, the teacher can send
the question sequence to «Пульт урока» via the encrypted `ls_m` record. The coaching notes stay in the cabinet.
Group analytics and the normal review queue also work without the secret.

## 5. Rules for every change

- **After any change to `docs/*.js` or `docs/site.css`, run `python3 deploy/bump_version.py`.** It writes new `?v=` tags. Cloudflare keeps scripts for 4 hours, and
  a new page with an old script has broken the teacher page before. The tag is Almaty time and always above the current one, whatever the machine's clock zone
  (a cloud container runs on UTC; before 2026-11-22 a tag could go back and repeat an older one).
- **CSP** (`docs/_headers`): no inline scripts, and no scripts from other hosts. The `404.html` inline script is allowed by its hash; update the
  hash if it changes. Allowed: Google Fonts styles and fonts, the Desmos frame, Google Forms and Sheets, the GitHub API, the Cloudflare beacon.
- **New extra pages go under «Полезное»:** a card on `useful.html`, the next «07.n —» number, a «← Полезное» link. Never add a new top-nav item.
- **Language:** student-facing text is Russian. SAT questions, terms and slides are in English. Give Nurassyl click-steps with the English button names.
- **Brand:**
  - colours: Ink #0F0F0F, Paper #F5F3EE, Mist #ECE9E2, Stone #D9D5CD, one accent Oxide #A63328 (sparingly);
  - font: Onest everywhere (since 2026-11-16; it replaced Geist: same proportions, softer shapes, clearer Cyrillic); the homework start page also uses Sofia Sans Condensed 600 (`body.hw-page`, `--disp`); IBM Plex Mono only for the login animation;
  - layout: no photos; blocks are white rounded cards;
  - teacher pages may use the six group colours.
- **Hard rules** (CLAUDE.md): no invented results, scores or reviews; practice-test scores are always «примерный балл»; consent before any name; no guarantees.
- **Commits:** a short summary line, then what changed and why. No model names. End with the attribution lines the session gives.
- **After pushing to `main`**, also update the old GitHub Pages branch: `git push origin origin/main:refs/heads/claude/ecstatic-mayer-3asg7r`.
- **Codex** is the primary implementation and maintenance agent. It works on `codex/<task>` branches, opens pull requests, reviews and merges tested changes, and monitors deployment (see `AGENTS.md`).

## 6. Testing locally (do this before every push)

Playwright and Chromium are preinstalled; never run `playwright install`. The tests write screenshots next to themselves, so run
them from the scratchpad:

```bash
S=<scratchpad>; mkdir -p $S/loop && cp tools/sitetests/* $S/loop/ && cd $S/loop
node mkreal.mjs /home/user/nurzycom_brand/docs $S/loop/real $S/master_key.b64   # real data, local password fixture-pw, login loop-test
(nohup python3 -m http.server 8767 -d $S/loop/real >/dev/null 2>&1 &)           # static copy for most tests
(nohup node pages_dev.mjs $S/loop/real 8768 > $S/loop/pd.log 2>&1 &)            # stand-in with the real API and an in-memory KV
```

Without the key, `mkfx.mjs` builds a fixture copy with fake data (also a synthetic hard set X01 and the logins `loop-test` and `lesson`, so the cabinet and live-round tests run: `t_live.js`, `t_live_fast.js desktop|phone`). Rebuild the copy after every change, because it is a copy, not a link.

Tests to run by area:

| Area | Tests |
|---|---|
| Start page | `t_today.js`, `t_ux14.js`, `t_flows.js` |
| Mock tests | `t_mock.js`, `t_timer.js`, `t_pred2.js` |
| Cabinet | `t_cabinet.js`, `t_deltask.js`, `t_taskearly.js` (seed with `cbseed.js` on 8768) |
| Teacher page | `t_teacher.js`, `t_group.js`, `t_group_cb.js` |
| «Мои тесты» | `t_ct.js`, `t_ctparse.js`, then `t_ct_replace.js part\|all` on the same stand-in (questions replaced after students submitted) |
| «Похожие вопросы · Gemini» | `t_twins_lib.mjs`; `t_twins.js desktop\|phone` on `node pages_dev_gemini.mjs <copy> 8768` (fake Gemini, no key) |
| «Прогресс ученика» | `node t_progress_engine.js` (no browser) |
| Login | `t_auth.js` |
| Lesson mode | `t_lesson.js desktop\|phone`, cabinet view `t_cblesson.js desktop\|phone`, «Ошибки класса» `t_lsmist.js desktop\|phone` and `t_lsmist2.js desktop\|phone` (picker, one-student review, Desmos, board) (stand-in on 8768; restart the stand-in before `t_cabinet.js`, which expects no groups) |
| «Пульт урока», «Подготовить урок» | `t_classroom.js <real copy> <key> desktop\|phone` |
| Dictionary on selection | `t_dict.js desktop\|phone` |
| General | `t_a11y.js`, `t_offline.js`, `t_print.js` |

- Group tests need fake class files: `node mkgroupcsv.mjs <key.b64> <docs> group.csv` for `t_group.js`, and the same with `NAMES="Ayana Seitkali,Dias Omarov,Аружан Бек,Sher Zh,Mukhamediya K,Erlan T"` → `group2.csv` for `t_group_cb.js` and `t_lsmist.js` (names of the seeded accounts).
- Cabinet tests (`t_cabinet.js`, `t_ct.js`) need the accessibility checker: `npm i axe-core` in the folder you copied the tests to.
- If a test needs the local login, set `localStorage` `site_pw=fixture-pw`, `site_login=loop-test`.
- Use `waitUntil: "load"` plus a short wait: `networkidle` hangs on the stand-in.
- Check phone width too (`devices["iPhone 13"]`, 320 px for tight layouts).

## 7. Shipping and checking live

1. Run `bump_version.py`, run the tests, then commit.
2. `git push -u origin main`, then fast-forward `claude/ecstatic-mayer-3asg7r`.
3. Cloudflare deploys in about 1–2 minutes. Check that https://study.bynurzy.com/ contains the new `?v=` tag (`/index.html` answers with a 308 redirect, so use `curl -sL`)
   (`curl -s … | grep -o 'app.js?v=[0-9]*'`), then open the changed page in Playwright on the live site.

## 8. Pitfalls already met

- **Script cache:** a new page with an old cached script broke the teacher page → always bump versions.
- **CSS names:** a `@keyframes blink` name clashed with one in `mock.html`; use unique names (for example `caret-blink`).
- **Google Fonts:** fonts must have Cyrillic. Check with a modern Chrome user agent:
  `curl -s "https://fonts.googleapis.com/css2?family=X" -A "Mozilla/5.0 … Chrome/124" | grep -c cyrillic`.
- **Dates:** Google Form CSV dates can be dd/mm or mm/dd; `formkit.js` detects them per file.
- **Hidden controls** must stay usable by keyboard (the «Скрыть» timer button is kept 1 px for keyboards only).
- **KV:** a task given to a student who never saved anything creates a record without an owner until their first visit (known limit).
- **The old GitHub Pages branch** serves an outdated site if you forget the fast-forward.

## 9. Still open (waiting on Nurassyl)

- Switch off the old shared password, then make the repository private: old `access.json` copies in git history hold the master key
  wrapped with the old class code.
- The marketing site `site/` is not connected to bynurzy.com yet (`deploy/README.md`).

## 10. Not the website, but in progress (2026-11-15/16)

Lesson presentations are being rebuilt. Samples were sent to Nurassyl, who is still giving feedback; the rest waits for his approval:
- **Boundaries** (V02 v4): one question per slide; 10 recall words; 20 lesson words by category; 4 cold start questions; for each of 8 rules
  «угадайте» → the rule shown with arrows on the same example → a College Board question → its solution; then 3:1 (three options cannot join
  two sentences, one can: the answer; 47 of 54 bank questions) and 2:2 (twins «.» and «;» are both wrong, 25 of 28); then back to the cold start.
- **Advanced Math IV** (M06): 3 types instead of 4, one dense slide per type, one question per slide, one exact Desmos line where Desmos solves it.

Sources: `notes/private/verbal-decks-2026-11.bin`, folders `wip-2026-11-16/` (`v02e.py`, `m06d.py`, the updated `deckgen.py` and `render.cjs`),
plus the earlier `answers/` and deck sources. The teacher answer sheets cite slide numbers, so rebuild them after any deck change.
