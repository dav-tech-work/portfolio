#!/usr/bin/env node

/**
 * Script de Testing Completo
 * @description Consolida pruebas de performance, workflows y funcionalidad del proyecto
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import { performance } from 'perf_hooks';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

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
  magenta: '\x1b[35m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuración de pruebas
const config = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  duration: parseInt(process.env.TEST_DURATION) || 30,
  connections: parseInt(process.env.TEST_CONNECTIONS) || 10,
  warmupTime: parseInt(process.env.WARMUP_TIME) || 5,
  endpoints: ['/', '/health', '/auth/login', '/auth/register'],
  outputDir: path.join(__dirname, '../../results/testing-results'),
  reportFile: 'testing-complete-report.json',
};

/**
 * TESTING DE PERFORMANCE
 */
async function testPerformance() {
  colorLog('\n🚀 TESTING DE PERFORMANCE', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {},
  };

  // Verificar que el servidor esté ejecutándose
  colorLog('\n🔍 Verificando servidor:', 'blue');
  let serverRunning = false;
  try {
    // Usar PowerShell para hacer la petición HTTP en Windows
    const { stdout } = await execAsync(`powershell -Command "try { $response = Invoke-WebRequest -Uri '${config.baseUrl}' -UseBasicParsing -TimeoutSec 5; $response.StatusCode } catch { 'ERROR' }"`);
    if (stdout.trim() === '200') {
      colorLog('✅ Servidor respondiendo correctamente', 'green');
      serverRunning = true;
    } else {
      colorLog(`⚠️  Servidor respondió con código: ${stdout.trim()}`, 'yellow');
      serverRunning = true; // El servidor está ejecutándose pero con un código diferente
    }
  } catch (error) {
    colorLog('❌ Servidor no disponible - iniciando pruebas básicas', 'red');
    colorLog('💡 Para iniciar el servidor, ejecuta: npm start', 'blue');
  }

  // Pruebas de endpoints básicos
  if (serverRunning) {
    colorLog('\n📡 Probando endpoints:', 'blue');
    for (const endpoint of config.endpoints) {
      const startTime = performance.now();
      try {
        const { stdout } = await execAsync(`powershell -Command "try { $response = Invoke-WebRequest -Uri '${config.baseUrl}${endpoint}' -UseBasicParsing -TimeoutSec 10; $response.StatusCode } catch { 'ERROR' }"`);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        if (stdout.trim() === '200') {
          colorLog(`✅ ${endpoint} - ${responseTime.toFixed(2)}ms`, 'green');
          results.tests.push({
            endpoint,
            status: 'success',
            responseTime,
            statusCode: stdout.trim(),
          });
        } else {
          colorLog(`⚠️  ${endpoint} - ${stdout.trim()} (${responseTime.toFixed(2)}ms)`, 'yellow');
          results.tests.push({
            endpoint,
            status: 'warning',
            responseTime,
            statusCode: stdout.trim(),
          });
        }
      } catch (error) {
        colorLog(`❌ ${endpoint} - Error de conexión`, 'red');
        results.tests.push({
          endpoint,
          status: 'error',
          responseTime: null,
          statusCode: 'ERROR',
        });
      }
    }
  } else {
    colorLog('\n📡 Omitiendo pruebas de endpoints - servidor no disponible', 'yellow');
    // Agregar resultados simulados para mantener la estructura
    for (const endpoint of config.endpoints) {
      results.tests.push({
        endpoint,
        status: 'skipped',
        responseTime: null,
        statusCode: 'SKIPPED',
        message: 'Servidor no disponible',
      });
    }
  }

  // Calcular estadísticas
  const successfulTests = results.tests.filter(test => test.status === 'success');
  const skippedTests = results.tests.filter(test => test.status === 'skipped');
  const avgResponseTime = successfulTests.length > 0
    ? successfulTests.reduce((sum, test) => sum + test.responseTime, 0) / successfulTests.length
    : 0;

  results.summary = {
    totalTests: results.tests.length,
    successfulTests: successfulTests.length,
    failedTests: results.tests.filter(test => test.status === 'error').length,
    skippedTests: skippedTests.length,
    avgResponseTime: avgResponseTime.toFixed(2),
  };

  colorLog(`\n📊 Resumen Performance: ${successfulTests.length}/${results.tests.length} exitosos`, 'blue');
  colorLog(`⏱️  Tiempo promedio: ${avgResponseTime.toFixed(2)}ms`, 'blue');

  return results;
}

