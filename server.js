const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { AudioController } = require('./audioController');
const path = require('path');
const { mouseController, getKeyboardControlsAsJSONKey, keyboardController } = require('./keynut');

function createServer() {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = socketIo(server, {
    cors: {
      origin: "*", // Permite conexiones desde cualquier origen
      methods: ["GET", "POST"]
    }
  });

  const audioController = new AudioController();
  expressApp.use(express.static(path.join(__dirname, 'public')));
  // Intervalo de actualización en milisegundos
  const UPDATE_INTERVAL = 5000;

  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar datos iniciales al cliente
    sendAudioData(socket);

    // Configurar intervalo para enviar actualizaciones
    const intervalId = setInterval(() => sendAudioData(socket), UPDATE_INTERVAL);

    // Manejar cambios de volumen
    socket.on('setVolume', ({ pid, volume }) => {
      try {
        audioController.setSessionVolume(pid, volume);
        socket.emit('volumeChanged', { pid, volume });
      } catch (error) {
        socket.emit('error', error.message);
      }
    });
    socket.on('keyboardController', (arg) => {
      return keyboardController.parseAndExecuteKeyCommand(arg);
    });
    // Manejar cambios en el volumen maestro
    socket.on('setMasterVolume', (volume) => {
      try {
        audioController.setMasterVolume(volume);
        socket.emit('masterVolumeChanged', volume);
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    // Limpiar el intervalo cuando el cliente se desconecta
    socket.on('disconnect', () => {
      clearInterval(intervalId);
      console.log('Cliente desconectado');
    });
  });

  function sendAudioData(socket) {
    const sessions = audioController.getAllSessions();
    const masterVolume = audioController.getMasterVolume();
    const isMasterMuted = audioController.isMasterMuted();

    socket.emit('audioData', { sessions, masterVolume, isMasterMuted });
  }

  return server;
}

module.exports = createServer;