Proyecto desarrollado para la 2ª Evaluación de Entornos de Desarrollo. Se trata de una aplicación web que permite gestionar actividades de aventura y las reservas de clientes.
Descripcion del proyecto 
    -La aplicación consiste en una API REST construida con Node.js y Express que gestiona una base de datos SQLite. El frontend, desarrollado con HTML, CSS y JavaScript, permite realizar todas las operaciones CRUD sobre dos entidades relacionadas: Actividades y Reservas.
Funcionalidades Implementadas
    -CRUD Completo de Actividades
    -CRUD Completo de Reservas
    -Relación de Datos entre dos entidades
    -Sistema de Login
    -Validadcion de datos en el Backend
Instrucciones de Instalación y Puesta en Marcha
    -Requisitos Previos
        -Tener instalado Node.js.
    -Configuración del Backend
        -Navega a la carpeta del servidor.
        -Instala las dependencias necesarias:
            -npm install express cors sqlite3 express-validator
        -Inicia el servidor:
            -node index.js
            -El servidor estará escuchando en: http://localhost:8080
        -Configuración del Frontend
            -Asegúrate de que el servidor funcione
            -Abre el archivo contraseña.html en tu navegador.
            -Introduce las credenciales de acceso:
                -Usuario: admin
                -Contraseña: 1234