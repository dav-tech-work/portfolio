#!/usr/bin/env node

/**
 * Script para Generar Configuración de Testing
 * @description Crea o actualiza config.env con valores seguros para testing
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

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
 * Genera un secret aleatorio seguro
 */
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Crea configuración para testing
 */
async function createTestConfig() {
  colorLog('\n🔧 ======================================', 'cyan');
  colorLog('🛠️  Generador de Configuración de Testing', 'bright');
  colorLog('🔧 ======================================', 'cyan');

  const projectRoot = path.join(__dirname, '..');
  const configEnvPath = path.join(projectRoot, 'config.env');

  const existingConfig = {};
  let configExists = false;

  // Leer configuración existente si existe
  if (fs.existsSync(configEnvPath)) {
    colorLog('📝 Configuración existente encontrada', 'blue');
    configExists = true;

    try {
      const content = fs.readFileSync(configEnvPath, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          existingConfig[key.trim()] = valueParts.join('=').trim();
        }
      }
    } catch (error) {
      colorLog(`⚠️  Error leyendo configuración existente: ${error.message}`, 'yellow');
    }
  }

  // Configuración base para testing
  const testConfig = {
    NODE_ENV: existingConfig.NODE_ENV || 'test',
    PORT: existingConfig.PORT || '3000',

    // Secrets - generar nuevos si no existen, son muy cortos, o estamos en CI
    JWT_SECRET:
      existingConfig.JWT_SECRET && existingConfig.JWT_SECRET.length >= 32 && !process.env.CI
        ? existingConfig.JWT_SECRET
        : generateSecret(32),
    SESSION_SECRET:
      existingConfig.SESSION_SECRET && existingConfig.SESSION_SECRET.length >= 32 && !process.env.CI
        ? existingConfig.SESSION_SECRET
        : generateSecret(32),

    // Base de datos
    MONGODB_URI: existingConfig.MONGODB_URI || 'mongodb://localhost:27017/test_performance_db',

    // Configuraciones de seguridad optimizadas para testing
    BCRYPT_ROUNDS: existingConfig.BCRYPT_ROUNDS || '4',
    RATE_LIMIT_WINDOW_MS: existingConfig.RATE_LIMIT_WINDOW_MS || '60000',
    RATE_LIMIT_MAX_REQUESTS: existingConfig.RATE_LIMIT_MAX_REQUESTS || '1000',

    // Configuraciones adicionales
    LOG_LEVEL: existingConfig.LOG_LEVEL || 'error',
    ENABLE_CLUSTERING: existingConfig.ENABLE_CLUSTERING || 'false',
    CORS_ORIGIN: existingConfig.CORS_ORIGIN || 'http://localhost:3000',
  };

  // Crear el contenido del archivo
  const configContent = `# Configuración para Testing de Rendimiento
# Generado automáticamente el ${new Date().toISOString()}

# Entorno
NODE_ENV=${testConfig.NODE_ENV}
PORT=${testConfig.PORT}

# Secrets de Seguridad
JWT_SECRET=${testConfig.JWT_SECRET}
SESSION_SECRET=${testConfig.SESSION_SECRET}

# Base de Datos
MONGODB_URI=${testConfig.MONGODB_URI}

# Configuraciones de Seguridad (optimizadas para testing)
BCRYPT_ROUNDS=${testConfig.BCRYPT_ROUNDS}
RATE_LIMIT_WINDOW_MS=${testConfig.RATE_LIMIT_WINDOW_MS}
RATE_LIMIT_MAX_REQUESTS=${testConfig.RATE_LIMIT_MAX_REQUESTS}

# Configuraciones Adicionales
LOG_LEVEL=${testConfig.LOG_LEVEL}
ENABLE_CLUSTERING=${testConfig.ENABLE_CLUSTERING}
CORS_ORIGIN=${testConfig.CORS_ORIGIN}

# Configuraciones opcionales para testing
# Descomenta según necesites
# EMAIL_HOST=localhost
# EMAIL_PORT=587
# EMAIL_USER=test@example.com
# EMAIL_PASS=testpassword
`;

  // Escribir la configuración
  fs.writeFileSync(configEnvPath, configContent);

  colorLog('\n📊 ======================================', 'cyan');
  colorLog('📋 CONFIGURACIÓN GENERADA', 'bright');
  colorLog('📊 ======================================', 'cyan');

  if (configExists) {
    colorLog('🔄 Configuración actualizada', 'green');
  } else {
    colorLog('🆕 Nueva configuración creada', 'green');
  }

  colorLog(`📁 Archivo: ${configEnvPath}`, 'blue');

  // Mostrar cambios realizados
  const changes = [];
  const isCI = process.env.CI;

  if (!existingConfig.JWT_SECRET || existingConfig.JWT_SECRET.length < 32 || isCI) {
    changes.push('🔑 JWT_SECRET generado');
    if (isCI) changes.push('  (Forzado por CI)');
  }
  if (!existingConfig.SESSION_SECRET || existingConfig.SESSION_SECRET.length < 32 || isCI) {
    changes.push('🍪 SESSION_SECRET generado');
    if (isCI) changes.push('  (Forzado por CI)');
  }
  if (!existingConfig.NODE_ENV) {
    changes.push('🌍 NODE_ENV establecido a "test"');
  }
  if (!existingConfig.MONGODB_URI) {
    changes.push('🗄️  MONGODB_URI configurado para testing');
  }

  if (changes.length > 0) {
    colorLog('\n📝 Cambios realizados:', 'yellow');
    changes.forEach((change) => {
      colorLog(`  ${change}`, 'green');
    });
  }

  colorLog('\n💡 Consejos:', 'yellow');
  colorLog('  🔐 Los secrets generados son seguros para testing', 'blue');
  colorLog('  🚀 Ahora puedes ejecutar: npm run performance:test', 'blue');
  colorLog('  ⚙️  Para producción, usa: npm run security:generate-secrets', 'blue');

  // Verificar que la configuración se puede cargar
  try {
    const configPath = path.join(projectRoot, 'src/config/environment.mjs');
    const configModule = await import(`file:///${configPath.replace(/\\/g, '/')}?t=${Date.now()}`);

    // Establecer variables de entorno temporalmente
    const originalEnv = { ...process.env };

    // Leer y aplicar la nueva configuración
    const envContent = fs.readFileSync(configEnvPath, 'utf8');
    const envLines = envContent.split('\n');

    for (const line of envLines) {
      if (line.includes('=') && !line.startsWith('#') && line.trim()) {
        const [key, ...valueParts] = line.split('=');
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }

    configModule.configLoader();

    // Restaurar entorno original
    process.env = originalEnv;

    colorLog('\n✅ Configuración verificada correctamente', 'green');
  } catch (error) {
    colorLog(`\n⚠️  Advertencia: Error verificando configuración: ${error.message}`, 'yellow');
    colorLog('   La configuración fue creada pero puede requerir ajustes', 'yellow');
  }

  colorLog('\n🔧 ======================================\n', 'cyan');
}

// Ejecutar
createTestConfig().catch((error) => {
  console.error('❌ Error generando configuración:', error);
  process.exit(1);
});
