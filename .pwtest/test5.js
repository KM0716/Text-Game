const { chromium } = require('./node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--disable-dev-shm-usage','--no-zygote'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  // Block all JS to avoid renderer crash during game init; CSS still loads so we verify styling on the real wizard DOM.
  await page.route('**/*.js', r => r.abort());
  try {
    await page.goto('http://localhost:8823/game.html', { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('LOADED (JS blocked)');
    // Show wizard + its panel for computed-style checks
    await page.evaluate(() => {
      const ld = document.getElementById('dzLoading'); if (ld) ld.classList.add('hide');
      document.getElementById('charModal').style.display = 'flex';
      document.querySelector('[data-tab="tab-char"]')?.click();
    });
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const g = (id) => document.getElementById(id);
      const cs = (id) => { const e=g(id); return e?getComputedStyle(e):null; };
      const pick = (s,k) => s?{
        borderRadius: s.borderRadius, bg: s.backgroundColor, border: s.borderTopWidth+' '+s.borderTopStyle,
        font: (s.fontFamily||'').split(',')[0], fontSize: s.fontSize, display: s.display,
        appearance: s.appearance, padding: s.padding
      }:null;
      const inp = cs('charName');
      const sel = cs('charGender');
      const lbl = document.querySelector('#tab-char label');
      const h4 = document.querySelector('#tab-char h4');
      const hint = document.querySelector('#tab-char .field-hint');
      const cb = g('charAiEnabled');
      const cbs = cb ? getComputedStyle(cb) : null;
      const swRow = cb ? cb.closest('.dz-switch-row') : null;
      const sbArrow = document.querySelector('.sandbox-subgroup h5'); // may not exist without JS render
      return {
        charName: pick(inp,''),
        charGender: sel?{appearance:sel.appearance, bg:sel.backgroundColor, hasSvg:(sel.backgroundImage||'').indexOf('data:image')>=0, fontSize:sel.fontSize}:null,
        label: lbl?{display:getComputedStyle(lbl).display, fontSize:getComputedStyle(lbl).fontSize}:null,
        h4: h4?{fontSize:getComputedStyle(h4).fontSize, borderLeftW:getComputedStyle(h4).borderLeftWidth}:null,
        hint: hint?{fontStyle:getComputedStyle(hint).fontStyle, borderLeftStyle:getComputedStyle(hint).borderLeftStyle}:null,
        checkbox: cbs?{width:cbs.width,height:cbs.height,padding:cbs.padding,borderTopWidth:cbs.borderTopWidth,backgroundColor:cbs.backgroundColor}:null,
        switchRow: swRow?{display:getComputedStyle(swRow).display}:null,
        hostExists: !!g('sandboxInlineHost'),
        formBodyExists: !!g('sandboxFormBody')
      };
    });
    console.log('CSS_CHECK:', JSON.stringify(r, null, 1));
    await page.screenshot({ path: 'shot-css.png' });
  } catch(e){ console.log('ERR:', e.message.split('\n')[0]); }
  await browser.close();
  console.log('DONE');
})().catch(e=>{ console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
