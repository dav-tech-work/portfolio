#!/usr/bin/env node

/**
 * Script de Seguridad Rápido
 * @description Versión ligera para verificaciones rápidas de seguridad
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de colores para consola
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
 * VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN
 */
function checkConfigQuick() {
  colorLog('\n🔍 VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivo config.env
  colorLog('\n📁 Verificando config.env:', 'blue');
  const configPath = path.join(__dirname, '../../config.env');

  if (!fs.existsSync(configPath)) {
    colorLog('❌ Archivo config.env no encontrado', 'red');
    allChecksPassed = false;
  } else {
    colorLog('✅ Archivo config.env encontrado', 'green');

    // Verificar secretos críticos
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const lines = configContent.split('\n');
      const envVars = {};

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      });

      const criticalSecrets = ['SESSION_SECRET', 'JWT_SECRET'];
      criticalSecrets.forEach((secretName) => {
        const secret = envVars[secretName];

        if (!secret) {
          colorLog(`❌ ${secretName} no configurado`, 'red');
          allChecksPassed = false;
        } else if (secret.length < 32) {
          colorLog(`⚠️ ${secretName} muy corto`, 'yellow');
        } else if (secret === 'CHANGE_THIS_TO_STRONG_SECRET_IN_PRODUCTION_AT_LEAST_32_CHARS') {
          colorLog(`❌ ${secretName} usa valor por defecto`, 'red');
          allChecksPassed = false;
        } else {
          colorLog(`✅ ${secretName} configurado`, 'green');
        }
      });

      // Verificar configuración básica
      if (envVars.RATE_LIMIT_WINDOW_MS && envVars.RATE_LIMIT_MAX_REQUESTS) {
        colorLog('✅ Rate limiting configurado', 'green');
      } else {
        colorLog('⚠️ Rate limiting incompleto', 'yellow');
      }

      if (envVars.CORS_ORIGIN || envVars.ALLOWED_ORIGINS) {
        colorLog('✅ CORS configurado', 'green');
      } else {
        colorLog('⚠️ CORS no configurado', 'yellow');
      }

    } catch (error) {
      colorLog(`❌ Error leyendo config.env: ${error.message}`, 'red');
      allChecksPassed = false;
    }
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE MIDDLEWARES
 */
