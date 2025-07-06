#!/usr/bin/env node

/**
 * Script de Debug para Tests de Rendimiento
 * @description Ayuda a diagnosticar problemas en el inicio del servidor
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Debug del servidor
 */
async function debugServer() {
  colorLog('\n🔧 ======================================', 'cyan');
  colorLog('🛠️  Debug del Servidor', 'bright');
  colorLog('🔧 ======================================', 'cyan');

  const projectRoot = path.join(__dirname, '..');
  const appPath = path.join(projectRoot, 'app.mjs');

  colorLog(`📂 Directorio: ${projectRoot}`, 'blue');
  colorLog(`📝 Archivo: ${appPath}`, 'blue');
  colorLog(`🖥️  SO: ${os.platform()}`, 'blue');

  // Verificar que el archivo existe
  if (!fs.existsSync(appPath)) {
    colorLog(`❌ No se encuentra app.mjs en: ${appPath}`, 'red');
    return;
  }

  colorLog('✅ app.mjs encontrado', 'green');

  // Intentar iniciar el servidor con output completo
  colorLog('\n🚀 Iniciando servidor con debug completo...', 'yellow');

  const serverProcess = spawn('node', ['app.mjs'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3000',
      DEBUG: 'true',
      ENABLE_CLUSTERING: 'false',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let serverOutput = '';
  let serverError = '';
  let isRunning = false;

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    colorLog(`📝 STDOUT: ${output.trim()}`, 'blue');

    if (output.includes('listening') || output.includes('started') || output.includes('3000')) {
      isRunning = true;
    }
  });

  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    serverError += error;
    colorLog(`⚠️  STDERR: ${error.trim()}`, 'yellow');
  });

  serverProcess.on('error', (error) => {
    colorLog(`❌ Error proceso: ${error.message}`, 'red');
  });

  serverProcess.on('exit', (code, signal) => {
    colorLog(`🏁 Servidor terminado - código: ${code}, señal: ${signal}`, 'cyan');
  });

  // Esperar 10 segundos para ver qué pasa
  await new Promise((resolve) => {
    setTimeout(() => {
      colorLog('\n📊 ======================================', 'cyan');
      colorLog('📋 RESUMEN DEL DEBUG', 'bright');
      colorLog('📊 ======================================', 'cyan');

      colorLog(
        `🔍 Estado del servidor: ${isRunning ? 'Iniciado' : 'No iniciado'}`,
        isRunning ? 'green' : 'red'
      );

      if (serverOutput) {
        colorLog('\n📝 Output completo:', 'blue');
        console.log(serverOutput);
      }

      if (serverError) {
        colorLog('\n⚠️  Errores:', 'yellow');
        console.log(serverError);
      }

      // Terminar el proceso
      if (!serverProcess.killed) {
        colorLog('\n🛑 Terminando servidor...', 'yellow');
        serverProcess.kill('SIGTERM');
      }

      resolve();
    }, 10000);
  });
}

// Ejecutar
debugServer().catch((error) => {
  console.error('❌ Error en debug:', error);
  process.exit(1);
});
