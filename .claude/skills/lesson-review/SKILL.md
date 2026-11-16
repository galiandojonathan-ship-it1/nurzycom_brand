---
name: lesson-review
description: Turn what Nurassyl marked during live lessons («Режим урока» on study.bynurzy.com) into site improvements - definitions for words the class did not know, clearer explanations and hints for flagged questions, trap data from class votes, a pacing report, and a digest he approves. Use when he says "lesson review", "разбери урок", "обработай отметки", or /lesson-review. The skill also improves itself - every correction he makes becomes a rule for the next review.
---

# Lesson review

During lessons Nurassyl is logged in as the lesson account (login `lesson`). `docs/lesson.js` records one session per
lesson: which question was on screen and for how long, words he selected, hard-question flags with a reason, «Сработало»
notes (the explanation that worked) and the option most of the class chose. Nothing is analysed during the lesson. This
skill is the analysis. It runs only when asked, because it needs passwords that are never stored.

Read `CLAUDE.md` (hard rules) and `notes/WEBSITE_HANDOFF.md` (data, tests, shipping) first.

## Quick mode: words only (`/lesson-review words`, every two days)

Nurassyl's rule (2026-11-16): «When I mark a word, automatically gather them and then make them underlined vocabulary words
like others». Words therefore ship without waiting for the digest; everything else in this skill still waits for his approval.

1. Key and sessions: Step 0, then `L=lesson P=<password> OUT=<scratchpad>/lessons.json node tools/private/lessonlog.js`.
2. `node tools/private/lessonwords.mjs pending <key.b64> <scratchpad>/lessons.json > <scratchpad>/pending.json`.
   No pending words → say so in one line and stop (nothing to commit).
3. For each pending word decide, reading its sentence (`ctx`) and the question (open it with `datafile.mjs` if needed):
   - **add**: `en` (the dictionary form: «interspersing» → «intersperse», keep fixed phrases such as «devoid of»), `pos`,
     `def` (a learner-dictionary definition in simple English for the sense in that sentence), `ru` (2–3 Russian equivalents
     for that sense, comma-separated), `ex` (the lesson sentence if it is under ~200 characters, otherwise a short original
     sentence), `from` (the question ids);
   - **skip** with a reason: names, numbers, words the passage itself explains, plain words a B2 student knows (the teacher may
     have marked it by accident), test words of Claude's own checks (group «Пример (тест Claude)» or «Проверка Claude»).
   Check: every pending word is in exactly one of the two lists; every Russian equivalent fits the sentence's sense.
4. `node tools/private/lessonwords.mjs apply <key.b64> <scratchpad>/defs.json` (writes `docs/data/vocab.bin`, deck «VL ·
   Слова с уроков»; gloss.js then underlines the words in tests and homework, and the vocabulary page lists the deck).
5. Test with real data (`notes/WEBSITE_HANDOFF.md` §6): `t_vocab2.js` and `t_mock.js` pass; open one question that contains a
   new word on the local copy and see it underlined.
6. Commit `docs/data/vocab.bin` («Words from lessons: …»), push `main`, fast-forward the old Pages branch, check live.
7. Write the review back so the cabinet shows each word's definition: `PUT=<reviews.json> … lessonlog.js` with
   `{ "<session id>": { "v": 1, "words": [{ "w", "en", "ru", "verdict": "deck"|"skip" }] } }` (merge with an existing review of
   that session, do not overwrite its summary).
8. One short Russian line to Nurassyl: which words were added, which were set aside and why.

## Step 0. What you need

- The course master key in the scratchpad (`tools/private/getkey.js`, login `claude`) and the `lesson` password. Ask
  Nurassyl for either password if it is not in this chat. Never write them to the repository.
- Check: `test -s <scratchpad>/master_key.b64`.

## Step 1. Open the database and the learned rules

```bash
node tools/private/unpack.mjs <key.b64> notes/private/lesson-log.bin <scratchpad>/lessonlog   # skip on the very first review
```

- `db.json`: `{ sessions: [], words: {}, questions: {} }` (create it on the first review).
- `RULES.md`: what earlier reviews learned from Nurassyl's corrections. **Read it before writing anything and follow it.**
- Check: you can say how many sessions, words and questions the database holds.

## Step 2. Pull the new sessions

```bash
L=lesson P=<password> OUT=<scratchpad>/lessons.json node tools/private/lessonlog.js
```

- Take finished sessions (`t1 > 0`) whose `id` is not in `db.sessions`.
- The part of the lesson is in every event as `ti` («SAT Verbal · Урок 7 · Практика»); nobody types it. `s.lesson` is empty in new sessions. A session still running is left alone.
- Check: the script's summary line per session matches what you loaded. No new sessions → say so and stop.

## Step 3. Analyse (one pass per kind of mark)

Open the question behind each mark with `tools/private/datafile.mjs` (ids: tests `PT5.rw.m1.12`, homework
`<lesson tag>.<part id>.<question number>`). Decrypted text stays in the scratchpad.

