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

    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

    // Mídia local -> player do sistema; links externos/trailers -> navegador padrão
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
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
        properties: ['openDirectory'],
        title: (options && options.title) || 'Selecionar Pasta'
    });
    if (result.canceled) return null;
    return result.filePaths[0];
});

// Seletor de arquivo de vídeo
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
