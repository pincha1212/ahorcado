// Elementos del DOM
const selectorNivel = document.getElementById('nivel');
const inputPersonalizado = document.getElementById('palabra-personalizada');
const btnPersonalizar = document.getElementById('btn-personalizar');
const modalConfig = document.getElementById('modal-config');
const contenedorJuego = document.getElementById('contenedor-juego');
const selectorNivelJuego = document.getElementById('nivel-juego');
const elementoPalabra = document.getElementById('palabra');
const elementoIncorrectas = document.getElementById('incorrectas');
const elementoMensaje = document.getElementById('mensaje');
const botonReiniciar = document.getElementById('reiniciar-btn');
const teclado = document.getElementById('teclado');
const partesCuerpo = document.querySelectorAll('.parte-cuerpo');
const elementoPuntos = document.getElementById('puntuacion');
const intentosRestantesElement = document.getElementById('intentos-restantes');

// Variables de estado del juego
let usuarioActualId = null;
let palabraSecreta = "";
let puntos = 0;
let juegoTerminado = false;
let maxErrores = 6;
let errores = 0;
let partesMostradas = 0;
let letrasCorrectas = [];
let letrasIncorrectas = [];
let juegoIniciado = false;

// Configuración de niveles
const configNiveles = {
    1: { intentos: 8, puntosLetra: 10, puntosError: -5 },
    2: { intentos: 6, puntosLetra: 15, puntosError: -10 },
    3: { intentos: 4, puntosLetra: 20, puntosError: -15 }
};

// Palabras para el juego
const palabras = ["PYTHON", "JAVASCRIPT", "HTML", "CSS", "WEB"];

/* ----------------------- Funciones del Juego ----------------------- */

function reiniciarPartesCuerpo() {
    partesMostradas = 0;
    partesCuerpo.forEach(parte => {
        parte.style.display = 'none';
    });
    document.querySelectorAll('.extra-cara').forEach(el => el.remove());
}

function inicializarJuego() {
    juegoTerminado = false;
    juegoIniciado = true;
    const nivel = parseInt(selectorNivelJuego.value);
    const config = configNiveles[nivel];
    maxErrores = config.intentos;
    errores = 0;
    letrasIncorrectas = [];
    letrasCorrectas = [];

    reiniciarPartesCuerpo();

    // Reiniciar UI
    elementoMensaje.textContent = '';
    elementoIncorrectas.textContent = '';
    actualizarIntentosRestantes();
    elementoPuntos.textContent = `Puntos: ${puntos}`;

    // Seleccionar palabra
    if (!palabraSecreta) {
        const palabrasFiltradas = palabras.filter(p => {
            if (nivel === 1) return p.length <= 6;
            if (nivel === 2) return p.length <= 8;
            return p.length > 8;
        });
        palabraSecreta = palabrasFiltradas[Math.floor(Math.random() * palabrasFiltradas.length)] || "WEB";
    }

    // Inicializar letras
    letrasCorrectas = palabraSecreta.split('').map(c => (c === ' ' ? ' ' : '_'));
    actualizarPalabraVisual();

    // Generar teclado
    teclado.innerHTML = '';
    for (let letra = 65; letra <= 90; letra++) {
        const boton = document.createElement('button');
        boton.className = 'letra-btn';
        boton.textContent = String.fromCharCode(letra);
        boton.addEventListener('click', () => manejarIntento(boton.textContent));
        teclado.appendChild(boton);
    }
}

function actualizarIntentosRestantes() {
    const restantes = maxErrores - errores;
    intentosRestantesElement.textContent = `Intentos restantes: ${restantes > 0 ? restantes : 0}`;
}

function manejarIntento(letra) {
    if (!juegoIniciado || juegoTerminado) return;

    // Deshabilitar la letra inmediatamente
    document.querySelectorAll('.letra-btn').forEach(boton => {
        if (boton.textContent === letra) boton.disabled = true;
    });

    let acierto = false;
    palabraSecreta.split('').forEach((caracter, indice) => {
        if (caracter === letra) {
            letrasCorrectas[indice] = letra;
            acierto = true;
        }
    });

    if (acierto) {
        actualizarPuntos(configNiveles[parseInt(selectorNivelJuego.value)].puntosLetra);
        actualizarPalabraVisual();
    } else {
        if (!letrasIncorrectas.includes(letra)) {
            letrasIncorrectas.push(letra);
            errores++;

            // Mostrar parte del cuerpo
            if (partesMostradas < partesCuerpo.length) {
                partesCuerpo[partesMostradas].style.display = 'block';
                partesMostradas++;
            } else {
                agregarDetalleCara(partesMostradas - partesCuerpo.length + 1);
                partesMostradas++;
            }

            actualizarPuntos(configNiveles[parseInt(selectorNivelJuego.value)].puntosError);
            actualizarIncorrectas();
            actualizarIntentosRestantes();
        }
    }

    // Verificar fin del juego
    if (letrasCorrectas.join('') === palabraSecreta) {
        terminarJuego(true);
    } else if (errores >= maxErrores) {
        terminarJuego(false);
    }
}

function terminarJuego(ganado) {
    juegoTerminado = true;
    juegoIniciado = false;
    elementoMensaje.textContent = ganado
        ? `🥳 ¡Ganaste!`
        : `😭 ¡Perdiste! La palabra era: ${palabraSecreta}`;
    deshabilitarTeclado();
    guardarPuntuacion();
}

