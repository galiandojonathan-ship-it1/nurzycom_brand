/* NURZYCOM experimental course: the 4-step cadence.
   1 Presentation (slides, in class) → 2 Website homework (lesson.html) → 3 Office hours (office.html) → 4 Progress (progress.html).
   Every item here is ORIGINAL. Slides are in English; student instructions and explanations in Russian.
   Worked examples on slides are new items, never the homework questions. chk: 2 = key solved independently twice. */

window.CADENCE = {
  steps: [
    { n: 1, id: "slides", name: "Presentation", ru: "Презентация", page: "slides.html",
      what: "На уроке: сюжет, слова, правило и два разобранных примера, по одному на каждый экзамен." },
    { n: 2, id: "homework", name: "Website homework", ru: "Домашнее задание на сайте", page: "lesson.html",
      what: "Сам(а): слова, вопросы SAT и IELTS, устный ответ, короткое письмо, exit check." },
    { n: 3, id: "office", name: "Office hours", ru: "Office hours", page: "office.html",
      what: "Живая встреча: разбор твоих ошибок SAT, взаимная проверка письма IELTS, разговорная практика." },
    { n: 4, id: "progress", name: "Progress", ru: "Прогресс", page: "progress.html",
      what: "Измеримый рост: навыки по первой попытке, check-in в конце каждого блока, письмо и речь в цифрах." }
  ],
  /* trap categories a student picks for each SAT mistake in office hours */
  traps: ["Не то значение слова", "Не то отношение между мыслями", "Факт верный, но не по цели", "Перепутал(а) данные", "Ответ не из текста", "Невнимательно прочитал(а)", "Не знаю почему"],
  /* IELTS Writing criteria used for peer feedback */
  criteria: [
    { c: "TR", name: "Task Response", ru: "Ответ на задание: сделано то, что просили? Нет лишнего?" },
    { c: "CC", name: "Coherence and Cohesion", ru: "Связность: мысли идут по порядку, связки верные и не на каждом шагу?" },
    { c: "LR", name: "Lexical Resource", ru: "Словарь: точные слова, нет повторов, слова урока к месту?" },
    { c: "GRA", name: "Grammatical Range and Accuracy", ru: "Грамматика: границы предложений, формы глаголов, артикли?" }
  ],
  /* when the block check-ins happen (step 4 at block level) */
  checkins: [
    { id: "D0", title: "Diagnostic", after: null, ru: "До первого урока", status: "live" },
    { id: "K1", title: "Check-in A · The sentence", after: "C04", ru: "После C04", status: "live" },
    { id: "K2", title: "Check-in B · The paragraph", after: "C08", ru: "После C08", status: "live" },
    { id: "K3", title: "Check-in C · The argument", after: "C11", ru: "После C11", status: "live" },
    { id: "KF", title: "Final check", after: "C16", ru: "В конце курса", status: "live" }
  ],
  skills: {
    WIC: "Words in Context", BND: "Boundaries", FSS: "Form, Structure, and Sense", TRN: "Transitions",
    RS: "Rhetorical Synthesis", COEQ: "Command of Evidence (quantitative)", CID: "Central Ideas and Details", TSP: "Text Structure and Purpose", INF: "Inferences", COET: "Command of Evidence (textual)", CTC: "Cross-Text Connections",
    "R-TFNG": "IELTS Reading: True / False / Not Given, Yes / No / Not Given", "R-HEAD": "IELTS Reading: matching headings and information", "R-GAP": "IELTS Reading: summary and sentence completion", "R-MC": "IELTS Reading: multiple choice", LIS: "IELTS Listening", SPK: "IELTS Speaking: recognising clear delivery", WRT: "IELTS Writing: recognising claim and support"
  }
};

/* ------------------------------------------------------------------
   Step 1 · Presentations. Slides are generated from this data plus the lesson data (words, speaking, writing, hand-off).
   rules: numbered, each with how and why; mistake: the common mistake; story: the conceptual narrative;
   bridge: how the other exam tests the same skill; ex: two worked examples (steps, a check, why each option is right or wrong). */
