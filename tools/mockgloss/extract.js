// Logs in to the live course site with a student account and saves the decrypted mock tests and vocabulary to the
// scratchpad (private, never the repo). The master key stays inside the browser page.  LOGIN=... PW=... node extract.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = (process.env.PRIV || __dirname + '/private'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto((process.env.BASE || 'https://study.bynurzy.com') + '/mock.html'); await p.waitForSelector('#auth-login');
  await p.fill('#auth-login', process.env.LOGIN); await p.fill('#auth-pw', process.env.PW); await p.click('#auth-go');
  await p.waitForFunction(() => !document.getElementById('auth'), null, { timeout: 30000 });
  const data = await p.evaluate(async () => {
    const mocks = await SITE.json('mocks'), vocab = await SITE.json('vocab'), bundles = {};
    for (const m of mocks.mocks) for (const s of m.sections) if (!bundles[s.b]) bundles[s.b] = JSON.parse(new TextDecoder().decode(await SITE.open(await (await fetch(s.b)).arrayBuffer())));
    let gloss = null; try { gloss = await SITE.json('mockgloss'); } catch (e) { /* not there yet */ }
    return { mocks, vocab, bundles, gloss };
  });
  for (const [k, v] of Object.entries(data)) fs.writeFileSync(`${OUT}/${k}.json`, JSON.stringify(v));
  console.log('mocks', data.mocks.mocks.length, '| bundles', Object.keys(data.bundles).length, '| vocab lessons', data.vocab.lessons.length);
  await b.close();
})();