function checkMiddlewaresQuick() {
  colorLog('\n🛡️ VERIFICACIÓN RÁPIDA DE MIDDLEWARES', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar middlewares críticos
  colorLog('\n📁 Verificando middlewares de seguridad:', 'blue');
  const middlewarePath = path.join(__dirname, '../../src/middleware');

  if (!fs.existsSync(middlewarePath)) {
    colorLog('❌ Directorio middleware no encontrado', 'red');
    allChecksPassed = false;
  } else {
    const criticalMiddlewares = ['sanitizer-advanced.mjs', 'rateLimiters.mjs', 'errorHandler.mjs'];

    criticalMiddlewares.forEach((file) => {
      const filePath = path.join(middlewarePath, file);
      if (fs.existsSync(filePath)) {
        colorLog(`✅ ${file} encontrado`, 'green');
      } else {
        colorLog(`❌ ${file} no encontrado`, 'red');
        allChecksPassed = false;
      }
    });

    // Verificar configuración de sanitización básica
    const sanitizerPath = path.join(middlewarePath, 'sanitizer-advanced.mjs');
    if (fs.existsSync(sanitizerPath)) {
      try {
        const sanitizerContent = fs.readFileSync(sanitizerPath, 'utf8');

        if (sanitizerContent.includes('validator.escape')) {
          colorLog('✅ Sanitización con validator.escape', 'green');
        } else {
          colorLog('⚠️ Sanitización básica', 'yellow');
        }

        if (sanitizerContent.includes('sanitizeRequest')) {
          colorLog('✅ Función de sanitización exportada', 'green');
        } else {
          colorLog('⚠️ Función de sanitización no encontrada', 'yellow');
        }
      } catch (error) {
        colorLog(`❌ Error leyendo sanitizador: ${error.message}`, 'red');
        allChecksPassed = false;
      }
    }
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE HEADERS
 */
function checkHeadersQuick() {
  colorLog('\n📄 VERIFICACIÓN RÁPIDA DE HEADERS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar headers en app.mjs
  colorLog('\n📄 Verificando headers en app.mjs:', 'blue');
  const appPath = path.join(__dirname, '../../app.mjs');

  if (!fs.existsSync(appPath)) {
    colorLog('❌ Archivo app.mjs no encontrado', 'red');
    allChecksPassed = false;
  } else {
    try {
      const appContent = fs.readFileSync(appPath, 'utf8');

      // Verificar middleware de sanitización
      if (appContent.includes('sanitizeRequest') || appContent.includes('sanitizer-advanced')) {
        colorLog('✅ Middleware de sanitización configurado', 'green');
      } else {
        colorLog('⚠️ Middleware de sanitización no configurado', 'yellow');
      }

      // Verificar middlewares de seguridad
      if (appContent.includes('sanitizeRequest') || appContent.includes('sanitizer-advanced')) {
        colorLog('✅ Middleware de sanitización configurado', 'green');
      } else {
        colorLog('⚠️ Middleware de sanitización no configurado', 'yellow');
      }

      if (appContent.includes('rateLimiters') || appContent.includes('rateLimit')) {
        colorLog('✅ Rate limiting configurado', 'green');
      } else {
        colorLog('⚠️ Rate limiting no configurado', 'yellow');
      }

      if (appContent.includes('errorHandler') || appContent.includes('notFoundHandler')) {
        colorLog('✅ Error handling configurado', 'green');
      } else {
        colorLog('⚠️ Error handling no configurado', 'yellow');
      }

      // Verificar configuración de seguridad
      if (appContent.includes('rateLimit') || appContent.includes('rateLimiters')) {
        colorLog('✅ Rate limiting configurado', 'green');
      } else {
        colorLog('⚠️ Rate limiting no configurado', 'yellow');
      }

    } catch (error) {
      colorLog(`❌ Error leyendo app.mjs: ${error.message}`, 'red');
      allChecksPassed = false;
    }
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE ARCHIVOS SENSIBLES
 */
function checkSensitiveFilesQuick() {
  colorLog('\n🚨 VERIFICACIÓN RÁPIDA DE ARCHIVOS SENSIBLES', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos sensibles
  colorLog('\n📁 Verificando archivos sensibles:', 'blue');
  const rootDir = path.join(__dirname, '../..');

  const requiredFiles = ['config.env', 'package.json', 'package-lock.json'];
  const sensitiveFiles = ['.env', 'secrets.json', 'private.key', 'certificate.pem'];

  // Verificar archivos requeridos
  requiredFiles.forEach((file) => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      colorLog(`✅ ${file} encontrado`, 'green');
    } else {
      colorLog(`❌ ${file} no encontrado`, 'red');
      allChecksPassed = false;
    }
  });

  // Verificar que archivos sensibles NO estén en el repositorio
  sensitiveFiles.forEach((file) => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      colorLog(`❌ ${file} presente (problema de seguridad)`, 'red');
      allChecksPassed = false;
    } else {
      colorLog(`✅ ${file} no presente (correcto)`, 'green');
    }
  });

  // Verificar .gitignore
  colorLog('\n📁 Verificando .gitignore:', 'blue');
  const gitignorePath = path.join(rootDir, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    try {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

      const sensitivePatterns = ['config.env', '.env', '*.key', '*.pem', 'secrets.json'];
      sensitivePatterns.forEach((pattern) => {
        if (gitignoreContent.includes(pattern)) {
          colorLog(`✅ ${pattern} en .gitignore`, 'green');
        } else {
          colorLog(`❌ ${pattern} no en .gitignore`, 'red');
          allChecksPassed = false;
        }
      });
    } catch (error) {
      colorLog(`❌ Error leyendo .gitignore: ${error.message}`, 'red');
      allChecksPassed = false;
    }
  } else {
    colorLog('❌ .gitignore no encontrado', 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE DEPENDENCIAS
 */
function checkDependenciesQuick() {
  colorLog('\n📦 VERIFICACIÓN RÁPIDA DE DEPENDENCIAS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar package.json
  colorLog('\n📁 Verificando dependencias de seguridad:', 'blue');
  const packagePath = path.join(__dirname, '../../package.json');

  if (!fs.existsSync(packagePath)) {
    colorLog('❌ package.json no encontrado', 'red');
    allChecksPassed = false;
  } else {
    try {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      const securityDeps = ['express', 'bcryptjs', 'validator'];
      securityDeps.forEach((dep) => {
        if (packageContent.dependencies && packageContent.dependencies[dep]) {
          colorLog(`✅ ${dep} instalado`, 'green');
        } else if (packageContent.devDependencies && packageContent.devDependencies[dep]) {
          colorLog(`✅ ${dep} instalado (dev)`, 'green');
        } else {
          colorLog(`⚠️ ${dep} no instalado`, 'yellow');
        }
      });

      // Verificar scripts de seguridad
      if (packageContent.scripts) {
        const securityScripts = ['seguridad', 'seguridad-completo', 'testing', 'analisis'];
        securityScripts.forEach((script) => {
          if (packageContent.scripts[script]) {
            colorLog(`✅ Script ${script} configurado`, 'green');
          } else {
            colorLog(`⚠️ Script ${script} no configurado`, 'yellow');
          }
        });
      }

    } catch (error) {
      colorLog(`❌ Error leyendo package.json: ${error.message}`, 'red');
      allChecksPassed = false;
    }
  }

  return allChecksPassed;
}

/**
 * EJECUCIÓN COMPLETA DEL RENDIMIENTO RÁPIDO
 */
function runQuickSecurity() {
  const startTime = Date.now();

  colorLog('\n⚡ SEGURIDAD RÁPIDA INICIADA', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificación de configuración
  const configOK = checkConfigQuick();

  // 2. Verificación de middlewares
  const middlewaresOK = checkMiddlewaresQuick();

  // 3. Verificación de headers
  const headersOK = checkHeadersQuick();

  // 4. Verificación de archivos sensibles
  const sensitiveOK = checkSensitiveFilesQuick();

  // 5. Verificación de dependencias
  const depsOK = checkDependenciesQuick();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN SEGURIDAD RÁPIDO', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🔍 Configuración: ${configOK ? '✅ OK' : '❌ Problemas'}`, configOK ? 'green' : 'red');
  colorLog(`🛡️ Middlewares: ${middlewaresOK ? '✅ OK' : '❌ Problemas'}`, middlewaresOK ? 'green' : 'red');
  colorLog(`📄 Headers: ${headersOK ? '✅ OK' : '❌ Problemas'}`, headersOK ? 'green' : 'red');
  colorLog(`🚨 Archivos sensibles: ${sensitiveOK ? '✅ OK' : '❌ Problemas'}`, sensitiveOK ? 'green' : 'red');
  colorLog(`📦 Dependencias: ${depsOK ? '✅ OK' : '❌ Problemas'}`, depsOK ? 'green' : 'red');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const allOK = configOK && middlewaresOK && headersOK && sensitiveOK && depsOK;
  colorLog(`\n🎯 Estado general: ${allOK ? '✅ SEGURO' : '❌ PROBLEMAS DE SEGURIDAD DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ SEGURIDAD RÁPIDO COMPLETADO', 'bright');
  colorLog('💡 Para seguridad completa, ejecuta: node scripts/Seguridad/security-complete.mjs', 'blue');
}

// Ejecutar si se llama directamente
runQuickSecurity();
