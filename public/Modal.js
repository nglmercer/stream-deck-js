document.addEventListener('DOMContentLoaded', function() {
    const openModalButton = document.getElementById('openModalButton');
    const closeModalButtons = document.querySelectorAll('#closeModalButton');
  
    // Abrir modal al hacer clic en el botón
    openModalButton.addEventListener('click', function() {
      keyboardModal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    });
  
    // Cerrar modal al hacer clic en el botón de cerrar o fuera del modal
    closeModalButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        keyboardModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      });
    });
  
    keyboardModal.addEventListener('click', function(event) {
      if (event.target === keyboardModal) {
        keyboardModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
  });

function guardarEstadoCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        localStorage.setItem(checkbox.id, checkbox.checked);
    });
}

// Función para aplicar el estado guardado de los checkboxes al cargar la página
function aplicarEstadoCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const estadoGuardado = localStorage.getItem(checkbox.id);
        if (estadoGuardado !== null) {
            checkbox.checked = estadoGuardado === 'true';
        }
        console.log(estadoGuardado);
    });
}

window.addEventListener('load', aplicarEstadoCheckboxes);
window.addEventListener('beforeunload', guardarEstadoCheckboxes);