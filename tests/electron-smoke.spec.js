// Smoke test do app dentro do runtime Electron.
// Valida: boot sem erros, globals expostas, window.require (electron/fs) e persistência em file://.
const { test, expect, _electron } = require('@playwright/test');

test('Electron: app inicia sem erros e expõe globals', async () => {
    const app = await _electron.launch({ args: ['.'] });
    try {
        const page = await app.firstWindow();
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));

        await page.waitForLoadState('load');
        await page.waitForTimeout(1500);

        const result = await page.evaluate(() => {
            let electronOk = false;
            let fsOk = false;
            let isElectronDetected = false;
            try {
                electronOk = typeof window.require === 'function' && !!window.require('electron');
                fsOk = typeof window.require === 'function' && !!window.require('fs');
            } catch (e) {}
            try {
                isElectronDetected = !!window.process && !!window.process.versions && !!window.process.versions.electron;
            } catch (e) {}
            return {
                title: document.title,
                globals: {
                    APP_STATE: typeof window.APP_STATE,
                    Storage: typeof window.Storage,
                    Render: typeof window.Render,
                    Logic: typeof window.Logic,
                    UI: typeof window.UI
                },
                electronOk,
                fsOk,
                isElectronDetected,
                hasMain: !!document.getElementById('movies-container')
            };
        });

        expect(result.globals.UI).toBe('object');
        expect(result.globals.Render).toBe('object');
        expect(result.globals.Logic).toBe('object');
        expect(result.globals.APP_STATE).toBe('object');
        expect(result.electronOk).toBe(true);
        expect(result.fsOk).toBe(true);
        expect(result.isElectronDetected).toBe(true);
        expect(result.hasMain).toBe(true);
        expect(errors).toEqual([]);
    } finally {
        await app.close();
    }
});

test('Electron: localStorage persiste entre carregamentos (file://)', async () => {
    const app = await _electron.launch({ args: ['.'] });
    try {
        let page = await app.firstWindow();
        await page.waitForLoadState('load');
        await page.waitForTimeout(1000);

        await page.evaluate(() => {
            localStorage.setItem('__electron_smoke', 'ok-' + Date.now());
        });

        await page.reload();
        await page.waitForTimeout(1000);

        const value = await page.evaluate(() => localStorage.getItem('__electron_smoke'));
        expect(value).toContain('ok-');

        await page.evaluate(() => localStorage.removeItem('__electron_smoke'));
    } finally {
        await app.close();
    }
});
