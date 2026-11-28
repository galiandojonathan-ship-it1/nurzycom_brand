/* Read an official public question by its catalog ID. No student record leaves the cabinet. */
window.BluebookQuestion = (() => {
  const bank = "https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/";
  const domains = { rw: "INI,CAS,EOI,SEC", math: "H,P,Q,S" };
  const idPattern = /^[0-9a-f]{8}$/i;
  const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
  const indexes = new Map();
  const questions = new Map();

  async function request(path, data) {
    const response = await fetch(bank + path, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      credentials: "omit", referrerPolicy: "no-referrer", signal: AbortSignal.timeout?.(12000)
    });
    if (!response.ok) throw new Error("College Board: " + response.status);
    return response.json();
  }

  const html = new Set("b br caption code div em figcaption figure h2 h3 h4 hr i img li ol p s small span strong sub sup table tbody td th thead tfoot tr u ul".split(" "));
  const math = new Set("math maction menclose mfenced mfrac mi mmultiscripts mn mo mover mpadded mphantom mroot mrow ms mspace msqrt mstyle msub msubsup msup mtable mtd mtext mtr munder munderover".split(" "));
  const dropped = new Set("annotation annotation-xml button embed form iframe link meta object script style template".split(" "));
  const mathAttrs = ["accent", "accentunder", "alttext", "bevelled", "columnalign", "columnlines", "display", "fence", "linethickness", "mathvariant", "rowalign", "rowlines", "separator", "stretchy"];

  const svg = new Set("svg g defs use title desc text tspan line rect circle ellipse path polygon polyline pattern clipPath marker linearGradient radialGradient stop".split(" "));
  const svgAttrs = "aria-label role viewBox width height x y x1 x2 y1 y2 cx cy r rx ry d points transform fill stroke stroke-width stroke-linecap stroke-linejoin stroke-dasharray fill-rule clip-rule opacity fill-opacity stroke-opacity text-anchor dominant-baseline font-family font-size font-weight font-style dx dy patternTransform patternUnits patternContentUnits clipPathUnits markerWidth markerHeight markerUnits orient refX refY offset stop-color stop-opacity gradientTransform gradientUnits fx fy preserveAspectRatio".split(" ");
  const svgRefs = ["fill", "stroke", "clip-path", "marker-start", "marker-mid", "marker-end"];
  const svgStyle = ["fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin",
    "fill-opacity", "stroke-opacity", "opacity", "text-anchor", "dominant-baseline", "font-family", "font-size", "font-style", "font-weight"];
  let diagram = 0;

  function markup(input) {
    const template = document.createElement("template");
    template.innerHTML = typeof input === "string" ? input : "";
    const inert = document.implementation.createHTMLDocument("");
    const prefix = `cb-figure-${++diagram}-`;
    function copy(node, parent) {
      if (node.nodeType === Node.TEXT_NODE) { parent.append(node.textContent); return; }
      if (node.nodeType !== Node.ELEMENT_NODE || dropped.has(node.localName)) return;
      const tag = node.localName;
      if (tag === "img") {
        const src = node.getAttribute("src") || "";
        try {
          const url = new URL(src);
          if (url.protocol !== "https:" || url.username || url.password) return;
          const img = inert.createElement("img");
          img.src = url.href; img.alt = node.getAttribute("alt") || "";
          img.referrerPolicy = "no-referrer"; img.loading = "lazy";
          parent.append(img);
        } catch { /* ignore an unsupported image URL */ }
        return;
      }
      const isMath = math.has(tag) && node.namespaceURI === "http://www.w3.org/1998/Math/MathML";
      const inSVG = node.namespaceURI === "http://www.w3.org/2000/svg";
      if (inSVG && !svg.has(tag)) return;
      const element = isMath || inSVG ? inert.createElementNS(node.namespaceURI, tag)
        : html.has(tag) ? inert.createElement(tag) : null;
      if (element) {
        const attrs = inSVG ? svgAttrs : isMath ? mathAttrs : ["colspan", "rowspan", "scope", "aria-label", "lang", "role"];
        for (const attr of attrs) {
          const value = node.getAttribute(attr);
          if (value == null || inSVG && svgRefs.includes(attr)) continue;
          element.setAttribute(attr, value);
        }
        if (inSVG) {
          // College Board SVGs use local glyph references and presentation styles for charts.
          if (tag === "use") {
            const href = node.getAttribute("href") || node.getAttribute("xlink:href");
            if (href && /^#[\w.-]+$/.test(href)) element.setAttribute("href", "#" + prefix + href.slice(1));
          }
          for (const attr of svgStyle) {
            const value = node.style.getPropertyValue(attr).trim();
            if (/^(?:[a-z0-9 .,%#-]+|rgba?\([\d.,% ]+\))$/i.test(value)) element.style.setProperty(attr, value);
          }
          const id = node.getAttribute("id");
          if (id && /^[\w.-]+$/.test(id)) element.id = prefix + id;
          for (const attr of svgRefs) {
            const value = node.getAttribute(attr) || "";
            const local = /^url\(#[\w.-]+\)$/.test(value);
            if (local) element.setAttribute(attr, value.replace("#", "#" + prefix));
            else if (/^(?:#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d.,% ]+\))$/i.test(value)) element.setAttribute(attr, value);
          }
        } else {
          if (/text-decoration(?:-line)?\s*:\s*underline/i.test(node.getAttribute("style") || "") ||
            node.classList.contains("underline")) element.style.textDecoration = "underline";
          if (node.classList.contains("sr-only")) element.className = "sr-only";
        }
        parent.append(element);
      }
      for (const child of node.childNodes) copy(child, element || parent);
    }
    // Build in an inert document so image requests start only once the preview is inserted.
    const container = inert.createElement("div");
    for (const child of template.content.childNodes) copy(child, container);
    return container.innerHTML;
  }

  async function lookup(sec, id) {
    if (!indexes.has(sec)) indexes.set(sec, request("get-questions", { asmtEventId: 99, test: sec === "math" ? 2 : 1, domain: domains[sec] })
      .then((rows) => new Map(rows.filter((r) => idPattern.test(r.questionId) && uuid.test(r.external_id)).map((r) => [r.questionId.toLowerCase(), r.external_id])))
      .catch((error) => { indexes.delete(sec); throw error; }));
    const external = (await indexes.get(sec)).get(id);
    if (!external) return null;
    return official(external);
  }

  async function official(external) {
    if (!uuid.test(external || "")) return null;
    const q = await request("get-question", { external_id: external });
    if (q.externalid !== external || typeof q.stem !== "string" || !q.stem.trim()) return null;
    const opts = q.type === "mcq" && Array.isArray(q.answerOptions) ? q.answerOptions.map((o) => markup(o.content)) : null;
    if (q.type === "mcq" && (opts?.length !== 4 || opts.some((o) => !o.trim()))) return null;
    const keys = Array.isArray(q.correct_answer) ? q.correct_answer.map(String) : [];
    return { stim: markup(q.stimulus), stem: markup(q.stem), opts, bankKeys: keys, rat: markup(q.rationale), originalSource: "bank" };
  }

  function load(sec, id) {
    if (!domains[sec] || !idPattern.test(id || "")) return Promise.resolve(null);
    id = id.toLowerCase();
    const key = sec + ":" + id;
    if (!questions.has(key)) questions.set(key, lookup(sec, id).catch((error) => { questions.delete(key); throw error; }));
    return questions.get(key);
  }
  // Shared reports contain answer letters or numbers. Show choices only when the source key agrees.
  async function review(sec, ref, linked) {
    const keys = (Array.isArray(ref.keys) ? ref.keys : []).filter((k) => typeof k === "string" && k.trim());
    const canon = (key) => window.parseSATNumericAnswer?.(key) || String(key).trim().toUpperCase();
    const matches = (item) => item && item.stem && item.acc?.length &&
      (!keys.length || keys.some((key) => item.acc.some((accepted) => canon(key) === canon(accepted))));
    const officialItem = await load(sec, ref.cid).catch(() => null);
    if (officialItem) {
      const { stim, stem, opts, bankKeys: acc, rat } = officialItem;
      const item = { t: opts ? "mc" : "spr", stim, stem, opts, acc, ans: acc[0], rat };
      if (matches(item)) return item;
    }
    if (linked && keys.length) {
      const original = await linked().catch(() => null);
      const acc = [].concat(original?.acc || original?.ans || []);
      if (matches(original && { ...original, acc })) return { ...original, acc };
    }
    return { metadataOnly: true, acc: keys };
  }
  return { load, official, review };
})();
