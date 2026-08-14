const { test, expect } = require('@playwright/test');
const { boot, openCadastro, closeCadastro, fillFilme, salvarFilme, abrirInfoDoCard } = require('./helpers');

test.describe('CineCatalog Elo — Smoke Test (baseline v32.2.0)', () => {

  test('01 - App carrega sem erros e elementos-chave existem', async ({ page }) => {
    const errors = await boot(page);

    // Elementos principais
    await expect(page.locator('#content-canvas')).toBeVisible();
    await expect(page.locator('#movies-container')).toBeAttached();
    await expect(page.locator('#empty-state')).toBeAttached();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Navegação principal
    await expect(page.locator('#link-filmes')).toBeAttached();
    await expect(page.locator('#link-series')).toBeAttached();
    await expect(page.locator('#link-estreias')).toBeAttached();

    // Botão de cadastro
    await expect(page.locator('button.btn-cadastrar')).toBeVisible();

    expect(errors, 'Nenhum erro de console/exceção no carregamento').toEqual([]);
  });

  test('02 - Navegação entre abas Filmes/Séries/Estreias', async ({ page }) => {
    await boot(page);
    const links = ['#link-filmes', '#link-series', '#link-estreias'];
    for (const sel of links) {
      await page.locator(sel).click();
      await expect(page.locator(sel)).toHaveClass(/active/);
      for (const other of links) {
        if (other !== sel) await expect(page.locator(other)).not.toHaveClass(/active/);
      }
    }
  });

  test('03 - Cadastrar filme cria card na tela', async ({ page }) => {
    await boot(page);
    await expect(page.locator('.movie-card')).toHaveCount(0);

    await openCadastro(page);
    await fillFilme(page, 'Filme Smoke Test Unico');
    await salvarFilme(page);

    // CREATE MODE: modal continua aberto e o card é renderizado atrás
    await expect(page.locator('#movies-container .movie-card')).toHaveCount(1);
    await expect(page.locator('#movies-container .movie-card').first()).toContainText('2026');

    // Fecha o modal
    await closeCadastro(page);
  });

  test('04 - Info do filme abre pelo menu de contexto', async ({ page }) => {
    await boot(page);
    await openCadastro(page);
    await fillFilme(page, 'Filme Para Info Smoke');
    await salvarFilme(page);
    await closeCadastro(page);

    await abrirInfoDoCard(page, 0);
    await expect(page.locator('#mmi-title')).toHaveText('Filme Para Info Smoke');
    await expect(page.locator('#mmi-year')).toHaveText('2026');

    await page.locator('#modal-movie-info .btn-close-premium').first().click();
  });

  test('05 - Editar filme pelo menu de contexto', async ({ page }) => {
    await boot(page);
    await openCadastro(page);
    await fillFilme(page, 'Filme Antes da Edicao');
    await salvarFilme(page);
    await closeCadastro(page);

    // Abre contexto -> Editar
    await page.locator('.movie-card').first().click({ button: 'right' });
    await page.locator('#context-menu.show').waitFor({ state: 'visible' });
    await page.locator('#context-menu button', { hasText: 'Editar' }).first().click();

    // Modal de edição com campo carregado
    await expect(page.locator('#modal-cadastro.active')).toBeVisible();
    await expect(page.locator('#f-title')).toHaveValue('Filme Antes da Edicao');

    await page.locator('#f-title').fill('Filme Depois da Edicao');
    await page.locator('#btn-save-v2').click();

    // EDIT MODE: modal fecha
    await page.locator('#modal-cadastro.active').waitFor({ state: 'hidden' });
    await expect(page.locator('.movie-card')).toHaveCount(1);

    // Confere pelo info
    await abrirInfoDoCard(page, 0);
    await expect(page.locator('#mmi-title')).toHaveText('Filme Depois da Edicao');
    await page.locator('#modal-movie-info .btn-close-premium').first().click();
  });

  test('06 - Remover filme pelo menu de contexto', async ({ page }) => {
    await boot(page);
    await openCadastro(page);
    await fillFilme(page, 'Filme Para Remover');
    await salvarFilme(page);
    await closeCadastro(page);
    await expect(page.locator('.movie-card')).toHaveCount(1);

    page.on('dialog', (d) => d.accept());
    await page.locator('.movie-card').first().click({ button: 'right' });
    await page.locator('#context-menu.show').waitFor({ state: 'visible' });
    await page.locator('#context-menu button', { hasText: 'Remover' }).first().click();

    await expect(page.locator('.movie-card')).toHaveCount(0);
    await expect(page.locator('#empty-state')).toBeVisible();
  });

  test('07 - Dados persistem após recarregar a página', async ({ page }) => {
    await boot(page);
    await openCadastro(page);
    await fillFilme(page, 'Filme Persistente Smoke');
    await salvarFilme(page);
    await closeCadastro(page);
    await expect(page.locator('.movie-card')).toHaveCount(1);

    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(500);
    await expect(page.locator('.movie-card')).toHaveCount(1);
    await expect(page.locator('#movies-container .movie-card').first()).toContainText('2026');
  });

  test('08 - Busca destaca o card correspondente', async ({ page }) => {
    await boot(page);
    await openCadastro(page);
    await fillFilme(page, 'Missao Impossivel Xyz');
    await salvarFilme(page);
    await closeCadastro(page);
    await openCadastro(page);
    await fillFilme(page, 'Outro Filme Qualquer');
    await salvarFilme(page);
    await closeCadastro(page);
    await expect(page.locator('.movie-card')).toHaveCount(2);

    // Abre a barra de busca e digita
    await page.locator('[title="Pesquisar"]').first().click();
    await page.locator('#main-search').fill('missao');
    await page.waitForTimeout(600); // debounce 350ms

    await expect(page.locator('.movie-card.search-match')).toHaveCount(1);
  });

  test('09 - Persistência via IndexedDB (localStorage limpo após salvar)', async ({ page }) => {
    await boot(page);
    await openCadastro(page);
    await fillFilme(page, 'Filme IndexedDB Smoke');
    await salvarFilme(page);
    await closeCadastro(page);
    await expect(page.locator('.movie-card')).toHaveCount(1);

    // Espera o IndexedDB terminar a escrita assíncrona
    await page.waitForFunction(async () => {
      if (!window.Store) return false;
      await window.Store._ready;
      return true;
    });
    await page.waitForTimeout(800);

    // Apaga TODO o localStorage (inclusive o espelho) e recarrega:
    // os dados devem vir do IndexedDB via Store
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(500);
    await expect(page.locator('.movie-card')).toHaveCount(1);
    await expect(page.locator('#movies-container .movie-card').first()).toContainText('2026');
  });

  test('10 - Capa vira Blob no IndexedDB (imageKey) e sobrevive ao reload', async ({ page }) => {
    await boot(page);
    await openCadastro(page);

    // Anexa um PNG real ao campo de capa do filme
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    await page.setInputFiles('#f-poster-file', { name: 'capa.png', mimeType: 'image/png', buffer: png });

    // Compressão + preview pronto (src blob:, não data:)
    await page.waitForFunction(() => {
      const img = document.getElementById('f-poster-img');
      return img && img.classList.contains('show') && img.src.indexOf('blob:') === 0;
    });

    await fillFilme(page, 'Filme Capa Blob Smoke');
    await salvarFilme(page);

    // CREATE MODE: card renderizado atrás do modal com src blob:
    await page.waitForFunction(() => {
      const im = document.querySelector('#movies-container .movie-card img');
      return im && im.src && im.src.indexOf('blob:') === 0;
    });

    // Persistido com imageKey e SEM DataURL/objectURL no JSON
    const stored = await page.evaluate(() => {
      const all = JSON.parse(window.Store.getItem('cinecatalog_v126'));
      const m = all.find((x) => x.titlePt === 'Filme Capa Blob Smoke');
      return { imageKey: m.imageKey || '', image: m.image || '' };
    });
    expect(stored.imageKey).toMatch(/^img_/);
    expect(stored.image).not.toContain('data:');
    expect(stored.image).not.toContain('blob:');

    await closeCadastro(page);

    // Garante que a escrita do Blob no IndexedDB terminou
    await page.waitForFunction(async () => {
      if (!window.StoreImages) return false;
      await window.StoreImages._ready;
      return true;
    });
    await page.waitForTimeout(1000);

    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(500);

    // StoreImages recarrega o Blob do IDB e hidrata o filme
    await page.waitForFunction(async () => {
      if (!window.StoreImages) return false;
      await window.StoreImages._ready;
      const m = (window.APP_STATE.movies || []).find((x) => x.titlePt === 'Filme Capa Blob Smoke');
      return m && m.imageKey && m.image && m.image.indexOf('blob:') === 0;
    });

    await expect(page.locator('.movie-card')).toHaveCount(1);
    await page.waitForFunction(() => {
      const im = document.querySelector('#movies-container .movie-card img');
      return im && im.src && im.src.indexOf('blob:') === 0;
    });

    // O card exibe a imagem (sem classe de erro / fallback)
    const hasError = await page.locator('#movies-container .movie-card img').evaluate((el) => el.classList.contains('error'));
    expect(hasError).toBe(false);
  });

  test('11 - Capas com lazy/async nos cards e remoção libera o Blob do IndexedDB', async ({ page }) => {
    await boot(page);
    await openCadastro(page);

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    await page.setInputFiles('#f-poster-file', { name: 'capa.png', mimeType: 'image/png', buffer: png });
    await page.waitForFunction(() => {
      const img = document.getElementById('f-poster-img');
      return img && img.classList.contains('show') && img.src.indexOf('blob:') === 0;
    });

    await fillFilme(page, 'Filme Lazy Async Blob');
    await salvarFilme(page);
    await closeCadastro(page);

    // Card com loading="lazy" e decoding="async"
    const cardImg = page.locator('#movies-container .movie-card img');
    await expect(cardImg).toHaveCount(1);
    await expect(cardImg).toHaveAttribute('loading', 'lazy');
    await expect(cardImg).toHaveAttribute('decoding', 'async');

    const key = await page.evaluate(() => {
      const m = window.APP_STATE.movies.find((x) => x.titlePt === 'Filme Lazy Async Blob');
      return m && m.imageKey ? m.imageKey : null;
    });
    expect(key).toMatch(/^img_/);
    expect(await page.evaluate((k) => !!window.StoreImages.blobFor(k), key)).toBe(true);

    // Remove o filme pelo menu de contexto
    page.on('dialog', (d) => d.accept());
    await page.locator('.movie-card').first().click({ button: 'right' });
    await page.locator('#context-menu.show').waitFor({ state: 'visible' });
    await page.locator('#context-menu button', { hasText: 'Remover' }).first().click();
    await expect(page.locator('.movie-card')).toHaveCount(0);

    // O Blob da capa foi liberado junto com o filme
    expect(await page.evaluate((k) => window.StoreImages.blobFor(k), key)).toBe(null);
  });

});