/**
 * TESTING DE WORKFLOWS
 */
async function testWorkflows() {
  colorLog('\n🔄 TESTING DE WORKFLOWS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    security: { passed: false, issues: [] },
    codeQuality: { passed: false, issues: [] },
    testing: { passed: false, issues: [] },
    projectStructure: { passed: false, issues: [] },
    dependencies: { passed: false, issues: [] },
    configuration: { passed: false, issues: [] },
  };

  // Verificar estructura del proyecto
  colorLog('\n📁 Verificando estructura del proyecto:', 'blue');
  const requiredDirs = ['src', 'public', 'views', 'test', 'scripts'];
  const requiredFiles = ['package.json', 'app.mjs', 'config.env'];

  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      colorLog(`✅ Directorio ${dir}`, 'green');
    } else {
      colorLog(`❌ Directorio ${dir} faltante`, 'red');
      results.projectStructure.issues.push(`Directorio ${dir} no encontrado`);
    }
  }

  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      colorLog(`✅ Archivo ${file}`, 'green');
    } else {
      colorLog(`❌ Archivo ${file} faltante`, 'red');
      results.projectStructure.issues.push(`Archivo ${file} no encontrado`);
    }
  }

  results.projectStructure.passed = results.projectStructure.issues.length === 0;

  // Verificar dependencias
  colorLog('\n📦 Verificando dependencias:', 'blue');
  try {
    if (fs.existsSync('package-lock.json')) {
      colorLog('✅ package-lock.json encontrado', 'green');
    } else {
      colorLog('⚠️  package-lock.json faltante', 'yellow');
      results.dependencies.issues.push('package-lock.json no encontrado');
    }

    if (fs.existsSync('node_modules')) {
      colorLog('✅ node_modules instalado', 'green');
    } else {
      colorLog('❌ node_modules no instalado', 'red');
      results.dependencies.issues.push('node_modules no encontrado');
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['express', 'ejs', 'dotenv'];

    for (const dep of requiredDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        colorLog(`✅ Dependencia ${dep}`, 'green');
      } else {
        colorLog(`❌ Dependencia ${dep} faltante`, 'red');
        results.dependencies.issues.push(`Dependencia ${dep} no encontrada`);
      }
    }
  } catch (error) {
    colorLog(`❌ Error verificando dependencias: ${error.message}`, 'red');
    results.dependencies.issues.push(`Error: ${error.message}`);
  }

  results.dependencies.passed = results.dependencies.issues.length === 0;

  // Verificar configuración
  colorLog('\n⚙️ Verificando configuración:', 'blue');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (packageJson.type === 'module') {
      colorLog('✅ Tipo ES module configurado', 'green');
    } else {
      colorLog('❌ Tipo ES module no configurado', 'red');
      results.configuration.issues.push('Tipo ES module no configurado');
    }

    if (packageJson.scripts && packageJson.scripts.start) {
      colorLog('✅ Script start configurado', 'green');
    } else {
      colorLog('❌ Script start faltante', 'red');
      results.configuration.issues.push('Script start no configurado');
    }

    if (fs.existsSync('config.env')) {
      colorLog('✅ Archivo de configuración encontrado', 'green');
    } else {
      colorLog('❌ Archivo de configuración faltante', 'red');
      results.configuration.issues.push('config.env no encontrado');
    }
  } catch (error) {
    colorLog(`❌ Error verificando configuración: ${error.message}`, 'red');
    results.configuration.issues.push(`Error: ${error.message}`);
  }

  results.configuration.passed = results.configuration.issues.length === 0;

  // Verificar seguridad
  colorLog('\n🔒 Verificando seguridad:', 'blue');
  try {
    if (fs.existsSync('.gitignore')) {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      if (gitignoreContent.includes('config.env')) {
        colorLog('✅ config.env en .gitignore', 'green');
      } else {
        colorLog('❌ config.env NO en .gitignore', 'red');
        results.security.issues.push('config.env no está en .gitignore');
      }
    } else {
      colorLog('❌ .gitignore no encontrado', 'red');
      results.security.issues.push('.gitignore no encontrado');
    }
  } catch (error) {
    colorLog(`❌ Error verificando seguridad: ${error.message}`, 'red');
    results.security.issues.push(`Error: ${error.message}`);
  }

  results.security.passed = results.security.issues.length === 0;

  return results;
}

/**
 * TESTING DE FUNCIONALIDAD
 */
