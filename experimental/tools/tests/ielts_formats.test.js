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
  { // table completion (C04), flow chart (C06), table on a writing part (C05)
    const p = await b.newPage({ viewport: { width: 360, height: 760 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + 'lesson.html?id=C04'); await p.evaluate(() => document.querySelectorAll('.part').forEach(x => x.hidden = false));
    if (await p.locator('#ielts .qgroup .dtab tbody tr').count() !== 4) bad('C04 group table');
    await p.goto(base + 'lesson.html?id=C06'); await p.evaluate(() => document.querySelectorAll('.part').forEach(x => x.hidden = false));
    if (await p.locator('#ielts .flow li').count() !== 4) bad('C06 flow chart');
    await p.locator('#ielts .qgroup').nth(1).screenshot({ path: require('path').join(SHOTS, 'c06_flow_phone.png') });
    await p.goto(base + 'lesson.html?id=C05'); await p.evaluate(() => document.querySelectorAll('.part').forEach(x => x.hidden = false));
    if (await p.locator('#write .dtab tbody tr').count() !== 4) bad('C05 writing table');
    await p.goto(base + 'lesson.html?id=C07'); await p.evaluate(() => { localStorage.removeItem('nz_exp_C07'); }); await p.reload(); await p.evaluate(() => document.querySelectorAll('.part').forEach(x => x.hidden = false));
    const yq = p.locator('#ielts .q').first(); const yl = (await yq.locator('.opt').allTextContents()).map(t => t.trim()).join('|');
    if (yl !== 'YES|NO|NOT GIVEN') bad('C07 Yes/No/Not Given labels ' + yl);
    await yq.locator('.opt', { hasText: /^\s*YES\s*$/ }).click();                                  // wrong (key NO)
    if (!(await yq.locator('.opt.wrong').count())) bad('C07 YNNG strike');
    const lab = await p.evaluate(() => { const q = window.LESSONS.C07.parts.find(x => x.id === 'ielts').items[0]; return window.NZ.label(q, 'T') + '/' + window.NZ.keyLabel(q); });
    if (lab !== 'YES/NO') bad('C07 label() ' + lab);
    // C12 listening: form (group table), plan labelling (places + SVG), speaker labels not read aloud
    await p.addInitScript(() => { window.__said = []; window.speechSynthesis.speak = u => window.__said.push(u.text + '|' + u.pitch); window.speechSynthesis.getVoices = () => []; });
    await p.goto(base + 'lesson.html?id=C12'); await p.evaluate(() => document.querySelectorAll('.part').forEach(x => x.hidden = false));
    if (await p.locator('#listen .plan svg').count() !== 1) bad('C12 plan svg');
    if (await p.locator('#listen .qgroup .dtab tbody tr').count() !== 5) bad('C12 form table');
    const pq = p.locator('#listen .q').nth(4); if (await pq.locator('.opt').count() !== 8) bad('C12 plan options');
    const lab12 = await p.evaluate(() => { const it = window.LESSONS.C12.parts[0].items; return window.NZ.keyLabel(it[4], window.NZ.items('C12')[4].heads); });
    if (lab12 !== 'Place A') bad('C12 label ' + lab12);
    await p.locator('#listen button', { hasText: 'Слушать' }).first().click();
    const said = await p.evaluate(() => window.__said);
    if (!said.length || said.some(x => /^(Narrator|Assistant|Tom|Dana): /.test(x))) bad('C12 speaker labels read aloud ' + said.slice(0, 2));
    if (new Set(said.map(x => x.split('|')[1])).size < 3) bad('C12 voices not varied');
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 1) bad('overflow C05');
    if (errs.length) bad(errs.join(' | ')); await p.close();
  }
  await b.close(); console.log(fails ? fails + ' FAILS' : 'ALL OK');
})();
