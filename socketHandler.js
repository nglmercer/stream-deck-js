const { Server } = require('socket.io');
const OBSWebSocket = require('obs-websocket-js').default;
let io; // Definir io fuera de las funciones para que sea accesible en todo el módulo

function initSocket(httpServer) {
    io = new Server(httpServer, { cors: { origin: '*' } });
    const dataof = io.of('/dataof');

    io.on('connection', (socket) => {
        data = socket.handshake.headers['origin'] || socket.handshake.headers['referer'];
        console.info('New connection from origin', socket.handshake.headers['origin'] || socket.handshake.headers['referer']);
        socket.on('obsConnection', (data) => {
            console.log(data, "obsConnection socket initSocket");
            password = data.password;
            url = `ws://${data.localhost}:${data.port}`;
            console.log(url, password);
            initObs(url, password);
        })
        socket.on('set_scenne', (data) => {
            // console.log(data, "set_scenne socket initSocket");
            // console.log(data.name)
            obs.call('SetCurrentProgramScene', {sceneName: data.name})
        })
        socket.on('set_volume', (data) => {
            // console.log(data, "set_scenne socket initSocket");
            // console.log(data.name)
            obs.call('SetVolume', {volume: data.volumen})
        })
        const obs = new OBSWebSocket();
        async function initObs(url = 'ws://127.0.0.1:4455', password = '123456') {
        try {
            const {
                obsWebSocketVersion,
                negotiatedRpcVersion
            } = await obs.connect(url, password, {
                rpcVersion: 1
            });
            console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
            socket.emit('dataObs', obsWebSocketVersion);
            getEstadistics()
        } catch (error) {
            console.error('Failed to connect', error.code, error.message);
            socket.emit('dataObs', error); // obsWebSocketVersion no está definido en este ámbito
        }
        }

        async function getEstadistics() {
            obs.call('GetSceneList').then((data) => {
                console.log('Scenes:', data);
                socket.emit('post-list-scenes', data.scenes);
              });
            // setInterval(async () => {
            //     currentProgramSceneName = await getEscenes();
            //     socket.emit('dataObs', `${currentProgramSceneName}`);
            //     console.log(currentProgramSceneName)
            // }, 1000);
        }

        async function getEscenes() {
            const {currentProgramSceneName} = await obs.call('GetCurrentProgramScene');
            return currentProgramSceneName
        }

    });

    return io;
}

function handleEvent(eventName, callback) {
    io.on(eventName, callback);
}

module.exports = { initSocket, handleEvent, io };
