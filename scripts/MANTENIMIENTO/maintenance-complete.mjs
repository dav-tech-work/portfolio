#!/usr/bin/env node

/**
 * Script de Mantenimiento Completo
 * @description Consolida minificación CSS, limpieza y ESLint fixes
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import postcss from 'postcss';
import cssnano from 'cssnano';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const config = {
  projectRoot: path.join(__dirname, '../..'),
  reportsDir: path.join(__dirname, '../../results/maintenance-results'),
  reportFile: 'maintenance-complete-report.json',
};

// Configuración de colores para consola
const colors = {
  reset: 'x1b[0m',
  bright: 'x1b[1m',
  red: 'x1b[31m',
  green: 'x1b[32m',
  yellow: 'x1b[33m',
  blue: 'x1b[34m',
  cyan: 'x1b[36m',
  magenta: 'x1b[35m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Archivos CSS a procesar
const CSS_FILES = [
  'data/public/assets/css/global/base.css',
  'data/public/assets/css/global/search.css',
  'data/public/assets/css/global/helpers.css',
  'data/public/assets/css/global/error-code.css',
  'data/public/assets/css/secciones/home.css',
  'data/public/assets/css/secciones/formacion.css',
  'data/public/assets/css/secciones/contacto.css',
  'data/public/assets/css/secciones/about.css',
  'data/public/assets/css/secciones/proyectos.css',
  'data/public/assets/css/secciones/homelab.css',
  'data/public/assets/css/secciones/privacidad.css',
  'data/public/assets/css/secciones/seguridad.css',
  'data/public/assets/css/secciones/code.css',
  'data/public/assets/css/secciones/error.css',
  'data/public/assets/css/secciones/construccion.css',
];

/**
 * MINIFICACIÓN CSS
 */
async function minifyCSS(inputPath, outputPath) {
  try {
    const css = fs.readFileSync(inputPath, 'utf8');
    const result = await postcss([cssnano]).process(css, { from: inputPath });

    // Crear directorio si no existe
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, result.css);

    const originalSize = (fs.statSync(inputPath).size / 1024).toFixed(1);
    const minifiedSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
    const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    colorLog(`✅ Completado: ${path.relative('.', outputPath)}`, 'green');
    colorLog(`   📊 Tamaño original: ${originalSize}KB`, 'blue');
    colorLog(`   📊 Tamaño minificado: ${minifiedSize}KB`, 'blue');
    colorLog(`   📊 Reducción: ${reduction}%`, 'blue');

    return true;
  } catch (error) {
    colorLog(`❌ Error minificando ${inputPath}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * MINIFICAR TODOS LOS CSS
 */
async function minifyAllCSS() {
  colorLog('n📝 MINIFICACIÓN DE ARCHIVOS CSS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  let successCount = 0;

  for (const cssFile of CSS_FILES) {
    if (fs.existsSync(cssFile)) {
      colorLog(`📝 Minificando: ${cssFile}`, 'cyan');

      const relativePath = path.relative('data/public/assets/css', cssFile);
      const outputPath = path.join('public/assets/css', relativePath.replace('.css', '.min.css'));

      const success = await minifyCSS(cssFile, outputPath);
      if (success) successCount++;
    } else {
      colorLog(`⚠️  Archivo no encontrado: ${cssFile}`, 'yellow');
    }
  }

  colorLog(`n🎉 Minificación completada: ${successCount}/${CSS_FILES.length} archivos`, 'green');
  return successCount;
}

/**
 * LIMPIEZA DE ARCHIVOS CSS
 */
function cleanCSSFiles() {
  colorLog('n🧹 LIMPIEZA DE ARCHIVOS CSS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const cssDir = 'public/assets/css';
  let deletedCount = 0;

  function cleanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        cleanDirectory(itemPath);
      } else if (item.endsWith('.min.css') || item.endsWith('.optimized.css')) {
        try {
          fs.unlinkSync(itemPath);
          colorLog(`🗑️ Eliminado: ${item}`, 'yellow');
          deletedCount++;
        } catch (error) {
          colorLog(`❌ Error eliminando ${item}: ${error.message}`, 'red');
        }
      }
    });
  }

  cleanDirectory(cssDir);
  colorLog(`✅ ${deletedCount} archivos CSS minificados/optimizados eliminados`, 'green');
  return deletedCount;
}

/**
 * CORRECCIÓN ESLINT
 */
function fixESLintIssues() {
  colorLog('n🔧 CORRECCIÓN ESLINT', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  // Ejecutar ESLint con --fix para correcciones automáticas seguras
  try {
    execSync('npm run lint -- --fix', { stdio: 'inherit' });
    colorLog('✅ ESLint fixes aplicados correctamente', 'green');
    return 1; // Indicar que se ejecutó
  } catch (error) {
    colorLog('⚠️ ESLint fixes no aplicados (esto es normal si no hay errores)', 'yellow');
    return 0;
  }
}

/**
 * EJECUCIÓN COMPLETA
 */
async function runCompleteMaintenance() {
  const startTime = Date.now();

  colorLog('n🚀 MANTENIMIENTO COMPLETO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Limpiar archivos CSS existentes
  const cleanedFiles = cleanCSSFiles();

  // 2. Minificar CSS
  const minifiedFiles = await minifyAllCSS();

  // 3. Corregir ESLint
  const fixedFiles = await fixESLintIssues();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('n📊 RESUMEN FINAL', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🧹 Archivos CSS eliminados: ${cleanedFiles}`, 'green');
  colorLog(`📝 Archivos CSS minificados: ${minifiedFiles}`, 'green');
  colorLog(`🔧 Archivos ESLint corregidos: ${fixedFiles}`, 'green');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  // Generar reporte
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      cleanedFiles,
      minifiedFiles,
      fixedFiles,
      totalTime: parseFloat(totalTime),
    },
    details: {
      cleanedFiles,
      minifiedFiles,
      fixedFiles,
    },
  };

  // Crear directorio si no existe
  if (!fs.existsSync(config.reportsDir)) {
    fs.mkdirSync(config.reportsDir, { recursive: true });
  }

  const reportPath = path.join(config.reportsDir, config.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  colorLog(`📄 Reporte guardado en: ${reportPath}`, 'cyan');

  colorLog('n✅ MANTENIMIENTO COMPLETO FINALIZADO', 'bright');
  colorLog('💡 Para mantenimiento rápido, ejecuta: node scripts/MANTENIMIENTO/maintenance-quick.mjs', 'blue');
}

// Ejecutar si se llama directamente
runCompleteMaintenance().catch(console.error);
