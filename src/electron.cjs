const windowStateManager = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const {
	SlpParser,
	DolphinConnection,
	Ports,
	ConnectionEvent,
	ConnectionStatus,
	DolphinMessageType,
	Command,
	SlpCommandEventPayload,
	SlpParserEvent,
	FrameEntryType,
	SlpStream,
	SlpStreamEvent,
	SlippiGame,
	GameMode
} = require('@slippi/slippi-js');
const serve = require('electron-serve');
const path = require('path');
const log = require('electron-log');

log.transports.file.resolvePath = () =>
	path.join('/Users/sindrevatnaland/RiderProjects/melee-ranking', '/logs/main.log');

log.info('start');

//const { autoUpdater } = require('electron-github-autoupdater');
const { autoUpdater } = require('electron-updater');

try {
	require('electron-reloader')(module);
} catch (e) {
	console.error(e);
}
const os = require('os');

const isMac = os.platform() === 'darwin';
const isWindows = os.platform() === 'win32';
const isLinux = os.platform() === 'linux';

const serveURL = serve({ directory: '.' });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;

if (dev) require('dotenv').config();

log.info(process.env);

const MIN_WIDTH = 520;
const MIN_HEIGHT = 380;

const MAX_WIDTH = 600;

const OBSWebSocket = require('obs-websocket-js').default;

const obs = new OBSWebSocket();

var dolphinConnection = new DolphinConnection();
var parser = new SlpParser();
var slpStream = new SlpStream();

let gameDirectory = '';

slpStream.on(SlpStreamEvent.COMMAND, (event) => {
	// console.log("Commmand parsed by SlpStream: " + event.command + event.payload)
	parser.handleCommand(event.command, event.payload);
	if (event.command == 54) {
		mainWindow.webContents.send(
			'game-start',
			parser.getSettings().players[0].connectCode,
			parser.getSettings().players[1].connectCode,
			parser.getSettings()
		);
	}
});

parser.on(SlpParserEvent.END, (frameEntry) => {
	// console.log(frameEntry.players[1].post.positionY);
	const slippiFiles = GetGameFiles();
	if (!slippiFiles.length) return;
	let stats = GetRecentGameStats(slippiFiles);
	mainWindow.webContents.send('game-end', frameEntry, stats);
});

dolphinConnection.on(ConnectionEvent.STATUS_CHANGE, (status) => {
	// Disconnect from Slippi server when we disconnect from Dolphin
	if (status === ConnectionStatus.DISCONNECTED) {
		mainWindow.webContents.send('disconnected-event', 'disconnected');
		dolphinConnection.connect('127.0.0.1', Ports.DEFAULT);
	}
	if (status === ConnectionStatus.CONNECTED) {
		mainWindow.webContents.send('connected-event', 'connected');
	}
	if (status === ConnectionStatus.CONNECTING) {
		mainWindow.webContents.send('connecting-event', 'connecting');
	}
});

dolphinConnection.on(ConnectionEvent.MESSAGE, (message) => {
	switch (message.type) {
		case DolphinMessageType.CONNECT_REPLY:
			console.log('Connected: ' + message);
			break;
		case DolphinMessageType.GAME_EVENT:
			var decoded = Buffer.from(message.payload, 'base64');
			slpStream.write(decoded);
			break;
	}
});

dolphinConnection.on(ConnectionEvent.ERROR, (err) => {
	// Log the error messages we get from Dolphin
	console.log('Dolphin connection error', err);
});

dolphinConnection.on(ConnectionEvent.ERROR, (err) => {
	// Log the error messages we get from Dolphin
	console.log('Dolphin connection error', err);
});

let mainWindow;

