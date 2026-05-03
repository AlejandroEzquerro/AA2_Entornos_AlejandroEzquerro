if (sessionStorage.getItem('sesion_activa') !== 'true') {
    window.location.href = 'contraseña.html';
}

const URL_API = 'http://localhost:8080';

function crearEstructuraTarjeta(titulo, arrayDatos, callbackEditar, callbackBorrar) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta';

    tarjeta.innerHTML = `
        <div class="contenido-tarjeta">
            <span class="titulo-listado">${titulo}</span>
            ${arrayDatos.map(texto => `<p class="dato-tarjeta">${texto}</p>`).join('')}
        </div>
        <div class="botones-contenedor">
            <button class="boton-editar">EDITAR</button>
            <button class="boton-borrar">BORRAR</button>
        </div>
    `;

    tarjeta.querySelector('.boton-editar').onclick = callbackEditar;
    tarjeta.querySelector('.boton-borrar').onclick = callbackBorrar;

    return tarjeta;
}


// BLOQUE 1: GESTIÓN DE ACTIVIDADES

const gestionActividades = {
    formulario: document.getElementById('formulario-actividad'),
    contenedor: document.getElementById('actividades-disponibles'),
    selectReservas: document.getElementById('reserva-actividad'),

    init() {
        this.formulario.addEventListener('submit', (evento) => this.guardar(evento));
        this.listar();
    },

    async listar() {
        const respuesta = await fetch(`${URL_API}/actividades`);
        const actividades = await respuesta.json();

        while (this.contenedor.firstChild) {
            this.contenedor.removeChild(this.contenedor.firstChild);
        }

        while (this.selectReservas.firstChild) {
            this.selectReservas.removeChild(this.selectReservas.firstChild);
        }

        const opcionDefecto = document.createElement('option');
        opcionDefecto.value = "";
        opcionDefecto.textContent = "-- Selecciona una actividad --";
        this.selectReservas.appendChild(opcionDefecto);

        actividades.forEach(actividad => {
            const tarjeta = crearEstructuraTarjeta(
                actividad.titulo,
                [actividad.descripcion || "Sin descripción"],
                () => this.prepararEdicion(actividad),
                () => this.borrar(actividad.id)
            );
            this.contenedor.appendChild(tarjeta);

            const opcionSelect = document.createElement('option');
            opcionSelect.value = actividad.id;
            opcionSelect.textContent = actividad.titulo;
            this.selectReservas.appendChild(opcionSelect);
        });
    },

    async guardar(evento) {
        evento.preventDefault();
        const idEdicion = this.formulario.dataset.idEdicion;

        const datosActividad = {
            titulo: document.getElementById('actividad-titulo').value,
            descripcion: document.getElementById('actividad-descripcion').value
        };

        const configuracion = {
            method: idEdicion ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActividad)
        };

        const urlFinal = idEdicion ? `${URL_API}/actividades/${idEdicion}` : `${URL_API}/actividades`;

        try {
            const respuesta = await fetch(urlFinal, configuracion);
            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                if (resultado.errores) {
                    const mensajes = resultado.errores.map(e => `- ${e.msg}`).join('\n');
                    alert("Error de validación:\n" + mensajes);
                } else {
                    alert("Error: " + (resultado.error || "No se pudo guardar"));
                }
                return;
            }

            alert("¡Actividad guardada con éxito!");
            this.limpiarFormulario();
            this.listar();
            gestionReservas.listar();

        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo conectar con el servidor.");
        }
    },

    prepararEdicion(actividad) {
        document.getElementById('actividad-titulo').value = actividad.titulo;
        document.getElementById('actividad-descripcion').value = actividad.descripcion;

        this.formulario.dataset.idEdicion = actividad.id;
        this.formulario.querySelector('button').textContent = "GUARDAR CAMBIOS";
        this.formulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    async borrar(idActividad) {
        try {
            const respuesta = await fetch(`${URL_API}/reservas`);

            if (!respuesta.ok) throw new Error("Error al conectar con el servidor");

            const reservas = await respuesta.json();

            const tieneReservas = reservas.some(reserva => reserva.actividad_id == idActividad);

            if (tieneReservas) {
                alert("No se puede eliminar: Esta actividad tiene reservas asociadas.");
                return;
            }

            if (confirm("¿Estás seguro de que deseas eliminar esta actividad?")) {
                const resDelete = await fetch(`${URL_API}/actividades/${idActividad}`, { method: 'DELETE' });

                if (resDelete.ok) {
                    this.listar();
                }
            }
        } catch (error) {
            console.error("Fallo en la validación de borrado:", error);
            alert("No se pudo verificar la disponibilidad. Revisa la consola.");
            this.listar();
        }
    },

    limpiarFormulario() {
        this.formulario.reset();
        delete this.formulario.dataset.idEdicion;
        this.formulario.querySelector('button').textContent = "Añadir Actividad";
    }
};

