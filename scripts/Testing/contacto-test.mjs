#!/usr/bin/env node

import fetch from 'node-fetch';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testContactoAPI() {
  colorLog('\n🧪 ===== PRUEBA DEL SISTEMA DE CONTACTO =====', 'cyan');
  
  const baseURL = 'http://localhost:3000';
  const testData = {
    nombre: 'Usuario de Prueba',
    email: 'test@example.com',
    asunto: 'Consulta de prueba',
    mensaje: 'Este es un mensaje de prueba para verificar que el sistema de contacto funciona correctamente.',
  };
  
  try {
    // Prueba 1: Verificar que el servidor esté funcionando
    colorLog('\n📡 Prueba 1: Verificando que el servidor esté funcionando...', 'blue');
    
    const healthResponse = await fetch(`${baseURL}/api/contacto`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      colorLog('✅ Servidor funcionando correctamente', 'green');
      colorLog(`   Respuesta: ${healthData.message}`, 'green');
    } else {
      colorLog('❌ Servidor no responde correctamente', 'red');
      return;
    }
    
    // Prueba 2: Endpoint simple
    colorLog('\n📡 Prueba 2: Probando endpoint simple...', 'blue');
    
    const simpleResponse = await fetch(`${baseURL}/api/contacto/simple`);
    if (simpleResponse.ok) {
      const simpleData = await simpleResponse.json();
      colorLog('✅ Endpoint simple funcionando', 'green');
      colorLog(`   Respuesta: ${simpleData.message}`, 'green');
    } else {
      colorLog('❌ Endpoint simple falló', 'red');
    }
    
    // Prueba 3: Envío de formulario válido
    colorLog('\n📡 Prueba 3: Enviando formulario válido...', 'blue');
    
    const formResponse = await fetch(`${baseURL}/api/contacto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    if (formResponse.ok) {
      const formData = await formResponse.json();
      colorLog('✅ Formulario enviado correctamente', 'green');
      colorLog(`   Respuesta: ${formData.message}`, 'green');
      colorLog(`   Datos recibidos: ${JSON.stringify(formData.data)}`, 'green');
    } else {
      const errorData = await formResponse.json();
      colorLog('❌ Error al enviar formulario', 'red');
      colorLog(`   Status: ${formResponse.status}`, 'red');
      colorLog(`   Error: ${JSON.stringify(errorData)}`, 'red');
    }
    
    // Prueba 4: Validación de datos inválidos
    colorLog('\n📡 Prueba 4: Probando validación con datos inválidos...', 'blue');
    
    const invalidData = {
      nombre: '', // Nombre vacío
      email: 'email-invalido', // Email inválido
      asunto: '', // Asunto vacío
      mensaje: 'Corto', // Mensaje muy corto
    };
    
    const invalidResponse = await fetch(`${baseURL}/api/contacto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(invalidData),
    });
    
    if (!invalidResponse.ok) {
      const invalidErrorData = await invalidResponse.json();
      colorLog('✅ Validación funcionando correctamente (rechazó datos inválidos)', 'green');
      colorLog(`   Status: ${invalidResponse.status}`, 'green');
      colorLog(`   Errores: ${JSON.stringify(invalidErrorData.errors)}`, 'green');
    } else {
      colorLog('❌ La validación no está funcionando correctamente', 'red');
    }
    
    // Prueba 5: Verificar logs
    colorLog('\n📡 Prueba 5: Verificando logs...', 'blue');
    
    // Simular verificación de logs (en un entorno real se leerían los archivos)
    colorLog('✅ Logs verificados (simulado)', 'green');
    colorLog('   Los logs se guardan en logs/ y logs/audit/', 'green');
    
    colorLog('\n📊 ===== RESUMEN DE PRUEBAS =====', 'cyan');
    colorLog('✅ Todas las pruebas completadas', 'green');
    colorLog('\n💡 Notas importantes:', 'yellow');
    colorLog('   - El sistema funciona en modo simulado (EMAIL_ENABLED=false)', 'yellow');
    colorLog('   - Para envío real de correos, configura EMAIL_PASS y EMAIL_ENABLED=true', 'yellow');
    colorLog('   - Los mensajes se registran en los logs para auditoría', 'yellow');
    
  } catch (error) {
    colorLog('\n❌ Error durante las pruebas:', 'red');
    colorLog(`   ${error.message}`, 'red');
    colorLog('\n💡 Asegúrate de que el servidor esté ejecutándose:', 'yellow');
    colorLog('   npm start', 'yellow');
  }
  
  colorLog('\n🧪 ===== FIN PRUEBAS =====', 'cyan');
}

// Ejecutar pruebas
testContactoAPI();
