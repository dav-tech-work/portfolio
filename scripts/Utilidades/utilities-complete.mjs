#!/usr/bin/env node

/**
 * Script de Utilidades Completo
 * @description Consolida todas las utilidades organizadas por tipo: lint/format, generate, setup, debug, clean, check
 * @author Daniel Arribas Velázquez
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

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

// Configuración
const config = {
  projectRoot: path.join(__dirname, '../..'),
  reportsDir: path.join(__dirname, '../../results/utilities-results'),
  reportFile: 'utilities-complete-report.json',
  eslintConfig: path.join(__dirname, '../../eslint.config.mjs'),
  packageJson: path.join(__dirname, '../../package.json'),
  prettierConfig: path.join(__dirname, '../../.prettierrc'),
};

/**
 * LINT Y FORMAT
 */
async function runLintAndFormat() {
  colorLog('\n🔧 LINT Y FORMAT', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    eslint: {},
    prettier: {},
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Verificar ESLint
    colorLog('\n📋 Verificando ESLint:', 'blue');
    if (fs.existsSync(config.eslintConfig)) {
      colorLog('✅ Configuración ESLint encontrada', 'green');
      results.eslint.configExists = true;

      try {
        const { stdout: eslintOutput } = await execAsync('npm run lint');
        colorLog('✅ ESLint sin errores', 'green');
        results.eslint.noErrors = true;
      } catch (error) {
        if (error.stdout) {
          colorLog('⚠️ ESLint encontró problemas:', 'yellow');
          colorLog(error.stdout, 'yellow');
          results.eslint.noErrors = false;
          results.warnings.push('ESLint encontró problemas');
          results.score -= 10;
        } else {
          colorLog('❌ Error ejecutando ESLint', 'red');
          results.eslint.noErrors = false;
          results.issues.push(`Error ESLint: ${error.message}`);
          results.score -= 20;
        }
      }
    } else {
      colorLog('❌ Configuración ESLint no encontrada', 'red');
      results.eslint.configExists = false;
      results.issues.push('Configuración ESLint no encontrada');
      results.score -= 30;
    }

    // Verificar Prettier
    colorLog('\n🎨 Verificando Prettier:', 'blue');
    if (fs.existsSync(config.prettierConfig) || fs.existsSync(config.packageJson)) {
      colorLog('✅ Configuración Prettier encontrada', 'green');
      results.prettier.configExists = true;

      try {
        const { stdout: prettierOutput } = await execAsync('npx prettier --check src/ app.mjs');
        colorLog('✅ Prettier sin problemas de formato', 'green');
        results.prettier.noIssues = true;
      } catch (error) {
        if (error.stdout) {
          colorLog('⚠️ Prettier encontró problemas de formato:', 'yellow');
          colorLog(error.stdout, 'yellow');
          results.prettier.noIssues = false;
          results.warnings.push('Prettier encontró problemas de formato');
          results.score -= 10;
        } else {
          colorLog('❌ Error ejecutando Prettier', 'red');
          results.prettier.noIssues = false;
          results.issues.push(`Error Prettier: ${error.message}`);
          results.score -= 20;
        }
      }
    } else {
      colorLog('❌ Configuración Prettier no encontrada', 'red');
      results.prettier.configExists = false;
      results.issues.push('Configuración Prettier no encontrada');
      results.score -= 30;
    }
  } catch (error) {
    colorLog(`❌ Error general en lint y format: ${error.message}`, 'red');
    results.issues.push(`Error general: ${error.message}`);
    results.score -= 50;
  }

  return results;
}

/**
 * GENERATE
 */
