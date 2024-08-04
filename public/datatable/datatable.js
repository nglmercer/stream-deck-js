import { observer, databases, createDBManager } from '../functions/indexedDB.js';
// import { getdatagiftnameforid } from '../functions/giftmanager.js';
class TableManager {
    constructor(containerId, dbName, columns, callbacks = {}, buttonClasses = {}, hiddenButtons = [], buttonIcons = {}, buttonTooltips = {}) {
        this.container = document.getElementById(containerId);
        this.dbManager = createDBManager(databases[dbName]);
        this.columns = columns;
        this.data = [];
        this.callbacks = {
            onDelete: callbacks.onDelete || this.defaultDeleteCallback,
            ...callbacks
        };
        this.buttonClasses = {
            default: 'default-button-class',
            ...buttonClasses
        };
        this.hiddenButtons = hiddenButtons;
        this.buttonIcons = buttonIcons;
        this.buttonTooltips = buttonTooltips;

        // Debounced version of loadAndDisplayAllData
        this.debouncedLoadAndDisplayAllData = debounce(this.loadAndDisplayAllData.bind(this), 300);
    }

    getActiveEventValue(item, eventKeys) {
        for (let key of eventKeys) {
            if (item[key] && item[key].check) {
                let value = item[key].select || item[key].number || 'default';
                return { key, value };
            }
        }
        return { key: 'N/A', value: 'N/A' };
    }

    async loadAndDisplayAllData() {
        try {
            this.data = await this.dbManager.getAllData();
            this.container.innerHTML = '';

            const table = document.createElement('table');
            table.className = 'data-table1 table border-4 border-gray-500 rounded-lg';

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            this.columns.forEach(column => {
                const th = document.createElement('th');
                th.textContent = column.header;
                headerRow.appendChild(th);
            });
            const actionTh = document.createElement('th');
            actionTh.textContent = 'Acciones de la tabla';
            actionTh.setAttribute('data-translate', 'Actions');
            headerRow.appendChild(actionTh);
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            for (const item of this.data) {
                const row = await this.createRow(item);
                tbody.appendChild(row);
            }
            table.appendChild(tbody);

            this.container.appendChild(table);

            observer.subscribe(this.handleDataChange.bind(this));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async createRow(item) {
        const row = document.createElement('tr');
        for (const column of this.columns) {
            const td = document.createElement('td');
            let value;
    
            if (column.eventKeys) {
                const { key, value: eventValue } = this.getActiveEventValue(item, column.eventKeys);
                if (column.showEventType) {
                    value = key.split("-")[1];
                } else {
                    value = eventValue;
                    // const numberValue = eventValue;
                    // if (Number.isInteger(Number(numberValue))) {
                    //     try {
                    //         const findvalue = await getdatagiftnameforid(Number(numberValue));
                    //         console.log("numberValue", numberValue, "findvalue", findvalue);
    
                    //         // Ensure findvalue is an object before accessing its properties
                    //         if (findvalue && typeof findvalue === 'object' && 'name' in findvalue) {
                    //             console.log("findvalue", findvalue.name);
                    //             value = findvalue.name;
                    //         }
                    //     } catch (error) {
                    //         console.error(`Error retrieving gift name for ID ${numberValue}:`, error);
                    //     }
                    // }
                }
            } else {
                value = this.getNestedValue(item, column.key);
            }
    
            if (column.transform && typeof column.transform === 'function') {
                try {
                    value = await column.transform(value);
                } catch (error) {
                    console.error(`Error transforming value for ${column.key}:`, error);
                    value = 'Error';
                }
            }
    
            const truncatedValue = this.truncateText(value.toString());
            td.textContent = truncatedValue;
    
            if (truncatedValue !== value) {
                td.title = value; // Add tooltip
                td.classList.add('truncated-text');
            }
    
            row.appendChild(td);
        }
    
        const actionTd = document.createElement('td');
    
        for (const [actionName, callback] of Object.entries(this.callbacks)) {
            if (!this.hiddenButtons.includes(actionName)) {
                const buttonContent = this.buttonIcons[actionName] || this.capitalizeFirstLetter(actionName.replace('on', ''));
                const buttonClass = this.buttonClasses[actionName] || this.buttonClasses.default;
                const button = this.createButton(buttonContent, () => callback(actionName === 'onDelete' ? item.id : item), buttonClass, actionName);
                actionTd.appendChild(button);
            }
        }
    
        if (actionTd.children.length > 0) {
            row.appendChild(actionTd);
        }
    
        return row;
    }
    

    truncateText(text, maxLength = 80) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getNestedValue(obj, key) {
        const parts = key.split('_');
        let value = obj;
        for (let part of parts) {
            if (value && typeof value === 'object' && part in value) {
                if (value.check === false) {
                    // return undefined;
                    return false;
                }
                value = value[part];
            } else {
                return undefined;
            }
        }
        return value;
    }

    createButton(content, onClick, className, actionName) {
        const button = document.createElement('button');
        if (content.includes('<svg')) {
            button.innerHTML = content; // Assume it's an SVG string
        } else {
            button.textContent = content;
        }
        button.addEventListener('click', onClick);
        button.className = className;
        button.setAttribute('data-translate', className.split(' ')[0] || className);
        
        // Add tooltip if it exists for this action
        if (this.buttonTooltips[actionName]) {
            button.title = this.buttonTooltips[actionName];
        }
        
        return button;
    }

    defaultDeleteCallback(id) {
        console.log('Default delete callback', id);
    }

    async handleDataChange(action, data) {
        switch (action) {
            case 'save':
                this.data.push(data);
                break;
            case 'update':
                const index = this.data.findIndex(item => item.id === data.id);
                if (index !== -1) {
                    this.data[index] = data;
                }
                break;
            case 'delete':
                this.data = this.data.filter(item => item.id !== data);
                break;
        }
        this.debouncedLoadAndDisplayAllData();
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export { TableManager };
