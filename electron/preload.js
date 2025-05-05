
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
    platform: process.platform
  }
);
