const { chromium } = require('./node_modules/playwright-core');
const EXE = '/root/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome';
(async () => {
  const browser = await chromium.launch({
    executablePath: EXE,
    headless: false,
    args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--no-zygote', '--disable-gpu']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  try {
    await page.goto('http://localhost:8823/game.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
    console.log('DOMCONTENTLOADED OK');
    await page.waitForTimeout(5000);
    const info = await page.evaluate(() => ({
      title: document.title,
      ready: document.readyState,
      hasCharModal: !!document.getElementById('charModal'),
      loadingHide: document.getElementById('dzLoading')?.classList.contains('hide')
    }));
    console.log('INFO:', JSON.stringify(info));
  } catch(e){ console.log('ERR:', e.message.split('\n')[0]); }
  console.log('PAGE ERRORS:', errs.slice(0,5).join(' | ') || 'none');
  await browser.close();
  console.log('DONE');
})().catch(e=>{ console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
