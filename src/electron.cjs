const windowStateManager = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const { app, BrowserWindow, ipcMain } = require('electron');
const serve = require('electron-serve');
const path = require('path');

try {
	require('electron-reloader')(module);
} catch (e) {
	console.error(e);
}

const serveURL = serve({ directory: '.' });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;

const WIDTH = 420;
const HEIGHT = 800;

let mainWindow;

function createWindow() {
	let windowState = windowStateManager({
		defaultWidth: WIDTH,
		defaultHeight: HEIGHT
	});

	const mainWindow = new BrowserWindow({
		backgroundColor: 'whitesmoke',
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		trafficLightPosition: {
			x: 17,
			y: 32
		},
		minHeight: HEIGHT,
		minWidth: WIDTH,
		maxHeight: HEIGHT,
		maxWidth: WIDTH,
		webPreferences: {
			enableRemoteModule: true,
			contextIsolation: true,
			nodeIntegration: true,
			spellcheck: false,
			devTools: dev,
			preload: path.join(__dirname, 'preload.cjs')
		},
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height
	});

	windowState.manage(mainWindow);

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.focus();
	});

	mainWindow.on('close', () => {
		windowState.saveState(mainWindow);
	});

	return mainWindow;
}

contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: false,
	showCopyImage: false,
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Make App 💻'
		}
	]
});

function loadVite(port) {
	mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
		console.log('Error loading URL, retrying', e);
		setTimeout(() => {
			loadVite(port);
		}, 200);
	});
}

function createMainWindow() {
	mainWindow = createWindow();
	mainWindow.once('close', () => {
		mainWindow = null;
	});

	if (dev) loadVite(port);
	else serveURL(mainWindow);
}

app.once('ready', createMainWindow);
app.on('activate', () => {
	if (!mainWindow) {
		createMainWindow();
	}
});
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('to-main', (event, count) => {
	return mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
});

ipcMain.handle('get/slippi', async (_, dir) => {
	const gamePath = GetLatestGamePath(dir);
	console.log(dir);

	const { SlippiGame } = require('@slippi/slippi-js');

	const game = new SlippiGame(`${dir}/Game_20221014T153837.slp`);

	const settings = game.getSettings();
	const metadata = game.getMetadata();
	const stats = game.getStats();

	mainWindow.webContents.send('get-settings', settings);
	mainWindow.webContents.send('get-metadata', metadata);
	mainWindow.webContents.send('get-stats', stats);
});

function GetLatestGamePath(dir) {
	const fs = require('fs');
	const path = require('path');

	const folder = fs.statSync(dir); // Change to

	const assumedGameFile = `Game_${
		folder.mtime.toISOString().replaceAll('-', '').replaceAll(':', '').split('.')[0]
	}.slp`;

	let gameDir = `${dir}/${assumedGameFile}`;

	if (fs.existsSync(gameDir)) return gameDir;

	console.log('does not exist');

	// else scan for latest game

	// Make copy of latest game with new name

	//const files = fs.readdirSync(folder).map((filename) => path.parse(filename).name);
	//console.log(files);

	// return newest file - highest value file name

	// return path for newest file
}
