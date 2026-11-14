# Start here: summary of the previous chat (Oct 13 – Nov 8, 2026)

Paste or attach this file in a new chat, then say: «Read NEW_CHAT.md, handoff.md and CLAUDE.md, then continue».
`CLAUDE.md` is the single source of truth (business, hard rules, brand, every part of the site). `handoff.md` has the
operational details (build folder, secrets, test routine). This file is the story of what was built and what is next.

## Who and what

- Nurassyl Kunanbayev (@nurzycom), NU Chemical Engineering student, SAT tutor (SAT 1560, IELTS 8.0).
- Repository: https://github.com/galiandojonathan-ship-it1/nurzycom_brand, working branch `main`.
- Course site (password / login protected): https://study.bynurzy.com (Cloudflare Pages, built from `main/docs`).
- Main brand site `site/` (bynurzy.com) is prepared but not launched.

## What the chat built, in order

**Course materials (SAT Verbal and Math, 12 lessons each, all done)**
- Lesson packs: English slides, Russian-friendly workbooks, separate answer sheets with short Russian explanations,
  tutor guides, vocabulary. Delivered as PDFs in chat (not in the repo); full course zips rebuilt Nov 2–3.
- Lesson M03 and V07 (Cross-Text Connections) built in this chat; all 25 decks' explanation slides rewritten in more
  detail (Nov 2); in all Verbal decks «Today's words» moved to the start (Nov 3).
- Desmos: every course Math question reviewed, 484 with a Desmos hint; Desmos lesson D (after Math 6); Desmos page with
  6 practice sets (Nov 1). Unit circle page with 4 sets (Nov 2).
- Lesson A «Archaic words» (after Verbal 11) with an archaic words page and 3 sets; «Полезное» hub for extra pages (Nov 3).

**Practice tests on the site (19 in total)**
- PT1–4 full adaptive tests (Oct 24), made harder the same day; PT5–8 Reading and Writing only, all original questions
  (Oct 25); PT9–12 full tests, mostly original (Nov 2); module 1 Reading and Writing of PT1–12 rewritten at real exam
  length and difficulty, 295 new questions (Nov 3).
- PT13–19 (Nov 6): 1,029 official «active» College Board questions not used anywhere else. Module 1 is a bit easier
  than the usual 6/12/9 rule; no Desmos hints yet; about 849 active questions remain.
- Bluebook-style results (Nov 4): estimated score up to 1600 (always «примерный»), skill bars, weak skills with links to
  lessons, review with explanations.
- Difficult words underlined in test questions with meaning and translation (shared glossary); 261 words of PT13–19 are
  also vocabulary decks P13–P19.
- Teacher answer sheet for all 19 tests (PDF in chat).

**Teacher tools**
- `teacher.html`: results from the Google Form, dates fixed (Nov 4), every practice-test question with who chose what.
- Accounts: per-student logins, then self sign-up with a class code (Cloudflare KV), password reset by the teacher.
- Parallel chat (Nov 6) added: the «Сегодня» student panel, the teacher's cabinet (progress, plan, reset, assign tasks),
  merged student name spellings, Google Form import into accounts.

**Hosting**
- Domain bynurzy.com bought (Nov 4); `main` made the single branch; course site moved to Cloudflare Pages on
  study.bynurzy.com; script cache problem fixed with version tags (`deploy/bump_version.py`).

**Research and proposals**
- Pattern study of 3,673 bank questions and the «Course 2.0 · metalearning» proposal PDF (Nov 4): waiting on decisions.
- Competitor's 24-lesson course reviewed (Nov 6). Recommendation: about 18 lessons on top of the current course
  (Lesson 0 «how to study for the SAT», grammar split into 4 + review, Words in Context II, Command of Evidence with
  tables and graphs; keep Words in Context early). Waiting on «go» and a pricing decision.

**Tools set up (Nov 6–7)**
- Skills: frontend-design, webapp-testing, Vercel (3), web quality (6), UI/UX Pro Max (+5),
  thermo-nuclear-code-quality-review, improve-codebase-architecture (+3). The last two start only when Nurassyl types
  `/thermo-nuclear-code-quality-review` or `/improve-codebase-architecture`.
- Orchestrator mode: oh-my-claudecode with 19 agents; installs itself at every new session (Default environment setup
  script, approved).
- Codex: `AGENTS.md` sets the rules (branches `codex/<task>`, pull requests into `main`, Claude reviews and merges). A
  starter prompt was given; not known whether Codex was connected.
- Gemini was offered (free API key) and declined; not connected.

## Before you continue

- **Build folder:** question sources, answer keys and build scripts are not in the repo. Nurassyl has the archive
  `nurzycom_build_sources.zip` (64 MB, no secrets). Ask him to attach it whenever work touches questions, tests,
  vocabulary or encrypted site data. How to restore it and the master key: `handoff.md`, section 2.
- Never commit the master key or the class code; never publish College Board questions or student results without
  consent (hard rules in `CLAUDE.md`).
- Other chats push to `main` too: fetch and merge before every push; after pushing also update
  `claude/ecstatic-mayer-3asg7r`.

## Open decisions for Nurassyl

1. 18-lesson course: go or not, and the new price.
2. Switch off the shared password and make the repository private.
3. Import Google Form results in the cabinet (only he can, the admin key is in his browser).
4. Metalearning proposal: answers to the last page of the PDF.
5. Connect Codex (optional) and send its first pull request to Claude for review.
6. Long-standing items in `CLAUDE.md`: portrait photo, October SAT scores with consent, self-employed registration.

## Suggested first tasks in the new chat

1. If «go»: plan the 18-lesson course with the planner agent, starting with Lesson 0 and the grammar split.
2. Desmos hints for the Math questions of PT13–19.
3. Content: the «3 mistakes in SAT Reading & Writing» carousel and a 4-week content calendar (see `CLAUDE.md`).
