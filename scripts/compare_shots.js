// Compara pares de screenshots (antes_/depois_) e reporta diferença de pixels.
// Uso: node scripts/compare_shots.js
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const shotsDir = path.join(__dirname, '..', 'shots');
const pairs = [
  ['antes_01_home.png', 'depois_01_home.png'],
  ['antes_02_cadastro.png', 'depois_02_cadastro.png'],
  ['antes_03_cards.png', 'depois_03_cards.png'],
  ['antes_04_grid.png', 'depois_04_grid.png']
];

function load(file) {
  return PNG.sync.read(fs.readFileSync(path.join(shotsDir, file)));
}

for (const [a, b] of pairs) {
  const imgA = load(a);
  const imgB = load(b);
  if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
    console.log(`${a} vs ${b}: DIMENSÕES DIFERENTES (${imgA.width}x${imgA.height} vs ${imgB.width}x${imgB.height})`);
    continue;
  }
  let diffPixels = 0;
  let total = 0;
  let maxDiff = 0;
  const n = imgA.data.length;
  for (let i = 0; i < n; i += 4) {
    const da = Math.abs(imgA.data[i] - imgB.data[i]);
    const db = Math.abs(imgA.data[i + 1] - imgB.data[i + 1]);
    const dc = Math.abs(imgA.data[i + 2] - imgB.data[i + 2]);
    const d = Math.max(da, db, dc);
    if (d > 10) diffPixels++;
    if (d > maxDiff) maxDiff = d;
    total++;
  }
  const pct = (diffPixels / total * 100).toFixed(3);
  console.log(`${a} vs ${b}: pixels diferentes = ${diffPixels} (${pct}%) | diff máx = ${maxDiff}`);
}