/* ----------------------- Autenticación ----------------------- */

// Agregar esto en la sección de Event Listeners
document.getElementById('btn-register').addEventListener('click', async () => {

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch('https://ahorcado-backend-kr2aq1xb7-pincha1212s-projects.vercel.app/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error en registro");

        alert('✅ Registro exitoso. Ahora puedes iniciar sesión.');
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('btn-login').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('https://ahorcado-backend-kr2aq1xb7-pincha1212s-projects.vercel.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error en login");
        }

        // Guardar userId en localStorage
        localStorage.setItem('userId', data.userId);
        usuarioActualId = data.userId;

        // Cargar la puntuación del usuario
        await cargarPuntuacionUsuario();

        // Cambiar la interfaz: ocultar la sección de login y mostrar la configuración
        document.querySelector('.auth-section').classList.add('oculto');
        modalConfig.classList.remove('oculto');
    } catch (error) {
        alert(error.message);
    }
});


document.getElementById('btn-personalizar').addEventListener('click', () => {
    const palabra = inputPersonalizado.value.toUpperCase().trim();
    if (palabra) palabraSecreta = palabra;

    modalConfig.classList.add('oculto');
    contenedorJuego.classList.remove('oculto');
    inicializarJuego();
});

document.getElementById('reiniciar-btn').addEventListener('click', () => {
    contenedorJuego.classList.add('oculto');
    modalConfig.classList.remove('oculto');
    palabraSecreta = "";
    juegoTerminado = false;
    juegoIniciado = false;
    errores = 0;
    letrasCorrectas = [];
    letrasIncorrectas = [];

});

/* ----------------------- Puntuación y Leaderboard ----------------------- */

async function cargarPuntuacionUsuario() {
    if (!usuarioActualId) return;

    try {
        const response = await fetch(`https://ahorcado-backend-kr2aq1xb7-pincha1212s-projects.vercel.app/api/scores/user/${usuarioActualId}`);
        if (response.ok) {
            const data = await response.json();
            puntos = data?.score || 0;
            elementoPuntos.textContent = `Puntos: ${puntos}`;
        }
    } catch (error) {
        console.error("Error cargando puntuación:", error);
    }
}

async function guardarPuntuacion() {
    if (!usuarioActualId) return;

    try {
        await fetch('https://ahorcado-backend-kr2aq1xb7-pincha1212s-projects.vercel.app/api/scores/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: usuarioActualId,
                score: puntos,
                difficulty: parseInt(selectorNivelJuego.value)
            })
        });
        await actualizarLeaderboard();
    } catch (error) {
        console.error("Error guardando puntuación:", error);
    }
}

async function actualizarLeaderboard() {
    try {
        const response = await fetch('https://ahorcado-backend-kr2aq1xb7-pincha1212s-projects.vercel.app/api/scores/leaderboard');
        const scores = await response.json();

        let leaderboardHTML = '';
        scores.forEach((score, index) => {
            const isCurrent = score.user._id === usuarioActualId;
            leaderboardHTML += `
                <div class="leaderboard-entry ${isCurrent ? 'current-user' : ''}">
                    ${index + 1}. ${score.user.username}: ${score.score}p
                    ${isCurrent ? ' ← TÚ' : ''}
                </div>
            `;
        });

        document.getElementById('leaderboard-content').innerHTML = leaderboardHTML;
    } catch (error) {
        console.error("Error cargando leaderboard:", error);
    }
}

/* ----------------------- Helpers ----------------------- */

function actualizarPalabraVisual() {
    elementoPalabra.innerHTML = letrasCorrectas.map(c => c === ' ' ? '&nbsp;&nbsp;' : c).join(' ');
}

function actualizarPuntos(cantidad) {
    puntos += cantidad;
    elementoPuntos.textContent = `Puntos: ${puntos}`;
}

function actualizarIncorrectas() {
    const nivel = parseInt(selectorNivelJuego.value);
    const maxMostrar = nivel === 1 ? 8 : nivel === 2 ? 6 : 4;
    elementoIncorrectas.textContent = `Incorrectas: ${letrasIncorrectas.slice(-maxMostrar).join(' ')}`;
}

function deshabilitarTeclado() {
    document.querySelectorAll('.letra-btn').forEach(boton => boton.disabled = true);
}

function agregarDetalleCara(tipo) {
    const svg = document.getElementById('ahorcado');
    let elemento;

    switch (tipo) {
        case 1:
            elemento = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            elemento.setAttribute('cx', '190');
            elemento.setAttribute('cy', '90');
            elemento.setAttribute('r', '3');
            break;
        case 2:
            elemento = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            elemento.setAttribute('cx', '210');
            elemento.setAttribute('cy', '90');
            elemento.setAttribute('r', '3');
            break;
        case 3:
            elemento = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            elemento.setAttribute('d', 'M 195 110 Q 200 120 205 110');
            break;
    }

    elemento.classList.add('parte-cuerpo', 'extra-cara');
    elemento.style.display = 'block';
    svg.appendChild(elemento);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    actualizarLeaderboard();


    selectorNivelJuego.addEventListener('change', () => {
        palabraSecreta = "";
        inputPersonalizado.value = "";
        inicializarJuego();
    });
});