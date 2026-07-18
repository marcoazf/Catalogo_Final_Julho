Realize as seguintes implementações por etapa, seguindo uma a uma. Ao final, adicione-a de forma numerada no documento "atualizacao_4.5.1.md". Efetue as seguintes melhorias, sem afetar ou interferir nas funcionalidades já existentes.

a) na janela Configurações, em ACERVO VAZIO, crie algumas funcionalidades:
b) mostre o tamanho do ícone que está na tela e permita que o usuário aumente/diminua este ícone em tempo real. E quando o usuário aumentar bastante este ícone, mantenha o texto com o ícone centralizado e ajustado corretamente na tela e em tempo real.
c) crie um botão também para ajustar a opacidade deste ícone.
d) para TÍTULO e SUBTÍTULO 1 e 2, crie botão para aplicar estilo "Negrito e Itálico" e ajustar o tamanho da fonte e da cor, abrindo um color picker.

e) em PERSONALIZAÇÃO DOS CARDS, inicie o aplicativo com a cor "preta" de fundo de GÊNEROS e o texto branco. Este deverá ser um ajuste padrão do aplicativo.

f) abaixo da seção de AUTO SALVAMENTO, crie a seção GESTÃO DE MÍDIA, com ícone de play. Crie um label chamado PLAYER DE VÍDEO. Para este label, crie um dropdown, que deverá carregar os players de vídeos exeistentes no sistema do usuário, como: 
- Padrão do Sistema
- Windows Media Player
- Personalizado (onde o usuário poderá através de um pick folder, escolher o arquivo .exe do seu player favorito.) E ele será reconhecido e salvo como o player que o usuário quer sempre utilizar para carregar e assistir seus filmes e séries. Abaixo, crie a descrição: Os filmes e séries abrirão maximizados no player escolhido. Os trailers deverão abrirem no navegador em tela cheia. Garanta que os player possa já abrir com full size (maximizado), assim como os trailers no Youtube pelo navegador em "tela cheia". Ao pressionar ESC, tanto o filme ou série no player, como o trailer no navegdor, deverão restaurar suas janelas para um tamanho menor.

g) em NOTIFICAÇÕES DE ESTRÉIAS, crie abaixo de ATIVAR NOTIFICAÇÕES on/off, o label DURAÇÃO (ms) com o valor em 5000. O usuário poderá customizar este valor. Adicione a descrição: Quando desativado, pop-ups de estréias não serão exibidos.

h) abaixo, crie a seção NOTIFICAÇÃO DE CADASTRO, com label ATIVAR on/off, com DURAÇÃO (ms) com o valor inicial  em 6000. O usuário poderá customizar a vontade. Esta duração, é o tempo que a mensagem "cadastro efetuado com sucesso!!!" ficará sendo exibida na tela de CADASTRO. Abaixo indique que: 6000 ms = 6 segundos e descrição: Controla a duração da mensagem "atualizado com sucesso!" após atualizar um cadastro ou salvar um Filme, Série ou Estréia.

Sempre faça uma revisão e checklist antes me entregar as novas implementações. Gere uma sintaxe limpa, fazendo uma revisão completa – verificando que todos os novos elementos, arrays e handlers existem coritem corretamente. Garanta que todas as funcionalidades, classes, variáveis estão funcionando perfeitamente, não foram alteradas ou mexidas e preservadas nas novas implementações de melhorias. Garanta que nada do que estava funcionando corretamente, seja influenciada ou gere alguma ruptura no aplicativo. sempre mantenha inicialmente tudo o que já funciona e está devidamente ajustado, como: paletas de cores, tipografia, layout, espaçamentos, divs e ids, entre outros itens...

---

## Implementações Realizadas — v4.6.0

### 1. Acervo Vazio: Ícone com Tamanho e Opacidade Ajustáveis

**Arquivo:** `index.html` — HTML (config-section Acervo Vazio) + JavaScript (`loadConfig`, `_populateConfigForm`, `applyConfig`, `_updateConfigPreview`)

**O que foi feito:**
- Adicionado campo de range **Tamanho Ícone** (`cfg-empty-icon-size`, 24–160px, padrão 56px) que ajusta o ícone em tempo real no preview e na tela principal.
- Adicionado campo de range **Opacidade Ícone** (`cfg-empty-icon-opacity`, 10–100%, padrão 100%) que controla a transparência do ícone.
- A função `applyConfig()` agora aplica `width`, `height`, `opacity` e `border-radius` dinâmicos no wrapper do ícone do empty-state.
- O preview na configuração reflete instantaneamente as mudanças de tamanho e opacidade.
- Novas propriedades: `emptyIconSize`, `emptyIconOpacity` no objeto de config.

