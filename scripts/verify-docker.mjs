#!/usr/bin/env node

/**
 * Script para Verificar Configuración de Docker
 * @description Verifica que todos los archivos necesarios para Docker estén presentes y correctos
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

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
 * Verifica que un archivo existe
 */
function checkFileExists(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      colorLog(`✅ ${description}: ${filePath}`, 'green');
      return true;
    } else {
      colorLog(`❌ ${description}: ${filePath} - NO ENCONTRADO`, 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ Error verificando ${description}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Verifica que un directorio existe
 */
function checkDirectoryExists(dirPath, description) {
  try {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      colorLog(`✅ ${description}: ${dirPath}`, 'green');
      return true;
    } else {
      colorLog(`❌ ${description}: ${dirPath} - NO ENCONTRADO`, 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ Error verificando ${description}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Verifica el contenido del Dockerfile
 */
function checkDockerfile() {
  const dockerfilePath = path.join(__dirname, '..', 'docker', 'Dockerfile');

  if (!fs.existsSync(dockerfilePath)) {
    colorLog('❌ Dockerfile no encontrado', 'red');
    return false;
  }

  try {
    const content = fs.readFileSync(dockerfilePath, 'utf8');

    // Verificar elementos críticos
    const checks = [
      { name: 'FROM node:23-alpine', found: content.includes('FROM node:23-alpine3.21') },
      {
        name: 'COPY app.mjs',
        found: content.includes('COPY --from=builder --chown=appuser:appgroup /app/app.mjs'),
      },
      {
        name: 'COPY src/',
        found: content.includes('COPY --from=builder --chown=appuser:appgroup /app/src'),
      },
      {
        name: 'COPY public/',
        found: content.includes('COPY --from=builder --chown=appuser:appgroup /app/public'),
      },
      {
        name: 'COPY views/',
        found: content.includes('COPY --from=builder --chown=appuser:appgroup /app/views'),
      },
      { name: 'EXPOSE 3000', found: content.includes('EXPOSE 3000') },
      { name: 'CMD ["node", "app.mjs"]', found: content.includes('CMD ["node", "app.mjs"]') },
    ];

    let allChecksPassed = true;
    checks.forEach((check) => {
      if (check.found) {
        colorLog(`✅ Dockerfile: ${check.name}`, 'green');
      } else {
        colorLog(`❌ Dockerfile: ${check.name} - NO ENCONTRADO`, 'red');
        allChecksPassed = false;
      }
    });

    return allChecksPassed;
  } catch (error) {
    colorLog(`❌ Error leyendo Dockerfile: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Verifica el contenido del docker-compose.yml
 */
function checkDockerCompose() {
  const composePath = path.join(__dirname, '..', 'docker', 'docker-compose.yml');

  if (!fs.existsSync(composePath)) {
    colorLog('❌ docker-compose.yml no encontrado', 'red');
    return false;
  }

  try {
    const content = fs.readFileSync(composePath, 'utf8');

    // Verificar elementos críticos
    const checks = [
      { name: "version: '3.8'", found: content.includes("version: '3.8'") },
      { name: 'context: ..', found: content.includes('context: ..') },
      {
        name: 'dockerfile: docker/Dockerfile',
        found: content.includes('dockerfile: docker/Dockerfile'),
      },
      { name: 'PORT=3000', found: content.includes('PORT=3000') },
      { name: 'ports: "3000:3000"', found: content.includes('"3000:3000"') },
      { name: 'healthcheck', found: content.includes('healthcheck:') },
    ];

    let allChecksPassed = true;
    checks.forEach((check) => {
      if (check.found) {
        colorLog(`✅ docker-compose.yml: ${check.name}`, 'green');
      } else {
        colorLog(`❌ docker-compose.yml: ${check.name} - NO ENCONTRADO`, 'red');
        allChecksPassed = false;
      }
    });

    return allChecksPassed;
  } catch (error) {
    colorLog(`❌ Error leyendo docker-compose.yml: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Verifica archivos críticos del proyecto
 */
function checkCriticalFiles() {
  const projectRoot = path.join(__dirname, '..');

  const criticalFiles = [
    { path: 'app.mjs', description: 'Archivo principal de la aplicación' },
    { path: 'package.json', description: 'Configuración del proyecto' },
    { path: 'config.env.example', description: 'Configuración de ejemplo' },
    { path: 'robots.txt', description: 'Archivo robots.txt' },
    { path: 'sitemap.xml', description: 'Sitemap XML' },
  ];

  const criticalDirs = [
    { path: 'src', description: 'Código fuente' },
    { path: 'src/config', description: 'Configuración' },
    { path: 'src/middleware', description: 'Middlewares' },
    { path: 'src/routes', description: 'Rutas' },
    { path: 'src/utils', description: 'Utilidades' },
    { path: 'public', description: 'Archivos públicos' },
    { path: 'views', description: 'Plantillas EJS' },
    { path: 'data', description: 'Datos estáticos' },
  ];

  let allChecksPassed = true;

  // Verificar archivos críticos
  criticalFiles.forEach((file) => {
    const filePath = path.join(projectRoot, file.path);
    if (!checkFileExists(filePath, file.description)) {
      allChecksPassed = false;
    }
  });

  // Verificar directorios críticos
  criticalDirs.forEach((dir) => {
    const dirPath = path.join(projectRoot, dir.path);
    if (!checkDirectoryExists(dirPath, dir.description)) {
      allChecksPassed = false;
    }
  });

  return allChecksPassed;
}

/**
 * Función principal de verificación
 */
async function verifyDocker() {
  colorLog('🐳 Verificando Configuración de Docker', 'cyan');
  colorLog('=====================================', 'cyan');

  let allChecksPassed = true;

  // Verificar archivos de Docker
  colorLog('\n📄 Verificando archivos de Docker:', 'blue');
  if (!checkFileExists(path.join(__dirname, '..', 'docker', 'Dockerfile'), 'Dockerfile')) {
    allChecksPassed = false;
  }
  if (
    !checkFileExists(
      path.join(__dirname, '..', 'docker', 'docker-compose.yml'),
      'docker-compose.yml'
    )
  ) {
    allChecksPassed = false;
  }
  if (!checkFileExists(path.join(__dirname, '..', '.dockerignore'), '.dockerignore')) {
    allChecksPassed = false;
  }

  // Verificar contenido del Dockerfile
  colorLog('\n🔍 Verificando contenido del Dockerfile:', 'blue');
  if (!checkDockerfile()) {
    allChecksPassed = false;
  }

  // Verificar contenido del docker-compose.yml
  colorLog('\n🔍 Verificando contenido del docker-compose.yml:', 'blue');
  if (!checkDockerCompose()) {
    allChecksPassed = false;
  }

  // Verificar archivos críticos del proyecto
  colorLog('\n📁 Verificando archivos críticos del proyecto:', 'blue');
  if (!checkCriticalFiles()) {
    allChecksPassed = false;
  }

  // Resumen final
  colorLog('\n📊 Resumen de Verificación:', 'cyan');
  colorLog('=====================================', 'cyan');

  if (allChecksPassed) {
    colorLog('✅ TODAS LAS VERIFICACIONES PASARON', 'green');
    colorLog('🚀 Docker está listo para usar', 'green');
    colorLog('\n📋 Comandos disponibles:', 'yellow');
    colorLog('   docker-compose up --build', 'yellow');
    colorLog('   docker-compose up -d', 'yellow');
    colorLog('   docker-compose --profile database up -d', 'yellow');
  } else {
    colorLog('❌ ALGUNAS VERIFICACIONES FALLARON', 'red');
    colorLog('🔧 Revisa los errores arriba antes de continuar', 'red');
  }

  return allChecksPassed;
}

// Ejecutar verificación
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].includes('verify-docker.mjs')
) {
  verifyDocker()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      colorLog(`❌ Error durante la verificación: ${error.message}`, 'red');
      process.exit(1);
    });
}

// Exportar la función para uso como módulo
export { verifyDocker };
