const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const url = require('url');
const Store = require('electron-store');
const routes = require('./routes');
const socketHandler = require('./socketHandler');
const updateHandler = require('./updateHandler');

const store = new Store(); 
// require('electron-reload')(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//   hardResetMethod: 'exit'
// });
// Evento emitido cuando Electron ha terminado de inicializarse
app.on('ready', () => {
  const express = require('express');
  const { createServer } = require('http');
  const cors = require('cors');
  const OBSWebSocket = require('obs-websocket-js').default;

  const port = process.env.PORT || 8081;
  const app1 = express();
  
  app1.use(cors());
  app1.use(express.json());
  app1.use('/api', routes);
  let mainWindow = new BrowserWindow({
    width: store.get('windowWidth', 1000), // Obtener el ancho de la ventana desde Electron Store, si no está definido, usar 1200
    height: store.get('windowHeight', 800), // Obtener la altura de la ventana desde Electron Store, si no está definida, usar 1000
    minWidth: 800, // Ancho mínimo de la ventana
    minHeight: 600, // Alto mínimo de la ventana
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    titleBarOverlay: {
      color: 'gray',
      symbolColor: '#00000081',
      height: 20
    },
		webPreferences: {
			// preload: path.join(__dirname, "preload.js"),
			nodeIntegration: true,
			webSecurity: false,
		},
    maximizable: true
  });
  mainWindow.loadURL(`http://localhost:${port}`);
  // Evento emitido cuando la ventana se cierra
  mainWindow.on('closed', function () {
    mainWindow = null;
    app.quit();
  });
  mainWindow.webContents.setFrameRate(60)

  const httpServer = createServer(app1);
  const io = socketHandler.initSocket(httpServer);
  
  app1.use(express.static(path.join(__dirname, 'public')));
  httpServer.on('error', (error) => {
      console.error('Server error:', error);
  });
  io.on('obsConnection', (data) => {
    console.log(data,"obsConnection")
  })
  socketHandler.handleEvent('obsConnection', (data) => {
    console.log(data, "obsConnection socket");
});
  async function initObs(url = 'ws://127.0.0.1:4455', password = '123456') {
    try {
        const {
            obsWebSocketVersion,
            negotiatedRpcVersion
        } = await obs.connect(url, password, {
            rpcVersion: 1
        });
        console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
        io.emit('dataObs', obsWebSocketVersion);
    } catch (error) {
        console.error('Failed to connect', error.code, error.message);
        io.emit('dataObs', obsWebSocketVersion); // obsWebSocketVersion no está definido en este ámbito
    }
  }

  const obs = new OBSWebSocket();
  // Iniciar el servidor HTTP
  httpServer.listen(port);
  console.info(`Server running! Please visit http://localhost:${port}`);
  // updateHandler.initAutoUpdates();
});
//appready event

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', function () {
  // En macOS, es común que las aplicaciones y su barra de menú se mantengan activas
  // hasta que el usuario salga explícitamente con Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // En macOS, es común volver a crear una ventana en la aplicación cuando
  // el icono del muelle se hace clic y no hay otras ventanas abiertas.
  if (mainWindow === null) {
    createMainWindow();
  }
});