window.DECKS = {
  C01: {
    rules: [
      ["Predict before you look.", "Cover the choices, read the text and say your own word for the blank. The choices are built to sound right; your prediction is built from the text."],
      ["Prove it with the text.", "Find the words that force the answer: a contrast word, a colon, a cause. Every right answer on the SAT is proved by the passage."],
      ["“Most nearly mean” asks for the meaning here.", "Test makers choose familiar words used in an unusual sense. The common meaning is often the trap."]
    ],
    mistake: "Choosing the word that fits the topic (maps, travel) instead of the logic of the sentence.",
    story: [
      ["Every map is a decision", "A map the size of the territory would be useless. To be readable, a map must leave things out: buildings, slopes, sometimes even distance."],
      ["1569: a map for sailors", "On Gerardus Mercator's world map, a straight line keeps a constant compass bearing, so sailors could plot a course with a ruler. The price: lands far from the equator look far larger than they are."],
      ["1933: a map for passengers", "Harry Beck's Underground diagram kept the order of stations and dropped real distance. Today's question: how do you read a word when the text, like a map, shows only what matters?"]
    ],
    bridge: ["Same skill, other exam", "IELTS Reading rarely repeats the words of the text. A statement says the same idea in other words, and you match meaning, not vocabulary. Paraphrase is Words in Context in reverse."],
    ex: [
      { exam: "SAT", label: "Words in Context", chk: 2,
        text: "Early sea charts often showed coastlines in great detail but left the interiors of continents blank. The mapmakers were not careless; they were ______, refusing to draw what no traveller had reported.",
        stem: "Which choice completes the text with the most logical and precise word?",
        opts: ["hurried", "ignorant", "scrupulous", "artistic"], key: 2,
        steps: ["Cover the choices. The text says the mapmakers were “not careless” and “refused to draw what no traveller had reported”.", "Predict a word: careful, honest about what they knew.", "Match the prediction: scrupulous = careful to do only what is accurate and right."],
        check: "Read the sentence with the answer. The second half (“refusing to draw…”) now explains the first.",
        why: ["Hurried is the opposite of careful.", "Ignorant: they did lack knowledge, but the text praises a choice, not a lack.", "Correct: “not careless” plus the refusal to invent.", "Artistic fits maps in general, not the logic of this sentence."] },
      { exam: "IELTS", label: "Reading: True / False / Not Given", chk: 2,
        passage: "Many early travel guides left out smaller roads altogether. Their editors believed that a visitor needed the main routes, not every lane.",
        stem: "The editors thought visitors should be shown every road.", tf: true, key: "F",
        steps: ["Find the part of the text about what visitors needed.", "“The main routes, not every lane” is a paraphrase of “not every road”.", "The statement says the opposite of the text."],
        check: "Could the statement and the text both be true at once? No. So it is FALSE, not NOT GIVEN.",
        why: ["TRUE would need the text to agree. It says the opposite.", "Correct: “not every lane” contradicts “every road”.", "NOT GIVEN would mean the text is silent. It states the editors' view directly."] }
    ]
  },

  C02: {
    rules: [
      ["Two complete sentences need a real joint.", "Use a full stop, a semicolon, or a comma plus and / but / so. A comma alone between two sentences is a comma splice."],
      ["A colon follows a complete sentence.", "What comes before the colon must stand alone; what follows explains it or lists examples."],
      ["One comma cannot split a core.", "Do not separate a subject from its verb, or a verb from its object, with a single comma."]
    ],
    mistake: "Choosing the option with the most punctuation because it looks academic.",
    story: [
      ["Noon, everywhere", "Before the 1880s, most towns kept their own local time, set by the sun. Noon in one town came minutes before or after noon in the next."],
      ["1884: one line for the world", "At a conference in Washington, D.C., delegates chose the meridian through Greenwich as the starting line for longitude."],
      ["Where one day becomes the next", "On the far side of the globe runs the International Date Line. A line decides what day it is; a punctuation mark decides where one sentence ends."]
    ],
    bridge: ["Same skill, other exam", "IELTS Writing rewards complex sentences, but only accurate ones. Grammatical Range and Accuracy checks both the variety of structures and the boundaries between clauses."],
    ex: [
      { exam: "SAT", label: "Boundaries", chk: 2,
        text: "Time zones are roughly fifteen degrees of longitude ______ borders often bend to follow national boundaries.",
        stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
        opts: ["wide, their", "wide; their", "wide their", "wide, and, their"], key: 1,
        steps: ["Find the two clauses: “Time zones are … wide” and “their borders often bend…”.", "Both are complete sentences, so they need a full stop, a semicolon, or a comma with a conjunction.", "Only the semicolon joins them correctly."],
        check: "Read each half aloud on its own. Each one stands alone, so a semicolon is allowed.",
        why: ["Comma splice: two sentences joined by a comma alone.", "Correct: a semicolon joins two complete sentences.", "Run-on: no punctuation at all between two sentences.", "The comma after “and” cuts the conjunction off from its clause."] },
      { exam: "IELTS", label: "Writing: a complex sentence", chk: 2,
        text: "Idea 1: China spans about five time zones of longitude. Idea 2: It uses a single official time.",
        stem: "Which sentence joins the two ideas accurately?",
        opts: ["China spans about five time zones of longitude, it uses a single official time.", "Although China spans about five time zones of longitude. It uses a single official time.", "Although China spans about five time zones of longitude, it uses a single official time.", "China spans, about five time zones of longitude although it uses a single official time."], key: 2,
        steps: ["The ideas contrast: wide in space, one time. A contrast word such as although fits.", "Although makes the first clause dependent, so it needs a main clause after a comma.", "Check each option for a complete main clause and correct commas."],
        check: "Remove the although-clause: “it uses a single official time” still stands alone.",
        why: ["Comma splice: two sentences joined by a comma alone.", "Fragment: the although-clause is cut off by a full stop.", "Correct: dependent clause, comma, main clause.", "The comma splits the verb from its object, and the clauses are not separated."] }
    ]
  },

  C03: {
    rules: [
      ["Find the real subject.", "Cross out the phrases between the subject and the verb. In “the clocks in the town hall”, the verb agrees with clocks, not hall."],
      ["Let the dates choose the tense.", "Time words in the text (in 1840, by then, today) fix the tense of the verb."],
      ["its, it's, their.", "its = belonging to it; it's = it is; their = belonging to them. Possessive pronouns never take an apostrophe."]
    ],
    mistake: "Matching the verb to the nearest noun instead of to its subject.",
    story: [
      ["A minute here, a minute there", "In the 1830s each British town kept its own time by the sun. Bristol's clocks ran about ten minutes behind London's."],
      ["Trains need one clock", "From 1840 the Great Western Railway kept London time at its stations. A timetable works only if everyone reads the same hour."],
      ["One country, one time", "Over the following decades, towns followed. Today's rule: a sentence, like a timetable, works only when every part agrees."]
    ],
    bridge: ["Same skill, other exam", "IELTS Grammatical Range and Accuracy counts errors. A complex sentence with a wrong verb form can cost more than a simple sentence that is correct."],
    ex: [
      { exam: "SAT", label: "Form, Structure, and Sense", chk: 2,
        text: "After 1840, the station clocks on the line between London and Bristol ______ all set to the same time.",
        stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
        opts: ["was", "were", "is", "has been"], key: 1,
        steps: ["Find the subject: the station clocks (on the line between London and Bristol is a description).", "Clocks is plural, so the verb is plural.", "“After 1840” places the action in the past: were."],
        check: "Read it without the description: “the station clocks were all set to the same time.”",
        why: ["Singular: agrees with line or Bristol, not with clocks.", "Correct: plural and past.", "Singular and present: wrong number and wrong tense.", "Singular, and present perfect does not fit a past date."] },
      { exam: "IELTS", label: "Writing: accuracy", chk: 2,
        stem: "Which sentence is accurate?",
        opts: ["Every town have its own time.", "Every town had it's own time.", "Every town had its own time.", "Every towns had their own time."], key: 2,
        steps: ["Every takes a singular noun and a singular verb: every town had.", "The possessive of it is its, with no apostrophe.", "Check each option for all three: noun, verb, pronoun."],
        check: "Replace its with “belonging to it”: the sentence still makes sense.",
        why: ["Have does not agree with every town.", "It's means it is.", "Correct.", "Every needs a singular noun: town, not towns."] }
    ]
  },

  C04: {
    rules: [
      ["Name the relationship before you look.", "Same direction (also, likewise), contrast (however, by contrast), cause and effect (therefore, consequently), example (for instance). All the choices are real transitions; only the relationship decides."],
      ["Read both sides of the gap.", "A transition links two ideas, so you need the sentence before the blank as well as the one with it."],
      ["Nevertheless means “despite what was just said”.", "It signals a result you would not expect after the first sentence."]
    ],
    mistake: "Choosing however whenever the second sentence sounds different, even when it is a result.",
    story: [
      ["Lost at sea", "Sailors could find their latitude from the sun. East–west position, longitude, needed something else: a clock that kept time at sea."],
      ["1714: a prize", "The British Parliament offered a reward of up to £20,000 for a practical way of finding longitude at sea."],
      ["A carpenter's clock", "John Harrison spent decades building timekeepers that kept time on a rolling ship. Today's skill: the words that keep ideas in order."]
    ],
    bridge: ["Same skill, other exam", "IELTS Coherence and Cohesion: examiners look at how ideas connect. Too few links, the wrong links, or a link at the start of every sentence all lower the score."],
    ex: [
      { exam: "SAT", label: "Transitions", chk: 2,
        text: "Metal expands in heat and contracts in cold. ______ a clock's balance changes size as the temperature changes, and the clock's rate changes with it.",
        stem: "Which choice completes the text with the most logical transition?",
        opts: ["However,", "Consequently,", "For example,", "Likewise,"], key: 1,
        steps: ["Name the relationship: the first sentence is a cause (metal changes size), the second is its effect (the balance changes size).", "Cause and effect: therefore, consequently, as a result.", "Only consequently shows that relationship."],
        check: "Put “because of this” in the gap: the text still makes sense.",
        why: ["Contrast: nothing in the second sentence goes against the first.", "Correct: an effect of the first sentence.", "The second sentence is not an example of the first; it is a result.", "Likewise needs two similar cases."] },
      { exam: "IELTS", label: "Writing: cohesion", chk: 2,
        text: "Online maps are always up to date. ______ they depend on a battery and a signal.",
        stem: "Which linking word fits best?",
        opts: ["Therefore,", "However,", "For instance,", "Similarly,"], key: 1,
        steps: ["Sentence 1 is an advantage; sentence 2 is a limitation.", "Advantage then limitation: contrast.", "However marks the contrast."],
        check: "Swap in “but” and join the sentences: the meaning holds.",
        why: ["The limitation does not follow from the advantage.", "Correct: a contrast.", "Sentence 2 is not an example of sentence 1.", "The two sentences are not similar points."] }
    ]
  },

  C05: {
    rules: [
      ["Read the goal first, then the notes.", "Every choice is true. Only one does the job the question names."],
      ["Turn the goal into a shape.", "Explain why → a reason (because…). Contrast → two sides. Emphasize a size → a number or a scale."],
      ["Relevant beats interesting.", "Ignore the most striking note if the goal does not need it."]
    ],
    mistake: "Picking the choice that uses the most notes.",
    story: [
      ["Counting heads", "For most of history, rulers guessed how many people they had. A census replaces the guess with a count."],
      ["1890: counting by machine", "For the US census of 1890, Herman Hollerith's machines read holes punched in cards: each card a person, each hole a fact."],
      ["A country in a table", "A census turns millions of lives into rows and columns. Today's skill: choosing, from many true facts, the ones your goal needs."]
    ],
    bridge: ["Same skill, other exam", "IELTS Writing Task 1 opens with an overview: the main trend and the most striking change. No explanations and no list of every figure. Selecting is the skill."],
    ex: [
      { exam: "SAT", label: "Rhetorical Synthesis", chk: 2,
        text: "Notes on the US census:\n• First census: 1790.\n• The Constitution requires a census every ten years.\n• The 1790 count was carried out by US marshals.\n• Census results are used to divide seats in the House of Representatives among the states.",
        stem: "Which choice uses the notes to explain why the US census is conducted?",
        opts: ["The first US census, in 1790, was carried out by US marshals.", "The US census, required every ten years by the Constitution, is used to divide seats in the House of Representatives among the states.", "The United States held its first census in 1790.", "The US Constitution requires a census every ten years."], key: 1,
        steps: ["Goal: explain the purpose. Shape: what the census is for.", "Find the note about use: dividing seats among the states.", "Only one choice contains it."],
        check: "Ask “what is it for?” of each choice. Only B answers.",
        why: ["Who counted, not why.", "Correct: states the purpose.", "When, not why.", "How often, not why."] },
      { exam: "IELTS", label: "Task 1: overview", chk: 2,
        text: "Bicycle trips per day in a city (fictional data): weekdays 4,000 in 2010 and 9,000 in 2020; weekends 6,000 in 2010 and 7,000 in 2020.",
        stem: "Which sentence is the best overview?",
        opts: ["Overall, bicycle use rose, and weekday trips grew much more than weekend trips.", "Weekend trips were 6,000 in 2010.", "Overall, people cycled more because new lanes were built.", "Overall, weekend trips grew faster than weekday trips."], key: 0,
        steps: ["Main trend: both figures rose.", "Most striking change: weekdays more than doubled; weekends rose a little.", "An overview names both and adds no reasons."],
        check: "No numbers, no causes, and it is still true of the whole table.",
        why: ["Correct.", "A single detail, not an overview.", "Adds a cause the data does not show.", "False: weekdays grew by 5,000, weekends by 1,000."] }
    ]
  },

  C06: {
    rules: [
      ["Find the claim, then the exact rows and columns.", "Every choice may quote the table; only one supports this claim."],
      ["A comparison needs both sides.", "One number alone cannot show a difference."],
      ["Check the label.", "Before or after, per house or in total, percent or count. Most traps swap a label, not a number."]
    ],
    mistake: "Choosing a true number that answers a different question.",
    story: [
      ["Soho, 1854", "Cholera killed hundreds of people around Broad Street within days. Most doctors blamed foul air."],
      ["Marks on a map", "John Snow drew a short bar for each death. The bars gathered around one public water pump."],
      ["Numbers as an argument", "Snow then compared homes served by two water companies. A table, read carefully, became evidence. Today's skill: making numbers prove a claim."]
    ],
    bridge: ["Same skill, other exam", "IELTS Task 1 is built on comparisons: higher than, twice as many as, roughly eight times. Every comparison must match the data exactly."],
    ex: [
      { exam: "SAT", label: "Command of Evidence: numbers", chk: 2,
        text: "Visits per month to two library branches (fictional data): Branch P, 2,000 in 2019 and 3,000 in 2023; Branch Q, 2,500 in 2019 and 2,400 in 2023. A librarian claims that Branch P's visits grew while Branch Q's fell slightly.",
        stem: "Which choice most effectively uses the data to support the claim?",
        opts: ["Branch P had 3,000 visits a month in 2023.", "Branch P rose from 2,000 to 3,000 visits a month, while Branch Q fell from 2,500 to 2,400.", "Branch Q had more visits than Branch P in 2019.", "Both branches had more than 2,000 visits a month in 2023."], key: 1,
        steps: ["The claim has two parts: P grew, Q fell slightly.", "Each part needs a before and an after.", "Only one choice gives both branches over time."],
        check: "Cover the claim and read the choice: you can rebuild the claim from it.",
        why: ["One number for one branch: no change shown.", "Correct: both branches, both years.", "True, but about 2019 only.", "True, but it shows no change."] },
      { exam: "IELTS", label: "Task 1: comparison", chk: 2,
        text: "Trips into a city centre on one day (fictional data): car 8,000; bus 2,000.",
        stem: "Which sentence is accurate?",
        opts: ["Car trips were four times as many as bus trips.", "Car trips were twice as many as bus trips.", "Bus trips were higher than car trips.", "Car trips were more higher than bus trips."], key: 0,
        steps: ["8,000 ÷ 2,000 = 4.", "Four times as many matches the data.", "Check the grammar of each comparison too."],
        check: "Reverse it: bus trips were a quarter of car trips. Both directions agree.",
        why: ["Correct.", "The ratio is 4, not 2.", "The direction is wrong.", "“More higher” is a double comparative."] }
    ]
  },

  C07: {
    rules: [
      ["The main idea covers the whole text.", "A detail covers one sentence. Wrong choices are often true details."],
      ["Find the claim the other sentences support.", "It is often the first or the last sentence, but not always."],
      ["Too broad and too narrow are both wrong.", "The answer must match the text's scope."]
    ],
    mistake: "Choosing the most specific true statement.",
    story: [
      ["Scutari, 1854", "Florence Nightingale arrived at the British army hospital at Scutari in November 1854."],
      ["The real enemy", "The records showed that far more soldiers died of preventable disease than of wounds."],
      ["One picture", "In 1858 she published a diagram of circles divided into wedges, one for each month. One picture carried the main idea of a whole report."]
    ],
    bridge: ["Same skill, other exam", "IELTS Reading asks you to match headings to paragraphs. A heading is a main idea: it fits the whole paragraph, not one line of it."],
    ex: [
      { exam: "SAT", label: "Central Ideas and Details", chk: 2,
        text: "Before Nightingale's work, hospitals often kept incomplete records, and different hospitals counted deaths in different ways. Nightingale argued that without uniform records no one could tell which hospitals were safest. She proposed standard forms for recording patients and their outcomes.",
        stem: "Which choice best states the main idea of the text?",
        opts: ["Some hospitals kept incomplete records.", "Nightingale argued that hospitals needed uniform records so that their safety could be compared.", "Nightingale designed many diagrams during her career.", "Hospitals in the nineteenth century were dangerous places."], key: 1,
        steps: ["Ask what every sentence is about: records, and why they must be uniform.", "Sentence 2 states the claim; sentences 1 and 3 support it.", "Choose the option that restates sentence 2's claim."],
        check: "Does each sentence of the text support the choice? Yes for B.",
        why: ["A detail from sentence 1 only.", "Correct: the claim the whole text supports.", "Not in the text.", "Too broad; the text is about records."] },
      { exam: "IELTS", label: "Reading: choose a heading", chk: 2,
        text: "The wedges of Nightingale's diagram were coloured: blue for deaths from preventable disease, red for deaths from wounds, black for other causes. In most months the blue areas were far larger than the rest.",
        stem: "Which heading best fits the paragraph?",
        opts: ["A visit to the hospital", "Colours that told the story", "Why Nightingale left nursing", "The cost of the war in money"], key: 1,
        steps: ["What is the whole paragraph about? The colours and what they showed.", "Look for the heading that covers both sentences.", "Reject headings about topics the paragraph does not mention."],
        check: "Read the heading, then the paragraph: nothing in it falls outside the heading.",
        why: ["No visit is described.", "Correct.", "Not mentioned.", "Money is not mentioned."] }
    ]
  },

  C08: {
    rules: [
      ["Say what each part does, not what it says.", "Purpose questions are about actions: introduces, illustrates, challenges, concedes, explains. Name the job of the sentence with one verb before you read the choices."],
      ["Map the whole text, in order.", "Write two or three words for each sentence: claim, example, objection, answer. The structure answer must match the whole map, step by step."],
      ["Every part of the choice must be true.", "A choice that is half right is wrong. Check both halves, especially the second verb."]
    ],
    mistake: "Choosing a choice that names the topic of the text instead of what the text does.",
    story: [
      ["1839: an inquiry", "Edwin Chadwick, a lawyer who helped run the system of poor relief, was asked to investigate the living conditions of working people in Britain."],
      ["Scenes, then numbers", "His 1842 report brought together testimony, mortality tables and an argument about the cost of doing nothing. We can read them in that order to see how each kind of evidence works."],
      ["Last of all, the proposals", "In this reading, the proposals come after the evidence for them. Order is part of the message."]
    ],
    bridge: ["Same skill, other exam", "IELTS Reading asks which paragraph contains a piece of information, so you need to know the job of each paragraph. In Writing Task 2, a body paragraph has its own order: point, explanation, example, and often an answer to an objection."],
    ex: [
      { exam: "SAT", label: "Text Structure and Purpose", chk: 2,
        text: "In a discussion of a fictional report on poor housing, one reader credits its success to the evidence alone. Another points out that earlier reports had included the same evidence without attracting attention. She suggests that the order in which the material appears is also worth studying.",
        stem: "Which choice best describes the function of the second sentence in the overall structure of the text?",
        opts: ["It gives an example that supports the view in the first sentence.", "It raises a point that challenges the view in the first sentence.", "It states the main conclusion of Chadwick's report.", "It explains why the report was published."], key: 1,
        steps: ["Map the text: 1 = a view (facts alone), 2 = similar facts had little effect before, 3 = another explanation (order).", "Sentence 2 makes the first view less likely: if facts alone were enough, the earlier facts would have worked too.", "Choose the option whose verb is “challenges”."],
        check: "Put “However,” in front of sentence 2: the text still reads well, so the sentence pushes against sentence 1.",
        why: ["It weakens the first view instead of supporting it.", "Correct: earlier facts had little effect, so facts alone may not explain the report's success.", "The text does not state the report's conclusion.", "Publication is not discussed."] },
      { exam: "IELTS", label: "Reading: matching information", chk: 2,
        text: "A  Chadwick collected letters from doctors in many towns.\nB  His tables compared the ages at which rich and poor people died.\nC  Chadwick proposed better drains and supplies of clean water.",
        stem: "Which paragraph contains a comparison between two groups of people?",
        opts: ["the paragraph about doctors' letters", "the paragraph about the tables", "the paragraph about the proposals", "none of the paragraphs"], key: 1,
        steps: ["Turn the question into what you are looking for: two groups set side by side.", "Scan each paragraph for two groups: A has one group (doctors), C has none.", "B sets rich and poor side by side: that is the comparison."],
        check: "Point to the exact words that do the job: “rich and poor”.",
        why: ["Paragraph A: doctors are one group; nothing is compared.", "Correct: paragraph B compares rich and poor people.", "Paragraph C: proposals, not a comparison of people.", "Paragraph B does compare two groups."] }
    ]
  },

  C09: {
    rules: [
      [ 'List what was measured.', 'Name the place, time and group that the observation covers.' ],
      [ 'Find what the record omits.', 'A gap and a low result are different pieces of information.' ],
      [
        'Keep your claim within the evidence.',
        'Check that no part of the answer needs an extra assumption.'
      ]
    ],
    mistake: 'Treating a missing reading as a low reading.',
    story: [
      [
        'A neat notebook',
        'A water-level log can look complete at a glance. Check which mornings are absent before you compare two places.'
      ],
      [
        'A counterweight and a cord',
        'The model gauge turns the height of water into a mark on a scale. A jam in the mechanism can leave the mark still while the water moves.'
      ],
      [
        'A decision with limits',
        'The evidence can justify a narrower conclusion today and point to a better observation tomorrow.'
      ]
    ],
    bridge: [
      'Name the missing link',
      'SAT asks which inference follows. IELTS can ask whether a claim is present at all. In both, make the evidence carry the answer.'
    ],
    ex: [
      {
        exam: 'SAT',
        label: 'Inferences',
        text: 'A volunteer counted people at a market on dry days. On wet days the counting station closed, although the market remained open. The numbers in the notebook therefore cannot show whether ______',
        stem: 'Which choice most logically completes the text?',
        opts: [
          'the market attracted fewer people in wet weather.',
          'the volunteer took notes on dry days.',
          'the market remained open on wet days.',
          'the counting station closed on wet days.'
        ],
        key: 0,
        steps: [
          'Locate what the volunteer counted: dry days.',
          'Circle the missing comparison group: wet days.',
          'Test which answer needs the missing group.'
        ],
        check: 'Point to either a wet-day count or a reason it is unavailable.',
        why: [
          'Correct: both weather groups are needed.',
          'Clearly stated.',
          'Clearly stated.',
          'Clearly stated.'
        ],
        chk: 2
      },
      {
        exam: 'IELTS',
        label: 'True / False / Not Given',
        text: 'The north gate was inspected each morning in April. The log records only morning inspections and lists the time of each visit.',
        stem: 'The water was usually higher in the afternoon than in the morning.',
        tf: true,
        key: 'NG',
        steps: [
          'Spot the comparison: morning against afternoon.',
          'The recorded visits took place in the morning.',
          'The passage neither confirms nor rules out an afternoon rise.'
        ],
        check: 'Test the complete comparison rather than the word “morning”.',
        why: [
          'No afternoon observation supports it.',
          'The opposite comparison is also unsupported.',
          'Correct: no afternoon figures are provided.'
        ],
        chk: 2
      }
    ]
  },

  C10: {
    rules: [
      [ 'Name the precise claim.', 'Look for what changes and for the outcome the writer expects.' ],
      [ 'Predict a useful observation.', 'Choose a comparison that isolates the relevant difference.' ],
      [ 'Test the competing account.', 'Ask whether the finding would fit both explanations equally well.' ]
    ],
    mistake: 'Choosing a true detail that never tests the claim.',
    story: [
      [
        'Two clinics',
        'The clinics in Vienna shared an institution, but their staff followed different routines.'
      ],
      [
        'A practical test',
        'Semmelweis changed a routine in the first clinic and compared the records before and afterwards.'
      ],
      [
        'What survives scrutiny',
        'A change in the predicted direction supported a practical decision. Other investigators could still test the wider explanation.'
      ]
    ],
    bridge: [
      'From evidence to a paragraph',
      'A Task 2 example earns its place when the next sentence can explain why it supports the point.'
    ],
    ex: [
      {
        exam: 'SAT',
        label: 'Command of Evidence',
        text: 'A supervisor claims that a second practice run improves the accuracy of staff entering room numbers.',
        stem: 'Which finding, if true, would most directly support the claim?',
        opts: [
          'The practice manual had a blue cover.',
          'Staff who did the extra run entered more correct room numbers in the same test.',
          'The test included four kinds of patient record.',
          'Most staff had already worked at the clinic.'
        ],
        key: 1,
        steps: [
          'Claim: an extra run improves accuracy.',
          'Look for an outcome that measures correct entries.',
          'Choose a comparison on the same test.'
        ],
        check: 'Is the evidence about the outcome named in the claim?',
        why: [
          'Cover colour is irrelevant.',
          'Correct: the comparison measures accuracy.',
          'A fact about the test, with no result.',
          'Experience alone provides no comparison.'
        ],
        chk: 2
      },
      {
        exam: 'IELTS',
        label: 'Task 2 support',
        text: 'Point: practising on a small scale can reveal problems before a change reaches many users.',
        stem: 'Which example most directly supports the point?',
        opts: [
          'A clinic tested signs at one entrance and discovered that a door hid a sign when it opened.',
          'A clinic bought signs from a company that was founded decades ago.',
          'One visitor liked the lettering on the old sign.',
          'A manager wants to paint every entrance the same colour.'
        ],
        key: 0,
        steps: [
          'Look for a trial, a problem and a link between the two.',
          'The entrance test reveals an obstruction.',
          'The signage can be fixed before being installed elsewhere.'
        ],
        check: 'Explain the link in a separate sentence.',
        why: [
          'Correct: the trial uncovered a fixable problem.',
          'No trial or discovery.',
          'Preference alone cannot support the point.',
          'A plan provides no result.'
        ],
        chk: 2
      }
    ]
  },

  C11: {
    rules: [
      [
        'Summarise each view independently.',
        'Write what each author supports and what each author qualifies.'
      ],
      [ 'Find the point of contact.', 'Compare their responses to the same claim.' ],
      [ 'Preserve the scope.', 'Agreement with a goal does not settle the method or the date.' ]
    ],
    mistake: 'Turning a difference about timing into a difference about the entire proposal.',
    story: [
      [
        'Two marks on a ruler',
        'A shared reference helps a buyer compare what each seller means by a length.'
      ],
      [
        'One date or a gradual change',
        'Buyers may value instant comparison. Traders also have to interpret orders already on the books.'
      ],
      [
        'A point of agreement',
        'A good response can preserve the shared goal and identify the exact point of disagreement.'
      ]
    ],
    bridge: [
      'Compare views in a Task 2 introduction',
      'Restate the common topic, name both positions, then say where you stand. Save the detailed reasons for the body paragraphs.'
    ],
    ex: [
      {
        exam: 'SAT',
        label: 'Cross-Text Connections',
        text: 'Text 1\n' +
          'Bus stops should use one style of route numbering so travellers can recognise it easily.\n' +
          '\n' +
          'Text 2\n' +
          'A single numbering style will help travellers. Existing stop names should remain on the notices while people learn the new numbers.',
        stem: 'On which point would both authors agree?',
        opts: [
          'Stop names should disappear immediately.',
          'Travellers already know every route.',
          'Bus stops should use a common numbering style.',
          'Each stop needs a distinct numbering format.'
        ],
        key: 2,
        steps: [
          'Text 1 supports a shared numbering style.',
          'Text 2 supports the style and adds a temporary aid.',
          'Choose the common goal.'
        ],
        check: 'Both texts support the answer without needing the other’s qualification.',
        why: [
          'Text 2 wants names to stay for now.',
          'No such claim.',
          'Correct: both support the shared style.',
          'This conflicts with the shared style.'
        ],
        chk: 2
      },
      {
        exam: 'IELTS',
        label: 'Task 2 opening',
        text: 'Some people want one common format for public timetables. Others want each operator to keep its usual format.',
        stem: 'Which opening states both views and a clear position?',
        opts: [
          'Public timetables are an important topic today.',
          'Local operators deserve attention for many reasons.',
          'Most timetables use numbers and names.',
          'Some favour a shared design, while others value familiar local formats. I favour a shared design with clear local labels.'
        ],
        key: 3,
        steps: [
          'Name both positions.',
          'Check whether the writer’s choice is explicit.',
          'Look for a clear link to the format issue.'
        ],
        check: 'Underline where the writer chooses a view.',
        why: [
          'No views or position.',
          'Only gestures towards one side.',
          'Description without a position.',
          'Correct: both views and a clear choice.'
        ],
        chk: 2
      }
    ]
  },

  C12: {
    rules: [
      ["Before the audio, decide the answer type.", "A place, a direction, a number or a time. The words around the gap tell you which."],
      ["Keep track of where you stand.", "Left and right count from the direction of travel, not from the page."],
      ["Listen for turns.", "Instead, but now, used to be. The first thing you hear is often the trap."]
    ],
    mistake: "Writing the first place you hear.",
    story: [
      ["Back to the map", "In lesson 1, a map left things out so that you could read it. Now the map is gone; you only hear it."],
      ["A voice as a map", "A guide's directions are a map in sound: landmarks, junctions, left and right."],
      ["Predict, then listen", "In IELTS Listening each recording plays once. You win by knowing, before it starts, what kind of answer you need."]
    ],
    bridge: ["Same skill, other exam", "Like Words in Context, Listening rarely uses the words of the question. You listen for the meaning, not for an echo."],
    ex: [
      { exam: "IELTS", label: "Listening: the turn", chk: 2,
        text: "You hear: “The café used to be next to the gym, but it has moved to the ground floor of the library.”",
        stem: "Where is the café now?",
        opts: ["next to the gym", "in the library", "opposite the gym", "on the top floor"], key: 1,
        steps: ["“Used to be” marks the old place: the trap.", "“But it has moved to” marks the new place.", "Ground floor of the library = in the library."],
        check: "Which place comes after the turn? The library.",
        why: ["The old place, before “used to be”.", "Correct.", "Not said.", "The speaker said the ground floor."] },
      { exam: "IELTS", label: "Listening: answer type", chk: 2,
        text: "Complete the note before the audio starts: “The tour of the campus starts at ______ a.m.”",
        stem: "What kind of answer should you listen for?",
        opts: ["a name", "a time", "a place", "a direction"], key: 1,
        steps: ["Look at the words around the gap: starts at … a.m.", "“a.m.” comes after a clock time.", "Listen for a time."],
        check: "Try each type in the gap: only a time is grammatical before a.m.",
        why: ["A name does not go before a.m.", "Correct.", "“starts at the library a.m.” is not possible.", "A direction does not fit either."] }
    ]
  },

  C13: {
    rules: [
      [
        'Predict the kind of word.',
        'A device, a difference and a time reference are different kinds of answer.'
      ],
      [ 'Use signposts to locate the answer.', '“Finally” can move the lecture to a new question.' ],
      [
        'Keep listening after a familiar word.',
        'An explanation or correction may follow the word you expected.'
      ]
    ],
    mistake: 'Writing the first familiar term and missing what the speaker actually means.',
    story: [
      [ 'One place', 'A shadow can help an observer identify local noon.' ],
      [ 'One network', 'Regular ticking and agreement with another clock solve different problems.' ],
      [ 'A useful report', 'The last successful comparison tells a reader how recent the evidence is.' ]
    ],
    bridge: [
      'From signposts to a summary',
      'Use the same turns to decide which claims to include in a short written summary.'
    ],
    ex: [
      {
        exam: 'IELTS',
        label: 'Listening · locating the correction',
        text: 'The controller says: “I wrote drift in the log. Hang on, the difference never grew. It was a fixed error in setting the clock.”',
        stem: 'What cause does the controller finally give?',
        opts: [ 'Drift.', 'A failure to keep a log.', 'A fixed setting error.', 'A faster signal.' ],
        key: 2,
        steps: [ 'Hear the initial guess.', 'Notice “Hang on”.', 'Choose the explanation that comes after it.' ],
        check: 'Repeat the final cause in three or four words.',
        why: [
          'The controller withdraws this.',
          'A log exists.',
          'Correct: this is the final account.',
          'Signal speed is not discussed.'
        ],
        chk: 2
      },
      {
        exam: 'IELTS',
        label: 'Listening · organisation',
        text: '“We have covered how the signal moves. Another question is how to tell when the local display last matched the reference.”',
        stem: 'What change of topic does the speaker signal?',
        opts: [
          'From signal delivery to checking agreement.',
          'From clocks to a passenger survey.',
          'From who sent the signal to how to create the network.',
          'From checking agreement to the cost of replacing a platform.'
        ],
        key: 0,
        steps: [
          'Mark the completed topic: signal movement.',
          'Mark the new question: when the display matched.',
          'Choose the option that preserves both sides of the turn.'
        ],
        check: 'Could the answer explain both sentences?',
        why: [
          'Correct: it captures the direction of the turn.',
          'No survey.',
          'No construction question.',
          'Both topics are misstated.'
        ],
        chk: 2
      }
    ]
  },

  C14: {
    rules: [
      [ 'Give the important word room.', 'Stress the detail that could change the listener’s decision.' ],
      [ 'Pause at a thought boundary.', 'Separate an instruction from the clue that helps confirm it.' ],
      [ 'Repair meaning when needed.', 'Restate the doubtful part with one specific detail.' ]
    ],
    mistake: 'Trying to sound fluent by rushing through every phrase at the same pace.',
    story: [
      [ 'A route in speech', 'A visitor can only act on what they understand as they hear it.' ],
      [ 'One word changes the turn', 'If both paths go left, “second” carries the decision.' ],
      [
        'From detail to argument',
        'In a discussion, explain why directions that work for regular users may confuse somebody new.'
      ]
    ],
    bridge: [
      'Extend the same skill to Part 3',
      'A short answer can give a personal detail. A discussion also needs a reason that applies beyond that example.'
    ],
    ex: [
      {
        exam: 'IELTS',
        label: 'Speaking · intelligibility',
        text: 'A visitor knows to turn at a bridge but there are two bridges. One is for cars and one is for people on foot.',
        stem: 'Which reply clearly identifies the crossing?',
        opts: [
          'Use the bridge near the RIVER.',
          'Use the bridge NOW.',
          'Use the FOOTbridge.',
          'Use either BRIDGE.'
        ],
        key: 2,
        steps: [
          'Ask what the listener needs to distinguish.',
          'Identify the bridge for people on foot.',
          'Stress the word that supplies the distinction.'
        ],
        check: 'Could someone choose a bridge from the reply alone?',
        why: [
          'The river does not distinguish the bridges.',
          'Time does not identify a bridge.',
          'Correct: footbridge identifies the crossing.',
          'Leaves the decision open.'
        ],
        chk: 2
      },
      {
        exam: 'IELTS',
        label: 'Speaking · Part 3',
        text: 'Question: Why might one public sign be easy to understand and another confusing?',
        stem: 'Which answer offers a reason the speaker can develop?',
        opts: [
          'A clear sign shows the detail people need at the point where they must decide.',
          'My town has a sign.',
          'There are lots of different signs.',
          'I once walked past the wrong sign.'
        ],
        key: 0,
        steps: [
          'Find a reason, rather than an isolated observation.',
          'Look for a link to the moment of decision.',
          'Add a concrete example if asked to develop the answer.'
        ],
        check: 'Can you explain how the sign affects what a reader does next?',
        why: [
          'Correct: connects information with a decision.',
          'Only a location.',
          'Only a broad observation.',
          'Only a personal experience.'
        ],
        chk: 2
      }
    ]
  },

  C15: {
    rules: [
      [ 'Answer every part of the prompt.', 'Give each view a fair reason before making your judgment.' ],
      [
        'Develop the point with a specific consequence.',
        'Let an example show what changes for a real type of reader or passenger.'
      ],
      [
        'Keep your stance coherent.',
        'Make the conclusion apply the reasoning that the body has already established.'
      ]
    ],
    mistake: 'Naming both views in the opening and developing only one of them.',
    story: [
      [
        'The reader’s route',
        'A reader benefits from an opening that identifies both positions and the choice the essay will defend.'
      ],
      [
        'Two reasons given room',
        'A shared format helps comparison. A local format can make unusual instructions more visible.'
      ],
      [
        'A conclusion that weighs',
        'Decide which benefit should guide the rule and which exception deserves room.'
      ]
    ],
    bridge: [
      'Check the job of each sentence',
      'The same attention to purpose used in SAT helps a writer distinguish a claim, a reason and a specific example.'
    ],
    ex: [
      {
        exam: 'IELTS',
        label: 'Writing · Task Response',
        text: 'A writer says: “All operators should follow the same format. It is simpler.” The prompt also asks why operators might keep their own format.',
        stem: 'Which revision actually addresses the missing view?',
        opts: [
          'Add that buses are common in cities.',
          'Explain that some routes need unusually prominent information about where to board.',
          'Repeat that a shared format is simpler.',
          'Add a quotation about travel.'
        ],
        key: 1,
        steps: [
          'Find the view the draft omitted.',
          'Look for a reason an operator would want flexibility.',
          'Choose a concrete reason that can be developed.'
        ],
        check: 'The revision gives the second position a real purpose.',
        why: [
          'Unrelated background.',
          'Correct: a local condition can justify a different emphasis.',
          'Repeats the first position.',
          'Does not supply a reason.'
        ],
        chk: 2
      },
      {
        exam: 'IELTS',
        label: 'Writing · Coherence',
        text: 'A paragraph argues that transfers are easier when the same kind of information occupies the same place on each timetable.',
        stem: 'Which sentence most logically follows the point?',
        opts: [
          'Operators have different names.',
          'Some passengers prefer a quiet service.',
          'A transfer often uses two schedules, so a familiar layout can shorten the search for the next departure.',
          'The city might build another bridge.'
        ],
        key: 2,
        steps: [
          'Identify the paragraph’s claim about transfers.',
          'Look for why the layout matters in that moment.',
          'Choose a consequence the layout can affect.'
        ],
        check: 'Both sentences should deal with the same task for the passenger.',
        why: [
          'Does not explain the effect.',
          'Changes the topic to comfort.',
          'Correct: explains how the search becomes easier.',
          'Changes the topic to infrastructure.'
        ],
        chk: 2
      }
    ]
  },

  C16: {
    rules: [
      [
        'Identify the decision you need to make.',
        'A transition, a supported conclusion and a missing detail call for different checks.'
      ],
      [
        'Find the evidence that changes the decision.',
        'Mark the phrase, observation or spoken correction that distinguishes the options.'
      ],
      [ 'Write a repeatable check for one error.', 'Name the cue you will look for in a new item.' ]
    ],
    mistake: 'Writing “read more carefully” without naming the missed cue.',
    story: [
      [ 'The visitor’s map', 'A route guide can leave out rooms to make each choice of direction easier.' ],
      [
        'The designer’s map',
        'A trial records where people hesitate and what information was missing when they did.'
      ],
      [ 'Your map', 'Keep the actual choice, the cue you missed and one check you can use again.' ]
    ],
    bridge: [
      'Transfer the check',
      'A reader and a listener can both miss a correction or a limit. Choose the cue that would change the answer in each medium.'
    ],
    ex: [
      {
        exam: 'SAT',
        label: 'Inference and scope',
        text: 'Only visitors who entered through the courtyard tried the guide. None of the volunteers recorded what happened at the side entrance.',
        stem: 'Which conclusion is supported?',
        opts: [
          'The guide was tested from the courtyard.',
          'It works at every entrance.',
          'Visitors at the side entrance preferred it.',
          'The courtyard is the only entrance.'
        ],
        key: 0,
        steps: [
          'Locate where the observations were made.',
          'Separate the observed entrance from the other entrance.',
          'Choose the conclusion that keeps that scope.'
        ],
        check: 'Name the place that the text actually observes.',
        why: [
          'Correct: that is the trial’s scope.',
          'Generalises to untested places.',
          'No side-entrance result.',
          'The side entrance is mentioned.'
        ],
        chk: 2
      },
      {
        exam: 'IELTS',
        label: 'Listening · a revised decision',
        text: '“We had planned to meet at the lift. The lift area will be crowded, so wait by the information desk instead.”',
        stem: 'Where should the group meet?',
        opts: [ 'by the lift', 'in the courtyard', 'by the information desk', 'at the entrance gate' ],
        key: 2,
        steps: [
          'Keep track of the original suggestion.',
          'Listen for the change and its reason.',
          'Use the final confirmed location.'
        ],
        check: 'Point to the word that replaces the first plan.',
        why: [
          'Original plan only.',
          'Not mentioned.',
          'Correct: “instead” marks the final choice.',
          'Not mentioned.'
        ],
        chk: 2
      }
    ]
  }
};

