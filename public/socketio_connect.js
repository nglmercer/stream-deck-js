let btn_scene = null
// Conectar al socket
const socket = io();
// funciones
async function handleAction(action) {
    socket.emit('action', action)
    // try {
    //     const respose = await fetch('/api/v1', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({ action })
    //     });
    //     const data = await respose.json();
    //     document.getElementById('resp').innerHTML = data.mensaje;
    //     console.log(data.mensaje);
    // } catch (error) {
    //     console.error('error al realizar la accion:', error);
    // }
}

// Checa la conexion con el socket
socket.on('connect', function (data) {
    //console.log(data);
    console.log('Conectado con el socket',data);
    socket.emit('socket_data_obs',{data: 'Conexion preparada y lista para usar'})
});
socket.on('dataObs', function (data) {
    //console.log(data);
    console.log('Conectado con el socket',data);
});
socket.on('agg', function(data) {
    console.log(data);
    socket.emit('Holis', {data: 'Se envio los datos correctamente'});
});
socket.on('post-list-scenes', function(data) {
    console.log(data);
    var div_btn_scenes = document.getElementById('btn-scenes');
    div_btn_scenes.innerHTML = ''
    // Verifica si data es un array antes de intentar iterar sobre él
    if (Array.isArray(data)) {
        data.forEach((escena) => {
            let boton = document.createElement('button');
            boton.type = 'button';
            boton.classList.add('btn-scenas');
            boton.innerText = escena.sceneName;
            boton.addEventListener('click', () => {
                btn_scene = escena
                socket.emit('set_scenne', {name: escena.sceneName});
            });
            // Agrega el div el hijo
            div_btn_scenes.appendChild(boton);
        });
    } else {
        console.error('La data no es un array:', data);
    }
});
socket.on('data-update2', function(data) {
    // Parsear los datos JSON recibidos

        const data2 = JSON.parse(data);
        console.log(data2)
        obsVersion = data2.obsVersion
        console.log("version obs", obsVersion)
 

});

let ObsVer = document.getElementById('OBSVersion');
socket.on('data-update1', function(data) {


        const data1 = JSON.parse(data);
        console.log(data1)
        let obsVersion = null;
        if (!obsVersion) {
        obsVersion = data1.obsVersion
        ObsVer.innerHTML = obsVersion   
        console.log("version obs", data1.obsVersion)

        }
 

});

socket.on('startRecording', function(data) {
    console.log(data);
    // Verifica si data es un array antes de intentar iterar sobre él

});
socket.on('action-response', (data) => {
    document.getElementById('resp').innerHTML = data;
});

socket.on('volumen_actualizado', (data) => {
    const volumenData = JSON.parse(data);
    const nombre = volumenData.nombre_proceso;
    const volumen = volumenData.volumen;
    console.log("Nombre del proceso:", nombre);
    console.log("Nuevo volumen:", volumen);
    
    // Actualizar el valor del deslizador
    const volumenInput = document.getElementById(`${nombre}_volumen`);
    if (volumenInput) {
        volumenInput.value = volumen;
    }
});
// Función para crear un elemento de programa
function createProgramElement(programa) {
    const programaDiv = document.createElement('div');
    programaDiv.style.height = "50px"
    volumen = `${programa['Volume']}`
    console.log("volumen",volumen)
    namep = `${programa['Process Name']}`
    nameEXE = namep.replace(".exe","")
    programaDiv.innerHTML = `
        <label for="${namep}" class="flex text-white absolute text-2xl  w-full p-2 font-semibold items-center justify-center">${nameEXE}
        <input type="range" id="${namep}_volumen" name="${namep}_volumen" class="programa-volume bg-cyan-200/50  absolute appearance-none h-10 max-w-5xl w-9/12 rounded-full cursor-pointer" min="0" max="1" step="0.01" value="${programa['Volume']}" onchange="ajustarVolumen('${namep}')"></label>
    `;
    programaDiv.classList.add('programa-container'); // Agregar una clase al contenedor del programa
    // Agregar clases adicionales si es necesario
    // programaDiv.classList.add('clase-adicional');

    return programaDiv;
}

socket.on('data-obs_connect', (data) => {
    console.log("data-obs_connect",data);
    dataconnect = {

    }
});
document.getElementById('obsForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Obtener los valores del formulario
    const localhost = this.elements['localhost'].value;
    const port = this.elements['port'].value;
    const password = this.elements['password'].value;

    // Enviar los datos al servidor a través de Socket.IO
    socket.emit('obsConnection', { localhost, port, password });
    
    console.log(  localhost, port, password );

});
// Función para manejar la lista de programas recibida del servidor
socket.on('lista_programas', (data) => {
    const audiodata = JSON.parse(data);
    console.log(audiodata);
    // Obtener el contenedor de programas
    const programasContainer = document.getElementById('programasContainer');

    // Limpiar contenedor de programas
    programasContainer.innerHTML = '';

    // Iterar sobre cada programa y agregarlo al contenedor
    audiodata.forEach(programa => {
        const programaDiv = createProgramElement(programa);
        programasContainer.appendChild(programaDiv);
    });
});
// Función para ajustar el volumen cuando se cambia el deslizador
function ajustarVolumen(nombre) {
    const volumen = document.getElementById(`${nombre}_volumen`).value;
    socket.emit('set_volume', { nombre, volumen });
}
