#!/usr/bin/env node

/**
 * Script de Responsive Design Rápido
 * @description Versión ligera para verificaciones rápidas de responsive design
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

// Archivos CSS críticos para verificación rápida
const CRITICAL_CSS_FILES = [
  'data/public/assets/css/global/base.css',
  'data/public/assets/css/secciones/home.css',
  'data/public/assets/css/secciones/about.css',
];

/**
 * VERIFICACIÓN RÁPIDA DE ARCHIVOS CSS
 */
function checkCSSFiles() {
  colorLog('n🔍 VERIFICACIÓN RÁPIDA DE ARCHIVOS CSS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allGood = true;

  CRITICAL_CSS_FILES.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasResponsive = content.includes('clamp(') || content.includes('min(');
      const hasMediaQueries = content.includes('@media');
      const hasVariables = content.includes('--responsive');

      if (hasResponsive || hasMediaQueries || hasVariables) {
        colorLog(`✅ ${path.basename(filePath)} - Responsive detectado`, 'green');
      } else {
        colorLog(`⚠️  ${path.basename(filePath)} - Sin responsive`, 'yellow');
        allGood = false;
      }
    } else {
      colorLog(`❌ ${path.basename(filePath)} - No encontrado`, 'red');
      allGood = false;
    }
  });

  return allGood;
}

/**
 * VERIFICAR BREAKPOINTS CRÍTICOS
 */
function checkCriticalBreakpoints() {
  colorLog('n📱 VERIFICACIÓN DE BREAKPOINTS CRÍTICOS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  const criticalBreakpoints = ['608px', '768px', '1024px'];
  let foundBreakpoints = 0;

  CRITICAL_CSS_FILES.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      criticalBreakpoints.forEach((breakpoint) => {
        if (content.includes(breakpoint)) {
          colorLog(`✅ ${path.basename(filePath)} - Breakpoint ${breakpoint} encontrado`, 'green');
          foundBreakpoints++;
        }
      });
    }
  });

  colorLog(`📊 Breakpoints críticos encontrados: ${foundBreakpoints}`, 'blue');
  return foundBreakpoints > 0;
}

/**
 * VERIFICAR GRIDS RESPONSIVE
 */
function checkResponsiveGrids() {
  colorLog('n🔲 VERIFICACIÓN DE GRIDS RESPONSIVE', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let responsiveGrids = 0;
  let totalGrids = 0;

  CRITICAL_CSS_FILES.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Buscar grids
      const gridMatches = content.match(/grid-template-columns:[^;]+/g) || [];
      totalGrids += gridMatches.length;

      // Verificar si son responsive
      gridMatches.forEach((grid) => {
        if (grid.includes('auto-fit') || grid.includes('clamp') || grid.includes('minmax')) {
          responsiveGrids++;
        }
      });
    }
  });

  if (totalGrids > 0) {
    const percentage = ((responsiveGrids / totalGrids) * 100).toFixed(1);
    colorLog(`📊 Grids responsive: ${responsiveGrids}/${totalGrids} (${percentage}%)`, 'blue');

    if (responsiveGrids === totalGrids) {
      colorLog('✅ Todos los grids son responsive', 'green');
      return true;
    } else {
      colorLog('⚠️  Algunos grids no son responsive', 'yellow');
      return false;
    }
  } else {
    colorLog('ℹ️  No se encontraron grids', 'blue');
    return true;
  }
}

/**
 * VERIFICAR VARIABLES CSS
 */
function checkCSSVariables() {
  colorLog('n🎨 VERIFICACIÓN DE VARIABLES CSS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let filesWithVariables = 0;
  const requiredVariables = ['--responsive-padding', '--responsive-font-size', '--responsive-title-size'];

  CRITICAL_CSS_FILES.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasVariables = requiredVariables.some(variable => content.includes(variable));

      if (hasVariables) {
        colorLog(`✅ ${path.basename(filePath)} - Variables CSS encontradas`, 'green');
        filesWithVariables++;
      } else {
        colorLog(`⚠️  ${path.basename(filePath)} - Variables CSS faltantes`, 'yellow');
      }
    }
  });

  colorLog(`📊 Archivos con variables CSS: ${filesWithVariables}/${CRITICAL_CSS_FILES.length}`, 'blue');
  return filesWithVariables === CRITICAL_CSS_FILES.length;
}

/**
 * VERIFICAR ARCHIVOS MINIFICADOS
 */
function checkMinifiedFiles() {
  colorLog('n📦 VERIFICACIÓN DE ARCHIVOS MINIFICADOS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let minifiedCount = 0;
  let totalFiles = 0;

  CRITICAL_CSS_FILES.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      totalFiles++;

      // Verificar si existe archivo minificado
      const minifiedPath = filePath.replace('data/public/assets/css', 'public/assets/css').replace('.css', '.min.css');
      if (fs.existsSync(minifiedPath)) {
        colorLog(`✅ ${path.basename(filePath)} - Minificado encontrado`, 'green');
        minifiedCount++;
      } else {
        colorLog(`⚠️  ${path.basename(filePath)} - Minificado faltante`, 'yellow');
      }
    }
  });

  colorLog(`📊 Archivos minificados: ${minifiedCount}/${totalFiles}`, 'blue');
  return minifiedCount === totalFiles;
}

/**
 * EJECUCIÓN COMPLETA DEL RESPONSIVE RÁPIDO
 */
function runQuickResponsiveDesign() {
  const startTime = Date.now();

  colorLog('n⚡ RESPONSIVE DESIGN RÁPIDO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificar archivos CSS
  const filesOK = checkCSSFiles();

  // 2. Verificar breakpoints críticos
  const breakpointsOK = checkCriticalBreakpoints();

  // 3. Verificar grids responsive
  const gridsOK = checkResponsiveGrids();

  // 4. Verificar variables CSS
  const variablesOK = checkCSSVariables();

  // 5. Verificar archivos minificados
  const minifiedOK = checkMinifiedFiles();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('n📊 RESUMEN RESPONSIVE RÁPIDO', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🔍 Archivos CSS: ${filesOK ? '✅ OK' : '❌ Problemas'}`, filesOK ? 'green' : 'red');
  colorLog(`📱 Breakpoints: ${breakpointsOK ? '✅ OK' : '❌ Problemas'}`, breakpointsOK ? 'green' : 'red');
  colorLog(`🔲 Grids responsive: ${gridsOK ? '✅ OK' : '❌ Problemas'}`, gridsOK ? 'green' : 'red');
  colorLog(`🎨 Variables CSS: ${variablesOK ? '✅ OK' : '❌ Problemas'}`, variablesOK ? 'green' : 'red');
  colorLog(`📦 Archivos minificados: ${minifiedOK ? '✅ OK' : '❌ Problemas'}`, minifiedOK ? 'green' : 'red');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const allOK = filesOK && breakpointsOK && gridsOK && variablesOK && minifiedOK;
  colorLog(`n🎯 Estado general: ${allOK ? '✅ TODO OK' : '⚠️  PROBLEMAS DETECTADOS'}`, allOK ? 'green' : 'yellow');

  colorLog('n✅ RESPONSIVE DESIGN RÁPIDO COMPLETADO', 'bright');
  colorLog('💡 Para responsive completo, ejecuta: node scripts/responsive-complete.mjs', 'blue');
}

// Ejecutar si se llama directamente
runQuickResponsiveDesign();
