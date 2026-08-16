// CineCatalog Elo — Processo principal do Electron
// Carrega a SPA (index.html) numa janela desktop e integra recursos de sistema.
const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        show: false,
        icon: path.join(__dirname, '..', 'build', 'icon.png'),
        backgroundColor: '#0b1220',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // A SPA já usa window.require('electron'/'fs'/'path') diretamente,
            // por isso nodeIntegration está ligado (app desktop pessoal).
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false,
            spellcheck: false
        }
    });

    // Remove o menu padrão (mata atalhos como Ctrl+R / Ctrl+Shift+I / F12)
    Menu.setApplicationMenu(null);

    // (a) Sempre abre maximizado, completamente full-size
    mainWindow.once('ready-to-show', function() {
        mainWindow.maximize();
        mainWindow.show();
    });

    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

    // Mídia local -> player do sistema; links externos/trailers -> navegador padrão
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Manual do Catálogo: abre em uma janela própria da aplicação (empacotado no .asar)
        if (/manual_do_catalogo\.html/i.test(url)) {
            let manualWin = new BrowserWindow({
                width: 1280,
                height: 900,
                icon: path.join(__dirname, '..', 'build', 'icon.png'),
                backgroundColor: '#0f172a',
                autoHideMenuBar: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    sandbox: false,
                    spellcheck: false
                }
            });
            manualWin.loadURL(url);
            manualWin.on('closed', () => { manualWin = null; });
            return { action: 'deny' };
        }
        // blob: não é um ficheiro real e não pode ser aberto pelo Windows.
        if (/^blob:/i.test(url)) {
            return { action: 'deny' };
        }
        if (/^https?:\/\//i.test(url)) {
            shell.openExternal(url);
        } else if (/^file:\/\//i.test(url)) {
            shell.openPath(url.replace(/^file:\/\/\//i, ''));
        } else {
            shell.openPath(url);
        }
        return { action: 'deny' };
    });

    // Impede navegação para fora da aplicação
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith('file://')) event.preventDefault();
    });

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

// ─── IPC Handlers (ponte preload → main) ─────────────────────────

// Seletor de pasta (folder pickers da Config)
ipcMain.handle('dialog:openDirectory', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: (options && options.title) || 'Selecionar Pasta',
        defaultPath: (options && options.defaultPath) || undefined,
        properties: ['openDirectory']
    });
    if (result.canceled) return null;
    return result.filePaths[0];
});

// Seletor de arquivo de vídeo
ipcMain.handle('dialog:openVideo', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: (options && options.title) || 'Selecionar vídeo',
        defaultPath: (options && options.defaultPath) || undefined,
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

// ─── Player Engine IPC Handlers ─────────────────────────────────
// Player Player Engine
let playerWindow = null;

ipcMain.on('player:init', (event, playerEngine) => {
    try {
        if (playerWindow && !playerWindow.isDestroyed()) {
            playerWindow.webContents.send('player:init', playerEngine);
        }
    } catch (e) {
        console.error('[Player] Error initializing:', e);
    }
});

ipcMain.on('player:close', () => {
    if (playerWindow && !playerWindow.isDestroyed()) {
        playerWindow.close();
        playerWindow = null;
    }
});

ipcMain.on('player:load', (event, payload) => {
    if (playerWindow && !playerWindow.isDestroyed()) {
        playerWindow.webContents.send('player:load', {
            ...payload,
            forceFullscreen: payload.forceFullscreen !== false  // Sempre true por defeito
        });
    }
});

// Seletor de arquivo de imagem (capas de Filmes/Séries)
ipcMain.handle('dialog:openImage', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: (options && options.title) || 'Selecionar capa',
        defaultPath: (options && options.defaultPath) || undefined,
        properties: ['openFile'],
        filters: [
            { name: 'Imagens', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }
        ]
    });
    if (result.canceled) return null;
    const filePath = result.filePaths[0];
    return { path: filePath, name: path.basename(filePath) };
});

