document.addEventListener('DOMContentLoaded', () => {
    const botonEntrar = document.getElementById('boton-entrar');
    const inputUsuario = document.getElementById('usuario');
    const inputPass = document.getElementById('password');
    const mensajeError = document.getElementById('mensaje-error');

    const realizarLogin = () => {
        const user = inputUsuario.value.trim();
        const pass = inputPass.value.trim();

        if (user === 'admin' && pass === '1234') {
            sessionStorage.setItem('sesion_activa', 'true');
            window.location.href = 'index.html'; 
        } else {
            mostrarError("Usuario o contraseña es incorrecto");
        }
    };

    const mostrarError = (texto) => {
        mensajeError.textContent = texto;
        mensajeError.style.color = "red";
        mensajeError.style.fontWeight = "bold";
        inputUsuario.value = '';
        inputPass.value = '';
        inputPass.focus();
    };

    const limpiarError = () => {
        mensajeError.textContent = '';
    };

    if (botonEntrar) {
        botonEntrar.addEventListener('click', realizarLogin);
    }
});