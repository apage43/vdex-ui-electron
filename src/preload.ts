// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (eUrl: string) => ipcRenderer.send('open-file', eUrl),
  startDrag: (fileName) => {
    ipcRenderer.send('ondragstart', fileName)
  }
})