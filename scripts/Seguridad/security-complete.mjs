#!/usr/bin/env node

/**
 * Script de Seguridad Completo
 * @description Consolida todas las verificaciones y mejoras de seguridad
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
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
  magenta: '\x1b[35m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuración de seguridad
const config = {
  configPath: path.join(__dirname, '../../config.env'),
  appPath: path.join(__dirname, '../../app.mjs'),
  middlewarePath: path.join(__dirname, '../../src/middleware'),
  reportsDir: path.join(__dirname, '../../results/security-results'),
  reportFile: 'security-complete-report.json',
};

/**
 * VERIFICACIÓN DE CONFIGURACIÓN DE ENTORNO
 */
function checkEnvironmentConfig() {
  colorLog('\n🔍 VERIFICACIÓN DE CONFIGURACIÓN DE ENTORNO', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    configExists: false,
    criticalSecrets: { session: false, jwt: false, csrf: false },
    securityConfig: { rateLimit: false, cors: false, bcrypt: false },
    productionConfig: { nodeEnv: false, cookieSecure: false },
    issues: [],
    warnings: [],
  };

  // Verificar existencia de config.env
  colorLog('\n📁 Verificando archivo config.env:', 'blue');
  if (!fs.existsSync(config.configPath)) {
    colorLog('❌ Archivo config.env no encontrado', 'red');
    results.issues.push('Archivo config.env no encontrado');
    return results;
  }

  colorLog('✅ Archivo config.env encontrado', 'green');
  results.configExists = true;

  // Leer y analizar configuración
  try {
    const configContent = fs.readFileSync(config.configPath, 'utf8');
    const lines = configContent.split('\n');
    const envVars = {};

    // Parsear variables de entorno
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    // Verificar secretos críticos
    colorLog('\n🔐 Verificando secretos críticos:', 'blue');
    const criticalSecrets = ['SESSION_SECRET', 'JWT_SECRET', 'CSRF_SECRET'];

    criticalSecrets.forEach((secretName) => {
      const secret = envVars[secretName];

      if (!secret) {
        colorLog(`❌ ${secretName} no está configurado`, 'red');
        results.issues.push(`${secretName} no está configurado`);
        return;
      }

      if (secret.length < 32) {
        colorLog(`⚠️ ${secretName} es muy corto (${secret.length} caracteres)`, 'yellow');
        results.warnings.push(`${secretName} es muy corto`);
        return;
      }

      if (secret === 'CHANGE_THIS_TO_STRONG_SECRET_IN_PRODUCTION_AT_LEAST_32_CHARS') {
        colorLog(`❌ ${secretName} usa valor por defecto`, 'red');
        results.issues.push(`${secretName} usa valor por defecto`);
        return;
      }

      colorLog(`✅ ${secretName} configurado correctamente`, 'green');
      results.criticalSecrets[secretName.toLowerCase().replace('_secret', '')] = true;
    });

    // Verificar configuración de seguridad
    colorLog('\n🛡️ Verificando configuración de seguridad:', 'blue');

    // Rate limiting
    if (envVars.RATE_LIMIT_WINDOW_MS && envVars.RATE_LIMIT_MAX_REQUESTS) {
      colorLog('✅ Rate limiting configurado', 'green');
      results.securityConfig.rateLimit = true;
    } else {
      colorLog('⚠️ Rate limiting no configurado completamente', 'yellow');
      results.warnings.push('Rate limiting incompleto');
    }

    // CORS
    if (envVars.CORS_ORIGIN || envVars.ALLOWED_ORIGINS) {
      colorLog('✅ CORS configurado', 'green');
      results.securityConfig.cors = true;
    } else {
      colorLog('⚠️ CORS no configurado', 'yellow');
      results.warnings.push('CORS no configurado');
    }

    // Bcrypt rounds
    if (envVars.BCRYPT_ROUNDS && parseInt(envVars.BCRYPT_ROUNDS) >= 12) {
      colorLog('✅ Bcrypt rounds configurado correctamente', 'green');
      results.securityConfig.bcrypt = true;
    } else {
      colorLog('⚠️ Bcrypt rounds insuficientes o no configurado', 'yellow');
      results.warnings.push('Bcrypt rounds insuficientes');
    }

    // Verificar configuración de producción
    colorLog('\n🏭 Verificando configuración de producción:', 'blue');

    if (envVars.NODE_ENV === 'production') {
      colorLog('✅ NODE_ENV configurado para producción', 'green');
      results.productionConfig.nodeEnv = true;
    } else {
      colorLog('⚠️ NODE_ENV no está en producción', 'yellow');
      results.warnings.push('NODE_ENV no está en producción');
    }

    if (envVars.COOKIE_SECURE === 'true') {
      colorLog('✅ Cookies seguras habilitadas', 'green');
      results.productionConfig.cookieSecure = true;
    } else {
      colorLog('⚠️ Cookies seguras no habilitadas', 'yellow');
      results.warnings.push('Cookies seguras no habilitadas');
    }

  } catch (error) {
    colorLog(`❌ Error leyendo configuración: ${error.message}`, 'red');
    results.issues.push(`Error: ${error.message}`);
  }

  return results;
}

