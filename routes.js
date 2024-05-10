const express = require('express');
const router = express.Router();
const socketHandler = require('./socketHandler');
const { Client, Server: ServerOsc } = require('node-osc');
const client = new Client('127.0.0.1', 9000);
const server2 = new ServerOsc(9001, '127.0.0.1');
server2.on('listening', () => {
  console.log('OSC Server is listening.');
});
const io = socketHandler.io
let bot;
let botStatus;
let disconnect;
const COMMAND_LIMIT = 1; // Límite de comandos por minuto
const DELAY_PER_COMMAND = 10; // Retraso en milisegundos por cada comando adicional
let commandCount = 0;

router.post('/receive', (req, res) => {

  });

module.exports = router;