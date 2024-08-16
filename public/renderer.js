import { socket } from './socketio_connect.js';
import { getDevicesAndSources } from './mediastream/deviceManager.js';
import { startVideoTransmission, stopVideoTransmission, getLocalStream } from './videoTransmission.js';

let currentRoom = null;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const localPreview = document.getElementById('localPreview');
const deviceSelect = document.getElementById('deviceSelect');

// startBtn.addEventListener('click', initializeDevices);
// stopBtn.addEventListener('click', stopBroadcast);

// async function initializeDevices() {
//   const options = await getDevicesAndSources();
//   deviceSelect.innerHTML = options;
//   deviceSelect.style.display = 'block';
//   deviceSelect.onchange = startLocalPreview;
// }

// async function startLocalPreview() {
//   const selectedOption = deviceSelect.value;
//   try {
//     const stream = await startVideoTransmission(selectedOption);
//     setLocalPreview(stream);
//     startBtn.disabled = true;
//     stopBtn.disabled = false;
//     deviceSelect.style.display = 'none';
//   } catch (err) {
//     console.error("Error al iniciar la vista previa:", err);
//     startBtn.disabled = false;
//     stopBtn.disabled = true;
//     deviceSelect.style.display = 'block';
//   }
// }

// function stopBroadcast() {
//   stopVideoTransmission();
//   clearLocalPreview();
//   startBtn.disabled = false;
//   stopBtn.disabled = true;
//   deviceSelect.style.display = 'block';
// }

// function setLocalPreview(stream) {
//   localPreview.srcObject = stream;
//   localPreview.autoplay = true;
//   localPreview.playsInline = true;
//   console.log('stream', stream);  
//   console.log('localPreview', localPreview);
// }

// function clearLocalPreview() {
//   localPreview.srcObject = null;
// }


// function createPeerConnection(targetId) {
//   const pc = new RTCPeerConnection({
//     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//   });

//   pc.onicecandidate = event => {
//     if (event.candidate) {
//       socket.emit('webrtc-signaling', {
//         to: targetId,
//         type: 'candidate',
//         payload: event.candidate
//       });
//     }
//   };

//   pc.ontrack = event => {
//     const remoteVideo = document.createElement('video');
//     remoteVideo.srcObject = event.streams[0];
//     remoteVideo.autoplay = true;
//     remoteVideo.playsinline = true;
//     remoteStreams.appendChild(remoteVideo);
//   };

//   if (localStream) {
//     localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
//   }

//   return pc;
// }

// async function createAndSendOffer(targetId) {
//   const pc = peerConnections[targetId];
//   try {
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
//     socket.emit('webrtc-signaling', { to: targetId, type: 'offer', payload: offer });
//   } catch (error) {
//     console.error('Error creating offer:', error);
//   }
// }

// socket.on('roomJoined', (data) => {
//   console.log('Unido a la sala:', data);
//   startBtn.disabled = false;
  
//   if (data.activeBroadcaster) {
//     const pc = createPeerConnection(data.activeBroadcaster);
//     peerConnections[data.activeBroadcaster] = pc;
//     createAndSendOffer(data.activeBroadcaster);
//   }
// });

// socket.on('newBroadcast', (data) => {
//   console.log('Nuevo broadcaster en la sala:', data);
//   const pc = createPeerConnection(data.broadcasterId);
//   peerConnections[data.broadcasterId] = pc;
// });

// socket.on('broadcastStopped', (data) => {
//   console.log('Broadcaster dejó de transmitir:', data);
//   if (peerConnections[data.broadcasterId]) {
//     peerConnections[data.broadcasterId].close();
//     delete peerConnections[data.broadcasterId];
//   }
//   // Eliminar el video remoto correspondiente
//   const remoteVideos = remoteStreams.getElementsByTagName('video');
//   for (let video of remoteVideos) {
//     if (video.srcObject.id === data.broadcasterId) {
//       remoteStreams.removeChild(video);
//       break;
//     }
//   }
// });

// socket.on('webrtc-signaling', async (data) => {
//   const { from, type, payload } = data;
  
//   if (!peerConnections[from]) {
//     peerConnections[from] = createPeerConnection(from);
//   }

//   const pc = peerConnections[from];

//   try {
//     if (type === 'offer') {
//       await pc.setRemoteDescription(new RTCSessionDescription(payload));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       socket.emit('webrtc-signaling', { to: from, type: 'answer', payload: answer });
//     } else if (type === 'answer') {
//       await pc.setRemoteDescription(new RTCSessionDescription(payload));
//     } else if (type === 'candidate') {
//       await pc.addIceCandidate(new RTCIceCandidate(payload));
//     }
//   } catch (error) {
//     console.error('Error handling WebRTC signaling:', error);
//   }
// });

export { currentRoom };