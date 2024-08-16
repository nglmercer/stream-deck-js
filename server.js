const express = require('express');
const http = require('http');
const { AudioController } = require('./audioController');
const path = require('path');
const { mouseController, getKeyboardControlsAsJSONKey, keyboardController } = require('./keynut');
const qrcode = require('qrcode');
const ip = require('ip');
const localIP = ip.address();
const socketIo = require('socket.io');

class Room {
  constructor(roomId) {
    this.roomId = roomId;
    this.users = new Map();
    this.activeBroadcaster = null;
    this.listenerCount = 0;
    this.audioBuffer = [];
  }

  addUser(socket, userId, isListening = false) {
    if (this.users.has(userId)) {
      return false;
    }
    this.users.set(userId, { socketId: socket.id, isListening });
    if (isListening) this.listenerCount++;
    return true;
  }

  removeUser(userId) {
    const user = this.users.get(userId);
    if (user && user.isListening) this.listenerCount--;
    return this.users.delete(userId);
  }

  getUserId(socketId) {
    for (let [userId, { socketId: sid }] of this.users.entries()) {
      if (sid === socketId) {
        return userId;
      }
    }
    return null;
  }

  startBroadcast(socketId) {
    if (this.activeBroadcaster) {
      return false;
    }
    this.activeBroadcaster = socketId;
    return true;
  }

  stopBroadcast() {
    this.activeBroadcaster = null;
  }

  addAudioChunk(chunk) {
    this.audioBuffer.push(chunk);
  }

  getAudioBuffer() {
    return this.audioBuffer;
  }

  clearBuffers() {
    this.audioBuffer = [];
  }
  getRoomInfo() {
    return {
      roomId: this.roomId,
      users: Array.from(this.users.keys()),
      activeBroadcaster: this.activeBroadcaster,
      listenerCount: this.listenerCount,
      audioBuffer: this.audioBuffer
    }
  }
}

class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
    this.defaultRoomId = 'defaultRoom';
  }

  createRoom(roomId) {
    roomId = roomId || this.defaultRoomId;
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }
    return this.rooms.get(roomId);
  }

  getRoom(roomId) {
    return this.rooms.get(roomId || this.defaultRoomId);
  }

  joinRoom(socket, userId, roomId, isListening = false) {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }

    if (room.addUser(socket, userId, isListening)) {
      socket.join(roomId);
      const roomInfo = room.getRoomInfo();
      socket.emit('roomJoined', roomInfo);
      socket.to(roomId).emit('userJoined', { roomId, userId, socketId: socket.id });

      if (room.listenerCount > 0) {
        this.startBroadcastIfNeeded(socket,roomId);
      }

      if (room.activeBroadcaster) {
        socket.emit('startBroadcast', {
          broadcasterId: room.activeBroadcaster,
          audioBuffer: room.getAudioBuffer()
        });
      }

      return true;
    } else {
      socket.emit('joinError', 'User already in the room');
      return false;
    }
  }

  startBroadcastIfNeeded(socket,roomId) {
    const room = this.getRoom(roomId);
    if (room && room.listenerCount > 0) {
      this.startBroadcast(socket,roomId);
    }
  }

  leaveRoom(socket, roomId) {
    const room = this.getRoom(roomId);
    if (room) {
      const userId = room.getUserId(socket.id);
      if (userId) {
        room.removeUser(userId);
        socket.leave(roomId);
        this.io.to(roomId).emit('userLeft', { userId, socketId: socket.id });

        if (room.users.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    }
  }

  startBroadcast(socket, roomId) {
    const room = this.getRoom(roomId);
    if (room && room.startBroadcast(socket.id)) {
      this.io.to(roomId).emit('newBroadcast', { broadcasterId: socket.id, roomId: roomId });
    } else {
      socket.emit('broadcastError', 'No se puede iniciar la transmisión');
    }
  }

  stopBroadcast(socket, roomId) {
    const room = this.getRoom(roomId);
    if (room) {
      room.stopBroadcast();
      this.io.to(roomId).emit('broadcastStopped', { broadcasterId: socket.id });
    }
  }

  handleStreamChunk(socket, data) {
    const room = this.getRoom(data.room);
    console.log("handleStreamChunk", data, room.getRoomInfo());

    if (room) {
      room.addAudioChunk(data.chunk);
      socket.to(data.room).emit('streamChunk', {
        broadcasterId: socket.id,
        chunk: data.chunk,
        type: 'audio'
      });
    }
  }

  handleDisconnect(socket) {
    this.rooms.forEach((room, roomId) => {
      const userId = room.getUserId(socket.id);
      if (userId) {
        this.leaveRoom(socket, roomId);
      }
      if (room.activeBroadcaster === socket.id) {
        room.stopBroadcast();
        this.io.to(roomId).emit('broadcastStopped', { broadcasterId: socket.id });
      }
    });
  }
}

function createServer() {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = socketIo(server, {
    cors: {
      origin: "*", // Permite conexiones desde cualquier origen
      methods: ["GET", "POST"]
    }
  });
  const roomManager = new RoomManager(io);

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
// Manejar cambio
socket.on('joinRoom', ({ userId, roomId, isListening }) => {
  roomManager.joinRoom(socket, userId, roomId, isListening);
});

socket.on('leaveRoom', ({ roomId }) => {
  roomManager.leaveRoom(socket, roomId);
});

socket.on('sendMessage', ({ roomId, message }) => {
  io.to(roomId).emit('message', { userId: roomManager.getRoom(roomId).getUserId(socket.id), message });
});

socket.on('streamChunk', (data) => {
  roomManager.handleStreamChunk(socket, data);
});
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    clearInterval(intervalId);
});
    const url = `http://${localIP}:3000`;
    qrcode.toDataURL(url, (err, url) => {
      if (err) {
        console.error('Error al generar el código QR:', err);
        return;
      }
      socket.emit('qrcode', url);
      // console.log('QR code URL:', url);
    });
    // console.log('URL del servidor:', url);
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