#!/usr/bin/env node

/**
 * Script de Rendimiento Rápido
 * @description Versión ligera para verificaciones rápidas de rendimiento
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
 * VERIFICACIÓN RÁPIDA DE JAVASCRIPT
 */
function checkJavaScriptQuick() {
  colorLog('\n🔧 VERIFICACIÓN RÁPIDA DE JAVASCRIPT', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos JavaScript minificados
  colorLog('\n📁 Verificando archivos JavaScript:', 'blue');
  const jsDir = path.join(__dirname, '../../public/assets/js');

  if (fs.existsSync(jsDir)) {
    const jsFiles = [];
    const minJsFiles = [];

    function scanJSFiles(dir) {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          scanJSFiles(filePath);
        } else if (file.endsWith('.js')) {
          if (file.endsWith('.min.js')) {
            minJsFiles.push(filePath);
          } else {
            jsFiles.push(filePath);
          }
        }
      });
    }

    scanJSFiles(jsDir);

    colorLog(`📁 Encontrados ${jsFiles.length} archivos JavaScript originales`, 'blue');
    colorLog(`📁 Encontrados ${minJsFiles.length} archivos JavaScript minificados`, 'blue');

    // Verificar archivos críticos minificados
    const criticalJsFiles = [
      'contacto.min.js',
      'highlight-init.min.js',
      'navegacion/navegacion.min.js',
      'navegacion/pageTransitions.min.js'
    ];

    criticalJsFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      if (fs.existsSync(filePath)) {
        colorLog(`✅ ${file} encontrado`, 'green');
      } else {
        colorLog(`❌ ${file} faltante`, 'red');
        allChecksPassed = false;
      }
    });
  } else {
    colorLog('❌ Directorio JavaScript no encontrado', 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE CSS
 */
function checkCSSQuick() {
  colorLog('\n🎨 VERIFICACIÓN RÁPIDA DE CSS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos CSS minificados
  colorLog('\n📁 Verificando archivos CSS:', 'blue');
  const cssDir = path.join(__dirname, '../../public/assets/css');

  if (fs.existsSync(cssDir)) {
    const cssFiles = [];
    const minCssFiles = [];

    function scanCSSFiles(dir) {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          scanCSSFiles(filePath);
        } else if (file.endsWith('.css')) {
          if (file.endsWith('.min.css')) {
            minCssFiles.push(filePath);
          } else {
            cssFiles.push(filePath);
          }
        }
      });
    }

    scanCSSFiles(cssDir);

    colorLog(`📁 Encontrados ${cssFiles.length} archivos CSS originales`, 'blue');
    colorLog(`📁 Encontrados ${minCssFiles.length} archivos CSS minificados`, 'blue');

    // Verificar archivos críticos minificados
    const criticalCssFiles = [
      'global/base.min.css',
      'global/helpers.min.css',
      'global/error-code.min.css'
    ];

    criticalCssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      if (fs.existsSync(filePath)) {
        colorLog(`✅ ${file} encontrado`, 'green');
      } else {
        colorLog(`❌ ${file} faltante`, 'red');
        allChecksPassed = false;
      }
    });
  } else {
    colorLog('❌ Directorio CSS no encontrado', 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE LIGHTHOUSE
 */
async function checkLighthouseQuick() {
  colorLog('\n🎯 VERIFICACIÓN RÁPIDA DE LIGHTHOUSE', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar si lighthouse está disponible
  colorLog('\n🔍 Verificando Lighthouse:', 'blue');
  try {
    const { execSync } = await import('child_process');
    execSync('npx lighthouse --version', { stdio: 'ignore' });
    colorLog('✅ Lighthouse disponible', 'green');
  } catch (error) {
    colorLog('⚠️ Lighthouse no disponible, usando análisis básico', 'yellow');
  }

  // Verificar scripts de optimización
  colorLog('\n📜 Verificando scripts de optimización:', 'blue');
  const optimizationScripts = [
    'scripts/Rendimiento/performance-complete.mjs',
    'scripts/Rendimiento/performance-quick.mjs',
    'scripts/minify-css.mjs',
  ];

  optimizationScripts.forEach(script => {
    const scriptPath = path.join(__dirname, '../..', script);
    if (fs.existsSync(scriptPath)) {
      colorLog(`✅ ${script}`, 'green');
    } else {
      colorLog(`⚠️ ${script} no encontrado`, 'yellow');
    }
  });

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE ARCHIVOS DUPLICADOS
 */
function checkDuplicateFilesQuick() {
  colorLog('\n🧹 VERIFICACIÓN RÁPIDA DE ARCHIVOS DUPLICADOS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos duplicados en CSS
  colorLog('\n📁 Verificando archivos duplicados:', 'blue');
  const cssDir = path.join(__dirname, '../../public/assets/css');

  if (fs.existsSync(cssDir)) {
    let duplicateCount = 0;

    function checkDuplicates(dir) {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          checkDuplicates(filePath);
        } else if (file.endsWith('.css')) {
          const baseName = path.basename(file, '.css');
          const parts = baseName.split('.');

          if (parts.length > 2) {
            const optimizedCount = parts.filter((part) => part === 'optimized').length;
            if (optimizedCount > 1) {
              colorLog(`⚠️ Archivo duplicado detectado: ${file}`, 'yellow');
              duplicateCount++;
            }
          }
        }
      });
    }

    checkDuplicates(cssDir);

    if (duplicateCount === 0) {
      colorLog('✅ No se encontraron archivos duplicados', 'green');
    } else {
      colorLog(`⚠️ Se encontraron ${duplicateCount} archivos duplicados`, 'yellow');
      allChecksPassed = false;
    }
  } else {
    colorLog('❌ Directorio CSS no encontrado', 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * EJECUCIÓN COMPLETA DEL RENDIMIENTO RÁPIDO
 */
async function runQuickPerformance() {
  const startTime = Date.now();

  colorLog('\n⚡ RENDIMIENTO RÁPIDO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificación de JavaScript
  const jsOK = checkJavaScriptQuick();

  // 2. Verificación de CSS
  const cssOK = checkCSSQuick();

  // 3. Verificación de Lighthouse
  const lighthouseOK = await checkLighthouseQuick();

  // 4. Verificación de archivos duplicados
  const duplicatesOK = checkDuplicateFilesQuick();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN RENDIMIENTO RÁPIDO', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🔧 JavaScript: ${jsOK ? '✅ OK' : '❌ Problemas'}`, jsOK ? 'green' : 'red');
  colorLog(`🎨 CSS: ${cssOK ? '✅ OK' : '❌ Problemas'}`, cssOK ? 'green' : 'red');
  colorLog(`🎯 Lighthouse: ${lighthouseOK ? '✅ OK' : '❌ Problemas'}`, lighthouseOK ? 'green' : 'red');
  colorLog(`🧹 Archivos duplicados: ${duplicatesOK ? '✅ OK' : '❌ Problemas'}`, duplicatesOK ? 'green' : 'red');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const allOK = jsOK && cssOK && lighthouseOK && duplicatesOK;
  colorLog(`\n🎯 Estado general: ${allOK ? '✅ TODO OK' : '❌ PROBLEMAS DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ RENDIMIENTO RÁPIDO COMPLETADO', 'bright');
  colorLog('💡 Para rendimiento completo, ejecuta: node scripts/Rendimiento/performance-complete.mjs', 'blue');
}

// Ejecutar si se llama directamente
runQuickPerformance().catch(console.error);
