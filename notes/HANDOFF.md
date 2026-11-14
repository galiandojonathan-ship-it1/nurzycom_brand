# Handoff: course work, 8–9 November 2026

Read `CLAUDE.md` first: it holds the rules and the full description of the course site. This file adds what a new chat needs to
pick up the work from the session of 8–9 November 2026. It is public (the repository is public): no passwords, keys or question
content here.

## 1. The SAT pattern study (Nurassyl's real-test questions)

Nurassyl shared recent real test sets, labelled:

- **spt**: `GEMMONLY.pdf`, one full digital SAT (RW 27 + 27, Math 22 + 22);
- **nvm**: the `bluebookyorg` files, two forms;
- **aug**: `meo_markdown.zip`, 254 Reading and Writing screenshots;
- **oct**: `SAT_markdown_files.zip`, a baseline Verbal set plus hard Verbal and Math sets.

The analysis is `SAT_patterns.md` (274 lines; the earlier spt-only notes are `GEM_patterns.md`). Its contents:

- **Sources:** what each set contains.
- **Meta-patterns M1–M5:**
  - M1: the bank is a clone engine;
  - M2: in hard questions the right answer is hedged and the traps are absolute;
  - M3: four kinds of wrong answer;
  - M4: «an apparent finding explained by how it was measured», the core idea of the hard module;
  - M5: topic pools.
- **Pattern IDs:** Reading and Writing patterns **P-01…P-40** with counts (Notes questions, 61 hits, are the largest group; Transitions have 55 hits, sorted by logic type), and Math patterns **M-01…M-29** from spt and nvm.
- **Top priorities for the course**, by total hits.
- **Appendices:** answer keys made for aug and the oct baseline (no official keys were given), and a ledger.

Where it is:

- The encrypted copy is in the repo: `notes/private/sat-patterns-and-predictions.bin`. It holds `patterns/SAT_patterns.md`, `patterns/GEM_patterns.md` and the Прогноз 1 sources under `pred/` (`pr1_m1.py`, `pr1_m2h.py`, `pr1_m2e.py`, `words.py`, `build.py`, `seal.mjs`, `verify.mjs`). It is encrypted with the course master key, so it can sit in the public repo.
- The raw real-test question files are **not** stored anywhere in the repo, not even encrypted. They look like live exam items: they are never copied onto the site, and the course uses only original questions written on these patterns (see «Прогнозы» in `CLAUDE.md`).
- Plain copies of `SAT_patterns.md` and this file were also sent to Nurassyl in chat, so he can attach them to a new chat.

**To open the bundle in a new chat:**

1. Get the master key with Claude's own course login. Nurassyl gives the password; never write it into the repo. Run `L=claude P=<password> OUT=<scratchpad>/master_key.b64 node tools/private/getkey.js`.
2. Unpack: `node tools/private/unpack.mjs <scratchpad>/master_key.b64 notes/private/sat-patterns-and-predictions.bin <scratchpad>/private`.
3. After editing, pack it again: `node tools/private/pack.mjs <key> notes/private/sat-patterns-and-predictions.bin <dir>…`.

## 2. What was built (all live on study.bynurzy.com, `main`)

- **Прогноз 1 (PR1):**
  - 81 original Reading and Writing questions written on the pattern templates;
  - adaptive like PT5–PT8;
  - difficult and recurring words underlined («Частое на SAT»);
  - fifth group on `mock.html`, «Прогнозы»;
  - in the plan as an optional step for Verbal students.
- **Hourly quality loop, runs 1–12:** accessibility, offline messages, keyboard focus, the homework glossary, the teacher page and more. Details are in the commit history («Run N: …»). Highlights:
  - homework gets the «difficult words» glossary everywhere except Words in Context;
  - skip links on every page;
  - focus is never hidden under the sticky bars (WCAG 2.4.11, `scroll-padding`);
  - mock tests keep keyboard focus on the question or heading, and Escape closes the question panel;
  - the score trend uses one scale per course;
  - teacher tables are keyboard-reachable;
  - `.sr-only` is a global utility.
