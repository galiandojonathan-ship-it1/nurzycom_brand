/* «Прогресс ученика»: the progress index of one student over time (2026-11-22, formula approved by Nurassyl).
   Pure computation, no DOM: PROGRESS.compute(observations, tags, opts) → weekly series, subtopic mastery, components, traps.
   Formula (notes/WEBSITE_HANDOFF.md → «Прогресс ученика»):
   - every first attempt updates a per-subtopic ability θ with uncertainty v (Gaussian prior, Laplace update for a 3PL item:
     guessing g = 0.25 for A–D, 0 for typed), difficulty b = −1.2 / 0 / +1.2 for E / M / H; v grows 0.05 a day without practice (tuned on synthetic learners 2026-11-22);
   - mastery of a subtopic = mean σ(θ − 0.5·√v − b) over E, M, H; mastery M = exam-weighted mean over the student's sections;
   - index = 0.60·M + 0.15·transfer + 0.10·retention + 0.10·pace + 0.05·correction (weights of missing parts are shared out). */
(function (root) {
  "use strict";
  const B = { E: -1.2, M: 0, H: 1.2 }, LV = ["E", "M", "H"], TH0 = -1, DAY = 864e5, TAU2 = 0.05, V0 = 1.0, VSEC = 2.25;
  const W = { M: 0.6, X: 0.15, R: 0.1, P: 0.1, C: 0.05 };
  const CTX = { mock: 1, final: 1, hw: 0.8, learn: 0.6 };
  const PACE = { rw: 71, math: 95 };
  const sig = (z) => 1 / (1 + Math.exp(-z));
  // exam weights: domain share of the real SAT, split equally among the domain's subtopics
  const DOMAINS = {
    rw: [[28, ["wic_precise", "wic_meaning", "ts_purpose", "ts_function", "ts_structure", "ctc"]],
      [26, ["ci_main", "ci_detail", "coe_text", "coe_quant", "inf_complete"]],
      [26, ["b_splice", "b_fanboys", "b_semicolon", "b_colon_dash", "b_nonessential", "b_no_break", "b_intro", "b_other",
        "f_sv_agree", "f_pronoun", "f_tense", "f_verb_form", "f_modifier", "f_possessive", "f_noun_number"]],
      [20, ["t_contrast", "t_concession", "t_cause", "t_addition", "t_sequence", "t_restate", "rs_goal"]]],
    math: [[35, ["alg_lin1", "alg_linfunc", "alg_lin2", "alg_system", "alg_ineq"]],
      [35, ["adv_equiv", "adv_quad", "adv_exp", "adv_func", "adv_nonlin"]],
      [15, ["psda_ratio", "psda_pct", "psda_stats1", "psda_stats2", "psda_prob", "psda_infer"]],
      [15, ["geo_areavol", "geo_lines", "geo_trig", "geo_circle"]]],
  };
  // within a domain, a subtopic weighs by how often it appears in the tagged question bank (+1 so a rare one still counts)
  const SEC_OF = {}; for (const sec in DOMAINS) for (const [, list] of DOMAINS[sec]) list.forEach((k) => (SEC_OF[k] = sec));
  function weights(freq) {
    const om = {};
    for (const sec in DOMAINS) for (const [share, list] of DOMAINS[sec]) {
      const f = list.map((k) => (freq && freq[k] || 0) + 1), tot = f.reduce((a, b) => a + b, 0);
      list.forEach((k, i) => (om[k] = share * f[i] / tot));
    }
    return om;
  }
  const OMEGA0 = weights(null);

  function update(st, x, b, g, w) {   // one observation on a Gaussian state {th, v}
    const pi = sig(st.th - b), p = g + (1 - g) * pi, D = (1 - g) * pi * (1 - pi), q = Math.max(p * (1 - p), 1e-6);
    const v2 = 1 / (1 / st.v + (w * D * D) / q);
    st.th += v2 * w * D * (x - p) / q; st.v = v2;
    return p;
  }
  const grow = (st, t) => { if (st.t != null) st.v = Math.min(st.cap, st.v + TAU2 * Math.max(0, (t - st.t) / DAY)); st.t = t; };
  const mastery = (st, t) => { const v = Math.min(st.cap, st.v + TAU2 * Math.max(0, (t - st.t) / DAY)), th = st.th - 0.5 * Math.sqrt(v); return LV.reduce((a, d) => a + sig(th - B[d]), 0) / 3; };

  /* obs: [{ id, t (ms), x (0/1 first try), sec ("rw"|"math"), level, type ("mc"|"spr"), ctx ("mock"|"final"|"hw"|"learn"),
             part (id of the submission), attempt (1…), chosen (letter or ""), second (0/1/null), secs (seconds per question or 0),
             hints (0..1 share) }]
     tags: { id: { p: primary, s: [secondary], t: { A: trap, … } } } */
  function compute(obs, tags, opts = {}) {
    const now = opts.now || Date.now(), OMEGA = weights(opts.freq || bankFreq(tags));
    obs = obs.filter((o) => o && Number.isFinite(o.t)).sort((a, b) => a.t - b.t);
    const secs = [...new Set(obs.map((o) => o.sec))].filter((s) => DOMAINS[s]);
    const ability = {}; secs.forEach((s) => (ability[s] = { th: TH0, v: VSEC, cap: VSEC, t: null }));   // TH0: a course student starts below a medium SAT question
    const S = {};   // subtopic states
    const seen = {}, lastTag = {};
    const X = [], R = [], C = { n: 0, k: 0 }, partStats = {}, trapOpp = {}, slip = { n: 0, miss: 0, exp: 0 }, blanks = { n: 0, b: 0 };
    let tagged = 0;
    const lambda = (t, half) => Math.pow(2, -(now - t) / (half * DAY));
    const snaps = [];
    const weekEnd = (t) => { const d = new Date(t); d.setHours(23, 59, 59, 999); d.setDate(d.getDate() + ((7 - d.getDay()) % 7)); return +d; };
    let nextSnap = obs.length ? weekEnd(obs[0].t) : now;
    const snap = (t) => snaps.push(state(t));
    function state(t) {   // index and parts at time t
      const sub = {};
      let mNum = 0, mDen = 0;
      for (const sec of secs) for (const k in OMEGA) if (SEC_OF[k] === sec) {
        const st = S[k] || { th: ability[sec].th, v: V0, cap: V0, t: t };
        const m = mastery(st, t); sub[k] = m; mNum += OMEGA[k] * m; mDen += OMEGA[k];
      }
      const parts = { M: mDen ? 100 * mNum / mDen : null };
      const ratio = (list, half) => { const live = list.filter((o) => o.t <= t); if (live.length < 10) return null; const A = live.reduce((a, o) => a + lambda(o.t, half) * o.x, 0), E = live.reduce((a, o) => a + lambda(o.t, half) * o.p, 0); return 100 * Math.min(1, (A + 5) / (E + 5)); };
      parts.X = ratio(X, 30); parts.R = ratio(R, 30);
      const ps = Object.values(partStats).filter((p) => p.t <= t && p.timed && p.secs > 0);
      if (ps.length >= 2) { let a = 0, d = 0; for (const p of ps) { const l = lambda(p.t, 21) * p.n, pace = Math.max(0, Math.min(1, 2 - p.secs / PACE[p.sec])), acc = Math.min(1, (p.right + 1) / (p.exp + 1)); a += l * pace * acc; d += l; } parts.P = 100 * a / d; } else parts.P = null;
      parts.C = C.n >= 10 ? 100 * Math.max(0, Math.min(1, ((C.k + 1) / (C.n + 3) - 1 / 3) / (2 / 3))) : null;
      let num = 0, den = 0; for (const k in W) if (parts[k] != null) { num += W[k] * parts[k]; den += W[k]; }
      const diff = {}; for (const sec of secs) diff[sec] = Object.fromEntries(LV.map((d) => [d, sig(ability[sec].th - B[d])]));
      return { t, index: den ? Math.round(num / den) : null, parts, sub, diff, used: Object.keys(W).filter((k) => parts[k] != null).length };
    }
    let mockBefore = null, mockPart = null;
    for (const o of obs) {
      while (o.t > nextSnap) { snap(nextSnap); nextSnap += 7 * DAY; }
      const tag = tags[o.id], sec = o.sec, A = ability[sec]; if (!A) continue;
      const g = o.type === "spr" ? 0 : 0.25, b = B[o.level] ?? 0;
      const repeat = (seen[o.id] = (seen[o.id] || 0) + 1) > 1 || o.attempt > 1;
      const w = (CTX[o.ctx] || 0.8) * (1 - 0.5 * (o.hints || 0)) * (repeat ? 0.3 : 1);
      blanks.n++; if (o.blank) blanks.b++;
      // prediction before the update (for transfer, retention, slips): the primary subtopic, else the section
      const pk = tag && tag.p, pst = pk && S[pk] ? S[pk] : A;
      const pHat = g + (1 - g) * sig(pst.th - b);
      if (o.ctx === "mock" && pk && S[pk] && S[pk].np >= 3) X.push({ t: o.t, x: o.x, p: pHat });   // transfer: only subtopics already practised outside mocks
      if (pk && lastTag[pk] && o.t - lastTag[pk] >= 7 * DAY) R.push({ t: o.t, x: o.x, p: pHat });
      if (pHat >= 0.8) { slip.n++; slip.miss += 1 - o.x; slip.exp += 1 - pHat; }
      grow(A, o.t); update(A, o.x, b, g, w);
      if (tag) {
        tagged++;
        [[tag.p, 1], ...(tag.s || []).map((k) => [k, 0.5])].forEach(([k, alpha]) => {
          if (!OMEGA[k]) return;
          if (!S[k]) S[k] = { th: A.th, v: V0, cap: V0, t: o.t, n: 0, np: 0, first: o.t, hist: [] };
          grow(S[k], o.t); update(S[k], o.x, b, g, w * alpha); S[k].n += alpha === 1 ? 1 : 0; if (alpha === 1 && o.ctx !== "mock") S[k].np++;
        });
        if (tag.p) lastTag[tag.p] = o.t;
        for (const [L, trap] of Object.entries(tag.t || {})) {
          const r = (trapOpp[trap] = trapOpp[trap] || { list: [] });
          r.list.push({ t: o.t, pick: o.chosen === L ? 1 : 0 });
        }
      }
      if (o.x === 0 && o.second != null) { C.n++; C.k += o.second; }   // a second try exists in learning parts and on-screen homework
      const ps = (partStats[o.part] = partStats[o.part] || { t: o.t, n: 0, right: 0, exp: 0, secs: o.secs || 0, sec, timed: o.ctx === "mock" || o.ctx === "final" });
      ps.n++; ps.right += o.x; ps.exp += pHat; ps.t = Math.max(ps.t, o.t);
    }
    while (nextSnap < now) { snap(nextSnap); nextSnap += 7 * DAY; }
    snaps.push(state(now));
    // subtopic rows: now vs the start of the shown period, answer counts
    const subs = Object.keys(OMEGA).filter((k) => secs.includes(SEC_OF[k])).map((k) => ({ k, sec: SEC_OF[k], n: S[k] ? S[k].n : 0, series: snaps.map((s) => s.sub[k]) }));
    const traps = Object.entries(trapOpp).map(([trap, r]) => {
      const L = r.list, h = Math.max(1, Math.floor(L.length * 0.4));
      const rate = (a) => (a.reduce((x, y) => x + y.pick, 0) + 0.5) / (a.length + 2);
      return { trap, n: L.length, was: rate(L.slice(0, h)), now: rate(L.slice(-h)) };
    }).filter((x) => x.n >= 4).sort((a, b) => b.now - a.now);
    return { snaps, subs, traps, secs, n: obs.length, tagged, omega: OMEGA,
      habits: { slip: slip.n >= 5 ? slip.miss / slip.n : null, slipExpected: slip.n >= 5 ? slip.exp / slip.n : null, blank: blanks.n ? blanks.b / blanks.n : null },
      mocks: [...new Set(obs.filter((o) => o.ctx === "mock").map((o) => o.part))].map((p) => partStats[p].t) };
  }
  // contribution of each subtopic to the change of the index between two snapshots (mastery part only)
  // only subtopics with at least minN answers: a change built on one or two answers is noise
  function drivers(res, i0, i1, minN = 3) {
    const a = res.snaps[i0], b = res.snaps[i1]; if (!a || !b) return [];
    const OM = res.omega, den = res.subs.reduce((s, x) => s + OM[x.k], 0) || 1, used = Object.keys(W).filter((k) => b.parts[k] != null).reduce((s, k) => s + W[k], 0) || 1;
    return res.subs.filter((x) => x.n >= minN).map((x) => ({ k: x.k, v: (W.M / used) * 100 * OM[x.k] * ((b.sub[x.k] ?? 0) - (a.sub[x.k] ?? 0)) / den, n: x.n })).sort((p, q) => Math.abs(q.v) - Math.abs(p.v));
  }
  function bankFreq(tags) { const f = {}; for (const id in tags) { const k = tags[id] && tags[id].p; if (k) f[k] = (f[k] || 0) + 1; } return f; }
  const api = { compute, drivers, weights, bankFreq, OMEGA: OMEGA0, SEC_OF, DOMAINS, W };
  if (typeof module !== "undefined") module.exports = api; else root.PROGRESS = api;
})(typeof window !== "undefined" ? window : globalThis);
