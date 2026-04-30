const express = require('express');
const cors = require('cors');
const baseDatos = require('./database');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/actividades', (pedido, respuesta) => {
    const consulta = "SELECT * FROM actividades";
    baseDatos.all(consulta, [], (error, filas) => {
        if (error) {
            return respuesta.status(500).json({ error: error.message });
        }
        respuesta.json(filas);
    });
});

app.post('/actividades', (pedido, respuesta) => {
    const { titulo, descripcion } = pedido.body;
    const consulta = "INSERT INTO actividades (titulo, descripcion) VALUES (?, ?)";

    baseDatos.run(consulta, [titulo, descripcion], function (error) {
        if (error) {
            return respuesta.status(500).json({ error: error.message });
        }
        respuesta.status(201).json({ id_generado: this.lastID });
    });
});

app.put('/actividades/:id', (pedido, respuesta) => {
    const { titulo, descripcion } = pedido.body;
    const id_actividad = pedido.params.id;
    const consulta = "UPDATE actividades SET titulo = ?, descripcion = ? WHERE id = ?";

    baseDatos.run(consulta, [titulo, descripcion, id_actividad], function (error) {
        if (error) {
            return respuesta.status(500).json({ error: error.message });
        }
        if (this.changes === 0) {
            return respuesta.status(404).json({ mensaje: "No se encontró la actividad" });
        }
        respuesta.json({ mensaje: "Actividad actualizada correctamente" });
    });
});

app.delete('/actividades/:id', (pedido, respuesta) => {
    const id_actividad = pedido.params.id;
    const consulta = "DELETE FROM actividades WHERE id = ?";

    baseDatos.run(consulta, id_actividad, function (error) {
        if (error) {
            if (error.message.includes("FOREIGN KEY constraint failed")) {
                return respuesta.status(400).json({
                    error: "No se puede eliminar: Esta actividad tiene reservas asociadas."
                });
            }
            return respuesta.status(500).json({ error: error.message });
        }
        if (this.changes === 0) {
            return respuesta.status(404).json({ mensaje: "ID no encontrado" });
        }
        respuesta.json({ mensaje: "Actividad eliminada correctamente" });
    });
});

app.get('/reservas', (pedido, respuesta) => {
    const consulta = `
        SELECT reservas.*, actividades.titulo AS nombre_actividad 
        FROM reservas 
        LEFT JOIN actividades ON reservas.actividad_id = actividades.id
    `;
    baseDatos.all(consulta, [], (error, filas) => {
        if (error) {
            return respuesta.status(500).json({ error: error.message });
        }
        respuesta.json(filas);
    });
});

app.post('/reservas', (pedido, respuesta) => {
    const { nombre_cliente, email, mensaje, actividad_id } = pedido.body;
    const consulta = "INSERT INTO reservas (nombre_cliente, email, mensaje, actividad_id) VALUES (?, ?, ?, ?)";

    baseDatos.run(consulta, [nombre_cliente, email, mensaje, actividad_id], function (error) {
        if (error) {
            if (error.message.includes("FOREIGN KEY constraint failed")) {
                return respuesta.status(400).json({ error: "La actividad seleccionada no existe." });
            }
            return respuesta.status(500).json({ error: error.message });
        }
        respuesta.status(201).json({ id_generado: this.lastID });
    });
});

app.put('/reservas/:id', (pedido, respuesta) => {
    const { nombre_cliente, email, mensaje, actividad_id } = pedido.body;
    const id_reserva = pedido.params.id;
    const consulta = "UPDATE reservas SET nombre_cliente = ?, email = ?, mensaje = ?, actividad_id = ? WHERE id = ?";

    baseDatos.run(consulta, [nombre_cliente, email, mensaje, actividad_id, id_reserva], function (error) {
        if (error) {
            return respuesta.status(500).json({ error: error.message });
        }
        if (this.changes === 0) {
            return respuesta.status(404).json({ mensaje: "No se encontró la reserva" });
        }
        respuesta.json({ mensaje: "Reserva actualizada correctamente" });
    });
});

app.delete('/reservas/:id', (pedido, respuesta) => {
    const id_reserva = pedido.params.id;
    const consulta = "DELETE FROM reservas WHERE id = ?";

    baseDatos.run(consulta, id_reserva, function (error) {
        if (error) {
            return respuesta.status(500).json({ error: error.message });
        }
        if (this.changes === 0) {
            return respuesta.status(404).json({ mensaje: "Reserva no encontrada" });
        }
        respuesta.json({ mensaje: "Reserva cancelada correctamente" });
    });
});


const PUERTO = 8080;
app.listen(PUERTO, () => {
    console.log(`--- SERVIDOR PURA AVENTURA ACTIVO ---`);
    console.log(`URL: http://localhost:${PUERTO}`);
});