import { socket } from './socketio_connect.js';
import { getDevicesAndSources, getMediaStream } from './mediastream/deviceManager.js';
import { setLocalPreview, clearLocalPreview } from './mediastream/previewManager.js';
import { startRecording, stopRecording } from './mediastream/streamManager1.js';

class VideoChunkManager {
  constructor(remoteStreamsContainer) {
    this.remoteStreamsContainer = remoteStreamsContainer;
    this.mediaSourceObjects = new Map();
    this.mediaSourceBuffers = new Map();
    this.mediaSourceQueues = new Map();
    this.pendingChunks = new Map(); // Almacenar chunks mientras MediaSource se abre
  }

  // Función para crear el MediaSource y devolver una promesa
  createMediaSource(broadcasterId) {
    return new Promise((resolve, reject) => {
      const mediaSource = new MediaSource();
      this.mediaSourceObjects.set(broadcasterId, mediaSource);

      const remoteVideo = document.createElement('video');
      remoteVideo.id = `remote-${broadcasterId}`;
      remoteVideo.autoplay = true;
      remoteVideo.className = 'remotePreview';
      remoteVideo.src = URL.createObjectURL(mediaSource);

      const remoteVideoContainer = document.createElement('div');
      remoteVideoContainer.className = 'remote-video-container';
      remoteVideoContainer.appendChild(remoteVideo);
      this.remoteStreamsContainer.appendChild(remoteVideoContainer);

      mediaSource.addEventListener('sourceopen', () => {
        try {
          const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9,opus"');
          this.mediaSourceBuffers.set(broadcasterId, sourceBuffer);
          this.mediaSourceQueues.set(broadcasterId, []);

          sourceBuffer.addEventListener('updateend', () => {
            this.appendNextChunk(broadcasterId);
          });

          sourceBuffer.addEventListener('error', (error) => {
            console.error('Error en SourceBuffer:', error);
          });

          console.log(`SourceBuffer creado para broadcaster: ${broadcasterId}`);

          resolve(); // Resolviendo la promesa aquí cuando todo está listo

        } catch (error) {
          console.error('Error al crear SourceBuffer:', error);
          reject(error); // Rechazar la promesa en caso de error
        }
      });

      mediaSource.addEventListener('sourceclose', () => {
        console.log('MediaSource cerrado para broadcaster:', broadcasterId);
        this.mediaSourceBuffers.delete(broadcasterId);
        this.mediaSourceQueues.delete(broadcasterId);
      });

      mediaSource.addEventListener('error', (error) => {
        console.error('Error en MediaSource:', error);
        reject(error); // Rechazar la promesa en caso de error
      });

      remoteVideo.addEventListener('error', (error) => {
        console.error('Error en el video remoto:', error);
        reject(error); // Rechazar la promesa en caso de error
      });
    });
  }

  setupMediaSource(broadcasterId) {
    return this.createMediaSource(broadcasterId)
      .then(() => {
        // Procesar cualquier chunk pendiente
        if (this.pendingChunks.has(broadcasterId)) {
          const pendingQueue = this.pendingChunks.get(broadcasterId);
          this.mediaSourceQueues.get(broadcasterId).push(...pendingQueue);
          this.pendingChunks.delete(broadcasterId);
          this.appendNextChunk(broadcasterId);
        }
        return true; // Indicar que se ha creado con éxito
      })
      .catch(error => {
        console.error('Error al configurar MediaSource:', error);
        return false; // Indicar que hubo un error en la creación
      });
  }

  appendNextChunk(broadcasterId) {
    const mediaSource = this.mediaSourceObjects.get(broadcasterId);
    const sourceBuffer = this.mediaSourceBuffers.get(broadcasterId);
    const queue = this.mediaSourceQueues.get(broadcasterId);

    if (!mediaSource) {
      console.log(`No hay MediaSource para broadcaster: ${broadcasterId}`);
      return;
    }

    if (mediaSource.readyState !== 'open') {
      console.log(`MediaSource no está abierto para broadcaster: ${broadcasterId}. Estado: ${mediaSource.readyState}`);
      return;
    }

    if (sourceBuffer && !sourceBuffer.updating && queue.length > 0) {
      const chunk = queue.shift();
      console.log('Procesando chunk para broadcaster:', broadcasterId);
      console.log('Tipo de chunk:', typeof chunk);
      console.log('Instancia de ArrayBuffer:', chunk instanceof ArrayBuffer);
      try {
        sourceBuffer.appendBuffer(chunk);
      } catch (error) {
        console.error('Error al agregar buffer:', error);
        if (error.name === 'QuotaExceededError') {
          queue.unshift(chunk);
          setTimeout(() => this.appendNextChunk(broadcasterId), 1000);
        } else {
          console.error('Error no recuperable en SourceBuffer:', error);
        }
      }
    }
  }

