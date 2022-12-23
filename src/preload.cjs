// preload.cjs

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	send: (channel, data) => {
		ipcRenderer.send(channel, data);
	},
	sendSync: (channel, data) => {
		ipcRenderer.sendSync(channel, data);
	},
	receive: (channel, func) => {
		ipcRenderer.on(channel, (event, ...args) => func(...args));
	},
	getStats: (dir) => ipcRenderer.invoke('get/stats', dir),
	getDolphinStatus: () => ipcRenderer.invoke('dolphin/status'),
	selectFolder: () => ipcRenderer.invoke('dialog:openDirectory')
});
