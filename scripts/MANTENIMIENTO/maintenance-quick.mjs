#!/usr/bin/env node

/**
 * Script de Mantenimiento Rápido
 * @description Versión ligera para verificaciones rápidas
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de colores para consola
const colors = {
  reset: 'x1b[0m',
  bright: 'x1b[1m',
  red: 'x1b[31m',
  green: 'x1b[32m',
  yellow: 'x1b[33m',
  blue: 'x1b[34m',
  cyan: 'x1b[36m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * VERIFICACIÓN RÁPIDA DE ESTRUCTURA
 */
function checkFileStructure() {
  colorLog('n🔍 VERIFICACIÓN RÁPIDA DE ESTRUCTURA', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  const criticalDirs = ['src', 'public', 'views', 'test'];
  const criticalFiles = [
    'app.mjs',
    'package.json',
    'config.env',
    'data/public/assets/css/global/base.css',
  ];

  let allGood = true;

  // Verificar directorios críticos
  criticalDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      colorLog(`✅ Directorio: ${dir}`, 'green');
    } else {
      colorLog(`❌ Directorio faltante: ${dir}`, 'red');
      allGood = false;
    }
  });

  // Verificar archivos críticos
  criticalFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      colorLog(`✅ Archivo: ${file}`, 'green');
    } else {
      colorLog(`⚠️  Archivo faltante: ${file}`, 'yellow');
    }
  });

  return allGood;
}

/**
 * VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN
 */
function checkBasicConfig() {
  colorLog('n⚙️ VERIFICACIÓN DE CONFIGURACIÓN BÁSICA', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  const configFile = 'config.env';
  const packageFile = 'package.json';

  // Verificar config.env
  if (fs.existsSync(configFile)) {
    const config = fs.readFileSync(configFile, 'utf8');
    const hasSecrets = config.includes('SESSION_SECRET') && config.includes('JWT_SECRET');

    if (hasSecrets) {
      colorLog('✅ Configuración de secretos encontrada', 'green');
    } else {
      colorLog('⚠️  Secretos críticos faltantes en config.env', 'yellow');
    }
  } else {
    colorLog('❌ Archivo config.env no encontrado', 'red');
  }

  // Verificar package.json
  if (fs.existsSync(packageFile)) {
    const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const hasScripts = packageData.scripts && Object.keys(packageData.scripts).length > 0;

    if (hasScripts) {
      colorLog('✅ Scripts de package.json encontrados', 'green');
    } else {
      colorLog('⚠️  Scripts faltantes en package.json', 'yellow');
    }
  } else {
    colorLog('❌ Archivo package.json no encontrado', 'red');
  }
}

/**
 * VERIFICACIÓN RÁPIDA DE ARCHIVOS CSS
 */
function checkCSSFiles() {
  colorLog('n🎨 VERIFICACIÓN RÁPIDA DE ARCHIVOS CSS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  const cssDir = 'data/public/assets/css';
  let totalFiles = 0;
  let minifiedFiles = 0;

  function countFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        countFiles(itemPath);
      } else if (item.endsWith('.css')) {
        totalFiles++;

        // Verificar si existe archivo minificado
        const minifiedPath = itemPath.replace('data/public/assets/css', 'public/assets/css').replace('.css', '.min.css');
        if (fs.existsSync(minifiedPath)) {
          minifiedFiles++;
        }
      }
    });
  }

  countFiles(cssDir);

  colorLog(`📊 Archivos CSS originales: ${totalFiles}`, 'blue');
  colorLog(`📊 Archivos CSS minificados: ${minifiedFiles}`, 'blue');

  if (minifiedFiles === totalFiles) {
    colorLog('✅ Todos los archivos CSS están minificados', 'green');
  } else {
    colorLog('⚠️  Algunos archivos CSS no están minificados', 'yellow');
  }
}

/**
 * LIMPIEZA RÁPIDA DE ARCHIVOS TEMPORALES
 */
function quickCleanup() {
  colorLog('n🧹 LIMPIEZA RÁPIDA', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  const tempFiles = [
    '*.tmp',
    '*.log',
    'test-results/temp',
  ];

  let cleanedCount = 0;

  tempFiles.forEach((pattern) => {
    try {
      if (pattern.includes('*')) {
        // Buscar archivos con patrones
        const dir = path.dirname(pattern);
        const ext = path.extname(pattern);

        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach((file) => {
            if (file.endsWith(ext.replace('*', ''))) {
              const filePath = path.join(dir, file);
              fs.unlinkSync(filePath);
              colorLog(`🗑️ Eliminado: ${filePath}`, 'yellow');
              cleanedCount++;
            }
          });
        }
      } else if (fs.existsSync(pattern)) {
        // Eliminar directorio/archivo específico
        if (fs.statSync(pattern).isDirectory()) {
          fs.rmSync(pattern, { recursive: true, force: true });
        } else {
          fs.unlinkSync(pattern);
        }
        colorLog(`🗑️ Eliminado: ${pattern}`, 'yellow');
        cleanedCount++;
      }
    } catch (error) {
      // Ignorar errores en limpieza
    }
  });

  colorLog(`✅ ${cleanedCount} archivos temporales eliminados`, 'green');
}

/**
 * EJECUCIÓN COMPLETA DEL MANTENIMIENTO RÁPIDO
 */
function runQuickMaintenance() {
  const startTime = Date.now();

  colorLog('n⚡ MANTENIMIENTO RÁPIDO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificación de estructura
  const structureOK = checkFileStructure();

  // 2. Verificación de configuración
  checkBasicConfig();

  // 3. Verificación de archivos CSS
  checkCSSFiles();

  // 4. Limpieza rápida
  quickCleanup();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('n📊 RESUMEN MANTENIMIENTO RÁPIDO', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🔍 Estructura del proyecto: ${structureOK ? '✅ OK' : '❌ Problemas'}`, structureOK ? 'green' : 'red');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  colorLog('n✅ MANTENIMIENTO RÁPIDO COMPLETADO', 'bright');
  colorLog('💡 Para mantenimiento completo, ejecuta: node scripts/maintenance-complete.mjs', 'blue');
}

// Ejecutar si se llama directamente
runQuickMaintenance();
