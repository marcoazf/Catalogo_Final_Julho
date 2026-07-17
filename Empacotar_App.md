# Guia de Empacotamento — CineCatalog Elo com Electron

## Introdução

Este documento descreve o passo a passo para transformar o `index.html` (SPA) em um aplicativo desktop usando **Electron**, preservando todas as funcionalidades atuais: cadastro, play de mídia local, auto-save, folder pickers, temas, notificações, dashboard, lembretes, CADASTRO DINÂMICO e exportações.

---

## Pré-requisitos

Antes de começar, instale na sua máquina:

| Ferramenta | Versão mínima | Link |
|---|---|---|
| Node.js | 18.x LTS | https://nodejs.org |
| npm | 9.x (vem com Node) | — |
| Git (opcional) | qualquer | https://git-scm.com |

Verifique a instalação:

```bash
node --version   # ex: v18.20.0
npm --version    # ex: 10.5.0
```

---

## Estrutura final esperada

```
CineCatalog_Elo/
├── package.json
├── main.js              # processo principal Electron
├── preload.js           # ponte segura entre Node e renderizador
├── index.html           # seu SPA (copiar do projeto)
├── assets/
│   ├── icon.ico         # ícone Windows
│   └── icon.png         # ícone genérico
├── .gitignore
└── ...
```

---

## Passo 1 — Criar o diretório do projeto Electron

Crie uma pasta nova (não mexa na original do `index.html`):

```bash
mkdir CineCatalog_Elo
cd CineCatalog_Elo
```

---

## Passo 2 — Inicializar o package.json

```bash
npm init -y
```

Isso gera um `package.json` básico. Depois edite os campos `name`, `version`, `description`, `author`:

```json
{
  "name": "cinecatalog-elo",
  "version": "25.6.0",
  "description": "CineCatalog Elo — Catálogo pessoal de filmes e séries",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "pack": "electron-builder --dir",
    "dist": "electron-builder",
    "dist:win": "electron-builder --win",
    "dist:linux": "electron-builder --linux",
    "dist:mac": "electron-builder --mac"
  },
  "author": "Seu Nome",
  "license": "MIT"
}
```

---

## Passo 3 — Instalar Electron e electron-builder

```bash
npm install --save-dev electron electron-builder
```

Isso instala:
- **electron**: runtime desktop
- **electron-builder**: empacotamento para Windows (.exe/.msi), Linux (.AppImage/.deb), macOS (.dmg)

---

## Passo 4 — Criar o `main.js`

Arquivo principal do Electron. Carrega o `index.html` numa janela e configura integrações.

```javascript
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile('index.html');

  // Opcional: abrir DevTools automaticamente em desenvolvimento
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─── IPC Handlers ───────────────────────────────────────────────

// Abrir seletor de pasta (usado pelos folder pickers no SPA)
ipcMain.handle('dialog:openDirectory', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: options?.title || 'Selecionar Pasta'
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// Abrir seletor de arquivo de vídeo
ipcMain.handle('dialog:openVideo', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Vídeos', extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'] },
      { name: 'Todos', extensions: ['*'] }
    ]
  });
  if (result.canceled) return null;
  const filePath = result.filePaths[0];
  return { path: filePath, name: path.basename(filePath) };
});

// Ler arquivo como base64 (para preview de pôster, etc.)
ipcMain.handle('file:readBase64', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska'
    };
    const mime = mimeMap[ext] || 'application/octet-stream';
    return `data:${mime};base64,${data.toString('base64')}`;
  } catch (e) {
    return null;
  }
});

// Verificar se arquivo existe
ipcMain.handle('file:exists', async (event, filePath) => {
  return fs.existsSync(filePath);
});

// Salvar arquivo (para exportação de listas, etc.)
ipcMain.handle('dialog:saveFile', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: options?.defaultName || 'exportacao',
    filters: options?.filters || [{ name: 'Todos', extensions: ['*'] }]
  });
  if (result.canceled) return null;
  if (options?.content) {
    fs.writeFileSync(result.filePath, options.content, options?.encoding || 'utf-8');
  }
  return result.filePath;
});

// Obter caminho da pasta do app (para path padrão de arquivos)
ipcMain.handle('app:getPath', async (event, name) => {
  return app.getPath(name || 'documents');
});
```

---

## Passo 5 — Criar o `preload.js`

Ponte segura entre o Node.js e o navegador. Expõe apenas funções específicas para o SPA.

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Folder picker (substitui showDirectoryPicker)
  selectDirectory: (options) => ipcRenderer.invoke('dialog:openDirectory', options),

  // Video file picker
  selectVideo: () => ipcRenderer.invoke('dialog:openVideo'),

  // Ler arquivo como data URL
  readFileAsDataURL: (filePath) => ipcRenderer.invoke('file:readBase64', filePath),

  // Verificar se arquivo existe
  fileExists: (filePath) => ipcRenderer.invoke('file:exists', filePath),

  // Salvar arquivo
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),

  // Caminhos do sistema
  getPath: (name) => ipcRenderer.invoke('app:getPath', name)
});
```

---

## Passo 6 — Copiar o `index.html`

Copie o `index.html` do seu projeto para a pasta `CineCatalog_Elo/`:

```bash
copy "C:\Users\55199\Desktop\14_Catalogo_Jonas\index.html" "C:\Users\55199\Desktop\CineCatalog_Elo\index.html"
```

---

## Passo 7 — Adaptações necessárias no `index.html`

O SPA foi originalmente feito para navegador. Para funcionar no Electron, serão necessários pequenos ajustes.

### 7.1 Detectar ambiente Electron

Adicione no início do `<script>` (após o `APP_STATE`):

```javascript
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;
APP_STATE.isElectron = isElectron;
```

### 7.2 Substituir `showDirectoryPicker` por `electronAPI.selectDirectory`

Em todo lugar que usa `window.showDirectoryPicker()`, adicione um fallback:

```javascript
// Antes (linhas ~5014, 5054, 5542, 6275, 6290):
var dirHandle = await window.showDirectoryPicker({ startIn: basePath });