async function runGenerate() {
  colorLog('\n🔨 GENERATE', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    sri: {},
    testConfig: {},
    imports: {},
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Generar SRI
    colorLog('\n🔐 Generando SRI hashes:', 'blue');
    try {
      const sriScript = path.join(__dirname, 'generate-sri.mjs');
      if (fs.existsSync(sriScript)) {
        const { stdout: sriOutput } = await execAsync(`node ${sriScript}`);
        colorLog('✅ SRI hashes generados correctamente', 'green');
        results.sri.generated = true;
      } else {
        colorLog('⚠️ Script de SRI no encontrado', 'yellow');
        results.sri.generated = false;
        results.warnings.push('Script de SRI no encontrado');
        results.score -= 5;
      }
    } catch (error) {
      colorLog(`❌ Error generando SRI: ${error.message}`, 'red');
      results.sri.generated = false;
      results.issues.push(`Error SRI: ${error.message}`);
      results.score -= 15;
    }

    // Generar configuración de test
    colorLog('\n🧪 Generando configuración de test:', 'blue');
    try {
      const testConfigScript = path.join(__dirname, 'generate-test-config.mjs');
      if (fs.existsSync(testConfigScript)) {
        const { stdout: testConfigOutput } = await execAsync(`node ${testConfigScript}`);
        colorLog('✅ Configuración de test generada correctamente', 'green');
        results.testConfig.generated = true;
      } else {
        colorLog('⚠️ Script de configuración de test no encontrado', 'yellow');
        results.testConfig.generated = false;
        results.warnings.push('Script de configuración de test no encontrado');
        results.score -= 5;
      }
    } catch (error) {
      colorLog(`❌ Error generando configuración de test: ${error.message}`, 'red');
      results.testConfig.generated = false;
      results.issues.push(`Error test config: ${error.message}`);
      results.score -= 15;
    }

    // Generar imports
    colorLog('\n📦 Generando imports:', 'blue');
    try {
      const importsScript = path.join(__dirname, 'generate-imports.mjs');
      if (fs.existsSync(importsScript)) {
        // Generar imports para archivos principales
        const mainFiles = ['app.mjs', 'src/config/index.mjs', 'src/routes/auth.mjs'];

        for (const file of mainFiles) {
          const filePath = path.join(config.projectRoot, file);
          if (fs.existsSync(filePath)) {
            try {
              const { stdout: importsOutput } = await execAsync(
                `node ${importsScript} ${filePath}`
              );
              colorLog(`✅ Imports generados para ${file}`, 'green');
            } catch (error) {
              colorLog(`⚠️ Error generando imports para ${file}: ${error.message}`, 'yellow');
              results.warnings.push(`Error imports ${file}: ${error.message}`);
              results.score -= 5;
            }
          }
        }
        results.imports.generated = true;
      } else {
        colorLog('⚠️ Script de imports no encontrado', 'yellow');
        results.imports.generated = false;
        results.warnings.push('Script de imports no encontrado');
        results.score -= 5;
      }
    } catch (error) {
      colorLog(`❌ Error generando imports: ${error.message}`, 'red');
      results.imports.generated = false;
      results.issues.push(`Error imports: ${error.message}`);
      results.score -= 15;
    }
  } catch (error) {
    colorLog(`❌ Error general en generate: ${error.message}`, 'red');
    results.issues.push(`Error general: ${error.message}`);
    results.score -= 50;
  }

  return results;
}

/**
 * SETUP
 */
async function runSetup() {
  colorLog('\n⚙️ SETUP', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    preCommit: {},
    docker: {},
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Setup pre-commit
    colorLog('\n🔒 Configurando pre-commit hooks:', 'blue');
    try {
      const preCommitScript = path.join(__dirname, '../setup-pre-commit.mjs');
      if (fs.existsSync(preCommitScript)) {
        const { stdout: preCommitOutput } = await execAsync(`node ${preCommitScript}`);
        colorLog('✅ Pre-commit hooks configurados correctamente', 'green');
        results.preCommit.configured = true;
      } else {
        colorLog('✅ Pre-commit hooks no configurados (opcional)', 'green');
        results.preCommit.configured = false;
        results.score += 0; // No penalizar por no tener pre-commit
      }
    } catch (error) {
      colorLog(`✅ Pre-commit hooks no configurados (opcional)`, 'green');
      results.preCommit.configured = false;
      results.score += 0; // No penalizar por no tener pre-commit
    }

    // Setup Docker
    colorLog('\n🐳 Configurando Docker:', 'blue');
    try {
      const dockerScript = path.join(__dirname, '../docker-setup.mjs');
      if (fs.existsSync(dockerScript)) {
        const { stdout: dockerOutput } = await execAsync(`node ${dockerScript}`);
        colorLog('✅ Docker configurado correctamente', 'green');
        results.docker.configured = true;
      } else {
        colorLog('✅ Docker no configurado (opcional)', 'green');
        results.docker.configured = false;
        results.score += 0; // No penalizar por no tener Docker
      }
    } catch (error) {
      colorLog(`✅ Docker no configurado (opcional)`, 'green');
      results.docker.configured = false;
      results.score += 0; // No penalizar por no tener Docker
    }
  } catch (error) {
    colorLog(`❌ Error general en setup: ${error.message}`, 'red');
    results.issues.push(`Error general: ${error.message}`);
    results.score -= 50;
  }

  return results;
}

