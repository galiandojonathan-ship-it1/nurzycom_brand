// Launch an existing question set as a shared round. Only the teacher browser sends grading keys.
(function () {
  "use strict";
  const isLesson = () => /^lesson(?:-[a-z0-9]+)?$/.test(SITE.me());
  async function bundle(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw Error("Не удалось загрузить вопросы.");
    return JSON.parse(new TextDecoder().decode(await SITE.open(await response.arrayBuffer())));
  }
  function workbook(items) {
    return items.slice(0, 10).map((q) => ({
      prompt: (q.stim || "") + q.stem,
      options: q.t === "mc" ? q.opts : [],
      type: q.t === "mc" ? "mc" : "spr",
      accepted: q.t === "mc" ? [q.ans] : [].concat(q.acc || q.ans).map(String)
    }));
  }
  async function create(set) {
    if (!set?.questions?.length) throw Error("Сначала выберите набор вопросов.");
    const questions = set.questions.slice(0, 10);
    const encrypted = await SITE.sealBlob(questions.map(({ prompt, options, type }) => ({ prompt, options, type })));
    const result = await SITE.api("live?action=create", {
      method: "POST",
      body: JSON.stringify({
        title: set.title.slice(0, 160), set: "sealed:" + encrypted,
        keys: questions.map(({ type, accepted }) => ({ type, accepted }))
      })
    });
    if (!result.ok) throw Error(result.data?.error || "Не удалось создать раунд.");
    sessionStorage.setItem("live:" + result.data.round, JSON.stringify({ host: result.data.host }));
    location.href = "practice.html?live=" + result.data.round;
  }
  function mount(anchor, selection) {
    if (!isLesson()) return;
    const target = document.getElementById(anchor);
    if (!target || document.getElementById("live-" + anchor)) return;
    const button = document.createElement("button");
    button.id = "live-" + anchor;
    button.type = "button";
    button.className = "btn";
    button.textContent = "Живая практика · до 10 × 45 с";
    const status = document.createElement("p");
    status.className = "hint";
    status.setAttribute("role", "status");
    button.onclick = async () => {
      button.disabled = true;
      status.textContent = "Готовлю вопросы…";
      try { await create(await selection()); }
      catch (error) { status.textContent = error.message; button.disabled = false; }
    };
    target.after(button, status);
  }
  window.LiveRound = { bundle, workbook, mount, create };
})();
