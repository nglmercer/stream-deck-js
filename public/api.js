// // Botones por defecto

// document.getElementById('btn-copy').addEventListener('click', () => handleAction('copy'));
// document.getElementById('btn-page').addEventListener('click', () => handleAction('page'));
// document.getElementById('btn-paper').addEventListener('click', () => handleAction('paper'));
// document.getElementById('btn-Recording').addEventListener('click', () => handleAction('record-on'));
// document.getElementById('btn-volume-up').addEventListener('click', () => handleAction('volume-up'));
// document.getElementById('btn-previous').addEventListener('click', () => handleAction('previous'));
// document.getElementById('btn-play/pause').addEventListener('click', () => handleAction('play/pause'));
// document.getElementById('btn-next').addEventListener('click', () => handleAction('next'));
// document.getElementById('btn-volume-down').addEventListener('click', () => handleAction('volume-down'));
// document.getElementById('btn-volume-mute').addEventListener('click', () => handleAction('volume-mute'));

// const KeyboardList = {
//     1: 'start application 1',
//     2: 'start application 2',
//     3: 'Browser Back',
//     4: 'Browser Forward',
//     5: 'Browser Refresh',
//     6: 'Browser Stop',
//     7: 'Browser Search',
//     8: 'Browser Favorites',
//     9: 'Browser Home',
//     10: 'play/pause media',
//     11: 'Start Mail',
//     12: 'Select Media',
//     13: 'Start App 1',
//     14: 'Start App 2',
//     15: 'browser search key',
//     16: 'Windows Menu',
//     17: 'select media',
//     18: 'previous track',
//     19: 'next track',
//     20: 'stop media',
//     21: 'right shift',
//     22: 'right ctrl',
//     23: 'right alt',
//     24: 'left windows',
//     25: 'caps lock',
//     26: 'Stop Media',
//     27: 'Play/Pause',
//     28: 'play/pause',
//     29: 'Hangul',
//     30: 'Conversion',
//     31: 'Non-conversion',
//     32: 'Pause/Break',
//     33: 'sleep',
//     34: 'Volume Mute',
//     35: 'Volume Down',
//     36: 'Volume Up',
//     37: 'Next Track',
//     38: 'Previous Track',
//     39: 'volume down',
//     40: 'volume up',
//     41: 'Break',
//     42: 'Backspace',
//     43: 'Tab',
//     44: 'Clear',
//     45: 'Enter',
//     46: 'Shift',
//     47: 'Control',
//     48: 'Alt',
//     49: 'CapsLock',
//     50: 'Escape',
//     51: 'PageUp',
//     52: 'PageDown',
//     53: 'End',
//     54: 'Home',
//     55: 'Select',
//     56: 'Print',
//     57: 'Execute',
//     58: 'PrintScreen',
//     59: 'Insert',
//     60: 'Delete',
//     61: 'Help',
//     62: 'F1',
//     63: 'F2',
//     64: 'F3',
//     65: 'F4',
//     66: 'F5',
//     67: 'F6',
//     68: 'F7',
//     69: 'F8',
//     70: 'F9',
//     71: 'F10',
//     72: 'F11',
//     73: 'F12',
//     74: 'F13',
//     75: 'F14',
//     76: 'F15',
//     77: 'F16',
//     78: 'F17',
//     79: 'F18',
//     80: 'F19',
//     81: 'F20',
//     82: 'F21',
//     83: 'F22',
//     84: 'F23',
//     85: 'F24',
//     86: 'Numlock',
//     87: 'Scrolllock',
//     88: 'up',
//     89: 'left',
//     90: 'down',
//     91: 'menu',
//     92: 'right',
//     93: 'A',
//     94: 'B',
//     95: 'C',
//     96: 'D',
//     97: 'E',
//     98: 'F',
//     99: 'G',
//     100: 'H',
//     101: 'I',
//     102: 'J',
//     103: 'K',
//     104: 'L',
//     105: 'M',
//     106: 'N',
//     107: 'O',
//     108: 'P',
//     109: 'Q',
//     110: 'R',
//     111: 'S',
//     112: 'T',
//     113: 'U',
//     114: 'V',
//     115: 'W',
//     116: 'X',
//     117: 'Y',
//     118: 'Z',
//     119: '0',
//     120: '1',
//     121: '2',
//     122: '3',
//     123: '4',
//     124: '5',
//     125: '6',
//     126: '7',
//     127: '8',
//     128: '9',
//     129: '←',
//     130: '↑',
//     131: '→',
//     132: '↓',
//     133: ';',
//     134: '=',
//     135: ',',
//     136: '-',
//     137: '.',
//     138: '/',
//     139: 'esc',
//     140: '`',
//     141: '~',
//     142: '!',
//     143: '@',
//     144: '#',
//     145: '$',
//     146: '%',
//     147: '^',
//     148: '&',
//     149: '*',
//     150: '(',
//     151: ')',
//     152: '_',
//     153: '+',
//     154: 'tab',
//     155: '[',
//     156: ']',
//     157: '\\',
//     158: '{',
//     159: '}',
//     160: '|',
//     161: ':',
//     162: '"',
//     163: '<',
//     164: '>',
//     165: '?',
//     166: 'win'
//   };

