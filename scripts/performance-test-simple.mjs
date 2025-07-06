#!/usr/bin/env node

/**
 * Script de Testing de Rendimiento Simplificado para GitHub Actions
 * @description Verifica la configuración sin requerir servidor en ejecución
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

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
 * Clase para testing de rendimiento simplificado
 */
class SimplePerformanceTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      system: this.getSystemInfo(),
      checks: [],
      warnings: [],
      errors: [],
      recommendations: [],
    };
  }

  /**
   * Obtiene información del sistema
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      type: os.type(),
      arch: os.arch(),
      release: os.release(),
      nodeVersion: process.version,
      memory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
    };
  }

  /**
   * Ejecuta verificaciones básicas
   */
  async runChecks() {
    colorLog('\n🚀 ======================================', 'cyan');
    colorLog('🔧 Tests de Rendimiento Simplificados', 'bright');
    colorLog('🚀 ======================================', 'cyan');

    // Mostrar información del sistema
    const systemInfo = this.getSystemInfo();
    colorLog(`\n📋 INFORMACIÓN DEL SISTEMA:`, 'yellow');
    colorLog(`  🖥️  SO: ${systemInfo.type} ${systemInfo.arch} (${systemInfo.platform})`, 'blue');
    colorLog(`  🟢 Node.js: ${systemInfo.nodeVersion}`, 'blue');
    colorLog(
      `  💾 Memoria: ${Math.round(systemInfo.memory / 1024 / 1024 / 1024)} GB total, ${Math.round(systemInfo.freeMemory / 1024 / 1024 / 1024)} GB libre`,
      'blue'
    );
    colorLog(`  🔧 CPUs: ${systemInfo.cpus}`, 'blue');

    // Verificar archivos críticos
    await this.checkCriticalFiles();

    // Verificar configuración
    await this.checkConfiguration();

    // Verificar dependencias
    await this.checkDependencies();

    // Verificar estructura del proyecto
    await this.checkProjectStructure();

    // Generar recomendaciones
    this.generateRecommendations();

    // Mostrar resumen
    this.displaySummary();
  }

  /**
   * Verifica archivos críticos
   */
  async checkCriticalFiles() {
    colorLog('\n📁 Verificando archivos críticos...', 'yellow');

    const projectRoot = path.join(__dirname, '..');
    const criticalFiles = [
      'app.mjs',
      'package.json',
      'src/config/environment.mjs',
      'config.env',
      'config.env.example',
    ];

    for (const file of criticalFiles) {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        colorLog(`  ✅ ${file}`, 'green');
        this.results.checks.push(`Archivo ${file} encontrado`);
      } else {
        colorLog(`  ❌ ${file}`, 'red');
        this.results.errors.push(`Archivo ${file} no encontrado`);
      }
    }
  }

  /**
   * Verifica configuración
   */
  async checkConfiguration() {
    colorLog('\n🔧 Verificando configuración...', 'yellow');

    const projectRoot = path.join(__dirname, '..');
    const configPath = path.join(projectRoot, 'config.env');

    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const requiredVars = ['NODE_ENV', 'SESSION_SECRET', 'JWT_SECRET', 'BCRYPT_ROUNDS'];
        const missingVars = [];

        requiredVars.forEach((varName) => {
          if (!configContent.includes(`${varName}=`)) {
            missingVars.push(varName);
          }
        });

        if (missingVars.length > 0) {
          colorLog(`  ❌ Variables faltantes: ${missingVars.join(', ')}`, 'red');
          this.results.errors.push(`Variables faltantes: ${missingVars.join(', ')}`);
        } else {
          colorLog('  ✅ Configuración válida', 'green');
          this.results.checks.push('Configuración válida');
        }
      } catch (error) {
        colorLog(`  ❌ Error leyendo configuración: ${error.message}`, 'red');
        this.results.errors.push(`Error leyendo configuración: ${error.message}`);
      }
    } else {
      colorLog('  ❌ Archivo config.env no encontrado', 'red');
      this.results.errors.push('Archivo config.env no encontrado');
    }
  }

  /**
   * Verifica dependencias
   */
  async checkDependencies() {
    colorLog('\n📦 Verificando dependencias...', 'yellow');

    const projectRoot = path.join(__dirname, '..');
    const nodeModulesPath = path.join(projectRoot, 'node_modules');
    const packageJsonPath = path.join(projectRoot, 'package.json');

    if (!fs.existsSync(nodeModulesPath)) {
      colorLog('  ❌ node_modules no encontrado', 'red');
      this.results.errors.push('node_modules no encontrado');
      return;
    }

    if (!fs.existsSync(packageJsonPath)) {
      colorLog('  ❌ package.json no encontrado', 'red');
      this.results.errors.push('package.json no encontrado');
      return;
    }

    // Verificar dependencias críticas
    const criticalDeps = ['express', 'mocha', 'autocannon'];
    const missingDeps = [];

    for (const dep of criticalDeps) {
      const depPath = path.join(nodeModulesPath, dep);
      if (!fs.existsSync(depPath)) {
        missingDeps.push(dep);
      }
    }

    if (missingDeps.length > 0) {
      colorLog(`  ❌ Dependencias faltantes: ${missingDeps.join(', ')}`, 'red');
      this.results.errors.push(`Dependencias faltantes: ${missingDeps.join(', ')}`);
    } else {
      colorLog('  ✅ Dependencias críticas instaladas', 'green');
      this.results.checks.push('Dependencias críticas instaladas');
    }
  }

  /**
   * Verifica estructura del proyecto
   */
  async checkProjectStructure() {
    colorLog('\n📂 Verificando estructura del proyecto...', 'yellow');

    const projectRoot = path.join(__dirname, '..');
    const criticalDirs = ['src', 'test', 'public', 'logs'];

    for (const dir of criticalDirs) {
      const dirPath = path.join(projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        colorLog(`  ✅ ${dir}/`, 'green');
        this.results.checks.push(`Directorio ${dir} encontrado`);
      } else {
        colorLog(`  ⚠️  ${dir}/ no encontrado`, 'yellow');
        this.results.warnings.push(`Directorio ${dir} no encontrado`);
      }
    }
  }

  /**
   * Genera recomendaciones
   */
  generateRecommendations() {
    const recommendations = [];

    // Recomendaciones basadas en el sistema
    const systemInfo = this.getSystemInfo();
    const freeMemoryGB = Math.round(systemInfo.freeMemory / 1024 / 1024 / 1024);

    if (freeMemoryGB < 2) {
      recommendations.push({
        priority: 'high',
        message: 'Poca memoria libre disponible. Considera cerrar aplicaciones innecesarias.',
      });
    }

    if (systemInfo.cpus < 4) {
      recommendations.push({
        priority: 'medium',
        message: 'Pocos CPUs disponibles. Los tests de rendimiento pueden ser limitados.',
      });
    }

    // Recomendaciones generales
    recommendations.push({
      priority: 'low',
      message: 'Para tests completos de rendimiento, ejecuta el servidor y usa autocannon.',
    });

    this.results.recommendations = recommendations;
  }

  /**
   * Muestra resumen
   */
  displaySummary() {
    colorLog('\n📊 ======================================', 'cyan');
    colorLog('📋 RESUMEN DE VERIFICACIONES', 'bright');
    colorLog('📊 ======================================', 'cyan');

    colorLog(`\n✅ Verificaciones completadas: ${this.results.checks.length}`, 'green');
    this.results.checks.forEach((check) => {
      colorLog(`  ✅ ${check}`, 'green');
    });

    if (this.results.warnings.length > 0) {
      colorLog(`\n⚠️  Advertencias: ${this.results.warnings.length}`, 'yellow');
      this.results.warnings.forEach((warning) => {
        colorLog(`  ⚠️  ${warning}`, 'yellow');
      });
    }

    if (this.results.errors.length > 0) {
      colorLog(`\n❌ Errores: ${this.results.errors.length}`, 'red');
      this.results.errors.forEach((error) => {
        colorLog(`  ❌ ${error}`, 'red');
      });
    }

    if (this.results.recommendations.length > 0) {
      colorLog('\n💡 Recomendaciones:', 'blue');
      this.results.recommendations.forEach((rec) => {
        const color =
          rec.priority === 'high' ? 'yellow' : rec.priority === 'medium' ? 'blue' : 'cyan';
        colorLog(`  🔵 ${rec.message}`, color);
      });
    }

    // Estado final
    if (this.results.errors.length > 0) {
      colorLog('\n❌ Se encontraron errores que requieren atención.', 'red');
      process.exit(1);
    } else if (this.results.warnings.length > 0) {
      colorLog('\n⚠️  Verificaciones completadas con advertencias menores.', 'yellow');
    } else {
      colorLog('\n✅ ¡Todas las verificaciones pasaron exitosamente!', 'green');
    }

    colorLog('\n📊 ======================================\n', 'cyan');
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando Performance Test Simplificado...');
  const tester = new SimplePerformanceTester();
  await tester.runChecks();
}

// Ejecutar siempre
main().catch((error) => {
  console.error('❌ Error en script de rendimiento:', error);
  process.exit(1);
});

export default SimplePerformanceTester;
