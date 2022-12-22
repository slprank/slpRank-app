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
	SlippiGame
} = require('@slippi/slippi-js');
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

var dolphinConnection = new DolphinConnection();
var parser = new SlpParser();
var slpStream = new SlpStream();

let gameDirectory = '';

slpStream.on(SlpStreamEvent.COMMAND, (event) => {
	// console.log("Commmand parsed by SlpStream: " + event.command + event.payload)
	parser.handleCommand(event.command, event.payload);
	if (event.command == Command.GAME_START) {
		mainWindow.webContents.send('player1-id', parser.getSettings().players[0].connectCode);
		mainWindow.webContents.send('player2-id', parser.getSettings().players[1].connectCode);
		mainWindow.webContents.send('settings', parser.getSettings());
	}
});

parser.on(SlpParserEvent.END, (frameEntry) => {
	// console.log(frameEntry.players[1].post.positionY);
	mainWindow.webContents.send('game-end', frameEntry);
	GetLatestGameStats(gameDirectory);
});

dolphinConnection.on(ConnectionEvent.STATUS_CHANGE, (status) => {
	// Disconnect from Slippi server when we disconnect from Dolphin
	if (status === ConnectionStatus.DISCONNECTED) {
		mainWindow.webContents.send('disconnected-event', false);
	}
	if (status === ConnectionStatus.CONNECTED) {
		mainWindow.webContents.send('connected-event', true);
		console.log('status', status);
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
		defaultWidth: WIDTH,
		defaultHeight: HEIGHT
	});

	const mainWindow = new BrowserWindow({
		backgroundColor: 'whitesmoke',
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		trafficLightPosition: {
			x: 17,
			y: 17
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

ipcMain.on('ipc', (event, arg) => {
	// Command to connect to Dolphin
	if (arg === 'connectDolphin') {
		if (dolphinConnection.getStatus() === ConnectionStatus.DISCONNECTED) {
			// Now try connect to our local Dolphin instance
			dolphinConnection.connect('127.0.0.1', Ports.DEFAULT);
		}
	}
});

ipcMain.handle('get/slippi', async (_, dir) => {
	gameDirectory = dir;
	GetLatestGameStats(dir);
});

function GetLatestGameStats(dir) {
	const fs = require('fs');
	const path = require('path');

	const folder = fs.statSync(dir);

	let files = fs.readdirSync(dir).map((filename) => `${path.parse(filename).name}.slp`);

	files = files.filter((f) => f[0] != '.');

	if (files.length == 0) return null;

	newGame = files.sort((a, b) => a.length - b.length);

	const sourceGame = `${dir}/${newGame[newGame.length - 1]}`;

	mainWindow.webContents.send('stats', new SlippiGame(sourceGame).getStats());
}
