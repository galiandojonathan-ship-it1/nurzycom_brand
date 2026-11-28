/* College Board question references for the November practice series. */
window.OfficialPractice = (() => {
  const ids = ["PT20", "PT21", "PT22"];
  const title = (id) => `Ноябрь 2026 · Тест ${ids.indexOf(id) + 1}`;
  const hasBundle = (path) => /^public:PT2[0-2]\.(rw|math)$/.test(path);
  const hasItem = (path) => /^public:item:[a-f0-9]{8}$/.test(path);
  let manifest;
  const items = new Map(), bundles = new Map();
  let active = 0;
  const pending = [];
  function next() {
    if (active >= 8 || !pending.length) return;
    active++;
    const { fn, resolve, reject } = pending.shift();
    fn().then(resolve, reject).finally(() => { active--; next(); });
  }
  function data() {
    if (!manifest) manifest = fetch("data/november-2026.json", { cache: "no-cache" }).then((response) => {
      if (!response.ok) throw Error("Каталог вопросов недоступен.");
      return response.json();
    }).catch((error) => { manifest = null; throw error; });
    return manifest;
  }
  function metadata(catalog, id) {
    const [uuid, dom, skill, d, t] = catalog.questions[id] || [];
    if (!uuid) return null;
    return { id, uuid, dom, d, t, sk: catalog.skills[skill], sec: ["INI", "CAS", "EOI", "SEC"].includes(dom) ? "rw" : "math" };
  }
  async function question(id) {
    const meta = metadata(await data(), id);
    if (!meta) throw Error("Вопрос отсутствует в каталоге.");
    if (!items.has(id)) {
      const load = async () => {
        const q = await BluebookQuestion.official(meta.uuid);
        const acc = meta.t === "mc" ? q?.bankKeys : q?.bankKeys.map(window.parseSATNumericAnswer);
        if (!q || !acc?.length || acc.some((key) => !key) ||
          (meta.t === "mc" && (q.opts?.length !== 4 || acc.length !== 1 || !/^[A-D]$/.test(acc[0]))) ||
          (meta.t === "spr" && q.opts)) throw Error("Вопрос недоступен в банке College Board.");
        return { id, t: meta.t, sk: meta.sk, d: meta.d, dom: meta.dom, own: false,
          stim: q.stim, stem: q.stem, opts: q.opts || [], ans: q.bankKeys.join("; "), acc, rat: q.rat };
      };
      items.set(id, new Promise((resolve, reject) => {
        pending.push({ fn: load, resolve, reject });
        next();
      }).catch((error) => { items.delete(id); throw error; }));
    }
    return items.get(id);
  }
  async function loadBundle(path) {
    const catalog = await data(), modules = catalog.modules[path.slice(7)];
    if (!modules) throw Error("Модуль отсутствует в каталоге.");
    const entries = await Promise.all(Object.entries(modules).map(async ([mod, ids]) =>
      [mod, await Promise.all(ids.map(async (id, i) => ({ ...await question(id), n: i + 1 })))]));
    return { mods: Object.fromEntries(entries) };
  }
  function bundle(path) {
    if (!hasBundle(path)) return Promise.reject(Error("Неверный код пробного теста."));
    if (!bundles.has(path)) bundles.set(path, loadBundle(path).catch((error) => { bundles.delete(path); throw error; }));
    return bundles.get(path);
  }
  async function index(base) {
    try {
      const catalog = await data();
      const mocks = ids.map((id) => ({ id, title: title(id), group: "november", fixed: true, sections: [
        { k: "rw", name: "Reading and Writing", b: `public:${id}.rw`, n: catalog.modules[id + ".rw"].m1.length, min: 32, fixed: true },
        { k: "math", name: "Math", b: `public:${id}.math`, n: catalog.modules[id + ".math"].m1.length, min: 35, fixed: true }
      ] }));
      return { ...base, mocks: [...(base?.mocks || []), ...mocks] };
    } catch {
      if (base) return base;
      throw Error("Каталог тестов недоступен.");
    }
  }
  async function reserve() {
    const catalog = await data();
    return catalog.reserve.map((id) => metadata(catalog, id));
  }
  return { ids, title, hasBundle, hasItem, index, bundle, reserve, question };
})();
