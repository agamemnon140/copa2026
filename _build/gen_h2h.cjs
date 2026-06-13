// Gera a base de confrontos históricos de Copas (WCH) e splica no simulador_copa_2026.jsx.
// Fonte: Fjelstul World Cup Database (CC-BY 4.0) — https://github.com/jfjelstul/worldcup
// Uso: node gen_h2h.cjs [--csv caminho.csv]   (sem --csv: usa wc_matches.csv local ou baixa)
const fs = require('fs');
const path = require('path');

const CSV_URL = 'https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/matches.csv';
const REPO = path.join(__dirname, '..');
const JSX = path.join(REPO, 'simulador_copa_2026.jsx');
const LOCAL_CSV = path.join(__dirname, 'wc_matches.csv');

// Aliases: nome na base → chave do app (sucessores oficiais FIFA quando aplicável)
const ALIAS = {
  'United States': 'USA',
  'West Germany': 'Germany',
  'Czechoslovakia': 'Czechia',
  'Czech Republic': 'Czechia',
  'Turkey': 'Türkiye',
  'Côte d’Ivoire': 'Ivory Coast',
  "Côte d'Ivoire": 'Ivory Coast',
  'Zaire': 'DR Congo',
  'Korea Republic': 'South Korea',
  'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
  'Cabo Verde': 'Cape Verde',
};
const STAGE = {
  'group stage': 'G',
  'first group stage': 'G',
  'second group stage': 'G2',
  'first round': 'R1',
  'second round': 'R2',
  'final round': 'FR',
  'round of 16': 'R16',
  'quarter-finals': 'QF',
  'semi-finals': 'SF',
  'third place match': 'TP',
  'third-place match': 'TP',
  'final': 'F',
};

// Parser CSV mínimo com suporte a campos entre aspas
const parseCSV = (text) => {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field !== '' || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows;
};
const truthy = v => v === '1' || v === 'TRUE' || v === 'true';

