const SHOTS = process.env.SHOTS || require('os').tmpdir();
const { chromium } = require('playwright');
const { answerAll } = require('./answer_all.js');
const base = 'http://127.0.0.1:8791/';
const LIVE = ['C01','C02','C03','C04','C05','C06','C07','C12'];
(async () => {
  const b = await chromium.launch(); let fails = 0; const bad = m => { fails++; console.log('FAIL', m); };
  const keyLabels = async (p, id) => p.evaluate(id => { const o = []; window.LESSONS[id].parts.forEach(pt => { if (pt.type === 'questions') pt.items.forEach(q => o.push(q.kind === 'tfng' ? ({ T: 'TRUE', F: 'FALSE', NG: 'NOT GIVEN' })[q.key] : q.opts[q.key])); }); return o; }, id);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const [name, vp] of [['w320', { width: 320, height: 640 }], ['w360', { width: 360, height: 760 }], ['w1280', { width: 1280, height: 860 }]]) {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errs.push(m.text()); });
    const pages = ['index.html', 'ru/index.html', 'course/index.html', 'course/progress.html'];
    for (const id of LIVE.concat(['D0', 'K1'])) pages.push('course/lesson.html?id=' + id);
    for (const id of LIVE) { pages.push('course/slides.html?id=' + id); pages.push('course/office.html?id=' + id); }
    for (const u of pages) {
      await p.goto(base + u, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(120);
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 1) bad(`${name} ${u} overflow ${ov}`);
      const h1 = await p.locator('h1').count(); if (h1 < 1) bad(`${name} ${u} h1=${h1}`);
      if (u.includes('slides')) {
        const n = await p.locator('.slide').count(); if (n < 14) bad(`${u} slides ${n}`);
        // walk all slides, check no slide content overflows its box (desktop)
        for (let i = 0; i < n; i++) {
          if (name === 'w1280') { const o = await p.evaluate(i => { const s = document.querySelectorAll('.slide')[i]; return s.scrollHeight - s.clientHeight; }, i); if (o > 2) bad(`${u} slide ${i + 1} content overflow ${o}px`); }
          await p.keyboard.press('ArrowRight');
        }
        if (name === 'w1280' && u.endsWith('C05')) await p.screenshot({ path: require('path').join(SHOTS, 'sl_C05.png') });
      }
    }
    if (name === 'w1280') {
      for (const id of LIVE.concat(['D0', 'K1'])) {
        await p.goto(base + 'course/lesson.html?id=' + id); const n = await answerAll(p);
        const sc = (await p.locator('.score').textContent()).trim(); if (sc !== `${n} / ${n}`) bad(id + ' ' + sc); else console.log(id, sc);
      }
      await p.goto(base + 'course/lesson.html?id=C04'); await p.evaluate(() => localStorage.removeItem('nz_exp_C04')); await p.reload();
      const vis = async () => p.evaluate(() => [...document.querySelectorAll('.part')].filter(x => !x.hidden).map(x => x.id).join(','));
      if (await vis() !== 'words') bad('first part ' + await vis());
      await p.locator('#words .next-part button').click(); if (await vis() !== 'sat') bad('next → sat ' + await vis());
      await p.locator('.steps a[data-step="write"]').click(); if (await vis() !== 'write') bad('tab → write ' + await vis());
      await p.reload(); if (await vis() !== 'write') bad('remember part ' + await vis());
      await p.screenshot({ path: require('path').join(SHOTS, 'light_lesson.png'), fullPage: true });
      await p.goto(base + 'course/lesson.html?id=C04'); await p.locator('.steps a[data-step="sat"]').click(); await p.screenshot({ path: require('path').join(SHOTS, 'light_sat.png'), fullPage: true });
      // flow: wrong answers in C05 → office → progress retry
      await p.evaluate(() => { localStorage.removeItem('nz_exp_C05'); });
      await p.goto(base + 'course/lesson.html?id=C05');
      await answerAll(p, [0, 5]);
      await p.locator('textarea').fill('Overall, the population of Marsh End grew, and the most significant change was among residents aged 65 and over, whereas the youngest group changed only slightly.');
      await p.goto(base + 'course/office.html?id=C05');
      await p.evaluate(() => document.querySelectorAll('.fold-body').forEach(x => x.hidden = false)); const mis = await p.locator('.q.mis').count(); if (mis !== 2) bad('office mistakes ' + mis);
      await p.locator('.q.mis select').first().selectOption({ index: 3 });
      for (const c of ['TR', 'LR']) await p.locator(`input[name="pr-${c}"][value="fix"]`).check();
      await p.locator('button', { hasText: 'Показать, что нашёл' }).click();
      const f = await p.locator('#peer .exp > b').first().textContent(); if (!/2 из 2/.test(f)) bad('peer score ' + f);
      const summ = await p.locator('pre.summary').textContent(); if (!/2 \/ 2|Peer review: нашёл\(ла\) 2 из 2/.test(summ) || !/Связки|связки/.test(summ)) bad('summary ' + summ.slice(0, 200));
      console.log('--- summary ---\n' + summ.split('\n').slice(0, 8).join('\n'));
      await p.locator('label.check input').check();
      await p.goto(base + 'course/progress.html');
      await p.evaluate(() => document.querySelectorAll('.fold-body').forEach(x => x.hidden = false)); const rcards = await p.locator('#retry-C05 .q').count(); if (rcards !== 2) bad('retry ' + rcards);
      for (let i = 0; i < rcards; i++) { const q = p.locator('#retry-C05 .q').nth(i); const stem = await q.locator('.stem').textContent();
        const k = await p.evaluate(stem => { for (const pt of window.LESSONS.C05.parts) if (pt.items) for (const q of pt.items) if (q.stem === stem) return q.kind === 'tfng' ? ({ T: 'TRUE', F: 'FALSE', NG: 'NOT GIVEN' })[q.key] : 'ABCD'[q.key] + ') ' + q.opts[q.key]; }, stem);
        await q.locator('.opt', { hasText: k }).first().click(); }
      await p.reload(); await p.evaluate(() => document.querySelectorAll('.fold-body').forEach(x => x.hidden = false));
      const row = await p.locator('tr#C05 td').allTextContents(); console.log('C05 grid', row.join(' | '));
      if (!(row[1] === '✓' && row[2] === '✓' && row[3] === '✓')) bad('grid C05 ' + row);
      await p.screenshot({ path: require('path').join(SHOTS, 'progress.png'), fullPage: true });
      await p.goto(base + 'course/office.html?id=C05'); await p.screenshot({ path: require('path').join(SHOTS, 'office.png'), fullPage: true });
      await p.goto(base + 'course/index.html'); await p.waitForTimeout(200); await p.screenshot({ path: require('path').join(SHOTS, 'light_course.png'), fullPage: true }); await p.goto(base + 'course/progress.html'); await p.screenshot({ path: require('path').join(SHOTS, 'light_progress.png'), fullPage: true });
    }
    if (name === 'w360') { await p.goto(base + 'course/slides.html?id=C06#s9'); await p.screenshot({ path: require('path').join(SHOTS, 'sl_phone.png'), fullPage: true }); }
    if (errs.length) bad(name + ' errors: ' + [...new Set(errs)].join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(fails ? fails + ' FAILS' : 'ALL OK');
})();
