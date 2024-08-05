class GridDropzone {
    constructor(containerId, rows, cols, cellSize) {
        this.container = document.getElementById(containerId);
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.grid = [];
        this.init();
    }

    init() {
        this.container.style.display = 'grid';
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, ${this.cellSize}px)`;
        this.container.style.gridTemplateRows = `repeat(${this.rows}, ${this.cellSize}px)`;
        this.container.style.gap = '1px';
        this.container.style.backgroundColor = '#eee';
        this.container.style.padding = '1px';

        for (let i = 0; i < this.rows * this.cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.width = `${this.cellSize}px`;
            cell.style.height = `${this.cellSize}px`;
            cell.style.backgroundColor = 'white';
            cell.dataset.index = i;

            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                cell.style.backgroundColor = '#f0f0f0';
            });

            cell.addEventListener('dragleave', () => {
                cell.style.backgroundColor = 'white';
            });

            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.style.backgroundColor = 'white';
                const buttonId = e.dataTransfer.getData('text/plain');
                const button = document.getElementById(buttonId);
                if (button && !cell.hasChildNodes()) {
                    cell.appendChild(button);
                }
            });

            this.container.appendChild(cell);
            this.grid.push(cell);
        }
    }

    clear() {
        this.grid.forEach(cell => {
            while (cell.firstChild) {
                cell.removeChild(cell.firstChild);
            }
        });
    }
}

class ButtonGrid {
    constructor(containerId, gridWidth, gridHeight, rows, cols) {
        this.containerId = containerId;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.rows = rows;
        this.cols = cols;
        this.buttons = [];
        this.editMode = false;
        this.grid = [];
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        container.style.display = 'grid';
        container.style.width = '100%';
        container.style.height = '90vh';
        
        container.style.gridTemplateColumns = `repeat(${this.cols}, minmax(${this.gridWidth}px, 1fr))`;
        container.style.gridTemplateRows = `repeat(${this.rows}, minmax(${this.gridHeight}px, 1fr))`;
        
        container.style.gap = '1px';
        container.style.padding = '1px';
    
        for (let i = 0; i < this.rows * this.cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.width = '100%';
            cell.style.height = '100%';
            cell.dataset.index = i;
    
            cell.addEventListener('dragover', (e) => e.preventDefault());
            cell.addEventListener('drop', (e) => this.handleDrop(e, cell));
    
            container.appendChild(cell);
            this.grid.push(cell);
        }
    
        this.createTrashZone();
    }

    addButtons(options) {
        const savedLayout = this.loadFromLocalStorage();
        
        options.forEach(option => {
            const savedButton = savedLayout.find(b => b.id === option.id);
            if (savedButton) {
                this.createButton(option, savedButton.position);
            } else {
                this.createButton(option);
            }
        });
    }

    findNextAvailablePosition() {
        for (let i = 0; i < this.grid.length; i++) {
            if (!this.grid[i].hasChildNodes()) {
                return i;
            }
        }
        return -1; // No hay posiciones disponibles
    }

    createButton(option, position = null) {
        const button = document.createElement('button');
        button.id = `button-${option.id}`;
        button.className = 'grid-button';
        button.textContent = option.text;
        button.value = option.value;
        button.draggable = true;
        button.addEventListener('click', () => option.callback(option.value));
        button.addEventListener('dragstart', this.handleDragStart.bind(this));
        button.addEventListener('dragend', this.handleDragEnd.bind(this));

        if (position === null) {
            position = this.findNextAvailablePosition();
        }

        if (position !== -1 && this.grid[position]) {
            this.grid[position].appendChild(button);
            this.buttons.push({ element: button, position: position, id: option.id });
        } else {
            console.warn('No hay espacio disponible para el botón:', option.text);
        }

        this.saveToLocalStorage();
    }

    handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.id);
        document.getElementById('trash-zone').style.display = 'block';
    }

    handleDragEnd(event) {
        document.getElementById('trash-zone').style.display = 'none';
        this.saveToLocalStorage();
    }

    handleDrop(event, cell) {
        event.preventDefault();
        const buttonId = event.dataTransfer.getData('text/plain');
        const button = document.getElementById(buttonId);
        if (button && !cell.hasChildNodes()) {
            cell.appendChild(button);
            const buttonIndex = this.buttons.findIndex(b => b.element.id === buttonId);
            if (buttonIndex !== -1) {
                this.buttons[buttonIndex].position = parseInt(cell.dataset.index);
            }
            this.saveToLocalStorage();
        }
    }

    createTrashZone() {
        const trashZone = document.createElement('div');
        trashZone.id = 'trash-zone';
        trashZone.className = 'trash-zone';
        trashZone.textContent = '🗑️ Drop here to delete';
        trashZone.style.display = 'none';
        trashZone.addEventListener('dragover', event => event.preventDefault());
        trashZone.addEventListener('drop', this.handleTrashDrop.bind(this));
        document.body.appendChild(trashZone);
    }

    handleTrashDrop(event) {
        event.preventDefault();
        const id = event.dataTransfer.getData('text/plain');
        this.deleteButton(id);
    }

    deleteButton(id) {
        const buttonIndex = this.buttons.findIndex(b => b.element.id === id);
        if (buttonIndex !== -1) {
            const button = this.buttons[buttonIndex].element;
            if (button.parentNode) {
                button.parentNode.removeChild(button);
            }
            this.buttons.splice(buttonIndex, 1);
            this.saveToLocalStorage();
        }
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        this.buttons.forEach(button => {
            if (this.editMode) {
                const deleteButton = document.createElement('span');
                deleteButton.className = 'delete-button';
                deleteButton.textContent = 'x';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteButton(button.element.id);
                });
                button.element.appendChild(deleteButton);
            } else {
                const deleteButton = button.element.querySelector('.delete-button');
                if (deleteButton) button.element.removeChild(deleteButton);
            }
        });
    }

    saveToLocalStorage() {
        const layout = this.buttons.map(button => ({
            id: button.id,
            position: button.position,
            text: button.element.textContent,
            value: button.element.value
        }));
        localStorage.setItem('buttonGridLayout', JSON.stringify(layout));
    }

    loadFromLocalStorage() {
        const layout = JSON.parse(localStorage.getItem('buttonGridLayout')) || [];
        return layout;
    }
}

export { ButtonGrid };

// Ejemplo de uso
