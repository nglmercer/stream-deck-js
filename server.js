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
  }

  addUser(socket, userId) {
    if (this.users.has(userId)) {
      return false;
    }
    this.users.set(userId, socket.id);
    return true;
  }

  removeUser(userId) {
    return this.users.delete(userId);
  }

  getUserId(socketId) {
    for (let [userId, sid] of this.users.entries()) {
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

  getRoomInfo() {
    return {
      roomId: this.roomId,
      users: Array.from(this.users.keys()),
      activeBroadcaster: this.activeBroadcaster
    };
  }

  isBroadcaster(socketId) {
    return this.activeBroadcaster === socketId;
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
      console.log("Creando nueva sala:", roomId);
      this.rooms.set(roomId, new Room(roomId));
    }
    return this.rooms.get(roomId);
  }

  getRoom(roomId) {
    roomId = roomId || this.defaultRoomId;
    console.log("Buscando sala:", roomId);
    const room = this.rooms.get(roomId);
    console.log("Sala encontrada:", room);
    return room;
  }

  joinRoom(socket, userId, roomId) {
    roomId = roomId || this.defaultRoomId;
    console.log("Intentando unirse a la sala:", roomId);
    
    let room = this.getRoom(roomId);
    if (!room) {
      console.log("Sala no encontrada, creando nueva sala:", roomId);
      room = this.createRoom(roomId);
    }
  
    if (room.addUser(socket, userId)) {
      socket.join(roomId);
      const roomInfo = room.getRoomInfo();
      console.log("Usuario unido a la sala:", roomId, "Info de la sala:", roomInfo);
      socket.emit('roomJoined', roomInfo);
      socket.to(roomId).emit('userJoined', { roomId, userId, socketId: socket.id });
      return true;
    } else {
      console.log("Error al unir usuario a la sala:", roomId);
      socket.emit('joinError', 'Usuario ya está en la sala');
      return false;
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
    console.log("handleStreamChunk", data);
    const room = this.getRoom(data.room);
    if (room) {
      // Emitir a todos en la sala excepto al emisor
      socket.to(data.room).emit('streamChunk', { 
        broadcasterId: socket.id,
        chunk: data.chunk
      });
    } else {
      console.log("Sala no encontrada para el stream:", data.room);
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
socket.on('joinRoom', (data) => {
  console.log("joinRoom", data.userId , data.roomName);
  roomManager.joinRoom(socket, data.userId, data.roomName);
});

socket.on('startBroadcast', (roomId) => {
  roomManager.startBroadcast(socket, roomId);
});

socket.on('stopBroadcast', (roomId) => {
  roomManager.stopBroadcast(socket, roomId);
});

socket.on('streamChunk', (data) => {
  roomManager.handleStreamChunk(socket, data);
});

socket.on('disconnecting', () => {
  socket.rooms.forEach(roomId => {
    if (roomId !== socket.id) {
      roomManager.leaveRoom(socket, roomId);
    }
  });
});

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    roomManager.handleDisconnect(socket);
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