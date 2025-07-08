/**
 * Sistema de imports centralizado para ES modules
 * Facilita el mantenimiento de rutas relativas
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas base calculadas dinámicamente
export const PATHS = {
  ROOT: path.resolve(__dirname, '../../'),
  SRC: path.resolve(__dirname, '../'),
  CONFIG: __dirname,
  MIDDLEWARE: path.resolve(__dirname, '../middleware'),
  ROUTES: path.resolve(__dirname, '../routes'),
  UTILS: path.resolve(__dirname, '../utils'),
  SERVICES: path.resolve(__dirname, '../utils/servicios'),
  SECURITY: path.resolve(__dirname, '../utils/seguridad'),
  VALIDATION: path.resolve(__dirname, '../utils/validation'),
};

// Función helper para crear imports relativos
export function createImport(fromPath, toPath) {
  return path.relative(fromPath, toPath).replace(/\\/g, '/');
}

// Función para obtener la ruta relativa desde un archivo específico
export function getRelativePath(fromFile, toPath) {
  const fromDir = path.dirname(fromFile);
  return path.relative(fromDir, toPath).replace(/\\/g, '/');
}

// Imports predefinidos (rutas relativas desde src/)
export const IMPORTS = {
  CONFIG: '../../config/index.mjs',
  MIDDLEWARE: '../middleware/index.mjs',
  SANITIZER: '../middleware/sanitizer-advanced.mjs',
  LOGGER: '../utils/servicios/logger.mjs',
  VALIDATION: '../utils/validation/schemas.mjs',
  SECURITY: '../utils/seguridad/sanitize.mjs',
  ASYNC_HANDLER: '../utils/asyncHandler.mjs',
};

// Función para obtener la ruta correcta según el archivo que la solicita
export function getImportPath(fromFile, importName) {
  const fromDir = path.dirname(fromFile);

  switch (importName) {
    case 'config':
      return path.relative(fromDir, PATHS.CONFIG + '/index.mjs').replace(/\\/g, '/');
    case 'middleware':
      return path.relative(fromDir, PATHS.MIDDLEWARE + '/index.mjs').replace(/\\/g, '/');
    case 'sanitizer':
      return path
        .relative(fromDir, PATHS.MIDDLEWARE + '/sanitizer-advanced.mjs')
        .replace(/\\/g, '/');
    case 'logger':
      return path.relative(fromDir, PATHS.SERVICES + '/logger.mjs').replace(/\\/g, '/');
    case 'validation':
      return path.relative(fromDir, PATHS.VALIDATION + '/schemas.mjs').replace(/\\/g, '/');
    case 'security':
      return path.relative(fromDir, PATHS.SECURITY + '/sanitize.mjs').replace(/\\/g, '/');
    case 'asyncHandler':
      return path.relative(fromDir, PATHS.UTILS + '/asyncHandler.mjs').replace(/\\/g, '/');
    default:
      throw new Error(`Import no reconocido: ${importName}`);
  }
}
