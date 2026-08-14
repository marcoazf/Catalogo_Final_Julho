// Etapa 5 — converte atributos inline (onclick/onchange/oninput/onmouseover/
// onmouseout/onkeydown/onblur/onerror="...") para data-on*="..." em
// index.html e nos templates JS (render.js, logic.js, ui.js).
// O vínculo passa a ser feito por js/bind.js via addEventListener.
// Uso: node scripts/convert_inline_handlers.js
const fs = require('fs');
const path = require('path');

const files = ['index.html', 'js/render.js', 'js/logic.js', 'js/ui.js'];
const types = ['click', 'change', 'input', 'mouseover', 'mouseout', 'keydown', 'blur', 'error'];

let total = 0;
for (const rel of files) {
    const file = path.join(__dirname, '..', rel);
    let src = fs.readFileSync(file, 'utf8');
    let changed = 0;
    for (const t of types) {
        const re = new RegExp('\\bon' + t + '=', 'g');
        src = src.replace(re, () => {
            changed++;
            return 'data-on' + t + '=';
        });
    }
    fs.writeFileSync(file, src, 'utf8');
    total += changed;
    console.log(rel + ': ' + changed + ' convertidos');
}
console.log('Total: ' + total);
