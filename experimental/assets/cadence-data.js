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
    { id: "K2", title: "Check-in B · The paragraph", after: "C08", ru: "После C08", status: "planned" },
    { id: "K3", title: "Check-in C · The argument", after: "C11", ru: "После C11", status: "planned" },
    { id: "KF", title: "Final check", after: "C16", ru: "В конце курса", status: "planned" }
  ],
  skills: {
    WIC: "Words in Context", BND: "Boundaries", FSS: "Form, Structure, and Sense", TRN: "Transitions",
    RS: "Rhetorical Synthesis", COEQ: "Command of Evidence (quantitative)", CID: "Central Ideas and Details",
    "R-TFNG": "IELTS Reading: True / False / Not Given", "R-MC": "IELTS Reading: multiple choice", LIS: "IELTS Listening"
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
        text: "While researching a topic, a student has taken the following notes:\n• The United States held its first census in 1790.\n• The Constitution requires a census every ten years.\n• The 1790 count was carried out by US marshals.\n• Census results are used to divide seats in the House of Representatives among the states.",
        stem: "The student wants to explain the purpose of the US census. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
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
      sample: "Southwark and Vauxhall had 315 deaths, it was more higher than Lambeth. The rest of London was 59.",
      issues: [["GRA", "Comma splice и «more higher» (двойная сравнительная степень)."], ["TR", "Нет единицы: 315 смертей на 10 000 домов, а не 315 смертей."], ["CC", "Второе предложение ничего не сравнивает: остальной Лондон не сопоставлен с компаниями."]] },
    live: ["Part 1 · Do you trust the numbers you see in the news?", "Part 3 · How can ordinary people check whether a statistic is reliable?", "Part 3 · Should governments always publish the data they collect?"] },
  C07: { focus: "Для каждой ошибки: был ли выбранный ответ деталью, слишком широкой мыслью или главной мыслью другого текста.",
    peer: { task: "A topic sentence for a paragraph about the hospital after the Sanitary Commission.",
      sample: "The sewers were cleaned out.",
      issues: [["TR", "Это деталь из абзаца, а не главная мысль: topic sentence должен покрывать весь абзац."], ["LR", "Нет слов, которые обобщают: conditions, sanitation, mortality."], ["CC", "Предложение не готовит читателя к выводу абзаца о смертности."]] },
    live: ["Part 2 · Describe a chart, picture or diagram that helped you understand something.", "Part 3 · Are pictures better than words for explaining ideas?", "Part 3 · Why do some people ignore facts that are clearly presented?"] },
  C12: { focus: "Для каждой ошибки в Listening: прозвучал ли поворот (used to be, instead, but now) и где ты его пропустил(а).",
    peer: { task: "From notes to two sentences: the way to the library and the bus stop.",
      sample: "Library: turn left clock tower, second building right opposite lake. Bus stop moved behind library on Mill Road.",
      issues: [["GRA", "Это всё ещё заметки: нет подлежащего и сказуемого, пропущены артикли и предлоги (at the clock tower, on the right)."], ["TR", "Не сказано, где остановка была раньше, а это важная часть заметки."], ["CC", "Две мысли не связаны: нет ни связки, ни порядка."]] },
    live: ["Part 2 · Describe the way from your home to a place you often visit.", "Part 1 · Do you prefer asking for directions or using an app?", "Part 3 · How could your town be easier for visitors to find their way around?"] }
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
