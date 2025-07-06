// === Ejemplo de uso de librerías populares en JavaScript ===

// 1. Lodash - Utilidad para manipulación de datos
// npm install lodash
const _ = require('lodash');

// Ejemplos de Lodash
const numeros = [1, 2, 3, 4, 5];
const duplicados = _.uniq([1, 2, 2, 3, 3, 4, 5]);
const ordenado = _.sortBy([{ nombre: 'Juan' }, { nombre: 'Ana' }], 'nombre');
const agrupado = _.groupBy(['uno', 'dos', 'tres'], 'length');

// 2. Axios - Cliente HTTP
// npm install axios
const axios = require('axios');

// Ejemplo de petición HTTP
async function obtenerDatos() {
  try {
    const response = await axios.get('https://api.ejemplo.com/datos');
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// 3. Moment.js - Manipulación de fechas
// npm install moment
const moment = require('moment');

// Ejemplos de Moment.js
const ahora = moment();
const formatoPersonalizado = ahora.format('DD/MM/YYYY HH:mm');
const hace3Dias = moment().subtract(3, 'days');
const esFuturo = moment('2025-01-01').isAfter(ahora);

// 4. Chart.js - Gráficos
// npm install chart.js
const Chart = require('chart.js');

// Ejemplo de gráfico
const crearGrafico = () => {
  const ctx = document.getElementById('miGrafico');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Rojo', 'Azul', 'Amarillo'],
      datasets: [
        {
          label: 'Votos por color',
          data: [12, 19, 3],
        },
      ],
    },
  });
};

// 5. UUID - Generación de IDs únicos
// npm install uuid
const { v4: uuidv4 } = require('uuid');

// Ejemplo de UUID
const id = uuidv4();
console.log('ID único:', id);

// 6. Express - Framework web
// npm install express
const express = require('express');
const app = express();

// Ejemplo básico de servidor Express
app.get('/', (req, res) => {
  res.send('¡Hola mundo!');
});

// 7. Socket.io - Comunicación en tiempo real
// npm install socket.io
const io = require('socket.io');

// Ejemplo de WebSocket
io.on('connection', (socket) => {
  socket.on('mensaje', (data) => {
    console.log('Mensaje recibido:', data);
    socket.emit('respuesta', '¡Mensaje recibido!');
  });
});

// 8. bcrypt - Encriptación de contraseñas
// npm install bcrypt
const bcrypt = require('bcrypt');

// Ejemplo de hash de contraseña
async function encriptarPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// 9. JWT - JSON Web Tokens
// npm install jsonwebtoken
const jwt = require('jsonwebtoken');

// Ejemplo de JWT
const generarToken = (usuario) => {
  return jwt.sign({ id: usuario.id, email: usuario.email }, 'secreto', { expiresIn: '24h' });
};

// 10. Validator.js - Validación de datos
// npm install validator
const validator = require('validator');

// Ejemplos de validación
const esEmail = validator.isEmail('test@test.com');
const esURL = validator.isURL('https://ejemplo.com');
const esFecha = validator.isDate('2023-12-31');

// === Uso de módulos ES6 ===
// Ejemplo de importación/exportación moderna
import { nombreFuncion } from './modulo';
export const miFuncion = () => {
  // código
};

// === Gestión de dependencias ===
// package.json ejemplo
const packageJson = {
  name: 'mi-proyecto',
  version: '1.0.0',
  dependencies: {
    lodash: '^4.17.21',
    axios: '^0.21.1',
    moment: '^2.29.1',
  },
  devDependencies: {
    jest: '^27.0.6',
    eslint: '^7.32.0',
  },
};

// === Comandos npm comunes ===
/*
npm init            // Iniciar nuevo proyecto
npm install         // Instalar dependencias
npm install --save  // Instalar y guardar en dependencies
npm install --save-dev // Instalar y guardar en devDependencies
npm update          // Actualizar dependencias
npm run <script>    // Ejecutar script definido en package.json
*/
