// Capturar el objeto formulario
const formLogin = document.forms['formLogin'] || 'No';

if (formLogin != 'No') {
  formLogin.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('errorUsuario').textContent = '';
    document.getElementById('errorPassword').textContent = '';

    const nombre = formLogin['nombre'].value.trim();
    // Pendiente: Corregir el nombre
    const password = formLogin['password'].value.trim();

    const mensajeError = 'Contenido requerido';
    if (nombre === '' && password === '') {
      document.getElementById('errorUsuario').textContent = mensajeError;
      document.getElementById('errorPassword').textContent = mensajeError;
      return;
    }
    if (nombre === '') {
      document.getElementById('errorUsuario').textContent = mensajeError;
      return;
    }
    if (password === '') {
      document.getElementById('errorPassword').textContent = mensajeError;
      return;
    }

    // Comprobación por REGEX
    // Enviar datos a acceso.php
    const datos = new URLSearchParams();
    datos.append('nombre', nombre);
    datos.append('password', password);

    fetch('../controlador/login.php', {
      method: 'POST',
      body: datos.toString(),
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
      .then((respuesta) => respuesta.text())
      .then((data) => {
        console.log(data);

        if (data == 'UsuarioInexistente' || data == 'PasswordIncorrecto') {
          document.getElementById('errorPassword').textContent = 'Usuario o contraseña incorrectos';
          return;
        }

        // alert(`Usuario ${nombre} creado c {orrectamente`)
        window.location.href = '../colores.php';
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  });
}

// Capturar el objeto formulario
const formNewUser = document.forms['formNewUser'] || 'No';

if (formNewUser != 'No') {
  formNewUser.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('errorUsuario').textContent = '';
    document.getElementById('errorPassword').textContent = '';
    document.getElementById('errorEmail').textContent = '';

    const nombre = formNewUser['nombre'].value.trim();
    // Pendiente: Corregir el nombre
    const password = formNewUser['password'].value.trim();
    const password2 = formNewUser['password2'].value.trim();
    const idioma = formNewUser['idioma'].value;
    const email = formNewUser['email'].value.trim();

    // console.log(nombre, password, password2, idioma, email);

    const mensajeError = 'Contenido requerido';
    if (nombre === '' && password === '' && password2 === '' && email === '') {
      document.getElementById('errorUsuario').textContent = mensajeError;
      document.getElementById('errorPassword').textContent = mensajeError;
      document.getElementById('errorEmail').textContent = mensajeError;
      return;
    }
    if (nombre === '') {
      document.getElementById('errorUsuario').textContent = mensajeError;
      return;
    }
    if (password === '' || password2 === '') {
      document.getElementById('errorPassword').textContent = mensajeError;
      return;
    }
    if (email === '') {
      document.getElementById('errorEmail').textContent = mensajeError;
      return;
    }

    // Si las dos contraseñas no coinciden
    if (password !== password2) {
      document.getElementById('errorPassword').textContent = 'Las contraseñas no coinciden';
      return;
    }

    // Comprobación por REGEX

    // Enviar datos a acceso.php
    const datos = new URLSearchParams();
    datos.append('nombre', nombre);
    datos.append('password', password);
    datos.append('password2', password2);
    datos.append('email', email);
    datos.append('idioma', idioma);

    fetch('../controlador/acceso.php', {
      method: 'POST',
      body: datos.toString(),
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
      .then((respuesta) => respuesta.text())
      .then((data) => {
        console.log(data);
        // alert(`Usuario ${nombre} creado correctamente`)
        window.location.href = '../email.php';
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  });
}

const formReset = document.forms['formReset'] || 'No';

if (formReset != 'No') {
  formReset.addEventListener('submit', (event) => {
    event.preventDefault();
    // alert("Reset")
    document.querySelector('#errorEmail').textContent = '';
    // const mensajeError = "Contenido requerido";
    const email = formReset['email'].value.trim();
    // if (email === "") {
    // document.getElementById("errorReset").textContent = mensajeError;
    // return;
    const dato = new URLSearchParams();
    dato.append('email', email);
    fetch('../controlador/reset.php', {
      method: 'POST',
      body: dato.toString(),
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
      .then((respuesta) => respuesta.text())
      .then((data) => {
        console.log(data);
        if (data === 'error_1') {
          document.querySelector('#errorEmail').textContent = 'Error: email no registrado';
        }
        // alert(`Usuario ${nombre} creado correctamente`)
        window.location.href = 'index.php?formulario=revisar';
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  });
}

const formRestablecer = document.forms['formRestablecer'];

if (formRestablecer) {
  formRestablecer.addEventListener('submit', (event) => {
    event.preventDefault();

    // Limpiar mensajes de error
    document.getElementById('errorPassword1').textContent = '';
    document.getElementById('errorPassword2').textContent = '';

    const pass1 = formRestablecer['pass1'].value.trim();
    const pass2 = formRestablecer['pass2'].value.trim();
    let error = false;

    // Validar que las contraseñas no estén vacías
    if (!pass1) {
      document.getElementById('errorPassword1').textContent = 'La contraseña es requerida';
      error = true;
    }

    if (!pass2) {
      document.getElementById('errorPassword2').textContent = 'Debes repetir la contraseña';
      error = true;
    }

    // Validar que las contraseñas coincidan
    if (pass1 && pass2 && pass1 !== pass2) {
      document.getElementById('errorPassword2').textContent = 'Las contraseñas no coinciden';
      error = true;
    }

    // Si hay errores, detener el envío
    if (error) return;

    // Si todo está bien, enviar al servidor
    const datos = new URLSearchParams();
    datos.append('nueva_password', pass1);

    fetch('../controlador/nueva_pass.php', {
      method: 'POST',
      body: datos.toString(),
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
      .then((respuesta) => respuesta.text())
      .then((data) => {
        console.log(data);
        if (data === 'exito') {
          window.location.href = '../index.php?mensaje=Contraseña actualizada correctamente';
        } else {
          alert('Error al actualizar la contraseña: ' + data);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
      });
  });
}
