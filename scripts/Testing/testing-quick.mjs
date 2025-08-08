#!/usr/bin/env node

/**
 * Script de Testing Rápido
 * @description Versión ligera para verificaciones rápidas de testing
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
 * TESTING RÁPIDO DE ESTRUCTURA
 */
function testStructureQuick() {
  colorLog('\n📁 TESTING RÁPIDO DE ESTRUCTURA', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar directorios críticos
  colorLog('\n📁 Verificando directorios críticos:', 'blue');
  const criticalDirs = ['src', 'public', 'views', 'test', 'scripts'];

  for (const dir of criticalDirs) {
    if (fs.existsSync(dir)) {
      colorLog(`✅ Directorio ${dir}`, 'green');
    } else {
      colorLog(`❌ Directorio ${dir} faltante`, 'red');
      allChecksPassed = false;
    }
  }

  // Verificar archivos críticos
  colorLog('\n📄 Verificando archivos críticos:', 'blue');
  const criticalFiles = ['package.json', 'app.mjs', 'config.env'];

  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      colorLog(`✅ Archivo ${file}`, 'green');
    } else {
      colorLog(`❌ Archivo ${file} faltante`, 'red');
      allChecksPassed = false;
    }
  }

  return allChecksPassed;
}

/**
 * TESTING RÁPIDO DE DEPENDENCIAS
 */
