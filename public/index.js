// import { get } from '../routes.js';
import { createDBManager, databases, observer } from './functions/indexedDB.js';
import { ModalModule } from './modal/modal.js';
import { TableManager } from './datatable/datatable.js';
import {     validateForm,
    obtenerDatos,
    resetForm,
    getFiles123,
    filesform, } from '../functions/dataHandler.js';
import { svglist } from './svg/svgconst.js';
import { fillForm } from './utils/formfiller.js';
import { ButtonGrid } from './gridcontent/gridelements.js';
import { socket } from './socketio_connect.js';
// import { get } from '../routes.js';
const streamcontrolsDBManager = createDBManager(databases.streamcontrols);
let keyboardarray = [];
let keyboardObject;
observer.subscribe((action, data) => {
  console.log('action', action);
  console.log('data', data);
});
class Modalmanagerelement {
    constructor() {
        this.modal = null;
        this.modalPromise = null;
    }
    initializeModal = async () => {
        this.modalPromise = new ModalModule(
            'openModal1',
            './streamcontrolmanager/controlmanager.html',
            './streamcontrolmanager/controlmanager.css',
            this.setupModal,
            null,
            this.onModalOpen
        ).waitForInitialization();

        this.modal = await this.modalPromise;
    }
    setupstreamkeyselector = (modal) => {
        const streamkeyselector = modal.createCustomSelector({
            id: 'streamkeyselector',
            customClass: 'modal-style-selector', // Clase CSS personalizada
            title: 'Seleccionar elemento',
            getItemsFunction: getkeyboard,
            renderOptionFunction: (gift) => `
                <div class="gift-option">
                    <span>${gift.key}</span>
                </div>`,
            onSelectFunction: (input, selectedGift) => {
                input.value = selectedGift.key;
                input.dataset.name = selectedGift.value;
            },
            inputSelector: '#streamkeyselector_select',
            buttonClass: 'btn btn-primary'
        });
    
        streamkeyselector.initialize();
    }
    
    setupModal = async (modal) => {
        this.setupstreamkeyselector(modal);
        this.setupEventListeners(modal);
        console.log('modal', modal);
    }
    setupEventListeners = (modal) => {
        modal.addCustomEventListener('.modalActionSave',  'click', async () => {
            const formelement = modal.modal.querySelector('form');
            console.log(formelement);
            const nameFilter = obtenerDatos(formelement, '_', {});
            console.log('modalActionSave click');
            if (nameFilter.id) {
                console.log('Guardando datos de la base de datos EXISTE ID', nameFilter.id);
                await streamcontrolsDBManager.updateData(nameFilter);
            } else {
                await streamcontrolsDBManager.saveData(nameFilter);
                console.log('Guardando datos de la base de datos NO EXISTE ID', nameFilter.id);
            }
            modal.close();
            onUpdateButtons();
        });
        modal.addCustomEventListener('.modalActionAdd',  'click', async () => {
            const formelement = modal.modal.querySelector('form');
            console.log(formelement);
            const nameFilter = obtenerDatos(formelement, '_', {});
            console.log('modalActionSave click');
            if (nameFilter.id) {
                console.log('Guardando datos de la base de datos EXISTE ID', nameFilter.id);
                await streamcontrolsDBManager.updateData(nameFilter);
            } else {
                await streamcontrolsDBManager.saveData(nameFilter);
                console.log('Guardando datos de la base de datos NO EXISTE ID', nameFilter.id);
            }
            modal.close();
            onUpdateButtons();
        });
    }
    onModalOpen = async (modal) => {
        const formmodal = modal.modal.querySelector('form');

        console.log('Modal abierta, ejecutando acciones personalizadas cadavez');
        resetForm(formmodal);
    }

    openModal = async (config = {}) => {
        await this.modal.open();
    }
    openForEdit = async (data) => {
        await this.modal.openWithCustomAction(async (modal) => {
            console.log('Modal abierta para editar:', data);
            const form = modal.modal.querySelector('form');
            if (form) {
                await fillForm(form, data, '_');
            }
            modal.modal.querySelector('.modalActionAdd').style.display = 'none';
            modal.modal.querySelector('.modalActionSave').style.display = 'block';
            modal.addCustomEventListener('.modalActionSave', 'click', async () => {
                const nameFilter = obtenerDatos(form, '_', {});
                if (nameFilter.id) {
                    await streamcontrolsDBManager.updateData(nameFilter);
                    console.log('Guardando datos de la base de datos EXISTE ID', nameFilter.id);
                } else {
                    console.log('Guardando datos de la base de datos NO EXISTE ID', nameFilter.id);
                }
                // Aquí podrías añadir lógica adicional después de guardar
                this.modal.close();
            });
        });
    }
}
const modalManager = new Modalmanagerelement();
modalManager.initializeModal().then(() => {
    console.log('Modal manager initialized');
}).catch(error => {
    console.error('Error initializing modal manager:', error);
});


