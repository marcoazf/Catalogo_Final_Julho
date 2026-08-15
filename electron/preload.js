// CineCatalog Elo — Preload
// Ponte segura entre o processo principal e o renderizador.
// A SPA também usa window.require('electron'/'fs'/'path') diretamente
// (nodeIntegration: true), então esta ponte é um complemento opcional.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectDirectory: (options) => ipcRenderer.invoke('dialog:openDirectory', options),
    selectVideo: () => ipcRenderer.invoke('dialog:openVideo'),
    readFileAsDataURL: (filePath) => ipcRenderer.invoke('file:readBase64', filePath),
    fileExists: (filePath) => ipcRenderer.invoke('file:exists', filePath),
    saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
    getPath: (name) => ipcRenderer.invoke('app:getPath', name)
});