/* ------------------------------------------------------------------
   Step 3 · Office hours. focus: what the SAT mistake analysis looks at; peer: a sample paragraph by an invented student
   with planted problems (the class practises peer feedback on it first, then swaps their own homework texts);
   live: prompts for live speaking practice. */
window.OFFICE = {
  C01: { focus: "Для каждой ошибки: какие слова в тексте доказывали ответ и почему они не сработали.",
    peer: { task: "Paraphrase: “The map conveys one kind of information clearly because it omits another.”",
      sample: "The map conveys one kind of information clearly, because it omits another kind. Maps is always wrong about distance.",
      issues: [["LR", "Слова почти не изменены: conveys, clearly, omits взяты из оригинала. Это копия, а не пересказ."], ["TR", "Добавлена мысль, которой нет в оригинале: «always wrong about distance»."], ["GRA", "«Maps is»: подлежащее во множественном числе, нужен are."]] },
    live: ["Part 1 · Do you prefer paper maps or maps on your phone? Why?", "Part 1 · Have you ever got lost in a new place? What happened?", "Part 3 · Why do you think some maps leave out real distances?"] },
  C02: { focus: "Для каждой ошибки: сколько полных предложений было в тексте и что их соединяло.",
    peer: { task: "Combine four short sentences about the date line.",
      sample: "The date line runs through the Pacific Ocean, it bends around some island groups. Because countries wanted their islands on one side. So that each nation shares one date.",
      issues: [["GRA", "Comma splice: два полных предложения соединены одной запятой."], ["GRA", "«Because countries wanted…» — обрывок без главного предложения."], ["CC", "«So that…» тоже оторвано от мысли, к которой относится. Связь между идеями потеряна."]] },
    live: ["Part 1 · What time do you usually get up on a weekday?", "Part 1 · Would you like to live in a country with several time zones?", "Part 3 · Is it better for a large country to use one time zone or several? Why?"] },
  C03: { focus: "Для каждой ошибки: где настоящее подлежащее и какое слово в тексте задаёт время.",
    peer: { task: "Correct your own paragraph about railway time.",
      sample: "In 1840 the railway company decide to use London time at every station. The clocks in each station was changed. Before that, every town have it's own time.",
      issues: [["GRA", "«decide»: 1840 — прошлое, нужен decided."], ["GRA", "«The clocks … was»: подлежащее clocks, нужен were."], ["GRA", "«every town have»: нужен had; «it's» = it is, нужен its."]] },
    live: ["Part 2 · Describe a time you were late for something important. Say when it was, why you were late, what happened and how you felt.", "Part 3 · Is being on time more important today than in the past?", "Part 3 · Should schools be strict about punctuality?"] },
  C04: { focus: "Для каждой ошибки: какое отношение между мыслями ты назвал(а) и какое было на самом деле.",
    peer: { task: "One paragraph, three links: why did some officials doubt Harrison's clock?",
      sample: "Harrison's clock was very accurate. However, the officials wanted more tests. However, they thought astronomy was better. Moreover, Harrison was old.",
      issues: [["CC", "However дважды подряд. Второе however неверно: это причина сомнений, нужен because или since."], ["TR", "«Moreover, Harrison was old» не отвечает на вопрос, почему чиновники сомневались."], ["CC", "Связка в начале каждого предложения: абзац звучит механически."]] },
    live: ["Part 1 · Have you learned any traditional skill from your family?", "Part 3 · Has technology made people less patient? Why or why not?", "Part 3 · Is it right to reward inventors with large prizes?"] },
  C05: { focus: "Для каждой ошибки: какой глагол был в цели вопроса и что он требовал от ответа.",
    peer: { task: "An overview of the Marsh End table.",
      sample: "In 2000 there were 3,000 children, 7,800 adults and 1,200 old people, and in 2020 there were 3,300 children, 9,300 adults and 3,000 old people, because many families moved to the town.",
      issues: [["TR", "Нет overview: перечислены все числа, главная тенденция не названа."], ["TR", "Добавлена причина, которой нет в данных: «because many families moved»."], ["LR", "«old people» звучит неформально: лучше «residents aged 65 and over»."]] },
    live: ["Part 2 · Describe how your town or neighbourhood has changed in recent years.", "Part 3 · Why do people move from villages to cities?", "Part 3 · Should governments collect information about their citizens?"] },
  C06: { focus: "Для каждой ошибки: какую строку и какой столбец ты взял(а) и что было подписано над ними.",
    peer: { task: "Two comparison sentences about Snow's table.",
      sample: "Southwark and Vauxhall had 315 deaths, it was more higher than Lambeth. The rest of London was 55.",
      issues: [["GRA", "Comma splice и «more higher» (двойная сравнительная степень)."], ["TR", "Нет единицы: 315 смертей на 10 000 домов, а не 315 смертей."], ["CC", "Второе предложение ничего не сравнивает: остальной Лондон не сопоставлен с компаниями."]] },
    live: ["Part 1 · Do you trust the numbers you see in the news?", "Part 3 · How can ordinary people check whether a statistic is reliable?", "Part 3 · Should governments always publish the data they collect?"] },
  C07: { focus: "Для каждой ошибки: был ли выбранный ответ деталью, слишком широкой мыслью или главной мыслью другого текста.",
    peer: { task: "A topic sentence for a paragraph about the hospital after the Sanitary Commission.",
      sample: "The sewers were cleaned out.",
      issues: [["TR", "Это деталь из абзаца, а не главная мысль: topic sentence должен покрывать весь абзац."], ["LR", "Нет слов, которые обобщают: conditions, sanitation, mortality."], ["CC", "Предложение не готовит читателя к выводу абзаца о смертности."]] },
    live: ["Part 2 · Describe a chart, picture or diagram that helped you understand something.", "Part 3 · Are pictures better than words for explaining ideas?", "Part 3 · Why do some people ignore facts that are clearly presented?"] },
  C08: { focus: "Для каждой ошибки: какое действие ты приписал(а) предложению или тексту (introduces, illustrates, challenges, concedes) и какое было на самом деле.",
    peer: { task: "One Task 2 body paragraph: governments should spend more on prevention.",
      sample: "Governments should spend more on prevention. For example, Chadwick wrote a report in 1842. Prevention is good because it is good for people. Some people say that it is expensive, I disagree with them.",
      issues: [["TR", "Пример ничего не доказывает: сказано только, что Чедвик написал доклад, а не что он показал о профилактике."], ["CC", "Порядок сломан: пример стоит раньше объяснения, а объяснение ходит по кругу («good because it is good»)."], ["GRA", "Comma splice: «…it is expensive, I disagree with them». К тому же возражение просто отвергнуто, ответа на него нет."]] },
    live: ["Part 2 · Describe a time when someone persuaded you to change your mind.", "Part 3 · Do facts or stories persuade people more effectively? Why?", "Part 3 · Should governments spend money on problems that have not happened yet?"] },
  C09: {
    focus: 'Для каждого неверного вывода назови замер, который есть, и отдельно тот замер, который понадобился бы для выбранного ответа.',
    peer: {
      task: 'Write a short paragraph about the limits of feedback collected inside a canal visitor centre.',
      sample: 'Everyone finds the canal centre easy to reach, because people inside the centre said so. The survey is useful. Therefore some users could not climb the stairs.',
      issues: [
        [
          'TR',
          'Ответ распространяет вывод на всех, хотя опросили только посетителей внутри. Пример должен показать, кого выборка могла пропустить.'
        ],
        [
          'CC',
          'Therefore обещает следствие, но отзывы посетителей внутри не доказывают, что кто-то не смог подняться. Свяжи предполагаемый пример с ограничением выборки.'
        ]
      ]
    },
    live: [
      'How could a council find out why some people never reach its visitor centre?',
      'When is an incomplete record still good enough to use?',
      'Describe a situation in which a large survey could miss an important group.'
    ]
  },

  C10: {
    focus: 'Сформулируй проверяемую часть утверждения. Для выбранного и верного ответа скажи, какой результат они измеряют и какой другой причине оставляют место.',
    peer: {
      task: 'Support the view that public services should test a change before adopting it everywhere.',
      sample: 'A trial is a good idea. One clinic tried new signs and had twelve windows. It was a trial. Therefore all clinics should buy these signs.',
      issues: [
        [
          'TR',
          'Количество окон ничего не показывает о том, что удалось узнать из проверки. Добавь наблюдение, которое изменило решение.'
        ],
        [
          'CC',
          'Therefore соединяет описание с выводом о всех учреждениях. Этот вывод требует отдельного аргумента.'
        ]
      ]
    },
    live: [
      'What evidence would help you decide whether a sign is easy to follow?',
      'When might a single successful trial justify a limited change?',
      'Why do people sometimes disagree about the cause of a result they both accept?'
    ]
  },

  C11: {
    focus: 'Перескажи позицию каждого автора. Затем назови ровно тот пункт, на который они отвечают по-разному.',
    peer: {
      task: 'Introduce an essay about a single switch date versus a gradual change to a shared measurement unit.',
      sample: 'There are two opinions about measuring. The first opinion is important. This issue has benefits, therefore I will discuss it.',
      issues: [
        [
          'TR',
          'Ни одна из двух позиций не названа, мнение автора отсутствует. Нужны конкретные варианты перехода.'
        ],
        [
          'CC',
          'Therefore не объясняет, почему одно следует из другого. Свяжи стороны общим вопросом о переходе.'
        ]
      ]
    },
    live: [
      'When should a local habit survive the introduction of a shared standard?',
      'Which information should stay on a public label during a transition?',
      'Do you think a single opening date helps buyers more than it costs sellers?'
    ]
  },

  C12: { focus: "Для каждой ошибки в Listening: прозвучал ли поворот (used to be, instead, but now) и где ты его пропустил(а).",
    peer: { task: "From notes to two sentences: the way to the library and the bus stop.",
      sample: "Library: turn left clock tower, second building right opposite lake. Bus stop moved behind library on Mill Road.",
      issues: [["GRA", "Это всё ещё заметки: нет подлежащего и сказуемого, пропущены артикли и предлоги (at the clock tower, on the right)."], ["TR", "Не сказано, где остановка была раньше, а это важная часть заметки."], ["CC", "Две мысли не связаны: нет ни связки, ни порядка."]] },
    live: ["Part 2 · Describe the way from your home to a place you often visit.", "Part 1 · Do you prefer asking for directions or using an app?", "Part 3 · How could your town be easier for visitors to find their way around?"] },

  C13: {
    focus: 'Назови, где прозвучал указатель нового пункта и в какой фразе нашёлся ответ. Отдельно отметь слово, которое могло прозвучать как ловушка.',
    peer: {
      task: 'Summarise why a rail network needs a reference and a record of checks.',
      sample: 'There is a good shadow. Moreover, it is two minutes. Therefore, the signal is perfect and a check is unnecessary.',
      issues: [
        [
          'TR',
          'Исчезло различие между общей настройкой и проверкой после настройки. Вывод о ненужности проверок противоречит лекции.'
        ],
        [
          'CC',
          'Связки заявляют причину и добавление, но предложения не поддерживают вывод. Собери ответ вокруг одной проблемы и одного ограничения.'
        ]
      ]
    },
    live: [
      'Explain why two reliable clocks can disagree.',
      'When would a driver care more about a shared time than a very precise clock?',
      'What information would you add to a report when the connection fails?'
    ]
  },

  C14: {
    focus: 'Назови, какое слово в ответе нужно сделать слышнее. Произнеси фразу двумя способами и попроси партнёра пересказать, какой смысл он услышал.',
    peer: {
      task: 'Explain what helped a listener understand your directions, then rewrite a phrase that needs improvement.',
      sample: 'My speaking was perfect. It was good and the word was good. Therefore I should speak at the same pace always.',
      issues: [
        [
          'TR',
          'Для саморазбора нужна точная фраза и один вариант правки. Общая оценка не показывает, что услышал слушатель.'
        ],
        [
          'LR',
          'Good и perfect звучат общо. Назови конкретное действие: stressed “second”, paused before the landmark.'
        ]
      ]
    },
    live: [
      'What is one direction you can give using only a landmark and a turn?',
      'How would you correct yourself if a listener started to follow the wrong route?',
      'What changes when you explain the same route to a first-time visitor?'
    ]
  },

  C15: {
    focus: 'В каждом абзаце обозначь позицию или довод, затем предложение, которое его развивает. Укажи, где вывод стал шире, чем аргументы.',
    peer: {
      task: 'Some people believe that all public transport operators should use one format for route information. Others think each operator should be free to use its own format. Discuss both views and give your own opinion.',
      sample: 'Operators should all use a template. Transport is very important to people, and there are buses and ferries. Moreover the format, it can be useful. I think every company should do what it wants.',
      issues: [
        [
          'TR',
          'Вторая позиция появляется лишь в конце. Нужен довод в её пользу и устойчивое мнение автора.'
        ],
        [
          'CC',
          'Перечень видов транспорта не развивает тезис о формате. Свяжи пример с задачей пассажира.'
        ],
        [
          'GRA',
          '“Moreover the format, it can be useful” дублирует подлежащее. После вводного слова поставь запятую и назови подлежащее один раз.'
        ]
      ]
    },
    live: [
      'When is uniform information more valuable than local flexibility?',
      'What example would make a case for letting operators keep a local section?',
      'How would you state a final position that respects both concerns?'
    ]
  },

  C16: {
    focus: 'Разбери две разные ошибки. Для каждой назови свой выбор, опорную фразу или сигнал и проверку для новой задачи.',
    peer: {
      task: 'Describe two errors and propose a repeatable check for each.',
      sample: 'I lost some marks because the text was difficult. I should work harder. The first answer was wrong, therefore I will choose a different option.',
      issues: [
        [ 'TR', 'Не названы ошибки, опорные слова и новая проверка. Нужны два конкретных случая.' ],
        [
          'CC',
          'Therefore связывает неверный ответ с произвольной заменой. Покажи, какой признак должен изменить решение.'
        ]
      ]
    },
    live: [
      'Which information on a map is worth keeping if a visitor only needs to make one turn?',
      'What listening signal helped you change an answer?',
      'Describe one check you can use again on a different passage.'
    ]
  }
};