1. **Words** (`k: "word"`, with the sentence `ctx`). Per word: lemma, part of speech, a learner-dictionary definition in
   simple English for the sense in that sentence, at least 2 Russian equivalents, and a verdict:
   - `deck`: add to the deck «VL · Слова с уроков» with `tools/private/lessonwords.mjs` (quick mode above): it is underlined
     in tests and homework like every course word;
   - `gloss`: only for a sense that belongs to one question (`mockgloss.bin` → `add`, see `tools/mockgloss/README.md`);
   - `skip`: a name, a term the passage explains, or a word too rare to be worth learning (say why).
   Words ship automatically (Nurassyl's rule, quick mode above). Check: every word has a verdict and none is left without a Russian equivalent.
2. **Flagged questions** (`k: "flag"`, `why`: text / rule / trap / slow / bug). Solve the question yourself first, then:
   - `text` → which sentence blocks understanding; a plain-English paraphrase and the words to gloss;
   - `rule` → the rule in one line and the lesson that teaches it;
   - `trap` → why the tempting option looks right and the test that kills it;
   - `slow` → the fastest route (Desmos line for Math if one exists);
   - `bug` → check the key and the text; a confirmed error is fixed first, before anything else in the review.
   Then pick 3 twin questions of the same skill from parts the group has not done. **A question flagged 3 or more times
   across sessions gets a permanent hint on the site and a note for that lesson's deck.**
   Check: your own answer equals the stored key for every flagged question (a mismatch is a `bug` finding).
3. **«Сработало» notes** (`k: "note"`). His words are the best explanation available: attach the note to its question and
   propose it, lightly edited, as the first line of that question's hint or explanation. Never rewrite its idea.
4. **Class votes** (`k: "vote"`, the last vote per question counts). A vote for a wrong option is a trap record: option,
   why it attracts, which skill. Compare with «Общие ловушки» on the teacher page when the data is available.
5. **Timeline** (`k: "at"`). Time per question = gap to the next `at`. Report the total against 70 minutes, the five
   longest questions, and time spent outside questions. Check: the minutes add up to the session length.

## Step 4. Digest for Nurassyl (he approves before anything ships)

Write `<scratchpad>/lesson-digest-<date>.md` in Russian (questions and words in English) and show it in chat:
what the group struggled with in three lines; the word table with verdicts; each flagged question with the proposed
hint; the twin questions as a ready block in the «Мои тесты» paste format (he pastes it in the cabinet: the admin key
lives only in his browser); the pacing report; a short Telegram message for the group. No student names anywhere.
Check: every item in the digest traces back to a mark in a session.

## Step 5. Apply what he approved

Only approved items. Edit data with `datafile.mjs` or the glossary pipeline, run `python3 deploy/bump_version.py` if a
script or `site.css` changed, run the tests for the touched area (`notes/WEBSITE_HANDOFF.md` §6), push `main`, fast-forward
the old Pages branch, check live. Check: the changed question shows the new word or hint on the live site.

## Step 6. Learn, save, clean up (never skip)

1. **Learn.** For every item he changed or rejected, add one dated line to `RULES.md`: what he changed, his reason in
   his words, and the rule you draw from it (label the rule as your reading). If the same correction appears a third
   time, move it into Step 3 of this file as a fixed instruction and say so in the commit.
2. **Save.** Add the sessions and results to `db.json` (per word: lemma, definition, Russian, verdict, question ids,
   groups, count; per question: flags by reason, votes, notes, the analysis, status). Then
   `node tools/private/pack.mjs <key.b64> notes/private/lesson-log.bin <scratchpad>/lessonlog` and commit the `.bin`.
3. **Write the review back.** Nurassyl reads lessons in the cabinet (`cabinet.html` → «Уроки», `docs/cblesson.js`), so each
   reviewed session gets a record there: `PUT=<scratchpad>/reviews.json … lessonlog.js` with
   `{ "<session id>": { "v": 1, "summary": "2-3 Russian sentences", "pacing": "one Russian sentence", "words": [{ "w": "<as marked>", "en": "…", "ru": ["…", "…"], "verdict": "gloss|deck|skip" }], "questions": { "<question id>": { "text": "the analysis in Russian", "hint": "the proposed hint" } } } }`.
   Only what he approved or what is plain analysis; no student names. Check: open the cabinet view in a test or ask him to.
4. **Clean up.** Sessions stay on the account: the cabinet reads its history from there. Prune (`PRUNE=<ids>`) only
   lessons older than six months, and only after they are saved in `db.json`.
5. Tell Nurassyl in a few lines what shipped, what waits on him, and which rule the skill learned this time.

## Limits that do not bend

- Hard rules of `CLAUDE.md`: nothing invented, no student names, College Board text only inside encrypted files.
- The database and `RULES.md` live only in the encrypted bundle: they describe the teaching method, which stays private.
- Nothing reaches students without his approval of the digest.
