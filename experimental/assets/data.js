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
    { id: "C02", block: "A", status: "planned", title: "Where One Zone Ends", thread: "A line on the map decides what time it is.",
      shared: "Sentence boundaries", sat: "Boundaries", ielts: "Writing GRA: complex sentences", speak: "Part 1 · answer + reason", write: "Combine four short sentences" },
    { id: "C03", block: "A", status: "planned", title: "Railway Time", thread: "Trains forced towns to agree on one clock.",
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
