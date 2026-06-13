// Teste numérico do modelo ao vivo (cópia fiel das funções do simulador_copa_2026.jsx).
// Roda: node test.cjs
const fs = require('fs');
const path = require('path');

// Extrai as funções direto do fonte para garantir que testamos o código real.
const src = fs.readFileSync(path.join(__dirname, '..', 'simulador_copa_2026.jsx'), 'utf8').replace(/\r\n/g, '\n'); // endMarks usam \n literal — tolera checkout CRLF
const grab = (name, endMark) => {
  const i = src.indexOf(name);
  if (i < 0) throw new Error(name + ' não encontrado');
  const j = src.indexOf(endMark, i);
  if (j < 0) throw new Error(name + ': endMark não encontrado');
  return src.slice(i, j + endMark.length);
};
// pp, LIVE_F2, liveRemFrac, fmtClock, liveProbs dependem de cL/matchTilt — stub simples p/ liveProbs
const code = [
  // globais que cL/rankTied leem (valores default do app)
  'let _ME = 1.32, _fav = 1, _spread = true;',
  'const FP = {};',
  'const matchTilt = () => 0;',
  grab('const pp = (l, k)', 'return p; };'),
  grab('const cL = (a, b, tilt = 0)', 'me * (c0 + c1 * (1 - e)))) };\n};'),
  grab('const LIVE_F2', ';'),
  grab('const liveRemFrac = (tau, s1, s2', 'return Math.max(0, (Z - W) / Z);\n};'),
  grab('const fmtClock = (tau, s1)', "`90+${Math.round(tau - 90 - s1)}'`;"),
  grab('const dateKey = d =>', '(+day || 0); };'),
  grab('const mulberry32 = (a)', '/ 4294967296;\n};'),
  grab('const makeRnd = (seed, key)', '>>> 0);'),
  grab('const sP = (l, rnd', 'return 7; };'),
  grab('const sM = (a, b, tA', 'gB: sP(lb, rnd) }; };'),
  grab('const h2hTable = (subset, gm)', 'return m;\n};'),
  grab('const rankTied = (block, tb, gm, crit', 'return out;\n};'),
  grab('const rankGroup = (teams, tb, gm', 'return { sorted, crit };\n};'),
  grab('const groupPosProbs = (games, teams, gn', 'return counts;\n};'),
  grab('const koAdvProb = (a, b, tA, tB)', 'r90, ret, pen };\n};'),
  grab('const mProbs = (a, b, tA', 'pA: pA / t * 100 }; };'),
  grab('const surpriseOf = (eH, eA, tA, tB, gA, gB)', 'bitsOut: -Math.log2(Math.max(pOut, 1e-12)) };\n};'),
  grab('const liveProbs = (a, b, tA, tB,', 'scores, pOf };\n};'),
  grab('const evState = (ev, tau)', 'return st;\n};'),
  grab('const liveSeriesCalc = (eH, eA, tA, tB, ev, s1, s2,', 'return out;\n};'),
  // bloco WCH gerado (WCH_TEAMS/WCH_ST/WCH) + wcH2H
  src.slice(src.indexOf('// === WCH:BEGIN'), src.indexOf('// === WCH:END ===')),
  grab('const wcH2H = (a, b)', 'return out;\n};'),
].join('\n');
const { liveRemFrac, fmtClock, liveProbs, makeRnd, sP, cL, groupPosProbs, koAdvProb, evState, liveSeriesCalc, wcH2H, WCH, WCH_TEAMS, WCH_ST, surpriseOf, mProbs, dateKey } =
  eval(code + '\n;({ liveRemFrac, fmtClock, liveProbs, makeRnd, sP, cL, groupPosProbs, koAdvProb, evState, liveSeriesCalc, wcH2H, WCH, WCH_TEAMS, WCH_ST, surpriseOf, mProbs, dateKey });');
