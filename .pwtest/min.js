const { chromium } = require('./node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--disable-dev-shm-usage','--no-zygote'] });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:8823/.pwtest/min.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const r = await page.evaluate(() => ({ title: document.title, h: document.getElementById('t').textContent, v: document.getElementById('i').value }));
    console.log('RESULT:', JSON.stringify(r));
  } catch(e){ console.log('ERR:', e.message.split('\n')[0]); }
  await browser.close();
  console.log('DONE');
})().catch(e=>{ console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
