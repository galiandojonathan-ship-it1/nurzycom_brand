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
    { id: "C01", code: "WIC", block: "A", status: "live", title: "The Map That Leaves Things Out", thread: "A map is useful because of what it omits.",
      shared: "Word in context · paraphrase", sat: "Words in Context", ielts: "Reading: recognising paraphrase", speak: "Part 1 · short answers", write: "Paraphrase two sentences" },
    { id: "C02", code: "BND", block: "A", status: "live", title: "Where One Zone Ends", thread: "A line on the map decides what time it is.",
      shared: "Sentence boundaries", sat: "Boundaries", ielts: "Writing GRA: complex sentences", speak: "Part 1 · answer + reason", write: "Combine four short sentences" },
    { id: "C03", code: "FSS", block: "A", status: "live", title: "Railway Time", thread: "Trains forced towns to agree on one clock.",
      shared: "Form and agreement", sat: "Form, Structure, and Sense", ielts: "Writing GRA: accuracy", speak: "Part 2 · a past event", write: "Correct your own paragraph" },
    { id: "C04", code: "TRN", block: "A", status: "live", title: "The Clock That Found Longitude", thread: "To know where you are, know what time it is.",
      shared: "Logical links", sat: "Transitions", ielts: "Writing CC: cohesive devices", speak: "Part 3 · opinion + concession", write: "One paragraph, three links" },
    { id: "C05", code: "RS", block: "B", status: "live", title: "Counting Everyone", thread: "A census turns a country into a table.",
      shared: "Selecting facts for a goal", sat: "Rhetorical Synthesis", ielts: "Writing Task 1: the overview", speak: "Describe a trend aloud", write: "One overview sentence" },
    { id: "C06", code: "COEQ", block: "B", status: "live", title: "The Pump on Broad Street", thread: "A map of marks became an argument.",
      shared: "Data as evidence", sat: "Command of Evidence (quantitative)", ielts: "Writing Task 1: comparisons", speak: "Compare two figures aloud", write: "Two comparison sentences" },
    { id: "C07", code: "CID", block: "B", status: "live", title: "The Diagram That Changed a Hospital", thread: "One picture carried the main idea.",
      shared: "Main idea and detail", sat: "Central Ideas and Details", ielts: "Reading: Yes / No / Not Given · matching endings", speak: "Part 2 · structure", write: "A topic sentence" },
    { id: "C08", code: "TSP", block: "B", status: "live", title: "How a Report Persuades", thread: "Order is part of the message.",
      shared: "Structure and purpose", sat: "Text Structure and Purpose", ielts: "Reading: matching information · Task 2 paragraph", speak: "Part 2 · two full minutes", write: "One body paragraph" },
    { id: "C09", code: "INF", block: "C", status: "live", title: "What the Data Does Not Say", thread: "The missing cases matter most.",
      shared: "Inference", sat: "Inferences", ielts: "Reading: diagram labels · Yes / No / Not Given", speak: "Part 3 · explain a cause", write: "Claim + reason + example" },
    { id: "C10", code: "COET", block: "C", status: "live", title: "What Changed in the Ward", thread: "A claim needs support that others accept.",
      shared: "Claim and support", sat: "Command of Evidence (textual)", ielts: "Writing Task 2: Task Response", speak: "Part 3 · point + example", write: "Support one claim" },
    { id: "C11", code: "CTC", block: "C", status: "live", title: "One Metre, Two Opinions", thread: "Standards help everyone and annoy someone.",
      shared: "Two points of view", sat: "Cross-Text Connections", ielts: "Task 2: discuss both views", speak: "Part 3 · compare views", write: "Introduction for a two-view essay" },
    { id: "C12", code: "LIS", block: "D", status: "live", title: "Follow the Voice", thread: "Back to the map: now you only hear it.",
      shared: "—", sat: "—", ielts: "Listening: directions on a map, predicting the answer type", speak: "Give directions aloud", write: "Notes from audio" },
    { id: "C13", code: "LIS", block: "D", status: "live", title: "A Lecture on Time", thread: "Signposts tell you where the speaker is going.",
      shared: "—", sat: "—", ielts: "Listening: lectures and signposting", speak: "Part 2 · retell the lecture", write: "Summary in three sentences" },
    { id: "C14", code: "SPK", block: "D", status: "live", title: "Say It Clearly", thread: "Stress and pauses are the punctuation of speech.",
      shared: "—", sat: "—", ielts: "Speaking: all three parts + pronunciation", speak: "Full recorded answer", write: "Self-review of the recording" },
    { id: "C15", code: "WRT", block: "D", status: "live", title: "Building the Essay", thread: "Every brick from lessons 2–11, in one piece.",
      shared: "—", sat: "—", ielts: "Writing Task 2 from the bricks (inside the course only)", speak: "Part 3", write: "Full Task 2 essay" },
    { id: "C16", code: "MIX", block: "E", status: "live", title: "Your Own Map", thread: "Draw the map of your errors. Decide what to leave out.",
      shared: "Mixed review", sat: "Mixed review + range", ielts: "Reading and Listening · mixed practice", speak: "Final recorded answer", write: "Personal error list" }
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

  /* Proposal only: short IELTS fragments inside the running SAT lessons. The live SAT course is not changed. */
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
          opts: ["exaggerate", "invent", "omit", "criticize"], key: 2,
          ru: "«Cannot show every street» и «the remaining ones» показывают, что часть объектов убрана. Это omit. Exaggerate не объясняет слово «remaining». Invent добавляет то, чего нет. Criticize не связано с задачей картографа." },
        { kind: "mcq", chk: 2,
          text: "Because the Earth's surface is curved and a page is flat, no map can render the planet without some compromise; each projection keeps certain properties true and sacrifices others.",
          stem: "As used in the text, what does the word “render” most nearly mean?",
          opts: ["surrender", "provide", "repeat", "represent"], key: 3,
          ru: "Карта изображает планету на плоскости: render = represent. Provide — частое значение render («render a service»), но карта не «предоставляет» планету. Surrender похоже только по форме. Repeat не подходит по смыслу." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Academic Reading", title: "A full passage, exam format",
      ru: "Это формат настоящего IELTS Academic: текст около 850 слов и 13 вопросов трёх типов. На экзамене на такой текст уходит около 20 минут. Засеки время. Отвечай только по тексту.",
      lettered: true,
      passageTitle: "The Art of Leaving Things Out",
      passage: [
        "Every map is a compromise. A map drawn at the same scale as the land it describes would be as large as that land, and therefore useless, so any map that can be held, folded or displayed must leave most of the world out. The choices involved are rarely neutral. A road atlas omits most footpaths; a geological survey may omit roads altogether. What a map leaves out reflects what its makers expect its readers to do with it, and a map that serves one purpose well is often poorly suited to another.",
        "For much of the history of public transport, however, maps tried to leave out as little as possible. The earliest maps of the London Underground, which opened in 1863, were essentially street maps with the railway lines drawn on top, because their designers assumed that passengers would want to see exactly where each line ran beneath the city. As the network expanded, the results became increasingly difficult to use. Stations in the crowded centre were squeezed into a tangle of lines and labels, while those in the suburbs were scattered across wide areas of almost empty paper.",
        "The solution came not from a professional cartographer but from an engineering draughtsman. In 1931, Harry Beck, who had been working in the Underground's signals office, sketched a new version in his spare time. His central insight was that a passenger travelling below ground cannot see the city and has little need to know its shape. What matters is the order of the stations, the points at which lines connect and the number of stops to a destination. Beck therefore drew each line as a series of straight segments running horizontally, vertically or at forty-five degrees, and he spaced the stations at roughly equal intervals, enlarging the congested centre and compressing the outer districts. Almost the only feature of the surface that he retained was the River Thames, which allowed passengers to orient themselves.",
        "Beck's idea was not entirely without precedent. Simplified diagrams of individual railway routes had appeared before, and electrical engineers had long relied on circuit diagrams that recorded connections rather than physical positions; critics have often compared Beck's design to just such a wiring plan. What was new was the decision to apply this logic to an entire network intended for the general public, a readership that might have been expected to find such an abstract image bewildering rather than helpful.",
        "Those responsible for the Underground's publicity did, at first, regard the design as too radical. Beck's proposal was initially turned down, but it was later tried with passengers, and the pocket edition appeared in 1933. The response from passengers was immediate and overwhelmingly favourable, and much larger print runs soon followed. Beck went on revising the diagram for many years, and its essential principles survive in the version displayed in stations today, even though the network it represents has grown considerably.",
        "The approach has since been imitated by transport systems around the world, but its success has not been universal. In 1972, New York introduced a subway map in the same spirit, designed by Massimo Vignelli and colleagues. Although it was admired by many designers, it was criticised by a large number of passengers, partly because it took liberties with the city's familiar geography: parks and streets did not appear in the shapes and positions that residents knew. By the end of the decade it had been replaced by a map that paid closer attention to the surface. The episode suggests that the appropriate degree of simplification depends on the readers. In a city whose street plan is widely known, a map that ignores it may be perceived less as a helpful abstraction than as a mistake.",
        "Even in London, the diagram's greatest strength is also its principal weakness. Because distances are deliberately distorted, two stations that appear far apart may be only a short walk from each other, while stations that seem close may be separated by a lengthy journey. Researchers who examined how passengers in London choose their routes found that many relied on the diagram even when a different route would have been quicker. The transport authority has also published supplementary maps showing walking times between nearby stations. These do not replace Beck's diagram; they simply restore some of the information it was designed to leave out. A map, in other words, can convey one kind of information clearly only by sacrificing another, and the most reliable maps are made by people who understand precisely what their readers can afford to lose."
      ],
      items: [
        { group: { title: "Questions 1–5", task: "The passage has seven paragraphs, A–G. Choose the correct heading for paragraphs B–F from the list of headings below.",
            ru: "Заголовков больше, чем абзацев: три лишние. Заголовок отражает главную мысль всего абзаца, а не одну деталь.",
            headings: ["A similar design that failed to win over its users", "Earlier ideas that pointed in the same direction", "Why the first maps became difficult to read", "Londoners who refused to accept the new diagram", "A design built around what travellers actually need", "From rejection to wide acceptance", "The cost of producing the first edition", "Why engineers rejected Beck's proposal"] },
          kind: "match", chk: 2, stem: "Paragraph B", key: 2,
          ru: "B: первые карты были уличными с линиями поверх, и с ростом сети ими стало трудно пользоваться: iii. Заголовок vii о цене не подходит: о деньгах в абзаце нет ни слова." },
        { kind: "match", chk: 2, stem: "Paragraph C", key: 4,
          ru: "C: Бек исходил из того, что нужно пассажиру под землёй: порядок станций, пересадки, число остановок: v." },
        { kind: "match", chk: 2, stem: "Paragraph D", key: 1,
          ru: "D: упрощённые схемы маршрутов и электрические схемы существовали раньше: ii. Ловушка viii: инженеры в абзаце упомянуты, но они ничего не отвергали." },
        { kind: "match", chk: 2, stem: "Paragraph E", key: 5,
          ru: "E: сначала отказ, потом пробный тираж и огромный успех: vi. Заголовок iv противоречит абзацу: пассажиры приняли схему сразу." },
        { kind: "match", chk: 2, stem: "Paragraph F", key: 0,
          ru: "F: похожая карта в Нью-Йорке не понравилась пассажирам, и её заменили: i." },

        { group: { title: "Questions 6–9", task: "Do the following statements agree with the information given in the passage? Write TRUE, FALSE or NOT GIVEN.",
            ru: "FALSE — текст говорит обратное. NOT GIVEN — текст об этом молчит. Свои знания не используй." },
          kind: "tfng", chk: 2, stem: "On the earliest Underground maps, the railway lines were shown on top of a map of the streets.", key: "T",
          ru: "TRUE. B: «street maps with the railway lines drawn on top». Shown on top of a map of the streets = тот же смысл другими словами." },
        { kind: "tfng", chk: 2, stem: "Beck was working as a professional mapmaker when he designed the diagram.", key: "F",
          ru: "FALSE. C: «not from a professional cartographer but from an engineering draughtsman». Mapmaker = cartographer, и текст это отрицает." },
        { kind: "tfng", chk: 2, stem: "Beck's diagram included more features of the city's surface than earlier Underground maps.", key: "F",
          ru: "FALSE. Ранние карты были уличными (B), а Бек оставил почти только Темзу (C). Значит, деталей поверхности стало меньше, а не больше." },
        { kind: "tfng", chk: 2, stem: "Vignelli's design was the first map ever produced for the New York subway.", key: "NG",
          ru: "NOT GIVEN. F сообщает, что карту Виньелли ввели в 1972 году, но не говорит, была ли она первой. Даже если ты знаешь ответ из жизни, в тексте его нет." },

        { group: { title: "Questions 10–13", task: "Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
            ru: "Ответы берутся из одного абзаца (здесь G) и пишутся словами из текста. Больше двух слов — ответ не засчитают." },
          kind: "gap", chk: 2, limit: 2, accept: ["short walk"],
          stem: "Because Beck's diagram distorts distances, two stations that look far apart may in fact be only a ______ from each other.",
          ru: "G: «may be only a short walk from each other». Два слова, ровно в лимите." },
        { kind: "gap", chk: 2, limit: 2, accept: ["diagram"],
          stem: "A study of how passengers choose routes in London found that many trusted the ______ even when another route was faster.",
          ru: "G: «many relied on the diagram even when a different route would have been quicker». Relied on = trusted. Слово map в этом месте текста не стоит, поэтому ответ diagram." },
        { kind: "gap", chk: 2, limit: 2, accept: ["walking times"],
          stem: "The transport authority has also produced additional maps that show ______ between stations that are close together.",
          ru: "G: «supplementary maps showing walking times between nearby stations». Additional = supplementary, close together = nearby." },
        { kind: "gap", chk: 2, limit: 2, accept: ["information", "the information"],
          stem: "These maps give back some of the ______ that the original diagram was intended to omit.",
          ru: "G: «restore some of the information it was designed to leave out». Give back = restore, omit = leave out." }
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
      model: "I use maps on my phone almost every day, mainly because the bus routes in my city change quite often. Last month a map helped me find a clinic in a district I had never visited. It was reliable, although it omitted a small side street and gave only an approximate walking time, so I still had to ask someone for directions." },

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
          opts: ["deliberate", "approximate", "reliable", "distorted"], key: 1,
          ru: "Опросили выборку, а не всех, значит цифры приблизительные: approximate. «Only reliable» нелогично: only вводит ограничение. Distorted означало бы, что цифры искажены, а текст говорит лишь о неполном охвате." },
        { kind: "tfng", chk: 2,
          text: "Beck drew every line as a straight segment and spaced the stations at even intervals, regardless of the real distances between them.",
          stem: "The gaps between stations on Beck's diagram reflect the real distances between them.", key: "F",
          ru: "FALSE. «Even intervals» = одинаковые промежутки. «Regardless of the real distances» = независимо от настоящих расстояний. Значит, промежутки их не отражают." }
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

    { type: "questions", id: "ielts", label: "IELTS-style · Academic Reading", title: "A full passage, exam format",
      ru: "Формат настоящего IELTS Academic: текст около 800 слов и 13 вопросов трёх типов. На экзамене на него уходит около 20 минут. Засеки время. Отвечай только по тексту.",
      lettered: true,
      passageTitle: "Drawing the Lines of Time",
      passage: [
        "Until the second half of the nineteenth century, time was a local matter. Each town set its clocks by the sun, declaring noon at the moment the sun stood highest in its own sky. Because the Earth turns through fifteen degrees of longitude every hour, a town only a short distance to the east reached noon a few minutes before its neighbour to the west, so the clocks of adjacent towns rarely agreed. For most people, this patchwork of local times posed no practical difficulty, since few journeys were rapid enough to expose its inconsistencies. A traveller on horseback could not move quickly enough for the gap between one town's noon and the next to matter.",
        "Railways changed that. A train could cover in an hour a distance that had once taken a day, and its timetable had to state when it would arrive at stations whose clocks disagreed. In North America the problem was especially acute: by the early 1880s, railway companies were working with dozens of different local times. On 18 November 1883, the railways of the United States and Canada adopted a system of standard time zones, each an hour apart. The change was made by the companies themselves, and in the United States it was not confirmed by federal law until 1918.",
        "The railways had solved a national problem, but a global one remained. Every country that wished to measure longitude needed a starting line, known as a prime meridian, and different nations used different ones. Since no meridian is marked by nature, any choice was bound to be arbitrary, a convention rather than a discovery. Engineers such as the Canadian Sandford Fleming argued that the world should agree on a single prime meridian and divide the globe into twenty-four zones of one hour each. His proposals were initially dismissed by some as impractical, but the rapid expansion of international telegraph and shipping networks made the case for coordination increasingly difficult to ignore.",
        "In October 1884, delegates from twenty-five nations met in Washington, D.C., to settle the question. They voted to adopt the meridian passing through the Royal Observatory at Greenwich, near London, partly because most of the world's shipping already relied on charts based on it. The decision was not unanimous: San Domingo, today the Dominican Republic, voted against, while France and Brazil abstained, and French civil time remained based on the Paris meridian until 1911. Moreover, the conference recommended a universal day for science and navigation but left the question of local time zones to individual governments, which adopted them gradually over the following decades.",
        "The boundaries of those zones are far less tidy than the theory suggests. If time zones followed longitude exactly, each would be a strip fifteen degrees wide running from pole to pole. In practice, governments prefer boundaries that coincide with national or regional borders, so the lines between adjacent zones bend, jog and occasionally jump. Some countries deliberately deviate from the zone their longitude would suggest. Spain lies largely west of Greenwich, yet it keeps the same time as Germany. China, whose territory extends across several conventional longitude bands, uses a single official time throughout. Kazakhstan offers a recent example: in March 2024, the country moved its eastern regions, including Almaty, one hour back so that the whole country would share one time.",
        "On the far side of the globe from Greenwich runs the International Date Line, across which the local calendar date generally changes. Unlike the prime meridian, the date line was never fixed by an international agreement. It roughly follows the 180th meridian but deviates from it in several places so that island groups are not split between two dates, and individual states have moved it to suit their own needs. At the turn of 1994–95, Kiribati, whose islands span a wide stretch of the Pacific, shifted the line eastwards to place all its islands on the same side of the boundary. In 2011, Samoa skipped 30 December altogether in order to align its calendar with those of its main trading partners.",
        "These adjustments show that the map of time is shaped as much by economics and politics as by astronomy. The sun still sets the basic rhythm of the day, but the boundaries that tell people what hour or what day it is are human decisions, drawn and redrawn for convenience. Astronomical precision, in other words, is only one consideration among many; commercial relationships, administrative convenience and national identity frequently carry greater weight. Behind every line on a time-zone map lies an argument about which neighbours matter most."
      ],
      items: [
        { group: { title: "Questions 1–4", task: "The passage has seven paragraphs, A–G. Which paragraph contains the following information? You may use any letter more than once.", paras: 7,
            ru: "Ищи не тему абзаца, а конкретную деталь, пересказанную другими словами. Одна буква может подойти к двум вопросам, а какие-то буквы не подойдут ни к одному." },
          kind: "match", chk: 2, stem: "a country that changed its calendar to match those of the countries it trades with", key: 5,
          ru: "F: Самоа пропустило 30 декабря, «to align its calendar with those of its main trading partners». Align = match, trading partners = countries it trades with." },
        { kind: "match", chk: 2, stem: "the reason why differences between local times did not matter before a new form of transport", key: 0,
          ru: "A: путешественник на лошади «could not move quickly enough» — поэтому разница во времени не имела значения. Новый транспорт (поезда) появляется только в B." },
        { kind: "match", chk: 2, stem: "a reference to a law that confirmed a change some years after it had been made", key: 1,
          ru: "B: железные дороги ввели пояса в 1883 году, а федеральный закон подтвердил это только в 1918-м." },
        { kind: "match", chk: 2, stem: "examples of countries whose official time does not match their geographical position", key: 4,
          ru: "E: Испания живёт по времени Германии, Китай — по одному времени на пять поясов. Ловушка F: там линия смены дат, а не официальное время страны." },

        { group: { title: "Questions 5–9", task: "Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
            ru: "Одно слово из текста. Ответы идут по порядку текста. Проверь, что слово грамматически встаёт в пропуск." },
          kind: "gap", chk: 2, limit: 1, accept: ["sun"],
          stem: "Before standard time, each town set its clocks according to the position of the ______.",
          ru: "A: «Each town set its clocks by the sun». Ответ одно слово: sun. «The sun» — это уже два слова, и такой ответ не засчитают." },
        { kind: "gap", chk: 2, limit: 1, accept: ["dozens"],
          stem: "By the early 1880s, North American railway companies had to deal with ______ of different local times.",
          ru: "B: «working with dozens of different local times». Had to deal with = were working with." },
        { kind: "gap", chk: 2, limit: 1, accept: ["convention"],
          stem: "Because nature does not mark any meridian, the choice of a prime meridian was a ______, not a discovery.",
          ru: "C: «a convention rather than a discovery». Arbitrary тоже стоит рядом, но не встаёт в пропуск после a … not a discovery." },
        { kind: "gap", chk: 2, limit: 1, accept: ["governments"],
          stem: "The 1884 conference left decisions about local time zones to individual ______.",
          ru: "D: «left the question of local time zones to individual governments»." },
        { kind: "gap", chk: 2, limit: 1, accept: ["dates"],
          stem: "The International Date Line bends in several places so that island groups are not divided between two ______.",
          ru: "F: «so that island groups are not split between two dates». Split = divided." },

        { group: { title: "Questions 10–13", task: "Choose the correct letter, A, B, C or D.",
            ru: "Ответы идут по порядку текста. Неверные варианты часто используют слова из текста, но говорят не то." },
          kind: "mcq", chk: 2, stem: "According to the passage, the 1883 change to standard time in North America was introduced by", key: 1,
          opts: ["the federal government of the United States.", "the railway companies.", "an international conference.", "town councils across the continent."],
          ru: "B: «The change was made by the companies themselves». Федеральный закон появился только в 1918 году, а конференция была в 1884-м." },
        { kind: "mcq", chk: 2, stem: "One reason the delegates chose Greenwich was that", key: 2,
          opts: ["it lay at the centre of the British Empire.", "the Royal Observatory had the most accurate clocks.", "most ships were already using charts based on it.", "France had agreed to support it."],
          ru: "D: «partly because most of the world's shipping already relied on charts based on it». Про империю и точность часов в тексте ничего нет, а Франция воздержалась." },
        { kind: "mcq", chk: 2, stem: "What does the writer say about Spain?", key: 0,
          opts: ["Its clocks are set to a zone further east than its geography suggests.", "It changed its time zone in 2024.", "It voted against Greenwich in 1884.", "It uses several different time zones."],
          ru: "E: Испания лежит в основном западнее Гринвича, но живёт по времени Германии, то есть по поясу восточнее. В 2024 году время меняла Казахстан, против голосовало Сан-Доминго." },
        { kind: "mcq", chk: 2, stem: "What is the writer's main point in paragraph G?", key: 1,
          opts: ["Astronomy alone now decides where time zones lie.", "The boundaries of time are human choices shaped by practical interests.", "Time-zone maps have become too complicated to be useful.", "Most countries will soon adopt a single time zone."],
          ru: "G: границы времени — «human decisions, drawn and redrawn for convenience», под влиянием экономики и политики. A противоречит тексту, C и D в тексте не сказаны." }
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

    { type: "questions", id: "ielts", label: "IELTS-style · Academic Reading", title: "A full passage, exam format",
      ru: "Формат настоящего IELTS Academic: текст около 800 слов и 13 вопросов трёх типов. На экзамене на него уходит около 20 минут. Засеки время. Отвечай только по тексту.",
      lettered: true,
      passageTitle: "The Hour That Travelled by Train",
      passage: [
        "In the first decades of the nineteenth century, the time in any British town was a local affair. A clock was considered correct if it showed noon when the sun crossed the meridian above that town, and because the sun appears to move westwards at a steady rate, every place kept a slightly different hour. Bristol's clocks ran roughly ten minutes behind London's, and those of towns further west lagged further still. Local time was not merely tolerated but taken for granted: market hours, church services and the opening of shops were all regulated by it. Since a journey between such places by stagecoach took the better part of a day, few people had reason to notice the discrepancy, let alone resent it.",
        "The railways abolished that comfortable ignorance. Trains reduced journeys of a day to a matter of hours, and timetables had to specify departures and arrivals at stations whose clocks disagreed. A passenger leaving London at a given hour could not easily calculate when the train would reach a town whose noon arrived later, and station staff faced the same arithmetic. On single-track lines, where trains running in opposite directions depended on precise timing to avoid one another, the confusion was more than an inconvenience: it was a genuine hazard.",
        "The companies responded independently. In November 1840, the Great Western Railway instructed its stations to keep London time, and its staff carried watches set accordingly. Other companies gradually did the same, and in 1847 the Railway Clearing House, an organisation established by the railway companies themselves to coordinate their affairs, recommended that all of them adopt Greenwich time. By the end of the following year, the great majority of British lines had complied.",
        "Towns, however, were under no obligation to follow, and uniform time could not simply be imposed on them. For a period, many communities lived with two times at once: the local time by which shops opened and church bells rang, and the railway time printed in the timetable. Some public clocks were fitted with an additional hand so that both could be displayed. A clock on the Corn Exchange in Bristol, which still has two minute hands, is a reminder of this transitional arrangement. Elsewhere, opposition was more principled. Critics argued that an hour imposed from London was artificial, and that the sun, rather than a railway company, should determine the time, and some towns resisted for years.",
        "One practical reason to adopt the new standard was the availability of time signals from Greenwich. From 1852, the Royal Observatory at Greenwich could send time signals along telegraph wires, allowing people in distant towns to compare local readings with a reference from the observatory itself. Once accurate time could be distributed electrically, the case for keeping a separate local hour grew steadily weaker. Telegraph offices that received the daily signal became reference points against which townspeople could check their own clocks and watches. As the signals became more widely available, a town could use Greenwich time without having to determine it from solar observations of its own.",
        "The law was the last to change. Local time remained the official time in legal matters, and courts were occasionally asked to decide which hour applied to a contract or a hearing. Only in 1880 did Parliament pass an act making Greenwich Mean Time the legal standard throughout Great Britain. By then the measure largely recognised a situation that already existed in daily life: railway time had prevailed long before it became law.",
        "The episode is often cited as an early example of the way a new technology can quietly reshape habits that once seemed entirely natural. Nobody voted to give up the solar noon; it was abandoned gradually, one timetable and one clock at a time, because the convenience of a shared hour came to outweigh attachment to a local one. Similar patterns can be seen in later standards, from units of measurement to the plugs and sockets of electrical appliances. Some historians go further, arguing that railway time altered the experience of time itself, encouraging a habit of punctuality measured in minutes rather than in hours."
      ],
      items: [
        { group: { title: "Questions 1–5", task: "Complete each sentence with the correct ending, A–H, below.", labels: "letters", listTitle: "List of endings",
            ru: "Окончаний восемь, нужно пять: три лишние. Окончание должно подходить и по смыслу текста, и по грамматике.",
            headings: ["because people travelled far more slowly than trains.", "because trains relied on keeping precise times.", "because a railway organisation advised them to do so.", "so that two different times could be shown.", "because the government ordered them to do so.", "because time could be sent to them by telegraph.", "because Parliament had already changed the law.", "so that passengers could buy tickets more cheaply."] },
          kind: "match", chk: 2, stem: "Before the railways, differences between local times went largely unnoticed", key: 0,
          ru: "A: путь на дилижансе занимал почти весь день, поэтому никто не замечал разницы. Then travel was slow = people travelled far more slowly than trains." },
        { kind: "match", chk: 2, stem: "Confusion over time on single-track lines was dangerous", key: 1,
          ru: "B: поезда навстречу друг другу «depended on precise timing to avoid one another»." },
        { kind: "match", chk: 2, stem: "By the end of 1848, most British railway lines were using Greenwich time", key: 2,
          ru: "C: в 1847 году Railway Clearing House рекомендовала Гринвич, и к концу следующего года большинство линий подчинились. Ловушка E: государство ничего не приказывало, компании действовали сами." },
        { kind: "match", chk: 2, stem: "Some public clocks were given an extra hand", key: 3,
          ru: "D: «fitted with an additional hand so that both could be displayed»." },
        { kind: "match", chk: 2, stem: "Distant towns could check their clocks against the Greenwich reference from the 1850s", key: 5,
          ru: "F: с 1852 года сигналы времени шли по телеграфу, и города получали по ним исходное время для сверки местных часов. Ловушка G: закон изменился только в 1880 году." },

        { group: { title: "Questions 6–9", task: "Complete the notes below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.",
            ru: "Сначала пойми, что нужно в пропуск: слово, название или год. Ответы идут по порядку текста." },
          kind: "gap", chk: 2, limit: 2, accept: ["London"],
          stem: "Railway time in Britain. 1840: Great Western Railway stations begin to keep ______ time.",
          ru: "C: «instructed its stations to keep London time»." },
        { kind: "gap", chk: 2, limit: 2, accept: ["railway companies", "companies"],
          stem: "1847: the Railway Clearing House, set up by the ______ themselves, recommends Greenwich time for every line.",
          ru: "C: «an organisation established by the railway companies themselves». Ответ railway companies; одно слово companies тоже точно." },
        { kind: "gap", chk: 2, limit: 2, accept: ["telegraph wires", "wires"],
          stem: "From 1852: time signals are sent from Greenwich along ______.",
          ru: "E: «send time signals along telegraph wires»." },
        { kind: "gap", chk: 2, limit: 2, accept: ["1880"],
          stem: "______: an act of Parliament makes Greenwich Mean Time the legal standard.",
          ru: "F: «Only in 1880 did Parliament pass an act». Число можно писать цифрами." },

        { group: { title: "Questions 10–13", task: "Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage for each answer.",
            ru: "Короткий ответ на вопрос словами из текста. Лимит три слова; артикль тоже слово." },
          kind: "gap", chk: 2, limit: 3, accept: ["Corn Exchange", "the Corn Exchange"],
          stem: "Which building in Bristol has a clock with two minute hands?",
          ru: "D: «A clock on the Corn Exchange in Bristol, which still has two minute hands»." },
        { kind: "gap", chk: 2, limit: 3, accept: ["the sun", "sun"],
          stem: "According to critics, what should determine the time instead of a railway company?",
          ru: "D: «the sun, rather than a railway company, should determine the time»." },
        { kind: "gap", chk: 2, limit: 3, accept: ["telegraph offices", "offices"],
          stem: "Where could people compare a watch with the time signal?",
          ru: "E: «Telegraph offices that received the daily signal became reference points». Линии передавали сигнал, а для сверки нужен был пункт приёма." },
        { kind: "gap", chk: 2, limit: 3, accept: ["plugs and sockets"],
          stem: "Apart from units of measurement, which later standard does the writer mention?",
          ru: "G: «from units of measurement to the plugs and sockets of electrical appliances». Plugs and sockets — ровно три слова." }
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
        "Before the railways, each British town kept its own time, and nobody worried about the discrepancy between one town clock and the next. Fast trains made these differences a problem, so the railway companies imposed a uniform time on their stations. Some towns resisted at first. The change was gradual, but railway time prevailed, and by the middle of the 1850s most towns had abandoned local time."
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
  intro: "Сегодня логические связки. На SAT это Transitions: выбрать слово, которое верно соединяет две мысли. В IELTS Writing это критерий Coherence and Cohesion, а в Reading связки помогают следить за ходом мысли. В прошлом уроке поезда дали целой стране одно время. Сегодня время помогает найти место: все тексты урока о том, как часы решили задачу, которую не решили карты.",
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
          text: "Harrison's fourth timekeeper performed remarkably on its trial voyage of 1761–62, running only a few seconds slow on arrival in Jamaica. ______ the Board of Longitude hesitated to award the full prize, demanding further trials.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["Accordingly,", "Nevertheless,", "In other words,", "Moreover,"], key: 1,
          ru: "Часы сработали отлично, но приз не дали: результат неожиданный, Nevertheless. Accordingly означало бы, что отказ логично следует из успеха. In other words вводит пересказ. Moreover добавляет довод в ту же сторону." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Academic Reading", title: "A full passage, exam format",
      ru: "Формат настоящего IELTS Academic: текст около 800 слов и 13 вопросов трёх типов. На экзамене на него уходит около 20 минут. Засеки время. Отвечай только по тексту. Следи за связками: nevertheless, whereas, consequently показывают, куда поворачивает мысль, и на них построены несколько вопросов.",
      lettered: true,
      passageTitle: "Time, Position and the Longitude Problem",
      passage: [
        "For most of the history of ocean travel, a ship's crew could determine how far north or south they were with reasonable confidence. Latitude can be read from the sky: the height of the sun at noon, or of the Pole Star at night, changes in a regular way as a vessel moves towards or away from the equator, but longitude offers no comparable marker. The whole sky appears to turn overhead once a day, and the same stars return to the same position above every meridian in turn, so nothing in the sky by itself reveals how far east or west an observer has travelled. Navigators therefore relied on dead reckoning, estimating their position from speed, direction and the time elapsed, a method whose errors accumulated with every day at sea.",
        "The principle of a solution had been understood for a long time. The Earth turns through fifteen degrees of longitude every hour, so a difference in time is also a difference in position. If a navigator knew the time at the home port at the moment of local noon on board, the gap between the two would give the ship's longitude directly. As early as the sixteenth century, the mathematician Gemma Frisius, working in the Low Countries, described this method in print. The obstacle was practical rather than theoretical: no clock of the period could keep accurate time for weeks on a moving ship. Others consequently looked to the sky instead. Galileo Galilei proposed timing the eclipses of the moons of Jupiter, which he had discovered, and the method worked well on land; on the deck of a rolling ship, however, it proved almost impossible to keep a telescope trained on so small a target.",
        "In 1714, after a petition from sea captains and merchants, the British Parliament passed the Longitude Act, which offered up to £20,000 for a method that would fix a ship's position to within half a degree. A group of commissioners, later known as the Board of Longitude, was to judge the claims. Isaac Newton, consulted while the act was being prepared, accepted that a timekeeper might in principle solve the problem, but he doubted that one could be built to withstand the motion of a ship and the changes of heat, cold and humidity it would meet at sea. Most of the learned men of the day likewise expected that the answer, if it came at all, would come from astronomy.",
        "The man who eventually proved Newton wrong had no formal education in science: John Harrison was a carpenter who had taught himself to build clocks, and his early clocks, made largely of wood, needed no oil, which in that period thickened with age and made clocks unreliable. Around 1730 he travelled to London with plans for a sea clock and showed them to the astronomer Edmond Halley. Halley did not judge the designs himself; instead he sent Harrison to George Graham, the most respected instrument maker in the city, who was impressed enough to lend him money. Harrison's first marine timekeeper, completed in 1735, was a large construction of brass with two linked balances, arranged so that the swaying of a ship would not disturb its rate. Tested on a voyage to Lisbon in 1736, it gave a more precise position on the return journey than the navigator's own estimate, and the Board granted Harrison money to continue.",
        "His next two machines took far longer than he expected: the second was set aside once he identified a flaw in its design, and the third occupied him for nineteen years. The time was not wasted, however, because the third machine contained two of his most important inventions. Metal parts expand in heat and contract in cold, and these variations alter the rate of a clock. To compensate, Harrison devised a strip made of brass and steel fixed together. Because the two metals expand by different amounts, the strip bends as the temperature changes, and this movement can be used to correct the mechanism; the same principle is still found in many thermostats. He also developed a bearing that greatly reduced friction, an early version of a design that remains in use in machinery today.",
        "Then, in a sharp change of direction, Harrison gave up large machines altogether. His fourth timekeeper, completed in 1759, resembled an oversized pocket watch, whereas its three predecessors were large, heavy machines. On a trial voyage to Jamaica in 1761–62, it was only a few seconds slow on arrival. Nevertheless, the Board was reluctant to pay. Its members questioned whether a single watch proved that such watches could be made in quantity, and they demanded a full account of its construction as well as further trials. Nevil Maskelyne, who became Astronomer Royal in 1765, was a committed supporter of the rival lunar-distance method, in which the angle between the Moon and a chosen star is measured and compared with predicted tables, and he arranged for such tables to be published every year in the Nautical Almanac, so Harrison came to regard him as an opponent. Only in 1773, when Harrison was eighty and King George III had taken an interest in his case, did Parliament grant him a substantial sum, although he was never formally awarded the prize itself.",
        "Some of the most persuasive evidence came from a copy. The watchmaker Larcum Kendall reproduced the fourth timekeeper, and James Cook took this copy on his second great voyage, which lasted from 1772 to 1775 and crossed both the icy southern ocean and the tropics. Cook praised the watch highly, and its steady performance over three years did more than any argument to win over those who still had doubts. Even so, the two methods existed side by side for decades. Marine timekeepers remained expensive to manufacture, and consequently many ships continued to rely on lunar observations. Harrison's achievement was therefore not to end the debate overnight but to show that a mechanical solution was possible at all."
      ],
      items: [
        { group: { title: "Questions 1–5", task: "Look at the following statements and the list of people below. Match each statement with the correct person, A–G.", labels: "letters", listTitle: "List of people",
            ru: "Это matching features: утверждение нужно связать с человеком. Людей семь, утверждений пять: двое лишние. Утверждения идут не по порядку текста. Ищи имя, потом сравнивай смысл, а не слова.",
            headings: ["Gemma Frisius", "Galileo Galilei", "Isaac Newton", "Edmond Halley", "George Graham", "Nevil Maskelyne", "James Cook"] },
          kind: "match", chk: 2, stem: "He questioned whether a timekeeper could cope with conditions on board a ship.", key: 2,
          ru: "C, Newton: «he doubted that one could be built to withstand the motion of a ship and the changes of heat, cold and humidity». Ловушка A: Фризиус описал метод с часами, но не сомневался в нём; препятствие называет автор текста." },
        { kind: "match", chk: 2, stem: "Rather than give his own verdict on Harrison's plans, he referred him to someone else.", key: 3,
          ru: "D, Halley: «did not judge the designs himself; instead he sent Harrison to George Graham». Ловушка E: Грэм и есть тот, к кому отправили; он оценил планы и дал денег, но никого никуда не направлял." },
        { kind: "match", chk: 2, stem: "He championed an alternative to Harrison's approach and helped to make it usable at sea.", key: 5,
          ru: "F, Maskelyne: сторонник лунного метода, добился ежегодной публикации таблиц в Nautical Almanac. Ловушка B: Галилей тоже предложил астрономический метод, но в море он почти не работал, и текст не говорит, что Галилей его улучшил." },
        { kind: "match", chk: 2, stem: "He set out the idea of finding longitude by comparing times long before it could be put into practice.", key: 0,
          ru: "A, Gemma Frisius: «As early as the sixteenth century… described this method in print», а препятствие было практическим: часов такой точности не было. Ловушка C: Ньютон обсуждал часы, но идея была описана задолго до него." },
        { kind: "match", chk: 2, stem: "A voyage under his command produced evidence that helped to convince people who were still sceptical.", key: 6,
          ru: "G, Cook: копия часов три года исправно работала в плавании под его командованием и «did more than any argument to win over those who still had doubts». Sceptical = had doubts." },

        { group: { title: "Questions 6–9", task: "Complete the table below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
            ru: "Это table completion. Сначала прочитай всю таблицу: строки идут в порядке текста, и по соседним клеткам видно, какое слово нужно (место, предмет, материал). Слова в ответ берутся из текста без изменений.",
            table: { caption: "Harrison's sea timekeepers", head: ["Timekeeper", "Details", "What happened"],
              rows: [["First (1735)", "brass; two linked balances", "tested on a voyage to (6) ______; gave a better position than the navigator"],
                     ["Second", "—", "abandoned when Harrison discovered a (7) ______ that was built into it"],
                     ["Third", "nineteen years of work; a strip combining two metals: brass and (8) ______", "the strip bends with temperature and corrects the clock"],
                     ["Fourth (1759)", "shaped like a large (9) ______", "was only a few seconds slow on arrival"]] } },
          kind: "gap", chk: 2, limit: 2, accept: ["Lisbon"],
          stem: "6 · First timekeeper: tested on a voyage to ______ in 1736.",
          ru: "D: «Tested on a voyage to Lisbon in 1736». Ловушка: Jamaica — это испытание четвёртых часов." },
        { kind: "gap", chk: 2, limit: 2, accept: ["flaw"],
          stem: "7 · Second timekeeper: abandoned when Harrison discovered a ______ that was built into it.",
          ru: "E: «set aside once he identified a flaw in its design». В клетке нужно существительное после a: flaw." },
        { kind: "gap", chk: 2, limit: 2, accept: ["steel"],
          stem: "8 · Third timekeeper: a strip combining two metals, brass and ______, that bends with heat and cold.",
          ru: "E: «a strip made of brass and steel fixed together». Brass уже стоит в таблице, нужен второй металл." },
        { kind: "gap", chk: 2, limit: 2, accept: ["pocket watch"],
          stem: "9 · Fourth timekeeper: shaped like a large ______.",
          ru: "F: «resembled an oversized pocket watch». Large в таблице = oversized в тексте, ответ pocket watch, ровно два слова. Одно watch неточно: текст сравнивает с карманными часами." },

        { group: { title: "Questions 10–13", task: "Choose the correct letter, A, B, C or D.",
            ru: "Вопросы идут по порядку текста. Неверные варианты часто взяты из того же абзаца или верны в жизни, но не сказаны в тексте." },
          kind: "mcq", chk: 2, stem: "According to paragraph A, longitude was harder to find than latitude because", key: 3,
          opts: ["the Pole Star could not be seen from southern waters.", "navigators were unwilling to use dead reckoning.", "the height of the sun changed too quickly at noon.", "observing the sky gave no direct sign of east–west position."],
          ru: "D: «nothing in the sky by itself reveals how far east or west an observer has travelled». A может быть правдой в жизни, но в тексте этого нет. B неверно: моряки как раз полагались на счисление (dead reckoning). C в тексте нет: высота солнца, наоборот, помогала найти широту." },
        { kind: "mcq", chk: 2, stem: "What does the writer say about Galileo's method?", key: 1,
          opts: ["It was rejected by the Board of Longitude.", "It was effective ashore but impractical at sea.", "It depended on an accurate clock.", "It was the method Newton preferred."],
          ru: "B: «worked well on land; on the deck of a rolling ship, however, it proved almost impossible». However отмечает поворот. A и D в тексте нет: Ньютон ожидал ответа от астрономии вообще, но о методе Галилея не говорил. C неверно: метод Галилея был альтернативой часам." },
        { kind: "mcq", chk: 2, stem: "Why was the Board reluctant to pay Harrison after the voyage to Jamaica?", key: 0,
          opts: ["Its members doubted that one successful watch showed that more could be produced.", "Its members believed the watch had lost too much time.", "Harrison refused to carry out further trials.", "The watch was too heavy to use on most ships."],
          ru: "A: «questioned whether a single watch proved that such watches could be made in quantity». B противоречит тексту: часы потеряли лишь несколько секунд. C: дополнительных испытаний требовал совет, о том, что Харрисон отказался, текст не говорит. D противоречит тексту: четвёртые часы были размером с большие карманные." },
        { kind: "mcq", chk: 2, stem: "What is the writer's main point in the last paragraph?", key: 2,
          opts: ["Cook's voyage led ships to abandon lunar observations at once.", "Kendall's copy was more accurate than Harrison's original watch.", "Harrison showed that a mechanical method could work, though it was adopted slowly.", "Lunar observations proved more reliable than timekeepers in the end."],
          ru: "C: «not to end the debate overnight but to show that a mechanical solution was possible at all», а методы ещё десятилетиями существовали рядом. A противоречит тексту: «side by side for decades». B и D в тексте не сказаны." }
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
      model: "I partly agree. Phones can now determine our position in seconds; consequently, few people need to read a paper map in daily life. Nevertheless, I think the skill is still worth having, because a phone can lose its signal, whereas a map never does. Likewise, I think mental arithmetic is worth keeping, even though every phone has a calculator." },

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
          text: "Harrison's fourth timekeeper was small enough to hold in two hands. The first three, ______ were large, heavy machines.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["by contrast,", "therefore,", "for example,", "likewise,"], key: 0,
          ru: "Маленький четвёртый и большие, тяжёлые первые три: противопоставление, by contrast. Likewise означало бы сходство. Therefore и for example не передают контраст." },
        { kind: "mcq", chk: 2,
          stem: "Which sentence links the two ideas by showing that the officials did something unexpected?",
          opts: ["The clock worked; consequently, the officials wanted more tests.", "The clock worked; nevertheless, the officials wanted more tests.", "The clock worked; likewise, the officials wanted more tests.", "The clock worked; for instance, the officials wanted more tests."], key: 1,
          ru: "Часы сработали, но проверок потребовали ещё: вторая мысль идёт против ожидания, nevertheless. Consequently сделало бы новые проверки следствием успеха." }
      ] }
  ],
  handoff: { text: "A clock turned time into position. Next, a census turns a country into a table.", next: "C05" }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C05 = {
  id: "C05",
  title: "Counting Everyone",
  thread: "A census turns a country into a table.",
  intro: "В прошлом уроке часы превратили время в место на карте. Сегодня перепись превращает целую страну в таблицу. Навык один: выбрать из фактов те, что нужны для цели. На SAT это Rhetorical Synthesis: из заметок выбрать предложение, которое выполняет задачу. В IELTS Writing Task 1 это overview: из всей таблицы выбрать главное и не тонуть в цифрах.",
  words: [
    { w: "relevant", pos: "adj.", ru: "относящийся к делу, нужный",
      sat: "Only two of the archive's many letters are relevant to the question of when the bridge was built.",
      ielts: "Your overview should include only the information that is relevant to the main trend." },
    { w: "overall", pos: "adv.", ru: "в целом",
      sat: "Some districts lost residents, but overall the region grew during the decade.",
      ielts: "Overall, the number of students rose, while the number of teachers stayed the same." },
    { w: "estimate", pos: "n. / v.", ru: "оценка; оценивать приблизительно",
      sat: "Earlier estimates of the city's population had relied on counts of houses rather than of people.",
      ielts: "It is difficult to estimate how many tourists visit the city each year." },
    { w: "comprise", pos: "v.", ru: "состоять из, включать",
      sat: "The collection comprises more than four hundred maps, most of them drawn by hand.",
      ielts: "Young people comprise almost half of the population in some countries." },
    { w: "fluctuate", pos: "v.", ru: "колебаться, меняться то вверх, то вниз",
      sat: "Grain prices fluctuated sharply from one season to the next, depending on the harvest.",
      ielts: "The number of visitors fluctuated between 2010 and 2015 before rising steadily." },
    { w: "significant", pos: "adj.", ru: "значительный, важный",
      sat: "The difference between the two samples was small but significant, since it appeared in every trial.",
      ielts: "There was a significant increase in the number of people working from home." },
    { w: "decline", pos: "n. / v.", ru: "снижение; снижаться",
      sat: "The decline of the river trade began well before the railway reached the town.",
      ielts: "The use of paper maps has declined since smartphones became common." },
    { w: "enumerate", pos: "v.", ru: "пересчитывать, перечислять по одному",
      sat: "The clerk's task was to enumerate every household on the street, door by door.",
      ielts: "The report enumerates the main reasons why young people leave rural areas." }
  ],
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Rhetorical Synthesis",
      ru: "Сначала прочитай цель в вопросе, а не заметки. Подчеркни глагол цели: explain, emphasize, contrast, describe. Потом найди вариант, который выполняет именно эту цель. Верный факт без нужной цели — неверный ответ.",
      rule: [
        "Цель важнее заметок: каждый вариант правдив, но только один делает то, что просит вопрос.",
        "Слово в цели подсказывает форму ответа: contrast требует двух сторон, explain why требует причины, emphasize the size требует числа или масштаба.",
        "Ловушка: вариант с самым интересным фактом, который к цели не относится (не relevant)."
      ],
      items: [
        { kind: "mcq", chk: 2,
          text: "While researching a topic, a student has taken the following notes:\n• Great Britain held its first national census in 1801.\n• Before then, estimates of the population varied widely.\n• Officials wanted reliable figures to plan food supplies and defence.\n• England and Wales did not hold a census in 1941.",
          stem: "The student wants to explain why Great Britain carried out its first census. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          opts: ["Many censuses followed the first one in 1801.", "Great Britain held its first national census in 1801.", "Great Britain's first census, held in 1801, was carried out because officials wanted reliable figures to plan food supplies and defence.", "England and Wales did not hold a census in 1941."], key: 2,
          ru: "Цель: explain why, то есть нужна причина. Причина есть только в варианте C: «because officials wanted reliable figures». A и D говорят о том, что было после 1801 года. B называет дату, но не объясняет, зачем." },
        { kind: "mcq", chk: 2,
          text: "While researching a topic, a student has taken the following notes:\n• Counting the 1880 US census by hand took years.\n• For the 1890 census, Herman Hollerith designed a machine that read holes punched in cards.\n• Each hole recorded one fact about a person, such as age or sex.\n• With the machine, the 1890 results were counted far more quickly.\n• Hollerith's company later became part of IBM.",
          stem: "The student wants to describe how Hollerith's machine worked. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          opts: ["Hollerith's machine read holes punched in cards, each hole recording one fact about a person, such as age or sex.", "Thanks to Hollerith's machine, the 1890 census was counted far more quickly than the 1880 census.", "Herman Hollerith, whose company later became part of IBM, designed a machine for the 1890 census.", "The 1880 US census took years to count by hand."], key: 0,
          ru: "Цель: describe how it worked, то есть устройство. Только A говорит, что делала машина: читала отверстия в карточках. B называет результат, а не устройство. C рассказывает о компании. D говорит о 1880 годе, когда машины ещё не было." },
        { kind: "mcq", chk: 2,
          text: "While researching a topic, a student has taken the following notes:\n• The First General Census of the Russian Empire took place in 1897.\n• It was the only census ever carried out across the whole empire.\n• Census takers recorded each person's native language, among other details.\n• Historians still use its records to study the population of the period.",
          stem: "The student wants to emphasize what made the 1897 census unique. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          opts: ["Historians still study the records of the 1897 census.", "The census of 1897 was the only one ever carried out across the whole Russian Empire.", "In 1897, census takers in the Russian Empire recorded each person's native language.", "The First General Census of the Russian Empire took place in 1897."], key: 1,
          ru: "Unique = единственный в своём роде. Это прямо сказано только в B: «the only one ever». Родной язык (C) записывали, но заметки не говорят, что это было уникально. A и D верны, но ничего не говорят об уникальности." },
        { kind: "mcq", chk: 2,
          text: "While researching a topic, a student has taken the following notes about Marsh End, a fictional town:\n• In 2000, Marsh End had 12,000 residents.\n• In 2020, it had 15,600 residents.\n• The number of residents aged 65 and over more than doubled in that period.\n• A new railway station opened in the town in 2008.",
          stem: "The student wants to present the overall change in the town's population. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          opts: ["The number of Marsh End residents aged 65 and over more than doubled between 2000 and 2020.", "Marsh End, which opened a railway station in 2008, had 12,000 residents in 2000.", "A new railway station opened in Marsh End in 2008.", "Between 2000 and 2020, the population of Marsh End grew from 12,000 to 15,600."], key: 3,
          ru: "Overall change = как изменилось всё население. Нужны обе цифры, начало и конец: это D. A описывает одну возрастную группу, а не всё население. B даёт только одну цифру. C к населению не относится." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Academic Reading", title: "A full passage, exam format",
      ru: "Формат настоящего IELTS Academic: текст около 800 слов и 13 вопросов трёх типов. На экзамене на него уходит около 20 минут. Засеки время. Отвечай только по тексту, даже если что-то знаешь о переписях сам(а): в IELTS это главная ловушка. Таблица Marsh End теперь в задании по письму (Task 1).",
      lettered: true,
      passageTitle: "Counting Heads: A Short History of the Census",
      passage: [
        "Counting a population sounds like the simplest of administrative tasks, yet for most of history governments found it remarkably difficult to do. The earliest counts were rarely intended to measure a population for its own sake. Rulers wanted to know how many men could be called upon to fight, how many households could be taxed, and how much land and livestock each of them possessed. In ancient Rome, citizens were required to declare themselves, their families and their property to officials at regular intervals, and a citizen's rights and duties depended on the outcome. In Han China, a count made in the year 2 CE recorded close to sixty million people, one of the earliest such totals to survive.",
        "Even ambitious surveys of this kind were not censuses in the modern sense. The Domesday Book, compiled in England in 1086 on the orders of William the Conqueror, is often described as a census, but its purpose was to record who held land and what that land was worth. It lists landholders and households rather than individual people, so historians who use it to estimate the population of the period must multiply the number of households by an assumed household size, and their conclusions differ considerably. Such figures are best treated as informed guesses rather than as counts.",
        "For centuries afterwards, governments that wanted a figure for their population had to rely on indirect evidence: registers of baptisms and burials, counts of houses, or the returns of a hearth tax. In eighteenth-century Britain this uncertainty produced a genuine controversy. Some writers, the minister and moral philosopher Richard Price among them, maintained that the population had been in decline for decades, while others insisted that it was rising. Because no complete count existed, neither side could settle the matter, although the question seemed relevant to everything from the strength of the army to the supply of food.",
        "Sweden was among the first countries to adopt a different approach. From 1749 its clergy, who already kept detailed parish registers, were required to send regular summaries of births, deaths and the number of inhabitants to the central authorities, giving the country national population statistics earlier than almost anywhere else. In the United States, the constitution of 1787 went further, requiring an “actual Enumeration” of the population every ten years so that seats in the House of Representatives could be divided among the states according to their size. The first count took place in 1790, when officials travelled on foot and on horseback to enumerate each household in their district.",
        "Great Britain held its first census in 1801, partly in response to the debate over whether the population was growing. The early British counts recorded only totals for each parish, compiled by local officials. Even so, the figures from these first counts settled the old argument decisively: the population had grown by a significant margin, and it continued to grow throughout the century. The census of 1841 was the first to record the name of every individual, together with details such as age and occupation, and responsibility for filling in the form passed to each householder.",
        "A census, however, is only as reliable as the people who conduct it and the people who answer it. Enumerators may overlook isolated dwellings, and some residents prefer not to be counted at all, frequently because they fear that the information will be used against them. For this reason, census offices have long promised confidentiality: in England and Wales, individual returns are kept closed for a hundred years before the public may consult them. Totals can also fluctuate for reasons that have nothing to do with genuine change, such as a shift in the date of the count or in the definition of who should be included, so a careful reader compares like with like before concluding that a population has risen or fallen.",
        "Today the traditional census faces new pressures. Visiting every household is expensive, and persuading every household to respond has become harder in many countries. Some states have responded by abandoning the door-to-door count altogether. Denmark, for example, has produced its census figures from existing administrative registers, covering matters such as residence, housing and employment, since the early 1980s, and several other countries have since followed its example. Supporters of this approach point out that it is cheaper and can be repeated more often; critics reply that a register comprises only what officials have already chosen to record. Overall, the purpose has scarcely changed since the days of Rome: a government that wishes to plan must first know whom it is planning for."
      ],
      items: [
        { group: { title: "Questions 1–6", task: "Do the following statements agree with the information given in the passage? Choose TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
            ru: "Утверждения идут по порядку текста. FALSE — текст говорит обратное. NOT GIVEN — текст об этом молчит, даже если в жизни это правда." },
          kind: "tfng", chk: 2, stem: "In ancient Rome, the result of the count affected what a citizen was entitled and obliged to do.", key: "T",
          ru: "TRUE. A: «a citizen's rights and duties depended on the outcome». Entitled = rights, obliged = duties." },
        { kind: "tfng", chk: 2, stem: "The Domesday Book names every person who lived in England in 1086.", key: "F",
          ru: "FALSE. B: книга перечисляет «landholders and households rather than individual people». Текст прямо говорит обратное: не каждого человека." },
        { kind: "tfng", chk: 2, stem: "Historians broadly agree about the size of England's population at the time of the Domesday Book.", key: "F",
          ru: "FALSE. B: оценки историков «differ considerably». Broadly agree — противоположное утверждение." },
        { kind: "tfng", chk: 2, stem: "In eighteenth-century Sweden, information about the population was gathered by members of the Church.", key: "T",
          ru: "TRUE. D: «its clergy… were required to send regular summaries». Clergy = духовенство, members of the Church. Ловушка: в утверждении нет слова clergy, только пересказ." },
        { kind: "tfng", chk: 2, stem: "The first British census was organised by the statistician John Rickman.", key: "NG",
          ru: "NOT GIVEN. В абзаце E сказано только, что первая перепись прошла в 1801 году и итоги собирали местные чиновники. Кто её организовал, текст не говорит. Если ты знаешь это из истории, всё равно отвечай NOT GIVEN: в IELTS считается только текст." },
        { kind: "tfng", chk: 2, stem: "People in England and Wales can be fined for refusing to complete the census.", key: "NG",
          ru: "NOT GIVEN. Абзац F говорит о тех, кто не хочет, чтобы его посчитали, и о закрытых на сто лет листах, но о штрафах в тексте нет ни слова. Ловушка: это может быть правдой в жизни." },

        { group: { title: "Questions 7–10", task: "Answer the questions below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer.",
            ru: "Короткие ответы словами из текста, по порядку. Лимит три слова или число; артикль тоже считается словом." },
          kind: "gap", chk: 2, limit: 3, accept: ["hearth tax", "a hearth tax"],
          stem: "Apart from church registers and counts of houses, the returns of which tax gave indirect evidence of population? ______",
          ru: "C: «registers of baptisms and burials, counts of houses, or the returns of a hearth tax». Ответ hearth tax." },
        { kind: "gap", chk: 2, limit: 3, accept: ["House of Representatives"],
          stem: "In which part of the US government were seats shared out according to the census? ______",
          ru: "D: «seats in the House of Representatives could be divided among the states». Ровно три слова; с артиклем the было бы четыре." },
        { kind: "gap", chk: 2, limit: 3, accept: ["each householder", "householder"],
          stem: "From 1841, who was responsible for completing the census form? ______",
          ru: "E: «responsibility for filling in the form passed to each householder». Ловушка: local officials — это о ранних переписях до 1841 года." },
        { kind: "gap", chk: 2, limit: 3, accept: ["a hundred years", "100 years", "one hundred years", "100", "a hundred", "one hundred"],
          stem: "For how many years are personal census records kept closed in England and Wales? ______",
          ru: "F: «kept closed for a hundred years before the public may consult them». Подходит число 100 или выражение a hundred years. Закрыты именно индивидуальные листы, поэтому срок не относится к общим итогам." },

        { group: { title: "Questions 11–13", task: "Complete the summary using the list of words, A–H, below.", labels: "letters", listTitle: "List of words",
            ru: "Пересказ одного абзаца (G). Слов восемь, пропусков три: пять лишних. Подходит только одно слово и по смыслу, и по грамматике.",
            headings: ["registers", "surveys", "frequently", "accurately", "record", "publish", "volunteers", "slowly"] },
          kind: "match", chk: 2, stem: "Some countries no longer send people from door to door; instead they draw on official ______ kept for other purposes.", key: 0,
          ru: "A, registers: «from existing administrative registers». Ловушка B: surveys — это опросы, а текст говорит о готовых записях, которые уже есть у государства." },
        { kind: "match", chk: 2, stem: "Supporters say this method is cheaper and can be repeated more ______.", key: 2,
          ru: "C, frequently: «can be repeated more often». Often = frequently. Ловушка D: accurately; о точности сторонники в тексте ничего не говорят." },
        { kind: "match", chk: 2, stem: "Opponents say that such data can only reflect what the authorities previously decided to ______.", key: 4,
          ru: "E, record: «comprises only what officials have already chosen to record». Ловушка F: publish; текст говорит о том, что записывают, а не о том, что публикуют." }
      ] },

    { type: "speaking", id: "speak", label: "IELTS-style · Speaking Part 3", title: "Describe a trend aloud",
      ru: "Ответь вслух за полторы минуты. План: главная тенденция → одна важная деталь с числом → твоё мнение о причине (в Speaking причину называть можно, в Task 1 нельзя). Используй overall и минимум два слова урока. Можно записать себя: запись остаётся только на этом устройстве.",
      prompts: [
        "How has the population of your town or city changed in recent years?",
        "Why do you think governments count their people every few years?"
      ],
      prep: 30, talk: 90,
      pron: { title: "Pronunciation: numbers you can't afford to mix up", ru: "В числах на -teen ударение на конце, в числах на -ty на начале. На экзамене путаница 15 и 50 стоит балла. Произнеси пары, преувеличивая ударение.",
        items: ["thir-TEEN — THIR-ty", "four-TEEN — FOR-ty", "fif-TEEN — FIF-ty", "six-TEEN — SIX-ty", "The figure rose to fif-TEEN thousand.", "It fell by FIF-ty percent."] },
      model: "Overall, my city has grown quite fast. When I was a child, the estimate was about one million people, and now it is significantly more, because many families have moved here for work. I think governments count their people regularly because they need relevant figures to plan schools, hospitals and roads; without a census, those plans would just be guesses." },

    { type: "writing", id: "write", label: "Writing micro-task", title: "One overview sentence",
      ru: "Это IELTS Writing Task 1 в малом виде. Посмотри на таблицу (данные и город выдуманные) и напиши к ней overview: одно или два предложения. Только главная тенденция и самое заметное изменение. Без причин, без всех чисел подряд.",
      table: { caption: "Population of Marsh End by age group, 2000 and 2020 (fictional data)", head: ["Age group", "2000", "2020"],
        rows: [["0–17", "3,000", "3,300"], ["18–64", "7,800", "9,300"], ["65 and over", "1,200", "3,000"], ["Total", "12,000", "15,600"]] },
      prompts: ["Write an overview of the table “Population of Marsh End by age group, 2000 and 2020”."],
      minWords: 20,
      checklist: ["Я начал(а) с Overall или похожего слова.", "Я назвал(а) главную тенденцию для всего населения.", "Я назвал(а) самое заметное изменение.", "Я не объяснял(а) причины.", "Я не перечислял(а) все числа."],
      model: [
        "Overall, the population of Marsh End grew between 2000 and 2020, and the most significant change was in the group aged 65 and over, which more than doubled while the youngest group changed only slightly."
      ] },

    { type: "questions", id: "exit", label: "Exit check", title: "Two questions before you go",
      ru: "По одному вопросу на каждый экзамен. Без подсказок.",
      items: [
        { kind: "mcq", chk: 2,
          text: "While researching a topic, a student has taken the following notes:\n• A census counts every person in a country.\n• A sample survey asks questions of only some people.\n• Governments use both to plan schools, hospitals and roads.",
          stem: "The student wants to contrast a census with a sample survey. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          opts: ["Governments use both a census and a sample survey to plan schools, hospitals and roads.", "A census counts every person in a country.", "Unlike a sample survey, which asks questions of only some people, a census counts every person in a country.", "A sample survey asks questions of only some people."], key: 2,
          ru: "Contrast требует двух сторон и различия по одному признаку: кого считают. Это C: «only some people» против «every person», различие названо через unlike. A говорит о сходстве, а не о различии. B и D описывают только одну сторону." },
        { kind: "tfng", chk: 2,
          text: "Overall, the population of Marsh End rose by 3,600 between 2000 and 2020, with the sharpest growth among residents aged 65 and over.",
          stem: "The group aged 18–64 grew faster than any other group.", key: "F",
          ru: "FALSE. Текст прямо говорит, что быстрее всех росла группа 65+: «the sharpest growth among residents aged 65 and over»." }
      ] }
  ],
  handoff: { text: "A census turned a country into a table. Next, one doctor turns a list of deaths into marks on a map, and the map into an argument.", next: "C06" }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C06 = {
  id: "C06",
  title: "The Pump on Broad Street",
  thread: "A map of marks became an argument.",
  intro: "В прошлом уроке перепись превратила страну в таблицу. Сегодня врач Джон Сноу превращает таблицу смертей в карту, а карту в доказательство. Навык: использовать числа как доказательство. На SAT это Command of Evidence (quantitative): выбрать данные из таблицы, которые поддерживают утверждение. В IELTS Writing Task 1 это сравнения: точно сказать, что больше, что меньше и во сколько раз.",
  words: [
    { w: "outbreak", pos: "n.", ru: "вспышка (болезни)",
      sat: "Records from the outbreak were incomplete, since many families left the district within days.",
      ielts: "Clean water is the best protection against an outbreak of disease." },
    { w: "contaminated", pos: "adj.", ru: "загрязнённый, заражённый",
      sat: "The samples drawn nearest the factory were the most heavily contaminated.",
      ielts: "In some regions, people still have to drink contaminated water." },
    { w: "source", pos: "n.", ru: "источник",
      sat: "The historian traced the rumour to a single source: a letter that no one else had seen.",
      ielts: "Tourism is the main source of income for many coastal towns." },
    { w: "dismiss", pos: "v.", ru: "отвергать, отмахиваться",
      sat: "Reviewers at first dismissed the novel as a minor work, a judgement later critics reversed.",
      ielts: "We should not dismiss young people's ideas simply because they lack experience." },
    { w: "correlation", pos: "n.", ru: "связь, корреляция",
      sat: "A correlation between two trends does not by itself show that one caused the other.",
      ielts: "There is a strong correlation between income and the amount people spend on travel." },
    { w: "comparable", pos: "adj.", ru: "сопоставимый",
      sat: "The two villages were comparable in size and wealth, which made the difference in their health records striking.",
      ielts: "Salaries in the two cities are comparable, but rents are much higher in the capital." },
    { w: "substantially", pos: "adv.", ru: "существенно, значительно",
      sat: "The revised edition differs substantially from the first, especially in its final chapters.",
      ielts: "Prices rose substantially between 2015 and 2020." },
    { w: "conclude", pos: "v.", ru: "делать вывод",
      sat: "From the pattern of the marks, the surveyor concluded that the river had once followed a different course.",
      ielts: "The graph shows that sales rose, but we cannot conclude why." }
  ],
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Command of Evidence: numbers",
      ru: "Сначала найди утверждение, которое нужно поддержать. Потом найди в таблице ровно те строки и столбцы, о которых оно говорит. Верный вариант совпадает с таблицей и поддерживает именно это утверждение.",
      rule: [
        "Два фильтра: вариант должен быть верен по таблице и поддерживать утверждение. Многие неверные варианты проходят только первый.",
        "Если утверждение сравнивает, нужен вариант с обеими сторонами сравнения.",
        "Ловушка: перепутанная строка, столбец «до» вместо «после», или верное число, которое к утверждению не относится."
      ],
      table: { caption: "Deaths from cholera per 10,000 houses in London, first seven weeks of the 1854 epidemic (recalculated from John Snow's counts, rounded)", head: ["Houses supplied by", "Deaths per 10,000 houses"],
        rows: [["Southwark and Vauxhall Company", "315"], ["Lambeth Company", "38"], ["Rest of London", "55"]] },
      items: [
        { kind: "mcq", chk: 2,
          text: "In the 1850s, many doctors believed that cholera spread through bad air. John Snow suspected contaminated water instead, and he compared households that received their water from two different companies. The data support his suspicion: households supplied by the Southwark and Vauxhall Company recorded ______",
          stem: "Which choice most effectively uses data from the table to complete the statement?",
          opts: ["about 55 deaths per 10,000 houses, the figure for the rest of London.", "about 315 deaths per 10,000 houses, compared with about 38 for houses supplied by the Lambeth Company.", "fewer deaths per 10,000 houses than houses in the rest of London.", "about 38 deaths per 10,000 houses, more than any other group."], key: 1,
          ru: "Утверждение сравнивает две компании, значит нужны обе цифры: 315 и 38. Это B. A даёт цифру для остального Лондона, а не для Southwark and Vauxhall. C неверно: 315 больше, а не меньше, чем 55. D неверно: 38 — цифра Lambeth, и она самая маленькая." },
        { kind: "mcq", chk: 2,
          text: "Snow's figures also allow a three-way comparison. The death rate for the rest of London ______",
          stem: "Which choice most effectively uses data from the table to complete the statement?",
          opts: ["was higher than the rates for both water companies.", "was lower than the rates for both water companies.", "fell between the Lambeth rate of about 38 and the Southwark and Vauxhall rate of about 315.", "was about 315 deaths per 10,000 houses."], key: 2,
          ru: "55 больше 38 и меньше 315, то есть между ними: C. A неверно (55 < 315). B неверно (55 > 38). D приписывает остальному Лондону цифру Southwark and Vauxhall." },
        { kind: "mcq", chk: 2,
          text: "A public-health team installed water filters in two of four districts and recorded cases of a waterborne illness before and after (fictional data). District A: 120 cases before, 30 after (filters). District B: 80 before, 70 after (no filters). District C: 60 before, 15 after (filters). District D: 90 before, 85 after (no filters). The team claims that districts with filters saw much larger falls in cases than districts without them.",
          stem: "Which choice most effectively uses the data to support the team's claim?",
          opts: ["Cases fell in all four districts.", "District A had the most cases before the programme.", "Cases fell from 120 to 30 in District A and from 60 to 15 in District C, but only from 80 to 70 in District B and from 90 to 85 in District D.", "District D had 85 cases after the programme, more than any other district."], key: 2,
          ru: "Утверждение сравнивает районы с фильтрами и без. Нужны обе группы: это C. A верно, но не показывает разницы между группами. B и D верны по данным, но говорят об одном районе и сравнения не дают." },
        { kind: "mcq", chk: 2,
          text: "Using the same fictional data, a student writes: “In the two districts without filters, cases fell by only ______”",
          stem: "Which choice most accurately completes the statement?",
          opts: ["70 and 85 cases.", "10 and 5 cases.", "75 percent.", "90 and 80 cases."], key: 1,
          ru: "Падение = до − после. B: 80 − 70 = 10, D: 90 − 85 = 5. Вариант 70 и 85 — это числа «после», а не падение. 75 % — падение в районах с фильтрами (120 → 30 и 60 → 15). 90 и 80 — числа «до»." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Academic Reading", title: "A full passage, exam format",
      ru: "Формат настоящего IELTS Academic: текст около 850 слов и 13 вопросов трёх типов. На экзамене на него уходит около 20 минут. Засеки время. Отвечай только по тексту. Обрати внимание, как автор отделяет связь (correlation) от причины: на этом построены несколько вопросов.",
      lettered: true,
      passageTitle: "The Doctor Who Followed the Water",
      passage: [
        "In the summer of 1854, John Snow was already a respected figure in London medicine, though not for the work that would eventually make him famous. He had built his reputation as one of the first doctors to study anaesthesia scientifically, and in 1853 he had given chloroform to Queen Victoria during the birth of one of her children. His interest in cholera was older still. In 1849 he had published a short work arguing that the disease was not carried through the air, as most of his colleagues believed, but was passed on through something swallowed, most probably contaminated water. Few readers were persuaded, and the argument was largely dismissed.",
        "The dominant view at the time was the miasma theory, according to which cholera, like many other diseases, arose from foul-smelling air given off by rotting matter. The theory was not foolish. The poor districts that smelled worst were also those where cholera struck hardest, and William Farr, the leading statistician at the General Register Office, had demonstrated a striking correlation between altitude and death rates: the lower a district lay beside the Thames, the higher the proportion of its residents who died. To Farr, this suggested that heavy, polluted air settled in low-lying areas. A correlation, however, cannot by itself reveal which of two connected factors is the cause, and Snow believed that the same pattern could be explained by water drawn from the dirtiest stretches of the river.",
        "His opportunity to test the idea came at the end of August 1854, when an outbreak of extraordinary violence began in Soho, in central London. Within ten days, hundreds of people living within a few streets of one another had died. Snow, who lived nearby, obtained a list of the dead from the register office and walked the district himself, asking families where they had obtained their water. The answers pointed repeatedly to a single public pump on Broad Street. When he later marked each death on a street map, the marks clustered tightly around the pump and thinned out with distance from it.",
        "Equally convincing were the exceptions. A workhouse close to the pump, housing several hundred people, recorded very few deaths, because it had a well of its own. Workers at a nearby brewery escaped almost entirely, since they received an allowance of beer and seldom drank from the pump at all. Conversely, a widow living in Hampstead, several miles from Soho, died of cholera after having water carried to her from Broad Street because she preferred its taste. Cases that at first seemed to contradict the pattern therefore turned out, on closer inspection, to support it.",
        "On 7 September Snow presented his findings to the local parish authorities, and on the following day the handle of the pump was removed. The gesture became famous, but Snow himself acknowledged that the outbreak was already in decline by then, partly because many residents had fled the area. A local clergyman, Henry Whitehead, who was initially sceptical, set out to disprove Snow's theory and ended by confirming it. His enquiries pointed to the likely source of the pollution: water used to wash a sick infant's nappies had been emptied into a cesspool at a house beside the pump, and the cesspool was found to be leaking towards the well.",
        "Snow nevertheless regarded a larger investigation in south London as his strongest evidence. There, two companies supplied water to the same districts, their pipes often running along the same street, so that the households they served were comparable in almost every respect except their water. In 1852 the Lambeth Company had moved its intake upstream, beyond the reach of London's sewage, whereas the Southwark and Vauxhall Company still drew water from a stretch of the Thames into which sewers emptied. Snow visited each house where a death had occurred and asked which company provided the water. When residents did not know, he tested a sample for salt, since the two supplies differed substantially in their salt content. Houses supplied by Southwark and Vauxhall turned out to have roughly eight times as many deaths per 10,000 houses as those supplied by Lambeth.",
        "Even so, a committee appointed by the government's General Board of Health to examine the outbreak did not accept Snow's explanation, and many experts continued to dismiss it. Snow died in 1858, and in that same summer the stench of the Thames in hot weather became so severe that Parliament approved a modern sewer system for London, largely in the belief that removing the smell would remove disease. The new sewers did reduce cholera, though not for the reason most of their supporters supposed. Farr himself eventually came to accept that water carried the disease, and Snow's method of comparing groups that differ in only one important respect is now regarded as a foundation of modern epidemiology. It allowed him to conclude far more than his famous map alone ever could."
      ],
      items: [
        { group: { title: "Questions 1–6", task: "The passage has seven paragraphs, A–G. Choose the correct heading for paragraphs B–G from the list of headings below.",
            ru: "Заголовков девять, абзацев шесть: три лишние. Заголовок передаёт главную мысль всего абзаца, а не одну яркую деталь. Абзац A — вступление, вопроса к нему нет.",
            headings: ["A rival theory and the figures that seemed to support it", "A famous gesture, and a doubter who uncovers the cause", "Exceptions that strengthened the case", "Why Parliament refused to pay for new sewers", "Tracing the deaths to one street pump", "An almost perfect natural comparison", "A map that convinced the medical profession at once", "Slow acceptance and an unexpected irony", "The laboratory discovery of the cause"] },
          kind: "match", chk: 2, stem: "Paragraph B", key: 0,
          ru: "B: теория миазмов и данные Фарра о высоте и смертности, которые, казалось, её подтверждали: i. Ловушка ix: о лаборатории и открытии возбудителя текст не говорит." },
        { kind: "match", chk: 2, stem: "Paragraph C", key: 4,
          ru: "C: Сноу опрашивал семьи, ответы указывали на одну колонку, на карте смерти собрались вокруг неё: v. Ловушка vii: карта есть в абзаце, но о том, что она сразу убедила врачей, тут нет, а абзац G говорит обратное." },
        { kind: "match", chk: 2, stem: "Paragraph D", key: 2,
          ru: "D: работный дом, пивоварня и вдова из Хэмпстеда казались исключениями, но подтвердили идею: iii." },
        { kind: "match", chk: 2, stem: "Paragraph E", key: 1,
          ru: "E: снятая ручка (знаменитый жест) и скептик Уайтхед, который нашёл, откуда в колодце зараза (протекающая выгребная яма): ii. Ловушка vii: ручку сняли власти прихода, а не врачи, и абзац G прямо говорит, что эксперты долго не соглашались." },
        { kind: "match", chk: 2, stem: "Paragraph F", key: 5,
          ru: "F: две компании, одни улицы, дома похожи во всём, кроме воды. Это естественный эксперимент: vi." },
        { kind: "match", chk: 2, stem: "Paragraph G", key: 7,
          ru: "G: комиссия и эксперты долго отвергали Сноу (slow acceptance), а канализацию построили ради борьбы с запахом, и она всё равно снизила холеру (irony): viii. Ловушка iv: парламент, наоборот, одобрил канализацию." },

        { group: { title: "Questions 7–10", task: "Complete the flow chart below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.",
            ru: "Это flow-chart completion: шаги идут по порядку, ответы из одного абзаца (F). Посмотри, что стоит до и после пропуска: направление, предмет, вещество или число.",
            flowTitle: "Snow's study in south London",
            flow: ["1852: the Lambeth Company moves the point where it takes in water (7) ______, away from the city's sewage",
                   "At every home with a cholera death, Snow finds out which (8) ______ is responsible for the supply",
                   "Where nobody can tell him, Snow tests the water for traces of (9) ______",
                   "Result: the death rate in homes served by Southwark and Vauxhall is about (10) ______ as high as in homes served by Lambeth"] },
          kind: "gap", chk: 2, limit: 2, accept: ["upstream"],
          stem: "7 · 1852: the Lambeth Company moves the point where it takes in water ______, away from the city's sewage.",
          ru: "F: «had moved its intake upstream, beyond the reach of London's sewage». Intake = место забора воды." },
        { kind: "gap", chk: 2, limit: 2, accept: ["company"],
          stem: "8 · At every home with a cholera death, Snow finds out which ______ is responsible for the supply.",
          ru: "F: «asked which company provided the water». В тексте стоит company. Ответ water company не подходит: эти два слова в данном фрагменте не стоят рядом." },
        { kind: "gap", chk: 2, limit: 2, accept: ["salt"],
          stem: "9 · Where nobody can tell him, Snow tests the water for traces of ______.",
          ru: "F: «he tested a sample for salt, since the two supplies differed substantially in their salt content»." },
        { kind: "gap", chk: 2, limit: 2, accept: ["eight times", "8 times"],
          stem: "10 · Result: the death rate in homes served by Southwark and Vauxhall is about ______ as high as in homes served by Lambeth.",
          ru: "F: «roughly eight times as many deaths per 10,000 houses». About = roughly. Ответ eight times (или 8 times): одно eight без times не даёт сравнения." },

        { group: { title: "Questions 11–13", task: "Choose the correct letter, A, B, C or D.",
            ru: "Вопросы идут по порядку текста. Ищи, что говорит автор, а не что звучит разумно." },
          kind: "mcq", chk: 2, stem: "What is the writer's view of the miasma theory?", key: 1,
          opts: ["It had no evidence to support it.", "It was a reasonable reading of the evidence then available.", "It was first proposed by William Farr.", "It was based on careful laboratory work."],
          ru: "B: «The theory was not foolish»: худшие по запаху районы и правда страдали сильнее, и данные Фарра показывали связь. A противоречит тексту. C: Фарр её поддерживал, но текст не говорит, что он её придумал. D: о лабораториях в тексте нет ничего." },
        { kind: "mcq", chk: 2, stem: "Why does the writer mention that many residents had fled the area?", key: 3,
          opts: ["to explain why Whitehead doubted Snow at first", "to criticise the parish authorities for acting slowly", "to suggest that Snow's list of deaths was incomplete", "to show that removing the handle may not fully explain the end of the outbreak"],
          ru: "D: вспышка уже шла на спад, «partly because many residents had fled», значит снятая ручка не единственная причина. B звучит правдоподобно, но автор власти не критикует. A и C в тексте с бегством жителей не связаны." },
        { kind: "mcq", chk: 2, stem: "According to the writer, why did Parliament approve a new sewer system in 1858?", key: 0,
          opts: ["Its members believed that getting rid of the smell would prevent illness.", "Snow had finally convinced its members that water carried cholera.", "Farr's figures had shown that the river carried the disease.", "The official committee on the outbreak had recommended it."],
          ru: "A: «largely in the belief that removing the smell would remove disease» — это и есть теория миазмов. B противоречит тексту: Сноу умер, так и не убедив экспертов. C: Фарр принял водную теорию позже («eventually»). D: комиссия Совета здравоохранения, наоборот, не приняла объяснение Сноу, а о её рекомендациях по канализации текст не говорит." }
      ] },

    { type: "speaking", id: "speak", label: "IELTS-style · Speaking Part 3", title: "Compare two figures aloud",
      ru: "Ответь вслух за полторы минуты. Используй хотя бы одно точное сравнение с числом (twice as…, about three times more…, much higher than…) и одно слово урока. Можно записать себя: запись остаётся только на этом устройстве.",
      prompts: [
        "Are maps or tables better for showing information to the public? Why?",
        "Follow-up: Do people in your country trust official statistics? Why or why not?"
      ],
      prep: 30, talk: 90,
      pron: { title: "Pronunciation: the weak forms of than and as", ru: "В сравнениях than и as звучат слабо: /ðən/ и /əz/. Ударение падает на прилагательное и число, а не на than.",
        items: ["HIGH-er /ðən/ last year", "TWICE /əz/ MANy", "much MORE /ðən/ we expected", "about EIGHT times /əz/ many deaths"] },
      model: "I think maps are often better for the public, because a map shows the source of a problem at a glance. A table can be more precise, but most people won't read it. In my country, trust in statistics is lower than it should be; people tend to dismiss official figures, although the numbers are often comparable with independent estimates." },

    { type: "writing", id: "write", label: "Writing micro-task", title: "Two comparison sentences",
      ru: "Напиши два предложения по таблице Сноу: одно сравнивает две компании, второе сравнивает их с остальным Лондоном. Используй точные числа и слова сравнения. Без причин, только данные.",
      prompts: ["Compare the figures in the table “Deaths from cholera per 10,000 houses, 1854”."],
      minWords: 30,
      checklist: ["В первом предложении есть обе компании и обе цифры.", "Во втором предложении есть остальной Лондон.", "Я использовал(а) than после сравнительной степени.", "Я не объяснял(а) причины.", "Число и слово рядом совпадают: 315 — about eight times 38."],
      model: [
        "Houses supplied by the Southwark and Vauxhall Company recorded about 315 deaths per 10,000 houses, roughly eight times as many as houses supplied by the Lambeth Company, at about 38.",
        "The figure for the rest of London, about 55, was substantially lower than the Southwark and Vauxhall rate but higher than the Lambeth rate."
      ] },

    { type: "questions", id: "exit", label: "Exit check", title: "Two questions before you go",
      ru: "По одному вопросу на каждый экзамен. Без подсказок.",
      items: [
        { kind: "mcq", chk: 2,
          text: "Inspectors tested 50 water samples from each of three wells (fictional data). 40 samples from Well X, 6 from Well Y and 3 from Well Z were contaminated. A student claims that Well X was by far the most contaminated of the three.",
          stem: "Which choice most effectively uses the data to support the student's claim?",
          opts: ["Samples were taken from three different wells.", "Well Z had fewer contaminated samples than Well Y.", "80 percent of samples from Well X were contaminated, compared with 12 percent from Well Y and 6 percent from Well Z.", "Wells Y and Z together had 9 contaminated samples."], key: 2,
          ru: "40 из 50 = 80 %, 6 из 50 = 12 %, 3 из 50 = 6 %. Только C сравнивает X с обоими другими колодцами. B и D верны, но не говорят о колодце X. A не содержит данных." },
        { kind: "tfng", chk: 2,
          text: "Houses supplied by the Lambeth Company had about 38 deaths per 10,000 houses, compared with about 55 in the rest of London.",
          stem: "The Lambeth figure was higher than the figure for the rest of London.", key: "F",
          ru: "FALSE. 38 меньше 55." }
      ] }
  ],
  handoff: { text: "Snow's marks on a map became an argument. Next, Florence Nightingale turns a war's records into a single diagram.", next: "C07" }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C07 = {
  id: "C07",
  title: "The Diagram That Changed a Hospital",
  thread: "One picture carried the main idea.",
  intro: "Сегодня главная мысль и детали. На SAT это Central Ideas and Details: найти мысль, которая покрывает весь текст, и отличить её от отдельного факта. В IELTS Reading тот же навык нужен, чтобы отличить позицию автора от чужих мнений и деталей (Yes / No / Not Given) и подобрать к началу мысли её верное окончание. В прошлом уроке карта Джона Сноу с чёрточками смертей стала доказательством. Сегодня одна диаграмма несёт главную мысль целого отчёта: Флоренс Найтингейл показывает, от чего на самом деле умирали солдаты.",
  words: [
    { w: "mortality", pos: "n.", ru: "смертность",
      sat: "Mortality among the settlers fell once a clean well was dug at the edge of the camp.",
      ielts: "Infant mortality has declined in most countries over the past fifty years." },
    { w: "preventable", pos: "adj.", ru: "предотвратимый",
      sat: "The inquiry concluded that the fire had been preventable, since the faulty wiring was reported months earlier.",
      ielts: "Many road accidents are preventable if drivers simply slow down." },
    { w: "sanitation", pos: "n.", ru: "санитарные условия: чистая вода, канализация, уборка",
      sat: "The engineer argued that sanitation, not medicine, would do most to protect the growing city.",
      ielts: "Governments should invest in sanitation before they build new stadiums." },
    { w: "attribute", pos: "v.", ru: "объяснять чем-либо, приписывать (attribute A to B)",
      sat: "Historians attribute the town's decline to the closing of its only railway line.",
      ielts: "Some experts attribute rising stress to the constant use of smartphones." },
    { w: "proportion", pos: "n.", ru: "доля, часть от целого",
      sat: "A large proportion of the letters in the archive were never sent.",
      ielts: "The proportion of people who work from home has grown in recent years." },
    { w: "compile", pos: "v.", ru: "собирать, составлять (данные, список, отчёт)",
      sat: "Over thirty years, the botanist compiled a record of every plant that flowered on the island.",
      ielts: "The school compiles a report on each student's progress twice a year." },
    { w: "persuade", pos: "v.", ru: "убеждать",
      sat: "Unable to persuade the council with words, the architect built a model of the bridge.",
      ielts: "Advertisements persuade people to buy things they do not need." },
    { w: "reform", pos: "n.", ru: "реформа, преобразование",
      sat: "The reform of the postal system made it possible to send a letter anywhere in the country for one price.",
      ielts: "Many teachers believe that reform of the exam system is overdue." }
  ],
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Central Ideas and Details",
      ru: "Прочитай текст и, не глядя на варианты, скажи одним предложением, о чём он весь. Потом найди вариант, который говорит то же самое. В вопросах «according to the text» найди место в тексте и сравни с ним каждый вариант.",
      rule: [
        "Главная мысль покрывает весь текст. Если вариант пересказывает только одно предложение, это деталь, а не главная мысль.",
        "Вопрос о детали: верный ответ пересказывает конкретное место текста другими словами.",
        "Ловушки: слишком узко (один факт), слишком сильно (текст говорит мягче), верно в жизни, но в тексте этого нет."
      ],
      items: [
        { kind: "mcq", chk: 2,
          text: "In the British army hospitals of the Crimean War, wounds were not the main danger. Records compiled after the war showed that far more soldiers had died of diseases such as typhus and cholera than of injuries received in battle. Such diseases thrived in overcrowded wards with bad drains and dirty water. For Florence Nightingale, who had nursed in those hospitals, the conclusion was plain: most of the deaths could have been prevented.",
          stem: "Which choice best states the main idea of the text?",
          opts: [
            "Diseases such as typhus and cholera thrived in wards with dirty water.",
            "Most deaths in the army hospitals were caused by diseases that better conditions could have prevented.",
            "Florence Nightingale nursed British soldiers during the Crimean War.",
            "Battle wounds in the Crimean War were more severe than those in earlier wars."
          ], key: 1,
          ru: "Весь текст ведёт к одной мысли: солдаты умирали в основном от болезней, а не от ран, и эти смерти можно было предотвратить. Это вариант B. Вариант A верен, но пересказывает одно предложение: слишком узко. Вариант C тоже только деталь. О сравнении с прежними войнами (D) в тексте ничего нет." },
        { kind: "mcq", chk: 2,
          text: "Nightingale's best-known diagram is built from circles, each divided into twelve wedges, one for each month. For each cause, the area measured from the centre shows the death rate for that month. Each wedge carries three colours: blue for deaths from preventable disease, red for deaths from wounds, and black for deaths from all other causes. In the months with the highest death rates, the blue area is far larger than the other two.",
          stem: "According to the text, what does the diagram show about the months with the highest death rates?",
          opts: [
            "Wounds were the most common cause of death.",
            "The number of deaths was the same in every month.",
            "Preventable disease caused more deaths than wounds or other causes.",
            "More soldiers died in winter than in summer."
          ], key: 2,
          ru: "Последнее предложение: в самые тяжёлые месяцы синяя область «far larger than the other two», а синий цвет обозначает preventable disease. Значит, C. Вариант A называет красный цвет, а он меньше синего. Вариант B противоречит словам «months of heaviest loss». Вариант D похож на правду, но о временах года в тексте нет ни слова." },
        { kind: "mcq", chk: 2,
          text: "Nightingale could have presented her figures only in tables, and her reports do contain many of them. But she knew that the people she most needed to persuade, ministers and senior officers, were unlikely to study columns of numbers. A coloured diagram, she believed, could convey in a moment what a table conveyed only to a patient reader. She therefore had her diagrams printed and sent copies to people with the power to change army hospitals.",
          stem: "Which choice best states the main idea of the text?",
          opts: [
            "Nightingale chose diagrams because she thought decision-makers would grasp a picture more readily than a table.",
            "Nightingale believed that tables of figures were usually inaccurate.",
            "Ministers and senior officers refused to read any of Nightingale's reports.",
            "Nightingale was the first person to print a diagram in colour."
          ], key: 0,
          ru: "Текст объясняет, почему она выбрала диаграмму: нужных людей таблицы не убедят, а картинку они поймут сразу. Это A. Вариант B неверен: таблицы в её отчётах есть, о неточности ничего не сказано. Вариант C слишком сильный: в тексте «unlikely to study columns of numbers», а не «refused to read any reports». О том, что она была первой (D), текст не говорит." },
        { kind: "mcq", chk: 2,
          text: "In the spring of 1855 a Sanitary Commission sent from Britain reached the army hospitals at Scutari. Its workers cleaned out the sewers, removed rubbish and improved the flow of fresh air through the wards. In the months that followed, the proportion of patients who died fell sharply. Nightingale later pointed to this fall as evidence that dirty hospitals, not wounds, had been killing the soldiers.",
          stem: "According to the text, what happened after the Sanitary Commission's work?",
          opts: [
            "Fewer wounded soldiers were sent to the hospitals.",
            "Nightingale became a member of the Commission.",
            "The hospitals were moved to cleaner buildings.",
            "A smaller share of the patients died."
          ], key: 3,
          ru: "«The proportion of patients who died fell sharply» = «a smaller share of the patients died». Proportion и share здесь значат одно и то же: доля. Вариант A подменяет долю умерших числом поступивших, об этом текст молчит. Вариант C: здания чистили, а не меняли. О членстве Найтингейл в комиссии (B) в тексте ничего нет." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Academic Reading", title: "A full passage, exam format",
      ru: "Формат настоящего IELTS Academic: текст около 850 слов и 13 вопросов трёх типов. Это текст-рассуждение: у автора есть своя позиция, и первая группа вопросов проверяет, понял(а) ли ты именно её (Yes / No / Not Given). Засеки 20 минут. Отвечай только по тексту.",
      lettered: true,
      passageTitle: "More Than a Lamp",
      passage: [
        "Most people who know the name Florence Nightingale picture a woman walking through hospital wards at night with a lamp in her hand. The image was popularised by newspaper reports from the Crimean War, and it has proved remarkably durable. It is not exactly false: she did spend long hours among the sick at the British army hospital at Scutari, where she arrived in November 1854. But the image captures the least original part of her achievement. Many women nursed soldiers in that war, and some did so with great courage. What set Nightingale apart was something far less picturesque: an insistence that the causes of death could be counted, and that the counting should change the way institutions behaved.",
        "The hospital she found was overcrowded and built above defective drains, and during the first winter mortality among its patients was appalling. Most of those who died had been killed not by their wounds but by diseases such as typhus and cholera, which spread rapidly in filthy, poorly ventilated wards. In the spring of 1855 a Sanitary Commission sent from Britain arrived, cleared the sewers, removed rubbish and improved the ventilation, and the proportion of patients who died fell sharply in the following months. It would be easy to credit this improvement to Nightingale's nursing, and popular accounts often do. The more defensible view is that cleaner buildings saved more lives than any individual nurse could have done.",
        "Nightingale herself appears to have drawn the same conclusion, and it shaped the rest of her life. After returning to Britain in 1856, she worked closely with William Farr, the leading medical statistician of the day, to compile and analyse the army's records. Each death had been attributed to a cause, and by grouping these causes she could show how many soldiers had died of preventable disease compared with wounds. The comparison was damning. Even in peacetime, she found, soldiers living in barracks at home died at a higher rate than civilian men of the same age, a fact she presented as proof that the army's own buildings were endangering its men.",
        "Her best-known contribution is a diagram published in 1858. Suspecting that busy officials would never work through pages of tables, she drew circles divided into twelve wedges, one for each month, in which each coloured area was measured from the centre and represented the rate of death from one cause. The form was not wholly her invention, since circular charts had appeared in print before, but she used it with unusual purpose. I would argue that it remains one of the most effective pieces of visual persuasion ever produced, precisely because a reader grasps its message before reading a single number.",
        "Persuasion, however, is not the same as neutral description, and the diagram deserves to be read critically. Readers tend to judge each wedge by its length rather than by its area, and so they can easily misjudge how much larger one month's losses were than another's. Nightingale also decided how to arrange the two years of data, placing them in separate circles. That layout makes the fall in the death rate easy to see without tracing each month across a table. None of this involved altering the figures. It does mean, though, that the diagram was an argument rather than a simple record, and it should be judged as one.",
        "The argument succeeded. Copies of her reports went to ministers, senior officers and other influential readers, and they helped to persuade the government that poor sanitation had cost more lives than enemy action. Reform followed: barracks and military hospitals were rebuilt or altered to provide better drainage, cleaner water and more fresh air, and the army improved the way it collected statistics about the health of its soldiers. Nightingale later applied the same methods to the condition of British troops stationed in India, working largely from documents and correspondence rather than visiting the country herself.",
        "Remembering Nightingale chiefly as a nurse is therefore not wrong, but it is incomplete. She did help to make nursing a respectable profession, and the training school she founded at St Thomas' Hospital in London in 1860 became a model for others. Yet her deepest legacy may be the principle that a public institution should measure the harm it causes and be held to account for it. That principle is now so familiar that its origin is easily forgotten, and for that reason students of statistics have at least as much cause to remember her as students of nursing."
      ],
      items: [
        { group: { title: "Questions 1–6", task: "Do the following statements agree with the claims of the writer? Choose YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.",
            ru: "Это Yes / No / Not Given: проверяются не факты, а мнение автора. YES — автор так считает. NO — автор считает обратное. NOT GIVEN — автор об этом своего мнения не высказывает. Утверждения идут по порядку текста." },
          kind: "tfng", yn: true, chk: 2, stem: "The popular picture of Nightingale carrying a lamp has no basis in fact.", key: "F",
          ru: "NO. A: «It is not exactly false: she did spend long hours among the sick». Автор считает образ неполным, но не выдуманным." },
        { kind: "tfng", yn: true, chk: 2, stem: "Newspaper reporting from the Crimean War was generally reliable.", key: "NG",
          ru: "NOT GIVEN. A: автор говорит только, что образ с лампой распространили газеты и что он «not exactly false». Насколько точны были газеты вообще, автор не оценивает. Ловушка: «not exactly false» относится к одному образу, а не ко всей прессе." },
        { kind: "tfng", yn: true, chk: 2, stem: "At Scutari, fixing the buildings probably saved more lives than any one nurse could have saved.", key: "T",
          ru: "YES. B: «The more defensible view is that cleaner buildings saved more lives than any individual nurse could have done». Ловушка: «popular accounts often do» — это мнение других, а не автора." },
        { kind: "tfng", yn: true, chk: 2, stem: "Nightingale had been taught mathematics as a young woman.", key: "NG",
          ru: "NOT GIVEN. C говорит, что после войны она работала со статистиком Фарром, но о её образовании текст молчит. Даже если ты знаешь это из её биографии, по тексту ответ NOT GIVEN." },
        { kind: "tfng", yn: true, chk: 2, stem: "Nightingale changed some of the army's figures to make her case stronger.", key: "F",
          ru: "NO. E: «None of this involved altering the figures». Она выбрала, как расположить данные, но сами числа не меняла. Ловушка: автор советует читать диаграмму критически, но это не значит, что цифры подделаны." },
        { kind: "tfng", yn: true, chk: 2, stem: "Remembering Nightingale matters at least as much to people studying statistics as to those studying nursing.", key: "T",
          ru: "YES. G: «students of statistics have at least as much cause to remember her as students of nursing»." },

        { group: { title: "Questions 7–10", task: "Complete each sentence with the correct ending, A–G, below.", labels: "letters", listTitle: "List of endings",
            ru: "Окончаний семь, нужно четыре: три лишние. Начало предложения укажет нужный абзац, а окончание должно совпасть по смыслу, а не по словам.",
            headings: ["once the hospital's drains and ventilation had been improved.", "because people compare how far the wedges reach instead of how much space they cover.", "because more nurses had arrived from Britain.", "because those who held power were unlikely to study long tables.", "because soldiers at home were more likely to die than other men of their age.", "because the army's records were incomplete.", "because she had visited every barracks herself."] },
          kind: "match", chk: 2, stem: "The death rate among patients at Scutari fell sharply", key: 0,
          ru: "A: после Санитарной комиссии весной 1855 года «the proportion of patients who died fell sharply». Ловушка C: о новых медсёстрах текст не говорит, а автор как раз спорит с тем, что улучшение — заслуга ухода." },
        { kind: "match", chk: 2, stem: "Nightingale claimed that the army's own buildings put soldiers at risk", key: 4,
          ru: "E: солдаты в казармах «died at a higher rate than civilian men of the same age» (more likely to die = higher rate), и она представила это как доказательство. Ловушка G: что она объехала все казармы, текст не говорит." },
        { kind: "match", chk: 2, stem: "Nightingale used a chart to reach busy officials", key: 3,
          ru: "D: «Suspecting that busy officials would never work through pages of tables». Those who held power = busy officials, ministers." },
        { kind: "match", chk: 2, stem: "Readers of the diagram may misjudge the difference between two months", key: 1,
          ru: "B: «Readers tend to judge each wedge by its length rather than by its area». How far the wedges reach = length, how much space they cover = area. Ловушка F: о неполных записях текст не говорит." },

        { group: { title: "Questions 11–13", task: "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
            ru: "Пересказ одного абзаца (F). Слово берётся из текста без изменений, и только одно." },
          kind: "gap", chk: 2, limit: 1, accept: ["sanitation"],
          stem: "Nightingale's reports reached people with influence and helped to convince the government that bad ______ had killed more soldiers than the enemy had.",
          ru: "F: «poor sanitation had cost more lives than enemy action». Bad = poor, killed more = cost more lives." },
        { kind: "gap", chk: 2, limit: 1, accept: ["statistics"],
          stem: "As well as improving its buildings, the army changed the way it gathered ______ on the health of its men.",
          ru: "F: «improved the way it collected statistics about the health of its soldiers». Ловушка: records — слово из абзаца C, а здесь нужно то, что армия стала собирать лучше." },
        { kind: "gap", chk: 2, limit: 1, accept: ["India"],
          stem: "She later studied the condition of British soldiers serving in ______, mostly through papers and letters.",
          ru: "F: «troops stationed in India, working largely from documents and correspondence»." }
      ] },

    { type: "speaking", id: "speak", label: "IELTS-style · Speaking Part 2", title: "Main idea first, then the details",
      ru: "Минуту готовься и запиши четыре-пять ключевых слов, потом говори до двух минут. Строй ответ как хороший абзац: первым предложением назови главную мысль, потом дай детали по пунктам карточки, в конце вернись к главной мысли. Можно записать себя: запись остаётся только на этом устройстве.",
      prompts: [
        "Describe a chart, map or diagram that helped you understand something.",
        "You should say: what it showed",
        "where you saw it",
        "what you understood from it",
        "and explain why a picture worked better than words."
      ],
      prep: 60, talk: 120,
      pron: { title: "Pronunciation: stress in long words", ru: "В словах на -tion ударение падает на слог перед -tion, в словах на -ity на третий слог от конца. Произнеси каждое слово три раза, ударный слог громче и длиннее.",
        items: ["mor-TAL-i-ty", "san-i-TA-tion", "pro-POR-tion", "pre-VENT-a-ble", "at-TRIB-ute (глагол; у существительного AT-trib-ute)", "com-PILE", "per-SUADE", "re-FORM"] },
      model: "I'd like to describe a pair of bar charts that changed how I think about health. I saw them in a biology lesson; our teacher had compiled them from public records. The first chart showed causes of death a century ago, and the second showed causes of death today. The main idea was clear at once: in the past a large proportion of deaths were attributed to infections, whereas today that share is small. From this I understood that many of those early deaths were preventable, and that sanitation and clean water did a great deal to reduce mortality. A picture worked better than words because I could compare the bars in a second, while a paragraph of figures would have lost me. It even persuaded me to read about the history of public health reform." },

    { type: "writing", id: "write", label: "Writing micro-task", title: "A topic sentence",
      ru: "В каждом абзаце не хватает первого предложения. Напиши для каждого topic sentence: одно предложение, которое называет главную мысль всего абзаца. Оно не должно повторять одну из деталей и не должно обещать больше, чем есть в абзаце.",
      prompts: [
        "[Your topic sentence.] The sewers under the hospital were cleaned out. Rubbish was carried away, and windows were opened so that fresh air could move through the wards. Within months, a far smaller proportion of the patients died.",
        "[Your topic sentence.] A table has to be read line by line. A diagram can be understood at a glance. Officials who would never study a column of figures could not miss a large blue shape on the page."
      ],
      minWords: 20,
      checklist: ["Каждое моё предложение покрывает все детали абзаца, а не одну.", "Я не повторил(а) деталь из абзаца слово в слово.", "Предложение не обещает больше, чем есть в абзаце.", "Я использовал(а) минимум два слова урока.", "Я проверил(а) подлежащее и сказуемое в каждом предложении."],
      model: [
        "Simple improvements in sanitation sharply reduced mortality in the hospital.",
        "Nightingale chose a diagram because it could persuade readers who would never study a table."
      ] },

    { type: "questions", id: "exit", label: "Exit check", title: "Two questions before you go",
      ru: "По одному вопросу на каждый экзамен. Без подсказок.",
      items: [
        { kind: "mcq", chk: 2,
          text: "William Farr spent decades compiling the official records of births and deaths in England and Wales. He was convinced that such figures were more than a list: by comparing mortality in one district with mortality in another, officials could see where people were dying of preventable causes and act. Nightingale, who worked with Farr after the war, applied the same reasoning to the army.",
          stem: "Which choice best states the main idea of the text?",
          opts: [
            "Farr compiled official records of births and deaths.",
            "Nightingale taught Farr how to compare districts.",
            "Farr believed that comparing death records could show where lives might be saved.",
            "Mortality was the same in every district."
          ], key: 2,
          ru: "Главная мысль: по убеждению Фарра, сравнение записей о смертности показывает, где смерти можно предотвратить. Это C. Вариант A верен, но это одна деталь из первого предложения. В варианте B всё наоборот: Найтингейл применила рассуждение Фарра. Вариант D противоречит тексту: сравнивать районы имеет смысл, только если смертность в них разная." },
        { kind: "tfng", chk: 2,
          text: "A larger coloured area represented a higher death rate. The blue areas, which stood for preventable disease, dominated the page; the red areas, which stood for wounds, were far smaller.",
          stem: "The largest areas on the diagram showed deaths from wounds.", key: "F",
          ru: "FALSE. На странице преобладали синие области, а они обозначают preventable disease. Раны показаны красным, и красные области «far smaller»." }
      ] }
  ],
  handoff: { text: "One diagram carried the main idea. Next, the report around it: how the order of its parts persuades.", next: "C08" }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C08 = {
  id: "C08",
  title: "How a Report Persuades",
  thread: "Order is part of the message.",
  intro: "В прошлом уроке одна диаграмма несла главную мысль целого отчёта. Сегодня важен порядок: как отчёт выстраивает материал, чтобы убедить читателя. На SAT это Text Structure and Purpose: понять, зачем написан текст и какую работу делает каждое предложение. В IELTS Reading это matching information: найти абзац, где есть нужная информация, а в Writing Task 2 — абзац, который ведёт от мысли к примеру и отвечает на возражение. Все тексты урока о докладе Эдвина Чедвика 1842 года об условиях жизни бедных в Британии.",
  words: [
    { w: "anticipate", pos: "v.", ru: "предвидеть, заранее ожидать",
      sat: "The architect anticipated the residents' concerns and added a garden to the plans before anyone asked.",
      ielts: "Good planners anticipate problems before they become expensive." },
    { w: "objection", pos: "n.", ru: "возражение",
      sat: "The committee's main objection to the proposal was not its cost but its timing.",
      ielts: "The most common objection to working from home is that it isolates people." },
    { w: "illustrate", pos: "v.", ru: "иллюстрировать, показывать на примере",
      sat: "The author illustrates her argument with the history of a single village.",
      ielts: "This example illustrates how quickly technology can change our habits." },
    { w: "underscore", pos: "v.", ru: "подчёркивать, усиливать (мысль, вывод)",
      sat: "The second study underscored the findings of the first, reaching the same result with a larger sample.",
      ielts: "Recent floods underscore the need for better planning in coastal towns." },
    { w: "recommend", pos: "v.", ru: "рекомендовать, советовать",
      sat: "The engineers recommended that the bridge be closed until the repairs were complete.",
      ielts: "Many teachers recommend reading for pleasure as a way to build vocabulary." },
    { w: "concede", pos: "v.", ru: "признавать (нехотя, уступая в споре)",
      sat: "The critic conceded that the novel's opening was brilliant, though she found its ending weak.",
      ielts: "I concede that public transport is slower, but it is far cheaper." },
    { w: "subsequently", pos: "adv.", ru: "впоследствии, затем",
      sat: "The manuscript was lost in 1820 and subsequently found in a private library.",
      ielts: "She studied engineering and subsequently worked as a teacher." },
    { w: "compelling", pos: "adj.", ru: "убедительный, неотразимый",
      sat: "The most compelling evidence for the theory came from a single, carefully dated fossil.",
      ielts: "There are compelling reasons to invest in public libraries." }
  ],
  parts: [
    { type: "questions", id: "sat", label: "SAT · Reading and Writing", title: "Text Structure and Purpose",
      ru: "Не пересказывай, о чём текст. Назови одним глаголом, что делает каждое предложение: вводит, иллюстрирует, оспаривает, уступает, объясняет. Потом найди вариант, где все глаголы совпадают с твоей картой и стоят в том же порядке.",
      rule: [
        "Вопрос о цели или структуре спрашивает, что текст делает, а не о чём он. Ответ описывает действия: presents, illustrates, challenges, concedes.",
        "Составь карту: два-три слова на предложение (claim, example, objection, answer). Верный вариант совпадает со всей картой и с её порядком.",
        "Ловушка: вариант верен наполовину. Проверь обе части, особенно второй глагол."
      ],
      items: [
        { kind: "mcq", chk: 2,
          text: "A fictional museum summary of Edwin Chadwick's 1842 report on the living conditions of the poor saves the proposals for last. First it describes crowded houses and streets without drains, quoting doctors from many parts of the country. Next it presents tables showing the difference in recorded ages at death between social groups. Finally, the summary gives Chadwick's proposals for drains, clean water and regular refuse collection.",
          stem: "Which choice best describes the overall structure of the text?",
          opts: ["It explains why a report was ignored and then describes its author's later career.", "It identifies a choice about where to put the proposals and then traces the order in which the summary presents its material.", "It compares two reports and argues that one of them was more persuasive.", "It describes a problem and then explains why that problem could not be solved."], key: 1,
          ru: "В первом предложении автор пересказа оставляет рекомендации напоследок. Затем first, next и finally показывают порядок частей. Это B. A: о том, что отчёт проигнорировали, и о карьере нет ни слова. C: отчёт один. D: решение как раз предложено в конце." },
        { kind: "mcq", chk: 2,
          text: "Many readers of government reports skip straight to the recommendations. For this reason, some authors put their recommendation on the first page, alongside their strongest evidence. Others take the opposite approach, saving the recommendations for last so that readers must pass through the evidence to reach them. In that structure, the reader weighs the case before seeing the proposed action.",
          stem: "Which choice best describes the function of the third sentence in the overall structure of the text?",
          opts: ["It presents an alternative to the approach described in the previous sentence.", "It explains why many readers skip to the recommendations.", "It gives an example of the approach described in the second sentence.", "It states the main conclusion of Chadwick's report."], key: 0,
          ru: "«Others take the opposite approach» — другой подход в сравнении со вторым предложением: A. B: причину пропуска текст не объясняет. C: третье предложение описывает второй подход, поэтому это не пример первого. D: вывод отчёта не назван." },
        { kind: "mcq", chk: 2,
          text: "The Public Health Act of 1848 created a General Board of Health for England and Wales. The Act allowed towns to set up local boards responsible for drainage, water supply and street cleaning, but it required them to do so only where the death rate was especially high. Elsewhere, the decision was left to local people. As a result, the Act's effects varied greatly from one town to the next.",
          stem: "Which choice best states the main purpose of the text?",
          opts: ["To argue that the Act should have forced every town to set up a local board", "To describe the daily work of the local boards of health", "To explain why a law had uneven effects across different towns", "To compare public health in England with public health in other countries"], key: 2,
          ru: "Текст ведёт к последнему предложению: эффект закона был разным, потому что во многих городах решение оставили местным жителям. Это C. A: автор не спорит и ничего не требует. B: работа местных советов только названа. D: других стран нет." },
        { kind: "mcq", chk: 2,
          text: "A reader might suspect that the doctors quoted in Chadwick's report exaggerated local conditions. The report gives the reader a second kind of evidence to consider: tables showing stark differences in the average age at death recorded for different social groups in the same towns.",
          stem: "Which choice best describes the overall structure of the text?",
          opts: ["It describes a report's findings and then questions their accuracy.", "It summarises a disagreement between two groups of doctors.", "It explains in detail how a set of tables was compiled.", "It presents a doubt about a report and then describes evidence that bears on that doubt."], key: 3,
          ru: "1 — сомнение (врачи преувеличили); 2 — таблицы, которые сомнение сняли: D. A переворачивает порядок: сначала сомнение, потом доказательство, а не наоборот. B: спорят читатели, а не две группы врачей. C: как составлены таблицы, не сказано." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Academic Reading", title: "A full passage, exam format",
      ru: "Формат настоящего IELTS Academic: текст около 850 слов и 13 вопросов трёх типов. На экзамене на него уходит около 20 минут. Засеки время. Отвечай только по тексту. Сначала прочитай текст и подпиши для себя каждый абзац одним-двумя словами (background, scenes, numbers…): это сразу поможет в первой группе вопросов.",
      lettered: true,
      passageTitle: "A Report Built to Persuade",
      passage: [
        "When a government report changes the law, readers tend to remember its conclusions and forget its architecture. Yet the order in which evidence is presented can matter as much as the evidence itself. A reader who meets a recommendation on the first page may reject it before seeing why it was made, whereas a reader who reaches it only after pages of carefully arranged facts may find it difficult to resist. We can illustrate the effect by following one possible route through a report on the living conditions of the British poor, published in 1842 under the name of Edwin Chadwick.",
        "Chadwick was a lawyer by training and an administrator by temperament. As secretary to the commission that ran the system of poor relief in England and Wales, he had seen that illness was one of the commonest reasons why families came to depend on public support. In 1839 he was asked to investigate the sanitary condition of working people, and he spent nearly three years collecting material. When the report was ready, the commissioners for whom he worked were unwilling to put their names to some of its sharper criticisms, and it therefore appeared under his name alone.",
        "Our first stop is the evidence gathered from people who had seen the conditions for themselves. Chadwick had gathered accounts from doctors and local officials in many parts of the country, and he quoted them at length: streets without drains, courtyards where refuse lay uncollected for weeks, houses crowded around a single shared toilet, wells that drew water from ground soaked with waste. These descriptions were not presented as statistics. They were intended to make a comfortable reader see conditions that few such readers had ever witnessed, and to establish, before any argument began, that the problem was both widespread and severe.",
        "The next stop is the numerical evidence. Chadwick compiled tables comparing the average age at death of different classes of people living in the same towns, and the contrasts were stark: labourers in industrial towns died, on average, far younger than professional men and gentry living nearby. Read alongside the descriptions, the figures do not have to persuade on their own. They underscored what the reader had already been shown, and they made it much harder to dismiss the earlier accounts as exaggeration.",
        "The report also anticipated the objections that its readers were most likely to raise. The most serious was cost, since drainage, paving and piped water would require large public spending at a time when many taxpayers believed that the poor were responsible for their own condition. Chadwick did not concede that sanitation was simply a matter of charity. Instead, he argued that disease was expensive. When a working man died young, his widow and children frequently had to be supported from local taxes, so money spent on prevention would, in his view, reduce the far greater sums spent on relief. Whatever one thinks of this reasoning, it moved the debate onto financial ground, where his opponents could not easily dismiss it.",
        "Our route through the report ends with the recommendations. Chadwick recommended that towns should remove refuse regularly, supply clean water to houses and carry waste away through drains, and he argued that responsibility for these services should be given to single public bodies advised by trained engineers, rather than divided among many competing local interests. By the time readers reach these proposals in this sequence, they have already considered the description of the problem, the evidence of its scale and the claim that solving it would save money. The recommendations can therefore appear less like demands than like conclusions.",
        "The report was widely read and discussed. It helped build the case for the 1848 Public Health Act, which created a General Board of Health with Chadwick among its members. The report's influence is one reason to study the way its claims and evidence fit together, even where later readers question assumptions that once seemed persuasive. Some of his scientific assumptions were also mistaken: like most of his contemporaries, he believed that disease was spread by foul air rather than by contaminated water. Even so, his compelling arrangement of evidence remains a model of persuasive writing, and the pattern of problem, evidence, objection and solution gives a writer today a way to build a case one step at a time."
      ],
      items: [
        { group: { title: "Questions 1–5", task: "The passage has seven paragraphs, A–G. Which paragraph contains the following information? You may use any letter more than once.", paras: 7,
            ru: "Это matching information: ищи не главную мысль абзаца, а место, где есть эта деталь. Порядок вопросов не совпадает с порядком текста, и некоторые абзацы не понадобятся." },
          kind: "match", chk: 2, stem: "a reference to a mistaken belief held by the author of the report", key: 6,
          ru: "G: «Some of his scientific assumptions were also mistaken: … he believed that disease was spread by foul air». Mistaken belief = mistaken assumptions." },
        { kind: "match", chk: 2, stem: "an argument intended to make reform seem financially sensible", key: 4,
          ru: "E: Чедвик доказывал, что болезнь дорога и что профилактика сократит расходы на помощь. Ловушка F: там рекомендации, а не довод о деньгах." },
        { kind: "match", chk: 2, stem: "an explanation of why the report carried only one person's name", key: 1,
          ru: "B: комиссары не захотели подписываться под резкой критикой, поэтому доклад вышел только под именем Чедвика." },
        { kind: "match", chk: 2, stem: "an example of numerical evidence being used to support descriptive material that came before it", key: 3,
          ru: "D: таблицы шли после описаний и «underscored what the reader had already been shown». Ловушка A: там общая мысль о порядке, без цифр." },
        { kind: "match", chk: 2, stem: "an account of the kind of evidence the writer examines first", key: 2,
          ru: "C: «The report opens not with a proposal but with scenes» и дальше перечислено, что это за сцены." },

        { group: { title: "Questions 6–9", task: "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
            ru: "Ответы идут по порядку текста. Предложение после вставки должно быть грамматически верным." },
          kind: "gap", chk: 2, limit: 2, accept: ["illness"],
          stem: "Before his inquiry began, Chadwick had observed that ______ was a frequent cause of families needing public help.",
          ru: "B: «illness was one of the commonest reasons why families came to depend on public support». Frequent cause = one of the commonest reasons." },
        { kind: "gap", chk: 2, limit: 2, accept: ["local officials", "officials"],
          stem: "The testimony Chadwick gathered included reports from doctors and ______.",
          ru: "C: «accounts from doctors and local officials». Засчитывается и одно officials." },
        { kind: "gap", chk: 2, limit: 2, accept: ["gentry", "the gentry"],
          stem: "The tables revealed that labourers in factory towns had much shorter lives than professional men and ______ living close by.",
          ru: "D: «far younger than professional men and gentry living nearby». Shorter lives = died younger." },
        { kind: "gap", chk: 2, limit: 2, accept: ["engineers", "trained engineers"],
          stem: "Chadwick wanted the bodies in charge of town services to take advice from qualified ______.",
          ru: "F: «single public bodies advised by trained engineers». Qualified = trained, поэтому ответ engineers; trained engineers тоже в лимите." },

        { group: { title: "Questions 10–13", task: "Choose the correct letter, A, B, C or D.",
            ru: "Вопросы идут по порядку текста. Ищи то, что говорит автор, а не то, что звучит разумно." },
          kind: "mcq", chk: 2, stem: "What is the writer's main point in paragraph A?", key: 2,
          opts: ["Government reports are usually remembered for the way they are organised.", "Recommendations should always appear on the first page of a report.", "The sequence in which evidence appears can affect how readers respond to a proposal.", "Most readers reject reports that contain a large number of facts."],
          ru: "C: «the order in which evidence is presented can matter as much as the evidence itself». A противоречит тексту: помнят выводы и забывают «architecture». B: автор показывает риск такого порядка. D в тексте нет." },
        { kind: "mcq", chk: 2, stem: "How did Chadwick deal with the objection about cost?", key: 0,
          opts: ["He claimed that preventing disease would cost less than supporting its victims.", "He accepted that sanitation was mainly a charitable duty.", "He suggested that the poor should pay for their own drains.", "He proved that taxpayers were wrong to blame the poor."],
          ru: "A: профилактика сократит «the far greater sums spent on relief». B противоречит тексту: «did not concede that sanitation was simply a matter of charity». C в тексте нет. D: мнение налогоплательщиков упомянуто, но Чедвик его не опровергал, а перевёл спор на деньги." },
        { kind: "mcq", chk: 2, stem: "In the sequence the writer describes, why can the recommendations seem like conclusions?", key: 3,
          opts: ["They had been written by trained engineers.", "They were much shorter than the rest of the report.", "They repeated the descriptions from the opening pages.", "Readers had already considered the case for those proposals."],
          ru: "D: к рекомендациям читатель уже рассмотрел описание проблемы, доказательства масштаба и довод об экономии. A: инженеры должны были советовать будущим органам, а не писать доклад. B и C в тексте нет." },
        { kind: "mcq", chk: 2, stem: "What does the writer say about Chadwick's ideas on how disease spread?", key: 1,
          opts: ["They led directly to his removal from the board.", "They reflected an error that he shared with many people of his time.", "They were confirmed by the Public Health Act of 1848.", "They were the main reason why his report was widely read."],
          ru: "B: «like most of his contemporaries, he believed that disease was spread by foul air». A: текст не говорит, что его теория повлияла на уход из совета. C и D в тексте нет." }
      ] },

    { type: "speaking", id: "speak", label: "IELTS-style · Speaking Part 2", title: "Two full minutes, in order",
      ru: "Минуту готовься: запиши по одному-два слова на каждый пункт карточки. Потом говори все две минуты, без остановки. Держи порядок, как в разборе доклада Чедвика: что было → как тебя убеждали → почему сработало. Связки-указатели (first of all, the main reason, in the end) помогают и тебе, и экзаменатору. Можно записать себя: запись остаётся только на этом устройстве.",
      prompts: [
        "Describe a time when someone persuaded you to change your mind about something.",
        "You should say: what you thought at first",
        "who persuaded you",
        "how they persuaded you",
        "and explain why their argument worked."
      ],
      prep: 60, talk: 120,
      pron: { title: "Pronunciation: stress in the lesson words and in signposts", ru: "Выдели ударный слог: он громче и длиннее. В указателях ударение падает на смысловое слово, а не на the или of. Сначала слова, потом фразы.",
        items: ["an-TIC-i-pate", "ob-JEC-tion", "IL-lus-trate", "un-der-SCORE (глагол)", "rec-om-MEND", "con-CEDE", "SUB-se-quent-ly", "com-PEL-ling", "FIRST of all", "the MAIN reason", "in the END"] },
      model: "I'd like to talk about the time my older cousin persuaded me to start reading English novels. At first, I thought it was a waste of time, because I could learn words faster from lists. First of all, she didn't argue with me. She anticipated my objection and conceded that lists are quick. Then she showed me a page from a novel she was reading and asked me to guess three words from the context. I guessed two of them, and she pointed out that I would remember them much longer, because they were part of a story. The main reason her argument worked was its order: she started with my view, then gave me evidence I had produced myself, and only at the end recommended a book. Subsequently, I read my first novel in English, and I still think it was the most compelling argument anyone has made to me." },

    { type: "writing", id: "write", label: "Writing micro-task", title: "One Task 2 body paragraph",
      ru: "Напиши один абзац основной части эссе IELTS Task 2 (не всё эссе). Порядок: главная мысль → объяснение → пример → возражение и ответ на него → связь с мыслью абзаца. Пример можно взять из урока, но он должен доказывать мысль, а не просто быть историей.",
      prompts: ["Some people believe that governments should spend more money on preventing problems, such as illness, than on dealing with them after they happen. Write one body paragraph that supports this view."],
      minWords: 90,
      checklist: ["Первое предложение называет главную мысль абзаца.", "Сразу после мысли идёт объяснение, почему это так.", "Пример доказывает мысль, а не просто рассказывает историю.", "Я назвал(а) возможное возражение и ответил(а) на него, а не просто отверг(ла) его.", "Последнее предложение возвращает к главной мысли.", "Я использовал(а) минимум три слова урока."],
      model: [
        "Spending on prevention is usually the cheaper choice for a government in the long run. Problems such as illness grow more expensive the longer they are left, because treatment, lost working days and support for families all add to the final cost. Edwin Chadwick's report of 1842 illustrates this point: he argued that clean water and drains would cost less than supporting the families of workers who died young. Critics may object that prevention requires large sums before any benefit is visible. I would concede that the first costs are high, but this objection underscores the need for long-term planning rather than defeating the argument. For this reason, a compelling case can be made for prevention."
      ] },

    { type: "questions", id: "exit", label: "Exit check", title: "Two questions before you go",
      ru: "По одному вопросу на каждый экзамен. Без подсказок.",
      items: [
        { kind: "mcq", chk: 2,
          text: "A report on a town's water supply begins by describing complaints from residents about the taste of their water. It then presents the results of tests on samples taken from three wells. It ends by recommending that one of the wells be closed.",
          stem: "Which choice best describes the overall structure of the text?",
          opts: ["It moves from a problem, to evidence about it, to a proposed action.", "It describes a recommendation and then lists objections to it.", "It compares three towns and their water supplies.", "It explains how water samples are tested in a laboratory."], key: 0,
          ru: "Жалобы (проблема) → результаты проверки (доказательства) → рекомендация (действие): A. B переворачивает порядок и добавляет возражения, которых нет. C: город один, колодцев три. D: как проверяют пробы, не сказано." },
        { kind: "tfng", chk: 2,
          text: "The lesson's article examines testimony and statistical tables from Chadwick's report before turning to his recommendations.",
          stem: "The lesson's article discusses the recommendations before the evidence.", key: "F",
          ru: "FALSE. «Before turning to his recommendations» показывает, что статья сначала разбирает данные. В утверждении порядок обратный." }
      ] }
  ],
  handoff: { text: "The same evidence can persuade differently when its order changes. Next, the cases a report leaves out: what the data does not say.", next: "C09" }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C09 = {
  id: 'C09',
  title: 'What the Data Does Not Say',
  thread: 'The missing cases matter most.',
  intro: 'В C08 порядок доказательств менял силу аргумента. Здесь проверим, что происходит, когда часть наблюдений пропадает. Пример с каналом вымышленный. В SAT нужен вывод, который следует из данных, а в IELTS важно различать слова автора и собственные догадки.',
  words: [
    {
      w: 'infer',
      pos: 'v.',
      ru: 'делать вывод по косвенным признакам',
      sat: 'The tutor inferred that the second delivery was late from the time on its receipt.',
      ielts: 'We cannot infer the evening water level from a reading taken at dawn.'
    },
    {
      w: 'omit',
      pos: 'v.',
      ru: 'пропускать, исключать',
      sat: 'The chart omits days when the station was closed.',
      ielts: 'A report may omit details that readers need to judge the result.'
    },
    {
      w: 'detect',
      pos: 'v.',
      ru: 'обнаруживать',
      sat: 'A second survey detected changes hidden in the first.',
      ielts: 'The gauge cannot detect what happens upstream.'
    },
    {
      w: 'representative',
      pos: 'adj.',
      ru: 'представительный, типичный для всей группы',
      sat: 'The sample may not be representative of the entire neighbourhood.',
      ielts: 'Calm mornings may not be representative of all conditions on the canal.'
    },
    {
      w: 'whereabouts',
      pos: 'n.',
      ru: 'местонахождение',
      sat: 'The whereabouts of the missing notebook remained unknown.',
      ielts: 'The log did not reveal the whereabouts of the inspector.'
    },
    {
      w: 'systematic',
      pos: 'adj.',
      ru: 'закономерный, систематический',
      sat: 'The locations of the gaps suggest a systematic error.',
      ielts: 'A systematic gap can matter more than several unrelated missing readings.'
    },
    {
      w: 'provisional',
      pos: 'adj.',
      ru: 'предварительный',
      sat: 'The conclusion was provisional until the team checked the missing dates.',
      ielts: 'A provisional summary can guide the next inspection.'
    },
    {
      w: 'verify',
      pos: 'v.',
      ru: 'проверять достоверность',
      sat: 'The editor verified the dates against the original records.',
      ielts: 'An independent reading can help verify the scale.'
    }
  ],
  parts: [
    {
      type: 'questions',
      id: 'sat',
      label: 'SAT · Reading and Writing',
      title: 'Draw the inference the evidence supports',
      ru: 'Выбери вывод, который логически следует из условий. Все ситуации вымышлены.',
      items: [
        {
          kind: 'mcq',
          text: 'At a canal gate, the last recorded inspection before dawn showed the water below the warning mark. The next inspection took place at noon and again showed water below that mark. No device recorded the intervening hours. Therefore, the two inspections alone cannot establish that ______',
          stem: 'Which choice most logically completes the text?',
          opts: [
            'the noon reading was below the warning mark.',
            'the water stayed below the warning mark throughout the morning.',
            'the later inspection took place after the earlier one.',
            'the inspection after dawn occurred at noon.'
          ],
          key: 1,
          ru: 'B. Два замера дают точки на линии, оставляя промежуток неизвестным. A, C и D известны из текста.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'To see whether canal users preferred a higher handrail, a council posted a questionnaire at the only staircase without a ramp. Anyone who avoided that entrance because they could not use stairs was unlikely to see the questionnaire. Even if the questionnaire receives many replies, the council should be cautious about claiming that ______',
          stem: 'Which choice most logically completes the text?',
          opts: [
            'the questionnaire was posted at a canal entrance.',
            'the chosen staircase had no ramp.',
            'the responses are representative of everyone who uses the canal.',
            'people who avoided the staircase were unlikely to see the questionnaire.'
          ],
          key: 2,
          ru: 'C. Много ответов с одной лестницы всё равно не охватывают людей, которые её обходят. A, B и D прямо даны в тексте, их не нужно проверять по откликам.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'Two staff members recorded levels from the same gauge. Mina wrote down the reading every time she visited. Leo wrote it down only on visits when the pointer was above the red line. The difference in recording rules suggests that ______',
          stem: 'Which choice most logically completes the text?',
          opts: [
            'Leo’s notebook cannot show how often the gauge stayed below the red line.',
            'the gauge showed a different level to each observer at the same moment.',
            'Mina’s notebook must contain fewer entries than Leo’s.',
            'Leo moved the red line before taking each reading.'
          ],
          key: 0,
          ru: 'A. В журнале Лео низкие показания пропущены по правилу. B и D приписывают прибору и Лео действия, о которых текст молчит. Для C не дано число посещений.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'A crew noticed that the canal gauge stopped moving after the cover was damaged. They could still read a separate measuring staff beside the gate. When the staff showed a rise but the pointer stayed in the same position, the crew concluded that ______',
          stem: 'Which choice most logically completes the text?',
          opts: [
            'the staff had never been used to check the gauge.',
            'the damage made the water level rise.',
            'all earlier entries in the log had been wrong.',
            'the fixed pointer should not be taken as proof of a steady water level.'
          ],
          key: 3,
          ru: 'D. Независимый замер меняется, а застывшая стрелка — нет. B путает повреждение прибора с причиной подъёма воды. C распространяет вывод на прошлые записи без доказательства. A в тексте нет.',
          chk: 2
        }
      ]
    },
    {
      type: 'questions',
      id: 'ielts',
      label: 'IELTS Academic · Reading',
      title: 'What a blank column hides',
      ru: 'Прочитай статью и ответь на 13 вопросов. Схема показывает учебную модель прибора из вымышленного примера.',
      lettered: true,
      passageTitle: 'A Blank in the Canal Log',
      passage: [
        'A tidy record invites a reader to believe that it tells a complete story, whereas a line of blanks is less reassuring, particularly if the entries on either side look quite ordinary. It may be tempting to draw a smooth line between those entries and carry on with the analysis, although I would treat that line as a guess. The following fictional case, set at a canal gate, is a way of thinking about the difference between a measurement that was made and a measurement that simply looks as though it could have been made.',
        'Imagine that a caretaker visits a gate twice a day and notes its water level in a book, a routine that seems reliable until she is asked to compare a sheltered stretch of canal with an exposed one. When the track to the exposed gate becomes slippery, the caretaker postpones her visit. The notebook therefore contains many readings from quiet mornings and fewer from mornings when access is difficult. The whereabouts of the caretaker on any particular missed visit cannot be inferred from an empty box, but the pattern of entries gives a reason to question how representative the recorded mornings are.',
        'The gate in this example has a simple mechanical gauge in which a float rests on the water inside a narrow chamber beside the canal. As the water rises, that part moves upwards and pulls a cord over a pulley at the top of the instrument. At the other end, the cord moves a pointer beside a graduated scale, and a counterweight keeps the cord taut as the level changes. The whole arrangement allows the caretaker to read the level from the path. She can write down the position that it shows even though she cannot see the surface of the water from where she stands.',
        'There are two different ways to get an unreliable entry. A visit might never take place, in which case the book has a blank. Alternatively, a visit can take place and the instrument can fail to detect a change. If a twig prevented the cord from moving while the water fell, the caretaker would see a pointer in its usual position and might copy the same value as before. A reader could mistake that orderly sequence for unusually stable conditions. I would rather read a report that marks a measurement as doubtful than one that silently treats a fixed pointer as a reliable observation.',
        'To check whether a blank was isolated or part of a systematic gap, a clerk could compare the notebook with a separate record of gate visits. That second record need not contain a single water level, because a reliable record of path closures can reveal whether the missing dates are concentrated at the exposed gate. Although the comparison cannot put a number into an empty cell, its value is to show when the recorded days might differ from the omitted ones, giving the clerk a reason to qualify any conclusion about which stretch is usually higher.',
        'The next report should therefore specify which gate and which conditions were covered, so that a reader can tell when the comparison stops being useful. Even within that narrower scope, a low reading can serve a practical purpose by telling an inspector where to look on the next visit. The claim becomes harder to defend when it quietly expands from a description of the mornings recorded to a description of the whole season. Nothing has changed in the notebook at that point; only the range of the claim has changed.',
        'There is also a useful question for the person who decides what to measure next. If every missing visit is equally inconvenient to replace, it makes sense to start with the kind of morning that is consistently absent rather than collect more entries from the usual easy dates. An independent check with a marked staff can also help verify the gauge when the pointer seems stuck. Both steps give a provisional account a better chance of becoming dependable. The original blanks are still worth keeping visible, because they show future readers where the argument once ran ahead of its support.'
      ],
      items: [
        {
          kind: 'tfng',
          yn: true,
          stem: 'A smooth line drawn across a gap should count as an observation.',
          key: 'F',
          ru: 'NO. В A автор называет такую линию guess. Правдоподобная догадка не превращается в замер.',
          group: {
            title: 'Questions 1–4',
            task: 'Do the following statements agree with the claims of the writer? Choose YES, NO or NOT GIVEN.',
            ru: 'Опирайся на мнение автора. YES — утверждение совпадает, NO — автор говорит обратное, NOT GIVEN — автор этого не обсуждает.'
          },
          chk: 2
        },
        {
          kind: 'tfng',
          yn: true,
          stem: 'The water level at a canal gate can change because of rain farther upstream.',
          key: 'NG',
          ru: 'NOT GIVEN. B объясняет, как доступ к шлюзу влияет на журнал. Автор не обсуждает, где шёл дождь и мог ли он поднять уровень воды. Знание о реках из жизни здесь не доказывает ответ.',
          chk: 2
        },
        {
          kind: 'tfng',
          yn: true,
          stem: 'Uncertainty about a reading is worth making explicit in a report.',
          key: 'T',
          ru: 'YES. В D автор предпочитает отчёт, который отмечает сомнительный замер. Пустая ячейка — другая ситуация: там замера не было совсем.',
          chk: 2
        },
        {
          kind: 'tfng',
          yn: true,
          stem: 'If missing visits are equally difficult to replace, collecting more observations from the usual easy dates should come first.',
          key: 'F',
          ru: 'NO. В G автор предлагает начать с тех условий, которые регулярно отсутствуют в журнале. Увеличить число привычных замеров легче, но это не заполнит пробел.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          accept: [ 'float', 'a float' ],
          stem: '5 · Component that lifts as the water goes up: ______',
          ru: 'C. Float лежит на поверхности и поднимается вместе с водой. Chamber — место, где он движется, а не подвижная часть.',
          group: {
            title: 'Questions 5–9',
            task: 'Label the diagram below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
            ru: 'Подпиши части прибора. Сначала сопоставь стрелку на схеме с функцией детали, затем возьми слово из текста.',
            planCaption: 'Cutaway of the fictional canal gauge',
            plan: '<svg viewBox="0 0 360 244" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cutaway of a canal gauge. Label 5 points to the solid shape on the water. Label 6 points to the line attached to it. Label 7 points to the wheel the line passes over. Label 8 points to the horizontal indicator beside the ruled markings. Label 9 points to the shape at the hanging end of the line." font-family="monospace" font-size="15" fill="none" stroke="currentColor">\n' +
              '    <path d="M67 105V216H151 M151 105V216 M68 177H150" stroke-width="2"/>\n' +
              '    <rect x="91" y="158" width="39" height="18" rx="7" fill="#ece9e2"/>\n' +
              '    <circle cx="164" cy="76" r="54" fill="#ece9e2" stroke-width="2"/>\n' +
              '    <path d="M110 158V76 A54 54 0 0 1 218 76V183" stroke-width="2"/>\n' +
              '    <path d="M218 121H254L247 117M254 121l-7 4" stroke-width="2"/>\n' +
              '    <path d="M264 95v66m0-60h12m-12 12h8m-8 12h12m-12 12h8m-8 12h12"/>\n' +
              '    <rect x="206" y="183" width="24" height="30" rx="2" fill="#ece9e2"/>\n' +
              '    <path d="M45 164H91M45 115h65M168 22L182 14M254 121h50M230 198h74" stroke-dasharray="4 2"/>\n' +
              '    <g stroke="none" fill="currentColor"><text x="13" y="168">(5)</text><text x="13" y="119">(6)</text><text x="188" y="19">(7)</text><text x="309" y="126">(8)</text><text x="309" y="203">(9)</text><text x="67" y="235">CANAL WATER</text></g>\n' +
              '  </svg>'
          },
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          accept: [ 'cord', 'a cord', 'the cord' ],
          stem: '6 · Flexible line joined to the part at water level: ______',
          ru: 'C. «Pulls a cord» называет гибкую линию. Pulley — колесо, через которое она проходит.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          accept: [ 'pulley', 'a pulley' ],
          stem: '7 · Component at the top over which the flexible line passes: ______',
          ru: 'C. Cord проходит «over a pulley at the top». Counterweight удерживает натяжение на другом конце.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          accept: [ 'pointer', 'a pointer', 'the pointer' ],
          stem: '8 · Moving indicator from which the caretaker takes a reading: ______',
          ru: 'C. Стрелка (pointer) движется рядом с делениями. Scale — деления, которые остаются на месте.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          accept: [ 'counterweight', 'a counterweight' ],
          stem: '9 · Component at the hanging end that maintains tension: ______',
          ru: 'C. Counterweight держит cord натянутым. Float находится на воде на другом конце.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What prompts the caretaker to delay some visits in paragraph B?',
          opts: [
            'The instrument sometimes becomes difficult to read.',
            'Conditions on the route make it unsafe to proceed.',
            'The clerk asks her to inspect only one gate.',
            'The water level must be measured at a fixed hour.'
          ],
          key: 1,
          ru: 'B. В B описана скользкая дорожка на пути к шлюзу. A относится к другой проблеме, сбою прибора в D. C и D текст не устанавливает.',
          group: {
            title: 'Questions 10–13',
            task: 'Choose the correct letter, A, B, C or D.',
            ru: 'Внутри группы ответы идут по ходу статьи. Ищи свою строку доказательства для каждого пункта.'
          },
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'In paragraph D, why is the twig important?',
          opts: [
            'It shows how a repeated reading can conceal a genuine change.',
            'It explains why the caretaker missed several visits.',
            'It allows the caretaker to find the earlier level.',
            'It shows that a rise in water destroyed the gauge.'
          ],
          key: 0,
          ru: 'A. Ветка мешает стрелке двигаться, хотя вода падает. B — про доступ в B. C и D приписывают ветке то, чего не было.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What could the separate record establish?',
          opts: [
            'The exact water level on a missing date.',
            'Whether the gauge was read accurately on every visit.',
            'Whether unavailable dates mostly affect one location.',
            'How long the caretaker spent at each gate.'
          ],
          key: 2,
          ru: 'C. В E журнал закрытий показывает, сосредоточены ли пропуски у открытого ветру шлюза. Он не содержит уровней, поэтому A и B не доказаны. Время на осмотр (D) не обсуждается.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What mistake does paragraph F warn the writer of a report against?',
          opts: [
            'Comparing conditions at the same gate on separate visits.',
            'Indicating which conditions the figures cover.',
            'Referring to a low reading when arranging an inspection.',
            'Extending a claim past the conditions actually measured.'
          ],
          key: 3,
          ru: 'D. Сравнение замеренных утр превращается в заявление о целом сезоне. B как раз предлагается делать. C — допустимое применение замера. A не названо ошибкой.',
          chk: 2
        }
      ]
    },
    {
      type: 'speaking',
      id: 'speak',
      label: 'IELTS-style · Speaking Part 3',
      title: 'Explain why a result might mislead',
      ru: 'Объясни причину и дай конкретный пример. Отдельно скажи, что можно проверить. Запись остаётся на этом устройстве.',
      prompts: [
        'Why might a city receive mostly positive comments about a service that many people find difficult to use?',
        'What additional evidence could help decision-makers interpret those comments?'
      ],
      prep: 30,
      talk: 90,
      pron: {
        title: 'Stress the limit of the claim',
        ru: 'Выдели слово, которое ограничивает вывод. От него зависит, о какой группе ты говоришь.',
        items: [ 'RECorDed visits', 'ONLY the exposed gate', 'a proVIsionAl account', 'THIS group of users' ]
      },
      model: 'A council might hear mostly from people who already use the service because it asks for comments at the point of service. A visitor who gives up after finding a locked gate will not see the questionnaire. The responses can still describe the experience of people who got in, but the group is unlikely to be representative. To verify the impression, the council could ask people at other locations and record how they reached the site.'
    },
    {
      type: 'writing',
      id: 'write',
      label: 'Writing micro-task',
      title: 'Claim, reason and example',
      ru: 'Напиши один абзац о сборе отзывов. Дай ограниченный вывод, объясни пропуск на конкретном примере и назови, чем проверить вывод.',
      prompts: [
        'A council asks for feedback only inside its canal visitor centre. How might this affect the conclusions it can draw?'
      ],
      minWords: 85,
      checklist: [
        'Я ограничил(а) вывод теми, кто мог ответить.',
        'Мой пример показывает, кого не охватил опрос.',
        'Предложенная проверка обращается к этой группе.'
      ],
      model: [
        'Feedback collected inside a visitor centre can describe the experiences of people who actually entered. The location may systematically omit readers of the website who try to visit on the wrong day, as well as visitors who cannot use the stairs. A manager who sees positive comments about access should therefore treat that conclusion as provisional. The council could ask for comments at the gate or on the website and record which entrance each person tried. This would make it easier to detect problems that the indoor questionnaire would miss.'
      ]
    },
    {
      type: 'questions',
      id: 'exit',
      label: 'Exit check',
      title: 'Evidence and limits',
      ru: 'Два коротких вопроса. Проверь границу вывода и значение пустой записи.',
      items: [
        {
          kind: 'mcq',
          text: 'An inspector observes a service every weekday. The schedule is different at weekends, when the inspector is not present.',
          stem: 'What is the strongest conclusion about the inspector’s report?',
          opts: [
            'It directly documents the weekday service.',
            'The weekend service is always less reliable.',
            'The report proves the schedule was followed every day.',
            'The inspector has better records for weekends.'
          ],
          key: 0,
          ru: 'A. Наблюдения сделаны в будни. B и C говорят о выходных, на которых инспектора не было. D переворачивает условие.',
          chk: 2
        },
        {
          kind: 'tfng',
          text: 'The Sunday box in a fictional canal log is blank because nobody inspected the gate that day.',
          stem: 'The log records a water level of zero for Sunday.',
          key: 'F',
          ru: 'FALSE. В журнале за воскресенье пустая ячейка. Запись уровня, в том числе нуля, отсутствует. Каким был сам уровень, мы не знаем.',
          chk: 2
        }
      ]
    }
  ],
  handoff: {
    text: 'You marked the gap between a claim and its evidence. Next, you will decide which evidence actually supports a claim.',
    next: 'C10'
  }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C10 = {
  id: 'C10',
  title: 'What Changed in the Ward',
  thread: 'A claim needs support that others accept.',
  intro: 'C09 ограничил вывод тем, что было измерено. Теперь разберём, какой результат действительно усиливает гипотезу. История Земмельвейса показывает, почему наблюдать разницу и объяснить её — две разные задачи.',
  words: [
    {
      w: 'hypothesis',
      pos: 'n.',
      ru: 'проверяемое предположение',
      sat: 'The researchers tested the hypothesis with an independent comparison.',
      ielts: 'The hypothesis predicted a fall after the change in routine.'
    },
    {
      w: 'attribute',
      pos: 'v.',
      ru: 'приписывать причину',
      sat: 'The report attributes the delay to a change in the timetable.',
      ielts: 'A difference is not enough to attribute the outcome to one cause.'
    },
    {
      w: 'intervention',
      pos: 'n.',
      ru: 'целенаправленное изменение, вмешательство',
      sat: 'The team compared records from before and after the intervention.',
      ielts: 'An intervention creates a chance to test a prediction.'
    },
    {
      w: 'alternative',
      pos: 'n.',
      ru: 'другая возможность, альтернатива',
      sat: 'The finding weakens one explanation without ruling out every alternative.',
      ielts: 'A reader can ask which alternative the evidence makes less likely.'
    },
    {
      w: 'observation',
      pos: 'n.',
      ru: 'наблюдение',
      sat: 'The second observation was made after the route changed.',
      ielts: 'An observation may establish a pattern before anyone knows the cause.'
    },
    {
      w: 'consistent',
      pos: 'adj.',
      ru: 'согласующийся, последовательный',
      sat: 'The pattern is consistent with the original explanation.',
      ielts: 'Results from a second site were consistent with the first report.'
    },
    {
      w: 'replicate',
      pos: 'v.',
      ru: 'воспроизвести результат',
      sat: 'The committee asked a separate group to replicate the comparison.',
      ielts: 'Other investigators can try to replicate the finding in a new setting.'
    },
    {
      w: 'plausible',
      pos: 'adj.',
      ru: 'правдоподобный',
      sat: 'Both explanations are plausible until the missing information is supplied.',
      ielts: 'A plausible story still needs evidence that favours it over an alternative.'
    }
  ],
  parts: [
    {
      type: 'questions',
      id: 'sat',
      label: 'SAT · Reading and Writing',
      title: 'Select evidence for a claim',
      ru: 'Выбери находку, которая лучше всего проверяет утверждение. Ситуации и предполагаемые находки в этом блоке вымышлены.',
      items: [
        {
          kind: 'mcq',
          text: 'Two waiting rooms at a clinic use different ticket systems. A researcher claims that a sign telling patients where to take a ticket reduces missed turns, because newcomers otherwise walk straight to the seats.',
          stem: 'Which finding, if true, would most directly support the claim?',
          opts: [
            'Patients liked the colour of the new sign.',
            'The busiest room had the longest queue.',
            'After the sign was added to the same room, fewer newcomers skipped the ticket and fewer missed their turn.',
            'Some regular patients arrived before the rooms opened.'
          ],
          key: 2,
          ru: 'C. Утверждение называет конкретный механизм: незнакомый с системой посетитель проходит мимо билетов. C показывает меньше пропущенных билетов и меньше пропущенных очередей после изменения. A измеряет отношение к виду таблички, B — очередь, D — время прихода.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'A clinic manager argues that delays sending test results arose because staff entered the same address twice. She predicts that the delay will fall if the second entry is removed while other steps stay the same.',
          stem: 'Which finding, if true, would most directly support the claim?',
          opts: [
            'After the second entry was removed, results went out sooner even though staffing and the other steps stayed the same.',
            'The two forms used different text sizes.',
            'Some patients preferred messages to letters.',
            'The clinic processed more tests in winter than in summer.'
          ],
          key: 0,
          ru: 'A. Меняется повторный ввод, а штат и остальные шаги сохраняются. B касается оформления, C — предпочтения, D — числа тестов. Ни один из них не проверяет предсказание о задержке.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'A reviewer argues that a reduction in missed appointments came from a new reminder rather than from the new location of a health centre. Another centre kept its location and used the same reminder.',
          stem: 'Which finding, if true, would most directly support the claim?',
          opts: [
            'Signs with the old address were removed from the first centre.',
            'The first centre had more consultation rooms at its new location.',
            'Many patients at both centres requested morning appointments.',
            'Missed appointments also fell at the centre that introduced the reminder without moving.'
          ],
          key: 3,
          ru: 'D. Второй центр даёт сопоставимый пример с напоминанием и прежним адресом. A и B относятся к переезду. C показывает предпочтение по времени, но не меняет оценку напоминания.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'In a fictional evaluation, a director concludes that a clear return label reduces lost specimen boxes. A reviewer notes that boxes with the new label were also handled by a more experienced team.',
          stem: 'Which finding would most directly address the reviewer’s alternative explanation?',
          opts: [
            'Both teams received the same number of boxes.',
            'Within the same team, boxes with the clear label were lost less often than boxes with the old label.',
            'The experienced team said the boxes were easy to stack.',
            'The department had ordered more labels than it needed.'
          ],
          key: 1,
          ru: 'B. Внутри одной команды опыт не меняется, а вид этикетки меняется. A сравнивает объём работ, но оставляет разные команды. C и D не объясняют потери.',
          chk: 2
        }
      ]
    },
    {
      type: 'questions',
      id: 'ielts',
      label: 'IELTS Academic · Reading',
      title: 'Evidence for a change in practice',
      ru: 'В каждом абзаце различай наблюдение, объяснение и то, что могло бы его проверить.',
      lettered: true,
      passageTitle: 'When One Ward Was Safer',
      passage: [
        'A striking difference between two groups can be the beginning of an explanation, but it rarely tells a complete story by itself. At the Vienna maternity hospital in the middle of the nineteenth century, one clinic had a much higher death rate than the other. For Ignaz Semmelweis, the physician who tried to account for the difference, the difficulty was finding evidence that would make one explanation more plausible than its rivals. The hospital was already collecting the records he needed to describe the problem. What it did not supply in advance was a simple instruction for how those records ought to be read.',
        'The clinics served patients in the same institution, and admissions generally alternated between them according to the day. This arrangement gave the comparison a value that a comparison between unrelated hospitals would have lacked: the clinics shared a setting and drew patients from the same city. It did not make the groups identical. Some women tried to avoid the clinic with the worse reputation, and the two clinics followed different routines. The difference in mortality could therefore point to several causes, even though it was strong enough to make inaction difficult to justify.',
        "A difference in work before patients arrived eventually became central to Semmelweis's hypothesis. In the first clinic, physicians and medical students examined patients, and their professional training included dissection. The second clinic was used to train midwives, whose duties did not include that work. Semmelweis came to suspect that material from the dissecting room could be carried on hands into the clinic. The explanation connected a routine specific to one group with a problem particularly severe there. It also suggested a change that could be made without trying to redesign the entire hospital.",
        'In 1847 Semmelweis introduced a new requirement for hand cleaning in the first clinic. If material carried on hands was the important difference, mortality ought to fall after that intervention. The records subsequently showed a substantial reduction in mortality. A decline by itself does not identify its cause any more than the original difference did, since other conditions can change over time. What made this observation especially relevant was its connection to a prediction: an alteration aimed at the proposed route of transmission was followed by the change that the hypothesis predicted.',
        'The first clinic did not suddenly become a setting in which each possible influence was controlled. Nor did an improvement tell observers precisely what had been transferred on hands. Semmelweis was writing before a widely accepted account of disease based on microorganisms was available, and accepting the practical result did not require accepting every detail of his explanation. The two claims had different strengths. The records provided a reason to take the new practice seriously, while the wider explanation still gave other investigators something to verify and, where necessary, revise.',
        'The difficulty of persuading other people is sometimes told as a story in which a single clear result faced nothing but stubborn opposition. That reading leaves out a distinction essential to scientific argument. A person can acknowledge a pattern and still disagree about what caused it, just as a person can be slow to accept evidence for reasons that have little to do with its quality. A fair account has room for both possibilities, and it separates the question of how convincing an observation was from the question of why particular readers responded as they did.',
        'Semmelweis eventually published an extended account in 1861, allowing others to inspect the comparisons and decide what they could support. Later investigators could ask whether a different team could replicate a result consistent with his more limited claim about hygiene, without assuming that every detail of the original explanation was correct. The example remains valuable because it shows what well chosen evidence can do: it can make an alternative less likely, change what a hospital should try next and leave open a question that a new comparison might answer.'
      ],
      items: [
        {
          group: {
            title: 'Questions 1–5',
            task: 'The passage has seven paragraphs, A–G. Choose the correct heading for paragraphs B–F from the list below.',
            ru: 'Выбери главную мысль абзаца. Три заголовка лишние.',
            headings: [
              'A recorded change following a targeted test',
              'Two claims with different levels of support',
              'A dispute with more than one possible source',
              'Why the two groups were comparable only to a point',
              'A routine that suggested a testable explanation',
              'New buildings as the main explanation',
              'A result from a later independent replication',
              'Why the two clinics stopped keeping records'
            ]
          },
          kind: 'match',
          stem: 'Paragraph B',
          key: 3,
          ru: 'iv. B объясняет, почему клиники удобно сравнить и почему сходство всё же неполное. i относится к изменению после вмешательства в D.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'Paragraph C',
          key: 4,
          ru: 'v. Различие в работе до осмотра подсказало объяснение. i подошёл бы абзацу D, где проверка уже состоялась.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'Paragraph D',
          key: 0,
          ru: 'i. Требование меняет один предполагаемый путь переноса, затем смертность падает. v описывает появление гипотезы раньше.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'Paragraph E',
          key: 1,
          ru: 'ii. Автор разводит свидетельства в пользу практики и полное объяснение переноса. vi неверен: об изменении здания здесь нет сведений.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'Paragraph F',
          key: 2,
          ru: 'iii. Сомнение в объяснении и отказ принять данные могут иметь разные причины. vii требует нового эксперимента, а F обсуждает реакцию на прежнее наблюдение.',
          chk: 2
        },
        {
          group: {
            title: 'Questions 6–9',
            task: 'Complete the summary using the list of words, A–H, below.',
            ru: 'Подставь одно слово из списка. Смысл должен совпасть с абзацами C–E.',
            labels: 'letters',
            listTitle: 'List of words',
            headings: [ 'training', 'instructions', 'drop', 'wards', 'explanation', 'hands', 'records', 'rise' ]
          },
          kind: 'match',
          stem: 'Semmelweis suspected that material could travel from the dissecting room to the first clinic on people’s ______.',
          key: 5,
          ru: 'F, hands. В C материал переносится на руках. Rooms — это место, а не способ переноса.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'The new requirement led him to expect a ______ in mortality.',
          key: 2,
          ru: 'C, drop. В D предсказано снижение. Rise — противоположное движение.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'The hospital’s ______ showed that mortality subsequently declined.',
          key: 6,
          ru: 'G, records. Снижение видно в записях D. Instructions описывают требование, а не итог.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'Agreement about the practice did not settle every part of the broader ______.',
          key: 4,
          ru: 'E, explanation. В E можно принять практический результат и всё же проверять механизм. Training — тема C.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What made the two clinics useful to compare?',
          opts: [
            'They were in the same institution and generally took patients on alternating days.',
            'Their staff carried out the same work before examining patients.',
            'They let all women choose a preferred clinic.',
            'They treated exactly the same number of patients on every day.'
          ],
          key: 0,
          ru: 'A. Абзац B называет общую больницу и чередование приёма. B противоречит C. C и D не установлены.',
          group: {
            title: 'Questions 10–13',
            task: 'Choose the correct letter, A, B, C or D.',
            ru: 'Следи за порядком. Различай ожидаемое объяснение и наблюдение.'
          },
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'Why is the reduction in mortality particularly relevant in paragraph D?',
          opts: [
            'It occurred before Semmelweis changed the routine.',
            'It proved that all other conditions were constant.',
            'It was the outcome predicted by the proposed explanation.',
            'It showed that the two clinics had treated identical groups.'
          ],
          key: 2,
          ru: 'C. Снижение совпало с предсказанным направлением после целевого изменения. A путает порядок. B и D претендуют на контроль, которого не было.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What distinction does the writer make in paragraph F?',
          opts: [
            'Between those who worked in the clinic and those who read the records.',
            'Between a finding’s strength and the reasons people reacted as they did.',
            'Between an experienced investigator and a reader without training.',
            'Between records from one clinic and those from two clinics.'
          ],
          key: 1,
          ru: 'B. F прямо разделяет убедительность данных и причины реакции. В A, C и D есть детали темы, но нет этого различия.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What does paragraph G suggest later investigators could attempt?',
          opts: [
            'Reconstruct the missing figures in the old hospital records.',
            'Establish that every part of Semmelweis’s explanation was correct.',
            'Replace the original comparison with an account of public reactions.',
            'Test whether a separate group could obtain a similar result on hygiene.'
          ],
          key: 3,
          ru: 'D. В G предлагают воспроизвести более узкий вывод другой командой. B лишён оговорки: детали можно пересмотреть. A и C не названы задачами.',
          chk: 2
        }
      ]
    },
    {
      type: 'speaking',
      id: 'speak',
      label: 'IELTS-style · Speaking Part 3',
      title: 'Defend a claim with one example',
      ru: 'Скажи, что именно подтверждает твой пример. Если возможна другая причина, назови её и покажи, какое наблюдение поможет различить варианты.',
      prompts: [
        'Why might people hesitate to change a familiar routine even when new evidence is available?',
        'What would make a trial of a new routine convincing to you?'
      ],
      prep: 30,
      talk: 90,
      pron: {
        title: 'Stress the contrast in your evidence',
        ru: 'Выдели то, что изменили, и то, что оставили прежним. После первой части сделай короткую паузу.',
        items: [ 'the SAME team', 'a DIFFERENT label', 'the proposed CAUSE', 'the ALternative' ]
      },
      model: 'People may hesitate because a useful intervention has costs as well as benefits. Suppose a clinic tests a different system for sending results. A manager might attribute a faster reply to the system, whereas the staff might point to a quieter week. A comparison at the same clinic during weeks with similar workloads would make one account more plausible. I would also want another team to replicate the result before changing how all the clinics work.'
    },
    {
      type: 'writing',
      id: 'write',
      label: 'Writing micro-task',
      title: 'Support one claim',
      ru: 'Напиши абзац в поддержку позиции. Приведи один конкретный пример, затем поясни, чем он подтверждает мысль.',
      prompts: [
        'Public services should test a proposed change on a small scale before adopting it everywhere. Write one body paragraph supporting this view.'
      ],
      minWords: 90,
      checklist: [
        'Я объяснил(а), что именно помогает проверить пробное изменение.',
        'Пример показывает наблюдение, а не только обещание пользы.',
        'Я связал(а) результат примера со своей позицией.'
      ],
      model: [
        'A small trial allows a public service to test a hypothesis while correcting mistakes that would be more expensive to fix later. A clinic introducing clearer appointment notices, for instance, could keep its usual hours and use the new notice in one part of the building. If visitors find the correct rooms more quickly, the result is consistent with the idea that the old notice was confusing. The team should still ask whether another site can replicate the result. The initial observation gives the clinic a reason to continue the trial, and a comparison across sites makes the wider decision more defensible.'
      ]
    },
    {
      type: 'questions',
      id: 'exit',
      label: 'Exit check',
      title: 'Choose the relevant test',
      ru: 'Проверь, какое свидетельство поддерживает утверждение и где кончается вывод.',
      items: [
        {
          kind: 'mcq',
          text: 'A clinic wants to test whether larger room numbers help first-time visitors find their appointment room.',
          stem: 'Which result would most directly support the claim?',
          opts: [
            'Older visitors disliked the colour of the wall.',
            'With the larger numbers visible, each room became more expensive to clean.',
            'First-time visitors asked for directions less often when the only change was larger room numbers.',
            'Staff knew the room numbers before the new signs went up.'
          ],
          key: 2,
          ru: 'C. Новый размер — единственное изменение, а просьбы указать дорогу относятся к цели. A, B и D не измеряют, как ориентируются новые посетители.',
          chk: 2
        },
        {
          kind: 'tfng',
          text: 'A trial tested a new notice in one clinic. The researchers did not carry out a trial at any other clinic.',
          stem: 'The same researchers repeated the trial at another clinic.',
          key: 'F',
          ru: 'FALSE. Только одна клиника участвовала в проверке. Результат мог бы повториться, но утверждение говорит, что вторая проверка уже была.',
          chk: 2
        }
      ]
    }
  ],
  handoff: {
    text: 'The evidence helped readers decide how much of a claim to accept. Next, two writers look at the same standard and reach different judgments.',
    next: 'C11'
  }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C11 = {
  id: 'C11',
  title: 'One Metre, Two Opinions',
  thread: 'Standards help everyone and annoy someone.',
  intro: 'В C10 один результат допускал обсуждение причины. Здесь два автора согласны с фактами, но применяют разные критерии к одному правилу. Город и его спор вымышлены.',
  words: [
    {
      w: 'standardise',
      pos: 'v.',
      ru: 'приводить к общему стандарту',
      sat: 'The council voted to standardise its public signs.',
      ielts: 'To standardise a unit is to give different users the same reference.'
    },
    {
      w: 'uniform',
      pos: 'adj.',
      ru: 'единообразный',
      sat: 'Uniform labels made the receipts easier to compare.',
      ielts: 'A uniform rule can simplify a transaction.'
    },
    {
      w: 'calibrate',
      pos: 'v.',
      ru: 'настраивать по эталону',
      sat: 'The inspector calibrated the scale before comparing its readings.',
      ielts: 'Sellers can calibrate their rulers against a common reference.'
    },
    {
      w: 'concession',
      pos: 'n.',
      ru: 'уступка, признание довода другой стороны',
      sat: 'The author’s concession concerns the initial cost.',
      ielts: 'A concession shows which part of another view one accepts.'
    },
    {
      w: 'adopt',
      pos: 'v.',
      ru: 'принимать, вводить в употребление',
      sat: 'Both stores decided to adopt the same format.',
      ielts: 'The shops can adopt the unit on different dates.'
    },
    {
      w: 'transition',
      pos: 'n.',
      ru: 'переход',
      sat: 'The transition changed how old orders were recorded.',
      ielts: 'A clear transition reduces confusion for regular customers.'
    },
    {
      w: 'equivalent',
      pos: 'adj.',
      ru: 'равноценный, эквивалентный',
      sat: 'The old mark and the new mark are not exactly equivalent.',
      ielts: 'Two labels can give equivalent measurements in different units.'
    },
    {
      w: 'retain',
      pos: 'v.',
      ru: 'сохранять, оставлять',
      sat: 'The shop retained its handwritten order books.',
      ielts: 'Sellers might retain both labels while customers learn the system.'
    }
  ],
  parts: [
    {
      type: 'questions',
      id: 'sat',
      label: 'SAT · Reading and Writing',
      title: 'Compare what two writers value',
      ru: 'Сопоставь позиции двух авторов. Ищи точку согласия и то условие, из-за которого их выводы расходятся.',
      items: [
        {
          kind: 'mcq',
          text: 'Text 1\n' +
            'A uniform unit for measuring cloth would let buyers compare prices in different shops. The council should require all shops to use the unit from the same date.\n' +
            '\n' +
            'Text 2\n' +
            'A uniform unit would make prices easier to compare. However, small shops need a transition period to use up old labels and help customers recognise the new amounts.',
          stem: 'How would the author of Text 2 most likely respond to the recommendation in Text 1?',
          opts: [
            'By accepting the benefit to buyers but calling for a transition period.',
            'By agreeing that every old label should disappear on the same date.',
            'By denying that a shared unit would help people compare prices.',
            'By proposing that each shop should set a different new unit.'
          ],
          key: 0,
          ru: 'A. Оба автора поддерживают сравнимость цен. Автор 2 спорит со сроком из-за старых этикеток и привычек клиентов. B переворачивает его вывод, C и D отрицают согласие об общей единице.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'Text 1\n' +
            'If rulers disagree at the market, inspectors should calibrate them against a reference that any seller may consult. This will make disagreements easier to resolve.\n' +
            '\n' +
            'Text 2\n' +
            'Inspectors should make the comparison openly. Still, a public reference will help only if visitors know where to find it and how to read the marks.',
          stem: 'On what point would both authors most likely agree?',
          opts: [
            'A ruler from a single ordinary shop should serve as the official standard.',
            'Visitors already know how to read every mark in the market.',
            'A reference available to sellers can play a role in resolving measurement disputes.',
            'Showing the reference privately is the best way to avoid disagreements.'
          ],
          key: 2,
          ru: 'C. У первого автора эталон доступен продавцам. Второй одобряет открытое сравнение и добавляет условие понятности. A, B и D не выражают общую позицию.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'Text 1\n' +
            'For a limited period, a label should show both the old and the new unit. Shoppers can see the translation without asking an assistant.\n' +
            '\n' +
            'Text 2\n' +
            'Whenever two units appear in the same line of print, some shoppers compare the wrong figures. Keep the new unit on the label and offer the conversion on a separate card.',
          stem: 'How would the author of Text 2 most likely respond to Text 1’s proposal?',
          opts: [
            'By refusing to give customers a conversion in any form.',
            'By placing the conversion on a separate card.',
            'By arguing that shoppers already understand both units equally well.',
            'By suggesting that the old unit should replace the new one on all labels.'
          ],
          key: 1,
          ru: 'B. Пересчёт сохраняется на отдельной карточке, чтобы две цифры не путали покупателя. A убирает пересчёт, C игнорирует риск путаницы, D меняет местами старую и новую единицы.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'Text 1\n' +
            'A store that uses local units expresses part of its history. A small display could preserve the old ruler and describe what it meant.\n' +
            '\n' +
            'Text 2\n' +
            'Changing the current unit need not erase the past. However, an original ruler belongs where people can see it in context, alongside old account books rather than among current price labels.',
          stem: 'Which statement best captures the relationship between the two texts?',
          opts: [
            'Both authors want the traditional ruler to remain in daily use.',
            'Text 2 challenges the idea that the old ruler has any historical value.',
            'Text 1 gives a detailed argument against the kind of display in Text 2.',
            'Both authors support preserving the old ruler, and Text 2 adds a suggestion about how to display it.'
          ],
          key: 3,
          ru: 'D. Оба автора хотят сохранить предмет. Второй уточняет контекст показа. A смешивает сохранение с ежедневным применением, B и C приписывают спор там, где его нет.',
          chk: 2
        }
      ]
    },
    {
      type: 'questions',
      id: 'ielts',
      label: 'IELTS Academic · Reading',
      title: 'A standard with two sides',
      ru: 'Различай автора довода и сам довод. Спор о бирках и его участники вымышлены.',
      lettered: true,
      passageTitle: 'A Ruler on Every Counter',
      passage: [
        'A unit of length seems, at first glance, a particularly unlikely subject for a public argument. A customer who buys a length of cloth has little reason to wonder why the unit on the label is the same as the one printed on a ruler. That agreement must nevertheless be arranged and maintained. The history of the metre includes a period when an international prototype made of platinum and iridium served as its definition, and a later period when a definition based on light replaced a physical object. Those changes concern the reference itself. Another question, less easily settled by a laboratory, is how a community should adopt a new rule for everyday trading.',
        'Consider an invented town in which shops commonly sell cloth using a local unit. Its council proposes to standardise the length shown on every price label by requiring metres. The plan would let customers compare the price of an equivalent length in several shops without first converting the figures. It would also make it easier for an inspector to check a disputed measurement against a reference ruler maintained for public use. Nobody in the debate disputes the definition of a metre. The disagreement concerns how to introduce the unit in a place where sellers and customers have already built habits around another one.',
        "Mara, who speaks for a buyers' association, wants a uniform change on a specified day. Her fear is that an indefinite transition will preserve the very inconvenience the council intends to remove. A customer may find prices expressed in different units on adjacent stalls and have to perform the old calculation even after the reform. To make the new rule practical, Mara also wants inspectors to publish the location of the reference ruler so that sellers know where to calibrate their own. She makes one concession to the sellers: the council should display a clear conversion notice at each market entrance while customers get used to seeing the new unit.",
        'Ned, a trader, accepts that a single unit would simplify comparisons, yet he thinks Mara underestimates the work required before the change. A stallholder might have to replace handwritten labels, alter an order book and explain to a regular customer why the advertised number has changed. Even a seller who can do all the arithmetic correctly can run into a disagreement when an order was placed using one unit and checked using another. Ned therefore proposes that shops retain both units on their labels for a short period. He sees that temporary duplication as a way to preserve a trustworthy record, whereas Mara regards it as an avoidable burden on shoppers.',
        'Iona, who has been asked to recommend a compromise, treats the problems as two separate matters. In her proposal the largest figure on a new label must give the price per metre from a common date, and a smaller conversion card may be placed by the payment desk. At first the council would supply the cards, so that traders did not have to prepare their own calculations. For an existing order, the shop would put a note in its ledger showing which unit the customer had agreed to use. This practice would keep a record of old transactions while ensuring that new prices could be compared directly.',
        'In a demonstration arranged for the council, people were shown sample labels and asked to find the cheapest offer for a specified length. Some found the information more quickly on the label that gave just the new price, while others asked where to check an old figure. The demonstration was too small to show what most shoppers in the town would prefer, but it identified two jobs that a usable system should do. It should make new prices easy to compare and help somebody who needs to interpret a previous price without directing every customer through both procedures.',
        'The debate is often presented as a choice between people who welcome new measures and people who resist them. The example suggests a better description. All three speakers recognise the usefulness of a shared unit and disagree about where the transitional work should fall. A uniform outcome can be consistent with several ways of reaching it, provided that the burden of translating old information is visible and has been assigned somewhere. That is why two people can sincerely support the same standard while continuing to argue about the label that should appear at the counter.'
      ],
      items: [
        {
          group: {
            title: 'Questions 1–4',
            task: 'Match each statement with the correct person, A, B or C. You may use any letter more than once.',
            ru: 'Найди чьё предложение передано. Имена могут повторяться.',
            labels: 'letters',
            listTitle: 'People',
            headings: [ 'Mara', 'Ned', 'Iona' ]
          },
          kind: 'match',
          stem: 'A temporary conversion guide should be available where shoppers enter the market.',
          key: 0,
          ru: 'A, Mara. В C она предлагает объявления у входов. Iona размещает карточки у кассы.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'For a limited time, the price tag itself should show the two units.',
          key: 1,
          ru: 'B, Ned. В D он оставляет обе единицы на бирке. В предложении Iona пересчёт вынесен на отдельную карточку.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'The local authority should initially prepare the information used at the payment area.',
          key: 2,
          ru: 'C, Iona. В E council supplies the cards, а место — payment desk. Mara предлагает объявление в другой точке.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'A change without a fixed end can leave buyers doing the same calculation as before.',
          key: 0,
          ru: 'A, Mara. В C indefinite transition сохраняет старую трудность. Ned предлагает ограниченный двойной период.',
          chk: 2
        },
        {
          group: {
            title: 'Questions 5–9',
            task: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
            ru: 'Впиши слова из статьи. Ответы идут по порядку абзацев.'
          },
          kind: 'gap',
          limit: 2,
          stem: '5 · With a common unit, inspectors can check a contested length against a public ______.',
          accept: [ 'reference ruler', 'ruler', 'reference' ],
          ru: 'B. В B устойчивый эталон назван ruler; полное название предмета — reference ruler.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '6 · According to Mara, guidance for shoppers should be placed at every market ______.',
          accept: [ 'entrance' ],
          ru: 'C. У каждого входа будет conversion notice. Entrance обозначает место, а не саму подсказку.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '7 · Ned says a merchant might need to change a record in which requests for goods are entered, the ______.',
          accept: [ 'order book' ],
          ru: 'D. В тексте alter an order book. Handwritten labels — отдельная вещь, которую нужно заменить.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '8 · At the checkout, Iona would allow a smaller ______ to help users interpret an older figure.',
          accept: [ 'conversion card', 'card' ],
          ru: 'E. В E smaller conversion card стоит рядом с payment desk. Это не бирка с основным числом.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '9 · For a purchase already agreed, the retailer should record the unit in the ______.',
          accept: [ 'ledger' ],
          ru: 'E. Магазин вносит note in its ledger. Вопрос о старой сделке, а не о новом ценнике.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What distinction does the writer make in paragraph A?',
          opts: [
            'Between cheap units of length and costly ones.',
            'Between defining a measure and getting people to start using it.',
            'Between measurements made by traders and those made by inspectors.',
            'Between an object that can be measured and one that cannot.'
          ],
          key: 1,
          ru: 'B. История эталона — определение меры, а введение в повседневный оборот поставлено отдельным вопросом. A, C и D не выражают это различие.',
          group: {
            title: 'Questions 10–13',
            task: 'Choose the correct letter, A, B, C or D.',
            ru: 'Ищи, какую задачу решает каждый довод. Ответы идут по ходу текста.'
          },
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'Why does Ned refer to orders made before the rules change?',
          opts: [
            'To show how a dispute can arise when the agreed unit and the checking unit differ.',
            'To show that traders want to sell only to regular customers.',
            'To argue that buyers are more accurate at arithmetic than traders.',
            'To explain why orders always specify metres already.'
          ],
          key: 0,
          ru: 'A. В D старый заказ проверяют по другой единице, откуда и спор. B, C и D подменяют проблему.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What did the council’s demonstration establish?',
          opts: [
            'Almost all customers wanted both units on each label.',
            'One kind of label served every reader equally well.',
            'The town should abolish its public reference ruler.',
            'It identified two distinct needs that the labelling system should meet.'
          ],
          key: 3,
          ru: 'D. В F одни быстро сравнивали текущие цены, другие искали помощь со старыми. Опыт мал, поэтому A нельзя вывести. B и C не описаны.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What is the writer’s main point in paragraph G?',
          opts: [
            'People who oppose a standard understand its purpose better.',
            'Every reform should end with two sets of permanent price labels.',
            'Support for a common measure can coexist with disagreement about how to introduce it.',
            'The only useful way to settle a dispute is to explain the history of the metre.'
          ],
          key: 2,
          ru: 'C. В G цель общая, а спор — о том, кто берёт на себя работу перехода. A неверно делит людей на сторонников и противников стандарта. B и D добавляют правила, которых нет.',
          chk: 2
        }
      ]
    },
    {
      type: 'speaking',
      id: 'speak',
      label: 'IELTS-style · Speaking Part 3',
      title: 'Compare two views on the same rule',
      ru: 'Сначала коротко изложи обе позиции. Укажи, с чем согласны обе стороны, и назови критерий, по которому ты сделаешь выбор.',
      prompts: [
        'Should shops switch to the same unit on one day, or change gradually?',
        'How could organisers help people who already use an older system?'
      ],
      prep: 30,
      talk: 90,
      pron: {
        title: 'Use pauses to separate viewpoints',
        ru: 'После первой позиции сделай паузу. Выдели слово, на котором расходятся стороны.',
        items: [
          'Both sides value CLARity.',
          'One group wants a FIXED date.',
          'The other wants a gradual tranSItion.',
          'My main criterion is ACcess.'
        ]
      },
      model: 'Both sides see an advantage in using equivalent units across shops. Buyers may favour a fixed date because they can compare prices as soon as the labels change. Sellers may prefer a transition, especially when they have to honour old orders. I would introduce the uniform label on one day and retain a conversion guide at the counter. That concession keeps comparison simple while giving customers a place to check an earlier order.'
    },
    {
      type: 'writing',
      id: 'write',
      label: 'Writing micro-task',
      title: 'Open a two-view essay',
      ru: 'Напиши вступление из двух или трёх предложений. Назови обе позиции и свою позицию. Сравнение и аргументы оставь для основной части.',
      prompts: [
        'Some people believe that a new measurement standard should be introduced everywhere on a fixed date. Others think existing systems should be allowed to remain in use during a transition. Discuss both views and give your own opinion.'
      ],
      minWords: 45,
      checklist: [ 'Две позиции различимы.', 'Моё мнение понятно.', 'Я пересказал(а) тему своими словами.' ],
      model: [
        'When authorities adopt a common unit of measurement, they can either require shops to change together or allow sellers to use familiar units for a limited period. I favour a single date for new price labels, accompanied by guidance for customers who still need to interpret the old system.'
      ]
    },
    {
      type: 'questions',
      id: 'exit',
      label: 'Exit check',
      title: 'Find the exact disagreement',
      ru: 'Отдели общее согласие от спорной части.',
      items: [
        {
          kind: 'mcq',
          text: 'Text 1\n' +
            'Every notice should state the same opening hours format, so residents can compare branches quickly.\n' +
            '\n' +
            'Text 2\n' +
            'A single format will help residents, but it should include words as well as numbers for people unfamiliar with the display.',
          stem: 'What would both writers most likely agree on?',
          opts: [
            'All branches have identical opening hours.',
            'A shared display format could help readers.',
            'The notice needs no text.',
            'Numbers should be removed from notices.'
          ],
          key: 1,
          ru: 'B. Согласие касается формата, а не самих часов работы. C и D не передают добавление автора 2. A добавляет лишний факт.',
          chk: 2
        },
        {
          kind: 'tfng',
          text: 'Mara and Ned both support changing the unit. Mara prefers one date, while Ned proposes a temporary period of double labels.',
          stem: 'Ned wants both units on the tags temporarily.',
          key: 'T',
          ru: 'TRUE. A temporary period of double labels означает, что обе единицы сохраняются ограниченное время. Спор о переходе, а не о цели.',
          chk: 2
        }
      ]
    }
  ],
  handoff: {
    text: 'Two writers can share a goal and disagree about how to reach it. Now test the skills of this block before you follow a voice across the map.',
    next: 'C12'
  }
};

/* ------------------------------------------------------------------ */
/* IELTS-only lesson: no `sat` and no `ielts` part. The `listen` part is read aloud by the browser's speech synthesis.
   Larkmoor College and everything on it are invented for this lesson. */
window.LESSONS.C12 = {
  id: "C12",
  title: "Follow the Voice",
  thread: "Back to the map: now you only hear it.",
  intro: "Этот урок только для IELTS: Listening. В первом уроке ты читал(а) карту, которая намеренно пропускает лишнее. Сегодня карты перед глазами нет: её нужно построить в голове по голосу. Три навыка: заранее угадывать, какого типа будет ответ (буква, слово, число или место), ловить поправки говорящего и следить за маршрутом по словам направления. Задания как в настоящих частях 1 и 2 IELTS Listening: бланк, план и вопросы с выбором.",
  wordsTitle: "Eight words for finding the way",
  wordsRu: "У каждого слова два примера: как оно звучит в записи и как его можно сказать самому. Сначала попробуй вспомнить перевод, потом нажми «показать перевод».",
  wordLabels: ["In a recording", "In your answer"],
  words: [
    { w: "landmark", pos: "n.", ru: "ориентир, заметный объект",
      ex: ["The old water tower is a useful landmark: once you see it, you are nearly there.",
           "The most famous landmark in my city is a tall TV tower on the hill."] },
    { w: "junction", pos: "n.", ru: "перекрёсток, место, где сходятся дороги или пути",
      ex: ["When you get to the junction, take the path on the left.",
           "There is always heavy traffic at the junction near my school."] },
    { w: "opposite", pos: "prep.", ru: "напротив",
      ex: ["The ticket office is opposite platform two, so you can't miss it.",
           "I live opposite a small park, which is convenient for running."] },
    { w: "adjacent", pos: "adj.", ru: "соседний, примыкающий (adjacent to)",
      ex: ["The lecture hall is adjacent to the reception desk, through the glass doors.",
           "My room is adjacent to the kitchen, so it is rarely quiet."] },
    { w: "entrance", pos: "n.", ru: "вход",
      ex: ["Please use the side entrance today, as the front doors are being repaired.",
           "We agreed to meet at the entrance to the cinema."] },
    { w: "route", pos: "n.", ru: "маршрут, путь",
      ex: ["The quickest route to the gallery goes through the gardens.",
           "I take the same route to school every morning."] },
    { w: "approximately", pos: "adv.", ru: "приблизительно",
      ex: ["The walk to the harbour takes approximately ten minutes.",
           "My village is approximately forty kilometres from the nearest city."] },
    { w: "beyond", pos: "prep.", ru: "за, дальше чем",
      ex: ["The café is just beyond the bridge, on the same side of the road.",
           "Beyond the last houses there is nothing but open steppe."] }
  ],
  parts: [
    { type: "questions", id: "listen", label: "IELTS-style · Listening", title: "A form and a plan you only hear",
      ru: "Две сокращённые части для практики IELTS Listening. Часть 1: разговор, ты заполняешь бланк (вопросы 1–4). Часть 2: экскурсия по колледжу, ты отмечаешь места на плане и отвечаешь на два вопроса с выбором (5–10). Сначала прочитай все вопросы и реши, что нужно услышать: букву, слово, число или место. Запись звучит один раз, вопросы идут по её порядку. Текст записи открой только после ответов.",
      rule: [
        "До записи: по бланку и плану определи тип ответа. Surname — слово по буквам, Block — буква, Bring — предмет. Не каждый ответ поправляют: поправка бывает в одном-двух местах, а не везде.",
        "Поправки — главная ловушка IELTS Listening: actually, sorry, no, wait, used to be, has been turned into. Записывай то, что прозвучало после поправки.",
        "План: держи в голове, где ты стоишь и куда смотришь. Left и right считаются от направления движения, а не от листа.",
        "Лимит слов соблюдай точно: лишнее слово на экзамене делает ответ неверным."
      ],
      voices: { Narrator: { pitch: 1, rate: 0.95 }, Assistant: { pitch: 1.2, lang: "en-GB" }, Tom: { pitch: 0.8, lang: "en-AU" }, Dana: { pitch: 1.05, lang: "en-GB" } },
      audio: ["Narrator: Section one.", "Narrator: You will hear a new student talking to an assistant at the student office of Larkmoor College.", "Narrator: First, look at questions one to four.", "Assistant: Good morning, student office. How can I help?", "Tom: Hi. I've just started this week, and, um, I need a student card.", "Assistant: Right, no problem. I'll fill in the form for you.", "Assistant: Can I have your surname first?", "Tom: Sure, it's Brennan. That's B, R, E, double N, A, N.", "Assistant: Brennan, lovely. And which course are you on?", "Tom: History. Well, actually, no, sorry. I changed last week, so it's Geography now.", "Assistant: Geography, OK. And where are you living? Are you in one of the college blocks?", "Tom: Yes, I'm in Block F. F for Freddie. Room twelve.", "Assistant: Block F, room twelve. Now, the cards are printed here, so you'll need to come back and collect yours.", "Assistant: It's Wednesday today, and we close at lunchtime, so the earliest would be tomorrow, Thursday.", "Tom: Thursday's fine. Do I need to bring anything?", "Assistant: Just one photograph, passport size. Oh, and your letter of offer, if you've still got it.", "Assistant: Actually, no, forget the letter, we've got that on the system. Just the photo.", "Tom: Great, thanks.", "Narrator: Section two.", "Narrator: You will hear a student guide giving directions around the college. First, look at the plan and questions five to eight.", "Dana: Hi everyone, and welcome to Larkmoor College. I'm Dana, one of the student guides.", "Dana: So, we're standing at the main entrance, here on the south side, next to the car park.", "Dana: On your plan you'll see the central path going straight up from where we are.", "Dana: Walk along it for approximately two hundred metres, and you come to a junction with a clock tower.", "Dana: That's the best landmark on campus. You can see it from just about anywhere.", "Dana: Right, the library. At the clock tower, turn left, and the library is the second building on your right, opposite the lake.", "Dana: Not the first one, the second. The first building, the one adjacent to the library, is the student office.", "Dana: If you turn right at the clock tower instead, the path takes you past the canteen to the science block.", "Dana: The science block is just beyond the canteen, at the very end of the path.", "Dana: Now, the sports hall. Don't follow the older maps: they still put it next to the science block.", "Dana: The new sports hall is back near the main entrance. Follow the fence east for about five minutes, and it's on your left.", "Dana: Oh, and one more thing. The bus stop has moved.", "Dana: It used to be just outside the main entrance, but now it's behind the library, on Mill Road.", "Narrator: Now look at questions nine and ten.", "Dana: Here's what happened to the old sports hall: that building has been turned into a lecture theatre.", "Dana: And the café by the lake, well, it's closed for repairs until the spring, so for a coffee, use the canteen for now."],
      items: [
        { group: { title: "Questions 1–4", task: "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer. For the block, write ONE LETTER ONLY.",
            ru: "Ответы идут по порядку разговора. Фамилию продиктуют по буквам: double N = NN. Слушай поправки: первое, что звучит, не всегда окончательный ответ.",
            table: { caption: "Larkmoor College · Student card request", head: ["Field", "Details"],
              rows: [["Surname", "(1) ______"], ["Course", "(2) ______"], ["Accommodation", "Block (3) ______, room 12"], ["Collect card on", "Thursday"], ["Bring", "one (4) ______"]] } },
          kind: "gap", chk: 2, limit: 1, accept: ["Brennan"],
          stem: "1 · Surname: ______",
          ru: "Tom диктует: «B, R, E, double N, A, N». Double N = две буквы N подряд. В IELTS ошибка в одной букве делает ответ неверным." },
        { kind: "gap", chk: 2, limit: 1, accept: ["Geography"],
          stem: "2 · Course: ______",
          ru: "Сначала звучит History, потом поправка: «actually, no, sorry. I changed last week, so it's Geography now». Ловушка: History — то, что было раньше." },
        { kind: "gap", chk: 2, limit: 1, accept: ["F"],
          stem: "3 · Accommodation: Block ______, room 12",
          ru: "«I'm in Block F. F for Freddie»: букву подтверждают словом, как часто бывает в Части 1. Записываем только F: слово Block уже стоит в бланке, а room twelve — номер комнаты, он дан." },
        { kind: "gap", chk: 2, limit: 1, accept: ["photograph", "photo"],
          stem: "4 · Bring: one ______",
          ru: "«Just one photograph, passport size». Письмо о зачислении сначала упомянуто, потом отменено: «forget the letter». Засчитывается и photo. Passport photo — два слова, это больше лимита." },

        { group: { title: "Questions 5–8", task: "Label the plan below. Choose the correct letter, A–H, next to Questions 5–8.",
            ru: "Мест на плане восемь, вопросов четыре: четыре буквы лишние. Ты стоишь у главного входа внизу, лицом на север. Идёшь налево (на запад) — правая сторона дорожки северная.",
            places: 8, plan: "<svg viewBox=\"0 0 360 310\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"Plan of Larkmoor College, with north at the top. Mill Road is on the north edge; the entrance and car park are on the south side. Follow the central path north to the clock tower. On the path west from the tower, D is first and A is second, both on the north side. A is opposite the lake. C is on Mill Road directly north of A. On the path east from the tower, B is beside the path and G is at the end. E is just outside the entrance. F is inside the fence, east of the entrance. H is southeast of the lake.\" font-family=\"IBM Plex Mono, monospace\" font-size=\"10\" fill=\"none\" stroke=\"currentColor\"> <text x=\"180\" y=\"14\" text-anchor=\"middle\" fill=\"currentColor\" stroke=\"none\">MILL ROAD</text> <line x1=\"10\" y1=\"22\" x2=\"350\" y2=\"22\" stroke-width=\"1\"/> <path d=\"M165 280 H20 V34 H340 V280 H195\" stroke-width=\"1.4\" stroke-dasharray=\"5 3\"/> <line x1=\"180\" y1=\"292\" x2=\"180\" y2=\"150\" stroke-width=\"3\"/> <line x1=\"180\" y1=\"150\" x2=\"35\" y2=\"150\" stroke-width=\"3\"/> <line x1=\"180\" y1=\"150\" x2=\"296\" y2=\"150\" stroke-width=\"3\"/> <circle cx=\"180\" cy=\"150\" r=\"9\" fill=\"#fff\" stroke-width=\"1.4\"/> <text x=\"196\" y=\"174\" fill=\"currentColor\" stroke=\"none\">clock tower</text> <text x=\"170\" y=\"304\" text-anchor=\"end\" fill=\"currentColor\" stroke=\"none\">MAIN ENTRANCE (you are here)</text> <rect x=\"34\" y=\"240\" width=\"96\" height=\"30\" stroke-width=\"1\"/><text x=\"82\" y=\"259\" text-anchor=\"middle\" fill=\"currentColor\" stroke=\"none\">car park</text> <ellipse cx=\"88\" cy=\"196\" rx=\"44\" ry=\"20\" stroke-width=\"1\"/><text x=\"88\" y=\"200\" text-anchor=\"middle\" fill=\"currentColor\" stroke=\"none\">lake</text> <rect x=\"56\" y=\"92\" width=\"44\" height=\"40\" fill=\"#fff\" stroke-width=\"1.4\"/> <rect x=\"116\" y=\"92\" width=\"44\" height=\"40\" fill=\"#fff\" stroke-width=\"1.4\"/> <rect x=\"206\" y=\"92\" width=\"44\" height=\"40\" fill=\"#fff\" stroke-width=\"1.4\"/> <rect x=\"296\" y=\"118\" width=\"38\" height=\"64\" fill=\"#fff\" stroke-width=\"1.4\"/> <rect x=\"246\" y=\"222\" width=\"70\" height=\"40\" fill=\"#fff\" stroke-width=\"1.4\"/> <rect x=\"136\" y=\"200\" width=\"26\" height=\"22\" fill=\"#fff\" stroke-width=\"1.4\"/> <g fill=\"currentColor\" stroke=\"none\" font-size=\"15\" font-weight=\"600\" text-anchor=\"middle\"> <text x=\"78\" y=\"118\">A</text><text x=\"228\" y=\"118\">B</text><text x=\"138\" y=\"118\">D</text><text x=\"281\" y=\"248\">F</text><text x=\"315\" y=\"156\">G</text><text x=\"149\" y=\"216\">H</text> </g> <circle cx=\"78\" cy=\"26\" r=\"9\" fill=\"#fff\" stroke-width=\"1.4\"/><text x=\"78\" y=\"31\" text-anchor=\"middle\" fill=\"currentColor\" stroke=\"none\" font-size=\"12\" font-weight=\"600\">C</text> <circle cx=\"204\" cy=\"294\" r=\"9\" fill=\"#fff\" stroke-width=\"1.4\"/><text x=\"204\" y=\"299\" text-anchor=\"middle\" fill=\"currentColor\" stroke=\"none\" font-size=\"12\" font-weight=\"600\">E</text> <text x=\"330\" y=\"300\" text-anchor=\"end\" fill=\"currentColor\" stroke=\"none\">N ↑</text> </svg>",
            planCaption: "Plan of Larkmoor College (fictional)" },
          kind: "match", chk: 2, stem: "Library", key: 0,
          ru: "«At the clock tower, turn left, and the library is the second building on your right». Налево от башни, правая (северная) сторона, второе здание от башни: A. Ловушка D: первое здание, это student office." },
        { kind: "match", chk: 2, stem: "Science block", key: 6,
          ru: "«Turn right at the clock tower… past the canteen to the science block… at the very end of the path»: здание в конце восточной дорожки, G. B — столовая, мимо неё проходишь по дороге." },
        { kind: "match", chk: 2, stem: "Sports hall", key: 5,
          ru: "Поправка: на старых картах спортзал рядом с научным корпусом, но то здание теперь лекционный зал. Новый спортзал: от главного входа на восток вдоль забора, слева (то есть к северу от забора): F." },
        { kind: "match", chk: 2, stem: "Bus stop", key: 2,
          ru: "«It used to be just outside the main entrance, but now it's behind the library, on Mill Road»: C, на Mill Road за библиотекой. Ловушка E: место у главного входа, где остановка была раньше." },

        { group: { title: "Questions 9–10", task: "Choose the correct letter, A, B, C or D.",
            ru: "Вопросы по последней части экскурсии. И здесь решает поправка." },
          kind: "mcq", chk: 2, stem: "What has happened to the building shown next to the science block on older maps?", key: 2,
          opts: ["It has become the new sports hall.", "It is closed for repairs.", "It has been turned into a lecture theatre.", "It has been moved near the main entrance."],
          ru: "«That building has been turned into a lecture theatre». A — ловушка: новый спортзал в другом месте, у входа. B сказано про кафе у озера. D: переехал спортзал, а не здание." },
        { kind: "mcq", chk: 2, stem: "Where does Dana suggest getting a coffee at the moment?", key: 1,
          opts: ["at the café by the lake", "in the canteen", "at the student office", "in the library"],
          ru: "Кафе у озера закрыто на ремонт до весны, поэтому «for a coffee, use the canteen for now». A звучит первым, но это ловушка." }
      ],
      transcript: ["Narrator: Section one. You will hear a new student talking to an assistant at the student office of Larkmoor College. First, look at questions one to four.", "Assistant: Good morning, student office. How can I help?", "Tom: Hi. I've just started this week, and, um, I need a student card.", "Assistant: Right, no problem. I'll fill in the form for you. Can I have your surname first?", "Tom: Sure, it's Brennan. That's B, R, E, double N, A, N.", "Assistant: Brennan, lovely. And which course are you on?", "Tom: History. Well, actually, no, sorry. I changed last week, so it's Geography now.", "Assistant: Geography, OK. And where are you living? Are you in one of the college blocks?", "Tom: Yes, I'm in Block F. F for Freddie. Room twelve.", "Assistant: Block F, room twelve. Now, the cards are printed here, so you'll need to come back and collect yours. It's Wednesday today, and we close at lunchtime, so the earliest would be tomorrow, Thursday.", "Tom: Thursday's fine. Do I need to bring anything?", "Assistant: Just one photograph, passport size. Oh, and your letter of offer, if you've still got it. Actually, no, forget the letter, we've got that on the system. Just the photo.", "Tom: Great, thanks.", "Narrator: Section two. You will hear a student guide giving directions around the college. First, look at the plan and questions five to eight.", "Dana: Hi everyone, and welcome to Larkmoor College. I'm Dana, one of the student guides. So, we're standing at the main entrance, here on the south side, next to the car park. On your plan you'll see the central path going straight up from where we are. Walk along it for approximately two hundred metres, and you come to a junction with a clock tower. That's the best landmark on campus. You can see it from just about anywhere. Right, the library. At the clock tower, turn left, and the library is the second building on your right, opposite the lake. Not the first one, the second. The first building, the one adjacent to the library, is the student office. If you turn right at the clock tower instead, the path takes you past the canteen to the science block. The science block is just beyond the canteen, at the very end of the path. Now, the sports hall. Don't follow the older maps: they still put it next to the science block. The new sports hall is back near the main entrance. Follow the fence east for about five minutes, and it's on your left. Oh, and one more thing. The bus stop has moved. It used to be just outside the main entrance, but now it's behind the library, on Mill Road.", "Narrator: Now look at questions nine and ten.", "Dana: Here's what happened to the old sports hall: that building has been turned into a lecture theatre. And the café by the lake, well, it's closed for repairs until the spring, so for a coffee, use the canteen for now."] },

    { type: "speaking", id: "speak", label: "IELTS-style · Speaking", title: "Give directions aloud",
      ru: "Теперь голос твой. Открой текст записи, если нужно, и объясни дорогу вслух так, чтобы человек без карты не заблудился: откуда идём, сколько идти, где повернуть, какой ориентир покажет, что мы на месте. Можно записать себя: запись остаётся только на этом устройстве.",
      prompts: [
        "A new student is at the main entrance of Larkmoor College. Tell them how to get to the science block.",
        "Now give directions from your home to the nearest shop or bus stop. Name at least two landmarks."
      ],
      prep: 30, talk: 90,
      pron: { title: "Pronunciation: stress the word that carries the direction", ru: "В указаниях дороги голосом выделяют слово, которое нельзя перепутать: left, right, second, beyond. Сначала произнеси слова, потом фразы. Выделенное слово громче и длиннее.",
        items: ["LAND-mark", "JUNC-tion", "OP-po-site", "ad-JA-cent", "EN-trance", "ap-PROX-i-mate-ly", "be-YOND", "route /ruːt/ (один слог)", "Turn LEFT at the junction.", "It's the SECOND building on your right.", "The science block is just beYOND the canteen."] },
      model: "Start at the main entrance and walk straight ahead for approximately two hundred metres, until you reach the junction with the clock tower. That is the main landmark, so you can't miss it. Turn right there. The route takes you past the canteen, and the science block is just beyond it, at the end of the path. If you see the library opposite the lake, or the student office adjacent to it, you have turned the wrong way." },

    { type: "writing", id: "write", label: "Writing micro-task", title: "From notes to two sentences",
      ru: "Во время записи пишут коротко: слова, стрелки, сокращения. Ниже две строки таких заметок. Преврати каждую в одно полное предложение с подлежащим, сказуемым, артиклями и предлогами. Ничего не добавляй от себя.",
      prompts: [
        "Notes: library → left at clock tower, 2nd bldg on right, opp. lake",
        "Notes: bus stop moved; was: main entrance; now: behind library, Mill Rd"
      ],
      minWords: 25,
      checklist: ["В каждом предложении есть подлежащее и сказуемое.", "Я вернул(а) артикли и предлоги: at the junction, on the right, opposite the lake.", "Я раскрыл(а) все сокращения.", "В предложениях нет фактов, которых не было в заметках.", "Я использовал(а) минимум два слова урока."],
      model: [
        "To reach the library, turn left at the clock tower junction; it is the second building on the right, opposite the lake.",
        "The bus stop is no longer outside the main entrance: it is now behind the library, on Mill Road."
      ] },

    { type: "questions", id: "exit", label: "Exit check", title: "Two questions before you go",
      ru: "Два вопроса без записи: один на тип ответа, один на поправку.",
      items: [
        { kind: "mcq", chk: 2,
          text: "Before the recording starts, you read this note: “The walk from the main entrance to the sports hall takes about ______ minutes.”",
          stem: "What kind of answer should you listen for?", key: 2,
          opts: ["a name", "a direction", "a number", "a building"],
          ru: "После пропуска стоит «minutes», перед ним «about»: нужно число. Имя, направление и здание в эту фразу грамматически не встают. Тип ответа виден ещё до записи, и слушать становится легче." },
        { kind: "mcq", chk: 2,
          text: "“The welcome talk starts at ten. Sorry, my mistake: it's been moved to half past ten, because the hall is being used until then.”",
          stem: "When does the welcome talk start?", key: 1,
          opts: ["at ten", "at half past ten", "at half past nine", "at eleven"],
          ru: "Сначала звучит «at ten», потом поправка «Sorry, my mistake… moved to half past ten». Записываем то, что после поправки. Half past nine и eleven не звучат вовсе." }
      ] }
  ],
  handoff: { text: "You followed one voice across a map. Next, a longer voice: a lecture on time, and the signposts that tell you where the speaker is going.", next: "C13" }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C13 = {
  id: 'C13',
  title: 'A Lecture on Time',
  thread: 'Signposts tell you where the speaker is going.',
  intro: 'В C12 ты ориентировался по плану. Здесь ориентиры слышны в лекции: возврат к теме, переход к новому пункту и уточнение. Железнодорожная сеть и её проверка в лекции используются как вымышленная модель.',
  wordsTitle: 'Eight words for a lecture on time',
  wordsRu: 'Слова встречаются в лекции или в примерах ответов. Произнеси их, затем найди знакомую идею в записи.',
  wordLabels: [ 'Lecture', 'Application' ],
  words: [
    {
      w: 'reference',
      pos: 'n.',
      ru: 'эталон, точка отсчёта',
      ex: [
        'A reference gives separate clocks something to agree on.',
        'Check the reading against an independent reference.'
      ]
    },
    {
      w: 'precise',
      pos: 'adj.',
      ru: 'точный по ходу',
      ex: [
        'The clock is precise even though it was set incorrectly.',
        'A precise instrument can reproduce a result.'
      ]
    },
    {
      w: 'signal',
      pos: 'n.',
      ru: 'сигнал',
      ex: [ 'Each station receives a signal.', 'We can compare the time a signal was sent and received.' ]
    },
    {
      w: 'adjust',
      pos: 'v.',
      ru: 'настраивать, поправлять',
      ex: [ 'Staff adjust their displays to match.', 'Adjust the clock after checking its reading.' ]
    },
    {
      w: 'drift',
      pos: 'n.',
      ru: 'постепенное отклонение',
      ex: [ 'A growing difference may be drift.', 'A second check shows how much drift has accumulated.' ]
    },
    {
      w: 'receiver',
      pos: 'n.',
      ru: 'приёмник',
      ex: [ 'A receiver processes the signal.', 'The receiver can fail while the clock keeps ticking.' ]
    },
    {
      w: 'delay',
      pos: 'n.',
      ru: 'задержка',
      ex: [
        'One problem is delay in the signal.',
        'A delay is the difference between sending and receiving.'
      ]
    },
    {
      w: 'confidence',
      pos: 'n.',
      ru: 'уверенность, степень доверия',
      ex: [
        'Recent checks give the reader more confidence.',
        'The report helps people judge their confidence in a reading.'
      ]
    }
  ],
  parts: [
    {
      type: 'questions',
      id: 'listen',
      label: 'IELTS-style · Listening Part 4',
      title: 'Listen for the turn in the lecture',
      ru: 'Один голос и десять пропусков по порядку лекции. Прочитай заметки заранее. Для тренировки формата включи запись один раз, а текст открой после ответов.',
      voices: {
        Narrator: { pitch: 1, rate: 0.92, lang: 'en-GB' },
        Lecturer: { pitch: 0.92, rate: 0.96, lang: 'en-GB' }
      },
      audio: [
        'Narrator: You will hear part of a lecture about how a network of clocks keeps time.',
        'Narrator: First, look at questions one to ten.',
        'Lecturer: Right, let’s begin with an ordinary problem.',
        'Lecturer: Imagine a railway with a clock at each station.',
        'Lecturer: A passenger changes trains at the next stop, so knowing that the first clock works well is useful only if the second clock tells the same time.',
        'Lecturer: Now, before I get to the railway, I want to go back to how you could set one clock in one place.',
        'Lecturer: One traditional reference was the Sun.',
        'Lecturer: If you watched a shadow on a clear day, the shadow reached its shortest length around local noon.',
        'Lecturer: That gave an observer a reference even without a clock already set.',
        'Lecturer: But two towns farther east and west would not necessarily reach that point together.',
        'Lecturer: So a local observation can be useful locally without giving a network a single time.',
        'Lecturer: That brings me back to the railway.',
        'Lecturer: Let’s separate two ideas here.',
        'Lecturer: First, a clock may be precise: it can tick at a regular rate.',
        'Lecturer: A clock that runs exactly two minutes ahead could still be precise in this sense.',
        'Lecturer: Second, it must agree with a common reference.',
        'Lecturer: If you set one clock and overlook its neighbour, both can tick regularly and still disagree.',
        'Lecturer: So in our imagined railway, the station staff receive a signal from one master clock and adjust their displays to match it.',
        'Lecturer: Now, how would you know whether the displays stay together?',
        'Lecturer: Well, make a record between adjustments.',
        'Lecturer: Suppose an inspector checks a station clock in the morning and at the close of service.',
        'Lecturer: If the difference gets larger, that may be drift.',
        'Lecturer: An error that stays the same is a different thing.',
        'Lecturer: It may come from setting the clock incorrectly in the first place.',
        'Lecturer: Here’s another complication: the signal has to reach the clock.',
        'Lecturer: Think of a signal carried through a network and processed by a receiver.',
        'Lecturer: It takes time to arrive.',
        'Lecturer: This may sound like a problem with precision, but for the moment I mean delay in the signal, rather than irregular ticking in the station clock.',
        'Lecturer: To test for that, write down both the time sent and the time received.',
        'Lecturer: In a prepared test, the comparison can help you estimate the delay.',
        'Lecturer: Finally, consider what you would do if the connection failed.',
        'Lecturer: The station clock could continue on its own, and the people on the platform might never notice the change.',
        'Lecturer: But staff would no longer have a fresh comparison with the reference.',
        'Lecturer: So the important thing to put in a report is the last successful check, rather than simply saying the clock is working.',
        'Lecturer: That gives the reader a way to judge how much confidence to put in the current display.',
        'Lecturer: We’ve moved from a local cue, a shadow, to a system that shows its own limitations as well as the time.'
      ],
      transcript: [
        'Narrator: You will hear part of a lecture about how a network of clocks keeps time. First, look at questions one to ten.',
        'Lecturer: Right, let’s begin with an ordinary problem. Imagine a railway with a clock at each station. A passenger changes trains at the next stop, so knowing that the first clock works well is useful only if the second clock tells the same time.',
        'Lecturer: Now, before I get to the railway, I want to go back to how you could set one clock in one place. One traditional reference was the Sun. If you watched a shadow on a clear day, the shadow reached its shortest length around local noon. That gave an observer a reference even without a clock already set. But two towns farther east and west would not necessarily reach that point together. So a local observation can be useful locally without giving a network a single time.',
        'Lecturer: That brings me back to the railway. Let’s separate two ideas here. First, a clock may be precise: it can tick at a regular rate. A clock that runs exactly two minutes ahead could still be precise in this sense. Second, it must agree with a common reference. If you set one clock and overlook its neighbour, both can tick regularly and still disagree. So in our imagined railway, the station staff receive a signal from one master clock and adjust their displays to match it.',
        'Lecturer: Now, how would you know whether the displays stay together? Well, make a record between adjustments. Suppose an inspector checks a station clock in the morning and at the close of service. If the difference gets larger, that may be drift. An error that stays the same is a different thing. It may come from setting the clock incorrectly in the first place.',
        'Lecturer: Here’s another complication: the signal has to reach the clock. Think of a signal carried through a network and processed by a receiver. It takes time to arrive. This may sound like a problem with precision, but for the moment I mean delay in the signal, rather than irregular ticking in the station clock. To test for that, write down both the time sent and the time received. In a prepared test, the comparison can help you estimate the delay.',
        'Lecturer: Finally, consider what you would do if the connection failed. The station clock could continue on its own, and the people on the platform might never notice the change. But staff would no longer have a fresh comparison with the reference. So the important thing to put in a report is the last successful check, rather than simply saying the clock is working. That gives the reader a way to judge how much confidence to put in the current display. We’ve moved from a local cue, a shadow, to a system that shows its own limitations as well as the time.'
      ],
      items: [
        {
          group: {
            title: 'Questions 1–10',
            task: 'Complete the notes below. Write NO MORE THAN TWO WORDS from the recording for each answer.',
            ru: 'Следи за указателями first, that brings me back, another complication, finally. Вписывай слова, которые услышал(а).',
            table: {
              caption: 'Lecture notes · Clocks across a railway',
              head: [ 'Topic', 'Notes' ],
              rows: [
                [ 'Local time', 'Reference: the (1) ______\nShortest shadow: around (2) ______' ],
                [
                  'Agreement',
                  'A precise clock ticks at a (3) ______\nSource shared by stations: one (4) ______'
                ],
                [
                  'Between checks',
                  'A growing difference may be (5) ______\n' +
                    'An unchanged difference may follow from (6) ______ the clock incorrectly'
                ],
                [
                  'Signal delivery',
                  'Device that processes it: a (7) ______\nTime required for it to arrive: (8) ______'
                ],
                [
                  'Loss of connection',
                  'The clock can continue on its (9) ______\nReport the last successful (10) ______'
                ]
              ]
            }
          },
          kind: 'gap',
          limit: 2,
          stem: '1 · Traditional reference used to set a clock in one place: the ______.',
          accept: [ 'Sun' ],
          ru: 'После «go back to how you could set one clock» лектор называет Sun. Railway — тема всей лекции, а не точка отсчёта.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '2 · At what point is the shadow shortest? Around ______.',
          accept: [ 'local noon', 'noon' ],
          ru: 'Лектор говорит around local noon. Допустимо noon, потому что local лишь уточняет, чьё это время. East и west относятся к сравнению городов.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '3 · A precise clock ticks at a ______.',
          accept: [ 'regular rate' ],
          ru: 'После «First» звучит regular rate. Common reference относится ко второму условию, совпадению времени.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '4 · Stations adjust their displays using a signal from one ______.',
          accept: [ 'master clock' ],
          ru: 'После «So in our imagined railway» источник назван master clock. Signal — то, что посылают, а не источник.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '5 · A growing difference between the readings may be ______.',
          accept: [ 'drift' ],
          ru: 'If the difference gets larger, that may be drift. Постоянная ошибка обсуждается дальше.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '6 · A difference that stays the same can come from ______ the clock incorrectly.',
          accept: [ 'setting' ],
          ru: '«It may come from setting the clock incorrectly in the first place». Adjustments относятся к проверкам, а дальше названо исходное действие.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '7 · In the network example the signal is processed by a ______.',
          accept: [ 'receiver' ],
          ru: 'Processed by a receiver. Network — путь сигнала, receiver — устройство.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '8 · The time a signal takes to arrive is called ______.',
          accept: [ 'delay' ],
          ru: '«I mean delay in the signal». Лектор упоминает precision, затем уточняет, что речь о задержке.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '9 · If the connection fails, the clock could continue on its ______.',
          accept: [ 'own' ],
          ru: '«Continue on its own» показывает, что часы сохраняют ход без свежего сигнала.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '10 · A useful report gives the last successful ______.',
          accept: [ 'check' ],
          ru: '«The last successful check». Сказать только, что часы работают, недостаточно: тогда неизвестно, когда их сверяли.',
          chk: 2
        }
      ]
    },
    {
      type: 'speaking',
      id: 'speak',
      label: 'IELTS-style · Speaking Part 2',
      title: 'Retell the problem with two signposts',
      ru: 'Кратко перескажи лекцию своими словами. Голосом отметь переход от местных часов к системе. Пример записи можно сохранить на этом устройстве.',
      prompts: [
        'Describe a problem that can arise when different people have to use the same time.',
        'You should say: where it could happen',
        'how the clocks might disagree',
        'what a common reference changes',
        'and explain why checking the clocks is still useful.'
      ],
      prep: 60,
      talk: 120,
      pron: {
        title: 'Pause before a change of topic',
        ru: 'Перед новой частью сделай паузу. Смысловое слово в следующей части выдели голосом.',
        items: [
          'Let’s begin with the PROBLEM.',
          'That brings me back to the RAILway.',
          'Here is another compliCAtion.',
          'FINally, check the time.'
        ]
      },
      model: 'Imagine two stations with their own clocks and a passenger who has to change trains. To begin with, each clock can be precise on its own, yet the displays might disagree. That brings me to the reference. A signal from one master clock lets staff adjust both displays. Finally, a report should tell us when the last check succeeded, because an old check gives us less confidence if the receiver stops working. A clock can keep ticking without keeping in step with the others.'
    },
    {
      type: 'writing',
      id: 'write',
      label: 'Writing micro-task',
      title: 'Summarise a lecture in three sentences',
      ru: 'Напиши три предложения. Назови проблему, опиши решение и укажи, какое ограничение осталось. Вместо деталей о тени и платформе возьми главную связь между точностью и согласованием.',
      prompts: [ 'Summarise why a railway needs a shared time reference and why it checks the signal.' ],
      minWords: 45,
      checklist: [
        'Есть различие между ровным ходом и совпадением.',
        'Назван общий источник сигнала.',
        'Я объяснил(а), почему нужна проверка даже при работающих часах.'
      ],
      model: [
        'Separate clocks may tick regularly and still disagree, so an imagined railway uses a common reference to set the station displays. Checking a signal’s sending and receiving times helps identify delay, while repeated comparisons can reveal drift. If the connection fails, the last successful check gives staff a better reason for confidence than seeing that a display is still working.'
      ]
    },
    {
      type: 'questions',
      id: 'exit',
      label: 'Exit check',
      title: 'Follow the signpost',
      ru: 'В этих двух вопросах фрагменты напечатаны. Определи, что обещает указатель и что лектор сказал после уточнения.',
      items: [
        {
          kind: 'mcq',
          text: '“I have explained why two clocks can disagree. Now let’s look at what happens when a signal reaches a station late.”',
          stem: 'What will the speaker discuss next?',
          opts: [
            'The history of clockmaking.',
            'The number of station clocks.',
            'The location of the clock factory.',
            'The delay in a signal reaching the station.'
          ],
          key: 3,
          ru: 'D. Now let’s look переносит внимание на позднее поступление сигнала. Первая фраза завершает предыдущий пункт.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: '“You might think this is drift. In this case the difference stayed exactly the same, so the likely problem was the way the clock was set.”',
          stem: 'What explanation does the speaker favour?',
          opts: [
            'An error in the original setting.',
            'A difference that grew over time.',
            'A signal that arrived earlier every day.',
            'A station that had no clock.'
          ],
          key: 0,
          ru: 'A. В словах после in this case лектор называет исходную настройку. Drift звучит первым как возможная, но отвергнутая версия.',
          chk: 2
        }
      ]
    }
  ],
  handoff: {
    text: 'You heard how signposts organise a lecture. Next, use stress and pauses to organise a reply of your own.',
    next: 'C14'
  }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C14 = {
  id: 'C14',
  title: 'Say It Clearly',
  thread: 'Stress and pauses are the punctuation of speech.',
  intro: 'В C13 паузы и ударение помогали услышать переход к новой мысли. Теперь запиши собственные ответы на три части IELTS Speaking. Общая тема — как человек находит нужную дорогу и как организация помогает ему ориентироваться.',
  wordsTitle: 'Eight words for clear speech',
  wordsRu: 'Произнеси отмеченные ключевые слова и послушай, как меняется смысл.',
  wordLabels: [ 'Speech', 'Self-review' ],
  words: [
    {
      w: 'pace',
      pos: 'n.',
      ru: 'темп речи',
      ex: [
        'Slow the pace just before an important direction.',
        'My pace made the final sentence difficult to follow.'
      ]
    },
    {
      w: 'pause',
      pos: 'n./v.',
      ru: 'пауза, делать паузу',
      ex: [
        'Leave a brief pause before the new instruction.',
        'I heard a pause between the reason and the example.'
      ]
    },
    {
      w: 'stress',
      pos: 'n./v.',
      ru: 'ударение, произносить с ударением',
      ex: [
        'Stress the name that identifies the right station.',
        'The stress on “second” makes the direction clear.'
      ]
    },
    {
      w: 'emphasis',
      pos: 'n.',
      ru: 'выделение, смысловой акцент',
      ex: [
        'Put emphasis on the feature the listener could confuse.',
        'I moved the emphasis to the street name.'
      ]
    },
    {
      w: 'intelligible',
      pos: 'adj.',
      ru: 'понятный на слух',
      ex: [ 'A clear ending makes the address intelligible.', 'My two versions were equally intelligible.' ]
    },
    {
      w: 'hesitation',
      pos: 'n.',
      ru: 'заминка, колебание',
      ex: [
        'A moment of hesitation can occur when you look for a word.',
        'I noticed one hesitation before the street name.'
      ]
    },
    {
      w: 'restate',
      pos: 'v.',
      ru: 'сформулировать ещё раз',
      ex: [
        'Restate the instruction if the listener looks puzzled.',
        'I restated the turn in a shorter sentence.'
      ]
    },
    {
      w: 'clarify',
      pos: 'v.',
      ru: 'прояснять, уточнять',
      ex: [
        'Clarify which bridge the visitor should use.',
        'The detail about the river clarified the route.'
      ]
    }
  ],
  parts: [
    {
      type: 'speaking',
      id: 'speak',
      label: 'IELTS-style · Speaking',
      title: 'Record all three parts',
      ru: 'Ответь на части по порядку в одной записи. Таймер относится только к карточке Part 2. Запись можно прослушать или скачать из этой вкладки. После записи выбери два места, где голос помог или помешал понять маршрут.',
      sections: [
        {
          title: 'Part 1 · Familiar questions',
          prompts: [
            'Do you usually look at a map before going somewhere new?',
            'What kind of signs do you notice first when you arrive at a station?'
          ]
        },
        {
          title: 'Part 2 · Long turn',
          prompts: [
            'Describe a time when someone helped you find your way in an unfamiliar place.',
            'You should say: where you were trying to go',
            'who gave you directions',
            'what made the directions easy or difficult to follow',
            'and explain what you learned from the experience.'
          ]
        },
        {
          title: 'Part 3 · Discussion',
          prompts: [
            'Why are some public places easier to navigate than others?',
            'Should a city design its signs mainly for people who visit regularly or for first-time visitors?'
          ]
        }
      ],
      prompts: [
        'Describe a time when someone helped you find your way.',
        'You should say where you were going, who helped and how clear the directions were.',
        'Explain what you learned from the experience.'
      ],
      prep: 60,
      talk: 120,
      pron: {
        title: 'Give each thought a clear centre',
        ru: 'В каждой короткой группе выдели одно значение. Пауза помогает услышать границу. Если запнулся, уточни смысл фразой “I mean …” и продолжай.',
        items: [
          'Take the SECOND left.',
          'Take the second LEFT.',
          'After the bridge | follow the BLUE signs.',
          'I mean | the entrance by the RIVER.'
        ]
      },
      model: [
        'Part 1. I usually check a map if I’m going to a new part of town, mostly so I know which exit to use. At a station I look for signs with a street name or a familiar landmark, because exit numbers on their own are hard for me to remember.',
        'Part 2. A college student once showed me how to get to a public lecture. I had arrived at the north entrance, but the invitation showed a photograph of the south entrance, so I thought I was at the wrong site. She pointed across the courtyard and said I should take the second path, towards the bridge. I heard the emphasis on “second”, which mattered because the first path looked wider and much more inviting. After a brief pause she restated the instruction. She said I would see a blue sign just before the bridge. That last detail clarified the turn and let me check the route for myself. I learned that you can give quite a short instruction if you include one thing the other person can recognise without asking you again.',
        'Part 3. Signs have to answer the questions that people have at the moment they see them. A regular visitor may remember a platform number, whereas a new visitor needs to know which hallway leads to it. I would design the main signs for first-time visitors and add short direct labels at familiar points, so regular visitors can still move quickly.'
      ]
    },
    {
      type: 'writing',
      id: 'write',
      label: 'Recording self-review',
      title: 'Review two moments from your recording',
      ru: 'Назови конкретную фразу или место записи. Объясни, какое слово было трудно понять, и запиши более чёткий вариант. Письменный разбор оценивает наблюдение и действие, без автоматического балла за речь.',
      prompts: [
        'Identify one place where stress or a pause helped the listener.',
        'Identify one place you would restate and write the revised line.'
      ],
      minWords: 55,
      checklist: [
        'Я привёл(а) две конкретные фразы.',
        'Я объяснил(а) эффект ударения, паузы или темпа.',
        'Я написал(а) улучшенную фразу и произнёс(ла) её вслух.'
      ],
      model: [
        'My pace slowed before “the SECOND path”, so the stress made the choice intelligible. The hesitation after “go over there” left the turn unclear, because I had not yet named a landmark. I would restate it as “At the bridge, follow the BLUE signs”. The pause after “bridge” and the emphasis on “blue” clarify which sign to follow.'
      ]
    },
    {
      type: 'questions',
      id: 'exit',
      label: 'Exit check',
      title: 'Check the listener’s clue',
      ru: 'В примерах заглавные буквы показывают ударение, вертикальная черта показывает паузу.',
      items: [
        {
          kind: 'mcq',
          text: 'Two paths turn left. A visitor asks whether to take the first or the second.',
          stem: 'Which instruction makes the difference clearest?',
          opts: [
            'Take the second LEFT.',
            'Take the SECOND left.',
            'TAKE the second left.',
            'Take the second left, over THERE.'
          ],
          key: 1,
          ru: 'B. Выбор идёт между первым и вторым поворотом, поэтому важно выделить SECOND. В A выделено направление, которое в обоих случаях одинаково.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'A listener asks which bridge you mean.',
          stem: 'Which repair gives the clearest new information?',
          opts: [
            'As I said, use the bridge.',
            'It is definitely a bridge.',
            'I mean the footbridge next to the station.',
            'I have directions for you.'
          ],
          key: 2,
          ru: 'C. Footbridge next to the station даёт проверяемый ориентир. A и B повторяют исходное слово, D ничего не уточняет.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'The question is whether public signs should prioritise first-time visitors.',
          stem: 'Which reply gives a general reason for its position?',
          opts: [
            'Yes. I once missed a bus.',
            'I go to my station every day.',
            'No, I don’t really like signs.',
            'Yes. Regular visitors are more likely to know the route, while first-time visitors may need the sign to choose the correct exit.'
          ],
          key: 3,
          ru: 'D. Ответ выражает позицию и сравнивает потребности групп. A остаётся на уровне одного случая. B и C не объясняют приоритет.',
          chk: 2
        }
      ]
    }
  ],
  handoff: {
    text: 'A listener needs a clear route through an answer. In the next lesson you will build that route on the page.',
    next: 'C15'
  }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C15 = {
  id: 'C15',
  title: 'Building the Essay',
  thread: 'Every brick from earlier lessons, in one piece.',
  intro: 'В C14 слушателю помогали смысловые акценты и паузы. В эссе читателю помогают позиция, порядок и доказательства. Это задание IELTS Academic Writing Task 2 внутри демо-курса.',
  wordsTitle: 'Eight words for a complete argument',
  wordsRu: 'Проверь, какую работу каждое слово выполняет в аргументе.',
  wordLabels: [ 'Argument', 'Revision' ],
  words: [
    {
      w: 'stance',
      pos: 'n.',
      ru: 'позиция',
      ex: [
        'The opening makes the writer’s stance clear.',
        'Keep the same stance when you reach the conclusion.'
      ]
    },
    {
      w: 'concede',
      pos: 'v.',
      ru: 'признавать часть довода',
      ex: [
        'The writer concedes that one rule may be costly to introduce.',
        'Concede the point before explaining the limit.'
      ]
    },
    {
      w: 'qualify',
      pos: 'v.',
      ru: 'уточнять границы утверждения',
      ex: [
        'The writer qualifies the claim by describing an exception.',
        'Qualify the rule so that it applies to new labels.'
      ]
    },
    {
      w: 'develop',
      pos: 'v.',
      ru: 'развивать мысль',
      ex: [
        'Develop the point with evidence about a transfer.',
        'Develop a specific consequence in the second sentence.'
      ]
    },
    {
      w: 'coherent',
      pos: 'adj.',
      ru: 'связный, логически цельный',
      ex: [
        'A coherent essay keeps its order through the conclusion.',
        'The paragraphs tell a coherent story about the same journey.'
      ]
    },
    {
      w: 'specific',
      pos: 'adj.',
      ru: 'конкретный',
      ex: [
        'A specific example shows why a passenger missed a connection.',
        'Replace a broad claim with a specific reason.'
      ]
    },
    {
      w: 'consequence',
      pos: 'n.',
      ru: 'следствие',
      ex: [
        'A missed connection is a consequence of unclear information.',
        'Explain the consequence before moving to a second argument.'
      ]
    },
    {
      w: 'weigh',
      pos: 'v.',
      ru: 'взвешивать, сопоставлять по значимости',
      ex: [
        'Weigh convenience against the need for local detail.',
        'The conclusion explains how the writer weighs the two benefits.'
      ]
    }
  ],
  parts: [
    {
      type: 'speaking',
      id: 'speak',
      label: 'IELTS-style · Speaking Part 3',
      title: 'Weigh both views aloud',
      ru: 'Выбери позицию, объясни её и признай сильный довод другой стороны. Отдельно сформулируй, при каком условии твой вывод изменился бы.',
      prompts: [
        'Should every transport provider present route information in the same way?',
        'Which local details are most useful to someone making a connection?'
      ],
      prep: 30,
      talk: 90,
      pron: {
        title: 'Give the concession its own thought group',
        ru: 'Сделай паузу перед главным выводом. Выдели условие, которое ограничивает твою позицию.',
        items: [
          'I conCEDE that local detail matters.',
          'HOWever | the basic layout can stay the same.',
          'My main conCERN is the connection.',
          'The rule should apply to ESsential information.'
        ]
      },
      model: 'I would keep a common layout for the details every passenger needs. If the last departure always appears in the same place, it is easier to compare two services. I would qualify that idea by allowing room for local facts, such as which entrance a ferry passenger needs. The main test is whether a person can use the common layout during a short connection.'
    },
    {
      type: 'writing',
      id: 'write',
      label: 'IELTS Academic · Writing Task 2',
      title: 'Write the complete two-view essay',
      ru: 'Напиши полное эссе из 250 слов или больше. Обсуди обе позиции и вырази собственную. Можно сверить свой ответ с образцом и четырьмя критериями в office hours.',
      prompts: [
        'Some people believe that all public transport operators should use one format for route information. Others think each operator should be free to use its own format. Discuss both views and give your own opinion.'
      ],
      minWords: 250,
      checklist: [
        'Task Response: я рассмотрел(а) обе позиции и объяснил(а), как пришёл(ла) к своей.',
        'Coherence and Cohesion: каждый абзац развивает одну главную мысль.',
        'Lexical Resource: я назвал(а) конкретные детали и избегал(а) повтора общей формулировки.',
        'Grammatical Range and Accuracy: я проверил(а) границы предложений, согласование и артикли.'
      ],
      model: [
        'A passenger changing between services may have to read two very different kinds of route information in one journey. Some people want all operators to use a shared format, while others would let each operator design its own. I favour a common structure for the information needed on any journey, with room for operators to add details that are specific to their routes.',
        'The case for uniformity is strongest at transfer points. A passenger looking for the last departure should be able to find that information in the same place on a bus timetable and on a ferry timetable. Otherwise, a short connection can become a search through unfamiliar headings. A shared structure would also make it easier to explain delays or cancellations in consistent terms. These benefits arise because passengers can reuse what they have learned about one service on another.',
        'There is nevertheless a reason to give operators some freedom. A ferry may need to tell passengers where to queue when an entrance is closed, whereas a bus route may need to show where traffic regularly changes the stopping point. A layout designed for only one of these situations could conceal an important detail. I concede that local information deserves enough space to be useful, but this does not require every operator to move the basic information to a different position. A shared core and a clearly marked local section could serve both purposes.',
        'On balance, I would weigh the consequence of making essential information difficult to find more heavily than the inconvenience of a common template. That stance leaves room for a coherent explanation of local conditions and gives passengers a predictable place to look when they switch services.'
      ]
    },
    {
      type: 'questions',
      id: 'exit',
      label: 'Exit check',
      title: 'Check whether each paragraph earns its place',
      ru: 'Определи, какое предложение выполняет названную работу в аргументе.',
      items: [
        {
          kind: 'mcq',
          text: 'The essay prompt asks for both positions on a standard timetable format and the writer’s own opinion.',
          stem: 'Which opening meets both demands?',
          opts: [
            'People have many views about public transport.',
            'A single layout can make comparisons easier, while local layouts can show details unique to a route. I favour a shared layout for essential information.',
            'Transport companies have used paper timetables for many years.',
            'I favour a shared layout because buses matter.'
          ],
          key: 1,
          ru: 'B. Названы обе позиции и выбор автора. D называет мнение, но не объясняет вторую позицию. A и C слишком общие.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'A writer claims that a common timetable format helps people transfer between services.',
          stem: 'Which example develops that claim most directly?',
          opts: [
            'A ferry operator painted a terminal blue.',
            'A bus company opened a new depot.',
            'A passenger found the departure time of the last ferry more quickly because it used the same departure column as the connecting bus.',
            'A train timetable was printed on thick paper.'
          ],
          key: 2,
          ru: 'C. Пример показывает конкретное сокращение поиска при пересадке. Остальные детали относятся к транспорту, но не проверяют пользу общего формата.',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'A paragraph argues for a common layout for essential information and a reserved area for local details.',
          stem: 'Which conclusion stays within that position?',
          opts: [
            'A shared layout should cover core information, with a clear space for details specific to each service.',
            'Operators should remove all local information.',
            'Every operator must design its own layout for every route.',
            'All passengers should be required to use one transport company.'
          ],
          key: 0,
          ru: 'A. Основная информация остаётся общей, а локальная сохраняется в выделенном месте. B и C меняют позицию. D переносит спор на число перевозчиков.',
          chk: 2
        }
      ]
    }
  ],
  handoff: {
    text: 'You built a complete argument from a clear route through the evidence. Now map the skills you want to carry into independent practice.',
    next: 'C16'
  }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C16 = {
  id: 'C16',
  title: 'Your Own Map',
  thread: 'Draw the map of your errors. Decide what to leave out.',
  intro: 'В начале курса карта помогала выбрать нужные детали. Теперь у тебя две карты: навигация для посетителя и список навыков для следующей попытки. Материалы про общественные здания вымышлены.',
  words: [
    {
      w: 'prioritise',
      pos: 'v.',
      ru: 'отдавать приоритет',
      sat: 'The editor prioritised the detail a visitor needs at a turn.',
      ielts: 'A route map may prioritise the first action a visitor must take.'
    },
    {
      w: 'sequence',
      pos: 'n.',
      ru: 'последовательность',
      sat: 'The signs show the sequence of turns.',
      ielts: 'A different sequence can change which detail a visitor sees first.'
    },
    {
      w: 'constraint',
      pos: 'n.',
      ru: 'ограничение',
      sat: 'The size of a phone screen is a practical constraint.',
      ielts: 'An access constraint changes what should appear on a route map.'
    },
    {
      w: 'orient',
      pos: 'v.',
      ru: 'помогать сориентироваться',
      sat: 'The clock tower orients new visitors.',
      ielts: 'The entrance sign helps people orient themselves.'
    },
    {
      w: 'interpret',
      pos: 'v.',
      ru: 'истолковывать, понимать',
      sat: 'The staff interpreted the question as a request for a different route.',
      ielts: 'Two visitors can interpret the same line differently.'
    },
    {
      w: 'revise',
      pos: 'v.',
      ru: 'пересматривать, исправлять',
      sat: 'The team revised the map after the first trial.',
      ielts: 'A new observation gives the designer a reason to revise a guide.'
    },
    {
      w: 'transfer',
      pos: 'v.',
      ru: 'переносить, применять в другом случае',
      sat: 'The team tested whether the result could transfer to another entrance.',
      ielts: 'An improvement may transfer to signs with the same purpose.'
    },
    {
      w: 'reliable',
      pos: 'adj.',
      ru: 'надёжный',
      sat: 'A repeated result offers a more reliable guide to the change.',
      ielts: 'The report distinguishes a reliable conclusion from a first impression.'
    }
  ],
  parts: [
    {
      type: 'questions',
      id: 'sat',
      label: 'SAT · Reading and Writing',
      title: 'Choose the skill before the answer',
      ru: 'Четыре вопроса из разных областей SAT. Каждый пример про то, как человек читает знак или карту.',
      items: [
        {
          kind: 'mcq',
          text: 'The diagram is deliberately sparse: at each junction it shows the next decision and the landmark that confirms it, leaving most of the surrounding buildings unmarked.',
          stem: 'As used in the text, what does “sparse” most nearly mean?',
          opts: [
            'Difficult to copy',
            'Containing few details',
            'Drawn with uncertain distances',
            'Widely available'
          ],
          key: 1,
          ru: 'B. В тексте оставили только решение и ориентир, а большинство зданий опустили. A, C и D не объясняют это ограничение.',
          skill: 'WIC',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'The original map served only visitors arriving at the main entrance. ______ the side entrance reopened, and a second version became necessary.',
          stem: 'Which choice completes the text with the most logical transition?',
          opts: [ 'For example,', 'Similarly,', 'In other words,', 'Later,' ],
          key: 3,
          ru: 'D. Открытие бокового входа — более позднее событие. A обещает пример той же версии, B — параллель, C — перефразирование.',
          skill: 'TRN',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'After every trial, the researcher asks the visitor how they interpreted one sign. The interview takes place only after the visitor has reached the destination.',
          stem: 'What can most reasonably be inferred about the researcher’s procedure?',
          opts: [
            'The interview can reveal how the sign was understood without directing the visitor’s original route.',
            'The researcher uses the interview to direct visitors to the destination.',
            'Only visitors who misunderstood the sign are interviewed.',
            'Every visitor follows the same sequence of turns.'
          ],
          key: 0,
          ru: 'A. После прибытия обсуждение уже не может направить первоначальный маршрут. B ставит интервью слишком рано. C и D добавляют условия, которых в тексте нет.',
          skill: 'INF',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'The diagram shows the lift beside the ______ the detailed access guide names the entrance at which that lift can be reached without steps.',
          stem: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
          opts: [ 'stairs,', 'stairs', 'stairs, and', 'stairs and,' ],
          key: 2,
          ru: 'C. Перед пропуском и после него по самостоятельному предложению. Запятая с and соединяет их. A оставляет comma splice, B сливает два предложения, D ставит запятую после and.',
          skill: 'BND',
          chk: 2
        }
      ]
    },
    {
      type: 'questions',
      id: 'ielts',
      label: 'IELTS Academic · Reading',
      title: 'How a guide changes after a trial',
      ru: 'Ответь на 13 вопросов. Следи, какой выигрыш доказан наблюдением и на какие маршруты его можно перенести.',
      lettered: true,
      passageTitle: 'A Map for the Next Visit',
      passage: [
        'When a person asks for a map of a building, it is easy to assume the request is for a miniature version of the floor plan, even though the needs of a person looking for the exit differ from those of the architect who decided where the walls should stand. A visitor has to interpret a drawing while walking, carrying belongings and noticing signs that were made for other purposes. In the following fictional example, a public building has both a detailed plan and a separate route guide, an arrangement that illustrates why omission can be an important design decision.',
        'The original route guide contained almost every room, since the designers expected that this completeness would help visitors orient themselves and that a familiar feature could be found wherever they happened to look. An observer stationed near the entrance noticed a different problem. People arriving for a public workshop often recognised the entrance on the map, yet they struggled to work out which of several thin lines represented a route they could actually take. Finding their position had therefore failed to determine their next action, an observation that gave the designers a reason to prioritise the sequence of choices at doors and corners.',
        'For a second version, the designers redrew the page around the journey from the entrance to the main workshop. They kept a broad line for the recommended route and moved room names away from the places where visitors had to turn, adding a landmark immediately afterwards so that a visitor could check whether it was the intended one. A familiar notice board was consequently worth including even though its location mattered little to someone interested in the building as a whole. The purpose of this feature was confirmation after a decision, rather than identification before leaving the entrance.',
        'A separate issue emerged when the team tried that version with people who could not use stairs, because the broad line provided no indication of an alternative route via a lift. Space on a small screen was a genuine constraint, yet removing the alternative would make the guide useless to some visitors. The designers therefore put an access tab next to the main diagram rather than attaching separate notes to every room. The lift and the entrance that served it appeared together on a screen that users could open directly when they needed the accessible route.',
        'A trial of a design needs a question that the observations can answer. In this case a volunteer waited at the entrance and asked unfamiliar visitors to find the workshop. When they reached it, the volunteer recorded which turn had caused the first hesitation, if there had been one. The team did not use a general question about whether the building was welcoming, because that answer might depend on many things that the route guide could not change. Recording a particular pause gave the designers a reason to revise a particular passage of the route rather than simply conclude that people liked one version.',
        'Even a clearly recorded result can be difficult to transfer to another setting. A person who finds the public workshop on a quiet day may have trouble following the same line when an event blocks part of the hallway. It would be premature to call the new guide reliable in all conditions on the basis of one visit or one group. A further trial could use another entrance or take place during a busy event, and a description of both the route and the conditions would enable later readers to decide whether another test is genuinely different from the first.',
        'The team now has two useful kinds of map. One is for the visitor, and it describes a possible way through the building without presenting every room at once. The other is for the designers, and it describes what people actually found difficult rather than everything the designers imagined might go wrong. Neither has to cover the entire building to be useful. What matters is that the two documents make clear which decisions they support, and that the authors leave enough evidence for somebody else to try the route or improve it.'
      ],
      items: [
        {
          group: {
            title: 'Questions 1–5',
            task: 'Which paragraph, A–G, contains the following information? You may use any letter more than once.',
            ru: 'Укажи абзац с конкретной информацией.',
            paras: 7
          },
          kind: 'match',
          stem: 'a limitation of the trial when the building is used under different conditions',
          key: 5,
          ru: 'F. В тихий день проверяется не та же ситуация, что при мероприятии, перекрывшем проход.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'an example of an object that helps travellers check a choice they have already made',
          key: 2,
          ru: 'C. Доска объявлений появляется после поворота и подтверждает выбор. В A говорится о роли карты в целом.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'a difference between understanding one’s location and knowing what to do next',
          key: 1,
          ru: 'B. Посетители нашли вход на плане, но не поняли, по какой линии идти.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'a reason for the team to reject a broad question in the trial',
          key: 4,
          ru: 'E. Впечатление о здании зависит от факторов, на которые путеводитель не влияет.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'a way to open a route designed for people with a different access requirement',
          key: 3,
          ru: 'D. Отдельная вкладка напрямую открывает подъём через лифт.',
          chk: 2
        },
        {
          group: {
            title: 'Questions 6–9',
            task: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
            ru: 'Возьми слова из текста и проверь грамматику.'
          },
          kind: 'gap',
          limit: 2,
          stem: '6 · In the redesigned guide the suggested journey was marked with a ______.',
          accept: [ 'broad line', 'line' ],
          ru: 'C. Маршрут выделен линией. Broad уточняет внешний вид.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '7 · From the main drawing, users can select a separate ______ to find the route without stairs.',
          accept: [ 'access tab', 'tab' ],
          ru: 'D. Вкладка вынесена рядом со схемой. Lift находится уже на доступном маршруте, а не открывает его на экране.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '8 · The volunteer noted the turn at which a visitor’s first ______ occurred.',
          accept: [ 'hesitation' ],
          ru: 'E. Наблюдатель записывал first hesitation, если посетитель замешкался.',
          chk: 2
        },
        {
          kind: 'gap',
          limit: 2,
          stem: '9 · The author suggests testing the route while a ______ is taking place.',
          accept: [ 'busy event', 'event' ],
          ru: 'F. Автор предлагает busy event. Это меняет условия, а не только время записи.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What does the writer use the architect to illustrate in paragraph A?',
          opts: [
            'The needs of different users of a plan may differ.',
            'People usually ask architects for help finding exits.',
            'The number of walls determines whether a visitor gets lost.',
            'A visitor should always be given an architect’s full plan.'
          ],
          key: 0,
          ru: 'A. Архитектору и человеку у выхода нужна разная информация. B–D не объясняют этот пример.',
          group: {
            title: 'Questions 10–13',
            task: 'Choose the correct letter, A, B, C or D.',
            ru: 'Для каждого вопроса найди опору в тексте.'
          },
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'Why did the designers initially include so many rooms?',
          opts: [
            'They needed the plan to double as a record of attendance.',
            'They thought people could use familiar features to work out where they were.',
            'They wanted visitors to remember the names of every room.',
            'They expected to shorten the route by adding more stops.'
          ],
          key: 1,
          ru: 'B. Первоначальная идея — показать знакомый предмет рядом с любой точкой. A, C и D приписывают дизайнерам другие цели.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'Why did the second version need an access tab?',
          opts: [
            'Visitors all had to start their journey in the lift.',
            'The workshop was difficult to locate on a large screen only.',
            'People who could not use stairs needed a visible alternative route.',
            'The volunteer wanted a place to record how long visitors took.'
          ],
          key: 2,
          ru: 'C. D объясняет, что основная линия скрыла путь через лифт. A обобщает, B заменяет препятствие экраном, D относится к наблюдениям.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What is the main point about the two maps in paragraph G?',
          opts: [
            'Both maps should eventually show every room.',
            'A map for designers should show only the fastest visitor.',
            'The visitor guide is more reliable than the trial notes.',
            'Each document is useful when it serves a defined decision and preserves the relevant evidence.'
          ],
          key: 3,
          ru: 'D. Последнее предложение G связывает документ с задачей и доказательствами для повторной проверки. A противоречит G, B и C не названы.',
          chk: 2
        }
      ]
    },
    {
      type: 'questions',
      id: 'listen',
      label: 'IELTS-style · Listening Part 3',
      title: 'Listen to a trial being planned',
      ru: 'Два студента обсуждают учебный проект с преподавателем. В первой группе выясни, кто предложил действие. Во второй слушай, что осталось в плане после поправок.',
      voices: {
        Narrator: { pitch: 1, rate: 0.93, lang: 'en-GB' },
        Iris: { pitch: 1.17, rate: 0.97, lang: 'en-GB' },
        Owen: { pitch: 0.86, rate: 0.95, lang: 'en-AU' },
        Tutor: { pitch: 1.03, rate: 0.9, lang: 'en-GB' }
      },
      audio: [
        'Narrator: You will hear two students and their tutor discussing a trial of a public map.',
        'Narrator: Look at questions one to five.',
        'Iris: We’re nearly ready to try out the new map of the arts centre.',
        'Iris: Owen, I was going to meet visitors at the ticket desk, but it would be better to wait in the courtyard.',
        'Iris: I can see every group arrive there without interrupting the ticket queue.',
        'Owen: Fine.',
        'Owen: I’ll ask people to find the upstairs gallery.',
        'Owen: We should watch where they first hesitate, rather than ask which design they like.',
        'Owen: We could put a small mark on our own copy of the map each time somebody stops to look around.',
        'Tutor: And remember that visitors who already know the building will probably walk straight there.',
        'Tutor: For this trial, ask each visitor whether this is their first visit before you hand over a map.',
        'Tutor: That will help you judge which results are about the design.',
        'Iris: We could give everyone the same map on paper and then on a phone.',
        'Iris: Actually, that means they would already know the route on their second trip.',
        'Iris: I’d rather give each visitor just one version.',
        'Owen: For the report, I wanted a table of total times.',
        'Owen: It might be more useful to draw a diagram showing the places where people hesitate.',
        'Owen: We can keep the times in our notes if we need them.',
        'Narrator: Now look at questions six to ten.',
        'Tutor: Good.',
        'Tutor: Next, decide what to point out without giving away the route.',
        'Tutor: Which landmark can visitors use to start?',
        'Iris: I thought of the café, but it’s closed during the trial.',
        'Iris: The coloured mosaic by the door is visible from the courtyard, so let’s use that.',
        'Iris: We can ask visitors to start there.',
        'Tutor: Suppose somebody asks you for help halfway through.',
        'Tutor: What will you write down?',
        'Owen: I was going to time how long it takes to answer.',
        'Owen: But what might tell us more is the question itself.',
        'Owen: If they ask how to reach the lift and that word is missing from the map, we have a clue about what to change.',
        'Iris: Right.',
        'Iris: We should also check that our route can be used without stairs.',
        'Iris: I’d assumed the main lift goes to the gallery, but the building manager says you can only reach it using the lift near the studio.',
        'Iris: Can we test that route ourselves before we ask people to try it?',
        'Tutor: Yes.',
        'Tutor: As for your results, one person might stop simply to greet a friend.',
        'Tutor: Do not draw a conclusion about a place on the first observation alone.',
        'Tutor: Start looking for spots where that hesitation is repeated by different visitors.',
        'Owen: And we should make it clear who used the maps.',
        'Owen: We were thinking of calling it a guide for every visitor, but our task only takes people to the upstairs gallery.',
        'Owen: I’ll name that destination in the title of the report, so people can see exactly what we tested.'
      ],
      transcript: [
        'Narrator: You will hear two students and their tutor discussing a trial of a public map. Look at questions one to five.',
        'Iris: We’re nearly ready to try out the new map of the arts centre. Owen, I was going to meet visitors at the ticket desk, but it would be better to wait in the courtyard. I can see every group arrive there without interrupting the ticket queue.',
        'Owen: Fine. I’ll ask people to find the upstairs gallery. We should watch where they first hesitate, rather than ask which design they like. We could put a small mark on our own copy of the map each time somebody stops to look around.',
        'Tutor: And remember that visitors who already know the building will probably walk straight there. For this trial, ask each visitor whether this is their first visit before you hand over a map. That will help you judge which results are about the design.',
        'Iris: We could give everyone the same map on paper and then on a phone. Actually, that means they would already know the route on their second trip. I’d rather give each visitor just one version.',
        'Owen: For the report, I wanted a table of total times. It might be more useful to draw a diagram showing the places where people hesitate. We can keep the times in our notes if we need them.',
        'Narrator: Now look at questions six to ten.',
        'Tutor: Good. Next, decide what to point out without giving away the route. Which landmark can visitors use to start?',
        'Iris: I thought of the café, but it’s closed during the trial. The coloured mosaic by the door is visible from the courtyard, so let’s use that. We can ask visitors to start there.',
        'Tutor: Suppose somebody asks you for help halfway through. What will you write down?',
        'Owen: I was going to time how long it takes to answer. But what might tell us more is the question itself. If they ask how to reach the lift and that word is missing from the map, we have a clue about what to change.',
        'Iris: Right. We should also check that our route can be used without stairs. I’d assumed the main lift goes to the gallery, but the building manager says you can only reach it using the lift near the studio. Can we test that route ourselves before we ask people to try it?',
        'Tutor: Yes. As for your results, one person might stop simply to greet a friend. Do not draw a conclusion about a place on the first observation alone. Start looking for spots where that hesitation is repeated by different visitors.',
        'Owen: And we should make it clear who used the maps. We were thinking of calling it a guide for every visitor, but our task only takes people to the upstairs gallery. I’ll name that destination in the title of the report, so people can see exactly what we tested.'
      ],
      items: [
        {
          group: {
            title: 'Questions 1–5',
            task: 'Who suggests each action? Choose the correct letter, A, B or C. You may use any letter more than once.',
            ru: 'Сопоставь действия с участниками разговора.',
            labels: 'letters',
            listTitle: 'Speakers',
            headings: [ 'Iris', 'Owen', 'Tutor' ]
          },
          kind: 'match',
          stem: 'Wait outside the building to watch participants arrive.',
          key: 0,
          ru: 'A, Iris. Сначала она думает о кассе, затем выбирает двор, чтобы видеть входящих.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'Mark where a person first stops and looks for the route.',
          key: 1,
          ru: 'B, Owen. Вместо вопроса о вкусе он предлагает отметить место остановки.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'Ask about earlier visits before issuing a map.',
          key: 2,
          ru: 'C, Tutor. Его условие — выяснить, первый ли это визит.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'Let each person try only one format.',
          key: 0,
          ru: 'A, Iris. Она поправляет идею двух форматов: при второй попытке маршрут уже знаком.',
          chk: 2
        },
        {
          kind: 'match',
          stem: 'Show problem spots in a drawing in the report.',
          key: 1,
          ru: 'B, Owen. От таблицы времени он переходит к рисунку с местами заминки.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'Which starting landmark do the group settle on?',
          opts: [ 'the café', 'the ticket desk', 'the mosaic' ],
          key: 2,
          ru: 'C. Кафе закрыто. Iris выбирает мозаику у двери, которую видно со двора.',
          group: {
            title: 'Questions 6–10',
            task: 'Choose the correct letter, A, B or C.',
            ru: 'Вопросы идут по ходу записи. Учитывай варианты, которые говорящие затем отклоняют.'
          },
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What will Owen note if someone asks for help?',
          opts: [ 'the words of the question', 'the time it takes to answer', 'the colour of the map' ],
          key: 0,
          ru: 'A. После But what might tell us more он предлагает записать сам вопрос. Время звучит до поправки.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'Which route does Iris want the group to test?',
          opts: [
            'the stairs beside the gallery',
            'the route using the lift near the studio',
            'the route using the main lift'
          ],
          key: 1,
          ru: 'B. Управляющий уточняет, что к галерее ведёт только лифт у студии. C — исходное предположение Iris.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What should count as evidence of a confusing point?',
          opts: [
            'Any one person stopping there.',
            'The researchers taking a long time to walk there.',
            'Several different visitors hesitating there.'
          ],
          key: 2,
          ru: 'C. Tutor просит дождаться повторения у разных посетителей. Один человек мог встретить знакомого.',
          chk: 2
        },
        {
          kind: 'mcq',
          stem: 'What detail will the report title give?',
          opts: [
            'the destination used in the trial',
            'the number of visitors expected',
            'the name of each researcher'
          ],
          key: 0,
          ru: 'A. Owen ограничивает заголовок верхней галереей — той точкой, которую проверяли. B и C не названы.',
          chk: 2
        }
      ]
    },
    {
      type: 'speaking',
      id: 'speak',
      label: 'IELTS-style · Speaking Part 2',
      title: 'Explain which detail you would keep',
      ru: 'Запиши рассказ о путеводителе или карте. Назови решение, которому помогает одна деталь, и объясни, какую информацию можно вынести отдельно.',
      prompts: [
        'Describe a map, sign or guide that helped you find your way.',
        'You should say: where you used it',
        'which detail helped most',
        'what information you would change',
        'and explain why that change would help the next visitor.'
      ],
      prep: 60,
      talk: 120,
      pron: {
        title: 'Mark the change of direction',
        ru: 'Выдели ориентир и сделай паузу перед новым выводом.',
        items: [
          'At the MOsaic | turn left.',
          'The NEXT step is clear.',
          'My main conSTRAINT was the screen.',
          'I would reVISE the entrance label.'
        ]
      },
      model: 'I once used a diagram at a workshop centre. It helped me orient myself because the entrance had a recognisable floor pattern, and the drawing showed it next to the start of the route. The sequence after that point was easy to interpret. However, the guide tried to show every room on one screen, and I would revise that choice. The main diagram could prioritise the next turn, while a separate panel could show rooms off the main route. That change might transfer to other buildings with the same screen constraint, but I would test it first.'
    },
    {
      type: 'writing',
      id: 'write',
      label: 'Personal review',
      title: 'Map two errors and your next checks',
      ru: 'Возьми две разные ошибки из своих попыток. Опиши выбранный ответ, пропущенный признак и способ проверить себя в новом примере. Подойдут также ошибки в собственной записи или эссе.',
      prompts: [
        'Choose one reading or SAT decision and one listening or speaking decision to review.',
        'For each, write the cue you missed and one test you can repeat with new material.'
      ],
      minWords: 65,
      checklist: [
        'Я взял(а) два конкретных случая.',
        'В каждом назван признак, который меняет ответ.',
        'Для новой попытки есть проверка с понятным результатом.'
      ],
      model: [
        'On a map question I took the first entrance mentioned as the final answer. I will listen to the sentence after “actually” and check which location the speaker keeps. In the reading, I chose a broad statement although the report named only one room. I will underline the place and conditions before choosing an inference. A second practice passage will tell me whether that check is a reliable habit.'
      ]
    },
    {
      type: 'questions',
      id: 'exit',
      label: 'Exit check',
      title: 'Make the next check specific',
      ru: 'Выбери проверку, которая относится к названной ошибке.',
      items: [
        {
          kind: 'mcq',
          text: 'A student chose a word that appeared near a gap but failed to notice the printed noun immediately after the gap.',
          stem: 'Which check is most relevant on a new item?',
          opts: [
            'Read the completed sentence to see if the inserted word fits the printed noun.',
            'Choose the longest answer that fits the limit.',
            'Skip the sentence and read only the answer word.',
            'Type both the answer and the printed noun.'
          ],
          key: 0,
          ru: 'A. Пропуск проверяется вместе с окружающими словами. B и C игнорируют конструкцию, D может повторить уже напечатанное слово.',
          skill: 'R-GAP',
          chk: 2
        },
        {
          kind: 'mcq',
          text: 'A student took the first proposed location, then missed the speaker’s change of plan.',
          stem: 'Which check would address that error?',
          opts: [
            'Ignore all place names until the end.',
            'Assume the first place is always wrong.',
            'Listen for a correction and keep the location the speaker finally confirms.',
            'Replace the place with the one that sounds familiar.'
          ],
          key: 2,
          ru: 'C. После сигнала уточнения проверь, какой вариант подтверждён. A и B вводят правило без опоры на запись, D опирается на знакомость слова.',
          skill: 'LIS',
          chk: 2
        }
      ]
    }
  ],
  handoff: { text: 'Take the final check, then carry two useful checks into a new set of questions.', next: 'KF' }
};
