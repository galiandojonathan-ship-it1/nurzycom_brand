// shared helper: answer every question on a lesson page with the key (or with a wrong answer for chosen indexes)
module.exports.answerAll = async (p, wrongIdx = []) => {
  await p.evaluate(() => document.querySelectorAll('.part').forEach(x => x.hidden = false));
  const plan = await p.evaluate(() => {
    const L = window.LESSONS[(new URLSearchParams(location.search).get('id') || (window.__ROUTE || '').split(':')[1] || '').toUpperCase()];
    const out = []; L.parts.forEach(pt => { if (pt.type !== 'questions') return; let heads = null;
      pt.items.forEach(q => { if (q.group && q.group.headings) heads = q.group.headings; if (q.group && q.group.paras) heads = 'ABCDEFGHIJ'.slice(0, q.group.paras).split('');
        if (q.kind === 'gap') out.push({ gap: q.accept[0], bad: 'zzz' });
        else if (q.kind === 'match') { const lab = k => window.NZ.isLetters(heads) ? heads[k] : window.NZ.ROMAN[k]; out.push({ label: lab(q.key), badLabel: lab((q.key + 1) % heads.length) }); }
        else if (q.kind === 'tfng') out.push({ label: ({ T: 'TRUE', F: 'FALSE', NG: 'NOT GIVEN' })[q.key], badLabel: q.key === 'T' ? 'FALSE' : 'TRUE' });
        else out.push({ label: q.opts[q.key], badLabel: q.opts[(q.key + 1) % q.opts.length] }); }); });
    return out; });
  const qs = p.locator('.q'); const n = await qs.count();
  if (n !== plan.length) throw new Error('q count ' + n + ' vs ' + plan.length);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (let i = 0; i < n; i++) {
    const it = plan[i], bad = wrongIdx.includes(i), q = qs.nth(i);
    if (it.gap !== undefined) { await q.locator('input.gap-in').fill(bad ? it.bad : it.gap); await q.locator('button', { hasText: 'Ответить' }).click(); }
    else await q.locator('.opt').filter({ hasText: new RegExp('^\\s*[A-D]?\\s*' + esc(bad ? it.badLabel : it.label) + '\\s*$') }).first().click();
  }
  return n;
};
