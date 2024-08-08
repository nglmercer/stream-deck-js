import { socket } from '../socketio_connect.js';
import { currentRoom } from '../renderer.js';

let mediaRecorder;

export function startRecording(stream, room, onDataAvailable) {
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9,opus' });
  mediaRecorder.ondataavailable = onDataAvailable;
  mediaRecorder.start(1000); // Envía datos cada segundo
  return mediaRecorder;
}

export function stopRecording(currentRoom) {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  socket.emit('stopBroadcast', currentRoom);
}