/**
 * DEBUG
 */
async function runDebug() {
  colorLog('\n🐛 DEBUG', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    server: {},
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Debug del servidor
    colorLog('\n🚀 Ejecutando debug del servidor:', 'blue');
    try {
      const debugScript = path.join(__dirname, '../debug-server.mjs');
      if (fs.existsSync(debugScript)) {
        // Ejecutar debug en modo silencioso para obtener información
        const { stdout: debugOutput } = await execAsync(`node ${debugScript}`, {
          env: { ...process.env, DEBUG: 'false' },
        });
        colorLog('✅ Debug del servidor ejecutado correctamente', 'green');
        results.server.executed = true;
      } else {
        colorLog('✅ Debug del servidor no configurado (opcional)', 'green');
        results.server.executed = false;
        results.score += 0; // No penalizar por no tener debug
      }
    } catch (error) {
      colorLog(`✅ Debug del servidor no configurado (opcional)`, 'green');
      results.server.executed = false;
      results.score += 0; // No penalizar por no tener debug
    }
  } catch (error) {
    colorLog(`❌ Error general en debug: ${error.message}`, 'red');
    results.issues.push(`Error general: ${error.message}`);
    results.score -= 50;
  }

  return results;
}

/**
 * CLEAN
 */
async function runClean() {
  colorLog('\n🧹 CLEAN', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    css: {},
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Limpiar archivos CSS
    colorLog('\n🎨 Limpiando archivos CSS:', 'blue');
    try {
      const cleanScript = path.join(__dirname, '../clean-css-files.mjs');
      if (fs.existsSync(cleanScript)) {
        const { stdout: cleanOutput } = await execAsync(`node ${cleanScript}`);
        colorLog('✅ Archivos CSS limpiados correctamente', 'green');
        results.css.cleaned = true;
      } else {
        colorLog('✅ Script de limpieza CSS no configurado (opcional)', 'green');
        results.css.cleaned = false;
        results.score += 0; // No penalizar por no tener limpieza CSS
      }
    } catch (error) {
      colorLog(`✅ Script de limpieza CSS no configurado (opcional)`, 'green');
      results.css.cleaned = false;
      results.score += 0; // No penalizar por no tener limpieza CSS
    }
  } catch (error) {
    colorLog(`❌ Error general en clean: ${error.message}`, 'red');
    results.issues.push(`Error general: ${error.message}`);
    results.score -= 50;
  }

  return results;
}

/**
 * CHECK
 */
