# Hard words in the mock tests (`docs/data/mockgloss.bin`)

The site underlines words in every mock question (`docs/gloss.js`): course-vocabulary words automatically, plus each
question's own extra words from `mockgloss.bin`. Those extras are words already in the question's text that a
Russian-speaking B2 student would likely not understand. Question texts are never changed.

The questions are encrypted, so the pipeline runs inside a logged-in browser. The master key never leaves the page and is
never written to disk. Everything decrypted goes to a private folder **outside the repository** (`PRIV`), never into git.

```bash
pip install wordfreq lemminflect cefrpy          # word frequency, lemmas, CEFR levels
export PRIV=/path/outside/the/repo/private        # decrypted questions and drafts live only here
LOGIN=… PW=… node extract.js                      # 1. decrypt mocks, bundles, vocabulary into $PRIV
python3 -I hardwords.py                           # 2. candidates: $PRIV/cands.tsv (per word), $PRIV/qcands.json (per question)
node analyze.js                                   #    course words whose cards lack an English meaning or a 2nd Russian word
#                                                   3. human pass: write $PRIV/lex.json (+ senses.json, course.json), see below
python3 -I build_gloss.py                         # 4. $PRIV/mockgloss.json
LOGIN=… PW=… node seal.js                         # 5. encrypt → docs/data/mockgloss.bin, checked by decrypting it back
```

## How a word becomes a candidate (hardwords.py)

1. **Level and rarity.** CEFR level from `cefrpy` and frequency (Zipf) from `wordfreq`. Known to a B2 learner: level B2 or
   lower and Zipf ≥ 3.5, or not in the CEFR list and Zipf ≥ 4.0. Everything else is a candidate (C1/C2 words, very rare words).
2. **Not counted:** names (a capital letter mid-sentence), words under 4 letters, words built from a well-known base
   (invent → inventor, usual → unusual), words already in the Verbal course vocabulary (the site underlines them anyway),
   and in Math questions the Math course terms.
3. **Added for the human pass:** phrases and phrasal verbs B2 learners misread (`PHRASES`: give rise to, at odds with,
   stem from …) and common words with a rare SAT sense (`RARE_SENSE`: novel, check, qualify, temper …), with context.
4. **Flagged, not dropped:** probable shared Latin/Greek words a Russian speaker recognises (`cognate?`: hypothesis →
   гипотеза). The human pass decides.

## The human pass (lex.json)

For each candidate in `cands.tsv`, read its contexts and decide:

- `keep: false` for shared words a Russian speaker recognises (prototype → прототип), terms the passage explains itself,
  and rare-sense flags where the word is used in its everyday sense.
- `keep: true` with `pos`, `en` (a short learner-dictionary definition in simple words, for the sense used in the test)
  and `ru` (at least 2 Russian equivalents that fit that sense). A word used in two senses gets `sense: { qkey: "word#2" }`
  and the second sense in `senses.json`.
- Course words listed by `analyze.js` get their missing English meaning or extra Russian equivalents in `course.json`.

`build_gloss.py` then keeps at most 4 extra words per question: words in the question and the options first, then the rarest.
During a test the site never underlines the options of Words in Context, Transitions or grammar questions (the options are
the answer), only in the review.

## What was done on 2026-11-06 (first full run, 12 tests, 1,500 questions)

1. `hardwords.py` found 1,518 candidate words (after the name and compound filters). Every candidate was judged by hand:
   kept 331 (academic and literary words, phrases, archaic forms), dropped shared Russian words, Kazakh words, names,
   chemical and species names, compounds of known words. Rare senses only where the passage uses them (check, credit, grant…).
2. Every Reading and Writing question that still had nothing underlined (256) was read in full and given the word that
   blocks understanding, if any (outlet, strait, wells = колодцы, surface = всплывать…); about 100 easy questions have none.
   In «most nearly mean» questions the tested word is never chosen.
3. Cards: 477 question words and 73 course words completed (English meaning in simple words for the sense used, at least
   two Russian equivalents). At most 4 extra words per question. Result: 841 of 1,500 questions (814 of 972 RW) underlined.
4. Wrong senses of course words were checked on every occurrence: gloss.js rules (novel, maintain, long to, qualify, lend,
   instrumental, grave, champion, address, afford, trace, reserve, profit from; no course card on a capitalised title word)
   plus `off` (never in the tests: novel, coin, moderate, canon) and `skip` (per question) in mockgloss.bin.

To change it later: `extract.js` also saves the current glossary (`$PRIV/gloss.json`); edit it, save it as
`$PRIV/mockgloss.json`, run `seal.js`, and check with a run of the site's own gloss.js over all questions.
