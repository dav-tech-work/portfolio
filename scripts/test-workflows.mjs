#!/usr/bin/env node

/**
 * Script para Probar Workflows Localmente
 * @description Simula las condiciones de CI/CD sin necesidad de servicios externos
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
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
 * Simula las verificaciones de los workflows
 */
class WorkflowTester {
  constructor() {
    this.results = {
      security: { passed: false, issues: [] },
      codeQuality: { passed: false, issues: [] },
      testing: { passed: false, issues: [] },
      projectStructure: { passed: false, issues: [] },
      dependencies: { passed: false, issues: [] },
      configuration: { passed: false, issues: [] },
      build: { passed: false, issues: [] },
    };
  }

  /**
   * Ejecuta todas las verificaciones
   */
  async runAllTests() {
    colorLog('\n🔍 ======================================', 'cyan');
    colorLog('🔄 SIMULACIÓN DE WORKFLOWS', 'bright');
    colorLog('🔍 ======================================', 'cyan');

    await this.testSecurityChecks();
    await this.testCodeQuality();
    await this.testProjectStructure();
    await this.testDependencies();
    await this.testConfiguration();
    await this.testBuild();

    this.displaySummary();
  }

  /**
   * Simula verificaciones de seguridad
   */
  async testSecurityChecks() {
    colorLog('\n🔒 Verificaciones de Seguridad:', 'yellow');

    try {
      // Verificar archivo de lock
      await execAsync('node scripts/check-lockfile.mjs');
      colorLog('  ✅ Verificación de archivo de lock', 'green');
    } catch (error) {
      this.results.security.issues.push('Error en check-lockfile.mjs');
      colorLog('  ❌ Error en check-lockfile.mjs', 'red');
    }

    try {
      // Verificar configuración de seguridad
      await execAsync('node scripts/security-check.mjs');
      colorLog('  ✅ Verificación de seguridad', 'green');
    } catch (error) {
      this.results.security.issues.push('Error en security-check.mjs');
      colorLog('  ❌ Error en security-check.mjs', 'red');
    }

    try {
      // Verificar secretos
      await execAsync('node scripts/generate-secrets.mjs');
      colorLog('  ✅ Generación de secretos', 'green');
    } catch (error) {
      this.results.security.issues.push('Error en generate-secrets.mjs');
      colorLog('  ❌ Error en generate-secrets.mjs', 'red');
    }

    this.results.security.passed = this.results.security.issues.length === 0;
  }

  /**
   * Simula verificaciones de calidad de código
   */
  async testCodeQuality() {
    colorLog('\n📝 Calidad de Código:', 'yellow');

    try {
      // Verificar ESLint
      await execAsync('npm run lint');
      colorLog('  ✅ ESLint (Backend)', 'green');
    } catch (error) {
      this.results.codeQuality.issues.push('ESLint backend falló');
      colorLog('  ⚠️ ESLint backend con warnings', 'yellow');
    }

    try {
      // Verificar ESLint frontend
      await execAsync('npm run lint:frontend');
      colorLog('  ✅ ESLint (Frontend)', 'green');
    } catch (error) {
      this.results.codeQuality.issues.push('ESLint frontend falló');
      colorLog('  ⚠️ ESLint frontend con warnings', 'yellow');
    }

    try {
      // Verificar Prettier
      await execAsync('npm run format:check');
      colorLog('  ✅ Prettier', 'green');
    } catch (error) {
      this.results.codeQuality.issues.push('Prettier falló');
      colorLog('  ❌ Prettier falló', 'red');
    }

    this.results.codeQuality.passed = this.results.codeQuality.issues.length === 0;
  }

  /**
   * Simula verificaciones de estructura del proyecto
   */
  async testProjectStructure() {
    colorLog('\n📁 Estructura del Proyecto:', 'yellow');

    try {
      // Verificar estructura
      await execAsync('npm run verificar');
      colorLog('  ✅ Verificación de estructura', 'green');
    } catch (error) {
      this.results.projectStructure.issues.push('Verificación de estructura falló');
      colorLog('  ❌ Verificación de estructura falló', 'red');
    }

    this.results.projectStructure.passed = this.results.projectStructure.issues.length === 0;
  }