/* ------------------------------------------------------------------
   Step 4 · Check-ins. D0 and K1 are parallel forms with the same blueprint:
   2 × Words in Context, 2 × Boundaries, 2 × Form, Structure, and Sense, 2 × Transitions, 3 × IELTS True / False / Not Given.
   Same skills, new texts: the change per skill between D0 and K1 is the measurable growth of Block A. */
window.LESSONS = window.LESSONS || {};

window.LESSONS.D0 = {
  id: "D0", checkin: true, title: "Diagnostic", thread: "Where you start.",
  intro: "Диагностика до первого урока. 11 вопросов: 8 в формате SAT и 3 в формате IELTS. Отвечай с первой попытки, без словаря. Результат по навыкам появится на странице «Прогресс» и станет точкой отсчёта. Это не прогноз балла.",
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Eight short texts",
      ru: "Один вопрос на каждый текст. Выбери лучший вариант.",
      items: [
        { kind: "mcq", chk: 2, skill: "WIC",
          text: "Early thermometers were not ______: two instruments placed side by side could give noticeably different readings.",
          stem: "Which choice completes the text with the most logical and precise word?",
          opts: ["portable", "reliable", "visible", "expensive"], key: 1,
          ru: "Два прибора рядом показывают разное: им нельзя доверять, значит они не reliable. Portable (переносной), visible и expensive не объясняют разные показания." },
        { kind: "mcq", chk: 2, skill: "WIC",
          text: "The Beaufort scale, devised in the early 1800s by the British naval officer Francis Beaufort, allowed sailors to estimate the strength of the wind by watching the sea and the sails rather than by using instruments.",
          stem: "As used in the text, what does the word “estimate” most nearly mean?",
          opts: ["record exactly", "reduce", "judge approximately", "doubt"], key: 2,
          ru: "Без приборов, на глаз: сила ветра оценивается приблизительно, judge approximately. «Record exactly» противоречит «rather than by using instruments». Reduce и doubt не подходят по смыслу." },
        { kind: "mcq", chk: 2, skill: "BND",
          text: "The Beaufort scale runs from 0 ______ of 12 describes hurricane-force winds.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["to 12, a force", "to 12 a force", "to 12; a force", "to 12: and a force"], key: 2,
          ru: "Две полные мысли: «The scale runs from 0 to 12» и «a force of 12 describes…». Их соединяет точка с запятой. Запятая одна — comma splice, без знака — run-on, двоеточие с and лишнее." },
        { kind: "mcq", chk: 2, skill: "BND",
          text: "Nineteenth-century weather stations recorded three basic ______ temperature, air pressure, and rainfall.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["measurements;", "measurements:", "measurements, and", "measurements. Including"], key: 1,
          ru: "Полное предложение, затем список: нужен двоеточие. Точка с запятой требует полного предложения после себя. «, and» и «. Including» ломают предложение." },
        { kind: "mcq", chk: 2, skill: "FSS",
          text: "The records kept by the lighthouse keeper ______ still used by historians of climate.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["is", "was", "are", "has been"], key: 2,
          ru: "Подлежащее records (множественное число), «kept by the lighthouse keeper» — описание. Still used = сейчас. Нужен are. Is, was и has been — единственное число." },
        { kind: "mcq", chk: 2, skill: "FSS",
          text: "In the 1870s, each of the stations ______ its readings to a central office by telegraph.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["were sending", "sent", "have sent", "send"], key: 1,
          ru: "Подлежащее each (единственное число), время — 1870-е, прошлое: sent. Were sending и have sent — множественное число, send — настоящее время." },
        { kind: "mcq", chk: 2, skill: "TRN",
          text: "Falling air pressure often comes before a storm. ______ sailors watched their barometers closely.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["However,", "For example,", "Consequently,", "Similarly,"], key: 2,
          ru: "Первое предложение — причина, второе — следствие: поэтому моряки следили за барометром. Consequently. However даёт контраст, for example — пример, similarly — сходство." },
        { kind: "mcq", chk: 2, skill: "TRN",
          text: "Thermometers became far more accurate during the eighteenth century. Rain gauges, ______ remained simple open containers for much longer.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["therefore,", "by contrast,", "in addition,", "for instance,"], key: 1,
          ru: "Термометры улучшались, дождемеры оставались простыми: контраст, by contrast. Therefore — следствие, in addition — добавление, for instance — пример." }
      ] },
    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "True / False / Not Given",
      ru: "Прочитай текст. Отвечай только по тексту, а не по своим знаниям.",
      passageTitle: "The First Forecasts",
      passage: [
        "In 1854 Robert FitzRoy, a naval officer who had earlier commanded the ship HMS Beagle, was put in charge of a new British government department that collected weather information. Using reports sent by telegraph from stations along the coast, he began issuing storm warnings to ports in 1861.",
        "He also published daily predictions in a newspaper and called them “forecasts”. Not everyone trusted them; some critics claimed that the weather could not be predicted at all."
      ],
      items: [
        { kind: "tfng", chk: 2, skill: "R-TFNG", stem: "FitzRoy's storm warnings relied on reports sent by telegraph.", key: "T",
          ru: "TRUE. «Using reports sent by telegraph… he began issuing storm warnings». Relied on = using." },
        { kind: "tfng", chk: 2, skill: "R-TFNG", stem: "Everyone trusted FitzRoy's forecasts.", key: "F",
          ru: "FALSE. «Not everyone trusted them»." },
        { kind: "tfng", chk: 2, skill: "R-TFNG", stem: "FitzRoy invented the telegraph.", key: "NG",
          ru: "NOT GIVEN. Текст говорит, что FitzRoy пользовался телеграфом, но не говорит, кто его изобрёл. Даже если ты знаешь ответ из жизни, отвечать нужно по тексту." }
      ] }
  ]
};

