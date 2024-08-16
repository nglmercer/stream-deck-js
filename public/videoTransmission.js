import { getMediaStream } from './mediastream/deviceManager.js';

let localStream;

export async function startVideoTransmission(selectedOption) {
  try {
    localStream = await getMediaStream(selectedOption);
    return localStream;
  } catch (err) {
    console.error("Error al iniciar la transmisión:", err);
    throw err;
  }
}

export function stopVideoTransmission() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
}

export function getLocalStream() {
  return localStream;
}

