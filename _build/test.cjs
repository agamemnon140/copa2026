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
  grab('const pp = (l, k)', 'return p; };'),
  grab('const LIVE_F2', ';'),
  grab('const liveRemFrac = (tau, s1, s2', 'return Math.max(0, (Z - W) / Z);\n};'),
  grab('const fmtClock = (tau, s1)', "`90+${Math.round(tau - 90 - s1)}'`;"),
  grab('const mulberry32 = (a)', '/ 4294967296;\n};'),
  grab('const makeRnd = (seed, key)', '>>> 0);'),
  grab('const sP = (l, rnd', 'return 7; };'),
  // stubs para liveProbs
  'const cL = () => ({ la: 1.5, lb: 1.1 });',
  'const matchTilt = () => 0;',
  grab('const liveProbs = (a, b, tA, tB,', 'scores, pOf };\n};'),
].join('\n');
const { liveRemFrac, fmtClock, liveProbs, makeRnd, sP } = eval(code + '\n;({ liveRemFrac, fmtClock, liveProbs, makeRnd, sP });');

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
chk('τ=0: laR+lbR = la+lb (2.6)', Math.abs(lp0.laR + lp0.lbR - 2.6) < 1e-9, (lp0.laR + lp0.lbR).toFixed(4));
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

console.log(fail === 0 ? '\nTODOS OS TESTES PASSARAM' : `\n${fail} TESTE(S) FALHARAM`);
process.exit(fail ? 1 : 0);
