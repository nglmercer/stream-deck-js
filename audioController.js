const { NodeAudioVolumeMixer } = require("node-audio-volume-mixer");

class AudioController {
  constructor() {
    this.updateSessions();
  }

  // Actualizar las sesiones de audio
  updateSessions() {
    this.sessions = NodeAudioVolumeMixer.getAudioSessionProcesses();
  }

  // Obtener todas las sesiones de audio
  getAllSessions() {
    this.updateSessions();
    return this.sessions;
  }

  // Encontrar una sesión por nombre del proceso
  findSessionByName(name) {
    this.updateSessions();
    return this.sessions.find((session) => session.name === name);
  }

  // Encontrar una sesión por ID del proceso
  findSessionById(pid) {
    this.updateSessions();
    return this.sessions.find((session) => session.pid === pid);
  }

  // Cambiar el volumen de una sesión específica
  setSessionVolume(pid, volume) {
    if (volume < 0 || volume > 1) {
      throw new Error("El volumen debe estar entre 0 y 1.");
    }
    NodeAudioVolumeMixer.setAudioSessionVolumeLevelScalar(pid, volume);
  }

  // Obtener el volumen de una sesión específica
  getSessionVolume(pid) {
    return NodeAudioVolumeMixer.getAudioSessionVolumeLevelScalar(pid);
  }

  // Obtener el estado de mute del master
  isMasterMuted() {
    return NodeAudioVolumeMixer.isMasterMuted();
  }

  // Mutear o desmutear el master
  muteMaster(state) {
    NodeAudioVolumeMixer.muteMaster(state);
  }

  // Obtener el volumen del master
  getMasterVolume() {
    return NodeAudioVolumeMixer.getMasterVolumeLevelScalar();
  }

  // Establecer el volumen del master
  setMasterVolume(volume) {
    if (volume < 0 || volume > 1) {
      throw new Error("El volumen debe estar entre 0 y 1.");
    }
    NodeAudioVolumeMixer.setMasterVolumeLevelScalar(volume);
  }
}

// Ejemplo de uso
// const audioController = new AudioController();

// // Obtener todas las sesiones de audio
// console.log("Todas las sesiones de audio:", audioController.getAllSessions());

// // Buscar una sesión por nombre
// const braveSession = audioController.findSessionByName("brave.exe");
// console.log("Sesión de Brave:", braveSession);

// // Obtener el volumen de una sesión específica
// if (braveSession) {
//     console.log(`El volumen actual de Brave es: ${audioController.getSessionVolume(braveSession.pid)}`);
    
//     // Cambiar el volumen de una sesión específica
//     audioController.setSessionVolume(braveSession.pid, 1);
//     console.log(`El volumen de Brave ha  ${audioController.getSessionVolume(braveSession.pid)}.`);
// }


// // Establecer el volumen del master al 50%
// audioController.setMasterVolume(1);
// console.log("Volumen del master:", audioController.getMasterVolume());

module.exports = {AudioController};
// // Establecer el volumen del master al 50%
// audioController.setMasterVolume(0.5);
// console.log("El volumen del master ha sido establecido al 50%.");



// const { listOutputs, setVolume,  } = require('@josephuspaye/win-audio-outputs');
// async function main() {
//   const outputs = await listOutputs();
//   console.log(outputs);
// }

// main();