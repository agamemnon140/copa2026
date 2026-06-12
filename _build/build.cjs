// Rebuild do simulador Copa 2026: bundla o jsx e splice no 1º <script> do index.html.
// Uso: node build.cjs   (de dentro de _build, após npm i esbuild@0.21.5 react@18.3.1 react-dom@18.3.1)
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const repo = path.join(__dirname, '..');

// copia o fonte para app.jsx ao lado do entry
fs.copyFileSync(path.join(repo, 'simulador_copa_2026.jsx'), path.join(__dirname, 'app.jsx'));

esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'entry.jsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: path.join(__dirname, 'bundle.js'),
});

const htmlPath = path.join(repo, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
let bundle = fs.readFileSync(path.join(__dirname, 'bundle.js'), 'utf8');
if (bundle.endsWith('\n')) bundle = bundle.slice(0, -1);
const open = html.indexOf('<script>');
const start = open + '<script>'.length;
const end = html.indexOf('</script>', start);
if (open < 0 || end < 0) { console.error('estrutura do index.html inesperada'); process.exit(1); }
const out = html.slice(0, start) + bundle + html.slice(end);
fs.writeFileSync(htmlPath, out);
console.log('OK: bundle ' + bundle.length + ' chars; index.html ' + html.length + ' -> ' + out.length + ' chars');
