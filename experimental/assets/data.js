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
      shared: "Main idea and detail", sat: "Central Ideas and Details", ielts: "Reading: headings, True / False / Not Given", speak: "Part 2 · structure", write: "A topic sentence" },
    { id: "C08", code: "TSP", block: "B", status: "planned", title: "How a Report Persuades", thread: "Order is part of the message.",
      shared: "Structure and purpose", sat: "Text Structure and Purpose", ielts: "Reading: matching information · Task 2 paragraph", speak: "Part 2 · two full minutes", write: "One body paragraph" },
    { id: "C09", code: "INF", block: "C", status: "planned", title: "What the Data Does Not Say", thread: "The missing cases matter most.",
      shared: "Inference", sat: "Inferences", ielts: "Reading: Yes / No / Not Given, summary", speak: "Part 3 · explain a cause", write: "Claim + reason + example" },
    { id: "C10", code: "COET", block: "C", status: "planned", title: "The Doctor Nobody Believed", thread: "A claim needs support that others accept.",
      shared: "Claim and support", sat: "Command of Evidence (textual)", ielts: "Writing Task 2: Task Response", speak: "Part 3 · point + example", write: "Support one claim" },
    { id: "C11", code: "CTC", block: "C", status: "planned", title: "One Metre, Two Opinions", thread: "Standards help everyone and annoy someone.",
      shared: "Two points of view", sat: "Cross-Text Connections", ielts: "Task 2: discuss both views", speak: "Part 3 · compare views", write: "Introduction for a two-view essay" },
    { id: "C12", code: "LIS", block: "D", status: "live", title: "Follow the Voice", thread: "Back to the map: now you only hear it.",
      shared: "—", sat: "—", ielts: "Listening: directions on a map, predicting the answer type", speak: "Give directions aloud", write: "Notes from audio" },
    { id: "C13", code: "LIS", block: "D", status: "planned", title: "A Lecture on Time", thread: "Signposts tell you where the speaker is going.",
      shared: "—", sat: "—", ielts: "Listening: lectures and signposting", speak: "Part 2 · retell the lecture", write: "Summary in three sentences" },
    { id: "C14", code: "SPK", block: "D", status: "planned", title: "Say It Clearly", thread: "Stress and pauses are the punctuation of speech.",
      shared: "—", sat: "—", ielts: "Speaking: all three parts + pronunciation", speak: "Full recorded answer", write: "Self-review of the recording" },
    { id: "C15", code: "WRT", block: "D", status: "planned", title: "Building the Essay", thread: "Every brick from lessons 2–11, in one piece.",
      shared: "—", sat: "—", ielts: "Writing Task 2 from the bricks (inside the course only)", speak: "Part 3", write: "Timed essay" },
    { id: "C16", code: "MIX", block: "E", status: "planned", title: "Your Own Map", thread: "Draw the map of your errors. Decide what to leave out.",
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
        "Those responsible for the Underground's publicity did, at first, regard the design as too radical. Beck's proposal was turned down, and only after he submitted it a second time was a small trial edition printed in 1933. The response from passengers was immediate and overwhelmingly favourable, and much larger print runs soon followed. Beck went on revising the diagram for many years, and its essential principles survive in the version displayed in stations today, even though the network it represents has grown considerably.",
        "The approach has since been imitated by transport systems around the world, but its success has not been universal. In 1972, New York introduced a subway map in the same spirit, designed by Massimo Vignelli. Although it was admired by many designers, it was criticised by a large number of passengers, partly because it took liberties with the city's familiar geography: parks and streets did not appear in the shapes and positions that residents knew. By the end of the decade it had been replaced by a map that paid closer attention to the surface. The episode suggests that the appropriate degree of simplification depends on the readers. In a city whose street plan is widely known, a map that ignores it may be perceived less as a helpful abstraction than as a mistake.",
        "Even in London, the diagram's greatest strength is also its principal weakness. Because distances are deliberately distorted, two stations that appear far apart may be only a short walk from each other, while stations that seem close may be separated by a lengthy journey. Researchers who examined how passengers in London choose their routes found that many relied on the diagram even when a different route would have been quicker. In response, the transport authority has published supplementary maps showing walking times between nearby stations. These do not replace Beck's diagram; they simply restore some of the information it was designed to leave out. A map, in other words, can convey one kind of information clearly only by sacrificing another, and the most reliable maps are made by people who understand precisely what their readers can afford to lose."
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
        { kind: "gap", chk: 2, limit: 2, accept: ["diagram", "the diagram", "Beck's diagram"],
          stem: "A study of how passengers choose routes in London found that many trusted the ______ even when another route was faster.",
          ru: "G: «many relied on the diagram even when a different route would have been quicker». Relied on = trusted. Слово map в этом месте текста не стоит, поэтому ответ diagram." },
        { kind: "gap", chk: 2, limit: 2, accept: ["walking times"],
          stem: "As a result, the transport authority has produced additional maps that show ______ between stations that are close together.",
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

    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "Long sentences, clear parts",
      ru: "В тексте много сложных предложений: главная часть плюс придаточные с because, although, which, so that. Четыре утверждения TRUE / FALSE / NOT GIVEN и два вопроса с выбором. Когда предложение длинное, сначала найди главную часть: ту, что может стоять одна.",
      passageTitle: "The Line That Bends",
      passage: [
        "Because the Earth turns through fifteen degrees of longitude every hour, the world can be divided into twenty-four time zones, each one hour apart from its neighbours. In theory, the boundaries between adjacent zones are straight lines running from pole to pole. In practice they rarely are, since governments prefer a boundary that coincides with a national or regional border.",
        "The system needed a starting point, and any choice was bound to be arbitrary, because no meridian is marked by nature. In October 1884, delegates from twenty-five nations met in Washington to settle the question. They voted to adopt the meridian that passes through Greenwich, in London, which most ships' charts already used. France abstained from the vote and continued to set its clocks by Paris until 1911.",
        "On the opposite side of the globe lies the International Date Line, where each calendar day begins. Although it roughly follows the 180th meridian, it deviates from that line in several places so that island groups are not split between two dates. Unlike the prime meridian, the date line was never fixed by an international conference; it is only a convention, and individual states have moved it. At the start of 1995 Kiribati, whose islands span a wide stretch of the Pacific, shifted the line eastwards so that the whole country would share one day. Samoa made a similar change in 2011, when it skipped 30 December altogether in order to match the calendars of its main trading partners."
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
          text: "Harrison's fourth timekeeper performed remarkably on its trial voyage of 1761–62, losing only a few seconds over many weeks at sea. ______ the Board of Longitude hesitated to award the full prize, demanding further trials.",
          stem: "Which choice completes the text with the most logical transition?",
          opts: ["Accordingly,", "Nevertheless,", "In other words,", "Moreover,"], key: 1,
          ru: "Часы сработали отлично, но приз не дали: результат неожиданный, Nevertheless. Accordingly означало бы, что отказ логично следует из успеха. In other words вводит пересказ. Moreover добавляет довод в ту же сторону." }
      ] },

    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "Follow the links",
      ru: "В IELTS связки не спрашивают напрямую, но по ним видно, куда идёт мысль. Здесь четыре утверждения TRUE / FALSE / NOT GIVEN и два вопроса о том, как части текста связаны между собой.",
      passageTitle: "A Carpenter and the Longitude Prize",
      passage: [
        "In 1714 the British Parliament offered a reward of up to £20,000 to anyone who could find a practical way of determining longitude at sea. The problem was serious. Until it was solved, ships regularly lost their position, and voyages ended in delay or disaster.",
        "Most scholars expected the answer to come from astronomy. John Harrison, a carpenter who had taught himself clockmaking, believed otherwise. If a clock could keep the time of the home port accurately throughout a voyage, he reasoned, a navigator could compare it with local time and work out the ship's position. The difficulty was that no existing clock could do this: changes in temperature and the motion of the ship disturbed every mechanism then known.",
        "Harrison spent decades on the task, designing mechanisms that could compensate for heat, cold and the rolling of a ship. His first three machines were large and complex, whereas the fourth, completed in 1759, resembled an oversized pocket watch. On a voyage to Jamaica in 1761–62 it proved remarkably precise, losing only a few seconds. Nevertheless, the officials in charge of the prize were reluctant to accept that a mechanical device had succeeded where astronomy had not, and they demanded further tests. It was 1773, and Harrison was eighty years old, before the matter was finally settled."
      ],
      items: [
        { kind: "tfng", chk: 2, stem: "The reward was offered for a method of finding longitude that would work on ships.", key: "T",
          ru: "TRUE. «A practical way of determining longitude at sea» = способ, который работает на кораблях." },
        { kind: "tfng", chk: 2, stem: "Most scholars agreed with Harrison that a clock would solve the problem.", key: "F",
          ru: "FALSE. Учёные ждали ответа от астрономии, а Харрисон «believed otherwise». Otherwise показывает, что мнения расходились." },
        { kind: "tfng", chk: 2, stem: "Harrison's fourth timekeeper was bigger than his first three.", key: "F",
          ru: "FALSE. Первые три «large», whereas четвёртый похож на карманные часы. Whereas = противопоставление." },
        { kind: "tfng", chk: 2, stem: "Harrison himself sailed to Jamaica with his fourth timekeeper.", key: "NG",
          ru: "NOT GIVEN. Текст говорит только, что часы были в плавании на Ямайку. Кто их вёз и был ли на борту сам Харрисон, текст не сообщает." },
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
          stem: "Which sentence links the two ideas logically?",
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
          text: "While researching a topic, a student has taken the following notes:\n• Great Britain held its first national census in 1801.\n• Before then, estimates of the population varied widely.\n• Officials wanted reliable figures to plan food supplies and defence.\n• Since 1801, a census has been taken in Britain every ten years, except in 1941.",
          stem: "The student wants to explain why Great Britain carried out its first census. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          opts: ["Since 1801, Britain has taken a census every ten years, with the exception of 1941.", "Great Britain held its first national census in 1801.", "Great Britain's first census, held in 1801, was carried out because officials wanted reliable figures to plan food supplies and defence.", "Britain did not take a census in 1941."], key: 2,
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

    { type: "questions", id: "ielts", label: "IELTS-style · Task 1 data", title: "From a table to the main trend",
      ru: "В IELTS Writing Task 1 сначала нужно увидеть главное в таблице, а потом уже детали. Здесь таблица и короткий текст о ней. Данные выдуманные, город тоже. Ответь на шесть вопросов: True / False / Not Given проверяй по таблице и тексту вместе.",
      table: { caption: "Population of Marsh End by age group, 2000 and 2020 (fictional data)", head: ["Age group", "2000", "2020"],
        rows: [["0–17", "3,000", "3,300"], ["18–64", "7,800", "9,300"], ["65 and over", "1,200", "3,000"], ["Total", "12,000", "15,600"]] },
      passageTitle: "Marsh End in Two Counts",
      passage: [
        "Every twenty years, the council of Marsh End publishes a short summary of the town's census results. The summary is meant for residents who have no time to read the full tables, so it opens with a single overall statement before it turns to any particular figure.",
        "The table compares two counts. In 2000 the town comprised 12,000 residents; by 2020 the figure had risen to 15,600. Every age group grew, but not at the same pace. The working-age group, from 18 to 64, remained by far the largest in both years. The youngest group changed only slightly.",
        "The most significant change was at the top of the table. The number of residents aged 65 and over rose from 1,200 to 3,000, so older people now make up a much larger share of the town than before. The council's summary does not explain this change, and a careful reader should not try to explain it either: the table shows what happened, not why.",
        "For a student preparing for IELTS, the lesson is simple. An overview names the main trend and the most striking change. The individual numbers come later, and only the relevant ones."
      ],
      items: [
        { kind: "mcq", chk: 2, stem: "Which sentence is the best overview of the table?", key: 0,
          opts: ["Overall, the population of Marsh End grew, and the group aged 65 and over grew fastest.", "In 2000, there were 3,000 residents aged 0–17.", "Overall, the town became more popular because it is a pleasant place to live.", "Overall, every age group doubled in size."],
          ru: "Overview называет главное: население выросло, быстрее всех росла группа 65+. B — одна деталь. C объясняет причину, которой в таблице нет. D неверно: удвоилась (и даже больше) только группа 65+." },
        { kind: "tfng", chk: 2, stem: "The 18–64 group was the largest group in both 2000 and 2020.", key: "T",
          ru: "TRUE. 7,800 и 9,300 — самые большие числа в обоих годах. В тексте то же: «remained by far the largest in both years»." },
        { kind: "tfng", chk: 2, stem: "The number of residents aged 0–17 fell between 2000 and 2020.", key: "F",
          ru: "FALSE. 3,000 → 3,300: число выросло, хоть и немного. Текст: «changed only slightly» и «every age group grew»." },
        { kind: "tfng", chk: 2, stem: "Most of the new residents moved to Marsh End from the capital.", key: "NG",
          ru: "NOT GIVEN. Ни таблица, ни текст не говорят, откуда приехали люди. Текст даже предупреждает: таблица показывает «what happened, not why»." },
        { kind: "mcq", chk: 2, stem: "Which group grew by exactly 1,500 residents?", key: 1,
          opts: ["0–17", "18–64", "65 and over", "the total population"],
          ru: "9,300 − 7,800 = 1,500. Для сравнения: 0–17 выросла на 300, 65+ на 1,800, всё население на 3,600." },
        { kind: "mcq", chk: 2, stem: "According to the text, which of these does NOT belong in an overview?", key: 2,
          opts: ["the main trend", "the most striking change", "an explanation of why the change happened", "a general statement about the whole table"],
          ru: "Текст: overview называет «the main trend and the most striking change», а таблица не говорит «why». Значит, объяснение причин в overview не входит. A, B и D как раз и есть overview." }
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
      ru: "Напиши overview к таблице Marsh End: одно или два предложения. Только главная тенденция и самое заметное изменение. Без причин, без всех чисел подряд.",
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
      table: { caption: "Deaths from cholera per 10,000 houses in London, first seven weeks of the 1854 epidemic (John Snow's figures, rounded)", head: ["Houses supplied by", "Deaths per 10,000 houses"],
        rows: [["Southwark and Vauxhall Company", "315"], ["Lambeth Company", "37"], ["Rest of London", "59"]] },
      items: [
        { kind: "mcq", chk: 2,
          text: "In the 1850s, many doctors believed that cholera spread through bad air. John Snow suspected contaminated water instead, and he compared households that received their water from two different companies. The data support his suspicion: households supplied by the Southwark and Vauxhall Company recorded ______",
          stem: "Which choice most effectively uses data from the table to complete the statement?",
          opts: ["about 59 deaths per 10,000 houses, the figure for the rest of London.", "about 315 deaths per 10,000 houses, compared with about 37 for houses supplied by the Lambeth Company.", "fewer deaths per 10,000 houses than houses in the rest of London.", "about 37 deaths per 10,000 houses, more than any other group."], key: 1,
          ru: "Утверждение сравнивает две компании, значит нужны обе цифры: 315 и 37. Это B. A даёт цифру для остального Лондона, а не для Southwark and Vauxhall. C неверно: 315 больше, а не меньше, чем 59. D неверно: 37 — цифра Lambeth, и она самая маленькая." },
        { kind: "mcq", chk: 2,
          text: "Snow's figures also allow a three-way comparison. The death rate for the rest of London ______",
          stem: "Which choice most effectively uses data from the table to complete the statement?",
          opts: ["was higher than the rates for both water companies.", "was lower than the rates for both water companies.", "fell between the Lambeth rate of about 37 and the Southwark and Vauxhall rate of about 315.", "was about 315 deaths per 10,000 houses."], key: 2,
          ru: "59 больше 37 и меньше 315, то есть между ними: C. A неверно (59 < 315). B неверно (59 > 37). D приписывает остальному Лондону цифру Southwark and Vauxhall." },
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

    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "Comparisons that hold up",
      ru: "Текст о Джоне Сноу, затем шесть вопросов: четыре True / False / Not Given и два на язык сравнения, который нужен в Writing Task 1.",
      passageTitle: "A Map That Made an Argument",
      passage: [
        "In late August 1854, cholera broke out in Soho, in central London. Within days, hundreds of people living near Broad Street had died. Most doctors of the time believed that the disease was carried by foul air, but John Snow, a London physician, suspected a different source: water.",
        "Snow marked each death on a street map with a short black bar. The bars clustered around a single public water pump on Broad Street. He also noticed exceptions that fitted his idea. A nearby brewery, whose workers drank little or no water from the pump, recorded very few cases.",
        "Snow presented his evidence to the local authorities, who agreed to remove the handle of the pump. Snow himself later admitted that the outbreak was already declining by then, so the removal cannot alone explain its end.",
        "His strongest evidence came from a comparison. Two companies supplied water to comparable homes across south London, often to houses on the same street. One company drew its water from a part of the Thames contaminated by sewage; the other did not. Houses supplied by the first company suffered roughly eight times as many deaths per 10,000 houses as those supplied by the second. Many experts dismissed his conclusion for years, but the comparison is now seen as a landmark in the study of disease."
      ],
      items: [
        { kind: "tfng", chk: 2, stem: "Snow believed, like most doctors of his time, that cholera was carried by foul air.", key: "F",
          ru: "FALSE. Большинство врачей думали так, а Сноу «suspected a different source: water»." },
        { kind: "tfng", chk: 2, stem: "Snow recorded each death on a map.", key: "T",
          ru: "TRUE. «Snow marked each death on a street map with a short black bar». Marked on a map = recorded on a map." },
        { kind: "tfng", chk: 2, stem: "Removing the pump handle ended the outbreak immediately.", key: "F",
          ru: "FALSE. Сноу сам признал, что вспышка «was already declining», и снятие ручки не объясняет её конец одно." },
        { kind: "tfng", chk: 2, stem: "The local authorities paid Snow for his investigation.", key: "NG",
          ru: "NOT GIVEN. Власти согласились снять ручку, но о деньгах в тексте нет ни слова." },
        { kind: "mcq", chk: 2, stem: "Which sentence correctly describes the comparison in the final paragraph?", key: 2,
          opts: ["Houses supplied by the first company had about twice as many deaths.", "Houses supplied by the two companies had a similar number of deaths.", "Houses supplied by the first company had about eight times as many deaths per 10,000 houses.", "Houses supplied by the second company had more deaths."],
          ru: "Текст: «roughly eight times as many deaths per 10,000 houses». About = roughly. Twice, similar и «у второй больше» противоречат тексту." },
        { kind: "mcq", chk: 2, stem: "Which comparison is grammatically correct?", key: 1,
          opts: ["The death rate was more higher than in other districts.", "The death rate was much higher than in other districts.", "The death rate was the most high than in other districts.", "The death rate was higher as in other districts."],
          ru: "Much усиливает сравнительную степень: much higher than. «More higher» — двойная сравнительная степень. «The most high than» смешивает превосходную степень и than. «Higher as» — после сравнительной степени нужно than, а не as." }
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
      checklist: ["В первом предложении есть обе компании и обе цифры.", "Во втором предложении есть остальной Лондон.", "Я использовал(а) than после сравнительной степени.", "Я не объяснял(а) причины.", "Число и слово рядом совпадают: 315 — about eight times 37."],
      model: [
        "Houses supplied by the Southwark and Vauxhall Company recorded about 315 deaths per 10,000 houses, roughly eight times as many as houses supplied by the Lambeth Company, at about 37.",
        "The figure for the rest of London, about 59, was substantially lower than the Southwark and Vauxhall rate but higher than the Lambeth rate."
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
          text: "Houses supplied by the Lambeth Company had about 37 deaths per 10,000 houses, compared with about 59 in the rest of London.",
          stem: "The Lambeth figure was higher than the figure for the rest of London.", key: "F",
          ru: "FALSE. 37 меньше 59." }
      ] }
  ],
  handoff: { text: "Snow's marks on a map became an argument. Next, Florence Nightingale turns a war's records into a single diagram.", next: "C07" }
};

/* ------------------------------------------------------------------ */
window.LESSONS.C07 = {
  id: "C07",
  title: "The Diagram That Changed a Hospital",
  thread: "One picture carried the main idea.",
  intro: "Сегодня главная мысль и детали. На SAT это Central Ideas and Details: найти мысль, которая покрывает весь текст, и отличить её от отдельного факта. В IELTS Reading тот же навык нужен, чтобы выбрать заголовок для абзаца и ответить True / False / Not Given. В прошлом уроке карта Джона Сноу с чёрточками смертей стала доказательством. Сегодня одна диаграмма несёт главную мысль целого отчёта: Флоренс Найтингейл показывает, от чего на самом деле умирали солдаты.",
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
          text: "Nightingale's best-known diagram is built from circles, each divided into twelve wedges, one for each month. The area of a wedge, measured from the centre, shows how many soldiers died in that month. Each wedge carries three colours: blue for deaths from preventable disease, red for deaths from wounds, and black for deaths from all other causes. In the months of heaviest loss, the blue area is far larger than the other two.",
          stem: "According to the text, what does the diagram show about the months in which the most soldiers died?",
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

    { type: "questions", id: "ielts", label: "IELTS-style · Reading", title: "Headings and True / False / Not Given",
      ru: "Тот же навык в формате IELTS. Заголовок абзаца называет его главную мысль, а не одну деталь из него. В утверждениях TRUE / FALSE / NOT GIVEN проверяется деталь: найди место в тексте. Если такого места нет, ответ NOT GIVEN, даже если утверждение похоже на правду.",
      passageTitle: "A Picture of Preventable Deaths",
      passage: [
        "When Florence Nightingale arrived at the British army hospital at Scutari in November 1854, she found wards that were overcrowded, short of supplies and built above blocked sewers. During her first winter there, thousands of patients died. Most of them had not been killed by their wounds. They died of typhus, cholera and other diseases that spread in such conditions.",
        "After the war ended in 1856, Nightingale was determined that the lesson should not be lost. Working with the statistician William Farr, she compiled the army's monthly records of mortality. The records attributed each death to a cause, and she sorted the causes into three groups: preventable disease, wounds, and everything else. The result was striking. In the worst months, disease accounted for a far greater proportion of deaths than battle did.",
        "Nightingale doubted that officials would read long tables, so she turned the numbers into a diagram. Each of its circles was divided into twelve wedges, one for each month, and every wedge was coloured to show the three causes. The larger the coloured area, the more soldiers had died. The blue areas, which stood for preventable disease, dominated the page.",
        "The diagram was published in 1858, and copies were sent to politicians and officers. It helped to persuade the government that poor sanitation had cost more lives than the enemy had. Reform followed: army barracks and hospitals were given better drains, cleaner water and more fresh air. Nightingale is remembered as a nurse, yet she owed much of her influence to her skill with statistics."
      ],
      items: [
        { kind: "tfng", chk: 2, stem: "When Nightingale arrived, the hospital at Scutari held more patients than it had room for.", key: "T",
          ru: "TRUE. В тексте палаты «overcrowded», то есть переполнены: больных больше, чем места." },
        { kind: "tfng", chk: 2, stem: "Most of the patients who died in the first winter were killed by injuries from battle.", key: "F",
          ru: "FALSE. Текст говорит обратное: «Most of them had not been killed by their wounds». Они умерли от болезней." },
        { kind: "tfng", chk: 2, stem: "Nightingale had studied mathematics before she went to Scutari.", key: "NG",
          ru: "NOT GIVEN. В конце сказано о её «skill with statistics», но где и когда она этому училась, текст не сообщает. Утверждение похоже на правду, но в тексте его нет." },
        { kind: "tfng", chk: 2, stem: "Nightingale thought it unlikely that officials would read detailed tables.", key: "T",
          ru: "TRUE. «Doubted that officials would read long tables» = считала маловероятным, что чиновники станут читать подробные таблицы." },
        { kind: "mcq", chk: 2, stem: "Which heading best fits the second paragraph?", key: 2,
          opts: ["Conditions in a wartime hospital", "A new way of showing numbers", "Sorting the deaths by cause", "The government's response"],
          ru: "Второй абзац о работе с записями: каждая смерть отнесена к причине, причины разделены на три группы, виден результат. Это «Sorting the deaths by cause». Условия в госпитале описаны в первом абзаце. Диаграмма появляется только в третьем. Реакция правительства в четвёртом." },
        { kind: "mcq", chk: 2, stem: "Which heading best fits the final paragraph?", key: 0,
          opts: ["What the diagram achieved", "Why officials ignored the figures", "Nightingale's training as a nurse", "Twelve wedges and three colours"],
          ru: "Последний абзац о последствиях: диаграмму разослали, правительство удалось убедить, началась реформа. Это «What the diagram achieved». Чиновники цифры не проигнорировали, а приняли (B неверно). Об обучении на медсестру (C) текст не говорит. Клинья и цвета (D) описаны в третьем абзаце." }
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
          text: "The larger the coloured area, the more soldiers had died. The blue areas, which stood for preventable disease, dominated the page; the red areas, which stood for wounds, were far smaller.",
          stem: "The largest areas on the diagram showed deaths from wounds.", key: "F",
          ru: "FALSE. На странице преобладали синие области, а они обозначают preventable disease. Раны показаны красным, и красные области «far smaller»." }
      ] }
  ],
  handoff: { text: "One diagram carried the main idea. Next, the report around it: how the order of its parts persuades.", next: "C08" }
};

