# Documento de Trabalho — Refatoração CineCatalog Elo v32.2.0

> **Propósito deste arquivo:** registro vivo de cada passo executado nesta nova fase, com testes, bugs e correções.
> **Regra:** este documento deve conter contexto suficiente para que QUALQUER servidor de IA (ou pessoa) consiga
> retomar o trabalho de onde parou, sem precisar reler o código inteiro.

---

## 1. Estado Atual (baseline — v32.2.0)

- Aplicação: **CineCatalog Elo**, versão **v32.2.0**, tamanho **~646 KB**, **single-file** `index.html` (~10.518 linhas).
- **Stack:** HTML + CSS com Tailwind CDN + Vanilla JS puro (sem build, sem servidor).
- **Persistência:** `localStorage` (chaves: `cinecatalog_v126`, `cinecatalog_categories`, `cinecatalog_theme`,
  `cinecatalog_config`, `cinecatalog_search_history`, `cinecatalog_notif_YYYY-MM-DD`) + **File System Access API**
  para auto-save em arquivo (`cinecatalog_autosave.json` / `cinecatalog_data.json`).
- **Dependências externas (CDN):** Tailwind (latest), Font Awesome 6.4.0, Google Fonts Inter, Chart.js 4.4.7,
  html2canvas 1.4.1 (sob demanda).
- **Estrutura interna do `index.html`:**
  - Linhas 1–~2370: `<style>` com identidade visual + componentes (Tailwind CDN também é usado).
  - Linhas 2371–~4030: HTML dos modais/header/footer/empty state.
  - Linha 4031–10030: `<script>` bloco 1 — `APP_STATE`, `Storage`, `loadConfig/saveConfig/applyConfig`, `Render`,
    `Logic`, `UI` e funções globais (`saveMovie`, `saveMovieAndContinue`, `loadMovieIntoForm`, etc.).
  - Linha 10032–10516: `<script>` bloco 2 — auto-save com File System Access API + helpers Electron (`_isElectron`).
- **Projeto WPF paralelo:** `CineCatalog/` (.NET 8 + MVVM) — NÃO é o foco desta fase; ignorar durante a refatoração web.
- **Dados reais existentes:** `backup/CineCatalog_Backup.json` e `auto-save/` (conteúdo do acervo do usuário — não apagar).

### Observações de arquitetura registradas na exploração

1. `APP_STATE.movies` é o array central (objetos `filmes` / `series` / `estreias`).
2. `Storage.save()` faz strip de propriedades temporárias (`_searchMatch`, `_cadastroDate`) antes de salvar.
3. `Storage.load()` faz migração de dados legados (campo `status`/`watched` → `statuses`).
4. `Render` (linha 4296), `Logic` (linha 4560), `UI` (linha 6366) são expostos globalmente em
   `window.Render` / `window.Logic` (linhas 9817–9818) para os `onclick` inline.
5. Existem **~504 `onclick`/`oninput`/`onchange`/`onerror` inline** no HTML — serão removidos na Etapa 5.
6. `window.UI` NÃO é exposto globalmente no fim do bloco 1 (verificar necessidade na Etapa 5).
7. `lang="pt-pt"` (deveria ser `pt-BR`) — corrigir na Etapa 5.
8. `projeto_catalogo/index.html` é uma versão mais antiga (v25.x) — NÃO editar.

---

## 2. Roteiro de Implementação (passo a passo, com teste a cada passo)

Ordem escolhida para **CORREÇÕES CIRÚRGICAS 01** (do Diagnostico01.md), priorizando baixo risco primeiro.

### Etapa 0 — Infraestrutura de teste e trava de segurança (NÃO pular)
- [ ] Criar backup do `index.html` v32.2.0 em `backup/index_v32.2.0_<data>.html`.
- [ ] Inicializar `package.json` + instalar **Playwright** (testes E2E reais em Chromium).
- [ ] Criar `tests/` com suíte **smoke test**: abre `index.html`, verifica zero erros no console,
      checa elementos-chave (header, modais, grid), valida fluxo básico (cadastrar filme → card → editar → remover).