// function sortKeyboardListsByLengthDescending() {
//     // Convertir los objetos en matrices de pares clave-valor
//     const keyboardListEntries = Object.entries(KeyboardList);
//     const keyboardList2Entries = Object.entries(KeyboardList2);

//     // Ordenar las matrices en función de la longitud de los valores en orden descendente
//     keyboardListEntries.sort(([, valueA], [, valueB]) => valueB.length - valueA.length);
//     keyboardList2Entries.sort(([, valueA], [, valueB]) => valueB.length - valueA.length);

//     // Reconstruir los objetos ordenados a partir de las matrices ordenadas
//     const sortedKeyboardList = Object.fromEntries(keyboardListEntries);
//     const sortedKeyboardList2 = Object.fromEntries(keyboardList2Entries);

//     return { sortedKeyboardList, sortedKeyboardList2 };
// }
// // const buttonElement = document.getElementById('buttonDatasend');
// /*
// buttonElement.addEventListener('click', () => {
//     const inputValue = inputElement.value.trim(); // Mantener el valor original sin convertir a minúsculas
//     const keyboardKeys = Object.values(KeyboardList).map(key => key.toLowerCase()); // Convertir valores a minúsculas para la comparación
//     const lowerCaseInputValue = inputValue.toLowerCase(); // Convertir el valor a minúsculas para la comparación
//     if (keyboardKeys.includes(lowerCaseInputValue)) {
//         socket.emit('TestButton', inputValue); // Enviar el valor original
//         console.log(inputValue);
//     } else {
//         socket.emit('TestButton', inputValue);
//         console.log("no encontro");
//     }
// });*/
// //const inputElement = document.getElementById('textInput');
// const keyboardButtonsContainer = document.getElementById('keyboardButtons');
// const toggleCheckboxes = document.getElementById('toggleCheckboxes');

// let botons;
// $(document).ready(function() {  
//     botons = JSON.parse(localStorage.getItem("botons")) || []; // Asignar valor a la variable botons

//     const botonesAgregados = new Set();

//     function cargarListaTeclas() {
//         const $container = $('#keyboardListContainer');
//         $container.empty(); // Limpiar el contenedor
    
//         const searchContainer = $('<div>', { class: "flex items-center justify-center border-b border-b-2 border-blue-500 py-2" });
//         const searchInput = $('<input>', { class: "flex bg-black/25 w-2/4 justify-center", type: "text", placeholder: "Buscar..." });
//         const buttonCreate = $('<div>', { class: "flex items-center bg-gray-500 justify-center border-b border-b-2 border-blue-500 py-2" });
//         searchContainer.append(searchInput);
//         $container.append(searchContainer);
//         $container.append(buttonCreate)
//         let buttonCount = 0;
//         function limpiarBotones() {
//             buttonCreate.children().not(sendButton).not(clearButton).remove(); // Limpiar buttonCreate excluyendo sendButton
//             buttonCount = 0; // Restablecer el contador
//         }
//         // Iterar sobre la lista de teclas y agregar elementos con botones
//         Object.entries(KeyboardList).forEach(([keyCode, nombreBotton]) => {
//             var $botonItem = $(`<div data-nom=' ${nombreBotton} '> <button class='clic-boton' id='text'>${nombreBotton} </button>`);

//             // Verificar si el elemento ya ha sido agregado
//             const $button = $('<button>', { class: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md m-1", text: nombreBotton });
    
//             $button.on('click', function() {
//                 //createButton(nombreBotton);
//                 searchContainer.append($botonItem);
//                 buttonCreate.append($botonItem);
//                 buttonCount++; // Incrementar el contador de botones agregados
//             });
    
//             // Agregar el botón al contenedor solo si coincide con el término de búsqueda
//             if (nombreBotton.toLowerCase().includes(searchInput.val().toLowerCase())) {
//                 $container.append($button);
//             }
//         });
    
//         // Agregar un listener para el evento 'input' en el campo de búsqueda
//         searchInput.on('input', function() {

//             const searchTerm = searchInput.val().toLowerCase();
    
//             // Limpiar el contenedor de botones
//             $container.children().not(searchContainer).not(buttonCreate).remove();
    
//             // Iterar sobre la lista de teclas y agregar elementos con botones
//             Object.entries(KeyboardList).forEach(([keyCode, nombreBotton]) => {
//                 var $botonItem = $(`<div data-nom=' ${nombreBotton} '> <button class='clic-boton' id='text'>${nombreBotton} </button>`);

