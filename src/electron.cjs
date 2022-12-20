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
		maxHeight: dev ? 1024 : HEIGHT,
		maxWidth: dev ? 1024 : WIDTH,
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
	console.log(gamePath);

	const { SlippiGame } = require('@slippi/slippi-js');

	const game = new SlippiGame(gamePath);

	const settings = game.getSettings();
	const metadata = game.getMetadata();
	const stats = game.getStats();
	const placements = game.getWinners();

	mainWindow.webContents.send('get-settings', settings);
	mainWindow.webContents.send('get-metadata', metadata);
	mainWindow.webContents.send('get-placements', placements);
	mainWindow.webContents.send('get-stats', stats);
});

function GetLatestGamePath(dir) {
	const fs = require('fs');
	const path = require('path');

	const folder = fs.statSync(dir);

	const assumedGameFile = `Game_${
		folder.mtime.toISOString().replaceAll('-', '').replaceAll(':', '').split('.')[0]
	}.slp`;

	const targetGame = `${dir}/${assumedGameFile}`;

	if (fs.existsSync(targetGame)) return targetGame;

	let files = fs.readdirSync(dir).map((filename) => `${path.parse(filename).name}.slp`);

	files = files.filter((f) => f[0] != '.');

	if (files.length == 0) return null;

	newGame = files.sort((a, b) => a.length - b.length);

	const sourceGame = `${dir}/${newGame}`;

	fs.copyFileSync(sourceGame, targetGame);

	return targetGame;
}
