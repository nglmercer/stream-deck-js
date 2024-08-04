// import { get } from '../routes.js';
import { createDBManager, databases, observer } from './functions/indexedDB.js';
import { ModalModule } from './modal/modal.js';
import { TableManager } from './datatable/datatable.js';
import {     validateForm,
    obtenerDatos,
    resetForm,
    getFiles123,
    filesform, } from '../functions/dataHandler.js';
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
            modal.close();
        });
    }
    onModalOpen = async (modal) => {
        console.log('Modal abierta, ejecutando acciones personalizadas cadavez');
    }

    openModal = async (config = {}) => {
        await this.modal.open();
    }
}
const modalManager = new Modalmanagerelement();
modalManager.initializeModal().then(() => {
    console.log('Modal manager initialized');
}).catch(error => {
    console.error('Error initializing modal manager:', error);
});
window.api.getkeyboard('number').then(keyboard => {
    console.log(JSON.parse(keyboard));
    keyboardObject = JSON.parse(keyboard);
    
    // Convertir el objeto en un array de objetos con key y value
    keyboardarray = Object.entries(keyboardObject).map(([key, value]) => ({ key, value }));
    
    console.log(keyboardarray);
    
});

function getkeyboard() {
    return keyboardarray;
}
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
    // onEditar: (item) => {
    //     console.log('Custom edit callback', item);
    //     modalminecraftManager.openForEdit(item);
    // }
},
{
    default: 'custombutton', // Clase por defecto para todos los botones
    onDelete: 'deleteButton', // Clase específica para el botón de eliminar
}, 
[],
// {
//     onDelete: svglist.deleteSvgIcon,
//     onEditar: svglist.editSvgIcon,
// },
// {
//     onDelete: 'Eliminar este elemento',
//     onEditar: 'Editar este elemento',
//  }
);

streamcontrolstable.loadAndDisplayAllData();