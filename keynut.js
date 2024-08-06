const {
    mouse,
    screen,
    sleep,
    useConsoleLogger,
    ConsoleLogLevel,
    Point,keyboard, Key, clipboard
  } = require('@nut-tree-fork/nut-js');
  class MouseController {
    constructor() {
      this.currentPosition = { x: 0, y: 0 };
    }
  
    async updatePosition() {
      this.currentPosition = await mouse.getPosition();
    }
  
    async moveUp(distance = 10) {
      await this.updatePosition();
      await mouse.setPosition({ x: this.currentPosition.x, y: this.currentPosition.y - distance });
    }
  
    async moveDown(distance = 10) {
      await this.updatePosition();
      await mouse.setPosition({ x: this.currentPosition.x, y: this.currentPosition.y + distance });
    }
  
    async moveLeft(distance = 10) {
      await this.updatePosition();
      await mouse.setPosition({ x: this.currentPosition.x - distance, y: this.currentPosition.y });
    }
  
    async moveRight(distance = 10) {
      await this.updatePosition();
      await mouse.setPosition({ x: this.currentPosition.x + distance, y: this.currentPosition.y });
    }
  }
  function getKeyboardControlsAsJSONKey(filterType = 'string') {
    const keyboardControls = Key;
    const filteredControls = {};
  
    for (const [key, value] of Object.entries(keyboardControls)) {
      if (
        (filterType === 'string' && typeof value === 'string') ||
        (filterType === 'number' && typeof value === 'number')
      ) {
        filteredControls[key] = value;
      }
    }
  
    return JSON.stringify(filteredControls, null, 2);
  }
  // console.log(Key);
  const mouseController = new MouseController();
  // useConsoleLogger({ logLevel: ConsoleLogLevel.DEBUG });

  class KeyboardController {
    constructor() {
      this.keyboardmap = Key;
    }
  
    async pressKeys(keys) {
      await keyboard.pressKey(...keys);
    }
  
    async releaseKeys(keys) {
      await keyboard.releaseKey(...keys);
    }
  
    async type(text) {
      await keyboard.type(text);
    }
  
    async parseAndExecuteKeyCommand(command) {
      let keys = [];
    
      if (typeof command === 'string') {
        keys = command.split('+').map(key => key.trim());
      } else if (typeof command === 'number') {
        // Si es un número, buscamos el nombre de la tecla correspondiente
        const keyName = Object.keys(Key).find(k => Key[k] === command);
        if (keyName) {
          keys = [keyName];
        } else {
          console.warn(`No se encontró una tecla para el código: ${command}`);
          return;
        }
      } else {
        console.warn('Tipo de comando no válido');
        return;
      }
    
      try {
        // Convertir nombres de teclas a códigos de teclas
        const keyCodes = keys.map(key => {
          if (typeof Key[key] === 'number') {
            return Key[key];
          } else if (typeof key === 'number') {
            return key;
          } else {
            console.warn(`Tecla no reconocida: ${key}`);
            return null;
          }
        }).filter(code => code !== null);
    
        // Presionar todas las teclas
        for (const keyCode of keyCodes) {
          await keyboard.pressKey(keyCode);
        }    
        // Liberar todas las teclas en orden inverso
        for (let i = keyCodes.length - 1; i >= 0; i--) {
          await keyboard.releaseKey(keyCodes[i]);
        }
    
        console.log(`Executed key command: ${keys.join('+')}`);
      } catch (error) {
        console.error('Error al ejecutar el comando de teclado:', error);
      }
    }
  
    findKeyboardControl(key) {
      const keyUpperCase = key.toUpperCase();
      for (const [k, v] of Object.entries(this.keyboardmap)) {
        if (v.toUpperCase() === keyUpperCase) {
          return Key[k];
        }
      }
      return null;
    }
  }
  
  const keyboardController = new KeyboardController();
  
  // Ejemplo de uso
  (async () => {
    await keyboardController.parseAndExecuteKeyCommand("LeftAlt+F1");

    // Usando un código de tecla numérico
    await keyboardController.parseAndExecuteKeyCommand(125);  // AudioPlay
    
    // Usando una combinación de teclas con códigos numéricos
    await keyboardController.parseAndExecuteKeyCommand("107+1");  // LeftAlt+F1
  })();
module.exports = { mouseController, getKeyboardControlsAsJSONKey, keyboardController };
