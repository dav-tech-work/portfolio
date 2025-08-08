#!/usr/bin/env node

/**
 * Script de Utilidades Rápido
 * @description Versión ligera para verificaciones rápidas de utilidades
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
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

// Configuración
const config = {
  projectRoot: path.join(__dirname, '../..'),
  eslintConfig: path.join(__dirname, '../../eslint.config.mjs'),
  packageJson: path.join(__dirname, '../../package.json'),
  prettierConfig: path.join(__dirname, '../../.prettierrc'),
};

/**
 * VERIFICACIÓN RÁPIDA DE LINT Y FORMAT
 */
async function checkLintAndFormatQuick() {
  colorLog('\n🔧 VERIFICACIÓN RÁPIDA DE LINT Y FORMAT', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar ESLint
  colorLog('\n📋 Verificando ESLint:', 'blue');
  if (fs.existsSync(config.eslintConfig)) {
    colorLog('✅ Configuración ESLint encontrada', 'green');

    try {
      await execAsync('npx eslint --version');
      colorLog('✅ ESLint disponible', 'green');
    } catch (error) {
      colorLog('❌ ESLint no disponible', 'red');
      allChecksPassed = false;
    }
  } else {
    colorLog('❌ Configuración ESLint no encontrada', 'red');
    allChecksPassed = false;
  }

  // Verificar Prettier
  colorLog('\n🎨 Verificando Prettier:', 'blue');
  if (fs.existsSync(config.prettierConfig) || fs.existsSync(config.packageJson)) {
    colorLog('✅ Configuración Prettier encontrada', 'green');

    try {
      await execAsync('npx prettier --version');
      colorLog('✅ Prettier disponible', 'green');
    } catch (error) {
      colorLog('❌ Prettier no disponible', 'red');
      allChecksPassed = false;
    }
  } else {
    colorLog('❌ Configuración Prettier no encontrada', 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE GENERATE
 */
async function checkGenerateQuick() {
  colorLog('\n🔨 VERIFICACIÓN RÁPIDA DE GENERATE', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar scripts de generación
  colorLog('\n📦 Verificando scripts de generación:', 'blue');
  const generateScripts = [
    'generate-sri.mjs',
    'generate-test-config.mjs',
    'generate-imports.mjs',
  ];

  for (const script of generateScripts) {
    const scriptPath = path.join(__dirname, script);
    if (fs.existsSync(scriptPath)) {
      colorLog(`✅ ${script} encontrado`, 'green');
    } else {
      colorLog(`❌ ${script} no encontrado`, 'red');
      allChecksPassed = false;
    }
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE SETUP
 */
async function checkSetupQuick() {
  colorLog('\n⚙️ VERIFICACIÓN RÁPIDA DE SETUP', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar scripts de setup
  colorLog('\n🔧 Verificando scripts de setup:', 'blue');
  const setupScripts = [
    'setup-pre-commit.mjs',
    'docker-setup.mjs',
  ];

  for (const script of setupScripts) {
    const scriptPath = path.join(__dirname, script);
    if (fs.existsSync(scriptPath)) {
      colorLog(`✅ ${script} encontrado`, 'green');
    } else {
      colorLog(`❌ ${script} no encontrado`, 'red');
      allChecksPassed = false;
    }
  }

  // Verificar archivos de configuración
  colorLog('\n📁 Verificando archivos de configuración:', 'blue');
  const configFiles = [
    '.gitignore',
    '.eslintrc.json',
    '.prettierrc',
    'package.json',
  ];

  for (const file of configFiles) {
    const filePath = path.join(config.projectRoot, file);
    if (fs.existsSync(filePath)) {
      colorLog(`✅ ${file} encontrado`, 'green');
    } else {
      colorLog(`❌ ${file} no encontrado`, 'red');
      allChecksPassed = false;
    }
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE DEBUG
 */
async function checkDebugQuick() {
  colorLog('\n🐛 VERIFICACIÓN RÁPIDA DE DEBUG', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar scripts de debug
  colorLog('\n🔍 Verificando scripts de debug:', 'blue');
  const debugScripts = [
    'debug-server.mjs',
  ];

  for (const script of debugScripts) {
    const scriptPath = path.join(__dirname, '../', script);
    if (fs.existsSync(scriptPath)) {
      colorLog(`✅ ${script} encontrado`, 'green');
    } else {
      colorLog(`❌ ${script} no encontrado`, 'red');
      allChecksPassed = false;
    }
  }

  // Verificar directorios de logs
  colorLog('\n📝 Verificando directorios de logs:', 'blue');
  const logDirs = [
    'logs',
    'test-results',
  ];

  for (const dir of logDirs) {
    const dirPath = path.join(config.projectRoot, dir);
    if (fs.existsSync(dirPath)) {
      colorLog(`✅ ${dir} encontrado`, 'green');
    } else {
      colorLog(`⚠️ ${dir} no encontrado`, 'yellow');
    }
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE CLEAN
 */
async function checkCleanQuick() {
  colorLog('\n🧹 VERIFICACIÓN RÁPIDA DE CLEAN', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar scripts de limpieza
  colorLog('\n🧽 Verificando scripts de limpieza:', 'blue');
  const cleanScripts = [
    'clean-css-files.mjs',
  ];

  for (const script of cleanScripts) {
    const scriptPath = path.join(__dirname, '../', script);
    if (fs.existsSync(scriptPath)) {
      colorLog(`✅ ${script} encontrado`, 'green');
    } else {
      colorLog(`❌ ${script} no encontrado`, 'red');
      allChecksPassed = false;
    }
  }

  // Verificar archivos CSS
  colorLog('\n🎨 Verificando archivos CSS:', 'blue');
  const cssDirs = [
    'public/assets/css',
    'data/public/assets/css',
  ];

  for (const dir of cssDirs) {
    const dirPath = path.join(config.projectRoot, dir);
    if (fs.existsSync(dirPath)) {
      colorLog(`✅ ${dir} encontrado`, 'green');
    } else {
      colorLog(`⚠️ ${dir} no encontrado`, 'yellow');
    }
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE CHECK
 */
async function checkCheckQuick() {
  colorLog('\n🔍 VERIFICACIÓN RÁPIDA DE CHECK', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar scripts de verificación
  colorLog('\n✅ Verificando scripts de check:', 'blue');
  const checkScripts = [
    'check-contacto-config.mjs',
    'check-lockfile.mjs',
    'check-csp-config.mjs',
    'check-minified.mjs',
  ];

  for (const script of checkScripts) {
    const scriptPath = path.join(__dirname, '../', script);
    if (fs.existsSync(scriptPath)) {
      colorLog(`✅ ${script} encontrado`, 'green');
    } else {
      colorLog(`❌ ${script} no encontrado`, 'red');
      allChecksPassed = false;
    }
  }

  // Verificar archivos críticos
  colorLog('\n📁 Verificando archivos críticos:', 'blue');
  const criticalFiles = [
    'package-lock.json',
    'config.env',
    'app.mjs',
  ];

  for (const file of criticalFiles) {
    const filePath = path.join(config.projectRoot, file);
    if (fs.existsSync(filePath)) {
      colorLog(`✅ ${file} encontrado`, 'green');
    } else {
      colorLog(`❌ ${file} no encontrado`, 'red');
      allChecksPassed = false;
    }
  }

  return allChecksPassed;
}

/**
 * EJECUCIÓN COMPLETA DEL UTILIDADES RÁPIDO
 */
async function runQuickUtilities() {
  const startTime = Date.now();

  colorLog('\n⚡ UTILIDADES RÁPIDO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificación rápida de lint y format
  const lintOK = await checkLintAndFormatQuick();

  // 2. Verificación rápida de generate
  const generateOK = await checkGenerateQuick();

  // 3. Verificación rápida de setup
  const setupOK = await checkSetupQuick();

  // 4. Verificación rápida de debug
  const debugOK = await checkDebugQuick();

  // 5. Verificación rápida de clean
  const cleanOK = await checkCleanQuick();

  // 6. Verificación rápida de check
  const checkOK = await checkCheckQuick();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN UTILIDADES RÁPIDO', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🔧 Lint & Format: ${lintOK ? '✅ OK' : '❌ Problemas'}`, lintOK ? 'green' : 'red');
  colorLog(`🔨 Generate: ${generateOK ? '✅ OK' : '❌ Problemas'}`, generateOK ? 'green' : 'red');
  colorLog(`⚙️ Setup: ${setupOK ? '✅ OK' : '❌ Problemas'}`, setupOK ? 'green' : 'red');
  colorLog(`🐛 Debug: ${debugOK ? '✅ OK' : '❌ Problemas'}`, debugOK ? 'green' : 'red');
  colorLog(`🧹 Clean: ${cleanOK ? '✅ OK' : '❌ Problemas'}`, cleanOK ? 'green' : 'red');
  colorLog(`🔍 Check: ${checkOK ? '✅ OK' : '❌ Problemas'}`, checkOK ? 'green' : 'red');
  colorLog(`⏱️ Tiempo total: ${totalTime} segundos`, 'cyan');

  const allOK = lintOK && generateOK && setupOK && debugOK && cleanOK && checkOK;
  colorLog(`\n🎯 Estado general: ${allOK ? '✅ UTILIDADES FUNCIONANDO' : '❌ PROBLEMAS EN UTILIDADES DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ UTILIDADES RÁPIDO COMPLETADO', 'bright');
  colorLog('💡 Para verificación completa, ejecuta: node scripts/Utilidades/utilities-complete.mjs', 'blue');
}

// Ejecutar si se llama directamente
runQuickUtilities().catch(console.error);