async function getkeyboard () {
    console.log('getkeyboard');
    try {
        const keyboard = await fetch('./datajson/valueboard.json')
        const keyboardObject = await keyboard.json()
        console.log("keyboardObject", keyboardObject);
        // Convertir el objeto en un array de objetos con key y value
        keyboardarray = Object.entries(keyboardObject).map(([key, value]) => ({ key, value }));
        console.log(keyboardarray);
    } catch (error) {
        console.error('Error fetching JSON:', error);
        return null;
    }
    return keyboardarray;
}
setTimeout(async () => {
    await getkeyboard ();
    console.log('timeout');
}, 1000);
const streamcontrolstable = new TableManager('minecraft-tablemodal',
 'streamcontrols', 
 [
{ header: 'ID', key: 'id' },
// { 
//     header: 'Evento activo',
//     eventKeys: ['event-chat', 'event-follow', 'event-gift', 'event-likes', 'event-share', 'event-subscribe'],
//     showEventType: true
// },
// { 
//     header: 'Valor del Evento',
//     eventKeys: ['event-chat', 'event-follow', 'event-gift', 'event-likes', 'event-share', 'event-subscribe']
// },
], {
    onDelete: (id) => {
        console.log('Custom delete callback', id);
        if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
            streamcontrolstable.dbManager.deleteData(id);
        }
    },
    onEditar: (item) => {
        console.log('Custom edit callback', item);
        modalManager.openForEdit(item);
    },
    onPlay: (item) => {
        console.log('Custom play callback', item);
    }
},
{
    default: 'custombutton', // Clase por defecto para todos los botones
    onDelete: 'deleteButton', // Clase específica para el botón de eliminar
    onPlay: 'playButton', // Clase específica para el botón de reproducir
}, 
[],
{
    onDelete: svglist.deleteSvgIcon,
    onEditar: svglist.editSvgIcon,
    onPlay: svglist.playsvg,
},
{
    onDelete: 'Eliminar este elemento',
    onEditar: 'Editar este elemento',
    onPlay: 'Reproducir este elemento',
 }
);

streamcontrolstable.loadAndDisplayAllData();
const gridbuttonscontent = new ButtonGrid('buttonContainer', 100, 50, 5, 5, onDeleteButton);
// gridbuttonscontent.addButtons([
//     { id: 'Button 1', text: 'Button 1', value: '1', callback: (value) => console.log(`Button ${value} clicked`) },
//     { id: 'Button 2', text: 'Button 2', value: '2', callback: (value) => console.log(`Button ${value} clicked`) },
//     { id: 'Button 3', text: 'Button 3', value: '3', callback: (value) => console.log(`Button ${value} clicked`) },
//     { id: 'Button 4', text: 'Button 4', value: '4', callback: (value) => console.log(`Button ${value} clicked`) },
//     // Agrega más botones según sea necesario
// ]);
class ButtonManager {
    constructor(dbManager, gridbuttonscontent) {
        this.dbManager = dbManager;
        this.gridbuttonscontent = gridbuttonscontent;
    }

    async deleteButton(id) {
        console.log('Custom delete callback', id);
        const splitid = id.split('-');
        const giftId = splitid[1];
        console.log('giftId', giftId);
        try {
            await this.dbManager.deleteData(giftId);
            await this.updateButtons();
        } catch (error) {
            console.error('Error al borrar el dato de la base de datos:', error);
        }
    }

    async updateButtons() {
        try {
            const allData = await this.dbManager.getAllData();
            const parsedData = this.createButtons(allData);
            this.gridbuttonscontent.updateButtons(parsedData);
        } catch (error) {
            console.error('Error al obtener los datos de la base de datos:', error);
        }
    }

    async addButtons() {
        try {
            const allData = await this.dbManager.getAllData();
            const parsedData = this.createButtons(allData);
            this.gridbuttonscontent.addButtons(parsedData);
            return allData;
        } catch (error) {
            console.error('Error al obtener los datos de la base de datos:', error);
        }
    }

    createButtons(data) {
        console.log('data', data);
        return data.map(item => ({
            id: `${item.id}`,
            text: item.streamkeyselector.text || item.streamkeyselector.select,
            value: item.id,
            image: item.streamkeyselector.image,
            callback: () => {
                sendtestevent(item.streamkeyselector.select);
                console.log(`Button ${item.streamkeyselector.select}[${item.id}] clicked`);
            }
        }));
    }
}

// Instancia y uso de la clase ButtonManager
const buttonManager = new ButtonManager(streamcontrolsDBManager, gridbuttonscontent);

// Llamada inicial para obtener y añadir datos
buttonManager.addButtons();

// Ejemplo de cómo usar el callback de eliminar
async function onDeleteButton(id) {
    await buttonManager.deleteButton(id);
}

// Ejemplo de cómo usar la función de actualizar botones
async function onUpdateButtons() {
    await buttonManager.updateButtons();
}

// function creategridbuttons(data) {
//     console.log('data', data);
//     const dataparsed = data.map(item => ({
//         id:  `${item.id}`,
//         text: item.streamkeyselector.select,
//         value: `${item.id}`,
//         callback: (value) => {
//             sendtestevent(item.streamkeyselector.select);
//             console.log(`Button ${item.streamkeyselector.select}[${item.id}] clicked`)
//         }
//     }));//console.log(`Button ${item.streamkeyselector.select} clicked`)
//     return dataparsed;
// }
async function sendtestevent(key) {
    const idvalueboard = await getidfromvalueboard(key);
    console.log("idvalueboard",idvalueboard);
    socket.emit('keyboardController', [idvalueboard]);
}
async function getidfromvalueboard(key) {
    try {
        const valueboardurl = "./datajson/valueboard.json"
        const response = await fetch(valueboardurl);
        const data = await response.json();
        console.log('Fetched JSON valueboard:', data);
        return data[key];
    } catch (error) {
        console.error('Error fetching JSON:', error);
        return null;
    }
}
getidfromvalueboard('Add').then(data => {
    console.log("valueboard",data);
});

// Para activar/desactivar el modo de edición
document.getElementById('toggleEditMode').addEventListener('click', () => gridbuttonscontent.toggleEditMode());