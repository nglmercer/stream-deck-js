const { app, BrowserWindow, protocol, ipcMain, dialog, globalShortcut, ipcRenderer, contextBridge } = require('electron');
const path = require('path');
const url = require('url');
const Store = require('electron-store');
let mainWindow;
const OBSWebSocket = require('obs-websocket-js').default;
const store = new Store(); 
const PORT = 3000;//process.env.PORT || 3000;
const { mouseController, getKeyboardControlsAsJSONKey, keyboardController } = require('./keynut');
const createServer = require('./server');
const server = createServer();



// server.use('/api', routes);
// require('electron-reload')(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//   hardResetMethod: 'exit'
// });
// Evento emitido cuando Electron ha terminado de inicializarse
app.on('ready', () => {

  createWindow()
  mainWindow.on('closed', function () {
    mainWindow = null;
    app.quit();
  });

  mainWindow.on('focus', () => {
    globalShortcut.register('Alt+F1', ToolDev);
    globalShortcut.register('Alt+F2', cdevTool);
    globalShortcut.register('Alt+F5', refreshPage);
  
    function ToolDev() {
      mainWindow.webContents.openDevTools();
    }
  
    function cdevTool() {
      mainWindow.webContents.closeDevTools();
    }
  
    function refreshPage() {
      mainWindow.webContents.reload(); // Reload the page on F5
    }
  });
      // Obtener la IP local

  // Iniciar el servidor HTTP
  server.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

});
//appready event
function createWindow() {
  mainWindow = new BrowserWindow({
    width: store.get('windowWidth', 1000), // Obtener el ancho de la ventana desde Electron Store, si no está definido, usar 1000
    height: store.get('windowHeight', 800), // Obtener la altura de la ventana desde Electron Store, si no está definida, usar 800
    minWidth: 800, // Ancho mínimo de la ventana
    minHeight: 600, // Alto mínimo de la ventana
    titleBarStyle: 'hidden',
    titleBarOverlay: {
        color: '#cfd4ff',
        symbolColor: '#030238',
        height: 25
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, // Importante: deshabilitar nodeIntegration por seguridad
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      webSecurity: false,
  }
});
mainWindow.loadURL(`http://localhost:${PORT}/index.html`);

}
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
    createWindow();
  }
});
ipcMain.handle('get-keyboard', async (event, arg) => {
  return getKeyboardControlsAsJSONKey(arg);
}); 
ipcMain.handle('parse-and-execute-key-command', async (event, arg) => {
  return keyboardController.parseAndExecuteKeyCommand(arg);
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
