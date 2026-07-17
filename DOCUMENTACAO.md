# CineCatalog Elo — Documentação do Aplicativo

**Versão:** 1.2.6  
**Tipo:** Aplicação Web Single-Page (SPA)  
**Armazenamento:** localStorage do navegador  
**Público-alvo:** Gerenciamento pessoal de catálogo de filmes, séries e estreias

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Acervo: Cadastro de Itens](#2-acervo-cadastro-de-itens)
3. [Visualização do Acervo](#3-visualização-do-acervo)
4. [Busca e Filtros](#4-busca-e-filtros)
5. [Sistema de Status](#5-sistema-de-status)
6. [Classificação por Estrelas](#6-classificação-por-estrelas)
7. [Modal de Informações](#7-modal-de-informações)
8. [Lembretes](#8-lembrettes)
9. [Notificações de Estreias](#9-notificações-de-estreias)
10. [Histórico de Cadastro (Log A4)](#10-histórico-de-cadastro-log-a4)
11. [Gerar Lista A4](#11-gerar-lista-a4)
12. [Dashboard com Gráficos](#12-dashboard-com-gráficos)
13. [Gerenciamento de Categorias](#13-gerenciamento-de-categorias)
14. [Temas](#14-temas)
15. [Configurações](#15-configurações)
16. [Importação e Exportação de Dados](#16-importação-e-exportação-de-dados)
17. [Zoom e Densidade de Cards](#17-zoom-e-densidade-de-cards)
18. [Menu de Contexto](#18-menu-de-contexto)
19. [Poster: Upload, Colagem e URL](#19-poster-upload-colagem-e-url)
20. [Animações e Efeitos Visuais](#20-animações-e-efeitos-visuais)
21. [Teclas de Atalho](#21-teclas-de-atalho)
22. [Performance](#22-performance)
23. [Dependências Externas](#23-dependências-externas)

---

## 1. Visão Geral

O CineCatalog Elo é um aplicativo web para organizar e gerenciar um catálogo pessoal de filmes, séries e estreias. Todo o conteúdo é armazenado no navegador via **localStorage** (chave `cinecatalog_v126`), funcionando offline após o primeiro carregamento.

### Navegação Principal

- **Filmes** — catálogo principal de filmes
- **Séries** — episódios de séries com suporte a temporadas
- **Estréias** — lançamentos futuros com contagem regressiva

---

## 2. Acervo: Cadastro de Itens

O formulário de cadastro (modal `#modal-cadastro`) possui três abas: **Filmes**, **Séries** e **Estréias**.

### Aba Filmes

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Título Original | Texto | Nome original da obra |
| Título Português | Texto (obrigatório) | Nome em português |
| Ano | Texto | Ano de lançamento |
| Duração | Texto | Máscara automática HH:MM |
| Diretor | Texto | Nome do diretor |
| Elenco | Texto | Atores principais |
| Categoria | Select | Lista de categorias cadastradas |
| Classificação | Estrelas (0-5) | Clique para avaliar |
| Sinopse | Textarea | Descrição do filme |
| Poster | Upload/URL/Paste | Upload de imagem com compressão automática |
| Media | URL + Arquivo | Link ou arquivo do vídeo |
| Trailer | URL | Link do trailer |
| Outras Informações | Textarea | Dados adicionais |
| Status | Checkboxes | Novo / Assistir / Favorito |

### Aba Séries

Mesmos campos de Filmes, acrescido de:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Temporada | Número | Número da temporada |
| N.º Episódio | Número | Número do episódio |
| **Acordeão de Temporadas** | Estrutura aninhada | Adicionar temporadas com episódios |

O acordeão de temporadas permite cadastrar múltiplas temporadas, cada uma com seus episódios (número, título e mídia). Os dados são salvos como um array `seasons: [{ number: N, episodes: [{ number: N, title: "", mediaFile: "" }] }]`.

### Aba Estréias

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Data | Date picker | Data de lançamento prevista |
| Duração | Texto | Duração estimada |
| Título Original | Texto | Nome original |
| Título Português | Texto | Nome em português |
| URL do Trailer | URL | Link do trailer |
| Tipo | Filmes / Séries | Tipo da estreia (exclusivo) |

Campos adicionais no acordeão "Mais informações": Diretor, Elenco, Sinopse, Idioma, Estúdio/Produtora, Categoria.

### Ações do Formulário

- **SALVAR** — salva o item e fecha o modal
- **SALVAR +** — salva o item e limpa os campos para cadastro em lote (com duplicação automática por mesmo título)
- **CLONAR DADOS** (em modo edição) — duplica o item com um novo ID

---

## 3. Visualização do Acervo

O acervo pode ser visualizado em três modos distintos:

### Grade (Grelha) — `viewMode: 'grid'`

Os cards são organizados em uma grade responsiva agrupados por categoria. Cada seção exibe um cabeçalho com o nome da categoria e a contagem de títulos. O número de colunas é controlado pelo zoom.

### Carrossel — `viewMode: 'carrossel'`

Duas fileiras de cards com rolagem horizontal. Cada fileira exibe 5 cards por vez com setas de navegação (esquerda/direita). A rolagem move um card por vez com animação via `transform: translateX`.

### Cine Marquee — `viewMode: 'marquee''

Efeito cinematográfico com duas fileiras rolantes em direções opostas. Os cards são duplicados para criar um loop infinito sem costura. Configurável:

- **Velocidade:** slider de 10s a 60s
- **Efeito:** Linear (constante), Suave (ease-in-out), Alternado (direção alternada)
- **Pausar/Retomar:** botões para controle manual

---

## 4. Busca e Filtros

### Busca

- Ativada pelo ícone de lupa no cabeçalho
- **Mínimo de 3 caracteres** para ativar
- **Busca booleana:** use `+` para AND lógico (ex: `ação+futuro`)
- Campos pesquisados: título PT, título original, diretor, elenco, gênero, sinopse
- **Debounce de 350ms** para evitar processamento excessivo
- Cards correspondentes ganham um **brilho neon verde** (`search-match`)

### Histórico de Busca

- Últimos 5 termos salvos em `localStorage` (`cinecatalog_search_history`)
- Termos clicáveis para reaplicar a busca
- Botão X para remover termo individual

### Filtros

Painel de filtros acessível pelo ícone de funil no cabeçalho:

| Filtro | Comportamento |
|--------|--------------|
| Todos | Reseta todos os filtros e ordenação |
| Recente | Ordena por ano (decrescente) |
| Antigos | Ordena por ano (crescente) |
| A-Z | Ordena alfabeticamente por título |
| Favoritados | Exibe apenas favoritos |
| Novo / Assistir / Favorito | Filtra por status |
| Categoria | Filtra por categoria (até 7 exibidas) |
| Ano | Filtra por ano (top 10 da visualização atual) |

---

## 5. Sistema de Status

Cada item pode receber três status não-exclusivos:

| Status | Ícone | Cor | Descrição |
|--------|-------|-----|-----------|
| **Novo** | `fa-star` | Azul | Item recém-adicionado |
| **Assistir** | `fa-eye` | Âmbar | Pendente de visualização |
| **Favorito** | `fa-heart` | Vermelho | Item favoritado |

Os status aparecem como pills nos cards, no modal de informações, no dashboard e na lista gerada. O favorito também exibe um coração pulsante no canto superior direito do card.

---

## 6. Classificação por Estrelas

- Escala de 0 a 5 estrelas
- Clique na estrela desejada para definir; clique na mesma estrela para desmarcar (volta a 0)
- Exibida no canto inferior do card e no modal de informações
- Cor configurável nas configurações (padrão: `#EAB308` — dourado)

---

## 7. Modal de Informações

### Modal de Filme (`#modal-movie-info`)

- Poster em destaque com fallback
- Título com gradiente
- Ano, duração, link do trailer
- Pills de status
- Sinopse, diretor, elenco
- Botão "EXECUTAR FILME" (abre mídia ou trailer)
- Botão **Editar** (abre cadastro preenchido)
- Navegação entre itens: setas anterior/próximo com contador "X DE Y"
- Fecha com clique no fundo ou tecla Escape

### Modal de Série (`#modal-series-info`)

Mesma estrutura do modal de filme, acrescido de:

- **Seletor de temporada** (dropdown)
- **Lista de episódios** (pills clicáveis)
- Episódios com mídia: ícone roxo; sem mídia: ícone cinza
- Botão "EXECUTAR EPISÓDIO"
- Episódio ativo: borda roxa com brilho

---

## 8. Lembretes

### Criação

- Botão no cabeçalho (ícone de post-it) abre o painel de lembretes
- Menu de contexto > "Criar Lembrete"
- Texto livre em textarea, salvo com timestamp

### Exibição

- **Ícone de post-it** no canto superior direito do card quando há lembrete
- **Tooltip** com data de criação + texto do lembrete
- **Painel de lembretes** (`#reminder-panel`): lista todos os itens com lembrete, exibindo título, gênero, data e texto; botão de excluir por item
- **Badge** no ícone do cabeçalho com a contagem total de lembretes

---

## 9. Notificações de Estreias

O sistema verifica automaticamente as datas das estreias em relação à data atual:

| Tipo | Cor | Ícone | Condição |
|------|-----|-------|----------|
| Estreia Hoje! | Verde | `fa-calendar-check` | diff === 0 |
| Faltam N dias | Laranja | `fa-clock` | diff 1-3 dias |
| Estreia Passou! | Vermelho | `fa-calendar-times` | diff < 0 |

Controle de exibição via localStorage (`cinecatalog_notif_YYYY-MM-DD`):
- Primeira exibição do dia: fechamento manual obrigatório
- Até 4 exibições por dia, as seguintes fecham automaticamente após 5s
- Estreias passadas têm botão de exclusão

---

## 10. Histórico de Cadastro (Log A4)

Modal acessível pelo ícone `fa-clipboard-list` no cabeçalho.

Funcionalidades:

- Lista todos os itens cadastrados ordenados por data de criação
- **Agrupamento por mês/ano** com contagem de títulos por grupo
- **Tabela numerada** com colunas: #, Data, Dia da Semana, Título, Tipo, Categoria
- **Paginação** (50 itens por página)
- **Cabeçalho A4** com logotipo, título, data de geração e total de títulos
- **Exportação:**
  - **Imprimir** — janela de impressão do navegador
  - **Exportar PDF** — janela de impressão com destino "Salvar como PDF"
  - **Exportar JPG** — usa html2canvas (carregado sob demanda via CDN)
  - **Exportar WEBP** — mesmo mecanismo do JPG, formato WebP

---

## 11. Gerar Lista A4

Modal acessível pelo botão "GERAR LISTA" nos controles de visualização.

- Gera uma lista A4 dos itens da visualização atual (respeita busca ativa)
- **30 itens por página** com paginação
- Colunas: #, Título, Original, Ano, Diretor, Categoria, Status
- Cabeçalho customizável (logo, título, data, número da página)
- Exportação: Imprimir, PDF, JPG

---

## 12. Dashboard com Gráficos

Acessível pelo ícone de gráfico no cabeçalho. Utiliza **Chart.js 4.4.7**

### Cards de Estatística

- Total de Títulos
- Filmes (azul)
- Séries (roxo)
- Estreias (âmbar)

### Gráficos

| Gráfico | Tipo | Descrição |
|---------|------|-----------|
| chart-type | Donut | Distribuição por tipo (Filmes/Séries/Estreias) |
| chart-status | Donut | Distribuição por status |
| chart-genre | Barras | Top 10 categorias |
| chart-ratings | Barras | Distribuição de avaliações (0-5 estrelas) |

Os gráficos são destruídos e recriados a cada abertura para evitar vazamento de memória. Cores adaptadas ao tema ativo.

---

## 13. Gerenciamento de Categorias

Gerenciável pelo botão "GERIR" ao lado do seletor de categorias.

- **Adicionar:** campo de texto + botão "Adicionar" (Enter também adiciona)
- **Remover:** botão X ao lado de cada categoria (com confirmação)
- **Persistência:** salvo em `localStorage` (`cinecatalog_categories`)
- **Categorias padrão:** Ação, Comédia, Drama, Ficção Científica, Terror
- Utilizadas em: formulário de cadastro, filtros, visualização em grade, dashboard

---

## 14. Temas

Quatro temas disponíveis no menu de temas (ícone no cabeçalho):

| Tema | Classe | Descrição |
|------|--------|-----------|
| **Dark** (padrão) | — | Fundo escuro, texto claro |
| **Light** | `theme-light light-mode` | Fundo claro, texto escuro |
| **Amber Noir** | `theme-amber` | Tons âmbar e preto |
| **Midnight** | `theme-midnight` | Tons índigo e roxo |

A seleção persiste em `localStorage` (`cinecatalog_theme`). O ícone muda conforme o tema (lua/sol/fogo/estrela).

---

## 15. Configurações

Acessível pelo ícone de engrenagem no cabeçalho.

### Personalização

| Seção | Opções |
|-------|--------|
| **Logotipo** | URL da imagem, preview |
| **Acervo Vazio** | Ícone (FontAwesome), título, subtítulo customizáveis |
| **Cards** | Cor das estrelas, cor/ano do ano, cores de fundo dos status, cor da categoria |
| **Caminhos** | Pastas de Cards, Vídeos, Backups, Acervo (com ativação e seletor de pasta) |
| **Auto Salvamento** | Ativar/desativar, caminho da pasta |

### Reset

- Exibe total de itens no acervo
- Botão "ELIMINAR TODO O ACERVO" com dupla confirmação

---

## 16. Importação e Exportação de Dados

### Exportar

- Botão de download (ícone no cabeçalho)
- Estrutura: `{ movies: [...], categories: [...], config: { theme: "..." } }`
- Nome do arquivo: `CineCatalog_Backup.json`

### Importar

- Botão de upload (ícone no cabeçalho)
- Aceita arquivos JSON
- Suporta formato completo (`{ movies: [...] }`) e array simples
- Restaura filmes, categorias e tema
- Feedback visual de sucesso/erro

---

## 17. Zoom e Densidade de Cards

Quatro níveis de zoom que controlam o número de colunas (`--cards-per-row`):

| Nível | Colunas |
|-------|---------|
| 1X | 5 (padrão) |
| 2X | 6 |
| 3X | 7 |
| 4X | 8 |

Botões em formato de pill no cabeçalho; nível ativo destacado.

---

## 18. Menu de Contexto

Acionado com clique direito sobre qualquer card.

| Opção | Ação |
|-------|------|
| **Info** | Abre o modal de informações do item |
| **Editar** | Abre o formulário de cadastro preenchido |
| **Favoritar / Desfavoritar** | Alterna o status de favorito |
| **Criar Lembrete** | Abre o popup de lembrete |
| **Remover** | Exclui o item (com confirmação) |

Posicionado nas coordenadas do mouse, fade-in/fade-out (200ms), fecha ao clicar fora.

---

## 19. Poster: Upload, Colagem e URL

A área de poster no formulário de cadastro suporta:

- **Upload:** clique para selecionar arquivo (JPG, PNG, WebP)
- **Drag & Drop:** arraste uma imagem sobre a área
- **Colar (Paste):** Ctrl+V de uma imagem da área de transferência
- **URL:** campo separado para imagem externa
- **Compressão automática:** redimensiona para <300KB via Canvas API
- **Preview:** exibe a imagem com opção de limpar

---

## 20. Animações e Efeitos Visuais

### Cards

- Hover: `translateY(-6px)` + `scale(1.02)` com brilho azul na borda
- Coração favorito: pulsação (keyframe `heartBeat`)
- Botão de play: `scale(1.12)` com brilho vermelho no hover
- Busca: borda neon verde (`search-match`)

### Modais

- Abertura: keyframe `modalIn` (scale 0.95→1, translateY 10px→0)
- Fechamento: fade-out com escala
- Botão fechar: `rotate(90deg)` no hover com brilho vermelho

### Ícones de 28 Funcionalidades

No modal de informações do app, há uma grade interativa com 28 itens. Cada item possui:

- Ícone + título + descrição curta
- Clique: animação `iconPop` (escala 1→1.25→0.9→1)
- Item ativo: borda roxa com brilho
- Hover: borda ciano com brilho, leve levantamento

### Marquee

- Duas fileiras em direções opostas
- Velocidade ajustável (10s–60s)
- Efeitos: linear, suave (ease-in-out), alternado
- Loop infinito sem costura via duplicação de itens

### Tooltips

Todos os botões do cabeçalho, abas, botões de zoom e navegação possuem tooltips CSS (`::after`): fundo escuro, texto branco, borda, sombra.

### Scrollbar

Customizada: 5px de largura, polegar com cor de destaque azul.

---

## 21. Teclas de Atalho

| Tecla | Ação |
|-------|------|
| **Esc** | Fecha modais, popups, menus de contexto |
| **F12** | Bloqueado (previne DevTools) |
| **Enter** | No campo de categoria, adiciona a categoria |
| **Clique fora** | Fecha menus de contexto e alguns modais |

---

## 22. Performance

O aplicativo emprega as seguintes estratégias de performance:

- **Renderização por lotes (batch):** 20 cards por lote com carregamento sob demanda via scroll
- **DocumentFragment:** appends em lote para mínimo de reflow
- **Debounce:** busca com 350ms de atraso
- **requestAnimationFrame:** throttling do handler de scroll
- **Cache de queries DOM:** referências cacheadas para container e empty-state
- **CSS `row-gap`/`column-gap` explícitos:** sem ambiguidade de layout
- **html2canvas sob demanda:** carregado via CDN apenas quando necessário (exportação JPG/WEBP)
- **Armazenamento local:** sem chamadas de rede; funciona offline
- **Compressão de imagens:** redimensionamento via Canvas para <300KB

---

## 23. Dependências Externas

A aplicação carrega as seguintes bibliotecas via CDN (necessário estar online no primeiro carregamento):

| Biblioteca | Versão | Uso |
|------------|--------|-----|
| **Tailwind CSS** | CDN (latest) | Utilitários de estilo |
| **Font Awesome** | 6.4 | Ícones |
| **Google Fonts (Inter)** | — | Fonte principal |
| **Chart.js** | 4.4.7 | Gráficos do dashboard |
| **html2canvas** | 1.4.1 | Exportação de imagens (carregado sob demanda) |

---

*Documentação gerada em maio de 2026. Para sugestões ou reportar problemas, visite [github.com/anomalyco/opencode](https://github.com/anomalyco/opencode).*
