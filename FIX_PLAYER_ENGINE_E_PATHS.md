# Fix Player Engine e Caminhos de Mídia

## Problemas Resolvidos

### 1. Clicar em Play / EXECUTAR FILME não carregava o filme

**Sintoma**: Ao clicar no botão Play dos Cards ou em EXECUTAR FILME, o player não carregava o vídeo. Parecia que o caminho do arquivo estava corrompido ou inválido.

**Causa**: A função `openMediaWithPlayer()` em `js/logic.js` estava concatenando o caminho do arquivo `mediaFile` com as pastas configuradas. Se o `mediaFile` já contenha um caminho absoluto completo (ex: `C:\Videos\filme.mp4`), a concatenação resultava em caminhos inválidos como `C:\Videos\C:\Videos\filme.mp4`.

**Local da correção**: `js/logic.js:1218-1220`

**Solução**: Adicionada verificação para detectar se o URL já é um caminho absoluto (começa com letra de unidade `C:`). Se for, o caminho é usado diretamente sem tentativa de resolução contra pastas configuradas.

```javascript
// Se o URL já for um caminho absoluto (ex: C:\pastas\arquivo.mp4), usa diretamente
if (/^[A-Za-z]:[\\\/]/.test(url)) {
    // Caminho absoluto - já está completo, usa como está
} else {
    // existing resolution logic...
}
```

### 2. Campos de caminho em CONFIGURAÇÕES > GESTÃO DE MÍDIA adicionavam nome da mídia

**Sintoma**: Ao salvar caminhos em CONFIGURAÇÕES > GESTÃO DE MÍDIA, campos como "Caminho de Cards", "Caminho de Filmes" e "Caminho de Séries" estavam sendo salvos com o nome do arquivo incluso (ex: `C:\Filmes\filme.mp4` em vez de apenas `C:\Filmes`). Isso obrigava o usuário a ficar escolhendo a pasta toda vez no cadastro.

**Causa**: Os valores dos campos de texto eram salvos "como estão", sem tratamento para remover filenames.

**Local da correção**: `js/ui.js:1783-1788`

**Solução**: Adicionado regex para remover o filename do final do caminho ao salvar a configuração, mantendo apenas a pasta.

```javascript
var pathRegex = /[\\/]([^\\/]+)$/;
cfg.pathCards = getVal('cfg-path-cards').replace(pathRegex, '');
cfg.pathSeriesCards = getVal('cfg-path-series-cards').replace(pathRegex, '');
cfg.pathVideos = getVal('cfg-path-videos').replace(pathRegex, '');
cfg.pathBackups = getVal('cfg-path-backups').replace(pathRegex, '');
cfg.pathAcervo = getVal('cfg-path-acervo').replace(pathRegex, '');
```

## Como Funciona Agora

### Fluxo de Execução do Play Media

1. **Clicar em Play no Card** → Chama `Logic.playMedia(id)` em `js/logic.js:566`
2. **Busca mídia** → Obtém `movie.mediaFile` ou `movie.trailUrl` do APP_STATE
3. **Resolução de caminho** → `openMediaWithPlayer(raw, movie.type, title)`:
   - Se `mediaFile` for caminho absoluto (`C:\...`), usa diretamente
   - Se for apenas nome de arquivo, tenta resolver contra pastas configuradas
4. **Chama Electron API** → `window.electronAPI.playMedia({url, kind, title, forceFullscreen: true})`
5. **Player Engine Electron** → Abre `player.html` em tela cheia/maximizada

### Player de Trailer em Full Size

Os trailers de vídeo (YouTube ou arquivos locais) agora abrem corretamente em tela cheia graças à configuração `forceFullscreen: true` no payload enviado para o Electron main process. O player `player.html` é aberto sempre em fullscreen, independentemente das configurações do usuário, e pode ser fechado pressionando a tecla ESC.

## Testando os Fixes

### Teste Issue 1 - Play/EXECUTAR FILME

1. Adicione um filme com caminho completo de mídia no cadastro (ex: `C:\Videos\filme.mp4`)
2. Clique em **Play** no card ou em **EXECUTAR FILME**
3. O player Electron deve abrir com o vídeo sendo reproduzido
4. Verifique se não há caminho duplicado na console

### Teste Issue 2 - Configurações de Caminho

1. Abra **CONFIGURAÇÕES > GESTÃO DE MÍDIA**
2. Preencha o campo "Caminho de Filmes" com caminho completo: `C:\Filmes\filme.mp4`
3. Salve as configurações
4. Feche e abra novamente as configurações
5. O campo agora deve conter apenas: `C:\Filmes` (sem o filename)

### Verificação no Console (opcional)

```javascript
// Testar detecção de caminho absoluto
const url = "C:\\Videos\\filme.mp4";
console.log(/^[A-Za-z]:[\\\/]/.test(url)); // true

// Testar remoção de filename
const pathRegex = /[\\/]([^\\/]+)$/;
const dirty = "C:\\Filmes\\filme.mp4";
console.log(dirty.replace(pathRegex, '')); // "C:\\Filmes"
```

## Arquivos Modificados

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `js/logic.js` | 1218-1220 | Verificação de caminho absoluto antes de resolver contra pastas |
| `js/ui.js` | 1783-1788 | Regex para remover filename ao salvar caminhos de configuração |