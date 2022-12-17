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
	initGame: (dir, playerConnectCode) => ipcRenderer.invoke('init-game', dir, playerConnectCode),
	switchScene: (scene) => ipcRenderer.invoke('obs:switch', scene),
	getDolphinStatus: () => ipcRenderer.invoke('dolphin/status'),
	selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
	selectFile: () => ipcRenderer.invoke('dialog:openFile'),
	getFile: (destination, filename) => ipcRenderer.invoke('get-file', destination, filename),
	checkUpdate: () => ipcRenderer.invoke('update:check'),
	downloadUpdate: () => ipcRenderer.invoke('update:download'),
	installUpdate: () => ipcRenderer.invoke('update:install'),
	externalUpdate: (url) => ipcRenderer.invoke('update:external', url),
	runTests: () => ipcRenderer.invoke('run:tests')
});