- [ ] Rodar smoke test sobre a v32.2.0 intacta → **deve ficar VERDE (baseline)**.
- [ ] `git commit` do baseline + infra de teste.

### Etapa 1 — Quebrar o monolito
- [ ] Extrair `<style>` para `/css/style.css`.
- [ ] Extrair `APP_STATE` + `Storage` + config para `/js/storage.js`.
- [ ] Extrair `Render` para `/js/render.js`.
- [ ] Extrair `Logic` + `UI` para `/js/logic.js` (ou separar UI depois, se ficar grande).
- [ ] `index.html` passa a carregar os arquivos com `<script src>` na ordem correta.
- [ ] Manter o bloco de auto-save (File System API) em `/js/autosave.js` (é o bloco 2).
- [ ] Rodar smoke test → VERDE.
- [ ] `git commit`.

### Etapa 2 — Tailwind purgado (fim do CDN)
- [ ] Instalar Tailwind (via npm) e gerar build purgado (só classes usadas) → `css/tailwind.purged.css`.
- [ ] Remover `<script src="https://cdn.tailwindcss.com">` do HTML.
- [ ] Comparar visual (screenshot antes/depois) + smoke test → VERDE.
- [ ] `git commit`.

### Etapa 3 — IndexedDB via localForage (fim do localStorage)
- [x] Instalar localForage (bundled local) e criar camada `Store` compatível com a API antiga (`js/store.js` + `js/vendor/localforage.min.js`).
- [x] Migração automática: ler `localStorage` legado e gravar no IndexedDB na primeira carga.
- [x] Todos os call sites de `localStorage.getItem/setItem/removeItem` em `js/*.js` redirecionados para `Store` (só o `_checkStorageQuota` inspeciona o espelho).
- [x] Smoke test com persistência (salvar → recarregar → dados presentes) + teste novo 09 (localStorage limpo → dados vindos do IndexedDB) → VERDE (9/9).
- [x] **Sub-etapa 3b:** Capas deixam de ser DataURL e viram **Blob** (imagens armazenadas no IndexedDB).
- [x] `git commit` (etapa 3b).

### Etapa 4 — Performance de imagens
- [ ] Adicionar `loading="lazy"` e `decoding="async"` nas `<img>` dos cards.
- [ ] Adicionar `revokeObjectURL()` nas blob URLs (liberar memória ao trocar/remover poster).
- [ ] Smoke test → VERDE.
- [ ] `git commit`.

### Etapa 5 — Acessibilidade e HTML limpo
- [ ] Corrigir `lang="pt-BR"`.
- [ ] Remover os ~504 `onclick` inline → substituir por `addEventListener` com `data-*` attributes.
- [ ] Adicionar `aria-label` nos botões de ícone.
- [ ] Smoke test → VERDE (nesta etapa o smoke test precisa cobrir todos os modais/fluxos tocados).
- [ ] `git commit`.

### Etapa 6 — PWA instalável
- [ ] Criar `manifest.json` (ícones, nome, theme color).
- [ ] Registrar Service Worker (cache-first para assets locais).
- [ ] Testar instalação PWA + funcionamento offline → VERDE.
- [ ] `git commit`.

> Próximas fases (após 01 concluída, conforme Diagnostico01.md): CORREÇÕES 02 (Vite+TS, virtual scroll,
> Fuse.js, jsPDF, backup zipado, Electron, remover Chart.js) e Objetivo Final (Electron desktop + trava de segurança).

---

## 3. Estratégia de Testes

- **Smoke/E2E:** Playwright (Chromium). Arquivos em `tests/`. Comando:
  `npx playwright test`
