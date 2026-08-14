// Corrige o prefixo duplicado "data-data-on*" para "data-on*"
const fs = require('fs');
const path = require('path');

const files = ['index.html', 'js/render.js', 'js/logic.js', 'js/ui.js'];

let total = 0;
for (const rel of files) {
    const file = path.join(__dirname, '..', rel);
    let src = fs.readFileSync(file, 'utf8');
    let changed = 0;
    
    // Substitui data-data-on* por data-on*
    src = src.replace(/data-data-on([a-z]+)/g, (match, p1) => {
        changed++;
        return 'data-on' + p1;
    });
    
    fs.writeFileSync(file, src, 'utf8');
    total += changed;
    console.log(rel + ': ' + changed + ' corrigidos');
}

console.log('Total: ' + total);