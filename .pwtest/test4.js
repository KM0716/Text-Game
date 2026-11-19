const { chromium } = require('./node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--disable-gpu','--mute-audio','--disable-features=AudioServiceOutOfProcess'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  page.on('console', m => { if (m.type()==='error') errs.push('CONS: ' + m.text()); });
  try {
    await page.goto('http://localhost:8823/game.html', { waitUntil: 'commit', timeout: 20000 });
    console.log('COMMIT OK');
    await page.waitForTimeout(9000);
    const info = await page.evaluate(() => ({
      ready: document.readyState,
      title: document.title,
      charModal: !!document.getElementById('charModal'),
      host: !!document.getElementById('sandboxInlineHost'),
      body: !!document.getElementById('sandboxFormBody')
    })).catch(e => ({ evalErr: e.message.split('\n')[0] }));
    console.log('INFO:', JSON.stringify(info));
  } catch(e){ console.log('ERR:', e.message.split('\n')[0]); }
  console.log('ERRORS:', errs.slice(0,6).join(' | ') || 'none');
  await browser.close();
  console.log('DONE');
})().catch(e=>{ console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