// ─── Mídia / Trailers maximizados (item f) ────────────────────────
// Abre um filme, episódio ou trailer numa janela própria maximizada.
// Ao pressionar ESC a janela é restaurada ("fecha um pouco").

// Extensões que o Chromium consegue reproduzir nativamente.
const CHROMIUM_VIDEO = /\.(mp4|m4v|webm|ogv|ogg|mov)$/i;

function openMediaWindow(url, isFile, options = {}) {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        show: false,
        autoHideMenuBar: true,
        backgroundColor: '#000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            spellcheck: false
        },
        // Garante tela cheia automática para todos os tipos de mídia
        fullscreen: options.forceFullscreen || false,
        fullscreenable: true
    });

    win.once('ready-to-show', function() {
        // Sempre maximiza (tela cheia) independentemente das opções
        win.maximize();
        win.show();
        
        // Força tela cheia após um pequeno delay para garantir carregamento
        if (options.forceFullscreen !== false) {
            setTimeout(() => {
                if (!win.isFullScreen()) {
                    win.setFullScreen(true);
                }
            }, 500);
        }
    });

    // ESC: fecha o player e retorna ao catálogo
    win.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && input.key === 'Escape') {
            event.preventDefault();
            ipcMain.emit('player:close');
        }
    });

    win.webContents.setWindowOpenHandler(({ url: target }) => {
        if (/^https?:\/\//i.test(target)) shell.openExternal(target);
        else if (/^file:\/\//i.test(target)) shell.openPath(target.replace(/^file:\/\/\//i, ''));
        return { action: 'deny' };
    });

    win.on('closed', () => {
        if (playerWindow === win) {
            playerWindow = null;
        }
    });

    if (isFile) {
        let p = String(url).replace(/^file:\/\//i, '');
        if (/^\/[A-Za-z]:[\\\/]/.test(p)) p = p.slice(1);
        win.loadFile(p);
    } else {
        const playerPath = path.join(__dirname, '..', 'player.html');
        win.loadFile(playerPath, {
            query: {
                url: url,
                title: options.title || 'Vídeo',
                isTrailer: options.kind === 'trailer',
                forceFullscreen: options.forceFullscreen !== false  // Sempre true, a menos explicitamente false
            }
        });
    }
    return win;
}

// Play de mídia/trailer controlado pelo processo principal.
ipcMain.handle('media:play', async (event, payload) => {
    console.log('[DEBUG Electron] media:play chamado com payload:', payload);
    payload = payload || {};
    const url = payload.url;
    const kind = payload.kind || 'external';
    const title = payload.title || 'Vídeo';
    const forceFullscreen = payload.forceFullscreen || true;  // Padrão: sempre tela cheia
    if (!url || !url.trim()) return { ok: false };
    try {
        if (kind === 'trailer') {
            // Trailer (YouTube etc.): abre Player Engine HTML dedicado SEMPRE EM TELA CHEIA
            const isYouTube = url.indexOf('youtube.com') >= 0 || url.indexOf('youtu.be') >= 0;

            if (isYouTube) {
                // Usa Player Engine HTML dedicado para YouTube FORÇANDO TELA CHEIA
                openMediaWindow(url, false, { 
                    kind: 'trailer', 
                    title, 
                    forceFullscreen: true 
                });
                return { ok: true };
            } else if (playerWindow && !playerWindow.isDestroyed()) {
                // Se já houver um player, apenas carrega o novo trailer FORÇANDO TELA CHEIA
                playerWindow.webContents.send('player:load', { 
                    url, 
                    title, 
                    forceFullscreen: true 
                });
                return { ok: true };
            } else {
                openMediaWindow(url, false, { kind: 'trailer', title });
                return { ok: true };
            }
        }
        if (kind === 'file') {
            // Mídia: se o formato for suportado, abre em janela maximizada
            const lower = String(url).toLowerCase();
            if (/^blob:/i.test(url)) {
                // blob: não persiste e não é reproduzível fora da origem. Se o
                // renderizador forneceu o caminho real (payload.path), usa-o.
                if (payload.path && /^[A-Za-z]:[\\\/]/i.test(String(payload.path))) {
                    url = payload.path;
                } else {
                    return { ok: false, reason: 'blob' };
                }
            }
            if (/^https?:\/\//i.test(url)) {
                openMediaWindow(url, false, { forceFullscreen: true });
                return { ok: true };
            }
            if (CHROMIUM_VIDEO.test(lower)) {
                openMediaWindow(url, true, { forceFullscreen: true });
                return { ok: true };
            }
            // Formatos não suportados pelo Chromium -> delegar para o Player Engine do Renderer
            // O openMediaWithPlayer do renderer já resolve caminhos contra pastas configuradas
            // e evita o erro "caminho do arquivo incorreto" do Windows
            return { ok: true };
        }
        shell.openExternal(url);
        return { ok: true };
    } catch (e) {
        return { ok: false, error: String(e) };
    }
});

// Ler arquivo como data URL (preview de pôster, mídia etc.)
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

// Salvar arquivo (exportação de listas etc.)
ipcMain.handle('dialog:saveFile', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: (options && options.defaultName) || 'exportacao',
        filters: (options && options.filters) || [{ name: 'Todos', extensions: ['*'] }]
    });
    if (result.canceled) return null;
    if (options && options.content) {
        fs.writeFileSync(result.filePath, options.content, (options.encoding) || 'utf-8');
    }
    return result.filePath;
});

