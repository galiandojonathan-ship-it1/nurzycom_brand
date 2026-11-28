// Estimated SAT scores for the nurzycom mock tests (shared by mock.js and teacher.js).
// The digital SAT is scored by College Board with item response theory, and the official conversion is not public, so this is
// an estimate: the raw count of the two modules and the module 2 route, read off a fixed nurzycom table and rounded to 10.
// An easy module 2 caps the section score, as on the real exam. The page always shows it as «примерный балл», never as a result.
window.SATSCALE = (() => {
  const T = {   // [raw correct in both modules, section score]
    rw: {
      h: [[15, 440], [20, 480], [25, 520], [30, 560], [35, 600], [40, 640], [45, 690], [50, 740], [52, 770], [54, 800]],
      e: [[0, 200], [5, 250], [10, 300], [14, 340], [20, 400], [25, 450], [30, 500], [35, 550], [41, 610]],
    },
    math: {
      h: [[13, 450], [18, 500], [22, 540], [26, 580], [30, 620], [34, 670], [38, 720], [41, 760], [43, 790], [44, 800]],
      e: [[0, 200], [5, 260], [10, 320], [12, 350], [16, 400], [20, 450], [25, 510], [30, 570], [34, 620]],
    },
  };
  function interp(pts, x) {
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); }
    return pts[pts.length - 1][1];
  }
  // sec "rw" | "math"; hard: module 2 was the harder one; raw: correct answers in modules 1 and 2 together
  function section(sec, hard, raw) { return Math.max(200, Math.min(800, Math.round(interp(T[sec][hard ? "h" : "e"], raw) / 10) * 10)); }
  return { section, CAP: { rw: 610, math: 620 }, ERR: 40 };
})();
