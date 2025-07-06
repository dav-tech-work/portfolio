// Capturar el objeto formulario
const formNewUser = document.forms['formNewUser'];

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
      //  location.reload()
    })
    .catch((error) => {
      console.log('Error: ', error);
    });
});
