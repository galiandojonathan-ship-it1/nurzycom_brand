# «Сегодня»: a start panel for students on the course site

Date: 2026-11-06 · Status: design for approval · Wireframe: `design/superpowers/wireframes/today-desktop.png`, `today-phone.png`

## Intent and the why

Students land on «Домашние задания» after login and meet a three-step form (name, lesson, part). Nothing tells them
what to do today or how far they have come: the plan ticks itself on its own page, scores sit on separate pages, test
results live inside each test. Students are grade 9–12 Kazakhstani students, Russian-speaking, mostly on phones,
studying alone between weekly 70-minute lessons. A clear next step and visible progress keep them working between
lessons, which is what the course plan exists for. (From CLAUDE.md: the plan, the account sync, the student feedback
that asked to reopen results; the brainstorm questions were answered from those sources at Nurassyl's request.)

## Goals

1. After login, the first screen answers «what do I do now?» with one button that opens that exact task.
2. A student sees progress: share of the plan done, and the estimated score of each finished practice test.
3. The last few submissions are visible with their scores, newest first.
4. The redundant name field disappears for logged-in students (the login already sets the name).

## Non-goals

- No new top-nav item (CLAUDE.md rule: the nav stays as it is; extra sections go under «Полезное»).
- No change to how homework is chosen, solved or sent to the Google Form.
- No new data collection, no server changes: everything comes from what the browser already keeps and the account sync.
- No visual rebrand.

## Anti-goals (a failure even if it works)

- An estimated score shown as a result (hard rule 2): it is always labelled «примерный балл», private to the student.
- Gamification noise: streaks, confetti, badges. The brand is a calm, precise mentor.
- A panel that pushes the lesson picker below the fold on a phone so far that a student who knows what they want has to
  scroll a lot: the panel stays compact on phones.

## Constraints

- Brand (CLAUDE.md): black and white only (Ink #0A0A0A, Paper #FAF8F3, Mist #F0EEE8, Studio #D5D5D4, Stone #5A5852), no
  accent colour; Noto Serif Display Light Italic only at 40 px and above; Geist for text; IBM Plex Mono for labels.
- Plain HTML/CSS/JS, no build step; `deploy/bump_version.py` after script/CSS changes; CSP allows scripts from the site only.
- Data: plan steps and ticks (`plan_done_<name>`, `plan_course`), part scores (`hw_last_`, `px_last_`, `rd_last_`),
  finished tests (`mk_done_`), change times (`sync_meta`). All per device and synced to the account.

## Approaches

| | Where | Trade-off |
|---|---|---|
| **A (picked)** | A «Сегодня» panel at the top of «Домашние задания», shown only after login | Everyone lands here (logo and login go to this page); no new nav item; the picker stays one scroll away |
| B | A progress summary at the top of «План курса» | Fewer students open the plan; does not fix the first screen |
| C | A new «Главная» page | Breaks the nav rule; one more click before work |

The plan logic moves into a shared `planlogic.js` so the plan page and the panel always agree on «next step» and «done».

## The design (decided)

- **Next step card:** the first required, unticked step of the course plan for the student's course (Verbal, Math or
  both), its time estimate, and «Открыть», which opens that exact part, text or test. Under it the next two steps.
- **Plan progress:** «N из M шагов» with a thin bar, and «урок k из 12»; a link to the whole plan.
- **Practice tests:** one bar per finished test with its estimated score and «примерный балл»; tapping one opens
  «Результат и разбор» for that test. No test yet: a single card «Начните с пробного теста 1: он покажет исходную точку».
- **Recent submissions:** the three newest results with scores (from the change times the sync keeps).
- **Name field:** hidden after login; still shown with the shared password (no login).

## Visual direction (frontend-design pass, brand locked)

Prompt used for the build, adapted from Anthropic's «Prompting for frontend aesthetics» (theme-constraint form):

> Design one compact, high-quality panel for a calm, precise SAT mentor's course site. The theme is locked: black and
> white only (#0A0A0A, #FAF8F3, #F0EEE8, #D5D5D4, #5A5852), no accent colour, Noto Serif Display Light Italic only at
> 40 px+, Geist for text, IBM Plex Mono for data. Spend the boldness in one place: the next step, set as a large
> italic serif line, the one thing a student remembers. Everything else is quiet: hairlines, generous space, numbers
> in mono. Avoid the generic kit: no identical rounded cards with soft shadows, no gradient washes, no tracked-out
> caps label above every block, no «01 / 02» numbering on content that is not a sequence, no arrow glyph on every
> link. Motion only answers the student (a short reveal when the panel first appears; reduced-motion respected).
> Phone first: the next step and its button fit on the first screen of a 390 px phone.

Calls made in this pass (Nurassyl can overrule): the score chart is drawn as a row of thin ink columns on hairline
grid, with the number in mono above each, rather than a line chart (few points, each a separate test); the hexagon
from the logo marks the current step, echoing the plan page.

## Left to the builder

Exact spacing, the phone layout order (next step → progress → tests → recent), empty and partial states (no plan
course chosen yet, no results), keyboard focus, and tests on desktop and phone before anything reaches `main`.
