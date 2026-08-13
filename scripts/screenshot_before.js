// Captura screenshots do estado atual (referência "antes") da Etapa 2.
// Uso: node scripts/screenshot_before.js [prefixo]  (ex: antes_ / depois_)
const { chromium } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const prefix = process.argv[2] || 'antes_';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const url = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(800);

  await page.screenshot({ path: 'shots/' + prefix + '01_home.png' });

  // abre modal de cadastro
  await page.locator('button.btn-cadastrar').first().click();
  await page.locator('#modal-cadastro.active').waitFor({ state: 'visible' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shots/' + prefix + '02_cadastro.png' });
  await page.locator('#modal-cadastro .modal-premium-header .btn-close-premium').first().click();
  await page.waitForTimeout(200);

  // adiciona filmes para ver cards
  async function addFilme(titulo) {
    await page.locator('button.btn-cadastrar').first().click();
    await page.locator('#f-title').fill(titulo);
    await page.locator('#f-year').fill('2026');
    await page.locator('#f-director').fill('Diretor Ref');
    await page.locator('#f-cast').fill('Elenco Ref');
    await page.locator('#f-desc').fill('Sinopse de referência para comparação de visual.');
    await page.locator('#f-category').selectOption({ index: 1 }).catch(() => {});
    await page.locator('.status-check-item[data-status="new"]').click();
    await page.locator('.status-check-item[data-status="fav"]').click();
    await page.locator('#btn-save-v2').click();
    await page.waitForTimeout(200);
    await page.locator('#modal-cadastro .modal-premium-header .btn-close-premium').first().click();
    await page.waitForTimeout(200);
  }
  await addFilme('Avatar 3');
  await addFilme('Interstellar');
  await addFilme('Duna Parte Dois');
  await addFilme('Matrix Ressurrections');
  await addFilme('Vingadores Ultimato');
  await addFilme('Coringa Delirio a Dois');

  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/' + prefix + '03_cards.png' });

  // grid view + dashboard para comparar gráficos
  await page.locator('#view-grid').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shots/' + prefix + '04_grid.png' });

  await browser.close();
  console.log('Screenshots ANTES salvos em shots/');
})().catch((e) => { console.error(e); process.exit(1); });

