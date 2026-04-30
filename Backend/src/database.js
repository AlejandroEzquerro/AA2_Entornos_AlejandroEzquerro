const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const rutaBaseDatos = path.join(__dirname, 'pura_aventura.db');
const baseDatos = new sqlite3.Database(rutaBaseDatos);

baseDatos.run("PRAGMA foreign_keys = ON");

baseDatos.serialize(() => {

    baseDatos.run(`CREATE TABLE IF NOT EXISTS actividades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT
    )`);

    baseDatos.run(`CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_cliente TEXT NOT NULL,
        email TEXT NOT NULL,
        mensaje TEXT,
        actividad_id INTEGER,
        FOREIGN KEY (actividad_id) REFERENCES actividades(id)
    )`);
});

module.exports = baseDatos;