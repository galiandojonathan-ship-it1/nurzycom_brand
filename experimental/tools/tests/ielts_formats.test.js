const SHOTS = process.env.SHOTS || require('os').tmpdir();
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:8791/course/';
(async () => {
  const b = await chromium.launch(); let fails = 0; const bad = m => { fails++; console.log('FAIL', m); };
  for (const vp of [{ width: 360, height: 760 }, { width: 1280, height: 860 }]) {
    const p = await b.newPage({ viewport: vp }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + 'lesson.html?id=C01'); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.locator('.steps a[data-step="ielts"]').click();
    const sec = p.locator('#ielts');
    if (await sec.locator('.qgroup').count() !== 3) bad('groups');
    if (await sec.locator('.heads li').count() !== 8) bad('headings list');
    if (await sec.locator('.lettered').count() !== 7) bad('lettered paras');
    const qs = sec.locator('.q');
    await qs.nth(0).locator('.opt', { hasText: /^\s*vii\s*$/ }).click();              // wrong heading (key iii)
    await qs.nth(1).locator('.opt', { hasText: /^\s*v\s*$/ }).click();                // right
    await qs.nth(9).locator('input').fill('a very short walk'); await qs.nth(9).locator('button', { hasText: 'Ответить' }).click(); // over limit + wrong
    await qs.nth(10).locator('input').fill('Diagram.'); await qs.nth(10).locator('input').press('Enter');   // right, case+punct
    await qs.nth(11).locator('input').fill('walking times'); await qs.nth(11).locator('button', { hasText: 'Ответить' }).click();
    const st = await p.evaluate(() => JSON.parse(localStorage.getItem('nz_exp_C01')).ans);
    const r = await p.evaluate(() => { const L = window.LESSONS.C01, it = L.parts.find(x => x.id === 'ielts').items, a = JSON.parse(localStorage.getItem('nz_exp_C01')).ans;
      return [0, 1, 9, 10, 11].map(i => window.NZ.ok(it[i], a['ielts.' + i])); });
    if (JSON.stringify(r) !== '[false,true,false,true,true]') bad('ok() ' + JSON.stringify(r));
    if (!(await qs.nth(9).locator('.exp').textContent()).includes('Answer: short walk')) bad('gap key shown');
    if (!(await qs.nth(0).locator('.opt.wrong').count())) bad('heading strike');
    if (vp.width === 360) await sec.screenshot({ path: require('path').join(SHOTS, 'c01_ielts_phone.png') });
    else await sec.screenshot({ path: require('path').join(SHOTS, 'c01_ielts_desk.png') });
    // office + retry show the new kinds
    await p.goto(base + 'office.html?id=C01'); await p.evaluate(() => document.querySelectorAll('.fold-body').forEach(x => x.hidden = false));
    const mtxt = await p.locator('#mistakes').textContent();
    if (!/vii · The cost of producing/.test(mtxt) || !/iii · Why the first maps/.test(mtxt) || !/a very short walk/.test(mtxt)) bad('office labels: ' + mtxt.slice(0, 300));
    await p.goto(base + 'progress.html#retry'); await p.evaluate(() => document.querySelectorAll('.fold-body').forEach(x => x.hidden = false));
    const box = p.locator('#retry-C01');
    if (await box.locator('.q').count() !== 2) bad('retry count ' + await box.locator('.q').count());
    await box.locator('.opt', { hasText: /^iii ·/ }).click();
    await box.locator('input.gap-in').fill('short walk'); await box.locator('input.gap-in').press('Enter');
    const fixed = await p.evaluate(() => JSON.parse(localStorage.getItem('nz_exp_retry_C01')));
    if (!fixed || Object.keys(fixed).length !== 2) bad('retry saved ' + JSON.stringify(fixed));
    await p.reload(); await p.evaluate(() => document.querySelectorAll('.fold-body').forEach(x => x.hidden = false));
    const rows = await p.locator('#skills tbody tr').allTextContents(); console.log(vp.width, rows.filter(t => /headings|completion/.test(t)).join(' | '));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 1) bad('overflow');
    if (errs.length) bad(errs.join(' | ')); await p.close();
  }
  await b.close(); console.log(fails ? fails + ' FAILS' : 'ALL OK');
})();
