#!/usr/bin/env node

/**
 * Script para generar imports
 * @description Genera archivos de imports centralizados
 * @author Daniel Arribas Velazquez
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
 * Generar imports centralizados
 */
function generateImports() {
  colorLog('\n📦 GENERANDO IMPORTS CENTRALIZADOS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  const importsContent = `// Imports centralizados para el proyecto
// Este archivo se genera automáticamente

// Configuración
export { default as config } from '../config/environment.mjs';
export { cacheConfig, compressionConfig, preloadConfig } from '../config/performance.mjs';

// Middleware
export { sanitizeRequest, validateAndSanitizeEmail, validateAndSanitizeName, validateAndSanitizeMessage } from '../middleware/sanitizer-advanced.mjs';
export { strictLimiter, apiLimiter, authLimiter, staticLimiter } from '../middleware/rateLimiters.mjs';
export { notFoundHandler, errorHandler } from '../middleware/errorHandler.mjs';

// Utilidades
export { default as logger } from '../utils/logger-enhanced.mjs';
export { asyncHandler } from '../utils/asyncHandler.mjs';
export { generateId, formatDate, validateEmail } from '../utils/helpers.mjs';

// Seguridad
export { sanitizeInput, validateInput } from '../utils/seguridad/sanitize.mjs';
export { memoize } from '../utils/seguridad/memoize.mjs';

// Servicios
export { default as contactoService } from '../utils/servicios/contacto.mjs';
export { default as archivoService } from '../utils/servicios/archivo.mjs';

// Validación
export { validateConfig } from '../utils/validation/config-validator.mjs';
export { schemas } from '../utils/validation/schemas.mjs';

// Navegación
export { determinarTipo } from '../utils/navegacion/determinarTipo.mjs';
export { rutas } from '../utils/navegacion/rutas.mjs';

// Idioma
export { default as idioma } from '../utils/idioma/index.mjs';

// Optimización
export { compressResponse, minifyHTML } from '../utils/optimizacion/index.mjs';

// Auth
export { generateToken, verifyToken } from '../utils/auth/jwt-manager.mjs';

// Generador
export { generarBuscador } from '../utils/generador/generarBuscador.mjs';
`;

  // Guardar archivo de imports
  const outputPath = path.join(__dirname, '../../src/config/imports.mjs');
  fs.writeFileSync(outputPath, importsContent);

  colorLog(`✅ Imports centralizados guardados en: ${outputPath}`, 'green');

  return importsContent;
}

/**
 * Verificar imports existentes
 */
function verifyImports() {
  colorLog('\n🔍 Verificando imports existentes:', 'blue');

  const importFiles = [
    'src/config/imports.mjs',
    'src/config/environment.mjs',
    'src/config/performance.mjs',
    'src/middleware/sanitizer-advanced.mjs',
    'src/middleware/rateLimiters.mjs',
    'src/middleware/errorHandler.mjs'
  ];

  importFiles.forEach(file => {
    const filePath = path.join(__dirname, '../../', file);
    if (fs.existsSync(filePath)) {
      colorLog(`✅ ${file}`, 'green');
    } else {
      colorLog(`❌ ${file} no encontrado`, 'red');
    }
  });
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyImports();
  generateImports();
}

export { generateImports, verifyImports };
