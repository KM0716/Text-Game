const { chromium } = require('./node_modules/playwright-core');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto('http://localhost:8823/game.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(7000);

  await page.evaluate(() => {
    const ld = document.getElementById('dzLoading'); if (ld) ld.classList.add('hide');
    const cm = document.getElementById('charModal');
    cm.classList.add('is-first');
    cm.style.display = 'flex';
  });
  await page.waitForTimeout(600);

  const report = await page.evaluate(() => {
    const r = {};
    const host = document.getElementById('sandboxInlineHost');
    const body = document.getElementById('sandboxFormBody');
    r.hostHasForm = host.contains(body);
    r.sandboxRendered = document.getElementById('sandboxContainer').children.length;
    r.writingGuidelines = !!document.getElementById('writingGuidelinesContainer').innerHTML.trim();
    const inp = document.getElementById('charName');
    const cs = getComputedStyle(inp);
    r.inputStyle = { borderRadius: cs.borderRadius, bg: cs.backgroundColor, borderW: cs.borderTopWidth, font: cs.fontFamily.split(',')[0] };
    const sel = document.getElementById('charGender');
    const ss = getComputedStyle(sel);
    r.selectStyle = { appearance: ss.appearance, hasSvg: (ss.backgroundImage || '').indexOf('data:image') >= 0 };
    const lbl = document.querySelector('#tab-char label');
    r.labelStyle = { fontSize: getComputedStyle(lbl).fontSize, display: getComputedStyle(lbl).display };
    const h4 = document.querySelector('#tab-char h4');
    r.h4Style = { fontSize: getComputedStyle(h4).fontSize, borderLeftW: getComputedStyle(h4).borderLeftWidth };
    const hint = document.querySelector('#tab-char .field-hint');
    r.hintStyle = { fontStyle: getComputedStyle(hint).fontStyle, borderLeftStyle: getComputedStyle(hint).borderLeftStyle };
    const cb = document.getElementById('charAiEnabled');
    const cbs = getComputedStyle(cb);
    r.checkbox = { w: cbs.width, h: cbs.height, pad: cbs.padding };
    const swRow = cb.closest('.dz-switch-row');
    r.switchRowDisplay = getComputedStyle(swRow).display;
    return r;
  });
  console.log('REPORT:', JSON.stringify(report, null, 1));

  await page.click('[data-tab="tab-char"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'shot-tab-char.png' });

  await page.click('[data-tab="tab-sandbox"]');
  await page.waitForTimeout(300);
  const sb = await page.evaluate(() => ({
    formInWizard: document.getElementById('sandboxInlineHost').contains(document.getElementById('sandboxFormBody')),
    groups: document.querySelectorAll('#sandboxContainer .sandbox-subgroup').length,
    tabActive: document.getElementById('tab-sandbox').classList.contains('active')
  }));
  console.log('SANDBOX-TAB:', JSON.stringify(sb));
  await page.screenshot({ path: 'shot-tab-sandbox.png' });

  await page.click('[data-tab="tab-ai"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'shot-tab-ai.png' });

  await page.click('[data-tab="tab-world"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'shot-tab-world.png' });

  await page.evaluate(() => { document.getElementById('charModal').style.display = 'none'; });
  await page.waitForTimeout(300);
  const back = await page.evaluate(() => ({
    formBackInModal: document.getElementById('sandboxModal').contains(document.getElementById('sandboxFormBody'))
  }));
  console.log('AFTER-CLOSE:', JSON.stringify(back));

  await page.evaluate(() => { document.getElementById('btnSideSandbox').click(); });
  await page.waitForTimeout(300);
  const modalState = await page.evaluate(() => ({
    modalOpen: document.getElementById('sandboxModal').style.display === 'flex',
    containerInModal: document.getElementById('sandboxModal').contains(document.getElementById('sandboxContainer'))
  }));
  console.log('INGAME-MODAL:', JSON.stringify(modalState));
  await page.screenshot({ path: 'shot-sandbox-modal.png' });

  await page.evaluate(() => { document.getElementById('sandboxModal').style.display = 'none'; });
  await page.evaluate(() => { document.getElementById('settingsModal').style.display = 'flex'; });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'shot-settings.png' });

  console.log('ERRORS:', errors.length ? errors.slice(0, 8).join(' | ') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
