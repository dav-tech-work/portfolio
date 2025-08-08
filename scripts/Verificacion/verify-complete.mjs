#!/usr/bin/env node

/**
 * Script de Verificación Completo
 * @description Consolida verificaciones de workflows, Docker y configuración del proyecto
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const config = {
  projectRoot: path.join(__dirname, '../..'),
  reportsDir: path.join(__dirname, '../../results/verification-results'),
  reportFile: 'verify-complete-report.json',
};

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
 * Verifica que un comando npm existe en package.json
 */
function checkNpmScript(scriptName, description) {
  try {
    const packageJsonPath = path.join(config.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (packageJson.scripts && packageJson.scripts[scriptName]) {
      colorLog(`✅ ${description}: npm run ${scriptName}`, 'green');
      return true;
    } else {
      colorLog(`❌ ${description}: npm run ${scriptName} NO ENCONTRADO`, 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ Error verificando ${description}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * VERIFICACIÓN DE WORKFLOWS
 */
function verifyWorkflows() {
  colorLog('\n🔄 VERIFICACIÓN DE WORKFLOWS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  let allChecksPassed = true;

  // Verificar workflows existentes
  colorLog('\n📁 Verificando workflows:', 'blue');
  allChecksPassed &= checkFileExists('.github/workflows/performance.yml', 'Workflow de Performance');

  // Verificar scripts existentes en el proyecto
  colorLog('\n📜 Verificando scripts del proyecto:', 'blue');
  allChecksPassed &= checkFileExists('scripts/Testing/testing-complete.mjs', 'Script testing-complete');
  allChecksPassed &= checkFileExists('scripts/Analisis/analysis-complete.mjs', 'Script analysis-complete');
  allChecksPassed &= checkFileExists('scripts/Seguridad/security-complete.mjs', 'Script security-complete');
  allChecksPassed &= checkFileExists('scripts/Rendimiento/performance-complete.mjs', 'Script performance-complete');
  allChecksPassed &= checkFileExists('scripts/MANTENIMIENTO/maintenance-complete.mjs', 'Script maintenance-complete');
  allChecksPassed &= checkFileExists('scripts/Monitoreo&Salud/monitoring-complete.mjs', 'Script monitoring-complete');
  allChecksPassed &= checkFileExists('scripts/Utilidades/utilities-complete.mjs', 'Script utilities-complete');

  // Verificar comandos npm existentes
  colorLog('\n📦 Verificando comandos npm:', 'blue');
  allChecksPassed &= checkNpmScript('start', 'Comando start');
  allChecksPassed &= checkNpmScript('dev', 'Comando dev');
  allChecksPassed &= checkNpmScript('lint', 'Comando lint');
  allChecksPassed &= checkNpmScript('testing-completo', 'Comando testing-completo');
  allChecksPassed &= checkNpmScript('analisis-completo', 'Comando analisis-completo');
  allChecksPassed &= checkNpmScript('seguridad-completo', 'Comando seguridad-completo');
  allChecksPassed &= checkNpmScript('rendimiento-completo', 'Comando rendimiento-completo');
  allChecksPassed &= checkNpmScript('mantenimiento-completo', 'Comando mantenimiento-completo');
  allChecksPassed &= checkNpmScript('monitoreo-completo', 'Comando monitoreo-completo');
  allChecksPassed &= checkNpmScript('utilidades-completo', 'Comando utilidades-completo');

  return allChecksPassed;
}

/**
 * VERIFICACIÓN DE DOCKER
 */
function verifyDocker() {
  colorLog('\n🐳 VERIFICACIÓN DE DOCKER', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  let allChecksPassed = true;

  // Verificar archivos Docker existentes
  colorLog('\n📁 Verificando archivos Docker:', 'blue');
  allChecksPassed &= checkFileExists('docker/Dockerfile', 'Dockerfile');
  allChecksPassed &= checkFileExists('.dockerignore', '.dockerignore');

  // Verificar contenido del Dockerfile
  colorLog('\n🔍 Verificando contenido del Dockerfile:', 'blue');
  const dockerfilePath = path.join(config.projectRoot, 'docker', 'Dockerfile');

  if (fs.existsSync(dockerfilePath)) {
    try {
      const content = fs.readFileSync(dockerfilePath, 'utf8');

      // Verificar elementos críticos
      const checks = [
        { name: 'FROM node:', found: content.includes('FROM node:') },
        { name: 'COPY app.mjs', found: content.includes('COPY') && content.includes('app.mjs') },
        { name: 'COPY src/', found: content.includes('COPY') && content.includes('src') },
        { name: 'COPY public/', found: content.includes('COPY') && content.includes('public') },
        { name: 'COPY views/', found: content.includes('COPY') && content.includes('views') },
        { name: 'EXPOSE 3000', found: content.includes('EXPOSE 3000') },
        { name: 'ENTRYPOINT ["dumb-init", "node", "app.mjs"]', found: content.includes('ENTRYPOINT ["dumb-init", "node", "app.mjs"]') },
      ];

      checks.forEach(({ name, found }) => {
        if (found) {
          colorLog(`✅ ${name}`, 'green');
        } else {
          colorLog(`❌ ${name} - NO ENCONTRADO`, 'red');
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
 * VERIFICACIÓN DE CONFIGURACIÓN DEL PROYECTO
 */
function verifyProjectConfig() {
  colorLog('\n⚙️ VERIFICACIÓN DE CONFIGURACIÓN DEL PROYECTO', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  let allChecksPassed = true;

  // Verificar archivos de configuración críticos
  colorLog('\n📄 Verificando archivos de configuración:', 'blue');
  allChecksPassed &= checkFileExists('package.json', 'package.json');
  allChecksPassed &= checkFileExists('config.env', 'config.env');
  allChecksPassed &= checkFileExists('app.mjs', 'app.mjs');
  allChecksPassed &= checkFileExists('.gitignore', '.gitignore');

  // Verificar directorios críticos
  colorLog('\n📁 Verificando directorios críticos:', 'blue');
  allChecksPassed &= checkDirectoryExists('src', 'Directorio src');
  allChecksPassed &= checkDirectoryExists('public', 'Directorio public');
  allChecksPassed &= checkDirectoryExists('views', 'Directorio views');
  allChecksPassed &= checkDirectoryExists('scripts', 'Directorio scripts');
  allChecksPassed &= checkDirectoryExists('results', 'Directorio results');

  // Verificar configuración de package.json
  colorLog('\n📦 Verificando configuración de package.json:', 'blue');
  try {
    const packageJsonPath = path.join(config.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Verificar campos críticos
    const requiredFields = ['name', 'version', 'main', 'type', 'scripts'];
    requiredFields.forEach(field => {
      if (packageJson[field]) {
        colorLog(`✅ Campo ${field}: ${packageJson[field]}`, 'green');
      } else {
        colorLog(`❌ Campo ${field} faltante`, 'red');
        allChecksPassed = false;
      }
    });

    // Verificar que sea ES module
    if (packageJson.type === 'module') {
      colorLog('✅ Tipo ES module configurado', 'green');
    } else {
      colorLog('❌ Tipo ES module no configurado', 'red');
      allChecksPassed = false;
    }

    // Verificar dependencias críticas
    const criticalDeps = ['express', 'ejs', 'dotenv'];
    criticalDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        colorLog(`✅ Dependencia ${dep}: ${packageJson.dependencies[dep]}`, 'green');
      } else {
        colorLog(`❌ Dependencia ${dep} faltante`, 'red');
        allChecksPassed = false;
      }
    });

  } catch (error) {
    colorLog(`❌ Error verificando package.json: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN DE SEGURIDAD
 */
function verifySecurity() {
  colorLog('\n🔒 VERIFICACIÓN DE SEGURIDAD', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  let allChecksPassed = true;

  // Verificar archivos de seguridad
  colorLog('\n🛡️ Verificando archivos de seguridad:', 'blue');
  allChecksPassed &= checkFileExists('config.env', 'Archivo de configuración');
  allChecksPassed &= checkFileExists('.gitignore', '.gitignore');

  // Verificar que config.env no esté en git
  try {
    const gitignorePath = path.join(config.projectRoot, '.gitignore');
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

  // Verificar configuración de secretos
  try {
    const configPath = path.join(config.projectRoot, 'config.env');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const requiredSecrets = ['SESSION_SECRET', 'JWT_SECRET'];

      requiredSecrets.forEach(secret => {
        if (configContent.includes(secret)) {
          colorLog(`✅ Secreto ${secret} configurado`, 'green');
        } else {
          colorLog(`❌ Secreto ${secret} faltante`, 'red');
          allChecksPassed = false;
        }
      });
    }
  } catch (error) {
    colorLog(`❌ Error verificando config.env: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN DE DEPENDENCIAS
 */
function verifyDependencies() {
  colorLog('\n📦 VERIFICACIÓN DE DEPENDENCIAS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  let allChecksPassed = true;

  // Verificar archivos de dependencias
  colorLog('\n📄 Verificando archivos de dependencias:', 'blue');
  allChecksPassed &= checkFileExists('package.json', 'package.json');
  allChecksPassed &= checkFileExists('package-lock.json', 'package-lock.json');

  // Verificar que node_modules existe
  const nodeModulesPath = path.join(config.projectRoot, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    colorLog('✅ node_modules instalado', 'green');
  } else {
    colorLog('❌ node_modules NO instalado - ejecutar npm install', 'red');
    allChecksPassed = false;
  }

  return allChecksPassed;
}

/**
 * VERIFICACIÓN DE ESTRUCTURA DE ARCHIVOS
 */
function verifyFileStructure() {
  colorLog('\n📁 VERIFICACIÓN DE ESTRUCTURA DE ARCHIVOS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  let allChecksPassed = true;

  // Verificar archivos críticos del proyecto
  colorLog('\n📄 Verificando archivos críticos:', 'blue');
  allChecksPassed &= checkFileExists('src/routes/auth.mjs', 'Ruta de autenticación');
  allChecksPassed &= checkFileExists('src/routes/auth-simple.mjs', 'Ruta de autenticación simple');
  allChecksPassed &= checkFileExists('src/routes/metrics.mjs', 'Ruta de métricas');
  allChecksPassed &= checkFileExists('src/routes/api/contacto.mjs', 'API de contacto');
  allChecksPassed &= checkFileExists('src/middleware/errorHandler.mjs', 'Middleware de errores');
  allChecksPassed &= checkFileExists('src/middleware/rateLimiters.mjs', 'Middleware de rate limiting');
  allChecksPassed &= checkFileExists('src/middleware/sanitizer-advanced.mjs', 'Middleware de sanitización');
  allChecksPassed &= checkFileExists('src/config/imports.mjs', 'Configuración de imports');
  allChecksPassed &= checkFileExists('src/config/performance.mjs', 'Configuración de performance');

  // Verificar archivos de utilidades
  colorLog('\n🔧 Verificando archivos de utilidades:', 'blue');
  allChecksPassed &= checkFileExists('scripts/Utilidades/generate-sri.mjs', 'Generador SRI');
  allChecksPassed &= checkFileExists('scripts/Utilidades/generate-test-config.mjs', 'Generador de configuración de tests');
  allChecksPassed &= checkFileExists('scripts/Utilidades/generate-imports.mjs', 'Generador de imports');

  // Verificar archivos de logs
  colorLog('\n📝 Verificando archivos de logs:', 'blue');
  allChecksPassed &= checkFileExists('logs/security.log', 'Log de seguridad');
  allChecksPassed &= checkFileExists('logs/application.log', 'Log de aplicación');
  allChecksPassed &= checkFileExists('logs/health.log', 'Log de salud');

  return allChecksPassed;
}

/**
 * EJECUCIÓN COMPLETA
 */
function runCompleteVerification() {
  const startTime = Date.now();

  colorLog('\n🚀 VERIFICACIÓN COMPLETA INICIADA', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificar workflows
  const workflowsOK = verifyWorkflows();

  // 2. Verificar Docker
  const dockerOK = verifyDocker();

  // 3. Verificar configuración del proyecto
  const configOK = verifyProjectConfig();

  // 4. Verificar seguridad
  const securityOK = verifySecurity();

  // 5. Verificar dependencias
  const depsOK = verifyDependencies();

  // 6. Verificar estructura de archivos
  const structureOK = verifyFileStructure();

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN FINAL', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🔄 Workflows: ${workflowsOK ? '✅ OK' : '❌ Problemas'}`, workflowsOK ? 'green' : 'red');
  colorLog(`🐳 Docker: ${dockerOK ? '✅ OK' : '❌ Problemas'}`, dockerOK ? 'green' : 'red');
  colorLog(`⚙️ Configuración: ${configOK ? '✅ OK' : '❌ Problemas'}`, configOK ? 'green' : 'red');
  colorLog(`🔒 Seguridad: ${securityOK ? '✅ OK' : '❌ Problemas'}`, securityOK ? 'green' : 'red');
  colorLog(`📦 Dependencias: ${depsOK ? '✅ OK' : '❌ Problemas'}`, depsOK ? 'green' : 'red');
  colorLog(`📁 Estructura: ${structureOK ? '✅ OK' : '❌ Problemas'}`, structureOK ? 'green' : 'red');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const allOK = workflowsOK && dockerOK && configOK && securityOK && depsOK && structureOK;
  colorLog(`\n🎯 Estado general: ${allOK ? '✅ TODO OK' : '❌ PROBLEMAS DETECTADOS'}`, allOK ? 'green' : 'red');

  // Generar reporte
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      workflows: workflowsOK,
      docker: dockerOK,
      config: configOK,
      security: securityOK,
      dependencies: depsOK,
      structure: structureOK,
      allOK,
      totalTime: parseFloat(totalTime),
    },
    details: {
      workflows: workflowsOK,
      docker: dockerOK,
      config: configOK,
      security: securityOK,
      dependencies: depsOK,
      structure: structureOK,
    },
  };

  // Crear directorio si no existe
  if (!fs.existsSync(config.reportsDir)) {
    fs.mkdirSync(config.reportsDir, { recursive: true });
  }

  const reportPath = path.join(config.reportsDir, config.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  colorLog(`📄 Reporte guardado en: ${reportPath}`, 'cyan');

  colorLog('\n✅ VERIFICACIÓN COMPLETA FINALIZADA', 'bright');
  colorLog('💡 Para verificación rápida, ejecuta: node scripts/Verificacion/verify-quick.mjs', 'blue');
}

// Ejecutar si se llama directamente
runCompleteVerification();