  handleStreamChunk(broadcasterId, chunk) {
    console.log('Recibiendo chunk de tipo:', typeof chunk);
    const arrayBuffer = chunk instanceof ArrayBuffer ? chunk : new Uint8Array(chunk).buffer;
    console.log('Convertido a ArrayBuffer:', arrayBuffer instanceof ArrayBuffer);
    if (!this.mediaSourceQueues.has(broadcasterId)) {
      this.mediaSourceQueues.set(broadcasterId, []);
    }

    // Almacenar chunk temporalmente si MediaSource no está listo
    if (!this.mediaSourceObjects.has(broadcasterId) || this.mediaSourceObjects.get(broadcasterId).readyState !== 'open') {
      console.log(`MediaSource no está listo para broadcaster: ${broadcasterId}. Almacenando chunk temporalmente.`);
      if (!this.pendingChunks.has(broadcasterId)) {
        this.pendingChunks.set(broadcasterId, []);
      }
      this.pendingChunks.get(broadcasterId).push(arrayBuffer);
    } else {
      const queue = this.mediaSourceQueues.get(broadcasterId);
      queue.push(arrayBuffer);
      this.appendNextChunk(broadcasterId);
    }
  }

  removeRemoteStream(broadcasterId) {
    const remoteVideoContainer = document.getElementById(`remote-${broadcasterId}`).parentNode;
    if (remoteVideoContainer) {
      remoteVideoContainer.remove();
    }
    this.mediaSourceObjects.delete(broadcasterId);
    this.mediaSourceBuffers.delete(broadcasterId);
    this.mediaSourceQueues.delete(broadcasterId);
  }
}


let localStream;
let currentRoom = null;
let mediaRecorder;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const localPreview = document.getElementById('localPreview');
const remoteStreams = document.getElementById('remoteStreams');
const deviceSelect = document.getElementById('deviceSelect');
const roomInput = document.getElementById('roomInput');
const userRoom = document.getElementById('userRoom');
const joinRoomBtn = document.getElementById('joinRoomBtn');

const videoChunkManager = new VideoChunkManager(document.getElementById('remoteStreams'));

startBtn.addEventListener('click', initializeDevices);
stopBtn.addEventListener('click', stopBroadcast);
joinRoomBtn.addEventListener('click', joinRoom);

async function initializeDevices() {
  const options = await getDevicesAndSources();
  deviceSelect.innerHTML = options;
  deviceSelect.style.display = 'block';
  deviceSelect.onchange = startBroadcast;
}

async function startBroadcast() {
  const selectedOption = deviceSelect.value;
  try {
    localStream = await getMediaStream(selectedOption);
    setLocalPreview(localStream, localPreview);
    mediaRecorder = startRecording(localStream, currentRoom, handleDataAvailable);

    startBtn.disabled = true;
    stopBtn.disabled = false;
    deviceSelect.style.display = 'none';

    socket.emit('startBroadcast', currentRoom);
  } catch (err) {
    console.error("Error al iniciar la transmisión:", err);
  }
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    socket.emit('streamChunk', { room: currentRoom, chunk: event.data });
  }
}

function stopBroadcast() {
  stopRecording(mediaRecorder);
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
  clearLocalPreview(localPreview);
  startBtn.disabled = false;
  stopBtn.disabled = true;

  socket.emit('stopBroadcast', currentRoom);
}

function joinRoom() {
  const roomName = roomInput.value.trim();
  currentRoom = roomName;
  const userId = userRoom.value.trim();
  if (roomName) {
    console.log('Intentando unirse a la sala:', roomName);
    socket.emit('joinRoom', { userId, roomName });
  }
}

socket.on('roomJoined', (data) => {
  console.log('Unido a la sala:', data, data.activeBroadcaster);
  videoChunkManager.setupMediaSource(data.activeBroadcaster);

  startBtn.disabled = false;
});

socket.on('newBroadcast', (data) => {
  console.log('Nuevo broadcaster en la sala:', data);
  videoChunkManager.setupMediaSource(data.broadcasterId);
});

socket.on('broadcastStopped', (data) => {
  console.log('Broadcaster dejó de transmitir:', data);
  videoChunkManager.removeRemoteStream(data.broadcasterId);
});

socket.on('streamChunk', (data) => {
  const { broadcasterId, chunk } = data;
  console.log('Recibiendo chunk:', data);  
  videoChunkManager.handleStreamChunk(broadcasterId, chunk);
});

export { currentRoom };
