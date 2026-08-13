// Etapa 1 - Quebrar o monólito: extrai CSS e JS de index.html em arquivos separados.
// Uso: node scripts/split_monolith.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'index.html');
const lines = fs.readFileSync(SRC, 'utf-8').split(/\r?\n/);

function expect(idx, needle, label) {
  const actual = (lines[idx] || '').trim();
  if (actual !== needle) {
    throw new Error(`Anchor ${label} na linha ${idx + 1}: esperado "${needle}", obtido "${actual}"`);
  }
}

// ---- Verificação de âncoras (proteção contra mudanças de linha) ----
expect(14, '<style>', 'inicio do bloco CSS');
expect(2383, '</style>', 'fim do bloco CSS');
expect(4030, '<script>', 'inicio do bloco JS 1');
expect(10029, '</script>', 'fim do bloco JS 1');
expect(10031, '<script>', 'inicio do bloco JS 2');
expect(10515, '</script>', 'fim do bloco JS 2');

const first = (idx) => (lines[idx] || '').trim().slice(0, 40);
console.log('CSS bloco:', first(15), '...', first(2382));
console.log('JS1 bloco :', first(4031), '...', first(10028));
console.log('JS2 bloco :', first(10032), '...', first(10514));

// ---- Extração (slices de 1-based para 0-based: contentBetween(a,b) = lines.slice(a, b) onde a,b são 1-based [inclusive, exclusive)) ----
function extract(startLine, endLine) {
  // startLine inclusive, endLine exclusive (1-based)
  return lines.slice(startLine - 1, endLine - 1);
}

fs.mkdirSync(path.join(ROOT, 'css'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'js'), { recursive: true });

const files = {
  'css/style.css':   extract(16, 2384),   // conteúdo entre <style> e </style>
  'js/storage.js':   extract(4032, 4295), // APP_STATE + Storage + config + _appConfig init
  'js/render.js':    extract(4296, 4559), // const Render
  'js/logic.js':     extract(4560, 6366), // const Logic
  'js/ui.js':        extract(6366, 9813), // const UI
  'js/main.js':      extract(9814, 10030), // exports + window.onload
  'js/autosave.js':  extract(10033, 10516) // auto-save + saveMovie + global helpers
};

for (const [rel, content] of Object.entries(files)) {
  const abs = path.join(ROOT, rel);
  fs.writeFileSync(abs, content.join('\n') + '\n', 'utf-8');
  console.log(`OK ${rel} (${content.length} linhas)`);
}

// ---- Montagem do novo index.html ----
const head      = lines.slice(0, 14).join('\n');                       // linhas 1-14
const cssLink   = '    <link rel="stylesheet" href="css/style.css">';  // substitui <style>
const body      = lines.slice(2384, 4030).join('\n');                  // linhas 2385-4030
const scriptTags = [
  '    <script src="js/storage.js"></script>',
  '    <script src="js/render.js"></script>',
  '    <script src="js/logic.js"></script>',
  '    <script src="js/ui.js"></script>',
  '    <script src="js/main.js"></script>',
  '    <script src="js/autosave.js"></script>'
].join('\n');
const tail      = lines.slice(10516).join('\n');                       // linhas 10517+

const newHtml = [head, cssLink, body, scriptTags, tail].join('\n') + '\n';
fs.writeFileSync(SRC, newHtml, 'utf-8');
console.log(`OK index.html reconstruído (${newHtml.split('\n').length} linhas)`);
console.log('SPLIT CONCLUÍDO');
