// Ejemplo básico de try-catch
try {
  // Intentar algo que podría fallar
  const resultado = dividir(10, 0);
  console.log(resultado);
} catch (error) {
  // Manejar el error
  console.error('Se produjo un error:', error.message);
}

// Ejemplo con throw
function dividir(a, b) {
  if (b === 0) {
    throw new Error('No se puede dividir por cero');
  }
  return a / b;
}

// Ejemplo con finally
try {
  console.log('Iniciando operación...');
  const resultado = dividir(10, 2);
  console.log('Resultado:', resultado);
} catch (error) {
  console.error('Error:', error.message);
} finally {
  console.log('Operación finalizada');
}

// Ejemplo con tipos específicos de errores
try {
  const obj = null;
  console.log(obj.propiedad); // Generará TypeError
} catch (error) {
  if (error instanceof TypeError) {
    console.error('Error de tipo:', error.message);
  } else {
    console.error('Otro tipo de error:', error.message);
  }
}

// Ejemplo con async/await
async function obtenerDatos() {
  try {
    const response = await fetch('https://api.ejemplo.com/datos');
    const datos = await response.json();
    return datos;
  } catch (error) {
    console.error('Error al obtener datos:', error.message);
    throw error; // Re-lanzar el error
  }
}

// Ejemplo de encadenamiento de errores
class ValidacionError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ValidacionError';
  }
}

function validarEdad(edad) {
  try {
    if (typeof edad !== 'number') {
      throw new TypeError('La edad debe ser un número');
    }
    if (edad < 0) {
      throw new ValidacionError('La edad no puede ser negativa');
    }
    if (edad > 120) {
      throw new ValidacionError('La edad parece no ser válida');
    }
    return true;
  } catch (error) {
    if (error instanceof ValidacionError) {
      console.error('Error de validación:', error.message);
    } else {
      console.error('Error inesperado:', error.message);
    }
    throw error; // Re-lanzar para manejo superior
  }
}