- **Teacher page, one-student view:** «разбор →» on homework and «ответы →» on practice tests show only that student's answers. Requested so Nurassyl could go over Ayana's mistakes with her.
- **Cabinet 2.0:**
  - groups with six contrasting colours, kept in KV `groups` through `api/admin/groups`;
  - an overview with a «требуют внимания» strip;
  - a profile header in the group colour;
  - three-step assigning.

## 2a. Added 9 November (later session)

- **Прогноз 2 and Прогноз 3:** full adaptive tests (RW + Math), 294 original questions on the pattern templates, live in the «Прогнозы» group and in the plan (optional, after the course). Sources, builder and spec are in the encrypted bundle under `pred/` (see `CLAUDE.md`).
- **Group analysis tool:** `analysis/` in the bundle reads the Google Form CSV and writes a group report (hardest questions, skills with the most misses, shared traps). It needs the CSV from Nurassyl (Google Sheets → File → Download → CSV).

## 3. Waiting on Nurassyl

- **Прогноз 2+ and Math predictions:** he has not said yes yet. Do not write them until he does.
- **Change the `claude` login password:** it was typed in a chat.
- **Set up his groups in the cabinet:** «Настроить» on each group, tick the students.
- **Older open items:** switch off the shared password and make the repository private. See `CLAUDE.md`.

## 4. The hourly loop

Nurassyl's loop, word for word:

> every 1 hour recheck the website for bugs and enhance UI/UX experience as much as possible, finding at least 3 flaws. Also, put unfamiliar and difficult words option to homeworks except for Words in Context. For these all, do research on the internet to find the best ways to handle the task over and over. Before each run, create the plan and how you will test whether you succeeded. After each run, question yourself what you can do better next run.

- **Stopped by Nurassyl on 2026-11-09 after run 14** (it had been set to run until 2026-11-15). Do not restart it unless he asks; if he does, start it with `/loop` and the text above.
- Each run: confirm the previous run is live, find and fix at least 3 flaws (reproduce each with a script first), run the suites, bump the cache tags, push to `main` and `claude/ecstatic-mayer-3asg7r`, check the live site, then schedule the next run.
- Ideas for run 13 and later:
  - CSS classes used in JS or HTML but defined nowhere;
  - cabinet 2.0 at 320 px and keyboard-only (group editor, assign steps, profile);
  - what happens when the groups endpoint fails;
  - cabinet tasks with due «Завтра» on the student's «Сегодня»;
  - the mock check-your-work screen on a phone.

## 5. Test kit (`tools/sitetests/`)

The scripts used in the loop. They write screenshots next to themselves, so copy them to the scratchpad and run them there:

1. `mkdir -p <scratch>/loop && cp tools/sitetests/* <scratch>/loop/ && cd <scratch>/loop && npm i axe-core`. Playwright is preinstalled.
2. Build local copies of `docs/`. Run these as separate commands:
   - `node mkfx.mjs /home/user/nurzycom_brand/docs fx`: throwaway key and fake data;
   - `node mkreal.mjs /home/user/nurzycom_brand/docs real <key.b64>`: real data, with the key re-wrapped under the local password `fixture-pw` and a test login `loop-test`. Never commit this copy.
3. Serve the copies:
   - `fx` on 8765, `site/` on 8766, `real` on 8767 (`python3 -m http.server`);
   - for the cabinet: `node pages_dev.mjs real 8768`, a stand-in that runs the real `functions/api/[[route]].js` with an in-memory KV, seeded by `cbseed.js`.
4. Run the suites:
   - **Pass/fail tests:** `t_*.js`. Examples: `t_flows.js phone|desktop`, `t_mock.js PR1 desktop`, `t_cabinet.js`, `t_solo.js`, `t_teacher.js`, `t_trend.js`, `t_auth.js`, `t_gloss.js`, `t_a11y.js`.
   - **Audits:** `axe11.js` (axe on teacher, cabinet and 404), `focus.js`, `obscured.js desktop|phone`, `mockkb.js`, `v320.js`.
   - **Live checks:** `live.js` and `live_pred.js`, with the env vars `L` and `P`.
5. Peek into encrypted data: `peek*.mjs <key.b64>`.

Lesson learned: when a test fails, check the selector before blaming the site. Three «failures» in runs 11–12 were the test's own fault.