**Preservação:** O ícone, título e subtítulos do empty-state mantêm sua estrutura original. A mudança é puramente visual e proporcional.

---

### 2. Acervo Vazio: Botões Bold/Itálico + Tamanho e Cor para Título e Subtítulos

**Arquivo:** `index.html` — HTML (config-section) + JavaScript (UI object)

**O que foi feito:**
- Para cada campo (Título, Subtítulo 1, Subtítulo 2), adicionados:
  - **Botão Negrito** (ícone `fa-bold`) — toggle com estado ativo (fundo azul)
  - **Botão Itálico** (ícone `fa-italic`) — toggle com estado ativo (fundo azul)
  - **Campo tamanho da fonte** (`cfg-empty-title-size`, `cfg-empty-sub1-size`, `cfg-empty-sub2-size`)
  - **Color picker** com swatch, hex input e seletor nativo
- Funções `UI._setToggleBtn(id, isActive)` e `UI._toggleEmptyStyle(target, prop)` criadas para gerenciar o estado toggle dos botões.
- O preview e o empty-state principal aplicam `font-weight`, `font-style`, `font-size` e `color` dinâmicos.
- Novas propriedades: `emptyTitleBold`, `emptyTitleItalic`, `emptyTitleSize`, `emptyTitleColor`, `emptySub1Bold`, `emptySub1Italic`, `emptySub1Size`, `emptySub1Color`, `emptySub2Bold`, `emptySub2Italic`, `emptySub2Size`, `emptySub2Color`.

**Preservação:** A estrutura HTML do empty-state (h2 + 2 parágrafos) não foi alterada. Apenas estilos dinâmicos foram adicionados via JavaScript.

---

### 3. Personalização dos Cards: Gêneros com Fundo Preto e Texto Branco (Padrão)

**Arquivo:** `index.html` — JavaScript (`loadConfig`, `resetCardsToDefault`) + HTML (color inputs)

**O que foi feito:**
- Alterado o padrão de `cardCategoryColor` de `''` para `'#FFFFFF'` (texto branco).
- Alterado o padrão de `cardCategoryBg` de `''` para `'#000000'` (fundo preto).
- Atualizados os valores `value` nos inputs de cor e nos swatches da seção GÊneros (topo do card) para refletir os novos padrões.
- Atualizada a função `resetCardsToDefault()` para usar os novos valores padrão.

**Preservação:** O sistema de personalização de cores dos cards continua funcionando normalmente. Os valores são apenas os novos padrões iniciais.

---

### 4. Gestão de Mídia: Seção com Player de Vídeo Configurável

**Arquivo:** `index.html` — HTML (nova config-section) + JavaScript (UI + Logic)

**O que foi feito:**
- Criada seção **GESTÃO DE MÍDIA** (`<i class="fas fa-play">`) abaixo de Auto Salvamento.
- **Dropdown PLAYER DE VÍDEO** com 3 opções:
  - **Padrão do Sistema** (`system`) — abre no navegador padrão
  - **Windows Media Player** (`wmp`) — tenta abrir via `wmplayer.exe`
  - **Personalizado** (`custom`) — exibe campo de caminho + botão folder picker para selecionar arquivo `.exe`
- Quando "Personalizado" é selecionado, a linha do caminho aparece dinamicamente (auto-toggle via `_toggleCustomPlayerRow()`).
- Função `Logic.openMediaWithPlayer(url, mediaType)` implementada:
  - **Trailers** (YouTube, etc.) → sempre abrem no navegador em tela cheia via Fullscreen API
  - **Filmes/Séries locais** → abrem no player configurado
  - **Filmes/Séries online** → abrem no navegador
- Função `UI.pickPlayerFile()` para selecionar arquivo `.exe` via file picker.
- Descrição explicativa sobre o comportamento do player e ESC.
- Novas propriedades: `videoPlayer`, `customPlayerPath`.
- O botão ASSISTIR no modal Sugestão agora usa `onclick` com `openMediaWithPlayer()`.

**Preservação:** A funcionalidade de sugestão e info continua funcionando. Trailers sempre abrem no navegador. A mudança afeta apenas a forma como vídeos locais são abertos.

---

### 5. Notificações de Estreias: Campo Duração (ms)

