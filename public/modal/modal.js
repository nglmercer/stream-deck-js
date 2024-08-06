// ModalModule.js
import { DataParser, DataParserStructured } from './dataparser.js';
import {createImageSelector}  from './imageSelector.js';
export class ModalModule {
    constructor(buttonClass, htmlPath, cssPath, setupCallback, dataCallback, onOpenCallback) {
        this.buttonClass = buttonClass;
        this.htmlPath = htmlPath;
        this.cssPath = cssPath;
        this.setupCallback = setupCallback;
        this.dataCallback = dataCallback;
        this.onOpenCallback = onOpenCallback; // Nueva función de callback
        this.modal = null;
        this.isSetupDone = false;
        this.customSelectors = {};
        this.modalId = `modal_${Math.random().toString(36).substr(2, 9)}`;
        this.init();
        this.initPromise = this.init();
    }
    async init() {
        try {
            await this.loadCSS();
            await this.createModal();
            this.addEventListeners();
            if (this.setupCallback) {
                await this.setupCallback(this);
                this.isSetupDone = true;
            }
        } catch (error) {
            console.error('Error initializing modal:', error);
        }
    }

    async loadCSS() {
        try {
            const response = await fetch(this.cssPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const cssContent = await response.text();
            const style = document.createElement('style');
            style.textContent = cssContent;
            document.head.appendChild(style);
        } catch (error) {
            console.error('Error loading CSS:', error);
        }
    }
    async setupImageSelector(containerId, options, onChange, initialSelectedValue = null) {
        console.log('setupImageSelector called'); // Añade esta línea

        if (this.modal) {
            const container = this.modal.querySelector(`#${containerId}`);
            if (container) {
                this.imageSelector = createImageSelector(containerId, options, onChange, initialSelectedValue);
            } else {
                console.error(`Container with ID ${containerId} not found in modal`);
            }
        } else {
            console.error('Modal not initialized');
        }
    }
    async createModal() {
        try {
            const response = await fetch(this.htmlPath);
            const htmlContent = await response.text();
            this.modal = document.createElement('div');
            this.modal.id = this.modalId;
            this.modal.className = 'modalwindow';
            this.modal.innerHTML = `
                <div class="contenido-modal">
                    <span class="cerrarmodal">❌</span>
                    ${htmlContent}
                </div>
            `;
            document.body.appendChild(this.modal);
            this.closeButtons = this.modal.querySelectorAll('.cerrarmodal');
            this.extraclose = this.modal.querySelectorAll('.closeModal');
        } catch (error) {
            console.error('Error creating modal:', error);
        }
    }
    async openWithCustomAction(customAction) {
        await this.open();
        if (typeof customAction === 'function') {
            await customAction(this);
        }
    }
    async executeAndClose(action) {
        try {
            if (typeof action === 'function') {
                await action(this);
            }
        } finally {
            this.close();
        }
    }
    addEventListeners() {
        document.querySelectorAll(`.${this.buttonClass}`).forEach(button => {
            button.addEventListener('click', () => this.open());
        });

        [...this.closeButtons, ...this.extraclose].forEach(button => {
            button.addEventListener('click', () => this.close());
        });

        window.addEventListener('click', (event) => {
            if (event.target === this.modal) this.close();
        });
    }

    createCustomSelector(options) {
        const selector = new CustomSelector(options, this.modal);
        this.customSelectors[options.id] = selector;
        return selector;
    }
    async waitForInitialization() {
        await this.initPromise;
        return this;
    }
    async open(customAction, lang = 'es') {
        if (this.modal) {
            this.modal.style.display = 'flex';
            if (this.onOpenCallback) {
                await this.onOpenCallback(this);
            }
            // Inicializar los selectores personalizados
            Object.values(this.customSelectors).forEach(selector => selector.initialize());
            // Ejecutar la acción personalizada si se proporciona
            if (typeof customAction === 'function') {
                await customAction(this);
            }
        }
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    addCustomEventListener(selector, eventType, callback) {
        this.modal.querySelectorAll(selector).forEach(element => {
            element.addEventListener(eventType, callback);
        });
    }

    captureData(options = {}) {
        const parser = new DataParserStructured(this.modal, options);
        return parser.parseStructured();
    }
}
class CustomSelector {
    constructor(options, modalElement) {
        this.options = options;
        this.modalElement = modalElement;
        this.selectedItem = null;
        this.items = [];
        this.selectorElement = null;
        this.referenceImage = null;
        this.isOpen = false;
        this.isInitialized = false;
        this.customClass = options.customClass || ''; // Nueva: clase CSS personalizada
        this.boundOutsideClickListener = this.handleOutsideClick.bind(this); // Añade esto para manejar el evento
        this.acceptButton = null;
    }

    initialize() {
        if (this.isInitialized) return;
        this.createSelectorButton();
        this.createSelectorElement();
        this.createReferenceImage();
        this.addEventListeners();
        this.isInitialized = true;
    }

    createSelectorElement() {
        this.selectorElement = document.createElement('div');
        this.selectorElement.className = `custom-selector ${this.customClass}`.trim();
        this.selectorElement.style.display = 'none';
        this.selectorElement.innerHTML = `
            <h2>${this.options.title || 'Seleccionar'}</h2>
            <input type="text" class="custom-selector-search" placeholder="Buscar...">
            <div id="custom-options-${this.options.id}" class="custom-options"></div>
            <button id="accept-button-${this.options.id}" class="accept-button" style="display: none;">Aceptar</button>
        `;
        
        const button = this.modalElement.querySelector(`#${this.options.id}-button`);
        button.parentNode.insertBefore(this.selectorElement, button.nextSibling);
    
        this.acceptButton = this.selectorElement.querySelector(`#accept-button-${this.options.id}`);
        this.acceptButton.addEventListener('click', (e) =>{
            e.preventDefault();
             this.acceptSelection()
            } );
    
        // Agregar evento de búsqueda
        const searchInput = this.selectorElement.querySelector('.custom-selector-search');
        searchInput.addEventListener('input', () => this.filterOptions(searchInput.value));
    }

    createSelectorButton() {
        const input = this.modalElement.querySelector(this.options.inputSelector);
        if (!input) {
            console.error(`Input with selector ${this.options.inputSelector} not found`);
            return;
        }
        const button = document.createElement('button');
        button.textContent = 'Seleccionar';
        button.type = 'button';
        button.id = `${this.options.id}-button`;
        button.className = this.options.buttonClass;
        input.parentNode.insertBefore(button, input.nextSibling);
    }


    addEventListeners() {
        const button = this.modalElement.querySelector(`#${this.options.id}-button`);
        button.addEventListener('click', () => this.toggleSelector());
    }

    toggleSelector() {
        if (this.isOpen) {
            this.selectorElement.style.display = 'none';
            document.removeEventListener('click', this.boundOutsideClickListener);
            // Ocultar el botón de aceptar y limpiar la selección
            this.acceptButton.style.display = 'none';
            this.selectedItem = null;
            const selected = this.selectorElement.querySelector('.custom-option.selected');
            if (selected) selected.classList.remove('selected');
            // Limpiar el campo de búsqueda
            const searchInput = this.selectorElement.querySelector('.custom-selector-search');
            if (searchInput) searchInput.value = '';
        } else {
            this.populateOptions();
            this.selectorElement.style.display = 'block';
            setTimeout(() => {
                document.addEventListener('click', this.boundOutsideClickListener);
            }, 0);
        }
        this.isOpen = !this.isOpen;
    }
    async populateOptions() {
        this.items = await this.options.getItemsFunction();
        const optionsContainer = this.selectorElement.querySelector(`#custom-options-${this.options.id}`);
        optionsContainer.innerHTML = '';
        this.items.forEach((item, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'custom-option';
            optionElement.innerHTML = this.options.renderOptionFunction(item);
            optionElement.dataset.index = index;
            optionElement.addEventListener('click', () => this.selectOption(optionElement));
            optionsContainer.appendChild(optionElement);
        });
    }

    selectOption(optionElement) {
        const prevSelected = this.selectorElement.querySelector('.custom-option.selected');
        if (prevSelected) prevSelected.classList.remove('selected');
        optionElement.classList.add('selected');
        const index = parseInt(optionElement.dataset.index);
        this.selectedItem = this.items[index];
        
        // Mostrar el botón de aceptar
        this.acceptButton.style.display = 'block';
    }
    acceptSelection() {
        if (this.selectedItem) {
            const input = this.modalElement.querySelector(this.options.inputSelector);
            if (input) {
                this.options.onSelectFunction(input, this.selectedItem);
                this.updateReferenceImage(this.selectedItem);
            }
            this.toggleSelector();
        }
    }

    createReferenceImage() {
        this.referenceImage = document.createElement('img');
        this.referenceImage.className = 'custom-selector-reference-image';
        this.referenceImage.id = `${this.options.id}-reference-image`;
        this.referenceImage.style.display = 'none';

        const input = this.modalElement.querySelector(this.options.inputSelector);
        input.parentNode.insertBefore(this.referenceImage, this.selectorElement);
    }

    updateReferenceImage(item) {
        if (item && item.image) {
            this.referenceImage.src = item.image.url_list[0];
            this.referenceImage.style.display = 'inline';
        } else {
            this.referenceImage.style.display = 'none';
        }
    }
    handleOutsideClick(event) {
        if (this.selectorElement && !this.selectorElement.contains(event.target) && !event.target.matches(`#${this.options.id}-button`)) {
            this.toggleSelector();
        }
    }
    filterOptions(searchTerm) {
        const optionsContainer = this.selectorElement.querySelector(`#custom-options-${this.options.id}`);
        const options = optionsContainer.querySelectorAll('.custom-option');
        
        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase())) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });
    }
}
/// aaaaaaaaaaaaaaaaaaaaaa
// export {ModalModule};