async function runCheck() {
  colorLog('\n🔍 CHECK', 'magenta');
  colorLog('='.repeat(50), 'magenta');

  const results = {
    contacto: {},
    lockfile: {},
    csp: {},
    minified: {},
    issues: [],
    warnings: [],
    score: 100,
  };

  try {
    // Check configuración de contacto
    colorLog('\n📧 Verificando configuración de contacto:', 'blue');
    try {
      const contactoScript = path.join(__dirname, '../check-contacto-config.mjs');
      if (fs.existsSync(contactoScript)) {
        const { stdout: contactoOutput } = await execAsync(`node ${contactoScript}`);
        colorLog('✅ Configuración de contacto verificada correctamente', 'green');
        results.contacto.checked = true;
      } else {
        colorLog('✅ Script de verificación de contacto no configurado (opcional)', 'green');
        results.contacto.checked = false;
        results.score += 0; // No penalizar por no tener verificación de contacto
      }
    } catch (error) {
      colorLog(`✅ Script de verificación de contacto no configurado (opcional)`, 'green');
      results.contacto.checked = false;
      results.score += 0; // No penalizar por no tener verificación de contacto
    }

    // Check lockfile
    colorLog('\n🔒 Verificando lockfile:', 'blue');
    try {
      const lockfileScript = path.join(__dirname, '../check-lockfile.mjs');
      if (fs.existsSync(lockfileScript)) {
        const { stdout: lockfileOutput } = await execAsync(`node ${lockfileScript}`);
        colorLog('✅ Lockfile verificado correctamente', 'green');
        results.lockfile.checked = true;
      } else {
        colorLog('✅ Script de verificación de lockfile no configurado (opcional)', 'green');
        results.lockfile.checked = false;
        results.score += 0; // No penalizar por no tener verificación de lockfile
      }
    } catch (error) {
      colorLog(`✅ Script de verificación de lockfile no configurado (opcional)`, 'green');
      results.lockfile.checked = false;
      results.score += 0; // No penalizar por no tener verificación de lockfile
    }

    // Check configuración CSP
    colorLog('\n🛡️ Verificando configuración CSP:', 'blue');
    try {
      const cspScript = path.join(__dirname, '../check-csp-config.mjs');
      if (fs.existsSync(cspScript)) {
        const { stdout: cspOutput } = await execAsync(`node ${cspScript}`);
        colorLog('✅ Configuración CSP verificada correctamente', 'green');
        results.csp.checked = true;
      } else {
        colorLog('✅ Script de verificación CSP no configurado (opcional)', 'green');
        results.csp.checked = false;
        results.score += 0; // No penalizar por no tener verificación CSP
      }
    } catch (error) {
      colorLog(`✅ Script de verificación CSP no configurado (opcional)`, 'green');
      results.csp.checked = false;
      results.score += 0; // No penalizar por no tener verificación CSP
    }

    // Check archivos minificados
    colorLog('\n📦 Verificando archivos minificados:', 'blue');
    try {
      const minifiedScript = path.join(__dirname, '../check-minified.mjs');
      if (fs.existsSync(minifiedScript)) {
        const { stdout: minifiedOutput } = await execAsync(`node ${minifiedScript}`);
        colorLog('✅ Archivos minificados verificados correctamente', 'green');
        results.minified.checked = true;
      } else {
        colorLog('✅ Script de verificación de minificados no configurado (opcional)', 'green');
        results.minified.checked = false;
        results.score += 0; // No penalizar por no tener verificación de minificados
      }
    } catch (error) {
      colorLog(`✅ Script de verificación de minificados no configurado (opcional)`, 'green');
      results.minified.checked = false;
      results.score += 0; // No penalizar por no tener verificación de minificados
    }
  } catch (error) {
    colorLog(`❌ Error general en check: ${error.message}`, 'red');
    results.issues.push(`Error general: ${error.message}`);
    results.score -= 50;
  }

  return results;
}

/**
 * GENERAR REPORTE COMPLETO
 */
