// «Доска» (2026-11-16): a drawing board for the lesson account, used beside a question in «Ошибки класса» (lsmist.js) and over
// a slide in the presentation viewer (classroom.js). Pointer events, so a pen tablet draws with pressure; once a pen is used,
// touches are ignored (a palm on the tablet). 4 colours, 3 widths, eraser (also the pen's eraser end), undo / redo, clear.
// Strokes are kept per key (one board per question or slide) while the page is open; nothing is saved.
// LSBOARD.create(host, { clear: true }) → { show(key), fit(), undo(), redo(), wipe(), count(key) }; clear: no dot grid (over a slide).
(function () {
  "use strict";
  if (window.LSBOARD) return;
  const css = `
.lb{display:flex;flex-direction:column;min-height:0;height:100%}
.lb-tools{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 10px;border-bottom:1px solid var(--studio,#D9D5CD);background:#fff}
.lb-tools button{font:500 14px var(--sans);border:1.5px solid var(--studio,#D9D5CD);background:#fff;border-radius:var(--control-radius);padding:7px 12px;cursor:pointer;color:#0F0F0F}
.lb-tools button[aria-pressed="true"]{border-color:var(--ink,#0F0F0F);box-shadow:inset 0 0 0 1px var(--ink,#0F0F0F)}
.lb-tools .lb-col{width:30px;height:30px;padding:0;border-radius:var(--control-radius);background:var(--c)}.lb-tools .lb-col[aria-pressed="true"]{box-shadow:0 0 0 2px #fff inset,0 0 0 2px var(--ink,#0F0F0F)}
.lb-tools .lb-sz{width:36px;height:30px;padding:0;display:inline-grid;place-items:center}.lb-tools .lb-sz i{display:block;width:18px;background:#0F0F0F;border-radius:4px}
.lb-sep{width:1px;height:22px;background:var(--studio,#D9D5CD);margin:0 2px}
.lb-c{flex:1;min-height:0;position:relative;background:#fff radial-gradient(circle,#D9D5CD 1px,transparent 1.3px) 0 0/24px 24px;touch-action:none;user-select:none;-webkit-user-select:none}
.lb.clear .lb-c{background:transparent}
.lb-c canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}
@media(max-width:700px){.lb-tools{padding:6px 8px;gap:4px}.lb-tools button{padding:5px 9px;font-size:13px}.lb-tools .lb-col{width:26px;height:26px}}`;
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: css }));
  const COLORS = [["#0F0F0F", "чёрный"], ["#A63328", "красный"], ["#1F4FA3", "синий"], ["#2B6E2F", "зелёный"]], SIZES = [[1.5, "тонкая"], [3, "средняя"], [6, "толстая"]];

  function create(host, opt) {
    const o = opt || {}, B = { cv: null, cx: null, key: "", color: COLORS[0][0], size: 3, er: false, live: null, pen: false, W: 1, H: 1 }, store = {};
    const data = (k) => store[k === undefined ? B.key : k] || (store[k === undefined ? B.key : k] = { s: [], r: [] });
    host.innerHTML = `<div class="lb${o.clear ? " clear" : ""}"><div class="lb-tools" role="toolbar" aria-label="Доска">${COLORS.map(([c, n], i) => `<button type="button" class="lb-col" data-lb="c" data-v="${c}" aria-label="Цвет: ${n}" aria-pressed="${i === 0}" style="--c:${c}"></button>`).join("")}<span class="lb-sep"></span>
      ${SIZES.map(([w, n]) => `<button type="button" class="lb-sz" data-lb="w" data-v="${w}" aria-label="Толщина: ${n}" aria-pressed="${w === B.size}"><i style="height:${Math.round(w * 1.4)}px"></i></button>`).join("")}<span class="lb-sep"></span>
      <button type="button" data-lb="er" aria-pressed="false">Ластик</button><button type="button" data-lb="undo">Отменить</button><button type="button" data-lb="redo">Вернуть</button><button type="button" data-lb="clear">Очистить</button>${o.extra || ""}</div>
      <div class="lb-c"><canvas aria-label="Доска для рисования пером, мышью или пальцем"></canvas></div></div>`;
    const root = host.querySelector(".lb"); B.cv = host.querySelector("canvas"); B.cx = B.cv.getContext("2d");
    root.querySelector(".lb-tools").addEventListener("click", (e) => {
      const b = e.target.closest("[data-lb]"); if (!b) return; const a = b.dataset.lb;
      if (a === "c") { B.color = b.dataset.v; B.er = false; } else if (a === "w") B.size = +b.dataset.v; else if (a === "er") B.er = !B.er;
      else if (a === "undo") undo(); else if (a === "redo") redo(); else if (a === "clear") wipe();
      root.querySelectorAll('[data-lb="c"]').forEach((x) => x.setAttribute("aria-pressed", String(!B.er && x.dataset.v === B.color)));
      root.querySelectorAll('[data-lb="w"]').forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.v === B.size)));
      root.querySelector('[data-lb="er"]').setAttribute("aria-pressed", String(B.er));
    });
    const cv = B.cv, pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / B.W, (e.clientY - r.top) / B.W, e.pointerType === "pen" ? e.pressure || 0.5 : 0.5]; };
    cv.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" && B.pen) return;   // a palm on the tablet screen while drawing with the pen
      if (e.pointerType === "pen") B.pen = true;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault(); cv.setPointerCapture(e.pointerId);
      B.live = { id: e.pointerId, c: B.color, w: B.size, er: B.er || e.button === 5 || (e.buttons & 32) === 32, p: [pt(e)] };
      seg(B.live, 0, true);
    });
    cv.addEventListener("pointermove", (e) => {
      const L = B.live; if (!L || e.pointerId !== L.id) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : []; for (const ev of evs.length ? evs : [e]) { L.p.push(pt(ev)); seg(L, L.p.length - 1); }
    });
    const end = (e) => { const L = B.live; if (!L || e.pointerId !== L.id) return; B.live = null; const d = data(); d.s.push(L); d.r = []; };
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    new ResizeObserver(fit).observe(root.querySelector(".lb-c"));
    function fit() {
      const r = cv.parentElement.getBoundingClientRect(); if (!r.width || !r.height) return;
      const k = window.devicePixelRatio || 1; B.W = r.width; B.H = r.height;
      cv.width = Math.round(r.width * k); cv.height = Math.round(r.height * k); B.cx.setTransform(k, 0, 0, k, 0, 0); draw();
    }
    // points are stored as a share of the board's width, so a drawing keeps its shape when the board grows («Во весь экран»)
    function seg(L, i, dot) {
      const c = B.cx, s = B.W / 700, a = L.p[Math.max(0, i - 1)], b = L.p[i], w = L.w * s * (0.35 + 1.3 * b[2]) * (L.er ? 6 : 1);
      c.save(); c.globalCompositeOperation = L.er ? "destination-out" : "source-over"; c.strokeStyle = c.fillStyle = L.c; c.lineCap = c.lineJoin = "round"; c.lineWidth = w;
      if (dot || i === 0) { c.beginPath(); c.arc(b[0] * B.W, b[1] * B.W, w / 2, 0, 2 * Math.PI); c.fill(); }
      else { c.beginPath(); c.moveTo(a[0] * B.W, a[1] * B.W); c.lineTo(b[0] * B.W, b[1] * B.W); c.stroke(); }
      c.restore();
    }
    function draw() { B.cx.clearRect(0, 0, B.W, B.H); for (const L of data().s) L.p.forEach((_, i) => seg(L, i, i === 0)); }
    function undo() { const d = data(); if (d.s.length) { d.r.push(d.s.pop()); draw(); } }
    function redo() { const d = data(); if (d.r.length) { d.s.push(d.r.pop()); draw(); } }
    function wipe() { const d = data(); if (d.s.length) { d.r = d.s.slice().reverse(); d.s = []; draw(); } }
    return { el: root, show(key) { B.key = String(key); B.live = null; draw(); }, fit, undo, redo, wipe, count: (k) => data(k).s.length };
  }
  window.LSBOARD = { create };
})();
