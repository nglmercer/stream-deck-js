// Conectar al servidor Socket.IO
const socket = io();

// Manejar la conexión exitosa
socket.on('connect', () => {
    console.log('Conectado al servidor de audio');
});

// Recibir datos de audio actualizados


// Manejar cambios de volumen confirmados
socket.on('volumeChanged', ({ pid, volume }) => {
    console.log(`Volumen cambiado para el proceso ${pid}: ${volume}`);

});

// Manejar cambios en el volumen maestro
socket.on('masterVolumeChanged', (volume) => {
    console.log(`Volumen maestro cambiado: ${volume}`);

});

// Manejar errores
socket.on('error', (message) => {
    console.error('Error:', message);
});
socket.on('audioData', (data) => {
    // console.log('Datos de audio recibidos:', data);
    // Aquí puedes actualizar tu interfaz de usuario con los nuevos datos
    updateAudioUI(data);
});
socket.on('qrcode', (url) => {
  console.log('QR code URL:', url);
});
// Función para cambiar el volumen de una sesión específica
function changeVolume(pid, volume) {
    socket.emit('setVolume', { pid, volume });
}

// Función para cambiar el volumen maestro
function changeMasterVolume(volume) {
    socket.emit('setMasterVolume', volume);
}

// Funciones para actualizar la interfaz de usuario (debes implementarlas)
function updateAudioUI(data) {
    // console.log('Actualizando UI con datos de audio recibidos:', data);
    data.sessions.forEach(session => {
      const roundedValue = Number((session.volume * 100).toFixed(5));
      sliderCreator.createOrUpdateSlider({
          id: `session-${session.pid}`,
          text: `${session.name || 'Unknown'} (PID: ${session.pid}):`,
          value: roundedValue || 0,
          min: 0,
          max: 100,
          step: 1,
          callback: (value) => {
            changeVolume(session.pid, value / 100);
          }
        });
      });
}

class SliderCreator {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) {
        throw new Error(`Container with id "${containerId}" not found`);
      }
      this.sliders = new Map(); // Para almacenar referencias a los sliders creados
    }
  
    createOrUpdateSlider(config) {
      const {
        id,
        text,
        value,
        min = 0,
        max = 100,
        step = 1,
        callback
      } = config;
  
      if (this.sliders.has(id)) {
        // Si el slider ya existe, actualízalo
        this.updateSlider(id, { text, value });
      } else {
        // Si el slider no existe, créalo
        this.createSlider(config);
      }
    }
  
    createSlider(config) {
      const {
        id,
        text,
        value,
        min = 0,
        max = 100,
        step = 1,
        callback
      } = config;
  
      const sliderContainer = document.createElement('div');
      sliderContainer.className = 'slider-container';
  
      const label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = text;
  
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.id = id;
      slider.className = 'custom-slider';
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = value;
  
      const valueDisplay = document.createElement('span');
      valueDisplay.className = 'slider-value';
      valueDisplay.textContent = value + '%';
  
      slider.addEventListener('input', (event) => {
        valueDisplay.textContent = event.target.value + '%';
      });
  
      slider.addEventListener('change', (event) => {
        if (typeof callback === 'function') {
          callback(event.target.value);
        }
      });
  
      sliderContainer.appendChild(label);
      sliderContainer.appendChild(valueDisplay);

      sliderContainer.appendChild(slider);
  
      this.container.appendChild(sliderContainer);
  
      // Almacenar referencia al slider y sus elementos
      this.sliders.set(id, { slider, label, valueDisplay });
  
      return slider;
    }
  
    updateSlider(id, updateConfig) {
      const sliderInfo = this.sliders.get(id);
      if (!sliderInfo) {
        console.warn(`Slider with id "${id}" not found`);
        return;
      }
  
      const { slider, label, valueDisplay } = sliderInfo;
      const { text, value } = updateConfig;
  
      if (text !== undefined) {
        label.textContent = text;
      }
  
      if (value !== undefined) {
        slider.value = value;
        valueDisplay.textContent = value + '%';
      }
    }
  
    removeSlider(id) {
      const sliderInfo = this.sliders.get(id);
      if (sliderInfo) {
        sliderInfo.slider.parentElement.remove();
        this.sliders.delete(id);
      }
    }
  }
const sliderCreator = new SliderCreator('sliders-container');

  
// Ejemplo de cómo podrías usar estas funciones con elementos de la UI
document.addEventListener('DOMContentLoaded', () => {
    // Ejemplo: Slider para el volumen maestro
    const masterVolumeSlider = document.getElementById('masterVolumeSlider');
    if (masterVolumeSlider) {
        masterVolumeSlider.addEventListener('change', (e) => {
            changeMasterVolume(e.target.value / 100); // Asumiendo que el slider va de 0 a 100
        });
    }

    // Aquí puedes agregar más listeners para otros controles de la UI
});
export { socket };