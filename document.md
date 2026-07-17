# Análise do Projeto — CineCatalog Elo v1.2.6

**Data da análise:** 25/05/2026
**Arquivo principal:** `index.html` (~6160 linhas, single‑file)
**Stack:** HTML + CSS (Tailwind via CDN) + Vanilla JavaScript puro
**Persistência:** `localStorage` (chave `cinecatalog_v126`)
**Tipo:** Catálogo pessoal de filmes/séries/estreias (SPA)

---

## Estrutura de Diretórios

```
14_Catalogo_Jonas/
├── index.html                          ← Aplicação principal (tudo em um arquivo)
├── analise.md                          ← Análise inicial do projeto
├── checkpoint.md                       ← Checkpoint v1.3.0
├── checkpoint_02.md                    ← Checkpoint com correções e melhorias
├── checkpoint_03.md                    ← Checkpoint final com funcionalidades consolidadas
├── DOCUMENTACAO.md                     ← Documentação completa de funcionalidades
├── CINECATALOG_DOCUMENTACAO.md         ← Documentação técnica detalhada
├── document.md                         ← ESTE ARQUIVO
├── cinecatalogo.png                    ← Logotipo original
├── backup/
│   └── index_20260523_1556.html       ← Backup do HTML anterior
├── cards/                              ← 20 posters/imagens de filmes
│   ├── 01-oblivion.jpg
│   ├── 02-uma-vida-sete-dias.webp
│   ├── 03-o-resgate.jpg
│   ├── ... (20 arquivos no total)
├── filmes/
│   └── O-Bunker-Projeto-12.mp4         ← Vídeo de exemplo
├── logotipo/
│   └── cinecatalogo.png               ← Cópia do logotipo
├── referencia/
│   └── info.jpg                        ← Imagem de referência
├── versoes/                            ← Versões antigas do HTML
│   ├── versao_1/index5g.html
│   ├── versao_2/index7g1.html
│   └── versao_3/ (vazia)
└── CineCatalog/                        ← Projeto WPF Desktop (.NET 8 + MVVM)
    ├── CineCatalog.sln
    ├── estrutura.md                    ← Documentação da estrutura WPF
    └── CineCatalog/
        ├── CineCatalog.csproj
        ├── App.xaml / App.xaml.cs
        ├── MainWindow.xaml / MainWindow.xaml.cs
        ├── Models/ (CatalogItem, MovieItem, SeriesItem, AppSettings)
        ├── Services/ (IDataService, JsonDataService, IFileDialogService, FileDialogService)
        ├── ViewModels/ (MainViewModel, CatalogViewModel, ItemDetailViewModel, SettingsViewModel)
        ├── Views/ (CatalogView, SettingsView, ItemDetailDialog)
        ├── Controls/ (MovieCard)
        ├── Converters/ (Converters, StringNotEmptyConverter)
        └── Themes/ (Generic.xaml, Light.xaml)
```

---

## Arquitetura da Aplicação Web

### Estrutura do index.html

| Seção | Linhas | Conteúdo |
|-------|--------|----------|
| CSS | 1–1713 | Identidade visual (variáveis CSS), componentes, animações, temas (Dark/Light/Amber Noir/Midnight) |
| Header | 1718–1838 | Logo, navegação (Filmes/Séries/Estreias), botões (cadastrar, pesquisa, filtros, zoom, tema, export/import, configurações, notificações, lembretes) |
| Search Bar | 1841–1849 | Campo de pesquisa com debounce e histórico |
| Content Canvas | 1851–1867 | Empty state + container dinâmico para cards |
| Footer | 1869–1880 | Marca, indicador de auto-save, status, contador de títulos |
| Modais | 1882–2877 | Cadastro, menu contexto, lembretes, categorias, notificações, info filme, info série, dashboard, configurações, info funcionalidades, gerar lista A4, histórico A4 |
| Script (1.º bloco) | 2879–3235 | `APP_STATE`, `Storage`, `loadConfig`/`saveConfig`/`applyConfig`, `Render` |
| Script (2.º bloco) | 3237–6160 | `Logic` (lógica de negócio), `UI` (manipulação de interface), funções globais (`saveMovie`, `saveMovieAndContinue`) |

### Objetos JavaScript Principais

#### `APP_STATE`
```javascript
{
  movies: [],            // Array de todas as entradas do catálogo
  currentView: 'filmes', // Aba ativa: 'filmes' | 'series' | 'estreias'
  activeFilter: 'all',   // Filtro ativo
  searchQuery: '',       // Termo de pesquisa atual
  selectedId: null,      // ID do item alvo
  searchTimer: null,     // Referência do debounce
  sortBy: 'default',     // Ordenação
  filterYear: '',        // Ano filtrado
  viewMode: 'grid',      // 'grid' | 'carrossel' | 'marquee'
  marqueeEffect: 'linear',
  zoom: 5               // Número de colunas
}
```

