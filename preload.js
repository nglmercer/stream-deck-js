// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

console.log("👋 Preload.js loaded successfully");

// contextBridge.exposeInMainWorld("electronAPI", {
//   read: () => ipcRenderer.send("read"),
//   getFakeFile: () => ipcRenderer.invoke("fakeFile"),
//   getFileFromPath: (path) => ipcRenderer.invoke("getFileFromPath", path),
// });

// contextBridge.exposeInMainWorld("ipcRenderer", {
//   send: (event, data) => ipcRenderer.send(event, data),
//   invoke: (event, data) => ipcRenderer.invoke(event, data)
// });
const api = {
  getkeyboard: (arg) => ipcRenderer.invoke('get-keyboard', arg),
  parseAndExecuteKeyCommand: (arg) => ipcRenderer.invoke('parse-and-execute-key-command', arg),
  getSources: () => ipcRenderer.invoke('get-sources')
}
contextBridge.exposeInMainWorld("api", api);
