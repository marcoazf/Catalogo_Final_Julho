const { test, expect } = require('@playwright/test');
const { boot, openCadastro, fillFilme, salvarFilme, closeCadastro } = require('./helpers');

test.describe('Últimas implementações (GUIA-TESTES-COMPLETO)', () => {

  test('a) Acervo vazio exibe estado vazio correto por view', async ({ page }) => {
    await boot(page);
    // Filmes
    await expect(page.locator('#empty-state')).toBeVisible();
    await expect(page.locator('#empty-state')).toContainText('ACERVO VAZIO');
    // Séries
    await page.locator('#link-series').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#empty-state')).toContainText('ACERVO VAZIO');
    // Estreias
    await page.locator('#link-estreias').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#empty-state')).toContainText('Nenhuma Estreia');
  });

  test('b) Sugestão não aparece com acervo vazio e aparece após cadastro', async ({ page }) => {
    await boot(page);
    // Ativa sugestões (padrão é desativado)
    await page.evaluate(() => { if (window._appConfig) window._appConfig.sugestoesActive = true; });
    // Com acervo vazio, pickSuggestion mostra aviso e NÃO abre modal
    await page.evaluate(() => window.UI.pickSuggestion());
    await page.waitForTimeout(300);
    await expect(page.locator('#modal-sugestao.active')).toHaveCount(0);

    // Cadastra um filme
    await openCadastro(page);
    await fillFilme(page, 'Filme Para Sugestao');
    await salvarFilme(page);
    await closeCadastro(page);

    await page.evaluate(() => window.UI.pickSuggestion());
    await page.waitForTimeout(300);
    await expect(page.locator('#modal-sugestao.active')).toBeVisible();
    // Dados preenchidos com IDs corretos
    await expect(page.locator('#sug-title')).not.toHaveText('—');
  });

  test('c) Config: caminho preenchido ativa o botão Ativo/Inativo', async ({ page }) => {
    await boot(page);
    await page.locator('#btn-config').click();
    await page.waitForTimeout(400);
    await expect(page.locator('#modal-config.active')).toBeVisible();

    const toggle = page.locator('#cfg-path-videos-active');
    await expect(toggle).not.toBeChecked();
    await page.locator('#cfg-path-videos').fill('C:\\Videos\\MeusFilmes');
    await page.waitForTimeout(200);
    await expect(toggle).toBeChecked();
    await page.evaluate(() => { window.UI.closeModal('modal-config'); }).catch(() => {});
  });

  test('d) Player definido: playInfoMedia usa openMediaWithPlayer', async ({ page }) => {
    await boot(page);
    const usesOpenMedia = await page.evaluate(() => {
      const src = window.Logic.playInfoMedia.toString();
      return src.includes('openMediaWithPlayer');
    });
    expect(usesOpenMedia).toBe(true);
  });

});