async function testFunctionality() {
  colorLog('\n🧪 TESTING DE FUNCIONALIDAD', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    tests: [],
    summary: {},
  };

  // Verificar scripts críticos
  colorLog('\n📜 Verificando scripts críticos:', 'blue');
  const criticalScripts = [
    'scripts/Seguridad/security-complete.mjs',
    'scripts/Monitoreo&Salud/monitoring-complete.mjs',
    'scripts/Rendimiento/performance-complete.mjs',
    'scripts/Verificacion/verify-complete.mjs',
  ];

  for (const script of criticalScripts) {
    if (fs.existsSync(script)) {
      colorLog(`✅ ${script}`, 'green');
      results.tests.push({
        script,
        status: 'success',
        message: 'Script encontrado',
      });
    } else {
      colorLog(`❌ ${script}`, 'red');
      results.tests.push({
        script,
        status: 'error',
        message: 'Script no encontrado',
      });
    }
  }

  // Verificar archivos de test
  colorLog('\n🧪 Verificando archivos de test:', 'blue');
  const testFiles = [
    'test/unit/utility-functions.test.mjs',
    'test/security/security-basic.test.mjs',
    'test/unit/title.test.mjs',
  ];

  for (const testFile of testFiles) {
    if (fs.existsSync(testFile)) {
      colorLog(`✅ ${testFile}`, 'green');
      results.tests.push({
        testFile,
        status: 'success',
        message: 'Archivo de test encontrado',
      });
    } else {
      colorLog(`⚠️  ${testFile}`, 'yellow');
      results.tests.push({
        testFile,
        status: 'warning',
        message: 'Archivo de test no encontrado',
      });
    }
  }

  // Calcular estadísticas
  const successfulTests = results.tests.filter(test => test.status === 'success');
  const failedTests = results.tests.filter(test => test.status === 'error');

  results.summary = {
    totalTests: results.tests.length,
    successfulTests: successfulTests.length,
    failedTests: failedTests.length,
    warningTests: results.tests.filter(test => test.status === 'warning').length,
  };

  colorLog(`\n📊 Resumen Funcionalidad: ${successfulTests.length}/${results.tests.length} exitosos`, 'blue');

  return results;
}

/**
 * GENERAR REPORTE COMPLETO
 */
function generateCompleteReport(performanceResults, workflowResults, functionalityResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      performance: performanceResults.summary,
      workflows: {
        total: Object.keys(workflowResults).length,
        passed: Object.values(workflowResults).filter(r => r.passed).length,
        failed: Object.values(workflowResults).filter(r => !r.passed).length,
      },
      functionality: functionalityResults.summary,
    },
    details: {
      performance: performanceResults,
      workflows: workflowResults,
      functionality: functionalityResults,
    },
  };

  // Crear directorio si no existe
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  const reportPath = path.join(config.outputDir, config.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  colorLog(`\n📄 Reporte guardado en: ${reportPath}`, 'cyan');
  return report;
}

/**
 * EJECUCIÓN COMPLETA
 */
async function runCompleteTesting() {
  const startTime = Date.now();

  colorLog('\n🚀 TESTING COMPLETO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Testing de performance
  const performanceResults = await testPerformance();

  // 2. Testing de workflows
  const workflowResults = await testWorkflows();

  // 3. Testing de funcionalidad
  const functionalityResults = await testFunctionality();

  // 4. Generar reporte
  const completeReport = generateCompleteReport(performanceResults, workflowResults, functionalityResults);

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN FINAL', 'bright');
  colorLog('='.repeat(60), 'bright');
  colorLog(`🚀 Performance: ${performanceResults.summary.successfulTests}/${performanceResults.summary.totalTests} exitosos`, 'green');
  colorLog(`🔄 Workflows: ${completeReport.summary.workflows.passed}/${completeReport.summary.workflows.total} pasaron`, 'green');
  colorLog(`🧪 Funcionalidad: ${functionalityResults.summary.successfulTests}/${functionalityResults.summary.totalTests} exitosos`, 'green');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const allPassed = completeReport.summary.workflows.passed === completeReport.summary.workflows.total;
  colorLog(`\n🎯 Estado general: ${allPassed ? '✅ TODO OK' : '❌ PROBLEMAS DETECTADOS'}`, allPassed ? 'green' : 'red');

  colorLog('\n✅ TESTING COMPLETO FINALIZADO', 'bright');
  colorLog('💡 Para testing rápido, ejecuta: node scripts/Testing/testing-quick.mjs', 'blue');
}

// Ejecutar si se llama directamente
runCompleteTesting().catch(console.error);
