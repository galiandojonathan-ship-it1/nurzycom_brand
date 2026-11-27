/* «Прогресс ученика»: the progress index of one student over time (2026-11-22, formula approved by Nurassyl).
   Pure computation, no DOM: PROGRESS.compute(observations, tags, opts) → weekly series, subtopic mastery, components, traps.
   Formula (notes/WEBSITE_HANDOFF.md → «Прогресс ученика»):
   - every first attempt updates the section level and a per-subtopic offset (subtopic θ = section θ + offset), each with uncertainty v (Gaussian prior, Laplace update for a 3PL item:
     guessing g = 0.25 for A–D, 0 for typed), difficulty b = −1.2 / 0 / +1.2 for E / M / H; v grows 0.05 a day without practice (tuned on synthetic learners 2026-11-22);
   - weekly points are smoothed backwards (RTS), so each week uses all answers; a section counts from 20 answers;
   - mastery of a subtopic = mean σ(θ − 0.5·√v − b) over E, M, H; mastery M = exam-weighted mean over the student's sections;
   - index = 0.60·M + 0.15·transfer + 0.10·retention + 0.10·pace + 0.05·correction (weights of missing parts are shared out). */
(function (root) {
  "use strict";
  const B = { E: -1.2, M: 0, H: 1.2 }, LV = ["E", "M", "H"], TH0 = -1, DAY = 864e5, TAU2 = 0.05, V0 = 1.0, VSEC = 2.25;
  let TAUD = 0.05, VD = 1.0;   // subtopic offsets (chosen on simulated students 2026-11-22: steady student ±7 index points over 8 weeks, a learned subtopic found 2 times in 3)
  const W = { M: 0.6, X: 0.15, R: 0.1, P: 0.1, C: 0.05 };
  const CTX = { mock: 1, final: 1, hw: 0.8, learn: 0.6 };
  const PACE = { rw: 71, math: 95 };
  const MIN_SEC = 20, MIN_LV = 5, MIN_IX = 30;   // answers needed before a section, a level or the index is drawn
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
  // College Board skill of each subtopic (the domain chart draws skills, not question types)
  const CB = {
    "Words in Context": ["wic_precise", "wic_meaning"], "Text Structure and Purpose": ["ts_purpose", "ts_function", "ts_structure"], "Cross-Text Connections": ["ctc"],
    "Central Ideas and Details": ["ci_main", "ci_detail"], "Command of Evidence": ["coe_text", "coe_quant"], "Inferences": ["inf_complete"],
    "Boundaries": ["b_splice", "b_fanboys", "b_semicolon", "b_colon_dash", "b_nonessential", "b_no_break", "b_intro", "b_other"],
    "Form, Structure, and Sense": ["f_sv_agree", "f_pronoun", "f_tense", "f_verb_form", "f_modifier", "f_possessive", "f_noun_number"],
    "Transitions": ["t_contrast", "t_concession", "t_cause", "t_addition", "t_sequence", "t_restate"], "Rhetorical Synthesis": ["rs_goal"],
    "Linear equations in one variable": ["alg_lin1"], "Linear functions": ["alg_linfunc"], "Linear equations in two variables": ["alg_lin2"],
    "Systems of two linear equations in two variables": ["alg_system"], "Linear inequalities in one or two variables": ["alg_ineq"],
    "Equivalent expressions": ["adv_equiv"], "Nonlinear equations in one variable and systems of equations in two variables": ["adv_quad", "adv_nonlin"],
    "Nonlinear functions": ["adv_exp", "adv_func"], "Ratios, rates, proportional relationships, and units": ["psda_ratio"], "Percentages": ["psda_pct"],
    "One-variable data: Distributions and measures of center and spread": ["psda_stats1"], "Two-variable data: Models and scatterplots": ["psda_stats2"],
    "Probability and conditional probability": ["psda_prob"], "Inference from sample statistics and margin of error": ["psda_infer"],
    "Area and volume": ["geo_areavol"], "Lines, angles, and triangles": ["geo_lines"], "Right triangles and trigonometry": ["geo_trig"], "Circles": ["geo_circle"] };
  const SKILL_OF = {}; for (const [sk, list] of Object.entries(CB)) list.forEach((k) => (SKILL_OF[k] = sk));
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

  function update(st, x, b, g, w, base = 0) {   // one observation on a Gaussian state {th, v}; base: the section level under a subtopic offset
    const pi = sig(base + st.th - b), p = g + (1 - g) * pi, D = (1 - g) * pi * (1 - pi), q = Math.max(p * (1 - p), 1e-6);
    const v2 = 1 / (1 / st.v + (w * D * D) / q);
    st.th += v2 * w * D * (x - p) / q; st.v = v2;
    return p;
  }
  const grow = (st, t) => { if (st.t != null) st.v = Math.min(st.cap, st.v + (st.q ?? TAU2) * Math.max(0, (t - st.t) / DAY)); st.t = t; };

  /* obs: [{ id, t (ms), x (0/1 first try), sec ("rw"|"math"), level, type ("mc"|"spr"), ctx ("mock"|"final"|"hw"|"learn"),
             part (id of the submission), attempt (1…), chosen (letter or ""), second (0/1/null), secs (seconds per question or 0),
             hints (0..1 share) }]
     tags: { id: { p: primary, s: [secondary], t: { A: trap, … } } } */
  function compute(obs, tags, opts = {}) {
    TAUD = opts.tauD ?? 0.05; VD = opts.vD ?? 1.0;   // opts only for experiments; reset on every call
    const now = opts.now || Date.now(), OMEGA = weights(opts.freq || bankFreq(tags));
    obs = obs.filter((o) => o && Number.isFinite(o.t)).sort((a, b) => a.t - b.t);
    const secs = [...new Set(obs.map((o) => o.sec))].filter((s) => DOMAINS[s]);
    const ability = {}; secs.forEach((s) => (ability[s] = { th: TH0, v: VSEC, cap: VSEC, t: null }));   // TH0: a course student starts below a medium SAT question
    const S = {};   // subtopic states
    const seen = {}, lastTag = {};
    const X = [], R = [], C = { n: 0, k: 0 }, partStats = {}, trapOpp = {}, slip = { n: 0, miss: 0, exp: 0 }, blanks = { n: 0, b: 0 };
    let tagged = 0, done = 0; const cnt = {};   // answers so far (first tries) by section and level: [right, total]
    const lambda = (t, half) => Math.pow(2, -(now - t) / (half * DAY));
    const snaps = [];
    const weekEnd = (t) => { const d = new Date(t); d.setHours(23, 59, 59, 999); d.setDate(d.getDate() + ((7 - d.getDay()) % 7)); return +d; };
    let nextSnap = obs.length ? weekEnd(obs[0].t) : now;
    const snap = (t) => snaps.push(state(t));
    function state(t) {   // what is known at time t; mastery, index and difficulty are filled in by finish() after smoothing
      const at = (st) => (st ? { th: st.th, v: st.t == null ? st.v : Math.min(st.cap, st.v + (st.q ?? TAU2) * Math.max(0, (t - st.t) / DAY)), cap: st.cap, q: st.q ?? TAU2 } : null);
      const tot = (sec) => LV.reduce((a, d) => a + (cnt[sec] && cnt[sec][d] ? cnt[sec][d][1] : 0), 0);
      // only sections with MIN_SEC answers by t count: before that a section's subtopics sit at the prior and would fake a drop, then growth
      const live = secs.filter((sec) => tot(sec) >= MIN_SEC);
      const parts = { M: null };
      const ratio = (list, half) => { const lv = list.filter((o) => o.t <= t); if (lv.length < 10) return null; const A = lv.reduce((a, o) => a + lambda(o.t, half) * o.x, 0), E = lv.reduce((a, o) => a + lambda(o.t, half) * o.p, 0); return 100 * Math.min(1, (A + 5) / (E + 5)); };
      parts.X = ratio(X, 30); parts.R = ratio(R, 30);
      const ps = Object.values(partStats).filter((p) => p.t <= t && p.timed && p.secs > 0);
      if (ps.length >= 2) { let a = 0, d = 0; for (const p of ps) { const l = lambda(p.t, 21) * p.n, pace = Math.max(0, Math.min(1, 2 - p.secs / PACE[p.sec])), acc = Math.min(1, (p.right + 1) / (p.exp + 1)); a += l * pace * acc; d += l; } parts.P = 100 * a / d; } else parts.P = null;
      parts.C = C.n >= 10 ? 100 * Math.max(0, Math.min(1, ((C.k + 1) / (C.n + 3) - 1 / 3) / (2 / 3))) : null;
      return { t, index: null, parts, sub: {}, sd: {}, diff: {}, nAns: done, live, subN: Object.fromEntries(Object.entries(S).map(([k, v]) => [k, v.n])), cnt: JSON.parse(JSON.stringify(cnt)), used: 0,
        ab: Object.fromEntries(secs.map((sec) => [sec, at(ability[sec])])), st: Object.fromEntries(Object.keys(S).map((k) => [k, at(S[k])])) };
    }
    /* Backward (Rauch–Tung–Striebel) smoothing over the weekly points: each week's ability is estimated with all answers, later ones
       included. Without it the forward estimate climbs out of the prior as answers pile up, and a student who does not change
       still shows growth (+23 index points over 8 weeks on a simulated steady student; with smoothing about 0). */
    function smooth(get, put) {
      const n = snaps.length; let nx = null;
      for (let i = n - 1; i >= 0; i--) {
        const f = get(snaps[i]); if (!f) break;
        if (!nx) { nx = { th: f.th, v: f.v }; put(snaps[i], nx); continue; }
        const vp = f.v + f.q * Math.max(0, (snaps[i + 1].t - snaps[i].t) / DAY), J = f.v / vp;   // uncapped: with the cap the walk stalls and the last value is copied back
        nx = { th: f.th + J * (nx.th - f.th), v: Math.max(1e-6, f.v + J * J * (nx.v - vp)) }; put(snaps[i], nx);
      }
    }
    let lastLv = null;   // the last week's section levels and subtopic offsets (for the target comparison)
    function finish() {
      if (!opts.noSmooth) { for (const sec of secs) smooth((s) => s.ab[sec], (s, v) => (s.ab[sec] = v)); for (const k in S) smooth((s) => s.st[k], (s, v) => (s.st[k] = v)); }
      for (const s of snaps) {
        let mNum = 0, mDen = 0;
        for (const sec of s.live) for (const k in OMEGA) if (SEC_OF[k] === sec) {
          const d = s.st[k] || { th: 0, v: VD }, vt = s.ab[sec].v + d.v, th = s.ab[sec].th + d.th - 0.5 * Math.sqrt(vt);   // subtopic = section level + its own offset
          const m = LV.reduce((a, d) => a + sig(th - B[d]), 0) / 3; s.sub[k] = m;
          s.sd[k] = Math.sqrt(vt) * LV.reduce((a, d) => a + sig(th - B[d]) * (1 - sig(th - B[d])), 0) / 3;   // standard error of the mastery (delta method)
          mNum += OMEGA[k] * m; mDen += OMEGA[k];
        }
        s.parts.M = mDen ? 100 * mNum / mDen : null;
        let num = 0, den = 0; for (const k in W) if (s.parts[k] != null) { num += W[k] * s.parts[k]; den += W[k]; }
        s.index = den && s.parts.M != null ? Math.round(num / den) : null;   // no index without mastery: pace or correction alone say nothing about level
        s.used = Object.keys(W).filter((k) => s.parts[k] != null).length;
        // expected share right at each level, guessing included (comparable with the raw count); a section from MIN_SEC answers,
        // a level from MIN_LV answers of that level, so the prior never draws a line by itself
        for (const sec of secs) { const c = s.cnt[sec] || {}, tot = LV.reduce((a, d) => a + (c[d] ? c[d][1] : 0), 0), g = sec === "rw" ? 0.25 : 0.18;
          s.diff[sec] = tot < MIN_SEC ? {} : Object.fromEntries(LV.filter((d) => c[d] && c[d][1] >= MIN_LV).map((d) => [d, g + (1 - g) * sig(s.ab[sec].th - B[d])])); }
        if (s === snaps[snaps.length - 1]) lastLv = { sec: JSON.parse(JSON.stringify(s.ab || {})), sub: JSON.parse(JSON.stringify(s.st || {})) };
        delete s.ab; delete s.st;
      }
    }
    let mockBefore = null, mockPart = null;
    for (const o of obs) {
      while (o.t > nextSnap) { snap(nextSnap); nextSnap += 7 * DAY; }
      const tag = tags[o.id], sec = o.sec, A = ability[sec]; if (!A) continue;
      const g = o.type === "spr" ? 0 : 0.25, b = B[o.level] ?? 0;
      const repeat = (seen[o.id] = (seen[o.id] || 0) + 1) > 1 || o.attempt > 1;
      const w = (CTX[o.ctx] || 0.8) * (1 - 0.5 * (o.hints || 0)) * (repeat ? 0.3 : 1);
      blanks.n++; if (o.blank) blanks.b++;
      if (!repeat) { done++; const c = (cnt[sec] = cnt[sec] || {}); const r = (c[o.level] = c[o.level] || [0, 0]); r[0] += o.x; r[1]++; }
      // prediction before the update (for transfer, retention, slips): the primary subtopic, else the section
      const pk = tag && tag.p;
      const pHat = g + (1 - g) * sig(A.th + (pk && S[pk] ? S[pk].th : 0) - b);
      if (o.ctx === "mock" && pk && S[pk] && S[pk].np >= 3) X.push({ t: o.t, x: o.x, p: pHat });   // transfer: only subtopics already practised outside mocks
      if (pk && lastTag[pk] && o.t - lastTag[pk] >= 7 * DAY) R.push({ t: o.t, x: o.x, p: pHat });
      if (pHat >= 0.8) { slip.n++; slip.miss += 1 - o.x; slip.exp += 1 - pHat; }
      const base = A.th;   // section level before this answer: the subtopic offset is learned against it
      grow(A, o.t); update(A, o.x, b, g, w, pk && S[pk] ? S[pk].th : 0);   // the section level is learned net of the subtopic's own offset
      if (tag) {
        tagged++;
        [...(tag.p ? [[tag.p, 1]] : []), ...(tag.s || []).map((k) => [k, tag.sw ?? 0.5])].forEach(([k, alpha]) => {   // sw: share for evidence spread over a skill
          if (!OMEGA[k]) return;
          if (!S[k]) S[k] = { th: 0, v: VD, cap: VD, q: TAUD, t: o.t, n: 0, np: 0, first: o.t, hist: [] };   // offset from the section level, prior 0
          grow(S[k], o.t); update(S[k], o.x, b, g, w * alpha, base); S[k].n += alpha === 1 ? 1 : 0; S[k].m = (S[k].m || 0) + alpha; if (alpha === 1 && o.ctx !== "mock") S[k].np++;
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
    finish();
    // subtopic rows: now vs the start of the shown period, answer counts
    const subs = Object.keys(OMEGA).filter((k) => secs.includes(SEC_OF[k])).map((k) => ({ k, sec: SEC_OF[k], n: S[k] ? S[k].n : 0, m: S[k] ? S[k].m || 0 : 0, series: snaps.map((s) => s.sub[k] ?? null), sd: snaps.map((s) => s.sd[k] ?? null), first: snaps.findIndex((s) => (s.subN[k] || 0) >= 3 && s.sub[k] != null) }));   // first: first snapshot with 3+ answers
    const traps = Object.entries(trapOpp).map(([trap, r]) => {
      const L = r.list, h = Math.max(1, Math.floor(L.length * 0.4));
      const rate = (a) => (a.reduce((x, y) => x + y.pick, 0) + 0.5) / (a.length + 2);
      return { trap, n: L.length, was: rate(L.slice(0, h)), now: rate(L.slice(-h)) };
    }).filter((x) => x.n >= 4).sort((a, b) => b.now - a.now);
    return { snaps, subs, traps, secs, n: obs.length, tagged, omega: OMEGA, lv: lastLv,
      habits: { slip: slip.n >= 5 ? slip.miss / slip.n : null, slipExpected: slip.n >= 5 ? slip.exp / slip.n : null, blank: blanks.n ? blanks.b / blanks.n : null },
      mocks: [...new Set(obs.filter((o) => o.ctx === "mock").map((o) => o.part))].map((p) => partStats[p].t) };
  }
  // contribution of each subtopic to the change of the index between two snapshots (mastery part only)
  // only subtopics with at least minN answers: a change built on one or two answers is noise
  /* change of one subtopic between two weekly points, from its first reliable value (3+ answers), never from the prior;
     z = change / its standard error (errors of both points added: conservative, smoothed points are correlated) */
  const ZMIN = 1;   // measured on simulated students (2026-11-22): at 70 answers a week finds a learned subtopic 25 of 30 times, about 0.4 false per student
  function change(res, x, i0, i1) {
    if (x.first < 0 || x.first >= i1 || x.series[i1] == null) return null;
    const j = Math.max(i0, x.first), a0 = x.series[j]; if (a0 == null) return null;
    const ch = x.series[i1] - a0, se = Math.hypot(x.sd[j] || 0, x.sd[i1] || 0) || 1e-6;
    return { ch, z: ch / se, from: j };
  }
  function drivers(res, i0, i1, minN = 3, zmin = ZMIN) {   // only changes clearly above the noise
    const b = res.snaps[i1]; if (!res.snaps[i0] || !b) return [];
    const OM = res.omega, den = res.subs.reduce((s, x) => s + OM[x.k], 0) || 1, used = Object.keys(W).filter((k) => b.parts[k] != null).reduce((s, k) => s + W[k], 0) || 1;
    return res.subs.filter((x) => x.n >= minN).map((x) => { const c = change(res, x, i0, i1); return c && Math.abs(c.z) >= zmin ? { k: x.k, v: (W.M / used) * 100 * OM[x.k] * c.ch / den, n: x.n, z: c.z } : null; })
      .filter(Boolean).sort((p, q) => Math.abs(q.v) - Math.abs(p.v));
  }
  /* the domain chart: the domain as a whole (thick line) and its College Board skills (thin lines), from the weekly snapshots.
     Only skills with answers of their own are drawn: an unanswered skill would only repeat the section level. */
  function domainSeries(res, sec, di) {
    const list = (DOMAINS[sec] || [])[di]; if (!list) return null;
    const OM = res.omega, n = {}; res.subs.forEach((x) => (n[x.k] = x.m || x.n));   // m: answers incl. evidence spread over a skill
    const avg = (s, ks) => { let a = 0, w = 0; for (const k of ks) { const v = s.sub[k]; if (v == null) continue; a += OM[k] * v; w += OM[k]; } return w ? a / w : null; };
    const dom = res.snaps.map((s) => avg(s, list[1]));
    const skills = Object.entries(CB).map(([sk, ks]) => [sk, ks.filter((k) => list[1].includes(k))]).filter(([, ks]) => ks.length)
      .map(([sk, ks]) => ({ skill: sk, n: ks.reduce((a, k) => a + (n[k] || 0), 0), series: res.snaps.map((s) => avg(s, ks.filter((k) => (n[k] || 0) > 0))) }))
      .filter((x) => x.n > 0);
    return { dom, skills };
  }
  // a tag from a College Board skill name alone (a Bluebook question not in the course): one subtopic → primary, several → evidence spread evenly
  const ALIAS = { "evaluating statistical claims: observational studies and experiments": "psda_infer", "text, structure, and purpose": "ts_purpose" };
  function tagFromSkill(name) {
    const key = String(name || "").toLowerCase().trim(), hit = Object.entries(CB).find(([sk]) => sk.toLowerCase() === key);
    const ks = hit ? hit[1] : ALIAS[key] ? [ALIAS[key]] : [];
    return !ks.length ? null : ks.length === 1 ? { p: ks[0], s: [], t: {} } : { p: null, s: ks.slice(), sw: 1 / ks.length, t: {} };
  }
  // Turn one finalized live round into evidence. Attempt positions are kept separate from source question numbers.
  function liveRound(rec, student, courseTags, fallbackTags = {}) {
    const mode = rec.v === 2 ? rec.progress : "answered";
    if (mode !== "answered" && mode !== "module") return [];
    const items = Array.isArray(rec.items) ? rec.items : [];
    const answerFor = (i) => {
      const a = student.ans?.[i + 1];
      return Array.isArray(a) && a[0] && (a[1] === 0 || a[1] === 1) ? a : null;
    };
    let rows;
    if (mode === "module") {
      if (!Array.isArray(rec.module) || !rec.module.length) return [];
      const byRef = new Map(items.map((it, i) => [it.ref, answerFor(i)]).filter(([ref, a]) => ref && a));
      if (!byRef.size) return [];   // joining a room alone is not a submitted module
      rows = rec.module.map((it, i) => ({ it, i, a: byRef.get(it.ref) }));
    } else rows = items.map((it, i) => ({ it, i, a: answerFor(i) })).filter(({ a }) => a);
    return rows.map(({ it, i, a }) => {
      const id = it.ref || `LV.${rec.round}.${i + 1}`;
      if (!courseTags[id] && it.sk && !fallbackTags[id]) {
        const tag = tagFromSkill(it.sk);
        if (tag) fallbackTags[id] = tag;
      }
      return { id, t: rec.at, x: a?.[1] === 1 ? 1 : 0, blank: !a, sec: it.sec || "rw", level: it.d || "M",
        type: it.type === "mc" ? "mc" : "spr", ctx: mode === "module" ? "mock" : "learn", src: "live",
        part: `live|${rec.round}`, attempt: 1, chosen: a?.[0] || "", second: null, secs: 0,
        original: { title: rec.title || "Живая практика", n: it.n || i + 1, ref: it.ref, refs: it.ref ? [it.ref] : [], sk: it.sk } };
    });
  }
  function bankFreq(tags) { const f = {}; for (const id in tags) { const k = tags[id] && tags[id].p; if (k) f[k] = (f[k] || 0) + 1; } return f; }
  // «Цель ученика» (Nurassyl, 2026-11-23: «вписать target score… чтобы графики и анализ показали, где у него проседает
  // относительно его target score»). A section target score → the raw count it needs on the hard route (scale.js, nurzycom's
  // table) → the level θ at which a student would expect that raw count on a full section of the real difficulty mix (module 1
  // a third each, hard module 2 30% medium / 70% hard: 9/17/28 of 54 in RW, 7/14/23 of 44 in Math; Math a quarter typed answers
  // with no guessing) → the accuracy needed on easy, medium and hard questions (guessing included, as in the difficulty chart)
  // and the mastery a subtopic needs (same form as the mastery column: mean σ(θ − b) over E, M, H). An estimate, like the table.
  const MIX = { rw: { n: 54, lv: { E: 9, M: 17, H: 28 }, typed: 0 }, math: { n: 44, lv: { E: 7, M: 14, H: 23 }, typed: 0.25 } };
  function rawNeeded(sec, score, scale) {
    const n = MIX[sec].n; for (let r = 0; r <= n; r++) if (scale.section(sec, true, r) >= score) return r; return n;
  }
  function expectedRaw(sec, th) {
    const m = MIX[sec]; let e = 0;
    for (const d of LV) { const pi = sig(th - B[d]); e += m.lv[d] * ((1 - m.typed) * (0.25 + 0.75 * pi) + m.typed * pi); }
    return e;
  }
  function levelOf(sec, score, scale) {
    const raw = Math.min(MIX[sec].n - 0.3, rawNeeded(sec, score, scale));
    let lo = -4, hi = 5; for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (expectedRaw(sec, mid) < raw) lo = mid; else hi = mid; }
    return { th: (lo + hi) / 2, raw: Math.round(raw) };
  }
  // current: { rw, math } the ориентир's middle score now. With it the target is a shift (delta) from where the student is, applied
  // to the model's own section level, so both sides of the comparison are on the same, cautious scale; without it, the absolute level.
  function targetNeeds(target, scale, current) {
    const out = {};
    for (const sec of ["rw", "math"]) {
      const score = target && +target[sec]; if (!score || !scale) continue;
      const L = levelOf(sec, score, scale), cur = current && +current[sec] ? levelOf(sec, +current[sec], scale) : null;
      const acc = {}, g = MIX[sec].typed;
      for (const d of LV) { const pi = sig(L.th - B[d]); acc[d] = (1 - g) * (0.25 + 0.75 * pi) + g * pi; }
      out[sec] = { score, raw: L.raw, th: L.th, delta: cur ? L.th - cur.th : null, current: cur ? +current[sec] : null, acc, mastery: LV.reduce((a, d) => a + sig(L.th - B[d]), 0) / 3 };
    }
    return out;
  }
  // what the target asks of this student, on the model's scale: the needed section level, the needed accuracy by difficulty
  // (as the difficulty chart draws it) and the needed mastery of each subtopic (same cautious form as its mastery column)
  function targetFor(res, need) {
    if (!need || !res || !res.lv) return null;
    const out = {};
    for (const [sec, t] of Object.entries(need)) {
      const A = res.lv.sec[sec]; if (!A) continue;
      const thNeed = t.delta != null ? A.th + t.delta : t.th, g = sec === "rw" ? 0.25 : 0.18, acc = {}, sub = {};
      for (const d of LV) acc[d] = g + (1 - g) * sig(thNeed - B[d]);
      for (const k in OMEGA0) if (SEC_OF[k] === sec) { const dk = res.lv.sub[k] || { th: 0, v: VD }, vt = A.v + dk.v, th = thNeed - 0.5 * Math.sqrt(vt);
        sub[k] = LV.reduce((a, d) => a + sig(th - B[d]), 0) / 3; }
      const all = Object.values(sub); out[sec] = { ...t, thNeed, acc, sub, mastery: all.reduce((a, b) => a + b, 0) / (all.length || 1) };
    }
    return out;
  }
  // a subtopic against the target: below / at / above, with a margin so a tiny gap is not called a problem
  function vsTarget(now, need, n) {
    if (n < 3 || now == null || need == null) return ["thin", "мало данных"];
    const gap = need - now;
    return gap > 0.05 ? ["stuck", "ниже цели"] : gap < -0.05 ? ["ok", "выше цели"] : ["grow", "на уровне цели"];
  }
  const api = { compute, liveRound, drivers, change, ZMIN, targetNeeds, targetFor, vsTarget, MIX, domainSeries, tagFromSkill, CB, SKILL_OF_SUB: SKILL_OF, weights, bankFreq, OMEGA: OMEGA0, SEC_OF, DOMAINS, W, MIN_IX, MIN_SEC, MIN_LV };
  if (typeof module !== "undefined") module.exports = api; else root.PROGRESS = api;
})(typeof window !== "undefined" ? window : globalThis);
