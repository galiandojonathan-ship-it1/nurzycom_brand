# IELTS-style content spec (experimental course)

How NURZYCOM writes IELTS-style material that matches the real test as closely as possible, without copying it.
Built from official IELTS format pages and IELTS research reports (sources at the end). Version 1, 12 Nov 2026.

**Golden rule.** Everything is original. Official and published IELTS materials (Cambridge IELTS books, ielts.org samples) may be **measured** (length, sentence length, readability, question mix) but their wording is never copied or closely reworded.

---

## 1. Academic Reading

### 1.1 Passage targets

| Feature | Target | Basis |
|---|---|---|
| Passages per test | 3 | Official format |
| Words per test | 2,150–2,750 | Official format |
| Words per passage | 600–1,060; aim for ~850 | Weir et al. 2009: mean 854, range 589–1,063 across 14 tests |
| Paragraphs | 5–8, lettered A, B, C… when a matching task needs them | Matching tasks need clearly themed paragraphs |
| Source style | Book, journal, magazine or newspaper article for a non-specialist reader | Official format |
| Range across a test | One descriptive and factual, one mixed, one discursive or analytical with a detailed argument | Official format: "at least one" detailed argument |
| Readability | About one grade easier than a first-year university textbook; Flesch–Kincaid grade 11–14 is the working band (see 1.4) | Weir et al. 2009: IELTS ~5 Flesch points easier, ~1 grade lower than textbooks; highest IELTS grade 16 |
| Academic words | ~8% of running words from the Academic Word List (range seen 2–10%) | Weir et al. 2009: IELTS mean 7.9% |
| Technical words | Few; any unavoidable term gets a short glossary | Official format; texts contain fewer technical and off-list words than textbooks |
| Background knowledge | None needed. No subject-specific or culture-bound knowledge | Item writers are told to reject texts too technical for the general reader or dependent on discipline or cultural knowledge |
| Sensitive topics | Avoid war, disease outbreaks, religion and politics as the main subject; history and science told neutrally | Editing practice reported by Green & Hawkey 2012 |

### 1.2 Questions per passage

- **13–14 questions, in 2–3 different task types.** 40 per test.
- Task types: multiple choice; identifying information (True / False / Not Given); identifying the writer's views (Yes / No / Not Given); matching information; matching headings; matching features; matching sentence endings; sentence completion; summary, note, table or flow-chart completion; diagram label completion; short-answer questions.
- **Order:** multiple choice, True / False / Not Given and most completion items follow the order of the text. Summary completion answers usually come from **one section**, and need not be in order. Matching tasks are not in order.
- **Matching headings:** always more headings than paragraphs; some headings are not used.
- **Word limits:** state them exactly ("NO MORE THAN TWO WORDS from the passage", "ONE WORD ONLY"). Over the limit = wrong. Hyphenated words count as one. Numbers may be figures or words.
- **What items test:** mostly careful reading at sentence level, some across sentences, a little skimming and scanning. Weir et al. found about 77% careful reading, about 23% expeditious, and almost no whole-text items. Our sets keep that balance, plus one heading or main-idea task per test for global reading.

### 1.3 Item-writing rules

1. **Paraphrase, never echo.** The statement or question uses different words from the sentence that answers it. A student who only matches words must fail.
2. **One defensible key.** Two people solve every item independently (`chk: 2`) before it ships.
3. **True / False / Not Given:**
   - FALSE = the text states the opposite.
   - NOT GIVEN = neither confirmed nor contradicted.
   - At least one NOT GIVEN per set must be something a student might know from real life, so outside knowledge is the trap.
4. **Distractors are plausible:** they use words from the text, sit near the answer, or are true but answer a different question.
5. **Completion answers are copied words.** Each gap has one natural answer within the word limit. List the accepted spellings and forms (`accept`).
6. **Spread the keys:** no more than two identical answers in a row in a True / False / Not Given set; letters spread across A–D.

### 1.4 How we check a passage (`tools/ielts_measure.py`)

