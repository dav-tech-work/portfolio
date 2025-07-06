// Obtener el objeto formulario del HTML
const formInsert = document.forms['formInsert'];

formInsert.addEventListener('submit', (e) => {
  e.preventDefault();

  document.getElementById('errorUsuario').textContent = '';
  document.getElementById('errorColor').textContent = '';

  // obtener los datos del formulario
  const usuario = formInsert['usuario'].value.trim();
  const color = formInsert['color'].value.trim().toLocaleLowerCase();
  const web = formInsert['web'].value;
  const token = formInsert['token'].value;
  const id_usuario = formInsert['id_usuario'].value;

  const mensajeError = 'Contenido requerido';
  // Validar si usuario y/o color estan vacíos
  if (usuario === '' && color === '') {
    document.getElementById('errorUsuario').textContent = mensajeError;
    document.getElementById('errorColor').textContent = mensajeError;
    return;
  }
  if (usuario === '') {
    document.getElementById('errorUsuario').textContent = mensajeError;
    return;
  }
  if (color === '') {
    document.getElementById('errorColor').textContent = mensajeError;
    return;
  }

  // Comprobación del bot
  if (web !== '') {
    document.getElementById('errorColor').textContent = 'Bot detectado';
    return;
  }
  // Comprobación REGEX = REGular Expressions
  // Regla a cumplir
  const regex1 = /^[A-zÑñÇçÁÉÍÓÚáéíóúÀÈÌÒÙàèìòùüï·\s]+$/;
  // Reglas a NO cumplir
  const regex2 = /\W+/;
  const regex3 = /\d+/;

  const reglaUsuario = regex2.test(usuario) || regex3.test(usuario) || !regex1.test(usuario);
  const reglaColor = regex2.test(color) || regex3.test(color) || !regex1.test(color);

  const mensajeRegex = 'Caracteres no válidos';
  if (reglaUsuario && reglaColor) {
    document.getElementById('errorUsuario').textContent = mensajeRegex;
    document.getElementById('errorColor').textContent = mensajeRegex;
    return;
  }
  if (reglaUsuario) {
    document.getElementById('errorUsuario').textContent = mensajeRegex;

    return;
  }
  if (reglaColor) {
    document.getElementById('errorColor').textContent = mensajeRegex;
    return;
  }

  // Enviar datos a insert.php por POST
  const datos = new URLSearchParams();
  datos.append('usuario', usuario);
  datos.append('color', color);
  datos.append('web', web);
  datos.append('token', token);
  datos.append('id_usuario', id_usuario);

  fetch('../insert.php', {
    method: 'POST',
    body: datos.toString(),
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
    },
  })
    .then((respuesta) => respuesta.text())
    .then((data) => {
      console.log(data);
      location.reload();
    })
    .catch((error) => {
      console.log('Error: ', error);
    });
});

// CERRAR SESIÓN POR INACTIVIDAD
const tiempoInactividad = 300000; // Se mide en milisegundos

let temporizador;

function redirigir() {
  window.location.href = '../../controlador/logout.php';
}

function resetearTemporizador() {
  clearTimeout(temporizador);
  temporizador = setTimeout(redirigir, tiempoInactividad);
}

window.addEventListener('keydown', resetearTemporizador);
window.addEventListener('mousemove', resetearTemporizador);
window.addEventListener('scroll', resetearTemporizador);
window.addEventListener('click', resetearTemporizador);
window.addEventListener('touchstart', resetearTemporizador);

resetearTemporizador();
