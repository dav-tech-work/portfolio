#!/usr/bin/env node

/**
 * Script para Configuración Automática de Docker
 * @description Automatiza el proceso de configuración y ejecución de Docker
 */

// import { fileURLToPath } from 'url';
// import path from 'path';
import { execSync } from 'child_process';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

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
 * Ejecutar comando y capturar salida
 */
function runCommand(command, description) {
  try {
    colorLog(`🔄 ${description}...`, 'blue');
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    colorLog(`✅ ${description} completado`, 'green');
    return { success: true, output };
  } catch (error) {
    colorLog(`❌ Error en ${description}: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Verificar si Docker está instalado
 */
function checkDocker() {
  colorLog('🔍 Verificando instalación de Docker...', 'cyan');

  const dockerCheck = runCommand('docker --version', 'Verificar Docker');
  const composeCheck = runCommand('docker-compose --version', 'Verificar Docker Compose');

  if (!dockerCheck.success || !composeCheck.success) {
    colorLog('❌ Docker o Docker Compose no están instalados', 'red');
    colorLog('📖 Instala Docker desde: https://docs.docker.com/get-docker/', 'yellow');
    return false;
  }

  colorLog('✅ Docker y Docker Compose están instalados', 'green');
  return true;
}

/**
 * Verificar configuración del proyecto
 */
function checkProjectConfig() {
  colorLog('🔍 Verificando configuración del proyecto...', 'cyan');

  const verifyResult = runCommand('npm run verify:docker', 'Verificar configuración de Docker');

  if (!verifyResult.success) {
    colorLog('❌ La configuración de Docker tiene problemas', 'red');
    colorLog('🔧 Revisa los errores arriba y corrígelos', 'yellow');
    return false;
  }

  colorLog('✅ Configuración del proyecto verificada', 'green');
  return true;
}

/**
 * Construir imagen de Docker
 */
function buildDockerImage() {
  colorLog('🏗️ Construyendo imagen de Docker...', 'cyan');

  const buildResult = runCommand('docker-compose build --no-cache', 'Construir imagen');

  if (!buildResult.success) {
    colorLog('❌ Error construyendo la imagen', 'red');
    return false;
  }

  colorLog('✅ Imagen construida correctamente', 'green');
  return true;
}

/**
 * Ejecutar contenedor
 */
function runContainer(background = false) {
  colorLog('🚀 Iniciando contenedor...', 'cyan');

  const command = background ? 'docker-compose up -d' : 'docker-compose up';
  const description = background ? 'Iniciar contenedor en background' : 'Iniciar contenedor';

  const runResult = runCommand(command, description);

  if (!runResult.success) {
    colorLog('❌ Error iniciando el contenedor', 'red');
    return false;
  }

  colorLog('✅ Contenedor iniciado correctamente', 'green');
  return true;
}

/**
 * Verificar que la aplicación funciona
 */
function verifyApplication() {
  colorLog('🔍 Verificando que la aplicación funciona...', 'cyan');

  // Esperar un poco para que la aplicación se inicie
  setTimeout(() => {
    const healthCheck = runCommand('curl -f http://localhost:3000/health', 'Health check');

    if (healthCheck.success) {
      colorLog('✅ Aplicación funcionando correctamente', 'green');
      colorLog('🌐 URL: http://localhost:3000', 'cyan');
      colorLog('🔍 Health: http://localhost:3000/health', 'cyan');
    } else {
      colorLog('⚠️ Health check falló, pero el contenedor puede estar iniciando', 'yellow');
      colorLog('📋 Verifica manualmente: curl http://localhost:3000/health', 'yellow');
    }
  }, 5000);
}

/**
 * Mostrar comandos útiles
 */
function showUsefulCommands() {
  colorLog('\n📋 Comandos útiles:', 'cyan');
  colorLog('=====================================', 'cyan');
  colorLog('Ver logs: docker-compose logs -f', 'yellow');
  colorLog('Ver estado: docker-compose ps', 'yellow');
  colorLog('Detener: docker-compose down', 'yellow');
  colorLog('Reiniciar: docker-compose restart', 'yellow');
  colorLog('Ver recursos: docker stats', 'yellow');
  colorLog('Acceder al contenedor: docker exec -it portfolio-web-seguro sh', 'yellow');
}

/**
 * Función principal
 */
async function setupDocker() {
  colorLog('🐳 Configuración Automática de Docker', 'cyan');
  colorLog('=====================================', 'cyan');

  // Verificar Docker
  if (!checkDocker()) {
    process.exit(1);
  }

  // Verificar configuración del proyecto
  if (!checkProjectConfig()) {
    process.exit(1);
  }

  // Construir imagen
  if (!buildDockerImage()) {
    process.exit(1);
  }

  // Preguntar si ejecutar en background
  const args = process.argv.slice(2);
  const background = args.includes('--background') || args.includes('-b');

  // Ejecutar contenedor
  if (!runContainer(background)) {
    process.exit(1);
  }

  // Verificar aplicación
  verifyApplication();

  // Mostrar comandos útiles
  showUsefulCommands();

  colorLog('\n🎉 ¡Configuración completada!', 'green');
}

// Ejecutar si se llama directamente
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].includes('docker-setup.mjs')
) {
  setupDocker().catch((error) => {
    colorLog(`❌ Error durante la configuración: ${error.message}`, 'red');
    process.exit(1);
  });
}

// Exportar la función para uso como módulo
export { setupDocker };
