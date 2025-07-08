#!/usr/bin/env node

/**
 * Generador de imports para ES modules
 * Ayuda a mantener las rutas relativas correctas
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');

// Mapeo de imports comunes
const COMMON_IMPORTS = {
  config: 'config/index.mjs',
  middleware: 'middleware/index.mjs',
  sanitizer: 'middleware/sanitizer-advanced.mjs',
  logger: 'utils/servicios/logger.mjs',
  validation: 'utils/validation/schemas.mjs',
  security: 'utils/seguridad/sanitize.mjs',
  asyncHandler: 'utils/asyncHandler.mjs',
};

/**
 * Genera la ruta relativa desde un archivo origen a un archivo destino
 */
function generateRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  const relativePath = path.relative(fromDir, path.join(SRC_DIR, toFile));
  return relativePath.replace(/\\/g, '/');
}

/**
 * Genera todos los imports para un archivo específico
 */
function generateImportsForFile(filePath) {
  const imports = {};

  for (const [name, targetPath] of Object.entries(COMMON_IMPORTS)) {
    imports[name] = generateRelativePath(filePath, targetPath);
  }

  return imports;
}

/**
 * Muestra los imports generados para un archivo
 */
function showImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`);
    return;
  }

  const imports = generateImportsForFile(filePath);

  console.log(`\n📁 Imports para: ${path.relative(process.cwd(), filePath)}`);
  console.log('='.repeat(50));

  for (const [name, importPath] of Object.entries(imports)) {
    console.log(`${name.padEnd(15)} → ${importPath}`);
  }
}

// Uso del script
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('🔧 Generador de imports para ES modules');
  console.log('\nUso:');
  console.log('  node scripts/generate-imports.mjs <archivo>');
  console.log('\nEjemplos:');
  console.log('  node scripts/generate-imports.mjs src/routes/auth.mjs');
  console.log('  node scripts/generate-imports.mjs src/utils/servicios/logger.mjs');
} else {
  const filePath = path.resolve(args[0]);
  showImports(filePath);
}

export { generateRelativePath, generateImportsForFile };