  /**
   * Simula verificaciones de dependencias
   */
  async testDependencies() {
    colorLog('\n📦 Verificación de Dependencias:', 'yellow');

    try {
      // Verificar dependencias desactualizadas
      await execAsync('npm outdated');
      colorLog('  ✅ Verificación de dependencias', 'green');
    } catch (error) {
      if (error.stdout && error.stdout.includes('Package')) {
        colorLog('  ⚠️ Dependencias desactualizadas encontradas', 'yellow');
      } else {
        this.results.dependencies.issues.push('Error verificando dependencias');
        colorLog('  ❌ Error verificando dependencias', 'red');
      }
    }

    try {
      // Verificar vulnerabilidades
      await execAsync('npm audit --audit-level moderate');
      colorLog('  ✅ Auditoría de dependencias', 'green');
    } catch (error) {
      this.results.dependencies.issues.push('Auditoría de dependencias falló');
      colorLog('  ⚠️ Auditoría de dependencias con warnings', 'yellow');
    }

    this.results.dependencies.passed = this.results.dependencies.issues.length === 0;
  }

  /**
   * Simula verificaciones de configuración
   */
  async testConfiguration() {
    colorLog('\n⚙️ Verificación de Configuración:', 'yellow');

    const projectRoot = path.join(__dirname, '..');
    const configFiles = ['config.env.example', '.eslintrc.json', 'package.json'];

    for (const file of configFiles) {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        colorLog(`  ✅ ${file}`, 'green');
      } else {
        this.results.configuration.issues.push(`Archivo ${file} no encontrado`);
        colorLog(`  ❌ ${file} no encontrado`, 'red');
      }
    }

    // Verificar variables de entorno críticas
    try {
      const configExample = fs.readFileSync(path.join(projectRoot, 'config.env.example'), 'utf8');
      const criticalVars = ['SESSION_SECRET', 'JWT_SECRET'];

      for (const varName of criticalVars) {
        if (configExample.includes(varName)) {
          colorLog(`  ✅ ${varName} configurada`, 'green');
        } else {
          this.results.configuration.issues.push(`${varName} no encontrada`);
          colorLog(`  ❌ ${varName} no encontrada`, 'red');
        }
      }
    } catch (error) {
      this.results.configuration.issues.push('Error leyendo config.env.example');
      colorLog('  ❌ Error leyendo config.env.example', 'red');
    }

    this.results.configuration.passed = this.results.configuration.issues.length === 0;
  }

  /**
   * Simula verificaciones de build
   */
  async testBuild() {
    colorLog('\n🏗️ Verificación de Build:', 'yellow');

    try {
      // Verificar que la aplicación puede iniciarse
      await execAsync('npm run build');
      colorLog('  ✅ Build exitoso', 'green');
    } catch (error) {
      this.results.build.issues.push('Build falló');
      colorLog('  ❌ Build falló', 'red');
    }

    this.results.build.passed = this.results.build.issues.length === 0;
  }

  /**
   * Muestra el resumen de resultados
   */
  displaySummary() {
    colorLog('\n📊 ======================================', 'cyan');
    colorLog('📋 RESUMEN DE WORKFLOWS', 'bright');
    colorLog('📊 ======================================', 'cyan');

    const allPassed = Object.values(this.results).every((result) => result.passed);

    if (allPassed) {
      colorLog('\n🎉 ¡Todos los workflows están listos!', 'green');
      colorLog('✅ Los workflows deberían ejecutarse sin problemas en GitHub Actions', 'green');
    } else {
      colorLog('\n⚠️ Se encontraron problemas en algunos workflows:', 'yellow');

      Object.entries(this.results).forEach(([name, result]) => {
        if (!result.passed) {
          colorLog(`\n❌ ${name}:`, 'red');
          result.issues.forEach((issue) => {
            colorLog(`  - ${issue}`, 'red');
          });
        } else {
          colorLog(`\n✅ ${name}: OK`, 'green');
        }
      });
    }

    colorLog('\n💡 Recomendaciones:', 'blue');
    colorLog('  🔄 Ejecuta este script antes de hacer push', 'cyan');
    colorLog('  🧪 Los workflows reales pueden tener resultados diferentes', 'cyan');
    colorLog('  📝 Revisa los logs de GitHub Actions si hay fallos', 'cyan');
  }
}

// Ejecutar si se llama directamente
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].includes('test-workflows.mjs')
) {
  const tester = new WorkflowTester();
  tester
    .runAllTests()
    .then(() => {
      const allPassed = Object.values(tester.results).every((result) => result.passed);
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      colorLog(`❌ Error durante la prueba: ${error.message}`, 'red');
      process.exit(1);
    });
}

export { WorkflowTester };
