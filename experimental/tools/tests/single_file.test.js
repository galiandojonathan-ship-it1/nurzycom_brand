const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let fails = 0; const bad = m => { fails++; console.log('FAIL', m); };
  for (const vp of [{ width: 360, height: 760 }, { width: 1280, height: 860 }]) {
    const p = await b.newPage({ viewport: vp }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + require('path').resolve(process.argv[2] || 'NURZYCOM_experimental_site.html'));
    if (await p.locator('#map-list .st').count() !== 16) bad('map');
    // every live lesson: map → slides (walk) → homework (all keys) → office → progress
    for (const id of ['C01','C02','C03','C04','C05','C06','C07','C12']) {
      await p.evaluate(() => window.__go('course'));
      await p.locator(`#map-list .cadlinks a[href="slides.html?id=${id}"]`).click();
      const n = await p.locator('.slide').count(); for (let i = 0; i < n; i++) await p.keyboard.press('ArrowRight');
      await p.locator('.cad a', { hasText: 'Домашнее' }).click();
            await p.evaluate(() => document.querySelectorAll('.part').forEach(x => x.hidden = false)); const k = await require('./answer_all.js').answerAll(p); const qs = p.locator('.q');
            const sc = (await p.locator('.score').textContent()).trim(); if (sc !== `${k} / ${k}`) bad(id + ' ' + sc);
      await p.locator('a', { hasText: 'Шаг 3 · Office hours' }).click(); if (!(await p.locator('#peer').count())) bad(id + ' office'); await p.evaluate(() => document.querySelectorAll('.fold-body').forEach(x => x.hidden = false));
      await p.locator('a', { hasText: 'Шаг 4 · Прогресс' }).last().click(); if (!(await p.locator('#grid').count())) bad(id + ' progress'); await p.evaluate(() => document.querySelectorAll('.fold-body').forEach(x => x.hidden = false));
      const row = await p.locator(`tr#${id} td`).allTextContents(); if (row[0] !== '✓' || row[1] !== '✓' || row[3] !== '✓') bad(id + ' grid ' + row.join('|'));
      console.log(vp.width, id, sc, row.join(' '));
    }
    await p.evaluate(() => document.querySelectorAll('.fold-body').forEach(x => x.hidden = false)); await p.locator('#checkins a', { hasText: 'Пройти' }).first().click(); if (!(await p.locator('.q').count())) bad('D0');
    await p.evaluate(() => window.__go('en')); if (!(await p.locator('h1').textContent()).includes('Scores')) bad('en');
    await p.locator('.lang').click(); if (!(await p.locator('h1').textContent()).includes('Баллы')) bad('ru');
    await p.locator('a', { hasText: 'Демо курса' }).first().click(); if (!(await p.locator('#cad-steps li').count())) bad('course cad');
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 1) bad('overflow');
    if (errs.length) bad(errs.join(' | ')); await p.close();
  }
  await b.close(); console.log(fails ? fails + ' FAILS' : 'ALL OK');
})();
