// Capturar el objeto formulario
const formLogin = document.forms['formLogin'] || 'No';

if (formLogin != 'No') {
  formLogin.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('errorUsuario').textContent = '';
    document.getElementById('errorPassword').textContent = '';

    const nombre = formLogin['nombre'].value.trim();
    const password = formLogin['password'].value.trim();

    const mensajeError = 'Contenido requerido';

    // Validaciones
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

    // Enviar datos al servidor
    const datos = new URLSearchParams();
    datos.append('nombre', nombre);
    datos.append('password', password);

    fetch('../control/login.php', {
      method: 'POST',
      body: datos.toString(),
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
      .then((respuesta) => respuesta.text())
      .then((data) => {
        console.log(data);

        if (data === 'UsuarioInexistente' || data === 'PasswordIncorrecto') {
          document.getElementById('errorPassword').textContent = 'Usuario o contraseña incorrectos';
          return;
        }

        window.location.href = '../models/tareas.php';
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  });
}

// Capturar el objeto formulario de nuevo usuario
const formNewUser = document.forms['formNewUser'] || 'No';

if (formNewUser != 'No') {
  formNewUser.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('errorUsuario').textContent = '';
    document.getElementById('errorPassword').textContent = '';
    document.getElementById('errorEmail').textContent = '';

    const nombre = formNewUser['nombre'].value.trim();
    const password = formNewUser['password'].value.trim();
    const password2 = formNewUser['password2'].value.trim();
    const idioma = formNewUser['idioma'].value;
    const email = formNewUser['email'].value.trim();

    const mensajeError = 'Contenido requerido';

    // Validaciones
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

    // Enviar datos al servidor
    const datos = new URLSearchParams();
    datos.append('nombre', nombre);
    datos.append('password', password);
    datos.append('password2', password2);
    datos.append('email', email);
    datos.append('idioma', idioma);

    fetch('../control/acceso.php', {
      method: 'POST',
      body: datos.toString(),
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
      .then((respuesta) => respuesta.text())
      .then((data) => {
        console.log(data);
        // Aquí podrías redirigir al usuario o mostrar un mensaje de éxito
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  });
}

// Capturar el objeto formulario de restablecer contraseña
const formReset = document.forms['formReset'] || 'No';

if (formReset != 'No') {
  formReset.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('#errorEmail').textContent = '';

    const email = formReset['email'].value.trim();

    if (email === '') {
      document.querySelector('#errorEmail').textContent = 'Por favor, introduce tu email';
      return;
    }

    // Enviar datos al servidor
    const datos = new URLSearchParams();
    datos.append('email', email);

    fetch('../control/reset.php', {
      method: 'POST',
      body: datos.toString(),
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
      .then((respuesta) => respuesta.text())
      .then((data) => {
        console.log(data);
        if (data === 'error_1') {
          document.querySelector('#errorEmail').textContent =
            'No existe ningún usuario con ese email';
          return;
        }
        // Aquí podrías mostrar un mensaje de éxito
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  });
}
