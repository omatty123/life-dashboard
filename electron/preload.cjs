const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  openPath: (path) => ipcRenderer.invoke('open-path', path),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  getClaudeData: () => ipcRenderer.invoke('get-claude-data'),
  openInClaude: (path) => ipcRenderer.invoke('open-in-claude', path),
  platform: process.platform
})
