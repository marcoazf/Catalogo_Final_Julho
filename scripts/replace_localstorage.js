// Etapa 3a - substitui localStorage -> Store (fachada síncrona sobre IndexedDB)
// nos arquivos js (exceto store.js e vendor). UTF-8 preservado.
// Uso: node scripts/replace_localstorage.js
const fs = require('fs');
const path = require('path');

const files = ['autosave.js', 'logic.js', 'main.js', 'render.js', 'storage.js', 'ui.js'];

for (const name of files) {
  const abs = path.join(__dirname, '..', 'js', name);
  if (!fs.existsSync(abs)) continue;
  let c = fs.readFileSync(abs, 'utf-8');
  const before = c;
  c = c
    .split('localStorage.getItem(').join('Store.getItem(')
    .split('localStorage.setItem(').join('Store.setItem(')
    .split('localStorage.removeItem(').join('Store.removeItem(');
  if (c !== before) {
    fs.writeFileSync(abs, c, 'utf-8');
    console.log('OK', name);
  } else {
    console.log('sem mudanças', name);
  }
}