// Caminhos do sistema (Documentos etc.)
ipcMain.handle('app:getPath', async (event, name) => {
    return app.getPath(name || 'documents');
});

// Alias playMedia - chama media:play com parâmetros padronizados para fullscreen sempre
ipcMain.handle('playMedia', async (event, payload) => {
    if (!payload || !payload.url) {
        return { ok: false, error: 'URL não fornecida' };
    }
    // Garante forceFullscreen = true independentemente do que foi passado
    const normalizedPayload = {
        ...payload,
        forceFullscreen: true
    };
    
    const url = normalizedPayload.url;
    const kind = normalizedPayload.kind || 'external';
    const title = normalizedPayload.title || 'Vídeo';
    
    console.log('[DEBUG Electron] playMedia chamado com:', { url, kind, title, forceFullscreen: true });
    
    try {
        const isYouTube = url.indexOf('youtube.com') >= 0 || url.indexOf('youtu.be') >= 0;
        
        if (kind === 'trailer' || isYouTube) {
            if (isYouTube) {
                openMediaWindow(url, false, { kind: 'trailer', title, forceFullscreen: true });
            } else if (playerWindow && !playerWindow.isDestroyed()) {
                playerWindow.webContents.send('player:load', { 
                    url, 
                    title, 
                    forceFullscreen: true 
                });
            } else {
                openMediaWindow(url, false, { kind: 'trailer', title, forceFullscreen: true });
            }
            return { ok: true };
        }
        
        if (kind === 'file') {
            let videoUrl = url;
            const lower = String(url).toLowerCase();
            
            if (/^blob:/i.test(url) && normalizedPayload.path) {
                videoUrl = normalizedPayload.path;
            }
            
            if (CHROMIUM_VIDEO.test(lower) || /\.(mp4|m4v|webm|ogv|ogg|mov)$/i.test(videoUrl)) {
                openMediaWindow(videoUrl, true, { forceFullscreen: true });
                return { ok: true };
            }
        }
        
        if (/^https?:\/\//i.test(url)) {
            openMediaWindow(url, false, { forceFullscreen: true });
            return { ok: true };
        }
        
        return { ok: false, error: 'Formato não suportado' };
    } catch (e) {
        return { ok: false, error: String(e) };
    }
});


