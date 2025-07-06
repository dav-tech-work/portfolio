#!/usr/bin/env node

/**
 * Script para Verificar Workflows de GitHub Actions
 * @description Verifica que todos los comandos y scripts referenciados en los workflows existan
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para la consola
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
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    colorLog(`✅ ${description}: ${filePath}`, 'green');
    return true;
  } else {
    colorLog(`❌ ${description}: ${filePath} NO ENCONTRADO`, 'red');
    return false;
  }
}

/**
 * Verifica que un comando npm existe en package.json
 */
function checkNpmScript(scriptName, description) {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
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
 * Verifica que un workflow existe
 */
function checkWorkflow(workflowName, description) {
  const workflowPath = `.github/workflows/${workflowName}`;
  return checkFileExists(workflowPath, description);
}

/**
 * Verifica comandos npx
 */
function checkNpxCommand(command, description) {
  colorLog(`⚠️  ${description}: npx ${command} (requiere instalación)`, 'yellow');
  return true; // Asumimos que se puede instalar
}

/**
 * Verificación principal
 */
async function verifyWorkflows() {
  colorLog('\n🔍 ======================================', 'cyan');
  colorLog('🔄 VERIFICACIÓN DE WORKFLOWS', 'bright');
  colorLog('🔍 ======================================', 'cyan');

  let allChecksPassed = true;

  // Verificar workflows
  colorLog('\n📁 Verificando workflows:', 'blue');
  allChecksPassed &= checkWorkflow('ci-simple.yml', 'Workflow CI/CD Principal');
  allChecksPassed &= checkWorkflow('security-scan.yml', 'Workflow de Seguridad');
  allChecksPassed &= checkWorkflow('performance.yml', 'Workflow de Performance');

  // Verificar scripts referenciados en workflows
  colorLog('\n📜 Verificando scripts:', 'blue');
  allChecksPassed &= checkFileExists('scripts/check-lockfile.mjs', 'Script check-lockfile');
  allChecksPassed &= checkFileExists('scripts/security-check.mjs', 'Script security-check');
  allChecksPassed &= checkFileExists('scripts/generate-secrets.mjs', 'Script generate-secrets');
  allChecksPassed &= checkFileExists(
    'scripts/generate-test-config.mjs',
    'Script generate-test-config'
  );
  allChecksPassed &= checkFileExists('scripts/performance-test.mjs', 'Script performance-test');
  allChecksPassed &= checkFileExists(
    'scripts/pre-performance-check.mjs',
    'Script pre-performance-check'
  );
  allChecksPassed &= checkFileExists('scripts/fix-eslint-issues.mjs', 'Script fix-eslint-issues');
  allChecksPassed &= checkFileExists('scripts/quick-fix.mjs', 'Script quick-fix');
  allChecksPassed &= checkFileExists('scripts/health-check.mjs', 'Script health-check');
  allChecksPassed &= checkFileExists('scripts/init-database.mjs', 'Script init-database');
  allChecksPassed &= checkFileExists('scripts/database-status.mjs', 'Script database-status');

  // Verificar comandos npm
  colorLog('\n📦 Verificando comandos npm:', 'blue');
  allChecksPassed &= checkNpmScript('security:check', 'Comando security:check');
  allChecksPassed &= checkNpmScript(
    'security:generate-secrets',
    'Comando security:generate-secrets'
  );
  allChecksPassed &= checkNpmScript('security:audit', 'Comando security:audit');
  allChecksPassed &= checkNpmScript('lint', 'Comando lint');
  allChecksPassed &= checkNpmScript('lint:frontend', 'Comando lint:frontend');
  allChecksPassed &= checkNpmScript('format:check', 'Comando format:check');
  allChecksPassed &= checkNpmScript('test', 'Comando test');
  allChecksPassed &= checkNpmScript('test:security', 'Comando test:security');
  allChecksPassed &= checkNpmScript('test:coverage', 'Comando test:coverage');
  allChecksPassed &= checkNpmScript('test:performance', 'Comando test:performance');
  allChecksPassed &= checkNpmScript('verificar', 'Comando verificar');
  allChecksPassed &= checkNpmScript('build', 'Comando build');
  allChecksPassed &= checkNpmScript('performance:check', 'Comando performance:check');
  allChecksPassed &= checkNpmScript('performance:test', 'Comando performance:test');

  // Verificar archivos de configuración
  colorLog('\n⚙️  Verificando archivos de configuración:', 'blue');
  allChecksPassed &= checkFileExists('config.env.example', 'Archivo config.env.example');
  allChecksPassed &= checkFileExists('.eslintrc.json', 'Archivo .eslintrc.json');
  allChecksPassed &= checkFileExists(
    'public/assets/js/.eslintrc.json',
    'Archivo .eslintrc.json frontend'
  );

  // Verificar comandos npx
  colorLog('\n🔧 Verificando comandos npx:', 'blue');
  checkNpxCommand('license-checker --summary', 'Comando license-checker');
  checkNpxCommand('npm-check-duplicates', 'Comando npm-check-duplicates');

  // Verificar directorios necesarios
  colorLog('\n📂 Verificando directorios:', 'blue');
  allChecksPassed &= checkFileExists('test/', 'Directorio test');
  allChecksPassed &= checkFileExists('test/security/', 'Directorio test/security');
  allChecksPassed &= checkFileExists('test/performance/', 'Directorio test/performance');
  allChecksPassed &= checkFileExists('src/', 'Directorio src');
  allChecksPassed &= checkFileExists('public/', 'Directorio public');

  // Resumen final
  colorLog('\n📊 ======================================', 'cyan');
  colorLog('📋 RESUMEN DE VERIFICACIÓN', 'bright');
  colorLog('📊 ======================================', 'cyan');

  if (allChecksPassed) {
    colorLog('🎉 ¡Todos los workflows están correctamente configurados!', 'green');
    colorLog('✅ Los workflows deberían ejecutarse sin problemas en GitHub Actions', 'green');
  } else {
    colorLog('⚠️  Se encontraron algunos problemas en la configuración', 'yellow');
    colorLog('🔧 Revisa los elementos marcados con ❌ antes de hacer push', 'yellow');
  }

  colorLog('\n💡 Consejos:', 'blue');
  colorLog('  🔄 Ejecuta este script antes de hacer push a main/develop', 'cyan');
  colorLog('  🧪 Prueba los workflows localmente con: act', 'cyan');
  colorLog('  📝 Revisa los logs de GitHub Actions si hay fallos', 'cyan');

  return allChecksPassed;
}

// Ejecutar verificación
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].includes('verify-workflows.mjs')
) {
  verifyWorkflows()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      colorLog(`❌ Error durante la verificación: ${error.message}`, 'red');
      process.exit(1);
    });
}

// Exportar la función para uso como módulo
export { verifyWorkflows };
