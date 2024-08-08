export async function getDevicesAndSources() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      let options = '<option value="screen">Pantalla completa</option>';
      options += '<option value="window">Ventana específica</option>';
      videoDevices.forEach(device => {
        options += `<option value="${device.deviceId}">${device.label || 'Cámara ' + (videoDevices.indexOf(device) + 1)}</option>`;
      });
      
      return options;
    } catch (err) {
      console.error("Error al obtener dispositivos:", err);
      throw err;
    }
  }
  
  export async function getMediaStream(selectedOption) {
    try {
      let stream;
      if (selectedOption === 'screen' || selectedOption === 'window') {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: true
        }).catch(() => navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false
        }));
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedOption } },
          audio: true
        }).catch(() => navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedOption } },
          audio: false
        }));
      }
      return stream;
    } catch (err) {
      console.error("Error al obtener el stream:", err);
      throw err;
    }
  }