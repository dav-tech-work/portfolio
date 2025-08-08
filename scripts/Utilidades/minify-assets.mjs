#!/usr/bin/env node

/**
 * Script de Minificación de Assets
 * @description Minifica archivos CSS y JS para producción
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import cssnano from 'cssnano';
import { minify as terserMinify } from 'terser';

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
  magenta: '\x1b[35m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuración
const config = {
  projectRoot: path.join(__dirname, '../..'),
  sourceDir: path.join(__dirname, '../../data/public/assets'),
  targetDir: path.join(__dirname, '../../public/assets'),
};

/**
 * Minificar archivo CSS usando postcss + cssnano (sin npx)
 */
async function minifyCSS(sourcePath, targetPath) {
  try {
    const css = fs.readFileSync(sourcePath, 'utf8');
    const result = await postcss([cssnano]).process(css, { from: sourcePath });
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetPath, result.css);
    colorLog(`✅ CSS minificado: ${path.basename(sourcePath)}`, 'green');
    return true;
  } catch (error) {
    colorLog(`❌ Error minificando CSS ${path.basename(sourcePath)}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Minificar archivo JS usando API de terser (sin npx)
 */
async function minifyJS(sourcePath, targetPath) {
  try {
    const code = fs.readFileSync(sourcePath, 'utf8');
    const result = await terserMinify(code, {
      compress: true,
      mangle: true,
      format: { ascii_only: true },
    });
    if (result.error) throw result.error;
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetPath, result.code || '');
    colorLog(`✅ JS minificado: ${path.basename(sourcePath)}`, 'green');
    return true;
  } catch (error) {
    colorLog(`❌ Error minificando JS ${path.basename(sourcePath)}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Encontrar todos los archivos CSS en un directorio
 */
function findCSSFiles(dir) {
  const files = [];

  function scanDirectory(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.css') && !item.endsWith('.min.css')) {
        files.push(fullPath);
      }
    }
  }

  scanDirectory(dir);
  return files;
}

/**
 * Encontrar todos los archivos JS en un directorio
 */
function findJSFiles(dir) {
  const files = [];

  function scanDirectory(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.js') && !item.endsWith('.min.js')) {
        files.push(fullPath);
      }
    }
  }

  scanDirectory(dir);
  return files;
}

/**
 * Crear directorio de destino si no existe
 */
function ensureTargetDir(sourcePath, targetDir) {
  const relativePath = path.relative(config.sourceDir, sourcePath);
  const targetPath = path.join(targetDir, relativePath);
  const targetFileDir = path.dirname(targetPath);

  if (!fs.existsSync(targetFileDir)) {
    fs.mkdirSync(targetFileDir, { recursive: true });
  }

  return targetPath.replace(/\.(css|js)$/, '.min.$1');
}

/**
 * Minificar todos los assets
 */
async function minifyAllAssets() {
  colorLog('\n🔧 MINIFICACIÓN DE ASSETS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  let successCount = 0;
  let totalCount = 0;

  // Minificar CSS
  colorLog('\n📁 Minificando archivos CSS:', 'blue');
  const cssFiles = findCSSFiles(config.sourceDir);

  for (const cssFile of cssFiles) {
    totalCount++;
    const targetPath = ensureTargetDir(cssFile, config.targetDir);
    const success = await minifyCSS(cssFile, targetPath);
    if (success) successCount++;
  }

  // Minificar JS
  colorLog('\n📁 Minificando archivos JavaScript:', 'blue');
  const jsFiles = findJSFiles(config.sourceDir);

  for (const jsFile of jsFiles) {
    totalCount++;
    const targetPath = ensureTargetDir(jsFile, config.targetDir);
    const success = await minifyJS(jsFile, targetPath);
    if (success) successCount++;
  }

  // Resumen
  colorLog('\n📊 Resumen de minificación:', 'cyan');
  colorLog(`Total de archivos procesados: ${totalCount}`, 'yellow');
  colorLog(`Archivos minificados exitosamente: ${successCount}`, 'green');
  colorLog(`Archivos con errores: ${totalCount - successCount}`, 'red');

  if (successCount === totalCount) {
    colorLog('\n🎉 ¡Minificación completada exitosamente!', 'green');
  } else {
    colorLog('\n⚠️ Algunos archivos no se pudieron minificar', 'yellow');
  }
}

// Ejecutar minificación
minifyAllAssets().catch(error => {
  colorLog(`\n❌ Error en la minificación: ${error.message}`, 'red');
  process.exit(1);
});
