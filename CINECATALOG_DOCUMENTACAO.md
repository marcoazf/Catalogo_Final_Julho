# CineCatalog Elo — Documentação Completa

> **Versão:** v1.2.6 — Edição Premium  
> **Arquivo:** `index.html` (~2792 linhas, single‑file)  
> **Tipo:** Catalogo pessoal de filmes/séries/estreias (SPA)  
> **Persistência:** `localStorage` (chave `cinecatalog_v126`)  
> **Dependências externas:** Font Awesome 6.4, Google Fonts (Inter), Tailwind CSS (CDN)

---

## Índice

1. [Arquitectura Geral](#1-arquitectura-geral)
2. [Objetos JavaScript](#2-objetos-javascript)
3. [Fluxo de Inicialização](#3-fluxo-de-inicialização)
4. [Header](#4-header)
5. [Barra de Pesquisa](#5-barra-de-pesquisa)
6. [Área Principal (Content Canvas)](#6-área-principal-content-canvas)
7. [Cards](#7-cards)
8. [Footer](#8-footer)
9. [Modal de Cadastro](#9-modal-de-cadastro)
10. [Menu de Contexto](#10-menu-de-contexto)
11. [Sistema de Lembretes](#11-sistema-de-lembretes)
12. [Sistema de Posters](#12-sistema-de-posters)
13. [Avaliação por Estrelas](#13-avaliação-por-estrelas)
14. [Gestão de Categorias](#14-gestão-de-categorias)
15. [Reprodução de Média (Play)](#15-reprodução-de-média-play)
16. [Notificações de Estreias](#16-notificações-de-estreias)
17. [Importação / Exportação](#17-importação--exportação)
18. [Funções Globais e Utilitárias](#18-funções-globais-e-utilitárias)
19. [Teclado](#19-teclado)
20. [Estrutura de Dados (Movie Object)](#20-estrutura-de-dados-movie-object)

---

## 1. Arquitectura Geral

```
index.html
├── <style>          → CSS custom properties, componentes, animações
├── <header>         → Navegação, pesquisa, acções (bloco fixo)
├── <main>           → Grelha de cards + empty state (expande)
├── <footer>         → Marca, status, contador (bloco fixo)
├── Modais
│   ├── #modal-cadastro    → Registo/edição de filmes/séries/estreias
│   ├── #reminder-popup    → Criar/editar lembrete
│   ├── #reminder-panel    → Lista de lembretes
│   ├── #notification-overlay → Notificações de estreias
│   ├── #cat-manager-overlay → Gestão de categorias
│   └── #context-menu      → Menu de contexto (clique direito)
├── <script> (1.º)  → APP_STATE, Storage, Render, Logic, UI
└── <script> (2.º)  → saveMovie(), saveMovieAndContinue(), _editingId
```

---

## 2. Objetos JavaScript

### `const APP_STATE` (linha ~1191)
```javascript
{
  movies: [],            // Array de todas as entradas do catálogo
  currentView: 'filmes', // Aba activa: 'filmes' | 'series' | 'estreias'
  activeFilter: 'all',   // Filtro: 'all' | 'new' | 'watch' | 'fav'
  searchQuery: '',        // Termo de pesquisa actual
  selectedId: null,       // ID do filme alvo do menu contexto / popup lembrete
  searchTimer: null       // Referência do debounce da pesquisa
}
```

### `const Storage` (linha ~1199)
| Método | Descrição |
|--------|-----------|
| `save()` | Serializa `APP_STATE.movies` → `localStorage('cinecatalog_v126')`. Chama `UI.updateCounters()`, `UI.updateFooterStats()`, `Logic.updateReminderBadge()`, `Logic.showStatus('Sincronizado')` |
| `load()` | Lê `localStorage`, faz parse, migra dados legados. Chama `Render.all()`, `Logic.renderCategorySelect()`, `UI.updateCounters()`, `Logic.updateReminderBadge()` |

### `const Render` (linha ~1232)
| Propriedade/Método | Descrição |
|-------------------|-----------|
| `BATCH_SIZE` (20) | Cards por batch no lazy‑load |
| `_allFiltered` | Array interno dos filmes filtrados |
| `_renderedCount` | Quantos cards já renderizados |
| `_scrollHandler` | Listener do scroll |
| `all()` | Filtra, limpa container, mostra/oculta empty state, renderiza batch, configura scroll infinito. Chama `UI.updateFooterStats()` |
| `_loadMore()` | Renderiza próximo batch de até 20 cards |
| `createCard(data)` | Cria um `.movie-card` completo a partir de um objecto movie |

### `const Logic` (linha ~1340)
Módulo de lógica de negócio. Métodos listados nas secções seguintes.

### `const UI` (linha ~2196)
Módulo de manipulação da interface. Métodos listados nas secções seguintes.

### Variáveis e Funções Globais (2.º `<script>`, linha ~2520)
| Nome | Descrição |
|------|-----------|
| `var _editingId = null` | ID do filme a editar. `null` = criação nova |
| `function saveMovie()` | Recolhe dados do formulário, cria/actualiza, persiste, re-renderiza, fecha modal, alerta |
| `function saveMovieAndContinue()` | Recolhe dados, verifica duplicidade (type + titlePt), persiste, limpa campos, mantém modal aberto |

---

## 3. Fluxo de Inicialização

`window.onload` (linha ~2449):

1. **Teclado** — Bloqueia F12; ESC fecha popup de lembrete
2. **`Storage.load()`** — Carrega dados, migra, renderiza tudo
3. **Clique global** — Fora do `#context-menu` fecha‑o
4. **Fundo do cat‑manager** — Clique no fundo fecha
5. **Estrelas** — `initStars('star-input-container', 'f-stars')` e `initStars('star-input-container-series', 'fs-stars')`
6. **Posters** — `UI.initPosterArea('f')` e `UI.initPosterArea('fs')`
7. **Media Pickers** — `UI.initMediaPicker('f')` e `UI.initMediaPicker('fs')`
8. **Notificações estreias** — `Logic.checkEstreiaNotifications()` + `setInterval` 60s
9. **Fundo das notificações** — Fecha ao clicar fora
10. **Fundo do painel lembretes** — Fecha ao clicar fora

---

## 4. Header

### Logo
- `<img id="logo-img">` — base64 PNG, ~34px, exibição apenas

### Botão Pesquisa
- `<button onclick="UI.toggleSearchBar()">` — `fa-search`
- Alterna `.active` em `#search-bar-container`

### Navegação (Filmes / Séries / Estreias)
- `#link-filmes`, `#link-series`, `#link-estreias` (classe `.nav-link`)
- `onclick="Logic.setMainView('filmes')"` — define `APP_STATE.currentView`, re-renderiza

### Botão Cadastrar
- `onclick="UI.openModal('modal-cadastro')"` — abre modal, reseta formulários

### Zoom (1× / 2× / 3× / 4×)
- `#z1`..`#z4` (classe `.zoom-btn`)
- `UI.setZoom(n)` — altera `--cards-per-row` (5,6,7,8 colunas)

### Filtros
- Botão: `#btn-filters` → `UI.toggleFilters()` mostra/oculta dropdown
- Dropdown: `#filters-dropdown` com opções "Todos", "Novos", "Assistir", "Favoritos"
- `Logic.applyFilter(f)` — define `APP_STATE.activeFilter`, re-renderiza

### Tema (claro/escuro)
- `UI.toggleTheme()` — alterna `.light-mode` no `<body>`, troca ícone `fa-moon`/`fa-sun`

### Ícones de Acção
| Ícone | Função | Descrição |
|-------|--------|-----------|
| `fa-bell` | `UI.toggleNotifications()` | Abre painel de notificações (estreias) |
| `fa-sticky-note` | `UI.toggleReminderPanel()` | Abre painel de lembretes |
| `fa-download` | `Logic.exportData()` | Exporta JSON |
| `fa-upload` | `Logic.importData(event)` | Importa JSON (input file oculto) |
| `fa-cog` | `UI.toggleModal('modal-config')` | Modal de configuração (não definido) |
| `fa-info-circle` | `UI.toggleModal('modal-info')` | Modal de informações (não definido) |

### Badges
- `#notification-badge` — vermelho, notificações de estreia
- `#reminder-badge` — âmbar, contagem de lembretes

---

## 5. Barra de Pesquisa

- `#search-bar-container` (oculta, `.active` mostra)
- `#main-search` — `oninput="Logic.handleSearch(this.value)"`
- `Logic.handleSearch(val)` — debounce 300ms → `APP_STATE.searchQuery = val` → `Render.all()`
- Botão "Limpar" → `Logic.clearSearch()`

---

## 6. Área Principal (Content Canvas)

- `<main id="content-canvas" class="custom-scroll">`

### Empty State
- `#empty-state` — centralizado, mostra quando não há filmes
- Ícone clapperboard, "ACERVO VAZIO", texto descritivo

### Grelha de Cards
- `#movies-container` — recebe classe `dynamic-grid` quando populado
- CSS Grid: `repeat(var(--cards-per-row), minmax(0, 1fr))`
- Lazy‑load: renderiza 20 de cada vez com scroll infinito

---

## 7. Cards

Cada card (`Render.createCard(data)`) contém:

| Camada | Conteúdo |
|--------|----------|
| Poster | `<img>` com `onerror` → fallback `.card-fallback` |
| Categoria | `.card-category` (top‑esquerda) |
| Coração | `.card-heart.show` — apenas se `favorite = true` |
| Ícone lembrete | `fa-sticky-note` — apenas se `reminder` existir |
| Play overlay | `.card-play-overlay` + `.card-play-btn` — apenas se `mediaFile` ou `trailUrl` existir |
| Barra inferior | Gradiente com título, ano, estrelas, badges |

### Interacções
- **Clique direito** → `Logic.openContextMenu(e, data.id)`
- **Hover** → overlay play aparece (`opacity: 0 → 1`), card levanta (`translateY(-6px)`)
- **Play** → `Logic.playMedia(data.id)` abre URL noutra janela

---

## 8. Footer

````html
<footer>
  <div>ELO SISTEMA E TECNOLOGIA | 2026 - CREATED FOR JONAS THEODORO</div>
  <div id="user-action-status">   ← Feedback temporário (auto‑oculta 2s)
  <div id="stats-counter">        ← "X DE Y TÍTULOS NO ACERVO"
</footer>
````

- `Logic.showStatus(msg)` — texto verde no centro, fade out 2s
- `UI.updateFooterStats()` — total + exibidos, chamado de `Render.all()` e `Storage.save()`

---

## 9. Modal de Cadastro

### Estrutura
```
#modal-cadastro (classe .modal-premium, .active para mostrar)
├── .modal-premium-header
│   ├── #modal-title → "CADASTRO NOVO" ou "EDITAR {tipo}"
│   ├── #tab-filmes, #tab-series, #tab-estreias (data-tab="...")
│   └── Botão fechar
├── .modal-premium-inner (scroll)
│   ├── #tab-content-filmes
│   ├── #tab-content-series
│   ├── #tab-content-estreias
│   └── #modal-toast → feedback visual (verde/vermelho, 3s)
└── .modal-premium-footer
    ├── Acervo: #counter-filmes, #counter-series, #counter-estreias
    ├── #btn-save-v2 → saveMovie() (azul)
    └── Botão → saveMovieAndContinue() (âmbar, SALVAR +)
```

### Aba Filmes — Campos do Formulário

| ID | Rótulo | Tipo | Propriedade |
|----|--------|------|-------------|
| `f-original-title` | Título Original | text | `originalTitle` |
| `f-title` | Título Português | text | `titlePt` |
| `f-year` | Ano | text | `year` |
| `f-duration` | Duração | text (c/ máscara) | `duration` |
| `f-director` | Diretor | text | `director` |
| `f-cast` | Elenco | text | `cast` |
| `f-category` | Categoria | select | `genre` |
| `star-input-container` | Classificação | 5 estrelas | `stars` (0‑5 via `#f-stars` oculto) |
| `f-desc` | Sinopse | textarea | `desc` |
| `f-poster-area` | Capa (upload) | drag‑and‑drop | `image` |
| `f-poster-url` | URL da Capa | text | `image` (fallback) |
| `f-media-url` | Link do Filme | text + folder picker | `mediaFile` |
| `f-trailer-url` | Trailer | text | `trailUrl` |
| `f-other-info` | Outras Informações | textarea | `otherInfo` |
| `f-status-new` | Novo | checkbox | `statuses.new` |
| `f-status-watch` | Assistir | checkbox | `statuses.watch` |
| `f-status-fav` | Favorito | checkbox | `statuses.favorite` |

### Aba Séries — Campos Adicionais
Mesmos campos que Filmes com prefixo `fs-` +:
| ID | Rótulo | Propriedade |
|----|--------|-------------|
| `fs-season` | Temporada | `season` |
| `fs-episode-number` | N.º Episódio | `episodeNumber` |

### Aba Estreias — Campos
| ID | Rótulo | Propriedade |
|----|--------|-------------|
| `fe-date` | Data | `date` |
| `fe-original-title` | Título Original | `originalTitle` |
| `fe-title` | Título Português | `titlePt` |
| `fe-language` | Idioma | `language` |
| `fe-studio` | Estúdio / Produtora | `studio` |
| `fe-type-filmes` / `fe-type-series` | Tipo (toggle) | `estreiaType` |
| `fe-director` | Diretor | `director` |
| `fe-cast` | Elenco | `cast` |
| `fe-category` | Categoria | `genre` |
| `fe-trailer-url` | URL do Trailer | `trailUrl` |
| `fe-desc` | Sinopse | `desc` |

**Nota:** Estreias não têm poster, media URL, estrelas nem status.

### Funcionalidade SALVAR +
- **Restrição de duplicidade:** verifica `type + titlePt` (case‑insensitive). Se existir → toast vermelho e aborta.
- Após salvar → `alert("{Tipo} salvo com sucesso!")` → campos limpos → modal permanece aberto.
- Ideal para registo em lote.

---

## 10. Menu de Contexto

`#context-menu` (classe `.show` para exibir)

| Opção | Função | Descrição |
|-------|--------|-----------|
| Info | `Logic.viewMovieCtx()` | Mostra detalhes num `alert()` |
| Editar | `Logic.editMovieCtx()` | Abre modal em modo edição, preenche campos |
| Favoritar / Desfavoritar | `Logic.toggleFavCtx()` | Alterna `statuses.favorite`, actualiza label |
| Criar Lembrete / Lembrete criado | `Logic.editReminderCtx()` | Abre popup de lembrete |
| Remover | `Logic.deleteMovieCtx()` | Confirma e elimina entrada |

- `Logic.openContextMenu(e, id)` — posiciona, actualiza labels (oculta lembrete para estreias)
- `Logic.closeCtxMenu(cb)` — fade out + oculta
- Clique fora do menu fecha‑o

---

## 11. Sistema de Lembretes

### Popup (Criar/Editar) — `#reminder-popup`
| Elemento | Descrição |
|----------|-----------|
| `#reminder-popup-title` | "CRIAR LEMBRETE DE {Título}" / "EDITAR LEMBRETE DE {Título}" |
| `#reminder-created-info` | Data de criação (se edição) |
| `#reminder-text` | textarea para o texto |
| "Salvar" | `Logic.saveReminder()` — guarda texto + timestamp |
| "Cancelar" | Fecha popup |
| "Remover" | `Logic.deleteReminder()` — limpa dados |

### Painel (Lista) — `#reminder-panel`
- Título: **"LEMBRETES DE FILMES"**
- `#reminder-list` — populado por `Logic.renderReminderList()`
- Cada item: ícone sticky‑note, título (`titlePt \|\| originalTitle \|\| 'Sem título'`), género, data, texto, lixeira
- **Lixeira:** `Logic.removeReminderNotif(id)` com `confirm("{título}?")`
- **Contador:** "X lembrete(s)" no topo
- **Scroll:** `max-height: 420px` + `overflow-y: auto` quando >3 lembretes
- Badge no header: `#reminder-badge` → `Logic.updateReminderBadge()`
- Dados persistidos em localStorage via `Storage.save()`

---

## 12. Sistema de Posters

### Upload (prefixo `f` ou `fs`)
1. Clique na área → input file oculto
2. Arrastar ficheiro → `drop` event
3. Colar imagem → `paste` event
4. URL → campo `f-poster-url` / `fs-poster-url`

### Compressão (`Logic.compressImage`)
- Lê ficheiro como DataURL
- Desenha em Canvas, reduz qualidade JPEG iterativamente (máx 300KB, 20 iterações)
- Retorna blob URL via callback

### Preview / Reset
- `UI.setPosterPreview(src, prefix)` — mostra imagem, oculta URL wrap
- `UI.resetPoster(prefix)` — limpa preview, mostra URL wrap

### Persistência
- Se upload/arrastar/colar: guarda `f-poster-img.src` (base64/blob)
- Se URL: guarda `f-poster-url.value`
- Fallback: `'https://via.placeholder.com/300x450'`

---

## 13. Avaliação por Estrelas

### Containers
- Filmes: `#star-input-container` (5 × `fa-star` com `data-v="1"`..`"5"`) + `#f-stars` (hidden)
- Séries: `#star-input-container-series` + `#fs-stars` (hidden)

### Funcionamento
- Clicar numa estrela → `hidden.value = v`; destaca todas ≤ v
- Clicar na mesma estrela → desselecciona (`value = 0`)
- Inicializado por `initStars(containerId, hiddenId)` no `window.onload`

---

## 14. Gestão de Categorias

### Interface
- Overlay: `#cat-manager-overlay` (`.active` mostra)
- Input: `#cat-input` + Enter para adicionar
- Lista: `#cat-manager-list`

### Funções
| Método | Descrição |
|--------|-----------|
| `Logic.getCategories()` | Lê de localStorage `'cinecatalog_categories'` (default: 5 categorias) |
| `Logic.saveCategories(cats)` | Persiste + re-renderiza selects e lista |
| `Logic.renderCategorySelect()` | Popula `#f-category`, `#fs-category`, `#fe-category` |
| `Logic.renderCategoryManager()` | Popula lista com categorias + botão remover |
| `Logic.toggleCatManager()` | Abre/fecha overlay |
| `Logic.addCategory(name)` | Valida, adiciona, persiste |
| `Logic.removeCategory(name)` | Remove, persiste |

---

## 15. Reprodução de Média (Play)

### No Card
- Se `data.mediaFile` ou `data.trailUrl` existir → `.card-play-overlay` + `.card-play-btn`
- Hover no card → overlay aparece (opacity transition)

### `Logic.playMedia(id)`
1. Encontra filme por ID
2. URL = `mediaFile \|\| trailUrl`
3. Cria `<a href="url" target="_blank">` temporário e clica
4. Remove o elemento

### Picker Folder
- `UI.initMediaPicker(prefix)`:
  - Botão `fa-folder-open` → input file oculto
  - Ficheiro seleccionado → `URL.createObjectURL(file)` → preenche `input[type=text]`
- Blob URL funciona com o anchor approach

---

## 16. Notificações de Estreias

### `Logic.checkEstreiaNotifications()`
- Executa no `window.onload` e a cada 60s
- Compara `movie.date` com hoje:
  - `diff === 0` → "ESTREIA HOJE!" (verde)
  - `diff 1..3` → "Faltam X dia(s)" (laranja)
  - `diff < 0` → "ESTREIA PASSOU!" (vermelho, com botão remover)
- Controlo diário: localStorage `'cinecatalog_notif_YYYY-MM-DD'`
- Máx 4 notificações/dia
- Primeira exibição do dia: fecho manual; seguintes: auto‑fecho 5s

### Interface
- Overlay: `#notification-overlay`
- Lista: `#notification-list`
- Badge: `#notification-badge`
- `UI.toggleNotifications()` / `UI.closeNotifications()`

---

## 17. Importação / Exportação

### Exportar
- `Logic.exportData()` — gera `data:text/json` com `JSON.stringify(APP_STATE.movies)`
- Descarrega como `CineCatalog_Backup.json`

### Importar
- Input file oculto (`accept=".json"`)
- `Logic.importData(e)` — lê ficheiro, faz parse, substitui `APP_STATE.movies`
- Chama `Storage.save()` + `Render.all()`

---

## 18. Funções Globais e Utilitárias

### `UI.updateCounters()` (linha ~2266)
Conta filmes/séries/estreias e actualiza `#counter-*` no modal.

### `UI.updateFooterStats()` (linha ~2278)
Calcula total + exibidos, actualiza `#stats-counter`.

### `UI.resetAllForms()` (linha ~2293)
Limpa todos os campos (textos, selects, estrelas, posters, status) nos 3 tabs.

### `Logic.showStatus(msg)` (linha ~1906)
Mensagem temporária no footer (`#user-action-status`), auto‑oculta 2s.

### `Logic.showModalStatus(msg, type)` (linha ~1913)
Toast no modal (`#modal-toast`), verde (success) ou vermelho (error), 3s.

### `Logic.maskDuration(input)` (linha ~1734)
Máscara de duração: "2h 30min". Últimos 2 dígitos = minutos, anteriores = horas.

### `Logic.toggleStatus(el)` (linha ~2045)
Alterna classe `active-{status}` num item de status.

### `Logic.toggleEstreiaType(el)` (linha ~2054)
Toggle exclusivo entre "filmes" e "series" nas estreias.

---

## 19. Teclado

| Tecla | Acção |
|-------|-------|
| F12 | Prevenido (`preventDefault`) |
| ESC | Fecha `#reminder-popup` |
| Enter (no `#cat-input`) | `Logic.addCategory(valor)` |

---

## 20. Estrutura de Dados (Movie Object)

### Tipo `filmes`
```javascript
{
  id: String,              // Date.now().toString() ou _editingId
  type: 'filmes',
  originalTitle: String,
  titlePt: String,
  year: String,
  duration: String,         // formatado como "2h 30min"
  desc: String,
  director: String,
  cast: String,
  genre: String,            // valor do select de categorias
  image: String,            // base64, blob URL, URL normal ou placeholder
  trailUrl: String,
  otherInfo: String,
  mediaFile: String,        // URL manual ou blob URL do folder picker
  statuses: {
    new: Boolean,
    watch: Boolean,
    favorite: Boolean
  },
  stars: Number,            // 0‑5
  reminder: String,         // (opcional) texto do lembrete
  reminderCreatedAt: Number // (opcional) timestamp
}
```

### Tipo `series`
Mesmo que `filmes` +:
```javascript
{
  season: String,
  episodeNumber: String
}
```

### Tipo `estreias`
```javascript
{
  id: String,
  type: 'estreias',
  originalTitle: String,
  titlePt: String,
  date: String,            // formato YYYY-MM-DD
  duration: String,
  desc: String,
  director: String,
  cast: String,
  genre: String,
  language: String,
  studio: String,
  trailUrl: String,
  image: String,           // sempre placeholder
  estreiaType: String      // 'filmes' ou 'series' (toggle)
}
```

---

## localStorage — Chaves Utilizadas

| Chave | Conteúdo |
|-------|----------|
| `cinecatalog_v126` | JSON Array de movie objects |
| `cinecatalog_categories` | JSON Array de nomes de categorias |
| `cinecatalog_notif_YYYY-MM-DD` | `{ count, closed, firstShown }` |

---

## Checklist de Funcionalidades

| Funcionalidade | Estado |
|----------------|--------|
| Cadastro de Filmes | ✅ |
| Cadastro de Séries | ✅ |
| Cadastro de Estreias | ✅ |
| Editar (todos os tipos) | ✅ |
| Upload de poster (arrastar/colar/URL) | ✅ |
| Compressão de imagem (max 300KB) | ✅ |
| Link do Filme (URL manual) | ✅ |
| Link do Filme (Picker Folder → blob URL) | ✅ |
| Link do Trailer | ✅ |
| Categorias (CRUD) | ✅ |
| Favoritos | ✅ |
| Status (Novo / Assistir / Favorito) | ✅ |
| Avaliação por estrelas (1‑5) | ✅ |
| Lembretes (criar/editar/remover) | ✅ |
| Painel de Lembretes (lista + contador + scroll) | ✅ |
| Pesquisa (debounce 300ms) | ✅ |
| Filtros (Todos / Novos / Assistir / Favoritos) | ✅ |
| Vistas (Filmes / Séries / Estreias) | ✅ |
| Zoom (5/6/7/8 colunas) | ✅ |
| Tema claro/escuro | ✅ |
| Menu de contexto (clique direito) | ✅ |
| Play overlay em cards com media/trailer | ✅ |
| Notificações de estreias | ✅ |
| Footer com contagem do acervo em tempo real | ✅ |
| Importação / Exportação JSON | ✅ |
| Persistência localStorage | ✅ |
| SALVAR (normal) — fecha modal | ✅ |
| SALVAR + (lote) — sem fechar, duplicidade bloqueada | ✅ |
| Prevenção F12 | ✅ |
| Scroll infinito (batch 20 cards) | ✅ |