The script reports words, paragraphs, sentence length, word length, Flesch Reading Ease, Flesch–Kincaid grade, the share of long words, and the Academic Word List share when an AWL file is supplied.

- **Pass:** 600–1,060 words, grade 11–14, average sentence 18–26 words.
- **Calibration to do:** run the script on official sample passages Nurassyl owns, and replace the working bands above with the measured ones. Only numbers are kept, never text.

---

## 2. Listening

| Part | Speakers | Context | Our scripts |
|---|---|---|---|
| 1 | Two, conversation | Everyday social, e.g. travel arrangements | Form or note completion: names, numbers, dates |
| 2 | One main speaker | Everyday social, e.g. local facilities | Map or plan labelling, multiple choice |
| 3 | Two main speakers, possibly a tutor | Education or training | Multiple choice, matching opinions to speakers |
| 4 | One speaker | A lecture on an academic subject | Note or summary completion |

- 10 questions per part, 40 in total, about 30 minutes; each recording is played **once**; questions follow the order of the recording.
- Accents: British, Australian, New Zealand and North American.
- **Scripts must sound spoken, not read:** short clauses, fillers (*well*, *right*, *so*), self-correction (*it's on the 14th, sorry, the 15th*), turn-taking, a little repetition. Written-style scripts are too dense and unrealistic.
- **Distractors:** the first thing said is often corrected (*used to be*, *actually*, *instead*). Every Part 1 and Part 2 script has at least two such turns.
- **True / False / Not Given is a Reading task, not a Listening one.** Lesson C12 currently uses it as attention practice; replace it with multiple choice or completion in the next build.
- **Audio:** browser speech synthesis is a stopgap. For anything exam-like, record real voices.

## 3. Writing

- **Task 1** (150+ words): describe a graph, table, chart, process or map. An overview of the main trends and the most striking change is required; no explanation of causes the data does not show.
- **Task 2** (250+ words): a position on a public question. Research found Task 2 prompts resemble the newspaper editorial and letter to the editor more than university essays, so prompts read like a public debate: *Some people think… To what extent do you agree or disagree?* / *Discuss both views and give your own opinion.*
- **Marking:** the public band descriptors of May 2023 are the full examiner scales. A script must fit all positive features of a band; bolded features limit the band. Peer review in office hours uses the same four criteria.

## 4. Speaking

- Part 1: 4–5 minutes, familiar topics. Part 2: a 1-minute preparation and up to 2 minutes of talk from a cue card. Part 3: 4–5 minutes, abstract discussion linked to Part 2.
- Four equally weighted criteria: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation.
- Our cue cards follow the real shape: a "Describe…" line plus four "You should say:" points, the last one asking *why* or *how you felt*.

## 5. Review and pretest (our version of the official cycle)

IELTS material goes through commissioning to specifications, editing, pretesting on real candidates, and statistical review before use. Ours:

1. **Write to this spec.**
2. **Measure:** run `tools/ielts_measure.py` on the passage, then fix length and readability.
3. **Second solver:** a separate pass solves every item blind; any mismatch or second defensible answer is rewritten.
4. **Pretest:** after a group takes a set, read first-attempt accuracy per item on the progress page. Rewrite items that almost everyone gets right, or that strong students miss more than weak ones.
5. **Bank:** only items that pass step 4 go into check-ins.

## Sources

- IELTS, Academic Reading and Listening format pages (ielts.org; ielts.idp.com question-type guides)
- IELTS, *How we develop the test* (ielts.org)
- Weir, Hawkey, Green, Unaldi & Devi (2009), *The relationship between the academic reading construct as measured by IELTS and the reading experiences of students in their first year of study at a British university*, IELTS Research Reports Vol. 9 (cdn.ielts.org)
- Green & Hawkey (2012), *Re-fitting for a different purpose*, Language Testing 29(1)
- Moore & Morton (1999), *Authenticity in the IELTS Academic Module Writing test*, IELTS Research Reports Vol. 2
- Rossi & Brunfaut (2021), *Text authenticity in listening assessment*, Language Assessment Quarterly
- IELTS Writing band descriptors, updated May 2023
