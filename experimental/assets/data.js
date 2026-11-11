/* NURZYCOM experimental course data: SAT Reading & Writing + IELTS, demo version.
   Every passage, question and example sentence here is ORIGINAL (written for nurzycom, built on well-established facts).
   Nothing is copied or reworded from College Board, Cambridge/IELTS or any publisher.
   chk: 2 = the key was solved independently twice (see experimental/README.md, "Key checks").
   Instructions and explanations: Russian. Exam content: English. */
window.COURSE = {
  version: "0.2-demo",
  theme: "Making the world readable",
  themeRu: "Один сюжет на весь курс: как люди делают мир читаемым. Карты → время → данные → аргументы. Тема каждого урока вырастает из предыдущего, а слова, тексты, устный ответ и письмо внутри урока говорят об одном и том же.",

  blocks: [
    { id: "A", title: "Block A · The sentence", ru: "Предложение" },
    { id: "B", title: "Block B · The paragraph", ru: "Абзац" },
    { id: "C", title: "Block C · The argument", ru: "Аргумент" },
    { id: "D", title: "Block D · IELTS only", ru: "Только IELTS" },
    { id: "E", title: "Block E · Assembly", ru: "Сборка" }
  ],

  /* status: "live" = fully built in this demo, "planned" = outline only */
  lessons: [
    { id: "C01", block: "A", status: "live", title: "The Map That Leaves Things Out", thread: "A map is useful because of what it omits.",
      shared: "Word in context · paraphrase", sat: "Words in Context", ielts: "Reading: recognising paraphrase", speak: "Part 1 · short answers", write: "Paraphrase two sentences" },
    { id: "C02", block: "A", status: "live", title: "Where One Zone Ends", thread: "A line on the map decides what time it is.",
      shared: "Sentence boundaries", sat: "Boundaries", ielts: "Writing GRA: complex sentences", speak: "Part 1 · answer + reason", write: "Combine four short sentences" },
    { id: "C03", block: "A", status: "live", title: "Railway Time", thread: "Trains forced towns to agree on one clock.",
      shared: "Form and agreement", sat: "Form, Structure, and Sense", ielts: "Writing GRA: accuracy", speak: "Part 2 · a past event", write: "Correct your own paragraph" },
    { id: "C04", block: "A", status: "live", title: "The Clock That Found Longitude", thread: "To know where you are, know what time it is.",
      shared: "Logical links", sat: "Transitions", ielts: "Writing CC: cohesive devices", speak: "Part 3 · opinion + concession", write: "One paragraph, three links" },
    { id: "C05", block: "B", status: "planned", title: "Counting Everyone", thread: "A census turns a country into a table.",
      shared: "Selecting facts for a goal", sat: "Rhetorical Synthesis", ielts: "Writing Task 1: the overview", speak: "Describe a trend aloud", write: "One overview sentence" },
    { id: "C06", block: "B", status: "planned", title: "The Pump on Broad Street", thread: "A map of dots became an argument.",
      shared: "Data as evidence", sat: "Command of Evidence (quantitative)", ielts: "Writing Task 1: comparisons", speak: "Compare two figures aloud", write: "Two comparison sentences" },
    { id: "C07", block: "B", status: "planned", title: "The Diagram That Changed a Hospital", thread: "One picture carried the main idea.",
      shared: "Main idea and detail", sat: "Central Ideas and Details", ielts: "Reading: headings, True / False / Not Given", speak: "Part 2 · structure", write: "A topic sentence" },
    { id: "C08", block: "B", status: "planned", title: "How a Report Persuades", thread: "Order is part of the message.",
      shared: "Structure and purpose", sat: "Text Structure and Purpose", ielts: "Reading: matching information · Task 2 paragraph", speak: "Part 2 · two full minutes", write: "One body paragraph" },
    { id: "C09", block: "C", status: "planned", title: "What the Data Does Not Say", thread: "The missing cases matter most.",
      shared: "Inference", sat: "Inferences", ielts: "Reading: Yes / No / Not Given, summary", speak: "Part 3 · explain a cause", write: "Claim + reason + example" },
    { id: "C10", block: "C", status: "planned", title: "The Doctor Nobody Believed", thread: "A claim needs support that others accept.",
      shared: "Claim and support", sat: "Command of Evidence (textual)", ielts: "Writing Task 2: Task Response", speak: "Part 3 · point + example", write: "Support one claim" },
    { id: "C11", block: "C", status: "planned", title: "One Metre, Two Opinions", thread: "Standards help everyone and annoy someone.",
      shared: "Two points of view", sat: "Cross-Text Connections", ielts: "Task 2: discuss both views", speak: "Part 3 · compare views", write: "Introduction for a two-view essay" },
    { id: "C12", block: "D", status: "planned", title: "Follow the Voice", thread: "Back to the map: now you only hear it.",
      shared: "—", sat: "—", ielts: "Listening: maps, forms, predicting the answer", speak: "Give directions aloud", write: "Notes from audio" },
    { id: "C13", block: "D", status: "planned", title: "A Lecture on Time", thread: "Signposts tell you where the speaker is going.",
      shared: "—", sat: "—", ielts: "Listening: lectures and signposting", speak: "Part 2 · retell the lecture", write: "Summary in three sentences" },
    { id: "C14", block: "D", status: "planned", title: "Say It Clearly", thread: "Stress and pauses are the punctuation of speech.",
      shared: "—", sat: "—", ielts: "Speaking: all three parts + pronunciation", speak: "Full recorded answer", write: "Self-review of the recording" },
    { id: "C15", block: "D", status: "planned", title: "Building the Essay", thread: "Every brick from lessons 2–11, in one piece.",
      shared: "—", sat: "—", ielts: "Writing Task 2 from the bricks (inside the course only)", speak: "Part 3", write: "Timed essay" },
    { id: "C16", block: "E", status: "planned", title: "Your Own Map", thread: "Draw the map of your errors. Decide what to leave out.",
      shared: "Mixed review", sat: "Mixed review + range", ielts: "Reading and Listening timing + range", speak: "Final recorded answer", write: "Personal error list" }
  ],

  /* Honest transfer map: D = directly, P = partly, N = not at all */
  transfer: {
    cols: ["Reading", "W · TR", "W · CC", "W · LR", "W · GRA", "S · FC", "S · LR", "S · GRA", "S · Pron", "Listening"],
    rows: [
      ["Information and Ideas", "D", "P", "P", "P", "N", "N", "P", "N", "N", "P"],
      ["Craft and Structure", "D", "P", "P", "P", "N", "N", "P", "N", "N", "P"],
      ["Expression of Ideas", "P", "P", "D", "P", "P", "P", "N", "N", "N", "P"],
      ["Standard English Conventions", "P", "N", "P", "N", "D", "N", "N", "P", "N", "N"]
    ]
  },

  /* Track 2: for students who finished SAT Verbal L01–L12 */
  bridge: [
    ["B1", "From precision to speed", "Reading: True / False / Not Given and headings"],
    ["B2", "Long texts", "Reading: three passages, timing and stamina"],
    ["B3", "Follow the voice", "Listening: forms, maps, predicting"],
    ["B4", "A lecture on time", "Listening: lectures and signposting"],
    ["B5", "Say it clearly", "Speaking Parts 1–2 + pronunciation"],
    ["B6", "Defend a view", "Speaking Part 3 + argument"],
    ["B7", "Sentence to paragraph", "Writing bricks (inside the course only)"],
    ["B8", "Your range", "Mock review and a realistic range"]
  ],

  /* Proposal only: 5-minute IELTS fragments inside the running SAT lessons. The live SAT course is not changed. */
  fragments: [
    ["L01", "Words in Context", "Spot the paraphrase: the same idea in other words"],
    ["L02", "Boundaries", "Say one complex sentence aloud, then write it"],
    ["L03", "Form, Structure, and Sense", "Retell a past event with accurate tenses"],
    ["L04", "Rhetorical Synthesis", "One overview sentence from a set of notes"],
    ["L05", "Transitions", "The same link in an essay paragraph"],
    ["L06", "Text Structure and Purpose", "Which paragraph contains this information?"],
    ["L07", "Cross-Text Connections", "Summarise two views in two sentences"],
    ["L08", "Central Ideas and Details", "Choose a heading for a paragraph"],
    ["L09", "Command of Evidence", "Describe a figure aloud in 30 seconds"],
    ["L10", "Inferences", "Yes, No, or Not Given?"]
  ]
};

