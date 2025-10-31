const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  listSources: () => ipcRenderer.invoke("list-sources"),
  askGPT: (data: any) => ipcRenderer.invoke("ask-gpt", data),
});