**Arquivo:** `index.html` — HTML (config-section) + JavaScript (`loadConfig`, `_populateConfigForm`, `applyConfig`, `showEstreiaNotifications`)

**O que foi feito:**
- Adicionado campo **DURAÇÃO (ms)** (`cfg-notifications-duration`) com valor padrão 5000ms abaixo do toggle Ativar Notificações.
- Campo de tipo `number` com min 1000, max 30000, step 500.
- Texto "milissegundos" ao lado do campo.
- A função `showEstreiaNotifications()` agora usa `window._appConfig.notificationsDuration` em vez do valor fixo de 6000ms.
- Novas propriedades: `notificationsDuration`.

**Preservação:** O toggle de notificações funciona como antes. O valor padrão de 5000ms pode ser customizado pelo usuário.

---

### 6. Notificação de Cadastro: Seção com Ativar on/off e Duração

**Arquivo:** `index.html` — HTML (nova config-section) + JavaScript (`loadConfig`, `_populateConfigForm`, `applyConfig`, `showStatus`)

**O que foi feito:**
- Criada seção **NOTIFICAÇÃO DE CADASTRO** (`<i class="fas fa-clipboard-check">`) entre Notificações de Estreias e Personalização do Rodapé.
- **Toggle ATIVAR** (`cfg-cadastro-notify-active`) — padrão ativo (checked).
- **Campo DURAÇÃO (ms)** (`cfg-cadastro-notify-duration`) — valor padrão 6000ms (6 segundos).
- Texto descritivo: "6000 ms = 6 segundos. Controla a duração da mensagem 'atualizado com sucesso!' após atualizar um cadastro ou salvar um Filme, Série ou Estreia."
- A função `Logic.showStatus()` foi modificada para detectar mensagens de cadastro/sucesso e usar a duração configurada em vez do fixo 4000ms.
- Novas propriedades: `cadastroNotifyActive`, `cadastroNotifyDuration`.

**Preservação:** Todas as chamadas a `showStatus()` continuam funcionando normalmente. Apenas mensagens contendo "sucesso", "cadastro" ou "atualizado" usam a duração customizada.

---

### Checklist Final (v4.6.0)

| Verificação | Status |
|---|---|
| Acervo Vazio: slider tamanho ícone (24–160px) | OK |
| Acervo Vazio: slider opacidade ícone (10–100%) | OK |
| Acervo Vazio: preview reflete tamanho/opacidade em tempo real | OK |
| Acervo Vazio: empty-state aplica tamanho/opacidade | OK |
| Acervo Vazio: botões Bold/Italic para Título | OK |
| Acervo Vazio: botões Bold/Italic para Subtítulo 1 | OK |
| Acervo Vazio: botões Bold/Italic para Subtítulo 2 | OK |
| Acervo Vazio: campo tamanho fonte para cada linha | OK |
| Acervo Vazio: color picker para cada linha | OK |
| Acervo Vazio: preview reflete estilo em tempo real | OK |
| Acervo Vazio: empty-state aplica estilo dinâmico | OK |
| Cards: Gêneros fundo preto (#000) e texto branco (#FFF) padrão | OK |
| Cards: resetCardsToDefault usa novos padrões | OK |
| Mídia: seção GESTÃO DE MÍDIA com ícone fa-play | OK |
| Mídia: dropdown com 3 opções (Sistema, WMP, Personalizado) | OK |
| Mídia: auto-toggle campo personalizado | OK |
| Mídia: openMediaWithPlayer() para filhos/séries | OK |
| Mídia: trailers sempre abrem no navegador fullscreen | OK |
| Mídia: pickPlayerFile() para selecionar .exe | OK |
| Notificações Estreias: campo DURAÇÃO (ms) com 5000 | OK |
| Notificações Estreias: auto-close usa duração configurada | OK |
| Notificação Cadastro: seção com toggle ATIVAR on/off | OK |
| Notificação Cadastro: campo DURAÇÃO (ms) com 6000 | OK |
| Notificação Cadastro: showStatus detecta mensagens de cadastro | OK |
| loadConfig: todas as novas propriedades com defaults | OK |
| _populateConfigForm: todos os novos campos populados | OK |
| UI.applyConfig: todas as novas propriedades salvas | OK |
| _syncColorSwatches: novos color pickers incluídos | OK |
| Nenhuma funcionalidade existente alterada | OK |
| Paletas, tipografia, layout, espaçamentos preservados | OK |
| Todos os IDs, classes e handlers mantidos | OK |