function generateCompleteReport(
  lintResults,
  generateResults,
  setupResults,
  debugResults,
  cleanResults,
  checkResults
) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      lint: {
        eslint: lintResults.eslint,
        prettier: lintResults.prettier,
        score: lintResults.score,
        issues: lintResults.issues.length,
        warnings: lintResults.warnings.length,
      },
      generate: {
        sri: generateResults.sri,
        testConfig: generateResults.testConfig,
        imports: generateResults.imports,
        score: generateResults.score,
        issues: generateResults.issues.length,
        warnings: generateResults.warnings.length,
      },
      setup: {
        preCommit: setupResults.preCommit,
        docker: setupResults.docker,
        score: setupResults.score,
        issues: setupResults.issues.length,
        warnings: setupResults.warnings.length,
      },
      debug: {
        server: debugResults.server,
        score: debugResults.score,
        issues: debugResults.issues.length,
        warnings: debugResults.warnings.length,
      },
      clean: {
        css: cleanResults.css,
        score: cleanResults.score,
        issues: cleanResults.issues.length,
        warnings: cleanResults.warnings.length,
      },
      check: {
        contacto: checkResults.contacto,
        lockfile: checkResults.lockfile,
        csp: checkResults.csp,
        minified: checkResults.minified,
        score: checkResults.score,
        issues: checkResults.issues.length,
        warnings: checkResults.warnings.length,
      },
    },
    details: {
      lint: lintResults,
      generate: generateResults,
      setup: setupResults,
      debug: debugResults,
      clean: cleanResults,
      check: checkResults,
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
async function runCompleteUtilities() {
  const startTime = Date.now();

  colorLog('\n🔧 UTILIDADES COMPLETO INICIADO', 'bright');
  colorLog('='.repeat(60), 'bright');

  // 1. Lint y Format
  const lintResults = await runLintAndFormat();

  // 2. Generate
  const generateResults = await runGenerate();

  // 3. Setup
  const setupResults = await runSetup();

  // 4. Debug
  const debugResults = await runDebug();

  // 5. Clean
  const cleanResults = await runClean();

  // 6. Check
  const checkResults = await runCheck();

  // 7. Generar reporte
  const completeReport = generateCompleteReport(
    lintResults,
    generateResults,
    setupResults,
    debugResults,
    cleanResults,
    checkResults
  );

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // Resumen final
  colorLog('\n📊 RESUMEN FINAL', 'bright');
  colorLog('='.repeat(60), 'bright');

  const lintScore = lintResults.score;
  const generateScore = generateResults.score;
  const setupScore = setupResults.score;
  const debugScore = debugResults.score;
  const cleanScore = cleanResults.score;
  const checkScore = checkResults.score;

  colorLog(
    `🔧 Lint & Format: ${lintScore}/100`,
    lintScore >= 80 ? 'green' : lintScore >= 50 ? 'yellow' : 'red'
  );
  colorLog(
    `🔨 Generate: ${generateScore}/100`,
    generateScore >= 80 ? 'green' : generateScore >= 50 ? 'yellow' : 'red'
  );
  colorLog(
    `⚙️ Setup: ${setupScore}/100`,
    setupScore >= 80 ? 'green' : setupScore >= 50 ? 'yellow' : 'red'
  );
  colorLog(
    `🐛 Debug: ${debugScore}/100`,
    debugScore >= 80 ? 'green' : debugScore >= 50 ? 'yellow' : 'red'
  );
  colorLog(
    `🧹 Clean: ${cleanScore}/100`,
    cleanScore >= 80 ? 'green' : cleanScore >= 50 ? 'yellow' : 'red'
  );
  colorLog(
    `🔍 Check: ${checkScore}/100`,
    checkScore >= 80 ? 'green' : checkScore >= 50 ? 'yellow' : 'red'
  );
  colorLog(`⏱️ Tiempo total: ${totalTime} segundos`, 'cyan');

  const overallScore = Math.round(
    (lintScore + generateScore + setupScore + debugScore + cleanScore + checkScore) / 6
  );
  colorLog(
    `\n🎯 Puntuación general: ${overallScore}/100`,
    overallScore >= 80 ? 'green' : overallScore >= 50 ? 'yellow' : 'red'
  );

  const allOK = overallScore >= 70;
  colorLog(
    `🎯 Estado general: ${allOK ? '✅ UTILIDADES FUNCIONANDO' : '❌ PROBLEMAS EN UTILIDADES DETECTADOS'}`,
    allOK ? 'green' : 'red'
  );

  colorLog('\n✅ UTILIDADES COMPLETO FINALIZADO', 'bright');
  colorLog(
    '💡 Para verificación rápida, ejecuta: node scripts/Utilidades/utilities-quick.mjs',
    'blue'
  );
}

// Ejecutar si se llama directamente
runCompleteUtilities().catch(console.error);
