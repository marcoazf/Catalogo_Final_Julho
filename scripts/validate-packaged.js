// Validação do app EMPACOTADO (release/win-unpacked/CineCatalog Elo.exe)
const { _electron } = require('@playwright/test');
const path = require('path');

(async () => {
    const exe = path.join(__dirname, '..', 'release', 'win-unpacked', 'CineCatalog Elo.exe');
    const app = await _electron.launch({ executablePath: exe });
    try {
        const page = await app.firstWindow();
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));

        await page.waitForLoadState('load');
        await page.waitForTimeout(1500);

        const result = await page.evaluate(() => {
            let electronOk = false, fsOk = false, detected = false;
            try { electronOk = typeof window.require === 'function' && !!window.require('electron'); } catch (e) {}
            try { fsOk = typeof window.require === 'function' && !!window.require('fs'); } catch (e) {}
            try { detected = !!window.process && !!window.process.versions && !!window.process.versions.electron; } catch (e) {}
            return {
                title: document.title,
                UI: typeof window.UI,
                Render: typeof window.Render,
                Logic: typeof window.Logic,
                electronOk, fsOk, detected,
                hasCanvas: !!document.getElementById('movies-container'),
                bodyChildren: document.body ? document.body.children.length : 0
            };
        });

        console.log('=== VALIDAÇÃO APP EMPACOTADO ===');
        console.log(JSON.stringify(result, null, 2));
        console.log('ERROS DE PÁGINA:', errors.length ? errors : 'nenhum');

        if (errors.length || result.UI !== 'object' || result.Render !== 'object' || !result.electronOk || !result.fsOk || !result.detected || !result.hasCanvas) {
            console.log('RESULTADO: FALHA');
            process.exitCode = 1;
        } else {
            console.log('RESULTADO: OK');
        }
    } finally {
        await app.close();
    }
})();