/* ------------------------------------------------------------------ */
/* IELTS-only lesson: no `sat` and no `ielts` part. The `listen` part is read aloud by the browser's speech synthesis.
   Larkmoor College and everything on it are invented for this lesson. */
window.LESSONS.C12 = {
  id: "C12",
  title: "Follow the Voice",
  thread: "Back to the map: now you only hear it.",
  intro: "Этот урок только для IELTS: Listening. В первом уроке ты читал(а) карту, которая намеренно пропускает лишнее. Сегодня карты перед глазами нет: её нужно построить в голове по голосу. Два навыка: следить за маршрутом по словам направления и заранее угадывать, какого типа будет ответ (место, число, время или направление).",
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
    { type: "questions", id: "listen", label: "IELTS-style · Listening", title: "Directions on a map you cannot see",
      ru: "Сначала прочитай все шесть вопросов и реши, что нужно услышать в каждом: место, направление или время. Потом включи запись и отвечай по ходу. Постарайся справиться с одного прослушивания. Текст записи открой только после ответов. Вопросы 4–6 в формате TRUE / FALSE / NOT GIVEN — тренировка внимания к деталям: в настоящем IELTS такие задания бывают в Reading, а не в Listening.",
      rule: [
        "До записи: по вопросу определи тип ответа. Where = место, What should you do = действие или направление, время и числа видны по словам opens, minutes, metres.",
        "Во время записи: держи в голове точку, где ты стоишь, и лицом куда. Left и right считаются от направления движения.",
        "Слова-повороты instead, but now, used to be меняют ответ. То, что прозвучало первым, часто оказывается ловушкой.",
        "NOT GIVEN: говорящий упомянул тему, но именно этого факта не сказал."
      ],
      audio: [
        "Welcome to Larkmoor College.",
        "I'm Dana, one of the student guides, and I'll show you how to find the main places on campus.",
        "We're standing at the main entrance, on the south side, next to the car park.",
        "Walk straight ahead along the central path for approximately two hundred metres, until you reach a junction with a clock tower.",
        "The clock tower is the best landmark on campus, because you can see it from almost anywhere.",
        "At the junction, turn left, and the library is the second building on your right, opposite the lake.",
        "The first building, adjacent to the library, is the student office, where you collect your student card.",
        "If you turn right at the clock tower instead, the path takes you past the canteen to the science block.",
        "The canteen opens at half past seven, and the science block is just beyond it, at the end of the path.",
        "The sports hall isn't on this route.",
        "To get there, go back to the main entrance and follow the fence east for about five minutes.",
        "Finally, the bus stop has moved.",
        "It used to be outside the main entrance, but now it's behind the library, on Mill Road."
      ],
      items: [
        { kind: "mcq", chk: 2, stem: "Where is the speaker standing while she gives the directions?", key: 1,
          opts: ["at the clock tower", "at the main entrance", "outside the library", "at the bus stop"],
          ru: "Dana говорит: «We're standing at the main entrance». Башня с часами, библиотека и остановка названы позже как места, куда нужно идти, а не как место, где она стоит." },
        { kind: "mcq", chk: 2, stem: "What should you do at the clock tower to reach the library?", key: 0,
          opts: ["turn left", "turn right", "go straight ahead", "go back to the entrance"],
          ru: "«At the junction, turn left, and the library is the second building on your right.» Ловушка в слове right: оно звучит в том же предложении, но относится к стороне, на которой стоит здание, а не к повороту. Направо у башни идут к столовой и научному корпусу. Вернуться ко входу нужно для спортзала." },
        { kind: "mcq", chk: 2, stem: "Which building is next to the library?", key: 3,
          opts: ["the canteen", "the science block", "the sports hall", "the student office"],
          ru: "«The first building, adjacent to the library, is the student office.» Adjacent to = next to. Столовая и научный корпус стоят на другой дорожке, направо от башни. Спортзал вообще не на этом маршруте." },
        { kind: "tfng", chk: 2, stem: "The library is the first building on the right after you turn left at the junction.", key: "F",
          ru: "FALSE. Библиотека «the second building on your right». Первое здание занимает student office." },
        { kind: "tfng", chk: 2, stem: "On the way from the clock tower to the science block, you walk past the canteen.", key: "T",
          ru: "TRUE. «The path takes you past the canteen to the science block», и научный корпус «just beyond it», то есть сразу за столовой." },
        { kind: "tfng", chk: 2, stem: "The canteen closes at four o'clock in the afternoon.", key: "NG",
          ru: "NOT GIVEN. О столовой Dana называет только время открытия: «opens at half past seven». Когда столовая закрывается, она не говорит, поэтому утверждение нельзя ни подтвердить, ни опровергнуть." }
      ],
      transcript: [
        "Welcome to Larkmoor College. I'm Dana, one of the student guides, and I'll show you how to find the main places on campus. We're standing at the main entrance, on the south side, next to the car park.",
        "Walk straight ahead along the central path for approximately two hundred metres, until you reach a junction with a clock tower. The clock tower is the best landmark on campus, because you can see it from almost anywhere.",
        "At the junction, turn left, and the library is the second building on your right, opposite the lake. The first building, adjacent to the library, is the student office, where you collect your student card.",
        "If you turn right at the clock tower instead, the path takes you past the canteen to the science block. The canteen opens at half past seven, and the science block is just beyond it, at the end of the path.",
        "The sports hall isn't on this route. To get there, go back to the main entrance and follow the fence east for about five minutes.",
        "Finally, the bus stop has moved. It used to be outside the main entrance, but now it's behind the library, on Mill Road."
      ] },

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
      ru: "Два вопроса без записи: один на тип ответа, один на слово-поворот.",
      items: [
        { kind: "mcq", chk: 2,
          text: "Before the recording starts, you read this note: “The walk from the main entrance to the sports hall takes about ______ minutes.”",
          stem: "What kind of answer should you listen for?", key: 2,
          opts: ["a name", "a direction", "a number", "a building"],
          ru: "После пропуска стоит «minutes», перед ним «about»: нужно число. Имя, направление и здание в эту фразу грамматически не встают. Тип ответа виден ещё до записи, и слушать становится легче." },
        { kind: "mcq", chk: 2,
          text: "“Finally, the bus stop has moved. It used to be outside the main entrance, but now it's behind the library, on Mill Road.”",
          stem: "Where is the bus stop now?", key: 1,
          opts: ["outside the main entrance", "behind the library", "opposite the lake", "next to the car park"],
          ru: "«But now it's behind the library». Вариант «outside the main entrance» звучит первым, но перед ним стоит «used to be»: так было раньше. Озеро и парковка в этих двух предложениях не упоминаются." }
      ] }
  ],
  handoff: { text: "You followed one voice across a map. Next, a longer voice: a lecture on time, and the signposts that tell you where the speaker is going.", next: "C13" }
};