function testDependenciesQuick() {
  colorLog('\n📦 TESTING RÁPIDO DE DEPENDENCIAS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos de dependencias
  colorLog('\n📄 Verificando archivos de dependencias:', 'blue');
  if (fs.existsSync('package-lock.json')) {
    colorLog('✅ package-lock.json encontrado', 'green');
  } else {
    colorLog('⚠️  package-lock.json faltante', 'yellow');
  }

  if (fs.existsSync('node_modules')) {
    colorLog('✅ node_modules instalado', 'green');
  } else {
    colorLog('❌ node_modules no instalado', 'red');
    allChecksPassed = false;
  }

  // Verificar dependencias críticas
  colorLog('\n🔧 Verificando dependencias críticas:', 'blue');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const criticalDeps = ['express', 'ejs', 'dotenv'];

    for (const dep of criticalDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        colorLog(`✅ Dependencia ${dep}`, 'green');
      } else {
        colorLog(`❌ Dependencia ${dep} faltante`, 'red');
        allChecksPassed = false;
      }
    }
  } catch (error) {
    colorLog(`❌ Error verificando dependencias: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * TESTING RÁPIDO DE CONFIGURACIÓN
 */
function testConfigQuick() {
  colorLog('\n⚙️ TESTING RÁPIDO DE CONFIGURACIÓN', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar configuración básica
  colorLog('\n🔧 Verificando configuración básica:', 'blue');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (packageJson.type === 'module') {
      colorLog('✅ Tipo ES module configurado', 'green');
    } else {
      colorLog('❌ Tipo ES module no configurado', 'red');
      allChecksPassed = false;
    }

    if (packageJson.scripts && packageJson.scripts.start) {
      colorLog('✅ Script start configurado', 'green');
    } else {
      colorLog('❌ Script start faltante', 'red');
      allChecksPassed = false;
    }

    if (fs.existsSync('config.env')) {
      colorLog('✅ Archivo de configuración encontrado', 'green');
    } else {
      colorLog('❌ Archivo de configuración faltante', 'red');
      allChecksPassed = false;
    }
  } catch (error) {
    colorLog(`❌ Error verificando configuración: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * TESTING RÁPIDO DE SEGURIDAD
 */
function testSecurityQuick() {
  colorLog('\n🔒 TESTING RÁPIDO DE SEGURIDAD', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos de seguridad
  colorLog('\n🛡️ Verificando archivos de seguridad:', 'blue');
  if (fs.existsSync('config.env')) {
    colorLog('✅ Archivo de configuración encontrado', 'green');
  } else {
    colorLog('❌ Archivo de configuración faltante', 'red');
    allChecksPassed = false;
  }

  if (fs.existsSync('.gitignore')) {
    colorLog('✅ .gitignore encontrado', 'green');
  } else {
    colorLog('❌ .gitignore faltante', 'red');
    allChecksPassed = false;
  }

  // Verificar que config.env no esté en git
  try {
    if (fs.existsSync('.gitignore')) {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      if (gitignoreContent.includes('config.env')) {
        colorLog('✅ config.env está en .gitignore', 'green');
      } else {
        colorLog('❌ config.env NO está en .gitignore', 'red');
        allChecksPassed = false;
      }
    }
  } catch (error) {
    colorLog(`❌ Error verificando .gitignore: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * TESTING RÁPIDO DE SCRIPTS
 */
function testScriptsQuick() {
  colorLog('\n📜 TESTING RÁPIDO DE SCRIPTS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar scripts críticos
  colorLog('\n🔧 Verificando scripts críticos:', 'blue');
  const criticalScripts = [
    'scripts/Seguridad/security-complete.mjs',
    'scripts/Monitoreo&Salud/monitoring-complete.mjs',
    'scripts/Verificacion/verify-complete.mjs',
  ];

  for (const script of criticalScripts) {
    if (fs.existsSync(script)) {
      colorLog(`✅ ${script}`, 'green');
    } else {
      colorLog(`❌ ${script}`, 'red');
      allChecksPassed = false;
    }
  }

  // Verificar archivos de test básicos
  colorLog('\n🧪 Verificando archivos de test básicos:', 'blue');
  const basicTestFiles = [
    'test/unit/utility-functions.test.mjs',
    'test/security/security-basic.test.mjs',
  ];

  for (const testFile of basicTestFiles) {
    if (fs.existsSync(testFile)) {
      colorLog(`✅ ${testFile}`, 'green');
    } else {
      colorLog(`⚠️  ${testFile}`, 'yellow');
    }
  }

  return allChecksPassed;
}

/**
 * EJECUCIÓN COMPLETA DEL TESTING RÁPIDO
 */
function runQuickTesting() {
  const startTime = Date.now();

  colorLog('\n⚡ TESTING RÁPIDO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Testing de estructura
  const structureOK = testStructureQuick();

  // 2. Testing de dependencias
  const depsOK = testDependenciesQuick();

  // 3. Testing de configuración
  const configOK = testConfigQuick();

  // 4. Testing de seguridad
  const securityOK = testSecurityQuick();

  // 5. Testing de scripts
  const scriptsOK = testScriptsQuick();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN TESTING RÁPIDO', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`📁 Estructura: ${structureOK ? '✅ OK' : '❌ Problemas'}`, structureOK ? 'green' : 'red');
  colorLog(`📦 Dependencias: ${depsOK ? '✅ OK' : '❌ Problemas'}`, depsOK ? 'green' : 'red');
  colorLog(`⚙️ Configuración: ${configOK ? '✅ OK' : '❌ Problemas'}`, configOK ? 'green' : 'red');
  colorLog(`🔒 Seguridad: ${securityOK ? '✅ OK' : '❌ Problemas'}`, securityOK ? 'green' : 'red');
  colorLog(`📜 Scripts: ${scriptsOK ? '✅ OK' : '❌ Problemas'}`, scriptsOK ? 'green' : 'red');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const allOK = structureOK && depsOK && configOK && securityOK && scriptsOK;
  colorLog(`\n🎯 Estado general: ${allOK ? '✅ TODO OK' : '❌ PROBLEMAS DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ TESTING RÁPIDO COMPLETADO', 'bright');
  colorLog('💡 Para testing completo, ejecuta: node scripts/Testing/testing-complete.mjs', 'blue');
}

// Ejecutar si se llama directamente
runQuickTesting();