window.LESSONS.K1 = {
  id: "K1", checkin: true, title: "Check-in A · The sentence", thread: "Where Block A has taken you.",
  intro: "Check-in после блока A (уроки C01–C04). Те же навыки, что в диагностике, новые тексты. 11 вопросов, отвечай с первой попытки. Результат на странице «Прогресс» сравнится с диагностикой по каждому навыку.",
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Eight short texts",
      ru: "Один вопрос на каждый текст. Выбери лучший вариант.",
      items: [
        { kind: "mcq", chk: 2, skill: "WIC",
          text: "The Julian calendar, introduced under Julius Caesar, treated the year as exactly 365.25 days long. The error was tiny, but over the centuries it ______: by the 1500s the calendar had drifted about ten days away from the seasons.",
          stem: "Which choice completes the text with the most logical and precise word?",
          opts: ["vanished", "reversed", "accumulated", "concealed"], key: 2,
          ru: "Маленькая ошибка за века выросла до десяти дней: она накапливалась, accumulated. Vanished и reversed противоречат «drifted about ten days». Concealed (скрыта) не объясняет рост." },
        { kind: "mcq", chk: 2, skill: "WIC",
          text: "The reform of 1582 was not adopted everywhere at once: Britain did not accept the new calendar until 1752, and Russia not until 1918.",
          stem: "As used in the text, what does the word “adopted” most nearly mean?",
          opts: ["taken up", "raised as one's own child", "argued against", "invented"], key: 0,
          ru: "Календарь не везде приняли сразу: adopted = accepted, taken up. «Raised as one's own child» — другое значение adopt (усыновить). Argued against и invented по смыслу не подходят." },
        { kind: "mcq", chk: 2, skill: "BND",
          text: "When Britain changed its calendar in 1752, eleven days were ______ 2 September was followed directly by 14 September.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["dropped,", "dropped:", "dropped", "dropped, and,"], key: 1,
          ru: "Первая часть — полное предложение, вторая объясняет, какие дни пропали. Объяснение после полного предложения вводит двоеточие. Одна запятая — comma splice, без знака — run-on, в «, and,» лишняя запятая после and." },
        { kind: "mcq", chk: 2, skill: "BND",
          text: "Russia switched to the Gregorian calendar in ______ by then, the gap between the two calendars had grown to thirteen days.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["1918,", "1918", "1918, which", "1918;"], key: 3,
          ru: "Два полных предложения: «Russia switched… in 1918» и «by then, the gap… had grown». Их соединяет точка с запятой. Одна запятая — comma splice, без знака — run-on. С which получается бессмыслица: which не может стоять перед «by then, the gap»." },
        { kind: "mcq", chk: 2, skill: "FSS",
          text: "The calendars used across the world today ______ different starting points for counting years.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["has", "have", "having", "to have"], key: 1,
          ru: "Подлежащее calendars (множественное число), «used across the world» — описание. Today = настоящее время: have. Has — единственное число, having и to have не дают сказуемого." },
        { kind: "mcq", chk: 2, skill: "FSS",
          text: "When the reform arrived, each country chose ______ own moment to make the change.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["it's", "their", "its", "its'"], key: 2,
          ru: "Each country — одна страна, значит its. It's = it is. Their — для множественного числа. Формы its' не существует." },
        { kind: "mcq", chk: 2, skill: "TRN",
          text: "The Gregorian calendar corrected most of the Julian error. ______ it is not perfect: it still drifts by about one day every few thousand years.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["Therefore,", "For instance,", "Even so,", "Likewise,"], key: 2,
          ru: "Исправил почти всё, и всё же не идеален: уступка, even so. Therefore — следствие, for instance — пример, likewise — сходство." },
        { kind: "mcq", chk: 2, skill: "TRN",
          text: "Most countries made the change in a single step. Sweden, ______ tried a gradual plan from 1700, dropping leap days one at a time, but soon abandoned it.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["consequently,", "by contrast,", "similarly,", "in other words,"], key: 1,
          ru: "Большинство сразу, Швеция постепенно: контраст, by contrast. Consequently — следствие, similarly — сходство, in other words — пересказ того же." }
      ] },
    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "True / False / Not Given",
      ru: "Прочитай текст. Отвечай только по тексту, а не по своим знаниям.",
      passageTitle: "Eleven Missing Days",
      passage: [
        "When Britain changed its calendar in 1752, the start of the legal year also moved, from 25 March to 1 January. A popular story claims that crowds rioted, demanding “Give us our eleven days”.",
        "Historians have found little evidence that such riots took place. The slogan does appear in a satirical painting by William Hogarth, which may have helped the story spread."
      ],
      items: [
        { kind: "tfng", chk: 2, skill: "R-TFNG", stem: "After the change, the legal year in Britain began on 1 January.", key: "T",
          ru: "TRUE. «The start of the legal year also moved, from 25 March to 1 January»." },
        { kind: "tfng", chk: 2, skill: "R-TFNG", stem: "Historians have confirmed that large riots followed the change.", key: "F",
          ru: "FALSE. Историки нашли «little evidence», то есть подтверждения нет. Текст противоречит утверждению." },
        { kind: "tfng", chk: 2, skill: "R-TFNG", stem: "Hogarth was paid by the government for his painting.", key: "NG",
          ru: "NOT GIVEN. О картине сказано, что на ней есть лозунг. Кто за неё платил, текст не сообщает." }
      ] }
  ]
};

