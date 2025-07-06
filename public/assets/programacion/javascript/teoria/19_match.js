// === Pattern Matching en JavaScript ===

// 1. Switch Case básico - La forma tradicional
function ejemploSwitch(valor) {
  switch (valor) {
    case 1:
      return 'Uno';
    case 2:
      return 'Dos';
    default:
      return 'Otro número';
  }
}

// 2. Pattern Matching con objetos
const patrones = {
  1: () => 'Uno',
  2: () => 'Dos',
  default: () => 'Otro número',
};

function matchNumero(valor) {
  return (patrones[valor] || patrones.default)();
}

// 3. Desestructuración de objetos
function procesarUsuario({ nombre, edad, rol = 'usuario' }) {
  console.log(`Nombre: ${nombre}, Edad: ${edad}, Rol: ${rol}`);
}

// 4. Pattern Matching con expresiones regulares
function validarFormato(texto) {
  const patrones = [
    { pattern: /^\d{8}[A-Z]$/, tipo: 'DNI' },
    { pattern: /^[A-Z]\d{7}[A-Z]$/, tipo: 'NIE' },
    { pattern: /^\d{4}-\d{4}-\d{4}-\d{4}$/, tipo: 'Tarjeta' },
  ];

  const coincidencia = patrones.find((p) => p.pattern.test(texto));
  return coincidencia ? coincidencia.tipo : 'Formato no reconocido';
}

// 5. Pattern Matching con Map
const estadosHTTP = new Map([
  [200, 'OK'],
  [404, 'No encontrado'],
  [500, 'Error del servidor'],
]);

function getEstadoHTTP(codigo) {
  return estadosHTTP.get(codigo) || 'Código desconocido';
}

// 6. Pattern Matching con funciones
const manejadores = {
  string: (valor) => `"${valor}"`,
  number: (valor) => valor.toFixed(2),
  boolean: (valor) => (valor ? 'Verdadero' : 'Falso'),
  object: (valor) => JSON.stringify(valor),
  undefined: () => 'No definido',
  default: (valor) => `Tipo no manejado: ${typeof valor}`,
};

function formatearValor(valor) {
  const tipo = typeof valor;
  return (manejadores[tipo] || manejadores.default)(valor);
}

// 7. Pattern Matching con arrays
function procesarArray([primero, segundo, ...resto]) {
  return {
    primero,
    segundo,
    restantes: resto.length,
    total: resto.length + 2,
  };
}

// 8. Pattern Matching con promesas
async function manejarRespuesta(respuesta) {
  switch (true) {
    case respuesta.ok && respuesta.status === 200:
      return await respuesta.json();
    case respuesta.status === 404:
      throw new Error('Recurso no encontrado');
    case respuesta.status >= 500:
      throw new Error('Error del servidor');
    default:
      throw new Error('Error desconocido');
  }
}

// 9. Pattern Matching con tipos personalizados
class Resultado {
  constructor(tipo, valor) {
    this.tipo = tipo;
    this.valor = valor;
  }

  match(patrones) {
    return (patrones[this.tipo] || patrones.default)?.(this.valor);
  }
}

const exito = new Resultado('exito', 'Operación completada');
const error = new Resultado('error', 'Algo salió mal');

const resultado = exito.match({
  exito: (valor) => `¡Éxito! ${valor}`,
  error: (valor) => `Error: ${valor}`,
  default: () => 'Resultado desconocido',
});

// 10. Pattern Matching con validación de datos
function validarDatos(datos) {
  const validadores = {
    nombre: (valor) => typeof valor === 'string' && valor.length >= 2,
    edad: (valor) => typeof valor === 'number' && valor >= 0,
    email: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor),
  };

  return Object.entries(datos).every(([clave, valor]) => validadores[clave]?.(valor) ?? true);
}

// Ejemplos de uso
console.log(ejemploSwitch(1)); // "Uno"
console.log(matchNumero(2)); // "Dos"
procesarUsuario({ nombre: 'Ana', edad: 25 }); // "Nombre: Ana, Edad: 25, Rol: usuario"
console.log(validarFormato('12345678A')); // "DNI"
console.log(getEstadoHTTP(404)); // "No encontrado"
console.log(formatearValor(42)); // "42.00"
console.log(procesarArray([1, 2, 3, 4, 5])); // { primero: 1, segundo: 2, restantes: 3, total: 5 }
console.log(validarDatos({ nombre: 'Juan', edad: 30 })); // true
