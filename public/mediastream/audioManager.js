export class AudioManager {
    constructor(socket) {
        this.socket = socket;
        this.audioStream = null;
        this.isBroadcasting = false;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Inicializa aquí
        this.workletNode = null;
        this.devices = [];
    }

    async getAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.devices = devices.filter(device => device.kind === 'audioinput');
            return this.devices;
        } catch (err) {
            console.error('Error enumerating audio devices:', err);
            return [];
        }
    }

    async selectAudioInput(deviceId) {
        try {
            const constraints = {
                audio: deviceId ? { deviceId: { exact: deviceId } } : true
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.audioStream = stream;
            console.log('Audio input selected');
            return true;
        } catch (err) {
            console.error('Error selecting audio input:', err);
            return false;
        }
    }

    async startBroadcast(roomId) {
        if (!this.audioStream || this.isBroadcasting) return;

        try {
            // AudioContext ya está inicializado en el constructor
            
            // Cargar el AudioWorklet
            await this.audioContext.audioWorklet.addModule('audio-processor.js');

            const source = this.audioContext.createMediaStreamSource(this.audioStream);
            this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');

            this.workletNode.port.onmessage = (event) => {
                if (event.data.type === 'audio') {
                    this.socket.emit('streamChunk', { room: roomId, chunk: event.data.buffer });
                }
            };

            source.connect(this.workletNode);
            this.workletNode.connect(this.audioContext.destination);

            this.isBroadcasting = true;
            console.log('Broadcast started');
        } catch (err) {
            console.error('Error starting broadcast:', err);
            this.stopBroadcast();
        }
    }

    stopBroadcast() {
        if (!this.isBroadcasting) return;

        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }
        if (this.workletNode) {
            this.workletNode.disconnect();
            this.workletNode = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Reinicia aquí
        }
        this.isBroadcasting = false;
        console.log('Broadcast stopped');
    }

    handleUserCountChange(userCount, roomId) {
        if (userCount > 1 && !this.isBroadcasting) {
            this.startBroadcast(roomId);
        } else if (userCount <= 1 && this.isBroadcasting) {
            this.stopBroadcast();
        }
    }
}
