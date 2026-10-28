// Bluebook tools for Math: the Desmos graphing calculator (College Board edition, as in Bluebook) and the reference sheet.
// BBTools.mount(el) puts the two buttons into el; BBTools.show(on) shows or hides them for the current question set.
(function () {
  "use strict";
  const DESMOS = "https://www.desmos.com/testing/cb-digital-sat/graphing";
  let calc = null, ref = null, bar = null;

  function calculator() {
    if (calc) return calc;
    calc = document.createElement("div"); calc.className = "bb-calc hidden"; calc.setAttribute("role", "dialog"); calc.setAttribute("aria-label", "Калькулятор Desmos");
    calc.innerHTML = `<div class="bb-calc-h"><span class="label">Калькулятор · Desmos</span><span class="bb-calc-b"><button type="button" class="bb-wide" title="Шире">⇔</button><button type="button" class="bb-x" title="Закрыть">×</button></span></div>
      <iframe title="Графический калькулятор Desmos" src="about:blank" allow="clipboard-write"></iframe>`;
    document.body.appendChild(calc);
    calc.querySelector(".bb-x").onclick = () => toggleCalc(false);
    calc.querySelector(".bb-wide").onclick = () => calc.classList.toggle("wide");
    // drag by the header (desktop)
    const h = calc.querySelector(".bb-calc-h"); let sx, sy, ox, oy;
    h.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button") || matchMedia("(max-width:760px)").matches) return;
      const r = calc.getBoundingClientRect(); sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; h.setPointerCapture(e.pointerId);
      calc.classList.add("drag");
    });
    h.addEventListener("pointermove", (e) => { if (!calc.classList.contains("drag")) return;
      calc.style.left = Math.max(0, Math.min(innerWidth - 120, ox + e.clientX - sx)) + "px"; calc.style.top = Math.max(0, Math.min(innerHeight - 60, oy + e.clientY - sy)) + "px"; calc.style.right = "auto"; });
    h.addEventListener("pointerup", () => calc.classList.remove("drag"));
    return calc;
  }
  function toggleCalc(on) {
    const c = calculator(), f = c.querySelector("iframe");
    on = on ?? c.classList.contains("hidden");
    if (on && f.src === "about:blank") f.src = DESMOS;   // load once and keep the work between questions
    c.classList.toggle("hidden", !on);
    if (bar) bar.querySelector(".bb-t-calc").setAttribute("aria-pressed", String(on));
  }

  const FIG = {
    circle: '<svg viewBox="0 0 80 60"><circle cx="40" cy="30" r="22"/><line x1="40" y1="30" x2="62" y2="30"/><text x="50" y="26">r</text></svg>',
    rect: '<svg viewBox="0 0 80 60"><rect x="12" y="14" width="56" height="32"/><text x="40" y="56">ℓ</text><text x="72" y="33">w</text></svg>',
    tri: '<svg viewBox="0 0 80 60"><polygon points="8,48 72,48 30,10"/><line x1="30" y1="10" x2="30" y2="48" stroke-dasharray="3 2"/><text x="40" y="58">b</text><text x="33" y="32">h</text></svg>',
    right: '<svg viewBox="0 0 80 60"><polygon points="14,48 66,48 14,10"/><text x="38" y="58">b</text><text x="4" y="32">a</text><text x="42" y="26">c</text></svg>',
    t30: '<svg viewBox="0 0 90 60"><polygon points="14,50 76,50 14,14"/><text x="2" y="34">x</text><text x="36" y="60">x√3</text><text x="48" y="28">2x</text><text x="62" y="47">30°</text><text x="17" y="24">60°</text></svg>',
    t45: '<svg viewBox="0 0 90 60"><polygon points="14,50 58,50 14,8"/><text x="4" y="32">s</text><text x="32" y="60">s</text><text x="40" y="26">s√2</text><text x="44" y="47">45°</text><text x="17" y="20">45°</text></svg>',
    box: '<svg viewBox="0 0 80 60"><rect x="10" y="22" width="44" height="28"/><polyline points="10,22 24,10 68,10 54,22"/><polyline points="68,10 68,38 54,50"/><text x="30" y="58">ℓ</text><text x="62" y="54">w</text><text x="72" y="28">h</text></svg>',
    cyl: '<svg viewBox="0 0 80 60"><ellipse cx="40" cy="12" rx="22" ry="6"/><path d="M18,12 V48 A22,6 0 0 0 62,48 V12"/><line x1="40" y1="12" x2="62" y2="12"/><text x="48" y="9">r</text><text x="66" y="34">h</text></svg>',
    sph: '<svg viewBox="0 0 80 60"><circle cx="40" cy="30" r="22"/><ellipse cx="40" cy="30" rx="22" ry="6" stroke-dasharray="3 2"/><line x1="40" y1="30" x2="62" y2="30"/><text x="50" y="26">r</text></svg>',
    cone: '<svg viewBox="0 0 80 60"><path d="M18,48 L40,6 L62,48"/><ellipse cx="40" cy="48" rx="22" ry="6"/><line x1="40" y1="6" x2="40" y2="48" stroke-dasharray="3 2"/><line x1="40" y1="48" x2="62" y2="48"/><text x="50" y="45">r</text><text x="31" y="30">h</text></svg>',
    pyr: '<svg viewBox="0 0 80 60"><polygon points="10,48 52,48 66,38 24,38"/><polyline points="10,48 38,6 52,48"/><line x1="38" y1="6" x2="66" y2="38"/><line x1="38" y1="6" x2="38" y2="43" stroke-dasharray="3 2"/><text x="28" y="58">ℓ</text><text x="62" y="50">w</text><text x="30" y="30">h</text></svg>',
  };
  function reference() {
    if (ref) return ref;
    const cells = [["circle", "A = πr²<br>C = 2πr"], ["rect", "A = ℓw"], ["tri", "A = ½bh"], ["right", "c² = a² + b²"], ["t30", "Особые прямоугольные треугольники"], ["t45", ""],
      ["box", "V = ℓwh"], ["cyl", "V = πr²h"], ["sph", "V = 4⁄3 πr³"], ["cone", "V = 1⁄3 πr²h"], ["pyr", "V = 1⁄3 ℓwh"]];
    ref = document.createElement("div"); ref.className = "bb-ref hidden"; ref.setAttribute("role", "dialog"); ref.setAttribute("aria-label", "Справочные формулы");
    ref.innerHTML = `<div class="bb-ref-box"><div class="bb-calc-h"><span class="label">Справочник · Reference</span><button type="button" class="bb-x" title="Закрыть">×</button></div>
      <div class="bb-ref-grid">${cells.map(([k, t]) => `<div class="bb-fig">${FIG[k]}<div>${t}</div></div>`).join("")}<div class="bb-fig bb-note"><div>Все фигуры — на плоскости, если не сказано иное. Все числа — действительные.</div></div></div>
      <ul class="bb-facts"><li>The number of degrees of arc in a circle is 360.</li><li>The number of radians of arc in a circle is 2π.</li><li>The sum of the measures in degrees of the angles of a triangle is 180.</li></ul></div>`;
    document.body.appendChild(ref);
    ref.onclick = (e) => { if (e.target === ref || e.target.closest(".bb-x")) toggleRef(false); };
    return ref;
  }
  function toggleRef(on) { const r = reference(); on = on ?? r.classList.contains("hidden"); r.classList.toggle("hidden", !on); }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { if (ref) toggleRef(false); } });

  window.BBTools = {
    mount(el) {
      bar = el; el.classList.add("bb-tools");
      el.innerHTML = '<button type="button" class="chip bb-t-calc" aria-pressed="false">Калькулятор</button><button type="button" class="chip bb-t-ref">Справочник</button>';
      el.querySelector(".bb-t-calc").onclick = () => toggleCalc();
      el.querySelector(".bb-t-ref").onclick = () => toggleRef(true);
    },
    show(on) { if (bar) bar.classList.toggle("hidden", !on); if (!on) { if (calc) toggleCalc(false); if (ref) toggleRef(false); } },
    close() { if (calc) toggleCalc(false); if (ref) toggleRef(false); },
  };
})();