/* ------------------------------------------------------------------ */
window.LESSONS = {};

window.LESSONS.C01 = {
  id: "C01",
  title: "The Map That Leaves Things Out",
  thread: "A map is useful because of what it omits.",
  intro: "Сегодня один навык: понять слово по контексту и узнать ту же мысль, сказанную другими словами. На SAT это Words in Context. В IELTS Reading на этом построены почти все вопросы. Все тексты урока об одном: о картах, которые намеренно что-то пропускают.",
  words: [
    { w: "distort", pos: "v.", ru: "искажать",
      sat: "Viewed through thick glass, the letters appeared distorted, their edges bending toward the frame.",
      ielts: "Statistics can distort the truth if the sample is too small." },
    { w: "convey", pos: "v.", ru: "передавать (мысль, смысл)",
      sat: "The poet's short lines convey a sense of urgency that longer sentences would dilute.",
      ielts: "A good chart conveys the main trend at a glance." },
    { w: "approximate", pos: "adj.", ru: "приблизительный",
      sat: "The dates given for the manuscript are approximate, since no record of its creation survives.",
      ielts: "The approximate cost of the project was two million dollars." },
    { w: "omit", pos: "v.", ru: "опускать, пропускать",
      sat: "The editor chose to omit the final chapter, judging it inconsistent with the rest.",
      ielts: "Some news reports omit important background information." },
    { w: "scale", pos: "n.", ru: "масштаб",
      sat: "At that scale, a single centimetre on the page stood for ten kilometres of coastline.",
      ielts: "Air pollution is a problem on a global scale." },
    { w: "render", pos: "v.", ru: "изображать, передавать",
      sat: "The painter rendered the harbour in pale greys, as if seen through fog.",
      ielts: "It is difficult to render this idiom in another language." },
    { w: "deliberate", pos: "adj.", ru: "намеренный",
      sat: "The pause before her reply was deliberate, meant to unsettle the committee.",
      ielts: "The council made a deliberate decision to invest in public transport." },
    { w: "reliable", pos: "adj.", ru: "надёжный",
      sat: "Without a reliable method of dating the samples, the team could draw only tentative conclusions.",
      ielts: "Public transport in my city is cheap but not always reliable." }
  ],
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Words in Context",
      ru: "Сначала прочитай текст и своими словами скажи, какое слово нужно. Только потом смотри на варианты.",
      rule: [
        "Ответ всегда доказан текстом: найди слова, которые его требуют.",
        "Вопрос «most nearly mean» спрашивает значение в этом тексте, а не самое частое значение слова.",
        "Ловушка: слово подходит по теме, но не по логике предложения."
      ],
      items: [
        { kind: "mcq", chk: 2,
          text: "The Mercator projection, introduced in 1569, keeps compass directions accurate, which made it valuable to sailors. To achieve this, however, it must ______ the relative sizes of landmasses: regions far from the equator appear much larger than they are.",
          stem: "Which choice completes the text with the most logical and precise word?",
          opts: ["distort", "conceal", "measure", "preserve"], key: 0,
          ru: "После двоеточия дано доказательство: регионы «appear much larger than they are», то есть размеры показаны неверно. Это distort (искажать). Conceal не подходит: размеры видны, но неверны. Preserve противоположно по смыслу, а «however» требует минуса. Measure не объясняет, почему регионы выглядят больше." },
        { kind: "mcq", chk: 2,
          text: "When Harry Beck's new map of the London Underground was published in 1933, it reflected a deliberate choice: stations were spaced evenly along straight lines, regardless of the real distances between them. Passengers, he reasoned, needed to know the order of stations, not the geography above ground.",
          stem: "As used in the text, what does the word “deliberate” most nearly mean?",
          opts: ["slow", "intentional", "cautious", "debatable"], key: 1,
          ru: "Бек «reasoned», то есть у решения была причина: оно принято сознательно. Значит, intentional. Slow и cautious — другие значения слова deliberate, но в тексте ничего не сказано о скорости или осторожности. Debatable только похоже по звучанию." },
        { kind: "mcq", chk: 2,
          text: "A map drawn at a small scale cannot show every street or stream. The cartographer must therefore ______ some features so that the remaining ones stay readable.",
          stem: "Which choice completes the text with the most logical and precise word?",
          opts: ["omit", "exaggerate", "invent", "criticize"], key: 0,
          ru: "«Cannot show every street» и «the remaining ones» показывают, что часть объектов убрана. Это omit. Exaggerate не объясняет слово «remaining». Invent добавляет то, чего нет. Criticize не связано с задачей картографа." },
        { kind: "mcq", chk: 2,
          text: "Because the Earth's surface is curved and a page is flat, no map can render the planet without some compromise; each projection keeps certain properties true and sacrifices others.",
          stem: "As used in the text, what does the word “render” most nearly mean?",
          opts: ["represent", "surrender", "provide", "repeat"], key: 0,
          ru: "Карта изображает планету на плоскости: render = represent. Provide — частое значение render («render a service»), но карта не «предоставляет» планету. Surrender похоже только по форме. Repeat не подходит по смыслу." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "The same idea in other words",
      ru: "Тот же навык в формате IELTS. Утверждения пересказывают текст другими словами. TRUE: текст говорит то же. FALSE: текст говорит обратное. NOT GIVEN: в тексте об этом ничего нет. Отвечай только по тексту, а не по своим знаниям.",
      passageTitle: "The Diagram That Ignored Distance",
      passage: [
        "Before 1933, maps of the London Underground tried to be geographically faithful. Lines curved as the tunnels curved, and stations in the crowded centre were squeezed together while those in the suburbs were spread far apart. The result was accurate but hard to read.",
        "Harry Beck, a technical draughtsman, took a different view. A passenger travelling underground, he argued, cannot see the city and has little use for its geography. What matters is the sequence of stations and the points where lines meet. Beck therefore drew every line as a straight segment, running horizontally, vertically or at forty-five degrees, and spaced the stations at even intervals. The only feature of the surface that he retained was the River Thames.",
        "His proposal was initially turned down as too unusual. When a pocket edition was finally printed in 1933, however, passengers adopted it quickly, and the approach has since been imitated by transport networks around the world.",
        "Beck's diagram is not without costs. Because distances are distorted, two stations that look far apart on the page may in fact be a short walk from each other. The map conveys one kind of information very clearly precisely because it omits another."
      ],
      items: [
        { kind: "tfng", chk: 2, stem: "On earlier Underground maps, stations in the centre of London were drawn close to one another.", key: "T",
          ru: "TRUE. В тексте: «stations in the crowded centre were squeezed together». «Squeezed together» = «drawn close to one another»." },
        { kind: "tfng", chk: 2, stem: "Beck thought that people travelling underground needed detailed information about the streets above them.", key: "F",
          ru: "FALSE. Текст говорит обратное: пассажир «has little use for its geography»." },
        { kind: "tfng", chk: 2, stem: "Beck's design was accepted as soon as he proposed it.", key: "F",
          ru: "FALSE. «Initially turned down» = сначала отклонили." },
        { kind: "tfng", chk: 2, stem: "Beck received a large payment for the 1933 edition.", key: "NG",
          ru: "NOT GIVEN. О деньгах в тексте нет ни слова. Нельзя отвечать по догадке." },
        { kind: "tfng", chk: 2, stem: "Stations that appear distant on the diagram are always far apart in reality.", key: "F",
          ru: "FALSE. Они «may in fact be a short walk from each other». Слово «always» делает утверждение неверным." },
        { kind: "mcq", chk: 2, stem: "In the third paragraph, the word “imitated” is closest in meaning to", opts: ["copied", "criticized", "replaced", "improved"], key: 0,
          ru: "Подход оказался успешным, и его повторили другие сети: imitated = copied. Об улучшении или замене текст не говорит." }
      ] },

    { type: "speaking", id: "speak", label: "IELTS-style · Speaking Part 1", title: "Short answers, full sentences",
      ru: "Ответь вслух на каждый вопрос двумя-тремя предложениями: ответ, причина, пример. Используй минимум два слова урока. Можно записать себя: запись остаётся только на этом устройстве.",
      prompts: [
        "Do you often use maps on your phone? Why or why not?",
        "When did a map last help you? What happened?",
        "Do you think paper maps are still useful?"
      ],
      prep: 20, talk: 90,
      pron: { title: "Pronunciation: word stress", ru: "В глаголах distort, convey и omit ударение на втором слоге. Произнеси каждое слово три раза, ударный слог громче и длиннее.",
        items: ["dis-TORT", "con-VEY", "o-MIT", "REN-der (здесь ударение на первом слоге)", "re-LI-a-ble", "de-LIB-er-ate", "ap-PROX-i-mate"] },
      model: "I use maps on my phone almost every day, mainly because the bus routes in my city change quite often. Last month a map helped me find a clinic in a district I had never visited. It was reliable, although it omitted a small side street, so I still had to ask someone for directions." },

    { type: "writing", id: "write", label: "Writing micro-task", title: "Paraphrase two sentences",
      ru: "Перепиши каждое предложение так, чтобы смысл остался тем же. Поменяй и слова, и строение предложения. Это основа и для IELTS Writing, и для вопросов SAT, где верный ответ пересказывает текст.",
      prompts: [
        "The map conveys one kind of information clearly because it omits another.",
        "No flat map can represent the Earth's curved surface without distortion."
      ],
      minWords: 20,
      checklist: ["Я поменял(а) слова, а не только их порядок.", "Я поменял(а) строение хотя бы одного предложения.", "Смысл тот же: ничего не добавлено и не потеряно.", "Я проверил(а) окончания глаголов и артикли."],
      model: [
        "By leaving some details out, the map makes the remaining information easy to understand.",
        "Every flat map changes the true shape or size of some regions, because the planet's surface is curved."
      ] },

    { type: "questions", id: "exit", label: "Exit check", title: "Two questions before you go",
      ru: "По одному вопросу на каждый экзамен. Без подсказок.",
      items: [
        { kind: "mcq", chk: 2,
          text: "The survey's figures are only ______: the researchers questioned a sample of households rather than every one.",
          stem: "Which choice completes the text with the most logical and precise word?",
          opts: ["approximate", "deliberate", "reliable", "distorted"], key: 0,
          ru: "Опросили выборку, а не всех, значит цифры приблизительные: approximate. «Only reliable» нелогично: only вводит ограничение. Distorted означало бы, что цифры искажены, а текст говорит лишь о неполном охвате." },
        { kind: "tfng", chk: 2,
          text: "Beck drew every line as a straight segment and spaced the stations at even intervals.",
          stem: "The gaps between stations on Beck's diagram reflect the real distances between them.", key: "F",
          ru: "FALSE. «Even intervals» = одинаковые промежутки, они не зависят от настоящих расстояний." }
      ] }
  ],
  handoff: { text: "Beck left distance out. Next, a line on the map that decides what time it is.", next: "C02" }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C02 = {
  id: "C02",
  title: "Where One Zone Ends",
  thread: "A line on the map decides what time it is.",
  intro: "Сегодня границы предложений. На SAT это Boundaries: где ставить точку, запятую, точку с запятой и двоеточие. В IELTS Writing это критерий Grammatical Range and Accuracy: сложные предложения без ошибок на стыках. В прошлом уроке карта пропускала лишнее. Сегодня на карте появляются линии, которые решают, который час и какое число.",
  words: [
    { w: "boundary", pos: "n.", ru: "граница",
      sat: "The river long served as the boundary between the two provinces, though its course shifted with every flood.",
      ielts: "The boundary between work and home life has become less clear." },
    { w: "arbitrary", pos: "adj.", ru: "произвольный, условный",
      sat: "The division of the collection into three periods is arbitrary; the artist herself recognized no such breaks.",
      ielts: "An age limit of eighteen may seem arbitrary, but a line must be drawn somewhere." },
    { w: "adopt", pos: "v.", ru: "принимать, перенимать",
      sat: "The council voted to adopt the new calendar, although several members objected to the cost of the change.",
      ielts: "Many companies have adopted flexible working hours." },
    { w: "span", pos: "v.", ru: "охватывать, простираться",
      sat: "Her career spanned five decades, during which she published more than thirty novels.",
      ielts: "Russia spans eleven time zones." },
    { w: "adjacent", pos: "adj.", ru: "соседний, смежный",
      sat: "The two laboratories occupy adjacent rooms, which allows the teams to share equipment.",
      ielts: "The new car park was built on land adjacent to the station." },
    { w: "convention", pos: "n.", ru: "общепринятое правило, условность",
      sat: "By convention, north is placed at the top of a map, but nothing in nature requires it.",
      ielts: "Shaking hands is a common convention in business meetings." },
    { w: "coincide", pos: "v.", ru: "совпадать",
      sat: "The boundaries of the park do not coincide with those of the ancient forest, which once extended much farther south.",
      ielts: "The festival coincides with the school holidays, so hotels fill quickly." },
    { w: "deviate", pos: "v.", ru: "отклоняться",
      sat: "The published text deviates from the manuscript in several places, most of them minor.",
      ielts: "Pilots rarely deviate from the planned route." }
  ],
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Boundaries",
      ru: "Слова во всех вариантах одинаковые, меняются только знаки. Сначала найди подлежащее и сказуемое по обе стороны пропуска и реши, что перед тобой: два полных предложения, придаточное или вставка.",
      rule: [
        "Два полных предложения соединяют точка, точка с запятой или запятая с союзом (and, but, so). Одна запятая их не соединяет.",
        "Придаточное в начале (Because…, Although…) отделяется запятой. Вставку, которую можно убрать, выделяют парой одинаковых знаков: две запятые или два тире.",
        "Двоеточие ставят после полного предложения перед пояснением. However между двумя предложениями: точка с запятой до, запятая после."
      ],
      items: [
        { kind: "mcq", chk: 2,
          text: "The delegates at the 1884 conference could have chosen any meridian as the starting point for the whole ______ selected runs through the Royal Observatory at Greenwich, in London.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["world, the line they", "world the line they", "world. The line they", "world the line, they"], key: 2,
          ru: "Здесь два полных предложения: «The delegates… could have chosen…» и «The line they selected runs…». Между ними нужна точка. Одна запятая даёт comma splice, отсутствие знака даёт слитное предложение. Запятая после «line» ничего не разделяет и рвёт подлежащее «the line they selected»." },
        { kind: "mcq", chk: 2,
          text: "In October 1884, delegates from twenty-five nations met in Washington, D.C., to settle a question of geography. They fixed the meridian from which longitude is ______ they did not create the world's time zones, which governments introduced one by one over the following decades.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["measured, however,", "measured; however,", "measured, however;", "measured however"], key: 1,
          ru: "По обе стороны пропуска полные предложения: «They fixed…» и «they did not create…». However противопоставляет второе первому, значит оно относится ко второму: точка с запятой до, запятая после. Две запятые не могут соединить два предложения. Вариант «measured, however;» привязывает however к первому предложению, но оно ничему не противоречит: делегаты собрались решить вопрос и решили его." },
        { kind: "mcq", chk: 2,
          text: "One of the strongest voices for reform came from outside astronomy. Sandford ______ had argued for years that the world needed one system of standard time.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["Fleming, a Canadian railway engineer,", "Fleming, a Canadian railway engineer—", "Fleming—a Canadian railway engineer,", "Fleming a Canadian railway engineer"], key: 0,
          ru: "«A Canadian railway engineer» — вставка: без неё предложение остаётся целым («Sandford Fleming had argued…»). Вставку выделяют парой одинаковых знаков, здесь двумя запятыми. Запятая с тире и тире с запятой не образуют пары. Без знаков вставка сливается с подлежащим." },
        { kind: "mcq", chk: 2,
          text: "Because the Earth turns through 360 degrees in twenty-four ______ a difference of fifteen degrees of longitude corresponds to a difference of one hour.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["hours;", "hours.", "hours", "hours,"], key: 3,
          ru: "«Because the Earth turns… in twenty-four hours» — придаточное, оно не может стоять отдельно. После придаточного в начале предложения нужна запятая. Точка и точка с запятой превращают его в обрывок (fragment). Без знака придаточное сливается с главным предложением." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "Long sentences, clear parts",
      ru: "В тексте много сложных предложений: главная часть плюс придаточные с because, although, which, so that. Четыре утверждения TRUE / FALSE / NOT GIVEN и два вопроса с выбором. Когда предложение длинное, сначала найди главную часть: ту, что может стоять одна.",
      passageTitle: "The Line That Bends",
      passage: [
        "Because the Earth turns through fifteen degrees of longitude every hour, the world can be divided into twenty-four time zones, each one hour apart from its neighbours. In theory, the boundaries between adjacent zones are straight lines running from pole to pole. In practice they rarely are, since governments prefer a boundary that coincides with a national or regional border.",
        "The system needed a starting point, and any choice was bound to be arbitrary, because no meridian is marked by nature. In October 1884, delegates from twenty-five nations met in Washington to settle the question. They voted to adopt the meridian that passes through Greenwich, in London, which most ships' charts already used. France abstained from the vote and continued to set its clocks by Paris until 1911.",
        "On the opposite side of the globe lies the International Date Line, where each calendar day begins. Although it roughly follows the 180th meridian, it deviates from that line in several places so that island groups are not split between two dates. Unlike the prime meridian, the date line was never fixed by an international conference; it is only a convention, and individual states have moved it. In 1995 Kiribati, whose islands span a wide stretch of the Pacific, shifted the line eastwards so that the whole country would share one day. Samoa made a similar change in 2011, when it skipped 30 December altogether in order to match the calendars of its main trading partners."
      ],
      items: [
        { kind: "tfng", chk: 2, stem: "Most boundaries between time zones are straight lines from pole to pole.", key: "F",
          ru: "FALSE. Прямые линии только «in theory». Дальше: «In practice they rarely are». Rarely противоречит слову most." },
        { kind: "tfng", chk: 2, stem: "Britain sent more delegates to the conference than any other nation.", key: "NG",
          ru: "NOT GIVEN. Текст называет число стран, но не говорит, сколько делегатов прислала каждая. То, что выбрали британский меридиан, ничего не сообщает о размере делегаций." },
        { kind: "tfng", chk: 2, stem: "France started to use Greenwich as the basis of its time immediately after the 1884 vote.", key: "F",
          ru: "FALSE. Франция «continued to set its clocks by Paris until 1911», то есть ещё много лет жила по Парижу." },
        { kind: "tfng", chk: 2, stem: "No international conference has ever fixed the position of the International Date Line.", key: "T",
          ru: "TRUE. «Was never fixed by an international conference; it is only a convention». Утверждение повторяет текст почти дословно, меняется только форма глагола." },
        { kind: "mcq", chk: 2, stem: "According to the passage, Kiribati moved the date line so that", key: 0,
          opts: ["all of its islands would have the same date", "its calendar would match that of its trading partners", "the line would follow the 180th meridian more closely", "it would no longer need more than one time zone"],
          ru: "«So that the whole country would share one day» = у всех островов одна дата. Торговые партнёры — причина Самоа, а не Кирибати. Линия после сдвига отклоняется от 180-го меридиана сильнее, а не слабее. О числе часовых поясов Кирибати текст не говорит." },
        { kind: "mcq", chk: 2, stem: "In the sentence beginning “Although it roughly follows”, which words form the main clause (the part that could stand alone as a sentence)?", key: 1,
          opts: ["Although it roughly follows the 180th meridian", "it deviates from that line in several places", "so that island groups are not split between two dates", "the 180th meridian"],
          ru: "Главная часть: «it deviates from that line in several places». В ней есть подлежащее и сказуемое, и она понятна одна. Части с although и so that — придаточные: без главной части они обрываются. «The 180th meridian» — просто словосочетание без сказуемого." }
      ] },

    { type: "speaking", id: "speak", label: "IELTS-style · Speaking Part 1", title: "Answer, then a reason",
      ru: "Ответь вслух на каждый вопрос двумя-тремя предложениями: ответ и причина в одном сложном предложении (because, although, which, so that), потом пример. Используй минимум два слова урока. Можно записать себя: запись остаётся только на этом устройстве.",
      prompts: [
        "Do you ever need to know what time it is in another country? Why?",
        "Would you like to live in a country with several time zones? Why or why not?",
        "Is it easy for you to get used to a new daily schedule?"
      ],
      prep: 20, talk: 90,
      pron: { title: "Pronunciation: the pause between clauses", ru: "В сложном предложении голос идёт вверх в конце придаточного, потом короткая пауза, и вниз в конце главной части. Пауза работает как запятая. Сначала произнеси слова с верным ударением, потом фразы.",
        items: ["BOUN-da-ry", "AR-bi-tra-ry", "a-DOPT", "ad-JA-cent", "con-VEN-tion", "co-in-CIDE", "DE-vi-ate", "Although my cousin lives abroad, ↗ | we talk every week. ↘", "Because the country is so wide, ↗ | the sun rises later in the west. ↘"] },
      model: "I often need to know the time in another country because my cousin studies in Germany, which is several hours behind us. Although Kazakhstan spans a huge distance from east to west, the whole country adopted a single time zone in 2024, so I never cross a time boundary at home. The choice may look arbitrary, since the sun rises much later in the west, but I find it convenient." },

    { type: "writing", id: "write", label: "Writing micro-task", title: "Combine four short sentences",
      ru: "Соедини четыре коротких предложения в одно или два сложных. Используй минимум два союза из списка: although, because, which, so that. Ни одна мысль не должна пропасть. В IELTS Writing за такие предложения ставят баллы по критерию Grammatical Range and Accuracy, но только если на стыках нет ошибок.",
      prompts: [
        "The International Date Line roughly follows the 180th meridian.",
        "It deviates from the meridian in several places.",
        "Some island groups span both sides of the meridian.",
        "Governments want every island to share the same date."
      ],
      minWords: 25,
      checklist: ["В ответе одно или два предложения, и все четыре мысли на месте.", "Я использовал(а) минимум два союза: although, because, which, so that.", "После придаточного в начале предложения стоит запятая.", "Два полных предложения нигде не соединены одной запятой.", "Смысл тот же: ничего не добавлено и не потеряно."],
      model: [
        "Although the International Date Line roughly follows the 180th meridian, it deviates from it in several places, because some island groups span both sides of the meridian and governments want every island to share the same date.",
        "Another way: The International Date Line, which roughly follows the 180th meridian, deviates from it in several places. It does so because governments want island groups that span both sides of the meridian to share the same date."
      ] },

    { type: "questions", id: "exit", label: "Exit check", title: "Two questions before you go",
      ru: "По одному вопросу на каждый экзамен. Без подсказок.",
      items: [
        { kind: "mcq", chk: 2,
          text: "A traveller who crosses the International Date Line has to correct one ______ the date, which moves forward by a day on a westward crossing and back by a day on an eastward one.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["thing;", "thing:", "thing.", "thing"], key: 1,
          ru: "До пропуска полное предложение, после него пояснение, что это за «one thing»: нужно двоеточие. После точки с запятой или точки должно стоять полное предложение, а «the date, which moves…» — только существительное с придаточным. Без знака «one thing the date» сливается." },
        { kind: "mcq", chk: 2,
          stem: "Which sentence is written correctly?",
          opts: ["Kiribati moved the date line, its islands had been split between two dates.", "Kiribati moved the date line. Because its islands had been split between two dates.", "Kiribati moved the date line because its islands had been split between two dates.", "Kiribati moved the date line because, its islands had been split between two dates."], key: 2,
          ru: "Главная часть плюс придаточное с because в конце: запятая не нужна. В первом варианте два полных предложения соединены одной запятой (comma splice). Во втором придаточное с because стоит отдельно и обрывается (fragment). В четвёртом запятая отрывает союз от его придаточного." }
      ] }
  ],
  handoff: { text: "A line on the map told every country what day it was. Next, the trains that forced whole towns to agree on the hour.", next: "C03" }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C03 = {
  id: "C03",
  title: "Railway Time",
  thread: "Trains forced towns to agree on one clock.",
  intro: "Сегодня форма слова: согласование подлежащего и сказуемого, время глагола, its и it's. На SAT это Form, Structure, and Sense. В IELTS Writing это вторая половина критерия Grammatical Range and Accuracy: точность. В прошлом уроке линии на карте поделили мир на часовые пояса. Сегодня история о том, откуда взялось единое время: его потребовали поезда.",
  words: [
    { w: "uniform", pos: "adj.", ru: "единый, единообразный",
      sat: "The bricks are nearly uniform in size, which suggests that they were shaped in the same mould.",
      ielts: "Some people believe that all schools should follow a uniform curriculum." },
    { w: "discrepancy", pos: "n.", ru: "расхождение, несоответствие",
      sat: "A discrepancy between the two accounts led the historian to consult a third source.",
      ielts: "There is a clear discrepancy between what the advertisement promises and what customers receive." },
    { w: "impose", pos: "v.", ru: "вводить (правило), навязывать",
      sat: "The editor imposed a strict limit of two thousand words on every contribution.",
      ielts: "Some governments have imposed a tax on sugary drinks." },
    { w: "resist", pos: "v.", ru: "сопротивляться",
      sat: "The villagers resisted the plan for years, fearing that the new road would divide their fields.",
      ielts: "Many people resist change at work, even when it would help them." },
    { w: "prevail", pos: "v.", ru: "возобладать, взять верх",
      sat: "After a long debate, the more cautious view prevailed, and the expedition was postponed.",
      ielts: "In the end common sense prevailed, and the two sides reached an agreement." },
    { w: "synchronize", pos: "v.", ru: "синхронизировать, согласовывать по времени",
      sat: "The dancers synchronized their movements so closely that they seemed to share a single shadow.",
      ielts: "The traffic lights on the main road are synchronized to keep cars moving." },
    { w: "gradual", pos: "adj.", ru: "постепенный",
      sat: "The shift in the author's style was gradual, visible only when early and late works are set side by side.",
      ielts: "There has been a gradual increase in the number of people working from home." },
    { w: "abandon", pos: "v.", ru: "отказаться, оставить",
      sat: "The team abandoned its first hypothesis when the new measurements contradicted it.",
      ielts: "Many farmers have abandoned traditional methods in favour of machines." }
  ],
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Form, Structure, and Sense",
      ru: "Слова во всех вариантах одни и те же, меняется только форма. Для глагола найди подлежащее и слова, которые задают время. Для its и their найди слово, которое они заменяют.",
      rule: [
        "Найди подлежащее и убери всё, что стоит между ним и глаголом: the clocks in a typical town → were.",
        "Время глагола задают маркеры и соседние глаголы: in 1840, before, until. Законченное прошлое — Past Simple.",
        "Its = принадлежность, it's = it is. Company, railway, each town — единственное число: its."
      ],
      items: [
        { kind: "mcq", chk: 2,
          text: "In the 1830s, the clocks in a typical British town ______ set by the sun, so that noon arrived a few minutes later in each town farther west.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["was", "were", "is", "has been"], key: 1,
          ru: "Подлежащее — «the clocks» (множественное число), а «in a typical British town» стоит между ним и глаголом как ловушка. «In the 1830s» и «arrived» требуют прошедшего времени: were. Was, is и has been согласованы с единственным числом, а is и has been ещё и не подходят по времени." },
        { kind: "mcq", chk: 2,
          text: "Before the railways arrived, a difference of ten minutes between London time and Bristol time ______ little: no one could travel fast enough to notice it.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["matters", "has mattered", "mattered", "will matter"], key: 2,
          ru: "«Before the railways arrived» и «could travel» описывают законченное прошлое, нужен Past Simple: mattered. Matters — настоящее время. Has mattered связывает прошлое с настоящим, а речь о периоде, который закончился. Will matter — будущее." },
        { kind: "mcq", chk: 2,
          text: "In November 1840, the Great Western Railway began to keep London time at every station on ______ line.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["their", "it's", "they're", "its"], key: 3,
          ru: "Линия принадлежит одной компании: «the Great Western Railway» — единственное число, значит its. It's = it is, they're = they are: это не принадлежность. Their требует множественного числа, а здесь одна компания: the Great Western Railway." },
        { kind: "mcq", chk: 2,
          text: "From 1852 the Royal Observatory at Greenwich could send the time itself along a wire. The electric telegraph, ______ a signal from Greenwich to stations across the country, made a single railway time practical.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["carrying", "carried", "carries", "it carried"], key: 0,
          ru: "У предложения уже есть сказуемое: «The electric telegraph… made». Между запятыми нужна не вторая личная форма глагола, а причастный оборот: carrying. Carried и carries дают второе сказуемое без союза. «It carried» вставляет целое предложение внутрь другого." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "Accurate forms in a real text",
      ru: "Читай и следи за формами: кто выполняет действие и когда. Четыре утверждения TRUE / FALSE / NOT GIVEN и два вопроса с выбором. Отвечай только по тексту.",
      passageTitle: "When Noon Moved",
      passage: [
        "Until the 1840s, every town in Britain kept its own time. Clocks were set by the sun, so noon in Bristol arrived about ten minutes later than noon in London. The discrepancy troubled nobody, because even the fastest coach needed many hours to travel between the two cities.",
        "The railways changed this. A train could now cross much of the country in a single day, and a timetable based on dozens of local times was confusing for passengers and could even be dangerous. In November 1840 the Great Western Railway began to keep London time at all its stations. Other companies followed, and in 1847 the Railway Clearing House, a body set up by the companies themselves, recommended that every railway adopt Greenwich time.",
        "Uniform time could not simply be imposed on the towns, however. Some of them resisted and went on keeping local time, and for a period some public clocks displayed both times at once. A clock in Bristol still carries two minute hands as a reminder. The change was gradual, but railway time prevailed. From 1852 the electric telegraph allowed clocks far from London to be synchronized with a signal sent from Greenwich, and by the middle of the 1850s most towns had abandoned local time. The law changed last: only in 1880 did Parliament make Greenwich time the legal time for the whole of Great Britain."
      ],
      items: [
        { kind: "tfng", chk: 2, stem: "Before the railways, the difference between London time and Bristol time caused no practical problems.", key: "T",
          ru: "TRUE. «The discrepancy troubled nobody»: расхождение никому не мешало. «Troubled nobody» = «caused no practical problems»." },
        { kind: "tfng", chk: 2, stem: "The Great Western Railway was the last railway company to change to London time.", key: "F",
          ru: "FALSE. После неё «other companies followed», значит она была среди первых, а не последней." },
        { kind: "tfng", chk: 2, stem: "The Railway Clearing House fined companies that went on using local time.", key: "NG",
          ru: "NOT GIVEN. В тексте только «recommended». О штрафах или других наказаниях ничего не сказано." },
        { kind: "tfng", chk: 2, stem: "Parliament made Greenwich time the legal time before most towns had started to use it.", key: "F",
          ru: "FALSE. Порядок обратный: большинство городов отказались от местного времени к середине 1850-х, а закон появился последним, в 1880 году. «The law changed last»." },
        { kind: "mcq", chk: 2, stem: "The clock in Bristol is mentioned as an example of", key: 2,
          opts: ["a clock that was synchronized by telegraph", "the danger of confusing timetables", "a public clock that showed local time and railway time together", "a clock whose time was fixed by Parliament"],
          ru: "Предложение о Бристоле идёт сразу после слов «some public clocks displayed both times at once» и поясняет их: две минутные стрелки показывали два времени. Телеграф и закон упомянуты позже и с этими часами не связаны. Опасность расписаний — тема второго абзаца." },
        { kind: "mcq", chk: 2, stem: "In the first sentence, the word “its” refers to", key: 0,
          opts: ["every town", "Britain", "the sun", "London"],
          ru: "«Every town in Britain kept its own time»: своё время было у каждого города. Every town — единственное число, поэтому its, а не their. Britain стоит ближе к its, но у всей страны как раз не было одного времени." }
      ] },

    { type: "speaking", id: "speak", label: "IELTS-style · Speaking Part 2", title: "A past event, accurate tenses",
      ru: "Расскажи историю из прошлого. Минуту готовься и запиши четыре-пять ключевых слов, потом говори до двух минут. Следи за временами: основные события в Past Simple, фон в Past Continuous, то, что случилось раньше, в Past Perfect. Можно записать себя: запись остаётся только на этом устройстве.",
      prompts: [
        "Describe a time when you were late, or nearly late, for something important.",
        "You should say: what the event was",
        "why you were late or nearly late",
        "what happened in the end",
        "and explain what you learned from it."
      ],
      prep: 60, talk: 120,
      pron: { title: "Pronunciation: the three sounds of -ed", ru: "Окончание -ed читается тремя способами: /t/ после глухого звука, /d/ после звонкого, /ɪd/ после t и d. Лишний слог появляется только в третьем случае. Произнеси каждое слово три раза.",
        items: ["missed /t/ (один слог)", "checked /t/ (один слог)", "arrived /d/", "im-POSED /d/", "pre-VAILED /d/", "a-BAN-doned /d/", "SYN-chro-nized /d/", "re-SIST-ed /ɪd/", "WAIT-ed /ɪd/", "dis-CREP-an-cy", "U-ni-form", "GRAD-u-al"] },
      model: "Last spring I nearly missed a train to Almaty, where my class was going on a school trip. I had set an alarm, but my watch was slow, so there was a discrepancy of about five minutes between it and the station clock. When I arrived, the other students were already boarding, and I ran along the platform with my bag. I got on just before the doors closed. Since then I have abandoned the habit of leaving at the last moment. I have also synchronized my watch with my phone, and the change in my habits was not gradual at all: it happened that morning." },

    { type: "writing", id: "write", label: "Writing micro-task", title: "Correct your own paragraph",
      ru: "Напиши один абзац из четырёх-пяти предложений в прошедшем времени. Потом перечитай его три раза, каждый раз с одной целью: сначала глаголы и их подлежащие, потом времена, потом its, their и окончания. Исправь всё, что найдёшь, и только после этого открой образец.",
      prompts: ["How did the railways change the way British towns kept time?"],
      minWords: 50,
      checklist: ["У каждого глагола я нашёл(ла) подлежащее и проверил(а) число: a town keeps, towns keep.", "События 1840-х стоят в прошедшем времени, без случайного перехода в настоящее.", "То, что случилось раньше другого прошедшего события, стоит в Past Perfect (had + третья форма).", "Its без апострофа для принадлежности; it's только там, где можно сказать it is.", "Я использовал(а) минимум три слова урока."],
      model: [
        "Before the railways, each British town kept its own time, and nobody had worried about the discrepancy between one town clock and the next. Fast trains made these differences a problem, so the railway companies imposed a uniform time on their stations. Some towns resisted at first. The change was gradual, but railway time prevailed, and by the middle of the 1850s most towns had abandoned local time."
      ] },

    { type: "questions", id: "exit", label: "Exit check", title: "Two questions before you go",
      ru: "По одному вопросу на каждый экзамен. Без подсказок.",
      items: [
        { kind: "mcq", chk: 2,
          text: "Among the reminders of that period ______ a clock in Bristol with two minute hands, one for local time and one for railway time.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          opts: ["are", "is", "were", "have been"], key: 1,
          ru: "Порядок слов обратный: подлежащее стоит после глагола. Это «a clock» (единственное число), а не «reminders», которое входит в оборот с among. Значит is. Are, were и have been согласованы со множественным числом." },
        { kind: "mcq", chk: 2,
          stem: "Which sentence is grammatically accurate?",
          opts: ["Before the railways came, every town kept its own time.", "Before the railways came, every town have kept its own time.", "Before the railways came, every town keeps its own time.", "Before the railways came, every town kept it's own time."], key: 0,
          ru: "Законченное прошлое: kept, как и came. Принадлежность: its без апострофа. «Have kept» не согласовано с every town и не подходит по времени. «Keeps» переходит в настоящее время. «It's» = it is." }
      ] }
  ],
  handoff: { text: "The railways gave a whole country one clock. Next, a clock accurate enough to tell a ship where it is.", next: "C04" }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C04 = {
  id: "C04",
  title: "The Clock That Found Longitude",
  thread: "To know where you are, know what time it is.",
  intro: "Сегодня логические связки. На SAT это Transitions: выбрать слово, которое верно соединяет две мысли. В IELTS Writing это критерий Coherence and Cohesion, а в Reading связки помогают следить за ходом мысли. Все тексты урока о том, как часы решили задачу, которую не решили карты.",
  words: [
    { w: "consequently", pos: "adv.", ru: "следовательно, в результате",
      sat: "The archive flooded in 1911; consequently, few of the town's early records remain.",
      ielts: "Rents have risen sharply; consequently, many young people live with their parents." },
    { w: "nevertheless", pos: "adv.", ru: "тем не менее",
      sat: "The evidence was thin. Nevertheless, the hypothesis attracted wide support.",
      ielts: "Online courses are convenient. Nevertheless, many students prefer a classroom." },
    { w: "likewise", pos: "adv.", ru: "подобным образом",
      sat: "The northern towns relied on trade; the southern ones, likewise, depended on their ports.",
      ielts: "Schools should teach cooking. Likewise, they should teach basic finance." },
    { w: "whereas", pos: "conj.", ru: "тогда как",
      sat: "The first draft is cautious, whereas the published version makes far bolder claims.",
      ielts: "Some people save most of their income, whereas others spend it immediately." },
    { w: "precise", pos: "adj.", ru: "точный",
      sat: "The instrument was precise enough to detect a change of one part in a million.",
      ielts: "It is hard to give a precise figure for the number of tourists." },
    { w: "determine", pos: "v.", ru: "определять, устанавливать",
      sat: "The researchers sought to determine whether the pattern held across species.",
      ielts: "Family income often helps to determine which university a student chooses." },
    { w: "reluctant", pos: "adj.", ru: "делающий неохотно, не желающий",
      sat: "Reluctant to abandon the older theory, the committee asked for further data.",
      ielts: "Many employees are reluctant to work at weekends." },
    { w: "compensate", pos: "v.", ru: "компенсировать",
      sat: "The mechanism compensates for changes in temperature, so the clock's rate stays steady.",
      ielts: "A higher salary may compensate for long working hours." }
  ],
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Transitions",
      ru: "Закрой варианты. Определи отношение между двумя мыслями: то же направление, поворот, причина и следствие или пример. Потом выбери связку с этим отношением.",
      rule: [
        "Четыре основных отношения: добавление (likewise, moreover), контраст (however, nevertheless, by contrast), следствие (consequently, therefore), пример (for example).",
        "Nevertheless = «несмотря на сказанное». Вторая мысль неожиданна после первой.",
        "Ловушка: связка верна по теме, но показывает не то отношение."
      ],
      items: [
        { kind: "mcq", chk: 2,
          text: "At sea, sailors could find their latitude by measuring the height of the sun at noon. ______ no comparable method existed for longitude, so ships often had little idea how far east or west they had travelled.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["Likewise,", "By contrast,", "For example,", "As a result,"], key: 1,
          ru: "Для широты способ был, для долготы не было: это противопоставление, By contrast. Likewise означало бы сходство. For example не подходит: вторая мысль не пример первой. As a result неверно: отсутствие способа для долготы не следует из способа для широты." },
        { kind: "mcq", chk: 2,
          text: "The Earth turns through 15 degrees of longitude every hour. ______ a navigator who knows both the time at a fixed reference point and the local time on board can calculate the ship's longitude.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["Nevertheless,", "Consequently,", "Similarly,", "Instead,"], key: 1,
          ru: "Из первого факта следует второй: раз Земля поворачивается на 15° в час, разница во времени даёт долготу. Это следствие: Consequently. Nevertheless и Instead показывают поворот, которого здесь нет. Similarly требует двух похожих случаев." },
        { kind: "mcq", chk: 2,
          text: "Pendulum clocks of the early 1700s kept excellent time on land. On a rolling ship, ______ their pendulums swung irregularly, and the clocks quickly became useless.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["therefore,", "for instance,", "however,", "in addition,"], key: 2,
          ru: "На суше часы точны, в море бесполезны: контраст, however. Therefore означало бы, что бесполезность следует из точности. For instance и in addition продолжают мысль в том же направлении." },
        { kind: "mcq", chk: 2,
          text: "Harrison's fourth timekeeper performed remarkably on its trial voyage of 1761–62, losing only a few seconds over many weeks at sea. ______ the Board of Longitude hesitated to award the full prize, demanding further trials.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["Accordingly,", "Nevertheless,", "In other words,", "Moreover,"], key: 1,
          ru: "Часы сработали отлично, но приз не дали: результат неожиданный, Nevertheless. Accordingly означало бы, что отказ логично следует из успеха. In other words вводит пересказ. Moreover добавляет довод в ту же сторону." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "Follow the links",
      ru: "В IELTS связки не спрашивают напрямую, но по ним видно, куда идёт мысль. Здесь три утверждения TRUE / FALSE / NOT GIVEN и два вопроса о том, как части текста связаны между собой.",
      passageTitle: "A Carpenter and the Longitude Prize",
      passage: [
        "In 1714 the British Parliament offered a reward of up to £20,000 to anyone who could find a practical way of determining longitude at sea. The problem was serious. Until it was solved, ships regularly lost their position, and voyages ended in delay or disaster.",
        "Most scholars expected the answer to come from astronomy. John Harrison, a carpenter who had taught himself clockmaking, believed otherwise. If a clock could keep the time of the home port accurately throughout a voyage, he reasoned, a navigator could compare it with local time and work out the ship's position. The difficulty was that no existing clock could do this: changes in temperature and the motion of the ship disturbed every mechanism then known.",
        "Harrison spent decades on the task. His first three machines were large and complex, whereas the fourth, completed in 1759, resembled an oversized pocket watch. On a voyage to Jamaica in 1761–62 it lost only a few seconds. Nevertheless, the officials in charge of the prize were reluctant to accept that a mechanical device had succeeded where astronomy had not, and they demanded further tests. It was 1773, and Harrison was eighty years old, before the matter was finally settled."
      ],
      items: [
        { kind: "tfng", chk: 2, stem: "The reward was offered for a method of finding longitude that would work on ships.", key: "T",
          ru: "TRUE. «A practical way of determining longitude at sea» = способ, который работает на кораблях." },
        { kind: "tfng", chk: 2, stem: "Most scholars agreed with Harrison that a clock would solve the problem.", key: "F",
          ru: "FALSE. Учёные ждали ответа от астрономии, а Харрисон «believed otherwise». Otherwise показывает, что мнения расходились." },
        { kind: "tfng", chk: 2, stem: "Harrison's fourth timekeeper was bigger than his first three.", key: "F",
          ru: "FALSE. Первые три «large», whereas четвёртый похож на карманные часы. Whereas = противопоставление." },
        { kind: "tfng", chk: 2, stem: "Harrison built his fourth timekeeper in Jamaica.", key: "NG",
          ru: "NOT GIVEN. Ямайка упомянута как цель плавания. Где часы были сделаны, текст не сообщает." },
        { kind: "mcq", chk: 2, stem: "In the second paragraph, “do this” refers to", key: 1,
          opts: ["comparing local time with the time at home", "keeping the home port's time accurately during a voyage", "resisting changes in temperature", "finding a ship's latitude"],
          ru: "«This» отсылает к условию из предыдущего предложения: «keep the time of the home port accurately throughout a voyage». Сравнивать время должен штурман, а не часы." },
        { kind: "mcq", chk: 2, stem: "The word “Nevertheless” in the final paragraph shows that the officials' reaction", key: 1,
          opts: ["was a natural result of the successful voyage", "was unexpected after the successful voyage", "repeated a point made earlier", "was an example of the clock's accuracy"],
          ru: "Nevertheless = несмотря на успех. Реакция чиновников идёт против ожидания, а не следует из результата." }
      ] },

    { type: "speaking", id: "speak", label: "IELTS-style · Speaking Part 3", title: "Opinion, then a concession",
      ru: "Ответь вслух за полторы минуты. План: мнение → причина → уступка со словом nevertheless или whereas → вывод. Можно записать себя: запись остаётся только на этом устройстве.",
      prompts: [
        "Some people say that technology has made traditional skills, such as reading a paper map, unnecessary. Do you agree?",
        "Follow-up: Which traditional skill do you think is still worth learning? Why?"
      ],
      prep: 30, talk: 90,
      pron: { title: "Pronunciation: stress and the pause after a link", ru: "После связки в начале предложения делай короткую паузу. Она работает как запятая. Сначала произнеси слова, потом фразы.",
        items: ["CON-se-quent-ly", "nev-er-the-LESS", "LIKE-wise", "where-AS", "Nevertheless, | I still think it is worth learning.", "Consequently, | fewer people can do it."] },
      model: "I partly agree. Phones can now determine our position in seconds; consequently, few people need to read a paper map in daily life. Nevertheless, I think the skill is still worth having, because a phone can lose its signal, whereas a map never does." },

    { type: "writing", id: "write", label: "Writing micro-task", title: "One paragraph, three links",
      ru: "Напиши один абзац из четырёх-пяти предложений. Используй три связки: одну на контраст, одну на причину или следствие, одну на добавление. Не начинай с них каждое предложение.",
      prompts: ["Why did some officials doubt Harrison's clock even after it had worked?"],
      minWords: 50,
      checklist: ["В абзаце есть связка контраста.", "В абзаце есть связка причины или следствия.", "В абзаце есть связка добавления.", "После связки в начале предложения стоит запятая.", "Каждая связка показывает настоящее отношение между мыслями."],
      model: [
        "Harrison's clock kept almost perfect time on its trial voyage. Nevertheless, many officials doubted it, because they had long expected the solution to come from astronomy. In addition, a single successful voyage might have been luck. Consequently, they asked for more tests before paying the reward."
      ] },

    { type: "questions", id: "exit", label: "Exit check", title: "Two questions before you go",
      ru: "По одному вопросу на каждый экзамен. Без подсказок.",
      items: [
        { kind: "mcq", chk: 2,
          text: "Harrison's fourth timekeeper was small enough to hold in two hands. The first three, ______ were bulky machines that had to be mounted in their own frames.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["by contrast,", "therefore,", "for example,", "likewise,"], key: 0,
          ru: "Маленький четвёртый и громоздкие первые три: противопоставление, by contrast. Likewise означало бы сходство. Therefore и for example не передают контраст." },
        { kind: "mcq", chk: 2,
          stem: "Which sentence links the two ideas logically?",
          opts: ["The clock worked; consequently, the officials wanted more tests.", "The clock worked; nevertheless, the officials wanted more tests.", "The clock worked; likewise, the officials wanted more tests.", "The clock worked; for instance, the officials wanted more tests."], key: 1,
          ru: "Часы сработали, но проверок потребовали ещё: вторая мысль идёт против ожидания, nevertheless. Consequently сделало бы новые проверки следствием успеха." }
      ] }
  ],
  handoff: { text: "A clock turned time into position. Next, a census turns a country into a table.", next: "C05" }
};