/* K2: Block B check-in (after C08). Blueprint: 2 × Rhetorical Synthesis, 2 × Command of Evidence (quantitative),
   2 × Central Ideas and Details, 2 × Text Structure and Purpose, 3 × IELTS matching information.
   D0 and K1 do not measure Block B skills, so the progress page compares K2 with first-attempt homework in C05–C08. */
window.LESSONS.K2 = {
  id: "K2", checkin: true, title: "Check-in B · The paragraph", thread: "Where Block B has taken you.",
  intro: "Check-in после блока B (уроки C05–C08). Навыки абзаца: синтез из заметок, данные как доказательство, главная мысль, структура и цель текста, и в IELTS — поиск абзаца с нужной информацией. 11 вопросов, отвечай с первой попытки. Результат на странице «Прогресс» встанет рядом с твоей первой попыткой в уроках C05–C08 по тем же навыкам. Это не прогноз балла.",
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Eight short texts",
      ru: "Один вопрос на каждый текст. Выбери лучший вариант. Данные в вопросах 3–4 выдуманные.",
      items: [
        { kind: "mcq", chk: 2, skill: "RS",
          text: "While researching a topic, a student has taken the following notes:\n• Gas street lamps were demonstrated on Pall Mall, London, in 1807.\n• Gas lighting soon spread to many other British towns.\n• Each gas lamp had to be lit by hand every evening.\n• Electric street lighting later replaced gas in most cities.",
          stem: "The student wants to emphasize a drawback of gas street lamps. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          opts: ["Gas street lamps were demonstrated on Pall Mall, London, in 1807.", "After its demonstration in London, gas lighting soon spread to many other British towns.", "A drawback of gas street lighting was that each lamp had to be lit by hand every evening.", "In most cities, electric street lighting later replaced gas."], key: 2,
          ru: "Цель: drawback, то есть недостаток. Его показывает только C: каждый газовый фонарь приходилось каждый вечер зажигать вручную. A и B — история распространения. D говорит о замене, но не называет недостаток газа." },
        { kind: "mcq", chk: 2, skill: "RS",
          text: "While researching a topic, a student has taken the following notes about Harbour Point, a fictional town:\n• In 2010, the town had 40 public benches.\n• In 2020, it had 65 public benches.\n• Most of the new benches were placed near the river.\n• A new park opened in 2015.",
          stem: "The student wants to present the overall change in the number of public benches. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          opts: ["Most of Harbour Point's new benches were placed near the river.", "A new park opened in Harbour Point in 2015.", "In 2010, Harbour Point had 40 public benches.", "The number of public benches in Harbour Point rose from 40 in 2010 to 65 in 2020."], key: 3,
          ru: "Overall change требует начала и конца: 40 → 65, это D. A говорит, где стоят новые скамейки, а не сколько их стало. B не о скамейках. C даёт только одну цифру." },
        { kind: "mcq", chk: 2, skill: "COEQ",
          text: "A city counted the average number of people walking along three streets each evening before and after new street lights were installed (fictional data). Street A: 120 before, 240 after. Street B: 150 before, 160 after. Street C: 90 before, 170 after. A planner claims that the increase on Street A was larger than the increase on either of the other streets.",
          stem: "Which choice most effectively uses the data to support the planner's claim?",
          opts: ["Street B had the most walkers before the new lights were installed.", "The number of walkers on Street A rose by 120, compared with 10 on Street B and 80 on Street C.", "All three streets had more walkers after the new lights were installed.", "Street C had 170 walkers after the new lights were installed."], key: 1,
          ru: "Утверждение сравнивает рост на A с ростом на двух других улицах. Нужны все три прироста: 240 − 120 = 120, 160 − 150 = 10, 170 − 90 = 80. Это B. C верно, но не сравнивает. A и D говорят об одной улице." },
        { kind: "mcq", chk: 2, skill: "COEQ",
          text: "Using the same fictional data (Street A: 120 before, 240 after; Street B: 150 before, 160 after; Street C: 90 before, 170 after), a student writes: “On Street C, the number of walkers ______”",
          stem: "Which choice most accurately completes the statement?",
          opts: ["nearly doubled.", "fell slightly.", "became the highest of the three streets.", "rose by 170."], key: 0,
          ru: "90 → 170: почти вдвое (вдвое было бы 180), A. B: число выросло. C: после установки больше всех на A (240). D: 170 — это итог, а прирост 80." },
        { kind: "mcq", chk: 2, skill: "CID",
          text: "Before electric lighting, many cities employed lamplighters, who walked set routes at dusk to light each gas lamp and returned at dawn to put them out. The work was steady but repetitive. It largely disappeared during the twentieth century, as electric lamps that could be switched on from one central point spread through cities.",
          stem: "Which choice best states the main idea of the text?",
          opts: ["Lamplighters walked set routes at dusk.", "Lamplighters once did a daily job that largely vanished with electric lighting.", "Electric technology changed every kind of work in the twentieth century.", "Gas lamps were brighter than electric lamps."], key: 1,
          ru: "Весь текст: что делали фонарщики и почему профессия почти исчезла. Это B. A — деталь первого предложения. C слишком широко: текст об одной профессии. D в тексте нет." },
        { kind: "mcq", chk: 2, skill: "CID",
          text: "Street lighting is usually discussed as a way of making streets safer at night. Yet it also changed how people spent their evenings. Shops could stay open after dark, and an evening walk through a lit street became an ordinary pastime in many cities.",
          stem: "Which choice best states the main idea of the text?",
          opts: ["Street lighting affected everyday evening life as well as safety.", "Street lighting made cities completely safe at night.", "Shops in many cities stayed open after dark.", "People in cities walked more than people in villages."], key: 0,
          ru: "«Yet it also changed how people spent their evenings» — главная мысль, остальное её примеры. Это A. B преувеличивает: completely safe в тексте нет. C — пример, а не главная мысль. D в тексте нет." },
        { kind: "mcq", chk: 2, skill: "TSP",
          text: "Many writing guides tell authors to state their main point in the first sentence. This advice works well for news reports, whose readers may stop after a single paragraph. In a long argument, however, a writer may prefer to build towards the main point, so that readers have seen the evidence before they meet the claim.",
          stem: "Which choice best describes the overall structure of the text?",
          opts: ["It criticises news reports and then explains how they should be written.", "It describes a long argument and then summarises its evidence.", "It presents a common piece of advice, notes where it works, and then describes a case where another approach may be better.", "It lists several writing guides and compares their advice."], key: 2,
          ru: "Карта: совет → где он работает → где лучше иначе (however). Это C. A: новости не критикуются, совет для них как раз подходит. B: конкретного аргумента нет. D: руководства не перечисляются и не сравниваются." },
        { kind: "mcq", chk: 2, skill: "TSP",
          text: "A council's report on street lighting begins with residents' complaints about dark roads. It then sets out the cost of three possible lighting schemes. Finally, it recommends the cheapest scheme that would still light every main road.",
          stem: "Which choice best describes the function of the second sentence in the overall structure of the text?",
          opts: ["It states the report's final recommendation.", "It describes the problem that the report sets out to solve.", "It explains why the residents complained.", "It provides information needed to compare the options before one is recommended."], key: 3,
          ru: "Стоимость трёх схем — материал для сравнения, после него идёт выбор: D. A — третье предложение. B — первое предложение (жалобы). C: причина жалоб не объясняется." }
      ] },
    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "Matching information",
      ru: "Прочитай текст из трёх абзацев. Для каждой детали найди абзац, где она есть. Отвечай только по тексту.",
      lettered: true,
      passageTitle: "Lighting the Streets",
      passage: [
        "In 1807, gas lamps were demonstrated to the public on Pall Mall in London. Within a few decades, gas lighting had spread to many British towns, where it gradually replaced dimmer oil lamps.",
        "Each gas lamp had to be lit and put out by hand. Towns therefore employed lamplighters, who walked the same routes at dusk and again at dawn, carrying long poles.",
        "Electric lighting, which could be switched on from one central point, later replaced most gas lamps. Some cities, however, still keep a small number of gas lamps for their historical character."
      ],
      items: [
        { group: { title: "Questions 1–3", task: "Which paragraph, A, B or C, contains the following information?", paras: 3,
            ru: "Ищи не главную мысль абзаца, а место, где есть деталь, пересказанная другими словами." },
          kind: "match", chk: 2, skill: "R-HEAD", stem: "lights being kept for reasons other than practical need", key: 2,
          ru: "C: несколько газовых фонарей сохраняют «for their historical character» — не для освещения, а ради истории." },
        { kind: "match", chk: 2, skill: "R-HEAD", stem: "a description of a routine repeated twice a day", key: 1,
          ru: "B: фонарщики проходили одни и те же маршруты «at dusk and again at dawn» — в сумерках и на рассвете, то есть дважды в день." },
        { kind: "match", chk: 2, skill: "R-HEAD", stem: "the location where people were introduced to a new way of lighting streets", key: 0,
          ru: "A: «demonstrated to the public on Pall Mall in London». Ловушка C: электрическое освещение — тоже новый способ, но место, где его показали людям, не названо." }
      ] }
  ]
};

