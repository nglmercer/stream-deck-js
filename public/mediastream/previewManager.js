export function setLocalPreview(stream, previewElement) {
    previewElement.srcObject = stream;
  }
  
  export function clearLocalPreview(previewElement) {
    previewElement.srcObject = null;
  }