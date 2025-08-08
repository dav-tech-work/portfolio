#!/usr/bin/env node

/**
 * Script de Verificación Rápido
 * @description Versión ligera para verificaciones rápidas de workflows y Docker
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
 * Verifica que un archivo existe
 */
function checkFileExists(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      colorLog(`✅ ${description}: ${filePath}`, 'green');
      return true;
    } else {
      colorLog(`❌ ${description}: ${filePath} - NO ENCONTRADO`, 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ Error verificando ${description}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Verifica que un directorio existe
 */
function checkDirectoryExists(dirPath, description) {
  try {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      colorLog(`✅ ${description}: ${dirPath}`, 'green');
      return true;
    } else {
      colorLog(`❌ ${description}: ${dirPath} - NO ENCONTRADO`, 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ Error verificando ${description}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * VERIFICACIÓN RÁPIDA DE WORKFLOWS
 */
function verifyWorkflowsQuick() {
  colorLog('\n🔄 VERIFICACIÓN RÁPIDA DE WORKFLOWS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar workflows críticos
  colorLog('\n📁 Verificando workflows críticos:', 'blue');
  allChecksPassed &= checkFileExists('.github/workflows/ci-simple.yml', 'Workflow CI/CD Principal');
  allChecksPassed &= checkFileExists('.github/workflows/security-scan.yml', 'Workflow de Seguridad');

  // Verificar scripts críticos
  colorLog('\n📜 Verificando scripts críticos:', 'blue');
  allChecksPassed &= checkFileExists('scripts/security-check.mjs', 'Script security-check');
  allChecksPassed &= checkFileExists('scripts/health-check.mjs', 'Script health-check');

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE DOCKER
 */
function verifyDockerQuick() {
  colorLog('\n🐳 VERIFICACIÓN RÁPIDA DE DOCKER', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos Docker críticos
  colorLog('\n📁 Verificando archivos Docker críticos:', 'blue');
  allChecksPassed &= checkFileExists('docker/Dockerfile', 'Dockerfile');
  allChecksPassed &= checkFileExists('.dockerignore', '.dockerignore');

  // Verificar contenido básico del Dockerfile
  colorLog('\n🔍 Verificando contenido básico del Dockerfile:', 'blue');
  const dockerfilePath = path.join(__dirname, '..', 'docker', 'Dockerfile');

  if (fs.existsSync(dockerfilePath)) {
    try {
      const content = fs.readFileSync(dockerfilePath, 'utf8');

      // Verificar elementos básicos
      const basicChecks = [
        { name: 'FROM node', found: content.includes('FROM node') },
        { name: 'COPY', found: content.includes('COPY') },
        { name: 'EXPOSE', found: content.includes('EXPOSE') },
      ];

      basicChecks.forEach(({ name, found }) => {
        if (found) {
          colorLog(`✅ ${name} encontrado`, 'green');
        } else {
          colorLog(`❌ ${name} NO encontrado`, 'red');
          allChecksPassed = false;
        }
      });
    } catch (error) {
      colorLog(`❌ Error leyendo Dockerfile: ${error.message}`, 'red');
      allChecksPassed = false;
    }
  } else {
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN
 */
function verifyConfigQuick() {
  colorLog('\n⚙️ VERIFICACIÓN RÁPIDA DE CONFIGURACIÓN', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos críticos
  colorLog('\n📄 Verificando archivos críticos:', 'blue');
  allChecksPassed &= checkFileExists('package.json', 'package.json');
  allChecksPassed &= checkFileExists('app.mjs', 'app.mjs');
  allChecksPassed &= checkFileExists('config.env', 'config.env');

  // Verificar directorios críticos
  colorLog('\n📁 Verificando directorios críticos:', 'blue');
  allChecksPassed &= checkDirectoryExists('src', 'Directorio src');
  allChecksPassed &= checkDirectoryExists('public', 'Directorio public');
  allChecksPassed &= checkDirectoryExists('views', 'Directorio views');

  // Verificar configuración básica de package.json
  colorLog('\n📦 Verificando configuración básica:', 'blue');
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Verificar campos básicos
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

  } catch (error) {
    colorLog(`❌ Error verificando package.json: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN RÁPIDA DE SEGURIDAD
 */
function verifySecurityQuick() {
  colorLog('\n🔒 VERIFICACIÓN RÁPIDA DE SEGURIDAD', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos de seguridad críticos
  colorLog('\n🛡️ Verificando archivos de seguridad:', 'blue');
  allChecksPassed &= checkFileExists('config.env', 'Archivo de configuración');
  allChecksPassed &= checkFileExists('.gitignore', '.gitignore');

  // Verificar que config.env no esté en git
  try {
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
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
 * VERIFICACIÓN RÁPIDA DE DEPENDENCIAS
 */
function verifyDependenciesQuick() {
  colorLog('\n📦 VERIFICACIÓN RÁPIDA DE DEPENDENCIAS', 'cyan');
  colorLog('='.repeat(50), 'cyan');

  let allChecksPassed = true;

  // Verificar archivos de dependencias
  colorLog('\n📄 Verificando archivos de dependencias:', 'blue');
  allChecksPassed &= checkFileExists('package.json', 'package.json');
  allChecksPassed &= checkFileExists('package-lock.json', 'package-lock.json');

  // Verificar que node_modules existe
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    colorLog('✅ node_modules instalado', 'green');
  } else {
    colorLog('❌ node_modules NO instalado - ejecutar npm install', 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * EJECUCIÓN COMPLETA DEL VERIFY RÁPIDO
 */
function runQuickVerification() {
  const startTime = Date.now();

  colorLog('\n⚡ VERIFICACIÓN RÁPIDA INICIADA', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificar workflows
  const workflowsOK = verifyWorkflowsQuick();

  // 2. Verificar Docker
  const dockerOK = verifyDockerQuick();

  // 3. Verificar configuración
  const configOK = verifyConfigQuick();

  // 4. Verificar seguridad
  const securityOK = verifySecurityQuick();

  // 5. Verificar dependencias
  const depsOK = verifyDependenciesQuick();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN VERIFICACIÓN RÁPIDA', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🔄 Workflows: ${workflowsOK ? '✅ OK' : '❌ Problemas'}`, workflowsOK ? 'green' : 'red');
  colorLog(`🐳 Docker: ${dockerOK ? '✅ OK' : '❌ Problemas'}`, dockerOK ? 'green' : 'red');
  colorLog(`⚙️ Configuración: ${configOK ? '✅ OK' : '❌ Problemas'}`, configOK ? 'green' : 'red');
  colorLog(`🔒 Seguridad: ${securityOK ? '✅ OK' : '❌ Problemas'}`, securityOK ? 'green' : 'red');
  colorLog(`📦 Dependencias: ${depsOK ? '✅ OK' : '❌ Problemas'}`, depsOK ? 'green' : 'red');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const allOK = workflowsOK && dockerOK && configOK && securityOK && depsOK;
  colorLog(`\n🎯 Estado general: ${allOK ? '✅ TODO OK' : '❌ PROBLEMAS DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ VERIFICACIÓN RÁPIDA COMPLETADA', 'bright');
  colorLog('💡 Para verificación completa, ejecuta: node scripts/verify-complete.mjs', 'blue');
}

// Ejecutar si se llama directamente
runQuickVerification();