(async () => {
  // 1) CSV
  const argCsv = process.argv.indexOf('--csv');
  let csvPath = argCsv >= 0 ? process.argv[argCsv + 1] : (fs.existsSync(LOCAL_CSV) ? LOCAL_CSV : null);
  let text;
  if (csvPath) { text = fs.readFileSync(csvPath, 'utf8'); console.log('CSV local:', csvPath); }
  else {
    console.log('Baixando', CSV_URL);
    const res = await fetch(CSV_URL);
    if (!res.ok) throw new Error('download falhou: ' + res.status);
    text = await res.text();
    fs.writeFileSync(LOCAL_CSV, text);
  }

  const rows = parseCSV(text);
  const hdr = rows[0];
  const col = {};
  ['tournament_name', 'stage_name', 'replay', 'match_date', 'home_team_name', 'away_team_name',
    'home_team_score', 'away_team_score', 'extra_time', 'penalty_shootout',
    'home_team_score_penalties', 'away_team_score_penalties'].forEach(c => {
      col[c] = hdr.indexOf(c);
      if (col[c] < 0) throw new Error('coluna ausente no CSV: ' + c + ' (schema mudou?)');
    });

  // 2) Chaves do app: extraídas do FL={...} do jsx (fonte única de verdade)
  const jsx = fs.readFileSync(JSX, 'utf8');
  const flM = jsx.match(/const FL\s*=\s*\{([\s\S]*?)\};/);
  if (!flM) throw new Error('const FL não encontrado no jsx');
  const appTeams = new Set([...flM[1].matchAll(/'([^']+)'\s*:/g)].map(m => m[1]));
  console.log('Times do app:', appTeams.size);
  if (appTeams.size < 50) throw new Error('extração de FL suspeita (' + appTeams.size + ' chaves)');

  // 3) Filtra e compacta
  const norm = n => ALIAS[n] || n;
  const discarded = new Map();
  const kept = [];
  const unknownStages = new Set();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < hdr.length) continue;
    if (!/^\d{4} FIFA Men's World Cup$/.test(r[col.tournament_name])) continue;
    const year = +r[col.tournament_name].slice(0, 4);
    const h = norm(r[col.home_team_name]), a = norm(r[col.away_team_name]);
    if (!appTeams.has(h) || !appTeams.has(a)) {
      [h, a].filter(t => !appTeams.has(t)).forEach(t => discarded.set(t, (discarded.get(t) || 0) + 1));
      continue;
    }
    const st = STAGE[r[col.stage_name]];
    if (!st) { unknownStages.add(r[col.stage_name]); continue; }
    const gh = +r[col.home_team_score], ga = +r[col.away_team_score];
    const pen = truthy(r[col.penalty_shootout]) ? r[col.home_team_score_penalties] + '-' + r[col.away_team_score_penalties]
      : truthy(r[col.extra_time]) ? 1 : 0;
    const rep = truthy(r[col.replay]) ? 1 : 0;
    kept.push({ year, st, h, a, gh, ga, pen, rep, date: r[col.match_date] });
  }
  if (unknownStages.size) throw new Error('stage_name desconhecido(s): ' + [...unknownStages].join(' | ') + ' — adicione ao mapa STAGE');
  console.log('Jogos mantidos (ambos times no app):', kept.length);
  console.log('Times descartados (fora dos ' + appTeams.size + '):', [...discarded.entries()].map(([t, c]) => `${t}(${c})`).join(', '));

  // 4) Compacta com tabela de índices
  kept.sort((x, y) => x.year - y.year || (x.date < y.date ? -1 : 1));
  const teams = [...new Set(kept.flatMap(k => [k.h, k.a]))].sort();
  const ti = Object.fromEntries(teams.map((t, i) => [t, i]));
  const rowsJs = kept.map(k => {
    const base = [k.year, `'${k.st}'`, ti[k.h], ti[k.a], k.gh, k.ga, typeof k.pen === 'string' ? `'${k.pen}'` : k.pen];
    if (k.rep) base.push(1);
    return '[' + base.join(',') + ']';
  });
  const block = [
    '// === WCH:BEGIN (gerado por _build/gen_h2h.cjs — não editar à mão) ===',
    '// Confrontos de Copas do Mundo (masc., 1930-2022) entre os times do app.',
    '// Fonte: Fjelstul World Cup Database (CC-BY 4.0) — github.com/jfjelstul/worldcup',
    '// Formato: [ano, fase, home, away, golsH, golsA, p, replay?]; p = 0 | 1 (prorrogação) | \'X-Y\' (pênaltis)',
    `const WCH_TEAMS = [${teams.map(t => `'${t.replace(/'/g, "\\'")}'`).join(', ')}];`,
    "const WCH_ST = { G: 'Grupos', G2: '2ª fase de grupos', R1: '1ª fase', R2: '2ª fase', FR: 'Rodada final', R16: 'Oitavas', QF: 'Quartas', SF: 'Semifinal', TP: '3º lugar', F: 'FINAL' };",
    'const WCH = [' + rowsJs.join(',') + '];',
    '// === WCH:END ===',
  ].join('\n');
  console.log('Tamanho do bloco:', (block.length / 1024).toFixed(1) + 'KB,', teams.length, 'times,', kept.length, 'jogos');

  // 5) Splice idempotente no jsx
  const BEGIN = '// === WCH:BEGIN', END = '// === WCH:END ===';
  let out;
  const bi = jsx.indexOf(BEGIN);
  if (bi >= 0) {
    const ei = jsx.indexOf(END, bi);
    if (ei < 0) throw new Error('marcador WCH:END ausente');
    out = jsx.slice(0, bi) + block + jsx.slice(ei + END.length);
    console.log('Bloco WCH substituído.');
  } else {
    const anchor = '// Persistência local';
    const ai = jsx.indexOf(anchor);
    if (ai < 0) throw new Error('âncora "// Persistência local" não encontrada');
    out = jsx.slice(0, ai) + block + '\n\n' + jsx.slice(ai);
    console.log('Bloco WCH inserido antes de "' + anchor + '".');
  }
  fs.writeFileSync(JSX, out);
  console.log('OK: jsx atualizado (' + (out.length / 1024).toFixed(0) + 'KB)');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
