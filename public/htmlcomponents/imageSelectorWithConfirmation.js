// imageSelectorWithConfirmation.js
import { ImageSelector } from './imageSelector.js';

export class ImageSelectorWithConfirmation extends ImageSelector {
    constructor(containerId, options, onChange, initialSelectedValue = null) {
        super(containerId, options, onChange, initialSelectedValue);
    }

    init() {
        super.init();
        this.createConfirmationButton();
    }

    createConfirmationButton() {
        this.confirmButton = document.createElement('button');
        this.confirmButton.textContent = 'Confirmar';
        this.confirmButton.classList.add('image-select-confirm-button');
        this.container.appendChild(this.confirmButton);

        this.confirmButton.addEventListener('click', () => {
            if (this.onChange && typeof this.onChange === 'function') {
                this.onChange(this.containerId, this.selectedValue);
            }
        });
    }
}
