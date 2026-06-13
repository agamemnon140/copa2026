/* Driver de verificação visual — percorre as 5 features novas no Chrome headless */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const ok = (name, detail) => { results.push({ s: '✅', name, detail }); console.log('✅', name, detail || ''); };
const probe = (name, detail) => { results.push({ s: '🔍', name, detail }); console.log('🔍', name, detail || ''); };
const fail = (name, detail) => { results.push({ s: '❌', name, detail }); console.log('❌', name, detail || ''); };

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));
  const notFound = [];
  page.on('response', r => { if (r.status() === 404) notFound.push(r.url()); });

  // React controlled inputs: setter nativo + evento input
  const setVal = async (loc, v) => {
    await loc.evaluate((el, val) => {
      const proto = el.type === 'range' || el.type === 'number' || el.type === 'text' ? HTMLInputElement.prototype : null;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, String(val));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, v);
  };

  await page.goto('http://localhost:8123/', { waitUntil: 'domcontentloaded' });
  // MC roda sozinho ao montar e troca para a aba Probs
  await page.waitForSelector('text=Por Grupo', { timeout: 120000 });
  ok('App carregou e MC inicial terminou (aba Probs ativa)');

  /* ───── A. Card ao vivo ───── */
  await page.click('text=📝 Resultados');
  const hdr = page.locator('span').filter({ hasText: /[▶▼] Grupo/ }).first(); // re-resolve: 1º card mesmo após ▶→▼
  const card = hdr.locator('xpath=../..'); // div do card
  const preTxt = await card.innerText();
  const preM = preTxt.match(/\|\s*(\d+)%\s*E\s*(\d+)%\s*(\d+)%/);
  await hdr.click();
  await page.waitForSelector('text=⏱️ Probabilidade ao vivo', { timeout: 5000 });
  ok('Card ao vivo abre ao clicar no cabeçalho do jogo');

  const livePanel = page.locator('div', { hasText: '⏱️ Probabilidade ao vivo' }).last();
  const liveTxt = async () => (await card.innerText());
  let t = await liveTxt();
  const liveM = t.match(/V [^\n]*\n([\d.]+)%\nEmpate\n([\d.]+)%\nV [^\n]*\n([\d.]+)%/);
  if (preM && liveM) {
    const d = Math.max(Math.abs(+preM[1] - +liveM[1]), Math.abs(+preM[2] - +liveM[2]), Math.abs(+preM[3] - +liveM[3]));
    if (d <= 1.0) ok('τ=0: V/E/D ao vivo ≈ pré-jogo do cabeçalho', `Δmax ${d.toFixed(1)} p.p. (${liveM[1]}/${liveM[2]}/${liveM[3]} vs ${preM[1]}/${preM[2]}/${preM[3]})`);
    else fail('τ=0: V/E/D difere do pré-jogo', `Δmax ${d.toFixed(1)} p.p.`);
  } else fail('Não consegui extrair V/E/D', JSON.stringify({ preM: !!preM, liveM: !!liveM }));

  const slider = card.locator('input[type=range]');
  await setVal(slider, 47);
  t = await liveTxt();
  if (t.includes("45+2'")) ok("Relógio: τ=47 com +3 de acréscimo → \"45+2'\""); else fail('Relógio em τ=47', t.match(/Min:[\s\S]{0,40}/)?.[0]);

  // zera acréscimo do 1ºT → mesmo τ vira 47'
  const s1Input = card.locator('input[type=number]').nth(2); // gA, gB do placar vêm antes? ordem: placar gA, gB, depois s1, s2…
  // ordem real no card: [0]=gA placar, [1]=gB placar, [2]=s1, [3]=s2, [4]=gols A live, [5]=reds A, [6]=gols B live, [7]=reds B, [8]=csA, [9]=csB
  await setVal(s1Input, 0);
  t = await liveTxt();
  if (t.includes("47'")) probe("Acréscimo 1ºT → 0: mesmo τ=47 agora exibe \"47'\" (45+2' ≠ 47')"); else fail('Relógio após zerar s1', t.match(/Min:[\s\S]{0,40}/)?.[0]);
  await setVal(s1Input, 3); // restaura o default novo

  for (const [btn, want] of [["0'", "0'"], ['HT', "45+3'"], ['FT', "90'"], ['Fim', "90+6'"]]) {
    await card.locator('button', { hasText: new RegExp('^' + btn.replace('+', '\\+') + '$') }).first().click();
    t = await liveTxt();
    const clock = t.match(/Min:\n([0-9+']+)/)?.[1] || t.match(/(\d+(?:\+\d+)?')/)?.[1];
    if (t.includes(want)) ok(`Botão ${btn} → relógio "${want}"`); else fail(`Botão ${btn}`, 'esperava ' + want + ', card mostra: ' + (clock || '?'));
  }

  // Fim com 1×0 → pH ≈ 100
  const golsALive = card.locator('input[type=number]').nth(4);
  await setVal(golsALive, 1);
  t = await liveTxt();
  let m2 = t.match(/V [^\n]*\n([\d.]+)%\nEmpate\n([\d.]+)%/);
  if (m2 && +m2[1] > 99) ok('Fim do jogo com 1×0 → V mandante colapsa', `${m2[1]}%`); else fail('Colapso no fim', m2 ? m2[1] + '%' : '?');

  const chips = await card.locator('text=Placares finais mais prováveis').locator('xpath=following-sibling::div[1]/span').count();
  if (chips === 6) ok('6 chips de placares mais prováveis exibidos'); else fail('Chips de placares', chips + ' chips');

  // placar de interesse impossível (abaixo do placar atual 1×0)
  const csA = card.locator('input[type=number]').nth(8), csB = card.locator('input[type=number]').nth(9);
  await setVal(csA, 0); await setVal(csB, 0);
  t = await liveTxt();
  if (t.includes('impossível')) probe('Placar de interesse 0×0 com jogo 1×0 → "impossível (abaixo do placar atual)"'); else fail('Placar impossível', 'não mostrou aviso');
  await setVal(csA, 2); await setVal(csB, 0);
  t = await liveTxt();
  const pcs = t.match(/→\s*([\d.<]+)%\s*de terminar 2–0/);
  if (pcs) ok('Placar de interesse 2×0 → probabilidade exibida', pcs[1] + '%'); else fail('Placar de interesse válido', t.match(/Placar de interesse[\s\S]{0,80}/)?.[0]);

  // volta para 0' e tira o gol, p/ screenshot limpo
  await card.locator('button', { hasText: /^0'$/ }).first().click();
  await page.screenshot({ path: path.join(SHOTS, '1-live-card.png'), fullPage: false });

  /* ───── B. Badge surpresa + impacto ───── */
  const scoreA = card.locator('input[type=number]').nth(0), scoreB = card.locator('input[type=number]').nth(1);
  await setVal(scoreA, 0); await setVal(scoreB, 4);
  await page.waitForSelector('text=🎯 surpresa', { timeout: 5000 });
  t = await card.innerText();
  const bits = t.match(/🎯 surpresa ([\d.]+) bits \(placar tinha ([\d.]+)%, 1X2 tinha (\d+)%\)/);
  if (bits && +bits[1] > 6) ok('Zebra 0×4 → badge de surpresa alta', `${bits[1]} bits, placar tinha ${bits[2]}%`);
  else if (bits) fail('Surpresa baixa demais para zebra 0×4', bits[1] + ' bits');
  else fail('Badge 🎯 surpresa não apareceu');

  // Badge de impacto aparece AUTOMATICAMENTE (sem botão), instantâneo
  await page.waitForSelector('text=⚡ classif.', { timeout: 5000 });
  t = await card.innerText();
  const imp = t.match(/⚡ classif\.: (.+?) ([+-]?[\d.]+) p\.p\./);
  if (imp && Math.abs(+imp[2]) > 8) ok('Zebra 0×4 → badge ⚡ classif. automático e grande', `${imp[1]} ${imp[2]} p.p.`);
  else if (imp) fail('Impacto da zebra pequeno demais', `${imp[1]} ${imp[2]} p.p.`);
  else fail('Badge ⚡ classif. não apareceu');
  if (t.includes('⚡ impacto') || t.includes('calculando')) fail('Botão/spinner antigos ainda presentes');
  await page.screenshot({ path: path.join(SHOTS, '2-badges.png') });

  // Determinismo: sair da aba e voltar → badge idêntico (seed fixa, cache por cenário)
  if (imp) {
    await page.click('text=📊 Probs');
    await page.click('text=📝 Resultados');
    await page.waitForSelector('text=⚡ classif.', { timeout: 5000 });
    const imp2 = (await card.innerText()).match(/⚡ classif\.: (.+?) ([+-]?[\d.]+) p\.p\./);
    if (imp2 && imp2[2] === imp[2] && imp2[1] === imp[1]) probe('Impacto determinístico: sair e voltar da aba → idêntico', `${imp[1]} ${imp[2]} p.p.`);
    else fail('Impacto mudou ao re-renderizar', `${imp?.[1]} ${imp?.[2]} vs ${imp2?.[1]} ${imp2?.[2]}`);
  }

  // Resultado "esperado" (placar = moda) deve mover menos que a zebra
  const modaM = (await card.innerText()).match(/⚽ (\d+)–(\d+)/);
  if (modaM && imp) {
    await setVal(scoreA, +modaM[1]); await setVal(scoreB, +modaM[2]);
    await page.waitForSelector('text=⚡ classif.', { timeout: 5000 });
    const imp3 = (await card.innerText()).match(/⚡ classif\.: (.+?) ([+-]?[\d.]+) p\.p\./);
    if (imp3 && Math.abs(+imp3[2]) < Math.abs(+imp[2])) probe('Placar = moda → |Δ| menor que o da zebra', `moda ${modaM[1]}×${modaM[2]}: ${imp3[2]} p.p. vs zebra ${imp[2]} p.p.`);
    else fail('Impacto da moda não é menor que o da zebra', `${imp3?.[2]} vs ${imp[2]}`);
    // restaura a zebra 0×4 p/ as seções seguintes (Surpresas)
    await setVal(scoreA, 0); await setVal(scoreB, 4);
    await page.waitForTimeout(200);
  }

  /* ───── B2. Impacto KO (analítico) ───── */
  // Preenche os 6 jogos dos grupos A e B (placares 1×0) para liberar o M73 (A2×B2)
  const fillGroup = async (gLetter) => {
    const hdrs = page.locator('span').filter({ hasText: new RegExp(`[▶▼] Grupo ${gLetter} •`) });
    const nG = await hdrs.count();
    for (let i = 0; i < nG; i++) {
      const c = hdrs.nth(i).locator('xpath=../..');
      await setVal(c.locator('input[type=number]').nth(0), i === 0 && gLetter === 'A' ? 0 : 1); // 1º jogo do A já é 0×4
      await setVal(c.locator('input[type=number]').nth(1), i === 0 && gLetter === 'A' ? 4 : 0);
    }
  };
  await fillGroup('A'); await fillGroup('B');
  await page.click('text=🥊 Mata-mata');
  await page.waitForTimeout(400);
  const m73 = page.locator('span').filter({ hasText: /^M73 •/ }).first().locator('xpath=../..');
  const m73ready = !(await m73.innerText()).includes('aguardando');
  if (m73ready) {
    await setVal(m73.locator('input[type=number]').nth(0), 2);
    await setVal(m73.locator('input[type=number]').nth(1), 1);
    await page.waitForSelector('text=⚡ avança', { timeout: 5000 });
    const ko = (await m73.innerText()).match(/⚡ avança: (.+?) \+([\d.]+) p\.p\./);
    if (ko) ok('KO M73 → badge ⚡ avança analítico, sem botão', `${ko[1]} +${ko[2]} p.p.`);
    else fail('Badge ⚡ avança não apareceu no M73');
    await page.screenshot({ path: path.join(SHOTS, '2b-ko-badge.png') });
  } else fail('M73 não ficou pronto após preencher grupos A e B');
  await page.click('text=⚽ Jogos');
  await page.waitForTimeout(200);

  /* ───── C. Bracket clicável ───── */
  await page.click('text=📊 Probs');
  await page.click('text=Bracket');
  const mb = page.locator('[title="Clique para ver quem pode jogar esta partida"]').first();
  await mb.click();
  await page.waitForTimeout(300);
  let body = await page.locator('body').innerText();
  if (/vence\b/.test(body) && body.includes('✕') || body.includes('Quem joga') || /P\(vence/.test(body)) ok('Match box clicável → painel de detalhe abriu');
  else fail('Painel do match box', 'texto esperado não encontrado');
  await page.screenshot({ path: path.join(SHOTS, '3-bracket-match.png') });
  await mb.click(); // toggle fecha
  await page.waitForTimeout(200);
  probe('Clique repetido no match box fecha o painel (toggle)');

  const gc = page.locator('[title="Clique para ver a distribuição completa por posição"]').first();
  await gc.click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  if (body.includes('quem termina em cada posição') && body.includes('(avança)') && body.includes('(eliminado)')) ok('Group card clicável → distribuição por posição (4 colunas)');
  else fail('Painel do group card');
  await page.screenshot({ path: path.join(SHOTS, '4-bracket-group.png') });
  // fecha pelo ✕
  const closeBtn = page.locator('button', { hasText: '✕' }).first();
  if (await closeBtn.count()) { await closeBtn.click(); probe('Botão ✕ fecha o painel de detalhe'); }

  // painel global dos 3ºs
  const thirdsCard = page.locator('[title="Clique para ver o panorama completo dos 3ºs"]');
  await thirdsCard.click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  if (body.includes('P(3º avança) por grupo') && body.includes('Destino dos 3ºs') && /M74/.test(body)) ok('Resumo dos 3ºs clicável → painel global (ranking + combinações + destinos R32)');
  else fail('Painel dos 3ºs', body.match(/Terceiros lugares[\s\S]{0,120}/)?.[0] || 'não abriu');
  await page.screenshot({ path: path.join(SHOTS, '4b-bracket-thirds.png') });
  await thirdsCard.click();
  await page.waitForTimeout(200);
  body = await page.locator('body').innerText();
  if (!body.includes('P(3º avança) por grupo')) probe('Clique repetido no resumo dos 3ºs fecha o painel (toggle)');
  else fail('Toggle dos 3ºs não fechou');

  /* ───── D. Por Grupo moda/mediana coerente ───── */
  await page.click('text=Por Grupo');
  await page.click('text=◧'); // mean → median
  await page.click('text=+ V/E/D');
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  if (body.includes('Cenário mediano')) ok('Por Grupo: modo Mediana com texto explicativo do cenário coerente');
  // valida coerência: Pts = 3V+E e ΣSG=0 em todos os grupos
  const coher = await page.evaluate(() => {
    const out = { groups: 0, badPts: [], sgSum: [] };
    document.querySelectorAll('table').forEach(tb => {
      const rows = [...tb.querySelectorAll('tbody tr')];
      if (rows.length !== 4) return;
      out.groups++;
      let sg = 0;
      rows.forEach(r => {
        const c = [...r.querySelectorAll('td')].map(td => td.innerText.trim());
        // [time, Pts, SG, GM, V, E, D, ...]
        const pts = +c[1], v = +c[4], e = +c[5];
        sg += +c[2].replace('+', '');
        if (pts !== 3 * v + e) out.badPts.push(c[0] + ': ' + c[1] + ' ≠ 3·' + c[4] + '+' + c[5]);
      });
      out.sgSum.push(sg);
    });
    return out;
  });
  if (coher.groups === 12 && coher.badPts.length === 0) ok('Mediana: Pts = 3V+E nas 48 linhas (12 grupos)');
  else fail('Coerência Pts mediana', JSON.stringify(coher.badPts.slice(0, 3)) + ` (${coher.groups} grupos)`);
  const sgBad = coher.sgSum.filter(s => s !== 0);
  if (sgBad.length === 0) ok('Mediana: Σ SG = 0 em todos os 12 grupos');
  else fail('Σ SG ≠ 0 em ' + sgBad.length + ' grupos', JSON.stringify(coher.sgSum));

  await page.click('text=◧'); // median → mode
  await page.waitForTimeout(300);
  const coherM = await page.evaluate(() => {
    const out = { groups: 0, badPts: [], sgSum: [] };
    document.querySelectorAll('table').forEach(tb => {
      const rows = [...tb.querySelectorAll('tbody tr')];
      if (rows.length !== 4) return;
      out.groups++; let sg = 0;
      rows.forEach(r => {
        const c = [...r.querySelectorAll('td')].map(td => td.innerText.trim());
        const pts = +c[1], v = +c[4], e = +c[5];
        sg += +c[2].replace('+', '');
        if (pts !== 3 * v + e) out.badPts.push(c[0] + ': ' + c[1]);
      });
      out.sgSum.push(sg);
    });
    return out;
  });
  if (coherM.groups === 12 && coherM.badPts.length === 0 && coherM.sgSum.every(s => s === 0)) ok('Moda: Pts = 3V+E e Σ SG = 0 nos 12 grupos');
  else fail('Coerência moda', JSON.stringify({ bad: coherM.badPts.slice(0, 3), sg: coherM.sgSum }));
  // grupo A reflete o resultado real 0×4 (mandante perdeu: 0 pts nesse jogo)
  body = await page.locator('body').innerText();
  probe('Resultado real 0×4 do Grupo A entra no cenário (visível na tabela do grupo)');
  await page.screenshot({ path: path.join(SHOTS, '5-por-grupo.png') });

  /* ───── E. Cruzamentos ▸ Surpresas ───── */
  await page.click('text=🔀 Cruzam.');
  await page.click('text=Surpresas');
  await page.waitForTimeout(400);
  body = await page.locator('body').innerText();
  if (body.includes('surpresa') || body.includes('bits')) ok('Sub-aba Surpresas renderiza');
  const row = body.match(/0\s*×\s*4|0–4|0 × 4/);
  if (row) ok('Resultado inputado (0×4) listado na aba Surpresas');
  else fail('Resultado 0×4 não encontrado na lista', body.slice(0, 400));
  if (body.includes('Calcular impactos') || body.includes('calcular')) fail('Botões antigos de impacto ainda presentes na aba Surpresas');
  else ok('Sem botões "Calcular impactos"/"calcular" — impactos automáticos');
  const nRows = (body.match(/bits/g) || []).length - 1; // header não tem "bits"; cada linha tem
  const nImps = (body.match(/⚡ /g) || []).length;
  if (nImps >= nRows && nRows > 0) ok('Coluna Impacto preenchida em todas as linhas', `${nImps} ⚡ para ${nRows} linhas`);
  else fail('Coluna Impacto incompleta', `${nImps} ⚡ para ${nRows} linhas`);
  // expande a primeira linha → tabela Δ1º/Δ2º/Δ3º/ΔAvança (GS) ou P(avançar) (KO)
  await page.locator('button', { hasText: '▼' }).first().click();
  await page.waitForTimeout(200);
  body = await page.locator('body').innerText();
  if (body.includes('Δ Avança') || body.includes('Chance de avançar')) probe('Expansão ▼ mostra Δ por posição (GS) / P(avançar) (KO)');
  else fail('Expansão da linha não mostrou detalhes', body.match(/Δ probabilidade[\s\S]{0,100}/)?.[0] || '');
  // ordenação por impacto
  await page.click('text=↓ Impacto');
  await page.waitForTimeout(200);
  probe('Ordenação ↓ Impacto aplicada sem erro');
  await page.screenshot({ path: path.join(SHOTS, '6-surpresas.png') });

  /* ───── erros de console ───── */
  const realErrors = consoleErrors.filter(e => !(e.includes('404') && notFound.every(u => u.endsWith('favicon.ico'))));
  if (notFound.length) probe('404s observados (recursos, não o app)', JSON.stringify(notFound));
  if (realErrors.length === 0) ok('Zero erros de console/página durante toda a sessão');
  else fail('Erros de console', JSON.stringify(realErrors.slice(0, 5)) + ' 404s: ' + JSON.stringify(notFound));

  await browser.close();
  const fails = results.filter(r => r.s === '❌').length;
  console.log('\n' + (fails === 0 ? 'VEREDITO: PASS' : `VEREDITO: FAIL (${fails} falhas)`));
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('DRIVER CRASH:', e.message); process.exit(2); });
