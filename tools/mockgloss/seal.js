// Encrypts private/mockgloss.json with the site's master key inside a logged-in page and writes docs/data/mockgloss.bin,
// then checks that the site decrypts it.  LOGIN=... PW=... [BASE=...] node seal.js
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const json = fs.readFileSync((process.env.PRIV || __dirname + '/private') + '/mockgloss.json', 'utf8'); JSON.parse(json);
  const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto((process.env.BASE || 'https://study.bynurzy.com') + '/mock.html'); await p.waitForSelector('#auth-login');
  await p.fill('#auth-login', process.env.LOGIN); await p.fill('#auth-pw', process.env.PW); await p.click('#auth-go');
  await p.waitForFunction(() => !document.getElementById('auth'), null, { timeout: 30000 });
  const out = await p.evaluate(async (text) => {
    const raw = Uint8Array.from(atob(sessionStorage.getItem('site_key')), (c) => c.charCodeAt(0));
    const k = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt']), iv = crypto.getRandomValues(new Uint8Array(12));
    const bytes = new Uint8Array([...iv, ...new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(text)))]);
    const back = JSON.parse(new TextDecoder().decode(await SITE.open(bytes)));   // the site can read it
    return { b64: btoa(String.fromCharCode(...bytes)), words: Object.keys(back.words).length, add: Object.keys(back.add).length };
  }, json);
  fs.writeFileSync('/home/user/nurzycom_brand/docs/data/mockgloss.bin', Buffer.from(out.b64, 'base64'));
  console.log('mockgloss.bin written:', out.words, 'words,', out.add, 'questions with extra words');
  await b.close();
})();