- **Verificação manual complementar (navegador real):** checklist em `tests/MANUAL.md`.
- **Regra de ouro:** nenhuma etapa é considerada concluída com o smoke test VERDE + commit feito.
- **Padrão de versionamento:** commit após cada etapa com mensagem descritiva
  (ex.: `etapa 1 - monólito quebrado em /css + /js`).

---

## 4. LOG DE PASSOS EXECUTADOS (preencher a cada etapa)

> Formato: `[DATA] ETAPA N — descrição curta — resultado — ref(s)`

| Data | Etapa | Descrição | Resultado | Referência |
|------|-------|-----------|-----------|------------|
| 2026-08-13 | 0 | Criado `documento.md`, backup v32.2.0 em `backup/index_v32.2.0_20260813_1910.html`, `package.json` + Playwright instalado, suíte `tests/smoke.spec.js` (8 testes), config, helpers e `tests/MANUAL.md` | Baseline VERDE: 8/8 testes passando na v32.2.0 intacta | `tests/smoke.spec.js`, `tests/helpers.js`, `playwright.config.js` |
| 2026-08-13 | 1 | Monólito quebrado: `index.html` (646KB/10.518 linhas) → `css/style.css` (2.368 linhas) + `js/storage.js` (263), `js/render.js` (263), `js/logic.js` (1.806), `js/ui.js` (3.447), `js/main.js` (216), `js/autosave.js` (483). `index.html` agora tem 1.670 linhas (só HTML + links). Split cirúrgico via `scripts/split_monolith.js` com verificação de âncoras de linha. `_isElectron()` (helper Electron) ficou no fim de `logic.js` (era do bloco 1) e é global — sem conflito | VERDE: 8/8 testes; `node --check` OK nos 6 arquivos | `scripts/split_monolith.js`, `css/style.css`, `js/*.js` |
| 2026-08-13 | 2 | Tailwind purgado: removido `<script src="https://cdn.tailwindcss.com">` (CDN runtime ~100KB+). Adicionado build local `css/tailwind.css` (~19KB minificado) via `npx tailwindcss` com `tailwind.config.js` (content: index.html + js/*.js) e `css/tailwind.input.css` (@tailwind base/components/utilities). Ordem de cascata preservada (style.css antes de tailwind.css). Ordem de carregamento: 1.670 → 1.668 linhas | VERDE: 8/8 testes + comparação de pixels `scripts/compare_shots.js`: home/cadastro 0% de pixels diferentes, cards/grid diff máx 7-8 (anti-aliasing) — visual idêntico ao CDN | `tailwind.config.js`, `css/tailwind.input.css`, `css/tailwind.css`, `scripts/screenshot_before.js`, `scripts/compare_shots.js` |
| 2026-08-13 | 3a | IndexedDB via localForage. `js/vendor/localforage.min.js` (vendored, 29KB) + `js/store.js` (fachada síncrona `Store`): cache em memória + dupla escrita localStorage (espelho, boot instantâneo) + IndexedDB (durável). Boot: semeadura síncrona do localStorage → sobreposição assíncrona do IndexedDB (chaves não-escritas na sessão) → migração localStorage→IndexedDB das chaves ausentes. `_ready` reaplica `Storage.load/applyConfig/renderCategorySelect/updateCounters/updateReminderBadge` após a sobreposição. `Store.setItem/getItem/removeItem` assíncrono com fallback localforage LOCALSTORAGE. Todos os call sites de `localStorage.getItem/setItem/removeItem` em `js/*.js` (40 ocorrências) → `Store.*` via `scripts/replace_localstorage.js` (Node/UTF-8; PowerShell corromperia acentos). Restam só: `_checkStorageQuota` (autosave.js:113-115, mede o espelho) e textos descritivos atualizados. Teste novo 09: salvar → `localStorage.clear()` → reload → dados vindos do IndexedDB | VERDE: 9/9 testes (07 e 09 cobrem persistência) | `js/store.js`, `js/vendor/localforage.min.js`, `index.html` (bloco 8), `scripts/replace_localstorage.js`, `tests/smoke.spec.js` (teste 09) |
| 2026-08-14 | 3b | Capas Blob no IndexedDB. Novo `js/images.js` (`StoreImages`): armazém localforage `catalog_images` no mesmo DB `cinecatalog_elo`, chave `img_<id>`, Blob persistido + objectURL em memória; filme guarda só `imageKey` (JSON leve, sem DataURL/objectURL). `Storage.toJSON()` centraliza o strip (apaga `image` quando há `imageKey`); `Storage.load` limpa `blob:` legadas (não persistem) e hidrata `image` a partir das capas carregadas. Fluxos de capa atualizados: `ui.setPosterPreview/resetPoster` (Blob-aware, `revokeObjectURL` ao limpar), `logic.compressImage` (passa o Blob), `logic.applyPosterFile`, `logic.resolvePosterOnSave`, `autosave.saveMovie` (filme/série) e `render.createCard` (resolve `imageKey` via `StoreImages.urlFor`). Compatibilidade legada mantida: DataURL/URL externa continuam sem `imageKey`. Teste novo 10 (capa PNG → Blob no IDB → reload → card mostra imagem) | VERDE: 10/10 testes | `js/images.js`, `index.html` (bloco 8), `js/storage.js`, `js/logic.js`, `js/ui.js`, `js/autosave.js`, `js/render.js`, `tests/smoke.spec.js` (teste 10) |

---

## 5. LOG DE BUGS E CORREÇÕES (preencher quando ocorrer)

> Formato: `[DATA] BUG: sintoma | causa raiz | correção | arquivo(s):linha(s) | testado em`

| Data | Sintoma | Causa | Correção | Arq:Linha | Teste |
|------|---------|-------|----------|-----------|-------|
| 2026-08-13 | Após Etapa 3a, testes 07/09 falhavam no reload (0 cards) e o espelho localStorage não era gravado (`LS has key: false`) | O `Store.init()` foi inserido no lugar errado por um `edit` (caiu dentro do corpo do método `init`, logo após o fechamento do IIFE assíncrono), então `init()` nunca era chamado: `_ready` ficava `undefined`, `_hasLS` `false` e `_idb` `null`. Sintoma inicial oculto: nenhum warning, porque a chamada recursiva só existiria se alguém invocasse `init` | Restaurada a estrutura original do `init()` e movido `Store.init();` para o fim do arquivo, após o fechamento do IIFE externo | `js/store.js:117-144` | 9/9 VERDE |
| 2026-08-13 | Acentos corrompidos nos arquivos JS após substituição em massa (`Séries` → `S�ries`) | PowerShell 5.1 `Get-Content`/`Set-Content` com encoding ANSI padrão leu/gravou UTF-8 como mojibake | Restaurado via `git checkout` e reexecutada a substituição com script Node (`fs.readFileSync/writeFileSync` utf-8) | `scripts/replace_localstorage.js` | 9/9 VERDE |
| 2026-08-14 | Teste 10 falhava (timeout): após salvar filme com capa, o card renderizava `<img src="">` (fallback), apesar de o Blob já estar no IndexedDB | `createCard` só lia `data.image`, que ficava `''` para itens novos com `imageKey` — a hidratação só acontecia no load, não para itens criados na própria sessão | `Render.createCard` passou a resolver `StoreImages.urlFor(imageKey)` (com fallback para `data.image`) e `Logic.resolvePosterOnSave` preenche `out.image` com a objectURL em memória (o `Storage.toJSON()` continua apagando `image` quando há `imageKey`, mantendo o JSON limpo) | `js/render.js` (createCard), `js/logic.js` (resolvePosterOnSave) | 10/10 VERDE |

---

## 6. COMANDOS ÚTEIS

- Rodar smoke test: `npx playwright test`
- Rodar teste específico: `npx playwright test <arquivo>`
- Rodar com interface: `npx playwright test --ui`
- Ver portas de instalação: `npx playwright install chromium`
