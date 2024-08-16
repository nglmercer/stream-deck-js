class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
  
      for (let channel = 0; channel < input.length; ++channel) {
        const inputChannel = input[channel];
        const outputChannel = output[channel];
  
        for (let i = 0; i < inputChannel.length; ++i) {
          outputChannel[i] = inputChannel[i];
        }
  
        // Enviar los datos de audio al hilo principal
        this.port.postMessage({
          type: 'audio',
          buffer: inputChannel.buffer
        });
      }
  
      return true;
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);