/* Check-in C · The argument */
window.LESSONS.K3 = {
  id: 'K3',
  checkin: true,
  title: 'Check-in C · The argument',
  thread: 'How far can the evidence take you?',
  intro: 'Check-in после C11. Девять новых вопросов на вывод, доказательства, сопоставление позиций и чтение по тексту. В «Прогрессе» результат стоит рядом с первой попыткой в C09–C11 по тем же навыкам. Это тренировка, без пересчёта в экзаменационный балл.',
  parts: [
    {
      type: 'questions',
      id: 'sat',
      label: 'SAT · Reading and Writing',
      title: 'Six short arguments',
      ru: 'Все примеры вымышлены. Выбери ответ, для которого достаточно текста.',
      items: [
        {
          skill: 'INF',
          kind: 'mcq',
          text: 'A town asked visitors to rate its archive using a survey link printed on the exit door. The archive closes before many residents finish work. The town concerned about people who had no opportunity to respond should seek feedback from ______',
          stem: 'Which choice most logically completes the text?',
          opts: [
            'visitors who scanned the exit link and submitted their rating.',
            'residents who visited during opening hours and completed the questionnaire.',
            'people who answered the survey after leaving the building.',
            'people who could not visit during opening hours.'
          ],
          key: 3,
          ru: 'D. Анкета доступна на выходе, поэтому люди, которые не смогли прийти, выпадают. В A, B и C описаны люди, которые уже смогли ответить.',
          chk: 2
        },
        {
          skill: 'INF',
          kind: 'mcq',
          text: 'A station’s enquiry desk recorded the number of questions asked in person each day. It also began accepting questions online, but it kept no count of those messages. The daily register shows fewer in-person questions in the second week than in the first. Based on the recorded counts, readers can tell that walk-in use declined, but cannot determine whether ______',
          stem: 'Which choice most logically completes the text?',
          opts: [
            'the number of questions across both channels fell.',
            'there were more in-person questions in the first week.',
            'the second week had fewer recorded walk-in questions.',
            'the count in the two weeks differed for in-person enquiries.'
          ],
          key: 0,
          ru: 'A. Сумма включает ненаблюдаемые сообщения. B, C и D даны в тексте.',
          chk: 2
        },
        {
          skill: 'COET',
          kind: 'mcq',
          text: 'A librarian claims that putting a book-return slot beside the entrance reduces the number of borrowers who carry their books to the wrong counter.',
          stem: 'Which finding, if true, would most directly support the claim?',
          opts: [
            'Staff fitted a new clock above the old counter.',
            'A sign near the entrance names the library.',
            'After the move, fewer borrowers went to the wrong counter, with the other signs unchanged.',
            'The new slot is made of a different material.'
          ],
          key: 2,
          ru: 'C. Измерено именно число ошибок у стойки при смене местоположения. A, B и D не содержат этого результата.',
          chk: 2
        },
        {
          skill: 'COET',
          kind: 'mcq',
          text: 'A planner argues that a printed landmark on a route card helps walkers find a turn. A designer suggests that the card merely became easier to read when the font size increased.',
          stem: 'Which finding would best separate the two explanations?',
          opts: [
            'Walkers with the same font size missed fewer turns if their card included the landmark.',
            'Most walkers could name a landmark in their own street.',
            'The font used on both cards was available for free.',
            'Walkers planning a shorter route carried fewer cards.'
          ],
          key: 0,
          ru: 'A. Размер одинаков, наличие ориентира разное, а итог — нужный поворот. Остальные факты не различают причины.',
          chk: 2
        },
        {
          skill: 'CTC',
          kind: 'mcq',
          text: 'Text 1\n' +
            'The town should put the same street number format on every public building. It will help visitors check the location quickly.\n' +
            '\n' +
            'Text 2\n' +
            'A shared format can help visitors, but buildings should also show their familiar names while people learn to use the new numbers.',
          stem: 'How would the author of Text 2 most likely respond to the position in Text 1?',
          opts: [
            'By disputing whether visitors ever use numbers.',
            'By supporting the common format and suggesting an additional temporary aid.',
            'By asking the town to give each building a different format.',
            'By claiming that building names should be removed at once.'
          ],
          key: 1,
          ru: 'B. Цель общая. Автор 2 добавляет знакомые названия на время перехода. A, C и D идут против этой позиции.',
          chk: 2
        },
        {
          skill: 'CTC',
          kind: 'mcq',
          text: 'Text 1\n' +
            'A council should publish the evidence behind each decision in one full document, so readers can trace the argument.\n' +
            '\n' +
            'Text 2\n' +
            'Access to the full evidence matters. Many readers also need a short guide to find the part they are looking for.',
          stem: 'How would the author of Text 2 most likely respond to the position in Text 1?',
          opts: [
            'By suggesting the council should remove any evidence that is hard to read.',
            'By insisting each decision should appear in a different type of document.',
            'By agreeing about access and adding that readers need help navigating it.',
            'By arguing that a short guide should replace all supporting evidence.'
          ],
          key: 2,
          ru: 'C. Оба автора хотят сохранить доступ к полным данным. Автор 2 добавляет путеводитель. A и D убирают данные, B не следует из его текста.',
          chk: 2
        }
      ]
    },
    {
      type: 'questions',
      id: 'ielts',
      label: 'IELTS Academic · Reading practice',
      title: 'A short reading check',
      ru: 'Три вопроса на различие между подтверждением, противоречием и отсутствием сведений.',
      passageTitle: 'The New Notice',
      passage: [
        'The fictional Bracken Library tried a new entrance notice during a period when its regular opening hours remained in force. The new notice put the hours above the events list. Staff also kept the old notice in the storage room in case they needed it again.',
        'On the first day staff recorded each question about opening hours asked at the main desk. They recorded the total for the whole day, without noting the ages of the visitors who asked. No information was collected about questions sent by email.'
      ],
      items: [
        {
          skill: 'R-TFNG',
          kind: 'tfng',
          stem: 'The opening hours remained the same during the trial.',
          key: 'T',
          ru: 'TRUE. Regular opening hours remained in force. Поменяли порядок на табличке, а не режим.',
          group: {
            title: 'Questions 1–3',
            task: 'Do the following statements agree with the information given in the passage? Choose TRUE, FALSE or NOT GIVEN.',
            ru: 'Сверяй каждое утверждение с текстом.'
          },
          chk: 2
        },
        {
          skill: 'R-TFNG',
          kind: 'tfng',
          stem: 'The new notice placed the events list above the opening hours.',
          key: 'F',
          ru: 'FALSE. В первом абзаце положение обратное: hours above the events list.',
          chk: 2
        },
        {
          skill: 'R-TFNG',
          kind: 'tfng',
          stem: 'More teenagers than adults asked about opening hours at the main desk.',
          key: 'NG',
          ru: 'NOT GIVEN. Возраст не записывали, поэтому сравнить группы нельзя. Общий итог этого не сообщает.',
          chk: 2
        }
      ]
    }
  ],
  handoff: {
    text: 'You have tested three ways of reading an argument. Next, listen for the information that moves a story forward.',
    next: 'C12'
  }
};