#### `Storage`
| Método | Descrição |
|--------|-----------|
| `save()` | Serializa `APP_STATE.movies` → `localStorage('cinecatalog_v126')`, atualiza contadores |
| `load()` | Lê localStorage, faz parse, migra dados legados, chama `Render.all()` |

#### `Render`
| Propriedade/Método | Descrição |
|-------------------|-----------|
| `BATCH_SIZE` (20) | Cards por batch no lazy-load |
| `all()` | Filtra, limpa container, mostra/oculta empty state, renderiza conforme view mode |
| `_loadMore()` | Renderiza próximo batch de até 20 cards (scroll infinito) |
| `createCard(data)` | Cria um `.movie-card` completo |
| `_renderEstreias(items)` | Renderiza lista de estreias em formato de linhas |

#### `Logic`
Módulo de lógica de negócio: CRUD, busca, filtros, categorias, notificações, reprodução de mídia, temas, modos de visualização.

#### `UI`
Módulo de interface: modais, formulários, posters, tooltips, configurações.

---

## Modelo de Dados (JSON)

### Tipo `filmes`
```javascript
{
  id: String,                    // Date.now().toString()
  type: 'filmes',
  originalTitle: String,
  titlePt: String,               // Obrigatório
  year: String,
  duration: String,              // Formatado como "2h 30min"
  desc: String,
  director: String,
  cast: String,
  genre: String,                 // Categoria
  image: String,                 // base64, blob URL, URL ou placeholder
  trailUrl: String,
  otherInfo: String,
  mediaFile: String,             // URL do vídeo
  statuses: { new: Boolean, watch: Boolean, favorite: Boolean },
  stars: Number,                 // 0–5
  reminder: String,              // (opcional) texto do lembrete
  reminderCreatedAt: Number,     // (opcional) timestamp
  _createdAt: String             // Timestamp de criação
}
```

### Tipo `series`
Mesmo que `filmes` + `season: String`, `episodeNumber: String`, e suporte a `seasons: [{ number: N, episodes: [{ number: N, title: String, mediaFile: String }] }]`

### Tipo `estreias`
```javascript
{
  id: String,
  type: 'estreias',
  estreiaType: 'filmes' | 'series',
  originalTitle: String,
  titlePt: String,
  date: String,                  // YYYY-MM-DD
  duration: String,
  desc: String,
  director: String,
  cast: String,
  genre: String,
  language: String,
  studio: String,
  trailUrl: String,
  image: 'https://via.placeholder.com/300x450'
}
```

---

## Funcionalidades Implementadas

### Cadastro e Gestão
- [x] Cadastro de Filmes (formulário com 18 campos)
- [x] Cadastro de Séries (com temporadas/episódios aninhados)
- [x] Cadastro de Estreias (com data e contagem regressiva)
- [x] Edição de todos os tipos (preserva `_createdAt`)
- [x] Clonar dados (em modo edição)
- [x] Upload de poster (clique, drag & drop, colar Ctrl+V, URL)
- [x] Compressão automática de imagem (<300KB via Canvas API)
- [x] Link do filme (URL manual ou Picker Folder com blob URL)
- [x] Link do trailer
- [x] Reprodução de mídia (play overlay nos cards)

### Categorias e Classificação
- [x] Gestão de categorias (CRUD, localStorage `cinecatalog_categories`)
- [x] 5 categorias padrão: Ação, Comédia, Drama, Ficção Científica, Terror
- [x] Avaliação por estrelas (0–5, com desseleção ao clicar na mesma)
- [x] Status: Novo / Assistir / Favorito (não exclusivos)

### Lembretes
- [x] Criar/editar/remover lembretes por item
- [x] Painel de lembretes com lista, contador e scroll
- [x] Badge no cabeçalho com contagem total
- [x] Ícone sticky-note no card com tooltip (data + texto)

### Visualização
- [x] 3 abas de navegação: Filmes, Séries, Estreias
- [x] 3 modos de visualização: Grade (Grelha), Carrossel, Cine Marquee
- [x] Grade agrupada por categoria com cabeçalhos de seção
- [x] Carrossel com 2 fileiras e setas de navegação
- [x] Cine Marquee: loop infinito, velocidade ajustável (10s–60s), 3 efeitos
- [x] 4 níveis de zoom (5, 6, 7, 8 colunas)
- [x] Scroll infinito (batches de 20 cards)

### Busca e Filtros
- [x] Busca com debounce de 350ms
- [x] Busca booleana com operador `+` (AND lógico)
- [x] Histórico de busca (últimos 5 termos, localStorage)
- [x] Brilho neon verde nos cards correspondentes (`search-match`)
- [x] Filtros: Todos, Recente, Antigos, A-Z, Favoritados
- [x] Filtros por status: Novo, Assistir, Favorito
- [x] Filtros por categoria e por ano

### Modais
- [x] Modal de Informações do Filme (poster, sinopse, dados, executar)
- [x] Modal de Informações da Série (com seletor de temporada + episódios)
- [x] Navegação entre itens (anterior/próximo com contador "X DE Y")
- [x] Menu de contexto (clique direito): Info, Editar, Favoritar, Lembrete, Remover
- [x] Modal de 28 Funcionalidades (grade interativa com descrições)

