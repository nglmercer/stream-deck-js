// import { get } from '../routes.js';
import { createDBManager, databases, observer } from './functions/indexedDB.js';
import { ModalModule } from './modal/modal.js';
const dbManager = createDBManager(databases.streamcontrols);
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
    setupGiftSelector = (modal) => {
        const giftSelector = modal.createCustomSelector({
            id: 'giftSelector',
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
            inputSelector: '#event-gift_select',
            buttonClass: 'btn btn-primary'
        });
    
        giftSelector.initialize();
    }
    
    setupModal = async (modal) => {
        this.setupGiftSelector(modal);
        console.log('modal', modal);
    }
    setupEventListeners = (modal) => {

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