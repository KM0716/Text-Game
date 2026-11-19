const { chromium } = require('./node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--disable-dev-shm-usage','--no-zygote'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:8823/.pwtest/harness.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => ({ done: window.__HARNESS_DONE, log: window.__HARNESS_LOG }));
  console.log(JSON.stringify(result, null, 1));
  await browser.close();
})().catch(e=>{ console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
