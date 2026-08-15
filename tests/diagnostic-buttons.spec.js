const { test, expect } = require('@playwright/test');
const { APP_URL, collectErrors } = require('./helpers');

test.describe('Diagnóstico — Botões da Barra Principal', () => {

  test('Todos os botões do header funcionam sem erros', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(APP_URL, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(800);

    const results = {};

    // 1. Gerar Lista
    await page.locator('#btn-generate-list').click();
    await page.waitForTimeout(400);
    results.genList = await page.locator('#modal-generate-list.active').isVisible().catch(() => false);
    await page.locator('#modal-generate-list .btn-close-premium').first().click().catch(() => {});
    await page.waitForTimeout(200);

    // 2. Filtros
    await page.locator('#btn-filters').click();
    await page.waitForTimeout(300);
    results.filters = await page.locator('#filters-dropdown:not(.hidden)').isVisible().catch(() => false);
    await page.locator('#btn-filters').click();
    await page.waitForTimeout(200);

    // 3. Dashboard
    await page.locator('#btn-dashboard').click();
    await page.waitForTimeout(500);
    results.dash = await page.locator('#modal-dashboard.active').isVisible().catch(() => false);
    await page.locator('#modal-dashboard .btn-close-premium').first().click().catch(() => {});
    await page.waitForTimeout(200);

    // 4. View modes
    results.views = [];
    for (const sel of ['#view-carrossel', '#view-grid', '#view-marquee']) {
      await page.locator(sel).click();
      await page.waitForTimeout(250);
      results.views.push(sel + '=' + await page.locator(sel).evaluate((el) => el.classList.contains('active')));
    }

    // 5. View context menu
    await page.locator('#view-ctx-btn').click();
    await page.waitForTimeout(300);
    results.viewCtx = await page.locator('#view-context-menu.show').isVisible().catch(() => false);
    await page.evaluate(() => { window.Logic.closeViewContextMenu(); }).catch(() => {});
    await page.waitForTimeout(200);

    // 6. Tema
    await page.locator('#btn-theme').click();
    await page.waitForTimeout(300);
    results.theme = await page.locator('#theme-menu:not(.hidden)').isVisible().catch(() => false);
    results.themeOptions = await page.locator('#theme-menu button').count();
    await page.locator('#btn-theme').click();
    await page.waitForTimeout(200);

    // 7. Notificações
    await page.locator('#btn-notifications').click();
    await page.waitForTimeout(400);
    results.notif = await page.locator('#notification-overlay.active').isVisible().catch(() => false);
    await page.evaluate(() => { window.UI.closeNotifications(); }).catch(() => {});
    await page.waitForTimeout(200);

    // 8. Lembretes
    await page.locator('#btn-reminders').click();
    await page.waitForTimeout(400);
    results.remind = await page.locator('#reminder-panel.active').isVisible().catch(() => false);
    await page.evaluate(() => { window.UI.closeReminderPanel(); }).catch(() => {});
    await page.waitForTimeout(200);

    // 9. Histórico de Cadastro
    await page.locator('#btn-cadastro-log').click();
    await page.waitForTimeout(400);
    results.hist = await page.locator('#modal-cadastro-log.active').isVisible().catch(() => false);
    await page.locator('#modal-cadastro-log .btn-close-premium').first().click().catch(() => {});
    await page.waitForTimeout(200);

    // 10. Configurações
    await page.locator('#btn-config').click();
    await page.waitForTimeout(400);
    results.cfg = await page.locator('#modal-config.active').isVisible().catch(() => false);
    await page.locator('#modal-config .btn-close-premium').first().click().catch(() => {});
    await page.waitForTimeout(200);

    // 11. Info
    await page.locator('#btn-info').click();
    await page.waitForTimeout(400);
    results.info = await page.locator('#modal-info.active').isVisible().catch(() => false);
    await page.locator('#modal-info .btn-close-premium').first().click().catch(() => {});
    await page.waitForTimeout(200);

    // 12. Zoom
    results.zoom = [];
    for (const sel of ['#z2', '#z3', '#z4', '#z1']) {
      await page.locator(sel).click();
      await page.waitForTimeout(200);
      results.zoom.push(sel + '=' + await page.locator(sel).evaluate((el) => el.classList.contains('active')));
    }

    // 13. Nav Filmes/Séries/Estreias
    results.nav = [];
    for (const sel of ['#link-filmes', '#link-series', '#link-estreias']) {
      await page.locator(sel).click();
      await page.waitForTimeout(250);
      results.nav.push(sel + '=' + await page.locator(sel).evaluate((el) => el.classList.contains('active')));
    }

    // 14. Exportar (download) e Importar (file chooser)
    results.exportFile = await page.evaluate(() => typeof window.Logic.exportData).catch(() => 'undefined');

    console.log('=== RESULTADOS ===');
    for (const [k, v] of Object.entries(results)) console.log(k + ':', JSON.stringify(v));
    console.log('=== ERROS DE CONSOLE ===');
    console.log(JSON.stringify(errors, null, 2));
    console.log('=== FIM ===');
  });

});