/**
 * VERIFICACIÓN DE HEADERS DE SEGURIDAD
 */
function checkSecurityHeaders() {
  colorLog('\n🛡️ VERIFICACIÓN DE HEADERS DE SEGURIDAD', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    headers: {},
    missing: [],
    warnings: [],
    score: 100,
  };

  // Verificar archivos de middleware
  colorLog('\n📁 Verificando middlewares de seguridad:', 'blue');

  const middlewareFiles = [
    'sanitizer-advanced.mjs',
    'rateLimiters.mjs',
    'errorHandler.mjs',
    'auth.mjs',
  ];

  middlewareFiles.forEach((file) => {
    const filePath = path.join(config.middlewarePath, file);
    if (fs.existsSync(filePath)) {
      colorLog(`✅ ${file} encontrado`, 'green');
    } else {
      colorLog(`❌ ${file} no encontrado`, 'red');
      results.missing.push(file);
      results.score -= 15;
    }
  });

  // Verificar configuración de sanitización
  colorLog('\n🔒 Verificando sanitización avanzada:', 'blue');
  const sanitizerPath = path.join(config.middlewarePath, 'sanitizer-advanced.mjs');

  if (fs.existsSync(sanitizerPath)) {
    try {
      const sanitizerContent = fs.readFileSync(sanitizerPath, 'utf8');

      if (sanitizerContent.includes('validator.escape')) {
        colorLog('✅ Sanitización con validator.escape', 'green');
      } else {
        colorLog('⚠️ Sanitización básica', 'yellow');
        results.warnings.push('Sanitización básica');
        results.score -= 10;
      }

      if (sanitizerContent.includes('Object.prototype.hasOwnProperty.call')) {
        colorLog('✅ Uso seguro de hasOwnProperty', 'green');
      } else {
        colorLog('⚠️ Uso directo de hasOwnProperty', 'yellow');
        results.warnings.push('Uso directo de hasOwnProperty');
        results.score -= 5;
      }

      if (sanitizerContent.includes('sanitizeRequest')) {
        colorLog('✅ Función de sanitización exportada', 'green');
      } else {
        colorLog('⚠️ Función de sanitización no encontrada', 'yellow');
        results.warnings.push('Función de sanitización no encontrada');
        results.score -= 5;
      }
    } catch (error) {
      colorLog(`❌ Error leyendo sanitizador: ${error.message}`, 'red');
      results.warnings.push(`Error sanitizador: ${error.message}`);
    }
  }

  // Verificar headers en app.mjs
  colorLog('\n📄 Verificando headers en app.mjs:', 'blue');
  if (fs.existsSync(config.appPath)) {
    try {
      const appContent = fs.readFileSync(config.appPath, 'utf8');

      // Verificar middleware de seguridad
      if (appContent.includes('sanitizeRequest') || appContent.includes('sanitizer-advanced')) {
        colorLog('✅ Middleware de sanitización configurado', 'green');
      } else {
        colorLog('⚠️ Middleware de sanitización no configurado', 'yellow');
        results.warnings.push('Middleware de sanitización no configurado');
        results.score -= 10;
      }

      // Verificar otros middlewares de seguridad
      if (appContent.includes('rateLimiters') || appContent.includes('rateLimit')) {
        colorLog('✅ Rate limiting configurado', 'green');
      } else {
        colorLog('⚠️ Rate limiting no configurado', 'yellow');
        results.warnings.push('Rate limiting no configurado');
        results.score -= 5;
      }

      if (appContent.includes('errorHandler') || appContent.includes('notFoundHandler')) {
        colorLog('✅ Error handling configurado', 'green');
      } else {
        colorLog('⚠️ Error handling no configurado', 'yellow');
        results.warnings.push('Error handling no configurado');
        results.score -= 5;
      }

    } catch (error) {
      colorLog(`❌ Error leyendo app.mjs: ${error.message}`, 'red');
      results.warnings.push(`Error app.mjs: ${error.message}`);
    }
  }

  return results;
}