// Depois:
var dirHandle;
if (isElectron) {
  var selectedPath = await window.electronAPI.selectDirectory({ title: 'Selecionar pasta' });
  if (!selectedPath) return;
  dirHandle = { name: selectedPath }; // objeto simplificado
} else {
  dirHandle = await window.showDirectoryPicker({ startIn: basePath });
}
```

> **IMPORTANTE**: Você precisará revisar a lógica que usa `dirHandle` — no navegador ele é um `FileSystemDirectoryHandle`, no Electron você recebe apenas o caminho como string. Ajuste as funções `pickFolder`, `initMediaPicker`, `initPosterArea` e `auto-save` para trabalhar com caminhos de arquivo diretamente.

### 7.3 Reprodução de mídia local

No Electron, o play de mídia local pode usar `file:///` ou `protocol.registerFileProtocol`. Recomendo manter a lógica existente que já converte caminhos Windows para `file:///`:

```javascript
// Já existe no index.html (~linha 3874):
url = 'file:///' + url.replace(/\\/g, '/');
```

No Electron, adicione ao `main.js` (dentro de `createWindow`):

```javascript
mainWindow.webContents.registerFileProtocol('file', (request, callback) => {
  const filePath = request.url.replace('file:///', '');
  callback({ path: filePath });
});
```

Ou melhor, use o protocolo padrão `file://` que o Electron já suporta nativamente para `<video>` e `<audio>`.

### 7.4 Ícone da janela

Crie a pasta `assets/` e adicione:

- `icon.png` — 512×512 (ícone principal)
- `icon.ico` — para Windows (pode gerar em https://convertio.co)

---

## Passo 8 — Testar em desenvolvimento

```bash
npm start
```

Deve abrir a janela do Electron com o CineCatalog rodando. Teste:

- [ ] Cadastro de Filme
- [ ] Cadastro de Série com CADASTRO DINÂMICO
- [ ] Play de mídia local
- [ ] Auto-save
- [ ] Temas
- [ ] Exportar lista
- [ ] Dashboard
- [ ] Lembretes

---

## Passo 9 — Configurar o empacotamento

### 9.1 Atualizar `package.json`

Adicione o bloco `build`:

```json
{
  "build": {
    "appId": "com.seunome.cinecatalog-elo",
    "productName": "CineCatalog Elo",
    "directories": {
      "output": "release"
    },
    "files": [
      "index.html",
      "main.js",
      "preload.js",
      "assets/**/*"
    ],
    "win": {
      "target": [
        "nsis"
      ],
      "icon": "assets/icon.ico",
      "artifactName": "CineCatalog_Elo_Setup_${version}.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "perMachine": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "linux": {
      "target": [
        "AppImage",
        "deb"
      ],
      "icon": "assets/icon.png"
    },
    "mac": {
      "target": [
        "dmg"
      ],
      "icon": "assets/icon.png"
    }
  }
}
```

### 9.2 Criar `.gitignore`

```gitignore
node_modules/
release/
dist/
*.log
.DS_Store
```

---

## Passo 10 — Gerar o instalador

### Windows (.exe)

```bash
npm run dist:win
```

Gera um instalador NSIS em `release/CineCatalog_Elo_Setup_25.6.0.exe`.

### Linux (.AppImage)

```bash
npm run dist:linux
```

Gera `release/CineCatalog_Elo_25.6.0.AppImage`.

### macOS (.dmg)

```bash
npm run dist:mac
```

> **Nota**: Para macOS é necessário estar num Mac ou usar GitHub Actions com macOS runner.

---

## Informações que você deve me passar

Para que eu possa refinar este guia e adaptar o `index.html` para o Electron, preciso saber:

1. **Sistema operacional alvo principal**
   - Apenas Windows?
   - Windows + Linux?
   - Windows + macOS?

2. **Caminhos de mídia**
   - Seus vídeos ficam em pastas locais (ex: `D:\Filmes\`)?
   - Usa caminhos de rede?
   - Usa apenas links da internet (YouTube, etc.)?

3. **Funcionalidades críticas**
   - Usa o auto-save com pasta?
   - Usa exportação de lista/PDF?
   - Usa o dashboard com gráficos?
   - Usa folder picker para pôsteres?

4. **Ícone personalizado**
   - Tem um ícone/logo próprio?
   - Quer que eu use o emoji 🎬 como placeholder?

5. **Distribuição**
   - É para uso pessoal apenas?
   - Vai distribuir para outras pessoas?

---

## Observações importantes

- **`showDirectoryPicker` não existe no Electron**: toda a lógica de folder picker do navegador precisará de fallback para `electronAPI.selectDirectory()`. O SPA já usa `dataset.path` como fallback — no Electron este campo será o caminho real do arquivo.
- **Blob URLs**: as blob URLs criadas com `URL.createObjectURL()` funcionam no Electron, mas não persistem entre sessões. O sistema de portable references (`dataset.ref` com `{blob, name}`) continua válido.
- **Performance**: o Electron executa Chromium, então toda a interface será idêntica ao navegador.
- **Auto-update**: o `electron-builder` suporta auto-updater, mas requer um servidor de atualizações. Para uso pessoal não é necessário.

---

## Resumo dos comandos

```bash
npm start          # Executar em desenvolvimento
npm run dist:win   # Gerar instalador Windows
npm run dist:linux # Gerar AppImage/Deb Linux
npm run dist:mac   # Gerar DMG macOS
```
