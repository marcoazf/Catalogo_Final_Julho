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
- [ ] Instalar localForage (bundled local) e criar camada `storage.js` compatível com a API antiga.
- [ ] Migração automática: ler `localStorage` legado e gravar no IndexedDB na primeira carga.
- [ ] Capas deixam de ser DataURL e viram **Blob** (imagens armazenadas no IndexedDB).
- [ ] Smoke test com persistência (salvar → recarregar → dados presentes) → VERDE.
- [ ] `git commit`.

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

---

## 5. LOG DE BUGS E CORREÇÕES (preencher quando ocorrer)

> Formato: `[DATA] BUG: sintoma | causa raiz | correção | arquivo(s):linha(s) | testado em`

| Data | Sintoma | Causa | Correção | Arq:Linha | Teste |
|------|---------|-------|----------|-----------|-------|
|      |         |       |          |           |       |

---

## 6. COMANDOS ÚTEIS

- Rodar smoke test: `npx playwright test`
- Rodar teste específico: `npx playwright test <arquivo>`
- Rodar com interface: `npx playwright test --ui`
- Ver portas de instalação: `npx playwright install chromium`