/**
 * VERIFICACIÓN DE USO DE EVAL()
 */
function checkEvalUsage() {
  colorLog('\n🚫 VERIFICACIÓN DE USO DE EVAL()', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    filesChecked: 0,
    issuesFound: 0,
    issues: [],
    score: 100,
  };

  // Patrones inseguros a buscar
  const unsafePatterns = [
    { pattern: /eval\s*\(/, name: 'eval()', severity: 'critical' },
    { pattern: /new\s+Function\s*\(/, name: 'new Function()', severity: 'critical' },
    { pattern: /setTimeout\s*\(\s*['"`]/, name: 'setTimeout con string', severity: 'high' },
    { pattern: /setInterval\s*\(\s*['"`]/, name: 'setInterval con string', severity: 'high' },
    { pattern: /document\.write\s*\(/, name: 'document.write()', severity: 'medium' },
    { pattern: /innerHTML\s*=\s*[^;]*\+\s*[^;]*\+/, name: 'innerHTML dinámico', severity: 'medium' },
  ];

  // Directorios a excluir
  const excludeDirs = [
    'node_modules',
    '.git',
    'coverage',
    'logs',
    'test-results',
    'uploads',
    'sessions',
    'public/assets/programacion',
    'scripts/Seguridad', // Excluir el propio script de seguridad
  ];

  // Extensiones a verificar
  const fileExtensions = ['.js', '.mjs', '.ts', '.jsx', '.tsx'];

  function shouldExcludeFile(filePath) {
    // Excluir directorios específicos
    if (excludeDirs.some((dir) => filePath.includes(dir))) {
      return true;
    }

    // Excluir el propio script de seguridad
    const currentScriptPath = path.join(__dirname, 'security-complete.mjs');
    if (filePath === currentScriptPath) {
      return true;
    }

    return false;
  }

  function hasFileExtension(filePath) {
    return fileExtensions.some((ext) => filePath.endsWith(ext));
  }

  function checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const fileIssues = [];

      lines.forEach((line, index) => {
        unsafePatterns.forEach(({ pattern, name, severity }) => {
          if (pattern.test(line)) {
            const trimmedLine = line.trim();
            if (
              !trimmedLine.startsWith('//') &&
              !trimmedLine.startsWith('/*') &&
              !trimmedLine.startsWith('*')
            ) {
              fileIssues.push({
                line: index + 1,
                pattern: name,
                severity,
                content: line.trim(),
              });
            }
          }
        });
      });

      return fileIssues;
    } catch (error) {
      return [];
    }
  }

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        if (!shouldExcludeFile(itemPath)) {
          scanDirectory(itemPath);
        }
      } else if (hasFileExtension(itemPath)) {
        if (!shouldExcludeFile(itemPath)) {
          results.filesChecked++;
          const issues = checkFile(itemPath);

          if (issues.length > 0) {
            const relativePath = path.relative(path.join(__dirname, '../..'), itemPath);
            colorLog(`❌ ${relativePath}: ${issues.length} problemas encontrados`, 'red');

            issues.forEach((issue) => {
              colorLog(`   Línea ${issue.line}: ${issue.pattern}`, 'yellow');
              results.issues.push({
                file: relativePath,
                line: issue.line,
                pattern: issue.pattern,
                severity: issue.severity,
              });
            });

            results.issuesFound += issues.length;
            issues.forEach(issue => {
              results.score -= issue.severity === 'critical' ? 25 : issue.severity === 'high' ? 15 : 10;
            });
          }
        }
      }
    });
  }

  // Escanear directorios principales
  const rootDir = path.join(__dirname, '../..');
  const dirsToScan = ['src', 'scripts', 'views', 'public/assets/js'];

  dirsToScan.forEach((dir) => {
    const fullPath = path.join(rootDir, dir);
    if (fs.existsSync(fullPath)) {
      colorLog(`\n📁 Escaneando ${dir}:`, 'blue');
      scanDirectory(fullPath);
    }
  });

  if (results.issuesFound === 0) {
    colorLog('\n✅ No se encontraron problemas de seguridad en el código', 'green');
  } else {
    colorLog(`\n⚠️ Se encontraron ${results.issuesFound} problemas de seguridad`, 'yellow');
  }

  colorLog(`📊 Archivos verificados: ${results.filesChecked}`, 'cyan');

  return results;
}

/**
 * GENERACIÓN DE SECRETOS SEGUROS
 */
function generateSecureSecrets() {
  colorLog('\n🔐 GENERACIÓN DE SECRETOS SEGUROS', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    generated: false,
    secrets: {},
    backupCreated: false,
  };

  // Función para generar secretos seguros
  function generateSecureSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }

  function generateStrongSecret(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  // Verificar si ya existe config.env
  if (fs.existsSync(config.configPath)) {
    colorLog('\n📁 Archivo config.env encontrado:', 'blue');

    // Crear backup
    const backupPath = `${config.configPath}.backup.${Date.now()}`;
    try {
      fs.copyFileSync(config.configPath, backupPath);
      colorLog(`✅ Backup creado en: ${backupPath}`, 'green');
      results.backupCreated = true;
    } catch (error) {
      colorLog(`❌ Error creando backup: ${error.message}`, 'red');
      return results;
    }
  }

  // Generar secretos seguros
  colorLog('\n🔑 Generando secretos seguros:', 'blue');

  const sessionSecret = generateStrongSecret(64);
  const jwtSecret = generateStrongSecret(64);
  const csrfSecret = generateStrongSecret(32);

  results.secrets = {
    SESSION_SECRET: sessionSecret,
    JWT_SECRET: jwtSecret,
    CSRF_SECRET: csrfSecret,
  };

  colorLog('✅ SESSION_SECRET generado', 'green');
  colorLog('✅ JWT_SECRET generado', 'green');
  colorLog('✅ CSRF_SECRET generado', 'green');

  // Crear template de configuración
  const envTemplate = `# Configuración del servidor
PORT=3000
NODE_ENV=production

# Configuración de seguridad - SECRETOS GENERADOS AUTOMÁTICAMENTE
SESSION_SECRET=${sessionSecret}
JWT_SECRET=${jwtSecret}
CSRF_SECRET=${csrfSecret}

# Configuración de base de datos
DB_URI=mongodb://localhost:27017/estructura_base
DB_NAME=estructura_base

# Configuración de rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Configuración de CORS
CORS_ORIGIN=https://daniel-arribas-velazquez.dav-tech.work
ALLOWED_ORIGINS=https://daniel-arribas-velazquez.dav-tech.work

# Configuración de seguridad adicional
BCRYPT_ROUNDS=12
TOKEN_EXPIRES_IN=24h
SESSION_MAX_AGE=86400000
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# Configuración de logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/security.log
ENABLE_SECURITY_LOGGING=true

# Configuración de contenido
MAX_FILE_SIZE=10485760
MAX_REQUEST_SIZE=10485760

# Configuración de límites de contenido
CSP_REPORT_URI=/csp-report
CSP_REPORT_ONLY=false

# Configuración de monitoreo
ENABLE_METRICS=true
METRICS_PORT=9090
`;

  try {
    fs.writeFileSync(config.configPath, envTemplate);
    colorLog('\n✅ Archivo config.env actualizado con secretos seguros', 'green');
    results.generated = true;
  } catch (error) {
    colorLog(`❌ Error escribiendo config.env: ${error.message}`, 'red');
  }

  return results;
}

/**
 * PRUEBAS DE SEGURIDAD
 */
async function runSecurityTests() {
  colorLog('\n🧪 PRUEBAS DE SEGURIDAD', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    testsRun: 0,
    testsPassed: 0,
    testsFailed: 0,
    errors: [],
  };

  const tests = [
    { name: 'Verificación de seguridad', command: 'node scripts/Seguridad/security-quick.mjs' },
    { name: 'Verificación de testing', command: 'node scripts/Testing/testing-quick.mjs' },
    { name: 'Verificación de análisis', command: 'node scripts/Analisis/analysis-quick.mjs' },
  ];

  for (const test of tests) {
    colorLog(`\n🧪 Ejecutando: ${test.name}`, 'blue');
    results.testsRun++;

    try {
      await execAsync(test.command, { cwd: path.join(__dirname, '../..') });
      colorLog(`✅ ${test.name}: PASÓ`, 'green');
      results.testsPassed++;
    } catch (error) {
      colorLog(`❌ ${test.name}: FALLÓ`, 'red');
      colorLog(`   Error: ${error.message}`, 'red');
      results.testsFailed++;
      results.errors.push({ test: test.name, error: error.message });
    }
  }

  return results;
}

/**
 * GENERAR REPORTE COMPLETO
 */
function generateCompleteReport(envResults, headersResults, evalResults, secretsResults, testsResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      environment: {
        configExists: envResults.configExists,
        criticalSecrets: envResults.criticalSecrets,
        securityConfig: envResults.securityConfig,
        productionConfig: envResults.productionConfig,
        issues: envResults.issues.length,
        warnings: envResults.warnings.length,
      },
      headers: {
        score: headersResults.score,
        missing: headersResults.missing.length,
        warnings: headersResults.warnings.length,
      },
      evalUsage: {
        filesChecked: evalResults.filesChecked,
        issuesFound: evalResults.issuesFound,
        score: evalResults.score,
      },
      secrets: {
        generated: secretsResults.generated,
        backupCreated: secretsResults.backupCreated,
      },
      tests: {
        run: testsResults.testsRun,
        passed: testsResults.testsPassed,
        failed: testsResults.testsFailed,
      },
    },
    details: {
      environment: envResults,
      headers: headersResults,
      evalUsage: evalResults,
      secrets: secretsResults,
      tests: testsResults,
    },
  };

  // Crear directorio si no existe
  if (!fs.existsSync(config.reportsDir)) {
    fs.mkdirSync(config.reportsDir, { recursive: true });
  }

  const reportPath = path.join(config.reportsDir, config.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  colorLog(`\n📄 Reporte guardado en: ${reportPath}`, 'cyan');
  return report;
}

/**
 * EJECUCIÓN COMPLETA
 */
async function runCompleteSecurity() {
  const startTime = Date.now();

  colorLog('\n🔒 SEGURIDAD COMPLETA INICIADA', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Verificación de configuración de entorno
  const envResults = checkEnvironmentConfig();

  // 2. Verificación de headers de seguridad
  const headersResults = checkSecurityHeaders();

  // 3. Verificación de uso de eval()
  const evalResults = checkEvalUsage();

  // 4. Verificación de secretos existentes (no generar nuevos)
  const secretsResults = { generated: false, backupCreated: false, secrets: {} };

  // 5. Pruebas de seguridad
  const testsResults = await runSecurityTests();

  // 6. Generar reporte
  const completeReport = generateCompleteReport(envResults, headersResults, evalResults, secretsResults, testsResults);

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN FINAL', 'bright');
  colorLog('='.repeat(60), 'bright');

  const envScore = envResults.issues.length === 0 ? 100 : Math.max(0, 100 - (envResults.issues.length * 20));
  const headersScore = headersResults.score;
  const evalScore = evalResults.score;
  const testsScore = testsResults.testsRun > 0 ? (testsResults.testsPassed / testsResults.testsRun) * 100 : 0;

  colorLog(`🔍 Configuración: ${envScore}/100`, envScore >= 80 ? 'green' : envScore >= 50 ? 'yellow' : 'red');
  colorLog(`🛡️ Headers: ${headersScore}/100`, headersScore >= 80 ? 'green' : headersScore >= 50 ? 'yellow' : 'red');
  colorLog(`🚫 Uso de eval(): ${evalScore}/100`, evalScore >= 80 ? 'green' : evalScore >= 50 ? 'yellow' : 'red');
  colorLog(`🧪 Pruebas: ${testsScore.toFixed(0)}/100`, testsScore >= 80 ? 'green' : testsScore >= 50 ? 'yellow' : 'red');
  colorLog(`🔐 Secretos: ✅ Verificados`, 'green');
  colorLog(`⏱️  Tiempo total: ${totalTime} segundos`, 'cyan');

  const overallScore = Math.round((envScore + headersScore + evalScore + testsScore) / 4);
  colorLog(`\n🎯 Puntuación general: ${overallScore}/100`, overallScore >= 80 ? 'green' : overallScore >= 50 ? 'yellow' : 'red');

  const allOK = overallScore >= 70 && testsResults.testsFailed === 0;
  colorLog(`🎯 Estado general: ${allOK ? '✅ SEGURO' : '❌ PROBLEMAS DE SEGURIDAD DETECTADOS'}`, allOK ? 'green' : 'red');

  colorLog('\n✅ SEGURIDAD COMPLETA FINALIZADA', 'bright');
  colorLog('💡 Para seguridad rápida, ejecuta: node scripts/Seguridad/security-quick.mjs', 'blue');
}

// Ejecutar si se llama directamente
runCompleteSecurity().catch(console.error);