### Dashboard
- [x] 4 cartões de estatística (Total, Filmes, Séries, Estreias)
- [x] Gráfico Donut: distribuição por tipo
- [x] Gráfico Donut: distribuição por status
- [x] Gráfico de Barras: top 10 categorias
- [x] Gráfico de Barras: distribuição de avaliações
- [x] Chart.js 4.4.7 com destruição/recriação a cada abertura

### Temas
- [x] Dark (padrão)
- [x] Light
- [x] Amber Noir (tons âmbar)
- [x] Midnight (tons índigo/roxo)
- [x] Persistência em localStorage (`cinecatalog_theme`)

### Configurações
- [x] Logotipo customizável (URL)
- [x] Acervo Vazio (ícone, título, subtítulo)
- [x] Personalização de cards (cores de estrelas, ano, status, categoria)
- [x] Caminhos de pastas (Cards, Vídeos, Backups, Acervo) com ativação
- [x] Auto Salvamento (com indicador no footer)
- [x] Reset total com dupla confirmação

### Exportação/Importação
- [x] Exportar dados (JSON com filmes, categorias, tema)
- [x] Importar dados (JSON formato completo ou array simples)
- [x] Gerar Lista A4 (30 itens/página, paginação)
- [x] Exportar Lista: Imprimir, PDF, JPG
- [x] Histórico de Cadastro A4 (agrupado por mês, paginação 50/página)
- [x] Exportar Log: Imprimir, PDF, JPG, WEBP

### Notificações
- [x] Notificações de estreias (Hoje!, Faltam N dias, Passou!)
- [x] Verificação automática a cada 60s
- [x] Controle de exibição (máx 4x/dia via localStorage)
- [x] Badge no ícone do sino

### Performace e UX
- [x] Renderização em lotes com DocumentFragment
- [x] requestAnimationFrame no handler de scroll
- [x] Cache de queries DOM
- [x] Tooltips CSS em todos os botões
- [x] html2canvas carregado sob demanda
- [x] Atalhos de teclado (Esc fecha modais, F12 bloqueado)
- [x] Animações: hover cards, modalIn, iconPop, marquee, coração pulsante

---

## Dependências Externas (CDN)

| Biblioteca | Versão | Uso |
|------------|--------|-----|
| Tailwind CSS | latest (CDN) | Utilitários de estilo |
| Font Awesome | 6.4.0 | Ícones |
| Google Fonts (Inter) | — | Fonte principal |
| Chart.js | 4.4.7 | Gráficos do dashboard |
| html2canvas | 1.4.1 | Exportação de imagens (sob demanda) |

---

## localStorage — Chaves Utilizadas

| Chave | Conteúdo |
|-------|----------|
| `cinecatalog_v126` | JSON Array de movie objects |
| `cinecatalog_categories` | JSON Array de nomes de categorias |
| `cinecatalog_theme` | String do tema ativo |
| `cinecatalog_config` | JSON com configurações (logo, cores, caminhos) |
| `cinecatalog_search_history` | JSON Array dos últimos 5 termos de busca |
| `cinecatalog_notif_YYYY-MM-DD` | `{ count, closed, firstShown }` controle de notificações |

---

## Projeto WPF Desktop (CineCatalog/)

Projeto paralelo em .NET 8 + WPF com arquitetura MVVM pura (`CommunityToolkit.Mvvm 8.2.2`).

| Camada | Descrição |
|--------|-----------|
| **Models** | `CatalogItem` (base), `MovieItem`, `SeriesItem`, `AppSettings` |
| **Services** | `JsonDataService` (persistência JSON em `%LOCALAPPDATA%`), `FileDialogService` |
| **ViewModels** | `MainViewModel`, `CatalogViewModel`, `ItemDetailViewModel`, `SettingsViewModel` |
| **Views** | `CatalogView`, `SettingsView`, `ItemDetailDialog` (Window modal) |
| **Controls** | `MovieCard` (proporção 9:14 com imagem, gradiente, badges) |
| **Themes** | Dark (Generic.xaml), Light (Light.xaml) |

Destaques: virtualização via `VirtualizingStackPanel`, busca com debounce e `CancellationTokenSource`, escrita atômica em JSON (temp + replace), reprodução via shell (`Process.Start`).

---

## Observações

1. **Arquivo único:** Toda a aplicação vive em um único `index.html` (~6160 linhas), o que facilita deploy mas dificulta manutenção.
2. **Persistência local:** 100% offline após primeiro carregamento, sem backend.
3. **WPF paralelo:** Existe um projeto desktop WPF com a mesma finalidade, ainda em desenvolvimento.
4. **Sem testes automatizados:** Não há framework de testes implementado.
5. **Sem responsividade mobile:** Layout otimizado para desktop.
6. **Código legado:** Algumas funções como `saveCurrentTab()` ainda existem mas não são usadas (substituídas por `saveMovie()` e `saveMovieAndContinue()`).
