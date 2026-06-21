/* Smoke pós-merge: Path (upstream) + Surpresas (nossa) convivendo no mesmo bundle */
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('404')) errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await page.goto('http://localhost:8123/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=🎲 Simular 1 Copa', { timeout: 120000 });
  await page.locator('button', { hasText: /^▶/ }).first().click(); // não há mais auto-run: dispara o MC
  await page.waitForSelector('text=Por Grupo', { timeout: 120000 });
  await page.waitForTimeout(800);
  await page.click('text=🔀 Cruzam.');
  await page.click('text=Path');
  await page.waitForTimeout(500);
  const pathBody = await page.locator('body').innerText();
  console.log(pathBody.includes('Path') ? '✅ sub-aba Path renderiza' : '❌ Path');
  await page.click('text=Surpresas');
  await page.waitForTimeout(500);
  const surBody = await page.locator('body').innerText();
  console.log(/surpresa|bits|Nenhum resultado/i.test(surBody) ? '✅ sub-aba Surpresas renderiza' : '❌ Surpresas');
  await page.click('text=📝 Resultados');
  await page.locator('span').filter({ hasText: /[▶▼] Grupo/ }).first().click();
  await page.waitForSelector('text=⏱️ Probabilidade ao vivo', { timeout: 5000 });
  console.log('✅ card ao vivo abre');
  console.log(errs.length === 0 ? '✅ zero erros de console' : '❌ erros: ' + JSON.stringify(errs.slice(0, 3)));
  await browser.close();
  process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('CRASH:', e.message); process.exit(2); });
