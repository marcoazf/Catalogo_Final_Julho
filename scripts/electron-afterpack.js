// Hook afterPack do electron-builder (Windows): aplica ícone e metadados
// no executável principal com rcedit (signAndEditExecutable está desligado).
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.default = async function (context) {
    if (context.electronPlatformName !== 'win32') return;

    const exe = path.join(context.appOutDir, 'CineCatalog Elo.exe');
    if (!fs.existsSync(exe)) return;

    const rcedit = path.join(__dirname, '..', 'build', 'rcedit-x64.exe');
    const icon = path.join(__dirname, '..', 'build', 'icon.ico');

    const args = [
        exe,
        '--set-icon', icon,
        '--set-version-string', 'ProductName', 'CineCatalog Elo',
        '--set-version-string', 'FileDescription', 'CineCatalog Elo - Catálogo pessoal de filmes e séries',
        '--set-version-string', 'CompanyName', 'CineCatalog',
        '--set-file-version', '32.2.0.0',
        '--set-product-version', '32.2.0.0'
    ];

    execFileSync(rcedit, args, { stdio: 'inherit' });
};
