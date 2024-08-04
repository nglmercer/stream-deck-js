const {
    mouse,
    screen,
    sleep,
    useConsoleLogger,
    ConsoleLogLevel,
    Point, Key 
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
  
console.log(getKeyboardControlsAsJSONKey());
  const mouseController = new MouseController();
module.exports = { mouseController, getKeyboardControlsAsJSONKey };
//   async function moveMouseUpAndDown() {
//     console.log("Iniciando movimiento del ratón...");
//     let distance = 100;
//     await mouseController.moveUp(distance);
//     await sleep(2000);
//     await mouseController.moveDown(distance);
//     await sleep(2000);
//     await mouseController.moveLeft(distance);
//     await sleep(2000);
//     await mouseController.moveRight(distance);
//     await sleep(2000);
//     console.log("Movimiento del ratón completado.");
//   }
//   moveMouseUpAndDown().then(() => {
//     console.log("Prueba completada con éxito.");
//   }).catch((error) => {
//     console.error("Error durante la prueba:", error);
//   });