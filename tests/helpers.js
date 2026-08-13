const path = require('path');
const { pathToFileURL } = require('url');

const APP_URL = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;

// Coleta erros de console e exceções não capturadas da página.
function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      // Ignora erros de rede de recursos externos (CDNs) — fora do controle da app.
      const text = msg.text();
      if (/net::|Failed to load resource|ERR_/i.test(text)) return;
      errors.push('console: ' + text);
    }
  });
  return errors;
}

async function boot(page) {
  const errors = collectErrors(page);
  await page.goto(APP_URL, { waitUntil: 'load', timeout: 30000 });
  // Aguarda o onload terminar (Storage.load / Render.all / init da UI).
  await page.waitForTimeout(500);
  return errors;
}

async function openCadastro(page) {
  await page.locator('button.btn-cadastrar').first().click();
  await page.locator('#modal-cadastro.active').waitFor({ state: 'visible' });
  await page.waitForTimeout(150);
}

async function closeCadastro(page) {
  await page.locator('#modal-cadastro .modal-premium-header .btn-close-premium').first().click();
  await page.locator('#modal-cadastro.active').waitFor({ state: 'detached' }).catch(() => {});
  await page.locator('#modal-cadastro').waitFor({ state: 'hidden' }).catch(() => {});
  await page.waitForTimeout(150);
}

async function fillFilme(page, titulo, extra) {
  await page.locator('#f-title').fill(titulo);
  await page.locator('#f-year').fill(extra && extra.year ? extra.year : '2026');
  await page.locator('#f-director').fill(extra && extra.director ? extra.director : 'Diretor Teste');
  await page.locator('#f-cast').fill(extra && extra.cast ? extra.cast : 'Elenco Teste');
  await page.locator('#f-desc').fill(extra && extra.desc ? extra.desc : 'Sinopse de teste para o smoke test.');
  await page.locator('#f-category').selectOption({ index: 1 }).catch(() => {});
  if (extra && extra.statusNew) await page.locator('.status-check-item[data-status="new"]').click();
}

async function salvarFilme(page) {
  await page.locator('#btn-save-v2').click();
  await page.waitForTimeout(300);
}

// Abre o info modal pelo menu de contexto do primeiro card.
async function abrirInfoDoCard(page, index) {
  const card = page.locator('.movie-card').nth(index || 0);
  await card.click({ button: 'right' });
  await page.locator('#context-menu.show').waitFor({ state: 'visible' });
  await page.locator('#context-menu button', { hasText: 'Info' }).first().click();
  await page.locator('#modal-movie-info.active').waitFor({ state: 'visible' });
}

module.exports = { APP_URL, collectErrors, boot, openCadastro, closeCadastro, fillFilme, salvarFilme, abrirInfoDoCard };