//                 // Verificar si el elemento ya ha sido agregado
//                 if (nombreBotton.toLowerCase().includes(searchTerm)) {
//                     const $button = $('<button>', { class: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md m-1", text: nombreBotton });
    
//                     $button.on('click', function() {
//                         //createButton(nombreBotton);
//                         buttonCreate.append($botonItem);
//                         buttonCount++; // Incrementar el contador de botones agregados
//                     });
    
//                     $container.append($button);
//                 }
//             });
//         });
//         const sendButton = $('<button>', { class: "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md m-1", text: "Crear Boton" });
//         buttonCreate.append(sendButton);
//         const clearButton = $('<button>', { class: "bg-red-500 hover:bg-red-700 w-12 font-bold rounded-md", text: "x" });
//         buttonCreate.append(clearButton);
//         buttonCreate.on('click', function() {limpiarBotones()})
//         // Agregar el listener para el evento 'click' en el botón de enviar
//         sendButton.on('click', function() {
//             // Array para almacenar los valores de los botones
//             const valoresBotones = [];
    
//             // Obtener todos los botones agregados dentro de buttonCreate y agregar sus valores al array
//             buttonCreate.find('.clic-boton').each(function() {
//                 const value = $(this).text().trim();
//                 valoresBotones.push(value);
//             });
//             newButtonValue = valoresBotones.join('+')
//             console.log(valoresBotones.join('+'));
//             //CREARCOMBINACION DE BOTON 
//             createButton(newButtonValue)
//             // Imprimir todos los valores en un solo console.log
    
//             limpiarBotones();
//         });
//     }
    
    
//     cargarListaTeclas()
//     loadButtonsFromLocalStorage();
  

//     function saveButtonToLocalStorage(nom, date) {
//         var exists = botons.some(function(button) {
//             return button.nom === nom;
//         });
    
//         // Si el botón no existe, añadirlo al array y al localStorage
//         if (!exists) {
//             botons.push({ nom: nom, date: date});
//             localStorage.setItem("botons", JSON.stringify(botons));
//         }
//     }
//     function createButton(nombreBotton) {
//         if (nombreBotton && !botonesAgregados.has(nombreBotton)) {
//         var dateCreation = new Date().toLocaleDateString();
//         saveButtonToLocalStorage(nombreBotton, dateCreation);
//         var $botonItem = $(`<div data-nom=' ${nombreBotton} '> <button class='clic-boton' id='text'>${nombreBotton} </button>`);
//         $("#keyboardButtons").append($botonItem);
        
//             // Agregar el nombre del botón al conjunto de botones agregados
//             botonesAgregados.add(nombreBotton);
//             $botonItem.on('click', function() {
//             const inputValue = nombreBotton
//             //console.log(inputValue)
//             if (!toggleCheckboxes.checked){
//             socket.emit('TestButton', inputValue); // Enviar el valor 
//             }

//         });
//         if (toggleCheckboxes.checked) {
//             $('.clic-boton').addClass('delete-button');
//         } else {
//             $('.clic-boton').removeClass('delete-button');
//         }
//         }
//     }
//     $('#toggleCheckboxes').on('click', function() {
//         if (toggleCheckboxes.checked) {
//             $('.clic-boton').addClass('delete-button');
//         } else {
//             $('.clic-boton').removeClass('delete-button');
//         }
//     });

//     $(document).on('click', '.delete-button', function() {
//         var nomBouton = $(this).closest("div").attr("data-nom").trim(); // Eliminar espacios
    
//         //console.log("Contenido del array botons:", botons);
//         //console.log("Nombre del botón (nomBouton):", nomBouton);
    
//         let indexToRemove = botons.findIndex(function(button) {
//             console.log("Nombre del botón en el array:", button.nom); // Verificar nombres
//             return button.nom.trim() === nomBouton; 
//         });
//         botonesAgregados.delete(nomBouton);
//         //console.log("Índice del elemento a eliminar:", indexToRemove);
//         if (indexToRemove !== -1) {
//             // Eliminar el elemento del array botons
//             botons.splice(indexToRemove, 1);
//             // Actualizar el almacenamiento local
//             localStorage.setItem("botons", JSON.stringify(botons));
//             // Eliminar el botón del DOM
//             $(this).closest("div").remove();
//         }
//     });
    
//     // Función para cargar los botones desde el almacenamiento local
//     function loadButtonsFromLocalStorage() {
//         console.log(botons);
//         for (var i = 0; i < botons.length; i++) {
//             var boton = botons[i];
//             nombreBottonLoad = boton.nom
//             createButton(nombreBottonLoad)
//         }
//     }
// });