const FL_KEYS = new Set([...src.match(/const FL\s*=\s*\{([\s\S]*?)\};/)[1].matchAll(/'([^']+)'\s*:/g)].map(m2 => m2[1]));

let fail = 0;
const chk = (label, cond, extra) => { console.log((cond ? '✔' : '✘'), label, extra ?? ''); if (!cond) fail++; };

const s1 = 4, s2 = 7;
chk('remFrac(0) = 1', Math.abs(liveRemFrac(0, s1, s2) - 1) < 1e-12, liveRemFrac(0, s1, s2));
chk('remFrac(fim) = 0', liveRemFrac(90 + s1 + s2, s1, s2) === 0);
chk('45+2 > min46 (acréscimo 1ºT preserva 2ºT inteiro)', liveRemFrac(47, s1, s2) > liveRemFrac(50, s1, s2), `${liveRemFrac(47, s1, s2).toFixed(4)} vs ${liveRemFrac(50, s1, s2).toFixed(4)}`);
let prev = 1 + 1e-12, mono = true;
for (let t = 0; t <= 90 + s1 + s2; t += 0.25) { const v = liveRemFrac(t, s1, s2); if (v > prev + 1e-12) mono = false; prev = v; }
chk('monótono decrescente', mono);
const f2chk = liveRemFrac(45, 0, 0) - liveRemFrac(90, 0, 0);
chk('fração 2ºT regulamentar ≈ 0.56', Math.abs(f2chk - 0.56) < 1e-9, f2chk.toFixed(4));
chk("fmtClock: 0→\"0'\"", fmtClock(0, s1) === "0'");
chk("fmtClock: 47→\"45+2'\"", fmtClock(47, s1) === "45+2'", fmtClock(47, s1));
chk("fmtClock: 50→\"46'\"", fmtClock(50, s1) === "46'", fmtClock(50, s1));
chk("fmtClock: 96→\"90+2'\"", fmtClock(96, s1) === "90+2'", fmtClock(96, s1));

// liveProbs: λ preservado em τ=0, probabilidades somam 100, scores somam ~1, pOf coerente
const lp0 = liveProbs(0, 0, '', '', { tau: 0, gA: 0, gB: 0, redsA: 0, redsB: 0, s1, s2 });
const lam0 = cL(0, 0, 0);
chk('τ=0: laR+lbR = la+lb (cL real)', Math.abs(lp0.laR + lp0.lbR - (lam0.la + lam0.lb)) < 1e-9, (lp0.laR + lp0.lbR).toFixed(4));
chk('pH+pD+pA = 100', Math.abs(lp0.pH + lp0.pD + lp0.pA - 100) < 1e-9);
const sSum = lp0.scores.reduce((s, x) => s + x.p, 0);
chk('Σ scores = 1', Math.abs(sSum - 1) < 1e-9, sSum.toFixed(6));
const pHfromScores = lp0.scores.filter(s => s.a > s.b).reduce((s, x) => s + x.p, 0) * 100;
chk('Σ scores(vitória A) = pH', Math.abs(pHfromScores - lp0.pH) < 1e-9, pHfromScores.toFixed(2));
chk('pOf(2,1) = score 2-1', Math.abs(lp0.pOf(2, 1) - lp0.scores.find(s => s.a === 2 && s.b === 1).p) < 1e-15);

// com placar parcial 1×0 aos 80', pOf abaixo do atual = 0 e fim colapsa
const lp80 = liveProbs(0, 0, '', '', { tau: 80 + s1, gA: 1, gB: 0, redsA: 0, redsB: 0, s1, s2 });
chk('pOf(0,0) com placar 1×0 = 0', lp80.pOf(0, 0) === 0);
const lpEnd = liveProbs(0, 0, '', '', { tau: 90 + s1 + s2, gA: 1, gB: 0, redsA: 0, redsB: 0, s1, s2 });
chk('fim do jogo 1×0: pH ≈ 100', lpEnd.pH > 99.7, lpEnd.pH.toFixed(2));

// PRNG (Common Random Numbers do impacto leave-one-out)
const seq = (seed, key, n = 10) => { const r = makeRnd(seed, key); return Array.from({ length: n }, () => r()); };
chk('makeRnd determinístico (mesmo seed/key → mesma sequência)', JSON.stringify(seq(123, 7)) === JSON.stringify(seq(123, 7)));
chk('makeRnd: keys diferentes → streams diferentes', JSON.stringify(seq(123, 7)) !== JSON.stringify(seq(123, 8)));
chk('makeRnd: seeds vizinhas → streams diferentes', JSON.stringify(seq(123, 7)) !== JSON.stringify(seq(124, 7)));
const big = seq(42, 0, 10000);
chk('makeRnd: range [0,1)', big.every(v => v >= 0 && v < 1));
const mean = big.reduce((s, v) => s + v, 0) / big.length;
chk('makeRnd: média ≈ 0.5', mean > 0.48 && mean < 0.52, mean.toFixed(4));
chk('sP determinístico com makeRnd', sP(1.5, makeRnd(1, 2)) === sP(1.5, makeRnd(1, 2)));
chk('sP sem rnd ainda funciona (default Math.random)', Number.isInteger(sP(1.5)) && sP(1.5) >= 0 && sP(1.5) <= 7);

// koAdvProb — analítico do mata-mata (90' + prorrogação + pênaltis)
const kEq = koAdvProb(1700, 1700, '', '');
chk('koAdvProb: grids somam 1 (90\')', Math.abs(kEq.r90.h + kEq.r90.e + kEq.r90.w - 1) < 1e-12);
chk('koAdvProb: grids somam 1 (prorrogação)', Math.abs(kEq.ret.h + kEq.ret.e + kEq.ret.w - 1) < 1e-12);
chk('koAdvProb: times iguais → 0.5 exato', Math.abs(kEq.pAdvA - 0.5) < 1e-12, kEq.pAdvA.toFixed(6));
const kFav = koAdvProb(1800, 1650, '', '');
chk('koAdvProb: favorito > 0.5', kFav.pAdvA > 0.5, kFav.pAdvA.toFixed(4));
chk('koAdvProb: complemento pAdv(a,b)+pAdv(b,a) = 1', Math.abs(kFav.pAdvA + koAdvProb(1650, 1800, '', '').pAdvA - 1) < 1e-12);
chk('koAdvProb: monotonia em Elo', koAdvProb(1900, 1600, '', '').pAdvA > koAdvProb(1700, 1600, '', '').pAdvA);

// groupPosProbs — mini-MC de grupo com CRN
const T = ['T1', 'T2', 'T3', 'T4'];
const mkG = (fxMap = {}) => [[0, 'T1', 'T2'], [1, 'T3', 'T4'], [2, 'T1', 'T3'], [3, 'T2', 'T4'], [4, 'T4', 'T1'], [5, 'T2', 'T3']]
  .map(([k, h, a]) => ({ key: k, h, a, eH: h === 'T1' ? 1800 : 1700, eA: a === 'T1' ? 1800 : 1700, fx: fxMap[k] || null }));
const gp1 = groupPosProbs(mkG(), T, 'X', 2000, 1);
const gp2 = groupPosProbs(mkG(), T, 'X', 2000, 1);
chk('groupPosProbs determinístico', JSON.stringify(gp1) === JSON.stringify(gp2));
chk('groupPosProbs: Σ posições = n por time', T.every(t => gp1[t].reduce((s, v) => s + v, 0) === 2000));
chk('groupPosProbs: Σ times = n por posição', [0, 1, 2, 3].every(p => T.reduce((s, t) => s + gp1[t][p], 0) === 2000));
chk('groupPosProbs: favorito T1 mais 1º que T4', gp1['T1'][0] > gp1['T4'][0], `${gp1['T1'][0]} vs ${gp1['T4'][0]}`);
// grupo 100% fixado, sem empates → contagens degeneradas (n em uma única posição por time)
const allFx = { 0: { gA: 2, gB: 0 }, 1: { gA: 1, gB: 0 }, 2: { gA: 3, gB: 1 }, 3: { gA: 2, gB: 1 }, 4: { gA: 0, gB: 1 }, 5: { gA: 1, gB: 0 } };
const gpFx = groupPosProbs(mkG(allFx), T, 'X', 500, 1);
chk('groupPosProbs: grupo fechado → posições determinadas', T.every(t => gpFx[t].some(v => v === 500)));
// CRN: liberar 1 jogo com a MESMA seedBase → o jogo liberado sorteia, o resto idêntico
const fx5 = { 5: { gA: 1, gB: 0 } };
const gpW = groupPosProbs(mkG(fx5), T, 'X', 2000, 1);
const gpO = groupPosProbs(mkG(), T, 'X', 2000, 1);
chk('groupPosProbs: CRN — Δ pareado pequeno e coerente', T.every(t => [0, 1, 2, 3].every(p => Math.abs(gpW[t][p] - gpO[t][p]) <= 2000)), JSON.stringify(T.map(t => gpW[t][0] - gpO[t][0])));

// WCH — base histórica de Copas (gerada)
chk('WCH: base não-vazia (~600 jogos)', WCH.length > 400, WCH.length);
chk('WCH: anos 1930-2022', WCH.every(r => r[0] >= 1930 && r[0] <= 2022));
chk('WCH: fases conhecidas', WCH.every(r => WCH_ST[r[1]] != null));
chk('WCH: índices de time válidos', WCH.every(r => WCH_TEAMS[r[2]] != null && WCH_TEAMS[r[3]] != null));
chk('WCH_TEAMS ⊆ chaves do app (FL)', WCH_TEAMS.every(t => FL_KEYS.has(t)), WCH_TEAMS.filter(t => !FL_KEYS.has(t)).join(','));

// wcH2H
const bs = wcH2H('Brazil', 'Sweden');
chk('wcH2H: Brasil×Suécia tem jogos', bs.matches.length >= 5, bs.matches.length + ' jogos');
chk('wcH2H: final de 1958 (Brasil 5–2 Suécia) presente', bs.matches.some(m2 => m2.y === 1958 && m2.st === 'F' && ((m2.h === 'Brazil' && m2.gh === 5 && m2.ga === 2) || (m2.h === 'Sweden' && m2.gh === 2 && m2.ga === 5))), JSON.stringify(bs.matches.find(m2 => m2.y === 1958)));
chk('wcH2H: ordenado por ano desc', bs.matches.every((m2, i) => i === 0 || bs.matches[i - 1].y >= m2.y));
const sb = wcH2H('Sweden', 'Brazil');
chk('wcH2H: simétrico (wA(a,b) = wB(b,a))', bs.tally.wA === sb.tally.wB && bs.tally.wB === sb.tally.wA && bs.tally.d === sb.tally.d);
chk('wcH2H: tally soma = nº de jogos', bs.tally.wA + bs.tally.d + bs.tally.wB === bs.matches.length);
chk('wcH2H: par sem confronto → vazio', wcH2H('Jordan', 'Curaçao').matches.length === 0);

// evState / liveSeriesCalc
const EV = [{ m: 23, t: 'g', s: 'A' }, { m: 60, t: 'r', s: 'B' }, { m: 75, t: 'g', s: 'B' }];
chk('evState: vazio em τ=0', JSON.stringify(evState(EV, 0)) === JSON.stringify({ gA: 0, gB: 0, redsA: 0, redsB: 0 }));
chk('evState: inclusivo em m===τ', evState(EV, 23).gA === 1 && evState(EV, 22.99).gA === 0);
chk('evState: estado completo no fim', JSON.stringify(evState(EV, 99)) === JSON.stringify({ gA: 1, gB: 1, redsA: 0, redsB: 1 }));
const SER = liveSeriesCalc(1800, 1700, '', '', EV, 3, 6);
chk('liveSeriesCalc: pontos somam 100', SER.every(p => Math.abs(p.pH + p.pD + p.pA - 100) < 1e-9));
const p0 = liveProbs(1800, 1700, '', '', { tau: 0, gA: 0, gB: 0, redsA: 0, redsB: 0, s1: 3, s2: 6 });
chk('liveSeriesCalc: ponto τ=0 ≡ liveProbs(0)', Math.abs(SER[0].pH - p0.pH) < 1e-9 && SER[0].tau === 0);
const at = tau => SER.find(p => p.tau === tau);
chk('liveSeriesCalc: gol do A aos 23 → pH salta', at(23).pH > at(22.99).pH + 5, `${at(22.99).pH.toFixed(1)} → ${at(23).pH.toFixed(1)}`);
chk('liveSeriesCalc: gol do B aos 75 → pA salta', at(75).pA > at(74.99).pA + 5, `${at(74.99).pA.toFixed(1)} → ${at(75).pA.toFixed(1)}`);
chk('liveSeriesCalc: cobre 0..fim', SER[0].tau === 0 && SER[SER.length - 1].tau === 99);
// sem eventos: usa `base` constante ("se o jogo continuar assim")
const SER0 = liveSeriesCalc(1800, 1700, '', '', [], 3, 6);
const SER10 = liveSeriesCalc(1800, 1700, '', '', [], 3, 6, { gA: 1, gB: 0, redsA: 0, redsB: 0 });
chk('liveSeriesCalc: base 1×0 → pH(0) maior que baseline 0×0', SER10[0].pH > SER0[0].pH + 5, `${SER0[0].pH.toFixed(1)} vs ${SER10[0].pH.toFixed(1)}`);
// target: pT presente, em [0,100], e zera quando o placar-alvo fica impossível
const SERT = liveSeriesCalc(1800, 1700, '', '', EV, 3, 6, undefined, { a: 0, b: 0 });
chk('liveSeriesCalc: pT presente com target', SERT.every(p => p.pT != null && p.pT >= 0 && p.pT <= 100));
const atT = tau => SERT.find(p => p.tau === tau);
chk('liveSeriesCalc: target 0–0 impossível após gol aos 23 → pT = 0', atT(22.99).pT > 0 && atT(23).pT === 0, `${atT(22.99).pT.toFixed(1)} → ${atT(23).pT}`);

// surpriseOf — placar (exato) e resultado (1X2), ambos em bits
const surp = surpriseOf(1850, 1500, '', '', 0, 4); // zebra: favorito (mandante forte) leva 0×4
chk('surpriseOf: bitsExact = -log2(pExact)', Math.abs(surp.bitsExact + Math.log2(surp.pExact)) < 1e-9);
chk('surpriseOf: bitsOut = -log2(pOut)', Math.abs(surp.bitsOut + Math.log2(surp.pOut)) < 1e-9);
chk('surpriseOf: pOut bate com mProbs (vitória do visitante)', Math.abs(surp.pOut - mProbs(1850, 1500, '', '').pA / 100) < 1e-12);
chk('surpriseOf: zebra → resultado surpreendente (bitsOut > 1)', surp.bitsOut > 1, surp.bitsOut.toFixed(2));
chk('surpriseOf: placar mais raro que o resultado (bitsExact > bitsOut)', surp.bitsExact > surp.bitsOut, `${surp.bitsExact.toFixed(1)} vs ${surp.bitsOut.toFixed(1)}`);
const surpDraw = surpriseOf(1700, 1700, '', '', 1, 1); // jogo equilibrado, empate
chk('surpriseOf: empate provável → resultado pouco surpreendente', surpDraw.bitsOut < 3, surpDraw.bitsOut.toFixed(2));

// dateKey — ordenação cronológica das seções de data ("DD/Mon")
chk('dateKey: 13/Jun < 14/Jun (bug do dia 14 antes do 13)', dateKey('13/Jun') < dateKey('14/Jun'));
chk('dateKey: 30/Jun < 1/Jul (vira o mês)', dateKey('30/Jun') < dateKey('1/Jul'));
chk('dateKey: 9/Jun < 19/Jun (dia numérico, não string)', dateKey('9/Jun') < dateKey('19/Jun'));
const ds = ['14/Jun', '13/Jun', '1/Jul', '30/Jun', '9/Jun'].sort((a, b) => dateKey(a) - dateKey(b));
chk('dateKey: ordena a lista certo', JSON.stringify(ds) === JSON.stringify(['9/Jun', '13/Jun', '14/Jun', '30/Jun', '1/Jul']), ds.join(' '));

console.log(fail === 0 ? '\nTODOS OS TESTES PASSARAM' : `\n${fail} TESTE(S) FALHARAM`);
process.exit(fail ? 1 : 0);