// BLOQUE 2: GESTIÓN DE RESERVAS

const gestionReservas = {
    formulario: document.getElementById('formulario-reserva'),
    contenedor: document.getElementById('contenedor-listado-reservas'),
    buscador: document.getElementById('buscador-actividad'),

    init() {
        this.formulario.addEventListener('submit', (evento) => this.guardar(evento));
        this.buscador.addEventListener('input', () => this.listar());
        this.listar();
    },

    async listar() {
        const respuesta = await fetch(`${URL_API}/reservas`);
        let reservas = await respuesta.json();

        const textoFiltro = this.buscador.value.toLowerCase();
        if (textoFiltro) {
            reservas = reservas.filter(reserva =>
                (reserva.nombre_actividad || "").toLowerCase().includes(textoFiltro)
            );
        }

        while (this.contenedor.firstChild) {
            this.contenedor.removeChild(this.contenedor.firstChild);
        }

        reservas.forEach(reserva => {
            const titulo = reserva.nombre_cliente;
            const datosCuerpo = [
                `Actividad: ${reserva.nombre_actividad || 'No asignada'}`,
                `Email: ${reserva.email}`,
                `Mensaje: ${reserva.mensaje || 'Sin mensaje'}`
            ];

            const tarjetaReserva = crearEstructuraTarjeta(
                titulo,
                datosCuerpo,
                () => this.prepararEdicion(reserva),
                () => this.borrar(reserva.id)
            );

            this.contenedor.appendChild(tarjetaReserva);
        });
    },

    async guardar(evento) {
        evento.preventDefault();
        const idEdicion = this.formulario.dataset.idEdicion;

        const datosReserva = {
            nombre_cliente: document.getElementById('reserva-nombre').value,
            email: document.getElementById('reserva-correo').value,
            actividad_id: parseInt(document.getElementById('reserva-actividad').value),
            mensaje: document.getElementById('reserva-mensaje').value
        };

        const configuracion = {
            method: idEdicion ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosReserva)
        };

        const urlFinal = idEdicion ? `${URL_API}/reservas/${idEdicion}` : `${URL_API}/reservas`;

        try {
            const respuesta = await fetch(urlFinal, configuracion);
            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                if (resultado.errores) {
                    const mensajes = resultado.errores.map(e => `- ${e.msg}`).join('\n');
                    alert("No se pudo registrar la reserva:\n" + mensajes);
                } else {
                    alert("Error: " + (resultado.error || "No se pudo procesar la reserva"));
                }
                return;
            }

            alert("¡Reserva registrada con éxito!");
            this.limpiarFormulario();
            this.listar();

        } catch (error) {
            console.error("Error de red:", error);
            alert("Error crítico: El servidor no responde.");
        }
    },

    prepararEdicion(reserva) {
        document.getElementById('reserva-nombre').value = reserva.nombre_cliente;
        document.getElementById('reserva-correo').value = reserva.email;
        document.getElementById('reserva-actividad').value = reserva.actividad_id;
        document.getElementById('reserva-mensaje').value = reserva.mensaje;

        this.formulario.dataset.idEdicion = reserva.id;
        this.formulario.querySelector('button').textContent = "ACTUALIZAR RESERVA";
        this.formulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    async borrar(idReserva) {
        if (confirm("¿Deseas cancelar definitivamente esta reserva?")) {
            await fetch(`${URL_API}/reservas/${idReserva}`, { method: 'DELETE' });
            this.listar();
        }
    },

    limpiarFormulario() {
        this.formulario.reset();
        delete this.formulario.dataset.idEdicion;
        this.formulario.querySelector('button').textContent = "Registrar Reserva";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    gestionActividades.init();
    gestionReservas.init();
});