function createWindow() {
	let windowState = windowStateManager({
		defaultWidth: 480,
		defaultHeight: 740
	});

	const mainWindow = new BrowserWindow({
		backgroundColor: 'whitesmoke',
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		trafficLightPosition: {
			x: 20,
			y: 20
		},
		minHeight: MIN_HEIGHT,
		minWidth: MIN_WIDTH,
		maxWidth: MAX_WIDTH,
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
		height: windowState.height,
		icon: path.join(__dirname, '/static/icon.png')
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
	showSelectAll: false,
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Reset score',
			click: () => {
				mainWindow.webContents.send('reset-score');
			}
		},
		{
			label: 'Player1 score +1',
			click: () => {
				mainWindow.webContents.send('increase-player1-score');
			}
		},
		{
			label: 'Player1 score -1',
			click: () => {
				mainWindow.webContents.send('decrease-player1-score');
			}
		},
		{
			label: 'Player2 score +1',
			click: () => {
				mainWindow.webContents.send('increase-player2-score');
			}
		},
		{
			label: 'Player2 score -1',
			click: () => {
				mainWindow.webContents.send('decrease-player2-score');
			}
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

	mainWindow.webContents.once('dom-ready', () => {
		// Make the disconnected label appear first
		mainWindow.webContents.send('disconnected-event', 'disconnected');
		if (dolphinConnection.getStatus() === ConnectionStatus.DISCONNECTED) {
			// Now try connect to our local Dolphin instance
			dolphinConnection.connect('127.0.0.1', Ports.DEFAULT);
		}
	});

	if (dev) loadVite(port);
	else serveURL(mainWindow);
}

app.once('ready', async function () {
	if (!dev) {
		const exeName = path.basename(process.execPath);

		log.info(exeName);
	}

	createMainWindow();
});
app.on('activate', () => {
	if (!mainWindow) {
		createMainWindow();
	}
});
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('update:check', async () => {
	mainWindow.webContents.send('version', autoUpdater.currentVersion.version);
	if (dev) return;
	autoUpdater
		.checkForUpdates()
		.then((data) => log.info('update', data))
		.catch((err) => log.error(err));
});

ipcMain.handle('update:download', async () => {
	log.info('Downloading..');
	log.info(autoUpdater.currentVersion);
	autoUpdater
		.downloadUpdate()
		.then((data) => log.info(data))
		.catch((err) => log.error(err));
});

ipcMain.handle('update:install', async () => {
	log.info('Installing..');
	log.info(autoUpdater.currentVersion);
	autoUpdater.quitAndInstall();
});

ipcMain.handle('update:external', async (_, url) => {
	log.info('external', url);
	// Make this work
	const open = require('open');
	open(url);
});

autoUpdater.on('checking-for-update', () => {
	log.info(autoUpdater.currentVersion);
	mainWindow.webContents.send('update-status', `Checking for update`);
});

autoUpdater.on('update-not-available', () => {
	mainWindow.webContents.send('update-status', `No update available`);
});

autoUpdater.on('update-available', () => {
	mainWindow.webContents.send('update-status', `Download`);
});

autoUpdater.on('update-downloaded', (data) => {
	mainWindow.webContents.send('update-status', `Install`);
	log.info(`${data.version} downloaded`);
	log.info(
		`Download url: https://github.com/slprank/slpRank-app/releases/download/${data.releaseName}/${data.files[0].url}`
	); //
	mainWindow.webContents.send(
		'download-url',
		`https://github.com/slprank/slpRank-app/releases/download/${data.releaseName}/${data.files[0].url}`
	);
	autoUpdater.quitAndInstall();
});

autoUpdater.on('download-progress', (data) => {
	mainWindow.webContents.send('update-status', `Downloading ${data.percent.toFixed()}%`);
	if (data.percent == 100) mainWindow.webContents.send('update-status', `Install`);
});

ipcMain.on('to-main', (event, count) => {
	return mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
});

ipcMain.handle('dialog:openDirectory', async () => {
	const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
		properties: ['openDirectory']
	});
	if (canceled) {
		return;
	} else {
		return filePaths[0];
	}
});

ipcMain.handle('dialog:openFile', async () => {
	let base64 = 'data:audio/x-wav;base64, ';

	const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
		properties: ['openFile']
	});

	if (canceled) return;

	const fs = require('fs');
	const path = require('path');

	let file = await fs.promises.readFile(filePaths[0], { encoding: 'base64' });

	return base64 + file;
});

ipcMain.handle('get-file', async (_, destination, filename) => {
	const fs = require('fs');

	const file = path.join(__dirname, destination, filename);

	console.log(file);

	if (!fs.existsSync(file)) return '';

	return `data:audio/x-wav;base64, ${fs.readFileSync(file, { encoding: 'base64' })}`;
});

ipcMain.handle('obs:switch', async (_, scene) => {
	if (!scene) return;
	await obs.connect('ws://127.0.0.1:4455');
	await obs.call('SetCurrentProgramScene', { sceneName: scene });
});

ipcMain.on('ipc', (event, arg) => {
	// Command to connect to Dolphin
	if (arg === 'connectDolphin') {
		if (dolphinConnection.getStatus() === ConnectionStatus.DISCONNECTED) {
			// Now try connect to our local Dolphin instance
			dolphinConnection.connect('127.0.0.1', Ports.DEFAULT);
		}
	}
});

// Not finished
ipcMain.handle('init-game', async (_, dir, connectCode) => {
	gameDirectory = dir;
	currentPlayerConnectCode = connectCode;
	mainWindow.webContents.send('init-stats');
});

ipcMain.handle('dolphin/status', async (_, dir) => {
	const status = dolphinConnection.getStatus();
	if (status === ConnectionStatus.DISCONNECTED) {
		mainWindow.webContents.send('disconnected-event', 'disconnected');
	}
	if (status === ConnectionStatus.CONNECTED) {
		mainWindow.webContents.send('connected-event', 'connected');
	}
	if (status === ConnectionStatus.CONNECTING) {
		mainWindow.webContents.send('connecting-event', 'connecting');
	}
});

function GetGameFiles() {
	const fs = require('fs');
	const path = require('path');

	let files = fs.readdirSync(gameDirectory).map((filename) => `${path.parse(filename).name}.slp`);

	files = files.filter((f) => f.match('^Game.*.slp$')).map((f) => `${gameDirectory}/${f}`);

	return files.sort((a, b) => a.length - b.length);
}

function GetRecentGameStats(files) {
	const game = new SlippiGame(files[files.length - 1]);

	return game.getStats();
}

async function RunTests() {
	mainWindow.webContents.send('is-test');
	let files = GetGameFiles()
		.sort((a, b) => 0.5 - Math.random())
		.slice(0, 10);
	files.forEach((file, i) => {
		let game = new SlippiGame(file);
		if (game.getSettings().gameMode !== GameMode.ONLINE) return;
		setTimeout(() => {
			mainWindow.webContents.send(
				'game-start',
				game.getSettings().players[0].connectCode,
				game.getSettings().players[1].connectCode,
				game.getSettings()
			);
			setTimeout(() => {
				let stats = GetRecentGameStats([file]);
				mainWindow.webContents.send('game-end', game.getGameEnd(), stats);
			}, 12000);
		}, 2000 + 45000 * i);
	});
}

ipcMain.handle('run:tests', async () => {
	RunTests();
});
