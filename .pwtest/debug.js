const { chromium } = require('./node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  page.on('console', m => { if (m.type()==='error') errs.push('CONS: ' + m.text()); });
  try {
    await page.goto('http://localhost:8823/game.html', { waitUntil: 'commit', timeout: 20000 });
    console.log('COMMIT OK');
    await page.waitForTimeout(6000);
    const info = await page.evaluate(() => ({
      title: document.title,
      ready: document.readyState,
      hasCharModal: !!document.getElementById('charModal'),
      loadingHidden: document.getElementById('dzLoading')?.classList.contains('hide')
    }));
    console.log('INFO:', JSON.stringify(info));
  } catch(e){ console.log('GOTO ERR:', e.message.split('\n')[0]); }
  console.log('PAGE ERRORS:', errs.slice(0,5).join(' | ') || 'none');
  await page.screenshot({ path: 'dbg.png' });
  await browser.close();
  console.log('DONE');
})().catch(e=>{ console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