/* Final check · Your next practice */
window.LESSONS.KF = {
  id: 'KF',
  checkin: true,
  title: 'Final check · Your next practice',
  thread: 'Use the checks you can repeat.',
  intro: 'Короткая итоговая проверка по материалу курса. Здесь 8 заданий SAT, 4 Reading и 4 Listening. Все тексты и ситуации новые. В «Прогрессе» виден результат по заданиям и навыкам. Письмо и устную запись оценивай по качественной обратной связи.',
  parts: [
    {
      type: 'questions',
      id: 'sat',
      label: 'SAT · Reading and Writing',
      title: 'Eight decisions in new texts',
      ru: 'Выбери один ответ. Сначала определи, какой признак в тексте решает задачу. Все ситуации вымышлены.',
      items: [
        {
          skill: 'WIC',
          kind: 'mcq',
          text: 'The guide was deliberately selective. It showed only the crossings relevant to visitors walking from the station and left out roads that led away from the centre.',
          stem: 'As used in the text, what does “selective” most nearly mean?',
          opts: [
            'Made up of carefully chosen details',
            'Available only at certain times',
            'Liked by nearly all visitors',
            'Based on uncertain measurements'
          ],
          key: 0,
          ru: 'A. Only и left out показывают отбор деталей. B ограничивает время, C говорит об оценке, D — о точности, которой текст не касается.',
          chk: 2
        },
        {
          skill: 'BND',
          kind: 'mcq',
          text: 'The sign lists the opening ______ the panel below it shows how to reach the entrance.',
          stem: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
          opts: [ 'hours,', 'hours and,', 'hours;', 'hours' ],
          key: 2,
          ru: 'C. Точка с запятой соединяет два самостоятельных предложения. A — только запятая, B — запятая после союза, D — нет знака или союза.',
          chk: 2
        },
        {
          skill: 'FSS',
          kind: 'mcq',
          text: 'The labels on the collection box, unlike the small sign by the entrance, ______ visible from the back of the queue.',
          stem: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
          opts: [ 'is', 'are', 'has been', 'was' ],
          key: 1,
          ru: 'B. Подлежащее labels во множественном числе. Sign стоит в сравнительном обороте и не определяет форму глагола.',
          chk: 2
        },
        {
          skill: 'TRN',
          kind: 'mcq',
          text: 'A paper guide can be used without a connection. ______ visitors may prefer a phone guide when they need a route that reflects a last-minute closure.',
          stem: 'Which choice completes the text with the most logical transition?',
          opts: [ 'For instance,', 'Consequently,', 'In other words,', 'Nevertheless,' ],
          key: 3,
          ru: 'D. У бумаги есть преимущество, однако новая потребность даёт преимущество телефону. A вводит пример, B — следствие, C — перефразирование предыдущей мысли.',
          chk: 2
        },
        {
          skill: 'RS',
          kind: 'mcq',
          text: 'While researching a topic, a student has taken the following notes:\n' +
            '• Oak Hall has two entrances.\n' +
            '• The west entrance has steps.\n' +
            '• The east entrance has a ramp.\n' +
            '• Both entrances lead to the same lobby.',
          stem: 'The student wants to tell a visitor using a wheelchair which entrance to try. Which choice most effectively uses relevant information from the notes?',
          opts: [
            'Oak Hall has two entrances, one on each side of the building.',
            'Both entrances lead to the same lobby.',
            'The east entrance has a ramp.',
            'The west entrance is one of Oak Hall’s two entrances.'
          ],
          key: 2,
          ru: 'C. В заметках только восточный вход описан как имеющий пандус. Остальные варианты не указывают, как избежать ступеней.',
          chk: 2
        },
        {
          skill: 'CTC',
          kind: 'mcq',
          text: 'Text 1\n' +
            'The first page of a visitor guide should show the fastest route to the meeting room.\n' +
            '\n' +
            'Text 2\n' +
            'A first page should help visitors act quickly. A route that looks faster on paper is less useful if visitors cannot recognise its entrances.',
          stem: 'How would the author of Text 2 most likely qualify the recommendation in Text 1?',
          opts: [
            'By arguing that a quick route also needs entrances that are easy to identify.',
            'By denying that visitors want to act quickly.',
            'By asking guides to hide all of the entrances.',
            'By claiming that the first page should give only historical information.'
          ],
          key: 0,
          ru: 'A. Автор 2 сохраняет цель скорости, но указывает, что входы на таком пути должны быть узнаваемыми. Остальные ответы отрицают согласие или добавляют тему.',
          chk: 2
        },
        {
          skill: 'INF',
          kind: 'mcq',
          text: 'A team recorded problems people had when following a guide on paper. The team planned to test the phone version later, with a separate group.',
          stem: 'Which conclusion follows most reasonably from the description?',
          opts: [
            'The team had already found fewer problems in the phone version.',
            'The first group’s results alone cannot establish how the phone version performs.',
            'The phone version depends on the paper guide to work.',
            'A separate group has already tested every route.'
          ],
          key: 1,
          ru: 'B. Данные пока только о бумажной версии, телефонная проверка запланирована. A и D делают будущий тест состоявшимся. C приписывает связь без опоры.',
          chk: 2
        },
        {
          skill: 'COEQ',
          kind: 'mcq',
          text: 'At a fictional exhibition, visitors followed either the old or the new entrance sign. Old sign: 30 visitors, 12 took a wrong turn. New sign: 60 visitors, 12 took a wrong turn. A student claims that a smaller share of visitors took a wrong turn with the new sign.',
          stem: 'Which choice most effectively uses the data to support the claim?',
          opts: [
            'Twelve visitors took a wrong turn with each sign.',
            'More people took part in the trial with the new sign.',
            'The first sign was used by 30 visitors.',
            'The share fell from 12 out of 30, or 40 percent, to 12 out of 60, or 20 percent.'
          ],
          key: 3,
          ru: 'D. Число ошибок прежнее, но знаменатель удвоился. A берёт только число, B и C не сравнивают доли.',
          chk: 2
        }
      ]
    },
    {
      type: 'questions',
      id: 'ielts',
      label: 'IELTS Academic · Reading practice',
      title: 'A short passage about a collection',
      ru: 'Прочитай короткий текст. Это выборка заданий на чтение по источнику.',
      lettered: true,
      passageTitle: 'A Label for Two Readers',
      passage: [
        'At the fictional Belwick archive, each drawer has a number used by staff when they return documents to storage. Researchers needed a different kind of information. A drawer number was precise, yet a visitor could not tell from it which drawer contained early photographs. The archive kept the numbers and added a short subject label to help researchers begin.',
        'The staff first tried the new subject labels in one room. A visitor looking for photographs could read the subject labels and then write down the drawer number for a request form. Staff did not change the storage order. On trial days an observer recorded whether a visitor could choose a drawer without asking for help, but did not record how long the visit lasted.',
        'Some drawers contained material about more than one subject. The archive added a separate index for these cases, so that the label on the drawer could stay short. In the next trial, the staff planned to check whether a reader could use the index without learning the archive’s filing system first.'
      ],
      items: [
        {
          skill: 'R-MC',
          kind: 'mcq',
          stem: 'Why did the archive add short labels?',
          opts: [
            'To record the condition of each photograph.',
            'To help visitors choose a drawer by subject.',
            'To replace the numbers on request forms.',
            'To move older documents out of storage.'
          ],
          key: 1,
          ru: 'B. В A посетитель не может по номеру определить тему, поэтому добавлена короткая подпись. A и D не названы, C противоречит тому, что номера сохранили.',
          group: {
            title: 'Questions 1–2',
            task: 'Choose the correct letter, A, B, C or D.',
            ru: 'Найди действие и его цель.'
          },
          chk: 2
        },
        {
          skill: 'R-MC',
          kind: 'mcq',
          stem: 'What was the main purpose of the separate index?',
          opts: [
            'To give information about the age of every visitor.',
            'To show staff a new storage order.',
            'To record the length of each visit.',
            'To help readers locate material that covered several subjects.'
          ],
          key: 3,
          ru: 'D. В C индекс решает проблему материала на несколько тем. B противоречит B текста, C не измеряли, A вне текста.',
          chk: 2
        },
        {
          skill: 'R-GAP',
          kind: 'gap',
          limit: 2,
          stem: '3 · For a request, visitors wrote the drawer number on a ______.',
          accept: [ 'request form', 'form' ],
          ru: 'B. Drawer number остаётся в заявке. Вписываем название бланка request form или form.',
          group: {
            title: 'Question 3',
            task: 'Complete the sentence. Choose NO MORE THAN TWO WORDS from the passage.',
            ru: 'Впиши слова из текста.'
          },
          chk: 2
        },
        {
          kind: 'tfng',
          skill: 'R-TFNG',
          stem: 'Staff recorded the length of each visit in the first trial.',
          key: 'F',
          ru: 'FALSE. В B прямо сказано, что длительность посещения не записывали. Фиксировали, удалось ли выбрать ящик самостоятельно.',
          group: {
            title: 'Question 4',
            task: 'Choose TRUE, FALSE or NOT GIVEN.',
            ru: 'Сверь утверждение с текстом.'
          },
          chk: 2
        }
      ]
    },
    {
      type: 'questions',
      id: 'listen',
      label: 'IELTS-style · Listening practice',
      title: 'A short visit announcement',
      ru: 'Четыре пропуска по порядку. Слушай, какую информацию говорящий уточняет.',
      voices: {
        Narrator: { pitch: 1, rate: 0.93, lang: 'en-GB' },
        Guide: { pitch: 1.13, rate: 0.96, lang: 'en-GB' }
      },
      audio: [
        'Narrator: You will hear an announcement about a visit to an exhibition.',
        'Narrator: Look at questions one to four.',
        'Guide: Hello everyone.',
        'Guide: Tomorrow’s visit is still going ahead.',
        'Guide: We’d planned to meet at the south entrance, but there’s work on that door.',
        'Guide: Come to the east entrance instead.',
        'Guide: It’s next to the fountain, and I’ll be waiting outside.',
        'Guide: Let’s meet at nine fifteen.',
        'Guide: Sorry, that’s the time I need to arrive to collect the tickets.',
        'Guide: You should be there at nine thirty.',
        'Guide: The group will go in together, so please find me before you go through the door.',
        'Guide: You can leave heavy bags downstairs.',
        'Guide: I said last week that you might need a coin for the locker, but the lockers now take a token.',
        'Guide: Ask for one at the reception desk.',
        'Guide: We’ll finish the visit on the top floor.',
        'Guide: The stairs are beside the exhibition room, but anyone who needs the lift should follow the signs marked Terrace.',
        'Guide: The lift is just before the doors that lead outside.'
      ],
      transcript: [
        'Narrator: You will hear an announcement about a visit to an exhibition. Look at questions one to four.',
        'Guide: Hello everyone. Tomorrow’s visit is still going ahead. We’d planned to meet at the south entrance, but there’s work on that door. Come to the east entrance instead. It’s next to the fountain, and I’ll be waiting outside.',
        'Guide: Let’s meet at nine fifteen. Sorry, that’s the time I need to arrive to collect the tickets. You should be there at nine thirty. The group will go in together, so please find me before you go through the door.',
        'Guide: You can leave heavy bags downstairs. I said last week that you might need a coin for the locker, but the lockers now take a token. Ask for one at the reception desk.',
        'Guide: We’ll finish the visit on the top floor. The stairs are beside the exhibition room, but anyone who needs the lift should follow the signs marked Terrace. The lift is just before the doors that lead outside.'
      ],
      items: [
        {
          skill: 'LIS',
          kind: 'gap',
          limit: 2,
          stem: '1 · Meet at the ______ entrance.',
          accept: [ 'east' ],
          ru: 'Гид заменяет южный вход восточным из-за работ.',
          group: {
            title: 'Questions 1–4',
            task: 'Complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER from the recording for each answer.',
            ru: 'Если услышал(а) поправку, впиши уточнённый вариант.'
          },
          chk: 2
        },
        {
          skill: 'LIS',
          kind: 'gap',
          limit: 2,
          stem: '2 · Time for visitors to meet: ______.',
          accept: [ '9:30', '9.30', 'nine thirty', '09:30', '09.30' ],
          ru: 'Nine fifteen — время для гида. Nine thirty — время встречи группы.',
          chk: 2
        },
        {
          skill: 'LIS',
          kind: 'gap',
          limit: 2,
          stem: '3 · Ask reception for a ______ to use a locker.',
          accept: [ 'token' ],
          ru: 'Coin устарело. Сейчас для шкафчика нужен token.',
          chk: 2
        },
        {
          skill: 'LIS',
          kind: 'gap',
          limit: 2,
          stem: '4 · Sign to follow for the lift: ______.',
          accept: [ 'Terrace' ],
          ru: 'На указателях для лифта написано Terrace. Stairs описывают другой путь.',
          chk: 2
        }
      ]
    }
  ],
  handoff: { text: 'Review the answers by skill and choose your next two checks.', next: 'C16' }
};
